/* Interruptions of the Nexus 6 LMY48Y (packages/apps/Settings and frameworks/base android-5.1.1_r26):
   - ZenModeSettings with zen_mode_settings.xml: "When calls and notifications arrive" (a DropDownPreference), Priority
     interruptions (Events and reminders, Calls, Messages, "Calls/messages from", the alarm note) and Downtime (Days, Start
     time, End time, Interruptions allowed; the last three depend on Days). The image has no condition provider app, so
     the Automation category is removed (refreshAutomationSection).
   - Choosing priority or none sets the mode at once and opens ZenModeConditionSelection under the mode's caption:
     "Indefinitely", then ZenModeConfig.MINUTE_BUCKETS from 8 hours down to 15 minutes, then the providers' conditions
     (config_system_condition_providers: countdown, downtime, next_alarm): Downtime within 4 hours of its start, "Until
     next alarm" within 12 hours. CANCEL puts the old mode back; OK keeps the condition, which ends the mode.
   - DowntimeConditionProvider: a downtime starts at the start time of a chosen day and lasts to the end time (the next
     day when not later). Entering one with interruptions on switches to its mode once (mDowntimed); with "None" the
     downtime also ends at an alarm before its end.
   Settings keep ZenModeConfig's defaults (default_zen_mode_config.xml: no calls or messages, 22:00-07:00; events on,
   from anyone). Days use java.util.Calendar numbers, 1 = Sunday ... 7 = Saturday. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const MINUTE = 60000, HOUR = 60 * MINUTE;
  const MINUTE_BUCKETS = [15, 30, 45, 60, 120, 180, 240, 480];
  const NEXT_ALARM_LOOKAHEAD = 12 * HOUR, DOWNTIME_LOOKAHEAD = 4 * HOUR; // config_*_condition_lookahead_threshold_hrs
  const DAYS = [2, 3, 4, 5, 6, 7, 1]; // ZenModeDowntimeDaysSelection.DAYS: Monday ... Sunday
  const MODES = {all: 'Always interrupt', priority: 'Allow only priority interruptions', none: "Don't interrupt"};
  const FROM = {anyone: 'Anyone', starred: 'Starred contacts only', contacts: 'Contacts only'};
  const config = s => ({calls: !!s.zenCalls, messages: !!s.zenMessages, events: s.zenEvents !== false, from: FROM[s.zenFrom] ? s.zenFrom : 'anyone',
    days: DAYS.filter(day => (s.zenDays || []).includes(day)), start: s.zenStart || '22:00', end: s.zenEnd || '07:00', sleepNone: !!s.zenSleepNone});
  const minutesOf = hhmm => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
  const at = (now, hhmm, dayOffset = 0) => { const d = new Date(now); d.setDate(d.getDate() + dayOffset); d.setHours(0, minutesOf(hhmm), 0, 0); return d.getTime(); };
  // DowntimeCalendar.isInDowntime: today's or yesterday's window, the end moved to the next day when not after the start.
  function downtimeAt(c, now) {
    if (!c.days.length) return null;
    const length = (minutesOf(c.end) - minutesOf(c.start) + 1440) % 1440 || 1440;
    for (const offset of [0, -1]) {
      const start = at(now, c.start, offset), end = start + length * MINUTE;
      if (c.days.includes(new Date(start).getDay() + 1) && now >= start && now < end) return {start, end};
    }
    return null;
  }
  // DowntimeCalendar.nextDowntimeStart and getNextTime.
  function nextStart(c, now) {
    for (let i = 0; i < 8; i++) { const t = at(now, c.start, i); if (t > now && c.days.includes(new Date(t).getDay() + 1)) return t; }
    return Infinity;
  }
  const nextTime = (now, hhmm) => { const t = at(now, hhmm); return t > now ? t : at(now, hhmm, 1); };
  // DowntimeConditionProvider.createCondition: the end time, or an earlier alarm while nothing may interrupt.
  function downtimeEnd(c, now, mode, nextAlarm) {
    const end = nextTime(now, c.end);
    return mode === 'none' && nextAlarm > now && nextAlarm < end ? nextAlarm : end;
  }
  // ZenModeConditionSelection's radio buttons in the order they are added.
  function conditions(s, now, nextAlarm) {
    const c = config(s), mode = s.zenMode || 'all';
    const list = [{id: 'forever', label: ['Indefinitely']}];
    for (const minutes of [...MINUTE_BUCKETS].reverse()) {
      const hours = Math.round(minutes / 60);
      list.push({id: `countdown:${minutes}`, until: now + minutes * MINUTE, label: minutes < 60 ? ['For %d minutes', minutes] : hours === 1 ? ['For one hour'] : ['For %d hours', hours]});
    }
    if (c.days.length && (downtimeAt(c, now) || nextStart(c, now) <= now + DOWNTIME_LOOKAHEAD)) list.push({id: 'downtime', until: downtimeEnd(c, now, mode, nextAlarm), label: ['Until your downtime ends']});
    if (nextAlarm > now && nextAlarm - now < NEXT_ALARM_LOOKAHEAD) list.push({id: 'alarm', until: nextAlarm, label: ['Until next alarm']});
    return list;
  }
  const labelOf = (label, t) => t(label[0]).replace('%d', label[1]);
  // A minute of the simulator: the condition that ends the mode, then the downtime autotrigger. True when the mode changed.
  function tick(s, now, nextAlarm) {
    let changed = false;
    if (s.zenExit && now >= s.zenExit.until) { s.zenMode = 'all'; s.zenExit = null; changed = true; }
    const c = config(s), current = downtimeAt(c, now);
    if (!current) { if (s.zenDowntimed) delete s.zenDowntimed; return changed; }
    if ((s.zenMode || 'all') === 'all' && s.zenDowntimed !== current.start) {
      s.zenMode = c.sleepNone ? 'none' : 'priority';
      s.zenExit = {kind: 'downtime', until: downtimeEnd(c, now, s.zenMode, nextAlarm)};
      s.zenDowntimed = current.start;
      changed = true;
    }
    return changed;
  }
  // The condition chosen in the dialog; the downtime one also marks this downtime as entered.
  function confirm(s, condition, now) {
    s.zenExit = condition && condition.until ? {kind: condition.id.split(':')[0], until: condition.until} : null;
    if (condition?.id === 'downtime') { const current = downtimeAt(config(s), now); if (current) s.zenDowntimed = current.start; }
  }
  const timeText = (hhmm, locale, hour24) => new Date(at(0, hhmm)).toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit', hour12: !hour24});
  const dayName = (day, locale, style) => new Date(2024, 0, 6 + day).toLocaleDateString(locale, {weekday: style}); // 2024-01-07 was a Sunday
  // updateDays: the chosen days as "EEE" joined with summary_divider_text, or zen_mode_downtime_days_none.
  const daysText = (c, t, locale) => c.days.length ? c.days.map(day => dayName(day, locale, 'short')).join(', ') : t('None');
  // updateEndSummary.
  function endText(c, t, locale, hour24) {
    const time = timeText(c.end, locale, hour24), nextDay = minutesOf(c.start) >= minutesOf(c.end);
    const format = c.sleepNone ? (nextDay ? '%s next day or any alarm before' : '%s or any alarm before') : nextDay ? '%s next day' : '';
    return format ? t(format).replace('%s', time) : time;
  }
  function page(s, {t, locale, hour24}) {
    const c = config(s), mode = s.zenMode || 'all', noDays = !c.days.length;
    const cat = title => `<div class="section-label">${e(t(title))}</div>`;
    const row = (title, summary, action, id, disabled) => `<button class="settings-row" data-action="${action}" data-id="${id}"${disabled ? ' disabled' : ''}><span class="row-copy">${e(t(title))}<small>${e(summary)}</small></span></button>`;
    const sw = (title, key, on) => `<button class="settings-row lp-switch-row" data-action="toggle-setting" data-id="${key}" role="switch" aria-checked="${on}"><span class="row-copy">${e(t(title))}</span><span class="lp-mswitch${on ? ' on' : ''}" aria-hidden="true"></span></button>`;
    return `${row('When calls and notifications arrive', t(MODES[mode]), 'lp-zen-drop', 'mode')}${cat('Priority interruptions')}${sw('Events and reminders', 'zenEvents', c.events)}${sw('Calls', 'zenCalls', c.calls)}${sw('Messages', 'zenMessages', c.messages)}${row('Calls/messages from', t(FROM[c.from]), 'lp-zen-drop', 'from', !c.calls && !c.messages)}<div class="settings-row lp-zen-note"><span class="row-copy"><small>${e(t('Alarms are always priority interruptions'))}</small></span></div>${cat('Downtime')}${row('Days', daysText(c, t, locale), 'lp-zen-days', '')}${row('Start time', timeText(c.start, locale, hour24), 'lp-zen-time', 'start', noDays)}${row('End time', endText(c, t, locale, hour24), 'lp-zen-time', 'end', noDays)}${row('Interruptions allowed', t(c.sleepNone ? 'None' : 'Priority only'), 'lp-zen-drop', 'downtime', noDays)}`;
  }
  // DropDownPreference: the Spinner's dropdown (simple_spinner_dropdown_item: 48 dp rows of 16 sp text, 8 dp padding)
  // on popup_background_material, over the preference (overlapAnchor); the simulator places it at the row.
  function dropdown(kind, s, t) {
    const items = kind === 'mode' ? Object.entries(MODES) : kind === 'from' ? Object.entries(FROM) : [['priority', 'Priority only'], ['none', 'None']];
    return `<div class="menu-scrim" data-action="close-overlay"></div><div class="lp-dropdown" role="listbox">${items.map(([id, title]) => `<button role="option" data-action="lp-zen-pick" data-id="${kind}:${id}">${e(t(title))}</button>`).join('')}</div>`;
  }
  // ZenModeConditionSelection in an AlertDialog titled with the new mode: content_margin_left padding, OK and CANCEL.
  function conditionDialog(state, t) {
    return `<div class="settings-dialog-scrim" data-action="lp-zen-cancel"></div><div class="settings-dialog lp-zen-dialog" role="dialog" aria-label="${e(t(MODES[state.mode]))}"><h3>${e(t(MODES[state.mode]))}</h3><div class="lp-zen-conditions" role="radiogroup">${state.list.map((item, i) => `<button class="settings-row" data-action="lp-zen-cond" data-id="${i}" role="radio" aria-checked="${state.index === i}"><span class="lp-radio${state.index === i ? ' on' : ''}" aria-hidden="true"></span><span class="row-copy">${e(labelOf(item.label, t))}</span></button>`).join('')}</div><div class="settings-dialog-actions"><button data-action="lp-zen-cancel">${e(t('CANCEL'))}</button><button data-action="lp-zen-ok">${e(t('OK'))}</button></div></div>`;
  }
  // ZenModeDowntimeDaysSelection: zen_downtime_day.xml check boxes (48 dp, textAppearanceMedium, "EEEE") Monday first,
  // 17 dp side padding; a change applies at once, Done closes.
  function daysDialog(s, t, locale) {
    const c = config(s);
    return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog lp-zen-dialog lp-zen-days" role="dialog" aria-label="${e(t('Days'))}"><h3>${e(t('Days'))}</h3>${DAYS.map(day => `<button class="settings-row" data-action="lp-zen-day" data-id="${day}" role="checkbox" aria-checked="${c.days.includes(day)}"><span class="lp-check${c.days.includes(day) ? ' on' : ''}" aria-hidden="true"></span><span class="row-copy">${e(dayName(day, locale, 'long'))}</span></button>`).join('')}<div class="settings-dialog-actions"><button data-action="close-overlay">${e(t('Done'))}</button></div></div>`;
  }
  window.LPZen = {MINUTE_BUCKETS, DAYS, MODES, FROM, config, downtimeAt, nextStart, nextTime, downtimeEnd, conditions, labelOf, tick, confirm, daysText, endText, timeText, page, dropdown, conditionDialog, daysDialog};
})();
