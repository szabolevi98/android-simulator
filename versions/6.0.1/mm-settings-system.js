/* Android 6.0.1 Settings: Date & time, Location, Backup & reset, Language & input and Users (Settings.apk MTC20K), as
   MM.settingsHooks.
   - date_time_prefs (DateTimeSettings): Automatic date & time and time zone on (def_auto_time, def_auto_time_zone),
     Set date / Set time disabled while automatic; the summaries as updateTimeAndDateDisplay sets them: the long date,
     the time, ZoneGetter's "GMT+hh:mm <zone name>", and 24-hour format showing 13:00 or 1:00 PM of a dummy date.
   - location_settings (LocationSettings with its switch bar): Mode (LocationMode: High accuracy, Battery saving, Device
     only, the RadioButtonPreference rows), no work profile, Recent location requests (location_no_recent_apps), the
     location services SettingsInjector finds (GMS Core's Google Location History; its sharing and proximity services
     are disabled in the manifest); Scanning in the overflow (location_scanning: Wi-Fi and Bluetooth scanning, off as
     def_wifi_scan_always_available 0 and ble_scan_always_enabled 0 leave them).
   - privacy_settings (PrivacySettings.getNonVisibleKeys / updateToggles): GSF's com.google.settings provider and an
     active backup service hide "Backup service is inactive"; Back up my data On / Off, the backup account
     (backup_configure_account_default_summary without one), Automatic restore enabled with backup.
   - language_settings (InputMethodAndLanguageSettings): Language with the locale's name, the spell checker LatinImeGoogle's
     Google Spell Checker, Current Keyboard as getImeAndSubtypeDisplayName ("English (US) - Google Keyboard"), the
     enabled input methods (Google Keyboard with its implicit subtype, Google voice typing with Automatic), no hardware
     keyboard and no game controller with a vibrator (both categories go), Pointer speed.
   - user_settings (UserSettings on a phone): You (Owner), Guest, Add user ("Add new user?", then "Set up user now?":
     Not now leaves a "New user" that is "Not set up"). */
(() => {
  'use strict';
  const T = () => MM.text('settings');
  const H = MM.settingsHooks;
  const S = c => c.data.settings;
  const radioRow = (c, n, on) => `<button type="button" class="mmst-pref mmst-radiopref" data-action="mmst-pref" data-key="${n.key}"><i class="mmw-radio${on ? ' on' : ''}"></i><span class="mmst-texts"><span class="mmst-title">${c.safe(MM.settingsStr(n.title))}</span>${n.summary ? `<span class="mmst-summary">${c.safe(MM.settingsStr(n.summary))}</span>` : ''}</span></button>`;

  // -- Date & time ---------------------------------------------------------------------------------------------------
  const h24 = c => S(c).time24 ?? !new Intl.DateTimeFormat(c.locale(), {hour: 'numeric'}).resolvedOptions().hour12;
  function zoneText(c, now) {
    const off = -now.getTimezoneOffset(), sign = off < 0 ? '-' : '+', a = Math.abs(off);
    const gmt = `GMT${sign}${String(Math.floor(a / 60)).padStart(2, '0')}:${String(a % 60).padStart(2, '0')}`;
    let name = '';
    try { name = new Intl.DateTimeFormat(c.locale(), {timeZoneName: 'long'}).formatToParts(now).find(p => p.type === 'timeZoneName')?.value || ''; } catch {}
    return `${gmt} ${name}`.trim();
  }
  H.date_time_prefs = {
    get(c, key) {
      const s = S(c);
      if (key === 'auto_time') return s.autoTime ?? true;
      if (key === 'auto_zone') return s.autoZone ?? true;
      if (key === '24 hour') return h24(c);
      return undefined;
    },
    set(c, key, v) {
      const s = S(c);
      if (key === 'auto_time') { s.autoTime = v; return true; }
      if (key === 'auto_zone') { s.autoZone = v; return true; }
      if (key === '24 hour') { s.time24 = v; MM.system?.changed(c); return true; }
      return false;
    },
    disabled(c, key) {
      const s = S(c);
      if (key === 'date' || key === 'time') return s.autoTime ?? true;
      if (key === 'timezone') return s.autoZone ?? true;
      return false;
    },
    summary(c, key) {
      const now = new Date(), loc = c.locale();
      if (key === 'date') return new Intl.DateTimeFormat(loc, {year: 'numeric', month: 'long', day: 'numeric'}).format(now);
      if (key === 'time') return new Intl.DateTimeFormat(loc, {hour: 'numeric', minute: '2-digit', hour12: !h24(c)}).format(now);
      if (key === 'timezone') return zoneText(c, now);
      if (key === '24 hour') return new Intl.DateTimeFormat(loc, {hour: 'numeric', minute: '2-digit', hour12: !h24(c)}).format(new Date(now.getFullYear(), 11, 31, 13, 0));
      return undefined;
    },
    click(c, key) {
      if (key === 'date' || key === 'time') { MM.settingsGo(c, `missing:android.app.${key === 'date' ? 'DatePickerDialog' : 'TimePickerDialog'}`, ''); return true; }
      return false;
    }
  };

  // -- Location ------------------------------------------------------------------------------------------------------
  const MODES = {high_accuracy: 'location_mode_high_accuracy_title', battery_saving: 'location_mode_battery_saving_title', sensors_only: 'location_mode_sensors_only_title'};
  const mode = c => S(c).locationMode || 'high_accuracy';
  H.location_settings = {
    hidden: ['managed_profile_location_category'],
    disabled: (c, key) => key === 'location_mode' && !S(c).location,
    summary(c, key) {
      if (key === 'location_mode') return T().t(S(c).location ? MODES[mode(c)] : 'location_mode_location_off_title');
      return undefined;
    }
  };
  // The two categories the code fills: no recent request, the injected Location History.
  (() => {
    const base = MM.settingsXml.location_settings; if (!base) return;
    const recent = base.c.find(n => n.key === 'recent_location_requests'), services = base.c.find(n => n.key === 'location_services');
    if (recent && !recent.c) recent.c = [{t: 'Preference', key: 'no_recent_apps', title: 'string/location_no_recent_apps', selectable: 'false'}];
    if (services && !services.c) services.c = [{t: 'Preference', key: 'location_history', title: 'string/PrebuiltGmsCore/location_ulr_setting_label', icon: {icon: 'gms-ic_google.png'}}];
  })();
  H.location_settings.selectable = (c, key) => key !== 'no_recent_apps';
  H.location_settings.click = (c, key) => {
    if (key === 'location_history') { MM.settingsGo(c, 'missing:com.google.android.location.settings.LocationHistorySettingsActivity', T().t('PrebuiltGmsCore/location_ulr_setting_label')); return true; }
    if (key === 'location_mode') { MM.settingsGo(c, 'xml:location_mode', T().t('location_mode_screen_title')); return true; }
    return false;
  };
  H.location_mode = {
    row: (c, key, n) => MODES[key] ? radioRow(c, n, mode(c) === key) : null,
    click(c, key) { if (!MODES[key]) return false; S(c).locationMode = key; c.save(); c.render(); return true; }
  };
  H.location_scanning = {
    get: (c, key) => key === 'wifi_always_scanning' ? !!S(c).wifiScanAlways : key === 'bluetooth_always_scanning' ? !!S(c).bleScanAlways : undefined,
    set(c, key, v) { if (key === 'wifi_always_scanning') S(c).wifiScanAlways = v; else if (key === 'bluetooth_always_scanning') S(c).bleScanAlways = v; else return false; return true; }
  };
  MM.settingsScreens['xml:location_settings'] = {
    bar(c) {
      const on = !!S(c).location, t = T();
      return `<button type="button" class="mmst-switchbar" data-action="mmlo-toggle"><span>${c.safe(t.t(on ? 'switch_on_text' : 'switch_off_text'))}</span><i class="mmw-switch${on ? ' on' : ''}"><i class="mmw-thumb"></i></i></button>`;
    },
    actions: c => MM.menu.button(c),
    action(c, name) {
      if (name === 'mmlo-toggle') { S(c).location = !S(c).location; c.save(); MM.system?.changed(c); c.render(); return true; }
      if (name === 'mm-menu') { c.menu([{label: T().t('location_menu_scanning'), action: c => MM.settingsGo(c, 'xml:location_scanning', T().t('location_scanning_screen_title'))}]); return true; }
      return false;
    }
  };

  // -- Backup & reset ------------------------------------------------------------------------------------------------
  H.privacy_settings = {
    hidden: ['backup_inactive'],
    get: (c, key) => key === 'auto_restore' ? S(c).autoRestore ?? true : undefined,
    set(c, key, v) { if (key !== 'auto_restore') return false; S(c).autoRestore = v; return true; },
    disabled: (c, key) => (key === 'auto_restore' || key === 'configure_account') && !S(c).backup,
    summary(c, key) {
      const t = T();
      if (key === 'backup_data') return t.t(S(c).backup ? 'accessibility_feature_state_on' : 'accessibility_feature_state_off');
      if (key === 'configure_account') return t.t('backup_configure_account_default_summary');
      return undefined;
    }
  };

  // -- Language & input ----------------------------------------------------------------------------------------------
  // LatinIME's subtype for the system locale: English (US) by name, the others subtype_generic ("%s") of the locale's
  // own display name.
  function subtype(c) {
    const lang = c.lang || 'en';
    if (lang === 'en') return T().t('LatinImeGoogle/subtype_en_US');
    try { const n = new Intl.DisplayNames([c.locale()], {type: 'language'}).of(lang); return n.charAt(0).toLocaleUpperCase(c.locale()) + n.slice(1); } catch { return lang; }
  }
  const languageName = c => { try { const n = new Intl.DisplayNames([c.locale()], {type: 'language'}).of(c.locale()); return n.charAt(0).toLocaleUpperCase(c.locale()) + n.slice(1); } catch { return c.locale(); } };
  H.language_settings = {
    hidden: ['hard_keyboard', 'game_controller_settings_category'],
    summary(c, key) {
      const t = T();
      if (key === 'phone_language') return languageName(c);
      if (key === 'spellcheckers_settings') return t.t('LatinImeGoogle/spell_checker_service_name');
      if (key === 'current_input_method') return `${subtype(c)} - ${t.t('LatinImeGoogle/english_ime_name')}`;
      if (key === 'ime_latin') return subtype(c);
      if (key === 'ime_voice') return t.t('Velvet/voice_ime_language_auto');
      return undefined;
    },
    click(c, key) {
      const t = T();
      if (key === 'phone_language') { MM.settingsGo(c, 'missing:com.android.settings.LocalePicker', t.t('phone_language')); return true; }
      if (key === 'ime_latin' || key === 'ime_voice' || key === 'spellcheckers_settings' || key === 'current_input_method' || key === 'key_user_dictionary_settings') { MM.settingsGo(c, `missing:${key}`, ''); return true; }
      return false;
    }
  };
  (() => {
    const cat = MM.settingsXml.language_settings?.c.find(n => n.key === 'keyboard_settings_category');
    if (cat && !cat.c.some(n => n.key === 'ime_latin'))
      cat.c.push({t: 'Preference', key: 'ime_latin', title: 'string/LatinImeGoogle/english_ime_name'}, {t: 'Preference', key: 'ime_voice', title: 'string/Velvet/ime_service_label'});
  })();

  // -- Users ---------------------------------------------------------------------------------------------------------
  // The guest's icon: UserIcons.getDefaultUserIcon(USER_NULL) in user_icon_default_gray #9e9e9e.
  const userRow = (c, key, icon, title, summary) => `<button type="button" class="mmst-pref" data-action="mmst-pref" data-key="${key}"><span class="mmst-iconframe">${key === 'user_guest' ? `<i class="mmst-ic" style="background:#9e9e9e;-webkit-mask-image:url('assets/${icon}');mask-image:url('assets/${icon}')"></i>` : `<img class="mmst-ic" src="assets/${icon}" alt="">`}</span><span class="mmst-texts"><span class="mmst-title">${c.safe(title)}</span>${summary ? `<span class="mmst-summary">${c.safe(summary)}</span>` : ''}</span></button>`;
  H.user_settings = {
    title(c, key) { return key === 'user_add' ? T().t('user_add_user_menu') : undefined; },
    top(c) {
      const t = T(), users = S(c).users || [];
      return `<div class="mmst-cat">${c.safe(t.t('user_list_title'))}</div>${userRow(c, 'user_me', 'fw-ic_account_circle-user0.svg', t.fmt('user_you', null, t.t('user_owner')), '')}
        ${users.map((u, i) => userRow(c, `user_${i}`, 'fw-ic_account_circle-user0.svg', u.name, t.t('user_summary_not_set_up'))).join('')}
        ${userRow(c, 'user_guest', 'fw-ic_account_circle-guest.svg', t.t('user_guest'), '')}`;
    },
    hidden: ['user_list'],
    click(c, key) {
      const t = T(), s = S(c);
      if (key === 'user_add') {
        c.dialog({title: t.t('user_add_user_title'), message: t.t('user_add_user_message_long'), buttons: [{label: t.t('cancel')}, {label: t.t('ok'), action: c => {
          c.dialog({title: t.t('user_setup_dialog_title'), message: t.t('user_setup_dialog_message'), buttons: [
            {label: t.t('user_setup_button_setup_later'), action: c => { s.users = [...(s.users || []), {name: t.t('user_new_user_name')}]; c.save(); c.render(); }},
            {label: t.t('user_setup_button_setup_now'), action: c => { s.users = [...(s.users || []), {name: t.t('user_new_user_name')}]; c.save(); c.overlay('user-add'); }}]});
        }}]});
        return true;
      }
      if (key === 'user_me' || key === 'user_guest' || key?.startsWith('user_')) { MM.settingsGo(c, `missing:com.android.settings.users.${key === 'user_me' ? 'EditUserInfoController' : 'UserDetailsSettings'}`, ''); return true; }
      return false;
    }
  };
})();
