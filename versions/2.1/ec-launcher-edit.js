/* Android 2.1 home screen editing (Launcher2.apk, ERE27):
   - A long press on an empty cell opens "Add to Home screen" for that cell (Launcher.onLongClick); a long press on an
     item picks it up (Workspace.startDrag): it follows the finger, the all-apps handle gives way to the DeleteZone
     (trashcan, trashcan_hover and the item tinted 0xA6FF0000 over it), the screen scrolls when the finger waits 600 ms
     at an edge (DragLayer's 20 dp scroll zones), and it lands on the cell under it if the cells are free, in a folder,
     or in the trash. A long press in All apps closes the drawer with the application under the finger.
   - Shortcuts: "Select shortcut" (ActivityPicker): Applications (Launcher's own, then the application list), and the
     image's CREATE_SHORTCUT activities in label order: Bookmark (Browser), Contact, Direct dial, Direct message
     (Contacts: "Choose a contact shortcut", "Choose a number to call", "Choose a number to message"), Directions &
     Navigation (Maps' create_shortcut.xml), Gmail label, Music playlist, Settings (Settings' CreateShortcut, the activities
     of category com.android.settings.SHORTCUT) and Toggle Google Voice. Email's AccountShortcutPicker is disabled.
   - Folders: "Select folder": New folder (Launcher's own: user_folder.xml, box_launcher_top / _bottom, the title
     closes it, a long press on it renames it: rename_folder.xml) and the image's CREATE_LIVE_FOLDER activities: All
     contacts, Bluetooth received, Contacts with phone numbers, Facebook Phonebook, Starred contacts (live_folder_list.xml).
   - With no room: "No more room on this Home screen." Widgets are in ec-widgets.js (EC.homeEdit.pickWidget). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const H = () => EC.text('homeadd');
  const h = k => H().t(k);
  const COLS = 4, ROWS = 4;
  const current = c => c.ui.homePage ?? EC.home.DEFAULT_SCREEN;
  const pages = c => c.data.home.pages;
  const span = item => ({w: item.w || 1, h: item.h || 1});

  // ---- Cells ----
  function grid(items, except) {
    const g = Array.from({length: ROWS}, () => Array(COLS).fill(false));
    for (const it of items) { if (it === except) continue; const {w, h: hh} = span(it); for (let y = it.y; y < it.y + hh; y++) for (let x = it.x; x < it.x + w; x++) if (g[y]) g[y][x] = true; }
    return g;
  }
  const fits = (g, x, y, w, hh) => { if (x < 0 || y < 0 || x + w > COLS || y + hh > ROWS) return false; for (let j = y; j < y + hh; j++) for (let i = x; i < x + w; i++) if (g[j][i]) return false; return true; };
  // CellLayout.findCellForSpan: the touched cell if the span fits there, else the first that fits.
  function spot(items, w, hh, prefer, except) {
    const g = grid(items, except);
    if (prefer) for (const [dx, dy] of [[0, 0], [-1, 0], [0, -1], [-1, -1], [-2, 0], [-3, 0]]) if (fits(g, prefer.x + dx, prefer.y + dy, w, hh)) return {x: prefer.x + dx, y: prefer.y + dy};
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (fits(g, x, y, w, hh)) return {x, y};
    return null;
  }
  function add(c, item) {
    const cell = c.ui.homeAddCell || {page: current(c)}, list = pages(c)[cell.page];
    const {w, h: hh} = span(item), at = spot(list, w, hh, cell.x === undefined ? null : cell);
    c.ui.homeAddCell = null;
    if (c.ui.view !== 'home') c.open('home');
    if (!at) { c.toast(h('out_of_space')); return false; }
    list.push({...item, x: at.x, y: at.y}); c.save(); c.render();
    return true;
  }
  // The cell under a point of the screen (the page's CSS grid: 80 dp columns, 100 dp rows spread over the height
  // above the 55 dp at the bottom).
  function cellAt(c, clientX, clientY) {
    const pageEl = c.el.viewport.querySelector(`.eclh-page[data-page="${current(c)}"]`);
    if (!pageEl) return null;
    // Measured on screen, so dp here is the shown size of a dp (the page may be drawn scaled).
    const r = pageEl.getBoundingClientRect(), dp = r.width / 320;
    const usable = r.height - 55 * dp, gap = (usable - 400 * dp) / 3;
    const x = Math.floor((clientX - r.left) / (80 * dp)), y = Math.floor((clientY - r.top) / (100 * dp + gap));
    return x >= 0 && x < COLS && y >= 0 && y < ROWS ? {x, y} : null;
  }

  // ---- Items: shortcuts, folders and live folders (applications, widgets and the search widget are ec-launcher's) ----
  const LIVE = {
    all: ['Contacts/liveFolderAll', 'ct-ic_launcher_folder_live_contacts.png'], bluetooth: ['Bluetooth/btopp_live_folder', 'bt-ic_launcher_folder_bluetooth.png'],
    phone: ['Contacts/liveFolderPhone', 'ct-ic_launcher_folder_live_contacts_phone.png'], facebook: ['Facebook/live_folder_name', 'fb-livefolder.png'],
    starred: ['Contacts/liveFolderFavorites', 'ct-ic_launcher_folder_live_contacts_starred.png']};
  const iconOf = item => item.type === 'folder' ? (item.open ? 'l2-ic_launcher_folder_open.png' : 'l2-ic_launcher_folder.png') : item.type === 'live' ? LIVE[item.live][1] : item.icon;
  const labelOf = item => item.type === 'folder' ? item.name : item.type === 'live' ? h(LIVE[item.live][0]) : item.label;
  EC.homeItem = (c, item, index) => {
    if (!['shortcut', 'folder', 'live'].includes(item.type)) return '';
    return `<button type="button" class="eclh-item eclh-shortcut" style="grid-area:${item.y + 1}/${item.x + 1}" data-action="eclh-item" data-index="${index}"><i class="ec-bg np-l2-pressed_application_background eclh-pressed"></i><i class="ec-bg np-l2-focused_application_background eclh-focused"></i><img src="assets/${esc(iconOf(item))}" alt=""><span class="eclh-label"><span>${esc(labelOf(item))}</span></span></button>`;
  };
  // What a shortcut opens.
  function launch(c, item) {
    const go = item.go || {};
    if (go.browser) { c.ui.browserGo = go.browser; c.open('browser'); }
    else if (go.contact) { c.ui.contactId = go.contact; c.open('contact-view'); }
    else if (go.dial) EC.call ? EC.call(c, go.dial) : (c.ui.dialDigits = go.dial, c.ui.phoneTab = 'dialer', c.open('phone'));
    else if (go.sms) { c.ui.composeTo = go.sms; c.ui.smsDraft = ''; c.ui.smsThread = null; c.open('messaging', 'compose'); }
    else if (go.settings) EC.settingsOpenClass?.(c, go.settings);
    else if (go.gmail) { c.ui.gmLabel = go.gmail; c.ui.gmScreen = ''; c.open('gmail'); }
    else if (go.music) { c.ui.musicTab = 'playlists'; c.open('music'); }
    else if (go.maps) EC.maps?.directionsTo?.(c, go.maps, go.mode);
    else if (go.open) c.open(go.open);
  }

  // ---- Pickers ----
  // ActivityPicker (AlertActivity: the title, then add_list_item-style rows of icon and label).
  const picker = (c, title, list, onPick) => c.dialog({title, icon: null, items: list.map(x => ({label: x.label, icon: x.icon})), onItem: i => onPick(list[i])});
  const byLabel = (c, list) => list.sort((a, b) => a.label.localeCompare(b.label, c.locale()));
  function pickShortcut(c) {
    const app = (id, k) => EC.apps.label(id) || h(k);
    const list = byLabel(c, [
      {label: h('Browser/shortcut_bookmark'), icon: 'br-ic_launcher_shortcut_browser_bookmark.png', go: () => pickBookmark(c)},
      {label: h('Contacts/shortcutContact'), icon: 'ct-ic_launcher_shortcut_contact.png', go: () => pickContact(c, 'contact')},
      {label: h('Contacts/shortcutDialContact'), icon: 'ct-ic_launcher_shortcut_directdial.png', go: () => pickContact(c, 'dial')},
      {label: h('Contacts/shortcutMessageContact'), icon: 'ct-ic_launcher_shortcut_directmessage.png', go: () => pickContact(c, 'sms')},
      {label: h('Maps/DIRECTIONS_ONLY_SHORTCUT_NAME'), icon: 'mp-gohome_shortcut_default.png', go: () => openPage(c, {kind: 'gohome', dest: '', name: '', mode: 'drive', turn: false, icon: 'default'})},
      {label: h('Gmail/activity_create_label_shortcut'), icon: 'gm-ic_launcher_shortcut_gmail_label.png', go: () => pickGmailLabel(c)},
      {label: h('Music/musicshortcutlabel'), icon: 'mu-ic_launcher_shortcut_music_playlist.png', go: () => pickPlaylist(c)},
      {label: h('Settings/settings_shortcut'), icon: 'st-ic_launcher_settings.png', go: () => pickSettings(c)},
      {label: h('googlevoice/googlevoice_toggle_shortcut'), icon: 'app-google-voice.png', go: () => add(c, {type: 'shortcut', label: h('googlevoice/googlevoice_toggle_shortcut'), icon: 'app-google-voice.png', go: {open: 'google-voice'}})}]);
    void app;
    picker(c, h('title_select_shortcut'), [{label: h('group_applications'), icon: 'l2-ic_launcher_application.png', go: () => pickApplication(c)}, ...list], x => x.go());
  }
  function pickApplication(c) {
    const list = EC.apps.sorted().map(a => ({label: EC.apps.label(a.id), icon: a.icon, id: a.id}));
    picker(c, h('group_applications'), list, x => add(c, {type: 'app', app: x.id}));
  }
  function pickFolder(c) {
    const lives = byLabel(c, Object.entries(LIVE).map(([id, [k, icon]]) => ({label: h(k), icon, id})));
    picker(c, h('title_select_live_folder'), [{label: h('group_folder'), icon: 'l2-ic_launcher_folder.png', id: ''}, ...lives], x => add(c, x.id ? {type: 'live', live: x.id} : {type: 'folder', name: h('folder_name'), items: []}));
  }
  // A full-screen picker activity: the window title and rows (contacts, bookmarks, labels, settings).
  function openPage(c, page) { c.ui.homePick = page; c.open('home-pick'); }
  const contacts = c => (c.data.contacts || []).slice().sort((a, b) => a.name.localeCompare(b.name, c.locale()));
  function pickContact(c, mode) {
    const list = contacts(c).filter(p => mode === 'contact' || p.phone);
    openPage(c, {kind: 'list', title: h(mode === 'contact' ? 'Contacts/shortcutActivityTitle' : mode === 'dial' ? 'Contacts/callShortcutActivityTitle' : 'Contacts/messageShortcutActivityTitle'),
      rows: list.map(p => ({icon: 'ct-ic_contact_list_picture.png', label: p.name, sub: mode === 'contact' ? '' : EC.formatNumber?.(p.phone) || p.phone,
        item: {type: 'shortcut', label: p.name, icon: mode === 'contact' ? 'ct-ic_launcher_shortcut_contact.png' : mode === 'dial' ? 'ct-ic_launcher_shortcut_directdial.png' : 'ct-ic_launcher_shortcut_directmessage.png',
          go: mode === 'contact' ? {contact: p.id} : mode === 'dial' ? {dial: p.phone} : {sms: p.phone}}}))});
  }
  function pickBookmark(c) {
    const B = EC.text('browser'), a = B.t('bookmarks'), defaults = [];
    for (let i = 0; i + 1 < a.length; i += 2) defaults.push({title: a[i], url: a[i + 1]});
    const list = c.data.browser?.bookmarks || defaults;
    openPage(c, {kind: 'list', title: h('Browser/tab_bookmarks'), rows: list.map(b => ({icon: 'br-ic_launcher_shortcut_browser_bookmark.png', label: b.title, sub: b.url,
      item: {type: 'shortcut', label: b.title, icon: 'br-ic_launcher_shortcut_browser_bookmark.png', go: {browser: b.url}}}))});
  }
  function pickGmailLabel(c) {
    const G = EC.text('gmail'), sys = [['^i', 'label_inbox'], ['^t', 'label_starred'], ['^b', 'label_chat'], ['^f', 'label_sent'], ['^^out', 'label_outbox'], ['^r', 'label_draft'], ['^all', 'label_all'], ['^s', 'label_spam'], ['^k', 'label_trash']];
    const list = [...sys.map(([id, k]) => ({id, label: G.t(k)})), ...['Friends', 'Travel', 'Work'].map(id => ({id, label: id}))];
    openPage(c, {kind: 'list', title: h('Gmail/activity_create_label_shortcut'), rows: list.map(l => ({icon: 'gm-ic_launcher_shortcut_gmail_label.png', label: l.label,
      item: {type: 'shortcut', label: l.label, icon: 'gm-ic_launcher_shortcut_gmail_label.png', go: {gmail: l.id}}}))});
  }
  function pickPlaylist(c) {
    openPage(c, {kind: 'list', title: h('Music/playlists_title'), rows: [{icon: 'mu-ic_mp_playlist_recently_added_list.png', label: h('Music/recentlyadded'),
      item: {type: 'shortcut', label: h('Music/recentlyadded'), icon: 'mu-ic_launcher_shortcut_music_playlist.png', go: {music: 'recent'}}}]});
  }
  // Settings' CreateShortcut: the activities of category com.android.settings.SHORTCUT, by label.
  const SETTINGS = [['wifi_settings', 'com.android.settings.wifi.WifiSettings'], ['bluetooth_settings_title', 'com.android.settings.bluetooth.BluetoothSettings'],
    ['language_keyboard_settings_title', 'com.android.settings.LanguageSettings'], ['user_dict_settings_titlebar', 'com.android.settings.UserDictionarySettings'],
    ['sound_and_display_settings_title', 'com.android.settings.SoundAndDisplaySettings'], ['dock_settings_title', 'com.android.settings.DockSettings'],
    ['manageapplications_settings_title', 'com.android.settings.ManageApplications'], ['runningservices_settings_title', 'com.android.settings.RunningServices'],
    ['location_security_settings_title', 'com.android.settings.SecuritySettings'], ['power_usage_summary_title', 'com.android.settings.fuelgauge.PowerUsageSummary']];
  function pickSettings(c) {
    const list = byLabel(c, SETTINGS.map(([k, cls]) => ({label: h(`Settings/${k}`), cls})));
    openPage(c, {kind: 'list', title: h('Settings/settings_shortcut'), rows: list.map(s => ({icon: 'st-ic_launcher_settings.png', label: s.label, item: {type: 'shortcut', label: s.label, icon: 'st-ic_launcher_settings.png', go: {settings: s.cls}}}))});
  }

  // ---- The picker activities ----
  function renderPick(c) {
    const p = c.ui.homePick;
    if (!p) return '';
    if (p.kind === 'gohome') return renderGoHome(c, p);
    const rows = p.rows.map((r, i) => `<button type="button" class="eche-row" data-action="eche-pick" data-index="${i}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><img src="assets/${esc(r.icon)}" alt=""><span><span class="t1">${esc(r.label)}</span>${r.sub ? `<span class="t2">${esc(r.sub)}</span>` : ''}</span></button><i class="eche-div"></i>`).join('');
    return c.window(p.title, `<div class="eche-list">${rows}</div>`);
  }
  // Maps' GoHomeCreateShortcutActivity (create_shortcut.xml): the destination, the travel mode (travel_type.xml) and
  // Turn-by-turn navigation, the shortcut's name, its icon (a Gallery of gohome_shortcut_*), Save.
  const GOHOME_ICONS = ['default', 'home', 'cup', 'pizza', 'laptop', 'ball', 'heart'];
  function renderGoHome(c, p) {
    const M = EC.text('maps');
    const mode = (id, img) => `<button type="button" class="ecmp-mode${p.mode === id ? ' on' : ''}" data-action="eche-mode" data-mode="${id}" style="--img:url('assets/mp-mode_${img}_${p.mode === id ? 'on' : 'off'}.9.png')"><i class="a"></i><i class="s"></i><i class="ic"></i><i class="s2"></i><i class="b"></i></button>`;
    const field = (name, value, hint) => `<span class="ecwf-edit npp-fw-textfield_default"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><input class="ecwf-input eche-input" data-field="${name}" value="${esc(value)}" placeholder="${esc(hint)}" autocomplete="off" spellcheck="false"></span>`;
    return c.window(h('Maps/DIRECTIONS_ONLY_SHORTCUT_NAME'), `<div class="eche-gohome"><div class="eche-gscroll">
      <label>${esc(h('Maps/GOHOME_SHORTCUT_DESTINATION'))}</label>${field('dest', p.dest, h('Maps/GOHOME_DESTINATION_HINT'))}
      <div class="eche-modes"><span class="ecmp-travel">${mode('drive', 'driving')}${mode('transit', 'transit')}${mode('walk', 'walk')}</span></div>
      <button type="button" class="eche-check" data-action="eche-turn"><img src="assets/fw-btn_check_${p.turn ? 'on' : 'off'}.png" alt=""><span>${esc(h('Maps/GOHOME_TURN_BY_TURN_LABEL'))}</span></button>
      <label>${esc(h('Maps/GOHOME_SHORTCUT_NAME'))}</label>${field('name', p.name, '')}
      <label>${esc(h('Maps/GOHOME_PICK_SHORTCUT_IMAGE'))}</label><div class="eche-icons">${GOHOME_ICONS.map(id => `<button type="button" class="eche-gicon${p.icon === id ? ' on' : ''}" data-action="eche-icon" data-icon="${id}"><img src="assets/mp-gohome_shortcut_${id}.png" alt=""></button>`).join('')}</div></div>
      <div class="eche-gbar"><button type="button" class="ecui-button" data-action="eche-save"${p.dest.trim() ? '' : ' disabled'}><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(h('Maps/GOHOME_SAVE_SHORTCUT'))}</span></button></div></div>`);
    void M;
  }
  EC.register('home-pick', {
    title: 'Launcher',
    render: renderPick,
    mount(c, root) {
      for (const input of root.querySelectorAll('.eche-input')) input.addEventListener('input', () => {
        c.ui.homePick[input.dataset.field] = input.value;
        root.querySelector('[data-action="eche-save"]')?.toggleAttribute('disabled', !c.ui.homePick.dest.trim());
      });
    },
    action(name, el, event, c) {
      const p = c.ui.homePick;
      switch (name) {
        case 'eche-pick': { const item = p.rows[Number(el.dataset.index)].item; c.ui.homePick = null; add(c, item); return true; }
        case 'eche-mode': p.mode = el.dataset.mode; c.render(); return true;
        case 'eche-turn': p.turn = !p.turn; c.render(); return true;
        case 'eche-icon': p.icon = el.dataset.icon; c.render(); return true;
        case 'eche-save': {
          const name = p.name.trim() || p.dest.trim();
          c.ui.homePick = null;
          add(c, {type: 'shortcut', label: name, icon: `mp-gohome_shortcut_${p.icon}.png`, go: {maps: p.dest.trim(), mode: p.turn ? 'navigate' : p.mode}});
          return true;
        }
      }
      return false;
    },
    back(c) { c.ui.homePick = null; c.ui.homeAddCell = null; return false; }
  });

  // ---- Folders ----
  // UserFolder / LiveFolder: opened over the workspace's cells; the title (box_launcher_top, 14 sp bold #404040)
  // closes it, the content is a 4-column grid (user folder) or a list (live folder) on box_launcher_bottom.
  function folderItems(c, item) {
    if (item.type === 'folder') return item.items;
    const list = contacts(c);
    if (item.live === 'all') return list.map(p => ({contact: p}));
    if (item.live === 'starred') return list.filter(p => p.starred).map(p => ({contact: p}));
    if (item.live === 'phone') return list.filter(p => p.phone).map(p => ({contact: p}));
    return [];
  }
  function renderFolder(c) {
    const f = c.ui.homeFolder, item = f && pages(c)[f.page]?.[f.index];
    if (!item) return '';
    const title = `<button type="button" class="eche-ftitle npp-l2-box_launcher_top_normal" data-action="eche-fclose"><i class="ec-bg np-l2-box_launcher_top_normal"></i><i class="ec-bg ec-pressed np-l2-box_launcher_top_pressed"></i><span>${esc(labelOf(item))}</span></button>`;
    let body;
    if (item.type === 'folder') body = `<div class="eche-fgrid">${item.items.map((it, i) => { const app = it.type === 'app' ? EC.apps.get(it.app) : null; const icon = app ? app.icon : it.icon, label = app ? EC.apps.label(app.id) : it.label;
      return `<button type="button" class="eche-fitem" data-action="eche-fopen" data-index="${i}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><img src="assets/${esc(icon)}" alt=""><span>${esc(label)}</span></button>`; }).join('')}</div>`;
    else body = `<div class="eche-flist">${folderItems(c, item).map((r, i) => `<button type="button" class="eche-frow" data-action="eche-fopen" data-index="${i}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><img src="assets/ct-ic_contact_list_picture.png" alt=""><span><span class="t1">${esc(r.contact.name)}</span>${item.live === 'phone' && r.contact.phone ? `<span class="t2">${esc(EC.formatNumber?.(r.contact.phone) || r.contact.phone)}</span>` : ''}</span></button>`).join('')}</div>`;
    return `<div class="eche-folder">${title}<div class="eche-fbody npp-l2-box_launcher_bottom"><i class="ec-bg np-l2-box_launcher_bottom"></i>${body}</div></div>`;
  }
  EC.register('home-folder', {
    app: false,
    render: renderFolder,
    mount(c, root) {
      // A long press on the title renames the folder (Launcher.showRenameDialog).
      const t = root.querySelector('.eche-ftitle'), f = c.ui.homeFolder, item = f && pages(c)[f.page]?.[f.index];
      if (!t || item?.type !== 'folder') return;
      let hold = 0;
      t.addEventListener('pointerdown', () => { hold = setTimeout(() => { c.suppressClick = Date.now() + 400; rename(c, item); }, 600); });
      for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) t.addEventListener(ev, () => clearTimeout(hold));
    },
    action(name, el, event, c) {
      if ((c.suppressClick || 0) > Date.now()) return true;
      const f = c.ui.homeFolder, item = pages(c)[f.page][f.index];
      if (name === 'eche-fclose') { closeFolder(c); return true; }
      if (name === 'eche-fopen') {
        const it = folderItems(c, item)[Number(el.dataset.index)];
        closeFolder(c);
        if (it.contact) { c.ui.contactId = it.contact.id; c.open('contact-view'); } else if (it.type === 'app') c.open(it.app); else launch(c, it);
        return true;
      }
      return false;
    },
    back(c) { closeFolder(c); return true; }
  });
  function openFolder(c, page, index) { const item = pages(c)[page][index]; item.open = true; c.ui.homeFolder = {page, index}; c.render(); c.overlay('home-folder'); }
  function closeFolder(c) { const f = c.ui.homeFolder; if (f) { const item = pages(c)[f.page]?.[f.index]; if (item) delete item.open; } c.ui.homeFolder = null; c.closeOverlay(); c.save(); c.render(); }
  function rename(c, item) {
    const field = `<div class="eche-rename"><label>${esc(h('rename_folder_label'))}</label><span class="ecwf-edit npp-fw-textfield_default"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><input class="ecwf-input" maxlength="30" value="${esc(item.name)}"></span></div>`;
    c.dialog({title: h('rename_folder_title'), icon: null, html: field,
      buttons: [{label: h('rename_action'), action: () => { const v = document.querySelector('.eche-rename input')?.value.trim(); if (v) item.name = v; c.save(); c.overlay('home-folder'); }}, {label: h('cancel_action'), action: () => c.overlay('home-folder')}]});
    setTimeout(() => { const i = document.querySelector('.eche-rename input'); i?.focus(); i?.dispatchEvent(new FocusEvent('focusin', {bubbles: true})); }, 30);
  }

  // ---- Dragging ----
  let drag = null;   // {item, from: {page, index} | null, ghost, over, trash, edgeTimer}
  const deleteZone = () => c0().el.viewport.querySelector('.eche-trash');
  const c0 = () => EC.context;
  function startDrag(c, item, from, clientX, clientY, sourceEl) {
    const screen = c.el.screen, sr = screen.getBoundingClientRect(), k = sr.width / screen.clientWidth || 1;
    drag = {item, from, k};
    // The item as it looks now, measured before the screen is redrawn with the DeleteZone.
    const rect = sourceEl?.getBoundingClientRect(), html = sourceEl?.outerHTML;
    c.ui.homeDragging = true; c.render();
    if (from) c.el.viewport.querySelector(`.eclh-page[data-page="${from.page}"] [data-index="${from.index}"]`)?.classList.add('eche-hidden');
    const ghost = document.createElement('div');
    ghost.className = 'eche-ghost';
    if (rect) { ghost.innerHTML = html; ghost.style.width = `${rect.width / k}px`; ghost.style.height = `${rect.height / k}px`; drag.off = [(clientX - rect.left) / k, (clientY - rect.top) / k]; }
    else { ghost.innerHTML = EC.homeItemHtml?.(c, item) || ''; ghost.style.width = `${80 * screen.clientWidth / 320}px`; ghost.style.height = `${100 * screen.clientWidth / 320}px`; drag.off = [40 * screen.clientWidth / 320, 40 * screen.clientWidth / 320]; }
    ghost.querySelector('[data-index]')?.removeAttribute('data-action');
    screen.appendChild(ghost); drag.ghost = ghost;
    moveGhost(c, clientX, clientY);
    navigator.vibrate?.(35);
    const move = e => { moveGhost(c, e.clientX, e.clientY); edge(c, e.clientX); };
    const up = e => { document.removeEventListener('pointermove', move, true); document.removeEventListener('pointerup', up, true); document.removeEventListener('pointercancel', up, true); drop(c, e.clientX, e.clientY, e.type === 'pointercancel'); };
    document.addEventListener('pointermove', move, true); document.addEventListener('pointerup', up, true); document.addEventListener('pointercancel', up, true);
  }
  function moveGhost(c, clientX, clientY) {
    const sr = c.el.screen.getBoundingClientRect(), k = drag.k;
    drag.ghost.style.transform = `translate(${(clientX - sr.left) / k - drag.off[0]}px, ${(clientY - sr.top) / k - drag.off[1]}px) scale(1.1)`;
    const z = deleteZone(), r = z?.getBoundingClientRect(), over = !!r && clientX >= r.left && clientX <= r.right && clientY >= r.top - 10 && clientY <= r.bottom;
    if (over !== drag.trash) { drag.trash = over; drag.ghost.classList.toggle('trash', over); z?.classList.toggle('hover', over); }
  }
  // DragLayer: within 20 dp of a side for 600 ms, the workspace scrolls that way.
  function edge(c, clientX) {
    const sr = c.el.screen.getBoundingClientRect(), zone = 20 * sr.width / 320, side = clientX < sr.left + zone ? -1 : clientX > sr.right - zone ? 1 : 0;
    if (side === drag.side) return;
    drag.side = side; clearTimeout(drag.edgeTimer);
    if (side) drag.edgeTimer = setTimeout(() => { const to = current(c) + side; if (to >= 0 && to < EC.home.SCREENS) { EC.home.snapTo(c, to); drag.side = 0; } }, 600);
  }
  function drop(c, clientX, clientY, cancel) {
    const d = drag; drag = null; clearTimeout(d.edgeTimer); d.ghost.remove();
    c.ui.homeDragging = false;
    const src = d.from ? pages(c)[d.from.page] : null;
    if (!cancel && d.trash) { if (src) src.splice(d.from.index, 1); c.save(); c.render(); return; }
    const page = current(c), list = pages(c)[page], cell = cancel ? null : cellAt(c, clientX - (d.off[0] - 40 * c.el.screen.clientWidth / 320) * d.k, clientY - (d.off[1] - 50 * c.el.screen.clientWidth / 320) * d.k);
    // On a user folder: an application or shortcut goes in.
    const target = cell && list.find(it => it !== d.item && it.x <= cell.x && cell.x < it.x + (it.w || 1) && it.y <= cell.y && cell.y < it.y + (it.h || 1));
    if (target?.type === 'folder' && ['app', 'shortcut'].includes(d.item.type)) {
      const {x, y, ...rest} = d.item; void x; void y;
      target.items.push(rest); if (src) src.splice(src.indexOf(d.item), 1); c.save(); c.render(); return;
    }
    const {w, h: hh} = span(d.item);
    if (cell && fits(grid(list, src === list ? d.item : null), cell.x, cell.y, w, hh)) {
      if (src) src.splice(src.indexOf(d.item), 1);
      list.push({...d.item, x: cell.x, y: cell.y}); c.save(); c.render(); return;
    }
    if (!src) { c.ui.homeAddCell = {page}; add(c, d.item); return; }   // from All apps: the first free cell
    c.render();
  }
  // Called by All apps: the drawer closes and the application stays under the finger.
  EC.homeDragNew = (c, item, clientX, clientY) => { c.open('home'); requestAnimationFrame(() => startDrag(c, item, null, clientX, clientY, null)); };

  // ---- Hooks into ec-launcher ----
  document.addEventListener('DOMContentLoaded', () => {
    const c = EC.context, home = EC.module('home'), base = {mount: home.mount, action: home.action, render: home.render};
    EC.homeEdit = {pickShortcut, pickFolder, add, launch};
    home.render = cc => {
      let html = base.render(cc);
      // While dragging, the DeleteZone takes the all-apps handle's place.
      if (cc.ui.homeDragging) html = html.replace(/<button type="button" class="eclh-allapps"[\s\S]*?<\/button>/, '<span class="eche-trash"><img class="n" src="assets/l2-trashcan.png" alt=""><img class="p" src="assets/l2-trashcan_hover.png" alt=""></span>');
      return html;
    };
    home.mount = (cc, root) => {
      base.mount(cc, root);
      const ws = root.querySelector('.eclh-workspace');
      if (!ws) return;
      let hold = 0, start = null;
      ws.addEventListener('pointerdown', e => {
        if (e.button) return;
        start = {x: e.clientX, y: e.clientY};
        clearTimeout(hold);
        hold = setTimeout(() => {
          if (!start || cc.ui.homeScroll % 1) return;
          cc.homeEditLock = true; cc.suppressClick = Date.now() + 500;
          const el = e.target.closest('.eclh-item');
          if (el?.dataset.index !== undefined) {
            // The screen may have been drawn again meanwhile: the item's element as it is now.
            const page = current(cc), index = Number(el.dataset.index), item = pages(cc)[page][index];
            const now = cc.el.viewport.querySelector(`.eclh-page[data-page="${page}"] [data-index="${index}"]`);
            if (item && now) startDrag(cc, item, {page, index}, start.x, start.y, now);
          } else if (!el) {
            const cell = cellAt(cc, start.x, start.y);
            cc.ui.homeAddCell = {page: current(cc), ...(cell || {})};
            EC.home.addDialog(cc);
          }
          start = null;
        }, 500);
      });
      ws.addEventListener('pointermove', e => { if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 10 * cc.el.screen.clientWidth / 320) { clearTimeout(hold); start = null; } });
      const end = () => { clearTimeout(hold); start = null; setTimeout(() => { cc.homeEditLock = false; }, 0); };
      ws.addEventListener('pointerup', end); ws.addEventListener('pointercancel', end);
    };
    home.action = (name, el, event, cc) => {
      if ((cc.suppressClick || 0) > Date.now()) return true;
      if (name === 'eclh-item') {
        const page = current(cc), index = Number(el.dataset.index), item = pages(cc)[page][index];
        if (item.type === 'folder' || item.type === 'live') openFolder(cc, page, index); else launch(cc, item);
        return true;
      }
      return base.action(name, el, event, cc);
    };
    void c;
  });
})();
