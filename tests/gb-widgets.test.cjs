const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};
vm.runInNewContext(fs.readFileSync('versions/2.3.6/gb-widgets.js','utf8'),context);
const G=context.window.GBWidgets;
// The 2.3.6 providers: no Calendar widget, Picture frame 2 x 2, Bookmarks 4 x 4, Power control 4 x 1.
assert.deepEqual([...G.PROVIDERS.map(p=>p.label)],['Analog clock','Bookmarks','Home screen tips','Music','Picture frame','Power control','Search']);
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
