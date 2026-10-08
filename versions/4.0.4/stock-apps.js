/* (4.0.4 registers Maps, Earth and News & Weather from this module: Maps 6.4.0, Earth 6.1 and News & Weather 1.3.04 of
   the Galaxy Nexus image share these 2012-13 designs.)
   The Google apps of the Nexus 4 image (JWR66Y, July 2013) as simple screens, from the KitKat simulator's stock-apps.js:
   Google (Google Search 2.5 opens Google Now), Voice Search listens, Maps 6.14 shows the drawn map under its pre-Maps-7
   action bar (Maps icon, Search, Directions, My Location, overflow), Keep 1.0 keeps notes, YouTube 4.5 has What to Watch
   and a player, Google+ 4.0 a Home stream, Earth 7.1 a turning globe, News & Weather its tabs, and Google Settings /
   Search settings their lists. All content is offline and made up; dates and topics are mid-2013. */
(() => {
  'use strict';
  const S = (ctx, app, key) => { const row = window.StockStrings?.[app]?.[key], i = ['hu', 'de', 'fr', 'es'].indexOf(String(ctx.locale || 'en').slice(0, 2)); return row ? (i >= 0 ? row[i] : row[4] || key) : ctx.t(key); };
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const ICON = {
    search: '<svg viewBox="0 0 24 24"><path d="M10 3a7 7 0 0 1 5.6 11.2l5.6 5.6-1.4 1.4-5.6-5.6A7 7 0 1 1 10 3zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" fill="currentColor"/></svg>',
    overflow: '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="19" r="2" fill="currentColor"/></svg>',
    mic: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    locate: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="currentColor"/><circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 1v3.5M12 19.5V23M1 12h3.5M19.5 12H23" stroke="currentColor" stroke-width="1.8"/></svg>',
    directions: '<svg viewBox="0 0 24 24"><path d="M12 2 22 12 12 22 2 12zm1 7V7l-4 4v4h2v-3h2v2l3-3z" fill="currentColor"/></svg>',
    add: '<svg viewBox="0 0 24 24"><path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7z" fill="currentColor"/></svg>',
    list: '<svg viewBox="0 0 24 24"><path d="M4 6h2v2H4zm4 0h12v2H8zm-4 5h2v2H4zm4 0h12v2H8zm-4 5h2v2H4zm4 0h12v2H8z" fill="currentColor"/></svg>',
    camera: '<svg viewBox="0 0 24 24"><path d="M9 4 7.2 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.2L15 4zm3 13a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" fill="currentColor"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M9 3h6l1 2h4v2H4V5h4zM6 8h12l-1 13H7z" fill="currentColor"/></svg>',
    folder: '<svg viewBox="0 0 24 24"><path d="M3 5h7l2 2h9v12H3z" fill="currentColor"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/></svg>',
    like: '<svg viewBox="0 0 24 24"><path d="M2 10h4v11H2zm6 11V10l5-8 1.2.6c.6.4.9 1.1.7 1.8L14 9h6a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 18.6 21z" fill="currentColor"/></svg>',
    share: '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3" fill="currentColor"/><circle cx="6" cy="12" r="3" fill="currentColor"/><circle cx="18" cy="19" r="3" fill="currentColor"/><path d="m6 12 12-7M6 12l12 7" stroke="currentColor" stroke-width="1.6"/></svg>',
    chevron: '<svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>'
  };
  const btn = (action, label, icon, id = '') => `<button class="sa-btn" data-action="${action}"${id ? ` data-id="${e(id)}"` : ''} aria-label="${e(label)}">${ICON[icon]}</button>`;
  // Action buttons with the apps' own drawables (assets/<prefix>-*.png).
  const img = (action, label, src, cls = '') => `<button class="sa-btn${cls ? ' ' + cls : ''}" data-action="${action}" aria-label="${e(label)}"><img src="assets/${src}" alt=""></button>`;
  function bar(ctx, {title, subtitle = '', up = false, icon, actions = '', cls = ''}) {
    return `<header class="sa-bar${cls}"><button class="sa-up" data-action="${up ? 'back' : 'home'}" aria-label="${e(ctx.t(up ? 'Back' : 'Home'))}">${up ? `<img class="sa-caret" src="assets/${/dark/.test(cls) ? 'ic_ab_back_holo_dark.png' : 'ic_ab_back_holo_light.png'}" alt="">` : ''}<img src="assets/${icon}" alt=""></button><span class="sa-title"><b>${e(title)}</b>${subtitle ? `<small>${e(subtitle)}</small>` : ''}</span>${actions}</header>`;
  }
  const thumb = (seed, label = '') => {
    const p = [['#2b5876', '#f4d06f'], ['#6d2e46', '#f6a5c0'], ['#1e5128', '#d8e9a8'], ['#22313f', '#ff8c42'], ['#4a3b8f', '#9bd1f2'], ['#7a1f1f', '#ffd166']][seed % 6];
    return `<svg class="sa-thumb" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="160" height="90" fill="${p[0]}"/><circle cx="${40 + seed * 17 % 80}" cy="38" r="22" fill="${p[1]}" opacity=".85"/><path d="M0 70 Q40 ${44 + seed % 3 * 6} 80 66 T160 60 V90 H0Z" fill="${p[1]}" opacity=".45"/>${label ? `<text x="8" y="82" font-family="Arial" font-size="11" fill="#fff">${e(label)}</text>` : ''}</svg>`;
  };
  const avatar = (name, seed) => `<span class="sa-avatar" style="background:${['#d65f4e', '#4d8fe0', '#5fae5a', '#e3a33b', '#8a63c9'][seed % 5]}">${e(name.charAt(0))}</span>`;

  // ---- Google (Google Now) and Voice Search ----
  function google(ctx) { return `<div class="app-view sa-app sa-google">${window.GELNow.render({data: ctx.data, t: ctx.t, locale: ctx.locale, now: ctx.now})}</div>`; }
  function voice(ctx) {
    const listening = ctx.ui.voiceState !== 'retry';
    return `<div class="app-view sa-app sa-voice"><div class="sa-voice-lang">${e(ctx.t('English (US)'))}</div><button class="sa-voice-mic${listening ? ' on' : ''}" data-action="voice-listen" aria-label="${e(ctx.t('Speak now'))}">${ICON.mic}</button><p>${e(ctx.t(listening ? 'Speak now' : 'Didn’t catch that. Try speaking again.'))}</p></div>`;
  }
  // Google Search settings (the overview "Settings" button) and the Google Settings app.
  function searchSettings(ctx) {
    const row = (icon, label) => `<button class="sa-row" data-action="sa-unsupported"><i>${ICON[icon] || ''}</i><span>${e(ctx.t(label))}</span></button>`;
    return `<div class="app-view sa-app sa-settings">${bar(ctx, {title: ctx.t('Settings'), up: true, icon: 'google-search.png'})}<div class="sa-scroll"><div class="sa-switch-row"><span>${e(ctx.t('Google Now'))}</span><button class="sa-switch${ctx.data.googleNowOn === false ? '' : ' on'}" data-action="google-now-toggle">${e(ctx.t(ctx.data.googleNowOn === false ? 'OFF' : 'ON'))}</button></div><h4>${e(ctx.t('SEARCH & NOW CARDS'))}</h4>${row('search', 'Phone search')}${row('mic', 'Voice')}${row('locate', 'Accounts & privacy')}${row('list', 'Notifications')}${row('', 'Help & feedback')}</div></div>`;
  }
  function googleSettings(ctx) {
    const rows = [['Ads', ''], ['Android Device Manager', ''], ['Location', ''], ['Search & Now', 'search'], ['Google+', ''], ['Google Fit', '']].slice(0, 5);
    return `<div class="app-view sa-app sa-settings">${bar(ctx, {title: ctx.t('Google Settings'), icon: 'google-settings.png'})}<div class="sa-scroll"><h4>${e(ctx.t('SERVICES'))}</h4>${rows.map(([label, sub]) => `<button class="sa-row" data-action="${sub === 'search' ? 'gel-overview-settings' : 'sa-unsupported'}"><span>${e(ctx.t(label))}</span></button>`).join('')}<h4>${e(ctx.t('APPS'))}</h4><button class="sa-row" data-action="sa-unsupported"><span>${e(ctx.t('Connected apps'))}</span></button></div></div>`;
  }

  // ---- Maps (Google Maps 7, 2013): a full-screen map, the floating search card, my location ----
  function mapSvg(ctx) {
    const pin = ctx.ui.mapsQuery ? '<g transform="translate(222 190)"><path d="M0-34a14 14 0 0 0-14 14c0 11 14 26 14 26s14-15 14-26A14 14 0 0 0 0-34z" fill="#db4437"/><circle cy="-20" r="5" fill="#fff"/></g>' : '';
    return `<svg class="sa-map" viewBox="0 0 360 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="360" height="600" fill="#ece8df"/><path d="M-10 430c80-20 120 10 200-10s140-60 180-50v240H-10z" fill="#a9cdee"/><rect x="30" y="80" width="110" height="90" fill="#cde5b4"/><rect x="230" y="300" width="90" height="70" fill="#cde5b4"/><g stroke="#fff" stroke-width="7" fill="none"><path d="M-10 200H370M-10 330H370M90 -10V620M260 -10V620"/></g><g stroke="#f7d36b" stroke-width="10" fill="none"><path d="M-10 260C80 250 140 280 200 240S320 200 370 210"/><path d="M180 -10C170 120 200 200 190 300S160 460 170 620"/></g><g stroke="#fff" stroke-width="3" fill="none"><path d="M-10 120H370M-10 380H370M40 -10V620M150 -10V620M320 -10V620"/></g><text x="50" y="130" font-family="Arial" font-size="12" fill="#5b8a46">${e(ctx.t('City Park'))}</text><text x="210" y="470" font-family="Arial" font-size="12" fill="#4a77a8" font-style="italic">${e(ctx.t('Bay'))}</text>${window.MapsRoute?.svg(ctx) || pin}<circle cx="180" cy="300" r="22" fill="#4285f4" opacity=".18"/><circle cx="180" cy="300" r="8" fill="#4285f4" stroke="#fff" stroke-width="3"/></svg>`;
  }
  // Maps 6.4.0 (IMM76I): res/menu/map_view_default.xml puts Search, Directions, Places and Layers in the bar
  // (ic_menu_* at 320 dpi) and Clear map, Settings and Help in the overflow; the Maps title opens
  // the feature switcher (FEATURE_SWITCHER_*: Map, Local, Latitude, GPS navigation, Traffic); the map carries the
  // my-location button (btn_myl_normal) and the zoom controls (btn_zoom_up / _down_normal). Layers toggles the map's
  // Traffic / Satellite / Terrain / Bicycling look.
  function maps(ctx) {
    // Directions: the input panel and the route list of maps-route.js.
    if (window.MapsRoute?.has(ctx.ui)) return MapsRoute.render({...ctx, bar: o => bar(ctx, o)});
    const q = ctx.ui.mapsQuery || '', searching = ctx.ui.mapsSearching || q, mp = key => S(ctx, 'maps', key), layer = ctx.data.mapsLayer || '';
    const actions = img('maps-search-open', mp('Search'), 'mp6-ic_menu_search.png') + img('mr-open', mp('Directions'), 'mp6-ic_menu_directions.png') + img('maps-places', mp('Local'), 'mp6-ic_menu_places.png') + img('maps-layers', mp('Layers'), 'mp6-ic_menu_layers.png') + btn('sa-menu', ctx.t('More options'), 'overflow');
    const head = bar(ctx, {title: mp('Maps'), icon: 'maps.png', actions}).replace('<span class="sa-title">', '<span class="sa-title sa-maps6-switcher" data-action="maps-switcher" role="button">');
    return `<div class="app-view sa-app sa-maps sa-maps6">${head}<div class="sa-maps6-map${layer ? ' layer-' + layer : ''}">${mapSvg(ctx)}${window.MapsRoute?.banner(ctx) || ''}<button class="sa-maps6-myl" data-action="maps-locate" aria-label="My Location"><img src="assets/mp6-btn_myl_normal.png" alt=""></button><span class="sa-maps6-zoom"><button data-action="maps-zoom" data-id="1" aria-label="+"><img src="assets/mp6-btn_zoom_up_normal.png" alt=""></button><button data-action="maps-zoom" data-id="-1" aria-label="-"><img src="assets/mp6-btn_zoom_down_normal.png" alt=""></button></span></div>${searching ? `<form class="sa-maps6-search" data-form="maps-search"><input name="query" autocomplete="off" placeholder="${e(mp('Search Maps'))}" aria-label="${e(mp('Search Maps'))}" value="${e(q)}"></form>` : ''}${q ? `<div class="sa-maps-card"><b>${e(q)}</b><small>${e(ctx.t('0.8 mi · 4 min drive'))}</small>${img('mr-open', mp('Directions'), 'mp6-ic_menu_directions.png').replace('data-action="mr-open"', `data-action="mr-open" data-id="${e(q)}"`)}</div>` : ''}</div>`;
  }


  // ---- Drive (2013): My Drive ----
  const FILES = [
    {id: 'f0', name: 'Photos', kind: 'folder', date: 'Oct 28'}, {id: 'f1', name: 'Trip plan 2014', kind: 'doc', date: 'Nov 2', text: 'Day 1 — arrive in Lisbon, tram 28 to Alfama.\nDay 2 — Belém, pastéis de nata.\nDay 3 — Sintra by train.'},
    {id: 'f2', name: 'Budget', kind: 'sheet', date: 'Oct 30', text: 'Rent 850\nGroceries 240\nTransport 60\nFun 120'}, {id: 'f3', name: 'Nexus 5 manual', kind: 'pdf', date: 'Oct 31', text: 'Welcome to Nexus 5. Swipe left from the Home screen to see Google Now.'},
    {id: 'f4', name: 'Meetup slides', kind: 'slides', date: 'Sep 12', text: 'What’s new in KitKat\n• Immersive mode\n• Printing\n• Host card emulation'}
  ];
  const kindColor = {folder: '#8f8f8f', doc: '#4285f4', sheet: '#0f9d58', pdf: '#db4437', slides: '#f4b400'};
  function drive(ctx) {
    if (ctx.ui.sub === 'file') {
      const file = FILES.find(f => f.id === ctx.ui.driveFile) || FILES[1];
      return `<div class="app-view sa-app sa-drive">${bar(ctx, {title: file.name, up: true, icon: 'drive.png', actions: btn('sa-unsupported', ctx.t('Share'), 'share') + btn('sa-unsupported', ctx.t('More options'), 'overflow')})}<div class="sa-scroll sa-doc"><div class="sa-page">${e(file.text || '').split('\n').map(line => `<p>${line}</p>`).join('')}</div></div></div>`;
    }
    const row = f => `<button class="sa-file" data-action="${f.kind === 'folder' ? 'sa-unsupported' : 'drive-open'}" data-id="${f.id}"><i style="background:${kindColor[f.kind]}">${f.kind === 'folder' ? ICON.folder : f.kind.charAt(0).toUpperCase()}</i><span><b>${e(f.name)}</b><small>${e(ctx.t('Modified'))} ${e(f.date)}</small></span></button>`;
    return `<div class="app-view sa-app sa-drive">${bar(ctx, {title: ctx.t('My Drive'), icon: 'drive.png', actions: btn('sa-unsupported', ctx.t('New'), 'add') + btn('sa-unsupported', ctx.t('Search'), 'search') + btn('sa-unsupported', ctx.t('More options'), 'overflow')})}<div class="sa-scroll sa-files">${FILES.map(row).join('')}</div></div>`;
  }

  // ---- Keep (2013): the quick note bar and coloured cards; notes are kept in data.keepNotes ----
  const KEEP_COLORS = ['#fff', '#f7f0a3', '#c6e5f5', '#c9f0b9', '#f8c8c0'];
  function keep(ctx) {
    const notes = ctx.data.keepNotes || [];
    if (ctx.ui.sub === 'note') {
      const note = notes.find(n => n.id === ctx.ui.keepNote);
      if (note) return `<div class="app-view sa-app sa-keep">${bar(ctx, {title: ctx.t('Keep'), up: true, icon: 'keep.png', actions: btn('keep-delete', ctx.t('Delete'), 'trash') + btn('sa-unsupported', ctx.t('More options'), 'overflow')})}<div class="sa-keep-edit" style="background:${KEEP_COLORS[note.color || 0]}"><textarea class="keep-text" maxlength="2000" aria-label="${e(ctx.t('Note'))}">${e(note.text)}</textarea></div></div>`;
    }
    return `<div class="app-view sa-app sa-keep">${bar(ctx, {title: ctx.t('Keep'), icon: 'keep.png', actions: btn('sa-unsupported', ctx.t('Search'), 'search') + btn('sa-unsupported', ctx.t('More options'), 'overflow')})}<form class="sa-keep-add" data-form="keep-add"><input name="text" maxlength="500" autocomplete="off" placeholder="${e(ctx.t('Add quick note…'))}" aria-label="${e(ctx.t('Add quick note…'))}">${btn('sa-unsupported', ctx.t('List'), 'list')}${btn('sa-unsupported', ctx.t('Voice'), 'mic')}${btn('sa-unsupported', ctx.t('Camera'), 'camera')}</form><div class="sa-scroll"><div class="sa-notes">${notes.map(n => `<button class="sa-note" data-action="keep-open" data-id="${e(n.id)}" style="background:${KEEP_COLORS[n.color || 0]}">${e(n.text)}</button>`).join('') || `<p class="sa-empty">${e(ctx.t('Notes you add appear here'))}</p>`}</div></div></div>`;
  }

  // ---- YouTube (2013): What to Watch and a player ----
  const VIDEOS = [
    {id: 'v1', title: 'Nexus 4 — hands-on and first impressions', channel: 'Gadget Weekly', views: '1,204,311', len: '8:42', likes: 9120},
    {id: 'v2', title: 'Jelly Bean: 10 tips for Android 4.3', channel: 'Droid Corner', views: '486,020', len: '6:15', likes: 4310},
    {id: 'v3', title: 'Timelapse: one day in the city', channel: 'Slow Motion Club', views: '92,437', len: '3:01', likes: 1876},
    {id: 'v4', title: 'How to make dessert-themed cupcakes', channel: 'Kitchen Science', views: '311,908', len: '11:20', likes: 2650}
  ];
  function youtube(ctx) {
    if (ctx.ui.sub === 'video') {
      const v = VIDEOS.find(item => item.id === ctx.ui.ytVideo) || VIDEOS[0], i = VIDEOS.indexOf(v), liked = (ctx.data.ytLikes || []).includes(v.id);
      return `<div class="app-view sa-app sa-youtube sa-yt-watch"><div class="sa-yt-player${ctx.ui.ytPaused ? '' : ' playing'}" data-action="yt-toggle">${thumb(i)}<span class="sa-yt-state">${ctx.ui.ytPaused ? ICON.play : ''}</span><i class="sa-yt-progress"></i></div><div class="sa-scroll"><div class="sa-yt-info"><b>${e(v.title)}</b><small>${e(v.channel)} · ${e(ctx.t('%s views').replace('%s', v.views))}</small><div class="sa-yt-actions"><button class="${liked ? 'on' : ''}" data-action="yt-like" data-id="${v.id}">${ICON.like}<span>${(v.likes + (liked ? 1 : 0)).toLocaleString(ctx.locale)}</span></button><button data-action="sa-unsupported">${ICON.share}<span>${e(ctx.t('Share'))}</span></button></div></div><h4>${e(ctx.t('Suggestions'))}</h4>${VIDEOS.filter(o => o !== v).map(o => `<button class="sa-yt-row" data-action="yt-video" data-id="${o.id}">${thumb(VIDEOS.indexOf(o))}<span><b>${e(o.title)}</b><small>${e(o.channel)}</small><small>${e(ctx.t('%s views').replace('%s', o.views))}</small></span></button>`).join('')}</div></div>`;
    }
    return `<div class="app-view sa-app sa-youtube"><header class="sa-bar sa-yt-bar"><button class="sa-up" data-action="home" aria-label="${e(ctx.t('Home'))}"><img src="assets/youtube.png" alt=""></button><span class="sa-title"><b>${e(ctx.t('What to Watch'))}</b></span>${btn('sa-unsupported', ctx.t('Search'), 'search')}${btn('sa-unsupported', ctx.t('More options'), 'overflow')}</header><div class="sa-scroll sa-yt-feed">${VIDEOS.map((v, i) => `<button class="sa-yt-card" data-action="yt-video" data-id="${v.id}"><span class="sa-yt-thumb">${thumb(i)}<em>${e(v.len)}</em></span><span class="sa-yt-copy"><b>${e(v.title)}</b><small>${e(v.channel)} · ${e(ctx.t('%s views').replace('%s', v.views))}</small></span></button>`).join('')}</div></div>`;
  }

  // ---- Google+ (2013): the Home stream ----
  const POSTS = [
    {id: 'p1', name: 'Alex Morgan', time: '2h', text: 'Finally got the Nexus 4. The glass back sparkles in the sun!', photo: 1, plus: 12},
    {id: 'p2', name: 'Android', time: '5h', text: 'Android 4.3, Jelly Bean: restricted profiles, Bluetooth Smart and OpenGL ES 3.0.', photo: 4, plus: 2381},
    {id: 'p3', name: 'Taylor Lee', time: 'Yesterday', text: 'Slides from the meetup are up on Drive. Thanks everyone for coming!', photo: null, plus: 7}
  ];
  function gplus(ctx) {
    const plused = ctx.data.gplusPlus || [];
    return `<div class="app-view sa-app sa-gplus">${bar(ctx, {title: ctx.t('Home'), subtitle: ctx.t('All'), icon: 'google-plus.png', actions: btn('sa-unsupported', ctx.t('Search'), 'search') + btn('sa-unsupported', ctx.t('More options'), 'overflow')})}<div class="sa-scroll sa-stream">${POSTS.map((p, i) => `<article class="sa-post">${avatar(p.name, i)}<div class="sa-post-head"><b>${e(p.name)}</b><small>${e(ctx.t(p.time))}</small></div><p>${e(p.text)}</p>${p.photo !== null ? `<div class="sa-post-photo">${thumb(p.photo)}</div>` : ''}<footer><button class="sa-plus${plused.includes(p.id) ? ' on' : ''}" data-action="gplus-plus" data-id="${p.id}">+1 <span>${p.plus + (plused.includes(p.id) ? 1 : 0)}</span></button><button data-action="sa-unsupported">${ICON.share}</button></footer></article>`).join('')}</div></div>`;
  }

  // ---- Earth 6.1 (IMM76I): Theme.Earth's overlay ActionBar on header_bar_bg_80_percent_black with menu-v11/main.xml's
  // four always-shown actions (Search, Layers, North up, My Location); the rest of the menu is in the overflow. ----
  function earthBar(ctx) {
    const ea = key => S(ctx, 'earth', key), icon = (action, label, src) => `<button class="sa-btn" data-action="${action}" aria-label="${e(label)}"><img src="assets/${src}" alt=""></button>`;
    return `<header class="sa-earth6-bar"><button class="sa-up" data-action="home" aria-label="${e(ea('Earth'))}"><img src="assets/earth.png" alt=""></button><span class="sa-title"><b>${e(ea('Earth'))}</b></span>${icon('sa-unsupported', ea('Search'), 'ea6-ic_menu_search.png')}${icon('sa-unsupported', ea('Layers'), 'ea6-ic_menu_layers.png')}${icon('sa-unsupported', ctx.t('North up'), 'ea6-ic_menu_northup.png')}${icon('sa-unsupported', ea('My Location'), 'ea6-ic_menu_mylocation.png')}<button class="sa-btn" data-action="sa-menu" aria-label="${e(ctx.t('More options'))}"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button></header>`;
  }
  function earth(ctx) {
    return `<div class="app-view sa-app sa-earth"><div class="sa-stars"></div><div class="sa-globe">${'<svg viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="sa-gl" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#6fb4ff"/><stop offset=".55" stop-color="#1c5fb8"/><stop offset="1" stop-color="#05173d"/></radialGradient><clipPath id="sa-gc"><circle cx="100" cy="100" r="92"/></clipPath></defs><circle cx="100" cy="100" r="96" fill="#6fb4ff" opacity=".18"/><circle cx="100" cy="100" r="92" fill="url(#sa-gl)"/><g clip-path="url(#sa-gc)"><g class="sa-land" fill="#4f8f3e"><path d="M10 60c20-14 44-10 52 4s-8 26-2 40-20 30-36 22-26-48-14-66z"/><path d="M90 96c16-6 38 2 44 22s-8 40-26 46-24-12-18-30-16-30 0-38z"/><path d="M80 24c12-4 28 2 30 12s-16 10-24 6-18-16-6-18z"/><path d="M210 60c20-14 44-10 52 4s-8 26-2 40-20 30-36 22-26-48-14-66z"/><path d="M290 96c16-6 38 2 44 22s-8 40-26 46-24-12-18-30-16-30 0-38z"/><path d="M280 24c12-4 28 2 30 12s-16 10-24 6-18-16-6-18z"/></g><g fill="#fff" opacity=".55"><ellipse cx="60" cy="140" rx="30" ry="6"/><ellipse cx="140" cy="60" rx="24" ry="5"/></g></g><circle cx="100" cy="100" r="92" fill="none" stroke="#9cd0ff" stroke-opacity=".5" stroke-width="2"/></svg>'}</div>${earthBar(ctx)}</div>`;
  }

  // ---- News & Weather (2013, Holo dark): Weather, Top Stories and topics ----
  const STORIES = {
    'Top Stories': [['Android 4.0.4 rolls out to the Galaxy Nexus', 'Tech Daily', '2 hours ago'], ['City marathon draws record crowd', 'Metro News', '4 hours ago'], ['Researchers map the ocean floor in 3D', 'Science Today', '6 hours ago']],
    'Technology': [['Android Market becomes Google Play', 'Gadget Weekly', '1 hour ago'], ['Smart watches: the next big thing?', 'Droid Corner', '3 hours ago']],
    'Sports': [['Underdogs win the cup final', 'Sports Desk', '5 hours ago']]
  };
  // News & Weather 1.3.04 (GenieWidget.apk, IMM76I): no action bar (Theme.NoTitleBar), then 1.3.11's layouts:
  // tab_view_container_layout.xml's 52 dp tabs (12 sp, a 6 dp #33b5e5 bottom when selected), news_item_layout.xml rows
  // (80 dp, 16 sp bold white title, 14 sp #bfbfbf snippet, the 70 dp picture) on #1a1a1a, weather_current_view.xml in
  // bg_weather_panel_app with the APK's ic_weather_* icons and The Weather Channel's logo, weather_forecast_layout.xml.
  function news(ctx) {
    const n = key => S(ctx, 'news', key), NP = window.NewsPrefs, standard = ['Top Stories', 'Technology', 'Sports'];
    // NewsContent and Preferences take the application's default theme (Theme.Holo for targetSdkVersion 11): a dark
    // action bar; Share story sits in the story's overflow.
    const newsBar = title => bar(ctx, {title, up: true, icon: 'news-weather.png', cls: ' dark', actions: btn('sa-menu', ctx.t('More options'), 'overflow')});
    if (ctx.ui.newsSub === 'settings') return NP.render({data: ctx.data, ui: ctx.ui, lang: ctx.lang, locale: ctx.locale, N: n, t: ctx.t, standard, topic: name => ctx.t(name), version: '1.3.04', bar: title => bar(ctx, {title, up: true, icon: 'news-weather.png', cls: ' dark'})});
    const [storyTab, storyIndex] = String(ctx.ui.newsStory || '').split(':'), story = ctx.ui.newsSub === 'story' && STORIES[storyTab]?.[Number(storyIndex)];
    if (story) return `<div class="app-view sa-app sa-news nw-story-view">${newsBar(story[0])}<div class="sa-scroll">${NP.story({title: story[0], source: story[1], time: ctx.t(story[2]), picture: Number(storyIndex) === 0 ? `<span class="nwp-picture">${thumb(2)}</span>` : ''})}</div></div>`;
    const metric = NP.metric(ctx.data, ctx.lang), deg = c => `${metric ? c : Math.round(c * 9 / 5 + 32)}°`;
    const tabs = ['Weather', ...NP.topics(ctx.data, standard)], tab = tabs.includes(ctx.ui.newsTab) ? ctx.ui.newsTab : tabs[1] || 'Weather';
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], forecast = [[21, 13, 'partly_cloudy'], [23, 14, 'sunny'], [19, 12, 'cloudy'], [20, 11, 'chance_of_rain']];
    const body = tab === 'Weather'
      ? `<div class="nw-weather"><div class="nw-city"><b>${e(NP.city(ctx.data, 'Mountain View'))}</b><button data-action="sa-unsupported" aria-label="Info"><img src="assets/nw-weather_info_btn.png" alt=""></button></div><i class="nw-divider"></i><div class="nw-today"><img class="nw-twc" src="assets/nw-ic_weather_weather_channel.png" alt="The Weather Channel"><div class="nw-now"><img src="assets/nw-ic_weather_partly_cloudy_xl.png" alt=""><b>${deg(21)}</b></div><div class="nw-range"><span>${deg(21)}</span><span class="lo">${deg(13)}</span><p>${e(ctx.t('Partly cloudy'))}</p><small>${e(n('Humidity: %s%%').replace('%s%%', '60%'))}</small><small>${e(n('Wind: %1$s %2$s').replace('%1$s', metric ? '13' : '8').replace('%2$s', n(metric ? 'km/h' : 'mph')))}</small></div></div><i class="nw-divider"></i><div class="nw-forecast">${forecast.map(([hi, lo, icon], i) => `<div><span>${e(n(DAYS[new Date(ctx.now.getTime() + i * 864e5).getDay()]))}</span><img src="assets/nw-ic_weather_${icon}_s.png" alt=""><b>${deg(hi)}</b><small>${deg(lo)}</small></div>`).join('')}</div></div>`
      : STORIES[tab] ? `<div class="nw-list">${STORIES[tab].map(([title, source, time], i) => `<button class="nw-item${i === 0 ? ' pic' : ''}" data-action="news-story" data-id="${e(tab)}:${i}"><span><b>${e(title)}</b><small>${e(source)} - ${e(ctx.t(time))}</small></span>${i === 0 ? `<span class="nw-pic">${thumb(i + 2)}</span>` : ''}</button>`).join('')}</div>` : `<p class="nw-unavailable">${e(n("News isn't available right now."))}</p>`;
    return `<div class="app-view sa-app sa-news"><nav class="nw-tabs">${tabs.map(id => `<button class="${id === tab ? 'on' : ''}" data-action="news-tab" data-id="${e(id)}"${id === 'Weather' || standard.includes(id) ? '' : ' data-no-translate'}>${e(id === 'Weather' ? n('Weather') : standard.includes(id) ? ctx.t(id) : id)}</button>`).join('')}</nav><div class="sa-scroll">${body}</div></div>`;
  }

  const APPS = {'google-search': (ctx) => ctx.ui.sub === 'settings' ? searchSettings(ctx) : google(ctx), 'voice-search': voice, maps, drive, keep, youtube, 'google-plus': gplus, earth, 'news-weather': news, 'google-settings': googleSettings, 'google-search-settings': searchSettings};
  function render(app, ctx) { return (APPS[app] || google)(ctx); }
  const SIMPLE = ['google-search', 'voice-search', 'maps', 'keep', 'youtube', 'google-plus', 'earth', 'news-weather', 'google-settings'];
  const DEFAULT_NOTES = [{id: 'k1', text: 'Buy concert tickets', color: 0}, {id: 'k2', text: 'Groceries: milk, eggs, jelly beans', color: 1}, {id: 'k3', text: 'Call Mom on Sunday', color: 2}];
  // The overflow of the screen on show. GenieWidget 1.3.04 (IMM76I) res/menu/main_menu.xml: Refresh and Settings have no showAsAction, so both sit in the overflow.
  function menu(view, ctx) {
    if (view === 'maps') {
      const mp = key => S(ctx, 'maps', key);
      if (ctx.ui?.mapsMenu === 'switcher') return [{action: 'maps-feature', id: 'map', title: mp('Map')}, {action: 'maps-feature', id: 'local', title: `${mp('Local')} — ${mp('Find restaurants, bars & more')}`}, {action: 'maps-feature', id: 'navigation', title: mp('GPS navigation')}, {action: 'maps-feature', id: 'traffic', title: mp('Traffic')}];
      if (ctx.ui?.mapsMenu === 'layers') return [['traffic', 'Traffic'], ['satellite', 'Satellite'], ['terrain', 'Terrain'], ['bicycling', 'Bicycling']].map(([id, key]) => ({action: 'maps-layer', id, title: mp(key)})).concat([{action: 'maps-layer', id: '', title: mp('Clear map')}]);
      return [{action: 'maps-clear', title: mp('Clear map')}, {action: 'sa-unsupported', title: mp('Settings')}, {action: 'sa-unsupported', title: mp('Help')}];
    }
    if (view === 'earth') { const ea = key => S(ctx, 'earth', key); return ['Settings', 'Help', 'Terms Of Service'].map(key => ({action: 'sa-unsupported', title: ea(key)})); }
    // main_menu.xml (Refresh, Settings), webview_menu.xml on a story (Share story), none on the settings.
    if (view === 'news-weather') { const n = key => S(ctx, 'news', key); return ctx.ui?.newsSub === 'settings' ? [] : ctx.ui?.newsSub === 'story' ? [{action: 'news-share', title: n('Share story')}] : [{action: 'sa-news-refresh', title: n('Refresh')}, {action: 'news-settings', title: n('Settings')}]; }
    return [];
  }
  window.StockApps = {mapSvg, APPS: SIMPLE, FILES, VIDEOS, POSTS, DEFAULT_NOTES, render, menu};
})();
