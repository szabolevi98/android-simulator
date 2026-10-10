// Latitude on the Galaxy Nexus (audit step 9): Maps 6.4's MapsActivity in Latitude mode, map_view_latitude.xml's bar and overflow.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c={window:{}};for(const f of ['stock-strings.js','stock-apps.js'])vm.runInNewContext(fs.readFileSync('versions/4.0.4/'+f,'utf8'),c);
const A=c.window.StockApps,ctx={ui:{},data:{},t:k=>k,lang:'en',locale:'en-US',now:new Date(2012,4,1)};
const html=A.render('latitude',ctx);
assert.match(html,/sa-maps6/);assert.match(html,/mp6-ic_menu_prev_normal\.png/);assert.match(html,/mp6-ic_menu_next_normal\.png/);assert.match(html,/>Latitude</);assert.doesNotMatch(html,/mp6-ic_menu_places/);
for(const [,src] of html.matchAll(/src="assets\/([^"]+)"/g))assert.ok(fs.existsSync('versions/4.0.4/assets/'+src),src);
assert.deepEqual([...A.menu('latitude',ctx).map(i=>i.title)],['Clear map','Directions','Layers','Settings','Help']);
assert.ok(A.menu('maps',{...ctx,ui:{mapsMenu:'switcher'}}).some(i=>i.id==='latitude'&&i.title==='Latitude — Find family & friends'));
assert.ok(A.render('latitude',{...ctx,lang:'hu',locale:'hu-HU'}).length>0);
console.log('ics-latitude ok');
