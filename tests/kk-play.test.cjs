require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},Intl};
for(const f of ['play-store.js','kk-play.js'])vm.runInNewContext(fs.readFileSync(`versions/4.4.4/${f}`,'utf8'),context);
const P=context.window.JBPlay;
const ctx=(o={})=>({lang:'en',locale:'en-US',page:'home',installed:[],everInstalled:[],downloading:'',phase:'',progress:0,plussed:[],autoUpdate:[],wishlist:[],rated:{},prefs:{notify:true,shortcuts:true,password:false,autoMode:'wifi'},history:[],...o});
// Play Store 4.5.10 is the KTU84P image's Phonesky.apk: side drawer, the overflow keeps Settings and Help (menu/base.xml).
assert.equal(P.VERSION,'4.5.10');
assert.deepEqual([...P.menu(ctx()).map(m=>m.title)],['Settings','Help']);
assert.deepEqual([...P.menu(ctx({page:'detail',selected:'orbit'})).map(m=>m.title)],['Share','Settings','Help']);
// Texts from the APK in five languages.
assert.equal(P.text('hu','Store home'),P.text('hu','Store home'));assert.notEqual(P.text('de','Rate this app'),'Rate this app');
// Store home: the drawer toggle, the six corpus links with Newsstand, clusters with the more box.
let html=P.render(ctx());
assert.match(html,/data-action="kkp-drawer"/);assert.match(html,/jbp-caret drawer/);
assert.deepEqual([...html.matchAll(/class="jbp-cat ([a-z]+)"/g)].map(m=>m[1]),['apps','games','movies','music','books','magazines']);
assert.match(html,/Newsstand/);assert.match(html,/MORE<\/em>/);
assert.match(P.render(ctx({lang:'hu'})),/Újságos/);
// The drawer (SideDrawerDestinationsAdapter): Store home, My apps, My wishlist, Redeem; the current one bold.
html=P.dialog('drawer',ctx());assert.deepEqual([...html.matchAll(/class="kkp-nav-item[^"]*" data-action="[^"]+">([^<]+)</g)].map(m=>m[1]),['Store home','My apps','My wishlist','Redeem']);
assert.match(html,/kkp-nav-item on" data-action="kkp-home"/);
assert.match(P.dialog('drawer',ctx({page:'my-apps'})),/kkp-nav-item on" data-action="jbp-my-apps"/);
// Newsstand's corpus bar (action_bar_bg_newss).
assert.match(P.render(ctx({page:'section',section:'magazines',tab:'Featured'})),/--bar:#3F5CA9;--edge:#364F91/);
// Details: up caret, the wishlist bookmark; owned apps get "Rate this app" and What's new first.
html=P.render(ctx({page:'detail',selected:'orbit'}));assert.match(html,/data-action="back"/);assert.match(html,/jbp-ab wish/);assert.match(html,/>INSTALL</);assert.doesNotMatch(html,/Rate this app/);
html=P.render(ctx({page:'detail',selected:'orbit',installed:['orbit']}));assert.match(html,/>OPEN</);assert.match(html,/>UNINSTALL</);assert.match(html,/Rate this app/);assert.match(html,/data-stars="5"/);assert.match(html,/What&#39;s new[^]*Description/);
// Permissions, review dialog, empty wishlist, settings (same settings.xml as 4.2.3).
html=P.dialog('perms',ctx({target:'orbit'}));assert.match(html,/<b>Orbit Hopper<\/b>/);assert.match(html,/>ACCEPT</);
assert.match(P.dialog('rate',ctx({target:'orbit',rateDraft:5})),/Excellent/);
assert.match(P.render(ctx({page:'wishlist'})),/jbp-wish-empty kkp/);
html=P.render(ctx({page:'settings'}));assert.match(html,/Auto-add shortcuts/);assert.match(html,/Use password to restrict purchases/);assert.match(html,/Version: 4\.5\.10/);
// Every label exists in all five languages.
for(const lang of ['hu','de','fr','es'])for(const page of ['home','settings','my-apps'])assert.doesNotMatch(P.render(ctx({lang,page})),/undefined/);
console.log('kk-play ok');
