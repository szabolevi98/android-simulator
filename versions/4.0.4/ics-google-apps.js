/* Google's other apps of the Galaxy Nexus image (IMM76I, spring 2012), as working screens in their 2012 looks, with the
   APKs' own colours and texts (docs/apk-strings.py):
   - Google+ 2.4.1 (PlusOne.apk): the home grid (home_screen_*_label) under the #292929 title, the Stream with the
     #3c3c3c tab row and its #dd4b39 line (stream_circles / stream_nearby / stream_whats_hot), posts in #333333 with
     #999999 times and #6f8fc7 links, +1s, Photos (the albums of the simulator's pictures) and Circles.
   - Google Talk (Talk.apk): the friends list with your status on top and presence dots on the roster's #edeff7 rows,
     chats on #eeeeee with the names in chat_from #7785e0 and chat_me #3492c5, "Type message".
   - YouTube 3.5.5 (Theme.Holo.Light.DarkActionBar on #e6e6e6): the bg_stripes_dark action bar with Search and Record,
     the Home / Browse / Account tabs, video_item.xml rows, and the watch page (watch_activity.xml): the player, the
     #3d3d3d Info / Related / Comments tab row, watch_info.xml with the +1 panel and the Like / Dislike image buttons;
     Add to and Share in the action bar, Like and Dislike in its overflow.
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
      "Most viewed": [
          "Legtöbbször megtekintett",
          "Meistgesehen",
          "Les plus regardées",
          "Más vistos"
      ],
      "Account": [
          "Fiók",
          "Konto",
          "Compte",
          "Cuenta"
      ],
      "Search": [
          "Keresés",
          "Suche",
          "Rechercher",
          "Buscar"
      ],
      "Record": [
          "Felvétel",
          "Aufnehmen",
          "Enregistrer",
          "Grabar"
      ],
      "Settings": [
          "Beállítások",
          "Einstellungen",
          "Paramètres",
          "Ajustes"
      ],
      "Feedback": [
          "Visszajelzés",
          "Feedback",
          "Commentaires",
          "Comentarios"
      ],
      "Help": [
          "Súgó",
          "Hilfe",
          "Aide",
          "Ayuda"
      ],
      "Add to": [
          "Hozzáadás ide:",
          "Hinzufügen zu",
          "Ajouter à",
          "Añadir a"
      ],
      "Info": [
          "Információ",
          "Info",
          "Infos",
          "Información"
      ],
      "Related": [
          "Kapcsolódó",
          "Ähnlich",
          "Vidéos similaires",
          "Relacionados"
      ],
      "Comments": [
          "Megjegyzések",
          "Kommentare",
          "Commentaires",
          "Comentarios"
      ],
      "No comments found.": [
          "Nincsenek megjegyzések.",
          "Keine Kommentare gefunden",
          "Aucun commentaire n'a été trouvé.",
          "No se han encontrado comentarios."
      ],
      "by": [
          "feltöltötte:",
          "von",
          "par",
          "de"
      ],
      "Description": [
          "Leírás",
          "Beschreibung",
          "Description",
          "Descripción"
      ],
      "Category": [
          "Kategória",
          "Kategorie",
          "Catégorie",
          "Categoría"
      ],
      "%1$,d views | %2$,d likes | %3$,d dislikes": [
          "%1$,d megtekintés | %2$,d tetszik, %3$,d nem",
          "%1$,d Aufrufe | %2$,d_0 pos. | %3$,d neg.",
          "%1$,d visionnages | %2$,d \"J'aime\" | %3$,d \"Je n'aime pas\"",
          "%1$,d reproducciones | %2$,d Me gusta | %3$,d No me gusta"
      ],
      "You like this video.": [
          "Tetszett ez a videó.",
          "Du magst dieses Video.",
          "Vous aimez cette vidéo.",
          "Te gusta este vídeo."
      ],
      "You dislike this video.": [
          "Nem tetszett ez a videó.",
          "Du magst dieses Video nicht.",
          "Vous n'aimez pas cette vidéo.",
          "No te gusta este vídeo."
      ],
      "Your Channel": [
          "A Te csatornád",
          "Dein Kanal",
          "Votre chaîne",
          "Tu canal"
      ],
      "Channel views": [
          "Csatornamegtekintések",
          "Kanalaufrufe",
          "Vues (chaîne)",
          "Reproducciones de canal"
      ],
      "Uploaded": [
          "Feltöltve",
          "Hochgeladen",
          "Mise en ligne",
          "Subidos"
      ],
      "Subscribers": [
          "Feliratkozók",
          "Abonnenten",
          "Abonnés",
          "Suscriptores"
      ],
      "Video chat": [
          "Videocsevegés",
          "Video-Chat",
          "Chat vidéo",
          "Chat de vídeo"
      ],
      "Voice chat": [
          "Audiocsevegés",
          "Sprach-Chat",
          "Chat audio",
          "Chat de voz"
      ],
      "Display options": [
          "Megjelenítési beállítások",
          "Anzeigeoptionen",
          "Options d'affichage",
          "Mostrar opciones"
      ],
      "End all chats": [
          "Minden csevegés befejezése",
          "Alle Chats beenden",
          "Quitter tous les chats",
          "Finalizar todos los chats"
      ],
      "Sign out": [
          "Kijelentkezés",
          "Abmelden",
          "Se déconnecter",
          "Salir"
      ],
      "Invites": [
          "Meghívások",
          "Einladungen",
          "Invités",
          "Invitados"
      ],
      "Friend info": [
          "Ismerős adatai",
          "Kontaktinfo",
          "Infos sur l'ami",
          "Información de tu amigo/a"
      ],
      "Add to chat": [
          "Hozzáadás a csevegéshez",
          "Zum Chatten einladen",
          "Ajouter au chat",
          "Añadir al chat"
      ],
      "Clear chat history": [
          "Csevegési előzmények törlése",
          "Chat-Protokoll löschen",
          "Effacer l'historique du chat",
          "Borrar historial de chat"
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
  // Action bars: the framework's up caret (ic_ab_back_holo_dark, or _light on the light bars of Books and Latitude), the
  // apps' own menu icons (ga-<app>-*.png from their APKs) and the Holo overflow button.
  const LIGHT_BARS = ['ga-books-bar', 'ga-lat-bar'];
  const head = (cls, icon, title, actions = '', up = false) => `<header class="ga-bar ${cls}"><button class="ga-home" data-action="${up ? 'back' : 'home'}" aria-label="${e(title)}">${up ? `<img class="ga-back" src="assets/ga-fw-ic_ab_back_holo_${LIGHT_BARS.includes(cls) ? 'light' : 'dark'}.png" alt="">` : ''}<img src="assets/${icon}.png" alt=""></button><h2>${e(title)}</h2>${actions}</header>`;
  const tabs = (items, current, action) => `<nav class="ga-tabs">${items.map(([id, label]) => `<button class="${id === current ? 'on' : ''}" data-action="${action}" data-id="${e(id)}">${e(label)}</button>`).join('')}</nav>`;
  const icon = (action, label, src) => `<button class="ga-icon" data-action="${action}" aria-label="${e(label)}"><img src="assets/${src}.png" alt=""></button>`;
  const more = (light = false) => `<button class="ga-icon" data-action="ga-menu" aria-label="More options"><img src="assets/ic_menu_moreoverflow_normal_holo_${light ? 'light' : 'dark'}.png" alt=""></button>`;

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
      return `<div class="app-view ga-app ga-gplus">${head('ga-gp-bar', 'google-plus', T(lang, 'Stream'), icon('ga-unsupported', T(lang, 'New post'), 'ga-gp-ic_menu_new_post_action_bar'), true)}${tabs(['All circles', 'Nearby', "What's hot"].map(t => [t, T(lang, t)]), tab, 'ga-stream')}<div class="ga-scroll ga-gp-stream">${posts.map(p => `<article class="ga-post"><header><img src="${AVATAR}" alt=""><span><b>${e(p.name)}</b><small>${e(p.time)}</small></span></header><p>${e(p.text)}</p><footer><button class="ga-plus${plus.includes(p.id) ? ' on' : ''}" data-action="ga-plus" data-id="${p.id}">+${p.plus + (plus.includes(p.id) ? 1 : 0)}</button><span><img src="assets/ga-gp-ic_comment.png" alt=""> ${p.comments}</span></footer></article>`).join('')}</div></div>`;
    }
    if (sub === 'photos') return `<div class="app-view ga-app ga-gplus">${head('ga-gp-bar', 'google-plus', T(lang, 'Photos'), '', true)}<div class="ga-scroll ga-gp-photos"><h3>${e(T(lang, 'Your albums'))}</h3><div class="ga-grid">${(data.photos || []).map(p => `<span class="ga-photo" style="background:linear-gradient(135deg,${p.colors?.[0] || '#555'},${p.colors?.[2] || '#222'})"><em>${e(p.name)}</em></span>`).join('')}</div></div></div>`;
    if (sub === 'circles') return `<div class="app-view ga-app ga-gplus">${head('ga-gp-bar', 'google-plus', T(lang, 'Circles'), '', true)}<div class="ga-scroll">${(data.contacts || []).map(c => `<div class="ga-person"><img src="${AVATAR}" alt=""><b>${e(c.name)}</b></div>`).join('')}</div></div>`;
    // home_screen_*_icon_default (xhdpi 128 px) over the labels.
    const tile = (id, label, src) => `<button class="ga-gp-tile" data-action="ga-gp-open" data-id="${id}"><img src="assets/ga-gp-home_screen_${src}_icon_default.png" alt=""><b>${e(T(lang, label))}</b></button>`;
    return `<div class="app-view ga-app ga-gplus ga-gp-home">${head('ga-gp-bar', 'google-plus', 'Google+')}<div class="ga-gp-grid">${tile('stream', 'Stream', 'stream')}${tile('photos', 'Photos', 'photos')}${tile('profile', 'Profile', 'profile')}${tile('circles', 'Circles', 'people')}${tile('messenger', 'Messenger', 'huddle')}${tile('games', 'Games', 'games')}</div></div>`;
  }

  // ---- Google Talk ----
  const PRESENCE = {1: 'Available', 2: 'Away', 3: 'Busy', 4: 'Offline'};
  function talk(ctx) {
    const {ui, lang, data} = ctx, chats = data.talkChats || [];
    if (ui.gaSub === 'chat') {
      const person = data.contacts.find(c => String(c.id) === String(ui.gaChat)) || {name: '?'};
      const msgs = chats.filter(m => String(m.contact) === String(ui.gaChat));
      return `<div class="app-view ga-app ga-talk">${head('ga-talk-bar', 'talk', person.name, icon('ga-unsupported', T(lang, 'Video chat'), 'ga-tk-ic_video_default_holo_dark') + icon('ga-unsupported', T(lang, 'Voice chat'), 'ga-tk-ic_audio_default_holo_dark') + more(), true)}<div class="ga-scroll ga-talk-chat">${msgs.map(m => `<p class="${m.mine ? 'me' : 'from'}"><b>${e(m.mine ? 'me' : person.name.split(' ')[0])}:</b> ${e(m.body)}</p>`).join('')}</div><form class="ga-talk-compose" data-form="ga-talk"><input name="body" autocomplete="off" placeholder="${e(T(lang, 'Type message'))}" aria-label="${e(T(lang, 'Type message'))}"><button type="submit" aria-label="Send"><img src="assets/ga-tk-ic_send_holo_light.png" alt=""></button></form></div>`;
    }
    const status = ctx.ui.gaPresence || 'Available';
    return `<div class="app-view ga-app ga-talk">${head('ga-talk-bar', 'talk', T(lang, 'Friends list'), icon('ga-unsupported', T(lang, 'Search'), 'ga-tk-ic_menu_search_holo_dark') + icon('ga-unsupported', T(lang, 'Add friend'), 'ga-tk-ic_menu_add_buddy_holo_light') + more())}<button class="ga-talk-self" data-action="ga-presence"><img src="${AVATAR}" alt=""><span><b>${e(ctx.account)}</b><small><i class="dot ${status.toLowerCase()}"></i>${e(T(lang, status))}</small></span></button><div class="ga-scroll">${data.contacts.map(c => { const p = PRESENCE[c.id] || 'Offline'; return `<button class="ga-buddy ${p === 'Offline' ? 'off' : ''}" data-action="ga-talk-open" data-id="${c.id}"><img src="${AVATAR}" alt=""><span><b>${e(c.name)}</b><small>${e(T(lang, p))}</small></span><i class="dot ${p.toLowerCase()}"></i></button>`; }).join('')}</div></div>`;
  }

  // ---- YouTube 3.5.5 ----
  const VIDEOS = [
    {id: 'v1', title: 'Galaxy Nexus — hands-on and first impressions', channel: 'Gadget Weekly', views: 1204311, likes: 8312, dislikes: 214, len: '8:42', hd: true, added: '2011-11-21', category: 'Science & Technology', text: 'Our first day with the Galaxy Nexus and Ice Cream Sandwich: the screen, the camera and Face Unlock.'},
    {id: 'v2', title: 'Ice Cream Sandwich: 10 tips for Android 4.0', channel: 'Droid Corner', views: 486020, likes: 5120, dislikes: 61, len: '6:15', hd: true, added: '2012-01-09', category: 'Howto & Style', text: 'Folders, the people app, screenshots, data usage and six more things to try.'},
    {id: 'v3', title: 'Panorama mode test on a mountain trail', channel: 'Trail & Summit', views: 52977, likes: 640, dislikes: 9, len: '3:08', hd: false, added: '2012-03-18', category: 'Travel & Events', text: 'One sweep from the ridge with the stock camera.'}
  ];
  const num = (lang, n) => Number(n).toLocaleString(lang === 'en' ? 'en-US' : lang);
  const ytRating = (data, id) => (data.gaYtRatings || {})[id] || ((data.gaYtLikes || []).includes(id) ? 'like' : '');
  // The bar is bg_stripes_dark tiled; the top level shows the launcher icon (ActionBar.TopLevel has no logo), other
  // screens the up caret and ic_logo_square, with no title (displayOptions useLogo | showHome).
  const ytBar = (up, actions) => `<header class="ga-bar ga-yt-bar"><button class="ga-home" data-action="${up ? 'back' : 'home'}" aria-label="YouTube">${up ? '<img class="ga-back" src="assets/ga-fw-ic_ab_back_holo_dark.png" alt=""><img src="assets/ga-yt-ic_logo_square.png" alt="">' : '<img src="assets/youtube.png" alt="">'}</button><span class="ga-yt-fill"></span>${actions}</header>`;
  const ytItem = (lang, v) => `<button class="ga-yt-row" data-action="ga-yt-watch" data-id="${v.id}"><span class="ga-yt-thumb">${art(v.title, 'thumb')}<i>${e(v.len)}</i></span><span class="ga-yt-details"><b>${e(v.title)}</b><small>${e(v.channel)}</small><small>${e(T(lang, '%1$,d views | %2$,d likes | %3$,d dislikes').split(' | ')[0].replace('%1$,d', num(lang, v.views)))}${v.hd ? '<img src="assets/ga-yt-ic_hd.png" alt="HD">' : ''}</small></span></button>`;
  function youtube(ctx) {
    const {ui, lang, data} = ctx;
    if (ui.gaSub === 'watch') {
      const v = VIDEOS.find(x => x.id === ui.gaVideo) || VIDEOS[0], rating = ytRating(data, v.id), plus = (data.gaYtPlus || []).includes(v.id);
      const wtab = ui.gaYtWatchTab || 'info', likes = v.likes + (rating === 'like'), dislikes = v.dislikes + (rating === 'dislike');
      const stats = T(lang, '%1$,d views | %2$,d likes | %3$,d dislikes').replace('%1$,d', num(lang, v.views)).replace('%2$,d', num(lang, likes)).replace('%3$,d', num(lang, dislikes));
      const rate = (kind, label) => `<button class="ga-yt-rate" data-action="ga-yt-rate" data-id="${kind}" aria-label="${e(T(lang, label))}"${rating ? ' disabled' : ''}><img src="assets/ga-yt-ic_${kind}${rating ? '_disabled' : ''}.png" alt=""></button>`;
      const info = `<div class="ga-yt-info"><h3>${e(v.title)}</h3><small>${e(new Date(v.added + 'T12:00').toLocaleDateString(lang === 'en' ? 'en-US' : lang, {year: 'numeric', month: 'short', day: 'numeric'}))}</small><small>${e(stats)}</small><div class="ga-yt-panel"><button class="ga-yt-plus" data-action="ga-yt-plus" aria-label="+1"><img src="assets/ga-yt-ic_plusone_standard_${plus ? 'on' : 'off'}.png" alt=""></button><i></i>${rate('like', 'Like')}${rate('dislike', 'Dislike')}</div><button class="ga-yt-channel" data-action="ga-unsupported">${e(T(lang, 'by'))} <b>${e(v.channel)}</b></button><h4>${e(T(lang, 'Description'))}</h4><p>${e(v.text)}</p><h4>${e(T(lang, 'Category'))}</h4><p class="dim">${e(v.category)}</p></div>`;
      const pane = wtab === 'related' ? VIDEOS.filter(x => x.id !== v.id).map(x => ytItem(lang, x)).join('') : wtab === 'comments' ? `<p class="ga-yt-none">${e(T(lang, 'No comments found.'))}</p>` : info;
      return `<div class="app-view ga-app ga-yt">${ytBar(true, icon('ga-unsupported', T(lang, 'Add to'), 'ga-yt-ic_menu_add_to_playlist') + icon('ga-unsupported', T(lang, 'Share'), 'ga-yt-ic_menu_share') + more())}<button class="ga-yt-video${ui.gaPaused ? ' paused' : ''}" data-action="ga-yt-toggle">${art(v.title, 'wide')}<img src="assets/ga-yt-ic_vidcontrol_${ui.gaPaused ? 'play' : 'pause'}.png" alt=""></button><nav class="ga-yt-tabrow">${[['info', 'Info'], ['related', 'Related'], ['comments', 'Comments']].map(([id, label]) => `<button class="${id === wtab ? 'on' : ''}" data-action="ga-yt-wtab" data-id="${id}">${e(T(lang, label))}</button>`).join('')}</nav><div class="ga-scroll ga-yt-pane">${pane}</div></div>`;
    }
    const tab = ui.gaYtTab || 'Home';
    const body = tab === 'Account'
      ? `<div class="ga-yt-channelhead"><img src="${AVATAR}" alt=""><span><b>${e(ctx.account)}</b><small>${e(T(lang, 'Channel views'))}</small><small>${e(T(lang, 'Uploaded'))}</small><small>${e(T(lang, 'Subscribers'))}</small></span></div>`
      : `${tab === 'Browse' ? `<h3 class="ga-yt-head">${e(T(lang, 'Most viewed'))}</h3>` : ''}${(tab === 'Home' ? VIDEOS : [...VIDEOS].sort((a, b) => b.views - a.views)).map(v => ytItem(lang, v)).join('')}`;
    return `<div class="app-view ga-app ga-yt">${ytBar(false, icon('ga-unsupported', T(lang, 'Search'), 'ga-yt-ic_menu_search') + icon('ga-unsupported', T(lang, 'Record'), 'ga-yt-ic_menu_capture') + more())}<nav class="ga-yt-tabs">${[['Home', 'Home'], ['Browse', 'Browse'], ['Account', 'Account']].map(([id, label]) => `<button class="${id === tab ? 'on' : ''}" data-action="ga-yt-tab" data-id="${id}">${e(T(lang, label))}</button>`).join('')}</nav><div class="ga-scroll">${body}</div></div>`;
  }
  // The action bar overflow of the screen on show (the apps' menu XML; showAsAction="never" items).
  function menu(ctx) {
    const {ui, lang} = ctx, item = (action, title, id = '') => ({action, title: T(lang, title), id});
    if (ctx.view === 'youtube') return ui.gaSub === 'watch' ? [item('ga-yt-rate', 'Like', 'like'), item('ga-yt-rate', 'Dislike', 'dislike')] : [item('ga-unsupported', 'Settings'), item('ga-unsupported', 'Feedback'), item('ga-unsupported', 'Help')];
    if (ctx.view === 'talk') return ui.gaSub === 'chat' ? [item('ga-talk-end', 'End chat'), item('ga-unsupported', 'Friend info'), item('ga-unsupported', 'Add to chat'), item('ga-talk-clear', 'Clear chat history')]
      : [item('ga-unsupported', 'Display options'), item('ga-talk-end-all', 'End all chats'), item('ga-unsupported', 'Sign out'), item('ga-unsupported', 'Invites')];
    return [];
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
      return `<div class="app-view ga-app ga-books">${head('ga-books-bar', 'play-books', b.title, icon('ga-unsupported', T(lang, 'Contents'), 'ga-bk-ic_menu_toc_light'), true)}<button class="ga-page" data-action="ga-book-turn"><p>${e(b.pages[page])}</p><small>${page + 1} / ${b.pages.length}</small></button></div>`;
    }
    return `<div class="app-view ga-app ga-books">${head('ga-books-bar', 'play-books', 'Play Books', icon('ga-shop', T(lang, 'Shop'), 'ga-bk-ic_menu_market_light'))}<div class="ga-scroll ga-grid ga-book-grid">${BOOKS.map(b => `<button data-action="ga-book" data-id="${b.id}">${art(b.title, 'cover')}<b>${e(b.title)}</b><small>${e(b.author)}</small></button>`).join('')}</div></div>`;
  }

  // ---- Play Movies 1.4.11 ----
  const MOVIES = [{id: 'm1', title: 'The Last Lighthouse', year: 2011, mins: 104}, {id: 'm2', title: 'Paper Planes', year: 2012, mins: 96}];
  function movies(ctx) {
    const {ui, lang} = ctx;
    if (ui.gaSub === 'watch') {
      const m = MOVIES.find(x => x.id === ui.gaMovie) || MOVIES[0];
      return `<div class="app-view ga-app ga-movies ga-movie-player"><button class="ga-yt-video${ui.gaPaused ? ' paused' : ''}" data-action="ga-yt-toggle">${art(m.title, 'wide')}<img src="assets/ga-mv-ic_vidcontrol_${ui.gaPaused ? 'play' : 'pause'}.png" alt=""></button><h3>${e(m.title)}</h3></div>`;
    }
    const tab = ui.gaMoviesTab || 'rentals';
    const body = tab === 'rentals' ? MOVIES.map(m => `<div class="ga-movie">${art(m.title, 'poster')}<span><b>${e(m.title)}</b><small>${m.year} · ${m.mins}′</small><button data-action="ga-movie-watch" data-id="${m.id}">${e(T(lang, 'Watch'))}</button></span></div>`).join('') : `<p class="ga-empty">—</p>`;
    return `<div class="app-view ga-app ga-movies">${head('ga-movies-bar', 'play-movies', 'Play Movies', icon('ga-shop', T(lang, 'Shop'), 'ga-mv-ic_menu_shop_holo_dark'))}${tabs([['rentals', T(lang, 'My Rentals')], ['personal', T(lang, 'Personal Videos')]], tab, 'ga-movies-tab')}<div class="ga-scroll">${body}</div></div>`;
  }

  // ---- Google Search 1.4.1 (Quick Search Box) ----
  function search(ctx) {
    const {lang, data} = ctx, recent = data.gaSearches || ['nexus 4 release date', 'ice cream sandwich update', 'weather'];
    return `<div class="app-view ga-app ga-search"><form class="ga-qsb" data-form="ga-search"><img src="assets/search.png" alt=""><input name="query" autocomplete="off" placeholder="${e(T(lang, 'Google Search'))}" aria-label="${e(T(lang, 'Google Search'))}"><button type="submit" aria-label="Search"><img src="assets/ga-qsb-ic_search_normal.png" alt=""></button></form><div class="ga-scroll">${recent.map(q => `<button class="ga-suggest" data-action="ga-search-run" data-id="${e(q)}"><img src="assets/ga-qsb-ic_history_suggestion_normal.png" alt="">${e(q)}</button>`).join('')}<button class="ga-suggest ga-sources" data-action="ga-unsupported">${e(T(lang, 'Searchable items'))}</button></div></div>`;
  }

  // ---- Voice Dialer (AOSP) ----
  function voiceDialer(ctx) {
    const {ui, lang} = ctx, failed = ui.gaVoice === 'failed';
    return `<div class="app-view ga-app ga-voice"><h2>${e(T(lang, 'Voice Dialer'))}</h2><button class="ga-voice-mic" data-action="ga-voice-listen" aria-label="${e(T(lang, 'Listening…'))}"><img src="assets/ga-vd-ic_vd_${failed ? 'retry' : 'mic_on'}.png" alt=""></button><p>${e(T(lang, failed ? 'No results, try again.' : 'Listening…'))}</p><div class="ga-voice-tip"><b>${e(T(lang, 'Did you know…'))}</b><span>“Call Alex Morgan”, “Dial 202-555-0148”, “Open Calendar”</span></div></div>`;
  }

  // ---- Latitude (Maps 6.4) ----
  function latitude(ctx) {
    const {lang, data} = ctx, pins = data.contacts.slice(0, 3);
    return `<div class="app-view ga-app ga-latitude">${head('ga-lat-bar', 'latitude', T(lang, 'Latitude'), icon('ga-unsupported', T(lang, 'Check in'), 'ga-lat-actionbar_checkin'))}<div class="ga-lat-map"><svg viewBox="0 0 360 260" preserveAspectRatio="xMidYMid slice"><rect width="360" height="260" fill="#ece8df"/><path d="M-10 190c80-20 120 10 200-10s140-40 180-30v120H-10z" fill="#a9cdee"/><g stroke="#fff" stroke-width="6"><path d="M-10 90H370M120-10V270M260-10V270"/></g><path d="M-10 140C80 130 160 160 370 120" stroke="#f7d36b" stroke-width="9" fill="none"/>${pins.map((p, i) => `<g transform="translate(${80 + i * 100} ${70 + (i % 2) * 60})"><rect x="-14" y="-30" width="28" height="28" fill="#fff" stroke="#4285f4" stroke-width="2"/><text y="-11" text-anchor="middle" font-size="14" fill="#4285f4">${e(p.name.charAt(0))}</text></g>`).join('')}<circle cx="180" cy="150" r="7" fill="#4285f4" stroke="#fff" stroke-width="3"/></svg></div><div class="ga-scroll">${pins.map((p, i) => `<div class="ga-person"><img src="${AVATAR}" alt=""><span><b>${e(p.name)}</b><small>${['0.4 mi', '1.2 mi', '3 mi'][i]} · ${['5 min ago', '1 hour ago', 'Yesterday'][i]}</small></span></div>`).join('')}<button class="ga-suggest" data-action="ga-unsupported">${e(T(lang, 'Location history'))}</button></div></div>`;
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
      case 'ga-menu': ui.overlay = 'ga-menu'; ctx.renderOverlay(); break;
      case 'ga-talk-end': case 'ga-talk-end-all': ctx.closeOverlay(); ui.gaSub = ''; ctx.render(); break;
      case 'ga-talk-clear': ctx.closeOverlay(); data.talkChats = (data.talkChats || []).filter(m => String(m.contact) !== String(ui.gaChat)); ctx.save(); ctx.render(); break;
      case 'ga-yt-tab': ui.gaYtTab = id; ctx.render(); break;
      case 'ga-yt-watch': ui.gaVideo = id; ui.gaPaused = false; ui.gaYtWatchTab = 'info'; ui.gaSub = 'watch'; ctx.render(); break;
      case 'ga-yt-wtab': ui.gaYtWatchTab = id; ctx.render(); break;
      case 'ga-yt-toggle': ui.gaPaused = !ui.gaPaused; ctx.render(); break;
      // A rating is final (the buttons turn ic_like_disabled / ic_dislike_disabled) and toasts rating_like / rating_dislike.
      case 'ga-yt-rate': {
        ctx.closeOverlay(); const v = ui.gaVideo || VIDEOS[0].id; if (ytRating(data, v)) break;
        (data.gaYtRatings ||= {})[v] = id; ctx.save(); ctx.render(); ctx.toast(T(ctx.lang, id === 'like' ? 'You like this video.' : 'You dislike this video.')); break;
      }
      case 'ga-yt-plus': { const v = ui.gaVideo || VIDEOS[0].id, list = data.gaYtPlus || []; data.gaYtPlus = list.includes(v) ? list.filter(x => x !== v) : [...list, v]; ctx.save(); ctx.render(); break; }
      case 'ga-book': ui.gaBook = id; ui.gaSub = 'read'; ctx.render(); break;
      case 'ga-book-turn': { const b = BOOKS.find(x => x.id === ui.gaBook) || BOOKS[0]; data.gaBookPages ||= {}; data.gaBookPages[b.id] = ((data.gaBookPages[b.id] || 0) + 1) % b.pages.length; ctx.save(); ctx.render(); break; }
      case 'ga-movies-tab': ui.gaMoviesTab = id; ctx.render(); break;
      case 'ga-movie-watch': ui.gaMovie = id; ui.gaPaused = false; ui.gaSub = 'watch'; ctx.render(); break;
      case 'ga-shop': ctx.openApp('play-store'); break;
      case 'ga-search-run': ctx.browse(id); break;
      case 'ga-voice-listen': ctx.listen(); break;
      case 'ga-unsupported': ctx.closeOverlay(); ctx.toast('This feature is not part of the simulator.'); break;
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
  window.ICSGoogleApps = {APPS, render, handle, submit, menu};
})();
