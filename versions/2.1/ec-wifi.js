/* Android 2.1 Wi-Fi settings (Settings.apk com.android.settings.wifi, ERE27): the access points under WifiSettings'
   "Wi-Fi networks" ProgressCategory, AccessPointDialog and the Wi-Fi status texts.
   - AccessPointPreference: the SSID with AccessPointState.getSummarizedStatus under it (the connected one: its WifiStatus;
     out of range: "Not in range", then "remembered"; else "remembered" for a saved one, then the verbose security, the
     first letter raised), and preference_widget_wifi_signal (wifi_signal: ic_wifi_lock_signal_1…4 / ic_wifi_signal_1…4
     by WifiManager.calculateSignalLevel(rssi, 4), none out of range). Order: the connected one, then the ones in range
     by signal, then the rest.
   - AccessPointDialog (setInverseBackgroundForced): titled by the SSID; wifi_ap_info rows (wifi_ap_info_row: the name and
     the value in bold, textAppearanceSmallInverse): Speed (connected, "54Mbps"), Signal strength (wifi_signal_0…3),
     Security, IP address (connected); a secured network not saved asks for the Wireless password with "Show password.".
     Buttons: Connect (not connected), Forget (saved), Cancel. "Add Wi-Fi network" is wifi_ap_configure: Network SSID,
     Security (wifi_security_without_auto_entries in a Spinner), the password for WEP / WPA; Save / Cancel.
   - Connecting goes through status_connecting and status_obtaining_ip (WifiStatus) to Connected; the Wi-Fi switch's
     summary is WifiStatus.getStatus: "Connected to <SSID>", "Scanning…" while on and not connected, "Turning on…" for a
     moment after switching it on (WifiEnabler).
   The networks in range are made up (the same four as the 2.3.6 simulator's). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const W = () => EC.text('wifi');
  const AIR = [{ssid: 'AndroidAP', security: 'psk', level: 3}, {ssid: 'CoffeeShop', security: 'open', level: 2},
    {ssid: 'Home Network', security: 'psk', level: 3}, {ssid: 'Library Wi-Fi', security: 'open', level: 1}];
  const SECURITY = ['open', 'wep', 'psk', 'eap'];
  const upper = text => text.length > 1 && /\p{Ll}/u.test(text[0]) && !/\p{Lu}/u.test(text[1]) ? text[0].toUpperCase() + text.slice(1) : text;

  function list(c) {
    const s = c.data.settings, saved = s.wifiSaved || [];
    const all = AIR.map(ap => ({...ap, seen: true}));
    for (const n of saved) if (!all.some(ap => ap.ssid === n.ssid)) all.push({...n, level: 0, seen: false});
    for (const ap of all) { ap.configured = saved.some(n => n.ssid === ap.ssid); ap.primary = !!(s.wifiConnected && s.wifiNetwork === ap.ssid) || c.ui.wifiJoining === ap.ssid; }
    return all.sort((a, b) => b.primary - a.primary || b.seen - a.seen || b.level - a.level || a.ssid.localeCompare(b.ssid));
  }
  const status = c => c.ui.wifiStatus || 'status_connected';
  function apSummary(c, ap) {
    if (ap.primary) return W().t(status(c));
    const parts = [];
    if (!ap.seen) { parts.push(W().t('summary_not_in_range')); if (ap.configured) parts.push(W().t('summary_remembered')); }
    else { if (ap.configured) parts.push(W().t('summary_remembered')); parts.push(W().t(`wifi_security_verbose_${ap.security}`)); }
    return parts.map((p, i) => i ? p : upper(p)).join(', ');
  }
  function rows(c) {
    if (!c.data.settings.wifi) return '';
    return list(c).map(ap => {
      const icon = ap.seen ? `<img class="ecwf-signal" src="assets/st-ic_wifi_${ap.security === 'open' ? '' : 'lock_'}signal_${ap.level + 1}.png" alt="">` : '';
      return `<button type="button" class="ecpf-row" data-action="ecwf-ap" data-ssid="${esc(ap.ssid)}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span class="ecpf-text"><span class="ecpf-title">${esc(ap.ssid)}</span><span class="ecpf-summary">${esc(apSummary(c, ap))}</span></span>${icon}</button><i class="ecpf-divider"></i>`;
    }).join('');
  }
  // The Wi-Fi switch's summary (WifiEnabler): null keeps the xml's.
  function toggleSummary(c) {
    const s = c.data.settings;
    if (!s.wifi) return null;
    if (c.ui.wifiStarting) return W().t('wifi_starting');
    if (c.ui.wifiJoining) return W().fmt(c.ui.wifiStatus === 'status_obtaining_ip' ? 'fragment_status_obtaining_ip' : 'fragment_status_connecting', c.lang, c.ui.wifiJoining);
    if (s.wifiConnected && s.wifiNetwork) return W().fmt('fragment_status_connected', c.lang, s.wifiNetwork);
    return W().t('fragment_status_scanning');
  }
  // Switching on: "Turning on…", then a saved network in range connects again.
  function switched(c, on) {
    const s = c.data.settings;
    s.wifiConnected = false;
    if (!on) { c.ui.wifiJoining = null; return; }
    c.ui.wifiStarting = true;
    setTimeout(() => {
      c.ui.wifiStarting = false;
      const back = list(c).find(ap => ap.seen && ap.configured && ap.ssid === s.wifiNetwork) || list(c).find(ap => ap.seen && ap.configured);
      if (back && s.wifi) join(c, back.ssid); else c.render();
    }, 1200);
  }
  function join(c, ssid) {
    const s = c.data.settings;
    s.wifiConnected = false; s.wifiNetwork = ssid; c.ui.wifiJoining = ssid; c.ui.wifiStatus = 'status_connecting'; c.save(); c.render();
    setTimeout(() => { if (c.ui.wifiJoining !== ssid) return; c.ui.wifiStatus = 'status_obtaining_ip'; c.render(); }, 900);
    setTimeout(() => { if (c.ui.wifiJoining !== ssid) return; c.ui.wifiJoining = null; c.ui.wifiStatus = null; if (s.wifi) s.wifiConnected = true; c.save(); c.render(); }, 1900);
  }
  const infoRow = (name, value) => `<div class="ecwf-info"><span>${esc(name)}</span><b>${esc(value)}</b></div>`;
  const field = (id, type = 'text') => `<span class="ecwf-edit npp-fw-textfield_default"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><input class="ecwf-input" data-field="${id}" type="${type}" spellcheck="false" autocomplete="off"></span>`;
  const togglePassword = (el) => {
    const on = el.getAttribute('aria-pressed') !== 'true';
    el.setAttribute('aria-pressed', on); el.querySelector('img').src = `assets/fw-btn_check_${on ? 'on' : 'off'}.png`;
    el.closest('.ecwf-dlg').querySelector('[data-field="password"]').type = on ? 'text' : 'password';
  };
  function dialog(c, ssid) {
    const ap = list(c).find(a => a.ssid === ssid);
    if (!ap) return;
    const F = EC.text('framework'), s = c.data.settings, connected = ap.primary && !c.ui.wifiJoining;
    const ask = !ap.configured && ap.security !== 'open';
    let html = '<div class="ecwf-dlg"><div class="ecwf-table">';
    if (connected) html += infoRow(W().t('wifi_link_speed'), '54Mbps');
    if (ap.seen) html += infoRow(W().t('signal'), W().t(`wifi_signal_${ap.level}`));
    html += infoRow(W().t('security'), W().t(`wifi_security_${ap.security}`));
    if (connected) html += infoRow(W().t('ip_address'), '192.168.1.104');
    html += '</div>';
    if (ask) html += `<div class="ecwf-label">${esc(W().t('please_type_passphrase'))}</div>${field('password', 'password')}${c.checkbox('show', false, W().t('wifi_show_password'))}`;
    html += '</div>';
    const buttons = [];
    if (!ap.primary) buttons.push({label: W().t('connect'), action: (c2, d, root) => {
      if (ask) {
        const pw = root.querySelector('[data-field="password"]').value;
        if (!pw) return;
        s.wifiSaved = [...(s.wifiSaved || []), {ssid: ap.ssid, security: ap.security}];
      } else if (!ap.configured) s.wifiSaved = [...(s.wifiSaved || []), {ssid: ap.ssid, security: ap.security}];
      join(c, ap.ssid);
    }});
    if (ap.configured) buttons.push({label: W().t('forget_network'), action: () => {
      s.wifiSaved = (s.wifiSaved || []).filter(n => n.ssid !== ap.ssid);
      if (s.wifiNetwork === ap.ssid) { s.wifiConnected = false; c.ui.wifiJoining = null; }
      c.save(); c.render();
    }});
    buttons.push({label: W().t('cancel')});
    c.dialog({title: ap.ssid, icon: null, inverse: true, html, buttons,
      action(name, el) { if (name !== 'ecui-check') return false; togglePassword(el); return true; }});
  }
  // Add Wi-Fi network (wifi_ap_configure without the enterprise fields): Spinner = btn_dropdown with the choice in a
  // single-choice dialog.
  function add(c) {
    const entries = W().t('wifi_security_without_auto_entries');
    let sec = 0;
    const spinner = () => `<button type="button" class="ecwf-spinner" data-action="ecwf-security"><i class="ec-bg np-fw-btn_dropdown_normal"></i><i class="ec-bg ec-pressed np-fw-btn_dropdown_pressed"></i><span>${esc(entries[sec])}</span></button>`;
    const pw = `<div class="ecwf-pw" hidden><div class="ecwf-label">${esc(W().t('please_type_passphrase'))}</div>${field('password', 'password')}${c.checkbox('show', false, W().t('wifi_show_password'))}</div>`;
    const html = `<div class="ecwf-dlg"><div class="ecwf-label first">${esc(W().t('wifi_type_ssid'))}</div>${field('ssid')}<div class="ecwf-label">${esc(W().t('wifi_security'))}</div>${spinner()}${pw}</div>`;
    let root = null;
    c.dialog({title: W().t('wifi_add_other_network'), icon: null, inverse: true, html,
      mount: r => { root = r; },
      action(name, el) {
        if (name === 'ecui-check') { togglePassword(el); return true; }
        if (name !== 'ecwf-security') return false;
        const box = el.closest('.ecwf-dlg');
        // The Spinner's own dialog over this one: picking an entry updates the field below.
        const pick = document.createElement('div');
        pick.className = 'ecwf-pick';
        pick.innerHTML = `<div class="ecwf-pick-list npp-fw-popup_full_bright"><i class="ec-bg np-fw-popup_full_bright"></i>${entries.map((e, i) => `<button type="button" class="ecui-li" data-sec="${i}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span>${esc(e)}</span><img class="ecui-mark" src="assets/fw-btn_radio_${i === sec ? 'on' : 'off'}.png" alt=""></button>`).join('<i class="ecui-divider"></i>')}</div>`;
        pick.addEventListener('click', event => {
          event.stopPropagation();
          const b = event.target.closest('[data-sec]');
          if (b) { sec = Number(b.dataset.sec); box.querySelector('.ecwf-spinner span').textContent = entries[sec]; box.querySelector('.ecwf-pw').hidden = sec === 0 || sec === 3; }
          pick.remove();
        });
        box.closest('.ecui-dialog').parentElement.append(pick);
        return true;
      },
      buttons: [{label: W().t('wifi_save_config'), action: () => {
        const ssid = root?.querySelector('[data-field="ssid"]').value.trim().slice(0, 32);
        const s = c.data.settings;
        if (!ssid) return;
        s.wifiSaved = [...(s.wifiSaved || []).filter(n => n.ssid !== ssid), {ssid, security: SECURITY[sec]}];
        c.save();
        if (AIR.some(ap => ap.ssid === ssid)) join(c, ssid); else c.render();
      }}, {label: W().t('cancel')}]});
  }
  // WifiSettings.onCreateOptionsMenu: Scan (ic_menu_scan_network), Advanced (ic_menu_manage).
  function menu(c) {
    c.menu([{label: W().t('scan_wifi'), icon: 'st-ic_menu_scan_network.png', action: () => c.render()},
      {label: W().t('wifi_menu_advanced'), icon: 'fw-ic_menu_manage.png', action: () => { c.ui.settingsStack.push('wifi_advanced_settings'); c.render(); }}]);
  }
  // ProgressCategory: the category header with "Scanning" and the small title-bar spinner while scanning.
  const category = (c, title) => `<div class="ecpf-cat npp-fw-dark_header_dither"><i class="ec-bg np-fw-dark_header_dither"></i><span>${esc(title)}</span>${c.data.settings.wifi && !c.data.settings.wifiConnected && !c.ui.wifiJoining ? `<span class="ecwf-scan">${esc(W().t('progress_scanning'))}</span><img class="ecwf-spin" src="assets/fw-spinner_white_16.png" alt="">` : ''}</div>`;
  EC.wifi = {rows, toggleSummary, switched, dialog, add, menu, category};
})();
