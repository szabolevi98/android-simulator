/* Android 2.3.6 (Nexus S) inspired browser simulation. No network or Android runtime required. */
(() => {
  'use strict';

  const STORE = 'android-time-machine-gb-v1';
  const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const defaultData = {
    // Launcher2 shows its clings on the first run; saved desktops from before count as dismissed.
    // Gingerbread's Launcher2 has no first-run clings.
    clings: LauncherClings.dismissedAll(),
    wallpaper: 0,
    layoutRevision: 2,
    homePages: Array.from({length: 5}, () => Array(16).fill(null)),
    homeWidgets: [
      [],
      [],
      [{ id: 'default-search', type: 'search', x: 0, y: 0 }, { id: 'default-protips', type: 'protips', x: 0, y: 1 }],
      [{ id: 'default-music', type: 'music', x: 0, y: 0 }],
      []
    ],
    liveWallpaper: { id: 'nexus' },
    protips: { index: 0, set: 0 },
    dock: ['phone', 'people', 'apps', 'messaging', 'browser'],
    settings: { wifi: true, wifiNetwork: 'AndroidAP', wifiNotify: true, bluetooth: false, bluetoothVisible: false, pairedDevice: '', airplane: false, nfc: true, androidBeam: true, wifiDirect: false, portableHotspot: false, dataEnabled: true, dataRoaming: false, developerUnlocked: false, silent: false, rotate: true, brightness: 68, autoSync: true, networkLocation: true, gps: false, visiblePasswords: false, unknownSources: false, backup: true, autoRestore: true, largeText: false, speakPasswords: false, usbDebug: false, stayAwake: false, mockLocations: false, showTouches: false },
    contacts: [
      { id: 1, name: 'Alex Morgan', phone: '202-555-0148', email: 'alex@example.com' },
      { id: 2, name: 'Sam Rivera', phone: '202-555-0192', email: 'sam@example.com' },
      { id: 3, name: 'Taylor Lee', phone: '202-555-0116', email: 'taylor@example.com' },
      { id: 4, name: 'Mom', phone: '202-555-0107', email: 'mom@example.com' }
    ],
    contactGroups: [{id:'friends',name:'Friends',members:[1,2,3]},{id:'family',name:'Family',members:[4]}],
    messages: [
      { id: 1, contact: 1, body: 'Hey! Are we still on for coffee tomorrow?', mine: false, time: '10:42' },
      { id: 2, contact: 1, body: 'Absolutely. See you at 11!', mine: true, time: '10:45' },
      { id: 3, contact: 4, body: 'Don’t forget to call this weekend ☺', mine: false, time: 'Yesterday' }
    ],
    photos: [
      { id: 1, name: 'Mountain afternoon', colors: ['#96c8d0', '#e8ad7a', '#364e59'] },
      { id: 2, name: 'City lights', colors: ['#223850', '#ce6979', '#101d32'] },
      { id: 3, name: 'By the sea', colors: ['#67aab6', '#f3d3a0', '#21617a'] },
      { id: 4, name: 'Sunset', colors: ['#d97475', '#f0bf74', '#4e486b'] }
    ],
    events: [{ id: 1, date: localDate(), title: 'Coffee with Alex', time: '11:00' }],
    alarms: [{ id: 1, time: '07:00', enabled: true }, { id: 2, time: '08:30', enabled: false }],
    bookmarks: ['www.google.com', 'www.android.com', 'en.wikipedia.org/wiki/Android'],
    browserHistory: ['www.google.com'],
    sentEmails: [],
    notifications: [
      { id: 1, title: 'Welcome to Android 2.3.6', detail: 'Your phone is ready to explore.' },
      { id: 2, title: 'New message from Alex', detail: 'See you at 11!' }
    ]
  };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (!saved) return clone(defaultData);
      const result = { ...clone(defaultData), ...saved, settings: { ...defaultData.settings, ...saved.settings } };
      if (!saved.clings) result.clings = LauncherClings.dismissedAll();
      if (JSON.stringify(result.homePages?.[2]) === JSON.stringify([null,null,null,null,null,null,null,null,'calendar','gallery','settings','music'])) result.homePages[2] = clone(defaultData.homePages[2]);
      result.homePages = result.homePages.map(page => page.length === 12 ? [null, null, null, null, ...page] : page);
      if (!Array.isArray(saved.homeWidgets)) result.homeWidgets = clone(defaultData.homeWidgets);
      // Replace only the untouched old demo layout; preserve customized desktops.
      if (!saved.layoutRevision) {
        const oldShortcuts = [['calendar','music',null,null],['camera','gallery','email',null],['camera',null,null,'google'],['email','camera','clock',null],['calculator','settings',null,null]].map(items => [...Array(12).fill(null), ...items]);
        const oldWidgets = ['digital','weather','analog','music','calendar'].map((type, i) => [{id: ['default-clock','default-weather','default-analog','default-music','default-calendar'][i], type, x: 1, y: 0}]);
        if (JSON.stringify(result.homePages) === JSON.stringify(oldShortcuts) && JSON.stringify(result.homeWidgets) === JSON.stringify(oldWidgets)) {
          result.homePages = clone(defaultData.homePages);
          result.homeWidgets = clone(defaultData.homeWidgets);
        } else result.homeWidgets.flat().forEach(widget => { widget.width = 2; widget.height = 2; });
        result.layoutRevision = 2;
      }
      // Earlier photo frames were 2 × 2 and showed the first picture; keep their footprint.
      result.homeWidgets.flat().forEach(widget => { if (widget?.type === 'photo' && !('source' in widget) && !widget.width) { widget.width = 2; widget.height = 2; } });
      // A reload during Gallery widget configuration leaves no completed choice.
      result.homeWidgets = result.homeWidgets.map(page => Array.isArray(page) ? page.filter(widget => widget && !(widget.type === 'photo' && widget.source === null)) : []);
      if (result.wallpaper === 4 && result.customWallpaper) result.wallpaper = 99;
      return result;
    } catch { return clone(defaultData); }
  }
  let data = load();
  data.settings={...ICSSettingsDetail.defaults,...ICSSystemSettings.defaults,...data.settings};
  ICSLockscreen.initialize(data);
  function save() { try { localStorage.setItem(STORE, JSON.stringify(data)); } catch {} }
  const ui = {
    view: 'home', sub: '', page: 2, drawerTab: 'apps', drawerPage: 0, overlay: '',
    selectedContact: 1, thread: 1, selectedPhoto: 1,
    dial: '', callNumber: '', aboutTaps: 0, buildTaps: 0, easterNyan: false, settingsRootScroll: 0,
    browserUrl: data.browserHistory.at(-1) || 'www.google.com', browserHistory: [...data.browserHistory], browserIndex: data.browserHistory.length - 1, browserTabs: [data.browserHistory.at(-1) || 'www.google.com'], browserTab: 0,
    calendarMode: ['Day','Week','Month','Agenda'].includes(data.calendarMode)?data.calendarMode:'Month', selectedDate: localDate(ICSSystemSettings.wallDate(data)),
    calc: '', calcFresh: false, calcPanel: 0, calcHistoryIndex: -1, phoneTab: 'dialpad',
    play: ICSPlayStore.initial(), playHistory: [],
    musicPlaying: false, musicTrack: 0, musicPosition: 0,
    emailId: 1, recent: [], recentSnapshots: {}, toastTimer: null, wifiTarget: '', bluetoothScanned: false
  };
  const emailData = [
    { id: 1, from: 'Android Team', subject: 'Welcome to Android', body: 'Your Galaxy Nexus is ready. Explore the new look of Android 4.0, customize your home screen, and discover the little surprise hidden in Settings.', time: '9:41 AM' },
    { id: 2, from: 'Alex Morgan', subject: 'Photos from the weekend', body: 'I added a few pictures to our album. Take a look when you have a moment!', time: 'Yesterday' },
    { id: 3, from: 'Calendar', subject: 'Coffee with Alex', body: 'Reminder: Coffee with Alex at 11:00.', time: 'Yesterday' }
  ];
  const tracks = ICSMusic.tracks;
  data.mailbox=ICSEmail.restore(data.mailbox,emailData,data.sentEmails);
  ui.music=ICSMusic.restore(data.music);
  ui.musicTrack=ui.music.track;
  ui.browserSession = ICSBrowserSession.restore(data.browserSession,data.browserHistory);
  syncBrowserState();
  const apps = [
    ['phone', 'Phone', '☎', '#3dc484', '#217258'], ['people', 'Contacts', '◉', '#efa96f', '#a45142'],
    ['messaging', 'Messaging', '✉', '#84cf62', '#428c43'], ['browser', 'Browser', '◎', '#65aee2', '#246ba8'],
    ['camera', 'Camera', '▣', '#c8cbd0', '#6b7a87'], ['gallery', 'Gallery', '▧', '#e9b674', '#8d673c'],
    ['settings', 'Settings', '⚙', '#b7c5ce', '#53606f'], ['clock', 'Clock', '◷', '#71b7dc', '#3d6e8d'],
    ['calendar', 'Calendar', '31', '#7ec7e7', '#397c9e'], ['calculator', 'Calculator', '＋', '#7cb4bd', '#32727f'],
    ['music', 'Music', '♫', '#fd9e70', '#c25360'], ['email', 'Email', '✉', '#75b7df', '#326b9e'],
    ['play-store', 'Market', '▶', '#b5d26d', '#53732f']
  ];
  const wifiNetworks = [
    { name: 'AndroidAP', security: 'WPA2', strength: 4 },
    { name: 'CoffeeShop', security: 'Open', strength: 3 },
    { name: 'Home Network', security: 'WPA2', strength: 4 },
    { name: 'Library Wi-Fi', security: 'Open', strength: 2 }
  ];
  // crespo overlay packages/apps/Launcher2 res/values-hdpi/wallpapers.xml, in its order; 960 x 800 images span two screens.
  const wallpaperFiles = ['street_lights','stream','phasebeam','pulse','nexusrain','stars','canyon','grass','zanzibar','cloud','monumentvalley','mountains','sunset','goldengate','shuttle'];
  const widgetTypes = [
    { type: 'search', name: 'Search', app: 'browser', width: 4, height: 1 },
    { type: 'protips', name: 'Home screen tips', app: 'settings', width: 4, height: 1 },
    { type: 'analog', name: 'Analog clock', app: 'clock', width: 2, height: 2 },
    { type: 'calendar', name: 'Calendar', app: 'calendar', width: 2, height: 3 },
    { type: 'music', name: 'Music', app: 'music', width: 4, height: 1 },
    // Gallery2 asks for 180dp plus ICS default widget padding: 3 × 3 Launcher cells.
    { type: 'photo', name: 'Photo Gallery', app: 'gallery', width: 3, height: 3 },
    { type: 'power', name: 'Power control', app: 'settings', width: 4, height: 1 }
  ];
  const widgetSize = value => {
    const widget = typeof value === 'string' ? {type: value} : value;
    return {...(widgetTypes.find(item => item.type === widget.type) || {width: 2, height: 2}), ...widget};
  };
  const iconAssets = new Set(['phone', 'people', 'messaging', 'browser', 'camera', 'gallery', 'settings', 'clock', 'calendar', 'calculator', 'music', 'email', 'apps']);
  const i18n = window.AndroidI18n;
  const appNames = Object.fromEntries(apps.map(app => [app[0], app[1]]));
  appNames.google = 'Google';
  ICSLauncherFolders.initialize(data,apps.map(app=>app[0]));
  const screen = document.querySelector('#screen');
  const viewport = document.querySelector('#viewport');
  const statusRoot = document.querySelector('#status-bar');
  const navRoot = document.querySelector('#nav-bar');
  const overlayRoot = document.querySelector('#overlay-root');
  // The wallpaper window: a live wallpaper draws here, behind the status bar, the launcher and the keyguard.
  const liveLayer = document.createElement('div'); liveLayer.id = 'live-wallpaper'; liveLayer.hidden = true; screen.prepend(liveLayer);
  let liveWallpaper = null, liveOffsetTween = 0;
  const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const deviceDate = () => ICSSystemSettings.wallDate(data);
  const today = () => localDate(deviceDate());
  const clock = () => deviceDate().toLocaleTimeString(i18n.locale(), { hour: 'numeric', minute: '2-digit', hour12: !data.settings.hour24 });
  const fullDate = () => deviceDate().toLocaleDateString(i18n.locale(), { weekday: 'long', month: 'long', day: 'numeric' });
  const shadeDate = () => deviceDate().toLocaleDateString(i18n.locale(), { weekday: 'short', month: 'short', day: 'numeric' });
  const contact = id => data.contacts.find(item => item.id === Number(id));
  const appIcon = id => {
    if (id === 'play-store') return '<span class="app-icon"><img src="assets/play-store.svg" alt=""></span>';
    if (id === 'apps') return '<span class="app-icon"><img src="assets/apps.png" alt=""></span>';
    const folder=ICSLauncherFolders.folder(data,id);
    // FolderIcon: ic_launcher_folder, or ic_launcher_folder_open while the folder is open; live folders use the provider's icon.
    if(folder)return `<span class="app-icon"><img src="assets/gb-${folder.live?`ic_launcher_folder_live_contacts${folder.live==='all'?'':folder.live==='phone'?'_phone':'_starred'}`:`l2-ic_launcher_folder${ui.overlay==='folder'&&ui.folderId===id?'_open':''}`}.png" alt=""></span>`;
    if (id === 'google') return '<span class="app-icon google-folder-icon"><img src="assets/browser.png" alt=""><img src="assets/email.png" alt=""><img src="assets/calendar.png" alt=""><img src="assets/gallery.png" alt=""></span>';
    const item = apps.find(app => app[0] === id);
    if (!item) return '';
    return iconAssets.has(id)
      ? `<span class="app-icon"><img src="assets/${id}.png" alt=""></span>`
      : `<span class="app-icon fallback" style="--icon-light:${item[3]};--icon-dark:${item[4]}">${item[2]}</span>`;
  };
  const liveNames={all:'All contacts',starred:'Starred contacts',phone:'Contacts with phone numbers'};
  const folderName=id=>{const folder=ICSLauncherFolders.folder(data,id);return folder?.name||i18n.t(folder?.live?liveNames[folder.live]:'Folder');};
  const launcherIcon = id => ICSLauncherFolders.folder(data,id)
    ? `<button class="launcher-icon" data-action="folder-open" data-folder-id="${safe(id)}" aria-label="${safe(folderName(id))}" data-no-translate>${appIcon(id)}<span>${safe(folderName(id))}</span></button>`
    : `<button class="launcher-icon" data-action="${id==='apps'?'drawer':'open-app'}" ${id==='apps'?'':`data-app="${id}"`} aria-label="${safe(appNames[id]||'Apps')}">${appIcon(id)}<span>${safe(appNames[id]||'Apps')}</span></button>`;
  const actionbar = (title, right = '') => `<div class="actionbar"><button class="up" data-action="${ui.view === 'settings' && !ui.sub ? 'noop' : 'back'}" aria-label="${ui.view === 'settings' && !ui.sub ? 'Settings' : 'Back'}">${ui.view === 'settings' ? `${ui.sub ? '<img class="up-chevron" src="assets/ic_ab_back_holo_dark.png" alt="">' : ''}<img class="settings-header-icon" src="assets/settings.png" alt="">` : '‹'}</button><h2>${safe(title)}</h2>${right}</div>`;
  const content = (inner, theme = '') => `<div class="app-content ${theme}">${inner}</div>`;
  const appView = (title, inner, theme = '', right = '') => `<div class="app-view ${ui.view === 'settings' ? `settings-app ${!ui.sub ? 'settings-main' : ''}` : ''}">${actionbar(title, right)}${content(inner, ui.view === 'settings' ? `settings-dark ${theme}` : theme)}</div>`;
  const settingIcon = (id, fallback) => ui.view === 'settings' && ['wireless','bluetooth','data','sound','display','storage','battery','apps','language','date','about','sync','location','security','backup','accessibility','development'].includes(id) ? `<img src="assets/setting-${id}.png${id === 'bluetooth' ? '?v=2' : ''}" alt="">` : fallback;
  const row = (title, subtitle, action, id, icon = '') => `<button class="settings-row" data-action="${action}" data-id="${safe(id)}"><span class="row-icon">${icon === null ? '' : settingIcon(id, icon)}</span><span class="row-copy">${safe(title)}${subtitle ? `<small>${safe(subtitle)}</small>` : ''}</span><span class="chevron">›</span></button>`;
  const toggleRow = (title, subtitle, key) => wirelessCheckRow(title, subtitle, key);
  const connectivitySwitch = (key, title, inHeader = false) => `<button class="holo-switch ${data.settings[key] ? 'on' : ''} ${inHeader ? 'settings-action-switch' : ''}" data-action="toggle-setting" data-id="${key}" role="switch" aria-label="${safe(title)}" aria-checked="${data.settings[key]}"><span class="switch-label" aria-hidden="true">${data.settings[key] ? 'ON' : 'OFF'}</span></button>`;
  const connectivityRow = (title, key) => `<div class="settings-row connectivity-row"><button class="connectivity-open" data-action="settings-sub" data-id="${key}"><span class="row-icon">${settingIcon(key === 'wifi' ? 'wireless' : key, '')}</span><span class="row-copy">${safe(title)}</span></button>${connectivitySwitch(key, title)}</div>`;
  const wirelessRow = (title, subtitle, id) => `<button class="settings-row wireless-row" data-action="settings-sub" data-id="${id}"><span class="row-copy">${safe(title)}${subtitle ? `<small>${safe(subtitle)}</small>` : ''}</span></button>`;
  const wirelessCheckRow = (title, subtitle, key) => `<button class="settings-row wireless-row" data-action="toggle-setting" data-id="${key}" role="checkbox" aria-checked="${data.settings[key]}"><span class="row-copy">${safe(title)}${subtitle ? `<small>${safe(subtitle)}</small>` : ''}</span><img class="holo-checkbox" src="assets/btn_check_${data.settings[key] ? 'on' : 'off'}_holo_dark.png" alt=""></button>`;
  const label = text => `<div class="section-label">${safe(text)}</div>`;
  const carrierName = () => data.settings.airplane ? i18n.t('No service.') : safe(data.settings.networkOperator||'Telekom');
  let lastActivity=Date.now();
  for(const name of ['pointerdown','keydown','input','wheel'])document.addEventListener(name,()=>{lastActivity=Date.now();},{passive:true,capture:true});
  const lockControls=ICSLockscreen.controller({getData:()=>data,getUI:()=>ui,t:key=>i18n.t(key),save,render,clock,date:fullDate,carrier:()=>data.settings.airplane?i18n.t('No service.'):data.settings.networkOperator||'Telekom',toast,unlock:()=>{ui.locked=false;ui.sleeping=false;ui.gbPasswordEntry=false;home(false);},gb:()=>({...GBKeyguard.time(deviceDate(),!!data.settings.hour24),date:gbLockDate()})});
  ui.locked=ICSLockscreen.secure(data);if(ui.locked)ui.view='lock';lockControls.lock();lockControls.bind(screen);
  const statusIndicators = () => `<span class="status-right">${data.settings.bluetooth ? '<img class="status-bluetooth" src="assets/stat_sys_data_bluetooth.png" alt="">' : ''}${data.settings.silent ? `<img src="assets/stat_sys_ringer_${data.settings.silentMode === 'vibrate' ? 'vibrate' : 'silent'}.png" alt="">` : ''}${data.alarms.some(alarm => alarm.enabled) ? '<img src="assets/stat_sys_alarm.png" alt="">' : ''}${data.settings.wifi && data.settings.wifiNetwork ? '<img src="assets/stat_sys_wifi_signal_4_fully.png" alt="">' : ''}<img src="assets/${data.settings.airplane ? 'stat_sys_signal_flightmode' : 'stat_sys_signal_4_fully'}.png" alt=""><img class="status-battery" src="assets/stat_sys_battery_71.png" alt=""><span class="status-clock">${clock()}</span></span>`;

  // Gingerbread status bar: one 25 dp icon per notification on the left, config_statusBarIcons on the right.
  const noteIcon = n => n.id === 2 ? 'gb-app-mms-stat_notify_sms.png' : n.kind === 'calendar' ? 'gb-app-calendar-stat_notify_calendar.png' : n.kind === 'alarm' ? 'gb-app-deskclock-stat_notify_alarm.png' : 'gb-stat_sys_adb.png';
  // Clock.java: twelve_hour_time_format h:mm a with AM_PM_STYLE_GONE, or H:mm.
  const gbClock = () => { const now = deviceDate(), h = now.getHours(), m = String(now.getMinutes()).padStart(2, '0'); return `${data.settings.hour24 ? h : h % 12 || 12}:${m}`; };
  let seenNotes = null, stopTicker = null;
  function renderStatus() {
    const icons = data.notifications.map(noteIcon);
    if (ui.activeCall) icons.unshift(ui.activeCall.hold ? 'gb-stat_sys_phone_call_on_hold.png' : ui.activeCall.bluetooth ? 'gb-stat_sys_phone_call_bluetooth.png' : 'gb-stat_sys_phone_call.png');
    GBStatusBar.bar(statusRoot, {
      label: i18n.t('Open notifications'), notifications: icons, clock: gbClock(), expanded: ui.overlay === 'shade',
      date: deviceDate().toLocaleDateString(i18n.locale(), {year: 'numeric', month: 'long', day: 'numeric'}),
      state: {bluetooth: data.settings.bluetooth, ringer: data.settings.silent ? (data.settings.silentMode === 'vibrate' ? 'vibrate' : 'silent') : '', airplane: data.settings.airplane, wifi: data.settings.wifi && !!data.settings.wifiNetwork, data: data.settings.mobileData === false ? '' : '3g', battery: 78, alarm: data.alarms.some(alarm => alarm.enabled)}
    });
    // Ticker: newly posted notifications scroll through the bar once (tickerText = the notification title).
    const ids = new Set(data.notifications.map(n => n.id));
    const fresh = seenNotes ? data.notifications.filter(n => !seenNotes.has(n.id)) : [];
    seenNotes = ids;
    if (fresh.length && !ui.sleeping) { stopTicker?.(); stopTicker = GBStatusBar.ticker(statusRoot, fresh.reverse().map(n => ({icon: noteIcon(n), text: n.title})), () => { stopTicker = null; }); }
  }
  // Nexus S capacitive keys under the glass (Back, Menu, Search, Home). Long-pressing Home shows the recent apps.
  const touchGlyphs = {
    back: '<path d="M8.5 5.5 5 9l3.5 3.5M5.5 9H15a4.5 4.5 0 0 1 0 9H8"/>',
    menu: '<path d="M9 6h11M4 10h16M4 14h16M4 18h16"/>',
    search: '<circle cx="10" cy="10" r="5.5"/><path d="m14 14 5.5 5.5"/>',
    home: '<path d="M2.5 12.5 12 4.5l9.5 8M6 10.5V19h12v-8.5"/>'
  };
  function renderNav() {
    const keys = [['back', 'back', 'Back'], ['menu', 'menu-key', 'Menu'], ['search', 'search-key', 'Search'], ['home', 'home', 'Home']];
    navRoot.innerHTML = keys.map(([glyph, action, label]) => `<button class="touch-key touch-${glyph}" data-action="${action}" aria-label="${safe(i18n.t(label))}"><svg viewBox="0 0 24 24" aria-hidden="true">${touchGlyphs[glyph]}</svg></button>`).join('');
    if (ui.locked) navRoot.querySelectorAll('.touch-home,.touch-search').forEach(button => { button.disabled = true; button.setAttribute('aria-hidden', 'true'); });
  }
  // PowerManagerService: user activity turns the button backlight on; it goes off LONG_KEYLIGHT_DELAY (6 s) later.
  let keylightTimer = 0;
  function pokeKeylight() {
    if (ui.sleeping) return;
    navRoot.classList.add('lit'); clearTimeout(keylightTimer);
    keylightTimer = setTimeout(() => navRoot.classList.remove('lit'), 6000);
  }
  // The Menu key toggles the current screen's options panel; screens without a menu ignore it.
  function menuKey() {
    if (ui.overlay.startsWith('gb-menu') || overlayRoot.querySelector('.gbmenu')) { closeGBMenu(); return; }
    if (ui.overlay === 'shade') return;
    if (ui.view === 'home' && !ui.overlay) { ui.overlay = 'gb-menu-home'; renderOverlay(); return; }
    if (ui.view === 'drawer') return;
    if ((ui.view === 'phone' && (!ui.activeCall || ui.gbCallBackground) && ui.sub !== 'call-detail') || (ui.view === 'people' && (!ui.sub || ui.sub === 'detail'))) { const items = GBPhone.menu(gbPhoneContext()); if (items.length) { ui.gbMenuItems = items; ui.overlay = 'gb-menu-settings'; renderOverlay(); } return; }
    if (ui.view === 'settings' && GBSettings.has(ui.sub || 'main')) { const items = GBSettings.menu(ui.sub, gbSettingsContext()); if (items.length) { ui.gbMenuItems = items; ui.overlay = 'gb-menu-settings'; renderOverlay(); } return; }
    const button = [...viewport.querySelectorAll('[data-action$="-menu"]')].find(node => !node.disabled);
    button?.click();
  }
  function closeGBMenu() {
    const panel = overlayRoot.querySelector('.gbmenu');
    if (!panel || reducedMotion?.matches) { ui.overlay = ''; renderOverlay(); return; }
    panel.classList.add('closing');
    setTimeout(() => { if (overlayRoot.contains(panel)) { ui.overlay = ''; renderOverlay(); } }, 150);
  }
  // Launcher.onCreateOptionsMenu: Add, Manage apps, Wallpaper / Search, Notifications, Settings.
  const launcherMenu = () => [
    {action: 'gb-add', title: i18n.t('Add'), icon: 'ic_menu_add'},
    {action: 'settings-open', id: 'apps', title: i18n.t('Manage apps'), icon: 'ic_menu_manage'},
    {action: 'gb-wallpaper', title: i18n.t('Wallpaper'), icon: 'ic_menu_gallery'},
    {action: 'browser-search', title: i18n.t('Search'), icon: 'ic_search_category_default'},
    {action: 'gb-notifications', title: i18n.t('Notifications'), icon: 'ic_menu_notifications'},
    {action: 'open-app', app: 'settings', title: i18n.t('Settings'), icon: 'ic_menu_preferences'}
  ];
  // Holo options menus inherited from ICS become Gingerbread icon menus; known commands get their 2.3 menu icons.
  const menuIcons = {Refresh: 'ic_menu_refresh', Forward: 'ic_menu_forward', 'New tab': 'ic_menu_new_window', 'New window': 'ic_menu_new_window', Bookmark: 'ic_menu_add_bookmark', Bookmarks: 'ic_menu_bookmarks', Windows: 'ic_menu_windows', Settings: 'ic_menu_preferences', Share: 'ic_menu_share', Delete: 'ic_menu_delete', Search: 'ic_menu_search', Help: 'ic_menu_help', Edit: 'ic_menu_edit', 'Find on page': 'ic_menu_search', 'Saved pages': 'ic_menu_archive', 'Save for offline reading': 'ic_menu_save', 'New message': 'ic_menu_compose', Compose: 'ic_menu_compose', 'Add contact': 'ic_menu_add', 'New contact': 'ic_menu_add', 'Clear': 'ic_menu_close_clear_cancel', 'Add alarm': 'ic_menu_add', 'Advanced panel': 'ic_menu_more', 'Clear history': 'ic_menu_close_clear_cancel', Accounts: 'ic_menu_account_list', Import: 'ic_menu_upload', Export: 'ic_menu_save', 'Display options': 'ic_menu_view', Groups: 'ic_menu_allfriends', Today: 'ic_menu_today', 'New event': 'ic_menu_add', 'Day': 'ic_menu_day', 'Week': 'ic_menu_week', 'Month': 'ic_menu_month', 'Agenda': 'ic_menu_agenda', Refresh2: 'ic_menu_refresh', 'Party shuffle': 'ic_menu_shuffle', 'Shuffle all': 'ic_menu_shuffle', Library: 'ic_menu_music_library', 'Add to playlist': 'ic_menu_add', 'Set as ringtone': 'ic_menu_set_as_ringtone', 'Slideshow': 'ic_menu_slideshow', Rotate: 'ic_menu_rotate', Crop: 'ic_menu_crop', Details: 'ic_menu_info_details', 'Show on map': 'ic_menu_mapmode', 'Call log': 'ic_menu_recent_history', Contacts: 'ic_menu_allfriends'};
  function gingerbreadMenu() {
    const holo = overlayRoot.querySelector('.holo-menu:not(.gb-keep)');
    if (!holo) return;
    const items = [...holo.querySelectorAll('button')].map(button => ({action: button.dataset.action, id: button.dataset.id, app: button.dataset.app, title: button.textContent.trim(), icon: menuIcons[button.textContent.trim()], disabled: button.disabled}));
    if (!items.length) return;
    ui.gbMenuItems = items;
    overlayRoot.innerHTML = GBUI.menu(items, key => i18n.t(key));
  }
  function searchKey() {
    if (ui.view === 'lock' || ui.locked) return;
    openApp('browser');
  }
  // Window transitions: the outgoing view is kept in a temporary layer while both animate.
  let lastScene = null, pendingNav = '', activeTransition = null;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const animationScale = name => { const value = Number(data.settings[name === 'unlock' ? 'windowScale' : 'transitionScale']); return name.startsWith('drawer-') ? 1 : Number.isFinite(value) ? value : 1; };
  function endTransition() {
    if (!activeTransition) return;
    clearTimeout(activeTransition.timer);
    activeTransition.layers.forEach(layer => layer.remove());
    activeTransition.animations.forEach(animation => animation.cancel());
    screen.classList.remove('transitioning');
    activeTransition = null;
  }
  function startTransition(name, outgoing, incoming) {
    endTransition();
    const spec = ICSTransitions.specs[name], factor = animationScale(name);
    if (!spec || !factor || reducedMotion?.matches || document.hidden) return;
    const box = {top: viewport.offsetTop, left: viewport.offsetLeft, width: viewport.offsetWidth, height: viewport.offsetHeight};
    const layer = (className, child) => { const node = document.createElement('div'); node.className = `transition-layer ${className}`; node.setAttribute('aria-hidden', 'true'); node.inert = true; Object.assign(node.style, {top: `${box.top}px`, left: `${box.left}px`, width: `${box.width}px`, height: `${box.height}px`}); if (child) node.append(child); screen.insertBefore(node, overlayRoot); return node; };
    const layers = [];
    if (spec.black) layers.push(layer('transition-backdrop'));
    if (outgoing) layers.push(layer(spec.exit.top ? 'transition-over' : 'transition-under', outgoing));
    screen.classList.add('transitioning');
    const animations = [...ICSTransitions.play(outgoing, spec.exit, factor), ...ICSTransitions.play(incoming, spec.enter, factor)];
    activeTransition = {name, factor, start: performance.now(), layers, animations, timer: setTimeout(endTransition, ICSTransitions.length(spec) * factor + 40)};
  }
  function render() {
    viewport.querySelectorAll('.home-widget .calw-list').forEach(list => { (ui.widgetScroll ||= {})[list.closest('.home-widget').dataset.widgetId] = list.scrollTop; });
    if(ui.locked)ui.view='lock';
    const outgoing = viewport.firstElementChild;
    screen.className = `screen${activeTransition ? ' transitioning' : ''} wallpaper-${data.wallpaper}${data.settings.largeText ? ' large-text' : ''}${ui.sleeping?' sleeping':''}${ui.locked?' credential-locked':''}`;
    screen.style.background = data.wallpaper === 99 && data.customWallpaperPhoto ? `#080d14 url('${ICSMedia.image(data.customWallpaperPhoto)}') center / cover no-repeat` : data.wallpaper === 99 && data.customWallpaper ? `linear-gradient(160deg, ${data.customWallpaper[0]}, ${data.customWallpaper[1]} 53%, ${data.customWallpaper[2]})` : `#000 url('assets/gb-wallpaper_${wallpaperFiles[data.wallpaper] || 'street_lights'}.jpg') ${ui.page * 25}% center / auto 100% no-repeat`;
    screen.style.filter = `brightness(${.5 + data.settings.brightness / 135})`;
    renderStatus(); renderNav(); syncLiveWallpaper();
    if (ui.view === 'lock') { viewport.innerHTML = renderLock(); attachGBLock(); }
    else if (ui.view === 'home') { viewport.innerHTML = renderHome(); restoreWidgetScroll(); }
    else if (ui.view === 'drawer') viewport.innerHTML = renderDrawer();
    else viewport.innerHTML = renderApp();
    renderOverlay();
    i18n.translateDOM(screen);
    const scene = {view: ui.view, sub: ui.sub}, transit = ui.sleeping ? '' : ICSTransitions.kind(lastScene, scene, pendingNav);
    lastScene = scene;
    if (transit) startTransition(transit, outgoing, viewport.firstElementChild);
    else if (activeTransition) {
      // A same-screen re-render during a transition continues the incoming animation.
      const elapsed = performance.now() - activeTransition.start;
      ICSTransitions.play(viewport.firstElementChild, ICSTransitions.specs[activeTransition.name].enter, activeTransition.factor).forEach(animation => { animation.currentTime = elapsed; activeTransition.animations.push(animation); });
    }
    if (ui.nyandroid && !viewport.querySelector('[data-nyandroid]')?.isSameNode(ui.nyandroid.root)) { ui.nyandroid.stop(); ui.nyandroid = null; }
    const nyanRoot = viewport.querySelector('[data-nyandroid]');
    if (nyanRoot && !ui.nyandroid) requestAnimationFrame(() => { if (nyanRoot.isConnected && !ui.nyandroid) ui.nyandroid = {...ICSNyandroid.start(nyanRoot), root: nyanRoot}; });
    if (ui.view === 'browser' && !ui.sub && ui.browserFind) highlightBrowserText();
    if(ui.view==='calendar' && viewport.querySelector('.cal-time-scroll'))viewport.querySelector('.cal-time-scroll').scrollTop=8*48;
  }
  function restoreWidgetScroll() {
    ui.widgetScroll = ui.widgetScroll || {};
    viewport.querySelectorAll('.home-widget .calw-list').forEach(list => {
      const id = list.closest('.home-widget').dataset.widgetId;
      list.scrollTop = ui.widgetScroll[id] || 0;
    });
  }
  function lockScreen(){captureRecentView();lockControls.lock();ui.locked=ICSLockscreen.secure(data);ui.gbPasswordEntry=false;ui.sleeping=data.settings.screenLock==='none';ui.view=ui.sleeping?'home':'lock';ui.overlay='';render();}
  /* MultiWaveView (keyguard_screen_tab_unlock): targets sit on the ring (radius 135dp), the handle follows the
     finger inside it and snaps to a target within the 60dp hit radius. Release elsewhere returns the handle in
     300 ms (Quart ease-out), fades the targets after 200 ms over 1200 ms, then pings the right chevrons
     (three, 160 ms apart, 850 ms Quad ease-out, scale 0.5 -> 2, alpha 1 -> 0). */
  const lockWave = {radius: 112, hit: 54};
  function lockPing() {
    const chevrons = [...viewport.querySelectorAll('.lock-chevron')];
    if (!chevrons.length || reducedMotion?.matches) return;
    chevrons.forEach((chevron, index) => {
      chevron.getAnimations().forEach(animation => animation.cancel());
      chevron.animate([{transform: 'translateX(39px) scale(.5)', opacity: 1}, {transform: `translateX(${lockWave.radius * .9}px) scale(2)`, opacity: 0}], {duration: 850, delay: index * 160, easing: 'cubic-bezier(.25,.46,.45,.94)', fill: 'backwards'});
    });
  }
  function lockMove(dx, dy) {
    const handle = viewport.querySelector('.lock-handle');
    if (!handle) return null;
    const distance = Math.hypot(dx, dy), scale = distance > lockWave.radius ? lockWave.radius / distance : 1;
    let x = dx * scale, y = dy * scale, active = null;
    for (const [name, tx] of [['unlock', lockWave.radius], ['camera', -lockWave.radius]]) if (Math.hypot(x - tx, y) < lockWave.hit) { active = name; x = tx; y = 0; }
    handle.style.setProperty('--lock-x', `${x}px`); handle.style.setProperty('--lock-y', `${y}px`);
    viewport.querySelectorAll('.lock-target').forEach(target => target.classList.toggle('active', target.classList.contains(`lock-target-${active}`)));
    handle.classList.toggle('over-target', !!active);
    if (active && active !== pointerStart?.lockActive && data.settings.haptic !== false) navigator.vibrate?.(20);
    return active;
  }
  function lockRelease(active) {
    const handle = viewport.querySelector('.lock-handle');
    screen.classList.remove('lock-dragging');
    if (active) {
      viewport.querySelectorAll(`.lock-target:not(.lock-target-${active})`).forEach(target => target.classList.add('dismissed'));
      viewport.querySelector('.lock-outer-ring')?.classList.add('dismissed');
      suppressClickUntil = Date.now() + 350;
      if (active === 'unlock') home(); else openApp('camera');
      return;
    }
    viewport.querySelectorAll('.lock-target').forEach(target => target.classList.remove('active'));
    if (!handle) return;
    handle.classList.remove('over-target');
    screen.classList.add('lock-releasing');
    handle.style.setProperty('--lock-x', '0px'); handle.style.setProperty('--lock-y', '0px');
    clearTimeout(ui.lockReleaseTimer);
    ui.lockReleaseTimer = setTimeout(() => { screen.classList.remove('lock-releasing'); lockPing(); }, 300);
  }
  // Next alarm as NEXT_ALARM_FORMATTED ("EEE h:mm aa" or "EEE k:mm") and the lock screen date (full_wday_month_day_no_year).
  function nextAlarmLabel() {
    const next = data.alarms.filter(alarm => alarm.enabled).map(alarm => ICSDeskClock.nextOccurrence(alarm, deviceDate())).filter(Boolean).sort((a, b) => a - b)[0];
    if (!next) return '';
    const day = next.toLocaleDateString(i18n.locale(), {weekday: 'short'}), h = next.getHours(), m = String(next.getMinutes()).padStart(2, '0');
    return data.settings.hour24 ? `${day} ${h}:${m}` : `${day} ${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
  }
  const gbLockDate = () => deviceDate().toLocaleDateString(i18n.locale(), {weekday: 'long', month: 'long', day: 'numeric'});
  /* LockPatternKeyguardView.getInitialMode: a pattern lock opens straight on the pattern screen; PIN and password locks
     show the SlidingTab lock screen first and its unlock tab leads to the password screen. */
  function renderLock() {
    if (ui.locked && (data.settings.screenLock === 'pattern' || ui.gbPasswordEntry)) return lockControls.renderLock();
    return GBKeyguard.slideScreen({t: key => i18n.t(key), carrier: data.settings.airplane ? i18n.t('No service.') : data.settings.networkOperator || 'Telekom', ...GBKeyguard.time(deviceDate(), !!data.settings.hour24), date: gbLockDate(), alarm: nextAlarmLabel(), silent: !!data.settings.silent, vibrate: data.settings.silentMode === 'vibrate', toast: ui.gbLockToast});
  }
  let gbTabs = null;
  function attachGBLock() {
    gbTabs?.destroy(); gbTabs = null;
    const root = viewport.querySelector('.gbkg-tab-screen'); if (!root) return;
    gbTabs = GBKeyguard.slidingTab(root, {haptic: () => data.settings.haptic !== false, reduced: !!reducedMotion?.matches, onTrigger: side => {
      if (ui.view !== 'lock') return;
      suppressClickUntil = Date.now() + 350;
      if (side === 'left') { if (ui.locked) { ui.gbPasswordEntry = true; render(); } else home(); return; }
      // LockScreen.onTrigger(RIGHT_HANDLE): toggle silent mode (vibrate when "vibrate in silent" is on) and toast it for 3.5 s.
      const silent = !data.settings.silent;
      data.settings.silent = silent;
      if (silent) data.settings.silentMode = data.settings.vibrateSilent === false ? 'silent' : 'vibrate';
      save(); renderStatus();
      ui.gbLockToast = silent ? {text: i18n.t('Sound is OFF'), color: '#ffffff', icon: 'gb-ic_lock_ringer_off.png'} : {text: i18n.t('Sound is ON'), color: '#e69310', icon: 'gb-ic_lock_ringer_on.png'};
      clearTimeout(ui.gbLockToastTimer); ui.gbLockToastTimer = setTimeout(() => { ui.gbLockToast = null; if (ui.view === 'lock') render(); }, 3500);
      render();
    }});
  }

  function analogClock() {
    const now = deviceDate();
    return `<div class="analog-clock" aria-label="${clock()}"><img class="clock-dial" src="assets/appwidget_clock_dial.png" alt=""><img class="clock-hour" src="assets/appwidget_clock_hour.png" alt="" style="transform:rotate(${(now.getHours() % 12) * 30 + now.getMinutes() / 2}deg)"><img class="clock-minute" src="assets/appwidget_clock_minute.png" alt="" style="transform:rotate(${now.getMinutes() * 6}deg)"></div>`;
  }
  // Drawer and drag previews use the providers' original previewImage artwork where AOSP has one.
  function widgetArt(type) {
    if (type === 'analog') return analogClock();
    if (type === 'digital') return `<strong class="widget-time">${clock()}</strong><span>${fullDate()}</span>`;
    if (type === 'calendar') return '<img class="widget-preview-image" src="assets/calwidget-calendar_widget_preview.png" alt="">';
    if (type === 'weather') return '<strong class="widget-weather">☀ 22°</strong><span>Sunny · San Francisco</span>';
    if (type === 'music') return ICSWidgets.music(ui.music, tracks, false, key => i18n.t(key), true);
    if (type === 'power') return `<div class="power-widget">${[['wifi','wifi'],['bluetooth','bluetooth'],['gps','gps'],['autoSync','sync'],['brightness','brightness']].map(([key,asset]) => `<span class="power-cell ${data.settings[key] ? 'enabled' : ''}"><img src="assets/power-${asset}-${key === 'brightness' ? data.settings.brightness > 70 ? 'full' : data.settings.brightness > 25 ? 'half' : 'off' : data.settings[key] ? 'on' : 'off'}.png" alt=""><i></i></span>`).join('')}</div>`;
    return '<img class="widget-preview-image" src="assets/gallery-widget_preview.png" alt="">';
  }
  const musicActive = () => ui.music.playing || ui.music.position > 0 || !!ui.musicActive;
  function widgetBody(widget) {
    const t = key => i18n.t(key);
    if (widget.type === 'search') return GBLauncher.search(t);
    if (widget.type === 'protips') return GBLauncher.protips({...(data.protips || {index: 0, set: 0}), icon: ui.tipsIcon}, i18n.language);
    if (widget.type === 'calendar') return ICSWidgets.calendar(data, t, i18n.locale(), deviceDate(), !!data.settings.hour24);
    if (widget.type === 'music') return GBLauncher.music(ui.music, tracks[ui.music.track], musicActive(), t);
    if (widget.type === 'photo') return ICSWidgets.photo(data, widget, ui.photoStacks?.[widget.id] || 0, t);
    return null;
  }
  const homeWidget = widget => {
    const spec = widgetSize(widget);
    const body = widgetBody(widget) ?? (widget.type === 'power' ? `<div class="power-widget">${[['wifi','Wi-Fi','wifi'],['bluetooth','Bluetooth','bluetooth'],['gps','GPS satellites','gps'],['autoSync','Auto-sync','sync'],['brightness','Brightness','brightness']].map(([key,title,asset]) => `<button class="power-cell ${data.settings[key] ? 'enabled' : ''}" data-action="power-toggle" data-id="${key}" aria-label="${title}" aria-pressed="${!!data.settings[key]}"><img src="assets/power-${asset}-${key === 'brightness' ? data.settings.brightness > 70 ? 'full' : data.settings.brightness > 25 ? 'half' : 'off' : data.settings[key] ? 'on' : 'off'}.png" alt=""><i></i></button>`).join('')}</div>` : `<button data-action="open-app" data-app="${spec.app || 'gallery'}" aria-label="${safe(spec.name || 'Widget')}">${widgetArt(widget.type)}</button>`);
    return `<div class="home-widget widget-${widget.type}" data-widget-id="${safe(widget.id)}" style="grid-column:${widget.x + 1}/span ${spec.width};grid-row:${widget.y + 1}/span ${spec.height}">${body}</div>`;
  };
  const wallpaperChoices = () => `<div class="wallpaper-grid">${wallpaperFiles.map((name, i) => `<button class="wallpaper-choice ${data.wallpaper === i ? 'selected' : ''}" data-action="wallpaper" data-id="${i}" aria-label="${safe(name)}"><span class="wallpaper-swatch" style="background-image:url('assets/wallpaper_${name}.jpg')"></span><strong>${safe(name[0].toUpperCase() + name.slice(1))}</strong></button>`).join('')}</div>`;
  function renderHome() {
    const t = key => i18n.t(key);
    return `<div class="home-view gbl"><div class="home-content"><div class="home-pages" style="transform:translateX(${-ui.page * 100}%)">${data.homePages.map((page, index) => `<div class="home-grid" data-home-page="${index}" ${index !== ui.page ? 'inert' : ''}>${page.map((id, slot) => `<div class="home-slot" data-home-slot="${slot}" style="grid-column:${slot % 4 + 1};grid-row:${Math.floor(slot / 4) + 1}">${id ? launcherIcon(id) : ''}</div>`).join('')}${data.homeWidgets[index].map(homeWidget).join('')}</div>`).join('')}</div></div>${GBLauncher.arrows(ui.page, 5, t)}${GBLauncher.dock(t)}<div class="drop-target-bar gbl-delete"><div class="drop-target" data-drop-remove="true" aria-label="${safe(t('Remove'))}"><img src="assets/gb-l2-trashcan.png" alt=""><img class="drop-target-active" src="assets/gb-l2-trashcan_hover.png" alt=""></div></div></div>`;
  }
  // AllApps2D: a black 4-column GridView of application_boxed items (alphabetical) above the home button.
  function renderDrawer() {
    const sortedApps = [...apps].sort((a, b) => i18n.t(a[1]).localeCompare(i18n.t(b[1]), i18n.locale()));
    return `<div class="drawer-view gbl-allapps-view"><div class="drawer-page drawer-apps gbl-allapps-grid">${sortedApps.map(app => launcherIcon(app[0])).join('')}</div><button class="gbl-allapps-home" data-action="home" aria-label="${safe(i18n.t('Home'))}"></button></div>`;
  }
  function widgetFits(page, x, y, type, ignoredId = '') {
    const {width, height} = widgetSize(type);
    if (x < 0 || y < 0 || x + width > 4 || y + height > 4) return false;
    for (let row = y; row < y + height; row++) for (let column = x; column < x + width; column++) {
      if (data.homePages[page][row * 4 + column]) return false;
    }
    return !data.homeWidgets[page].some(widget => widget.id !== ignoredId && x < widget.x + widgetSize(widget).width && x + width > widget.x && y < widget.y + widgetSize(widget).height && y + height > widget.y);
  }
  function addWidget(type, x = null, y = null) {
    const spots = x === null ? Array.from({length:16}, (_, i) => [i % 4, Math.floor(i / 4)]) : [[x,y]];
    const spot = spots.find(([column,row]) => widgetFits(ui.page, column, row, type));
    if (!spot) return false;
    const widget = {id:`widget-${Date.now()}`,type,x:spot[0],y:spot[1]};
    // Gallery2 declares a configure activity; the widget stays empty until it finishes.
    if (type === 'photo') { widget.source = null; ui.photoWidgetSetup = {page: ui.page, id: widget.id}; ui.overlay = 'widget-photo-type'; }
    data.homeWidgets[ui.page].push(widget);
    save(); return widget;
  }
  function stepPhotoStack(id, direction) {
    const widget = data.homeWidgets.flat().find(item => item.id === id);
    if (!widget) return;
    const count = ICSWidgets.photoItems(data, widget).length;
    if (count < 2) { render(); return; }
    ui.photoStacks = ui.photoStacks || {};
    ui.photoStacks[id] = ICSWidgets.wrap((ui.photoStacks[id] || 0) + direction, count);
    render();
    const stack = viewport.querySelector(`[data-photo-stack="${CSS.escape(id)}"]`);
    if (stack) stack.classList.add(direction > 0 ? 'stack-next' : 'stack-previous');
  }
  const pendingPhotoWidget = () => ui.photoWidgetSetup && data.homeWidgets[ui.photoWidgetSetup.page]?.find(widget => widget.id === ui.photoWidgetSetup.id);
  function configurePhotoWidget(options) {
    const widget = pendingPhotoWidget();
    if (widget) Object.assign(widget, options);
    ui.photoWidgetSetup = null; ui.overlay = ''; save(); render(); toast('Widget added');
  }
  // Leaving WidgetConfigure without a choice removes the pending widget, as on Android.
  function cancelPhotoWidget() {
    const setup = ui.photoWidgetSetup;
    if (setup) data.homeWidgets[setup.page] = data.homeWidgets[setup.page].filter(widget => widget.id !== setup.id);
    ui.photoWidgetSetup = null; ui.overlay = ''; save(); render();
  }
  // LivePicker: the list (LiveWallpaperActivity), the preview with its button bar, and Polar clock's settings.
  function renderLiveWallpapers() {
    const sub = String(ui.sub || '');
    if (sub.startsWith('preview:')) {
      const spec = LiveWallpapers.find(sub.slice(8));
      return `<div class="app-view lw-preview"><div class="lw-preview-bar">${spec?.settings ? `<button data-action="lw-settings" data-id="${spec.id}">${safe(i18n.t('Settings…'))}</button>` : ''}<button data-action="lw-set" data-id="${safe(spec?.id || '')}">${safe(i18n.t('Set wallpaper'))}</button></div></div>`;
    }
    if (sub.startsWith('settings:')) {
      const p = data.lwPrefs?.polar || {}, palette = p.palette || '';
      const check = (key, title) => `<button class="settings-row wireless-row" data-action="lw-toggle" data-id="polar:${key}" role="checkbox" aria-checked="${p[key] !== false}"><span class="row-copy">${safe(i18n.t(title))}</span><img class="holo-checkbox" src="assets/btn_check_${p[key] !== false ? 'on' : 'off'}_holo_dark.png" alt=""></button>`;
      return `<div class="app-view settings-app"><div class="actionbar"><button class="up" data-action="back" aria-label="Back">‹</button><h2>${safe(i18n.t('Polar clock settings'))}</h2></div><div class="app-content dark lw-settings">${check('showSeconds', 'Show seconds')}${check('variableWidth', 'Vary ring widths')}<button class="settings-row wireless-row" data-action="lw-palette"><span class="row-copy">${safe(i18n.t('Color palette'))}${palette ? `<small>${safe(i18n.t(LiveWallpapers.PALETTE_NAMES[palette]))}</small>` : ''}</span></button></div></div>`;
    }
    return `<div class="app-view lw-picker" data-no-translate>${LiveWallpapers.sorted(key => i18n.t(key), i18n.locale()).map(spec => `<button class="lw-entry" data-action="lw-preview" data-id="${spec.id}"><img src="assets/${spec.thumb}" alt=""><span>${safe(i18n.t(spec.label))}</span></button>`).join('')}</div>`;
  }
  viewport.addEventListener('click', event => {
    if (ui.view !== 'home' || !liveWallpaper || event.target.closest('button,a,input,[data-action],.widget,.home-search,.dock')) return;
    const r = screen.getBoundingClientRect(); liveWallpaper.tap(event.clientX - r.left, event.clientY - r.top);
  });
  function renderApp() {
    switch (ui.view) {
      case 'play-store': return ICSPlayStore.render(ui.play, data.playRatings || {}, key => i18n.t(key));
      case 'live-wallpapers': return renderLiveWallpapers();
      case 'wallpaper-picker': { const selected = Number.isInteger(ui.wpChoice) ? ui.wpChoice : Math.max(0, data.wallpaper); return `<div class="app-view gbwp"><div class="gbwp-preview"><img src="assets/gb-wallpaper_${wallpaperFiles[selected]}.jpg" alt=""></div><div class="gbwp-gallery" role="listbox" aria-label="${safe(i18n.t('Wallpapers'))}">${wallpaperFiles.map((name, index) => `<button class="gbwp-item${index === selected ? ' selected' : ''}" role="option" aria-selected="${index === selected}" data-action="gb-wp-pick" data-id="${index}" aria-label="${safe(name.replace(/_/g, ' '))}"><img src="assets/gb-wallpaper_${name}_small.jpg" alt=""></button>`).join('')}</div><button class="gbwp-set" data-action="wallpaper" data-id="${selected}">${safe(i18n.t('Set wallpaper'))}</button></div>`; }
      case 'settings': return renderSettings();
      case 'browser': return renderBrowser();
      case 'phone': return renderPhone();
      case 'people': return renderPeople();
      case 'messaging': return renderMessaging();
      case 'gallery': return renderGallery();
      case 'camera': return renderCamera();
      case 'calendar': return renderCalendar();
      case 'clock': return renderClock();
      case 'calculator': return renderCalculator();
      case 'music': return renderMusic();
      case 'email': return renderEmail();
      default: return renderHome();
    }
  }
  function openApp(app, resume = false) {
    if(ui.locked)return;
    if (!appNames[app]) return;
    captureRecentView();
    if (app === 'play-store' && !resume) { ui.play = ICSPlayStore.initial(); ui.playHistory = []; }
    ui.view = app; ui.sub = resume ? ui.recentState?.[app]?.sub || '' : ''; ui.overlay = ''; if (app === 'settings' && !resume) ui.settingsRootScroll = 0;
    if (app === 'phone' && ui.activeCall && !resume) { ui.gbCallBackground = true; ui.gbAddCall = false; ui.phoneTab = 'dialpad'; }
    ui.recent = [app, ...ui.recent.filter(id => id !== app)].slice(0, 7);
    render();
    if (resume && viewport.firstElementChild) appScrollContainer(app).scrollTop = ui.recentState?.[app]?.scrollTop || 0;
  }
  function appScrollContainer(app) {
    return viewport.querySelector(app === 'play-store' ? '.play-content' : app === 'messaging' ? '.mms-scroll' : app === 'email' ? '.email-scroll' : app === 'music' ? '.music-library-scroll' : app === 'calendar' ? '.cal-scroll' : app === 'gallery' ? '.gallery-scroll' : app === 'clock' ? '.desk-scroll' : app === 'people' ? '.people-scroll' : app === 'browser' ? '.browser-page,.web-tabs,.web-library' : '.app-view') || viewport.firstElementChild;
  }
  function captureRecentView() {
    if (appNames[ui.view] && viewport.firstElementChild) {
      ui.recentSnapshots[ui.view] = viewport.innerHTML;
      ui.recentState ||= {};
      ui.recentState[ui.view] = {sub: ui.sub, scrollTop: appScrollContainer(ui.view).scrollTop};
    }
  }
  function home(resetPage = true) { if(ui.locked)return;if(ui.photoWidgetSetup){const setup=ui.photoWidgetSetup;data.homeWidgets[setup.page]=data.homeWidgets[setup.page].filter(widget=>widget.id!==setup.id);ui.photoWidgetSetup=null;save();}if(ui.sub==='lock-setup')lockControls.lock();captureRecentView(); ui.view = 'home'; ui.sub = ''; ui.overlay = ''; if (resetPage) ui.page = 2; render(); }
  function back() { pendingNav = 'back'; try { navigateBack(); } finally { pendingNav = ''; } }
  function navigateBack() {
    if(ui.view==='settings'&&ui.sub==='lock-setup'){lockControls.cancel();if(ui.gbSettingsStack?.length)ui.gbSettingsStack.pop();return;}
    if(ui.view==='settings'&&ui.gbSettingsStack)while(ui.gbSettingsStack.length&&ui.gbSettingsStack.at(-1)===ui.sub)ui.gbSettingsStack.pop();
    if(ui.view==='settings'&&ui.sub&&ui.gbSettingsStack?.length&&!ui.overlay){ui.sub=ui.gbSettingsStack.pop();render();return;}
    if(ui.view==='lock'&&ui.gbPasswordEntry&&data.settings.screenLock!=='pattern'){ui.gbPasswordEntry=false;lockControls.lock();render();return;}
    if (ui.overlay.startsWith('widget-photo')) { cancelPhotoWidget(); return; }
    if (ui.overlay === 'shade') { closeShade(); return; }
    if (ui.overlay) { ui.overlay = ''; render(); return; }
    if (ui.view === 'live-wallpapers') { const sub = String(ui.sub || ''); if (sub.startsWith('settings:')) ui.sub = `preview:${sub.slice(9)}`; else if (sub) ui.sub = ''; else { home(false); return; } render(); return; }
    if (ui.view === 'lock') return;
    if(ui.view==='phone' && ui.activeCall && ui.gbAddCall){ui.gbAddCall=false;ui.gbCallBackground=false;render();return;}
    if(ui.view==='phone' && ui.activeCall && !ui.gbCallBackground){if(ui.activeCall.keypad){ui.activeCall.keypad=false;render();}else home(false);return;}
    if (ui.view === 'gallery' && ui.gallerySlideshow) { ui.gallerySlideshow=false;render();return; }
    if (ui.view === 'gallery' && ui.sub === 'photo') { ui.sub='album';ui.galleryZoom=false;render();return; }
    if (ui.view === 'calendar' && ui.sub === 'event-edit') { ui.sub=ui.eventDraft?.id?'event':'';ui.eventDraft=null;calendarRender();return; }
    if(ui.view==='settings' && ['apn','operators','tether-help','device-admin'].includes(ui.sub)){ui.sub={apn:'mobile-networks',operators:'mobile-networks','tether-help':'tethering','device-admin':'security'}[ui.sub];render();return;}
    if(ui.view==='settings' && ['app-info','data-app','battery-history','battery-detail','storage-misc'].includes(ui.sub)){ui.sub={'app-info':'apps','data-app':'data','battery-history':'battery','battery-detail':'battery','storage-misc':'storage'}[ui.sub];render();return;}
    if(ui.view==='music' && ui.sub==='queue'){ui.sub='player';render();return;}
    if (ui.view === 'play-store' && ui.playHistory.length) {
      ui.play = ui.playHistory.pop(); render();
      viewport.querySelector('.play-content').scrollTop = ui.play.scrollTop || 0;
      return;
    }
    if (ui.view === 'calculator' && ui.calcPanel) { setCalculatorPanel(0); return; }
    if (ui.view === 'drawer' || ui.view === 'wallpaper-picker') { home(false); return; }
    if (ui.view === 'browser' && !ui.sub && ui.browserFind !== undefined) { ui.browserFind = undefined; render(); return; }
    if (ui.view === 'browser' && !ui.sub && ui.browserIndex > 0) { browserBack(); return; }
    if (ui.view === 'settings' && ['easter', 'about-status', 'about-legal', 'about-safety'].includes(ui.sub)) { ui.sub = 'about'; ui.easterNyan = false; render(); return; }
    if (ui.view === 'settings' && ['vpn', 'tethering', 'beam', 'mobile-networks'].includes(ui.sub)) { ui.sub = 'wireless'; render(); return; }
    if (ui.view === 'settings' && ui.sub === 'wifi-advanced') { ui.sub = 'wifi'; render(); return; }
    if (ui.view === 'settings' && ui.sub === 'sync-google') { ui.sub = 'sync'; render(); return; }
    if (ui.view === 'settings' && ui.sub === 'reset-info') { ui.sub = 'backup'; render(); return; }
    if (ui.view === 'settings' && ['brightness','wallpaper','sleep'].includes(ui.sub)) { ui.sub = 'display'; render(); return; }
    if (ui.view === 'settings' && ['volumes','ringtone'].includes(ui.sub)) { ui.sub = 'sound'; render(); return; }
    if (ui.view === 'messaging' && ui.sub === 'thread') { ui.sub = ui.mmsListMode || ''; render(); return; }
    if (ui.view === 'clock' && ui.sub === 'alarm-edit') { ui.alarmDraft=null; ui.sub='alarms'; render(); return; }
    if (ui.view === 'people' && ui.sub === 'edit') { ui.sub = 'detail'; render(); return; }
    if (ui.sub) { ui.sub = ''; render(); if (ui.view === 'settings') viewport.querySelector('.settings-app').scrollTop = ui.settingsRootScroll; return; }
    home(false);
  }
  function toast(message) {
    document.querySelector('.toast')?.remove();
    const element = document.createElement('div'); element.className = 'toast'; element.textContent = i18n.t(message);
    screen.append(element);
    clearTimeout(ui.toastTimer); ui.toastTimer = setTimeout(() => element.remove(), 2500);
  }
  // Shade motion (StatusBarService): the panel's bottom edge follows the finger and flings with +-2000 px/s^2.
  let shadeTracking = null, stopShade = null;
  const shadeBottom = () => screen.clientHeight;
  function shadeFling(from, velocity, expand) {
    const panel = overlayRoot.querySelector('.gbsh-panel'); if (!panel) return;
    stopShade?.();
    stopShade = GBStatusBar.slide(panel, {from, velocity, accel: (expand ? 1 : -1) * GBStatusBar.ACCEL, top: statusRoot.offsetHeight, bottom: shadeBottom(), reduced: !!reducedMotion?.matches}, opened => {
      stopShade = null;
      if (!opened && ui.overlay === 'shade') { ui.overlay = ''; renderOverlay(); renderStatus(); }
    });
  }
  function closeShade() {
    const panel = overlayRoot.querySelector('.gbsh-panel');
    if (!panel || ui.overlay !== 'shade') { ui.overlay = ''; renderOverlay(); renderStatus(); return; }
    const y = new DOMMatrixReadOnly(getComputedStyle(panel).transform).m42 + shadeBottom();
    shadeFling(Math.min(shadeBottom() - 1, y), -2000 * GBStatusBar.PX, false);
  }
  // Launcher AddAdapter ("Add to Home screen"), the shortcut and widget pickers and "Select wallpaper from".
  function gbDialogSpec() {
    const t = key => i18n.t(key);
    if (ui.overlay === 'gb-dialog-add') return {title: t('Add to Home screen'), items: [
      {action: 'gb-add-shortcuts', title: t('Shortcuts'), icon: 'l2-ic_launcher_shortcut'},
      {action: 'gb-add-widgets', title: t('Widgets'), icon: 'l2-ic_launcher_appwidget'},
      {action: 'gb-add-folders', title: t('Folders'), icon: 'l2-ic_launcher_folder'},
      {action: 'gb-wallpaper', title: t('Wallpapers'), icon: 'l2-ic_launcher_wallpaper'}]};
    if (ui.overlay === 'gb-dialog-shortcuts') return {title: t('Select shortcut'), items: [...apps].sort((a, b) => t(a[1]).localeCompare(t(b[1]), i18n.locale())).map(app => ({action: 'gb-add-app', id: app[0], title: t(app[1]), icon: `${app[0]}.png`}))};
    if (ui.overlay === 'gb-dialog-widgets') return {title: t('Choose widget'), items: widgetTypes.map(widget => ({action: 'add-widget-gb', id: widget.type, title: t(widget.name), icon: `${widget.app || 'settings'}.png`}))};
    if (ui.overlay === 'gb-dialog-folders') return {title: t('Select folder'), items: [
      {action: 'gb-new-folder', title: t('New folder'), icon: 'l2-ic_launcher_folder'},
      {action: 'gb-new-folder', id: 'all', title: t('All contacts'), icon: 'ic_launcher_folder_live_contacts'},
      {action: 'gb-new-folder', id: 'phone', title: t('Contacts with phone numbers'), icon: 'ic_launcher_folder_live_contacts_phone'},
      {action: 'gb-new-folder', id: 'starred', title: t('Starred contacts'), icon: 'ic_launcher_folder_live_contacts_starred'}]};
    if (ui.overlay === 'gb-dialog-clearlog') return {title: GBPhone.text(i18n.language, 'clearCallLogConfirmation_title'), icon: 'ic_dialog_alert', message: GBPhone.text(i18n.language, 'clearCallLogConfirmation'), buttons: [{action: 'gbp-clear-log-ok', title: GBSettings.text(i18n.language, 'fw_ok')}, {action: 'close-overlay', title: GBSettings.text(i18n.language, 'fw_cancel')}]};
    if (ui.overlay === 'gb-dialog-set') return GBSettings.dialog(ui.gbSetDialog, gbSettingsContext()) || {title: '', items: []};
    if (ui.overlay === 'gb-dialog-list') return GBSettings.listDialog(ui.gbListKey, gbSettingsContext()) || {title: '', items: []};
    // BrightnessPreference (preference_dialog_brightness.xml): "Automatic brightness" above the seek bar; OK / Cancel.
    if (ui.overlay === 'gb-dialog-brightness') return {title: GBSettings.text(i18n.language, 'brightness'), custom: `<div class="gbbright"><label><input type="checkbox" ${GBSettings.value(data.settings, 'autoBrightness') ? 'checked' : ''}> ${safe(t('Automatic brightness'))}</label><input type="range" min="10" max="100" value="${ui.brightnessDraft ?? data.settings.brightness}" aria-label="${safe(GBSettings.text(i18n.language, 'brightness'))}"></div>`, buttons: [{action: 'gbset-brightness-ok', title: GBSettings.text(i18n.language, 'fw_ok')}, {action: 'close-overlay', title: GBSettings.text(i18n.language, 'fw_cancel')}]};
    if (ui.overlay === 'gb-dialog-rename') return {title: t('Rename folder'), custom: `<label class="gbdlg-field"><span>${safe(t('Folder name'))}</span><input maxlength="40" value="${safe(ICSLauncherFolders.folder(data, ui.folderId)?.name || t('Folder'))}"></label>`, buttons: [{action: 'gb-rename-folder', title: t('OK')}, {action: 'gb-rename-cancel', title: t('Cancel')}], cancel: 'gb-rename-cancel'};
    if (ui.overlay === 'gb-dialog-wallpaper') return {title: t('Select wallpaper from'), items: [
      {action: 'open-app', app: 'gallery', title: t('Gallery'), icon: 'gallery.png'},
      {action: 'open-live-wallpapers', title: t('Live wallpapers'), icon: 'gb-l2-ic_launcher_wallpaper.png'},
      {action: 'open-wallpapers', title: t('Wallpapers'), icon: 'l2-ic_launcher_wallpaper'}]};
    return {title: '', items: []};
  }
  /* Launcher.showPreviews: each CellLayout is drawn at the scale that fits all five screens across the CellLayout width
     (minus the preview_background padding), without the wallpaper, in a PopupWindow next to the anchor. */
  function fillPreviews() {
    const popup = overlayRoot.querySelector('.gbprev'); if (!popup) return;
    const grids = [...viewport.querySelectorAll('.home-grid')];
    const width = screen.clientWidth, cellsHeight = viewport.clientHeight - 6.9 - 67.28, thumbWidth = (width - 5 * 5.75) / 5, scale = thumbWidth / width;
    popup.querySelectorAll('.gbprev-thumb').forEach((thumb, index) => {
      thumb.style.width = `${thumbWidth}px`; thumb.style.height = `${cellsHeight * scale}px`;
      const clone = grids[index]?.cloneNode(true); if (!clone) return;
      clone.removeAttribute('inert'); clone.inert = true; clone.classList.add('gbprev-grid');
      Object.assign(clone.style, {width: `${width}px`, height: `${viewport.clientHeight}px`, transform: `scale(${scale}) translateY(-6.9px)`});
      thumb.append(clone);
    });
    const anchor = viewport.querySelector(ui.gbPreviewAnchor === 'next' ? '.gbl-arrow-right' : ui.gbPreviewAnchor === 'apps' ? '.gbl-allapps' : '.gbl-arrow-left');
    const screenRect = screen.getBoundingClientRect(), ratio = screen.clientWidth / screenRect.width, rect = anchor?.getBoundingClientRect();
    const left = rect ? Math.max(0, Math.min(width - popup.offsetWidth, (rect.left - screenRect.left) * ratio)) : 0;
    popup.style.left = `${left}px`;
  }
  let openFolderId = '';
  function renderOverlay() { renderOverlayBase(); gingerbreadMenu(); }
  function renderOverlayBase() {
    const closingFolder = overlayRoot.querySelector('.launcher-folder');
    if (ui.overlay === 'gb-previews') {
      overlayRoot.innerHTML = `<div class="gbprev-scrim" data-action="close-overlay"></div><div class="gbprev" role="listbox" aria-label="${safe(i18n.t('Home screen'))}">${data.homePages.map((_, index) => `<button class="gbprev-item${index === ui.page ? ' current' : ''}" role="option" aria-selected="${index === ui.page}" data-action="gb-preview-go" data-id="${index}" aria-label="${safe(i18n.t('Home screen'))} ${index + 1}"><span class="gbprev-thumb"></span></button>`).join('')}</div>`;
      fillPreviews();
    } else if (ui.overlay === 'gb-menu-home') {
      ui.gbMenuItems = launcherMenu();
      overlayRoot.innerHTML = GBUI.menu(ui.gbMenuItems, key => i18n.t(key));
    } else if (ui.overlay === 'gb-menu-settings') {
      overlayRoot.innerHTML = GBUI.menu(ui.gbMenuItems || [], key => i18n.t(key));
    } else if (ui.overlay === 'gb-menu-more') {
      overlayRoot.innerHTML = GBUI.expanded(ui.gbMenuItems || [], key => i18n.t(key));
    } else if (ui.overlay.startsWith('gb-dialog')) {
      overlayRoot.innerHTML = GBUI.dialog({...gbDialogSpec(), t: key => i18n.t(key)});
    } else if (ui.overlay === 'shade') {
      const time = n => n.id > 1e12 ? new Date(n.id).toLocaleTimeString(i18n.locale(), {hour: 'numeric', minute: '2-digit', hour12: !data.settings.hour24}) : '';
      const ongoing = ui.activeCall ? [{id: 'call', action: 'gbp-return-call', icon: ui.activeCall.hold ? 'gb-stat_sys_phone_call_on_hold.png' : ui.activeCall.bluetooth ? 'gb-stat_sys_phone_call_bluetooth.png' : 'gb-stat_sys_phone_call.png', title: ui.activeCall.hold ? GBPhone.phoneText(i18n.language, 'notification_on_hold') : GBPhone.phoneText(i18n.language, 'notification_ongoing_call_format').replace('%s', GBPhone.elapsedText(ui.activeCall)), text: contactByPhone(ui.activeCall.number)?.name || ui.activeCall.number}] : [];
      const latest = data.notifications.map(n => ({id: n.id, icon: noteIcon(n), title: n.title, text: n.detail, time: time(n)}));
      const open = overlayRoot.querySelector('.gbsh');
      overlayRoot.innerHTML = GBStatusBar.shade({t: key => i18n.t(key), carrier: carrierName(), ongoing, latest, clearable: latest.length > 0});
      const panel = overlayRoot.querySelector('.gbsh-panel');
      if (open || shadeTracking) GBStatusBar.place(panel, shadeTracking ? shadeTracking.y : screen.clientHeight, shadeBottom());
      else shadeFling(statusRoot.offsetHeight, 2000 * GBStatusBar.PX, true);
      renderStatus();
    } else if (ui.overlay.startsWith('widget-photo')) {
      overlayRoot.innerHTML = ICSWidgets.photoOverlay(data, ui, key => i18n.t(key));
    } else if(ui.overlay==='sx-dialog'){
      overlayRoot.innerHTML=ICSSystemSettings.overlay(data,ui,key=>i18n.t(key));
    } else if (ui.overlay === 'recent') {
      overlayRoot.innerHTML = `<div class="recent-panel" data-action="close-overlay">${ui.recent.length ? `<div class="recent-list">${[...ui.recent].reverse().map(id => `<div class="recent-item" data-action="open-app" data-app="${id}" role="button" tabindex="0" aria-label="${appNames[id]}"><span class="recent-label">${appNames[id]}</span><span class="recent-thumbnail" aria-hidden="true"><span class="recent-thumbnail-inner" inert>${ui.recentSnapshots[id] || `<div class="recent-fallback">${appIcon(id)}</div>`}</span></span><span class="recent-app-icon" aria-hidden="true">${appIcon(id)}</span></div>`).join('')}</div>` : '<p class="recent-empty">No recent apps</p>'}</div>`;
    } else if (ui.overlay.startsWith('gallery-') || ui.overlay.startsWith('camera-')) {
      overlayRoot.innerHTML=ICSMedia.overlay(data,ui,key=>i18n.t(key),i18n.locale());
    } else if (ui.overlay.startsWith('clock-')) {
      overlayRoot.innerHTML = ICSDeskClock.overlay(ui,key=>i18n.t(key));
    } else if (ui.overlay.startsWith('calendar-')) {
      overlayRoot.innerHTML = ICSCalendar.overlay(ui,key=>i18n.t(key));
    } else if (ui.overlay.startsWith('music-')) {
      overlayRoot.innerHTML = ICSMusic.overlay(ui.music,ui,key=>i18n.t(key));
    } else if (ui.overlay.startsWith('email-')) {
      overlayRoot.innerHTML = ICSEmail.overlay(data.mailbox,ui,data.photos,key=>i18n.t(key));
    } else if (ui.overlay.startsWith('sd-')) {
      overlayRoot.innerHTML = ICSSettingsDetail.overlay(data,ui,key=>i18n.t(key));
    } else if (ui.overlay.startsWith('people-')) {
      overlayRoot.innerHTML = peopleOverlay();
    } else if (ui.overlay === 'browser-menu') {
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu web-menu"><button data-action="browser-forward" ${ui.browserIndex >= ui.browserHistory.length-1?'disabled':''}>Forward</button><button data-action="browser-refresh">Refresh</button><button data-action="browser-new-tab">New tab</button><button data-action="browser-save">Bookmark</button><button data-action="browser-bookmarks">Bookmarks</button><button data-action="browser-saved">Saved pages</button><button data-action="browser-save-page">Save for offline reading</button><button data-action="browser-find">Find on page</button></div>`;
    } else if (ui.overlay.startsWith('mms-')) {
      overlayRoot.innerHTML = renderMessageOverlay();
    } else if (ui.overlay === 'play-menu') {
      overlayRoot.innerHTML = '<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu"><button data-action="play-my-apps">My apps</button><button data-action="market">Shop</button></div>';
    } else if (ui.overlay === 'calc-menu') {
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu"><button data-action="calc-clear">Clear history</button><button data-action="calc-panel" data-id="${ui.calcPanel ? 0 : 1}">${ui.calcPanel ? 'Basic panel' : 'Advanced panel'}</button></div>`;
    } else if (ui.overlay === 'phone-menu') {
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu phone-overflow"><button data-action="phone-add-contact">Add to contacts</button></div>`;
    } else if (ui.overlay === 'connectivity-menu') {
      const wifi = ui.connectivityMenu === 'wifi';
      const enabled = data.settings[wifi ? 'wifi' : 'bluetooth'];
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu">${wifi ? `<button data-action="wifi-scan" ${enabled ? '' : 'disabled'}>Scan</button><button data-action="wifi-add" ${enabled ? '' : 'disabled'}>Add network</button><button data-action="settings-sub" data-id="wifi-advanced">Advanced</button>` : `<button data-action="bluetooth-scan" ${enabled ? '' : 'disabled'}>Scan</button><button data-action="bluetooth-rename" ${enabled ? '' : 'disabled'}>Rename phone</button><button data-action="bluetooth-files">Show received files</button>`}</div>`;
    } else if (ui.overlay === 'wifi-add') {
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog" data-form="wifi-add" role="dialog" aria-label="Add network"><h3>Add network</h3><label>Network SSID<input name="ssid" required maxlength="32" autocomplete="off"></label><label>Security<select name="security"><option value="Open" data-i18n="None">None</option><option value="WPA2">WPA/WPA2 PSK</option></select></label><label>Password<input name="password" type="password" autocomplete="off"></label><div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">Save</button></div></form>`;
    } else if (ui.overlay === 'bluetooth-pair') {
      const paired = data.settings.pairedDevice === ui.bluetoothTarget;
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="Bluetooth pairing request"><h3>${safe(ui.bluetoothTarget)}</h3>${paired ? '<p>Paired</p>' : '<p>Bluetooth pairing request</p><p>Passkey: 123456</p>'}<div class="settings-dialog-actions"><button data-action="close-overlay">Cancel</button><button data-action="bluetooth-confirm">${paired ? 'Unpair' : 'Pair'}</button></div></div>`;
    } else if (ui.overlay === 'bluetooth-rename') {
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog" data-form="bluetooth-rename" role="dialog" aria-label="Rename phone"><h3>Rename phone</h3><input name="name" aria-label="Device name" maxlength="40" required value="${safe(data.settings.bluetoothName || 'Galaxy Nexus')}"><div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">Rename</button></div></form>`;
    } else if (ui.overlay === 'bluetooth-files') {
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="Received files"><h3>Received files</h3><p>No received files</p><div class="settings-dialog-actions"><button data-action="close-overlay">OK</button></div></div>`;
    } else if (ui.overlay === 'wifi-dialog') {
      const network = allWifiNetworks().find(item => item.name === ui.wifiTarget);
      const connected = data.settings.wifiNetwork === ui.wifiTarget;
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(ui.wifiTarget)}"><h3>${safe(ui.wifiTarget)}</h3><p>${safe(network?.security || 'WPA2')}</p>${connected ? '<p>Connected</p>' : network?.security !== 'Open' ? '<label>Password<input class="wifi-password" type="password" autocomplete="off"></label>' : ''}<div class="settings-dialog-actions"><button data-action="close-overlay">Cancel</button>${connected ? '<button data-action="wifi-forget">Forget</button>' : '<button data-action="wifi-connect">Connect</button>'}</div></div>`;
    } else if (ui.overlay === 'wallpaper-source') {
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="wallpaper-source" role="dialog" aria-label="Select wallpaper from"><h3>Select wallpaper from</h3>${[['gallery-wallpaper', 'Gallery'], ['open-live-wallpapers', 'Live Wallpapers'], ['open-wallpapers', 'Wallpapers']].sort((a, b) => new Intl.Collator(i18n.locale()).compare(i18n.t(a[1]), i18n.t(b[1]))).map(([action, label]) => `<button data-action="${action}" data-no-translate>${safe(i18n.t(label))}</button>`).join('')}</div>`;
    } else if (ui.overlay === 'lw-palette') {
      const current = data.lwPrefs?.polar?.palette || '';
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(i18n.t('Color palette'))}"><h3>${safe(i18n.t('Color palette'))}</h3>${LiveWallpapers.PALETTE_ORDER.map(id => `<button class="settings-row wireless-row" data-action="lw-palette-pick" data-id="${id}" role="radio" aria-checked="${current === id}"><span class="row-copy">${safe(i18n.t(LiveWallpapers.PALETTE_NAMES[id]))}</span><img class="holo-radio" src="assets/btn_radio_${current === id ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join('')}<div class="settings-dialog-actions"><button data-action="close-overlay">${safe(i18n.t('Cancel'))}</button></div></div>`;
    } else if (ui.overlay === 'power-menu') {
      // GlobalActions (2.3.6): "Phone options" over a bright list - Silent mode and Airplane mode toggles with their status
      // line (global_actions_item.xml), then Power off.
      const t = key => i18n.t(key), silent = !!data.settings.silent, vibrate = data.settings.silentMode === 'vibrate';
      overlayRoot.innerHTML = GBUI.dialog({t, title: t('Phone options'), items: [
        {action: 'gb-ga-silent', title: t('Silent mode'), summary: t(silent ? 'Sound is OFF' : 'Sound is ON'), icon: silent ? (vibrate ? 'ic_lock_silent_mode_vibrate' : 'ic_lock_silent_mode') : 'ic_lock_silent_mode_off'},
        {action: 'ga-airplane', title: t('Airplane mode'), summary: t(data.settings.airplane ? 'Airplane mode is ON' : 'Airplane mode is OFF'), icon: data.settings.airplane ? 'ic_lock_airplane_mode' : 'ic_lock_airplane_mode_off'},
        {action: 'ga-power', title: t('Power off'), icon: 'ic_lock_power_off'}]});
    } else if (ui.overlay === 'power-confirm') {
      // ShutdownThread.shutdown(confirm): ic_dialog_alert, "Power off", shutdown_confirm, OK / Cancel.
      overlayRoot.innerHTML = GBUI.dialog({t: key => i18n.t(key), title: i18n.t('Power off'), icon: 'ic_dialog_alert', message: i18n.t('Your phone will shut down.'), buttons: [{action: 'ga-confirm', id: 'shutdown', title: i18n.t('OK')}, {action: 'close-overlay', title: i18n.t('Cancel')}]});
    } else if (ui.overlay === 'power-progress') {
      // ProgressDialog: spinner_white_48 (12 frames, 100 ms) beside "Shutting down…"; not cancelable.
      overlayRoot.innerHTML = GBUI.dialog({t: key => i18n.t(key), title: i18n.t('Power off'), custom: `<div class="gbdlg-progress"><img src="assets/gb-spinner_white_48.png" alt=""><span>${safe(i18n.t('Shutting down…'))}</span></div>`, cancel: 'noop'});
    } else if (ui.overlay === 'folder') {
      overlayRoot.innerHTML = renderFolder();
      positionFolder();
      syncFolderIcons();
    } else overlayRoot.innerHTML = '';
    i18n.translateDOM(overlayRoot);
    // Folder.animateOpen/animateClosed run only when the folder actually opens or closes, not on content updates.
    const folderPanel = ui.overlay === 'folder' ? overlayRoot.querySelector('.launcher-folder') : null;
    if (folderPanel && openFolderId !== ui.folderId) {
      ui.folderSettled = '';
      const animations = ICSTransitions.play(folderPanel, ICSTransitions.specs['folder-open'].enter);
      animations.forEach(animation => animation.finished.then(() => animation.cancel(), () => {}));
      const folderId = ui.folderId;
      Promise.all(animations.map(animation => animation.finished)).catch(() => {}).then(() => { if (ui.overlay === 'folder' && ui.folderId === folderId) { ui.folderSettled = folderId; syncClings(); } });
    }
    if (!folderPanel && openFolderId && clingLayerRoot().querySelector('[data-cling="folder"]') && data.clings) { data.clings.folder = true; save(); }
    else if (!folderPanel && closingFolder && openFolderId) {
      closingFolder.inert = true; closingFolder.classList.add('launcher-folder-closing'); overlayRoot.append(closingFolder);
      const animations = ICSTransitions.play(closingFolder, ICSTransitions.specs['folder-close'].exit);
      Promise.all(animations.map(animation => animation.finished)).catch(() => {}).then(() => closingFolder.remove());
      if (!animations.length) closingFolder.remove();
    }
    if (!folderPanel && openFolderId) syncFolderIcons();
    openFolderId = folderPanel ? ui.folderId : '';
    if (!folderPanel) ui.folderSettled = '';
    syncClings();
  }
  // Created on first use: the first render runs before this point of the script.
  function clingLayerRoot() { let node = screen.querySelector('#cling-layer'); if (!node) { node = document.createElement('div'); node.id = 'cling-layer'; screen.append(node); } return node; }
  function clingTarget(kind) {
    const base = clingLayerRoot().getBoundingClientRect(), centre = node => { if (!node) return null; const r = node.getBoundingClientRect(); return [r.left + r.width / 2 - base.left, r.top + r.height / 2 - base.top]; };
    // Workspace: the all apps button, centred in the hotseat. All apps: the cell at clingFocusedX/Y = (1, 1).
    if (kind === 'workspace') return {circle: centre(viewport.querySelector('.dock [data-action="drawer"]'))};
    if (kind === 'allApps') return {circle: centre(viewport.querySelectorAll('.drawer-apps > *')[5])};
    const folder = overlayRoot.querySelector('.launcher-folder')?.getBoundingClientRect();
    return folder ? {rect: {left: folder.left - base.left, top: folder.top - base.top, right: folder.right - base.left, bottom: folder.bottom - base.top}} : {};
  }
  function placeCling(root, kind) {
    const target = clingTarget(kind), point = target.circle;
    LauncherClings.cut(root, target);
    root.querySelectorAll('.cling-punch,.cling-hand').forEach(node => { node.hidden = !point; });
    if (!point) return;
    const punch = root.querySelector('.cling-punch'), hand = root.querySelector('.cling-hand');
    if (punch) { punch.style.left = `${point[0]}px`; punch.style.top = `${point[1]}px`; }
    if (hand) { hand.style.left = `${point[0] + LauncherClings.HAND_OFFSET}px`; hand.style.top = `${point[1] + LauncherClings.HAND_OFFSET}px`; }
  }
  function syncClings() {
    let kind = ui.power || ui.locked || ui.sleeping ? '' : LauncherClings.wanted(ui, data.clings);
    if (kind === 'folder' && ui.folderSettled !== ui.folderId) kind = '';
    const current = clingLayerRoot().querySelector('.cling:not([style*="pointer-events: none"])');
    if (current?.dataset.cling === kind) { placeCling(current, kind); return; }
    current?.remove();
    if (!kind) return;
    clingLayerRoot().insertAdjacentHTML('beforeend', LauncherClings.markup(kind, key => i18n.t(key), [0, 0]));
    const root = clingLayerRoot().lastElementChild;
    placeCling(root, kind);
    // initCling: all apps and folder clings fade in; the workspace one is there at once.
    if (kind !== 'workspace') LauncherClings.show(root);
    // Positions are read again once a launcher transition has settled.
    setTimeout(() => { if (root.isConnected) placeCling(root, kind); }, 450);
  }
  window.addEventListener('resize', () => syncClings());

  /* UserFolder (user_folder.xml): Launcher.openFolder adds it over the whole CellLayout - a box_launcher_top title button
     (14 sp bold #404040; touch closes, touch & hold renames) above box_launcher_bottom with a 4-column grid of
     application_boxed items. Live folders list their contacts (live_folder_list). */
  function syncFolderIcons() {
    viewport.querySelectorAll('[data-folder-id]').forEach(button => { const icon = button.querySelector('.app-icon'); if (icon) icon.outerHTML = appIcon(button.dataset.folderId); });
  }
  function renderFolder() {
    const folder=ICSLauncherFolders.folder(data,ui.folderId);if(!folder){ui.overlay='';return '';}
    const people=folder.live?data.contacts.filter(person=>folder.live==='all'||folder.live==='phone'&&person.phone||folder.live==='starred'&&person.favorite).sort((a,b)=>a.name.localeCompare(b.name,i18n.locale())):null;
    const grid=people?`<div class="gbfolder-live">${people.map(person=>`<button class="gbfolder-person" data-action="gb-live-contact" data-id="${person.id}"><span class="avatar">${safe(person.name[0])}</span><span>${safe(person.name)}</span></button>`).join('')||`<p class="gbfolder-empty">${safe(i18n.t('No contacts.'))}</p>`}</div>`
      :`<div class="launcher-folder-grid gbfolder-grid">${Array.from({length:folder.items.length+1},(_,slot)=>`<div class="launcher-folder-cell" data-folder-slot="${slot}">${folder.items[slot]?launcherIcon(folder.items[slot]):''}</div>`).join('')}</div>`;
    return `<div class="launcher-folder gbfolder${folder.live?' gbfolder-livebox':''}" role="dialog" aria-label="${safe(i18n.t('Folder'))}: ${safe(folderName(ui.folderId))}"><button class="gbfolder-title" data-action="close-overlay" data-gb-folder-title>${safe(folderName(ui.folderId))}</button><div class="gbfolder-body">${grid}</div></div>`;
  }
  function positionFolder() {
    const panel=overlayRoot.querySelector('.launcher-folder');if(!panel||panel.classList.contains('gbfolder'))return;
    const icon=[...viewport.querySelectorAll('[data-folder-id]')].find(button=>button.dataset.folderId===ui.folderId&&!button.closest('[inert]'));
    const screenRect=screen.getBoundingClientRect(),rect=icon?.getBoundingClientRect();
    const scale=screenRect.width/screen.clientWidth;
    const x=rect?(rect.left+rect.width/2-screenRect.left)/scale:screen.clientWidth/2;
    const y=rect?(rect.top+rect.height/2-screenRect.top)/scale:screen.clientHeight/2;
    const left=Math.max(8,Math.min(screen.clientWidth-panel.offsetWidth-8,x-panel.offsetWidth/2));
    const top=Math.max(30,Math.min(screen.clientHeight-55-panel.offsetHeight,y-panel.offsetHeight/2));
    panel.style.left=left+'px';panel.style.top=top+'px';panel.style.setProperty('--folder-origin',`${x-left}px ${y-top}px`);
  }
  window.addEventListener('resize',()=>{if(ui.overlay==='folder')positionFolder();});

  const allWifiNetworks = () => [...wifiNetworks, ...(data.savedWifiNetworks || [])];
  const connectivityMenu = kind => `<button class="connectivity-overflow" data-action="connectivity-menu" data-id="${kind}" aria-label="More options"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button>`;
  function renderWifiSettings() {
    return appView('Wi-Fi', `<div class="connectivity-page">${data.settings.wifi ? allWifiNetworks().sort((a,b) => Number(b.name === data.settings.wifiNetwork) - Number(a.name === data.settings.wifiNetwork) || b.strength - a.strength || a.name.localeCompare(b.name, i18n.locale())).map(network => `<button class="settings-row network-row" data-action="wifi-network" data-id="${safe(network.name)}"><span class="row-copy">${safe(network.name)}<small>${data.settings.wifiNetwork === network.name ? i18n.t('Connected') : network.security === 'Open' ? i18n.t('Open network') : i18n.t('Secured with WPA2')}</small></span><span class="network-signal"><img src="assets/${network.security === 'Open' ? `ic_wifi_signal_${network.strength >= 3 ? 3 : 2}` : 'ic_wifi_lock_signal_4'}.png" alt=""></span></button>`).join('') : '<p class="connectivity-empty">Turn on Wi-Fi to see available networks</p>'}</div>`, '', connectivitySwitch('wifi', 'Wi-Fi', true) + connectivityMenu('wifi'));
  }
  function renderBluetoothSettings() {
    const deviceRow = (name, paired) => `<button class="settings-row network-row" data-action="bluetooth-pair" data-id="${safe(name)}"><span class="network-signal"><img src="assets/${name === 'Car Audio' ? 'ic_bt_headphones_a2dp' : 'ic_bt_headset_hfp'}.png" alt=""></span><span class="row-copy">${safe(name)}${paired ? '<small>Paired</small>' : ''}</span>${paired ? '<img class="bt-config-icon" src="assets/ic_bt_config.png" alt="">' : ''}</button>`;
    return appView('Bluetooth', `<div class="connectivity-page">${data.settings.bluetooth ? `<button class="settings-row network-row" data-action="toggle-setting" data-id="bluetoothVisible"><span class="network-signal"><img src="assets/ic_bt_cellphone.png" alt=""></span><span class="row-copy">${safe(data.settings.bluetoothName || 'Galaxy Nexus')}<small>${data.settings.bluetoothVisible ? i18n.t('Visible to nearby Bluetooth devices') : i18n.t('Not visible to other Bluetooth devices')}</small></span></button>${data.settings.pairedDevice ? `${label('PAIRED DEVICES')}${deviceRow(data.settings.pairedDevice, true)}` : ''}${label('AVAILABLE DEVICES')}${ui.bluetoothScanned ? ['Wireless Headset','Car Audio'].filter(name => name !== data.settings.pairedDevice).map(name => deviceRow(name, false)).join('') : '<p class="connectivity-empty small">Tap Scan to find nearby devices</p>'}` : '<p class="connectivity-empty">Turn on Bluetooth to see nearby devices</p>'}</div>`, '', connectivitySwitch('bluetooth', 'Bluetooth', true) + connectivityMenu('bluetooth'));
  }

  function gbSettingsContext() {
    const now = deviceDate(), lang = i18n.language;
    const formats = [now.toLocaleDateString(i18n.locale()), `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}`, `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`, `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`];
    const up = Math.floor(performance.now() / 1000) + 9240;
    return {settings: data.settings, lang, t: key => i18n.t(key), carrier: carrierName(), date: formats[GBSettings.value(data.settings, 'dateFormat')] || formats[0], time: gbClock() + (data.settings.hour24 ? '' : now.getHours() < 12 ? ' AM' : ' PM'), zone: 'GMT+01:00', dateFormats: [GBSettings.text(lang, 'Normal') === 'Normal' ? `${i18n.t('Normal')} (${formats[0]})` : formats[0], ...formats.slice(1)],
      languageName: {en: 'English', hu: 'Magyar', de: 'Deutsch', fr: 'Français', es: 'Español'}[lang] || 'English',
      // WifiSettings sorts the connected network first, then by signal; the paired device and the last scan's results.
      networks: allWifiNetworks().slice().sort((a, b) => Number(b.name === data.settings.wifiNetwork) - Number(a.name === data.settings.wifiNetwork) || b.strength - a.strength || a.name.localeCompare(b.name)),
      btDevices: [...(data.settings.pairedDevice ? [{name: data.settings.pairedDevice, paired: true, connected: true, kind: 'headset_hfp'}] : []), ...(ui.btFound || []).filter(device => device.name !== data.settings.pairedDevice)],
      uptime: `${Math.floor(up / 3600)}:${String(Math.floor(up / 60) % 60).padStart(2, '0')}:${String(up % 60).padStart(2, '0')}`,
      about: {model: 'Nexus S', version: '2.3.6', baseband: 'I9020XXKD1', kernel: '2.6.35.7-gf5f63ef\nandroid-build@apa28 #1\nTue Aug 2 13:57:05 PDT 2011', build: 'GRK39F'}};
  }
  function renderSettings() {
    const s = ui.sub;
    if(s==='lock-setup')return lockControls.renderSetup();
    if (!s) ui.gbSettingsStack = [];
    if (GBSettings.has(s || 'main')) return GBSettings.render(s || 'main', gbSettingsContext()).html;
    const system=ICSSystemSettings.render(data,ui,key=>i18n.t(key),i18n.locale());
    if(system)return appView(system.title,system.body,'sx-page',system.right);
    const detail=ICSSettingsDetail.render(data,ui,apps,key=>i18n.t(key));
    if(detail)return appView(detail.title,detail.body,'sd-page');
    if (s === 'wifi') return renderWifiSettings();
    if (s === 'bluetooth') return renderBluetoothSettings();
    if (s === 'wallpaper') {
      return appView('Wallpaper', wallpaperChoices());
    }
    if (s === 'about') return appView('About phone', `${row('Status', 'Phone number, signal, etc.', 'settings-sub', 'about-status')}${row('Legal information', '', 'settings-sub', 'about-legal')}${row('Model number', 'Nexus S', 'noop', '')}${row('Android version', '2.3.6', 'about-tap', '')}${row('Baseband version', 'I9020XXKD1', 'noop', '')}${row('Kernel version', '2.6.35.7-gf5f63ef\nandroid-build@apa28 #1\nTue Aug 2 13:57:05 PDT 2011', 'noop', '')}${row('Build number', 'GRK39F', 'noop', '')}`, 'about-settings');
    if (s === 'about-status') return appView('Status', `${row('Battery status', 'Discharging', 'noop', '')}${row('Battery level', '78%', 'noop', '')}${row('Network', carrierName(), 'noop', '')}${row('Signal strength', data.settings.airplane ? '0 dBm  99 asu' : '-75 dBm  19 asu', 'noop', '')}${row('Phone number', 'Unknown', 'noop', '')}${row('Wi-Fi MAC address', '02:00:00:40:04:01', 'noop', '')}${row('Bluetooth address', data.settings.bluetooth ? '02:00:00:40:04:02' : 'Unavailable', 'noop', '')}`, 'about-settings');
    if (s === 'about-legal') return appView('Legal information', `${row('Open source licenses', 'Android Open Source Project', 'noop', '')}${row('Google legal', 'Offline demonstration', 'noop', '')}`, 'about-settings');
    if (s === 'about-safety') return appView('Safety information', `<div class="detail-pad"><p>Nexus S safety information is not available in this offline simulation.</p></div>`, 'about-settings');
    if (s === 'easter') return `<div class="easter-view">${ui.easterNyan ? `<div class="nyan-sky" data-action="back" data-nyandroid role="button" tabindex="0" aria-label="Close Nyandroid"></div>` : '<button class="easter-robot" data-action="egg-nyan" aria-label="Android easter egg"><img src="assets/platlogo.png" alt="Ice Cream Sandwich Android"></button>'}</div>`;
    if (s === 'wireless') return appView('Wireless & networks', `${wirelessCheckRow('Airplane mode', '', 'airplane')}${wirelessRow('VPN', '', 'vpn')}${wirelessRow('Tethering & portable hotspot', '', 'tethering')}${wirelessCheckRow('NFC', 'Allow data exchange when the phone touches another device', 'nfc')}${wirelessRow('Android Beam', 'Ready to transmit app content via NFC', 'beam')}${wirelessCheckRow('WiFi direct', '', 'wifiDirect')}${wirelessRow('Mobile networks', '', 'mobile-networks')}`, 'wireless-more');
    if (s === 'beam') return appView('Android Beam', `${wirelessCheckRow('Android Beam', 'Ready to transmit app content via NFC', 'androidBeam')}`, 'wireless-more');
    if (s === 'brightness') return appView('Brightness', `<div class="detail-pad"><h3>Brightness</h3><input type="range" min="10" max="100" value="${data.settings.brightness}" data-field="brightness" aria-label="Brightness"><p>${data.settings.brightness}%</p></div>`);
    if (s === 'sync') return appView('Accounts & sync', `${toggleRow('Auto-sync', 'Sync app data automatically', 'autoSync', '↻')}${label('ACCOUNTS')}${row('Google', 'demo@android.local', 'settings-sub', 'sync-google', '◎')}${row('Add account', '', 'toast', 'Demo account already added', '+')}`);
    if (s === 'sync-google') return appView('Google', `<div class="detail-pad"><h3>demo@android.local</h3><p>Sample account data is stored only in this browser.</p></div>${row('Sync Gmail', 'Last synced today', 'noop', '', '✉')}${row('Sync Calendar', 'Last synced today', 'noop', '', '▦')}${row('Sync Contacts', 'Last synced today', 'noop', '', '◉')}`);
    if (s === 'location') return appView('Location services', `${toggleRow("Google's location service", 'Let apps use approximate location', 'networkLocation', '◎')}${toggleRow('GPS satellites', 'Let apps use precise location', 'gps', '◉')}`);
    if (s === 'backup') return appView('Backup & reset', `${label('BACKUP & RESTORE')}${toggleRow('Back up my data', 'Back up app data and settings', 'backup', '↻')}${toggleRow('Automatic restore', 'Restore settings when reinstalling apps', 'autoRestore', '↻')}${label('PERSONAL DATA')}${row('Factory data reset', 'Erase local simulator data', 'settings-sub', 'reset-info', '⚠')}`);
    if (s === 'reset-info') return appView('Factory data reset', `<div class="detail-pad"><h3>Erase local simulator data</h3><p>This clears the saved home screens, settings, and sample content for this version.</p><button class="small-button" data-action="factory-reset">Reset simulator</button></div>`);
    if (s === 'accessibility') return appView('Accessibility', `${label('SERVICES')}${row('No services installed', '', 'noop', '', '')}${label('SYSTEM')}${toggleRow('Large text', 'Use larger text in Settings', 'largeText', 'A')}${toggleRow('Auto-rotate screen', '', 'rotate', '↻')}${toggleRow('Speak passwords', 'Speak password characters as you type', 'speakPasswords', '◉')}`);
    if (s === 'development') return appView('Developer options', `${toggleRow('USB debugging', 'Debug mode when USB is connected', 'usbDebug', '⚙')}${toggleRow('Stay awake', 'Screen will never sleep while charging', 'stayAwake', '◷')}${toggleRow('Allow mock locations', 'Permit mock locations', 'mockLocations', '◎')}${label('USER INTERFACE')}${toggleRow('Show touches', 'Show visual feedback for touches', 'showTouches', '◉')}${[['windowScale','Window animation scale'],['transitionScale','Transition animation scale']].map(([key, title]) => `<button class="settings-row" data-action="sd-dialog" data-id="${key}"><span class="row-copy">${safe(i18n.t(title))}<small>${safe(i18n.t(ICSSettingsDetail.animationScaleLabel(data.settings[key])))}</small></span></button>`).join('')}`);
    if (s === 'language') return appView('Language & input', `<div class="detail-pad"><h3>Language</h3><div class="language-options">${[['en','English'],['hu','Magyar'],['de','Deutsch'],['fr','Français'],['es','Español']].map(([code,name]) => `<button class="language-choice ${i18n.language === code ? 'selected' : ''}" data-action="set-language" data-id="${code}" aria-pressed="${i18n.language === code}">${name}<span>${i18n.language === code ? '✓' : ''}</span></button>`).join('')}</div></div>${row('Keyboard', 'Android keyboard', 'noop', '', '▦')}`);
    if (s === 'volumes' || s === 'ringtone' || s === 'sleep') return appView(s === 'volumes' ? 'Volumes' : s === 'ringtone' ? 'Phone ringtone' : 'Sleep', `<div class="detail-pad"><p>${s === 'ringtone' ? 'Orion is selected.' : s === 'sleep' ? 'Screen turns off after 30 seconds.' : 'Ringtone 70% · Media 60% · Alarm 80%'}</p></div>`);
    return appView('Settings', `${label('WIRELESS & NETWORKS')}${connectivityRow('Wi-Fi', 'wifi')}${connectivityRow('Bluetooth', 'bluetooth')}${row('Data usage', '', 'settings-sub', 'data', '◕')}${row('More...', '', 'settings-sub', 'wireless', null)}${label('DEVICE')}${row('Sound', '', 'settings-sub', 'sound', '♫')}${row('Display', '', 'settings-sub', 'display', '☼')}${row('Storage', '', 'settings-sub', 'storage', '▤')}${row('Battery', '', 'settings-sub', 'battery', '◧')}${row('Apps', '', 'settings-sub', 'apps', '▦')}${label('PERSONAL')}${row('Accounts & sync', '', 'settings-sub', 'sync', '↻')}${row('Location services', '', 'settings-sub', 'location', '◎')}${row('Security', '', 'settings-sub', 'security', '◉')}${row('Language & input', '', 'settings-sub', 'language', '◎')}${row('Backup & reset', '', 'settings-sub', 'backup', '↻')}${label('SYSTEM')}${row('Date & time', '', 'settings-sub', 'date', '◷')}${row('Accessibility', '', 'settings-sub', 'accessibility', '◉')}${data.settings.developerUnlocked ? row('Developer options', '', 'settings-sub', 'development', '⚙') : ''}${row('About phone', '', 'settings-sub', 'about', '◉')}`);
  }

  function normalizeAddress(raw) {
    const value = raw.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
    if (!value) return 'www.google.com';
    if (value.startsWith('search:')) return value;
    if (value.includes(' ') || !value.includes('.')) return `search:${value}`;
    return value.toLowerCase();
  }
  function syncBrowserState() {
    const tab = ICSBrowserSession.current(ui.browserSession);
    ui.browserUrl = ICSBrowserSession.url(ui.browserSession);
    ui.browserHistory = tab.history; ui.browserIndex = tab.index;
    ui.browserTab = ui.browserSession.active;
    ui.browserTabs = ui.browserSession.tabs.map(tab => tab.history[tab.index]);
  }
  function saveBrowserState() { syncBrowserState(); data.browserSession = clone(ui.browserSession); save(); }
  function navigateBrowser(url) {
    const normalized = normalizeAddress(url);
    ICSBrowserSession.navigate(ui.browserSession,normalized);
    data.browserHistory = [...data.browserHistory,normalized].slice(-50);
    ui.sub = ''; ui.overlay = ''; ui.browserFind = undefined; saveBrowserState(); render();
  }
  function browserBack() { ICSBrowserSession.move(ui.browserSession,-1); saveBrowserState(); render(); }
  function browserForward() { ICSBrowserSession.move(ui.browserSession,1); ui.overlay = ''; saveBrowserState(); render(); }
  function browserLink(url, title, subtitle = '') { return `<div class="web-result"><a href="#" data-action="browser-link" data-url="${safe(url)}"><strong>${safe(title)}</strong></a><small>${safe(url)}</small><p>${safe(subtitle)}</p></div>`; }
  function renderWebsite(url) {
    if (url === 'www.google.com') return `<div class="google-logo"><span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span></div><form class="search-form" data-form="web-search"><input name="query" aria-label="Search the web" placeholder="Search the web" required><button type="submit">Search</button></form><div class="browser-tiles">${[['www.android.com','Android'],['en.wikipedia.org/wiki/Android','Wikipedia'],['news.example','News'],['retro.example','2012 Web']].map(item => `<button data-action="browser-link" data-url="${item[0]}">${item[1]}</button>`).join('')}</div><p style="font-size:11px;color:#888;margin-top:24px">Offline demo pages · 2012</p>`;
    if (url.startsWith('search:')) {
      const term = url.slice(7);
      return `<h2>Search results</h2><p>Results for <strong>${safe(term)}</strong></p>${browserLink('www.android.com', 'Android – Discover the new Android 4.0', 'Ice Cream Sandwich brings a refined design and powerful new features.')}${browserLink('en.wikipedia.org/wiki/Android', 'Android (operating system) – Wikipedia', 'An overview of the Android mobile operating system.')}${browserLink('news.example', 'Tech News', `Stories related to ${term}.`)}`;
    }
    if (url.includes('android.com')) return `<h2 style="color:#79b93f">android</h2><h3>Meet Android 4.0</h3><p>A new, refined Android for phones and tablets. Share more, browse faster and personalize your home screen.</p><div style="background:#23343c;color:white;padding:25px;text-align:center;font-size:38px">🤖<br><small style="font-size:17px">Ice Cream Sandwich</small></div>${browserLink('en.wikipedia.org/wiki/Android','Learn about Android','The story of Android.')}`;
    if (url.includes('wikipedia.org')) return `<h2>Android (operating system)</h2><p><small>From Wikipedia, the free encyclopedia</small></p><hr><p>Android is a mobile operating system based on a modified version of the Linux kernel. Android 4.0, known as Ice Cream Sandwich, introduced the Holo interface and virtual navigation buttons.</p><h3>Versions</h3><p>Gingerbread · Ice Cream Sandwich · Jelly Bean · KitKat</p>${browserLink('www.android.com','Official Android website')}`;
    if (url === 'news.example/galaxy-nexus' || url === 'retro.example/holo') return `<article class="web-offline-article"><h2>${url.startsWith('news')?'A day with Galaxy Nexus':'A closer look at Holo'}</h2><time>June 15, 2012 · Demo archive</time><p>The phone has a large screen, three navigation buttons and a blue-accented interface. Open the app drawer to discover the classic Android experience.</p><h3>Everyday essentials</h3><p>Contacts, messages and the browser share a simple visual language. Swipe between home screens, arrange your favorite apps, and pull down the notification shade.</p><h3>Make it yours</h3><p>Choose a wallpaper, add an analog clock and keep your favorite contacts close. This small offline archive is a fictional snapshot of the early smartphone era.</p>${browserLink('news.example','Back to Tech News')}${browserLink('retro.example/holo','Explore the Holo interface')}</article>`;
    if (url.includes('news.example')) return `<h2>Tech News</h2><p style="color:#777">Friday, June 15, 2012</p><hr><h3>The Galaxy Nexus experience</h3><p>Android 4.0 makes multitasking, notifications and home screen customization easier than ever.</p><h3>Apps in your pocket</h3><p>Explore the growing world of mobile apps and connected devices.</p>${browserLink('news.example/galaxy-nexus','Read the Galaxy Nexus story')}${browserLink('retro.example','Visit the 2012 Web')}`;
    if (url.includes('retro.example')) return `<h2>Welcome to the 2012 Web</h2><p>A little time capsule from the early smartphone era.</p><ul><li>Share photos</li><li>Check your email</li><li>Customize your phone</li></ul>${browserLink('retro.example/holo','Explore the Holo interface')}${browserLink('maps.example','Open the sample map')}${browserLink('www.google.com','Back to Google')}`;
    if (url.includes('maps.example')) return `<h2>Maps</h2><div style="height:230px;background:repeating-linear-gradient(35deg,#e2ead9,#e2ead9 18px,#c7dfd7 18px,#c7dfd7 24px);display:grid;place-items:center;color:#426a68">San Francisco · Demo map</div><p>Map data is a local illustration.</p>`;
    return `<h2>Webpage unavailable</h2><p>The simulator browses a small collection of offline example pages.</p>${browserLink('www.google.com','Go to Google')}`;
  }
  function browserTitle(url) {
    return url === 'www.google.com' ? 'Google' : url.startsWith('search:') ? url.slice(7) : url.replace(/^www\./,'');
  }
  function renderBrowser() {
    const header = title => `<header class="web-header"><button data-action="back" aria-label="Back">‹</button><h2>${safe(i18n.t(title))}</h2><button data-action="browser-new-tab" aria-label="New tab"><img src="assets/web-ic_new_window_holo_dark.png" alt=""></button></header>`;
    if (ui.sub === 'tabs') return `<div class="app-view ics-browser">${header('Tabs')}<div class="web-tabs">${ui.browserTabs.map((url,i)=>`<article class="web-tab-card ${i===ui.browserTab?'current':''}"><div class="web-tab-title"><button data-action="browser-tab" data-id="${i}">${safe(browserTitle(url))}</button><button data-action="browser-close-tab" data-id="${i}" aria-label="Close tab"><img src="assets/web-ic_tab_close.png" alt=""></button></div><div class="web-tab-preview" role="button" tabindex="0" aria-label="${safe(browserTitle(url))}" data-action="browser-tab" data-id="${i}"><div class="browser-page" inert aria-hidden="true">${renderWebsite(url)}</div></div></article>`).join('')}</div></div>`;
    if (['bookmarks','history','saved'].includes(ui.sub)) {
      const urls = ui.sub==='history' ? [...data.browserHistory].reverse() : ui.sub==='saved' ? data.savedPages || [] : data.bookmarks;
      return `<div class="app-view ics-browser">${header('Bookmarks')}<nav class="web-library-tabs">${[['bookmarks','Bookmarks'],['history','History'],['saved','Saved pages']].map(([id,label])=>`<button class="${ui.sub===id?'active':''}" data-action="browser-${id}">${safe(i18n.t(label))}</button>`).join('')}</nav><div class="web-library">${urls.map(url=>`<div class="web-library-row"><button data-action="browser-bookmark" data-id="${safe(url)}">${safe(browserTitle(url))}<small>${safe(url)}</small></button>${ui.sub!=='history'?`<button data-action="browser-remove-saved" data-id="${safe(url)}" aria-label="Delete">×</button>`:''}</div>`).join('')||'<p class="empty-note">No saved pages</p>'}</div></div>`;
    }
    return `<div class="app-view ics-browser"><div class="browser-toolbar"><form data-form="address"><img src="assets/browser.png" alt=""><input name="address" aria-label="Web address" value="${safe(ui.browserUrl.startsWith('search:')?ui.browserUrl.slice(7):ui.browserUrl)}"></form><button data-action="browser-tabs" aria-label="Tabs"><img src="assets/web-ic_windows_holo_dark.png" alt=""><span class="browser-tab-count">${ui.browserTabs.length}</span></button><button data-action="browser-menu" aria-label="More options"><img src="assets/ic_menu_overflow.png" alt=""></button></div>${ui.browserFind!==undefined?`<form class="web-find" data-form="browser-find"><input name="query" aria-label="Find on page" placeholder="Find on page" value="${safe(ui.browserFind)}"><button type="submit">Search</button><button type="button" data-action="browser-close-find" aria-label="Close">×</button></form><div class="web-find-count" aria-live="polite"></div>`:''}<div class="browser-page">${renderWebsite(ui.browserUrl)}</div></div>`;
  }
  function highlightBrowserText() {
    const root=viewport.querySelector('.browser-page'), query=ui.browserFind.toLocaleLowerCase();
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT), nodes=[]; let node;
    while((node=walker.nextNode())) nodes.push(node);
    let count=0;
    for(const text of nodes) {
      let value=text.nodeValue, offset=0, index=value.toLocaleLowerCase().indexOf(query); if(index<0)continue;
      const fragment=document.createDocumentFragment();
      while(index>=0) { fragment.append(document.createTextNode(value.slice(offset,index)));const mark=document.createElement('mark');mark.textContent=value.slice(index,index+query.length);fragment.append(mark);count++;offset=index+query.length;index=value.toLocaleLowerCase().indexOf(query,offset); }
      fragment.append(document.createTextNode(value.slice(offset)));text.replaceWith(fragment);
    }
    viewport.querySelector('.web-find-count').textContent=`${count} ${i18n.t('matches')}`;
    root.querySelector('mark')?.scrollIntoView({block:'nearest'});
  }

  function navigatePlay(next) {
    ui.playHistory.push({...ui.play,scrollTop:viewport.querySelector('.play-content')?.scrollTop || 0});
    ui.play = {...ui.play,...next}; ui.overlay = ''; render();
  }
  function renderPhone() {
    if(ui.activeCall&&!ui.gbCallBackground)return GBPhone.inCall(ui.activeCall,{lang:i18n.language,t:key=>i18n.t(key),person:contactByPhone(ui.activeCall.number),bluetoothAvailable:!!(data.settings.bluetooth&&data.settings.pairedDevice)});
    if(ui.sub==='call-detail'){const call=(data.callHistory||[]).find(call=>call.time===ui.phoneCallId);if(call)return ICSPhoneCall.details(call,contactByPhone(call.number),key=>i18n.t(key),i18n.locale());}
    return GBPhone.render(gbPhoneContext());
    const tabs = [['dialpad','Dial pad','dialer'],['history','Call log','history'],['favorites','Favorites','favourites']];
    const header = `<div class="phone-tabs" role="tablist">${tabs.map(([id,title,icon]) => `<button role="tab" aria-selected="${ui.phoneTab === id}" aria-label="${title}" data-action="phone-tab" data-id="${id}"><img src="assets/ic_ab_${icon}_holo_dark.png" alt=""></button>`).join('')}</div>`;
    let body;
    if (ui.phoneTab === 'history') {
      body = `<div class="phone-list">${(data.callHistory || []).length ? [...data.callHistory].reverse().map(call => `<div class="phone-log-row"><button class="phone-history-row" data-action="phone-log-detail" data-id="${call.time}"><img class="phone-contact-image" src="assets/ic_contact_picture_holo_dark.png" alt=""><span>${safe(contactByPhone(call.number)?.name || call.number)}<small><img src="assets/ic_call_outgoing_holo_dark.png" alt="">${new Date(call.time).toLocaleString(i18n.locale(),{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</small></span></button><button class="phone-log-redial" data-action="phone-redial" data-id="${safe(call.number)}" aria-label="${safe(i18n.t('Call'))}"><img class="phone-redial" src="assets/ic_dial_action_call.png" alt=""></button></div>`).join('') : '<p class="empty-note">Call log is empty</p>'}</div>`;
    } else if (ui.phoneTab === 'favorites') {
      const favorites=data.contacts.filter(person=>person.favorite && (!ui.phoneSearch || `${person.name} ${person.phone}`.toLocaleLowerCase().includes(ui.phoneSearch.toLocaleLowerCase())));
      body = `<div class="phone-list">${ui.phoneSearch !== undefined ? `<form class="phone-search" data-form="phone-search"><input name="query" aria-label="Search contacts" placeholder="Search contacts" value="${safe(ui.phoneSearch)}"><button aria-label="Search" type="submit"><img src="assets/ic_dial_action_search.png" alt=""></button></form>` : ''}${favorites.length?`<div class="phone-section">Favorites</div><div class="phone-favorite-tiles">${favorites.map(person=>`<button data-action="contact-call" data-id="${person.id}"><img src="assets/phone-picture_unknown.png" alt=""><span>${safe(person.name)}</span></button>`).join('')}</div>`:''}<div class="phone-section">All contacts</div>${data.contacts.filter(person => !ui.phoneSearch || `${person.name} ${person.phone}`.toLocaleLowerCase().includes(ui.phoneSearch.toLocaleLowerCase())).map(person => `<button class="phone-history-row" data-action="contact-call" data-id="${person.id}"><img class="phone-contact-image" src="assets/ic_contact_picture_holo_dark.png" alt=""><span>${safe(person.name)}<small>${safe(person.phone)}</small></span></button>`).join('')}</div>`;
    } else {
      body = `<div class="ics-dialer"><div class="dial-digits"><output aria-label="Phone number">${safe(ui.dial)}</output><button data-action="dial-delete" aria-label="Delete"><img src="assets/ic_dial_action_delete.png" alt=""></button></div><div class="ics-dial-pad">${['1','2','3','4','5','6','7','8','9','*','0','#'].map(digit => `<button data-action="dial" data-id="${digit}" aria-label="${digit}"><img src="assets/dial_num_${digit === '*' ? 'star' : digit === '#' ? 'pound' : digit}_wht.png" alt=""></button>`).join('')}</div><div class="dial-actions"><button data-action="phone-search" aria-label="Search contacts"><img src="assets/ic_dial_action_search.png" alt=""></button><button class="dial-call" data-action="call" aria-label="Call"><img src="assets/ic_dial_action_call.png" alt=""></button><button data-action="phone-menu" aria-label="More options"><img src="assets/ic_menu_overflow.png" alt=""></button></div></div>`;
    }
    return `<div class="app-view phone-app">${header}${body}</div>`;
  }
  function contactByPhone(number) { const normalized = String(number).replace(/[^\d+]/g, ''); return data.contacts.find(item => item.phone.replace(/[^\d+]/g, '') === normalized); }
  function startPhoneCall(number) {
    if(!number)return;
    // Add call: the simulator keeps one line, so the call in progress ends and the new one is dialed.
    if(ui.activeCall&&ui.gbAddCall&&!ui.activeCall.endedAt){data.callHistory=[...(data.callHistory||[]),ICSPhoneCall.finish(ui.activeCall)].slice(-50);ui.activeCall=null;save();}
    if(!ui.activeCall)ui.activeCall=ICSPhoneCall.start(number);
    ui.gbCallBackground=false;ui.gbAddCall=false;
    captureRecentView();ui.recent=['phone',...ui.recent.filter(id=>id!=='phone')].slice(0,7);
    ui.callNumber=ui.activeCall.number;ui.view='phone';ui.sub='calling';ui.overlay='';render();
  }
  // Dialtacts context: the Contacts launcher icon opens the same activity on its Contacts tab.
  function gbPhoneContext() {
    const person = ui.view === 'people' && ui.sub === 'detail' ? contact(ui.selectedContact) : null;
    return {lang: i18n.language, locale: i18n.locale(), t: key => i18n.t(key), now: Date.now(), tab: ui.view === 'people' ? 'contacts' : ui.phoneTab || 'dialpad', dial: ui.dial || '', callActive: !!ui.activeCall, addCall: !!ui.gbAddCall, calls: data.callHistory || [], contactOf: number => contactByPhone(number), people: data.contacts, detail: person};
  }
  function renderPeople() { if (!ui.sub || ui.sub === 'detail' && contact(ui.selectedContact)) return GBPhone.render(gbPhoneContext()); return ICSPeople.render(data,ui,key => i18n.t(key),i18n.locale()); }
  function editPerson(isNew = false) {
    const person = isNew ? {} : contact(ui.selectedContact);
    if (!person) return;
    ui.peopleDraft = {...person,groups:data.contactGroups.filter(g=>g.members.includes(person.id)).map(g=>g.id)};
    ui.sub = isNew ? 'new' : 'edit'; ui.overlay = ''; render();
  }
  function peopleOverlay() {
    if (ui.overlay === 'people-menu') return '<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu"><button data-action="people-edit">Edit contact</button><button data-action="people-delete">Delete contact</button></div>';
    if (ui.overlay === 'people-delete') return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog mms-dialog" role="dialog" aria-label="Delete contact"><h3>Delete contact</h3><p>${safe(contact(ui.selectedContact)?.name || '')}</p><p>Messages will be kept under the phone number.</p><div class="settings-dialog-actions"><button data-action="close-overlay">Cancel</button><button data-action="people-confirm-delete">Delete</button></div></div>`;
    const group = data.contactGroups.find(g=>g.id===ui.peopleEditGroup);
    return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog mms-dialog people-editor" role="dialog" aria-label="${group?'Edit group':'New group'}" data-form="people-group"><h3>${group?'Edit group':'New group'}</h3><label>Group name<input name="name" required maxlength="50" value="${safe(group?.name||'')}"></label>${data.contacts.map(p=>`<label class="people-membership"><input type="checkbox" name="members" value="${p.id}" ${group?.members.includes(p.id)?'checked':''}>${safe(p.name)}</label>`).join('')}<div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">Save</button></div></form>`;
  }
  function renderMessaging() {
    return ICSMessaging.render(data, ui, key => i18n.t(key), i18n.locale());
  }
  function messageDraft() {
    data.messageDrafts ||= {};
    const key = ICSMessaging.draftKey(ui);
    return data.messageDrafts[key] ||= {body:'',recipient:''};
  }
  function openMessageThread(key) {
    if (ui.view !== 'messaging') openApp('messaging');
    if (ui.sub !== 'thread') ui.mmsListMode = ui.sub === 'search' ? 'search' : '';
    ui.thread = key; ui.sub = 'thread'; ui.overlay = '';
    data.messages.filter(m => String(m.contact) === String(key)).forEach(m => { m.read = true; });
    if (String(key) === '1') data.notifications = data.notifications.filter(n => n.id !== 2);
    save(); render(); scrollMessages();
  }
  function scrollMessages() {
    const history = viewport.querySelector('.mms-history');
    if (history) history.scrollTop = history.scrollHeight;
  }
  function renderMessageOverlay() {
    const dialog = (title, content) => `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog mms-dialog" role="dialog" aria-label="${safe(i18n.t(title))}"><h3>${safe(i18n.t(title))}</h3>${content}</div>`;
    const option = (action, text, id = '') => `<button data-action="${action}" data-id="${safe(id)}">${safe(i18n.t(text))}</button>`;
    if (ui.overlay === 'mms-menu') {
      const composing = ['thread','new'].includes(ui.sub);
      return `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu ${composing ? '' : 'mms-menu-root'}">${composing ? option('mms-smiley','Insert smiley') + option('mms-discard','Discard draft') + (ui.sub === 'thread' ? option('mms-delete-thread','Delete thread') : '') : option('new-message','New message') + option('mms-search','Search messages')}</div>`;
    }
    if (ui.overlay === 'mms-attach') return dialog('Add attachment', `<div class="mms-dialog-list">${data.photos.map(p => `<button data-action="mms-photo" data-id="${p.id}">${ICSMessaging.photo(p)}</button>`).join('') || '<p>No photos</p>'}</div>`);
    if (ui.overlay === 'mms-smiley') return dialog('Insert smiley', `<div class="mms-dialog-list">${[':-)',':-(', ';-)',':-D',':-P'].map(face=>option('mms-insert-smiley',face,face)).join('')}</div>`);
    if (ui.overlay === 'mms-delete-confirm') return dialog(ui.mmsDelete === 'thread' ? 'Delete thread' : 'Delete message', `<p>Delete this conversation or message from the simulator?</p><div class="settings-dialog-actions">${option('close-overlay','Cancel')}${option('mms-confirm-delete','Delete')}</div>`);
    const message = data.messages.find(m => String(m.id) === String(ui.mmsMessage));
    if (!message) return '';
    if (ui.overlay === 'mms-message') return dialog('Message options', `<div class="mms-dialog-list">${option('mms-forward','Forward message')}${option('mms-details','View message details')}${option('mms-delete-message','Delete message')}</div>`);
    if (ui.overlay === 'mms-details') return dialog('Message details', `<p>${message.attachment ? 'MMS' : 'SMS'} · ${safe(i18n.t(message.mine ? 'Sent' : 'Received'))}</p><p>${safe(ICSMessaging.identity(message.contact,data.contacts).phone)}</p><p>${safe(message.timestamp ? new Date(message.timestamp).toLocaleString(i18n.locale()) : i18n.t(message.time))}</p><p>${safe(message.body)}</p><div class="settings-dialog-actions">${option('close-overlay','OK')}</div>`);
    return '';
  }
  function photoStyle(photo) { return `background-image:url('${ICSMedia.image(photo)}');background-size:cover;background-position:center`; }
  function renderGallery() { return ICSMedia.gallery(data,ui,key=>i18n.t(key)); }
  function renderCamera() { return ICSMedia.camera(data,ui,key=>i18n.t(key)); }
  function galleryStep(direction) {
    const items=ICSMedia.photos(data,ui.galleryAlbum); if(!items.length)return;
    const index=Math.max(0,items.findIndex(p=>p.id===ui.selectedPhoto));
    ui.selectedPhoto=items[(index+direction+items.length)%items.length].id;ui.galleryZoom=false;render();
  }

  function renderCalendar() {
    return ICSCalendar.render(data,ui,key=>i18n.t(key),i18n.locale(),deviceDate());
  }
  function calendarRender() {
    render();
    const timeline=viewport.querySelector('.cal-time-scroll');
    if(timeline)timeline.scrollTop=8*48;
  }
  function calendarMove(direction) {
    const mode=ui.calendarMode || 'Month';
    if(mode==='Month') {const date=ICSCalendar.parse(ui.selectedDate);date.setDate(1);date.setMonth(date.getMonth()+direction);ui.selectedDate=ICSCalendar.iso(date);}
    else ui.selectedDate=ICSCalendar.plus(ui.selectedDate,direction*(mode==='Week'?7:1));
    calendarRender();
  }
  function deleteEventScope(scope) {
    const series=data.events.find(item=>item.id===ui.selectedEvent);if(!series)return;
    const item=ICSCalendar.instance(series,ui.selectedInstance);
    if(scope==='this')series.exdates=[...new Set([...(series.exdates||[]),item.date])];
    else if(scope==='future'&&item.date!==item.seriesStart)series.until=ICSCalendar.plus(item.date,-1);
    else data.events=data.events.filter(event=>event.id!==series.id);
    save();ui.overlay='';ui.sub='';calendarRender();
  }
  // Calendar AlertService: a status-bar notification at the reminder time while the page is running.
  function checkReminders(now) {
    data.calendarFired=Array.isArray(data.calendarFired)?data.calendarFired.slice(-60):[];
    for(const {key,event} of ICSCalendar.dueReminders(data.events,now,data.calendarFired)) {
      data.calendarFired.push(key);
      const when=event.allDay?i18n.t('All day'):`${event.time} – ${event.endTime}`;
      data.notifications.unshift({id:Date.now()+data.notifications.length,title:event.title,detail:[when,event.location].filter(Boolean).join(' · '),kind:'calendar',eventId:event.id,date:event.date});
      save();renderStatus();if(ui.overlay==='shade')renderOverlay();
    }
  }
  function calendarEdit(item) {
    ui.eventDraft=ICSCalendar.normalize(item || {date:ui.selectedDate,time:'12:00',title:''});
    ui.calendarError='';ui.overlay='';ui.sub='event-edit';render();
  }
  function renderClock() { return ICSDeskClock.render(data,ui,key=>i18n.t(key),i18n.locale(),deviceDate()); }
  function editAlarm(id) {
    ui.alarmDraft=ICSDeskClock.normalize(data.alarms.find(alarm=>alarm.id===Number(id)));
    ui.sub='alarm-edit'; ui.overlay=''; render();
  }
  function checkAlarms(now) {
    if(ui.overlay==='clock-ringing')return;
    const alarm=data.alarms.find(alarm=>ICSDeskClock.due(alarm,now));
    if(!alarm)return;
    alarm.lastFiredMinute=Math.floor(now.getTime()/60000);
    delete alarm.snoozedUntil;
    if(!ICSDeskClock.normalize(alarm).days.length)alarm.enabled=false;
    ui.ringingAlarm=clone(alarm); save(); ui.overlay='clock-ringing'; renderOverlay();
  }

  function renderCalculator() {
    const basic = ['7','8','9','÷','4','5','6','×','1','2','3','−','.','0','=','+'];
    const advanced = ['sin','cos','tan','ln','log','!','π','e','^','(',')','√'];
    const keys = (items, scientific = false) => items.map(key => `<button class="${!scientific && /^[0-9.]$/.test(key) ? 'digit' : 'function'}" data-action="calc-key" data-id="${key}">${key}</button>`).join('');
    return `<div class="app-view"><div class="ics-calculator"><div class="ics-calc-display"><output aria-label="Calculator display">${safe(ui.calc)}</output><button data-action="calc-menu" aria-label="More options"><img src="assets/ic_menu_overflow.png" alt=""></button></div><div class="ics-calc-delete"><span></span><button data-action="calc-key" data-id="${ui.calcFresh ? 'C' : '⌫'}" aria-label="${ui.calcFresh ? 'Clear' : 'Delete'}">${ui.calcFresh ? 'CLR' : 'DELETE'}</button></div><div class="calc-pager"><div class="calc-panels" style="transform:translateX(-${ui.calcPanel * 50}%)"><div class="ics-calc-grid" aria-label="Basic panel" ${ui.calcPanel ? 'inert' : ''}>${keys(basic)}</div><div class="ics-calc-grid scientific" aria-label="Advanced panel" ${ui.calcPanel ? '' : 'inert'}>${keys(advanced,true)}</div></div></div></div></div>`;
  }
  function setCalculatorPanel(index) {
    ui.calcPanel = index;
    const track = viewport.querySelector('.calc-panels');
    if (!track) return;
    track.style.transition = '';
    track.style.transform = `translateX(-${index * 50}%)`;
    track.querySelectorAll('.ics-calc-grid').forEach((panel, i) => { panel.inert = i !== index; });
  }
  function renderMusic() {
    return ICSMusic.render(ui.music,ui,key=>i18n.t(key));
  }
  function saveMusic() {
    ui.musicTrack=ui.music.track;ui.musicPlaying=ui.music.playing;ui.musicPosition=ui.music.position;
    data.music=clone(ui.music);delete data.music.playing;save();
  }
  function tickMusic() {
    if(!ui.music.playing)return;
    const previous=ui.music.track;ICSMusic.tick(ui.music);
    ui.musicTrack=ui.music.track;ui.musicPlaying=ui.music.playing;
    if(previous!==ui.music.track || !ui.music.playing){saveMusic();if(ui.view==='music'||ui.view==='home'||ui.view==='lock'&&!pointerStart)render();}
    else if(Math.floor(ui.music.position)%10===0)saveMusic();
    const progress=viewport.querySelector('.music-progress');if(progress&&document.activeElement!==progress)progress.value=ui.music.position;
    const elapsed=viewport.querySelector('.music-elapsed');if(elapsed)elapsed.textContent=ICSMusic.time(ui.music.position);
  }
  function renderEmail() {
    return ICSEmail.render(data.mailbox,ui,key=>i18n.t(key),i18n.locale());
  }
  function composeEmail(source=null,forward=false,to='') {
    const draft=ICSEmail.draft(source,forward);if(to)draft.to=to;
    data.mailbox.unshift(draft);ui.emailId=draft.id;ui.emailCc=false;ui.emailError='';ui.overlay='';ui.sub='compose';save();render();
  }
  function resetSimulator() {
    data=clone(defaultData);data.settings={...ICSSettingsDetail.defaults,...ICSSystemSettings.defaults,...data.settings};
    data.mailbox=ICSEmail.restore(null,emailData,[]);ui.music=ICSMusic.restore();ui.musicActive=false;ui.photoStacks={};ui.photoWidgetSetup=null;ui.musicTrack=0;ui.musicPlaying=false;ui.musicPosition=0;
    ui.activeCall=null;ui.sleeping=false;ui.locked=false;ui.vpnConnected=null;ui.calendarMode='Month';ui.emailFolder='Inbox';ui.emailQuery=undefined;ui.emailSelected=[];ui.recent=[];ui.recentState={};ui.recentSnapshots={};
    ICSLauncherFolders.initialize(data,apps.map(app=>app[0]));
    ui.browserSession=ICSBrowserSession.restore(null,data.browserHistory);syncBrowserState();ui.peopleDraft=null;ui.peopleQuery='';ui.peopleTab='all';save();home();
  }
  function clearAppData(id) {
    if(id==='browser'){delete data.browserSession;data.browserHistory=clone(defaultData.browserHistory);data.bookmarks=clone(defaultData.bookmarks||[]);data.savedPages=[];ui.browserSession=ICSBrowserSession.restore(null,data.browserHistory);syncBrowserState();}
    if(id==='music'){ui.music=ICSMusic.restore();saveMusic();}
    if(id==='email'){data.mailbox=ICSEmail.restore(null,emailData,[]);data.sentEmails=[];ui.emailFolder='Inbox';ui.emailQuery=undefined;ui.emailSelected=[];}
    if(id==='clock')data.alarms=clone(defaultData.alarms);
    if(id==='calendar')data.events=clone(defaultData.events);
    if(id==='people'){data.contacts=clone(defaultData.contacts);data.contactGroups=clone(defaultData.contactGroups);ui.peopleDraft=null;}
    if(id==='messaging'){data.messages=clone(defaultData.messages);data.messageDrafts={};}
    if(id==='gallery'){data.photos=clone(defaultData.photos);}
    if(id==='camera')delete data.cameraSettings;
    if(id==='phone'){data.callHistory=[];ui.activeCall=null;}
    if(id==='calculator'){ui.calc='';ui.calcHistoryIndex=-1;data.calcHistory=[];}
    if(id==='play-store')delete data.playRatings;
    ui.recent=ui.recent.filter(app=>app!==id);delete ui.recentState?.[id];delete ui.recentSnapshots[id];save();
  }

  function operateCalculator(key) {
    if (key === 'C') { ui.calc = ''; ui.calcFresh = false; return; }
    if (key === '⌫') { ui.calc = ui.calc === 'Error' ? '' : ui.calc.replace(/(?:sin|cos|tan|log|sqrt|√|ln)\($|.$/, ''); ui.calcFresh = false; return; }
    if (key === '=') {
      if (!ui.calc || ui.calc === 'Error') return;
      try { const expression = ui.calc; ui.calc = ICSCalculator.evaluate(expression); data.calcHistory = [...(data.calcHistory || []), {expression, result:ui.calc}].slice(-50); ui.calcHistoryIndex = -1; save(); } catch { ui.calc = 'Error'; }
      ui.calcFresh = true; return;
    }
    if (ui.calc.length > 150) return;
    const operator = ['÷','×','−','+','^','!'].includes(key);
    if (ui.calc === 'Error' || ui.calcFresh && !operator) ui.calc = '';
    ui.calcFresh = false;
    const token = key === '√' ? '√(' : /^(sin|cos|tan|ln|log)$/.test(key) ? `${key}(` : key;
    if (operator && key !== '!' && /[÷×−+^]$/.test(ui.calc) && key !== '−') ui.calc = ui.calc.slice(0,-1);
    ui.calc += token;
  }
  function blinkTips(times) {
    let delay = 0;
    for (const [icon, wait] of GBLauncher.blinkFrames(times)) { setTimeout(() => { ui.tipsIcon = icon; if (ui.view === 'home') { const img = viewport.querySelector('.gbtips-droid img'); if (img) img.src = `assets/gb-tips-${icon}.png`; } }, delay); delay += wait; }
  }
  function addNotification(title, detail) { data.notifications.unshift({ id: Date.now(), title, detail }); save(); renderStatus(); }
  function sendMessage(id, body, attachment) {
    if (!body && !attachment) return;
    data.messages.push({ id: Date.now(), contact: id, body, mine: true, time: clock(), timestamp:Date.now(), read:true, ...(attachment ? {attachment:clone(attachment)} : {}) });
    delete data.messageDrafts?.[ICSMessaging.draftKey(ui)];
    openMessageThread(id);
  }

  let suppressClickUntil = 0;
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button || !screen.contains(button) && !navRoot.contains(button)) return;
    event.preventDefault();
    if (Date.now() < suppressClickUntil) return;
    const { action, id, app, url } = button.dataset;
    if(ui.locked&&!['back','alarm-dismiss','alarm-snooze'].includes(action))return;
    switch (action) {
      case 'open-app': openApp(app || id, !!button.closest('.recent-item')); break;
      case 'home': if (ui.view !== 'lock') home(); break;
      case 'back': back(); break;
      case 'menu-key': menuKey(); break;
      case 'search-key': searchKey(); break;
      case 'gb-ga-silent': { const silent = !data.settings.silent; data.settings.silent = silent; data.settings.silentMode = silent ? (data.settings.vibrateSilent === false ? 'mute' : 'vibrate') : 'off'; ui.overlay = ''; save(); render(); break; }
      case 'ga-power': ui.overlay = 'power-confirm'; ui.powerKind = 'shutdown'; renderOverlay(); break;
      case 'ga-bugreport': ui.overlay = 'power-confirm'; ui.powerKind = 'bugreport'; renderOverlay(); break;
      case 'ga-airplane': ui.overlay = ''; data.settings.airplane = !data.settings.airplane; if (data.settings.airplane) { data.settings.wifi = false; data.settings.bluetooth = false; } save(); render(); break;
      case 'ga-ringer': GlobalActions.setRinger(data.settings, id); save(); renderStatus(); renderOverlay(); setTimeout(() => { if (ui.overlay === 'power-menu') { ui.overlay = ''; render(); } }, GlobalActions.DISMISS_DELAY); break;
      case 'ga-confirm': powerConfirm(id); break;
      case 'drawer': if (data.clings && !data.clings.workspace) { data.clings.workspace = true; save(); } ui.view = 'drawer'; ui.sub = ''; ui.overlay = ''; render(); break;
      case 'cling-dismiss': if (data.clings) { data.clings[id] = true; save(); } LauncherClings.dismiss(clingLayerRoot().querySelector(`[data-cling="${id}"]`)); break;
      case 'folder-open': ui.folderId=button.dataset.folderId;ui.overlay='folder';renderOverlay();break;
      case 'drawer-tab': ui.drawerTab = id; ui.drawerPage = 0; render(); break;
      case 'drawer-page': ui.drawerPage = Number(id); render(); break;
      case 'add-widget': { const added = addWidget(button.dataset.widgetType); if (!added) { toast('This home screen is full'); break; } const setup = ui.photoWidgetSetup; ui.photoWidgetSetup = null; home(false); ui.photoWidgetSetup = setup; if (added.type === 'photo') { ui.overlay = 'widget-photo-type'; renderOverlay(); } else toast('Widget added'); break; }
      case 'widget-calendar-open': ui.selectedDate = today(); openApp('calendar'); break;
      case 'widget-calendar-event': { const event = data.events.find(item => String(item.id) === id); if (!event) break; const date = button.dataset.date || event.date; ui.selectedDate = date < today() ? today() : date; openApp('calendar'); ui.selectedEvent = event.id; ui.selectedInstance = date; ui.sub = 'event'; render(); break; }
      case 'widget-music-open': { const active = musicActive(); openApp('music'); if (active) { ui.sub = 'player'; render(); } break; }
      case 'widget-music-next': ICSMusic.step(ui.music, 1); ui.musicActive = true; ui.musicTrack = ui.music.track; saveMusic(); render(); break;
      case 'widget-photo-open': { const photo = data.photos.find(item => item.id === Number(id)); if (!photo) break; openApp('gallery'); ui.selectedPhoto = photo.id; ui.galleryAlbum = ICSMedia.album(photo); ui.sub = 'photo'; ui.galleryZoom = false; render(); break; }
      case 'widget-photo-type': if (id === 'shuffle') configurePhotoWidget({source: 'shuffle'}); else { ui.overlay = id === 'album' ? 'widget-photo-album' : 'widget-photo-image'; renderOverlay(); } break;
      case 'widget-photo-album': configurePhotoWidget({source: 'album', album: id}); break;
      case 'widget-photo-image': configurePhotoWidget({source: 'photo', photo: Number(id)}); break;
      case 'widget-photo-cancel': cancelPhotoWidget(); break;
      case 'open-wallpapers': ui.overlay = ''; ui.wpChoice = null; ui.view = 'wallpaper-picker'; render(); viewport.querySelector('.gbwp-item.selected')?.scrollIntoView({inline: 'center', block: 'nearest'}); break;
      case 'open-live-wallpapers': ui.overlay = ''; ui.view = 'live-wallpapers'; ui.sub = ''; render(); break;
      case 'lw-preview': ui.sub = `preview:${id}`; render(); break;
      case 'lw-settings': ui.sub = `settings:${id}`; render(); break;
      // LiveWallpaperPreview.setLiveWallpaper: set it and return to the launcher.
      case 'lw-set': data.liveWallpaper = {id}; save(); ui.sub = ''; home(false); break;
      case 'lw-toggle': { const [wid, key] = String(id).split(':'); data.lwPrefs ||= {}; data.lwPrefs[wid] ||= {}; data.lwPrefs[wid][key] = data.lwPrefs[wid][key] === false; save(); render(); break; }
      case 'lw-palette': ui.overlay = 'lw-palette'; renderOverlay(); break;
      case 'lw-palette-pick': data.lwPrefs ||= {}; data.lwPrefs.polar ||= {}; data.lwPrefs.polar.palette = id; save(); ui.overlay = ''; render(); break;
      case 'gallery-wallpaper': ui.overlay = ''; openApp('gallery'); break;
      case 'market': openApp('play-store'); break;
      case 'play-menu': ui.overlay = 'play-menu'; renderOverlay(); break;
      case 'play-my-apps': navigatePlay({page:'my-apps',category:'',query:''}); break;
      case 'play-search': navigatePlay({page:'search',category:'',query:''}); viewport.querySelector('.play-search input')?.focus(); break;
      case 'play-tab': ui.play = {...ICSPlayStore.initial(),tab:id}; ui.playHistory = []; render(); break;
      case 'play-category': navigatePlay({page:'list',category:id,query:''}); break;
      case 'play-detail': navigatePlay({page:'detail',selected:id,preview:0}); break;
      case 'play-preview': navigatePlay({page:'preview',selected:id,preview:Number(button.dataset.preview || 0)}); break;
      case 'play-preview-step': ui.play.preview = (ui.play.preview + Number(id) + 3) % 3; render(); break;
      case 'play-open': { const entry = ICSPlayStore.catalog.find(item => item.id === id); if (entry?.app) openApp(entry.app); break; }
      case 'play-rate': { const top = viewport.querySelector('.play-content').scrollTop; data.playRatings ||= {}; data.playRatings[ui.play.selected] = Number(id); save(); render(); viewport.querySelector('.play-content').scrollTop = top; break; }
      case 'page': setHomePage(Number(id)); break;
      case 'power-toggle':
        if (id === 'brightness') data.settings.brightness = data.settings.brightness < 30 ? 55 : data.settings.brightness < 80 ? 100 : 20;
        else data.settings[id] = !data.settings[id];
        if(id==='wifi'&&data.settings.wifi)data.settings.portableHotspot=false;
        if(id==='bluetooth'&&!data.settings.bluetooth)data.settings.bluetoothTether=false;
        save(); render(); break;
      case 'widget-music-play': ui.musicActive=true;ui.music.playing=!ui.music.playing;if(ui.music.playing&&ui.music.position>=tracks[ui.music.track].duration)ui.music.position=0;saveMusic();render();break;
      case 'voice-search': toast('Voice search unavailable offline'); break;
      case 'gb-add': ui.overlay = 'gb-dialog-add'; renderOverlay(); break;
      case 'gb-add-shortcuts': ui.overlay = 'gb-dialog-shortcuts'; renderOverlay(); break;
      case 'gb-add-widgets': ui.overlay = 'gb-dialog-widgets'; renderOverlay(); break;
      case 'gb-add-folders': ui.overlay = 'gb-dialog-folders'; renderOverlay(); break;
      case 'gb-new-folder': { ui.overlay = ''; const slot = data.homePages[ui.page].findIndex((item, index) => item === null && widgetFits(ui.page, index % 4, Math.floor(index / 4), {type: 'x', width: 1, height: 1})); if (slot < 0) { renderOverlay(); toast('No more room on this Home screen.'); break; } ICSLauncherFolders.create(data, ui.page, slot, id ? {live: id} : {}); save(); render(); break; }
      case 'gb-live-contact': ui.overlay = ''; openApp('people'); ui.selectedContact = Number(id); ui.sub = 'detail'; render(); break;
      case 'gb-rename-folder': { const input = overlayRoot.querySelector('.gbdlg input'); const folder = ICSLauncherFolders.folder(data, ui.folderId); if (folder && input) { folder.name = input.value.trim().slice(0, 40); save(); } ui.overlay = 'folder'; render(); renderOverlay(); break; }
      case 'gb-rename-cancel': ui.overlay = 'folder'; renderOverlay(); break;
      case 'gb-wallpaper': ui.overlay = 'gb-dialog-wallpaper'; renderOverlay(); break;
      case 'gb-notifications': ui.overlay = 'shade'; renderOverlay(); break;
      case 'gb-menu-more': ui.overlay = 'gb-menu-more'; renderOverlay(); break;
      case 'settings-open': ui.overlay = ''; ui.view = 'settings'; ui.sub = id; ui.gbSettingsStack = id ? [''] : []; render(); break;
      case 'gbset-go': if (id === 'brightness') { ui.overlay = 'gb-dialog-brightness'; ui.brightnessDraft = data.settings.brightness; renderOverlay(); break; } (ui.gbSettingsStack ||= []).push(ui.sub); ui.sub = id; render(); break;
      case 'gbset-check': if (id === 'usbDebug' && !data.settings.usbDebug) { ui.overlay = 'gb-dialog-set'; ui.gbSetDialog = 'adb'; renderOverlay(); break; } { const current = data.settings[id] ?? GBSettings.DEFAULTS[id] ?? (id === 'patternVisible'); data.settings[id] = !current;
        if (id === 'airplane' && data.settings.airplane) { data.settings.wifi = false; data.settings.bluetooth = false; data.settings.portableHotspot = false; }
        if (id === 'silent') data.settings.silentMode = data.settings.silent ? (GBSettings.value(data.settings, 'vibrateMode') === 1 || GBSettings.value(data.settings, 'vibrateMode') === 3 ? 'mute' : 'vibrate') : 'off';
        save(); render(); break; }
      case 'gbset-list': ui.overlay = 'gb-dialog-list'; ui.gbListKey = id; renderOverlay(); break;
      case 'gbset-list-pick': { const [key, index] = id.split(':'); data.settings[key] = Number(index); if (key === 'animationLevel') data.settings.transitionScale = [0, .5, 1][Number(index)]; ui.overlay = ''; save(); render(); break; }
      case 'gbset-toast': toast(id); break;
      case 'gbset-dialog': ui.overlay = 'gb-dialog-set'; ui.gbSetDialog = id; renderOverlay(); break;
      case 'gbset-ap': ui.overlay = 'gb-dialog-set'; ui.gbSetDialog = `ap:${id}`; renderOverlay(); break;
      case 'gbset-wifi-connect': { const network = allWifiNetworks().find(item => item.name === id), password = overlayRoot.querySelector('[data-wifi-password]')?.value || ''; if (network && network.security !== 'Open' && password.length < 8) { toast('Password must have at least 8 characters'); break; } data.settings.wifiNetwork = id; ui.overlay = ''; save(); render(); break; }
      case 'gbset-wifi-forget': data.settings.wifiNetwork = ''; ui.overlay = ''; save(); render(); break;
      case 'gbset-wifi-save': { const ssid = overlayRoot.querySelector('[data-wifi-ssid]')?.value.trim(); if (ssid && !allWifiNetworks().some(item => item.name === ssid)) data.savedWifiNetworks = [...(data.savedWifiNetworks || []), {name: ssid.slice(0, 32), security: 'Open', strength: 2}]; ui.overlay = ''; save(); render(); break; }
      case 'gbset-wifi-scan': ui.overlay = ''; render(); toast('Scanning…'); break;
      case 'gbset-bt-scan': ui.btScanning = true; render(); setTimeout(() => { ui.btScanning = false; ui.btFound = [{name: 'Headset', kind: 'headset_hfp'}, {name: 'Car kit', kind: 'headphones_a2dp'}, {name: "Sam's laptop", kind: 'laptop'}]; if (ui.view === 'settings') render(); }, 1500); break;
      case 'gbset-bt-device': if (data.settings.pairedDevice === id) { toast('Connected'); break; } data.settings.pairedDevice = id; save(); render(); break;
      case 'gbset-bt-name-ok': { const name = overlayRoot.querySelector('[data-bt-name]')?.value.trim(); if (name) data.settings.bluetoothName = name.slice(0, 40); ui.overlay = ''; save(); render(); break; }
      case 'gbset-volume-ok': overlayRoot.querySelectorAll('[data-vol]').forEach(input => { data.settings[input.dataset.vol] = Number(input.value); }); { const same = overlayRoot.querySelector('[data-vol-same]'); if (same) data.settings.notificationSameAsRing = same.checked; } ui.overlay = ''; save(); render(); break;
      case 'gbset-sound-pick': { const [kind, name] = id.split(':'); data.settings[kind] = name; save(); renderOverlay(); render(); break; }
      case 'gbset-locale': i18n.setLanguage(id); location.reload(); break;
      case 'gbset-adb-ok': data.settings.usbDebug = true; ui.overlay = ''; save(); render(); break;
      case 'gbset-brightness-ok': { const input = overlayRoot.querySelector('.gbbright input[type=range]'); if (input) data.settings.brightness = Number(input.value); const auto = overlayRoot.querySelector('.gbbright input[type=checkbox]'); if (auto) data.settings.autoBrightness = auto.checked; ui.overlay = ''; save(); render(); break; }
      case 'gb-add-app': { ui.overlay = ''; const slot = data.homePages[ui.page].findIndex((item, index) => !item && widgetFits(ui.page, index % 4, Math.floor(index / 4), {type: 'x', width: 1, height: 1})); if (slot < 0) { renderOverlay(); toast('No more room on this Home screen.'); break; } data.homePages[ui.page][slot] = id; save(); render(); break; }
      case 'add-widget-gb': { ui.overlay = ''; const added = addWidget(id); if (!added) { renderOverlay(); toast('No more room on this Home screen.'); break; } if (ui.overlay) renderOverlay(); render(); break; }
      case 'gb-wp-pick': ui.wpChoice = Number(id); render(); viewport.querySelector('.gbwp-item.selected')?.scrollIntoView({inline: 'center', block: 'nearest', behavior: reducedMotion?.matches ? 'auto' : 'smooth'}); break;
      case 'gb-preview-go': ui.overlay = ''; renderOverlay(); setHomePage(Number(id)); break;
      case 'gb-tip-next': data.protips = {...(data.protips || {set: 0}), index: ((data.protips?.index ?? -1) + 1) % GBLauncher.tips(i18n.language, data.protips?.set).length}; save(); render(); break;
      case 'gb-tip-poke': blinkTips(1); break;
      case 'lock-media': if (id === 'play') { ui.music.playing = !ui.music.playing; if (ui.music.playing && ui.music.position >= tracks[ui.music.track].duration) ui.music.position = 0; } else ICSMusic.step(ui.music, id === 'previous' ? -1 : 1); ui.musicTrack = ui.music.track; saveMusic(); render(); break;
      case 'lock-hint': screen.classList.add('lock-dragging'); setTimeout(() => { if (!pointerStart?.lockDrag) lockRelease(null); }, 1000); break;
      case 'shade': if (ui.overlay === 'shade') { closeShade(); break; } if (ui.locked) break; ui.overlay = 'shade'; renderOverlay(); break;
      case 'recent': if (ui.view === 'lock') break; if (ui.overlay !== 'recent') captureRecentView(); ui.overlay = ui.overlay === 'recent' ? '' : 'recent'; renderOverlay(); break;
      case 'close-overlay': if (ui.overlay === 'shade') { closeShade(); break; } ui.overlay = ''; renderOverlay(); break;
      case 'remove-recent': event.stopPropagation(); ui.recent = ui.recent.filter(item => item !== id); renderOverlay(); break;
      case 'clear-notifications': data.notifications = []; save(); renderStatus(); renderOverlay(); closeShade(); break;
      case 'notification-open': { const note = data.notifications.find(item => String(item.id) === id); if (note?.kind === 'calendar') { data.notifications = data.notifications.filter(item => item !== note); save(); ui.overlay = ''; openApp('calendar'); ui.selectedEvent = note.eventId; ui.selectedInstance = note.date; ui.selectedDate = note.date; ui.sub = 'event'; render(); break; } }
        ui.overlay = ''; if (Number(id) === 2) openMessageThread(1); else { ui.view = 'settings'; ui.sub = 'about'; render(); } break;
      case 'unlock': ui.view = 'home'; render(); break;
      case 'unlock-camera': openApp('camera'); break;
      case 'settings-sub': if (ui.view === 'settings') (ui.gbSettingsStack ||= []).push(ui.sub); ui.overlay = ''; if (id === 'development' && !data.settings.developerUnlocked) break; if (ui.view === 'settings' && !ui.sub) ui.settingsRootScroll = viewport.querySelector('.settings-app')?.scrollTop || 0; ui.sub = id; render(); break;
      case 'sd-dialog': ui.settingsField=id;ui.overlay='sd-dialog';renderOverlay();break;
      case 'sd-apps-tab': ui.settingsAppsTab=id;render();break;
      case 'sd-app-info': ui.settingsApp=id;ui.sub='app-info';render();break;
      case 'sd-data-app': ui.settingsApp=id;ui.sub='data-app';render();break;
      case 'sd-storage-open': if(id==='gallery'||id==='music')openApp(id);else{ui.sub=id;if(id==='apps')ui.settingsAppsTab='All';render();}break;
      case 'sd-battery-history': ui.sub='battery-history';render();break;
      case 'sd-battery-app': ui.batteryDetail=id;ui.sub='battery-detail';render();break;
      case 'sd-clear-cache': data.appCacheCleared=[...new Set([...(data.appCacheCleared||[]),ui.settingsApp])];save();render();break;
      case 'sd-clear-data': ui.overlay='sd-clear-data';renderOverlay();break;
      case 'sd-confirm-clear': clearAppData(ui.settingsApp);ui.overlay='';render();toast('App data cleared');break;
      case 'sd-force-stop': if(ui.settingsApp==='phone')ui.activeCall=null;if(ui.settingsApp==='music'){ui.music.playing=false;saveMusic();}ui.recent=ui.recent.filter(app=>app!==ui.settingsApp);delete ui.recentState?.[ui.settingsApp];delete ui.recentSnapshots[ui.settingsApp];toast('App stopped');break;
      case 'connectivity-menu': ui.connectivityMenu = id; ui.overlay = 'connectivity-menu'; renderOverlay(); break;
      case 'wifi-scan': ui.overlay = ''; renderOverlay(); toast('Scanning…'); break;
      case 'wifi-add': ui.overlay = 'wifi-add'; renderOverlay(); break;
      case 'bluetooth-rename': ui.overlay = 'bluetooth-rename'; renderOverlay(); break;
      case 'bluetooth-files': ui.overlay = 'bluetooth-files'; renderOverlay(); break;
      case 'bluetooth-confirm': data.settings.pairedDevice = data.settings.pairedDevice === ui.bluetoothTarget ? '' : ui.bluetoothTarget; save(); ui.overlay = ''; render(); break;
      case 'wifi-network': ui.wifiTarget = id; ui.overlay = 'wifi-dialog'; renderOverlay(); break;
      case 'wifi-connect': {
        const network = allWifiNetworks().find(item => item.name === ui.wifiTarget);
        if (network?.security !== 'Open' && !overlayRoot.querySelector('.wifi-password')?.value.trim()) { toast('Enter a password'); break; }
        data.settings.wifiNetwork = ui.wifiTarget; data.settings.wifi = true;
        save(); ui.overlay = ''; render(); break;
      }
      case 'wifi-forget': data.settings.wifiNetwork = ''; save(); ui.overlay = ''; render(); break;
      case 'bluetooth-scan': ui.bluetoothScanned = true; ui.overlay = ''; render(); break;
      case 'bluetooth-pair': ui.bluetoothTarget = id; ui.overlay = 'bluetooth-pair'; renderOverlay(); break;
      case 'set-language': i18n.setLanguage(id); location.reload(); break;
      case 'sx-dialog': if(id==='screen-lock'){lockControls.open();break;}ui.systemField=id;ui.systemError='';ui.systemValues=null;ui.overlay='sx-dialog';renderOverlay();break;
      case 'sx-vpn-new': ui.systemDraft={};ui.systemField='vpn-edit';ui.systemError='';ui.systemValues=null;ui.overlay='sx-dialog';renderOverlay();break;
      case 'sx-vpn-open': ui.systemId=id;ui.systemField='vpn-connect';ui.systemError='';ui.systemValues=null;ui.overlay='sx-dialog';renderOverlay();break;
      case 'sx-vpn-edit': ui.systemValues=null;ui.systemDraft=clone((data.vpnProfiles||[]).find(profile=>profile.id===ui.systemId)||{});ui.systemField='vpn-edit';renderOverlay();break;
      case 'sx-profile-delete': ui.systemDeleteKind=id;ui.systemField='profile-delete';renderOverlay();break;
      case 'sx-vpn-toggle': ui.vpnConnected=ui.vpnConnected===ui.systemId?null:ui.systemId;ui.overlay='';render();break;
      case 'sx-network-scan': ui.networkScanned=true;render();break;
      case 'sx-network-auto': data.settings.networkAuto=true;data.settings.networkOperator='Telekom';save();render();break;
      case 'sx-network-select': data.settings.networkAuto=false;data.settings.networkOperator=id;save();render();break;
      case 'sx-apn-new': ui.systemDraft={};ui.systemField='apn-edit';ui.systemError='';ui.systemValues=null;ui.overlay='sx-dialog';renderOverlay();break;
      case 'sx-apn-open': ui.systemDraft=clone((data.apnProfiles||[{id:'default',name:'Telekom',apn:'internet.telekom',mcc:'216',mnc:'30'}]).find(profile=>profile.id===id)||{});ui.systemField='apn-edit';ui.systemError='';ui.systemValues=null;ui.overlay='sx-dialog';renderOverlay();break;
      case 'sx-apn-select': data.settings.apnId=id;save();render();break;
      case 'toggle-setting': {
        const previousScroll = viewport.querySelector('.settings-app')?.scrollTop || 0;
        data.settings[id] = !data.settings[id];
        if(id==='autoTime')data.settings.timeOffset=0;
        if(id==='autoZone'&&!data.settings.autoZone)data.settings.timeZone=Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (id === 'airplane' && data.settings.airplane) { data.settings.wifi = false; data.settings.bluetooth = false; data.settings.wifiDirect = false; data.settings.portableHotspot = false;data.settings.bluetoothTether=false;ui.vpnConnected=null; }
        if(id==='portableHotspot'&&data.settings.portableHotspot)data.settings.wifi=false;
        if(id==='wifi'&&data.settings.wifi)data.settings.portableHotspot=false;
        if(id==='bluetoothTether'&&data.settings.bluetoothTether)data.settings.bluetooth=true;
        if(id==='bluetooth'&&!data.settings.bluetooth)data.settings.bluetoothTether=false;
        if (id === 'nfc' && !data.settings.nfc) data.settings.androidBeam = false;
        if (id === 'nfc' && data.settings.nfc) data.settings.androidBeam = true;
        save(); render(); const settingsView = viewport.querySelector('.settings-app'); if (settingsView) settingsView.scrollTop = previousScroll; break;
      }
      case 'wallpaper': data.wallpaper = Number(id); delete data.liveWallpaper; delete data.customWallpaper; delete data.customWallpaperPhoto; save(); if (ui.view === 'wallpaper-picker') home(false); else render(); toast('Wallpaper set'); break;
      case 'factory-reset': if (confirm(i18n.t('Reset all local ICS simulator data?'))) resetSimulator(); break;
      case 'about-tap':
        ui.aboutTapTimes = [...(ui.aboutTapTimes || []), performance.now()].slice(-3);
        if (ui.aboutTapTimes.length === 3 && ui.aboutTapTimes[2] - ui.aboutTapTimes[0] <= 500) { ui.sub = 'easter'; ui.easterNyan = false; ui.aboutTapTimes = []; render(); }
        break;
      case 'developer-tap': if (!data.settings.developerUnlocked && ++ui.buildTaps >= 7) { data.settings.developerUnlocked = true; save(); toast('Developer options unlocked'); } break;
      case 'egg-nyan': toast('Android 4.0: Ice Cream Sandwich'); break;
      case 'toast': toast(id); break;
      case 'noop': break;
      case 'browser-search': openApp('browser'); document.querySelector('.browser-toolbar input')?.focus(); break;
      case 'browser-link': navigateBrowser(url); break;
      case 'browser-back': browserBack(); break;
      case 'browser-forward': browserForward(); break;
      case 'browser-tabs': ui.sub = 'tabs'; render(); break;
      case 'browser-menu': ui.overlay = 'browser-menu'; renderOverlay(); break;
      case 'browser-bookmarks': ui.sub = 'bookmarks'; ui.overlay = ''; render(); break;
      case 'browser-bookmark': navigateBrowser(id); break;
      case 'browser-saved': ui.sub='saved'; ui.overlay=''; render(); break;
      case 'browser-save-page': data.savedPages ||= []; if(!data.savedPages.includes(ui.browserUrl))data.savedPages.push(ui.browserUrl); save(); ui.overlay=''; renderOverlay(); toast('Page saved'); break;
      case 'browser-remove-saved': if(ui.sub==='saved')data.savedPages=data.savedPages.filter(url=>url!==id); else data.bookmarks=data.bookmarks.filter(url=>url!==id); save(); render(); break;
      case 'browser-close-tab': ICSBrowserSession.close(ui.browserSession,Number(id)); saveBrowserState(); render(); break;
      case 'browser-refresh': ui.overlay=''; render(); break;
      case 'browser-find': ui.browserFind=''; ui.overlay=''; render(); viewport.querySelector('.web-find input')?.focus(); break;
      case 'browser-close-find': ui.browserFind=undefined; render(); break;
      case 'browser-history': ui.sub = 'history'; render(); break;
      case 'browser-tab': ui.browserSession.active = Number(id); ui.sub = ''; ui.browserFind = undefined; saveBrowserState(); render(); break;
      case 'browser-new-tab': if (!ICSBrowserSession.add(ui.browserSession)) { toast('Tab limit reached'); break; } ui.sub = ''; ui.overlay = ''; ui.browserFind = undefined; saveBrowserState(); render(); break;
      case 'browser-save': ui.overlay = ''; renderOverlay(); if (!data.bookmarks.includes(ui.browserUrl)) { data.bookmarks.push(ui.browserUrl); save(); toast('Bookmark saved'); } else toast('Already bookmarked'); break;
      case 'phone-tab': ui.phoneTab = id; ui.phoneSearch = undefined; if (id === 'contacts') { ui.view = 'people'; ui.sub = ''; } else if (ui.view === 'people') { ui.view = 'phone'; ui.sub = ''; } render(); break;
      case 'gbp-contact': ui.selectedContact = Number(id); ui.view = 'people'; ui.sub = 'detail'; render(); break;
      case 'gbp-voicemail': toast('Voicemail number not set'); break;
      case 'gbp-new-contact': ui.overlay = ''; openApp('people'); editPerson(true); break;
      case 'gbp-email': ui.overlay = ''; openApp('email'); break;
      case 'gbp-clear-log': ui.overlay = 'gb-dialog-clearlog'; renderOverlay(); break;
      case 'gbp-clear-log-ok': data.callHistory = []; ui.overlay = ''; save(); render(); break;
      case 'phone-search': ui.phoneTab = 'favorites'; ui.phoneSearch = ''; ui.overlay = ''; render(); viewport.querySelector('.phone-search input')?.focus(); break;
      case 'phone-menu': ui.overlay = 'phone-menu'; renderOverlay(); break;
      case 'phone-add-contact': openApp('people'); editPerson(true); ui.peopleDraft.phone=ui.dial; render(); break;
      case 'phone-redial': startPhoneCall(id); break;
      case 'dial': if (ui.dial.length < 30) ui.dial += id; if (ui.dial.endsWith('*#*#8477#*#*')) { ui.dial = ''; data.protips = {index: 0, set: 1 - (data.protips?.set || 0)}; save(); home(false); setTimeout(() => blinkTips(3), 300); break; } render(); break;
      case 'dial-delete': ui.dial = ui.dial.slice(0, -1); render(); break;
      case 'call': if(!ui.dial){toast('Enter a phone number');break;}startPhoneCall(ui.dial);break;
      case 'hangup': { const call=ui.activeCall; if(!call||call.endedAt)break; call.endedAt=Date.now(); call.keypad=false; render(); setTimeout(()=>{if(ui.activeCall===call&&ui.view==='phone')render();},GBPhone.HANGING_UP); setTimeout(()=>{if(ui.activeCall!==call)return; data.callHistory=[...(data.callHistory||[]),ICSPhoneCall.finish(call,call.endedAt)].slice(-50); ui.activeCall=null; ui.gbCallBackground=false; ui.gbAddCall=false; save(); if(ui.view==='phone'){ui.sub='';ui.dial='';render();} else renderStatus();},GBPhone.HANGING_UP+GBPhone.ENDED); break; }
      case 'gbp-add-call': if(!ui.activeCall)break; ui.gbCallBackground=true; ui.gbAddCall=true; ui.phoneTab='dialpad'; ui.view='phone'; ui.sub=''; ui.dial=''; render(); break;
      case 'gbp-dtmf': if(!ui.activeCall)break; ui.gbCallBackground=false; ui.gbAddCall=false; ui.activeCall.keypad=GBPhone.callState(ui.activeCall)==='active'; ui.view='phone'; render(); break;
      case 'gbp-return-call': if(!ui.activeCall)break; ui.overlay=''; ui.gbCallBackground=false; ui.gbAddCall=false; captureRecentView(); ui.view='phone'; ui.sub='calling'; ui.recent=['phone',...ui.recent.filter(id=>id!=='phone')].slice(0,7); render(); break;
      case 'incall-toggle': if(ui.activeCall&&!ui.activeCall.endedAt){ui.activeCall[id]=!ui.activeCall[id];if(id==='hold')ui.activeCall.keypad=false;}render();renderStatus();break;
      case 'incall-digit': if(ui.activeCall)ui.activeCall.digits=(ui.activeCall.digits+id).slice(-24);render();break;
      case 'phone-log-detail': ui.phoneCallId=Number(id);ui.sub='call-detail';render();break;
      case 'phone-log-back': ui.sub='';ui.phoneTab='history';render();break;
      case 'phone-log-message': { const recipient=ICSMessaging.recipient(id,data.contacts); if(recipient)openMessageThread(recipient.key);else toast('Enter a valid phone number');break; }
      case 'people-tab': ui.peopleTab=id; ui.sub=''; ui.peopleQuery=''; ui.peopleSearching=false; render(); break;
      case 'people-search': ui.peopleTab='all'; ui.peopleSearching=true; render(); viewport.querySelector('.people-search input')?.focus(); break;
      case 'people-edit': editPerson(); break;
      case 'people-menu': ui.overlay='people-menu'; renderOverlay(); break;
      case 'people-star': { const person=contact(ui.selectedContact); if(person)person.favorite=!person.favorite; save(); render(); break; }
      case 'people-delete': ui.overlay='people-delete'; renderOverlay(); break;
      case 'people-confirm-delete': ICSPeople.remove(data,ui.selectedContact); save(); ui.sub=''; ui.overlay=''; render(); break;
      case 'people-group': ui.peopleGroup=id; ui.sub='group'; ui.peopleQuery=''; render(); break;
      case 'people-new-group': ui.peopleEditGroup=''; ui.overlay='people-group'; renderOverlay(); break;
      case 'people-edit-group': ui.peopleEditGroup=ui.peopleGroup; ui.overlay='people-group'; renderOverlay(); break;
      case 'contact': ui.selectedContact = Number(id); ui.sub = 'detail'; render(); break;
      case 'new-contact': editPerson(true); break;
      case 'contact-call': startPhoneCall(contact(id)?.phone||'');break;
      case 'contact-message': openMessageThread(id); break;
      case 'contact-email': {const recipient=contact(id)?.email||'';openApp('email');composeEmail(null,false,recipient);break;}
      case 'thread': openMessageThread(id); break;
      case 'mms-search': ui.sub = 'search'; ui.overlay = ''; ui.mmsSearch = ''; render(); viewport.querySelector('.mms-search input')?.focus(); break;
      case 'mms-menu': case 'mms-attach': case 'mms-smiley': ui.overlay = action; renderOverlay(); break;
      case 'mms-recipient': { const person = contact(id); if (person) { messageDraft().recipient = person.phone; save(); render(); viewport.querySelector('.mms-compose textarea').focus(); } break; }
      case 'mms-call': {const person=ICSMessaging.identity(ui.thread,data.contacts);startPhoneCall(person.phone);break;}
      case 'mms-photo': { const photo = data.photos.find(p => p.id === Number(id)); if (photo) { messageDraft().attachment = clone(photo); messageDraft().updated = Date.now(); save(); ui.overlay = ''; render(); scrollMessages(); } break; }
      case 'mms-remove-attachment': delete messageDraft().attachment; save(); render(); scrollMessages(); break;
      case 'mms-insert-smiley': messageDraft().body = ((messageDraft().body || '') + ' ' + id).trim().slice(0,2000); messageDraft().updated = Date.now(); save(); ui.overlay = ''; render(); scrollMessages(); break;
      case 'mms-discard': delete data.messageDrafts?.[ICSMessaging.draftKey(ui)]; save(); ui.overlay = ''; render(); scrollMessages(); break;
      case 'mms-message': ui.mmsMessage = id; ui.overlay = 'mms-message'; renderOverlay(); break;
      case 'mms-details': ui.overlay = 'mms-details'; renderOverlay(); break;
      case 'mms-forward': { const message = data.messages.find(m => String(m.id) === String(ui.mmsMessage)); if (!message) break; ui.sub = 'new'; Object.assign(messageDraft(),{body:message.body,recipient:'',attachment:message.attachment ? clone(message.attachment) : null,updated:Date.now()}); save(); ui.overlay = ''; render(); break; }
      case 'mms-delete-thread': case 'mms-delete-message': ui.mmsDelete = action === 'mms-delete-thread' ? 'thread' : 'message'; ui.overlay = 'mms-delete-confirm'; renderOverlay(); break;
      case 'mms-confirm-delete': {
        data.messages = data.messages.filter(m => ui.mmsDelete === 'thread' ? String(m.contact) !== String(ui.thread) : String(m.id) !== String(ui.mmsMessage));
        if (ui.mmsDelete === 'thread') { delete data.messageDrafts?.[String(ui.thread)]; ui.sub = ''; }
        save(); ui.overlay = ''; render(); break;
      }
      case 'new-message': ui.sub = 'new'; ui.overlay = ''; render(); viewport.querySelector('[name=recipient]')?.focus(); break;
      case 'gallery-camera': openApp('camera'); break;
      case 'gallery-album': ui.galleryAlbum=id; ui.sub='album';ui.gallerySlideshow=false;render();break;
      case 'photo': ui.selectedPhoto=Number(id);ui.galleryAlbum=ICSMedia.album(data.photos.find(p=>p.id===Number(id))||{});ui.sub='photo';ui.galleryZoom=false;render();break;
      case 'gallery-step': galleryStep(Number(id));break;
      case 'gallery-photo-zoom': ui.galleryZoom=!ui.galleryZoom;render();break;
      case 'gallery-menu': case 'gallery-share': case 'gallery-details': ui.overlay=action;renderOverlay();break;
      case 'gallery-rotate': {const photo=data.photos.find(p=>p.id===ui.selectedPhoto);if(photo)photo.rotation=((photo.rotation||0)+Number(id)+360)%360;save();ui.overlay='';render();break;}
      case 'gallery-slideshow': {const items=ICSMedia.photos(data,ui.galleryAlbum);if(!items.length)break;if(ui.sub!=='photo')ui.selectedPhoto=items[0].id;ui.sub='photo';ui.overlay='';ui.gallerySlideshow=true;ui.gallerySlideAt=Date.now();render();break;}
      case 'gallery-stop': ui.gallerySlideshow=false;render();break;
      case 'gallery-share-message': {const photo=data.photos.find(p=>p.id===ui.selectedPhoto);if(!photo)break;openApp('messaging');ui.sub='new';messageDraft().attachment=clone(photo);save();render();break;}
      case 'photo-delete': ui.selectedPhoto=Number(id);ui.overlay='gallery-delete';renderOverlay();break;
      case 'gallery-confirm-delete': {
        const items=ICSMedia.photos(data,ui.galleryAlbum);const index=items.findIndex(p=>p.id===ui.selectedPhoto);
        data.photos=data.photos.filter(p=>p.id!==ui.selectedPhoto);save();ui.overlay='';
        const remaining=ICSMedia.photos(data,ui.galleryAlbum);if(remaining.length)ui.selectedPhoto=remaining[Math.min(index,remaining.length-1)].id;else ui.sub='album';
        render();toast('Photo deleted');break;
      }
      case 'photo-wallpaper': {const photo=data.photos.find(p=>p.id===Number(id));if(!photo)break;data.wallpaper=99;delete data.liveWallpaper;data.customWallpaper=photo.colors;data.customWallpaperPhoto=clone(photo);save();ui.overlay='';render();toast('Wallpaper set');break;}
      case 'shoot': {
        const photo={...ICSMedia.scene(data),id:Date.now(),name:`IMG_${new Date().toISOString().replace(/[-:T]/g,'').slice(0,14)}`,album:'camera',created:Date.now()};
        data.photos.unshift(photo);save();render();screen.animate([{opacity:1},{opacity:.4},{opacity:1}],{duration:240});toast('Photo saved to Gallery');break;
      }
      case 'camera-review': {const photo=ICSMedia.photos(data,'camera')[0];openApp('gallery');if(photo){ui.galleryAlbum='camera';ui.selectedPhoto=photo.id;ui.sub='photo';render();}break;}
      case 'camera-focus': {const preview=viewport.querySelector('.camera-focus-area');preview.classList.remove('focusing');void preview.offsetWidth;preview.classList.add('focusing');break;}
      case 'camera-flip': data.cameraSettings=ICSMedia.settings(data);data.cameraSettings.front=!data.cameraSettings.front;save();render();break;
      case 'camera-flash': {data.cameraSettings=ICSMedia.settings(data);const choices=['auto','off','on'];data.cameraSettings.flash=choices[(choices.indexOf(data.cameraSettings.flash)+1)%3];save();render();toast(i18n.t('Flash')+': '+i18n.t(data.cameraSettings.flash==='auto'?'Auto':data.cameraSettings.flash==='on'?'On':'Off'));break;}
      case 'camera-options': case 'camera-balance': ui.overlay=action;renderOverlay();break;
      case 'camera-set-balance': data.cameraSettings=ICSMedia.settings(data);data.cameraSettings.balance=id;save();ui.overlay='';render();break;
      case 'camera-exposure': data.cameraSettings=ICSMedia.settings(data);data.cameraSettings.exposure=Number(id);save();ui.overlay='';render();break;
      case 'calendar-prev': calendarMove(-1); break;
      case 'calendar-next': calendarMove(1); break;
      case 'calendar-day': ui.selectedDate=id;ui.calendarMode=data.calendarMode='Day';save();calendarRender();break;
      case 'calendar-today': ui.selectedDate=today();calendarRender();break;
      case 'calendar-views': case 'calendar-menu': ui.overlay=action;renderOverlay();break;
      case 'calendar-mode': ui.calendarMode=data.calendarMode=id;save();ui.calendarSearch=undefined;ui.overlay='';calendarRender();break;
      case 'calendar-search': ui.calendarMode='Agenda';ui.calendarSearch='';ui.overlay='';render();viewport.querySelector('.cal-search input').focus();break;
      case 'calendar-slot': {const [date,time]=id.split('|');calendarEdit({date,time,title:''});break;}
      case 'event-new': calendarEdit();break;
      case 'event-open': ui.selectedEvent=Number(id);ui.selectedInstance=button.dataset.date||'';ui.sub='event';render();break;
      case 'event-edit': { const series=data.events.find(item=>item.id===ui.selectedEvent); if(series&&ICSCalendar.normalize(series).repeat!=='none'){ui.overlay='calendar-edit-scope';renderOverlay();} else calendarEdit(series); break; }
      case 'event-edit-scope': { const series=data.events.find(item=>item.id===ui.selectedEvent); if(!series)break; const item=ICSCalendar.instance(series,ui.selectedInstance); calendarEdit({...series,date:item.date,endDate:item.endDate,...(id==='this'?{repeat:'none'}:{})}); ui.eventDraft.scope=id; ui.eventDraft.instance=item.date; ui.eventDraft.seriesStart=item.seriesStart; render(); break; }
      case 'event-delete-scope': deleteEventScope(id); break;
      case 'event-cancel': ui.sub=ui.eventDraft?.id?'event':'';ui.eventDraft=null;calendarRender();break;
      case 'event-delete': ui.overlay=ICSCalendar.normalize(data.events.find(item=>item.id===ui.selectedEvent)||{}).repeat!=='none'?'calendar-delete-scope':'calendar-delete';renderOverlay();break;
      case 'event-confirm-delete': data.events=data.events.filter(item=>item.id!==ui.selectedEvent);save();ui.overlay='';ui.sub='';calendarRender();break;
      case 'clock-alarms': ui.sub='alarms'; render(); break;
      case 'clock-dim': ui.clockDim=!ui.clockDim; render(); break;
      case 'alarm-new': editAlarm(); break;
      case 'alarm-edit': editAlarm(id); break;
      case 'alarm-cancel': ui.alarmDraft=null; ui.sub='alarms'; render(); break;
      case 'alarm-draft-toggle': ui.alarmDraft[id]=!ui.alarmDraft[id]; render(); break;
      case 'alarm-field': ui.overlay='clock-'+id; renderOverlay(); break;
      case 'alarm-time-step': {
        const [field,step]=id.split(':'); const input=overlayRoot.querySelector(`[name="${field}"]`);
        const count=field==='hour'?24:60; input.value=String(((Number(input.value)||0)+Number(step)+count)%count).padStart(2,'0'); break;
      }
      case 'alarm-save': {
        const alarm=ICSDeskClock.normalize(ui.alarmDraft); delete alarm.snoozedUntil; delete alarm.lastFiredMinute;
        const index=data.alarms.findIndex(item=>item.id===alarm.id);
        if(index<0){alarm.id=Date.now();data.alarms.push(alarm);}else data.alarms[index]=alarm;
        save(); ui.alarmDraft=null; ui.sub='alarms'; render(); toast('Alarm set'); break;
      }
      case 'alarm-delete': ui.overlay='clock-delete'; renderOverlay(); break;
      case 'alarm-confirm-delete': data.alarms=data.alarms.filter(alarm=>alarm.id!==ui.alarmDraft.id); save(); ui.alarmDraft=null; ui.overlay=''; ui.sub='alarms'; render(); break;
      case 'alarm-snooze': {
        const alarm=data.alarms.find(item=>item.id===ui.ringingAlarm.id);
        if(alarm){alarm.enabled=true;alarm.snoozedUntil=deviceDate().getTime()+10*60000;save();}
        ui.overlay='';render();toast('Snoozing for 10 minutes');break;
      }
      case 'alarm-dismiss': ui.overlay=''; render(); break;
      case 'alarm-toggle': { const alarm = data.alarms.find(item => item.id === Number(id)); if (alarm) { alarm.enabled = !alarm.enabled; delete alarm.snoozedUntil; } save(); render(); break; }
      case 'calc-menu': ui.overlay = 'calc-menu'; renderOverlay(); break;
      case 'calc-panel': ui.overlay = ''; renderOverlay(); setCalculatorPanel(Number(id)); break;
      case 'calc-clear': data.calcHistory = []; ui.calcHistoryIndex = -1; save(); operateCalculator('C'); ui.overlay = ''; render(); break;
      case 'calc-key': operateCalculator(id); render(); break;
      case 'music-play': ui.music.playing=!ui.music.playing;if(ui.music.playing&&ui.music.position>=tracks[ui.music.track].duration)ui.music.position=0;saveMusic();render();break;
      case 'music-prev': case 'music-next': ICSMusic.step(ui.music,action==='music-prev'?-1:1);saveMusic();render();break;
      case 'music-tab': ui.musicTab=id;ui.sub='';render();break;
      case 'music-library': ui.sub='';render();break;
      case 'music-player': ui.sub='player';render();break;
      case 'music-queue': ui.sub='queue';render();break;
      case 'music-group': ui.musicGroup=id;ui.sub='music-group';render();break;
      case 'music-select': ui.music.queue=[...ICSMusic.listing(ui.music,ui)];ui.music.track=Number(id);ui.music.position=0;ui.music.playing=true;saveMusic();ui.sub='player';render();break;
      case 'music-shuffle': ui.music.shuffle=!ui.music.shuffle;saveMusic();render();break;
      case 'music-repeat': ui.music.repeat={off:'all',all:'one',one:'off'}[ui.music.repeat];saveMusic();render();break;
      case 'music-track-menu': ui.musicSelected=Number(id);ui.overlay='music-track-menu';renderOverlay();break;
      case 'music-add-to-playlist': ui.overlay='music-playlist-choice';renderOverlay();break;
      case 'music-new-playlist': ui.musicAddPending=id==='add';ui.overlay='music-new-playlist';renderOverlay();break;
      case 'music-add-confirm': {const playlist=ui.music.playlists.find(p=>String(p.id)===id);if(playlist&&!playlist.tracks.includes(ui.musicSelected))playlist.tracks.push(ui.musicSelected);saveMusic();ui.overlay='';render();toast('Added to playlist');break;}
      case 'music-remove-from-playlist': {const playlist=ui.music.playlists.find(p=>String(p.id)===ui.musicGroup);if(playlist)playlist.tracks=playlist.tracks.filter(track=>track!==ui.musicSelected);saveMusic();ui.overlay='';render();break;}
      case 'email-read': {const item=data.mailbox.find(item=>item.id===id);if(!item)break;ui.emailId=id;item.read=true;ui.sub=item.folder==='Drafts'?'compose':'read';ui.emailError='';save();render();break;}
      case 'email-compose': composeEmail();break;
      case 'email-reply': case 'email-forward': composeEmail(data.mailbox.find(item=>item.id===ui.emailId),action==='email-forward');break;
      case 'email-list': ui.sub='';ui.overlay='';ui.emailSelected=[];render();break;
      case 'email-folders': case 'email-menu': ui.overlay=action;renderOverlay();break;
      case 'email-folder': ui.emailFolder=id;ui.sub='';ui.emailQuery=undefined;ui.emailSelected=[];ui.overlay='';render();break;
      case 'email-star': {const item=data.mailbox.find(item=>item.id===id);if(item)item.starred=!item.starred;save();render();break;}
      case 'email-select': ui.emailSelected ||= [];ui.emailSelected=ui.emailSelected.includes(id)?ui.emailSelected.filter(key=>key!==id):[...ui.emailSelected,id];render();break;
      case 'email-clear-selection': ui.emailSelected=[];render();break;
      case 'email-trash': case 'email-selected-trash': ICSEmail.trash(data.mailbox,action==='email-trash'?[ui.emailId]:ui.emailSelected||[]);ui.sub='';ui.emailSelected=[];save();render();break;
      case 'email-restore': case 'email-selected-restore': {const ids=action==='email-restore'?[ui.emailId]:ui.emailSelected||[];data.mailbox.filter(item=>ids.includes(item.id)).forEach(ICSEmail.untrash);ui.sub='';ui.emailSelected=[];save();render();break;}
      case 'email-selected-read': data.mailbox.filter(item=>(ui.emailSelected||[]).includes(item.id)).forEach(item=>item.read=true);ui.emailSelected=[];save();render();break;
      case 'email-unread': {const item=data.mailbox.find(item=>item.id===ui.emailId);if(item)item.read=false;ui.sub='';ui.overlay='';save();render();break;}
      case 'email-search': ui.emailQuery='';render();viewport.querySelector('.email-search input').focus();break;
      case 'email-refresh': toast('Local mailbox is up to date');break;
      case 'email-cc': ui.emailCc=true;ui.overlay='';render();break;
      case 'email-attach': ui.overlay='email-attach';renderOverlay();break;
      case 'email-attach-photo': {const item=data.mailbox.find(item=>item.id===ui.emailId),photo=data.photos.find(photo=>photo.id===Number(id));if(item&&photo)item.attachment=clone(photo);ui.overlay='';save();render();break;}
      case 'email-remove-attachment': {const item=data.mailbox.find(item=>item.id===ui.emailId);if(item)delete item.attachment;save();render();break;}
      case 'email-discard': ui.overlay='email-discard';renderOverlay();break;
      case 'email-confirm-discard': ICSEmail.trash(data.mailbox,[ui.emailId]);ui.sub='';ui.overlay='';save();render();break;
      default: break;
    }
  });

  document.addEventListener('submit', event => {
    const form = event.target.closest('[data-form]');
    if (!form || !screen.contains(form)) return;
    event.preventDefault(); const values = new FormData(form);
    if(form.dataset.form==='folder-name'){event.target.querySelector('input')?.blur();render();return;}
    if(form.dataset.form==='sx-save'){ui.systemError=ICSSystemSettings.submit(data,ui,values);if(ui.systemError){ui.systemValues=Object.fromEntries(values);renderOverlay();return;}save();ui.overlay='';render();return;}
    if(form.dataset.form==='sx-vpn-connect'){ui.vpnConnected=ui.vpnConnected===ui.systemId?null:ui.systemId;ui.overlay='';render();return;}
    if(form.dataset.form==='sx-profile-delete'){ICSSystemSettings.removeProfile(data,ui);save();ui.overlay='';render();return;}
    if (form.dataset.form === 'play-search') { ui.play.query = String(values.get('query') || '').trim(); render(); return; }
    if (form.dataset.form === 'phone-search') { ui.phoneSearch = String(values.get('query') || '').trim(); render(); return; }
    if (form.dataset.form === 'wifi-add') {
      const name = String(values.get('ssid') || '').trim();
      const security = values.get('security');
      if (!name) return;
      if (security !== 'Open' && String(values.get('password') || '').length < 8) { toast('Password must have at least 8 characters'); return; }
      data.savedWifiNetworks ||= [];
      if (!allWifiNetworks().some(network => network.name === name)) data.savedWifiNetworks.push({name, security, strength:4});
      data.settings.wifiNetwork = name;
      save(); ui.overlay = ''; render(); return;
    }
    if (form.dataset.form === 'bluetooth-rename') {
      const name = String(values.get('name') || '').trim();
      if (!name) return;
      data.settings.bluetoothName = name;
      save(); ui.overlay = ''; render(); return;
    }
    switch (form.dataset.form) {
      case 'browser-find': ui.browserFind=String(values.get('query')||'').trim(); render(); break;
      case 'people-search': ui.peopleQuery=String(values.get('query')||'').trim(); render(); break;
      case 'people-save': {
        const name=String(values.get('name')||'').trim(); if(!name)return;
        const id=ui.sub==='edit'?ui.selectedContact:Date.now();
        const person=contact(id)||{id};
        for(const key of ['name','phone','email','company','notes'])person[key]=String(values.get(key)||'').trim();
        if(!contact(id))data.contacts.push(person);
        const groups=values.getAll('groups');
        data.contactGroups.forEach(g=>{g.members=g.members.filter(member=>member!==id);if(groups.includes(g.id))g.members.push(id);});
        save();ui.selectedContact=id;ui.sub='detail';ui.peopleDraft=null;render();toast('Contact saved');break;
      }
      case 'people-group': {
        const name=String(values.get('name')||'').trim();if(!name)return;
        const group=data.contactGroups.find(g=>g.id===ui.peopleEditGroup)||{id:'group-'+Date.now()};
        group.name=name;group.members=values.getAll('members').map(Number).filter(id=>!!contact(id));
        if(!data.contactGroups.some(g=>g.id===group.id))data.contactGroups.push(group);
        save();ui.peopleGroup=group.id;ui.peopleTab='groups';ui.sub='group';ui.overlay='';render();break;
      }
      case 'address': navigateBrowser(values.get('address')); break;
      case 'web-search': navigateBrowser(`search:${values.get('query')}`); break;
      case 'mms-search': ui.mmsSearch = String(values.get('query') || '').trim(); render(); break;
      case 'mms-send': {
        const target = ui.sub === 'thread' ? {key:ui.thread} : ICSMessaging.recipient(values.get('recipient'),data.contacts);
        if (!target) { toast('Enter a contact name or valid phone number'); return; }
        sendMessage(target.key, String(values.get('body') || '').trim(), messageDraft().attachment); break;
      }
      case 'contact': {
        const name = String(values.get('name')).trim(), phone = String(values.get('phone')).trim(), email = String(values.get('email')).trim();
        if (!name || !phone) return;
        const id = Date.now(); data.contacts.push({ id, name, phone, email }); save(); ui.selectedContact = id; ui.sub = 'detail'; render(); toast('Contact saved'); break;
      }
      case 'event': {
        const event={...ui.eventDraft,id:ui.eventDraft?.id || Date.now(),title:String(values.get('title')||'').trim(),date:String(values.get('date')),time:String(values.get('time')),endDate:String(values.get('endDate')),endTime:String(values.get('endTime')),allDay:values.has('allDay'),location:String(values.get('location')||'').trim(),description:String(values.get('description')||'').trim()};
        ui.eventDraft=event;
        if(!ICSCalendar.valid(event)){ui.calendarError='End must be after start';render();return;}
        event.repeat=String(values.get('repeat')||'none');event.reminder=Number(values.get('reminder')??-1);
        const {scope,instance,seriesStart}=event;delete event.scope;delete event.instance;delete event.seriesStart;
        const existing=data.events.findIndex(item=>item.id===event.id);
        if(scope&&existing>=0){
          const series=data.events[existing];
          if(scope==='this'){series.exdates=[...new Set([...(series.exdates||[]),instance])];event.id=Date.now();delete event.exdates;delete event.until;data.events.push(event);}
          else if(scope==='future'&&instance!==seriesStart){series.until=ICSCalendar.plus(instance,-1);event.id=Date.now();delete event.exdates;delete event.until;data.events.push(event);}
          else {const shift=Math.round((ICSCalendar.parse(event.date)-ICSCalendar.parse(instance))/864e5),span=Math.round((ICSCalendar.parse(event.endDate)-ICSCalendar.parse(event.date))/864e5);event.date=ICSCalendar.plus(seriesStart,shift);event.endDate=ICSCalendar.plus(event.date,span);data.events[existing]=event;}
        } else if(existing<0)data.events.push(event);else data.events[existing]=event;
        save();ui.selectedDate=event.date;ui.selectedEvent=event.id;ui.selectedInstance=scope&&scope!=='all'?event.date:instance||'';ui.eventDraft=null;ui.sub='event';render();toast('Event saved');break;
      }
      case 'calendar-search': ui.calendarSearch=String(values.get('query')||'').trim();render();break;
      case 'music-playlist': {const name=String(values.get('name')||'').trim();if(!name)return;ui.music.playlists.push({id:Date.now(),name,tracks:ui.musicAddPending?[ui.musicSelected]:[]});saveMusic();ui.overlay='';render();break;}
      case 'alarm-time': ui.alarmDraft.time=String(values.get('hour')).padStart(2,'0')+':'+String(values.get('minute')).padStart(2,'0'); ui.overlay='';render();break;
      case 'alarm-days': ui.alarmDraft.days=values.getAll('days').map(Number);ui.overlay='';render();break;
      case 'alarm-tone': ui.alarmDraft.tone=String(values.get('tone'));ui.overlay='';render();break;
      case 'alarm-label': ui.alarmDraft.label=String(values.get('label')||'').trim();ui.overlay='';render();break;
      case 'email': {const item=data.mailbox.find(item=>item.id===ui.emailId);if(!item)break;for(const key of ['to','cc','bcc','subject','body'])if(values.has(key))item[key]=String(values.get(key)).trim();if(!ICSEmail.send(item)){ui.emailError='Enter valid email addresses';save();render();break;}save();ui.emailFolder='Sent';ui.emailQuery=undefined;ui.sub='read';ui.emailError='';render();toast('Demo email sent');break;}
      case 'email-search': ui.emailQuery=String(values.get('query')||'').trim();ui.emailSelected=[];render();break;
      case 'sd-volumes': for(const key of ['mediaVolume','ringVolume','alarmVolume'])data.settings[key]=Math.max(0,Math.min(100,Number(values.get(key))));save();ui.overlay='';render();break;
      case 'sd-choice': {const choice=String(values.get('choice'));if(ui.settingsField==='sleep')data.settings.sleep=Number(choice);else if(['windowScale','transitionScale'].includes(ui.settingsField))data.settings[ui.settingsField]=Number(choice);else if(ui.settingsField==='font')data.settings.largeText=choice==='large';else if(ui.settingsField==='silent'){data.settings.silent=choice!=='off';data.settings.silentMode=choice;}else data.settings[ui.settingsField]=choice;save();ui.overlay='';render();break;}
      default: break;
    }
  });
  document.addEventListener('input', event => {
    if(event.target.closest('[data-form="folder-name"]')){const folder=ICSLauncherFolders.folder(data,ui.folderId);if(folder){folder.name=event.target.value.slice(0,40);save();for(const button of viewport.querySelectorAll('[data-folder-id]'))if(button.dataset.folderId===ui.folderId){button.setAttribute('aria-label',folderName(ui.folderId));button.lastElementChild.textContent=folderName(ui.folderId);}}return;}
    if(event.target.dataset.field==='data-cycle'){ui.dataCycle=event.target.value;render();return;}
    if(event.target.closest('.email-compose')&&event.target.name){const item=data.mailbox.find(item=>item.id===ui.emailId);if(item){item[event.target.name]=event.target.value;save();}return;}
    if(event.target.closest('.cal-editor') && event.target.name) {
      ui.eventDraft[event.target.name]=event.target.type==='checkbox'?event.target.checked:event.target.value;
      return;
    }
    if(event.target.matches('.camera-zoom input')) {
      data.cameraSettings=ICSMedia.settings(data);data.cameraSettings.zoom=Number(event.target.value);save();
      viewport.querySelector('.camera-focus-area .media-photo').src=ICSMedia.image(ICSMedia.scene(data));
      viewport.querySelector('.camera-zoom output').textContent=Number(event.target.value).toFixed(1)+'×';return;
    }
    if(event.target.closest('#people-editor')) {
      if(event.target.name==='groups')ui.peopleDraft.groups=[...viewport.querySelectorAll('[name=groups]:checked')].map(input=>input.value);
      else ui.peopleDraft[event.target.name]=event.target.value;
      return;
    }
    if (event.target.closest('.mms-compose')) {
      const draft = messageDraft();
      if (event.target.name === 'body') draft.body = event.target.value;
      if (event.target.name === 'recipient') {
        draft.recipient = event.target.value;
        const query = draft.recipient.trim().toLocaleLowerCase();
        viewport.querySelector('.mms-suggestions').innerHTML = query ? data.contacts.filter(p => `${p.name} ${p.phone}`.toLocaleLowerCase().includes(query)).slice(0,5).map(p => `<button type="button" data-action="mms-recipient" data-id="${p.id}">${safe(p.name)}<small>${safe(p.phone)}</small></button>`).join('') : '';
      }
      draft.updated = Date.now(); save();
      const count = ICSMessaging.counter(draft.body || '');
      viewport.querySelector('.mms-counter').textContent = draft.attachment ? 'MMS' : count.count > 1 || count.remaining < 10 ? `${count.remaining} / ${count.count}` : '';
      viewport.querySelector('.mms-send').disabled = !(draft.body || '').trim() && !draft.attachment;
      if (event.target.name === 'body') { event.target.style.height = '44px'; event.target.style.height = `${Math.min(88,event.target.scrollHeight)}px`; }
      return;
    }
    if (event.target.dataset.field === 'brightness') {
      data.settings.brightness = Number(event.target.value); save();
      const display = event.target.closest('.detail-pad')?.querySelector('p'); if (display) display.textContent = `${data.settings.brightness}%`;
      screen.style.filter = `brightness(${.5 + data.settings.brightness / 135})`;
    }
    if(event.target.dataset.field==='music-position'){ui.music.position=Number(event.target.value);saveMusic();const elapsed=viewport.querySelector('.music-elapsed');if(elapsed)elapsed.textContent=ICSMusic.time(ui.music.position);}
  });

  let pointerStart = null, eggTimer = null, dragTimer = null, dragState = null;
  function dragSource(target) {
    const homeWidget = target.closest('.home-widget[data-widget-id]');
    if (homeWidget) {
      const widget = data.homeWidgets[ui.page].find(item => item.id === homeWidget.dataset.widgetId);
      return widget ? { type: 'widget', id: widget.id, widgetType: widget.type, page: ui.page } : null;
    }
    const drawerWidget = target.closest('.drawer-widget[data-widget-type]');
    if (drawerWidget) return { type: 'drawer-widget', widgetType: drawerWidget.dataset.widgetType };
    const icon = target.closest('.launcher-icon');
    if (!icon) return null;
    const folderSlot=icon.closest('[data-folder-slot]');
    if(folderSlot&&ui.overlay==='folder')return {type:'folder',folderId:ui.folderId,slot:Number(folderSlot.dataset.folderSlot),id:icon.dataset.app};
    const homeSlot = icon.closest('[data-home-slot]');
    if (homeSlot) return { type: 'home', slot: Number(homeSlot.dataset.homeSlot), page: ui.page, id: data.homePages[ui.page][Number(homeSlot.dataset.homeSlot)] };
    const dockSlot = icon.closest('[data-dock-slot]');
    if (dockSlot && Number(dockSlot.dataset.dockSlot) !== 2) return { type: 'dock', slot: Number(dockSlot.dataset.dockSlot), id: data.dock[Number(dockSlot.dataset.dockSlot)] };
    if (icon.closest('.drawer-apps')) return { type: 'drawer', id: icon.dataset.app };
    return null;
  }
  function startDrag(x, y) {
    if (!pointerStart?.source || dragState) return;
    // Keep touch delivery on the stable screen when a drawer item replaces its view.
    try { screen.setPointerCapture(pointerStart.pointerId); } catch {}
    dragState = pointerStart.source;
    // Workspace.startDrag hides the original view (GONE) while its DragView moves.
    pointerStart.target.closest('.launcher-icon')?.classList.add('drag-source-icon');
    if (dragState.type === 'widget') pointerStart.target.closest('.home-widget')?.classList.add('drag-source-widget');
    if (dragState.type === 'widget') {
      const rect = pointerStart.target.closest('.home-widget').getBoundingClientRect();
      dragState.grabOffset = {x: pointerStart.x - rect.left, y: pointerStart.y - rect.top};
    }
    if (dragState.type === 'drawer' || dragState.type === 'drawer-widget') { ui.view = 'home'; ui.overlay = ''; render(); }
    if (dragState.type === 'drawer-widget') {
      const rect = viewport.querySelector('.home-grid:not([inert])').getBoundingClientRect();
      const size = widgetSize(dragState.widgetType);
      dragState.grabOffset = {x: (rect.width - 12) / 4 * size.width / 2, y: (rect.height - 5) / 4 * size.height / 2};
    }
    const ghost = document.createElement('div'); ghost.className = `drag-ghost${dragState.widgetType ? ' widget-ghost' : ''}`; ghost.innerHTML = dragState.widgetType ? widgetArt(dragState.widgetType) : appIcon(dragState.id); screen.append(ghost);
    // Launcher2 drags a widget at its real span: a live copy when moving, the preview image when adding.
    if (dragState.widgetType && dragState.grabOffset) {
      const source = dragState.type === 'widget' ? pointerStart.target.closest('.home-widget') : null;
      const grid = viewport.querySelector('.home-grid:not([inert])')?.getBoundingClientRect(), size = widgetSize(dragState.widgetType);
      const box = source ? source.getBoundingClientRect() : grid && {width: (grid.width - 12) / 4 * size.width, height: (grid.height - 5) / 4 * size.height};
      if (box) { ghost.classList.add('widget-span-ghost', `widget-${dragState.widgetType}`); ghost.style.width = `${box.width}px`; ghost.style.height = `${box.height}px`; }
      if (source) { ghost.innerHTML = source.innerHTML; ghost.querySelectorAll('button,[tabindex]').forEach(node => node.setAttribute('tabindex', '-1')); }
    }
    dragState.ghost = ghost;
    if (!dragState.widgetType && !reducedMotion?.matches) ICSTransitions.play(ghost, ICSTransitions.specs['drag-lift'].enter);
    moveGhost(x, y);
    screen.classList.add('dragging');
    screen.classList.toggle('dragging-from-drawer', dragState.type === 'drawer');
    suppressClickUntil = Date.now() + 500;
  }
  function moveGhost(x, y) {
    if (!dragState) return;
    const rect = screen.getBoundingClientRect();
    const offset = dragState.widgetType ? 65 : 27, grab = dragState.ghost.classList.contains('widget-span-ghost') ? dragState.grabOffset : null;
    dragState.ghost.style.left = `${x - rect.left - (grab ? grab.x : offset)}px`;
    dragState.ghost.style.top = `${y - rect.top - (grab ? grab.y : offset)}px`;
    updateFolderDrag(x,y);
    updateDragOutline(x, y);
    const dropTarget = document.elementFromPoint(x, y)?.closest('[data-drop-remove],[data-drop-info]');
    const removeHover = !!dropTarget?.hasAttribute('data-drop-remove'), infoHover = !!dropTarget?.hasAttribute('data-drop-info') && dragState.type === 'drawer';
    screen.querySelectorAll('.drop-target').forEach(node => node.classList.toggle('drop-hover', node === dropTarget && (removeHover || infoHover)));
    dragState.ghost.classList.toggle('tint-delete', removeHover);
    dragState.ghost.classList.toggle('tint-info', infoHover);
    const direction = ui.overlay ? 0 : x - rect.left < 18 ? -1 : rect.right - x < 18 ? 1 : 0;
    if (direction !== dragState.edgeDirection) {
      clearTimeout(dragState.edgeTimer);
      dragState.edgeDirection = direction;
      if (direction && y > rect.top + 85 && y < rect.bottom - 120) dragState.edgeTimer = setTimeout(() => {
        if (dragState) { setHomePage(ui.page + direction); dragState.edgeDirection = 0; }
      }, 550);
    }
  }
  /* CellLayout drag outlines: a holo-blue outline marks the cell where the item would land.
     Each outline fades in and out over config_dragOutlineFadeTime (900 ms) to 128/255 alpha, leaving a short trail. */
  function dragOutlineTarget(x, y) {
    const source = dragState;
    if (!source || ui.overlay) return null;
    const target = document.elementFromPoint(x, y), grid = target?.closest('.home-grid:not([inert])');
    if (source.widgetType) {
      if (!grid) return null;
      const rect = grid.getBoundingClientRect(), oldWidget = source.type === 'widget' ? data.homeWidgets[source.page].find(widget => widget.id === source.id) : null;
      const column = Math.round((x - rect.left - 6 - source.grabOffset.x) / ((rect.width - 12) / 4)), row = Math.round((y - rect.top - 5 - source.grabOffset.y) / ((rect.height - 5) / 4));
      if (!widgetFits(ui.page, column, row, oldWidget || source.widgetType, oldWidget?.id || '')) return null;
      const size = widgetSize(oldWidget || source.widgetType);
      return {key: `w:${ui.page}:${column}:${row}`, container: grid, style: `grid-column:${column + 1}/span ${size.width};grid-row:${row + 1}/span ${size.height}`};
    }
    const slot = target?.closest('[data-home-slot],[data-dock-slot]');
    if (!slot || slot.querySelector('.launcher-icon:not(.drag-source-icon)')) return null;
    if (slot.hasAttribute('data-home-slot')) {
      const index = Number(slot.dataset.homeSlot);
      if (data.homeWidgets[ui.page].some(widget => index % 4 >= widget.x && index % 4 < widget.x + widgetSize(widget).width && Math.floor(index / 4) >= widget.y && Math.floor(index / 4) < widget.y + widgetSize(widget).height)) return null;
      return {key: `h:${ui.page}:${index}`, container: slot};
    }
    return {key: `d:${slot.dataset.dockSlot}`, container: slot};
  }
  function updateDragOutline(x, y) {
    const target = dragOutlineTarget(x, y), source = dragState;
    if ((target?.key || '') === (source.outlineKey || '')) return;
    source.outlineKey = target?.key || '';
    screen.querySelectorAll('.drag-outline:not(.outline-fading)').forEach(node => { node.classList.add('outline-fading'); setTimeout(() => node.remove(), 900); });
    if (!target) return;
    const outline = document.createElement(source.widgetType ? 'div' : 'span');
    outline.className = source.widgetType ? 'drag-outline widget-outline' : 'drag-outline icon-outline';
    outline.setAttribute('aria-hidden', 'true');
    if (source.widgetType) outline.style.cssText = target.style; else outline.innerHTML = `${appIcon(source.id)}<span class="outline-label">&nbsp;</span>`;
    target.container.append(outline);
    requestAnimationFrame(() => outline.classList.add('outline-visible'));
  }
  const clearDragOutlines = () => screen.querySelectorAll('.drag-outline').forEach(node => node.remove());
  /* DragLayer.animateView: the drag view settles into its final cell (or back to its origin);
     DeleteDropTarget shrinks it into Remove; FolderIcon draws it into the folder preview. */
  function landGhost(ghost, destination, trashRect) {
    const finish = () => ghost.remove();
    if (!destination || reducedMotion?.matches || document.hidden) return finish();
    const screenRect = screen.getBoundingClientRect(), k = screenRect.width / screen.clientWidth || 1;
    const local = rect => ({left: (rect.left - screenRect.left) / k, top: (rect.top - screenRect.top) / k, width: rect.width / k, height: rect.height / k});
    const from = local(ghost.getBoundingClientRect());
    ghost.getAnimations().forEach(animation => animation.cancel());
    Object.assign(ghost.style, {transform: 'none', translate: 'none', transformOrigin: '0 0'});
    const base = local(ghost.getBoundingClientRect());
    let target, options, hidden = null;
    if (destination.trash) {
      if (!trashRect) return finish();
      const bin = local(trashRect), width = from.width * .1, height = from.height * .1;
      target = {left: bin.left + bin.width / 2 - width / 2, top: bin.top + bin.height / 2 - height / 2, width, height};
      options = {duration: 250, motion: 'decelerate2', fade: {to: .1, curve: 'decelerateCubic'}};
    } else {
      const element = dragDestination(destination);
      if (!element) return finish();
      const box = destination.widget ? element : element.querySelector('.app-icon') || element;
      target = local(box.getBoundingClientRect());
      if (!destination.widget && box.classList.contains('launcher-folder-icon') && !ghost.querySelector('.launcher-folder-icon')) {
        const size = target.width * .63;
        target = {left: target.left + target.width / 2 - size / 2, top: target.top + target.height / 2 - size / 2, width: size, height: size};
        options = {duration: 400, motion: 'decelerate2', fade: {to: .5, curve: 'accelerate2'}};
      } else {
        options = {duration: ICSTransitions.dropDuration(Math.hypot(target.left - from.left, target.top - from.top))};
        hidden = element; element.style.visibility = 'hidden';
      }
    }
    const animation = ICSTransitions.fly(ghost, base, from, target, options);
    if (!animation) { finish(); if (hidden) hidden.style.visibility = ''; return; }
    animation.finished.catch(() => {}).then(() => { finish(); if (hidden) hidden.style.visibility = ''; });
  }
  function dragDestination(destination) {
    const grid = page => page === ui.page ? viewport.querySelector(`.home-grid[data-home-page="${page}"]`) : null;
    if (destination.widget) return grid(destination.page)?.querySelector(`.home-widget[data-widget-id="${CSS.escape(destination.widget)}"]`) || null;
    if (destination.type === 'home') return grid(destination.page)?.querySelector(`[data-home-slot="${destination.slot}"] .launcher-icon`) || null;
    if (destination.type === 'dock') return viewport.querySelector(`[data-dock-slot="${destination.slot}"] .launcher-icon`);
    if (destination.type === 'folder') {
      const panel = ui.overlay === 'folder' && ui.folderId === destination.folderId ? overlayRoot.querySelector('.launcher-folder') : null;
      const count = ICSLauncherFolders.folder(data, destination.folderId)?.items.length || 0;
      if (panel) return panel.querySelector(`[data-folder-slot="${Math.min(destination.slot, count - 1)}"] .launcher-icon`);
      return [...viewport.querySelectorAll('[data-folder-id]')].find(button => button.dataset.folderId === destination.folderId && !button.closest('[inert]')) || null;
    }
    return null;
  }
  /* Folder.realTimeReorder: after hovering a cell for 150 ms, icons between the empty cell and the
     target slide over in 230 ms, each starting 30 ms later than the previous (decaying by 0.9). */
  function folderReorder(x, y, panel) {
    const source = dragState, folder = ICSLauncherFolders.folder(data, ui.folderId);
    if (!folder) return;
    const fromHere = source.type === 'folder' && source.folderId === ui.folderId;
    if (!fromHere && folder.items.length >= ICSLauncherFolders.capacity) return;
    const cells = [...panel.querySelectorAll('[data-folder-slot]')];
    const count = Math.min(cells.length, fromHere ? folder.items.length : folder.items.length + 1);
    if (source.reorderPanel !== panel) { source.reorderPanel = panel; source.folderGap = Math.min(fromHere ? source.slot : folder.items.length, count - 1); source.folderGapTarget = source.folderGap; }
    let nearest = 0, distance = Infinity;
    cells.slice(0, count).forEach((cell, index) => { const rect = cell.getBoundingClientRect(), d = Math.hypot(x - rect.left - rect.width / 2, y - rect.top - rect.height / 2); if (d < distance) { distance = d; nearest = index; } });
    if (nearest === source.folderGapTarget) return;
    source.folderGapTarget = nearest;
    clearTimeout(source.reorderTimer);
    source.reorderTimer = setTimeout(() => applyFolderGap(panel, nearest), 150);
  }
  function applyFolderGap(panel, gap) {
    const source = dragState, folder = ICSLauncherFolders.folder(data, ui.folderId);
    if (!source || !folder || source.reorderPanel !== panel || !panel.isConnected) return;
    const fromHere = source.type === 'folder' && source.folderId === ui.folderId, previous = source.folderGap;
    const cells = [...panel.querySelectorAll('[data-folder-slot]')], rects = cells.map(cell => cell.getBoundingClientRect());
    const k = screen.getBoundingClientRect().width / screen.clientWidth || 1;
    const remaining = folder.items.map((_, slot) => slot).filter(slot => !(fromHere && slot === source.slot));
    const moves = remaining.map((slot, order) => ({slot, from: order >= previous ? order + 1 : order, to: order >= gap ? order + 1 : order})).filter(move => move.from !== move.to && rects[move.to]);
    moves.sort((a, b) => Math.abs(a.from - previous) - Math.abs(b.from - previous));
    let delay = 0, step = 30;
    for (const move of moves) {
      const icon = cells[move.slot]?.querySelector('.launcher-icon');
      if (!icon) continue;
      const dx = (rects[move.to].left - rects[move.slot].left) / k, dy = (rects[move.to].top - rects[move.slot].top) / k;
      icon.style.transition = reducedMotion?.matches ? 'none' : `transform 230ms cubic-bezier(.37,0,.63,1) ${Math.round(delay)}ms`;
      icon.style.transform = dx || dy ? `translate(${dx}px,${dy}px)` : '';
      delay += step; step *= .9;
    }
    source.folderGap = gap;
  }
  function clearFolderDragFeedback(){screen.querySelectorAll('.folder-drop-target,.folder-reorder-target,.drag-source-icon,.drag-source-widget').forEach(node=>node.classList.remove('folder-drop-target','folder-reorder-target','drag-source-icon','drag-source-widget'));}
  function updateFolderDrag(x,y) {
    const source=dragState;if(!source||source.widgetType)return;
    screen.querySelectorAll('.folder-drop-target,.folder-reorder-target').forEach(node=>node.classList.remove('folder-drop-target','folder-reorder-target'));
    const target=document.elementFromPoint(x,y),panel=overlayRoot.querySelector('.launcher-folder');
    if(panel){
      const rect=panel.getBoundingClientRect(),inside=x>=rect.left&&x<=rect.right&&y>=rect.top&&y<=rect.bottom;
      if(!inside&&!source.folderExitTimer)source.folderExitTimer=setTimeout(()=>{if(dragState===source){ui.overlay='';renderOverlay();source.folderExitTimer=null;source.hoverFolder=null;}},800);
      else if(inside){clearTimeout(source.folderExitTimer);source.folderExitTimer=null;folderReorder(x,y,panel);}
      return;
    }
    const slot=target?.closest('[data-home-slot],[data-dock-slot]'),icon=slot?.querySelector('.launcher-icon');
    const sourceIsFolder=!!ICSLauncherFolders.folder(data,source.id);
    const sameSlot=slot&&(slot.hasAttribute('data-home-slot')?source.type==='home'&&source.page===ui.page&&source.slot===Number(slot.dataset.homeSlot):source.type==='dock'&&source.slot===Number(slot.dataset.dockSlot));
    const folderId=icon?.dataset.folderId;
    if(icon&&!sameSlot&&!sourceIsFolder&&icon.dataset.action!=='drawer')icon.classList.add('folder-drop-target');
    const hoverId=!sourceIsFolder&&!sameSlot?folderId:null;
    if(hoverId!==source.hoverFolder){
      clearTimeout(source.folderHoverTimer);source.hoverFolder=hoverId;
      if(hoverId)source.folderHoverTimer=setTimeout(()=>{if(dragState===source&&ICSLauncherFolders.folder(data,hoverId)?.items.length<ICSLauncherFolders.capacity){ui.folderId=hoverId;ui.overlay='folder';renderOverlay();}},700);
    }
  }
  function finishDrag(x, y) {
    if (!dragState) return false;
    const source = dragState;
    let target = document.elementFromPoint(x, y);
    if(ui.overlay==='folder'&&!target?.closest('.launcher-folder')){ui.overlay='';renderOverlay();target=document.elementFromPoint(x,y);}
    const folderSlot=target?.closest('[data-folder-slot]');
    let homeSlot = target?.closest('[data-home-slot]');
    const grid = target?.closest('.home-grid');
    if (!homeSlot && grid) {
      const rect = grid.getBoundingClientRect();
      const column = Math.min(3, Math.max(0, Math.floor((x - rect.left) / rect.width * 4)));
      const row = Math.min(3, Math.max(0, Math.floor((y - rect.top) / rect.height * 4)));
      homeSlot = grid.querySelector(`[data-home-slot="${row * 4 + column}"]`);
    }
    const dockSlot = target?.closest('[data-dock-slot]');
    const pageButton = target?.closest('.page-indicators button');
    const remove = target?.closest('[data-drop-remove]');
    const trashRect = remove?.getBoundingClientRect();
    if (source.type === 'drawer' && target?.closest('[data-drop-info]')) {
      clearTimeout(source.edgeTimer); clearDragOutlines(); source.ghost.remove(); dragState = null; screen.classList.remove('dragging', 'dragging-from-drawer');
      openApp('settings'); ui.settingsApp = source.id; ui.sub = 'app-info'; render(); suppressClickUntil = Date.now() + 350;
      return true;
    }
    let destination = null;
    if (source.widgetType) {
      const oldWidget = source.type === 'widget' ? data.homeWidgets[source.page].find(widget => widget.id === source.id) : null;
      if (oldWidget) destination = {widget: oldWidget.id, page: source.page};
      if (remove && oldWidget) { data.homeWidgets[source.page] = data.homeWidgets[source.page].filter(widget => widget.id !== source.id); destination = {trash: true}; }
      else if (homeSlot) {
        const rect = homeSlot.closest('.home-grid').getBoundingClientRect();
        const column = Math.round((x - rect.left - 6 - source.grabOffset.x) / ((rect.width - 12) / 4));
        const row = Math.round((y - rect.top - 5 - source.grabOffset.y) / ((rect.height - 5) / 4));
        if (widgetFits(ui.page, column, row, oldWidget || source.widgetType, oldWidget?.id || '')) {
          if (oldWidget) {
            data.homeWidgets[source.page] = data.homeWidgets[source.page].filter(widget => widget.id !== source.id);
            oldWidget.x = column; oldWidget.y = row;
            data.homeWidgets[ui.page].push(oldWidget);
            destination = {widget: oldWidget.id, page: ui.page};
          }
          else { const added = addWidget(source.widgetType, column, row); if (added) destination = {widget: added.id, page: ui.page}; }
        } else toast('This home screen is full');
      }
    } else {
      let result=null,attempt=null;
      const dropAt=location=>{attempt=location;return ICSLauncherFolders.drop(data,source,location);};
      if(remove)result={ok:ICSLauncherFolders.remove(data,source)};
      else if((folderSlot||target?.closest('.launcher-folder-grid'))&&source.reorderPanel&&source.reorderPanel===overlayRoot.querySelector('.launcher-folder'))result=dropAt({type:'folder',folderId:ui.folderId,slot:source.folderGap});
      else if(folderSlot)result=dropAt({type:'folder',folderId:ui.folderId,slot:Number(folderSlot.dataset.folderSlot)});
      else if(target?.closest('.launcher-folder-grid'))result=dropAt({type:'folder',folderId:ui.folderId,slot:ICSLauncherFolders.folder(data,ui.folderId).items.length});
      else if(homeSlot){
        const slot=Number(homeSlot.dataset.homeSlot);
        const covered=data.homeWidgets[ui.page].some(widget=>slot%4>=widget.x&&slot%4<widget.x+widgetSize(widget).width&&Math.floor(slot/4)>=widget.y&&Math.floor(slot/4)<widget.y+widgetSize(widget).height);
        const occupant=data.homePages[ui.page][slot],folderTarget=occupant&&ICSLauncherFolders.folder(data,occupant);
        const own=source.type==='home'&&source.page===ui.page&&source.slot===slot;
        if(folderTarget&&!own)result=dropAt({type:'folder',folderId:occupant,slot:folderTarget.items.length});
        else if(!covered&&(!occupant||own))result=dropAt({type:'home',page:ui.page,slot});
        else{
          const vacant=index=>(data.homePages[ui.page][index]===null||source.type==='home'&&source.page===ui.page&&source.slot===index)&&!data.homeWidgets[ui.page].some(widget=>index%4>=widget.x&&index%4<widget.x+widgetSize(widget).width&&Math.floor(index/4)>=widget.y&&Math.floor(index/4)<widget.y+widgetSize(widget).height);
          const nearest=Array.from({length:16},(_,index)=>index).filter(vacant).sort((a,b)=>Math.hypot(a%4-slot%4,Math.floor(a/4)-Math.floor(slot/4))-Math.hypot(b%4-slot%4,Math.floor(b/4)-Math.floor(slot/4)))[0];
          result=nearest===undefined?{ok:false,error:'No more room on this Home screen.'}:dropAt({type:'home',page:ui.page,slot:nearest});
        }
      }else if(dockSlot)result=dropAt({type:'dock',slot:Number(dockSlot.dataset.dockSlot)});
      else if(pageButton){
        const nextPage=Number(pageButton.dataset.id);
        const slot=data.homePages[nextPage].findIndex((id,index)=>id===null&&!data.homeWidgets[nextPage].some(widget=>index%4>=widget.x&&index%4<widget.x+widgetSize(widget).width&&Math.floor(index/4)>=widget.y&&Math.floor(index/4)<widget.y+widgetSize(widget).height));
        if(slot>=0){result=dropAt({type:'home',page:nextPage,slot});if(result.ok)ui.page=nextPage;}
        else result={ok:false,error:'This home screen is full'};
      }
      if(result?.error)toast(result.error);
      if(ui.overlay==='folder'&&!ICSLauncherFolders.folder(data,ui.folderId))ui.overlay='';
      // A folder that received the item may now sit where the target icon was.
      if(remove&&result?.ok)destination={trash:true};
      else if(result?.ok&&attempt)destination=attempt;
      else if(['home','dock','folder'].includes(source.type))destination=source;
    }
    clearTimeout(source.folderExitTimer);clearTimeout(source.folderHoverTimer);clearTimeout(source.reorderTimer);clearFolderDragFeedback();
    clearTimeout(source.edgeTimer); clearDragOutlines(); dragState = null; screen.classList.remove('dragging', 'dragging-from-drawer');
    save(); render(); suppressClickUntil = Date.now() + 350;
    landGhost(source.ghost, destination, trashRect);
    return true;
  }
  function setHomePage(page) {
    ui.page = Math.max(0, Math.min(4, page));
    const track = viewport.querySelector('.home-pages');
    if (!track) return;
    track.style.transition = '';
    track.style.transform = `translateX(${-ui.page * 100}%)`;
    tweenWallpaperOffset(ui.page / 4);
    if (data.wallpaper !== 99) { screen.style.transition = 'background-position .35s cubic-bezier(.16,1,.3,1)'; screen.style.backgroundPositionX = `${ui.page * 25}%`; }
    track.querySelectorAll('.home-grid').forEach((grid, index) => { grid.inert = index !== ui.page; });
    // Launcher.updateArrows: the previous/next buttons show one dot per screen on that side.
    const home = viewport.querySelector('.home-view.gbl');
    if (home) { home.querySelectorAll('.gbl-arrow').forEach(node => node.remove()); home.querySelector('.gbl-cluster')?.insertAdjacentHTML('beforebegin', GBLauncher.arrows(ui.page, 5, key => i18n.t(key))); }
    screen.classList.add('show-page-indicator');
    clearTimeout(ui.pageIndicatorTimer);
    ui.pageIndicatorTimer = setTimeout(() => screen.classList.remove('show-page-indicator'), 800);
  }
  /* WallpaperService visibility: the engine draws only while its window shows (home and keyguard, or the picker's
     preview), and the launcher feeds it the workspace scroll as an x offset across the five pages. */
  function syncLiveWallpaper() {
    const preview = ui.view === 'live-wallpapers' && String(ui.sub || '').startsWith('preview:');
    const id = preview ? ui.sub.slice(8) : data.liveWallpaper?.id || '';
    const visible = !!id && (preview || ['home', 'lock'].includes(ui.view)) && !ui.sleeping && !ui.power;
    const key = id ? `${id}:${preview}` : '';
    if (liveWallpaper && liveWallpaper.key !== key) { liveWallpaper.destroy(); liveWallpaper = null; }
    if (key && !liveWallpaper) {
      liveWallpaper = LiveWallpapers.mount(liveLayer, id, {preview, prefs: () => data.lwPrefs?.[id] || {}, clock: deviceDate, offset: preview ? .5 : ui.page / 4, audio: () => !!ui.music?.playing});
      if (liveWallpaper) liveWallpaper.key = key;
    }
    liveLayer.hidden = !visible; liveWallpaper?.pause(!visible);
    if (liveWallpaper && !preview && ui.view === 'home') liveWallpaper.setOffset(ui.page / 4);
    screen.classList.toggle('live-wallpaper', !!data.liveWallpaper?.id || preview);
  }
  function tweenWallpaperOffset(target) {
    if (!liveWallpaper) return;
    cancelAnimationFrame(liveOffsetTween);
    const from = liveWallpaper.offset ?? target, start = performance.now();
    const step = now => { const t = Math.min(1, (now - start) / 350), value = from + (target - from) * (1 - Math.pow(1 - t, 3)); liveWallpaper?.setOffset(value); if (liveWallpaper) liveWallpaper.offset = value; if (t < 1) liveOffsetTween = requestAnimationFrame(step); };
    liveOffsetTween = requestAnimationFrame(step);
  }
  function moveHomePage(dx) {
    const content = viewport.querySelector('.home-pages');
    if (!content) return;
    const distance = Math.max(-(4 - ui.page) * screen.clientWidth, Math.min(ui.page * screen.clientWidth, dx));
    content.style.transition = 'none';
    content.style.transform = `translateX(calc(${-ui.page * 100}% + ${distance}px))`;
    if (liveWallpaper) { const value = (ui.page - distance / screen.clientWidth) / 4; liveWallpaper.setOffset(value); liveWallpaper.offset = value; }
  }
  function finishHomePage(dx) {
    const nextPage = Math.max(0, Math.min(4, ui.page + (dx < 0 ? 1 : -1)));
    screen.classList.remove('page-swiping');
    suppressClickUntil = Date.now() + 350;
    setHomePage(Math.abs(dx) > 45 ? nextPage : ui.page);
  }
  function finishDrawerPage(dx) {
    const pageCount = ui.drawerTab === 'apps' ? Math.ceil(apps.length / 20) : Math.ceil(widgetTypes.length / 4);
    const nextPage = Math.max(0,Math.min(pageCount - 1,ui.drawerPage + (dx < 0 ? 1 : -1)));
    suppressClickUntil = Date.now() + 350;
    if (Math.abs(dx) > 45 && nextPage !== ui.drawerPage) {
      ui.drawerPage = nextPage; render();
      viewport.querySelector('.drawer-page')?.animate([{transform:`translateX(${dx < 0 ? '100%' : '-100%'})`,opacity:.5},{transform:'translateX(0)',opacity:1}],{duration:210,easing:'ease-out'});
    } else {
      const page = viewport.querySelector('.drawer-page');
      if (page) { page.style.transition = 'transform .18s ease-out'; page.style.transform = ''; }
    }
  }
  let lastWheelPage = 0;
  screen.addEventListener('wheel', event => {
    if (ui.view !== 'home' || ui.overlay || dragState || !event.target.closest('.home-content')) return;
    const widgetList = event.target.closest('.calw-list');
    if (widgetList && Math.abs(event.deltaY) > Math.abs(event.deltaX) && widgetList.scrollHeight > widgetList.clientHeight) return;
    event.preventDefault();
    const stack = event.target.closest('[data-photo-stack]');
    if (stack && Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      if (Math.abs(event.deltaY) >= 8 && performance.now() - lastWheelPage >= 300) { lastWheelPage = performance.now(); stepPhotoStack(stack.dataset.photoStack, event.deltaY > 0 ? 1 : -1); }
      return;
    }
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (Math.abs(delta) < 8 || performance.now() - lastWheelPage < 300) return;
    lastWheelPage = performance.now();
    setHomePage(ui.page + Math.sign(delta));
  }, {passive:false});
  screen.addEventListener('dragstart', event => event.preventDefault());
  let homeLongPressTimer = null, calculatorClearTimer = null, messageHoldTimer = null;
  screen.addEventListener('contextmenu', event => {
    if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    event.preventDefault();
    const message = event.target.closest('.mms-message');
    if (message && !ui.overlay) { ui.mmsMessage = message.dataset.id; ui.overlay = 'mms-message'; renderOverlay(); }
    if (!dragState && ui.view === 'home' && !ui.overlay && event.button === 2 && event.target.closest('.home-slot') && !event.target.closest('.launcher-icon')) { ui.overlay = 'wallpaper-source'; renderOverlay(); }
  });
  // Older WebKit versions may still start page rubber-banding during a custom
  // gesture. Cancel only gestures owned by the simulator; lists scroll natively.
  screen.addEventListener('touchmove', event => {
    if (event.touches.length !== 1 || !pointerStart || event.target.closest('input, textarea, select')) return;
    if (pointerStart.source || pointerStart.target.closest('#status-bar, #nav-bar, .home-view, .drawer-view, .lock-view, .shade-top, .shade-handle, .calc-pager, .easter-robot')) {
      if (event.cancelable) event.preventDefault();
    }
  }, { passive: false });
  // A long press opens a dialog under the finger; the release must not activate it (Android ignores it too).
  function suppressReleaseClick() {
    suppressClickUntil = Infinity;
    window.addEventListener('pointerup', () => { suppressClickUntil = Date.now() + 350; }, {once: true, capture: true});
    window.addEventListener('pointercancel', () => { suppressClickUntil = Date.now() + 350; }, {once: true, capture: true});
  }
  screen.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (data.settings.showTouches) { const dot = document.createElement('span'); const rect = screen.getBoundingClientRect(); dot.className = 'touch-indicator'; dot.style.left = `${event.clientX - rect.left}px`; dot.style.top = `${event.clientY - rect.top}px`; screen.append(dot); setTimeout(() => dot.remove(), 400); }
    const widgetList = ui.view === 'home' && !ui.overlay ? event.target.closest('.calw-list') : null;
    const scrollTarget = widgetList || (event.pointerType === 'mouse' && !ui.overlay && !event.target.closest('input, select, textarea, .wallpaper-choice')
      ? (ui.view === 'settings' && event.target.closest('.settings-app .app-content') ? event.target.closest('.settings-app') : event.target.closest('.play-content,.mms-scroll,.people-scroll,.browser-page,.web-tabs,.web-library,.desk-scroll,.gallery-scroll,.cal-scroll,.music-library-scroll,.email-scroll')) : null);
    pointerStart = { x: event.clientX, y: event.clientY, target: event.target, source: dragSource(event.target), pointerType: event.pointerType, pointerId: event.pointerId, downTime: performance.now(), scrollTarget, scrollTop: scrollTarget?.scrollTop || 0, lockDrag: ui.view === 'lock' && !!event.target.closest('.lock-handle'), shadeDragEligible: !ui.overlay && !ui.locked && !!event.target.closest('#status-bar'), shadeCloseEligible: ui.overlay === 'shade' && !!event.target.closest('.gbsh-close'), pageSwipeEligible: ui.view === 'home' && !ui.overlay && !!event.target.closest('.home-view') && !event.target.closest('.dock, .page-indicators, .home-search'), drawerSwipeEligible: ui.view === 'drawer' && !!event.target.closest('.drawer-page') };
    if (ui.view === 'home' && !ui.overlay && event.target.closest('.home-slot') && !pointerStart.source) homeLongPressTimer = setTimeout(() => { ui.overlay = 'wallpaper-source'; renderOverlay(); pointerStart = null; suppressReleaseClick(); }, 550);
    const message = event.target.closest('.mms-message');
    if (message && !ui.overlay) messageHoldTimer = setTimeout(() => { ui.mmsMessage = message.dataset.id; ui.overlay = 'mms-message'; suppressReleaseClick(); renderOverlay(); }, 550);
    if (pointerStart.lockDrag) { clearTimeout(ui.lockReleaseTimer); viewport.querySelectorAll('.lock-chevron').forEach(chevron => chevron.getAnimations().forEach(animation => animation.cancel())); screen.classList.remove('lock-releasing'); screen.classList.add('lock-dragging'); try { screen.setPointerCapture(event.pointerId); } catch {} }
    else if (ui.view === 'lock' && !ui.locked && event.target.closest('.lock-wave')) lockPing();
    // PlatLogoActivity: the logo jumps to 1.25x, 2x, 3.25x and 5x (no tweening), then Nyandroid starts.
    if (event.target.closest('.easter-robot')) {
      const robot = event.target.closest('.easter-robot'); let count = 0;
      const zoom = () => { count++; if (data.settings.haptic !== false) navigator.vibrate?.(50 * count); robot.style.transform = `scale(${ICSNyandroid.zoomScale(count)})`; if (count <= 3) eggTimer = setTimeout(zoom, ICSNyandroid.LONG_PRESS); else requestAnimationFrame(() => { ui.easterNyan = true; render(); }); };
      eggTimer = setTimeout(zoom, 2 * ICSNyandroid.LONG_PRESS);
    }
    if (ui.view === 'calculator' && !ui.overlay && event.target.closest('.calc-pager')) pointerStart.calculatorSwipe = true;
    if (event.target.closest('.ics-calc-delete button')) calculatorClearTimer = setTimeout(() => { operateCalculator('C'); suppressClickUntil = Date.now() + 350; render(); }, 600);
    if (ui.view === 'home' && !ui.overlay) pointerStart.photoStack = event.target.closest('[data-photo-stack]')?.dataset.photoStack || '';
    if (pointerStart.source) dragTimer = setTimeout(() => startDrag(event.clientX, event.clientY), 440);
  });
  window.addEventListener('pointermove', event => {
    if (!pointerStart || event.pointerId !== pointerStart.pointerId) return;
    if (dragState) { moveGhost(event.clientX, event.clientY); return; }
    const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
    if (Math.hypot(dx,dy) > 8) { clearTimeout(homeLongPressTimer); clearTimeout(calculatorClearTimer); clearTimeout(messageHoldTimer); }
    if (pointerStart.calculatorSwipe && (pointerStart.calculatorSwiping || Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy))) {
      pointerStart.calculatorSwiping = true; suppressClickUntil = Date.now() + 350; event.preventDefault();
      try { screen.setPointerCapture(event.pointerId); } catch {}
      const track = viewport.querySelector('.calc-panels');
      if (track) { track.style.transition = 'none'; track.style.transform = `translateX(${Math.max(-screen.clientWidth, Math.min(0, -ui.calcPanel * screen.clientWidth + dx))}px)`; }
      return;
    }
    if (pointerStart.drawerSwipeEligible && (pointerStart.drawerSwiping || Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.1 && performance.now() - pointerStart.downTime < 260)) {
      pointerStart.drawerSwiping = true;
      clearTimeout(dragTimer);
      event.preventDefault();
      try { screen.setPointerCapture(event.pointerId); } catch {}
      const page = viewport.querySelector('.drawer-page');
      if (page) { page.style.transition = 'none'; page.style.transform = `translateX(${Math.max(-screen.clientWidth*.65,Math.min(screen.clientWidth*.65,dx))}px)`; }
      return;
    }
    const recentCard = ui.overlay === 'recent' ? pointerStart.target.closest('.recent-item') : ui.overlay === 'shade' ? pointerStart.target.closest('.notification') : null;
    if (recentCard && (pointerStart.recentSwiping || Math.abs(dx) > 9 && Math.abs(dx) > Math.abs(dy))) {
      pointerStart.recentSwiping = true;
      suppressClickUntil = Date.now() + 350;
      event.preventDefault();
      try { screen.setPointerCapture(event.pointerId); } catch {}
      recentCard.style.transform = `translateX(${dx}px)`;
      recentCard.style.opacity = String(Math.max(.25, 1 - Math.abs(dx) / 240));
      return;
    }
    if(ui.view==='calendar' && !ui.sub && !ui.overlay && !pointerStart.scrolling && pointerStart.target.closest('[data-calendar-swipe]') && Math.abs(dx)>12 && Math.abs(dx)>Math.abs(dy)*1.2) {
      pointerStart.calendarSwiping=true;suppressClickUntil=Date.now()+350;event.preventDefault();
      try{screen.setPointerCapture(event.pointerId);}catch{}
      const surface=viewport.querySelector('[data-calendar-swipe]');surface.style.transform=`translateX(${dx}px)`;return;
    }
    if (ui.view==='gallery' && ui.sub==='photo' && !ui.overlay && pointerStart.target.closest('[data-gallery-swipe]') && Math.abs(dx)>10 && Math.abs(dx)>Math.abs(dy)) {
      pointerStart.gallerySwiping=true;suppressClickUntil=Date.now()+350;event.preventDefault();
      try{screen.setPointerCapture(event.pointerId);}catch{}
      const picture=viewport.querySelector('.gallery-image');if(picture)picture.style.transform=`translateX(${dx}px)`;return;
    }
    if (pointerStart.lockDrag) { event.preventDefault(); pointerStart.lockActive = lockMove(dx, dy); return; }
    if (pointerStart.shadeDragging || pointerStart.shadeDragEligible && dy > 8 && dy > Math.abs(dx) || pointerStart.shadeCloseEligible && Math.abs(dy) > 4) {
      const rect = screen.getBoundingClientRect(), scale = screen.clientHeight / rect.height;
      if (!pointerStart.shadeDragging) {
        pointerStart.shadeDragging = true; stopShade?.(); stopShade = null;
        const panel = overlayRoot.querySelector('.gbsh-panel');
        const start = panel ? new DOMMatrixReadOnly(getComputedStyle(panel).transform).m42 + shadeBottom() : statusRoot.offsetHeight;
        shadeTracking = {expanded: ui.overlay === 'shade', offset: pointerStart.shadeCloseEligible ? start - (pointerStart.y - rect.top) * scale : 0, y: start, samples: []};
        if (ui.overlay !== 'shade') { ui.overlay = 'shade'; renderOverlay(); }
        try { screen.setPointerCapture(event.pointerId); } catch {}
      }
      event.preventDefault();
      const y = Math.max(statusRoot.offsetHeight, Math.min(shadeBottom(), (event.clientY - rect.top) * scale + shadeTracking.offset));
      shadeTracking.y = y; shadeTracking.samples.push([performance.now(), y]); if (shadeTracking.samples.length > 6) shadeTracking.samples.shift();
      const panel = overlayRoot.querySelector('.gbsh-panel'); if (panel) GBStatusBar.place(panel, y, shadeBottom());
      return;
    }
    // StackView: a vertical fling on the front picture moves through the stack.
    if (pointerStart.photoStack && (pointerStart.photoSwiping || Math.abs(dy) > 6 && Math.abs(dy) > Math.abs(dx) * 1.2)) {
      if (!pointerStart.photoSwiping) { pointerStart.photoSwiping = true; clearTimeout(dragTimer); suppressClickUntil = Date.now() + 350; try { screen.setPointerCapture(event.pointerId); } catch {} }
      event.preventDefault();
      const front = viewport.querySelector(`[data-photo-stack="${CSS.escape(pointerStart.photoStack)}"] .phw-front`);
      if (front) { front.style.transition = 'none'; front.style.transform = `translateY(${Math.max(-60, Math.min(90, dy))}px) rotate(${Math.max(-6, Math.min(6, dy / 15))}deg)`; front.style.opacity = String(Math.max(.35, 1 - Math.abs(dy) / 160)); }
      return;
    }
    if (pointerStart.scrolling) { event.preventDefault(); pointerStart.scrollTarget.scrollTop = pointerStart.scrollTop - dy; return; }
    if (pointerStart.scrollTarget && Math.abs(dy) > 6 && Math.abs(dy) > Math.abs(dx)) {
      clearTimeout(dragTimer);
      pointerStart.scrolling = true; screen.classList.add('settings-scrolling');
      try { screen.setPointerCapture(event.pointerId); } catch {}
      suppressClickUntil = Date.now() + 350;
      event.preventDefault(); pointerStart.scrollTarget.scrollTop = pointerStart.scrollTop - dy; return;
    }
    if (pointerStart.swiping) { event.preventDefault(); moveHomePage(dx); return; }
    const distance = Math.hypot(dx, dy);
    if (distance > 9) clearTimeout(dragTimer);
    const horizontal = Math.abs(dx) > Math.abs(dy) * 1.1;
    const quickHomeIcon = ['home','widget'].includes(pointerStart.source?.type) && performance.now() - pointerStart.downTime < 260;
    if (pointerStart.pageSwipeEligible && horizontal && Math.abs(dx) > (pointerStart.source ? 28 : 10) && (!pointerStart.source || quickHomeIcon)) {
      pointerStart.swiping = true;
      screen.classList.add('page-swiping');
      try { screen.setPointerCapture(event.pointerId); } catch {}
      suppressClickUntil = Date.now() + 350;
      event.preventDefault();
      moveHomePage(dx);
      return;
    }
    if (pointerStart.source && event.pointerType === 'mouse' && distance > 8 && !(quickHomeIcon && horizontal)) startDrag(event.clientX, event.clientY);
  });
  window.addEventListener('pointerup', event => {
    if (!pointerStart || event.pointerId !== pointerStart.pointerId) return;
    clearTimeout(eggTimer); clearTimeout(dragTimer); clearTimeout(homeLongPressTimer); clearTimeout(calculatorClearTimer); clearTimeout(messageHoldTimer);
    const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
    if(pointerStart.calendarSwiping){if(Math.abs(dx)>45)calendarMove(dx<0?1:-1);else viewport.querySelector('[data-calendar-swipe]').style.transform='';suppressClickUntil=Date.now()+350;pointerStart=null;return;}
    if (pointerStart.photoSwiping) { if (Math.abs(dy) > 30) stepPhotoStack(pointerStart.photoStack, dy > 0 ? 1 : -1); else render(); suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
    if (pointerStart.gallerySwiping) { if(Math.abs(dx)>45)galleryStep(dx<0?1:-1);else render();suppressClickUntil=Date.now()+350;pointerStart=null;return; }
    if (pointerStart.calculatorSwiping) { setCalculatorPanel(Math.abs(dx) > 50 ? (dx < 0 ? 1 : 0) : ui.calcPanel); suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
    if (pointerStart.drawerSwiping) { finishDrawerPage(dx); pointerStart = null; return; }
    if (pointerStart.recentSwiping) {
      const card = pointerStart.target.closest('.recent-item, .notification');
      if (card) {
        card.style.transition = 'transform .16s ease-out, opacity .16s ease-out';
        if (Math.abs(dx) > 55) {
          const id = card.dataset.app;
          card.style.transform = `translateX(${Math.sign(dx || 1) * screen.clientWidth}px)`;
          card.style.opacity = '0';
          setTimeout(() => {
            if (card.classList.contains('notification')) {
              data.notifications = data.notifications.filter(item => item.id !== Number(card.dataset.id));
              save(); renderStatus();
              if (ui.overlay === 'shade') { if (!data.notifications.length) ui.overlay = ''; renderOverlay(); }
              return;
            }
            ui.recent = ui.recent.filter(item => item !== id);
            if (ui.overlay !== 'recent') return;
            if (!ui.recent.length) ui.overlay = '';
            renderOverlay();
          }, 160);
        } else { card.style.transform = ''; card.style.opacity = ''; }
      }
      suppressClickUntil = Date.now() + 350;
      pointerStart = null; return;
    }
    if (pointerStart.shadeDragging) {
      suppressClickUntil = Date.now() + 350;
      const track = shadeTracking; shadeTracking = null;
      const [first, last] = [track.samples[0], track.samples.at(-1)];
      let velocity = first && last && last[0] > first[0] ? (last[1] - first[1]) / ((last[0] - first[0]) / 1000) : 0;
      const expand = GBStatusBar.flingDirection(track.expanded, track.y, velocity, screen.clientHeight);
      if (expand ? velocity < 0 : velocity > 0) velocity = 0;
      shadeFling(track.y, velocity, expand);
      pointerStart = null; return;
    }
    if (pointerStart.lockDrag) {
      const active = lockMove(dx, dy);
      if (!active && Math.hypot(dx, dy) > 6) suppressClickUntil = Date.now() + 350;
      lockRelease(active);
      pointerStart = null; return;
    }
    if (pointerStart.scrolling) { screen.classList.remove('settings-scrolling'); suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
    if (pointerStart.swiping || pointerStart.pageSwipeEligible && !dragState && Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) && (!pointerStart.source || pointerStart.source.type === 'home' && performance.now() - pointerStart.downTime < 260)) {
      finishHomePage(dx); pointerStart = null; return;
    }
    if (!dragState && pointerStart?.source && !['drawer', 'drawer-widget'].includes(pointerStart.source.type) && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 9) startDrag(event.clientX, event.clientY);
    if (finishDrag(event.clientX, event.clientY)) { pointerStart = null; return; }
    if (!pointerStart) return;
    if (ui.overlay === 'shade' && pointerStart.target.closest('.notification') && Math.abs(dx) > 55) { const id = Number(pointerStart.target.closest('.notification').dataset.id); data.notifications = data.notifications.filter(n => n.id !== id); save(); renderStatus(); renderOverlay(); pointerStart = null; return; }
    pointerStart = null;
  });
  window.addEventListener('pointercancel', () => { clearTimeout(calculatorClearTimer); clearTimeout(messageHoldTimer); const calcTrack = viewport.querySelector('.calc-panels'); if (calcTrack) { calcTrack.style.transition = ''; calcTrack.style.transform = `translateX(-${ui.calcPanel * 50}%)`; } clearTimeout(eggTimer); clearTimeout(dragTimer); clearTimeout(homeLongPressTimer); clearTimeout(dragState?.edgeTimer);clearTimeout(dragState?.folderExitTimer);clearTimeout(dragState?.folderHoverTimer);clearFolderDragFeedback();dragState?.ghost.remove(); clearDragOutlines(); dragState = null; screen.classList.remove('dragging', 'page-swiping', 'settings-scrolling', 'lock-dragging'); setHomePage(ui.page); const drawerPage = viewport.querySelector('.drawer-page'); if (drawerPage) drawerPage.style.transform = ''; const lockHandle = viewport.querySelector('.lock-handle'); if (lockHandle) lockHandle.style.removeProperty('--lock-x'); if (pointerStart?.shadeDragging || ui.overlay === 'recent' || ui.overlay === 'shade' || ui.overlay === 'folder') renderOverlay(); pointerStart = null; });
  window.addEventListener('pointercancel',()=>{const photo=viewport.querySelector('.gallery-image');if(photo)photo.style.transform='';});
  window.addEventListener('pointercancel',()=>{const surface=viewport.querySelector('[data-calendar-swipe]');if(surface)surface.style.transform='';});
  document.addEventListener('keydown', event => {
    const focusedStack = ui.view === 'home' && !ui.overlay && document.activeElement?.closest?.('[data-photo-stack]');
    if (focusedStack && ['ArrowUp','ArrowDown'].includes(event.key)) { event.preventDefault(); const id = focusedStack.dataset.photoStack; stepPhotoStack(id, event.key === 'ArrowDown' ? 1 : -1); viewport.querySelector(`[data-photo-stack="${CSS.escape(id)}"] .phw-front`)?.focus(); return; }
    if(ui.view==='gallery' && ui.sub==='photo' && !ui.overlay && ['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();galleryStep(event.key==='ArrowLeft'?-1:1);return;}
    if (event.target.matches('.recent-item,.web-tab-preview') && ['Enter',' '].includes(event.key)) { event.preventDefault(); event.target.click(); return; }
    if (ui.view === 'calculator' && !ui.overlay && ['ArrowUp','ArrowDown'].includes(event.key) && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) {
      event.preventDefault(); const history = data.calcHistory || []; if (!history.length) return;
      ui.calcHistoryIndex = event.key === 'ArrowUp' ? (ui.calcHistoryIndex < 0 ? history.length - 1 : Math.max(0,ui.calcHistoryIndex - 1)) : (ui.calcHistoryIndex < 0 ? history.length - 1 : Math.min(history.length - 1,ui.calcHistoryIndex + 1));
      ui.calc = history[ui.calcHistoryIndex].expression; ui.calcFresh = false; render(); return;
    }
    if (ui.view === 'calculator' && !ui.overlay && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName) && (/^[0-9.+\-*/=()!^]$/.test(event.key) || ['Enter','Backspace','Delete'].includes(event.key))) {
      event.preventDefault(); const map = {'*':'×','/':'÷','-':'−','Enter':'=','Backspace':'⌫','Delete':'C'}; operateCalculator(map[event.key] || event.key); render(); return;
    }
    if (event.key === 'Escape' || event.key === 'Backspace' && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) { event.preventDefault(); back(); }
    else if (event.key === 'Home' && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) { event.preventDefault(); if (ui.view !== 'lock') home(); }

  });
  function powerKey() { if (ui.power === 'off') { bootUp(false); return; } if (ui.power || ui.overlay === 'power-progress') return; if(ui.locked){ui.sleeping=!ui.sleeping;lockControls.lock();render();}else if(ui.sleeping||ui.view==='lock'){ui.sleeping=false;home(false);}else lockScreen(); }
  // PhoneWindowManager: holding the key opens GlobalActions only while the screen is on; otherwise it just wakes.
  function powerHold() { if (ui.power || ui.sleeping || ui.overlay === 'power-progress') { powerKey(); return; } ui.overlay = 'power-menu'; render(); }
  // Touch keys: any touch on the device lights them; holding Home for the 500 ms long-press timeout opens the recent apps.
  document.querySelector('#device').addEventListener('pointerdown', pokeKeylight, true);
  document.addEventListener('keydown', pokeKeylight, true);
  // Live dialog controls: "Show password." and "Use incoming call volume for notifications".
  overlayRoot.addEventListener('change', event => {
    if (event.target.matches('[data-wifi-show]')) { const input = overlayRoot.querySelector('[data-wifi-password]'); if (input) input.type = event.target.checked ? 'text' : 'password'; }
    if (event.target.matches('[data-vol-same]')) overlayRoot.querySelector('[data-vol-notification]')?.toggleAttribute('hidden', event.target.checked);
  });
  let previewHold = 0;
  viewport.addEventListener('pointerdown', event => {
    const anchor = event.target.closest('.gbl-arrow,.gbl-allapps'); if (!anchor || event.button || ui.view !== 'home') return;
    clearTimeout(previewHold);
    previewHold = setTimeout(() => {
      const swallow = click => { click.stopPropagation(); click.preventDefault(); window.removeEventListener('click', swallow, true); };
      window.addEventListener('click', swallow, true); setTimeout(() => window.removeEventListener('click', swallow, true), 600);
      if (data.settings.haptic !== false) navigator.vibrate?.(30);
      ui.gbPreviewAnchor = anchor.classList.contains('gbl-allapps') ? 'apps' : anchor.classList.contains('gbl-arrow-right') ? 'next' : 'previous';
      ui.overlay = 'gb-previews'; renderOverlay();
    }, 500);
  });
  for (const type of ['pointerup', 'pointercancel', 'pointerleave']) viewport.addEventListener(type, () => clearTimeout(previewHold));
  let folderTitleHold = 0;
  overlayRoot.addEventListener('pointerdown', event => {
    if (!event.target.closest('[data-gb-folder-title]') || event.button) return;
    clearTimeout(folderTitleHold);
    folderTitleHold = setTimeout(() => {
      const swallow = click => { click.stopPropagation(); click.preventDefault(); window.removeEventListener('click', swallow, true); };
      window.addEventListener('click', swallow, true); setTimeout(() => window.removeEventListener('click', swallow, true), 600);
      if (ICSLauncherFolders.folder(data, ui.folderId)?.live) return;
      ui.overlay = 'gb-dialog-rename'; renderOverlay(); overlayRoot.querySelector('.gbdlg input')?.select();
    }, 500);
  });
  for (const type of ['pointerup', 'pointercancel', 'pointerleave']) overlayRoot.addEventListener(type, () => clearTimeout(folderTitleHold));
  let homeHold = 0;
  navRoot.addEventListener('pointerdown', event => {
    const key = event.target.closest('.touch-home'); if (!key || key.disabled || event.button) return;
    clearTimeout(homeHold);
    homeHold = setTimeout(() => {
      homeHold = 0;
      const swallow = click => { click.stopPropagation(); click.preventDefault(); window.removeEventListener('click', swallow, true); };
      window.addEventListener('click', swallow, true); setTimeout(() => window.removeEventListener('click', swallow, true), 600);
      if (ui.view !== 'lock' && ui.overlay !== 'recent') { captureRecentView(); ui.overlay = 'recent'; renderOverlay(); }
    }, 500);
  });
  for (const type of ['pointerup', 'pointercancel', 'pointerleave']) navRoot.addEventListener(type, () => { clearTimeout(homeHold); homeHold = 0; });
  for (const key of [document.querySelector('#power-button'), document.querySelector('.power-key')]) { key.addEventListener('click', powerKey); GlobalActions.hold(key, powerHold); }
  // ShutdownThread: the confirmation, the "Shutting down…" progress dialog with a 500 ms vibration, then off.
  function powerConfirm(kind) {
    if (kind === 'bugreport') { ui.overlay = ''; render(); setTimeout(() => addNotification('Bug report captured', 'Touch to share your bug report'), 6000); return; }
    ui.overlay = 'power-progress'; renderOverlay(); navigator.vibrate?.(500);
    setTimeout(() => powerOff(kind === 'safemode'), GlobalActions.SHUTDOWN_MS);
  }
  function powerOff(reboot) {
    if (ui.activeCall) ui.activeCall = null;
    if (ui.music) ui.music.playing = false;
    ui.overlay = ''; ui.view = 'home'; ui.sub = ''; ui.recent = []; ui.recentState = {}; ui.recentSnapshots = {}; ui.safeMode = false; ui.power = 'off';
    render(); renderPower();
    if (reboot) setTimeout(() => bootUp(true), 900);
  }
  function bootUp(safeMode) {
    ui.power = 'boot'; ui.safeMode = safeMode; renderPower();
    setTimeout(() => { ui.power = ''; lockScreen(); ui.sleeping = false; if (!ui.locked && ui.view !== 'lock') home(); else render(); renderPower(); lastActivity = Date.now(); }, GlobalActions.BOOT_MS);
  }
  // Volume keys: the active stream's slider, a 3 s timeout, and a touch anywhere else closes it.
  const volumeLayer = document.createElement('div'); volumeLayer.id = 'volume-layer'; screen.append(volumeLayer);
  let volumeTimer = 0, volumePrevious = 0;
  const volumeStream = () => VolumePanel.activeStream({inCall: !!ui.activeCall, musicActive: !!ui.music?.playing});
  function volumeKey(direction) {
    if (ui.power) return;
    const stream = volumeStream();
    // With the screen off the keys only reach music that is playing, and no panel is shown.
    if (ui.sleeping && stream !== 'music') return;
    const result = VolumePanel.adjust(data.settings, stream, direction, volumePrevious); volumePrevious = direction;
    save(); renderStatus();
    if (result.vibrate) setTimeout(() => navigator.vibrate?.(VolumePanel.VIBRATE_DURATION), VolumePanel.VIBRATE_DELAY);
    if (!ui.sleeping) showVolume(stream);
  }
  function showVolume(stream) {
    volumeLayer.innerHTML = VolumePanel.render(data.settings, stream, key => i18n.t(key));
    VolumePanel.bindSeek(volumeLayer, VolumePanel.STREAMS[stream].max, value => { VolumePanel.setIndex(data.settings, stream, value); save(); VolumePanel.update(volumeLayer, data.settings, stream); resetVolumeTimeout(); });
    resetVolumeTimeout();
  }
  function resetVolumeTimeout() { clearTimeout(volumeTimer); volumeTimer = setTimeout(hideVolume, VolumePanel.TIMEOUT); }
  function hideVolume() { clearTimeout(volumeTimer); const panel = volumeLayer.firstElementChild; if (!panel || panel.classList.contains('fading')) return; panel.classList.add('fading'); setTimeout(() => panel.remove(), 400); }
  document.addEventListener('pointerdown', event => { if (volumeLayer.firstElementChild && !volumeLayer.contains(event.target) && !event.target.closest?.('.volume-key,.volume-rocker')) hideVolume(); }, true);
  // Held keys repeat after config_keyRepeatTimeout (500 ms) every 50 ms, as key repeats do.
  function bindVolumeKey(element, direction) {
    let delay = 0, repeat = 0;
    const stop = () => { clearTimeout(delay); clearInterval(repeat); };
    element.addEventListener('pointerdown', event => { if (event.button) return; event.preventDefault(); const dir = typeof direction === 'function' ? direction(event) : direction; volumeKey(dir); stop(); delay = setTimeout(() => { repeat = setInterval(() => volumeKey(dir), 50); }, 500); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => element.addEventListener(type, stop));
    element.addEventListener('click', event => { if (event.detail === 0) volumeKey(typeof direction === 'function' ? 1 : direction); });
  }
  bindVolumeKey(document.querySelector('#volume-down'), -1);
  bindVolumeKey(document.querySelector('#volume-up'), 1);
  bindVolumeKey(document.querySelector('.volume-rocker'), event => event.offsetY < event.currentTarget.clientHeight / 2 ? 1 : -1);
  const powerLayer = document.createElement('div'); powerLayer.id = 'power-layer'; screen.append(powerLayer);
  function renderPower() { powerLayer.innerHTML = ui.power === 'off' ? '<div class="ga-off"></div>' : ui.power === 'boot' ? GlobalActions.boot() : ui.safeMode ? GlobalActions.safeMode(key => i18n.t(key)) : ''; }
  screen.addEventListener('pointerdown',()=>{if(ui.sleeping){ui.sleeping=false;suppressClickUntil=Date.now()+350;if(ui.locked)render();else home(false);}},true);
  // Full screen (Fullscreen API): hides the browser chrome on phones and keeps portrait where the browser allows it.
  const fullscreenButton = document.querySelector('#fullscreen-button');
  const fullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement;
  if (!(document.fullscreenEnabled || document.webkitFullscreenEnabled)) fullscreenButton.hidden = true;
  fullscreenButton.addEventListener('click', () => {
    if (fullscreenElement()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else { const root = document.documentElement, request = root.requestFullscreen || root.webkitRequestFullscreen; Promise.resolve(request.call(root, {navigationUI: 'hide'})).then(() => screen.orientation?.lock?.('portrait')).catch(() => {}); }
  });
  const syncFullscreen = () => {
    const active = !!fullscreenElement(), label = i18n.t(active ? 'Exit full screen' : 'Full screen');
    document.documentElement.classList.toggle('is-fullscreen', active);
    fullscreenButton.title = label; fullscreenButton.setAttribute('aria-label', label);
  };
  document.addEventListener('fullscreenchange', syncFullscreen); document.addEventListener('webkitfullscreenchange', syncFullscreen);
  // The handle slides the header in; it hides again 4 s after the last touch on it.
  let peekTimer = 0;
  const peek = () => { document.documentElement.classList.add('header-peek'); clearTimeout(peekTimer); peekTimer = setTimeout(() => document.documentElement.classList.remove('header-peek'), 4000); };
  document.querySelector('#header-handle').addEventListener('click', peek);
  document.querySelector('.site-header').addEventListener('pointerdown', () => { if (document.documentElement.classList.contains('header-peek')) peek(); });
  document.addEventListener('fullscreenchange', () => { if (!fullscreenElement()) { clearTimeout(peekTimer); document.documentElement.classList.remove('header-peek'); } });
  const languageSelect = document.querySelector('#language-select');
  languageSelect.value = i18n.language;
  languageSelect.addEventListener('change', event => { i18n.setLanguage(event.target.value); location.reload(); });
  document.querySelector('#reset-button').addEventListener('click', () => {
    if (!confirm(i18n.t('Reset all local ICS simulator data?'))) return;
    resetSimulator();
  });
  let lastWidgetMinute = '';
  setInterval(() => {
    lockControls.tick();
    document.querySelectorAll('.status-clock').forEach(node => { node.textContent = clock(); });
    const now = deviceDate();
    if(!document.hidden && !ui.sleeping && ui.view!=='lock' && !ui.overlay && !ui.activeCall && !dragState && Date.now()-lastActivity>=data.settings.sleep*1000){captureRecentView();lockScreen();lastActivity=Date.now();}
    if(ui.activeCall){
      const screen=viewport.querySelector('.gbic'),state=GBPhone.callState(ui.activeCall);
      if(screen&&screen.dataset.state!==state)render();
      else if(screen&&state==='active'){const elapsed=screen.querySelector('.gbic-elapsed');if(elapsed)elapsed.textContent=GBPhone.elapsedText(ui.activeCall);}
    }
    checkAlarms(now);
    checkReminders(now);
    if(ui.view==='gallery' && ui.sub==='photo' && ui.gallerySlideshow && !ui.overlay && Date.now()-ui.gallerySlideAt>=3000){ui.gallerySlideAt=Date.now();galleryStep(1);}
    const deskTime=document.querySelector('.desk-time');
    if(deskTime) {
      deskTime.textContent=now.toLocaleTimeString(i18n.locale(),{hour:'2-digit',minute:'2-digit',hour12:!data.settings.hour24});
      document.querySelector('.desk-date').textContent=now.toLocaleDateString(i18n.locale(),{weekday:'long',month:'long',day:'numeric'});
    }
    document.querySelectorAll('.analog-clock').forEach(node => {
      node.setAttribute('aria-label', clock());
      node.querySelector('.clock-hour').style.transform = `rotate(${now.getHours() % 12 * 30 + now.getMinutes() / 2}deg)`;
      node.querySelector('.clock-minute').style.transform = `rotate(${now.getMinutes() * 6}deg)`;
    });
    const lockTime = document.querySelector('.lock-time'); if (lockTime) lockTime.textContent = clock();
    tickMusic();
    const minute = stamp => `${stamp.toDateString()} ${stamp.getHours()}:${stamp.getMinutes()}`;
    if (minute(now) !== lastWidgetMinute) {
      lastWidgetMinute = minute(now);
      if (ui.view === 'home' && !ui.overlay && !pointerStart && !dragState && viewport.querySelector('.calw')) render();
    }
  }, 1000);

  i18n.translateDOM(document.body);
  render();
})();
