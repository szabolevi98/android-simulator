const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},Intl};
for(const f of ['play-store.js','kk-play.js'])vm.runInNewContext(fs.readFileSync(`versions/4.4.4/${f}`,'utf8'),context);
const P=context.window.JBPlay;
const ctx=(o={})=>({lang:'en',locale:'en-US',page:'home',installed:[],everInstalled:[],downloading:'',phase:'',progress:0,plussed:[],autoUpdate:[],wishlist:[],rated:{},prefs:{notify:true,widgets:true,autoMode:'wifi',password:'30'},history:[],...o});
// Play Store 4.8.22 (July 2014) with Android 4.4.4 on the Nexus 5: navigation drawer, no overflow menu.
assert.equal(P.VERSION,'4.8.22');
assert.equal(P.menu(ctx()).length,0);
// Store home: drawer indicator, "Play Store", the six tiles with Newsstand, the permissions note, MORE clusters.
let html=P.render(ctx());
assert.match(html,/data-action="kkp-drawer"/);assert.match(html,/<b>Play Store<\/b>/);assert.doesNotMatch(html,/jbp-overflow/);
assert.deepEqual([...html.matchAll(/class="jbp-cat ([a-z]+)"/g)].map(m=>m[1]),['apps','games','movies','music','books','magazines']);
assert.match(html,/NEWSSTAND|Newsstand/);assert.match(html,/We&#39;ve simplified app permissions\./);assert.match(html,/New \+ Updated Games/);assert.match(html,/>MORE</);assert.match(html,/data-tab="TRENDING"/);
assert.doesNotMatch(P.render(ctx({permNoteSeen:true})),/kkp-note/);
assert.match(P.render(ctx({lang:'hu'})),/Újságos/);
// The drawer: account header, Store home in bold on the home page, Redeem / Settings / Help in the footer.
html=P.dialog('drawer',ctx());assert.match(html,/kkp-nav-item on" data-action="kkp-home">Store home/);assert.match(html,/data-action="jbp-my-apps">My apps/);assert.match(html,/REDEEM[^]*SETTINGS[^]*HELP/);
assert.match(P.dialog('drawer',ctx({page:'my-apps'})),/kkp-nav-item on" data-action="jbp-my-apps"/);
// Sub-pages get the up caret; details put share left of the search and end with Additional information.
html=P.render(ctx({page:'detail',selected:'orbit'}));assert.match(html,/data-action="back"/);assert.match(html,/jbp-share[^]*jbp-search/);assert.match(html,/>INSTALL</);assert.match(html,/Additional information/);assert.match(html,/kkp-perm-details/);
html=P.render(ctx({page:'detail',selected:'orbit',installed:['orbit']}));assert.match(html,/>OPEN</);assert.match(html,/>UNINSTALL</);
// Installed cards carry the green check.
assert.match(P.render(ctx({installed:['orbit']})),/kkp-check/);
// 4.8 permissions: grouped rows, no "full network access", ACCEPT (or OK from Permission details), expandable groups.
html=P.dialog('perms',ctx({target:'orbit'}));assert.match(html,/needs access to/);assert.match(html,/Photos\/Media\/Files/);assert.doesNotMatch(html,/full network access/);assert.match(html,/>ACCEPT</);
assert.match(P.dialog('perms',ctx({target:'pocket-planner',permOpen:'wifi'})),/view Wi-Fi connections/);
assert.match(P.dialog('perms',ctx({target:'orbit',permView:true})),/data-action="close-overlay">OK</);
assert.match(P.dialog('perms',ctx({lang:'hu',target:'orbit',permOpen:'files'})),/USB-tár törlése\/módosítása/);
// My apps: drawer page, Recently updated / Installed groups.
html=P.render(ctx({page:'my-apps',installed:['lunar-golf']}));assert.match(html,/kkp-drawer/);assert.match(html,/Recently updated/);assert.match(html,/Installed<\/span>/);
// Settings 4.8.22 and the Require password list in its real order.
html=P.render(ctx({page:'settings'}));assert.match(html,/Add icon to Home screen/);assert.match(html,/Require password for purchases/);assert.match(html,/Every 30 minutes/);assert.match(html,/Version: 4\.8\.22/);
html=P.dialog('password',ctx());assert.deepEqual([...html.matchAll(/data-id="([a-z0-9]+)" role="radio"/g)].map(m=>m[1]),['always','30','never']);assert.match(html,/data-id="30" role="radio" aria-checked="true"/);
// Every label exists in all five languages.
for(const lang of ['hu','de','fr','es'])for(const page of ['home','settings','my-apps'])assert.doesNotMatch(P.render(ctx({lang,page})),/undefined/);
console.log('kk-play ok');
