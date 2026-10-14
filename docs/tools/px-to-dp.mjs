// px → dp: rewrites the simulated screen's CSS lengths as calc(N * var(--dp)), the unit Android 2.1 is built on, so a
// version scales with the screen it is drawn on (1 dp = the frame's scale on a desktop, 100vw / the device's dp width on a
// phone). Only the screen's rules change: a rule whose selectors match the page around the phone (header, intro, frame,
// the touch keys) keeps its px. Which side a selector is on is asked from the page itself in headless Chrome: it is the
// page's when it matches an element outside #screen (with the fullscreen / lit-keys states switched on too) and nothing
// inside; a selector that matches nothing is drawn later by the screen's scripts. @media conditions, url() and strings
// keep their px.
//   node docs/tools/px-to-dp.mjs <version> --scale <px per dp> [--write]
// N is px / scale with 4 decimals (whole when exact), so the desktop layout does not move: check it with
// docs/tools/layout-dump.mjs before and after. Prints the rules it left alone and the ones that need a person.
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
const write = args.includes('--write');
const scale = Number(args[args.indexOf('--scale') + 1]);
const version = args.find(a => /^\d/.test(a) && a !== String(scale));
if (!version || !scale) { console.error('usage: px-to-dp.mjs <version> --scale <px per dp> [--write]'); process.exit(2); }
const dir = `versions/${version}`;
const files = [...fs.readFileSync(`${dir}/index.html`, 'utf8').matchAll(/<link rel="stylesheet" href="([^"?]+)/g)].map(m => m[1]).filter(f => fs.existsSync(`${dir}/${f}`));

// --- a small CSS walker: rules with their selector, at-rules with their prelude, comments and strings kept verbatim.
function parse(css) {
  const out = [];  // {type: 'rule'|'at'|'text', ...} in source order, ranges into css
  const skip = (j) => {  // past a comment or string starting at j, else j
    if (css.startsWith('/*', j)) return css.indexOf('*/', j + 2) + 2;
    if (css[j] === '"' || css[j] === "'") { const q = css[j]; j++; while (css[j] !== q) { if (css[j] === '\\') j++; j++; } return j + 1; }
    return j;
  };
  const close = (start) => {  // index of the } matching the { at start
    let d = 0;
    for (let j = start; j < css.length;) {
      const k = skip(j); if (k !== j) { j = k; continue; }
      if (css[j] === '{') d++; else if (css[j] === '}') { d--; if (!d) return j; }
      j++;
    }
    throw new Error('unbalanced braces');
  };
  const walk = (from, to, inKeyframes) => {
    const items = [];
    let j = from;
    while (j < to) {
      const k = skip(j); if (k !== j) { j = k; continue; }
      if (/\s|;/.test(css[j])) { j++; continue; }
      // a prelude runs to the next { or ; at this level
      let p = j;
      while (p < to && css[p] !== '{' && css[p] !== ';') { const q = skip(p); p = q !== p ? q : p + 1; }
      if (p >= to || css[p] === ';') { j = p + 1; continue; }
      const prelude = css.slice(j, p).replace(/\/\*[\s\S]*?\*\//g, '').trim(), end = close(p);
      if (prelude.startsWith('@')) {
        const name = prelude.match(/^@([\w-]+)/)[1];
        if (/^(media|supports|container|layer)$/.test(name)) items.push({type: 'group', prelude, children: walk(p + 1, end, false)});
        else if (/keyframes$/.test(name)) items.push({type: 'keyframes', prelude, children: walk(p + 1, end, true)});
        else items.push({type: 'other', prelude});
      } else items.push({type: 'rule', selector: prelude, body: [p + 1, end], keyframe: inKeyframes});
      j = end + 1;
    }
    return items;
  };
  return walk(0, css.length, false);
}
const flat = items => items.flatMap(i => i.children ? flat(i.children) : [i]);
const splitList = sel => { const parts = []; let d = 0, s = 0; for (let i = 0; i < sel.length; i++) { if ('(['.includes(sel[i])) d++; else if (')]'.includes(sel[i])) d--; else if (sel[i] === ',' && !d) { parts.push(sel.slice(s, i).trim()); s = i + 1; } } parts.push(sel.slice(s).trim()); return parts; };

const PX = /(^|[^\w.#-])(-?)(\d+\.?\d*|\.\d+)px(?![\w-])/g;
// Whole when exact; otherwise 4 decimals rounded away from zero, so N * scale never falls under the px value: Chrome
// floors border widths to whole pixels, and 2px written as 1.99996px draws 1px.
const fmt = n => { const r = Math.round(n); if (Math.abs(n - r) < 1e-6) return String(r); const v = Math.sign(n) * Math.ceil(Math.abs(n) * 1e4 - 1e-6) / 1e4; return v.toFixed(4).replace(/0+$/, '').replace(/^(-?)0\./, '$1.'); };
let worst = 0;
function convert(body) {  // px outside url() / strings / comments → calc(N * var(--dp))
  return body.replace(/\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|url\([^)]*\)|[^"'/u]+|./g, chunk => {
    if (/^(\/\*|"|'|url\()/.test(chunk)) return chunk;
    return chunk.replace(PX, (m, pre, sign, num) => {
      const px = Number(sign + num); if (!px) return m;
      const dp = fmt(px / scale); worst = Math.max(worst, Math.abs(Number(dp) * scale - px));
      return `${pre}calc(${dp} * var(--dp))`;
    });
  });
}

// --- the page decides which selectors belong to the screen
const sources = Object.fromEntries(files.map(f => [f, fs.readFileSync(`${dir}/${f}`, 'utf8')]));
const parsed = Object.fromEntries(files.map(f => [f, flat(parse(sources[f]))]));
const selectors = [...new Set(Object.values(parsed).flat().filter(r => r.type === 'rule' && !r.keyframe).flatMap(r => splitList(r.selector)))];
const BASE = process.env.BASE || 'http://localhost/android-simulator';
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const port = 9300 + Math.floor(Math.random() * 300), prof = fs.mkdtempSync(path.join(os.tmpdir(), 'pxdp-'));
const chrome = spawn(CHROME, ['--headless=new', '--no-sandbox', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, 'about:blank'], {stdio: 'ignore'});
let ws; for (let i = 0; i < 160 && !ws; i++) { try { const p = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page'); if (p) ws = new WebSocket(p.webSocketDebuggerUrl); } catch {} if (!ws) await sleep(250); }
await new Promise(r => ws.onopen = r);
let id = 0; const pending = {};
ws.onmessage = m => { const d = JSON.parse(m.data); if (pending[d.id]) { pending[d.id](d); delete pending[d.id]; } };
const send = (method, params = {}) => new Promise(r => { pending[++id] = r; ws.send(JSON.stringify({id, method, params})); });
const ev = async expr => (await send('Runtime.evaluate', {expression: expr, awaitPromise: true, returnByValue: true})).result?.result?.value;
await send('Emulation.setEmulatedMedia', {features: [{name: 'prefers-reduced-motion', value: 'reduce'}]});
await send('Page.navigate', {url: `${BASE}/versions/${version}/`});
for (let i = 0; i < 100 && !(await ev(`!!document.querySelector('#viewport .home-view, #viewport .lock-view')`)); i++) await sleep(200);
const side = await ev(`((sels) => {
  const strip = s => s.replace(/::?(before|after|placeholder|selection|marker|backdrop|first-line|first-letter|-webkit-[\\w-]+|-moz-[\\w-]+)(\\([^)]*\\))?/g, '').replace(/:(hover|active|focus|focus-visible|focus-within|visited|link)\\b/g, '').trim() || '*';
  const look = () => Object.fromEntries(sels.map(s => { let all; try { all = [...document.querySelectorAll(strip(s))]; } catch { return [s, 'invalid']; }
    const inside = all.some(e => e.closest('#screen')), outside = all.some(e => !e.closest('#screen'));
    return [s, outside && inside ? 'both' : outside ? 'page' : 'screen']; }));
  const a = look();
  document.documentElement.classList.add('is-fullscreen', 'header-peek'); document.querySelector('#nav-bar')?.classList.add('lit');
  const b = look();
  return Object.fromEntries(sels.map(s => [s, a[s] === 'page' || b[s] === 'page' ? (a[s] === 'both' || b[s] === 'both' ? 'both' : 'page') : a[s] === 'both' || b[s] === 'both' ? 'both' : a[s] === 'invalid' ? 'invalid' : 'screen']));
})(${JSON.stringify(selectors)})`);
ws.close(); chrome.kill();

// --- rewrite
const review = [], kept = [];
let changed = 0, values = 0;
for (const f of files) {
  const css = sources[f];
  const edits = [];
  for (const r of parsed[f]) {
    if (r.type !== 'rule') continue;
    const body = css.slice(...r.body);
    if (!PX.test(body)) { PX.lastIndex = 0; continue; }
    PX.lastIndex = 0;
    const sides = r.keyframe ? ['screen'] : splitList(r.selector).map(s => side[s]);
    const where = sides.every(s => s === 'page') ? 'page' : sides.every(s => s === 'screen') ? 'screen' : 'mixed';
    if (where === 'page') { kept.push(`${f}: ${r.selector.slice(0, 90)}`); continue; }
    if (where === 'mixed') { review.push(`${f}: ${r.selector.slice(0, 120)}  [${sides.join(',')}]`); continue; }
    const next = convert(body);
    values += (body.match(PX) || []).filter(m => !/(^|[^\d.])0px$/.test(m.trim())).length;
    edits.push([r.body[0], r.body[1], next]);
  }
  if (!edits.length) continue;
  let res = css;
  for (const [s, e, text] of edits.sort((a, b) => b[0] - a[0])) res = res.slice(0, s) + text + res.slice(e);
  changed++;
  if (write) fs.writeFileSync(`${dir}/${f}`, res);
}
console.log(`${version}: ${values} px values in ${changed} of ${files.length} stylesheets → dp (1 dp = ${scale}px; largest rounding ${worst.toFixed(5)}px)${write ? '' : ' [dry run]'}`);
console.log(`\nkept as page px (${kept.length}):`); kept.forEach(k => console.log('  ' + k));
console.log(`\nneeds a person (${review.length}):`); review.forEach(k => console.log('  ' + k));
