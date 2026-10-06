/* The Google Play media apps of the Nexus 6 factory image (LMY48Y). Audit step 4 rebuilds each from its APK (the code
   from the odex files in the system image): Play Music 5.8.1809R, Play Movies & TV 3.6.16, Play Books 3.3.15 and
   Play Games 2.2.09. They share one look: a coloured action bar in the app's colorPrimary (lp-play.css: Music #EF6C00,
   Movies #ED3B3B, Books #039BE5, Games #4CAF50) with the drawer mark and a white glyph, a white navigation drawer,
   #EEEEEE pages with section titles and coloured "SEE ALL" / "SEE MORE" / "SHOP" chips, and white cards (title, grey
   subtitle, overflow dots). Covers, posters
   and game art are the simulator's own drawings; book pages are short public-domain excerpts. */
(() => {
  'use strict';
  const S = (ctx, app, key) => { const row = window.StockStrings?.[app]?.[key], i = ['hu', 'de', 'fr', 'es'].indexOf(String(ctx.locale || 'en').slice(0, 2)); return row ? (i >= 0 ? row[i] : row[4] || key) : ctx.t(key); };
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const glyph = {
    music: '<svg viewBox="0 0 24 24"><path d="M12 3a8.5 8.5 0 0 0-8.5 8.5V19a2 2 0 0 0 2 2H8v-7H5.5v-2.5a6.5 6.5 0 0 1 13 0V14H16v7h2.5a2 2 0 0 0 2-2v-7.5A8.5 8.5 0 0 0 12 3z" fill="#fff"/></svg>',
    movies: '<svg viewBox="0 0 24 24"><path d="M3 4h18v16H3zm2 2v2h2V6zm0 4v4h14v-4zm0 6v2h2v-2zm12-10v2h2V6zm0 10v2h2v-2zM9 6v2h6V6zm0 10v2h6v-2z" fill="#fff" fill-rule="evenodd"/></svg>',
    books: '<svg viewBox="0 0 24 24"><path d="M3 5.5C5.5 4.3 8.5 4 11 5.5V20c-2.5-1.5-5.5-1.2-8 0zM13 5.5c2.5-1.5 5.5-1.2 8 0V20c-2.5-1.2-5.5-1.5-8 0z" fill="#fff"/></svg>',
    games: '<svg viewBox="0 0 24 24"><path d="M7 7h10a5 5 0 0 1 4.7 6.6l-1 3a2.6 2.6 0 0 1-4.5.8L14.5 15h-5l-1.7 2.4a2.6 2.6 0 0 1-4.5-.8l-1-3A5 5 0 0 1 7 7zm0 2.5v1.5H5.5v1.5H7V14h1.5v-1.5H10V11H8.5V9.5zm9.2.2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" fill="#fff" fill-rule="evenodd"/></svg>',
    search: '<svg viewBox="0 0 24 24"><path d="M10 3a7 7 0 0 1 5.6 11.2l5.6 5.6-1.4 1.4-5.6-5.6A7 7 0 1 1 10 3zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" fill="currentColor"/></svg>',
    overflow: '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="19" r="2" fill="currentColor"/></svg>',
    cast: '<svg viewBox="0 0 24 24"><path d="M3 5h18v14h-6v-2h4V7H5v3H3zm0 7a7 7 0 0 1 7 7H8a5 5 0 0 0-5-5zm0 4a3 3 0 0 1 3 3H3z" fill="currentColor"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M14 3l7 7-2 1-3 3 .5 4.5-1.5 1.5-4-4L6 21H4.5v-1.5L9 15l-4-4L6.5 9.5 11 10l3-3z" fill="currentColor"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M6.5 4.5h4v15h-4zm7 0h4v15h-4z" fill="currentColor"/></svg>',
    prev: '<svg viewBox="0 0 24 24"><path d="M5 5h2.5v14H5zm3.5 7L19 5v14z" fill="currentColor"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M16.5 5H19v14h-2.5zM5 5l10.5 7L5 19z" fill="currentColor"/></svg>',
    repeat: '<svg viewBox="0 0 24 24"><path d="M7 7h10V4l4 4-4 4V9H9v3H7zm10 10H7v3l-4-4 4-4v3h8v-3h2z" fill="currentColor"/></svg>',
    shuffle: '<svg viewBox="0 0 24 24"><path d="M14.5 4H20v5.5l-2-2-12.6 12.6L4 18.7 16.6 6.1zM4 5.4 5.4 4l5.2 5.2-1.4 1.4zm9.8 9.8 1.4-1.4 2.8 2.8 2-2V20h-5.5l2-2z" fill="currentColor"/></svg>',
    queue: '<svg viewBox="0 0 24 24"><path d="M3 5h13v2H3zm0 4h13v2H3zm0 4h9v2H3zm12 0 6 3.5-6 3.5z" fill="currentColor"/></svg>',
    thumbUp: '<svg viewBox="0 0 24 24"><path d="M2 10h4v11H2zm6 11V10l5-8 1.2.6c.6.4.9 1.1.7 1.8L14 9h6a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 18.6 21z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    thumbDown: '<svg viewBox="0 0 24 24"><path d="M22 14h-4V3h4zm-6-11v11l-5 8-1.2-.6c-.6-.4-.9-1.1-.7-1.8L10 15H4a2 2 0 0 1-2-2.3l1.4-8A2 2 0 0 1 5.4 3z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    trophy: '<svg viewBox="0 0 24 24"><path d="M7 3h10v2h3v3a4 4 0 0 1-4 4h-.3A5 5 0 0 1 13 14.9V18h3v3H8v-3h3v-3.1A5 5 0 0 1 8.3 12H8a4 4 0 0 1-4-4V5h3zm-1 4v1a2 2 0 0 0 1 1.7V7zm11 0v2.7A2 2 0 0 0 18 8V7z" fill="currentColor"/></svg>',
    toc: '<svg viewBox="0 0 24 24"><path d="M3 5h2v2H3zm4 0h14v2H7zM3 11h2v2H3zm4 0h14v2H7zm-4 6h2v2H3zm4 0h14v2H7z" fill="currentColor"/></svg>'
  };
  // Covers, posters and game icons: a two-colour field, simple shapes and the title, all drawn here.
  function art(kind, seed, title, sub = '') {
    const palettes = [['#1f3b5a', '#e8a33d'], ['#5b2c4f', '#f2c14e'], ['#0f5c58', '#f7f3e3'], ['#2f2f2f', '#e85d3f'], ['#3b4fa0', '#9fd3f2'], ['#7a1f1f', '#f0d9a7'], ['#204020', '#c8e06a'], ['#40305a', '#f28ab2']];
    const [a, b] = palettes[seed % palettes.length], w = kind === 'poster' ? 200 : 200, h = kind === 'poster' ? 290 : kind === 'book' ? 300 : 200;
    const shapes = [`<circle cx="${w * .7}" cy="${h * .32}" r="${w * .22}" fill="${b}" opacity=".85"/>`, `<path d="M0 ${h * .75} L${w * .5} ${h * .38} L${w} ${h * .7} V${h} H0Z" fill="${b}" opacity=".55"/>`, `<rect x="${w * .12}" y="${h * .14}" width="${w * .76}" height="${h * .42}" fill="none" stroke="${b}" stroke-width="6"/>`, `<path d="M0 ${h * .2} Q${w * .5} ${h * .65} ${w} ${h * .25}" fill="none" stroke="${b}" stroke-width="10" opacity=".8"/>`][seed % 4];
    const words = String(title).split(' '), lines = [];
    for (const word of words) { const last = lines.at(-1); if (last && (last + ' ' + word).length <= 12) lines[lines.length - 1] = last + ' ' + word; else lines.push(word); }
    const size = kind === 'icon' ? 22 : 24, y0 = kind === 'book' ? h * .5 : h * .68;
    const text = kind === 'icon' ? '' : lines.slice(0, kind === 'book' ? 4 : 3).map((line, i) => `<text x="${w / 2}" y="${y0 + i * (size + 4)}" text-anchor="middle" font-family="Georgia,serif" font-size="${size}" font-weight="700" fill="#fff">${e(line)}</text>`).join('') + (sub ? `<text x="${w / 2}" y="${h - 14}" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" fill="${b}">${e(sub)}</text>` : '');
    return `<svg class="pa-art" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="${w}" height="${h}" fill="${a}"/>${shapes}${text}</svg>`;
  }
  const APPS = {
    'play-music': {key: 'music', title: 'Play Music', pages: [['listen', 'Listen Now'], ['library', 'My Library'], ['playlists', 'Playlists'], ['mixes', 'Instant Mixes']]},
    'play-movies': {key: 'movies', title: 'Play Movies & TV', pages: [['watch', 'Watch Now'], ['library', 'My Library'], ['wishlist', 'My Wishlist']]},
    'play-books': {key: 'books', title: 'Play Books', pages: [['read', 'Read Now'], ['library', 'My Library']]},
    'play-games': {key: 'games', title: 'Play Games', pages: [['now', 'Play Now'], ['mine', 'My Games'], ['inbox', 'Inbox'], ['players', 'Players'], ['explore', 'Explore']]}
  };
  const DEFAULT = {'play-music': 'listen', 'play-movies': 'library', 'play-books': 'read', 'play-games': 'now'};
  const MOVIES = [
    {id: 'm1', title: 'The Last Lighthouse', year: 2014, mins: 104, progress: .42},
    {id: 'm2', title: 'Paper Planes', year: 2015, mins: 96, progress: 0},
    {id: 'm3', title: 'Northern Line', year: 2013, mins: 118, progress: .8},
    {id: 'm4', title: 'Orbit Nine', year: 2014, mins: 121, progress: 0}
  ];
  const SHOWS = [{id: 's1', title: 'Kitchen Science', seasons: 2, episodes: 12}, {id: 's2', title: 'Robots of Tomorrow', seasons: 1, episodes: 8}];
  const RECOMMENDED = [{id: 'r1', title: 'Summer in Lisbon', year: 2015, price: '$3.99'}, {id: 'r2', title: 'The Clockmaker', year: 2014, price: '$2.99'}];
  // Public-domain openings (Carroll 1865, Austen 1813, Dumas 1844 in the 1846 English translation, Doyle 1892).
  const BOOKS = [
    {id: 'b1', title: 'Alice’s Adventures in Wonderland', author: 'Lewis Carroll', pages: [
      'CHAPTER I.\nDown the Rabbit-Hole',
      'Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, “and what is the use of a book,” thought Alice “without pictures or conversations?”',
      'So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.',
      'There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, “Oh dear! Oh dear! I shall be late!”']},
    {id: 'b2', title: 'Pride and Prejudice', author: 'Jane Austen', pages: [
      'Chapter 1',
      'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.',
      'However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.',
      '“My dear Mr. Bennet,” said his lady to him one day, “have you heard that Netherfield Park is let at last?”\n\nMr. Bennet replied that he had not.']},
    {id: 'b3', title: 'The Three Musketeers', author: 'Alexandre Dumas', pages: [
      '1. The Three Presents of D’Artagnan the Elder',
      'On the first Monday of the month of April, 1625, the market town of Meung, in which the author of Romance of the Rose was born, appeared to be in as perfect a state of revolution as if the Huguenots had just made a second La Rochelle of it.',
      'Many citizens, seeing the women flying toward the High Street, leaving their children crying at the open doors, hastened to don the cuirass, and supporting their somewhat uncertain courage with a musket or a partisan, directed their steps toward the hostelry of the Jolly Miller.']},
    {id: 'b4', title: 'The Adventures of Sherlock Holmes', author: 'Arthur Conan Doyle', pages: [
      'I. A Scandal in Bohemia',
      'To Sherlock Holmes she is always the woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex.',
      'It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind.']}
  ];
  const GAMES = [
    {id: 'g1', title: 'Bean Bounce', dev: 'Android Demo', achievements: 18, got: 3, state: 'PURCHASED'},
    {id: 'g2', title: 'Dessert Dash', dev: 'Sweet Pixel', achievements: 12, got: 0, state: 'FREE'},
    {id: 'g3', title: 'Robot Rally', dev: 'Gearbox Kids', achievements: 25, got: 7, state: 'FREE'},
    {id: 'g4', title: 'Paper Pilots', dev: 'Fold Studio', achievements: 10, got: 0, state: 'FREE'}
  ];
  const PLAYERS = [{name: 'Alex Morgan', game: 'Robot Rally'}, {name: 'Sam Rivera', game: 'Bean Bounce'}];
  const seedOf = id => [...String(id)].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

  // The LP Play apps' Toolbar in colorPrimary (lp-play.css): the AppCompat DrawerArrowToggle (three 18 dp white bars, 3 dp
  // apart) or the material up arrow, the 20 sp title, the action icons; PlayHeaderListLayout's tabs sit in the same colour.
  const LPA = new Set(['play-music', 'play-movies', 'play-books', 'play-games']);
  function bar(ctx, {title, subtitle = '', up = false, actions = '', tabs = ''}) {
    const app = APPS[ctx.app];
    if (LPA.has(ctx.app)) return `<header class="lpa-bar"><button class="lpa-nav${up ? ' up' : ''}" data-action="${up ? 'back' : 'pa-drawer'}" aria-label="${e(up ? ctx.t('Back') : S(ctx, app.key, 'Open navigation drawer'))}">${up ? '<span></span>' : '<i></i><i></i><i></i>'}</button><b>${e(title)}</b>${actions}</header>${tabs}`;
    return '';
  }
  // The Play common library's PlayDrawer: play_drawer_profile_info (148 dp: the default cover under #38000000, the 64 dp
  // avatar, name and address in 14 sp white), the primary actions (48 dp, 14 sp sans-serif-medium #212121, the 24 dp icon
  // 32 dp from the text; the current one on #eeeeee with its _selected icon), the 16 dp separator, the secondary actions.
  function playDrawer(label, prefix, primary, secondary, page, profile = prefix) {
    return `<div class="pa-drawer-scrim lpa-scrim" data-action="close-overlay"></div><nav class="lpa-drawer" aria-label="${e(label)}"><div class="lpa-profile"><img class="lpa-cover" src="assets/${profile}bg_default_profile_art.png" alt=""><img class="lpa-avatar" src="assets/${profile}ic_profile_none.png" alt=""><b>Nexus 6</b><small>nexus6.demo@gmail.com</small></div><div class="lpa-primary">${primary.map(([id, text, icon, action]) => `<button class="${id === page ? 'on' : ''}" data-action="${action || 'pa-page'}" data-id="${id}"><img src="assets/${prefix}${icon}${id === page ? '_selected' : ''}.png" alt="">${e(text)}</button>`).join('')}</div><hr>${secondary.map(([text, action]) => `<button data-action="${action || 'pa-unsupported'}">${e(text)}</button>`).join('')}</nav>`;
  }
  const lpTabs = (tabs, current, action) => `<nav class="lpa-tabs">${tabs.map(([id, text]) => `<button class="${id === current ? 'on' : ''}" data-action="${action}" data-id="${id}">${e(text)}</button>`).join('')}</nav>`;
  // Music 5.8's menu/home_activity.xml has only Search (always) and the media route button (with a cast device); there is
  // no overflow: Settings, Help and Send feedback are drawer actions.
  const musicActions = ctx => `<button class="pa-btn" data-action="pa-search" aria-label="${e(S(ctx, 'music', 'Search'))}"><img class="lpa-icon" src="assets/pm58-ic_search_white.png" alt=""></button>`;
  const btn = (action, label, icon, id = '') => `<button class="pa-btn" data-action="${action}"${id ? ` data-id="${e(id)}"` : ''} aria-label="${e(label)}">${glyph[icon]}</button>`;
  const section = (title, chip = '', chipAction = '') => `<div class="pa-section"><h3>${e(title)}</h3>${chip ? `<button class="pa-chip" data-action="${chipAction}">${e(chip)}</button>` : ''}</div>`;
  const card = ({action, id, artHtml, title, sub, note = '', pin = false, cls = ''}) => `<div class="pa-card${cls}" role="button" tabindex="0" data-action="${action}" data-id="${e(id)}" aria-label="${e(title)}"><div class="pa-card-art">${artHtml}</div><div class="pa-card-copy"><b>${e(title)}</b><small>${e(sub)}</small>${note ? `<i>${e(note)}</i>` : ''}<button class="pa-dots" data-action="pa-unsupported" aria-label="More options">${glyph.overflow}</button>${pin ? `<button class="pa-pin" data-action="pa-unsupported" aria-label="Keep on device">${glyph.pin}</button>` : ''}</div></div>`;

  // ---- Play Music ----
  function albums(tracks) {
    const map = new Map();
    tracks.forEach((track, i) => { if (!map.has(track.album)) map.set(track.album, {album: track.album, artist: track.artist, tracks: []}); map.get(track.album).tracks.push(i); });
    return [...map.values()];
  }
  function miniPlayer(ctx) {
    const {music, tracks} = ctx, track = tracks[music.track];
    if (!track) return '';
    return `<div class="pm-mini"><button class="pm-mini-open" data-action="pa-player"><span class="pm-mini-art">${art('cover', seedOf(track.album), track.album)}</span><span class="pm-mini-copy"><b>${e(track.title)}</b><small>${e(track.artist)}</small></span></button><button class="pm-mini-play" data-action="music-play" aria-label="${e(ctx.t(music.playing ? 'Pause' : 'Play'))}">${music.playing ? glyph.pause : glyph.play}</button></div>`;
  }
  // Search (audit step 5): SearchActivity's expanded SearchView and the clusters of SearchMusicClustersFragment: Artists
  // and Albums as 2 x 2 cards, Songs as up to 5 rows, "%d MORE" when a cluster holds more; ic_empty_state_search and
  // "No results found." when nothing matches. Artist, album and song names are matched on their own.
  function musicSearch(ctx) {
    const {ui, tracks, music: state} = ctx, m = key => S(ctx, 'music', key), q = String(ui.paQuery || '').trim().toLocaleLowerCase();
    const list = albums(tracks), has = text => String(text).toLocaleLowerCase().includes(q), more = (n, max) => n > max ? m('%d MORE').replace('%d', n - max) : '';
    let body = '';
    if (q) {
      const artists = [...new Set(tracks.map(track => track.artist))].filter(has), found = list.filter(album => has(album.album)), songs = tracks.map((track, id) => ({track, id})).filter(({track}) => has(track.title));
      if (!artists.length && !found.length && !songs.length) body = `<div class="pm-search-empty"><img src="assets/pm58-ic_empty_state_search.png" alt=""><p>${e(m('No results found.'))}</p></div>`;
      else body = (artists.length ? section(m('Artists'), more(artists.length, 4), 'pa-unsupported') + `<div class="pa-grid">${artists.slice(0, 4).map(artist => card({action: 'pa-album', id: list.find(album => album.artist === artist).album, artHtml: art('cover', seedOf(artist), artist), title: artist, sub: ''})).join('')}</div>` : '')
        + (found.length ? section(m('Albums'), more(found.length, 4), 'pa-unsupported') + `<div class="pa-grid">${found.slice(0, 4).map(album => card({action: 'pa-album', id: album.album, artHtml: art('cover', seedOf(album.album), album.album, album.artist), title: album.album, sub: album.artist})).join('')}</div>` : '')
        + (songs.length ? section(m('Songs'), more(songs.length, 5), 'pa-unsupported') + `<div class="pm-songs">${songs.slice(0, 5).map(({track, id}) => `<button class="pm-song${id === state.track ? ' on' : ''}" data-action="pa-song" data-id="${id}" data-queue="all"><span class="pm-qart">${art('cover', seedOf(track.album), track.album)}</span><span><b>${e(track.title)}</b><small>${e(track.artist)}</small></span></button>`).join('')}</div>` : '');
    }
    return `<div class="app-view pa-app pa-music pm-search"><header class="lpa-bar pm-searchbar"><button class="lpa-nav up" data-action="back" aria-label="${e(ctx.t('Back'))}"><span></span></button><label class="pm-sv"><input data-pa-search value="${e(ui.paQuery || '')}" placeholder="${e(m('Search music'))}" aria-label="${e(m('Search music'))}" autocomplete="off" spellcheck="false">${ui.paQuery ? `<button class="pm-sv-clear" data-action="pa-search-clear" aria-label="${e(m('Clear query'))}"></button>` : ''}</label></header><div class="pa-scroll">${body}</div>${miniPlayer(ctx)}</div>`;
  }
  function music(ctx) {
    if (ctx.ui.sub === 'search') return musicSearch(ctx);
    const {ui, t, tracks, music: state} = ctx, page = ui.paPage?.['play-music'] || 'listen', m = key => S(ctx, 'music', key);
    const time = ctx.time;
    if (ui.sub === 'player' || ui.sub === 'queue') {
      const track = tracks[state.track], thumbs = ctx.data.playMusicThumbs || {};
      const head = `<header class="pm-np-head"><button class="pm-np-back" data-action="back" aria-label="${e(t('Back'))}"><span class="pm-np-art">${art('cover', seedOf(track.album), track.album)}</span><span class="pm-np-copy"><b>${e(track.title)}</b><small>${e(track.artist)}</small></span></button>${btn('pa-queue', t('Queue'), 'queue')}${btn('pa-unsupported', t('More options'), 'overflow')}</header>`;
      const body = ui.sub === 'queue'
        ? `<div class="pm-queue"><h4>${e(t('QUEUE'))}</h4>${state.queue.map(id => `<button class="pm-queue-row${id === state.track ? ' on' : ''}" data-action="pa-song" data-id="${id}" data-queue="keep"><i class="pm-grip"></i><span class="pm-qart">${art('cover', seedOf(tracks[id].album), tracks[id].album)}</span><span><b>${e(tracks[id].title)}</b><small>${e(tracks[id].artist)}</small></span>${id === state.track ? '<em class="pm-eq"><i></i><i></i><i></i></em>' : ''}</button>`).join('')}</div>`
        : `<div class="pm-np-art-big">${art('cover', seedOf(track.album), track.album, track.artist)}<button class="pm-thumb up${thumbs[state.track] === 1 ? ' on' : ''}" data-action="pa-thumb" data-id="1" aria-label="${e(t('Thumbs up'))}">${glyph.thumbUp}</button><button class="pm-thumb down${thumbs[state.track] === -1 ? ' on' : ''}" data-action="pa-thumb" data-id="-1" aria-label="${e(t('Thumbs down'))}">${glyph.thumbDown}</button><span class="pm-time music-elapsed">${time(state.position)}</span><span class="pm-time end">${time(track.duration)}</span></div>`;
      return `<div class="app-view pa-app pa-music pm-now">${head}${body}<input class="music-progress pm-progress" data-field="music-position" type="range" min="0" max="${track.duration}" value="${Math.floor(state.position)}" aria-label="${e(t('Position'))}" style="--p:${(state.position / track.duration * 100).toFixed(2)}%"><div class="pm-controls"><button class="${state.repeat !== 'off' ? 'on' : ''}" data-action="music-repeat" aria-label="${e(t('Repeat'))}">${glyph.repeat}${state.repeat === 'one' ? '<sup>1</sup>' : ''}</button><button data-action="music-prev" aria-label="${e(t('Previous'))}">${glyph.prev}</button><button class="pm-play" data-action="music-play" aria-label="${e(t(state.playing ? 'Pause' : 'Play'))}">${state.playing ? glyph.pause : glyph.play}</button><button data-action="music-next" aria-label="${e(t('Next'))}">${glyph.next}</button><button class="${state.shuffle ? 'on' : ''}" data-action="music-shuffle" aria-label="${e(t('Shuffle'))}">${glyph.shuffle}</button></div></div>`;
    }
    const list = albums(tracks);
    if (ui.sub === 'album') {
      const album = list.find(item => item.album === ui.paAlbum) || list[0];
      return `<div class="app-view pa-app pa-music">${bar(ctx, {title: album.album, subtitle: album.artist, up: true, actions: musicActions(ctx)})}<div class="pa-scroll"><div class="pm-album-head">${art('cover', seedOf(album.album), album.album, album.artist)}</div><div class="pm-songs">${album.tracks.map((id, n) => `<button class="pm-song${id === state.track ? ' on' : ''}" data-action="pa-song" data-id="${id}" data-queue="${e(album.album)}"><em>${n + 1}</em><span><b>${e(tracks[id].title)}</b><small>${e(tracks[id].artist)}</small></span><time>${time(tracks[id].duration)}</time></button>`).join('')}</div></div>${miniPlayer(ctx)}</div>`;
    }
    let body = '', title = m('Listen Now'), subtitle = '', tabBar = '';
    if (page === 'listen') {
      const reasons = ['Recently played', 'Recently added to My Library', 'Recently played'].map(m);
      body = `<div class="pa-grid">${list.map((album, i) => card({action: 'pa-album', id: album.album, artHtml: art('cover', seedOf(album.album), album.album, album.artist), title: album.album, sub: album.artist, note: reasons[i % reasons.length]})).join('')}</div>`;
    } else if (page === 'library') {
      title = m('My Library');
      const tab = ui.paMusicTab || 'albums';
      const tabs = [['genres', 'Genres'], ['artists', 'Artists'], ['albums', 'Albums'], ['songs', 'Songs']];
      const content = tab === 'albums' ? `<div class="pa-grid">${list.map(album => card({action: 'pa-album', id: album.album, artHtml: art('cover', seedOf(album.album), album.album, album.artist), title: album.album, sub: album.artist})).join('')}</div>`
        : tab === 'songs' ? `<div class="pm-songs">${tracks.map((track, id) => `<button class="pm-song${id === state.track ? ' on' : ''}" data-action="pa-song" data-id="${id}" data-queue="all"><span class="pm-qart">${art('cover', seedOf(track.album), track.album)}</span><span><b>${e(track.title)}</b><small>${e(track.artist)}</small></span><time>${time(track.duration)}</time></button>`).join('')}</div>`
        : tab === 'artists' ? `<div class="pm-songs">${[...new Set(tracks.map(track => track.artist))].map(artist => `<button class="pm-song" data-action="pa-album" data-id="${e(list.find(album => album.artist === artist).album)}"><span class="pm-qart">${art('cover', seedOf(artist), artist)}</span><span><b>${e(artist)}</b><small>${e(t('%d albums').replace('%d', list.filter(album => album.artist === artist).length))}</small></span></button>`).join('')}</div>`
        : `<div class="pm-songs"><button class="pm-song" data-action="pa-libtab" data-id="albums"><span class="pm-qart">${art('cover', 3, 'Pop')}</span><span><b>${e(t('Pop'))}</b><small>${e(t('%d albums').replace('%d', list.length))}</small></span></button></div>`;
      // MyLibraryFragment's tabs in the PlayHeaderListLayout (14 sp sans-serif-medium, #99ffffff, white when selected with
      // a 2 dp white underline).
      tabBar = lpTabs(tabs.map(([id, label]) => [id, m(label)]), tab, 'pa-libtab');
      body = content;
    } else if (page === 'mixes') {
      // InstantMixesFragment: My mixes, Recommended (the simulator recommends a mix per album).
      title = m('Instant Mixes');
      const tab = ui.paMixTab || 'recommended';
      tabBar = lpTabs([['mine', m('My mixes')], ['recommended', m('Recommended')]], tab, 'pa-mixtab');
      body = tab === 'recommended' ? `<div class="pa-grid">${list.map(album => card({action: 'pa-album', id: album.album, artHtml: art('cover', seedOf(album.album) + 3, album.album), title: album.album, sub: album.artist})).join('')}</div>` : '';
    } else {
      title = m('Playlists');
      const auto = [['Thumbs up', Object.values(ctx.data.playMusicThumbs || {}).filter(v => v === 1).length], ['Last added', tracks.length]];
      body = `${section(t('Auto playlists'))}<div class="pm-songs">${auto.map(([name, n], i) => `<button class="pm-song" data-action="pa-libtab-songs"><span class="pm-qart">${art('cover', i + 5, name)}</span><span><b>${e(m(name))}</b><small>${e(t('%d songs').replace('%d', n))}</small></span></button>`).join('')}</div>${state.playlists.length ? section(t('Playlists')) + `<div class="pm-songs">${state.playlists.map((p, i) => `<button class="pm-song" data-action="pa-libtab-songs"><span class="pm-qart">${art('cover', i + 2, p.name)}</span><span><b>${e(p.name)}</b><small>${e(t('%d songs').replace('%d', p.tracks.length))}</small></span></button>`).join('')}</div>` : ''}`;
    }
    return `<div class="app-view pa-app pa-music">${bar(ctx, {title, subtitle, actions: musicActions(ctx), tabs: tabBar})}<div class="pa-scroll">${body}</div>${miniPlayer(ctx)}</div>`;
  }

  // ---- Play Movies & TV ----
  // Search in Play Movies & TV and Play Books (audit step 5): the expanded SearchView with the app's hint, then the
  // suggestions the app's provider gives for the library while typing (Videos: search_dropdown_item_icons_2line with
  // the thumbnail and title; Books: list_item_suggest_volume and the list_item_suggest_market row).
  function storeSearch(ctx) {
    const {ui} = ctx, movies = ctx.app === 'play-movies', key = movies ? 'movies' : 'books', s = k => S(ctx, key, k), q = String(ui.paQuery || '').trim().toLocaleLowerCase();
    const hint = s(movies ? 'Search for movies & shows' : 'Search Google Play'), clear = s('Clear query');
    const has = text => String(text).toLocaleLowerCase().includes(q);
    let rows = '';
    if (q && movies) rows = [...MOVIES, ...SHOWS].filter(item => has(item.title)).map(item => `<button class="pa-suggest-row" data-action="${MOVIES.includes(item) ? 'pa-movie' : 'pa-unsupported'}" data-id="${e(item.id)}"><span class="pa-suggest-art">${art('poster', seedOf(item.id), item.title)}</span><span><b>${e(item.title)}</b></span></button>`).join('');
    if (q && !movies) rows = BOOKS.filter(book => has(book.title) || has(book.author)).map(book => `<button class="pa-suggest-row" data-action="pa-book" data-id="${e(book.id)}"><span class="pa-suggest-art">${art('book', seedOf(book.id), book.title)}</span><span><b>${e(book.title)}</b><small>${e(book.author)}</small></span></button>`).join('') + `<button class="pa-suggest-row market" data-action="pa-unsupported"><span><b>${e(s('Search Google Play'))}</b></span></button>`;
    return `<div class="app-view pa-app ${movies ? 'pa-movies' : 'pa-books'} pm-search"><header class="lpa-bar pm-searchbar"><button class="lpa-nav up" data-action="back" aria-label="${e(ctx.t('Back'))}"><span></span></button><label class="pm-sv"><input data-pa-search value="${e(ui.paQuery || '')}" placeholder="${e(hint)}" aria-label="${e(hint)}" autocomplete="off" spellcheck="false">${ui.paQuery ? `<button class="pm-sv-clear" data-action="pa-search-clear" aria-label="${e(clear)}"></button>` : ''}</label></header>${rows ? `<div class="pa-suggest ${movies ? 'movies' : 'books'}">${rows}</div>` : ''}</div>`;
  }
  function movies(ctx) {
    if (ctx.ui.sub === 'search') return storeSearch(ctx);
    const {ui, t} = ctx, page = ui.paPage?.['play-movies'] || 'library', v = key => S(ctx, 'movies', key);
    if (ui.sub === 'movie') {
      const movie = MOVIES.find(m => m.id === ui.paItem) || SHOWS.find(s => s.id === ui.paItem) || MOVIES[0];
      const playing = ui.paPlaying !== false, total = (movie.mins || 24) * 60, pos = Math.floor(total * (movie.progress || 0)) + (ui.paSeconds || 0);
      const clock = s => `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
      return `<div class="app-view pa-app pm-video${ui.paBars === false ? ' bare' : ''}" data-action="pa-video-bars"><div class="pm-video-frame${playing ? ' playing' : ''}">${art('poster', seedOf(movie.id), movie.title)}</div><header class="pm-video-top"><button class="lpa-nav up" data-action="back" aria-label="${e(t('Back'))}"><span></span></button><b>${e(movie.title)}</b>${btn('pa-unsupported', t('Cast screen'), 'cast')}</header><button class="pm-video-play" data-action="pa-video-toggle" aria-label="${e(t(playing ? 'Pause' : 'Play'))}">${playing ? glyph.pause : glyph.play}</button><footer class="pm-video-bottom"><span>${clock(pos)}</span><i style="--p:${Math.min(100, pos / total * 100).toFixed(1)}%"></i><span>${clock(total)}</span></footer></div>`;
    }
    // search_menu: Search (always) and the media route button (only with a cast device); no overflow.
    const actions = `<button class="pa-btn" data-action="pa-search" aria-label="${e(v('Search'))}"><img class="lpa-icon" src="assets/mv36-abc_ic_search_api_mtrl_alpha.png" alt=""></button>`;
    const movieCard = m => card({action: 'pa-movie', id: m.id, artHtml: art('poster', seedOf(m.id), m.title), title: m.title, sub: `${m.year}, ${t('%d mins.').replace('%d', m.mins)}`, pin: true});
    const shopCard = m => card({action: 'pa-shop', id: m.id, artHtml: art('poster', seedOf(m.id), m.title), title: m.title, sub: `${m.year} · ${m.price}`});
    let body, tabBar = '';
    if (page === 'watch') body = `<div class="pa-grid">${MOVIES.filter(m => m.progress).map(m => card({action: 'pa-movie', id: m.id, artHtml: art('poster', seedOf(m.id), m.title) + `<i class="pm-progress-strip" style="--p:${m.progress * 100}%"></i>`, title: m.title, sub: t('%d% watched').replace('%d', Math.round(m.progress * 100))})).join('')}</div>${section(v('Recommended for You'), v('Shop'), 'pa-shop')}<div class="pa-grid">${RECOMMENDED.map(shopCard).join('')}</div>`;
    else if (page === 'wishlist') body = `${section(v('Movies'))}<div class="pa-grid">${RECOMMENDED.map(shopCard).join('')}</div>`;
    else {
      // MyLibraryFragment pages the movies and shows verticals (VerticalsHelper's titles) under PlayHeaderListLayout tabs.
      const tab = ui.paMovieTab || 'movies';
      tabBar = lpTabs([['movies', v('My Movies')], ['shows', v('My TV Shows')]], tab, 'pa-movietab');
      body = tab === 'shows' ? `<div class="pa-grid">${SHOWS.map(show => card({action: 'pa-movie', id: show.id, artHtml: art('poster', seedOf(show.id), show.title), title: show.title, sub: t('%d episodes').replace('%d', show.episodes), pin: true})).join('')}</div>` : `<div class="pa-grid">${MOVIES.map(movieCard).join('')}</div>`;
    }
    const title = v(APPS['play-movies'].pages.find(p => p[0] === page)[1]);
    return `<div class="app-view pa-app pa-movies">${bar(ctx, {title, actions, tabs: tabBar})}<div class="pa-scroll">${body}</div></div>`;
  }

  // ---- Play Books ----
  function books(ctx) {
    if (ctx.ui.sub === 'search') return storeSearch(ctx);
    const {ui, t, data} = ctx, page = ui.paPage?.['play-books'] || 'read', progress = data.playBooks || {}, b = key => S(ctx, 'books', key);
    if (ui.sub === 'reader') {
      const book = BOOKS.find(b => b.id === ui.paItem) || BOOKS[0], index = Math.min(progress[book.id] || 0, book.pages.length - 1);
      const text = book.pages[index].split('\n').filter(Boolean).map((p, i) => index === 0 ? `<h2${i ? ' class="sub"' : ''}>${e(p)}</h2>` : `<p>${e(p)}</p>`).join('');
      return `<div class="app-view pa-app pb-reader${ui.paBars === false ? ' bare' : ''}"><header class="pb-top"><button class="lpa-nav up dark" data-action="back" aria-label="${e(t('Back'))}"><span></span></button><span><b>${e(book.title)}</b><small>${e(book.author)}</small></span><button class="pb-aa" data-action="pa-unsupported" aria-label="${e(t('Display options'))}">Aa</button>${btn('pa-unsupported', t('More options'), 'overflow')}</header><div class="pb-page" data-action="pa-reader-tap">${text}</div><footer class="pb-bottom">${btn('pa-unsupported', t('Contents'), 'toc')}<i style="--p:${(index / Math.max(1, book.pages.length - 1) * 100).toFixed(1)}%"></i><span>${index + 1} / ${book.pages.length}</span></footer></div>`;
    }
    const cover = b => art('book', seedOf(b.id), b.title, b.author);
    // menu/fragment_home.xml: Search (always) and Sort (ifRoom, My Library only) as icons, Refresh in the overflow.
    const icon = (action, label, src) => `<button class="pa-btn" data-action="${action}" aria-label="${e(label)}"><img class="lpa-icon" src="assets/${src}.png" alt=""></button>`;
    const actions = icon('pa-search', b('Search'), 'bk33-ic_search_wht_24dp') + (page === 'library' ? icon('pa-unsupported', b('Sort'), 'bk33-ic_sort_wht_24dp') : '') + icon('pa-menu', t('More options'), 'bk33-abc_ic_menu_moreoverflow_mtrl_alpha');
    // My Library pages LibraryFilter's non-empty filters (books_view_pager) as PlayHeaderListLayout tabs.
    const tabBar = page === 'library' ? lpTabs([['all', b('All books')], ['purchases', b('Purchases')]], ui.bkFilterTab || 'all', 'pa-bookstab') : '';
    const body = page === 'read'
      ? `${section(b('Recent'), b('SEE ALL'), 'pa-see-all')}<div class="pa-grid pb-covers">${BOOKS.map(b => `<div class="pb-cover" role="button" tabindex="0" data-action="pa-book" data-id="${b.id}" aria-label="${e(b.title)}">${cover(b)}<span class="pb-pinned">${glyph.pin}</span></div>`).join('')}</div>`
      : `<div class="pa-grid">${BOOKS.map(b => card({action: 'pa-book', id: b.id, artHtml: cover(b), title: b.title, sub: b.author, note: progress[b.id] ? t('%d% read').replace('%d', Math.round(progress[b.id] / (b.pages.length - 1) * 100)) : ''})).join('')}</div>`;
    return `<div class="app-view pa-app pa-books">${bar(ctx, {title: b(page === 'read' ? 'Read Now' : 'My Library'), actions, tabs: tabBar})}<div class="pa-scroll">${body}</div></div>`;
  }

  // ---- Play Games ----
  // Play Games 2.2: Play Now's sections (Continue playing, Discover new games, Add players you know), My Games, Inbox
  // (games_inbox_null_state_*), Players and Explore (FEATURED, POPULAR, POPULAR MULTIPLAYER tabs); the overflow is
  // games_default_menu (Settings).
  function games(ctx) {
    const {ui, t} = ctx, page = ui.paPage?.['play-games'] || 'now', p = key => S(ctx, 'games', key);
    const icon = g => art('icon', seedOf(g.id), g.title);
    const overflow = `<button class="pa-btn" data-action="pa-menu" aria-label="${e(t('More options'))}"><img class="lpa-icon" src="assets/pg22-abc_ic_menu_moreoverflow_mtrl_alpha.png" alt=""></button>`;
    const gameCard = g => card({action: 'pa-game', id: g.id, artHtml: icon(g), title: g.title, sub: g.dev, note: `${g.got}/${g.achievements}`, cls: ' pg-game'});
    const playerCard = (pl, i) => card({action: 'pa-unsupported', id: pl.name, artHtml: art('icon', i + 4, pl.name), title: pl.name, sub: pl.game});
    const listRow = g => `<div class="pg-row" role="button" tabindex="0" data-action="pa-game" data-id="${g.id}"><span class="pg-icon">${icon(g)}</span><span class="pg-copy"><b>${e(g.title)}</b><small>${e(g.dev)}</small></span>${g.state === 'PURCHASED' ? `<em>${e(p('PURCHASED'))}</em>` : ''}</div>`;
    if (ui.sub === 'game') {
      const g = GAMES.find(item => item.id === ui.paItem) || GAMES[0];
      return `<div class="app-view pa-app pa-games">${bar(ctx, {title: g.title, up: true, actions: overflow})}<div class="pa-scroll"><div class="pg-hero">${art('poster', seedOf(g.id) + 1, '')}<span class="pg-hero-icon">${icon(g)}</span></div><div class="pg-detail"><b>${e(g.title)}</b><small>${e(g.dev)}</small><button class="pa-chip big" data-action="pa-game-play">${e(p('PLAY'))}</button></div>${section(p('Achievements'))}<div class="pg-achievements">${Array.from({length: Math.min(6, g.achievements)}, (_, i) => `<div class="pg-ach${i < g.got ? ' got' : ''}"><span>${glyph.trophy}</span><b>${e(t('Achievement %d').replace('%d', i + 1))}</b><small>${e(t(i < g.got ? 'Unlocked' : 'Locked'))}</small></div>`).join('')}</div></div></div>`;
    }
    let body, tabBar = '';
    if (page === 'now') body = `${section(p('Continue playing'))}<div class="pa-grid">${GAMES.slice(0, 2).map(gameCard).join('')}</div>${section(p('Discover new games'))}<div class="pg-list">${GAMES.slice(2).map(listRow).join('')}</div>${section(p('Add players you know'))}<div class="pa-grid">${PLAYERS.map(playerCard).join('')}</div>`;
    else if (page === 'mine') body = `<div class="pa-grid">${GAMES.map(gameCard).join('')}</div>`;
    else if (page === 'inbox') body = `<div class="pg-null"><p>${e(p('Game on! See invitations and matches in progress here.'))}</p><button class="pa-chip big" data-action="pa-page" data-id="explore">${e(p('FIND MULTIPLAYER GAMES'))}</button></div>`;
    else if (page === 'players') body = `<div class="pa-grid">${PLAYERS.map(playerCard).join('')}</div>`;
    else {
      const tab = ui.paGamesTab || 'featured';
      tabBar = lpTabs([['featured', p('FEATURED')], ['popular', p('POPULAR')], ['multiplayer', p('POPULAR MULTIPLAYER')]], tab, 'pa-gtab');
      body = `<div class="pg-list">${(tab === 'featured' ? GAMES.slice(1) : tab === 'multiplayer' ? GAMES.slice(2) : GAMES).map(listRow).join('')}</div>`;
    }
    const title = p(APPS['play-games'].pages.find(item => item[0] === page)[1]);
    return `<div class="app-view pa-app pa-games">${bar(ctx, {title, actions: overflow, tabs: tabBar})}<div class="pa-scroll">${body}</div></div>`;
  }


  function render(ctx) {
    if (ctx.app === 'play-music') return music(ctx);
    if (ctx.app === 'play-movies') return movies(ctx);
    if (ctx.app === 'play-books') return books(ctx);
    return games(ctx);
  }
  // The navigation drawer: the app's pages, the current one highlighted.
  function drawer(ctx) {
    const app = APPS[ctx.app], page = ctx.ui.paPage?.[ctx.app] || DEFAULT[ctx.app];
    // Music: HomeMenuScreens' free list (Listen Now, My Library, Playlists, Instant Mixes, Shop) with HomeActivity$Screen's
    // ic_drawer_* icons, then Settings, Help and Send feedback.
    // Movies: VideosDrawerHelper's verticals 4, 16, 8 (Watch Now, My Library, My Wishlist) with their ic_drawer_* icons,
    // Shop, then the secondary Settings and Help & feedback.
    // Books: HomeSideDrawer.populateDrawerActions: Read Now, My Library, Shop, then Settings and Help & feedback.
    // Games: the destination drawer's list (Play Now, My Games, Inbox, Players, Explore with games_ic_drawer_* icons), then
    // Settings and Help & Feedback.
    if (ctx.app === 'play-games') { const p = key => S(ctx, 'games', key); return playDrawer(p('Play Games'), 'pg22-', [['now', p('Play Now'), 'games_ic_drawer_playnow'], ['mine', p('My Games'), 'games_ic_drawer_mygames'], ['inbox', p('Inbox'), 'games_ic_drawer_inbox'], ['players', p('Players'), 'games_ic_drawer_players'], ['explore', p('Explore'), 'games_ic_drawer_explore']], [[p('Settings')], [p('Help & Feedback')]], page, 'pm58-'); }
    if (ctx.app === 'play-books') { const b = key => S(ctx, 'books', key); return playDrawer(b('Play Books'), 'bk33-', [['read', b('Read Now'), 'ic_drawer_readnow'], ['library', b('My Library'), 'ic_drawer_mylibrary'], ['shop', b('Shop'), 'ic_drawer_shop', 'pa-shop']], [[b('Settings')], [b('Help & feedback')]], page, 'mv36-'); }
    if (ctx.app === 'play-movies') { const v = key => S(ctx, 'movies', key); return playDrawer(v('Google Play'), 'mv36-', [['watch', v('Watch Now'), 'ic_drawer_watchnow'], ['library', v('My Library'), 'ic_drawer_mymovielibrary'], ['wishlist', v('My Wishlist'), 'ic_drawer_wishlist'], ['shop', v('Shop'), 'ic_drawer_shop', 'pa-shop']], [[v('Settings')], [v('Help & feedback')]], page); }
    if (ctx.app === 'play-music') { const m = key => S(ctx, 'music', key); return playDrawer(m('Play Music'), 'pm58-', [['listen', m('Listen Now'), 'ic_drawer_listennow'], ['library', m('My Library'), 'ic_drawer_mymusiclibrary'], ['playlists', m('Playlists'), 'ic_drawer_playlists'], ['mixes', m('Instant Mixes'), 'ic_drawer_radio'], ['shop', m('Shop'), 'ic_drawer_shop', 'pa-shop']], [[m('Settings')], [m('Help')], [m('Send feedback')]], page); }
    return `<div class="pa-drawer-scrim" data-action="close-overlay"></div><nav class="pa-drawer pa-${app.key}" aria-label="${e(ctx.t(app.title))}">${app.pages.map(([id, label]) => `<button class="${id === page ? 'on' : ''}" data-action="pa-page" data-id="${id}">${e(ctx.t(label))}</button>`).join('')}</nav>`;
  }
  // Action bar overflow menus (the pa-menu overlay).
  function menu(ctx) {
    if (ctx.app === 'play-books') return [{action: 'pa-refresh', title: S(ctx, 'books', 'Refresh')}];
    if (ctx.app === 'play-games') return [{action: 'pa-unsupported', title: S(ctx, 'games', 'Settings')}];
    return [];
  }
  const bookPages = id => (BOOKS.find(b => b.id === id) || BOOKS[0]).pages.length;
  const music3 = tracks => albums(tracks);
  window.PlayApps = {DEFAULT, APPS, MOVIES, SHOWS, BOOKS, GAMES, art, render, drawer, menu, bookPages, albums: music3};
})();
