const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Galaxy Nexus: Gmail 4.0.4 (Gmail.apk of IMM76I): layouts, menus and texts from the image.
const w={};w.window=w;vm.runInNewContext(fs.readFileSync('versions/4.0.4/ics-gmail.js','utf8'),w);
const G=w.ICSGmail,now=Date.UTC(2012,4,20,12),data={gmail40:G.restore(null,now)};
const ctx=(ui,lang='en')=>({data,ui,lang,locale:'en-US',now,save(){},render(){},renderOverlay(){},toast(t){ctx.last=t;},focus(){},keep(){},submit(){}});
// The list: spinner with label and account, the big unread count, carets, check boxes, stars, the split bar with overflow.
let html=G.render(ctx({}));
assert.ok(html.includes('g4-spinner')&&html.includes('<em class="g4-unread">2</em>')&&html.includes('g4-ic_email_caret_double_important_unread')&&html.includes('g4-ic_email_caret_single.png'));
assert.ok(html.includes('btn_check_off_normal_holo_light')&&html.includes('btn_star_on_normal_gmail_holo_light')&&html.includes('data-action="g4-more" data-id="list"'));
assert.ok(!html.includes('kem-'),'no KitKat Email assets');
// Overflow menus follow the menu XML.
const ui={overlay:'g4-more',g4Menu:'list'};let menu=G.overlay(ctx(ui));
assert.deepEqual([...menu.matchAll(/>([^<>]+)<\/button>/g)].map(m=>m[1]),['Label settings','Settings','Help','Send feedback']);
ui.g4Selected=['g4-1'];ui.g4Menu='selection';menu=G.overlay(ctx(ui));
assert.deepEqual([...menu.matchAll(/>([^<>]+)<\/button>/g)].map(m=>m[1]),['Mark not important','Mute','Report spam']);
html=G.render(ctx({g4Selected:['g4-1']}));assert.ok(html.includes('Mark read')&&html.includes('ic_menu_star_holo_light')&&html.includes('ic_menu_labels_holo_light'));
// Recent labels spinner: Inbox and default_recent_labels (Starred, Sent, Drafts), Show all labels.
menu=G.overlay(ctx({overlay:'g4-recent'}));assert.ok(menu.includes('>Recent<')&&menu.includes('>Show all labels<')&&menu.indexOf('>Starred<')<menu.indexOf('>Sent<'));
// The conversation: the blue message header with Reply and its overflow (Reply all, Forward).
html=G.render(ctx({sub:'conversation',g4Id:'g4-2'}));assert.ok(html.includes('g4-mh')&&html.includes('ic_reply_holo_dark')&&html.includes('g4-ic_contact_picture.png'));
menu=G.overlay(ctx({overlay:'g4-more',g4Menu:'message',g4Id:'g4-2'}));assert.ok(menu.includes('>Reply all<')&&menu.includes('>Forward<')&&!menu.includes('>Reply<'));
// Handlers: Mute leaves the inbox, Report spam moves to Spam, Mark read.
const c=ctx({g4Selected:['g4-3']});G.handle('g4-spam','',c);assert.equal(data.gmail40.find(m=>m.id==='g4-3').label,'Spam');
const c2=ctx({g4Selected:['g4-4']});G.handle('g4-mute','',c2);assert.equal(data.gmail40.find(m=>m.id==='g4-4').label,'All mail');
const c3=ctx({g4Selected:['g4-1']});G.handle('g4-read','',c3);assert.equal(data.gmail40.find(m=>m.id==='g4-1').read,true);
// Labels: Recent labels and All labels headings; Hungarian from the image.
html=G.render(ctx({sub:'labels'},'hu'));assert.ok(html.includes('Legutóbbi címkék')&&html.includes('Minden címke')&&html.includes('Címkék kezelése'));
menu=G.overlay(ctx({overlay:'g4-more',g4Menu:'conversation',g4Id:'g4-2'},'hu'));assert.ok(menu.includes('Ez spam')&&menu.includes('Lezárás')&&menu.includes('Visszajelzés'));
console.log('ics-gmail ok');
