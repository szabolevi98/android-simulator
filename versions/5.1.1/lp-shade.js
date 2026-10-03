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
  function tileMarkup(tile, t) {
    const label = tile.raw ? tile.label : t(tile.label);
    const style = `left:${px(tile.left)};top:${px(tile.top)};width:${px(tile.width)};height:${px(tile.height)}`;
    const icon = `<span class="lp-qs-icon"><img src="${sysui(tile.icon)}" alt="">${tile.overlay ? `<img class="lp-qs-overlay" src="${sysui(tile.overlay)}" alt="">` : ''}</span>`;
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
  window.LPShade = {DP, CELL, clearDelays, tiles, layout, row, isExpanded, detail, render};
})();
