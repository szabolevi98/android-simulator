/* The remaining launcher apps of the Nexus 4 image (JWR66Y) as simple Holo screens, like the KitKat simulator's extras:
   Messenger (Google+ 4.0's group chat: the conversation list and "New conversation"), Navigation (Maps 6.14's
   DestinationActivity: Speak destination, Type destination, Contacts, Starred places), Local (Maps' Places: the category
   list), Currents 2.1 (the editions library with Featured, Saved and "Add edition"), Play Magazines 2.0 (Read Now / My
   Library), Wallet 1.6 (US only, English everywhere: the dashboard's four buttons) and Movie Studio (AOSP VideoEditor:
   the projects grid with "Create new project"). Texts come from the image's APKs; content is offline and made up. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const APPS = ['messenger', 'navigation', 'local', 'currents', 'play-magazines', 'wallet', 'movie-studio'];
  // [hu, de, fr, es] from the image's Maps, Magazines, Google+, Currents and VideoEditor APKs.
  const STRINGS = {
      "My Library": [
          "Saját könyvtár",
          "Meine Bibliothek",
          "Ma bibliothèque",
          "Mi biblioteca"
      ],
      "Read Now": [
          "Olvasson most",
          "Jetzt lesen",
          "Lire maintenant",
          "Leer ahora"
      ],
      "Contacts": [
          "Kapcsolatok",
          "Kontakte",
          "Contacts",
          "Contactos"
      ],
      "Saved": [
          "Mentett",
          "Gespeichert",
          "Enregistré",
          "Guardado"
      ],
      "Add edition": [
          "Kiadás hozzáadása",
          "Ausgabe hinzufügen",
          "Ajouter l'édition",
          "Añadir edición"
      ],
      "Featured": [
          "Kiemelt",
          "Angesagt",
          "Sélection",
          "Destacado"
      ],
      "Attractions": [
          "Látnivalók",
          "Sehenswürdigkeiten",
          "Attractions",
          "Atracciones"
      ],
      "Gas stations": [
          "Benzinkutak",
          "Tankstellen",
          "Stations-service",
          "Gasolineras"
      ],
      "Restaurants": [
          "Éttermek",
          "Restaurants",
          "Restaurants",
          "Restaurantes"
      ],
      "Type destination": [
          "Cél begépelése",
          "Ziel eintippen",
          "Saisir destination",
          "Escribe el destino"
      ],
      "Speak destination": [
          "Cél kimondása",
          "Ziel einsprechen",
          "Énoncer destination",
          "Di el destino"
      ],
      "Starred places": [
          "Csillaggal megjelölt helyek",
          "Markierte Orte",
          "Adresses enregistrées",
          "Sitios destacados"
      ],
      "New conversation": [
          "Új beszélgetés",
          "Neue Unterhaltung",
          "Nouvelle conversation",
          "Nueva conversación"
      ],
      "Create new project": [
          "Új projekt létrehoz.",
          "Neues Projekt erstellen",
          "Créer un projet",
          "Crear nuevo proyecto"
      ]
  };
  const LANGS = ['hu', 'de', 'fr', 'es'];
  // Texts the stock-strings index resolves from the image's APKs (docs/stock-strings.json).
  const S = (app, key, t) => { const row = window.StockStrings?.[app]?.[key], i = LANGS.indexOf(window.AndroidI18n?.language); return row ? (i >= 0 ? row[i] : row[4] || key) : t(key); };
  const local = (key, t) => { const i = LANGS.indexOf(window.AndroidI18n?.language); return STRINGS[key] && i >= 0 ? STRINGS[key][i] : t(key); };
  const svg = {
    search: '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/></svg>',
    more: '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="19" r="2" fill="currentColor"/></svg>',
    mic: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    keyboard: '<svg viewBox="0 0 24 24"><path d="M2 6h20v12H2zm2 2v2h2V8zm3 0v2h2V8zm3 0v2h2V8zm3 0v2h2V8zm3 0v2h2V8zM4 11v2h2v-2zm3 0v2h2v-2zm3 0v2h2v-2zm3 0v2h2v-2zm3 0v2h2v-2zM7 14v2h10v-2z" fill="currentColor"/></svg>',
    person: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="currentColor"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6z" fill="currentColor"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="m12 2 3 6.6 7 .7-5.3 4.8 1.6 7L12 17.5 5.7 21l1.6-7L2 9.3l7-.7z" fill="currentColor"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" fill="currentColor"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="currentColor"/></svg>',
    card: '<svg viewBox="0 0 24 24"><path d="M3 5h18v14H3zm2 3v2h14V8zm0 5v4h14v-4z" fill="currentColor"/></svg>'
  };
  const bar = (app, title, actions = '', cls = '') => `<header class="kkx-bar ${cls}"><button class="kkx-home" data-action="home" aria-label="${e(title)}"><img src="assets/${app}.png" alt=""></button><h2>${e(title)}</h2>${actions}</header>`;
  const action = (icon, label) => `<button class="kkx-btn" data-action="kkx-unavailable" aria-label="${e(label)}">${svg[icon]}</button>`;
  const row = (icon, label, sub = '', color = '#33b5e5') => `<button class="kkx-file" data-action="kkx-unavailable"><span class="kkx-file-icon" style="color:${color}">${svg[icon]}</span><span class="kkx-file-copy"><strong>${e(label)}</strong>${sub ? `<small>${e(sub)}</small>` : ''}</span></button>`;
  const tiles = (items, cls = '') => `<div class="jbx-grid ${cls}">${items.map(([title, color, sub = '']) => `<button class="jbx-tile" data-action="kkx-unavailable" style="--tile:${color}"><span class="jbx-tile-art">${e(title.charAt(0))}</span><strong>${e(title)}</strong>${sub ? `<small>${e(sub)}</small>` : ''}</button>`).join('')}</div>`;
  function render(app, {ui, t, chats = [], contacts = []}) {
    if (app === 'messenger') {
      // Google+ 4.0's HostedMessengerFragment: onPrepareActionBar shows the title and the New conversation button.
      const m = key => S('gplus', key, t), people = contacts.slice(0, 3);
      const rows = people.map((p, i) => `<button class="msg-row" data-action="kkx-unavailable"><img src="assets/msg-ic_avatar.png" alt=""><span><b>${e(p.name)}</b><small>${e(['Saturday’s hike: who’s driving?', 'Photos from the meetup', 'See you at 11!'][i])}</small></span><time>${['10:24', '9:02', 'Mon'][i]}</time></button>`).join('');
      return `<div class="app-view kkx-app msg40"><header class="sa-bar"><button class="sa-up" data-action="home" aria-label="${e(m('Messenger'))}"><img src="assets/messenger.png" alt=""></button><span class="sa-title"><b>${e(m('Messenger'))}</b></span><button class="msg-act" data-action="kkx-unavailable" aria-label="${e(m('New conversation'))}"><img src="assets/msg-ic_menu_start_new_huddle.png" alt=""></button><button class="msg-act" data-action="sa-menu" aria-label="${e(t('More options'))}"><img src="assets/ic_menu_moreoverflow_normal_holo_light.png" alt=""></button></header><div class="msg-list">${rows}</div></div>`;
    }
    if (app === 'navigation') {
      // Maps 6.14's DestinationActivity on a phone (da_destination_activity_redesign): the shortcut tiles of class aa.
      const n = key => S('navigation', key, t);
      const tile = (key, icon) => `<button class="nav-tile" data-action="kkx-unavailable"><img class="${icon}" src="assets/nav-${icon}.png" alt=""><span>${e(n(key))}</span></button>`;
      return `<div class="app-view kkx-app nav614"><header class="nav-bar"><img src="assets/navigation.png" alt=""><b>${e(n('Navigation'))}</b></header><div class="nav-strip"><b>${e(n('SHORTCUTS'))}</b><span>${e(n('STARRED'))}</span></div><div class="nav-tiles">${tile('Speak destination', 'da_picker_speak_destination')}${tile('Type destination', 'da_picker_type_destination')}${tile('Contacts', 'da_picker_contacts')}${tile('Starred places', 'da_picker_starred_items')}</div></div>`;
    }
    if (app === 'local') {
      // Maps 6.14's Places (placesv2.xml); the categories are the ones Places offers by default, with the APK's icons.
      const cats = [['Restaurants', 'restaurants'], ['Coffee', 'cafe'], ['Bars', 'bars'], ['Hotels', 'hotels'], ['Attractions', 'attractions'], ['ATMs', 'atm'], ['Gas stations', 'gas']];
      return `<div class="app-view kkx-app loc614"><header class="loc-bar"><span class="loc-switch"><img src="assets/loc-ic_feature_local.png" alt=""><img src="assets/loc-switcher_dropdown_triangle.png" alt=""></span><i></i><b>${e(S('navigation', 'Local', t))}</b><i></i><button data-action="kkx-unavailable" aria-label="${e(t('Search'))}"><img src="assets/loc-actionbar_search.png" alt=""></button></header><div class="loc-where"><img src="assets/loc-gray_location.png" alt=""><span>Mountain View</span><img src="assets/loc-locationbar_triangle.png" alt=""></div><div class="loc-cats">${cats.map(([key, icon]) => `<button data-action="kkx-unavailable"><img src="assets/loc-places_cat_icon_${icon}.png" alt=""><span>${e(local(key, t))}</span></button>`).join('')}</div></div>`;
    }
    if (app === 'currents') return `<div class="app-view kkx-app jbx-currents">${bar('currents', t('Currents'), action('search', t('Search')) + action('more', t('More options')), 'dark')}<div class="kkx-list">${tiles([[local('Featured', t), '#00a1e4'], [local('Saved', t), '#7e57c2'], ['Tech Daily', '#e53935', 'Technology'], ['Trail & Summit', '#43a047', 'Outdoors'], ['Weekend Kitchen', '#fb8c00', 'Food'], [local('Add edition', t), '#9e9e9e']], 'dark')}</div></div>`;
    if (app === 'play-magazines') {
      const page = ui.jbxMagazines || 'read';
      const tabs = `<div class="jbx-tabs">${[['read', local('Read Now', t)], ['library', local('My Library', t)]].map(([id, label]) => `<button class="${page === id ? 'on' : ''}" data-action="jbx-tab" data-id="${id}">${e(label)}</button>`).join('')}</div>`;
      return `<div class="app-view kkx-app jbx-magazines">${bar('play-magazines', t('Play Magazines'), action('search', t('Search')))}${tabs}<div class="kkx-list">${tiles(page === 'read' ? [['Gadget Weekly', '#c62828', 'July 2013'], ['Trail & Summit', '#2e7d32', 'Summer 2013'], ['Weekend Kitchen', '#ef6c00', 'August 2013']] : [['Gadget Weekly', '#c62828', 'July 2013'], ['Gadget Weekly', '#ad1457', 'June 2013']])}</div></div>`;
    }
    if (app === 'wallet') return `<div class="app-view kkx-app kkx-wallet">${bar('wallet', 'Wallet', action('more', 'More options'))}<div class="kkx-list">${[['Payment cards', '#0f9d58'], ['Rewards cards', '#f4b400'], ['Offers', '#db4437'], ['Transactions', '#4285f4']].map(([label, color]) => row('card', label, '', color)).join('')}</div></div>`;
    if (app === 'movie-studio') return `<div class="app-view kkx-app jbx-studio">${bar('movie-studio', t('Movie Studio'), '', 'dark')}<div class="kkx-list">${`<div class="jbx-grid dark"><button class="jbx-tile jbx-new" data-action="kkx-unavailable"><span class="jbx-tile-art">${svg.plus}</span><strong>${e(local('Create new project', t))}</strong></button></div>`}</div></div>`;
    return '';
  }
  window.JBExtraApps = {APPS, render};
})();
