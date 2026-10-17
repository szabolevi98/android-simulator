/* Android 6.0.1 Settings: Wi-Fi (WifiSettings, Settings.apk MTC20K) and its saved networks
   (SavedAccessPointsWifiSettings), as MM.settingsScreens.wifi / 'wifi-saved'.
   - The SwitchBar (switch_bar.xml: actionBarSize 56 dp, switchbar_background #37474f, switchbar_margin_start / end 16 dp
     under Theme.Settings, "On" / "Off" in TextAppearance.Material.Title, the switch in ThemeOverlay.SwitchBar with
     switch_accent_color #7fcac3) above the list; under it the pinned wifi_progress_header (TrimmedHorizontalProgressBar,
     3 dp, indeterminate) while Wi-Fi turns on or scans.
   - onAccessPointsChanged / onWifiStateChanged: off shows wifi_empty_list_wifi_off in the empty view (start | centre,
     16 dp padding, TextAppearance.Medium: wifi_scan_always_enabled is 0, def_wifi_scan_always_available), turning on
     wifi_starting, then the networks WifiTracker finds in range as AccessPointPreference rows: the ?wifi_signal level
     list (ic_wifi_signal_1..4 in #009688, ic_wifi_signal_lock over a secured one), the SSID and
     AccessPoint.getSettingsSummary (the active one's wifi_status "Connected", a saved one wifi_remembered).
   - onPreferenceTreeClick: an open network that is not saved connects at once; any other opens WifiDialog with
     WifiConfigController: unsaved and secured, the password (wifi_item rows, 18 sp edit, Show password, Advanced options)
     with Connect enabled from 8 characters (WPA2 PSK); the active one the rows Status, Signal strength, Link speed,
     Frequency, Security; a saved one only Connect; Forget on a saved or active one, and Cancel.
   - A long press opens the context menu (the SSID, Connect to network, Forget network, Modify network).
   - The overflow menu: Add network (enabled with Wi-Fi on), Saved networks (when there are some), Refresh, Advanced. */
(() => {
  'use strict';
  const T = () => MM.text('settings');
  const sys = () => MM.system;
  const A = name => `assets/${name}`;

  // The network's settings summary and its WifiConfigController rows.
  function summary(c, ap) {
    const t = T(), s = c.data.settings;
    if (ap.active) return t.t('array:wifi_status')[5];
    if (sys().live.wifiConnecting > Date.now() && s.wifiSsid === ap.ssid) return t.t('array:wifi_status')[2];
    return ap.saved ? t.t('wifi_remembered') : '';
  }
  const security = (t, ap) => t.t(ap.secure ? 'wifi_security_wpa2' : 'wifi_security_none');
  const icon = ap => `<span class="mmst-iconframe"><span class="mmwf-signal"><img src="${A(`st-ic_wifi_signal_${ap.level + 1}.svg`)}" alt="">${ap.secure ? `<img src="${A('st-ic_wifi_signal_lock.svg')}" alt="">` : ''}</span></span>`;

  // Networks added by hand (Add network) that are not in range: only the saved list shows them.
  const added = c => c.data.settings.wifiAdded || [];
  const saved = c => [...sys().accessPoints(c).filter(ap => ap.saved), ...added(c).map(n => ({...n, level: -1, saved: true, away: true}))];

  function switchBar(c, on) {
    const t = T();
    return `<button type="button" class="mmst-switchbar" data-action="mmwf-toggle"><span>${c.safe(t.t(on ? 'switch_on_text' : 'switch_off_text'))}</span><i class="mmw-switch${on ? ' on' : ''}"><i class="mmw-thumb"></i></i></button>`;
  }
  const progress = () => '<div class="mmst-progress"><i></i><i></i></div>';

  function render(c) {
    const t = T(), s = c.data.settings, live = sys().live, now = Date.now();
    const on = !!s.wifi, starting = on && live.wifiConnecting - 1500 > now;
    let body;
    if (!on) body = `<div class="mmst-empty"><span class="medium">${c.safe(t.t('wifi_empty_list_wifi_off'))}</span></div>`;
    else if (starting) body = `<div class="mmst-empty">${c.safe(t.t('wifi_starting'))}</div>`;
    else body = `<div class="mmst-list">${sys().accessPoints(c).map((ap, i) => `<button type="button" class="mmst-pref" data-action="mmwf-ap" data-index="${i}">${icon(ap)}<span class="mmst-texts"><span class="mmst-title">${c.safe(ap.ssid)}</span>${summary(c, ap) ? `<span class="mmst-summary">${c.safe(summary(c, ap))}</span>` : ''}</span></button>`).join('')}</div>`;
    return body;
  }
  // Above the list: the switch bar and the pinned progress header.
  function bar(c) {
    const s = c.data.settings, live = sys().live, on = !!s.wifi;
    return `${switchBar(c, on)}<div class="mmst-pinned">${on && live.wifiConnecting > Date.now() ? progress() : ''}</div>`;
  }

  // WifiDialog for an access point (edit: the password fields of an unsaved secured one).
  function apDialog(c, ap) {
    const t = T(), rows = [], edit = !ap.saved && !ap.active && ap.secure;
    const row = (name, value) => rows.push(`<div class="mmwf-item"><span class="mmwf-label">${c.safe(name)}</span><span class="mmwf-value">${c.safe(value)}</span></div>`);
    let html = '';
    const buttons = [];
    if (ap.saved || ap.active) buttons.push({label: t.t('wifi_forget'), neutral: true, action: c => { sys().forgetWifi(c, ap.ssid); }});
    buttons.push({label: t.t('wifi_cancel')});
    if (edit) {
      html = `<div class="mmwf-dialog">${passwordFields(c)}${advancedFields(c)}</div>`;
      buttons.push({label: t.t('wifi_connect'), disabled: true, action: c => sys().connectWifi(c, ap.ssid)});
    } else if (ap.active) {
      row(t.t('wifi_status'), t.t('array:wifi_status')[5]);
      row(t.t('wifi_signal'), t.t('array:wifi_signal')[ap.level]);
      row(t.t('wifi_speed'), t.fmt('link_speed', null, ap.speed));
      row(t.t('wifi_frequency'), t.t(ap.freq >= 4900 ? 'wifi_band_5ghz' : 'wifi_band_24ghz'));
      row(t.t('wifi_security'), security(t, ap));
      html = `<div class="mmwf-dialog">${rows.join('')}</div>`;
    } else {
      html = '<div class="mmwf-dialog"></div>';
      buttons.push({label: t.t('wifi_connect'), action: c => sys().connectWifi(c, ap.ssid)});
    }
    c.dialog({title: ap.ssid, html, buttons, mount: edit ? (c, win) => bindPassword(win, 8) : null});
  }
  const passwordFields = c => {
    const t = T();
    return `<div class="mmwf-item"><span class="mmwf-label">${c.safe(t.t('wifi_password'))}</span><input class="mmwf-edit" type="password" autocomplete="off" spellcheck="false"></div>
      <div class="mmwf-item"><label class="mmwf-check"><input type="checkbox" class="mmwf-show"><i class="mmst-check"></i><span>${c.safe(t.t('wifi_show_password'))}</span></label></div>`;
  };
  // wifi_advanced_toggle (ic_expand at its end) and the IP / proxy spinners it shows.
  const advancedFields = c => {
    const t = T(), opts = arr => arr.map(o => `<option>${c.safe(o)}</option>`).join('');
    return `<div class="mmwf-item"><label class="mmwf-check mmwf-adv"><input type="checkbox" class="mmwf-advbox"><span>${c.safe(t.t('wifi_show_advanced'))}</span><i class="mmwf-expand"></i></label></div>
      <div class="mmwf-advanced" hidden><div class="mmwf-item"><span class="mmwf-label">${c.safe(t.t('proxy_settings_title'))}</span><select class="mmwf-spinner">${opts(t.t('wifi_proxy_settings'))}</select></div>
      <div class="mmwf-item"><span class="mmwf-label">${c.safe(t.t('wifi_ip_settings'))}</span><select class="mmwf-spinner">${opts(t.t('array:wifi_ip_settings'))}</select></div></div>`;
  };
  // enableSubmitIfAppropriate: a WPA password has 8 characters at least; Show password unmasks it.
  function bindPassword(win, min, extra = () => true) {
    const pw = win.querySelector('.mmwf-edit[type=password], .mmwf-edit.pw'), submit = win.querySelectorAll('.mmdlg-button');
    const last = submit[submit.length - 1];
    const check = () => { if (last) last.disabled = !(extra() && (!pw || pw.closest('[hidden]') || pw.value.length >= min)); };
    pw?.classList.add('pw');
    win.addEventListener('input', check); win.addEventListener('change', check);
    win.querySelector('.mmwf-show')?.addEventListener('change', e => { if (pw) pw.type = e.target.checked ? 'text' : 'password'; });
    win.querySelector('.mmwf-advbox')?.addEventListener('change', e => { win.querySelector('.mmwf-advanced').hidden = !e.target.checked; });
    check();
    setTimeout(() => (win.querySelector('.mmwf-ssid') || pw)?.focus(), 50);
  }

  // Add network: the SSID, the security spinner (wifi_security), the password for a secured one; Save.
  function addDialog(c) {
    const t = T(), sec = t.t('array:wifi_security');
    const html = `<div class="mmwf-dialog"><div class="mmwf-item"><span class="mmwf-label">${c.safe(t.t('wifi_ssid'))}</span><input class="mmwf-edit mmwf-ssid" type="text" maxlength="32" placeholder="${c.safe(t.t('wifi_ssid_hint'))}" autocomplete="off" spellcheck="false"></div>
      <div class="mmwf-item"><span class="mmwf-label">${c.safe(t.t('wifi_security'))}</span><select class="mmwf-spinner mmwf-sec">${sec.map(o => `<option>${c.safe(o)}</option>`).join('')}</select></div>
      <div class="mmwf-secfields" hidden>${passwordFields(c)}</div>${advancedFields(c)}</div>`;
    c.dialog({title: t.t('wifi_add_network'), html, buttons: [{label: t.t('wifi_cancel')}, {label: t.t('wifi_save'), disabled: true, action: c => {
      const f = c.ui.wifiForm || {}, s = c.data.settings;
      if (!f.ssid) return;
      const known = sys().accessPoints(c).find(ap => ap.ssid === f.ssid);
      if (known) sys().connectWifi(c, f.ssid);
      else { s.wifiAdded = [...added(c).filter(n => n.ssid !== f.ssid), {ssid: f.ssid, secure: f.secure}]; c.save(); c.render(); }
    }}], mount(c, win) {
      const ssid = win.querySelector('.mmwf-ssid'), secSel = win.querySelector('.mmwf-sec'), fields = win.querySelector('.mmwf-secfields');
      const sync = () => { fields.hidden = secSel.selectedIndex === 0; c.ui.wifiForm = {ssid: ssid.value.trim(), secure: secSel.selectedIndex > 0}; };
      win.addEventListener('input', sync); win.addEventListener('change', sync); sync();
      bindPassword(win, 8, () => !!ssid.value.trim());
    }});
  }

  function menu(c) {
    const t = T(), on = !!c.data.settings.wifi;
    const items = [{label: t.t('wifi_add_network'), disabled: !on, action: addDialog}];
    if (saved(c).length) items.push({label: t.t('wifi_saved_access_points_label'), disabled: !on, action: c => MM.settingsGo(c, 'wifi-saved', t.t('wifi_saved_access_points_titlebar'))});
    items.push({label: t.t('menu_stats_refresh'), disabled: !on, action: c => { sys().live.wifiConnecting = Math.max(sys().live.wifiConnecting, Date.now() + 1500); c.render(); setTimeout(() => c.ui.view === 'settings' && c.render(), 1600); }});
    items.push({label: t.t('wifi_menu_advanced'), action: c => MM.settingsGo(c, 'xml:wifi_advanced_settings', t.t('wifi_advanced_titlebar'))});
    c.menu(items);
  }

  // The context menu of a row (registerForContextMenu): a dialog with the SSID as its title.
  function contextMenu(c, ap) {
    const t = T(), items = [];
    if (!ap.active) items.push([t.t('wifi_menu_connect'), () => ap.secure && !ap.saved ? apDialog(c, ap) : sys().connectWifi(c, ap.ssid)]);
    if (ap.saved || ap.active) { items.push([t.t('wifi_menu_forget'), () => sys().forgetWifi(c, ap.ssid)]); items.push([t.t('wifi_menu_modify'), () => modifyDialog(c, ap)]); }
    if (!items.length) return;
    c.dialog({title: ap.ssid, items: items.map(([label]) => ({html: `<span class="mmst-dlgitem">${c.safe(label)}</span>`})), onItem: i => items[i][1]()});
  }
  // Modify network (WifiDialog with modify): the security fields and Save.
  function modifyDialog(c, ap) {
    const t = T();
    c.dialog({title: ap.ssid, html: `<div class="mmwf-dialog">${ap.secure ? passwordFields(c) : ''}${advancedFields(c)}</div>`,
      buttons: [{label: t.t('wifi_cancel')}, {label: t.t('wifi_save'), action: () => {}}], mount: (c, win) => bindPassword(win, ap.secure ? 8 : 0)});
  }

  MM.settingsScreens.wifi = {
    title: () => T().t('wifi_settings'),
    render, bar,
    actions: c => MM.menu.button(c),
    mount(c, root) {
      // A long press on a row opens its context menu.
      for (const el of root.querySelectorAll('[data-action="mmwf-ap"]')) {
        let timer = 0;
        el.addEventListener('pointerdown', () => { el.dataset.held = ''; timer = setTimeout(() => { el.dataset.held = '1'; contextMenu(c, sys().accessPoints(c)[+el.dataset.index]); }, 500); });
        for (const type of ['pointerup', 'pointerleave', 'pointercancel']) el.addEventListener(type, () => clearTimeout(timer));
      }
    },
    action(c, name, el) {
      if (name === 'mm-menu') { menu(c); return true; }
      if (name === 'mmwf-toggle') {
        const on = !c.data.settings.wifi;
        sys().setWifi(c, on); c.render();
        if (on) setTimeout(() => c.ui.view === 'settings' && !c.ui.overlay && c.render(), 1050);
        return true;
      }
      if (name === 'mmwf-ap') {
        if (el.dataset.held === '1') { el.dataset.held = ''; return true; }
        const ap = sys().accessPoints(c)[+el.dataset.index];
        if (!ap) return true;
        if (!ap.secure && !ap.saved && !ap.active) { sys().connectWifi(c, ap.ssid); c.render(); return true; }
        apDialog(c, ap); return true;
      }
      return false;
    }
  };

  // SavedAccessPointsWifiSettings: every saved network (AccessPointPreference forSavedNetworks: no icon, the name).
  MM.settingsScreens['wifi-saved'] = {
    title: () => T().t('wifi_saved_access_points_titlebar'),
    render: c => `<div class="mmst-list">${saved(c).map((ap, i) => `<button type="button" class="mmst-pref" data-action="mmwf-saved" data-index="${i}"><span class="mmst-texts"><span class="mmst-title">${c.safe(ap.ssid)}</span></span></button>`).join('')}</div>`,
    action(c, name, el) {
      if (name !== 'mmwf-saved') return false;
      const ap = saved(c)[+el.dataset.index], t = T();
      if (!ap) return true;
      c.dialog({title: ap.ssid, html: '<div class="mmwf-dialog"></div>', buttons: [{label: t.t('wifi_forget'), neutral: true, action: c => {
        if (ap.away) { c.data.settings.wifiAdded = added(c).filter(n => n.ssid !== ap.ssid); c.save(); c.render(); } else sys().forgetWifi(c, ap.ssid);
      }}, {label: t.t('wifi_cancel')}]});
      return true;
    }
  };
})();
