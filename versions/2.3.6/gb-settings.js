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
  const DEFAULTS = {vibrateMode: 2, screenTimeout: 2, animationLevel: 2, emergencyTone: 0, installLocation: 2, notificationPulse: true, dtmfTone: true, soundEffects: false, lockSounds: false, autoBrightness: true, haptic: true, assistedGps: true, tactileFeedback: true, autoTime: true, powerButtonEndsCall: false, accessibility: false, dateFormat: 0};
  const value = (settings, key) => settings[key] ?? DEFAULTS[key];

  const cat = title => ({kind: 'category', title});
  const go = (title, summary, target, extra = {}) => ({kind: 'screen', title, summary, target, ...extra});
  const check = (key, title, summary, extra = {}) => ({kind: 'check', key, title, summary, ...extra});
  const list = (key, title, summary, array, extra = {}) => ({kind: 'list', key, title, summary, array, ...extra});
  const info = (title, valueText) => ({kind: 'info', title, value: valueText});

  /* Screens; "ics:x" targets reuse the version's existing page (Wi-Fi networks, Bluetooth, lock setup, language). */
  function screens(ctx) {
    const s = ctx.settings, lockSecure = ['pattern', 'pin', 'password'].includes(s.screenLock);
    return {
      main: {title: 'settings_label', items: [
        go('radio_controls_title', '', 'wireless', {icon: 'wireless'}), go('call_settings_title', '', 'call', {icon: 'call'}),
        go('sound_settings_title', '', 'sound', {icon: 'sound'}), go('display_settings_title', '', 'display', {icon: 'display'}),
        go('security_settings_title', '', 'security', {icon: 'security'}), go('applications_settings', '', 'applications', {icon: 'applications'}),
        go('sync_settings', '', 'ics:sync', {icon: 'sync'}), go('privacy_settings', '', 'privacy', {icon: 'privacy'}),
        go('storage_settings', '', 'storage', {icon: 'storage'}), go('language_settings', '', 'language', {icon: 'language'}),
        go('voice_input_output_settings', '', 'voice', {icon: 'speech'}), go('accessibility_settings', '', 'accessibility', {icon: 'accessibility'}),
        go('date_and_time_settings_title', '', 'date', {icon: 'date_time'}), go('about_settings', '', 'about', {icon: 'about'})]},
      wireless: {title: 'radio_controls_title', items: [
        check('airplane', 'airplane_mode', 'airplane_mode_summary'),
        check('wifi', 'wifi_quick_toggle_title', s.wifi && s.wifiNetwork ? {raw: ctx.t('Connected to %1$s').replace('%1$s', s.wifiNetwork)} : 'wifi_quick_toggle_summary', {disabled: s.airplane}),
        go('wifi_settings', 'wifi_settings_summary', 'ics:wifi'),
        check('bluetooth', 'bluetooth_quick_toggle_title', 'bluetooth_quick_toggle_summary', {disabled: s.airplane}),
        go('bluetooth_settings', 'bluetooth_settings_summary', 'ics:bluetooth'),
        go('tether_settings_title_both', 'tether_settings_summary_both', 'tether'),
        go('vpn_settings_title', 'vpn_settings_summary', 'vpn'),
        check('nfc', 'nfc_quick_toggle_title', 'nfc_quick_toggle_summary'),
        go('network_settings_title', 'network_settings_summary', 'mobile', {disabled: s.airplane})]},
      tether: {title: 'tether_settings_title_both', items: [
        check('usbTether', 'usb_tethering_button_text', {raw: ctx.t('USB not connected')}, {disabled: true}),
        check('portableHotspot', 'wifi_tether_checkbox_text', {raw: s.portableHotspot ? ctx.t('Portable hotspot AndroidAP active') : ''}, {disabled: s.airplane}),
        go('wifi_tether_configure_ap_text', 'wifi_tether_configure_subtext', 'toast:Hotspot name: AndroidAP'),
        go('tethering_help_button_text', '', 'toast:Help is not available offline')]},
      sound: {title: 'sound_settings', items: [
        cat('sound_category_sound_title'),
        check('silent', 'silent_mode_title', 'silent_mode_summary'),
        list('vibrateMode', 'vibrate_title', 'vibrate_summary', 'vibrate_entries'),
        go('all_volume_title', '', 'ics:volumes', {disabled: !!s.silent}),
        cat('sound_category_calls_title'), go('ringtone_title', {raw: 'Ring Ring'}, 'ics:ringtone'),
        cat('sound_category_notification_title'), go('notification_sound_title', {raw: 'Tejat'}, 'toast:Tejat'),
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
        lockSecure ? go('unlock_set_unlock_launch_picker_change_title', 'unlock_set_unlock_launch_picker_change_summary', 'ics:lock-setup') : go('unlock_set_unlock_launch_picker_title', 'unlock_set_unlock_launch_picker_summary', 'ics:lock-setup'),
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
        go('runningservices_settings_title', 'runningservices_settings_summary', 'ics:apps'),
        go('storageuse_settings_title', 'storageuse_settings_summary', 'storage'),
        go('power_usage_summary_title', 'power_usage_summary', 'ics:battery'),
        go('development_settings_title', 'development_settings_summary', 'ics:development')]},
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
        cat('language_settings_category'), go('phone_language', {raw: ctx.languageName}, 'ics:language'),
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
    if (item.kind === 'info') {
      const shown = table().strings[item.value] ? text(ctx.lang, item.value) : item.value;
      return `<div class="gbset-row gbset-info"${item.action ? ` data-action="${e(item.action)}" role="button" tabindex="0"` : ''}><span class="gbset-text"><span class="gbset-title">${e(label)}</span>${shown ? `<span class="gbset-sum">${e(shown).replace(/\n/g, '<br>')}</span>` : ''}</span></div>`;
    }
    const icon = item.icon ? `<img class="gbset-icon" src="assets/gb-ic_settings_${item.icon}.png" alt="">` : '';
    const target = item.target || '';
    action = target.startsWith('ics:') ? 'settings-sub' : target.startsWith('toast:') ? 'gbset-toast' : target ? 'gbset-go' : 'noop';
    id = target.replace(/^(ics|toast):/, '');
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

  window.GBSettings = {DEFAULTS, value, text, entries, screens, render, listDialog, has};
})();
