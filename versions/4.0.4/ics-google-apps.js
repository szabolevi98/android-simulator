/* Google's other apps of the Galaxy Nexus image (IMM76I, spring 2012), as working screens in their 2012 looks, with the
   APKs' own colours and texts (docs/apk-strings.py):
   - Google+ 2.4.1 (PlusOne.apk): the home grid (home_screen_*_label) under the #292929 title, the Stream with the
     #3c3c3c tab row and its #dd4b39 line (stream_circles / stream_nearby / stream_whats_hot), posts in #333333 with
     #999999 times and #6f8fc7 links, +1s, Photos (the albums of the simulator's pictures) and Circles.
   - Google Talk (Talk.apk): the friends list with your status on top and presence dots on the roster's #edeff7 rows,
     chats on #eeeeee with the names in chat_from #7785e0 and chat_me #3492c5, "Type message".
   - YouTube 3.5.5: the dark app with the #3d3d3d tab row (Home, Browse), video rows and the watch page with Like /
     Dislike / Share.
   - Play Books 2.3.6 and Play Movies 1.4.11: the library and a reader; My Rentals / Personal Videos and a player.
   - Search (Google Search 1.4.1, the Quick Search Box app before Google Now): "Google Search", recent queries and the
     searchable items; a search opens the Browser.
   - Voice Dialer (AOSP packages/apps/VoiceDialer): "Listening…", then "No results, try again." with its tip.
   - Latitude (Maps 6.4): friends on the drawn map, Check in and Location history.
   All content is offline and made up. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const STRINGS = {
      "Stream": [
          "Fal",
          "Stream",
          "Flux",
          "Novedades"
      ],
      "Photos": [
          "Fotók",
          "Fotos",
          "Photos",
          "Fotos"
      ],
      "Profile": [
          "Profil",
          "Profil",
          "Profil",
          "Perfil"
      ],
      "Circles": [
          "Körök",
          "Kreise",
          "Cercles",
          "Círculos"
      ],
      "Messenger": [
          "Messenger",
          "Messenger",
          "Chat +",
          "Messenger"
      ],
      "Games": [
          "Játékok",
          "Spiele",
          "Jeux",
          "Juegos"
      ],
      "All circles": [
          "Az összes kör",
          "Alle Kreise",
          "Tous les cercles",
          "Todos los círculos"
      ],
      "Nearby": [
          "Közeli",
          "In der Nähe",
          "À proximité",
          "Cercanos"
      ],
      "What's hot": [
          "Népszerűek",
          "Angesagte Beiträge",
          "À découvrir",
          "Temas interesantes"
      ],
      "New post": [
          "Új bejegyzés",
          "Neuer Beitrag",
          "Nouveau post",
          "Publicación nueva"
      ],
      "Your albums": [
          "Albumaid",
          "Meine Alben",
          "Vos albums",
          "Tus álbumes"
      ],
      "Photos of you": [
          "Fotók rólad",
          "Fotos von mir",
          "Photos de vous",
          "Fotos de ti"
      ],
      "No posts found.": [
          "Nincsenek bejegyzések.",
          "Keine Beiträge gefunden",
          "Aucun post",
          "No hay publicaciones."
      ],
      "Just now": [
          "Most",
          "Jetzt gerade",
          "À l'instant",
          "Ahora mismo"
      ],
      "Friends list": [
          "Ismerőslista",
          "Kontaktliste",
          "Liste d'amis",
          "Lista de amigos"
      ],
      "Available": [
          "Elérhető",
          "Verfügbar",
          "Disponible",
          "Disponible"
      ],
      "Busy": [
          "Elfoglalt",
          "Nicht verfügbar",
          "Ne pas déranger",
          "Ocupado/a"
      ],
      "Away": [
          "Nincs a gépnél",
          "Nicht da",
          "Absent",
          "Ausente"
      ],
      "Invisible": [
          "Láthatatlan",
          "Unsichtbar",
          "Invisible",
          "Invisible"
      ],
      "Offline": [
          "Offline",
          "Offline",
          "Non connecté",
          "Desconectado/a"
      ],
      "Type message": [
          "Írja be az üzenetet.",
          "Nachricht schreiben",
          "Saisissez un message",
          "Escribir mensaje"
      ],
      "Add friend": [
          "Ismerős hozzáadása",
          "Freund hinzufügen",
          "Ajouter un ami",
          "Añadir amigo"
      ],
      "End chat": [
          "Csevegés befejezése",
          "Chat beenden",
          "Arrêter le chat",
          "Finalizar chat"
      ],
      "Status message": [
          "Állapotüzenet",
          "Statusnachricht",
          "Disponibilité",
          "Mensaje de estado"
      ],
      "Home": [
          "Főoldal",
          "Startseite",
          "Accueil",
          "Inicio"
      ],
      "Browse": [
          "Böngészés",
          "Kategorien",
          "Parcourir",
          "Explorar"
      ],
      "Search YouTube": [
          "Keresés a YouTube-on",
          "In YouTube suchen",
          "Rechercher sur YouTube",
          "Buscar en YouTube"
      ],
      "Like": [
          "Tetszik",
          "Gefällt mir",
          "J'aime",
          "Me gusta"
      ],
      "Dislike": [
          "Nem tetszik",
          "Mag ich nicht",
          "Je n'aime pas",
          "No me gusta"
      ],
      "Share": [
          "Megosztás",
          "Teilen",
          "Partager",
          "Compartir"
      ],
      "Upload": [
          "Feltöltés",
          "Hochladen",
          "Ajouter",
          "Subir"
      ],
      "Most viewed": [
          "Legtöbbször megtekintett",
          "Meistgesehen",
          "Les plus regardées",
          "Más vistos"
      ],
      "Shop": [
          "Bolt",
          "Kaufmodus",
          "Boutique",
          "Tienda"
      ],
      "Contents": [
          "Tartalom",
          "Inhaltsverzeichnis",
          "Table des matières",
          "Índice"
      ],
      "My Rentals": [
          "Saját kölcsönzések",
          "Meine Leihvideos",
          "Mes films",
          "Mis alquileres"
      ],
      "Personal Videos": [
          "Személyes videók",
          "Persönliche Videos",
          "Vidéos perso",
          "Vídeos personales"
      ],
      "Watch": [
          "Megtekintés",
          "Ansehen",
          "Visionner",
          "Ver"
      ],
      "Google Search": [
          "Google Keresés",
          "Google-Suche",
          "Recherche Google",
          "Búsqueda de Google"
      ],
      "Searchable items": [
          "Kereshető elemek",
          "Durchsuchbare Elemente",
          "Sources",
          "Elementos de búsqueda"
      ],
      "Listening…": [
          "Figyelés...",
          "Jetzt sprechen...",
          "Écoute en cours…",
          "Escuchando..."
      ],
      "No results, try again.": [
          "Nincs találat, próbálja újra.",
          "Keine Ergebnisse, versuchen Sie es erneut.",
          "Aucun résultat, réessayez.",
          "No se ha encontrado ningún resultado. Vuelve a intentarlo."
      ],
      "Did you know…": [
          "Tudta...",
          "Wussten Sie schon...",
          "Saviez-vous que...",
          "¿Sabías que...?"
      ],
      "Latitude": [
          "Koordináták",
          "Latitude",
          "Latitude",
          "Latitude"
      ],
      "Check in": [
          "Bejelentkezés",
          "Check-in",
          "Check-in",
          "Check-in"
      ],
      "Location history": [
          "Helyelőzmények",
          "Standortverlauf",
          "Historique Latitude",
          "Historial de ubicaciones"
      ]
  };
  const LANGS = ['hu', 'de', 'fr', 'es'];
  const T = (lang, key) => { const i = LANGS.indexOf(lang); return STRINGS[key] && i >= 0 ? STRINGS[key][i] : STRINGS[key] || lang === 'en' ? key : window.AndroidI18n?.t(key) ?? key; };
  const APPS = ['google-plus', 'talk', 'youtube', 'play-books', 'play-movies', 'search', 'voice-dialer', 'latitude'];
  const AVATAR = 'assets/kem-ic_generic_man.png';
  const hash = text => [...String(text)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const COLORS = ['#3c5a8a', '#7a3a2a', '#2c6e5a', '#5a2a5e', '#8a6a2a', '#2a5a7a'];
  const art = (title, cls) => `<span class="ga-art ${cls}" style="--c:${COLORS[hash(title) % COLORS.length]}"><em>${e(title)}</em></span>`;
  const head = (cls, icon, title, actions = '', up = false) => `<header class="ga-bar ${cls}"><button class="ga-home" data-action="${up ? 'back' : 'home'}" aria-label="${e(title)}">${up ? '<span class="ga-back">‹</span>' : ''}<img src="assets/${icon}.png" alt=""></button><h2>${e(title)}</h2>${actions}</header>`;
  const tabs = (items, current, action) => `<nav class="ga-tabs">${items.map(([id, label]) => `<button class="${id === current ? 'on' : ''}" data-action="${action}" data-id="${e(id)}">${e(label)}</button>`).join('')}</nav>`;
  const icon = (action, label, glyph) => `<button class="ga-icon" data-action="${action}" aria-label="${e(label)}">${glyph}</button>`;

  // ---- Google+ 2.4.1 ----
  const POSTS = [
    {id: 'p1', name: 'Alex Morgan', time: '2h', text: 'First day with the Galaxy Nexus. Face Unlock actually works!', plus: 12, comments: 3},
    {id: 'p2', name: 'Sam Rivera', time: '5h', text: 'Hangout tonight at 9 — bring snacks and your best bad jokes.', plus: 4, comments: 7},
    {id: 'p3', name: 'Android', time: 'Yesterday', text: 'Android 4.0.4 is rolling out to the Galaxy Nexus: faster camera, better rotation and more.', plus: 2381, comments: 412}
  ];
  function gplus(ctx) {
    const {ui, lang, data} = ctx, sub = ui.gaSub || '';
    if (sub === 'stream') {
      const tab = ui.gaStream || 'All circles', plus = data.gaPlus || [];
      const posts = tab === 'Nearby' ? POSTS.slice(0, 1) : tab === "What's hot" ? POSTS.slice(2) : POSTS;
      return `<div class="app-view ga-app ga-gplus">${head('ga-gp-bar', 'google-plus', T(lang, 'Stream'), icon('ga-unsupported', T(lang, 'New post'), '✎'), true)}${tabs(['All circles', 'Nearby', "What's hot"].map(t => [t, T(lang, t)]), tab, 'ga-stream')}<div class="ga-scroll ga-gp-stream">${posts.map(p => `<article class="ga-post"><header><img src="${AVATAR}" alt=""><span><b>${e(p.name)}</b><small>${e(p.time)}</small></span></header><p>${e(p.text)}</p><footer><button class="ga-plus${plus.includes(p.id) ? ' on' : ''}" data-action="ga-plus" data-id="${p.id}">+${p.plus + (plus.includes(p.id) ? 1 : 0)}</button><span>💬 ${p.comments}</span></footer></article>`).join('')}</div></div>`;
    }
    if (sub === 'photos') return `<div class="app-view ga-app ga-gplus">${head('ga-gp-bar', 'google-plus', T(lang, 'Photos'), '', true)}<div class="ga-scroll ga-gp-photos"><h3>${e(T(lang, 'Your albums'))}</h3><div class="ga-grid">${(data.photos || []).map(p => `<span class="ga-photo" style="background:linear-gradient(135deg,${p.colors?.[0] || '#555'},${p.colors?.[2] || '#222'})"><em>${e(p.name)}</em></span>`).join('')}</div></div></div>`;
    if (sub === 'circles') return `<div class="app-view ga-app ga-gplus">${head('ga-gp-bar', 'google-plus', T(lang, 'Circles'), '', true)}<div class="ga-scroll">${(data.contacts || []).map(c => `<div class="ga-person"><img src="${AVATAR}" alt=""><b>${e(c.name)}</b></div>`).join('')}</div></div>`;
    const tile = (id, label, glyph) => `<button class="ga-gp-tile" data-action="ga-gp-open" data-id="${id}"><span>${glyph}</span><b>${e(T(lang, label))}</b></button>`;
    return `<div class="app-view ga-app ga-gplus ga-gp-home">${head('ga-gp-bar', 'google-plus', 'Google+')}<div class="ga-gp-grid">${tile('stream', 'Stream', '≡')}${tile('photos', 'Photos', '▣')}${tile('profile', 'Profile', '☺')}${tile('circles', 'Circles', '◎')}${tile('messenger', 'Messenger', '✉')}${tile('games', 'Games', '♣')}</div></div>`;
  }

  // ---- Google Talk ----
  const PRESENCE = {1: 'Available', 2: 'Away', 3: 'Busy', 4: 'Offline'};
  function talk(ctx) {
    const {ui, lang, data} = ctx, chats = data.talkChats || [];
    if (ui.gaSub === 'chat') {
      const person = data.contacts.find(c => String(c.id) === String(ui.gaChat)) || {name: '?'};
      const msgs = chats.filter(m => String(m.contact) === String(ui.gaChat));
      return `<div class="app-view ga-app ga-talk">${head('ga-talk-bar', 'talk', person.name, icon('ga-talk-end', T(lang, 'End chat'), '✕'), true)}<div class="ga-scroll ga-talk-chat">${msgs.map(m => `<p class="${m.mine ? 'me' : 'from'}"><b>${e(m.mine ? 'me' : person.name.split(' ')[0])}:</b> ${e(m.body)}</p>`).join('')}</div><form class="ga-talk-compose" data-form="ga-talk"><input name="body" autocomplete="off" placeholder="${e(T(lang, 'Type message'))}" aria-label="${e(T(lang, 'Type message'))}"><button type="submit">▶</button></form></div>`;
    }
    const status = ctx.ui.gaPresence || 'Available';
    return `<div class="app-view ga-app ga-talk">${head('ga-talk-bar', 'talk', T(lang, 'Friends list'), icon('ga-unsupported', T(lang, 'Add friend'), '+'))}<button class="ga-talk-self" data-action="ga-presence"><img src="${AVATAR}" alt=""><span><b>${e(ctx.account)}</b><small><i class="dot ${status.toLowerCase()}"></i>${e(T(lang, status))}</small></span></button><div class="ga-scroll">${data.contacts.map(c => { const p = PRESENCE[c.id] || 'Offline'; return `<button class="ga-buddy ${p === 'Offline' ? 'off' : ''}" data-action="ga-talk-open" data-id="${c.id}"><img src="${AVATAR}" alt=""><span><b>${e(c.name)}</b><small>${e(T(lang, p))}</small></span><i class="dot ${p.toLowerCase()}"></i></button>`; }).join('')}</div></div>`;
  }

  // ---- YouTube 3.5.5 ----
  const VIDEOS = [
    {id: 'v1', title: 'Galaxy Nexus — hands-on and first impressions', channel: 'Gadget Weekly', views: '1,204,311', len: '8:42'},
    {id: 'v2', title: 'Ice Cream Sandwich: 10 tips for Android 4.0', channel: 'Droid Corner', views: '486,020', len: '6:15'},
    {id: 'v3', title: 'Panorama mode test on a mountain trail', channel: 'Trail & Summit', views: '52,977', len: '3:08'}
  ];
  function youtube(ctx) {
    const {ui, lang, data} = ctx;
    if (ui.gaSub === 'watch') {
      const v = VIDEOS.find(x => x.id === ui.gaVideo) || VIDEOS[0], liked = (data.gaYtLikes || []).includes(v.id);
      return `<div class="app-view ga-app ga-yt">${head('ga-yt-bar', 'youtube', 'YouTube', '', true)}<button class="ga-yt-video${ui.gaPaused ? ' paused' : ''}" data-action="ga-yt-toggle">${art(v.title, 'wide')}<i>${ui.gaPaused ? '▶' : '❚❚'}</i></button><div class="ga-scroll ga-yt-info"><h3>${e(v.title)}</h3><small>${e(v.channel)} · ${e(v.views)}</small><div class="ga-yt-actions"><button class="${liked ? 'on' : ''}" data-action="ga-yt-like" data-id="${v.id}">👍 ${e(T(lang, 'Like'))}</button><button data-action="ga-unsupported">👎 ${e(T(lang, 'Dislike'))}</button><button data-action="ga-unsupported">${e(T(lang, 'Share'))}</button></div></div></div>`;
    }
    const tab = ui.gaYtTab || 'Home';
    const list = tab === 'Home' ? VIDEOS : [...VIDEOS].reverse();
    return `<div class="app-view ga-app ga-yt">${head('ga-yt-bar', 'youtube', 'YouTube', icon('ga-unsupported', T(lang, 'Search YouTube'), '⌕') + icon('ga-unsupported', T(lang, 'Upload'), '⇪'))}${tabs([['Home', T(lang, 'Home')], ['Browse', T(lang, 'Browse')]], tab, 'ga-yt-tab')}<div class="ga-scroll">${tab === 'Browse' ? `<h3 class="ga-yt-head">${e(T(lang, 'Most viewed'))}</h3>` : ''}${list.map(v => `<button class="ga-yt-row" data-action="ga-yt-watch" data-id="${v.id}">${art(v.title, 'thumb')}<span><b>${e(v.title)}</b><small>${e(v.channel)}</small><small>${e(v.views)} · ${e(v.len)}</small></span></button>`).join('')}</div></div>`;
  }

  // ---- Play Books 2.3.6 ----
  const BOOKS = [
    {id: 'b1', title: 'Alice’s Adventures in Wonderland', author: 'Lewis Carroll', pages: ['Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do.', 'Down, down, down. Would the fall never come to an end?', 'There were doors all round the hall, but they were all locked.']},
    {id: 'b2', title: 'The Adventures of Sherlock Holmes', author: 'Arthur Conan Doyle', pages: ['To Sherlock Holmes she is always the woman.', 'I had seen little of Holmes lately.']}
  ];
  function books(ctx) {
    const {ui, lang, data} = ctx;
    if (ui.gaSub === 'read') {
      const b = BOOKS.find(x => x.id === ui.gaBook) || BOOKS[0], page = (data.gaBookPages || {})[b.id] || 0;
      return `<div class="app-view ga-app ga-books">${head('ga-books-bar', 'play-books', b.title, icon('ga-unsupported', T(lang, 'Contents'), '☰'), true)}<button class="ga-page" data-action="ga-book-turn"><p>${e(b.pages[page])}</p><small>${page + 1} / ${b.pages.length}</small></button></div>`;
    }
    return `<div class="app-view ga-app ga-books">${head('ga-books-bar', 'play-books', 'Play Books', icon('ga-shop', T(lang, 'Shop'), '🛍'))}<div class="ga-scroll ga-grid ga-book-grid">${BOOKS.map(b => `<button data-action="ga-book" data-id="${b.id}">${art(b.title, 'cover')}<b>${e(b.title)}</b><small>${e(b.author)}</small></button>`).join('')}</div></div>`;
  }

  // ---- Play Movies 1.4.11 ----
  const MOVIES = [{id: 'm1', title: 'The Last Lighthouse', year: 2011, mins: 104}, {id: 'm2', title: 'Paper Planes', year: 2012, mins: 96}];
  function movies(ctx) {
    const {ui, lang} = ctx;
    if (ui.gaSub === 'watch') {
      const m = MOVIES.find(x => x.id === ui.gaMovie) || MOVIES[0];
      return `<div class="app-view ga-app ga-movies ga-movie-player"><button class="ga-yt-video${ui.gaPaused ? ' paused' : ''}" data-action="ga-yt-toggle">${art(m.title, 'wide')}<i>${ui.gaPaused ? '▶' : '❚❚'}</i></button><h3>${e(m.title)}</h3></div>`;
    }
    const tab = ui.gaMoviesTab || 'rentals';
    const body = tab === 'rentals' ? MOVIES.map(m => `<div class="ga-movie">${art(m.title, 'poster')}<span><b>${e(m.title)}</b><small>${m.year} · ${m.mins}′</small><button data-action="ga-movie-watch" data-id="${m.id}">${e(T(lang, 'Watch'))}</button></span></div>`).join('') : `<p class="ga-empty">—</p>`;
    return `<div class="app-view ga-app ga-movies">${head('ga-movies-bar', 'play-movies', 'Play Movies', icon('ga-shop', T(lang, 'Shop'), '🛍'))}${tabs([['rentals', T(lang, 'My Rentals')], ['personal', T(lang, 'Personal Videos')]], tab, 'ga-movies-tab')}<div class="ga-scroll">${body}</div></div>`;
  }

  // ---- Google Search 1.4.1 (Quick Search Box) ----
  function search(ctx) {
    const {lang, data} = ctx, recent = data.gaSearches || ['nexus 4 release date', 'ice cream sandwich update', 'weather'];
    return `<div class="app-view ga-app ga-search"><form class="ga-qsb" data-form="ga-search"><img src="assets/search.png" alt=""><input name="query" autocomplete="off" placeholder="${e(T(lang, 'Google Search'))}" aria-label="${e(T(lang, 'Google Search'))}"><button type="submit" aria-label="Search">⌕</button></form><div class="ga-scroll">${recent.map(q => `<button class="ga-suggest" data-action="ga-search-run" data-id="${e(q)}"><span>↺</span>${e(q)}</button>`).join('')}<button class="ga-suggest ga-sources" data-action="ga-unsupported">${e(T(lang, 'Searchable items'))}</button></div></div>`;
  }

  // ---- Voice Dialer (AOSP) ----
  function voiceDialer(ctx) {
    const {ui, lang} = ctx, failed = ui.gaVoice === 'failed';
    return `<div class="app-view ga-app ga-voice"><h2>${e(T(lang, 'Voice Dialer'))}</h2><button class="ga-voice-mic${failed ? '' : ' on'}" data-action="ga-voice-listen" aria-label="${e(T(lang, 'Listening…'))}">🎤</button><p>${e(T(lang, failed ? 'No results, try again.' : 'Listening…'))}</p><div class="ga-voice-tip"><b>${e(T(lang, 'Did you know…'))}</b><span>“Call Alex Morgan”, “Dial 202-555-0148”, “Open Calendar”</span></div></div>`;
  }

  // ---- Latitude (Maps 6.4) ----
  function latitude(ctx) {
    const {lang, data} = ctx, pins = data.contacts.slice(0, 3);
    return `<div class="app-view ga-app ga-latitude">${head('ga-lat-bar', 'latitude', T(lang, 'Latitude'), icon('ga-unsupported', T(lang, 'Check in'), '✓'))}<div class="ga-lat-map"><svg viewBox="0 0 360 260" preserveAspectRatio="xMidYMid slice"><rect width="360" height="260" fill="#ece8df"/><path d="M-10 190c80-20 120 10 200-10s140-40 180-30v120H-10z" fill="#a9cdee"/><g stroke="#fff" stroke-width="6"><path d="M-10 90H370M120-10V270M260-10V270"/></g><path d="M-10 140C80 130 160 160 370 120" stroke="#f7d36b" stroke-width="9" fill="none"/>${pins.map((p, i) => `<g transform="translate(${80 + i * 100} ${70 + (i % 2) * 60})"><rect x="-14" y="-30" width="28" height="28" fill="#fff" stroke="#4285f4" stroke-width="2"/><text y="-11" text-anchor="middle" font-size="14" fill="#4285f4">${e(p.name.charAt(0))}</text></g>`).join('')}<circle cx="180" cy="150" r="7" fill="#4285f4" stroke="#fff" stroke-width="3"/></svg></div><div class="ga-scroll">${pins.map((p, i) => `<div class="ga-person"><img src="${AVATAR}" alt=""><span><b>${e(p.name)}</b><small>${['0.4 mi', '1.2 mi', '3 mi'][i]} · ${['5 min ago', '1 hour ago', 'Yesterday'][i]}</small></span></div>`).join('')}<button class="ga-suggest" data-action="ga-unsupported">${e(T(lang, 'Location history'))}</button></div></div>`;
  }

  function render(app, ctx) {
    return ({'google-plus': gplus, talk, youtube, 'play-books': books, 'play-movies': movies, search, 'voice-dialer': voiceDialer, latitude}[app] || (() => ''))(ctx);
  }
  // ctx: {data, ui, lang, account, save, render, toast, openApp, browse(query), listen()}.
  function handle(action, id, ctx) {
    const {ui, data} = ctx;
    switch (action) {
      case 'ga-gp-open': if (['stream', 'photos', 'circles'].includes(id)) { ui.gaSub = id; ctx.render(); } else if (id === 'messenger') ctx.openApp('messenger'); else ctx.toast('This feature is not part of the simulator.'); break;
      case 'ga-stream': ui.gaStream = id; ctx.render(); break;
      case 'ga-plus': { const list = data.gaPlus || []; data.gaPlus = list.includes(id) ? list.filter(x => x !== id) : [...list, id]; ctx.save(); ctx.render(); break; }
      case 'ga-presence': ui.gaPresence = {Available: 'Busy', Busy: 'Invisible', Invisible: 'Available'}[ui.gaPresence || 'Available']; ctx.render(); break;
      case 'ga-talk-open': ui.gaChat = id; ui.gaSub = 'chat'; ctx.render(); break;
      case 'ga-talk-end': ui.gaSub = ''; ctx.render(); break;
      case 'ga-yt-tab': ui.gaYtTab = id; ctx.render(); break;
      case 'ga-yt-watch': ui.gaVideo = id; ui.gaPaused = false; ui.gaSub = 'watch'; ctx.render(); break;
      case 'ga-yt-toggle': ui.gaPaused = !ui.gaPaused; ctx.render(); break;
      case 'ga-yt-like': { const list = data.gaYtLikes || []; data.gaYtLikes = list.includes(id) ? list.filter(x => x !== id) : [...list, id]; ctx.save(); ctx.render(); break; }
      case 'ga-book': ui.gaBook = id; ui.gaSub = 'read'; ctx.render(); break;
      case 'ga-book-turn': { const b = BOOKS.find(x => x.id === ui.gaBook) || BOOKS[0]; data.gaBookPages ||= {}; data.gaBookPages[b.id] = ((data.gaBookPages[b.id] || 0) + 1) % b.pages.length; ctx.save(); ctx.render(); break; }
      case 'ga-movies-tab': ui.gaMoviesTab = id; ctx.render(); break;
      case 'ga-movie-watch': ui.gaMovie = id; ui.gaPaused = false; ui.gaSub = 'watch'; ctx.render(); break;
      case 'ga-shop': ctx.openApp('play-store'); break;
      case 'ga-search-run': ctx.browse(id); break;
      case 'ga-voice-listen': ctx.listen(); break;
      case 'ga-unsupported': ctx.toast('This feature is not part of the simulator.'); break;
      default: return false;
    }
    return true;
  }
  function submit(form, values, ctx) {
    const {ui, data} = ctx;
    if (form === 'ga-talk') {
      const body = String(values.get('body') || '').trim(); if (!body) return true;
      data.talkChats ||= []; data.talkChats.push({contact: ui.gaChat, body, mine: true});
      ctx.save(); ctx.render(); return true;
    }
    if (form === 'ga-search') {
      const q = String(values.get('query') || '').trim(); if (!q) return true;
      data.gaSearches = [q, ...(data.gaSearches || []).filter(x => x !== q)].slice(0, 5); ctx.save(); ctx.browse(q); return true;
    }
    return false;
  }
  window.ICSGoogleApps = {APPS, render, handle, submit};
})();
