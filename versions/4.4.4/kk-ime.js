/* The KitKat system keyboard: Google Keyboard 2.0.19003 (the KTU84P image's LatinImeGoogle.apk) in its default theme,
   KLP (config_default_keyboard_theme_index 2). The keyboard layout set follows the language as
   locale_and_extra_value_to_keyboard_layout_set_map has it: English QWERTY, German and Hungarian QWERTZ, French AZERTY,
   Spanish with Ñ. Rows are rows_qwerty / rows_symbols / rows_symbols_shift (10 %p keys, the second row 5 %p in, a 15 %p
   shift / layout key and the delete key 1 %p inset, a 50 %p space bar) and, for a numeric password,
   rows_number_password (three 26.67 %p keys 10 %p in). The enter key carries the field's IME action: "Done" on the
   keyguard (flagForceAscii|actionDone), "Next" in Settings (actionNext). Password fields get the dollar currency key
   and no voice key, so the comma sits next to ?123. Keys send data-lock-key values to lockscreen.js. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const LAYOUT = {en: 'qwerty', de: 'qwertz', hu: 'qwertz', fr: 'azerty', es: 'spanish'};
  const LETTERS = {qwerty: ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'], qwertz: ['qwertzuiop', 'asdfghjkl', 'yxcvbnm'], azerty: ['azertyuiop', 'qsdfghjklm', "wxcvbn'"], spanish: ['qwertyuiop', 'asdfghjklñ', 'zxcvbnm']};
  // label_done_key / label_next_key and the spoken descriptions of this LatinIME.
  const WORDS = {
    done: {en: 'Done', hu: 'Kész', de: 'Fertig', fr: 'OK', es: 'Listo'},
    next: {en: 'Next', hu: 'Köv.', de: 'Weiter', fr: 'Suiv.', es: 'Siguiente'},
    delete: {en: 'Delete', hu: 'Törlés', de: 'Entf', fr: 'Supprimer', es: 'Eliminar'},
    shift: {en: 'Shift', hu: 'Shift', de: 'Shift', fr: 'Maj', es: 'Mayús'},
    symbols: {en: 'Symbols', hu: 'Szimbólumok', de: 'Symbole', fr: 'Symboles', es: 'Símbolos'},
    letters: {en: 'Letters', hu: 'Betűk', de: 'Buchstaben', fr: 'Lettres', es: 'Letras'},
    space: {en: 'Space', hu: 'Szóköz', de: 'Leerzeichen', fr: 'Espace', es: 'Barra espaciadora'}
  };
  const word = (key, lang) => WORDS[key][lang] || WORDS[key].en;
  const key = (k, label, type = 'normal', extra = {}) => ({k, label, type, w: 10, ...extra});
  const chars = (text, extra) => [...text].map(c => key(c, c, 'normal', extra));
  // Key backgrounds of btn_keyboard_key_klp: letters light_normal_holo, functional keys dark_normal_holo, the action
  // key dark_active_klp, the shift key dark_normal_off_holo / dark_normal_on_klp with its LED.
  function rows({mode = 'alpha', shift = false, symbols = false, more = false, action = 'done', lang = 'en'}) {
    const enter = key('next', word(action, lang), 'action', {w: 15, label: word(action, lang)});
    const del = key('delete', '', 'fn', {w: 15, icon: 'sym_keyboard_delete_holo_dark', aria: word('delete', lang), inset: 'left'});
    if (mode === 'number') {
      const digit = (d, hint) => key(d, d, 'normal', {w: 26.67, hint, number: true});
      return [[digit('1'), digit('2', 'ABC'), digit('3', 'DEF')], [digit('4', 'GHI'), digit('5', 'JKL'), digit('6', 'MNO')], [digit('7', 'PQRS'), digit('8', 'TUV'), digit('9', 'WXYZ')],
        [{...del, w: 26.67, inset: ''}, digit('0'), {...enter, w: 26.67}]].map(row => ({x: 10, keys: row}));
    }
    if (symbols) {
      const top = more ? chars('~`|•√Π÷×¶∆') : chars('1234567890');
      const middle = more ? chars('£¢€¥^°={}') : chars('@#$%&-+()');
      const third = more ? chars('\\©®™℅[]') : chars('*"\':;!?');
      const bottom = more ? [key('<', '<', 'fn'), key('>', '>', 'fn'), key('space', '', 'normal', {w: 30, aria: word('space', lang)}), key(',', ',', 'fn'), key('.', '.', 'fn')]
        : [key('_', '_', 'fn'), key('/', '/', 'fn'), key('space', '', 'normal', {w: 30, aria: word('space', lang)}), key(',', ',', 'fn'), key('.', '.', 'fn')];
      return [{keys: top}, {x: 5, keys: middle},
        {keys: [key('more', more ? '?123' : '= \\ <', 'fn', {w: 15, inset: 'right', aria: word('symbols', lang)}), ...third, del]},
        {keys: [key('symbols', 'ABC', 'fn', {w: 15, aria: word('letters', lang)}), ...bottom, enter]}];
    }
    const layout = LETTERS[LAYOUT[lang] || 'qwerty'], up = c => shift ? (c === "'" ? '?' : c.toUpperCase()) : c;
    const [r1, r2, r3] = layout.map(row => [...row].map(up));
    return [{keys: r1.map((c, i) => key(c, c, 'normal', {hint: String((i + 1) % 10)}))}, {x: r2.length === 9 ? 5 : 0, keys: r2.map(c => key(c, c))},
      {keys: [key('shift', '', 'shift', {w: 15, icon: shift ? 'sym_keyboard_shift_locked_holo_dark' : 'sym_keyboard_shift_holo_dark', on: shift === 'lock', inset: 'right', aria: word('shift', lang)}), ...r3.map(c => key(c, c)), del]},
      {keys: [key('symbols', '?123', 'fn', {w: 15, aria: word('symbols', lang)}), key(',', ',', 'fn'), key('space', '', 'normal', {w: 50, aria: word('space', lang)}), key('.', '.', 'fn'), enter]}];
  }
  function render(opts = {}) {
    // Percent widths and margins resolve against the row, which is the keyboard's full width.
    const html = rows(opts).map(row => `<div class="kime-row">${row.keys.map((k, i) => {
      const cls = `kime-key kime-${k.type}${k.on ? ' kime-on' : ''}${k.inset ? ` kime-inset-${k.inset}` : ''}${k.number ? ' kime-num' : ''}${k.label && k.label.length > 1 && k.type !== 'normal' ? ' kime-label' : ''}`;
      const face = k.icon ? `<img src="assets/kime-${k.icon}.png" alt="">` : k.number ? `<b>${e(k.label)}</b>${k.hint ? `<small>${e(k.hint)}</small>` : ''}` : `${e(k.label)}${k.hint ? `<small>${e(k.hint)}</small>` : ''}`;
      return `<button type="button" class="${cls}" style="width:${k.w}%${i === 0 && row.x ? `;margin-left:${row.x}%` : ''}" data-lock-key="${e(k.k)}" aria-label="${e(k.aria || k.label)}"><span>${face}</span></button>`;
    }).join('')}</div>`).join('');
    return `<div class="kime${opts.mode === 'number' ? ' kime-number' : ''}" data-no-translate>${html}</div>`;
  }
  window.KKIme = {render, rows, LAYOUT};
})();
