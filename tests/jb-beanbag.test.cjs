const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},performance:{now:()=>0}};vm.runInNewContext(fs.readFileSync('versions/4.3/beanbag.js','utf8'),context);
const bag=context.window.JBBeanBag;
let seed=7;const random=()=>(seed=(seed*16807)%2147483647)/2147483647;
const board={width:360,height:560};
const beans=Array.from({length:bag.NUM_BEANS},(_,i)=>bag.bean(i,board,random));
// Depth is quadratic, so far beans are small and slow; scale stays within BeanBag's limits.
assert.equal(beans[0].z,0);assert.ok(beans.every(item=>item.scale>=bag.MIN_SCALE&&item.scale<=bag.MAX_SCALE));
assert.ok(beans.every(item=>item.color===-1?item.image==='jandycane':item.color>=0&&item.color<bag.COLORS.length));
// Free beans drift and spin; grabbed beans follow the finger and pick up its velocity.
const free={...beans[30]},moved=beans[30];const x=moved.x,a=moved.a;bag.step([moved],board,.1,random);
assert.ok(Math.abs(moved.x-(x+free.vx*.1))<1e-9);assert.ok(Math.abs(moved.a-(a+free.va*.1))<1e-9);
const held=beans[20];held.grabbed=true;held.vx=0;held.grabX=held.x+50;held.grabY=held.y;const start=held.x;
bag.step([held],board,.1,random);assert.equal(held.x,start+50);assert.ok(Math.abs(held.vx-125)<1e-9);
bag.release(held,random);assert.equal(held.grabbed,false);assert.ok(Math.abs(held.va)<=1080);
// Beans leaving the board by more than MAX_RADIUS re-enter from an edge.
const lost=beans[10];lost.x=-5000;lost.vx=-10;bag.step([lost],board,.016,random);assert.ok(lost.x>-1000&&lost.x<board.width+1000);
console.log('BeanBag checks passed: depth scaling, colors, drift, grab velocity, fling spin and edge respawn.');
