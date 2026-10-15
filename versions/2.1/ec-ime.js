/* Android 2.1 on-screen keyboard: VoiceSearchWithKeyboard.apk's LatinIME (the image's only input method, "Android
   keyboard") drawn from its own key layouts (ec-keyboard-data.js, docs/tools/ec-keyboard.py).
   - KeyboardView (input.xml on keyboard_background; Widget.KeyboardView: keys on btn_keyboard_key, white text with a
     #bb000000 shadow of 2.75, one character 22 sp, longer labels 14 sp bold; keys 54 dp high (key_height), widths in %
     of the keyboard). Sticky shift: btn_keyboard_key_normal_off / _on, sym_keyboard_shift_locked when held / double-tapped.
   - Layouts: kbd_qwerty (res/xml-de and res/xml-fr for German and French), "?123" → kbd_symbols, ALT →
     kbd_symbols_shift, ABC back. The bottom row follows the field (keyboardMode): normal, url (.com /), email (@ .com),
     im (:-) instead of return); the voice variants put the mic in place of "," (voice input is on in this image).
   - The key preview (keyboard_key_preview.xml: 40 sp on keyboard_key_feedback_background, 80 dp high, keyPreviewOffset
     -12 dp) shows above a pressed character key; delete and space repeat (isRepeatable).
   - It opens when a text field of the screen gets focus (soft input adjustResize: the screen above shrinks) and closes on
     Back or when the field loses focus. Auto-capitalisation: at the start and after ". ", "! ", "? " (sentence caps).
   - Android keyboard settings (prefs.xml): Vibrate on keypress (off; vibrate_duration_ms 30), Sound on keypress (off;
     AudioManager.playSoundEffect FX_KEYPRESS_STANDARD / SPACEBAR / DELETE / RETURN, /system/media/audio/ui, not in
     silent mode), Auto-capitalization (on), Voice input (on: the mic key; off: the plain layouts).
   A computer keyboard keeps typing into the same fields. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  let field = null, layer = null, sheet = 'qwerty', shift = 0, lastShift = 0, preview = null, repeat = 0;   // shift: 0 off, 1 on, 2 locked
  const base = c => c.lang === 'de' ? 'qwerty_de' : c.lang === 'fr' ? 'qwerty_fr' : 'qwerty';
  // The field's keyboardMode (EditorInfo → LatinIME.onStartInputView).
  function mode(el) {
    const kind = el.dataset.ime || (el.type === 'email' ? 'email' : el.type === 'url' ? 'url' : 'normal');
    return EC.context?.data.prefs?.enable_voice_input === false ? `id/mode_${kind}` : `id/mode_${kind}_voice`;
  }
  function rows(c) {
    const data = EC.keyboardXml[sheet === 'qwerty' ? base(c) : sheet], want = field ? mode(field) : 'id/mode_normal_voice';
    return data.rows.filter(r => !r.mode || r.mode === want || (!data.rows.some(x => x.mode === want) && r.mode === 'id/mode_normal'));
  }
  const ICON = {'-1': 'shift', '-5': 'delete', 32: 'space', 10: 'return', '-102': 'mic'};
  function draw(c) {
    if (!layer) return;
    const shifted = sheet === 'qwerty' && shift > 0;
    layer.innerHTML = `<div class="ecime-keys npp-lk-keyboard_background"><i class="ec-bg np-lk-keyboard_background"></i>${rows(c).map(r => `<div class="ecime-row">${r.keys.map((k, i) => {
      const code = k.codes ?? (k.label ? String(k.label.codePointAt(0)) : ''), w = (k.width ?? EC.keyboardXml.qwerty.keyWidth ?? 0.1) * 100, gap = (k.gap ?? 0) * 100;
      const sticky = k.sticky, on = sticky && shift > 0;
      const bg = sticky ? `btn_keyboard_key_normal_${on ? 'on' : 'off'}` : 'btn_keyboard_key_normal', press = sticky ? `btn_keyboard_key_pressed_${on ? 'on' : 'off'}` : 'btn_keyboard_key_pressed';
      let icon = k.icon ? k.icon.split('/')[1] : '';
      if (icon === 'sym_keyboard_shift' && shift === 2) icon = 'sym_keyboard_shift_locked';
      const label = k.label ? (shifted && k.label.length === 1 ? k.label.toLocaleUpperCase(c.locale()) : k.label) : '';
      return `<button type="button" class="ecime-key${label.length > 1 ? ' small' : ''}" style="width:${w}%;margin-left:${gap}%" data-code="${esc(code)}" data-out="${esc(k.output || (label.length === 1 ? label : ''))}"${k.repeatable ? ' data-repeat="1"' : ''} tabindex="-1"><i class="ec-bg np-lk-${bg}"></i><i class="ec-bg ec-pressed np-lk-${press}"></i>${icon ? `<img src="assets/lk-${icon}.png" alt="">` : `<span>${esc(label)}</span>`}</button>`;
    }).join('')}</div>`).join('')}</div>`;
  }
  function show(c, el) {
    field = el;
    if (!layer) {
      layer = document.createElement('div'); layer.className = 'ecime'; layer.addEventListener('pointerdown', event => down(c, event));
      layer.addEventListener('pointerup', up); layer.addEventListener('pointercancel', up); layer.addEventListener('pointerleave', up);
      c.el.screen.append(layer);
    }
    sheet = 'qwerty'; autoCap();
    draw(c); layer.hidden = false;
    c.el.screen.classList.add('ime-open');
    c.el.screen.style.setProperty('--ime-height', `${layer.offsetHeight}px`);
  }
  function hide(c) {
    if (!layer || layer.hidden) return false;
    layer.hidden = true; field = null;
    c.el.screen.classList.remove('ime-open');
    return true;
  }
  // Sentence capitalisation (TextUtils.getCapsMode with CAP_MODE_SENTENCES).
  function autoCap() {
    if (shift === 2 || !field) return;
    if (EC.context?.data.prefs?.auto_cap === false) { shift = 0; return; }
    const before = field.value.slice(0, field.selectionStart ?? field.value.length);
    shift = !field.dataset.noCaps && (/^\s*$/.test(before) || /[.!?]\s+$/.test(before)) ? 1 : 0;
  }
  function insert(text) {
    if (!field) return;
    const s = field.selectionStart ?? field.value.length, e = field.selectionEnd ?? s;
    if (field.maxLength > 0 && field.value.length - (e - s) + text.length > field.maxLength) return;
    field.setRangeText(text, s, e, 'end');
    field.dispatchEvent(new Event('input', {bubbles: true}));
  }
  function key(c, btn) {
    const code = Number(btn.dataset.code), out = btn.dataset.out;
    if (code === -1) {   // shift: a tap toggles, a second tap within 400 ms locks (LatinIME.handleShift / double-tap)
      const now = Date.now();
      shift = shift === 1 && now - lastShift < 400 ? 2 : shift ? 0 : 1; lastShift = now;
      if (sheet !== 'qwerty') sheet = sheet === 'symbols' ? 'symbols_shift' : 'symbols';
      draw(c); return;
    }
    if (code === -2) { sheet = sheet === 'qwerty' ? 'symbols' : 'qwerty'; shift = 0; if (sheet === 'qwerty') autoCap(); draw(c); return; }
    if (code === -5) {
      if (!field) return;
      const s = field.selectionStart ?? field.value.length, e = field.selectionEnd ?? s;
      if (s === e && s > 0) field.setRangeText('', s - 1, s, 'end'); else if (s !== e) field.setRangeText('', s, e, 'end');
      field.dispatchEvent(new Event('input', {bubbles: true}));
    } else if (code === -102) { c.open('voice-search'); return; }
    else if (code === 10) {
      if (field.tagName === 'TEXTAREA') insert('\n');
      else field.form?.requestSubmit?.() ?? field.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
    } else if (code === 32) insert(' ');
    else if (out) insert(out);
    if (sheet === 'qwerty') { if (shift === 1) shift = 0; autoCap(); draw(c); }
  }
  function down(c, event) {
    const btn = event.target.closest('.ecime-key');
    if (!btn) return;
    event.preventDefault();   // keeps the focus in the field
    btn.classList.add('down');
    const p = c.data.prefs || {}, code = Number(btn.dataset.code);
    if (p.vibrate_on) navigator.vibrate?.(30);
    if (p.sound_on && !c.data.settings.ringer) { const fx = code === 32 ? 'Spacebar' : code === -5 ? 'Delete' : code === 10 ? 'Return' : 'Standard'; new Audio(`assets/ui-Keypress${fx}.ogg`).play().catch(() => {}); }
    const span = btn.querySelector('span');
    if (span && span.textContent.length === 1) {
      preview ||= Object.assign(document.createElement('div'), {className: 'ecime-preview npp-fw-keyboard_key_feedback_background'});
      preview.innerHTML = `<i class="ec-bg np-fw-keyboard_key_feedback_background"></i><span>${esc(span.textContent)}</span>`;
      const r = btn.getBoundingClientRect(), s = c.el.screen.getBoundingClientRect();
      c.el.screen.append(preview); preview.hidden = false;
      // Centred over the key by its own size (no transform: a nine-patch between device pixels shows seams).
      const pr = preview.getBoundingClientRect();
      preview.style.left = `${r.left + r.width / 2 - pr.width / 2 - s.left}px`; preview.style.top = `calc(${r.top - s.top - pr.height}px + 12 * var(--dp))`;
    }
    key(c, btn);
    if (btn.dataset.repeat) { clearInterval(repeat); repeat = setTimeout(() => { repeat = setInterval(() => key(c, btn), 50); }, 400); }
  }
  function up() {
    clearTimeout(repeat); clearInterval(repeat);
    layer?.querySelectorAll('.down').forEach(b => b.classList.remove('down'));
    if (preview) preview.hidden = true;
  }

  EC.register('ime', {
    app: false,
    init(c) {
      c.el.screen.addEventListener('focusin', event => {
        const el = event.target;
        if (el.matches?.('input:not([type=checkbox]):not([type=radio]):not([readonly]), textarea') && c.el.viewport.contains(el) || el.closest?.('.ecui-dialog') && el.matches('input, textarea')) show(c, el);
      });
      c.el.screen.addEventListener('focusout', event => {
        setTimeout(() => { if (field && document.activeElement !== field) hide(c); }, 0);
      });
      // Back closes the keyboard first (InputMethodService.onKeyDown BACK).
      c.imeBack = () => { const was = hide(c); if (was) document.activeElement?.blur?.(); return was; };
    },
    render: () => ''
  });
})();
