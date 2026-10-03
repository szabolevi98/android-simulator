/* Launcher3 5.1 / Google Now Launcher clings (LauncherClings.java; layout-port/longpress_cling.xml,
   longpress_cling_welcome_content.xml). Lollipop has one cling: on the first run the long-press cling with the welcome
   title. A #80000000 scrim covers the whole window, under the status bar too (layout_ignoreInsets), and the content sits
   at the top on the teal cling_bg, cropped at the top and sides (BorderCropDrawable), whose callout points down at the
   workspace: "Welcome" 34 sp #E1000000, the 20 sp medium title, the 16 sp #99000000 description and the white GOT IT
   button at the end. GOT IT dismisses it in 200 ms; a long press on the scrim opens overview mode and dismisses it.
   Without the welcome it scales in from 0 in 250 ms (SHOW_CLING_DURATION, LogDecelerateInterpolator). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const SHOW = 250, DISMISS = 200; // LauncherClings.SHOW_CLING_DURATION / DISMISS_CLING_DURATION
  const DP = 0.906;
  const RING = {outer: 0, inner: 0, lift: 0};
  const KINDS = {workspace: {welcome: 'Welcome', title: 'Wallpapers, widgets, & settings', text: 'Touch & hold background to customize', button: 'GOT IT'}};
  const fresh = () => ({workspace: false});
  const dismissedAll = () => ({workspace: true});
  // Launcher.showFirstRunClings: the long-press cling on the workspace, never over all apps, a folder or overview mode.
  function wanted(state, clings) {
    if (!clings || state.view !== 'home' || state.overview || state.overlay || state.page === -1) return '';
    return clings.workspace ? '' : 'workspace';
  }
  function markup(kind, t) {
    const spec = KINDS[kind];
    if (!spec) return '';
    return `<div class="cling lp-cling" data-cling="${kind}" role="dialog" aria-label="${e(t(spec.title))}"><div class="cling-shade"></div><div class="lp-cling-content"><h3>${e(t(spec.welcome))}</h3><h4>${e(t(spec.title))}</h4><p>${e(t(spec.text))}</p><button type="button" class="lp-cling-ok" data-action="cling-dismiss" data-id="${kind}">${e(t(spec.button))}</button><span class="lp-cling-callout" aria-hidden="true"></span></div></div>`;
  }
  function cut() {}
  const show = root => root.querySelector('.lp-cling-content')?.animate?.([{transform: 'scale(0)'}, {transform: 'none'}], {duration: SHOW, easing: 'cubic-bezier(.05,.7,.1,1)'});
  function dismiss(root, done) {
    if (!root) { done?.(); return; }
    root.style.pointerEvents = 'none';
    root.classList.add('cling-leaving');
    const animation = root.animate?.([{opacity: 1}, {opacity: 0}], {duration: DISMISS, easing: 'cubic-bezier(.37,0,.63,1)', fill: 'forwards'});
    const finish = () => { root.remove(); done?.(); };
    if (animation) animation.finished.then(finish, finish); else finish();
  }
  window.LauncherClings = {SHOW, DISMISS, RING, KINDS, DP, fresh, dismissedAll, wanted, markup, cut, show, dismiss};
})();
