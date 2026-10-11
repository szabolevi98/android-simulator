// Audit point 10: an inventory of the simulator's text tables. For every version it runs i18n.js and the files that
// write into the shared AndroidI18n table in the page's own load order (index.html), records which file wrote each key
// and lists the keys that a later file overwrote with a different translation. It also sorts every script's string
// tables by format and counts the local language pickers, placeholder replacements and plural choices.
// Usage: node docs/text-survey.mjs [--md docs/text-survey.md]
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const VERSIONS = ['2.3.6', '4.0.4', '4.3', '4.4.4', '5.1.1'];
const LANGS = ['hu', 'de', 'fr', 'es'];
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

function scripts(version) {
  return [...read(`versions/${version}/index.html`).matchAll(/<script[^>]*src="([^"?]+)/g)].map(m => path.posix.normalize(`versions/${version}/${m[1]}`));
}

// The shared table as the page builds it: i18n.js first, then every script that calls AndroidI18n.extend, in order.
function sharedTable(version) {
  const store = {};
  const context = {window: {}, localStorage: {getItem: () => 'en', setItem() {}}, navigator: {language: 'en'}, document: {documentElement: {}}, console};
  context.window.localStorage = context.localStorage;
  vm.createContext(context);
  vm.runInContext(read('i18n.js'), context, {filename: 'i18n.js'});
  const api = context.window.AndroidI18n, base = api.extend;
  const writes = {}, collisions = [];
  // Read the built-in rows back through t(): every key i18n.js knows answers in each language.
  const builtin = [...read('i18n.js').matchAll(/^\s*('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")\s*:\s*\{own: true,/gm)].map(m => vm.runInNewContext(m[1]));
  const row = key => Object.fromEntries(LANGS.map(l => { api.setLanguage(l); const v = api.t(key); return [l, v]; }));
  for (const key of new Set(builtin)) writes[key] = {source: 'i18n.js', row: row(key)};
  api.setLanguage('en');
  let current = '';
  api.extend = (extra, source) => {
    const entries = Array.isArray(extra) ? extra.map(([en, hu, de, fr, es]) => [en, {hu, de, fr, es}]) : Object.entries(extra);
    for (const [key, entry] of entries) {
      const next = {hu: entry.hu, de: entry.de, fr: entry.fr, es: entry.es}, prev = writes[key];
      if (prev && LANGS.some(l => (prev.row[l] ?? key) !== (next[l] ?? key))) collisions.push({key, from: prev.source, to: current, before: prev.row, after: next});
      writes[key] = {source: current, row: next};
    }
    base(extra, source);
  };
  const files = scripts(version).filter(f => f !== 'i18n.js' && fs.existsSync(path.join(ROOT, f)) && /AndroidI18n\??\.extend\(/.test(read(f)));
  for (const f of files) {
    current = path.basename(f);
    // Only the extend() calls are needed; a file that does more is run with a forgiving stub around it.
    const src = read(f);
    try { vm.runInContext(src, context, {filename: f}); } catch {
      for (const m of src.matchAll(/AndroidI18n\??\.extend\(([[{][^]*?[\]}])(?:,\s*'([^']*)')?\);/g)) api.extend(vm.runInContext(`(${m[1]})`, context), m[2]);
    }
  }
  return {files: files.map(f => path.basename(f)), keys: Object.keys(writes).length, collisions, writes, conflicts: api.conflicts || []};
}

// String table formats, by what a file contains.
const FORMATS = [
  // The shared form (strings.js): an entry names its source (res, own or src) and its languages.
  ['named entries {res | own | src, hu, de, fr, es, en?}', s => /\{\s*["']?(?:res|src)["']?\s*:\s*["'][^"']+["']\s*,|\{\s*["']?own["']?\s*:\s*true\s*,/.test(s)],
  ['language objects keyed by resource name {en, hu, de, fr, es} (GB tables, alarm / lock / music strings)', s => /["']?en["']?\s*:\s*["'][^"']*["']\s*,\s*["']?hu["']?\s*:/.test(s)],
  // Positional rows: what is left of the older shapes.
  ['positional rows [en, hu, de, fr, es] (AndroidI18n.extend)', s => /AndroidI18n\??\.extend\(\[/.test(s)],
  ['positional rows key: [hu, de, fr, es, (en?)]', s => /^\s*["']?[^"'\n]+["']?\s*:\s*\[\s*["'][^"']*["']\s*,\s*["'][^"']*["']\s*,\s*["'][^"']*["']\s*,\s*["'][^"']*["']\s*(?:,\s*["'][^"']*["']\s*)?\]/m.test(s)],
];
const HELPERS = /(?:function|const|let)\s+(S|T|tr|text|str|L|txt|loc|word|label)\s*(?:=\s*(?:\([^)]*\)|[a-z]+)\s*=>|\()/g;
const PLACEHOLDER = /\.replace\(\s*(?:'%(?:1\$)?[sd]'|"%(?:1\$)?[sd]"|\/%[^/]*\/[gi]*)/g;
const PLURAL = /\b(?:one|few|many|other)\s*:|\[['"](?:one|other)['"]\]|\.(?:one|other)\b|PluralRules/g;

function survey() {
  const files = {};
  for (const v of VERSIONS) for (const f of scripts(v)) if (fs.existsSync(path.join(ROOT, f))) (files[f] ||= []).push(v);
  const byFormat = Object.fromEntries(FORMATS.map(([name]) => [name, []]));
  const helpers = [], placeholders = [], plurals = [];
  for (const f of Object.keys(files).sort()) {
    const s = read(f);
    for (const [name, test] of FORMATS) if (test(s)) byFormat[name].push(f);
    const h = [...s.matchAll(HELPERS)].map(m => m[1]);
    if (h.length) helpers.push([f, [...new Set(h)]]);
    const p = (s.match(PLACEHOLDER) || []).length, q = (s.match(PLURAL) || []).length;
    if (p) placeholders.push([f, p]);
    if (q) plurals.push([f, q]);
  }
  // Which generator wrote a script (its header names it), and which scripts carry hand-written five-language rows.
  const generators = {}, handWritten = [];
  for (const f of Object.keys(files).sort()) {
    const s = read(f), head = s.slice(0, 1500);
    const gen = head.match(/Generated by (docs\/[\w.-]+)/)?.[1] || (/__STRINGS__|const STRINGS = \{\s*"[^"]*":\s*\[/.test(s) && 'docs/apk-strings.py');
    if (gen) (generators[gen] ||= []).push(f);
    // Rows without a named source (res / own / src; a table keyed by resource name carries en instead), or still positional.
    // A positional array counts as a row of translations when two of its items carry Hungarian, German, French or Spanish
    // letters (a list of ids or English labels does not).
    const accented = row => (row.match(/['"][^'"]*[áéíóöőúüűäßçñàèùâêîôûÁÉÖÜŐŰÄÇÑ][^'"]*['"]/g) || []).length >= 2;
    const own = (s.match(/\{(?![^{}]*\b(?:res|own|src|en)\b)[^{}]*\bhu["']?\s*:\s*['"][^'"]+['"]\s*,\s*["']?de["']?\s*:/g) || []).length + (s.match(/\[\s*['"][^'"]*['"]\s*,\s*['"][^'"]*['"]\s*,\s*['"][^'"]*['"]\s*,\s*['"][^'"]*['"]\s*(?:,\s*['"][^'"]*['"]\s*)?\]/g) || []).filter(accented).length;
    if (own) handWritten.push([f, own]);
  }
  return {byFormat, helpers, placeholders, plurals, generators, handWritten};
}

// Run directly, it writes the report; imported (tests, comparisons), it only lends sharedTable and scripts.
if (process.argv[1] && path.resolve(process.argv[1]) === path.join(ROOT, 'docs', 'text-survey.mjs')) {
  const tables = Object.fromEntries(VERSIONS.map(v => [v, sharedTable(v)]));
  const inventory = survey();
  const out = [];
  out.push('# Text tables — survey', '', 'Generated by `docs/text-survey.mjs` (audit point 10). Do not edit; run `node docs/text-survey.mjs --md docs/text-survey.md`.', '');
  out.push('## The shared table (AndroidI18n) per version', '', '| Version | Files that extend it, in load order | Keys | Rows of i18n.js replaced | Keys written by two later files |', '| --- | --- | ---: | ---: | ---: |');
  for (const v of VERSIONS) out.push(`| ${v} | ${tables[v].files.join(', ') || '—'} | ${tables[v].keys} | ${tables[v].collisions.filter(x => x.from === 'i18n.js').length} | ${tables[v].collisions.filter(x => x.from !== 'i18n.js').length} |`);
  out.push('', "A later file replacing a hand-written i18n.js row is the intended order: the image's own wording wins. Two later files writing one key are the conflicts listed below.");
  for (const v of VERSIONS) {
    const c = tables[v].collisions.filter(x => x.from !== 'i18n.js');
    if (!c.length) continue;
    out.push('', `### ${v}: overwritten keys`, '', '| Key | First | Then | hu before → after |', '| --- | --- | --- | --- |');
    for (const x of c) out.push(`| ${x.key.replace(/\|/g, '\\|')} | ${x.from} | ${x.to} | ${(x.before.hu ?? '').replace(/\|/g, '\\|')} → ${(x.after.hu ?? '').replace(/\|/g, '\\|')} |`);
  }
  out.push('', '## String table formats', '');
  for (const [name, list] of Object.entries(inventory.byFormat)) out.push(`- **${name}** (${list.length}): ${list.map(f => '`' + f.replace(/^versions\//, '') + '`').join(', ') || '—'}`);
  out.push('', '## Generators and their output', '');
  for (const [gen, list] of Object.entries(inventory.generators).sort()) out.push(`- \`${gen}\`: ${list.map(f => '`' + f.replace(/^versions\//, '') + '`').join(', ')}`);
  out.push('', '## Hand-written five-language rows', '', 'Rows that name no source (res / own / src) or are still positional, per script:', '');
  out.push(inventory.handWritten.map(([f, n]) => '`' + f.replace(/^versions\//, '') + '` (' + n + ')').join(', '));
  out.push('', '## Local language pickers', '', `${inventory.helpers.length} scripts define their own text helper (S, T, tr, text …):`, '');
  out.push(inventory.helpers.map(([f, h]) => '`' + f.replace(/^versions\//, '') + '` (' + h.join(', ') + ')').join(', '));
  out.push('', '## Placeholders and plurals', '', `Local \`%s\` / \`%1$s\` / \`%d\` replacements: ${inventory.placeholders.reduce((a, [, n]) => a + n, 0)} in ${inventory.placeholders.length} scripts. Plural choices (one / other …): ${inventory.plurals.reduce((a, [, n]) => a + n, 0)} in ${inventory.plurals.length} scripts.`, '');
  out.push('| Script | Replacements | Plural choices |', '| --- | ---: | ---: |');
  const all = new Set([...inventory.placeholders.map(([f]) => f), ...inventory.plurals.map(([f]) => f)]);
  for (const f of [...all].sort()) out.push(`| ${f.replace(/^versions\//, '')} | ${inventory.placeholders.find(([g]) => g === f)?.[1] || 0} | ${inventory.plurals.find(([g]) => g === f)?.[1] || 0} |`);
  const md = out.join('\n') + '\n';
  const at = process.argv.indexOf('--md');
  if (at > 0) fs.writeFileSync(path.join(ROOT, process.argv[at + 1]), md); else process.stdout.write(md);
}
export {sharedTable, scripts};
