// Galaxy Nexus Camera (audit step 9): CameraGoogle 4.0.4's camera.xml, indicator bars and setting popups.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c={window:{}};for(const f of ['stock-strings.js','media.js'])vm.runInNewContext(fs.readFileSync('versions/4.0.4/'+f,'utf8'),c);
const M=c.window.ICSMedia,data={photos:[]},t=k=>k;
let html=M.camera(data,{},t);
assert.match(html,/camera-ic_settings_holo_light/);assert.match(html,/camera-ic_switch_photo_facing_holo_light/);assert.match(html,/camera-ic_zoom_in_holo_light/);assert.doesNotMatch(html,/camera-thumbnail/);
html=M.camera(data,{cameraLevel2:true},t);
assert.deepEqual([...html.matchAll(/data-action="camera-setting" data-id="([^"]+)"/g)].map(m=>m[1]),['flash','balance','exposure','scene','other']);
for(const [,src] of html.matchAll(/src="assets\/([^"]+)"/g))assert.ok(fs.existsSync('versions/4.0.4/assets/'+src),src);
let pop=M.overlay(data,{overlay:'camera-setting',cameraSetting:'balance'},t,'en','en');
assert.match(pop,/White balance/);assert.match(pop,/Fluorescent/);assert.match(pop,/camera-ic_white_balance_sunlight_holo_light/);
pop=M.overlay(data,{overlay:'camera-setting',cameraSetting:'other'},t,'en','en');
assert.match(pop,/Camera settings/);assert.match(pop,/Store location/);assert.match(pop,/5M pixels/);assert.match(pop,/Focus mode/);
for(const src of ['camera-btn_close_settings.png','camera-ic_menu_overflow.png','camera-ic_exposure_holo_light.png','camera-ic_scn_holo_light.png'])assert.ok(fs.existsSync('versions/4.0.4/assets/'+src),src);
console.log('ics-camera ok');
