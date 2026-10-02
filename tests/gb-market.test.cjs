const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};
for(const f of ['play-store.js','gb-market.js'])vm.runInNewContext(fs.readFileSync(`versions/2.3.6/${f}`,'utf8'),context);
const G=context.window.GBMarket;
const ctx=(o={})=>({lang:'en',locale:'en-US',page:'home',installed:[],downloading:'',phase:'',progress:0,plussed:[],autoUpdate:[],prefs:{notify:true,pin:false},searching:false,editValue:'',history:[],...o});
// Home: action bar without back, promo, four colour-coded section tiles with "see more", featured cards with price.
let html=G.render(ctx());
assert.match(html,/gbmk-up root/);assert.match(html,/<b>Market<\/b>/);assert.match(html,/gbmk-promo/);
for(const [id,label,color] of [['apps','Apps','#a4c639'],['games','Games','#8cba2e'],['books','Books','#3d8fd6'],['movies','Movies','#d8473e']])assert.match(html,new RegExp(`gbmk-tile ${id}" style="--c:${color}" data-action="gbmk-section" data-id="${id}"><b>${label}</b>`));
assert.match(html,/see more ›/);assert.equal((html.match(/class="gbmk-card"/g)||[]).length,4);assert.match(html,/\$1\.99/);
// Sections: the tab strip with neighbours, featured, categories, top lists split into free and paid.
html=G.render(ctx({page:'section',section:'games',tab:'FEATURED'}));
assert.match(html,/data-id="CATEGORIES"[^>]*>CATEGORIES<\/button><b>FEATURED<\/b><button data-action="gbmk-tab" data-id="TOP PAID"/);assert.match(html,/gbmk-banner/);
assert.match(G.render(ctx({page:'section',section:'games',tab:'CATEGORIES'})),/Arcade &amp; Action/);
html=G.render(ctx({page:'section',section:'games',tab:'TOP PAID'}));assert.match(html,/Lunar Golf/);assert.doesNotMatch(html,/Orbit Hopper/);
html=G.render(ctx({page:'section',section:'games',tab:'TOP FREE'}));assert.match(html,/Orbit Hopper/);assert.doesNotMatch(html,/Lunar Golf/);
assert.doesNotMatch(G.render(ctx({page:'section',section:'books',tab:'TOP FREE'})),/TOP GROSSING/);
// Details: header, price button, green rules, screenshots, info rows, +1, description; installed and downloading states.
html=G.render(ctx({page:'detail',selected:'orbit'}));
assert.match(html,/gbmk-head-art gbmk-svg/);assert.match(html,/MOONLIGHT STUDIO/);assert.match(html,/gbmk-price" data-action="gbmk-buy" data-id="orbit">FREE</);assert.match(html,/gbmk-rule/);
assert.equal((html.match(/gbmk-shot n/g)||[]).length,3);assert.match(html,/downloads/);assert.match(html,/Size: 12 MB/);assert.match(html,/people \+1&#39;d this/);assert.match(html,/DESCRIPTION/);
html=G.render(ctx({page:'detail',selected:'orbit',installed:['orbit']}));assert.match(html,/>Open<\/button><button data-action="gbmk-uninstall" data-id="orbit">Uninstall/);assert.match(html,/Allow automatic updating/);
html=G.render(ctx({page:'detail',selected:'camera'}));assert.match(html,/data-id="camera" disabled>Uninstall/);
html=G.render(ctx({page:'detail',selected:'orbit',downloading:'orbit',phase:'downloading',progress:.5}));assert.match(html,/Downloading…/);assert.match(html,/width:50%/);assert.match(html,/gbmk-cancel/);
assert.match(G.render(ctx({page:'detail',selected:'orbit',downloading:'orbit',phase:'installing'})),/Installing…/);
// Permissions, My apps, search with suggestions and results, settings, menu.
assert.match(G.render(ctx({page:'permissions',selected:'orbit'})),/Accept &amp; download/);
html=G.render(ctx({page:'my-apps',installed:['orbit']}));assert.match(html,/Orbit Hopper/);assert.match(html,/Camera/);assert.match(html,/INSTALLED/);assert.doesNotMatch(html,/Pixel Blocks/);
assert.match(G.render(ctx({searching:true,editValue:'pix'})),/gbbr-suggestion" data-action="gbmk-detail" data-id="blocks"/);
assert.match(G.render(ctx({searching:true,history:['golf']})),/data-action="gbmk-search-run" data-id="golf"/);
assert.match(G.render(ctx({page:'search',query:'golf'})),/Lunar Golf/);assert.match(G.render(ctx({page:'search',query:'zzz'})),/No results found\./);
html=G.render(ctx({page:'settings'}));assert.match(html,/Notifications/);assert.match(html,/Clear search history/);assert.match(html,/User controls/);assert.match(html,/Use PIN for purchases/);
assert.deepEqual([...G.menu(ctx()).map(i=>i.title)],['My apps','Accounts','Settings','Help']);assert.equal(G.menu(ctx({page:'permissions'})).length,0);
// Translations.
assert.equal(G.text('hu','Games'),'Játékok');assert.equal(G.text('de','Accept & download'),'Akzeptieren & herunterladen');
console.log('gb-market ok');
