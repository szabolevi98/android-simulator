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
     then under More: Add bookmark, Find on page, Select text, Page info, Share page, Downloads, Settings.
   - Find on page: FindDialog (FindDialogTheme: floating at the bottom, no dim, the keyboard up) with browser_find.xml on
     the framework's bottom_bar (padding 4 / 5 / 4 / 1 dp): previous and next (ImageButtons on btn_default, off below two
     matches), the field ("Find on page") with "N matches" under it (textAppearanceSmall, textColorSecondaryInverse;
     invisible while empty), close. Typing runs WebView.findAll (case-insensitive); Enter or next go forward, wrapping.
     libwebcore's FindOnPage paints the matches #84be00 with 2 px corners: the current one filled, the others outlined,
     both over a #cc000000 blur.
   - Select text: WebView.emulateShiftHeld. The next touch drags a selection (drawSelectionRegion: ARGB 0x40ff33cc); lifting
     the finger copies it with "Text copied to clipboard." (commitCopy) and ends the mode. */
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
  let find = null;      // FindDialog: {query, index, count}
  let selecting = false;   // WebView.emulateShiftHeld
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
  function pageInner(c) {
    if (loading) return '';
    return AndroidStrings.format(EC.webErrorPage[c.lang] || EC.webErrorPage.en, esc(url(c)), esc(url(c)));
  }
  const page = c => `<div class="ecbr-page">${pageInner(c)}</div>`;
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
  // FindDialog
  function findBar() {
    const button = (id, icon) => `<button type="button" class="ecbr-fbtn npp-fw-btn_default_normal" data-action="ecbr-find-${id}"${id !== 'done' ? ' disabled' : ''}><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><i class="ec-bg ecbr-off np-fw-btn_default_normal_disable"></i><img src="assets/br-${icon}.png" alt=""></button>`;
    return `<div class="ecbr-find-catch"></div><div class="ecbr-find">${button('prev', 'ic_btn_find_prev')}${button('next', 'ic_btn_find_next')}
      <div class="ecbr-find-mid"><span class="ecwf-edit npp-fw-textfield_default"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><input class="ecwf-input" placeholder="${esc(B().t('find_dot'))}" autocomplete="off" enterkeyhint="search"></span><span class="ecbr-matches" hidden></span></div>
      ${button('done', 'ic_btn_close_panel')}</div>`;
  }
  // findAll: wraps every case-insensitive match in the page's text; the first is current.
  function highlight(c, root) {
    const pageEl = root.querySelector('.ecbr-page');
    pageEl.innerHTML = pageInner(c);
    const q = find.query.toLocaleLowerCase();
    let count = 0;
    if (q) {
      const walker = document.createTreeWalker(pageEl, NodeFilter.SHOW_TEXT), nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      for (const node of nodes) {
        const text = node.nodeValue, lower = text.toLocaleLowerCase();
        let at = lower.indexOf(q), from = 0;
        if (at < 0) continue;
        const frag = document.createDocumentFragment();
        while (at >= 0) {
          frag.append(text.slice(from, at));
          const m = document.createElement('mark');
          m.className = 'ecbr-match'; m.textContent = text.slice(at, at + q.length);
          frag.append(m);
          count++; from = at + q.length; at = lower.indexOf(q, from);
        }
        frag.append(text.slice(from));
        node.replaceWith(frag);
      }
    }
    find.count = count; find.index = Math.min(find.index, Math.max(0, count - 1));
    showCurrent(root);
    const label = root.querySelector('.ecbr-matches');
    label.hidden = !q;
    label.textContent = B().plural('matches_found', count, c.lang);
    for (const b of root.querySelectorAll('[data-action="ecbr-find-prev"], [data-action="ecbr-find-next"]')) b.disabled = count < 2;
  }
  function showCurrent(root) {
    const marks = [...root.querySelectorAll('.ecbr-match')];
    marks.forEach((m, i) => m.classList.toggle('current', i === find.index));
    marks[find.index]?.scrollIntoView({block: 'nearest'});
  }
  function step(root, delta) {
    if (!find.count) return;
    find.index = (find.index + delta + find.count) % find.count;
    showCurrent(root);
  }
  function mountFind(c, root) {
    const input = root.querySelector('.ecbr-find input');
    input.value = find.query;
    if (find.query) highlight(c, root);
    input.addEventListener('input', () => { find.query = input.value; find.index = 0; highlight(c, root); });
    input.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); step(root, 1); input.blur(); } });
    const buttons = {prev: () => step(root, -1), next: () => { step(root, 1); input.blur(); }, done: () => { find = null; c.render(); }};
    for (const [id, fn] of Object.entries(buttons)) root.querySelector(`[data-action="ecbr-find-${id}"]`).addEventListener('click', event => { event.stopPropagation(); fn(); });
    setTimeout(() => input.focus(), 0);
  }
  // Select text: a drag from the touch point (caret positions) selects; lifting the finger copies.
  function selectDrag(c, pageEl, event) {
    selecting = false;
    const caret = e => document.caretRangeFromPoint?.(e.clientX, e.clientY);
    const start = caret(event);
    if (!start) return;
    event.preventDefault();
    const sel = window.getSelection();
    pageEl.classList.add('ecbr-selecting');
    const move = e => {
      const end = caret(e);
      if (!end || !pageEl.contains(end.startContainer)) return;
      const r = document.createRange();
      const forward = start.compareBoundaryPoints(Range.START_TO_START, end) <= 0;
      const [a, b] = forward ? [start, end] : [end, start];
      r.setStart(a.startContainer, a.startOffset); r.setEnd(b.startContainer, b.startOffset);
      sel.removeAllRanges(); sel.addRange(r);
    };
    const up = () => {
      document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up);
      const text = sel.toString();
      sel.removeAllRanges(); pageEl.classList.remove('ecbr-selecting');
      if (text) { c.ui.clipboard = text; navigator.clipboard?.writeText(text).catch(() => {}); c.toast(B().t('text_copied')); }
    };
    document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
  }

  function windows(c) {
    const s = st(c);
    const rows = s.tabs.map((t, i) => `<div class="ecbr-win${i === s.active ? ' on' : ''}"><button type="button" class="ecbr-win-main" data-action="ecbr-switch" data-index="${i}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><img src="assets/br-app_web_browser_sm.png" alt=""><span><span class="t1">${esc(errorTitle(c))}</span><span class="t2">${esc(t.history[t.index])}</span></span></button><button type="button" class="ecbr-win-close" data-action="ecbr-close" data-index="${i}"><img src="assets/br-ic_close_tab.png" alt=""></button></div><i class="ecph-div"></i>`).join('');
    const add = s.tabs.length < MAX_TABS ? `<button type="button" class="ecbr-win-main ecbr-win-new" data-action="ecbr-newtab"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><img src="assets/br-ic_list_new_window.png" alt=""><span><span class="t1">${esc(B().t('new_window'))}</span></span></button><i class="ecph-div"></i>` : '';
    return c.window(B().t('active_tabs'), `<div class="ecph-list">${add}${rows}</div>`);
  }

  // Other apps hand an address over in ui.browserGo (Quick Search Box, links).
  document.addEventListener('DOMContentLoaded', () => {
    const c = EC.context, open = c.open;
    c.open = (view, sub, opts) => { const r = open(view, sub, opts); if (view === 'browser' && c.ui.browserGo) { const u = c.ui.browserGo; c.ui.browserGo = null; c.ui.sub = ''; load(c, u); } return r; };
  });
  EC.register('browser', {
    title: 'Browser',
    render(c) {
      if (c.ui.sub === 'bookmarks') return combined(c);
      if (c.ui.sub === 'windows') return windows(c);
      return `<div class="ecbr"><div class="ecbr-scroll">${titleBar(c)}${page(c)}</div>${find ? findBar() : ''}</div>`;
    },
    mount(c, root) {
      if (c.ui.sub) return;
      if (find) mountFind(c, root);
      const pageEl = root.querySelector('.ecbr-page');
      pageEl?.addEventListener('pointerdown', event => { if (selecting) selectDrag(c, pageEl, event); });
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
      if (c.ui.sub || find) return true;
      const s = st(c), t = tab(c);
      c.menu([{label: B().t('new_tab'), icon: 'br-ic_menu_new_window.png', action: () => EC.module('browser').action('ecbr-newtab', document.createElement('i'), null, c)},
        {label: B().t('tab_bookmarks'), icon: 'br-ic_menu_bookmarks.png', action: () => { c.ui.browserTab = 'bookmarks'; c.open('browser', 'bookmarks'); }},
        {label: B().t('active_tabs'), icon: 'br-ic_menu_windows.png', action: () => c.open('browser', 'windows')},
        loading ? {label: B().t('stop'), icon: 'fw-ic_menu_stop.png', action: () => { loading = null; c.render(); }} : {label: B().t('reload'), icon: 'fw-ic_menu_refresh.png', action: () => load(c, url(c), false)},
        {label: B().t('forward'), icon: 'fw-ic_menu_forward.png', disabled: t.index >= t.history.length - 1, action: () => { if (t.index < t.history.length - 1) { t.index++; load(c, url(c), false); } }},
        {label: B().t('save_to_bookmarks'), action: () => { c.ui.browserTab = 'bookmarks'; c.open('browser', 'bookmarks'); }},
        {label: B().t('find_dot'), action: () => { find = {query: '', index: 0, count: 0}; c.render(); }},
        {label: B().t('select_dot'), action: () => { selecting = true; }},
        {label: B().t('page_info'), action: () => c.dialog({title: B().t('page_info'), icon: null, message: `${errorTitle(c)}\n\n${url(c)}`, buttons: [{label: EC.text('framework').t('ok')}]})},
        {label: B().t('share_page'), action: () => { c.ui.composeTo = null; c.ui.smsDraft = url(c); c.ui.smsThread = null; c.open('messaging', 'compose'); }},
        {label: B().t('menu_view_download'), action: () => c.open('browser-downloads')},
        {label: B().t('menu_preferences'), action: () => c.open('browser-settings')}]);
      void s;
      return true;
    },
    back(c) {
      if (find) { find = null; c.render(); return true; }
      if (c.ui.sub) { c.ui.sub = ''; c.render(); return true; }
      const t = tab(c);
      if (loading) { loading = null; c.render(); return true; }
      if (t.index > 0) { t.index--; load(c, url(c), false); return true; }
      return false;
    }
  });
})();
