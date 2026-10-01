const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('versions/4.0.4/launcher-folders.js','utf8'),ctx);const folders=ctx.window.ICSLauncherFolders;
const fresh=()=>({homePages:Array.from({length:5},()=>Array(16).fill(null)),dock:['phone','people','apps','messaging','browser'],folders:{}});
const home=(slot,page=2)=>({type:'home',page,slot}),drawer=id=>({type:'drawer',id}),inside=(folderId,slot)=>({type:'folder',folderId,slot});
let data=fresh();data.homePages[2][12]='camera';data.homePages[2][15]='gallery';
let result=folders.drop(data,home(12),home(15),1);assert.ok(result.ok);assert.equal(data.homePages[2][12],null);assert.deepEqual([...data.folders['folder-1'].items],['gallery','camera']);
folders.drop(data,drawer('email'),home(15));assert.equal(data.folders['folder-1'].items.length,3);
folders.drop(data,inside('folder-1',0),inside('folder-1',2));assert.deepEqual([...data.folders['folder-1'].items],['camera','email','gallery']);
folders.drop(data,inside('folder-1',0),home(4));assert.equal(data.homePages[2][4],'camera');assert.equal(data.folders['folder-1'].items.length,2);
folders.drop(data,inside('folder-1',0),{type:'dock',slot:0},2);assert.equal(data.homePages[2][15],'gallery');assert.equal(data.folders['folder-1'],undefined);assert.deepEqual([...data.folders['folder-2'].items],['phone','email']);
folders.drop(data,{type:'dock',slot:0},home(0));assert.equal(data.homePages[2][0],'folder-2');assert.equal(data.dock[0],null);
folders.remove(data,inside('folder-2',0));assert.equal(data.homePages[2][0],'email');assert.equal(data.folders['folder-2'],undefined);
// A full target must reject the drop without losing or moving the source.
data=fresh();data.folders.full={name:'Full',items:Array(16).fill('camera')};data.homePages[2][0]='full';data.homePages[2][1]='email';let before=JSON.stringify(data);
assert.equal(folders.drop(data,home(1),home(0)).error,'Folder is full');assert.equal(JSON.stringify(data),before);
assert.equal(folders.drop(data,home(1),{type:'dock',slot:2}).ok,false);assert.equal(JSON.stringify(data),before);
data.folders.other={name:'Other',items:['phone','email']};data.homePages[2][3]='other';before=JSON.stringify(data);assert.equal(folders.drop(data,home(3),home(0)).ok,false);assert.equal(JSON.stringify(data),before);
// Return an item to its own folder icon and reorder a full folder without collapse.
assert.ok(folders.drop(data,inside('full',0),home(0)).ok);assert.equal(data.folders.full.items.length,16);
assert.ok(folders.drop(data,inside('full',0),inside('full',15)).ok);
// Old Google shortcut migrates once without changing neighboring shortcuts.
data=fresh();data.homePages[2][15]='google';data.homePages[3][0]='camera';folders.initialize(data,['play-store','browser','email','calendar','gallery','camera']);assert.equal(data.homePages[2][15],'folder-google');assert.equal(data.folders['folder-google'].items.length,5);assert.equal(data.homePages[3][0],'camera');
data.folders['folder-google'].name='My folder';const saved=JSON.parse(JSON.stringify(data));folders.initialize(saved,['play-store','browser','email','calendar','gallery','camera']);assert.equal(saved.folders['folder-google'].name,'My folder');assert.equal(saved.folders['folder-google'].items.length,5);
// Removing a folder removes its shortcuts, not the apps or other desktop copies.
folders.remove(saved,home(15));assert.equal(saved.folders['folder-google'],undefined);assert.equal(saved.homePages[3][0],'camera');
for(let count=1;count<=16;count++){const size=folders.dimensions(count);assert.ok(size.columns*size.rows>=count);assert.ok(size.columns<=4&&size.rows<=4);}
console.log('Folder checks passed: creation, add/reorder/extract, dock movement, automatic dissolution, capacity rejection, nested-folder rejection, migration, persistence and removal.');
