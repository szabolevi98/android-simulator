/* Android 2.3.6 SystemUI status bar: status_bar.xml icons, the ticker, the DateView and the status_bar_expanded.xml shade.
   Sizes are hdpi pixels at 0.575 (1 dp = 0.8625 CSS px). */
(() => {
  'use strict';
  const PX = 0.575;
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

  // stat_sys_battery.xml level-list: each 5% step covers the levels up to 2 above it (0-2, 3-7, ... 98-100).
  const batteryIcon = (level, charging) => {
    if (charging) return 'gb-stat_sys_battery_charge_anim5.png';
    const step = Math.min(100, Math.max(0, Math.round(Number(level) / 5) * 5));
    return `gb-stat_sys_battery_${step}.png`;
  };
  // config_statusBarIcons order, left to right: bluetooth, mute/volume, wifi, data_connection, phone_signal, battery,
  // alarm_clock. StatusBarService puts every icon in a 25 dp square (status_bar_icon_size).
  function statusIcons(state) {
    const slots = [];
    if (state.bluetooth) slots.push(state.bluetoothConnected ? 'gb-stat_sys_data_bluetooth_connected.png' : 'gb-stat_sys_data_bluetooth.png');
    if (state.ringer) slots.push(`gb-stat_sys_ringer_${state.ringer}.png`);
    if (!state.airplane && state.wifi) slots.push(`gb-stat_sys_wifi_signal_${state.wifiLevel ?? 4}_fully.png`);
    else if (!state.airplane && state.data) slots.push(`gb-stat_sys_data_fully_connected_${state.data}.png`);
    slots.push(state.airplane ? 'gb-stat_sys_signal_flightmode.png' : `gb-stat_sys_signal_${state.signal ?? 4}_fully.png`);
    slots.push(batteryIcon(state.battery ?? 100, state.charging));
    if (state.alarm) slots.push('gb-stat_notify_alarm.png');
    return slots.map(src => `<span class="gbsb-icon"><img src="assets/${src}" alt=""></span>`).join('');
  }
  const notificationIcons = icons => icons.map(src => `<span class="gbsb-icon"><img src="assets/${src}" alt=""></span>`).join('');

  // The bar keeps three layers so a running ticker survives icon updates: icons, ticker, and the DateView shown while
  // the shade is open.
  function bar(root, parts) {
    if (!root.querySelector('.gbsb')) {
      root.innerHTML = `<button class="gbsb" data-action="shade"><span class="gbsb-icons"><span class="gbsb-notifications"></span><span class="gbsb-status"></span><span class="gbsb-clock"></span></span><span class="gbsb-ticker" aria-live="polite"></span><span class="gbsb-date"></span></button>`;
    }
    const button = root.querySelector('.gbsb');
    button.setAttribute('aria-label', parts.label);
    button.querySelector('.gbsb-notifications').innerHTML = notificationIcons(parts.notifications);
    button.querySelector('.gbsb-status').innerHTML = statusIcons(parts.state);
    button.querySelector('.gbsb-clock').textContent = parts.clock;
    button.querySelector('.gbsb-date').textContent = parts.date;
    button.classList.toggle('gbsb-expanded', !!parts.expanded);
  }

  // Ticker.java: each segment shows for TICKER_SEGMENT_DELAY (3 s); push_up_in/out swap it with the icons
  // (config_longAnimTime, 500 ms), push_down_in/out bring the icons back.
  function ticker(root, items, onDone) {
    const button = root.querySelector('.gbsb');
    if (!button || !items.length) return () => {};
    const layer = button.querySelector('.gbsb-ticker');
    let index = 0, timer = 0, stopped = false;
    const show = () => {
      const item = items[index];
      layer.innerHTML = `<span class="gbsb-ticker-segment"><span class="gbsb-icon"><img src="assets/${item.icon}" alt=""></span><span class="gbsb-ticker-text">${e(item.text)}</span></span>`;
    };
    button.classList.add('gbsb-ticking');
    show();
    const advance = () => {
      if (stopped) return;
      index++;
      if (index < items.length) { show(); layer.firstElementChild?.classList.add('gbsb-next'); timer = setTimeout(advance, 3000); return; }
      button.classList.remove('gbsb-ticking'); button.classList.add('gbsb-ticker-done');
      timer = setTimeout(() => { button.classList.remove('gbsb-ticker-done'); layer.innerHTML = ''; onDone?.(); }, 500);
    };
    timer = setTimeout(advance, 3000);
    return () => { stopped = true; clearTimeout(timer); button.classList.remove('gbsb-ticking', 'gbsb-ticker-done'); layer.innerHTML = ''; };
  }

  // status_bar_latest_event.xml (64 sp row + divider) around status_bar_latest_event_content.xml.
  const item = n => `<button class="gbsh-item" data-action="${n.action || 'notification-open'}" data-id="${e(n.id)}"${n.app ? ` data-app="${e(n.app)}"` : ''}><span class="gbsh-row"><img class="gbsh-icon" src="assets/${n.icon}" alt=""><span class="gbsh-title">${e(n.title)}</span></span><span class="gbsh-row"><span class="gbsh-text">${e(n.text)}</span>${n.time ? `<span class="gbsh-time">${e(n.time)}</span>` : ''}</span></button>`;
  function shade(parts) {
    const t = parts.t, ongoing = parts.ongoing || [], latest = parts.latest || [];
    const sections = !ongoing.length && !latest.length
      ? `<div class="gbsh-section">${e(t('No notifications'))}</div>`
      : `${ongoing.length ? `<div class="gbsh-section">${e(t('Ongoing'))}</div>${ongoing.map(item).join('')}` : ''}${latest.length ? `<div class="gbsh-section">${e(t('Notifications'))}</div>${latest.map(item).join('')}` : ''}`;
    return `<div class="gbsh" role="dialog" aria-label="${e(t('Notifications'))}"><div class="gbsh-panel"><div class="gbsh-header"><span class="gbsh-carrier">${e(parts.carrier)}</span><button class="gbsh-clear" data-action="clear-notifications"${parts.clearable ? '' : ' hidden'}>${e(t('Clear'))}</button></div><div class="gbsh-scroll"><div class="gbsh-list">${sections}</div><div class="gbsh-shadow" aria-hidden="true"></div></div><button class="gbsh-close" data-action="close-overlay" aria-label="${e(t('Close notifications'))}"></button></div></div>`;
  }

  /* StatusBarService.incrementAnim: y += v t + a t^2 / 2 with a = +-2000 px/s^2. animateExpand flings from the top at
     2000 px/s; animateCollapse from the bottom at -2000 px/s. Positions are the panel's bottom edge from the screen top. */
  const ACCEL = 2000 * PX;
  function place(panel, y, height) { panel.style.transform = `translateY(${Math.round((y - height) * 100) / 100}px)`; }
  function slide(panel, {from, velocity, accel, top, bottom, reduced}, done) {
    const height = bottom;
    if (reduced) { place(panel, accel > 0 ? bottom : top, height); done?.(accel > 0); return () => {}; }
    let y = from, v = velocity, last = performance.now(), frame = 0;
    const step = now => {
      const t = Math.min(0.05, (now - last) / 1000); last = now;
      y += v * t + 0.5 * accel * t * t; v += accel * t;
      if (y >= bottom) { place(panel, bottom, height); done?.(true); return; }
      if (y <= top && v <= 0) { place(panel, top, height); done?.(false); return; }
      place(panel, y, height); frame = requestAnimationFrame(step);
    };
    place(panel, y, height); frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }
  // performFling: thresholds of 200 px/s and the half-height (closed) or last 25 px (open) decide the direction.
  function flingDirection(expanded, y, velocity, displayHeight) {
    const v = velocity / PX, h = displayHeight / PX, yy = y / PX;
    if (expanded) return v > 200 || (yy > h - 25 && v > -200);
    return v > 200 || (yy > h / 2 && v > -200);
  }

  window.GBStatusBar = {PX, ACCEL, batteryIcon, statusIcons, bar, ticker, shade, slide, place, flingDirection};
})();
