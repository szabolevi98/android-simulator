/* Android 2.3.6 home screen widgets: DeskClock's analog_appwidget (appwidget_clock_dial / hour / minute), Settings'
   Power control (widget.xml: appwidget_bg, five buttons split by appwidget_settings_divider, ic_appwidget_settings_*
   icons over the appwidget_settings_ind_on / mid / off indicator bars), Gallery3D's Picture frame (photo_frame.xml:
   appwidget_bg, 3 dip padding, photo_inner) and Browser's Bookmarks widget (bookmarkwidget.xml: previous / title / next
   over the page thumbnail). Provider labels and sizes come from each app's appwidget-provider XML. 1 dp = 0.8625 px. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // AppWidgetPickActivity lists the providers sorted by label: the AOSP ones plus the Google apps' of the Nexus S image
  // (minWidth / minHeight 294 x 72 dip: 4 x 1; 146 x 146 dip: 2 x 2).
  const PROVIDERS = [
    {type: 'analog', label: 'Analog clock', app: 'clock', width: 2, height: 2},
    {type: 'bookmarks', label: 'Bookmarks', app: 'browser', width: 4, height: 4},
    {type: 'search', label: 'Google Search', app: 'search', width: 4, height: 1},
    {type: 'protips', label: 'Home screen tips', app: 'settings', width: 4, height: 1},
    {type: 'market', label: 'Market', app: 'play-store', width: 2, height: 2},
    {type: 'music', label: 'Music', app: 'music', width: 4, height: 1},
    {type: 'news-weather', label: 'News & Weather', app: 'news-weather', width: 4, height: 1},
    {type: 'photo', label: 'Picture frame', app: 'gallery', width: 2, height: 2},
    {type: 'power', label: 'Power control', app: 'settings', width: 4, height: 1},
    {type: 'youtube', label: 'YouTube', app: 'youtube', width: 4, height: 1}
  ];
  function analog(now) {
    const hour = (now.getHours() % 12) * 30 + now.getMinutes() / 2, minute = now.getMinutes() * 6;
    return `<button class="gbw-analog" data-action="open-app" data-app="clock" aria-label="Analog clock"><img src="assets/gb-w-dc-appwidget_clock_dial.png" alt=""><img class="hand" src="assets/gb-w-dc-appwidget_clock_hour.png" style="transform:rotate(${hour}deg)" alt=""><img class="hand" src="assets/gb-w-dc-appwidget_clock_minute.png" style="transform:rotate(${minute}deg)" alt=""></button>`;
  }
  // SettingsAppWidgetProvider: Wi-Fi, Bluetooth, GPS, Sync and the brightness cycle (low / mid / full / auto).
  function brightnessState(settings) {
    if (settings.autoBrightness) return 'auto';
    const b = Number(settings.brightness ?? 60);
    return b < 30 ? 'off' : b < 80 ? 'mid' : 'on';
  }
  function power(settings, t = key => key) {
    const b = brightnessState(settings);
    const cells = [
      ['wifi', 'wifi', settings.wifi ? 'on' : 'off', settings.wifi ? 'on' : 'off', 'Wi-Fi'],
      ['bluetooth', 'bluetooth', settings.bluetooth ? 'on' : 'off', settings.bluetooth ? 'on' : 'off', 'Bluetooth'],
      ['gps', 'gps', settings.gps ? 'on' : 'off', settings.gps ? 'on' : 'off', 'GPS'],
      ['autoSync', 'sync', settings.autoSync !== false ? 'on' : 'off', settings.autoSync !== false ? 'on' : 'off', 'Sync'],
      ['brightness', 'brightness', b, b === 'mid' ? 'mid' : b === 'off' ? 'off' : 'on', 'Brightness']
    ];
    return `<div class="gbw-power">${cells.map(([key, icon, state, ind, label], i) => `${i ? '<i class="gbw-div"></i>' : ''}<button class="gbw-pbtn ${i === 0 ? 'l' : i === 4 ? 'r' : 'c'}" data-action="power-toggle" data-id="${key}" aria-label="${e(t(label))}" aria-pressed="${ind !== 'off'}"><img src="assets/gb-w-st-ic_appwidget_settings_${icon}_${state}.png" alt=""><span class="gbw-ind ${i === 0 ? 'l' : i === 4 ? 'r' : 'c'} ${ind}"></span></button>`).join('')}</div>`;
  }
  // Picture frame: the chosen picture centre-cropped inside photo_inner on appwidget_bg.
  function pictureFrame(photo, image) {
    return `<button class="gbw-frame" data-action="${photo ? 'photo' : 'noop'}" data-id="${photo ? photo.id : ''}" aria-label="${e(photo?.name || 'Picture frame')}"><span class="gbw-frame-inner">${photo ? `<img src="${image(photo)}" alt="">` : ''}</span></button>`;
  }
  // Bookmarks: previous / title / next over the page thumbnail (fitXY, 5 dip padding).
  function bookmarks(list, index, titleOf, thumbnail) {
    if (!list.length) return `<div class="gbw-bookmarks"><div class="gbw-bm-head"><span class="gbw-bm-title">Bookmarks</span></div></div>`;
    const i = ((index % list.length) + list.length) % list.length, url = list[i];
    return `<div class="gbw-bookmarks"><div class="gbw-bm-head"><button class="gbw-bm-step prev" data-action="widget-bookmark-step" data-id="-1" aria-label="Previous"></button><span class="gbw-bm-title">${e(titleOf(url))}</span><button class="gbw-bm-step next" data-action="widget-bookmark-step" data-id="1" aria-label="Next"></button></div><button class="gbw-bm-image" data-action="widget-bookmark-open" data-id="${e(url)}" aria-label="${e(titleOf(url))}"><span class="gbw-bm-page" inert>${thumbnail(url)}</span></button></div>`;
  }
  /* News & Weather's MiniWidgetProvider (GenieWidget.apk layout-port/miniwidget.xml): appwidget_dark_bg, the 75 dip
     weather column (45 dip picture, 22 dp bold temperature) and the news ViewFlipper (miniwidget_story.xml: 14 dp
     headline, 11 dp #bebebe source, the 75 dip picture), one story every few seconds. */
  function newsWeather(lang) {
    const apps = window.GBGoogleApps; if (!apps) return '';
    const [, icon, , ] = apps.FORECAST[0], temp = lang === 'en' ? '72°' : '22°', stories = apps.STORIES['Top Stories'];
    return `<div class="gbw-nw"><button class="gbw-nw-weather" data-action="gbw-news" data-id="weather"><img src="assets/nw-ic_weather_${icon}_l.png" alt=""><b>${temp}</b></button><span class="gbw-nw-flip">${stories.map(([title, , source], i) => `<button class="gbw-nw-story" style="--i:${i};--n:${stories.length}" data-action="gbw-news" data-id="${i}"><span><b>${e(title)}</b><small>${e(source)}</small></span><i style="--h:${(title.length * 37) % 360}"></i></button>`).join('')}</span></div>`;
  }
  /* YouTube's WidgetProvider (widget_layout.xml): the btn_widget_logo over yt_widget_background (10 dip below the top),
     the ViewFlipper of widget_teaser.xml videos (80 x 60 dip thumbnail, 12 dp bold title, by and views) and the camera and
     search buttons (40 dip, split by widget_divider). */
  function youtube(lang) {
    const yt = window.GBYouTube; if (!yt) return '';
    const vids = [...yt.VIDEOS].sort((a, b) => b.views - a.views).slice(0, 4);
    return `<div class="gbw-yt"><img class="gbw-yt-logo" src="assets/yt-btn_logo_normal.png" alt="YouTube"><div class="gbw-yt-bg"><span class="gbw-yt-flip">${vids.map((v, i) => `<button class="gbw-yt-item" style="--i:${i};--n:${vids.length}" data-action="gbw-youtube" data-id="${v.id}"><span class="gbw-yt-thumb" style="--a:${v.colors[0]};--b:${v.colors[1]}"></span><span class="gbw-yt-text"><b>${e(v.title)}</b><small>${e(yt.T(lang, 'by %1$s').replace('%1$s', v.author))}</small><small>${e(yt.T(lang, '%1$,d views').replace('%1$,d', v.views.toLocaleString('en-US')))}</small></span></button>`).join('')}</span><i class="gbw-yt-div"></i><button class="gbw-yt-btn" data-action="open-app" data-app="camera" aria-label="Upload"><img src="assets/yt-ic_menu_capture_normal.png" alt=""></button><i class="gbw-yt-div"></i><button class="gbw-yt-btn" data-action="gbw-youtube-search" aria-label="Search"><img src="assets/yt-ic_menu_search_normal.png" alt=""></button></div></div>`;
  }
  /* Market's MarketWidgetProvider (Vending.apk layout-v7/widget.xml): appwidget_bg, the widget_title_bg header with the
     widget_header logo, and the ViewFlipper on green_gradient of widget_app.xml (the 91 x 61 dip picture on white, 12 sp
     black name), one featured app every few seconds. */
  function market(items) {
    const list = items.slice(0, 4);
    return `<div class="gbw-mk"><span class="gbw-mk-head"><img src="assets/mk-widget_header.png" alt="Android Market"></span><span class="gbw-mk-flip">${list.map((item, i) => `<button class="gbw-mk-item" style="--i:${i};--n:${list.length}" data-action="gbw-market" data-id="${e(item.id)}"><span class="gbw-mk-pic">${item.app ? `<img src="assets/${item.app}.png" alt="">` : `<i style="--a:${(item.colors || ['#2f4f6f'])[0]};--b:${(item.colors || ['#2f4f6f', '#8fc0e8'])[1] || '#8fc0e8'}">${e((item.name || '?').slice(0, 1))}</i>`}</span><span class="gbw-mk-name">${e(item.name)}</span></button>`).join('')}</span></div>`;
  }
  window.GBWidgets = {PROVIDERS, analog, power, brightnessState, pictureFrame, bookmarks, newsWeather, youtube, market};
})();
