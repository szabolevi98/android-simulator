const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};vm.runInNewContext(fs.readFileSync('versions/4.3/jb-launcher.js','utf8'),context);
const L=context.window.JBLauncher,plain=value=>JSON.parse(JSON.stringify(value));
const spans={calendar:{width:2,height:3},clock:{width:3,height:2}},spanOf=widget=>({...spans[widget.type],...(widget.width?{width:widget.width,height:widget.height}:{})});
const page=Array(16).fill(null);page[0]='phone';page[1]='mail';page[5]='music';
const widgets=[{id:'c',type:'calendar',x:2,y:0}];
const items=L.items(page,widgets,spanOf);
assert.deepEqual(plain(items.map(item=>[item.key,item.x,item.y,item.w,item.h])),[['s0',0,0,1,1],['s1',1,0,1,1],['s5',1,1,1,1],['wc',2,0,2,3]]);
// A free target needs no moves; an occupied one moves the occupant to the nearest free cell.
assert.deepEqual(plain(L.solve(items,{key:'new',x:0,y:3,w:1,h:1}).moves),{});
let solution=L.solve(items,{key:'new',x:1,y:0,w:1,h:1},[1,0]);
assert.equal(Object.keys(solution.moves).length,1);const to=solution.moves.s1;
assert.deepEqual(plain(to),{x:0,y:1},'mail takes the nearest free cell (diagonal)');
// Moving the dragged item frees its own cell for others.
solution=L.solve(items,{key:'s0',x:1,y:0,w:1,h:1},[1,0]);assert.deepEqual(plain(solution.moves.s1),{x:0,y:0});
// A widget pushes several shortcuts; impossible arrangements return null.
solution=L.solve(items,{key:'new',x:0,y:0,w:2,h:2});assert.equal(Object.keys(solution.moves).length,3);
const full=Array(16).fill('x');assert.equal(L.solve(L.items(full,[],spanOf),{key:'new',x:0,y:0,w:2,h:2}),null);
assert.equal(L.solve(items,{key:'new',x:3,y:3,w:2,h:1}),null,'outside the grid');
// Applying moves rewrites slots and widget origins.
const moved=L.apply(page,widgets,{s5:{x:0,y:2},wc:{x:2,y:1}});assert.equal(moved[8],'music');assert.equal(moved[5],null);assert.equal(widgets[0].y,1);
// AppWidgetResizeFrame: 66% of a cell changes the span, clamped to the provider minimum and the grid.
assert.equal(L.resizeSpan(2,59,90,2,4),2);assert.equal(L.resizeSpan(2,61,90,2,4),3);assert.equal(L.resizeSpan(2,-200,90,2,4),2);assert.equal(L.resizeSpan(3,400,90,2,4),4);
// Folder creation zone: within 0.55 icon sizes of the centre.
assert.equal(L.folderZone({x:10,y:0},{x:0,y:0},48),true);assert.equal(L.folderZone({x:30,y:0},{x:0,y:0},48),false);
assert.equal(L.REORDER_TIMEOUT,250);assert.equal(L.REORDER_DURATION,150);
console.log('JB launcher checks passed: item spans, reorder solutions, own-cell reuse, widget pushes, impossible cases, apply, resize thresholds and folder zone.');
