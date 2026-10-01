const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={window:{},crypto:require('node:crypto').webcrypto,TextEncoder};vm.createContext(ctx);vm.runInContext(fs.readFileSync('versions/4.0.4/lockscreen.js','utf8'),ctx);const lock=ctx.window.ICSLockscreen;
(async()=>{
  let path=[];lock.appendPattern(path,0);lock.appendPattern(path,2);lock.appendPattern(path,8);assert.deepEqual(path,[0,1,2,5,8]);lock.appendPattern(path,0);assert.deepEqual(path,[0,1,2,5,8]);
  path=[];lock.appendPattern(path,0);lock.appendPattern(path,8);assert.deepEqual(path,[0,4,8]);
  path=[];lock.appendPattern(path,0);lock.appendPattern(path,7);assert.deepEqual(path,[0,7]);
  assert.ok(lock.validate('pattern','012'));assert.ok(lock.validate('pattern','0122'));assert.equal(lock.validate('pattern','0125'),'');
  assert.ok(lock.validate('pin','123'));assert.ok(lock.validate('pin','12a4'));assert.equal(lock.validate('pin','0123'),'');
  assert.ok(lock.validate('password','1234'));assert.ok(lock.validate('password','a b4'));assert.equal(lock.validate('password','Demo404!'),'');
  for(const [kind,value] of [['pin','0123'],['pattern','01258'],['password','Demo404!']]){
    const record=await lock.credential(kind,value);assert.equal(record.digest.length,64);assert.ok(await lock.matches(record,value));assert.equal(await lock.matches(record,value+'x'),false);assert.equal(Object.hasOwn(record,'value'),false);assert.notEqual((await lock.credential(kind,value)).digest,record.digest);
    const data=JSON.parse(JSON.stringify({settings:{screenLock:kind},screenCredential:record}));lock.initialize(data);assert.ok(lock.secure(data));
    for(let i=0;i<4;i++)lock.failed(data,1000);assert.equal(lock.remaining(data,1000),0);lock.failed(data,1000);assert.equal(lock.remaining(data,1000),30);assert.equal(lock.remaining(data,16000),15);assert.equal(lock.remaining(data,31000),0);assert.equal(lock.remaining(JSON.parse(JSON.stringify(data)),2000),29);
  }
  const legacy={settings:{screenLock:'slide'}};lock.initialize(legacy);assert.equal(legacy.settings.screenLock,'slide');assert.equal(lock.secure(legacy),false);
  const broken={settings:{screenLock:'pin'},screenCredential:{kind:'pin',salt:'bad',digest:'bad'}};lock.initialize(broken);assert.equal(broken.settings.screenLock,'slide');
  console.log('Lockscreen checks passed: pattern gap insertion, validation, salted credential matching, reload persistence, timed retry limit and legacy state.');
})().catch(error=>{console.error(error);process.exitCode=1;});
