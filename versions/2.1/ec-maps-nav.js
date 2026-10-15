/* Android 2.1 Maps 3.4.0: Google Maps Navigation (Beta; com.google.android.maps.driveabout) and Street View 1.4
   (Street.apk), on the made-up city of ec-maps.js.
   - Navigation: da_disclaimer_dialog.xml first ("Google Maps Navigation is in beta. Use caution." … with "Show this
     message next time", unchecked; Accept / Don't Accept), then NavigationActivity (da_navigation.xml): da_top_frame
     (84 dp; da_step_description.xml on da_top_panel_green: the 84 dp turn square with the 48 dp turn icon and the
     distance in 27 dp, da_vertical_separator, the road in up to 32 dp and "toward …" in up to 24 dp; da_topStatusMessage
     on da_top_panel_gray for "Getting driving directions" and "You have arrived."), the map turned to the heading and
     tilted with da_chevron, da_status_bar.xml (50 dp on da_bottom_panel_gray: the traffic dot, the time left in 27 dp,
     the separator, the road), the zoom buttons (da_btn_zoom_*) on a touch, da_mute_indicator when muted. The car drives
     the route by itself. Menu (res/menu/da_navigation.xml): Search, Route Info, Layers, Mute / Unmute, Exit Navigation,
     Directions List, then Choose Destination, Switch to Walking / Driving, Help, Terms, Privacy & Notices.
   - Street View: custom_title_1.xml (the address, "Loading" with the small spinner), the StreetView panorama with the
     yellow street line and its arrows, maps_google_logo; drag to look around, the arrows step along the street. Menu
     (res/menu/main.xml): Step forward, Step backward, Zoom, Go to map, Report image, Compass mode. Google's panoramas
     cannot ship, so the street is our own drawing of the made-up city. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const M = () => EC.text('maps');
  const t = k => M().t(k);
  const fmt = (c, k, ...args) => M().fmt(k, c.lang, ...args);
  const A = name => `assets/mp-${name}.png`;
  const P = () => EC.maps;

  // ---------------------------------------------------------------------------------------------------------------
  // Navigation.
  const nav = {timer: 0, zoomTimer: 0};
  const ns = c => c.ui.mpNav;
  function start(c, to) {
    if (!to) return;
    const s = P().st(c);
    const go = () => {
      c.ui.mpNav = {to, loading: true, travelled: 0, mode: 'drive', muted: false, zoom: 17, overview: false, list: false, zoomShown: false, arrived: false};
      c.open('maps-nav');
      clearTimeout(nav.timer);
      nav.timer = setTimeout(() => reroute(c), 1500);
    };
    if (s.navAgreed && !s.navAsk) { go(); return; }
    let ask = false;
    const html = `<div class="ecmn-agree"><div class="ecmn-agreetext">${esc(t('da_agreement'))}</div><button type="button" class="ecmn-check" data-action="ecmn-check"><img src="assets/fw-btn_check_off.png" alt=""><span>${esc(t('da_disclaimer_checkbox'))}</span></button></div>`;
    c.dialog({title: `${t('da_google_maps_navigation')}`, icon: null, html,
      action(name, el) { if (name !== 'ecmn-check') return false; ask = !ask; el.querySelector('img').src = `assets/fw-btn_check_${ask ? 'on' : 'off'}.png`; return true; },
      buttons: [{label: t('da_dialog_accept'), action: () => { s.navAgreed = true; s.navAsk = ask; c.save(); go(); }}, {label: t('da_dialog_dont_accept')}]});
  }
  function reroute(c) {
    const n = ns(c);
    if (!n || c.ui.view !== 'maps-nav') return;
    const me = n.pos || {x: P().ME.x, y: P().ME.y};
    n.route = P().route(me, {...n.to, name: n.to.name}, n.mode);
    n.texts = n.route ? P().stepTexts(c, n.route) : [];
    n.travelled = 0; n.loading = false; n.arrived = false;
    measure(n);
    c.render(); drive(c);
  }
  // Cumulative distances along the route's path, and where each step begins on it.
  function measure(n) {
    if (!n.route) return;
    const path = n.route.path; n.cum = [0];
    for (let i = 1; i < path.length; i++) n.cum.push(n.cum[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
    n.length = n.cum.at(-1);
    n.stepAt = n.texts.map(s => { let best = 0, bd = Infinity; path.forEach((p, i) => { const d = Math.hypot(p[0] - s.at[0], p[1] - s.at[1]); if (d < bd - 0.5) { bd = d; best = i; } }); return n.cum[best]; });
    n.stepAt[n.stepAt.length - 1] = n.length;
    // Steps found out of order (a path that passes a point twice) follow the previous one.
    for (let i = 1; i < n.stepAt.length; i++) n.stepAt[i] = Math.max(n.stepAt[i], n.stepAt[i - 1]);
  }
  function at(n, d) {
    const path = n.route.path; d = Math.max(0, Math.min(n.length, d));
    let i = 1; while (i < path.length - 1 && n.cum[i] < d) i++;
    const f = (d - n.cum[i - 1]) / ((n.cum[i] - n.cum[i - 1]) || 1), a = path[i - 1], b = path[i];
    return {x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f, heading: Math.atan2(b[0] - a[0], -(b[1] - a[1]))};
  }
  function current(n) {
    let i = 0; while (i + 1 < n.stepAt.length && n.stepAt[i + 1] <= n.travelled + 1) i++;
    return i;
  }
  // The car drives the route: about 45 km/h, a frame every 100 ms, a little faster than life.
  function drive(c) {
    clearInterval(nav.drive);
    nav.drive = setInterval(() => {
      const n = ns(c);
      if (!n || c.ui.view !== 'maps-nav' || !n.route) { clearInterval(nav.drive); return; }
      if (n.arrived) return;
      n.travelled = Math.min(n.length, n.travelled + (n.mode === 'walk' ? 1.4 : 12.5) * 0.1 * 3);
      n.pos = at(n, n.travelled);
      if (n.travelled >= n.length) { n.arrived = true; c.render(); return; }
      update(c);
    }, 100);
  }
  const turnIcon = icon => ({dir_right: 'da_turn_right', dir_left: 'da_turn_right', dir_continue: 'da_turn_straight', head: 'da_turn_straight', arrive: 'da_turn_arrive'})[icon] || 'da_turn_unknown';
  function topBar(c, n) {
    if (n.loading) return `<div class="ecmn-status np-mp-da_top_panel_gray_normal">${esc(t(n.mode === 'walk' ? 'da_waiting_for_walking_directions' : 'da_waiting_for_directions'))}</div>`;
    if (!n.route) return `<div class="ecmn-status np-mp-da_top_panel_gray_normal">${esc(t('no_results'))}</div>`;
    if (n.arrived) return `<div class="ecmn-step np-mp-da_top_panel_green_normal"><span class="ecmn-turn"><img src="${A('da_turn_arrive')}" alt=""></span><img class="ecmn-sep" src="${A('da_vertical_separator')}" alt=""><span class="ecmn-road"><b>${esc(t('da_destination_reached'))}</b><small>${esc(n.to.name)}</small></span></div>`;
    const i = Math.min(current(n) + 1, n.texts.length - 1), s = n.texts[i], road = s.icon === 'arrive' ? n.to.name : P().ROADS[n.route.steps[i]?.ri]?.name || n.to.name;
    const next = n.route.steps[i + 1] ? P().ROADS[n.route.steps[i + 1].ri].name : '';
    const left = s.icon === 'dir_left';
    return `<div class="ecmn-step np-mp-da_top_panel_green_normal"><span class="ecmn-turn"><img class="${left ? 'flip' : ''}" src="${A(turnIcon(s.icon))}" alt=""><span class="ecmn-dist">${esc(P().distance(c, n.stepAt[i] - n.travelled))}</span></span><img class="ecmn-sep" src="${A('da_vertical_separator')}" alt="">
      <span class="ecmn-road"><b>${esc(road)}</b>${next && s.icon !== 'arrive' ? `<small>${esc(fmt(c, 'da_toward', next))}</small>` : ''}</span></div>`;
  }
  function statusBar(c, n) {
    if (!n.route || n.loading) return '';
    const left = Math.max(0, n.length - n.travelled), min = left / (n.mode === 'walk' ? 80 : 520), road = n.arrived ? n.to.name : P().ROADS[n.route.steps[Math.min(current(n), n.route.steps.length - 1)]?.ri]?.name || '';
    return `<div class="ecmn-bar np-mp-da_bottom_panel_gray"><img class="ecmn-dot" src="${A(n.mode === 'walk' ? 'da_traffic_dot_empty' : 'da_traffic_dot_green')}" alt=""><span class="ecmn-time">${esc(P().minutes(c, min))}</span><img class="ecmn-sep" src="${A('da_vertical_separator')}" alt=""><span class="ecmn-cur">${esc(road)}</span></div>`;
  }
  function renderNav(c) {
    const n = ns(c);
    if (!n) return '';
    if (n.list) {
      const rows = (n.texts || []).map((s, i) => `<div class="ecmn-lrow${i === current(n) ? ' on' : ''}"><img class="${s.icon === 'dir_left' ? 'flip' : ''}" src="${A(turnIcon(s.icon))}" alt=""><span>${esc(s.text)}</span><small>${s.len ? esc(P().distance(c, s.len)) : ''}</small></div>`).join('<i class="ecmn-ldiv"></i>');
      return `<div class="ecmn"><div class="ecmn-top">${topBar(c, n)}</div><div class="ecmn-list">${rows}</div></div>`;
    }
    const zoom = dir => `<button type="button" class="ecmn-zb" data-action="ecmn-zoom" data-dir="${dir === 'up' ? 1 : -1}"><img class="n" src="${A(`da_btn_zoom_${dir}_normal`)}" alt=""><img class="p" src="${A(`da_btn_zoom_${dir}_pressed`)}" alt=""></button>`;
    return `<div class="ecmn${n.zoomShown ? ' zoom' : ''}"><div class="ecmn-map"><img class="ecmn-chev" src="${A('da_chevron')}" alt="" hidden><canvas class="ecmn-canvas"></canvas></div>
      <img class="ecmn-shadow" src="${A('da_top_bar_shadow')}" alt=""><div class="ecmn-top" data-action="ecmn-top">${topBar(c, n)}</div>
      ${n.muted ? `<img class="ecmn-mute" src="${A('da_mute_indicator')}" alt="">` : ''}
      <div class="ecmn-btns">${zoom('down')}${zoom('up')}</div>${statusBar(c, n)}</div>`;
  }
  // The map in Navigation: turned so the road ahead points up, tilted back, the chevron low on the screen.
  function drawNav(c, root) {
    const n = ns(c), canvas = root.querySelector('.ecmn-canvas');
    if (!canvas || !n) return;
    const pos = n.pos || {x: P().ME.x, y: P().ME.y, heading: 0};
    const view = {...P().st(c), x: pos.x, y: pos.y, z: n.overview ? 14 : n.zoom, route: n.route || null, hideMe: true};
    // Draw a larger square map, then turn it with CSS about the car.
    P().draw(c, canvas, view);
    const wrap = root.querySelector('.ecmn-map');
    wrap.style.setProperty('--rot', n.overview ? '0deg' : `${-pos.heading * 180 / Math.PI}deg`);
    wrap.classList.toggle('flat', !!n.overview);
    const chev = root.querySelector('.ecmn-chev');
    if (chev) chev.hidden = false;
  }
  function update(c) {
    const root = c.el.viewport, n = ns(c);
    if (!root.querySelector('.ecmn-canvas')) return;
    drawNav(c, root);
    const top = root.querySelector('.ecmn-top'), bar = root.querySelector('.ecmn-bar');
    if (top) top.innerHTML = topBar(c, n);
    if (bar) bar.outerHTML = statusBar(c, n);
  }
  function exitNav(c) {
    clearInterval(nav.drive); clearTimeout(nav.timer);
    c.ui.mpNav = null; c.back();
  }
  EC.register('maps-nav', {
    title: 'Navigation',
    render: renderNav,
    mount(c, root) {
      const n = ns(c);
      if (!n || n.list) return;
      drawNav(c, root);
      const chev = root.querySelector('.ecmn-chev');
      if (chev && !chev.complete) chev.addEventListener('load', () => drawNav(c, root), {once: true});
      root.querySelector('.ecmn-map')?.addEventListener('pointerdown', () => {
        n.zoomShown = true; root.querySelector('.ecmn')?.classList.add('zoom');
        clearTimeout(nav.zoomTimer); nav.zoomTimer = setTimeout(() => { n.zoomShown = false; c.el.viewport.querySelector('.ecmn')?.classList.remove('zoom'); }, 3000);
      });
    },
    action(name, el, event, c) {
      const n = ns(c);
      switch (name) {
        case 'ecmn-zoom': n.zoom = Math.max(13, Math.min(19, n.zoom + Number(el.dataset.dir))); n.overview = false; drawNav(c, c.el.viewport); return true;
        case 'ecmn-top': if (n.overview) { n.overview = false; c.render(); } return true;
      }
      return false;
    },
    menu(c) {
      const n = ns(c);
      if (!n) return false;
      const items = [
        {label: t('da_search_label'), icon: 'mp-da_ic_menu_search.png', action: () => chooseDestination(c)},
        {label: t('da_route_overview'), icon: 'mp-da_ic_menu_route_info.png', action: () => { n.overview = true; n.list = false; c.render(); }},
        {label: t('da_layers'), icon: 'mp-da_ic_menu_layers.png', action: () => navLayers(c)},
        n.muted ? {label: t('da_unmute'), icon: 'mp-da_ic_menu_unmute.png', action: () => { n.muted = false; c.render(); }} : {label: t('da_mute'), icon: 'mp-da_ic_menu_mute.png', action: () => { n.muted = true; c.render(); }},
        {label: t('da_exit_navigation'), icon: 'mp-da_ic_menu_close_clear_cancel.png', action: () => exitNav(c)},
        {label: t('da_show_list'), icon: 'mp-da_ic_menu_listview.png', action: () => { n.list = !n.list; c.render(); }},
        {label: t('da_change_destination'), action: () => chooseDestination(c)},
        n.mode === 'walk' ? {label: t('da_switch_to_driving'), action: () => { n.mode = 'drive'; n.loading = true; c.render(); setTimeout(() => reroute(c), 1200); }}
          : {label: t('da_switch_to_walking'), action: () => { n.mode = 'walk'; n.loading = true; c.render(); setTimeout(() => reroute(c), 1200); }},
        {label: t('da_help'), action: () => { c.ui.browserGo = 'http://www.google.com/mobile/navigation/help'; c.open('browser'); }},
        {label: t('da_terms_privacy_notices'), action: () => c.dialog({title: t('da_terms_privacy_notices'), icon: null, items: [t('da_terms_and_conditions'), t('da_privacy_policy'), t('da_legal_notices')],
          onItem: i => { c.ui.browserGo = ['http://m.google.com/tos', 'http://m.google.com/privacy', 'http://m.google.com/legalnotices'][i]; c.open('browser'); }})}];
      c.menu(items);
      return true;
    },
    back(c) {
      const n = ns(c);
      if (n?.list) { n.list = false; c.render(); return true; }
      if (n?.overview) { n.overview = false; c.render(); return true; }
      clearInterval(nav.drive); clearTimeout(nav.timer); c.ui.mpNav = null;
      return false;
    }
  });
  function chooseDestination(c) {
    c.searchDialog({icon: 'app-maps.png', hint: t('da_destination'), value: '',
      suggest: q => { const low = q.trim().toLocaleLowerCase(); return low ? P().PLACES.filter(p => p.name.toLocaleLowerCase().includes(low)).slice(0, 5).map(p => ({text1: p.name, text2: p.address, value: p.name})) : []; },
      onGo: q => {
        const low = q.trim().toLocaleLowerCase(), p = P().PLACES.find(x => x.name.toLocaleLowerCase().includes(low));
        if (!p) { c.toast(t('no_results')); return; }
        const n = ns(c); n.to = p; n.loading = true; n.list = false; c.render(); setTimeout(() => reroute(c), 1200);
      }});
  }
  // da_layer_dialog: Traffic, Satellite and the place layers; the check on the active ones.
  function navLayers(c) {
    const s = P().st(c);
    const items = [['da_layer_traffic', 'TRAFFIC_WIDGET_NAME', 'traffic'], ['da_layer_satellite', 'da_satellite', 'satellite']];
    const html = `<div class="ecmp-layers">${items.map(([icon, label, key], i) => `<button type="button" class="ecmp-layer" data-action="ecmn-layer" data-index="${i}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span>${esc(t(label))}</span>${s[key] ? '<i class="ecmp-licon ecmp-check" style="--cell:5"></i>' : ''}</button>`).join('<i class="ecmp-ldiv"></i>')}</div>`;
    c.dialog({title: t('da_layers'), icon: null, html, inverse: true, action(name, el) {
      if (name !== 'ecmn-layer') return false;
      const key = items[Number(el.dataset.index)][2]; s[key] = !s[key]; c.save(); c.closeDialog(); c.render(); return true;
    }});
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Street View.
  const sv = {};
  function street(c, p) {
    c.ui.mpStreet = {place: p, yaw: 0, step: 0, fov: 90, loading: true, compass: false};
    c.open('street-view');
    clearTimeout(sv.timer);
    sv.timer = setTimeout(() => { const s = c.ui.mpStreet; if (s) { s.loading = false; if (c.ui.view === 'street-view') c.render(); } }, 1400);
  }
  const house = (p, step) => { const m = /^(\d+)\s+(.*)$/.exec(p.address); return m ? `${Math.max(1, Number(m[1]) + step * 2)} ${m[2]}` : p.address; };
  // The panorama: a strip around the viewer (one column a degree, 4 px each), drawn once for each step.
  function panorama(p, step) {
    const key = `${p.id}:${step}`;
    if (sv.key === key) return sv.pano;
    const W = 1440, H = 480, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d'), hor = H * 0.5, camH = 2.4, road = 5, walk = 8.5, front = 10.5;
    let seed = [...key].reduce((a, ch) => a * 31 + ch.charCodeAt(0), 7) >>> 0;
    const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296);
    const sky = g.createLinearGradient(0, 0, 0, hor); sky.addColorStop(0, '#8fb4dc'); sky.addColorStop(1, '#e8eef4');
    g.fillStyle = sky; g.fillRect(0, 0, W, hor);
    for (let i = 0; i < 9; i++) { g.fillStyle = '#ffffffb0'; g.beginPath(); g.ellipse(rnd() * W, 40 + rnd() * 120, 60 + rnd() * 90, 12 + rnd() * 14, 0, 0, Math.PI * 2); g.fill(); }
    const ground = g.createLinearGradient(0, hor, 0, H); ground.addColorStop(0, '#9a9a96'); ground.addColorStop(1, '#5c5c5a'); g.fillStyle = ground; g.fillRect(0, hor, W, H - hor);
    const px = deg => deg / 360 * W, el = a => hor - a / (Math.PI / 2) * hor;   // elevation (radians) to y
    // Facades along both sides: for each column the building it looks at, its height and colour.
    const blocks = Array.from({length: 120}, () => ({h: 7 + rnd() * 14, color: ['#b9a58a', '#a7826b', '#c9c0ae', '#8f9aa3', '#bfae94', '#9d7d63', '#d2c8b6'][Math.floor(rnd() * 7)], w: 9 + rnd() * 9, tree: rnd() < 0.35}));
    const blockAt = along => { let x = -540, i = 0; while (x + blocks[i % 120].w < along) { x += blocks[i % 120].w; i++; } return {b: blocks[i % 120], x0: x, i}; };
    for (let col = 0; col < W; col++) {
      const th = col / W * Math.PI * 2, sn = Math.sin(th), cs = Math.cos(th);
      if (Math.abs(sn) < 0.02) continue;
      const side = sn > 0 ? 1 : -1, along = front / Math.tan(Math.abs(th) % Math.PI || 1e-3) * (sn > 0 ? 1 : 1);
      const dist = front / Math.abs(sn), alongPos = front * cs / Math.abs(sn) + side * 300;
      const {b, x0} = blockAt(alongPos);
      const top = Math.atan((b.h - camH) / dist), bottom = -Math.atan(camH / dist);
      g.fillStyle = b.color; g.fillRect(col, el(top), 1, el(bottom) - el(top));
      // windows: rows every 3 m, a gap at the block edges
      const inBlock = alongPos - x0;
      if (inBlock > 1 && inBlock < b.w - 1 && Math.floor(inBlock / 1.6) % 2 === 0) {
        g.fillStyle = '#3d4a57c0';
        for (let y = 2; y < b.h - 1.5; y += 3) { const a1 = Math.atan((y + 1.4 - camH) / dist), a2 = Math.atan((y - camH) / dist); g.fillRect(col, el(a1), 1, el(a2) - el(a1)); }
      }
      if (inBlock < 0.25) { g.fillStyle = '#00000040'; g.fillRect(col, el(top), 1, el(bottom) - el(top)); }
      // the pavement and the road below the facades
      const pave = -Math.atan(camH / (walk / Math.abs(sn))), kerb = -Math.atan(camH / (road / Math.abs(sn)));
      g.fillStyle = '#b5b1a8'; g.fillRect(col, el(bottom), 1, el(pave) - el(bottom));
      g.fillStyle = '#d6d2c8'; g.fillRect(col, el(pave), 1, el(kerb) - el(pave));
      // street trees in front of some blocks
      if (b.tree && Math.abs(inBlock - b.w / 2) < 1.6) { const td = (walk - 0.8) / Math.abs(sn), ttop = Math.atan((7 - camH) / td), tmid = Math.atan((3.2 - camH) / td), tb = -Math.atan(camH / td); g.fillStyle = '#4e6b33'; g.fillRect(col, el(ttop), 1, el(tmid) - el(ttop)); if (Math.abs(inBlock - b.w / 2) < 0.15) { g.fillStyle = '#4a3a2a'; g.fillRect(col, el(tmid), 1, el(tb) - el(tmid)); } }
    }
    // The road: asphalt between the kerbs (below the kerb line), the centre line dashes toward 0° and 180°.
    for (let col = 0; col < W; col++) {
      const th = col / W * Math.PI * 2, sn = Math.abs(Math.sin(th)), kerb = -Math.atan(camH / (road / Math.max(sn, 1e-3)));
      g.fillStyle = '#6d6d6b'; g.fillRect(col, el(kerb), 1, H - el(kerb));
    }
    sv.key = key; sv.pano = cv; return cv;
  }
  function drawStreet(c, root) {
    const s = c.ui.mpStreet, canvas = root.querySelector('.ecsv-canvas');
    if (!s || !canvas) return;
    const w = canvas.clientWidth, h = canvas.clientHeight, r = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(w * r)) { canvas.width = Math.round(w * r); canvas.height = Math.round(h * r); }
    const g = canvas.getContext('2d'); g.setTransform(r, 0, 0, r, 0, 0);
    const pano = panorama(s.place, s.step), PW = pano.width, PH = pano.height;
    // The visible slice: fov degrees wide, centred on yaw; the strip's height scaled to keep the horizon in the middle.
    const span = s.fov / 360 * PW, sx = ((s.yaw - s.fov / 2) / 360 * PW % PW + PW) % PW, k = w / span, sh = Math.min(PH, h / k), sy = PH / 2 - sh / 2;
    const part = (x, wpx, dx) => g.drawImage(pano, x, sy, wpx, sh, dx, 0, wpx * k, h);
    if (sx + span <= PW) part(sx, span, 0); else { part(sx, PW - sx, 0); part(0, span - (PW - sx), (PW - sx) * k); }
    // The yellow street line and its arrows, at 0° (forward) and 180° (back) when in view.
    const dp = P().DP();
    for (const [deg, dir] of [[0, 1], [180, -1]]) {
      let d = ((deg - s.yaw + 540) % 360) - 180;
      if (Math.abs(d) > s.fov / 2 + 20) continue;
      const x = w / 2 + d / s.fov * w, hor = h / 2;
      g.fillStyle = '#f7d62ccc'; g.beginPath(); g.moveTo(x - 1.5 * dp, hor); g.lineTo(x + 1.5 * dp, hor); g.lineTo(x + 30 * dp, h); g.lineTo(x - 30 * dp, h); g.closePath(); g.fill();
      // the arrow: a dark chevron with a light edge on the line
      const ay = hor + (h - hor) * (dir > 0 ? 0.42 : 0.75), aw = (dir > 0 ? 26 : 40) * dp;
      g.fillStyle = '#4a4a3acc'; g.strokeStyle = '#e8e6d8'; g.lineWidth = 1.5 * dp;
      g.beginPath(); g.moveTo(x, ay - aw * 0.5 * dir); g.lineTo(x + aw, ay + aw * 0.25 * dir); g.lineTo(x - aw, ay + aw * 0.25 * dir); g.closePath(); g.fill(); g.stroke();
    }
  }
  EC.register('street-view', {
    title: 'Street View',
    render(c) {
      const s = c.ui.mpStreet;
      if (!s) return '';
      const title = `<div class="ecsv-title npp-fw-title_bar"><i class="ec-bg np-fw-title_bar"></i><span class="ecsv-ttext">${esc(house(s.place, s.step))}</span>${s.loading ? `<span class="ecsv-load"><span>${esc(t('Street/loading'))}</span><img src="assets/fw-spinner_white_16.png" alt=""></span>` : ''}</div>`;
      return `<div class="ecsv">${title}<div class="ecsv-view">${s.loading ? '' : `<canvas class="ecsv-canvas"></canvas><img class="ecsv-logo" src="assets/sv-maps_google_logo.png" alt="">`}</div></div>`;
    },
    mount(c, root) {
      const s = c.ui.mpStreet, canvas = root.querySelector('.ecsv-canvas');
      if (!s || !canvas) return;
      drawStreet(c, root);
      let drag = null;
      canvas.addEventListener('pointerdown', e => { canvas.setPointerCapture(e.pointerId); drag = {x: e.clientX, y: e.clientY, yaw: s.yaw, moved: false}; });
      canvas.addEventListener('pointermove', e => {
        if (!drag) return;
        const dx = e.clientX - drag.x; if (Math.abs(dx) > 5) drag.moved = true;
        s.yaw = ((drag.yaw - dx / canvas.getBoundingClientRect().width * s.fov) % 360 + 360) % 360; drawStreet(c, root);
      });
      canvas.addEventListener('pointerup', e => {
        const was = drag; drag = null;
        if (!was || was.moved) return;
        // A tap on an arrow steps along the street.
        const r = canvas.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        if (y < 0.5) return;
        for (const [deg, dir] of [[0, 1], [180, -1]]) { const d = ((deg - s.yaw + 540) % 360) - 180; if (Math.abs(0.5 + d / s.fov - x) < 0.15) { stepStreet(c, dir * (s.yaw > 90 && s.yaw < 270 ? -1 : 1) * (deg ? -1 : 1)); return; } }
      });
    },
    menu(c) {
      const s = c.ui.mpStreet;
      c.menu([{label: t('Street/step_forward'), icon: 'sv-ic_menu_streetview_forward.png', action: () => stepStreet(c, 1)},
        {label: t('Street/step_backwards'), icon: 'sv-ic_menu_streetview_back.png', action: () => stepStreet(c, -1)},
        {label: t('Street/zoom'), icon: 'fw-ic_menu_zoom.png', action: () => { s.fov = s.fov === 90 ? 45 : 90; c.render(); }},
        {label: t('Street/go_to_map'), icon: 'fw-ic_menu_mapmode.png', action: () => { c.ui.mpStreet = null; c.back(); }},
        {label: t('Street/report_inappropriate_image'), icon: 'fw-ic_menu_report_image.png', action: () => { c.ui.browserGo = 'http://maps.google.com/support/bin/answer.py?answer=97437'; c.open('browser'); }},
        {label: t('Street/toggle_compass_mode'), icon: 'fw-ic_menu_compass.png', action: () => { s.compass = !s.compass; c.toast(t(s.compass ? 'Street/compass_mode_on' : 'Street/compass_mode_off')); }}]);
      return true;
    },
    back(c) { c.ui.mpStreet = null; return false; }
  });
  function stepStreet(c, d) {
    const s = c.ui.mpStreet;
    s.step += (s.yaw > 90 && s.yaw < 270) ? -d : d; s.loading = true; c.render();
    clearTimeout(sv.timer); sv.timer = setTimeout(() => { s.loading = false; if (c.ui.view === 'street-view') c.render(); }, 500);
  }
  EC.mapsNav = {start, street, active: c => !!c.ui.mpNav};
})();
