/* Android 5.1 keyguard (SystemUI NotificationPanelView in the KEYGUARD state, KeyguardStatusView, KeyguardBottomAreaView,
   KeyguardAffordanceHelper, KeyguardBouncer) on the Nexus 6. The lock screen is the notification panel itself: the
   KeyguardStatusBarView (40 dp: carrier, system icons, avatar), the 88 dp sans-serif-thin clock and the 16 sp date with
   the next alarm, the notifications as dimmed cards (at most keyguard_max_notification_count, then a +N overflow card),
   and the bottom area with the phone and camera affordances around the lock icon. KeyguardClockPositionAlgorithm places
   the clock's centre at 32.5 % of the height without notifications and moves it up to 18.5 % with them (values-h650dp),
   keeping 36 / 24 dp to the cards. Swiping up by keyguard_min_swipe_amount (110 dp) unlocks or brings the bouncer; the
   affordances open Phone or Camera when dragged away from their corner. Tapping shows the hint in the indication line
   (65 dp from the bottom) and the panel bounces. Sizes are dp x 0.906. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const DP = 0.906, MAX_NOTES = 4, STATUS_HEIGHT = 112, MIN_SWIPE = 110 * DP, AFFORDANCE_SWIPE = 120 * DP;
  const KLONDIKE = {2: 'ABC', 3: 'DEF', 4: 'GHI', 5: 'JKL', 6: 'MNO', 7: 'PQRS', 8: 'TUV', 9: 'WXYZ', 0: '+'};
  // KeyguardClockPositionAlgorithm: t = notifications / (max + summary card share), clock y fraction 32.5 % -> 18.5 %.
  function clockLayout(count, height) {
    const t = Math.min(1, count / (MAX_NOTES + 44 / 64));
    const fraction = .325 * (1 - t) + .185 * t, margin = 24 * t + 36 * (1 - t);
    const top = fraction * height - STATUS_HEIGHT * DP / 2;
    return {top, notesTop: top + STATUS_HEIGHT * DP + margin * DP};
  }
  function noteCard(note, t, locale, activated) {
    const icon = note.largeIcon ? `<span class="lp-note-icon large"><img src="assets/${e(note.largeIcon)}" alt=""></span><span class="lp-note-badge" style="background:${e(note.color || '#9e9e9e')}"><img src="assets/${e(note.smallIcon)}" alt=""></span>` : `<span class="lp-note-icon" style="background:${e(note.color || '#9e9e9e')}"><img src="assets/${e(note.smallIcon)}" alt=""></span>`;
    const time = note.time ? new Date(note.time).toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit'}) : '';
    return `<button class="notification lp-note lp-kg-note${activated ? ' activated' : ''}" data-action="lp-kg-note" data-id="${e(note.id)}">${icon}<span class="lp-note-body"><span class="lp-note-top"><strong data-no-translate>${e(t(note.title))}</strong><time>${e(time)}</time></span><span class="lp-note-text" data-no-translate>${e(t(note.detail))}</span></span></button>`;
  }
  // KeyguardPINView / KeyguardPatternView / KeyguardPasswordView inside the bouncer, over the 75 % in-front scrim.
  function bouncer(api, p) {
    const {state} = api, t = p.t, locked = api.remaining > 0, kind = state.kind;
    const message = `<p class="lp-kg-message credential-instruction" role="status">${e(api.message())}</p>`;
    const entry = label => `<form class="credential-entry lp-kg-entry" data-lock-form><input aria-label="${e(t(label))}" type="password" inputmode="none" autocomplete="off" maxlength="16" value="${e(state.value)}" ${locked ? 'disabled' : ''}></form>`;
    const key = digit => `<button type="button" class="lp-kg-key" data-lock-key="${digit}" aria-label="${digit}" ${locked ? 'disabled' : ''}><span>${digit}</span>${KLONDIKE[digit] ? `<small>${KLONDIKE[digit]}</small>` : '<small>&nbsp;</small>'}</button>`;
    let body;
    if (kind === 'pattern') body = `<div class="lp-kg-pattern">${api.grid()}</div>`;
    else if (kind === 'pin') body = `<div class="lp-kg-pin"><div class="lp-kg-pin-row">${entry('PIN')}<button type="button" class="lp-kg-delete" data-lock-key="delete" aria-label="${e(t('Delete'))}" ${locked ? 'disabled' : ''}><img src="assets/lp-kg-ic_backspace_24dp.svg" alt=""></button></div><div class="lp-kg-divider"></div>${[[1, 2, 3], [4, 5, 6], [7, 8, 9]].map(row => `<div class="lp-kg-keys">${row.map(key).join('')}</div>`).join('')}<div class="lp-kg-keys"><span></span>${key(0)}<button type="button" class="lp-kg-key lp-kg-ok" data-lock-action="next" aria-label="${e(t('OK'))}" ${locked ? 'disabled' : ''}><img src="assets/lp-kg-ic_done_wht.png" alt=""></button></div></div>`;
    else body = `<div class="lp-kg-password">${entry('Password')}</div>${api.keyboard ? `<div class="lp-kg-ime">${api.keyboard()}</div>` : ''}`;
    return `<div class="lp-kg-bouncer lp-kg-${kind}" role="group">${message}${body}<button type="button" class="lp-kg-emergency" data-lock-action="emergency">${e(t('Emergency call'))}</button></div>`;
  }
  function render(p) {
    const t = p.t, notes = p.notifications || [], shown = notes.slice(0, MAX_NOTES), more = notes.length - shown.length;
    const {top, notesTop} = clockLayout(notes.length ? Math.min(notes.length, MAX_NOTES) : 0, p.height);
    const alarm = p.alarm ? `<span class="lp-kg-alarm"><img src="assets/lp-sysui-ic_access_alarms_small.svg" alt="">${e(p.alarm)}</span>` : '';
    return `<div class="lock-view lp-keyguard${p.bouncer ? ' bouncing' : ''}" data-lp-kg>
      <div class="lp-kg-statusbar"><span class="lp-kg-carrier" data-no-translate>${e(p.carrier)}</span><span class="lp-kg-icons">${p.statusIcons}</span><span class="lp-kg-avatar"><img src="assets/lp-fw-ic_account_circle.svg" alt=""></span></div>
      <div class="lp-kg-panel">
        <div class="lp-kg-status" style="top:${top.toFixed(1)}px"><div class="lp-kg-clock" data-no-translate>${e(p.clock)}</div><div class="lp-kg-date"><span data-no-translate>${e(p.alarm ? p.shortDate : p.date)}</span>${alarm}</div>${p.owner ? `<div class="lp-kg-owner" data-no-translate>${e(p.owner)}</div>` : ''}</div>
        <div class="lp-kg-notes" style="top:${notesTop.toFixed(1)}px">${shown.map(note => noteCard(note, t, p.locale, p.activated === String(note.id))).join('')}${more > 0 ? `<div class="lp-kg-more">${e(t('+%d').replace('%d', more))}</div>` : ''}</div>
      </div>
      <div class="lp-kg-bottom">
        <p class="lp-kg-indication${p.hint ? ' visible' : ''}" role="status">${e(p.hint || '')}</p>
        <button class="lp-kg-affordance lp-kg-phone" data-kg-affordance="phone" aria-label="${e(t('Phone'))}"><span class="lp-kg-circle"></span><img src="assets/lp-kg-ic_phone_24dp.png" alt=""></button>
        <button class="lp-kg-lock" data-kg-affordance="lock" aria-label="${e(t('Swipe up to unlock'))}"><img src="assets/lp-sysui-${p.secure ? 'ic_lock_24dp' : 'ic_lock_open_24dp'}.svg" alt=""></button>
        <button class="lp-kg-affordance lp-kg-camera" data-kg-affordance="camera" aria-label="${e(t('Camera'))}"><span class="lp-kg-circle"></span><img src="assets/lp-kg-ic_camera_alt_24dp.png" alt=""></button>
      </div>
      ${p.bouncer ? `<div class="lp-kg-scrim"></div>${p.bouncer}` : ''}
    </div>`;
  }
  /* Gestures. Vertical: the panel follows the finger up (translate + fade); past MIN_SWIPE it unlocks. Affordances: the
     icon is dragged out with its circle growing; past AFFORDANCE_SWIPE it launches. A tap shows the hint. */
  function attach(root, cb) {
    if (!root || root.matches('.bouncing')) return {destroy() {}};
    const panel = root.querySelector('.lp-kg-panel'), bottom = root.querySelector('.lp-kg-bottom');
    let drag = null;
    const reset = animate => {
      for (const node of [panel, bottom]) { node.style.transition = animate ? 'transform .3s cubic-bezier(.4,0,.2,1),opacity .3s' : ''; node.style.transform = ''; node.style.opacity = ''; }
      root.querySelectorAll('.lp-kg-affordance').forEach(node => { node.style.transition = animate ? 'transform .3s cubic-bezier(.4,0,.2,1)' : ''; node.style.transform = ''; node.querySelector('.lp-kg-circle').style.transform = ''; });
    };
    const down = event => {
      if (event.button > 0 || event.target.closest('.lp-kg-note,.lp-kg-bouncer,.lp-kg-statusbar')) return;
      const affordance = event.target.closest('[data-kg-affordance]')?.dataset.kgAffordance || '';
      drag = {x: event.clientX, y: event.clientY, affordance: affordance === 'lock' ? '' : affordance, id: event.pointerId, moved: false, time: performance.now()};
      reset(false);
    };
    const move = event => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 8) return;
      drag.moved = true; event.preventDefault();
      if (drag.affordance) {
        const sign = drag.affordance === 'camera' ? -1 : 1, travel = Math.max(0, sign * dx);
        const node = root.querySelector(`.lp-kg-${drag.affordance}`);
        node.style.transform = `translateX(${sign * travel}px)`;
        node.querySelector('.lp-kg-circle').style.transform = `scale(${1 + travel / 40})`;
        return;
      }
      const up = Math.min(0, dy);
      panel.style.transform = `translateY(${up}px)`; panel.style.opacity = String(Math.max(0, 1 + up / (MIN_SWIPE * 2)));
      bottom.style.opacity = String(Math.max(0, 1 + up / MIN_SWIPE));
    };
    const up = event => {
      if (!drag || event.pointerId !== drag.id) return;
      const d = drag; drag = null;
      const dx = event.clientX - d.x, dy = event.clientY - d.y, fast = performance.now() - d.time < 250;
      if (!d.moved) { reset(false); cb.onTap?.(d.affordance || 'unlock'); return; }
      cb.suppressClick?.();
      if (d.affordance) {
        const sign = d.affordance === 'camera' ? -1 : 1;
        if (sign * dx > AFFORDANCE_SWIPE) { cb.onAffordance?.(d.affordance); return; }
        reset(true); return;
      }
      if (-dy > MIN_SWIPE || fast && -dy > MIN_SWIPE / 2) { cb.onUnlock?.(); return; }
      reset(true);
    };
    root.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move, {passive: false});
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return {destroy() { root.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); }};
  }
  // The tap feedback: the panel hops up and settles (KeyguardBottomAreaView/NotificationPanelView.startUnlockHintAnimation).
  function bounce(root, reduced) {
    const panel = root?.querySelector('.lp-kg-panel');
    if (!panel?.animate || reduced) return;
    panel.animate([{transform: 'none'}, {transform: `translateY(${-24 * DP}px)`, offset: .4}, {transform: 'none'}], {duration: 600, easing: 'cubic-bezier(.4,0,.2,1)'});
  }
  window.LPKeyguard = {DP, MAX_NOTES, clockLayout, render, bouncer, attach, bounce};
})();
