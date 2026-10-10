/* Android 4.3 alarms (DeskClockGoogle, JWR66Y): the AlarmClock activity the clock page's alarm button opens.
   AlarmClockTheme (Theme.Holo on blackish #1c1e20) with alarm_list_menu.xml: Add alarm as an action (ic_menu_add), Settings
   and Help in the overflow. alarm_time.xml cards on alarm_whiteish (#0cffffff), 6 dp apart: the time in 48 sp (bold hours,
   light minutes, the condensed bold AM/PM), the on/off Switch; a #28ffffff hairline and the 32 dp info strip (the label in
   clock_gray, the days in bold condensed caps, ic_expand_down). Expanded (AlarmItemAdapter.expandAlarm): the label (hint
   "Label"), the Repeat check box with seven day_button.xml toggles (toggle_underline: a 2 dp #33b5e5 line when on), the
   ringtone (ic_ringtone) and Vibrate, then the hairline and ic_expand_up. Swiping a card away deletes it (SwipeLayout,
   "Alarm deleted."). The time opens DeskClock's TimePicker (time_picker_view.xml): the 60 dp digits filled from the right,
   ic_backspace, a 1-9 / 0 keypad in 48 sp light with AM / PM (24 sp) or :00 / :30, then Cancel / OK. Words from the image
   (alarm-strings.js). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const A = key => { const row = window.AlarmStrings?.[key]; return row ? row[window.AndroidI18n?.language] || row.en : key; };
  const pad = n => String(n).padStart(2, '0');
  // Alarm.DaysOfWeek on the cards: Sunday first in en-US; stored days are 0 = Monday ... 6 = Sunday (desk-clock.js).
  const ORDER = [6, 0, 1, 2, 3, 4, 5];
  const weekday = (index, locale, style) => new Date(2024, 0, 1 + index).toLocaleDateString(locale, {weekday: style});
  function daysText(alarm, locale) {
    if (!alarm.days.length) return '';
    if (alarm.days.length === 7) return A('every_day');
    return ORDER.filter(day => alarm.days.includes(day)).map(day => weekday(day, locale, 'short')).join(', ');
  }
  const check = on => `<img class="jba-check" src="assets/btn_check_${on ? 'on' : 'off'}_holo_dark.png" alt="">`;
  function card(alarm, {expanded, locale, hour24}) {
    const [h, m] = alarm.time.split(':').map(Number), hours = hour24 ? pad(h) : String(h % 12 || 12), ampm = hour24 ? '' : (h < 12 ? 'AM' : 'PM');
    const repeat = alarm.days.length > 0 || alarm.repeatOpen, days = daysText(alarm, locale);
    const strip = `<button class="jba-info" data-action="jba-expand" data-id="${alarm.id}" aria-label="${e(A(expanded ? 'collapse_alarm' : 'expand_alarm'))}"><span class="jba-summary">${alarm.label ? `<span class="jba-summary-label">${e(alarm.label)}</span>` : ''}${days ? `<b>${e(days)}</b>` : ''}</span><img src="assets/jdc-ic_expand_down.png" alt=""></button>`;
    const expand = expanded ? `<div class="jba-expand"><button class="jba-label${alarm.label ? ' set' : ''}" data-action="jba-label" data-id="${alarm.id}">${e(alarm.label || A('label'))}</button><button class="jba-checkrow" data-action="jba-repeat" data-id="${alarm.id}" role="checkbox" aria-checked="${repeat}">${check(repeat)}<span>${e(A('alarm_repeat'))}</span></button>${repeat ? `<div class="jba-days">${ORDER.map(day => `<button class="${alarm.days.includes(day) ? 'on' : ''}" data-action="jba-day" data-id="${alarm.id}:${day}" aria-pressed="${alarm.days.includes(day)}" aria-label="${e(weekday(day, locale, 'long'))}">${e(weekday(day, locale, 'short'))}</button>`).join('')}</div>` : ''}<div class="jba-tone-row"><button class="jba-tone" data-action="jba-tone" data-id="${alarm.id}"><img src="assets/jdc-ic_ringtone.png" alt=""><span>${e(alarm.tone)}</span></button><button class="jba-checkrow jba-vibrate" data-action="jba-vibrate" data-id="${alarm.id}" role="checkbox" aria-checked="${alarm.vibrate}">${check(alarm.vibrate)}<span>${e(A('alarm_vibrate'))}</span></button></div><i class="jba-hairline"></i><button class="jba-collapse" data-action="jba-expand" data-id="${alarm.id}" aria-label="${e(A('collapse_alarm'))}"><img src="assets/jdc-ic_expand_up.png" alt=""></button></div>` : '';
    return `<div class="jba-card${alarm.enabled ? '' : ' off'}" data-jba-swipe="${alarm.id}"><div class="jba-top"><button class="jba-time" data-action="jba-time" data-id="${alarm.id}"><b>${e(hours)}</b><span>:${pad(m)}</span>${ampm ? `<small>${ampm}</small>` : ''}</button><button class="holo-switch jba-switch ${alarm.enabled ? 'on' : ''}" data-action="alarm-toggle" data-id="${alarm.id}" role="switch" aria-checked="${alarm.enabled}"><span class="switch-label" aria-hidden="true">${alarm.enabled ? 'ON' : 'OFF'}</span></button></div><i class="jba-hairline"></i>${expanded ? '' : strip}${expand}</div>`;
  }
  function page(alarms, {expandedId, locale, hour24, normalize}) {
    const list = alarms.map(normalize).sort((a, b) => a.time.localeCompare(b.time));
    return `<div class="app-view jba-app"><header class="jba-bar"><button class="jba-up" data-action="back" aria-label="${e(A('alarm_list_title'))}"><img src="assets/ic_ab_back_holo_dark.png" alt=""><img src="assets/clock.png" alt=""></button><h2>${e(A('alarm_list_title'))}</h2><button class="jba-action" data-action="jba-add" aria-label="${e(A('add_alarm'))}"><img src="assets/jdc-ic_menu_add.png" alt=""></button><button class="jba-action" data-action="jba-menu" aria-label="More options"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button></header><div class="jba-list">${list.map(alarm => card(alarm, {expanded: alarm.id === expandedId, locale, hour24})).join('')}</div></div>`;
  }
  // TimePicker: digits enter from the right (at most four); valid once it reads a real time.
  function pickerValue(digits, hour24, ampm) {
    const d = digits.padStart(4, '0'), h = Number(d.slice(0, 2)), m = Number(d.slice(2));
    if (!digits || m > 59) return null;
    if (hour24) return h < 24 ? {h, m} : null;
    if (h < 1 || h > 12 || !ampm) return null;
    return {h: h % 12 + (ampm === 'pm' ? 12 : 0), m};
  }
  function picker(state, {hour24}) {
    const d = state.digits.padStart(4, '-'), ok = !!pickerValue(state.digits, hour24, state.ampm);
    const key = k => `<button data-action="jba-key" data-id="${k}"${state.digits.length >= 4 ? ' disabled' : ''}>${k}</button>`;
    const side = (id, label) => `<button class="jba-ampm" data-action="jba-key" data-id="${id}">${label}</button>`;
    return `<div class="settings-dialog-scrim" data-action="jba-picker-cancel"></div><div class="jba-picker" role="dialog"><div class="jba-picker-display"><span class="jba-picker-time"><b>${d[0]}${d[1]}</b><span>:</span><b>${d[2]}${d[3]}</b>${hour24 ? '' : `<small>${state.ampm ? state.ampm.toUpperCase() : '--'}</small>`}</span><button class="jba-back" data-action="jba-key" data-id="back"${state.digits ? '' : ' disabled'}><img src="assets/jdc-ic_backspace_${state.digits ? 'normal' : 'disabled'}.png" alt=""></button></div><i class="jba-hairline"></i><div class="jba-keys">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(key).join('')}${hour24 ? side(':00', ':00') : side('am', 'AM')}${key(0)}${hour24 ? side(':30', ':30') : side('pm', 'PM')}</div><i class="jba-hairline"></i><div class="jba-picker-buttons"><button data-action="jba-picker-cancel">${e(A('time_picker_cancel'))}</button><button data-action="jba-picker-set"${ok ? '' : ' disabled'}>${e(A('time_picker_set'))}</button></div></div>`;
  }
  function pickerKey(state, key, hour24) {
    if (key === 'back') return {...state, digits: state.digits.slice(0, -1), ampm: state.digits.length <= 1 ? '' : state.ampm};
    if (key === 'am' || key === 'pm') return {...state, ampm: key};
    if (key === ':00' || key === ':30') return state.digits.length && state.digits.length <= 2 ? {...state, digits: state.digits + key.slice(1)} : state;
    if (state.digits.length >= 4 || (!state.digits && key === '0')) return state;
    return {...state, digits: state.digits + key};
  }
  window.JBAlarms = {ORDER, daysText, card, page, picker, pickerKey, pickerValue};
})();
