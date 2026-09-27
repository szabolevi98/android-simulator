/* Android 4.0.4 inspired browser simulation. No network or Android runtime required. */
(() => {
  'use strict';

  const STORE = 'android-time-machine-ics-v1';
  const defaultData = {
    wallpaper: 0,
    homePages: [
      [null,null,null,null,null,null,null,null,'calendar','music',null,null],
      [null,null,null,null,null,null,null,null,'camera','gallery','email',null],
      [null,null,null,null,null,null,null,null,'camera',null,null,'google'],
      [null,null,null,null,null,null,null,null,'email','camera','clock',null],
      [null,null,null,null,null,null,null,null,'calculator','settings',null,null]
    ].map(page => [null, null, null, null, ...page]),
    homeWidgets: [
      [{ id: 'default-clock', type: 'digital', x: 1, y: 0 }],
      [{ id: 'default-weather', type: 'weather', x: 1, y: 0 }],
      [{ id: 'default-analog', type: 'analog', x: 1, y: 0 }],
      [{ id: 'default-music', type: 'music', x: 1, y: 0 }],
      [{ id: 'default-calendar', type: 'calendar', x: 1, y: 0 }]
    ],
    dock: ['phone', 'people', 'apps', 'messaging', 'browser'],
    settings: { wifi: true, wifiNetwork: 'AndroidAP', wifiNotify: true, bluetooth: false, bluetoothVisible: false, pairedDevice: '', airplane: false, nfc: true, androidBeam: true, wifiDirect: false, portableHotspot: false, dataEnabled: true, dataRoaming: false, developerUnlocked: false, silent: false, rotate: true, brightness: 68, autoSync: true, networkLocation: true, gps: false, visiblePasswords: false, unknownSources: false, backup: true, autoRestore: true, largeText: false, speakPasswords: false, usbDebug: false, stayAwake: false, mockLocations: false, showTouches: false },
    contacts: [
      { id: 1, name: 'Alex Morgan', phone: '202-555-0148', email: 'alex@example.com' },
      { id: 2, name: 'Sam Rivera', phone: '202-555-0192', email: 'sam@example.com' },
      { id: 3, name: 'Taylor Lee', phone: '202-555-0116', email: 'taylor@example.com' },
      { id: 4, name: 'Mom', phone: '202-555-0107', email: 'mom@example.com' }
    ],
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
    events: [{ id: 1, date: new Date().toISOString().slice(0, 10), title: 'Coffee with Alex', time: '11:00' }],
    alarms: [{ id: 1, time: '07:00', enabled: true }, { id: 2, time: '08:30', enabled: false }],
    bookmarks: ['www.google.com', 'www.android.com', 'en.wikipedia.org/wiki/Android'],
    browserHistory: ['www.google.com'],
    sentEmails: [],
    notifications: [
      { id: 1, title: 'Welcome to Android 4.0.4', detail: 'Your phone is ready to explore.' },
      { id: 2, title: 'New message from Alex', detail: 'See you at 11!' }
    ]
  };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (!saved) return clone(defaultData);
      const result = { ...clone(defaultData), ...saved, settings: { ...defaultData.settings, ...saved.settings } };
      if (JSON.stringify(result.homePages?.[2]) === JSON.stringify([null,null,null,null,null,null,null,null,'calendar','gallery','settings','music'])) result.homePages[2] = clone(defaultData.homePages[2]);
      result.homePages = result.homePages.map(page => page.length === 12 ? [null, null, null, null, ...page] : page);
      if (!Array.isArray(saved.homeWidgets)) result.homeWidgets = clone(defaultData.homeWidgets);
      if (result.wallpaper === 4 && result.customWallpaper) result.wallpaper = 11;
      return result;
    } catch { return clone(defaultData); }
  }
  let data = load();
  function save() { try { localStorage.setItem(STORE, JSON.stringify(data)); } catch {} }
  const ui = {
    view: 'home', sub: '', page: 2, drawerTab: 'apps', drawerPage: 0, overlay: '',
    selectedContact: 1, thread: 1, selectedPhoto: 1,
    dial: '', callNumber: '', aboutTaps: 0, buildTaps: 0, easterNyan: false, settingsRootScroll: 0,
    browserUrl: data.browserHistory.at(-1) || 'www.google.com', browserHistory: [...data.browserHistory], browserIndex: data.browserHistory.length - 1, browserTabs: [data.browserHistory.at(-1) || 'www.google.com'], browserTab: 0,
    calendarDate: new Date(), selectedDate: new Date().toISOString().slice(0, 10),
    calc: '0', calcOperator: '', calcMemory: null, calcFresh: true,
    musicPlaying: false, musicTrack: 0, musicPosition: 0,
    emailId: 1, recent: [], recentSnapshots: {}, toastTimer: null, wifiTarget: '', bluetoothScanned: false
  };
  const emailData = [
    { id: 1, from: 'Android Team', subject: 'Welcome to Android', body: 'Your Galaxy Nexus is ready. Explore the new look of Android 4.0, customize your home screen, and discover the little surprise hidden in Settings.', time: '9:41 AM' },
    { id: 2, from: 'Alex Morgan', subject: 'Photos from the weekend', body: 'I added a few pictures to our album. Take a look when you have a moment!', time: 'Yesterday' },
    { id: 3, from: 'Calendar', subject: 'Coffee with Alex', body: 'Reminder: Coffee with Alex at 11:00.', time: 'Yesterday' }
  ];
  const tracks = [
    { title: 'Blue Horizon', artist: 'The Demo Tapes' },
    { title: 'Afterglow', artist: 'The Demo Tapes' },
    { title: 'Night Drive', artist: 'The Demo Tapes' }
  ];
  const apps = [
    ['phone', 'Phone', '☎', '#3dc484', '#217258'], ['people', 'People', '◉', '#efa96f', '#a45142'],
    ['messaging', 'Messaging', '✉', '#84cf62', '#428c43'], ['browser', 'Browser', '◎', '#65aee2', '#246ba8'],
    ['camera', 'Camera', '▣', '#c8cbd0', '#6b7a87'], ['gallery', 'Gallery', '▧', '#e9b674', '#8d673c'],
    ['settings', 'Settings', '⚙', '#b7c5ce', '#53606f'], ['clock', 'Clock', '◷', '#71b7dc', '#3d6e8d'],
    ['calendar', 'Calendar', '31', '#7ec7e7', '#397c9e'], ['calculator', 'Calculator', '＋', '#7cb4bd', '#32727f'],
    ['music', 'Music', '♫', '#fd9e70', '#c25360'], ['email', 'Email', '✉', '#75b7df', '#326b9e']
  ];
  const wifiNetworks = [
    { name: 'AndroidAP', security: 'WPA2', strength: 4 },
    { name: 'CoffeeShop', security: 'Open', strength: 3 },
    { name: 'Home Network', security: 'WPA2', strength: 4 },
    { name: 'Library Wi-Fi', security: 'Open', strength: 2 }
  ];
  const wallpaperFiles = ['chroma','architecture','bubblegum','canyon','escape','fidelity','flora','kepler','leaf','noir','outofthebox'];
  const widgetTypes = [
    { type: 'analog', name: 'Analog clock', app: 'clock' },
    { type: 'digital', name: 'Digital clock', app: 'clock' },
    { type: 'calendar', name: 'Calendar', app: 'calendar' },
    { type: 'weather', name: 'Weather', app: 'browser' },
    { type: 'music', name: 'Music', app: 'music' },
    { type: 'photo', name: 'Photo frame', app: 'gallery' }
  ];
  const iconAssets = new Set(['phone', 'people', 'messaging', 'browser', 'camera', 'gallery', 'settings', 'clock', 'calendar', 'calculator', 'music', 'email', 'apps']);
  const i18n = window.AndroidI18n;
  const appNames = Object.fromEntries(apps.map(app => [app[0], app[1]]));
  appNames.google = 'Google';
  const screen = document.querySelector('#screen');
  const viewport = document.querySelector('#viewport');
  const statusRoot = document.querySelector('#status-bar');
  const navRoot = document.querySelector('#nav-bar');
  const overlayRoot = document.querySelector('#overlay-root');
  const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const today = () => new Date().toISOString().slice(0, 10);
  const clock = () => new Date().toLocaleTimeString(i18n.locale(), { hour: 'numeric', minute: '2-digit', hour12: false });
  const fullDate = () => new Date().toLocaleDateString(i18n.locale(), { weekday: 'long', month: 'long', day: 'numeric' });
  const shadeDate = () => new Date().toLocaleDateString(i18n.locale(), { weekday: 'short', month: 'short', day: 'numeric' });
  const contact = id => data.contacts.find(item => item.id === Number(id));
  const appIcon = id => {
    if (id === 'apps') return '<span class="app-icon"><img src="assets/apps.png" alt=""></span>';
    if (id === 'google') return '<span class="app-icon google-folder-icon"><img src="assets/browser.png" alt=""><img src="assets/email.png" alt=""><img src="assets/calendar.png" alt=""><img src="assets/gallery.png" alt=""></span>';
    const item = apps.find(app => app[0] === id);
    if (!item) return '';
    return iconAssets.has(id)
      ? `<span class="app-icon"><img src="assets/${id}.png" alt=""></span>`
      : `<span class="app-icon fallback" style="--icon-light:${item[3]};--icon-dark:${item[4]}">${item[2]}</span>`;
  };
  const launcherIcon = id => `<button class="launcher-icon" data-action="${id === 'apps' ? 'drawer' : id === 'google' ? 'google-folder' : 'open-app'}" ${id === 'apps' ? '' : `data-app="${id}"`} aria-label="${safe(appNames[id] || 'Apps')}">${appIcon(id)}<span>${safe(appNames[id] || 'Apps')}</span></button>`;
  const actionbar = (title, right = '') => `<div class="actionbar"><button class="up" data-action="back" aria-label="Back">${ui.view === 'settings' && (!ui.sub || ui.sub === 'about' || ui.sub === 'wireless') ? '<img class="settings-header-icon" src="assets/settings.png" alt="">' : '‹'}</button><h2>${safe(title)}</h2>${right}</div>`;
  const content = (inner, theme = '') => `<div class="app-content ${theme}">${inner}</div>`;
  const appView = (title, inner, theme = '', right = '') => `<div class="app-view ${ui.view === 'settings' ? `settings-app ${!ui.sub ? 'settings-main' : ''}` : ''}">${actionbar(title, right)}${content(inner, ui.view === 'settings' ? `settings-dark ${theme}` : theme)}</div>`;
  const settingIcon = (id, fallback) => ui.view === 'settings' && ['wireless','bluetooth','data','sound','display','storage','battery','apps','language','date','about','sync','location','security','backup','accessibility','development'].includes(id) ? `<img src="assets/setting-${id}.png${id === 'bluetooth' ? '?v=2' : ''}" alt="">` : fallback;
  const row = (title, subtitle, action, id, icon = '') => `<button class="settings-row" data-action="${action}" data-id="${safe(id)}"><span class="row-icon">${icon === null ? '' : settingIcon(id, icon)}</span><span class="row-copy">${safe(title)}${subtitle ? `<small>${safe(subtitle)}</small>` : ''}</span><span class="chevron">›</span></button>`;
  const toggleRow = (title, subtitle, key, icon = '') => `<button class="settings-row" data-action="toggle-setting" data-id="${key}" aria-pressed="${data.settings[key]}"><span class="row-icon">${settingIcon(key === 'wifi' ? 'wireless' : key, icon)}</span><span class="row-copy">${safe(title)}${subtitle ? `<small>${safe(subtitle)}</small>` : ''}</span><span class="switch ${data.settings[key] ? 'on' : ''}"><span>${data.settings[key] ? 'ON' : 'OFF'}</span></span></button>`;
  const connectivitySwitch = (key, title, inHeader = false) => `<button class="holo-switch ${data.settings[key] ? 'on' : ''} ${inHeader ? 'settings-action-switch' : ''}" data-action="toggle-setting" data-id="${key}" role="switch" aria-label="${safe(title)}" aria-checked="${data.settings[key]}"><span class="switch-label" aria-hidden="true">${data.settings[key] ? 'ON' : 'OFF'}</span></button>`;
  const connectivityRow = (title, key) => `<div class="settings-row connectivity-row"><button class="connectivity-open" data-action="settings-sub" data-id="${key}"><span class="row-icon">${settingIcon(key === 'wifi' ? 'wireless' : key, '')}</span><span class="row-copy">${safe(title)}</span></button>${connectivitySwitch(key, title)}</div>`;
  const wirelessRow = (title, subtitle, id) => `<button class="settings-row wireless-row" data-action="settings-sub" data-id="${id}"><span class="row-copy">${safe(title)}${subtitle ? `<small>${safe(subtitle)}</small>` : ''}</span></button>`;
  const wirelessCheckRow = (title, subtitle, key) => `<button class="settings-row wireless-row" data-action="toggle-setting" data-id="${key}" aria-pressed="${data.settings[key]}"><span class="row-copy">${safe(title)}${subtitle ? `<small>${safe(subtitle)}</small>` : ''}</span><span class="check-box ${data.settings[key] ? 'checked' : ''}" aria-hidden="true">${data.settings[key] ? '✓' : ''}</span></button>`;
  const label = text => `<div class="section-label">${safe(text)}</div>`;
  const statusIndicators = (extraClass = '') => `<span class="status-right ${extraClass}">${data.settings.bluetooth ? '<img class="status-bluetooth" src="assets/stat_sys_data_bluetooth.png" alt="">' : ''}${data.settings.airplane ? '<img src="assets/stat_sys_signal_flightmode.png" alt="">' : `<img src="assets/stat_sys_wifi_signal_4_fully.png" alt="" class="${data.settings.wifi ? '' : 'status-hidden'}"><img src="assets/stat_sys_signal_4_fully.png" alt="">`}<img class="status-battery" src="assets/stat_sys_battery_71.png" alt=""><span class="status-clock">${clock()}</span></span>`;

  function renderStatus() {
    const notificationIcons = data.notifications.length ? `${data.notifications.some(item => item.id === 2) ? '<img src="assets/stat_notify_sms.png" alt="">' : ''}${data.notifications.some(item => item.id !== 2) ? '<img src="assets/stat_notify_more.png" alt="">' : ''}` : '';
    statusRoot.innerHTML = `<button class="status-button" data-action="shade" aria-label="Open notifications"><span class="status-left">${notificationIcons}</span>${statusIndicators()}</button>`;
    i18n.translateDOM(statusRoot);
  }
  function renderNav() {
    navRoot.innerHTML = `<button class="nav-key nav-back" data-action="back" aria-label="Back"><img src="assets/nav-back.png" alt=""></button><button class="nav-key nav-home" data-action="home" aria-label="Home screen"><img src="assets/nav-home.png" alt=""></button><button class="nav-key nav-recent" data-action="recent" aria-label="Recent apps"><img src="assets/nav-recent.png" alt=""></button>`;
  }
  function render() {
    screen.className = `screen wallpaper-${data.wallpaper}${data.settings.largeText ? ' large-text' : ''}`;
    screen.style.background = data.wallpaper === 11 && data.customWallpaper ? `linear-gradient(160deg, ${data.customWallpaper[0]}, ${data.customWallpaper[1]} 53%, ${data.customWallpaper[2]})` : `#080d14 url('assets/wallpaper_${wallpaperFiles[data.wallpaper] || 'chroma'}.jpg') center center / cover no-repeat`;
    screen.style.filter = `brightness(${.5 + data.settings.brightness / 135})`;
    renderStatus(); renderNav();
    if (ui.view === 'lock') viewport.innerHTML = renderLock();
    else if (ui.view === 'home') viewport.innerHTML = renderHome();
    else if (ui.view === 'drawer') viewport.innerHTML = renderDrawer();
    else viewport.innerHTML = renderApp();
    renderOverlay();
    i18n.translateDOM(screen);
  }
  function renderLock() {
    return `<div class="lock-view"><div class="lock-clock"><div class="lock-time">${clock()}</div><div class="lock-date">${fullDate()}</div></div><div class="lock-wave"><div class="lock-outer-ring"></div><button class="lock-target lock-target-unlock" data-action="unlock" aria-label="Unlock"><img src="assets/ic_lockscreen_unlock_normal.png" alt=""></button><button class="lock-target lock-target-camera" data-action="unlock-camera" aria-label="Camera"><img src="assets/ic_lockscreen_camera_normal.png" alt=""></button><button class="lock-handle" data-action="unlock" aria-label="Slide to unlock"><img src="assets/ic_lockscreen_handle_normal.png" alt=""></button></div><div class="lock-carrier">Android</div></div>`;
  }
  function analogClock() {
    const now = new Date();
    return `<div class="analog-clock" aria-label="${clock()}">${Array.from({length: 12}, (_, i) => `<i class="clock-dot" style="transform:rotate(${i * 30}deg) translateY(-44px)"></i>`).join('')}<i class="clock-hand hour" style="transform:rotate(${(now.getHours() % 12) * 30 + now.getMinutes() / 2}deg)"></i><i class="clock-hand minute" style="transform:rotate(${now.getMinutes() * 6}deg)"></i><i class="clock-pivot"></i></div>`;
  }
  function widgetArt(type) {
    if (type === 'analog') return analogClock();
    if (type === 'digital') return `<strong class="widget-time">${clock()}</strong><span>${fullDate()}</span>`;
    if (type === 'calendar') return `<strong class="widget-date">${new Date().getDate()}</strong><span>${data.events[0]?.title || 'No events'}</span>`;
    if (type === 'weather') return '<strong class="widget-weather">☀ 22°</strong><span>Sunny · San Francisco</span>';
    if (type === 'music') return `<strong class="widget-music">♫</strong><span>${safe(tracks[ui.musicTrack].title)}</span><small>${safe(tracks[ui.musicTrack].artist)}</small>`;
    return `<span class="widget-photo" style="background:${photoStyle(data.photos[0] || {colors:['#31678a','#c5a083','#191c36']})}"></span>`;
  }
  const homeWidget = widget => `<div class="home-widget widget-${widget.type}" data-widget-id="${safe(widget.id)}" style="grid-column:${widget.x + 1}/span 2;grid-row:${widget.y + 1}/span 2"><button data-action="open-app" data-app="${widgetTypes.find(item => item.type === widget.type)?.app || 'gallery'}" aria-label="${safe(widgetTypes.find(item => item.type === widget.type)?.name || 'Widget')}">${widgetArt(widget.type)}</button></div>`;
  const wallpaperChoices = () => `<div class="wallpaper-grid">${wallpaperFiles.map((name, i) => `<button class="wallpaper-choice ${data.wallpaper === i ? 'selected' : ''}" data-action="wallpaper" data-id="${i}" aria-label="${safe(name)}"><span class="wallpaper-swatch" style="background-image:url('assets/wallpaper_${name}.jpg')"></span><strong>${safe(name[0].toUpperCase() + name.slice(1))}</strong></button>`).join('')}</div>`;
  function renderHome() {
    return `<div class="home-view"><button class="home-search" data-action="browser-search" aria-label="Search"><span class="google-word">Google</span><img class="search-microphone" src="assets/ic_btn_speak_now.png" alt=""></button><div class="home-content"><div class="home-grid">${data.homePages[ui.page].map((id, slot) => `<div class="home-slot" data-home-slot="${slot}">${id ? launcherIcon(id) : ''}</div>`).join('')}${data.homeWidgets[ui.page].map(homeWidget).join('')}</div></div><div class="page-indicators">${Array.from({ length: 5 }, (_, i) => `<button class="${i === ui.page ? 'active' : ''}" data-action="page" data-id="${i}" aria-label="Home screen ${i + 1}"></button>`).join('')}</div><div class="dock">${data.dock.map((id, slot) => `<div class="dock-slot" data-dock-slot="${slot}">${id ? launcherIcon(id) : ''}</div>`).join('')}</div><div class="drag-remove" data-drop-remove="true">× Remove</div></div>`;
  }
  function renderDrawer() {
    const isApps = ui.drawerTab === 'apps';
    const pages = Math.ceil((isApps ? apps.length : widgetTypes.length) / (isApps ? 20 : 4));
    const current = Math.min(ui.drawerPage, pages - 1);
    const items = isApps ? apps.slice(current * 20, current * 20 + 20).map(app => launcherIcon(app[0])).join('') : widgetTypes.slice(current * 4, current * 4 + 4).map(widget => `<button class="drawer-widget" data-action="add-widget" data-widget-type="${widget.type}" aria-label="${safe(widget.name)}"><span class="drawer-widget-title">${safe(widget.name)} <small>2 × 2</small></span><span class="drawer-widget-preview widget-${widget.type}">${widgetArt(widget.type)}</span></button>`).join('');
    return `<div class="drawer-view"><div class="drawer-tabs"><button class="${isApps ? 'active' : ''}" data-action="drawer-tab" data-id="apps">Apps</button><button class="${!isApps ? 'active' : ''}" data-action="drawer-tab" data-id="widgets">Widgets</button><button class="drawer-market" data-action="market" aria-label="Shop"><img src="assets/ic_launcher_market_holo.png" alt=""></button></div><div class="drawer-page ${isApps ? 'drawer-apps' : 'drawer-widgets'}">${items}</div><div class="drawer-indicators">${Array.from({length:pages},(_,i)=>`<button class="${i===current?'active':''}" data-action="drawer-page" data-id="${i}" aria-label="Page ${i+1}"></button>`).join('')}</div></div>`;
  }
  function widgetFits(page, x, y, ignoredId = '') {
    if (x < 0 || y < 0 || x > 2 || y > 2) return false;
    for (let row = y; row < y + 2; row++) for (let column = x; column < x + 2; column++) {
      if (data.homePages[page][row * 4 + column]) return false;
    }
    return !data.homeWidgets[page].some(widget => widget.id !== ignoredId && x < widget.x + 2 && x + 2 > widget.x && y < widget.y + 2 && y + 2 > widget.y);
  }
  function addWidget(type, x = null, y = null) {
    const spots = x === null ? Array.from({length:9}, (_, i) => [i % 3, Math.floor(i / 3)]) : [[x,y]];
    const spot = spots.find(([column,row]) => widgetFits(ui.page, column, row));
    if (!spot) return false;
    data.homeWidgets[ui.page].push({id:`widget-${Date.now()}`,type,x:spot[0],y:spot[1]});
    save(); return true;
  }
  function renderApp() {
    switch (ui.view) {
      case 'wallpaper-picker': return `<div class="app-view wallpaper-picker"><div class="actionbar"><button class="up" data-action="back" aria-label="Back">‹</button><h2>Wallpapers</h2></div><div class="app-content dark">${wallpaperChoices()}</div></div>`;
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
  function openApp(app) {
    if (!appNames[app]) return;
    captureRecentView();
    ui.view = app; ui.sub = ''; ui.overlay = ''; if (app === 'settings') ui.settingsRootScroll = 0;
    ui.recent = [app, ...ui.recent.filter(id => id !== app)].slice(0, 7);
    render();
  }
  function captureRecentView() {
    if (appNames[ui.view] && viewport.firstElementChild) ui.recentSnapshots[ui.view] = viewport.innerHTML;
  }
  function home(resetPage = true) { captureRecentView(); ui.view = 'home'; ui.sub = ''; ui.overlay = ''; if (resetPage) ui.page = 2; render(); }
  function back() {
    if (ui.overlay) { ui.overlay = ''; render(); return; }
    if (ui.view === 'lock') return;
    if (ui.view === 'drawer' || ui.view === 'wallpaper-picker') { home(false); return; }
    if (ui.view === 'browser' && !ui.sub && ui.browserIndex > 0) { browserBack(); return; }
    if (ui.view === 'settings' && ['easter', 'about-status', 'about-legal', 'about-safety'].includes(ui.sub)) { ui.sub = 'about'; ui.easterNyan = false; render(); return; }
    if (ui.view === 'settings' && ['vpn', 'tethering', 'beam', 'mobile-networks'].includes(ui.sub)) { ui.sub = 'wireless'; render(); return; }
    if (ui.view === 'settings' && ui.sub === 'wifi-advanced') { ui.sub = 'wifi'; render(); return; }
    if (ui.view === 'settings' && ui.sub === 'sync-google') { ui.sub = 'sync'; render(); return; }
    if (ui.view === 'settings' && ui.sub === 'reset-info') { ui.sub = 'backup'; render(); return; }
    if (ui.sub) { ui.sub = ''; render(); if (ui.view === 'settings') viewport.querySelector('.settings-app').scrollTop = ui.settingsRootScroll; return; }
    home(false);
  }
  function toast(message) {
    document.querySelector('.toast')?.remove();
    const element = document.createElement('div'); element.className = 'toast'; element.textContent = i18n.t(message);
    screen.append(element);
    clearTimeout(ui.toastTimer); ui.toastTimer = setTimeout(() => element.remove(), 2500);
  }
  function renderOverlay() {
    if (ui.overlay === 'shade') {
      overlayRoot.innerHTML = `<div class="notification-shade"><div class="shade-top"><span class="shade-date">${shadeDate()}</span><button data-action="open-app" data-app="settings" aria-label="Settings"><img src="assets/ic_notify_quicksettings_normal.png" alt=""></button>${statusIndicators('shade-status')}${data.notifications.length ? '<button data-action="clear-notifications" aria-label="Clear notifications"><img src="assets/ic_notify_clear_normal.png" alt=""></button>' : ''}</div><div class="shade-divider"></div><div class="shade-list">${data.notifications.map(n => `<button class="notification" data-action="notification-open" data-id="${n.id}"><span class="notification-icon"><img src="assets/${n.id === 2 ? 'stat_notify_sms.png' : 'settings.png'}" alt=""></span><span><strong>${safe(n.title)}</strong><small>${safe(n.detail)}</small></span></button>`).join('')}</div></div>`;
    } else if (ui.overlay === 'recent') {
      overlayRoot.innerHTML = `<div class="recent-panel" data-action="close-overlay">${ui.recent.length ? `<div class="recent-list">${[...ui.recent].reverse().map(id => `<div class="recent-item" data-action="open-app" data-app="${id}" role="button" tabindex="0" aria-label="${appNames[id]}"><span class="recent-label">${appNames[id]}</span><span class="recent-thumbnail" aria-hidden="true"><span class="recent-thumbnail-inner" inert>${ui.recentSnapshots[id] || `<div class="recent-fallback">${appIcon(id)}</div>`}</span></span><span class="recent-app-icon" aria-hidden="true">${appIcon(id)}</span></div>`).join('')}</div>` : '<p class="recent-empty">No recent apps</p>'}</div>`;
    } else if (ui.overlay === 'wifi-dialog') {
      const network = wifiNetworks.find(item => item.name === ui.wifiTarget);
      const connected = data.settings.wifiNetwork === ui.wifiTarget;
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(ui.wifiTarget)}"><h3>${safe(ui.wifiTarget)}</h3><p>${safe(network?.security || 'WPA2')}</p>${connected ? '<p>Connected</p>' : network?.security !== 'Open' ? '<label>Password<input class="wifi-password" type="password" autocomplete="off"></label>' : ''}<div class="settings-dialog-actions"><button data-action="close-overlay">Cancel</button>${connected ? '<button data-action="wifi-forget">Forget</button>' : '<button data-action="wifi-connect">Connect</button>'}</div></div>`;
    } else if (ui.overlay === 'wallpaper-source') {
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="wallpaper-source" role="dialog" aria-label="Select wallpaper from"><h3>Select wallpaper from</h3><button data-action="open-wallpapers">Wallpapers</button><button data-action="gallery-wallpaper">Gallery</button></div>`;
    } else if (ui.overlay === 'google-folder') {
      overlayRoot.innerHTML = `<div class="folder-scrim" data-action="close-overlay"></div><div class="home-folder"><h3>Google</h3><div>${['browser','email','calendar','gallery'].map(id => launcherIcon(id)).join('')}</div></div>`;
    } else overlayRoot.innerHTML = '';
    i18n.translateDOM(overlayRoot);
  }

  function renderSettings() {
    const s = ui.sub;
    if (s === 'wifi') return appView('Wi-Fi', `<div class="connectivity-page">${data.settings.wifi ? `${label('WI-FI NETWORKS')}${wifiNetworks.map(network => `<button class="settings-row network-row" data-action="wifi-network" data-id="${safe(network.name)}"><span class="network-signal"><img src="assets/setting-wireless.png" alt=""></span><span class="row-copy">${safe(network.name)}<small>${data.settings.wifiNetwork === network.name ? 'Connected' : network.security === 'Open' ? 'Open network' : `Secured with ${network.security}`}</small></span></button>`).join('')}${row('Advanced', '', 'settings-sub', 'wifi-advanced', null)}` : '<p class="connectivity-empty">Turn on Wi-Fi to see available networks</p>'}</div>`, '', connectivitySwitch('wifi', 'Wi-Fi', true));
    if (s === 'wifi-advanced') return appView('Advanced Wi-Fi', `${wirelessCheckRow('Network notification', 'Notify me when an open network is available', 'wifiNotify')}${row('Keep Wi-Fi on during sleep', 'Always', 'toast', 'Always', null)}`, 'wireless-more');
    if (s === 'bluetooth') return appView('Bluetooth', `<div class="connectivity-page">${data.settings.bluetooth ? `${wirelessCheckRow('Make device visible', 'Visible to nearby Bluetooth devices', 'bluetoothVisible')}${label('PAIRED DEVICES')}${data.settings.pairedDevice ? `<button class="settings-row network-row" data-action="bluetooth-pair" data-id="${safe(data.settings.pairedDevice)}"><span class="network-signal">ᛒ</span><span class="row-copy">${safe(data.settings.pairedDevice)}<small>Paired · tap to unpair</small></span></button>` : '<p class="connectivity-empty small">No paired devices</p>'}${label('AVAILABLE DEVICES')}${ui.bluetoothScanned ? ['Wireless Headset','Car Audio'].filter(name => name !== data.settings.pairedDevice).map(name => `<button class="settings-row network-row" data-action="bluetooth-pair" data-id="${safe(name)}"><span class="network-signal">ᛒ</span><span class="row-copy">${safe(name)}<small>Tap to pair</small></span></button>`).join('') : '<p class="connectivity-empty small">Tap Scan to find nearby devices</p>'}` : '<p class="connectivity-empty">Turn on Bluetooth to see nearby devices</p>'}</div>`, '', `${connectivitySwitch('bluetooth', 'Bluetooth', true)}${data.settings.bluetooth ? '<button class="settings-scan" data-action="bluetooth-scan">Scan</button>' : ''}`);
    if (s === 'wallpaper') {
      return appView('Wallpaper', wallpaperChoices());
    }
    if (s === 'about') return appView('About phone', `${row('Status', 'Phone number, signal, etc.', 'settings-sub', 'about-status')}${row('Legal information', '', 'settings-sub', 'about-legal')}${row('Model number', 'Galaxy Nexus', 'noop', '')}${row('Android version', '4.0.4', 'about-tap', '')}${row('Baseband version', 'I9250XXLA02', 'noop', '')}${row('Kernel version', '3.0.8-g034fec9\nandroid-build@vpbs1 #1\nTue Mar 13 15:46:20 PDT 2012', 'noop', '')}${row('Build number', 'IMM76D', 'developer-tap', '')}`, 'about-settings');
    if (s === 'about-status') return appView('Status', `${row('Phone number', 'Unknown', 'noop', '')}${row('Network', 'AndroidAP', 'noop', '')}${row('Signal strength', 'Good', 'noop', '')}${row('Battery level', '78%', 'noop', '')}`, 'about-settings');
    if (s === 'about-legal') return appView('Legal information', `${row('Open source licenses', 'Android Open Source Project', 'noop', '')}${row('Google legal', 'Offline demonstration', 'noop', '')}`, 'about-settings');
    if (s === 'about-safety') return appView('Safety information', `<div class="detail-pad"><p>Galaxy Nexus safety information is not available in this offline simulation.</p></div>`, 'about-settings');
    if (s === 'easter') return `<div class="easter-view">${ui.easterNyan ? `<div class="nyan-sky" data-action="back" role="button" tabindex="0" aria-label="Close Nyandroid">${Array.from({length:20}, (_, i) => `<span class="nyan-star" style="--x:${(i * 47) % 97}%;--y:${(i * 31) % 93}%;--delay:-${(i * 7) % 12 / 10}s"></span>`).join('')}${Array.from({length:20}, (_, i) => `<span class="nyan-cat" style="--top:${(i * 37) % 89}%;--delay:-${(i * 13) % 91 / 10}s;--duration:${5 + i % 6}s;--size:${58 + i % 4 * 18}px"></span>`).join('')}</div>` : '<button class="easter-robot" data-action="egg-nyan" aria-label="Android easter egg"><img src="assets/platlogo.png" alt="Ice Cream Sandwich Android"></button>'}</div>`;
    if (s === 'wireless') return appView('Wireless & networks', `${wirelessCheckRow('Airplane mode', '', 'airplane')}${wirelessRow('VPN', '', 'vpn')}${wirelessRow('Tethering & portable hotspot', '', 'tethering')}${wirelessCheckRow('NFC', 'Allow data exchange when the phone touches another device', 'nfc')}${wirelessRow('Android Beam', 'Ready to transmit app content via NFC', 'beam')}${wirelessCheckRow('WiFi direct', '', 'wifiDirect')}${wirelessRow('Mobile networks', '', 'mobile-networks')}`, 'wireless-more');
    if (s === 'vpn') return appView('VPN', `<div class="detail-pad"><p>No VPN networks configured</p></div>`);
    if (s === 'tethering') return appView('Tethering & portable hotspot', `${wirelessCheckRow('Portable Wi-Fi hotspot', '', 'portableHotspot')}`, 'wireless-more');
    if (s === 'beam') return appView('Android Beam', `${wirelessCheckRow('Android Beam', 'Ready to transmit app content via NFC', 'androidBeam')}`, 'wireless-more');
    if (s === 'mobile-networks') return appView('Mobile networks', `${wirelessCheckRow('Data enabled', '', 'dataEnabled')}${wirelessCheckRow('Data roaming', '', 'dataRoaming')}`, 'wireless-more');
    if (s === 'sound') return appView('Sound', `${toggleRow('Silent mode', 'Mute all sounds except media', 'silent', '♫')}${row('Volumes', 'Ringtone 70% · Media 60%', 'settings-sub', 'volumes', '◖')}${row('Phone ringtone', 'Orion', 'settings-sub', 'ringtone', '♫')}`);
    if (s === 'display') return appView('Display', `${row('Brightness', `${data.settings.brightness}%`, 'settings-sub', 'brightness', '☼')}${row('Wallpaper', 'Choose your background', 'settings-sub', 'wallpaper', '▧')}${toggleRow('Auto-rotate screen', '', 'rotate', '↻')}${row('Sleep', 'After 30 seconds of inactivity', 'settings-sub', 'sleep', '◷')}`);
    if (s === 'brightness') return appView('Brightness', `<div class="detail-pad"><h3>Brightness</h3><input type="range" min="10" max="100" value="${data.settings.brightness}" data-field="brightness" aria-label="Brightness"><p>${data.settings.brightness}%</p></div>`);
    if (s === 'data') return appView('Data usage', `<div class="detail-pad"><h3>Mobile data</h3><p>284 MB used this month</p><div style="height:100px;background:linear-gradient(160deg,transparent 49%,#45b6d2 50%,#45b6d2 52%,transparent 53%),linear-gradient(#d4edf4,#e7e7e7);border-bottom:1px solid #555"></div><p>Browser 124 MB · Email 48 MB · Other 112 MB</p></div>`);
    if (s === 'storage') return appView('Storage', `<div class="detail-pad"><h3>Internal storage</h3><p>Used: 3.4 GB of 16 GB</p><div style="height:14px;background:linear-gradient(90deg,#42b5d2 22%,#ddd 22%);"></div><p>Apps 1.8 GB · Pictures 0.8 GB · Other 0.8 GB</p></div>`);
    if (s === 'battery') {
      const usage = [['Screen',21,'☼'],['Android System',11,'◉'],['Phone idle',10,'◷'],['Cell standby',9,'◢'],['Gmail',9,'✉'],['Android OS',9,'◉']];
      return appView('Battery', `<div class="battery-page"><div class="battery-state">78% · <span>Discharging</span></div><div class="battery-chart"><span>2h 20m 14s on battery</span></div>${usage.map(([name,percent,icon]) => `<div class="battery-usage"><span class="battery-usage-icon">${icon}</span><div class="battery-usage-body"><div class="battery-usage-name">${name}<span>${percent}%</span></div><div class="battery-meter"><i style="width:${percent * 4}%"></i></div></div></div>`).join('')}</div>`);
    }
    if (s === 'apps') return appView('Apps', `${apps.map(a => row(a[1], 'Installed', 'open-app', a[0], a[2])).join('')}`);
    if (s === 'sync') return appView('Accounts & sync', `${toggleRow('Auto-sync', 'Sync app data automatically', 'autoSync', '↻')}${label('ACCOUNTS')}${row('Google', 'demo@android.local', 'settings-sub', 'sync-google', '◎')}${row('Add account', '', 'toast', 'Demo account already added', '+')}`);
    if (s === 'sync-google') return appView('Google', `<div class="detail-pad"><h3>demo@android.local</h3><p>Sample account data is stored only in this browser.</p></div>${row('Sync Gmail', 'Last synced today', 'noop', '', '✉')}${row('Sync Calendar', 'Last synced today', 'noop', '', '▦')}${row('Sync Contacts', 'Last synced today', 'noop', '', '◉')}`);
    if (s === 'location') return appView('Location services', `${toggleRow("Google's location service", 'Let apps use approximate location', 'networkLocation', '◎')}${toggleRow('GPS satellites', 'Let apps use precise location', 'gps', '◉')}`);
    if (s === 'security') return appView('Security', `${label('SCREEN SECURITY')}${row('Screen lock', 'Slide', 'toast', 'Slide lock is active', '◉')}${label('PASSWORDS')}${toggleRow('Make passwords visible', 'Show password characters as you type', 'visiblePasswords', '◉')}${label('DEVICE ADMINISTRATION')}${toggleRow('Unknown sources', 'Allow installation of non-Market apps', 'unknownSources', '◉')}`);
    if (s === 'backup') return appView('Backup & reset', `${label('BACKUP & RESTORE')}${toggleRow('Back up my data', 'Back up app data and settings', 'backup', '↻')}${toggleRow('Automatic restore', 'Restore settings when reinstalling apps', 'autoRestore', '↻')}${label('PERSONAL DATA')}${row('Factory data reset', 'Erase local simulator data', 'settings-sub', 'reset-info', '⚠')}`);
    if (s === 'reset-info') return appView('Factory data reset', `<div class="detail-pad"><h3>Erase local simulator data</h3><p>This clears the saved home screens, settings, and sample content for this version.</p><button class="small-button" data-action="factory-reset">Reset simulator</button></div>`);
    if (s === 'accessibility') return appView('Accessibility', `${label('SERVICES')}${row('No services installed', '', 'noop', '', '')}${label('SYSTEM')}${toggleRow('Large text', 'Use larger text in Settings', 'largeText', 'A')}${toggleRow('Auto-rotate screen', '', 'rotate', '↻')}${toggleRow('Speak passwords', 'Speak password characters as you type', 'speakPasswords', '◉')}`);
    if (s === 'development') return appView('Developer options', `${toggleRow('USB debugging', 'Debug mode when USB is connected', 'usbDebug', '⚙')}${toggleRow('Stay awake', 'Screen will never sleep while charging', 'stayAwake', '◷')}${toggleRow('Allow mock locations', 'Permit mock locations', 'mockLocations', '◎')}${label('USER INTERFACE')}${toggleRow('Show touches', 'Show visual feedback for touches', 'showTouches', '◉')}`);
    if (s === 'language') return appView('Language & input', `<div class="detail-pad"><h3>Language</h3><div class="language-options">${[['en','English'],['hu','Magyar'],['de','Deutsch'],['fr','Français'],['es','Español']].map(([code,name]) => `<button class="language-choice ${i18n.language === code ? 'selected' : ''}" data-action="set-language" data-id="${code}" aria-pressed="${i18n.language === code}">${name}<span>${i18n.language === code ? '✓' : ''}</span></button>`).join('')}</div></div>${row('Keyboard', 'Android keyboard', 'noop', '', '▦')}`);
    if (s === 'date') return appView('Date & time', `${row('Automatic date & time', 'Use browser clock', 'noop', '', '◷')}${row('Date', fullDate(), 'noop', '', '▦')}${row('Time', clock(), 'noop', '', '◷')}`);
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
  function navigateBrowser(url) {
    const normalized = normalizeAddress(url);
    ui.browserUrl = normalized; ui.sub = '';
    ui.browserHistory = ui.browserHistory.slice(0, ui.browserIndex + 1);
    ui.browserHistory.push(normalized); ui.browserIndex++;
    data.browserHistory = ui.browserHistory.slice(-50); save();
    ui.browserTabs[ui.browserTab] = normalized;
    render();
  }
  function browserBack() { if (ui.browserIndex > 0) { ui.browserIndex--; ui.browserUrl = ui.browserHistory[ui.browserIndex]; ui.browserTabs[ui.browserTab] = ui.browserUrl; render(); } }
  function browserForward() { if (ui.browserIndex < ui.browserHistory.length - 1) { ui.browserIndex++; ui.browserUrl = ui.browserHistory[ui.browserIndex]; ui.browserTabs[ui.browserTab] = ui.browserUrl; render(); } }
  function browserLink(url, title, subtitle = '') { return `<div class="web-result"><a href="#" data-action="browser-link" data-url="${safe(url)}"><strong>${safe(title)}</strong></a><small>${safe(url)}</small><p>${safe(subtitle)}</p></div>`; }
  function renderWebsite(url) {
    if (url === 'www.google.com') return `<div class="google-logo"><span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span></div><form class="search-form" data-form="web-search"><input name="query" aria-label="Search the web" placeholder="Search the web" required><button type="submit">Search</button></form><div class="browser-tiles">${[['www.android.com','Android'],['en.wikipedia.org/wiki/Android','Wikipedia'],['news.example','News'],['retro.example','2012 Web']].map(item => `<button data-action="browser-link" data-url="${item[0]}">${item[1]}</button>`).join('')}</div><p style="font-size:11px;color:#888;margin-top:24px">Offline demo pages · 2012</p>`;
    if (url.startsWith('search:')) {
      const term = url.slice(7);
      return `<h2>Search results</h2><p>Results for <strong>${safe(term)}</strong></p>${browserLink('www.android.com', 'Android – Discover the new Android 4.0', 'Ice Cream Sandwich brings a refined design and powerful new features.')}${browserLink('en.wikipedia.org/wiki/Android', 'Android (operating system) – Wikipedia', 'An overview of the Android mobile operating system.')}${browserLink('news.example', 'Tech News', `Stories related to ${term}.`)}`;
    }
    if (url.includes('android.com')) return `<h2 style="color:#79b93f">android</h2><h3>Meet Android 4.0</h3><p>A new, refined Android for phones and tablets. Share more, browse faster and personalize your home screen.</p><div style="background:#23343c;color:white;padding:25px;text-align:center;font-size:38px">🤖<br><small style="font-size:17px">Ice Cream Sandwich</small></div>${browserLink('en.wikipedia.org/wiki/Android','Learn about Android','The story of Android.')}`;
    if (url.includes('wikipedia.org')) return `<h2>Android (operating system)</h2><p><small>From Wikipedia, the free encyclopedia</small></p><hr><p>Android is a mobile operating system based on a modified version of the Linux kernel. Android 4.0, known as Ice Cream Sandwich, introduced the Holo interface and virtual navigation buttons.</p><h3>Versions</h3><p>Gingerbread · Ice Cream Sandwich · Jelly Bean · KitKat</p>${browserLink('www.android.com','Official Android website')}`;
    if (url.includes('news.example')) return `<h2>Tech News</h2><p style="color:#777">Friday, June 15, 2012</p><hr><h3>The Galaxy Nexus experience</h3><p>Android 4.0 makes multitasking, notifications and home screen customization easier than ever.</p><h3>Apps in your pocket</h3><p>Explore the growing world of mobile apps and connected devices.</p>${browserLink('retro.example','Visit the 2012 Web')}`;
    if (url.includes('retro.example')) return `<h2>Welcome to the 2012 Web</h2><p>A little time capsule from the early smartphone era.</p><ul><li>Share photos</li><li>Check your email</li><li>Customize your phone</li></ul>${browserLink('www.google.com','Back to Google')}`;
    if (url.includes('maps.example')) return `<h2>Maps</h2><div style="height:230px;background:repeating-linear-gradient(35deg,#e2ead9,#e2ead9 18px,#c7dfd7 18px,#c7dfd7 24px);display:grid;place-items:center;color:#426a68">San Francisco · Demo map</div><p>Map data is a local illustration.</p>`;
    return `<h2>Webpage unavailable</h2><p>The simulator browses a small collection of offline example pages.</p>${browserLink('www.google.com','Go to Google')}`;
  }
  function renderBrowser() {
    if (ui.sub === 'tabs') return appView('Tabs', `<div class="tabs-list">${ui.browserTabs.map((url, i) => `<button data-action="browser-tab" data-id="${i}">${i === ui.browserTab ? '● ' : ''}${safe(url)}</button>`).join('')}<button data-action="browser-new-tab">＋ New tab</button></div>`, '');
    if (ui.sub === 'bookmarks') return appView('Bookmarks', `${data.bookmarks.map(url => row(url, 'Saved page', 'browser-bookmark', url, '★')).join('')}${row('History', 'Recently visited', 'browser-history', '', '◷')}`);
    if (ui.sub === 'history') return appView('History', `${[...ui.browserHistory].reverse().map(url => row(url, 'Visited', 'browser-bookmark', url, '◷')).join('')}`);
    return `<div class="app-view"><div class="browser-toolbar"><button data-action="browser-back" aria-label="Back">‹</button><button data-action="browser-forward" aria-label="Forward">›</button><form data-form="address"><input name="address" aria-label="Web address" value="${safe(ui.browserUrl.startsWith('search:') ? ui.browserUrl.slice(7) : ui.browserUrl)}"></form><button data-action="browser-tabs" aria-label="Tabs">▣</button><button data-action="browser-menu" aria-label="Bookmarks">⋮</button></div><div class="browser-page">${renderWebsite(ui.browserUrl)}<div style="margin-top:25px;border-top:1px solid #ddd;padding-top:12px"><button class="browser-action" data-action="browser-save">☆ Bookmark</button> <button class="browser-action" data-action="browser-bookmarks">Bookmarks</button></div></div></div>`;
  }

  function renderPhone() {
    if (ui.sub === 'calling') return `<div class="app-view"><div class="call-view"><div class="avatar">☎</div><h2>${safe(contactByPhone(ui.callNumber)?.name || ui.callNumber)}</h2><p>Calling…</p><button data-action="hangup" aria-label="End call">☎</button></div></div>`;
    return appView('Phone', `<div class="dial-display">${safe(ui.dial) || '&nbsp;'}</div><div class="dial-pad">${['1','2','3','4','5','6','7','8','9','*','0','#'].map(digit => `<button data-action="dial" data-id="${digit}">${digit}</button>`).join('')}</div><button class="call-button" data-action="call" aria-label="Call">☎</button><div style="text-align:center"><button class="small-button" data-action="dial-delete">⌫</button></div>`);
  }
  function contactByPhone(number) { return data.contacts.find(item => item.phone === number); }
  function renderPeople() {
    if (ui.sub === 'detail') {
      const person = contact(ui.selectedContact); if (!person) return appView('People', '<div class="empty-note">Contact not found</div>');
      return appView(person.name, `<div class="contact-card"><div class="avatar">${safe(person.name[0])}</div><div><div style="font-size:22px">${safe(person.name)}</div><small>Mobile</small></div></div><div class="contact-actions"><button data-action="contact-call" data-id="${person.id}">☎ Call</button><button data-action="contact-message" data-id="${person.id}">✉ Message</button></div>${row(person.phone, 'Mobile', 'contact-call', person.id, '☎')}${row(person.email, 'Email', 'contact-email', person.id, '✉')}`);
    }
    if (ui.sub === 'new') return appView('New contact', `<form class="form-stack" data-form="contact"><label>Name<input name="name" required maxlength="50"></label><label>Phone<input name="phone" required maxlength="24"></label><label>Email<input name="email" type="email" maxlength="80"></label><button class="primary-button" type="submit">Save contact</button></form>`);
    return appView('People', `<div class="relative">${data.contacts.map(person => `<button class="list-row" data-action="contact" data-id="${person.id}"><span class="avatar">${safe(person.name[0])}</span><span class="row-copy">${safe(person.name)}<small>${safe(person.phone)}</small></span><span class="chevron">›</span></button>`).join('')}<button class="fab" data-action="new-contact" aria-label="Add contact">＋</button></div>`);
  }
  function renderMessaging() {
    if (ui.sub === 'new') return appView('New message', `<form class="form-stack" data-form="new-message"><label>To<select name="contact" required style="width:100%;padding:10px;background:white;color:#222;border:1px solid #aaa">${data.contacts.map(person => `<option value="${person.id}">${safe(person.name)}</option>`).join('')}</select></label><label>Message<textarea name="body" required maxlength="500"></textarea></label><button class="primary-button" type="submit">Send</button></form>`);
    if (ui.sub === 'thread') {
      const person = contact(ui.thread);
      const messages = data.messages.filter(item => item.contact === ui.thread);
      return `<div class="app-view">${actionbar(person?.name || 'Message')}<div class="sms-view"><div class="bubbles">${messages.map(msg => `<div class="bubble ${msg.mine ? 'mine' : ''}">${safe(msg.body)}<small>${safe(msg.time)}</small></div>`).join('')}</div><form class="compose-bar" data-form="reply"><input name="body" placeholder="Type message" maxlength="500" required aria-label="Type message"><button type="submit">Send</button></form></div></div>`;
    }
    const threads = [...new Set(data.messages.map(item => item.contact))];
    return appView('Messaging', `<div class="relative thread-list">${threads.map(id => { const person = contact(id); const last = [...data.messages].reverse().find(msg => msg.contact === id); return `<button class="list-row" data-action="thread" data-id="${id}"><span class="avatar">${safe(person?.name[0] || '?')}</span><span class="row-copy"><strong>${safe(person?.name || 'Unknown')}</strong><small>${safe(last?.body || '')}</small></span><span class="chevron">›</span></button>`; }).join('')}<button class="fab" data-action="new-message" aria-label="New message">＋</button></div>`);
  }
  function photoStyle(photo) { return `background:linear-gradient(160deg,${photo.colors[0]},${photo.colors[1]} 53%,${photo.colors[2]})`; }
  function renderGallery() {
    if (ui.sub === 'photo') {
      const photo = data.photos.find(item => item.id === ui.selectedPhoto);
      if (!photo) return appView('Gallery', '<div class="empty-note">Photo unavailable</div>');
      return appView(photo.name, `<div class="photo-view"><div class="photo-art" style="${photoStyle(photo)}"></div><div class="photo-tools"><button data-action="photo-wallpaper" data-id="${photo.id}">Set wallpaper</button><button data-action="photo-delete" data-id="${photo.id}">Delete</button></div></div>`, 'black');
    }
    return appView('Gallery', `<div class="gallery-grid">${data.photos.map(photo => `<button class="photo-tile" data-action="photo" data-id="${photo.id}"><div class="photo-art" style="${photoStyle(photo)}"></div><span>${safe(photo.name)}</span></button>`).join('')}</div>`);
  }
  function renderCamera() { return `<div class="app-view"><div class="camera-view"><div class="camera-controls"><button data-action="open-app" data-app="gallery" aria-label="Gallery">▧</button><button class="shutter" data-action="shoot" aria-label="Take photo"></button><button data-action="camera-flip" aria-label="Switch camera">↻</button></div></div></div>`; }

  function renderCalendar() {
    if (ui.sub === 'new') return appView('New event', `<form class="form-stack" data-form="event"><label>Title<input name="title" required maxlength="80"></label><label>Date<input name="date" type="date" value="${ui.selectedDate}" required></label><label>Time<input name="time" type="time" value="12:00" required></label><button class="primary-button" type="submit">Save event</button></form>`);
    const year = ui.calendarDate.getFullYear(), month = ui.calendarDate.getMonth();
    const first = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const monthTitle = ui.calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const cells = Array.from({length:first}, () => '<span></span>').join('') + Array.from({length:days}, (_, i) => { const iso = `${year}-${String(month+1).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`; return `<button data-action="calendar-day" data-id="${iso}" class="${iso === today() ? 'today' : ''} ${iso === ui.selectedDate ? 'selected' : ''}">${i+1}</button>`; }).join('');
    const events = data.events.filter(event => event.date === ui.selectedDate);
    return appView('Calendar', `<div class="relative"><div class="calendar-head"><button data-action="calendar-prev" aria-label="Previous month">‹</button><strong>${monthTitle}</strong><button data-action="calendar-next" aria-label="Next month">›</button></div><div class="calendar-grid">${['S','M','T','W','T','F','S'].map(day => `<span class="day-name">${day}</span>`).join('')}${cells}</div><div class="event-list"><h3>${safe(ui.selectedDate)}</h3>${events.length ? events.map(event => `<div class="event-row"><strong>${safe(event.time)}</strong> ${safe(event.title)} <button class="small-button" data-action="event-delete" data-id="${event.id}" aria-label="Delete event">×</button></div>`).join('') : '<p>No events</p>'}</div><button class="fab" data-action="event-new" aria-label="Add event">＋</button></div>`);
  }
  function renderClock() {
    if (ui.sub === 'new') return appView('New alarm', `<form class="form-stack" data-form="alarm"><label>Time<input type="time" name="time" value="07:00" required></label><button class="primary-button" type="submit">Set alarm</button></form>`);
    return appView('Clock', `<div class="relative"><div class="clock-face"><div class="digital">${clock()}</div><div class="day">${fullDate()}</div></div>${label('Alarms')}${data.alarms.map(alarm => `<button class="alarm-row" style="width:100%;border-left:0;border-top:0;border-right:0;color:#222" data-action="alarm-toggle" data-id="${alarm.id}"><strong>${safe(alarm.time)}</strong><span class="switch ${alarm.enabled ? 'on' : ''}"></span></button>`).join('')}<button class="fab" data-action="alarm-new" aria-label="Add alarm">＋</button></div>`);
  }
  function renderCalculator() {
    const keys = ['C','±','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','⌫','='];
    return `<div class="app-view"><div class="calculator"><div class="calc-display">${safe(ui.calc)}</div><div class="calc-grid">${keys.map(key => `<button class="${['÷','×','−','+'].includes(key) ? 'op' : key === '=' ? 'equals' : ''}" data-action="calc-key" data-id="${key}">${key}</button>`).join('')}</div></div></div>`;
  }
  function renderMusic() {
    const track = tracks[ui.musicTrack];
    return appView('Music', `<div class="music-art">♫</div><div class="music-details"><h3>${track.title}</h3><span>${track.artist}</span></div><input class="music-progress" type="range" min="0" max="100" value="${ui.musicPosition}" data-field="music-position" aria-label="Track position"><div class="music-controls"><button data-action="music-prev" aria-label="Previous track">|◀</button><button data-action="music-play" aria-label="${ui.musicPlaying ? 'Pause' : 'Play'}">${ui.musicPlaying ? 'Ⅱ' : '▶'}</button><button data-action="music-next" aria-label="Next track">▶|</button></div><div class="notice">Sample player: tracks and playback are simulated.</div>`, 'dark');
  }
  function renderEmail() {
    if (ui.sub === 'read') { const email = emailData.find(item => item.id === ui.emailId); return appView(email.subject, `<div class="email-body"><strong>${safe(email.from)}</strong><small style="display:block;color:#777">${safe(email.time)}</small><hr><p>${safe(email.body)}</p><button class="primary-button" data-action="email-reply">Reply</button></div>`); }
    if (ui.sub === 'compose') return appView('Compose', `<form class="form-stack" data-form="email"><label>To<input name="to" type="email" required value="${safe(ui.emailTo || '')}"></label><label>Subject<input name="subject" required></label><label>Message<textarea name="body" required></textarea></label><button type="submit" class="primary-button">Send</button></form>`);
    if (ui.sub === 'sent') return appView('Sent', data.sentEmails.length ? data.sentEmails.map(email => `<div class="list-row email-row"><span class="avatar">✉</span><span class="row-copy"><strong>${safe(email.to)}</strong>${safe(email.subject)}<small>${safe(email.body.slice(0, 45))}</small></span></div>`).join('') : '<div class="empty-note">No sent messages</div>');
    return appView('Email', `<div class="relative">${emailData.map(email => `<button class="list-row email-row" data-action="email-read" data-id="${email.id}"><span class="avatar">${safe(email.from[0])}</span><span class="row-copy"><strong>${safe(email.from)}</strong>${safe(email.subject)}<small>${safe(email.body.slice(0, 45))}…</small></span></button>`).join('')}<button class="fab" data-action="email-compose" aria-label="Compose email">＋</button></div>`, '', '<button class="bar-button" data-action="email-sent" aria-label="Sent mail">✉</button>');
  }

  function operateCalculator(key) {
    if (key === 'C') { ui.calc = '0'; ui.calcMemory = null; ui.calcOperator = ''; ui.calcFresh = true; return; }
    if (key === '⌫') { ui.calc = ui.calc.length > 1 ? ui.calc.slice(0, -1) : '0'; return; }
    if (key === '±') { ui.calc = String(-Number(ui.calc)); return; }
    if (key === '%') { ui.calc = String(Number(ui.calc) / 100); return; }
    if (['÷','×','−','+'].includes(key)) { ui.calcMemory = Number(ui.calc); ui.calcOperator = key; ui.calcFresh = true; return; }
    if (key === '=') {
      if (ui.calcOperator && ui.calcMemory !== null) {
        const a = ui.calcMemory, b = Number(ui.calc);
        const result = ui.calcOperator === '+' ? a + b : ui.calcOperator === '−' ? a - b : ui.calcOperator === '×' ? a * b : b === 0 ? NaN : a / b;
        ui.calc = Number.isFinite(result) ? String(Number(result.toFixed(8))) : 'Error';
      }
      ui.calcOperator = ''; ui.calcMemory = null; ui.calcFresh = true; return;
    }
    if (key === '.') { if (ui.calcFresh) { ui.calc = '0.'; ui.calcFresh = false; } else if (!ui.calc.includes('.')) ui.calc += '.'; return; }
    if (/^\d$/.test(key)) { ui.calc = ui.calcFresh || ui.calc === '0' || ui.calc === 'Error' ? key : ui.calc + key; ui.calcFresh = false; }
  }
  function addNotification(title, detail) { data.notifications.unshift({ id: Date.now(), title, detail }); save(); renderStatus(); }
  function sendMessage(id, body) {
    data.messages.push({ id: Date.now(), contact: Number(id), body, mine: true, time: clock() }); save();
    ui.thread = Number(id); ui.view = 'messaging'; ui.sub = 'thread'; render();
    requestAnimationFrame(() => { const bubbles = document.querySelector('.bubbles'); if (bubbles) bubbles.scrollTop = bubbles.scrollHeight; });
  }

  let suppressClickUntil = 0;
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button || !screen.contains(button)) return;
    event.preventDefault();
    if (Date.now() < suppressClickUntil) return;
    const { action, id, app, url } = button.dataset;
    switch (action) {
      case 'open-app': openApp(app || id); break;
      case 'home': if (ui.view !== 'lock') home(); break;
      case 'back': back(); break;
      case 'drawer': ui.view = 'drawer'; ui.sub = ''; ui.overlay = ''; render(); break;
      case 'google-folder': ui.overlay = 'google-folder'; renderOverlay(); break;
      case 'drawer-tab': ui.drawerTab = id; ui.drawerPage = 0; render(); break;
      case 'drawer-page': ui.drawerPage = Number(id); render(); break;
      case 'add-widget': if (addWidget(button.dataset.widgetType)) { home(false); toast('Widget added'); } else toast('This home screen is full'); break;
      case 'open-wallpapers': ui.overlay = ''; ui.view = 'wallpaper-picker'; render(); break;
      case 'gallery-wallpaper': ui.overlay = ''; openApp('gallery'); break;
      case 'market': toast('App store unavailable offline'); break;
      case 'page': ui.page = Number(id); render(); break;
      case 'shade': ui.overlay = ui.overlay === 'shade' ? '' : 'shade'; renderOverlay(); break;
      case 'recent': if (ui.view === 'lock') break; if (ui.overlay !== 'recent') captureRecentView(); ui.overlay = ui.overlay === 'recent' ? '' : 'recent'; renderOverlay(); break;
      case 'close-overlay': ui.overlay = ''; renderOverlay(); break;
      case 'remove-recent': event.stopPropagation(); ui.recent = ui.recent.filter(item => item !== id); renderOverlay(); break;
      case 'clear-notifications': data.notifications = []; save(); renderStatus(); renderOverlay(); break;
      case 'notification-open': ui.overlay = ''; if (Number(id) === 2) { ui.view = 'messaging'; ui.thread = 1; ui.sub = 'thread'; } else { ui.view = 'settings'; ui.sub = 'about'; } render(); break;
      case 'unlock': ui.view = 'home'; render(); break;
      case 'unlock-camera': openApp('camera'); break;
      case 'settings-sub': if (id === 'development' && !data.settings.developerUnlocked) break; if (ui.view === 'settings' && !ui.sub) ui.settingsRootScroll = viewport.querySelector('.settings-app')?.scrollTop || 0; ui.sub = id; render(); break;
      case 'wifi-network': ui.wifiTarget = id; ui.overlay = 'wifi-dialog'; renderOverlay(); break;
      case 'wifi-connect': {
        const network = wifiNetworks.find(item => item.name === ui.wifiTarget);
        if (network?.security !== 'Open' && !overlayRoot.querySelector('.wifi-password')?.value.trim()) { toast('Enter a password'); break; }
        data.settings.wifiNetwork = ui.wifiTarget; data.settings.wifi = true; data.settings.airplane = false;
        save(); ui.overlay = ''; render(); break;
      }
      case 'wifi-forget': data.settings.wifiNetwork = ''; save(); ui.overlay = ''; render(); break;
      case 'bluetooth-scan': ui.bluetoothScanned = true; render(); break;
      case 'bluetooth-pair': data.settings.pairedDevice = data.settings.pairedDevice === id ? '' : id; save(); render(); break;
      case 'set-language': i18n.setLanguage(id); location.reload(); break;
      case 'toggle-setting': {
        const previousScroll = viewport.querySelector('.settings-app')?.scrollTop || 0;
        data.settings[id] = !data.settings[id];
        if (id === 'airplane' && data.settings.airplane) { data.settings.wifi = false; data.settings.bluetooth = false; data.settings.wifiDirect = false; data.settings.portableHotspot = false; }
        if (id === 'nfc' && !data.settings.nfc) data.settings.androidBeam = false;
        if (id === 'nfc' && data.settings.nfc) data.settings.androidBeam = true;
        if ((id === 'wifi' || id === 'bluetooth') && data.settings[id]) data.settings.airplane = false;
        save(); render(); const settingsView = viewport.querySelector('.settings-app'); if (settingsView) settingsView.scrollTop = previousScroll; break;
      }
      case 'wallpaper': data.wallpaper = Number(id); delete data.customWallpaper; save(); if (ui.view === 'wallpaper-picker') home(false); else render(); toast('Wallpaper set'); break;
      case 'factory-reset': if (confirm(i18n.t('Reset all local ICS simulator data?'))) { data = clone(defaultData); save(); home(); } break;
      case 'about-tap': ui.aboutTaps++; if (ui.aboutTaps >= 5) { ui.sub = 'easter'; ui.easterNyan = false; ui.aboutTaps = 0; } render(); break;
      case 'developer-tap': if (!data.settings.developerUnlocked && ++ui.buildTaps >= 7) { data.settings.developerUnlocked = true; save(); toast('Developer options unlocked'); } break;
      case 'egg-nyan': toast('Android 4.0: Ice Cream Sandwich'); break;
      case 'toast': toast(id); break;
      case 'noop': break;
      case 'browser-search': openApp('browser'); document.querySelector('.browser-toolbar input')?.focus(); break;
      case 'browser-link': navigateBrowser(url); break;
      case 'browser-back': browserBack(); break;
      case 'browser-forward': browserForward(); break;
      case 'browser-tabs': ui.sub = 'tabs'; render(); break;
      case 'browser-menu': ui.sub = 'bookmarks'; render(); break;
      case 'browser-bookmarks': ui.sub = 'bookmarks'; render(); break;
      case 'browser-bookmark': navigateBrowser(id); break;
      case 'browser-history': ui.sub = 'history'; render(); break;
      case 'browser-tab': ui.browserTab = Number(id); ui.browserUrl = ui.browserTabs[ui.browserTab]; ui.sub = ''; render(); break;
      case 'browser-new-tab': ui.browserTabs.push('www.google.com'); ui.browserTab = ui.browserTabs.length - 1; ui.browserUrl = 'www.google.com'; ui.sub = ''; render(); break;
      case 'browser-save': if (!data.bookmarks.includes(ui.browserUrl)) { data.bookmarks.push(ui.browserUrl); save(); toast('Bookmark saved'); } else toast('Already bookmarked'); break;
      case 'dial': ui.dial += id; render(); break;
      case 'dial-delete': ui.dial = ui.dial.slice(0, -1); render(); break;
      case 'call': if (!ui.dial) { toast('Enter a phone number'); break; } ui.callNumber = ui.dial; ui.sub = 'calling'; render(); break;
      case 'hangup': ui.sub = ''; ui.dial = ''; render(); toast('Call ended'); break;
      case 'contact': ui.selectedContact = Number(id); ui.sub = 'detail'; render(); break;
      case 'new-contact': ui.sub = 'new'; render(); break;
      case 'contact-call': ui.callNumber = contact(id)?.phone || ''; ui.dial = ui.callNumber; ui.view = 'phone'; ui.sub = 'calling'; render(); break;
      case 'contact-message': ui.thread = Number(id); ui.view = 'messaging'; ui.sub = 'thread'; render(); break;
      case 'contact-email': ui.emailTo = contact(id)?.email || ''; ui.view = 'email'; ui.sub = 'compose'; render(); break;
      case 'thread': ui.thread = Number(id); ui.sub = 'thread'; render(); break;
      case 'new-message': ui.sub = 'new'; render(); break;
      case 'photo': ui.selectedPhoto = Number(id); ui.sub = 'photo'; render(); break;
      case 'photo-delete': data.photos = data.photos.filter(photo => photo.id !== Number(id)); save(); ui.sub = ''; render(); toast('Photo deleted'); break;
      case 'photo-wallpaper': {
        const photo = data.photos.find(item => item.id === Number(id));
        if (!photo) break;
        data.wallpaper = 11; data.customWallpaper = photo.colors; save(); render(); toast('Wallpaper set'); break;
      }
      case 'shoot': {
        const colors = [['#4e859a','#ae9f8a','#1b3743'],['#78b0a0','#c3ad6f','#28535e'],['#7c849e','#d29888','#242e4d']][data.photos.length % 3];
        data.photos.unshift({ id: Date.now(), name: `Photo ${data.photos.length + 1}`, colors }); save();
        screen.animate([{ opacity: 1 }, { opacity: .4 }, { opacity: 1 }], { duration: 240 }); toast('Photo saved to Gallery'); break;
      }
      case 'camera-flip': toast('Camera switched'); break;
      case 'calendar-prev': ui.calendarDate = new Date(ui.calendarDate.getFullYear(), ui.calendarDate.getMonth() - 1, 1); render(); break;
      case 'calendar-next': ui.calendarDate = new Date(ui.calendarDate.getFullYear(), ui.calendarDate.getMonth() + 1, 1); render(); break;
      case 'calendar-day': ui.selectedDate = id; render(); break;
      case 'event-new': ui.sub = 'new'; render(); break;
      case 'event-delete': data.events = data.events.filter(item => item.id !== Number(id)); save(); render(); break;
      case 'alarm-new': ui.sub = 'new'; render(); break;
      case 'alarm-toggle': { const alarm = data.alarms.find(item => item.id === Number(id)); if (alarm) alarm.enabled = !alarm.enabled; save(); render(); break; }
      case 'calc-key': operateCalculator(id); render(); break;
      case 'music-play': ui.musicPlaying = !ui.musicPlaying; render(); break;
      case 'music-prev': ui.musicTrack = (ui.musicTrack + tracks.length - 1) % tracks.length; ui.musicPosition = 0; render(); break;
      case 'music-next': ui.musicTrack = (ui.musicTrack + 1) % tracks.length; ui.musicPosition = 0; render(); break;
      case 'email-read': ui.emailId = Number(id); ui.sub = 'read'; render(); break;
      case 'email-compose': ui.emailTo = ''; ui.sub = 'compose'; render(); break;
      case 'email-sent': ui.sub = 'sent'; render(); break;
      case 'email-reply': ui.emailTo = 'hello@example.com'; ui.sub = 'compose'; render(); break;
      default: break;
    }
  });

  document.addEventListener('submit', event => {
    const form = event.target.closest('[data-form]');
    if (!form || !screen.contains(form)) return;
    event.preventDefault(); const values = new FormData(form);
    switch (form.dataset.form) {
      case 'address': navigateBrowser(values.get('address')); break;
      case 'web-search': navigateBrowser(`search:${values.get('query')}`); break;
      case 'reply': sendMessage(ui.thread, String(values.get('body')).trim()); break;
      case 'new-message': sendMessage(values.get('contact'), String(values.get('body')).trim()); break;
      case 'contact': {
        const name = String(values.get('name')).trim(), phone = String(values.get('phone')).trim(), email = String(values.get('email')).trim();
        if (!name || !phone) return;
        const id = Date.now(); data.contacts.push({ id, name, phone, email }); save(); ui.selectedContact = id; ui.sub = 'detail'; render(); toast('Contact saved'); break;
      }
      case 'event': {
        const title = String(values.get('title')).trim(), date = String(values.get('date')), time = String(values.get('time'));
        if (!title || !date || !time) return;
        data.events.push({ id: Date.now(), title, date, time }); save(); ui.selectedDate = date; ui.calendarDate = new Date(`${date}T12:00:00`); ui.sub = ''; render(); toast('Event saved'); break;
      }
      case 'alarm': data.alarms.push({ id: Date.now(), time: String(values.get('time')), enabled: true }); save(); ui.sub = ''; render(); toast('Alarm set'); break;
      case 'email': data.sentEmails.unshift({ id: Date.now(), to: String(values.get('to')).trim(), subject: String(values.get('subject')).trim(), body: String(values.get('body')).trim() }); save(); ui.sub = 'sent'; render(); toast('Demo email sent'); break;
      default: break;
    }
  });
  document.addEventListener('input', event => {
    if (event.target.dataset.field === 'brightness') {
      data.settings.brightness = Number(event.target.value); save();
      const display = event.target.closest('.detail-pad')?.querySelector('p'); if (display) display.textContent = `${data.settings.brightness}%`;
      screen.style.filter = `brightness(${.5 + data.settings.brightness / 135})`;
    }
    if (event.target.dataset.field === 'music-position') ui.musicPosition = Number(event.target.value);
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
    const homeSlot = icon.closest('[data-home-slot]');
    if (homeSlot) return { type: 'home', slot: Number(homeSlot.dataset.homeSlot), page: ui.page, id: data.homePages[ui.page][Number(homeSlot.dataset.homeSlot)] };
    const dockSlot = icon.closest('[data-dock-slot]');
    if (dockSlot && Number(dockSlot.dataset.dockSlot) !== 2) return { type: 'dock', slot: Number(dockSlot.dataset.dockSlot), id: data.dock[Number(dockSlot.dataset.dockSlot)] };
    if (icon.closest('.drawer-grid')) return { type: 'drawer', id: icon.dataset.app };
    return null;
  }
  function startDrag(x, y) {
    if (!pointerStart?.source || dragState) return;
    dragState = pointerStart.source;
    if (dragState.type === 'drawer' || dragState.type === 'drawer-widget') { ui.view = 'home'; ui.overlay = ''; render(); }
    const ghost = document.createElement('div'); ghost.className = `drag-ghost${dragState.widgetType ? ' widget-ghost' : ''}`; ghost.innerHTML = dragState.widgetType ? widgetArt(dragState.widgetType) : appIcon(dragState.id); screen.append(ghost);
    dragState.ghost = ghost;
    moveGhost(x, y);
    screen.classList.add('dragging');
    suppressClickUntil = Date.now() + 500;
  }
  function moveGhost(x, y) {
    if (!dragState) return;
    const rect = screen.getBoundingClientRect();
    const offset = dragState.widgetType ? 65 : 27;
    dragState.ghost.style.left = `${x - rect.left - offset}px`;
    dragState.ghost.style.top = `${y - rect.top - offset}px`;
  }
  function finishDrag(x, y) {
    if (!dragState) return false;
    const source = dragState;
    const target = document.elementFromPoint(x, y);
    const homeSlot = target?.closest('[data-home-slot]');
    const dockSlot = target?.closest('[data-dock-slot]');
    const pageButton = target?.closest('.page-indicators button');
    const remove = target?.closest('[data-drop-remove]');
    if (source.widgetType) {
      const oldWidget = source.type === 'widget' ? data.homeWidgets[source.page].find(widget => widget.id === source.id) : null;
      if (remove && oldWidget) data.homeWidgets[source.page] = data.homeWidgets[source.page].filter(widget => widget.id !== source.id);
      else if (homeSlot) {
        const slot = Number(homeSlot.dataset.homeSlot), column = slot % 4, row = Math.floor(slot / 4);
        if (widgetFits(ui.page, column, row, oldWidget?.id || '')) {
          if (oldWidget) { oldWidget.x = column; oldWidget.y = row; }
          else addWidget(source.widgetType, column, row);
        } else toast('This home screen is full');
      }
    } else {
      const sourceList = source.type === 'home' ? data.homePages[source.page] : source.type === 'dock' ? data.dock : null;
      if (remove && sourceList) { sourceList[source.slot] = null; toast('Shortcut removed'); }
      else if (homeSlot) {
        const slot = Number(homeSlot.dataset.homeSlot);
        const covered = data.homeWidgets[ui.page].some(widget => slot % 4 >= widget.x && slot % 4 < widget.x + 2 && Math.floor(slot / 4) >= widget.y && Math.floor(slot / 4) < widget.y + 2);
        if (!covered) {
          const destination = data.homePages[ui.page], previous = destination[slot];
          destination[slot] = source.id;
          if (sourceList) sourceList[source.slot] = previous;
        }
      } else if (dockSlot && Number(dockSlot.dataset.dockSlot) !== 2) {
        const slot = Number(dockSlot.dataset.dockSlot), previous = data.dock[slot]; data.dock[slot] = source.id;
        if (sourceList) sourceList[source.slot] = previous;
      } else if (pageButton) {
        const nextPage = Number(pageButton.dataset.id);
        const slot = data.homePages[nextPage].findIndex((id, index) => id === null && !data.homeWidgets[nextPage].some(widget => index % 4 >= widget.x && index % 4 < widget.x + 2 && Math.floor(index / 4) >= widget.y && Math.floor(index / 4) < widget.y + 2));
        if (slot >= 0) { data.homePages[nextPage][slot] = source.id; if (sourceList) sourceList[source.slot] = null; ui.page = nextPage; }
        else toast('This home screen is full');
      }
    }
    source.ghost.remove(); dragState = null; screen.classList.remove('dragging');
    save(); render(); suppressClickUntil = Date.now() + 350;
    return true;
  }
  function moveHomePage(dx) {
    const content = viewport.querySelector('.home-content');
    if (!content) return;
    const distance = Math.max(-screen.clientWidth * .65, Math.min(screen.clientWidth * .65, dx));
    content.style.transition = 'none';
    content.style.transform = `translate3d(${distance}px, 0, 0)`;
  }
  function finishHomePage(dx) {
    const nextPage = Math.max(0, Math.min(4, ui.page + (dx < 0 ? 1 : -1)));
    screen.classList.remove('page-swiping');
    suppressClickUntil = Date.now() + 350;
    if (Math.abs(dx) > 45 && nextPage !== ui.page) {
      ui.page = nextPage;
      render();
      viewport.querySelector('.home-content')?.animate([{transform:`translateX(${dx < 0 ? '100%' : '-100%'})`},{transform:'translateX(0)'}],{duration:190,easing:'ease-out'});
    } else {
      const content = viewport.querySelector('.home-content');
      if (content) {
        content.style.transition = 'transform .18s ease-out';
        content.style.transform = '';
      }
    }
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
  screen.addEventListener('dragstart', event => event.preventDefault());
  let homeLongPressTimer = null;
  screen.addEventListener('contextmenu', event => {
    if (ui.view === 'home' && !ui.overlay && event.target.closest('.home-slot') && !event.target.closest('.launcher-icon')) { event.preventDefault(); ui.overlay = 'wallpaper-source'; renderOverlay(); }
  });
  screen.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (data.settings.showTouches) { const dot = document.createElement('span'); const rect = screen.getBoundingClientRect(); dot.className = 'touch-indicator'; dot.style.left = `${event.clientX - rect.left}px`; dot.style.top = `${event.clientY - rect.top}px`; screen.append(dot); setTimeout(() => dot.remove(), 400); }
    const scrollTarget = event.pointerType === 'mouse' && ui.view === 'settings' && !ui.overlay && event.target.closest('.settings-app .app-content') && !event.target.closest('input, select, textarea, .wallpaper-choice') ? event.target.closest('.settings-app') : null;
    pointerStart = { x: event.clientX, y: event.clientY, target: event.target, source: dragSource(event.target), pointerType: event.pointerType, pointerId: event.pointerId, downTime: performance.now(), scrollTarget, scrollTop: scrollTarget?.scrollTop || 0, lockDrag: ui.view === 'lock' && !!event.target.closest('.lock-handle'), shadeDragEligible: !ui.overlay && !!event.target.closest('#status-bar'), pageSwipeEligible: ui.view === 'home' && !ui.overlay && !!event.target.closest('.home-view') && !event.target.closest('.dock, .page-indicators, .home-search'), drawerSwipeEligible: ui.view === 'drawer' && !!event.target.closest('.drawer-page') };
    if (ui.view === 'home' && !ui.overlay && event.target.closest('.home-slot') && !pointerStart.source) homeLongPressTimer = setTimeout(() => { ui.overlay = 'wallpaper-source'; renderOverlay(); pointerStart = null; }, 550);
    if (pointerStart.lockDrag) { screen.classList.add('lock-dragging'); try { screen.setPointerCapture(event.pointerId); } catch {} }
    if (event.target.closest('.easter-robot')) eggTimer = setTimeout(() => { event.target.closest('.easter-robot')?.classList.add('expanding'); eggTimer = setTimeout(() => { ui.easterNyan = true; render(); }, 1100); }, 850);
    if (pointerStart.source && event.pointerType !== 'mouse') dragTimer = setTimeout(() => startDrag(event.clientX, event.clientY), 440);
  });
  window.addEventListener('pointermove', event => {
    if (!pointerStart || event.pointerId !== pointerStart.pointerId) return;
    if (dragState) { moveGhost(event.clientX, event.clientY); return; }
    const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
    if (Math.hypot(dx,dy) > 8) clearTimeout(homeLongPressTimer);
    if (pointerStart.drawerSwipeEligible && (pointerStart.drawerSwiping || Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.1 && performance.now() - pointerStart.downTime < 260)) {
      pointerStart.drawerSwiping = true;
      clearTimeout(dragTimer);
      event.preventDefault();
      try { screen.setPointerCapture(event.pointerId); } catch {}
      const page = viewport.querySelector('.drawer-page');
      if (page) { page.style.transition = 'none'; page.style.transform = `translateX(${Math.max(-screen.clientWidth*.65,Math.min(screen.clientWidth*.65,dx))}px)`; }
      return;
    }
    const recentCard = ui.overlay === 'recent' ? pointerStart.target.closest('.recent-item') : null;
    if (recentCard && (pointerStart.recentSwiping || Math.abs(dx) > 9 && Math.abs(dx) > Math.abs(dy))) {
      pointerStart.recentSwiping = true;
      suppressClickUntil = Date.now() + 350;
      event.preventDefault();
      try { screen.setPointerCapture(event.pointerId); } catch {}
      recentCard.style.transform = `translateX(${dx}px)`;
      recentCard.style.opacity = String(Math.max(.25, 1 - Math.abs(dx) / 240));
      return;
    }
    if (pointerStart.lockDrag) { event.preventDefault(); const handle = viewport.querySelector('.lock-handle'); if (handle) handle.style.setProperty('--lock-x', `${Math.max(-112, Math.min(112, dx))}px`); return; }
    if (pointerStart.shadeDragging || pointerStart.shadeDragEligible && dy > 8 && dy > Math.abs(dx)) {
      if (!pointerStart.shadeDragging) { pointerStart.shadeDragging = true; ui.overlay = 'shade'; renderOverlay(); try { screen.setPointerCapture(event.pointerId); } catch {} }
      event.preventDefault();
      const shade = overlayRoot.querySelector('.notification-shade');
      if (shade) shade.style.clipPath = `inset(0 0 ${Math.max(0, shade.clientHeight - Math.max(24, dy + 24))}px 0)`;
      return;
    }
    if (pointerStart.scrolling) { event.preventDefault(); pointerStart.scrollTarget.scrollTop = pointerStart.scrollTop - dy; return; }
    if (pointerStart.scrollTarget && Math.abs(dy) > 6 && Math.abs(dy) > Math.abs(dx)) {
      pointerStart.scrolling = true; screen.classList.add('settings-scrolling');
      try { screen.setPointerCapture(event.pointerId); } catch {}
      suppressClickUntil = Date.now() + 350;
      event.preventDefault(); pointerStart.scrollTarget.scrollTop = pointerStart.scrollTop - dy; return;
    }
    if (pointerStart.swiping) { event.preventDefault(); moveHomePage(dx); return; }
    const distance = Math.hypot(dx, dy);
    if (distance > 9) clearTimeout(dragTimer);
    const horizontal = Math.abs(dx) > Math.abs(dy) * 1.1;
    const quickHomeIcon = pointerStart.source?.type === 'home' && performance.now() - pointerStart.downTime < 260;
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
    clearTimeout(eggTimer); clearTimeout(dragTimer); clearTimeout(homeLongPressTimer);
    const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
    if (pointerStart.drawerSwiping) { finishDrawerPage(dx); pointerStart = null; return; }
    if (pointerStart.recentSwiping) {
      const card = pointerStart.target.closest('.recent-item');
      if (card) {
        card.style.transition = 'transform .16s ease-out, opacity .16s ease-out';
        if (Math.abs(dx) > 55) {
          const id = card.dataset.app;
          card.style.transform = `translateX(${Math.sign(dx || 1) * screen.clientWidth}px)`;
          card.style.opacity = '0';
          setTimeout(() => {
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
      if (dy > 75) overlayRoot.querySelector('.notification-shade')?.style.removeProperty('clip-path');
      else { ui.overlay = ''; renderOverlay(); }
      pointerStart = null; return;
    }
    if (pointerStart.lockDrag) {
      screen.classList.remove('lock-dragging');
      if (dx < -75) { suppressClickUntil = Date.now() + 350; home(); }
      else if (dx > 75) { suppressClickUntil = Date.now() + 350; openApp('camera'); }
      else { const handle = viewport.querySelector('.lock-handle'); if (handle) handle.style.removeProperty('--lock-x'); if (Math.hypot(dx, dy) > 6) suppressClickUntil = Date.now() + 350; }
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
    if (ui.overlay === 'shade' && dy < -55) { ui.overlay = ''; renderOverlay(); }
    else if (!ui.overlay && pointerStart.target.closest('#status-bar') && dy > 45) { ui.overlay = 'shade'; renderOverlay(); }
    pointerStart = null;
  });
  window.addEventListener('pointercancel', () => { clearTimeout(eggTimer); clearTimeout(dragTimer); clearTimeout(homeLongPressTimer); dragState?.ghost.remove(); dragState = null; screen.classList.remove('dragging', 'page-swiping', 'settings-scrolling', 'lock-dragging'); const content = viewport.querySelector('.home-content'); if (content) content.style.transform = ''; const drawerPage = viewport.querySelector('.drawer-page'); if (drawerPage) drawerPage.style.transform = ''; const lockHandle = viewport.querySelector('.lock-handle'); if (lockHandle) lockHandle.style.removeProperty('--lock-x'); if (pointerStart?.shadeDragging) { ui.overlay = ''; renderOverlay(); } pointerStart = null; });
  document.addEventListener('keydown', event => {
    if (event.target.matches('.recent-item') && ['Enter',' '].includes(event.key)) { event.preventDefault(); event.target.click(); return; }
    if (event.key === 'Escape' || event.key === 'Backspace' && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) { event.preventDefault(); back(); }
    else if (event.key === 'Home' && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) { event.preventDefault(); if (ui.view !== 'lock') home(); }
    else if (ui.view === 'calculator' && (/^[0-9.+\-*/=%]$/.test(event.key) || event.key === 'Enter') && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) {
      const map = { '*':'×','/':'÷','-':'−','Enter':'=' }; operateCalculator(map[event.key] || event.key); render();
    }
  });
  document.querySelector('#power-button').addEventListener('click', () => { ui.view = ui.view === 'lock' ? 'home' : 'lock'; ui.overlay = ''; render(); });
  const languageSelect = document.querySelector('#language-select');
  languageSelect.value = i18n.language;
  languageSelect.addEventListener('change', event => { i18n.setLanguage(event.target.value); location.reload(); });
  document.querySelector('#reset-button').addEventListener('click', () => {
    if (!confirm(i18n.t('Reset all local ICS simulator data?'))) return;
    data = clone(defaultData); save(); ui.view = 'home'; ui.sub = ''; ui.page = 2; ui.overlay = ''; render();
  });
  setInterval(() => {
    document.querySelectorAll('.status-clock').forEach(node => { node.textContent = clock(); });
    if (ui.musicPlaying) { ui.musicPosition = (ui.musicPosition + 1) % 101; const progress = document.querySelector('.music-progress'); if (progress) progress.value = ui.musicPosition; }
  }, 1000);

  i18n.translateDOM(document.body);
  render();
})();
