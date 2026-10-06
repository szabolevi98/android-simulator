const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Nexus 6 (LMY48Y) extra apps (audit step 4): toolbars and menus from the APKs.
const w={window:{}};vm.runInNewContext(fs.readFileSync('versions/5.1.1/stock-strings.js','utf8')+fs.readFileSync('versions/5.1.1/lp-extra-apps.js','utf8'),w);
const X=w.window.LPExtraApps,t=k=>k,files=[{id:'f1',name:'Trip plan',kind:'doc',date:'Nov 2',text:'x'}];
const r=(app,ui={})=>X.render(app,{ui,t,files,locale:'en'});
const docs=r('docs');
assert.ok(docs.includes('>Docs<')&&docs.includes('ed-editors_action_new.png')&&docs.includes('Modified: Nov 2')&&!docs.includes('lpx-fab'));
assert.equal(X.menu('docs',t,'en').map(i=>i.title).join(),'View as Grid,Sort by,Open document,Refresh');
assert.ok(r('sheets').includes('>Sheets<')&&r('slides').includes('>Slides<'));
const fit=r('fit');
assert.ok(!fit.includes('lpx-drawer')&&!fit.includes('Search')&&fit.includes('lpx-overflow'));
assert.equal(X.menu('fit',t,'en').map(i=>i.title).join(),'Add activity,Add your weight,Settings,Help & feedback');
const ns=r('newsstand',{lpxDrawer:true});
assert.ok(ns.includes('ns33-ic_drawer_readnow_selected.png')&&ns.includes('Bookmarks')&&!ns.includes('lpx-overflow'));
assert.ok(!r('wallet').includes('lpx-overflow')&&r('wallet').includes('lpx-fab'));
console.log('lp-extra-apps ok');
