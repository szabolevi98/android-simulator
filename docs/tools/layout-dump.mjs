// Layout dump: the box of every element of the simulated screen, for every app and a few seeded random taps inside it.
// Two dumps of the same version (before / after a CSS change that must not move anything) are compared element by
// element, so a sizing refactor is checked on numbers instead of screenshots.
//   node docs/tools/layout-dump.mjs <version> <out.json> [--clicks N] [--apps a,b] [--phone WxH]
//   node docs/tools/layout-dump.mjs --compare <before.json> <after.json> [--tolerance px] [--scale k] [--relative r]
// Boxes are the elements inside #screen, measured from its top left. With --phone the page runs at that phone size; pick one whose display
// has the desktop display's shape (2.3.6: 414x790 gives 414 x 690 = 1.5 x 276 x 460) and compare the desktop dump with
// the phone dump at --scale 1.5: every box of a screen drawn in dp is then the desktop box times 1.5, and what is not
// is a size the scripts or an image's own pixels still set.
// The page runs with a fixed clock (2026-10-14 10:09, advancing at 1/1000 speed), a seeded Math.random, reduced motion
// (no boot animation, no transitions) and a fresh profile, so two runs see the same screens. Needs the repository served
// at BASE (default http://localhost/android-simulator) and Chrome (CHROME).
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (name, fallback) => { const i = args.indexOf(name); return i < 0 ? fallback : args.splice(i, 2)[1]; };
const flag = name => { const i = args.indexOf(name); if (i < 0) return false; args.splice(i, 1); return true; };

if (flag('--compare')) {
  // --relative: a box may also be off by that share of its size (text lines round, and a long list adds them up).
  const tolerance = Number(opt('--tolerance', '0.5')), k = Number(opt('--scale', '1')), rel = Number(opt('--relative', '0'));
  const [a, b] = args.map(f => JSON.parse(fs.readFileSync(f, 'utf8')));
  let bad = 0, total = 0;
  for (const [name, before] of Object.entries(a)) {
    const after = b[name];
    total++;
    if (!after) { bad++; console.log(`${name}: missing in the second dump`); continue; }
    if (before.length !== after.length) { bad++; console.log(`${name}: ${before.length} elements before, ${after.length} after`); continue; }
    const diffs = [];
    before.forEach((e, i) => {
      const f = after[i];
      if (e[0] !== f[0]) { diffs.push(`#${i} ${e[0]} became ${f[0]}`); return; }
      const off = [1, 2, 3, 4, 5].filter(j => j < 5 || (e[5] && f[5])).some(j => Math.abs(e[j] * k - f[j]) > Math.max(tolerance, rel * Math.abs(e[j] * k)));
      if (off) diffs.push(`#${i} ${e[0]} [${e.slice(1).join(' ')}] -> [${f.slice(1).join(' ')}]`);
    });
    if (diffs.length) { bad++; console.log(`${name}: ${diffs.length} of ${before.length} elements differ`); diffs.slice(0, 6).forEach(d => console.log('   ' + d)); }
  }
  console.log(`${total - bad} of ${total} screens identical (tolerance ${tolerance}px)`);
  process.exit(bad ? 1 : 0);
}

const [version, out] = args;
const clicks = Number(opt('--clicks', '3')), only = opt('--apps', ''), phone = opt('--phone', '');
const BASE = process.env.BASE || 'http://localhost/android-simulator';
const CHROME = process.env.CHROME || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : 'google-chrome');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'layout-')), port = 9700 + Math.floor(Math.random() * 600);
const chrome = spawn(CHROME, ['--headless=new', '--no-sandbox', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`, 'about:blank'], {stdio: 'ignore'});
let ws;
for (let i = 0; i < 160 && !ws; i++) { try { const p = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page'); if (p) ws = new WebSocket(p.webSocketDebuggerUrl); } catch {} if (!ws) await sleep(250); }
await new Promise(r => ws.onopen = r);
let id = 0; const pending = {}, errors = [];
ws.onmessage = m => {
  const d = JSON.parse(m.data);
  if (d.method === 'Runtime.exceptionThrown') errors.push(d.params.exceptionDetails.exception?.description?.split('\n')[0] || d.params.exceptionDetails.text);
  if (pending[d.id]) { pending[d.id](d); delete pending[d.id]; }
};
const send = (method, params = {}) => new Promise(r => { pending[++id] = r; ws.send(JSON.stringify({id, method, params})); });
const ev = async expr => { const r = await send('Runtime.evaluate', {expression: expr, awaitPromise: true, returnByValue: true}); return r.result?.result?.value; };
const until = async (expr, ms = 15000) => { for (const end = Date.now() + ms; Date.now() < end; await sleep(150)) if (await ev(expr)) return true; return false; };

await send('Runtime.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', phone ? {width: +phone.split('x')[0], height: +phone.split('x')[1], deviceScaleFactor: 2, mobile: true} : {width: 1280, height: 900, deviceScaleFactor: 1, mobile: false});
await send('Emulation.setEmulatedMedia', {features: [{name: 'prefers-reduced-motion', value: 'reduce'}]});
await send('Page.addScriptToEvaluateOnNewDocument', {source: `(() => {
  const FIXED = Date.UTC(2026, 9, 14, 8, 9, 5), t0 = performance.now(), Real = Date;
  const now = () => FIXED + (performance.now() - t0) / 1000;
  globalThis.Date = class extends Real { constructor(...a) { a.length ? super(...a) : super(now()); } static now() { return Math.floor(now()); } };
  let s = 0x2f6b9a1; Math.random = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
})();`});

const DUMP = `(() => {
  const root = document.querySelector('#screen'), base = root.getBoundingClientRect(), r = v => Math.round(v * 10) / 10;
  return [...root.querySelectorAll('*')].filter(e => e.getClientRects().length).map(e => {
    const b = e.getBoundingClientRect(), cls = typeof e.className === 'string' ? e.className.trim().split(/\\s+/).slice(0, 2).join('.') : '';
    return [e.tagName.toLowerCase() + (cls ? '.' + cls : ''), r(b.left - base.left), r(b.top - base.top), r(b.width), r(b.height), e instanceof SVGElement ? 0 : r(parseFloat(getComputedStyle(e).fontSize))];
  });
})()`;
// The next tap: a seeded pick (r) among the visible action buttons inside the screen, skipping the keys and the ones that
// leave the app (home, back, power) or start something without a screen (calls, sounds).
const TAP = r => `(() => {
  const skip = /^(home|back|power|lock|drawer|open-app|menu-key|search-key|call|dial|end-call|play|ringtone-preview|vol)/;
  const all = [...document.querySelectorAll('#viewport [data-action], #overlay-root [data-action]')].filter(e => e.getClientRects().length && !skip.test(e.dataset.action) && !e.disabled);
  if (!all.length) return '';
  const el = all[Math.floor(${r} * all.length)];
  el.click();
  return el.dataset.action + (el.dataset.id ? ':' + el.dataset.id : '');
})()`;

async function fresh() {
  await send('Page.navigate', {url: `${BASE}/versions/${version}/`}); await sleep(200);
  await ev(`localStorage.clear(); localStorage.setItem('android-time-machine-language', 'en'); true`);
  await send('Page.navigate', {url: `${BASE}/versions/${version}/`});
  await until(`!!document.querySelector('#viewport .home-view, #viewport .lock-view')`, 25000);
  await sleep(400);
  if (await ev(`!!document.querySelector('#viewport .lock-view')`)) {
    await ev(`(()=>{const el=document.createElement('button');el.dataset.action='unlock';document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove();return true})()`);
    await until(`!!document.querySelector('#viewport .home-view')`, 5000);
  }
  await sleep(500);
}

const result = {};
await fresh();
result.home = await ev(DUMP);
const apps = only ? only.split(',') : await ev(`(async()=>{const el=document.createElement('button');el.dataset.action='drawer';document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove();await new Promise(r=>setTimeout(r,500));return [...new Set([...document.querySelectorAll('#viewport [data-app]')].map(e=>e.dataset.app))]})()`);
if (!only) { await sleep(300); result.drawer = await ev(DUMP); }
for (const app of apps) {
  // The taps' own seeded numbers (not the page's Math.random, which the apps use as time goes by).
  let seed = [...app].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261) >>> 0;
  const next = () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  await fresh();
  await ev(`(()=>{const el=document.createElement('button');el.dataset.action='open-app';el.dataset.app=${JSON.stringify(app)};document.querySelector('#viewport').firstElementChild.append(el);el.click();el.remove();return true})()`);
  await sleep(900);
  let name = app;
  result[name] = await ev(DUMP);
  for (let i = 0; i < clicks; i++) {
    const tapped = await ev(TAP(next()));
    if (!tapped) break;
    await sleep(700);
    name += ' > ' + tapped;
    result[name] = await ev(DUMP);
  }
  process.stdout.write('.');
}
fs.writeFileSync(out, JSON.stringify(result));
console.log(`\n${Object.keys(result).length} screens, ${Object.values(result).reduce((n, s) => n + (s?.length || 0), 0)} boxes -> ${out}`);
if (errors.length) console.log('exceptions:', [...new Set(errors)].slice(0, 5).join(' | '));
ws.close(); chrome.kill();
