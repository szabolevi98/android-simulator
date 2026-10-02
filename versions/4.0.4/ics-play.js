/* Google Play Store 3.5 as it ran on the Galaxy Nexus in spring 2012 (closed source; rebuilt from period material: the
   Android Police captures of 3.5.15 (16 March 2012: the tabbed My apps, the review histogram and its Sort reviews /
   Options dialogs), 3.5.16 and 3.5.19 (the Google Play home, My apps, Settings), and 3.8.15 on an ICS phone for the
   Holo parts: the overflow button in the action bar, the Holo checkboxes and the upper-case preference headers).
   Screens: the home page (dark action bar with the Play bag, the promo banner, the Apps / Music / Books / Movies tiles
   with their colour stripes beside the Games tile and the featured column, further banners), the Apps, Games, Music,
   Books and Movies sections with the swipeable tab strip, light list rows, the details page with REVIEWS, the
   permissions page with "Accept & download", My apps (INSTALLED / ALL), search and Settings. The catalog is the
   simulator's fictional one (play-store.js). 1 dp = 0.85 px on the 306 px wide Galaxy Nexus screen. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // Play Store labels in the five simulator languages.
  const S = {
    'Google Play': ['Google Play', 'Google Play', 'Google Play', 'Google Play', 'Google Play'],
    'Apps': ['Apps', 'Alkalmazások', 'Apps', 'Applications', 'Aplicaciones'],
    'Games': ['Games', 'Játékok', 'Spiele', 'Jeux', 'Juegos'],
    'Music': ['Music', 'Zene', 'Musik', 'Musique', 'Música'],
    'Books': ['Books', 'Könyvek', 'Bücher', 'Livres', 'Libros'],
    'Movies': ['Movies', 'Filmek', 'Filme', 'Films', 'Películas'],
    'see more': ['see more', 'továbbiak', 'mehr', 'plus', 'ver más'],
    'CATEGORIES': ['CATEGORIES', 'KATEGÓRIÁK', 'KATEGORIEN', 'CATÉGORIES', 'CATEGORÍAS'],
    'GENRES': ['GENRES', 'MŰFAJOK', 'GENRES', 'GENRES', 'GÉNEROS'],
    'FEATURED': ['FEATURED', 'KIEMELT', 'EMPFOHLEN', 'SÉLECTION', 'DESTACADO'],
    'TOP PAID': ['TOP PAID', 'LEGNÉPSZERŰBB FIZETŐS', 'TOP-KAUF', 'TOP PAYANTS', 'MÁS VENDIDO'],
    'TOP FREE': ['TOP FREE', 'LEGNÉPSZERŰBB INGYENES', 'TOP-GRATIS', 'TOP GRATUITS', 'GRATIS MÁS POPULARES'],
    'TOP GROSSING': ['TOP GROSSING', 'LEGNAGYOBB BEVÉTEL', 'UMSATZSTÄRKSTE', 'MEILLEURES VENTES', 'MÁS RENTABLES'],
    'TOP NEW PAID': ['TOP NEW PAID', 'ÚJ FIZETŐS', 'NEU & KOSTENPFLICHTIG', 'NOUVEAUTÉS PAYANTES', 'NOVEDADES DE PAGO'],
    'TOP NEW FREE': ['TOP NEW FREE', 'ÚJ INGYENES', 'NEU & GRATIS', 'NOUVEAUTÉS GRATUITES', 'NOVEDADES GRATUITAS'],
    'TRENDING': ['TRENDING', 'FELKAPOTT', 'IM TREND', 'TENDANCES', 'TENDENCIAS'],
    'TOP ALBUMS': ['TOP ALBUMS', 'LEGNÉPSZERŰBB ALBUMOK', 'TOP-ALBEN', 'TOP ALBUMS', 'ÁLBUMES MÁS POPULARES'],
    'TOP SONGS': ['TOP SONGS', 'LEGNÉPSZERŰBB DALOK', 'TOP-SONGS', 'TOP TITRES', 'CANCIONES MÁS POPULARES'],
    'NEW RELEASES': ['NEW RELEASES', 'ÚJDONSÁGOK', 'NEUERSCHEINUNGEN', 'NOUVEAUTÉS', 'NOVEDADES'],
    'TOP SELLING': ['TOP SELLING', 'LEGKELENDŐBB', 'BESTSELLER', 'MEILLEURES VENTES', 'MÁS VENDIDOS'],
    'My apps': ['My apps', 'Saját alkalmazások', 'Meine Apps', 'Mes applications', 'Mis aplicaciones'],
    'Accounts': ['Accounts', 'Fiókok', 'Konten', 'Comptes', 'Cuentas'],
    'Settings': ['Settings', 'Beállítások', 'Einstellungen', 'Paramètres', 'Ajustes'],
    'Help': ['Help', 'Súgó', 'Hilfe', 'Aide', 'Ayuda'],
    'FREE': ['FREE', 'INGYENES', 'KOSTENLOS', 'GRATUIT', 'GRATIS'],
    'Free': ['Free', 'Ingyenes', 'Kostenlos', 'Gratuite', 'Gratis'],
    'Installed': ['Installed', 'Telepítve', 'Installiert', 'Installée', 'Instalada'],
    'INSTALLED': ['INSTALLED', 'TELEPÍTVE', 'INSTALLIERT', 'INSTALLÉES', 'INSTALADAS'],
    'ALL': ['ALL', 'ÖSSZES', 'ALLE', 'TOUTES', 'TODAS'],
    'Up to date': ['Up to date', 'Naprakész', 'Auf dem neuesten Stand', 'À jour', 'Actualizadas'],
    'Open': ['Open', 'Megnyitás', 'Öffnen', 'Ouvrir', 'Abrir'],
    'Uninstall': ['Uninstall', 'Eltávolítás', 'Deinstallieren', 'Désinstaller', 'Desinstalar'],
    'Accept & download': ['Accept & download', 'Elfogadás és letöltés', 'Akzeptieren & herunterladen', 'Accepter et télécharger', 'Aceptar y descargar'],
    'Downloading…': ['Downloading…', 'Letöltés…', 'Wird heruntergeladen…', 'Téléchargement…', 'Descargando…'],
    'Installing…': ['Installing…', 'Telepítés…', 'Wird installiert…', 'Installation…', 'Instalando…'],
    'Cancel': ['Cancel', 'Mégse', 'Abbrechen', 'Annuler', 'Cancelar'],
    'OK': ['OK', 'OK', 'OK', 'OK', 'Aceptar'],
    'DESCRIPTION': ['DESCRIPTION', 'LEÍRÁS', 'BESCHREIBUNG', 'DESCRIPTION', 'DESCRIPCIÓN'],
    'REVIEWS': ['REVIEWS', 'VÉLEMÉNYEK', 'REZENSIONEN', 'AVIS', 'OPINIONES'],
    'Average': ['Average', 'Átlag', 'Durchschnitt', 'Moyenne', 'Media'],
    'stars': ['%d stars', '%d csillag', '%d Sterne', '%d étoiles', '%d estrellas'],
    'star': ['%d star', '%d csillag', '%d Stern', '%d étoile', '%d estrella'],
    'Most helpful first': ['Most helpful first', 'Leghasznosabbak elöl', 'Hilfreichste zuerst', 'Les plus utiles en premier', 'Las más útiles primero'],
    'Newest first': ['Newest first', 'Legújabbak elöl', 'Neueste zuerst', 'Les plus récents en premier', 'Las más recientes primero'],
    'Options': ['Options', 'Opciók', 'Optionen', 'Options', 'Opciones'],
    'Sort reviews': ['Sort reviews', 'Vélemények rendezése', 'Rezensionen sortieren', 'Trier les avis', 'Ordenar opiniones'],
    'Latest version only': ['Latest version only', 'Csak a legújabb verzió', 'Nur neueste Version', 'Dernière version uniquement', 'Solo la última versión'],
    'From this type of phone only': ['From this type of phone only', 'Csak ilyen típusú telefonról', 'Nur von diesem Telefontyp', 'Uniquement de ce type de téléphone', 'Solo de este tipo de teléfono'],
    'downloads': ['downloads', 'letöltés', 'Downloads', 'téléchargements', 'descargas'],
    'Size': ['Size', 'Méret', 'Größe', 'Taille', 'Tamaño'],
    'Allow automatic updating': ['Allow automatic updating', 'Automatikus frissítés engedélyezése', 'Automatisches Aktualisieren zulassen', 'Autoriser la mise à jour automatique', 'Permitir actualización automática'],
    'people +1\'d this': ['people +1\'d this', 'ember +1-ezte ezt', 'Personen haben dies mit +1 bewertet', 'personnes ont attribué un +1', 'personas han hecho +1'],
    'Permissions': ['This application has access to the following:', 'Az alkalmazás a következőkhöz fér hozzá:', 'Diese Anwendung hat Zugriff auf:', 'Cette application a accès aux éléments suivants :', 'Esta aplicación tiene acceso a:'],
    'Search Google Play': ['Search Google Play', 'Keresés a Google Playen', 'Google Play durchsuchen', 'Rechercher sur Google Play', 'Buscar en Google Play'],
    'No results': ['No results found.', 'Nincs találat.', 'Keine Ergebnisse.', 'Aucun résultat.', 'No se han encontrado resultados.'],
    'General': ['General', 'Általános', 'Allgemein', 'Général', 'General'],
    'Notifications': ['Notifications', 'Értesítések', 'Benachrichtigungen', 'Notifications', 'Notificaciones'],
    'Notifications summary': ['Notify me about updates to apps or games that I downloaded', 'Értesítés a letöltött alkalmazások és játékok frissítéseiről', 'Über Updates heruntergeladener Apps und Spiele benachrichtigen', 'M\'informer des mises à jour des applications et des jeux téléchargés', 'Notificarme sobre actualizaciones de aplicaciones o juegos descargados'],
    'Auto-update apps': ['Auto-update apps', 'Alkalmazások automatikus frissítése', 'Apps automatisch aktualisieren', 'Mise à jour automatique des applications', 'Actualizar aplicaciones automáticamente'],
    'Auto-update summary': ['Automatically update apps by default', 'Az alkalmazások alapértelmezett automatikus frissítése', 'Apps standardmäßig automatisch aktualisieren', 'Mettre à jour automatiquement les applications par défaut', 'Actualizar automáticamente las aplicaciones de forma predeterminada'],
    'Update over Wi-Fi only': ['Update over Wi-Fi only', 'Frissítés csak Wi-Fi-n', 'Updates nur über WLAN', 'Mise à jour via Wi-Fi uniquement', 'Actualizar solo a través de Wi-Fi'],
    'Wi-Fi summary': ['Conserves data usage', 'Csökkenti az adatforgalmat', 'Spart Datenvolumen', 'Réduit la consommation de données', 'Reduce el uso de datos'],
    'Auto-add widgets': ['Auto-add widgets', 'Modulok automatikus hozzáadása', 'Widgets automatisch hinzufügen', 'Ajout automatique de widgets', 'Añadir widgets automáticamente'],
    'Widgets summary': ['Automatically add Home screen widgets for new apps', 'Kezdőképernyő-modulok automatikus hozzáadása új alkalmazásokhoz', 'Startbildschirm-Widgets für neue Apps automatisch hinzufügen', 'Ajouter automatiquement les widgets des nouvelles applications à l\'écran d\'accueil', 'Añadir automáticamente widgets a la pantalla de inicio para nuevas aplicaciones'],
    'Clear search history': ['Clear search history', 'Keresési előzmények törlése', 'Suchverlauf löschen', 'Effacer l\'historique de recherche', 'Borrar historial de búsqueda'],
    'Clear search history summary': ['Remove all the searches you have performed', 'Az összes korábbi keresés eltávolítása', 'Alle bisherigen Suchanfragen entfernen', 'Supprimer toutes les recherches effectuées', 'Eliminar todas las búsquedas realizadas'],
    'User controls': ['User controls', 'Felhasználói beállítások', 'Nutzereinstellungen', 'Contrôles utilisateur', 'Controles de usuario'],
    'Content filtering': ['Content filtering', 'Tartalomszűrés', 'Inhaltsfilter', 'Filtrage du contenu', 'Filtrado de contenido'],
    'Content filtering summary': ['Set the content filtering level to restrict apps that can be downloaded', 'A letölthető alkalmazásokat korlátozó szűrési szint beállítása', 'Filterstufe festlegen, um herunterladbare Apps einzuschränken', 'Définir le niveau de filtrage pour limiter les applications téléchargeables', 'Establece el nivel de filtrado para restringir las aplicaciones que se pueden descargar'],
    'Use PIN for purchases': ['Use PIN for purchases', 'PIN-kód a vásárlásokhoz', 'PIN für Käufe verwenden', 'Utiliser un code PIN pour les achats', 'Usar PIN para compras'],
    'Use PIN summary': ['Require PIN before purchasing apps or other content', 'PIN-kód megadása alkalmazások vagy más tartalmak vásárlása előtt', 'Vor dem Kauf von Apps oder anderen Inhalten die PIN abfragen', 'Demander le code PIN avant l\'achat d\'applications ou d\'autres contenus', 'Solicitar PIN antes de comprar aplicaciones u otro contenido'],
    'Set or change PIN': ['Set or change PIN', 'PIN-kód beállítása vagy módosítása', 'PIN festlegen oder ändern', 'Définir ou modifier le code PIN', 'Establecer o cambiar PIN'],
    'Set PIN summary': ['Create a PIN to prevent changes to user controls', 'PIN-kód a felhasználói beállítások módosításának megakadályozásához', 'PIN erstellen, um Änderungen an den Nutzereinstellungen zu verhindern', 'Créer un code PIN pour empêcher la modification des contrôles utilisateur', 'Crea un PIN para evitar cambios en los controles de usuario'],
    'Other': ['Other', 'Egyéb', 'Sonstiges', 'Autres', 'Otros'],
    'Google AdMob Ads': ['Google AdMob Ads', 'Google AdMob-hirdetések', 'Google AdMob-Anzeigen', 'Annonces Google AdMob', 'Anuncios de Google AdMob'],
    'AdMob summary': ['Personalize ads based on my interests', 'Hirdetések személyre szabása az érdeklődésem alapján', 'Anzeigen auf meine Interessen abstimmen', 'Personnaliser les annonces en fonction de mes centres d\'intérêt', 'Personalizar anuncios según mis intereses'],
    'About': ['About', 'Névjegy', 'Über', 'À propos', 'Acerca de'],
    'Open source licenses': ['Open source licenses', 'Nyílt forráskódú licencek', 'Open-Source-Lizenzen', 'Licences open source', 'Licencias de código abierto'],
    'Licenses summary': ['License details for open source software', 'Nyílt forráskódú szoftverek licencrészletei', 'Lizenzdetails für Open-Source-Software', 'Informations sur les licences des logiciels libres', 'Detalles de licencias de software libre'],
    'Build version': ['Build version', 'Build-verzió', 'Build-Version', 'Version de build', 'Versión de compilación'],
    'Version': ['Version: %s', 'Verzió: %s', 'Version: %s', 'Version : %s', 'Versión: %s'],
    'Successfully installed.': ['Successfully installed.', 'Sikeresen telepítve.', 'Erfolgreich installiert.', 'Installation réussie.', 'Se ha instalado correctamente.'],
    'Unavailable': ['Not available in this simulator', 'Ebben a szimulátorban nem érhető el', 'In diesem Simulator nicht verfügbar', 'Non disponible dans ce simulateur', 'No disponible en este simulador']
  };
  const LANGS = ['en', 'hu', 'de', 'fr', 'es'];
  const text = (lang, key) => (S[key] || [key])[Math.max(0, LANGS.indexOf(lang))] ?? key;
  const VERSION = '3.5.16';
  // Section colours of the 3.5 home tiles: green apps, orange music, blue books, red movies; Games has its own dark tile.
  const SECTIONS = [['apps', 'Apps', '#9fc33b'], ['music', 'Music', '#ef8a2b'], ['books', 'Books', '#3d8fd6'], ['movies', 'Movies', '#d8473e'], ['games', 'Games', '#9fc33b']];
  const TABS = {
    apps: ['CATEGORIES', 'FEATURED', 'TOP PAID', 'TOP FREE', 'TOP GROSSING', 'TOP NEW PAID', 'TOP NEW FREE', 'TRENDING'],
    games: ['CATEGORIES', 'FEATURED', 'TOP PAID', 'TOP FREE', 'TOP GROSSING', 'TOP NEW PAID', 'TOP NEW FREE', 'TRENDING'],
    music: ['GENRES', 'FEATURED', 'TOP ALBUMS', 'TOP SONGS', 'NEW RELEASES'],
    books: ['CATEGORIES', 'FEATURED', 'TOP SELLING', 'NEW RELEASES', 'TOP FREE'],
    movies: ['CATEGORIES', 'FEATURED', 'TOP SELLING', 'NEW RELEASES']
  };
  // Paid apps, albums, books and films for the sections: public-domain classics, the simulator's own demo albums, fictional films.
  const EXTRA = [
    {id: 'lunar-golf', kind: 'games', art: 'golf', name: 'Lunar Golf', developer: 'Crater Games', rating: 4.4, price: '$0.99', size: '9.8MB', description: 'Eighteen holes in low gravity.'},
    {id: 'pocket-planner', kind: 'apps', art: 'planner', name: 'Pocket Planner', developer: 'Quiet Tools', rating: 4.3, price: '$1.99', size: '1.6MB', description: 'Plan your week on one simple page.'},
    {id: 'album-first-light', kind: 'music', name: 'First Light', developer: 'The Demo Tapes', rating: 4.6, price: '$7.99', colors: ['#2c3e57', '#f1b45d'], description: '12 songs. Includes "Blue Horizon" and "Afterglow".'},
    {id: 'album-after-hours', kind: 'music', name: 'After Hours', developer: 'The Demo Tapes', rating: 4.4, price: '$6.99', colors: ['#1c1530', '#b65fd8'], description: '10 songs. Includes "Night Drive".'},
    {id: 'album-small-worlds', kind: 'music', name: 'Small Worlds', developer: 'Paper Satellites', rating: 4.5, price: 'FREE', colors: ['#14403a', '#7fd6b4'], description: 'A free album of the week.'},
    {id: 'book-pride', kind: 'books', name: 'Pride and Prejudice', developer: 'Jane Austen', rating: 4.6, price: 'FREE', colors: ['#5d4a3a', '#c9b48a']},
    {id: 'book-holmes', kind: 'books', name: 'The Adventures of Sherlock Holmes', developer: 'Arthur Conan Doyle', rating: 4.7, price: 'FREE', colors: ['#28323c', '#a7b4bd']},
    {id: 'book-alice', kind: 'books', name: 'Alice\'s Adventures in Wonderland', developer: 'Lewis Carroll', rating: 4.5, price: 'FREE', colors: ['#3a5f8a', '#f0d48a']},
    {id: 'movie-orbit', kind: 'movies', name: 'Orbit Hopper: The Movie', developer: 'Animation', rating: 4.1, price: '$3.99', colors: ['#141c3a', '#8f7fff']},
    {id: 'movie-quiet', kind: 'movies', name: 'A Quiet Afternoon', developer: 'Drama', rating: 3.9, price: '$2.99', colors: ['#3a2a1c', '#e0a868']}
  ];
  const DATES = ['March 21, 2012', 'March 2, 2012', 'February 14, 2012', 'January 30, 2012'];
  const catalog = () => (window.ICSPlayStore?.catalog || []).map((item, i) => ({...item, kind: item.category === 'Games' ? 'games' : 'apps', price: 'FREE', downloads: ['10,000,000+', '1,000,000+', '500,000+', '100,000+'][i % 4], votes: 12000 + i * 4173, updated: DATES[i % 4], plus: 120 + i * 37, size: String(item.size || '').replace(' ', '')}));
  const all = () => [...catalog(), ...EXTRA.map(item => ({downloads: '50,000+', votes: 812, plus: 46, updated: 'February 1, 2012', size: item.kind === 'books' ? '1.2MB' : item.kind === 'music' ? '96MB' : item.kind === 'movies' ? '820MB' : item.size, description: item.kind === 'books' ? 'A classic, free from Google Play Books.' : item.kind === 'movies' ? 'Rent and watch within 30 days.' : '', ...item}))];
  const find = id => all().find(item => item.id === id);
  const installedState = (item, ctx) => item.app ? 'installed' : ctx.installed.includes(item.id) ? 'installed' : ctx.downloading === item.id ? ctx.phase : '';
  const stars = rating => `<span class="icsp-stars" aria-label="${rating}">${[1, 2, 3, 4, 5].map(n => `<i class="${rating >= n - .25 ? 'on' : rating >= n - .75 ? 'half' : ''}"></i>`).join('')}</span>`;
  const ICONS = {
    orbit: '<svg viewBox="0 0 48 48"><defs><radialGradient id="ip" cx=".35" cy=".3"><stop offset="0" stop-color="#ffd27a"/><stop offset="1" stop-color="#d0631e"/></radialGradient></defs><rect x="2" y="2" width="44" height="44" rx="9" fill="#152049"/><circle cx="12" cy="12" r="1" fill="#fff"/><circle cx="37" cy="9" r="1.2" fill="#fff"/><circle cx="38" cy="36" r=".9" fill="#fff"/><circle cx="24" cy="25" r="10" fill="url(#ip)"/><ellipse cx="24" cy="25" rx="18" ry="5" fill="none" stroke="#9fd8ff" stroke-width="2.2" transform="rotate(-18 24 25)"/></svg>',
    blocks: '<svg viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#2b2b2b"/><g stroke="#0006" stroke-width="1"><rect x="8" y="26" width="10" height="10" fill="#ff5a4e"/><rect x="18" y="26" width="10" height="10" fill="#ffc533"/><rect x="28" y="26" width="10" height="10" fill="#45c1ff"/><rect x="18" y="16" width="10" height="10" fill="#7bd448"/><rect x="28" y="16" width="10" height="10" fill="#b77bff"/><rect x="28" y="6" width="10" height="10" fill="#ff8bc4"/></g></svg>',
    golf: '<svg viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#0c1022"/><circle cx="24" cy="40" r="20" fill="#b9bfd0"/><circle cx="17" cy="33" r="3" fill="#8e95aa"/><circle cx="31" cy="36" r="2" fill="#8e95aa"/><path d="M28 30V10l9 4-9 4" fill="#e04848" stroke="#ddd" stroke-width="1.2"/><circle cx="16" cy="24" r="2.4" fill="#fff"/></svg>',
    planner: '<svg viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#2a6fbd"/><rect x="10" y="12" width="28" height="26" rx="2" fill="#fff"/><rect x="10" y="12" width="28" height="7" rx="2" fill="#e8453c"/><g fill="#9aa7b5"><rect x="14" y="23" width="5" height="4"/><rect x="21" y="23" width="5" height="4"/><rect x="28" y="23" width="5" height="4"/><rect x="14" y="30" width="5" height="4"/><rect x="21" y="30" width="5" height="4"/></g><path d="M28 31l3 3 6-7" fill="none" stroke="#3da543" stroke-width="2.4"/></svg>'
  };
  const art = (item, cls = 'icsp-icon') => item.app ? `<img class="${cls}" src="assets/${item.app}.png" alt="">`
    : ICONS[item.art] ? `<i class="${cls} icsp-svg" aria-hidden="true">${ICONS[item.art]}</i>`
    : `<i class="${cls} icsp-cover ${item.kind || ''}" style="--a:${(item.colors || ['#2f4f6f', '#8fc0e8'])[0]};--b:${(item.colors || ['#2f4f6f', '#8fc0e8'])[1]}" aria-hidden="true"><b>${e((item.name || '?').slice(0, 1))}</b></i>`;
  const price = (item, ctx, word = false) => item.price === 'FREE' ? text(ctx.lang, word ? 'Free' : 'FREE') : item.price;
  // The action bar: back caret and bag (only the bag at the top level), the title, search and the Holo overflow button.
  function header(ctx, title, back = true) {
    const up = back ? '<button class="icsp-up" data-action="back" aria-label="Back"><span>‹</span><img src="assets/play-store.svg?v=2" alt=""></button>' : '<span class="icsp-up root"><img src="assets/play-store.svg?v=2" alt=""></span>';
    if (ctx.searching) return `<form class="icsp-bar searching" data-form="icsp-search">${up}<input name="query" autocomplete="off" aria-label="${e(text(ctx.lang, 'Search Google Play'))}" placeholder="${e(text(ctx.lang, 'Search Google Play'))}" value="${e(ctx.editValue || '')}"><button class="icsp-search" type="submit" aria-label="${e(text(ctx.lang, 'Search Google Play'))}"></button></form>`;
    return `<div class="icsp-bar">${up}<b>${e(title)}</b>${ctx.noMenu ? '' : `<button class="icsp-search" data-action="icsp-search" aria-label="${e(text(ctx.lang, 'Search Google Play'))}"></button>`}${ctx.noMenu ? '' : '<button class="icsp-overflow" data-action="icsp-menu" aria-label="More options"></button>'}</div>`;
  }
  // SearchView suggestions: catalog matches, or the recent queries.
  function suggestions(ctx) {
    if (!ctx.searching) return '';
    const q = String(ctx.editValue || '').trim().toLocaleLowerCase(ctx.locale);
    const list = q ? all().filter(item => item.name.toLocaleLowerCase(ctx.locale).includes(q)).slice(0, 5).map(item => ({id: item.id, name: item.name})) : ctx.history.slice(0, 5).map(name => ({id: '', name}));
    return list.length ? `<div class="icsp-suggest">${list.map(s => `<button type="button" data-action="${s.id ? 'icsp-detail' : 'icsp-search-run'}" data-id="${e(s.id || s.name)}"><i class="${s.id ? 'item' : 'recent'}"></i><span>${e(s.name)}</span></button>`).join('')}</div>` : '';
  }
  const view = (ctx, cls, head, body) => `<div class="app-view icsp ${cls}" data-no-translate>${head}<div class="icsp-scroll">${body}</div>${suggestions(ctx)}</div>`;

  function home(ctx) {
    const T = key => text(ctx.lang, key), items = all(), promo = find('orbit') || items[0];
    const tiles = SECTIONS.slice(0, 4).map(([id, label, color]) => `<button class="icsp-tile ${id}" style="--c:${color}" data-action="icsp-section" data-id="${id}"><b>${e(T(label))}</b><i class="icsp-mark ${id}"></i><small>${e(T('see more'))} ›</small></button>`).join('');
    const feature = item => `<button class="icsp-feature" style="--a:${(item.colors || ['#222'])[0]};--b:${(item.colors || ['#222', '#555'])[1]}" data-action="icsp-detail" data-id="${e(item.id)}">${art(item, 'icsp-feature-art')}<span><b>${e(item.name)}</b><small>${e(item.developer)}</small></span><span class="icsp-feature-foot">${stars(item.rating)}<em>${e(price(item, ctx))}</em></span></button>`;
    const banner = (item, title, line, cls) => `<button class="icsp-promo ${cls}" data-action="icsp-detail" data-id="${e(item.id)}">${art(item, 'icsp-promo-art')}<span><b>${e(title)}</b><small>${e(line)}</small></span></button>`;
    return view(ctx, 'icsp-home', header(ctx, T('Google Play'), false),
      `${banner(promo, promo.name, promo.description || '', 'space')}<div class="icsp-columns"><div class="icsp-tiles">${tiles}</div><div class="icsp-right"><button class="icsp-games" data-action="icsp-section" data-id="games"><b>${e(T('Games'))}</b><i></i></button>${feature(find('album-first-light'))}${feature(find('book-holmes'))}</div></div>${banner(find('movie-quiet'), 'A Quiet Afternoon', '$2.99 · Movies', 'film')}${banner(find('book-alice'), 'Free classics', 'Alice\'s Adventures in Wonderland', 'classics')}`);
  }
  // A section: the ViewPager title strip (the current tab centred in the section colour, its neighbours at the edges).
  function section(ctx) {
    const T = key => text(ctx.lang, key), [id, label, color] = SECTIONS.find(s => s[0] === ctx.section) || SECTIONS[0];
    const tabs = TABS[id], tab = tabs.includes(ctx.tab) ? ctx.tab : 'FEATURED', i = tabs.indexOf(tab);
    const strip = `<div class="icsp-tabs" style="--c:${color}" data-icsp-swipe><button data-action="icsp-tab" data-id="${e(tabs[i - 1] || '')}"${i ? '' : ' disabled'}>${i ? e(T(tabs[i - 1])) : ''}</button><b>${e(T(tab))}</b><button data-action="icsp-tab" data-id="${e(tabs[i + 1] || '')}"${i < tabs.length - 1 ? '' : ' disabled'}>${i < tabs.length - 1 ? e(T(tabs[i + 1])) : ''}</button></div>`;
    const items = all().filter(item => item.kind === id);
    let body;
    if (tab === 'CATEGORIES' || tab === 'GENRES') {
      const cats = {games: ['Arcade & Action', 'Brain & Puzzle', 'Cards & Casino', 'Casual', 'Live Wallpaper', 'Racing', 'Sports Games', 'Widgets'], apps: ['Books & Reference', 'Business', 'Comics', 'Communication', 'Education', 'Entertainment', 'Finance', 'Health & Fitness', 'Music & Audio', 'Photography', 'Productivity', 'Tools'], music: ['Alternative', 'Classical', 'Electronica', 'Pop', 'Rock', 'Soundtracks'], books: ['Fiction', 'Classics', 'Mystery', 'Children\'s'], movies: ['Action & Adventure', 'Animation', 'Comedy', 'Drama', 'Family']}[id];
      body = `<div class="icsp-list">${cats.map(c => `<button class="icsp-cat" data-action="icsp-tab" data-id="${e(tabs[2])}">${e(c)}</button>`).join('')}</div>`;
    } else if (tab === 'FEATURED') {
      const lead = items[0], rest = items.slice(1, 5);
      body = lead ? `<div class="icsp-featured"><button class="icsp-banner" data-action="icsp-detail" data-id="${e(lead.id)}" style="--a:${(lead.colors || ['#13301a'])[0]};--b:${color}">${art(lead, 'icsp-banner-art')}<b>${e(lead.name)}</b></button><div class="icsp-grid">${rest.map(item => `<button class="icsp-gridtile" data-action="icsp-detail" data-id="${e(item.id)}">${art(item, 'icsp-tile-art')}<span><b>${e(item.name)}</b>${stars(item.rating)}</span></button>`).join('')}<button class="icsp-gridtile pick" style="--c:${color}" data-action="icsp-tab" data-id="${e(tabs[2])}"><b>${e(T(tabs[2]))}</b><i class="icsp-mark ${id}"></i></button></div></div>` : '';
    } else {
      const sorted = [...items].sort((a, b) => tab === 'TRENDING' || tab === 'NEW RELEASES' ? a.name.localeCompare(b.name) : b.rating - a.rating).filter(item => tab.includes('PAID') || tab === 'TOP SELLING' ? item.price !== 'FREE' : tab.includes('FREE') ? item.price === 'FREE' : true);
      body = sorted.length ? `<div class="icsp-list">${sorted.map(item => row(item, ctx)).join('')}</div>` : `<p class="icsp-empty">${e(T('No results'))}</p>`;
    }
    return view(ctx, `icsp-section ${id}`, header(ctx, T(label)) + strip, body);
  }
  // Light list rows (3.5): icon, bold title, developer, stars and the price or green "Installed".
  function row(item, ctx) {
    const state = installedState(item, ctx);
    return `<button class="icsp-row" data-action="icsp-detail" data-id="${e(item.id)}">${art(item)}<span class="icsp-row-copy"><b>${e(item.name)}</b><small>${e(item.developer)}</small>${stars(item.rating)}</span><em class="${state === 'installed' || item.price === 'FREE' ? 'green' : ''}">${e(state === 'installed' ? text(ctx.lang, 'Installed') : price(item, ctx, true))}</em></button>`;
  }
  // Reviews (3.5.15): the average with the bar histogram, the Sort reviews / Options spinners and the reviews with the device.
  const REVIEWS = [
    {title: 'Love it!', author: 'Joseph', date: '3/23/12', device: 'Samsung Galaxy Nexus', stars: 5, text: 'Exactly what I was looking for. Works great on Ice Cream Sandwich.', newest: 2},
    {title: 'Great update', author: 'James', date: '3/25/12', device: 'Nexus S', stars: 4, text: 'Faster than the last version. Would love a widget.', newest: 1},
    {title: 'Nice', author: 'Maria', date: '3/27/12', device: 'Samsung Galaxy Nexus', stars: 4, text: 'Simple and pretty. Does what it says.', newest: 0}
  ];
  function reviews(item, ctx) {
    const T = key => text(ctx.lang, key), total = item.votes, shares = [.62, .2, .09, .04, .05].map((s, i) => Math.round(total * (s + (item.rating - 4.4) * (i ? -.04 : .16))));
    const max = Math.max(...shares), list = REVIEWS.filter(r => !ctx.reviewDevice || r.device === 'Samsung Galaxy Nexus');
    const sorted = ctx.reviewSort === 'newest' ? [...list].sort((a, b) => a.newest - b.newest) : list;
    const label = n => (n === 1 ? T('star') : T('stars')).replace('%d', n);
    return `<div class="icsp-reviews"><h4>${e(T('REVIEWS'))}</h4><div class="icsp-hist"><div class="icsp-avg"><small>${e(T('Average'))}</small><b>${item.rating.toLocaleString(ctx.locale, {minimumFractionDigits: 1})}</b>${stars(item.rating)}<small>${total.toLocaleString(ctx.locale)}</small></div><div class="icsp-bars">${shares.map((n, i) => `<span><small>${e(label(5 - i))}</small><i style="width:${Math.max(2, Math.round(n / max * 100))}%"></i><em>${Math.max(0, n).toLocaleString(ctx.locale)}</em></span>`).join('')}</div></div><div class="icsp-review-tools"><button data-action="icsp-review-sort">${e(T(ctx.reviewSort === 'newest' ? 'Newest first' : 'Most helpful first'))}</button><button data-action="icsp-review-options">${e(T('Options'))}</button></div>${sorted.map(r => `<div class="icsp-review"><b>${e(r.title)}</b><span>${stars(r.stars)} <strong>${e(r.author)}</strong> ${e(r.date)}</span><small>${e(r.device)}</small><p>${e(r.text)}</p></div>`).join('')}</div>`;
  }
  function detail(ctx) {
    const T = key => text(ctx.lang, key), item = find(ctx.selected);
    if (!item) return home(ctx);
    const state = installedState(item, ctx);
    let actions = '';
    if (state === 'installed') actions = `<div class="icsp-actions"><button data-action="icsp-open" data-id="${e(item.id)}">${e(T('Open'))}</button><button data-action="icsp-uninstall" data-id="${e(item.id)}"${item.app ? ' disabled' : ''}>${e(T('Uninstall'))}</button></div>`;
    else if (state === 'downloading' || state === 'installing') actions = `<div class="icsp-actions progress"><div><span>${e(T(state === 'installing' ? 'Installing…' : 'Downloading…'))}</span><i class="icsp-progress"><b style="width:${state === 'installing' ? 100 : Math.round(ctx.progress * 100)}%"></b></i></div><button data-action="icsp-cancel">${e(T('Cancel'))}</button></div>`;
    const priceButton = state ? '' : `<button class="icsp-price" data-action="icsp-buy" data-id="${e(item.id)}">${e(price(item, ctx))}</button>`;
    const shots = item.kind === 'music' || item.kind === 'books' || item.kind === 'movies' ? '' : `<div class="icsp-shots">${[0, 1, 2].map(n => `<span class="icsp-shot n${n}" style="--a:${(item.colors || ['#2a3a4a', '#9fc33b'])[0]};--b:${(item.colors || ['#2a3a4a', '#9fc33b'])[1]}">${art(item, 'icsp-shot-art')}</span>`).join('')}</div>`;
    return view(ctx, 'icsp-detail', header(ctx, item.name), `<div class="icsp-head">${art(item, 'icsp-head-art')}<span><b>${e(item.name)}</b><small>${e(item.developer.toUpperCase())}</small></span>${priceButton}</div>${actions ? `<i class="icsp-rule"></i>${actions}<i class="icsp-rule"></i>` : '<i class="icsp-rule"></i>'}${shots}
      <div class="icsp-info"><div class="icsp-info-row"><span>${stars(item.rating)} <small>${item.votes.toLocaleString(ctx.locale)}</small></span><span>${e(item.updated)}</span></div><div class="icsp-info-row"><span>${e(item.downloads)} ${e(T('downloads'))}</span><span>${e(T('Size'))}: ${e(item.size || '')}</span></div>
      <div class="icsp-plus"><button data-action="icsp-plus" data-id="${e(item.id)}" class="${ctx.plussed.includes(item.id) ? 'on' : ''}">+1</button><span>${item.plus + (ctx.plussed.includes(item.id) ? 1 : 0)} ${e(T('people +1\'d this'))}</span></div>
      ${state === 'installed' && !item.app ? `<label class="icsp-auto"><input type="checkbox" data-icsp-auto="${e(item.id)}"${ctx.autoUpdate.includes(item.id) ? ' checked' : ''}><span>${e(T('Allow automatic updating'))}</span></label>` : ''}
      <div class="icsp-desc"><h4>${e(T('DESCRIPTION'))}</h4><p>${e(item.description || '')}</p></div>${reviews(item, ctx)}</div>`);
  }
  function permissions(ctx) {
    const T = key => text(ctx.lang, key), item = find(ctx.selected);
    const groups = item.kind === 'games' ? [['Network communication', 'full Internet access'], ['Hardware controls', 'control vibrator']] : [['Network communication', 'full Internet access'], ['Storage', 'modify/delete USB storage contents']];
    return `<div class="app-view icsp icsp-perms" data-no-translate>${header(ctx, item.name)}<div class="icsp-head">${art(item, 'icsp-head-art')}<span><b>${e(item.name)}</b><small>${e(item.developer.toUpperCase())}</small></span></div><i class="icsp-rule"></i><div class="icsp-scroll"><p class="icsp-perm-intro">${e(T('Permissions'))}</p>${groups.map(([g, d]) => `<div class="icsp-perm"><i></i><span><b>${e(g)}</b><small>${e(d)}</small></span></div>`).join('')}</div><div class="icsp-accept"><button data-action="icsp-accept" data-id="${e(item.id)}">${e(T('Accept & download'))}</button></div></div>`;
  }
  // My apps (3.5.15): INSTALLED and ALL pages; Installed groups its apps under "Up to date" with the count.
  function myApps(ctx) {
    const T = key => text(ctx.lang, key), tab = ctx.tab === 'ALL' ? 'ALL' : 'INSTALLED';
    const installed = all().filter(item => installedState(item, ctx) === 'installed').sort((a, b) => a.name.localeCompare(b.name));
    const left = tab === 'ALL' ? `<button data-action="icsp-tab" data-id="INSTALLED">${e(T('INSTALLED'))}</button>` : '<button data-action="icsp-tab" data-id="" disabled></button>';
    const right = tab === 'ALL' ? '<button data-action="icsp-tab" data-id="" disabled></button>' : `<button data-action="icsp-tab" data-id="ALL">${e(T('ALL'))}</button>`;
    const strip = `<div class="icsp-tabs" style="--c:#9fc33b" data-icsp-swipe>${left}<b>${e(T(tab))}</b>${right}</div>`;
    const body = tab === 'ALL'
      ? `<div class="icsp-list">${all().filter(item => item.kind === 'apps' || item.kind === 'games').filter(item => installedState(item, ctx) === 'installed' || ctx.everInstalled.includes(item.id)).sort((a, b) => a.name.localeCompare(b.name)).map(item => row(item, ctx)).join('')}</div>`
      : `<div class="icsp-group"><span>${e(T('Up to date'))}</span><b>${installed.length}</b></div><div class="icsp-list">${installed.map(item => row(item, ctx)).join('')}</div>`;
    return view(ctx, 'icsp-myapps', header(ctx, T('My apps')) + strip, body);
  }
  function search(ctx) {
    const q = String(ctx.query || '').trim().toLocaleLowerCase(ctx.locale), items = q ? all().filter(item => `${item.name} ${item.developer}`.toLocaleLowerCase(ctx.locale).includes(q)) : [];
    return view(ctx, 'icsp-results', header(ctx, ctx.query || ''), items.length ? `<div class="icsp-list">${items.map(item => row(item, ctx)).join('')}</div>` : `<p class="icsp-empty">${e(text(ctx.lang, 'No results'))}</p>`);
  }
  // Settings (3.4.4 / 3.5.16 captures; Holo rows and upper-case headers on ICS).
  function settings(ctx) {
    const T = key => text(ctx.lang, key), s = ctx.prefs;
    const cat = title => `<h3 class="icsp-pref-cat">${e(T(title))}</h3>`;
    const chk = (key, title, summary, disabled) => `<button class="icsp-pref" data-action="icsp-pref" data-id="${key}" role="checkbox" aria-checked="${!!s[key]}"${disabled ? ' disabled' : ''}><span><b>${e(T(title))}</b><small>${e(T(summary))}</small></span><img src="assets/btn_check_${s[key] ? 'on' : 'off'}_holo_dark.png" alt=""></button>`;
    const plain = (action, title, summary, raw) => `<button class="icsp-pref" data-action="${action}"><span><b>${e(T(title))}</b><small>${raw ? e(summary) : e(T(summary))}</small></span></button>`;
    return `<div class="app-view icsp icsp-settings" data-no-translate>${header({...ctx, noMenu: true}, T('Settings'))}<div class="icsp-scroll">${cat('General')}${chk('notify', 'Notifications', 'Notifications summary')}${chk('autoUpdate', 'Auto-update apps', 'Auto-update summary')}${chk('wifiOnly', 'Update over Wi-Fi only', 'Wi-Fi summary')}${chk('widgets', 'Auto-add widgets', 'Widgets summary')}${plain('icsp-clear-history', 'Clear search history', 'Clear search history summary')}${cat('User controls')}${plain('icsp-unavailable', 'Content filtering', 'Content filtering summary')}${chk('pin', 'Use PIN for purchases', 'Use PIN summary', !s.pinSet)}${plain('icsp-unavailable', 'Set or change PIN', 'Set PIN summary')}${cat('Other')}${chk('admob', 'Google AdMob Ads', 'AdMob summary')}${cat('About')}${plain('icsp-unavailable', 'Open source licenses', 'Licenses summary')}<div class="icsp-pref info"><span><b>${e(T('Build version'))}</b><small>${e(T('Version').replace('%s', VERSION))}</small></span></div></div></div>`;
  }
  function render(ctx) {
    if (ctx.page === 'section') return section(ctx);
    if (ctx.page === 'detail') return detail(ctx);
    if (ctx.page === 'permissions') return permissions(ctx);
    if (ctx.page === 'my-apps') return myApps(ctx);
    if (ctx.page === 'search') return search(ctx);
    if (ctx.page === 'settings') return settings(ctx);
    return home(ctx);
  }
  // The overflow menu: My apps, Accounts, Settings, Help.
  const menu = ctx => [['icsp-my-apps', 'My apps'], ['icsp-unavailable', 'Accounts'], ['icsp-settings', 'Settings'], ['icsp-unavailable', 'Help']].map(([action, title]) => ({action, title: text(ctx.lang, title)}));
  // Holo dialogs: Sort reviews (single choice) and Options (two checkboxes with OK).
  function dialog(kind, ctx) {
    const T = key => text(ctx.lang, key);
    if (kind === 'sort') return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog icsp-dialog" role="dialog" aria-label="${e(T('Sort reviews'))}"><h3>${e(T('Sort reviews'))}</h3>${[['helpful', 'Most helpful first'], ['newest', 'Newest first']].map(([id, label]) => `<button class="icsp-dlg-row" data-action="icsp-review-sort-pick" data-id="${id}" role="radio" aria-checked="${(ctx.reviewSort || 'helpful') === id}"><span>${e(T(label))}</span><img src="assets/btn_radio_${(ctx.reviewSort || 'helpful') === id ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join('')}</div>`;
    if (kind === 'options') return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog icsp-dialog" role="dialog" aria-label="${e(T('Options'))}"><h3>${e(T('Options'))}</h3>${[['reviewLatest', 'Latest version only'], ['reviewDevice', 'From this type of phone only']].map(([id, label]) => `<button class="icsp-dlg-row" data-action="icsp-review-option" data-id="${id}" role="checkbox" aria-checked="${!!ctx[id]}"><span>${e(T(label))}</span><img src="assets/btn_check_${ctx[id] ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join('')}<div class="settings-dialog-actions"><button data-action="close-overlay">${e(T('OK'))}</button></div></div>`;
    return '';
  }
  window.ICSPlay = {SECTIONS, TABS, EXTRA, VERSION, text, all, find, installedState, render, menu, dialog};
})();
