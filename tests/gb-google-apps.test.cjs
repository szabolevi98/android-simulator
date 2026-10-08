const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Nexus S: News & Weather, Books, Earth and Voice Search (gb-google-apps.js) on GBApps.
const w={setTimeout,clearTimeout,requestAnimationFrame:()=>0,cancelAnimationFrame(){}};w.window=w;w.document={addEventListener(){}};
for(const f of ['gb-apps.js','news-prefs.js','gb-google-apps.js'])vm.runInNewContext(fs.readFileSync(`versions/2.3.6/${f}`,'utf8'),w);
const {GBApps,GBGoogleApps:G}=w;
for(const id of ['news-weather','books','earth','voice-search'])assert.ok(GBApps.has(id),id);
const ui={},data={},opened=[],ctx={ui,data,view:'news-weather',lang:'en',locale:'en-US',now:new Date(2011,6,20),t:k=>k,contacts:[{id:1,name:'Alex',phone:'202-555-0148'}],root:{querySelector:()=>null},save(){},render(){},renderOverlay(){},toast(){},dialog(k){ui.dlg=k;},focus(){},openApp(a){opened.push(a);},browse(u){opened.push(u);},call(n){opened.push('call:'+n);},home(){opened.push('home');}};
const m=GBApps.get('news-weather');m.open(ctx,false);
let html=m.render(ctx);assert.ok(html.includes('Mountain View, CA')&&html.includes('72°')&&html.includes('nw-ic_weather_partly_cloudy_xl'));
ctx.lang='hu';assert.ok(m.render(ctx).includes('22°')&&m.render(ctx).includes('Időjárás'),'metric and the image texts');ctx.lang='en';
m.handle('nw-tab','Technology',ctx);assert.ok(m.render(ctx).includes('Phones with NFC chips'));m.handle('nw-story','0',ctx);assert.ok(m.render(ctx).includes('nw-article'));assert.ok(m.back(ctx));
ctx.view='books';m.open(ctx,false);html=m.render(ctx);assert.ok(html.includes('Google <b>eBooks</b>')&&html.includes('Pride and Prejudice'));
m.handle('bk-open','b2',ctx);m.handle('bk-page','1',ctx);html=m.render(ctx);assert.ok(html.includes('It is a truth universally acknowledged')&&html.includes('page 2 of 6'));
assert.equal(G.T('hu','My eBooks'),'E-könyveim');
ctx.view='voice-search';m.open(ctx,false);html=m.render(ctx);assert.ok(html.includes('Speak now')&&html.includes('vs-vs_dialog_red')===false&&html.includes('vs-mic'));
m.handle('vs-help',null,ctx);assert.ok(m.render(ctx).includes('send text to john smith'));
m.handle('vs-do','navigate_to',ctx);assert.equal(opened.at(-1),'navigation');m.handle('vs-do','call_contact',ctx);assert.equal(opened.at(-1),'call:202-555-0148');
ctx.lang='de';ui.vsState='help';assert.ok(m.render(ctx).includes('fahrtroute zum brandenburg tor'));
console.log('gb-google-apps ok');
