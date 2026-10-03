const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};
vm.runInNewContext(fs.readFileSync('versions/4.4.4/kk-wallpaper-picker.js','utf8'),context);
const W=context.window.KKWallpaperPicker;
const photos=[{id:1,name:'A'},{id:2,name:'B'},{id:3,name:'C'}];
const live=[{id:'galaxy',label:'Galaxy',thumb:'lw-galaxy_thumb.jpg'},{id:'grass',label:'Grass',thumb:'lw-grass_thumb.jpg'}];
const ctx=(wp={},saved=[])=>({data:{photos,kkSavedWallpapers:saved},ui:{wp},t:k=>k,image:p=>`photo-${p.id}.png`,live});
// Launcher3 4.4.4 strip order: Pick image, picked images, the default wallpaper, saved images, live wallpapers.
assert.deepEqual([...W.tiles(ctx({temp:[3]},[2])).map(t=>t.key)].join(),'photo:3,default,photo:2,live:galaxy,live:grass');
let html=W.render(ctx());
assert.match(html,/kwp-tile pick[^]*Pick image/);assert.match(html,/kwp-ic_images\.png/);assert.match(html,/photo-3\.png/);
assert.match(html,/kwp-ic_actionbar_accept\.png[^<]*>Set wallpaper/);assert.doesNotMatch(html,/selected"/);assert.doesNotMatch(html,/kwp-crop on/);
assert.match(html,/aria-label="Wallpaper 1 of 1"/);assert.match(html,/<span class="kwp-label">Galaxy<\/span>/);
// AOSP bundles no wallpapers: only the default and photos are nameless tiles.
assert.doesNotMatch(html,/jb-wallpaper_/);
// Selecting previews full screen; the selected tile gets the frame.
html=W.render(ctx({selected:'default'}));assert.match(html,/kwp-crop on[^>]*kk-default_wallpaper\.jpg/);assert.match(html,/kwp-tile default selected/);
// Picked and saved images are long-pressable; the CAB counts the checked tiles and offers Delete.
html=W.render(ctx({temp:[1],checked:['photo:1','photo:2']},[2]));assert.match(html,/data-kwp-long="1"/);assert.match(html,/<b>2 selected<\/b>/);assert.match(html,/kwp-delete/);assert.doesNotMatch(html,/kwp-set/);
// The strip hides after a tap on the preview.
assert.match(W.render(ctx({stripHidden:true})),/kwp-strip hidden/);
// DocumentsUI "Open from": Recent with the newest image first.
html=W.openFrom(ctx());assert.match(html,/kdu-ic_drawer_glyph\.png[^]*kdu-ic_root_recent\.png[^]*<h2>Recent<\/h2>/);assert.match(html,/data-action="kwp-picked" data-id="3"[^]*data-id="1"/);
console.log('kk-wallpaper-picker ok');
