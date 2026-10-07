const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Chrome settings and Clear browsing data (audit step 5): Chrome 27 (4.3), 32 (4.4.4) and 40 (5.1.1).
for(const [v,version,last,inBar] of [['4.3','27.0.1453.111','Developer tools',true],['4.4.4','32.0.1700.99','About Chrome',true],['5.1.1','40.0.2214.89','About Chrome',false]]){
  const w={window:{}};w.window.window=w.window;
  vm.runInNewContext(fs.readFileSync(`versions/${v}/stock-strings.js`,'utf8'),w);
  vm.runInNewContext(fs.readFileSync(`versions/${v}/chrome.js`,'utf8'),w);
  const C=w.window.ChromeApp,t=k=>k;
  const ctx=(ui={},data={})=>({ui:{browserIndex:0,browserHistory:[],...ui},data:{browserHistory:['example.com'],bookmarks:[],...data},t,locale:'en',url:C.NTP,page:()=>'',title:u=>u,tabs:[{url:C.NTP}],active:0});
  // The header list from the image's preference XML, Basics / Advanced.
  const main=C.render(ctx({sub:'chrome-settings'}));
  assert.match(main,/Basics[\s\S]*Search engine[\s\S]*Advanced[\s\S]*Privacy/);assert.ok(main.lastIndexOf(last)>main.indexOf('Privacy'),v);
  // Privacy: check boxes with summaries, the crash report list, Clear browsing data in the bar (27 / 32) or the overflow (40).
  const privacy=C.render(ctx({sub:'chrome-settings',chromePref:'privacy'}));
  assert.match(privacy,/Navigation error suggestions[\s\S]*chr-pref-check on/);assert.match(privacy,/Usage and crash reports[\s\S]*Never send/);
  assert.equal(/chr-pref-action" data-action="chrome-clear-open"/.test(privacy),inBar,v);
  if(!inBar)assert.match(C.render(ctx({sub:'chrome-settings',chromePref:'privacy',chromePrefMenu:true})),/role="menuitem" data-action="chrome-clear-open"/);
  assert.match(C.render(ctx({sub:'chrome-settings',chromePref:'privacy'},{chromePrefs:{navigation_error:false,crash:1}})),/Only send on Wi-Fi/);
  // The dialog: history, cache and cookies ticked; Clear disabled with nothing ticked; then the progress.
  const ticks=Object.fromEntries(Array.from(C.CLEAR_ITEMS).map(([k,,on])=>[k,on]));
  assert.deepEqual({...ticks},{history:true,cache:true,cookies:true,passwords:false,formdata:false});
  const dlg=C.render(ctx({sub:'chrome-settings',chromePref:'privacy',chromeClear:ticks}));
  assert.match(dlg,/Clear browsing data[\s\S]*Clear browsing history[\s\S]*Clear autofill data[\s\S]*chrome-clear-run"/);assert.doesNotMatch(dlg,/chrome-clear-run" disabled/);
  assert.match(C.render(ctx({sub:'chrome-settings',chromeClear:{}})),/chrome-clear-run" disabled/);
  assert.match(C.render(ctx({sub:'chrome-settings',chromeClear:{history:true,busy:true}})),/Clearing browsing data[\s\S]*Please wait(…|\.\.\.)/);
  // The history page's link opens the dialog; About Chrome shows the version.
  assert.match(C.render({...ctx(),url:C.HISTORY}),/chr-clear" data-action="chrome-clear-open"/);
  assert.match(C.render(ctx({sub:'chrome-settings',chromePref:'about'})),new RegExp(`Chrome ${version.replace(/\./g,'\\.')}`));
  assert.match(C.menu(ctx()),/data-action="chrome-settings"/);
  const sim=fs.readFileSync(`versions/${v}/simulator.js`,'utf8');
  for(const a of ['chrome-settings','chrome-pref','chrome-pref-toggle','chrome-list-pick','chrome-clear-open','chrome-clear-run'])assert.ok(sim.includes(`case '${a}'`),`${v} ${a}`);
}
console.log('chrome-settings ok');
