const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};
for(const f of ['gb-strings-contacts.js','gb-contact-editor.js'])vm.runInNewContext(fs.readFileSync(`versions/2.3.6/${f}`,'utf8'),context);
const G=context.window.GBContactEditor;
const ctx=(o={})=>({lang:'en',draft:{id:1,name:'Alex Morgan',phone:'202-555-0148',email:'',company:undefined},isNew:false,moreName:false,secondary:false,familyFirst:false,...o});
// Names split into given / family and join back.
assert.deepEqual({...G.split('Mary Ann Smith')},{given:'Mary Ann',family:'Smith'});assert.deepEqual({...G.split('Mom')},{given:'Mom',family:''});assert.equal(G.join(' Alex ','Morgan'),'Alex Morgan');
// Editor: title, account header, photo, name fields, Phone with its label and minus, Email row, Organization plus, More, Done / Revert.
let html=G.render(ctx());
assert.match(html,/gb-titlebar">Edit contact</);assert.match(html,/Phone-only, unsynced/);assert.match(html,/gbce-photo/);
assert.match(html,/name="given" value="Alex" placeholder="Given name"/);assert.match(html,/name="family" value="Morgan" placeholder="Family name"/);
assert.match(html,/data-id="phone">Mobile<\/button><input class="gbce-field" type="tel" name="phone" value="202-555-0148"/);
assert.match(html,/type="email" name="email" value=""/);assert.match(html,/gbce-add" data-id="company"/);assert.match(html,/>More</);
assert.match(html,/type="submit">Done</);assert.match(html,/>Revert</);
assert.match(G.render(ctx({isNew:true})),/New contact/);
// Expanded name, the secondary section with Notes, a removed phone row, a chosen label.
html=G.render(ctx({moreName:true,secondary:true,draft:{name:'A B',phone:null,email:'a@b.c',emailType:'work',notes:'hi'}}));
assert.match(html,/Name prefix/);assert.match(html,/Middle name/);assert.match(html,/Name suffix/);assert.match(html,/name="notes" value="hi"/);
assert.match(html,/gbce-add" data-id="phone"/);assert.match(html,/data-id="email">Work</);assert.match(html,/gbce-round less/);
// Label dialog and translations.
const d=G.dialog('phone',ctx());assert.equal(d.title,'Select label');assert.deepEqual([...d.items.map(i=>i.title)],['Home','Mobile','Work','Other']);assert.equal(d.selected,1);
assert.equal(G.typeLabel('phone','work','hu'),'Munkahelyi');assert.equal(G.text('de','menu_done'),'Fertig');
console.log('gb-contact-editor ok');
