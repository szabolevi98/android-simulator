const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};
for(const f of ['gb-strings-browser.js','gb-browser.js'])vm.runInNewContext(fs.readFileSync(`versions/2.3.6/${f}`,'utf8'),context);
const G=context.window.GBBrowser;
const ctx=(o={})=>({lang:'en',t:k=>k,sub:'',url:'www.google.com',title:'Google',loading:false,editing:false,editValue:'',find:undefined,bookmarks:['www.android.com'],history:['www.google.com','www.android.com','www.google.com'],titleOf:u=>u.replace(/^www\./,''),thumbnail:u=>`<form><button>${u}</button></form>`,tabs:['www.google.com'],active:0,canForward:false,listView:false,target:'www.android.com',ok:'OK',cancel:'Cancel',...o});
// TitleBar: favicon and title with the bookmarks button; loading shows the address, the progress bar and stop.
let html=G.render(ctx(),'<p>page</p>');
assert.match(html,/gbbr-titlebar"><div class="gbbr-progress" hidden>/);assert.match(html,/<span>Google<\/span><\/button><button class="gbbr-rt" data-action="browser-bookmarks"/);
html=G.render(ctx({loading:true}),'');
assert.match(html,/gbbr-titlebar gbbr-loading"><div class="gbbr-progress">/);assert.match(html,/<span>www\.google\.com<\/span>/);assert.match(html,/gbbr-stop" data-action="gbbr-stop"/);
// Search dialog and suggestions from bookmarks first, then history, without duplicates.
html=G.render(ctx({editing:true,editValue:'android'}),'');
assert.match(html,/gbbr-search" data-form="address"/);assert.match(html,/value="android"/);
assert.equal((G.suggestions(ctx({editValue:'o'})).match(/gbbr-suggestion/g)||[]).length,2);
assert.match(G.suggestions(ctx({editValue:'android'})),/ic_search_category_bookmark/);assert.equal(G.suggestions(ctx({editValue:'www.google.com'})),'');
// Find bar.
assert.match(G.render(ctx({find:'x'}),''),/gbbr-find" data-form="browser-find".*value="x"/);
// Bookmarks grid: div cells (thumbnails contain forms and buttons), the Add holder first; list view and history rows.
html=G.render(ctx({sub:'bookmarks'}),'');
assert.match(html,/<div class="gbbr-bm" role="button" tabindex="0" data-action="gbbr-add-bookmark">/);assert.match(html,/<b>Add<\/b>/);assert.match(html,/data-gbbr-item="bookmark"/);assert.doesNotMatch(html,/<button class="gbbr-bm"/);
assert.match(G.render(ctx({sub:'bookmarks',listView:true}),''),/gbbr-item-main" data-action="browser-bookmark" data-id="www\.android\.com"/);
html=G.render(ctx({sub:'history'}),'');
assert.equal((html.match(/gbbr-item"/g)||[]).length,2);assert.match(html,/gbbr-group">Today/);assert.match(html,/btn_star_big_on/);assert.match(html,/btn_star_big_off/);
html=G.render(ctx({sub:'mostvisited'}),'');assert.ok(html.indexOf('google.com')<html.indexOf('android.com'));
assert.match(G.render(ctx({sub:'history',history:[]}),''),/gbbr-empty/);
// Windows: New window until MAX_TABS (8).
assert.match(G.render(ctx({sub:'tabs'}),''),/gb-titlebar">Windows<.*gbbr-wnew/);
assert.doesNotMatch(G.render(ctx({sub:'tabs',tabs:Array(8).fill('www.google.com')}),''),/gbbr-wnew/);
// Menus.
assert.deepEqual([...G.menu(ctx()).map(i=>i.title)].slice(0,6),['New window','Bookmarks','Windows','Refresh','Forward','Add bookmark']);
assert.equal(G.menu(ctx({loading:true}))[3].action,'gbbr-stop');assert.equal(G.menu(ctx())[4].disabled,true);
assert.deepEqual([...G.menu(ctx({sub:'bookmarks'})).map(i=>i.action)],['gbbr-add-bookmark','gbbr-switch-view']);
assert.equal(G.menu(ctx({sub:'history',history:[]})).length,0);
// Dialogs.
assert.match(G.dialog('add',ctx()).custom,/data-gbbr-location maxlength="200" value="www\.google\.com"/);
assert.equal(G.dialog('bookmark',ctx()).items.length,5);
assert.equal(G.dialog('history',ctx()).items.some(i=>i.action==='gbbr-star'),false);
assert.equal(G.dialog('history',ctx({target:'www.google.com'})).items.some(i=>i.action==='gbbr-star'),true);
// Five languages.
assert.equal(G.text('hu','active_tabs'),'Ablakok');assert.equal(G.text('de','new_tab'),'Neues Fenster');
console.log('gb-browser ok');
