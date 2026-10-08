// Quickoffice 6.3.1 (4.4.4) and Docs / Sheets / Slides 1.4 (5.1.1): create, rename and remove files; Drive lists them.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const load=(v,files)=>{const context={window:{AndroidI18n:{language:'en',extend(){}}},document:{},Date};for(const f of files)vm.runInNewContext(fs.readFileSync(`versions/${v}/${f}`,'utf8'),context);return context.window;};
{const w=load('4.4.4',['stock-strings.js','kk-extra-apps.js']),K=w.KKExtraApps,t=k=>k;
 const files=[{id:'a',name:'Budget',kind:'sheet',date:'Oct 30',text:'x'}];
 assert.match(K.qoDialog('create',{files,ui:{},t}),/Document[\s\S]*Spreadsheet[\s\S]*Presentation/);
 assert.match(K.qoDialog('file',{files,ui:{qoFile:'a'},t}),/data-action="qo-rename"[\s\S]*data-action="qo-delete"/);
 assert.match(K.qoDialog('delete',{files,ui:{qoFile:'a'},t}),/Are you sure you want to delete Budget\?/);
 assert.match(K.qoDialog('rename',{files,ui:{qoFile:'a'},t}),/Rename file/);
 const html=K.render('quickoffice',{files,ui:{sub:'qo-new',qoKind:'slides'},t});assert.match(html,/New Presentation/);assert.match(html,/Not saved yet/);
 assert.match(K.render('quickoffice',{files,ui:{},t}),/data-action="qo-new"/);}
{const w=load('5.1.1',['stock-strings.js','lp-extra-apps.js']),L=w.LPExtraApps,t=k=>k;
 const files=[{id:'d',name:'Trip plan 2015',kind:'doc',date:'Nov 2',text:''}];
 const list=L.render('docs',{files,ui:{},t,locale:'en-US'});assert.match(list,/data-action="ed-new"/);assert.match(list,/data-action="ed-item" data-id="d"/);
 assert.deepEqual(JSON.parse(JSON.stringify([...L.edDialog('menu',{files,ui:{edFile:'d'},t,locale:'en-US'}).matchAll(/>([^<]+)<\/button>/g)].map(m=>m[1]))),['Share link','Send file','Keep on device','Move','Add to home screen','Rename','Print','Remove']);
 assert.match(L.edDialog('rename',{files,ui:{edFile:'d'},t,locale:'en-US'}),/Rename document/);
 assert.match(L.edDialog('remove',{files,ui:{edFile:'d'},t,locale:'en-US'}),/Do you really want to remove this file\?/);
 assert.equal(L.UNTITLED.sheet,'Untitled spreadsheet');}
console.log('office-files ok');
