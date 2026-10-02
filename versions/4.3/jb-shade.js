/* Android 4.3 phone notification panel (SystemUI PhoneStatusBar, flip settings and QuickSettings). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // PhoneStatusBar.FLIP_DURATION_OUT / FLIP_DURATION_IN.
  const FLIP_OUT = 125, FLIP_IN = 225;
  // Clear-all: rows leave one after another, the gap starting at 140 ms and shrinking by 10 ms (minimum 50 ms).
  function clearDelays(count) {
    const delays = []; let current = 140, total = 0;
    for (let i = 0; i < count; i++) { delays.push(total); current = Math.max(50, current - 10); total += current; }
    return delays;
  }
  /* QuickSettings.setupQuickSettings for phones: user, brightness, settings, Wi-Fi, mobile signal, battery,
     airplane mode, Bluetooth, then the temporary alarm and location tiles. No rotation tile on phones. */
  function tiles(settings, {carrier, alarm, battery = 71}) {
    const wifiConnected = settings.wifi && settings.wifiNetwork && !settings.airplane;
    const list = [
      {id: 'user', icon: 'ic_qs_default_user', label: 'Me', action: 'qs-user'},
      {id: 'brightness', icon: settings.autoBrightness ? 'ic_qs_brightness_auto_on' : 'ic_qs_brightness_auto_off', label: 'Brightness', action: 'qs-brightness'},
      {id: 'settings', icon: 'ic_qs_settings', label: 'Settings', action: 'qs-settings'},
      {id: 'wifi', icon: !settings.wifi || settings.airplane ? 'ic_qs_wifi_no_network' : wifiConnected ? 'ic_qs_wifi_full_4' : 'ic_qs_wifi_0', label: !settings.wifi || settings.airplane ? 'Wi-Fi Off' : wifiConnected ? settings.wifiNetwork : 'Wi-Fi', raw: !!wifiConnected, action: 'qs-wifi', toggle: 'wifi'},
      {id: 'rssi', icon: settings.airplane ? 'ic_qs_signal_no_signal' : 'ic_qs_signal_full_4', overlay: settings.airplane || !settings.dataEnabled ? '' : 'ic_qs_signal_full_h', label: settings.airplane ? 'No service.' : carrier, raw: !settings.airplane, action: 'qs-rssi'},
      {id: 'battery', icon: 'ic_qs_battery_71', label: `${battery}%`, raw: true, action: 'qs-battery'},
      {id: 'airplane', icon: settings.airplane ? 'ic_qs_airplane_on' : 'ic_qs_airplane_off', label: 'Airplane mode', action: 'qs-airplane', pressed: !!settings.airplane},
      {id: 'bluetooth', icon: !settings.bluetooth ? 'ic_qs_bluetooth_off' : settings.pairedDevice ? 'ic_qs_bluetooth_on' : 'ic_qs_bluetooth_not_connected', label: !settings.bluetooth ? 'Bluetooth Off' : settings.pairedDevice || 'Bluetooth', raw: !!(settings.bluetooth && settings.pairedDevice), action: 'qs-bluetooth', toggle: 'bluetooth'}
    ];
    if (alarm) list.push({id: 'alarm', icon: 'ic_qs_alarm_on', label: alarm, raw: true, action: 'qs-alarm'});
    if (settings.gps) list.push({id: 'location', icon: 'ic_qs_location', label: 'Location in use', action: 'qs-location'});
    // Wifi Display tile: setShowWhenEnabled, so it appears only while wireless display is on (Nexus 4 enables the feature).
    if (settings.wifiDisplay && settings.wifi && !settings.airplane) list.push({id: 'wifi-display', icon: 'ic_qs_remote_display', label: 'Wireless Display', action: 'qs-wifi-display'});
    return list;
  }
  function tileMarkup(tile, t) {
    const label = tile.raw ? tile.label : t(tile.label);
    return `<button class="jb-qs-tile${tile.pressed ? ' on' : ''}" data-action="${tile.action}" data-qs="${tile.id}" ${tile.toggle ? `data-qs-toggle="${tile.toggle}"` : ''} aria-label="${e(label)}"><span class="jb-qs-icon"><img src="assets/jb-${tile.icon}.png" alt="">${tile.overlay ? `<img class="jb-qs-overlay" src="assets/jb-${tile.overlay}.png" alt="">` : ''}</span><span class="jb-qs-label" data-no-translate>${e(label)}</span></button>`;
  }
  // Notification template: 64dp large icon, title, text, time and the small icon; the expanded form adds big text and actions.
  function row(note, t, locale, expanded) {
    const time = note.time ? new Date(note.time).toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit'}) : '';
    const big = note.big || note.detail;
    const actions = expanded && note.actions?.length ? `<div class="jb-note-actions">${note.actions.map(action => `<button data-action="notification-action" data-id="${e(note.id)}" data-note-action="${e(action.id)}"><img src="assets/${e(action.icon)}" alt="">${e(t(action.label))}</button>`).join('')}</div>` : '';
    return `<div class="notification jb-note${expanded ? ' expanded' : ''}" data-id="${e(note.id)}"><button class="jb-note-main" data-action="notification-open" data-id="${e(note.id)}"><span class="jb-note-icon"><img src="assets/${e(note.icon || 'settings.png')}" alt=""></span><span class="jb-note-body"><span class="jb-note-top"><strong data-no-translate>${e(t(note.title))}</strong><time>${e(time)}</time></span><span class="jb-note-text" data-no-translate>${e(t(expanded ? big : note.detail))}</span><img class="jb-note-small" src="assets/${e(note.smallIcon || note.icon || 'settings.png')}" alt=""></span></button>${actions}</div>`;
  }
  // The newest notification is shown expanded, as NotificationRowLayout does for the top item.
  function isExpanded(note, index, ui) {
    const choice = ui.noteExpanded?.[note.id];
    return choice === undefined ? index === 0 && !!(note.big || note.actions?.length) : choice;
  }
  function render(data, ui, t, {locale, clock, date, carrier, alarm, extra = ''}) {
    const notes = data.notifications || [], qs = !!ui.shadeSettings;
    return `<div class="notification-shade jb-shade${qs ? ' show-settings' : ''}"><div class="shade-top jb-shade-header"><div class="jb-shade-datetime"><span class="jb-shade-clock">${e(clock)}</span><span class="jb-shade-date">${e(date)}</span></div><button class="jb-shade-clear" data-action="clear-notifications" aria-label="${e(t('Clear all notifications.'))}" ${notes.length && !qs ? '' : 'hidden'}><img src="assets/jb-ic_notify_clear_normal.png" alt=""></button><button class="jb-shade-flip" data-action="shade-flip" aria-label="${e(t(qs ? 'Notifications.' : 'Quick settings.'))}"><img class="jb-flip-settings" src="assets/jb-ic_notify_settings_normal.png" alt=""><img class="jb-flip-notifications" src="assets/jb-ic_notifications_normal.png" alt=""></button></div><div class="jb-shade-pages"><div class="shade-list jb-shade-list">${extra}${notes.map((note, index) => row(note, t, locale, isExpanded(note, index, ui))).join('')}</div><div class="jb-qs" role="group" aria-label="${e(t('Quick settings.'))}">${tiles(data.settings, {carrier, alarm}).map(tile => tileMarkup(tile, t)).join('')}</div></div><div class="shade-carrier jb-shade-carrier">${e(carrier)}</div><button class="shade-handle" data-action="close-overlay" aria-label="Close notifications"><img src="assets/status_bar_close_on.png" alt=""></button></div>`;
  }
  // Card flip between notifications and quick settings: the visible page squashes horizontally, then the other grows.
  function flip(shade, toSettings, reduced = false) {
    const pages = shade?.querySelector('.jb-shade-pages');
    if (!pages) return;
    const out = pages.querySelector(toSettings ? '.jb-shade-list' : '.jb-qs'), inn = pages.querySelector(toSettings ? '.jb-qs' : '.jb-shade-list');
    shade.classList.toggle('show-settings', toSettings);
    if (reduced || !out?.animate) return;
    out.style.visibility = 'visible';
    out.animate([{transform: 'scaleX(1)'}, {transform: 'scaleX(0)'}], {duration: FLIP_OUT, easing: 'cubic-bezier(.55,0,1,.45)', fill: 'both'}).finished.then(animation => { out.style.visibility = ''; animation.effect.target.getAnimations().forEach(a => a.cancel()); }, () => {});
    inn.animate([{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: FLIP_IN, delay: FLIP_OUT, easing: 'cubic-bezier(0,.55,.45,1)', fill: 'backwards'});
  }
  window.JBShade = {FLIP_OUT, FLIP_IN, clearDelays, tiles, row, isExpanded, render, flip};
})();
