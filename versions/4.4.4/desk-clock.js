/* The alarm model (normalize, next occurrence, due), the Label and Ringtone dialogs the alarm list opens, and the
   ringing alarm. The clock and the alarm list are kk-deskclock.js / lp-deskclock.js. */
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
  function overlay(ui,t,ctx={}) {
    const alarm=normalize(ui.alarmDraft), e=escape;
    const shell=(title,body,form='')=>`<div class="settings-dialog-scrim" data-action="close-overlay"></div><${form?'form':'div'} class="settings-dialog desk-dialog" role="dialog" aria-label="${e(t(title))}" ${form?`data-form="${form}"`:''}><h3>${e(t(title))}</h3>${body}</${form?'form':'div'}>`;
    const actions='<div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">OK</button></div>';
    if(ui.overlay==='clock-tone')return shell('Ringtone',`<div class="desk-dialog-scroll">${tones.map(name=>`<label class="desk-day"><span>${e(t(name))}</span><input type="radio" name="tone" value="${name}" ${alarm.tone===name?'checked':''}></label>`).join('')}</div>${actions}`,'alarm-tone');
    if(ui.overlay==='clock-label')return shell('Label',`<input name="label" aria-label="${e(t('Label'))}" maxlength="60" value="${e(alarm.label)}">${actions}`,'alarm-label');
    if(ui.overlay==='clock-ringing')return ringing(ui,ctx);
    return '';
  }
  // The ringing alarm, in this image's DeskClock words (alarm-strings.js).
  const e=escape;
  const A=key=>AndroidStrings.table('',window.AlarmStrings||{}).t(key);
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
    const dp=((globalThis.document?.querySelector?.('#screen')?.clientWidth || 326.16) / 360),OUTER=135*dp,SNAP=40*dp;let grab=null,target=null;
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
  const snoozeMessage=(until,{hour24=true,locale='en-US'}={})=>AndroidStrings.format(A('alarm_alert_snooze_until'), until.toLocaleTimeString(locale,{hour:'numeric',minute:'2-digit',hour12:!hour24}));
  window.ICSDeskClock={normalize,nextOccurrence,due,overlay,ringing,snoozeMessage,bindRinging};
})();
