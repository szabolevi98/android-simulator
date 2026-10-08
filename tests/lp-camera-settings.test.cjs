const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Google Camera 2.4 settings (5.1.1): CameraSettingsActivity's screens, ResolutionUtil's size summaries, the options row.
const dir='versions/5.1.1/',w={window:{}};vm.runInNewContext(fs.readFileSync(dir+'lp-camera.js','utf8'),w);
const C=w.window.LPCamera,t=k=>k,media={art:()=>'',scene:()=>({})};
assert.equal(C.sizeLabel('4160x3120',t,'en'),'(4:3) 13.0 megapixels');
assert.equal(C.sizeLabel('4160x2340',t,'en'),'(16:9) 9.7 megapixels');
assert.equal(C.sizeLabel('1920x1080',t,'hu'),'(16:9) 2,1 megapixels');
const page=(gcsPage,extra={})=>C.render({cameraSettings:extra},{gcsPage,...extra.ui},t,media,'en','hu');
const root=page('root');
assert.ok(root.includes('data-gcs-open="resolution"')&&root.includes('data-gcs-switch="location"')&&root.includes('Haladó')&&root.includes('Help &amp; feedback'));
const res=page('resolution');
for(const s of ['Back camera photo','Front camera photo','Back camera video','Front camera video','Photo sphere and panorama','Panorama resolution','Lens Blur','Image quality','UHD 4K','HD 1080p'])assert.ok(res.includes(s),s);
// The list dialog marks the current entry; Back closes the dialog, then the sub screen, then the settings.
const ui={gcsPage:'resolution',gcsDialog:'videoFront'};
const dialog=C.render({},ui,t,media,'en','en');
assert.ok(dialog.includes('class="gcs-choice on" data-gcs-pick="large"')&&dialog.includes('SD 480p'));
assert.ok(C.back(ui)&&!ui.gcsDialog&&ui.gcsPage==='resolution');assert.ok(C.back(ui)&&ui.gcsPage==='root');assert.ok(C.back(ui)&&ui.gcsPage==='');assert.ok(!C.back(ui));
// mode_options.xml order; manual exposure adds its button first and the -2..+2 choices.
const cam=C.render({cameraSettings:{exposure:true}},{gcamOptions:true},t,media);
assert.deepEqual([...cam.matchAll(/data-gcam-option="(\w+)"/g)].map(m=>m[1]),['exposure','timer','grid','hdr','flash','front']);
assert.ok(cam.includes('gcam-preview r43'));
const ev=C.render({cameraSettings:{exposure:true,ev:1}},{gcamOptions:true,gcamExposure:true},t,media);
assert.equal([...ev.matchAll(/data-gcam-ev="(-?\d)"/g)].length,5);assert.ok(ev.includes('class="gcam-ev on" data-gcam-ev="1"'));
assert.ok(!C.render({cameraSettings:{pictureBack:'4160x2340'}},{},t,media).includes('r43'));
console.log('lp-camera-settings ok');
