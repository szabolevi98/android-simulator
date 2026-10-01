const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};
for(const file of ['calendar.js','media.js','widgets.js'])vm.runInNewContext(fs.readFileSync(`versions/4.0.4/${file}`,'utf8'),context);
const cal=context.window.ICSCalendar,widgets=context.window.ICSWidgets,plain=value=>JSON.parse(JSON.stringify(value)),t=key=>key;
const dates=(event,from,to)=>plain(cal.expand([event],from,to).map(item=>item.date));
const base={id:1,title:'Series',time:'09:00',endTime:'10:00'};

// Repetition rules from EditEventView.
assert.deepEqual(dates({...base,date:'2026-10-01',repeat:'daily'},'2026-10-01','2026-10-03'),['2026-10-01','2026-10-02','2026-10-03']);
assert.deepEqual(dates({...base,date:'2026-10-02',repeat:'weekdays'},'2026-10-02','2026-10-06'),['2026-10-02','2026-10-05','2026-10-06']);
assert.deepEqual(dates({...base,date:'2026-10-01',repeat:'weekly'},'2026-10-01','2026-10-22'),['2026-10-01','2026-10-08','2026-10-15','2026-10-22']);
assert.deepEqual(dates({...base,date:'2026-01-31',repeat:'monthly-day'},'2026-01-01','2026-05-31'),['2026-01-31','2026-03-31','2026-05-31']);
// First Thursday of the month, and a fifth weekday stored as "last".
assert.deepEqual(dates({...base,date:'2026-10-01',repeat:'monthly-weekday'},'2026-10-01','2026-12-31'),['2026-10-01','2026-11-05','2026-12-03']);
assert.deepEqual(dates({...base,date:'2026-10-29',repeat:'monthly-weekday'},'2026-10-01','2026-12-31'),['2026-10-29','2026-11-26','2026-12-31']);
assert.deepEqual(dates({...base,date:'2024-02-29',repeat:'yearly'},'2024-01-01','2028-12-31'),['2024-02-29','2028-02-29']);
// Exceptions, series end and multi-day instances.
assert.deepEqual(dates({...base,date:'2026-10-01',repeat:'daily',exdates:['2026-10-02'],until:'2026-10-04'},'2026-10-01','2026-10-10'),['2026-10-01','2026-10-03','2026-10-04']);
const long={...base,date:'2026-10-01',endDate:'2026-10-02',endTime:'09:00',repeat:'weekly'};
assert.deepEqual(plain(cal.expand([long],'2026-10-09','2026-10-09').map(item=>[item.date,item.endDate])),[['2026-10-08','2026-10-09']]);
assert.equal(cal.onDay([{...base,date:'2026-10-01',repeat:'weekly'}],'2026-10-15').length,1);
assert.equal(cal.onDay([{...base,date:'2026-10-01',repeat:'weekly'}],'2026-10-16').length,0);
assert.equal(cal.instance({...base,date:'2026-10-01',repeat:'weekly'},'2026-10-15').date,'2026-10-15');
assert.equal(cal.instance({...base,date:'2026-10-01',repeat:'weekly'},'2026-10-16').date,'2026-10-01');
// Invalid stored values fall back safely.
const odd=cal.normalize({...base,date:'2026-10-01',repeat:'hourly',reminder:7,exdates:['x','2026-10-02'],until:'never'});
assert.equal(odd.repeat,'none');assert.equal(odd.reminder,-1);assert.deepEqual(plain(odd.exdates),['2026-10-02']);assert.equal(odd.until,'');

// Labels.
assert.equal(cal.repeatLabel({...base,date:'2026-10-01',repeat:'weekly'},'en-US',t),'Weekly (every Thursday)');
assert.equal(cal.repeatLabel({...base,date:'2026-10-29',repeat:'monthly-weekday'},'en-US',t),'Monthly (every last Thursday)');
assert.equal(cal.repeatLabel({...base,date:'2026-10-01',repeat:'monthly-day'},'en-US',t),'Monthly (on day 1)');
assert.equal(cal.reminderLabel(60,t),'1 hour');assert.equal(cal.reminderLabel(-1,t),'None');

// AlertService timing: due once, not before time, not when stale, and once per instance.
const series={...base,date:'2026-10-01',repeat:'daily',reminder:10};
const due=now=>plain(cal.dueReminders([series],new Date(now),['1@2026-10-01']).map(item=>item.key));
assert.deepEqual(due('2026-10-02T08:49:00'),[]);
assert.deepEqual(due('2026-10-02T08:50:00'),['1@2026-10-02']);
assert.deepEqual(due('2026-10-02T09:05:00'),[]);
assert.deepEqual(due('2026-10-01T08:52:00'),[]);
assert.deepEqual(plain(cal.dueReminders([{...series,reminder:-1}],new Date('2026-10-02T08:50:00')).length),0);

// The home widget lists series instances.
const rows=widgets.calendarRows([{...base,date:'2026-09-01',repeat:'weekly'}],new Date('2026-10-01T08:00:00'));
assert.deepEqual(plain(rows.map(row=>row.type==='day'?'day':row.event.date)),['day','2026-10-06']);
console.log('Calendar recurrence checks passed: rules, last-weekday, leap years, exceptions, series end, multi-day instances, labels, reminders and widget rows.');
