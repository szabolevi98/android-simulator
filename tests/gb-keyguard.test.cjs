const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};vm.runInNewContext(fs.readFileSync('versions/2.3.6/gb-keyguard.js','utf8'),context);
const kg=context.window.GBKeyguard,t=key=>key,plain=v=>JSON.parse(JSON.stringify(v));
// DigitalClock: "h:mm" with AM/PM, or "kk:mm" (01-24, midnight is 24).
assert.deepEqual(plain(kg.time(new Date(2026,9,2,9,5),false)),{time:'9:05',ampm:'AM'});
assert.deepEqual(plain(kg.time(new Date(2026,9,2,13,40),false)),{time:'1:40',ampm:'PM'});
assert.deepEqual(plain(kg.time(new Date(2026,9,2,0,15),false)),{time:'12:15',ampm:'AM'});
assert.deepEqual(plain(kg.time(new Date(2026,9,2,9,5),true)),{time:'09:05',ampm:''});
assert.deepEqual(plain(kg.time(new Date(2026,9,2,0,15),true)),{time:'24:15',ampm:''});
assert.equal(kg.THRESHOLD,2/3);
// LockScreen right tab: sound on (gray target) or the yellow silent/vibrate dial with the "Sound on" hint.
assert.equal(kg.rightTab({t,silent:false}).icon,'gb-ic_jog_dial_sound_on.png');assert.equal(kg.rightTab({t,silent:false}).hint,'Sound off');
assert.equal(kg.rightTab({t,silent:true,vibrate:true}).icon,'gb-ic_jog_dial_vibrate_on.png');assert.equal(kg.rightTab({t,silent:true}).confirm,'yellow');
const html=kg.slideScreen({t,carrier:'Telekom',time:'9:05',ampm:'AM',date:'Friday, October 2',alarm:'Sat 7:00 AM',silent:false,toast:{text:'Sound is ON',color:'#e69310',icon:'x.png'}});
assert.match(html,/gbkg-tab-screen/);assert.match(html,/gbkg-ampm">AM/);assert.match(html,/Sat 7:00 AM/);assert.match(html,/data-gb-tab="left" aria-label="Unlock"/);assert.match(html,/color:#e69310/);
assert.doesNotMatch(kg.slideScreen({t,carrier:'T',time:'9:05',ampm:'',date:'d',alarm:'',silent:false}),/gbkg-ampm|gbkg-status|gbkg-toast/);
console.log('gb-keyguard ok');
