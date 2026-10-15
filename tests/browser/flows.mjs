// Browser flows for the six versions (audit point 13 B): the page in headless Chrome, as a visitor uses it.
//   start (boot, then the lock screen or the home screen) → unlock → open Settings → Back → hold the power key for the
//   power menu → Back closes it → switch the language → reload: the language and the save survive, the save reads clean
//   → the save made old (no revision markers, no clings) upgrades without a problem on two reloads
// On every page: no JavaScript exception and no failed local request. One version also runs at phone width (375 × 812).
// Needs a server for the repository root (BASE, default http://localhost:8090) and Chrome (CHROME, default the Windows
// path; google-chrome on Linux). A failing step leaves a screenshot in tests/browser/artifacts/.
//     node tests/browser/flows.mjs [version...]
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..', '..');
const BASE = process.env.BASE || 'http://localhost:8090';
const CHROME = process.env.CHROME || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : 'google-chrome');
const ARTIFACTS = path.join(ROOT, 'tests', 'browser', 'artifacts');
const picked = process.argv.slice(2).filter(a => /^\d/.test(a));
const VERSIONS = picked.length ? picked : ['2.1', '2.3.6', '4.0.4', '4.3', '4.4.4', '5.1.1'];
const sleep = ms => new Promise(r => setTimeout(r, ms));

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'flows-')), port = 9100 + Math.floor(Math.random() * 600);
const chrome = spawn(CHROME, ['--headless=new', '--no-sandbox', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, 'about:blank'], {stdio: 'ignore'});
let ws;
for (let i = 0; i < 160 && !ws; i++) { try { const p = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page'); if (p) ws = new WebSocket(p.webSocketDebuggerUrl); } catch {} if (!ws) await sleep(250); }
if (!ws) { console.error('Chrome did not start'); process.exit(2); }
await new Promise(r => ws.onopen = r);
let id = 0; const pending = {}, errors = [], failed = [], urls = {};
ws.onmessage = m => {
  const d = JSON.parse(m.data);
  if (d.method === 'Runtime.exceptionThrown') errors.push(d.params.exceptionDetails.exception?.description?.split('\n')[0] || d.params.exceptionDetails.text);
  if (d.method === 'Network.requestWillBeSent') urls[d.params.requestId] = d.params.request.url;
  if (d.method === 'Network.responseReceived' && d.params.response.status >= 400 && d.params.response.url.startsWith(BASE)) failed.push(`${d.params.response.status} ${d.params.response.url.slice(BASE.length)}`);
  if (d.method === 'Network.loadingFailed' && !d.params.canceled && (urls[d.params.requestId] || '').startsWith(BASE)) failed.push(`${d.params.errorText} ${urls[d.params.requestId].slice(BASE.length)}`);
  if (pending[d.id]) { pending[d.id](d); delete pending[d.id]; }
};
const send = (method, params = {}) => new Promise(r => { pending[++id] = r; ws.send(JSON.stringify({id, method, params})); });
const ev = async expr => { const r = await send('Runtime.evaluate', {expression: expr, awaitPromise: true, returnByValue: true}); return r.result?.result?.value; };
await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled', {cacheDisabled: true});

const view = () => ev(`[...document.querySelector('#viewport')?.children || []].map(c => c.className).join(' ')`);
const until = async (expr, ms = 15000) => { for (const end = Date.now() + ms; Date.now() < end; await sleep(200)) if (await ev(expr)) return true; return false; };
const act = action => ev(`(()=>{const el=document.createElement('button');el.dataset.action=${JSON.stringify(action)};const host=document.querySelector('#viewport').firstElementChild||document.querySelector('#viewport');host.append(el);el.click();el.remove();return true})()`);
const openApp = app => ev(`(()=>{const el=document.createElement('button');el.dataset.action='open-app';el.dataset.app=${JSON.stringify(app)};const host=document.querySelector('#viewport').firstElementChild;host.append(el);el.click();el.remove();return true})()`);
// The Settings switch each image's own screen sends (Gingerbread's CheckBoxPreference rows: gbset-check).
const toggle = (setting, action = 'toggle-setting') => ev(`(()=>{const el=document.createElement('button');el.dataset.action=${JSON.stringify(action)};el.dataset.id=${JSON.stringify(setting)};const host=document.querySelector('#viewport').firstElementChild;host.append(el);el.click();el.remove();return true})()`);
const SAVE_KEY = `Object.keys(localStorage).find(k=>/^android-time-machine-\\w+-v1$/.test(k))`;
const SAVE = `(()=>{const k=${SAVE_KEY};return k&&JSON.parse(localStorage.getItem(k))})()`;
const key = k => ev(`(document.activeElement || document.body).dispatchEvent(new KeyboardEvent('keydown',{key:${JSON.stringify(k)},bubbles:true}))`);
const dialogs = () => ev(`document.querySelectorAll('[role=dialog],[role=alertdialog]').length`);

// Android 2.1 is built from its own image with its own modules (ec-*.js): its screens are EC.context's views.
const EC21 = {home: `EC.context?.ui.view === 'home' && !!document.querySelector('#viewport .eclh')`, lock: `EC.context?.ui.view === 'lock'`};
async function load(version) {
  await send('Page.navigate', {url: `${BASE}/versions/${version}/`});
  if (version === '2.1') return until(`(${EC21.home}) || (${EC21.lock})`, 25000);
  return until(`!!document.querySelector('#viewport .home-view, #viewport .lock-view')`, 25000);
}
// 2.1: Settings › Wireless & networks › the Bluetooth check box, as a visitor touches them.
const bluetooth21 = () => ev(`(()=>{const c=EC.context;c.ui.settingsStack=['settings','wireless_settings'];c.render();const row=[...document.querySelectorAll('#viewport .ecpf-row')].find(r=>r.querySelector('.ecpf-title')?.textContent==='Bluetooth');row?.click();return !!row})()`);
async function flow21(mobile) {
  const steps = [], check = (name, ok, detail = '') => { steps.push({name, ok, detail}); if (!ok) throw new Error(`${name}${detail ? ': ' + detail : ''}`); };
  const view = () => ev(`EC.context?.ui.view + '/' + (EC.context?.ui.overlay || '')`);
  check('boots to the lock or home screen', await load('2.1'), await view());
  if (await ev(EC21.lock)) { await ev(`EC.context.unlock()`); check('unlocks', await until(EC21.home), await view()); }
  await ev(`EC.context.open('settings')`);
  check('opens Settings', await until(`EC.context.ui.view === 'settings' && !!document.querySelector('#viewport .ecwin')`), await view());
  check('touches Bluetooth', await bluetooth21());
  const bluetooth = await ev(`${SAVE}?.settings?.bluetooth`);
  check('a changed setting is saved', typeof bluetooth === 'boolean', String(bluetooth));
  if (mobile) { check('fits the phone width', await ev(`document.documentElement.scrollWidth <= innerWidth + 1`)); return steps; }
  await key('Escape'); await sleep(200); await key('Escape');
  check('Back leaves Settings', await until(`EC.context.ui.view !== 'settings'`), await view());
  const MENU = `!!document.querySelector('#overlay-root [role=dialog]')`;
  await ev(`(async()=>{const k=document.querySelector('#power-button');k.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));await new Promise(r=>setTimeout(r,1500));k.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));})()`);
  check('holding power opens the power menu', await until(MENU, 4000));
  await key('Escape');
  check('Back closes the menu', await until(`!(${MENU})`, 4000));
  await ev(`(()=>{const s=document.querySelector('#language-select');s.value='hu';s.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  check('switches to Hungarian', await until(`document.documentElement.lang === 'hu'`, 4000));
  await load('2.1');
  check('the language survives a reload', await until(`document.documentElement.lang === 'hu' && AndroidI18n.language === 'hu'`, 6000));
  check('the save reads clean', await ev(`AndroidState.problems.length === 0`), JSON.stringify(await ev(`AndroidState.problems`)));
  check('the reloaded save carries the change', await ev(`EC.context.data.settings.bluetooth`) === bluetooth);
  // An older save: without the home screen's revision and the newer apps' fields; the upgrades fill them in.
  check('there is a save', await ev(`(()=>{const k=${SAVE_KEY};if(!k)return false;const d=JSON.parse(localStorage.getItem(k));delete d.home?.revision;delete d.maps;delete d.accountSync;delete d.youtube;localStorage.setItem(k,JSON.stringify(d));return true;})()`));
  for (const pass of ['first', 'second']) {
    check(`an old save upgrades cleanly (${pass} load)`, await load('2.1') && await ev(`AndroidState.problems.length === 0`), JSON.stringify(await ev(`AndroidState.problems`)));
  }
  return steps;
}
async function flow(version, mobile) {
  const steps = [], check = (name, ok, detail = '') => { steps.push({name, ok, detail}); if (!ok) throw new Error(`${name}${detail ? ': ' + detail : ''}`); };
  errors.length = 0; failed.length = 0;
  await send('Emulation.setDeviceMetricsOverride', mobile ? {width: 375, height: 812, deviceScaleFactor: 2, mobile: true} : {width: 1280, height: 900, deviceScaleFactor: 1, mobile: false});
  await send('Page.navigate', {url: `${BASE}/versions/${version}/`}); await sleep(300);
  await ev(`localStorage.clear(); localStorage.setItem('android-time-machine-language', 'en')`);
  if (version === '2.1') { steps.push(...await flow21(mobile)); return mobile ? steps : finish(steps, check); }
  check('boots to the lock or home screen', await load(version), await view());
  if (/lock-view/.test(await view())) { await act('unlock'); check('unlocks', await until(`!!document.querySelector('#viewport .home-view')`), await view()); }
  await openApp('settings');
  check('opens Settings', await until(`!!document.querySelector('#viewport .app-view')`), await view());
  await toggle('bluetooth', version === '2.3.6' ? 'gbset-check' : 'toggle-setting');
  const bluetooth = await ev(`${SAVE}?.settings?.bluetooth`);
  check('a changed setting is saved', typeof bluetooth === 'boolean', String(bluetooth));
  if (mobile) { check('fits the phone width', await ev(`document.documentElement.scrollWidth <= innerWidth + 1`)); return steps; }
  await key('Escape');
  check('Back leaves Settings', await until(`!document.querySelector('#viewport .app-view')`), await view());
  // The power menu itself (GlobalActions: .ga-dialog, on 2.3 a .gbdlg list); the launcher's first-run tips are dialogs too.
  const MENU = `document.querySelector('#overlay-root .ga-dialog, .ga-dialog, .gbdlg')`;
  await ev(`(async()=>{const k=document.querySelector('#power-button');k.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));await new Promise(r=>setTimeout(r,1500));k.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));})()`);
  check('holding power opens the power menu', await until(`!!${MENU}`, 4000));
  await key('Escape');
  check('Back closes the menu', await until(`!${MENU}`, 4000), String(await dialogs()));
  await ev(`(()=>{const s=document.querySelector('#language-select');s.value='hu';s.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  check('switches to Hungarian', await until(`document.documentElement.lang === 'hu'`, 4000));
  await load(version);
  check('the language survives a reload', await until(`document.documentElement.lang === 'hu' && AndroidI18n.language === 'hu'`, 6000));
  check('the save reads clean', await ev(`AndroidState.problems.length === 0`), JSON.stringify(await ev(`AndroidState.problems`)));
  await toggle('bluetooth', version === '2.3.6' ? 'gbset-check' : 'toggle-setting');
  check('the reloaded save carries the change', await ev(`${SAVE}?.settings?.bluetooth`) === !bluetooth);
  // The same save as an old one (no revision markers, no clings): every upgrade step runs, twice over two reloads.
  check('there is a save', await ev(`(()=>{const k=${SAVE_KEY};if(!k)return false;const d=JSON.parse(localStorage.getItem(k));delete d.layoutRevision;delete d.wallpaperRevision;delete d.clings;localStorage.setItem(k,JSON.stringify(d));return true;})()`));
  for (const pass of ['first', 'second']) {
    check(`an old save upgrades cleanly (${pass} load)`, await load(version) && await ev(`AndroidState.problems.length === 0`), JSON.stringify(await ev(`AndroidState.problems`)));
  }
  return finish(steps, check);
}
async function finish(steps, check) {
  await sleep(500);
  check('no exception', errors.length === 0, errors.join(' | '));
  // PHP's built-in server sometimes refuses a connection under the burst of requests; a file it serves on a second try
  // is not missing.
  for (const f of [...failed]) {
    const m = f.match(/^net::ERR_CONNECTION_\w+ (\S+)$/);
    if (m && (await fetch(BASE + m[1]).catch(() => null))?.ok) failed.splice(failed.indexOf(f), 1);
  }
  check('no failed local request', failed.length === 0, failed.join(' | '));
  return steps;
}

let failures = 0;
for (const [version, mobile] of [...VERSIONS.map(v => [v, false]), ...(picked.length ? [] : [['5.1.1', true], ['2.3.6', true], ['2.1', true]])]) {
  const name = `${version}${mobile ? ' (phone width)' : ''}`;
  try { const steps = await flow(version, mobile); console.log(`ok   ${name}: ${steps.map(s => s.name).join(', ')}`); }
  catch (error) {
    failures++; console.log(`FAIL ${name}: ${error.message}`);
    fs.mkdirSync(ARTIFACTS, {recursive: true});
    const shot = await send('Page.captureScreenshot', {format: 'png'});
    if (shot.result?.data) fs.writeFileSync(path.join(ARTIFACTS, `${version}${mobile ? '-phone' : ''}.png`), Buffer.from(shot.result.data, 'base64'));
  }
}
ws.close(); chrome.kill();
process.exit(failures ? 1 : 0);
