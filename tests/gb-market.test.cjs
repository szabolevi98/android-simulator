require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};
for(const f of ['play-store.js','gb-market.js'])vm.runInNewContext(fs.readFileSync(`versions/2.3.6/${f}`,'utf8'),context);
const G=context.window.GBMarket;
const ctx=(o={})=>({lang:'en',locale:'en-US',page:'home',installed:[],downloading:'',phase:'',progress:0,plussed:[],autoUpdate:[],prefs:{notify:true,pin:false},rated:{},searching:false,editValue:'',history:[],...o});
// Market 2.3.4 is the GRK39F image's Vending.apk; texts from its resources in five languages.
assert.equal(G.VERSION,'2.3.4');
assert.equal(G.text('en','Allow apps rated'),'Allow apps rated');assert.notEqual(G.text('hu','My apps'),'My apps');
// Home (home_activity): the velvet arc, the carousel and the Apps / Games / My apps navigation, then Featured.
let html=G.render(ctx());
assert.match(html,/Android Market/);assert.match(html,/data-action="gbmk-carousel" data-id="1"/);
for(const id of ['apps','games'])assert.match(html,new RegExp(`data-action="gbmk-section" data-id="${id}"`));
assert.match(html,/data-action="gbmk-my-apps"/);assert.match(html,/Featured/);assert.doesNotMatch(html,/Books|Movies/);
// A section lists its categories; a category has the Top paid / Top free / Just in tabs.
html=G.render(ctx({page:'section',section:'apps'}));assert.match(html,/data-action="gbmk-category" data-id="apps:Tools"/);assert.match(html,/Productivity/);
html=G.render(ctx({page:'category',category:'apps:Tools',tab:'Top free'}));
for(const tab of ['Top paid','Top free','Just in'])assert.match(html,new RegExp(`data-action="gbmk-tab" data-id="${tab}"`));
// Details (AssetInfoActivity): Install, Description, permissions, Reviews, Related; installed apps get Open / Uninstall / Rate it!
html=G.render(ctx({page:'detail',selected:'orbit'}));
assert.match(html,/data-action="gbmk-buy" data-id="orbit"/);assert.match(html,/Allow this application to access:/);assert.match(html,/Reviews/);assert.match(html,/Related/);
assert.ok(html.indexOf('Description')<html.indexOf('Reviews'));
html=G.render(ctx({page:'detail',selected:'orbit',installed:['orbit']}));
assert.match(html,/data-action="gbmk-open" data-id="orbit"/);assert.match(html,/data-action="gbmk-uninstall-page" data-id="orbit"/);assert.match(html,/Rate it!/);assert.match(html,/Allow automatic updating/);
// Permissions page (OK / Cancel) and the uninstall reasons.
html=G.render(ctx({page:'permissions',selected:'orbit'}));assert.match(html,/data-action="gbmk-accept" data-id="orbit"/);assert.match(html,/Network communication/);
html=G.render(ctx({page:'uninstall',selected:'orbit',reason:4}));assert.match(html,/Please tell us why you removed this item:/);assert.equal((html.match(/data-action="gbmk-reason"/g)||[]).length,5);
// My apps, search, settings (Content filtering with the lock, Notifications).
assert.match(G.render(ctx({page:'my-apps',installed:['orbit']})),/Orbit Hopper/);
assert.match(G.render(ctx({page:'search',query:'golf'})),/Lunar Golf/);
html=G.render(ctx({page:'settings'}));assert.match(html,/Content filtering/);assert.match(html,/gbmk-lock/);assert.match(html,/data-action="gbmk-notify"/);
// The menu (res/menu): Search, My apps, Settings, Help; details add Home and Security, rated owned apps Clear my review.
assert.deepEqual([...G.menu(ctx()).map(i=>i.title)],['Search','My apps','Settings','Help']);
assert.deepEqual([...G.menu(ctx({page:'detail',selected:'orbit',installed:['orbit'],rated:{orbit:4}})).map(i=>i.action)].slice(4),['gbmk-home','gbmk-security','gbmk-clear-review']);
assert.equal(G.menu(ctx({page:'permissions'})).length,0);
// Dialogs.
assert.match(G.dialog('rate',ctx({selected:'orbit'})).custom,/gbmk-rate-pick/);
assert.equal(G.dialog('notify',ctx()).items.length,2);assert.equal(G.dialog('filter',ctx()).items.length,5);
for(const lang of ['hu','de','fr','es'])for(const page of ['home','settings','detail','my-apps','uninstall'])assert.doesNotMatch(G.render(ctx({lang,page,selected:'orbit'})),/undefined|NaN/);
console.log('gb-market ok');
