// 2.3.6 Contacts menu (gb-contacts-io.js): Display options, Import/Export, SIM import and sharing.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},setTimeout:fn=>{fn();return 0;},Date};
for(const f of ['gb-strings-contactsio.js','gb-strings-phonenet.js','gb-contacts-io.js'])vm.runInNewContext(fs.readFileSync(`versions/2.3.6/${f}`,'utf8'),context);
const IO=context.window.GBContactsIO,J=v=>JSON.parse(JSON.stringify(v));
const people=()=>[{id:1,name:'Alex Morgan',phone:'1',favorite:true},{id:2,name:'Sam Rivera',phone:''},{id:3,name:'Taylor Lee',phone:'3'},{id:4,name:'Mom',phone:'4'}];
function make(lang='en'){
  const data={contacts:people(),contactGroups:[{id:'friends',name:'Friends',members:[1,2,3]},{id:'family',name:'Family',members:[4]}]},ui={sub:'',overlay:''},toasts=[],shared=[];
  const ctx={data,ui,lang,save(){},render(){},renderOverlay(){},toast:m=>toasts.push(m),account:'demo@example.com',appName:id=>id,openAccounts(){ui.opened='sync';},unsupported(){toasts.push('unsupported');},shareVcard:a=>shared.push(a)};
  return {data,ui,ctx,toasts,shared,act:(a,id)=>IO.handle(a,id,ctx)};
}
// Defaults: My Contacts shown, sorted by given name; the account's groups and All Other Contacts.
{
  const {data,ui,ctx,act}=make();
  const v=IO.view(data,'en');assert.deepEqual(J(v.filter(data.contacts).map(p=>p.id)),[1,2,3,4]);
  act('gbct-display');const html=IO.render('gbct-display',ctx);
  assert.deepEqual(J([...html.matchAll(/<b>([^<]+)<\/b>/g)].map(m=>m[1])),['Only contacts with phones','Sort list by','View contact names as','My Contacts','Starred in Android','Friends','Family','All Other Contacts','More groups…']);
  assert.match(html,/demo@example\.com<\/b><small>Google/);
  // Only phones, family-name sort and order, Family instead of My Contacts; Revert keeps nothing, Done saves.
  act('gbct-phones');act('gbct-pick','sort:1');act('gbct-pick','order:1');act('gbct-group','my');act('gbct-group','g:friends');
  act('gbct-revert');assert.equal(data.gbContactPrefs,undefined);
  act('gbct-display');IO.render('gbct-display',ctx);act('gbct-phones');act('gbct-pick','sort:1');act('gbct-pick','order:1');act('gbct-group','my');act('gbct-group','g:friends');act('gbct-done');
  const w=IO.view(data,'en'),shown=w.filter(data.contacts);
  assert.deepEqual(J(shown.map(p=>p.id)),[1,3]);assert.equal(w.name(shown[0]),'Morgan, Alex');assert.equal(w.key(shown[1]),'Lee Taylor');
}
// Removing a group from sync while ungrouped contacts sync asks first and drops both; More groups brings them back.
{
  const {ui,ctx,act}=make();
  act('gbct-display');IO.render('gbct-display',ctx);act('gbct-sync-remove','g:family');assert.equal(ui.gbctDialog,'warn-remove:g:family');
  assert.match(IO.dialog('warn-remove:g:family',ctx).message,/Removing 'Family' from sync will also remove any ungrouped contacts/);
  act('gbct-sync-remove-ok','g:family');assert.doesNotMatch(IO.render('gbct-display',ctx),/>Family</);
  assert.deepEqual(J(IO.dialog('sync-add',ctx).items.map(i=>i.title)),['Family','All Other Contacts']);
}
// Import/Export: the USB storage wording, no file found, export to 00001.vcf / 00002.vcf, importing one file adds copies.
{
  const {data,ui,ctx,toasts,shared,act}=make();
  assert.deepEqual(J(IO.dialog('io',ctx).items.map(i=>i.title)),['Import from SIM card','Import from USB storage','Export to USB storage','Share visible contacts']);
  act('gbct-io','import');assert.equal(ui.gbctDialog,'no-vcard');assert.match(IO.dialog('no-vcard',ctx).message,/No vCard file found in the USB storage/);
  act('gbct-io','export');assert.match(IO.dialog('export-confirm',ctx).message,/\/sdcard\/00001\.vcf/);act('gbct-export-ok');
  act('gbct-io','export');assert.equal(ui.gbctExportName,'00002.vcf');act('gbct-export-ok');
  assert.deepEqual(J(data.gbVcards.map(f=>f.name)),['00001.vcf','00002.vcf']);
  act('gbct-io','import');assert.equal(ui.gbctDialog,'select-type');act('gbct-type','0');act('gbct-type-ok');assert.equal(ui.gbctDialog,'select-one');
  act('gbct-files-ok');assert.equal(data.contacts.length,8);
  // SIM: three demo entries, one by tap, the rest with Import all.
  act('gbct-io','sim');assert.equal(ui.sub,'gbct-sim');assert.match(IO.render('gbct-sim',ctx),/Jordan Blake/);
  act('gbct-sim-one','0');assert.equal(data.contacts.at(-1).name,'Jordan Blake');act('gbct-sim-all');assert.equal(data.contacts.length,12);
  assert.deepEqual(J(IO.menu('gbct-sim',ctx).map(i=>i.title)),['Import all']);
  // Sharing: the ResolverActivity list; Gmail gets the vCard.
  act('gbct-io','share');assert.deepEqual(J(IO.dialog('share',ctx).items.map(i=>i.title)),['Bluetooth','email','gmail','messaging']);
  act('gbct-share-to','gmail');assert.equal(shared[0].name,'contacts.vcf');act('gbct-share-one','1');act('gbct-share-to','gmail');assert.equal(shared[1].name,'Alex Morgan.vcf');
  act('gbct-share-to','bluetooth');assert.equal(toasts.at(-1),'unsupported');
}
// Hungarian strings come from the image's Contacts and Phone.
{
  const {ctx}=make('hu');assert.equal(IO.dialog('io',ctx).items[1].title,'Importálás USB-tárról');ctx.ui.gbctSimLoading=true;assert.match(IO.render('gbct-sim',ctx),/SIM/);
}
console.log('gb-contacts-io ok');
