/* Android 2.1 home screen widgets of the default workspace (Launcher2 default_workspace.xml):
   - widget:power-control: Settings.apk's SettingsAppWidgetProvider, layout/widget.xml: five equal buttons (Wi-Fi,
     Bluetooth, GPS, sync, brightness) on appwidget_bg, 1 dp appwidget_settings_divider between them; each an icon
     (centerInside) over its indicator (ind_on / ind_off / ind_mid; _l, _c, _r by position, fitXY); pressed
     appwidget_inner_press_l / c / r. Brightness steps dim → half → full (ic_..._brightness_off / mid / on).
   - widget:news-weather: GenieWidget.apk's MiniWidgetProvider (minWidth 294 dp, minHeight 72 dp), layout-port/miniwidget.xml
     on appwidget_dark_bg: the 75 dp weather column (45 dp icon, 22 dp bold temperature; padding 4 dp; pressed
     appwidget_inner_press_l) and the news ViewFlipper (padding 7 / 4 / 3 / 2 dp; flipInterval 8000 ms) of
     miniwidget_story.xml rows (14 dp headline up to 3 lines, 11 dp #bebebe source). The stories and the weather are the
     simulator's own, as a server would send them. */
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

  const STORIES = [
    ['Apple unveils the iPad, a tablet between the phone and the laptop', 'Reuters · 2 hours ago'],
    ['Vancouver gets ready for the Winter Olympics opening ceremony', 'AP · 3 hours ago'],
    ['Google opens Nexus One sales to customers in more countries', 'CNET · 5 hours ago'],
    ['Avatar becomes the highest-grossing film of all time', 'BBC News · 6 hours ago']
  ];
  let flipTimer = Date.now(), story = 0;   // the first flip comes flipInterval after the widget shows
  EC.register('widget:news-weather', {
    render(c) {
      const [headline, source] = STORIES[story % STORIES.length];
      const unit = c.lang === 'en' ? 'F' : 'C', temp = unit === 'F' ? 64 : 18;
      return `<div class="ecwg-news npp-nw-appwidget_dark_bg"><i class="ec-bg np-nw-appwidget_dark_bg"></i>
        <button type="button" class="ecwg-weather" data-action="ecwg-news" aria-label="${temp}°"><i class="ec-bg ec-pressed np-nw-appwidget_inner_press_l"></i><img src="assets/nw-ic_weather_partly_cloudy_m.png" alt=""><span>${temp}°</span></button>
        <button type="button" class="ecwg-flip" data-action="ecwg-news"><i class="ec-bg ec-pressed np-nw-appwidget_inner_press_r"></i><span class="ecwg-story"><span class="ecwg-headline">${esc(headline)}</span><span class="ecwg-source">${esc(source)}</span></span></button></div>`;
    },
    tick(c) {
      if (c.ui.view !== 'home' || c.ui.sleeping) return;
      if (Date.now() - flipTimer < 8000) return;
      flipTimer = Date.now(); story++;
      const flip = c.el.viewport.querySelector('[data-widget="news-weather"] .ecwg-story');
      if (!flip) return;
      const [headline, source] = STORIES[story % STORIES.length];
      flip.classList.add('out');
      setTimeout(() => { flip.innerHTML = `<span class="ecwg-headline">${esc(headline)}</span><span class="ecwg-source">${esc(source)}</span>`; flip.classList.remove('out'); }, 300);
    }
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
        if (name === 'ecwg-news') { c.open('news-weather'); return true; }
        return base(name, el, event, c);
      };
    }
  });
})();
