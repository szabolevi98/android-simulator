/* Android 2.1 Browser (Browser.apk, ERE27).
   - The title bar (title_bar.xml on search_plate_browser, padding 8 / 2 / 12 / 1 dp): the 5 dp horizontal progress bar
     while loading, the 20 dp favicon, the title (18 sp black; "Loading…" while it loads) on title_text, and the bookmarks
     button (btn_bookmark, ic_btn_bookmarks; ic_btn_stop_v2 while loading). It sits on top of the page and scrolls with it.
     Touching it opens the SearchDialog with the address (hint "Search or type URL", the browser's icon; suggestions from
     bookmarks and history).
   - Pages: the simulator has no network, so a page is what this WebView shows for a site it cannot reach: its own
     nodomain.html ("Web page not available", ec-webpages.js), the address in it. The home page is homepage_base
     (http://www.google.com/m?client=ms-{CID}&source=android-home, CID google on this phone).
   - CombinedBookmarkHistoryActivity: Bookmarks (the "Add bookmark…" cell, then res/values bookmarks: Google … BBC, as
     bookmark_thumbnail cells with browser_thumbnail and the bold 14 sp label), Most visited and History (the visits).
   - Windows (active_tabs.xml), up to 8. Menu (menu/browser.xml): New window, Bookmarks, Windows, Refresh / Stop, Forward,
     then under More: Add bookmark, Find on page, Select text, Page info, Share page, Downloads, Settings. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const B = () => EC.text('browser');
  const HOME = 'http://www.google.com/m?client=ms-android-google&source=android-home';
  const MAX_TABS = 8;
  EC.defaults.browser = {tabs: [{history: [HOME], index: 0}], active: 0, visits: {}, history: []};
  const st = c => (c.data.browser ||= structuredClone(EC.defaults.browser));
  const tab = c => st(c).tabs[st(c).active];
  const url = c => tab(c).history[tab(c).index];
  let loading = null;   // {url, until}
  const defaults = () => { const a = B().t('bookmarks'); const out = []; for (let i = 0; i + 1 < a.length; i += 2) out.push({title: a[i], url: a[i + 1]}); return out; };
  const errorTitle = c => (EC.webErrorPage[c.lang] || EC.webErrorPage.en).match(/<h2>(.*?)<\/h2>/)?.[1].replace(/&[a-z]+;/g, m => ({'&uuml;': 'ü', '&eacute;': 'é', '&aacute;': 'á', '&agrave;': 'à', '&ouml;': 'ö'})[m] || m) || '';

  function normalise(text) {
    const t = text.trim();
    if (!t) return null;
    if (/^[a-z]+:\/\//i.test(t)) return t;
    if (/^[^\s]+\.[a-z]{2,}(\/.*)?$/i.test(t)) return `http://${t}${t.includes('/') ? '' : '/'}`;
    return `http://www.google.com/m?hl=${c0().lang}&client=ms-android-google&source=android-browser-type&q=${encodeURIComponent(t).split('%20').join('+')}`;
  }
  const c0 = () => EC.context;
  function load(c, target, push = true) {
    if (!target) return;
    const s = st(c), t = tab(c);
    if (push) { t.history = t.history.slice(0, t.index + 1); t.history.push(target); t.history = t.history.slice(-50); t.index = t.history.length - 1; }
    s.visits[target] = (s.visits[target] || 0) + 1;
    s.history = [{url: target, when: Date.now()}, ...s.history.filter(h => h.url !== target)].slice(0, 100);
    c.save();
    loading = {url: target};
    c.render();
    // The error page comes up after the failed lookup; the progress bar runs meanwhile.
    setTimeout(() => { if (loading?.url === target) { loading = null; if (c.ui.view === 'browser') c.render(); } }, 1400);
  }
  function titleBar(c) {
    const busy = !!loading;
    return `<div class="ecbr-title npp-br-search_plate_browser"><i class="ec-bg np-br-search_plate_browser"></i>
      <div class="ecbr-progress"${busy ? '' : ' style="visibility:hidden"'}><i></i></div>
      <div class="ecbr-row"><button type="button" class="ecbr-field" data-action="ecbr-edit"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ec-pressed np-fw-textfield_pressed"></i><img src="assets/br-app_web_browser_sm.png" alt=""><span>${esc(busy ? B().t('title_bar_loading') : errorTitle(c))}</span></button>
        <button type="button" class="ecbr-rt" data-action="${busy ? 'ecbr-stop' : 'ecbr-bookmarks'}"><i class="ec-bg np-fw-btn_search_dialog_voice_default"></i><i class="ec-bg ec-pressed np-fw-btn_search_dialog_voice_pressed"></i><img src="assets/br-${busy ? 'ic_btn_stop_v2' : 'ic_btn_bookmarks'}.png" alt=""></button></div></div>`;
  }
  function page(c) {
    if (loading) return '<div class="ecbr-page"></div>';
    const html = AndroidStrings.format(EC.webErrorPage[c.lang] || EC.webErrorPage.en, esc(url(c)), esc(url(c)));
    return `<div class="ecbr-page">${html}</div>`;
  }
  // CombinedBookmarkHistoryActivity
  function combined(c) {
    const which = c.ui.browserTab || 'bookmarks', s = st(c);
    const TABS = [['bookmarks', 'tab_bookmarks', 'ic_tab_bookmarks'], ['visited', 'tab_most_visited', 'ic_tab_most_visited'], ['history', 'tab_history', 'ic_tab_history']];
    const i = TABS.findIndex(t => t[0] === which);
    const tabs = `<div class="ecph-tabs">${TABS.map(([id, label, icon], n) => `<button type="button" class="ecph-tab${n === i ? ' on' : ''}" data-action="ecbr-tab" data-tab="${id}"><i class="ec-bg np-fw-tab_${n === i ? 'selected' : 'unselected'}"></i><i class="ec-bg ec-pressed np-fw-tab_press"></i><img src="assets/br-${icon}_${n === i ? 'selected' : 'unselected'}.png" alt=""><span>${esc(B().t(label))}</span></button>`).join('')}<i class="ecph-bar left np-fw-tab_selected_bar_left" style="width:${i * 33.333}%"></i><i class="ecph-bar right np-fw-tab_selected_bar_right" style="width:${(2 - i) * 33.333}%"></i></div>`;
    const cell = (b, add) => `<button type="button" class="ecbr-thumb" data-action="${add ? 'ecbr-addbm' : 'ecbr-open'}" data-url="${esc(b?.url || '')}"><span class="ecbr-thumb-img"><img src="assets/br-browser_thumbnail.png" alt="">${add ? `<span class="ecbr-thumb-add"><img src="assets/br-ic_list_bookmark.png" alt=""><b>${esc(B().t('save_to_bookmarks'))}</b></span>` : ''}</span><span class="ecbr-thumb-label">${esc(add ? B().t('add_new_bookmark') : b.title)}</span></button>`;
    let body;
    if (which === 'bookmarks') body = `<div class="ecbr-grid">${cell(null, true)}${(s.bookmarks || defaults()).map(b => cell(b)).join('')}</div>`;
    else if (which === 'visited') {
      const list = Object.entries(s.visits).sort((a, b) => b[1] - a[1]).map(([u]) => ({url: u, title: u}));
      body = list.length ? `<div class="ecbr-grid">${list.map(b => cell(b)).join('')}</div>` : `<div class="ecph-empty">${esc(B().t('empty_history'))}</div>`;
    } else {
      body = s.history.length ? `<div class="ecph-list">${s.history.map(h => `<button type="button" class="ecbr-hist" data-action="ecbr-open" data-url="${esc(h.url)}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><img src="assets/br-app_web_browser_sm.png" alt=""><span><span class="t1">${esc(errorTitle(c))}</span><span class="t2">${esc(h.url)}</span></span></button><i class="ecph-div"></i>`).join('')}</div>`
        : `<div class="ecph-empty">${esc(B().t('empty_history'))}</div>`;
    }
    return `<div class="ecph">${tabs}<div class="ecph-body">${body}</div></div>`;
  }
  function windows(c) {
    const s = st(c);
    const rows = s.tabs.map((t, i) => `<div class="ecbr-win${i === s.active ? ' on' : ''}"><button type="button" class="ecbr-win-main" data-action="ecbr-switch" data-index="${i}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><img src="assets/br-app_web_browser_sm.png" alt=""><span><span class="t1">${esc(errorTitle(c))}</span><span class="t2">${esc(t.history[t.index])}</span></span></button><button type="button" class="ecbr-win-close" data-action="ecbr-close" data-index="${i}"><img src="assets/br-ic_close_tab.png" alt=""></button></div><i class="ecph-div"></i>`).join('');
    const add = s.tabs.length < MAX_TABS ? `<button type="button" class="ecbr-win-main ecbr-win-new" data-action="ecbr-newtab"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><img src="assets/br-ic_list_new_window.png" alt=""><span><span class="t1">${esc(B().t('new_window'))}</span></span></button><i class="ecph-div"></i>` : '';
    return c.window(B().t('active_tabs'), `<div class="ecph-list">${add}${rows}</div>`);
  }

  EC.register('browser', {
    title: 'Browser',
    render(c) {
      if (c.ui.sub === 'bookmarks') return combined(c);
      if (c.ui.sub === 'windows') return windows(c);
      return `<div class="ecbr"><div class="ecbr-scroll">${titleBar(c)}${page(c)}</div></div>`;
    },
    action(name, el, event, c) {
      const s = st(c);
      switch (name) {
        case 'ecbr-edit':
          c.searchDialog({icon: 'br-ic_launcher_browser.png', hint: B().t('search_hint'), value: url(c), ime: 'url',
            suggest: q => { const v = q.trim().toLowerCase(); if (!v || v === url(c).toLowerCase()) return []; return [...(s.bookmarks || defaults()), ...s.history.map(h => ({title: h.url, url: h.url}))].filter((b, i, a) => a.findIndex(x => x.url === b.url) === i && (b.url.toLowerCase().includes(v) || b.title.toLowerCase().includes(v))).slice(0, 6).map(b => ({icon: 'br-app_web_browser_sm.png', text1: b.title, text2: b.url, value: b.url})); },
            onGo: text => load(c, normalise(text))});
          return true;
        case 'ecbr-stop': loading = null; c.render(); return true;
        case 'ecbr-bookmarks': c.ui.browserTab = 'bookmarks'; c.open('browser', 'bookmarks'); return true;
        case 'ecbr-tab': c.ui.browserTab = el.dataset.tab; c.render(); return true;
        case 'ecbr-open': c.ui.sub = ''; load(c, el.dataset.url); return true;
        case 'ecbr-addbm': { const list = s.bookmarks || defaults(); if (!list.some(b => b.url === url(c))) s.bookmarks = [{title: errorTitle(c), url: url(c)}, ...list]; c.save(); c.render(); return true; }
        case 'ecbr-switch': s.active = Number(el.dataset.index); c.ui.sub = ''; c.save(); c.render(); return true;
        case 'ecbr-close': s.tabs.splice(Number(el.dataset.index), 1); if (!s.tabs.length) s.tabs.push({history: [HOME], index: 0}); s.active = Math.min(s.active, s.tabs.length - 1); c.save(); c.render(); return true;
        case 'ecbr-newtab': if (s.tabs.length < MAX_TABS) { s.tabs.push({history: [HOME], index: 0}); s.active = s.tabs.length - 1; } c.ui.sub = ''; load(c, HOME, false); return true;
      }
      return false;
    },
    menu(c) {
      if (c.ui.sub) return true;
      const s = st(c), t = tab(c);
      c.menu([{label: B().t('new_tab'), icon: 'br-ic_menu_new_window.png', action: () => EC.module('browser').action('ecbr-newtab', document.createElement('i'), null, c)},
        {label: B().t('tab_bookmarks'), icon: 'br-ic_menu_bookmarks.png', action: () => { c.ui.browserTab = 'bookmarks'; c.open('browser', 'bookmarks'); }},
        {label: B().t('active_tabs'), icon: 'br-ic_menu_windows.png', action: () => c.open('browser', 'windows')},
        loading ? {label: B().t('stop'), icon: 'fw-ic_menu_stop.png', action: () => { loading = null; c.render(); }} : {label: B().t('reload'), icon: 'fw-ic_menu_refresh.png', action: () => load(c, url(c), false)},
        {label: B().t('forward'), icon: 'fw-ic_menu_forward.png', disabled: t.index >= t.history.length - 1, action: () => { if (t.index < t.history.length - 1) { t.index++; load(c, url(c), false); } }},
        {label: B().t('save_to_bookmarks'), action: () => { c.ui.browserTab = 'bookmarks'; c.open('browser', 'bookmarks'); }},
        {label: B().t('find_dot'), action: () => {}}, {label: B().t('select_dot'), action: () => {}},
        {label: B().t('page_info'), action: () => c.dialog({title: B().t('page_info'), icon: null, message: `${errorTitle(c)}\n\n${url(c)}`, buttons: [{label: EC.text('framework').t('ok')}]})},
        {label: B().t('share_page'), action: () => { c.ui.composeTo = null; c.ui.smsDraft = url(c); c.ui.smsThread = null; c.open('messaging', 'compose'); }},
        {label: B().t('menu_view_download'), action: () => c.open('browser-downloads')},
        {label: B().t('menu_preferences'), action: () => c.open('browser-settings')}]);
      void s;
      return true;
    },
    back(c) {
      if (c.ui.sub) { c.ui.sub = ''; c.render(); return true; }
      const t = tab(c);
      if (loading) { loading = null; c.render(); return true; }
      if (t.index > 0) { t.index--; load(c, url(c), false); return true; }
      return false;
    }
  });
})();
