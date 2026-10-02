const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{devicePixelRatio:1},Intl,performance,document:{},Image:class{},requestAnimationFrame:()=>0,cancelAnimationFrame:()=>{}};
vm.runInNewContext(fs.readFileSync('versions/4.3/live-wallpapers.js','utf8'),context);
const lw=context.window.LiveWallpapers,plain=v=>JSON.parse(JSON.stringify(v));
assert.equal(fs.readFileSync('versions/4.0.4/live-wallpapers.js','utf8'),fs.readFileSync('versions/4.3/live-wallpapers.js','utf8'),'both versions share the file');
// packages/wallpapers/Basic services, sorted by label as LiveWallpaperListAdapter does with a Collator.
assert.deepEqual(plain(lw.sorted(k=>k,'en').map(s=>s.label)),['Galaxy','Grass','Nexus','Polar clock','Water']);
const hu={Galaxy:'Galaxis',Grass:'Fű','Polar clock':'Íves óra',Water:'Víz',Nexus:'Nexus'};
assert.deepEqual(plain(lw.sorted(k=>hu[k]||k,'hu').map(s=>hu[s.label])),['Fű','Galaxis','Íves óra','Nexus','Víz']);
assert.deepEqual(plain(lw.LIST.filter(s=>s.settings).map(s=>s.id)),['polar'],'only Polar clock has a settings activity');
assert.deepEqual(plain(lw.PALETTE_ORDER),['palette_gray','palette_white_c','palette_black_c','palette_matrix','palette_halloween','palette_violet','palette_oceanic','palette_zenburn']);
assert.equal(lw.PALETTES.palette_violet.minute,'#603050');
for(const id of lw.PALETTE_ORDER)assert.ok(lw.PALETTE_NAMES[id],id);
// Matrix4f.loadProjectionNormalized: x spans -1..1 at z = 0 in portrait, y spans ±h/w.
const {M}=lw,P=M.projectionNormalized(720,1280),apply=(m,[x,y,z])=>{const v=[0,0,0,0];for(let r=0;r<4;r++)v[r]=m[r]*x+m[4+r]*y+m[8+r]*z+m[12+r];return [v[0]/v[3],v[1]/v[3]];};
const [nx]=apply(P,[1,0,0]),[,ny]=apply(P,[0,1280/720,0]);
assert.ok(Math.abs(nx-1)<1e-6&&Math.abs(ny-1)<1e-6,`normalized projection ${nx} ${ny}`);
for(const v of ['4.0.4','4.3'])for(const f of ['lw-pyramid_background.png','lw-pulse.png','lw-glow.png','lw-space.jpg','lw-flares.png','lw-light1.jpg','lw-pond.jpg','lw-leaves.png','lw-night.jpg','lw-sky.jpg','lw-sunrise.jpg','lw-sunset.jpg','lw-galaxy_thumb.jpg','lw-polarclock_thumb.jpg'])assert.ok(fs.existsSync(`versions/${v}/assets/${f}`),`${v} ${f}`);
console.log('Live wallpaper checks passed: list order per locale, settings, palettes, projection and assets.');
