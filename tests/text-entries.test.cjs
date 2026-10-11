const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
// Audit point 10: every named text entry the five versions load ({res | own | src, hu, de, fr, es, en?}) has all four
// translations, and no translation brings a placeholder the English lacks (docs/text-entries.mjs).
(async()=>{
  const T=await import(pathToFileURL(path.resolve('docs/text-entries.mjs')).href);
  const all=T.files().flatMap(T.entries);
  assert.ok(all.length>9000,`only ${all.length} entries found`);
  assert.deepEqual(T.check(all),[]);
  // The checker itself: a missing language and a placeholder the English lacks are caught; %s ~ %1$s is not a problem.
  assert.deepEqual(T.check([{file:'x',line:1,key:'%1$s of %2$s',entry:{res:'a',hu:'%2$s / %1$s',de:'%1$s von %3$s',fr:'%s sur %s'}}]),['x:1 "%1$s of %2$s": no es','x:1 "%1$s of %2$s": de has %3s that the English lacks']);
  console.log('text-entries ok',all.length);
})().catch(e=>{console.error(e);process.exit(1);});
