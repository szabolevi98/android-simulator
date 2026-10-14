/* Android 2.1 Calendar (Calendar.apk, ERE27).
   - Month (month_activity.xml; the selected day on month_view_selected): the title bar with the month centred ("MMMM yyyy"), the 23 dp day names (daynames
     #c3d9ff, MonthView_DayLabel #112abb, Monday first as the locale has it), then MonthView's 6 weeks: cells on
     month_view_background, today on month_view_today_background with a white number, other months' numbers #a0a0a0,
     the day number (MONTH_DAY_TEXT_SIZE 20) at the lower left and the busy bits at the right (dna_empty, filled by the
     day's events). A flick up / down changes the month; a tap opens the day.
   - Day / Week (CalendarView): hour labels #446688 on #e8eef7 down the left, the grid white with #dddddd lines, the
     selected hour #ffffcc, events on box_appointment; Agenda: the days with their events.
   - Menu (MenuHelper): Agenda, Day, Week, Month (the current one left out), New event, Today, then My calendars,
     Settings.
   - Edit event (edit_event.xml on #fafafa): What, From / To (date and time buttons), All day, Where, Description,
     Calendar, Guests, Repetition, Reminders; Done / Revert. Event info: What, When, Where, Description; Edit / Delete.
   Events are the phone's own (none at first). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const K = () => EC.text('calendar');
  EC.defaults.events = [];
  const DAY = 86400000;
  const sod = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  const same = (a, b) => sod(a).getTime() === sod(b).getTime();
  const events = c => (c.data.events || []).slice().sort((a, b) => a.start - b.start);
  const eventsOn = (c, d) => events(c).filter(e => { const s = sod(d).getTime(); return e.start < s + DAY && e.end > s || same(e.start, d); });
  const firstDay = c => c.lang === 'en' ? 0 : 1;   // Calendar.getFirstDayOfWeek for the locale
  const view = c => c.ui.calView || 'month';
  const cursor = c => new Date(c.ui.calDate ?? c.now().getTime());

  function title(c, text) { return `<div class="eccal-title npp-fw-title_bar"><i class="ec-bg np-fw-title_bar"></i><span>${esc(text)}</span></div>`; }
  function month(c) {
    const cur = cursor(c), first = new Date(cur.getFullYear(), cur.getMonth(), 1), today = c.now();
    const lead = (first.getDay() - firstDay(c) + 7) % 7, start = new Date(first); start.setDate(1 - lead);
    const names = Array.from({length: 7}, (_, i) => new Date(2024, 0, 7 + firstDay(c) + i).toLocaleDateString(c.locale(), {weekday: 'short'}));
    let cells = '';
    for (let i = 0; i < 42; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const other = d.getMonth() !== cur.getMonth(), isToday = same(d, today), sel = same(d, cur), n = eventsOn(c, d).length;
      const bg = sel ? 'month_view_selected' : isToday ? 'month_view_today_background' : 'month_view_background';
      const dna = n === 0 ? 'dna_empty' : n >= 6 ? 'dna_6_of_6' : n === 1 ? 'dna_1_of_6' : 'dna_2345_of_6';
      cells += `<button type="button" class="eccal-cell${other ? ' other' : ''}${isToday || sel ? ' today' : ''}" data-action="eccal-day" data-time="${d.getTime()}"><i class="ec-bg np-ca-${bg}"></i><i class="ec-bg ec-pressed np-ca-month_view_pressed"></i><img class="eccal-dna" src="assets/ca-${dna}.png" alt=""><span>${d.getDate()}</span></button>`;
    }
    return `<div class="eccal">${title(c, cur.toLocaleDateString(c.locale(), {month: 'long', year: 'numeric'}))}<div class="eccal-names">${names.map(n => `<span>${esc(n)}</span>`).join('')}</div><i class="eccal-div"></i><div class="eccal-month">${cells}</div></div>`;
  }
  function hours(c, days) {
    const h24 = c.is24(), cols = days.length;
    let html = '<div class="eccal-hours">';
    for (let h = 0; h < 24; h++) html += `<div class="eccal-hl"><span>${h24 ? String(h).padStart(2, '0') : h % 12 || 12}</span>${h24 ? '' : `<small>${h === 0 || h === 12 ? c.javaAmPm(h) : ''}</small>`}</div>`;
    html += '</div><div class="eccal-cols">';
    for (const d of days) {
      html += `<div class="eccal-col" data-time="${sod(d).getTime()}">`;
      for (let h = 0; h < 24; h++) html += `<button type="button" class="eccal-slot${c.ui.calSel === sod(d).getTime() + h * 3600000 ? ' sel' : ''}" data-action="eccal-slot" data-time="${sod(d).getTime() + h * 3600000}"></button>`;
      for (const e of eventsOn(c, d).filter(e => !e.allDay)) {
        const top = (Math.max(e.start, sod(d).getTime()) - sod(d).getTime()) / 3600000, len = Math.max(0.5, (Math.min(e.end, sod(d).getTime() + DAY) - Math.max(e.start, sod(d).getTime())) / 3600000);
        html += `<button type="button" class="eccal-ev npp-ca-box_appointment_normal" style="top:calc(${top * 52} * var(--dp));height:calc(${len * 52} * var(--dp))" data-action="eccal-event" data-id="${e.id}"><i class="ec-bg np-ca-box_appointment_normal"></i><i class="ec-bg ec-pressed np-ca-box_appointment_pressed"></i><span>${esc(e.title || K().t('no_title_label'))}</span></button>`;
      }
      html += '</div>';
    }
    return html + `</div>`;
  }
  function day(c, week) {
    const cur = cursor(c);
    let days = [cur];
    if (week) { const s = new Date(cur); s.setDate(cur.getDate() - (cur.getDay() - firstDay(c) + 7) % 7); days = Array.from({length: 7}, (_, i) => { const d = new Date(s); d.setDate(s.getDate() + i); return d; }); }
    const head = week ? `${days[0].toLocaleDateString(c.locale(), {month: 'short', day: 'numeric'})} – ${days[6].toLocaleDateString(c.locale(), {month: 'short', day: 'numeric', year: 'numeric'})}`
      : cur.toLocaleDateString(c.locale(), {weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'});
    const banner = week ? `<div class="eccal-banner"><i></i>${days.map(d => `<span${same(d, c.now()) ? ' class="today"' : ''}>${esc(d.toLocaleDateString(c.locale(), {weekday: 'short'}))} ${d.getDate()}</span>`).join('')}</div>` : '';
    return `<div class="eccal">${title(c, head)}${banner}<div class="eccal-grid${week ? ' week' : ''}">${hours(c, days)}</div></div>`;
  }
  function agenda(c) {
    const list = events(c).filter(e => e.end >= sod(c.now()).getTime());
    const by = new Map();
    for (const e of list) { const k = sod(e.start).getTime(); (by.get(k) || by.set(k, []).get(k)).push(e); }
    const rows = [...by].map(([k, es]) => `<div class="eccal-aday">${esc(same(k, c.now()) ? K().fmt('agenda_today', c.lang, new Date(k).toLocaleDateString(c.locale(), {month: 'short', day: 'numeric', year: 'numeric'})) : new Date(k).toLocaleDateString(c.locale(), {weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'}))}</div>${es.map(e => `<button type="button" class="eccal-aitem" data-action="eccal-event" data-id="${e.id}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span class="t1">${esc(e.title || K().t('no_title_label'))}</span><span class="t2">${esc(span(c, e))}</span>${e.where ? `<span class="t2">${esc(e.where)}</span>` : ''}</button>`).join('')}`).join('');
    return `<div class="eccal">${title(c, K().t('agenda_view'))}<div class="eccal-agenda">${rows}</div></div>`;
  }
  const tfmt = (c, t) => c.timeText(new Date(t));
  const dfmt = (c, t) => new Date(t).toLocaleDateString(c.locale(), {weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'});
  const span = (c, e) => e.allDay ? dfmt(c, e.start) : `${tfmt(c, e.start)} – ${tfmt(c, e.end)}`;

  // Edit event
  function edit(c) {
    const e = c.ui.calEdit;
    const field = (key, hint, value) => `<span class="ecwf-edit npp-fw-textfield_default"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><input class="ecwf-input" data-field="${key}" value="${esc(value || '')}" placeholder="${esc(K().t(hint))}" autocomplete="off"></span>`;
    const btn = (action, text, extra = '') => `<button type="button" class="ecui-button eccal-eb${extra}" data-action="${action}"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(text)}</span></button>`;
    const rep = [K().t('does_not_repeat'), K().t('daily'), K().t('every_weekday'), K().fmt('weekly', c.lang, new Date(e.start).toLocaleDateString(c.locale(), {weekday: 'long'})), K().fmt('monthly_on_day', c.lang, new Date(e.start).getDate()), K().fmt('yearly', c.lang, new Date(e.start).toLocaleDateString(c.locale(), {month: 'long', day: 'numeric'}))];
    return `<div class="eccal">${title(c, K().t('event_edit_title'))}<div class="eccal-edit">
      <div class="eccal-l">${esc(K().t('what_label'))}</div>${field('title', 'hint_what', e.title)}
      <div class="eccal-l">${esc(K().t('edit_event_from_label'))}</div><div class="eccal-pair">${btn('eccal-sdate', dfmt(c, e.start), ' date')}${e.allDay ? '' : btn('eccal-stime', tfmt(c, e.start))}</div>
      <div class="eccal-l">${esc(K().t('edit_event_to_label'))}</div><div class="eccal-pair">${btn('eccal-edate', dfmt(c, e.end), ' date')}${e.allDay ? '' : btn('eccal-etime', tfmt(c, e.end))}</div>
      <div class="eccal-allday"><span>${esc(K().t('edit_event_all_day_label'))}</span><button type="button" data-action="eccal-allday"><img src="assets/fw-btn_check_${e.allDay ? 'on' : 'off'}.png" alt=""></button></div><i class="eccal-bdiv"></i>
      <div class="eccal-l">${esc(K().t('where_label'))}</div>${field('where', 'hint_where', e.where)}
      <div class="eccal-l">${esc(K().t('description_label'))}</div>${field('desc', 'hint_description', e.desc)}
      <div class="eccal-l">${esc(K().t('repeats_label'))}</div><button type="button" class="ecwf-spinner" data-action="eccal-repeat"><i class="ec-bg np-fw-btn_dropdown_normal"></i><i class="ec-bg ec-pressed np-fw-btn_dropdown_pressed"></i><span>${esc(rep[e.repeat || 0])}</span></button>
      </div><div class="ecsa-bar">${btn('eccal-save', K().t('save_label'))}${btn('eccal-revert', K().t('discard_label'))}</div></div>`;
  }
  function info(c) {
    const e = (c.data.events || []).find(x => x.id === c.ui.calEvent);
    if (!e) return month(c);
    return `<div class="eccal">${title(c, K().t('event_info_title'))}<div class="eccal-info"><div class="eccal-ititle">${esc(e.title || K().t('no_title_label'))}</div>
      <div class="eccal-l">${esc(K().t('when_label'))}</div><div class="eccal-v">${esc(dfmt(c, e.start))}<br>${esc(span(c, e))}</div>
      ${e.where ? `<div class="eccal-l">${esc(K().t('where_label'))}</div><div class="eccal-v">${esc(e.where)}</div>` : ''}
      ${e.desc ? `<div class="eccal-l">${esc(K().t('description_label'))}</div><div class="eccal-v">${esc(e.desc)}</div>` : ''}</div></div>`;
  }
  function newEvent(c, at) {
    const s = at ?? (() => { const n = c.now(); n.setMinutes(0, 0, 0); n.setHours(n.getHours() + 1); return n.getTime(); })();
    c.ui.calEdit = {id: 0, title: '', where: '', desc: '', start: s, end: s + 3600000, allDay: false, repeat: 0};
    c.open('calendar', 'edit');
  }
  function readFields(c) { const r = c.el.viewport; const e = c.ui.calEdit; for (const k of ['title', 'where', 'desc']) { const i = r.querySelector(`[data-field="${k}"]`); if (i) e[k] = i.value; } }

  EC.register('calendar', {
    title: 'Calendar',
    render(c) {
      if (c.ui.sub === 'edit' && c.ui.calEdit) return edit(c);
      if (c.ui.sub === 'event') return info(c);
      const v = view(c);
      return v === 'day' ? day(c, false) : v === 'week' ? day(c, true) : v === 'agenda' ? agenda(c) : month(c);
    },
    mount(c, root) {
      const m = root.querySelector('.eccal-month');
      if (m) {   // flicks change the month
        let y0 = null;
        m.addEventListener('pointerdown', e => { y0 = e.clientY; });
        m.addEventListener('pointerup', e => { if (y0 === null) return; const dy = e.clientY - y0; y0 = null; if (Math.abs(dy) > 40) { c.suppressClick = Date.now() + 300; const d = cursor(c); d.setDate(1); d.setMonth(d.getMonth() + (dy < 0 ? 1 : -1)); c.ui.calDate = d.getTime(); c.render(); } });
      }
      const g = root.querySelector('.eccal-grid');
      if (g && !c.ui.calScrolled) { g.scrollTop = g.scrollHeight * 8 / 24; }
    },
    action(name, el, event, c) {
      if ((c.suppressClick || 0) > Date.now()) return true;
      const e = c.ui.calEdit;
      switch (name) {
        case 'eccal-day': c.ui.calDate = Number(el.dataset.time); c.ui.calView = 'day'; c.render(); return true;
        case 'eccal-slot': { const t = Number(el.dataset.time); if (c.ui.calSel === t) newEvent(c, t); else { c.ui.calSel = t; c.render(); } return true; }
        case 'eccal-event': c.ui.calEvent = Number(el.dataset.id); c.open('calendar', 'event'); return true;
        case 'eccal-allday': readFields(c); e.allDay = !e.allDay; c.render(); return true;
        case 'eccal-sdate': case 'eccal-edate': {
          readFields(c); const key = name === 'eccal-sdate' ? 'start' : 'end', d = new Date(e[key]);
          c.datePicker({date: d, onSet: (y, m, dd) => { const len = e.end - e.start; d.setFullYear(y, m, dd); e[key] = d.getTime(); if (key === 'start') e.end = e.start + len; else if (e.end < e.start) e.start = e.end - 3600000; c.render(); }}); return true;
        }
        case 'eccal-stime': case 'eccal-etime': {
          readFields(c); const key = name === 'eccal-stime' ? 'start' : 'end', d = new Date(e[key]);
          c.timePicker({hour: d.getHours(), minute: d.getMinutes(), onSet: (h, mi) => { const len = e.end - e.start; d.setHours(h, mi, 0, 0); e[key] = d.getTime(); if (key === 'start') e.end = e.start + len; else if (e.end < e.start) e.end = e.start + 3600000; c.render(); }}); return true;
        }
        case 'eccal-repeat': {
          readFields(c);
          const s = new Date(e.start), items = [K().t('does_not_repeat'), K().t('daily'), K().t('every_weekday'), K().fmt('weekly', c.lang, s.toLocaleDateString(c.locale(), {weekday: 'long'})), K().fmt('monthly_on_day', c.lang, s.getDate()), K().fmt('yearly', c.lang, s.toLocaleDateString(c.locale(), {month: 'long', day: 'numeric'}))];
          c.dialog({title: K().t('repeats_label'), icon: null, items, choice: 'single', checked: e.repeat || 0, closeOnChoice: true, buttons: [{label: EC.text('framework').t('cancel')}], onItem: i => { e.repeat = i; c.render(); }});
          return true;
        }
        case 'eccal-save': {
          readFields(c);
          const list = c.data.events || [];
          if (e.id) c.data.events = list.map(x => x.id === e.id ? {...e} : x);
          else c.data.events = [...list, {...e, id: Date.now()}];
          c.ui.calDate = e.start; c.ui.calEdit = null; c.save(); c.back(); return true;
        }
        case 'eccal-revert': c.ui.calEdit = null; c.back(); return true;
      }
      return false;
    },
    menu(c) {
      if (c.ui.sub === 'edit') return true;
      if (c.ui.sub === 'event') {
        const ev = (c.data.events || []).find(x => x.id === c.ui.calEvent), F = EC.text('framework');
        c.menu([{label: K().t('edit_event_label'), icon: 'fw-ic_menu_edit.png', action: () => { c.ui.calEdit = {...ev}; c.open('calendar', 'edit'); }},
          {label: K().t('delete_event_label'), icon: 'fw-ic_menu_delete.png', action: () => c.dialog({title: K().t('delete_label'), icon: 'fw-ic_dialog_alert.png', message: K().t('delete_this_event_title'), buttons: [{label: F.t('ok'), action: () => { c.data.events = c.data.events.filter(x => x !== ev); c.save(); c.back(); }}, {label: F.t('cancel')}]})}]);
        return true;
      }
      const v = view(c), go = to => () => { c.ui.calView = to; c.render(); };
      c.menu([...[['agenda', 'agenda_view', 'ic_menu_agenda'], ['day', 'day_view', 'ic_menu_day'], ['week', 'week_view', 'ic_menu_week'], ['month', 'month_view', 'ic_menu_month']].filter(m => m[0] !== v).map(([id, label, icon]) => ({label: K().t(label), icon: `fw-${icon}.png`, action: go(id)})),
        {label: K().t('event_create'), icon: 'fw-ic_menu_add.png', action: () => newEvent(c, c.ui.calSel)},
        {label: K().t('goto_today'), icon: 'fw-ic_menu_today.png', action: () => { c.ui.calDate = c.now().getTime(); c.render(); }},
        {label: K().t('menu_select_calendars'), icon: 'fw-ic_menu_manage.png', action: () => c.open('calendar-select')},
        {label: K().t('menu_preferences'), icon: 'fw-ic_menu_preferences.png', action: () => c.open('calendar-settings')}]);
      return true;
    },
    back(c) {
      if (!c.ui.sub && view(c) !== 'month' && c.ui.calFrom !== view(c)) { /* views are one activity each in 2.1: Back leaves */ }
      if (c.ui.sub === 'edit') { c.ui.calEdit = null; return false; }
      return false;
    }
  });
})();
