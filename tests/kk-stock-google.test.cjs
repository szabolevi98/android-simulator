const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// 4.4.4 stock Google apps checked against the KTU84P APKs (audit step 4).
const w={window:{GELNow:{render:()=>'<div class="gnow-page"></div>'}}};for(const f of ['stock-strings.js','stock-apps.js'])vm.runInNewContext(fs.readFileSync('versions/4.4.4/'+f,'utf8'),w);
const A=w.window.StockApps,css=fs.readFileSync('versions/4.4.4/stock-apps.css','utf8'),ctx=(ui={},locale='en')=>({ui,data:{},t:k=>k,locale,now:new Date(2014,5,20,10)});
// Google Settings: GoogleSettingsActivity's rows in GMS 4.3.23's order, no section headers.
const gs=A.render('google-settings',ctx({},'de'));assert.ok(!gs.includes('<h4>'));
assert.deepEqual([...gs.matchAll(/<button data-action="[^"]+">([^<]+)<\/button>/g)].map(m=>m[1]),['Verbundene Apps','Google+','Play Games','Standort','Suche &amp; Google Now','Anzeigen','Apps bestätigen','Android Geräte-Manager','Drive apps']);
// Earth 7.1.3: Search and Reset to north in the bar, the rest in the overflow; Clear map only after a search.
const earth=A.render('earth',ctx());assert.ok(earth.includes('ea7-ic_menu_northup.png')&&!earth.includes('sensors')&&!earth.includes('sa-earth-home'));
assert.equal(JSON.stringify(A.menu('earth',ctx()).map(i=>i.title)),JSON.stringify(['My location','Share','Settings','Feedback','Help','Tutorial']));
assert.equal(A.menu('earth',ctx({earthQuery:'Pizza'}))[0].action,'earth-clear');
// News & Weather 1.3.11: GenieWidget's tabs, rows and weather panel with its own strings.
assert.ok(A.render('news-weather',ctx()).includes('nw-item')&&css.includes('.nw-tabs'));
const wx=A.render('news-weather',ctx({newsTab:'Weather'},'hu'));assert.ok(wx.includes('Páratartalom: 60%')&&wx.includes('nw-ic_weather_partly_cloudy_xl.png'));
console.log('kk stock google ok');
