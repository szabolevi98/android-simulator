const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};
vm.runInNewContext(fs.readFileSync('versions/4.4.4/kk-wallpaper-picker.js','utf8'),context);
const W=context.window.KKWallpaperPicker;
const photos=[{id:1,name:'A'},{id:2,name:'B'},{id:3,name:'C'}];
// The Nexus 5 KTU84P image: GoogleHome's R.array.wallpapers and Sun Beam, its only live wallpaper.
const bundled=['wallpaper_15','wallpaper_16'],live=[{id:'sunbeam',label:'Sun Beam',thumb:'lw-sunbeam_thumb.png'}];
const ctx=(wp={},saved=[])=>({data:{photos,kkSavedWallpapers:saved},ui:{wp},t:k=>k,image:p=>`photo-${p.id}.png`,bundled,live});
// Launcher3 4.4.4 strip order: Pick image, picked images, the default wallpaper, the bundled ones, saved images, live wallpapers.
assert.deepEqual([...W.tiles(ctx({temp:[3]},[2])).map(t=>t.key)].join(),'photo:3,default,wp:1,wp:2,photo:2,live:sunbeam');
let html=W.render(ctx());
assert.match(html,/kwp-tile pick[^]*Pick image/);assert.match(html,/kwp-ic_images\.png/);assert.match(html,/photo-3\.png/);
assert.match(html,/kwp-ic_actionbar_accept\.png[^<]*>Set wallpaper/);assert.doesNotMatch(html,/selected"/);assert.doesNotMatch(html,/kwp-crop on/);
assert.match(html,/aria-label="Wallpaper 1 of 3"/);assert.match(html,/<span class="kwp-label">Sun Beam<\/span>/);
// Bundled tiles show their _small thumbnail and preview the full image.
assert.match(html,/gh-wallpaper_15_small\.jpg/);assert.match(W.render(ctx({selected:'wp:2'})),/kwp-crop on[^>]*gh-wallpaper_16\.jpg/);
// Selecting previews full screen; the selected tile gets the frame.
html=W.render(ctx({selected:'default'}));assert.match(html,/kwp-crop on[^>]*kk-default_wallpaper\.jpg/);assert.match(html,/kwp-tile default selected/);
// Picked and saved images are long-pressable; the CAB counts the checked tiles and offers Delete.
html=W.render(ctx({temp:[1],checked:['photo:1','photo:2']},[2]));assert.match(html,/data-kwp-long="1"/);assert.match(html,/<b>2 selected<\/b>/);assert.match(html,/kwp-delete/);assert.doesNotMatch(html,/kwp-set/);
// The strip hides after a tap on the preview.
assert.match(W.render(ctx({stripHidden:true})),/kwp-strip hidden/);
// DocumentsUI "Open from": Recent with the newest image first.
html=W.openFrom(ctx());assert.match(html,/kdu-ic_drawer_glyph\.png[^]*kdu-ic_root_recent\.png[^]*<h2>Recent<\/h2>/);assert.match(html,/data-action="kwp-picked" data-id="3"[^]*data-id="1"/);
// live-wallpapers.js registers Sun Beam alone; its background is SunBeam.apk's bgmesh.csv (34 triangles of x, y, r, g, b).
const lw={window:{}};vm.runInNewContext(fs.readFileSync('versions/4.4.4/live-wallpapers.js','utf8'),lw);
assert.equal(lw.window.LiveWallpapers.LIST.map(w=>w.id).join(),'sunbeam');
const mesh=fs.readFileSync('versions/4.4.4/live-wallpapers.js','utf8').match(/BG_MESH = \[([^\]]*)\]/)[1].split(',').filter(v=>v.trim());
assert.equal(mesh.length,34*3*5);
for(const f of ['lw-sunbeam-dot.png','lw-sunbeam-beam.png','lw-sunbeam_thumb.png','gh-wallpaper_15.jpg','gh-wallpaper_51_small.jpg'])assert.ok(fs.existsSync('versions/4.4.4/assets/'+f),f);
console.log('kk-wallpaper-picker ok');
