/* Launcher3 4.4 clings (LauncherClings.java, Cling.java; first_run_cling.xml, workspace_cling.xml, folder_cling.xml).
   First run: a #64b1ea circle (radius min(180dp, (bubble width + 60dp) / 2) = 110dp) behind "Welcome" over a
   #cc000000 scrim. Its OK leads to the workspace cling: the scrim with a 60dp ring at half alpha and a 50dp hole,
   30dp above the centre, and a blue cling bubble pointing at it; a long press anywhere dismisses it into overview
   mode. The folder cling sits over the scrim with the open folder brought to the front. Shown in 250 ms, dismissed
   in 200 ms. Sizes are dp x 0.906. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const SHOW = 250, DISMISS = 200; // LauncherClings.SHOW_CLING_DURATION / DISMISS_CLING_DURATION
  const DP = 0.906;
  const RING = {outer: 60 * DP, inner: 50 * DP, lift: 30 * DP}; // WORKSPACE_*_CIRCLE_RADIUS_DPS, WORKSPACE_CIRCLE_Y_OFFSET_DPS
  const KINDS = {
    firstRun: {title: 'Welcome', text: 'Make yourself at home.', hint: 'Create more screens for apps and folders'},
    workspace: {title: 'Organize your space', text: 'Touch & hold background to manage wallpaper, widgets and settings.'},
    folder: {title: "Here's a folder", text: 'To create one like this, touch & hold an app, then move it over another.'}
  };
  const fresh = () => ({firstRun: false, workspace: false, folder: false});
  const dismissedAll = () => ({firstRun: true, workspace: true, folder: true});
  // Which cling the launcher state asks for: first run, then the workspace cling after it; the folder cling on open.
  function wanted(state, clings) {
    if (!clings || state.view !== 'home' || state.overview) return '';
    if (state.overlay === 'folder') return clings.folder ? '' : 'folder';
    if (state.overlay) return '';
    if (!clings.firstRun) return 'firstRun';
    return clings.workspace ? '' : 'workspace';
  }
  function markup(kind, t) {
    const spec = KINDS[kind];
    const ok = `<button type="button" class="cling-ok" data-action="cling-dismiss" data-id="${kind}">${e(t('OK'))}</button>`;
    if (kind === 'firstRun') return `<div class="cling kk-cling kk-cling-firstRun" data-cling="firstRun" role="dialog" aria-label="${e(t(spec.title))}"><div class="cling-shade"></div><div class="kk-cling-content"><div class="kk-first-bubble"><h3>${e(t(spec.title))}</h3><p>${e(t(spec.text))}</p></div><p class="kk-cling-hint">${e(t(spec.hint))}<img src="assets/l3-cling_arrow_right.png" alt=""></p></div>${ok}</div>`;
    const bubble = `<div class="kk-cling-bubble"><div class="kk-cling-box"><h3>${e(t(spec.title))}</h3><p>${e(t(spec.text))}</p></div><img class="kk-cling-arrow" src="assets/l3-cling_arrow_down.png" alt=""></div>`;
    return `<div class="cling kk-cling kk-cling-${kind}" data-cling="${kind}" role="dialog" aria-label="${e(t(spec.title))}"><div class="cling-shade"></div>${kind === 'workspace' ? '<span class="kk-cling-ring"></span>' : ''}<div class="kk-cling-content">${bubble}</div>${ok}</div>`;
  }
  /* The workspace cling's scrim is drawn with the ring erased from it (outer circle at alpha 128, inner hole clear);
     the folder cling leaves the open folder's hit rect uncovered so it takes touches. */
  function cut(root, hole) {
    const shade = root.querySelector('.cling-shade'); if (!shade) return;
    const w = root.clientWidth, h = root.clientHeight, outer = `M0 0H${w}V${h}H0Z`;
    let inner = '';
    if (hole?.circle) { const [x, y] = hole.circle, r = hole.radius; inner = `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`; }
    else if (hole?.rect) { const {left, top, right, bottom} = hole.rect; inner = `M${left} ${top}H${right}V${bottom}H${left}Z`; }
    shade.style.clipPath = inner ? `path(evenodd, '${outer}${inner}')` : '';
    const ring = root.querySelector('.kk-cling-ring');
    if (ring && hole?.circle) { ring.style.left = `${hole.circle[0]}px`; ring.style.top = `${hole.circle[1]}px`; }
  }
  const show = root => root.animate?.([{opacity: 0}, {opacity: 1}], {duration: SHOW, easing: 'cubic-bezier(.55,.085,.68,.53)'});
  function dismiss(root, done) {
    if (!root) { done?.(); return; }
    root.style.pointerEvents = 'none';
    root.classList.add('cling-leaving');
    const animation = root.animate?.([{opacity: 1}, {opacity: 0}], {duration: DISMISS, easing: 'cubic-bezier(.37,0,.63,1)', fill: 'forwards'});
    const finish = () => { root.remove(); done?.(); };
    if (animation) animation.finished.then(finish, finish); else finish();
  }
  window.LauncherClings = {SHOW, DISMISS, RING, KINDS, fresh, dismissedAll, wanted, markup, cut, show, dismiss};
})();
