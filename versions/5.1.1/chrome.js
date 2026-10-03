/* Chrome 40 for Android on the Nexus 6 (LMY48Y): the Material #F2F2F2 toolbar (#505050 incognito) with the white
   omnibox (magnifier or page icon, "Search or type URL"), the tab switcher with the count and the menu; the menu
   opens with Forward, Bookmark, Page info and Reload on top; the New Tab page shows the Google logo, the search box
   with the microphone and Most visited tiles (#F2F2F2), with Bookmarks and Recent tabs at the bottom. Pages come
   from the simulator's offline demo web shared with the AOSP Browser. */
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
    if (incognito) return `<div class="chr-ntp chr40-ntp incognito"><div class="chr-ntp-scroll"><div class="chr-incognito-card"><img class="chr40-incognito" src="assets/chr40-incognito_splash.png" alt=""><h3>${e(t('You’ve gone incognito.'))}</h3><p>${e(t('Pages you view in this tab won’t appear in your browser history or search history, and they won’t leave other traces, like cookies, on your device after you close all incognito tabs. Any files you download or bookmarks you create will be preserved, however.'))}</p><p><b>${e(t('Going incognito doesn’t affect the behavior of other people, servers, or software.'))}</b> ${e(t('Be wary of surveillance by secret agents or people standing behind you.'))}</p></div></div></div>`;
    const section = ui.chromeNtp || 'most';
    let body;
    if (section === 'bookmarks') body = `<h3 class="chr-ntp-title">${e(t('Mobile bookmarks'))}</h3><div class="chr-bookmarks">${(ctx.data.bookmarks || []).map(url => `<button class="chr-bookmark" data-action="browser-bookmark" data-id="${e(url)}"><span class="chr-favicon">${e(ctx.title(url).slice(0, 1).toUpperCase())}</span><span>${e(ctx.title(url))}</span></button>`).join('') || `<p class="chr-empty">${e(t('No bookmarks'))}</p>`}</div>`;
    else if (section === 'devices') body = `<div class="chr-devices">${icon.devices}<p>${e(t('Tabs that you have open in Chrome on your other devices will appear here.'))}</p><p>${e(t('Sign in to Chrome to see them.'))}</p></div>`;
    else body = `<div class="chr40-logo"><img src="assets/chr40-google_logo.png" alt="Google"></div><form class="chr40-fakebox" data-form="address"><input name="address" autocomplete="off" aria-label="${e(t('Search or type URL'))}" placeholder="${e(t('Search or type URL'))}"><button type="button" data-action="voice-search" aria-label="${e(t('Voice search'))}"><img src="assets/chr40-btn_omnibox_mic_normal.png" alt=""></button></form><div class="chr-most chr40-most">${mostVisited(ctx).map(url => `<div class="chr-tile" role="button" tabindex="0" data-action="browser-link" data-url="${e(url)}" aria-label="${e(ctx.title(url))}"><div class="chr-tile-thumb">${thumb(ctx, url)}</div><span class="chr-tile-title">${e(ctx.title(url))}</span></div>`).join('')}</div>`;
    const tab = (id, label, img) => `<button class="${section === id ? 'active' : ''}" data-action="chrome-ntp" data-id="${section === id && id !== 'most' ? 'most' : id}"><img src="assets/chr40-${img}.png" alt=""><span>${e(t(label))}</span></button>`;
    const bar = `<nav class="chr-ntp-bar chr40-ntp-bar">${tab('bookmarks', 'Bookmarks', 'eb_star')}${tab('devices', 'Recent tabs', 'btn_recents')}</nav>`;
    return `<div class="chr-ntp chr40-ntp chr-ntp-${section}"><div class="chr-ntp-scroll">${body}</div>${bar}</div>`;
  }
  function historyPage(ctx) {
    const {t, data, locale} = ctx;
    const query = String(ctx.ui.chromeHistoryQuery || '').toLocaleLowerCase();
    const rows = [...new Set([...data.browserHistory].reverse())].filter(url => !internal(url) && (!query || `${ctx.title(url)} ${url}`.toLocaleLowerCase().includes(query))).slice(0, 40);
    return `<div class="chr-history"><form class="chr-history-search" data-form="chrome-history-search"><input name="query" aria-label="${e(t('Search history'))}" placeholder="${e(t('Search history'))}" value="${e(ctx.ui.chromeHistoryQuery || '')}"><button type="submit">${e(t('Search history'))}</button></form><button class="chr-clear" data-action="chrome-unsupported">${e(t('Clear browsing data…'))}</button><h3>${e(new Date().toLocaleDateString(locale, {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'}))}</h3>${rows.map(url => `<button class="chr-history-row" data-action="browser-link" data-url="${e(url)}"><span class="chr-globe">${icon.globe}</span><span><strong>${e(ctx.title(url))}</strong><small>${e(display(url))}</small></span></button>`).join('') || `<p class="chr-empty">${e(t('No history'))}</p>`}</div>`;
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
  function render(ctx) {
    if (ctx.ui.sub === 'tabs') return switcher(ctx);
    const content = ctx.url === NTP ? newTabPage(ctx) : ctx.url === HISTORY ? historyPage(ctx) : `<div class="browser-page">${ctx.page(ctx.url)}</div>`;
    return `<div class="app-view ics-browser chr-app${ctx.incognito ? ' chr-incognito' : ''}">${toolbar(ctx)}${find(ctx)}${content}</div>`;
  }
  // The overflow menu: Back, Forward and Bookmark icons, then the Chrome 31 items (GSMArena), scrolling on small screens.
  function menu(ctx) {
    const {t, ui, data} = ctx;
    const bookmarked = (data.bookmarks || []).includes(ctx.url);
    const tabs = ui.sub === 'tabs';
    const item = (action, label, extra = '') => `<button data-action="${action}" role="menuitem">${e(t(label))}${extra}</button>`;
    const top = tabs ? '' : `<div class="chr-menu-icons chr40-menu-icons"><button data-action="browser-forward" aria-label="${e(t('Forward'))}" ${ui.browserIndex < ui.browserHistory.length - 1 ? '' : 'disabled'}><img src="assets/chr40-btn_forward.png" alt=""></button><button data-action="browser-save" aria-label="${e(t('Bookmark'))}" ${internal(ctx.url) ? 'disabled' : ''}><img src="assets/chr40-${bookmarked ? 'btn_star_filled' : 'btn_star'}.png" alt=""></button><button data-action="chrome-unsupported" aria-label="${e(t('Page info'))}" ${internal(ctx.url) ? 'disabled' : ''}><img src="assets/chr40-pageinfo_info.png" alt=""></button><button data-action="browser-refresh" aria-label="${e(t('Reload'))}"><img src="assets/chr40-btn_toolbar_reload.png" alt=""></button></div>`;
    const items = tabs
      ? [item('browser-new-tab', 'New tab'), item('chrome-incognito', 'New incognito tab'), item('chrome-close-all', 'Close all tabs'), item('chrome-unsupported', 'Settings'), item('chrome-unsupported', 'Help & feedback')]
      : [item('browser-new-tab', 'New tab'), item('chrome-incognito', 'New incognito tab'), item('chrome-bookmarks', 'Bookmarks'), item('chrome-devices', 'Recent tabs'), item('chrome-history', 'History'), item('chrome-share', 'Share…'), item('chrome-unsupported', 'Print…'), item('browser-find', 'Find in page'), item('chrome-unsupported', 'Add to homescreen'), item('chrome-desktop', 'Request desktop site', `<span class="lp-check${ui.chromeDesktop ? ' on' : ''}" aria-hidden="true"></span>`), item('chrome-unsupported', 'Settings'), item('chrome-unsupported', 'Help & feedback')];
    return `<div class="menu-scrim" data-action="close-overlay"></div><div class="chr-menu" role="menu">${top}${items.join('')}</div>`;
  }
  window.ChromeApp = {render, menu, NTP, HISTORY, internal};
})();
