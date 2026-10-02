/* Android 2.3.6 Settings: the preference hierarchies of packages/apps/Settings res/xml (settings.xml, wireless_settings,
   sound_settings, display_settings, security_settings*, application_settings, privacy_settings, device_info_memory,
   language_settings, accessibility_settings, date_time_prefs, device_info_settings, device_info_status, tether_prefs)
   rendered as the Gingerbread preference list: window title bar, listSeparator categories, 64 dip rows with a 22 sp title
   and a 14 sp summary, btn_check widgets and ListPreference radio dialogs. Strings come from gb-settings-strings.js. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const table = () => window.GBSettingsStrings || {strings: {}, arrays: {}};
  const text = (lang, key) => { const entry = table().strings[key]; return entry ? entry[lang] ?? entry.en : key; };
  const entries = (lang, name) => { const entry = table().arrays[name]; return entry ? entry[lang] || entry.en : []; };

  // SettingsProvider defaults.xml and the 2.3.6 AudioService / PackageManager defaults.
  const DEFAULTS = {backgroundData: true, autoSync: true, syncContacts: true, syncCalendar: true, syncEmail: true, vibrateMode: 2, screenTimeout: 2, animationLevel: 2, emergencyTone: 0, installLocation: 2, notificationPulse: true, dtmfTone: true, soundEffects: false, lockSounds: false, autoBrightness: true, haptic: true, assistedGps: true, tactileFeedback: true, autoTime: true, powerButtonEndsCall: false, accessibility: false, dateFormat: 0};
  const value = (settings, key) => settings[key] ?? DEFAULTS[key];

  const cat = title => ({kind: 'category', title});
  const go = (title, summary, target, extra = {}) => ({kind: 'screen', title, summary, target, ...extra});
  const check = (key, title, summary, extra = {}) => ({kind: 'check', key, title, summary, ...extra});
  const list = (key, title, summary, array, extra = {}) => ({kind: 'list', key, title, summary, array, ...extra});
  const info = (title, valueText) => ({kind: 'info', title, value: valueText});

  // Settings arrays wifi_status (index 5: Connected) and wifi_status_with_ssid ("Connected to %1$s").
  function wifiSummary(ctx) {
    const s = ctx.settings;
    if (s.airplane) return 'wifi_in_airplane_mode';
    if (s.wifi && s.wifiNetwork) return {raw: (entries(ctx.lang, 'wifi_status_with_ssid')[5] || 'Connected to %1$s').replace('%1$s', s.wifiNetwork)};
    return 'wifi_quick_toggle_summary';
  }
  /* frameworks/base data/sounds/OriginalAudio.mk (the full crespo build): titles come from the file names; core.mk sets
     ro.config.notification_sound=OnTheHunt.ogg and no default ringtone. */
  const RINGTONES = 'BeatPlucker BentleyDubs BirdLoop CaribbeanIce CrazyDream CurveBall DreamTheme EtherShake FriendlyGhost GameOverGuitar Growl InsertCoin LoopyLounge LoveFlute MidEvilJaunt MildlyAlarming NewPlayer Noises1 Noises2 Noises3 OrganDub Ring_Classic_02 Ring_Digital_02 Ring_Synth_02 Ring_Synth_04 RomancingTheTone SitarVsSitar SpringyJalopy Terminated TwirlAway VeryAlarmed World'.split(' ');
  const NOTIFICATIONS = 'Beat_Box_Android CaffeineSnake DearDeer DontPanic F1_MissedCall F1_New_MMS F1_New_SMS Heaven Highwire KzurbSonar OnTheHunt TaDa Tinkerbell Voila'.split(' ');
  const soundTitle = name => name ? name.replace(/_/g, ' ').replace(/([a-z])([A-Z0-9])/g, '$1 $2').replace(/\s+/g, ' ').trim() : '';
  const LOCALES = [['en', 'English'], ['hu', 'Magyar'], ['de', 'Deutsch'], ['fr', 'Français'], ['es', 'Español']];
  /* Screens; "ics:x" targets reuse the version's existing page (lock setup, accounts, applications, battery). */
  function screens(ctx) {
    const s = ctx.settings, lockSecure = ['pattern', 'pin', 'password'].includes(s.screenLock);
    return {
      main: {title: 'settings_label', items: [
        go('radio_controls_title', '', 'wireless', {icon: 'wireless'}), go('call_settings_title', '', 'call', {icon: 'call'}),
        go('sound_settings_title', '', 'sound', {icon: 'sound'}), go('display_settings_title', '', 'display', {icon: 'display'}),
        go('security_settings_title', '', 'security', {icon: 'security'}), go('applications_settings', '', 'applications', {icon: 'applications'}),
        go('sync_settings', '', 'sync', {icon: 'sync'}), go('privacy_settings', '', 'privacy', {icon: 'privacy'}),
        go('storage_settings', '', 'storage', {icon: 'storage'}), go('language_settings', '', 'language', {icon: 'language'}),
        go('voice_input_output_settings', '', 'voice', {icon: 'speech'}), go('accessibility_settings', '', 'accessibility', {icon: 'accessibility'}),
        go('date_and_time_settings_title', '', 'date', {icon: 'date_time'}), go('about_settings', '', 'about', {icon: 'about'})]},
      wireless: {title: 'radio_controls_title', items: [
        check('airplane', 'airplane_mode', 'airplane_mode_summary'),
        check('wifi', 'wifi_quick_toggle_title', wifiSummary(ctx), {disabled: s.airplane}),
        go('wifi_settings', 'wifi_settings_summary', 'wifi'),
        check('bluetooth', 'bluetooth_quick_toggle_title', 'bluetooth_quick_toggle_summary', {disabled: s.airplane}),
        go('bluetooth_settings', 'bluetooth_settings_summary', 'bluetooth'),
        go('tether_settings_title_both', 'tether_settings_summary_both', 'tether'),
        go('vpn_settings_title', 'vpn_settings_summary', 'vpn'),
        check('nfc', 'nfc_quick_toggle_title', 'nfc_quick_toggle_summary'),
        go('network_settings_title', 'network_settings_summary', 'mobile', {disabled: s.airplane})]},
      tether: {title: 'tether_settings_title_both', items: [
        check('usbTether', 'usb_tethering_button_text', {raw: ctx.t('USB not connected')}, {disabled: true}),
        check('portableHotspot', 'wifi_tether_checkbox_text', {raw: s.portableHotspot ? text(ctx.lang, 'wifi_tether_enabled_subtext').replace('%1$s', 'AndroidAP') : ''}, {disabled: s.airplane}),
        go('wifi_tether_configure_ap_text', 'wifi_tether_configure_subtext', 'toast:Hotspot name: AndroidAP'),
        go('tethering_help_button_text', '', 'toast:Help is not available offline')]},
      sound: {title: 'sound_settings', items: [
        cat('sound_category_sound_title'),
        check('silent', 'silent_mode_title', 'silent_mode_summary'),
        list('vibrateMode', 'vibrate_title', 'vibrate_summary', 'vibrate_entries'),
        go('all_volume_title', '', 'dialog:volume', {disabled: !!s.silent}),
        cat('sound_category_calls_title'), go('ringtone_title', {raw: soundTitle(s.ringtone ?? '')}, 'dialog:ringtone'),
        cat('sound_category_notification_title'), go('notification_sound_title', {raw: soundTitle(s.notificationSound ?? 'OnTheHunt')}, 'dialog:notificationSound'),
        check('notificationPulse', 'notification_pulse_title', 'notification_pulse_summary'),
        cat('sound_category_feedback_title'),
        check('dtmfTone', 'dtmf_tone_enable_title', 'dtmf_tone_enable_summary_on'),
        check('soundEffects', 'sound_effects_enable_title', 'sound_effects_enable_summary_on'),
        check('lockSounds', 'lock_sounds_enable_title', 'lock_sounds_enable_summary_on'),
        check('haptic', 'haptic_feedback_enable_title', 'haptic_feedback_enable_summary_on'),
        list('emergencyTone', 'emergency_tone_title', 'emergency_tone_summary', 'emergency_tone_entries')]},
      display: {title: 'display_settings', items: [
        go('brightness', '', 'brightness'),
        check('rotate', 'accelerometer_title', ''),
        list('animationLevel', 'animations_title', null, 'animations_entries'),
        list('screenTimeout', 'screen_timeout', 'screen_timeout_summary', 'screen_timeout_entries')]},
      security: {title: 'security_settings_title', items: [
        cat('location_title'),
        check('networkLocation', 'location_network_based', s.networkLocation ? 'location_neighborhood_level' : 'location_networks_disabled'),
        check('gps', 'location_gps', s.gps ? 'location_street_level' : 'location_gps_disabled'),
        check('assistedGps', 'assisted_gps', value(s, 'assistedGps') ? 'assisted_gps_enabled' : 'assisted_gps_disabled', {disabled: !s.gps}),
        cat('lock_settings_title'),
        lockSecure ? go('unlock_set_unlock_launch_picker_change_title', 'unlock_set_unlock_launch_picker_change_summary', 'lock:open') : go('unlock_set_unlock_launch_picker_title', 'unlock_set_unlock_launch_picker_summary', 'lock:open'),
        ...(s.screenLock === 'pattern' ? [check('patternVisible', 'lockpattern_settings_enable_visible_pattern_title', '', {fallback: true})] : []),
        ...(lockSecure ? [check('tactileFeedback', 'lockpattern_settings_enable_tactile_feedback_title', '')] : []),
        cat('security_passwords_title'), check('visiblePasswords', 'show_password', 'show_password_summary'),
        cat('device_admin_title'), go('manage_device_admin', 'manage_device_admin_summary', 'toast:No device administrators'),
        cat('credentials_category'),
        check('credentialAccess', 'credentials_access', 'credentials_access_summary', {disabled: true}),
        go('credentials_install_certificates', 'credentials_install_certificates_summary', 'toast:No certificate found on the SD card'),
        go('credentials_set_password', 'credentials_set_password_summary', 'toast:Credential storage is not available offline'),
        go('credentials_reset', 'credentials_reset_summary', null, {disabled: true})]},
      applications: {title: 'applications_settings_header', items: [
        check('unknownSources', 'install_applications', 'install_unknown_applications'),
        list('installLocation', 'app_install_location_title', 'app_install_location_summary', 'app_install_location_entries'),
        go('manageapplications_settings_title', 'manageapplications_settings_summary', 'ics:apps'),
        go('runningservices_settings_title', 'runningservices_settings_summary', 'ics:running'),
        go('storageuse_settings_title', 'storageuse_settings_summary', 'storage'),
        go('power_usage_summary_title', 'power_usage_summary', 'ics:battery'),
        go('development_settings_title', 'development_settings_summary', 'development')]},
      privacy: {title: 'privacy_settings', items: [
        cat('backup_section_title'),
        check('backup', 'backup_data_title', 'backup_data_summary'),
        check('autoRestore', 'auto_restore_title', 'auto_restore_summary', {disabled: !s.backup}),
        cat('personal_data_section_title'),
        go('master_clear_title', 'master_clear_summary', 'ics:reset-info')]},
      storage: {title: 'storage_settings', items: [
        cat('sd_memory'), info('memory_size', '14.84GB'), info('memory_available', '13.92GB'),
        go('sd_eject', 'sd_eject_summary', 'toast:SD card will be unmounted'), go('sd_format', 'sd_format_summary', 'toast:Erasing the SD card is disabled in the simulator'),
        cat('internal_memory'), info('memory_available', '869MB')]},
      language: {title: 'language_settings', items: [
        cat('language_settings_category'), go('phone_language', {raw: ctx.languageName}, 'locale'),
        go('user_dict_settings_titlebar', '', 'toast:No words in user dictionary'),
        cat('keyboard_settings_category'), go('Android keyboard', {raw: ctx.t('Android keyboard settings')}, 'toast:Android keyboard')]},
      voice: {title: 'voice_input_output_settings', items: [
        go('tts_settings', '', 'toast:Pico TTS')]},
      accessibility: {title: 'accessibility_settings', items: [
        check('accessibility', 'accessibility_settings', {raw: ''}, {disabled: true}),
        cat('accessibility_services_category'), info('accessibility_service_no_apps_title', ''),
        cat('accessibility_power_button_category'),
        check('powerButtonEndsCall', 'accessibility_power_button_ends_call', 'accessibility_power_button_ends_call_summary')]},
      date: {title: 'date_and_time', items: [
        check('autoTime', 'date_time_auto', 'date_time_auto_summaryOn'),
        go('date_time_set_date', {raw: ctx.date}, 'toast:Turn off Automatic to set the date', {disabled: value(s, 'autoTime')}),
        go('date_time_set_timezone', {raw: ctx.zone}, 'toast:GMT+01:00, Central European Time', {disabled: value(s, 'autoTime')}),
        go('date_time_set_time', {raw: ctx.time}, 'toast:Turn off Automatic to set the time', {disabled: value(s, 'autoTime')}),
        check('hour24', 'date_time_24hour', {raw: s.hour24 ? '13:00' : '1:00 pm'}),
        list('dateFormat', 'date_time_date_format', null, null, {options: ctx.dateFormats})]},
      about: {title: 'about_settings', items: [
        go('system_update_settings_list_item_title', '', 'toast:Your system is currently up to date.'),
        go('device_status', 'device_status_summary', 'status'),
        go('power_usage_summary_title', 'power_usage_summary', 'ics:battery'),
        go('legal_information', '', 'ics:about-legal'),
        go('system_tutorial_list_item_title', {raw: ctx.t('Learn how to use your phone')}, 'toast:System tutorial'),
        info('model_number', ctx.about.model), {...info('firmware_version', ctx.about.version), action: 'about-tap'},
        info('baseband_version', ctx.about.baseband), info('kernel_version', ctx.about.kernel), info('build_number', ctx.about.build)]},
      status: {title: 'device_status', items: [
        info('battery_status_title', ctx.t('Discharging')), info('battery_level_title', '78%'), info('status_number', ctx.t('Unknown')),
        info('status_operator', ctx.carrier), info('status_signal_strength', s.airplane ? '0 dBm   0 asu' : '-81 dBm   16 asu'),
        info('status_network_type', s.airplane ? 'status_unavailable' : 'HSDPA'), info('status_service_state', ctx.t(s.airplane ? 'Radio off' : 'In service')),
        info('status_roaming', ctx.t('Not roaming')), info('status_data_state', ctx.t(s.airplane ? 'Disconnected' : 'Connected')),
        info('status_imei', '354957034053382'), info('status_imei_sv', '16'),
        info('status_wifi_mac_address', '38:AA:3C:A1:5E:42'), info('status_bt_address', s.bluetooth ? '38:AA:3C:A1:5E:41' : 'status_unavailable'),
        info('status_up_time', ctx.uptime)]},
      call: {title: 'call_settings_title', items: [
        go('Fixed Dialing Numbers', {raw: ctx.t('Manage fixed dialing numbers')}, 'toast:FDN is disabled'),
        go('Voicemail service', {raw: ctx.t('My carrier')}, 'toast:Voicemail service: My carrier'),
        go('Voicemail settings', {raw: ctx.t('Voicemail number not set')}, 'toast:Voicemail number not set'),
        go('Call forwarding', {raw: ctx.t('Forward incoming calls')}, 'toast:Call forwarding settings are offline'),
        go('Additional settings', {raw: ctx.t('Additional GSM only call settings')}, 'toast:Call settings error')]},
      vpn: {title: 'vpn_settings_title', items: [go('Add VPN', '', 'toast:VPN credentials cannot be stored in the simulator'), cat('VPNs')]},
      mobile: {title: 'network_settings_title', items: [
        check('dataEnabled', 'Data enabled', {raw: ctx.t('Enable data access over Mobile network')}),
        check('dataRoaming', 'Data roaming', {raw: ctx.t(s.dataRoaming ? 'Connect to data services when roaming' : 'You have lost data connectivity because you left your home network with data roaming turned off.')}),
        go('Access Point Names', '', 'toast:Internet'), check('only2g', 'Use only 2G networks', {raw: ctx.t('Saves battery')}),
        go('Network operators', {raw: ctx.t('Select a network operator')}, 'toast:Telekom')]},
      // WifiSettings (wifi_settings.xml): the toggle, network notification, the access points and "Add Wi-Fi network".
      wifi: {title: 'wifi_settings_category', menu: [{action: 'gbset-wifi-scan', title: 'wifi_menu_scan', icon: 'ic_menu_refresh'}, {action: 'gbset-go', id: 'wifi-advanced', title: 'wifi_menu_advanced', icon: 'ic_menu_manage'}], items: [
        check('wifi', 'wifi_quick_toggle_title', wifiSummary(ctx), {disabled: s.airplane}),
        check('wifiNotify', 'wifi_notify_open_networks', 'wifi_notify_open_networks_summary', {disabled: !s.wifi}),
        cat('wifi_access_points'),
        ...(s.wifi ? (ctx.networks || []).map(network => ({kind: 'ap', network})) : []),
        go('wifi_add_network', '', 'dialog:wifi-add', {disabled: !s.wifi})]},
      'wifi-advanced': {title: 'wifi_advanced_titlebar', items: [
        list('wifiSleepPolicy', 'wifi_setting_sleep_policy_title', 'wifi_setting_sleep_policy_summary', 'wifi_sleep_policy_entries'),
        info('wifi_advanced_mac_address_title', '38:AA:3C:A1:5E:42'),
        info('wifi_advanced_ip_address_title', s.wifi && s.wifiNetwork ? '192.168.1.104' : 'status_unavailable')]},
      // BluetoothSettings (bluetooth_settings.xml).
      bluetooth: {title: 'bluetooth_settings', items: [
        check('bluetooth', 'bluetooth', 'bluetooth_quick_toggle_summary', {disabled: s.airplane}),
        go('bluetooth_device_name', {raw: s.bluetoothName || 'Nexus S'}, 'dialog:bt-name', {disabled: !s.bluetooth}),
        check('bluetoothVisible', 'bluetooth_visibility', {raw: s.bluetoothVisible ? text(ctx.lang, 'bluetooth_is_discoverable').replace('%1$s', '120') : text(ctx.lang, 'bluetooth_not_discoverable')}, {disabled: !s.bluetooth}),
        list('btTimeout', 'bluetooth_visibility_timeout', 'bluetooth_visibility_timeout_summary', 'bluetooth_visibility_timeout_entries', {disabled: !s.bluetooth}),
        go('bluetooth_preference_scan_title', '', 'gbset-bt-scan', {disabled: !s.bluetooth, action: true}),
        cat('bluetooth_devices'),
        ...(s.bluetooth ? (ctx.btDevices || []).map(device => ({kind: 'bt', device})) : [])]},
      // DevelopmentSettings (development_prefs.xml).
      development: {title: 'development_settings_title', items: [
        check('usbDebug', 'enable_adb', 'enable_adb_summary'),
        check('stayAwake', 'keep_screen_on', 'keep_screen_on_summary'),
        check('mockLocations', 'allow_mock_location', 'allow_mock_location_summary')]},
      // LocalePicker: the supported locales as a plain list.
      locale: {title: 'phone_language', items: LOCALES.map(([code, name]) => ({kind: 'locale', code, name}))},
      brightness: null
    };
  }

  const resolve = (lang, t, item) => typeof item === 'object' && item ? (item.raw ?? '') : item ? (table().strings[item] ? text(lang, item) : t(item)) : '';
  function row(item, ctx) {
    const label = resolve(ctx.lang, ctx.t, item.title);
    if (item.kind === 'category') return `<div class="gbset-cat">${e(label)}</div>`;
    const disabled = item.disabled ? ' disabled aria-disabled="true"' : '';
    let summary = resolve(ctx.lang, ctx.t, item.summary), widget = '', action = '', id = '';
    if (item.kind === 'check') {
      const on = !!(ctx.settings[item.key] ?? DEFAULTS[item.key] ?? (item.fallback ? true : false));
      widget = `<img class="gbset-check" src="assets/gb-btn_check_${on ? 'on' : 'off'}${item.disabled ? '_disable' : ''}.png" alt="">`;
      action = 'gbset-check'; id = item.key;
      return `<button class="gbset-row" data-action="${action}" data-id="${e(id)}" role="checkbox" aria-checked="${on}"${disabled}><span class="gbset-text"><span class="gbset-title">${e(label)}</span>${summary ? `<span class="gbset-sum">${e(summary)}</span>` : ''}</span>${widget}</button>`;
    }
    if (item.kind === 'list') {
      const options = item.options || entries(ctx.lang, item.array);
      if (item.summary === null) summary = options[value(ctx.settings, item.key)] ?? '';
      return `<button class="gbset-row" data-action="gbset-list" data-id="${e(item.key)}"${disabled}><span class="gbset-text"><span class="gbset-title">${e(label)}</span>${summary ? `<span class="gbset-sum">${e(summary)}</span>` : ''}</span></button>`;
    }
    if (item.kind === 'ap') {
      // AccessPoint: SSID, "Connected" or "Secured with WPA2" / "Remembered", and the (lock) signal icon.
      const n = item.network, connected = ctx.settings.wifiNetwork === n.name, secured = n.security !== 'Open';
      const status = connected ? entries(ctx.lang, 'wifi_status')[5] : secured ? text(ctx.lang, 'wifi_secured').replace('%1$s', n.security) : '';
      return `<button class="gbset-row" data-action="gbset-ap" data-id="${e(n.name)}"><span class="gbset-text"><span class="gbset-title">${e(n.name)}</span>${status ? `<span class="gbset-sum">${e(status)}</span>` : ''}</span><img class="gbset-signal" src="assets/gb-set-ic_wifi_${secured ? 'lock_' : ''}signal_${Math.max(1, Math.min(4, n.strength))}.png" alt=""></button>`;
    }
    if (item.kind === 'bt') {
      const d = item.device;
      return `<button class="gbset-row with-icon" data-action="gbset-bt-device" data-id="${e(d.name)}"><img class="gbset-icon gbset-bt-icon" src="assets/gb-set-ic_bt_${d.kind || 'headset_hfp'}.png" alt=""><span class="gbset-text"><span class="gbset-title">${e(d.name)}</span><span class="gbset-sum">${e(text(ctx.lang, d.paired ? (d.connected ? 'bluetooth_connected' : 'bluetooth_paired') : 'bluetooth_not_connected'))}</span></span></button>`;
    }
    if (item.kind === 'locale') return `<button class="gbset-row gbset-locale" data-action="gbset-locale" data-id="${e(item.code)}"><span class="gbset-text"><span class="gbset-title">${e(item.name)}</span></span></button>`;
    if (item.kind === 'info') {
      const shown = table().strings[item.value] ? text(ctx.lang, item.value) : item.value;
      return `<div class="gbset-row gbset-info"${item.action ? ` data-action="${e(item.action)}" role="button" tabindex="0"` : ''}><span class="gbset-text"><span class="gbset-title">${e(label)}</span>${shown ? `<span class="gbset-sum">${e(shown).replace(/\n/g, '<br>')}</span>` : ''}</span></div>`;
    }
    const icon = item.icon ? `<img class="gbset-icon" src="assets/gb-ic_settings_${item.icon}.png" alt="">` : '';
    const target = item.target || '';
    action = item.action ? target : target.startsWith('ics:') ? 'settings-sub' : target.startsWith('toast:') ? 'gbset-toast' : target.startsWith('dialog:') ? 'gbset-dialog' : target ? 'gbset-go' : 'noop';
    id = item.action ? '' : target.replace(/^(ics|toast|dialog):/, '');
    // The screen-lock rows hand over to the credential controller (ChooseLockGeneric).
    if (target === 'lock:open') return `<button class="gbset-row" data-lock-action="open"${disabled}><span class="gbset-text"><span class="gbset-title">${e(label)}</span>${summary ? `<span class="gbset-sum">${e(summary)}</span>` : ''}</span></button>`;
    return `<button class="gbset-row${icon ? ' with-icon' : ''}" data-action="${action}" data-id="${e(id)}"${disabled}>${icon}<span class="gbset-text"><span class="gbset-title">${e(label)}</span>${summary ? `<span class="gbset-sum">${e(summary)}</span>` : ''}</span></button>`;
  }
  function render(id, ctx) {
    const all = screens(ctx), screen = all[id || 'main'];
    if (!screen) return null;
    const title = resolve(ctx.lang, ctx.t, screen.title);
    return {title, html: `<div class="app-view gbset" data-no-translate><div class="gb-titlebar">${e(title)}</div><div class="gbset-list">${screen.items.map(item => row(item, ctx)).join('')}</div></div>`};
  }
  function listDialog(key, ctx) {
    const items = Object.values(screens(ctx)).filter(Boolean).flatMap(screen => screen.items).find(item => item.kind === 'list' && item.key === key);
    if (!items) return null;
    const options = items.options || entries(ctx.lang, items.array);
    return {title: resolve(ctx.lang, ctx.t, items.title), items: options.map((label, index) => ({action: 'gbset-list-pick', id: `${key}:${index}`, title: label})), choice: 'single', selected: value(ctx.settings, key), buttons: [{action: 'close-overlay', title: text(ctx.lang, 'fw_cancel')}]};
  }
  const has = id => !!screens({settings: {}, t: k => k, about: {}, lang: 'en'})[id || 'main'];
  const menu = (id, ctx) => (screens(ctx)[id || 'main']?.menu || []).map(item => ({...item, title: text(ctx.lang, item.title)}));
  /* Dialogs: RingerVolumePreference (ringtone, media, alarm sliders and the notification checkbox/slider),
     RingtonePickerActivity (Silent + the sounds, OK / Cancel), the WifiDialog and the Bluetooth name EditTextPreference. */
  function dialog(kind, ctx) {
    const s = ctx.settings, T = key => text(ctx.lang, key), ok = T('fw_ok'), cancel = T('fw_cancel');
    const slider = (key, label, fallback) => `<label class="gbvol"><span>${e(label)}</span><input type="range" min="0" max="100" data-vol="${key}" value="${Number(s[key] ?? fallback)}"></label>`;
    if (kind === 'volume') {
      const same = s.notificationSameAsRing !== false;
      return {title: T('all_volume_title'), custom: `<div class="gbvols">${slider('ringVolume', T('incoming_call_volume_title'), 70)}<label class="gbvol-check"><input type="checkbox" data-vol-same ${same ? 'checked' : ''}> ${e(T('checkbox_notification_same_as_incoming_call'))}</label>${slider('notificationVolume', T('notification_volume_title'), 70).replace('<label class="gbvol"', `<label class="gbvol" data-vol-notification${same ? ' hidden' : ''}`)}${slider('mediaVolume', T('media_volume_title'), 60)}${slider('alarmVolume', T('alarm_volume_title'), 80)}</div>`, buttons: [{action: 'gbset-volume-ok', title: ok}, {action: 'close-overlay', title: cancel}]};
    }
    if (kind === 'ringtone' || kind === 'notificationSound') {
      const names = kind === 'ringtone' ? RINGTONES : NOTIFICATIONS, current = s[kind] ?? (kind === 'ringtone' ? '' : 'OnTheHunt');
      const options = ['', ...names];
      return {title: T(kind === 'ringtone' ? 'ringtone_title' : 'notification_sound_title'), items: options.map(name => ({action: 'gbset-sound-pick', id: `${kind}:${name}`, title: name ? soundTitle(name) : ctx.t('Silent')})), choice: 'single', selected: Math.max(0, options.indexOf(current)), buttons: [{action: 'close-overlay', title: ok}, {action: 'close-overlay', title: cancel}]};
    }
    if (kind === 'bt-name') return {title: T('bluetooth_device_name'), custom: `<label class="gbdlg-field"><input data-bt-name maxlength="40" value="${e(s.bluetoothName || 'Nexus S')}"></label>`, buttons: [{action: 'gbset-bt-name-ok', title: ok}, {action: 'close-overlay', title: cancel}]};
    if (kind.startsWith('ap:')) {
      const n = (ctx.networks || []).find(item => item.name === kind.slice(3)); if (!n) return null;
      const connected = s.wifiNetwork === n.name, secured = n.security !== 'Open';
      const signal = ctx.t(['Poor', 'Poor', 'Fair', 'Good', 'Excellent'][n.strength] || 'Good');
      const rows = connected ? [[T('wifi_status'), entries(ctx.lang, 'wifi_status')[5]], [T('wifi_signal'), signal], [T('wifi_speed'), '54Mbps'], [T('wifi_security'), secured ? n.security : ctx.t('None')], [T('wifi_ip_address'), '192.168.1.104']]
        : [[T('wifi_security'), secured ? n.security : ctx.t('None')], [T('wifi_signal'), signal]];
      const body = `<dl class="gbwifi">${rows.map(([k, v]) => `<dt>${e(k)}</dt><dd>${e(v)}</dd>`).join('')}</dl>${!connected && secured ? `<label class="gbdlg-field"><span>${e(T('wifi_password'))}</span><input type="password" data-wifi-password maxlength="63"></label><label class="gbvol-check"><input type="checkbox" data-wifi-show> ${e(T('wifi_show_password'))}</label>` : ''}`;
      return {title: n.name, custom: body, buttons: connected ? [{action: 'gbset-wifi-forget', id: n.name, title: T('wifi_forget')}, {action: 'close-overlay', title: T('wifi_cancel')}] : [{action: 'gbset-wifi-connect', id: n.name, title: T('wifi_connect')}, {action: 'close-overlay', title: T('wifi_cancel')}]};
    }
    if (kind === 'wifi-add') return {title: T('wifi_add_network'), custom: `<label class="gbdlg-field"><span>${e(T('wifi_ssid'))}</span><input data-wifi-ssid maxlength="32"></label>`, buttons: [{action: 'gbset-wifi-save', title: T('wifi_save')}, {action: 'close-overlay', title: T('wifi_cancel')}]};
    if (kind === 'adb') return {title: T('adb_warning_title'), icon: 'ic_dialog_alert', message: ctx.t('USB debugging is intended for development purposes only. It can be used to copy data between your computer and your device, install applications on your device without notification, and read log data.'), buttons: [{action: 'gbset-adb-ok', title: T('fw_yes')}, {action: 'close-overlay', title: T('fw_no')}]};
    return null;
  }

  window.GBSettings = {DEFAULTS, value, text, entries, screens, render, listDialog, has, menu, dialog, soundTitle, RINGTONES, NOTIFICATIONS};
})();
