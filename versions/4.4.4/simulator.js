/* Android 4.3 Jelly Bean browser simulation (Nexus 4, JWR66Y). No network or Android runtime required. */
(() => {
  'use strict';

  const STORE = 'android-time-machine-kk-v1';
  const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const defaultData = {
    // Launcher2 shows its clings on the first run; saved desktops from before count as dismissed.
    clings: LauncherClings.fresh(),
    wallpaper: 0,
    // Stock Nexus 5 (Google Now Launcher): one home pane right of Google Now with the Google folder and Play Store on
    // the bottom row; the dock holds Phone, Hangouts, all apps, Chrome and Camera. Revision 5 adds the DeskClock
    // digital clock across the top two rows (owner request: a clock on the home screen by default).
    layoutRevision: 6,
    homePages: [Array.from({length: 16}, (_, slot) => slot === 12 ? 'folder-google' : slot === 15 ? 'play-store' : null)],
    homeWidgets: [[{id: 'default-digital', type: 'digitalclock', x: 0, y: 0, width: 4, height: 2}]],
    folders: {'folder-google': {name: 'Google', items: ['gmail', 'google-plus', 'photos', 'maps', 'people', 'calendar', 'keep', 'drive', 'youtube', 'play-music', 'play-games']}},
    keepNotes: StockApps.DEFAULT_NOTES.map(note => ({...note})),
    dock: ['phone', 'hangouts', 'apps', 'chrome', 'camera'],
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
      { id: 1, title: 'Welcome to Android 4.4', detail: 'Your phone is ready to explore.' },
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
      // The KitKat scaffold started from the Jelly Bean desktop; switch it to the Launcher3 one.
      if ((saved.layoutRevision || 0) < 3) { result.clings = clone(defaultData.clings); }
      // Revision 4 moves the desktop from the AOSP Launcher3 layout to the stock Nexus 5 one.
      if ((saved.layoutRevision || 0) < 4) { result.homePages = clone(defaultData.homePages); result.homeWidgets = clone(defaultData.homeWidgets); result.dock = clone(defaultData.dock); result.folders = clone(defaultData.folders); result.layoutRevision = 4; }
      while (result.homeWidgets.length < result.homePages.length) result.homeWidgets.push([]);
      result.homeWidgets.length = result.homePages.length;
      // Revision 5: the default clock goes on the first page only where its two rows are still empty.
      if ((saved.layoutRevision || 0) < 5) {
        const page = result.homePages[0] || [], widgets = result.homeWidgets[0] || [];
        const free = page.slice(0, 8).every(slot => !slot) && !widgets.some(widget => (widget.y || 0) < 2);
        if (free && !widgets.some(widget => widget.type === 'digitalclock')) widgets.push(clone(defaultData.homeWidgets[0][0]));
        result.homeWidgets[0] = widgets; result.layoutRevision = 5;
      }
      // Revision 6: the Google folder gets GSMArena's launch contents unless it was edited.
      if ((saved.layoutRevision || 0) < 6) {
        const folder = result.folders?.['folder-google'];
        if (folder && JSON.stringify(folder.items) === JSON.stringify(['gmail', 'play-movies', 'play-music', 'play-books', 'play-games', 'photos'])) folder.items = clone(defaultData.folders['folder-google'].items);
        result.layoutRevision = 6;
      }
      // Earlier photo frames were 2 × 2 and showed the first picture; keep their footprint.
      result.homeWidgets.flat().forEach(widget => { if (widget?.type === 'photo' && !('source' in widget) && !widget.width) { widget.width = 2; widget.height = 2; } });
      // A reload during Gallery widget configuration leaves no completed choice.
      result.homeWidgets = result.homeWidgets.map(page => Array.isArray(page) ? page.filter(widget => widget && !(widget.type === 'photo' && widget.source === null)) : []);
      if (result.wallpaper === 4 && result.customWallpaper) result.wallpaper = 11;
      return result;
    } catch { return clone(defaultData); }
  }
  let data = load();
  data.settings={...ICSSettingsDetail.defaults,...ICSSystemSettings.defaults,...JBDeveloperOptions.DEFAULTS,spellChecker:true,imeLatin:true,...data.settings};
  ICSLockscreen.initialize(data);
  function save() { try { localStorage.setItem(STORE, JSON.stringify(data)); } catch {} }
  const ui = {
    view: 'home', sub: '', page: 0, drawerTab: 'apps', drawerPage: 0, overlay: '', overview: false,
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
    { id: 1, from: 'Android Team', subject: 'Welcome to Android', body: 'Your Nexus 5 is ready. Explore Android 4.4 KitKat, customize your home screen, and discover the little surprise hidden in Settings.', time: '9:41 AM' },
    { id: 2, from: 'Alex Morgan', subject: 'Photos from the weekend', body: 'I added a few pictures to our album. Take a look when you have a moment!', time: 'Yesterday' },
    { id: 3, from: 'Calendar', subject: 'Coffee with Alex', body: 'Reminder: Coffee with Alex at 11:00.', time: 'Yesterday' }
  ];
  const tracks = ICSMusic.tracks;
  data.mailbox=ICSEmail.restore(data.mailbox,emailData,data.sentEmails);
  data.gmailbox=GmailApp.restore(data.gmailbox);
  ui.music=ICSMusic.restore(data.music);
  ui.musicTrack=ui.music.track;
  ui.browserSession = ICSBrowserSession.restore(data.browserSession,data.browserHistory);
  // Chrome and the AOSP Browser keep separate tabs; ui.browserSession is the one of the browser in front.
  ui.browserOwner = 'browser'; ui.browserSessions = {};
  syncBrowserState();
  const apps = [
    ['phone', 'Phone', '☎', '#3dc484', '#217258'], ['people', 'People', '◉', '#efa96f', '#a45142'],
    ['messaging', 'Messaging', '✉', '#84cf62', '#428c43'], ['browser', 'Browser', '◎', '#65aee2', '#246ba8'],
    ['camera', 'Camera', '▣', '#c8cbd0', '#6b7a87'], ['gallery', 'Gallery', '▧', '#e9b674', '#8d673c'],
    ['settings', 'Settings', '⚙', '#b7c5ce', '#53606f'], ['clock', 'Clock', '◷', '#71b7dc', '#3d6e8d'],
    ['calendar', 'Calendar', '31', '#7ec7e7', '#397c9e'], ['calculator', 'Calculator', '＋', '#7cb4bd', '#32727f'],
    ['music', 'Music', '♫', '#fd9e70', '#c25360'], ['email', 'Email', '✉', '#75b7df', '#326b9e'],
    ['play-store', 'Play Store', '▶', '#b5d26d', '#53732f'], ['downloads', 'Downloads', '⬇', '#8bc34a', '#33691e'],
    // Google apps of the stock Nexus 5 (Google Now Launcher build). Hangouts, Chrome, Gmail and Photos open the
    // simulated AOSP equivalents for now; the Play media apps and Google Settings are not simulated.
    ['hangouts', 'Hangouts', '❝', '#8bc34a', '#33691e'], ['chrome', 'Chrome', '◎', '#4285f4', '#db4437'], ['gmail', 'Gmail', '✉', '#ffffff', '#db4437'],
    ['photos', 'Photos', '✿', '#fbbc05', '#34a853'], ['play-books', 'Play Books', '▤', '#4285f4', '#1a73e8'], ['play-games', 'Play Games', '✚', '#8bc34a', '#558b2f'],
    ['play-movies', 'Play Movies & TV', '▶', '#e53935', '#b71c1c'], ['play-music', 'Play Music', '♫', '#ff9800', '#e65100'], ['google-settings', 'Google Settings', 'g', '#757575', '#424242'],
    // The rest of the stock Nexus 5 drawer (stock-apps.js), with icons drawn after their 2013 looks.
    ['google-plus', 'Google+', 'g+', '#dd4b39', '#b03a2e'], ['maps', 'Maps', '⌖', '#cfe6b8', '#4285f4'], ['keep', 'Keep', '✎', '#f7c600', '#d9a800'],
    ['drive', 'Drive', '△', '#0da960', '#4688f4'], ['youtube', 'YouTube', '▶', '#e62117', '#b31217'], ['earth', 'Earth', '◍', '#1f6fd1', '#0b2f73'],
    ['google-search', 'Google', 'g', '#4285f4', '#3367d6'], ['news-weather', 'News & Weather', '☼', '#4285f4', '#9e9e9e'], ['voice-search', 'Voice Search', '🎤', '#eeeeee', '#5f6368']
  ];
  const SVG_ICONS = new Set(['google-plus', 'maps', 'keep', 'drive', 'youtube', 'earth', 'news-weather', 'voice-search']);
  const GEL_ALIASES = {};
  const GEL_UNSIMULATED = [];
  // Play Music, Movies & TV, Books and Games (play-apps.js).
  const PLAY_APPS = ['play-music', 'play-movies', 'play-books', 'play-games'];
  const wifiNetworks = [
    { name: 'AndroidAP', security: 'WPA2', strength: 4 },
    { name: 'CoffeeShop', security: 'Open', strength: 3 },
    { name: 'Home Network', security: 'WPA2', strength: 4 },
    { name: 'Library Wi-Fi', security: 'Open', strength: 2 }
  ];
  // Launcher2 4.3 wallpapers (drawable-nodpi; 06 and 07 are tablet-only). wallpaper_01 is also the framework default_wallpaper.
  const wallpaperFiles = ['01','02','03','04','05','08','09','10','11','12'];
  // Index 0 is the framework default_wallpaper from the hammerhead overlay (2160 x 1920).
  const wallpaperUrl = index => index === 0 || !wallpaperFiles[index] ? 'assets/kk-default_wallpaper.jpg' : `assets/jb-wallpaper_${wallpaperFiles[index]}.jpg`;
  const homePageCount = () => data.homePages.length - (ui.extraScreen ? 1 : 0);
  /* Workspace.wallpaperOffsetForCurrentScroll: a still wallpaper spans at least MIN_PARALLAX_PAGE_SPAN (3) page
     gaps, a live one exactly the pages there are; the extra empty screen added while dragging does not count. */
  function wallpaperOffset(page, live = !!liveWallpaper) {
    const pages = homePageCount(), span = live ? pages - 1 : Math.max(3, pages - 1);
    return span > 0 ? Math.max(0, Math.min(pages - 1, page)) / span : 0;
  }
  function setWallpaperPan(page, animate = true) {
    if (data.wallpaper === 11) return;
    screen.style.transition = animate ? 'background-position .35s cubic-bezier(.215,.61,.355,1)' : 'none';
    screen.style.backgroundPosition = `${(wallpaperOffset(page, false) * 100).toFixed(3)}% center`;
  }
  const widgetTypes = [
    { type: 'analog', name: 'Analog clock', app: 'clock', width: 2, height: 2 },
    { type: 'calendar', name: 'Calendar', app: 'calendar', width: 2, height: 3, resize: {minWidth: 2, minHeight: 2} },
    { type: 'digitalclock', name: 'Digital clock', app: 'clock', width: 3, height: 2, resize: {minWidth: 2, minHeight: 1} },
    { type: 'music', name: 'Music', app: 'music', width: 4, height: 1 },
    // Gallery2 asks for 180dp plus ICS default widget padding: 3 × 3 Launcher cells.
    { type: 'photo', name: 'Photo Gallery', app: 'gallery', width: 3, height: 3 },
    { type: 'power', name: 'Power control', app: 'settings', width: 4, height: 1 }
  ];
  const widgetSize = value => {
    const widget = typeof value === 'string' ? {type: value} : value;
    return {...(widgetTypes.find(item => item.type === widget.type) || {width: 2, height: 2}), ...widget};
  };
  const iconAssets = new Set(['phone', 'people', 'messaging', 'browser', 'camera', 'gallery', 'settings', 'clock', 'calendar', 'calculator', 'music', 'email', 'apps', 'downloads', 'hangouts', 'chrome', 'gmail', 'photos', 'play-books', 'play-games', 'play-movies', 'play-music', 'google-settings']);
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
    if (SVG_ICONS.has(id) || id === 'google-search') return `<span class="app-icon"><img src="assets/${id === 'google-search' ? 'google' : id}.svg" alt=""></span>`;
    if (id === 'play-store') return '<span class="app-icon"><img src="assets/play-store.svg?v=2" alt=""></span>';
    if (id === 'apps') return '<span class="app-icon"><img src="assets/l3-ic_allapps.png" alt=""></span>';
    const folder=ICSLauncherFolders.folder(data,id);
    if(folder)return `<span class="app-icon launcher-folder-icon">${folder.items.slice(0,3).map(app=>`<span class="folder-preview-item">${appIcon(app)}</span>`).join('')}</span>`;
    if (id === 'google') return '<span class="app-icon google-folder-icon"><img src="assets/browser.png" alt=""><img src="assets/email.png" alt=""><img src="assets/calendar.png" alt=""><img src="assets/gallery.png" alt=""></span>';
    const item = apps.find(app => app[0] === id);
    if (!item) return '';
    return iconAssets.has(id)
      ? `<span class="app-icon"><img src="assets/${id}.png" alt=""></span>`
      : `<span class="app-icon fallback" style="--icon-light:${item[3]};--icon-dark:${item[4]}">${item[2]}</span>`;
  };
  const folderName=id=>ICSLauncherFolders.folder(data,id)?.name||i18n.t('Unnamed folder');
  const launcherIcon = id => ICSLauncherFolders.folder(data,id)
    ? `<button class="launcher-icon" data-action="folder-open" data-folder-id="${safe(id)}" aria-label="${safe(folderName(id))}" data-no-translate>${appIcon(id)}<span>${safe(folderName(id))}</span></button>`
    : `<button class="launcher-icon" data-action="${id==='apps'?'drawer':'open-app'}" ${id==='apps'?'':`data-app="${id}"`} aria-label="${safe(appNames[id]||'Apps')}">${appIcon(id)}<span>${safe(appNames[id]||'Apps')}</span></button>`;
  const actionbar = (title, right = '') => `<div class="actionbar"><button class="up" data-action="${ui.view === 'settings' && !ui.sub ? 'noop' : 'back'}" aria-label="${ui.view === 'settings' && !ui.sub ? 'Settings' : 'Back'}">${ui.view === 'settings' ? `${ui.sub ? '<img class="up-chevron" src="assets/ic_ab_back_holo_dark.png" alt="">' : ''}<img class="settings-header-icon" src="assets/settings.png" alt="">` : '‹'}</button><h2>${safe(title)}</h2>${right}</div>`;
  const content = (inner, theme = '') => `<div class="app-content ${theme}">${inner}</div>`;
  const appView = (title, inner, theme = '', right = '') => `<div class="app-view ${ui.view === 'settings' ? `settings-app ${!ui.sub ? 'settings-main' : ''}` : ''}">${actionbar(title, right)}${content(inner, ui.view === 'settings' ? `settings-dark ${theme}` : theme)}</div>`;
  const settingIcon = (id, fallback) => ui.view === 'settings' && ['wireless','bluetooth','data','sound','display','storage','battery','apps','language','date','about','sync','location','security','backup','accessibility','development','nfc-payment','print'].includes(id) ? `<img src="assets/setting-${id}.png${id === 'bluetooth' ? '?v=2' : ''}" alt="">` : fallback;
  const row = (title, subtitle, action, id, icon = '') => `<button class="settings-row" data-action="${action}" data-id="${safe(id)}"><span class="row-icon">${icon === null ? '' : settingIcon(id, icon)}</span><span class="row-copy">${safe(title)}${subtitle ? `<small>${safe(subtitle)}</small>` : ''}</span><span class="chevron">›</span></button>`;
  const toggleRow = (title, subtitle, key) => wirelessCheckRow(title, subtitle, key);
  const connectivitySwitch = (key, title, inHeader = false) => `<button class="holo-switch ${data.settings[key] ? 'on' : ''} ${inHeader ? 'settings-action-switch' : ''}" data-action="toggle-setting" data-id="${key}" role="switch" aria-label="${safe(title)}" aria-checked="${data.settings[key]}"><span class="switch-label" aria-hidden="true">${data.settings[key] ? 'ON' : 'OFF'}</span></button>`;
  const connectivityRow = (title, key) => `<div class="settings-row connectivity-row"><button class="connectivity-open" data-action="settings-sub" data-id="${key}"><span class="row-icon">${settingIcon(key === 'wifi' ? 'wireless' : key, '')}</span><span class="row-copy">${safe(title)}</span></button>${connectivitySwitch(key, title)}</div>`;
  const wirelessRow = (title, subtitle, id) => `<button class="settings-row wireless-row" data-action="settings-sub" data-id="${id}"><span class="row-copy">${safe(title)}${subtitle ? `<small>${safe(subtitle)}</small>` : ''}</span></button>`;
  const wirelessCheckRow = (title, subtitle, key) => `<button class="settings-row wireless-row" data-action="toggle-setting" data-id="${key}" role="checkbox" aria-checked="${data.settings[key]}"><span class="row-copy">${safe(title)}${subtitle ? `<small>${safe(subtitle)}</small>` : ''}</span><img class="holo-checkbox" src="assets/btn_check_${data.settings[key] ? 'on' : 'off'}_holo_dark.png" alt=""></button>`;
  const label = text => `<div class="section-label">${safe(text)}</div>`;
  const LOCATION_MODES = {high: ['High accuracy', 'Use GPS, Wi‑Fi, and mobile networks to determine location'], battery: ['Battery saving', 'Use Wi‑Fi and mobile networks to determine location'], device: ['Device only', 'Use GPS to determine your location']};
  const locationMode = () => data.settings.gps && data.settings.networkLocation ? 'high' : data.settings.gps ? 'device' : 'battery';
  // Plain 4.3 preference rows (no icon or chevron); rows without their own screen explain that in a toast.
  const prefRow = (title, summary, action = 'dev-info', id = '') => `<button class="settings-row wireless-row" data-action="${action}" data-id="${safe(id || title)}"><span class="row-copy">${safe(i18n.t(title))}${summary ? `<small>${safe(i18n.t(summary))}</small>` : ''}</span></button>`;
  const carrierName = () => data.settings.airplane ? i18n.t('No service.') : safe(data.settings.networkOperator||'Telekom');
  let lastActivity=Date.now();
  for(const name of ['pointerdown','keydown','input','wheel'])document.addEventListener(name,()=>{lastActivity=Date.now();},{passive:true,capture:true});
  const lockControls=ICSLockscreen.controller({getData:()=>data,getUI:()=>ui,t:key=>i18n.t(key),save,render,clock,date:fullDate,carrier:()=>data.settings.airplane?i18n.t('No service.'):data.settings.networkOperator||'Telekom',toast,unlock:()=>{ui.locked=false;ui.sleeping=false;const pending=ui.kgPending;ui.kgPending=null;ui.kgBouncing=false;ui.kgUp=true;home(false);if(pending)afterKeyguardDismiss(pending);},
    // Android 4.3 security views (KeyguardPatternView/PINView/PasswordView) inside the SlidingChallengeLayout.
    look:{wrong:kind=>JBKeyguard.WRONG[kind],clearMs:JBKeyguard.S.clear,message:({state,remaining})=>JBKeyguard.securityMessage({error:state.error,errorAt:state.errorAt,remaining,owner:data.settings.showOwner?data.settings.ownerInfo:''},key=>i18n.t(key)),renderLock:api=>renderSecureKeyguard(api)}});
  ui.locked=ICSLockscreen.secure(data);if(ui.locked)ui.view='lock';lockControls.lock();lockControls.bind(screen);
  // BatteryMeterView (4.4): the button is 25 %-75 % wide and 12 % tall; frame #66FFFFFF, level white, red at 15 % or less.
  const kkBattery = level => `<svg class="kk-battery" viewBox="0 0 10.5 16" aria-label="Battery ${level}%"><path d="M2.75 .4h5v1.6h-5zM.4 2.32h9.7v13.28H.4z" fill="#fff" fill-opacity=".4"/><rect x=".4" y="${(2.32 + 13.28 * (1 - level / 100)).toFixed(2)}" width="9.7" height="${(13.28 * level / 100).toFixed(2)}" fill="${level <= 15 ? '#ff3300' : '#fff'}"/></svg>`;
  const statusBarHeight = () => statusRoot.offsetHeight || 22.65;
  // Launcher3 and the keyguard draw under translucent system bars; apps get opaque ones.
  function updateBarMode() {
    screen.classList.toggle('kk-translucent', ['home', 'lock', 'drawer'].includes(ui.view) && !ui.sleeping);
    // PlatLogoActivity is fullscreen; the Dessert Case hides both bars (immersive sticky).
    const egg = ui.view === 'settings' && ['easter', 'dessert'].includes(ui.sub);
    // Theme.WallpaperPicker is fullscreen as well.
    screen.classList.toggle('kk-hide-status', egg || ui.view === 'wallpaper-picker');
    screen.classList.toggle('kk-immersive', egg && ui.sub === 'dessert');
    if (!egg) screen.classList.remove('kk-bars-peek');
  }
  const statusIndicators = () => `<span class="status-right">${data.settings.bluetooth ? '<img class="status-bluetooth" src="assets/kk-stat_sys_data_bluetooth.png" alt="">' : ''}${data.settings.silent ? `<img src="assets/kk-stat_sys_ringer_${data.settings.silentMode === 'vibrate' ? 'vibrate' : 'silent'}.png" alt="">` : ''}${data.alarms.some(alarm => alarm.enabled) ? '<img src="assets/kk-stat_sys_alarm.png" alt="">' : ''}<span class="status-cluster">${data.settings.wifi && data.settings.wifiNetwork ? '<img class="status-wifi" src="assets/kk-stat_sys_wifi_signal_4_fully.png" alt="">' : ''}${!data.settings.airplane && data.settings.dataEnabled !== false && !(data.settings.wifi && data.settings.wifiNetwork) ? '<img class="status-data-type" src="assets/kk-stat_sys_data_fully_connected_h.png" alt="">' : ''}<img src="assets/kk-${data.settings.airplane ? 'stat_sys_signal_flightmode' : 'stat_sys_signal_4_fully'}.png" alt=""></span>${kkBattery(71)}<span class="status-clock">${clock()}</span></span>`;

  function renderStatus() {
    updateBarMode();
    const notificationIcons = data.notifications.length ? `${data.notifications.some(item => item.id === 2) ? '<img src="assets/stat_notify_hangouts.png" alt="">' : ''}${data.notifications.some(item => item.kind === 'calendar') ? '<img src="assets/calendar-stat_notify_calendar.png" alt="">' : ''}${data.notifications.some(item => item.id !== 2 && item.kind !== 'calendar') ? '<img src="assets/stat_notify_more.png" alt="">' : ''}` : '';
    statusRoot.innerHTML = `<button class="status-button" data-action="shade" aria-label="Open notifications"><span class="status-left">${notificationIcons}</span>${statusIndicators()}</button>`;
    i18n.translateDOM(statusRoot);
  }
  function renderNav() {
    navRoot.innerHTML = `<button class="nav-key nav-back" data-action="back" aria-label="Back"><img src="assets/kk-ic_sysbar_back.png" alt=""></button><button class="nav-key nav-home" data-action="home" aria-label="Home screen"><img src="assets/kk-ic_sysbar_home.png" alt=""></button><button class="nav-key nav-recent" data-action="recent" aria-label="Recent apps"><img src="assets/kk-ic_sysbar_recent.png" alt=""></button>`;
    if(ui.locked)navRoot.querySelectorAll('.nav-home,.nav-recent').forEach(button=>{button.disabled=true;button.setAttribute('aria-hidden','true');});
  }
  // Window transitions: the outgoing view is kept in a temporary layer while both animate.
  let lastScene = null, pendingNav = '', activeTransition = null, launchFrom = null;
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
  function startTransition(name, outgoing, incoming, override = null) {
    endTransition();
    const spec = override || ICSTransitions.specs[name], factor = animationScale(name);
    if (!spec || !factor || reducedMotion?.matches || document.hidden) return;
    const box = {top: viewport.offsetTop, left: viewport.offsetLeft, width: viewport.offsetWidth, height: viewport.offsetHeight};
    const layer = (className, child) => { const node = document.createElement('div'); node.className = `transition-layer ${className}`; node.setAttribute('aria-hidden', 'true'); node.inert = true; Object.assign(node.style, {top: `${box.top}px`, left: `${box.left}px`, width: `${box.width}px`, height: `${box.height}px`}); if (child) node.append(child); screen.insertBefore(node, overlayRoot); return node; };
    const layers = [];
    if (spec.black) layers.push(layer('transition-backdrop'));
    if (outgoing) layers.push(layer(spec.exit.top ? 'transition-over' : 'transition-under', outgoing));
    screen.classList.add('transitioning');
    const animations = [...ICSTransitions.play(outgoing, spec.exit, factor), ...ICSTransitions.play(incoming, spec.enter, factor)];
    activeTransition = {name, spec, factor, start: performance.now(), layers, animations, timer: setTimeout(endTransition, ICSTransitions.length(spec) * factor + 40)};
  }
  function render() {
    updateBarMode();
    viewport.querySelectorAll('.home-widget .calw-list').forEach(list => { (ui.widgetScroll ||= {})[list.closest('.home-widget').dataset.widgetId] = list.scrollTop; });
    if(ui.locked)ui.view='lock';
    const outgoing = viewport.firstElementChild;
    screen.className = `screen${activeTransition ? ' transitioning' : ''} wallpaper-${data.wallpaper}${data.settings.largeText ? ' large-text' : ''}${ui.sleeping?' sleeping':''}${ui.locked?' credential-locked':''}`;
    screen.style.background = data.wallpaper === 11 && data.customWallpaperPhoto ? `#080d14 url('${ICSMedia.image(data.customWallpaperPhoto)}') center / cover no-repeat` : data.wallpaper === 11 && data.customWallpaper ? `linear-gradient(160deg, ${data.customWallpaper[0]}, ${data.customWallpaper[1]} 53%, ${data.customWallpaper[2]})` : `#080d14 url('${wallpaperUrl(data.wallpaper)}') ${(wallpaperOffset(['home', 'drawer'].includes(ui.view) ? ui.page : 0, false) * 100).toFixed(3)}% center / auto 100% no-repeat`;
    screen.style.transition = 'none';
    screen.style.filter = `brightness(${.5 + data.settings.brightness / 135})`;
    renderStatus(); renderNav(); syncLiveWallpaper();
    document.querySelector('.notification-led')?.classList.toggle('on', !!ui.sleeping && !ui.power && data.settings.pulse !== false && data.notifications.length > 0);
    JBDeveloperOptions.apply(screen, data.settings);
    if (ui.view !== 'lock' && ui.kgPad) { ui.kgPad.destroy(); ui.kgPad = null; }
    if (ui.view !== 'lock' && ui.kgChallenge) { ui.kgChallenge.destroy(); ui.kgChallenge = null; }
    if (ui.view === 'lock') { viewport.innerHTML = renderLock(); attachKeyguard(); }
    else if (ui.view === 'home') { viewport.innerHTML = renderHome(); restoreWidgetScroll(); }
    else if (ui.view === 'drawer') viewport.innerHTML = renderDrawer();
    else viewport.innerHTML = renderApp();
    renderOverlay();
    i18n.translateDOM(screen);
    const scene = {view: ui.view, sub: ui.sub}, transit = ui.sleeping ? '' : ICSTransitions.kind(lastScene, scene, pendingNav);
    lastScene = scene;
    // Launcher icons, folders and the drawer start apps with a scale-up from the tapped icon.
    const launch = launchFrom && (transit === 'wallpaper-close' || launchFrom.recents) ? ICSTransitions.scaleUp(launchFrom, viewport.offsetWidth, viewport.offsetHeight) : null;
    const transitName = transit || (launch ? 'task-open' : '');
    launchFrom = null;
    if (transitName) startTransition(transitName, launch ? null : outgoing, viewport.firstElementChild, launch);
    else if (activeTransition) {
      // A same-screen re-render during a transition continues the incoming animation.
      const elapsed = performance.now() - activeTransition.start;
      ICSTransitions.play(viewport.firstElementChild, activeTransition.spec.enter, activeTransition.factor).forEach(animation => { animation.currentTime = elapsed; activeTransition.animations.push(animation); });
    }
    if (ui.jbgal && !viewport.querySelector('[data-jbgal]')?.isSameNode(ui.jbgal.root)) { ui.jbgal.destroy(); ui.jbgal = null; }
    const galRoot = viewport.querySelector('[data-jbgal]');
    if (galRoot && !ui.jbgal) ui.jbgal = {...JBGallery.attach(galRoot, {data, ui, t: key => i18n.t(key), media: ICSMedia, locale: i18n.locale(), save, render, toast, openCamera: () => { ui.galleryFromCamera = false; openApp('camera'); }, setWallpaper: galleryWallpaper, reduced: !!reducedMotion?.matches}), root: galRoot};
    if (ui.jbcam && !viewport.querySelector('[data-jbcam]')?.isSameNode(ui.jbcam.root)) { ui.jbcam.destroy(); ui.jbcam = null; }
    const camRoot = viewport.querySelector('[data-jbcam]');
    if (camRoot && !ui.jbcam) ui.jbcam = {...JBCamera.attach(camRoot, {data, ui, t: key => i18n.t(key), media: ICSMedia, save, render, shoot: cameraShoot, gallery: cameraGallery, toast, reduced: !!reducedMotion?.matches}), root: camRoot};
    if (ui.kkEgg && !viewport.querySelector('[data-kk-platlogo]')?.isSameNode(ui.kkEgg.root)) { ui.kkEgg.destroy(); ui.kkEgg = null; }
    const eggRoot = viewport.querySelector('[data-kk-platlogo]');
    if (eggRoot && !ui.kkEgg) ui.kkEgg = KKEgg.platLogo(eggRoot, {reduced: !!reducedMotion?.matches, onDessert: () => { data.settings.dessertCaseUnlocked = data.settings.dessertCaseUnlocked || Date.now(); save(); ui.sub = 'dessert'; render(); }});
    if (ui.dessert && !viewport.querySelector('[data-kk-dessert]')?.isSameNode(ui.dessert.root)) { ui.dessert.stop(); ui.dessert = null; }
    const dessertRoot = viewport.querySelector('[data-kk-dessert]');
    if (dessertRoot && !ui.dessert) requestAnimationFrame(() => { if (dessertRoot.isConnected && !ui.dessert) ui.dessert = KKEgg.dessertCase(dessertRoot, {reduced: !!reducedMotion?.matches}); });
    if (ui.beanBag && !viewport.querySelector('[data-beanbag]')?.isSameNode(ui.beanBag.root)) { ui.beanBag.stop(); ui.beanBag = null; }
    const beanRoot = viewport.querySelector('[data-beanbag]');
    if (beanRoot && !ui.beanBag) requestAnimationFrame(() => { if (beanRoot.isConnected && !ui.beanBag) ui.beanBag = {...JBBeanBag.start(beanRoot), root: beanRoot}; });
    if (ui.view === 'clock' && viewport.querySelector('.jbclock-app')) clockTicker();
    if (['browser', 'chrome'].includes(ui.view) && !ui.sub && ui.browserFind) highlightBrowserText();
    if (ui.view === 'photos' && ui.sub === 'photo') attachPhotosSwipe();
    if(ui.view==='calendar' && viewport.querySelector('.cal-time-scroll'))viewport.querySelector('.cal-time-scroll').scrollTop=8*48;
  }
  function restoreWidgetScroll() {
    ui.widgetScroll = ui.widgetScroll || {};
    viewport.querySelectorAll('.home-widget .calw-list').forEach(list => {
      const id = list.closest('.home-widget').dataset.widgetId;
      list.scrollTop = ui.widgetScroll[id] || 0;
    });
  }
  // recents_return_to_launcher: Recents fades out while the launcher fades back in (250 ms).
  function closeRecents() {
    const panel = overlayRoot.querySelector('.recent-panel'); ui.recentPopup = null;
    JBRecents.close(panel, () => { ui.overlay = ''; renderOverlay(); if (!reducedMotion?.matches) viewport.firstElementChild?.animate([{opacity: 0}, {opacity: 1}], {duration: JBRecents.R.window, easing: 'cubic-bezier(.215,.61,.355,1)'}); }, !!reducedMotion?.matches);
  }
  /* SearchPanelView: an upward swipe of navbar_search_up_threshhold (40dp) from the navigation bar shows the ring;
     releasing on the assist target starts search (the Google Search app on Google builds, Browser here). */
  // PointerLocationView: the bar at the top follows the primary pointer while the option is on.
  let pointerDownCount = 0;
  screen.addEventListener('pointerdown', event => { pointerDownCount++; if (data.settings.pointerLocation) JBDeveloperOptions.pointerMove(screen, event, true, 1); }, true);
  screen.addEventListener('pointermove', event => { if (data.settings.pointerLocation) JBDeveloperOptions.pointerMove(screen, event, event.buttons > 0, 1); }, true);
  window.addEventListener('pointerup', event => { if (data.settings.pointerLocation) JBDeveloperOptions.pointerMove(screen, event, false, 1); }, true);
  let searchSwipe = null;
  navRoot.addEventListener('pointerdown', event => { if (ui.locked || ui.view === 'lock' || event.button > 0) return; searchSwipe = {id: event.pointerId, x: event.clientX, y: event.clientY, panel: null}; }, true);
  window.addEventListener('pointermove', event => {
    if (!searchSwipe || event.pointerId !== searchSwipe.id) return;
    const box = overlayRoot.getBoundingClientRect(), k = box.width / overlayRoot.offsetWidth || 1;
    if (!searchSwipe.panel) {
      if ((searchSwipe.y - event.clientY) / k < JBSearchPanel.S.up) return;
      const home = navRoot.querySelector('.nav-home').getBoundingClientRect();
      ui.overlay = 'search'; overlayRoot.innerHTML = ''; renderOverlay();
      searchSwipe.panel = JBSearchPanel.attach(overlayRoot.querySelector('[data-jb-search]'), {homeX: (home.left + home.width / 2 - box.left) / k, haptic: () => data.settings.haptic !== false, reduced: !!reducedMotion?.matches,
        onLaunch: () => { ui.overlay = ''; renderOverlay(); openApp('chrome'); ICSBrowserSession.navigate(ui.browserSession, 'www.google.com'); saveBrowserState(); render(); },
        onClose: () => { if (ui.overlay === 'search') { ui.overlay = ''; renderOverlay(); } }});
      suppressClickUntil = Infinity;
    }
    const panel = overlayRoot.querySelector('[data-jb-search]').getBoundingClientRect();
    searchSwipe.panel.move((event.clientX - panel.left) / k, (event.clientY - panel.top) / k);
  }, true);
  const endSearchSwipe = event => {
    if (!searchSwipe || event.pointerId !== searchSwipe.id) return;
    const panel = searchSwipe.panel; searchSwipe = null;
    if (!panel) return;
    suppressClickUntil = Date.now() + 350;
    event.type === 'pointercancel' ? panel.cancel() : panel.release();
  };
  window.addEventListener('pointerup', endSearchSwipe, true); window.addEventListener('pointercancel', endSearchSwipe, true);
  function lockScreen(){captureRecentView();lockControls.lock();ui.kgUp=true;ui.kgBouncing=false;ui.kgPending=null;ui.kgRelock=false;ui.locked=ICSLockscreen.secure(data);ui.sleeping=data.settings.screenLock==='none';ui.view=ui.sleeping?'home':'lock';ui.overlay='';render();}
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
  const dreams = [['clock', 'Clock'], ['colors', 'Colors'], ['photoframe', 'Photo Frame']];
  function renderDaydreamSettings() {
    const on = !!data.settings.daydream, current = data.settings.daydreamType || 'clock', when = data.settings.daydreamWhen || 'charging';
    const whenLabel = {charging: 'While charging', docked: 'While docked', either: 'Either'}[when];
    // DessertCaseDream is enabled once the Dessert Case has been opened from the easter egg.
    const list = data.settings.dessertCaseUnlocked ? [...dreams, ['dessert', 'Dessert Case']].sort((a, b) => a[1].localeCompare(b[1])) : dreams;
    return appView('Daydream', `${toggleRow('Daydream', on ? whenLabel : 'Off', 'daydream')}${on ? `${list.map(([id, name]) => `<button class="settings-row jb-dream-row" data-action="dream-pick" data-id="${id}" role="radio" aria-checked="${current === id}"><span class="row-copy">${safe(i18n.t(name))}</span><img class="holo-radio" src="assets/btn_radio_${current === id ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join('')}${label('')}${row('Start now', '', 'dream-start', '')}${row('When to daydream', i18n.t(whenLabel), 'dream-when', '')}` : `<div class="detail-pad"><p>${safe(i18n.t('To control what happens when the phone is docked and/or sleeping, turn Daydream on.'))}</p></div>`}`);
  }
  // Dreams: DeskClock Screensaver (dimmed clock that moves every minute), SystemUI Colors and a photo slideshow.
  function renderDream() {
    const type = data.settings.daydreamType || 'clock', now = deviceDate();
    if (type === 'colors') return '<div class="jb-dream jb-dream-colors" data-action="dream-exit" role="button" tabindex="0" aria-label="Daydream"></div>';
    if (type === 'dessert' && data.settings.dessertCaseUnlocked) return '<div class="jb-dream kk-dessert" data-kk-dream-dessert data-action="dream-exit" role="button" tabindex="0" aria-label="Daydream"></div>';
    if (type === 'photoframe') { const photo = data.photos[Math.floor(Date.now() / 6000) % Math.max(1, data.photos.length)]; return `<div class="jb-dream jb-dream-photo" data-action="dream-exit" role="button" tabindex="0" aria-label="Daydream">${photo ? `<img src="${ICSMedia.image(photo)}" alt="">` : ''}</div>`; }
    const time = now.toLocaleTimeString(i18n.locale(), {hour: data.settings.hour24 ? '2-digit' : 'numeric', minute: '2-digit', hour12: !data.settings.hour24}), [hours, rest = ''] = time.split(/[:.]/);
    const spot = Math.floor(Date.now() / 60000) % 4;
    return `<div class="jb-dream jb-dream-clock" data-action="dream-exit" role="button" tabindex="0" aria-label="Daydream"><div class="jb-dream-saver" style="--spot:${spot}"><div class="jbclock-time"><span class="jbclock-hours">${safe(hours)}</span><span class="jbclock-minutes">:${safe(rest.replace(/\s?[^\d].*$/, ''))}</span></div><div class="jbclock-date">${safe(now.toLocaleDateString(i18n.locale(), {weekday: 'short', month: 'short', day: 'numeric'}).toLocaleUpperCase(i18n.locale()))}${nextAlarmLabel() ? ` <img src="assets/jbclock-ic_alarm_small.png" alt="">${safe(nextAlarmLabel())}` : ''}</div></div></div>`;
  }
  function renderLock() {
    if(ui.locked)return lockControls.renderLock();
    const {list, parts} = keyguardParts();
    return JBKeyguard.render(list, ui.kgPage, parts);
  }
  function renderSecureKeyguard(api) {
    const {list, parts} = keyguardParts();
    return JBKeyguard.renderSecure(list, ui.kgPage, {...parts, up: ui.kgUp !== false, bouncing: !!ui.kgBouncing, security: JBKeyguard.securityView(api, parts), ime: api.state.kind === 'password' ? api.keyboard() : ''});
  }
  function keyguardParts() {
    // TransportControlView covers the clock rows while the Music service is active.
    const track = tracks[ui.music.track], transport = musicActive() ? `<div class="lock-transport" data-no-translate><div class="lock-transport-art"></div><div class="lock-transport-bar"><p><span>${safe(track.title)}</span> - ${safe(track.artist)} - ${safe(track.album)}</p><div><button data-action="lock-media" data-id="previous" aria-label="${safe(i18n.t('Previous track'))}"><img src="assets/music-ic_media_previous.png" alt=""></button><button data-action="lock-media" data-id="play" aria-label="${safe(i18n.t(ui.music.playing ? 'Pause' : 'Play'))}"><img src="assets/music-ic_media_${ui.music.playing ? 'pause' : 'play'}.png" alt=""></button><button data-action="lock-media" data-id="next" aria-label="${safe(i18n.t('Next track'))}"><img src="assets/music-ic_media_next.png" alt=""></button></div></div></div>` : '';
    const kgPages = JBKeyguard.pages(data.keyguardWidgets || [], {music: musicActive()});
    if (!Number.isInteger(ui.kgPage) || ui.kgPage >= kgPages.length || kgPages[ui.kgPage]?.type === 'camera') ui.kgPage = JBKeyguard.defaultPage(kgPages);
    const now = deviceDate(), hour24 = !!data.settings.hour24;
    return {list: kgPages, parts: {
      t: key => i18n.t(key), carrier: data.settings.airplane ? i18n.t('No service.') : data.settings.networkOperator || 'Telekom', owner: data.settings.showOwner ? data.settings.ownerInfo : '', alarm: nextAlarmLabel(),
      clock: now.toLocaleTimeString(i18n.locale(), {hour: hour24 ? '2-digit' : 'numeric', minute: '2-digit', hour12: !hour24}).replace(/\s?[AaPp]\.?\s?[Mm]\.?$/, ''),
      ampm: hour24 ? '' : now.getHours() < 12 ? 'AM' : 'PM', date: now.toLocaleDateString(i18n.locale(), {weekday: 'long', month: 'long', day: 'numeric'}).toLocaleUpperCase(i18n.locale()),
      transport: transport.replace('class="lock-transport"', 'class="lock-transport jbk-transport-view"'), widget: keyguardWidget
    }};
    return `<div class="lock-view${transport ? ' with-transport' : ''}">${transport}<div class="lock-clock"><div class="lock-time">${clock()}</div><div class="lock-date">${fullDate()}</div>${data.settings.showOwner?`<div class="lock-owner">${safe(data.settings.ownerInfo)}</div>`:''}</div><div class="lock-wave"><div class="lock-outer-ring"></div><button class="lock-target lock-target-unlock" data-action="unlock" aria-label="Unlock"><img src="assets/ic_lockscreen_unlock_normal.png" alt=""><img class="lock-activated" src="assets/ic_lockscreen_unlock_activated.png" alt=""></button><button class="lock-target lock-target-camera" data-action="unlock-camera" aria-label="Camera"><img src="assets/ic_lockscreen_camera_normal.png" alt=""><img class="lock-activated" src="assets/ic_lockscreen_camera_activated.png" alt=""></button>${[0,1,2].map(() => '<img class="lock-chevron" src="assets/ic_lockscreen_chevron_right.png" alt="">').join('')}<button class="lock-handle" data-action="lock-hint" aria-label="Slide to unlock"><img src="assets/ic_lockscreen_handle_normal.png" alt=""><img class="lock-activated" src="assets/ic_lockscreen_handle_pressed.png" alt=""></button></div><div class="lock-carrier">${carrierName()}</div></div>`;
  }
  // Keyguard-capable widgets: the Calendar list and the 4.2 DeskClock digital clock.
  function keyguardWidget(widget) {
    if (widget.type === 'calendar') return ICSWidgets.calendar(data, key => i18n.t(key), i18n.locale(), deviceDate(), !!data.settings.hour24);
    return digitalClockWidget('div');
  }
  function requestBouncer(pending) {
    ui.kgPending = pending;
    if (ui.kgChallenge) ui.kgChallenge.showBouncer(); else { ui.kgBouncing = true; render(); }
  }
  // OnDismissAction: what the widget asked for once the security check passes.
  function afterKeyguardDismiss(pending) {
    if (pending.type === 'add') { ui.kgRelock = true; ui.overlay = 'kg-widget-picker'; renderOverlay(); return; }
    if (pending.type === 'camera') { openApp('camera'); return; }
    const event = pending.id && data.events.find(item => String(item.id) === pending.id);
    if (!event) { ui.selectedDate = today(); openApp('calendar'); return; }
    const date = pending.date || event.date; ui.selectedDate = date < today() ? today() : date; openApp('calendar'); ui.selectedEvent = event.id; ui.selectedInstance = date; ui.sub = 'event'; render();
  }
  function attachKeyguard() {
    ui.kgPad?.destroy(); ui.kgPad = null; ui.kgChallenge?.destroy(); ui.kgChallenge = null;
    const root = viewport.querySelector('.jb-keyguard');
    if (!root) return;
    const kgPages = JBKeyguard.pages(data.keyguardWidgets || [], {music: musicActive()}), secure = root.matches('[data-kg-secure]'), reduced = !!reducedMotion?.matches;
    if (secure) ui.kgChallenge = JBKeyguard.challenge(root, {up: ui.kgUp !== false, bouncing: !!ui.kgBouncing, reduced, onChange: up => { ui.kgUp = up; }, onBouncer: on => { ui.kgBouncing = on; if (!on) ui.kgPending = null; }});
    else ui.kgPad = JBKeyguard.glowPad(root.querySelector('.jbk-challenge'), {onUnlock: () => { suppressClickUntil = Date.now() + 350; home(); }, haptic: () => data.settings.haptic !== false, reduced});
    // With the challenge over the pager only swipes that start at the screen edges page (setOnlyAllowEdgeSwipes).
    const edge = event => { const box = root.getBoundingClientRect(); return event.clientX - box.left < JBKeyguard.S.edge || box.right - event.clientX <= JBKeyguard.S.edge; };
    ui.kgPager = JBKeyguard.pager(root.querySelector('[data-kg-pager]'), {count: kgPages.length, current: ui.kgPage, reduced,
      // SlidingChallengeLayout.dispatchTouchEvent hands edge-swipe downs to the widgets even over the challenge.
      surface: secure ? root.querySelector('.jbk-host') : undefined,
      canStart: event => !secure || !ui.kgChallenge.bouncing() && (edge(event) || !ui.kgChallenge.edgeOnly() && !!event.target.closest('[data-kg-pager]')),
      onBegin: () => { if (secure) ui.kgChallenge.pageBegin(); },
      onSettle: (page, previous) => { ui.kgPage = page; if (secure) { ui.kgChallenge.pageEnd(page === previous); ui.kgChallenge.setInteractive(kgPages[page]?.type !== 'camera'); } },
      onCamera: () => {
        if (ui.view !== 'lock') return;
        if (ui.locked) { requestBouncer({type: 'camera'}); ui.kgPager.go(JBKeyguard.defaultPage(kgPages)); return; }
        ui.kgPage = JBKeyguard.defaultPage(kgPages); openApp('camera');
      },
      onRemove: id => { data.keyguardWidgets = (data.keyguardWidgets || []).filter(widget => widget.id !== id); save(); render(); }});
  }
  function analogClock() {
    const now = deviceDate();
    return `<div class="analog-clock" aria-label="${clock()}"><img class="clock-dial" src="assets/appwidget_clock_dial.png" alt=""><img class="clock-hour" src="assets/appwidget_clock_hour.png" alt="" style="transform:rotate(${(now.getHours() % 12) * 30 + now.getMinutes() / 2}deg)"><img class="clock-minute" src="assets/appwidget_clock_minute.png" alt="" style="transform:rotate(${now.getMinutes() * 6}deg)"></div>`;
  }
  // Drawer and drag previews use the providers' original previewImage artwork where AOSP has one.
  function widgetArt(type) {
    if (type === 'analog') return analogClock();
    if (type === 'digitalclock') return '<img class="widget-preview-image" src="assets/jbclock-appwidget_digital_clock_preview.png" alt="">';
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
    if (widget.type === 'calendar') return ICSWidgets.calendar(data, t, i18n.locale(), deviceDate(), !!data.settings.hour24);
    if (widget.type === 'music') return ICSWidgets.music(ui.music, tracks, musicActive(), t);
    if (widget.type === 'photo') return ICSWidgets.photo(data, widget, ui.photoStacks?.[widget.id] || 0, t);
    if (widget.type === 'digitalclock') return digitalClockWidget();
    return null;
  }
  /* DeskClock 4.3 digital_appwidget / digital_widget_time: bold sans-serif hours and thin minutes (widget_big_font_size
     80dp, scaled down when the widget is narrower than 160dp), then the condensed bold date and the grey next alarm. */
  function digitalClockWidget(tag = 'button') {
    const now = deviceDate(), alarm = nextAlarmLabel(), hour24 = !!data.settings.hour24;
    const hours = hour24 ? String(now.getHours()).padStart(2, '0') : String(now.getHours() % 12 || 12), minutes = `:${String(now.getMinutes()).padStart(2, '0')}`;
    const attrs = tag === 'button' ? ' data-action="open-app" data-app="clock"' : '';
    return `<${tag} class="jbw-digital"${attrs} aria-label="${safe(clock())}"><span class="jbw-digital-time" aria-hidden="true"><b>${safe(hours)}</b><i>${safe(minutes)}</i></span><span class="jbw-digital-date"><span>${safe(now.toLocaleDateString(i18n.locale(), {weekday: 'short', month: 'short', day: 'numeric'}))}</span>${alarm ? `<span class="jbw-digital-alarm"><img src="assets/jbclock-ic_alarm_small.png" alt="">${safe(alarm)}</span>` : ''}</span></${tag}>`;
  }
  const homeWidget = widget => {
    const spec = widgetSize(widget);
    const body = widgetBody(widget) ?? (widget.type === 'power' ? `<div class="power-widget">${[['wifi','Wi-Fi','wifi'],['bluetooth','Bluetooth','bluetooth'],['gps','GPS satellites','gps'],['autoSync','Auto-sync','sync'],['brightness','Brightness','brightness']].map(([key,title,asset]) => `<button class="power-cell ${data.settings[key] ? 'enabled' : ''}" data-action="power-toggle" data-id="${key}" aria-label="${title}" aria-pressed="${!!data.settings[key]}"><img src="assets/power-${asset}-${key === 'brightness' ? data.settings.brightness > 70 ? 'full' : data.settings.brightness > 25 ? 'half' : 'off' : data.settings[key] ? 'on' : 'off'}.png" alt=""><i></i></button>`).join('')}</div>` : `<button data-action="open-app" data-app="${spec.app || 'gallery'}" aria-label="${safe(spec.name || 'Widget')}">${widgetArt(widget.type)}</button>`);
    const frame = ui.resizeWidget === widget.id && spec.resize ? `<div class="jb-resize-frame" data-resize-frame>${['left', 'top', 'right', 'bottom'].map(edge => `<button class="jb-resize-handle jb-resize-${edge}" data-resize-edge="${edge}" aria-label="${safe(i18n.t('Resize'))}"><img src="assets/jb-widget_resize_handle_${edge}.png" alt=""></button>`).join('')}</div>` : '';
    return `<div class="home-widget widget-${widget.type}${frame ? ' resizing' : ''}" data-widget-id="${safe(widget.id)}" style="grid-column:${widget.x + 1}/span ${spec.width};grid-row:${widget.y + 1}/span ${spec.height}">${body}${frame}</div>`;
  };
  const wallpaperChoices = () => `<div class="wallpaper-grid">${wallpaperFiles.map((name, i) => `<button class="wallpaper-choice ${data.wallpaper === i ? 'selected' : ''}" data-action="wallpaper" data-id="${i}" aria-label="${safe(i18n.t('Wallpaper'))} ${i + 1}"><span class="wallpaper-swatch" style="background-image:url('assets/jb-wallpaper_${name}_small.jpg')"></span></button>`).join('')}</div>`;
  const pageMarker = (active, add = false) => `<img class="kk-pi-off" src="assets/l3-ic_pageindicator_${add ? 'add' : 'default'}.png" alt=""><img class="kk-pi-on" src="assets/l3-ic_pageindicator_current.png" alt="">`;
  function renderHome() {
    const pages = data.homePages.length;
    const nowPane = `<div class="gel-now-layer" ${ui.page === -1 ? '' : 'inert aria-hidden="true"'}>${GELNow.render({data, t: key => i18n.t(key), locale: i18n.locale(), now: deviceDate()})}</div>`;
    return `<div class="home-view kk-home gel-home${ui.overview ? ' kk-overview' : ''}${ui.page === -1 ? ' gel-now-open' : ''}" style="--gnow:${ui.page === -1 ? 1 : 0}">${nowPane}<div class="home-search"><button data-action="browser-search" aria-label="${safe(i18n.t('Search'))}"><img class="kk-qsb-logo" src="assets/l3-ic_home_google_logo_normal_holo.png" alt="Google"><span class="gel-hint">${safe(i18n.t('Say “Ok Google”'))}</span></button><button class="voice-search" data-action="voice-search" aria-label="${safe(i18n.t('Voice search'))}"><img class="search-microphone" src="assets/l3-ic_home_voice_search_holo.png" alt=""></button></div><div class="home-content"><div class="home-pages" style="transform:translateX(${-ui.page * 100}%)">${data.homePages.map((page, index) => `<div class="home-grid" data-home-page="${index}" data-action="kk-overview-page" data-id="${index}" style="--rel:${index - ui.page}" ${index !== ui.page && !ui.overview ? 'inert' : ''}>${page.map((id, slot) => `<div class="home-slot" data-home-slot="${slot}" style="grid-column:${slot % 4 + 1};grid-row:${Math.floor(slot / 4) + 1}">${id ? launcherIcon(id) : ''}</div>`).join('')}${(data.homeWidgets[index] || []).map(homeWidget).join('')}</div>`).join('')}</div></div><div class="page-indicators"><button class="gel-now-marker ${ui.page === -1 ? 'active' : ''}" data-action="page" data-id="-1" aria-label="Google Now">${pageMarker(ui.page === -1)}</button>${Array.from({ length: pages }, (_, i) => `<button class="${i === ui.page ? 'active' : ''}" data-action="page" data-id="${i}" aria-label="${safe(i18n.t('Home screen'))} ${i + 1}">${pageMarker(i === ui.page, ui.extraScreen && i === pages - 1)}</button>`).join('')}</div><div class="dock">${data.dock.map((id, slot) => `<div class="dock-slot" data-dock-slot="${slot}">${id ? launcherIcon(id) : ''}</div>`).join('')}</div><div class="drop-target-bar"><div class="drop-target" data-drop-remove="true"><img src="assets/l3-ic_launcher_clear_normal_holo.png" alt=""><img class="drop-target-active" src="assets/l3-ic_launcher_clear_active_holo.png" alt=""><span>${safe(i18n.t('Remove'))}</span></div><div class="drop-target info-drop-target" data-drop-info="true"><img src="assets/l3-ic_launcher_info_normal_holo.png" alt=""><img class="drop-target-active" src="assets/l3-ic_launcher_info_active_holo.png" alt=""><span>${safe(i18n.t('App info'))}</span></div></div><div class="kk-overview-panel" ${ui.overview ? '' : 'inert'}><button data-action="open-wallpapers" style="--pressed:url('assets/l3-ic_wallpaper_pressed.png')"><img src="assets/l3-ic_wallpaper.png" alt="">${safe(i18n.t('Wallpapers'))}</button><button data-action="kk-overview-widgets" style="--pressed:url('assets/l3-ic_widget_pressed.png')"><img src="assets/l3-ic_widget.png" alt="">${safe(i18n.t('Widgets'))}</button><button data-action="gel-overview-settings" style="--pressed:url('assets/l3-ic_setting_pressed.png')"><img src="assets/l3-ic_setting.png" alt="">${safe(i18n.t('Settings'))}</button></div></div>`;
  }
  const drawerAppPages = () => Math.ceil(apps.length / 20);
  const drawerPageCount = () => drawerAppPages() + Math.ceil(widgetTypes.length / 4);
  const drawerRange = () => ui.drawerWidgets ? [drawerAppPages(), drawerPageCount() - 1] : [0, drawerAppPages() - 1];
  function renderDrawer() {
    const appPages = drawerAppPages(), pages = drawerPageCount();
    const [first, last] = drawerRange();
    const current = Math.max(first, Math.min(ui.drawerPage, last));
    const isApps = current < appPages;
    ui.drawerTab = isApps ? 'apps' : 'widgets';
    const sortedApps = [...apps].sort((a,b) => i18n.t(a[1]).localeCompare(i18n.t(b[1]), i18n.locale()));
    const widgetPage = current - appPages;
    const items = isApps ? sortedApps.slice(current * 20, current * 20 + 20).map(app => launcherIcon(app[0])).join('') : widgetTypes.slice(widgetPage * 4, widgetPage * 4 + 4).map(widget => `<button class="drawer-widget" data-action="add-widget" data-widget-type="${widget.type}" aria-label="${safe(widget.name)}"><span class="drawer-widget-title">${safe(widget.name)} <small>${widget.width} × ${widget.height}</small></span><span class="drawer-widget-preview widget-${widget.type}">${widgetArt(widget.type)}</span></button>`).join('');
    return `<div class="drawer-view kk-drawer"><div class="drawer-page ${isApps ? 'drawer-apps' : 'drawer-widgets'}">${items}</div><div class="drawer-indicators">${Array.from({length:pages},(_,i)=>i < first || i > last ? '' : `<button class="${i===current?'active':''}" data-action="drawer-page" data-id="${i}" aria-label="${safe(i18n.t('Page'))} ${i+1}">${pageMarker(i === current)}</button>`).join('')}</div></div>`;
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
      case 'play-store': return JBPlay.render(jbPlayContext());
      case 'live-wallpapers': return renderLiveWallpapers();
      case 'wallpaper-picker': return KKWallpaperPicker.render(wallpaperPickerContext());
      case 'kk-doc-picker': return KKWallpaperPicker.openFrom(wallpaperPickerContext());
      case 'settings': return renderSettings();
      case 'browser': return renderBrowser();
      case 'chrome': return renderChrome();
      case 'photos': return PhotosApp.render(photosContext());
      case 'gmail': return renderGmail();
      case 'play-music': case 'play-movies': case 'play-books': case 'play-games': return PlayApps.render(playContext(ui.view));
      case 'google-search': case 'voice-search': case 'maps': case 'drive': case 'keep': case 'youtube': case 'google-plus': case 'earth': case 'news-weather': case 'google-settings': return StockApps.render(ui.view, {ui, data, t: key => i18n.t(key), locale: i18n.locale(), now: deviceDate()});
      case 'phone': return renderPhone();
      case 'people': return renderPeople();
      case 'messaging': return renderMessaging();
      case 'hangouts': return Hangouts.render(data, ui, key => i18n.t(key), i18n.locale(), deviceDate().getTime());
      case 'gallery': return renderGallery();
      case 'camera': return renderCamera();
      case 'calendar': return renderCalendar();
      case 'clock': return renderClock();
      case 'calculator': return renderCalculator();
      case 'music': return renderMusic();
      case 'email': return renderEmail();
      case 'downloads': return KKDownloads.render(data.downloads || [], ui, key => i18n.t(key), i18n.locale());
      default: return renderHome();
    }
  }
  function openApp(app, resume = false) {
    if(ui.locked)return;
    if (GEL_ALIASES[app]) app = GEL_ALIASES[app];
    if (!appNames[app]) return;
    if (app === 'browser' || app === 'chrome') useBrowserSession(app);
    if (app === 'email' || app === 'gmail') useMailApp(app);
    if (app === 'voice-search') setTimeout(listenVoice);
    if (app === 'keep' && !Array.isArray(data.keepNotes)) data.keepNotes = clone(defaultData.keepNotes);
    captureRecentView();
    if (app === 'play-store' && !resume) { ui.play = ICSPlayStore.initial(); ui.playHistory = []; ui.market = {page: 'home'}; ui.marketHistory = []; ui.marketSearching = false; }
    ui.view = app; ui.sub = resume ? ui.recentState?.[app]?.sub || '' : ''; ui.overlay = ''; if (app === 'settings' && !resume) ui.settingsRootScroll = 0;
    ui.recent = [app, ...ui.recent.filter(id => id !== app)].slice(0, 7);
    render();
    if (resume && viewport.firstElementChild) appScrollContainer(app).scrollTop = ui.recentState?.[app]?.scrollTop || 0;
  }
  function appScrollContainer(app) {
    return viewport.querySelector(app === 'play-store' ? '.jbp-scroll' : ['messaging', 'hangouts'].includes(app) ? '.mms-scroll' : ['email', 'gmail'].includes(app) ? '.email-scroll' : app === 'music' ? '.music-library-scroll' : app === 'calendar' ? '.cal-scroll' : app === 'gallery' ? '.gallery-scroll' : app === 'clock' ? '.desk-scroll' : app === 'people' ? '.people-scroll' : app === 'browser' ? '.browser-page,.web-tabs,.web-library' : app === 'chrome' ? '.chr-ntp-scroll,.chr-history,.chr-stack,.browser-page' : app === 'photos' ? '.ph-scroll' : StockApps.APPS.includes(app) ? '.sa-scroll,.gnow-scroll' : PLAY_APPS.includes(app) ? '.pa-scroll,.pm-queue' : '.app-view') || viewport.firstElementChild;
  }
  function captureRecentView() {
    if (appNames[ui.view] && viewport.firstElementChild) {
      ui.recentSnapshots[ui.view] = viewport.innerHTML;
      ui.recentState ||= {};
      ui.recentState[ui.view] = {sub: ui.sub, scrollTop: appScrollContainer(ui.view).scrollTop};
    }
  }
  function home(resetPage = true) { if(ui.locked)return;if(ui.photoWidgetSetup){const setup=ui.photoWidgetSetup;data.homeWidgets[setup.page]=data.homeWidgets[setup.page].filter(widget=>widget.id!==setup.id);ui.photoWidgetSetup=null;save();}if(ui.sub==='lock-setup')lockControls.lock();captureRecentView(); ui.view = 'home'; ui.sub = ''; ui.overlay = ''; ui.overview = false; if (resetPage) ui.page = 0; render(); }
  function back() { pendingNav = 'back'; try { navigateBack(); } finally { pendingNav = ''; } }
  function navigateBack() {
    if(ui.view==='settings'&&ui.sub==='lock-setup'){lockControls.cancel();return;}
    if (ui.overlay.startsWith('widget-photo')) { cancelPhotoWidget(); return; }
    if (ui.overlay) { ui.overlay = ''; render(); return; }
    if (ui.view === 'live-wallpapers' && ui.lwFromPicker && String(ui.sub || '').startsWith('preview:')) { ui.lwFromPicker = false; ui.view = 'wallpaper-picker'; ui.sub = ''; render(); return; }
    if (ui.view === 'live-wallpapers') { const sub = String(ui.sub || ''); if (sub.startsWith('settings:')) ui.sub = `preview:${sub.slice(9)}`; else if (sub) ui.sub = ''; else { home(false); return; } render(); return; }
    if (ui.view === 'lock' && ui.kgChallenge?.bouncing()) { ui.kgChallenge.hideBouncer(); return; }
    if (ui.view === 'lock') return;
    if(ui.view==='phone' && !ui.activeCall && ui.kkDialpad){ui.kkDialpad=false;ui.dial='';render();return;}
    if(ui.view==='phone' && !ui.activeCall && ['kk-history','kk-all'].includes(ui.sub)){ui.sub='';render();return;}
    if(ui.view==='phone' && !ui.activeCall && ui.sub==='call-detail'){ui.sub=ui.kkLogFrom||'';render();return;}
    if(ui.view==='phone' && !ui.activeCall && (ui.phoneSearch||'').trim()){ui.phoneSearch='';render();return;}
    if(ui.view==='phone' && ui.activeCall){if(ui.activeCall.keypad){ui.activeCall.keypad=false;render();}else home(false);return;}
    if (StockApps.APPS.includes(ui.view) && ui.sub) { if (ui.view === 'keep') saveKeepNote(); ui.sub = ''; render(); return; }
    if (PLAY_APPS.includes(ui.view) && ui.sub) { ui.sub = ui.sub === 'queue' ? 'player' : ui.sub === 'player' ? ui.paReturn || '' : ''; ui.paBars = true; render(); return; }
    if (ui.view === 'photos' && ui.sub) { ui.sub = ui.sub === 'photo' ? ui.photosReturn || '' : ui.sub === 'folder' ? 'folders' : ''; ui.photosChrome = true; render(); return; }
    if (ui.view === 'gallery' && ui.gallerySlideshow) { ui.gallerySlideshow=false;render();return; }
    if (ui.view === 'gallery') { ui.galleryZoom = false; const handled = JBGallery.back(ui, data); if (handled === 'camera') { ui.galleryFromCamera = false; openApp('camera'); return; } if (handled) { render(); return; } }
    if (ui.view === 'calendar' && ui.sub === 'event-edit') { ui.sub=ui.eventDraft?.id?'event':'';ui.eventDraft=null;calendarRender();return; }
    if(ui.view==='settings' && ['apn','operators','tether-help','device-admin','wifi-direct','wifi-display','location-mode'].includes(ui.sub)){ui.sub={apn:'mobile-networks',operators:'mobile-networks','tether-help':'tethering','device-admin':'security','wifi-direct':'wifi','wifi-display':'display','location-mode':'location'}[ui.sub];render();return;}
    if(ui.view==='settings' && ['app-info','data-app','battery-history','battery-detail','storage-misc','language-pick'].includes(ui.sub)){ui.sub={'language-pick':'language','app-info':'apps','data-app':'data','battery-history':'battery','battery-detail':'battery','storage-misc':'storage'}[ui.sub];render();return;}
    if(ui.view==='music' && ui.sub==='queue'){ui.sub='player';render();return;}
    if (ui.view === 'play-store' && ui.marketSearching) { ui.marketSearching = false; render(); return; }
    if (ui.view === 'play-store' && ui.marketHistory?.length) { const prev = ui.marketHistory.pop(); ui.market = prev; render(); const list = viewport.querySelector('.jbp-scroll'); if (list) list.scrollTop = prev.scroll || 0; return; }
    if (ui.view === 'calculator' && ui.calcPanel) { setCalculatorPanel(0); return; }
    if (ui.view === 'drawer' && ui.drawerWidgets) { ui.drawerWidgets = false; ui.drawerPage = 0; home(false); ui.overview = true; render(); return; }
    if (ui.view === 'home' && ui.overview) { ui.overview = false; render(); return; }
    if (ui.view === 'wallpaper-picker' && ui.wp?.checked?.length) { ui.wp.checked = []; wallpaperPickerRender(); return; }
    if (ui.view === 'kk-doc-picker') { ui.view = 'wallpaper-picker'; render(); return; }
    if (ui.view === 'drawer' || ui.view === 'wallpaper-picker') { home(false); return; }
    if (['browser', 'chrome'].includes(ui.view) && !ui.sub && ui.browserFind !== undefined) { ui.browserFind = undefined; render(); return; }
    if (['browser', 'chrome'].includes(ui.view) && !ui.sub && ui.browserIndex > 0) { browserBack(); return; }
    if (ui.view === 'settings' && ['easter', 'dessert', 'beanbag', 'about-status', 'about-legal', 'about-safety'].includes(ui.sub)) { ui.sub = 'about'; ui.jbLogoTapped = false; render(); return; }
    if (ui.view === 'settings' && ['vpn', 'tethering', 'beam', 'mobile-networks'].includes(ui.sub)) { ui.sub = 'wireless'; render(); return; }
    if (ui.view === 'settings' && ui.sub === 'wifi-advanced') { ui.sub = 'wifi'; render(); return; }
    if (ui.view === 'settings' && ui.sub === 'sync-google') { ui.sub = 'sync'; render(); return; }
    if (ui.view === 'settings' && ui.sub === 'reset-info') { ui.sub = 'backup'; render(); return; }
    if (ui.view === 'settings' && ['brightness','wallpaper','sleep'].includes(ui.sub)) { ui.sub = 'display'; render(); return; }
    if (ui.view === 'settings' && ['volumes','ringtone'].includes(ui.sub)) { ui.sub = 'sound'; render(); return; }
    if (['messaging', 'hangouts'].includes(ui.view) && ui.sub === 'thread') { ui.sub = ui.mmsListMode || ''; render(); return; }
    if (ui.view === 'clock' && ui.sub === 'alarm-edit') { ui.alarmDraft=null; ui.sub='alarms'; render(); return; }
    if (ui.view === 'people' && ui.sub === 'edit') { ui.sub = 'detail'; render(); return; }
    if (ui.sub) { ui.sub = ''; render(); if (ui.view === 'settings') viewport.querySelector('.settings-app').scrollTop = ui.settingsRootScroll; return; }
    home(false);
  }
  // PlatLogoActivity's custom toast: "Android 4.3" in Roboto Light over a bold "JELLY BEAN".
  function platLogoToast() {
    document.querySelector('.toast, .jb-toast')?.remove();
    const element = document.createElement('div'); element.className = 'jb-toast'; element.innerHTML = '<span>Android 4.3</span><strong>JELLY BEAN</strong>';
    // Toast.LENGTH_LONG (3.5 s), then the toast_exit fade (config_longAnimTime, accelerate_quad); toasts outlive the activity.
    screen.append(element); setTimeout(() => { element.animate?.([{opacity: 1}, {opacity: 0}], {duration: 500, easing: 'cubic-bezier(.55,.085,.68,.53)', fill: 'forwards'}); setTimeout(() => element.remove(), 500); }, 3500);
  }
  function toast(message) {
    document.querySelector('.toast')?.remove();
    const element = document.createElement('div'); element.className = 'toast'; element.textContent = i18n.t(message);
    screen.append(element);
    clearTimeout(ui.toastTimer); ui.toastTimer = setTimeout(() => element.remove(), 2500);
  }
  let openFolderId = '';
  function renderOverlay() {
    const closingFolder = overlayRoot.querySelector('.launcher-folder');
    if (ui.overlay === 'shade') {
      const call = ui.activeCall ? `<button class="phone-resume-call" data-action="open-app" data-app="phone">${safe(i18n.t('Ongoing call'))} · ${safe(contactByPhone(ui.activeCall.number)?.name||ui.activeCall.number)}</button>` : '';
      overlayRoot.innerHTML = '<div class="jb-shade-scrim" data-action="close-overlay"></div>' + JBShade.render({...data, notifications: data.notifications.map(decorateNotification)}, ui, key => i18n.t(key), {locale: i18n.locale(), clock: clock(), date: fullDate(), carrier: data.settings.airplane ? i18n.t('No service.') : (data.settings.networkOperator || 'Telekom'), alarm: nextAlarmLabel(), extra: call});
    } else if (ui.overlay === 'dream') {
      overlayRoot.innerHTML = renderDream();
      const dessertDream = overlayRoot.querySelector('[data-kk-dream-dessert]');
      if (dessertDream) requestAnimationFrame(() => { if (dessertDream.isConnected) KKEgg.dessertCase(dessertDream, {reduced: !!reducedMotion?.matches}); });
    } else if (ui.overlay === 'kdc-picker' && ui.kdcPicker) {
      overlayRoot.innerHTML = KKDeskClock.picker(ui.kdcPicker, {t: key => i18n.t(key), hour24: !!data.settings.hour24});
    } else if (ui.overlay === 'kk-cast-menu') {
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu"><button data-action="kk-cast-enable" role="menuitemcheckbox" aria-checked="${!!data.settings.wifiDisplay}" class="kk-check-item">${safe(i18n.t('Enable wireless display'))}<img src="assets/btn_check_${data.settings.wifiDisplay ? 'on' : 'off'}_holo_dark.png" alt=""></button></div>`;
    } else if (ui.overlay === 'kdu-sort' || ui.overlay === 'kdu-overflow') {
      overlayRoot.innerHTML = KKDownloads.menu(ui.overlay.slice(4), ui, key => i18n.t(key));
    } else if (ui.overlay === 'kk-sms-app') {
      // SmsDefaultDialog-style list preference: the SMS-capable apps (only Messaging in AOSP).
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(i18n.t('Default SMS app'))}"><h3>${safe(i18n.t('Default SMS app'))}</h3><button class="settings-row jb-dream-row" data-action="close-overlay" role="radio" aria-checked="true"><span class="row-copy">${safe(i18n.t('Messaging'))}</span><img class="holo-radio" src="assets/btn_radio_on_holo_dark.png" alt=""></button><div class="settings-dialog-actions"><button data-action="close-overlay">${safe(i18n.t('Cancel'))}</button></div></div>`;
    } else if (ui.overlay === 'dream-when') {
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(i18n.t('When to daydream'))}"><h3>${safe(i18n.t('When to daydream'))}</h3>${[['docked', 'While docked'], ['charging', 'While charging'], ['either', 'Either']].map(([id, name]) => `<button class="settings-row jb-dream-row" data-action="dream-when-pick" data-id="${id}" role="radio" aria-checked="${(data.settings.daydreamWhen || 'charging') === id}"><span class="row-copy">${safe(i18n.t(name))}</span><img class="holo-radio" src="assets/btn_radio_${(data.settings.daydreamWhen || 'charging') === id ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join('')}<div class="settings-dialog-actions"><button data-action="close-overlay">${safe(i18n.t('Cancel'))}</button></div></div>`;
    } else if (ui.overlay === 'kg-widget-picker') {
      const choices = [['calendar', 'Calendar', 'calendar.png'], ['clock', 'Digital clock', 'clock.png']];
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog jbk-picker" role="dialog" aria-label="${safe(i18n.t('Choose widget'))}"><h3>${safe(i18n.t('Choose widget'))}</h3>${choices.map(([type, label, icon]) => `<button data-action="kg-pick-widget" data-id="${type}"><img src="assets/${icon}" alt=""><span>${safe(i18n.t(label))}</span></button>`).join('')}<div class="settings-dialog-actions"><button data-action="close-overlay">${safe(i18n.t('Cancel'))}</button></div></div>`;
    } else if (ui.overlay === 'qs-brightness') {
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog jb-brightness" role="dialog" aria-label="${safe(i18n.t('Brightness'))}"><h3>${safe(i18n.t('Brightness'))}</h3><div class="jb-brightness-row"><img src="assets/jb-ic_qs_brightness_auto_off.png" alt=""><input type="range" min="10" max="100" value="${data.settings.brightness}" data-field="brightness" aria-label="${safe(i18n.t('Brightness'))}" ${data.settings.autoBrightness ? 'disabled' : ''}><label><input type="checkbox" data-field="auto-brightness" ${data.settings.autoBrightness ? 'checked' : ''}><span>${safe(i18n.t('AUTO'))}</span></label></div></div>`;
    } else if (ui.overlay.startsWith('widget-photo')) {
      overlayRoot.innerHTML = ICSWidgets.photoOverlay(data, ui, key => i18n.t(key));
    } else if(ui.overlay==='sx-dialog'){
      overlayRoot.innerHTML=ICSSystemSettings.overlay(data,ui,key=>i18n.t(key));
    } else if (ui.overlay === 'search') {
      if (!overlayRoot.querySelector('[data-jb-search]')) overlayRoot.innerHTML = JBSearchPanel.markup(key => i18n.t(key));
    } else if (ui.overlay === 'recent') {
      overlayRoot.innerHTML = JBRecents.render(ui.recent, {names: appNames, icon: appIcon, snapshots: ui.recentSnapshots, popup: ui.recentPopup, t: key => i18n.t(key)});
      // PopupMenu keeps itself on screen: shift it left when the anchor is near the right edge.
      const popup = overlayRoot.querySelector('.jb-recent-popup'); if (popup) popup.style.left = `${Math.max(4, Math.min(parseFloat(popup.style.left), popup.parentElement.clientWidth - popup.offsetWidth - 4))}px`;
      JBRecents.bindLongPress(overlayRoot.querySelector('.recent-panel'), popup => { ui.recentPopup = popup; suppressClickUntil = Infinity; window.addEventListener('pointerup', () => { suppressClickUntil = Date.now() + 50; }, {once: true, capture: true}); renderOverlay(); });
    } else if (ui.overlay.startsWith('gallery-') || ui.overlay.startsWith('camera-')) {
      overlayRoot.innerHTML=ICSMedia.overlay(data,ui,key=>i18n.t(key),i18n.locale());
    } else if (ui.overlay.startsWith('clock-')) {
      overlayRoot.innerHTML = ICSDeskClock.overlay(ui,key=>i18n.t(key));
    } else if (ui.overlay.startsWith('calendar-')) {
      overlayRoot.innerHTML = ICSCalendar.overlay(ui,key=>i18n.t(key));
    } else if (ui.overlay.startsWith('music-')) {
      overlayRoot.innerHTML = ICSMusic.overlay(ui.music,ui,key=>i18n.t(key));
    } else if (ui.overlay.startsWith('email-')) {
      overlayRoot.innerHTML = KKEmail.overlay(mailbox(),ui,data.photos,key=>i18n.t(key),i18n.language,ui.view==='gmail'?gmailOptions():{});
    } else if (ui.overlay.startsWith('sd-')) {
      overlayRoot.innerHTML = ICSSettingsDetail.overlay(data,ui,key=>i18n.t(key));
    } else if (ui.overlay.startsWith('people-')) {
      overlayRoot.innerHTML = peopleOverlay();
    } else if (ui.overlay === 'pa-drawer') {
      overlayRoot.innerHTML = PlayApps.drawer(playContext(ui.view));
    } else if (ui.overlay === 'photos-menu') {
      overlayRoot.innerHTML = PhotosApp.menu({ui, t: key => i18n.t(key)});
    } else if (ui.overlay === 'photos-delete') {
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog mms-dialog" role="dialog" aria-label="${safe(i18n.t('Delete'))}"><h3>${safe(i18n.t('Delete'))}</h3><p>${safe(i18n.t('Delete this photo?'))}</p><div class="settings-dialog-actions"><button data-action="close-overlay">${safe(i18n.t('Cancel'))}</button><button data-action="photos-confirm-delete">${safe(i18n.t('Delete'))}</button></div></div>`;
    } else if (ui.overlay === 'browser-menu' && ui.view === 'chrome') {
      overlayRoot.innerHTML = ChromeApp.menu({ui, data, t: key => i18n.t(key), url: ui.browserUrl});
    } else if (ui.overlay === 'browser-menu') {
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu web-menu"><button data-action="browser-forward" ${ui.browserIndex >= ui.browserHistory.length-1?'disabled':''}>Forward</button><button data-action="browser-refresh">Refresh</button><button data-action="browser-new-tab">New tab</button><button data-action="browser-save">Bookmark</button><button data-action="browser-bookmarks">Bookmarks</button><button data-action="browser-saved">Saved pages</button><button data-action="browser-save-page">Save for offline reading</button><button data-action="browser-find">Find on page</button></div>`;
    } else if (ui.overlay.startsWith('mms-')) {
      overlayRoot.innerHTML = renderMessageOverlay();
    } else if (ui.overlay === 'play-menu') {
      // The action bar overflow: a Holo Light popup below the overflow button.
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="jbp-menu" role="menu">${JBPlay.menu(jbPlayContext()).map(item => `<button data-action="${item.action}">${safe(item.title)}</button>`).join('')}</div>`;
    } else if (ui.overlay.startsWith('jbp-')) {
      overlayRoot.innerHTML = JBPlay.dialog(ui.overlay.slice(4), jbPlayContext());
    } else if (ui.overlay === 'calc-menu') {
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu"><button data-action="calc-clear">Clear history</button><button data-action="calc-panel" data-id="${ui.calcPanel ? 0 : 1}">${ui.calcPanel ? 'Basic panel' : 'Advanced panel'}</button></div>`;
    } else if (ui.overlay === 'phone-menu') {
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu phone-overflow"><button data-action="phone-add-contact">Add to contacts</button></div>`;
    } else if (ui.overlay === 'connectivity-menu') {
      const wifi = ui.connectivityMenu === 'wifi';
      const enabled = data.settings[wifi ? 'wifi' : 'bluetooth'];
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu">${wifi ? `<button data-action="wifi-scan" ${enabled ? '' : 'disabled'}>Scan</button><button data-action="wifi-wps" data-id="pin" ${enabled ? '' : 'disabled'}>WPS Pin Entry</button><button data-action="settings-sub" data-id="wifi-direct" ${enabled ? '' : 'disabled'}>Wi-Fi Direct</button><button data-action="settings-sub" data-id="wifi-advanced">Advanced</button>` : `<button data-action="bluetooth-scan" ${enabled ? '' : 'disabled'}>Scan</button><button data-action="bluetooth-rename" ${enabled ? '' : 'disabled'}>Rename phone</button><button data-action="bluetooth-files">Show received files</button>`}</div>`;
    } else if (ui.overlay === 'wifi-wps') {
      overlayRoot.innerHTML = wpsDialog();
    } else if (ui.overlay === 'p2p-menu') {
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu"><button data-action="p2p-rename" ${data.settings.wifi ? '' : 'disabled'}>${safe(i18n.t('Rename device'))}</button></div>`;
    } else if (ui.overlay === 'p2p-rename') {
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog" data-form="p2p-rename" role="dialog" aria-label="Rename device"><h3>Rename device</h3><input name="name" aria-label="Device name" maxlength="32" required value="${safe(data.settings.p2pName || 'Android_4f3a')}"><div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">OK</button></div></form>`;
    } else if (ui.overlay === 'wifi-add') {
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog" data-form="wifi-add" role="dialog" aria-label="Add network"><h3>Add network</h3><label>Network SSID<input name="ssid" required maxlength="32" autocomplete="off"></label><label>Security<select name="security"><option value="Open" data-i18n="None">None</option><option value="WPA2">WPA/WPA2 PSK</option></select></label><label>Password<input name="password" type="password" autocomplete="off"></label><div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">Save</button></div></form>`;
    } else if (ui.overlay === 'bluetooth-pair') {
      const paired = data.settings.pairedDevice === ui.bluetoothTarget;
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="Bluetooth pairing request"><h3>${safe(ui.bluetoothTarget)}</h3>${paired ? '<p>Paired</p>' : '<p>Bluetooth pairing request</p><p>Passkey: 123456</p>'}<div class="settings-dialog-actions"><button data-action="close-overlay">Cancel</button><button data-action="bluetooth-confirm">${paired ? 'Unpair' : 'Pair'}</button></div></div>`;
    } else if (ui.overlay === 'bluetooth-rename') {
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog" data-form="bluetooth-rename" role="dialog" aria-label="Rename phone"><h3>Rename phone</h3><input name="name" aria-label="Device name" maxlength="40" required value="${safe(data.settings.bluetoothName || 'Nexus 4')}"><div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">Rename</button></div></form>`;
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
      overlayRoot.innerHTML = GlobalActions.menu({airplane: data.settings.airplane, ringer: GlobalActions.ringerOf(data.settings), bugreport: data.settings.bugreportPower}, key => i18n.t(key), '4.3');
      // 4.1+: a long press on Power off offers the safe-mode reboot.
      GlobalActions.hold(overlayRoot.querySelector('[data-action="ga-power"]'), () => { ui.overlay = 'power-confirm'; ui.powerKind = 'safemode'; renderOverlay(); });
    } else if (ui.overlay === 'power-confirm') {
      overlayRoot.innerHTML = GlobalActions.confirm(ui.powerKind, key => i18n.t(key));
    } else if (ui.overlay === 'power-progress') {
      overlayRoot.innerHTML = GlobalActions.progress(key => i18n.t(key));
    } else if (ui.overlay === 'folder') {
      overlayRoot.innerHTML = renderFolder();
      positionFolder();
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
    openFolderId = folderPanel ? ui.folderId : '';
    if (!folderPanel) ui.folderSettled = '';
    syncClings();
  }
  // Created on first use: the first render runs before this point of the script.
  function clingLayerRoot() { let node = screen.querySelector('#cling-layer'); if (!node) { node = document.createElement('div'); node.id = 'cling-layer'; screen.append(node); } return node; }
  function clingTarget(kind) {
    const base = clingLayerRoot().getBoundingClientRect();
    // Cling.getWorkspaceCutOutBounds: the screen centre, 30 dp higher.
    if (kind === 'workspace') return {circle: [base.width / 2, base.height / 2 - LauncherClings.RING.lift], radius: LauncherClings.RING.outer};
    if (kind !== 'folder') return {};
    const folder = overlayRoot.querySelector('.launcher-folder')?.getBoundingClientRect();
    return folder ? {rect: {left: folder.left - base.left, top: folder.top - base.top, right: folder.right - base.left, bottom: folder.bottom - base.top}} : {};
  }
  function placeCling(root, kind) { LauncherClings.cut(root, clingTarget(kind)); }
  function syncClings() {
    let kind = ui.power || ui.locked || ui.sleeping ? '' : LauncherClings.wanted(ui, data.clings);
    if (kind === 'folder' && ui.folderSettled !== ui.folderId) kind = '';
    // initCling(..., dimNavBarVisibility): the launcher asks for SYSTEM_UI_FLAG_LOW_PROFILE while a cling shows.
    screen.classList.toggle('kk-lights-out', !!kind);
    const current = clingLayerRoot().querySelector('.cling:not(.cling-leaving)');
    if (current?.dataset.cling === kind) { placeCling(current, kind); return; }
    current?.remove();
    if (!kind) return;
    clingLayerRoot().insertAdjacentHTML('beforeend', LauncherClings.markup(kind, key => i18n.t(key)));
    const root = clingLayerRoot().lastElementChild;
    placeCling(root, kind);
    // Cling.show: the first run cling appears at once, the workspace cling fades its content in, the folder one fades.
    if (kind === 'folder') LauncherClings.show(root);
    if (kind === 'workspace') { const content = root.querySelector('.kk-cling-content'); content?.animate?.([{opacity: 0}, {opacity: 1}], {duration: LauncherClings.SHOW}); }
    setTimeout(() => { if (root.isConnected) placeCling(root, kind); }, 450);
  }

  window.addEventListener('resize', () => syncClings());

  function renderFolder() {
    const folder=ICSLauncherFolders.folder(data,ui.folderId);if(!folder){ui.overlay='';return '';}
    const {columns,rows}=ICSLauncherFolders.dimensions(folder.items.length);
    return `<div class="launcher-folder-scrim" data-action="close-overlay"></div><div class="launcher-folder" role="dialog" aria-label="${safe(i18n.t('Folder'))}: ${safe(folderName(ui.folderId))}" style="width:${columns*74+24}px;--folder-columns:${columns}"><div class="launcher-folder-grid">${Array.from({length:columns*rows},(_,slot)=>`<div class="launcher-folder-cell" data-folder-slot="${slot}">${folder.items[slot]?launcherIcon(folder.items[slot]):''}</div>`).join('')}</div><form class="launcher-folder-name" data-form="folder-name"><input name="name" aria-label="Folder name" placeholder="Unnamed folder" maxlength="40" autocomplete="off" value="${safe(folder.name)}"></form></div>`;
  }
  function positionFolder() {
    const panel=overlayRoot.querySelector('.launcher-folder');if(!panel)return;
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
  /* WpsDialog: "Starting WPS…", then the push-button or PIN instructions with ic_wps; the timeout bar advances once a
     second up to WPS_TIMEOUT_S (120 s), after which the failure message and an OK button remain. */
  function wpsDialog() {
    const wps = ui.wps || {mode: 'pbc', start: Date.now(), pin: '30521874'}, elapsed = Math.floor((Date.now() - wps.start) / 1000), done = elapsed >= 120;
    const text = done ? i18n.t('WPS failed. Please try again in a few minutes.') : elapsed < 1 ? i18n.t('Starting WPS…') : wps.mode === 'pin' ? i18n.t('Enter pin %1$s on your Wi-Fi router. The setup can take up to two minutes to complete.').replace('%1$s', wps.pin) : i18n.t('Press the Wi-Fi Protected Setup button on your router. It may be called "WPS" or contain this symbol:');
    return `<div class="ga-scrim" data-action="close-overlay"></div><div class="ga-dialog ga-alert jb-wps" role="dialog" aria-label="${safe(i18n.t('Wi-Fi Protected Setup'))}" data-no-translate><h3 class="ga-title">${safe(i18n.t('Wi-Fi Protected Setup'))}</h3><div class="jb-wps-body"><p>${safe(text)}</p><img src="assets/jb-ic_wps.png" alt=""><span class="jb-progress-h" role="progressbar" aria-valuemin="0" aria-valuemax="120" aria-valuenow="${Math.min(120, elapsed)}"><i style="width:${Math.min(120, elapsed) / 120 * 100}%"></i></span><button type="button" class="jb-holo-button" data-action="close-overlay">${safe(i18n.t(done ? 'OK' : 'Cancel'))}</button></div></div>`;
  }
  setInterval(() => { if (ui.overlay === 'wifi-wps') renderOverlay(); }, 1000);
  // WifiP2pSettings: this device, then PEER DEVICES; Search for devices runs while the page is open.
  function renderWifiDirect() {
    const searching = data.settings.wifi && ui.p2pSearchUntil > Date.now();
    const right = `<button class="jb-ab-text" data-action="p2p-search" ${data.settings.wifi && !searching ? '' : 'disabled'}>${safe(i18n.t(searching ? 'Searching…' : 'Search for devices'))}</button><button class="connectivity-overflow" data-action="p2p-menu" aria-label="More options"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button>`;
    return appView('Wi-Fi Direct', `<div class="connectivity-page">${data.settings.wifi ? `<div class="settings-row network-row jb-p2p-device" aria-disabled="true"><span class="row-copy" data-no-translate>${safe(data.settings.p2pName || 'Android_4f3a')}</span></div>${label('PEER DEVICES')}` : ''}</div>`, '', right);
  }
  function startP2pSearch() { ui.p2pSearchUntil = Date.now() + 12000; clearTimeout(ui.p2pTimer); ui.p2pTimer = setTimeout(() => { if (ui.view === 'settings' && ui.sub === 'wifi-direct') render(); }, 12100); }
  /* WifiDisplaySettings: the feature is DISABLED while Wi-Fi is off; when ON it scans, listing AVAILABLE DEVICES with a
     progress spinner and, once the scan ends without results, "No nearby wireless displays were found." */
  function startWfdScan() { ui.wfdScanUntil = Date.now() + 10000; clearTimeout(ui.wfdTimer); ui.wfdTimer = setTimeout(() => { if (ui.view === 'settings' && ui.sub === 'wifi-display') render(); }, 10100); }
  function renderWifiDisplay() {
    const on = !!data.settings.wifiDisplay && !!data.settings.wifi;
    const menu = `<button class="jb-ab-action" data-action="kk-cast-menu" aria-label="${safe(i18n.t('More options'))}"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button>`;
    return appView('Cast screen', `<div class="connectivity-page"><p class="wfd-empty">${safe(i18n.t('No nearby devices were found.'))}</p></div>`, '', menu);
  }

  function renderWifiSettings() {
    return appView('Wi-Fi', `<div class="connectivity-page">${data.settings.wifi ? allWifiNetworks().sort((a,b) => Number(b.name === data.settings.wifiNetwork) - Number(a.name === data.settings.wifiNetwork) || b.strength - a.strength || a.name.localeCompare(b.name, i18n.locale())).map(network => `<button class="settings-row network-row" data-action="wifi-network" data-id="${safe(network.name)}"><span class="row-copy">${safe(network.name)}<small>${data.settings.wifiNetwork === network.name ? i18n.t('Connected') : network.security === 'Open' ? i18n.t('Open network') : i18n.t('Secured with WPA2')}</small></span><span class="network-signal"><img src="assets/${network.security === 'Open' ? `ic_wifi_signal_${network.strength >= 3 ? 3 : 2}` : 'ic_wifi_lock_signal_4'}.png" alt=""></span></button>`).join('') : '<p class="connectivity-empty">Turn on Wi-Fi to see available networks</p>'}</div>`, '', connectivitySwitch('wifi', 'Wi-Fi', true) + `<button class="jb-ab-action" data-action="wifi-wps" data-id="pbc" aria-label="${safe(i18n.t('WPS Push Button'))}" ${data.settings.wifi ? '' : 'disabled'}><img src="assets/jb-ic_wps.png" alt=""></button><button class="jb-ab-action" data-action="wifi-add" aria-label="${safe(i18n.t('Add network'))}" ${data.settings.wifi ? '' : 'disabled'}><img src="assets/jb-ic_menu_add.png" alt=""></button>` + connectivityMenu('wifi'));
  }
  function renderBluetoothSettings() {
    const deviceRow = (name, paired) => `<button class="settings-row network-row" data-action="bluetooth-pair" data-id="${safe(name)}"><span class="network-signal"><img src="assets/${name === 'Car Audio' ? 'ic_bt_headphones_a2dp' : 'ic_bt_headset_hfp'}.png" alt=""></span><span class="row-copy">${safe(name)}${paired ? '<small>Paired</small>' : ''}</span>${paired ? '<img class="bt-config-icon" src="assets/ic_bt_config.png" alt="">' : ''}</button>`;
    return appView('Bluetooth', `<div class="connectivity-page">${data.settings.bluetooth ? `<button class="settings-row network-row" data-action="toggle-setting" data-id="bluetoothVisible"><span class="network-signal"><img src="assets/ic_bt_cellphone.png" alt=""></span><span class="row-copy">${safe(data.settings.bluetoothName || 'Nexus 4')}<small>${data.settings.bluetoothVisible ? i18n.t('Visible to nearby Bluetooth devices') : i18n.t('Not visible to other Bluetooth devices')}</small></span></button>${data.settings.pairedDevice ? `${label('PAIRED DEVICES')}${deviceRow(data.settings.pairedDevice, true)}` : ''}${label('AVAILABLE DEVICES')}${ui.bluetoothScanned ? ['Wireless Headset','Car Audio'].filter(name => name !== data.settings.pairedDevice).map(name => deviceRow(name, false)).join('') : '<p class="connectivity-empty small">Tap Scan to find nearby devices</p>'}` : '<p class="connectivity-empty">Turn on Bluetooth to see nearby devices</p>'}</div>`, '', connectivitySwitch('bluetooth', 'Bluetooth', true) + connectivityMenu('bluetooth'));
  }

  function renderSettings() {
    const s = ui.sub;
    if(s==='lock-setup')return lockControls.renderSetup();
    const system=ICSSystemSettings.render(data,ui,key=>i18n.t(key),i18n.locale());
    if(system)return appView(system.title,system.body,'sx-page',system.right);
    const detail=ICSSettingsDetail.render(data,ui,apps,key=>i18n.t(key));
    if(detail)return appView(detail.title,detail.body,'sd-page');
    if (s === 'wifi') return renderWifiSettings();
    if (s === 'wifi-display') { if (data.settings.wifiDisplay && data.settings.wifi && !ui.wfdScanUntil) startWfdScan(); return renderWifiDisplay(); }
    if (s === 'wifi-direct') { if (!ui.p2pSearchUntil) startP2pSearch(); return renderWifiDirect(); }
    if (s === 'bluetooth') return renderBluetoothSettings();
    // 4.4 WallpaperTypeSettings: "Choose wallpaper from" lists every ACTION_SET_WALLPAPER activity with its icon.
    if (s === 'wallpaper') {
      const sources = [['gallery-wallpaper', 'Gallery', 'gallery.png'], ['open-live-wallpapers', 'Live Wallpapers', 'kwp-ic_launcher_live_wallpaper.png'], ['open-wallpapers', 'Wallpapers', 'kwp-ic_launcher_wallpaper.png']].sort((a, b) => new Intl.Collator(i18n.locale()).compare(i18n.t(a[1]), i18n.t(b[1])));
      return appView('Choose wallpaper from', sources.map(([action, label, icon]) => `<button class="settings-row kk-wallpaper-type" data-action="${action}"><img class="kk-wallpaper-type-icon" src="assets/${icon}" alt=""><span class="row-copy">${safe(i18n.t(label))}</span></button>`).join(''));
    }
    if (s === 'about') return appView('About phone', `${row('Status', 'Phone number, signal, etc.', 'settings-sub', 'about-status')}${row('Legal information', '', 'settings-sub', 'about-legal')}${row('Model number', 'Nexus 5', 'noop', '')}${row('Android version', '4.4.4', 'about-tap', '')}${row('Baseband version', 'M8974A-2.0.50.1.16', 'noop', '')}${row('Kernel version', '3.4.0-gd59db4e\nandroid-build@vpbs1.mtv.corp.google.com #1\nMon Mar 17 15:16:36 PDT 2014', 'noop', '')}${row('Build number', 'KTU84P', 'developer-tap', '')}${row('SELinux status', i18n.t('Enforcing'), 'noop', '')}`, 'about-settings');
    if (s === 'about-status') return appView('Status', `${row('Battery status', 'Discharging', 'noop', '')}${row('Battery level', '78%', 'noop', '')}${row('Network', carrierName(), 'noop', '')}${row('Signal strength', data.settings.airplane ? '0 dBm  99 asu' : '-75 dBm  19 asu', 'noop', '')}${row('Phone number', 'Unknown', 'noop', '')}${row('Wi-Fi MAC address', '02:00:00:40:04:01', 'noop', '')}${row('Bluetooth address', data.settings.bluetooth ? '02:00:00:40:04:02' : 'Unavailable', 'noop', '')}`, 'about-settings');
    if (s === 'about-legal') return appView('Legal information', `${row('Open source licenses', 'Android Open Source Project', 'noop', '')}${row('Google legal', 'Offline demonstration', 'noop', '')}`, 'about-settings');
    if (s === 'about-safety') return appView('Safety information', `<div class="detail-pad"><p>Nexus 5 safety information is not available in this offline simulation.</p></div>`, 'about-settings');
    if (s === 'easter') return `<div class="kk-platlogo" data-kk-platlogo aria-label="Android KitKat"></div>`;
    if (s === 'dessert') return `<div class="kk-dessert" data-kk-dessert aria-label="Dessert Case"></div>`;
    if (s === 'jb-easter') return `<div class="jb-platlogo-view"><button class="jb-platlogo" data-action="jb-platlogo" aria-label="Android Jelly Bean"><img src="assets/${ui.jbLogoTapped ? 'jb-platlogo' : 'jb-platlogo_alt'}.png" alt=""></button></div>`;
    if (s === 'beanbag') return `<div class="jb-beanbag" data-beanbag aria-label="BeanBag"></div>`;
    if (s === 'wireless') return appView('Wireless & networks', `${wirelessCheckRow('Airplane mode', '', 'airplane')}<button class="settings-row wireless-row" data-action="kk-sms-app"><span class="row-copy">Default SMS app<small>Messaging</small></span></button>${wirelessCheckRow('NFC', 'Allow data exchange when the phone touches another device', 'nfc')}${wirelessRow('Android Beam', 'Ready to transmit app content via NFC', 'beam')}${wirelessRow('Tethering & portable hotspot', '', 'tethering')}${wirelessRow('VPN', '', 'vpn')}${wirelessRow('Mobile networks', '', 'mobile-networks')}`, 'wireless-more');
    if (s === 'beam') return appView('Android Beam', `${wirelessCheckRow('Android Beam', 'Ready to transmit app content via NFC', 'androidBeam')}`, 'wireless-more');
    if (s === 'brightness') return appView('Brightness', `<div class="detail-pad"><h3>Brightness</h3><input type="range" min="10" max="100" value="${data.settings.brightness}" data-field="brightness" aria-label="Brightness"><p>${data.settings.brightness}%</p></div>`);
    if (s === 'sync') return appView('Accounts & sync', `${toggleRow('Auto-sync', 'Sync app data automatically', 'autoSync', '↻')}${label('ACCOUNTS')}${row('Google', 'demo@android.local', 'settings-sub', 'sync-google', '◎')}${row('Add account', '', 'toast', 'Demo account already added', '<img src="assets/setting-add-account.png" alt="">')}`);
    if (s === 'sync-google') return appView('Google', `<div class="detail-pad"><h3>demo@android.local</h3><p>Sample account data is stored only in this browser.</p></div>${row('Sync Gmail', 'Last synced today', 'noop', '', '✉')}${row('Sync Calendar', 'Last synced today', 'noop', '', '▦')}${row('Sync Contacts', 'Last synced today', 'noop', '', '◉')}`);
    if (s === 'location') {
      const on = data.settings.locationAccess !== false, mode = locationMode();
      return appView('Location', `<div class="kk-location${on ? '' : ' jb-disabled-group'}"><button class="settings-row wireless-row" data-action="settings-sub" data-id="location-mode" ${on ? '' : 'disabled'}><span class="row-copy">Mode<small>${safe(i18n.t(on ? LOCATION_MODES[mode][0] : 'Location off'))}</small></span></button></div>${label('Recent location requests')}<div class="settings-row wireless-row kk-pref-disabled" aria-disabled="true"><span class="row-copy">No apps have requested location recently</span></div>`, 'wireless-more kk-location-page', connectivitySwitch('locationAccess', 'Location', true));
    }
    if (s === 'location-mode') return appView('Location mode', Object.entries(LOCATION_MODES).map(([id, [title, summary]]) => `<button class="settings-row wireless-row" data-action="kk-location-mode" data-id="${id}" role="radio" aria-checked="${locationMode() === id}"><span class="row-copy">${safe(title)}<small>${safe(summary)}</small></span><img class="holo-radio" src="assets/btn_radio_${locationMode() === id ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join(''), 'wireless-more kk-location-page');
    // PaymentSettings with no HCE payment services, and PrintSettingsFragment with no print services.
    if (s === 'nfc-payment') return appView('Tap & pay', `<div class="kk-empty-page"><img src="assets/setting-nfc-payment.png" alt=""><p>Pay with just a tap</p><button class="kk-link" data-action="toast" data-id="Learn more">Learn more</button></div>`, 'kk-empty', `<button class="jb-ab-action kk-ab-text" data-action="open-app" data-app="play-store">${safe(i18n.t('Find apps'))}</button>`);
    if (s === 'print') return appView('Printing', `${label('Print services')}<p class="kk-empty-text">No services installed</p>`, 'kk-print', `<button class="jb-ab-action" data-action="open-app" data-app="play-store" aria-label="${safe(i18n.t('Add service'))}"><img src="assets/jb-ic_menu_add.png" alt=""></button>`);
    if (s === 'daydream') return renderDaydreamSettings();
    if (s === 'backup') return appView('Backup & reset', `${label('BACKUP & RESTORE')}${toggleRow('Back up my data', 'Back up app data and settings', 'backup', '↻')}${prefRow('Backup account', 'No account is currently storing backed up data')}${toggleRow('Automatic restore', 'Restore settings when reinstalling apps', 'autoRestore', '↻')}${label('PERSONAL DATA')}${row('Factory data reset', 'Erase local simulator data', 'settings-sub', 'reset-info', '⚠')}`);
    if (s === 'reset-info') return appView('Factory data reset', `<div class="detail-pad"><h3>Erase local simulator data</h3><p>This clears the saved home screens, settings, and sample content for this version.</p><button class="small-button" data-action="factory-reset">Reset simulator</button></div>`);
    if (s === 'accessibility') return appView('Accessibility', `${label('SERVICES')}${row('No services installed', '', 'noop', '', '')}${label('SYSTEM')}${prefRow('Magnification gestures', 'Off')}${toggleRow('Large text', '', 'largeText', 'A')}${toggleRow('Power button ends call', '', 'powerEndsCall', '⏻')}${toggleRow('Auto-rotate screen', '', 'rotate', '↻')}${toggleRow('Speak passwords', '', 'speakPasswords', '◉')}${prefRow('Accessibility shortcut', 'Off')}${prefRow('Text-to-speech output', '')}${prefRow('Touch & hold delay', 'Short')}`);
    // Android 4.3 development_prefs.xml, with the master switch in the action bar (DevelopmentSettings).
    if (s === 'development') return appView('Developer options', JBDeveloperOptions.render(data.settings, key => i18n.t(key), value => ICSSettingsDetail.animationScaleLabel(value)), '', connectivitySwitch('developerEnabled', i18n.t('Developer options'), true));
    // Settings 4.3 language_settings.xml: Language opens its own list; keyboards, speech and pointer speed follow.
    const languageNames = {en: 'English', hu: 'Magyar', de: 'Deutsch', fr: 'Français', es: 'Español'};
    if (s === 'language') return appView('Language & input', `${prefRow('Language', languageNames[i18n.language], 'settings-sub', 'language-pick')}${wirelessCheckRow('Spell checker', '', 'spellChecker')}${label('KEYBOARD & INPUT METHODS')}${prefRow('Default', 'Android keyboard (AOSP)')}${wirelessCheckRow('Android keyboard (AOSP)', languageNames[i18n.language], 'imeLatin')}${label('SPEECH')}${prefRow('Voice search', '')}${prefRow('Text-to-speech output', '')}${label('MOUSE/TRACKPAD')}${prefRow('Pointer speed', '')}`);
    if (s === 'language-pick') return appView('Language', Object.entries(languageNames).map(([code, name]) => `<button class="settings-row wireless-row" data-action="set-language" data-id="${code}" role="radio" aria-checked="${i18n.language === code}" data-no-translate><span class="row-copy">${name}</span><img class="holo-radio" src="assets/btn_radio_${i18n.language === code ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join(''));
    if (s === 'volumes' || s === 'ringtone' || s === 'sleep') return appView(s === 'volumes' ? 'Volumes' : s === 'ringtone' ? 'Phone ringtone' : 'Sleep', `<div class="detail-pad"><p>${s === 'ringtone' ? 'Orion is selected.' : s === 'sleep' ? 'Screen turns off after 30 seconds.' : 'Ringtone 70% · Media 60% · Alarm 80%'}</p></div>`);
    return appView('Settings', `${label('WIRELESS & NETWORKS')}${connectivityRow('Wi-Fi', 'wifi')}${connectivityRow('Bluetooth', 'bluetooth')}${row('Data usage', '', 'settings-sub', 'data', '◕')}${row('More...', '', 'settings-sub', 'wireless', null)}${label('DEVICE')}${row('Sound', '', 'settings-sub', 'sound', '♫')}${row('Display', '', 'settings-sub', 'display', '☼')}${row('Storage', '', 'settings-sub', 'storage', '▤')}${row('Battery', '', 'settings-sub', 'battery', '◧')}${row('Apps', '', 'settings-sub', 'apps', '▦')}${row('Tap & pay', '', 'settings-sub', 'nfc-payment', '◎')}${label('PERSONAL')}${row('Location', '', 'settings-sub', 'location', '◎')}${row('Security', '', 'settings-sub', 'security', '◉')}${row('Language & input', '', 'settings-sub', 'language', '◎')}${row('Backup & reset', '', 'settings-sub', 'backup', '↻')}${label('ACCOUNTS')}${row('Google', '', 'settings-sub', 'sync-google', '◎')}${row('Add account', '', 'toast', 'Demo account already added', '<img src="assets/setting-add-account.png" alt="">')}${label('SYSTEM')}${row('Date & time', '', 'settings-sub', 'date', '◷')}${row('Accessibility', '', 'settings-sub', 'accessibility', '◉')}${row('Printing', '', 'settings-sub', 'print', '▤')}${data.settings.developerUnlocked ? row('Developer options', '', 'settings-sub', 'development', '⚙') : ''}${row('About phone', '', 'settings-sub', 'about', '◉')}`);
  }

  function normalizeAddress(raw) {
    const value = raw.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
    if (!value) return 'www.google.com';
    if (value.startsWith('search:') || value.startsWith('chrome://')) return value;
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
  function saveBrowserState() {
    syncBrowserState();
    if (ui.browserOwner === 'chrome') {
      // Incognito tabs are not stored.
      const tabs = ui.browserSession.tabs.filter(tab => !tab.incognito), current = ICSBrowserSession.current(ui.browserSession);
      data.chromeSession = clone({tabs: tabs.length ? tabs : [{history: [ChromeApp.NTP], index: 0}], active: Math.max(0, tabs.indexOf(current))});
    } else data.browserSession = clone(ui.browserSession);
    save();
  }
  const restoreChrome = () => ICSBrowserSession.restore(data.chromeSession, [ChromeApp.NTP]);
  function useBrowserSession(owner) {
    if (ui.browserOwner === owner) return;
    ui.browserSessions[ui.browserOwner] = ui.browserSession;
    ui.browserSession = ui.browserSessions[owner] || (owner === 'chrome' ? restoreChrome() : ICSBrowserSession.restore(data.browserSession, data.browserHistory));
    ui.browserOwner = owner; ui.browserFind = undefined; syncBrowserState();
  }
  function chromeTitle(url) { return url === ChromeApp.NTP ? i18n.t('New tab') : url === ChromeApp.HISTORY ? i18n.t('History') : browserTitle(url); }
  function renderChrome() {
    const session = ui.browserSession, tab = ICSBrowserSession.current(session);
    return ChromeApp.render({ui, data, t: key => i18n.t(key), locale: i18n.locale(), page: renderWebsite, title: chromeTitle, url: ui.browserUrl, incognito: !!tab.incognito, tabs: session.tabs.map(item => ({url: item.history[item.index], incognito: !!item.incognito})), active: session.active});
  }
  function chromeNewTab(incognito) {
    if (!ICSBrowserSession.add(ui.browserSession)) { toast('Tab limit reached'); return; }
    const tab = ICSBrowserSession.current(ui.browserSession);
    tab.history = [ChromeApp.NTP]; tab.index = 0; if (incognito) tab.incognito = true;
    ui.sub = ''; ui.overlay = ''; ui.browserFind = undefined; renderOverlay(); saveBrowserState(); render();
  }
  function chromeSection(id) {
    const incognito = !!ICSBrowserSession.current(ui.browserSession).incognito;
    ui[incognito ? 'chromeNtpIncognito' : 'chromeNtp'] = id; ui.overlay = ''; renderOverlay();
    if (ui.browserUrl !== ChromeApp.NTP) navigateBrowser(ChromeApp.NTP); else render();
  }
  function navigateBrowser(url) {
    const normalized = normalizeAddress(url);
    ICSBrowserSession.navigate(ui.browserSession,normalized);
    if (!normalized.startsWith('chrome://') && !(ui.browserOwner === 'chrome' && ICSBrowserSession.current(ui.browserSession).incognito)) data.browserHistory = [...data.browserHistory,normalized].slice(-50);
    ui.sub = ''; ui.overlay = ''; ui.browserFind = undefined; saveBrowserState(); render();
  }
  function browserBack() { ICSBrowserSession.move(ui.browserSession,-1); saveBrowserState(); render(); }
  function browserForward() { ICSBrowserSession.move(ui.browserSession,1); ui.overlay = ''; saveBrowserState(); render(); }
  function browserLink(url, title, subtitle = '') { return `<div class="web-result"><a href="#" data-action="browser-link" data-url="${safe(url)}"><strong>${safe(title)}</strong></a><small>${safe(url)}</small><p>${safe(subtitle)}</p></div>`; }
  function renderWebsite(url) {
    if (url === 'www.google.com') return `<div class="google-logo"><span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span></div><form class="search-form" data-form="web-search"><input name="query" aria-label="Search the web" placeholder="Search the web" required><button type="submit">Search</button></form><div class="browser-tiles">${[['www.android.com','Android'],['en.wikipedia.org/wiki/Android','Wikipedia'],['news.example','News'],['retro.example','2014 Web']].map(item => `<button data-action="browser-link" data-url="${item[0]}">${item[1]}</button>`).join('')}</div><p style="font-size:11px;color:#888;margin-top:24px">Offline demo pages · 2014</p>`;
    if (url.startsWith('search:')) {
      const term = url.slice(7);
      return `<h2>Search results</h2><p>Results for <strong>${safe(term)}</strong></p>${browserLink('www.android.com', 'Android – Discover Android 4.4, KitKat', 'KitKat brings immersive mode, a smarter Phone app, printing and Tap & pay to more devices.')}${browserLink('en.wikipedia.org/wiki/Android', 'Android (operating system) – Wikipedia', 'An overview of the Android mobile operating system.')}${browserLink('news.example', 'Tech News', `Stories related to ${term}.`)}`;
    }
    if (url.includes('android.com')) return `<h2 style="color:#79b93f">android</h2><h3>Meet Android 4.4, KitKat</h3><p>Smart, simple and truly yours: a cleaner look with translucent bars, immersive full-screen apps, caller ID for businesses, printing and Tap &amp; pay — and it runs well on phones with as little as 512 MB of memory.</p><div style="background:#ed1d24;color:white;padding:25px;text-align:center;font-size:38px">🤖<br><small style="font-size:17px">KitKat</small></div>${browserLink('en.wikipedia.org/wiki/Android','Learn about Android','The story of Android.')}`;
    if (url.includes('wikipedia.org')) return `<h2>Android (operating system)</h2><p><small>From Wikipedia, the free encyclopedia</small></p><hr><p>Android is a mobile operating system based on a modified version of the Linux kernel. Android 4.0, known as Ice Cream Sandwich, introduced the Holo interface and virtual navigation buttons; versions 4.1–4.3, Jelly Bean, added Project Butter, Google Now and expandable notifications; Android 4.4, KitKat, was tuned to run on devices with 512 MB of RAM and introduced immersive mode and the Storage Access Framework.</p><h3>Versions</h3><p>Gingerbread · Ice Cream Sandwich · Jelly Bean · KitKat</p>${browserLink('www.android.com','Official Android website')}`;
    if (url === 'news.example/nexus-5' || url === 'retro.example/kitkat') return `<article class="web-offline-article"><h2>${url.startsWith('news')?'A day with the Nexus 5':'A closer look at KitKat'}</h2><time>November 1, 2013 · Demo archive</time><p>The phone has a 4.95-inch 1080p screen, translucent system bars and white status icons. Open the app drawer to discover the KitKat experience.</p><h3>Everyday essentials</h3><p>Contacts, messages and the browser share a simple visual language. Swipe between home screens, arrange your favorite apps, and pull down the notification shade.</p><h3>Make it yours</h3><p>Choose a wallpaper, add an analog clock and keep your favorite contacts close. This small offline archive is a fictional snapshot of the early smartphone era.</p>${browserLink('news.example','Back to Tech News')}${browserLink('retro.example/kitkat','Explore KitKat')}</article>`;
    if (url.includes('news.example')) return `<h2>Tech News</h2><p style="color:#777">Thursday, June 19, 2014</p><hr><h3>Android 4.4.4 arrives on the Nexus 5</h3><p>The KitKat update brings security fixes and smaller improvements to Google's Nexus devices.</p><h3>Apps in your pocket</h3><p>Explore the growing world of mobile apps and connected devices.</p>${browserLink('news.example/nexus-5','Read the Nexus 5 story')}${browserLink('retro.example','Visit the 2014 Web')}`;
    if (url.includes('retro.example')) return `<h2>Welcome to the 2014 Web</h2><p>A little time capsule from the early smartphone era.</p><ul><li>Share photos</li><li>Check your email</li><li>Customize your phone</li></ul>${browserLink('retro.example/kitkat','Explore KitKat')}${browserLink('maps.example','Open the sample map')}${browserLink('www.google.com','Back to Google')}`;
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

  /* Google Play Store 4.8.22: ui.market holds the page, section, tab and selection, ui.marketHistory the back stack;
     downloads run on a timer with a notification while they last and "Successfully installed." afterwards. */
  function jbPlayContext() {
    const m = ui.market || {page: 'home'};
    return {lang: i18n.language, locale: i18n.locale(), ...m, installed: data.marketInstalled || [], everInstalled: data.marketEverInstalled || [], downloading: ui.marketDownload?.id || '', phase: ui.marketDownload?.phase || '', progress: ui.marketDownload?.progress || 0, plussed: data.marketPlus || [], autoUpdate: data.marketAuto || [], wishlist: data.marketWishlist || [], rated: data.marketRated || {}, prefs: {notify: true, widgets: true, pin: false, autoMode: 'wifi', password: '30', ...(data.marketPrefs || {})}, permNoteSeen: !!data.marketPermNote, permOpen: ui.marketPermOpen || '', permView: !!ui.marketPermView, searching: !!ui.marketSearching, editValue: ui.marketEdit || '', history: data.marketSearches || [], target: ui.marketTarget, popTop: ui.marketPopTop};
  }
  function jbPlayGo(next) { (ui.marketHistory ||= []).push({...(ui.market || {page: 'home'}), scroll: viewport.querySelector('.jbp-scroll')?.scrollTop || 0}); ui.market = {...(ui.market || {}), ...next}; ui.overlay = ''; ui.marketSearching = false; render(); }
  function jbPlayKeepScroll() { const top = viewport.querySelector('.jbp-scroll')?.scrollTop || 0; render(); const list = viewport.querySelector('.jbp-scroll'); if (list) list.scrollTop = top; }
  function jbPlayDownload(id) {
    const item = JBPlay.find(id); if (!item) return;
    clearInterval(ui.marketTimer); ui.marketDownload = {id, phase: 'downloading', progress: 0};
    data.notifications = data.notifications.filter(n => n.kind !== 'market-dl');
    data.notifications.unshift({id: Date.now(), title: item.name, detail: JBPlay.text(i18n.language, 'Downloading…'), kind: 'market-dl'});
    save(); render(); renderStatus();
    ui.marketTimer = setInterval(() => {
      const d = ui.marketDownload; if (!d) { clearInterval(ui.marketTimer); return; }
      if (d.phase === 'downloading') { d.progress = Math.min(1, d.progress + .12); if (d.progress >= 1) d.phase = 'installing'; }
      else { clearInterval(ui.marketTimer); ui.marketDownload = null; data.marketInstalled = [...new Set([...(data.marketInstalled || []), id])]; data.marketEverInstalled = [...new Set([...(data.marketEverInstalled || []), id])]; data.notifications = data.notifications.filter(n => n.kind !== 'market-dl'); if ((data.marketPrefs?.notify) !== false) data.notifications.unshift({id: Date.now(), title: item.name, detail: JBPlay.text(i18n.language, 'Successfully installed.'), kind: 'market'}); save(); renderStatus(); }
      if (ui.view === 'play-store') { const bar = viewport.querySelector('.jbp-progress b'); if (bar && ui.marketDownload?.phase === 'downloading') bar.style.width = `${Math.round(ui.marketDownload.progress * 100)}%`; else jbPlayKeepScroll(); }
    }, 350);
  }
  function navigatePlay(next) {
    ui.playHistory.push({...ui.play,scrollTop:viewport.querySelector('.play-content')?.scrollTop || 0});
    ui.play = {...ui.play,...next}; ui.overlay = ''; render();
  }
  function renderPhone() {
    if(ui.activeCall)return ICSPhoneCall.render(ui.activeCall,contactByPhone(ui.activeCall.number),key=>i18n.t(key));
    if(ui.sub==='call-detail'){const call=(data.callHistory||[]).find(call=>call.time===ui.phoneCallId);if(call)return ICSPhoneCall.details(call,contactByPhone(call.number),key=>i18n.t(key),i18n.locale());}
    // Android 4.4 Dialer (kk-dialer.js): speed dial, search, sliding dialpad and the History screen.
    return KKDialer.render({data, ui, t: key => i18n.t(key), locale: i18n.locale(), byPhone: contactByPhone});
    const tabs = [['dialpad','Dial pad','dialer'],['history','Call log','history'],['favorites','Favorites','favourites']];
    // Dialer 4.3 (dialtacts_options.xml): search and the overflow sit at the end of the tab bar.
    const header = `<div class="phone-tabs jb-phone-tabs" role="tablist">${tabs.map(([id,title,icon]) => `<button role="tab" aria-selected="${ui.phoneTab === id}" aria-label="${title}" data-action="phone-tab" data-id="${id}"><img src="assets/ic_ab_${icon}_holo_dark.png" alt=""></button>`).join('')}<span class="jb-phone-tab-actions"><button data-action="phone-search" aria-label="Search contacts"><img src="assets/ic_dial_action_search.png" alt=""></button><button data-action="phone-menu" aria-label="More options"><img src="assets/ic_menu_overflow.png" alt=""></button></span></div>`;
    let body;
    if (ui.phoneTab === 'history') {
      body = `<div class="phone-list">${(data.callHistory || []).length ? [...data.callHistory].reverse().map(call => `<div class="phone-log-row"><button class="phone-history-row" data-action="phone-log-detail" data-id="${call.time}"><img class="phone-contact-image" src="assets/ic_contact_picture_holo_dark.png" alt=""><span>${safe(contactByPhone(call.number)?.name || call.number)}<small><img src="assets/ic_call_outgoing_holo_dark.png" alt="">${new Date(call.time).toLocaleString(i18n.locale(),{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</small></span></button><button class="phone-log-redial" data-action="phone-redial" data-id="${safe(call.number)}" aria-label="${safe(i18n.t('Call'))}"><img class="phone-redial" src="assets/ic_dial_action_call.png" alt=""></button></div>`).join('') : '<p class="empty-note">Call log is empty</p>'}</div>`;
    } else if (ui.phoneTab === 'favorites') {
      const favorites=data.contacts.filter(person=>person.favorite && (!ui.phoneSearch || `${person.name} ${person.phone}`.toLocaleLowerCase().includes(ui.phoneSearch.toLocaleLowerCase())));
      body = `<div class="phone-list">${ui.phoneSearch !== undefined ? `<form class="phone-search" data-form="phone-search"><input name="query" aria-label="Search contacts" placeholder="Search contacts" value="${safe(ui.phoneSearch)}"><button aria-label="Search" type="submit"><img src="assets/ic_dial_action_search.png" alt=""></button></form>` : ''}${favorites.length?`<div class="phone-section">Favorites</div><div class="phone-favorite-tiles">${favorites.map(person=>`<button data-action="contact-call" data-id="${person.id}"><img src="assets/phone-picture_unknown.png" alt=""><span>${safe(person.name)}</span></button>`).join('')}</div>`:''}<div class="phone-section">All contacts</div>${data.contacts.filter(person => !ui.phoneSearch || `${person.name} ${person.phone}`.toLocaleLowerCase().includes(ui.phoneSearch.toLocaleLowerCase())).map(person => `<button class="phone-history-row" data-action="contact-call" data-id="${person.id}"><img class="phone-contact-image" src="assets/ic_contact_picture_holo_dark.png" alt=""><span>${safe(person.name)}<small>${safe(person.phone)}</small></span></button>`).join('')}</div>`;
    } else {
      body = `<div class="ics-dialer"><div class="dial-digits"><output aria-label="Phone number">${safe(ui.dial)}</output><button data-action="dial-delete" aria-label="Delete"><img src="assets/ic_dial_action_delete.png" alt=""></button></div>${JBDialer.render(data.contacts, ui.dial, key => i18n.t(key))}<div class="ics-dial-pad">${['1','2','3','4','5','6','7','8','9','*','0','#'].map(digit => `<button data-action="dial" data-id="${digit}" aria-label="${digit}"><img src="assets/dial_num_${digit === '*' ? 'star' : digit === '#' ? 'pound' : digit}_wht.png" alt=""></button>`).join('')}</div><div class="dial-actions jb-dial-actions"><button class="dial-call" data-action="call" aria-label="Call"><img src="assets/ic_dial_action_call.png" alt=""></button></div></div>`;
    }
    return `<div class="app-view phone-app">${header}${body}</div>`;
  }
  function contactByPhone(number) { const normalized = String(number).replace(/[^\d+]/g, ''); return data.contacts.find(item => item.phone.replace(/[^\d+]/g, '') === normalized); }
  function startPhoneCall(number) {
    if(!number)return;
    if(!ui.activeCall)ui.activeCall=ICSPhoneCall.start(number);
    captureRecentView();ui.recent=['phone',...ui.recent.filter(id=>id!=='phone')].slice(0,7);
    ui.callNumber=ui.activeCall.number;ui.view='phone';ui.sub='calling';ui.overlay='';render();
  }
  function renderPeople() { return ICSPeople.render(data,ui,key => i18n.t(key),i18n.locale()); }
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
    if (!['messaging', 'hangouts'].includes(ui.view)) openApp('hangouts');
    if (ui.sub !== 'thread') ui.mmsListMode = ui.sub === 'search' ? 'search' : '';
    ui.thread = key; ui.sub = 'thread'; ui.overlay = '';
    data.messages.filter(m => String(m.contact) === String(key)).forEach(m => { m.read = true; });
    if (String(key) === '1') data.notifications = data.notifications.filter(n => n.id !== 2);
    save(); render(); scrollMessages();
  }
  function pickHangout(key) {
    const pending = data.messageDrafts?.new;
    if (pending && (pending.body || pending.attachment)) {
      const target = data.messageDrafts[String(key)] ||= {body: '', recipient: ''};
      target.body = [target.body, pending.body].filter(Boolean).join(' ').slice(0, 2000);
      if (pending.attachment) target.attachment = pending.attachment;
      target.updated = Date.now();
    }
    if (data.messageDrafts) delete data.messageDrafts.new;
    ui.mmsListMode = '';
    openMessageThread(key);
  }
  function scrollMessages() {
    const history = viewport.querySelector('.mms-history');
    if (history) history.scrollTop = history.scrollHeight;
  }
  function renderMessageOverlay() {
    const dialog = (title, content) => `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog mms-dialog" role="dialog" aria-label="${safe(i18n.t(title))}"><h3>${safe(i18n.t(title))}</h3>${content}</div>`;
    const option = (action, text, id = '') => `<button data-action="${action}" data-id="${safe(id)}">${safe(i18n.t(text))}</button>`;
    const hangouts = ui.view === 'hangouts' ? Hangouts.overlay(data, ui, key => i18n.t(key)) : null;
    if (hangouts !== null) return hangouts;
    if (ui.overlay === 'mms-attach-photos') return dialog('Attach photo', `<div class="mms-dialog-list">${data.photos.map(p => `<button data-action="mms-photo" data-id="${p.id}">${ICSMessaging.photo(p)}</button>`).join('') || '<p>No photos</p>'}</div>`);
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
  // Google+ Photos (stock Nexus 5) over the simulator's pictures.
  const photosContext = () => ({data, ui, t: key => i18n.t(key), locale: i18n.locale(), media: ICSMedia, groups: JBGallery.groups(data, 'album', i18n.locale())});
  function photosCurrent() { const list = PhotosApp.list(photosContext()); return list[ui.photosIndex] || null; }
  function photosShare(photo) { if (!photo) return; ui.overlay = ''; renderOverlay(); openApp('hangouts'); ui.sub = 'new'; messageDraft().attachment = clone(photo); save(); render(); }
  // Swipe between pictures in the viewer; a tap shows or hides the bars.
  function attachPhotosSwipe() {
    const pane = viewport.querySelector('.ph-viewer');
    if (!pane || pane.dataset.swipe) return;
    pane.dataset.swipe = '1';
    let start = null;
    pane.addEventListener('pointerdown', event => { start = {x: event.clientX, y: event.clientY}; });
    pane.addEventListener('pointerup', event => {
      if (!start) return;
      const dx = event.clientX - start.x, dy = event.clientY - start.y; start = null;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      const list = PhotosApp.list(photosContext()), next = ui.photosIndex + (dx < 0 ? 1 : -1);
      if (next < 0 || next >= list.length) return;
      ui.photosIndex = next; ui.selectedPhoto = list[next].id; suppressReleaseClick(); render();
    });
  }
  function photoStyle(photo) { return `background-image:url('${ICSMedia.image(photo)}');background-size:cover;background-position:center`; }
  function renderGallery() { return JBGallery.render(data, ui, key => i18n.t(key), ICSMedia, i18n.locale()); }
  const galleryItems = () => JBGallery.items(data, ui, i18n.locale());
  function galleryWallpaper(photo, quiet) { data.wallpaper = 11; delete data.liveWallpaper; data.customWallpaper = photo.colors; data.customWallpaperPhoto = clone(photo); save(); if (quiet) return; render(); toast('Wallpaper set'); }
  const wallpaperPickerContext = () => ({data, ui, t: key => i18n.t(key), image: photo => ICSMedia.image(photo), live: LiveWallpapers.sorted(key => i18n.t(key), i18n.locale())});
  // Re-render the picker but keep the strip where it was scrolled.
  function wallpaperPickerRender() { const left = viewport.querySelector('.kwp-scroll')?.scrollLeft || 0; render(); const strip = viewport.querySelector('.kwp-scroll'); if (strip) strip.scrollLeft = left; }
  function renderCamera() { return JBCamera.render(data, ui, key => i18n.t(key), ICSMedia); }
  // JB Camera callbacks: a capture adds a local illustration to the Camera album; the filmstrip opens Gallery.
  function cameraShoot() {
    const photo = {...ICSMedia.scene(data), id: Date.now(), name: `IMG_${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}`, album: 'camera', created: Date.now()};
    data.photos.unshift(photo); save(); return photo;
  }
  function cameraGallery(id) {
    const photo = data.photos.find(item => item.id === id) || ICSMedia.photos(data, 'camera')[0];
    openApp('gallery'); if (photo) { ui.galleryCluster = 'album'; ui.galleryAlbum = 'camera'; ui.selectedPhoto = photo.id; ui.sub = 'photo'; ui.galleryFilm = false; ui.galleryBars = true; ui.galleryFromCamera = true; render(); }
  }
  function galleryStep(direction) {
    const items=galleryItems(); if(!items.length)return;
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
    const snoozed=(data.calendarSnoozes||[]).filter(item=>item.at<=now.getTime());
    if(snoozed.length){data.calendarSnoozes=data.calendarSnoozes.filter(item=>!snoozed.includes(item));snoozed.forEach(item=>data.notifications.unshift({id:Date.now()+data.notifications.length,title:item.title,detail:item.detail,kind:'calendar',eventId:item.eventId,date:item.date}));save();renderStatus();if(ui.overlay==='shade')renderOverlay();}
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
  // 4.2 DeskClock pages; the alarm list and editor keep the ICS AlarmClock/SetAlarm screens.
  const jbClockState = () => { data.jbClock ||= {tab: 'clock', timers: [], stopwatch: {accumulated: 0, started: null, laps: []}}; return {...data.jbClock, timerDigits: ui.timerDigits || '', timerSetup: !!ui.timerSetup}; };
  function renderClock() {
    if (['alarms', 'alarm-edit'].includes(ui.sub)) return ICSDeskClock.render(data,ui,key=>i18n.t(key),i18n.locale(),deviceDate());
    const clockState = {...jbClockState(), alarmPage: KKDeskClock.page(data.alarms, {expandedId: ui.kdcExpanded, t: key => i18n.t(key), locale: i18n.locale(), hour24: !!data.settings.hour24, normalize: ICSDeskClock.normalize})};
    return JBDeskClock.render(clockState, key => i18n.t(key), {locale: i18n.locale(), now: deviceDate(), hour24: !!data.settings.hour24, alarm: nextAlarmLabel(), date: deviceDate().toLocaleDateString(i18n.locale(), {weekday: 'short', month: 'short', day: 'numeric'}).toLocaleUpperCase(i18n.locale())});
  }
  let clockFrame = 0;
  function clockTicker() {
    cancelAnimationFrame(clockFrame);
    const step = () => {
      const root = viewport.querySelector('.jbclock-app');
      if (!root || ui.view !== 'clock') return;
      JBDeskClock.tick(root, data.jbClock, Date.now(), key => i18n.t(key));
      clockFrame = requestAnimationFrame(step);
    };
    clockFrame = requestAnimationFrame(step);
  }
  // TimerReceiver: a finished timer posts "Time's up" and shows its alert in the Timer page.
  function checkTimers() {
    const now = Date.now();
    for (const timer of data.jbClock?.timers || []) {
      if (timer.state !== 'running' || JBDeskClock.remaining(timer, now) > 0) continue;
      Object.assign(timer, {state: 'done', left: 0, started: null});
      data.notifications.unshift({id: now + data.notifications.length, title: i18n.t("Time's up"), detail: i18n.t('Timer'), kind: 'timer'}); save();
      renderStatus(); if (ui.overlay === 'shade') renderOverlay();
      if (ui.view === 'clock') { data.jbClock.tab = 'timer'; render(); }
      toast("Time's up");
    }
  }
  // Label and ringtone edits from a 4.4 alarm card go straight into that alarm.
  function kdcCommit() {
    if (!ui.kdcEditing) return;
    const alarm = data.alarms.find(item => item.id === ui.kdcEditing);
    if (alarm) { alarm.label = ui.alarmDraft.label; alarm.tone = ui.alarmDraft.tone; save(); }
    ui.kdcEditing = null; ui.alarmDraft = null;
  }
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
    if(previous!==ui.music.track || !ui.music.playing){saveMusic();if(ui.view==='music'||ui.view==='play-music'||ui.view==='home'||ui.view==='lock'&&!pointerStart)render();}
    else if(Math.floor(ui.music.position)%10===0)saveMusic();
    const progress=viewport.querySelector('.music-progress');if(progress&&document.activeElement!==progress){progress.value=ui.music.position;progress.style.setProperty('--p',`${(ui.music.position/tracks[ui.music.track].duration*100).toFixed(2)}%`);}
    const elapsed=viewport.querySelector('.music-elapsed');if(elapsed)elapsed.textContent=ICSMusic.time(ui.music.position);
  }
  // Voice Search listens for three seconds, then asks to try again.
  let voiceTimer = null;
  function listenVoice() {
    clearTimeout(voiceTimer); ui.voiceState = 'listening'; if (ui.view === 'voice-search') render();
    voiceTimer = setTimeout(() => { ui.voiceState = 'retry'; if (ui.view === 'voice-search') render(); }, 3000);
  }
  function saveKeepNote() {
    const area = viewport.querySelector('.keep-text'), note = (data.keepNotes || []).find(item => item.id === ui.keepNote);
    if (!area || !note) return;
    note.text = area.value; if (!note.text.trim()) data.keepNotes = data.keepNotes.filter(item => item !== note); save();
  }
  const playContext = app => ({app, ui, data, t: key => i18n.t(key), music: ui.music, tracks, time: ICSMusic.time});
  // The Play Movies player counts seconds without re-rendering (the picture keeps panning).
  function tickPlayVideo() {
    if (ui.view !== 'play-movies' || ui.sub !== 'movie' || ui.paPlaying === false || ui.locked) return;
    ui.paSeconds = (ui.paSeconds || 0) + 1;
    const item = [...PlayApps.MOVIES, ...PlayApps.SHOWS].find(entry => entry.id === ui.paItem); if (!item) return;
    const total = (item.mins || 24) * 60, pos = Math.min(total, Math.floor(total * (item.progress || 0)) + ui.paSeconds);
    const clock = value => `${Math.floor(value / 3600)}:${String(Math.floor(value / 60) % 60).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
    const footer = viewport.querySelector('.pm-video-bottom'); if (!footer) return;
    footer.querySelector('span').textContent = clock(pos); footer.querySelector('i').style.setProperty('--p', `${(pos / total * 100).toFixed(1)}%`);
  }
  setInterval(tickPlayVideo, 1000);
  function renderEmail() {
    return KKEmail.render(data.mailbox,ui,key=>i18n.t(key),i18n.locale(),i18n.language,{teaserDismissed:!!data.emailTeaserDismissed});
  }
  const mailbox = () => ui.view === 'gmail' ? data.gmailbox : data.mailbox;
  const gmailOptions = () => GmailApp.options(data, ui, i18n.language, key => KKEmail.tr(i18n.language, key));
  function renderGmail() { return KKEmail.render(data.gmailbox, ui, key => i18n.t(key), i18n.locale(), i18n.language, gmailOptions()); }
  // Each mail app keeps its own folder, conversation and selection.
  function useMailApp(app) {
    if (ui.mailApp === app) return;
    ui.mailStates ||= {};
    if (ui.mailApp) ui.mailStates[ui.mailApp] = {folder: ui.emailFolder, id: ui.emailId};
    const state = ui.mailStates[app] || {folder: app === 'gmail' ? 'Primary' : 'Inbox', id: null};
    ui.emailFolder = state.folder; ui.emailId = state.id; ui.emailSelected = []; ui.emailQuery = undefined; ui.mailApp = app;
  }
  function composeEmail(source=null,forward=false,to='') {
    const draft=ICSEmail.draft(source,forward);if(to)draft.to=to;
    if(ui.view==='gmail'){draft.from=draft.address=GmailApp.account;}
    mailbox().unshift(draft);ui.emailId=draft.id;ui.emailCc=false;ui.emailError='';ui.overlay='';ui.sub='compose';save();render();
  }
  function resetSimulator() {
    data=clone(defaultData);data.settings={...ICSSettingsDetail.defaults,...ICSSystemSettings.defaults,...data.settings};
    data.mailbox=ICSEmail.restore(null,emailData,[]);data.gmailbox=GmailApp.restore(null);ui.mailApp='';ui.mailStates={};ui.music=ICSMusic.restore();ui.musicActive=false;ui.photoStacks={};ui.photoWidgetSetup=null;ui.musicTrack=0;ui.musicPlaying=false;ui.musicPosition=0;
    ui.activeCall=null;ui.sleeping=false;ui.locked=false;ui.vpnConnected=null;ui.calendarMode='Month';ui.emailFolder='Inbox';ui.emailQuery=undefined;ui.emailSelected=[];ui.recent=[];ui.recentState={};ui.recentSnapshots={};
    ICSLauncherFolders.initialize(data,apps.map(app=>app[0]));
    ui.browserSession=ICSBrowserSession.restore(null,data.browserHistory);ui.browserOwner='browser';ui.browserSessions={};syncBrowserState();ui.peopleDraft=null;ui.peopleQuery='';ui.peopleTab='all';save();home();
  }
  function clearAppData(id) {
    if(id==='chrome'){delete data.chromeSession;delete ui.browserSessions.chrome;if(ui.browserOwner==='chrome'){ui.browserSession=restoreChrome();syncBrowserState();}save();}
    if(id==='browser'){delete data.browserSession;data.browserHistory=clone(defaultData.browserHistory);data.bookmarks=clone(defaultData.bookmarks||[]);data.savedPages=[];ui.browserSession=ICSBrowserSession.restore(null,data.browserHistory);syncBrowserState();}
    if(id==='music'){ui.music=ICSMusic.restore();saveMusic();}
    if(id==='gmail'){data.gmailbox=GmailApp.restore(null);delete data.gmailWelcomeSeen;delete data.gmailTeaserDismissed;if(ui.mailApp==='gmail'){ui.emailFolder='Primary';ui.emailSelected=[];}}
    if(id==='email'){data.mailbox=ICSEmail.restore(null,emailData,[]);data.sentEmails=[];ui.emailFolder='Inbox';ui.emailQuery=undefined;ui.emailSelected=[];}
    if(id==='clock')data.alarms=clone(defaultData.alarms);
    if(id==='calendar')data.events=clone(defaultData.events);
    if(id==='people'){data.contacts=clone(defaultData.contacts);data.contactGroups=clone(defaultData.contactGroups);ui.peopleDraft=null;}
    if(id==='messaging'||id==='hangouts'){data.messages=clone(defaultData.messages);data.messageDrafts={};}
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
  // NotificationPanelView wraps its content (header, list, carrier label and handle); the rest is scrim.
  function shadeFullHeight(shade) {
    const previous = shade.style.height; shade.style.height = '';
    const full = Math.min(shade.offsetHeight, screen.clientHeight - statusBarHeight());
    shade.style.height = previous; return full;
  }
  function decorateNotification(note) {
    if (note.id === 2) return {...note, icon: 'mms-ic_contact_picture.png', smallIcon: 'stat_notify_hangouts.png', big: 'Hey! Are we still on for coffee tomorrow?\nSee you at 11!'};
    if (note.kind === 'calendar') return {...note, icon: 'calendar.png', smallIcon: 'calendar-stat_notify_calendar.png', big: note.detail, actions: [{id: 'snooze', label: 'Snooze', icon: 'calendar-ic_alarm_holo_dark.png'}]};
    return {...note, icon: 'settings.png', smallIcon: 'stat_notify_more.png'};
  }
  // Settings.System.NEXT_ALARM_FORMATTED, shown by the temporary alarm tile.
  function nextAlarmLabel() {
    const next = data.alarms.filter(alarm => alarm.enabled).map(alarm => ICSDeskClock.nextOccurrence(alarm, deviceDate())).filter(Boolean).sort((a, b) => a - b)[0];
    return next ? next.toLocaleString(i18n.locale(), {weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: !data.settings.hour24}) : '';
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
    if (!button || !screen.contains(button)) return;
    event.preventDefault();
    if (Date.now() < suppressClickUntil) return;
    const { action, id, app, url } = button.dataset;
    if (ui.view === 'gallery' && ui.galleryPopup && action !== 'gallery-menu') ui.galleryPopup = '';
    // A tap outside the Recents popup menu only dismisses it.
    if (ui.overlay === 'recent' && ui.recentPopup && !['remove-recent', 'recent-app-info'].includes(action)) { ui.recentPopup = null; renderOverlay(); return; }
    if(ui.locked){
      // KeyguardHostView: launching from a widget or adding one needs the bouncer first.
      const pending={'kg-add-widget':{type:'add'},'widget-calendar-open':{type:'calendar'},'widget-calendar-event':{type:'calendar',id,date:button.dataset.date}}[action];
      if(pending&&ui.view==='lock'){requestBouncer(pending);return;}
      if(!['back','alarm-dismiss','alarm-snooze','lock-media'].includes(action))return;
    }
    switch (action) {
      case 'open-app': if (GEL_UNSIMULATED.includes(app)) { toast(i18n.t('This app is not part of the simulator.')); break; } {
        const icon = button.closest('.launcher-icon, .drawer-app, .dock-app') || button;
        // Launcher icons start apps with makeScaleUpAnimation; Recents uses makeThumbnailScaleUpAnimation from the thumbnail.
        const source = button.closest('.recent-item') ? button.closest('.recent-item').querySelector('.recent-thumbnail') : ['home', 'drawer'].includes(ui.view) ? icon : null;
        if (source) { const box = source.getBoundingClientRect(), frame = viewport.getBoundingClientRect(), k = frame.width / viewport.offsetWidth || 1; launchFrom = {left: (box.left - frame.left) / k, top: (box.top - frame.top) / k, width: box.width / k, height: box.height / k, recents: !!button.closest('.recent-item')}; }
        openApp(app || id, !!button.closest('.recent-item')); break;
      }
      case 'home': if (ui.view !== 'lock') home(); break;
      case 'back': back(); break;
      case 'ga-power': ui.overlay = 'power-confirm'; ui.powerKind = 'shutdown'; renderOverlay(); break;
      case 'ga-bugreport': ui.overlay = 'power-confirm'; ui.powerKind = 'bugreport'; renderOverlay(); break;
      case 'ga-airplane': ui.overlay = ''; data.settings.airplane = !data.settings.airplane; if (data.settings.airplane) { data.settings.wifi = false; data.settings.bluetooth = false; } save(); render(); break;
      case 'ga-ringer': GlobalActions.setRinger(data.settings, id); save(); renderStatus(); renderOverlay(); setTimeout(() => { if (ui.overlay === 'power-menu') { ui.overlay = ''; render(); } }, GlobalActions.DISMISS_DELAY); break;
      case 'ga-confirm': powerConfirm(id); break;
      case 'drawer': ui.view = 'drawer'; ui.sub = ''; ui.overlay = ''; ui.overview = false; ui.drawerWidgets = false; if (ui.drawerPage >= drawerAppPages()) ui.drawerPage = 0; render(); break;
      case 'cling-dismiss': if (data.clings) { data.clings[id] = true; save(); } LauncherClings.dismiss(clingLayerRoot().querySelector(`[data-cling="${id}"]`), () => syncClings()); break;
      case 'folder-open': ui.folderId=button.dataset.folderId;ui.overlay='folder';renderOverlay();break;
      case 'drawer-tab': ui.drawerTab = id; ui.drawerPage = id === 'widgets' ? drawerAppPages() : 0; render(); break;
      // Overview mode: Widgets opens all apps on the first widget page; a tap on a page returns to it.
      case 'kk-overview-widgets': ui.overview = false; ui.view = 'drawer'; ui.drawerWidgets = true; ui.drawerPage = drawerAppPages(); render(); break;
      // The Google Now Launcher's third overview button opens the Google Search settings (not simulated).
      case 'gel-overview-settings': openApp('google-search'); ui.sub = 'settings'; render(); break;
      case 'kk-overview-page': if (ui.overview) { ui.overview = false; ui.page = Number(id); render(); } break;
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
      case 'open-wallpapers': ui.overlay = ''; ui.overview = false; ui.wp = {selected: '', temp: [], checked: [], stripHidden: false}; ui.view = 'wallpaper-picker'; render(); break;
      // Launcher3 WallpaperPickerActivity: tiles preview, the action bar sets, a long press on a picked or saved image
      // starts the delete CAB, Pick image goes through DocumentsUI.
      case 'kwp-tile': {
        const wp = ui.wp ||= {selected: '', temp: [], checked: []};
        if (wp.checked?.length) { if (button.dataset.kwpLong) { wp.checked = wp.checked.includes(id) ? wp.checked.filter(k => k !== id) : [...wp.checked, id]; wallpaperPickerRender(); } break; }
        if (id.startsWith('live:')) { ui.lwFromPicker = true; ui.view = 'live-wallpapers'; ui.sub = `preview:${id.slice(5)}`; render(); break; }
        wp.selected = id; wp.stripHidden = false; wallpaperPickerRender(); break;
      }
      case 'kwp-tap': if (ui.wp) { ui.wp.stripHidden = !ui.wp.stripHidden; viewport.querySelector('.kwp-strip')?.classList.toggle('hidden', ui.wp.stripHidden); } break;
      case 'kwp-pick': ui.view = 'kk-doc-picker'; render(); break;
      case 'kwp-picked': { const wp = ui.wp ||= {selected: '', temp: [], checked: []}, pid = Number(id); wp.temp = [pid, ...(wp.temp || []).filter(x => x !== pid)]; wp.selected = `photo:${pid}`; ui.view = 'wallpaper-picker'; render(); break; }
      case 'kwp-cab-done': if (ui.wp) { ui.wp.checked = []; wallpaperPickerRender(); } break;
      case 'kwp-delete': { const wp = ui.wp, gone = new Set((wp?.checked || []).map(k => Number(k.slice(6)))); if (!wp) break; data.kkSavedWallpapers = (data.kkSavedWallpapers || []).filter(x => !gone.has(x)); wp.temp = (wp.temp || []).filter(x => !gone.has(x)); if (wp.checked.includes(wp.selected)) wp.selected = ''; wp.checked = []; save(); wallpaperPickerRender(); break; }
      case 'kwp-set': {
        const key = ui.wp?.selected || '';
        if (key === 'default') { data.wallpaper = 0; delete data.liveWallpaper; delete data.customWallpaper; delete data.customWallpaperPhoto; save(); }
        else if (key.startsWith('photo:')) { const photo = data.photos.find(p => p.id === Number(key.slice(6))); if (photo) { data.kkSavedWallpapers = [photo.id, ...(data.kkSavedWallpapers || []).filter(x => x !== photo.id)]; galleryWallpaper(photo, true); } }
        ui.wp = null; home(false); break;
      }
      case 'open-live-wallpapers': ui.overlay = ''; ui.view = 'live-wallpapers'; ui.sub = ''; render(); break;
      case 'lw-preview': ui.sub = `preview:${id}`; render(); break;
      case 'lw-settings': ui.sub = `settings:${id}`; render(); break;
      // LiveWallpaperPreview.setLiveWallpaper: set it and return to the launcher.
      case 'lw-set': data.liveWallpaper = {id}; save(); ui.sub = ''; ui.lwFromPicker = false; home(false); break;
      case 'lw-toggle': { const [wid, key] = String(id).split(':'); data.lwPrefs ||= {}; data.lwPrefs[wid] ||= {}; data.lwPrefs[wid][key] = data.lwPrefs[wid][key] === false; save(); render(); break; }
      case 'lw-palette': ui.overlay = 'lw-palette'; renderOverlay(); break;
      case 'lw-palette-pick': data.lwPrefs ||= {}; data.lwPrefs.polar ||= {}; data.lwPrefs.polar.palette = id; save(); ui.overlay = ''; render(); break;
      case 'gallery-wallpaper': ui.overlay = ''; openApp('gallery'); break;
      case 'market': openApp('play-store'); break;
      case 'play-menu': case 'jbp-menu': ui.overlay = 'play-menu'; renderOverlay(); break;
      case 'jbp-section': jbPlayGo({page: 'section', section: id, tab: button.dataset.tab || 'HOME'}); break;
      case 'jbp-tab': if (id) { ui.market.tab = id; render(); viewport.querySelector('.jbp-tabs button.on')?.scrollIntoView({inline: 'center', block: 'nearest'}); } break;
      case 'jbp-detail': jbPlayGo({page: 'detail', selected: id}); break;
      case 'jbp-card-menu': { const rect = button.getBoundingClientRect(), box = screen.getBoundingClientRect(); ui.marketTarget = id; ui.marketPopTop = Math.round((rect.bottom - box.top) / (box.height / screen.offsetHeight)) - 26; ui.overlay = 'jbp-card'; renderOverlay(); break; }
      case 'jbp-wish': { const list = data.marketWishlist || []; data.marketWishlist = list.includes(id) ? list.filter(x => x !== id) : [...list, id]; save(); ui.overlay = ''; renderOverlay(); jbPlayKeepScroll(); break; }
      case 'jbp-buy': { const item = JBPlay.find(id); ui.overlay = ''; renderOverlay(); if (item && item.price !== 'FREE') { toast(JBPlay.text(i18n.language, 'Unavailable')); break; } ui.marketTarget = id; ui.marketPermOpen = ''; ui.marketPermView = false; ui.overlay = 'jbp-perms'; renderOverlay(); break; }
      case 'jbp-accept': ui.overlay = ''; renderOverlay(); jbPlayDownload(id); break;
      case 'jbp-cancel': clearInterval(ui.marketTimer); ui.marketDownload = null; data.notifications = data.notifications.filter(n => n.kind !== 'market-dl'); save(); renderStatus(); render(); break;
      case 'jbp-open': { const item = JBPlay.find(id); if (item?.app) openApp(item.app); else toast(JBPlay.text(i18n.language, 'Unavailable')); break; }
      case 'jbp-uninstall': data.marketInstalled = (data.marketInstalled || []).filter(x => x !== id); save(); render(); break;
      case 'jbp-plus': { const list = data.marketPlus || []; data.marketPlus = list.includes(id) ? list.filter(x => x !== id) : [...list, id]; save(); jbPlayKeepScroll(); break; }
      case 'jbp-rate': data.marketRated = {...(data.marketRated || {}), [ui.market.selected]: Number(id)}; save(); jbPlayKeepScroll(); toast(JBPlay.text(i18n.language, 'Thanks rating')); break;
      case 'jbp-my-apps': jbPlayGo({page: 'my-apps', tab: 'INSTALLED'}); break;
      case 'jbp-wishlist': jbPlayGo({page: 'wishlist'}); break;
      case 'jbp-settings': jbPlayGo({page: 'settings'}); break;
      case 'jbp-unavailable': ui.overlay = ''; renderOverlay(); toast(JBPlay.text(i18n.language, 'Unavailable')); break;
      case 'jbp-pref': { const base = jbPlayContext().prefs; data.marketPrefs = {...base, [id]: !base[id]}; save(); jbPlayKeepScroll(); break; }
      case 'jbp-auto-update': ui.overlay = 'jbp-auto'; renderOverlay(); break;
      case 'jbp-auto-pick': data.marketPrefs = {...jbPlayContext().prefs, autoMode: id}; save(); ui.overlay = ''; renderOverlay(); jbPlayKeepScroll(); break;
      case 'jbp-clear-history': data.marketSearches = []; save(); toast(JBPlay.text(i18n.language, 'Clear search history')); break;
      // Play Store 4.8: the navigation drawer, the permissions note on the home page, the grouped permission rows and
      // "Permission details", and the Require password list.
      case 'kkp-drawer': ui.overlay = 'jbp-drawer'; renderOverlay(); break;
      case 'kkp-home': ui.marketHistory = []; ui.market = {page: 'home'}; ui.overlay = ''; ui.marketSearching = false; render(); break;
      case 'kkp-note': data.marketPermNote = true; save(); jbPlayKeepScroll(); toast(JBPlay.text(i18n.language, 'Unavailable')); break;
      case 'kkp-perm': ui.marketPermOpen = ui.marketPermOpen === id ? '' : id; renderOverlay(); break;
      case 'kkp-perm-details': ui.marketTarget = id; ui.marketPermOpen = ''; ui.marketPermView = true; ui.overlay = 'jbp-perms'; renderOverlay(); break;
      case 'kkp-password': ui.overlay = 'jbp-password'; renderOverlay(); break;
      case 'kkp-password-pick': data.marketPrefs = {...jbPlayContext().prefs, password: id}; save(); ui.overlay = ''; renderOverlay(); jbPlayKeepScroll(); break;
      case 'jbp-search': ui.marketSearching = true; ui.marketEdit = ''; render(); viewport.querySelector('.jbp-bar input')?.focus(); break;
      case 'jbp-search-run': data.marketSearches = [id, ...(data.marketSearches || []).filter(q => q !== id)].slice(0, 10); save(); jbPlayGo({page: 'search', query: id}); break;
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
      case 'lock-media': if (id === 'play') { ui.music.playing = !ui.music.playing; if (ui.music.playing && ui.music.position >= tracks[ui.music.track].duration) ui.music.position = 0; } else ICSMusic.step(ui.music, id === 'previous' ? -1 : 1); ui.musicTrack = ui.music.track; saveMusic(); render(); break;
      case 'lock-hint': screen.classList.add('lock-dragging'); setTimeout(() => { if (!pointerStart?.lockDrag) lockRelease(null); }, 1000); break;
      case 'shade': ui.overlay = ui.overlay === 'shade' ? '' : 'shade'; renderOverlay(); break;
      case 'recent': {
        if (ui.view === 'lock') break;
        if (ui.overlay === 'recent') { closeRecents(); break; }
        captureRecentView(); ui.recentPopup = null;
        const fromApp = !!appNames[ui.view], outgoing = viewport.firstElementChild?.cloneNode(true);
        ui.overlay = 'recent'; renderOverlay();
        // The outgoing window animates in a layer above Recents (makeThumbnailScaleDownAnimation is ZORDER_TOP).
        const layer = document.createElement('div'); layer.className = 'jb-recents-layer';
        Object.assign(layer.style, {top: `${viewport.offsetTop}px`, left: `${viewport.offsetLeft}px`, width: `${viewport.offsetWidth}px`, height: `${viewport.offsetHeight}px`});
        screen.append(layer); setTimeout(() => layer.remove(), JBRecents.R.window + 80);
        JBRecents.open(overlayRoot.querySelector('.recent-panel'), outgoing, {fromApp, reduced: !!reducedMotion?.matches, layer});
        break;
      }
      case 'recent-app-info': ui.overlay = ''; ui.recentPopup = null; openApp('settings'); ui.settingsApp = id; ui.sub = 'app-info'; render(); break;
      case 'close-overlay': if (ui.overlay === 'recent') { closeRecents(); break; } ui.overlay = ''; renderOverlay(); break;
      case 'remove-recent': event.stopPropagation(); ui.recentPopup = null; ui.recent = ui.recent.filter(item => item !== id); renderOverlay(); break;
      case 'clear-notifications': {
        const rows = [...overlayRoot.querySelectorAll('.jb-note')], delays = JBShade.clearDelays(rows.length);
        if (reducedMotion?.matches || !rows.length) { data.notifications = []; ui.overlay = ''; save(); renderStatus(); renderOverlay(); break; }
        overlayRoot.querySelector('.jb-shade-clear')?.setAttribute('hidden', '');
        rows.forEach((row, index) => row.animate([{transform: 'translateX(0)', opacity: 1}, {transform: `translateX(${row.offsetWidth}px)`, opacity: 0}], {duration: 125, delay: delays[index], easing: 'linear', fill: 'forwards'}));
        setTimeout(() => { data.notifications = []; save(); renderStatus(); if (ui.overlay === 'shade') { ui.overlay = ''; renderOverlay(); } }, (delays.at(-1) || 0) + 125 + 225);
        break;
      }
      case 'shade-flip': ui.shadeSettings = !ui.shadeSettings; JBShade.flip(overlayRoot.querySelector('.jb-shade'), ui.shadeSettings, reducedMotion?.matches); { const button = overlayRoot.querySelector('.jb-shade-flip'); button?.setAttribute('aria-label', i18n.t(ui.shadeSettings ? 'Notifications.' : 'Quick settings.')); overlayRoot.querySelector('.jb-shade-clear')?.toggleAttribute('hidden', ui.shadeSettings || !data.notifications.length); } break;
      case 'dream-pick': data.settings.daydreamType = id; save(); render(); break;
      case 'dream-when': ui.overlay = 'dream-when'; renderOverlay(); break;
      case 'dream-when-pick': data.settings.daydreamWhen = id; save(); ui.overlay = ''; render(); break;
      case 'dream-start': ui.overlay = 'dream'; ui.dreamKey = ''; renderOverlay(); break;
      case 'dream-exit': ui.overlay = ''; renderOverlay(); break;
      case 'kg-add-widget': ui.overlay = 'kg-widget-picker'; renderOverlay(); break;
      case 'kg-pick-widget': { const widgets = data.keyguardWidgets ||= []; if (widgets.length < JBKeyguard.MAX_WIDGETS) { widgets.push({id: `kg-${Date.now()}`, type: id}); save(); ui.kgPage = widgets.length; } ui.overlay = ''; if (ui.kgRelock) { ui.kgRelock = false; const page = ui.kgPage; lockScreen(); ui.kgPage = page; render(); } else render(); break; }
      case 'qs-user': ui.overlay = ''; openApp('people'); break;
      case 'qs-brightness': ui.overlay = 'qs-brightness'; renderOverlay(); break;
      case 'qs-settings': ui.overlay = ''; openApp('settings'); break;
      case 'qs-wifi': ui.overlay = ''; openApp('settings'); ui.sub = 'wifi'; render(); break;
      case 'qs-rssi': ui.overlay = ''; openApp('settings'); ui.sub = 'data'; render(); break;
      case 'qs-battery': ui.overlay = ''; openApp('settings'); ui.sub = 'battery'; render(); break;
      case 'qs-airplane': data.settings.airplane = !data.settings.airplane; if (data.settings.airplane) { data.settings.wifi = false; data.settings.bluetooth = false; } save(); renderStatus(); renderOverlay(); break;
      case 'qs-bluetooth': ui.overlay = ''; openApp('settings'); ui.sub = 'bluetooth'; render(); break;
      case 'qs-alarm': ui.overlay = ''; openApp('clock'); break;
      case 'qs-location': ui.overlay = ''; openApp('settings'); ui.sub = 'location'; render(); break;
      case 'notification-action': { const note = data.notifications.find(item => String(item.id) === id); if (note?.kind === 'calendar' && button.dataset.noteAction === 'snooze') { data.notifications = data.notifications.filter(item => item !== note); (data.calendarSnoozes ||= []).push({eventId: note.eventId, date: note.date, title: note.title, detail: note.detail, at: deviceDate().getTime() + 5 * 60000}); save(); renderStatus(); if (!data.notifications.length) ui.overlay = ''; renderOverlay(); toast('Snoozed'); } break; }
      case 'notification-open': { const note = data.notifications.find(item => String(item.id) === id); if (note?.kind === 'calendar') { data.notifications = data.notifications.filter(item => item !== note); save(); ui.overlay = ''; openApp('calendar'); ui.selectedEvent = note.eventId; ui.selectedInstance = note.date; ui.selectedDate = note.date; ui.sub = 'event'; render(); break; } }
        ui.overlay = ''; if (Number(id) === 2) openMessageThread(1); else { ui.view = 'settings'; ui.sub = 'about'; render(); } break;
      case 'unlock': ui.view = 'home'; render(); break;
      case 'unlock-camera': openApp('camera'); break;
      case 'kk-location-mode': data.settings.gps = id !== 'battery'; data.settings.networkLocation = id !== 'device'; save(); render(); break;
      case 'kk-sms-app': ui.overlay = 'kk-sms-app'; renderOverlay(); break;
      case 'kk-cast-menu': ui.overlay = 'kk-cast-menu'; renderOverlay(); break;
      case 'kk-cast-enable': data.settings.wifiDisplay = !data.settings.wifiDisplay; save(); ui.overlay = ''; render(); break;
      case 'kdu-menu': ui.overlay = `kdu-${id}`; renderOverlay(); break;
      case 'kdu-sort': ui.dlSort = id; ui.overlay = ''; render(); break;
      case 'kdu-view': ui.dlGrid = id === 'grid'; ui.overlay = ''; render(); break;
      case 'kdu-search': toast('No items'); break;
      case 'settings-sub': ui.overlay = ''; if (id === 'development' && !data.settings.developerUnlocked) break; if (ui.view === 'settings' && !ui.sub) ui.settingsRootScroll = viewport.querySelector('.settings-app')?.scrollTop || 0; ui.sub = id; render(); break;
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
      case 'wifi-wps': ui.wps = {mode: id === 'pin' ? 'pin' : 'pbc', start: Date.now(), pin: String(Math.floor(10000000 + Math.random() * 89999999))}; ui.overlay = 'wifi-wps'; renderOverlay(); break;
      case 'p2p-search': startP2pSearch(); render(); break;
      case 'p2p-menu': ui.overlay = 'p2p-menu'; renderOverlay(); break;
      case 'p2p-rename': ui.overlay = 'p2p-rename'; renderOverlay(); break;
      case 'wfd-scan': startWfdScan(); render(); break;
      case 'qs-wifi-display': ui.overlay = ''; ui.view = 'settings'; ui.sub = 'wifi-display'; render(); break;
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
      case 'dev-info': toast(i18n.t('Not available in the simulator')); break;
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
      case 'factory-reset': if (confirm(i18n.t('Reset all local KitKat simulator data?'))) resetSimulator(); break;
      case 'about-tap':
        ui.aboutTapTimes = [...(ui.aboutTapTimes || []), performance.now()].slice(-3);
        if (ui.aboutTapTimes.length === 3 && ui.aboutTapTimes[2] - ui.aboutTapTimes[0] <= 500) { ui.sub = 'easter'; ui.easterNyan = false; ui.aboutTapTimes = []; render(); }
        break;
      case 'developer-tap': {
        if (data.settings.developerUnlocked) { toast('No need, you are already a developer.'); break; }
        const remaining = 7 - ++ui.buildTaps;
        if (remaining <= 0) { data.settings.developerUnlocked = true; ui.buildTaps = 0; save(); toast('You are now a developer!'); }
        else if (remaining < 5) toast(i18n.t(remaining === 1 ? 'You are now %d step away from being a developer.' : 'You are now %d steps away from being a developer.').replace('%d', remaining));
        break;
      }
      case 'jb-platlogo': ui.jbLogoTapped = true; render(); platLogoToast(); break;
      case 'toast': toast(id); break;
      case 'noop': break;
      case 'browser-search': openApp('chrome'); document.querySelector('.chr-omnibox input')?.focus(); break;
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
      case 'browser-close-tab': { const last = ui.browserSession.tabs.length === 1; ICSBrowserSession.close(ui.browserSession,Number(id)); if (last && ui.browserOwner === 'chrome') ui.browserSession.tabs[0].history = [ChromeApp.NTP]; saveBrowserState(); render(); break; }
      case 'browser-refresh': ui.overlay=''; render(); break;
      case 'browser-find': ui.browserFind=''; ui.overlay=''; render(); viewport.querySelector('.web-find input')?.focus(); break;
      case 'browser-close-find': ui.browserFind=undefined; render(); break;
      case 'browser-history': ui.sub = 'history'; render(); break;
      // Chrome menu and New Tab page
      case 'chrome-incognito': chromeNewTab(true); break;
      // Google, Voice Search, Maps, Drive, Keep, YouTube, Google+, Earth, News & Weather, Google Settings
      case 'sa-unsupported': toast(i18n.t('This feature is not part of the simulator.')); break;
      case 'voice-listen': listenVoice(); break;
      case 'google-now-toggle': data.googleNowOn = data.googleNowOn === false; save(); render(); break;
      case 'maps-locate': ui.mapsQuery = ''; render(); break;
      case 'drive-open': ui.driveFile = id; ui.sub = 'file'; render(); break;
      case 'keep-open': ui.keepNote = id; ui.sub = 'note'; render(); viewport.querySelector('.keep-text')?.focus(); break;
      case 'keep-delete': data.keepNotes = (data.keepNotes || []).filter(note => note.id !== ui.keepNote); ui.sub = ''; save(); render(); break;
      case 'yt-video': ui.ytVideo = id; ui.ytPaused = false; ui.sub = 'video'; render(); break;
      case 'yt-toggle': ui.ytPaused = !ui.ytPaused; render(); break;
      case 'yt-like': { const likes = data.ytLikes || []; data.ytLikes = likes.includes(id) ? likes.filter(x => x !== id) : [...likes, id]; save(); render(); break; }
      case 'gplus-plus': { const plus = data.gplusPlus || []; data.gplusPlus = plus.includes(id) ? plus.filter(x => x !== id) : [...plus, id]; save(); render(); break; }
      case 'news-tab': ui.newsTab = id; render(); break;
      // Play Music, Movies & TV, Books and Games
      case 'pa-drawer': ui.overlay = 'pa-drawer'; renderOverlay(); break;
      case 'pa-page': ui.paPage ||= {}; ui.paPage[ui.view] = id; ui.sub = ''; ui.overlay = ''; renderOverlay(); render(); break;
      case 'pa-unsupported': case 'pa-game-play': ui.overlay = ''; renderOverlay(); toast(i18n.t('This feature is not part of the simulator.')); break;
      case 'pa-album': ui.paAlbum = id; ui.sub = 'album'; render(); break;
      case 'pa-song': {
        const track = Number(id), queue = button.dataset.queue;
        if (queue === 'all') ui.music.queue = tracks.map((_, i) => i);
        else if (queue && queue !== 'keep') ui.music.queue = tracks.map((item, i) => item.album === queue ? i : -1).filter(i => i >= 0);
        if (!ui.music.queue.includes(track)) ui.music.queue = [...ui.music.queue, track];
        ui.music.track = track; ui.music.position = 0; ui.music.playing = true; saveMusic();
        if (ui.sub !== 'player' && ui.sub !== 'queue') ui.paReturn = ui.sub;
        ui.sub = 'player'; render(); break;
      }
      case 'pa-player': ui.paReturn = ui.sub; ui.sub = 'player'; render(); break;
      case 'pa-queue': ui.sub = ui.sub === 'queue' ? 'player' : 'queue'; render(); break;
      case 'pa-thumb': { data.playMusicThumbs ||= {}; const value = Number(id); if (data.playMusicThumbs[ui.music.track] === value) delete data.playMusicThumbs[ui.music.track]; else data.playMusicThumbs[ui.music.track] = value; save(); render(); break; }
      case 'pa-libtab': ui.paMusicTab = id; render(); break;
      case 'pa-libtab-songs': ui.paPage ||= {}; ui.paPage['play-music'] = 'library'; ui.paMusicTab = 'songs'; render(); break;
      case 'pa-movie': ui.paItem = id; ui.sub = 'movie'; ui.paPlaying = true; ui.paSeconds = 0; ui.paBars = true; render(); break;
      case 'pa-video-bars': ui.paBars = ui.paBars === false; viewport.querySelector('.pm-video')?.classList.toggle('bare', ui.paBars === false); break;
      case 'pa-video-toggle': ui.paPlaying = ui.paPlaying === false; render(); break;
      case 'pa-shop': openApp('play-store'); break;
      case 'pa-book': ui.paItem = id; ui.sub = 'reader'; ui.paBars = true; render(); break;
      case 'pa-reader-tap': {
        const box = button.getBoundingClientRect(), x = (event.clientX - box.left) / box.width;
        if (x > .3 && x < .7) { ui.paBars = ui.paBars === false; viewport.querySelector('.pb-reader')?.classList.toggle('bare', ui.paBars === false); break; }
        data.playBooks ||= {}; const pages = PlayApps.bookPages(ui.paItem), now = data.playBooks[ui.paItem] || 0;
        data.playBooks[ui.paItem] = Math.max(0, Math.min(pages - 1, now + (x >= .7 ? 1 : -1))); save(); render(); break;
      }
      case 'pa-see-all': ui.paPage ||= {}; ui.paPage['play-books'] = 'library'; render(); break;
      case 'pa-game': ui.paItem = id; ui.sub = 'game'; render(); break;
      case 'pa-gtab': ui.paGamesTab = id; render(); break;
      case 'pa-games-mine': case 'pa-games-players': ui.paPage ||= {}; ui.paPage['play-games'] = action === 'pa-games-mine' ? 'mine' : 'players'; render(); break;
      // Google+ Photos
      case 'photos-tab': ui.photosTab = id; render(); break;
      case 'photos-folders': ui.sub = 'folders'; render(); break;
      case 'photos-folder': ui.sub = 'folder'; ui.photosFolder = id; render(); break;
      case 'photos-open': { ui.photosList = button.dataset.list === 'folder' ? 'folder' : 'all'; ui.photosReturn = ui.sub; const list = PhotosApp.list(photosContext()); ui.photosIndex = Math.max(0, list.findIndex(photo => String(photo.id) === id)); ui.selectedPhoto = list[ui.photosIndex]?.id; ui.sub = 'photo'; ui.photosChrome = true; render(); break; }
      case 'photos-toggle-bars': ui.photosChrome = ui.photosChrome === false; viewport.querySelector('.ph-viewer-view')?.classList.toggle('ph-bare', ui.photosChrome === false); break;
      case 'photos-menu': ui.overlay = 'photos-menu'; renderOverlay(); break;
      case 'photos-share-day': photosShare(data.photos.find(photo => String(photo.id) === id)); break;
      case 'photos-wallpaper': { const photo = photosCurrent(); ui.overlay = ''; renderOverlay(); if (photo) galleryWallpaper(photo); break; }
      case 'photos-details': { const photo = photosCurrent(); ui.overlay = ''; renderOverlay(); if (photo) toast(`${photo.name}${photo.created ? ' · ' + new Date(photo.created).toLocaleString(i18n.locale()) : ''}`); break; }
      case 'photos-delete': ui.overlay = 'photos-delete'; renderOverlay(); break;
      case 'photos-confirm-delete': { const photo = photosCurrent(); ui.overlay = ''; renderOverlay(); if (!photo) break; data.photos = data.photos.filter(item => item.id !== photo.id); save(); const list = PhotosApp.list(photosContext()); if (!list.length) ui.sub = ui.photosReturn || ''; else ui.photosIndex = Math.min(ui.photosIndex, list.length - 1); render(); break; }
      case 'photos-edit': case 'photos-drawer': case 'photos-unsupported': ui.overlay = ''; renderOverlay(); toast(i18n.t('This feature is not part of the simulator.')); break;
      case 'chrome-close-all': ui.browserSession = {tabs: [{history: [ChromeApp.NTP], index: 0}], active: 0}; ui.sub = ''; ui.overlay = ''; renderOverlay(); saveBrowserState(); render(); break;
      case 'chrome-ntp': chromeSection(id); break;
      case 'chrome-bookmarks': chromeSection('bookmarks'); break;
      case 'chrome-devices': chromeSection('devices'); break;
      case 'chrome-history': ui.chromeHistoryQuery = ''; navigateBrowser(ChromeApp.HISTORY); break;
      case 'chrome-share': { const link = ui.browserUrl; ui.overlay = ''; renderOverlay(); if (ChromeApp.internal(link)) break; openApp('hangouts'); ui.sub = 'new'; messageDraft().body = link.startsWith('search:') ? link.slice(7) : `http://${link}`; save(); render(); break; }
      case 'chrome-desktop': ui.chromeDesktop = !ui.chromeDesktop; ui.overlay = ''; renderOverlay(); render(); break;
      case 'chrome-unsupported': ui.overlay = ''; renderOverlay(); toast(i18n.t('This feature is not part of the simulator.')); break;
      case 'browser-back-menu': ui.overlay = ''; renderOverlay(); browserBack(); break;
      case 'browser-tab': ui.browserSession.active = Number(id); ui.sub = ''; ui.browserFind = undefined; saveBrowserState(); render(); break;
      case 'browser-new-tab': if (ui.view === 'chrome') { chromeNewTab(false); break; } if (!ICSBrowserSession.add(ui.browserSession)) { toast('Tab limit reached'); break; } ui.sub = ''; ui.overlay = ''; ui.browserFind = undefined; saveBrowserState(); render(); break;
      case 'browser-save': ui.overlay = ''; renderOverlay(); if (!data.bookmarks.includes(ui.browserUrl)) { data.bookmarks.push(ui.browserUrl); save(); toast('Bookmark saved'); } else toast('Already bookmarked'); break;
      case 'phone-tab': ui.phoneTab = id; ui.phoneSearch = undefined; render(); break;
      case 'phone-search': ui.phoneTab = 'favorites'; ui.phoneSearch = ''; ui.overlay = ''; render(); viewport.querySelector('.phone-search input')?.focus(); break;
      case 'phone-menu': ui.overlay = 'phone-menu'; renderOverlay(); break;
      case 'phone-add-contact': openApp('people'); editPerson(true); ui.peopleDraft.phone=ui.dial; render(); break;
      case 'phone-redial': startPhoneCall(id); break;
      case 'dial': if (ui.dial.length < 30) ui.dial += id; render(); break;
      case 'dial-delete': ui.dial = ui.dial.slice(0, -1); render(); break;
      case 'smartdial-call': if (id) { ui.dial = id; startPhoneCall(id); } break;
      case 'call': if(!ui.dial){toast('Enter a phone number');break;}startPhoneCall(ui.dial);break;
      case 'hangup': if(ui.activeCall)data.callHistory=[...(data.callHistory||[]),ICSPhoneCall.finish(ui.activeCall)].slice(-50);ui.activeCall=null;save();ui.sub='';ui.dial='';render();toast('Call ended');break;
      case 'incall-toggle': if(ui.activeCall)ui.activeCall[id]=!ui.activeCall[id];render();break;
      case 'incall-digit': if(ui.activeCall)ui.activeCall.digits=(ui.activeCall.digits+id).slice(-24);render();break;
      case 'phone-log-detail': ui.kkLogFrom=ui.sub==='kk-history'?'kk-history':'';ui.phoneCallId=Number(id);ui.sub='call-detail';render();break;
      case 'phone-log-back': ui.sub=ui.kkLogFrom||'';ui.phoneTab='history';render();break;
      case 'kk-dialer-all': ui.sub = 'kk-all'; ui.overlay = ''; render(); break;
      case 'kk-dialer-history': ui.sub = 'kk-history'; ui.kkDialpad = false; ui.overlay = ''; render(); break;
      case 'kk-dialer-back': ui.sub = ''; render(); break;
      case 'kk-dialer-log-tab': ui.kkLogTab = id; render(); break;
      case 'kk-dialer-pad': ui.kkDialpad = true; render(); break;
      case 'kk-dialer-clear': ui.phoneSearch = ''; render(); viewport.querySelector('[data-kk-dialer-search]')?.focus(); break;
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
      // New Hangout: a picked contact or typed number opens its conversation and takes along a shared draft.
      case 'hg-pick': pickHangout(id); break;
      case 'hg-attach-photo': ui.overlay = 'mms-attach-photos'; renderOverlay(); break;
      case 'hg-location': case 'hg-unsupported': ui.overlay = ''; renderOverlay(); toast(i18n.t('This feature is not part of the simulator.')); break;
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
      case 'photo': ui.selectedPhoto=Number(id);if(!galleryItems().some(p=>p.id===Number(id))){ui.galleryCluster='album';ui.galleryAlbum=ICSMedia.album(data.photos.find(p=>p.id===Number(id))||{});}ui.sub='photo';ui.galleryZoom=false;ui.galleryFilm=false;ui.galleryBars=true;ui.galleryFromCamera=false;render();break;
      case 'gallery-step': galleryStep(Number(id));break;
      case 'gallery-photo-zoom': ui.galleryZoom=!ui.galleryZoom;render();break;
      case 'gallery-menu': case 'gallery-share': case 'gallery-details': ui.overlay=action;renderOverlay();break;
      case 'gallery-rotate': {const photo=data.photos.find(p=>p.id===ui.selectedPhoto);if(photo)photo.rotation=((photo.rotation||0)+Number(id)+360)%360;save();ui.overlay='';render();break;}
      case 'gallery-slideshow': {const items=galleryItems();ui.galleryFilm=false;if(!items.length)break;if(ui.sub!=='photo')ui.selectedPhoto=items[0].id;ui.sub='photo';ui.overlay='';ui.gallerySlideshow=true;ui.gallerySlideAt=Date.now();render();break;}
      case 'gallery-stop': ui.gallerySlideshow=false;render();break;
      case 'gallery-share-message': {const photo=data.photos.find(p=>p.id===ui.selectedPhoto);if(!photo)break;openApp('hangouts');ui.sub='new';messageDraft().attachment=clone(photo);save();render();break;}
      case 'photo-delete': ui.selectedPhoto=Number(id);ui.overlay='gallery-delete';renderOverlay();break;
      case 'gallery-confirm-delete': {
        const items=galleryItems();const index=items.findIndex(p=>p.id===ui.selectedPhoto);
        data.photos=data.photos.filter(p=>p.id!==ui.selectedPhoto);save();ui.overlay='';
        const remaining=galleryItems();if(remaining.length)ui.selectedPhoto=remaining[Math.min(index,remaining.length-1)].id;else ui.sub='album';
        render();toast('Photo deleted');break;
      }
      case 'photo-wallpaper': {const photo=data.photos.find(p=>p.id===Number(id));if(!photo)break;data.wallpaper=11;delete data.liveWallpaper;data.customWallpaper=photo.colors;data.customWallpaperPhoto=clone(photo);save();ui.overlay='';render();toast('Wallpaper set');break;}
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
      case 'clock-alarms': jbClockState(); data.jbClock.tab='alarm'; save(); ui.sub=''; render(); break;
      case 'kdc-add': { const now=deviceDate(); ui.kdcPicker={id:null,hour:now.getHours(),minute:now.getMinutes(),mode:'hour'}; ui.overlay='kdc-picker'; renderOverlay(); break; }
      case 'kdc-time': { const alarm=ICSDeskClock.normalize(data.alarms.find(item=>item.id===Number(id))); const [h,m]=alarm.time.split(':').map(Number); ui.kdcPicker={id:alarm.id,hour:h,minute:m,mode:'hour'}; ui.overlay='kdc-picker'; renderOverlay(); break; }
      case 'kdc-picker-mode': ui.kdcPicker.mode=id; renderOverlay(); break;
      case 'kdc-picker-ampm': { const p=ui.kdcPicker; const pm=id?id==='pm':p.hour<12; p.hour=p.hour%12+(pm?12:0); renderOverlay(); break; }
      case 'kdc-picker-cancel': ui.kdcPicker=null; ui.overlay=''; renderOverlay(); break;
      case 'kdc-picker-done': {
        // AlarmClockFragment.onTimeSet: an edited alarm is switched on; a new one is added, enabled and expanded.
        const p=ui.kdcPicker, time=`${String(p.hour).padStart(2,'0')}:${String(p.minute).padStart(2,'0')}`;
        if(p.id){const alarm=data.alarms.find(item=>item.id===p.id); if(alarm){alarm.time=time;alarm.enabled=true;delete alarm.snoozedUntil;}}
        else{const alarm=ICSDeskClock.normalize({time,enabled:true});alarm.id=Date.now();data.alarms.push(alarm);ui.kdcExpanded=alarm.id;}
        save(); ui.kdcPicker=null; ui.overlay=''; render(); toast('Alarm set'); break;
      }
      case 'kdc-expand': ui.kdcExpanded=ui.kdcExpanded===Number(id)?null:Number(id); render(); break;
      case 'kdc-repeat': { const alarm=data.alarms.find(item=>item.id===Number(id)); if(!alarm)break; const days=ICSDeskClock.normalize(alarm).days; alarm.days=days.length?[]:[0,1,2,3,4,5,6]; save(); render(); break; }
      case 'kdc-day': { const [alarmId,day]=id.split(':').map(Number); const alarm=data.alarms.find(item=>item.id===alarmId); if(!alarm)break; const days=new Set(ICSDeskClock.normalize(alarm).days); days.has(day)?days.delete(day):days.add(day); alarm.days=[...days].sort(); save(); render(); break; }
      case 'kdc-vibrate': { const alarm=data.alarms.find(item=>item.id===Number(id)); if(!alarm)break; alarm.vibrate=!ICSDeskClock.normalize(alarm).vibrate; save(); render(); break; }
      case 'kdc-label': case 'kdc-tone': { const alarm=data.alarms.find(item=>item.id===Number(id)); if(!alarm)break; ui.alarmDraft=ICSDeskClock.normalize(alarm); ui.kdcEditing=alarm.id; ui.overlay=action==='kdc-label'?'clock-label':'clock-tone'; renderOverlay(); break; }
      case 'kdc-delete': data.alarms=data.alarms.filter(alarm=>alarm.id!==Number(id)); if(ui.kdcExpanded===Number(id))ui.kdcExpanded=null; save(); render(); toast('Alarm deleted'); break;
      case 'jbclock-tab': jbClockState(); data.jbClock.tab = id; save(); render(); break;
      case 'jbclock-key': ui.timerDigits = JBDeskClock.setupDigits(ui.timerDigits || '', id); render(); break;
      case 'jbclock-setup-cancel': ui.timerSetup = false; ui.timerDigits = ''; render(); break;
      case 'jbclock-setup-start': { const time = JBDeskClock.setupTime(ui.timerDigits || ''); if (!time.ms) break; jbClockState(); data.jbClock.timers.push({id: `t${Date.now()}`, length: time.ms, left: time.ms, started: Date.now(), state: 'running', label: ''}); ui.timerSetup = false; ui.timerDigits = ''; save(); render(); break; }
      case 'jbclock-timer-add': ui.timerSetup = true; ui.timerDigits = ''; render(); break;
      case 'jbclock-timer-toggle': case 'jbclock-timer-plus': { const timers = jbClockState() && data.jbClock.timers, index = timers.findIndex(timer => timer.id === id); if (index < 0) break; timers[index] = JBDeskClock.timerAction(timers[index], action === 'jbclock-timer-plus' ? 'plus' : 'toggle', Date.now()); save(); render(); break; }
      case 'jbclock-timer-delete': jbClockState(); data.jbClock.timers = data.jbClock.timers.filter(timer => timer.id !== id); save(); render(); break;
      case 'jbclock-sw': {
        jbClockState();
        if (id === 'share') {
          const watch = data.jbClock.stopwatch, laps = watch.laps || [], total = JBDeskClock.elapsed(watch, Date.now());
          const text = [`${i18n.t('Stopwatch')}: ${JBDeskClock.formatStopwatch(total)}`, ...laps.map((lap, i) => `# ${i + 1}  ${JBDeskClock.formatStopwatch(lap - (laps[i - 1] || 0))}`)].join('\n');
          openApp('hangouts'); ui.sub = 'new'; messageDraft().body = text; save(); render(); break;
        }
        data.jbClock.stopwatch = JBDeskClock.stopwatchAction(data.jbClock.stopwatch, id, Date.now()); save(); render(); break;
      }
      case 'jbclock-cities': case 'jbclock-menu': toast('Not available in this demo'); break;
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
      case 'email-read': {const item=mailbox().find(item=>item.id===id);if(!item)break;if(ui.view==='gmail')data.gmailWelcomeSeen=true;ui.emailId=id;item.read=true;ui.sub=item.folder==='Drafts'?'compose':'read';ui.emailError='';save();render();break;}
      case 'email-compose': composeEmail();break;
      case 'email-reply': case 'email-forward': composeEmail(mailbox().find(item=>item.id===ui.emailId),action==='email-forward');break;
      case 'email-list': ui.sub='';ui.overlay='';ui.emailSelected=[];render();break;
      case 'email-folders': case 'email-menu': ui.emailMenu=id||'list';ui.overlay=action;renderOverlay();break;
      // 4.4 Email (UnifiedEmail): the folder drawer, Save draft, Reply all, Move to and the menu entries without a screen.
      case 'email-drawer': ui.overlay='email-drawer';renderOverlay();break;
      case 'email-save': ui.sub='';ui.overlay='';ui.emailSelected=[];render();toast(KKEmail.tr(i18n.language,'Message saved as draft.'));break;
      case 'email-reply-all': ui.overlay='';composeEmail(mailbox().find(item=>item.id===ui.emailId),false);break;
      case 'email-move': {const item=mailbox().find(item=>item.id===ui.emailId);if(item){if(id==='Trash')ICSEmail.trash(mailbox(),[item.id]);else{item.folder=id;delete item.previousFolder;}}ui.overlay='';ui.sub='';save();render();break;}
      case 'email-unavailable': ui.overlay='';renderOverlay();toast('Not available in this simulator');break;
      case 'email-folder': ui.emailFolder=id;ui.sub='';ui.emailQuery=undefined;ui.emailSelected=[];ui.overlay='';render();break;
      case 'email-star': {const item=mailbox().find(item=>item.id===id);if(item)item.starred=!item.starred;save();render();break;}
      case 'email-select': ui.emailSelected ||= [];ui.emailSelected=ui.emailSelected.includes(id)?ui.emailSelected.filter(key=>key!==id):[...ui.emailSelected,id];render();break;
      case 'email-clear-selection': ui.emailSelected=[];render();break;
      case 'email-trash': case 'email-selected-trash': ICSEmail.trash(mailbox(),action==='email-trash'?[ui.emailId]:ui.emailSelected||[]);ui.sub='';ui.emailSelected=[];save();render();break;
      case 'email-restore': case 'email-selected-restore': {const ids=action==='email-restore'?[ui.emailId]:ui.emailSelected||[];mailbox().filter(item=>ids.includes(item.id)).forEach(ICSEmail.untrash);ui.sub='';ui.emailSelected=[];save();render();break;}
      case 'email-selected-read': mailbox().filter(item=>(ui.emailSelected||[]).includes(item.id)).forEach(item=>item.read=true);ui.emailSelected=[];save();render();break;
      case 'email-unread': {const item=mailbox().find(item=>item.id===ui.emailId);if(item)item.read=false;ui.sub='';ui.overlay='';save();render();break;}
      case 'email-search': ui.emailQuery='';render();viewport.querySelector('.email-search input').focus();break;
      case 'email-refresh': toast('Local mailbox is up to date');break;
      case 'email-cc': ui.emailCc=true;ui.overlay='';render();break;
      case 'email-attach': ui.overlay='email-attach';renderOverlay();break;
      case 'email-attach-photo': {const item=mailbox().find(item=>item.id===ui.emailId),photo=data.photos.find(photo=>photo.id===Number(id));if(item&&photo)item.attachment=clone(photo);ui.overlay='';save();render();break;}
      case 'email-remove-attachment': {const item=mailbox().find(item=>item.id===ui.emailId);if(item)delete item.attachment;save();render();break;}
      case 'email-discard': ui.overlay='email-discard';renderOverlay();break;
      case 'email-confirm-discard': ICSEmail.trash(mailbox(),[ui.emailId]);ui.sub='';ui.overlay='';save();render();break;
      // Gmail: Archive leaves the inbox (the conversation stays in All mail); tips and teaser links.
      case 'email-archive': case 'email-selected-archive': {const ids=action==='email-archive'?[ui.emailId]:ui.emailSelected||[];mailbox().filter(item=>ids.includes(item.id)&&item.folder==='Inbox').forEach(item=>{item.folder='Archive';});ui.sub='';ui.emailSelected=[];save();render();break;}
      case 'email-dismiss-teaser': if(ui.view==='gmail')data.gmailTeaserDismissed=true;else data.emailTeaserDismissed=true;save();render();break;
      case 'gmail-unavailable': toast(i18n.t('This feature is not part of the simulator.'));break;
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
    if (form.dataset.form === 'jbp-search') { const q = String(values.get('query') || '').trim(); if (!q) return; data.marketSearches = [q, ...(data.marketSearches || []).filter(x => x !== q)].slice(0, 10); save(); jbPlayGo({page: 'search', query: q}); return; }
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
    if (form.dataset.form === 'p2p-rename') {
      const name = String(values.get('name') || '').trim();
      if (!name) return;
      data.settings.p2pName = name; save(); ui.overlay = ''; render(); return;
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
      case 'maps-search': ui.mapsQuery = String(values.get('query') || '').trim().slice(0, 60); render(); break;
      case 'keep-add': { const text = String(values.get('text') || '').trim(); if (!text) return; data.keepNotes = [{id: 'k' + Date.now(), text, color: (data.keepNotes || []).length % 5}, ...(data.keepNotes || [])]; save(); render(); break; }
      case 'earth-search': toast(i18n.t('This feature is not part of the simulator.')); break;
      case 'chrome-history-search': ui.chromeHistoryQuery = String(values.get('query') || '').trim(); render(); break;
      case 'mms-search': ui.mmsSearch = String(values.get('query') || '').trim(); render(); break;
      case 'hg-new': { const target = ICSMessaging.recipient(values.get('recipient'), data.contacts); if (!target) { toast('Enter a contact name or valid phone number'); return; } pickHangout(target.key); break; }
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
      case 'alarm-tone': ui.alarmDraft.tone=String(values.get('tone'));ui.overlay='';kdcCommit();render();break;
      case 'alarm-label': ui.alarmDraft.label=String(values.get('label')||'').trim();ui.overlay='';kdcCommit();render();break;
      case 'email': {const item=mailbox().find(item=>item.id===ui.emailId);if(!item)break;for(const key of ['to','cc','bcc','subject','body'])if(values.has(key))item[key]=String(values.get(key)).trim();if(!ICSEmail.send(item)){ui.emailError='Enter valid email addresses';save();render();break;}save();ui.emailFolder='Sent';ui.emailQuery=undefined;ui.sub='read';ui.emailError='';render();toast('Demo email sent');break;}
      case 'email-search': ui.emailQuery=String(values.get('query')||'').trim();ui.emailSelected=[];render();break;
      case 'sd-volumes': for(const key of ['mediaVolume','ringVolume','alarmVolume'])data.settings[key]=Math.max(0,Math.min(100,Number(values.get(key))));save();ui.overlay='';render();break;
      case 'sd-choice': {const choice=String(values.get('choice'));if(ui.settingsField==='sleep')data.settings.sleep=Number(choice);else if(['windowScale','transitionScale','animatorScale'].includes(ui.settingsField))data.settings[ui.settingsField]=Number(choice);else if(ui.settingsField==='font')data.settings.largeText=choice==='large';else if(ui.settingsField==='silent'){data.settings.silent=choice!=='off';data.settings.silentMode=choice;}else data.settings[ui.settingsField]=choice;save();ui.overlay='';render();break;}
      default: break;
    }
  });
  document.addEventListener('input', event => {
    if (event.target.matches?.('[data-kk-dialer-search]')) {
      ui.phoneSearch = event.target.value;
      const list = viewport.querySelector('[data-kk-dialer-list]');
      if (list) { const fresh = document.createElement('div'); fresh.innerHTML = KKDialer.render({data, ui, t: key => i18n.t(key), locale: i18n.locale(), byPhone: contactByPhone}); list.innerHTML = fresh.querySelector('[data-kk-dialer-list]').innerHTML; i18n.translateDOM?.(list); }
      return;
    }
    if(event.target.closest('[data-form="folder-name"]')){const folder=ICSLauncherFolders.folder(data,ui.folderId);if(folder){folder.name=event.target.value.slice(0,40);save();for(const button of viewport.querySelectorAll('[data-folder-id]'))if(button.dataset.folderId===ui.folderId){button.setAttribute('aria-label',folderName(ui.folderId));button.lastElementChild.textContent=folderName(ui.folderId);}}return;}
    if(event.target.dataset.field==='data-cycle'){ui.dataCycle=event.target.value;render();return;}
    if(event.target.closest('.email-compose')&&event.target.name){const item=mailbox().find(item=>item.id===ui.emailId);if(item){item[event.target.name]=event.target.value;save();}return;}
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
    if (event.target.closest('.jbp-bar.searching')) { ui.marketEdit = event.target.value; const view = viewport.querySelector('.jbp'); view?.querySelector('.jbp-suggest')?.remove(); const tmp = document.createElement('div'); tmp.innerHTML = JBPlay.render(jbPlayContext()); const sug = tmp.querySelector('.jbp-suggest'); if (sug && view) view.append(sug); return; }
    if (event.target.matches('[data-jbp-auto]')) { const id = event.target.dataset.jbpAuto, list = data.marketAuto || []; data.marketAuto = event.target.checked ? [...new Set([...list, id])] : list.filter(x => x !== id); save(); return; }
    if (event.target.matches('.keep-text')) { const note = (data.keepNotes || []).find(item => item.id === ui.keepNote); if (note) { note.text = event.target.value; save(); } return; }
    if (event.target.closest('.hg-new')) {
      const query = event.target.value.trim().toLocaleLowerCase();
      (data.messageDrafts ||= {}).new ||= {body: '', recipient: ''};
      data.messageDrafts.new.recipient = event.target.value; save();
      viewport.querySelectorAll('.hg-person').forEach(row => { row.hidden = !!query && !row.dataset.search.includes(query); });
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
    if (event.target.dataset.field === 'auto-brightness') { data.settings.autoBrightness = event.target.checked; save(); const slider = event.target.closest('.jb-brightness')?.querySelector('[data-field="brightness"]'); if (slider) slider.disabled = data.settings.autoBrightness; return; }
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
    addExtraEmptyScreen();
    suppressClickUntil = Date.now() + 500;
  }
  function addExtraEmptyScreen() {
    if (ui.extraScreen) return;
    ui.extraScreen = true;
    data.homePages.push(Array(16).fill(null)); data.homeWidgets.push([]);
    const index = data.homePages.length - 1;
    viewport.querySelector('.home-pages')?.insertAdjacentHTML('beforeend', `<div class="home-grid" data-home-page="${index}" data-action="kk-overview-page" data-id="${index}" style="--rel:${index - ui.page}" inert>${Array.from({length: 16}, (_, slot) => `<div class="home-slot" data-home-slot="${slot}" style="grid-column:${slot % 4 + 1};grid-row:${Math.floor(slot / 4) + 1}"></div>`).join('')}</div>`);
    viewport.querySelector('.page-indicators')?.insertAdjacentHTML('beforeend', `<button data-action="page" data-id="${index}" aria-label="${safe(i18n.t('Home screen'))} ${index + 1}">${pageMarker(false, true)}</button>`);
  }
  // Returns the new index of each old page.
  function stripEmptyScreens() {
    ui.extraScreen = false;
    const empty = page => data.homePages[page].every(id => !id) && !(data.homeWidgets[page] || []).length;
    const keep = data.homePages.map((_, page) => page).filter(page => !empty(page));
    if (!keep.length) keep.push(0);
    const map = new Map(keep.map((page, index) => [page, index]));
    data.homePages = keep.map(page => data.homePages[page]); data.homeWidgets = keep.map(page => data.homeWidgets[page] || []);
    const current = keep.findIndex(page => page >= ui.page);
    ui.page = current < 0 ? keep.length - 1 : keep[current] === ui.page ? current : Math.max(0, current - 1);
    return map;
  }
  function remapDestination(destination, map) { if (destination?.type === 'home' && map.has(destination.page)) destination.page = map.get(destination.page); return destination; }
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
  /* Jelly Bean reorder: after hovering an occupied area for REORDER_TIMEOUT the items there slide away
     (REORDER_DURATION); the solution is committed on drop and undone when the drag moves on. */
  const gridMetrics = () => { const grid = viewport.querySelector(`.home-grid[data-home-page="${ui.page}"]`); if (!grid) return null; const rect = grid.getBoundingClientRect(), k = rect.width / grid.offsetWidth || 1; return {grid, cellW: (rect.width - 12) / 4 / k, cellH: (rect.height - 5) / 4 / k}; };
  function reorderElement(key) {
    const grid = viewport.querySelector(`.home-grid[data-home-page="${ui.page}"]`);
    return key[0] === 's' ? grid?.querySelector(`[data-home-slot="${key.slice(1)}"] .launcher-icon`) : grid?.querySelector(`.home-widget[data-widget-id="${CSS.escape(key.slice(1))}"]`);
  }
  function showReorder(solution) {
    const metrics = gridMetrics();
    viewport.querySelectorAll('.jb-displaced').forEach(node => { node.classList.remove('jb-displaced'); node.style.transform = ''; });
    if (!solution || !metrics) return;
    const list = JBLauncher.items(data.homePages[ui.page], data.homeWidgets[ui.page], widgetSize);
    for (const [key, to] of Object.entries(solution.moves)) {
      const item = list.find(entry => entry.key === key), node = reorderElement(key);
      if (!item || !node) continue;
      node.classList.add('jb-displaced');
      node.style.transform = `translate(${(to.x - item.x) * metrics.cellW}px,${(to.y - item.y) * metrics.cellH}px)`;
    }
  }
  function requestReorder(key, moving) {
    const source = dragState;
    if (source.wsReorder?.key === key) return source.wsReorder.solution;
    if (source.wsPending === key) return null;
    clearTimeout(source.wsReorderTimer); source.wsPending = key;
    if (source.wsReorder) { source.wsReorder = null; showReorder(null); }
    source.wsReorderTimer = setTimeout(() => {
      if (dragState !== source || source.wsPending !== key) return;
      const list = JBLauncher.items(data.homePages[ui.page], data.homeWidgets[ui.page], widgetSize);
      const solution = JBLauncher.solve(list, moving, source.wsDirection || [0, 0]);
      source.wsReorder = {key, solution, moving}; source.wsPending = '';
      showReorder(solution);
      if (source.lastPointer) updateDragOutline(...source.lastPointer);
    }, JBLauncher.REORDER_TIMEOUT);
    return null;
  }
  function clearReorder() { const source = dragState; if (!source) return; clearTimeout(source.wsReorderTimer); source.wsPending = ''; if (source.wsReorder) { source.wsReorder = null; showReorder(null); } }
  function dragOutlineTarget(x, y) {
    const source = dragState;
    if (!source || ui.overlay) return null;
    source.wsCandidate = null;
    if (source.lastPointer) source.wsDirection = [Math.sign(x - source.lastPointer[0]), Math.sign(y - source.lastPointer[1])];
    source.lastPointer = [x, y];
    const target = document.elementFromPoint(x, y), grid = target?.closest('.home-grid:not([inert])');
    if (source.widgetType) {
      if (!grid) return null;
      const rect = grid.getBoundingClientRect(), oldWidget = source.type === 'widget' ? data.homeWidgets[source.page].find(widget => widget.id === source.id) : null;
      const column = Math.round((x - rect.left - 6 - source.grabOffset.x) / ((rect.width - 12) / 4)), row = Math.round((y - rect.top - 5 - source.grabOffset.y) / ((rect.height - 5) / 4));
      const size = widgetSize(oldWidget || source.widgetType), outline = {key: `w:${ui.page}:${column}:${row}`, container: grid, style: `grid-column:${column + 1}/span ${size.width};grid-row:${row + 1}/span ${size.height}`};
      if (widgetFits(ui.page, column, row, oldWidget || source.widgetType, oldWidget?.id || '')) { clearReorder(); return outline; }
      const movingKey = oldWidget && source.page === ui.page ? `w${oldWidget.id}` : 'new';
      source.wsCandidate = {key: outline.key, moving: {key: movingKey, x: column, y: row, w: size.width, h: size.height}};
      return requestReorder(outline.key, source.wsCandidate.moving) ? outline : null;
    }
    const slot = target?.closest('[data-home-slot],[data-dock-slot]');
    const occupant = slot?.querySelector('.launcher-icon:not(.drag-source-icon)');
    if (slot?.hasAttribute('data-home-slot')) {
      const index = Number(slot.dataset.homeSlot), outline = {key: `h:${ui.page}:${index}`, container: slot};
      const covered = data.homeWidgets[ui.page].some(widget => index % 4 >= widget.x && index % 4 < widget.x + widgetSize(widget).width && Math.floor(index / 4) >= widget.y && Math.floor(index / 4) < widget.y + widgetSize(widget).height);
      if (!occupant && !covered) { clearReorder(); return outline; }
      // Near an icon's centre the drop makes or fills a folder; elsewhere the occupant moves aside.
      if (occupant) { const box = occupant.querySelector('.app-icon')?.getBoundingClientRect(); if (box && JBLauncher.folderZone({x, y}, {x: box.left + box.width / 2, y: box.top + box.height / 2}, box.width)) { clearReorder(); return null; } }
      if (ICSLauncherFolders.folder(data, source.id) && occupant?.dataset.folderId) return null;
      const movingKey = source.type === 'home' && source.page === ui.page ? `s${source.slot}` : 'new';
      source.wsCandidate = {key: outline.key, moving: {key: movingKey, x: index % 4, y: Math.floor(index / 4), w: 1, h: 1}};
      return requestReorder(outline.key, source.wsCandidate.moving) ? outline : null;
    }
    if (!slot || occupant) return null;
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
    const box=icon?.querySelector('.app-icon')?.getBoundingClientRect(),inZone=!!box&&JBLauncher.folderZone({x,y},{x:box.left+box.width/2,y:box.top+box.height/2},box.width);
    if(icon&&inZone&&!sameSlot&&!sourceIsFolder&&icon.dataset.action!=='drawer')icon.classList.add('folder-drop-target');
    const hoverId=!sourceIsFolder&&!sameSlot&&inZone?folderId:null;
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
    if (target?.closest('[data-resize-frame]')) homeSlot = target.closest('.home-grid')?.querySelector('[data-home-slot]');
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
      clearTimeout(source.edgeTimer); clearDragOutlines(); source.ghost.remove(); dragState = null; screen.classList.remove('dragging', 'dragging-from-drawer'); stripEmptyScreens(); save();
      openApp('settings'); ui.settingsApp = source.id; ui.sub = 'app-info'; render(); suppressClickUntil = Date.now() + 350;
      return true;
    }
    let destination = null;
    // Commit a reorder solution if the drop lands where it was computed.
    let committed = null;
    if (!ui.overlay && source.lastPointer) {
      updateDragOutline(x, y);
      const candidate = source.wsCandidate;
      if (candidate) {
        const solution = source.wsReorder?.key === candidate.key ? source.wsReorder.solution : JBLauncher.solve(JBLauncher.items(data.homePages[ui.page], data.homeWidgets[ui.page], widgetSize), candidate.moving, source.wsDirection || [0, 0]);
        if (solution) committed = {key: candidate.key, solution, moving: candidate.moving};
      }
    }
    if (committed) {
      const page = data.homePages[ui.page], sameIcon = !source.widgetType && source.type === 'home' && source.page === ui.page;
      if (sameIcon) page[source.slot] = null;
      data.homePages[ui.page] = JBLauncher.apply(page, data.homeWidgets[ui.page], committed.solution.moves);
      showReorder(null);
      if (sameIcon) { const slot = committed.moving.y * 4 + committed.moving.x; data.homePages[ui.page][slot] = source.id; homeSlot = null; destination = {type: 'home', page: ui.page, slot}; source.reorderHandled = true; }
    }
    if (source.reorderHandled) { /* placed above */ }
    else if (source.widgetType) {
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
            // Launcher2 shows the resize frame after dropping a resizable widget.
            if (widgetSize(oldWidget).resize) ui.resizeWidget = oldWidget.id;
          }
          else { const added = addWidget(source.widgetType, column, row); if (added) { destination = {widget: added.id, page: ui.page}; if (widgetSize(added).resize) ui.resizeWidget = added.id; } }
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
        if(!covered)result=dropAt({type:'home',page:ui.page,slot});
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
    clearTimeout(source.folderExitTimer);clearTimeout(source.folderHoverTimer);clearTimeout(source.reorderTimer);clearTimeout(source.wsReorderTimer);clearFolderDragFeedback();
    clearTimeout(source.edgeTimer); clearDragOutlines(); dragState = null; screen.classList.remove('dragging', 'dragging-from-drawer');
    const pageMap = stripEmptyScreens(); remapDestination(destination, pageMap);
    save(); render(); suppressClickUntil = Date.now() + 350;
    landGhost(source.ghost, destination, trashRect);
    return true;
  }
  function setHomePage(page) {
    ui.page = Math.max(dragState || ui.overview ? 0 : -1, Math.min(data.homePages.length - 1, page));
    const track = viewport.querySelector('.home-pages');
    if (!track) return;
    const home = viewport.querySelector('.kk-home');
    if (home) { home.style.removeProperty('--gnow-instant'); home.style.setProperty('--gnow', ui.page === -1 ? 1 : 0); home.classList.toggle('gel-now-open', ui.page === -1); home.querySelector('.gel-now-layer').inert = ui.page !== -1; }
    track.style.transition = '';
    track.style.transform = `translateX(${-Math.max(0, ui.page) * 100}%)`;
    tweenWallpaperOffset(wallpaperOffset(ui.page)); setWallpaperPan(ui.page);
    track.querySelectorAll('.home-grid').forEach((grid, index) => { grid.inert = index !== ui.page && !ui.overview; grid.style.setProperty('--rel', index - ui.page); });
    viewport.querySelectorAll('.page-indicators button').forEach(button => button.classList.toggle('active', Number(button.dataset.id) === ui.page));
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
      liveWallpaper = LiveWallpapers.mount(liveLayer, id, {preview, prefs: () => data.lwPrefs?.[id] || {}, clock: deviceDate, offset: preview ? .5 : wallpaperOffset(ui.page, true), audio: () => !!ui.music?.playing, deviceWidth: 768});
      if (liveWallpaper) liveWallpaper.key = key;
    }
    liveLayer.hidden = !visible; liveWallpaper?.pause(!visible);
    if (liveWallpaper && !preview && ui.view === 'home') liveWallpaper.setOffset(wallpaperOffset(ui.page, true));
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
    const home = viewport.querySelector('.kk-home'), width = screen.clientWidth;
    // Scrolling into Google Now: the pane follows the finger and the workspace, dock and indicator slide away.
    if (home && (ui.page === -1 || (ui.page === 0 && dx > 0)) && !ui.overview) {
      const progress = ui.page === -1 ? Math.max(0, Math.min(1, 1 + dx / width)) : Math.max(0, Math.min(1, dx / width));
      home.style.setProperty('--gnow-instant', '1'); home.style.setProperty('--gnow', progress.toFixed(4));
      return;
    }
    const distance = Math.max(-(data.homePages.length - 1 - ui.page) * screen.clientWidth, Math.min(ui.page * screen.clientWidth, dx));
    content.style.transition = 'none';
    content.style.transform = `translateX(calc(${-ui.page * 100}% + ${distance}px))`;
    if (liveWallpaper) { const value = wallpaperOffset(ui.page - distance / screen.clientWidth, true); liveWallpaper.setOffset(value); liveWallpaper.offset = value; }
    setWallpaperPan(ui.page - distance / screen.clientWidth, false);
  }
  function finishHomePage(dx) {
    const nextPage = Math.max(ui.overview ? 0 : -1, Math.min(data.homePages.length - 1, ui.page + (dx < 0 ? 1 : -1)));
    screen.classList.remove('page-swiping');
    suppressClickUntil = Date.now() + 350;
    setHomePage(Math.abs(dx) > 45 ? nextPage : ui.page);
  }
  function finishDrawerPage(dx) {
    const [first, last] = drawerRange();
    const nextPage = Math.max(first,Math.min(last,ui.drawerPage + (dx < 0 ? 1 : -1)));
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
  /* Jelly Bean notifications expand with a two-finger swipe down or a pinch out (trackpad pinches arrive as
     Ctrl+wheel), and collapse with the opposite gesture. */
  function setNoteExpanded(id, expanded) {
    ui.noteExpanded = {...ui.noteExpanded, [id]: expanded};
    renderOverlay();
  }
  screen.addEventListener('wheel', event => {
    const note = ui.overlay === 'shade' && event.ctrlKey ? event.target.closest('.jb-note') : null;
    if (!note) return;
    event.preventDefault(); event.stopImmediatePropagation();
    setNoteExpanded(note.dataset.id, event.deltaY < 0);
  }, {passive: false, capture: true});
  let noteGesture = null;
  screen.addEventListener('touchstart', event => {
    const note = ui.overlay === 'shade' && event.touches.length === 2 ? event.target.closest('.jb-note') : null;
    noteGesture = note ? {id: note.dataset.id, y: (event.touches[0].clientY + event.touches[1].clientY) / 2} : null;
  }, {passive: true});
  screen.addEventListener('touchmove', event => {
    if (!noteGesture || event.touches.length !== 2) return;
    const y = (event.touches[0].clientY + event.touches[1].clientY) / 2;
    if (Math.abs(y - noteGesture.y) > 30) { const {id} = noteGesture, down = y > noteGesture.y; noteGesture = null; setNoteExpanded(id, down); }
  }, {passive: true});
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
  let kdcDialDrag = false;
  const kdcDialPick = event => { const dial = overlayRoot.querySelector('[data-kdc-dial]'); if (!dial || !ui.kdcPicker) return; const r = dial.getBoundingClientRect(); ui.kdcPicker = KKDeskClock.pick(ui.kdcPicker, (event.clientX - r.left) * dial.offsetWidth / r.width, (event.clientY - r.top) * dial.offsetHeight / r.height, dial.offsetWidth, !!data.settings.hour24); renderOverlay(); };
  overlayRoot.addEventListener('pointerdown', event => { if (!event.target.closest('[data-kdc-dial]') || event.target.closest('button')) return; kdcDialDrag = true; event.preventDefault(); kdcDialPick(event); });
  window.addEventListener('pointermove', event => { if (kdcDialDrag) kdcDialPick(event); });
  window.addEventListener('pointerup', () => { if (!kdcDialDrag) return; kdcDialDrag = false; if (ui.kdcPicker?.mode === 'hour') { ui.kdcPicker.mode = 'minute'; setTimeout(renderOverlay, 120); } });
  let barsPeekTimer = 0;
  screen.addEventListener('pointerdown', event => {
    if (!screen.classList.contains('kk-immersive')) return;
    const rect = screen.getBoundingClientRect(), y = event.clientY - rect.top;
    if (y > 24 && y < rect.height - 24) return;
    screen.classList.add('kk-bars-peek'); clearTimeout(barsPeekTimer);
    barsPeekTimer = setTimeout(() => screen.classList.remove('kk-bars-peek'), 3000);
  }, true);
  screen.addEventListener('contextmenu', event => {
    if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    event.preventDefault();
    const message = event.target.closest('.mms-message');
    if (message && !ui.overlay) { ui.mmsMessage = message.dataset.id; ui.overlay = 'mms-message'; renderOverlay(); }
    if (!dragState && ui.view === 'home' && !ui.overlay && !ui.overview && event.button === 2 && event.target.closest('.home-slot') && !event.target.closest('.launcher-icon')) { ui.overview = true; render(); }
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
  /* AppWidgetResizeFrame: handles grow or shrink the span in whole cells (66% threshold) between the provider's
     minimum resize span and the grid; neighbours move aside with the reorder solver and the result persists. */
  let resizeState = null;
  screen.addEventListener('pointerdown', event => {
    const handle = event.target.closest('[data-resize-edge]');
    if (!handle) {
      if (ui.resizeWidget && ui.view === 'home' && !event.target.closest('[data-resize-frame]')) { ui.resizeWidget = null; viewport.querySelectorAll('.home-widget.resizing').forEach(node => { node.classList.remove('resizing'); node.querySelector('[data-resize-frame]')?.remove(); }); }
      return;
    }
    event.preventDefault(); event.stopPropagation();
    const widget = data.homeWidgets[ui.page].find(item => item.id === ui.resizeWidget), metrics = gridMetrics();
    if (!widget || !metrics) return;
    const span = widgetSize(widget);
    resizeState = {pointerId: event.pointerId, edge: handle.dataset.resizeEdge, x: event.clientX, y: event.clientY, widget, metrics, start: {x: widget.x, y: widget.y, w: span.width, h: span.height}, min: span.resize, rect: null, solution: null};
    try { screen.setPointerCapture(event.pointerId); } catch {}
  }, true);
  window.addEventListener('pointermove', event => {
    if (!resizeState || event.pointerId !== resizeState.pointerId) return;
    event.preventDefault();
    const r = resizeState, k = screen.getBoundingClientRect().width / screen.clientWidth || 1, dx = (event.clientX - r.x) / k, dy = (event.clientY - r.y) / k, start = r.start;
    let {x, y, w, h} = start;
    if (r.edge === 'right') w = JBLauncher.resizeSpan(start.w, dx, r.metrics.cellW, r.min.minWidth, 4 - start.x);
    if (r.edge === 'left') { w = JBLauncher.resizeSpan(start.w, -dx, r.metrics.cellW, r.min.minWidth, start.x + start.w); x = start.x + start.w - w; }
    if (r.edge === 'bottom') h = JBLauncher.resizeSpan(start.h, dy, r.metrics.cellH, r.min.minHeight, 4 - start.y);
    if (r.edge === 'top') { h = JBLauncher.resizeSpan(start.h, -dy, r.metrics.cellH, r.min.minHeight, start.y + start.h); y = start.y + start.h - h; }
    if (r.rect && r.rect.x === x && r.rect.y === y && r.rect.w === w && r.rect.h === h) return;
    // Shortcut cells under the new area must be able to move away, as in CellLayout.createAreaForResize.
    const list = JBLauncher.items(data.homePages[ui.page], data.homeWidgets[ui.page], widgetSize);
    const solution = JBLauncher.solve(list, {key: `w${r.widget.id}`, x, y, w, h}, [Math.sign(dx), Math.sign(dy)]);
    if (!solution) return;
    r.rect = {x, y, w, h}; r.solution = solution;
    const node = reorderElement(`w${r.widget.id}`);
    if (node) node.style.gridArea = `${y + 1} / ${x + 1} / span ${h} / span ${w}`;
    showReorder(solution);
  });
  const endResize = event => {
    if (!resizeState || event.pointerId !== resizeState.pointerId) return;
    const r = resizeState; resizeState = null;
    if (r.rect && r.solution) {
      data.homePages[ui.page] = JBLauncher.apply(data.homePages[ui.page], data.homeWidgets[ui.page], r.solution.moves);
      Object.assign(r.widget, {x: r.rect.x, y: r.rect.y, width: r.rect.w, height: r.rect.h}); save();
    }
    suppressClickUntil = Date.now() + 350; render();
  };
  window.addEventListener('pointerup', endResize); window.addEventListener('pointercancel', endResize);
  const activeTouches = new Set();
  window.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') activeTouches.add(event.pointerId); }, true);
  for (const type of ['pointerup', 'pointercancel']) window.addEventListener(type, event => activeTouches.delete(event.pointerId), true);
  screen.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (data.settings.showTouches) { const dot = document.createElement('span'); const rect = screen.getBoundingClientRect(); dot.className = 'touch-indicator'; dot.style.left = `${event.clientX - rect.left}px`; dot.style.top = `${event.clientY - rect.top}px`; screen.append(dot); setTimeout(() => dot.remove(), 400); }
    const widgetList = ui.view === 'home' && !ui.overlay ? event.target.closest('.calw-list') : null;
    const scrollTarget = widgetList || (event.pointerType === 'mouse' && !ui.overlay && !event.target.closest('input, select, textarea, .wallpaper-choice')
      ? (ui.view === 'settings' && event.target.closest('.settings-app .app-content') ? event.target.closest('.settings-app') : event.target.closest('.jbp-scroll,.play-content,.mms-scroll,.people-scroll,.browser-page,.web-tabs,.web-library,.desk-scroll,.gallery-scroll,.cal-scroll,.music-library-scroll,.email-scroll')) : null);
    pointerStart = { x: event.clientX, y: event.clientY, target: event.target, source: dragSource(event.target), pointerType: event.pointerType, pointerId: event.pointerId, downTime: performance.now(), scrollTarget, scrollTop: scrollTarget?.scrollTop || 0, lockDrag: ui.view === 'lock' && !!event.target.closest('.lock-handle'), shadeDragEligible: !ui.overlay && !!event.target.closest('#status-bar'), shadeCloseEligible: ui.overlay === 'shade' && !!event.target.closest('.shade-handle,.shade-top'), pageSwipeEligible: ui.view === 'home' && !ui.overlay && !!event.target.closest('.home-view') && !event.target.closest('.dock, .page-indicators, .home-search'), drawerSwipeEligible: ui.view === 'drawer' && !!event.target.closest('.drawer-page') };
    const qsToggle = ui.overlay === 'shade' ? event.target.closest('[data-qs-toggle]') : null;
    if (qsToggle) homeLongPressTimer = setTimeout(() => { const key = qsToggle.dataset.qsToggle; data.settings[key] = !data.settings[key]; if (data.settings[key]) data.settings.airplane = false; if (key === 'wifi' && data.settings.wifi) data.settings.portableHotspot = false; save(); renderStatus(); renderOverlay(); pointerStart = null; suppressReleaseClick(); }, 500);
    if (ui.view === 'home' && event.target.closest('.kk-cling-workspace .cling-shade')) homeLongPressTimer = setTimeout(() => { data.clings.workspace = true; save(); LauncherClings.dismiss(clingLayerRoot().querySelector('[data-cling="workspace"]'), () => { ui.overview = true; render(); }); pointerStart = null; suppressReleaseClick(); }, 550);
    if (ui.view === 'home' && !ui.overlay && !ui.overview && event.target.closest('.home-slot') && !pointerStart.source) homeLongPressTimer = setTimeout(() => { ui.overview = true; render(); pointerStart = null; suppressReleaseClick(); }, 550);
    const message = event.target.closest('.mms-message');
    const kwpScroll = ui.view === 'wallpaper-picker' ? event.target.closest('.kwp-scroll') : null;
    if (kwpScroll) { pointerStart.kwpScroll = kwpScroll; pointerStart.kwpLeft = kwpScroll.scrollLeft; }
    const kwpLong = ui.view === 'wallpaper-picker' && !ui.wp?.checked?.length ? event.target.closest('[data-kwp-long]') : null;
    if (kwpLong) homeLongPressTimer = setTimeout(() => { ui.wp.checked = [kwpLong.dataset.id]; pointerStart = null; suppressReleaseClick(); wallpaperPickerRender(); }, 550);
    if (message && !ui.overlay) messageHoldTimer = setTimeout(() => { ui.mmsMessage = message.dataset.id; ui.overlay = 'mms-message'; suppressReleaseClick(); renderOverlay(); }, 550);
    if (pointerStart.lockDrag) { clearTimeout(ui.lockReleaseTimer); viewport.querySelectorAll('.lock-chevron').forEach(chevron => chevron.getAnimations().forEach(animation => animation.cancel())); screen.classList.remove('lock-releasing'); screen.classList.add('lock-dragging'); try { screen.setPointerCapture(event.pointerId); } catch {} }
    else if (ui.view === 'lock' && !ui.locked && event.target.closest('.lock-wave')) lockPing();
    if (event.target.closest('.jb-platlogo')) eggTimer = setTimeout(() => { suppressReleaseClick(); document.querySelector('.jb-toast')?.remove(); ui.sub = 'beanbag'; ui.jbLogoTapped = false; render(); }, 500);
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
    // The wallpaper strip scrolls sideways under a mouse drag as it would under a finger.
    if (pointerStart.kwpScroll && event.pointerType === 'mouse' && (pointerStart.kwpDragging || Math.abs(dx) > 8)) { pointerStart.kwpDragging = true; const k = screen.getBoundingClientRect().width / screen.offsetWidth || 1; pointerStart.kwpScroll.scrollLeft = pointerStart.kwpLeft - dx / k; suppressClickUntil = Date.now() + 350; event.preventDefault(); return; }
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
    if((pointerStart.clockSwiping || ui.view==='clock' && !ui.sub && !ui.overlay && pointerStart.target.closest('[data-jbclock-swipe]') && Math.abs(dx)>12 && Math.abs(dx)>Math.abs(dy)*1.2)) {
      pointerStart.clockSwiping=true;suppressClickUntil=Date.now()+350;event.preventDefault();
      try{screen.setPointerCapture(event.pointerId);}catch{}
      const track=viewport.querySelector('.jbclock-track'),index=JBDeskClock.TABS.indexOf(data.jbClock?.tab||'clock');
      if(track){track.style.transition='none';track.style.transform=`translateX(calc(${-index*100}% + ${dx}px))`;}return;
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
    if (pointerStart.shadeDragging || pointerStart.shadeDragEligible && dy > 8 && dy > Math.abs(dx) || pointerStart.shadeCloseEligible && dy < -8 && -dy > Math.abs(dx)) {
      if (!pointerStart.shadeDragging) { pointerStart.shadeDragging = true; if (ui.overlay !== 'shade') ui.shadeSettings = activeTouches.size >= 2; ui.overlay = 'shade'; renderOverlay(); try { screen.setPointerCapture(event.pointerId); } catch {} }
      event.preventDefault();
      const shade = overlayRoot.querySelector('.notification-shade');
      if (shade) {
        shade.style.animation = 'none';
        shade.style.bottom = 'auto';
        // PanelView.setExpandedHeightInternal: while the finger is down (mTracking) rubberbanding lets the panel follow it past
        // its content height down to the bottom of the screen; on release it springs back to the content (handled below).
        const full = shadeFullHeight(shade), max = screen.clientHeight - statusBarHeight();
        shade.style.height = `${Math.max(78, Math.min(max, pointerStart.shadeCloseEligible ? full + dy : dy))}px`;
        overlayRoot.querySelector('.jb-shade-scrim')?.style.setProperty('opacity', String(Math.min(1, shade.offsetHeight / full)));
      }
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
    if(pointerStart.clockSwiping){const tabs=JBDeskClock.TABS,index=tabs.indexOf(data.jbClock?.tab||'clock'),next=Math.max(0,Math.min(tabs.length-1,index+(Math.abs(dx)>45?(dx<0?1:-1):0)));data.jbClock.tab=tabs[next];save();render();suppressClickUntil=Date.now()+350;pointerStart=null;return;}
    // Play Store 4.8: a swipe from the left edge of a top-level page opens the drawer, a swipe to the left closes it.
    if (ui.view === 'play-store' && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      const left = (pointerStart.x - screen.getBoundingClientRect().left) / (screen.getBoundingClientRect().width / screen.offsetWidth);
      if (!ui.overlay && dx > 0 && left < 20 && ['home', 'my-apps', 'wishlist'].includes(ui.market?.page || 'home')) { ui.overlay = 'jbp-drawer'; renderOverlay(); suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
      if (ui.overlay === 'jbp-drawer' && dx < 0) { ui.overlay = ''; renderOverlay(); suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
    }
    if (ui.view === 'play-store' && (ui.market?.page === 'section' || ui.market?.page === 'my-apps') && !ui.overlay && pointerStart.target.closest('.jbp-scroll') && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { const tabs = [...viewport.querySelectorAll('.jbp-tabs button')], i = tabs.findIndex(b => b.classList.contains('on')), next = tabs[i + (dx < 0 ? 1 : -1)]; if (next) next.click(); suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
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
      const close = pointerStart.shadeCloseEligible ? dy < -55 : dy < 75;
      if (close) { ui.overlay = ''; renderOverlay(); }
      else {
        const shade = overlayRoot.querySelector('.notification-shade');
        if (shade) { const height = shade.clientHeight, full = shadeFullHeight(shade); shade.style.removeProperty('height'); shade.style.removeProperty('bottom'); overlayRoot.querySelector('.jb-shade-scrim')?.style.removeProperty('opacity'); shade.animate([{height:`${height}px`},{height:`${full}px`}], {duration:180,easing:'ease-out'}); }
      }
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
    if (!ui.overlay && pointerStart.target.closest('#status-bar') && dy > 45) { ui.overlay = 'shade'; renderOverlay(); }
    pointerStart = null;
  });
  window.addEventListener('pointercancel', () => { clearTimeout(calculatorClearTimer); clearTimeout(messageHoldTimer); const calcTrack = viewport.querySelector('.calc-panels'); if (calcTrack) { calcTrack.style.transition = ''; calcTrack.style.transform = `translateX(-${ui.calcPanel * 50}%)`; } clearTimeout(eggTimer); clearTimeout(dragTimer); clearTimeout(homeLongPressTimer); clearTimeout(dragState?.edgeTimer);clearTimeout(dragState?.folderExitTimer);clearTimeout(dragState?.folderHoverTimer);clearFolderDragFeedback();dragState?.ghost.remove(); clearDragOutlines(); dragState = null; screen.classList.remove('dragging', 'page-swiping', 'settings-scrolling', 'lock-dragging'); if (ui.extraScreen) { stripEmptyScreens(); save(); if (ui.view === 'home') render(); } setHomePage(ui.page); const drawerPage = viewport.querySelector('.drawer-page'); if (drawerPage) drawerPage.style.transform = ''; const lockHandle = viewport.querySelector('.lock-handle'); if (lockHandle) lockHandle.style.removeProperty('--lock-x'); if (pointerStart?.shadeDragging || ui.overlay === 'recent' || ui.overlay === 'shade' || ui.overlay === 'folder') renderOverlay(); pointerStart = null; });
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
    if (!confirm(i18n.t('Reset all local KitKat simulator data?'))) return;
    resetSimulator();
  });
  let lastWidgetMinute = '';
  setInterval(() => {
    const cpu = screen.querySelector('.dev-cpu'); if (cpu) JBDeveloperOptions.updateCpu(cpu);
    lockControls.tick();
    document.querySelectorAll('.status-clock').forEach(node => { node.textContent = clock(); });
    const now = deviceDate();
    if(!document.hidden && !ui.sleeping && ui.view!=='lock' && !ui.overlay && !ui.activeCall && !dragState && Date.now()-lastActivity>=data.settings.sleep*1000){captureRecentView();lockScreen();lastActivity=Date.now();}
    if(ui.activeCall){
      const dialing=Date.now()<ui.activeCall.connected;
      const elapsed=viewport.querySelector('.incall-elapsed'),state=viewport.querySelector('.incall-state');
      if(elapsed)elapsed.textContent=dialing?'':ICSPhoneCall.duration(ICSPhoneCall.elapsed(ui.activeCall));
      if(state)state.textContent=i18n.t(dialing?'Calling…':ui.activeCall.hold?'On hold':'In call');
    }
    checkAlarms(now);
    checkTimers();
    // Dreams redraw only when the saver moves (each minute) or the slideshow advances; otherwise just the text changes.
    if (ui.overlay === 'dream' && !pointerStart) {
      const key = `${data.settings.daydreamType}:${Math.floor(Date.now() / 60000)}:${Math.floor(Date.now() / 6000)}`, type = data.settings.daydreamType || 'clock';
      const changed = type === 'clock' ? key.split(':')[1] !== ui.dreamKey?.split(':')[1] : type === 'photoframe' ? key !== ui.dreamKey : false;
      if (changed || !ui.dreamKey) { ui.dreamKey = key; renderOverlay(); }
      else { const fresh = document.createElement('div'); fresh.innerHTML = renderDream(); const saver = overlayRoot.querySelector('.jb-dream-saver'), next = fresh.querySelector('.jb-dream-saver'); if (saver && next) { saver.querySelector('.jbclock-time').innerHTML = next.querySelector('.jbclock-time').innerHTML; } }
    }
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
    const kgClock = viewport.querySelector('.jbk-clock'); if (kgClock && !pointerStart) { const hour24 = !!data.settings.hour24; kgClock.firstChild.textContent = now.toLocaleTimeString(i18n.locale(), {hour: hour24 ? '2-digit' : 'numeric', minute: '2-digit', hour12: !hour24}).replace(/\s?[AaPp]\.?\s?[Mm]\.?$/, ''); }
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
