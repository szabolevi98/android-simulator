const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Galaxy Nexus 4.0.4: the framework's DatePickerDialog / TimePickerDialog (ics-pickers.js).
const ctx={window:{},document:{addEventListener(){}},Intl,Date};vm.runInNewContext(fs.readFileSync('versions/4.0.4/ics-pickers.js','utf8'),ctx);
const P=ctx.window.ICSPickers;
// Phones show only the spinners (date_picker_dialog.xml: calendarViewShown="false"), in the locale's order; the title is the date.
let html=P.render({kind:'date',y:2012,m:9,d:5,setAction:'calpick-set'},'en-US');
assert.match(html,/Fri, Oct 5, 2012/);assert.doesNotMatch(html,/calendar/i);
const cols=h=>[...h.matchAll(/data-col="(\w+)"/g)].map(m=>m[1]);
assert.deepEqual(cols(html),['month','day','year']);assert.deepEqual(cols(P.render({kind:'date',y:2012,m:9,d:5},'hu-HU')),['year','month','day']);
assert.deepEqual(cols(P.render({kind:'date',y:2012,m:9,d:5},'de-DE')),['day','month','year']);
assert.match(html,/>Cancel</);assert.match(html,/data-action="calpick-set">Set</);assert.match(P.render({kind:'date',y:2012,m:9,d:5},'hu-HU'),/>Beállítás</);
// The wheels wrap; the day follows the month's length; the year stops at 1900 / 2100.
let s=P.fromValue('date','2012-01-31');P.step(s,'month:1');assert.equal(P.iso(s),'2012-02-29');P.step(s,'day:1');assert.equal(P.iso(s),'2012-02-01');
P.step(s,'month:-1');P.step(s,'month:-1');assert.equal(P.iso(s),'2012-12-01');s=P.fromValue('date','2100-05-05');P.step(s,'year:1');assert.equal(s.y,2100);
// Time: hour (TWO_DIGIT_FORMATTER only on a 24-hour clock), ':' and minute; AM / PM on a 12-hour clock.
let t=P.fromValue('time','07:00',{hour24:false});html=P.render(t,'en-US');assert.match(html,/Set time/);assert.deepEqual(cols(html),['hour','minute','ampm']);assert.match(html,/<b>7<\/b>/);
P.step(t,'ampm:1');assert.equal(P.hhmm(t),'19:00');P.step(t,'ampm:1');assert.equal(P.hhmm(t),'19:00');P.step(t,'minute:-1');assert.equal(P.hhmm(t),'19:59');P.step(t,'hour:5');assert.equal(t.h,0);
html=P.render(P.fromValue('time','07:05',{hour24:true}),'de-DE');assert.deepEqual(cols(html),['hour','minute']);assert.match(html,/<b>07<\/b>/);assert.match(html,/Uhrzeit festlegen/);
// Calendar's editor uses From / To spinner buttons instead of browser date / time fields, and has no bottom bar.
const cal=fs.readFileSync('versions/4.0.4/calendar.js','utf8');assert.doesNotMatch(cal,/type="\$\{type\}"[^`]*'date','Start date','date'/);assert.doesNotMatch(cal,/'date','Start date','date'/);
assert.doesNotMatch(cal,/cal-nav/);assert.match(cal,/data-action="calpick"/);assert.doesNotMatch(cal,/[‹›▾]/);
assert.doesNotMatch(fs.readFileSync('versions/4.0.4/desk-clock.js','utf8'),/desk-time-picker/);
console.log('ics-pickers ok');
