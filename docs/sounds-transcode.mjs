// Transcodes the factory images' ringtones, notifications and alarms (the plan written by docs/sounds.py) to WebM / Opus at
// 32 kbit/s in a headless Chrome: decodeAudioData, then MediaRecorder in real time, all files at once (~35 s). Needs the
// local server at http://localhost:8090 serving the repository (for _aosp/).
//   node docs/sounds-transcode.mjs <plan.json> assets/audio
import {spawn} from 'node:child_process'; import {mkdtempSync, writeFileSync, readFileSync, mkdirSync} from 'node:fs'; import {tmpdir} from 'node:os'; import {join} from 'node:path';
const [planFile, out] = process.argv.slice(2); const plan = JSON.parse(readFileSync(planFile, 'utf8')); mkdirSync(out, {recursive: true});
const wait = ms => new Promise(r => setTimeout(r, ms)); const port = 9600 + Math.floor(Math.random() * 300);
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'tc-'))}`, '--autoplay-policy=no-user-gesture-required', 'about:blank'], {stdio: 'ignore'});
let target; for (let i = 0; i < 60 && !target; i++) { try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t => t.type === 'page'); } catch { await wait(200); } }
const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pending = new Map(); ws.addEventListener('message', e => { const m = JSON.parse(e.data); pending.get(m.id)?.(m); pending.delete(m.id); });
const send = (method, params = {}) => new Promise(r => { const n = ++id; pending.set(n, r); ws.send(JSON.stringify({id: n, method, params})); });
await send('Page.navigate', {url: 'http://localhost:8090/favicon.svg'}); await wait(800);
const entries = Object.entries(plan.files);
const code = `(async (list) => {
  const ctx = new AudioContext({sampleRate: 48000}); await ctx.resume();
  const one = async ([name, path]) => {
    const buf = await ctx.decodeAudioData(await (await fetch('/' + path)).arrayBuffer());
    const dest = ctx.createMediaStreamDestination(); dest.channelCount = Math.min(2, buf.numberOfChannels);
    const src = ctx.createBufferSource(); src.buffer = buf; src.connect(dest);
    const rec = new MediaRecorder(dest.stream, {mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 32000}); const parts = [];
    rec.ondataavailable = e => parts.push(e.data);
    const done = new Promise(r => rec.onstop = r);
    rec.start(50); src.start(); await new Promise(r => src.onended = r); await new Promise(r => setTimeout(r, 400)); rec.requestData(); rec.stop(); await done;
    const bytes = new Uint8Array(await new Blob(parts).arrayBuffer()); let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return [name, btoa(s), buf.duration];
  };
  return Promise.all(list.map(one));
})(${JSON.stringify(entries)})`;
const r = await send('Runtime.evaluate', {expression: code, awaitPromise: true, returnByValue: true, timeout: 600000});
if (r.result?.exceptionDetails) { console.log('ERR', JSON.stringify(r.result.exceptionDetails).slice(0, 500)); process.exit(1); }
let total = 0, longest = 0;
for (const [name, b64, dur] of r.result.result.value) { if (b64.length < 400) console.log('EMPTY', name); const buf = Buffer.from(b64, 'base64'); writeFileSync(join(out, name + '.webm'), buf); total += buf.length; longest = Math.max(longest, dur); }
console.log(r.result.result.value.length, 'files', (total / 1e6).toFixed(2), 'MB, longest', longest.toFixed(1), 's');
chrome.kill(); process.exit(0);
