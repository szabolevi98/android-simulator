const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Nexus 6 (LMY48Y) extra apps (audit step 4): toolbars and menus from the APKs.
const w={window:{}};vm.runInNewContext(fs.readFileSync('versions/5.1.1/stock-strings.js','utf8')+fs.readFileSync('versions/5.1.1/lp-extra-apps.js','utf8'),w);
const X=w.window.LPExtraApps,t=k=>k,files=[{id:'f1',name:'Trip plan',kind:'doc',date:'Nov 2',text:'x'}];
const r=(app,ui={})=>X.render(app,{ui,t,files,locale:'en'});
const docs=r('docs');
assert.ok(docs.includes('>Docs<')&&docs.includes('ed-editors_action_new.png')&&docs.includes('Modified: Nov 2')&&!docs.includes('lpx-fab'));
assert.equal(X.menu('docs',t,'en').map(i=>i.title).join(),'View as Grid,Sort by,Open document,Refresh');
assert.ok(r('sheets').includes('>Sheets<')&&r('slides').includes('>Slides<'));
// Fit 1.51 (audit step 9): the TimelineFragment header and today's sessions, ICU plurals from the APK.
const fit=r('fit');
assert.ok(!fit.includes('lpx-drawer')&&!fit.includes('Search')&&fit.includes('lpx-overflow')&&fit.includes('fit-ic_overflow_dark.png'));
assert.ok(fit.includes('<b>14</b><br>min')&&fit.includes('<b>18</b> min<br>today')&&fit.includes('12 min to goal')&&fit.includes('At the halfway mark'));
assert.ok(fit.includes('9 min walking')&&fit.includes('4 min biking')&&fit.includes('fit-ic_biking.png')&&!fit.includes('fit-ic_running.png'));
const fitHu=X.render('fit',{ui:{},t,files,locale:'hu'});
assert.ok(fitHu.includes('<b>18</b> perc<br>ma')&&fitHu.includes('12 perc a célig')&&fitHu.includes('Félúton jár')&&fitHu.includes('9 perc gyaloglás'));
assert.equal(X.icu('{count, plural, =1 {1 min} other {# min}}',{count:1},'en'),'1 min');
assert.equal(X.icu('{count,plural, =1{1 min}one{# min}other{# min}}',{count:1200},'fr'),'1 200 min');
assert.equal(X.menu('fit',t,'en').map(i=>i.title).join(),'Add activity,Add your weight,Settings,Help & feedback');
const ns=r('newsstand',{lpxDrawer:true});
assert.ok(ns.includes('ns33-ic_drawer_readnow_selected.png')&&ns.includes('Bookmarks')&&!ns.includes('lpx-overflow'));
// Wallet 8.0 (audit step 9): WarmWelcomeActivity's splash, then three pages, Done on the last.
const wal=r('wallet');
assert.ok(wal.includes('wal-splash')&&wal.includes('Welcome to Google Wallet, an easier way to pay')&&wal.includes('Pay in stores')&&wal.includes('data-action="wal-next"')&&!wal.includes('lpx-fab'));
const wal3=r('wallet',{walPage:2});
assert.ok(!wal3.includes('wal-splash')&&wal3.includes('Carry less, save more')&&wal3.includes('>Done<')&&!wal3.includes('wal-next')&&wal3.includes('background:#1ca8f4'));
assert.ok(X.render('wallet',{ui:{walPage:1},t,files,locale:'de'}).includes('Kostenlos Geld senden'));
assert.equal(X.walletStatus({walPage:0}),'#966a0e');
console.log('lp-extra-apps ok');
