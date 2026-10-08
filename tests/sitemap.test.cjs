const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Search engines (audit step 8): sitemap.xml lists the landing page and every available version at the og:url of its
// page, with a lastmod date; robots.txt allows everything and names the sitemap. Regenerate with docs/make-sitemap.mjs.
const site='https://android.levente.net/',box={window:{}};
vm.runInNewContext(fs.readFileSync('versions/catalog.js','utf8'),box);
const versions=box.window.ANDROID_VERSIONS.filter(v=>v.status==='available');
const xml=fs.readFileSync('sitemap.xml','utf8');
assert.match(xml,/^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/);
const urls=[...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>\s*<\/url>/g)].map(m=>m[1]);
assert.equal((xml.match(/<url>/g)||[]).length,urls.length,'every <url> has a loc and a lastmod');
assert.deepEqual(urls,[site,...versions.map(v=>site+v.url)]);
const og=f=>fs.readFileSync(f,'utf8').match(/<meta property="og:url" content="([^"]+)">/)[1];
assert.equal(og('index.html'),site);
for(const v of versions)assert.equal(og(`${v.url}index.html`),site+v.url);
const robots=fs.readFileSync('robots.txt','utf8');
assert.match(robots,/^User-agent: \*$/m);
assert.match(robots,/^Allow: \/$/m);
assert.doesNotMatch(robots,/^Disallow: *\S/m);
assert.match(robots,new RegExp(`^Sitemap: ${site}sitemap.xml$`,'m'));
console.log('sitemap: ok');
