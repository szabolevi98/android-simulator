/* Power key hold, shutdown and boot of the GRK39F (Nexus S) image (frameworks/base android-2.3.6_r1 policy
   GlobalActions and ShutdownThread, cmds/bootanimation). The Phone options list itself is a GBUI dialog in simulator.js
   (global_actions_item.xml: Silent mode, Airplane mode, Power off); Gingerbread has no safe-mode reboot or bug report. */
(() => {
  'use strict';
  // ViewConfiguration.getGlobalActionKeyTimeout, the long-press timeout of the power key.
  const KEY_TIMEOUT = 500;
  // The shutdown progress before the screen goes off, and when the simulated system finishes booting after the boot
  // animation starts (BootAnimation's exit request).
  const SHUTDOWN_MS = 2400, BOOT_MS = 3500;
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
  window.GlobalActions = {KEY_TIMEOUT, SHUTDOWN_MS, BOOT_MS, boot, playBoot, hold};
})();
