/* Android 5.1.1 navigation bar search panel (SystemUI android-5.1.1_r9: SearchPanelView, SearchPanelCircleView,
   status_bar_search_panel.xml), 1 dp = 0.906 px. A swipe up from the navigation bar (navigation_bar_min_swipe_distance
   48 dp) shows it: a 10 ms vibration, the search_panel_scrim gradient (#55000000 at the bottom, 250 dp) fading in over
   300 ms (ALPHA_IN), and the white circle (search_panel_circle_size 88 dp) growing from nothing while it rises
   search_panel_circle_travel_distance 80 dp above its base 80 dp from the bottom (300 ms, linear_out_slow_in, 50 ms
   delay), carrying the assist icon the Google app declares (com.android.systemui.action_assist_icon: ic_google_logo).
   Dragging on stretches the circle by a rubber band (distance^0.6); past search_panel_threshold (100 dp) a #bbbbbb ripple
   spreads from the circle (400 ms) and letting go launches the assistant: the circle swells over the whole screen
   (fast_out_slow_in) while it, the logo and the scrim fade out. Short of the threshold the circle shrinks back
   (fast_out_linear_in). */
(() => {
  'use strict';
  const DP = .906;
  const S = {up: 48 * DP, size: 88 * DP, base: 80 * DP, travel: 80 * DP, elevation: 12 * DP, threshold: 100 * DP, scrim: 250 * DP, logo: [70 * DP, 28 * DP], duration: 300, delay: 50, ripple: 400, vibrate: 10};
  const bezier = (x1, y1, x2, y2) => t => {
    // Cubic Bézier easing like PathInterpolator, solved for x by bisection.
    let lo = 0, hi = 1, u = t;
    for (let i = 0; i < 24; i++) { u = (lo + hi) / 2; const x = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u; if (x < t) lo = u; else hi = u; }
    return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
  };
  const EASE = {appear: bezier(0, 0, .2, 1), disappear: bezier(.4, 0, 1, 1), fastOutSlowIn: bezier(.4, 0, .2, 1), alphaIn: bezier(.4, 0, 1, 1), alphaOut: bezier(0, 0, .8, 1)};

  function markup(t) {
    return `<div class="lp-search" data-jb-search role="dialog" aria-label="${t('Search')}"><div class="lp-search-scrim"></div><canvas class="lp-search-canvas" aria-hidden="true"></canvas><button type="button" class="lp-search-logo" data-jb-search-launch aria-label="Google"><img src="assets/lps-ic_google_logo.png" alt=""></button></div>`;
  }
  // updateCircleRect: the circle is centred across the screen, its centre base + offset above the panel's bottom.
  const centre = (width, height, offset) => ({x: width / 2, y: height - S.base - offset});
  const rubberband = diff => Math.pow(Math.abs(diff), .6);

  function attach(root, {onLaunch, onClose, haptic, reduced}) {
    const canvas = root.querySelector('canvas'), ctx = canvas.getContext('2d'), logo = root.querySelector('.lp-search-logo'), scrim = root.querySelector('.lp-search-scrim');
    const state = {offset: 0, size: 0, background: 1, logoAlpha: 1, scrim: 0, ripples: [], exiting: false};
    const anims = new Map();
    let frame = 0, done = false, startY = null, dragStart = null, dragging = false, farEnough = false, launching = false;
    const vibrate = () => { if (haptic()) navigator.vibrate?.(S.vibrate); };
    // ValueAnimator stand-in: animates one state property from its current value.
    const animate = (key, to, {duration = S.duration, delay = 0, ease = EASE.appear, onEnd} = {}) => {
      const from = state[key], start = performance.now() + delay;
      anims.set(key, {from, to, start, duration: reduced ? 1 : duration, ease, onEnd});
      loop();
    };
    const step = now => {
      for (const [key, a] of anims) {
        const k = Math.min(1, Math.max(0, (now - a.start) / a.duration));
        state[key] = a.from + (a.to - a.from) * a.ease(k);
        if (k >= 1) { anims.delete(key); a.onEnd?.(); }
      }
      state.ripples = state.ripples.filter(r => now - r.start < S.ripple);
    };
    const draw = () => {
      const dpr = window.devicePixelRatio || 1, w = root.clientWidth, h = root.clientHeight;
      if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      scrim.style.opacity = state.scrim;
      const c = centre(w, h, state.offset), stat = centre(w, h, S.travel), now = performance.now();
      if (state.size > 0) {
        // The outline shadow follows the elevation, highest at the resting offset.
        const elevation = (1 - Math.max((S.travel - state.offset) / S.travel, 0)) * S.elevation;
        ctx.save(); ctx.globalAlpha = state.background;
        ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = elevation * 1.2; ctx.shadowOffsetY = elevation / 2;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(c.x, c.y, state.size / 2, 0, 2 * Math.PI); ctx.fill(); ctx.restore();
        // Ripples are clipped to the circle (updateClipping).
        ctx.save(); ctx.beginPath(); ctx.arc(c.x, c.y, state.size / 2, 0, 2 * Math.PI); ctx.clip();
        for (const r of state.ripples) {
          const k = Math.min(1, (now - r.start) / S.ripple);
          ctx.globalAlpha = EASE.disappear(1 - k) * state.background; ctx.fillStyle = '#bbbbbb';
          ctx.beginPath(); ctx.arc(r.x, r.y, EASE.appear(k) * r.radius, 0, 2 * Math.PI); ctx.fill();
        }
        ctx.restore();
      }
      // updateLogo: centred on the resting circle, lagging 30 % behind the offset and fading in over its second half.
      const t = (S.travel - state.offset) / S.travel;
      let x = stat.x, y = stat.y, alpha = state.logoAlpha;
      if (state.exiting) y += (state.offset - S.travel) / 2; else { y += t * S.travel * .3; alpha = Math.max((1 - t - .5) * 2, 0); }
      logo.style.transform = `translate(${x - S.logo[0] / 2}px, ${y - S.logo[1] / 2}px)`;
      logo.style.opacity = state.size > 0 || state.exiting ? alpha : 0;
    };
    const tick = now => { frame = 0; if (done) return; step(now); draw(); if (anims.size || state.ripples.length) loop(); };
    function loop() { if (!frame && !done) frame = requestAnimationFrame(tick); }
    // startEnterAnimation.
    const enter = () => {
      state.size = 0; state.offset = 0;
      animate('size', S.size, {delay: S.delay}); animate('offset', S.travel, {delay: S.delay});
    };
    // startAbortAnimation.
    const abort = onEnd => {
      animate('size', 0, {ease: EASE.disappear}); animate('offset', 0, {ease: EASE.disappear, onEnd});
    };
    const addRipple = () => {
      if (state.ripples.length > 1) return;
      const w = root.clientWidth, h = root.clientHeight, stat = centre(w, h, S.travel);
      state.ripples.push({x: stat.x, y: stat.y + S.size * .25, radius: Math.max(state.size, S.size * 1.25) * .75, start: performance.now()});
      loop();
    };
    // SearchPanelView.show: vibrate, scrim and circle in.
    vibrate(); state.scrim = 0; animate('scrim', 1, {ease: EASE.alphaIn}); enter();
    const move = (x, y) => {
      if (launching) return;
      if (startY === null) startY = y;
      if (!dragging && (!anims.has('offset') || Math.abs(startY - y) > S.threshold)) { dragStart = y; dragging = true; }
      if (!dragging) return;
      const far = Math.abs(startY - y) > S.threshold;
      if (!state.exiting && !anims.has('size')) state.size = S.size + rubberband(Math.max(dragStart - y, 0));
      if (far !== farEnough) { farEnough = far; if (far) { if (state.size === 0) enter(); addRipple(); } else abort(); }
      loop();
    };
    const finish = launch => {
      if (done || launching) return;
      if (launch) {
        // startExitAnimation: launch, vibrate, swell over the screen and fade.
        launching = true; vibrate(); state.exiting = true;
        const w = root.clientWidth, h = root.clientHeight;
        animate('offset', h / 2 - S.base, {delay: S.delay, ease: EASE.fastOutSlowIn});
        animate('size', Math.ceil(Math.hypot(w / 2, h / 2) * 2), {delay: S.delay, ease: EASE.fastOutSlowIn});
        const fade = performance.now() + S.delay;
        const fadeStep = now => {
          const f = Math.min(1, Math.max(0, (now - fade) / S.duration));
          state.logoAlpha = EASE.alphaOut(1 - (f > .5 ? 1 : f / .5));
          state.background = 1 - (f < .2 ? 0 : EASE.alphaOut((f - .2) / .8));
          if (f < 1 && !done) requestAnimationFrame(fadeStep); else { done = true; cancelAnimationFrame(frame); onLaunch(); }
        };
        requestAnimationFrame(fadeStep);
        animate('scrim', 0, {ease: EASE.alphaOut});
        if (reduced) { done = true; onLaunch(); }
        return;
      }
      animate('scrim', 0, {ease: EASE.alphaOut});
      abort(() => { done = true; onClose(); });
      if (reduced) { done = true; onClose(); }
    };
    logo.addEventListener('click', () => finish(true));
    root.addEventListener('pointerdown', event => { if (!event.target.closest('[data-jb-search-launch]')) finish(false); });
    loop();
    return {move, release: () => finish(farEnough), cancel: () => finish(false), state: () => ({active: farEnough, ...state})};
  }
  window.JBSearchPanel = {S, EASE, markup, centre, rubberband, attach};
})();
