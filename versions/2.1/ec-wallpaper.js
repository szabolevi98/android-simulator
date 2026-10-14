/* Android 2.1 wallpaper layer: the image's default is the Nexus live wallpaper (framework-res default_wallpaper_component
   = com.android.wallpaper/.nexus.NexusWallpaper, LiveWallpapers.apk). Module 'wallpaper' draws it on a canvas behind
   every screen; c.wallpaper.offset(x) follows the home screen (0 … 1), c.wallpaper.tap(x, y) is android.wallpaper.tap.
   Nexus, from the APK's res/raw/nexus.rs (RenderScript source, compiled on the phone) and NexusRS:
   - drawBackground: pyramid_background (960 x 800) over width * 2 x height, moved by -xOffset * width;
   - 20 pulses + 40 extras; PULSE_SIZE 14 px cells, a TRAIL_SIZE 40 cell trail (pulse.png, its head at u = 0) and a
     GLOW_SIZE 64 px glow (glow.png) at the head; SPEED 0.2 px/ms times 1 +- SPEED_VARIANCE 0.3; a pulse starts from a
     random edge cell up to MAX_DELAY 2000 ms later; colours red (1, 0, 0), green (0, .6, 0), blue (0, .4, .8), yellow
     (1, .8, 0); a tap starts four extras from its cell at speed 1.5, one each way, in consecutive colours;
   - textures are modulated by the colour and added (ProgramStore SRC_ALPHA / ONE); main() returns 45 (ms per frame).
   Coordinates are the phone's pixels (width 480); the canvas scales them to the screen. */
(() => {
  'use strict';
  EC.defaults.wallpaper = {type: 'live', id: 'nexus'};
  const img = src => { const i = new Image(); i.src = src; return i; };
  const PULSE = 14, HALF_PULSE = 7, GLOW = 64, HALF_GLOW = 32, SPEED = 0.2, VARIANCE = 0.3, TRAIL = 40, MAX_DELAY = 2000;
  const COLORS = [[1, 0, 0], [0, 0.6, 0], [0, 0.4, 0.8], [1, 0.8, 0]];
  const randf = max => Math.random() * max, randf2 = (a, b) => a + Math.random() * (b - a);

  function nexus() {
    const bg = img('assets/lw-pyramid_background.png'), pulse = img('assets/lw-pulse.png'), glow = img('assets/lw-glow.png');
    let W = 480, H = 800, pulses = [], extras = [], tinted = null;
    // Each texture modulated by each colour once: the pulse keeps its alpha, the luminance glow becomes colour x luminance.
    function tint() {
      if (!pulse.complete || !glow.complete || !pulse.naturalWidth) return null;
      return COLORS.map(([r, g, b]) => {
        const make = (image, keepAlpha) => {
          const cv = document.createElement('canvas'); cv.width = image.naturalWidth; cv.height = image.naturalHeight;
          const x = cv.getContext('2d');
          x.fillStyle = `rgb(${r * 255},${g * 255},${b * 255})`; x.fillRect(0, 0, cv.width, cv.height);
          x.globalCompositeOperation = 'multiply'; x.drawImage(image, 0, 0);
          if (keepAlpha) { x.globalCompositeOperation = 'destination-in'; x.drawImage(image, 0, 0); }
          return cv;
        };
        return {pulse: make(pulse, true), glow: make(glow, false)};
      });
    }
    function initPulse(p, now, type) {
      if (randf(1) > 0.5) {
        p.originX = Math.floor(randf(W * 2 / PULSE)) * PULSE; p.dx = 0;
        if (randf(1) > 0.5) { p.originY = 0; p.dy = randf2(1 - VARIANCE, 1 + VARIANCE); }
        else { p.originY = H; p.dy = -randf2(1 - VARIANCE, 1 + VARIANCE); }
      } else {
        p.originY = Math.floor(randf(H / PULSE)) * PULSE; p.dy = 0;
        if (randf(1) > 0.5) { p.originX = 0; p.dx = randf2(1 - VARIANCE, 1 + VARIANCE); }
        else { p.originX = W * 2; p.dx = -randf2(1 - VARIANCE, 1 + VARIANCE); }
      }
      p.startTime = now + Math.floor(randf(MAX_DELAY));
      p.color = Math.floor(randf(4));
      p.type = type; p.active = type === 'extra' ? 0 : 1;
    }
    function resize(w, h) {
      W = w; H = h;
      const now = performance.now();
      pulses = Array.from({length: 20}, () => { const p = {}; initPulse(p, now, 'normal'); return p; });
      extras = Array.from({length: 40}, () => ({type: 'extra', active: 0}));
    }
    // A rect with the trail texture turned so that its head (u = 0) leads.
    function trail(ctx, tex, x0, y0, x1, y1, angle) {
      const w = x1 - x0, h = y1 - y0;
      ctx.save(); ctx.translate(x0 + w / 2, y0 + h / 2); ctx.rotate(angle);
      const vertical = angle % Math.PI !== 0, len = vertical ? h : w, thick = vertical ? w : h;
      ctx.drawImage(tex, -len / 2, -thick / 2, len, thick); ctx.restore();
    }
    function drawPulses(ctx, set, now) {
      for (const p of set) {
        const delta = now - p.startTime;
        if (!p.active || delta < 0) continue;
        let x = p.originX + p.dx * SPEED * delta, y = p.originY + p.dy * SPEED * delta;
        const t = tinted[p.color];
        if (p.dx < 0) {
          const xx = x + TRAIL * PULSE;
          if (xx <= 0) { p.type === 'extra' ? (p.active = 0) : initPulse(p, now, p.type); continue; }
          trail(ctx, t.pulse, x, y, xx, y + PULSE, 0);
          ctx.drawImage(t.glow, x + HALF_PULSE - HALF_GLOW, y + HALF_PULSE - HALF_GLOW, GLOW, GLOW);
        } else if (p.dx > 0) {
          x += PULSE;
          const xx = x - TRAIL * PULSE;
          if (xx >= W * 2) { p.type === 'extra' ? (p.active = 0) : initPulse(p, now, p.type); continue; }
          trail(ctx, t.pulse, xx, y, x, y + PULSE, Math.PI);
          ctx.drawImage(t.glow, x - HALF_PULSE - HALF_GLOW, y + HALF_PULSE - HALF_GLOW, GLOW, GLOW);
        } else if (p.dy < 0) {
          const yy = y + TRAIL * PULSE;
          if (yy <= 0) { p.type === 'extra' ? (p.active = 0) : initPulse(p, now, p.type); continue; }
          trail(ctx, t.pulse, x, y, x + PULSE, yy, Math.PI / 2);
          ctx.drawImage(t.glow, x + HALF_PULSE - HALF_GLOW, y + HALF_PULSE - HALF_GLOW, GLOW, GLOW);
        } else if (p.dy > 0) {
          y += PULSE;
          const yy = y - TRAIL * PULSE;
          if (yy >= H) { p.type === 'extra' ? (p.active = 0) : initPulse(p, now, p.type); continue; }
          trail(ctx, t.pulse, x, yy, x + PULSE, y, -Math.PI / 2);
          ctx.drawImage(t.glow, x + HALF_PULSE - HALF_GLOW, y - HALF_PULSE - HALF_GLOW, GLOW, GLOW);
        }
      }
    }
    // addTap: the extras are the pulses of a tap; nexus.rs never clears an extra that left the screen (initPulse makes
    // it inactive again), so the 40 slots serve ten taps at a time.
    function tap(x, y, now) {
      x = Math.floor(x / PULSE) * PULSE; y = Math.floor(y / PULSE) * PULSE;
      let count = 0, color = Math.floor(randf(4));
      for (const p of extras) {
        if (p.active) continue;
        Object.assign(p, {originX: x, originY: y, dx: [1.5, -1.5, 0, 0][count], dy: [0, 0, 1.5, -1.5][count], active: 1, color, startTime: now});
        color = (color + 1) % 4;
        if (++count === 4) break;
      }
    }
    return {
      resize, tap,
      draw(ctx, offset, now) {
        if (!tinted) tinted = tint();
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
        ctx.save(); ctx.translate(-offset * W, 0);
        if (bg.complete && bg.naturalWidth) ctx.drawImage(bg, 0, 0, W * 2, H);
        if (tinted) { ctx.globalCompositeOperation = 'lighter'; drawPulses(ctx, pulses, now); drawPulses(ctx, extras, now); }
        ctx.restore();
        ctx.globalCompositeOperation = 'source-over';
      }
    };
  }

  const LIVE = {nexus};
  let canvas = null, ctx = null, live = null, liveId = '', offset = 0, timer = 0, size = '';
  function ensure(c) {
    if (!canvas) {
      canvas = document.createElement('canvas'); canvas.id = 'ec-wallpaper'; canvas.setAttribute('aria-hidden', 'true');
      c.el.screen.prepend(canvas); ctx = canvas.getContext('2d');
    }
    const wp = c.data.wallpaper || {};
    const id = wp.type === 'live' ? wp.id : '';
    if (id !== liveId) { liveId = id; live = LIVE[id]?.() || null; size = ''; }
    c.el.screen.style.setProperty('--ec-wallpaper', wp.type === 'image' ? `url('${wp.src}')` : 'none');
    canvas.hidden = !live;
  }
  // The phone's pixels: 480 wide, as tall as the screen's proportions make it.
  function frame(c) {
    timer = 0;
    if (!live || !visible(c)) return;
    const W = 480, H = Math.round(W * c.el.screen.clientHeight / c.el.screen.clientWidth), ratio = c.el.screen.clientWidth / W * (window.devicePixelRatio || 1);
    const key = `${W}x${H}@${ratio}`;
    if (key !== size) { size = key; canvas.width = Math.round(W * ratio); canvas.height = Math.round(H * ratio); live.resize(W, H); }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    live.draw(ctx, offset, performance.now());
    timer = setTimeout(() => frame(c), 45);
  }
  // Home, lock and the drawer show it, and any screen whose module says it has a wallpaper window (Theme.Wallpaper).
  const visible = c => !document.hidden && !c.ui.sleeping && (['home', 'lock', 'drawer'].includes(c.ui.view) || !!EC.module(c.ui.view)?.wallpaper?.(c));
  function wake(c) { if (!timer) frame(c); }

  EC.register('wallpaper', {
    app: false,
    init(c) {
      c.wallpaper = {
        offset(x) { offset = Math.max(0, Math.min(1, x)); c.el.screen.style.setProperty('--ec-wallpaper-x', `${offset * 100}%`); },
        tap(x, y) { if (live?.tap) { const k = 480 / c.el.screen.clientWidth; live.tap(x * k, y * k, performance.now()); } },
        refresh() { ensure(c); wake(c); }
      };
      ensure(c);
      document.addEventListener('visibilitychange', () => wake(c));
    },
    render: () => '',
    tick(c) { ensure(c); wake(c); }
  });
  // The core renders on every change; keep the animation running whenever the wallpaper shows.
  const observer = new MutationObserver(() => { const c = EC.context; if (c && canvas) { ensure(c); wake(c); } });
  document.addEventListener('DOMContentLoaded', () => observer.observe(document.querySelector('#viewport'), {childList: true}));
})();
