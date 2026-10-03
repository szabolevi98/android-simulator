/* The remaining launcher apps of the Nexus 5 factory image (KTU84P) as simple Holo screens, the way the Lollipop folder
   shows its extras: Play Newsstand 3.0.1 (magazines_actionbar_color #000000, the Read Now cards in its
   card_background_blue1 / blue2 / orange), Quickoffice 6.3.1 (the light home screen: "Open or create new files" with
   Drive / Device and "Create new file", then the recent files from the simulator's Drive) and Wallet 2.0 (US only,
   so English everywhere: the Wallet Balance tile and PAYMENT METHODS). Labels come from the APKs; content is offline
   and made up. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const APPS = ['newsstand', 'quickoffice', 'wallet'];
  // Launcher labels (Magazines, QuickOffice, Wallet) and Music2's MediaAppWidgetProvider label, as KTU84P ships them.
  window.AndroidI18n?.extend([
    ['Play Newsstand', 'Play Újságos', 'Play Kiosk', 'Google Play Kiosque', 'Play Kiosco'],
    ['Google Play Music', 'Google Play Zene', 'Google Play Music', 'Google Play Musique', 'Google Play Música']
  ]);
  // Screen texts from the APKs (Play Books uses "Read Now" with another translation, so these stay local).
  const STRINGS = {
    'Read Now': ['Olvasson most', 'Jetzt lesen', 'À lire', 'Leer ahora'],
    'Open or create new files': ['Fájlok megnyitása vagy új fájlok létrehozása', 'Öffnen oder neue Dateien erstellen', 'Ouvrir ou créer des fichiers', 'Abrir o crear archivos nuevos'],
    'Drive': ['Drive', 'Google Drive', 'Drive', 'Drive'],
    'Device': ['Készülék', 'Gerät', 'Appareil', 'Dispositivo'],
    'Create new file': ['Új fájl létrehozása', 'Neue Datei erstellen', 'Créer un fichier', 'Crear archivo nuevo'],
    'Recent files': ['Legújabb fájlok', 'Zuletzt verwendete Dateien', 'Fichiers récents', 'Archivos recientes']
  };
  const LANGS = ['hu', 'de', 'fr', 'es'];
  const local = (key, t) => { const i = LANGS.indexOf(window.AndroidI18n?.language); return STRINGS[key] && i >= 0 ? STRINGS[key][i] : t(key); };
  const svg = {
    drawer: '<svg viewBox="0 0 24 24"><path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" fill="currentColor"/></svg>',
    search: '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/></svg>',
    more: '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="19" r="2" fill="currentColor"/></svg>',
    doc: '<svg viewBox="0 0 24 24"><path d="M6 2h9l5 5v15H6zm8 1.5V8h4.5zM8 12h8v1.5H8zm0 3h8v1.5H8zm0 3h5v1.5H8z" fill="currentColor"/></svg>',
    drive: '<svg viewBox="0 0 24 24"><path d="M8.2 3h7.6l6 10.4-3.8 6.6H6l-3.8-6.6z" fill="currentColor"/></svg>',
    device: '<svg viewBox="0 0 24 24"><path d="M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm1 3v13h8V5z" fill="currentColor"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" fill="currentColor"/></svg>',
    card: '<svg viewBox="0 0 24 24"><path d="M3 5h18v14H3zm2 3v2h14V8zm0 5v4h14v-4z" fill="currentColor"/></svg>'
  };
  const KIND_COLOR = {doc: '#4285f4', sheet: '#0f9d58', slides: '#f4b400', pdf: '#db4437'};
  // A Holo action bar: the drawer indicator, the app icon and the title, then action buttons.
  const bar = (app, title, actions = '', cls = '') => `<header class="kkx-bar ${cls}"><button class="kkx-home" data-action="kkx-unavailable" aria-label="${e(title)}"><span class="kkx-drawer">${svg.drawer}</span><img src="assets/${app}.png" alt=""></button><h2>${e(title)}</h2>${actions}</header>`;
  const action = (icon, label) => `<button class="kkx-btn" data-action="kkx-unavailable" aria-label="${e(label)}">${svg[icon]}</button>`;
  function render(app, {files, ui, t}) {
    if (app === 'newsstand') {
      const stories = [['Material design comes to more apps', 'Gadget Weekly', '#15a0c8'], ['A weekend of trails above the city', 'Trail & Summit', '#4285f4'], ['Five autumn soups in thirty minutes', 'Weekend Kitchen', '#ef851c']];
      return `<div class="app-view kkx-app kkx-newsstand">${bar('newsstand', local('Read Now', t), action('search', t('Search')) + action('more', t('More options')), 'dark')}<div class="kkx-list kkx-cards">${stories.map(([title, source, color]) => `<article class="kkx-story"><div class="kkx-story-art" style="background:${color}"><b>${e(title)}</b></div><div class="kkx-story-copy"><small>${e(source)}</small></div></article>`).join('')}</div></div>`;
    }
    if (app === 'quickoffice') {
      const open = ui.sub && files.find(file => file.id === ui.sub);
      if (open) return `<div class="app-view kkx-app kkx-quickoffice">${bar('quickoffice', open.name)}<div class="kkx-page"><article class="kkx-paper">${open.text.split('\n').map(line => `<p>${e(line)}</p>`).join('')}</article></div></div>`;
      const recent = files.filter(file => KIND_COLOR[file.kind]).map(file => `<button class="kkx-file" data-action="kkx-open" data-id="${e(file.id)}"><span class="kkx-file-icon" style="color:${KIND_COLOR[file.kind]}">${svg.doc}</span><span class="kkx-file-copy"><strong>${e(file.name)}</strong><small>${e(file.date)}</small></span></button>`).join('');
      const tile = (icon, label) => `<button class="kkx-tile" data-action="kkx-unavailable"><span>${svg[icon]}</span>${e(label)}</button>`;
      return `<div class="app-view kkx-app kkx-quickoffice">${bar('quickoffice', 'Quickoffice®', action('more', t('More options')))}<div class="kkx-list"><h3 class="kkx-section">${e(local('Open or create new files', t))}</h3><div class="kkx-tiles">${tile('drive', local('Drive', t))}${tile('device', local('Device', t))}${tile('plus', local('Create new file', t))}</div><h3 class="kkx-section">${e(local('Recent files', t))}</h3>${recent}</div></div>`;
    }
    if (app === 'wallet') return `<div class="app-view kkx-app kkx-wallet">${bar('wallet', 'Wallet', action('more', 'More options'))}<div class="kkx-list"><div class="kkx-balance"><small>Wallet Balance</small><b>$0.00</b></div><h3 class="kkx-section">PAYMENT METHODS</h3><button class="kkx-file" data-action="kkx-unavailable"><span class="kkx-file-icon">${svg.card}</span><span class="kkx-file-copy"><strong>Tap and pay will not work. Add a card.</strong></span></button></div></div>`;
    return '';
  }
  window.KKExtraApps = {APPS, render};
})();
