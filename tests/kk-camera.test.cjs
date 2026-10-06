const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// 4.4.4 camera (GoogleCamera 2.0.002 / Camera2 android-4.4.4_r1): AnimationManager's capture animation (flash 300 ms,
// shrink 400 ms into the frameless top-right thumbnail, hold 2500 ms, slide off 1100 ms), HDR+ and Photo Sphere.
const context={window:{}};vm.runInNewContext(fs.readFileSync('versions/4.4.4/kk-camera.js','utf8'),context);
const cam=context.window.JBCamera,b={w:360,h:480};
assert.equal(cam.captureFrame(0,b).flash,.3);assert.equal(cam.captureFrame(0,b).w,360);assert.equal(cam.captureFrame(300,b).flash,0);
const hold=cam.captureFrame(1000,b);assert.ok(Math.abs(hold.w-48*.9)<1e-9&&!hold.border&&hold.live&&Math.abs(hold.x-(360-16*.9-48*.9))<1e-9);
assert.equal(cam.captureFrame(2800,b).x,hold.x);assert.ok(cam.captureFrame(3500,b).x>hold.x);assert.equal(cam.captureFrame(4000,b),null);
const base={flash:'auto',balance:'auto',exposure:0,zoom:1,front:false,scene:'auto',timer:0,beep:true,location:false,size:'5mp'};
assert.equal(cam.tree(base)[0].label,'HDR+ ON');
assert.ok(fs.readFileSync('versions/4.4.4/kk-camera.js','utf8').includes("['photosphere', 'ic_switch_photosphere', 'Switch to Photo Sphere']"));
console.log('kk-camera ok');
