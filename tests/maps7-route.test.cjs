// Maps 7.5 / 9.3 directions and navigation (versions/4.4.4 and 5.1.1 maps-route.js, from docs/maps7-route.template.js).
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
for(const v of ['4.4.4','5.1.1']){
  const context={window:{},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},Date};
  for(const f of ['stock-strings.js','maps-route.js'])vm.runInNewContext(fs.readFileSync(`versions/${v}/${f}`,'utf8'),context);
  const R=context.window.MapsRoute,lp=v==='5.1.1';
  const make=locale=>{const ui={view:'maps'},data={};return {ui,data,ctx:{ui,data,locale,t:k=>k,save(){},render(){},unsupported(){},mapSvg:'<rect width="360" height="600"/>'}};};
  {const {ui,data,ctx}=make('en-US');R.handle('mr-open','',ctx);assert.equal(R.has(ui),true);
   let html=R.render(ctx);assert.match(html,/Choose destination/);assert.match(html,lp?/Your location/:/My Location/);assert.equal((html.match(/class="m7r-mode[ "]/g)||[]).length,4);assert.match(html,/Route options/);
   R.submit(new Map([['from','My Location'],['to','Central Library']]),ctx);html=R.render(ctx);assert.match(html,/minutes/);assert.match(html,/Start navigation/i);assert.match(html,/Via |via /);
   // Route options: highways and tolls (and ferries on 9.3); the choice lengthens the route and shows in the row.
   const before=R.route(ctx,ui.mapsRoute);R.handle('mr-options','',ctx);assert.match(R.render(ctx),lp?/Avoid ferries/:/Route Options/);
   R.handle('mr-options-toggle','highways',ctx);R.handle('mr-options-done','',ctx);assert.equal(data.mapsAvoid.highways,true);
   assert.ok(R.route(ctx,ui.mapsRoute).min>before.min);assert.match(R.render(ctx),/m7r-option[^>]*><img[^>]*><span>Avoid highways/);
   // The step list, then the drive with the next turn, the time left and Close navigation.
   R.handle('mr-details','',ctx);html=R.render(ctx);assert.match(html,/Head (east|west) on/);assert.match(html,/Your destination is on the right\./);
   R.handle('mr-navigate','',ctx);assert.ok(ui.navRun);ui.navRun.progress=0;html=R.nav(ctx);assert.match(html,/Turn (left|right) onto/);assert.match(html,/to destination/);
   ui.navRun.progress=1;assert.match(R.nav(ctx),/You have arrived\./);R.handle('mr-nav-close','',ctx);assert.equal(ui.navRun,null);
   R.back(ctx);assert.equal(ui.mapsRoute.screen,'start');R.back(ctx);assert.equal(ui.mapsRoute,null);}
  {const {ui,ctx}=make('hu-HU');R.open(ctx,'Könyvtár');assert.match(R.render(ctx),/perc/);}
}
console.log('maps7-route ok');
