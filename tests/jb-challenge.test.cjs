const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};vm.runInNewContext(fs.readFileSync('versions/4.3/jb-keyguard.js','utf8'),context);
const kg=context.window.JBKeyguard,t=key=>key;
// SlidingChallengeLayout: alpha follows (offset - 1)^3 + 1, settling is capped at 600 ms.
assert.equal(kg.challengeAlpha(1),1);assert.equal(kg.challengeAlpha(0),0);assert.ok(Math.abs(kg.challengeAlpha(.5)-.875)<1e-9);
assert.equal(kg.settleDuration(300,300),200,'full travel without a fling takes (1 + 1) * 100 ms');
assert.equal(kg.settleDuration(150,300),150);
assert.equal(kg.settleDuration(300,300,3000),248,'4 x distance / velocity');assert.ok(kg.settleDuration(300,300,6000)<200,'a fast fling settles sooner');
assert.equal(kg.settleDuration(300,300,1),600,'slow flings are capped');
// showChallenge(velocity): flings decide the direction, otherwise the nearer end.
assert.equal(kg.settleShows(.2,-2000),true);assert.equal(kg.settleShows(.9,2000),false);
assert.equal(kg.settleShows(.6,10),true);assert.equal(kg.settleShows(.4,10),false);
// KeyguardMessageArea: owner info, then important messages for five seconds, lockout countdown first.
assert.equal(kg.securityMessage({owner:'Owner'},t),'Owner');
assert.equal(kg.securityMessage({owner:'Owner',error:'Wrong PIN',errorAt:1000,now:3000},t),'Wrong PIN');
assert.equal(kg.securityMessage({owner:'Owner',error:'Wrong PIN',errorAt:1000,now:6500},t),'Owner');
assert.equal(kg.securityMessage({owner:'Owner',error:'Wrong PIN',remaining:12},t),'Try again in 12 seconds.');
assert.deepEqual(JSON.parse(JSON.stringify(kg.WRONG)),{pattern:'Wrong Pattern',pin:'Wrong PIN',password:'Wrong Password'});
// KeyguardPINView: klondike letters, delete, enter, emergency button and carrier.
const api=kind=>({state:{kind,value:''},remaining:0,message:()=>'Owner',grid:()=>'<div class="credential-pattern"></div>',keyboard:()=>'<div class="credential-keyboard alpha"></div>'});
const pin=kg.securityView(api('pin'),{t,carrier:'Telekom & Co'});
for(const letters of ['ABC','DEF','GHI','JKL','MNO','PQRS','TUV','WXYZ'])assert.ok(pin.includes(`<small>${letters}</small>`),letters);
assert.equal((pin.match(/class="jbc-key"/g)||[]).length,10);
assert.ok(pin.includes('data-lock-key="delete"')&&pin.includes('data-lock-key="next"')&&pin.includes('data-lock-action="emergency"'));
assert.ok(pin.includes('Telekom &amp; Co')&&!pin.includes('&amp;amp;'),'carrier is escaped once');
const locked=kg.securityView({...api('pin'),remaining:20},{t,carrier:''});
assert.ok((locked.match(/disabled/g)||[]).length>=12,'lockout disables the pad');
assert.ok(kg.securityView(api('pattern'),{t,carrier:''}).includes('credential-pattern'));
const password=kg.securityView(api('password'),{t,carrier:''});
assert.ok(password.indexOf('jbc-message')>password.indexOf('jbc-fill')&&password.includes('jbc-strip'),'message sits between the spacers');
// Host markup: challenge state classes, inert hidden challenge, expand handle and IME slot.
const parts={t,clock:'9:41',date:'',ampm:'',alarm:'',owner:'',transport:'',widget:()=>'',security:'<i></i>'};
const list=kg.pages([]);
const up=kg.renderSecure(list,1,{...parts,up:true,bouncing:true,ime:'<b>ime</b>'});
assert.ok(up.includes('jbk-secure jbk-up jbk-bouncing jbk-with-ime')&&up.includes('data-kg-scrim')&&up.includes('data-kg-expand')&&up.includes('<div class="jbk-ime"><b>ime</b></div>'));
const down=kg.renderSecure(list,1,{...parts,up:false,bouncing:false,ime:''});
assert.ok(down.includes('data-kg-security inert aria-hidden="true"')&&!down.includes('jbk-ime'));
assert.ok(!kg.render(list,1,{...parts,owner:'Mine',carrier:''}).includes('jbk-owner')&&kg.render(list,1,{...parts,owner:'Mine',carrier:''}).includes('jbk-selector-message">Mine'),'owner info lives in the message area');
// The 4.3 lock controller keeps its checks but takes the JB wording and the 2 s pattern clear.
const ctx={window:{},crypto:require('node:crypto').webcrypto,TextEncoder,setTimeout,clearTimeout};vm.createContext(ctx);vm.runInContext(fs.readFileSync('versions/4.3/lockscreen.js','utf8'),ctx);
const lock=ctx.window.ICSLockscreen;
(async()=>{
  const data={settings:{screenLock:'pin'},screenCredential:await lock.credential('pin','1234'),lockAttempts:{count:0,until:0}},ui={view:'lock'};
  let rendered='',seen=null;
  const controls=lock.controller({getData:()=>data,getUI:()=>ui,t,save(){},render(){rendered=controls.renderLock();},unlock(){ui.unlocked=true;},clock:()=>'',date:()=>'',carrier:()=>'',toast(){},
    look:{wrong:kind=>kg.WRONG[kind],clearMs:2000,message:({state,remaining})=>kg.securityMessage({error:state.error,errorAt:state.errorAt,remaining},t),renderLock:api=>{seen=api;return `<p>${api.message()}</p>`;}}});
  controls.lock();
  const screen={listeners:{},addEventListener(type,fn){(this.listeners[type]||=[]).push(fn);}};
  const press=key=>screen.listeners.click.forEach(fn=>fn({target:{closest:()=>({dataset:{lockKey:key},hasAttribute:name=>name==='data-lock-key',disabled:false})},preventDefault(){},stopImmediatePropagation(){},detail:1}));
  ctx.document={querySelector:()=>null,addEventListener(){}};ctx.window.addEventListener=()=>{};
  controls.bind(screen);
  for(const key of '9999')press(key);press('next');await new Promise(resolve=>setTimeout(resolve,50));
  assert.equal(rendered,'<p>Wrong PIN</p>');assert.ok(seen.state.errorAt>0&&data.lockAttempts.count===1);
  for(const key of '1234')press(key);press('next');await new Promise(resolve=>setTimeout(resolve,50));
  assert.equal(ui.unlocked,true);assert.equal(data.lockAttempts.count,0);
  console.log('JB challenge checks passed: slide alpha and settle timing, message area, PIN/pattern/password views, host markup and controller skin.');
})().catch(error=>{console.error(error);process.exit(1);});
