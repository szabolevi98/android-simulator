const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};vm.runInNewContext(fs.readFileSync('versions/4.3/volume-panel.js','utf8'),context);
const vp=context.window.VolumePanel,t=k=>k;
{const strip=f=>fs.readFileSync(f,'utf8').replace(/\/\*[\s\S]*?\*\//,'');for(const v of ['4.0.4','4.4.4'])assert.equal(strip(`versions/${v}/volume-panel.js`),strip('versions/4.3/volume-panel.js'),`${v}: same panel code as 4.3, only the header differs`);}
assert.deepEqual([vp.STREAMS.call.max,vp.STREAMS.ring.max,vp.STREAMS.music.max],[5,7,15]);
assert.equal(vp.TIMEOUT,3000);
assert.equal(vp.activeStream({inCall:true,musicActive:true}),'call');assert.equal(vp.activeStream({musicActive:true}),'music');assert.equal(vp.activeStream({}),'ring');
// checkForRingerModeChange with a vibrator.
const s={ringVolume:Math.round(2/7*100)};let prev=0;const key=d=>{const r=vp.adjust(s,'ring',d,prev);prev=d;return r;};
key(-1);assert.equal(vp.index(s,'ring'),1);assert.equal(vp.ringerOf(s),'normal');
assert.equal(key(-1).vibrate,true);assert.equal(vp.ringerOf(s),'vibrate');
key(-1);assert.equal(vp.ringerOf(s),'vibrate','a repeated lower stays in vibrate');
key(1);assert.equal(vp.ringerOf(s),'normal');assert.equal(vp.index(s,'ring'),1);
prev=1;s.silent=true;s.silentMode='vibrate';key(-1);assert.equal(vp.ringerOf(s),'silent','a fresh lower from vibrate reaches silent');
assert.equal(key(1).vibrate,true);assert.equal(vp.ringerOf(s),'vibrate','raising from silent goes to vibrate');
const m={mediaVolume:100};vp.adjust(m,'music',1,0);assert.equal(vp.index(m,'music'),15);vp.adjust(m,'music',-1,0);assert.equal(vp.index(m,'music'),14);
// Rendering: the muted ringer disables the slider and shows the vibrate or mute icon.
const html=vp.render({silent:true,silentMode:'vibrate'},'ring',t);
assert.ok(html.includes('ga-ic_audio_ring_notif_vibrate.png')&&html.includes('aria-disabled="true"')&&html.includes('aria-valuenow="0"'));
assert.ok(vp.render({silent:true,silentMode:'mute'},'ring',t).includes('ga-ic_audio_ring_notif_mute.png'));
assert.ok(vp.render({mediaVolume:60},'music',t).includes('aria-valuemax="15" aria-valuenow="9"'));
for(const v of ['4.0.4','4.3'])for(const f of ['vol-scrubber_track_holo_dark','vol-scrubber_control_normal_holo','ga-ic_audio_ring_notif','ga-ic_audio_phone'])assert.ok(fs.existsSync(`versions/${v}/assets/${f}.png`),`${v} ${f}`);
// Gingerbread (2.3.6): the volume toast, GB's ringer steps and no slider to drag.
{
  const w={window:{GBStrings:{framework:{strings:{volume_ringtone:{en:'Ringer volume',hu:'Csengetés hangereje'},volume_music:{en:'Media volume'}}}}}};
  vm.runInNewContext(fs.readFileSync('versions/2.3.6/volume-panel.js','utf8'),w);const g=w.window.VolumePanel;
  assert.equal(g.TIMEOUT,2000);
  const st={ringVolume:Math.round(1/7*100)};
  assert.equal(g.adjust(st,'ring',-1).vibrate,true);assert.equal(g.ringerOf(st),'vibrate');
  g.adjust(st,'ring',-1);assert.equal(g.ringerOf(st),'vibrate','lowering in vibrate does nothing');
  g.adjust(st,'ring',1);assert.equal(g.ringerOf(st),'normal');
  const html=g.render(st,'ring',k=>k,'hu');assert.ok(html.includes('Csengetés hangereje')&&html.includes('gbvol-ic_volume.png')&&html.includes('role="progressbar"')&&!html.includes('vol-seek'));
  assert.ok(g.render({mediaVolume:0},'music',k=>k,'en').includes('gbvol-ic_volume_off_small.png'));
}
console.log('Volume panel checks passed: streams, ringer mode changes, rendering and assets.');
