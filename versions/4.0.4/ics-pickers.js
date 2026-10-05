/* The framework's DatePickerDialog and TimePickerDialog of the Galaxy Nexus image (IMM76I, android-4.0.4):
   - date_picker_dialog.xml (phones): spinnersShown="true", calendarViewShown="false", so only the three NumberPickers of
     date_picker_holo.xml (month, day, year in the locale's DateFormat order, 16 dp side margins). The title is the
     picked date (FORMAT_SHOW_DATE | SHOW_WEEKDAY | SHOW_YEAR | ABBREV_MONTH | ABBREV_WEEKDAY); buttons Cancel and Set.
   - time_picker_holo.xml: hour, the ":" divider, minute and, on a 12-hour clock, AM / PM; the title is "Set time".
   - Widget.Holo.NumberPicker: a selector wheel of three values, 18 sp, the middle one between the 2 dp
     numberpicker_selection_divider lines; the others fade. Day, minute (and a 24-hour hour) use TWO_DIGIT_FORMATTER.
   Texts are framework-res.apk's (date_time_set, cancel, date_picker_dialog_title, time_picker_dialog_title). State:
   {kind: 'date', y, m, d} or {kind: 'time', h, min, hour24}, plus theme ('light' for Calendar, 'dark' for DeskClock)
   and the action of Set. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const STRINGS = {
    'Set': ['Beállítás', 'Speichern', 'Définir', 'Establecer'],
    'Cancel': ['Mégse', 'Abbruch', 'Annuler', 'Cancelar'],
    'Set time': ['Idő beállítása', 'Uhrzeit festlegen', "Définir l'heure", 'Establecer hora']
  };
  const LANGS = ['hu', 'de', 'fr', 'es'];
  const T = (locale, key) => { const i = LANGS.indexOf(String(locale).slice(0, 2)); return i >= 0 && STRINGS[key] ? STRINGS[key][i] : key; };
  const two = n => String(n).padStart(2, '0');
  const daysIn = (y, m) => new Date(y, m + 1, 0).getDate();
  // DateFormat.getDateFormatOrder: the order of M, d and y in the locale's short date pattern.
  const order = locale => {
    const parts = new Intl.DateTimeFormat(locale, {year: 'numeric', month: '2-digit', day: '2-digit'}).formatToParts(new Date(2012, 9, 5));
    return parts.filter(p => ['year', 'month', 'day'].includes(p.type)).map(p => p.type);
  };
  const wrap = (v, lo, hi) => v < lo ? hi : v > hi ? lo : v;
  // One NumberPicker: the previous, current and next value; tapping the outer ones (or the wheel / a drag) steps.
  const column = (id, values, label) => `<div class="icpk-col" data-col="${id}" aria-label="${e(label)}"><button type="button" class="prev" data-action="icpk-step" data-id="${id}:-1">${e(values[0])}</button><b>${e(values[1])}</b><button type="button" class="next" data-action="icpk-step" data-id="${id}:1">${e(values[2])}</button></div>`;
  function render(state, locale) {
    if (!state) return '';
    let title, body;
    if (state.kind === 'date') {
      const {y, m, d} = state, monthName = i => new Date(2012, i, 1).toLocaleDateString(locale, {month: 'short'});
      const n = daysIn(y, m), cols = {
        month: column('month', [monthName(wrap(m - 1, 0, 11)), monthName(m), monthName(wrap(m + 1, 0, 11))], 'month'),
        day: column('day', [two(wrap(d - 1, 1, n)), two(d), two(wrap(d + 1, 1, n))], 'day'),
        year: column('year', [y - 1, y, y + 1].map(v => v < 1900 || v > 2100 ? '' : v), 'year')
      };
      title = new Date(y, m, d).toLocaleDateString(locale, {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'});
      body = order(locale).map(k => cols[k]).join('');
    } else {
      const {h, min, hour24} = state, h12 = v => (v % 12) || 12, am = new Date(2012, 0, 1, 9).toLocaleTimeString(locale, {hour: 'numeric', hour12: true}).replace(/[\d\s]/g, '') || 'AM';
      const pm = new Date(2012, 0, 1, 21).toLocaleTimeString(locale, {hour: 'numeric', hour12: true}).replace(/[\d\s]/g, '') || 'PM';
      const hours = hour24 ? [wrap(h - 1, 0, 23), h, wrap(h + 1, 0, 23)].map(two) : [h12(wrap(h - 1, 0, 23)), h12(h), h12(wrap(h + 1, 0, 23))].map(String);
      title = T(locale, 'Set time');
      body = column('hour', hours, 'hour') + '<span class="icpk-divider">:</span>' + column('minute', [wrap(min - 1, 0, 59), min, wrap(min + 1, 0, 59)].map(two), 'minute')
        + (hour24 ? '' : column('ampm', h < 12 ? ['', am, pm] : [am, pm, ''], 'AM/PM'));
    }
    return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="icpk ${state.theme === 'dark' ? 'dark' : 'light'}" role="dialog" aria-label="${e(title)}"><h3>${e(title)}</h3><div class="icpk-pickers">${body}</div><div class="icpk-actions"><button type="button" data-action="close-overlay">${e(T(locale, 'Cancel'))}</button><button type="button" data-action="${state.setAction || 'icpk-set'}">${e(T(locale, 'Set'))}</button></div></div>`;
  }
  // NumberPicker steps wrap around (setWrapSelectorWheel); the year stops at 1900 and 2100 like DatePicker's limits.
  function step(state, spec) {
    const [col, delta] = String(spec).split(':'), dv = Number(delta);
    if (state.kind === 'date') {
      if (col === 'month') state.m = wrap(state.m + dv, 0, 11);
      if (col === 'day') state.d = wrap(state.d + dv, 1, daysIn(state.y, state.m));
      if (col === 'year') state.y = Math.min(2100, Math.max(1900, state.y + dv));
      state.d = Math.min(state.d, daysIn(state.y, state.m));
    } else {
      if (col === 'hour') state.h = wrap(state.h + dv, 0, 23);
      if (col === 'minute') state.min = wrap(state.min + dv, 0, 59);
      if (col === 'ampm' && ((dv > 0 && state.h < 12) || (dv < 0 && state.h >= 12))) state.h = (state.h + 12) % 24;
    }
    return state;
  }
  const iso = s => `${s.y}-${two(s.m + 1)}-${two(s.d)}`;
  const hhmm = s => `${two(s.h)}:${two(s.min)}`;
  function fromValue(kind, value, extra = {}) {
    if (kind === 'date') { const [y, m, d] = String(value).split('-').map(Number); return {kind, y: y || 2012, m: (m || 1) - 1, d: d || 1, ...extra}; }
    const [h, min] = String(value).split(':').map(Number); return {kind, h: h || 0, min: min || 0, ...extra};
  }
  // The selector wheel also turns with the mouse wheel and with a vertical drag (one step per 48 dp row).
  let drag = null;
  document.addEventListener('wheel', event => {
    const col = event.target.closest?.('.icpk-col'); if (!col) return;
    event.preventDefault(); col.querySelector(event.deltaY > 0 ? '.next' : '.prev')?.click();
  }, {passive: false});
  document.addEventListener('pointerdown', event => { const col = event.target.closest?.('.icpk-col'); drag = col ? {col, y: event.clientY, moved: false} : null; });
  document.addEventListener('pointermove', event => {
    if (!drag) return; const dy = event.clientY - drag.y, row = drag.col.querySelector('b')?.offsetHeight || 40;
    if (Math.abs(dy) >= row) { drag.moved = true; drag.y = event.clientY; drag.col.querySelector(dy > 0 ? '.prev' : '.next')?.click(); drag.col = document.querySelector(`.icpk-col[data-col="${drag.col.dataset.col}"]`) || drag.col; }
  });
  document.addEventListener('pointerup', () => { if (drag?.moved) { const stop = ev => { ev.stopPropagation(); ev.preventDefault(); }; document.addEventListener('click', stop, {capture: true, once: true}); setTimeout(() => document.removeEventListener('click', stop, {capture: true}), 50); } drag = null; });
  window.ICSPickers = {render, step, iso, hhmm, fromValue, T};
})();
