/* The Android 5.x easter egg, after AOSP android-5.1.1_r26:
   PlatLogoActivity (frameworks/base core/java/com/android/internal/app): a full-screen window over the wallpaper. A
   flavoured disc (grape, orange, bubblegum, lime, lemon or the brown "mystery flavor") pops in at 30 %; the first tap
   grows it into the lollipop with the "lollipop" wordmark (drawable/platlogo) and its stick, every later tap picks a
   new flavour, and after five taps a long press opens LLand.
   LLand (packages/SystemUI/src/com/android/systemui/egg/LLand.java and res/values/lland_config.xml): the Android
   flies through lollipops on a sky of one of four times of day over buildings, clouds, stars, the sun or the moon.
   Touch to boost, release to fall; each lollipop pair passed is a point; the world may be mirrored. Sizes are dp x
   0.906 and the physics run at 60 steps a second like the TimeAnimator on the Nexus 6. */
(() => {
  'use strict';
  const DP = 0.906;
  const FLAVORS = ['#9C27B0', '#BA68C8', '#FF9800', '#FFB74D', '#F06292', '#F8BBD0', '#AFB42B', '#CDDC39', '#FFEB3B', '#FFF176', '#795548', '#A1887F'];
  const EASE = 'cubic-bezier(0,0,.5,1)';
  const newColorIndex = () => 2 * Math.floor(Math.random() * FLAVORS.length / 2);

  function platLogo(root, {onLand, reduced}) {
    const W = root.clientWidth, H = root.clientHeight;
    const size = Math.min(Math.min(W, H), 600 * DP) - 100 * DP;
    let taps = 0, timers = [], press = null;
    root.innerHTML = `<div class="lp-plat-stick" style="width:${32 * DP}px;margin-left:${-16 * DP}px"><svg width="${32 * DP}" height="${H / 2}" viewBox="0 0 ${32 * DP} ${H / 2}" preserveAspectRatio="none"><defs><linearGradient id="lp-plat-g"><stop offset="0" stop-color="#fff"/><stop offset=".75" stop-color="#d5d5d5"/><stop offset="1" stop-color="#aaa"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#lp-plat-g)"/><path d="M0 0H${32 * DP}V${size / 2 + 48 * DP}L0 ${size / 2}Z" fill="#aaa"/></svg></div><button class="lp-plat-logo" style="width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px" aria-label="Android Lollipop"><span class="lp-plat-pop"></span><span class="lp-plat-ripple"></span><span class="lp-plat-highlight"></span><img src="assets/lp-platlogo.svg" alt=""></button>`;
    const im = root.querySelector('.lp-plat-logo'), pop = im.querySelector('.lp-plat-pop'), ripple = im.querySelector('.lp-plat-ripple');
    const logo = im.querySelector('img'), stick = root.querySelector('.lp-plat-stick');
    const flavor = () => { const i = newColorIndex(); pop.style.background = FLAVORS[i]; ripple.style.background = FLAVORS[i + 1]; };
    flavor();
    const opts = (duration, delay) => ({duration: reduced ? 1 : duration, delay: reduced ? 0 : delay, easing: EASE, fill: 'both'});
    im.animate([{transform: 'scale(0)'}, {transform: 'scale(.3)'}], opts(500, 800));
    const down = event => {
      const box = im.getBoundingClientRect();
      ripple.style.left = `${(event.clientX - box.left) / box.width * 100}%`; ripple.style.top = `${(event.clientY - box.top) / box.height * 100}%`;
      ripple.classList.remove('fade'); ripple.classList.add('on');
      press = {long: false, timer: setTimeout(() => {
        if (taps < 5) return;
        press.long = true; onLand?.();
      }, 500)};
    };
    const up = () => { ripple.classList.add('fade'); ripple.classList.remove('on'); if (press) clearTimeout(press.timer); };
    const click = () => {
      if (press?.long) return;
      if (taps === 0) {
        im.animate([{transform: 'scale(.3)', boxShadow: '0 9px 18px #0000004d'}, {transform: 'scale(1)', boxShadow: '0 18px 36px #00000059'}], opts(700, 500));
        logo.animate([{opacity: 0}, {opacity: 1}], opts(300, 1000));
        stick.animate([{opacity: 0}, {opacity: 1}], opts(700, 750));
      } else flavor();
      taps++;
    };
    im.addEventListener('pointerdown', down);
    im.addEventListener('pointerup', up); im.addEventListener('pointerleave', up); im.addEventListener('pointercancel', up);
    im.addEventListener('click', click);
    return {root, destroy() { timers.forEach(clearTimeout); if (press) clearTimeout(press.timer); }};
  }

  // lland_config.xml, in px.
  const P = Object.fromEntries(Object.entries({TRANSLATION_PER_SEC: 100, OBSTACLE_SPACING: 380, BOOST_DV: 550, PLAYER_HIT_SIZE: 40, PLAYER_SIZE: 40, OBSTACLE_WIDTH: 90, OBSTACLE_STEM_WIDTH: 12, OBSTACLE_GAP: 170, OBSTACLE_MIN: 48, BUILDING_WIDTH_MIN: 20, BUILDING_WIDTH_MAX: 250, BUILDING_HEIGHT_MIN: 20, CLOUD_SIZE_MIN: 10, CLOUD_SIZE_MAX: 100, SUN_SIZE: 45, STAR_SIZE_MIN: 3, STAR_SIZE_MAX: 5, G: 30, MAX_V: 1000, SCENERY_Z: 6, OBSTACLE_Z: 18, PLAYER_Z: 18, PLAYER_Z_BOOST: 20}).map(([k, v]) => [k, Math.round(v * DP)]));
  P.OBSTACLE_PERIOD = Math.floor(P.OBSTACLE_SPACING / P.TRANSLATION_PER_SEC);
  const POPS = [['pop_belt', 0, 1], ['pop_droid', 0, 1], ['pop_pizza', 1, 1], ['pop_stripes', 0, 1], ['pop_swirl', 1, 1], ['pop_vortex', 1, 1], ['pop_vortex2', 1, 1], ['pop_ball', 0, 190 / 255]];
  const SKIES = [['#c0c0ff', '#a0a0ff'], ['#000010', '#000000'], ['#000040', '#000010'], ['#a08020', '#204080']];
  const DAY = 0, NIGHT = 1, TWILIGHT = 2, SUNSET = 3;
  const HULL = [.3, 0, .7, 0, .92, .33, .92, .75, .6, 1, .4, 1, .08, .75, .08, .33];
  const lerp = (x, a, b) => (b - a) * x + a, rlerp = (v, a, b) => (v - a) / (b - a), clamp = f => f < 0 ? 0 : f > 1 ? 1 : f;
  const frand = (a, b) => a === undefined ? Math.random() : lerp(Math.random(), a, b);
  const irand = (a, b) => Math.trunc(lerp(Math.random(), a, b));
  const hsv = (h, s, v) => { const f = n => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); }; return `rgb(${[f(5), f(3), f(1)].map(c => Math.round(c * 255)).join(',')})`; };
  // ViewPropertyAnimator's default AccelerateDecelerateInterpolator.
  const accelDecel = x => Math.cos((x + 1) * Math.PI) / 2 + .5;

  function land(root, {vibrate} = {}) {
    root.innerHTML = '<div class="lp-lland-world"></div><div class="lp-lland-score" aria-live="polite">0</div>';
    const world = root.querySelector('.lp-lland-world'), scoreField = root.querySelector('.lp-lland-score');
    let W = 0, H = 0, views = [], obstacles = [], droid = null, t = 0, lastPipe = 0, score = 0;
    let animating = false, playing = false, frozen = false, timeOfDay = irand(0, SKIES.length), raf = 0, last = 0, acc = 0, clock = 0;
    const el = (cls, w, h) => { const node = document.createElement('div'); node.className = cls; node.style.width = `${w}px`; node.style.height = `${h}px`; world.appendChild(node); return node; };
    const view = (node, props) => ({node, tx: 0, ty: 0, sx: 1, sy: 1, rot: 0, z: 0, tweens: [], ...props});
    const draw = v => { v.node.style.transform = `translate(${v.tx}px,${v.ty}px) rotate(${v.rot}deg) scale(${v.sx},${v.sy})`; };
    const animate = (v, to, delay, duration) => { v.tweens = Object.entries(to).map(([k, val]) => ({k, from: v[k], to: val, start: clock + delay, duration})); };
    const tick = v => {
      v.tweens = v.tweens.filter(tw => {
        if (clock < tw.start) return true;
        const x = Math.min(1, (clock - tw.start) / tw.duration);
        v[tw.k] = lerp(accelDecel(x), tw.from, tw.to);
        return x < 1;
      });
    };
    const setScore = value => { score = value; scoreField.textContent = String(value); };
    function reset() {
      W = root.clientWidth; H = root.clientHeight;
      world.innerHTML = ''; views = []; obstacles = [];
      root.style.background = `linear-gradient(to top,${SKIES[timeOfDay][0]},${SKIES[timeOfDay][1]})`;
      world.style.transform = frand() > .5 ? 'scaleX(-1)' : '';
      setScore(0);
      const showingSun = (timeOfDay === DAY || timeOfDay === SUNSET) && frand() > .25;
      const w = P.SUN_SIZE;
      if (showingSun) {
        const sun = view(el('lp-lland-scenery', w, w), {kind: 'star', w, v: 0});
        sun.node.style.backgroundImage = `url(assets/lland-sun${timeOfDay === SUNSET ? '-sunset' : ''}.svg)`;
        sun.tx = frand(w, W - w); sun.ty = timeOfDay === DAY ? frand(w, H * .66) : frand(H * .66, H - w);
        views.push(sun);
      } else {
        const dark = timeOfDay === NIGHT || timeOfDay === TWILIGHT, ff = frand();
        if ((dark && ff < .75) || ff < .5) {
          const moon = view(el('lp-lland-scenery', w, w), {kind: 'star', w, v: 0});
          moon.node.style.backgroundImage = 'url(assets/lland-moon.svg)'; moon.node.style.opacity = dark ? 1 : .5;
          moon.sx = frand() > .5 ? -1 : 1; moon.rot = moon.sx * frand(5, 30);
          moon.tx = frand(w, W - w); moon.ty = frand(w, H - w);
          views.push(moon);
        }
      }
      const mh = Math.trunc(H / 6), cloudless = frand() < .25, N = 20;
      for (let i = 0; i < N; i++) {
        const r1 = frand(); let s;
        if (r1 < .3 && timeOfDay !== DAY) {
          const size = irand(P.STAR_SIZE_MIN, P.STAR_SIZE_MAX);
          s = view(el('lp-lland-scenery', size, size), {w: size, h: size, v: 0});
          s.node.style.backgroundImage = 'url(assets/lland-star.svg)';
          const r = frand(); s.top = Math.trunc(r * r * H);
        } else if (r1 < .6 && !cloudless) {
          const size = irand(P.CLOUD_SIZE_MIN, P.CLOUD_SIZE_MAX);
          s = view(el('lp-lland-scenery lp-lland-cloud', size, size), {w: size, h: size, v: frand(.15, .5)});
          s.node.style.backgroundImage = `url(assets/lland-${frand() < .01 ? 'cloud_off' : 'cloud'}.svg)`;
          const r = frand(); s.top = Math.trunc(1 - r * r * H / 2) + Math.trunc(H / 2);
        } else {
          const bw = irand(P.BUILDING_WIDTH_MIN, P.BUILDING_WIDTH_MAX), z = i / N, bh = irand(P.BUILDING_HEIGHT_MIN, mh);
          s = view(el('lp-lland-scenery lp-lland-building', bw, bh), {w: bw, h: bh, v: .85 * z});
          s.node.style.background = hsv(175, .25, z);
          s.node.style.boxShadow = `0 0 ${(P.SCENERY_Z * (1 + z)).toFixed(1)}px #00000040`;
          s.top = H - bh;
        }
        s.node.style.top = `${s.top}px`;
        s.tx = frand(-s.w, W + s.w);
        views.push(s);
      }
      const ps = P.PLAYER_SIZE;
      droid = view(el('lp-lland-droid', ps, ps), {dv: 0, boosting: false, corners: new Array(HULL.length).fill(0)});
      droid.node.hidden = true; droid.tx = W / 2; droid.ty = H / 2;
      views.push(droid);
      views.forEach(draw);
    }
    function corners() {
      const inset = (P.PLAYER_SIZE - P.PLAYER_HIT_SIZE) / 2, scale = P.PLAYER_HIT_SIZE, c = P.PLAYER_SIZE / 2;
      const a = droid.rot * Math.PI / 180, cos = Math.cos(a), sin = Math.sin(a);
      for (let i = 0; i < HULL.length / 2; i++) {
        const x = (scale * HULL[i * 2] + inset - c) * droid.sx, y = (scale * HULL[i * 2 + 1] + inset - c) * droid.sy;
        droid.corners[i * 2] = x * cos - y * sin + c + droid.tx;
        droid.corners[i * 2 + 1] = x * sin + y * cos + c + droid.ty;
      }
    }
    const hitRect = o => { const cx = o.tx + o.w / 2, cy = o.ty + o.h / 2, hw = Math.abs(o.w * o.sx) / 2, hh = Math.abs(o.h * o.sy) / 2; return {left: cx - hw, right: cx + hw, top: cy - hh, bottom: cy + hh}; };
    const intersects = o => {
      for (let i = 0; i < droid.corners.length / 2; i++) {
        const x = Math.trunc(droid.corners[i * 2]), y = Math.trunc(droid.corners[i * 2 + 1]);
        if (o.pop) { if (Math.hypot(x - o.cx, y - o.cy) <= o.r) return true; }
        else if (x >= o.rect.left && x < o.rect.right && y >= o.rect.top && y < o.rect.bottom) return true;
      }
      return false;
    };
    const cleared = o => { for (let i = 0; i < droid.corners.length / 2; i++) if (o.rect.right >= Math.trunc(droid.corners[i * 2])) return false; return true; };
    function stem(h, shadow) {
      const w = P.OBSTACLE_STEM_WIDTH, node = el('lp-lland-stem', w, h);
      if (shadow) node.innerHTML = `<svg width="${w}" height="${P.OBSTACLE_WIDTH / 2 + w * 1.5}"><path d="M0 0H${w}V${P.OBSTACLE_WIDTH / 2 + w * 1.5}L0 ${P.OBSTACLE_WIDTH / 2}Z" fill="#aaa"/></svg>`;
      return view(node, {w, h, stem: true});
    }
    function popsicle() {
      const [name, spin, alpha] = POPS[irand(0, POPS.length)], w = P.OBSTACLE_WIDTH;
      const node = el('lp-lland-pop', w, w); node.style.backgroundImage = `url(assets/lland-${name}.svg)`; node.style.opacity = alpha;
      const o = view(node, {w, h: w, pop: true, flip: frand() < .5 ? -1 : 1, spin: spin ? (frand() < .5 ? -1 : 1) : 0});
      return o;
    }
    function step(dt) {
      t += dt; clock += dt * 1000;
      for (const v of views) {
        tick(v);
        if (v === droid) {
          if (droid.node.hidden) continue;
          droid.dv = droid.boosting ? -P.BOOST_DV : droid.dv + P.G;
          droid.dv = Math.max(-P.MAX_V, Math.min(P.MAX_V, droid.dv));
          const y = droid.ty + droid.dv * dt; droid.ty = y < 0 ? 0 : y;
          droid.rot = 90 + lerp(clamp(rlerp(droid.dv, P.MAX_V, -P.MAX_V)), 90, -90);
          corners();
        } else if (v.stem || v.pop) {
          v.tx -= P.TRANSLATION_PER_SEC * dt;
          v.rect = hitRect(v);
          if (v.pop) { if (v.spin) v.rot += dt * 45 * v.spin; v.cx = (v.rect.left + v.rect.right) / 2; v.cy = (v.rect.top + v.rect.bottom) / 2; v.r = v.w / 2; }
        } else v.tx -= P.TRANSLATION_PER_SEC * dt * v.v;
      }
      if (playing && droid.corners.some((c, i) => i % 2 && Math.trunc(c) >= H)) { thump(); stop(); }
      let passed = false;
      for (let j = obstacles.length; j-- > 0;) {
        const o = obstacles[j];
        if (playing && intersects(o)) { thump(); stop(); }
        else if (cleared(o)) { if (o.stem) passed = true; obstacles.splice(j, 1); }
      }
      if (playing && passed) setScore(score + 1);
      views = views.filter(v => {
        if (v.stem || v.pop) { if (v.tx + v.w < 0) { v.node.remove(); return false; } }
        else if (v !== droid && v.tx + v.w < 0) v.tx = W;
        return true;
      });
      if (playing && t - lastPipe > P.OBSTACLE_PERIOD) {
        lastPipe = t;
        const obstacley = Math.trunc(frand() * (H - 2 * P.OBSTACLE_MIN - P.OBSTACLE_GAP)) + P.OBSTACLE_MIN;
        const inset = Math.trunc((P.OBSTACLE_WIDTH - P.OBSTACLE_STEM_WIDTH) / 2), yinset = Math.trunc(P.OBSTACLE_WIDTH / 2);
        const d1 = irand(0, 250), s1 = stem(obstacley - yinset, false);
        s1.tx = W + inset; s1.ty = -s1.h - yinset; animate(s1, {ty: 0}, d1, 250);
        const p1 = popsicle(); p1.tx = W; p1.ty = -P.OBSTACLE_WIDTH; p1.sx = p1.flip * .25; p1.sy = .25;
        animate(p1, {ty: s1.h - inset, sx: p1.flip, sy: 1}, d1, 250);
        const d2 = irand(0, 250), s2 = stem(H - obstacley - P.OBSTACLE_GAP - yinset, true);
        s2.tx = W + inset; s2.ty = H + yinset; animate(s2, {ty: H - s2.h}, d2, 400);
        const p2 = popsicle(); p2.tx = W; p2.ty = H; p2.sx = p2.flip * .25; p2.sy = .25;
        animate(p2, {ty: H - s2.h - yinset, sx: p2.flip, sy: 1}, d2, 400);
        // Stems below their lollipops, everything above the scenery and below the player.
        for (const o of [s1, p1, s2, p2]) { views.splice(views.indexOf(droid), 0, o); world.insertBefore(o.node, droid.node); obstacles.push(o); o.rect = hitRect(o); }
      }
    }
    const thump = () => vibrate?.(80);
    function frame(now) {
      if (!animating) return;
      const elapsed = Math.min(250, now - (last || now)); last = now; acc += elapsed;
      while (acc >= 1000 / 60) { acc -= 1000 / 60; step(1 / 60); if (!animating) break; }
      views.forEach(draw);
      if (animating) raf = requestAnimationFrame(frame);
    }
    function start(startPlaying) {
      if (startPlaying) {
        playing = true; t = 0; lastPipe = t - P.OBSTACLE_PERIOD;
        scoreField.classList.add('shown'); scoreField.classList.remove('over');
        droid.node.hidden = false; droid.tx = W / 2; droid.ty = H / 2;
      } else droid.node.hidden = true;
      if (!animating) { animating = true; last = 0; acc = 0; raf = requestAnimationFrame(frame); }
    }
    function stop() {
      if (!animating) return;
      cancelAnimationFrame(raf); animating = false; views.forEach(draw);
      scoreField.classList.add('over');
      timeOfDay = irand(0, SKIES.length);
      frozen = true; setTimeout(() => { frozen = false; }, 250);
    }
    function poke() {
      if (frozen) return;
      if (!animating) { reset(); start(true); } else if (!playing) start(true);
      droid.boosting = true; droid.dv = -P.BOOST_DV;
      droid.node.classList.add('boost');
      droid.sx = droid.sy = 1.25; droid.tweens = [];
    }
    function unpoke() {
      if (frozen || !animating) return;
      droid.boosting = false; droid.node.classList.remove('boost');
      animate(droid, {sx: 1, sy: 1}, 0, 200);
    }
    const down = event => { event.preventDefault(); poke(); };
    const up = () => unpoke();
    const key = event => { if ([' ', 'Enter', 'ArrowUp'].includes(event.key)) { event.preventDefault(); event.type === 'keydown' ? !event.repeat && poke() : unpoke(); } };
    root.addEventListener('pointerdown', down); root.addEventListener('pointerup', up); root.addEventListener('pointercancel', up);
    root.tabIndex = 0; root.addEventListener('keydown', key); root.addEventListener('keyup', key);
    reset(); start(false);
    return {root, stop() { cancelAnimationFrame(raf); animating = false; }, state: () => ({score, playing, animating, width: W, height: H})};
  }
  window.LPEgg = {platLogo, land, FLAVORS, PARAMS: P};
})();
