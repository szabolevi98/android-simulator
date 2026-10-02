const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};vm.runInNewContext(fs.readFileSync('versions/4.3/jb-camera.js','utf8'),context);
const cam=context.window.JBCamera,plain=value=>JSON.parse(JSON.stringify(value));
const base={flash:'auto',balance:'auto',exposure:0,zoom:1,front:false,scene:'auto',timer:0,beep:true,location:false,size:'5mp'};
// PhotoMenu order (left to right) and the More submenu; video drops the photo-only settings.
const root=cam.tree(base).slice(1),hdr=cam.tree(base)[0];
// Nexus 4: HDR comes first in the photo pie, then exposure, more, flash and the camera switch.
assert.deepEqual(plain(cam.tree(base).map(item=>item.label)),['HDR','EXPOSURE','MORE OPTIONS','FLASH MODE','FRONT CAMERA']);
assert.equal(hdr.icon,'ic_hdr_off');assert.equal(cam.tree({...base,hdr:true})[0].icon,'ic_hdr');assert.equal(hdr.set.hdr,true);
assert.deepEqual(plain(root[1].children.map(item=>item.label)),['LOCATION','COUNTDOWN TIMER','PICTURE SIZE','WHITE BALANCE','SCENE MODE']);
assert.equal(root[0].children.length,7,'exposure -3..+3');assert.equal(root[0].children[0].suffix,' -3');assert.equal(root[0].children[6].suffix,' +3');
assert.deepEqual(plain(root[2].children.map(item=>item.set.flash)),['off','auto','on']);
assert.equal(root[2].icon,'ic_flash_auto_holo_light');assert.equal(cam.tree({...base,flash:'on'})[3].icon,'ic_flash_on_holo_light');
assert.equal(cam.tree({...base,front:true})[4].label,'BACK CAMERA','the switch names the camera it switches to');
assert.deepEqual(plain(cam.tree(base,'video').map(item=>item.label)),['MORE OPTIONS','FLASH MODE','FRONT CAMERA']);
// OnScreenIndicators.
const ind=Object.fromEntries(cam.indicators({...base,exposure:-2,balance:'incandescent',timer:5,location:true,flash:'on',scene:'night'}).map(([key,file])=>[key,file]));
assert.deepEqual(plain(ind),{scene:'ic_indicator_sce_on',timer:'ic_indicator_timer_on',flash:'ic_indicator_flash_on',exposure:'ic_indicator_ev_n2',location:'ic_indicator_loc_on',wb:'ic_indicator_wb_tungsten'});
// PieRenderer geometry: centred arc away from the edges, tilted inside the 36 + 92dp edge zones.
assert.equal(cam.centerAngle(180,360),Math.PI/2);
assert.ok(cam.centerAngle(40,360)<Math.PI/2&&cam.centerAngle(320,360)>Math.PI/2);
const f=cam.frame(180,400,360),pts=[0,1,2,3].map(i=>cam.itemPoint(f,0,i,4));
assert.ok(pts[0].x<pts[1].x&&pts[1].x<pts[2].x&&pts[2].x<pts[3].x,'items run left to right');
assert.ok(Math.abs(pts[1].x-180+(pts[2].x-180))<1e-9,'symmetric around the finger');
assert.ok(pts.every(p=>p.y<400-cam.P.arcOffset),'items sit above the finger');
assert.ok(cam.itemPoint(f,1,0,1).y<cam.itemPoint(f,0,0,1).y,'submenus move one ring up');
// Hit testing: each icon hits its own item in swipe and tap mode; the finger position is not an item; pulling back closes.
pts.forEach((p,i)=>{assert.equal(cam.findItem(f,0,4,cam.polar(f,0,p.x,p.y,true),false),i);assert.equal(cam.findItem(f,0,4,cam.polar(f,0,p.x,p.y,false),true),i);});
assert.equal(cam.findItem(f,0,4,cam.polar(f,0,180,400,true),false),-1);
assert.ok(cam.pulledToCenter(cam.polar(f,0,180,460,true)));assert.ok(!cam.pulledToCenter(cam.polar(f,0,180,400,true)));
assert.ok(cam.slicePath(f,0,Math.PI/2).startsWith('M')&&cam.arcPath(f,0,4).includes('A'));
// CaptureAnimManager phases.
const b={w:360,h:600};
assert.equal(cam.captureFrame(0,b).flash,.3);assert.equal(cam.captureFrame(300,b).w,360);
const hold=cam.captureFrame(1000,b);assert.ok(Math.abs(hold.w-48*cam.P.inc/48)<1e-9&&hold.border&&Math.abs(hold.x-(360-16*.9-48*.9))<1e-9);
assert.ok(cam.captureFrame(3700,b).x>hold.x);assert.equal(cam.captureFrame(4200,b),null);
assert.deepEqual(plain(cam.DURATIONS),[0,1,2,3,4,5,10,15,20,30,60]);
// Markup: controls, indicators and the module popup in CameraSwitcher order (photo at the bottom).
const media={settings:data=>({flash:'auto',balance:'auto',exposure:0,zoom:1,front:false,...data.cameraSettings}),scene:()=>({}),art:()=>'<img alt="">',image:()=>''};
const html=cam.render({cameraSettings:{}},{},key=>key,media);
assert.ok(html.includes('data-jbcam-shutter')&&html.includes('data-jbcam-menu')&&html.includes('data-jbcam-switcher')&&(html.match(/class="jbcam-ind /g)||[]).length===6);
assert.ok(html.indexOf('data-jbcam-module="panorama"')<html.indexOf('data-jbcam-module="photo"'));
assert.ok(cam.render({cameraSettings:{}},{jbcamModule:'video',jbcamRecording:1},key=>key,media).includes('btn_shutter_video_recording'));
console.log('JB camera checks passed: pie tree and order, indicators, arc geometry and hit testing, capture animation, controls markup.');
