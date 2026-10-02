/* Local calendar model and presentation based on AOSP Calendar 4.0.4. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pad = n => String(n).padStart(2, '0');
  const iso = date => `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
  const parse = date => new Date(`${date}T12:00:00`);
  const plus = (date, days) => { const d=parse(date);d.setDate(d.getDate()+days);return iso(d); };
  const minutes = time => Number(time.slice(0,2))*60+Number(time.slice(3,5));
  // EditEventView repetition choices and reminder_minutes_values (minutes before the start; -1 is none).
  const repeats=['none','daily','weekdays','weekly','monthly-weekday','monthly-day','yearly'];
  const reminders=[0,1,5,10,15,20,25,30,45,60,120,180,720,1440,2880,10080];
  const isDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value||'');
  function normalize(event) {
    const time=event.time || '12:00', endMinutes=minutes(time)+60;
    return {...event, time, endDate:event.endDate || plus(event.date,endMinutes>=1440?1:0),
      endTime:event.endTime || `${pad(Math.floor(endMinutes/60)%24)}:${pad(endMinutes%60)}`,
      allDay:!!event.allDay, location:event.location || '', description:event.description || '',
      repeat:repeats.includes(event.repeat)?event.repeat:'none', until:isDate(event.until)?event.until:'',
      exdates:Array.isArray(event.exdates)?event.exdates.filter(isDate):[], reminder:reminders.includes(Number(event.reminder))&&event.reminder!==null&&event.reminder!==''?Number(event.reminder):-1};
  }
  const days=(from,to)=>Math.round((parse(to)-parse(from))/864e5);
  const lastDay=date=>{const d=parse(date);return new Date(d.getFullYear(),d.getMonth()+1,0).getDate();};
  // Monthly "every Nth weekday": a fifth occurrence is stored as "last", as in EditEventView.
  const ordinal=date=>{const day=parse(date).getDate();return day+7>lastDay(date)&&day>28?-1:Math.ceil(day/7);};
  function matches(event,date) {
    if(date<event.date||event.until&&date>event.until||event.exdates.includes(date))return false;
    if(date===event.date)return true;
    const a=parse(event.date),b=parse(date);
    if(event.repeat==='daily')return true;
    if(event.repeat==='weekdays')return b.getDay()>0&&b.getDay()<6;
    if(event.repeat==='weekly')return a.getDay()===b.getDay();
    if(event.repeat==='monthly-day')return a.getDate()===b.getDate();
    if(event.repeat==='monthly-weekday'){const n=ordinal(event.date);return a.getDay()===b.getDay()&&(n<0?b.getDate()+7>lastDay(date):Math.ceil(b.getDate()/7)===n);}
    if(event.repeat==='yearly')return a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
    return false;
  }
  // Instances overlapping [from, to]; each keeps its series id and records its instance date.
  function expand(events,from,to) {
    const out=[];
    for(const raw of events||[]) {
      if(!raw||!isDate(raw.date))continue;
      const event=normalize(raw),span=Math.max(0,days(event.date,event.endDate));
      if(event.repeat==='none'){if(event.date<=to&&event.endDate>=from)out.push({...event,instance:event.date});continue;}
      for(let date=plus(from,-span)<event.date?event.date:plus(from,-span);date<=to;date=plus(date,1))
        if(matches(event,date))out.push({...event,date,endDate:plus(date,span),instance:date,seriesStart:event.date});
    }
    return out;
  }
  function instance(event,date) {
    const item=normalize(event),span=Math.max(0,days(item.date,item.endDate));
    return isDate(date)&&matches(item,date)?{...item,date,endDate:plus(date,span),instance:date,seriesStart:item.date}:{...item,instance:item.date,seriesStart:item.date};
  }
  // AlertService: one notification per instance when start minus the reminder has passed (stale ones are skipped).
  function dueReminders(events,now,fired=[]) {
    const today=iso(now),due=[];
    for(const item of expand((events||[]).filter(event=>normalize(event).reminder>=0),plus(today,-1),plus(today,8))) {
      if(item.instance!==item.date)continue;
      const start=new Date(`${item.date}T${item.allDay?'00:00':item.time}:00`),at=start.getTime()-item.reminder*60000,key=`${item.id}@${item.date}`;
      if(at<=now.getTime()&&now.getTime()-at<10*60000&&!fired.includes(key))due.push({key,event:item,at});
    }
    return due;
  }
  function repeatLabel(event,locale,t) {
    const item=normalize(event),date=parse(item.date),weekday=date.toLocaleDateString(locale,{weekday:'long'});
    if(item.repeat==='daily')return t('Daily');
    if(item.repeat==='weekdays')return t('Every weekday (Mon–Fri)');
    if(item.repeat==='weekly')return t('Weekly (every %s)').replace('%s',weekday);
    if(item.repeat==='monthly-weekday'){const n=ordinal(item.date);return t('Monthly (every %1$s %2$s)').replace('%1$s',t(['last','first','second','third','fourth'][n<0?0:n])).replace('%2$s',weekday);}
    if(item.repeat==='monthly-day')return t('Monthly (on day %s)').replace('%s',date.getDate());
    if(item.repeat==='yearly')return t('Yearly (on %s)').replace('%s',date.toLocaleDateString(locale,{month:'long',day:'numeric'}));
    return t('One-time event');
  }
  const reminderLabels=['0 minutes','1 minute','5 minutes','10 minutes','15 minutes','20 minutes','25 minutes','30 minutes','45 minutes','1 hour','2 hours','3 hours','12 hours','24 hours','2 days','1 week'];
  const reminderLabel=(value,t)=>value<0?t('None'):t(reminderLabels[reminders.indexOf(value)]||'10 minutes');
  function valid(event) {
    const dateOK=value=>/^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(parse(value)) && iso(parse(value))===value;
    const timeOK=value=>/^([01]\d|2[0-3]):[0-5]\d$/.test(value);
    return !!event.title.trim() && dateOK(event.date) && dateOK(event.endDate) &&
      (event.allDay ? event.endDate>=event.date : timeOK(event.time) && timeOK(event.endTime) && event.endDate+event.endTime>event.date+event.time);
  }
  function onDay(events, date) {
    return expand(events,date,date).filter(event=>event.date<=date &&
      (event.endDate>date || event.endDate===date && (event.allDay || event.endTime>'00:00')))
      .sort((a,b)=>Number(b.allDay)-Number(a.allDay) || (a.date+a.time).localeCompare(b.date+b.time));
  }
  function week(date, start=1) { const d=parse(date);return Array.from({length:7},(_,i)=>plus(date,i-(d.getDay()-start+7)%7)); }
  function month(date, start=1) {
    const d=parse(date);d.setDate(1);const first=week(iso(d),start)[0];
    return Array.from({length:42},(_,i)=>plus(first,i));
  }
  // Assign simultaneous events distinct lanes. Connected overlap groups share a width.
  function lanes(events,date) {
    const items=onDay(events,date).filter(event=>!event.allDay).map(event=>({event,
      start:event.date<date?0:minutes(event.time),end:event.endDate>date?1440:minutes(event.endTime)}));
    items.sort((a,b)=>a.start-b.start || b.end-a.end);
    let group=[], ends=[], boundary=-1;
    const finish=()=>group.forEach(item=>item.columns=ends.length);
    for(const item of items) {
      if(item.start>=boundary){finish();group=[];ends=[];boundary=-1;}
      let lane=ends.findIndex(end=>end<=item.start);if(lane<0)lane=ends.length;
      ends[lane]=item.end;item.lane=lane;group.push(item);boundary=Math.max(boundary,item.end);
    }
    finish();return items;
  }
  const modes=['Day','Week','Month','Agenda'];
  const icon=name=>`<img src="assets/calendar-${name}_holo_light.png" alt="">`;
  const dateLabel=(date,locale,options={weekday:'long',month:'long',day:'numeric',year:'numeric'})=>parse(date).toLocaleDateString(locale,options);
  function render(data,ui,t,locale,now=new Date()) {
    const selected=ui.selectedDate, mode=ui.calendarMode || 'Month', first=locale==='en-US'?0:1;
    const event=data.events.find(item=>item.id===ui.selectedEvent);
    const btn=(action,title,body=title)=>`<button type="button" data-action="${action}" aria-label="${e(t(title))}">${body}</button>`;
    const top=title=>`<header class="cal-bar">${btn('back','Back','‹')}<strong>${e(t(title))}</strong></header>`;
    if(ui.sub==='event-edit') {
      const draft=normalize(ui.eventDraft || {date:selected,title:''});
      const field=(name,label,type='text',value=draft[name]||'')=>`<label><span>${e(t(label))}</span><input name="${name}" aria-label="${e(t(label))}" type="${type}" value="${e(value)}" ${['title','date','endDate','time','endTime'].includes(name)?'required':''} ${type==='text'?'maxlength="120"':''}></label>`;
      return `<form class="app-view cal-app cal-editor" data-form="event"><header class="cal-bar cal-editbar">${btn('event-cancel','Discard',icon('ic_menu_cancel')+e(t('Discard')))}<button type="submit">${icon('ic_menu_done')}${e(t('Save'))}</button></header><div class="cal-scroll"><div class="cal-account">${e(t('Calendar'))}<small>demo@example.com</small></div>${field('title','Event name')}${field('location','Location')}<label class="cal-check"><span>All day</span><input type="checkbox" name="allDay" ${draft.allDay?'checked':''}></label><fieldset><legend>Begins</legend>${field('date','Start date','date')}${field('time','Start time','time')}</fieldset><fieldset><legend>Ends</legend>${field('endDate','End date','date')}${field('endTime','End time','time')}</fieldset><label><span>${e(t('Repetition'))}</span><select name="repeat" aria-label="${e(t('Repetition'))}">${repeats.map(kind=>`<option value="${kind}" ${draft.repeat===kind?'selected':''}>${e(repeatLabel({...draft,repeat:kind},locale,t))}</option>`).join('')}</select></label><label><span>${e(t('Reminders'))}</span><select name="reminder" aria-label="${e(t('Reminders'))}">${[-1,...reminders].map(value=>`<option value="${value}" ${draft.reminder===value?'selected':''}>${e(reminderLabel(value,t))}</option>`).join('')}</select></label><label><span>Description</span><textarea name="description" maxlength="2000">${e(draft.description)}</textarea></label><p class="cal-form-error" role="alert">${ui.calendarError?e(t(ui.calendarError)):''}</p></div></form>`;
    }
    if(ui.sub==='event' && event) {
      const item=instance(event,ui.selectedInstance);
      // EventInfoFragment, FULL_WINDOW_STYLE on phones: Edit and Delete move from the headline to action bar icons (event_info_title_bar).
      return `<div class="app-view cal-app"><header class="cal-bar">${btn('back','Back','‹')}<strong>${e(t('Event details'))}</strong>${btn('event-edit','Edit',icon('ic_menu_compose'))}${btn('event-delete','Delete',icon('ic_menu_trash'))}</header><div class="cal-scroll"><section class="cal-event-head"><h2>${e(item.title)}</h2><p>${e(dateLabel(item.date,locale))}${item.endDate!==item.date?' – '+e(dateLabel(item.endDate,locale)):''}${item.allDay?'':e(', '+item.time+' – '+item.endTime)}</p><p>${e(item.location)}</p>${item.repeat!=='none'?`<p class="cal-repeat">${e(repeatLabel(item,locale,t))}</p>`:''}</section><section class="cal-event-body"><p>${e(item.description)}</p>${item.reminder>=0?`<h3>${e(t('Reminders'))}</h3><p>${e(reminderLabel(item.reminder,t))}</p>`:''}<h3>Calendar</h3><p>demo@example.com</p></section></div></div>`;
    }
    const header=`<header class="cal-bar"><button class="cal-view-picker" data-action="calendar-views"><span>${e(t(mode))} ▾</span><small>${e(dateLabel(selected,locale,{month:'long',year:'numeric'}))}</small></button>${btn('calendar-today','Today',`<span class="cal-today-icon">${icon('ic_menu_today')}<span aria-hidden="true">${now.getDate()}</span></span>`)}${btn('calendar-menu','Menu','<img src="assets/ic_menu_moreoverflow_normal_holo_light.png" alt="">')}</header>`;
    const row=item=>`<button class="cal-agenda-row" data-action="event-open" data-id="${item.id}" data-date="${item.date}"><time>${item.allDay?e(t('All day')):e(item.time)}<small>${item.allDay?'':e(item.endTime)}</small></time><span><strong>${e(item.title)}</strong><small>${e(item.location)}</small></span></button>`;
    let content='';
    if(mode==='Month') {
      content=`<div class="cal-weekdays">${week(selected,first).map(date=>`<span>${e(dateLabel(date,locale,{weekday:'short'}))}</span>`).join('')}</div><div class="cal-month" data-calendar-swipe>${month(selected,first).map(date=>{const items=onDay(data.events,date);return `<button data-action="calendar-day" data-id="${date}" aria-label="${e(dateLabel(date,locale))}" class="${date===iso(now)?'cal-today ':''}${date.slice(0,7)!==selected.slice(0,7)?'cal-other':''}"><span>${parse(date).getDate()}</span><div class="cal-busy">${items.slice(0,5).map(item=>`<i title="${e(item.title)}" style="--busy-start:${item.allDay||item.date<date?0:minutes(item.time)/14.4}%;--busy-height:${item.allDay?100:Math.max(4,((item.endDate>date?1440:minutes(item.endTime))-(item.date<date?0:minutes(item.time)))/14.4)}%"></i>`).join('')}</div></button>`;}).join('')}</div>`;
    } else if(mode==='Agenda') {
      const query=(ui.calendarSearch||'').toLocaleLowerCase(locale);
      const base=data.events.map(normalize),last=[plus(selected,90),...base.filter(item=>item.repeat==='none').map(item=>item.endDate)].sort().at(-1);
      const events=(query?base.filter(item=>[item.title,item.location,item.description].join(' ').toLocaleLowerCase(locale).includes(query)):expand(data.events,selected,last).filter(item=>item.repeat==='none'||item.date<=plus(selected,90))).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
      let previous='';content=`${ui.calendarSearch!==undefined?`<form class="cal-search" data-form="calendar-search"><input name="query" value="${e(ui.calendarSearch)}" placeholder="Search events" aria-label="Search events"><button type="submit">Search</button></form>`:''}<div class="cal-scroll cal-agenda">${events.map(item=>{const day=item.date!==previous?`<h3>${e(dateLabel(item.date,locale))}</h3>`:'';previous=item.date;return day+row(item);}).join('')||'<p class="cal-empty">No events</p>'}</div>`;
    } else {
      const dates=mode==='Day'?[selected]:week(selected,first);
      content=`<div class="cal-day-labels" style="--days:${dates.length}"><span></span>${dates.map(date=>`<button data-action="calendar-day" data-id="${date}" class="${date===iso(now)?'cal-today':''}">${e(dateLabel(date,locale,{weekday:'short'}))}<strong>${parse(date).getDate()}</strong></button>`).join('')}</div><div class="cal-all-day" style="--days:${dates.length}"><small>All day</small>${dates.map(date=>`<div>${onDay(data.events,date).filter(item=>item.allDay).map(item=>`<button data-action="event-open" data-id="${item.id}" data-date="${item.instance||item.date}">${e(item.title)}</button>`).join('')}</div>`).join('')}</div><div class="cal-scroll cal-time-scroll" data-calendar-swipe><div class="cal-hours" style="--days:${dates.length}"><div class="cal-hour-labels">${Array.from({length:24},(_,hour)=>`<span>${pad(hour)}:00</span>`).join('')}</div>${dates.map(date=>`<div class="cal-day-column">${Array.from({length:24},(_,hour)=>`<button class="cal-hour-cell" data-action="calendar-slot" data-id="${date}|${pad(hour)}:00" aria-label="${e(dateLabel(date,locale))} ${pad(hour)}:00"></button>`).join('')}${lanes(data.events,date).map(({event:item,start,end,lane,columns})=>`<button class="cal-timed-event" data-action="event-open" data-id="${item.id}" data-date="${item.instance||item.date}" style="top:${start/60*48}px;height:${Math.max(22,(end-start)/60*48)}px;left:${lane/columns*100}%;width:${100/columns}%"><strong>${e(item.title)}</strong><small>${e(item.time+' – '+item.endTime)}</small></button>`).join('')}</div>`).join('')}</div></div>`;
    }
    return `<div class="app-view cal-app">${header}${content}<footer class="cal-nav">${btn('calendar-prev','Previous','‹')}<span>${e(t(mode))}</span>${btn('calendar-next','Next','›')}</footer></div>`;
  }
  function overlay(ui,t) {
    const menu=body=>`<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu cal-menu">${body}</div>`;
    if(ui.overlay==='calendar-views')return menu(modes.map(mode=>`<button data-action="calendar-mode" data-id="${mode}" aria-pressed="${(ui.calendarMode||'Month')===mode}">${e(t(mode))}</button>`).join(''));
    if(ui.overlay==='calendar-menu')return menu('<button data-action="event-new">New event</button><button data-action="calendar-search">Search</button>');
    const scopes=(action,labels)=>`<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog cal-scope" role="dialog">${labels.map(([id,label])=>`<button data-action="${action}" data-id="${id}">${e(t(label))}</button>`).join('')}</div>`;
    if(ui.overlay==='calendar-edit-scope')return scopes('event-edit-scope',[['this','Change only this event'],['future','Change this and all future events'],['all','Change all events in the series']]);
    if(ui.overlay==='calendar-delete-scope')return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog cal-scope" role="dialog" aria-label="${e(t('Delete this event?'))}"><h3>${e(t('Delete this event?'))}</h3>${[['this','Only this event'],['future','This and future events'],['all','All events']].map(([id,label])=>`<button data-action="event-delete-scope" data-id="${id}">${e(t(label))}</button>`).join('')}<div class="settings-dialog-actions"><button data-action="close-overlay">${e(t('Cancel'))}</button></div></div>`;
    if(ui.overlay==='calendar-delete')return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${e(t('Delete event?'))}"><h3>Delete event?</h3><div class="settings-dialog-actions"><button data-action="close-overlay">Cancel</button><button data-action="event-confirm-delete">Delete</button></div></div>`;
    return '';
  }
  window.ICSCalendar={iso,parse,plus,normalize,valid,onDay,week,month,lanes,render,overlay,repeats,reminders,matches,expand,instance,dueReminders,repeatLabel,reminderLabel};
})();
