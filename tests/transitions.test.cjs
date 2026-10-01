const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};vm.runInNewContext(fs.readFileSync('versions/4.0.4/transitions.js','utf8'),context);
const motion=context.window.ICSTransitions;
const near=(actual,expected,delta=1e-6)=>assert.ok(Math.abs(actual-expected)<=delta,`${actual} != ${expected}`);

// WindowManager transit selection.
const scene=(view,sub='')=>({view,sub});
assert.equal(motion.kind(null,scene('home')),'');
assert.equal(motion.kind(scene('home'),scene('phone')),'wallpaper-close');
assert.equal(motion.kind(scene('drawer'),scene('settings')),'wallpaper-close');
assert.equal(motion.kind(scene('phone'),scene('home')),'wallpaper-open');
assert.equal(motion.kind(scene('home'),scene('drawer')),'drawer-open');
assert.equal(motion.kind(scene('drawer'),scene('home')),'drawer-close');
assert.equal(motion.kind(scene('home'),scene('home')),'');
assert.equal(motion.kind(scene('people'),scene('messaging')),'task-open');
assert.equal(motion.kind(scene('messaging'),scene('people'),'back'),'task-close');
assert.equal(motion.kind(scene('settings'),scene('settings','wifi')),'activity-open');
assert.equal(motion.kind(scene('settings','wifi'),scene('settings'),'back'),'activity-close');
assert.equal(motion.kind(scene('settings','wifi'),scene('settings','wifi')),'');
assert.equal(motion.kind(scene('lock'),scene('home')),'unlock');
assert.equal(motion.kind(scene('home'),scene('lock')),'');

// Interpolators match android.view.animation formulas and the Launcher2 Z interpolators.
for(const name of Object.keys(motion.curves)){near(motion.curves[name](0),0);near(motion.curves[name](1),1);}
near(motion.curves.decelerateQuad(.5),.75);near(motion.curves.decelerateCubic(.5),.875);near(motion.curves.decelerateQuint(.5),1-Math.pow(.5,5));
near(motion.curves.accelerateQuint(.5),Math.pow(.5,5));near(motion.curves.accelerateDecelerate(.5),.5);
assert.ok(motion.curves.zoomOut(.25)>.5,'zoom-out reaches most of the scale change early');

// Timings from the AOSP XML and Launcher2 config.
assert.equal(motion.length(motion.specs['wallpaper-close']),600);
assert.equal(motion.length(motion.specs['wallpaper-open']),500);
assert.equal(motion.length(motion.specs['activity-open']),200);
assert.equal(motion.length(motion.specs['unlock']),400);
assert.equal(motion.length(motion.specs['drawer-open']),350);
assert.equal(motion.length(motion.specs['drawer-close']),600);
assert.equal(motion.length(motion.specs['folder-open']),120);
assert.equal(motion.specs['task-open'].black,true);assert.equal(motion.specs['wallpaper-close'].enter.top,true);assert.ok(!motion.specs['wallpaper-close'].exit.top);

// Sampled keyframes start and end on the XML values.
const enter=motion.specs['wallpaper-close'].enter.tracks;
const scaleFrames=motion.frames(enter.find(track=>track.kind==='scale')),alphaFrames=motion.frames(enter.find(track=>track.kind==='alpha'));
assert.equal(scaleFrames[0].transform,'scale(1.2,0.8)');assert.equal(scaleFrames.at(-1).transform,'scale(1,1)');
assert.equal(alphaFrames[0].opacity,0);assert.equal(alphaFrames.at(-1).opacity,1);assert.equal(alphaFrames.at(-1).offset,1);

// DragLayer drop duration: 500 ms at 800 device px or more, cubic ease-out below.
assert.equal(motion.dropDuration(0),0);near(motion.dropDuration(200),500*(1-Math.pow(.5,3)));assert.equal(motion.dropDuration(500),500);
console.log('Transition checks passed: transit selection, interpolators, AOSP durations, keyframe endpoints and drop timing.');
