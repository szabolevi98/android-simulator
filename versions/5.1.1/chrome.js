/* Chrome 40.0.2214.89 on the Nexus 6 (Chrome.apk of LMY48Y): the Material #F2F2F2 toolbar (#505050 incognito) with the
   white omnibox (magnifier or page icon, "Search or type URL"), the tab switcher with the count and the menu; pages come
   from the simulator's offline demo web shared with the AOSP Browser. From the APK:
   - main_menu.xml as ChromeAppMenuPropertiesDelegate.prepareMenu shows it: three_button_menu_item.xml's Forward,
     Bookmark this page and Refresh, then New tab, New incognito tab, Bookmarks, Recent tabs (not in incognito),
     History, Share… (not on chrome:// pages), Print…, Find in page and Request desktop site (not on native pages such
     as the New Tab page), Add to homescreen, Settings, Help & feedback; OVERVIEW_MODE_MENU in the tab switcher;
   - the native New Tab page (new_tab_page.xml; Chrome 40 has no chrome://newtab web page any more): the Google logo,
     the 48 dp search box, MostVisitedLayout's 156 x 130 dp most_visited_item.xml tiles (the 12 sp title above the
     148 x 94 dp thumbnail on #f2f2f2 with 2 dp corners, 16 dp apart) and NewTabPageToolbar's Bookmarks / Recent tabs;
   - new_tab_page_incognito.xml: #222222, incognito_splash, the 24 sp light #d2d2d2 header, the 14 sp #bdbdbd message
     and LEARN MORE in #03a9f4.
   Texts are the APK's (stock-strings.js, group chrome). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const NTP = 'chrome://newtab', HISTORY = 'chrome://history';
  const internal = url => String(url).startsWith('chrome://');
  // Chrome 40's own drawables (chr40-*).
  const img = (name, cls = '') => `<img${cls ? ` class="${cls}"` : ''} src="assets/chr40-${name}.png" alt="">`;
  const tabsButton = count => `<button type="button" class="chr-btn chr-tabs-btn" data-action="browser-tabs" aria-label="Tabs"><span>${count > 99 ? ':D' : count}</span></button>`;
  const menuButton = '<button type="button" class="chr-btn" data-action="browser-menu" aria-label="More options">' + img('btn_menu') + '</button>';
  const display = url => internal(url) ? '' : url.startsWith('search:') ? url.slice(7) : url;
  function toolbar(ctx) {
    const {url, t, tabs, incognito} = ctx;
    const lead = url === NTP || internal(url) ? 'ic_omnibox_magnifier' : 'ic_omnibox_page';
    return `<div class="chr-toolbar chr40-toolbar${incognito ? ' incognito' : ''}"><form class="chr-omnibox chr40-omnibox" data-form="address"><img class="chr40-lead" src="assets/chr40-${lead}.png" alt=""><input name="address" autocomplete="off" spellcheck="false" aria-label="${e(t('Search or type URL'))}" placeholder="${e(t('Search or type URL'))}" value="${e(url === NTP ? '' : display(url))}"></form>${tabsButton(tabs.length)}${menuButton}</div>`;
  }
  function thumb(ctx, url) {
    return `<div class="browser-page" inert aria-hidden="true">${ctx.page(url)}</div>`;
  }
  function mostVisited(ctx) {
    const seen = [];
    for (const url of [...ctx.data.browserHistory].reverse().concat(ctx.data.bookmarks || [])) if (!internal(url) && !url.startsWith('search:') && !seen.some(item => item.toLowerCase() === url.toLowerCase())) seen.push(url);
    return seen.slice(0, 6);
  }
  function newTabPage(ctx) {
    const {t, ui, incognito} = ctx;
    if (incognito) return `<div class="chr-ntp chr40-ntp incognito"><div class="chr-ntp-scroll"><div class="chr40-otr"><img src="assets/chr40-incognito_splash.png" alt=""><h3>${e(CS(ctx, "You've gone incognito."))}</h3><p>${e(CS(ctx, 'Incognito message'))}</p><button type="button" class="chr40-learn" data-action="chrome-unsupported">${e(CS(ctx, 'Learn more'))}</button></div></div></div>`;
    const section = ui.chromeNtp || 'most';
    let body;
    if (section === 'bookmarks') body = `<h3 class="chr-ntp-title">${e(t('Mobile bookmarks'))}</h3><div class="chr-bookmarks">${(ctx.data.bookmarks || []).map(url => `<button class="chr-bookmark" data-action="browser-bookmark" data-id="${e(url)}"><span class="chr-favicon">${e(ctx.title(url).slice(0, 1).toUpperCase())}</span><span>${e(ctx.title(url))}</span></button>`).join('') || `<p class="chr-empty">${e(t('No bookmarks'))}</p>`}</div>`;
    else if (section === 'devices') body = `<div class="chr-devices">${img('recent_laptop')}<p>${e(t('Tabs that you have open in Chrome on your other devices will appear here.'))}</p><p>${e(t('Sign in to Chrome to see them.'))}</p></div>`;
    else body = `<div class="chr40-logo"><img src="assets/chr40-google_logo.png" alt="Google"></div><form class="chr40-fakebox" data-form="address"><input name="address" autocomplete="off" aria-label="${e(CS(ctx, 'Search or type URL'))}" placeholder="${e(CS(ctx, 'Search or type URL'))}"><button type="button" data-action="voice-search" aria-label="${e(t('Voice search'))}"><img src="assets/chr40-btn_omnibox_mic_normal.png" alt=""></button></form><div class="chr-most chr40-most">${mostVisited(ctx).map(url => `<div class="chr-tile" role="button" tabindex="0" data-action="browser-link" data-url="${e(url)}" aria-label="${e(ctx.title(url))}"><span class="chr-tile-title">${e(ctx.title(url))}</span><div class="chr-tile-thumb">${thumb(ctx, url)}</div></div>`).join('')}</div>`;
    const tab = (id, label, img) => `<button class="${section === id ? 'active' : ''}" data-action="chrome-ntp" data-id="${section === id && id !== 'most' ? 'most' : id}"><img src="assets/chr40-${img}.png" alt=""><span>${e(CS(ctx, label))}</span></button>`;
    const bar = `<nav class="chr-ntp-bar chr40-ntp-bar">${tab('bookmarks', 'Bookmarks', 'eb_star')}${tab('devices', 'Recent tabs', 'btn_recents')}</nav>`;
    return `<div class="chr-ntp chr40-ntp chr-ntp-${section}"><div class="chr-ntp-scroll">${body}</div>${bar}</div>`;
  }
  function historyPage(ctx) {
    const {t, data, locale} = ctx;
    const query = String(ctx.ui.chromeHistoryQuery || '').toLocaleLowerCase();
    const rows = [...new Set([...data.browserHistory].reverse())].filter(url => !internal(url) && (!query || `${ctx.title(url)} ${url}`.toLocaleLowerCase().includes(query))).slice(0, 40);
    return `<div class="chr-history"><form class="chr-history-search" data-form="chrome-history-search"><input name="query" aria-label="${e(t('Search history'))}" placeholder="${e(t('Search history'))}" value="${e(ctx.ui.chromeHistoryQuery || '')}"><button type="submit">${e(t('Search history'))}</button></form><button class="chr-clear" data-action="chrome-clear-open">${e(t('Clear browsing data…'))}</button><h3>${e(new Date().toLocaleDateString(locale, {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'}))}</h3>${rows.map(url => `<button class="chr-history-row" data-action="browser-link" data-url="${e(url)}"><span class="chr-globe">${img('ic_suggestion_page')}</span><span><strong>${e(ctx.title(url))}</strong><small>${e(display(url))}</small></span></button>`).join('') || `<p class="chr-empty">${e(t('No history'))}</p>`}</div>`;
  }
  function find(ctx) {
    if (ctx.ui.browserFind === undefined) return '';
    return `<form class="web-find chr-find" data-form="browser-find"><input name="query" aria-label="${e(ctx.t('Find in page'))}" placeholder="${e(ctx.t('Find in page'))}" value="${e(ctx.ui.browserFind)}"><button type="submit">${e(ctx.t('Search'))}</button><button type="button" data-action="browser-close-find" aria-label="Close">×</button></form><div class="web-find-count" aria-live="polite"></div>`;
  }
  function switcher(ctx) {
    const {t, tabs, active} = ctx;
    const cards = tabs.map((tab, i) => `<article class="chr-card${i === active ? ' current' : ''}${tab.incognito ? ' incognito' : ''}" style="--i:${i}"><div class="chr-card-page" role="button" tabindex="0" data-action="browser-tab" data-id="${i}" aria-label="${e(ctx.title(tab.url))}">${tab.url === NTP ? `<div class="chr-card-ntp">${tab.incognito ? img('incognito_splash', 'chr40-card-incognito') : '<img src="assets/chrome.png" alt="">'}</div>` : thumb(ctx, tab.url)}</div><div class="chr-card-tab"><span class="chr-globe">${img('ic_suggestion_page')}</span><button data-action="browser-tab" data-id="${i}">${e(tab.url === NTP ? t('New tab') : ctx.title(tab.url))}</button><button class="chr-card-close" data-action="browser-close-tab" data-id="${i}" aria-label="${e(t('Close tab'))}">${img('btn_tab_close_normal')}</button></div></article>`).join('');
    return `<div class="app-view ics-browser chr-app chr-switcher-view"><div class="chr-switcher-bar"><button class="chr-new-tab" data-action="browser-new-tab">${img('btn_new_tab_white_normal')}<span>${e(t('New tab'))}</span></button>${tabsButton(tabs.length)}${menuButton}</div><div class="chr-stack">${cards}</div></div>`;
  }
  /* Settings (audit step 5), Chrome 40.0.2214.89: main_preferences.xml (Sign in to Chrome; Basics: Search engine, Merge tabs and apps, Autofill forms, Save passwords, Home page; Advanced: Privacy, Accessibility, Site settings, Reduce data usage, About Chrome) in PreferencesTheme (Material Light, the #263238 bar, accent #03a9f4). privacy_preferences.xml: the check boxes with their summaries, the
     Usage and crash reports list and 'Do Not Track'; PRIVACY_MENU's Clear browsing data opens
     the dialog: Clear browsing history, Clear the cache and Clear cookies, site data ticked, Clear saved passwords and
     Clear autofill data not, Cancel / Clear, then "Clearing browsing data" / "Please wait…". The history page's link
     opens the same dialog. Clearing the history empties the history page and Most visited. About Chrome lists the
     application version and the operating system. Texts come from the image's Chrome (stock-strings.js). */
  const PREFS = {version: '40.0.2214.89', os: 'Android 5.1.1; Nexus 6 Build/LMY48Y', material: true,
    headers: [['signin', 'Sign in to Chrome'], ['cat', 'Basics'], ['search_engine', 'Search engine', 'Google'], ['tabs_apps', 'Merge tabs and apps'], ['autofill', 'Autofill forms'], ['passwords', 'Save passwords'], ['homepage', 'Home page'], ['cat', 'Advanced'], ['privacy', 'Privacy'], ['accessibility', 'Accessibility'], ['content', 'Content settings'], ['bandwidth', 'Reduce data usage'], ['about', 'About Chrome']],
    privacy: [['check', 'navigation_error', 'Navigation error suggestions', 'Navigation error summary'], ['check', 'search_suggestions', 'Search and URL suggestions', 'Search suggestions summary'], ['screen', 'contextual', 'Touch to Search'], ['list', 'network_predictions', 'Network action predictions', ['Always', 'Only on Wi-Fi', 'Never'], 1], ['list', 'crash', 'Usage and crash reports', ['Always send', 'Only send on Wi-Fi', 'Never send'], 2], ['screen', 'dnt', "'Do Not Track'", 'Off']],
    topMenu: [['chrome-unsupported', 'Help']], clearInBar: false};
  const CS = (ctx, key) => { const row = window.StockStrings?.chrome?.[key], i = ['hu', 'de', 'fr', 'es'].indexOf(String(ctx.locale || 'en').slice(0, 2)); return row ? (i >= 0 ? row[i] : row[4] || key) : ctx.t(key); };
  const CLEAR_ITEMS = [['history', 'Clear browsing history', true], ['cache', 'Clear the cache', true], ['cookies', 'Clear cookies, site data', true], ['passwords', 'Clear saved passwords', false], ['formdata', 'Clear autofill data', false]];
  const prefValue = (ctx, key, fallback) => (ctx.data.chromePrefs || {})[key] ?? fallback;
  function clearDialog(ctx) {
    const c = ctx.ui.chromeClear, s = key => CS(ctx, key);
    if (!c) return '';
    if (c.busy) return `<div class="chr-dlg-scrim"></div><div class="chr-dlg chr-dlg-progress" role="alertdialog"><h3>${e(s('Clearing browsing data'))}</h3><div class="chr-dlg-busy"><i class="chr-spinner"></i><p>${e(s('Please wait…'))}</p></div></div>`;
    const rows = CLEAR_ITEMS.map(([key, label]) => `<button type="button" class="chr-dlg-check${c[key] ? ' on' : ''}" data-action="chrome-clear-toggle" data-id="${key}" role="checkbox" aria-checked="${!!c[key]}"><span>${e(s(label))}</span><i></i></button>`).join('');
    return `<button type="button" class="chr-dlg-scrim" data-action="chrome-clear-cancel" aria-label="${e(s('Cancel'))}"></button><div class="chr-dlg" role="dialog"><h3>${e(s('Clear browsing data'))}</h3><div class="chr-dlg-list">${rows}</div><div class="chr-dlg-buttons"><button type="button" data-action="chrome-clear-cancel">${e(s('Cancel'))}</button><button type="button" data-action="chrome-clear-run"${CLEAR_ITEMS.some(([key]) => c[key]) ? '' : ' disabled'}>${e(s('Clear'))}</button></div></div>`;
  }
  function listDialog(ctx) {
    const open = ctx.ui.chromeList, s = key => CS(ctx, key);
    const item = open && PREFS.privacy.find(row => row[0] === 'list' && row[1] === open);
    if (!item) return '';
    const value = prefValue(ctx, item[1], item[4]);
    return `<button type="button" class="chr-dlg-scrim" data-action="chrome-list-close" aria-label="${e(s('Cancel'))}"></button><div class="chr-dlg" role="dialog"><h3>${e(s(item[2]))}</h3><div class="chr-dlg-list">${item[3].map((label, i) => `<button type="button" class="chr-dlg-radio${value === i ? ' on' : ''}" data-action="chrome-list-pick" data-id="${item[1]}:${i}" role="radio" aria-checked="${value === i}"><span>${e(s(label))}</span><i></i></button>`).join('')}</div><div class="chr-dlg-buttons"><button type="button" data-action="chrome-list-close">${e(s('Cancel'))}</button></div></div>`;
  }
  function settings(ctx) {
    const {ui} = ctx, s = key => CS(ctx, key), page = ui.chromePref || '';
    const title = page === 'privacy' ? s('Privacy') : page === 'about' ? s('About Chrome') : s('Settings');
    const row = (action, id, label, summary = '', extra = '') => `<button type="button" class="chr-pref" data-action="${action}" data-id="${id}"><span class="chr-pref-text"><b>${e(label)}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span>${extra}</button>`;
    let body;
    if (page === 'privacy') body = PREFS.privacy.map(item => item[0] === 'check'
      ? row('chrome-pref-toggle', item[1], s(item[2]), s(item[3]), `<i class="chr-pref-check${prefValue(ctx, item[1], true) ? ' on' : ''}" role="checkbox" aria-checked="${!!prefValue(ctx, item[1], true)}"></i>`)
      : item[0] === 'list' ? row('chrome-list-open', item[1], s(item[2]), s(item[3][prefValue(ctx, item[1], item[4])]))
      : row('chrome-unsupported', item[1], s(item[2]), item[3] ? s(item[3]) : '')).join('');
    else if (page === 'about') body = row('chrome-noop', 'version', s('Application version'), `Chrome ${PREFS.version}`) + row('chrome-noop', 'os', s('Operating system'), PREFS.os) + row('chrome-unsupported', 'legal', s('Legal information'));
    else body = PREFS.headers.map(([id, label, summary]) => id === 'cat' ? `<h4 class="chr-pref-cat">${e(s(label))}</h4>` : row(['privacy', 'about'].includes(id) ? 'chrome-pref' : 'chrome-unsupported', id, s(label), summary || '')).join('');
    const menuItems = page === 'privacy' ? [...(PREFS.clearInBar ? [] : [['chrome-clear-open', 'Clear browsing data']]), ['chrome-unsupported', 'Help']] : page ? [] : PREFS.topMenu;
    const clearButton = page === 'privacy' && PREFS.clearInBar ? `<button type="button" class="chr-pref-action" data-action="chrome-clear-open">${e(s('Clear browsing data'))}</button>` : '';
    const overflow = menuItems.length ? `<button type="button" class="chr-pref-more" data-action="chrome-pref-menu" aria-label="${e(ctx.t('More options'))}"><i></i><i></i><i></i></button>` : '';
    const popup = ui.chromePrefMenu && menuItems.length ? `<button type="button" class="chr-pref-popup-scrim" data-action="chrome-pref-menu" aria-label="${e(ctx.t('Close'))}"></button><div class="chr-pref-popup" role="menu">${menuItems.map(([action, label, id]) => `<button type="button" role="menuitem" data-action="${action}"${id ? ` data-id="${id}"` : ''}>${e(s(label))}</button>`).join('')}</div>` : '';
    return `<div class="app-view chr-prefs${PREFS.material ? ' material' : ''}"><header class="chr-pref-bar"><button type="button" class="chr-pref-up" data-action="back" aria-label="${e(ctx.t('Navigate up'))}">${PREFS.material ? '<i></i>' : '<img class="chr-pref-caret" src="assets/ic_ab_back_holo_light.png" alt=""><img class="chr-pref-icon" src="assets/chrome.png" alt="">'}</button><b>${e(title)}</b>${clearButton}${overflow}</header><div class="chr-pref-scroll">${body}</div>${popup}${listDialog(ctx)}${clearDialog(ctx)}</div>`;
  }
  function render(ctx) {
    if (ctx.ui.sub === 'chrome-settings') return settings(ctx);
    if (ctx.ui.sub === 'tabs') return switcher(ctx);
    const content = ctx.url === NTP ? newTabPage(ctx) : ctx.url === HISTORY ? historyPage(ctx) : `<div class="browser-page">${ctx.page(ctx.url)}</div>`;
    return `<div class="app-view ics-browser chr-app${ctx.incognito ? ' chr-incognito' : ''}">${toolbar(ctx)}${find(ctx)}${content}${clearDialog(ctx)}</div>`;
  }
  // The overflow menu: Back, Forward and Bookmark icons, then the Chrome 31 items (GSMArena), scrolling on small screens.
  function menu(ctx) {
    const {ui, data} = ctx;
    const bookmarked = (data.bookmarks || []).includes(ctx.url), page = !internal(ctx.url), native = ctx.url === NTP;
    const item = (action, label, extra = '') => `<button type="button" data-action="${action}" role="menuitem"><span>${e(CS(ctx, label))}</span>${extra}</button>`;
    if (ui.sub === 'tabs') return `<div class="menu-scrim" data-action="close-overlay"></div><div class="chr-menu" role="menu">${[item('browser-new-tab', 'New tab'), item('chrome-incognito', 'New incognito tab'), ctx.incognito ? item('chrome-close-all', 'Close incognito tabs') : item('chrome-close-all', 'Close all tabs'), item('chrome-settings', 'Settings')].join('')}</div>`;
    const top = `<div class="chr-menu-icons chr40-menu-icons"><button type="button" data-action="browser-forward" aria-label="${e(CS(ctx, 'Go forward'))}" ${ui.browserIndex < ui.browserHistory.length - 1 ? '' : 'disabled'}><img src="assets/chr40-btn_forward.png" alt=""></button><button type="button" data-action="browser-save" aria-label="${e(CS(ctx, bookmarked ? 'Edit bookmark' : 'Bookmark this page'))}" ${page ? '' : 'disabled'}><img src="assets/chr40-${bookmarked ? 'btn_star_filled' : 'btn_star'}.png" alt=""></button><button type="button" data-action="browser-refresh" aria-label="${e(CS(ctx, 'Refresh page'))}"><img src="assets/chr40-btn_toolbar_reload.png" alt=""></button></div>`;
    const items = [item('browser-new-tab', 'New tab'), item('chrome-incognito', 'New incognito tab'), item('chrome-bookmarks', 'Bookmarks'), ctx.incognito ? '' : item('chrome-devices', 'Recent tabs'), item('chrome-history', 'History'), page ? item('chrome-share', 'Share…') : '', native ? '' : item('chrome-unsupported', 'Print…'), native ? '' : item('browser-find', 'Find in page'), page ? item('chrome-unsupported', 'Add to homescreen') : '', native ? '' : item('chrome-desktop', 'Request desktop site', `<i class="lp-check${ui.chromeDesktop ? ' on' : ''}"></i>`), item('chrome-settings', 'Settings'), item('chrome-unsupported', 'Help & feedback')];
    return `<div class="menu-scrim" data-action="close-overlay"></div><div class="chr-menu" role="menu">${top}${items.join('')}</div>`;
  }
  window.ChromeApp = {render, menu, NTP, HISTORY, internal, CLEAR_ITEMS};
})();
