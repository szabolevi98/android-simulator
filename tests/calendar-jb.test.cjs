const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// 4.3 and 4.4.4 generate calendar.js from docs/calendar-jb.template.js with their own CalendarGoogle words.
for(const [v,dev] of [['4.3','mako'],['4.4.4','hammerhead']]){
  const src=fs.readFileSync(`versions/${v}/calendar.js`,'utf8');
  assert.match(src,new RegExp(`from the ${dev} image's CalendarGoogle\.apk`));assert.doesNotMatch(src,/__STRINGS__|__DEVICE__/);
  const c={window:{AndroidI18n:{language:'hu'}}};vm.runInNewContext(src,c);const C=c.window.ICSCalendar;
  const html=C.overlay({overlay:'calendar-menu'},k=>k);
  // all_in_one_title_bar + gcal_all_in_one_addl_options in orderInCategory.
  assert.deepEqual(Array.from(html.matchAll(/<button[^>]*>([^<]*)<\/button>/g),m=>m[1]),['Új esemény','Frissítés','Keresés','Naptárak','Visszajelzés küldése','Beállítások','Súgó']);
}
assert.match(fs.readFileSync('versions/4.3/calendar.css','utf8'),/\.cal-check>span\{margin-left:-7\.2px\}/);
assert.doesNotMatch(fs.readFileSync('versions/4.4.4/calendar.css','utf8'),/\.cal-check>span\{margin-left/);
console.log('Calendar 4.3 / 4.4 checks passed: generated per image, overflow menu in order with the APK words.');
