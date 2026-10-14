/* Android 2.1 live wallpapers and the Live Wallpaper Picker.
   - LiveWallpapersPicker.apk: LiveWallpaperListActivity "Live wallpapers" (live_wallpaper_list.xml), one
     live_wallpaper_entry.xml row per installed wallpaper service (padding 6 dp, the 75 dp thumbnail, "<name> by <author>"
     in textAppearanceMedium over the description in textAppearanceSmall), sorted by name; a row opens
     LiveWallpaperPreview: the wallpaper running full screen with live_wallpaper_preview.xml at the bottom (Set wallpaper,
     and Settings... for one with a settingsActivity, 160 dp each).
   - The image's services: LiveWallpapers.apk (Nexus, Grass, Galaxy, Water, Polar clock; See Through's strings and
     walkaround.xml are in the APK but its service is not in the manifest, so the phone does not list it),
     MagicSmokeWallpapers.apk (Magic Smoke, settings MagicSmokeSelector) and VisualizationWallpapers.apk (Waveform,
     Spectrum, VU meter, Many). Every author string is "Google".
   - Polar clock settings (PolarClockSettings, polar_clock_prefs.xml): Show seconds, Vary ring widths (both on), Color
     palette (polar_clock_palette_names; default Polar Bear). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const L = () => EC.text('livewp');
  const img = src => { const i = new Image(); i.src = src; return i; };
  // id, name, description, author, thumbnail, settings
  const WALLPAPERS = [
    ['galaxy', 'LiveWallpapers/wallpaper_galaxy', 'LiveWallpapers/wallpaper_galaxy_desc', 'lw-galaxy_thumb.jpg'],
    ['grass', 'LiveWallpapers/wallpaper_grass', 'LiveWallpapers/wallpaper_grass_desc', 'lw-grass_thumb.jpg'],
    ['nexus', 'LiveWallpapers/wallpaper_nexus', 'LiveWallpapers/wallpaper_nexus_desc', 'lw-nexus_thumb.jpg'],
    ['polarclock', 'LiveWallpapers/wallpaper_clock', 'LiveWallpapers/wallpaper_clock_desc', 'lw-polarclock_thumb.jpg', true],
    ['water', 'LiveWallpapers/wallpaper_fall', 'LiveWallpapers/wallpaper_fall_desc', 'lw-water_thumb.jpg'],
    ['magicsmoke', 'MagicSmokeWallpapers/wallpaper_magicsmoke', 'MagicSmokeWallpapers/magicsmoke_desc', 'ms-magicsmoke_thumb.png', true],
    ['waveform', 'VisualizationWallpapers/wallpaper_vis2', 'VisualizationWallpapers/vis2_desc', 'vz-vis2.png'],
    ['spectrum', 'VisualizationWallpapers/wallpaper_vis3', 'VisualizationWallpapers/vis3_desc', 'vz-vis3.png'],
    ['vu', 'VisualizationWallpapers/wallpaper_vis4', 'VisualizationWallpapers/vis4_desc', 'vz-vis4.png'],
    ['many', 'VisualizationWallpapers/wallpaper_vis5', 'VisualizationWallpapers/vis5_desc', 'vz-vis5.png']
  ];

  // Polar clock (PolarClockWallpaper.ClockEngine.drawFrame, from the image's dex) ----------------------------------------
  // polar_clock_palettes.xml: cycling palettes take each ring's colour from 720 hues (HSBtoColor(i / 720, s, b)) at its
  // own angle; fixed ones have a colour per ring. Ids in polar_clock_palette_ids order (the names array's order).
  const PALETTES = {
    palette_gray: {bg: '#555555', second: '#cc8800', minute: '#333333', hour: '#000000', day: '#999999', month: '#777777'},
    palette_white_c: {bg: '#ffffff', s: 0.8, b: 0.9},
    palette_black_c: {bg: '#000000', s: 1, b: 0.25},
    palette_matrix: {bg: '#002200', second: '#00ff00', minute: '#00bb00', hour: '#007700', day: '#00aa00', month: '#006600'},
    palette_halloween: {bg: '#884400', second: '#ffff00', minute: '#ff8800', hour: '#ff8800', day: '#000000', month: '#000000'},
    palette_violet: {bg: '#181020', second: '#602070', minute: '#603050', hour: '#040008', day: '#706080', month: '#403050'},
    palette_oceanic: {bg: '#000066', second: '#6666ff', minute: '#0000ff', hour: '#0000aa', day: '#000033', month: '#000011'},
    palette_zenburn: {bg: '#3f3f3f', second: '#8acccf', minute: '#cb9292', hour: '#ccdc90', day: '#dca3a3', month: '#7f9f7f'}
  };
  const PALETTE_IDS = Object.keys(PALETTES);
  const clockPrefs = c => ({show_seconds: true, variable_line_width: true, palette: 'palette_white_c', ...c.data.polarClock});
  EC.liveWallpapers.polarclock = () => {
    let W = 480, H = 800;
    const hsb = (h, s, v) => { const f = n => { const k = (n + h * 6) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); }; return `rgb(${Math.round(f(5) * 255)},${Math.round(f(3) * 255)},${Math.round(f(1) * 255)})`; };
    const color = (pal, ring, angle) => pal.s === undefined ? pal[ring] : hsb(Math.floor(720 * (angle >= 1 || angle < 0 ? 0 : angle)) / 720, pal.s, pal.b);
    return {
      resize(w, h) { W = w; H = h; },
      draw(ctx, offset) {
        const c = EC.context, now = c.now(), p = clockPrefs(c), pal = PALETTES[p.palette] || PALETTES.palette_white_c, vary = p.variable_line_width;
        ctx.save(); ctx.fillStyle = pal.bg; ctx.fillRect(0, 0, W, H);
        // Centre: width / 2 + lerp(width / 2, -width / 2, xOffset); rotated -90 so arcs start at 12 o'clock.
        ctx.translate(W / 2 + (W / 2 + (-W / 2 - W / 2) * offset), H / 2); ctx.rotate(-Math.PI / 2);
        if (H < W) ctx.scale(0.9, 0.9);
        ctx.lineCap = 'round';
        let size = Math.min(W, H) * 0.5 - 24, last = 24;
        const ring = (name, angle, width) => {
          if (vary) last = width;
          ctx.lineWidth = vary ? width : 24; ctx.strokeStyle = color(pal, name, angle);
          ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI * 2 * angle); ctx.stroke();
        };
        if (p.show_seconds) ring('second', (now.getTime() % 60000) / 60000, 8);
        size -= 14 + last; ring('minute', ((now.getMinutes() * 60 + now.getSeconds()) % 3600) / 3600, 16);
        size -= 14 + last; ring('hour', ((now.getHours() * 60 + now.getMinutes()) % 1440) / 1440, 32);
        const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        size -= 38 + last; ring('day', (now.getDate() - 1) / (days - 1), 16);
        size -= 14 + last; ring('month', now.getMonth() / 11, 32);
        ctx.restore();
      }
    };
  };
  // Music visualizations (VisualizationWallpapers.apk). No music plays in the simulator, so they show what the phone shows
  // without it: MediaPlayer.snoopAudio returns nothing, the VU needle rests and the wave renderers run their idle state.
  // RenderScriptScene sets up ProgramVertex.setupProjectionNormalized: at z = 0, x -1 … 1 spans the width, y grows upwards.
  // Visualization4RS (vu.rs, a 20 ms updateWave): background (416 x 233), the peak light (56 x 58, off), the needle
  // (88 x 262, turning about 57 units below the origin by mAngle - 90; mAngle = 131 - needle / 410, so 131 at rest), a
  // black quad over its foot and the frame (472 x 290), all at scale 0.0041.
  EC.liveWallpapers.vu = () => {
    const bg = img('assets/vz-background.png'), needle = img('assets/vz-needle.png'), frame = img('assets/vz-frame.png'), peak = img('assets/vz-peak_off.png');
    let W = 480, H = 800;
    // A quad from (x0, y0) to (x1, y1) in units, y up.
    const quad = (ctx, image, x0, y0, x1, y1) => { if (image.complete && image.naturalWidth) ctx.drawImage(image, x0, -y1, x1 - x0, y1 - y0); };
    return {
      interval: 20,
      resize(w, h) { W = w; H = h; },
      draw(ctx) {
        const k = 0.0041 * W / 2;
        ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
        ctx.translate(W / 2, H / 2); ctx.scale(k, k);
        quad(ctx, bg, -208, -33, 208, 200);
        quad(ctx, peak, 140, 70, 196, 128);
        ctx.save(); ctx.translate(0, 57); ctx.rotate(-(131 - 90) * Math.PI / 180); quad(ctx, needle, -44, -102 + 57, 44, 160 + 57); ctx.restore();
        ctx.fillStyle = '#000'; ctx.fillRect(-100, 55, 200, 50);
        quad(ctx, frame, -236, -60, 236, 230);
        ctx.restore();
      }
    };
  };
  // Visualization2RS (Waveform, fire.png) and Visualization3RS (Spectrum, ice.png) are GenericWaveRS on waveform.rs: 1024
  // vertical lines (x = i - 512, the visible width of them drawn), each from val + off (s = 0 of the 64 x 1 texture) to
  // -val + off (s = 1). Idle (makeIdleWave): four moving sine waves whose amplitudes swell from 0; the model turns by
  // yRotation = xOffset / xStep * 180 (Spectrum: * 360) and grows by 1 + 2 |sin yRotation| (scale 0.004165).
  const wave = (texture, turn) => () => {
    const tex = img(texture);
    let W = 480, H = 800, strips = null, last = 0, n = 0;
    // The texture turned upright, and upside down for lines drawn from bottom to top.
    function prepare() {
      if (strips || !tex.complete || !tex.naturalWidth) return strips;
      strips = [false, true].map(flip => {
        const cv = document.createElement('canvas'); cv.width = 1; cv.height = tex.naturalWidth;
        const x = cv.getContext('2d');
        x.translate(0, flip ? cv.height : 0); x.scale(1, flip ? -1 : 1); x.rotate(Math.PI / 2); x.drawImage(tex, 0, -1);
        return cv;
      });
      return strips;
    }
    return {
      interval: 20,
      resize(w, h) { W = w; H = h; },
      draw(ctx, offset, now) {
        // One script run per frame; wave1pos++, wave2pos-- …, every amplitude counter ++.
        n += last ? Math.max(1, Math.min(10, Math.round((now - last) / 20))) : 1; last = now;
        const amp1 = Math.sin(0.007 * n) * 120, amp2 = Math.sin(0.023 * n) * 80, amp3 = Math.sin(0.011 * n) * 40, amp4 = Math.sin(0.031 * n) * 20;
        const yrot = offset * 4 * turn, scale = 0.004165 * (1 + 2 * Math.abs(Math.sin(yrot * Math.PI / 180))), k = scale * W / 2;
        ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
        const s = prepare();
        if (s) {
          ctx.translate(W / 2, H / 2); ctx.rotate(-yrot * Math.PI / 180); ctx.scale(k, k);
          const skip = (1024 - W) >> 1, px = 1 / k;
          for (let i = skip; i < 1024 - skip; i++) {
            let val = Math.sin(0.013 * (n + i)) * amp1 + Math.sin(0.029 * (-n + i)) * amp2;
            const off = Math.sin(0.005 * (n + i)) * amp3 + Math.sin(0.017 * (n + i)) * amp4;
            if (val < 2 && val > -2) val = 2;
            const top = -(val + off), bottom = val - off;   // y down
            ctx.drawImage(s[top > bottom ? 1 : 0], i - 512 - px / 2, Math.min(top, bottom), px, Math.max(Math.abs(bottom - top), px));
          }
        }
        ctx.restore();
      }
    };
  };
  EC.liveWallpapers.waveform = wave('assets/vz-fire.png', 180);
  EC.liveWallpapers.spectrum = wave('assets/vz-ice.png', 360);
  // Picker (Theme.NoTitleBar) ------------------------------------------------------------------------------------------
  const sorted = c => WALLPAPERS.slice().sort((a, b) => L().t(a[1]).localeCompare(L().t(b[1]), c.locale()));
  const title = (c, name) => L().fmt('wallpaper_title_and_author', c.lang, L().t(name), L().t('LiveWallpapers/wallpaper_nexus_author'));
  function list(c) {
    return `<div class="eclw-list">${sorted(c).map(([id, name, desc, thumb]) => `<button type="button" class="eclw-row" data-action="eclw-pick" data-id="${id}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><img src="assets/${thumb}" alt=""><span class="eclw-text"><span class="t1">${esc(title(c, name))}</span><span class="t2">${esc(L().t(desc).replace(/<br>\s*/g, '\n'))}</span></span></button><i class="ecpf-divider"></i>`).join('')}</div>`;
  }
  // LiveWallpaperPreview (style Preview: no title, a transparent window over the running wallpaper).
  const button = (action, label) => `<button type="button" class="ecui-button eclw-btn" data-action="${action}"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(label)}</span></button>`;
  function preview(c) {
    const w = WALLPAPERS.find(x => x[0] === c.ui.lwPreview);
    return `<div class="eclw-preview" data-action="eclw-tap"><canvas class="eclw-canvas"></canvas><div class="eclw-buttons">${button('eclw-set', L().t('set_live_wallpaper'))}${w?.[4] ? button('eclw-settings', L().t('configure_wallpaper')) : ''}</div></div>`;
  }
  // MagicSmokeSelector (selector.xml, style Preview): "Tap to change" over the wallpaper, a tap moves to the next preset.
  function smokeSelector() {
    return `<div class="eclw-preview" data-action="eclw-smoke"><canvas class="eclw-canvas"></canvas><div class="eclw-banner">${esc(L().t('MagicSmokeWallpapers/taptochange'))}</div><div class="eclw-buttons">${button('eclw-smoke-ok', L().t('MagicSmokeWallpapers/ok'))}</div></div>`;
  }
  // PolarClockSettings (polar_clock_prefs.xml; Theme, so titled).
  function clockSettings(c) {
    const p = clockPrefs(c);
    const row = (key, label, check) => `<button type="button" class="ecpf-row" data-action="eclw-pref" data-key="${key}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span class="ecpf-text"><span class="ecpf-title">${esc(label)}</span></span>${check === undefined ? '' : `<img class="ecpf-check" src="assets/fw-btn_check_${check ? 'on' : 'off'}.png" alt="">`}</button><i class="ecpf-divider"></i>`;
    return c.window(L().t('LiveWallpapers/clock_settings'), `<div class="ecpf-list">${row('show_seconds', L().t('LiveWallpapers/show_seconds'), p.show_seconds)}${row('variable_line_width', L().t('LiveWallpapers/variable_line_width'), p.variable_line_width)}${row('palette', L().t('LiveWallpapers/palette'))}</div>`);
  }
  function pref(c, key) {
    const p = (c.data.polarClock = clockPrefs(c));
    if (key !== 'palette') { p[key] = !p[key]; c.save(); c.render(); return; }
    // ListPreference: the single-choice dialog titled by the preference, with Cancel.
    c.dialog({title: L().t('LiveWallpapers/palette'), icon: null, items: L().t('LiveWallpapers/polar_clock_palette_names'), choice: 'single',
      checked: PALETTE_IDS.indexOf(p.palette), closeOnChoice: true, buttons: [{label: EC.text('framework').t('cancel')}],
      onItem: i => { p.palette = PALETTE_IDS[i]; c.save(); }});
  }

  let frame = 0, live = null;
  function run(c, root) {
    cancelAnimationFrame(frame);
    const cv = root.querySelector('.eclw-canvas');
    if (!cv) return;
    const ratio = window.devicePixelRatio || 1, W = 480, H = Math.round(W * cv.clientHeight / cv.clientWidth);
    cv.width = Math.round(cv.clientWidth * ratio); cv.height = Math.round(cv.clientHeight * ratio);
    live = EC.liveWallpapers[c.ui.sub === 'smoke' ? 'magicsmoke' : c.ui.lwPreview]?.({preview: true}); live?.resize(W, H);
    const ctx = cv.getContext('2d'), k = cv.width / W;
    // The preview engine (isPreview) stays at the middle offset.
    const step = now => { if (!cv.isConnected) return; ctx.setTransform(k, 0, 0, k, 0, 0); live?.draw(ctx, 0.5, now); frame = requestAnimationFrame(step); };
    step(performance.now());
  }
  const go = (c, s) => { cancelAnimationFrame(frame); c.ui.sub = s; c.render(); };
  EC.register('live-wallpapers', {
    title: 'Live wallpapers',
    render(c) {
      const s = c.ui.sub;
      return s === 'preview' ? preview(c) : s === 'clock-settings' ? clockSettings(c) : s === 'smoke' ? smokeSelector(c) : list(c);
    },
    mount(c, root) { if (c.ui.sub === 'preview' || c.ui.sub === 'smoke') run(c, root); },
    action(name, el, event, c) {
      switch (name) {
        case 'eclw-pick': c.ui.lwPreview = el.dataset.id; go(c, 'preview'); return true;
        case 'eclw-set': cancelAnimationFrame(frame); c.data.wallpaper = {type: 'live', id: c.ui.lwPreview}; c.save(); c.ui.sub = ''; c.home(); c.wallpaper?.refresh(); return true;
        case 'eclw-settings': go(c, c.ui.lwPreview === 'magicsmoke' ? 'smoke' : 'clock-settings'); return true;
        case 'eclw-pref': pref(c, el.dataset.key); return true;
        case 'eclw-tap': case 'eclw-smoke': {
          if (event.target.closest('button')) return false;
          const r = el.getBoundingClientRect(), k = 480 / r.width;
          if (name === 'eclw-smoke') live?.next?.(c);
          else live?.tap?.((event.clientX - r.left) * k, (event.clientY - r.top) * k, performance.now());
          return true;
        }
        case 'eclw-smoke-ok': go(c, 'preview'); return true;
      }
      return false;
    },
    back(c) {
      if (c.ui.sub === 'clock-settings' || c.ui.sub === 'smoke') { go(c, 'preview'); return true; }
      if (c.ui.sub === 'preview') { go(c, ''); return true; }
      cancelAnimationFrame(frame);
      return false;
    }
  });
})();
