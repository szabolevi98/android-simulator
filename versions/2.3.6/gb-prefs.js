/* Android 2.3.6 application preference screens on the GB preference rows (gbset-*): Browser's BrowserPreferencesPage
   (browser_preferences.xml), Calendar's CalendarPreferenceActivity (preferences.xml) and Email's AccountSettings
   (account_settings_preferences.xml). Values live in data.appPrefs[app][key]; a list stores the entry index. Summaries
   follow the activities: Browser shows the text size, zoom and encoding entries and the home page, Calendar the home
   time zone and the version, Email the description, name, signature and check frequency. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const S = (set, lang, key) => { const entry = window.GBStrings?.[set]?.strings?.[key]; return entry ? entry[lang] ?? entry.en : key; };
  const A = (set, lang, key) => { const entry = window.GBStrings?.[set]?.arrays?.[key]; return entry ? entry[lang] || entry.en : []; };
  const cat = title => ({kind: 'category', title});
  const check = (key, title, summary, def = true, extra = {}) => ({kind: 'check', key, title, summary, def, ...extra});
  const list = (key, title, options, def, extra = {}) => ({kind: 'list', key, title, options, def, ...extra});
  const action = (key, title, summary, extra = {}) => ({kind: 'action', key, title, summary, ...extra});
  const SEARCH_ENGINES = ['Google', 'Yahoo!', 'Bing'];
  const TZ_DEFAULT = 'America/Los_Angeles';
  const SCREENS = {
    browser(ctx) {
      const T = key => S('browser', ctx.lang, key), v = ctx.values, size = A('browser', ctx.lang, 'pref_text_size_choices'), zoom = A('browser', ctx.lang, 'pref_default_zoom_choices'), enc = A('browser', ctx.lang, 'pref_default_text_encoding_choices');
      const yesno = (key, base) => action(key, T(base), T(base + '_summary'), {confirm: {title: T('clear'), message: T(base + '_dlg')}});
      return {set: 'browser', title: T('menu_preferences'), items: [
        cat(T('pref_content_title')),
        list('text_size', T('pref_text_size'), size, 2, {dialogTitle: T('pref_text_size_dialogtitle'), showValue: true}),
        list('default_zoom', T('pref_default_zoom'), zoom, 1, {dialogTitle: T('pref_default_zoom_dialogtitle'), showValue: true}),
        check('load_page', T('pref_content_load_page'), T('pref_content_load_page_summary')),
        list('default_text_encoding', T('pref_default_text_encoding'), enc, 0, {dialogTitle: T('pref_default_text_encoding_dialogtitle'), showValue: true}),
        check('block_popup_windows', T('pref_content_block_popups')),
        check('load_images', T('pref_content_load_images'), T('pref_content_load_images_summary')),
        check('autofit_pages', T('pref_content_autofit'), T('pref_content_autofit_summary')),
        check('landscape_only', T('pref_content_landscape_only'), T('pref_content_landscape_only_summary'), false),
        check('enable_javascript', T('pref_content_javascript')),
        list('plugin_state', T('pref_content_plugins'), A('browser', ctx.lang, 'pref_content_plugins_choices'), 0, {dialogTitle: T('pref_content_plugins')}),
        check('open_in_background', T('pref_content_open_in_background'), T('pref_content_open_in_background_summary'), false),
        action('homepage', T('pref_content_homepage'), v.homepage ?? ctx.homepage, {edit: {title: T('pref_content_homepage'), value: v.homepage ?? ctx.homepage}}),
        cat(T('pref_privacy_title')),
        yesno('privacy_clear_cache', 'pref_privacy_clear_cache'),
        yesno('privacy_clear_history', 'pref_privacy_clear_history'),
        check('accept_cookies', T('pref_security_accept_cookies'), T('pref_security_accept_cookies_summary')),
        yesno('privacy_clear_cookies', 'pref_privacy_clear_cookies'),
        check('save_formdata', T('pref_security_save_form_data'), T('pref_security_save_form_data_summary')),
        yesno('privacy_clear_form_data', 'pref_privacy_clear_form_data'),
        check('enable_geolocation', T('pref_privacy_enable_geolocation'), T('pref_privacy_enable_geolocation_summary')),
        {...yesno('privacy_clear_geolocation_access', 'pref_privacy_clear_geolocation_access'), dependency: 'enable_geolocation'},
        cat(T('pref_security_title')),
        check('remember_passwords', T('pref_security_remember_passwords'), T('pref_security_remember_passwords_summary')),
        yesno('privacy_clear_passwords', 'pref_privacy_clear_passwords'),
        check('show_security_warnings', T('pref_security_show_security_warning'), T('pref_security_show_security_warning_summary')),
        cat(T('pref_extras_title')),
        list('search_engine', T('pref_content_search_engine'), SEARCH_ENGINES, 0, {dialogTitle: T('pref_content_search_engine'), summary: T('pref_content_search_engine_summary')}),
        // BrowserPreferencesPage disables Website settings while no site has stored data.
        action('website_settings', T('pref_extras_website_settings'), T('pref_extras_website_settings_summary'), {disabled: true}),
        action('reset_default_preferences', T('pref_extras_reset_default'), T('pref_extras_reset_default_summary'), {confirm: {title: T('pref_extras_reset_default_dlg_title'), message: T('pref_extras_reset_default_dlg')}})
      ]};
    },
    calendar(ctx) {
      const T = key => S('calendar', ctx.lang, key), v = ctx.values, labels = A('calendar', ctx.lang, 'timezone_labels'), values = A('calendar', ctx.lang, 'timezone_values');
      return {set: 'calendar', title: T('preferences_title'), items: [
        cat(T('preferences_general_title')),
        check('preferences_hide_declined', T('preferences_hide_declined_title'), '', false),
        check('preferences_home_tz_enabled', T('preferences_use_home_tz_title'), T('preferences_use_home_tz_descrip'), false),
        list('preferences_home_tz', T('preferences_home_tz_title'), labels, Math.max(0, values.indexOf(TZ_DEFAULT)), {dialogTitle: T('preferences_home_tz_title'), showValue: true, dependency: 'preferences_home_tz_enabled'}),
        cat(T('preferences_alerts_title')),
        list('preferences_alerts_type', T('preferences_alerts_type_title'), A('calendar', ctx.lang, 'preferences_alert_type_labels'), 1, {dialogTitle: T('preferences_alerts_type_dialog')}),
        action('preferences_alerts_ringtone', T('preferences_alerts_ringtone_title'), '', {ringtone: true}),
        list('preferences_alerts_vibrateWhen', T('preferences_alerts_vibrateWhen_title'), A('calendar', ctx.lang, 'prefEntries_alerts_vibrateWhen'), 2, {dialogTitle: T('prefDialogTitle_vibrateWhen'), summary: T('preferences_alerts_vibrateWhen_summary')}),
        list('preferences_default_reminder', T('preferences_default_reminder_title'), A('calendar', ctx.lang, 'preferences_default_reminder_labels'), 3, {dialogTitle: T('preferences_default_reminder_dialog')}),
        cat(T('preferences_about_title')),
        action('build_version', T('preferences_build_version'), '2.3.6', {info: true})
      ]};
    },
    email(ctx) {
      const T = key => S('email', ctx.lang, key), v = ctx.values, freq = A('email', ctx.lang, 'account_settings_check_frequency_entries');
      const text = (key, label, fallback, hint) => action(key, T(label), (v[key] ?? fallback) || (hint ? T(hint) : ''), {edit: {title: T(label), value: v[key] ?? fallback}});
      return {set: 'email', title: T('account_settings_action'), items: [
        cat(T('account_settings_title_fmt')),
        text('account_description', 'account_settings_description_label', ctx.account),
        text('account_name', 'account_settings_name_label', ctx.name),
        text('account_signature', 'account_settings_signature_label', '', 'account_settings_signature_hint'),
        list('account_check_frequency', T('account_settings_mail_check_frequency_label'), freq, 3, {dialogTitle: T('account_settings_mail_check_frequency_label'), showValue: true}),
        check('account_default', T('account_settings_default_label'), T('account_settings_default_summary'), true),
        cat(T('account_settings_notifications')),
        check('account_notify', T('account_settings_notify_label'), T('account_settings_notify_summary')),
        {...action('account_ringtone', T('account_settings_ringtone'), '', {ringtone: true}), dependency: 'account_notify'},
        list('account_settings_vibrate_when', T('account_settings_vibrate_when_label'), A('email', ctx.lang, 'account_settings_vibrate_when_entries'), 2, {dialogTitle: T('account_settings_vibrate_when_dlg_title'), summary: T('account_settings_vibrate_when_summary'), dependency: 'account_notify'}),
        cat(T('account_settings_servers')),
        action('incoming', T('account_settings_incoming_label'), '', {toast: true}),
        action('outgoing', T('account_settings_outgoing_label'), '', {toast: true})
      ]};
    }
  };
  const screen = ctx => SCREENS[ctx.app]?.(ctx);
  const get = (item, values) => values[item.key] ?? item.def;
  const enabled = (item, s, values) => !item.disabled && (!item.dependency || !!get(s.items.find(i => i.key === item.dependency), values));
  function row(item, s, ctx) {
    if (item.kind === 'category') return `<div class="gbset-cat">${e(item.title)}</div>`;
    const on = enabled(item, s, ctx.values), dis = on ? '' : ' disabled aria-disabled="true"', id = `${ctx.app}:${item.key}`;
    const body = summary => `<span class="gbset-text"><span class="gbset-title">${e(item.title)}</span>${summary ? `<span class="gbset-sum">${e(summary)}</span>` : ''}</span>`;
    if (item.kind === 'check') { const value = !!get(item, ctx.values); return `<button class="gbset-row" data-action="gbpref-check" data-id="${e(id)}" role="checkbox" aria-checked="${value}"${dis}>${body(item.summary)}<img class="gbset-check" src="assets/gb-btn_check_${value ? 'on' : 'off'}${on ? '' : '_disable'}.png" alt=""></button>`; }
    if (item.kind === 'list') return `<button class="gbset-row" data-action="gbpref-list" data-id="${e(id)}"${dis}>${body(item.showValue ? item.options[get(item, ctx.values)] : item.summary)}</button>`;
    if (item.info) return `<div class="gbset-row gbset-info">${body(item.summary)}</div>`;
    return `<button class="gbset-row" data-action="gbpref-action" data-id="${e(id)}"${dis}>${body(item.summary)}</button>`;
  }
  function render(ctx) {
    const s = screen(ctx); if (!s) return '';
    return `<div class="app-view gbset" data-no-translate><div class="gb-titlebar">${e(s.title)}</div><div class="gbset-list">${s.items.map(item => row(item, s, ctx)).join('')}</div></div>`;
  }
  const find = (ctx, key) => screen(ctx)?.items.find(item => item.key === key);
  const fw = (lang, key) => S('framework', lang, key);
  // ListPreference, DialogPreference (Browser's yes / no), EditTextPreference and RingtonePreference dialogs.
  function dialog(ctx, key) {
    const item = find(ctx, key); if (!item) return null;
    const id = `${ctx.app}:${key}`, ok = fw(ctx.lang, 'ok'), cancel = fw(ctx.lang, 'cancel');
    if (item.kind === 'list') return {title: item.dialogTitle || item.title, items: item.options.map((label, i) => ({action: 'gbpref-pick', id: `${id}:${i}`, title: label})), choice: 'single', selected: get(item, ctx.values), buttons: [{action: 'close-overlay', title: cancel}]};
    if (item.confirm) return {title: item.confirm.title, icon: 'ic_dialog_alert', message: item.confirm.message, buttons: [{action: 'gbpref-confirm', id, title: ok}, {action: 'close-overlay', title: cancel}]};
    if (item.edit) return {title: item.edit.title, custom: `<label class="gbdlg-field"><input data-pref-edit maxlength="200" value="${e(item.edit.value || '')}"></label>`, buttons: [{action: 'gbpref-edit-ok', id, title: ok}, {action: 'close-overlay', title: cancel}]};
    if (item.ringtone) {
      const sounds = ['default', '', ...(window.GBSettings?.NOTIFICATIONS || [])], current = ctx.values[key] ?? 'default';
      const name = n => n === 'default' ? fw(ctx.lang, 'ringtone_default') : n ? window.GBSettings.soundTitle(n) : fw(ctx.lang, 'ringtone_silent');
      return {title: fw(ctx.lang, 'ringtone_picker_title'), items: sounds.map(n => ({action: 'gbpref-pick', id: `${id}:${n}`, title: name(n)})), choice: 'single', selected: Math.max(0, sounds.indexOf(current)), buttons: [{action: 'close-overlay', title: ok}, {action: 'close-overlay', title: cancel}]};
    }
    return null;
  }
  window.GBPrefs = {SCREENS, render, dialog, find, get};
})();
