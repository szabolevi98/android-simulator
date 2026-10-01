const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},document:{}};vm.createContext(context);
for(const f of ['jb-keyguard.js','jb-recents.js','jb-search.js'])vm.runInContext(fs.readFileSync(`versions/4.3/${f}`,'utf8'),context);
const rec=context.window.JBRecents,search=context.window.JBSearchPanel,t=k=>k;
// RecentsPanelView values: 35dp icon/label slide, 250 ms with a 150 ms delay; 500 ms long press.
assert.ok(Math.abs(rec.R.iconShift-31.5)<1e-9);assert.equal(rec.R.iconDuration,250);assert.equal(rec.R.iconDelay,150);assert.equal(rec.R.window,250);assert.equal(rec.R.longPress,500);
const names={settings:'Settings',messaging:'Messaging'},icon=id=>`<i>${id}</i>`;
assert.ok(rec.render([],{names,icon,snapshots:{},t}).includes('No recent apps'));
const html=rec.render(['settings','messaging'],{names,icon,snapshots:{settings:'<b>shot</b>'},popup:{id:'messaging',x:10,y:20},t});
assert.ok(html.indexOf('data-app="messaging"')<html.indexOf('data-app="settings"'),'newest task last (at the bottom)');
assert.ok(html.includes('<b>shot</b>')&&html.includes('data-action="remove-recent" data-id="messaging"')&&html.includes('data-action="recent-app-info"')&&html.includes('jb-recents'));
// SearchPanelView: 40dp swipe threshold, 170dp ring centred on the home key, single target straight above it.
assert.ok(Math.abs(search.S.up-36)<1e-9&&Math.abs(search.S.ring-153)<1e-9&&Math.abs(search.S.snap-36)<1e-9);
const geo=search.geometry(360,600,180);assert.deepEqual(JSON.parse(JSON.stringify(geo.target)),{x:180,y:447});
assert.equal(search.snapped(geo,180,450),true);assert.equal(search.snapped(geo,180,560),false);assert.equal(search.snapped(geo,60,447),false);
assert.ok(search.markup(t).includes('jb-ic_action_assist_generic_normal')&&search.markup(t).includes('data-jb-search-launch'));
console.log('JB recents and search panel checks passed: slide-in timing, list order, popup, ring geometry and snapping.');
