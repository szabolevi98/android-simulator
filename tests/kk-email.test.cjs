const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{ICSMedia:{art:p=>`<img src="${p.id}">`}},Intl};
for(const f of ['email.js','kk-email.js'])vm.runInNewContext(fs.readFileSync(`versions/4.4.4/${f}`,'utf8'),context);
const E=context.window.ICSEmail,K=context.window.KKEmail;
const mail=E.restore(null,[{id:1,from:'Android Team',subject:'Welcome',body:'Hi there',time:'9:41 AM'},{id:2,from:'Alex Morgan',subject:'Photos',body:'Look',time:'Yesterday'}],[]);
const t=k=>k;
// LetterTileProvider: Java hashCode picks one of the eight colours; non-letters fall back to ic_generic_man.
assert.equal(K.hash('a'),97);assert.equal(K.hash('android@example.com'),(()=>{let h=0;for(const c of 'android@example.com')h=(h*31+c.charCodeAt(0))|0;return h})());
assert.match(K.tile('Alex','alex@example.com'),/>A</);assert.match(K.tile('1-800','x@y.z'),/ic_generic_man/);
// The conversation list: drawer indicator, folder title over the account, Compose / Search / overflow, rows with tiles and stars.
let html=K.render(mail,{emailFolder:'Inbox'},t,'en-US','en');
assert.match(html,/data-action="email-drawer"[^]*kem-ic_drawer/);assert.match(html,/<b>Inbox<\/b><small>demo@example\.com<\/small>/);assert.match(html,/email-compose[^]*email-search[^]*email-menu/);
assert.match(html,/kem-row unread[^]*kem-tile[^]*Android Team[^]*9:41 AM[^]*Welcome<\/span> — <span class="kem-snippet">Hi there/);assert.match(html,/ic_btn_star_off/);
assert.match(K.render(mail,{emailFolder:'Inbox'},t,'en-US','hu'),/Beérkezett üzenetek/);
// Selecting through the sender image: the check tile and the CAB.
html=K.render(mail,{emailFolder:'Inbox',emailSelected:[mail[0].id]},t,'en-US','en');assert.match(html,/ic_avatar_check/);assert.match(html,/kem-bar cab[^]*<b>1<\/b>[^]*email-selected-trash[^]*email-selected-read/);
// The drawer: the selected account row, then the flat folder list with unread counts.
html=K.overlay(mail,{overlay:'email-drawer',emailFolder:'Inbox'},[],t,'en');assert.match(html,/kem-account[^]*demo@example\.com<\/span><em>2<\/em>/);assert.deepEqual([...html.matchAll(/data-action="email-folder" data-id="(\w+)"/g)].map(m=>m[1]).join(),'Inbox,Starred,Drafts,Outbox,Sent,Trash');
// The conversation: Delete and Mark unread promoted, "To: me", reply.
html=K.render(mail,{sub:'read',emailId:mail[0].id,emailFolder:'Inbox'},t,'en-US','en');assert.match(html,/email-trash[^]*email-unread[^]*email-menu/);assert.match(html,/To: me/);assert.match(html,/email-reply/);
// Compose: From, To, Subject, the "Compose email" hint, Send; the overflow keeps the rest.
const d=E.draft(null);mail.unshift(d);html=K.render(mail,{sub:'compose',emailId:d.id},t,'en-US','en');assert.match(html,/kem-from">demo@example\.com/);assert.match(html,/placeholder="Compose email"/);assert.match(html,/type="submit"[^]*ic_menu_send/);
html=K.overlay(mail,{overlay:'email-menu',emailMenu:'compose'},[],t,'en');assert.match(html,/Attach picture[^]*Add Cc\/Bcc[^]*Save draft[^]*Discard/);
console.log('kk-email ok');
