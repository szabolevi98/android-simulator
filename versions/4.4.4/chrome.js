/* Chrome for Android as the stock Nexus 5 browser (Chrome 31-35, 2013-2014; GSMArena Nexus 5 review, "Connectivity,
   web browser"): a light #e1e1e1 toolbar with a white omnibox holding the reload button, the tab switcher with the
   tab count and the overflow; a menu with Back/Forward/Bookmark icons on top; the black stacked tab switcher with
   "New tab"; the New Tab page with Most visited, Bookmarks and Other devices at the bottom; and incognito tabs on a
   slate toolbar. Pages come from the simulator's offline demo web shared with the AOSP Browser. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const NTP = 'chrome://newtab', HISTORY = 'chrome://history';
  const internal = url => String(url).startsWith('chrome://');
  const icon = {
    reload: '<svg viewBox="0 0 24 24"><path d="M17.6 6.4A8 8 0 1 0 19.7 14h-2.1a6 6 0 1 1-1.4-6.2L13 11h7V4z" fill="currentColor"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20z" fill="currentColor"/></svg>',
    forward: '<svg viewBox="0 0 24 24"><path d="M4 11h12.2l-5.6-5.6L12 4l8 8-8 8-1.4-1.4 5.6-5.6H4z" fill="currentColor"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.2 6.1L12 16.8l-5.5 2.9 1.2-6.1-4.5-4.2 6.1-.8z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    starOn: '<svg viewBox="0 0 24 24"><path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.2 6.1L12 16.8l-5.5 2.9 1.2-6.1-4.5-4.2 6.1-.8z" fill="#3e84e8"/></svg>',
    starSolid: '<svg viewBox="0 0 24 24"><path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.2 6.1L12 16.8l-5.5 2.9 1.2-6.1-4.5-4.2 6.1-.8z" fill="currentColor"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M10.5 3h3v7.5H21v3h-7.5V21h-3v-7.5H3v-3h7.5z" fill="currentColor"/></svg>',
    globe: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 12h18M12 3c-3 3.2-3 14.8 0 18M12 3c3 3.2 3 14.8 0 18" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
    incognito: '<svg viewBox="0 0 24 24"><path d="M5 10.5h14l-1.8-5.2c-.2-.6-.8-.9-1.4-.7L12 5.8l-3.8-1.2c-.6-.2-1.2.1-1.4.7zM2 12h20v1.4H2z" fill="currentColor"/><path d="M7.5 15a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6zm9 0a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6zM10.3 17.2c1.1-.6 2.3-.6 3.4 0" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    devices: '<svg viewBox="0 0 24 24"><path d="M3 5h14v2H5v9H3zm-2 12h12v2H1zm14-8h7v11h-7zm1.5 1.5v7h4v-7z" fill="currentColor"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4z" fill="currentColor"/></svg>',
    overflow: '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="19" r="2" fill="currentColor"/></svg>'
  };
  const tabsButton = count => `<button type="button" class="chr-btn chr-tabs-btn" data-action="browser-tabs" aria-label="Tabs"><span>${count > 99 ? ':D' : count}</span></button>`;
  const menuButton = '<button type="button" class="chr-btn" data-action="browser-menu" aria-label="More options">' + icon.overflow + '</button>';
  const display = url => internal(url) ? '' : url.startsWith('search:') ? url.slice(7) : url;
  function toolbar(ctx) {
    const {url, t, tabs, incognito} = ctx;
    return `<div class="chr-toolbar${incognito ? ' incognito' : ''}"><form class="chr-omnibox" data-form="address"><input name="address" autocomplete="off" spellcheck="false" aria-label="${e(t('Search or type URL'))}" placeholder="${e(t('Search or type URL'))}" value="${e(display(url))}"><button type="button" class="chr-reload" data-action="browser-refresh" aria-label="${e(t('Reload'))}">${icon.reload}</button></form>${tabsButton(tabs.length)}${menuButton}</div>`;
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
    const section = incognito ? ui.chromeNtpIncognito || 'incognito' : ui.chromeNtp || 'most';
    let body;
    if (section === 'incognito') body = `<div class="chr-incognito-card"><div class="chr-incognito-icon">${icon.incognito}</div><h3>${e(t('You’ve gone incognito.'))}</h3><p>${e(t('Pages you view in this tab won’t appear in your browser history or search history, and they won’t leave other traces, like cookies, on your device after you close all incognito tabs. Any files you download or bookmarks you create will be preserved, however.'))}</p><p><b>${e(t('Going incognito doesn’t affect the behavior of other people, servers, or software.'))}</b> ${e(t('Be wary of surveillance by secret agents or people standing behind you.'))}</p></div>`;
    else if (section === 'bookmarks') body = `<h3 class="chr-ntp-title">${e(t('Mobile bookmarks'))}</h3><div class="chr-bookmarks">${(ctx.data.bookmarks || []).map(url => `<button class="chr-bookmark" data-action="browser-bookmark" data-id="${e(url)}"><span class="chr-favicon">${e(ctx.title(url).slice(0, 1).toUpperCase())}</span><span>${e(ctx.title(url))}</span></button>`).join('') || `<p class="chr-empty">${e(t('No bookmarks'))}</p>`}</div>`;
    else if (section === 'devices') body = `<div class="chr-devices">${icon.devices}<p>${e(t('Tabs that you have open in Chrome on your other devices will appear here.'))}</p><p>${e(t('Sign in to Chrome to see them.'))}</p></div>`;
    else body = `<div class="chr-most">${mostVisited(ctx).map(url => `<div class="chr-tile" role="button" tabindex="0" data-action="browser-link" data-url="${e(url)}" aria-label="${e(ctx.title(url))}"><div class="chr-tile-thumb">${thumb(ctx, url)}</div><span class="chr-tile-title">${e(ctx.title(url))}</span></div>`).join('')}</div>`;
    const tab = (id, label, glyph) => `<button class="${section === id ? 'active' : ''}" data-action="chrome-ntp" data-id="${id}" aria-label="${e(t(label))}">${glyph}</button>`;
    const bar = `<nav class="chr-ntp-bar">${tab('most', 'Most visited', '<img src="assets/chrome.png" alt=""><span>chrome</span>')}${incognito ? tab('incognito', 'Incognito', icon.incognito) : ''}${tab('bookmarks', 'Bookmarks', icon.starSolid)}${incognito ? '' : tab('devices', 'Other devices', icon.devices)}</nav>`;
    return `<div class="chr-ntp chr-ntp-${section}"><div class="chr-ntp-scroll">${body}</div>${bar}</div>`;
  }
  function historyPage(ctx) {
    const {t, data, locale} = ctx;
    const query = String(ctx.ui.chromeHistoryQuery || '').toLocaleLowerCase();
    const rows = [...new Set([...data.browserHistory].reverse())].filter(url => !internal(url) && (!query || `${ctx.title(url)} ${url}`.toLocaleLowerCase().includes(query))).slice(0, 40);
    return `<div class="chr-history"><form class="chr-history-search" data-form="chrome-history-search"><input name="query" aria-label="${e(t('Search history'))}" placeholder="${e(t('Search history'))}" value="${e(ctx.ui.chromeHistoryQuery || '')}"><button type="submit">${e(t('Search history'))}</button></form><button class="chr-clear" data-action="chrome-clear-open">${e(t('Clear browsing data…'))}</button><h3>${e(new Date().toLocaleDateString(locale, {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'}))}</h3>${rows.map(url => `<button class="chr-history-row" data-action="browser-link" data-url="${e(url)}"><span class="chr-globe">${icon.globe}</span><span><strong>${e(ctx.title(url))}</strong><small>${e(display(url))}</small></span></button>`).join('') || `<p class="chr-empty">${e(t('No history'))}</p>`}</div>`;
  }
  function find(ctx) {
    if (ctx.ui.browserFind === undefined) return '';
    return `<form class="web-find chr-find" data-form="browser-find"><input name="query" aria-label="${e(ctx.t('Find in page'))}" placeholder="${e(ctx.t('Find in page'))}" value="${e(ctx.ui.browserFind)}"><button type="submit">${e(ctx.t('Search'))}</button><button type="button" data-action="browser-close-find" aria-label="Close">×</button></form><div class="web-find-count" aria-live="polite"></div>`;
  }
  function switcher(ctx) {
    const {t, tabs, active} = ctx;
    const cards = tabs.map((tab, i) => `<article class="chr-card${i === active ? ' current' : ''}${tab.incognito ? ' incognito' : ''}" style="--i:${i}"><div class="chr-card-page" role="button" tabindex="0" data-action="browser-tab" data-id="${i}" aria-label="${e(ctx.title(tab.url))}">${tab.url === NTP ? `<div class="chr-card-ntp">${tab.incognito ? icon.incognito : '<img src="assets/chrome.png" alt="">'}</div>` : thumb(ctx, tab.url)}</div><div class="chr-card-tab"><span class="chr-globe">${icon.globe}</span><button data-action="browser-tab" data-id="${i}">${e(tab.url === NTP ? t('New tab') : ctx.title(tab.url))}</button><button class="chr-card-close" data-action="browser-close-tab" data-id="${i}" aria-label="${e(t('Close tab'))}">${icon.close}</button></div></article>`).join('');
    return `<div class="app-view ics-browser chr-app chr-switcher-view"><div class="chr-switcher-bar"><button class="chr-new-tab" data-action="browser-new-tab">${icon.plus}<span>${e(t('New tab'))}</span></button>${tabsButton(tabs.length)}${menuButton}</div><div class="chr-stack">${cards}</div></div>`;
  }
  /* Settings (audit step 5), Chrome 32.0.1700.99: preference_headers_phone.xml (Basics: Search engine, Autofill forms, Save passwords, Homepage; Advanced: Privacy, Accessibility, Content settings, Bandwidth management, About Chrome) in Theme.Holo.Light. privacy_preferences.xml: the check boxes with their summaries, the
     Usage and crash reports list and 'Do Not Track'; PRIVACY_MENU's Clear browsing data is the action bar button that opens
     the dialog: Clear browsing history, Clear the cache and Clear cookies, site data ticked, Clear saved passwords and
     Clear autofill data not, Cancel / Clear, then "Clearing browsing data" / "Please wait…". The history page's link
     opens the same dialog. Clearing the history empties the history page and Most visited. About Chrome lists the
     application version and the operating system. Texts come from the image's Chrome (stock-strings.js). */
  const PREFS = {version: '32.0.1700.99', os: 'Android 4.4.4; Nexus 5 Build/KTU84P', material: false,
    headers: [['cat', 'Basics'], ['search_engine', 'Search engine', 'Google'], ['autofill', 'Autofill forms'], ['passwords', 'Save passwords'], ['homepage', 'Home page'], ['cat', 'Advanced'], ['privacy', 'Privacy'], ['accessibility', 'Accessibility'], ['content', 'Content settings'], ['bandwidth', 'Bandwidth management'], ['about', 'About Chrome']],
    privacy: [['check', 'navigation_error', 'Navigation error suggestions', 'Navigation error summary'], ['check', 'search_suggestions', 'Search and URL suggestions', 'Search suggestions summary'], ['check', 'network_predictions', 'Network action predictions', 'Network predictions summary'], ['list', 'crash', 'Usage and crash reports', ['Always send', 'Only send on Wi-Fi', 'Never send'], 2], ['screen', 'dnt', "'Do Not Track'", 'Off']],
    topMenu: [['chrome-unsupported', 'Help']], clearInBar: true};
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
    const {t, ui, data} = ctx;
    const bookmarked = (data.bookmarks || []).includes(ctx.url);
    const tabs = ui.sub === 'tabs';
    const item = (action, label, extra = '') => `<button data-action="${action}" role="menuitem">${e(t(label))}${extra}</button>`;
    const top = tabs ? '' : `<div class="chr-menu-icons"><button data-action="browser-back-menu" aria-label="${e(t('Back'))}" ${ui.browserIndex > 0 ? '' : 'disabled'}>${icon.back}</button><button data-action="browser-forward" aria-label="${e(t('Forward'))}" ${ui.browserIndex < ui.browserHistory.length - 1 ? '' : 'disabled'}>${icon.forward}</button><button data-action="browser-save" aria-label="${e(t('Bookmark'))}" ${internal(ctx.url) ? 'disabled' : ''}>${bookmarked ? icon.starOn : icon.star}</button></div>`;
    const items = tabs
      ? [item('browser-new-tab', 'New tab'), item('chrome-incognito', 'New incognito tab'), item('chrome-close-all', 'Close all tabs'), item('chrome-settings', 'Settings'), item('chrome-unsupported', 'Help & feedback')]
      : [item('browser-new-tab', 'New tab'), item('chrome-incognito', 'New incognito tab'), item('chrome-bookmarks', 'Bookmarks'), item('chrome-devices', 'Other devices'), item('chrome-history', 'History'), item('chrome-share', 'Share…'), item('chrome-unsupported', 'Print…'), item('browser-find', 'Find in page…'), item('chrome-desktop', 'Request desktop site', `<img class="chr-check" src="assets/btn_check_${ui.chromeDesktop ? 'on' : 'off'}_holo_light.png" alt="">`), item('chrome-settings', 'Settings'), item('chrome-unsupported', 'Help & feedback')];
    return `<div class="menu-scrim" data-action="close-overlay"></div><div class="chr-menu" role="menu">${top}${items.join('')}</div>`;
  }
  window.ChromeApp = {render, menu, NTP, HISTORY, internal, CLEAR_ITEMS};
})();
