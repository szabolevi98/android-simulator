const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};vm.runInNewContext(fs.readFileSync('versions/4.3/volume-panel.js','utf8'),context);
const vp=context.window.VolumePanel,t=k=>k;
assert.equal(fs.readFileSync('versions/4.0.4/volume-panel.js','utf8'),fs.readFileSync('versions/4.3/volume-panel.js','utf8'),'both versions share the file');
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
console.log('Volume panel checks passed: streams, ringer mode changes, rendering and assets.');
