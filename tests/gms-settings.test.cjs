const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Google Settings' GMS pages (4.3 PrebuiltGmsCore 3.1.58): Ads, Verify apps, Connected apps, Google location settings.
const dir='versions/4.3/',html=fs.readFileSync(dir+'index.html','utf8');
assert.ok(html.indexOf('gms-settings.js')<html.indexOf('stock-apps.js')&&html.includes('gms-settings.css'));
const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync(dir+'gms-settings.js','utf8'),c);
const G=c.window.GMSSettings,g=k=>k,t=k=>k,page=(sub,data={},ui={})=>G.render({ui:{sub,...ui},data,t},g);
assert.ok(page('gms-ads').includes('Personalize Google Ads in Apps')&&page('gms-ads').includes('gms-check on'));
assert.ok(page('gms-verify').includes('Verify apps summary'));
assert.ok(page('gms-apps').includes('jellybean.demo@gmail.com')&&page('gms-apps').includes('Apps empty'));
const loc=page('gms-location');assert.ok(loc.includes('Access location')&&loc.includes('JELLYBEAN')===false&&loc.includes('gms-cat')&&loc.includes('>Off<'));
assert.ok(page('gms-location',{gms:{access:false}}).includes('gms-catbody off'));
const hist=page('gms-history',{gms:{history:true}},{gmsDialog:'delete'});assert.ok(hist.includes('gms-switch on')&&hist.includes('DELETE LOCATION HISTORY')&&hist.includes('Permanently delete?')&&hist.includes('disabled>Delete'));
const ui={sub:'gms-history',gmsDialog:'delete'};assert.ok(G.back(ui)&&!ui.gmsDialog);assert.ok(G.back(ui)&&ui.sub==='gms-location');assert.ok(G.back(ui)&&ui.sub==='');assert.ok(!G.back(ui));
assert.ok(fs.readFileSync(dir+'stock-apps.js','utf8').includes("['Ads', 'gms-open', 'ads']"));
console.log('gms-settings ok');
