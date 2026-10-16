/* Android 6.0.1 lock screen (SystemUI.apk's keyguard, MTC20K): the insecure swipe lock the image starts with
   (def_lockscreen_disabled false, no credential).
   - The wallpaper (framework default_wallpaper) behind ScrimController's keyguard scrim: 0.45 black with the panel open.
     The status bar and the navigation bar's keys are hidden (the keyguard disables home, recents and back).
   - keyguard_status_bar.xml (KeyguardStatusBarView, 40 dp): CarrierText 16 dp from the start (14 sp white; "Airplane mode"
     in airplane mode), the system icons in a 60 dp high container (so centred 30 dp down) with the battery level only
     while charging, and the user's avatar (22 dp in a 34 dp switch 3 dp from the end).
   - keyguard_status_view.xml (KeyguardStatusView): the clock (widget_big_thin: sans-serif-light, widget_big_font_size
     96 dp at h560dp, the best "hm" / "Hm" pattern without AM / PM and ':' replaced by U+EE01, Roboto's clock colon),
     10 dp over the date (abbrev_wday_month_day_no_year "EEEEMMMMd", 14 sp, caps, letter spacing 0.15), then the owner
     info; KeyguardClockPositionAlgorithm centres it at keyguard_clock_y_fraction_max 0.325 of the panel without
     notifications.
   - keyguard_bottom_area.xml: the phone (left) and camera (right) KeyguardAffordanceViews and the LockIcon (open: no
     bouncer to pass) 56 dp at the bottom, the italic KeyguardIndicationTextView 65 dp from the bottom.
   - Swiping up more than keyguard_min_swipe_amount (110 dp) unlocks; a tap plays the unlock hint (the panel up
     hint_move_distance 75 dp and back) with "Swipe up to unlock"; a tap on an icon plays its hint ("Swipe from icon for
     phone / camera") and swiping from it opens the app. The hint text goes 1.2 s after the hint.
   - The keyguard window's user activity timeout: 10 s (StatusBarWindowManager, AWAKE_INTERVAL_DEFAULT_MS). */
(() => {
  'use strict';
  const A = name => `assets/${name}`;
  const T = () => MM.text('lock');
  const PANEL_H = 683.43;   // 1920 - 126 px of navigation bar, in dp
  let hintTimer = 0;

  const is24 = c => c.data.settings.time24 ?? !new Intl.DateTimeFormat(c.locale(), {hour: 'numeric'}).resolvedOptions().hour12;
  // KeyguardStatusView.Patterns: the time without AM / PM and with the clock colon.
  function clockText(c, now = new Date()) {
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${is24(c) ? now.getHours() : now.getHours() % 12 || 12}${mm}`;
  }
  const dateText = (c, now = new Date()) => new Intl.DateTimeFormat(c.locale(), {weekday: 'long', month: 'long', day: 'numeric'}).format(now);

  function render(c) {
    const t = T(), s = c.data.settings, st = c.ui.lockState || (c.ui.lockState = {hint: ''});
    const carrier = s.airplane ? t.t('airplane_mode') : MM.text('shade').t('carrier');
    const b = MM.battery();
    const indication = st.hint || (b.plugged ? t.t(b.level >= 100 ? 'keyguard_charged' : 'keyguard_plugged_in') : '');
    return `<div class="mmlk">
      <div class="mmlk-wall"></div><div class="mmlk-scrim"></div>
      <div class="mmlk-panel">
        <div class="mmlk-bar" data-action="mmlk-pull"><span class="mmlk-carrier">${c.safe(carrier)}</span>
          <span class="mmlk-icons"><span class="mmlk-cluster">${MM.signalCluster ? MM.signalCluster(c) : ''}</span><span class="mmlk-batt"></span>${b.plugged ? `<span class="mmlk-level">${c.safe(new Intl.NumberFormat(c.locale(), {style: 'percent'}).format(b.level / 100))}</span>` : ''}</span>
          <span class="mmlk-user"><img src="${A('fw-ic_account_circle-user0.svg')}" alt=""></span></div>
        <div class="mmlk-status" style="top:calc(${(PANEL_H * 0.325).toFixed(2)} * var(--dp))">
          <div class="mmlk-clock">${clockText(c)}</div><div class="mmlk-date">${c.safe(dateText(c))}</div>
          ${s.showOwnerInfo && s.ownerInfo ? `<div class="mmlk-owner">${c.safe(s.ownerInfo)}</div>` : ''}</div>
        <div class="mmlk-indication">${c.safe(indication)}</div>
        <button type="button" class="mmlk-aff mmlk-phone" data-aff="phone" aria-label="${c.safe(t.t('accessibility_phone_button'))}"><i></i><img src="${A('sui-ic_phone_24dp.png')}" alt=""></button>
        <button type="button" class="mmlk-lock" data-action="mmlk-hint" aria-label="${c.safe(t.t('accessibility_unlock_button'))}"><img src="${A('sui-ic_lock_open_24dp.svg')}" alt=""></button>
        <button type="button" class="mmlk-aff mmlk-camera" data-aff="camera" aria-label="${c.safe(t.t('accessibility_camera_button'))}"><i></i><img src="${A('sui-ic_camera_alt_24dp.png')}" alt=""></button>
      </div></div>`;
  }

  function setHint(c, root, text) {
    const st = c.ui.lockState; st.hint = text;
    const el = root.querySelector('.mmlk-indication'); if (el) el.textContent = text;
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => { st.hint = ''; const e = c.el.viewport.querySelector('.mmlk-indication'); if (e) e.textContent = ''; }, 1800);
  }

  function unlock(c, root, then) {
    const panel = root.querySelector('.mmlk-panel'), lk = root.querySelector('.mmlk');
    lk?.classList.add('leaving');
    if (panel) panel.style.transform = `translateY(calc(-${PANEL_H} * var(--dp)))`;
    setTimeout(() => { c.unlock(); if (then) c.open(then); }, 260);
  }

  function mount(c, root) {
    const slot = root.querySelector('.mmlk-batt'); if (slot && MM.batteryMeter) slot.innerHTML = MM.batteryMeter();
    const lk = root.querySelector('.mmlk'), panel = root.querySelector('.mmlk-panel');
    if (!lk || !panel) return;
    const dpPx = () => c.el.screen.clientWidth / 411.4286;
    let drag = null;
    lk.addEventListener('pointerdown', e => {
      if (e.button) return;
      const aff = e.target.closest('.mmlk-aff');
      drag = {x: e.clientX, y: e.clientY, aff: aff?.dataset.aff || '', el: aff, moved: false, top: e.target.closest('.mmlk-bar')};
      try { lk.setPointerCapture(e.pointerId); } catch {}
    });
    lk.addEventListener('pointermove', e => {
      if (!drag) return;
      const dx = (e.clientX - drag.x) / dpPx(), dy = (e.clientY - drag.y) / dpPx();
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) drag.moved = true;
      if (drag.aff) {
        const along = drag.aff === 'phone' ? Math.max(0, dx) : Math.min(0, dx);
        drag.el.style.transform = `translateX(calc(${along.toFixed(1)} * var(--dp)))`;
        drag.el.style.setProperty('--grow', Math.min(1, Math.abs(along) / 110).toFixed(3));
        drag.el.classList.add('dragging');
      } else if (!drag.top && dy < 0) {
        panel.style.transition = 'none';
        panel.style.transform = `translateY(calc(${dy.toFixed(1)} * var(--dp)))`;
        panel.style.opacity = String(Math.max(0, 1 + dy / 300));
      }
    });
    const end = e => {
      if (!drag) return;
      const d = drag; drag = null;
      const dx = (e.clientX - d.x) / dpPx(), dy = (e.clientY - d.y) / dpPx();
      if (d.aff) {
        d.el.classList.remove('dragging'); d.el.style.transform = ''; d.el.style.removeProperty('--grow');
        const along = d.aff === 'phone' ? dx : -dx;
        if (along >= 110) { unlock(c, root, d.aff); return; }
        if (!d.moved) affordanceHint(c, root, d.el, d.aff);
        return;
      }
      if (d.top && dy > 40) { MM.module('shade')?.open(c); return; }
      panel.style.transition = ''; panel.style.opacity = '';
      if (dy <= -110) { unlock(c, root); return; }
      panel.style.transform = '';
      if (!d.moved) unlockHint(c, root);
    };
    lk.addEventListener('pointerup', end);
    lk.addEventListener('pointercancel', e => { if (drag) { drag = null; panel.style.transform = ''; panel.style.opacity = ''; } });
  }

  // PanelView.startUnlockHintAnimation: up by hint_move_distance and back down with a bounce.
  function unlockHint(c, root) {
    const panel = root.querySelector('.mmlk-panel');
    setHint(c, root, T().t('keyguard_unlock'));
    panel.classList.remove('hinting'); void panel.offsetWidth; panel.classList.add('hinting');
  }
  // KeyguardAffordanceHelper.startHintAnimation: the icon moves sideways and back.
  function affordanceHint(c, root, el, which) {
    setHint(c, root, T().t(which === 'phone' ? 'phone_hint' : 'camera_hint'));
    el.classList.remove('hinting'); void el.offsetWidth; el.classList.add('hinting');
  }

  let lastMinute = -1;
  MM.register('lock', {
    app: false,
    noStatus: () => true, noNav: () => true,
    timeout: () => 10000,
    reset(c) { c.ui.lockState = {hint: ''}; },
    render, mount,
    back: () => true,
    action(name, el, event, c) {
      if (name === 'mmlk-hint') return true;   // handled by the gesture code
      if (name === 'mmlk-pull') return true;
      return false;
    },
    tick(c, now) {
      if (c.ui.view !== 'lock' || now.getMinutes() === lastMinute) return;
      lastMinute = now.getMinutes();
      const clock = c.el.viewport.querySelector('.mmlk-clock'), date = c.el.viewport.querySelector('.mmlk-date');
      if (clock) clock.textContent = clockText(c, now);
      if (date) date.textContent = dateText(c, now);
    }
  });
})();
