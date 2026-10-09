const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// 4.3: the Google app is Google Search 2.5.9 (Velvet.apk) on its Now cards, not the KitKat launcher's Google Now page.
const w={window:{}};for(const f of ['stock-strings.js','velvet-now.js','stock-apps.js'])vm.runInNewContext(fs.readFileSync('versions/4.3/'+f,'utf8'),w);
const A=w.window.StockApps,ctx=(hour,locale='en')=>({ui:{},data:{events:[{id:1,date:'2013-07-24',title:'Coffee with Alex',time:'11:00'}]},t:k=>k,locale,now:new Date(2013,6,24,hour)});
const html=A.render('google-search',ctx(10));
assert.ok(!fs.existsSync('versions/4.3/gel-now.js')&&!html.includes('gnow-'));
for(const part of ['vn-context_header_bg_daylight.jpg','vn-ic_google_large_light.png','vn-search_bg','Search…','Show more cards…','Mountain View','Coffee with Alex','data-app="voice-search"'])assert.ok(html.includes(part)||fs.readFileSync('versions/4.3/stock-apps.css','utf8').includes(part),part);
assert.ok(A.render('google-search',ctx(6)).includes('_dawn.jpg')&&A.render('google-search',ctx(18)).includes('_dusk.jpg')&&A.render('google-search',ctx(23)).includes('_twilight.jpg'));
assert.ok(A.render('google-search',ctx(10,'hu')).includes('További kártyák...'));
assert.equal(JSON.stringify(A.menu('google-search',ctx(10)).map(i=>i.title)),JSON.stringify(['Settings','Send feedback','Help']));
for(const f of ['vn-context_header_bg_dawn.jpg','vn-context_header_bg_twilight.jpg','vn-ic_mic_dark.png','vn-card_background.png','vn-ic_menu_moreoverflow_smaller_dark.png'])assert.ok(fs.existsSync('versions/4.3/assets/'+f),f);
// Voice Search: speak_now.xml's panel, vs_micbtn_rec while listening and vs_micbtn_on with no_match after.
assert.ok(A.render('voice-search',ctx(10)).includes('vn-vs_micbtn_rec.png')&&A.render('voice-search',ctx(10)).includes('Speak now'));
const retry=A.render('voice-search',{...ctx(10,'hu'),ui:{voiceState:'retry'}});assert.ok(retry.includes('vn-vs_micbtn_on.png')&&retry.includes('Nem sikerült értelmezni. Mondja ki újra.'));
// Google Settings: GoogleSettingsActivity's rows in its order, GmsCore's strings (read through aapt2).
const gs=A.render('google-settings',ctx(10,'hu'));assert.ok(gs.includes('gms-common_settings_bg')||fs.readFileSync('versions/4.3/stock-apps.css','utf8').includes('gms-common_settings_bg.png'));
assert.deepEqual([...gs.matchAll(/<button data-action="[^"]+" data-id="[^"]*">([^<]+)<\/button>/g)].map(m=>m[1]),['Alkalmazások Google+-bejelentkezéssel','Google+','Hely','Keresés','Hirdetések','Alkalmazások ellenőrzése']);
console.log('velvet-now ok');
