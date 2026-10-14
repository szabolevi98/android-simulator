/* Android 2.1 News and Weather 1.2.02 - RC2 (GenieWidget.apk), as the phone shows it with no connection.
   - EC.news is the data service the miniwidget and the app share: a refresh is "connecting..." until the attempt fails.
   - NewsActivity (Theme.NoTitleBar, news_list_layout.xml on #1a1a1a): the tab row and the pages are only built when a
     fetch succeeds (NewsActivity$6.success → ViewMediator.showTabView), so offline the page stays empty above the 60 dp
     progress panel (widget_bg; bold progressMessage over the 240 x 5 dp loadingbar): "connecting...", then
     NewsActivity$6.failure's "Sorry, network error. Please try later.". Menu (main_menu.xml): Refresh (disabled while
     refreshing, onMenuOpened) and Settings.
   - Preferences (PreferenceActivity, titled with the app's name): Preferences.onCreate puts the Weather settings screen
     (location_preferences.xml: Use my location, Set location, Use Celsius) first, then preferences.xml: News settings
     (Select news topics: Custom Topics with Custom topic, News Topics — offline "No topics available" / "Network error,
     please retry later."; Prefetch articles, Prefetch images with the "Attention" warning, Display images; News terms of
     service), Refresh settings (Auto-refresh, Refresh interval 6 hours by default, Refresh status) and Application
     version ("Version: 1.2.02 - RC2(PROD)", GConfig.BACKEND). Set location asks "Specify your location", then searches
     and fails like the rest. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const N = () => EC.text('news');
  const t = k => N().t(k);
  const CONNECT_MS = 4000;
  let started = Date.now(), shown = null;
  EC.news = {
    connecting: () => Date.now() - started < CONNECT_MS,
    refresh() { started = Date.now(); },
    // True once when the attempt's outcome changes, for the widget's redraw.
    changed() { const now = EC.news.connecting(); if (now === shown) return false; shown = now; return true; }
  };
  const VERSION = '1.2.02 - RC2';
  const INTERVALS = ['1800', '3600', '10800', '21600', '43200', '86400'];
  const prefs = c => ({use_my_location: true, temperature_unit_celsius: false, prefetch_pages_key: false, prefetch_images_key: false,
    display_images_key: true, auto_refresh: true, refresh_interval: '21600', ...c.data.newsPrefs});
  const setPref = (c, key, v) => { c.data.newsPrefs = {...c.data.newsPrefs, [key]: v}; c.save(); };

  // Preference rows (the framework's preference.xml rows: 22 sp title, 14 sp summary, the checkbox widget).
  const row = (key, title, summary, check, disabled) => `<button type="button" class="ecpf-row" data-action="ecnw-pref" data-key="${key}"${disabled ? ' disabled' : ''}><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span class="ecpf-text"><span class="ecpf-title">${esc(title)}</span>${summary ? `<span class="ecpf-summary">${esc(summary)}</span>` : ''}</span>${check === undefined ? '' : `<img class="ecpf-check" src="assets/fw-btn_check_${check ? 'on' : 'off'}.png" alt="">`}</button><i class="ecpf-divider"></i>`;
  const cat = title => `<div class="ecpf-cat npp-fw-dark_header_dither"><i class="ec-bg np-fw-dark_header_dither"></i><span>${esc(title)}</span></div>`;
  const SCREENS = {
    root: c => [t('app_name'), row('screen_weather', t('pref_screen_weather'), t('pref_screen_weather_desc')) + row('screen_news', t('pref_screen_news'), t('pref_screen_news_desc'))
      + row('screen_refresh', t('pref_screen_refresh'), t('pref_screen_refresh_desc')) + row('screen_about', t('pref_screen_version'), N().fmt('version', c.lang, `${VERSION}(PROD)`))],
    screen_weather: c => { const p = prefs(c); return [t('pref_screen_weather'), row('use_my_location', t('pref_use_my_location'), t('pref_use_my_location_desc'), p.use_my_location)
      + row('set_location', t('pref_set_location'), t('pref_set_location_desc')) + row('temperature_unit_celsius', t('pref_temperature_unit'), t('pref_temperature_unit_desc'), p.temperature_unit_celsius)]; },
    screen_news: c => { const p = prefs(c); return [t('pref_screen_news'), row('screen_topics', t('pref_screen_select_topics'), t('pref_screen_select_topics_desc'))
      + row('prefetch_pages_key', t('pref_prefetch_pages'), t('pref_prefetch_pages_desc'), p.prefetch_pages_key) + row('prefetch_images_key', t('pref_prefetch_images'), t('pref_prefetch_images_desc'), p.prefetch_images_key)
      + row('display_images_key', t('pref_display_images'), t('pref_display_images_desc'), p.display_images_key) + row('screen_legal', t('pref_screen_legal'))]; },
    screen_topics: () => [t('pref_screen_select_topics'), cat(t('pref_screen_custom_topics')) + row('custom_topic', t('pref_custom_topic_title'), t('pref_custom_topic_summary'))
      + cat(t('pref_screen_standard_topics')) + row('no_topic', t('pref_no_topic'), t('pref_no_topic_desc'), undefined, true)],
    screen_refresh: c => { const p = prefs(c); return [t('pref_screen_refresh'), row('auto_refresh', t('pref_auto_refresh'), t('pref_auto_refresh_desc'), p.auto_refresh)
      + row('refresh_interval', t('pref_refresh_interval'), '', undefined, !p.auto_refresh) + row('screen_refreshStatus', t('pref_screen_refreshStatus'))]; }
  };
  const stack = c => (c.ui.newsStack ||= []);
  function pref(c, key) {
    const p = prefs(c);
    if (SCREENS[key]) { stack(c).push(key); c.render(); return; }
    switch (key) {
      case 'use_my_location': case 'temperature_unit_celsius': case 'display_images_key': case 'auto_refresh': setPref(c, key, !p[key]); c.render(); return;
      case 'prefetch_pages_key': case 'prefetch_images_key':
        setPref(c, key, !p[key]); c.render();
        // setUpDownloadingPreferences: turning prefetching on warns about the data it uses.
        if (!p[key]) c.dialog({title: t('warning_prefetch_title'), icon: 'fw-ic_dialog_alert.png', message: t('warning_prefetch_body'), buttons: [{label: t('button_okay')}]});
        return;
      case 'refresh_interval':
        c.dialog({title: t('dlg_refresh_interval'), icon: null, items: t('array_refresh_interval_descs'), choice: 'single', checked: INTERVALS.indexOf(p.refresh_interval), closeOnChoice: true,
          buttons: [{label: EC.text('framework').t('cancel')}], onItem: i => { setPref(c, 'refresh_interval', INTERVALS[i]); c.render(); }});
        return;
      case 'set_location': ask(c, t('dlg_set_location'), t('enterlocation'), () => search(c)); return;
      case 'custom_topic': ask(c, t('pref_custom_topic_dialog_title'), t('pref_custom_topic_dialog_message'), v => { if (!v.trim()) c.toast(t('empty_topic_name')); else search(c); }); return;
      case 'screen_legal': stack(c).push('legal'); c.render(); setTimeout(() => { if (stack(c).at(-1) === 'legal') { c.ui.newsLegalFailed = true; c.render(); } }, 1500); return;
    }
  }
  // An EditTextPreference-style dialog: the message over a text field, OK / Cancel.
  function ask(c, title, message, done) {
    const F = EC.text('framework');
    c.dialog({title, icon: null, html: `<div class="ecpf-dlg"><div class="ecpf-dlg-label">${esc(message)}</div><span class="ecwf-edit ecnw-field npp-fw-textfield_default"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><input class="ecwf-input" data-field="value" autocomplete="off" spellcheck="false"></span></div>`,
      buttons: [{label: F.t('ok'), action: (c2, d, root) => setTimeout(() => done(root?.querySelector('[data-field=value]')?.value || ''), 0)}, {label: F.t('cancel')}]});
  }
  function search(c) {
    c.dialog({title: '', icon: null, cancelable: false, html: `<div class="ecsys-progress"><img class="ecsys-spinner" src="assets/fw-spinner_white_48.png" alt=""><span>${esc(t('searching'))}</span></div>`});
    setTimeout(() => { c.closeDialog(); c.toast(t('networkfailure')); }, 2000);
  }

  function main(c) {
    const busy = EC.news.connecting();
    return `<div class="ecnw"><div class="ecnw-progress npp-nw-widget_bg"><i class="ec-bg np-nw-widget_bg"></i><span class="ecnw-msg">${esc(busy ? t('connecting') : t('networkfailure'))}</span><span class="ecnw-bar"><i></i></span></div></div>`;
  }
  function settings(c) {
    const top = stack(c).at(-1);
    if (top === 'legal') return c.window(t('legal_activity_title'), `<div class="ecnw-legal">${esc(c.ui.newsLegalFailed ? t('legal_activity_unavailable') : t('legal_activity_loading'))}</div>`);
    const [title, body] = SCREENS[top](c);
    return c.window(title, `<div class="ecpf-list ecnw-prefs">${body}</div>`);
  }
  let timer = 0;
  EC.register('news-weather', {
    title: 'News and Weather',
    render: c => stack(c).length ? settings(c) : main(c),
    start(c) {
      c.ui.newsStack = []; EC.news.refresh();
      clearTimeout(timer); timer = setTimeout(() => { if (c.ui.view === 'news-weather') c.render(); }, CONNECT_MS + 50);
    },
    action(name, el, event, c) { if (name !== 'ecnw-pref') return false; pref(c, el.dataset.key); return true; },
    menu(c) {
      if (stack(c).length) return false;
      c.menu([{label: t('menu_item_refresh'), icon: 'nw-ic_menu_refresh.png', disabled: EC.news.connecting(), action: () => EC.module('news-weather').start(c) || c.render()},
        {label: t('menu_item_setting'), icon: 'fw-ic_menu_preferences.png', action: () => { c.ui.newsStack = ['root']; c.render(); }}]);
      return true;
    },
    back(c) {
      const s = stack(c);
      if (s.length) { if (s.pop() === 'legal') c.ui.newsLegalFailed = false; c.render(); return true; }
      clearTimeout(timer);
      return false;
    }
  });
  document.addEventListener('DOMContentLoaded', () => {
    const c = EC.context, open = c.open;
    c.open = (view, sub, opts) => { const fresh = c.ui.view !== view; const r = open(view, sub, opts); if (fresh && view === 'news-weather') { EC.module('news-weather').start(c); c.render(); } return r; };
  });
})();
