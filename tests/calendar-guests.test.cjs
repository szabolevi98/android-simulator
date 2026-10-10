const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Calendar (audit step 6): guests, Show me as / Privacy (5.1: Visibility) and the event's time zone (4.3 / 4.4.4: the
// TimeZonePickerDialog button, tzpicker.js, and the details in the device's zone with its short name; 4.0.4 / 5.1.1:
// the zone list).
for(const v of ['4.0.4','4.3','4.4.4','5.1.1']){
  const w={window:{AndroidI18n:{language:'en'},ICSSystemSettings:{zone:()=>'Europe/Budapest'}}};w.window.window=w.window;
  const JB=v==='4.3'||v==='4.4.4';
  for(const f of ['stock-strings.js',JB?'tzpicker.js':'calendar-timezones.js','calendar.js'])vm.runInNewContext(fs.readFileSync(`versions/${v}/${f}`,'utf8'),w);
  const C=w.window.ICSCalendar,t=k=>k,LP=v==='5.1.1',zone=JB?/Japan Standard Time  <i>GMT\+9<\/i>/:/\(GMT\+9:00\) Tokyo/;
  if(!JB)assert.equal(w.window.CalendarTimezones.length,83);
  const draft={date:'2026-10-08',title:'x',guests:'alex@example.com',tz:'Asia/Tokyo',availability:1,privacy:2};
  const ed=C.render({events:[],calendarMode:'Month'},{sub:'event-edit',selectedDate:'2026-10-08',eventDraft:draft},t,'en-US',new Date(2026,9,8));
  assert.match(ed,/name="tz" value="Asia\/Tokyo"/);assert.match(ed,zone);assert.match(ed,/name="guests"[^>]*value="alex@example\.com"/);
  if(LP)assert.match(ed,/name="visibility" value="2:1"[\s\S]*Public - Available/);
  else{assert.match(ed,/name="availability" value="1"[\s\S]*Available[\s\S]*name="privacy" value="2"[\s\S]*Public/);assert.match(ed,/All day[\s\S]*Time zone[\s\S]*Guests[\s\S]*name="description"[\s\S]*name="repeat"[\s\S]*name="reminder"[\s\S]*Show me as[\s\S]*Privacy/);}
  if(!JB)assert.equal(C.spinner('tz',draft,'en-US',t).length,83);else assert.match(ed,/data-action="caltz" data-id="Asia\/Tokyo"/);assert.deepEqual(Array.from(C.spinner('availability',draft,'en-US',t),i=>i.label),['Busy','Available']);
  const n=C.normalize({date:'2026-10-08',availability:'1',privacy:'5',tz:'Europe/Paris'});assert.equal(n.availability,1);assert.equal(n.privacy,0);assert.equal(n.tz,'Europe/Paris');assert.equal(n.guests,'');
  const info=C.render({events:[{id:1,...draft,time:'10:00',endTime:'11:00',endDate:'2026-10-08',repeat:'none',reminder:-1}],calendarMode:'Month'},{sub:'event',selectedEvent:1,selectedDate:'2026-10-08'},t,'en-US',new Date(2026,9,8));
  assert.match(info,/alex@example\.com/);if(JB)assert.match(info,/Thursday, October 8, 2026, 03:00 – 04:00<span class="cal-tz">  CEST<\/span>/);else assert.match(info,zone);
  const sim=fs.readFileSync(`versions/${v}/simulator.js`,'utf8');assert.ok(sim.includes("event.guests=String(values.get('guests')||'').trim();event.tz=String(values.get('tz')||'');"),v);
  assert.ok(fs.readFileSync(`versions/${v}/index.html`,'utf8').includes(JB?'tzpicker.js?v=':'calendar-timezones.js?v='),v);
}
console.log('calendar-guests ok');
