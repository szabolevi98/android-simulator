/* Power key menu, shutdown and boot (frameworks/base policy GlobalActions, ShutdownThread and cmds/bootanimation),
   as Android 5.1 shows them: the Material light dialog with Power off (and Take bug report when enabled). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // ViewConfiguration.getGlobalActionKeyTimeout, the long-press timeout of the power key.
  const KEY_TIMEOUT = 500;
  // SilentModeTriStateAction: the indices coincide with AudioManager.RINGER_MODE_{SILENT,VIBRATE,NORMAL}.
  const RINGER = [['silent', 'ga-ic_audio_vol_mute', 'Ringer off'], ['vibrate', 'ga-ic_audio_ring_notif_vibrate', 'Ringer vibrate'], ['normal', 'ga-ic_audio_vol', 'Ringer on']];
  const DISMISS_DELAY = 300; // GlobalActions.DIALOG_DISMISS_DELAY
  const SHUTDOWN_MS = 2400, BOOT_MS = 5200;
  const ringerOf = settings => !settings.silent ? 'normal' : settings.silentMode === 'vibrate' ? 'vibrate' : 'silent';
  function setRinger(settings, mode) {
    settings.silent = mode !== 'normal';
    settings.silentMode = mode === 'vibrate' ? 'vibrate' : mode === 'silent' ? 'mute' : 'off';
  }
  // Lollipop's config_globalActionsList is power, bugreport and users: on a single-user phone without the developer
  // option that leaves Power off alone (the Nexus 6 adds nothing); airplane mode and the ringer moved to Quick Settings
  // and the volume dialog.
  function items(state, version) {
    const list = [{id: 'power', icon: 'lp-fw-ic_lock_power_off', message: 'Power off'}];
    if (state.bugreport) list.push({id: 'bugreport', icon: 'ga-stat_sys_adb', message: 'Take bug report'});
    return list;
  }
  function menu(state, t, version) {
    const ringer = state.ringer || 'normal';
    const rows = items(state, version).map(item => item.id === 'ringer'
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
  /* BootAnimation::android(): android-logo-shine scrolls 4px per 16.667ms behind the android-logo-mask cut-out,
     redrawn at 12fps, centred on black. Both images are drawn at their pixel size. */
  function boot() {
    return '<div class="ga-boot" aria-label="Android"><span class="ga-boot-logo"><span class="ga-boot-shine"></span><img src="assets/boot-android-logo-mask.png" alt=""></span></div>';
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
  window.GlobalActions = {KEY_TIMEOUT, RINGER, DISMISS_DELAY, SHUTDOWN_MS, BOOT_MS, CONFIRM, ringerOf, setRinger, items, menu, confirm, progress, boot, safeMode, hold};
})();
