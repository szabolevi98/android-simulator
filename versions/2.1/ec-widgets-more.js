/* Android 2.1 widgets the home screen's widget picker adds, and the picker (Settings' AppWidgetPickActivity, "Choose
   widget": the image's APPWIDGET_UPDATE providers with their labels and icons, and Launcher2's own Search, by label;
   Maps' Traffic widget is disabled in its manifest). Sizes from each provider's minWidth / minHeight (294 dp = 4 cells,
   146 dp = 2, 72 dp = 1).
   - widget:analog-clock: DeskClock's analog_appwidget.xml, an AnalogClock with appwidget_clock_dial and the hour and
     minute hands (2 x 2); a touch opens the Clock.
   - widget:calendar: CalendarProvider's agenda_appwidget.xml on appwidget_bg (2 x 2): the next event under the blue top
     (appwidget_calendar_bgtop_blue: the day of the week in 17 sp bold, the day of the month in 30 sp bold), the time
     (14 sp bold #666), the title (14 sp bold black), the place (11 sp #666); or "No upcoming calendar events".
   - widget:facebook: widget_clear_view.xml (4 x 2, 185 dp): appwidget_top_white with the icon button, "You are not
     logged in." and "Log in by launching the Facebook application on your Android phone." until the app is signed in.
   - widget:music: Music's layout-finger/album_appwidget.xml on appwidget_bg (4 x 1): the title and artist (18 / 14 sp
     white) — with no songs the artist line says "Selected playlist is empty." — then play and next.
   - widget:picture-frame: Gallery3D's photo_frame.xml (2 x 2): PhotoAppWidgetConfigure picks and crops a picture first
     (square), shown on appwidget_bg inside photo_inner.
   - widget:youtube: YouTube's widget_layout.xml (4 x 1, 80 dp on widget_background): the logo, the camera and search
     buttons between widget_divider lines; they open YouTube, the camera, and YouTube's search. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const H = () => EC.text('homeadd');
  const h = k => H().t(k);
  const PROVIDERS = [
    {id: 'analog-clock', label: 'DeskClock/analog_gadget', icon: 'dc-ic_widget_analog_clock.png', w: 2, h: 2},
    {id: 'calendar', label: 'CalendarProvider/gadget_title', icon: 'cp-app_icon.png', w: 2, h: 2},
    {id: 'facebook', label: 'Facebook/app_name', icon: 'app-facebook.png', w: 4, h: 2},
    {id: 'music', label: 'Music/musicbrowserlabel', icon: 'app-music.png', w: 4, h: 1},
    {id: 'news-weather', label: 'GenieWidget/miniwidget', icon: 'app-news-weather.png', w: 4, h: 1},
    {id: 'picture-frame', label: 'Gallery3D/gadget_title', icon: 'app-gallery.png', w: 2, h: 2},
    {id: 'power-control', label: 'Settings/gadget_title', icon: 'st-ic_launcher_settings.png', w: 4, h: 1},
    {id: 'search', label: 'group_search', icon: 'l2-ic_search_widget.png', w: 4, h: 1},
    {id: 'youtube', label: 'YouTube/application_name', icon: 'app-youtube.png', w: 4, h: 1}];
  function pickWidget(c) {
    const list = PROVIDERS.map(p => ({...p, text: h(p.label)})).sort((a, b) => a.text.localeCompare(b.text, c.locale()));
    c.dialog({title: h('Settings/widget_picker_title'), icon: null, items: list.map(p => ({label: p.text, icon: p.icon})), onItem: i => {
      const p = list[i];
      if (p.id === 'search') { EC.homeEdit.add(c, {type: 'search', w: 4, h: 1}); return; }
      // The picture frame is configured first: a picture, cropped square.
      if (p.id === 'picture-frame') {
        const cell = c.ui.homeAddCell;
        EC.galleryPick(c, {crop: true, onPick: photo => { c.ui.homeAddCell = cell; EC.homeEdit.add(c, {type: 'widget', widget: p.id, w: p.w, h: p.h, photo: photo.id, crop: photo.crop}); }});
        return;
      }
      EC.homeEdit.add(c, {type: 'widget', widget: p.id, w: p.w, h: p.h});
    }});
  }

  // Analog clock: the hands turn with the device clock (AnalogClock.onDraw: hour = h + m / 60 of 12, minute of 60).
  const hands = c => { const d = c.now(), m = d.getMinutes() + d.getSeconds() / 60, hr = (d.getHours() % 12) + m / 60; return {hour: hr * 30, minute: m * 6}; };
  EC.register('widget:analog-clock', {
    render(c) {
      const a = hands(c);
      return `<button type="button" class="ecwm-clock" data-action="ecwm-open" data-app="clock"><img class="dial" src="assets/dc-appwidget_clock_dial.png" alt=""><img class="hand hour" style="--r:${a.hour}deg" src="assets/dc-appwidget_clock_hour.png" alt=""><img class="hand minute" style="--r:${a.minute}deg" src="assets/dc-appwidget_clock_minute.png" alt=""></button>`;
    }
  });
  // Calendar: the next event from now (CalendarAppWidgetProvider: the first instance not over).
  EC.register('widget:calendar', {
    render(c) {
      const now = c.now().getTime(), next = (c.data.events || []).filter(e => e.end > now).sort((a, b) => a.start - b.start)[0];
      if (!next) return `<button type="button" class="ecwm-cal npp-cp-appwidget_bg" data-action="ecwm-open" data-app="calendar"><i class="ec-bg np-cp-appwidget_bg"></i><i class="ec-bg ec-pressed np-cp-appwidget_bg_press"></i><span class="ecwm-noev">${esc(h('CalendarProvider/gadget_no_events'))}</span></button>`;
      const d = new Date(next.start), when = next.allDay ? c.shortDate(d) : `${c.timeText(d)}`;
      const wd = d.toLocaleDateString(c.locale(), {weekday: 'long'});
      return `<button type="button" class="ecwm-cal npp-cp-appwidget_bg" data-action="ecwm-open" data-app="calendar"><i class="ec-bg np-cp-appwidget_bg"></i><i class="ec-bg ec-pressed np-cp-appwidget_bg_press"></i>
        <span class="ecwm-ctop np-cp-appwidget_calendar_bgtop_blue"><span class="wd">${esc(wd.toUpperCase())}</span><span class="dm">${d.getDate()}</span></span>
        <span class="ecwm-when">${esc(when)}</span><span class="ecwm-title">${esc(next.title || '')}</span>${next.location ? `<span class="ecwm-where">${esc(next.location)}</span>` : ''}</button>`;
    }
  });
  // The Facebook app cannot sign in here (no network), so the widget keeps its logged-out text.
  EC.register('widget:facebook', {
    render() {
      return `<div class="ecwm-fb npp-fb-appwidget_bg"><i class="ec-bg np-fb-appwidget_bg"></i><div class="ecwm-fbtop npp-fb-appwidget_top_white"><i class="ec-bg np-fb-appwidget_top_white"></i>
        <button type="button" class="ecwm-fbicon" data-action="ecwm-open" data-app="facebook"><img class="n" src="assets/fb-appwidget_facebook_icon_default.png" alt=""><img class="p" src="assets/fb-appwidget_facebook_icon_pressed.png" alt=""></button>
        <span class="ecwm-fbtext"><b>${esc(h('Facebook/widget_logged_out_title'))}</b><small>${esc(h('Facebook/widget_logged_out_message'))}</small></span></div></div>`;
    }
  });
  EC.register('widget:music', {
    render() {
      return `<div class="ecwm-music npp-mu-appwidget_bg"><i class="ec-bg np-mu-appwidget_bg"></i><button type="button" class="ecwm-mtext" data-action="ecwm-open" data-app="music"><i class="ec-bg ec-pressed np-mu-appwidget_inner_press_l"></i><span>${esc(h('Music/emptyplaylist'))}</span></button>
        <i class="ecwm-mdiv np-mu-appwidget_divider"></i><button type="button" class="ecwm-mbtn" data-action="ecwm-open" data-app="music"><i class="ec-bg ec-pressed np-mu-appwidget_inner_press_c"></i><img src="assets/mu-ic_appwidget_music_play.png" alt=""></button>
        <i class="ecwm-mdiv np-mu-appwidget_divider"></i><button type="button" class="ecwm-mbtn" data-action="ecwm-noop"><i class="ec-bg ec-pressed np-mu-appwidget_inner_press_r"></i><img src="assets/mu-ic_appwidget_music_next.png" alt=""></button></div>`;
    }
  });
  // Picture frame: the cropped picture (the crop box as fractions of the picture).
  EC.register('widget:picture-frame', {
    render(c, item) {
      const photo = (c.data.photos || []).find(p => p.id === item?.photo), b = item?.crop || {x: 0.1, y: 0.1, w: 0.8, h: 0.8};
      const img = photo ? `background-image:url('${EC.media.url(photo, 320)}');background-size:${100 / b.w}% ${100 / b.h}%;background-position:${b.w < 1 ? b.x / (1 - b.w) * 100 : 0}% ${b.h < 1 ? b.y / (1 - b.h) * 100 : 0}%` : 'background:#222';
      return `<button type="button" class="ecwm-frame npp-ga-appwidget_bg" data-action="ecwm-open" data-app="gallery"><i class="ec-bg np-ga-appwidget_bg"></i><span class="ecwm-photo" style="${img}"><i class="ec-bg np-ga-photo_inner"></i></span></button>`;
    }
  });
  EC.register('widget:youtube', {
    render() {
      const part = (action, app, pos, img, cls) => `<button type="button" class="ecwm-yt${cls}" data-action="${action}" data-app="${app}"><i class="ec-bg ec-pressed np-yt-appwidget_inner_press_${pos}"></i><img src="assets/${img}" alt=""></button>`;
      return `<div class="ecwm-ytw npp-yt-widget_background"><i class="ec-bg np-yt-widget_background"></i>${part('ecwm-open', 'youtube', 'l', 'yt-ic_youtube_logo.png', ' logo')}<i class="ecwm-ydiv np-yt-widget_divider"></i>${part('ecwm-ytcam', 'youtube', 'c', 'yt-ic_widget_camera.png', '')}<i class="ecwm-ydiv np-yt-widget_divider"></i>${part('ecwm-ytsearch', 'youtube', 'r', 'yt-ic_widget_search.png', '')}</div>`;
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    const c = EC.context, home = EC.module('home'), base = home.action;
    EC.homeEdit.pickWidget = pickWidget;
    home.action = (name, el, event, cc) => {
      if (name === 'ecwm-open') { if ((cc.suppressClick || 0) > Date.now()) return true; cc.open(el.dataset.app); return true; }
      if (name === 'ecwm-noop') return true;
      if (name === 'ecwm-ytcam') { EC.cameraCapture?.(cc, {video: true, onDone: () => cc.open('youtube')}); return true; }
      if (name === 'ecwm-ytsearch') { cc.open('youtube'); EC.module('youtube')?.search?.(cc); return true; }
      return base(name, el, event, cc);
    };
    // The clock's hands move on the minute.
    setInterval(() => {
      if (c.ui.view !== 'home') return;
      const a = hands(c);
      for (const el of c.el.viewport.querySelectorAll('.ecwm-clock .hour')) el.style.setProperty('--r', `${a.hour}deg`);
      for (const el of c.el.viewport.querySelectorAll('.ecwm-clock .minute')) el.style.setProperty('--r', `${a.minute}deg`);
    }, 15000);
  });
})();
