/* Android 2.1: the Google apps that live on the network, as the phone shows them with no connection (the simulator has
   none), each with its own words for it:
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

  // YouTube, Maps --------------------------------------------------------------------------------------------
  function youtube(c) { return c.window(EC.apps.label('youtube'), loading(t('YouTube/loading_elipses'))); }
  function maps(c) { return `<div class="ecna-map">${c.ui.mapsState === 'error' ? '' : loading(t('Maps/LOADING'))}</div>`; }

  const register = (id, render, start) => EC.register(id, {
    title: id, render,
    back() { clearTimeout(timers[id]); return false; },
    start
  });
  register('youtube', youtube, c => later(c, 'youtube', 2000, () => c.dialog({title: t('YouTube/connection_error_title'), icon: 'fw-ic_dialog_alert.png', message: t('YouTube/no_network'), buttons: [{label: t('YouTube/ok'), action: () => c.back()}], onCancel: () => c.back()})));
  register('maps', maps, c => { c.ui.mapsState = 'loading'; later(c, 'maps', 2000, () => { c.ui.mapsState = 'error'; c.render(); c.dialog({title: t('Maps/NET_FAIL_TITLE'), icon: 'fw-ic_dialog_alert.png', message: t('Maps/NET_FAIL_BODY'), buttons: [{label: EC.text('framework').t('ok')}]}); }); });
  document.addEventListener('DOMContentLoaded', () => {
    const c = EC.context, open = c.open;
    c.open = (view, sub, opts) => { const fresh = c.ui.view !== view; const r = open(view, sub, opts); if (fresh && ['youtube', 'maps'].includes(view)) { EC.module(view).start(c); c.render(); } return r; };
  });
})();
