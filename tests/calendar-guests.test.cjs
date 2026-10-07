const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Calendar (audit step 6): guests, Show me as / Privacy (5.1: Visibility) and the event's time zone.
for(const v of ['4.0.4','4.3','4.4.4','5.1.1']){
  const w={window:{AndroidI18n:{language:'en'}}};w.window.window=w.window;
  for(const f of ['stock-strings.js','calendar-timezones.js','calendar.js'])vm.runInNewContext(fs.readFileSync(`versions/${v}/${f}`,'utf8'),w);
  const C=w.window.ICSCalendar,t=k=>k,LP=v==='5.1.1';
  assert.equal(w.window.CalendarTimezones.length,83);
  const draft={date:'2026-10-08',title:'x',guests:'alex@example.com',tz:'Asia/Tokyo',availability:1,privacy:2};
  const ed=C.render({events:[],calendarMode:'Month'},{sub:'event-edit',selectedDate:'2026-10-08',eventDraft:draft},t,'en-US',new Date(2026,9,8));
  assert.match(ed,/name="tz" value="Asia\/Tokyo"[\s\S]*\(GMT\+9:00\) Tokyo/);assert.match(ed,/name="guests"[^>]*value="alex@example\.com"/);
  if(LP)assert.match(ed,/name="visibility" value="2:1"[\s\S]*Public - Available/);
  else{assert.match(ed,/name="availability" value="1"[\s\S]*Available[\s\S]*name="privacy" value="2"[\s\S]*Public/);assert.match(ed,/All day[\s\S]*Time zone[\s\S]*Guests[\s\S]*name="description"[\s\S]*name="repeat"[\s\S]*name="reminder"[\s\S]*Show me as[\s\S]*Privacy/);}
  assert.equal(C.spinner('tz',draft,'en-US',t).length,83);assert.deepEqual(Array.from(C.spinner('availability',draft,'en-US',t),i=>i.label),['Busy','Available']);
  const n=C.normalize({date:'2026-10-08',availability:'1',privacy:'5',tz:'Europe/Paris'});assert.equal(n.availability,1);assert.equal(n.privacy,0);assert.equal(n.tz,'Europe/Paris');assert.equal(n.guests,'');
  const info=C.render({events:[{id:1,...draft,time:'10:00',endTime:'11:00',endDate:'2026-10-08',repeat:'none',reminder:-1}],calendarMode:'Month'},{sub:'event',selectedEvent:1,selectedDate:'2026-10-08'},t,'en-US',new Date(2026,9,8));
  assert.match(info,/alex@example\.com/);assert.match(info,/\(GMT\+9:00\) Tokyo/);
  const sim=fs.readFileSync(`versions/${v}/simulator.js`,'utf8');assert.ok(sim.includes("event.guests=String(values.get('guests')||'').trim();event.tz=String(values.get('tz')||'');"),v);
  assert.ok(fs.readFileSync(`versions/${v}/index.html`,'utf8').includes('calendar-timezones.js?v='),v);
}
console.log('calendar-guests ok');
