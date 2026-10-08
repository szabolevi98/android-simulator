/* Power key menu, shutdown and boot of the JWR66Y (Nexus 4) image (frameworks/base android-4.3 policy GlobalActions,
   ShutdownThread and cmds/bootanimation): Power off (a long press offers the safe-mode reboot), Airplane mode, Bug report
   when Developer options turn it on, and the silent mode row. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // ViewConfiguration.getGlobalActionKeyTimeout, the long-press timeout of the power key.
  const KEY_TIMEOUT = 500;
  // SilentModeTriStateAction: the indices coincide with AudioManager.RINGER_MODE_{SILENT,VIBRATE,NORMAL}.
  const RINGER = [['silent', 'ga-ic_audio_vol_mute', 'Ringer off'], ['vibrate', 'ga-ic_audio_ring_notif_vibrate', 'Ringer vibrate'], ['normal', 'ga-ic_audio_vol', 'Ringer on']];
  const DISMISS_DELAY = 300; // GlobalActions.DIALOG_DISMISS_DELAY
  // The shutdown progress before the screen goes off, and when the simulated system finishes booting after the boot
  // animation starts (BootAnimation's exit request).
  const SHUTDOWN_MS = 2400, BOOT_MS = 3500;
  const ringerOf = settings => !settings.silent ? 'normal' : settings.silentMode === 'vibrate' ? 'vibrate' : 'silent';
  function setRinger(settings, mode) {
    settings.silent = mode !== 'normal';
    settings.silentMode = mode === 'vibrate' ? 'vibrate' : mode === 'silent' ? 'mute' : 'off';
  }
  // Items in createDialog() order: power off, airplane mode, bug report (when enabled), silent mode.
  function items(state) {
    const list = [{id: 'power', icon: 'ga-ic_lock_power_off', message: 'Power off'},
      {id: 'airplane', icon: state.airplane ? 'ga-ic_lock_airplane_mode' : 'ga-ic_lock_airplane_mode_off', message: 'Airplane mode', status: state.airplane ? 'Airplane mode is ON' : 'Airplane mode is OFF'}];
    if (state.bugreport) list.push({id: 'bugreport', icon: 'ga-stat_sys_adb', message: 'Bug report'});
    list.push({id: 'ringer'});
    return list;
  }
  function menu(state, t) {
    const ringer = state.ringer || 'normal';
    const rows = items(state).map(item => item.id === 'ringer'
      ? `<div class="ga-silent" role="radiogroup">${RINGER.map(([mode, icon, label], i) => `${i ? '<i aria-hidden="true"></i>' : ''}<button type="button" class="ga-option" data-action="ga-ringer" data-id="${mode}" role="radio" aria-checked="${ringer === mode}" aria-label="${e(t(label))}"><span class="ga-indicator"><img src="assets/${icon}.png" alt=""></span></button>`).join('')}</div>`
      : `<button type="button" class="ga-item" data-action="ga-${item.id}"><span class="ga-icon"><img src="assets/${item.icon}.png" alt=""></span><span class="ga-text"><span class="ga-message">${e(t(item.message))}</span>${item.status ? `<span class="ga-status">${e(t(item.status))}</span>` : ''}</span></button>`);
    return `<div class="ga-scrim" data-action="close-overlay"></div><div class="ga-dialog ga-list" role="dialog" aria-label="${e(t('Phone options'))}">${rows.join('')}</div>`;
  }
  // ShutdownThread.shutdownInner / rebootSafeMode and the GlobalActions bug report dialog.
  const CONFIRM = {
    shutdown: {title: 'Power off', message: 'Your phone will shut down.', ok: 'OK'},
    safemode: {title: 'Reboot to safe mode', message: 'Do you want to reboot into safe mode? This will disable all third party applications you have installed. They will be restored when you reboot again.', ok: 'OK'},
    bugreport: {title: 'Take bug report', message: 'This will collect information about your current device state, to send as an e-mail message. It will take a little time from starting the bug report until it is ready to be sent; please be patient.', ok: 'Report'}
  };
  function confirm(kind, t) {
    const spec = CONFIRM[kind] || CONFIRM.shutdown;
    return `<div class="ga-scrim" data-action="close-overlay"></div><div class="ga-dialog ga-alert" role="alertdialog" aria-label="${e(t(spec.title))}"><h3 class="ga-title">${e(t(spec.title))}</h3><p class="ga-body">${e(t(spec.message))}</p><div class="ga-buttons"><button type="button" data-action="close-overlay">${e(t('Cancel'))}</button><button type="button" data-action="ga-confirm" data-id="${kind}">${e(t(spec.ok))}</button></div></div>`;
  }
  // progress_dialog_holo: a 48dp spinner and the message, under the "Power off" title. It is not cancelable.
  function progress(t) {
    return `<div class="ga-scrim"></div><div class="ga-dialog ga-alert" role="alertdialog" aria-label="${e(t('Power off'))}"><h3 class="ga-title">${e(t('Power off'))}</h3><div class="ga-progress"><span class="ga-spinner" aria-hidden="true"><img src="assets/ga-spinner_48_outer_holo.png" alt=""><img src="assets/ga-spinner_48_inner_holo.png" alt=""></span><span>${e(t('Shutting down…'))}</span></div></div>`;
  }
  /* BootAnimation::movie() over this image's bootanimation.zip (boot-animation.js): each part's frames at desc.txt's
     fps, centred on black, repeated `count` times (0: until the system has booted), then `pause` frames of stillness.
     Once boot completes a "p" part stops at once while a "c" part (4.3+) finishes its loop, and the parts after a
     looping one still play; the animation ends after its last part. The display stays black while the sheets load.
     The simulated system completes its boot at the end of a loop of the looping part, so that loop always runs at
     least once and a "p" loop is never cut off half-way. `exitAfter` is a delay in ms or a promise of the boot. */
  function boot() {
    return '<div class="ga-boot" aria-label="Android"><i class="ga-boot-frame"></i></div>';
  }
  function playBoot(root, done, exitAfter = BOOT_MS) {
    const data = window.BootAnimationData, view = root?.querySelector('.ga-boot-frame');
    if (!data || !view) { const timer = setTimeout(done, exitAfter); return () => clearTimeout(timer); }
    let exit = false, booted = false, stopped = false, exitTimer = 0;
    // Each frame waits for an absolute deadline, as movie()'s clock_nanosleep(TIMER_ABSTIME) does, so delays never add up.
    const frameMs = 1000 / data.fps;
    let next = 0;
    const wait = ms => { next += ms; return new Promise(resolve => setTimeout(resolve, Math.max(0, next - performance.now()))); };
    const [x, y, w, h] = data.box;
    Object.assign(view.style, {left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%`});
    const show = (part, j) => {
      const col = j % part.cols, row = Math.floor(j / part.cols);
      view.style.backgroundImage = `url('${part.sheet}')`;
      view.style.backgroundSize = `${part.cols * 100}% ${part.rows * 100}%`;
      view.style.backgroundPosition = `${part.cols > 1 ? col / (part.cols - 1) * 100 : 0}% ${part.rows > 1 ? row / (part.rows - 1) * 100 : 0}%`;
    };
    (async () => {
      await Promise.all(data.parts.map(part => { const img = new Image(); img.src = part.sheet; return img.decode().catch(() => {}); }));
      if (stopped) return;
      if (typeof exitAfter === 'number') exitTimer = setTimeout(() => { booted = true; }, exitAfter);
      else Promise.resolve(exitAfter).then(() => { booted = true; });
      next = performance.now();
      for (const part of data.parts) {
        for (let r = 0; !part.count || r < part.count; r++) {
          if (exit && !part.complete) break;
          for (let j = 0; j < part.frames && (!exit || part.complete); j++) {
            show(part, j); await wait(frameMs);
            if (stopped) return;
          }
          if (part.pause) await wait(part.pause * frameMs);
          if (stopped) return;
          if (!part.count && booted) { exit = true; break; }
        }
      }
      done();
    })();
    return () => { stopped = true; clearTimeout(exitTimer); };
  }
  // safe_mode.xml: textAppearanceLarge, 3dp padding, #60000000 behind #80ffffff text, at the bottom left.
  const safeMode = t => `<div class="ga-safe-mode">${e(t('Safe mode'))}</div>`;
  // Press and hold: fires once the key timeout passes and swallows the click that follows the release.
  function hold(element, onLong, timeout = KEY_TIMEOUT) {
    if (!element) return;
    let timer = 0;
    const cancel = () => { clearTimeout(timer); timer = 0; };
    element.addEventListener('pointerdown', event => {
      if (event.button) return;
      cancel();
      timer = setTimeout(() => {
        timer = 0;
        // The release may land on the new dialog and produce no click at all, so the next press disarms it.
        const swallow = click => { click.stopPropagation(); click.preventDefault(); disarm(); };
        const disarm = () => { window.removeEventListener('click', swallow, true); window.removeEventListener('pointerdown', disarm, true); };
        window.addEventListener('click', swallow, true);
        window.addEventListener('pointerdown', disarm, true);
        onLong(event);
      }, timeout);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => element.addEventListener(type, cancel));
    element.addEventListener('contextmenu', event => event.preventDefault());
  }
  window.GlobalActions = {KEY_TIMEOUT, RINGER, DISMISS_DELAY, SHUTDOWN_MS, BOOT_MS, CONFIRM, ringerOf, setRinger, items, menu, confirm, progress, boot, playBoot, safeMode, hold};
})();
