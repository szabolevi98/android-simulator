// Asset files nothing uses (audit point 12). A candidate list for review, not a deletion script.
//   node docs/tools/asset-unused.mjs [loaded.json]   prints, per version, the files of versions/<v>/assets nothing uses
// A file counts as used when any of these holds:
//   a. its name appears in the version's code or pages, or with its version path anywhere else in the repository
//   b. it fits a built-up path "assets/<prefix>${…}" whose literal prefix has 2+ characters
//   c. a bare "assets/${…}" is built and its stem is a quoted literal or an object key in the version's code
//   d. its stem, or the stem without one or two "xx-" prefixes, is quoted (or between - / ( .) near a picture path
//      (assets/, url( or an image extension within 120 characters: action and class names alike do not count)
//   e. a name fragment it starts with ('lw-smoke-noise' + i, `ic_empty_${f}`, 'ic_wifi_signal_') is built near a
//      picture path
//   f. it was requested while every app was opened (optional loaded.json: {version: [file, …]})
//   g. a test or generator names it (a test also by its stem)
//   h. "assets/${prefix}${icon}" is built and its stem without the prefix (and a _selected / _pressed … state) is quoted
// Still check each candidate by hand before deleting it.
import fs from 'node:fs'; import path from 'node:path';
const [loadedFile] = process.argv.slice(2);
const loaded = loadedFile ? JSON.parse(fs.readFileSync(loadedFile, 'utf8')) : {};
const walk = d => fs.readdirSync(d, {withFileTypes: true}).flatMap(e => e.name.startsWith('.') || ['_aosp', 'node_modules', 'assets'].includes(e.name) && d === '.' ? [] : e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name).replace(/\\/g, '/')]);
const textFiles = walk('.').filter(f => /\.(js|mjs|cjs|css|html|py|json|md|txt|tsv|res)$/.test(f) && !/^docs\/assets\/|^docs\/asset-(check|inventory)\.md$|^versions\/[^/]+\/assets\//.test(f));
const texts = Object.fromEntries(textFiles.map(f => [f, fs.readFileSync(f, 'utf8')]));
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const out = {};
for (const v of ['2.3.6', '4.0.4', '4.3', '4.4.4', '5.1.1']) {
  const own = Object.entries(texts).filter(([f]) => f.startsWith(`versions/${v}/`) && /\.(js|css|html)$/.test(f)).map(([, t]) => t).join('\n');
  const elsewhere = Object.entries(texts).filter(([f]) => !f.startsWith(`versions/${v}/`)).map(([, t]) => t).join('\n');
  const patterns = [...own.matchAll(/assets\/([A-Za-z0-9_.-]*)\$\{/g)].map(m => m[1]);
  const prefixes = [...new Set(patterns.filter(p => p.length >= 2))];
  const bare = patterns.some(p => p === '');
  // assets/${prefix}${icon}…: the icon names sit in a table elsewhere ('ic_drawer_radio'), a state suffix is appended
  const joined = /assets\/\$\{[^}]+\}\$\{/.test(own);
  // f. a quoted literal ending in _ or - that a name is built from ('ic_wifi_signal_' + level, 'assets/gb-' + id)
  //    also any literal joined with + ('lw-smoke-noise' + i) and any template text right before ${ (`ic_empty_${f}`)
  // only where a picture path is being built: assets/, url( or an image extension within 120 characters
  const nearAsset = m => /assets\/|url\(|\.(png|jpe?g|webp|svg)/.test(own.slice(Math.max(0, m.index - 120), m.index + m[0].length + 120));
  const heads = [...new Set([
    ...[...own.matchAll(/['"`]((?:assets\/)?[A-Za-z0-9_.\/-]{2,}[_-])['"`]/g)].filter(nearAsset).map(m => m[1]),
    ...[...own.matchAll(/['"]([A-Za-z0-9_.\/-]{3,})['"]\s*\+/g)].filter(nearAsset).map(m => m[1]),
    ...[...own.matchAll(/([A-Za-z0-9_.-]{3,})\$\{/g)].filter(nearAsset).map(m => m[1])
  ].map(h => h.replace(/^.*assets\//, '')))].filter(h => h.length >= 3);
  const files = fs.readdirSync(`versions/${v}/assets`);
  const unused = [];
  for (const f of files) {
    const stem = f.replace(/(\.9)?\.[a-z0-9]+$/i, '');
    const stems = [stem]; let t = stem; for (let i = 0; i < 2 && /^[a-z0-9]+-/.test(t); i++) stems.push(t = t.replace(/^[a-z0-9]+-/, ''));
    const used =
      own.includes(f) || new RegExp(`(^|[^A-Za-z0-9_-])${esc(f)}`).test(elsewhere) && elsewhere.includes(`${v}/assets/${f}`) || elsewhere.includes(`assets/${f}`) && false ||
      prefixes.some(p => f.startsWith(p)) ||
      bare && new RegExp(`['"\`]${esc(stem)}['"\`]|[{,\\s]${esc(stem)}\\s*:`).test(own) ||
      stems.some(s => [...own.matchAll(new RegExp(`['"\`(/-]${esc(s)}['"\`).]`, 'g'))].some(nearAsset)) ||
      (loaded[v] || []).includes(f) ||
      joined && stems.some(s => new RegExp(`['"\`]${esc(s.replace(/_(selected|pressed|activated|focused|disabled)$/, ''))}['"\`]`).test(own)) ||
      stems.some(s => heads.some(h => s.startsWith(h))) || heads.some(h => f.startsWith(h) || /^[_-]/.test(h) && h.length >= 5 && f.includes(h)) ||
      // a test or generator naming the file (e.g. an existence check) keeps it
      Object.entries(texts).some(([g, t]) => /^(tests|docs)\//.test(g) && !g.endsWith('.md') && (t.includes(f) || /^tests\//.test(g) && new RegExp(`['"\`/]${esc(stem)}['"\`.]`).test(t)));
    if (!used) unused.push(f);
  }
  out[v] = unused;
  console.log(v, files.length, 'files,', unused.length, 'unused');
}
for (const [v, files] of Object.entries(out)) for (const f of files) console.log(`  ${v} ${f}`);
