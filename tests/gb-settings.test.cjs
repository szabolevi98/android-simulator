const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};
vm.runInNewContext(fs.readFileSync('versions/2.3.6/gb-settings-strings.js','utf8'),context);
vm.runInNewContext(fs.readFileSync('versions/2.3.6/gb-settings.js','utf8'),context);
const S=context.window.GBSettings,t=key=>key;
const ctx=(settings={},lang='en')=>({settings,lang,t,carrier:'Telekom',date:'10/02/2026',time:'9:41',zone:'GMT+01:00',dateFormats:['a','b'],languageName:'English',uptime:'2:34:00',about:{model:'Nexus S',version:'2.3.6',baseband:'I9020XXKD1',kernel:'k',build:'GRK39F'}});
// settings.xml order with the IconPreferenceScreen icons (Dock is hidden on the Nexus S).
const main=S.render('',ctx());assert.equal(main.title,'Settings');
const titles=[...main.html.matchAll(/gbset-title">([^<]+)/g)].map(m=>m[1]);
assert.deepEqual(titles,['Wireless &amp; networks','Call settings','Sound','Display','Location &amp; security','Applications','Accounts &amp; sync','Privacy','Storage','Language &amp; keyboard','Voice input &amp; output','Accessibility','Date &amp; time','About phone']);
assert.match(main.html,/gb-ic_settings_wireless\.png/);
// Translations come from the 2.3.6 Settings resources.
assert.equal(S.render('',ctx({},'hu')).title,'Beállítások');assert.match(S.render('wireless',ctx({},'de')).html,/Flugmodus/);
// Check boxes reflect the settings; airplane mode disables Wi-Fi and Bluetooth.
let html=S.render('wireless',ctx({wifi:true,wifiNetwork:'AndroidAP',airplane:false})).html;
assert.match(html,/data-id="wifi" role="checkbox" aria-checked="true"/);
html=S.render('wireless',ctx({airplane:true})).html;assert.match(html,/data-id="wifi" role="checkbox" aria-checked="false" disabled/);
// ListPreference: the summary is the chosen entry; the dialog is a single-choice list with Cancel.
assert.match(S.render('display',ctx({animationLevel:1})).html,/Some animations/);
const dialog=S.listDialog('screenTimeout',ctx({}));assert.equal(dialog.items.length,6);assert.equal(dialog.selected,2);assert.equal(dialog.items[2].title,'1 minute');
assert.equal(S.entries('en','screen_timeout_entries')[S.value({},'screenTimeout')],'1 minute');
// Location & security follows the lock type.
assert.match(S.render('security',ctx({screenLock:'pattern'})).html,/Use visible pattern/);assert.doesNotMatch(S.render('security',ctx({screenLock:'slide'})).html,/Use visible pattern/);
// About phone values and unknown screens.
assert.match(S.render('about',ctx()).html,/GRK39F/);assert.equal(S.render('nope',ctx()),null);assert.equal(S.has('status'),true);
// Wi-Fi: wifi_status_with_ssid summary, access points with lock icons, the Scan/Advanced menu and the WifiDialog.
const nets=[{name:'AndroidAP',security:'WPA2',strength:4},{name:'CoffeeShop',security:'Open',strength:3}];
html=S.render('wifi',{...ctx({wifi:true,wifiNetwork:'AndroidAP'}),networks:nets}).html;
assert.match(html,/Connected to AndroidAP/);assert.match(html,/ic_wifi_lock_signal_4/);assert.match(html,/ic_wifi_signal_3/);
assert.deepEqual(JSON.parse(JSON.stringify(S.menu('wifi',ctx()).map(i=>i.title))),['Scan','Advanced']);
assert.equal(S.dialog('ap:AndroidAP',{...ctx({wifiNetwork:'AndroidAP'}),networks:nets}).buttons[0].action,'gbset-wifi-forget');
assert.match(S.dialog('ap:CoffeeShop',{...ctx({}),networks:nets}).custom,/^(?!.*data-wifi-password)/s);
// Ringtones: OriginalAudio titles, Silent first, OnTheHunt as the default notification.
assert.equal(S.soundTitle('Ring_Synth_04'),'Ring Synth 04');assert.equal(S.soundTitle('OnTheHunt'),'On The Hunt');
const ring=S.dialog('notificationSound',ctx({}));assert.equal(ring.items[0].title,'Silent');assert.equal(ring.items[ring.selected].title,'On The Hunt');
// Volume dialog hides the notification slider while it follows the ringer.
assert.match(S.dialog('volume',ctx({})).custom,/data-vol-notification hidden/);
console.log('gb-settings ok');
