/* Android 6.0.1 Toast (framework-res transient_notification.xml): the message (TextAppearance.Toast: 16 sp
   sans-serif-condensed, white with a 2.75 px #bb000000 shadow) on toast_frame, at config_toastDefaultGravity
   bottom | centre_horizontal, toast_y_offset 64 dp above the navigation bar; LENGTH_SHORT 2 s, LENGTH_LONG 3.5 s
   (NotificationManagerService); one at a time, a new one replaces the shown one. */
(() => {
  'use strict';
  let layer = null, timer = 0;
  function show(c, text, long = false) {
    if (!layer) { layer = document.createElement('div'); layer.className = 'mmtoast-layer'; c.el.screen.append(layer); }
    clearTimeout(timer);
    layer.innerHTML = `<div class="mmtoast"><span>${c.safe(text)}</span></div>`;
    timer = setTimeout(() => { const el = layer.querySelector('.mmtoast'); el?.classList.add('out'); setTimeout(() => { if (el?.classList.contains('out')) layer.innerHTML = ''; }, 250); }, long ? 3500 : 2000);
  }
  MM.register('toast', {app: false, render: () => '', show(c, text, long) { show(c, text, long); }});
})();
