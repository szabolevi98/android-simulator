const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// state.js (audit point 13): broken saves cost only the broken part; a full or blocked storage is reported once.
const make=(store={},fail=false)=>{const ls={getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{if(fail)throw Object.assign(new Error('full'),{name:'QuotaExceededError'});store[k]=String(v);}};const c={window:{},localStorage:ls};vm.runInNewContext(fs.readFileSync('state.js','utf8'),c);return {S:c.window.AndroidState,store};};
const D={layout:2,settings:{wifi:true},photos:[1,2],name:'Nexus'};
// Nothing saved: a fresh copy of the defaults.
{const {S}=make();const d=S.load('k',D);assert.deepEqual(JSON.parse(JSON.stringify(d)),D);d.photos.push(3);assert.deepEqual(D.photos,[1,2]);}
// Unreadable JSON is kept aside and reported; the defaults come back.
{const {S,store}=make({k:'{broken'});const seen=[];S.onProblem(p=>seen.push(p.kind));const d=S.load('k',D);assert.equal(d.name,'Nexus');assert.equal(store['k:unreadable'],'{broken');assert.deepEqual(seen,['unreadable']);}
{const {S}=make({k:'[1,2]'});assert.equal(S.load('k',D).layout,2);assert.equal(S.problems[0].kind,'unreadable');}
// A field of the wrong kind takes its default alone; the rest of the save stays.
{const {S}=make({k:JSON.stringify({layout:3,photos:'oops',settings:[],extra:'kept'})});const d=S.load('k',D);
 assert.equal(d.layout,3);assert.deepEqual(JSON.parse(JSON.stringify(d.photos)),[1,2]);assert.deepEqual(JSON.parse(JSON.stringify(d.settings)),{wifi:true});assert.equal(d.extra,'kept');assert.equal(S.problems[0].kind,'repaired');assert.match(S.problems[0].detail,/photos, settings/);}
// The version's build runs on the repaired save; if it throws, the save over the defaults is kept, not thrown away.
{const {S}=make({k:JSON.stringify({layout:5,name:'Mine'})});const d=S.load('k',D,saved=>({...D,...saved,settings:{...D.settings,...saved.settings}}));assert.equal(d.name,'Mine');}
{const {S}=make({k:JSON.stringify({layout:5,name:'Mine'})});const d=S.load('k',D,()=>{throw new Error('old layout');});assert.equal(d.name,'Mine');assert.equal(d.layout,5);assert.equal(S.problems[0].kind,'upgrade');}
// Saving: true when stored; a full storage reports once until a save succeeds again.
{const {S,store}=make();assert.equal(S.save('k',{a:1}),true);assert.equal(store.k,'{"a":1}');}
{const {S}=make({},true);const seen=[];S.onProblem(p=>seen.push(p.kind));assert.equal(S.save('k',{a:1}),false);S.save('k',{a:2});assert.deepEqual(seen,['unsaved']);}
// A listener added later still hears the problems found while loading.
{const {S}=make({k:'nope'});S.load('k',D);const seen=[];S.onProblem(p=>seen.push(p.kind));assert.deepEqual(seen,['unreadable']);}
console.log('state ok');
