/* Android 2.1: the Google apps that live on the network, as the phone shows them with no connection (the simulator has
   none), each with its own words for it:
   - Market 1.71 (Vending.apk): title.xml on title_bar_med_market (the bag, the "ANDROID" logo and the "market" title,
     the square search button), nav_3buttons.xml (Apps | Games | Downloads on btn_strip), the full-screen "Loading…",
     then "Attention: A network error has occurred. Retry, or cancel and return to the previous screen." (Retry /
     Cancel), the list ending in "No connection".
   - YouTube: "Loading…", then "Connection problem." / "There is no network connection right now. Please try again
     later." (OK).
   - Maps: the empty map, then "Network failure" / "This application requires a working data connection." */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const N = () => EC.text('netapps');
  const t = k => N().t(k);
  const timers = {};
  const loading = text => `<div class="ecna-loading"><img class="ecna-spin" src="assets/fw-spinner_white_16.png" alt=""><span>${esc(text)}</span></div>`;
  function later(c, id, ms, fn) { clearTimeout(timers[id]); timers[id] = setTimeout(() => { if (c.ui.view === id) fn(); }, ms); }

  // Market ---------------------------------------------------------------------------------------------------------------
  function market(c) {
    const st = c.ui.marketState || 'loading';
    const nav = ['Vending/apps', 'Vending/games', 'Vending/my_downloads_short_title'].map((k, i) => `${i ? '<img class="ecmk-div" src="assets/mk-btn_strip_divider.9.png" alt="">' : ''}<button type="button" class="ecmk-nav"><i class="ec-bg np-mk-btn_strip_normal"></i><i class="ec-bg ec-pressed np-mk-btn_strip_pressed"></i><span>${esc(t(k))}</span></button>`).join('');
    const body = st === 'loading' ? loading(t('Vending/loading')) : `<div class="ecmk-footer"><img src="assets/mk-ic_network_error.png" alt=""><span>${esc(t('Vending/network_error_list_footer'))}</span></div>`;
    return `<div class="ecmk"><div class="ecmk-title"><i class="ec-bg np-mk-title_bar_med_market"></i><img class="ecmk-bag" src="assets/mk-ic_market_bag_normal.png" alt=""><img class="ecmk-logo" src="assets/mk-market_android_logo.png" alt=""><span class="ecmk-word">market</span>
      <button type="button" class="ecmk-search"><img src="assets/mk-btn_square_normal.png" alt=""><img class="ic" src="assets/mk-ic_search_square_button.png" alt=""></button></div>
      <div class="ecmk-navbar">${nav}</div><div class="ecmk-body">${body}</div></div>`;
  }
  function marketStart(c) {
    c.ui.marketState = 'loading';
    later(c, 'market', 2500, () => {
      c.ui.marketState = 'error'; c.render();
      c.dialog({title: t('Vending/networking_error_title'), icon: 'fw-ic_dialog_alert.png', message: t('Vending/networking_error'),
        buttons: [{label: t('Vending/retry'), action: () => { marketStart(c); c.render(); }}, {label: t('Vending/cancel'), action: () => c.back()}], onCancel: () => c.back()});
    });
  }
  // Gmail, Talk, YouTube, Maps --------------------------------------------------------------------------------------------
  function youtube(c) { return c.window(EC.apps.label('youtube'), loading(t('YouTube/loading_elipses'))); }
  function maps(c) { return `<div class="ecna-map">${c.ui.mapsState === 'error' ? '' : loading(t('Maps/LOADING'))}</div>`; }

  const register = (id, render, start) => EC.register(id, {
    title: id, render,
    back() { clearTimeout(timers[id]); return false; },
    start
  });
  register('market', market, marketStart);
  register('youtube', youtube, c => later(c, 'youtube', 2000, () => c.dialog({title: t('YouTube/connection_error_title'), icon: 'fw-ic_dialog_alert.png', message: t('YouTube/no_network'), buttons: [{label: t('YouTube/ok'), action: () => c.back()}], onCancel: () => c.back()})));
  register('maps', maps, c => { c.ui.mapsState = 'loading'; later(c, 'maps', 2000, () => { c.ui.mapsState = 'error'; c.render(); c.dialog({title: t('Maps/NET_FAIL_TITLE'), icon: 'fw-ic_dialog_alert.png', message: t('Maps/NET_FAIL_BODY'), buttons: [{label: EC.text('framework').t('ok')}]}); }); });
  document.addEventListener('DOMContentLoaded', () => {
    const c = EC.context, open = c.open;
    c.open = (view, sub, opts) => { const fresh = c.ui.view !== view; const r = open(view, sub, opts); if (fresh && ['market', 'youtube', 'maps'].includes(view)) { EC.module(view).start(c); c.render(); } return r; };
  });
})();
