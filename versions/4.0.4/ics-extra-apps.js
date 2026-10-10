/* Four launcher apps of the Galaxy Nexus image (IMM76I) as Holo screens, with the APKs' texts (docs/apk-strings.py):
   Messenger (Google+ 2.4's ConversationListActivity: the conversation list, "New conversation"), Navigation (Maps
   6.4's da_destination_activity: Speak destination, Type destination, Contacts, Starred places; Type destination
   drives there with maps-route.js), Places (Maps 6.4's placesv2 categories) and Movie Studio (AOSP VideoEditor
   android-4.0.4_r2.1: the projects grid with "Create new project"). Content is offline and made up. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const APPS = ['messenger', 'navigation', 'local', 'movie-studio'];
  // Places' categories [hu, de, fr, es] from the image's Maps APK.
  const STRINGS = {
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
      ]
  };  const LANGS = ['hu', 'de', 'fr', 'es'];
  // Texts the stock-strings index resolves from the image's APKs (docs/stock-strings.json).
  const S = (app, key, t) => { const row = window.StockStrings?.[app]?.[key], i = LANGS.indexOf(window.AndroidI18n?.language); return row ? (i >= 0 ? row[i] : row[4] || key) : t(key); };
  const local = (key, t) => { const i = LANGS.indexOf(window.AndroidI18n?.language); return STRINGS[key] && i >= 0 ? STRINGS[key][i] : t(key); };
  function render(app, {ui, t, chats = [], contacts = []}) {
    if (app === 'messenger') {
      // Google+ 2.4's ConversationListActivity: the EsActionBar with home as up and conversation_list_item_view rows.
      const m = key => S('gplus', key, t), people = contacts.slice(0, 3);
      const rows = people.map((p, i) => `<button class="msg24-row" data-action="kkx-unavailable"><img src="assets/msg-default_avatar.png" alt=""><span><b>${e(p.name)}</b><small>${e(['Saturday’s hike: who’s driving?', 'Photos from the meetup', 'See you at 11!'][i])}</small></span><time>${['10:24', '9:02', 'Mon'][i]}</time></button>`).join('');
      return `<div class="app-view kkx-app msg24"><header class="msg24-bar"><button data-action="home" aria-label="${e(m('Messenger'))}"><img class="up" src="assets/ga-fw-ic_ab_back_holo_dark.png" alt=""><img src="assets/messenger.png" alt=""></button><b>${e(m('Messenger'))}</b><button class="msg24-act" data-action="kkx-unavailable" aria-label="${e(m('New conversation'))}"><img src="assets/msg-ic_menu_start_new_huddle_action_bar.png" alt=""></button><button class="msg24-act" data-action="jbx-menu" aria-label="${e(t('More options'))}"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button></header><div class="msg24-list">${rows}</div></div>`;
    }
    if (app === 'navigation') {
      // Maps 6.4's da_destination_activity: the da_actionBar (feature switcher, "Navigation", the Map button) over the
      // ListView whose header holds class aa's tiles.
      const n = key => S('navigation', key, t);
      // Type destination asks for a place and drives there (maps-route.js); the other pickers need the network.
      const tile = (key, icon) => `<button class="nav-tile" data-action="${key === 'Type destination' ? 'mr-type-dest' : 'kkx-unavailable'}"><img src="assets/nav-${icon}.png" alt=""><span>${e(n(key))}</span></button>`;
      return `<div class="app-view kkx-app nav64"><header class="nav-head"><span class="nav-switch"><img src="assets/nav-ic_feature_navigation.png" alt=""><img src="assets/nav-switcher_dropdown_triangle.png" alt=""></span><i></i><b>${e(n('Navigation'))}</b><i></i><button data-action="open-app" data-app="maps"><img src="assets/nav-da_btn_show_map.png" alt="">${e(n('Map'))}</button></header><div class="nav-tiles">${tile('Speak destination', 'da_picker_speak_destination')}${tile('Type destination', 'da_picker_type_destination')}${tile('Contacts', 'da_picker_contacts')}${tile('Starred places', 'da_picker_starred_items')}</div></div>`;
    }
    if (app === 'local') {
      // Maps 6.4's Places (placesv2.xml): the categories Places offers by default, with the APK's icons.
      const cats = [['Restaurants', 'restaurants'], ['Coffee', 'cafe'], ['Bars', 'bars'], ['Hotels', 'hotels'], ['Attractions', 'attractions'], ['ATMs', 'atm'], ['Gas stations', 'gas']];
      return `<div class="app-view kkx-app loc64"><header class="loc-bar"><span class="loc-switch"><img src="assets/loc-ic_feature_local.png" alt=""><img src="assets/nav-switcher_dropdown_triangle.png" alt=""></span><i></i><b>${e(S('navigation', 'Places', t))}</b><i></i><button data-action="kkx-unavailable" aria-label="${e(t('Search'))}"><img src="assets/loc-actionbar_search.png" alt=""></button></header><div class="loc-where"><img src="assets/loc-gray_location.png" alt=""><span>Mountain View</span><img src="assets/loc-locationbar_triangle.png" alt=""></div><div class="loc-cats">${cats.map(([key, icon]) => `<button data-action="kkx-unavailable"><img src="assets/loc-places_cat_icon_${icon}.png" alt=""><span>${e(local(key, t))}</span></button>`).join('')}</div></div>`;
    }
    if (app === 'movie-studio') {
      // AOSP VideoEditor (android-4.0.4_r2.1): ProjectsActivity's project picker with the new-project bitmap.
      const title = S('studio', 'Create new project', t);
      return `<div class="app-view kkx-app ms43"><header class="ms-bar"><img src="assets/movie-studio.png" alt=""></header><div class="ms-grid"><button class="ms-item" data-action="kkx-unavailable" aria-label="${e(title)}"><span class="ms-thumb"><img src="assets/ms-add_video_project_big.png" alt=""><b>${e(title)}</b></span></button></div></div>`;
    }
    return '';
  }
  // The action bar overflow (the jbx-menu overlay).
  function menu(app, t) {
    if (app === 'messenger') return ['Settings', 'Send feedback', 'Help'].map(key => ({action: 'kkx-unavailable', title: S('gplus', key, t)}));
    return [];
  }
  window.JBExtraApps = {APPS, render, menu, text: (app, key) => S(app, key, k => k)};
})();
