const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};
vm.runInNewContext(fs.readFileSync('versions/2.3.6/gb-widgets.js','utf8'),context);
const G=context.window.GBWidgets;
// The 2.3.6 AOSP and Market providers: Picture frame 2 x 2, Bookmarks 4 x 4, Power control 4 x 1.
assert.deepEqual([...G.PROVIDERS.map(p=>p.label)],['Analog clock','Bookmarks','Google Search','Home screen tips','Market','Music','News & Weather','Picture frame','Power control','YouTube']);
assert.equal(G.PROVIDERS.find(p=>p.type==='photo').width,2);assert.equal(G.PROVIDERS.find(p=>p.type==='bookmarks').height,4);
// Analog clock hands.
const html=G.analog(new Date(2026,9,2,3,30));assert.match(html,/appwidget_clock_dial/);assert.match(html,/rotate\(105deg\)/);assert.match(html,/rotate\(180deg\)/);
// Power control icons and indicators, brightness states.
let p=G.power({wifi:true,bluetooth:false,gps:false,autoSync:true,autoBrightness:true});
assert.match(p,/settings_wifi_on/);assert.match(p,/settings_bluetooth_off/);assert.match(p,/settings_sync_on/);assert.match(p,/settings_brightness_auto/);assert.equal((p.match(/gbw-div/g)||[]).length,4);
assert.equal(G.brightnessState({brightness:20}),'off');assert.equal(G.brightnessState({brightness:55}),'mid');assert.equal(G.brightnessState({brightness:100}),'on');
assert.match(G.power({brightness:55}),/gbw-ind r mid/);
// Picture frame and Bookmarks.
assert.match(G.pictureFrame({id:3,name:'Sea'},()=>'x.svg'),/data-action="photo" data-id="3"/);assert.match(G.pictureFrame(null,()=>''),/data-action="noop"/);
const b=G.bookmarks(['a.com','b.com'],3,u=>u.toUpperCase(),u=>`<p>${u}</p>`);assert.match(b,/B\.COM/);assert.match(b,/widget-bookmark-open" data-id="b\.com"/);
console.log('gb-widgets ok');
// The Google apps' widgets (gb-google-widgets.js): Latitude, Traffic, the two Google Voice ones and CalendarProvider's agenda.
const gctx={window:{}};vm.runInNewContext(fs.readFileSync('versions/2.3.6/gb-google-widgets.js','utf8'),gctx);
const W=gctx.window.GBGoogleWidgets;
assert.deepEqual([...W.PROVIDERS.map(p=>`${p.label} ${p.width}x${p.height}`)],['Calendar 2x2','Google Voice Inbox 3x1','Google Voice Settings 3x1','Latitude 4x2','Rate Places 4x1','Traffic 1x1']);
assert.equal(W.T('hu','No upcoming calendar events'),'Nincsenek közelgő események a naptárban');assert.equal(W.T('de','Last Updated: {0}'),'Letzte Aktualisierung: {0}');
const now=new Date(2026,9,5,9,0).getTime(),base={lang:'en',locale:'en-US',now,hour24:false,ui:{},account:'demo@example.com',t:k=>k};
assert.match(W.calendar({...base,data:{},events:[]}),/No upcoming calendar events/);
const cal=W.calendar({...base,data:{},events:[{id:1,date:'2026-10-05',time:'07:00',title:'Gone'},{id:2,date:'2026-10-05',time:'11:00',title:'Coffee',location:'Café'},{id:3,date:'2026-10-05',time:'11:00',title:'Call'},{id:4,date:'2026-10-07',time:'10:00',title:'Later'}]});
assert.match(cal,/MONDAY/);assert.match(cal,/class="dom">5</);assert.match(cal,/11:00 AM/);assert.match(cal,/Coffee|Call/);assert.match(cal,/1 more event/);assert.doesNotMatch(cal,/Gone/);
const gv={...base,data:{gvoice:[{id:'a',name:'Sam',kind:'sms',read:false,label:'inbox',items:[{text:'Hi'}]},{id:'b',name:'Taylor',kind:'missed',read:true,label:'inbox',items:[]}]}};
assert.match(W.voiceInbox(gv),/Google Voice \(1 unread\)/);assert.match(W.voiceInbox(gv),/Sam: Hi/);assert.match(W.voiceInbox({...gv,ui:{gbwVoice:-1}}),/Missed call from Taylor/);
assert.match(W.voiceSettings({...base,data:{gvoiceDnd:true}}),/do_not_disturb_on/);assert.match(W.traffic(base),/gbw-traffic-light (green|yellow)">\d+</);
gctx.window.GBMaps={FRIENDS:[{id:'f1',name:'Alex',place:'Park',fx:.3,fy:.6}],distance:(l,k)=>k.toFixed(1)+' km',km:()=>1.2};
const lat=W.latitude({...base,data:{}});assert.match(lat,/Alex/);assert.match(lat,/1\.2 km/);assert.match(lat,/demo@example\.com/);assert.match(lat,/Last Updated: /);
// Rate Places: the nearest place, the counter of rated places, the rate panel and the place list.
gctx.window.GBMaps={...gctx.window.GBMaps,ME:{fx:.5,fy:.52},POIS:[{id:'p1',name:'Far',address:'1 A St',fx:.9,fy:.9},{id:'p2',name:'Near',address:'2 B St',fx:.5,fy:.5}],km:(a,b)=>Math.hypot(a.fx-b.fx,a.fy-b.fy)};
let hp=W.ratePlaces({...base,data:{}});assert.match(hp,/<b>Near<\/b>/);assert.match(hp,/<b>0<\/b><b>0<\/b><b>0<\/b>/);assert.match(hp,/Updated /);
hp=W.ratePlaces({...base,data:{hotpot:{place:'p1',ratings:{p1:3,p2:5}}}});assert.match(hp,/<b>Far<\/b>/);assert.match(hp,/You rated:/);assert.equal((hp.match(/small_star_on/g)||[]).length,3);assert.match(hp,/<b>0<\/b><b>0<\/b><b>2<\/b>/);
hp=W.ratePlaces({...base,ui:{gbwHotpot:'rate'},data:{hotpot:{ratings:{}}}});assert.match(hp,/Posting publicly as demo@example\.com/);assert.match(hp,/data-id="p2:5"/);assert.match(hp,/Say more/);assert.match(hp,/gbw-hp-btn back/);
assert.equal(W.T('de','Rate Places'),'Orte bewerten');
const pd=W.placeDialog({...base,data:{}});assert.equal(pd.title,'Select a place:');assert.match(pd.custom,/Near.*2 B St.*Far/s);
console.log('gb-google-widgets ok');
