const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},Intl,Date};
for(const f of ['email.js','gb-strings-email.js','gb-email.js'])vm.runInNewContext(fs.readFileSync(`versions/2.3.6/${f}`,'utf8'),context);
const G=context.window.GBEmail,E=context.window.ICSEmail,now=new Date(2026,9,2,15,0);
const mail=E.restore(null,[{id:1,from:'Android Team',subject:'Welcome',body:'Hi\nthere',time:'9:41 AM'},{id:2,from:'Alex',subject:'Photos',body:'Look',time:'Yesterday'}],[]);
mail[1].read=true;mail[1].starred=true;mail[1].attachment={name:'Sea.jpg',colors:['#123']};
const ctx=(o={})=>({lang:'en',locale:'en-US',hour24:false,now,sub:'',folder:'Inbox',mail,item:mail[0],selected:[],query:undefined,cc:false,error:'',photos:[{id:1,name:'Sea'}],target:mail[0],...o});
// MessageList: title with the mailbox and account, unread / read rows, dates, star, attachment icon, the organize bar.
let html=G.render(ctx());
assert.match(html,/gbem-title"><span>Inbox<\/span><small>demo@example.com<\/small>/);
assert.match(html,/gbem-item unread"><i class="gbem-chip"><\/i>/);assert.match(html,/gbem-date">9:41 AM</);assert.match(html,/gbem-date">10\/1\/2026</);
assert.match(html,/gbem-fav on"/);assert.match(html,/ic_email_attachment_small/);assert.doesNotMatch(html,/gbem-bottombar/);
html=G.render(ctx({selected:[mail[1].id]}));
assert.match(html,/gbem-item checked"/);assert.match(html,/>Mark unread<\/button><button data-action="gbem-selected-star">Remove star</);assert.match(html,/email-selected-trash">Delete</);
assert.match(G.render(ctx({query:'pho'})),/gbem-search/);assert.equal((G.render(ctx({query:'pho'})).match(/class="gbem-item/g)||[]).length,1);
// MailboxList and AccountFolderList.
html=G.render(ctx({sub:'mailboxes'}));
assert.match(html,/Mailbox/);for(const f of ['Inbox','Drafts','Outbox','Sent','Trash'])assert.match(html,new RegExp(`data-id="${f}"`));assert.match(html,/gbem-count unread">1</);
html=G.render(ctx({sub:'accounts'}));
assert.match(html,/Combined Inbox/);assert.match(html,/Starred<\/span><b class="gbem-count sum">1</);assert.doesNotMatch(html,/Outbox/);assert.match(html,/gbem-separator">Accounts</);
// MessageView: arrows (no newer for the first message), header, body with line breaks, Reply / Reply all / Delete.
html=G.render(ctx({sub:'read'}));
assert.match(html,/class="left" disabled/);assert.match(html,new RegExp(`class="right" data-action="email-read" data-id="${mail[1].id}"`));
assert.match(html,/gbem-hfrom">Android Team</);assert.match(html,/<b>To:<\/b><span class="grow">demo@example.com/);assert.match(html,/Hi<br>there/);
assert.match(html,/>Reply<\/button><button data-action="gbem-reply-all">Reply all<\/button><button data-action="email-trash">Delete</);
assert.match(G.render(ctx({sub:'read',item:mail[1]})),/gbem-attachment/);
// Compose: hints, Cc / Bcc on demand, quoted text bar, Send / Save as draft / Discard.
const draft={...E.draft(mail[0]),quoted:G.quote(mail[0],false,'en'),body:''};
html=G.render(ctx({sub:'compose',item:draft}));
assert.match(html,/Compose/);assert.match(html,/placeholder="To"/);assert.doesNotMatch(html,/placeholder="Cc"/);assert.match(html,/placeholder="Compose Mail"/);
assert.match(html,/Quoted text/);assert.match(html,/Android Team wrote:<br><br>Hi<br>there/);assert.match(html,/>Save as draft</);
assert.match(G.render(ctx({sub:'compose',item:draft,cc:true})),/placeholder="Bcc"/);
assert.match(G.quote(mail[0],true,'en'),/-------- Original Message --------\nSubject: Welcome\nFrom: Android Team/);
// Menus and the context menu.
assert.deepEqual([...G.menu(ctx()).map(i=>i.title)],['Refresh','Compose','Folders','Accounts','Account settings']);
assert.equal(G.menu(ctx({selected:['x']}))[2].title,'Deselect all');
assert.deepEqual([...G.menu(ctx({sub:'read'})).map(i=>i.title)],['Delete','Forward','Reply','Reply all','Mark as unread']);
assert.deepEqual([...G.menu(ctx({sub:'compose',item:draft})).map(i=>i.action)],['email-cc','gbem-send','gbem-save-draft','gbem-discard','email-attach']);
assert.equal(G.dialog('context',ctx()).items.length,6);assert.equal(G.dialog('context',ctx({target:{...mail[0],folder:'Drafts'}})).items[1].title,'Discard');
assert.equal(G.dialog('attach',ctx()).items[0].action,'email-attach-photo');
// Translations.
assert.equal(G.folderName('Inbox','hu'),'Beérkezett üzenetek');assert.equal(G.text('de','message_deleted_toast_other'),'Nachrichten gelöscht');
console.log('gb-email ok');
