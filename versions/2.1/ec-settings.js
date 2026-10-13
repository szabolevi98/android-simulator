/* Android 2.1 Settings: the image's preference screens (ec-settings-data.js, docs/tools/ec-prefs.py) drawn as
   PreferenceActivity lists in an activity window (title bar 25 dp):
   - preference.xml rows: at least 64 dp, the title (textAppearanceLarge, 22 sp, white) and up to two lines of summary
     (textAppearanceSmall, 14 sp, #bebebe) 15 dp from the left; the widget frame at the right (CheckBox 4 dp from the
     edge); Settings' preference_icon.xml rows put the icon 6 dp from the left with the text 2 dp after it;
   - categories: Widget.TextView.ListSeparator (25 dp, dark_header, 14 sp bold #bebebe, 5 sp in);
   - divider_horizontal_dark between rows; list_selector_background when pressed; a dependency switches a row off
     (#80ffffff / #80bebebe) as CheckBoxPreference.disableDependentsState says.
   ListPreference opens its entries as a single-choice dialog with Cancel; the screens an intent names open in place.
   Runtime changes the code makes: SoundAndDisplaySettings drops emergency_tone (GSM); DeviceInfoSettings fills the
   version rows from build.prop and drops safetylegal (no ro.url.safetylegal). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const S = () => EC.text('settings');
  const txt = ref => {
    if (!ref || typeof ref !== 'string') return '';
    if (!ref.startsWith('string/')) return ref;
    const name = ref.slice(7);
    const S2 = EC.text('settings2');
    return S().has(name) ? S().t(name) : S().has(`framework/${name}`) ? S().t(`framework/${name}`) : S2.has(name) ? S2.t(name) : name;
  };
  const arr = ref => {
    const name = String(ref || '').replace(/^array\//, '');
    return S().has(name) ? S().t(name) : S().has(`framework/${name}`) ? S().t(`framework/${name}`) : [];
  };
  // intent targetClass → the screen's xml
  const CLASS = {
    WirelessSettings: 'wireless_settings', WifiSettings: 'wifi_settings', AdvancedSettings: 'wifi_advanced_settings', BluetoothSettings: 'bluetooth_settings',
    SoundAndDisplaySettings: 'sound_and_display_settings', SecuritySettings: 'security_settings', ApplicationSettings: 'application_settings',
    DevelopmentSettings: 'development_prefs', PrivacySettings: 'privacy_settings', Memory: 'device_info_memory', LanguageSettings: 'language_settings',
    AccessibilitySettings: 'accessibility_settings', TextToSpeechSettings: 'tts_settings', DateTimeSettings: 'date_time_prefs',
    DeviceInfoSettings: 'device_info_settings', Status: 'device_info_status', DockSettings: 'dock_settings', QuickLaunchSettings: 'quick_launch_settings',
    VpnSettings: 'vpn_settings', ApnSettings: 'apn_settings', PhysicalKeyboardSettings: 'keyboard_settings'
  };
  // Preference keys stored in the phone's state (the rest go to data.prefs with their defaultValue).
  const BOUND = {
    toggle_airplane: ['airplane'], toggle_wifi: ['wifi'], toggle_bluetooth: ['bluetooth'], silent: ['ringer'],
    accelerometer: ['rotate', true], auto_time: ['autoTime', true], '24 hour': ['hour24']
  };
  // build.prop (ERE27); the baseband in the update's radio.img; the kernel of ERE27's boot.img (the update's patch applied
  // to ERD79's, SHA-1 e7f20e51…: "Linux version 2.6.29-01117-g4bc62c2 (android-build@apa26…) #1"), as DeviceInfoSettings
  // formats it.
  const BUILD = {firmware_version: '2.1-update1', device_model: 'Nexus One', build_number: 'ERE27', baseband_version: '32.24.00.22U_4.03.00.21_2',
    kernel_version: '2.6.29-01117-g4bc62c2\nandroid-build@apa26 #1'};
  // SettingsProvider defaults (def_notification_pulse, def_haptic_feedback, def_install_non_market_apps, def_backup_enabled,
  // def_location_providers_allowed "gps").
  EC.defaults.prefs = {notification_pulse: true, haptic_feedback: true, toggle_install_applications: false, location_gps: true, location_network: false};

  function value(c, key, def) {
    if (BOUND[key]) {
      const [field, dflt] = BOUND[key], v = c.data.settings[field];
      if (key === 'silent') return !!v;
      if (key === '24 hour') return c.is24();
      return v ?? dflt ?? false;
    }
    if (key in (c.data.prefs || {})) return c.data.prefs[key];
    return def === 'true' ? true : def === 'false' ? false : def;
  }
  function setValue(c, key, v) {
    if (BOUND[key]) {
      const [field] = BOUND[key];
      if (key === 'silent') c.data.settings.ringer = v ? (value(c, 'vibrate') ? 'vibrate' : 'silent') : '';
      else if (key === '24 hour') c.data.settings.hour24 = !!v;
      else { c.data.settings[field] = v; if (key === 'toggle_wifi') c.data.settings.wifiConnected = v; }
      // Automatic on: the network's time and zone again.
      if (key === 'auto_time' && v) { c.data.settings.timeOffset = 0; c.data.settings.timeZone = null; }
    } else (c.data.prefs ||= {})[key] = v;
    c.save();
  }
  // CheckBoxPreference.shouldDisableDependents: disableDependentsState true → off when checked.
  function disabled(c, screen, node) {
    if (!node.dependency) return false;
    const dep = find(screen, node.dependency);
    if (!dep) return false;
    const v = !!value(c, dep.key, dep.defaultValue);
    return dep.disableDependentsState === 'true' ? v : !v;
  }
  const find = (n, key) => n.key === key ? n : (n.c || []).reduce((hit, ch) => hit || find(ch, key), null);

  // Preferences the code adds after inflating a screen's xml (in the order it adds them).
  const EXTRA = {
    // SecuritySettings.createPreferenceHierarchy: the unlock pattern category (its toggles off while no pattern is saved,
    // and Set / Change unlock pattern by savedPatternExists), the SIM card lock, Passwords and the credential storage.
    security_settings: c => {
      const has = !!c.data.settings.lockPattern;
      return [
        {t: 'PreferenceCategory', title: 'string/lock_settings_title', c: [
          {t: 'CheckBoxPreference', key: 'lockenabled', title: 'string/lockpattern_settings_enable_title', summary: 'string/lockpattern_settings_enable_summary', enabled: has ? undefined : 'false'},
          {t: 'CheckBoxPreference', key: 'visiblepattern', title: 'string/lockpattern_settings_enable_visible_pattern_title', defaultValue: 'true', enabled: has ? undefined : 'false'},
          {t: 'CheckBoxPreference', key: 'tactilefeedback', title: 'string/lockpattern_settings_enable_tactile_feedback_title', enabled: has ? undefined : 'false'},
          {t: 'Preference', key: 'unlock_set_change', title: has ? 'string/lockpattern_settings_change_lock_pattern' : 'string/lockpattern_settings_choose_lock_pattern', intent: {targetClass: 'com.android.settings.ChooseLockPatternTutorial'}}]},
        {t: 'PreferenceCategory', title: 'string/sim_lock_settings_title', c: [
          {t: 'PreferenceScreen', key: 'sim_lock', title: 'string/sim_lock_settings_category', intent: {targetClass: 'com.android.settings.SimLockSettings'}}]},
        {t: 'PreferenceCategory', title: 'string/security_passwords_title', c: [
          {t: 'CheckBoxPreference', key: 'show_password', title: 'string/show_password', summary: 'string/show_password_summary', defaultValue: 'true'}]},
        {t: 'PreferenceCategory', title: 'string/credentials_category', c: [
          {t: 'CheckBoxPreference', key: 'enable_credentials', title: 'string/credentials_access', summary: 'string/credentials_access_summary', enabled: 'false'},
          {t: 'Preference', key: 'install_credentials', title: 'string/credentials_install_certificates', summary: 'string/credentials_install_certificates_summary', enabled: 'false'},
          {t: 'Preference', key: 'set_password', title: 'string/credentials_set_password', summary: 'string/credentials_set_password_summary'},
          {t: 'Preference', key: 'reset_credentials', title: 'string/credentials_reset', summary: 'string/credentials_reset_summary', enabled: 'false'}]}
      ];
    }
  };
  function withExtra(c, name, node) {
    if (!EXTRA[name] || node.c?.extended) return node;
    return {...node, c: Object.assign([...(node.c || []), ...EXTRA[name](c)], {extended: true})};
  }

  function prune(name, n) {
    if (name === 'sound_and_display_settings' && n.key === 'emergency_tone') return false;
    if (name === 'device_info_settings' && n.key === 'safetylegal') return false;
    return true;
  }
  // DateTimeSettings.updateTimeAndDateDisplay: the date in the short format, the time in getTimeFormat, the zone as
  // "GMT+01:00, <long name>", the date format as Dec 31 of this year (mDummyDate) in it.
  function gmt(zone, date = new Date()) {
    const part = new Intl.DateTimeFormat('en-US', {timeZone: zone, timeZoneName: 'longOffset'}).formatToParts(date).find(x => x.type === 'timeZoneName')?.value || 'GMT';
    return part === 'GMT' ? 'GMT+00:00' : part;
  }
  const zoneName = (c, zone) => new Intl.DateTimeFormat(c.locale(), {timeZone: zone, timeZoneName: 'long'}).formatToParts(new Date()).find(x => x.type === 'timeZoneName')?.value || zone;
  const dummyDate = c => new Date(c.now().getFullYear(), 11, 31, 13, 0);
  const dateTime = {
    date: c => c.shortDate(),
    time: c => c.timeText(),
    timezone: c => `${gmt(c.zone())}, ${zoneName(c, c.zone())}`,
    date_format: c => c.dateFormat(c.shortDatePattern(), dummyDate(c))
  };
  function summary(c, name, n) {
    if (BUILD[n.key]) return BUILD[n.key];
    if (name === 'date_time_prefs' && dateTime[n.key]) return dateTime[n.key](c);
    if (n.t === 'CheckBoxPreference' && (n.summaryOn || n.summaryOff)) return txt(value(c, n.key, n.defaultValue) ? n.summaryOn : n.summaryOff) || txt(n.summary);
    return txt(n.summary);
  }
  function row(c, screen, name, n, path) {
    if (!prune(name, n)) return '';
    if (n.t === 'PreferenceCategory') return `<div class="ecpf-cat npp-fw-dark_header_dither"><i class="ec-bg np-fw-dark_header_dither"></i><span>${esc(txt(n.title))}</span></div>${(n.c || []).map((ch, i) => row(c, screen, name, ch, `${path}.${i}`)).join('')}`;
    const off = disabled(c, screen, n) || n.enabled === 'false' || name === 'date_time_prefs' && ['date', 'time', 'timezone'].includes(n.key) && value(c, 'auto_time');
    const check = n.t === 'CheckBoxPreference' ? `<img class="ecpf-check" src="assets/fw-btn_check_${value(c, n.key, n.defaultValue) ? 'on' : 'off'}.png" alt="">` : '';
    const icon = n.icon ? `<img class="ecpf-icon" src="assets/st-${n.icon.split('/')[1]}.png" alt="">` : '';
    const sum = summary(c, name, n);
    return `<button type="button" class="ecpf-row${icon ? ' ecpf-icon-row' : ''}" data-action="ecpf-row" data-path="${path}"${off ? ' disabled' : ''}><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i>${icon}<span class="ecpf-text"><span class="ecpf-title">${esc(txt(n.title))}</span>${sum ? `<span class="ecpf-summary">${esc(sum)}</span>` : ''}</span>${check}</button><i class="ecpf-divider"></i>`;
  }
  // The screen on top of the stack: an xml name, or "xml/path" for a nested PreferenceScreen.
  function current(c) {
    const top = c.ui.settingsStack?.at(-1) || 'settings';
    const [name, path] = top.split('|');
    const root = EC.settingsXml[name] && withExtra(c, name, EC.settingsXml[name]);
    let n = root;
    for (const i of (path ? path.split('.').slice(1) : [])) n = n?.c?.[Number(i)];
    return {name, path, node: n, root};
  }
  function nodeAt(screen, path) { let n = screen.root; for (const i of path.split('.').slice(1)) n = n?.c?.[Number(i)]; return n; }

  function render(c) {
    const s = current(c);
    if (!s.node) return c.window(S().t('settings_label'), '<div class="ec-missing"><b>Not built yet</b></div>');
    const rows = (s.node.c || []).map((n, i) => row(c, s.root, s.name, n, `${s.path ? s.path : ''}.${i}`.replace(/^\./, '.'))).join('');
    // The window title is the activity's android:label (a nested PreferenceScreen shows its own title).
    const cls = Object.keys(CLASS).find(k => CLASS[k] === s.name) || (s.name === 'settings' ? 'Settings' : '');
    const title = (s.path ? txt(s.node.title) : '') || txt(EC.settingsLabels?.[cls]) || txt(s.node.title) || S().t('settings_label');
    return c.window(title, `<div class="ecpf-list" data-screen="${esc(s.name)}">${rows}</div>`);
  }

  function open(c, n, screen, path) {
    if (n.t === 'CheckBoxPreference') { setValue(c, n.key, !value(c, n.key, n.defaultValue)); c.render(); return; }
    if (screen.name === 'date_time_prefs' && n.key in dateTime) { dateTimeClick(c, n); return; }
    if (n.t === 'ListPreference') {
      const entries = arr(n.entries), values = n.entryValues || [], v = String(value(c, n.key, n.defaultValue) ?? '');
      c.dialog({title: txt(n.dialogTitle || n.title), icon: null, items: entries, choice: 'single', checked: values.indexOf(v), closeOnChoice: true,
        buttons: [{label: EC.text('framework').t('cancel')}],
        onItem: i => { setValue(c, n.key, values[i]); if (n.key === 'screen_timeout') c.data.settings.screenTimeout = Number(values[i]); c.save(); c.render(); }});
      return;
    }
    if (n.t === 'RingerVolumePreference' || n.t === 'VolumePreference' || n.t === 'BrightnessPreference') { volumeDialog(c, n); return; }
    if (n.intent?.targetClass) {
      const cls = n.intent.targetClass.split('.').pop();
      if (cls.startsWith('ChooseLockPattern')) { EC.patternFlow.start(c); return; }
      if (CLASS[cls] && EC.settingsXml[CLASS[cls]]) { c.ui.settingsStack.push(CLASS[cls]); c.render(); c.el.viewport.querySelector('.ecwin-content')?.scrollTo(0, 0); return; }
      c.ui.settingsStack.push(`missing:${cls}`); c.render(); return;
    }
    if (n.t === 'PreferenceScreen' && n.c) { c.ui.settingsStack.push(`${screen.name}|${path}`); c.render(); return; }
    if (n.intent?.action) { c.toast(txt(n.title)); return; }
    if (n.t !== 'Preference') c.dialog({title: txt(n.dialogTitle || n.title), icon: null, message: c.t('Not built yet'), buttons: [{label: EC.text('framework').t('ok')}]});
  }

  // Set date / Set time move the device clock by the difference; Select time zone opens ZoneList; Select date format
  // lists date_format_values ("" = normal_date_format with the locale's short date) as dummy dates.
  function dateTimeClick(c, n) {
    const s = c.data.settings, now = c.now();
    const move = target => { s.timeOffset = (Number(s.timeOffset) || 0) + (target - c.now()); c.save(); c.render(); };
    if (n.key === 'date') c.datePicker({date: now, onSet: (y, m, d) => { const t = c.now(); t.setFullYear(y, m, d); move(t); }});
    else if (n.key === 'time') c.timePicker({hour: now.getHours(), minute: now.getMinutes(), onSet: (h, mi) => { const t = c.now(); t.setHours(h, mi, 0, 0); move(t); }});
    else if (n.key === 'timezone') { c.ui.settingsStack.push('zones'); c.ui.zoneSort = 'offset'; c.render(); }
    else {
      const values = ['', 'MM-dd-yyyy', 'dd-MM-yyyy', 'yyyy-MM-dd'], cur = s.dateFormat || '';
      const entries = values.map(f => { const text = c.dateFormat(c.shortDatePattern(f), dummyDate(c)); return f ? text : EC.text('settings2').fmt('normal_date_format', c.lang, text); });
      c.dialog({title: txt(n.dialogTitle || n.title), icon: null, items: entries, choice: 'single', checked: values.indexOf(cur), closeOnChoice: true,
        buttons: [{label: EC.text('framework').t('cancel')}],
        onItem: i => { s.dateFormat = values[i]; c.save(); c.render(); }});
    }
  }
  // ZoneList: timezones.xml (ec-timezones.js) as simple_list_item_2 rows, the name over "GMT+01:00", sorted by offset
  // (setSorting(true)) or by name from the menu: Sort alphabetically (ic_menu_sort_alphabetically) / Sort by time zone
  // (ic_menu_3d_globe), each shown while the other order is on. Choosing one sets the zone and finishes.
  function zoneRows(c) {
    const col = {en: 1, hu: 2, de: 3, fr: 4, es: 5}[c.lang] || 1, at = new Date();
    const offset = id => { const g = gmt(id, at), m = g.match(/GMT([+-])(\d+):(\d+)/); return m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 0; };
    const list = (EC.timeZones || []).map(z => ({id: z[0], name: z[col], gmt: gmt(z[0], at), off: offset(z[0])}));
    list.sort(c.ui.zoneSort === 'name' ? (a, b) => a.name.localeCompare(b.name, c.locale()) : (a, b) => a.off - b.off);
    return list.map(z => `<button type="button" class="ecpf-zone" data-action="ecpf-zone" data-zone="${esc(z.id)}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span class="ecpf-zone-name">${esc(z.name)}</span><span class="ecpf-zone-gmt">${esc(z.gmt)}</span></button><i class="ecpf-divider"></i>`).join('');
  }

  // RingerVolumePreference (preference_dialog_ringervolume.xml: incoming call volume, the notification checkbox and its
  // own bar), VolumePreference (seekbar_dialog.xml, media) and BrightnessPreference (preference_dialog_brightness.xml:
  // ic_popup_brightness, Automatic brightness, the bar from 30 to 255 = Power.BRIGHTNESS_DIM + 10 … BRIGHTNESS_ON);
  // DialogPreference buttons OK / Cancel.
  function volumeDialog(c, n) {
    const T2 = EC.text('settings2'), F = EC.text('framework'), s = c.data.settings, v = {...(s.volume || {ring: 5, music: 11, notification: 5})};
    let html, apply;
    if (n.t === 'RingerVolumePreference') {
      let same = s.notificationSameAsRing !== false;
      html = `<div class="ecpf-dlg"><div class="ecpf-dlg-label">${esc(T2.t('incoming_call_volume_title'))}</div>${c.seekbar('ring', v.ring, 7)}
        <div class="ecpf-dlg-check">${c.checkbox('same', same, T2.t('checkbox_notification_same_as_incoming_call'))}</div>
        <div class="ecpf-dlg-notif"${same ? ' hidden' : ''}><div class="ecpf-dlg-label">${esc(T2.t('notification_volume_title'))}</div>${c.seekbar('notification', v.notification, 7)}</div></div>`;
      apply = root => { v.ring = Number(root.querySelector('[data-seek="ring"]').dataset.value); v.notification = Number(root.querySelector('[data-seek="notification"]').dataset.value); s.notificationSameAsRing = root.querySelector('[data-check="same"]').getAttribute('aria-pressed') === 'true'; s.volume = {...s.volume, ...v}; };
    } else if (n.t === 'VolumePreference') {
      html = `<div class="ecpf-dlg">${c.seekbar('music', v.music, 15)}</div>`;
      apply = root => { v.music = Number(root.querySelector('[data-seek="music"]').dataset.value); s.volume = {...s.volume, ...v}; };
    } else {
      const level = s.brightnessLevel ?? 102, auto = s.autoBrightness !== false;
      html = `<div class="ecpf-dlg"><img class="ecpf-dlg-icon" src="assets/st-ic_popup_brightness.png" alt=""><div class="ecpf-dlg-check">${c.checkbox('auto', auto, T2.t('automatic_brightness'))}</div><div class="ecpf-dlg-pad"${auto ? ' hidden' : ''}>${c.seekbar('brightness', level - 30, 225)}</div></div>`;
      apply = root => { s.brightnessLevel = 30 + Number(root.querySelector('[data-seek="brightness"]').dataset.value); s.autoBrightness = root.querySelector('[data-check="auto"]').getAttribute('aria-pressed') === 'true'; c.applyBrightness?.(); };
    }
    const before = s.brightnessLevel;
    c.dialog({title: txt(n.dialogTitle || n.title), icon: null, html,
      mount: root => c.bindSeek(root, (id, val) => { if (id === 'brightness') { s.brightnessLevel = 30 + val; c.applyBrightness?.(); } }),
      action(name, el) {
        if (name !== 'ecui-check') return false;
        const on = el.getAttribute('aria-pressed') !== 'true';
        el.setAttribute('aria-pressed', on); el.querySelector('img').src = `assets/fw-btn_check_${on ? 'on' : 'off'}.png`;
        const root = el.closest('.ecpf-dlg');
        root.querySelector('.ecpf-dlg-notif')?.toggleAttribute('hidden', on);
        root.querySelector('.ecpf-dlg-pad')?.toggleAttribute('hidden', on);
        return true;
      },
      buttons: [{label: F.t('ok'), action: (c2, d, root) => { apply(root); c.save(); c.render(); }},
                {label: F.t('cancel'), action: () => { s.brightnessLevel = before; c.applyBrightness?.(); }}],
      onCancel: () => { s.brightnessLevel = before; c.applyBrightness?.(); }});
  }

  EC.register('settings', {
    title: 'Settings',
    init(c) {
      c.ui.settingsStack = ['settings'];
      // The backlight: 30 … 255 (automatic: the light sensor's daytime level), shown as the panel's brightness.
      // def_screen_brightness 102 and def_screen_brightness_automatic_mode true; the default level shows at full, lower
      // levels darker down to 30.
      c.applyBrightness = () => { const s = c.data.settings, level = s.autoBrightness !== false ? 102 : (s.brightnessLevel ?? 102); c.el.screen.style.filter = level >= 102 ? '' : `brightness(${(0.55 + 0.45 * (level - 30) / 72).toFixed(3)})`; };
      c.applyBrightness();
    },
    render(c) {
      const top = c.ui.settingsStack?.at(-1) || 'settings';
      if (top === 'zones') return c.window(EC.settingsLabels?.ZoneList ? txt(EC.settingsLabels.ZoneList) : S().t('settings_label'), `<div class="ecpf-list">${zoneRows(c)}</div>`);
      if (top.startsWith('missing:')) return c.window(S().t('settings_label'), `<div class="ec-missing"><b>${esc(c.t('Not built yet'))}</b><span>${esc(top.slice(8))}</span><small>Android 2.1 · Settings.apk</small></div>`);
      return render(c);
    },
    action(name, el, event, c) {
      if (name === 'ecpf-zone') { c.data.settings.timeZone = el.dataset.zone; c.save(); c.ui.settingsStack.pop(); c.render(); return true; }
      if (name !== 'ecpf-row') return false;
      const s = current(c), n = nodeAt(s, el.dataset.path);
      if (n) open(c, n, s, el.dataset.path);
      return true;
    },
    menu(c) {
      if (c.ui.settingsStack?.at(-1) !== 'zones') return false;
      const T2 = EC.text('settings2'), byName = c.ui.zoneSort === 'name';
      c.menu([byName ? {label: T2.t('zone_list_menu_sort_by_timezone'), icon: 'st-ic_menu_3d_globe.png', action: () => { c.ui.zoneSort = 'offset'; c.render(); }}
        : {label: T2.t('zone_list_menu_sort_alphabetically'), icon: 'fw-ic_menu_sort_alphabetically.png', action: () => { c.ui.zoneSort = 'name'; c.render(); }}]);
      return true;
    },
    back(c) {
      if ((c.ui.settingsStack?.length || 0) > 1) { c.ui.settingsStack.pop(); c.render(); return true; }
      c.ui.settingsStack = ['settings'];
      return false;
    }
  });
  // Opening Settings from the launcher starts at the top list.
  document.addEventListener('DOMContentLoaded', () => {
    const c = EC.context, base = c.open;
    c.open = (view, sub, opts) => { if (view === 'settings' && c.ui.view !== 'settings') c.ui.settingsStack = ['settings']; return base(view, sub, opts); };
  });
})();
