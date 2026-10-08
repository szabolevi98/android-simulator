// Maps 6.x directions and Navigation's drive (versions/4.0.4 and 4.3 maps-route.js, from docs/maps6-route.template.js).
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
for(const v of ['4.0.4','4.3']){
  const context={window:{},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},Date};
  for(const f of ['stock-strings.js','maps-route.js'])vm.runInNewContext(fs.readFileSync(`versions/${v}/${f}`,'utf8'),context);
  const R=context.window.MapsRoute;
  const make=locale=>{const ui={view:'maps'},data={},nav=[];return {ui,data,nav,ctx:{ui,data,locale,t:k=>k,save(){},render(){},unsupported(){},navigate:r=>nav.push(r),bar:o=>`<header>${o.title}</header>`}};};
  // The input panel: fields, the four modes, the driving options and the Get directions bar.
  {const {ui,data,ctx}=make('en-US');R.handle('mr-open','',ctx);assert.equal(R.has(ui),true);
   const html=R.render(ctx);assert.match(html,/Get directions/);assert.equal((html.match(/class="mr-mode[ "]/g)||[]).length,4);assert.match(html,/Avoid highways/);assert.match(html,/Avoid tolls/);
   R.handle('mr-mode','walk',ctx);assert.doesNotMatch(R.render(ctx),/Avoid highways/);R.handle('mr-mode','drive',ctx);
   // Go: the list with distance, time and the da_step_* steps; avoiding highways goes round and says so.
   R.submit(new Map([['from','My Location'],['to','Central Library']]),ctx);assert.equal(ui.mapsRoute.screen,'list');
   let list=R.render(ctx);assert.match(list,/Head (north|south) on/);assert.match(list,/Your destination is on the right\./);assert.match(list,/ mi/);
   const plain=R.route(ctx,ui.mapsRoute);R.handle('mr-avoid','highways',ctx);const round=R.route(ctx,ui.mapsRoute);
   assert.ok(round.min>plain.min);assert.match(R.render(ctx),/Avoiding highways/);assert.match(R.route(ctx,ui.mapsRoute).steps[0].text,/Head (east|west) on/);
   // The map with the route and the banner; Navigation hands the route over; Back steps out.
   R.handle('mr-map','',ctx);assert.match(R.svg(ctx),/<path d="M180 300/);assert.match(R.banner(ctx),/Central Library/);
   R.handle('mr-navigate','',ctx);assert.equal(ctx.nav?.length??0,0);
  }
  {const {ui,nav,ctx}=make('hu-HU');R.open(ctx,'Könyvtár');R.submit(new Map([['to','Könyvtár']]),ctx);R.handle('mr-navigate','',ctx);
   assert.equal(nav[0].name,'Könyvtár');assert.match(R.render(ctx),/Menjen (északi|déli|keleti|nyugati|észak|dél|kelet|nyugat)/);
   // The drive: the turn, the step and the time left; arrival at the end.
   R.startNav(ctx,nav[0]);ui.navRun.progress=0;let html=R.nav({...ctx,mapSvg:''});assert.match(html,/mr-navtop/);assert.match(html,/perc/);
   ui.navRun.progress=1;assert.match(R.nav({...ctx,mapSvg:''}),/Megérkezett|megérkezett/);R.stopNav(ctx);assert.equal(ui.navRun,null);
   R.back(ctx);assert.equal(ui.mapsRoute.screen,'input');R.back(ctx);assert.equal(ui.mapsRoute,null);}
}
console.log('maps6-route ok');
