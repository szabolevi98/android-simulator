const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};
for(const file of ['calendar.js','media.js','widgets.js'])vm.runInNewContext(fs.readFileSync(`versions/4.0.4/${file}`,'utf8'),context);
const widgets=context.window.ICSWidgets,t=key=>key,plain=value=>JSON.parse(JSON.stringify(value));
const now=new Date('2026-10-01T14:30:00');
const event=(id,date,time,endTime,extra={})=>({id,date,title:`Event ${id}`,time,endTime,...extra});

// Today has no day header; tomorrow and later days do. Finished events disappear.
let rows=widgets.calendarRows([
  event(1,'2026-10-01','09:00','10:00'),
  event(2,'2026-10-01','14:00','15:00'),
  event(3,'2026-10-01','16:00','17:00'),
  event(4,'2026-10-02','08:00','09:00'),
  event(5,'2026-10-02','00:00','00:00',{allDay:true,endDate:'2026-10-03'}),
  event(6,'2026-10-07','10:00','11:00'),
  event(7,'2026-10-08','10:00','11:00')
],now);
assert.deepEqual(plain(rows.map(row=>row.type==='day'?`day:${row.date}`:row.event.id)),[2,3,'day:2026-10-02',5,4,'day:2026-10-03',5,'day:2026-10-07',6]);
assert.equal(rows[0].inProgress,true);assert.equal(rows[1].inProgress,false);
assert.equal(rows[2].tomorrow,true);assert.equal(rows[5].tomorrow,false);

// An event that ends exactly now is still listed; one ending at midnight does not create a next-day row.
rows=widgets.calendarRows([event(1,'2026-10-01','13:30','14:30'),event(2,'2026-10-01','22:00','00:00',{endDate:'2026-10-02'})],now);
assert.deepEqual(plain(rows.map(row=>row.type==='day'?'day':row.event.id)),[1,2]);
// Multi-day events that started earlier fill today and the following days.
rows=widgets.calendarRows([event(1,'2026-09-30','20:00','09:00',{endDate:'2026-10-02'})],now);
assert.deepEqual(plain(rows.map(row=>row.type==='day'?'day':row.event.id)),[1,'day',1]);assert.equal(rows[0].multiDay,true);

// Later days stop once 20 events have been listed, but a started day is completed.
const busy=[];for(let i=0;i<18;i++)busy.push(event(100+i,'2026-10-01','15:00','16:00'));
busy.push(event(200,'2026-10-02','09:00','10:00'),event(201,'2026-10-02','11:00','12:00'),event(202,'2026-10-02','13:00','14:00'),event(203,'2026-10-03','09:00','10:00'));
rows=widgets.calendarRows(busy,now);
assert.equal(rows.filter(row=>row.type==='event').length,21);assert.ok(!rows.some(row=>row.event?.id===203));
assert.deepEqual(plain(widgets.calendarRows([{date:'bad'},null],now)),[]);

const html=widgets.calendar({events:[event(1,'2026-10-01','15:00','16:00',{title:'<img src=x onerror=alert(1)>',location:'<b>'})]},t,'en-US',now,true);
assert.ok(!html.includes('<img src=x')&&!html.includes('<b>'));assert.ok(html.includes('15:00'));
assert.ok(widgets.calendar({events:[]},t,'en-US',now,false).includes('No upcoming calendar events'));
assert.ok(widgets.calendar({events:[event(1,'2026-10-01','15:00','16:00',{title:'  '})]},t,'en-US',now,false).includes('(No title)'));
assert.match(widgets.when(event(1,'2026-10-01','15:00','09:30',{endDate:'2026-10-02'}),'en-US',true,true),/Oct 1.*15:00.*Oct 2.*09:30/);

// Music shows the initial prompt until playback has been used; previews contain no controls.
const tracks=[{title:'<Song>',artist:'Artist'}];
assert.ok(widgets.music({track:0,playing:false},tracks,false,t).includes('Touch to select music.'));
const active=widgets.music({track:0,playing:true},tracks,true,t);
assert.ok(active.includes('&lt;Song&gt;')&&active.includes('music_pause')&&active.includes('widget-music-next'));
assert.ok(!widgets.music({track:0,playing:false},tracks,false,t,true).includes('<button'));

// Gallery widget sources: one picture, an album, a stable shuffle and legacy first-picture frames.
const data={photos:[{id:1,name:'One'},{id:2,name:'Two',album:'camera'},{id:3,name:'Three'},{id:4,name:'<Four>'},{id:5,name:'Five',album:'camera'}]};
assert.deepEqual(plain(widgets.photoItems(data,{id:'a',source:'photo',photo:3}).map(p=>p.id)),[3]);
assert.deepEqual(plain(widgets.photoItems(data,{id:'a',source:'album',album:'camera'}).map(p=>p.id)),[2,5]);
const shuffled=widgets.photoItems(data,{id:'stack-1',source:'shuffle'}).map(p=>p.id);
assert.deepEqual(plain([...shuffled].sort()),[1,2,3,4,5]);assert.deepEqual(widgets.photoItems(data,{id:'stack-1',source:'shuffle'}).map(p=>p.id),shuffled);
assert.deepEqual(plain(widgets.photoItems(data,{id:'old'}).map(p=>p.id)),[1]);
assert.deepEqual(plain(widgets.photoItems(data,{id:'new',source:null})),[]);
assert.ok(widgets.photo(data,{id:'a',source:'photo',photo:99},0,t).includes('No photos.'));
const stack=widgets.photo(data,{id:'s',source:'album',album:'pictures'},4,t);
assert.equal((stack.match(/phw-card/g)||[]).length,3);assert.ok(stack.includes('phw-front')&&stack.includes('&lt;Four&gt;'));
assert.equal(widgets.wrap(-1,3),2);assert.equal(widgets.wrap(7,3),1);
assert.ok(widgets.photoOverlay(data,{overlay:'widget-photo-album'},t).includes('widget-photo-album'));

// Each image's own widgets.
const loadV=v=>{const w={PlayApps:{art:()=>'<svg></svg>'}};vm.runInNewContext(fs.readFileSync(`versions/${v}/widgets.js`,'utf8'),{window:w});return w.ICSWidgets;};
const demo=[{title:'Blue Horizon',artist:'The Demo Tapes',album:'First Light'}];
// KitKat: Google Play Music's widget_nowplaying_small (art, previous / play / next, the rule, title - artist).
{const html=loadV('4.4.4').music({track:0,playing:false},demo,true,t);
  assert.ok(html.startsWith('<div class="pmw"'));
  for(const f of ['btn_playback_rew_normal_jb_dark','btn_playback_play_normal_jb_dark','btn_playback_ff_normal_jb_dark'])assert.ok(html.includes(`pmw-${f}.png`),f);
  assert.ok(html.includes('pmw-rule')&&html.includes('<b>Blue Horizon</b>')&&html.includes('data-action="widget-music-prev"'));
  assert.ok(loadV('4.4.4').music({track:0,playing:true},demo,true,t).includes('btn_playback_pause_normal_jb_dark'));}
// Lollipop: music_widget_small (white, art, the text line over five buttons: thumbs, previous, play, next, thumbs).
{const html=loadV('5.1.1').music({track:0,playing:false},demo,true,t);
  assert.ok(html.startsWith('<div class="pmlw"'));
  assert.deepEqual([...html.matchAll(/assets\/pm-(ic_[a-z_]+)\.png/g)].map(m=>m[1]),['ic_thumbs_up_default','ic_rew_dark','ic_play_black','ic_fwd_dark','ic_thumbs_down_default']);}
for(const f of ['4.4.4/assets/pmw-appwidget_bg.png','4.4.4/assets/pmw-widget_preview_music.png','5.1.1/assets/pm-ic_play_black.png','5.1.1/assets/pm-music_widget_preview.png'])assert.ok(fs.existsSync(`versions/${f}`),f);
// Gingerbread draws its own widgets; only the picture lists stay shared.
assert.deepEqual(Object.keys(loadV('2.3.6')).sort(),['photoItems','wrap']);
// 4.0.4 / 4.3 keep the AOSP album widget.
assert.ok(loadV('4.3').music({track:0,playing:false},demo,true,t).includes('class="musw"'));
console.log('Widget checks passed: calendar day buckets, in-progress/finished/midnight events, 20-event cutoff, music state, photo sources and escaping, and each image Play Music / Gingerbread widget sets.');
