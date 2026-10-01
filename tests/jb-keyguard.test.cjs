const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};vm.runInNewContext(fs.readFileSync('versions/4.3/jb-keyguard.js','utf8'),context);
const kg=context.window.JBKeyguard,plain=value=>JSON.parse(JSON.stringify(value));
// PointCloud: eight points on the inner ring, rings out to the target radius.
const points=kg.pointCloud(10,100);
assert.equal(points.filter(point=>point.r===10).length,8);
assert.ok(points.every(point=>point.r>=10-1e-9&&point.r<=100+1e-6));
assert.ok(Math.abs(points[0].x)<1e-9&&Math.abs(points[0].y-10)<1e-9,'first point starts at eta = PI/2');
// Glow: full alpha under the finger, zero beyond the glow radius; wave only lights points just inside its ring.
const glow={x:0,y:50,radius:30,alpha:1},none={x:0,y:0,radius:30,alpha:0},quiet={radius:0,width:50,alpha:0};
assert.equal(kg.pointAlpha({x:0,y:50},glow,quiet),1);
assert.equal(kg.pointAlpha({x:0,y:90},glow,quiet),0);
const wave={radius:60,width:50,alpha:1};
assert.equal(kg.pointAlpha({x:0,y:70},none,wave),0);
assert.ok(kg.pointAlpha({x:0,y:59},none,wave)>.99&&kg.pointAlpha({x:0,y:40},none,wave)<kg.pointAlpha({x:0,y:55},none,wave));
// KeyguardHostView page order and the default page.
let pages=kg.pages([]);
assert.deepEqual(plain(pages.map(page=>page.type)),['add','status','camera']);assert.equal(kg.defaultPage(pages),1);
pages=kg.pages([{id:'a',type:'clock'}],{music:true});
assert.deepEqual(plain(pages.map(page=>page.type)),['add','widget','transport','status','camera']);assert.equal(kg.defaultPage(pages),2);
pages=kg.pages(Array.from({length:kg.MAX_WIDGETS},(_,i)=>({id:String(i),type:'clock'})));
assert.equal(pages[0].type,'widget','no add slot once five widgets are placed');
assert.ok(Math.abs(kg.G.outer-121.5)<1e-9&&kg.G.wave===1350);
console.log('JB keyguard checks passed: point cloud, glow and wave alpha, page order, default page and widget limit.');
