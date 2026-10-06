/* Power key hold, shutdown and boot of the GRK39F (Nexus S) image (frameworks/base android-2.3.6_r1 policy
   GlobalActions and ShutdownThread, cmds/bootanimation). The Phone options list itself is a GBUI dialog in simulator.js
   (global_actions_item.xml: Silent mode, Airplane mode, Power off); Gingerbread has no safe-mode reboot or bug report. */
(() => {
  'use strict';
  // ViewConfiguration.getGlobalActionKeyTimeout, the long-press timeout of the power key.
  const KEY_TIMEOUT = 500;
  const SHUTDOWN_MS = 2400, BOOT_MS = 5200;
  /* BootAnimation::android(): android-logo-shine scrolls 4px per 16.667ms behind the android-logo-mask cut-out,
     redrawn at 12fps, centred on black. Both images are drawn at their pixel size. */
  function boot() {
    return '<div class="ga-boot" aria-label="Android"><span class="ga-boot-logo"><span class="ga-boot-shine"></span><img src="assets/boot-android-logo-mask.png" alt=""></span></div>';
  }
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
  window.GlobalActions = {KEY_TIMEOUT, SHUTDOWN_MS, BOOT_MS, boot, hold};
})();
