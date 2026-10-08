/* Google Maps __MAPS__ (__IMAGE__) directions, written by docs/maps6-route.py from docs/maps6-route.template.js:
   - Directions (directions_input_dialog_with_options.xml): the #D8D8D8 panel with the start and end fields and their
     ic_input_get buttons, the travel-mode RadioGroup (mode_driving / _transit / _bike / _walk, 42 dip), the driving
     options (directions_option_boolean.xml check boxes) and the bottombar_portrait_565 bar with the Navigation button
     (btn_navigate) and "Get directions" with ic_btn_next.
   - The route list (list_header_directions.xml): the header_bar_background bar with the travel-mode button and its
     drop_down_menu_arrow, Show map (btn_show_map) and Navigation (btn_navigate); start_end_box with the start and end
     rows; the 28 sp distance and duration; the steps (list_item_directions_step.xml) with their turn arrows.
   - The route on the map with directions_map_banner_view.xml (54 dip, #BF000000: the destination, distance and time,
     the Navigation button).
   The route follows the simulator's drawn streets; step texts use Navigation's da_step_* strings of the image. The image
   lacks a few of the dialog's texts (they came from Google's servers): the highways box takes Maps 7.5's
   DIRECTIONS_OPTIONS_AVOID_HIGHWAYS / _TOLLS and the start / end labels its DIRECTIONS_OMNIBOX_FROM / _TO (Nexus 5 image). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const LANGS = ['hu', 'de', 'fr', 'es'];
  // Maps 7.5 (KTU84P) texts for what the image does not carry.
  const KK = {
    'Avoid highways': ['Autópályák elkerülése', 'Autobahnen vermeiden', 'Éviter les autoroutes', 'Evitar autopistas'],
    'Avoid tolls': ['Fizetős utak elkerülése', 'Mautstraßen vermeiden', 'Éviter les péages', 'Evitar peajes'],
    'From': ['Innen', 'Von', 'De', 'Desde'],
    'To': ['Ide', 'Nach', 'À', 'Hasta']
  };
  const MODES = [['drive', 'driving', 'mode_drive'], ['transit', 'transit', 'mode_transit_icon'], ['bike', 'bike', 'mode_biking'], ['walk', 'walk', 'mode_walking']];
  const STREETS = ['Market St', 'River St', 'Park Ave', 'Bay Rd'];
  const ME = {x: 180, y: 300};
  const A = name => `assets/mp6r-${name}.png`;
  // The image's own strings (stock-strings.js, group maps), then Maps 7.5's for the missing ones, then the interface's.
  function S(ctx, key) {
    const row = window.StockStrings?.maps?.[key], i = LANGS.indexOf(String(ctx.locale || 'en').slice(0, 2));
    if (row) return i >= 0 ? row[i] : row[4] || key;
    if (KK[key]) return i >= 0 ? KK[key][i] : key;
    return ctx.t(key);
  }
  const fmt = (pattern, ...args) => args.reduce((s, a, i) => s.replace(`%${i + 1}$s`, a).replace(`{${i}}`, a), pattern);
  function distance(ctx, km) {
    if (S(ctx, 'imperial') === 'imperial') { const mi = km * .621; return mi < .1 ? fmt(S(ctx, '{0} ft'), Math.round(mi * 5280 / 50) * 50) : fmt(S(ctx, '{0} mi'), mi.toFixed(1)); }
    return km < 1 ? fmt(S(ctx, '{0} m'), Math.round(km * 100) * 10) : fmt(S(ctx, '{0} km'), km.toFixed(1));
  }
  const duration = (ctx, min) => min < 60 ? fmt(S(ctx, '%1$s min'), min) : fmt(S(ctx, '%1$s hr  %2$s min'), Math.floor(min / 60), min % 60);

  // A place for any destination text: the search's pin, or a spot of its own on the map.
  function place(ctx, text) {
    if (!text) return null;
    if (text === ctx.ui.mapsQuery) return {name: text, x: 222, y: 190};
    const h = [...text].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
    return {name: text, x: 50 + h % 260, y: 130 + (h >> 8) % 140};
  }
  // The route along the grid: up the avenue first, or (avoiding highways) along the street first; km from the map's scale.
  function route(ctx, r) {
    const to = place(ctx, r.to); if (!to) return null;
    const opts = r.avoid ?? avoid(ctx.data || {}), alt = (r.mode || 'drive') === 'drive' && opts.highways, path = alt ? [ME, {x: to.x, y: ME.y}, to] : [ME, {x: ME.x, y: to.y}, to];
    const units = Math.abs(to.x - ME.x) + Math.abs(to.y - ME.y), km = Math.max(.2, units / 110 * (alt ? 1.15 : 1));
    const speed = {drive: alt ? 22 : 30, transit: 20, bike: 15, walk: 5}[r.mode] || 30;
    const min = Math.max(1, Math.round(km / speed * 60) + ((r.mode || 'drive') === 'drive' ? 2 + (opts.tolls ? 2 : 0) : r.mode === 'transit' ? 6 : 0));
    const first = STREETS[to.name.length % STREETS.length], second = STREETS[(to.name.length + 1) % STREETS.length];
    // The first leg's heading and the turn into the second (screen y grows southwards).
    const east = to.x > ME.x, north = to.y < ME.y, heading = alt ? (east ? 'east' : 'west') : (north ? 'north' : 'south');
    const turn = alt ? (east === north ? 'left' : 'right') : (north === east ? 'right' : 'left');
    const steps = [
      {icon: 'da_turn_straight', text: fmt(S(ctx, 'Head %1$s on %2$s'), S(ctx, heading), first), km: km * .55, road: first},
      {icon: turn === 'right' ? 'da_turn_right' : 'da_turn_slight_right', flip: turn === 'left', text: fmt(S(ctx, turn === 'right' ? 'Turn right onto %1$s' : 'Turn left onto %1$s'), second), km: km * .4, road: second},
      {icon: 'da_turn_straight', text: fmt(S(ctx, 'Continue onto %1$s'), second), km: km * .05, road: second},
      {icon: 'da_turn_arrive', text: S(ctx, 'Your destination is on the right.'), km: 0, road: to.name}];
    return {to, path, km, min, steps};
  }
  const state = ui => ui.mapsRoute;
  const avoid = data => ({highways: false, tolls: false, ...(data.mapsAvoid || {})});

  // ---- Screens -----------------------------------------------------------------------------------------------------
  const has = ui => ['input', 'list'].includes(state(ui)?.screen);
  function render(ctx) {
    const {ui, data} = ctx, r = state(ui), mode = r.mode || 'drive';
    if (r.screen === 'input') {
      const field = (name, value, hint) => `<div class="mr-row"><input class="mr-field" name="${name}" value="${e(value)}" placeholder="${e(hint)}" autocomplete="off" spellcheck="false"><button type="button" class="mr-pick" data-action="mr-pick" aria-label="${e(hint)}"><img src="${A('ic_input_get')}" alt=""></button></div>`;
      const modes = MODES.map(([id, img]) => `<button type="button" class="mr-mode${mode === id ? ' on' : ''}" data-action="mr-mode" data-id="${id}" role="radio" aria-checked="${mode === id}" style="--on:url('${A(`mode_${img}_on`)}');--off:url('${A(`mode_${img}_off`)}')"></button>`).join('');
      const a = avoid(data), options = mode === 'drive' ? [['highways', 'Avoid highways'], ['tolls', 'Avoid tolls']].map(([id, key]) => `<label class="mr-option"><input type="checkbox" data-action="mr-avoid" data-id="${id}"${a[id] ? ' checked' : ''}><span>${e(S(ctx, key))}</span></label>`).join('') : '';
      return `<form class="app-view sa-app mr-input" data-form="mr-go">${ctx.bar({title: S(ctx, 'Directions'), icon: 'maps.png', up: true})}<div class="mr-panel">${field('from', r.from ?? ctx.t('My Location'), S(ctx, 'From'))}${field('to', r.to || '', S(ctx, 'To'))}<div class="mr-modes" role="radiogroup">${modes}</div><div class="mr-options">${options}</div></div><div class="mr-gobar"><span><button type="button" class="mr-btn mr-navbtn" data-action="mr-navigate" aria-label="${e(S(ctx, 'Navigation'))}"${mode === 'drive' || mode === 'walk' ? '' : ' disabled'}><img src="${A('btn_navigate')}" alt=""></button></span><button type="submit" class="mr-btn mr-gobtn"><span>${e(S(ctx, 'Get directions'))}</span><img src="${A('ic_btn_next')}" alt=""></button></div></form>`;
    }
    const rt = route(ctx, r); if (!rt) { r.screen = 'input'; return render(ctx); }
    const modeIcon = MODES.find(m => m[0] === mode)[2];
    const header = `<div class="mr-head"><button class="mr-hbtn mr-modebtn" data-action="mr-input"><img src="${A(modeIcon)}" alt=""><img class="mr-arrow" src="${A('drop_down_menu_arrow')}" alt=""></button><i></i><span></span><i></i><button class="mr-hbtn" data-action="mr-map" aria-label="${e(ctx.t('Map'))}"><img src="${A('btn_show_map')}" alt=""></button><i></i><button class="mr-hbtn" data-action="mr-navigate" aria-label="${e(S(ctx, 'Navigation'))}"${mode === 'drive' || mode === 'walk' ? '' : ' disabled'}><img src="${A('btn_navigate')}" alt=""></button></div>`;
    const box = `<div class="mr-box"><button class="mr-end" data-action="mr-input"><small>${e(S(ctx, 'From'))}</small><b>${e(r.from ?? ctx.t('My Location'))}</b><img src="${A('more_options')}" alt=""></button><i class="mr-line"></i><button class="mr-end" data-action="mr-input"><small>${e(S(ctx, 'To'))}</small><b>${e(rt.to.name)}</b><img src="${A('more_options')}" alt=""></button></div>`;
    const a = avoid(data), notes = mode === 'drive' ? ['highways', 'tolls'].filter(k => a[k]).map(k => `<p class="mr-note">${e(S(ctx, k === 'highways' ? 'Avoiding highways' : 'Avoiding tolls'))}</p>`).join('') : '';
    const summary = `<div class="mr-summary"><b>${e(distance(ctx, rt.km))}</b><b>${e(duration(ctx, rt.min))}</b></div>${notes}`;
    const steps = rt.steps.map(st => `<div class="mr-step"><img class="${st.flip ? 'flip' : ''}" src="${A(st.icon)}" alt=""><span><b>${e(st.text)}</b>${st.km ? `<small>${e(distance(ctx, st.km))}</small>` : ''}</span></div>`).join('');
    return `<div class="app-view sa-app mr-list">${ctx.bar({title: S(ctx, 'Directions'), icon: 'maps.png', up: true})}<div class="sa-scroll mr-scroll">${header}${box}${summary}<i class="mr-divider"></i>${steps}</div></div>`;
  }
  // The route drawn into the map's SVG and the banner over it.
  function svg(ctx) {
    const r = state(ctx.ui); if (r?.screen !== 'map') return '';
    const rt = route(ctx, r); if (!rt) return '';
    const d = rt.path.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join('');
    return `<path d="${d}" fill="none" stroke="#3b5bdb" stroke-opacity=".7" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${ME.x}" cy="${ME.y}" r="7" fill="#22a33a" stroke="#fff" stroke-width="2"/><g transform="translate(${rt.to.x} ${rt.to.y})"><path d="M0-34a14 14 0 0 0-14 14c0 11 14 26 14 26s14-15 14-26A14 14 0 0 0 0-34z" fill="#db4437"/><circle cy="-20" r="5" fill="#fff"/></g>`;
  }
  function banner(ctx) {
    const r = state(ctx.ui); if (r?.screen !== 'map') return '';
    const rt = route(ctx, r); if (!rt) return '';
    return `<div class="mr-banner"><button class="mr-summarybtn" data-action="mr-list"><small>${e(S(ctx, 'To'))}</small><b>${e(rt.to.name)}</b><span>${e(distance(ctx, rt.km))} – ${e(duration(ctx, rt.min))}</span></button><i></i><button class="mr-bannernav" data-action="mr-navigate"${r.mode === 'drive' || r.mode === 'walk' || !r.mode ? '' : ' disabled'}><img src="${A('btn_navigate')}" alt=""><small>${e(S(ctx, 'Navigation'))}</small></button></div>`;
  }

  // ---- Actions -----------------------------------------------------------------------------------------------------
  function open(ctx, to = '') { ctx.ui.mapsRoute = {screen: 'input', mode: ctx.ui.mapsRoute?.mode || 'drive', to: to || ctx.ui.mapsRoute?.to || '', from: undefined}; ctx.render(); }
  function handle(action, id, ctx) {
    const {ui, data} = ctx, r = state(ui);
    switch (action) {
      case 'mr-open': open(ctx, id || ''); ctx.focus?.('.mr-field[name=to]'); return true;
      case 'mr-mode': keep(ctx); r.mode = id; ctx.render(); return true;
      case 'mr-avoid': keep(ctx); data.mapsAvoid = {...avoid(data), [id]: !avoid(data)[id]}; ctx.save(); ctx.render(); return true;
      case 'mr-pick': ctx.unsupported(); return true;
      case 'mr-input': r.screen = 'input'; ctx.render(); return true;
      case 'mr-list': r.screen = 'list'; ctx.render(); return true;
      case 'mr-map': r.screen = 'map'; ctx.render(); return true;
      case 'mr-navigate': {
        if (r?.screen === 'input') keep(ctx);
        const rt = r && route(ctx, r); if (!rt) { ctx.focus?.('.mr-field[name=to]'); return true; }
        ctx.navigate({name: rt.to.name, km: rt.km, min: rt.min, mode: r.mode === 'walk' ? 'walk' : 'drive'}); return true;
      }
    }
    return false;
  }
  // The fields keep what was typed when the panel re-renders.
  function keep(ctx) { const r = state(ctx.ui), form = ctx.root?.querySelector('.mr-input'); if (r && form) { r.from = form.querySelector('[name=from]').value; r.to = form.querySelector('[name=to]').value.trim(); } }
  function submit(values, ctx) {
    const r = state(ctx.ui); r.from = String(values.get('from') || ''); r.to = String(values.get('to') || '').trim();
    if (!r.to) { ctx.focus?.('.mr-field[name=to]'); return; }
    r.screen = 'list'; ctx.render();
  }
  function back(ctx) {
    const r = state(ctx.ui); if (!r) return false;
    if (r.screen === 'map') { r.screen = 'list'; ctx.render(); return true; }
    if (r.screen === 'list') { r.screen = 'input'; ctx.render(); return true; }
    ctx.ui.mapsRoute = null; ctx.render(); return true;
  }
  const clear = ui => { ui.mapsRoute = null; };

  // ---- Navigation's drive (da_navigation.xml) -----------------------------------------------------------------
  // TopBarView on top_panel_green (84 dip) with the turn in turn_square_green_bg and the step; the map tilted under the
  // car's chevron (dav_chevron); da_status_bar.xml on bottom_panel_gray (50 dip) with traffic_dot_green, the time left
  // and the road. The demo drive takes 40 s; Back asks da_confirm_exit_title.
  function navSteps(ctx, run) {
    const to = place(ctx, run.name) || {name: run.name, x: 222, y: 190};
    return route(ctx, {to: run.name, mode: run.mode, avoid: run.mode === 'drive' ? avoid(ctx.data) : {}}) || {to, path: [ME, to], km: run.km, min: run.min, steps: []};
  }
  function nav(ctx) {
    const run = ctx.ui.navRun; if (!run) return '';
    const rt = navSteps(ctx, run), p = Math.min(1, run.progress || 0), done = p >= 1;
    const step = rt.steps[Math.min(rt.steps.length - 1, Math.floor(p * (rt.steps.length - 1)))] || {icon: 'da_turn_arrive', text: ''};
    const left = rt.km * (1 - p), min = Math.ceil(rt.min * (1 - p));
    const d = rt.path.map((q, i) => `${i ? 'L' : 'M'}${q.x} ${q.y}`).join(''), at = along(rt.path, p);
    return `<div class="app-view sa-app mr-nav"><div class="mr-navtop"><span class="mr-navturn"><img class="${step.flip ? 'flip' : ''}" src="${A(done ? 'da_turn_arrive' : step.icon)}" alt=""><b>${e(done ? '' : distance(ctx, left / Math.max(1, rt.steps.length - 1)))}</b></span><b class="mr-navtext">${e(done ? S(ctx, 'You have arrived.') : step.text)}</b></div><div class="mr-navmap"><svg viewBox="0 0 360 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${ctx.mapSvg.replace(/<circle cx="180" cy="300"[^>]*\/>/g, '')}<path d="${d}" fill="none" stroke="#7b3ff2" stroke-opacity=".75" stroke-width="10" stroke-linejoin="round"/><image href="${A('dav_chevron')}" x="${at.x - 26}" y="${at.y - 26}" width="52" height="52" transform="rotate(${heading(rt.path, p)} ${at.x} ${at.y})"/></svg></div><div class="mr-navstatus"><img src="${A('traffic_dot_green')}" alt=""><b>${e(done ? '' : duration(ctx, min))}</b><i></i><span>${e(done ? rt.to.name : step.road || rt.to.name)}</span></div></div>`;
  }
  // The chevron points along the leg it is on.
  function heading(path, t) {
    const segs = path.slice(1).map((q, i) => [path[i], q]), total = segs.reduce((s, [a, b]) => s + Math.hypot(b.x - a.x, b.y - a.y), 0) || 1;
    let left = t * total;
    for (const [a, b] of segs) { const len = Math.hypot(b.x - a.x, b.y - a.y); if (left <= len || b === path.at(-1)) return Math.atan2(b.x - a.x, a.y - b.y) * 180 / Math.PI; left -= len; }
    return 0;
  }
  function along(path, t) {
    const segs = path.slice(1).map((q, i) => ({a: path[i], b: q, len: Math.hypot(q.x - path[i].x, q.y - path[i].y)})), total = segs.reduce((s, g) => s + g.len, 0) || 1;
    let left = t * total;
    for (const g of segs) { if (left <= g.len) { const k = g.len ? left / g.len : 0; return {x: g.a.x + (g.b.x - g.a.x) * k, y: g.a.y + (g.b.y - g.a.y) * k}; } left -= g.len; }
    return path.at(-1);
  }
  let navTimer = 0;
  function startNav(ctx, run) {
    ctx.ui.navRun = {...run, started: Date.now(), progress: 0};
    clearTimeout(navTimer);
    const tick = () => {
      const r = ctx.ui.navRun; if (!r || r.started !== ctx.ui.navRun.started) return;
      r.progress = Math.min(1, (Date.now() - r.started) / 40000);
      if (ctx.ui.view === 'navigation' && !ctx.ui.overlay) ctx.render();
      if (r.progress < 1) navTimer = setTimeout(tick, 1000);
    };
    navTimer = setTimeout(tick, 1000);
  }
  function stopNav(ctx) { clearTimeout(navTimer); ctx.ui.navRun = null; }

  window.MapsRoute = {has, render, svg, banner, handle, submit, back, open, clear, route, S, nav, startNav, stopNav};
})();
