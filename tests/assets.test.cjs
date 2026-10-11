const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
// Audit point 11: every stylesheet url() and literal assets/… path the five versions load names a file that exists with
// that exact case (docs/asset-check.mjs; its runtime half needs a browser and runs on its own).
(async()=>{
  const {staticCheck}=await import(pathToFileURL(path.resolve('docs/asset-check.mjs')).href);
  for(const v of ['2.3.6','4.0.4','4.3','4.4.4','5.1.1']){
    const r=staticCheck(v);
    assert.ok(r.sheets>20&&r.scripts>40,`${v}: too few files read`);
    assert.deepEqual(r.missing.map(([from,ref])=>`${from}: ${ref}`),[],`${v}: missing assets`);
  }
  console.log('assets ok');
})().catch(e=>{console.error(e);process.exit(1);});
