const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{devicePixelRatio:1},Intl,performance,document:{},Image:class{},requestAnimationFrame:()=>0,cancelAnimationFrame:()=>{}};
vm.runInNewContext(fs.readFileSync('versions/4.3/live-wallpapers.js','utf8'),context);
const lw=context.window.LiveWallpapers,plain=v=>JSON.parse(JSON.stringify(v));
// The two copies differ only in Phase Beam's label: IMM76I's PhaseBeam.apk has no translations (raw), JWR66Y's has.
assert.equal(fs.readFileSync('versions/4.0.4/live-wallpapers.js','utf8').replaceAll(', gl: true, raw: true}',', gl: true}'),fs.readFileSync('versions/4.3/live-wallpapers.js','utf8'),'both versions share the file');
// packages/wallpapers/Basic services, sorted by label as LiveWallpaperListAdapter does with a Collator.
assert.deepEqual(plain(lw.sorted(k=>k,'en').map(s=>s.label)),['Bubbles','Galaxy','Grass','Holo Spiral','Many','Nexus','Phase Beam','Polar clock','Spectrum','VU meter','Water','Waveform']);
// Phase Beam, the Galaxy Nexus and Nexus 4 default (default_wallpaper_component), with its image's mesh and textures.
const pb=fs.readFileSync('versions/4.3/live-wallpapers.js','utf8');assert.ok(pb.includes('interval: 66')&&pb.includes('gl.blendFunc(gl.SRC_ALPHA, gl.ONE)'));
for(const v of ['4.0.4','4.3']){for(const f of ['dot','beam','thumb'])assert.ok(fs.existsSync(`versions/${v}/assets/lw-phasebeam_${f}.png`),v+f);assert.ok(fs.readFileSync(`versions/${v}/simulator.js`,'utf8').includes("liveWallpaper: { id: 'phasebeam' }"),v);}
assert.equal(lw.labelOf(lw.find('phasebeam'),k=>k==='Phase Beam'?'Elmosódott cseppek':k),'Elmosódott cseppek');
// AudioCapture: silence returns zero samples, then nothing after MAX_IDLE_TIME_MS; music yields centred 8-bit PCM.
let playing=false;const cap=lw.audioCapture(()=>playing);
assert.equal(cap.pcm(16).length,16);assert.ok(cap.pcm(16).every(v=>v===0));
playing=true;const pcm=cap.pcm(1024);assert.equal(pcm.length,1024);assert.ok(pcm.some(v=>v!==0)&&pcm.every(v=>v>=-128&&v<=127));
assert.equal(cap.fft(512).length,512);
// Visualization4RS needle: at rest it parks at 131°, a loud signal swings it toward the peak.
const needle=lw.needleModel();needle.step([]);assert.equal(needle.angle,131);for(let i=0;i<40;i++)needle.step(new Array(64).fill(50000));assert.ok(needle.angle<131);
const hu={Galaxy:'Galaxis',Grass:'Fű','Polar clock':'Íves óra',Water:'Víz',Nexus:'Nexus',Waveform:'Hullám',Spectrum:'Spektrum','VU meter':'Kivezérlésjelző',Many:'Sok','Phase Beam':'Elmosódott cseppek','Holo Spiral':'Holografikus spirál',Bubbles:'Buborékok'};
assert.deepEqual(plain(lw.sorted(k=>hu[k]||k,'hu').map(s=>hu[s.label])),['Buborékok','Elmosódott cseppek','Fű','Galaxis','Holografikus spirál','Hullám','Íves óra','Kivezérlésjelző','Nexus','Sok','Spektrum','Víz']);
assert.deepEqual(plain(lw.LIST.filter(s=>s.settings).map(s=>s.id)),['polar'],'only Polar clock has a settings activity');
assert.deepEqual(plain(lw.PALETTE_ORDER),['palette_gray','palette_white_c','palette_black_c','palette_matrix','palette_halloween','palette_violet','palette_oceanic','palette_zenburn']);
assert.equal(lw.PALETTES.palette_violet.minute,'#603050');
for(const id of lw.PALETTE_ORDER)assert.ok(lw.PALETTE_NAMES[id],id);
// Matrix4f.loadProjectionNormalized: x spans -1..1 at z = 0 in portrait, y spans ±h/w.
const {M}=lw,P=M.projectionNormalized(720,1280),apply=(m,[x,y,z])=>{const v=[0,0,0,0];for(let r=0;r<4;r++)v[r]=m[r]*x+m[4+r]*y+m[8+r]*z+m[12+r];return [v[0]/v[3],v[1]/v[3]];};
const [nx]=apply(P,[1,0,0]),[,ny]=apply(P,[0,1280/720,0]);
assert.ok(Math.abs(nx-1)<1e-6&&Math.abs(ny-1)<1e-6,`normalized projection ${nx} ${ny}`);
for(const v of ['4.0.4','4.3'])for(const f of ['lw-pyramid_background.png','lw-pulse.png','lw-glow.png','lw-space.jpg','lw-flares.png','lw-light1.jpg','lw-pond.jpg','lw-leaves.png','lw-night.jpg','lw-sky.jpg','lw-sunrise.jpg','lw-sunset.jpg','lw-galaxy_thumb.jpg','lw-polarclock_thumb.jpg','lw-vis-fire.png','lw-vis-ice.png','lw-vis-needle.png','lw-vis-albumart.png','lw-vis5.png'])assert.ok(fs.existsSync(`versions/${v}/assets/${f}`),`${v} ${f}`);
console.log('Live wallpaper checks passed: list order per locale, settings, palettes, projection and assets.');
