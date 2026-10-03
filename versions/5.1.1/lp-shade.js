/* Android 5.1 notification panel (SystemUI NotificationPanelView, StatusBarHeaderView, QSPanel, QSTileView, QSDetail)
   on the Nexus 6, after android-5.1.1_r26. One finger from the status bar opens the notifications under the 60 dp
   collapsed header; a second pull on the panel (or two fingers from the start) expands Quick Settings: the header grows
   to 116 dp with the larger clock, the settings button and the battery level, and the QSPanel slides in above the
   notifications. Tiles follow quick_settings_tiles_default (wifi, bt, inversion, cell, airplane, rotation, flashlight,
   location, cast, hotspot); Invert colors and Hotspot stay hidden until used, so Wi-Fi and Bluetooth form the dual first
   row and six single tiles follow. Notifications are the Material template: #FAFAFA cards with 2 dp corners, the 40 dp
   icon circle, 16 sp title, 14 sp text, 12 sp time. All sizes are dp x 0.906. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const DP = 0.906;
  // QSPanel: TILE_ASPECT 1.2, qs_tile_height 88 dp, qs_dual_tile_height 112 dp, 3 columns, the dual row underlaps by 8 dp.
  const CELL = {h: 88, w: 88 * 1.2, dualH: 112, dualW: 112 * 1.2, underlap: 8, brightness: 60, brightnessTop: 6};
  const PANEL_WIDTH = 411.43 - 2 * 8; // notification_side_padding on both sides
  const sysui = name => `assets/lp-sysui-${name}.svg`;
  // Clear-all (NotificationStackScrollLayout.dismissViewAnimated): rows fly out right one after another.
  function clearDelays(count) {
    const delays = []; let current = 140, total = 0;
    for (let i = 0; i < count; i++) { delays.push(total); current = Math.max(50, current - 10); total += current; }
    return delays;
  }
  function tiles(settings, {carrier}) {
    const wifiConnected = settings.wifi && settings.wifiNetwork && !settings.airplane;
    const location = settings.locationAccess !== false && !!(settings.gps || settings.networkLocation);
    const list = [
      {id: 'wifi', dual: true, on: !!settings.wifi && !settings.airplane, icon: !settings.wifi || settings.airplane ? 'ic_qs_wifi_disabled' : wifiConnected ? 'ic_qs_wifi_full_4' : 'ic_qs_wifi_0', label: wifiConnected ? settings.wifiNetwork : 'Wi-Fi', raw: !!wifiConnected},
      {id: 'bluetooth', dual: true, on: !!settings.bluetooth, icon: !settings.bluetooth ? 'ic_qs_bluetooth_off' : settings.pairedDevice ? 'ic_qs_bluetooth_connected' : 'ic_qs_bluetooth_on', label: settings.bluetooth && settings.pairedDevice ? settings.pairedDevice : 'Bluetooth', raw: !!(settings.bluetooth && settings.pairedDevice)},
      {id: 'cell', on: !settings.airplane, icon: settings.airplane ? 'ic_qs_signal_disabled' : 'ic_qs_signal_full_4', overlay: !settings.airplane && settings.dataEnabled !== false && !wifiConnected ? 'ic_qs_signal_lte' : '', label: settings.airplane ? 'Emergency Calls Only' : carrier, raw: !settings.airplane},
      // AnimationIcon start states: *_enable shows the off icon, *_disable the on icon.
      {id: 'airplane', on: !!settings.airplane, icon: settings.airplane ? 'ic_signal_airplane_disable' : 'ic_signal_airplane_enable', label: 'Airplane mode'},
      {id: 'rotation', on: settings.rotate !== false, icon: settings.rotate !== false ? 'ic_portrait_from_auto_rotate' : 'ic_portrait_to_auto_rotate', label: settings.rotate !== false ? 'Auto-rotate' : 'Portrait'},
      {id: 'flashlight', on: !!settings.flashlight, icon: settings.flashlight ? 'ic_signal_flashlight_disable' : 'ic_signal_flashlight_enable', label: 'Flashlight'},
      {id: 'location', on: location, icon: location ? 'ic_signal_location_disable' : 'ic_signal_location_enable', label: 'Location'},
      {id: 'cast', on: !!settings.wifiDisplay, icon: settings.wifiDisplay ? 'ic_qs_cast_on' : 'ic_qs_cast_off', label: 'Cast screen'}
    ];
    if (settings.inversionUsed) list.splice(2, 0, {id: 'inversion', on: !!settings.inversion, icon: settings.inversion ? 'ic_invert_colors_disable' : 'ic_invert_colors_enable', label: 'Invert colors'});
    if (settings.hotspotUsed) list.push({id: 'hotspot', on: !!settings.portableHotspot, icon: settings.portableHotspot ? 'ic_hotspot_disable' : 'ic_hotspot_enable', label: 'Hotspot'});
    // QSTile.AnimationIcon: each state shows its own AnimatedVectorDrawable, at its end frame unless the user just
    // toggled it (AirplaneModeTile, FlashlightTile, LocationTile, ColorInversionTile, HotspotTile: *_enable_animation
    // when on, *_disable_animation when off; RotationLockTile: portrait_to_auto when unlocked, portrait_from_auto when locked).
    const AVD = {airplane: 'ic_signal_airplane', flashlight: 'ic_signal_flashlight', location: 'ic_signal_location', inversion: 'ic_invert_colors', hotspot: 'ic_hotspot'};
    for (const tile of list) {
      if (AVD[tile.id]) tile.avd = `${AVD[tile.id]}_${tile.on ? 'enable' : 'disable'}_animation`;
      if (tile.id === 'rotation') tile.avd = tile.on ? 'ic_portrait_to_auto_rotate_animation' : 'ic_portrait_from_auto_rotate_animation';
    }
    return list;
  }
  // QSPanel.onMeasure/onLayout: rows never mix dual and single tiles; columns get equal gaps around them.
  function layout(list) {
    let r = -1, c = -1, rowDual = false;
    const placed = list.map(tile => {
      if (r === -1 || c === 2 || rowDual !== !!tile.dual) { r++; c = 0; rowDual = !!tile.dual; } else c++;
      return {...tile, row: r, col: c};
    });
    const rows = r + 1;
    return placed.map(tile => {
      const cols = placed.filter(other => other.row === tile.row).length, cw = tile.row === 0 ? CELL.dualW : CELL.w;
      const extra = (PANEL_WIDTH - cw * cols) / (cols + 1);
      const top = CELL.brightness + CELL.brightnessTop + (tile.row === 0 ? 0 : CELL.dualH - CELL.underlap + (tile.row - 1) * CELL.h);
      return {...tile, left: tile.col * cw + (tile.col + 1) * extra, top, width: cw, height: tile.row === 0 ? CELL.dualH : CELL.h, rows};
    });
  }
  function panelHeight(list) {
    const rows = Math.max(...list.map(tile => tile.row)) + 1;
    return CELL.brightness + CELL.brightnessTop + CELL.dualH - CELL.underlap + (rows - 1) * CELL.h + 8;
  }
  const px = dp => `${(dp * DP).toFixed(2)}px`;
  let avdSerial = 0;
  // Starts the animated icon of a tile the user just toggled where it is (a re-render picks it up), and parks every
  // other one on its end frame.
  // started: {tile id: performance.now() of its toggle}
  function playIcons(root, started) {
    for (const svg of root.querySelectorAll('svg[data-avd]')) {
      const total = (window.LPQSIcons?.[svg.dataset.avd]?.duration || 0) / 1000, tile = svg.closest('[data-qs]')?.dataset.qs;
      const elapsed = started?.[tile] !== undefined ? (performance.now() - started[tile]) / 1000 : Infinity;
      try { if (elapsed < total) { svg.setCurrentTime(elapsed); svg.unpauseAnimations(); } else { svg.pauseAnimations(); svg.setCurrentTime(total + 1); } } catch {}
    }
  }
  function tileMarkup(tile, t) {
    const label = tile.raw ? tile.label : t(tile.label);
    const style = `left:${px(tile.left)};top:${px(tile.top)};width:${px(tile.width)};height:${px(tile.height)}`;
    const avd = tile.avd && window.LPQSIcons?.[tile.avd];
    const serial = avd ? ++avdSerial : 0;
    const art = avd ? avd.svg.replace(/(id="|url\(#)([^"\)]+)/g, `$1$2-${serial}`).replace('<svg ', `<svg data-avd="${tile.avd}" `) : `<img src="${sysui(tile.icon)}" alt="">`;
    const icon = `<span class="lp-qs-icon">${art}${tile.overlay ? `<img class="lp-qs-overlay" src="${sysui(tile.overlay)}" alt="">` : ''}</span>`;
    if (tile.dual) return `<div class="lp-qs-tile dual${tile.on ? ' on' : ''}" data-qs="${tile.id}" style="${style}"><button class="lp-qs-top" data-action="lp-qs-toggle" data-id="${tile.id}" aria-label="${e(label)}" aria-pressed="${!!tile.on}">${icon}</button><span class="lp-qs-divider"></span><button class="lp-qs-dual-label" data-action="lp-qs-detail" data-id="${tile.id}" data-no-translate><span>${e(label)}</span><img src="${sysui('qs_dual_tile_caret')}" alt=""></button></div>`;
    return `<div class="lp-qs-tile${tile.on ? ' on' : ''}" data-qs="${tile.id}" style="${style}"><button class="lp-qs-top" data-action="lp-qs-toggle" data-id="${tile.id}" aria-label="${e(label)}" aria-pressed="${!!tile.on}">${icon}<span class="lp-qs-label" data-no-translate>${e(label)}</span></button></div>`;
  }
  // BatteryMeterView at 9.5 x 14.5 dp, the same drawing as the status bar's.
  const battery = level => `<svg class="kk-battery" viewBox="0 0 9.5 14.5" aria-hidden="true"><path d="M2.375 0h4.75v1.74h-4.75zM0 1.74h9.5V14.5H0z" fill="#fff" fill-opacity=".4"/><rect x="0" y="${(1.74 + 12.76 * (1 - level / 100)).toFixed(2)}" width="9.5" height="${(12.76 * level / 100).toFixed(2)}" fill="${level <= 15 ? '#f4511e' : '#fff'}"/></svg>`;
  // Material notification template (notification_template_material_base, 64 dp) and its expanded big-text form.
  function row(note, t, locale, expanded) {
    const time = note.time ? new Date(note.time).toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit'}) : '';
    const big = note.big || note.detail;
    const actions = expanded && note.actions?.length ? `<div class="lp-note-actions">${note.actions.map(action => `<button data-action="notification-action" data-id="${e(note.id)}" data-note-action="${e(action.id)}">${action.icon ? `<img src="assets/${e(action.icon)}" alt="">` : ''}${e(t(action.label))}</button>`).join('')}</div>` : '';
    const icon = note.largeIcon ? `<span class="lp-note-icon large"><img src="assets/${e(note.largeIcon)}" alt=""></span><span class="lp-note-badge" style="background:${e(note.color || '#9e9e9e')}"><img src="assets/${e(note.smallIcon)}" alt=""></span>` : `<span class="lp-note-icon" style="background:${e(note.color || '#9e9e9e')}"><img src="assets/${e(note.smallIcon)}" alt=""></span>`;
    return `<div class="notification jb-note lp-note${expanded ? ' expanded' : ''}" data-id="${e(note.id)}"><button class="jb-note-main" data-action="notification-open" data-id="${e(note.id)}">${icon}<span class="lp-note-body"><span class="lp-note-top"><strong data-no-translate>${e(t(note.title))}</strong><time>${e(time)}</time></span><span class="lp-note-text" data-no-translate>${e(t(expanded ? big : note.detail))}</span></span></button>${actions}</div>`;
  }
  function isExpanded(note, index, ui) {
    const choice = ui.noteExpanded?.[note.id];
    return choice === undefined ? index === 0 && !!(note.big || note.actions?.length) : choice;
  }
  /* QSDetail for Wi-Fi and Bluetooth: the title and its switch in the header, the items (saved networks / paired
     devices) with the 24 dp icon, the accent "Connected" summary and the X, then MORE SETTINGS and DONE. */
  function detail(id, settings, t, {networks = []} = {}) {
    if (id === 'wifi') {
      const on = !!settings.wifi && !settings.airplane;
      const items = on ? networks.map(net => ({key: net.name, icon: 'ic_qs_wifi_full_' + Math.min(4, net.strength || 4), title: net.name, summary: settings.wifiNetwork === net.name ? t('Connected') : '', connected: settings.wifiNetwork === net.name})).sort((a, b) => b.connected - a.connected) : [];
      return {title: t('Wi-Fi'), on, items, empty: on ? t('No saved networks available') : t('Wi-Fi Off'), emptyIcon: on ? 'ic_qs_wifi_detail_empty' : 'ic_qs_wifi_detail_empty'};
    }
    const on = !!settings.bluetooth;
    const items = on && settings.pairedDevice ? [{key: settings.pairedDevice, icon: 'ic_qs_bluetooth_connected', title: settings.pairedDevice, summary: t('Connected'), connected: true}] : [];
    return {title: t('Bluetooth'), on, items, empty: on ? t('No paired devices available') : t('Bluetooth Off'), emptyIcon: 'ic_qs_bluetooth_detail_empty'};
  }
  function detailMarkup(id, spec, t) {
    const list = spec.items.length ? spec.items.map(item => `<div class="lp-qsd-item"><button class="lp-qsd-item-main" data-action="lp-qsd-item" data-id="${e(id)}" data-key="${e(item.key)}"><img src="${sysui(item.icon)}" alt=""><span><b data-no-translate>${e(item.title)}</b>${item.summary ? `<small>${e(item.summary)}</small>` : ''}</span></button>${item.connected ? `<button class="lp-qsd-x" data-action="lp-qsd-disconnect" data-id="${e(id)}" aria-label="${e(t('Disconnect'))}"><img src="${sysui('ic_qs_cancel')}" alt=""></button>` : ''}</div>`).join('')
      : `<div class="lp-qsd-empty"><img src="${sysui(spec.emptyIcon)}" alt=""><span>${e(spec.empty)}</span></div>`;
    return `<div class="lp-qs-detail" data-detail="${e(id)}"><div class="lp-qsd-items">${list}</div><div class="lp-qsd-buttons"><button data-action="lp-qsd-more" data-id="${e(id)}">${e(t('More settings'))}</button><button data-action="lp-qsd-done">${e(t('Done'))}</button></div></div>`;
  }
  function render(data, ui, t, {locale, clock, date, shortDate, carrier, alarm, battery: level = 71, statusIcons = '', extra = '', networks = []}) {
    const notes = data.notifications || [], qs = !!ui.shadeSettings, list = layout(tiles(data.settings, {carrier}));
    const det = qs && ui.qsDetail ? detail(ui.qsDetail, data.settings, t, {networks}) : null;
    const header = `<div class="shade-top lp-header${qs ? ' expanded' : ''}${det ? ' detail' : ''}">
      <div class="lp-header-icons">${statusIcons}<span class="lp-battery-level">${level}%</span></div>
      <button class="lp-header-settings" data-action="qs-settings" aria-label="${e(t('Settings'))}"><img src="${sysui('ic_settings')}" alt=""></button>
      <button class="lp-header-user" data-action="lp-qs-user" aria-label="${e(t('Switch user'))}"><img src="assets/lp-fw-ic_account_circle.svg" alt=""></button>
      <button class="lp-header-clock" data-action="lp-qs-expand" aria-label="${e(t('Quick settings.'))}"><span class="lp-header-time">${e(clock)}</span></button>
      <div class="lp-header-date"><span class="lp-date-expanded">${e(qs && alarm ? shortDate : date)}</span>${qs && alarm ? `<button class="lp-header-alarm" data-action="qs-alarm"><img src="${sysui('ic_access_alarms_small')}" alt="">${e(alarm)}</button>` : ''}</div>
      ${det ? `<div class="lp-qsd-header"><span>${e(det.title)}</span><button class="lp-switch${det.on ? ' on' : ''}" data-action="lp-qsd-switch" data-id="${e(ui.qsDetail)}" role="switch" aria-checked="${det.on}" aria-label="${e(det.title)}"><i></i></button></div>` : ''}
    </div>`;
    const qsPanel = `<div class="lp-qs" style="--qs-h:${px(panelHeight(list))}" ${qs ? '' : 'inert aria-hidden="true"'}><div class="lp-qs-brightness"><input type="range" min="10" max="100" value="${data.settings.brightness}" data-field="brightness" aria-label="${e(t('Brightness'))}" style="--v:${((data.settings.brightness - 10) / 90 * 100).toFixed(1)}%"></div>${list.map(tile => tileMarkup(tile, t)).join('')}${det ? detailMarkup(ui.qsDetail, det, t) : ''}</div>`;
    const rows = notes.map((note, index) => row(note, t, locale, isExpanded(note, index, ui))).join('');
    const dismiss = notes.some(note => !note.ongoing) ? `<div class="lp-dismiss"><button class="jb-shade-clear" data-action="clear-notifications" aria-label="${e(t('Clear all notifications.'))}"><i></i><i></i><i></i></button></div>` : '';
    return `<div class="notification-shade lp-shade${qs ? ' show-settings qs-open' : ''}" role="dialog" aria-label="${e(t(qs ? 'Quick settings.' : 'Notification shade.'))}">${header}<div class="lp-shade-scroll">${qsPanel}${extra}<div class="lp-notes">${rows}${dismiss}</div></div></div>`;
  }
  /* Panel expansion, after NotificationPanelView / NotificationStackScrollLayout.setStackHeight / StackScrollAlgorithm at
     android-5.1.1_r26. While the panel is shorter than the stack's padding plus its minimum height (64 dp card + 12 dp
     bottom peek + 8 dp second-card padding), the whole stack is pulled up with a small parallax and the header follows at
     1 / 2.05 of that offset, so both slide in from above. The cards that do not fit gather in the bottom stack: one
     transitioning card, then up to three 12 dp peeking edges (PiecewiseLinearIndentationFunctor, half linear), the rest
     hidden behind them; the first card always shows and is cut to the space above the peek. */
  const STACK = {collapsed: 64 * DP, peek: 12 * DP, slowDown: 12 * DP, secondCard: 8 * DP, maxBottom: 3, headerRubber: 2.05};
  function indentation(items, distance, peek) {
    const base = [0, 4 / 5, 1]; // initBaseValues for three items: cumulative squares 4 and 1 over 5
    if (items < 0) return 0;
    if (items >= STACK.maxBottom) return distance + peek;
    const below = Math.floor(items), part = items - below;
    if (below === 0) return distance * part;
    const progress = base[below - 1] * (1 - part) + base[below] * part;
    return distance + (progress * .5 + (items - 1) / (STACK.maxBottom - 1) * .5) * peek;
  }
  // Natural layout of the open panel, measured once per panel with every transform cleared.
  function measure(shade) {
    if (shade._lpLayout) return shade._lpLayout;
    const header = shade.querySelector('.lp-header'), scroll = shade.querySelector('.lp-shade-scroll');
    const children = [...shade.querySelectorAll('.lp-notes > .lp-note, .lp-notes > .lp-dismiss')];
    for (const node of [header, ...children]) if (node) { node.style.transform = ''; node.style.clipPath = ''; node.style.opacity = ''; }
    const previous = [shade.style.height, shade.style.bottom]; shade.style.height = ''; shade.style.bottom = '';
    const top = shade.getBoundingClientRect().top;
    const items = children.map(node => { const r = node.getBoundingClientRect(); return {node, top: r.top - top, height: r.height}; });
    const first = items[0], gap = items.length > 1 ? Math.max(0, items[1].top - first.top - first.height) : 2 * DP;
    const padding = first ? first.top : (header?.offsetHeight || 0);
    const end = items.length ? items[items.length - 1].top + items[items.length - 1].height + 7.25 : padding;
    const max = Math.min(shade.clientHeight, Math.max(end, header?.offsetHeight || 0));
    [shade.style.height, shade.style.bottom] = previous;
    return (shade._lpLayout = {header, scroll, items, gap, padding, max, qs: shade.classList.contains('qs-open')});
  }
  function maxHeight(shade) { return measure(shade).max; }
  // PanelView.runPeekAnimation: a tap on the status bar opens the panel to NotificationStackScrollLayout.getPeekHeight
  // (the stack's padding, a 64 dp card, the 12 dp bottom peek and 8 dp) in 250 ms with linear_out_slow_in.
  function peek(shade, scrim, done) {
    const L = measure(shade), height = Math.min(L.max, L.padding + STACK.collapsed + STACK.peek + STACK.secondCard);
    animate(shade, 0, height, {scrim, done, timing: {duration: 250, curve: CURVES.linearOutSlowIn}});
  }
  // NotificationPanelView.setExpandedHeight for the shade (not Quick Settings): clip, stack, header and the scrim.
  function expand(shade, height, scrim) {
    const L = measure(shade), E = Math.max(0, height);
    shade.style.bottom = 'auto'; shade.style.height = `${E.toFixed(2)}px`;
    if (scrim) {
      // ScrimController.updateScrimNormal: starts 20 % down, eased by 1 - (1 - cos(pi (1 - f)^2)) / 2, up to 62 %.
      const f = Math.min(1, L.max ? E / L.max : 1) * 1.2 - .2;
      scrim.style.opacity = f <= 0 ? '0' : (1 - .5 * (1 - Math.cos(Math.PI * Math.pow(1 - f, 2)))).toFixed(3);
    }
    if (L.qs || !L.items.length) { if (L.header) L.header.style.transform = ''; return; }
    const minStack = STACK.collapsed + STACK.peek + STACK.secondCard;
    let translation = 0, stackHeight = E;
    if (E - L.padding < minStack) {
      const partially = Math.max(0, (E - L.padding) / minStack);
      translation = E - minStack + (1 - partially) * (STACK.peek + STACK.secondCard) - L.padding;
      stackHeight = E - translation;
    }
    if (L.header) L.header.style.transform = translation < 0 ? `translateY(${(translation / STACK.headerRubber).toFixed(2)}px)` : '';
    const inner = stackHeight - L.padding, g = L.gap, scrollTop = L.scroll?.scrollTop || 0;
    const bottomPeekStart = inner - STACK.peek, bottomStackStart = bottomPeekStart - (STACK.slowDown + g);
    let current = 0, inBottom = 0, partial = 0;
    L.items.forEach((item, i) => {
      const h = item.height;
      let top, cut = h, alpha = 1;
      if (i === 0) current = Math.min(0, bottomStackStart);
      const next = current + h + g;
      if (next >= bottomStackStart) {
        if (current >= bottomStackStart) {
          inBottom += 1;
          if (inBottom < STACK.maxBottom) top = bottomStackStart + indentation(inBottom, STACK.slowDown + g, STACK.peek) - g - h;
          else { top = inner - h; alpha = inBottom > STACK.maxBottom + 2 ? 0 : inBottom > STACK.maxBottom + 1 ? 1 - partial : 1; }
        } else {
          partial = 1 - (bottomStackStart - current) / (h + g);
          inBottom += partial;
          top = bottomStackStart + indentation(partial, STACK.slowDown + g, STACK.peek) - h - g;
        }
        top = Math.max(top, STACK.collapsed - h);
      } else top = Math.min(current, inner - STACK.peek - STACK.secondCard - h);
      if (i === 0) {
        top = 0;
        if (h > bottomPeekStart - STACK.secondCard) cut = Math.max(bottomPeekStart - STACK.secondCard, Math.min(h, STACK.collapsed));
      }
      current = top + h + g;
      const shift = L.padding + translation + top - (item.top - scrollTop);
      item.node.style.transform = Math.abs(shift) > .01 ? `translateY(${shift.toFixed(2)}px)` : '';
      item.node.style.clipPath = cut < h - .01 ? `inset(0 0 ${(h - cut).toFixed(2)}px 0 round 1.8px)` : '';
      item.node.style.opacity = alpha < 1 ? alpha.toFixed(3) : '';
      // updateZValuesForState: cards deeper in the bottom stack sit lower, under the first card.
      item.node.style.zIndex = String(L.items.length - i);
    });
  }
  // FlingAnimationUtils (NotificationPanelView: 0.4 s at most, scaled by the square root of distance / panel height).
  const ease = (x1, y1, x2, y2) => x => { const at = (a, b, t) => 3 * a * (1 - t) * (1 - t) * t + 3 * b * (1 - t) * t * t + t * t * t; let lo = 0, hi = 1; for (let i = 0; i < 24; i++) { const mid = (lo + hi) / 2; if (at(x1, x2, mid) < x) lo = mid; else hi = mid; } return at(y1, y2, (lo + hi) / 2); };
  const CURVES = {linearOutSlowIn: ease(0, 0, .35, 1), fastOutSlowIn: ease(.4, 0, .2, 1), fastOutLinearIn: ease(.4, 0, 1, 1)};
  function flingTiming(from, to, velocity, panel) {
    const diff = Math.abs(to - from), v = Math.abs(velocity || 0), minV = 250 * DP, maxLen = .4 * Math.sqrt(diff / Math.max(1, panel));
    if (to > from) {
      const d = v ? diff / v / .35 : Infinity;
      if (d <= maxLen) return {duration: d * 1000, curve: CURVES.linearOutSlowIn};
      return {duration: maxLen * 1000, curve: v >= minV ? CURVES.linearOutSlowIn : CURVES.fastOutSlowIn};
    }
    // applyDismissing: linear-out-faster-in whose y2 grows from 0.4 to 0.5 with the velocity.
    const y2 = Math.min(.5, Math.max(.4, .4 + (v - minV) / (3000 * DP - minV) * .1)), d = v ? (y2 / .5) * diff / v : Infinity;
    if (d <= maxLen) return {duration: d * 1000, curve: ease(0, 0, .5, y2)};
    // A canned collapse (no finger velocity) runs at 0.6 of the length (getCannedFlingDurationFactor).
    return {duration: maxLen * 1000 * (v ? 1 : .6), curve: v >= minV ? CURVES.linearOutSlowIn : CURVES.fastOutLinearIn};
  }
  function animate(shade, from, to, {velocity = 0, scrim = null, done, timing} = {}) {
    if (shade._lpAnim) cancelAnimationFrame(shade._lpAnim);
    const {duration, curve} = timing || flingTiming(from, to, velocity, shade.closest('.screen')?.clientHeight || 1);
    const start = performance.now();
    const step = now => {
      const t = Math.min(1, (now - start) / Math.max(1, duration));
      expand(shade, from + (to - from) * curve(t), scrim);
      if (t < 1) shade._lpAnim = requestAnimationFrame(step); else { shade._lpAnim = 0; done?.(); }
    };
    expand(shade, from, scrim);
    shade._lpAnim = requestAnimationFrame(step);
  }
  // Back to the panel's own layout once it is fully open.
  function settle(shade, scrim) {
    if (shade._lpAnim) cancelAnimationFrame(shade._lpAnim);
    shade._lpAnim = 0;
    shade.style.removeProperty('height'); shade.style.removeProperty('bottom'); scrim?.style.removeProperty('opacity');
    const L = shade._lpLayout; if (!L) return;
    for (const node of [L.header, ...L.items.map(item => item.node)]) if (node) { node.style.transform = ''; node.style.clipPath = ''; node.style.opacity = ''; node.style.zIndex = ''; }
    shade._lpLayout = null;
  }
  window.LPShade = {DP, CELL, clearDelays, tiles, layout, row, isExpanded, detail, render, expand, animate, settle, maxHeight, playIcons, peek};
})();
