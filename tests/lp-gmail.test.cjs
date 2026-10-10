const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Nexus 6: Gmail 5.0.2 (PrebuiltGmail.apk of LMY48Y): the sectioned inbox teaser and texts from the image.
const w={};w.window=w;
for(const f of ['stock-strings.js','email.js','kk-email.js','lp-email.js','gmail.js'])if(fs.existsSync(`versions/5.1.1/${f}`))vm.runInNewContext(fs.readFileSync(`versions/5.1.1/${f}`,'utf8'),w);
const G=w.GmailApp,mail=G.restore(null,Date.UTC(2015,5,20,12)),data={gmailbox:mail},ui={emailFolder:'Primary'};
const o=G.options(data,ui,'en',k=>k);
let top=o.top('Primary');
assert.ok(top.includes('Welcome to your new Inbox')&&top.includes('gm5-ic_teaser_social_24dp')&&top.includes('gm5-ic_teaser_promos_24dp')&&top.includes('<em>2</em>')&&top.includes('<em>1</em>'));
assert.ok(!/New/.test(top.replace('Welcome to your new Inbox','')),'Gmail 5 shows the unseen number alone');
// After onboarding only the sections with unseen mail; opening Social marks it seen.
top=G.options({...data,gmailWelcomeSeen:true,gmailSeen:{Social:Date.now()}},ui,'en',k=>k).top('Primary');
assert.ok(!top.includes('data-id="Social"')&&top.includes('data-id="Promotions"')&&!top.includes('gm-welcome'));
// Updates and Forums join the teaser and the drawer when enabled in Inbox categories.
const on={...data,gmailPrefs:{'category-updates':true}},o2=G.options(on,ui,'en',k=>k);
assert.ok(o2.top('Primary').includes('data-id="Updates"')&&o2.folders[0][1].includes('Updates')&&!o2.folders[0][1].includes('Forums'));
// Hungarian from the image.
const hu=G.options(data,ui,'hu',k=>k);
assert.ok(hu.top('Primary').includes('Üdvözli a beérkező üzenetek megújult fiókja')&&hu.folderName('All labels')==='Minden címke'&&hu.folderName('Promotions')==='Promóciók');
const css=fs.readFileSync('versions/5.1.1/gmail.css','utf8');assert.ok(!css.includes('.gm-category')&&!fs.readFileSync('versions/5.1.1/lp-email.css','utf8').includes('.gm-'));
console.log('lp-gmail ok');
