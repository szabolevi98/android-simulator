/* Android 2.1 Calculator (Calculator.apk, ERE27; Theme.Black.NoTitleBar), layout-port/main.xml:
   - CalculatorDisplay (weight 1): two EditTexts without background (display_style: 40 dp white, right-aligned, padding
     8 dp, one line) that swap with a 500 ms slide up when a result comes (Scroll.UP);
   - PanelSwitcher (weight 4): the basic pad (a row of weight 2: an empty button-coloured cell of weight 3 and CLEAR, then
     four rows of weight 3: 7 8 9 ÷ / 4 5 6 × / 1 2 3 − / . 0 = +) and the advanced pad (sin cos tan / ln log ! / π e ^ /
     ( ) √), switched by a fling, 400 ms;
   - ColorButton: 1 dp margins, button (#000 → #333) or blue_button (#071622 → #253541) gradients upwards, white text,
     the text size times screen width / 320 (adjustFontSize: 40 dp → 60 dp, button_small_style 30 → 45, CLEAR 15 →
     22.5); pressed: a 2 px white frame (magic_flame), fading out over CLICK_FEEDBACK_DURATION 350 ms after a click.
   Logic: buttons insert their text, functions of two or more letters with "(" (EventListener); a result can be
   followed by an operator (acceptInsert); CLEAR deletes one character, or the whole result / error, and a long press
   clears (onDelete / onClear); = drops trailing operators, evaluates (arity, radians), shows "Error" for NaN, "∞" for
   Infinity and "−" for minus, the number fitted to the digits the display holds (Util.doubleToString, ROUND_DIGITS 1).
   Menu: Clear history (clear_history), Advanced panel (advanced) / Basic panel (simple). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const T = () => EC.text('calculator');
  const OPS = '+−×÷/*';
  const BASIC = [['7', '8', '9', '÷'], ['4', '5', '6', '×'], ['1', '2', '3', '−'], ['.', '0', '=', '+']];
  const ADVANCED = [['sin', 'cos', 'tan'], ['ln', 'log', '!'], ['π', 'e', '^'], ['(', ')', '√']];
  const DIGITS = '0123456789.';

  // A small evaluator for what the pads can type (arity's grammar: implicit multiplication, postfix !, right-assoc ^,
  // √ as a prefix, unclosed parentheses closed at the end).
  function evaluate(src) {
    let i = 0;
    const s = src.replace(/\s/g, '');
    const peek = () => s[i];
    const fact = n => { if (n < 0 || n !== Math.floor(n)) return gamma(n + 1); let r = 1; for (let k = 2; k <= n; k++) r *= k; return r; };
    const gamma = z => { if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z)); z -= 1; const g = 7, p = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7]; let x = p[0]; for (let k = 1; k < g + 2; k++) x += p[k] / (z + k); const t = z + g + 0.5; return Math.sqrt(2 * Math.PI) * t ** (z + 0.5) * Math.exp(-t) * x; };
    const FN = {sin: Math.sin, cos: Math.cos, tan: Math.tan, ln: Math.log, log: Math.log10};
    function primary() {
      const ch = peek();
      if (ch === undefined) throw new Error('end');
      if (ch === '(') { i++; const v = expr(); if (peek() === ')') i++; return v; }
      if (ch === '√') { i++; return Math.sqrt(unaryPow()); }
      if (ch === 'π') { i++; return Math.PI; }
      for (const name of ['sin', 'cos', 'tan', 'log', 'ln']) if (s.startsWith(name, i)) { i += name.length; return FN[name](unaryPow()); }
      if (ch === 'e') { i++; return Math.E; }
      const m = /^(\d+\.?\d*|\.\d+)(E[-−]?\d+)?/.exec(s.slice(i));
      if (!m) throw new Error('syntax');
      i += m[0].length;
      return Number(m[0].replace('−', '-'));
    }
    function postfix() { let v = primary(); while (peek() === '!') { i++; v = fact(v); } return v; }
    function power() { const b = postfix(); if (peek() === '^') { i++; return b ** unaryPow(); } return b; }
    function unaryPow() { if (peek() === '-' || peek() === '−') { i++; return -unaryPow(); } if (peek() === '+') { i++; return unaryPow(); } return power(); }
    function term() {
      let v = unaryPow();
      for (;;) {
        const ch = peek();
        if (ch === '×' || ch === '*') { i++; v *= unaryPow(); }
        else if (ch === '÷' || ch === '/') { i++; v /= unaryPow(); }
        else if (ch !== undefined && !'+−-)'.includes(ch) && ch !== '^' && ch !== '!') v *= unaryPow();   // implicit
        else return v;
      }
    }
    function expr() { let v = term(); for (;;) { const ch = peek(); if (ch === '+') { i++; v += term(); } else if (ch === '−' || ch === '-') { i++; v -= term(); } else return v; } }
    const v = expr();
    if (i < s.length) throw new Error('syntax');
    return v;
  }
  // arity Util.doubleToString(x, maxLen, rounding 1): 16 significant digits, Java's notation (E for ≥ 1e7 or < 1e-3),
  // then shortened to maxLen keeping the exponent.
  function format(x, maxLen) {
    if (x === 0) return '0';
    const neg = x < 0, a = Math.abs(x);
    let str;
    const round = Number(a.toPrecision(15));
    if (round >= 1e7 || round < 1e-3) {
      const [mant, exp] = round.toExponential().split('e');
      str = `${mant.replace(/\.?0+$/, '')}E${Number(exp)}`;
    } else str = String(round);
    const len = maxLen - (neg ? 1 : 0);
    if (str.length > len) {
      if (str.includes('E')) { const [mant, exp] = str.split('E'); const keep = Math.max(1, len - exp.length - 1); str = `${mant.slice(0, keep).replace(/\.$/, '')}E${exp}`; }
      else if (str.indexOf('.') >= 0 && str.indexOf('.') < len) str = String(Number(round.toFixed(Math.max(0, len - str.indexOf('.') - 1)))).slice(0, len);
      else { const [mant, exp] = round.toExponential().split('e'); const e = String(Number(exp)); str = `${mant.slice(0, Math.max(1, len - e.length - 1)).replace(/\.$/, '')}E${e}`; }
    }
    return (neg ? '−' : '') + str;
  }

  const st = {text: '', result: '', error: false, prev: '', panel: 'basic', history: []};
  function lineLength(root) {
    const el = root?.querySelector('.eccl-text');
    if (!el) return 13;
    const ctx = document.createElement('canvas').getContext('2d'), cs = getComputedStyle(el);
    ctx.font = `${cs.fontSize} ${cs.fontFamily}`;
    const w = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    return Math.max(4, Math.floor(w / (ctx.measureText('2222222222').width / 10)));
  }
  const button = (text, cls, extra = '') => `<button type="button" class="eccl-btn ${cls}" data-action="eccl-key" data-key="${esc(text)}"${extra}><span>${esc(text)}</span></button>`;
  function render(c) {
    const basic = `<div class="eccl-pad eccl-basic"><div class="eccl-row eccl-row-top"><i class="eccl-blank"></i>${button(T().t('clear'), 'eccl-del', ' data-del="1"')}</div>${BASIC.map(r => `<div class="eccl-row">${r.map(k => button(k, DIGITS.includes(k) ? 'eccl-digit' : 'eccl-op')).join('')}</div>`).join('')}</div>`;
    const adv = `<div class="eccl-pad eccl-advanced">${ADVANCED.map(r => `<div class="eccl-row">${r.map(k => button(k, k.length > 1 ? 'eccl-op eccl-small' : 'eccl-op')).join('')}</div>`).join('')}</div>`;
    const shown = st.error ? T().t('error') : st.text;
    return `<div class="eccl"><div class="eccl-display"><div class="eccl-text eccl-prev" aria-hidden="true">${esc(st.prev)}</div><div class="eccl-text eccl-cur"><span class="eccl-value">${esc(shown)}</span><i class="eccl-caret"></i></div></div>
      <div class="eccl-switch" data-panel="${st.panel}"><div class="eccl-track">${basic}${adv}</div></div></div>`;
  }
  function show(root, scrollUp) {
    const cur = root.querySelector('.eccl-cur'), prev = root.querySelector('.eccl-prev');
    cur.querySelector('.eccl-value').textContent = st.error ? T().t('error') : st.text;
    cur.scrollLeft = cur.scrollWidth;
    if (scrollUp) {
      prev.textContent = st.prev;
      for (const el of [prev, cur]) { el.classList.remove('eccl-up'); void el.offsetWidth; el.classList.add('eccl-up'); }
    }
  }
  function key(c, root, k, el) {
    flame(el);
    if (el.dataset.del) {   // onDelete
      if (st.error || (st.result && st.text === st.result)) { st.text = ''; st.result = ''; st.error = false; }
      else { st.text = st.text.slice(0, -1); st.result = ''; }
      show(root); return;
    }
    if (k === '=') {
      let input = st.text;
      while (input && OPS.includes(input.at(-1))) input = input.slice(0, -1);
      if (!input || st.error) return;
      if (input === st.result) return;
      let v;
      try { v = evaluate(input); } catch { v = NaN; }
      st.prev = st.text;
      if (Number.isNaN(v)) { st.error = true; st.text = input; }
      else { st.text = !Number.isFinite(v) ? (v < 0 ? '−∞' : '∞') : format(v, lineLength(root)); st.result = st.text; st.history.push(input); }
      show(root, true); return;
    }
    // acceptInsert: after a result only an operator continues it; anything else starts over.
    if (st.error) { st.error = false; st.text = ''; }
    if (st.result && st.text === st.result && !OPS.includes(k)) st.text = '';
    st.result = '';
    st.text += k.length >= 2 ? `${k}(` : k;
    show(root);
  }
  // magic_flame: the frame while pressed, then fading out over 350 ms.
  function flame(el) { el.classList.remove('eccl-fade'); void el.offsetWidth; el.classList.add('eccl-fade'); }
  function mount(c, root) {
    const pad = root.querySelector('.eccl-switch');
    let start = null, holdTimer = 0;
    pad.addEventListener('pointerdown', event => {
      start = {x: event.clientX, y: event.clientY, t: Date.now()};
      const del = event.target.closest('[data-del]');
      if (del) holdTimer = setTimeout(() => { st.text = ''; st.result = ''; st.error = false; show(root); start = null; c.suppressClick = Date.now() + 400; }, 500);
    });
    pad.addEventListener('pointerup', event => {
      clearTimeout(holdTimer);
      if (!start) return;
      const dx = event.clientX - start.x;
      if (Math.abs(dx) > 40 * c.el.screen.clientWidth / 320 && Math.abs(dx) > Math.abs(event.clientY - start.y)) {
        const next = dx < 0 ? 'advanced' : 'basic';
        if (next !== st.panel) { st.panel = next; pad.dataset.panel = next; c.suppressClick = Date.now() + 300; }
      }
      start = null;
    });
    pad.addEventListener('pointercancel', () => clearTimeout(holdTimer));
    show(root);
  }
  EC.register('calculator', {
    title: 'Calculator',
    render, mount,
    action(name, el, event, c) {
      if (name !== 'eccl-key') return false;
      if ((c.suppressClick || 0) > Date.now()) return true;
      key(c, c.el.viewport, el.dataset.key, el);
      return true;
    },
    menu(c) {
      const adv = st.panel === 'advanced';
      c.menu([{label: T().t('clear_history'), icon: 'cl-clear_history.png', action: () => { st.history = []; }},
        adv ? {label: T().t('basic'), icon: 'cl-simple.png', action: () => { st.panel = 'basic'; c.render(); }}
          : {label: T().t('advanced'), icon: 'cl-advanced.png', action: () => { st.panel = 'advanced'; c.render(); }}]);
      return true;
    }
  });
})();
