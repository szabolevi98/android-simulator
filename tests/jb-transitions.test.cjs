const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};vm.runInNewContext(fs.readFileSync('versions/4.3/transitions.js','utf8'),context);
const motion=context.window.ICSTransitions,near=(a,b,d=1e-6)=>assert.ok(Math.abs(a-b)<=d,`${a} != ${b}`);
// 4.3 XML values: activity 0.8 <-> 1 over 300 ms, wallpaper open shrinks the app to 0.5, task cards travel 120%.
const track=(name,side,kind,n=0)=>motion.specs[name][side].tracks.filter(t=>t.kind===kind)[n];
assert.deepEqual([...track('activity-open','enter','scale').from],[.8,.8]);assert.equal(track('activity-open','enter','scale').duration,300);
assert.deepEqual([...track('wallpaper-open','exit','scale').to],[.5,.5]);assert.equal(track('wallpaper-open','exit','scale').duration,375);
assert.equal(track('task-open','enter','translate').from[1],120);assert.equal(track('task-open','enter','translate').unit,'%');
assert.equal(track('task-open','enter','scale').origin,'50% 100%');assert.equal(track('task-open','exit','scale').origin,'50% 0%');
assert.equal(motion.length(motion.specs['task-open']),700);
assert.deepEqual([...track('unlock','exit','scale').to],[1.1,1.1]);
// Percent translations keep their unit; origins are written into every frame.
const frames=motion.frames(track('task-close','enter','translate'));assert.equal(frames[0].translate,'0% -120%');assert.equal(frames.at(-1).translate,'0% 0%');
assert.equal(motion.frames(track('task-open','enter','scale'))[0].transformOrigin,'50% 100%');
// AppTransition thumbnail fade: linear over the first quarter, then held at 1.
near(motion.curves.thumbnailFade(.125),.5);assert.equal(motion.curves.thumbnailFade(.5),1);
// createScaleUpAnimationLocked: the pivot keeps the icon rectangle in place at the start scale.
const spec=motion.scaleUp({left:240,top:600,width:72,height:60},360,640),scale=spec.enter.tracks.find(t=>t.kind==='scale');
const [px,py]=scale.origin.split(' ').map(parseFloat),[sx,sy]=scale.from;
near(sx,.2);near(sy,60/640);
near(px+(0-px)*sx,240,1e-6);near(py+(0-py)*sy,600,1e-6);
near(px+(360-px)*sx,312,1e-6);
assert.equal(scale.duration,250);assert.equal(scale.curve,'decelerateCubic');assert.equal(spec.enter.tracks.find(t=>t.kind==='alpha').curve,'thumbnailFade');
assert.equal(spec.exit.tracks[0].from,1);assert.equal(spec.exit.tracks[0].to,1,'the launcher holds');
console.log('JB transition checks passed: 4.3 activity, task, wallpaper and keyguard animations, percent shifts and the launcher scale-up.');
