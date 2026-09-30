/* Android 4.0.4 inspired browser simulation. No network or Android runtime required. */
(() => {
  'use strict';

  const STORE = 'android-time-machine-ics-v1';
  const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const defaultData = {
    wallpaper: 0,
    layoutRevision: 2,
    homePages: Array.from({length: 5}, (_, page) => Array.from({length: 16}, (_, slot) =>
      page === 2 && slot === 12 ? 'camera' : page === 2 && slot === 15 ? 'google' :
      page === 3 && slot === 13 ? 'gallery' : page === 3 && slot === 14 ? 'settings' : null)),
    homeWidgets: [
      [],
      [{ id: 'default-power', type: 'power', x: 0, y: 3 }],
      [{ id: 'default-analog', type: 'analog', x: 1, y: 0 }],
      [],
      []
    ],
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
      if (result.wallpaper === 4 && result.customWallpaper) result.wallpaper = 11;
      return result;
    } catch { return clone(defaultData); }
  }
  let data = load();
  data.settings={...ICSSettingsDetail.defaults,...ICSSystemSettings.defaults,...data.settings};
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
    ['phone', 'Phone', '☎', '#3dc484', '#217258'], ['people', 'People', '◉', '#efa96f', '#a45142'],
    ['messaging', 'Messaging', '✉', '#84cf62', '#428c43'], ['browser', 'Browser', '◎', '#65aee2', '#246ba8'],
    ['camera', 'Camera', '▣', '#c8cbd0', '#6b7a87'], ['gallery', 'Gallery', '▧', '#e9b674', '#8d673c'],
    ['settings', 'Settings', '⚙', '#b7c5ce', '#53606f'], ['clock', 'Clock', '◷', '#71b7dc', '#3d6e8d'],
    ['calendar', 'Calendar', '31', '#7ec7e7', '#397c9e'], ['calculator', 'Calculator', '＋', '#7cb4bd', '#32727f'],
    ['music', 'Music', '♫', '#fd9e70', '#c25360'], ['email', 'Email', '✉', '#75b7df', '#326b9e'],
    ['play-store', 'Play Store', '▶', '#b5d26d', '#53732f']
  ];
  const wifiNetworks = [
    { name: 'AndroidAP', security: 'WPA2', strength: 4 },
    { name: 'CoffeeShop', security: 'Open', strength: 3 },
    { name: 'Home Network', security: 'WPA2', strength: 4 },
    { name: 'Library Wi-Fi', security: 'Open', strength: 2 }
  ];
  const wallpaperFiles = ['chroma','architecture','bubblegum','canyon','escape','fidelity','flora','kepler','leaf','noir','outofthebox'];
  const widgetTypes = [
    { type: 'analog', name: 'Analog clock', app: 'clock', width: 2, height: 2 },
    { type: 'calendar', name: 'Calendar', app: 'calendar', width: 2, height: 3 },
    { type: 'music', name: 'Music', app: 'music', width: 4, height: 1 },
    { type: 'photo', name: 'Photo frame', app: 'gallery', width: 2, height: 2 },
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
  const screen = document.querySelector('#screen');
  const viewport = document.querySelector('#viewport');
  const statusRoot = document.querySelector('#status-bar');
  const navRoot = document.querySelector('#nav-bar');
  const overlayRoot = document.querySelector('#overlay-root');
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
    if (id === 'google') return '<span class="app-icon google-folder-icon"><img src="assets/browser.png" alt=""><img src="assets/email.png" alt=""><img src="assets/calendar.png" alt=""><img src="assets/gallery.png" alt=""></span>';
    const item = apps.find(app => app[0] === id);
    if (!item) return '';
    return iconAssets.has(id)
      ? `<span class="app-icon"><img src="assets/${id}.png" alt=""></span>`
      : `<span class="app-icon fallback" style="--icon-light:${item[3]};--icon-dark:${item[4]}">${item[2]}</span>`;
  };
  const launcherIcon = id => `<button class="launcher-icon" data-action="${id === 'apps' ? 'drawer' : id === 'google' ? 'google-folder' : 'open-app'}" ${id === 'apps' ? '' : `data-app="${id}"`} aria-label="${safe(appNames[id] || 'Apps')}">${appIcon(id)}<span>${safe(appNames[id] || 'Apps')}</span></button>`;
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
  const statusIndicators = () => `<span class="status-right">${data.settings.bluetooth ? '<img class="status-bluetooth" src="assets/stat_sys_data_bluetooth.png" alt="">' : ''}${data.settings.wifi && data.settings.wifiNetwork ? '<img src="assets/stat_sys_wifi_signal_4_fully.png" alt="">' : ''}<img src="assets/${data.settings.airplane ? 'stat_sys_signal_flightmode' : 'stat_sys_signal_4_fully'}.png" alt=""><img class="status-battery" src="assets/stat_sys_battery_71.png" alt=""><span class="status-clock">${clock()}</span></span>`;

  function renderStatus() {
    const notificationIcons = data.notifications.length ? `${data.notifications.some(item => item.id === 2) ? '<img src="assets/stat_notify_sms.png" alt="">' : ''}${data.notifications.some(item => item.id !== 2) ? '<img src="assets/stat_notify_more.png" alt="">' : ''}` : '';
    statusRoot.innerHTML = `<button class="status-button" data-action="shade" aria-label="Open notifications"><span class="status-left">${notificationIcons}</span>${statusIndicators()}</button>`;
    i18n.translateDOM(statusRoot);
  }
  function renderNav() {
    navRoot.innerHTML = `<button class="nav-key nav-back" data-action="back" aria-label="Back"><img src="assets/nav-back.png" alt=""></button><button class="nav-key nav-home" data-action="home" aria-label="Home screen"><img src="assets/nav-home.png" alt=""></button><button class="nav-key nav-recent" data-action="recent" aria-label="Recent apps"><img src="assets/nav-recent.png" alt=""></button>`;
  }
  function render() {
    screen.className = `screen wallpaper-${data.wallpaper}${data.settings.largeText ? ' large-text' : ''}${ui.sleeping?' sleeping':''}`;
    screen.style.background = data.wallpaper === 11 && data.customWallpaperPhoto ? `#080d14 url('${ICSMedia.image(data.customWallpaperPhoto)}') center / cover no-repeat` : data.wallpaper === 11 && data.customWallpaper ? `linear-gradient(160deg, ${data.customWallpaper[0]}, ${data.customWallpaper[1]} 53%, ${data.customWallpaper[2]})` : `#080d14 url('assets/wallpaper_${wallpaperFiles[data.wallpaper] || 'chroma'}.jpg') center center / cover no-repeat`;
    screen.style.filter = `brightness(${.5 + data.settings.brightness / 135})`;
    renderStatus(); renderNav();
    if (ui.view === 'lock') viewport.innerHTML = renderLock();
    else if (ui.view === 'home') viewport.innerHTML = renderHome();
    else if (ui.view === 'drawer') viewport.innerHTML = renderDrawer();
    else viewport.innerHTML = renderApp();
    renderOverlay();
    i18n.translateDOM(screen);
    if (ui.view === 'browser' && !ui.sub && ui.browserFind) highlightBrowserText();
    if(ui.view==='calendar' && viewport.querySelector('.cal-time-scroll'))viewport.querySelector('.cal-time-scroll').scrollTop=8*48;
  }
  function lockScreen(){captureRecentView();ui.sleeping=data.settings.screenLock==='none';ui.view=ui.sleeping?'home':'lock';ui.overlay='';render();}
  function renderLock() {
    return `<div class="lock-view"><div class="lock-clock"><div class="lock-time">${clock()}</div><div class="lock-date">${fullDate()}</div>${data.settings.showOwner?`<div class="lock-owner">${safe(data.settings.ownerInfo)}</div>`:''}</div><div class="lock-wave"><div class="lock-outer-ring"></div><button class="lock-target lock-target-unlock" data-action="unlock" aria-label="Unlock"><img src="assets/ic_lockscreen_unlock_normal.png" alt=""></button><button class="lock-target lock-target-camera" data-action="unlock-camera" aria-label="Camera"><img src="assets/ic_lockscreen_camera_normal.png" alt=""></button><button class="lock-handle" data-action="lock-hint" aria-label="Slide to unlock"><img src="assets/ic_lockscreen_handle_normal.png" alt=""></button></div><div class="lock-carrier">${carrierName()}</div></div>`;
  }
  function analogClock() {
    const now = deviceDate();
    return `<div class="analog-clock" aria-label="${clock()}"><img class="clock-dial" src="assets/appwidget_clock_dial.png" alt=""><img class="clock-hour" src="assets/appwidget_clock_hour.png" alt="" style="transform:rotate(${(now.getHours() % 12) * 30 + now.getMinutes() / 2}deg)"><img class="clock-minute" src="assets/appwidget_clock_minute.png" alt="" style="transform:rotate(${now.getMinutes() * 6}deg)"></div>`;
  }
  function widgetArt(type) {
    if (type === 'analog') return analogClock();
    if (type === 'digital') return `<strong class="widget-time">${clock()}</strong><span>${fullDate()}</span>`;
    if (type === 'calendar') return `<div class="agenda-widget"><header>${safe(deviceDate().toLocaleDateString(i18n.locale(), {weekday:'short', month:'short', day:'numeric'}))}</header>${data.events.filter(event => event.date >= today()).sort((a,b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0,3).map(event => `<div><time>${safe(event.time)}</time><strong>${safe(event.title)}</strong><small>${safe(event.date)}</small></div>`).join('') || '<p>No events</p>'}</div>`;
    if (type === 'weather') return '<strong class="widget-weather">☀ 22°</strong><span>Sunny · San Francisco</span>';
    if (type === 'music') return `<div class="music-widget"><img src="assets/music.png" alt=""><span><strong>${safe(tracks[ui.musicTrack].title)}</strong><small>${safe(tracks[ui.musicTrack].artist)}</small></span><span class="widget-play">${ui.musicPlaying ? 'Ⅱ' : '▶'}</span></div>`;
    if (type === 'power') return `<div class="power-widget">${[['wifi','wifi'],['bluetooth','bluetooth'],['gps','gps'],['autoSync','sync'],['brightness','brightness']].map(([key,asset]) => `<span class="power-cell ${data.settings[key] ? 'enabled' : ''}"><img src="assets/power-${asset}-${key === 'brightness' ? data.settings.brightness > 70 ? 'full' : data.settings.brightness > 25 ? 'half' : 'off' : data.settings[key] ? 'on' : 'off'}.png" alt=""><i></i></span>`).join('')}</div>`;
    return `<span class="widget-photo" style="${photoStyle(data.photos[0] || {colors:['#31678a','#c5a083','#191c36']})}"></span>`;
  }
  const homeWidget = widget => {
    const spec = widgetSize(widget);
    const body = widget.type === 'power' ? `<div class="power-widget">${[['wifi','Wi-Fi','wifi'],['bluetooth','Bluetooth','bluetooth'],['gps','GPS satellites','gps'],['autoSync','Auto-sync','sync'],['brightness','Brightness','brightness']].map(([key,title,asset]) => `<button class="power-cell ${data.settings[key] ? 'enabled' : ''}" data-action="power-toggle" data-id="${key}" aria-label="${title}" aria-pressed="${!!data.settings[key]}"><img src="assets/power-${asset}-${key === 'brightness' ? data.settings.brightness > 70 ? 'full' : data.settings.brightness > 25 ? 'half' : 'off' : data.settings[key] ? 'on' : 'off'}.png" alt=""><i></i></button>`).join('')}</div>` : `<button data-action="open-app" data-app="${spec.app || 'gallery'}" aria-label="${safe(spec.name || 'Widget')}">${widgetArt(widget.type)}</button>${widget.type === 'music' ? `<button class="music-widget-toggle" data-action="widget-music-play" aria-label="${ui.musicPlaying ? 'Pause' : 'Play'}"></button>` : ''}`;
    return `<div class="home-widget widget-${widget.type}" data-widget-id="${safe(widget.id)}" style="grid-column:${widget.x + 1}/span ${spec.width};grid-row:${widget.y + 1}/span ${spec.height}">${body}</div>`;
  };
  const wallpaperChoices = () => `<div class="wallpaper-grid">${wallpaperFiles.map((name, i) => `<button class="wallpaper-choice ${data.wallpaper === i ? 'selected' : ''}" data-action="wallpaper" data-id="${i}" aria-label="${safe(name)}"><span class="wallpaper-swatch" style="background-image:url('assets/wallpaper_${name}.jpg')"></span><strong>${safe(name[0].toUpperCase() + name.slice(1))}</strong></button>`).join('')}</div>`;
  function renderHome() {
    return `<div class="home-view"><div class="home-search"><button data-action="browser-search" aria-label="Search"><span class="google-word">Google</span></button><button class="voice-search" data-action="voice-search" aria-label="Voice search"><img class="search-microphone" src="assets/ic_btn_speak_now.png" alt=""></button></div><div class="home-content"><div class="home-pages" style="transform:translateX(${-ui.page * 100}%)">${data.homePages.map((page, index) => `<div class="home-grid" data-home-page="${index}" ${index !== ui.page ? 'inert' : ''}>${page.map((id, slot) => `<div class="home-slot" data-home-slot="${slot}" style="grid-column:${slot % 4 + 1};grid-row:${Math.floor(slot / 4) + 1}">${id ? launcherIcon(id) : ''}</div>`).join('')}${data.homeWidgets[index].map(homeWidget).join('')}</div>`).join('')}</div></div><div class="page-indicators">${Array.from({ length: 5 }, (_, i) => `<button class="${i === ui.page ? 'active' : ''}" data-action="page" data-id="${i}" aria-label="${safe(i18n.t('Home screen'))} ${i + 1}"></button>`).join('')}</div><div class="dock">${data.dock.map((id, slot) => `<div class="dock-slot" data-dock-slot="${slot}">${id ? launcherIcon(id) : ''}</div>`).join('')}</div><div class="drag-remove" data-drop-remove="true">× Remove</div></div>`;
  }
  function renderDrawer() {
    const isApps = ui.drawerTab === 'apps';
    const pages = Math.ceil((isApps ? apps.length : widgetTypes.length) / (isApps ? 20 : 4));
    const current = Math.min(ui.drawerPage, pages - 1);
    const sortedApps = [...apps].sort((a,b) => i18n.t(a[1]).localeCompare(i18n.t(b[1]), i18n.locale()));
    const items = isApps ? sortedApps.slice(current * 20, current * 20 + 20).map(app => launcherIcon(app[0])).join('') : widgetTypes.slice(current * 4, current * 4 + 4).map(widget => `<button class="drawer-widget" data-action="add-widget" data-widget-type="${widget.type}" aria-label="${safe(widget.name)}"><span class="drawer-widget-title">${safe(widget.name)} <small>${widget.width} × ${widget.height}</small></span><span class="drawer-widget-preview widget-${widget.type}">${widgetArt(widget.type)}</span></button>`).join('');
    return `<div class="drawer-view"><div class="drawer-tabs"><button class="${isApps ? 'active' : ''}" data-action="drawer-tab" data-id="apps">Apps</button><button class="${!isApps ? 'active' : ''}" data-action="drawer-tab" data-id="widgets">Widgets</button><button class="drawer-market" data-action="market" aria-label="Shop"><img src="assets/ic_launcher_market_holo.png" alt=""></button></div><div class="drawer-page ${isApps ? 'drawer-apps' : 'drawer-widgets'}">${items}</div><div class="drawer-indicators">${Array.from({length:pages},(_,i)=>`<button class="${i===current?'active':''}" data-action="drawer-page" data-id="${i}" aria-label="${safe(i18n.t('Page'))} ${i+1}"></button>`).join('')}</div></div>`;
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
    data.homeWidgets[ui.page].push({id:`widget-${Date.now()}`,type,x:spot[0],y:spot[1]});
    save(); return true;
  }
  function renderApp() {
    switch (ui.view) {
      case 'play-store': return ICSPlayStore.render(ui.play, data.playRatings || {}, key => i18n.t(key));
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
  function openApp(app, resume = false) {
    if (!appNames[app]) return;
    captureRecentView();
    if (app === 'play-store' && !resume) { ui.play = ICSPlayStore.initial(); ui.playHistory = []; }
    ui.view = app; ui.sub = resume ? ui.recentState?.[app]?.sub || '' : ''; ui.overlay = ''; if (app === 'settings' && !resume) ui.settingsRootScroll = 0;
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
  function home(resetPage = true) { captureRecentView(); ui.view = 'home'; ui.sub = ''; ui.overlay = ''; if (resetPage) ui.page = 2; render(); }
  function back() {
    if (ui.overlay) { ui.overlay = ''; render(); return; }
    if (ui.view === 'lock') return;
    if(ui.view==='phone' && ui.activeCall){if(ui.activeCall.keypad){ui.activeCall.keypad=false;render();}else home(false);return;}
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
  function renderOverlay() {
    if (ui.overlay === 'shade') {
      overlayRoot.innerHTML = `<div class="notification-shade"><div class="shade-top"><span class="shade-date">${shadeDate()}</span><button data-action="open-app" data-app="settings" aria-label="Settings"><img src="assets/ic_notify_quicksettings_normal.png" alt=""></button>${data.notifications.length ? '<button class="shade-clear" data-action="clear-notifications" aria-label="Clear notifications"><img src="assets/ic_notify_clear_normal.png" alt=""></button>' : ''}</div><div class="shade-divider"></div><div class="shade-body"><div class="shade-list">${ui.activeCall?`<button class="phone-resume-call" data-action="open-app" data-app="phone">${safe(i18n.t('Ongoing call'))} · ${safe(contactByPhone(ui.activeCall.number)?.name||ui.activeCall.number)}</button>`:''}${data.notifications.map(n => `<button class="notification" data-action="notification-open" data-id="${n.id}"><span class="notification-icon"><img src="assets/${n.id === 2 ? 'stat_notify_sms.png' : 'settings.png'}" alt=""></span><span><strong>${safe(n.title)}</strong><small>${safe(n.detail)}</small></span></button>`).join('')}</div><div class="shade-carrier">${carrierName()}</div></div><button class="shade-handle" data-action="close-overlay" aria-label="Close notifications"><img src="assets/status_bar_close_on.png" alt=""></button></div>`;
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
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="wallpaper-source" role="dialog" aria-label="Select wallpaper from"><h3>Select wallpaper from</h3><button data-action="open-wallpapers">Wallpapers</button><button data-action="gallery-wallpaper">Gallery</button></div>`;
    } else if (ui.overlay === 'google-folder') {
      overlayRoot.innerHTML = `<div class="folder-scrim" data-action="close-overlay"></div><div class="home-folder"><h3>Google</h3><div>${['play-store','browser','email','calendar','gallery'].map(id => launcherIcon(id)).join('')}</div></div>`;
    } else overlayRoot.innerHTML = '';
    i18n.translateDOM(overlayRoot);
  }

  const allWifiNetworks = () => [...wifiNetworks, ...(data.savedWifiNetworks || [])];
  const connectivityMenu = kind => `<button class="connectivity-overflow" data-action="connectivity-menu" data-id="${kind}" aria-label="More options"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button>`;
  function renderWifiSettings() {
    return appView('Wi-Fi', `<div class="connectivity-page">${data.settings.wifi ? allWifiNetworks().sort((a,b) => Number(b.name === data.settings.wifiNetwork) - Number(a.name === data.settings.wifiNetwork) || b.strength - a.strength || a.name.localeCompare(b.name, i18n.locale())).map(network => `<button class="settings-row network-row" data-action="wifi-network" data-id="${safe(network.name)}"><span class="row-copy">${safe(network.name)}<small>${data.settings.wifiNetwork === network.name ? i18n.t('Connected') : network.security === 'Open' ? i18n.t('Open network') : i18n.t('Secured with WPA2')}</small></span><span class="network-signal"><img src="assets/${network.security === 'Open' ? `ic_wifi_signal_${network.strength >= 3 ? 3 : 2}` : 'ic_wifi_lock_signal_4'}.png" alt=""></span></button>`).join('') : '<p class="connectivity-empty">Turn on Wi-Fi to see available networks</p>'}</div>`, '', connectivitySwitch('wifi', 'Wi-Fi', true) + connectivityMenu('wifi'));
  }
  function renderBluetoothSettings() {
    const deviceRow = (name, paired) => `<button class="settings-row network-row" data-action="bluetooth-pair" data-id="${safe(name)}"><span class="network-signal"><img src="assets/${name === 'Car Audio' ? 'ic_bt_headphones_a2dp' : 'ic_bt_headset_hfp'}.png" alt=""></span><span class="row-copy">${safe(name)}${paired ? '<small>Paired</small>' : ''}</span>${paired ? '<img class="bt-config-icon" src="assets/ic_bt_config.png" alt="">' : ''}</button>`;
    return appView('Bluetooth', `<div class="connectivity-page">${data.settings.bluetooth ? `<button class="settings-row network-row" data-action="toggle-setting" data-id="bluetoothVisible"><span class="network-signal"><img src="assets/ic_bt_cellphone.png" alt=""></span><span class="row-copy">${safe(data.settings.bluetoothName || 'Galaxy Nexus')}<small>${data.settings.bluetoothVisible ? i18n.t('Visible to nearby Bluetooth devices') : i18n.t('Not visible to other Bluetooth devices')}</small></span></button>${data.settings.pairedDevice ? `${label('PAIRED DEVICES')}${deviceRow(data.settings.pairedDevice, true)}` : ''}${label('AVAILABLE DEVICES')}${ui.bluetoothScanned ? ['Wireless Headset','Car Audio'].filter(name => name !== data.settings.pairedDevice).map(name => deviceRow(name, false)).join('') : '<p class="connectivity-empty small">Tap Scan to find nearby devices</p>'}` : '<p class="connectivity-empty">Turn on Bluetooth to see nearby devices</p>'}</div>`, '', connectivitySwitch('bluetooth', 'Bluetooth', true) + connectivityMenu('bluetooth'));
  }

  function renderSettings() {
    const s = ui.sub;
    const system=ICSSystemSettings.render(data,ui,key=>i18n.t(key),i18n.locale());
    if(system)return appView(system.title,system.body,'sx-page',system.right);
    const detail=ICSSettingsDetail.render(data,ui,apps,key=>i18n.t(key));
    if(detail)return appView(detail.title,detail.body,'sd-page');
    if (s === 'wifi') return renderWifiSettings();
    if (s === 'bluetooth') return renderBluetoothSettings();
    if (s === 'wallpaper') {
      return appView('Wallpaper', wallpaperChoices());
    }
    if (s === 'about') return appView('About phone', `${row('Status', 'Phone number, signal, etc.', 'settings-sub', 'about-status')}${row('Legal information', '', 'settings-sub', 'about-legal')}${row('Model number', 'Galaxy Nexus', 'noop', '')}${row('Android version', '4.0.4', 'about-tap', '')}${row('Baseband version', 'I9250XXLA02', 'noop', '')}${row('Kernel version', '3.0.8-g034fec9\nandroid-build@vpbs1 #1\nTue Mar 13 15:46:20 PDT 2012', 'noop', '')}${row('Build number', 'IMM76D', 'developer-tap', '')}`, 'about-settings');
    if (s === 'about-status') return appView('Status', `${row('Battery status', 'Discharging', 'noop', '')}${row('Battery level', '78%', 'noop', '')}${row('Network', carrierName(), 'noop', '')}${row('Signal strength', data.settings.airplane ? '0 dBm  99 asu' : '-75 dBm  19 asu', 'noop', '')}${row('Phone number', 'Unknown', 'noop', '')}${row('Wi-Fi MAC address', '02:00:00:40:04:01', 'noop', '')}${row('Bluetooth address', data.settings.bluetooth ? '02:00:00:40:04:02' : 'Unavailable', 'noop', '')}`, 'about-settings');
    if (s === 'about-legal') return appView('Legal information', `${row('Open source licenses', 'Android Open Source Project', 'noop', '')}${row('Google legal', 'Offline demonstration', 'noop', '')}`, 'about-settings');
    if (s === 'about-safety') return appView('Safety information', `<div class="detail-pad"><p>Galaxy Nexus safety information is not available in this offline simulation.</p></div>`, 'about-settings');
    if (s === 'easter') return `<div class="easter-view">${ui.easterNyan ? `<div class="nyan-sky" data-action="back" role="button" tabindex="0" aria-label="Close Nyandroid">${Array.from({length:20}, (_, i) => `<span class="nyan-star" style="--x:${(i * 47) % 97}%;--y:${(i * 31) % 93}%;--delay:-${(i * 7) % 12 / 10}s"></span>`).join('')}${Array.from({length:20}, (_, i) => `<span class="nyan-cat" style="--top:${(i * 37) % 89}%;--delay:-${(i * 13) % 91 / 10}s;--duration:${5 + i % 6}s;--size:${58 + i % 4 * 18}px"></span>`).join('')}</div>` : '<button class="easter-robot" data-action="egg-nyan" aria-label="Android easter egg"><img src="assets/platlogo.png" alt="Ice Cream Sandwich Android"></button>'}</div>`;
    if (s === 'wireless') return appView('Wireless & networks', `${wirelessCheckRow('Airplane mode', '', 'airplane')}${wirelessRow('VPN', '', 'vpn')}${wirelessRow('Tethering & portable hotspot', '', 'tethering')}${wirelessCheckRow('NFC', 'Allow data exchange when the phone touches another device', 'nfc')}${wirelessRow('Android Beam', 'Ready to transmit app content via NFC', 'beam')}${wirelessCheckRow('WiFi direct', '', 'wifiDirect')}${wirelessRow('Mobile networks', '', 'mobile-networks')}`, 'wireless-more');
    if (s === 'beam') return appView('Android Beam', `${wirelessCheckRow('Android Beam', 'Ready to transmit app content via NFC', 'androidBeam')}`, 'wireless-more');
    if (s === 'brightness') return appView('Brightness', `<div class="detail-pad"><h3>Brightness</h3><input type="range" min="10" max="100" value="${data.settings.brightness}" data-field="brightness" aria-label="Brightness"><p>${data.settings.brightness}%</p></div>`);
    if (s === 'sync') return appView('Accounts & sync', `${toggleRow('Auto-sync', 'Sync app data automatically', 'autoSync', '↻')}${label('ACCOUNTS')}${row('Google', 'demo@android.local', 'settings-sub', 'sync-google', '◎')}${row('Add account', '', 'toast', 'Demo account already added', '+')}`);
    if (s === 'sync-google') return appView('Google', `<div class="detail-pad"><h3>demo@android.local</h3><p>Sample account data is stored only in this browser.</p></div>${row('Sync Gmail', 'Last synced today', 'noop', '', '✉')}${row('Sync Calendar', 'Last synced today', 'noop', '', '▦')}${row('Sync Contacts', 'Last synced today', 'noop', '', '◉')}`);
    if (s === 'location') return appView('Location services', `${toggleRow("Google's location service", 'Let apps use approximate location', 'networkLocation', '◎')}${toggleRow('GPS satellites', 'Let apps use precise location', 'gps', '◉')}`);
    if (s === 'backup') return appView('Backup & reset', `${label('BACKUP & RESTORE')}${toggleRow('Back up my data', 'Back up app data and settings', 'backup', '↻')}${toggleRow('Automatic restore', 'Restore settings when reinstalling apps', 'autoRestore', '↻')}${label('PERSONAL DATA')}${row('Factory data reset', 'Erase local simulator data', 'settings-sub', 'reset-info', '⚠')}`);
    if (s === 'reset-info') return appView('Factory data reset', `<div class="detail-pad"><h3>Erase local simulator data</h3><p>This clears the saved home screens, settings, and sample content for this version.</p><button class="small-button" data-action="factory-reset">Reset simulator</button></div>`);
    if (s === 'accessibility') return appView('Accessibility', `${label('SERVICES')}${row('No services installed', '', 'noop', '', '')}${label('SYSTEM')}${toggleRow('Large text', 'Use larger text in Settings', 'largeText', 'A')}${toggleRow('Auto-rotate screen', '', 'rotate', '↻')}${toggleRow('Speak passwords', 'Speak password characters as you type', 'speakPasswords', '◉')}`);
    if (s === 'development') return appView('Developer options', `${toggleRow('USB debugging', 'Debug mode when USB is connected', 'usbDebug', '⚙')}${toggleRow('Stay awake', 'Screen will never sleep while charging', 'stayAwake', '◷')}${toggleRow('Allow mock locations', 'Permit mock locations', 'mockLocations', '◎')}${label('USER INTERFACE')}${toggleRow('Show touches', 'Show visual feedback for touches', 'showTouches', '◉')}`);
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
    if(ui.activeCall)return ICSPhoneCall.render(ui.activeCall,contactByPhone(ui.activeCall.number),key=>i18n.t(key));
    if(ui.sub==='call-detail'){const call=(data.callHistory||[]).find(call=>call.time===ui.phoneCallId);if(call)return ICSPhoneCall.details(call,contactByPhone(call.number),key=>i18n.t(key),i18n.locale());}
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
    return `<div class="app-view"><div class="ics-calculator"><div class="ics-calc-display"><output aria-label="Calculator display">${safe(ui.calc)}</output><button data-action="calc-menu" aria-label="More options"><img src="assets/ic_menu_overflow.png" alt=""></button></div><div class="ics-calc-delete"><span></span><button data-action="calc-key" data-id="${ui.calcFresh ? 'C' : '⌫'}" aria-label="${ui.calcFresh ? 'Clear' : 'Delete'}">${ui.calcFresh ? 'CLR' : 'DEL'}</button></div><div class="calc-pager"><div class="calc-panels" style="transform:translateX(-${ui.calcPanel * 50}%)"><div class="ics-calc-grid" aria-label="Basic panel" ${ui.calcPanel ? 'inert' : ''}>${keys(basic)}</div><div class="ics-calc-grid scientific" aria-label="Advanced panel" ${ui.calcPanel ? '' : 'inert'}>${keys(advanced,true)}</div></div></div></div></div>`;
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
    if(previous!==ui.music.track || !ui.music.playing){saveMusic();if(ui.view==='music'||ui.view==='home')render();}
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
    data.mailbox=ICSEmail.restore(null,emailData,[]);ui.music=ICSMusic.restore();ui.musicTrack=0;ui.musicPlaying=false;ui.musicPosition=0;
    ui.activeCall=null;ui.sleeping=false;ui.vpnConnected=null;ui.calendarMode='Month';ui.emailFolder='Inbox';ui.emailQuery=undefined;ui.emailSelected=[];ui.recent=[];ui.recentState={};ui.recentSnapshots={};
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
    switch (action) {
      case 'open-app': openApp(app || id, !!button.closest('.recent-item')); break;
      case 'home': if (ui.view !== 'lock') home(); break;
      case 'back': back(); break;
      case 'drawer': ui.view = 'drawer'; ui.sub = ''; ui.overlay = ''; render(); break;
      case 'google-folder': ui.overlay = 'google-folder'; renderOverlay(); break;
      case 'drawer-tab': ui.drawerTab = id; ui.drawerPage = 0; render(); break;
      case 'drawer-page': ui.drawerPage = Number(id); render(); break;
      case 'add-widget': if (addWidget(button.dataset.widgetType)) { home(false); toast('Widget added'); } else toast('This home screen is full'); break;
      case 'open-wallpapers': ui.overlay = ''; ui.view = 'wallpaper-picker'; render(); break;
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
      case 'widget-music-play': ui.music.playing=!ui.music.playing;if(ui.music.playing&&ui.music.position>=tracks[ui.music.track].duration)ui.music.position=0;saveMusic();render();break;
      case 'voice-search': toast('Voice search unavailable offline'); break;
      case 'lock-hint': screen.classList.add('lock-dragging'); setTimeout(() => { if (!pointerStart?.lockDrag) screen.classList.remove('lock-dragging'); }, 1000); break;
      case 'shade': ui.overlay = ui.overlay === 'shade' ? '' : 'shade'; renderOverlay(); break;
      case 'recent': if (ui.view === 'lock') break; if (ui.overlay !== 'recent') captureRecentView(); ui.overlay = ui.overlay === 'recent' ? '' : 'recent'; renderOverlay(); break;
      case 'close-overlay': ui.overlay = ''; renderOverlay(); break;
      case 'remove-recent': event.stopPropagation(); ui.recent = ui.recent.filter(item => item !== id); renderOverlay(); break;
      case 'clear-notifications': data.notifications = []; ui.overlay = ''; save(); renderStatus(); renderOverlay(); break;
      case 'notification-open': ui.overlay = ''; if (Number(id) === 2) openMessageThread(1); else { ui.view = 'settings'; ui.sub = 'about'; render(); } break;
      case 'unlock': ui.view = 'home'; render(); break;
      case 'unlock-camera': openApp('camera'); break;
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
      case 'sx-dialog': ui.systemField=id;ui.systemError='';ui.systemValues=null;ui.overlay='sx-dialog';renderOverlay();break;
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
      case 'wallpaper': data.wallpaper = Number(id); delete data.customWallpaper; delete data.customWallpaperPhoto; save(); if (ui.view === 'wallpaper-picker') home(false); else render(); toast('Wallpaper set'); break;
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
      case 'phone-tab': ui.phoneTab = id; ui.phoneSearch = undefined; render(); break;
      case 'phone-search': ui.phoneTab = 'favorites'; ui.phoneSearch = ''; ui.overlay = ''; render(); viewport.querySelector('.phone-search input')?.focus(); break;
      case 'phone-menu': ui.overlay = 'phone-menu'; renderOverlay(); break;
      case 'phone-add-contact': openApp('people'); editPerson(true); ui.peopleDraft.phone=ui.dial; render(); break;
      case 'phone-redial': startPhoneCall(id); break;
      case 'dial': if (ui.dial.length < 30) ui.dial += id; render(); break;
      case 'dial-delete': ui.dial = ui.dial.slice(0, -1); render(); break;
      case 'call': if(!ui.dial){toast('Enter a phone number');break;}startPhoneCall(ui.dial);break;
      case 'hangup': if(ui.activeCall)data.callHistory=[...(data.callHistory||[]),ICSPhoneCall.finish(ui.activeCall)].slice(-50);ui.activeCall=null;save();ui.sub='';ui.dial='';render();toast('Call ended');break;
      case 'incall-toggle': if(ui.activeCall)ui.activeCall[id]=!ui.activeCall[id];render();break;
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
      case 'photo-wallpaper': {const photo=data.photos.find(p=>p.id===Number(id));if(!photo)break;data.wallpaper=11;data.customWallpaper=photo.colors;data.customWallpaperPhoto=clone(photo);save();ui.overlay='';render();toast('Wallpaper set');break;}
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
      case 'event-open': ui.selectedEvent=Number(id);ui.sub='event';render();break;
      case 'event-edit': calendarEdit(data.events.find(item=>item.id===ui.selectedEvent));break;
      case 'event-cancel': ui.sub=ui.eventDraft?.id?'event':'';ui.eventDraft=null;calendarRender();break;
      case 'event-delete': ui.overlay='calendar-delete';renderOverlay();break;
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
        const existing=data.events.findIndex(item=>item.id===event.id);
        if(existing<0)data.events.push(event);else data.events[existing]=event;
        save();ui.selectedDate=event.date;ui.selectedEvent=event.id;ui.eventDraft=null;ui.sub='event';render();toast('Event saved');break;
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
      case 'sd-choice': {const choice=String(values.get('choice'));if(ui.settingsField==='sleep')data.settings.sleep=Number(choice);else if(ui.settingsField==='font')data.settings.largeText=choice==='large';else if(ui.settingsField==='silent'){data.settings.silent=choice!=='off';data.settings.silentMode=choice;}else data.settings[ui.settingsField]=choice;save();ui.overlay='';render();break;}
      default: break;
    }
  });
  document.addEventListener('input', event => {
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
    const direction = x - rect.left < 18 ? -1 : rect.right - x < 18 ? 1 : 0;
    if (direction !== dragState.edgeDirection) {
      clearTimeout(dragState.edgeTimer);
      dragState.edgeDirection = direction;
      if (direction && y > rect.top + 85 && y < rect.bottom - 120) dragState.edgeTimer = setTimeout(() => {
        if (dragState) { setHomePage(ui.page + direction); dragState.edgeDirection = 0; }
      }, 550);
    }
  }
  function finishDrag(x, y) {
    if (!dragState) return false;
    const source = dragState;
    const target = document.elementFromPoint(x, y);
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
    if (source.widgetType) {
      const oldWidget = source.type === 'widget' ? data.homeWidgets[source.page].find(widget => widget.id === source.id) : null;
      if (remove && oldWidget) data.homeWidgets[source.page] = data.homeWidgets[source.page].filter(widget => widget.id !== source.id);
      else if (homeSlot) {
        const rect = homeSlot.closest('.home-grid').getBoundingClientRect();
        const column = Math.round((x - rect.left - 6 - source.grabOffset.x) / ((rect.width - 12) / 4));
        const row = Math.round((y - rect.top - 5 - source.grabOffset.y) / ((rect.height - 5) / 4));
        if (widgetFits(ui.page, column, row, oldWidget || source.widgetType, oldWidget?.id || '')) {
          if (oldWidget) {
            data.homeWidgets[source.page] = data.homeWidgets[source.page].filter(widget => widget.id !== source.id);
            oldWidget.x = column; oldWidget.y = row;
            data.homeWidgets[ui.page].push(oldWidget);
          }
          else addWidget(source.widgetType, column, row);
        } else toast('This home screen is full');
      }
    } else {
      const sourceList = source.type === 'home' ? data.homePages[source.page] : source.type === 'dock' ? data.dock : null;
      if (remove && sourceList) { sourceList[source.slot] = null; toast('Shortcut removed'); }
      else if (homeSlot) {
        const slot = Number(homeSlot.dataset.homeSlot);
        const covered = data.homeWidgets[ui.page].some(widget => slot % 4 >= widget.x && slot % 4 < widget.x + widgetSize(widget).width && Math.floor(slot / 4) >= widget.y && Math.floor(slot / 4) < widget.y + widgetSize(widget).height);
        if (!covered) {
          const destination = data.homePages[ui.page], previous = destination[slot];
          if (!previous || sourceList) {
            destination[slot] = source.id;
            if (sourceList) sourceList[source.slot] = previous;
          } else toast('This space is occupied');
        }
      } else if (dockSlot && Number(dockSlot.dataset.dockSlot) !== 2) {
        const slot = Number(dockSlot.dataset.dockSlot), previous = data.dock[slot];
        if (!previous || sourceList) { data.dock[slot] = source.id; if (sourceList) sourceList[source.slot] = previous; }
        else toast('This space is occupied');
      } else if (pageButton) {
        const nextPage = Number(pageButton.dataset.id);
        const slot = data.homePages[nextPage].findIndex((id, index) => id === null && !data.homeWidgets[nextPage].some(widget => index % 4 >= widget.x && index % 4 < widget.x + widgetSize(widget).width && Math.floor(index / 4) >= widget.y && Math.floor(index / 4) < widget.y + widgetSize(widget).height));
        if (slot >= 0) { data.homePages[nextPage][slot] = source.id; if (sourceList) sourceList[source.slot] = null; ui.page = nextPage; }
        else toast('This home screen is full');
      }
    }
    clearTimeout(source.edgeTimer); source.ghost.remove(); dragState = null; screen.classList.remove('dragging');
    save(); render(); suppressClickUntil = Date.now() + 350;
    return true;
  }
  function setHomePage(page) {
    ui.page = Math.max(0, Math.min(4, page));
    const track = viewport.querySelector('.home-pages');
    if (!track) return;
    track.style.transition = '';
    track.style.transform = `translateX(${-ui.page * 100}%)`;
    track.querySelectorAll('.home-grid').forEach((grid, index) => { grid.inert = index !== ui.page; });
    viewport.querySelectorAll('.page-indicators button').forEach((button,index) => button.classList.toggle('active', index === ui.page));
    screen.classList.add('show-page-indicator');
    clearTimeout(ui.pageIndicatorTimer);
    ui.pageIndicatorTimer = setTimeout(() => screen.classList.remove('show-page-indicator'), 800);
  }
  function moveHomePage(dx) {
    const content = viewport.querySelector('.home-pages');
    if (!content) return;
    const distance = Math.max(-(4 - ui.page) * screen.clientWidth, Math.min(ui.page * screen.clientWidth, dx));
    content.style.transition = 'none';
    content.style.transform = `translateX(calc(${-ui.page * 100}% + ${distance}px))`;
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
    event.preventDefault();
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
  screen.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (data.settings.showTouches) { const dot = document.createElement('span'); const rect = screen.getBoundingClientRect(); dot.className = 'touch-indicator'; dot.style.left = `${event.clientX - rect.left}px`; dot.style.top = `${event.clientY - rect.top}px`; screen.append(dot); setTimeout(() => dot.remove(), 400); }
    const scrollTarget = event.pointerType === 'mouse' && !ui.overlay && !event.target.closest('input, select, textarea, .wallpaper-choice')
      ? (ui.view === 'settings' && event.target.closest('.settings-app .app-content') ? event.target.closest('.settings-app') : event.target.closest('.play-content,.mms-scroll,.people-scroll,.browser-page,.web-tabs,.web-library,.desk-scroll,.gallery-scroll,.cal-scroll,.music-library-scroll,.email-scroll')) : null;
    pointerStart = { x: event.clientX, y: event.clientY, target: event.target, source: dragSource(event.target), pointerType: event.pointerType, pointerId: event.pointerId, downTime: performance.now(), scrollTarget, scrollTop: scrollTarget?.scrollTop || 0, lockDrag: ui.view === 'lock' && !!event.target.closest('.lock-handle'), shadeDragEligible: !ui.overlay && !!event.target.closest('#status-bar'), shadeCloseEligible: ui.overlay === 'shade' && !!event.target.closest('.shade-handle,.shade-top'), pageSwipeEligible: ui.view === 'home' && !ui.overlay && !!event.target.closest('.home-view') && !event.target.closest('.dock, .page-indicators, .home-search'), drawerSwipeEligible: ui.view === 'drawer' && !!event.target.closest('.drawer-page') };
    if (ui.view === 'home' && !ui.overlay && event.target.closest('.home-slot') && !pointerStart.source) homeLongPressTimer = setTimeout(() => { ui.overlay = 'wallpaper-source'; renderOverlay(); pointerStart = null; }, 550);
    const message = event.target.closest('.mms-message');
    if (message && !ui.overlay) messageHoldTimer = setTimeout(() => { ui.mmsMessage = message.dataset.id; ui.overlay = 'mms-message'; suppressClickUntil = Date.now() + 700; renderOverlay(); }, 550);
    if (pointerStart.lockDrag) { screen.classList.add('lock-dragging'); try { screen.setPointerCapture(event.pointerId); } catch {} }
    if (event.target.closest('.easter-robot')) eggTimer = setTimeout(() => { event.target.closest('.easter-robot')?.classList.add('expanding'); eggTimer = setTimeout(() => { ui.easterNyan = true; render(); }, 1100); }, 850);
    if (ui.view === 'calculator' && !ui.overlay && event.target.closest('.calc-pager')) pointerStart.calculatorSwipe = true;
    if (event.target.closest('.ics-calc-delete button')) calculatorClearTimer = setTimeout(() => { operateCalculator('C'); suppressClickUntil = Date.now() + 350; render(); }, 600);
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
    if (pointerStart.lockDrag) { event.preventDefault(); const handle = viewport.querySelector('.lock-handle'); if (handle) handle.style.setProperty('--lock-x', `${Math.max(-112, Math.min(112, dx))}px`); return; }
    if (pointerStart.shadeDragging || pointerStart.shadeDragEligible && dy > 8 && dy > Math.abs(dx) || pointerStart.shadeCloseEligible && dy < -8 && -dy > Math.abs(dx)) {
      if (!pointerStart.shadeDragging) { pointerStart.shadeDragging = true; ui.overlay = 'shade'; renderOverlay(); try { screen.setPointerCapture(event.pointerId); } catch {} }
      event.preventDefault();
      const shade = overlayRoot.querySelector('.notification-shade');
      if (shade) {
        shade.style.animation = 'none';
        shade.style.bottom = 'auto';
        shade.style.height = `${Math.max(78, Math.min(screen.clientHeight - 71, pointerStart.shadeCloseEligible ? screen.clientHeight - 71 + dy : dy))}px`;
      }
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
        if (shade) { const height = shade.clientHeight; shade.style.removeProperty('height'); shade.style.removeProperty('bottom'); shade.animate([{height:`${height}px`},{height:`${screen.clientHeight - 71}px`}], {duration:180,easing:'ease-out'}); }
      }
      pointerStart = null; return;
    }
    if (pointerStart.lockDrag) {
      screen.classList.remove('lock-dragging');
      if (dx > 75) { suppressClickUntil = Date.now() + 350; home(); }
      else if (dx < -75) { suppressClickUntil = Date.now() + 350; openApp('camera'); }
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
    if (!ui.overlay && pointerStart.target.closest('#status-bar') && dy > 45) { ui.overlay = 'shade'; renderOverlay(); }
    pointerStart = null;
  });
  window.addEventListener('pointercancel', () => { clearTimeout(calculatorClearTimer); clearTimeout(messageHoldTimer); const calcTrack = viewport.querySelector('.calc-panels'); if (calcTrack) { calcTrack.style.transition = ''; calcTrack.style.transform = `translateX(-${ui.calcPanel * 50}%)`; } clearTimeout(eggTimer); clearTimeout(dragTimer); clearTimeout(homeLongPressTimer); clearTimeout(dragState?.edgeTimer); dragState?.ghost.remove(); dragState = null; screen.classList.remove('dragging', 'page-swiping', 'settings-scrolling', 'lock-dragging'); setHomePage(ui.page); const drawerPage = viewport.querySelector('.drawer-page'); if (drawerPage) drawerPage.style.transform = ''; const lockHandle = viewport.querySelector('.lock-handle'); if (lockHandle) lockHandle.style.removeProperty('--lock-x'); if (pointerStart?.shadeDragging || ui.overlay === 'recent' || ui.overlay === 'shade') renderOverlay(); pointerStart = null; });
  window.addEventListener('pointercancel',()=>{const photo=viewport.querySelector('.gallery-image');if(photo)photo.style.transform='';});
  window.addEventListener('pointercancel',()=>{const surface=viewport.querySelector('[data-calendar-swipe]');if(surface)surface.style.transform='';});
  document.addEventListener('keydown', event => {
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
  document.querySelector('#power-button').addEventListener('click', () => {if(ui.sleeping||ui.view==='lock'){ui.sleeping=false;home(false);}else lockScreen();});
  screen.addEventListener('pointerdown',()=>{if(ui.sleeping){ui.sleeping=false;suppressClickUntil=Date.now()+350;home(false);}},true);
  let lastActivity=Date.now();
  for(const name of ['pointerdown','keydown','input','wheel'])document.addEventListener(name,()=>{lastActivity=Date.now();},{passive:true});
  const languageSelect = document.querySelector('#language-select');
  languageSelect.value = i18n.language;
  languageSelect.addEventListener('change', event => { i18n.setLanguage(event.target.value); location.reload(); });
  document.querySelector('#reset-button').addEventListener('click', () => {
    if (!confirm(i18n.t('Reset all local ICS simulator data?'))) return;
    resetSimulator();
  });
  setInterval(() => {
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
  }, 1000);

  i18n.translateDOM(document.body);
  render();
})();
