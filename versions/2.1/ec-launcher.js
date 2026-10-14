/* Android 2.1 home screen: Launcher2.apk (ERE27) launcher.xml, workspace_screen.xml, application.xml, widget_search.xml and
   res/xml/default_workspace.xml.
   - Workspace: five screens, defaultScreen 2; each a CellLayout of 4 x 4 cells of 80 x 100 dp (portrait), 55 dp free at
     the bottom (longAxisEndPadding), the spare height shared out between the rows (mHeightGap).
   - Swipes: SNAP_VELOCITY 1000 px/s; snapToScreen scrolls 300 ms per screen with the default Scroller interpolator
     (viscous fluid); the wallpaper follows the scroll (xOffset = scroll / (four screens)).
   - Shortcuts (BubbleTextView, WorkspaceIcon.Portrait): margins 3 / 13 / 3 / 8 dp, padding 4 dp top and 5 dp on the
     sides, the 48 dp icon, 5 dp, a 13 sp white label with a 2 px black shadow on a rounded bubble (#b2191919, radius
     8 dp, 5 dp beside and 1 dp above and below the text); shortcut_selector pressed / focused backgrounds.
   - Bottom: previous_screen / next_screen (93 x 56 dp, 6 dp from the sides) show home_arrows level = the screens on that
     side; all_apps_button (56 dp high) in the middle.
   - The Search widget (Launcher2's own, 4 x 1): search_floater plate (padding 14 / 13 / 14 / 12 dp), the 42 dp
     textfield_searchwidget with the Google placeholder, and the 42 dp voice button (btn_search_dialog_voice +
     ic_btn_speak_now) 4 dp to its right.
   Taps on empty space go to the wallpaper (android.wallpaper.tap). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  // default_workspace.xml (cells are x, y; widgets span 4 x 1).
  EC.defaults.home = {revision: 1, pages: [
    [],
    [{type: 'widget', widget: 'news-weather', x: 0, y: 0, w: 4, h: 1}, {type: 'app', app: 'camera', x: 1, y: 3}, {type: 'app', app: 'gallery', x: 2, y: 3}],
    [{type: 'search', x: 0, y: 0, w: 4, h: 1}, {type: 'app', app: 'messaging', x: 0, y: 2}, {type: 'app', app: 'market', x: 3, y: 2},
     {type: 'app', app: 'phone', x: 0, y: 3}, {type: 'app', app: 'contacts', x: 1, y: 3}, {type: 'app', app: 'browser', x: 2, y: 3}, {type: 'app', app: 'maps', x: 3, y: 3}],
    [{type: 'widget', widget: 'power-control', x: 0, y: 0, w: 4, h: 1}, {type: 'app', app: 'gmail', x: 1, y: 3}, {type: 'app', app: 'talk', x: 2, y: 3}],
    []
  ]};
  const DEFAULT_SCREEN = 2, SCREENS = 5;

  function shortcut(item) {
    const app = EC.apps.get(item.app);
    if (!app) return '';
    return `<button type="button" class="eclh-item eclh-shortcut" style="grid-area:${item.y + 1}/${item.x + 1}" data-action="eclh-open" data-app="${esc(app.id)}"><i class="ec-bg np-l2-pressed_application_background eclh-pressed"></i><i class="ec-bg np-l2-focused_application_background eclh-focused"></i><img src="assets/${esc(app.icon)}" alt=""><span class="eclh-label"><span>${esc(EC.apps.label(app.id))}</span></span></button>`;
  }
  function search(item) {
    return `<div class="eclh-item eclh-search" style="grid-area:${item.y + 1}/${item.x + 1}/span ${item.h}/span ${item.w}"><div class="eclh-plate"><i class="ec-bg np-l2-search_floater"></i>
      <button type="button" class="eclh-search-text" data-action="eclh-search" aria-label="Google"><i class="ec-bg np-l2-textfield_searchwidget_default"></i><i class="ec-bg eclh-pressed np-l2-textfield_searchwidget_pressed"></i><img src="assets/l2-placeholder_google.png" alt=""></button>
      <button type="button" class="eclh-search-voice" data-action="eclh-voice" aria-label="Voice Search"><i class="ec-bg np-fw-btn_search_dialog_voice_default"></i><i class="ec-bg eclh-pressed np-fw-btn_search_dialog_voice_pressed"></i><img src="assets/fw-ic_btn_speak_now.png" alt=""></button></div></div>`;
  }
  function widget(c, item) {
    const area = `grid-area:${item.y + 1}/${item.x + 1}/span ${item.h}/span ${item.w}`;
    const mod = EC.module(`widget:${item.widget}`);
    if (mod) return `<div class="eclh-item eclh-widget" style="${area}" data-widget="${esc(item.widget)}">${mod.render(c, item)}</div>`;
    return `<div class="eclh-item eclh-widget eclh-widget-missing" style="${area}"><div class="ec-missing"><b>${esc(c.t('Not built yet'))}</b><span>${esc(item.widget)}</span></div></div>`;
  }
  function page(c, items, index) {
    const html = items.map(item => item.type === 'app' ? shortcut(item) : item.type === 'search' ? search(item) : widget(c, item)).join('');
    return `<div class="eclh-page" data-page="${index}" style="left:${index * 100}%">${html}</div>`;
  }
  function arrows(side, count) {
    if (!count) return `<span class="eclh-arrows eclh-${side}" aria-hidden="true"></span>`;
    const suffix = side === 'next' ? '_right' : '';
    return `<button type="button" class="eclh-arrows eclh-${side}" data-action="eclh-${side}" aria-label="${side === 'next' ? 'Next screen' : 'Previous screen'}"><img class="eclh-normal" src="assets/l2-ic_home_arrows_${count}_normal${suffix}.png" alt=""><img class="eclh-pressed" src="assets/l2-ic_home_arrows_${count}_press${suffix}.png" alt=""></button>`;
  }
  function render(c) {
    const home = c.data.home, current = c.ui.homePage ?? DEFAULT_SCREEN;
    return `<div class="eclh"><div class="eclh-workspace"><div class="eclh-track" style="transform:translateX(${-current * 100}%)">${home.pages.map((items, i) => page(c, items, i)).join('')}</div></div>
      ${arrows('prev', current)}${arrows('next', SCREENS - 1 - current)}
      <button type="button" class="eclh-allapps" data-action="eclh-allapps" aria-label="${esc(c.t('All applications'))}"><img class="eclh-normal" src="assets/l2-all_apps_button_normal.png" alt=""><img class="eclh-pressed" src="assets/l2-all_apps_button_pressed.png" alt=""></button></div>`;
  }

  // Scroller's default interpolator (android.widget.Scroller.viscousFluid, scale 8).
  function viscous(x) {
    const f = v => { v *= 8; if (v < 1) return v - (1 - Math.exp(-v)); const start = 0.36787944117; return start + (1 - Math.exp(1 - v)) * (1 - start); };
    return f(x) / f(1);
  }
  let scroll = null;   // {from, to, start, duration}
  function setScroll(c, x) {
    const track = c.el.viewport.querySelector('.eclh-track');
    if (track) track.style.transform = `translateX(${-x * 100}%)`;
    c.wallpaper?.offset(x / (SCREENS - 1));
  }
  function snapTo(c, which, from = c.ui.homeScroll ?? c.ui.homePage ?? DEFAULT_SCREEN) {
    which = Math.max(0, Math.min(SCREENS - 1, which));
    const delta = Math.max(1, Math.abs(which - (c.ui.homePage ?? DEFAULT_SCREEN)));
    const start = performance.now(), duration = delta * 300, to = which;
    cancelAnimationFrame(scroll?.frame);
    scroll = {};
    const step = now => {
      const t = Math.min(1, (now - start) / duration), x = from + (to - from) * viscous(t);
      c.ui.homeScroll = x; setScroll(c, x);
      if (t < 1) scroll.frame = requestAnimationFrame(step);
      else { scroll = null; c.ui.homeScroll = to; if (c.ui.homePage !== to) { c.ui.homePage = to; c.render(); } }
    };
    scroll.frame = requestAnimationFrame(step);
  }

  function mount(c, root) {
    const ws = root.querySelector('.eclh-workspace');
    if (!ws) return;
    setScroll(c, c.ui.homeScroll ?? c.ui.homePage ?? DEFAULT_SCREEN);
    let drag = null;
    ws.addEventListener('pointerdown', event => {
      if (event.button) return;
      cancelAnimationFrame(scroll?.frame); scroll = null;
      drag = {x: event.clientX, y: event.clientY, start: c.ui.homeScroll ?? c.ui.homePage ?? DEFAULT_SCREEN, moved: false, samples: [[performance.now(), event.clientX]], id: event.pointerId, target: event.target};
    });
    ws.addEventListener('pointermove', event => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x;
      // mTouchSlop: 16 dp in 2.1's ViewConfiguration.
      if (!drag.moved && Math.abs(dx) < 16 * c.el.screen.clientWidth / 320) return;
      if (!drag.moved) { drag.moved = true; ws.setPointerCapture?.(event.pointerId); ws.classList.add('eclh-scrolling'); }
      const x = drag.start - dx / ws.clientWidth;
      c.ui.homeScroll = Math.max(-0.25, Math.min(SCREENS - 0.75, x)); setScroll(c, c.ui.homeScroll);
      drag.samples.push([performance.now(), event.clientX]); if (drag.samples.length > 5) drag.samples.shift();
    });
    const end = event => {
      if (!drag || event.pointerId !== drag.id) return;
      const d = drag; drag = null; ws.classList.remove('eclh-scrolling');
      if (!d.moved) {
        if (!event.target.closest('.eclh-item')) { const r = c.el.screen.getBoundingClientRect(); c.wallpaper?.tap(event.clientX - r.left, event.clientY - r.top); }
        return;
      }
      c.suppressClick = Date.now() + 300;
      const [t0, x0] = d.samples[0], [t1, x1] = d.samples.at(-1);
      const v = (x1 - x0) / Math.max(0.001, (t1 - t0) / 1000) / (c.el.screen.clientWidth / 480);   // phone px / s
      const current = c.ui.homePage ?? DEFAULT_SCREEN, scrollX = c.ui.homeScroll;
      let which = Math.floor(scrollX + 0.5);
      if (v > 1000 && current > 0) which = current - 1;
      else if (v < -1000 && current < SCREENS - 1) which = current + 1;
      snapTo(c, which, scrollX);
    };
    ws.addEventListener('pointerup', end); ws.addEventListener('pointercancel', end);
  }

  // AddAdapter: the "Add to Home screen" list (add_list_item.xml rows).
  function addDialog(c) {
    const L = EC.text('launcher');
    c.dialog({title: L.t('menu_item_add_item'), icon: 'fw-ic_dialog_menu_generic.png', items: [
      {label: L.t('group_shortcuts'), icon: 'l2-ic_launcher_shortcut.png'}, {label: L.t('group_widgets'), icon: 'l2-ic_launcher_appwidget.png'},
      {label: L.t('group_live_folders'), icon: 'l2-ic_launcher_folder.png'}, {label: L.t('group_wallpapers'), icon: 'l2-ic_launcher_wallpaper.png'}],
      onItem: (i, c) => [() => c.open('add-shortcut'), () => c.open('add-widget'), () => c.open('add-folder'), () => wallpaperChooser(c)][i]()});
  }
  // startWallpaper: the chooser of ACTION_SET_WALLPAPER handlers (title chooser_wallpaper).
  function wallpaperChooser(c) {
    if (EC.module('wallpaper-chooser')) c.overlay('wallpaper-chooser');
    else c.open('wallpaper-chooser');
  }

  // The search widget opens Quick Search Box (GlobalSearch.apk's SearchDialog: "Quick Search Box", the web source's Google
  // icon from EnhancedGoogleSearchProvider). Suggestions: the applications and contacts that match; a query goes to the
  // Browser as google_search_base (http://www.google.com/m?hl=%1$s&gl=%2$s&) + q.
  EC.quickSearch = c => {
    const S = EC.text('search');
    c.searchDialog({icon: 'gs-google.png', hint: S.t('search_hint'),
      suggest: q => {
        const v = q.trim().toLocaleLowerCase(c.locale());
        if (!v) return [];
        const apps = EC.apps.sorted().filter(a => EC.apps.label(a.id).toLocaleLowerCase(c.locale()).split(/\s+/).some(w => w.startsWith(v))).map(a => ({icon: a.icon, text1: EC.apps.label(a.id), value: `app:${a.id}`}));
        const people = (c.data.contacts || []).filter(p => p.name.toLocaleLowerCase().split(/\s+/).some(w => w.startsWith(v))).map(p => ({icon: 'ct-ic_contact_list_picture.png', text1: p.name, text2: p.phone, value: `contact:${p.id}`}));
        return [...apps, ...people].slice(0, 8);
      },
      onGo: text => {
        if (text.startsWith('app:')) { c.open(text.slice(4)); return; }
        if (text.startsWith('contact:')) { c.ui.contactId = Number(text.slice(8)); c.open('contact-view'); return; }
        if (!text.trim()) return;
        const base = AndroidStrings.format(S.t('EnhancedGoogleSearchProvider/google_search_base'), c.lang, c.lang === 'en' ? 'us' : c.lang);
        c.ui.browserGo = `${base}source=android-search-app&q=${encodeURIComponent(text.trim()).split('%20').join('+')}`;
        c.open('browser');
      }});
  };

  EC.register('home', {
    app: false,
    init(c) {
      c.ui.homePage = DEFAULT_SCREEN;
      if (!c.data.home?.pages?.length) c.data.home = JSON.parse(JSON.stringify(EC.defaults.home));
    },
    render, mount,
    reset(c) {
      // Home while home is showing goes to the default screen (Launcher.onNewIntent → moveToDefaultScreen).
      if (c.ui.view === 'home' && (c.ui.homePage ?? DEFAULT_SCREEN) !== DEFAULT_SCREEN) snapTo(c, DEFAULT_SCREEN);
    },
    action(name, el, event, c) {
      if ((c.suppressClick || 0) > Date.now()) return true;
      if (name === 'eclh-open') { c.open(el.dataset.app); return true; }
      if (name === 'eclh-prev') { snapTo(c, (c.ui.homePage ?? DEFAULT_SCREEN) - 1); return true; }
      if (name === 'eclh-next') { snapTo(c, (c.ui.homePage ?? DEFAULT_SCREEN) + 1); return true; }
      if (name === 'eclh-allapps') { c.open('drawer'); return true; }
      if (name === 'eclh-search') { EC.quickSearch(c); return true; }
      if (name === 'eclh-voice') { c.open('voice-search'); return true; }
      return false;
    },
    // Launcher.onCreateOptionsMenu: Add (ic_menu_add), Wallpaper (ic_menu_gallery), Search (ic_search_category_default),
    // Notifications (ic_menu_notifications), Settings (ic_menu_preferences).
    menu(c) {
      const L = EC.text('launcher');
      c.menu([
        {label: L.t('menu_add'), icon: 'fw-ic_menu_add.png', action: () => addDialog(c)},
        {label: L.t('menu_wallpaper'), icon: 'fw-ic_menu_gallery.png', action: () => wallpaperChooser(c)},
        {label: L.t('menu_search'), icon: 'fw-ic_search_category_default.png', action: () => c.open('search')},
        {label: L.t('menu_notifications'), icon: 'fw-ic_menu_notifications.png', action: () => c.expandShade?.()},
        {label: L.t('menu_settings'), icon: 'fw-ic_menu_preferences.png', action: () => c.open('settings')}
      ]);
      return true;
    },
    back: () => true
  });
})();
