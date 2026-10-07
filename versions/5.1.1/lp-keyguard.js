/* Android 5.1 keyguard (SystemUI NotificationPanelView in the KEYGUARD state, KeyguardStatusView, KeyguardBottomAreaView,
   KeyguardAffordanceHelper, KeyguardBouncer) on the Nexus 6. The lock screen is the notification panel itself: the
   KeyguardStatusBarView (40 dp: carrier, system icons, avatar), the sans-serif-thin clock (widget_big_font_size: 112 dp in values-h650dp, which the Nexus 6 uses) and the 16 sp date with
   the next alarm, the notifications as dimmed cards (at most keyguard_max_notification_count, then a +N overflow card),
   and the bottom area with the phone and camera affordances around the lock icon. KeyguardClockPositionAlgorithm places
   the clock's centre at 32.5 % of the height without notifications and moves it up to 18.5 % with them (values-h650dp),
   keeping 36 / 32 dp (keyguard_clock_notifications_margin_max / _min, values-h650dp) to the cards. Swiping up by keyguard_min_swipe_amount (110 dp) unlocks or brings the bouncer; the
   affordances open Phone or Camera when dragged away from their corner. Tapping shows the hint in the indication line
   (65 dp from the bottom) and the panel bounces. Sizes are dp x 0.906. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const DP = 0.906, MAX_NOTES = 4, STATUS_HEIGHT = 140, MIN_SWIPE = 110 * DP, AFFORDANCE_SWIPE = 120 * DP;
  const KLONDIKE = {2: 'ABC', 3: 'DEF', 4: 'GHI', 5: 'JKL', 6: 'MNO', 7: 'PQRS', 8: 'TUV', 9: 'WXYZ', 0: '+'};
  // KeyguardClockPositionAlgorithm: t = notifications / (max + summary card share), clock y fraction 32.5 % -> 18.5 %.
  function clockLayout(count, height) {
    const t = Math.min(1, count / (MAX_NOTES + 44 / 64));
    const fraction = .325 * (1 - t) + .185 * t, margin = 32 * t + 36 * (1 - t);
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
    else body = `<div class="lp-kg-password">${entry('Password')}</div>`;
    // KeyguardPasswordView brings up the system keyboard (lp-ime.js) in its own window along the bottom; the bouncer
    // resizes to the space above it.
    const ime = kind === 'password' && api.keyboard ? `<div class="lp-kg-ime">${api.keyboard()}</div>` : '';
    return `<div class="lp-kg-bouncer lp-kg-${kind}" role="group">${message}${body}<button type="button" class="lp-kg-emergency" data-lock-action="emergency">${e(t('Emergency call'))}</button></div>${ime}`;
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
      root.querySelectorAll('.lp-kg-affordance img, .lp-kg-lock img').forEach(img => { img.style.transition = animate ? 'opacity .3s, transform .3s cubic-bezier(.4,0,.2,1)' : ''; img.style.opacity = ''; img.style.transform = ''; });
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
        // KeyguardAffordanceHelper.setTranslation: the dragged icon goes from the resting 0.5 alpha to 1, the others fade
        // to 0; each icon is scaled 0.8 + 0.2 x alpha / 0.5 (at most 1.5).
        const progress = Math.min(1, travel / AFFORDANCE_SWIPE), rest = Math.max(0, .5 * (1 - progress));
        const icon = (el, alpha) => { const img = el?.querySelector('img'); if (img) { img.style.opacity = String(Math.min(1, alpha)); img.style.transform = `scale(${Math.min(1.5, alpha / .5 * .2 + .8)})`; } };
        root.querySelectorAll('.lp-kg-affordance, .lp-kg-lock').forEach(el => icon(el, el === node ? rest + progress : rest));
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

// ---- The keyguard pager, widgets and challenges the Lollipop keyguard above draws on ----
/* Android 4.3 keyguard: KeyguardWidgetPager pages above a GlowPadView challenge (AOSP android-4.3_r1.1). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const DP = .9;
  // GlowPadView dimensions and timings (dimens.xml, GlowPadView.java, PointCloud.java).
  const G = {outer: 135 * DP, inner: 15 * DP, glow: 75 * DP, snap: 40 * DP, waveWidth: 100 * DP, wave: 1350, show: 200, showDelay: 50, hide: 200, innerPoints: 8, minPoint: 2, maxPoint: 4};
  const MAX_WIDGETS = 5;

  // PointCloud.makePointCloud: rings from the inner to the outer radius, spaced like the inner ring's points.
  function pointCloud(inner = G.inner, outer = G.outer) {
    const points = [], ds = 2 * Math.PI * inner / G.innerPoints, bands = Math.round((outer - inner) / ds), dr = (outer - inner) / bands;
    for (let b = 0, r = inner; b <= bands; b++, r += dr) {
      const count = Math.floor(2 * Math.PI * r / ds), step = 2 * Math.PI / count;
      for (let i = 0, eta = Math.PI / 2; i < count; i++, eta += step) points.push({x: r * Math.cos(eta), y: r * Math.sin(eta), r});
    }
    return points;
  }
  // PointCloud.getAlphaForPoint: cos^10 glow around the finger, cos^20 trailing edge of the wave.
  function pointAlpha(point, glow, wave) {
    let glowAlpha = 0, waveAlpha = 0;
    const distance = Math.hypot(glow.x - point.x, glow.y - point.y);
    if (distance < glow.radius) glowAlpha = glow.alpha * Math.max(0, Math.cos(Math.PI * .25 * distance / glow.radius) ** 10);
    const toRing = Math.hypot(point.x, point.y) - wave.radius;
    if (toRing < wave.width * .5 && toRing < 0) waveAlpha = wave.alpha * Math.max(0, Math.cos(Math.PI * .25 * toRing / wave.width) ** 20);
    return Math.max(glowAlpha, waveAlpha);
  }
  // KeyguardHostView page order: add-widget slot, user widgets, transport (when music is active), status clock, camera.
  function pages(widgets = [], {music = false} = {}) {
    const list = [];
    if (widgets.length < MAX_WIDGETS) list.push({type: 'add'});
    widgets.forEach(widget => list.push({type: 'widget', widget}));
    if (music) list.push({type: 'transport'});
    list.push({type: 'status'}, {type: 'camera'});
    return list;
  }
  const defaultPage = list => Math.max(0, list.findIndex(page => page.type === 'transport') >= 0 ? list.findIndex(page => page.type === 'transport') : list.findIndex(page => page.type === 'status'));
  const quad = t => 1 - (1 - t) * (1 - t), cubicOut = t => 1 - (1 - t) ** 3, cubicIn = t => t * t * t, quartOut = t => 1 - (1 - t) ** 4;

  function pagerMarkup(list, current, parts) {
    const page = item => {
      if (item.type === 'add') return `<div class="jbk-page jbk-add"><button class="jbk-add-button" data-action="kg-add-widget" aria-label="${e(parts.t('Add widget'))}"><img src="assets/jb-kg_add_widget.png" alt=""></button></div>`;
      if (item.type === 'widget') return `<div class="jbk-page jbk-user-widget" data-kg-widget="${e(item.widget.id)}">${parts.widget(item.widget)}</div>`;
      if (item.type === 'transport') return `<div class="jbk-page jbk-transport">${parts.transport}</div>`;
      if (item.type === 'camera') return `<div class="jbk-page jbk-camera" aria-label="${e(parts.t('Camera'))}"><img src="assets/ic_lockscreen_camera_normal.png" alt=""></div>`;
      return `<div class="jbk-page jbk-status"><div class="jbk-clock">${e(parts.clock)}${parts.ampm ? `<small>${e(parts.ampm)}</small>` : ''}</div><div class="jbk-status-line"><span>${e(parts.date)}</span>${parts.alarm ? `<span class="jbk-alarm"><img src="assets/kk-ic_alarm_small.png" alt="">${e(parts.alarm)}</span>` : ''}</div></div>`;
    };
    return `<div class="jbk-remove" aria-hidden="true">${e(parts.t('Remove'))}</div><div class="jbk-pager" data-kg-pager style="--kg-page:${current}"><div class="jbk-track">${list.map((item, index) => page(item).replace('<div class="jbk-page', `<div ${index === current ? '' : 'inert aria-hidden="true"'} class="jbk-page`)).join('')}</div></div>`;
  }
  function render(list, current, parts) {
    return `<div class="lock-view jb-keyguard">${pagerMarkup(list, current, parts)}<div class="jbk-challenge"><p class="jbc-message jbk-selector-message">${e(parts.owner)}</p><canvas class="jbk-points" aria-hidden="true"></canvas><div class="jbk-ring"></div><img class="jbk-target" src="assets/ic_lockscreen_unlock_normal.png" alt=""><img class="jbk-target-active" src="assets/ic_lockscreen_unlock_activated.png" alt=""><button class="jbk-handle" aria-label="${e(parts.t('Slide area.'))}"><img src="assets/ic_lockscreen_handle_normal.png" alt=""></button><div class="jbk-eca">${e(parts.carrier)}</div></div></div>`;
  }

  /* GlowPadView controller. Single unlock target with magnetic snapping: any drag past outer radius minus the
     snap margin activates it, as in handleMove's singleTarget branch. */
  function glowPad(root, {onUnlock, haptic, reduced}) {
    const canvas = root.querySelector('.jbk-points'), ctx = canvas.getContext('2d'), handle = root.querySelector('.jbk-handle');
    const dot = new Image(); dot.src = 'assets/jb-ic_lockscreen_glowdot.png';
    const points = pointCloud(), glow = {x: 0, y: 0, radius: G.glow, alpha: 0}, wave = {radius: 0, width: G.waveWidth, alpha: 0};
    let tweens = [], frame = 0, grabbed = null, active = false, destroyed = false;
    const center = () => { const box = canvas.getBoundingClientRect(), k = box.width / canvas.clientWidth || 1; return {x: box.left + box.width / 2, y: box.top + box.height / 2, k}; };
    const tween = (target, key, to, duration, ease, delay = 0, done) => {
      tweens = tweens.filter(item => !(item.target === target && item.key === key));
      if (!duration || reduced) { target[key] = to; done?.(); return; }
      tweens.push({target, key, from: target[key], to, duration, ease, start: performance.now() + delay, done});
    };
    const draw = now => {
      if (destroyed) return;
      tweens = tweens.filter(item => { const t = Math.min(1, Math.max(0, (now - item.start) / item.duration)); item.target[item.key] = item.from + (item.to - item.from) * item.ease(t); if (t >= 1) { item.done?.(); return false; } return true; });
      const dpr = window.devicePixelRatio || 1, w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      for (const point of points) {
        const alpha = pointAlpha(point, glow, wave);
        if (alpha <= 0) continue;
        const size = G.maxPoint + (G.minPoint - G.maxPoint) * point.r / G.outer, s = size / G.maxPoint * 12 / 1.5 * DP;
        ctx.globalAlpha = alpha;
        if (dot.complete && dot.naturalWidth) ctx.drawImage(dot, w / 2 + point.x - s / 2, h / 2 + point.y - s / 2, s, s);
      }
      frame = requestAnimationFrame(draw);
    };
    const ping = () => { wave.alpha = 1; wave.radius = 54 * DP; tween(wave, 'radius', 2 * G.outer, G.wave, quad, 0, () => { wave.radius = 0; wave.alpha = 0; }); };
    const setActive = value => {
      if (value === active) return;
      active = value; root.classList.toggle('jbk-snapped', active);
      tween(glow, 'alpha', active ? 0 : 1, 0, cubicIn);
      if (active && haptic()) navigator.vibrate?.(20);
    };
    const move = event => {
      if (!grabbed || event.pointerId !== grabbed.id) return;
      event.preventDefault();
      const c = center(), dx = (event.clientX - c.x) / c.k, dy = (event.clientY - c.y) / c.k, distance = Math.hypot(dx, dy);
      const scale = distance > G.outer ? G.outer / distance : 1;
      glow.x = dx * scale; glow.y = dy * scale;
      setActive(distance > G.outer - G.snap);
    };
    const up = event => {
      if (!grabbed || event.pointerId !== grabbed.id) return;
      grabbed = null; root.classList.remove('jbk-grabbed');
      if (active) { root.classList.add('jbk-triggered'); if (haptic()) navigator.vibrate?.(20); onUnlock(); return; }
      tween(glow, 'alpha', 0, G.hide, quartOut); tween(glow, 'x', 0, G.hide, quartOut); tween(glow, 'y', 0, G.hide, quartOut, 0, ping);
    };
    handle.addEventListener('pointerdown', event => {
      if (event.button > 0) return;
      event.preventDefault(); event.stopPropagation();
      grabbed = {id: event.pointerId}; active = false;
      try { handle.setPointerCapture(event.pointerId); } catch {}
      root.classList.add('jbk-grabbed'); root.classList.remove('jbk-snapped');
      glow.x = 0; glow.y = 0; tween(glow, 'alpha', 1, 0, cubicIn);
      if (haptic()) navigator.vibrate?.(20);
    });
    handle.addEventListener('pointermove', move); handle.addEventListener('pointerup', up); handle.addEventListener('pointercancel', up);
    handle.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onUnlock(); } });
    root.addEventListener('pointerdown', event => { if (!event.target.closest('.jbk-handle')) ping(); });
    frame = requestAnimationFrame(draw); requestAnimationFrame(ping);
    return {ping, destroy() { destroyed = true; cancelAnimationFrame(frame); }, state: () => ({glow: {...glow}, wave: {...wave}, active, grabbed: !!grabbed})};
  }

  /* KeyguardWidgetPager: horizontal paging with the widget frames shown while scrolling; settling on the camera
     page launches the camera (CameraWidgetFrame). Long-pressing a user widget lets it be dragged up to Remove. */
  function pager(root, {count, current, onSettle, onCamera, onRemove, reduced, canStart = () => true, onBegin, surface = root}) {
    const track = root.querySelector('.jbk-track'), view = root.closest('.jb-keyguard');
    let page = current, start = null;
    const width = () => root.clientWidth;
    const pagesOf = () => [...track.children];
    const mark = () => pagesOf().forEach((node, index) => { node.inert = index !== page; node.setAttribute('aria-hidden', String(index !== page)); });
    const place = (offset = 0, animate = false) => { track.style.transition = animate && !reduced ? 'transform .3s cubic-bezier(.22,.61,.36,1)' : 'none'; track.style.transform = `translateX(${-page * width() + offset}px)`; };
    place();
    surface.addEventListener('pointerdown', event => {
      if (event.button > 0 || event.target.closest('button') || !canStart(event)) return;
      start = {x: event.clientX, y: event.clientY, id: event.pointerId, time: performance.now(), dragging: false, widget: event.target.closest('[data-kg-widget]')};
      if (start.widget) start.timer = setTimeout(() => { if (start && !start.dragging) { start.removing = true; view.classList.add('jbk-removing'); start.widget.classList.add('jbk-lifted'); try { surface.setPointerCapture(start.id); } catch {} } }, 500);
    });
    surface.addEventListener('pointermove', event => {
      if (!start || event.pointerId !== start.id) return;
      const dx = event.clientX - start.x, dy = event.clientY - start.y;
      if (start.removing) { event.preventDefault(); start.widget.style.transform = `translateY(${Math.min(0, dy)}px) scale(.9)`; view.classList.toggle('jbk-over-remove', event.clientY < view.getBoundingClientRect().top + 60); return; }
      if (!start.dragging && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) { start.dragging = true; clearTimeout(start.timer); view.classList.add('jbk-paging'); onBegin?.(); try { surface.setPointerCapture(start.id); } catch {} }
      if (!start.dragging) { if (Math.hypot(dx, dy) > 8) clearTimeout(start.timer); return; }
      event.preventDefault();
      const edge = (page === 0 && dx > 0) || (page === count - 1 && dx < 0);
      place(edge ? dx * .3 : dx);
    });
    const finish = event => {
      if (!start || event.pointerId !== start.id) return;
      clearTimeout(start.timer);
      const dx = event.clientX - start.x, velocity = dx / Math.max(1, performance.now() - start.time);
      if (start.removing) {
        const remove = view.classList.contains('jbk-over-remove');
        view.classList.remove('jbk-removing', 'jbk-over-remove'); start.widget.classList.remove('jbk-lifted'); start.widget.style.transform = '';
        const id = start.widget.dataset.kgWidget; start = null;
        if (remove) onRemove(id);
        return;
      }
      if (start.dragging) {
        const previous = page;
        if (Math.abs(dx) > width() * .4 || Math.abs(velocity) > .5) page = Math.max(0, Math.min(count - 1, page + (dx < 0 ? 1 : -1)));
        place(0, true); mark();
        setTimeout(() => view.classList.remove('jbk-paging'), 300);
        onSettle(page, previous);
        if (page === count - 1) setTimeout(onCamera, reduced ? 0 : 300);
      }
      start = null;
    };
    surface.addEventListener('pointerup', finish); surface.addEventListener('pointercancel', finish);
    return {go(index) { page = Math.max(0, Math.min(count - 1, index)); place(0, true); mark(); onSettle(page); if (page === count - 1) setTimeout(onCamera, reduced ? 0 : 300); }, page: () => page};
  }

  /* Secure keyguard (keyguard_host_view, SlidingChallengeLayout, KeyguardSecurityContainer): the security view
     slides up from the bottom over the widget pager; the expand handle fills the 64dp pager bottom padding. */
  const S = {bound: 64 * DP, edge: 24 * DP, handle: 8 * DP, settle: 600, fadeOut: 100, fadeIn: 160, bouncer: 250, fling: 50 * DP, message: 5000, clear: 2000};
  const KLONDIKE = ['', '', 'ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQRS', 'TUV', 'WXYZ'];
  const WRONG = {pattern: 'Wrong Pattern', pin: 'Wrong PIN', password: 'Wrong Password'};
  const challengeAlpha = offset => (offset - 1) ** 3 + 1;
  const quint = t => (t - 1) ** 5 + 1, accelDecel = t => Math.cos((t + 1) * Math.PI) / 2 + .5;
  // animateChallengeTo: a fling sets the duration from its velocity (px/s), otherwise (distance ratio + 1) * 100 ms.
  function settleDuration(dy, height, velocity = 0) {
    const half = height / 2, ratio = Math.min(1, Math.abs(dy) / height), distance = half + half * Math.sin((ratio - .5) * .3 * Math.PI / 2);
    return Math.min(S.settle, Math.abs(velocity) > 0 ? 4 * Math.round(1000 * Math.abs(distance / velocity)) : Math.round((Math.abs(dy) / height + 1) * 100));
  }
  const settleShows = (offset, velocity) => Math.abs(velocity) > S.fling ? velocity < 0 : offset >= .5;
  // KeyguardMessageArea: owner info by default; important messages replace it for five seconds; lockout counts down.
  function securityMessage({error = '', errorAt = 0, remaining = 0, owner = '', now = Date.now()}, t) {
    if (remaining) return t('Try again in %d seconds.').replace('%d', remaining);
    if (error && now - errorAt < S.message) return t(error);
    return owner || '';
  }
  function securityView(api, parts) {
    const {state} = api, t = parts.t, kind = state.kind, locked = api.remaining > 0;
    const message = `<p class="jbc-message credential-instruction" role="status">${e(api.message())}</p>`;
    const eca = `<div class="jbc-eca"><div class="jbc-carrier">${e(parts.carrier)}</div><button type="button" class="jbc-emergency" data-lock-action="emergency"><img src="assets/lock-ic_lockscreen_emergencycall_normal.png" alt="">${e(t('Emergency call'))}</button></div>`;
    const entry = label => `<form class="credential-entry" data-lock-form><input aria-label="${e(t(label))}" type="password" inputmode="none" autocomplete="off" maxlength="16" value="${e(state.value)}" ${locked ? 'disabled' : ''}></form>`;
    const key = digit => `<button type="button" class="jbc-key" data-lock-key="${digit}" aria-label="${digit}" ${locked ? 'disabled' : ''}><span>${digit}</span>${KLONDIKE[digit] ? `<small>${KLONDIKE[digit]}</small>` : ''}</button>`;
    let body;
    if (kind === 'pattern') body = `<div class="jbc-bouncer jbc-frame" aria-label="${e(t('Pattern area.'))}">${api.grid()}</div>`;
    else if (kind === 'pin') body = `<div class="jbc-bouncer jbc-pad"><div class="jbc-row jbc-entry">${entry('PIN')}<button type="button" class="jbc-delete" data-lock-key="delete" aria-label="${e(t('Delete'))}" ${locked ? 'disabled' : ''}><img src="assets/jb-ic_input_delete.png" alt=""></button></div><div class="jbc-divider"></div>${[[1, 2, 3], [4, 5, 6], [7, 8, 9]].map(row => `<div class="jbc-row">${row.map(key).join('')}</div>`).join('')}<div class="jbc-row"><span class="jbc-space"></span>${key(0)}<button type="button" class="jbc-key jbc-enter" data-lock-key="next" aria-label="${e(t('Enter'))}" ${locked ? 'disabled' : ''}><img src="assets/jb-sym_keyboard_return_holo.png" alt=""></button></div></div>`;
    else body = `<span class="jbc-fill"></span>${message}<div class="jbc-bouncer jbc-strip">${entry('Password')}</div><span class="jbc-fill"></span>`;
    const label = {pattern: 'Pattern unlock.', pin: 'PIN unlock.', password: 'Password unlock.'}[kind];
    return `<div class="jbc-view jbc-${kind}" role="group" aria-label="${e(t(label))}">${kind === 'password' ? '' : message}${body}${eca}</div>`;
  }
  function renderSecure(list, current, parts) {
    const classes = `${parts.up ? ' jbk-up' : ''}${parts.bouncing ? ' jbk-bouncing' : ''}${parts.ime ? ' jbk-with-ime' : ''}`;
    return `<div class="lock-view jb-keyguard jbk-secure${classes}" data-kg-secure><div class="jbk-host">${pagerMarkup(list, current, parts)}<div class="jbk-scrim" data-kg-scrim></div><div class="jbk-security" data-kg-security ${parts.up ? '' : 'inert aria-hidden="true"'}>${parts.security}</div><button type="button" class="jbk-expand" data-kg-expand aria-label="${e(parts.t('Expand unlock area.'))}"><img src="assets/jb-kg_security_lock_normal.png" alt=""></button></div>${parts.ime ? `<div class="jbk-ime">${parts.ime}</div>` : ''}</div>`;
  }

  /* SlidingChallengeLayout controller: drag across the challenge top (or up from the handle) to slide it,
     settle with a quintic ease-out; paging the widgets fades it out (100 ms) and back in (160 ms) when the
     page did not change. The bouncer adds the #99000000 scrim and zooms the current page to 0.67. */
  function challenge(view, {up = true, bouncing = false, reduced, onChange, onBouncer}) {
    const host = view.querySelector('.jbk-host'), panel = view.querySelector('[data-kg-security]'), expand = view.querySelector('[data-kg-expand]'), scrim = view.querySelector('[data-kg-scrim]');
    let offset = up ? 1 : 0, showing = up, bounce = bouncing, wasShowing = up, frame = 0, drag = null, faded = false, interactive = true, destroyed = false;
    const travel = () => Math.max(1, panel.offsetHeight - S.bound);
    const apply = () => { panel.style.transform = `translateY(${travel() * (1 - offset)}px)`; panel.style.opacity = String(challengeAlpha(offset)); };
    const setShowing = value => {
      if (showing === value) return;
      showing = value; view.classList.toggle('jbk-up', showing); panel.inert = !showing; panel.setAttribute('aria-hidden', String(!showing));
      requestAnimationFrame(apply); onChange?.(showing);
    };
    const stop = () => { cancelAnimationFrame(frame); frame = 0; };
    const run = (duration, ease, step, done) => {
      stop();
      if (!duration || reduced) { step(1); done(); return; }
      const start = performance.now();
      const tick = now => { if (destroyed) return; const t = Math.min(1, (now - start) / duration); step(ease(t)); if (t < 1) frame = requestAnimationFrame(tick); else { frame = 0; done(); } };
      frame = requestAnimationFrame(tick);
    };
    function animateTo(target, velocity = 0) {
      const from = offset, dy = (target - from) * travel();
      if (target > 0) setShowing(true);
      view.classList.add('jbk-sliding');
      run(dy ? settleDuration(dy, panel.offsetHeight, velocity) : 0, quint, k => { offset = from + (target - from) * k; apply(); }, () => { view.classList.remove('jbk-sliding'); offset = target; apply(); setShowing(target === 1); });
    }
    function fade(show) {
      if (show) { offset = 1; setShowing(true); apply(); panel.style.opacity = '0'; } else faded = true;
      const from = Number(panel.style.opacity || 1), to = show ? 1 : 0;
      view.classList.add('jbk-sliding');
      run(show ? S.fadeIn : S.fadeOut, accelDecel, k => { panel.style.opacity = String(from + (to - from) * k); }, () => { view.classList.remove('jbk-sliding'); if (!show) { offset = 0; setShowing(false); } apply(); });
    }
    function showBouncer() {
      if (bounce) return;
      bounce = true; wasShowing = showing; view.classList.add('jbk-bouncing'); onBouncer?.(true);
      if (offset < 1) animateTo(1);
    }
    function hideBouncer() {
      if (!bounce) return;
      bounce = false; view.classList.remove('jbk-bouncing'); onBouncer?.(false);
      if (!wasShowing) animateTo(0);
    }
    const inColumn = x => { const box = panel.getBoundingClientRect(); return x >= box.left && x < box.right; };
    host.addEventListener('pointerdown', event => {
      if (event.button > 0 || bounce || !interactive || frame) return;
      if (event.target.closest('input, .credential-pattern, .jbc-key, .jbc-delete, .jbc-emergency, [data-action]')) return;
      drag = {id: event.pointerId, y0: event.clientY, line: panel.getBoundingClientRect().top, offset, active: false, samples: [{y: event.clientY, t: performance.now()}]};
      // isInDragHandle: the band just above the challenge top starts a drag at once.
      if (inColumn(event.clientX) && event.clientY >= drag.line - S.handle - 6 && event.clientY <= drag.line + 6) drag.active = true;
    });
    const move = event => {
      if (!drag || event.pointerId !== drag.id) return;
      const y = event.clientY;
      drag.samples.push({y, t: performance.now()}); if (drag.samples.length > 6) drag.samples.shift();
      // crossedDragHandle: started above the top and moved below it while showing, or the reverse while hidden.
      if (!drag.active && inColumn(event.clientX) && (showing ? drag.y0 < drag.line - S.handle && y > drag.line : drag.y0 > drag.line && y < drag.line - S.handle)) { drag.active = true; drag.y0 = y; drag.offset = offset; }
      if (!drag.active) return;
      event.preventDefault(); stop(); view.classList.add('jbk-sliding');
      offset = Math.max(0, Math.min(1, drag.offset - (y - drag.y0) / travel()));
      if (offset > 0) setShowing(true);
      apply();
    };
    const end = event => {
      if (!drag || event.pointerId !== drag.id) return;
      const was = drag; drag = null;
      if (!was.active) return;
      const first = was.samples[0], last = was.samples.at(-1), velocity = last.t > first.t ? (last.y - first.y) / (last.t - first.t) * 1000 : 0;
      view.dataset.dragged = String(Date.now());
      animateTo(settleShows(offset, velocity) ? 1 : 0, velocity);
    };
    window.addEventListener('pointermove', move, {passive: false}); window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end);
    expand.addEventListener('click', event => { event.preventDefault(); if (Date.now() - Number(view.dataset.dragged || 0) < 350 || !interactive) return; animateTo(1); });
    scrim.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); hideBouncer(); });
    apply();
    return {
      showBouncer, hideBouncer, show: () => animateTo(1), hide: () => animateTo(0),
      // KeyguardViewStateManager.onPageBeginMoving / onPageSwitching.
      pageBegin() { if (showing && !bounce) { faded = false; fade(false); } },
      pageEnd(same) { if (faded && same) fade(true); faded = false; },
      setInteractive(value) { interactive = value; },
      edgeOnly: () => showing, bouncing: () => bounce, showing: () => showing, offset: () => offset,
      destroy() { destroyed = true; stop(); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end); }
    };
  }
  window.JBKeyguard = {G, S, MAX_WIDGETS, KLONDIKE, WRONG, pointCloud, pointAlpha, pages, defaultPage, render, renderSecure, securityView, securityMessage, settleDuration, settleShows, challengeAlpha, glowPad, pager, challenge};
})();
