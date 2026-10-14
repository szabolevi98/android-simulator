/* Android 2.1 Car Home (CarDock.apk, layout-port/main.xml on background_port): the "Try saying:" bubble (bubble_left,
   14 dp #88000000 over 16 dp black, one of the voice_hint_* lines, which keep their #2e4987 command words) at the top
   left, then the big buttons down an arc (16 dp #ccffffff labels with a #bf000000 shadow, 144 px icons, normal /
   pressed): Voice Search, Navigation, View Map, Contacts, and Search | Home at the bottom. Voice Search and Navigation go
   to Voice Search, View Map to Maps, Contacts to Contacts, Search to Quick Search Box, Home to the home screen.
   Menu: Dock settings. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const D = () => EC.text('cardock');
  const HINTS = ['voice_hint_navigate', 'voice_hint_map', 'voice_hint_directions', 'voice_hint_call'];
  // The hints are styled strings with a <font color> span; only that tag is let through.
  const hint = text => esc(text).replace(/&lt;font color=&quot;(#[0-9a-fA-F]{6})&quot;&gt;(.*?)&lt;\/font&gt;/g, '<span style="color:$1">$2</span>');
  const BUTTONS = [['voice', 'voice', 'eccd-voice'], ['navigation', 'navigation', 'eccd-nav'], ['maps', 'maps', 'eccd-maps'], ['contacts', 'contacts', 'eccd-contacts']];
  const btn = ([icon, label, cls]) => `<button type="button" class="eccd-btn ${cls}" data-action="eccd-go" data-to="${icon}"><img class="n" src="assets/cd-ic_btn_${icon}_normal.png" alt=""><img class="p" src="assets/cd-ic_btn_${icon}_pressed.png" alt=""><span>${esc(D().t(label))}</span></button>`;
  EC.register('car-home', {
    title: 'Car Home',
    render(c) {
      const h = HINTS[(c.ui.carHint ??= Math.floor(Math.random() * HINTS.length))];
      return `<div class="eccd"><div class="eccd-bubble npp-cd-bubble_left"><i class="ec-bg np-cd-bubble_left"></i><span class="t1">${esc(D().t('try_saying'))}</span><span class="t2">${hint(D().t(h))}</span></div>
        <div class="eccd-col">${BUTTONS.map(btn).join('')}<div class="eccd-row">${btn(['search', 'search', 'eccd-search'])}<span></span>${btn(['home', 'home', 'eccd-home'])}</div></div></div>`;
    },
    action(name, el, event, c) {
      if (name !== 'eccd-go') return false;
      const to = el.dataset.to;
      if (to === 'voice' || to === 'navigation') c.open('voice-search');
      else if (to === 'maps') c.open('maps');
      else if (to === 'contacts') c.open('contacts');
      else if (to === 'search') EC.quickSearch(c);
      else c.home();
      return true;
    },
    menu(c) { c.menu([{label: D().t('menu_item_dock_settings'), icon: 'fw-ic_menu_preferences.png', action: () => { c.open('settings'); c.ui.settingsStack = ['settings', 'sound_and_display_settings']; c.render(); }}]); return true; }
  });
})();
