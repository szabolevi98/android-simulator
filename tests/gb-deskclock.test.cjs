const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},Intl,Date};
for(const f of ['desk-clock.js','gb-strings-deskclock.js','gb-deskclock.js'])vm.runInNewContext(fs.readFileSync(`versions/2.3.6/${f}`,'utf8'),context);
const G=context.window.GBDeskClock,N=context.window.ICSDeskClock,now=new Date(2026,9,2,14,13);
const ctx=(o={})=>({lang:'en',locale:'en-US',t:k=>k,hour24:false,now,sub:'',alarms:[N.normalize({id:1,time:'07:00',enabled:true}),N.normalize({id:2,time:'08:30',enabled:false,days:[0,2],label:'Gym'})],ok:'OK',cancel:'Cancel',...o});
// Alarms.formatTime and DaysOfWeek.
assert.deepEqual({...G.clock(14,5,ctx())},{time:'2:05',ampm:'PM'});assert.deepEqual({...G.clock(7,0,ctx({hour24:true}))},{time:'7:00',ampm:''});
assert.equal(G.daysText([0,2],ctx()),'Mon, Wed');assert.equal(G.daysText([0,1,2,3,4,5,6],ctx()),'every day');assert.equal(G.daysText([],ctx()),'');assert.equal(G.daysText([],ctx(),true),'Never');
// Alarms.formatToast picks the array entry from the days / hours / minutes bits.
assert.equal(G.setToast(new Date(+now+30000),now,'en'),'This alarm is set for less than 1 minute from now.');
assert.equal(G.setToast(new Date(+now+(26*60+1)*60000),now,'en'),'This alarm is set for 1 day, 2 hours, and 1 minute from now.');
assert.equal(G.setToast(new Date(+now+3*3600000),now,'en'),'This alarm is set for 3 hours from now.');
// Face: Clockopia time, next alarm, strip; dim adds the tint.
let html=G.render(ctx({next:new Date(2026,9,3,7,0)}));
assert.match(html,/gbdc-time"><span>2:13<\/span><b>PM<\/b>/);assert.match(html,/Sat 7:00 AM/);assert.match(html,/Friday, October 2/);assert.equal((html.match(/gbdc-strip-btn/g)||[]).length,4);
assert.match(G.render(ctx({dim:true})),/gbdc-tint/);
// Alarm list and SetAlarm.
html=G.render(ctx({sub:'alarms'}));assert.match(html,/Add alarm/);assert.match(html,/ic_clock_alarm_on/);assert.match(html,/ic_indicator_off/);assert.match(html,/<em>Gym<\/em>/);assert.match(html,/Mon, Wed/);
html=G.render(ctx({sub:'alarm-edit',draft:N.normalize({id:2,time:'08:30',days:[],label:''})}));
assert.deepEqual([...html.matchAll(/gbset-title">([^<]+)/g)].map(m=>m[1]),['Turn alarm on','Time','Repeat','Ringtone','Vibrate','Label']);
assert.match(html,/Never/);assert.match(html,/Alarm Classic/);assert.match(html,/>Done<.*>Revert<.*>Delete</);
// Menus and dialogs.
assert.deepEqual([...G.menu(ctx()).map(i=>i.title)],['Alarms','Add alarm','Dock settings']);
assert.deepEqual([...G.menu(ctx({sub:'alarms'})).map(i=>i.title)],['Desk clock','Add alarm','Settings']);
let d=G.dialog('time',ctx({temp:{time:'19:05'}}));assert.equal(d.title,'7:05 PM');assert.match(d.custom,/>7<\/output>.*>05<\/output>.*gbtp-ampm/);assert.equal(d.buttons[0].title,'Set');
d=G.dialog('days',ctx({temp:{days:[1]}}));assert.equal(d.items[0].title,'Monday');assert.equal(d.items[1].checked,true);
d=G.dialog('tone',ctx({temp:{tone:'Alarm_Buzzer'}}));assert.equal(d.items[0].title,'Silent');assert.equal(d.selected,4);
assert.equal(G.dialog('delete',ctx()).message,'This alarm will be deleted.');
d=G.dialog('ringing',ctx({ringing:N.normalize({id:3,time:'06:45'})}));assert.equal(d.title,'Alarm');assert.deepEqual([...d.buttons.map(b=>b.title)],['Snooze','Dismiss']);
console.log('gb-deskclock ok');
