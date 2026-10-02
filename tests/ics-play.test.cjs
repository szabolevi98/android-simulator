const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},Intl};
for(const f of ['play-store.js','ics-play.js'])vm.runInNewContext(fs.readFileSync(`versions/4.0.4/${f}`,'utf8'),context);
const P=context.window.ICSPlay;
const ctx=(o={})=>({lang:'en',locale:'en-US',page:'home',installed:[],everInstalled:[],downloading:'',phase:'',progress:0,plussed:[],autoUpdate:[],prefs:{notify:true,autoUpdate:false,wifiOnly:false,widgets:true,pin:false,pinSet:false,admob:true},history:[],query:'',...o});
// Play Store 3.8.17 (August 2012) on the 4.0.4 Galaxy Nexus.
assert.equal(P.VERSION,'3.8.17');
// Home: five tiles in the 3.8.17 order without "see more", the green Games tile, promo banners with their section stripe.
let html=P.render(ctx());
assert.deepEqual([...html.matchAll(/class="icsp-tile ([a-z]+)"/g)].map(m=>m[1]),['apps','music','magazines','movies','books']);
assert.match(html,/<b>Movies &amp; TV<\/b>/);assert.match(html,/<b>Magazines<\/b>/);assert.doesNotMatch(html,/see more/);
assert.match(html,/icsp-games/);assert.match(html,/icsp-promo space" style="--c:#9fc33b"/);
assert.match(P.render(ctx({lang:'hu'})),/Magazinok/);
// Magazines: its own section with tabs and categories, covers without screenshots.
html=P.render(ctx({page:'section',section:'magazines',tab:'FEATURED'}));assert.match(html,/Pocket Tech Monthly/);assert.match(html,/TOP SELLING/);
assert.match(P.render(ctx({page:'section',section:'magazines',tab:'CATEGORIES'})),/Food &amp; Cooking/);
html=P.render(ctx({page:'detail',selected:'mag-trail'}));assert.match(html,/Trail &amp; Summit/);assert.doesNotMatch(html,/icsp-shots/);assert.match(html,/August 9, 2012/);
// Settings: Unlock settings (disabled without a PIN), the AdMob note with Learn more, build 3.8.17.
html=P.render(ctx({page:'settings'}));
assert.match(html,/data-action="icsp-unavailable" disabled><span><b>Unlock settings/);assert.match(html,/Choose whether to personalize ads from Google and AdMob/);assert.match(html,/<u>Learn more<\/u>/);assert.match(html,/Version: 3\.8\.17/);
assert.doesNotMatch(P.render(ctx({page:'settings',prefs:{pinSet:true,admob:true}})),/disabled><span><b>Unlock settings/);
console.log('ics-play ok');
