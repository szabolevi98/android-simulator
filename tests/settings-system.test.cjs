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
console.log('System settings checks passed: time offsets, ticking, invalid dates, DST boundaries, hotspot validation, no password persistence, VPN edits, APN validation and owner-info escaping.');
