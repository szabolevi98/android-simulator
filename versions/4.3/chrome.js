/* Chrome 27.0.1453.111 on the Nexus 4 (Chrome.apk of JWR66Y), rebuilt from the APK as the KitKat simulator's Chrome 32:
   - toolbar.xml / location_bar.xml: the 48 dp toolbar drawable (#e1e1e1 over a #898989 line; toolbar_incognito), the
     textbox omnibox with ic_suggestion_globe (or the lock), the 15 sp URL and btn_omnibox_reload_normal in 32 dp
     slots; the cardstack button with the tab count label (16 dp, 18 dp in, bold, 11 dip / 9 dip, ":)" beyond 99) and
     menu_btn_bg;
   - the New Tab page: chrome://newtab, the ntp_android page from chrome.pak (108 x 72 dp Most visited thumbnails with
     20 dp labels in two columns, the bookmarks' favicon cells under the breadcrumb, Other devices' sync text, the
     incognito box) over NewTabPageToolbar on new_tab_logo;
   - the overview: toolbar_switcher, "New tab" with new_tab_light, the light card stack and menu buttons;
   - mainmenu.xml as Main.prepareMenu shows it: menu_icon_row.xml (back / forward / star) and PAGE_MENU (New tab, New
     incognito tab, Bookmarks, Other devices but not in incognito, Share... and Request desktop site not on chrome://
     pages, Find in page..., Settings, Help); PHONE_OVERVIEW_MODE_MENU in the tab switcher; 18 sp items 9 dp in.
   Texts are the APK's (stock-strings.js, group chrome) and the .pak files' (chrome-pak.js). Pages come from the
   simulator's offline demo web shared with the AOSP Browser. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const NTP = 'chrome://newtab', HISTORY = 'chrome://history';
  const internal = url => String(url).startsWith('chrome://');
  const img = (name, alt = '') => `<img src="assets/c27-${name}.png" alt="${e(alt)}">`;
  // The image's words: the APK's strings (stock-strings.js, group chrome), resources.pak's (chrome-pak.js).
  const lang = ctx => ['hu', 'de', 'fr', 'es'].indexOf(String(ctx.locale || 'en').slice(0, 2));
  const CS = (ctx, key) => { const row = window.StockStrings?.chrome?.[key], i = lang(ctx); return row ? (i >= 0 ? row[i] : row[4] || key) : ctx.t(key); };
  const PAK = (ctx, key) => { const row = window.ChromePak?.[key]; return row ? row[lang(ctx) + 1] ?? row[0] : key; };
  // ToolbarPhone.updateTabCountVisuals: the count, ":)" past two digits.
  const tabsButton = (ctx, count, light = false) => { const text = count > 99 ? ':)' : String(count); return `<button type="button" class="chr-btn chr-tabs-btn${light ? ' light' : ''}" data-action="browser-tabs" aria-label="${e(CS(ctx, '%1$d open tabs button.').replace('%1$d', count))}"><span class="${text.length > 1 ? 'two' : ''}">${e(text)}</span></button>`; };
  const menuButton = (ctx, light = false) => `<button type="button" class="chr-btn chr-menu-btn" data-action="browser-menu" aria-label="${e(CS(ctx, 'More options'))}">${img(light ? 'menu_btn_bg_light' : 'menu_btn_bg')}</button>`;
  const display = url => internal(url) ? '' : url.startsWith('search:') ? url.slice(7) : url;
  function toolbar(ctx) {
    const {url, tabs, incognito} = ctx, secure = String(url).startsWith('https:');
    return `<div class="chr-toolbar${incognito ? ' incognito' : ''}"><form class="chr-omnibox" data-form="address"><span class="chr-site-icon">${secure ? img('omnibox_https_valid') : img('ic_suggestion_globe')}</span><input name="address" autocomplete="off" spellcheck="false" aria-label="${e(ctx.t('Search or type URL'))}" placeholder="${e(ctx.t('Search or type URL'))}" value="${e(display(url))}"><button type="button" class="chr-reload" data-action="browser-refresh" aria-label="${e(CS(ctx, 'Refresh page'))}">${img('btn_omnibox_reload_normal')}</button></form>${tabsButton(ctx, tabs.length)}${menuButton(ctx)}</div>`;
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
    const {ui, incognito} = ctx;
    const section = incognito ? ui.chromeNtpIncognito || 'incognito' : ui.chromeNtp || 'most';
    let body;
    if (section === 'incognito') body = `<div class="chr-otr">${img('ntp-incognito')}<span>${PAK(ctx, 'otr').replace(/<a [^>]*>(.*?)<\/a>/, '$1')}</span></div>`;
    else if (section === 'bookmarks') body = `<div class="chr-bm-title"><span>${e(PAK(ctx, 'mobile'))}</span></div><div class="chr-bookmarks">${(ctx.data.bookmarks || []).map(url => `<button type="button" class="chr-bookmark" data-action="browser-bookmark" data-id="${e(url)}"><span class="chr-fav-box"><i class="chr-strip" style="background:${stripColor(url)}"></i><span class="chr-fav">${e(ctx.title(url).slice(0, 1).toUpperCase())}</span></span><span class="chr-bm-name">${e(ctx.title(url))}</span></button>`).join('')}</div>`;
    else if (section === 'devices') body = `<div class="chr-devices">${PAK(ctx, 'sync')}</div>`;
    else body = `<div class="chr-most">${mostVisited(ctx).map(url => `<div class="chr-tile" role="button" tabindex="0" data-action="browser-link" data-url="${e(url)}" aria-label="${e(ctx.title(url))}"><div class="chr-tile-thumb">${thumb(ctx, url)}<i></i></div><span class="chr-tile-title">${e(ctx.title(url))}</span></div>`).join('')}</div>`;
    const button = (id, label, icon) => `<button type="button" class="${section === id ? 'active' : ''}" data-action="chrome-ntp" data-id="${id}" aria-label="${e(CS(ctx, label))}">${img(icon)}</button>`;
    const bar = `<nav class="chr-ntp-bar"><span class="chr-ntp-logo"></span>${incognito ? button('incognito', 'Incognito', 'ntp_button_incognito') : ''}${incognito ? '' : button('most', 'Most visited', 'most_visited_icon')}${button('bookmarks', 'Bookmarks', 'bookmarks_icon')}${incognito ? '' : button('devices', 'Other devices', 'open_tabs_icon')}</nav>`;
    return `<div class="chr-ntp chr-ntp-${section}"><div class="chr-ntp-scroll">${body}</div>${bar}</div>`;
  }
  // The document favicon's colour strip: a dominant colour per site (FaviconWebUIHandler); the demo sites have none, so a
  // stable colour from the address stands in.
  const STRIPS = ['#4c8bf5', '#de5246', '#f4b400', '#1da462', '#9c27b0', '#ff7043'];
  const stripColor = url => STRIPS[[...String(url)].reduce((sum, c) => (sum * 31 + c.charCodeAt(0)) >>> 0, 7) % STRIPS.length];
  function historyPage(ctx) {
    const {t, data, locale} = ctx;
    const query = String(ctx.ui.chromeHistoryQuery || '').toLocaleLowerCase();
    const rows = [...new Set([...data.browserHistory].reverse())].filter(url => !internal(url) && (!query || `${ctx.title(url)} ${url}`.toLocaleLowerCase().includes(query))).slice(0, 40);
    return `<div class="chr-history"><form class="chr-history-search" data-form="chrome-history-search"><input name="query" aria-label="${e(t('Search history'))}" placeholder="${e(t('Search history'))}" value="${e(ctx.ui.chromeHistoryQuery || '')}"><button type="submit">${e(t('Search history'))}</button></form><button class="chr-clear" data-action="chrome-clear-open">${e(t('Clear browsing data…'))}</button><h3>${e(new Date().toLocaleDateString(locale, {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'}))}</h3>${rows.map(url => `<button class="chr-history-row" data-action="browser-link" data-url="${e(url)}"><span class="chr-globe">${img('globe_favicon')}</span><span><strong>${e(ctx.title(url))}</strong><small>${e(display(url))}</small></span></button>`).join('') || `<p class="chr-empty">${e(t('No history'))}</p>`}</div>`;
  }
  function find(ctx) {
    if (ctx.ui.browserFind === undefined) return '';
    return `<form class="web-find chr-find" data-form="browser-find"><input name="query" aria-label="${e(ctx.t('Find in page'))}" placeholder="${e(ctx.t('Find in page'))}" value="${e(ctx.ui.browserFind)}"><button type="submit">${e(ctx.t('Search'))}</button><button type="button" data-action="browser-close-find" aria-label="Close">×</button></form><div class="web-find-count" aria-live="polite"></div>`;
  }
  function switcher(ctx) {
    const {tabs, active} = ctx;
    const cards = tabs.map((tab, i) => `<article class="chr-card${i === active ? ' current' : ''}${tab.incognito ? ' incognito' : ''}" style="--i:${i}"><div class="chr-card-page" role="button" tabindex="0" data-action="browser-tab" data-id="${i}" aria-label="${e(ctx.title(tab.url))}">${tab.url === NTP ? `<div class="chr-card-ntp"></div>` : thumb(ctx, tab.url)}</div><div class="chr-card-tab">${img(tab.incognito ? 'globe_incognito_favicon' : 'globe_favicon')}<button type="button" data-action="browser-tab" data-id="${i}">${e(tab.url === NTP ? CS(ctx, 'New tab') : ctx.title(tab.url))}</button><button type="button" class="chr-card-close" data-action="browser-close-tab" data-id="${i}" aria-label="${e(ctx.t('Close tab'))}">${img(tab.incognito ? 'close_tab_incognito' : 'close_tab')}</button></div></article>`).join('');
    return `<div class="app-view ics-browser chr-app chr-switcher-view"><div class="chr-switcher-bar"><button type="button" class="chr-new-tab" data-action="browser-new-tab">${img('new_tab_light')}<span>${e(CS(ctx, 'New tab'))}</span></button>${tabsButton(ctx, tabs.length, true)}${menuButton(ctx, true)}</div><div class="chr-stack">${cards}</div></div>`;
  }
  /* Settings (audit step 5), Chrome 27.0.1453.111: preference_headers_phone.xml (Basics: Search engine, Autofill forms, Save passwords; Advanced: Privacy, Accessibility, Content settings, Bandwidth management, Developer tools) in Theme.Holo.Light, About Chrome in the overflow. privacy_preferences.xml: the check boxes with their summaries, the
     Usage and crash reports list and 'Do Not Track'; PRIVACY_MENU's Clear browsing data is the action bar button that opens
     the dialog: Clear browsing history, Clear the cache and Clear cookies, site data ticked, Clear saved passwords and
     Clear autofill data not, Cancel / Clear, then "Clearing browsing data" / "Please wait…". The history page's link
     opens the same dialog. Clearing the history empties the history page and Most visited. About Chrome lists the
     application version and the operating system. Texts come from the image's Chrome (stock-strings.js). */
  const PREFS = {version: '27.0.1453.111', os: 'Android 4.3; Nexus 4 Build/JWR66Y', material: false,
    headers: [['cat', 'Basics'], ['search_engine', 'Search engine', 'Google'], ['autofill', 'Autofill forms'], ['passwords', 'Save passwords'], ['cat', 'Advanced'], ['privacy', 'Privacy'], ['accessibility', 'Accessibility'], ['content', 'Content settings'], ['bandwidth', 'Bandwidth management'], ['devtools', 'Developer tools']],
    privacy: [['check', 'navigation_error', 'Navigation error suggestions', 'Navigation error summary'], ['check', 'search_suggestions', 'Search and URL suggestions', 'Search suggestions summary'], ['check', 'network_predictions', 'Network action predictions', 'Network predictions summary'], ['list', 'crash', 'Usage and crash reports', ['Always send', 'Only send on Wi-Fi', 'Never send'], 2], ['screen', 'dnt', "'Do Not Track'", 'Off']],
    topMenu: [['chrome-pref', 'About Chrome', 'about']], clearInBar: true};
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
  // mainmenu.xml through Main.prepareMenu: the icon row and PAGE_MENU on a page, PHONE_OVERVIEW_MODE_MENU in the tab
  // switcher (Close all tabs, or Close incognito tabs when the incognito stack is shown).
  function menu(ctx) {
    const {ui, data} = ctx;
    const bookmarked = (data.bookmarks || []).includes(ctx.url), page = !internal(ctx.url);
    const item = (action, label, extra = '') => `<button type="button" data-action="${action}" role="menuitem"><span>${e(CS(ctx, label))}</span>${extra}</button>`;
    if (ui.sub === 'tabs') return `<div class="menu-scrim" data-action="close-overlay"></div><div class="chr-menu" role="menu">${[item('browser-new-tab', 'New tab'), item('chrome-incognito', 'New incognito tab'), ctx.incognito ? item('chrome-close-all', 'Close incognito tabs') : item('chrome-close-all', 'Close all tabs'), item('chrome-settings', 'Settings')].join('')}</div>`;
    const top = `<div class="chr-menu-icons"><button type="button" data-action="browser-back-menu" aria-label="${e(CS(ctx, 'Go back'))}" ${ui.browserIndex > 0 ? '' : 'disabled'}>${img(ui.browserIndex > 0 ? 'back' : 'back_disabled')}</button><i></i><button type="button" data-action="browser-forward" aria-label="${e(CS(ctx, 'Go forward'))}" ${ui.browserIndex < ui.browserHistory.length - 1 ? '' : 'disabled'}>${img(ui.browserIndex < ui.browserHistory.length - 1 ? 'forward' : 'forward_disabled')}</button><i></i><button type="button" data-action="browser-save" aria-label="${e(CS(ctx, bookmarked ? 'Edit bookmark page' : 'Bookmark page'))}" ${page ? '' : 'disabled'}>${img(bookmarked ? 'star_lit' : 'star')}</button></div>`;
    const items = [item('browser-new-tab', 'New tab'), item('chrome-incognito', 'New incognito tab'), item('chrome-bookmarks', 'Bookmarks'), ctx.incognito ? '' : item('chrome-devices', 'Other devices'), page ? item('chrome-share', 'Share...') : '', item('browser-find', 'Find in page...'), page ? item('chrome-desktop', 'Request desktop site', `<img class="chr-check" src="assets/btn_check_${ui.chromeDesktop ? 'on' : 'off'}_holo_light.png" alt="">`) : '', item('chrome-settings', 'Settings'), item('chrome-unsupported', 'Help')];
    return `<div class="menu-scrim" data-action="close-overlay"></div><div class="chr-menu" role="menu">${top}${items.join('')}</div>`;
  }
  window.ChromeApp = {render, menu, NTP, HISTORY, internal, CLEAR_ITEMS};
})();
