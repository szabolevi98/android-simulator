const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// The ringing alarm per image: 4.0.4 the Holo AlarmAlert dialog, 4.3 / 4.4.4 the AlarmAlertFullScreen glow pad,
// 5.1.1 the Material AlarmActivity; the words come from each image's DeskClock (alarm-strings.js).
const load=v=>{const context={window:{AndroidI18n:{language:'hu'}},Intl,Date};for(const f of ['alarm-strings.js','desk-clock.js'])vm.runInNewContext(fs.readFileSync(`versions/${v}/${f}`,'utf8'),context);return context.window;};
const ui=label=>({overlay:'clock-ringing',ringingAlarm:{id:1,time:'06:05',label}});
const ctx={hour24:false,locale:'en-US',now:new Date(2026,9,7,6,5)};
for(const v of ['4.0.4','4.3','4.4.4','5.1.1']){
  const w=load(v),C=w.ICSDeskClock,S=w.AlarmStrings;
  for(const key of ['alarm_alert_snooze_text','alarm_alert_dismiss_text','default_label'])assert.ok(S[key]?.en&&S[key]?.hu,`${v} ${key}`);
  const html=C.overlay(ui(''),k=>k,ctx);
  assert.match(html,new RegExp(S.default_label.hu),`${v} default label`);
  assert.match(html,/data-action="alarm-snooze"/);assert.match(html,/data-action="alarm-dismiss"/);
  assert.ok(!C.overlay(ui('<img src=x>'),k=>k,ctx).includes('<img src=x>'),`${v} escapes the label`);
  const css=fs.readFileSync(`versions/${v}/desk-clock.css`,'utf8');
  for(const src of html.match(/assets\/[\w.-]+/g)||[])assert.ok(fs.existsSync(`versions/${v}/${src}`),`${v} ${src}`);
  for(const cls of new Set((html.match(/class="([^"]+)"/g)||[]).flatMap(c=>c.slice(7,-1).split(' ')).filter(c=>c.startsWith('dcal-'))))assert.ok(css.includes('.'+cls),`${v} .${cls} styled`);
  const index=fs.readFileSync(`versions/${v}/index.html`,'utf8');
  assert.ok(index.indexOf('alarm-strings.js')>0&&index.indexOf('alarm-strings.js')<index.indexOf('desk-clock.js'),`${v} loads alarm-strings.js first`);
  if(v==='4.0.4'){assert.match(html,/dcal-ics/);assert.match(html,/<b>6:05<\/b><small>AM<\/small>/);assert.equal(C.bindRinging,undefined);}
  if(v==='4.3'||v==='4.4.4'){assert.match(html,/dcal-glow/);assert.match(html,/dcal-handle/);assert.equal(typeof C.bindRinging,'function');assert.match(html,/ic_lockscreen_snooze_normal/);assert.match(html,/ic_lockscreen_wakeup_normal/);}
  if(v==='5.1.1'){assert.match(html,/dcal-lp/);assert.match(html,/--hour:#/);assert.match(html,/dcal-lp-icon/);assert.equal(typeof C.bindRinging,'function');}
  // AlarmAlertFullScreen / AlarmActivity snooze words: "Snoozing for 10 minutes." until KitKat names the time; Lollipop shows its own alert text instead of a toast.
  const msg=C.snoozeMessage(new Date(2026,9,7,6,15),ctx);
  if(v==='5.1.1')assert.equal(msg,'');else assert.ok(msg.length>3&&!msg.includes('%'),`${v} snooze toast: ${msg}`);
}
console.log('Ringing alarm checks passed: per-image layouts, strings, assets, styles and snooze words.');
