/* Google Camera 2.4 on the Nexus 6 (com.android.camera2 / GoogleCamera, LMY48Y). The preview fills the screen; the
   bottom bar (#191919 at 30 %) holds the 72 dp shutter disc in the mode colour (camera_mode_color #4285F4 with
   ic_capture_camera, video_mode_color #DB4437 with ic_capture_video, a white stop square while recording). The
   options button at the top right unfolds the mode options on #4C000000: switch camera, grid, timer, flash and HDR+.
   A swipe in from the left edge (or a touch on its handle) opens the mode list: Photo Sphere #AB47BC, Panorama
   #FF9E00, Lens Blur #0F9D58, Camera and Video on 56 dp discs (#4C000000) with white labels, settings at the foot.
   Touching the preview focuses (the white ring); swiping to the left opens the last picture. The preview is a local
   illustration; nothing is captured from a real camera. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const icon = name => `assets/gcam-${name}.png`;
  const MODES = [['photosphere', 'Photo Sphere', '#ab47bc', 'ic_photosphere_normal'], ['panorama', 'Panorama', '#ff9e00', 'ic_panorama_normal'], ['refocus', 'Lens Blur', '#0f9d58', 'ic_refocus_normal'], ['photo', 'Camera', '#4285f4', 'ic_camera_normal'], ['video', 'Video', '#db4437', 'ic_video_normal']];
  const FLASH = ['auto', 'on', 'off'], TIMER = [0, 3, 10];
  function settings(media, data) { return {flash: 'auto', hdr: false, grid: false, timer: 0, front: false, ...data.cameraSettings}; }
  function render(data, ui, t, media) {
    const s = settings(media, data), mode = MODES.some(m => m[0] === ui.jbcamModule) ? ui.jbcamModule : 'photo', recording = !!ui.jbcamRecording;
    const [, , color] = MODES.find(m => m[0] === mode);
    const shutterIcon = mode === 'video' ? (recording ? '' : 'ic_capture_video') : 'ic_capture_camera_normal';
    const options = [['front', s.front ? 'ic_switch_camera_front_normal' : 'ic_switch_camera_back_normal', s.front ? 'Front camera' : 'Back camera'], ['grid', s.grid ? 'ic_grid_on_normal' : 'ic_grid_off_normal', s.grid ? 'Grid lines on' : 'Grid lines off'], ['timer', `ic_timer_${s.timer ? s.timer + 's' : 'off'}_normal`, s.timer ? `${s.timer} second countdown timer` : 'Countdown timer is off'], ['flash', `ic_flash_${s.flash}_normal`, `Flash ${s.flash}`], ['hdr', s.hdr ? 'ic_hdr_plus_on_normal' : 'ic_hdr_plus_off_normal', s.hdr ? 'HDR+ on' : 'HDR+ off']];
    return `<div class="app-view camera-app gcam${ui.gcamModes ? ' modes-open' : ''}" data-gcam data-module="${mode}" style="--mode:${color}" data-no-translate>
      <div class="gcam-preview${s.front ? ' front' : ''}" data-gcam-preview>${media.art(media.scene(data))}${s.grid ? '<div class="gcam-grid" aria-hidden="true"></div>' : ''}</div>
      <div class="gcam-focus" data-gcam-focus hidden></div><div class="gcam-flash" data-gcam-flash></div>
      <div class="gcam-countdown" data-gcam-countdown hidden></div>
      <div class="gcam-rec" data-gcam-rec ${recording ? '' : 'hidden'}><i></i><span>00:00</span></div>
      <div class="gcam-options${ui.gcamOptions ? ' open' : ''}">${ui.gcamOptions ? options.map(([key, file, label]) => `<button type="button" data-gcam-option="${key}" aria-label="${e(t(label))}"><img src="${icon(file)}" alt=""></button>`).join('') : ''}<button type="button" class="gcam-options-toggle" data-gcam-options aria-label="${e(t('Options'))}" aria-expanded="${!!ui.gcamOptions}"><i></i><i></i><i></i></button></div>
      <div class="gcam-bar"><span></span><button type="button" class="gcam-shutter${recording ? ' recording' : ''}" data-gcam-shutter aria-label="${e(t(mode === 'video' ? (recording ? 'Stop recording' : 'Start recording') : 'Shutter'))}">${shutterIcon ? `<img src="${icon(shutterIcon)}" alt="">` : '<i></i>'}</button><span></span></div>
      <button type="button" class="gcam-edge" data-gcam-modes aria-label="${e(t('Switch mode'))}"></button>
      <div class="gcam-modes-scrim" data-gcam-modes-close></div>
      <nav class="gcam-modes" aria-label="${e(t('Switch mode'))}">${MODES.map(([id, label, c, file]) => `<button type="button" data-gcam-mode="${id}" ${id === mode ? 'aria-current="true"' : ''}><span class="gcam-mode-icon" style="--c:${c}"><img src="${icon(file)}" alt=""></span><span>${e(t(label))}</span></button>`).join('')}<button type="button" class="gcam-settings" data-gcam-settings aria-label="${e(t('Settings'))}"><img src="${icon('ic_settings_normal')}" alt=""></button></nav>
    </div>`;
  }
  function attach(root, {data, ui, t, media, save, render: rerender, shoot, gallery, toast, reduced}) {
    let destroyed = false, start = null, countdown = 0, recTimer = 0;
    const update = patch => { data.cameraSettings = {...settings(media, data), ...patch}; save(); rerender(); };
    const focusRing = (x, y) => {
      const ring = root.querySelector('[data-gcam-focus]'); if (!ring) return;
      ring.hidden = false; ring.style.left = `${x}px`; ring.style.top = `${y}px`;
      ring.classList.remove('run'); void ring.offsetWidth; ring.classList.add('run');
    };
    const capture = () => {
      const flash = root.querySelector('[data-gcam-flash]');
      if (flash && !reduced) { flash.classList.remove('run'); void flash.offsetWidth; flash.classList.add('run'); }
      shoot();
    };
    const fire = () => {
      const mode = ui.jbcamModule || 'photo';
      if (mode === 'video') {
        if (ui.jbcamRecording) { const seconds = Math.round((Date.now() - ui.jbcamRecording) / 1000); ui.jbcamRecording = null; rerender(); toast(`${t('Video recording is simulated and not saved')} (${seconds} s)`); }
        else { ui.jbcamRecording = Date.now(); rerender(); }
        return;
      }
      if (mode !== 'photo') { toast(t(`${MODES.find(m => m[0] === mode)[1]} capture is not simulated`)); return; }
      const s = settings(media, data);
      if (!s.timer) { capture(); return; }
      if (countdown) return;
      const node = root.querySelector('[data-gcam-countdown]'); let left = s.timer; node.hidden = false; node.textContent = left;
      countdown = setInterval(() => { if (destroyed) return clearInterval(countdown); left--; if (left <= 0) { clearInterval(countdown); countdown = 0; node.hidden = true; capture(); } else node.textContent = left; }, 1000);
    };
    const click = event => {
      const el = event.target;
      if (el.closest('[data-gcam-shutter]')) { fire(); return; }
      if (el.closest('[data-gcam-options]')) { ui.gcamOptions = !ui.gcamOptions; rerender(); return; }
      const option = el.closest('[data-gcam-option]')?.dataset.gcamOption;
      if (option) {
        const s = settings(media, data);
        if (option === 'front') { update({front: !s.front}); toast(t(!s.front ? 'Front camera' : 'Back camera')); }
        if (option === 'grid') update({grid: !s.grid});
        if (option === 'timer') update({timer: TIMER[(TIMER.indexOf(s.timer) + 1) % TIMER.length]});
        if (option === 'flash') update({flash: FLASH[(FLASH.indexOf(s.flash) + 1) % FLASH.length]});
        if (option === 'hdr') update({hdr: !s.hdr});
        return;
      }
      if (el.closest('[data-gcam-modes]')) { ui.gcamModes = true; root.classList.add('modes-open'); return; }
      if (el.closest('[data-gcam-modes-close]')) { ui.gcamModes = false; root.classList.remove('modes-open'); return; }
      const chosen = el.closest('[data-gcam-mode]')?.dataset.gcamMode;
      if (chosen) { ui.gcamModes = false; ui.gcamOptions = false; if (chosen !== ui.jbcamModule) { ui.jbcamModule = chosen; ui.jbcamRecording = null; } rerender(); return; }
      if (el.closest('[data-gcam-settings]')) { toast(t('Camera settings are not part of this simulation.')); return; }
    };
    const down = event => {
      if (event.target.closest('button, .gcam-modes')) return;
      const r = root.getBoundingClientRect(), k = r.width / root.clientWidth || 1;
      start = {x: (event.clientX - r.left) / k, y: (event.clientY - r.top) / k, id: event.pointerId};
    };
    const up = event => {
      if (!start || event.pointerId !== start.id) return;
      const r = root.getBoundingClientRect(), k = r.width / root.clientWidth || 1;
      const x = (event.clientX - r.left) / k, y = (event.clientY - r.top) / k, dx = x - start.x, dy = y - start.y;
      const from = start; start = null;
      if (from.x < 24 && dx > 40) { ui.gcamModes = true; root.classList.add('modes-open'); return; }
      if (dx < -60 && Math.abs(dy) < 60) { gallery(); return; }
      if (Math.hypot(dx, dy) < 10 && event.target.closest('[data-gcam-preview]')) { if (ui.gcamOptions) { ui.gcamOptions = false; rerender(); } else focusRing(x, y); }
    };
    root.addEventListener('click', click);
    root.addEventListener('pointerdown', down);
    root.addEventListener('pointerup', up);
    if (ui.jbcamRecording) {
      const label = root.querySelector('[data-gcam-rec] span');
      const tick = () => { if (!ui.jbcamRecording || destroyed) return; const sec = Math.floor((Date.now() - ui.jbcamRecording) / 1000); label.textContent = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`; };
      tick(); recTimer = setInterval(tick, 500);
    }
    return {root, destroy() { destroyed = true; clearInterval(countdown); clearInterval(recTimer); root.removeEventListener('click', click); root.removeEventListener('pointerdown', down); root.removeEventListener('pointerup', up); }};
  }
  window.LPCamera = {MODES, settings, render, attach};
})();
