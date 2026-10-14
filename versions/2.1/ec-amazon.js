/* Android 2.1 Amazon MP3 1.6 (com.amazon.mp3.apk, "MP3 Store"), as the phone shows it with no connection.
   - LauncherActivity / HomeActivity: Region.detectRegion maps the phone's locale through LOCALE_TO_REGION_MAP (en_US,
     en_GB, fr_FR, de_DE, de_AT, de_CH); any other locale (here Spanish and Hungarian) opens InvalidLocaleActivity
     ("Amazon MP3 - Unsupported Locale": the English, French and German explanations, invalidlocaleview.xml).
   - HomeActivity (home.xml, titled "Amazon MP3 (US)" / (DE) / (FR)): the home_banner of the region on #2c2c2c, its
     shadow, the 48 dp home_button_background buttons (#f8f8e9 to #d4d4b3, 2 sp black stroke, 4 sp corners; 18 sp bold):
     Top 100 Albums, Top 100 Songs, Browse By Genre, Search (home_search), the Terms of Service link (EulaDialog
     informative: "License Agreement", the terms, OK) and Configuration.VERSION_STRING "v1.6" (12 sp #888).
   - First run (FirstRunDialog.showIfFirstRun): res/raw/configurations gives en_US on T-Mobile a url_upsell, so the
     "Please Note" dialog (icon_application) asks for the carrier's data plan: Learn More opens the page, Continue goes on.
   - The lists (BrowseActivity, GenreBrowseActivity, SearchActivity) start with loadingitemsview.xml ("Loading..." with
     the spinner, #2c2c2c, 48 dp) and, offline, end with retryitemview.xml ("Connection failed. Tap here to retry.").
   - MainMenu.create: Downloads and Settings on the home screen; Home, Search, Downloads and Settings elsewhere.
     DownloadActivity: "No downloads."; SettingsActivity (settingsview.xml): Amazon.com account, Remember me, Monitor
     connection, Clear cache, Build ("1.6+10", VERSION_STRING_ADVANCED). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const A = () => EC.text('amazon');
  const t = k => A().t(k);
  const REGIONS = {en: '', de: '_de', fr: '_fr'};   // the simulator's English is en_US
  const supported = c => c.lang in REGIONS;
  const UPSELL = 'https://my.t-mobile.com/pda', TOS = 'http://www.amazon.com/gp/dmusic/help/device-eula.html/ref=dm_android_eula';
  let timer = 0;
  const prefs = c => ({enable_one_click: false, enable_connectivity_changed_receiver: true, account_username: '', ...c.data.amazonPrefs});
  const stack = c => (c.ui.amazonStack ||= []);
  const top = c => stack(c).at(-1) || 'home';
  const open = (c, page) => { stack(c).push(page); c.ui.amazonState = 'loading'; c.render(); load(c); };
  // Every lookup goes to amazon.com: "Loading..." until the request fails.
  function load(c) {
    clearTimeout(timer);
    c.ui.amazonState = 'loading';
    timer = setTimeout(() => { if (c.ui.view === 'amazon-mp3') { c.ui.amazonState = 'retry'; c.render(); } }, 2500);
  }
  const status = c => c.ui.amazonState === 'retry'
    ? `<button type="button" class="ecam-item" data-action="ecam-retry"><span>${esc(t('dmusic_status_retry_query'))}</span></button>`
    : `<div class="ecam-item"><img class="ecam-spin" src="assets/fw-spinner_white_16.png" alt=""><span>${esc(t('dmusic_status_loading'))}</span></div>`;
  function home(c) {
    const b = (action, label) => `<button type="button" class="ecam-btn" data-action="${action}"><span>${esc(label)}</span></button>`;
    return c.window(t('dmusic_activity_home'), `<div class="ecam-home"><div class="ecam-banner"><img src="assets/am-home_banner${REGIONS[c.lang]}.png" alt=""></div><img class="ecam-shadow" src="assets/am-home_banner_shadow.png" alt="">
      ${b('ecam-albums', t('dmusic_home_top_albums'))}${b('ecam-tracks', t('dmusic_home_top_tracks'))}${b('ecam-genre', t('dmusic_home_browse_by_genre'))}
      <button type="button" class="ecam-btn" data-action="ecam-search"><img src="assets/am-home_search.png" alt=""><span>${esc(t('dmusic_home_search'))}</span></button>
      <button type="button" class="ecam-tos" data-action="ecam-tos">${esc(t('dmusic_home_terms_of_service'))}</button><div class="ecam-version">v1.6</div></div>`);
  }
  function settings(c) {
    const p = prefs(c);
    const row = (key, title, summary, check) => `<button type="button" class="ecpf-row" data-action="ecam-pref" data-key="${key}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span class="ecpf-text"><span class="ecpf-title">${esc(title)}</span>${summary ? `<span class="ecpf-summary">${esc(summary)}</span>` : ''}</span>${check === undefined ? '' : `<img class="ecpf-check" src="assets/fw-btn_check_${check ? 'on' : 'off'}.png" alt="">`}</button><i class="ecpf-divider"></i>`;
    return c.window(t('dmusic_activity_settings'), `<div class="ecpf-list">${row('account_username', t('dmusic_setting_username_title'), t('dmusic_setting_username_desc'))}${row('enable_one_click', t('dmusic_setting_1click_title'), t('dmusic_setting_1click_on_desc'), p.enable_one_click)}
      ${row('enable_connectivity_changed_receiver', t('dmusic_setting_monitor_connection_title'), t('dmusic_setting_monitor_connection_desc'), p.enable_connectivity_changed_receiver)}${row('clear_caches', t('dmusic_setting_clear_cache_title'), t('dmusic_setting_clear_cache_desc'))}${row('build_number', t('dmusic_setting_build_title'), '1.6+10')}</div>`);
  }
  function render(c) {
    if (!supported(c)) return c.window(t('dmusic_activity_invalid_locale'), `<div class="ecam-invalid">${['en', 'fr', 'de'].map(l => `<p>${esc(t(`dmusic_unsupported_locale_text_${l}`))}</p>`).join('')}</div>`);
    const page = top(c);
    if (page === 'home') return home(c);
    if (page === 'settings') return settings(c);
    if (page === 'downloads') return c.window(t('dmusic_activity_downloads'), `<div class="ecam-empty">${esc(t('dmusic_download_no_downloads'))}</div>`);
    const title = {albums: 'dmusic_activity_browse', tracks: 'dmusic_activity_browse', genre: 'dmusic_activity_browse_by_genre', search: 'dmusic_activity_search'}[page];
    return c.window(t(title), `<div class="ecam-list">${status(c)}</div>`);
  }
  function search(c) {
    c.searchDialog({icon: 'app-amazon-mp3.png', hint: t('search_hint'), onGo: q => { if (q.trim()) open(c, 'search'); }});
  }
  function firstRun(c) {
    if (c.data.amazonFirstRun || c.lang !== 'en') return;   // only en_US.T-Mobile has a url_upsell
    const done = () => { c.data.amazonFirstRun = true; c.save(); };
    c.dialog({title: t('dmusic_first_run_data_plan_title'), icon: 'app-amazon-mp3.png', message: AndroidStrings.format(t('dmusic_first_run_data_plan_desc'), 'T-Mobile', 'T-Mobile'),
      buttons: [{label: t('dmusic_button_continue'), action: done}, {label: t('dmusic_button_learn_more'), action: () => { done(); c.ui.browserGo = UPSELL; c.open('browser'); }}]});
  }
  function pref(c, key) {
    const p = prefs(c), set = v => { c.data.amazonPrefs = {...c.data.amazonPrefs, [key]: v}; c.save(); c.render(); };
    if (key === 'enable_one_click' || key === 'enable_connectivity_changed_receiver') { set(!p[key]); return; }
    if (key === 'account_username') {
      const F = EC.text('framework');
      c.dialog({title: t('dmusic_setting_username_title'), icon: null, html: `<div class="ecpf-dlg"><div class="ecpf-dlg-label">${esc(t('dmusic_setting_username_entry_desc').trim())}</div><span class="ecwf-edit ecam-field npp-fw-textfield_default"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><input class="ecwf-input" data-field="value" type="email" data-ime="email" value="${esc(p.account_username)}" autocomplete="off" spellcheck="false"></span></div>`,
        buttons: [{label: F.t('ok'), action: (c2, d, root) => set(root.querySelector('[data-field=value]')?.value || '')}, {label: F.t('cancel')}]});
    }
  }
  EC.register('amazon-mp3', {
    title: 'MP3 Store',
    render,
    start(c) { c.ui.amazonStack = []; clearTimeout(timer); if (supported(c)) setTimeout(() => firstRun(c), 0); },
    action(name, el, event, c) {
      switch (name) {
        case 'ecam-albums': open(c, 'albums'); return true;
        case 'ecam-tracks': open(c, 'tracks'); return true;
        case 'ecam-genre': open(c, 'genre'); return true;
        case 'ecam-search': search(c); return true;
        case 'ecam-retry': load(c); c.render(); return true;
        case 'ecam-pref': pref(c, el.dataset.key); return true;
        case 'ecam-tos':
          c.dialog({title: t('dmusic_eula_title'), icon: null, html: `<div class="ecam-eula">${esc(t('dmusic_eula_text'))}</div>`, buttons: [{label: t('dmusic_button_ok')}]});
          return true;
      }
      return false;
    },
    menu(c) {
      if (!supported(c) || top(c) === 'settings') return false;
      const item = (label, icon, fn) => ({label: t(label), icon: `am-menu_${icon}.png`, action: fn});
      const downloads = item('dmusic_menu_main_downloads', 'downloads', () => { stack(c).push('downloads'); c.render(); });
      const settings = item('dmusic_menu_main_settings', 'settings', () => { stack(c).push('settings'); c.render(); });
      c.menu(top(c) === 'home' ? [downloads, settings]
        : [item('dmusic_menu_main_home', 'home', () => { clearTimeout(timer); c.ui.amazonStack = []; c.render(); }), item('dmusic_menu_main_search', 'search', () => search(c)), downloads, settings]);
      return true;
    },
    back(c) {
      clearTimeout(timer);
      if (supported(c) && stack(c).length) { stack(c).pop(); if (['albums', 'tracks', 'genre', 'search'].includes(top(c))) load(c); c.render(); return true; }
      return false;
    }
  });
  document.addEventListener('DOMContentLoaded', () => {
    const c = EC.context, base = c.open;
    c.open = (view, sub, opts) => { const fresh = c.ui.view !== view; const r = base(view, sub, opts); if (fresh && view === 'amazon-mp3') EC.module('amazon-mp3').start(c); return r; };
  });
})();
