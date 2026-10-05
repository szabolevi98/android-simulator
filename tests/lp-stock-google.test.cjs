const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// 5.1.1 stock Google apps checked against the LMY48Y APKs and their odex code (audit step 4).
const w={window:{GELNow:{render:()=>'<div class="gnow-page"></div>'}}};for(const f of ['stock-strings.js','stock-apps.js'])vm.runInNewContext(fs.readFileSync('versions/5.1.1/'+f,'utf8'),w);
const A=w.window.StockApps,css=fs.readFileSync('versions/5.1.1/stock-apps.css','utf8'),ctx=(ui={},locale='en')=>({ui,data:{},t:k=>k,locale,now:new Date(2015,7,20,10)});
// Google Settings 6.7: GoogleSettingsActivity's categories and rows in the dex's order.
const gs=A.render('google-settings',ctx({},'hu'));
assert.equal([...gs.matchAll(/<(?:h4 class="gs6-cat"|button class="gs6-row"[^>]*)>([^<]+)</g)].map(m=>m[1]).join('|'),'Fiók|Google+|Fiókelőzmények|Szolgáltatások|Hirdetések|Társított alkalmazások|Google Fitnesz|Play Játékok|Adatkezelés|Keresés és Asszisztens|Biztonság|Hely');
assert.ok(css.includes('.gs6-bar{')&&css.includes('#263238')&&css.includes('#009688'));
console.log('lp stock google ok');
