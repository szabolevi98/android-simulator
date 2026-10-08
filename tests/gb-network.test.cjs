// 2.3.6 network screens (gb-network.js): hotspot, VPN profiles with the credential storage, APNs, network operators.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},setTimeout:(fn)=>{fn();return 0;},fetch:()=>Promise.resolve({text:()=>''}),Date};
for(const f of ['gb-settings-strings.js','gb-strings-network.js','gb-strings-phonenet.js','gb-settings.js','gb-network.js'])vm.runInNewContext(fs.readFileSync(`versions/2.3.6/${f}`,'utf8'),context);
const N=context.window.GBNetwork,S=context.window.GBSettings;
function make(lang='en'){
  const data={settings:{wifi:true,wifiNetwork:'AndroidAP',dataEnabled:true}},ui={sub:'wireless',overlay:'',gbSettingsStack:['']},toasts=[];
  const fields={};
  const ctx={data,ui,lang,t:k=>k,save(){},render(){},renderOverlay(){},renderStatus(){},toast:m=>toasts.push(m),
    overlayRoot:{querySelector:sel=>{const m=sel.match(/data-gbnet-[a-z]+(?:="([^"]+)")?/);const key=sel.includes('data-gbnet-edit')?'edit':m&&m[1];return key in fields?{value:fields[key],checked:!!fields[key]}:null;}},
    go:sub=>{ui.gbSettingsStack.push(ui.sub);ui.sub=sub;},pop:()=>{ui.sub=ui.gbSettingsStack.pop()??'';},openBrowser(){},openSettings(){}};
  return {data,ui,ctx,toasts,fields,act:(a,id)=>N.handle(a,id,ctx)};
}
// Hotspot: WifiApEnabler turns Wi-Fi off and back on; the configuration's summary and the tether notification.
{
  const {data,ui,ctx,act}=make();
  act('gbnet-hotspot');assert.equal(data.settings.portableHotspot,true);assert.equal(data.settings.wifi,false);
  assert.match(N.render('wifi-ap',{...ctx,ui:{...ui}}).html,/Portable hotspot AndroidAP active/);
  assert.match(N.render('wifi-ap',ctx).html,/AndroidAP Open portable Wi-Fi hotspot/);
  assert.equal(N.ongoing(ctx)[0].title,'Tethering or hotspot active');
  act('gbnet-dialog','ap');ui.gbApDraft.security=1;ui.gbApDraft.password='short';
  assert.equal(N.dialog('ap',ctx).buttons[0].disabled,true);
  ui.gbApDraft.ssid='Nexus S';ui.gbApDraft.password='longenough';act('gbnet-ap-save');
  assert.match(N.render('wifi-ap',ctx).html,/Nexus S WPA2 PSK portable Wi-Fi hotspot/);
  act('gbnet-hotspot');assert.equal(data.settings.portableHotspot,false);assert.equal(data.settings.wifi,true);
}
// VPN: type list, editor validation, the credential storage for a pre-shared key, connect and the notification.
{
  const {data,ui,ctx,toasts,fields,act}=make();
  ui.sub='vpn';
  assert.deepEqual(JSON.parse(JSON.stringify([...N.render('vpn-type',ctx).html.matchAll(/gbset-title">([^<]+)/g)].map(m=>m[1]))),['Add PPTP VPN','Add L2TP VPN','Add L2TP/IPSec PSK VPN','Add L2TP/IPSec CRT VPN']);
  ui.sub='vpn-type';ui.gbSettingsStack.push('vpn');act('gbnet-vpn-new','L2TP_IPSEC_PSK');assert.equal(ui.sub,'vpn-edit');
  assert.match(N.render('vpn-edit',ctx).title,/Add L2TP\/IPSec PSK VPN/);
  assert.equal(N.back(ctx),true);assert.equal(ui.gbNetError,'You must enter a VPN name.');
  fields.edit='Office';act('gbnet-edit-ok','name');fields.edit='vpn.example.com';act('gbnet-edit-ok','server');
  act('gbnet-vpn-save');assert.equal(ui.gbNetError,'You must enter an IPSec pre-shared key.');
  fields.edit='secret';act('gbnet-edit-ok','psk');assert.match(N.render('vpn-edit',ctx).html,/IPSec pre-shared key is set/);
  act('gbnet-vpn-save');assert.equal(ui.gbNetDialog,'cred-set');
  fields.new='password1';fields.confirm='password2';act('gbnet-cred-set-ok');assert.equal(ui.gbNetError,'Passwords do not match.');
  fields.confirm='password1';act('gbnet-cred-set-ok');
  assert.equal(N.credState(data),'unlocked');assert.deepEqual(toasts.slice(-2),['Credential storage is enabled.',"'Office' is added"]);
  assert.equal(ui.sub,'vpn');assert.equal(data.gbVpns[0].pskSet,true);assert.equal('psk' in data.gbVpns[0],false);
  const id=data.gbVpns[0].id;
  act('gbnet-vpn-tap',id);assert.equal(ui.gbNetDialog,'vpn-connect');assert.match(N.render('vpn',ctx).html,/Connecting\.\.\./);
  fields.username='levente';fields.password='';act('gbnet-vpn-connect-ok');assert.equal(ui.gbNetError,'You must enter a password.');
  fields.password='x';fields.save=true;act('gbnet-vpn-connect-ok');
  assert.match(N.render('vpn',ctx).html,/Connected/);assert.equal(N.ongoing(ctx)[0].title,'Office VPN connected');assert.equal(data.gbVpns[0].username,'levente');
  const menu=N.dialog(`vpn-context:${id}`,ctx);assert.deepEqual(JSON.parse(JSON.stringify(menu.items.map(i=>!!i.disabled))),[true,false,true,true]);
  act('gbnet-vpn-tap',id);assert.equal(ui.gbVpnActive,null);
  // A wrong password counts down the keystore's tries, then the storage is erased.
  data.settings.gbCredLocked=true;fields.old='nope';act('gbnet-cred-unlock-ok');assert.match(ui.gbNetError,/3 more tries/);
  act('gbnet-cred-unlock-ok');act('gbnet-cred-unlock-ok');assert.match(ui.gbNetError,/one more try/);act('gbnet-cred-unlock-ok');
  assert.equal(N.credState(data),'uninit');assert.equal(toasts.at(-1),'The credential storage is erased.');
}
// APNs: apns-conf.xml's 216 30 rows (MMS last, without a radio), the editor's checks and Reset to default.
{
  const {data,ui,ctx,toasts,fields,act}=make();
  const html=N.render('apn',ctx).html;assert.ok(html.indexOf('>Web<')<html.indexOf('>T-Mobile MMS<'));
  assert.equal((html.match(/gbnet-apn-radio/g)||[]).length,1);assert.match(html,/btn_radio_on/);
  ui.sub='apn';act('gbnet-apn-edit','2');assert.equal(ui.sub,'apn-edit');assert.match(N.render('apn-edit',ctx).html,/&lt;Not set&gt;/);
  fields.edit='21';act('gbnet-edit-ok','mcc');assert.equal(N.back(ctx),true);assert.equal(ui.gbNetError,'MCC field must be 3 digits.');
  fields.edit='216';act('gbnet-edit-ok','mcc');fields.edit='internet';act('gbnet-edit-ok','apn');N.back(ctx);
  assert.equal(ui.sub,'apn');assert.equal(data.gbApns.find(a=>a.id==='2').apn,'internet');
  act('gbnet-apn-new');assert.deepEqual([ui.gbApnDraft.mcc,ui.gbApnDraft.mnc],['216','30']);act('gbnet-apn-discard');
  act('gbnet-apn-restore');assert.equal(data.gbApns,undefined);assert.equal(toasts.at(-1),'Reset default APN settings completed');
  assert.deepEqual(JSON.parse(JSON.stringify(N.menu('apn',ctx).map(i=>i.title))),['New APN','Reset to default']);
}
// Network operators: the scan, a foreign network refused, the SIM's own network registers.
{
  const {data,ui,ctx,toasts,act}=make();
  ui.sub='operators';act('gbnet-op-search');assert.match(N.render('operators',ctx).html,/Telenor HU/);
  act('gbnet-op-pick','Vodafone HU');assert.equal(toasts.at(-1),'Your SIM card does not allow a connection to this network.');
  act('gbnet-op-pick','Telekom HU');assert.equal(toasts.at(-1),'Registered on network.');assert.equal(data.settings.networkAuto,false);
}
// Settings rows: Phone's network settings and the security page's credential storage, in Hungarian.
{
  const sctx=(settings,extra={})=>({settings,lang:'hu',t:k=>k,about:{},...extra});
  const mobile=S.render('mobile',sctx({}));assert.equal(mobile.title,'Hálózati beállítások');assert.match(mobile.html,/Adatbarangolás/);
  assert.match(S.render('security',sctx({},{cred:{state:'uninit'}})).html,/data-action="gbnet-cred-reset" data-id=""[^>]*disabled/);
  assert.match(S.render('tether',sctx({})).html,/data-action="gbnet-dialog" data-id="help"/);
}
console.log('gb-network ok');
