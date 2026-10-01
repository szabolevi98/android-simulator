const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};vm.runInNewContext(fs.readFileSync('versions/4.3/jb-deskclock.js','utf8'),context);
const clock=context.window.JBDeskClock,plain=value=>JSON.parse(JSON.stringify(value));
// TimerSetupView fills H MM SS from the right; a leading zero is ignored and five digits is the limit.
let digits='';for(const key of ['0','1','2','3'])digits=clock.setupDigits(digits,key);
assert.equal(digits,'123');assert.deepEqual(plain(clock.setupTime(digits)),{h:0,m:1,s:23,ms:83000});
assert.equal(clock.setupDigits('12345','6'),'12345');assert.equal(clock.setupDigits('12','back'),'1');
assert.equal(clock.setupTime('99999').ms,(9*3600+99*60+99)*1000);
// Timers: start/stop keeps the remaining time; +1 minute; finished timers reset to their length.
let timer={id:'a',length:60000,left:60000,started:1000,state:'running'};
assert.equal(clock.remaining(timer,31000),30000);
timer=clock.timerAction(timer,'toggle',31000);assert.equal(timer.state,'stopped');assert.equal(timer.left,30000);
timer=clock.timerAction(timer,'plus',40000);assert.equal(timer.left,90000);assert.equal(timer.length,90000);
assert.equal(clock.timerAction({...timer,state:'done',left:0},'toggle',0).left,90000);
// CountingTimerView formats.
assert.equal(clock.formatTimer(65000),'01:05');assert.equal(clock.formatTimer(3725000),'1:02:05');assert.equal(clock.formatTimer(64001),'01:05');
assert.equal(clock.formatStopwatch(3723456),'1:02:03.45');assert.equal(clock.formatStopwatch(1234),'00:01.23');
// Stopwatch: laps while running, reset only when stopped.
let watch={accumulated:0,started:null,laps:[]};
watch=clock.stopwatchAction(watch,'toggle',0);watch=clock.stopwatchAction(watch,'lap',1500);watch=clock.stopwatchAction(watch,'lap',2500);
assert.deepEqual(plain(watch.laps),[1500,2500]);assert.equal(clock.stopwatchAction(watch,'reset',3000),watch);
watch=clock.stopwatchAction(watch,'toggle',3000);assert.equal(watch.accumulated,3000);assert.equal(clock.elapsed(watch,9000),3000);
assert.deepEqual(plain(clock.stopwatchAction(watch,'reset',9000)),{accumulated:0,started:null,laps:[]});
const html=clock.render({tab:'stopwatch',timers:[],stopwatch:watch},key=>key,{locale:'hu-HU',now:new Date('2026-10-01T09:05:00'),hour24:true,alarm:'',date:'CS, OKT. 1.'});
assert.ok(html.includes('translateX(-200%)')&&html.includes('# 2'));
assert.ok(clock.render({tab:'timer',timers:[],stopwatch:watch},key=>key,{locale:'hu-HU',now:new Date(),hour24:true,alarm:'',date:''}).includes('>mp<'));
console.log('JB DeskClock checks passed: timer setup digits, timer state changes, counter formats, stopwatch laps/reset and page rendering.');
