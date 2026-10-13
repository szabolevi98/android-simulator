/* Android 2.1 lock screen: framework-res keyguard_screen_tab_unlock.xml, which android.policy.jar's LockScreen inflates
   (ERE27; the rotary layouts are in the image but unused), with framework.jar's SlidingTab.
   - LockScreen: carrier top right; DigitalClock "h:mm" + AM/PM (22 sp) or "kk:mm"; date full_wday_month_day_no_year;
     status1 / status2 = charging and / or the next alarm (Settings NEXT_ALARM_FORMATTED, "E h:mm aa" / "E kk:mm");
     screenLocked is empty ("used for sliding tab feedback"): toastMessage(text, icon) shows "Sound is OFF / ON" with
     ic_lock_ringer_off / on there for 3500 ms. config_disableMenuKeyInLockScreen is true, so Menu does not unlock.
     Left tab: unlock (ic_jog_dial_unlock, jog_tab_target_green, jog_tab_bar_left_unlock, jog_tab_left_unlock), held after
     its trigger; right tab: silent mode (sound_off / sound_on resources by state), reset after its trigger.
   - SlidingTab: THRESHOLD 2/3, TRACKING_MARGIN 50 px, ANIM_DURATION 250 ms, ANIM_TARGET_TIME 500 ms, VIBRATE_SHORT 30 /
     VIBRATE_LONG 40 ms. layout(): the tab at its edge, the bar ("text", the hint on the bar drawable) one parent width
     beyond it, the target at THRESHOLD * width - targetWidth + tabWidth / 2 (left) or (1 - THRESHOLD) * width - tabWidth / 2
     (right). Grabbing a tab presses it, fades its target in and slides the other tab away; dragging moves tab and bar
     together; crossing the threshold makes them "active" (the confirm drawables, TextAppearance.SlidingTabActive) and
     triggers; letting go before it slides everything back.
   - With an unlock pattern saved and Require pattern on (LockPatternKeyguardView.isSecure), getInitialMode is the
     UnlockScreen right away, not this one: keyguard_screen_unlock_portrait.xml (#70000000; carrier marginTop 6 dp;
     DigitalClock 56 sp + am_pm 18 sp; date; divider; status1 | status2 18 sp; the LockPatternView, a square as tall as
     the space left, centred; Emergency call in Widget.Button.Transparent). updateStatusLines: mInstructions if set
     (with ic_lock_idle_lock, none when empty), else the battery (ic_lock_idle_charging; plugged in or under
     LOW_BATTERY_THRESHOLD 20) and / or the next alarm ("|" between, lockscreen_battery_short), else
     lockscreen_pattern_instructions. A right pattern unlocks at once; a wrong one is shown red with "Sorry, try
     again" and cleared after PATTERN_CLEAR_TIMEOUT_MS 2000; patterns of MIN_PATTERN_REGISTER_FAIL 3 or more dots count,
     and FAILED_ATTEMPTS_BEFORE_TIMEOUT 5 of them lock the pattern for FAILED_ATTEMPT_TIMEOUT_MS 30 s (a countdown in
     status1; LockPatternKeyguardView's showTimeoutDialog). The Google-account fallback (Forgot pattern?) is not built. */
(() => {
  'use strict';
  const T = () => EC.text('lock');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  EC.defaults.alarms = EC.defaults.alarms || [];

  function nextAlarm(c) {
    const now = new Date();
    let best = null;
    for (const alarm of c.data.alarms || []) {
      if (!alarm.enabled) continue;
      const [h, m] = String(alarm.time).split(':').map(Number);
      for (let add = 0; add < 8; add++) {
        const d = new Date(now); d.setDate(now.getDate() + add); d.setHours(h, m, 0, 0);
        const days = alarm.days || [];   // 0 = Monday … 6 = Sunday; none = once
        if (d <= now || days.length && !days.includes((d.getDay() + 6) % 7)) continue;
        if (!best || d < best) best = d;
        break;
      }
    }
    return best && c.dateFormat(c.is24() ? 'E kk:mm' : 'E h:mm aa', best);
  }
  function statusLines(c) {
    const s = c.data.settings, lines = [];
    if (s.charging) lines.push(['fw-ic_lock_idle_charging.png', s.battery >= 100 ? T().t('lockscreen_charged') : T().fmt('lockscreen_plugged_in', c.lang, s.battery)]);
    else if (s.battery < 20) lines.push(['fw-ic_lock_idle_low_battery.png', T().t('lockscreen_low_battery')]);
    const alarm = nextAlarm(c);
    if (alarm) lines.push(['fw-ic_lock_idle_alarm.png', alarm]);
    return lines.map(([icon, text]) => `<div class="eclk-status"><img src="assets/${icon}" alt="">${esc(text)}</div>`).join('');
  }
  function time(c) {
    const now = new Date();
    return c.is24() ? {time: c.dateFormat('kk:mm', now), ampm: ''} : {time: c.dateFormat('h:mm', now), ampm: now.getHours() < 12 ? 'AM' : 'PM'};
  }

  // The right tab's resources follow the ringer (LockScreen.updateRightTabResources).
  const right = silent => silent
    ? {icon: 'fw-ic_jog_dial_sound_off.png', target: 'fw-jog_tab_target_yellow.png', confirm: 'yellow', hint: 'lockscreen_sound_on_label'}
    : {icon: 'fw-ic_jog_dial_sound_on.png', target: 'fw-jog_tab_target_gray.png', confirm: 'gray', hint: 'lockscreen_sound_off_label'};
  function slider(side, icon, target, confirm, hint) {
    return `<div class="ecst-slider ecst-${side}" data-side="${side}" data-confirm="${confirm}">
      <div class="ecst-bar"><i class="ec-bg ecst-bar-normal np-fw-jog_tab_bar_${side}_end_normal"></i><i class="ec-bg ecst-bar-pressed np-fw-jog_tab_bar_${side}_end_pressed"></i><i class="ec-bg ecst-bar-active np-fw-jog_tab_bar_${side}_end_confirm_${confirm}"></i><span>${esc(T().t(hint))}</span></div>
      <img class="ecst-target" src="assets/${target}" alt="">
      <div class="ecst-tab"><img class="ecst-tab-bg" src="assets/fw-jog_tab_${side}_normal.png" alt=""><img class="ecst-icon" src="assets/${icon}" alt=""></div></div>`;
  }

  // UnlockScreen ---------------------------------------------------------------------------------------------------------
  const secure = c => !!(c.data.settings.lockPattern && c.data.prefs?.lockenabled);
  const kg = {instructions: null, failed: 0, total: 0, deadline: 0, clearTimer: 0, countdown: 0};
  function unlockStatus(c) {
    const s = c.data.settings, line = (icon, text) => `${icon ? `<img src="assets/${icon}" alt="">` : ''}<span>${esc(text)}</span>`;
    if (kg.instructions !== null) return `<div class="eclk-st1">${kg.instructions ? line('fw-ic_lock_idle_lock.png', kg.instructions) : ''}</div>`;
    const battery = s.charging || s.battery < 20, alarm = nextAlarm(c);
    const charging = () => s.charging ? (s.battery >= 100 ? T().t('lockscreen_charged') : T().fmt('lockscreen_plugged_in', c.lang, s.battery)) : T().t('lockscreen_low_battery');
    if (battery && !alarm) return `<div class="eclk-st1">${line('fw-ic_lock_idle_charging.png', charging())}</div>`;
    if (alarm && !battery) return `<div class="eclk-st1">${line('fw-ic_lock_idle_alarm.png', alarm)}</div>`;
    if (alarm && battery) return `<div class="eclk-st1">${line('fw-ic_lock_idle_alarm.png', alarm)}</div><span class="eclk-sep">|</span><div class="eclk-st1">${line(s.charging ? 'fw-ic_lock_idle_charging.png' : '', T().fmt('lockscreen_battery_short', c.lang, Math.min(100, s.battery)))}</div>`;
    return `<div class="eclk-st1">${line('fw-ic_lock_idle_lock.png', T().t('lockscreen_pattern_instructions'))}</div>`;
  }
  function renderUnlock(c) {
    const t = time(c);
    const carrier = c.data.settings.airplane ? T().t('lockscreen_carrier_default') : (c.data.settings.carrier || 'T-Mobile');
    return `<div class="eclk eclk-unlock"><div class="eclk-head"><div class="eclk-carrier">${esc(carrier)}</div>
      <div class="eclk-time"><span class="eclk-clock">${esc(t.time)}</span>${t.ampm ? `<span class="eclk-ampm">${t.ampm}</span>` : ''}</div>
      <div class="eclk-date">${esc(c.dateFormat(T().t('full_wday_month_day_no_year')))}</div></div>
      <i class="eclk-divider np-fw-divider_horizontal_dark"></i>
      <div class="eclk-statusrow">${unlockStatus(c)}</div>
      <div class="eclk-patternbox"><canvas class="eclk-pattern"></canvas></div>
      <div class="eclk-footer"><button type="button" class="eclk-emergency" data-action="eclk-emergency"><i class="ec-bg np-fw-btn_default_transparent_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><img src="assets/fw-ic_emergency.png" alt=""><span>${esc(T().t('lockscreen_emergency_call'))}</span></button></div></div>`;
  }
  const refreshStatus = c => { const row = c.el.viewport.querySelector('.eclk-statusrow'); if (row) row.innerHTML = unlockStatus(c); };
  function lockout(c, view) {
    view.clear(); view.enable(false);
    clearInterval(kg.countdown);
    const tick = () => {
      const left = Math.round((kg.deadline - Date.now()) / 1000);
      if (left <= 0) {   // CountDownTimer.onFinish
        clearInterval(kg.countdown); kg.deadline = 0; kg.failed = 0;
        kg.instructions = T().t('lockscreen_pattern_instructions'); view.enable(true); refreshStatus(c); return;
      }
      kg.instructions = T().fmt('lockscreen_too_many_failed_attempts_countdown', c.lang, left); refreshStatus(c);
    };
    tick(); kg.countdown = setInterval(tick, 1000);
  }
  function mountUnlock(c, root) {
    const box = root.querySelector('.eclk-patternbox'), cv = root.querySelector('.eclk-pattern');
    const side = Math.min(box.clientWidth, box.clientHeight), ratio = window.devicePixelRatio || 1;
    cv.style.width = cv.style.height = `${side}px`;
    cv.width = cv.height = Math.round(side * ratio);
    const view = EC.pattern(cv, {
      scale: c.el.screen.clientWidth / 320 * ratio, stealth: c.data.prefs.visiblepattern === false, tactile: !!c.data.prefs.tactilefeedback,
      onStart() { clearTimeout(kg.clearTimer); },
      onDone(cells) {
        if (cells.join() === c.data.settings.lockPattern.join()) {   // keyguardDone
          view.show(cells, 'correct'); kg.instructions = null; kg.failed = 0; c.unlock(); return;
        }
        view.show(cells, 'wrong');
        if (cells.length >= 3) { kg.failed++; kg.total++; }
        if (kg.failed >= 5) {
          kg.deadline = Date.now() + 30000; lockout(c, view);
          // LockPatternKeyguardView.reportFailedPatternAttempt → showTimeoutDialog
          c.dialog({title: '', html: `<div class="ecui-message">${esc(T().fmt('lockscreen_too_many_failed_attempts_dialog_message', c.lang, kg.total, 30))}</div>`, buttons: [{label: EC.text('framework').t('ok')}]});
          return;
        }
        kg.instructions = T().t('lockscreen_pattern_wrong'); refreshStatus(c);
        kg.clearTimer = setTimeout(() => view.clear(), 2000);
      }
    });
    if (kg.deadline > Date.now()) lockout(c, view);
  }

  function render(c) {
    if (secure(c)) return renderUnlock(c);
    const t = time(c), silent = !!c.data.settings.ringer, r = right(silent);
    const carrier = c.data.settings.airplane ? T().t('lockscreen_carrier_default') : (c.data.settings.carrier || 'T-Mobile');
    return `<div class="eclk"><div class="eclk-carrier">${esc(carrier)}</div>
      <div class="eclk-time"><span class="eclk-clock">${esc(t.time)}</span>${t.ampm ? `<span class="eclk-ampm">${t.ampm}</span>` : ''}</div>
      <div class="eclk-date">${esc(c.dateFormat(T().t('full_wday_month_day_no_year')))}</div>
      ${statusLines(c)}
      <div class="eclk-locked" aria-live="polite"></div>
      <div class="ecst">${slider('left', 'fw-ic_jog_dial_unlock.png', 'fw-jog_tab_target_green.png', 'green', 'lockscreen_unlock_label')}${slider('right', r.icon, r.target, r.confirm, r.hint)}</div></div>`;
  }

  // SlidingTab -----------------------------------------------------------------------------------------------------------
  const PRESSED = 1, ACTIVE = 2;
  function setState(el, state, side) {
    el.classList.toggle('pressed', state === PRESSED); el.classList.toggle('active', state === ACTIVE);
    const conf = el.dataset.confirm;
    el.querySelector('.ecst-tab-bg').src = `assets/fw-jog_tab_${side}_${state === PRESSED ? 'pressed' : state === ACTIVE ? `confirm_${conf}` : 'normal'}.png`;
  }
  const move = (el, dx, ms = 0) => {
    for (const part of el.querySelectorAll('.ecst-tab, .ecst-bar')) { part.style.transition = ms ? `transform ${ms}ms` : 'none'; part.style.transform = `translateX(${dx}px)`; }
  };
  let grab = null, toastTimer = 0;
  function toast(c, text, icon) {
    const box = c.el.viewport.querySelector('.eclk-locked');
    if (!box) return;
    clearTimeout(toastTimer);
    box.innerHTML = `<img src="assets/${icon}" alt="">${esc(text)}`;
    toastTimer = setTimeout(() => { box.innerHTML = ''; }, 3500);
  }
  function mount(c, root) {
    if (root.querySelector('.eclk-pattern')) { mountUnlock(c, root); return; }
    const bar = root.querySelector('.ecst');
    if (!bar) return;
    const px = c.el.screen.clientWidth / 320 / 1.5;
    bar.addEventListener('pointerdown', event => {
      const tab = event.target.closest('.ecst-tab');
      if (!tab || grab) return;
      const el = tab.parentElement, side = el.dataset.side, other = bar.querySelector(`.ecst-slider:not(.ecst-${side})`);
      const rect = bar.getBoundingClientRect(), tabRect = tab.getBoundingClientRect();
      grab = {c, el, side, other, rect, offset: event.clientX - (tabRect.left + tabRect.width / 2), start: tabRect.left + tabRect.width / 2 - rect.left, id: event.pointerId, triggered: false};
      bar.setPointerCapture?.(event.pointerId);
      navigator.vibrate?.(30);
      setState(el, PRESSED, side);
      el.classList.add('grabbed');
      // Slider.hide(): the other tab slides off to its own edge.
      other.classList.add('hidden');
      event.preventDefault();
    });
    bar.addEventListener('pointermove', event => {
      if (!grab || event.pointerId !== grab.id || grab.triggered) return;
      const {el, side, rect} = grab, x = event.clientX - rect.left - grab.offset;
      // withinView: up to TRACKING_MARGIN (50 px) above or below the widget keeps tracking.
      if (event.clientY < rect.top - 50 * px || event.clientY > rect.bottom + 50 * px) { release(c, true); return; }
      const width = rect.width, threshold = 2 / 3 * width;
      const dx = side === 'left' ? Math.max(0, x - grab.start) : Math.min(0, x - grab.start);
      move(el, dx);
      const reached = side === 'left' ? x > threshold : x < width - threshold;
      if (reached) trigger(c);
    });
    for (const type of ['pointerup', 'pointercancel']) bar.addEventListener(type, event => { if (grab && event.pointerId === grab.id && !grab.triggered) release(c, true); });
  }
  function release(c, animate) {
    const {el, other, side} = grab; grab = null;
    move(el, 0, animate ? 250 : 0);
    setState(el, 0, side);
    el.classList.remove('grabbed');
    other.classList.remove('hidden');
  }
  function trigger(c) {
    const g = grab; g.triggered = true;
    navigator.vibrate?.(40);
    setState(g.el, ACTIVE, g.side);
    // startAnimating: the slider runs off to the far side in ANIM_DURATION; the unlock tab is held there.
    const width = g.rect.width;
    move(g.el, g.side === 'left' ? width : -width, 250);
    setTimeout(() => {
      grab = null;
      if (g.side === 'left') { c.unlock(); return; }
      const silent = !c.data.settings.ringer;
      // toggleSilentMode: RINGER_MODE_SILENT or NORMAL (2.1 has no vibrate-in-silent setting).
      c.data.settings.ringer = silent ? 'silent' : '';
      c.save(); c.render();
      toast(c, T().t(silent ? 'global_action_silent_mode_on_status' : 'global_action_silent_mode_off_status'), silent ? 'fw-ic_lock_ringer_off.png' : 'fw-ic_lock_ringer_on.png');
    }, 250);
  }

  EC.register('lock', {
    app: false,
    render,
    mount,
    // onPause / onResume: the status goes back to its default and the pattern is cleared.
    reset() { grab = null; clearTimeout(kg.clearTimer); if (!kg.deadline) kg.instructions = null; },
    action(name, el, event, c) {
      if (name !== 'eclk-emergency') return false;
      c.overlay('emergency-dialer');   // Phone's EmergencyDialer (not built yet)
      return true;
    },
    back: () => true,
    menu: () => true,   // config_disableMenuKeyInLockScreen
    keepAwake: () => false,
    tick(c) {
      if (c.ui.view !== 'lock' || grab) return;
      const clock = c.el.viewport.querySelector('.eclk-clock');
      const t = time(c);
      if (clock && clock.textContent !== t.time) c.render();
    }
  });
})();
