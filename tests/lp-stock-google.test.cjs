const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// 5.1.1 stock Google apps checked against the LMY48Y APKs and their odex code (audit step 4).
const w={window:{GELNow:{render:()=>'<div class="gnow-page"></div>'}}};for(const f of ['stock-strings.js','stock-apps.js'])vm.runInNewContext(fs.readFileSync('versions/5.1.1/'+f,'utf8'),w);
const A=w.window.StockApps,css=fs.readFileSync('versions/5.1.1/stock-apps.css','utf8'),ctx=(ui={},locale='en')=>({ui,data:{},t:k=>k,locale,now:new Date(2015,7,20,10)});
// Google Settings 6.7: GoogleSettingsActivity's categories and rows in the dex's order.
const gs=A.render('google-settings',ctx({},'hu'));
assert.equal([...gs.matchAll(/<(?:h4 class="gs6-cat"|button class="gs6-row"[^>]*)>([^<]+)</g)].map(m=>m[1]).join('|'),'Fiók|Google+|Fiókelőzmények|Szolgáltatások|Hirdetések|Társított alkalmazások|Google Fitnesz|Play Játékok|Adatkezelés|Keresés és Asszisztens|Biztonság|Hely');
assert.ok(css.includes('.gs6-bar{')&&css.includes('#263238')&&css.includes('#009688'));
// Earth 8: the gradient Toolbar with Search, My location and Share (no overflow until a search adds Clear map).
const ea=A.render('earth',ctx());assert.ok(ea.includes('ea8-bar')&&ea.includes('ea8-ic_menu_mylocation.png')&&ea.includes('ea8-ic_share_alt_white_24dp.png')&&!ea.includes('data-action="sa-menu"'));
const ea2=A.render('earth',ctx({earthQuery:'Pizza'}));assert.ok(ea2.includes('earth-clear')&&ea2.includes('data-action="sa-menu"'));
// News & Weather 2.2: the light Toolbar with Search and Add section, Headlines' weather card and section card, the drawer.
const nw=A.render('news-weather',ctx({newsDrawer:true},'hu'));assert.ok(nw.includes('nw2-bar')&&nw.includes('Címsorok')&&nw.includes('nw2-ic_add_white_24dp.png')&&nw.includes('nw2-weather')&&nw.includes('Súgó és visszajelzés'));
assert.ok(fs.readFileSync('versions/5.1.1/simulator.js','utf8').includes("'news-weather': '#9e9e9e'"));
// Keep 3.0: the yellow Toolbar with Search, the floating quick-edit bar, DrawerFragment's items in the dex's order.
const kp=A.render('keep',{...ctx({keepDrawer:true}),data:{keepNotes:[{id:'k1',text:'Milk'}]}});assert.ok(kp.includes('kp3-bar')&&kp.includes('kp3-ic_material_search_light.png')&&kp.includes('kp3-quick'));
assert.equal([...kp.matchAll(/data-action="keep-landing" data-id="(\w+)"/g)].map(m=>m[1]).join(),'notes,reminders,archive,trash');
assert.ok(css.includes('.kp3-bar{')&&css.includes('#ffcc3f'));
console.log('lp stock google ok');
