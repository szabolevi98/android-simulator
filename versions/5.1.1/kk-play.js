/* Google Play Store 5.2 on the Nexus 6 (LMY48Y): the Material storefront over the 4.8 structure (navigation drawer,
   section tabs, clusters with MORE, details, the grouped permissions dialog). The toolbar takes the corpus colour
   (play_apps_primary #689F38, movies #ED3B3B, music #EF6C00, books #039BE5, newsstand #536DFE; the multi-corpus
   home is apps green), the category tiles are flat blocks of those colours, cards sit on #EEEEEE. The catalog is the
   simulator's fictional one; 1 dp = 0.906 CSS px (lp-play.css). */
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
    'Movies & TV': ['Movies & TV', 'Filmek és TV', 'Filme & Serien', 'Films et séries', 'Películas y TV'],
    'Magazines': ['Magazines', 'Magazinok', 'Zeitschriften', 'Magazines', 'Revistas'],
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
    'Downloading…': ['Downloading…', 'Letöltés…', 'Wird heruntergeladen…', 'Téléchargement…', 'Descargando…'],
    'Installing…': ['Installing…', 'Telepítés…', 'Wird installiert…', 'Installation…', 'Instalando…'],
    'Cancel': ['Cancel', 'Mégse', 'Abbrechen', 'Annuler', 'Cancelar'],
    'OK': ['OK', 'OK', 'OK', 'OK', 'Aceptar'],
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
    'Auto-add widgets': ['Auto-add widgets', 'Modulok automatikus hozzáadása', 'Widgets automatisch hinzufügen', 'Ajout automatique de widgets', 'Añadir widgets automáticamente'],
    'Widgets summary': ['Automatically add Home screen widgets for new apps', 'Kezdőképernyő-modulok automatikus hozzáadása új alkalmazásokhoz', 'Startbildschirm-Widgets für neue Apps automatisch hinzufügen', 'Ajouter automatiquement les widgets des nouvelles applications à l\'écran d\'accueil', 'Añadir automáticamente widgets a la pantalla de inicio para nuevas aplicaciones'],
    'Clear search history': ['Clear search history', 'Keresési előzmények törlése', 'Suchverlauf löschen', 'Effacer l\'historique de recherche', 'Borrar historial de búsqueda'],
    'Clear search history summary': ['Remove all the searches you have performed', 'Az összes korábbi keresés eltávolítása', 'Alle bisherigen Suchanfragen entfernen', 'Supprimer toutes les recherches effectuées', 'Eliminar todas las búsquedas realizadas'],
    'User controls': ['User controls', 'Felhasználói beállítások', 'Nutzereinstellungen', 'Contrôles utilisateur', 'Controles de usuario'],
    'Content filtering': ['Content filtering', 'Tartalomszűrés', 'Inhaltsfilter', 'Filtrage du contenu', 'Filtrado de contenido'],
    'Content filtering summary': ['Set the content filtering level to restrict apps that can be downloaded', 'A letölthető alkalmazásokat korlátozó szűrési szint beállítása', 'Filterstufe festlegen, um herunterladbare Apps einzuschränken', 'Définir le niveau de filtrage pour limiter les applications téléchargeables', 'Establece el nivel de filtrado para restringir las aplicaciones que se pueden descargar'],
    'About': ['About', 'Névjegy', 'Über', 'À propos', 'Acerca de'],
    'Open source licenses': ['Open source licenses', 'Nyílt forráskódú licencek', 'Open-Source-Lizenzen', 'Licences open source', 'Licencias de código abierto'],
    'Licenses summary': ['License details for open source software', 'Nyílt forráskódú szoftverek licencrészletei', 'Lizenzdetails für Open-Source-Software', 'Informations sur les licences des logiciels libres', 'Detalles de licencias de software libre'],
    'Build version': ['Build version', 'Build-verzió', 'Build-Version', 'Version de build', 'Versión de compilación'],
    'Version': ['Version: %s', 'Verzió: %s', 'Version: %s', 'Version : %s', 'Versión: %s'],
    'Successfully installed.': ['Successfully installed.', 'Sikeresen telepítve.', 'Erfolgreich installiert.', 'Installation réussie.', 'Se ha instalado correctamente.'],
    'Unavailable': ['Not available in this simulator', 'Ebben a szimulátorban nem érhető el', 'In diesem Simulator nicht verfügbar', 'Non disponible dans ce simulateur', 'No disponible en este simulador'],
    'SEE MORE': ['SEE MORE', 'TOVÁBBIAK', 'MEHR', 'PLUS', 'VER MÁS'],
    'HOME': ['HOME', 'KEZDŐLAP', 'STARTSEITE', 'ACCUEIL', 'INICIO'],
    'INSTALL': ['INSTALL', 'TELEPÍTÉS', 'INSTALLIEREN', 'INSTALLER', 'INSTALAR'],
    'Install': ['Install', 'Telepítés', 'Installieren', 'Installer', 'Instalar'],
    'OPEN': ['OPEN', 'MEGNYITÁS', 'ÖFFNEN', 'OUVRIR', 'ABRIR'],
    'UNINSTALL': ['UNINSTALL', 'ELTÁVOLÍTÁS', 'DEINSTALLIEREN', 'DÉSINSTALLER', 'DESINSTALAR'],
    'UPDATE ALL': ['UPDATE ALL', 'ÖSSZES FRISSÍTÉSE', 'ALLE AKTUALISIEREN', 'TOUT METTRE À JOUR', 'ACTUALIZAR TODO'],
    'Updates': ['Updates', 'Frissítések', 'Updates', 'Mises à jour', 'Actualizaciones'],
    'PURCHASED': ['PURCHASED', 'MEGVÁSÁROLVA', 'GEKAUFT', 'ACHETÉ', 'COMPRADO'],
    'Rate & review': ['Rate & review', 'Értékelés és vélemény', 'Bewerten & rezensieren', 'Noter et donner un avis', 'Valorar y opinar'],
    'Reviews': ['Reviews', 'Vélemények', 'Rezensionen', 'Avis', 'Opiniones'],
    "What's new": ["What's new", 'Újdonságok', 'Neue Funktionen', 'Nouveautés', 'Novedades'],
    'Description': ['Description', 'Leírás', 'Beschreibung', 'Description', 'Descripción'],
    'My wishlist': ['My wishlist', 'Kívánságlistám', 'Meine Wunschliste', 'Ma liste de souhaits', 'Mi lista de deseos'],
    'Add to wishlist': ['Add to wishlist', 'Hozzáadás a kívánságlistához', 'Zur Wunschliste hinzufügen', 'Ajouter à la liste de souhaits', 'Añadir a lista de deseos'],
    'Remove from wishlist': ['Remove from wishlist', 'Eltávolítás a kívánságlistáról', 'Von der Wunschliste entfernen', 'Retirer de la liste de souhaits', 'Quitar de la lista de deseos'],
    'Wishlist empty': ['Your wishlist is empty.', 'A kívánságlistája üres.', 'Ihre Wunschliste ist leer.', 'Votre liste de souhaits est vide.', 'Tu lista de deseos está vacía.'],
    'Buy': ['Buy %s', 'Vásárlás: %s', 'Kaufen: %s', 'Acheter %s', 'Comprar %s'],
    'Redeem': ['Redeem', 'Beváltás', 'Einlösen', 'Utiliser', 'Canjear'],
    'App permissions': ['App permissions', 'Alkalmazásengedélyek', 'App-Berechtigungen', 'Autorisations de l\'application', 'Permisos de la aplicación'],
    'Needs access to': ['needs access to', 'hozzáférést kér a következőkhöz:', 'benötigt Zugriff auf', 'doit accéder à', 'necesita acceso a'],
    'ACCEPT': ['ACCEPT', 'ELFOGADÁS', 'AKZEPTIEREN', 'ACCEPTER', 'ACEPTAR'],
    'Recommended for You': ['Recommended for You', 'Önnek ajánljuk', 'Empfehlungen für Sie', 'Recommandations pour vous', 'Recomendado para ti'],
    'Staff Picks': ['Staff Picks', 'A szerkesztők választása', 'Tipps der Redaktion', 'Choix de l\'équipe', 'Selección del equipo'],
    'Staff Picks sub': ['Our favourite apps this week', 'A hét kedvenc alkalmazásai', 'Unsere Lieblings-Apps der Woche', 'Nos applis préférées de la semaine', 'Nuestras aplicaciones favoritas de la semana'],
    'Albums from': ['Albums from $3.99', 'Albumok $3.99-tól', 'Alben ab 3,99 $', 'Albums à partir de 3,99 $', 'Álbumes desde 3,99 $'],
    'Albums sub': ['Summer Demo Tapes', 'Nyári demófelvételek', 'Sommer-Demoaufnahmen', 'Démos de l\'été', 'Maquetas de verano'],
    'Free classics': ['Free classics', 'Ingyenes klasszikusok', 'Kostenlose Klassiker', 'Classiques gratuits', 'Clásicos gratis'],
    'Free classics sub': ['Timeless books, free', 'Időtálló könyvek ingyen', 'Zeitlose Bücher, kostenlos', 'Des livres intemporels, gratuits', 'Libros eternos, gratis'],
    'Get unlimited': ['Get Unlimited Music', 'Korlátlan zene', 'Unbegrenzte Musik', 'Musique illimitée', 'Música ilimitada'],
    'Try All Access': ['Try All Access for Free', 'Próbálja ki ingyen az All Accesst', 'All Access kostenlos testen', 'Essayez All Access gratuitement', 'Prueba All Access gratis'],
    'Highlights': ['Phone Highlights', 'Kiemelt telefonos tartalmak', 'Highlights für Smartphones', 'À la une sur mobile', 'Destacados para móviles'],
    'Password': ['Password', 'Jelszó', 'Passwort', 'Mot de passe', 'Contraseña'],
    'Password summary': ['Use password to restrict purchases', 'Jelszó használata a vásárlások korlátozásához', 'Käufe durch Passwort beschränken', 'Utiliser un mot de passe pour limiter les achats', 'Usar contraseña para restringir compras'],
    'Auto-update never': ['Do not auto-update apps', 'Nincs automatikus frissítés', 'Apps nicht automatisch aktualisieren', 'Ne pas mettre à jour automatiquement les applications', 'No actualizar aplicaciones automáticamente'],
    'Auto-update any': ['Auto-update apps at any time. Data charges may apply.', 'Automatikus frissítés bármikor. Adatforgalmi díjak merülhetnek fel.', 'Apps jederzeit automatisch aktualisieren. Es können Gebühren für die Datenübertragung anfallen.', 'Mettre à jour automatiquement les applications à tout moment. Des frais de données peuvent s\'appliquer.', 'Actualizar aplicaciones automáticamente en cualquier momento. Pueden aplicarse cargos por datos.'],
    'Auto-update wifi': ['Auto-update apps over Wi-Fi only', 'Automatikus frissítés csak Wi-Fi-n', 'Apps nur über WLAN automatisch aktualisieren', 'Mettre à jour automatiquement les applications via Wi-Fi uniquement', 'Actualizar aplicaciones automáticamente solo a través de Wi-Fi'],
    'Rate this app': ['Rate this app', 'Értékelje az alkalmazást', 'App bewerten', 'Évaluer l\'application', 'Valorar esta aplicación'],
    'Thanks rating': ['Thanks for rating!', 'Köszönjük az értékelést!', 'Danke für die Bewertung!', 'Merci de votre note !', '¡Gracias por tu valoración!'],
    'Play Store': ['Play Store', 'Play Áruház', 'Play Store', 'Play Store', 'Play Store'],
    'Newsstand': ['Newsstand', 'Újságos', 'Kiosk', 'Kiosque', 'Quiosco'],
    'Store home': ['Store home', 'Áruház kezdőlapja', 'Shop-Startseite', 'Accueil Play Store', 'Página principal'],
    'MORE': ['MORE', 'TOVÁBB', 'MEHR', 'PLUS', 'MÁS'],
    'New + Updated Games': ['New + Updated Games', 'Új és frissített játékok', 'Neue & aktualisierte Spiele', 'Jeux nouveaux et mis à jour', 'Juegos nuevos y actualizados'],
    'New + Updated Games sub': ['Fresh this week', 'A hét újdonságai', 'Neu in dieser Woche', 'Les nouveautés de la semaine', 'Novedades de esta semana'],
    "See What's Trending": ["See What's Trending", 'Felkapott tartalmak', 'Angesagte Inhalte', 'Les tendances du moment', 'Lo más popular'],
    'Trending sub': ['Most popular apps + games', 'A legnépszerűbb alkalmazások és játékok', 'Die beliebtesten Apps & Spiele', 'Les applications et jeux les plus populaires', 'Las aplicaciones y juegos más populares'],
    'Simplified permissions': ["We've simplified app permissions.", 'Egyszerűsítettük az alkalmazásengedélyeket.', 'Wir haben die App-Berechtigungen vereinfacht.', 'Nous avons simplifié les autorisations des applications.', 'Hemos simplificado los permisos de las aplicaciones.'],
    'LEARN MORE': ['LEARN MORE', 'TOVÁBBI INFÓ', 'WEITERE INFOS', 'EN SAVOIR PLUS', 'MÁS INFORMACIÓN'],
    'Add icon to Home screen': ['Add icon to Home screen', 'Ikon hozzáadása a kezdőképernyőhöz', 'Symbol zu Startbildschirm hinzufügen', 'Ajouter une icône à l\'écran d\'accueil', 'Añadir icono a la pantalla de inicio'],
    'For new apps': ['For new apps', 'Új alkalmazások esetén', 'Für neue Apps', 'Pour les nouvelles applications', 'Para nuevas aplicaciones'],
    'Require password for purchases': ['Require password for purchases', 'Jelszó kérése vásárláskor', 'Passwort für Käufe erforderlich', 'Exiger un mot de passe pour les achats', 'Solicitar contraseña para compras'],
    'Require password': ['Require password', 'Jelszó kérése', 'Passwort erforderlich', 'Exiger un mot de passe', 'Solicitar contraseña'],
    'Password always': ['For all purchases through Google Play on this device', 'A Google Playen keresztül ezen az eszközön történő minden vásárlásnál', 'Für alle Käufe über Google Play auf diesem Gerät', 'Pour tous les achats effectués sur Google Play depuis cet appareil', 'Para todas las compras realizadas a través de Google Play en este dispositivo'],
    'Every 30 minutes': ['Every 30 minutes', '30 percenként', 'Alle 30 Minuten', 'Toutes les 30 minutes', 'Cada 30 minutos'],
    'Never': ['Never', 'Soha', 'Nie', 'Jamais', 'Nunca'],
    'Additional information': ['Additional information', 'További információ', 'Zusätzliche Informationen', 'Informations supplémentaires', 'Información adicional'],
    'Installed size': ['Installed size', 'Telepített méret', 'Installierte Größe', 'Taille installée', 'Tamaño instalado'],
    'Current version': ['Current version', 'Jelenlegi verzió', 'Aktuelle Version', 'Version actuelle', 'Versión actual'],
    'Content rating': ['Content rating', 'Tartalom besorolása', 'Altersfreigabe', 'Classification du contenu', 'Calificación de contenido'],
    'Everyone': ['Everyone', 'Mindenki', 'Alle', 'Tous', 'Para todos'],
    'Permission details': ['Permission details', 'Engedély részletei', 'Berechtigungsdetails', 'Détails des autorisations', 'Detalles de permisos'],
    'Updated': ['Updated', 'Frissítve', 'Aktualisiert', 'Mise à jour', 'Actualizada'],
    'Installs': ['Installs', 'Telepítések', 'Installationen', 'Installations', 'Instalaciones'],
    'Installed group': ['Installed', 'Telepítve', 'Installiert', 'Installées', 'Instaladas'],
    'Recently updated': ['Recently updated', 'Nemrég frissítve', 'Kürzlich aktualisiert', 'Mises à jour récentes', 'Actualizadas recientemente'],
    'Uninstalled': ['Not installed', 'Nincs telepítve', 'Nicht installiert', 'Non installée', 'No instalada'],
    'Photos/Media/Files': ['Photos/Media/Files', 'Fotók/média/fájlok', 'Fotos/Medien/Dateien', 'Photos/Contenus multimédias/Fichiers', 'Fotos/multimedia/archivos'],
    'Wi-Fi connection information': ['Wi-Fi connection information', 'Wi-Fi kapcsolat adatai', 'WLAN-Verbindungsinformationen', 'Informations relatives à la connexion Wi-Fi', 'Información de conexión Wi-Fi'],
    'Other': ['Other', 'Egyéb', 'Sonstige', 'Autre', 'Otros'],
    // Permission labels from AOSP 4.4.4 frameworks/base core/res (permlab_sdcardWrite nosdcard, permlab_accessWifiState, permlab_vibrate).
    'modify or delete the contents of your USB storage': ['modify or delete the contents of your USB storage', 'USB-tár törlése/módosítása', 'USB-Speicherinhalte ändern oder löschen', 'modifier ou supprimer le contenu de la mémoire USB', 'editar o borrar contenido de USB'],
    'view Wi-Fi connections': ['view Wi-Fi connections', 'Wi-Fi kapcsolatok megtekintése', 'WLAN-Verbindungen abrufen', 'afficher les connexions Wi-Fi', 'ver conexiones Wi-Fi'],
    'control vibration': ['control vibration', 'rezgés szabályozása', 'Vibrationsalarm steuern', 'contrôler le vibreur', 'controlar la vibración'],
    'Share': ['Share', 'Megosztás', 'Teilen', 'Partager', 'Compartir'],
  };
  const LANGS = ['en', 'hu', 'de', 'fr', 'es'];
  const text = (lang, key) => (S[key] || [key])[Math.max(0, LANGS.indexOf(lang))] ?? key;
  const VERSION = '4.8.22';
  // The 4.x section colours (sampled from the 4.8.22 captures): the home tiles, and the section action bars a shade darker.
  // Magazines became Newsstand in November 2013.
  // Play Store 5.2 corpus colours (play_*_primary / _secondary).
  const SECTIONS = [['apps', 'Apps', '#689f38', '#558b2f'], ['games', 'Games', '#689f38', '#558b2f'], ['movies', 'Movies & TV', '#ed3b3b', '#d23f31'], ['music', 'Music', '#ef6c00', '#e65100'], ['books', 'Books', '#039be5', '#0277bd'], ['magazines', 'Newsstand', '#536dfe', '#3f51b5']];
  const TABS = {
    apps: ['CATEGORIES', 'HOME', 'TOP PAID', 'TOP FREE', 'TOP GROSSING', 'TOP NEW PAID', 'TOP NEW FREE', 'TRENDING'],
    games: ['CATEGORIES', 'HOME', 'TOP PAID', 'TOP FREE', 'TOP GROSSING', 'TOP NEW PAID', 'TOP NEW FREE', 'TRENDING'],
    music: ['GENRES', 'HOME', 'TOP ALBUMS', 'TOP SONGS', 'NEW RELEASES'],
    books: ['CATEGORIES', 'HOME', 'TOP SELLING', 'NEW RELEASES', 'TOP FREE'],
    movies: ['CATEGORIES', 'HOME', 'TOP SELLING', 'NEW RELEASES'],
    magazines: ['CATEGORIES', 'HOME', 'TOP SELLING']
  };
  const EXTRA = [
    {id: 'lunar-golf', kind: 'games', art: 'golf', name: 'Lunar Golf', developer: 'Crater Games', rating: 4.4, price: '$0.99', size: '9.8MB', description: 'Eighteen holes in low gravity.', whatsnew: 'New night course.'},
    {id: 'pocket-planner', kind: 'apps', art: 'planner', name: 'Pocket Planner', developer: 'Quiet Tools', rating: 4.3, price: '$1.99', size: '1.6MB', description: 'Plan your week on one simple page.', whatsnew: 'Now with a KitKat widget.'},
    {id: 'album-first-light', kind: 'music', name: 'First Light', developer: 'The Demo Tapes', rating: 4.6, price: '$5.99', colors: ['#2c3e57', '#f1b45d'], description: '12 songs. Includes "Blue Horizon" and "Afterglow".'},
    {id: 'album-after-hours', kind: 'music', name: 'After Hours', developer: 'The Demo Tapes', rating: 4.4, price: '$6.99', colors: ['#1c1530', '#b65fd8'], description: '10 songs. Includes "Night Drive".'},
    {id: 'album-small-worlds', kind: 'music', name: 'Small Worlds', developer: 'Paper Satellites', rating: 4.5, price: '$3.99', colors: ['#14403a', '#7fd6b4'], description: '9 songs. Includes "City Lights".'},
    {id: 'book-pride', kind: 'books', name: 'Pride and Prejudice', developer: 'Jane Austen', rating: 4.6, price: 'FREE', colors: ['#5d4a3a', '#c9b48a']},
    {id: 'book-holmes', kind: 'books', name: 'The Adventures of Sherlock Holmes', developer: 'Arthur Conan Doyle', rating: 4.7, price: 'FREE', colors: ['#28323c', '#a7b4bd']},
    {id: 'book-alice', kind: 'books', name: 'Alice\'s Adventures in Wonderland', developer: 'Lewis Carroll', rating: 4.5, price: 'FREE', colors: ['#3a5f8a', '#f0d48a']},
    {id: 'movie-orbit', kind: 'movies', name: 'Orbit Hopper: The Movie', developer: 'Animation', rating: 4.1, price: '$3.99', colors: ['#141c3a', '#8f7fff']},
    {id: 'movie-quiet', kind: 'movies', name: 'A Quiet Afternoon', developer: 'Drama', rating: 3.9, price: '$2.99', colors: ['#3a2a1c', '#e0a868']},
    {id: 'mag-pocket-tech', kind: 'magazines', name: 'Pocket Tech Monthly', developer: 'July 2014', rating: 4.2, price: '$2.99', colors: ['#1d2b45', '#5fb3e8'], description: 'Phones, tablets and the apps that matter. Single issue.'},
    {id: 'mag-trail', kind: 'magazines', name: 'Trail & Summit', developer: 'August 2014', rating: 4.4, price: '$3.99', colors: ['#2d3a1f', '#c9a85a'], description: 'Hiking routes, gear and mountain stories.'},
    {id: 'mag-kitchen', kind: 'magazines', name: 'Weekend Kitchen', developer: 'Summer 2014', rating: 4.0, price: '$1.99', colors: ['#5a2018', '#f2b35e'], description: 'Fifty easy recipes for long summer evenings.'}
  ];
  const DATES = ['July 18, 2014', 'July 2, 2014', 'June 14, 2014', 'May 30, 2014'];
  const catalog = () => (window.ICSPlayStore?.catalog || []).map((item, i) => ({...item, kind: item.category === 'Games' ? 'games' : 'apps', price: 'FREE', downloads: ['10,000,000+', '1,000,000+', '500,000+', '100,000+'][i % 4], votes: 12000 + i * 4173, updated: DATES[i % 4], plus: 120 + i * 37, size: String(item.size || '').replace(' ', ''), whatsnew: 'Bug fixes and performance improvements.'}));
  const all = () => [...catalog(), ...EXTRA.map(item => ({downloads: '50,000+', votes: 812, plus: 46, updated: item.kind === 'magazines' ? 'July 9, 2014' : 'June 3, 2014', size: item.kind === 'books' ? '1.2MB' : item.kind === 'magazines' ? '24MB' : item.kind === 'music' ? '96MB' : item.kind === 'movies' ? '820MB' : item.size, description: item.kind === 'books' ? 'A classic, free from Google Play Books.' : item.kind === 'movies' ? 'Rent and watch within 30 days.' : '', ...item}))];
  const find = id => all().find(item => item.id === id);
  const isApp = item => item.kind === 'apps' || item.kind === 'games';
  const installedState = (item, ctx) => item.app ? 'installed' : ctx.installed.includes(item.id) ? 'installed' : ctx.downloading === item.id ? ctx.phase : '';
  const sec = kind => SECTIONS.find(s => s[0] === kind) || SECTIONS[0];
  const stars = rating => `<span class="jbp-stars" aria-label="${rating}">${[1, 2, 3, 4, 5].map(n => `<i class="${rating >= n - .25 ? 'on' : rating >= n - .75 ? 'half' : ''}"></i>`).join('')}</span>`;
  const ICONS = {
    orbit: '<svg viewBox="0 0 48 48"><defs><radialGradient id="jp" cx=".35" cy=".3"><stop offset="0" stop-color="#ffd27a"/><stop offset="1" stop-color="#d0631e"/></radialGradient></defs><rect x="2" y="2" width="44" height="44" rx="9" fill="#152049"/><circle cx="12" cy="12" r="1" fill="#fff"/><circle cx="37" cy="9" r="1.2" fill="#fff"/><circle cx="38" cy="36" r=".9" fill="#fff"/><circle cx="24" cy="25" r="10" fill="url(#jp)"/><ellipse cx="24" cy="25" rx="18" ry="5" fill="none" stroke="#9fd8ff" stroke-width="2.2" transform="rotate(-18 24 25)"/></svg>',
    blocks: '<svg viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#2b2b2b"/><g stroke="#0006" stroke-width="1"><rect x="8" y="26" width="10" height="10" fill="#ff5a4e"/><rect x="18" y="26" width="10" height="10" fill="#ffc533"/><rect x="28" y="26" width="10" height="10" fill="#45c1ff"/><rect x="18" y="16" width="10" height="10" fill="#7bd448"/><rect x="28" y="16" width="10" height="10" fill="#b77bff"/><rect x="28" y="6" width="10" height="10" fill="#ff8bc4"/></g></svg>',
    golf: '<svg viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#0c1022"/><circle cx="24" cy="40" r="20" fill="#b9bfd0"/><circle cx="17" cy="33" r="3" fill="#8e95aa"/><circle cx="31" cy="36" r="2" fill="#8e95aa"/><path d="M28 30V10l9 4-9 4" fill="#e04848" stroke="#ddd" stroke-width="1.2"/><circle cx="16" cy="24" r="2.4" fill="#fff"/></svg>',
    planner: '<svg viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#2a6fbd"/><rect x="10" y="12" width="28" height="26" rx="2" fill="#fff"/><rect x="10" y="12" width="28" height="7" rx="2" fill="#e8453c"/><g fill="#9aa7b5"><rect x="14" y="23" width="5" height="4"/><rect x="21" y="23" width="5" height="4"/><rect x="28" y="23" width="5" height="4"/><rect x="14" y="30" width="5" height="4"/><rect x="21" y="30" width="5" height="4"/></g><path d="M28 31l3 3 6-7" fill="none" stroke="#3da543" stroke-width="2.4"/></svg>'
  };
  const art = (item, cls = 'jbp-icon') => item.app ? `<img class="${cls}" src="assets/${item.app}.png" alt="">`
    : ICONS[item.art] ? `<i class="${cls} jbp-svg" aria-hidden="true">${ICONS[item.art]}</i>`
    : `<i class="${cls} jbp-cover ${item.kind || ''}" style="--a:${(item.colors || ['#2f4f6f', '#8fc0e8'])[0]};--b:${(item.colors || ['#2f4f6f', '#8fc0e8'])[1]}" aria-hidden="true"><b>${e((item.name || '?').slice(0, 1))}</b></i>`;
  const price = (item, ctx) => item.price === 'FREE' ? text(ctx.lang, 'FREE') : item.price;

  // The action bar: #666 at the top level and in Settings, the section colour inside a section. Top-level pages (Store
  // home, My apps, My wishlist) show the drawer indicator next to the white Play glyph; the others the up caret. Since
  // 4.6 there is no overflow menu; on the details page share sits left of the search, which 4.8 moved to the far right.
  function header(ctx, title, opts = {}) {
    const color = opts.color || '#689f38';
    const glyph = '<i class="jbp-glyph" aria-hidden="true"></i>';
    const up = opts.drawer ? `<button class="jbp-up kkp-nav" data-action="kkp-drawer" aria-label="${e(text(ctx.lang, 'Store home'))}"><span class="kkp-ind" aria-hidden="true"></span>${glyph}</button>` : `<button class="jbp-up" data-action="back" aria-label="Back"><span>‹</span>${glyph}</button>`;
    if (ctx.searching) return `<form class="jbp-bar searching" style="--bar:${color}" data-form="jbp-search">${up}<input name="query" autocomplete="off" aria-label="${e(text(ctx.lang, 'Search Google Play'))}" placeholder="${e(text(ctx.lang, 'Search Google Play'))}" value="${e(ctx.editValue || '')}"><button class="jbp-search" type="submit" aria-label="${e(text(ctx.lang, 'Search Google Play'))}"></button></form>`;
    return `<div class="jbp-bar" style="--bar:${color}">${up}<b>${e(title)}</b>${opts.share ? `<button class="jbp-share" data-action="jbp-unavailable" aria-label="${e(text(ctx.lang, 'Share'))}"></button>` : ''}${opts.noSearch ? '' : `<button class="jbp-search" data-action="jbp-search" aria-label="${e(text(ctx.lang, 'Search Google Play'))}"></button>`}</div>`;
  }
  function suggestions(ctx) {
    if (!ctx.searching) return '';
    const q = String(ctx.editValue || '').trim().toLocaleLowerCase(ctx.locale);
    const list = q ? all().filter(item => item.name.toLocaleLowerCase(ctx.locale).includes(q)).slice(0, 5).map(item => ({id: item.id, name: item.name})) : ctx.history.slice(0, 5).map(name => ({id: '', name}));
    return list.length ? `<div class="jbp-suggest">${list.map(s => `<button type="button" data-action="${s.id ? 'jbp-detail' : 'jbp-search-run'}" data-id="${e(s.id || s.name)}"><i class="${s.id ? 'item' : 'recent'}"></i><span>${e(s.name)}</span></button>`).join('')}</div>` : '';
  }
  const view = (ctx, cls, head, body) => `<div class="app-view jbp kkp ${cls}" data-no-translate>${head}<div class="jbp-scroll">${body}</div>${suggestions(ctx)}</div>`;

  // A card (PlayCardView): the art, the two-line title, the overflow dots, then grey stars and the price in the section
  // colour, or the green round check once the item is installed.
  function card(item, ctx) {
    const state = installedState(item, ctx), [, , color] = sec(item.kind);
    const foot = state === 'installed' ? `<i class="kkp-check" role="img" aria-label="${e(text(ctx.lang, 'INSTALLED'))}"></i>` : `<em style="color:${color}">${e(price(item, ctx))}</em>`;
    return `<div class="jbp-card ${item.kind}"><button class="jbp-card-main" data-action="jbp-detail" data-id="${e(item.id)}">${art(item, 'jbp-card-art')}<span class="jbp-card-copy"><b>${e(item.name)}</b><span class="jbp-card-foot">${isApp(item) ? stars(item.rating) : `<small>${e(item.developer)}</small>`}${foot}</span></span></button><button class="jbp-dots" data-action="jbp-card-menu" data-id="${e(item.id)}" aria-label="More options"></button></div>`;
  }
  // The wide card of "See What's Trending": the big art on the left, title, stars, price and the editorial blurb.
  function wide(item, ctx) {
    const state = installedState(item, ctx), [, , color] = sec(item.kind);
    const foot = state === 'installed' ? `<i class="kkp-check" role="img" aria-label="${e(text(ctx.lang, 'INSTALLED'))}"></i>` : `<em style="color:${color}">${e(price(item, ctx))}</em>`;
    return `<div class="kkp-wide"><button class="kkp-wide-main" data-action="jbp-detail" data-id="${e(item.id)}">${art(item, 'kkp-wide-art')}<span class="kkp-wide-copy"><b>${e(item.name)}</b><span class="kkp-wide-meta">${stars(item.rating)}${foot}</span><small>${e(item.description || '')}</small></span></button><button class="jbp-dots" data-action="jbp-card-menu" data-id="${e(item.id)}" aria-label="More options"></button></div>`;
  }
  const cluster = (title, sub, kind, body, ctx, target, tab) => {
    const [, , color] = sec(kind);
    return `<section class="jbp-cluster"><header><span><h3>${e(title)}</h3>${sub ? `<small>${e(sub)}</small>` : ''}</span><button class="jbp-more" style="background:${color}" data-action="jbp-section" data-id="${e(target || kind)}"${tab ? ` data-tab="${e(tab)}"` : ''}>${e(text(ctx.lang, 'MORE'))}</button></header>${body}</section>`;
  };
  const cards = (items, ctx) => `<div class="jbp-cards">${items.filter(Boolean).slice(0, 3).map(item => card(item, ctx)).join('')}</div>`;
  // Store home (4.8.22): the six striped tiles, the green "simplified permissions" note until it is dismissed, then the
  // clusters.
  function home(ctx) {
    const T = key => text(ctx.lang, key), items = all();
    const tiles = SECTIONS.map(([id, label, color]) => `<button class="jbp-cat ${id}" style="--c:${color}" data-action="jbp-section" data-id="${id}"><i class="jbp-cat-icon ${id}"></i><b>${e(T(label))}</b></button>`).join('');
    const games = items.filter(i => i.kind === 'games'), apps = items.filter(isApp), trending = [...apps].sort((a, b) => b.votes - a.votes)[0];
    const note = ctx.permNoteSeen ? '' : `<div class="kkp-note"><span>${e(T('Simplified permissions'))}</span><button data-action="kkp-note">${e(T('LEARN MORE'))}</button></div>`;
    return view(ctx, 'jbp-home', header(ctx, T('Play Store'), {drawer: true}),
      `<div class="jbp-cats">${tiles}</div>${note}${cluster(T('New + Updated Games'), '', 'games', cards(games, ctx), ctx)}${trending ? cluster(T("See What's Trending"), T('Trending sub'), 'apps', wide(trending, ctx), ctx, 'apps', 'TRENDING') : ''}${cluster(T('Recommended for You'), T('Staff Picks sub'), 'apps', cards([find('pocket-planner'), apps[2], apps[3]], ctx), ctx)}${cluster(T('Albums from'), T('Albums sub'), 'music', cards(items.filter(i => i.kind === 'music'), ctx), ctx)}${cluster(T('Free classics'), T('Free classics sub'), 'books', cards(items.filter(i => i.kind === 'books'), ctx), ctx)}`);
  }
  // A section: the coloured action bar, the scrolling tab strip with the underlined current tab, then HOME (clusters of
  // cards), CATEGORIES (a list) or a numbered top list.
  function section(ctx) {
    const T = key => text(ctx.lang, key), [id, label, color, bar] = sec(ctx.section);
    const tabs = TABS[id], tab = tabs.includes(ctx.tab) ? ctx.tab : 'HOME';
    const strip = `<div class="jbp-tabs" style="--c:${bar}" data-jbp-swipe>${tabs.map(t => `<button class="${t === tab ? 'on' : ''}" data-action="jbp-tab" data-id="${e(t)}">${e(T(t))}</button>`).join('')}</div>`;
    const items = all().filter(item => item.kind === id);
    let body;
    if (tab === 'CATEGORIES' || tab === 'GENRES') {
      const cats = {games: ['Arcade & Action', 'Brain & Puzzle', 'Cards & Casino', 'Casual', 'Live Wallpaper', 'Racing', 'Sports Games', 'Widgets'], apps: ['Books & Reference', 'Business', 'Comics', 'Communication', 'Education', 'Entertainment', 'Finance', 'Health & Fitness', 'Music & Audio', 'Photography', 'Productivity', 'Tools'], music: ['Alternative', 'Classical', 'Electronica', 'Pop', 'Rock', 'Soundtracks'], books: ['Fiction', 'Classics', 'Mystery', 'Children\'s'], movies: ['Action & Adventure', 'Animation', 'Comedy', 'Drama', 'Family'], magazines: ['Business & News', 'Entertainment', 'Food & Cooking', 'Sports & Outdoors', 'Technology']}[id];
      body = `<div class="jbp-catlist">${cats.map(c => `<button data-action="jbp-tab" data-id="${e(tabs[2])}">${e(c)}</button>`).join('')}</div>`;
    } else if (tab === 'HOME') {
      const top = [...items].sort((a, b) => b.rating - a.rating);
      body = `${cluster(T('Highlights'), T('Staff Picks sub'), id, cards(top.slice(0, 3), ctx), ctx, id)}${top.length > 3 ? cluster(T('Staff Picks'), T(label), id, cards(top.slice(3, 6), ctx), ctx, id) : ''}`;
    } else {
      const sorted = [...items].sort((a, b) => tab === 'TRENDING' || tab === 'NEW RELEASES' ? a.name.localeCompare(b.name) : b.rating - a.rating).filter(item => tab.includes('PAID') || tab === 'TOP SELLING' ? item.price !== 'FREE' : tab.includes('FREE') ? item.price === 'FREE' : true);
      body = sorted.length ? `<div class="jbp-list">${sorted.map((item, n) => row(item, ctx, n + 1)).join('')}</div>` : `<p class="jbp-empty">${e(T('No results'))}</p>`;
    }
    return view(ctx, `jbp-section ${id}`, header(ctx, T(label), {color: bar}) + strip, body);
  }
  // List rows (4.0 "PlayCardViewSmall" in a list): icon, "n. Title", creator, stars and the price or PURCHASED / INSTALLED.
  function row(item, ctx, n) {
    const state = installedState(item, ctx), [, , color] = sec(item.kind);
    const status = state === 'installed' ? `<em class="ok">${e(text(ctx.lang, 'INSTALLED'))}</em>` : ctx.everInstalled?.includes(item.id) ? `<em class="ok check">${e(text(ctx.lang, 'PURCHASED'))}</em>` : `<em style="color:${color}">${e(price(item, ctx))}</em>`;
    return `<div class="jbp-row"><button class="jbp-row-main" data-action="jbp-detail" data-id="${e(item.id)}">${art(item, 'jbp-row-art')}<span class="jbp-row-copy"><b>${n ? `${n}. ` : ''}${e(item.name)}</b><small>${e(item.developer)}</small>${stars(item.rating)}</span>${status}</button><button class="jbp-dots" data-action="jbp-card-menu" data-id="${e(item.id)}" aria-label="More options"></button></div>`;
  }
  const REVIEWS = [
    {author: 'Joseph', date: 'July 21, 2014', stars: 5, text: 'Exactly what I was looking for. Works great on my Nexus 5.'},
    {author: 'James', date: 'July 12, 2014', stars: 4, text: 'Faster than the last version. Love the new widget.'},
    {author: 'Maria', date: 'June 30, 2014', stars: 4, text: 'Simple and pretty. Does what it says.'}
  ];
  function reviews(item, ctx) {
    const T = key => text(ctx.lang, key), total = item.votes, shares = [.62, .2, .09, .04, .05].map((s, i) => Math.round(total * (s + (item.rating - 4.4) * (i ? -.04 : .16))));
    const max = Math.max(...shares), colors = ['#8fc04f', '#b1d06b', '#ffcf4a', '#ffad54', '#ff8d6b'];
    return `<div class="jbp-reviews"><h4>${e(T('Reviews'))}</h4><div class="jbp-hist"><div class="jbp-avg"><b>${item.rating.toLocaleString(ctx.locale, {minimumFractionDigits: 1})}</b>${stars(item.rating)}<small>${total.toLocaleString(ctx.locale)}</small></div><div class="jbp-bars">${shares.map((n, i) => `<span><small>${5 - i}</small><i style="width:${Math.max(2, Math.round(n / max * 100))}%;background:${colors[i]}"></i><em>${Math.max(0, n).toLocaleString(ctx.locale)}</em></span>`).join('')}</div></div>${REVIEWS.map(r => `<div class="jbp-review"><span>${stars(r.stars)}<strong>${e(r.author)}</strong><small>${e(r.date)}</small></span><p>${e(r.text)}</p></div>`).join('')}</div>`;
  }
  // Details (4.8.22): the header with the big icon, title and creator, then the green INSTALL (or the price) or the white
  // OPEN and UNINSTALL buttons; screenshots, stats, +1, "Rate this app", What's new, Description, Reviews and the
  // "Additional information" block that 4.8 added with its "Permission details" link.
  function detail(ctx) {
    const T = key => text(ctx.lang, key), item = find(ctx.selected);
    if (!item) return home(ctx);
    const state = installedState(item, ctx), [, , , bar] = sec(item.kind);
    let buttons;
    if (state === 'installed') buttons = `<span class="jbp-btns"><button class="jbp-btn" data-action="jbp-open" data-id="${e(item.id)}">${e(T('OPEN'))}</button><button class="jbp-btn" data-action="jbp-uninstall" data-id="${e(item.id)}"${item.app ? ' disabled' : ''}>${e(T('UNINSTALL'))}</button></span>`;
    else if (state === 'downloading' || state === 'installing') buttons = `<span class="jbp-dl"><small>${e(T(state === 'installing' ? 'Installing…' : 'Downloading…'))}</small><i class="jbp-progress"><b style="width:${state === 'installing' ? 100 : Math.round(ctx.progress * 100)}%;background:${bar}"></b></i><button class="jbp-dl-cancel" data-action="jbp-cancel" aria-label="${e(T('Cancel'))}"></button></span>`;
    else buttons = `<span class="jbp-btns"><button class="jbp-btn buy" style="--c:${bar}" data-action="jbp-buy" data-id="${e(item.id)}">${e(item.price === 'FREE' ? T('INSTALL') : item.price)}</button></span>`;
    const shots = isApp(item) ? `<div class="jbp-shots">${[0, 1, 2].map(n => `<span class="jbp-shot n${n}" style="--a:${(item.colors || ['#2a3a4a', '#9fc33b'])[0]};--b:${(item.colors || ['#2a3a4a', '#9fc33b'])[1]}">${art(item, 'jbp-shot-art')}</span>`).join('')}</div>` : '';
    const rated = ctx.rated?.[item.id] || 0;
    const info = [['Current version', isApp(item) ? (item.version || '1.0') : ''], ['Installed size', item.size || ''], ['Content rating', T('Everyone')]].filter(([, v]) => v);
    return view(ctx, 'jbp-detail', header(ctx, T(sec(item.kind)[1]), {color: bar, share: true}), `<div class="jbp-head">${art(item, 'jbp-head-art')}<span class="jbp-head-copy"><b>${e(item.name)}</b><small>${e(item.developer.toUpperCase())}</small>${buttons}</span></div>${shots}
      <div class="jbp-facts"><span>${stars(item.rating)} ${item.votes.toLocaleString(ctx.locale)}</span><span>${e(item.updated)}</span><span>${e(item.downloads)} ${e(T('downloads'))}</span><span>${e(item.size || '')}</span></div>
      <div class="jbp-plus"><button data-action="jbp-plus" data-id="${e(item.id)}" class="${ctx.plussed.includes(item.id) ? 'on' : ''}">+1</button><span>${item.plus + (ctx.plussed.includes(item.id) ? 1 : 0)} ${e(T('people +1\'d this'))}</span></div>
      ${isApp(item) ? `<div class="jbp-rate"><h4>${e(T('Rate this app'))}</h4><span class="jbp-rate-stars">${[1, 2, 3, 4, 5].map(n => `<button class="${n <= rated ? 'on' : ''}" data-action="jbp-rate" data-id="${n}" aria-label="${n}"></button>`).join('')}</span></div>` : ''}
      ${state === 'installed' && !item.app ? `<label class="jbp-auto"><input type="checkbox" data-jbp-auto="${e(item.id)}"${ctx.autoUpdate.includes(item.id) ? ' checked' : ''}><span>${e(T('Allow automatic updating'))}</span></label>` : ''}
      ${item.whatsnew ? `<div class="jbp-text"><h4>${e(T("What's new"))}</h4><p>${e(item.whatsnew)}</p></div>` : ''}<div class="jbp-text"><h4>${e(T('Description'))}</h4><p>${e(item.description || '')}</p></div>${reviews(item, ctx)}
      <div class="jbp-text kkp-info"><h4>${e(T('Additional information'))}</h4><dl>${info.map(([k, v]) => `<dt>${e(T(k))}</dt><dd>${e(v)}</dd>`).join('')}</dl>${isApp(item) ? `<button class="kkp-perm-link" data-action="kkp-perm-details" data-id="${e(item.id)}">${e(T('Permission details'))}</button>` : ''}</div>`);
  }
  // My apps (4.8): the green bar with the drawer indicator, INSTALLED / ALL; "Recently updated" holds what the store put
  // on the phone, "Installed" the rest, each a white card with the INSTALLED label.
  function myApps(ctx) {
    const T = key => text(ctx.lang, key), tab = ctx.tab === 'ALL' ? 'ALL' : 'INSTALLED';
    const installed = all().filter(item => installedState(item, ctx) === 'installed').sort((a, b) => a.name.localeCompare(b.name));
    const strip = `<div class="jbp-tabs few" style="--c:#96aa39" data-jbp-swipe>${['INSTALLED', 'ALL'].map(t => `<button class="${t === tab ? 'on' : ''}" data-action="jbp-tab" data-id="${t}">${e(T(t))}</button>`).join('')}</div>`;
    const group = (title, items) => items.length ? `<div class="jbp-group"><span>${e(title)}</span><b>${items.length}</b></div><div class="jbp-list">${items.map(item => row(item, ctx)).join('')}</div>` : '';
    const body = tab === 'ALL'
      ? `<div class="jbp-list">${all().filter(isApp).filter(item => installedState(item, ctx) === 'installed' || ctx.everInstalled.includes(item.id)).sort((a, b) => a.name.localeCompare(b.name)).map(item => row(item, ctx)).join('')}</div>`
      : group(T('Recently updated'), installed.filter(item => !item.app)) + group(T('Installed group'), installed.filter(item => item.app));
    return view(ctx, 'jbp-myapps', header(ctx, T('My apps'), {color: '#96aa39', drawer: true}) + strip, body);
  }
  function wishlist(ctx) {
    const T = key => text(ctx.lang, key), items = (ctx.wishlist || []).map(find).filter(Boolean);
    return view(ctx, 'jbp-wishlist', header(ctx, T('My wishlist'), {drawer: true}), items.length ? `<div class="jbp-cards wrap">${items.map(item => card(item, ctx)).join('')}</div>` : `<p class="jbp-empty">${e(T('Wishlist empty'))}</p>`);
  }
  function search(ctx) {
    const q = String(ctx.query || '').trim().toLocaleLowerCase(ctx.locale), items = q ? all().filter(item => `${item.name} ${item.developer}`.toLocaleLowerCase(ctx.locale).includes(q)) : [];
    return view(ctx, 'jbp-results', header(ctx, ctx.query || ''), items.length ? `<div class="jbp-list">${items.map(item => row(item, ctx)).join('')}</div>` : `<p class="jbp-empty">${e(text(ctx.lang, 'No results'))}</p>`);
  }
  const PASSWORD_ROWS = [['always', 'Password always'], ['30', 'Every 30 minutes'], ['never', 'Never']], PASSWORD = Object.fromEntries(PASSWORD_ROWS);
  // Settings (4.8.22): General (Notifications, Auto-update apps, Add icon to Home screen, Clear search history), User
  // controls (Content filtering, Require password for purchases) and About.
  function settings(ctx) {
    const T = key => text(ctx.lang, key), s = ctx.prefs;
    const cat = title => `<h3 class="jbp-pref-cat">${e(T(title))}</h3>`;
    const chk = (key, title, summary) => `<button class="jbp-pref" data-action="jbp-pref" data-id="${key}" role="checkbox" aria-checked="${!!s[key]}"><span><b>${e(T(title))}</b><small>${e(T(summary))}</small></span><img src="assets/btn_check_${s[key] ? 'on' : 'off'}_holo_light.png" alt=""></button>`;
    const plain = (action, title, summary) => `<button class="jbp-pref" data-action="${action}"><span><b>${e(T(title))}</b><small>${e(T(summary))}</small></span></button>`;
    const auto = {never: 'Auto-update never', any: 'Auto-update any', wifi: 'Auto-update wifi'}[s.autoMode || 'wifi'];
    return `<div class="app-view jbp kkp jbp-settings" data-no-translate>${header({...ctx, searching: false}, T('Settings'), {noSearch: true})}<div class="jbp-scroll">${cat('General')}${chk('notify', 'Notifications', 'Notifications summary')}${plain('jbp-auto-update', 'Auto-update apps', auto)}${chk('widgets', 'Add icon to Home screen', 'For new apps')}${plain('jbp-clear-history', 'Clear search history', 'Clear search history summary')}${cat('User controls')}${plain('jbp-unavailable', 'Content filtering', 'Content filtering summary')}${plain('kkp-password', 'Require password for purchases', PASSWORD[s.password] || PASSWORD['30'])}${cat('About')}${plain('jbp-unavailable', 'Open source licenses', 'Licenses summary')}<div class="jbp-pref info"><span><b>${e(T('Build version'))}</b><small>${e(T('Version').replace('%s', VERSION))}</small></span></div></div></div>`;
  }
  // The 4.8 install dialog: "<app> needs access to", the permission groups with their icons and expand chevrons (the
  // generic network access is no longer listed), the Google play wordmark and ACCEPT. From "Permission details" it only
  // informs, so ACCEPT becomes OK.
  const PERM_GROUPS = {
    files: ['Photos/Media/Files', 'modify or delete the contents of your USB storage'],
    wifi: ['Wi-Fi connection information', 'view Wi-Fi connections'],
    other: ['Other', 'control vibration']
  };
  function permissions(item, ctx) {
    const T = key => text(ctx.lang, key), groups = item.kind === 'games' ? ['files', 'other'] : ['files', 'wifi'];
    const open = ctx.permOpen || '';
    return `<div class="jbp-dlg-scrim" data-action="close-overlay"></div><div class="jbp-dlg perms kkp-perms" role="dialog" aria-label="${e(T('App permissions'))}"><div class="jbp-dlg-head">${art(item, 'jbp-dlg-art')}<span><b>${e(item.name)}</b><small>${e(T('Needs access to'))}</small></span></div><div class="kkp-perm-list">${groups.map(id => `<button class="kkp-perm${open === id ? ' open' : ''}" data-action="kkp-perm" data-id="${id}" aria-expanded="${open === id}"><i class="kkp-perm-icon ${id}"></i><span>${e(T(PERM_GROUPS[id][0]))}</span><i class="kkp-chev"></i></button>${open === id ? `<p class="kkp-perm-detail">${e(T(PERM_GROUPS[id][1]))}</p>` : ''}`).join('')}</div><div class="kkp-perm-foot"><i class="kkp-gplay" aria-label="Google play"></i>${ctx.permView ? `<button class="jbp-accept" data-action="close-overlay">${e(T('OK'))}</button>` : `<button class="jbp-accept" data-action="jbp-accept" data-id="${e(item.id)}">${e(T('ACCEPT'))}</button>`}</div></div>`;
  }
  // The navigation drawer (4.4 → 4.8): the account header on its dark pattern, Store home / My apps / My wishlist with
  // the current one in bold, then Redeem, Settings and Help as small caps rows with icons on the light grey footer.
  function drawer(ctx) {
    const T = key => text(ctx.lang, key), cur = ctx.page === 'my-apps' ? 'my-apps' : ctx.page === 'wishlist' ? 'wishlist' : ctx.page === 'home' ? 'home' : '';
    const item = (id, action, label) => `<button class="kkp-nav-item${cur === id ? ' on' : ''}" data-action="${action}">${e(T(label))}</button>`;
    const small = (icon, action, label) => `<button class="kkp-nav-small" data-action="${action}"><i class="kkp-nav-icon ${icon}"></i>${e(T(label).toLocaleUpperCase(ctx.locale))}</button>`;
    return `<div class="kkp-drawer-scrim" data-action="close-overlay"></div><nav class="kkp-drawer" aria-label="${e(T('Play Store'))}"><button class="kkp-account" data-action="jbp-unavailable"><i class="kkp-avatar"></i><span><b>Demo User</b><small>demo@example.com</small></span><i class="kkp-account-caret"></i></button><div class="kkp-nav-main">${item('home', 'kkp-home', 'Store home')}${item('my-apps', 'jbp-my-apps', 'My apps')}${item('wishlist', 'jbp-wishlist', 'My wishlist')}</div><div class="kkp-nav-foot">${small('redeem', 'jbp-unavailable', 'Redeem')}${small('settings', 'jbp-settings', 'Settings')}${small('help', 'jbp-unavailable', 'Help')}</div></nav>`;
  }
  function render(ctx) {
    if (ctx.page === 'section') return section(ctx);
    if (ctx.page === 'detail') return detail(ctx);
    if (ctx.page === 'my-apps') return myApps(ctx);
    if (ctx.page === 'wishlist') return wishlist(ctx);
    if (ctx.page === 'search') return search(ctx);
    if (ctx.page === 'settings') return settings(ctx);
    return home(ctx);
  }
  // No overflow menu since 4.6: everything lives in the drawer.
  const menu = () => [];
  // Popups and dialogs: the drawer, the card overflow (Add to wishlist / Buy or Install), the permissions dialog, the
  // auto-update list and the Require password list.
  function dialog(kind, ctx) {
    const T = key => text(ctx.lang, key), item = find(ctx.target || ctx.selected);
    if (kind === 'drawer') return drawer(ctx);
    if (kind === 'card' && item) {
      const wished = (ctx.wishlist || []).includes(item.id), state = installedState(item, ctx);
      const buy = state === 'installed' ? '' : `<button data-action="jbp-buy" data-id="${e(item.id)}">${e(item.price === 'FREE' ? T('Install') : T('Buy').replace('%s', item.price))}</button>`;
      return `<div class="jbp-pop-scrim" data-action="close-overlay"></div><div class="jbp-pop" style="top:${ctx.popTop || 120}px" role="menu"><button data-action="jbp-wish" data-id="${e(item.id)}">${e(T(wished ? 'Remove from wishlist' : 'Add to wishlist'))}</button>${buy}</div>`;
    }
    if (kind === 'perms' && item) return permissions(item, ctx);
    const list = (title, rows, current, action) => `<div class="jbp-dlg-scrim" data-action="close-overlay"></div><div class="jbp-dlg list" role="dialog" aria-label="${e(T(title))}"><h3>${e(T(title))}</h3>${rows.map(([id, label]) => `<button class="jbp-dlg-row" data-action="${action}" data-id="${id}" role="radio" aria-checked="${current === id}"><span>${e(T(label))}</span><i class="${current === id ? 'on' : ''}"></i></button>`).join('')}<div class="jbp-dlg-actions"><button data-action="close-overlay">${e(T('Cancel'))}</button></div></div>`;
    if (kind === 'auto') return list('Auto-update apps', [['never', 'Auto-update never'], ['any', 'Auto-update any'], ['wifi', 'Auto-update wifi']], ctx.prefs.autoMode || 'wifi', 'jbp-auto-pick');
    if (kind === 'password') return list('Require password', PASSWORD_ROWS, ctx.prefs.password || '30', 'kkp-password-pick');
    return '';
  }
  window.JBPlay = {SECTIONS, TABS, EXTRA, VERSION, text, all, find, installedState, render, menu, dialog};
})();
