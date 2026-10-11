require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},Intl};
for(const f of ['play-store.js','lp-play.js'])vm.runInNewContext(fs.readFileSync(`versions/5.1.1/${f}`,'utf8'),context);
const P=context.window.JBPlay;
const ctx=(o={})=>({lang:'en',locale:'en-US',page:'home',installed:[],everInstalled:[],downloading:'',phase:'',progress:0,plussed:[],autoUpdate:[],wishlist:[],rated:{},prefs:{notify:true,shortcuts:true,autoMode:'wifi',auth:'session'},history:[],...o});
// Play Store 5.2.13 is the LMY48Y image's Phonesky.apk; texts from its resources in five languages.
assert.equal(P.VERSION,'5.2.13');
assert.notEqual(P.text('de','READ MORE'),'READ MORE');assert.equal(P.text('en','Help & Feedback'),'Help & Feedback');
// Home: the drawer toggle, the corpus quick links in upper case, clusters with the MORE box.
let html=P.render(ctx());
assert.match(html,/data-action="kkp-drawer"/);assert.match(html,/>NEWSSTAND</);assert.match(html,/MORE<\/em>/);
assert.match(P.render(ctx({lang:'hu'})),/ÚJSÁGOS/);
// The drawer (FinskyDrawerLayout): primary actions, then Redeem, Settings, Help & Feedback.
html=P.dialog('drawer',ctx());
assert.deepEqual([...html.matchAll(/class="lpp-nav-item[^"]*" data-action="[^"]+">(?:<i class="[a-z]+"><\/i>)?([^<]+)</g)].map(m=>m[1]),['Store home','My apps','My wishlist','People','My account','Redeem','Settings','Help &amp; Feedback']);
assert.match(html,/lpp-nav-item on" data-action="kkp-home"/);
// Corpus colours and the status bar (play_*_primary / status_bar_*); Settings is black under the #455A64 bar.
assert.match(P.render(ctx({page:'section',section:'movies',tab:'Home'})),/--c:#ED3B3B/);
assert.equal(P.statusColor(ctx({page:'section',section:'music'})),'#E65100');assert.equal(P.statusColor(ctx({page:'settings'})),'#000000');
// Details in DETAILS_MODULES order: title, discovery bar, description, screenshots, reviews, secondary actions, similar, developer.
html=P.render(ctx({page:'detail',selected:'orbit'}));
const order=['lpp-title','lpp-discovery','lpp-desc','lpp-shots','lpp-reviews','lpp-secondary','lpp-cluster','lpp-bylines','lpp-footer'].map(c=>html.indexOf(c));
assert.deepEqual(order,[...order].sort((a,b)=>a-b));assert.ok(order.every(i=>i>0));
assert.match(html,/>INSTALL</);assert.match(html,/READ MORE/);assert.doesNotMatch(html,/Rate this app/);assert.match(html,/Permission details/);
html=P.render(ctx({page:'detail',selected:'orbit',installed:['orbit']}));assert.match(html,/>UNINSTALL<[^]*>OPEN</);assert.match(html,/Rate this app/);assert.match(html,/What&#39;s new/);
assert.deepEqual([...P.menu(ctx({page:'detail',selected:'orbit',installed:['orbit']})).map(m=>m.title)],['Auto-update']);assert.equal(P.menu(ctx()).length,0);
// Permissions (buckets), review dialog, settings (res/xml/settings.xml of 5.2.13).
html=P.dialog('perms',ctx({target:'orbit'}));assert.match(html,/<b>Orbit Hopper<\/b> needs access to/);assert.match(html,/Photos\/Media\/Files/);assert.match(html,/>ACCEPT</);
assert.match(P.dialog('rate',ctx({target:'orbit',rateDraft:5})),/Loved it/);
html=P.render(ctx({page:'settings'}));assert.match(html,/Add icon to Home screen/);assert.match(html,/Clear local search history/);assert.match(html,/Require authentication[^]*Every 30 minutes/);assert.match(html,/Version: 5\.2\.13/);
assert.deepEqual([...P.dialog('auth',ctx()).matchAll(/data-id="([a-z]+)" role="radio"/g)].map(m=>m[1]),['always','session','never']);
for(const lang of ['hu','de','fr','es'])for(const page of ['home','settings','my-apps','wishlist'])assert.doesNotMatch(P.render(ctx({lang,page})),/undefined/);
console.log('lp-play ok');
