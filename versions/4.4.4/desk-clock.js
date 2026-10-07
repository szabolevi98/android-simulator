/* Local DeskClock model and AOSP ICS-inspired presentation. */
(() => {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pad = value => String(value).padStart(2,'0');
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  // The KTU84P image's alarm sounds (Vorbis titles); ro.config.alarm_alert is Oxygen.ogg.
  const tones = ['Argon','Carbon','Helium','Krypton','Neon','Osmium','Oxygen','Platinum','Silent'];
  function normalize(alarm = {}) {
    alarm ||= {};
    return {...alarm, time:/^([01]\d|2[0-3]):[0-5]\d$/.test(alarm.time) ? alarm.time : '07:00', enabled:alarm.enabled !== false,
      days:[...new Set((alarm.days || []).filter(day => Number.isInteger(day) && day >= 0 && day < 7))].sort(),
      label:String(alarm.label || ''), vibrate:alarm.vibrate !== false, tone:tones.includes(alarm.tone) ? alarm.tone : 'Oxygen'};
  }
  const dayIndex = date => (date.getDay()+6)%7;
  function nextOccurrence(raw, now = new Date()) {
    const alarm=normalize(raw);
    if(!alarm.enabled)return null;
    if(alarm.snoozedUntil > now.getTime())return new Date(alarm.snoozedUntil);
    const [hour,minute]=alarm.time.split(':').map(Number);
    for(let offset=0;offset<=7;offset++) {
      const candidate=new Date(now);candidate.setDate(candidate.getDate()+offset);candidate.setHours(hour,minute,0,0);
      if(candidate>now && (!alarm.days.length || alarm.days.includes(dayIndex(candidate))))return candidate;
    }
    return null;
  }
  function due(raw, now = new Date()) {
    const alarm=normalize(raw), minute=Math.floor(now.getTime()/60000);
    if(!alarm.enabled || raw.lastFiredMinute===minute)return false;
    if(raw.snoozedUntil)return now.getTime()>=raw.snoozedUntil;
    return alarm.time===`${pad(now.getHours())}:${pad(now.getMinutes())}` && (!alarm.days.length || alarm.days.includes(dayIndex(now)));
  }
  function repeatText(alarm,t) {
    const selected=normalize(alarm).days;
    return !selected.length?t('Never'):selected.length===7?t('Every day'):selected.map(day=>t(days[day])).join(', ');
  }
  const check = on => `<img class="holo-checkbox" src="assets/btn_check_${on?'on':'off'}_holo_dark.png" alt="">`;
  function render(data,ui,t,locale,now=new Date()) {
    const header=title=>`<header class="desk-header"><button data-action="back" aria-label="Back"><img src="assets/clock.png" alt=""></button><h2>${escape(t(title))}</h2></header>`;
    if(ui.sub==='alarm-edit') {
      const alarm=normalize(ui.alarmDraft);
      const row=(key,title,value)=>`<button class="desk-preference" data-action="alarm-field" data-id="${key}"><span>${escape(t(title))}<small>${escape(value)}</small></span></button>`;
      return `<div class="app-view desk-app">${header('Set alarm')}<div class="desk-scroll desk-preferences"><button class="desk-preference" data-action="alarm-draft-toggle" data-id="enabled" role="checkbox" aria-checked="${alarm.enabled}"><span>Turn alarm on</span>${check(alarm.enabled)}</button>${row('time','Time',alarm.time)}${row('days','Repeat',repeatText(alarm,t))}${row('tone','Ringtone',t(alarm.tone))}<button class="desk-preference" data-action="alarm-draft-toggle" data-id="vibrate" role="checkbox" aria-checked="${alarm.vibrate}"><span>Vibrate</span>${check(alarm.vibrate)}</button>${row('label','Label',alarm.label||t('Alarm'))}</div><footer class="desk-buttonbar"><button data-action="alarm-cancel">Cancel</button>${alarm.id?'<button data-action="alarm-delete">Delete</button>':''}<button data-action="alarm-save">OK</button></footer></div>`;
    }
    if(ui.sub==='alarms')return `<div class="app-view desk-app">${header('Alarms')}<button class="desk-add" data-action="alarm-new"><img src="assets/clock-ic_menu_add.png" alt=""><span>Add alarm</span></button><div class="desk-scroll">${data.alarms.map(raw=>{const alarm=normalize(raw);return `<div class="desk-alarm-row"><button class="desk-alarm-toggle" data-action="alarm-toggle" data-id="${alarm.id}" role="checkbox" aria-checked="${alarm.enabled}" aria-label="${escape(t('Turn alarm on')+' '+alarm.time)}">${check(alarm.enabled)}</button><button class="desk-alarm-edit" data-action="alarm-edit" data-id="${alarm.id}"><span><strong>${alarm.time}</strong><em>${escape(alarm.label)}</em></span><small>${escape(repeatText(alarm,t))}</small></button></div>`;}).join('')||'<p class="empty-note">No alarms</p>'}</div></div>`;
    const next=data.alarms.map(a=>nextOccurrence(a,now)).filter(Boolean).sort((a,b)=>a-b)[0];
    return `<div class="app-view desk-face ${ui.clockDim?'desk-dim':''}"><div class="desk-time-group"><button class="desk-time" data-action="clock-dim" aria-label="Night mode" aria-pressed="${!!ui.clockDim}">${now.toLocaleTimeString(locale,{hour:'2-digit',minute:'2-digit',hour12:data.settings?.hour24===false})}</button><div class="desk-date">${now.toLocaleDateString(locale,{weekday:'long',month:'long',day:'numeric'})}</div><button class="desk-next" data-action="clock-alarms"><img src="assets/clock-ic_lock_idle_alarm.png" alt=""><span>${next?`${escape(t('Alarm set:'))} ${escape(next.toLocaleDateString(locale,{weekday:'short'}))} ${escape(next.toLocaleTimeString(locale,{hour:'2-digit',minute:'2-digit',hour12:data.settings?.hour24===false}))}`:escape(t('Set alarm'))}</span></button></div></div>`;
  }
  function overlay(ui,t,ctx={}) {
    const alarm=normalize(ui.alarmDraft), e=escape;
    const shell=(title,body,form='')=>`<div class="settings-dialog-scrim" data-action="close-overlay"></div><${form?'form':'div'} class="settings-dialog desk-dialog" role="dialog" aria-label="${e(t(title))}" ${form?`data-form="${form}"`:''}><h3>${e(t(title))}</h3>${body}</${form?'form':'div'}>`;
    const actions='<div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">OK</button></div>';
    if(ui.overlay==='clock-time')return shell('Time',`<div class="desk-time-picker">${['hour','minute'].map((name,i)=>`<div><button type="button" data-action="alarm-time-step" data-id="${name}:1" aria-label="${e(t(i?'Increase minute':'Increase hour'))}">+</button><input type="number" name="${name}" min="0" max="${i?59:23}" required aria-label="${e(t(i?'Minute':'Hour'))}" value="${alarm.time.split(':')[i]}"><button type="button" data-action="alarm-time-step" data-id="${name}:-1" aria-label="${e(t(i?'Decrease minute':'Decrease hour'))}">−</button></div>`).join('<b>:</b>')}</div>${actions}`,'alarm-time');
    if(ui.overlay==='clock-days')return shell('Repeat',`<div class="desk-dialog-scroll">${days.map((name,i)=>`<label class="desk-day"><span>${e(t(name))}</span><input type="checkbox" name="days" value="${i}" ${alarm.days.includes(i)?'checked':''}></label>`).join('')}</div>${actions}`,'alarm-days');
    if(ui.overlay==='clock-tone')return shell('Ringtone',`<div class="desk-dialog-scroll">${tones.map(name=>`<label class="desk-day"><span>${e(t(name))}</span><input type="radio" name="tone" value="${name}" ${alarm.tone===name?'checked':''}></label>`).join('')}</div>${actions}`,'alarm-tone');
    if(ui.overlay==='clock-label')return shell('Label',`<input name="label" aria-label="${e(t('Label'))}" maxlength="60" value="${e(alarm.label)}">${actions}`,'alarm-label');
    if(ui.overlay==='clock-delete')return shell('Delete alarm?',`<p>${alarm.time} ${e(alarm.label)}</p><div class="settings-dialog-actions"><button data-action="close-overlay">Cancel</button><button data-action="alarm-confirm-delete">Delete</button></div>`);
    if(ui.overlay==='clock-ringing')return ringing(ui,ctx);
    return '';
  }
  // The ringing alarm, in this image's DeskClock words (alarm-strings.js).
  const e=escape;
  const A=key=>{const row=window.AlarmStrings?.[key];return row?row[window.AndroidI18n?.language]||row.en:key;};
  function ringParts(alarm,{hour24=true,locale='en-US'}={}) {
    const [h,m]=String(alarm?.time||'0:00').split(':').map(Number),d=new Date(2000,0,1,h||0,m||0);
    const ampm=hour24?'':new Intl.DateTimeFormat(locale,{hour:'numeric',hour12:true}).formatToParts(d).find(p=>p.type==='dayPeriod')?.value||(h<12?'AM':'PM');
    return {hours:hour24?String(h).padStart(2,'0'):String(h%12||12),minutes:String(m).padStart(2,'0'),ampm,label:alarm?.label||A('default_label')};
  }
  /* AlarmAlertFullScreen (alarm_alert.xml): black, the 24 sp bold label 32 sp from the top over the big clock, and the
     DeskClock GlowPadView at the bottom: the alarm handle in the middle of a 270 dp ring (2 dp of #1AFFFFFF) that only
     shows while the handle is held, dismiss (ic_lockscreen_wakeup) at 0 rad and snooze at pi on the 135 dp placement
     radius; the handle snaps to a target within 40 dp and releasing there fires it. */
  function ringing(ui,ctx={}) {
    const r=ringParts(ui.ringingAlarm,ctx);
    const time=`<div class="dcal-time"><span>${e(r.hours)}:${e(r.minutes)}</span>${r.ampm?`<small>${e(r.ampm)}</small>`:''}</div>`;
    return `<div class="dcal-glow" role="alertdialog" aria-label="${e(r.label)}"><div class="dcal-head"><p class="dcal-label">${e(r.label)}</p>${time}</div><div class="dcal-pad"><i class="dcal-ring"></i><button class="dcal-target dcal-snooze" data-action="alarm-snooze" aria-label="${e(A('description_direction_left'))}"><img src="assets/dcal-ic_lockscreen_snooze_normal.png" alt=""><img src="assets/dcal-ic_lockscreen_snooze_activated.png" alt=""></button><button class="dcal-target dcal-dismiss" data-action="alarm-dismiss" aria-label="${e(A('description_direction_right'))}"><img src="assets/dcal-ic_lockscreen_wakeup_normal.png" alt=""><img src="assets/dcal-ic_lockscreen_wakeup_activated.png" alt=""></button><span class="dcal-handle" aria-hidden="true"><img src="assets/dcal-ic_lockscreen_alarm.png" alt=""><img src="assets/dcal-ic_lockscreen_handle_pressed.png" alt=""></span></div></div>`;
  }
  function bindRinging(root) {
    const pad=root.querySelector('.dcal-pad'),handle=root.querySelector('.dcal-handle');if(!pad||!handle)return;
    const OUTER=135*.906,SNAP=40*.906;let grab=null,target=null;
    const place=(x,y)=>{handle.style.transform=`translate(${x}px,${y}px)`;};
    handle.addEventListener('pointerdown',event=>{if(event.button>0)return;event.preventDefault();grab={id:event.pointerId};pad.classList.add('dcal-grabbed');try{handle.setPointerCapture(event.pointerId);}catch{}});
    handle.addEventListener('pointermove',event=>{
      if(!grab||event.pointerId!==grab.id)return;
      const box=pad.getBoundingClientRect(),k=box.width/pad.offsetWidth||1,dx=(event.clientX-(box.left+box.width/2))/k,dy=(event.clientY-(box.top+box.height/2))/k,dist=Math.hypot(dx,dy),s=dist>OUTER?OUTER/dist:1;
      place(dx*s,dy*s);
      const angle=Math.atan2(-dy,dx);target=dist>OUTER-SNAP?(Math.abs(angle)<Math.PI/4?'dismiss':Math.abs(angle)>3*Math.PI/4?'snooze':null):null;
      pad.dataset.snapped=target||'';
    });
    const release=event=>{
      if(!grab||event.pointerId!==grab.id)return;grab=null;pad.classList.remove('dcal-grabbed');pad.dataset.snapped='';
      if(target){root.querySelector(`.dcal-${target}`)?.click();return;}
      place(0,0);
    };
    handle.addEventListener('pointerup',release);handle.addEventListener('pointercancel',release);
  }
  // AlarmStateManager.setSnoozeState: "Snoozing until %s".
  const snoozeMessage=(until,{hour24=true,locale='en-US'}={})=>A('alarm_alert_snooze_until').replace('%s',until.toLocaleTimeString(locale,{hour:'numeric',minute:'2-digit',hour12:!hour24}));
  window.ICSDeskClock={normalize,nextOccurrence,due,repeatText,render,overlay,ringing,snoozeMessage,bindRinging};
})();
