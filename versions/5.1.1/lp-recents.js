/* Android 5.1 Overview (SystemUI recents: RecentsActivity, TaskStackView, TaskStackViewLayoutAlgorithm, TaskView) on the
   Nexus 6. The wallpaper shows through (RecentsTheme.Wallpaper) under the status and navigation bar gradients; the
   Google search widget sits in the 64 dp search bar space; below it the tasks stand as square cards (the stack width
   minus 3.333 % on each side, 16 dp from the top) on TaskStackViewLayoutAlgorithm's log curve: each older card peeks
   half a card above the next, cards shrink to 0.8 towards the back and rise from 20 to 80 dp of elevation towards the
   front. A card is the app's thumbnail under its 56 dp header in the task's colorPrimary with the 32 dp icon, the 16 sp
   medium label and the dismiss X. The stack scrolls vertically; a card swipes away sideways. Sizes are dp x 0.906. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const DP = 0.906, W = 411.43, H = 731.43, STATUS = 25, NAV = 48, SEARCH = 64, TOP_PAD = 16, WIDTH_PAD = 0.03333, BAR = 56, MIN_SCALE = 0.8;
  // initializeCurve: x(p) and p(x) for f(x) = 1 - 3000^(1 - 1.75x) / 3000, by arc length, 250 steps.
  const STEPS = 250, LOG_BASE = 3000, X_SCALE = 1.75;
  const logFunc = x => 1 - Math.pow(LOG_BASE, -x * X_SCALE + 1) / LOG_BASE;
  const xp = new Float64Array(STEPS + 1), px = new Float64Array(STEPS + 1);
  (() => {
    const fx = [], step = 1 / STEPS; let x = 0;
    for (let i = 0; i <= STEPS; i++) { fx[i] = logFunc(x); x += step; }
    const dx = [0]; let length = 0;
    for (let i = 1; i < STEPS; i++) { dx[i] = Math.hypot(fx[i] - fx[i - 1], step); length += dx[i]; }
    dx[STEPS] = 0; let p = 0; px[0] = 0; px[STEPS] = 1;
    for (let i = 1; i <= STEPS; i++) { p += Math.abs(dx[i] / length); px[i] = p; }
    let xi = 0; p = 0; xp[0] = 0; xp[STEPS] = 1;
    for (let pi = 0; pi < STEPS; pi++) {
      while (xi < STEPS && !(px[xi] > p)) xi++;
      xp[pi] = xi === 0 ? 0 : (xi - 1 + (p - px[xi - 1]) / (px[xi] - px[xi - 1])) * step;
      p += step;
    }
  })();
  // RecentsConfiguration.getTaskStackBounds and computeRects, in dp.
  const visible = {top: STATUS + SEARCH, bottom: H}; visible.height = visible.bottom - visible.top;
  const stack = {left: W * WIDTH_PAD, right: W - W * WIDTH_PAD, top: visible.top + TOP_PAD, bottom: H - NAV - TOP_PAD};
  const size = stack.right - stack.left, task = {left: stack.left, top: stack.top, size};
  function toScreenY(p) {
    if (p < 0 || p > 1) return visible.top + p * visible.height;
    const index = p * STEPS, lo = Math.floor(index), hi = Math.ceil(index);
    const fraction = lo < STEPS && hi !== lo ? (xp[hi] - xp[lo]) * (index - lo) : 0;
    return visible.top + (xp[lo] + fraction) * visible.height;
  }
  function toProgress(y) {
    const x = (y - visible.top) / visible.height;
    if (x < 0 || x > 1) return x;
    const index = x * STEPS, lo = Math.floor(index), hi = Math.ceil(index);
    const fraction = lo < STEPS && hi !== lo ? (px[hi] - px[lo]) * (index - lo) : 0;
    return px[lo] + fraction;
  }
  const scaleAt = p => p < 0 ? MIN_SCALE : p > 1 ? 1 : MIN_SCALE + p * (1 - MIN_SCALE);
  // computeMinMaxScroll: every task is its own group, so each card adds half a card of peek.
  function metrics(count) {
    const atBottom = toProgress(visible.bottom), between = atBottom - toProgress(visible.bottom - .5 * size);
    const heightOffset = atBottom - toProgress(visible.bottom - size), navOffset = atBottom - toProgress(visible.bottom - (visible.bottom - stack.bottom));
    const progress = Array.from({length: count}, (_, i) => .5 + i * between);
    const front = progress.at(-1) ?? .5, max = front - (1 - heightOffset - navOffset), min = count === 1 ? Math.max(max, 0) : 0;
    return {progress, min, max: Math.max(min, max), initial: Math.min(Math.max(min, max), Math.max(0, front - .825))};
  }
  // getStackTransform: card top-left and scale for a task at the given scroll, or null when off screen.
  function transform(p, scroll, previous) {
    const rel = p - scroll, bounded = Math.max(0, Math.min(rel, 1));
    if (rel > 1 || rel < 0 && previous && previous.rel <= 0) return {rel, hidden: true};
    const scale = scaleAt(bounded), offset = (1 - scale) * size / 2;
    const y = toScreenY(bounded) - visible.top - offset;
    return {rel, top: task.top + y, scale, z: Math.max(20, 20 + bounded * 60)};
  }
  const px2 = dp => `${(dp * DP).toFixed(2)}px`;
  const luminance = hex => { const n = parseInt(String(hex).slice(1, 7), 16); return (.299 * (n >> 16 & 255) + .587 * (n >> 8 & 255) + .114 * (n & 255)) / 255; };
  function render(recent, {names, icon, snapshots, colors, statusColors, t, search, pin}) {
    const tasks = [...recent].reverse();
    if (!tasks.length) return `<div class="recent-panel lp-recents" data-action="close-overlay"><div class="lp-recents-empty">${e(t('Your recent screens appear here'))}</div></div>`;
    const cards = tasks.map((id, index) => {
      const color = colors[id] || '#e6e6e6', dark = luminance(color) > .6;
      const thumb = snapshots[id] || `<div class="recent-fallback">${icon(id)}</div>`;
      return `<div class="recent-item lp-task" data-action="open-app" data-app="${e(id)}" role="button" tabindex="0" aria-label="${e(names[id])}"><span class="recent-thumbnail lp-task-thumb" aria-hidden="true"><span class="lp-task-thumb-inner" inert><span class="lp-task-thumb-status" style="background:${e(statusColors[id] || '#000')}"></span><span class="lp-task-thumb-app">${thumb}</span></span></span><span class="lp-task-bar${dark ? ' dark' : ''}" style="background:${e(color)}"><span class="lp-task-icon">${icon(id)}</span><span class="lp-task-label" data-no-translate>${e(names[id])}</span><button type="button" class="lp-task-dismiss" data-action="remove-recent" data-id="${e(id)}" aria-label="${e(t('Dismiss'))}"><img src="assets/lp-sysui-recents_dismiss_${dark ? 'dark' : 'light'}.svg" alt=""></button></span>${pin && index === tasks.length - 1 ? `<button type="button" class="lp-task-pin" data-action="lp-pin" data-app="${e(id)}" aria-label="${e(t('screen pinning'))}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z" fill="#fff"/></svg></button>` : ''}</div>`;
    }).join('');
    return `<div class="recent-panel lp-recents" data-action="close-overlay"><div class="lp-recents-search">${search || ''}</div><div class="lp-recents-stack" style="--task:${px2(size)};--left:${px2(task.left)}">${cards}</div></div>`;
  }
  // Positions the cards for a scroll value (progress units) and returns the clamped scroll.
  function layout(panel, scroll) {
    const cards = [...panel.querySelectorAll('.lp-task')], m = metrics(cards.length);
    const value = Math.max(m.min, Math.min(m.max, scroll ?? m.initial));
    let previous = null;
    cards.forEach((card, i) => {
      const tr = transform(m.progress[i], value, previous); previous = tr;
      card.hidden = !!tr.hidden;
      if (tr.hidden) return;
      card.style.transform = `translateY(${(tr.top * DP).toFixed(2)}px) scale(${tr.scale.toFixed(4)})`;
      card.style.zIndex = String(i + 1);
      card.style.boxShadow = `0 ${(tr.z / 8).toFixed(1)}px ${(tr.z / 3).toFixed(1)}px #00000059`;
    });
    return value;
  }
  // Vertical drags and the wheel scroll the stack (in curve progress; one screen height is about 1).
  /* Enter and exit (TaskView.prepareEnterRecentsAnimation / startEnterRecentsAnimation / startExitToHomeAnimation,
     RecentsConfiguration at 5.1.1): from Home every card rises from offscreenY (the task's top below the stack view's bottom) after recents_enter_from_home_transition_duration (100 ms), the front card first and each card behind it
     12 ms later and 12 ms longer than 225 ms, with decelerate_quint; from an app the front task's window shrinks into its
     card (the thumbnail aspect-scale-down transition, 325 ms); back Home the cards fall to offscreenY in 225 ms with
     fast_out_linear_in. */
  const quintOut = 'cubic-bezier(.13,.84,.24,1)', fastOutLinearIn = 'cubic-bezier(.4,0,1,1)', fastOutSlowIn = 'cubic-bezier(.4,0,.2,1)';
  // offscreenY is in the stack view's own coordinates (viewRect.top = 0), so a card starts at the view's bottom edge.
  const offscreen = () => visible.bottom;
  const shown = panel => [...panel.querySelectorAll('.lp-task')].filter(card => !card.hidden);
  // elapsed: time since Overview was asked for, so a re-render picks the animation up where it was.
  function enter(panel, from, elapsed = 0) {
    const cards = shown(panel), start = `translateY(${(offscreen() * DP).toFixed(2)}px) scale(1)`;
    if (from === 'home') cards.forEach((card, i) => {
      const front = cards.length - i - 1;
      card.animate([{transform: start}, {transform: card.style.transform}], {duration: 225 + front * 12, delay: 100 + front * 12, easing: quintOut, fill: 'backwards'}).currentTime = elapsed;
    });
    else if (from === 'app' && cards.length) {
      const card = cards[cards.length - 1], full = W / size;
      card.animate([{transform: `translateY(${((STATUS - BAR * full) * DP).toFixed(2)}px) scale(${full.toFixed(4)})`, boxShadow: 'none'}, {transform: card.style.transform}], {duration: 325, easing: fastOutSlowIn, fill: 'backwards'}).currentTime = elapsed;
    }
  }
  function exit(panel) {
    const end = `translateY(${(offscreen() * DP).toFixed(2)}px) scale(1)`;
    const runs = shown(panel).map(card => card.animate([{transform: card.style.transform}, {transform: end}], {duration: 225, easing: fastOutLinearIn, fill: 'forwards'}).finished);
    return Promise.all(runs);
  }
  function attach(panel, {scroll, onScroll, reduced, from, elapsed}) {
    let value = layout(panel, scroll), drag = null;
    const stackEl = panel.querySelector('.lp-recents-stack');
    if (!stackEl) return {destroy() {}};
    if (!reduced && from && elapsed < 600) enter(panel, from, elapsed);
    const per = 1 / (visible.height * DP);
    const down = event => { if (event.target.closest('.lp-task-dismiss')) return; drag = {y: event.clientY, x: event.clientX, start: value, active: false, id: event.pointerId}; };
    const move = event => {
      if (!drag || event.pointerId !== drag.id) return;
      const dy = event.clientY - drag.y, dx = event.clientX - drag.x;
      if (!drag.active && Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) drag.active = true;
      if (!drag.active) return;
      event.stopPropagation(); event.preventDefault();
      value = layout(panel, drag.start - dy * per); onScroll?.(value);
    };
    const up = event => { if (drag?.active) { event.stopPropagation(); onScroll?.(value, true); } drag = null; };
    const wheel = event => { event.preventDefault(); value = layout(panel, value + event.deltaY * per); onScroll?.(value); };
    stackEl.addEventListener('pointerdown', down, true);
    window.addEventListener('pointermove', move, true);
    window.addEventListener('pointerup', up, true);
    stackEl.addEventListener('wheel', wheel, {passive: false});
    return {destroy() { window.removeEventListener('pointermove', move, true); window.removeEventListener('pointerup', up, true); }};
  }
  window.LPRecents = {DP, metrics, transform, render, layout, attach, exit, toScreenY, toProgress};
})();
