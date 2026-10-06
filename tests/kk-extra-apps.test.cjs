const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Nexus 5 (KTU84P) extra launcher apps (audit step 4): drawers and menus from the APKs.
const w={window:{AndroidI18n:{language:'en',extend(){}}}};vm.runInNewContext(fs.readFileSync('versions/4.4.4/stock-strings.js','utf8')+fs.readFileSync('versions/4.4.4/kk-extra-apps.js','utf8'),w);
const X=w.window.KKExtraApps,t=k=>k,files=[];
const r=(app,ui={})=>X.render(app,{ui,t,files});
const ns=r('newsstand',{kkxDrawer:true});
assert.equal([...ns.matchAll(/<nav class="ns-drawer">(.*?)<\/nav>/g)].map(m=>[...m[1].matchAll(/>([^<]+)<\/button>/g)].map(x=>x[1]).join())[0],'Read Now,My News,My Magazines,Bookmarks,Explore');
assert.equal(X.menu('newsstand',t).map(i=>i.title).join(),'Settings,Help,On device only');
assert.ok(ns.includes('ns-ic_menu_search_holo_dark.png'));
assert.ok(r('wallet',{kkxDrawer:true}).includes('Send money'));
assert.ok(!r('quickoffice').includes('kkx-drawer'));
console.log('kk-extra-apps ok');
