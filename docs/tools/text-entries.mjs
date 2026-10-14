// Every named text entry in the simulator ({res | own | src, hu, de, fr, es, en?}, as strings.js reads them), found
// in the scripts the five versions load and in i18n.js: their languages and their placeholders (audit point 10).
//     node docs/tools/text-entries.mjs            prints the entries that lack a language or whose placeholders differ
// tests/text-entries.test.cjs runs the same checks.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '../..');
const LANGS = ['hu', 'de', 'fr', 'es'];

// The balanced literal that starts at s[i] ('{').
function literal(s, i) {
  let d = 0, q = null;
  for (let j = i; j < s.length; j++) {
    const c = s[j];
    if (q) { if (c === '\\') j++; else if (c === q) q = null; continue; }
    if (c === "'" || c === '"' || c === '`') q = c;
    else if (c === '{' || c === '[') d++;
    else if (c === '}' || c === ']') { d--; if (!d) return s.slice(i, j + 1); }
  }
  return null;
}
// Entries: object literals that open with res / own / src, with the key before them when there is one.
export function entries(file) {
  const s = fs.readFileSync(path.join(ROOT, file), 'utf8'), out = [];
  // Keys are short one-line strings; bounding them keeps a long text (a licence agreement) from being rescanned
  // from every quote in it.
  const re = /(?:(['"])((?:\\.|(?!\1)[^\n]){0,300})\1\s*:\s*)?\{\s*["']?(?:res|own|src)["']?\s*:/g;
  let m;
  while ((m = re.exec(s))) {
    const at = s.indexOf('{', m.index + (m[0].length - m[0].replace(/^[^{]*/, '').length));
    const text = literal(s, at);
    if (!text || text.includes('${')) continue;
    let entry;
    try { entry = Function(`return (${text})`)(); } catch { continue; }
    const key = m[2] !== undefined ? Function(`return ${m[1]}${m[2]}${m[1]}`)() : null;
    out.push({file, line: s.slice(0, at).split('\n').length, key, entry});
  }
  return out;
}
export function files() {
  const list = new Set(['i18n.js']);
  for (const v of fs.readdirSync(path.join(ROOT, 'versions')).filter(v => /^\d/.test(v)))
    for (const m of fs.readFileSync(path.join(ROOT, 'versions', v, 'index.html'), 'utf8').matchAll(/<script[^>]*src="([^"?]+)/g)) {
      const f = path.posix.normalize(`versions/${v}/${m[1]}`);
      if (fs.existsSync(path.join(ROOT, f))) list.add(f);
    }
  return [...list];
}
// Android's placeholders in a text: %1$s, %s, %d, %.1f … (not %%), and the Market's ^1.
export const placeholders = text => (String(text).replace(/%%/g, '').match(/%(?:\d+\$)?[-#+0,]*\d*(?:\.\d+)?[sdfS]|\^\d/g) || []).map(p => p.replace(/^%(?:(\d+)\$)?.*?([sdfS])$/, (_, n, t) => `%${n || ''}${t === 'S' ? 's' : t}`));
// A translation may use the positional form of a sequential placeholder (%s ~ %1$s) and may leave out a count it
// spells out (Android's "1 album" for quantity one), but must not bring placeholders the English lacks.
export function check(list) {
  const problems = [];
  for (const {file, line, key, entry} of list) {
    const where = `${file}:${line} ${JSON.stringify(key)}`;
    if (entry.en && typeof entry.en === 'object') continue; // plural forms per language
    for (const lang of LANGS) if (typeof entry[lang] !== 'string') problems.push(`${where}: no ${lang}`);
    const en = entry.en ?? key;
    if (typeof en !== 'string') continue;
    const norm = list => new Set(list.map((p, i) => p.replace(/^%([sdf])$/, `%${i + 1}$1`)));
    const base = norm(placeholders(en));
    for (const lang of LANGS) {
      if (typeof entry[lang] !== 'string') continue;
      const extra = [...norm(placeholders(entry[lang]))].filter(p => !base.has(p) && !(/^%\d+[sdf]$/.test(p) && [...base].some(b => b.slice(-1) !== p.slice(-1) && b.slice(0, -1) === p.slice(0, -1))));
      if (extra.length) problems.push(`${where}: ${lang} has ${extra.join(' ')} that the English lacks`);
    }
  }
  return problems;
}
if (process.argv[1] && path.resolve(process.argv[1]) === path.join(ROOT, 'docs', 'tools', 'text-entries.mjs')) {
  const all = files().flatMap(entries);
  const problems = check(all);
  console.log(all.length, 'entries in', files().length, 'scripts;', problems.length, 'problems');
  for (const p of problems) console.log('  ' + p);
}
