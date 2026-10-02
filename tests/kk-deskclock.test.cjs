const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// KitKat DeskClock: alarm tab first, alarm card time formats and the radial picker's angle mapping.
const context={window:{}};vm.runInNewContext(fs.readFileSync('versions/4.4.4/kk-deskclock.js','utf8')+fs.readFileSync('versions/4.4.4/jb-deskclock.js','utf8'),context);
const k=context.window.KKDeskClock,j=context.window.JBDeskClock;
assert.equal(JSON.stringify(j.TABS),'["alarm","clock","timer","stopwatch"]');
assert.equal(JSON.stringify(k.timeParts('07:05',false)),'{"text":"7:05","ampm":"AM"}');
assert.equal(k.timeParts('19:30',true).text,'19:30');
const size=244.62,R=size/2;
// 12-hour mode: 3 o'clock keeps the AM/PM half.
assert.equal(k.pick({hour:14,minute:0,mode:'hour'},R+100,R,size,false).hour,15);
assert.equal(k.pick({hour:2,minute:0,mode:'hour'},R+100,R,size,false).hour,3);
// 24-hour mode: 00 and 13-23 on the outer ring, 1-12 inside.
assert.equal(k.pick({hour:9,minute:0,mode:'hour'},R+100,R,size,true).hour,15);
assert.equal(k.pick({hour:9,minute:0,mode:'hour'},R+50,R,size,true).hour,3);
assert.equal(k.pick({hour:9,minute:0,mode:'hour'},R,R-100,size,true).hour,0);
assert.equal(k.pick({hour:9,minute:0,mode:'minute'},R,R+100,size,true).minute,30);
const page=k.page([{id:1,time:'07:00',enabled:true,days:[0,1,2,3,4,5,6]}],{expandedId:1,t:x=>x,locale:'en-US',hour24:true,normalize:a=>({label:'',vibrate:true,tone:'Cesium',...a})});
assert.ok(page.includes('kdc-days')&&page.includes('kdc-delete')&&page.includes('kdc-add'));
for(const f of ['kdc-ic_alarm','kdc-ic_alarm_normal','kdc-ic_add','kdc-ic_expand_down','kdc-ic_expand_up','kdc-ic_ringtone','kdc-btn_check_on_holo_dark_red','kdc-ic_globe'])assert.ok(fs.existsSync(`versions/4.4.4/assets/${f}.png`),f);
console.log('kk-deskclock ok');
