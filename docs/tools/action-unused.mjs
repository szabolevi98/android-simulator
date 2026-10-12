// switch branches nothing can reach (audit closing step). A candidate list for review, not a deletion script.
//   node docs/tools/action-unused.mjs [version …]   per version, the case 'x': labels whose string the version never produces
// A label counts as reachable when its string occurs anywhere in the version's index.html, the scripts it loads or a
// page under assets/ outside case labels (a data-action="x", data-form="x", an assignment, a list, a comparison …), or
// when a built name fits it: an identifier glued to ${…} or to a "+" concatenation counts as a prefix or a suffix
// (`kdc-${kind}`, 'ldu-' + id). Browser values (event.key names and the like) are not names the code has to produce.
// A branch reached only from code that is itself dead is not found: remove one round, then run it again. Check every
// candidate by hand and with the browser flows before deleting it.
import fs from 'node:fs';
const args = process.argv.slice(2);
const versions = args.length ? args : fs.readdirSync('versions').filter(v => fs.existsSync(`versions/${v}/index.html`));
const read = f => fs.readFileSync(f, 'utf8');
const uniq = a => [...new Set(a)];
// Values the browser hands to a switch (KeyboardEvent.key, input types, pointer types, visibility states).
const BROWSER = new Set(['Enter', 'Escape', 'Backspace', 'Delete', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End',
  'PageUp', 'PageDown', ' ', 'mouse', 'touch', 'pen', 'hidden', 'visible', 'checkbox', 'radio', 'range', 'text', 'number', 'search']);
let total = 0;
for (const v of versions) {
  const dir = `versions/${v}`, page = read(`${dir}/index.html`);
  const local = s => s.startsWith('../') ? s.replace(/^(\.\.\/)+/, '') : `${dir}/${s}`;
  const scripts = [...page.matchAll(/src="([^"?]+\.js)/g)].map(m => local(m[1])).filter(f => fs.existsSync(f));
  const fetched = fs.existsSync(`${dir}/assets`) ? fs.readdirSync(`${dir}/assets`).filter(f => /\.html?$/.test(f)).map(f => `${dir}/assets/${f}`) : [];
  const files = [[`${dir}/index.html`, page], ...scripts.map(f => [f, read(f)]), ...fetched.map(f => [f, read(f)])];
  // Every string occurrence outside case labels.
  const CASE = /case\s+(['"])((?:(?!\1)[^\\\n]|\\.)*)\1\s*:/g;
  const rest = files.map(([, src]) => src.replace(CASE, ' ')).join('\n');
  const all = files.map(([, src]) => src).join('\n');
  const prefixes = uniq([...[...all.matchAll(/([A-Za-z_][\w-]*)\$\{/g)].map(m => m[1]), ...[...all.matchAll(/['"`]([A-Za-z_][\w-]*)['"`]\s*\+/g)].map(m => m[1])]).filter(p => p.length > 1);
  const suffixes = uniq([...[...all.matchAll(/\}([\w-]+)/g)].map(m => m[1]), ...[...all.matchAll(/\+\s*['"`]([\w-]+)['"`]/g)].map(m => m[1])]).filter(s => s.length > 1);
  const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const produced = name => BROWSER.has(name) || new RegExp(`(^|[^\\w-])${escape(name)}([^\\w-]|$)`).test(rest)
    || prefixes.some(p => name.startsWith(p) && name !== p) || suffixes.some(s => name.endsWith(s) && name !== s);
  const found = [];
  for (const [f, src] of files) {
    for (const m of src.matchAll(CASE)) {
      const name = m[2];
      if (!name || produced(name)) continue;
      found.push(`${f}:${src.slice(0, m.index).split('\n').length} case '${name}'`);
    }
  }
  total += found.length;
  if (found.length) console.log(`${v}: ${found.length}\n  ${found.join('\n  ')}`);
}
console.log(total ? `${total} unreachable case labels found` : 'No unreachable case labels.');
