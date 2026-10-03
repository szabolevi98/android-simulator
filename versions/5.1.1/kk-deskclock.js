/* Android 4.4 DeskClock alarms (packages/apps/DeskClock android-4.4.4_r1): AlarmClockFragment is the first tab.
   alarm_time.xml cards: the time in 48 sp sans-serif-light ("h:mm" + condensed bold am/pm, or "kk:mm"), an on/off
   Switch, and a collapse/expand strip (ic_expand_down / ic_expand_up, the label in grey and the days in bold white).
   Expanded: label (hint "Label"), Repeat checkbox and seven day toggles (Sunday first, short weekday names, the
   toggle_underline: 2 dp, 8 dp in from the sides, blue when on), ringtone (ic_ringtone) and Vibrate; the trash can
   sits top right. Red holo checkboxes. Footer: a 56 dp #606060 round add button and the overflow.
   AlarmUtils.showTimeEditDialog: the datetimepicker RadialTimePicker in its dark theme (#363636 header, #404040
   circle, #ff3333 selection, 60 sp time, Done). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const pad = n => String(n).padStart(2, '0');
  // Sunday-first display order; stored days use 0 = Monday ... 6 = Sunday (desk-clock.js).
  const ORDER = [6, 0, 1, 2, 3, 4, 5];
  const weekday = (index, locale, style) => new Date(2024, 0, 1 + index).toLocaleDateString(locale, {weekday: style}); // 2024-01-01 was a Monday
  function timeParts(time, hour24) {
    const [h, m] = time.split(':').map(Number);
    if (hour24) return {text: `${pad(h)}:${pad(m)}`, ampm: ''};
    return {text: `${h % 12 || 12}:${pad(m)}`, ampm: h < 12 ? 'AM' : 'PM'};
  }
  function daysText(alarm, t, locale) {
    if (!alarm.days.length) return '';
    if (alarm.days.length === 7) return t('Every day');
    return ORDER.filter(day => alarm.days.includes(day)).map(day => weekday(day, locale, 'short')).join(', ');
  }
  const check = on => `<img class="kdc-check" src="assets/kdc-btn_check_${on ? 'on' : 'off'}_holo_dark_red.png" alt="">`;
  function card(alarm, {expanded, t, locale, hour24}) {
    const time = timeParts(alarm.time, hour24), days = daysText(alarm, t, locale);
    const repeat = alarm.days.length > 0 || alarm.repeatOpen;
    const dayButtons = ORDER.map(day => `<button class="kdc-day${alarm.days.includes(day) ? ' on' : ''}" data-action="kdc-day" data-id="${alarm.id}:${day}" aria-pressed="${alarm.days.includes(day)}" aria-label="${e(weekday(day, locale, 'long'))}">${e(weekday(day, locale, 'short'))}</button>`).join('');
    const expandArea = expanded ? `<div class="kdc-expand"><button class="kdc-label${alarm.label ? ' set' : ''}" data-action="kdc-label" data-id="${alarm.id}">${e(alarm.label || t('Label'))}</button><button class="kdc-checkrow${repeat ? ' on' : ''}" data-action="kdc-repeat" data-id="${alarm.id}" role="checkbox" aria-checked="${repeat}">${check(repeat)}<span>${e(t('Repeat'))}</span></button>${repeat ? `<div class="kdc-days">${dayButtons}</div>` : ''}<div class="kdc-tone-row"><button class="kdc-tone" data-action="kdc-tone" data-id="${alarm.id}"><img src="assets/kdc-ic_ringtone.png" alt=""><span>${e(t(alarm.tone === 'Silent' ? 'Silent' : alarm.tone))}</span></button><button class="kdc-checkrow kdc-vibrate${alarm.vibrate ? ' on' : ''}" data-action="kdc-vibrate" data-id="${alarm.id}" role="checkbox" aria-checked="${alarm.vibrate}">${check(alarm.vibrate)}<span>${e(t('Vibrate'))}</span></button></div></div>` : '';
    return `<div class="kdc-alarm${expanded ? ' expanded' : ''}${alarm.enabled ? '' : ' off'}" data-alarm="${alarm.id}"><div class="kdc-top"><button class="kdc-time" data-action="kdc-time" data-id="${alarm.id}" aria-label="${e(time.text + (time.ampm ? ' ' + time.ampm : ''))}">${e(time.text)}${time.ampm ? `<b>${time.ampm}</b>` : ''}</button><button class="holo-switch kdc-switch ${alarm.enabled ? 'on' : ''}" data-action="alarm-toggle" data-id="${alarm.id}" role="switch" aria-checked="${alarm.enabled}" aria-label="${e(t('Turn alarm on'))}"><span class="switch-label" aria-hidden="true">${alarm.enabled ? 'ON' : 'OFF'}</span></button></div><div class="kdc-body">${expanded ? `<button class="kdc-delete" data-action="kdc-delete" data-id="${alarm.id}" aria-label="${e(t('Delete alarm'))}"><img src="assets/kdc-ic_delete_normal.png" alt=""></button>` : ''}${expandArea}<button class="kdc-strip" data-action="kdc-expand" data-id="${alarm.id}" aria-label="${e(t(expanded ? 'Collapse alarm' : 'Expand alarm'))}" aria-expanded="${expanded}"><img src="assets/kdc-ic_expand_${expanded ? 'up' : 'down'}.png" alt="">${expanded ? '' : `<span class="kdc-summary"><span class="kdc-summary-label">${e(alarm.label)}</span><span class="kdc-summary-days">${e(days)}</span></span>`}</button></div></div>`;
  }
  function page(alarms, {expandedId, t, locale, hour24, normalize}) {
    const list = alarms.map(normalize).sort((a, b) => a.time.localeCompare(b.time));
    const body = list.length ? list.map(alarm => card(alarm, {expanded: alarm.id === expandedId, t, locale, hour24})).join('') : `<div class="kdc-empty"><img src="assets/kdc-ic_noalarms.png" alt=""><span>${e(t('No Alarms'))}</span></div>`;
    return `<div class="kdc-page"><div class="kdc-list">${body}</div><footer class="kdc-footer"><button class="kdc-add" data-action="kdc-add" aria-label="${e(t('Add alarm'))}"><img src="assets/kdc-ic_add.png" alt=""></button><button class="kdc-menu" data-action="jbclock-menu" aria-label="${e(t('More options'))}"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button></footer></div>`;
  }
  /* RadialPickerLayout: hours on the outer ring (1-12; in 24 h mode 00 and 13-23 outside, 1-12 inside), then minutes in steps of 5;
     a tap or drag picks, and picking the hour moves on to the minutes. */
  function picker(state, {t, hour24}) {
    const {hour, minute, mode} = state;
    const showHour = hour24 ? pad(hour) : String(hour % 12 || 12);
    const R = 270 * 0.906 / 2, numbersR = R * 0.82, innerR = R * 0.55;
    const values = mode === 'hour' ? (hour24 ? [...Array(12)].map((_, i) => ({v: i === 0 ? 0 : i + 12, label: i === 0 ? '00' : String(i + 12), r: numbersR})).concat([...Array(12)].map((_, i) => ({v: i === 0 ? 12 : i, label: String(i === 0 ? 12 : i), r: innerR}))) : [...Array(12)].map((_, i) => ({v: i === 0 ? 12 : i, label: String(i === 0 ? 12 : i), r: numbersR}))) : [...Array(12)].map((_, i) => ({v: i * 5, label: pad(i * 5), r: numbersR}));
    const current = mode === 'hour' ? (hour24 ? hour : hour % 12 || 12) : minute;
    const angleOf = v => mode === 'hour' ? ((v % 12) / 12) * 360 : (v / 60) * 360;
    const selR = mode === 'hour' && hour24 && hour >= 1 && hour <= 12 ? innerR : numbersR;
    const a = (angleOf(current) - 90) * Math.PI / 180;
    const sx = R + selR * Math.cos(a), sy = R + selR * Math.sin(a);
    const nums = values.map(item => { const ang = (angleOf(item.v) - 90) * Math.PI / 180; return `<span class="kdc-num${item.v === current ? ' sel' : ''}${item.r === innerR ? ' inner' : ''}" style="left:${(R + item.r * Math.cos(ang)).toFixed(2)}px;top:${(R + item.r * Math.sin(ang)).toFixed(2)}px">${item.label}</span>`; }).join('');
    return `<div class="settings-dialog-scrim" data-action="kdc-picker-cancel"></div><div class="kdc-picker" role="dialog" aria-label="${e(t('Time'))}"><div class="kdc-picker-header"><button class="${mode === 'hour' ? 'sel' : ''}" data-action="kdc-picker-mode" data-id="hour">${showHour}</button><span>:</span><button class="${mode === 'minute' ? 'sel' : ''}" data-action="kdc-picker-mode" data-id="minute">${pad(minute)}</button>${hour24 ? '' : `<button class="kdc-picker-ampm" data-action="kdc-picker-ampm">${hour < 12 ? 'AM' : 'PM'}</button>`}</div><div class="kdc-dial" data-kdc-dial style="width:${2 * R}px;height:${2 * R}px"><svg class="kdc-hand" viewBox="0 0 ${2 * R} ${2 * R}" aria-hidden="true"><circle cx="${R}" cy="${R}" r="2.7" fill="#ff3333"/><line x1="${R}" y1="${R}" x2="${sx.toFixed(2)}" y2="${sy.toFixed(2)}" stroke="#ff3333" stroke-width="1.8"/><circle cx="${sx.toFixed(2)}" cy="${sy.toFixed(2)}" r="15.4" fill="#ff3333" fill-opacity=".4"/></svg>${nums}${hour24 ? '' : `<button class="kdc-dial-ampm left${hour < 12 ? ' sel' : ''}" data-action="kdc-picker-ampm" data-id="am">AM</button><button class="kdc-dial-ampm right${hour >= 12 ? ' sel' : ''}" data-action="kdc-picker-ampm" data-id="pm">PM</button>`}</div><button class="kdc-picker-done" data-action="kdc-picker-done">${e(t('Done'))}</button></div>`;
  }
  // Maps a point on the dial to a value, the way RadialPickerLayout.getDegreesFromCoords does.
  function pick(state, x, y, size, hour24) {
    const R = size / 2, dx = x - R, dy = y - R, dist = Math.hypot(dx, dy);
    let deg = Math.atan2(dx, -dy) * 180 / Math.PI; if (deg < 0) deg += 360;
    if (state.mode === 'hour') {
      let h = Math.round(deg / 30) % 12;
      if (hour24) { const inner = dist < R * 0.685; h = inner ? (h === 0 ? 12 : h) : (h === 0 ? 0 : h + 12); }
      else { const pm = state.hour >= 12; h = (h === 0 ? 12 : h) % 12 + (pm ? 12 : 0); }
      return {...state, hour: h};
    }
    return {...state, minute: Math.round(deg / 6) % 60};
  }
  window.KKDeskClock = {ORDER, timeParts, daysText, card, page, picker, pick};
})();
