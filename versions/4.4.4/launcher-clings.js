/* Launcher2 first-run clings (Cling.java, workspace_cling.xml, all_apps_cling.xml, folder_cling.xml), identical in
   4.0.4 and 4.3. Sizes are dp scaled by 0.9; the punch-through graphic is scaled by reveal_radius / 94dp. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const SHOW = 550, DISMISS = 250; // Launcher.SHOW_CLING_DURATION / DISMISS_CLING_DURATION
  const REVEAL = 43.2;             // reveal_radius (4.3) = app_icon_size (4.0.4) = 48dp
  const PUNCH = 600 * 0.6 * (48 / 94); // cling.png (400dp) scaled so its 94dp centre radius meets the reveal radius
  const HAND = [284 * 0.6, 391 * 0.6], HAND_OFFSET = 10.8; // hand.png, app_icon_size / 4
  const KINDS = {
    workspace: {bg: 'cling-bg_cling1', title: 'Make yourself at home', text: 'You can put your favorite apps here.', bottom: 'To see all your apps, touch the circle.'},
    allApps: {bg: 'cling-bg_cling2', title: 'Choose some apps', text: 'To add an app to your Home screen, touch & hold it.', hand: true},
    folder: {bg: 'cling-bg_cling3', title: 'Organize your apps with folders', text: 'To make a new folder on your Home screen, stack one app on top of another.'}
  };
  const fresh = () => ({workspace: false, allApps: false, folder: false});
  const dismissedAll = () => ({workspace: true, allApps: true, folder: true});
  // Which cling the current launcher state asks for, in Launcher's order of precedence.
  function wanted(state, clings) {
    if (!clings) return '';
    if (state.view === 'home' && state.overlay === 'folder') return clings.folder ? '' : 'folder';
    if (state.view === 'home' && !state.overlay) return clings.workspace ? '' : 'workspace';
    if (state.view === 'drawer' && !state.overlay) return clings.allApps ? '' : 'allApps';
    return '';
  }
  function markup(kind, t, point) {
    const spec = KINDS[kind];
    const punch = point ? `<span class="cling-punch" style="left:${point[0]}px;top:${point[1]}px;width:${PUNCH}px;height:${PUNCH}px"></span>` : '';
    const hand = spec.hand && point ? `<span class="cling-hand" style="left:${point[0] + HAND_OFFSET}px;top:${point[1] + HAND_OFFSET}px;width:${HAND[0]}px;height:${HAND[1]}px"></span>` : '';
    return `<div class="cling cling-${kind}" data-cling="${kind}" role="dialog" aria-label="${e(t(spec.title))}" style="--cling-bg:url('assets/${spec.bg}.png')"><div class="cling-shade"></div>${punch}${hand}<div class="cling-copy"><h3>${e(t(spec.title))}</h3><p>${e(t(spec.text))}</p></div>${spec.bottom ? `<p class="cling-bottom">${e(t(spec.bottom))}</p>` : ''}<button type="button" class="cling-ok" data-action="cling-dismiss" data-id="${kind}">${e(t('OK'))}</button></div>`;
  }
  /* The shade is cut out where touches pass through: the circle (Cling.onTouchEvent's reveal radius) or the open
     folder (its hit rect). Only the shade takes touches, and clip-path stops pointer events in the hole, so the launcher underneath gets them;
     the ring graphic is drawn over the hole as Cling.dispatchDraw does. */
  function cut(root, hole) {
    const shade = root.querySelector('.cling-shade'); if (!shade) return;
    const w = root.clientWidth, h = root.clientHeight, outer = `M0 0H${w}V${h}H0Z`;
    let inner = '';
    if (hole?.circle) { const [x, y] = hole.circle, r = REVEAL; inner = `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`; }
    else if (hole?.rect) { const {left, top, right, bottom} = hole.rect; inner = `M${left} ${top}H${right}V${bottom}H${left}Z`; }
    const path = `path(evenodd, '${outer}${inner}')`;
    shade.style.clipPath = path;
  }
  const show = root => root.animate?.([{opacity: 0}, {opacity: 1}], {duration: SHOW, easing: 'cubic-bezier(.55,.085,.68,.53)'});
  function dismiss(root, done) {
    if (!root) { done?.(); return; }
    root.style.pointerEvents = 'none';
    const animation = root.animate?.([{opacity: 1}, {opacity: 0}], {duration: DISMISS, easing: 'cubic-bezier(.37,0,.63,1)', fill: 'forwards'});
    const finish = () => { root.remove(); done?.(); };
    if (animation) animation.finished.then(finish, finish); else finish();
  }
  window.LauncherClings = {SHOW, DISMISS, REVEAL, PUNCH, HAND, HAND_OFFSET, KINDS, fresh, dismissedAll, wanted, markup, cut, show, dismiss};
})();
