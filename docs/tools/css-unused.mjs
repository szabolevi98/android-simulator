// CSS rules and @keyframes nothing uses (audit point 13 C). A candidate list; --write removes them.
//   node docs/tools/css-unused.mjs [version …] [--write]   per version, the dead rules of each stylesheet its index.html loads
// A selector is dead when a class or id it requires (outside :is() / :where() / :not() / :has()) can come from nowhere
// in that version:
//   a. the name is not a whole token of index.html, a script it loads, or a page under assets/ the code fetches
//   b. no built name fits it: an identifier glued to ${…} or to a "+" concatenation counts as a prefix
//      (`gbmk-shot n${n}`, 'ic-' + id) or a suffix (`${kind}-row`), whatever its length
// A rule goes when all its selectors are dead (a list keeps its live ones), an @media block when nothing is left in it,
// and a comment with the rules under it when every rule of its paragraph goes. A @keyframes block goes when neither
// the remaining CSS nor a script names it. Check the result with before / after screenshots of every app.
import fs from 'node:fs';
const args = process.argv.slice(2), write = args.includes('--write');
const versions = args.filter(a => !a.startsWith('--')).length ? args.filter(a => !a.startsWith('--')) : fs.readdirSync('versions').filter(v => fs.existsSync(`versions/${v}/index.html`));
const read = f => fs.readFileSync(f, 'utf8');
const uniq = a => [...new Set(a)];

function deadRules(css, used) {
  let removed = [], trimmed = [];
  // :not() requires nothing, :is() / :where() only one of their alternatives (so they are left out, as is a :has() with
  // alternatives); a plain :has() needs what it names.
  const inner = '(?:[^()]|\\((?:[^()]|\\([^()]*\\))*\\))*';
  const needs = sel => [...sel.replace(new RegExp(`:not\\(${inner}\\)`, 'g'), '').replace(new RegExp(`:(?:is|where|matches|-webkit-any)\\(${inner}\\)`, 'g'), '')
    .replace(new RegExp(`:has\\(${inner}\\)`, 'g'), m => m.includes(',') ? '' : m).matchAll(/[.#]([A-Za-z_][\w-]*)/g)].map(m => m[1]);
  const block = start => {  // index of the matching }
    let d = 0;
    for (let j = start; j < css.length; j++) {
      if (css[j] === '/' && css[j + 1] === '*') { j = css.indexOf('*/', j + 2) + 1; continue; }
      if (css[j] === '"' || css[j] === "'") { const q = css[j]; j++; while (css[j] !== q) { if (css[j] === '\\') j++; j++; } continue; }
      if (css[j] === '{') d++; else if (css[j] === '}') { d--; if (!d) return j; }
    }
    return css.length - 1;
  };
  const walk = (from, to) => {
    let res = '', j = from, pending = null;
    const close = () => { if (pending?.any && pending.all) res = res.slice(0, pending.start).replace(/\n[ \t]*\n[ \t]*$/, '\n').replace(/[ \t]*$/, ''); pending = null; };
    const rule = gone => { if (pending) { pending.any = true; pending.all &&= gone; } };
    while (j < to) {
      const ws = css.slice(j, to).match(/^\s+/);
      if (ws) { if (/\n[ \t]*\n/.test(ws[0])) close(); res += ws[0]; j += ws[0].length; continue; }
      if (css.startsWith('/*', j)) { close(); pending = {start: res.length, any: false, all: true}; const e = css.indexOf('*/', j) + 2; res += css.slice(j, e); j = e; continue; }
      const open = css.indexOf('{', j);
      if (open < 0 || open >= to) { res += css.slice(j, to); break; }
      const prelude = css.slice(j, open), end = block(open), head = prelude.trim(), before = res.length;
      if (/^@(media|supports|container)/.test(head)) {
        const inner = walk(open + 1, end);
        if (inner.trim()) { res += prelude + '{' + inner + '}'; rule(false); } else { removed.push(head); rule(true); }
      } else if (head.startsWith('@')) {
        res += css.slice(j, end + 1); rule(false);
      } else {
        const sels = head.replace(/\/\*[\s\S]*?\*\//g, '').split(/,(?![^()]*\))/).map(s => s.trim()).filter(Boolean);
        const live = sels.filter(s => needs(s).every(used));
        rule(!live.length);
        if (!live.length) removed.push(head);
        else if (live.length === sels.length) res += css.slice(j, end + 1);
        else {
          trimmed.push(sels.filter(s => !live.includes(s)).join(', '));
          const sep = /,\s*\n/.test(head) ? ',\n' + (head.match(/,\s*\n([ \t]*)/)?.[1] ?? '') : /, /.test(head) ? ', ' : ',';
          res += live.join(sep) + prelude.match(/\s*$/)[0] + css.slice(open, end + 1);
        }
      }
      j = end + 1;
      // A removed rule that filled its own line(s) takes its line break with it.
      if (res.length === before && /(^|\n)[ \t]*$/.test(res)) { const nl = css.slice(j, to).match(/^[ \t]*\n/); if (nl) j += nl[0].length; }
    }
    close();
    return res;
  };
  const out = walk(0, css.length).replace(/^\n+/, '');
  return {out: removed.length || trimmed.length ? out : css, removed, trimmed};
}

const KF = /@(?:-webkit-)?keyframes\s+([\w-]+)\s*\{(?:[^{}]|\{[^{}]*\})*\}/g;
let total = 0;
for (const v of versions) {
  const dir = `versions/${v}`, page = read(`${dir}/index.html`);
  const local = s => s.startsWith('../') ? s.replace(/^(\.\.\/)+/, '') : `${dir}/${s}`;
  const scripts = [...page.matchAll(/src="([^"?]+\.js)/g)].map(m => local(m[1])).filter(f => fs.existsSync(f));
  const fetched = fs.existsSync(`${dir}/assets`) ? fs.readdirSync(`${dir}/assets`).filter(f => /\.html?$/.test(f)).map(f => `${dir}/assets/${f}`) : [];
  const code = [page, ...scripts.map(read), ...fetched.map(read)].join('\n');
  const tokens = new Set(code.match(/[A-Za-z_][\w-]*/g));
  const prefixes = uniq([...[...code.matchAll(/([A-Za-z_][\w-]*)\$\{/g)].map(m => m[1]), ...[...code.matchAll(/['"`]([A-Za-z_][\w-]*)['"`]\s*\+/g)].map(m => m[1])]);
  const suffixes = uniq([...[...code.matchAll(/\}([\w-]+)/g)].map(m => m[1]), ...[...code.matchAll(/\+\s*['"`]([\w-]+)['"`]/g)].map(m => m[1])]).filter(s => /^[-_]/.test(s) || s.length > 1);
  const used = name => tokens.has(name) || prefixes.some(p => name.startsWith(p)) || suffixes.some(s => name.endsWith(s));
  const sheets = [...page.matchAll(/href="([^"?]+\.css)/g)].map(m => local(m[1])).filter(f => f.startsWith(dir + '/') && fs.existsSync(f));
  const result = {};
  for (const f of sheets) {
    const raw = read(f);
    result[f] = {crlf: raw.includes('\r\n'), before: raw.replace(/\r\n/g, '\n'), ...deadRules(raw.replace(/\r\n/g, '\n'), used)};
  }
  // Keyframes against what is left of the rules.
  const left = Object.values(result).map(r => r.out).join('\n'), names = uniq([...left.matchAll(KF)].map(m => m[1])), bare = left.replace(KF, '');
  const named = n => new RegExp(`(^|[^\\w-])${n}([^\\w-]|$)`);
  const deadKf = names.filter(n => !named(n).test(bare) && !named(n).test(code));
  for (const [f, r] of Object.entries(result)) {
    r.keyframes = [...r.out.matchAll(KF)].map(m => m[1]).filter(n => deadKf.includes(n));
    if (r.keyframes.length) r.out = r.out.replace(new RegExp(`(^|\\n)?@(?:-webkit-)?keyframes\\s+(${r.keyframes.join('|')})\\s*\\{(?:[^{}]|\\{[^{}]*\\})*\\}(\\n)?`, 'g'), (m, lead, name, nl) => lead !== undefined && nl ? lead : (lead ?? '') + (nl && lead === undefined ? '' : nl ?? ''));
    const count = r.removed.length + r.trimmed.length + r.keyframes.length;
    total += count;
    if (!count) continue;
    console.log(`${f}: ${r.removed.length} rules, ${r.trimmed.length} selector lists, ${r.keyframes.length} keyframes`);
    for (const s of r.removed) console.log('  -', s.replace(/\s+/g, ' ').slice(0, 140));
    for (const s of r.trimmed) console.log('  ~', s.replace(/\s+/g, ' ').slice(0, 140));
    for (const s of r.keyframes) console.log('  @keyframes', s);
    if (write) fs.writeFileSync(f, r.crlf ? r.out.replace(/\n/g, '\r\n') : r.out);
  }
}
console.log(total ? `${total} unused ${write ? 'removed' : 'found'}` : 'No unused CSS rules or keyframes.');
