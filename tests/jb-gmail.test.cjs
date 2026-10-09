const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Nexus 4: Gmail 4.5.1 (Gmail2.apk of JWR66Y): sectioned inbox teaser, drawer, counts and texts from the image.
const w={};w.window=w;
for(const f of ['stock-strings.js','email.js','jb-email.js','gmail.js'])vm.runInNewContext(fs.readFileSync(`versions/4.3/${f}`,'utf8'),w);
const {GmailApp:G,KKEmail:K}=w;
const mail=G.restore(null,Date.UTC(2013,7,20,12));
const data={gmailbox:mail},ui={emailFolder:'Primary'},t=k=>k,emailT=k=>K.tr('en',k);
const list=K.render(mail,ui,t,'en','en',G.options(data,ui,'en',emailT));
assert.ok(list.includes('jellybean.demo@gmail.com')||list.includes('3 unread'));
assert.ok(list.includes('3 unread')&&list.includes('Welcome to your new Inbox')&&list.includes('2 New')&&list.includes('1 New')&&list.includes('gm-ic_menu_inbox_social_holo_light'));
const drawer=K.overlay(mail,{...ui,overlay:'email-drawer'},[],t,'en',G.options(data,ui,'en',emailT));
for(const label of ['Inbox','Primary','Social','Promotions','Priority Inbox','All labels','Important','All mail','Spam'])assert.ok(drawer.includes(`>${label}<`),label);
assert.ok(drawer.includes('jellybean.demo@gmail.com')&&drawer.includes('<em class="gm-unseen" style="background:#4880d7">2</em>'));
const hu=K.render(mail,ui,t,'hu','hu',G.options(data,ui,'hu',emailT));
assert.ok(hu.includes('3 olvasatlan')&&hu.includes('2 új')&&hu.includes('Kategóriák módosítása'));
const opened=K.render(mail,ui,t,'en','en',G.options({...data,gmailWelcomeSeen:true,gmailSeen:{Social:Date.now(),Promotions:Date.now()}},ui,'en',emailT));
assert.ok(!opened.includes('gm-teaser'),'no teaser without unseen mail after onboarding');
assert.ok(fs.readFileSync('versions/4.3/gmail.css','utf8').includes('font-style:italic;color:#33b5e5'));
console.log('jb-gmail ok');
