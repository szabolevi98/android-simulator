/* Android 2.1 home screen widgets of the default workspace (Launcher2 default_workspace.xml):
   - widget:power-control: Settings.apk's SettingsAppWidgetProvider, layout/widget.xml: five equal buttons (Wi-Fi,
     Bluetooth, GPS, sync, brightness) on appwidget_bg, 1 dp appwidget_settings_divider between them; each an icon
     (centerInside) over its indicator (ind_on / ind_off / ind_mid; _l, _c, _r by position, fitXY); pressed
     appwidget_inner_press_l / c / r. Brightness steps dim → half → full (ic_..._brightness_off / mid / on).
   - widget:news-weather: GenieWidget.apk's MiniWidgetProvider (minWidth 294 dp, minHeight 72 dp), layout-port/miniwidget.xml
     on appwidget_dark_bg. With no connection it never gets to its weather column and news ViewFlipper: it shows
     widget_loading.xml (the small spinner and "connecting...") while MiniWidgetController tries, then widget_retry.xml
     ("Sorry, unable to connect. Please try later." and the 16 sp Retry now button, which tries again). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  Object.assign(EC.defaults.settings, {autoSync: true, brightness: 'mid'});

  const TOGGLES = ['wifi', 'bluetooth', 'gps', 'sync', 'brightness'];
  function state(c, key) {
    const s = c.data.settings;
    if (key === 'brightness') return s.brightness || 'mid';
    return (key === 'sync' ? s.autoSync : s[key]) ? 'on' : 'off';
  }
  EC.register('widget:power-control', {
    render(c) {
      const buttons = TOGGLES.map((key, i) => {
        const pos = i === 0 ? 'l' : i === 4 ? 'r' : 'c', st = state(c, key);
        const ind = st === 'mid' ? (pos === 'l' ? 'off_l' : `mid_${pos}`) : `${st}_${pos}`;
        return `${i ? '<i class="ecwg-divider"></i>' : ''}<button type="button" class="ecwg-toggle" data-action="ecwg-toggle" data-key="${key}" aria-pressed="${st !== 'off'}"><i class="ec-bg ec-pressed np-st-appwidget_inner_press_${pos}"></i><img src="assets/st-ic_appwidget_settings_${key}_${st}.png" alt="${key}"><img class="ecwg-ind" src="assets/st-appwidget_settings_ind_${ind}.9.png" alt=""></button>`;
      }).join('');
      return `<div class="ecwg-power npp-st-appwidget_bg"><i class="ec-bg np-st-appwidget_bg"></i><div class="ecwg-row">${buttons}</div></div>`;
    }
  });

  // The data service's attempt: "connecting..." for a while, then the retry layout (EC.news is shared with the app).
  const N = () => EC.text('news');
  EC.register('widget:news-weather', {
    render(c) {
      const body = EC.news.connecting() ? `<div class="ecwg-loading"><img class="ecwg-spin" src="assets/fw-spinner_white_16.png" alt=""><span>${esc(N().t('connecting'))}</span></div>`
        : `<div class="ecwg-retry"><span>${esc(N().t('retrying'))}</span><button type="button" class="ecui-button" data-action="ecwg-retry"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(N().t('retrynow'))}</span></button></div>`;
      return `<div class="ecwg-news npp-nw-appwidget_dark_bg"><i class="ec-bg np-nw-appwidget_dark_bg"></i>${body}</div>`;
    },
    tick(c) { if (c.ui.view === 'home' && EC.news.changed()) c.render(); }
  });

  // The launcher hands widget taps to these actions.
  EC.register('widgets', {
    app: false, render: () => '',
    init(c) {
      const home = EC.module('home'), base = home.action;
      home.action = (name, el, event, c) => {
        if (name === 'ecwg-toggle') {
          const s = c.data.settings, key = el.dataset.key;
          if (key === 'brightness') s.brightness = {off: 'mid', mid: 'on', on: 'off'}[s.brightness || 'mid'];
          else if (key === 'sync') s.autoSync = !s.autoSync;
          else { s[key] = !s[key]; if (key === 'wifi') s.wifiConnected = s.wifi; }
          c.save(); c.render(); return true;
        }
        if (name === 'ecwg-retry') { EC.news.refresh(); c.render(); return true; }
        return base(name, el, event, c);
      };
    }
  });
})();
