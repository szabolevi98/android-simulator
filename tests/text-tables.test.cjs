require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
// Audit point 10: the shared AndroidI18n table as each version's page builds it (i18n.js, then every extension in the
// load order of index.html). A key may replace a hand-written i18n.js row (the image's wording wins), but no two
// extensions may write one key with different texts: two resources with one English text need a context.
(async()=>{
  const {sharedTable}=await import(pathToFileURL(path.resolve('docs/text-survey.mjs')).href);
  for(const v of ['2.3.6','4.0.4','4.3','4.4.4','5.1.1']){
    const table=sharedTable(v);
    assert.deepEqual(table.collisions.filter(c=>c.from!=='i18n.js').map(c=>`${c.key}: ${c.from} → ${c.to}`),[],`${v}: keys written twice`);
    assert.deepEqual(JSON.parse(JSON.stringify(table.conflicts)),[],`${v}: AndroidI18n.conflicts`);
    // image-strings.js is built from docs/image-strings-<v>.res alone: every listed row, with its resource, nothing else.
    const res=fs.readFileSync(`docs/image-strings-${v}.res`,'utf8').split('\n').filter(l=>l.trim()&&!l.startsWith('#')).map(l=>l.split('\t'));
    let got;require('node:vm').runInNewContext(fs.readFileSync(`versions/${v}/image-strings.js`,'utf8'),{window:{AndroidI18n:{extend:t=>{got=t;}}}});
    assert.deepEqual(Object.entries(got).map(([k,e])=>[k,e.res]),res,`${v}: image-strings.js follows its .res list`);
    for(const [k,e] of Object.entries(got))for(const l of ['hu','de','fr','es'])assert.equal(typeof e[l],'string',`${v} ${k} ${l}`);
  }
  // 5.1.1: the battery's "Good" (Settings battery_info_health_good) and the Wi-Fi signal's (the wifi_signal array) stay apart.
  const lp=sharedTable('5.1.1').writes;
  assert.equal(lp['Good'].row.hu,'Rendben van');assert.equal(lp['Wi-Fi|Good'].row.hu,'Jó');assert.equal(lp['Wi-Fi|Fair'].row.de,'Gut');
  // Lollipop's dashboard category titles (TextAppearance.CategoryTitle) keep the resource's case.
  assert.equal(lp['Wireless & networks'].row.hu,'Vezeték nélküli és egyéb hálózatok');
  // The launcher labels that modules used to write by hand now come from the image with their resource.
  assert.equal(sharedTable('4.4.4').writes['Play Newsstand'].row.fr,'Play Kiosque');
  assert.equal(sharedTable('2.3.6').writes['Voice'].row.hu,'Voice');
  // One reader: no module picks a language column of its own any more, and the shared rows are named (own: true).
  const sources=[...fs.readdirSync('versions').filter(v=>/^\d/.test(v)).flatMap(v=>fs.readdirSync(`versions/${v}`).filter(f=>f.endsWith('.js')).map(f=>`versions/${v}/${f}`)),...fs.readdirSync('docs').filter(f=>/\.template\.js$/.test(f)).map(f=>`docs/${f}`)];
  const picker=/\[\s*(?:'en',\s*)?'hu',\s*'de',\s*'fr',\s*'es'\s*\]\.indexOf|(?<!AndroidStrings\.)\bLANGS\.indexOf/;
  assert.deepEqual(sources.filter(f=>picker.test(fs.readFileSync(f,'utf8'))),[],'local language pickers');
  assert.doesNotMatch(fs.readFileSync('i18n.js','utf8'),/^\s*\['[^']*',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'[^']*'\],?$/m,'i18n.js rows are named');
  console.log('text-tables ok');
})().catch(e=>{console.error(e);process.exit(1);});
