/* The Google apps of the Nexus 4 image (JWR66Y, July 2013) as simple screens, from the KitKat simulator's stock-apps.js:
   Google (Google Search 2.5 opens Google Now), Voice Search listens, Maps 6.14 shows the drawn map under its pre-Maps-7
   action bar (Maps icon, Search, Directions, My Location, overflow), Keep 1.0 keeps notes, YouTube 4.5 has What to Watch
   and a player, Google+ 4.0 a Home stream, Earth 7.1 a turning globe, News & Weather its tabs, and Google Settings /
   Search settings their lists. All content is offline and made up; dates and topics are mid-2013. */
(() => {
  'use strict';
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
  const S = (ctx, app, key) => { const row = window.StockStrings?.[app]?.[key], i = ['hu', 'de', 'fr', 'es'].indexOf(String(ctx.locale || 'en').slice(0, 2)); return row ? (i >= 0 ? row[i] : row[4] || key) : ctx.t(key); };
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
  function google(ctx) { return `<div class="app-view sa-app sa-google">${window.VelvetNow.render({data: ctx.data, t: ctx.t, locale: ctx.locale, now: ctx.now, s: key => S(ctx, 'google', key)})}</div>`; }
  // Voice Search on 4.3 is Google Search 2.5.9's speak_now.xml: on #e5e5e5, a search_bg panel 260 dp tall
  // (speak_now_speech.xml) with ic_google_medium_dark at 30 / 28 dp, the 152 dp recognizer at the right (vs_micbtn_rec
  // over vs_reactive_light while listening, vs_micbtn_on after; vs_levels_guideline around it) and main_text (20 sp
  // sans-serif-light #777, 32 dp margins) at the bottom: "Speak now", then "Didn't catch that. Try speaking again."
  function voice(ctx) {
    const listening = ctx.ui.voiceState !== 'retry', v = key => S(ctx, 'google', key);
    return `<div class="app-view sa-app sa-voice"><div class="vs-panel"><div class="vs-speech"><img class="vs-logo" src="assets/vn-ic_google_medium_dark.png" alt="Google"><div class="vs-recognizer${listening ? ' on' : ''}"><img class="vs-guide" src="assets/vn-vs_levels_guideline.png" alt=""><img class="vs-levels" src="assets/vn-vs_reactive_light.png" alt=""><button class="vs-mic" data-action="voice-listen" aria-label="${e(v('Tap to speak'))}"><img src="assets/vn-vs_micbtn_shadow.png" alt=""><img src="assets/vn-vs_micbtn_${listening ? 'rec' : 'on'}.png" alt=""></button></div><p>${e(v(listening ? 'Speak now' : "Didn't catch that. Try speaking again."))}</p></div></div></div>`;
  }
  // Google Search settings (the overview "Settings" button) and the Google Settings app.
  function searchSettings(ctx) {
    const row = (icon, label) => `<button class="sa-row" data-action="sa-unsupported"><i>${ICON[icon] || ''}</i><span>${e(ctx.t(label))}</span></button>`;
    return `<div class="app-view sa-app sa-settings">${bar(ctx, {title: ctx.t('Settings'), up: true, icon: 'google-search.png'})}<div class="sa-scroll"><div class="sa-switch-row"><span>${e(ctx.t('Google Now'))}</span><button class="sa-switch${ctx.data.googleNowOn === false ? '' : ' on'}" data-action="google-now-toggle">${e(ctx.t(ctx.data.googleNowOn === false ? 'OFF' : 'ON'))}</button></div><h4>${e(ctx.t('SEARCH & NOW CARDS'))}</h4>${row('search', 'Phone search')}${row('mic', 'Voice')}${row('locate', 'Accounts & privacy')}${row('list', 'Notifications')}${row('', 'Help & feedback')}</div></div>`;
  }
  // Google Settings (Google Play services, PrebuiltGmsCore.apk of JWR66Y): common_settings.xml's own 48 dp bar on
  // common_settings_bg (the up icon invisible when opened from the launcher, the 32 dp icon, "Google Settings" in 18 sp)
  // over a list with 16 dp side margins. GoogleSettingsActivity.e() adds, in this order and unsorted, Apps with Google+
  // Sign-In, Google+, (Play Games, only with the Games app), Location, Search, Ads and Verify apps, each a
  // simple_list_item_1 at 18 sp; Search opens Google Search's privacy settings.
  function googleSettings(ctx) {
    const g = key => S(ctx, 'gsettings', key);
    const rows = [['Apps with Google+ Sign-In'], ['Google+'], ['Location'], ['Search', 'gel-overview-settings'], ['Ads'], ['Verify apps']];
    return `<div class="app-view sa-app sa-gsettings"><header class="gs-bar"><button class="gs-up" data-action="home" aria-label="${e(g('Google Settings'))}"><i></i><img src="assets/google-settings.png" alt=""></button><b>${e(g('Google Settings'))}</b></header><div class="sa-scroll"><div class="gs-list">${rows.map(([key, action]) => `<button data-action="${action || 'sa-unsupported'}">${e(g(key))}</button>`).join('')}</div></div></div>`;
  }


  // ---- Maps (Google Maps 7, 2013): a full-screen map, the floating search card, my location ----
  function mapSvg(ctx) {
    const pin = ctx.ui.mapsQuery ? '<g transform="translate(222 190)"><path d="M0-34a14 14 0 0 0-14 14c0 11 14 26 14 26s14-15 14-26A14 14 0 0 0 0-34z" fill="#db4437"/><circle cy="-20" r="5" fill="#fff"/></g>' : '';
    return `<svg class="sa-map" viewBox="0 0 360 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="360" height="600" fill="#ece8df"/><path d="M-10 430c80-20 120 10 200-10s140-60 180-50v240H-10z" fill="#a9cdee"/><rect x="30" y="80" width="110" height="90" fill="#cde5b4"/><rect x="230" y="300" width="90" height="70" fill="#cde5b4"/><g stroke="#fff" stroke-width="7" fill="none"><path d="M-10 200H370M-10 330H370M90 -10V620M260 -10V620"/></g><g stroke="#f7d36b" stroke-width="10" fill="none"><path d="M-10 260C80 250 140 280 200 240S320 200 370 210"/><path d="M180 -10C170 120 200 200 190 300S160 460 170 620"/></g><g stroke="#fff" stroke-width="3" fill="none"><path d="M-10 120H370M-10 380H370M40 -10V620M150 -10V620M320 -10V620"/></g><text x="50" y="130" font-family="Arial" font-size="12" fill="#5b8a46">${e(ctx.t('City Park'))}</text><text x="210" y="470" font-family="Arial" font-size="12" fill="#4a77a8" font-style="italic">${e(ctx.t('Bay'))}</text>${pin}<circle cx="180" cy="300" r="22" fill="#4285f4" opacity=".18"/><circle cx="180" cy="300" r="8" fill="#4285f4" stroke="#fff" stroke-width="3"/></svg>`;
  }
  // Maps 6.14.4 (JWR66Y): res/menu-v14/map_view_default.xml puts Search, Directions, Places and Layers in the bar
  // (ic_menu_* from drawable-320dpi-v14) and Clear map, My Places, Settings and Help in the overflow; the Maps title opens
  // the feature switcher (FEATURE_SWITCHER_*: Map, Local, Latitude, GPS navigation, Traffic); the map carries the
  // my-location button (btn_myl_normal) and the zoom controls (btn_zoom_up / _down_normal). Layers toggles the map's
  // Traffic / Satellite / Terrain / Bicycling look.
  function maps(ctx) {
    const q = ctx.ui.mapsQuery || '', searching = ctx.ui.mapsSearching || q, mp = key => S(ctx, 'maps', key), layer = ctx.data.mapsLayer || '';
    const actions = img('maps-search-open', mp('Search'), 'mp6-ic_menu_search.png') + img('sa-unsupported', mp('Directions'), 'mp6-ic_menu_directions.png') + img('maps-places', mp('Local'), 'mp6-ic_menu_places.png') + img('maps-layers', mp('Layers'), 'mp6-ic_menu_layers.png') + btn('sa-menu', ctx.t('More options'), 'overflow');
    const head = bar(ctx, {title: mp('Maps'), icon: 'maps.png', actions}).replace('<span class="sa-title">', '<span class="sa-title sa-maps6-switcher" data-action="maps-switcher" role="button">');
    return `<div class="app-view sa-app sa-maps sa-maps6">${head}<div class="sa-maps6-map${layer ? ' layer-' + layer : ''}">${mapSvg(ctx)}<button class="sa-maps6-myl" data-action="maps-locate" aria-label="My Location"><img src="assets/mp6-btn_myl_normal.png" alt=""></button><span class="sa-maps6-zoom"><button data-action="maps-zoom" data-id="1" aria-label="+"><img src="assets/mp6-btn_zoom_up_normal.png" alt=""></button><button data-action="maps-zoom" data-id="-1" aria-label="-"><img src="assets/mp6-btn_zoom_down_normal.png" alt=""></button></span></div>${searching ? `<form class="sa-maps6-search" data-form="maps-search"><input name="query" autocomplete="off" placeholder="${e(mp('Search Maps'))}" aria-label="${e(mp('Search Maps'))}" value="${e(q)}"></form>` : ''}${q ? `<div class="sa-maps-card"><b>${e(q)}</b><small>${e(ctx.t('0.8 mi · 4 min drive'))}</small>${img('sa-unsupported', mp('Directions'), 'mp6-ic_menu_directions.png')}</div>` : ''}</div>`;
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
  // Keep 1.0.81 (JWR66Y): browse_fragment_menu.xml has no action icons, everything is in the overflow; quick_edit.xml spans
  // the width (quick_edit_side_margins 0) with "Add quick note", a 1 dp #25000000 divider and add_items_bar.xml's New note /
  // New list / New recording / New photo (ic_*_dark); notes are browse_list_text_note.xml on note_shadow, 16 sp #99000000,
  // in two columns or one (Single-column / Multi-column view).
  function keep(ctx) {
    const notes = ctx.data.keepNotes || [], k = key => S(ctx, 'keep', key);
    if (ctx.ui.sub === 'note') {
      const note = notes.find(n => n.id === ctx.ui.keepNote);
      if (note) return `<div class="app-view sa-app sa-keep">${bar(ctx, {title: k('Keep'), up: true, icon: 'keep.png', actions: img('keep-color', k('Note color'), 'kp-ic_colorpicker_dark.png') + img('sa-unsupported', k('New photo'), 'kp-ic_add_camera_dark.png') + btn('sa-menu', ctx.t('More options'), 'overflow')})}<div class="sa-keep-edit" style="background:${KEEP_COLORS[note.color || 0]}"><textarea class="keep-text" maxlength="2000" aria-label="${e(k('New note'))}">${e(note.text)}</textarea></div></div>`;
    }
    const archived = ctx.ui.keepArchived, shown = notes.filter(n => !!n.archived === !!archived), single = ctx.data.keepSingle;
    const add = (action, key, src) => `<button type="button" class="sa-keep-new" data-action="${action}" aria-label="${e(k(key))}"><img src="assets/kp-${src}.png" alt=""></button>`;
    const quick = archived ? '' : `<form class="sa-keep-add" data-form="keep-add"><input name="text" maxlength="500" autocomplete="off" placeholder="${e(k('Add quick note'))}" aria-label="${e(k('Add quick note'))}"><i></i><div class="sa-keep-items">${add('keep-new', 'New note', 'ic_note_dark')}${add('sa-unsupported', 'New list', 'ic_list_dark')}${add('sa-unsupported', 'New recording', 'ic_mic_dark')}${add('sa-unsupported', 'New photo', 'ic_camera_dark')}</div></form>`;
    return `<div class="app-view sa-app sa-keep">${bar(ctx, {title: archived ? k('Archived notes') : k('Keep'), up: !!archived, icon: 'keep.png', actions: btn('sa-menu', ctx.t('More options'), 'overflow')})}${quick}<div class="sa-scroll"><div class="sa-notes${single ? ' single' : ''}">${shown.map(n => `<button class="sa-note" data-action="keep-open" data-id="${e(n.id)}" style="--note:${KEEP_COLORS[n.color || 0]}">${e(n.text)}</button>`).join('') || `<p class="sa-empty">${e(k(archived ? 'There are no archived notes' : 'Take a note'))}</p>`}</div></div></div>`;
  }

  // ---- YouTube (2013): What to Watch and a player ----
  const VIDEOS = [
    {id: 'v1', title: 'Nexus 4 — hands-on and first impressions', channel: 'Gadget Weekly', views: '1,204,311', len: '8:42', likes: 9120},
    {id: 'v2', title: 'Jelly Bean: 10 tips for Android 4.3', channel: 'Droid Corner', views: '486,020', len: '6:15', likes: 4310},
    {id: 'v3', title: 'Timelapse: one day in the city', channel: 'Slow Motion Club', views: '92,437', len: '3:01', likes: 1876},
    {id: 'v4', title: 'How to make dessert-themed cupcakes', channel: 'Kitchen Science', views: '311,908', len: '11:20', likes: 2650}
  ];
  // YouTube 4.5.17 (JWR66Y): ActionBar (v14) on bg_stripes_dark with ic_logo_wide and no title; menu.xml puts Search in
  // the bar and Settings / Feedback / Help in the overflow; watch_menu.xml Add to and Share, then Like, Dislike, Copy URL
  // and Flag. The Feed (the_feed_video_item.xml) shows the channel's 36 dp avatar and name (16 sp bold #3d3d3d) over the
  // full-width thumbnail with its gradient (video_gradient_overlay_shape), the 18 sp white title and the duration.
  function youtube(ctx) {
    const y = key => S(ctx, 'youtube', key), more = btn('sa-menu', ctx.t('More options'), 'overflow');
    const ybar = (up, actions) => `<header class="sa-bar sa-yt-bar dark"><button class="sa-up" data-action="${up ? 'back' : 'home'}" aria-label="YouTube">${up ? '<img class="sa-caret" src="assets/ic_ab_back_holo_dark.png" alt="">' : ''}<img class="sa-yt-logo" src="assets/yt4-ic_logo_wide.png" alt="YouTube"></button><span class="sa-title"></span>${actions}</header>`;
    if (ctx.ui.sub === 'video') {
      const v = VIDEOS.find(item => item.id === ctx.ui.ytVideo) || VIDEOS[0], i = VIDEOS.indexOf(v);
      return `<div class="app-view sa-app sa-youtube sa-yt-watch">${ybar(true, img('sa-unsupported', y('Add to'), 'yt4-ic_menu_add_to_playlist.png') + img('sa-unsupported', y('Share'), 'yt4-ic_menu_share.png') + more)}<div class="sa-yt-player${ctx.ui.ytPaused ? '' : ' playing'}" data-action="yt-toggle">${thumb(i)}<span class="sa-yt-state">${ctx.ui.ytPaused ? ICON.play : ''}</span><i class="sa-yt-progress"></i></div><div class="sa-scroll"><div class="sa-yt-info"><b>${e(v.title)}</b><small>${e(v.channel)} · ${e(ctx.t('%s views').replace('%s', v.views))}</small></div><h4>${e(ctx.t('Suggestions'))}</h4>${VIDEOS.filter(o => o !== v).map(o => `<button class="sa-yt-row" data-action="yt-video" data-id="${o.id}">${thumb(VIDEOS.indexOf(o))}<span><b>${e(o.title)}</b><small>${e(o.channel)}</small><small>${e(ctx.t('%s views').replace('%s', o.views))}</small></span></button>`).join('')}</div></div>`;
    }
    return `<div class="app-view sa-app sa-youtube">${ybar(false, img('sa-unsupported', y('Search'), 'yt4-ic_menu_search.png') + more)}<div class="sa-scroll sa-yt-feed">${VIDEOS.map((v, i) => `<button class="sa-yt-item" data-action="yt-video" data-id="${v.id}"><span class="sa-yt-author"><img src="assets/yt4-missing_avatar.png" alt=""><b>${e(v.channel)}</b></span><span class="sa-yt-thumb">${thumb(i)}<i></i><b>${e(v.title)}</b><em>${e(v.len)}</em></span></button>`).join('')}</div></div>`;
  }

  // ---- Google+ (2013): the Home stream ----
  const POSTS = [
    {id: 'p1', name: 'Alex Morgan', time: '2h', text: 'Finally got the Nexus 4. The glass back sparkles in the sun!', photo: 1, plus: 12},
    {id: 'p2', name: 'Android', time: '5h', text: 'Android 4.3, Jelly Bean: restricted profiles, Bluetooth Smart and OpenGL ES 3.0.', photo: 4, plus: 2381},
    {id: 'p3', name: 'Taylor Lee', time: 'Yesterday', text: 'Slides from the meetup are up on Drive. Thanks everyone for coming!', photo: null, plus: 7}
  ];
  function gplus(ctx) {
    const plused = ctx.data.gplusPlus || [];
    // Google+ 4.0 (JWR66Y): host_action_bar.xml on ab_solid_light_holo with ic_gplus_red_32, the stream spinner, the
    // notifications button (notification_count: #dd4b39, 3 sp corners) and the overflow (host_menu.xml's stream items);
    // compose_bar.xml at the bottom: Photo, Check in, Mood and Write in #427fed / #b23424 / #f4b400 / #3e802f on black.
    const g = key => S(ctx, 'gplus', key);
    const compose = [['Photo', 'ic_camera_active', '#427fed'], ['Check in', 'ic_location_active', '#b23424'], ['Mood', 'ic_mood_gold', '#f4b400'], ['Write', 'ic_text_active', '#3e802f']].map(([key, icon, color]) => `<button data-action="sa-unsupported" style="color:${color}"><img src="assets/gp4-${icon}.png" alt="">${e(g(key))}</button>`).join('');
    return `<div class="app-view sa-app sa-gplus">${bar(ctx, {title: g('Home'), subtitle: ctx.t('All'), icon: 'gp4-ic_gplus_red_32.png', actions: '<button class="sa-gp-notify" data-action="sa-unsupported" aria-label="Notifications"><b>2</b></button>' + btn('sa-menu', ctx.t('More options'), 'overflow')})}<div class="sa-scroll sa-stream">${POSTS.map((p, i) => `<article class="sa-post">${avatar(p.name, i)}<div class="sa-post-head"><b>${e(p.name)}</b><small>${e(ctx.t(p.time))}</small></div><p>${e(p.text)}</p>${p.photo !== null ? `<div class="sa-post-photo">${thumb(p.photo)}</div>` : ''}<footer><button class="sa-plus${plused.includes(p.id) ? ' on' : ''}" data-action="gplus-plus" data-id="${p.id}">+1 <span>${p.plus + (plused.includes(p.id) ? 1 : 0)}</span></button><button data-action="sa-unsupported" aria-label="Reshare"><img src="assets/gp4-ic_reshare_16.png" alt=""></button></footer></article>`).join('')}</div><nav class="sa-gp-compose">${compose}</nav></div>`;
  }

  // ---- Earth (2013): the globe in space under a translucent search bar ----
  // Earth 7.1.1 (JWR66Y): Theme.Earth (Holo, overlay action bar on header_bar_bg_80_percent_black, #cc000000) with
  // res/menu-v11/main.xml: Search (expands to "Example: Pizza"), Reset to north, My location and the sensors toggle in the
  // bar; Clear map, Share, Settings, Feedback, Help, Tutorial and Fly to in the overflow.
  function earthBar(ctx) {
    const ea = key => S(ctx, 'earth', key);
    const search = ctx.ui.earthSearching ? `<form class="sa-earth-field" data-form="earth-search"><input name="query" autocomplete="off" placeholder="${e(ea('Example: Pizza'))}" aria-label="${e(ea('Search'))}"></form>` : img('earth-search-open', ea('Search'), 'ea7-ic_menu_search_holo_dark.png');
    return `<header class="sa-bar dark sa-earth-bar"><button class="sa-up" data-action="${ctx.ui.earthSearching ? 'earth-search-close' : 'home'}" aria-label="${e(ea('Earth'))}"><img src="assets/earth.png" alt=""></button><span class="sa-title"><b>${ctx.ui.earthSearching ? '' : e(ea('Earth'))}</b></span>${search}${img('sa-unsupported', ea('Reset to north'), 'ea7-ic_menu_northup.png', 'tall')}${img('sa-unsupported', ea('My location'), 'ea7-ic_menu_mylocation.png')}${img('earth-sensors', 'Sensors', 'ea7-ic_menu_sensors_disabled.png', ctx.data.earthSensors ? 'on' : '')}${btn('sa-menu', ctx.t('More options'), 'overflow')}</header>`;
  }
  function earth(ctx) {
    return `<div class="app-view sa-app sa-earth"><div class="sa-stars"></div><div class="sa-globe">${'<svg viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="sa-gl" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#6fb4ff"/><stop offset=".55" stop-color="#1c5fb8"/><stop offset="1" stop-color="#05173d"/></radialGradient><clipPath id="sa-gc"><circle cx="100" cy="100" r="92"/></clipPath></defs><circle cx="100" cy="100" r="96" fill="#6fb4ff" opacity=".18"/><circle cx="100" cy="100" r="92" fill="url(#sa-gl)"/><g clip-path="url(#sa-gc)"><g class="sa-land" fill="#4f8f3e"><path d="M10 60c20-14 44-10 52 4s-8 26-2 40-20 30-36 22-26-48-14-66z"/><path d="M90 96c16-6 38 2 44 22s-8 40-26 46-24-12-18-30-16-30 0-38z"/><path d="M80 24c12-4 28 2 30 12s-16 10-24 6-18-16-6-18z"/><path d="M210 60c20-14 44-10 52 4s-8 26-2 40-20 30-36 22-26-48-14-66z"/><path d="M290 96c16-6 38 2 44 22s-8 40-26 46-24-12-18-30-16-30 0-38z"/><path d="M280 24c12-4 28 2 30 12s-16 10-24 6-18-16-6-18z"/></g><g fill="#fff" opacity=".55"><ellipse cx="60" cy="140" rx="30" ry="6"/><ellipse cx="140" cy="60" rx="24" ry="5"/></g></g><circle cx="100" cy="100" r="92" fill="none" stroke="#9cd0ff" stroke-opacity=".5" stroke-width="2"/></svg>'}</div>${earthBar(ctx)}</div>`;
  }

  // ---- News & Weather (2013, Holo dark): Weather, Top Stories and topics ----
  const STORIES = {
    'Top Stories': [['Android 4.3 rolls out to Nexus devices', 'Tech Daily', '2 hours ago'], ['City marathon draws record crowd', 'Metro News', '4 hours ago'], ['Researchers map the ocean floor in 3D', 'Science Today', '6 hours ago']],
    'Technology': [['New Nexus 7 arrives with a 1080p screen', 'Gadget Weekly', '1 hour ago'], ['Smart watches: the next big thing?', 'Droid Corner', '3 hours ago']],
    'Sports': [['Underdogs win the cup final', 'Sports Desk', '5 hours ago']]
  };
  // News & Weather 1.3.11 (GenieWidget.apk, JWR66Y): the ActionBar style (#222222, ic_launcher_news_weather) with
  // main_menu.xml (Refresh in the bar, Settings in the overflow); tab_view_container_layout.xml's 52 dp tabs (12 sp,
  // 35 dp padding, #222222, a 6 dp #33b5e5 bottom when selected, 1 dp #505050 otherwise, 1 dp #505050 separators);
  // news_item_layout.xml rows (80 dp, 16 sp bold white title, 14 sp #bfbfbf snippet, the 70 dp picture on the right)
  // on #1a1a1a; weather_current_view.xml in bg_weather_panel_app: the city (30 sp) with the info button, today's
  // ic_weather_*_xl (90 dp) and temperature (80 sp), high / low (21 sp), conditions, humidity and wind (12 sp), The
  // Weather Channel's logo, then weather_forecast_layout.xml's days (15 sp, 30 dp icons).
  function news(ctx) {
    const n = key => S(ctx, 'news', key), tabs = ['Weather', 'Top Stories', 'Technology', 'Sports'], tab = ctx.ui.newsTab || 'Top Stories';
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], forecast = [[21, 13, 'partly_cloudy'], [23, 14, 'sunny'], [19, 12, 'cloudy'], [20, 11, 'chance_of_rain']];
    const body = tab === 'Weather'
      ? `<div class="nw-weather"><div class="nw-city"><b>Mountain View</b><button data-action="sa-unsupported" aria-label="Info"><img src="assets/nw-weather_info_btn.png" alt=""></button></div><i class="nw-divider"></i><div class="nw-today"><img class="nw-twc" src="assets/nw-ic_weather_weather_channel.png" alt="The Weather Channel"><div class="nw-now"><img src="assets/nw-ic_weather_partly_cloudy_xl.png" alt=""><b>21°</b></div><div class="nw-range"><span>21°</span><span class="lo">13°</span><p>${e(ctx.t('Partly cloudy'))}</p><small>${e(n('Humidity: %s%%').replace('%s%%', '60%'))}</small><small>${e(n('Wind: %1$s %2$s').replace('%1$s', '13').replace('%2$s', n('km/h')))}</small></div></div><i class="nw-divider"></i><div class="nw-forecast">${forecast.map(([hi, lo, icon], i) => `<div><span>${e(n(DAYS[new Date(ctx.now.getTime() + i * 864e5).getDay()]))}</span><img src="assets/nw-ic_weather_${icon}_s.png" alt=""><b>${hi}°</b><small>${lo}°</small></div>`).join('')}</div></div>`
      : `<div class="nw-list">${(STORIES[tab] || []).map(([title, source, time], i) => `<button class="nw-item${i === 0 ? ' pic' : ''}" data-action="sa-unsupported"><span><b>${e(title)}</b><small>${e(source)} - ${e(ctx.t(time))}</small></span>${i === 0 ? `<span class="nw-pic">${thumb(i + 2)}</span>` : ''}</button>`).join('')}</div>`;
    return `<div class="app-view sa-app sa-news">${bar(ctx, {title: n('News & Weather'), icon: 'news-weather.png', cls: ' dark', actions: img('sa-news-refresh', n('Refresh'), 'nw-navigation_refresh.png') + btn('sa-menu', ctx.t('More options'), 'overflow')})}<nav class="nw-tabs">${tabs.map(id => `<button class="${id === tab ? 'on' : ''}" data-action="news-tab" data-id="${id}">${e(id === 'Weather' ? n('Weather') : ctx.t(id))}</button>`).join('')}</nav><div class="sa-scroll">${body}</div></div>`;
  }


  const APPS = {'google-search': (ctx) => ctx.ui.sub === 'settings' ? searchSettings(ctx) : google(ctx), 'voice-search': voice, maps, drive, keep, youtube, 'google-plus': gplus, earth, 'news-weather': news, 'google-settings': googleSettings, 'google-search-settings': searchSettings};
  function render(app, ctx) { return (APPS[app] || google)(ctx); }
  const SIMPLE = ['google-search', 'voice-search', 'maps', 'keep', 'youtube', 'google-plus', 'earth', 'news-weather', 'google-settings'];
  const DEFAULT_NOTES = [{id: 'k1', text: 'Buy concert tickets', color: 0}, {id: 'k2', text: 'Groceries: milk, eggs, jelly beans', color: 1}, {id: 'k3', text: 'Call Mom on Sunday', color: 2}];
  // The overflow of the screen on show. GenieWidget 1.3.11 (JWR66Y) res/menu/main_menu.xml: Refresh (navigation_refresh) always in the bar, Settings in the overflow.
  function menu(view, ctx) {
    // Google Search 2.5.9: the footer's menu button (settings.xml, settings_menu.xml).
    if (view === 'google-search' && ctx.ui?.sub !== 'settings') { const g = key => S(ctx, 'google', key); return [{action: 'gel-overview-settings', title: g('Settings')}, {action: 'sa-unsupported', title: g('Send feedback')}, {action: 'sa-unsupported', title: g('Help')}]; }
    if (view === 'earth') { const ea = key => S(ctx, 'earth', key); return ['Clear map', 'Share', 'Settings', 'Feedback', 'Help', 'Tutorial', 'Fly to'].map(key => ({action: 'sa-unsupported', title: ea(key)})); }
    if (view === 'google-plus') { const g = key => S(ctx, 'gplus', key); return ['New post', 'Share photos', 'Share your location', 'Refresh', 'Send feedback', 'Settings', 'Help', 'Sign out'].map(key => ({action: key === 'Refresh' ? 'gplus-refresh' : 'sa-unsupported', title: g(key)})); }
    if (view === 'maps') {
      const mp = key => S(ctx, 'maps', key);
      if (ctx.ui?.mapsMenu === 'switcher') return [{action: 'maps-feature', id: 'map', title: mp('Map')}, {action: 'maps-feature', id: 'local', title: `${mp('Local')} — ${mp('Find restaurants, bars & more')}`}, {action: 'maps-feature', id: 'navigation', title: mp('GPS navigation')}, {action: 'maps-feature', id: 'traffic', title: mp('Traffic')}];
      if (ctx.ui?.mapsMenu === 'layers') return [['traffic', 'Traffic'], ['satellite', 'Satellite'], ['terrain', 'Terrain'], ['bicycling', 'Bicycling']].map(([id, key]) => ({action: 'maps-layer', id, title: mp(key)})).concat([{action: 'maps-layer', id: '', title: mp('Clear map')}]);
      return [{action: 'maps-clear', title: mp('Clear map')}, {action: 'sa-unsupported', title: mp('My Places')}, {action: 'sa-unsupported', title: mp('Settings')}, {action: 'sa-unsupported', title: mp('Help')}];
    }
    if (view === 'youtube') { const y = key => S(ctx, 'youtube', key); return ctx.ui?.sub === 'video' ? [{action: 'yt-like', title: y('Like')}, {action: 'sa-unsupported', title: y('Dislike')}, {action: 'sa-unsupported', title: y('Copy URL')}, {action: 'sa-unsupported', title: y('Flag')}] : [{action: 'sa-unsupported', title: y('Settings')}, {action: 'sa-unsupported', title: y('Feedback')}, {action: 'sa-unsupported', title: y('Help')}]; }
    if (view === 'keep' && ctx.ui?.sub !== 'note') { const k = key => S(ctx, 'keep', key); return [{action: 'keep-columns', title: k(ctx.data?.keepSingle ? 'Multi-column view' : 'Single-column view')}, {action: 'keep-refresh', title: k('Refresh')}, {action: 'keep-archived', title: k('Archived notes')}, {action: 'sa-unsupported', title: k('Settings')}, {action: 'sa-unsupported', title: k('Send feedback')}, {action: 'sa-unsupported', title: k('Help')}]; }
    if (view === 'keep') { const k = key => S(ctx, 'keep', key), note = (ctx.data?.keepNotes || []).find(n => n.id === ctx.ui.keepNote); return [{action: 'keep-archive', title: k(note?.archived ? 'Unarchive' : 'Archive')}, {action: 'keep-delete', title: k('Delete')}, {action: 'sa-unsupported', title: k('Show checkboxes')}, {action: 'sa-unsupported', title: k('Share')}, {action: 'sa-unsupported', title: k('Settings')}, {action: 'sa-unsupported', title: k('Send feedback')}, {action: 'sa-unsupported', title: k('Help')}]; }
    if (view === 'news-weather') return [{action: 'sa-unsupported', title: S(ctx, 'news', 'Settings')}];
    return [];
  }
  window.StockApps = {APPS: SIMPLE, FILES, VIDEOS, POSTS, DEFAULT_NOTES, render, menu};
})();
