const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},Intl,Date};
for(const f of ['calendar.js','gb-strings-calendar.js','gb-calendar.js'])vm.runInNewContext(fs.readFileSync(`versions/2.3.6/${f}`,'utf8'),context);
const G=context.window.GBCalendar,C=context.window.ICSCalendar,now=new Date(2026,9,2,9,30);
const events=[{id:1,date:'2026-10-02',title:'Coffee',time:'11:00',endTime:'12:00'},{id:2,date:'2026-10-05',title:'Gym',time:'18:00',repeat:'weekly',reminder:10},{id:3,date:'2026-10-07',title:'Trip',allDay:true,endDate:'2026-10-08'}];
const ctx=(o={})=>({lang:'en',locale:'en-US',t:k=>k,now,hour24:false,sub:'',mode:'Month',selected:'2026-10-02',first:0,events,event:events[0],instance:'',draft:null,temp:null,extra:false,error:'',account:'demo@example.com',target:'2026-10-02',ok:'OK',cancel:'Cancel',setLabel:'Set',...o});
// MonthView: title, day names, 42 cells; today, other month, bold busy days and busy bits by time of day.
let html=G.render(ctx());
assert.match(html,/gbcal-title center">October 2026</);assert.equal((html.match(/class="gbcal-cell/g)||[]).length,42);
assert.match(html,/gbcal-cell today busy" data-action="calendar-day" data-id="2026-10-02"/);assert.match(html,/gbcal-cell other" data-action="calendar-day" data-id="2026-09-27"/);
assert.match(html,/top:45\.83%;height:4\.17%/);assert.match(html,/data-id="2026-10-07"[^>]*>.*?top:0\.00%;height:100\.00%/);assert.match(html,/<span>Sun<\/span>/);
// Day and Week: title, hour column, lanes at 10 cqh per hour, the current time line, all-day row; two-letter week headers.
html=G.render(ctx({mode:'Day'}));
assert.match(html,/Friday, October 2, 2026/);assert.match(html,/gbcal-hour">12<small>am<\/small>/);assert.match(html,/top:110\.000cqh;height:10\.000cqh/);assert.match(html,/gbcal-now" style="top:95\.000cqh/);
html=G.render(ctx({mode:'Week',selected:'2026-10-07'}));
assert.match(html,/Oct 4\s–\s10, 2026/u);assert.match(html,/>Su 04</);assert.match(html,/gbcal-allday/);assert.match(html,/Gym/);
assert.match(G.render(ctx({mode:'Day',hour24:true})),/gbcal-hour">00</);
// Agenda: Today header, rows with times, the repeating event each week, the header and footer.
html=G.render(ctx({mode:'Agenda'}));
assert.match(html,/Today, Friday, October 2/);assert.match(html,/11:00 AM – 12:00 PM/);assert.equal((html.match(/<b>Gym<\/b>/g)||[]).length,4);
assert.match(html,/Showing events since Oct 2, 2026/);assert.match(html,/Showing events until Nov 1, 2026/);
// Event info: card on the calendar colour, when line, repeat text and reminders.
html=G.render(ctx({sub:'event',event:events[1],instance:'2026-10-12'}));
assert.match(html,/View event/);assert.match(html,/Calendar: demo@example.com/);assert.match(html,/Mon, Oct 12, 2026, 6:00 PM – 7:00 PM/);assert.match(html,/Weekly \(every Monday\)/);assert.match(html,/10 minutes/);
assert.match(G.render(ctx({sub:'event'})),/data-action="gbcal-info-reminder" data-id="1"/);
// Edit event: fields, buttons, hidden values for the save handler, Done / Revert and Delete only when editing.
html=G.render(ctx({sub:'event-edit',draft:C.normalize({date:'2026-10-02',time:'12:00',title:'',reminder:10})}));
assert.match(html,/Event details/);assert.match(html,/placeholder="Event name"/);assert.match(html,/Fri, Oct 2, 2026/);assert.match(html,/12:00 PM/);
assert.match(html,/name="reminder" value="10"/);assert.match(html,/One-time event/);assert.match(html,/>Done</);assert.doesNotMatch(html,/event-delete/);
assert.match(G.render(ctx({sub:'event-edit',draft:C.normalize({...events[1]})})),/data-action="event-delete">Delete</);
assert.match(G.render(ctx({sub:'event-edit',draft:C.normalize({date:'2026-10-02',allDay:true})})),/class="gbcal-btn time"[^>]*hidden/);
assert.match(G.render(ctx({sub:'event-edit',extra:true,draft:C.normalize({date:'2026-10-02'})})),/Show me as/);
// Menus: the current view disabled; info and edit menus.
assert.deepEqual([...G.menu(ctx()).map(i=>i.title)].slice(0,6),['Day','Week','Month','Agenda','Today','New event']);assert.equal(G.menu(ctx())[2].disabled,true);
assert.deepEqual([...G.menu(ctx({sub:'event'})).map(i=>i.action)],['event-edit','event-delete']);
assert.equal(G.menu(ctx({sub:'event-edit',draft:{}}))[0].title,'Show extra options');
// Dialogs and the picker steps.
assert.match(G.dialog('date',ctx({draft:C.normalize({date:'2026-10-02'}),temp:{value:'2026-10-31'}})).title,/Saturday, October 31, 2026/);
assert.equal(G.dialog('repeat',ctx({draft:C.normalize({date:'2026-10-02',repeat:'weekly'})})).selected,3);
assert.equal(G.dialog('reminder',ctx({draft:C.normalize({date:'2026-10-02',reminder:60})})).selected,8);
assert.equal(G.dialog('delete-scope',ctx()).items.length,3);assert.equal(G.dialog('day-context',ctx()).items[2].action,'gbcal-new-on');
assert.equal(G.step('date','2026-01-31','month',1),'2026-02-28');assert.equal(G.step('date','2026-10-02','day',-2),'2026-09-30');assert.equal(G.step('date','2036-10-02','year',1),'2036-10-02');
assert.equal(G.step('time','23:59','minute',1),'23:00');assert.equal(G.step('time','23:00','hour',1),'00:00');assert.equal(G.step('time','09:15','ampm',0),'21:15');
// Translations.
assert.equal(G.text('hu','month_view'),'Hónap');assert.equal(G.repeatText('monthly-weekday','2026-10-30',{lang:'en',locale:'en-US'}),'Monthly (every last Friday)');
console.log('gb-calendar ok');
