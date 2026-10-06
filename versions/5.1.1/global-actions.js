/* Power key menu, shutdown and boot of the LMY48Y (Nexus 6) image (frameworks/base android-5.1.1 policy GlobalActions,
   ShutdownThread and cmds/bootanimation): the Material light dialog with Power off (a long press offers the safe-mode
   reboot) and Take bug report (ic_lock_bugreport) when Developer options turn it on. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // ViewConfiguration.getGlobalActionKeyTimeout, the long-press timeout of the power key.
  const KEY_TIMEOUT = 500;
  const SHUTDOWN_MS = 2400, BOOT_MS = 5200;
  // Lollipop's config_globalActionsList is power, bugreport and users: on a single-user phone without the developer
  // option that leaves Power off alone (the Nexus 6 adds nothing); airplane mode and the ringer moved to Quick Settings
  // and the volume dialog.
  function items(state) {
    const list = [{id: 'power', icon: 'lp-fw-ic_lock_power_off.png', message: 'Power off'}];
    if (state.bugreport) list.push({id: 'bugreport', icon: 'lp-fw-ic_lock_bugreport.svg', message: 'Take bug report'});
    return list;
  }
  function menu(state, t) {
    const rows = items(state).map(item => `<button type="button" class="ga-item" data-action="ga-${item.id}"><span class="ga-icon"><img src="assets/${item.icon}" alt=""></span><span class="ga-text"><span class="ga-message">${e(t(item.message))}</span></span></button>`);
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
  // progress_dialog_material: the Material spinner and the message, under the "Power off" title. It is not cancelable.
  function progress(t) {
    return `<div class="ga-scrim"></div><div class="ga-dialog ga-alert" role="alertdialog" aria-label="${e(t('Power off'))}"><h3 class="ga-title">${e(t('Power off'))}</h3><div class="ga-progress"><span class="ga-spinner" aria-hidden="true"></span><span>${e(t('Shutting down…'))}</span></div></div>`;
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
  window.GlobalActions = {KEY_TIMEOUT, SHUTDOWN_MS, BOOT_MS, CONFIRM, items, menu, confirm, progress, boot, safeMode, hold};
})();
