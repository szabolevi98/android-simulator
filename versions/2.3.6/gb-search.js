/* Android 2.3.6 Quick Search Box (packages/apps/QuickSearchBox): SearchActivity (search_activity.xml on Theme.Light.NoTitleBar:
   search_plate_global with the corpus_indicator, the search_src_text field on textfield_search_empty_google and the voice /
   go buttons, then SuggestionsView rows from suggestion.xml / contact_suggestion.xml), CorpusSelectionDialog
   (corpus_selection_dialog.xml: corpus_selector_arrow_up over corpus_selector_bg, the "Search" heading with the Add / Remove
   icon and a four-column grid of 76 dip corpus_grid_item cells) and SearchSettings (preferences.xml). Default corpora come
   from config.xml default_corpora: Web, Apps and Contacts; Messaging and Music can be added under Searchable items. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const str = (set, lang, key) => { const entry = window.GBStrings?.[set]?.strings?.[key]; return entry ? entry[lang] ?? entry.en : key; };
  const text = (lang, key) => str('search', lang, key);
  // Corpus: label, description (Searchable items), hint and icon. All and Web show the Google hint image instead of text.
  const CORPORA = {
    web: {label: ['search', 'corpus_label_web'], description: ['search', 'corpus_description_web'], icon: 'gb-qsb-corpus_icon_web.png', google: true},
    apps: {label: ['search', 'corpus_label_apps'], description: ['search', 'corpus_description_apps'], hint: ['search', 'corpus_hint_apps'], icon: 'gb-qsb-corpus_icon_apps.png'},
    contacts: {label: ['contacts', 'contactsList'], description: ['contacts', 'search_settings_description'], hint: ['contacts', 'searchHint'], icon: 'people.png'},
    messaging: {label: ['mms', 'search_label'], description: ['mms', 'search_setting_description'], hint: ['mms', 'search_hint'], icon: 'messaging.png'},
    music: {label: ['music', 'musicbrowserlabel'], description: ['music', 'search_settings_description'], hint: ['music', 'search_hint'], icon: 'music.png'}
  };
  const ORDER = ['web', 'apps', 'contacts', 'messaging', 'music'];
  const DEFAULT_CORPORA = ['web', 'apps', 'contacts'];
  const label = (lang, id) => id ? str(CORPORA[id].label[0], lang, CORPORA[id].label[1]) : text(lang, 'corpus_label_global');
  const enabled = list => ORDER.filter(id => (list || DEFAULT_CORPORA).includes(id));
  // Google suggest stand-ins for the offline simulator, in the 2011 spirit.
  const WEB = ['android', 'android 2.3 gingerbread', 'android market', 'nexus s', 'news', 'weather', 'wikipedia', 'youtube', 'maps', 'translate', 'gmail', 'google', 'movies', 'restaurants', 'music', 'nfc'];
  const norm = value => String(value || '').toLocaleLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const matches = (value, q) => { const v = norm(value); return v.startsWith(q) || v.split(/[\s.\-/]+/).some(word => word.startsWith(q)); };
  const looksLikeUrl = q => /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(q) || /^https?:\/\//.test(q);
  /* SuggestionsProvider: the shortcuts first (all of them for an empty query), then the web suggestions (query text normal,
     the completion bold), then each enabled corpus in order. Each item: kind, id, text1, text2, icon. */
  function suggest(ctx) {
    const q = norm(ctx.query.trim()), corpus = ctx.corpus, list = [], seen = new Set();
    const push = item => { const k = item.kind + ':' + item.id; if (!seen.has(k)) { seen.add(k); list.push(item); } };
    const inCorpus = kind => !corpus || corpus === kind || corpus === 'web' && (kind === 'web' || kind === 'url');
    for (const s of ctx.shortcuts || []) if (inCorpus(s.corpus) && (!q || matches(s.text1, q))) push({...s, shortcut: true});
    if (!q) return list;
    const on = enabled(ctx.corpora);
    if ((!corpus && on.includes('web') || corpus === 'web')) {
      if (looksLikeUrl(ctx.query.trim())) push({kind: 'url', corpus: 'web', id: ctx.query.trim(), text1: ctx.query.trim(), icon: 'gb-qsb-globe.png'});
      if (ctx.webSuggest !== false) WEB.filter(w => w.startsWith(q) && w !== q).slice(0, 3).forEach(w => push({kind: 'web', corpus: 'web', id: w, text1: w, query: ctx.query.trim(), icon: 'gb-qsb-magnifying_glass.png'}));
      (ctx.history || []).filter(url => !url.startsWith('search:') && matches(url, q)).slice(-2).reverse().forEach(url => push({kind: 'url', corpus: 'web', id: url, text1: ctx.titleOf(url), text2: url, icon: 'gb-qsb-globe.png'}));
    }
    const want = id => corpus ? corpus === id : on.includes(id);
    if (want('apps')) ctx.apps.filter(([, name]) => matches(name, q)).forEach(([id, name]) => push({kind: 'app', corpus: 'apps', id, text1: name, icon: id === 'play-store' ? 'play-store.svg?v=3' : id + '.png'}));
    if (want('contacts')) ctx.contacts.filter(c => matches(c.name, q) || norm(c.phone).replace(/\D/g, '').includes(q.replace(/\D/g, '') || '\u0000')).forEach(c => push({kind: 'contact', corpus: 'contacts', id: String(c.id), text1: c.name, text2: c.phone || c.email || '', icon: 'gb-c-ic_contact_list_picture.png', src: window.GBContactPhoto?.(c) || ''}));
    if (want('messaging')) ctx.messages.filter(m => norm(m.body).includes(q)).slice(0, 4).forEach(m => push({kind: 'message', corpus: 'messaging', id: String(m.contact), text1: m.body, text2: m.from, icon: 'messaging.png'}));
    if (want('music')) ctx.tracks.forEach((t, i) => { if (matches(t.title, q) || matches(t.artist, q) || matches(t.album, q)) push({kind: 'track', corpus: 'music', id: String(i), text1: t.title, text2: t.artist, icon: 'music.png'}); });
    return list;
  }
  // DefaultSuggestionView / ContactSuggestionView: 56 dip rows; a web suggestion shows the typed part normal and the rest bold.
  function row(item, i) {
    let t1 = e(item.text1);
    if (item.kind === 'web' && item.query && norm(item.text1).startsWith(norm(item.query))) t1 = `${e(item.text1.slice(0, item.query.length))}<b>${e(item.text1.slice(item.query.length))}</b>`;
    return `<button type="button" class="gbqs-row${item.text2 ? ' two' : ''}${item.kind === 'contact' ? ' contact' : ''}" data-action="gbqs-pick" data-id="${i}"><img src="${item.src ? e(item.src) : 'assets/' + e(item.icon)}" alt=""><span class="gbqs-t1">${t1}</span>${item.text2 ? `<span class="gbqs-t2${item.kind === 'url' ? ' url' : ''}">${e(item.text2)}</span>` : ''}</button>`;
  }
  const list = items => items.map(row).join('');
  function plate(ctx) {
    const c = ctx.corpus ? CORPORA[ctx.corpus] : null, google = !c || c.google, empty = !ctx.query;
    const hint = c?.hint ? str(c.hint[0], ctx.lang, c.hint[1]) : '';
    return `<form class="gbqs-plate${empty ? ' empty' : ''}${google ? ' google' : ''}" data-form="gbqs-search"><button type="button" class="gbqs-corpus" data-action="gbqs-corpora" aria-label="${e(label(ctx.lang, ctx.corpus))}"><img src="assets/${c ? c.icon : 'gb-qsb-search_app_icon.png'}" alt=""></button><span class="gbqs-field"><input name="q" autocomplete="off" spellcheck="false" value="${e(ctx.query)}" placeholder="${e(hint)}" aria-label="${e(google ? text(ctx.lang, 'google_search_hint') : hint)}">${google ? '<img class="gbqs-google" src="assets/gb-qsb-hint_google.png" alt="">' : ''}</span><button type="submit" class="gbqs-go" aria-label="${e(text(ctx.lang, 'app_name'))}"><img src="assets/gb-qsb-ic_btn_search.png" alt=""></button><button type="button" class="gbqs-voice" data-action="voice-search" aria-label="Voice search"><img src="assets/gb-qsb-ic_btn_speak_now.png" alt=""></button></form>`;
  }
  // CorpusSelectionDialog: All first, then the enabled corpora; the selected one is highlighted like the focused grid cell.
  function selector(ctx) {
    const cells = [['', 'gb-qsb-search_app_icon.png'], ...enabled(ctx.corpora).map(id => [id, CORPORA[id].icon])];
    return `<div class="gbqs-sel-scrim" data-action="gbqs-corpora-close"></div><div class="gbqs-sel" role="dialog" aria-label="${e(text(ctx.lang, 'corpus_selection_heading'))}"><img class="gbqs-sel-arrow" src="assets/gb-qsb-corpus_selector_arrow_up.png" alt=""><div class="gbqs-sel-frame"><div class="gbqs-sel-head"><span>${e(text(ctx.lang, 'corpus_selection_heading'))}</span><button type="button" class="gbqs-sel-edit" data-action="gbqs-settings" data-id="sources" aria-label="${e(text(ctx.lang, 'corpus_selection_edit_items'))}"><img src="assets/gb-qsb-corpus_edit_icon.png" alt=""></button></div><div class="gbqs-grid">${cells.map(([id, icon]) => `<button type="button" class="gbqs-cell${(ctx.corpus || '') === id ? ' current' : ''}" data-action="gbqs-corpus" data-id="${id}"><img src="assets/${icon}" alt=""><span>${e(label(ctx.lang, id))}</span></button>`).join('')}</div></div></div>`;
  }
  // SearchSettings and SearchableItemsSettings (Theme default: the window title bar over preference rows).
  function settings(ctx) {
    const T = key => text(ctx.lang, key);
    const rowHtml = (attrs, title, summary, check) => `<button class="gbset-row" ${attrs}><span class="gbset-text"><span class="gbset-title">${e(title)}</span>${summary ? `<span class="gbset-sum">${e(summary)}</span>` : ''}</span>${check === undefined ? '' : `<img class="gbset-check" src="assets/gb-btn_check_${check ? 'on' : 'off'}.png" alt="">`}</button>`;
    if (ctx.page === 'sources') {
      const on = enabled(ctx.corpora);
      return `<div class="app-view gbset" data-no-translate><div class="gb-titlebar">${e(T('search_sources'))}</div><div class="gbset-list">${ORDER.map(id => rowHtml(`data-action="gbqs-toggle-corpus" data-id="${id}" role="checkbox" aria-checked="${on.includes(id)}"`, label(ctx.lang, id), str(CORPORA[id].description[0], ctx.lang, CORPORA[id].description[1]), on.includes(id))).join('')}</div></div>`;
    }
    if (ctx.page === 'google') return `<div class="app-view gbset" data-no-translate><div class="gb-titlebar">${e(T('google_search_settings'))}</div><div class="gbset-list">${rowHtml(`data-action="gbqs-toggle-web" role="checkbox" aria-checked="${ctx.webSuggest !== false}"`, T('google_show_web_suggestions'), T(ctx.webSuggest !== false ? 'google_show_web_suggestions_summary_enabled' : 'google_show_web_suggestions_summary_disabled'), ctx.webSuggest !== false)}</div></div>`;
    return `<div class="app-view gbset" data-no-translate><div class="gb-titlebar">${e(T('search_settings'))}</div><div class="gbset-list"><div class="gbset-cat">${e(T('web_search_category_title'))}</div>${rowHtml('data-action="gbqs-settings" data-id="google"', T('google_search_settings'))}<div class="gbset-cat">${e(T('system_search_category_title'))}</div>${rowHtml('data-action="gbqs-settings" data-id="sources"', T('search_sources'), T('search_sources_summary'))}${rowHtml(`data-action="gbqs-clear"${ctx.shortcuts?.length ? '' : ' disabled'}`, T('clear_shortcuts'), T('clear_shortcuts_summary'))}</div></div>`;
  }
  function render(ctx) {
    if (ctx.page) return settings(ctx);
    return `<div class="app-view gbqs" data-no-translate>${plate(ctx)}<div class="gbqs-list">${list(ctx.items)}</div>${ctx.selecting ? selector(ctx) : ''}</div>`;
  }
  const menu = ctx => ctx.page ? [] : [{action: 'gbqs-settings', id: '', title: text(ctx.lang, 'menu_settings'), icon: 'ic_menu_preferences'}];
  const clearDialog = lang => ({title: text(lang, 'clear_shortcuts'), icon: 'ic_dialog_alert', message: text(lang, 'clear_shortcuts_prompt'), buttons: [{action: 'gbqs-clear-ok', title: text(lang, 'agree')}, {action: 'close-overlay', title: text(lang, 'disagree')}]});
  window.GBSearch = {CORPORA, ORDER, DEFAULT_CORPORA, text, label, enabled, suggest, list, render, menu, clearDialog};
})();
