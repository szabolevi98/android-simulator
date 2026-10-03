/* The other Google apps of the Nexus 6 factory image (LMY48Y): Maps 9.3, Drive 2.1, Keep 3.0, YouTube 10.03,
   Google+ 4.9, Earth, News & Weather, the Google app and Google Settings. Each has a simple screen: Google opens Google
   Now, Voice Search listens, Maps shows a drawn map with the floating search box, Drive lists My Drive, Keep keeps
   notes, YouTube has What to Watch and a player, Google+ a Home stream, Earth a turning globe, News & Weather its tabs,
   and Google Settings / Search settings their lists. All content is offline and made up. */
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
  function bar(ctx, {title, subtitle = '', up = false, icon, actions = '', cls = ''}) {
    return `<header class="sa-bar${cls}"><button class="sa-up" data-action="${up ? 'back' : 'home'}" aria-label="${e(ctx.t(up ? 'Back' : 'Home'))}"><span aria-hidden="true">‹</span><img src="assets/${icon}" alt=""></button><span class="sa-title"><b>${e(title)}</b>${subtitle ? `<small>${e(subtitle)}</small>` : ''}</span>${actions}</header>`;
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

  // ---- Maps: a full-screen map, the floating search card, my location ----
  function mapSvg(ctx) {
    const pin = ctx.ui.mapsQuery ? '<g transform="translate(222 190)"><path d="M0-34a14 14 0 0 0-14 14c0 11 14 26 14 26s14-15 14-26A14 14 0 0 0 0-34z" fill="#db4437"/><circle cy="-20" r="5" fill="#fff"/></g>' : '';
    return `<svg class="sa-map" viewBox="0 0 360 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="360" height="600" fill="#ece8df"/><path d="M-10 430c80-20 120 10 200-10s140-60 180-50v240H-10z" fill="#a9cdee"/><rect x="30" y="80" width="110" height="90" fill="#cde5b4"/><rect x="230" y="300" width="90" height="70" fill="#cde5b4"/><g stroke="#fff" stroke-width="7" fill="none"><path d="M-10 200H370M-10 330H370M90 -10V620M260 -10V620"/></g><g stroke="#f7d36b" stroke-width="10" fill="none"><path d="M-10 260C80 250 140 280 200 240S320 200 370 210"/><path d="M180 -10C170 120 200 200 190 300S160 460 170 620"/></g><g stroke="#fff" stroke-width="3" fill="none"><path d="M-10 120H370M-10 380H370M40 -10V620M150 -10V620M320 -10V620"/></g><text x="50" y="130" font-family="Arial" font-size="12" fill="#5b8a46">${e(ctx.t('City Park'))}</text><text x="210" y="470" font-family="Arial" font-size="12" fill="#4a77a8" font-style="italic">${e(ctx.t('Bay'))}</text>${pin}<circle cx="180" cy="300" r="22" fill="#4285f4" opacity=".18"/><circle cx="180" cy="300" r="8" fill="#4285f4" stroke="#fff" stroke-width="3"/></svg>`;
  }
  function maps(ctx) {
    const q = ctx.ui.mapsQuery || '';
    return `<div class="app-view sa-app sa-maps">${mapSvg(ctx)}<form class="sa-maps-search" data-form="maps-search"><img src="assets/maps.png" alt=""><input name="query" autocomplete="off" placeholder="${e(ctx.t('Search'))}" aria-label="${e(ctx.t('Search'))}" value="${e(q)}">${btn('sa-unsupported', ctx.t('Directions'), 'directions')}</form><button class="sa-maps-locate" data-action="maps-locate" aria-label="${e(ctx.t('My location'))}">${ICON.locate}</button>${q ? `<div class="sa-maps-card"><b>${e(q)}</b><small>${e(ctx.t('0.8 mi · 4 min drive'))}</small>${btn('sa-unsupported', ctx.t('Directions'), 'directions')}</div>` : ''}</div>`;
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
  function keep(ctx) {
    const notes = ctx.data.keepNotes || [];
    if (ctx.ui.sub === 'note') {
      const note = notes.find(n => n.id === ctx.ui.keepNote);
      if (note) return `<div class="app-view sa-app sa-keep">${bar(ctx, {title: ctx.t('Keep'), up: true, icon: 'keep.png', actions: btn('keep-delete', ctx.t('Delete'), 'trash') + btn('sa-unsupported', ctx.t('More options'), 'overflow')})}<div class="sa-keep-edit" style="background:${KEEP_COLORS[note.color || 0]}"><textarea class="keep-text" maxlength="2000" aria-label="${e(ctx.t('Note'))}">${e(note.text)}</textarea></div></div>`;
    }
    return `<div class="app-view sa-app sa-keep">${bar(ctx, {title: ctx.t('Keep'), icon: 'keep.png', actions: btn('sa-unsupported', ctx.t('Search'), 'search') + btn('sa-unsupported', ctx.t('More options'), 'overflow')})}<form class="sa-keep-add" data-form="keep-add"><input name="text" maxlength="500" autocomplete="off" placeholder="${e(ctx.t('Add quick note…'))}" aria-label="${e(ctx.t('Add quick note…'))}">${btn('sa-unsupported', ctx.t('List'), 'list')}${btn('sa-unsupported', ctx.t('Voice'), 'mic')}${btn('sa-unsupported', ctx.t('Camera'), 'camera')}</form><div class="sa-scroll"><div class="sa-notes">${notes.map(n => `<button class="sa-note" data-action="keep-open" data-id="${e(n.id)}" style="background:${KEEP_COLORS[n.color || 0]}">${e(n.text)}</button>`).join('') || `<p class="sa-empty">${e(ctx.t('Notes you add appear here'))}</p>`}</div></div></div>`;
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
    return `<div class="app-view sa-app sa-youtube"><header class="sa-bar sa-yt-bar"><button class="sa-up" data-action="home" aria-label="${e(ctx.t('Home'))}"><span aria-hidden="true">‹</span><img src="assets/youtube.png" alt=""></button><span class="sa-title"><b>${e(ctx.t('What to Watch'))}</b></span>${btn('sa-unsupported', ctx.t('Search'), 'search')}${btn('sa-unsupported', ctx.t('More options'), 'overflow')}</header><div class="sa-scroll sa-yt-feed">${VIDEOS.map((v, i) => `<button class="sa-yt-card" data-action="yt-video" data-id="${v.id}"><span class="sa-yt-thumb">${thumb(i)}<em>${e(v.len)}</em></span><span class="sa-yt-copy"><b>${e(v.title)}</b><small>${e(v.channel)} · ${e(ctx.t('%s views').replace('%s', v.views))}</small></span></button>`).join('')}</div></div>`;
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
  function earth(ctx) {
    return `<div class="app-view sa-app sa-earth"><div class="sa-stars"></div><div class="sa-globe">${'<svg viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="sa-gl" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#6fb4ff"/><stop offset=".55" stop-color="#1c5fb8"/><stop offset="1" stop-color="#05173d"/></radialGradient><clipPath id="sa-gc"><circle cx="100" cy="100" r="92"/></clipPath></defs><circle cx="100" cy="100" r="96" fill="#6fb4ff" opacity=".18"/><circle cx="100" cy="100" r="92" fill="url(#sa-gl)"/><g clip-path="url(#sa-gc)"><g class="sa-land" fill="#4f8f3e"><path d="M10 60c20-14 44-10 52 4s-8 26-2 40-20 30-36 22-26-48-14-66z"/><path d="M90 96c16-6 38 2 44 22s-8 40-26 46-24-12-18-30-16-30 0-38z"/><path d="M80 24c12-4 28 2 30 12s-16 10-24 6-18-16-6-18z"/><path d="M210 60c20-14 44-10 52 4s-8 26-2 40-20 30-36 22-26-48-14-66z"/><path d="M290 96c16-6 38 2 44 22s-8 40-26 46-24-12-18-30-16-30 0-38z"/><path d="M280 24c12-4 28 2 30 12s-16 10-24 6-18-16-6-18z"/></g><g fill="#fff" opacity=".55"><ellipse cx="60" cy="140" rx="30" ry="6"/><ellipse cx="140" cy="60" rx="24" ry="5"/></g></g><circle cx="100" cy="100" r="92" fill="none" stroke="#9cd0ff" stroke-opacity=".5" stroke-width="2"/></svg>'}</div><form class="sa-earth-search" data-form="earth-search"><input name="query" autocomplete="off" placeholder="${e(ctx.t('Search'))}" aria-label="${e(ctx.t('Search'))}"></form><button class="sa-earth-home" data-action="home" aria-label="${e(ctx.t('Home'))}">‹</button></div>`;
  }

  // ---- News & Weather (Holo dark): Weather, Top Stories and topics ----
  const STORIES = {
    'Top Stories': [['Android 5.1.1 security update rolls out to Nexus devices', 'Tech Daily', '2 hours ago'], ['City marathon draws record crowd', 'Metro News', '4 hours ago'], ['Researchers map the ocean floor in 3D', 'Science Today', '6 hours ago']],
    'Technology': [['Material design comes to more of your apps', 'Gadget Weekly', '1 hour ago'], ['Smart watches: the next big thing?', 'Droid Corner', '3 hours ago']],
    'Sports': [['Underdogs win the cup final', 'Sports Desk', '5 hours ago']]
  };
  function news(ctx) {
    const tabs = ['Weather', 'Top Stories', 'Technology', 'Sports'], tab = ctx.ui.newsTab || 'Top Stories';
    const body = tab === 'Weather'
      ? `<div class="sa-weather"><b>21°</b><span>${e(ctx.t('Partly cloudy'))}</span><small>Mountain View</small><div class="sa-forecast">${[0, 1, 2, 3].map(i => `<div><span>${e(new Date(ctx.now.getTime() + i * 864e5).toLocaleDateString(ctx.locale, {weekday: 'short'}))}</span><b>${[21, 23, 19, 20][i]}°</b><small>${[13, 14, 12, 11][i]}°</small></div>`).join('')}</div></div>`
      : (STORIES[tab] || []).map(([title, source, time], i) => `<button class="sa-story" data-action="sa-unsupported">${i === 0 ? `<span class="sa-story-photo">${thumb(i + 2)}</span>` : ''}<b>${e(title)}</b><small>${e(source)} · ${e(ctx.t(time))}</small></button>`).join('');
    return `<div class="app-view sa-app sa-news">${bar(ctx, {title: ctx.t('News & Weather'), icon: 'news-weather.png', cls: ' dark', actions: btn('sa-unsupported', ctx.t('Refresh'), 'locate') + btn('sa-unsupported', ctx.t('More options'), 'overflow')})}<nav class="sa-news-tabs">${tabs.map(id => `<button class="${id === tab ? 'on' : ''}" data-action="news-tab" data-id="${id}">${e(ctx.t(id))}</button>`).join('')}</nav><div class="sa-scroll">${body}</div></div>`;
  }

  const APPS = {'google-search': (ctx) => ctx.ui.sub === 'settings' ? searchSettings(ctx) : google(ctx), 'voice-search': voice, maps, drive, keep, youtube, 'google-plus': gplus, earth, 'news-weather': news, 'google-settings': googleSettings, 'google-search-settings': searchSettings};
  function render(app, ctx) { return (APPS[app] || google)(ctx); }
  const SIMPLE = ['google-search', 'voice-search', 'maps', 'drive', 'keep', 'youtube', 'google-plus', 'earth', 'news-weather', 'google-settings'];
  const DEFAULT_NOTES = [{id: 'k1', text: 'Buy concert tickets', color: 0}, {id: 'k2', text: 'Groceries: milk, eggs, lollipops', color: 1}, {id: 'k3', text: 'Call Mom on Sunday', color: 2}];
  window.StockApps = {APPS: SIMPLE, FILES, VIDEOS, POSTS, DEFAULT_NOTES, render};
})();
