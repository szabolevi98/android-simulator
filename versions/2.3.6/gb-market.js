/* Android Market 3.x as it ran on the Nexus S in autumn 2011 (Market is closed source; rebuilt from period material: the
   Android Developers Blog post "A New Android Market for Phones" of July 2011 with its home screenshot, Google's Nexus S
   video, Android Police's Market 3.1.3 screenshots (details page, settings) and hands-on videos of the Apps section).
   Screens: the home page (action bar with the bag, the promo banner, the Apps / Games / Books / Movies tiles with their
   colour stripes and the featured column), the sections with the swipeable CATEGORIES / FEATURED / TOP … tabs, the app
   details page (dark header, price or Open / Uninstall buttons between green rules, screenshot strip, the light info block,
   +1, Allow automatic updating, DESCRIPTION), the permissions page with "Accept & download", download progress,
   My apps, search and Settings. The catalog is the simulator's fictional one (play-store.js); 1 dp = 0.8625 px. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // Market labels in the five simulator languages (period Market wording).
  const S = {
    'Market': ['Market', 'Market', 'Market', 'Market', 'Market'],
    'Apps': ['Apps', 'Alkalmazások', 'Apps', 'Applications', 'Aplicaciones'],
    'Games': ['Games', 'Játékok', 'Spiele', 'Jeux', 'Juegos'],
    'Books': ['Books', 'Könyvek', 'Bücher', 'Livres', 'Libros'],
    'Movies': ['Movies', 'Filmek', 'Filme', 'Films', 'Películas'],
    'see more': ['see more', 'továbbiak', 'mehr', 'plus', 'ver más'],
    'CATEGORIES': ['CATEGORIES', 'KATEGÓRIÁK', 'KATEGORIEN', 'CATÉGORIES', 'CATEGORÍAS'],
    'FEATURED': ['FEATURED', 'KIEMELT', 'EMPFOHLEN', 'SÉLECTION', 'DESTACADO'],
    'TOP PAID': ['TOP PAID', 'LEGNÉPSZERŰBB FIZETŐS', 'TOP-KAUF', 'TOP PAYANTS', 'MÁS VENDIDO'],
    'TOP FREE': ['TOP FREE', 'LEGNÉPSZERŰBB INGYENES', 'TOP-GRATIS', 'TOP GRATUITS', 'GRATIS MÁS POPULARES'],
    'TOP GROSSING': ['TOP GROSSING', 'LEGNAGYOBB BEVÉTEL', 'UMSATZSTÄRKSTE', 'MEILLEURES VENTES', 'MÁS RENTABLES'],
    'TOP NEW PAID': ['TOP NEW PAID', 'ÚJ FIZETŐS', 'NEU & KOSTENPFLICHTIG', 'NOUVEAUTÉS PAYANTES', 'NOVEDADES DE PAGO'],
    'TOP NEW FREE': ['TOP NEW FREE', 'ÚJ INGYENES', 'NEU & GRATIS', 'NOUVEAUTÉS GRATUITES', 'NOVEDADES GRATUITAS'],
    'TRENDING': ['TRENDING', 'FELKAPOTT', 'IM TREND', 'TENDANCES', 'TENDENCIAS'],
    'My apps': ['My apps', 'Saját alkalmazások', 'Meine Apps', 'Mes applications', 'Mis aplicaciones'],
    'Accounts': ['Accounts', 'Fiókok', 'Konten', 'Comptes', 'Cuentas'],
    'Settings': ['Settings', 'Beállítások', 'Einstellungen', 'Paramètres', 'Ajustes'],
    'Help': ['Help', 'Súgó', 'Hilfe', 'Aide', 'Ayuda'],
    'FREE': ['FREE', 'INGYENES', 'KOSTENLOS', 'GRATUIT', 'GRATIS'],
    'Open': ['Open', 'Megnyitás', 'Öffnen', 'Ouvrir', 'Abrir'],
    'Uninstall': ['Uninstall', 'Eltávolítás', 'Deinstallieren', 'Désinstaller', 'Desinstalar'],
    'Download': ['Download', 'Letöltés', 'Herunterladen', 'Télécharger', 'Descargar'],
    'Accept & download': ['Accept & download', 'Elfogadás és letöltés', 'Akzeptieren & herunterladen', 'Accepter et télécharger', 'Aceptar y descargar'],
    'Downloading…': ['Downloading…', 'Letöltés…', 'Wird heruntergeladen…', 'Téléchargement…', 'Descargando…'],
    'Installing…': ['Installing…', 'Telepítés…', 'Wird installiert…', 'Installation…', 'Instalando…'],
    'Cancel': ['Cancel', 'Mégse', 'Abbrechen', 'Annuler', 'Cancelar'],
    'INSTALLED': ['INSTALLED', 'TELEPÍTVE', 'INSTALLIERT', 'INSTALLÉE', 'INSTALADA'],
    'DESCRIPTION': ['DESCRIPTION', 'LEÍRÁS', 'BESCHREIBUNG', 'DESCRIPTION', 'DESCRIPCIÓN'],
    'downloads': ['downloads', 'letöltés', 'Downloads', 'téléchargements', 'descargas'],
    'Size': ['Size', 'Méret', 'Größe', 'Taille', 'Tamaño'],
    'Allow automatic updating': ['Allow automatic updating', 'Automatikus frissítés engedélyezése', 'Automatisches Aktualisieren zulassen', 'Autoriser la mise à jour automatique', 'Permitir actualización automática'],
    'people +1\'d this': ['people +1\'d this', 'ember +1-ezte ezt', 'Personen haben dies mit +1 bewertet', 'personnes ont attribué un +1', 'personas han hecho +1'],
    'Permissions': ['This application has access to the following:', 'Az alkalmazás a következőkhöz fér hozzá:', 'Diese Anwendung hat Zugriff auf:', 'Cette application a accès aux éléments suivants :', 'Esta aplicación tiene acceso a:'],
    'Search Market': ['Search Market', 'Keresés a Marketen', 'Market durchsuchen', 'Rechercher dans l\'Android Market', 'Buscar en Market'],
    'No results': ['No results found.', 'Nincs találat.', 'Keine Ergebnisse.', 'Aucun résultat.', 'No se han encontrado resultados.'],
    'Notifications': ['Notifications', 'Értesítések', 'Benachrichtigungen', 'Notifications', 'Notificaciones'],
    'Notifications summary': ['Notify me about updates to apps or games that I downloaded', 'Értesítés a letöltött alkalmazások és játékok frissítéseiről', 'Über Updates heruntergeladener Apps und Spiele benachrichtigen', 'M\'informer des mises à jour des applications et des jeux téléchargés', 'Notificarme sobre actualizaciones de aplicaciones o juegos descargados'],
    'Clear search history': ['Clear search history', 'Keresési előzmények törlése', 'Suchverlauf löschen', 'Effacer l\'historique de recherche', 'Borrar historial de búsqueda'],
    'Clear search history summary': ['Remove all the searches you have performed', 'Az összes korábbi keresés eltávolítása', 'Alle bisherigen Suchanfragen entfernen', 'Supprimer toutes les recherches effectuées', 'Eliminar todas las búsquedas realizadas'],
    'User controls': ['User controls', 'Felhasználói beállítások', 'Nutzereinstellungen', 'Contrôles utilisateur', 'Controles de usuario'],
    'Content filtering': ['Content filtering', 'Tartalomszűrés', 'Inhaltsfilter', 'Filtrage du contenu', 'Filtrado de contenido'],
    'Content filtering summary': ['Set the content filtering level to restrict applications that can be downloaded.', 'A letölthető alkalmazásokat korlátozó szűrési szint beállítása.', 'Filterstufe festlegen, um herunterladbare Apps einzuschränken.', 'Définir le niveau de filtrage pour limiter les applications téléchargeables.', 'Establece el nivel de filtrado para restringir las aplicaciones que se pueden descargar.'],
    'Use PIN for purchases': ['Use PIN for purchases', 'PIN-kód a vásárlásokhoz', 'PIN für Käufe verwenden', 'Utiliser un code PIN pour les achats', 'Usar PIN para compras'],
    'Use PIN summary': ['Require PIN entry before purchasing any application or other content.', 'PIN-kód megadása minden vásárlás előtt.', 'Vor jedem Kauf die PIN abfragen.', 'Demander le code PIN avant tout achat.', 'Solicitar PIN antes de realizar cualquier compra.'],
    'Successfully installed.': ['Successfully installed.', 'Sikeresen telepítve.', 'Erfolgreich installiert.', 'Installation réussie.', 'Se ha instalado correctamente.'],
    'Unavailable': ['Not available in this simulator', 'Ebben a szimulátorban nem érhető el', 'In diesem Simulator nicht verfügbar', 'Non disponible dans ce simulateur', 'No disponible en este simulador']
  };
  const LANGS = ['en', 'hu', 'de', 'fr', 'es'];
  const text = (lang, key) => (S[key] || [key])[Math.max(0, LANGS.indexOf(lang))] ?? key;
  // Market 3 colour coding: green for apps and games, blue for books, red for movies.
  const SECTIONS = [['apps', 'Apps', '#a4c639'], ['games', 'Games', '#8cba2e'], ['books', 'Books', '#3d8fd6'], ['movies', 'Movies', '#d8473e']];
  const TABS = ['CATEGORIES', 'FEATURED', 'TOP PAID', 'TOP FREE', 'TOP GROSSING', 'TOP NEW PAID', 'TOP NEW FREE', 'TRENDING'];
  // Books and movies of the period sections: public-domain classics and fictional films.
  const EXTRA = [
    {id: 'lunar-golf', kind: 'games', art: 'golf', name: 'Lunar Golf', developer: 'Crater Games', rating: 4.4, price: '$0.99', size: '9.8MB', description: 'Eighteen holes in low gravity.'},
    {id: 'pocket-planner', kind: 'apps', art: 'planner', name: 'Pocket Planner', developer: 'Quiet Tools', rating: 4.3, price: '$1.99', size: '1.6MB', description: 'Plan your week on one simple page.'},
    {id: 'book-pride', kind: 'books', name: 'Pride and Prejudice', developer: 'Jane Austen', rating: 4.6, price: 'FREE', colors: ['#5d4a3a', '#c9b48a']},
    {id: 'book-holmes', kind: 'books', name: 'The Adventures of Sherlock Holmes', developer: 'Arthur Conan Doyle', rating: 4.7, price: 'FREE', colors: ['#28323c', '#a7b4bd']},
    {id: 'book-alice', kind: 'books', name: 'Alice\'s Adventures in Wonderland', developer: 'Lewis Carroll', rating: 4.5, price: 'FREE', colors: ['#3a5f8a', '#f0d48a']},
    {id: 'movie-orbit', kind: 'movies', name: 'Orbit Hopper: The Movie', developer: 'Animation', rating: 4.1, price: '$3.99', colors: ['#141c3a', '#8f7fff']},
    {id: 'movie-quiet', kind: 'movies', name: 'A Quiet Afternoon', developer: 'Drama', rating: 3.9, price: '$2.99', colors: ['#3a2a1c', '#e0a868']}
  ];
  // The simulator's fictional apps; installed ones are the simulator's own (system) apps plus anything installed here.
  const catalog = () => (window.ICSPlayStore?.catalog || []).map((item, i) => ({...item, kind: item.category === 'Games' ? 'games' : 'apps', price: 'FREE', downloads: ['10,000,000+', '1,000,000+', '500,000+', '100,000+'][i % 4], votes: 12000 + i * 4173, updated: ['September 21, 2011', 'September 2, 2011', 'August 18, 2011', 'July 30, 2011'][i % 4], plus: 120 + i * 37}));
  const all = () => [...catalog(), ...EXTRA.map(item => ({downloads: '50,000+', votes: 812, plus: 46, updated: 'August 1, 2011', size: item.kind === 'books' ? '1.2MB' : '820MB', description: item.kind === 'books' ? 'A classic, free from Google eBooks.' : 'Rent and watch within 30 days.', ...item}))];
  const find = id => all().find(item => item.id === id);
  const installedState = (item, ctx) => item.app ? 'installed' : ctx.installed.includes(item.id) ? 'installed' : ctx.downloading === item.id ? ctx.phase : '';
  const stars = rating => `<span class="gbmk-stars" aria-label="${rating}">${[1, 2, 3, 4, 5].map(n => `<i class="${rating >= n - .25 ? 'on' : rating >= n - .75 ? 'half' : ''}"></i>`).join('')}</span>`;
  // Product art: the app icon, a drawn icon for the fictional apps, or a book / film cover in the item's colours.
  const ICONS = {
    orbit: '<svg viewBox="0 0 48 48"><defs><radialGradient id="p" cx=".35" cy=".3"><stop offset="0" stop-color="#ffd27a"/><stop offset="1" stop-color="#d0631e"/></radialGradient></defs><rect x="2" y="2" width="44" height="44" rx="9" fill="#152049"/><circle cx="12" cy="12" r="1" fill="#fff"/><circle cx="37" cy="9" r="1.2" fill="#fff"/><circle cx="38" cy="36" r=".9" fill="#fff"/><circle cx="24" cy="25" r="10" fill="url(#p)"/><ellipse cx="24" cy="25" rx="18" ry="5" fill="none" stroke="#9fd8ff" stroke-width="2.2" transform="rotate(-18 24 25)"/></svg>',
    blocks: '<svg viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#2b2b2b"/><g stroke="#0006" stroke-width="1"><rect x="8" y="26" width="10" height="10" fill="#ff5a4e"/><rect x="18" y="26" width="10" height="10" fill="#ffc533"/><rect x="28" y="26" width="10" height="10" fill="#45c1ff"/><rect x="18" y="16" width="10" height="10" fill="#7bd448"/><rect x="28" y="16" width="10" height="10" fill="#b77bff"/><rect x="28" y="6" width="10" height="10" fill="#ff8bc4"/></g></svg>',
    golf: '<svg viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#0c1022"/><circle cx="24" cy="40" r="20" fill="#b9bfd0"/><circle cx="17" cy="33" r="3" fill="#8e95aa"/><circle cx="31" cy="36" r="2" fill="#8e95aa"/><path d="M28 30V10l9 4-9 4" fill="#e04848" stroke="#ddd" stroke-width="1.2"/><circle cx="16" cy="24" r="2.4" fill="#fff"/></svg>',
    planner: '<svg viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#2a6fbd"/><rect x="10" y="12" width="28" height="26" rx="2" fill="#fff"/><rect x="10" y="12" width="28" height="7" rx="2" fill="#e8453c"/><g fill="#9aa7b5"><rect x="14" y="23" width="5" height="4"/><rect x="21" y="23" width="5" height="4"/><rect x="28" y="23" width="5" height="4"/><rect x="14" y="30" width="5" height="4"/><rect x="21" y="30" width="5" height="4"/></g><path d="M28 31l3 3 6-7" fill="none" stroke="#3da543" stroke-width="2.4"/></svg>'
  };
  const art = (item, cls = 'gbmk-icon') => item.app ? `<img class="${cls}" src="assets/${item.app}.png" alt="">`
    : ICONS[item.art] ? `<i class="${cls} gbmk-svg" aria-hidden="true">${ICONS[item.art]}</i>`
    : `<i class="${cls} gbmk-cover ${item.kind || ''}" style="--a:${(item.colors || ['#2f4f6f', '#8fc0e8'])[0]};--b:${(item.colors || ['#2f4f6f', '#8fc0e8'])[1]}" aria-hidden="true"><b>${e((item.name || '?').slice(0, 1))}</b></i>`;
  const price = (item, ctx) => item.price === 'FREE' ? text(ctx.lang, 'FREE') : item.price;
  const header = (ctx, title, back = true) => `<div class="gbmk-bar">${back ? '<button class="gbmk-up" data-action="back" aria-label="Back"><span>‹</span><img src="assets/play-store.svg?v=3" alt=""></button>' : '<span class="gbmk-up root"><img src="assets/play-store.svg?v=3" alt=""></span>'}${title ? `<b>${e(title)}</b>` : '<b></b>'}${ctx.share ? '<button class="gbmk-share" data-action="gbset-toast" data-id="Unavailable in this simulator" aria-label="Share"></button>' : ''}<button class="gbmk-search" data-action="gbmk-search" aria-label="${e(text(ctx.lang, 'Search Market'))}"></button></div>`;

  function home(ctx) {
    const T = key => text(ctx.lang, key), items = all(), promo = items.find(i => i.id === 'orbit') || items[0];
    const featured = [items.find(i => i.id === 'blocks'), EXTRA[1], EXTRA[3], items.find(i => i.id === 'camera')].filter(Boolean).map(i => find(i.id));
    const tiles = SECTIONS.map(([id, label, color]) => `<button class="gbmk-tile ${id}" style="--c:${color}" data-action="gbmk-section" data-id="${id}"><b>${e(T(label))}</b><i class="gbmk-mark ${id}"></i><small>${e(T('see more'))} ›</small></button>`).join('');
    const cards = featured.map(item => `<button class="gbmk-card" style="--c:${SECTIONS.find(s => s[0] === item.kind)?.[2] || '#a4c639'}" data-action="gbmk-detail" data-id="${e(item.id)}">${art(item, 'gbmk-card-art')}<span><b>${e(item.name)}</b><small>${e(item.developer)}</small><span class="gbmk-card-foot">${stars(item.rating)}<em>${e(price(item, ctx))}</em></span></span></button>`).join('');
    return `<div class="app-view gbmk gbmk-home" data-no-translate>${header(ctx, T('Market'), false)}<div class="gbmk-scroll"><button class="gbmk-promo" data-action="gbmk-detail" data-id="${e(promo.id)}" style="--a:#0e1630;--b:#4a64c8"><span class="gbmk-promo-stars"></span><b>${e(promo.name)}</b><small>${e(promo.description || '')}</small></button><div class="gbmk-columns"><div class="gbmk-tiles">${tiles}</div><div class="gbmk-cards">${cards}</div></div></div></div>`;
  }
  // A section with the ViewPager tab strip (the current tab centred, its neighbours at the edges).
  function section(ctx) {
    const T = key => text(ctx.lang, key), [id, label, color] = SECTIONS.find(s => s[0] === ctx.section) || SECTIONS[0];
    const tabs = id === 'apps' || id === 'games' ? TABS : TABS.filter(t => t !== 'TOP GROSSING' && t !== 'TOP NEW PAID' && t !== 'TOP NEW FREE' && t !== 'TRENDING');
    const tab = tabs.includes(ctx.tab) ? ctx.tab : 'FEATURED', i = tabs.indexOf(tab);
    const strip = `<div class="gbmk-tabs" style="--c:${color}" data-gbmk-swipe><button data-action="gbmk-tab" data-id="${e(tabs[i - 1] || '')}"${i ? '' : ' disabled'}>${i ? e(T(tabs[i - 1])) : ''}</button><b>${e(T(tab))}</b><button data-action="gbmk-tab" data-id="${e(tabs[i + 1] || '')}"${i < tabs.length - 1 ? '' : ' disabled'}>${i < tabs.length - 1 ? e(T(tabs[i + 1])) : ''}</button></div>`;
    const items = all().filter(item => item.kind === id);
    let body;
    if (tab === 'CATEGORIES') {
      const cats = id === 'games' ? ['Arcade & Action', 'Brain & Puzzle', 'Cards & Casino', 'Casual', 'Racing', 'Sports Games'] : id === 'apps' ? ['Books & Reference', 'Business', 'Communication', 'Entertainment', 'Music & Audio', 'Photography', 'Productivity', 'Tools'] : id === 'books' ? ['Fiction', 'Classics', 'Mystery'] : ['Animation', 'Drama', 'Family'];
      body = `<div class="gbmk-list">${cats.map(c => `<button class="gbmk-cat" data-action="gbmk-tab" data-id="TOP FREE">${e(c)}</button>`).join('')}</div>`;
    } else if (tab === 'FEATURED') {
      const lead = items[0], rest = items.slice(1, 5);
      body = lead ? `<div class="gbmk-featured"><button class="gbmk-banner" data-action="gbmk-detail" data-id="${e(lead.id)}" style="--a:${(lead.colors || ['#13301a'])[0]};--b:${color}">${art(lead, 'gbmk-banner-art')}<b>${e(lead.name)}</b></button><div class="gbmk-grid">${rest.map(item => `<button class="gbmk-gridtile" data-action="gbmk-detail" data-id="${e(item.id)}">${art(item, 'gbmk-tile-art')}<span><b>${e(item.name)}</b>${stars(item.rating)}</span></button>`).join('')}<button class="gbmk-gridtile pick" style="--c:${color}" data-action="gbmk-tab" data-id="TOP FREE"><b>${e(T('TOP FREE'))}</b><i class="gbmk-mark ${id}"></i></button></div></div>` : '';
    } else {
      const sorted = [...items].sort((a, b) => tab === 'TRENDING' ? a.name.localeCompare(b.name) : b.rating - a.rating).filter(item => tab.includes('PAID') ? item.price !== 'FREE' : tab.includes('FREE') ? item.price === 'FREE' : true);
      body = sorted.length ? `<div class="gbmk-list">${sorted.map(item => row(item, ctx)).join('')}</div>` : `<p class="gbmk-empty">${e(T('No results'))}</p>`;
    }
    return `<div class="app-view gbmk" data-no-translate>${header(ctx, T(label))}${strip}<div class="gbmk-scroll">${body}</div></div>`;
  }
  // List rows: icon, bold title, developer, stars and the price (or INSTALLED).
  function row(item, ctx) {
    const state = installedState(item, ctx);
    return `<button class="gbmk-row" data-action="gbmk-detail" data-id="${e(item.id)}">${art(item)}<span class="gbmk-row-copy"><b>${e(item.name)}</b><small>${e(item.developer)}</small>${stars(item.rating)}</span><em class="${state === 'installed' ? 'installed' : ''}">${e(state === 'installed' ? text(ctx.lang, 'INSTALLED') : price(item, ctx))}</em></button>`;
  }
  function detail(ctx) {
    const T = key => text(ctx.lang, key), item = find(ctx.selected);
    if (!item) return home(ctx);
    const state = installedState(item, ctx);
    let actions;
    if (state === 'installed') actions = `<div class="gbmk-actions"><button data-action="gbmk-open" data-id="${e(item.id)}">${e(T('Open'))}</button><button data-action="gbmk-uninstall" data-id="${e(item.id)}"${item.app ? ' disabled' : ''}>${e(T('Uninstall'))}</button></div>`;
    else if (state === 'downloading' || state === 'installing') actions = `<div class="gbmk-actions progress"><div><span>${e(T(state === 'installing' ? 'Installing…' : 'Downloading…'))}</span><i class="gbmk-progress"><b style="width:${state === 'installing' ? 100 : Math.round(ctx.progress * 100)}%"></b></i></div><button data-action="gbmk-cancel">${e(T('Cancel'))}</button></div>`;
    else actions = '';
    const priceButton = state ? '' : `<button class="gbmk-price" data-action="gbmk-buy" data-id="${e(item.id)}">${e(price(item, ctx))}</button>`;
    const shots = [0, 1, 2].map(n => `<span class="gbmk-shot n${n}" style="--a:${(item.colors || ['#2a3a4a', '#a4c639'])[0]};--b:${(item.colors || ['#2a3a4a', '#a4c639'])[1]}">${art(item, 'gbmk-shot-art')}</span>`).join('');
    return `<div class="app-view gbmk gbmk-detail" data-no-translate>${header({...ctx, share: true}, '')}<div class="gbmk-scroll">
      <div class="gbmk-head">${art(item, 'gbmk-head-art')}<span><b>${e(item.name)}</b><small>${e(item.developer.toUpperCase())}</small></span>${priceButton}</div>
      ${actions ? `<i class="gbmk-rule"></i>${actions}<i class="gbmk-rule"></i>` : '<i class="gbmk-rule"></i>'}
      <div class="gbmk-shots" data-gbmk-shots>${shots}</div>
      <div class="gbmk-info"><div class="gbmk-info-row"><span>${stars(item.rating)} <small>${item.votes.toLocaleString(ctx.locale)}</small></span><span>${e(item.updated)}</span></div><div class="gbmk-info-row"><span>${e(item.downloads)} ${e(T('downloads'))}</span><span>${e(T('Size'))}: ${e(item.size || '')}</span></div>
      <div class="gbmk-plus"><button data-action="gbmk-plus" data-id="${e(item.id)}" class="${ctx.plussed.includes(item.id) ? 'on' : ''}">+1</button><span>${item.plus + (ctx.plussed.includes(item.id) ? 1 : 0)} ${e(T('people +1\'d this'))}</span></div>
      ${state === 'installed' && !item.app ? `<label class="gbmk-auto"><input type="checkbox" data-gbmk-auto="${e(item.id)}"${ctx.autoUpdate.includes(item.id) ? ' checked' : ''}><span>${e(T('Allow automatic updating'))}</span></label>` : ''}
      <div class="gbmk-desc"><h4>${e(T('DESCRIPTION'))}</h4><p>${e(item.description || '')}</p></div></div></div></div>`;
  }
  // The permissions screen of the purchase flow.
  function permissions(ctx) {
    const T = key => text(ctx.lang, key), item = find(ctx.selected);
    const groups = item.kind === 'games' ? [['Network communication', 'full Internet access'], ['Hardware controls', 'control vibrator']] : [['Network communication', 'full Internet access'], ['Storage', 'modify/delete USB storage contents']];
    return `<div class="app-view gbmk gbmk-perms" data-no-translate>${header(ctx, '')}<div class="gbmk-head">${art(item, 'gbmk-head-art')}<span><b>${e(item.name)}</b><small>${e(item.developer.toUpperCase())}</small></span></div><i class="gbmk-rule"></i><div class="gbmk-scroll"><p class="gbmk-perm-intro">${e(T('Permissions'))}</p>${groups.map(([g, d]) => `<div class="gbmk-perm"><img src="assets/gb-ic_bullet_key_permission.png" alt=""><span><b>${e(g)}</b><small>${e(d)}</small></span></div>`).join('')}</div><div class="gbmk-accept"><button data-action="gbmk-accept" data-id="${e(item.id)}">${e(T('Accept & download'))}</button></div></div>`;
  }
  function myApps(ctx) {
    const items = all().filter(item => installedState(item, ctx) === 'installed');
    return `<div class="app-view gbmk" data-no-translate>${header(ctx, text(ctx.lang, 'My apps'))}<div class="gbmk-scroll"><div class="gbmk-list">${items.map(item => row(item, ctx)).join('')}</div></div></div>`;
  }
  function search(ctx) {
    const q = String(ctx.query || '').trim().toLocaleLowerCase(ctx.locale), items = q ? all().filter(item => `${item.name} ${item.developer}`.toLocaleLowerCase(ctx.locale).includes(q)) : [];
    return `<div class="app-view gbmk" data-no-translate>${header(ctx, `"${ctx.query || ''}"`)}<div class="gbmk-scroll">${items.length ? `<div class="gbmk-list">${items.map(item => row(item, ctx)).join('')}</div>` : `<p class="gbmk-empty">${e(text(ctx.lang, 'No results'))}</p>`}</div></div>`;
  }
  // Settings (Android Police, Market 3.1.3): Notifications, Clear search history, User controls.
  function settings(ctx) {
    const T = key => text(ctx.lang, key), s = ctx.prefs;
    const chk = (key, title, summary) => `<button class="gbset-row" data-action="gbmk-pref" data-id="${key}" role="checkbox" aria-checked="${!!s[key]}"><span class="gbset-text"><span class="gbset-title">${e(T(title))}</span><span class="gbset-sum">${e(T(summary))}</span></span><img class="gbset-check" src="assets/gb-btn_check_${s[key] ? 'on' : 'off'}.png" alt=""></button>`;
    return `<div class="app-view gbset gbmk-settings" data-no-translate>${header(ctx, T('Settings'))}<div class="gbmk-scroll">${chk('notify', 'Notifications', 'Notifications summary')}<button class="gbset-row" data-action="gbmk-clear-history"><span class="gbset-text"><span class="gbset-title">${e(T('Clear search history'))}</span><span class="gbset-sum">${e(T('Clear search history summary'))}</span></span></button><div class="gbset-cat">${e(T('User controls'))}</div><button class="gbset-row" data-action="gbset-toast" data-id="Unavailable in this simulator"><span class="gbset-text"><span class="gbset-title">${e(T('Content filtering'))}</span><span class="gbset-sum">${e(T('Content filtering summary'))}</span></span></button>${chk('pin', 'Use PIN for purchases', 'Use PIN summary')}</div></div>`;
  }
  // The framework SearchDialog over the Market (search_plate_global with the Market icon), suggestions from the catalog.
  function searchDialog(ctx) {
    const T = key => text(ctx.lang, key), q = String(ctx.editValue || '').trim().toLocaleLowerCase(ctx.locale);
    const sugg = q ? all().filter(item => item.name.toLocaleLowerCase(ctx.locale).includes(q)).slice(0, 4) : ctx.history.slice(0, 4).map(h => ({id: '', name: h}));
    return `<div class="gbbr-search-scrim" data-action="gbmk-search-cancel"></div><form class="gbbr-search" data-form="gbmk-search"><div class="gbbr-search-row"><img class="gbbr-search-app" src="assets/play-store.svg?v=3" alt=""><input name="query" autocomplete="off" aria-label="${e(T('Search Market'))}" placeholder="${e(T('Search Market'))}" value="${e(ctx.editValue || '')}"><button class="gbbr-go" type="submit" aria-label="Go"><img src="assets/gb-ic_btn_search_go.png" alt=""></button></div><div class="gbbr-suggest">${sugg.map(s => `<button type="button" class="gbbr-suggestion" data-action="${s.id ? 'gbmk-detail' : 'gbmk-search-run'}" data-id="${e(s.id || s.name)}"><img src="assets/${s.id ? 'gb-ic_search_category_default.png' : 'gb-br-ic_search_category_history.png'}" alt=""><span><b>${e(s.name)}</b></span></button>`).join('')}</div></form>`;
  }
  function render(ctx) {
    let html;
    if (ctx.page === 'section') html = section(ctx);
    else if (ctx.page === 'detail') html = detail(ctx);
    else if (ctx.page === 'permissions') html = permissions(ctx);
    else if (ctx.page === 'my-apps') html = myApps(ctx);
    else if (ctx.page === 'search') html = search(ctx);
    else if (ctx.page === 'settings') html = settings(ctx);
    else html = home(ctx);
    return ctx.searching ? html.replace(/<\/div>$/, `${searchDialog(ctx)}</div>`) : html;
  }
  // Menu on the Market pages: My apps, Accounts, Settings, Help.
  function menu(ctx) {
    const T = key => text(ctx.lang, key);
    if (ctx.page === 'permissions' || ctx.page === 'settings') return [];
    return [{action: 'gbmk-my-apps', title: T('My apps'), icon: 'gb-ic_menu_archive.png'}, {action: 'gbset-toast', id: 'Unavailable in this simulator', title: T('Accounts'), icon: 'ic_menu_account_list'}, {action: 'gbmk-settings', title: T('Settings'), icon: 'ic_menu_preferences'}, {action: 'gbset-toast', id: 'Unavailable in this simulator', title: T('Help'), icon: 'ic_menu_help'}];
  }
  window.GBMarket = {SECTIONS, TABS, EXTRA, text, all, find, installedState, render, menu};
})();
