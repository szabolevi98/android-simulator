const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={window:{},Intl,Date};vm.createContext(ctx);vm.runInContext(fs.readFileSync('versions/4.0.4/settings-system.js','utf8'),ctx);const sys=ctx.window.ICSSystemSettings;
const data={settings:{...sys.defaults,autoZone:false,timeZone:'Europe/Budapest'}},stamp=Date.parse('2026-09-30T12:00:00Z');
assert.equal(sys.parts(data,stamp).hour,14);
assert.ok(sys.setWall(data,'2012-04-01','13:45',stamp));assert.equal(sys.isoTime(sys.wallDate(data,stamp)),'13:45');assert.equal(sys.isoDate(sys.wallDate(data,stamp)),'2012-04-01');
assert.equal(sys.isoTime(sys.wallDate(data,stamp+60000)),'13:46');
assert.equal(sys.setWall(data,'2026-02-30','13:45',stamp),false);
assert.equal(sys.setWall(data,'2026-03-29','02:30',stamp),false); // nonexistent DST time
assert.ok(sys.setWall(data,'2026-10-25','02:30',stamp)); // repeated DST hour remains representable
let ui={systemField:'hotspot'};const values=object=>new Map(Object.entries(object));
assert.equal(sys.submit(data,ui,values({ssid:'Demo',security:'WPA2',password:'short'}),stamp),'Password must have at least 8 characters');
assert.equal(data.settings.hotspotName,'AndroidAP');
assert.equal(sys.submit(data,ui,values({ssid:'Demo',security:'WPA2',password:'dummy-password'}),stamp),'');assert.equal(data.settings.hotspotName,'Demo');assert.equal(JSON.stringify(data).includes('dummy-password'),false);
ui={systemField:'vpn-edit'};assert.equal(sys.submit(data,ui,values({name:'Demo VPN',type:'PPTP',server:'vpn.example.test'}),stamp),'');assert.equal(data.vpnProfiles.length,1);
ui.systemDraft=data.vpnProfiles[0];sys.submit(data,ui,values({name:'Renamed',type:'PPTP',server:'vpn.example.test'}),stamp+1);assert.equal(data.vpnProfiles.length,1);assert.equal(data.vpnProfiles[0].name,'Renamed');
ui={systemField:'apn-edit'};assert.equal(sys.submit(data,ui,values({name:'Demo',apn:'internet.test',mcc:'bad',mnc:'30'}),stamp),'Complete all required fields');assert.equal(data.apnProfiles,undefined);
assert.equal(sys.submit(data,ui,values({name:'Demo',apn:'internet.test',mcc:'216',mnc:'30'}),stamp),'');assert.equal(data.apnProfiles.length,2);
ui={systemField:'screen-lock'};sys.submit(data,ui,values({choice:'pin'}));assert.equal(data.settings.screenLock,'slide');
ui={systemField:'owner'};sys.submit(data,ui,values({owner:'<img onerror=bad>',show:'on'}));assert.equal(data.settings.showOwner,true);assert.ok(sys.overlay(data,ui,x=>x).includes('&lt;img onerror=bad&gt;'));
const removed=data.vpnProfiles[0].id;ui={systemDraft:{id:removed},systemDeleteKind:'vpn',vpnConnected:removed};sys.removeProfile(data,ui);assert.equal(data.vpnProfiles.length,0);assert.equal(ui.vpnConnected,null);
ui={systemDraft:{id:'default'},systemDeleteKind:'apn'};sys.removeProfile(data,ui);assert.equal(data.apnProfiles.length,1);assert.equal(data.settings.apnId,data.apnProfiles[0].id);
// Each image's own sub-screens (docs/settings-system.template.js through docs/apk-strings.py).
{const load=v=>{const c={window:{},Intl,Date};vm.createContext(c);vm.runInContext(fs.readFileSync(`versions/${v}/settings-system.js`,'utf8'),c);return c.window.ICSSystemSettings;};
  const rows=(v,sub,settings={})=>{const m=load(v);return [...m.render({settings:{...m.defaults,...settings}},{sub},k=>k,'en-US').body.matchAll(/<(?:span class="row-copy"|h3 class="section-label")>([^<]+)/g)].map(x=>x[1].replace(/‑/g,'-'));};
  assert.ok(rows('4.0.4','date').includes('Select date format')&&rows('4.3','date').includes('Choose date format')&&!rows('5.1.1','date').some(r=>/date format/.test(r)));
  assert.ok(load('5.1.1').render({settings:{}},{sub:'date'},k=>k,'en-US').body.includes('lp-mswitch'),'Lollipop uses switches');
  assert.ok(rows('4.4.4','security').includes('Enable widgets')&&!rows('4.3','security').includes('Enable widgets'));
  assert.ok(!rows('4.0.4','security').includes('Verify apps')&&rows('4.3','security').includes('Verify apps'));
  assert.ok(rows('4.3','security',{screenLock:'pin'}).includes('Automatically lock')&&!rows('4.3','security').includes('Automatically lock'));
  assert.ok(rows('4.0.4','security',{screenLock:'pattern'}).includes('Vibrate on touch'));
  assert.ok(rows('4.0.4','tethering').includes('Help')&&!rows('4.3','tethering').includes('Help')&&rows('4.0.4','tethering').includes('Configure Wi-Fi hotspot'));
  assert.deepEqual(rows('4.0.4','wifi-advanced'),['Network notification','Keep Wi-Fi on during sleep','Avoid poor connections','Wi-Fi frequency band','MAC address','IP address']);
  assert.ok(rows('5.1.1','wifi-advanced').includes('WPS Pin Entry')&&!rows('5.1.1','wifi-advanced').includes('Wi-Fi optimization'));
  assert.ok(rows('4.3','mobile-networks').includes('Use only 2G networks')&&rows('4.4.4','mobile-networks').includes('Preferred network type')&&!rows('4.4.4','mobile-networks').includes('Use only 2G networks'));
  assert.ok(!rows('5.1.1','mobile-networks').includes('Data enabled')&&load('5.1.1').render({settings:{}},{sub:'mobile-networks'},k=>k,'en-US').title.startsWith('Cellular'));
  assert.ok(rows('4.0.4','vpn').includes('Add VPN network'));
  assert.match(load('4.3').zoneText({settings:{autoZone:false,timeZone:'Europe/Budapest'}},'en-US',Date.parse('2026-01-15T12:00:00Z')),/^GMT\+01:00, Central European Standard Time$/);}
console.log('System settings checks passed: time offsets, ticking, invalid dates, DST boundaries, hotspot validation, no password persistence, VPN edits, APN validation, owner-info escaping and each image sub-screens.');
