const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},Intl};
for(const f of ['play-store.js','jb-play.js'])vm.runInNewContext(fs.readFileSync(`versions/4.3/${f}`,'utf8'),context);
const P=context.window.JBPlay;
const ctx=(o={})=>({lang:'en',locale:'en-US',page:'home',installed:[],everInstalled:[],downloading:'',phase:'',progress:0,plussed:[],autoUpdate:[],wishlist:[],rated:{},prefs:{notify:true,widgets:true,pin:false,autoMode:'wifi'},history:[],...o});
// Play Store 4.2.3 shipped with Android 4.3 (July 2013); no navigation drawer before 4.4.
assert.equal(P.VERSION,'4.2.3');
// Home: the six coloured category buttons, card clusters with SEE MORE, the All Access promo.
let html=P.render(ctx());
assert.deepEqual([...html.matchAll(/class="jbp-cat ([a-z]+)"/g)].map(m=>m[1]),['apps','games','movies','music','books','magazines']);
assert.match(html,/Albums from \$3\.99/);assert.match(html,/SEE MORE/);assert.match(html,/Get Unlimited Music/);assert.doesNotMatch(html,/drawer/);
assert.match(P.render(ctx({lang:'hu'})),/Magazinok/);
// Sections: coloured action bar, the tab strip with HOME selected, numbered top lists.
html=P.render(ctx({page:'section',section:'apps',tab:'HOME'}));assert.match(html,/--bar:#96aa39/);assert.match(html,/class="on" data-action="jbp-tab" data-id="HOME"/);assert.match(html,/Phone Highlights/);
html=P.render(ctx({page:'section',section:'games',tab:'TOP PAID'}));assert.match(html,/<b>1\. Lunar Golf<\/b>/);
// Details: INSTALL or the price, OPEN / UNINSTALL once installed, Rate & review, What's new, Reviews.
html=P.render(ctx({page:'detail',selected:'orbit'}));assert.match(html,/jbp-btn buy[^>]*>INSTALL</);assert.match(html,/Rate &amp; review/);assert.match(html,/What&#39;s new/);assert.match(html,/Reviews/);
assert.match(P.render(ctx({page:'detail',selected:'lunar-golf'})),/>\$0\.99</);
html=P.render(ctx({page:'detail',selected:'orbit',installed:['orbit']}));assert.match(html,/>OPEN</);assert.match(html,/>UNINSTALL</);
assert.match(P.render(ctx({page:'detail',selected:'orbit',downloading:'orbit',phase:'downloading',progress:.5})),/width:50%/);
// Dialogs and popups: permissions with ACCEPT, the card overflow, the auto-update list.
assert.match(P.dialog('perms',ctx({target:'orbit'})),/needs access to[^]*ACCEPT/);
html=P.dialog('card',ctx({target:'lunar-golf'}));assert.match(html,/Add to wishlist/);assert.match(html,/Buy \$0\.99/);
assert.match(P.dialog('card',ctx({target:'lunar-golf',wishlist:['lunar-golf']})),/Remove from wishlist/);
html=P.dialog('auto',ctx());assert.match(html,/Do not auto-update apps/);assert.match(html,/data-id="wifi" role="radio" aria-checked="true"/);
// My apps, wishlist, settings, the overflow menu.
html=P.render(ctx({page:'my-apps'}));assert.match(html,/Up to date/);assert.match(html,/INSTALLED/);
assert.match(P.render(ctx({page:'wishlist'})),/Your wishlist is empty\./);assert.match(P.render(ctx({page:'wishlist',wishlist:['mag-trail']})),/Trail &amp; Summit/);
html=P.render(ctx({page:'settings'}));assert.match(html,/Auto-update apps over Wi-Fi only/);assert.match(html,/Use password to restrict purchases/);assert.match(html,/Version: 4\.2\.3/);assert.match(html,/holo_light/);
assert.deepEqual([...P.menu(ctx()).map(m=>m.title)],['My apps','My wishlist','Redeem','Settings','Help']);
console.log('jb-play ok');
