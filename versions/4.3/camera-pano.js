/* The Android 4.3 camera's panorama (PanoramaModule of GalleryGoogle 1.1.40012, Nexus 4 JWR66Y), written by docs/camera-pano.py.
   preview_frame_pano.xml (portrait): PanoViewHorizontalBar (#000) above and below the preview area at weights 1 : 2 : 1,
   "Capturing panorama" in the upper bar while capturing; PanoProgressBar over ic_pan_progression (its lens-shaped
   window, 125.5 x 38.5 dp) above the shutter with the ic_pan_left / right_indicator arrows: pano_progress_empty #2E2E2E,
   pano_progress_done #33525E and the 10 dp pano_progress_indication #0099CC, filling to the right up to
   DEFAULT_SWEEP_ANGLE (160 degrees); the shutter (or the full sweep) stops. pano_review.xml: "Rendering panorama" in
   the upper bar, the result fitted in the review area (weight 1.5), the saving progress bar above the shutter and the Cancel button (ic_menu_cancel_holo_light) in the shutter's place; then the PANO_yyyyMMdd_HHmmss picture joins the Camera album.
   The sweep is a demonstration: the preview pans across a panorama of the scene at a steady pace. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const SWEEP = 160, DEGREES_PER_SECOND = 28, RENDER = 1200, SAVE = 1600;
  const icon = name => `assets/jbcam-${name}.png`;
  const bar = (kind, extra = '') => `<span class="pnm-progress ${kind}" data-pnm-${kind}><span class="pnm-done"></span><span class="pnm-indicator"></span><img src="${icon('ic_pan_progression')}" alt="">${extra}</span>`;
  function render(data, ui, t, media) {
    const p = ui.jbPano || {state: 'idle'}, pano = {...media.scene(data), pano: true};
    if (p.state === 'review') return `<div class="pnm pnm-review" data-pnm data-state="review">
      <div class="pnm-bar"><span>${e(t('Rendering panorama'))}</span></div>
      <div class="pnm-reviewarea"><img src="${media.image(pano)}" alt=""></div>
      <div class="pnm-bar"></div>
      <div class="pnm-saving">${bar('saving')}</div>
      <button type="button" class="pnm-cancel" data-pnm-cancel aria-label="${e(t('Cancel'))}"><img src="${icon('ic_menu_cancel_holo_light')}" alt=""></button>
    </div>`;
    const capturing = p.state === 'capture';
    return `<div class="pnm" data-pnm data-state="${p.state}">
      <div class="pnm-bar"><span ${capturing ? '' : 'hidden'}>${e(t('Capturing panorama'))}</span></div>
      <div class="pnm-area"><img class="pnm-strip" data-pnm-strip src="${media.image(pano)}" alt=""></div>
      <div class="pnm-bar"></div>
      <div class="pnm-pan" ${capturing ? '' : 'hidden'}><img class="pnm-arrow" src="${icon('ic_pan_left_indicator')}" alt="">${bar('pan')}<img class="pnm-arrow" src="${icon('ic_pan_right_indicator')}" alt=""></div>
    </div>`;
  }
  // PanoramaModule: the shutter starts and stops the sweep; the rendering and saving run on from the times kept in
  // ui.jbPano, so a redraw of the camera carries on where it was.
  function attach(root, {ui, rerender, shoot}) {
    let destroyed = false, frame = 0, timer = 0, last = 0;
    const p = ui.jbPano ||= {state: 'idle', angle: 0};
    const node = sel => root.querySelector(sel);
    const fill = (el, k) => { if (el) { el.querySelector('.pnm-done').style.width = `${k * 100}%`; el.querySelector('.pnm-indicator').style.left = `${k * 100}%`; } };
    const paint = () => {
      const k = Math.min(1, p.angle / SWEEP), strip = node('[data-pnm-strip]');
      fill(node('[data-pnm-pan]'), k);
      if (strip) strip.style.transform = `translateX(${-k * Math.max(0, strip.offsetWidth - strip.parentNode.offsetWidth)}px)`;
    };
    const finish = () => { p.state = 'review'; p.reviewAt = performance.now(); rerender(); };
    const tick = now => {
      if (destroyed || p.state !== 'capture') return;
      p.angle = Math.min(SWEEP, p.angle + (now - last) / 1000 * DEGREES_PER_SECOND); last = now; paint();
      if (p.angle >= SWEEP) { finish(); return; }
      frame = requestAnimationFrame(tick);
    };
    const saving = now => {
      if (destroyed || p.state !== 'review') return;
      const k = Math.max(0, Math.min(1, (now - p.reviewAt - RENDER) / SAVE));
      fill(node('[data-pnm-saving]'), k);
      if (k < 1) { frame = requestAnimationFrame(saving); return; }
      ui.jbPano = {state: 'idle', angle: 0}; shoot({pano: true}); rerender();
    };
    const toggle = () => {
      if (p.state === 'idle') { p.state = 'capture'; p.angle = 0; rerender(); return; }
      if (p.state === 'capture') { cancelAnimationFrame(frame); finish(); }
    };
    root.addEventListener('click', event => { if (event.target.closest('[data-pnm-cancel]')) { event.stopPropagation(); destroyed = true; cancelAnimationFrame(frame); ui.jbPano = {state: 'idle', angle: 0}; rerender(); } });
    paint();
    if (p.state === 'capture') { last = performance.now(); frame = requestAnimationFrame(tick); }
    if (p.state === 'review') frame = requestAnimationFrame(saving);
    return {toggle, destroy() { destroyed = true; cancelAnimationFrame(frame); clearTimeout(timer); }};
  }
  window.JBPano = {render, attach, SWEEP};
})();
