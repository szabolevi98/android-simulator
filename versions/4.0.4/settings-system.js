/* Offline system preferences. Network profiles never open real connections. */
(() => {
  'use strict';
  const e=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const defaults={autoTime:true,autoZone:true,timeOffset:0,timeZone:'Europe/Budapest',hour24:true,dateFormat:'locale',screenLock:'slide',ownerInfo:'',showOwner:false,hotspotName:'AndroidAP',hotspotSecurity:'WPA2',bluetoothTether:false,wifiSleep:'always',networkOperator:'Telekom',networkAuto:true,only2g:false};
  const prefs=data=>({...defaults,...data.settings});
  const zones=['Europe/Budapest','Europe/London','Europe/Berlin','Europe/Paris','Europe/Madrid','America/New_York','America/Los_Angeles','Asia/Tokyo','UTC'];
  const zone=data=>prefs(data).autoZone?Intl.DateTimeFormat().resolvedOptions().timeZone:prefs(data).timeZone;
  function parts(data,now=Date.now()) {
    const p=prefs(data),stamp=now+(p.autoTime?0:Number(p.timeOffset)||0);
    return Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:zone(data),year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(stamp).filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]));
  }
  function wallDate(data,now=Date.now()){const p=parts(data,now);return new Date(p.year,p.month-1,p.day,p.hour,p.minute,p.second);}
  const isoDate=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const isoTime=date=>`${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
  function setWall(data,date,time,now=Date.now()) {
    const wanted=Date.parse(`${date}T${time}:00Z`);if(!Number.isFinite(wanted)||new Date(wanted).toISOString().slice(0,16)!==`${date}T${time}`)return false;
    let candidate=wanted;
    for(let i=0;i<3;i++){const p=parts({...data,settings:{...data.settings,autoTime:true}},candidate);candidate+=wanted-Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second);}
    const p=parts({...data,settings:{...data.settings,autoTime:true}},candidate);
    if(Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second)!==wanted)return false;
    data.settings.autoTime=false;data.settings.timeOffset=candidate-now;return true;
  }
  function dateText(data,locale,now=Date.now()) {
    const p=prefs(data),d=wallDate(data,now),day=String(d.getDate()).padStart(2,'0'),month=String(d.getMonth()+1).padStart(2,'0'),year=d.getFullYear();
    return p.dateFormat==='ymd'?`${year}/${month}/${day}`:p.dateFormat==='dmy'?`${day}/${month}/${year}`:p.dateFormat==='mdy'?`${month}/${day}/${year}`:d.toLocaleDateString(locale);
  }
  const row=(title,subtitle='',action='sx-dialog',id='',disabled=false)=>`<button class="settings-row" data-action="${action}" data-id="${e(id)}" ${disabled?'disabled':''}><span class="row-copy">${e(title)}${subtitle?`<small>${e(subtitle)}</small>`:''}</span></button>`;
  const check=(title,key,on,subtitle='',disabled=false)=>`<button class="settings-row" data-action="toggle-setting" data-id="${key}" role="checkbox" aria-checked="${!!on}" ${disabled?'disabled':''}><span class="row-copy">${e(title)}${subtitle?`<small>${e(subtitle)}</small>`:''}</span><img class="holo-checkbox" src="assets/btn_check_${on?'on':'off'}_holo_dark.png" alt=""></button>`;
  const section=title=>`<h3 class="section-label">${e(title)}</h3>`;
  const sleepNames={always:'Always',charging:'Only when plugged in',never:'Never'};
  function render(data,ui,t,locale) {
    const p=prefs(data),page=(title,body,right='')=>({title,body,right}),now=wallDate(data);
    if(ui.sub==='date')return page('Date & time',`${check('Automatic date & time','autoTime',p.autoTime,'Use network-provided time')}${check('Automatic time zone','autoZone',p.autoZone,'Use network-provided time zone')}${row('Set date',dateText(data,locale),'sx-dialog','date',p.autoTime)}${row('Set time',now.toLocaleTimeString(locale,{hour:'2-digit',minute:'2-digit',hour12:!p.hour24}),'sx-dialog','time',p.autoTime)}${row('Select time zone',zone(data),'sx-dialog','zone',p.autoZone)}${check('Use 24-hour format','hour24',p.hour24,p.hour24?'13:00':'1:00 PM')}${row('Select date format',dateText(data,locale),'sx-dialog','date-format')}`);
    if(ui.sub==='security')return page('Security',`${section('SCREEN SECURITY')}${row('Screen lock',t(p.screenLock==='none'?'None':'Slide'),'sx-dialog','screen-lock')}${row('Owner info',p.showOwner?p.ownerInfo:'','sx-dialog','owner')}${section('ENCRYPTION')}${row('Encrypt phone',t('Unavailable in this simulator'),'noop','',true)}${section('PASSWORDS')}${check('Make passwords visible','visiblePasswords',p.visiblePasswords,'Show password characters as you type')}${section('DEVICE ADMINISTRATION')}${row('Device administrators','No device administrators','settings-sub','device-admin')}${check('Unknown sources','unknownSources',p.unknownSources,'Allow installation of non-Market apps')}`);
    if(ui.sub==='device-admin')return page('Device administrators','<p class="empty-note">No device administrators</p>');
    if(ui.sub==='tethering')return page('Tethering & portable hotspot',`${check('USB tethering','usbTether',false,'USB not connected',true)}${check('Portable Wi-Fi hotspot','portableHotspot',p.portableHotspot,p.portableHotspot?p.hotspotName:'')}${row('Configure Wi-Fi hotspot',`${p.hotspotName} · ${p.hotspotSecurity}`,'sx-dialog','hotspot')}${check('Bluetooth tethering','bluetoothTether',p.bluetoothTether)}${row('Help','','settings-sub','tether-help')}`);
    if(ui.sub==='tether-help')return page('Tethering & portable hotspot','<div class="detail-pad"><p>Portable Wi-Fi hotspot shares the phone’s data connection with nearby devices.</p><p>This simulator stores demo settings only. It does not share your connection.</p></div>');
    if(ui.sub==='wifi-advanced')return page('Advanced Wi-Fi',`${check('Network notification','wifiNotify',p.wifiNotify,'Notify me when an open network is available')}${row('Keep Wi-Fi on during sleep',t(sleepNames[p.wifiSleep]||'Always'),'sx-dialog','wifi-sleep')}${row('MAC address','02:00:00:40:04:01','noop')}${row('IP address',p.wifi&&p.wifiNetwork?'192.0.2.4':t('Unavailable'),'noop')}`);
    if(ui.sub==='vpn')return page('VPN',`${(data.vpnProfiles||[]).map(profile=>row(profile.name,ui.vpnConnected===profile.id?t('Connected'):profile.type,'sx-vpn-open',profile.id)).join('')||'<p class="empty-note">No VPN networks configured</p>'}`,`<button class="sx-add" data-action="sx-vpn-new" aria-label="${e(t('Add VPN network'))}">+</button>`);
    if(ui.sub==='mobile-networks')return page('Mobile networks',`${check('Data enabled','dataEnabled',p.dataEnabled)}${check('Data roaming','dataRoaming',p.dataRoaming)}${row('Access Point Names','','settings-sub','apn')}${check('Use only 2G networks','only2g',p.only2g,'Saves battery')}${row('Network operators',p.networkOperator,'settings-sub','operators')}`);
    if(ui.sub==='operators')return page('Available networks',`${row('Search networks','','sx-network-scan')}${row('Select automatically',p.networkAuto?t('Selected'):'','sx-network-auto')}${ui.networkScanned?['Telekom','Demo Mobile'].map(name=>row(name,p.networkOperator===name?t('Registered on network'):'','sx-network-select',name)).join(''):''}`);
    if(ui.sub==='apn')return page('APNs',`${(data.apnProfiles||[{id:'default',name:'Telekom',apn:'internet.telekom',mcc:'216',mnc:'30'}]).map(profile=>`<div class="sx-apn-row">${row(profile.name,profile.apn,'sx-apn-open',profile.id)}<button data-action="sx-apn-select" data-id="${e(profile.id)}" role="radio" aria-label="${e(profile.name)}" aria-checked="${(p.apnId||'default')===profile.id}"><i></i></button></div>`).join('')}`,`<button class="sx-add" data-action="sx-apn-new" aria-label="${e(t('New APN'))}">+</button>`);
    return null;
  }
  function overlay(data,ui,t) {
    const p=prefs(data),field=ui.systemField;
    const input=(title,name,value='',type='text',required=false,max=100)=>`<label><span>${e(t(title))}</span><input name="${name}" type="${type}" value="${e(ui.systemValues?.[name]??value)}" ${required?'required':''} maxlength="${max}" autocomplete="off"></label>`;
    const choice=(title,name,options,value)=>`<label><span>${e(t(title))}</span><select name="${name}">${options.map(([id,label])=>`<option value="${id}" ${id===value?'selected':''}>${e(t(label))}</option>`).join('')}</select></label>`;
    const shell=(title,body,form='sx-save',extra='',submitLabel='Save')=>`<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog sx-dialog" role="dialog" aria-label="${e(t(title))}" data-form="${form}"><h3>${e(t(title))}</h3><div class="sx-fields">${body}</div>${ui.systemError?`<p class="sx-error" role="alert">${e(t(ui.systemError))}</p>`:''}<div class="settings-dialog-actions">${extra}<button type="button" data-action="close-overlay">Cancel</button><button type="submit">${e(t(submitLabel))}</button></div></form>`;
    const radios=(title,options,value)=>shell(title,options.map(([id,label,disabled])=>`<label class="sx-radio"><span>${e(t(label))}</span><input type="radio" name="choice" value="${id}" ${id===value?'checked':''} ${disabled?'disabled':''}></label>`).join(''));
    if(field==='profile-delete')return shell('Delete profile?',`<p>${e(ui.systemDraft?.name||'')}</p>`,'sx-profile-delete','','Delete');
    if(field==='screen-lock')return radios('Choose screen lock',[['none','None'],['slide','Slide'],['face','Face Unlock',true],['pattern','Pattern',true],['pin','PIN',true],['password','Password',true]],p.screenLock);
    if(field==='owner')return shell('Owner info',`<label class="sx-radio"><span>${e(t('Show owner info on lock screen'))}</span><input type="checkbox" name="show" ${p.showOwner?'checked':''}></label>${input('Owner info','owner',p.ownerInfo,'text',false,100)}`);
    if(field==='date'||field==='time'){const d=wallDate(data);return shell(field==='date'?'Set date':'Set time',input(field==='date'?'Date':'Time',field,field==='date'?isoDate(d):isoTime(d),field,true));}
    if(field==='zone')return shell('Select time zone',choice('Time zone','zone',[...new Set([...zones,p.timeZone])].map(zone=>[zone,zone]),p.timeZone));
    if(field==='date-format')return radios('Select date format',[['locale','Regional (default)'],['mdy','MM/DD/YYYY'],['dmy','DD/MM/YYYY'],['ymd','YYYY/MM/DD']],p.dateFormat);
    if(field==='wifi-sleep')return radios('Keep Wi-Fi on during sleep',Object.entries(sleepNames),p.wifiSleep);
    if(field==='hotspot')return shell('Configure Wi-Fi hotspot',`${input('Network SSID','ssid',p.hotspotName,'text',true,32)}${choice('Security','security',[['Open','None'],['WPA2','WPA2 PSK']],p.hotspotSecurity)}${input('Password','password','android404','password',false,63)}<p class="sx-note">${e(t('Demo settings only; no network connection is created.'))}</p>`);
    if(field==='vpn-edit'){const profile=ui.systemDraft||{};return shell('Edit VPN network',`${input('Name','name',profile.name,'text',true,50)}${choice('Type','type',[['PPTP','PPTP'],['L2TP/IPSec PSK','L2TP/IPSec PSK']],profile.type||'PPTP')}${input('Server address','server',profile.server||'vpn.example.test','text',true)}<p class="sx-note">${e(t('Demo settings only; no network connection is created.'))}</p>`,'sx-save',profile.id?'<button type="button" data-action="sx-profile-delete" data-id="vpn">Delete</button>':'');}
    if(field==='vpn-connect'){const profile=(data.vpnProfiles||[]).find(profile=>profile.id===ui.systemId);return shell(profile?.name||'VPN',`${input('Username','username','demo')}${input('Password','password','','password')}<p>${e(t(ui.vpnConnected===ui.systemId?'Connected':'Disconnected'))}</p>`,'sx-vpn-connect','<button type="button" data-action="sx-vpn-edit">Edit</button>',ui.vpnConnected===ui.systemId?'Disconnect':'Connect');}
    if(field==='apn-edit'){const profile=ui.systemDraft||{};return shell('Edit access point',`${input('Name','name',profile.name,'text',true,50)}${input('APN','apn',profile.apn||'internet.example.test','text',true)}${input('MCC','mcc',profile.mcc||'216','text',true,3)}${input('MNC','mnc',profile.mnc||'30','text',true,3)}`,'sx-save',profile.id?'<button type="button" data-action="sx-profile-delete" data-id="apn">Delete</button>':'');}
    return '';
  }
  function submit(data,ui,values,now=Date.now()) {
    const p=data.settings,field=ui.systemField,value=name=>String(values.get(name)||'').trim();
    if(field==='date'||field==='time'){const d=wallDate(data,now);if(!setWall(data,field==='date'?value('date'):isoDate(d),field==='time'?value('time'):isoTime(d),now))return 'Invalid date or time';}
    if(field==='zone'&&zones.includes(value('zone')))p.timeZone=value('zone');
    if(field==='date-format'&&['locale','mdy','dmy','ymd'].includes(value('choice')))p.dateFormat=value('choice');
    if(field==='wifi-sleep'&&sleepNames[value('choice')])p.wifiSleep=value('choice');
    if(field==='screen-lock'&&['none','slide'].includes(value('choice')))p.screenLock=value('choice');
    if(field==='owner'){p.ownerInfo=value('owner').slice(0,100);p.showOwner=values.has('show');}
    if(field==='hotspot'){
      if(!value('ssid'))return 'Enter a network name';
      if(value('security')!=='Open'&&value('password').length<8)return 'Password must have at least 8 characters';
      p.hotspotName=value('ssid').slice(0,32);p.hotspotSecurity=value('security')==='Open'?'Open':'WPA2';
    }
    if(field==='vpn-edit'){
      if(!value('name')||!value('server'))return 'Complete all required fields';
      data.vpnProfiles||=[];const profile={id:ui.systemDraft?.id||`vpn-${now}`,name:value('name').slice(0,50),type:value('type')==='L2TP/IPSec PSK'?'L2TP/IPSec PSK':'PPTP',server:value('server').slice(0,100)};
      const index=data.vpnProfiles.findIndex(item=>item.id===profile.id);if(index<0)data.vpnProfiles.push(profile);else data.vpnProfiles[index]=profile;
    }
    if(field==='apn-edit'){
      if(!value('name')||!value('apn')||!/^\d{3}$/.test(value('mcc'))||!/^\d{2,3}$/.test(value('mnc')))return 'Complete all required fields';
      data.apnProfiles||=[{id:'default',name:'Telekom',apn:'internet.telekom',mcc:'216',mnc:'30'}];const profile={id:ui.systemDraft?.id||`apn-${now}`,name:value('name').slice(0,50),apn:value('apn').slice(0,100),mcc:value('mcc'),mnc:value('mnc')};
      const index=data.apnProfiles.findIndex(item=>item.id===profile.id);if(index<0)data.apnProfiles.push(profile);else data.apnProfiles[index]=profile;
    }
    return '';
  }
  function removeProfile(data,ui) {
    const key=ui.systemDeleteKind==='vpn'?'vpnProfiles':'apnProfiles',id=ui.systemDraft?.id;
    data[key]=(data[key]||(key==='apnProfiles'?[{id:'default'}]:[])).filter(profile=>profile.id!==id);
    if(key==='vpnProfiles'&&ui.vpnConnected===id)ui.vpnConnected=null;
    if(key==='apnProfiles'&&(data.settings.apnId||'default')===id)data.settings.apnId=data.apnProfiles[0]?.id||'';
  }
  window.ICSSystemSettings={defaults,prefs,zones,zone,parts,wallDate,isoDate,isoTime,setWall,dateText,render,overlay,submit,removeProfile};
})();
