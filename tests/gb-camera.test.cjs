const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},Intl,Date,encodeURIComponent};
for(const f of ['media.js','gb-strings-camera.js','gb-camera.js'])vm.runInNewContext(fs.readFileSync(`versions/2.3.6/${f}`,'utf8'),context);
const G=context.window.GBCamera;
const ctx=(o={})=>({lang:'en',saved:{},mode:'photo',popup:'',focus:'',recording:false,recordTime:'00:00',last:null,effectFilter:'none',...o});
// Settings: defaults, media.js compatibility (front boolean, numeric exposure), labels from the 2.3.6 arrays.
assert.equal(G.settings({}).size,'2560x1920');assert.equal(G.settings({front:true}).facing,'front');assert.equal(G.settings({exposure:-1}).exposure,'-1');
assert.equal(G.label('balance','cloudy','en'),'Cloudy');assert.equal(G.label('balance','incandescent','hu'),'Izzólámpa');assert.equal(G.label('flash','off','de'),'Aus');
assert.equal(G.label('gps','on','en'),'On');assert.equal(G.label('facing','front','en'),'Front');assert.equal(G.label('exposure','2','en'),'+2');assert.equal(G.label('size','2560x1920','en'),'5M Pixels');
assert.equal(G.zoomText(1),'1x');assert.equal(G.zoomText(1.4),'1.4x');
// Viewfinder: indicators right to left (settings first), zoom ratio, control bar, empty thumbnail.
let html=G.render(ctx());
const order=[...html.matchAll(/gbcam-ind[^"]*" data-action="gbcam-popup" data-id="(\w+)"/g)].map(m=>m[1]);
assert.deepEqual(order,['facing','zoom','flash','balance','gps','settings']);
assert.match(html,/ic_viewfinder_flash_auto/);assert.match(html,/ic_viewfinder_wb_auto/);assert.match(html,/ic_viewfinder_gps_off/);assert.match(html,/<b>1x<\/b>/);
assert.match(html,/gbcam-shutter"/);assert.match(html,/gbcam-switch"/);assert.match(html,/gbcam-thumb"[^>]*disabled/);
// Popups: a basic list with icons and ticks, the other-settings list with its headers, zoom; anchored over the indicator.
html=G.render(ctx({popup:'balance',saved:{balance:'daylight'}}));
assert.match(html,/gbcam-head">White balance</);assert.equal((html.match(/class="gbcam-opt"/g)||[]).length,5);assert.match(html,/balance:daylight"><img src="assets\/gb-cam-ic_menuselect_wb_daylight.png" alt=""><span>Daylight<\/span><img class="gbcam-tick" src="assets\/gb-cam-ic_menuselect_on.png"/);
assert.match(html,/--ax:58\.333%;--w:165px/);
html=G.render(ctx({popup:'settings'}));
for(const t of ['Focus mode','Exposure','Scene mode','Picture size','Picture quality','Color effect','Restore defaults'])assert.match(html,new RegExp(t));
assert.match(G.render(ctx({popup:'zoom',saved:{zoom:2}})),/data-gbcam-zoom/);
// States: focus rectangle, video mode with the record button and timer, the last picture in the thumbnail.
assert.match(G.render(ctx({focus:'focused'})),/gbcam-focus focused/);
html=G.render(ctx({mode:'video',recording:true,recordTime:'00:07'}));
assert.match(html,/gbcam video"/);assert.match(html,/gbcam-shutter stop"/);assert.match(html,/gbcam-switch video"/);assert.match(html,/00:07/);
assert.doesNotMatch(G.render(ctx({last:{id:1,name:'IMG',colors:['#111111','#222222','#333333']}})),/gbcam-thumb"[^>]*disabled/);
// Menu.
assert.deepEqual([...G.menu(ctx()).map(i=>i.title)],['Switch to video','Gallery','Switch Camera']);
assert.equal(G.menu(ctx({mode:'video'}))[0].title,'Switch to camera');
console.log('gb-camera ok');
