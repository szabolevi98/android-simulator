require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};
vm.runInNewContext(fs.readFileSync('versions/5.1.1/lp-wallpaper-picker.js','utf8'),context);
const W=context.window.KKWallpaperPicker;
const photos=[{id:1,name:'A'},{id:2,name:'B'},{id:3,name:'C'}];
const ctx=(ui={})=>({data:{photos,kkSavedWallpapers:[]},ui,t:k=>k,image:p=>`photo-${p.id}.png`,bundled:[]});
// Pick image answers with Lollipop's DocumentsUI (GET_CONTENT, Recent root): the hamburger and the root title in the
// Toolbar, only the overflow (Search and Sort by need a directory), and the newest image first, in grid mode.
let html=W.openFrom(ctx());
assert.match(html,/class="app-view ldu-app kwp-open"/);
assert.match(html,/ldu-ic_hamburger\.png[^]*<h2>Recent<\/h2>[^]*data-action="kwp-open-menu"[^]*ldu-ic_menu_overflow\.png/);
assert.doesNotMatch(html,/kdu-|ldu-search|data-id="sort"/);
assert.match(html,/class="ldu-grid"><button class="ldu-cell kwp-doc" data-action="kwp-picked" data-id="3"[^]*data-id="1"/);
assert.match(W.openFrom(ctx({pickList:true})),/class="ldu-list"><button class="ldu-item kwp-doc"/);
assert.match(W.openFrom({...ctx(),data:{photos:[]}}),/ldu-empty">No items/);
// The overflow in menu/activity.xml order; the toggles turn into Hide once on.
assert.deepEqual([...W.openFromMenu({},k=>k).matchAll(/role="menuitem"[^>]*>([^<]+)/g)].map(m=>m[1]),['List view','Show internal storage','Show file size']);
assert.deepEqual([...W.openFromMenu({pickList:true,pickAdvanced:true,pickSize:true},k=>k).matchAll(/role="menuitem"[^>]*>([^<]+)/g)].map(m=>m[1]),['Grid view','Hide internal storage','Hide file size']);
for(const f of ['ldu-ic_hamburger.png','ldu-ic_menu_overflow.png'])assert.ok(fs.existsSync('versions/5.1.1/assets/'+f),f);
console.log('lp-wallpaper-picker ok');
