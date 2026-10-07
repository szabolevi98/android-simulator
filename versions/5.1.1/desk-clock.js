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
  /* AlarmActivity (alarm_activity.xml, Lollipop): on the hour's colour (Utils.BACKGROUND_SPECTRUM) the 24 sp label and the
     88 sp thin TextClock, then the row with snooze (hot pink circle) and dismiss (white circle) beside the alarm button,
     behind it the 256 dp white pulse (scale 0 -> 1, alpha 1 -> 0, 1 s). The side buttons start at 0.7 scale with no circle
     and the icon at alpha 165; dragging the alarm towards one grows it to full (the dismiss icon turns the hour's colour)
     and shrinks the alarm; letting go on it snoozes or dismisses, which reveals a circle from it (pink / white) and shows
     "Snoozed" with the duration or "Alarm off" for two seconds. Touching a side button bounces the alarm and shows the
     hint. */
  const SPECTRUM=['#212121','#27232e','#2d253a','#332847','#382a53','#3e2c5f','#442e6c','#393a7a','#2e4687','#235395','#185fa2','#0d6baf','#0277bd','#0d6cb1','#1861a6','#23569b','#2d4a8f','#383f84','#433478','#3d3169','#382e5b','#322b4d','#2c273e','#272430'];
  function ringing(ui,ctx={}) {
    const r=ringParts(ui.ringingAlarm,ctx),hour=(ctx.now||new Date()).getHours();
    return `<div class="dcal-lp" role="alertdialog" aria-label="${e(r.label)}" style="--hour:${SPECTRUM[hour]}"><div class="dcal-lp-content"><p class="dcal-lp-title">${e(r.label)}</p><div class="dcal-lp-clock">${e(r.hours)}:${e(r.minutes)}${r.ampm?`<small>${e(r.ampm)}</small>`:''}</div><div class="dcal-lp-row"><i class="dcal-lp-pulse"></i><button class="dcal-lp-side dcal-lp-snooze" data-lp-side="snooze" aria-label="${e(A('alarm_alert_snooze_text'))}"><i class="dcal-lp-icon" style="--icon:url('assets/dcal-ic_snooze.png')"></i></button><span class="dcal-lp-alarm" aria-hidden="true"><img src="assets/dcal-ic_alarm.svg" alt=""></span><button class="dcal-lp-side dcal-lp-dismiss" data-lp-side="dismiss" aria-label="${e(A('alarm_alert_dismiss_text'))}"><i class="dcal-lp-icon" style="--icon:url('assets/dcal-ic_alarm_off.png')"></i></button><p class="dcal-lp-hint"></p></div></div><div class="dcal-lp-alert" hidden><p class="dcal-lp-alert-title"></p><p class="dcal-lp-alert-info"></p></div><button hidden data-action="alarm-snooze"></button><button hidden data-action="alarm-dismiss"></button></div>`;
  }
  function bindRinging(root) {
    const view=root.querySelector('.dcal-lp');if(!view)return;
    const alarm=view.querySelector('.dcal-lp-alarm'),snooze=view.querySelector('.dcal-lp-snooze'),dismiss=view.querySelector('.dcal-lp-dismiss'),hint=view.querySelector('.dcal-lp-hint');
    let grab=null,done=false;
    const set=(s,d)=>{view.style.setProperty('--snooze',s);view.style.setProperty('--dismiss',d);view.style.setProperty('--alarm',Math.max(s,d));};
    const fraction=(x0,x1,x)=>Math.max(0,Math.min(1,(x-x0)/(x1-x0)));
    const finish=(kind)=>{
      done=true;set(kind==='snooze'?1:0,kind==='dismiss'?1:0);
      const source=kind==='snooze'?snooze:dismiss,b=source.getBoundingClientRect(),v=view.getBoundingClientRect(),k=v.width/view.offsetWidth||1;
      view.style.setProperty('--rx',`${(b.left+b.width/2-v.left)/k}px`);view.style.setProperty('--ry',`${(b.top+b.height/2-v.top)/k}px`);
      view.classList.add('dcal-lp-reveal',kind==='snooze'?'dcal-lp-snoozed':'dcal-lp-off');
      setTimeout(()=>{view.querySelector('.dcal-lp-alert').hidden=false;view.querySelector('.dcal-lp-alert-title').textContent=A(kind==='snooze'?'alarm_alert_snoozed_text':'alarm_alert_off_text');if(kind==='snooze')view.querySelector('.dcal-lp-alert-info').textContent=snoozeDuration();},500);
      setTimeout(()=>view.querySelector(`[data-action="alarm-${kind}"]`)?.click(),2500);
    };
    alarm.addEventListener('pointerdown',event=>{if(done||event.button>0)return;event.preventDefault();grab={id:event.pointerId};view.classList.add('dcal-lp-held');try{alarm.setPointerCapture(event.pointerId);}catch{}});
    alarm.addEventListener('pointermove',event=>{
      if(!grab||event.pointerId!==grab.id)return;
      const a=alarm.getBoundingClientRect(),s=snooze.getBoundingClientRect(),d=dismiss.getBoundingClientRect(),x=event.clientX;
      grab.s=fraction(a.left,s.right,x);grab.d=fraction(a.right,d.left,x);set(grab.s,grab.d);
    });
    const up=event=>{
      if(!grab||event.pointerId!==grab.id)return;const g=grab;grab=null;view.classList.remove('dcal-lp-held');
      if(g.s===1)finish('snooze');else if(g.d===1)finish('dismiss');else set(0,0);
    };
    alarm.addEventListener('pointerup',up);alarm.addEventListener('pointercancel',up);
    for(const [button,key,dir] of [[snooze,'description_direction_left',-1],[dismiss,'description_direction_right',1]])button.addEventListener('click',()=>{
      if(done)return;hint.textContent=A(key);hint.classList.add('shown');
      alarm.animate([{transform:'translateX(0)'},{transform:`translateX(${dir*40}px)`},{transform:'translateX(0)'}],{duration:500,easing:'cubic-bezier(.33,0,.67,1)'});
    });
    set(0,0);
  }
  // alarm_alert_snooze_duration ("%d minutes") for the 10-minute snooze, in the simulator's language.
  const snoozeDuration=()=>new Intl.NumberFormat(window.AndroidI18n?.language||'en',{style:'unit',unit:'minute',unitDisplay:'long'}).format(10);
  const snoozeMessage=()=>'';
  window.ICSDeskClock={normalize,nextOccurrence,due,repeatText,render,overlay,ringing,snoozeMessage,bindRinging};
})();
