/* The other Google apps of the Nexus 6 factory image (LMY48Y): Maps 9.3, Drive 2.1, Keep 3.0, YouTube 10.03,
   Google+ 4.9, Earth, News & Weather, the Google app and Google Settings. Each has a simple screen: Google opens Google
   Now, Voice Search listens, Maps shows a drawn map with the floating search box, Drive lists My Drive, Keep keeps
   notes, YouTube has What to Watch and a player, Google+ a Home stream, Earth a turning globe, News & Weather its tabs,
   and Google Settings / Search settings their lists. All content is offline and made up. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // News & Weather 2.2's overflow texts, as LMY48Y's PrebuiltNewsWeather.apk translates them.
  window.AndroidI18n?.extend([
    ['Add section', 'Panel hozzáadása', 'Abschnitt hinzufügen', 'Ajouter une section', 'Añadir sección'],
    ['Edit weather display…', 'Időjárásinformáció-módosítás…', 'Wetteranzeige bearbeiten…', "Modifier l'affichage météo…", 'Editar pantalla de tiempo…'],
    ['Remove this section', 'A szakasz eltávolítása', 'Diesen Abschnitt entfernen', 'Supprimer cette section', 'Eliminar esta sección'],
    ['Migrate settings', 'Beállítások áttelepítése', 'Einstellungen migrieren', 'Transférer les paramètres', 'Migrar ajustes']
  ]);
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
    return `<header class="sa-bar${cls}"><button class="sa-up" data-action="${up ? 'back' : 'home'}" aria-label="${e(ctx.t(up ? 'Back' : 'Home'))}">${up ? `<img class="sa-caret" src="assets/${/dark/.test(cls) ? 'lp-fw-ic_ab_back_material-dark.svg' : 'lp-fw-ic_ab_back_material.svg'}" alt="">` : ''}<img src="assets/${icon}" alt=""></button><span class="sa-title"><b>${e(title)}</b>${subtitle ? `<small>${e(subtitle)}</small>` : ''}</span>${actions}</header>`;
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
  // Google Settings (Google Play services 6.7.79, LMY48Y): common.Theme.GoogleSettings is AppCompat Light with a dark
  // action bar in blue grey 900 (#263238) and a teal 500 (#009688) accent. GoogleSettingsActivity builds two categories
  // (common_settings_category.xml: Body2 in the accent): Account with Google+ and Account History (the UDC flag defaults
  // on), and Services with Ads, Connected apps, Google Fit, Play Games, Data management, Search & Now and Security;
  // Location joins Services once the reporting service connects. Maps 9.3 no longer offers Maps & Latitude. Rows are
  // common_settings_item.xml: Subhead (16 sp, 87% black), 48 dp minimum, 16 dp padding.
  function googleSettings(ctx) {
    const g = key => S(ctx, 'gsettings', key);
    const cat = key => `<h4 class="gs6-cat">${e(g(key))}</h4>`;
    const row = (key, action = 'sa-unsupported') => `<button class="gs6-row" data-action="${action}">${e(g(key))}</button>`;
    return `<div class="app-view sa-app sa-gsettings6"><header class="gs6-bar"><b>${e(g('Google Settings'))}</b></header><div class="sa-scroll">${cat('Account')}${row('Google+')}${row('Account History')}${cat('Services')}${['Ads', 'Connected apps', 'Google Fit', 'Play Games', 'Data management'].map(key => row(key)).join('')}${row('Search & Now', 'gel-overview-settings')}${row('Security')}${row('Location')}</div></div>`;
  }


  // ---- Maps: a full-screen map, the floating search card, my location ----
  function mapSvg(ctx) {
    const pin = ctx.ui.mapsQuery ? '<g transform="translate(222 190)"><path d="M0-34a14 14 0 0 0-14 14c0 11 14 26 14 26s14-15 14-26A14 14 0 0 0 0-34z" fill="#db4437"/><circle cy="-20" r="5" fill="#fff"/></g>' : '';
    return `<svg class="sa-map" viewBox="0 0 360 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="360" height="600" fill="#ece8df"/><path d="M-10 430c80-20 120 10 200-10s140-60 180-50v240H-10z" fill="#a9cdee"/><rect x="30" y="80" width="110" height="90" fill="#cde5b4"/><rect x="230" y="300" width="90" height="70" fill="#cde5b4"/><g stroke="#fff" stroke-width="7" fill="none"><path d="M-10 200H370M-10 330H370M90 -10V620M260 -10V620"/></g><g stroke="#f7d36b" stroke-width="10" fill="none"><path d="M-10 260C80 250 140 280 200 240S320 200 370 210"/><path d="M180 -10C170 120 200 200 190 300S160 460 170 620"/></g><g stroke="#fff" stroke-width="3" fill="none"><path d="M-10 120H370M-10 380H370M40 -10V620M150 -10V620M320 -10V620"/></g><text x="50" y="130" font-family="Arial" font-size="12" fill="#5b8a46">${e(ctx.t('City Park'))}</text><text x="210" y="470" font-family="Arial" font-size="12" fill="#4a77a8" font-style="italic">${e(ctx.t('Bay'))}</text>${pin}<circle cx="180" cy="300" r="22" fill="#4285f4" opacity=".18"/><circle cx="180" cy="300" r="8" fill="#4285f4" stroke="#fff" stroke-width="3"/></svg>`;
  }
  // Maps 9.3.0 (LMY48Y): base_main_internal.xml (v17). The search box is built in code on omnibox.9 (ic_qu_menu_grabber,
  // "Search", ic_qu_mic); the my-location button and the directions FAB (ic_qu_fab_circle in Google blue 500 #4285f4
  // with ic_qu_directions and ic_qu_fab_shadow) sit at the bottom right, the "Google" watermark at the bottom left. The
  // grabber opens layers_menu_container.xml from the left (white, the account switcher, then layers_menu_internal.xml):
  // Your places; Traffic, Public transit, Bicycling, Satellite, Terrain (48 dp, 16 sp, #33b5e5 when on); Google Earth;
  // Settings, Help and Send feedback (72 dp) between menu dividers.
  function maps(ctx) {
    const q = ctx.ui.mapsQuery || '', mp = key => S(ctx, 'maps', key), layer = ctx.data.mapsLayer || '';
    const toggle = (id, key, icon) => `<button class="mp9-layer${layer === id ? ' on' : ''}" data-action="maps-layer" data-id="${id}"><img src="assets/mp9-ic_layers_${icon}.png" alt="">${e(mp(key))}</button>`;
    const panel = ctx.ui.mapsPanel ? `<button class="mp9-scrim" data-action="maps-panel" aria-label="${e(mp('Menu'))}"></button><nav class="mp9-menu"><div class="mp9-account"><b>Nexus 6</b><small>nexus6.demo@gmail.com</small></div><button class="mp9-layer mp9-places" data-action="sa-unsupported"><img src="assets/mp9-ic_layers_places.png" alt="">${e(mp('Your places'))}</button><hr><i class="mp9-gap"></i>${toggle('traffic', 'Traffic', 'traffic')}${toggle('transit', 'Public transit', 'transit')}${toggle('bicycling', 'Bicycling', 'bicycling')}${toggle('satellite', 'Satellite', 'satellite')}${toggle('terrain', 'Terrain', 'terrain')}<button class="mp9-layer" data-action="open-app" data-app="earth"><img src="assets/mp9-ic_layers_google_earth.png" alt="">${e(mp('Google Earth'))}<img class="mp9-shortcut" src="assets/mp9-ic_layers_google_earth_shortcut.png" alt=""></button><hr>${['Settings', 'Help', 'Send feedback'].map(key => `<button class="mp9-item" data-action="sa-unsupported">${e(mp(key))}</button><hr>`).join('')}</nav>` : '';
    return `<div class="app-view sa-app sa-maps sa-maps9"><div class="mp9-map${layer ? ' layer-' + layer : ''}">${mapSvg(ctx)}</div><form class="mp9-search" data-form="maps-search"><button type="button" data-action="maps-panel" aria-label="${e(mp('Menu'))}"><img src="assets/mp9-ic_qu_menu_grabber.png" alt=""></button><input name="query" autocomplete="off" placeholder="${e(mp('Search'))}" aria-label="${e(mp('Search'))}" value="${e(q)}"><button type="button" data-action="sa-unsupported" aria-label="${e(mp('Search'))}"><img src="assets/mp9-ic_qu_mic.png" alt=""></button></form><img class="mp9-watermark" src="assets/mp9-watermark_dark.png" alt="Google"><button class="mp9-locate" data-action="maps-locate" aria-label="${e(mp('Move to your location'))}"><img src="assets/mp9-ic_qu_direction_mylocation.png" alt=""></button><button class="mp9-fab" data-action="sa-unsupported" aria-label="${e(mp('Directions'))}"><img class="mp9-shadow" src="assets/mp9-ic_qu_fab_shadow.png" alt=""><i></i><img class="mp9-dir" src="assets/mp9-ic_qu_directions.png" alt=""></button>${q ? `<div class="sa-maps-card"><b>${e(q)}</b><small>${e(ctx.t('0.8 mi · 4 min drive'))}</small></div>` : ''}${panel}</div>`;
  }


  // ---- Drive: My Drive ----
  const FILES = [
    {id: 'f0', name: 'Photos', kind: 'folder', date: 'Oct 28'}, {id: 'f1', name: 'Trip plan 2015', kind: 'doc', date: 'Nov 2', text: 'Day 1 — arrive in Lisbon, tram 28 to Alfama.\nDay 2 — Belém, pastéis de nata.\nDay 3 — Sintra by train.'},
    {id: 'f2', name: 'Budget', kind: 'sheet', date: 'Oct 30', text: 'Rent 850\nGroceries 240\nTransport 60\nFun 120'}, {id: 'f3', name: 'Nexus 6 guide', kind: 'pdf', date: 'Oct 31', text: 'Welcome to Nexus 5. Swipe left from the Home screen to see Google Now.'},
    {id: 'f4', name: 'Meetup slides', kind: 'slides', date: 'Sep 12', text: 'What’s new in Lollipop\n• Material design\n• Heads-up notifications\n• Smart Lock\n• Overview'}
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

  // ---- Keep: the quick note bar and coloured cards; notes are kept in data.keepNotes ----
  const KEEP_COLORS = ['#fff', '#f7f0a3', '#c6e5f5', '#c9f0b9', '#f8c8c0'];
  // Keep 3.0.03 (LMY48Y). KeepAppTheme: colorPrimary #ffcc3f, colorPrimaryDark #e59900, window #e6e6e6. The browse
  // Toolbar has the drawer toggle and Search (always; ic_material_search_light), the overflow holds the column switch and
  // Refresh. quick_edit.xml is a floating toolbar right under the bar ("Add quick note", then add_items_bar.xml's New
  // note / New list / New recording / New photo note); notes are browse_index_text_note.xml on note_shadow. DrawerFragment
  // (dex): Notes, Reminders, Archive and Trash (56 dp, black icons, 14 sp #de000000 32 dp after them), then the
  // Help & feedback link (44 dp, bold). editor_menu.xml: Share, Change color, Add picture and Archive are "always", Delete
  // note and the rest go to the overflow.
  function keep(ctx) {
    const notes = ctx.data.keepNotes || [], k = key => S(ctx, 'keep', key), view = ctx.ui.keepView || 'notes';
    const bar3 = (title, actions, up) => `<header class="kp3-bar">${up ? `<button class="kp3-up" data-action="back" aria-label="${e(ctx.t('Back'))}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20z" fill="#fff"/></svg></button>` : `<button class="kp3-toggle" data-action="keep-drawer" aria-label="${e(k('Open navigation drawer'))}"><i></i><i></i><i></i></button>`}<b>${e(title)}</b>${actions}</header>`;
    const more = `<button class="sa-btn kp3-more" data-action="sa-menu" aria-label="${e(ctx.t('More options'))}"><i></i><i></i><i></i></button>`;
    if (ctx.ui.sub === 'note') {
      const note = notes.find(n => n.id === ctx.ui.keepNote);
      if (note) return `<div class="app-view sa-app sa-keep sa-keep3">${bar3('', img('sa-unsupported', k('Share'), 'kp3-ic_material_sharing_addperson_light.png') + img('keep-color', k('Change color'), 'kp3-ic_material_color_light.png') + img('sa-unsupported', k('Add picture'), 'kp3-ic_material_camera_light.png') + img('keep-archive', k(note.archived ? 'Unarchive' : 'Archive'), note.archived ? 'kp3-ic_material_unarchive_light.png' : 'kp3-ic_material_archive_light.png') + more, true)}<div class="sa-keep-edit" style="background:${KEEP_COLORS[note.color || 0]}"><textarea class="keep-text" maxlength="2000" aria-label="${e(k('New note'))}">${e(note.text)}</textarea></div></div>`;
    }
    const shown = view === 'reminders' || view === 'trash' ? [] : notes.filter(n => !!n.archived === (view === 'archive')), single = ctx.data.keepSingle;
    const add = (action, key, src) => `<button type="button" class="kp3-new" data-action="${action}" aria-label="${e(k(key))}"><img src="assets/kp3-${src}.png" alt=""></button>`;
    const quick = view === 'notes' ? `<form class="kp3-quick" data-form="keep-add"><input name="text" maxlength="500" autocomplete="off" placeholder="${e(k('Add quick note'))}" aria-label="${e(k('Add quick note'))}"><i></i><div class="kp3-items">${add('keep-new', 'New note', 'ic_material_note_dark')}${add('sa-unsupported', 'New list', 'ic_material_list_dark')}${add('sa-unsupported', 'New recording', 'ic_material_mic_dark')}${add('sa-unsupported', 'New photo note', 'ic_material_camera_dark')}</div></form>` : '';
    const items = [['notes', 'Notes', 'lightbulb'], ['reminders', 'Reminders', 'reminder_finger'], ['archive', 'Archive', 'archive'], ['trash', 'Trash', 'trash']];
    const title = view === 'notes' ? k('Keep') : k(items.find(([id]) => id === view)[1]);
    const empty = {notes: 'Add quick note', reminders: 'Notes with upcoming reminders appear here', archive: 'Your archived notes appear here', trash: 'No notes in Trash'}[view];
    const drawer = ctx.ui.keepDrawer ? `<button class="kp3-scrim" data-action="keep-drawer" aria-label="${e(ctx.t('Close'))}"></button><nav class="kp3-drawer"><div class="kp3-account"><b>Nexus 6</b><small>nexus6.demo@gmail.com</small></div>${items.map(([id, key, icon]) => `<button class="${view === id ? 'on' : ''}" data-action="keep-landing" data-id="${id}"><img src="assets/kp3-ic_material_${icon}_black.png" alt="">${e(k(key))}</button>`).join('')}<button class="kp3-help" data-action="sa-unsupported"><img src="assets/kp3-ic_material_feedback_black.png" alt="">${e(k('Help & feedback'))}</button></nav>` : '';
    return `<div class="app-view sa-app sa-keep sa-keep3">${bar3(title, img('sa-unsupported', k('Search'), 'kp3-ic_material_search_light.png') + more)}<div class="sa-scroll">${quick}<div class="sa-notes${single ? ' single' : ''}">${shown.map(n => `<button class="sa-note" data-action="keep-open" data-id="${e(n.id)}" style="--note:${KEEP_COLORS[n.color || 0]}">${e(n.text)}</button>`).join('') || (view === 'notes' ? '' : `<p class="kp3-empty">${e(k(empty))}</p>`)}</div></div>${drawer}</div>`;
  }


  // ---- YouTube: What to Watch and a player ----
  const VIDEOS = [
    {id: 'v1', title: 'Nexus 6 — hands-on and first impressions', channel: 'Gadget Weekly', views: '1,204,311', len: '8:42', likes: 9120},
    {id: 'v2', title: 'Lollipop: 10 tips for Android 5.1', channel: 'Droid Corner', views: '486,020', len: '6:15', likes: 4310},
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

  // ---- Google+: the Home stream ----
  const POSTS = [
    {id: 'p1', name: 'Alex Morgan', time: '2h', text: 'Finally got the Nexus 6. That screen is huge — and the camera is great!', photo: 1, plus: 12},
    {id: 'p2', name: 'Android', time: '5h', text: 'Android 5.1, Lollipop: Material design, heads-up notifications and more.', photo: 4, plus: 2381},
    {id: 'p3', name: 'Taylor Lee', time: 'Yesterday', text: 'Slides from the meetup are up on Drive. Thanks everyone for coming!', photo: null, plus: 7}
  ];
  function gplus(ctx) {
    const plused = ctx.data.gplusPlus || [];
    return `<div class="app-view sa-app sa-gplus">${bar(ctx, {title: ctx.t('Home'), subtitle: ctx.t('All'), icon: 'google-plus.png', actions: btn('sa-unsupported', ctx.t('Search'), 'search') + btn('sa-unsupported', ctx.t('More options'), 'overflow')})}<div class="sa-scroll sa-stream">${POSTS.map((p, i) => `<article class="sa-post">${avatar(p.name, i)}<div class="sa-post-head"><b>${e(p.name)}</b><small>${e(ctx.t(p.time))}</small></div><p>${e(p.text)}</p>${p.photo !== null ? `<div class="sa-post-photo">${thumb(p.photo)}</div>` : ''}<footer><button class="sa-plus${plused.includes(p.id) ? ' on' : ''}" data-action="gplus-plus" data-id="${p.id}">+1 <span>${p.plus + (plused.includes(p.id) ? 1 : 0)}</span></button><button data-action="sa-unsupported">${ICON.share}</button></footer></article>`).join('')}</div></div>`;
  }

  // ---- Earth: the globe in space under a translucent search bar ----
  // Earth 8.0.1 (LMY48Y): common.xml puts an AppCompat Toolbar on actionbar_gradient (#cc000000 fading to transparent)
  // over the globe, with the drawer toggle and the app name. menu/main.xml: Search (always, Earth's SearchView with
  // "Example: Pizza"), Clear map (ifRoom|withText, only once there is something to clear), My location and Share
  // (ifRoom); with AppCompat's three slots at 411 dp all three visible items fit, and after a search Clear map takes the
  // free slot and My location / Share move to the overflow. The compass (button_compass, ic_compass) sits under the bar
  // on the right, Pegman 4 dp from the left below it. main.xml's drawer (300 dp, white): the account switcher (147 dp; the cover photo comes from the account, so only the black
  // scrim and avatar_placeholder are drawn), then fm's adapters,
  // Maps Gallery and Google+ Photos, Layers, then Settings, Feedback, Help and Tutorial.
  function earth(ctx) {
    const ea = key => S(ctx, 'earth', key), q = ctx.ui.earthQuery;
    const search = ctx.ui.earthSearching ? `<form class="ea8-field" data-form="earth-search"><input name="query" autocomplete="off" placeholder="${e(ea('Example: Pizza'))}" aria-label="${e(ea('Search'))}"></form>` : img('earth-search-open', ea('Search'), 'ea8-ic_menu_search.png');
    const actions = q ? img('earth-clear', ea('Clear map'), 'ea8-ic_menu_clear_map.png', 'wide') + btn('sa-menu', ctx.t('More options'), 'overflow') : img('sa-unsupported', ea('My location'), 'ea8-ic_menu_mylocation.png') + img('sa-unsupported', ea('Share'), 'ea8-ic_share_alt_white_24dp.png');
    const drawer = ctx.ui.earthDrawer ? `<button class="ea8-scrim" data-action="earth-drawer" aria-label="${e(ctx.t('Close'))}"></button><nav class="ea8-drawer"><div class="ea8-account"><img src="assets/ea8-avatar_placeholder.png" alt=""><b>Nexus 6</b><small>nexus6.demo@gmail.com</small></div>${['Maps Gallery', 'Google+ Photos', 'Layers'].map(key => `<button data-action="sa-unsupported">${e(ea(key))}</button>`).join('')}<hr>${['Settings', 'Feedback', 'Help', 'Tutorial'].map(key => `<button data-action="sa-unsupported">${e(ea(key))}</button>`).join('')}</nav>` : '';
    return `<div class="app-view sa-app sa-earth sa-earth8"><div class="sa-stars"></div><div class="sa-globe">${'<svg viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="sa-gl" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#6fb4ff"/><stop offset=".55" stop-color="#1c5fb8"/><stop offset="1" stop-color="#05173d"/></radialGradient><clipPath id="sa-gc"><circle cx="100" cy="100" r="92"/></clipPath></defs><circle cx="100" cy="100" r="96" fill="#6fb4ff" opacity=".18"/><circle cx="100" cy="100" r="92" fill="url(#sa-gl)"/><g clip-path="url(#sa-gc)"><g class="sa-land" fill="#4f8f3e"><path d="M10 60c20-14 44-10 52 4s-8 26-2 40-20 30-36 22-26-48-14-66z"/><path d="M90 96c16-6 38 2 44 22s-8 40-26 46-24-12-18-30-16-30 0-38z"/><path d="M80 24c12-4 28 2 30 12s-16 10-24 6-18-16-6-18z"/><path d="M210 60c20-14 44-10 52 4s-8 26-2 40-20 30-36 22-26-48-14-66z"/><path d="M290 96c16-6 38 2 44 22s-8 40-26 46-24-12-18-30-16-30 0-38z"/><path d="M280 24c12-4 28 2 30 12s-16 10-24 6-18-16-6-18z"/></g><g fill="#fff" opacity=".55"><ellipse cx="60" cy="140" rx="30" ry="6"/><ellipse cx="140" cy="60" rx="24" ry="5"/></g></g><circle cx="100" cy="100" r="92" fill="none" stroke="#9cd0ff" stroke-opacity=".5" stroke-width="2"/></svg>'}</div><header class="ea8-bar"><button class="ea8-toggle" data-action="earth-drawer" aria-label="${e(ea('Layers'))}"><i></i><i></i><i></i></button><b>${ctx.ui.earthSearching ? '' : e(q || ea('Earth'))}</b>${search}${actions}</header><div class="ea8-compass"><img src="assets/ea8-button_compass.png" alt=""><img src="assets/ea8-ic_compass.png" alt=""></div><img class="ea8-pegman" src="assets/ea8-pegman.png" alt="${e(ea('Street View'))}">${drawer}</div>`;
  }


  // ---- News & Weather (Holo dark): Weather, Top Stories and topics ----
  const STORIES = {
    'Top Stories': [['Android 5.1.1 security update rolls out to Nexus devices', 'Tech Daily', '2 hours ago'], ['City marathon draws record crowd', 'Metro News', '4 hours ago'], ['Researchers map the ocean floor in 3D', 'Science Today', '6 hours ago']],
    'Technology': [['Material design comes to more of your apps', 'Gadget Weekly', '1 hour ago'], ['Smart watches: the next big thing?', 'Droid Corner', '3 hours ago']],
    'Sports': [['Underdogs win the cup final', 'Sports Desk', '5 hours ago']]
  };
  // News & Weather 2.2 (LMY48Y). AppThemeLight: the Toolbar takes colorPrimary = the window background #f5f5f5 with
  // 4 dp elevation, status bar #9e9e9e, accent #3367d6, text #de000000 / #8d000000. news_activity.xml's menu: Search and
  // Add section (ifRoom) beside the overflow (Refresh, Edit weather display, Change editions, Manage sections, Switch to
  // dark theme). Each section is a card (card_background_*_light): item_section_header.xml (24 sp secondary, the
  // ic_more_horiz button) over item_story_collapsed.xml rows (80 dp photo, 16 sp title, 14 sp source) and the "More stories
  // from …" footer. Headlines starts with item_weather.xml: the condition picture (loaded from the web, so a stand-in),
  // the temperature, and the Temp. / Precip. / Wind / Humidity tabs. The drawer (300 dp) lists the sections, then "Add
  // and remove sections…" and "Help & feedback".
  function news(ctx) {
    const n = key => S(ctx, 'news', key), sections = ['Headlines', 'Technology', 'Sports'], sec = sections.includes(ctx.ui.newsTab) ? ctx.ui.newsTab : 'Headlines';
    const label = id => id === 'Headlines' ? n('Headlines') : ctx.t(id);
    const stories = id => (id === 'Headlines' ? STORIES['Top Stories'] : STORIES[id]) || [];
    const chart = ctx.ui.newsChart || 'Temp.', temps = [17, 19, 21, 22, 21, 19, 17, 15];
    const bars = chart === 'Temp.' ? temps : chart === 'Precip.' ? [0, 0, 10, 20, 10, 0, 0, 0] : chart === 'Wind' ? [8, 10, 13, 15, 14, 11, 9, 8] : [72, 66, 60, 55, 54, 58, 64, 70];
    const weather = sec === 'Headlines' ? `<section class="nw2-card nw2-weather"><div class="nw2-now"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="9" r="4" fill="#fbc02d"/><path d="M7 19h11a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.4 1.6A3.3 3.3 0 0 0 7 19z" fill="#cfd8dc"/></svg><b>21°</b><span><em>${e(n('Partly Cloudy'))}</em><small>${e(n('Precipitation: %1$s%%').replace('%1$s%%', '10%'))}</small><small>${e(n('Humidity: %1$s%%').replace('%1$s%%', '60%'))}</small></span></div><nav class="nw2-tabs">${['Temp.', 'Precip.', 'Wind', 'Humidity'].map(t => `<button class="${t === chart ? 'on' : ''}" data-action="news-chart" data-id="${t}">${e(n(t))}</button>`).join('')}</nav><div class="nw2-chart">${bars.map((v, j) => `<i style="height:${Math.max(4, Math.round(v / Math.max(...bars) * 100))}%"><b>${chart === 'Precip.' || chart === 'Humidity' ? v + '%' : v + (chart === 'Wind' ? '' : '°')}</b></i>`).join('')}</div></section>` : '';
    const card = `<section class="nw2-card"><header class="nw2-head"><h3>${e(label(sec))}</h3><button data-action="sa-unsupported" aria-label="${e(n('Section header menu button'))}"><img src="assets/nw2-ic_more_horiz_white_18dp.png" alt=""></button></header>${stories(sec).map(([title, source, time], j) => `<button class="nw2-story" data-action="sa-unsupported"><span class="nw2-photo">${thumb(j + 2)}</span><span><b>${e(title)}</b><small>${e(source)} · ${e(ctx.t(time))}</small></span></button>`).join('')}<button class="nw2-more" data-action="sa-unsupported">${e(n('More stories from %1$s').replace('%1$s', label(sec)))}</button></section>`;
    const drawer = ctx.ui.newsDrawer ? `<button class="nw2-scrim" data-action="news-drawer" aria-label="${e(ctx.t('Close'))}"></button><nav class="nw2-drawer"><div class="nw2-account"><b>Nexus 6</b><small>nexus6.demo@gmail.com</small></div>${sections.map(id => `<button class="${id === sec ? 'on' : ''}" data-action="news-tab" data-id="${id}">${e(label(id))}</button>`).join('')}<hr><button data-action="sa-unsupported">${e(n('Add and remove sections…'))}</button><button data-action="sa-unsupported">${e(n('Help & feedback'))}</button></nav>` : '';
    return `<div class="app-view sa-app sa-news2"><header class="nw2-bar"><button class="nw2-toggle" data-action="news-drawer" aria-label="${e(n('Open navigation drawer'))}"><i></i><i></i><i></i></button><b>${e(label(sec))}</b>${img('sa-unsupported', n('Search'), 'nw2-abc_ic_search_api_mtrl_alpha.png')}${img('sa-unsupported', n('Add section'), 'nw2-ic_add_white_24dp.png')}<button class="sa-btn" data-action="sa-menu" aria-label="${e(ctx.t('More options'))}"><img src="assets/nw2-abc_ic_menu_moreoverflow_mtrl_alpha.png" alt=""></button></header><div class="sa-scroll nw2-page">${weather}${card}</div>${drawer}</div>`;
  }


  const APPS = {'google-search': (ctx) => ctx.ui.sub === 'settings' ? searchSettings(ctx) : google(ctx), 'voice-search': voice, maps, drive, keep, youtube, 'google-plus': gplus, earth, 'news-weather': news, 'google-settings': googleSettings, 'google-search-settings': searchSettings};
  function render(app, ctx) { return (APPS[app] || google)(ctx); }
  const SIMPLE = ['google-search', 'voice-search', 'maps', 'drive', 'keep', 'youtube', 'google-plus', 'earth', 'news-weather', 'google-settings'];
  const DEFAULT_NOTES = [{id: 'k1', text: 'Buy concert tickets', color: 0}, {id: 'k2', text: 'Groceries: milk, eggs, lollipops', color: 1}, {id: 'k3', text: 'Call Mom on Sunday', color: 2}];
  // The overflow of the screen on show. News & Weather 2.2 (LMY48Y) res/menu/news_activity.xml: Search (abc_ic_search_api_mtrl_alpha) and Add section (ic_add_white_24dp) if room; Refresh, Edit weather display…, Remove this section and Migrate settings in the overflow.
  function menu(view, ctx) {
    if (view === 'keep' && ctx.ui?.sub !== 'note') { const k = key => S(ctx, 'keep', key); return [{action: 'keep-columns', title: k(ctx.data?.keepSingle ? 'Multi-column view' : 'Single-column view')}, {action: 'keep-refresh', title: k('Refresh')}]; }
    if (view === 'keep') { const k = key => S(ctx, 'keep', key); return [{action: 'keep-delete', title: k('Delete note')}, {action: 'sa-unsupported', title: k('Make a copy')}, {action: 'sa-unsupported', title: k('Send')}, {action: 'sa-unsupported', title: k('Show checkboxes')}]; }
    if (view === 'news-weather') { const n = key => S(ctx, 'news', key); return ['Refresh', 'Edit weather display…', 'Change editions…', 'Manage sections…', 'Switch to dark theme'].map(key => ({action: key === 'Refresh' ? 'sa-news-refresh' : 'sa-unsupported', title: n(key)})); }
    if (view === 'earth') { const ea = key => S(ctx, 'earth', key); return ['My location', 'Share'].map(key => ({action: 'sa-unsupported', title: ea(key)})); }
    return [];
  }
  window.StockApps = {APPS: SIMPLE, FILES, VIDEOS, POSTS, DEFAULT_NOTES, render, menu};
})();
