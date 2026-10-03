/* Material touch feedback after android-5.1.1_r26: RippleDrawable (Ripple.java, RippleBackground.java) for controls and
   KeyButtonRipple for the navigation keys. A pressed control gets its background highlight (fades in over 667 ms) and a
   ripple that starts 80 ms after the touch, grows from the finger towards the centre at the touch-down acceleration
   (1024 px/s^2 at the display density) and, on release, finishes at the faster up acceleration (+3400 px/s^2) while it
   fades out in 333 ms. Borderless icon buttons draw an unclipped circle to the corners of their bounds. The colour is
   colorControlHighlight: #1F000000 on light surfaces, #33FFFFFF on dark ones. Navigation keys show a white 20 % pill
   that grows to 1.35 x the 70 dp key (at most 95 dp) in 350 ms and fades in 450 ms. Sizes are CSS px = dp x 0.906 and the
   Nexus 6 density is 3.5. */
(() => {
  'use strict';
  const DP = 0.906, DENSITY = 3.5, DEVICE = DENSITY / DP; // device px per CSS px
  const ENTER_DELAY = 80, DOWN = 1024, UP = 3400, OPACITY_DECAY = 3, BACKGROUND_ENTER = 667, SLOP = 8 * DP;
  const TARGETS = 'button, [role="button"], a[href], [data-action], label, summary';
  // Launcher3 presses icons and widgets without a ripple; the status bar, the keyguard handle and sliders have their own.
  const SKIP = '.launcher-icon, .lp-qs-top, .home-search > button, .home-widget, .drawer-app, .folder-icon, .launcher-folder .folder-app, #status-bar, .lock-handle, input[type="range"], .lp-recents, .no-ripple, [disabled], [aria-disabled="true"], .transition-layer';
  const log = t => 1 - Math.pow(400, -t * 1.4); // Ripple.LogInterpolator
  let layer = null, active = null;
  const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function host(screen) {
    if (layer?.isConnected && layer.parentNode === screen) return layer;
    layer = document.createElement('div'); layer.className = 'lp-ripples'; layer.setAttribute('aria-hidden', 'true');
    screen.append(layer); return layer;
  }
  function luminance(color) {
    const m = color.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/);
    if (!m || (m[4] !== undefined && Number(m[4]) < .5)) return null;
    return (.2126 * m[1] + .7152 * m[2] + .0722 * m[3]) / 255;
  }
  function onDark(el, screen) {
    for (let node = el; node && node !== screen.parentNode; node = node.parentElement) {
      const style = getComputedStyle(node), value = luminance(style.backgroundColor);
      if (value !== null) return value < .5;
      if (style.backgroundImage !== 'none' && node !== el) return true;
    }
    return true;
  }
  function borderless(el, rect) {
    if (rect.width > 56 * DP || rect.height > 56 * DP) return false;
    if (el.textContent.trim()) return false;
    const style = getComputedStyle(el);
    return luminance(style.backgroundColor) === null && !el.querySelector('input');
  }
  function press(el, event, screen) {
    const box = screen.getBoundingClientRect(), rect = el.getBoundingClientRect();
    if (rect.width < 4 || rect.height < 4) return null;
    const root = host(screen), node = document.createElement('div');
    const left = rect.left - box.left, top = rect.top - box.top, w = rect.width, h = rect.height;
    if (el.closest('.nav-key')) {
      // KeyButtonRipple: a horizontal key draws a pill as tall as the key, scaling its width with LogInterpolator.
      node.className = 'lp-ripple-host nav';
      Object.assign(node.style, {left: `${left}px`, top: `${top}px`, width: `${w}px`, height: `${h}px`});
      const pill = document.createElement('i'), size = Math.min(w, 95 * DP);
      Object.assign(pill.style, {width: `${size * 1.35}px`, left: `${(w - size * 1.35) / 2}px`});
      node.append(pill); root.append(node);
      const grow = pill.animate(Array.from({length: 11}, (_, i) => ({transform: `scaleX(${log(i / 10)})`, offset: i / 10})), {duration: 350, fill: 'forwards'});
      return {node, release() { pill.animate([{opacity: 1}, {opacity: 0}], {duration: 450, easing: 'cubic-bezier(0,0,.8,1)', fill: 'forwards'}).finished.then(() => { grow.cancel(); node.remove(); }, () => node.remove()); }};
    }
    const free = borderless(el, rect), dark = onDark(el, screen);
    node.className = `lp-ripple-host${free ? ' borderless' : ''}${dark ? ' dark' : ''}`;
    Object.assign(node.style, {left: `${left}px`, top: `${top}px`, width: `${w}px`, height: `${h}px`, borderRadius: free ? '0' : getComputedStyle(el).borderRadius});
    const R = Math.hypot(w / 2, h / 2);
    const bg = document.createElement('b'), wave = document.createElement('i');
    const x0 = Math.max(0, Math.min(w, event.clientX - rect.left)), y0 = Math.max(0, Math.min(h, event.clientY - rect.top));
    Object.assign(wave.style, {width: `${2 * R}px`, height: `${2 * R}px`, left: `${w / 2 - R}px`, top: `${h / 2 - R}px`});
    if (free) Object.assign(bg.style, {width: `${2 * R}px`, height: `${2 * R}px`, left: `${w / 2 - R}px`, top: `${h / 2 - R}px`, borderRadius: '50%'});
    node.append(bg, wave); root.append(node);
    const start = performance.now(), grow = 1000 * Math.sqrt(R * DEVICE / DOWN * DENSITY);
    const at = p => `translate(${((x0 - w / 2) * (1 - p)).toFixed(2)}px, ${((y0 - h / 2) * (1 - p)).toFixed(2)}px) scale(${p.toFixed(4)})`;
    const background = bg.animate([{opacity: 0}, {opacity: 1}], {duration: BACKGROUND_ENTER, easing: 'linear', fill: 'forwards'});
    const enter = wave.animate([{transform: at(0)}, {transform: at(1)}], {duration: grow, delay: ENTER_DELAY, easing: 'linear', fill: 'forwards'});
    return {node, release() {
      const elapsed = performance.now() - start, p = Math.max(0, Math.min(1, (elapsed - ENTER_DELAY) / grow));
      const outer = Math.min(1, elapsed / BACKGROUND_ENTER);
      enter.cancel(); background.cancel();
      const remaining = R * (1 - p), finish = 1000 * Math.sqrt(remaining * DEVICE / (UP + DOWN) * DENSITY), fade = 1000 / OPACITY_DECAY;
      const steps = Array.from({length: 11}, (_, i) => ({transform: at(p + (1 - p) * log(i / 10)), offset: i / 10}));
      wave.animate(steps, {duration: Math.max(1, finish), fill: 'forwards'});
      const out = wave.animate([{opacity: 1}, {opacity: 0}], {duration: fade, easing: 'linear', fill: 'forwards'});
      bg.animate([{opacity: outer}, {opacity: 0}], {duration: fade, easing: 'linear', fill: 'forwards'});
      out.finished.then(() => node.remove(), () => node.remove());
    }};
  }
  function release() { if (active) { const ripple = active; active = null; ripple.release(); } }
  function attach(screen) {
    screen.addEventListener('pointerdown', event => {
      release();
      if (event.button > 0 || reduced()) return;
      const el = event.target.closest?.(TARGETS);
      if (!el || !screen.contains(el) || el.closest(SKIP) || el.matches('input[type="text"], input[type="search"], textarea')) return;
      const ripple = press(el, event, screen);
      if (ripple) active = {...ripple, x: event.clientX, y: event.clientY, id: event.pointerId};
    }, true);
    window.addEventListener('pointermove', event => { if (active && event.pointerId === active.id && Math.hypot(event.clientX - active.x, event.clientY - active.y) > SLOP) release(); }, true);
    for (const type of ['pointerup', 'pointercancel', 'blur']) window.addEventListener(type, release, true);
  }
  window.LPRipple = {attach, release};
})();
