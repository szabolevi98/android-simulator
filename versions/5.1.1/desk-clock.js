/* Local DeskClock model and AOSP ICS-inspired presentation. */
(() => {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pad = value => String(value).padStart(2,'0');
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  // The LMY48Y image's nine alarm sounds (Xenon is new in 5.x); ro.config.alarm_alert is Oxygen.ogg.
  const tones = ['Argon','Carbon','Helium','Krypton','Neon','Osmium','Oxygen','Platinum','Xenon','Silent'];
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
  function overlay(ui,t) {
    const alarm=normalize(ui.alarmDraft), e=escape;
    const shell=(title,body,form='')=>`<div class="settings-dialog-scrim" data-action="close-overlay"></div><${form?'form':'div'} class="settings-dialog desk-dialog" role="dialog" aria-label="${e(t(title))}" ${form?`data-form="${form}"`:''}><h3>${e(t(title))}</h3>${body}</${form?'form':'div'}>`;
    const actions='<div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">OK</button></div>';
    if(ui.overlay==='clock-time')return shell('Time',`<div class="desk-time-picker">${['hour','minute'].map((name,i)=>`<div><button type="button" data-action="alarm-time-step" data-id="${name}:1" aria-label="${e(t(i?'Increase minute':'Increase hour'))}">+</button><input type="number" name="${name}" min="0" max="${i?59:23}" required aria-label="${e(t(i?'Minute':'Hour'))}" value="${alarm.time.split(':')[i]}"><button type="button" data-action="alarm-time-step" data-id="${name}:-1" aria-label="${e(t(i?'Decrease minute':'Decrease hour'))}">−</button></div>`).join('<b>:</b>')}</div>${actions}`,'alarm-time');
    if(ui.overlay==='clock-days')return shell('Repeat',`<div class="desk-dialog-scroll">${days.map((name,i)=>`<label class="desk-day"><span>${e(t(name))}</span><input type="checkbox" name="days" value="${i}" ${alarm.days.includes(i)?'checked':''}></label>`).join('')}</div>${actions}`,'alarm-days');
    if(ui.overlay==='clock-tone')return shell('Ringtone',`<div class="desk-dialog-scroll">${tones.map(name=>`<label class="desk-day"><span>${e(t(name))}</span><input type="radio" name="tone" value="${name}" ${alarm.tone===name?'checked':''}></label>`).join('')}</div>${actions}`,'alarm-tone');
    if(ui.overlay==='clock-label')return shell('Label',`<input name="label" aria-label="${e(t('Label'))}" maxlength="60" value="${e(alarm.label)}">${actions}`,'alarm-label');
    if(ui.overlay==='clock-delete')return shell('Delete alarm?',`<p>${alarm.time} ${e(alarm.label)}</p><div class="settings-dialog-actions"><button data-action="close-overlay">Cancel</button><button data-action="alarm-confirm-delete">Delete</button></div>`);
    if(ui.overlay==='clock-ringing')return `<div class="settings-dialog-scrim"></div><div class="settings-dialog desk-dialog" role="alertdialog" aria-label="${e(t('Alarm'))}"><h3>${e(ui.ringingAlarm.label||t('Alarm'))}</h3><div class="desk-ringing-time">${e(ui.ringingAlarm.time)}</div><div class="settings-dialog-actions"><button data-action="alarm-snooze">Snooze</button><button data-action="alarm-dismiss">Dismiss</button></div></div>`;
    return '';
  }
  window.ICSDeskClock={normalize,nextOccurrence,due,repeatText,render,overlay};
})();
