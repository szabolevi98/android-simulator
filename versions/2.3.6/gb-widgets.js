/* Android 2.3.6 home screen widgets: DeskClock's analog_appwidget (appwidget_clock_dial / hour / minute), Settings'
   Power control (widget.xml: appwidget_bg, five buttons split by appwidget_settings_divider, ic_appwidget_settings_*
   icons over the appwidget_settings_ind_on / mid / off indicator bars), Gallery3D's Picture frame (photo_frame.xml:
   appwidget_bg, 3 dip padding, photo_inner) and Browser's Bookmarks widget (bookmarkwidget.xml: previous / title / next
   over the page thumbnail). Provider labels and sizes come from each app's appwidget-provider XML. 1 dp = 0.8625 px. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // AppWidgetPickActivity lists the providers of the build sorted by label.
  const PROVIDERS = [
    {type: 'analog', label: 'Analog clock', app: 'clock', width: 2, height: 2},
    {type: 'bookmarks', label: 'Bookmarks', app: 'browser', width: 4, height: 4},
    {type: 'protips', label: 'Home screen tips', app: 'settings', width: 4, height: 1},
    {type: 'music', label: 'Music', app: 'music', width: 4, height: 1},
    {type: 'photo', label: 'Picture frame', app: 'gallery', width: 2, height: 2},
    {type: 'power', label: 'Power control', app: 'settings', width: 4, height: 1},
    {type: 'search', label: 'Search', app: 'browser', width: 4, height: 1}
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
  window.GBWidgets = {PROVIDERS, analog, power, brightnessState, pictureFrame, bookmarks};
})();
