const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Nexus 6: Chrome 40.0.2214.89 (Chrome.apk of LMY48Y): menu, native New Tab page, incognito page.
const context={window:{}};for(const f of ['stock-strings.js','chrome.js'])vm.runInNewContext(fs.readFileSync(`versions/5.1.1/${f}`,'utf8'),context);
const C=context.window.ChromeApp,t=k=>k;
const data={browserHistory:['www.google.com','news.example'],bookmarks:['www.google.com']};
const base={data,t,locale:'en',page:url=>`<p>${url}</p>`,title:url=>url,tabs:[{url:'chrome://newtab'}],active:0};
const ntp=C.render({...base,ui:{},url:C.NTP});
assert.ok(/chr-tile-title[^]*chr-tile-thumb/.test(ntp),'the tile title is above the thumbnail');
assert.ok(!/<svg/.test(ntp)&&ntp.includes('chr40-btn_menu'));
const inc=C.render({...base,ui:{},url:C.NTP,incognito:true,locale:'hu'});
assert.ok(inc.includes('Ön inkognitómódra váltott.')&&inc.includes('chr40-learn')&&!inc.includes('chr40-ntp-bar'));
const labels=m=>[...m.matchAll(/<span>([^<]+)<\/span>/g)].map(x=>x[1]);
let menu=C.menu({ui:{browserIndex:0,browserHistory:['a']},data,t,locale:'en',url:'news.example'});
assert.deepEqual(labels(menu),['New tab','New incognito tab','Bookmarks','Recent tabs','History','Share…','Print…','Find in page','Add to homescreen','Request desktop site','Settings','Help &amp; feedback']);
assert.equal((menu.match(/chr40-menu-icons[^]*?<\/div>/)[0].match(/<button/g)||[]).length,3,'three_button_menu_item: forward, bookmark, refresh');
menu=C.menu({ui:{browserIndex:0,browserHistory:['a']},data,t,locale:'en',url:C.NTP,incognito:true});
assert.deepEqual(labels(menu),['New tab','New incognito tab','Bookmarks','History','Settings','Help &amp; feedback']);
assert.ok(!fs.readFileSync('versions/5.1.1/chrome.js','utf8').includes('<svg'),'no hand-drawn icons');
console.log('lp-chrome ok');
