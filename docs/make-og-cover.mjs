// Renders docs/og-cover.html into assets/og-cover.jpg (1200 x 630) with a local Chrome; no npm packages, no server.
//   node docs/make-og-cover.mjs            (set CHROME=/path/to/chrome if Chrome is not found)
// After a change, bump ?v= of og-cover.jpg in the og:image tags of index.html and versions/*/index.html.
import {spawn} from 'node:child_process';
import {existsSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = pathToFileURL(join(root, 'docs', 'og-cover.html')).href;
const output = join(root, 'assets', 'og-cover.jpg');
const candidates = [process.env.CHROME, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].filter(Boolean);
const chromePath = candidates.find(path => existsSync(path));
if (!chromePath) { console.error('Chrome not found; set CHROME to its path.'); process.exit(1); }

const wait = ms => new Promise(done => setTimeout(done, ms));
const profile = mkdtempSync(join(tmpdir(), 'og-cover-'));
const port = 9400 + Math.floor(Math.random() * 400);
const chrome = spawn(chromePath, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run', '--hide-scrollbars',
  '--allow-file-access-from-files', '--window-size=1200,630', 'about:blank'], {stdio: 'ignore'});
try {
  let target;
  for (let i = 0; i < 60 && !target; i++) { try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(item => item.type === 'page'); } catch { await wait(200); } }
  if (!target) throw new Error('Chrome did not start.');
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(done => socket.addEventListener('open', done));
  let id = 0; const pending = new Map();
  socket.addEventListener('message', event => { const message = JSON.parse(event.data); pending.get(message.id)?.(message); pending.delete(message.id); });
  const send = (method, params = {}) => new Promise(done => { const n = ++id; pending.set(n, done); socket.send(JSON.stringify({id: n, method, params})); });
  await send('Emulation.setDeviceMetricsOverride', {width: 1200, height: 630, deviceScaleFactor: 1, mobile: false});
  await send('Page.navigate', {url: source});
  // Wait until the fonts and every picture of the page have loaded.
  const ready = `(async () => { await document.fonts.ready; await Promise.all([...document.images].map(img => img.complete ? 0 : new Promise(r => { img.onload = img.onerror = r; })));
    await Promise.all([...document.querySelectorAll('.shot')].map(el => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = getComputedStyle(el).backgroundImage.slice(5, -2); }))); return document.images.length; })()`;
  await wait(500);
  const loaded = await send('Runtime.evaluate', {expression: ready, awaitPromise: true, returnByValue: true});
  await wait(300);
  const shot = await send('Page.captureScreenshot', {format: 'jpeg', quality: 88, clip: {x: 0, y: 0, width: 1200, height: 630, scale: 1}});
  writeFileSync(output, Buffer.from(shot.result.data, 'base64'));
  console.log(`assets/og-cover.jpg written (${loaded.result?.result?.value ?? '?'} pictures).`);
  socket.close();
} finally {
  chrome.kill(); await wait(400);
  try { rmSync(profile, {recursive: true, force: true}); } catch {}
}
