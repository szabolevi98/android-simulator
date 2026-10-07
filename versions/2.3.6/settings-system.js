/* Gingerbread's own Settings pages (GBSettings, GBSettingsPages) draw every screen; this keeps the shared defaults and the
   device clock (the manual date, time and zone offsets) the rest of the simulator reads. */
(() => {
  'use strict';
  const defaults={autoTime:true,autoZone:true,timeOffset:0,timeZone:'Europe/Budapest',hour24:true,dateFormat:'locale',screenLock:'slide',ownerInfo:'',showOwner:false,hotspotName:'AndroidAP',hotspotSecurity:'WPA2',bluetoothTether:false,wifiSleep:'always',networkOperator:'Telekom',networkAuto:true,only2g:false};
  const prefs=data=>({...defaults,...data.settings});
  const zone=data=>prefs(data).autoZone?Intl.DateTimeFormat().resolvedOptions().timeZone:prefs(data).timeZone;
  function parts(data,now=Date.now()) {
    const p=prefs(data),stamp=now+(p.autoTime?0:Number(p.timeOffset)||0);
    return Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:zone(data),year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(stamp).filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]));
  }
  function wallDate(data,now=Date.now()){const p=parts(data,now);return new Date(p.year,p.month-1,p.day,p.hour,p.minute,p.second);}
  window.ICSSystemSettings={defaults,prefs,zone,parts,wallDate};
})();
