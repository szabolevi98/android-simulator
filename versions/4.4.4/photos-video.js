/* Videos in Photos (Google+ 4.2.3 of the Nexus 5 KTU84P image), written by docs/gplus-video.py. ImageResourceView draws
   ov_play_video_32 (32 dp) in the middle of a video's tile, PhotoView ov_play_video_48 in the one-up view; touching
   that starts VideoViewActivity (VideoViewTheme on Theme.Holo.Light): video_view_fragment.xml's VideoView with the framework MediaController
   (media_controller.xml: #CC000000, MediaButton.Rew / Play / Ffwd at 71 x 52 dp below 4 dp, the 14 sp bold #BEBEBE
   times "%02d:%02d" beside the 32 dp seek bar, Holo Light: #0000004D track, #33B5E5 progress, scrubber_control_normal_holo). VideoView starts playing and shows the controller for
   sDefaultTimeout (3 s); a touch toggles it, a button or the seek bar keeps it 3 s more; Rew goes back 5 s, Ffwd
   forward 15 s; at the end it hides. The picture is the clip's frame, slowly moving while it plays. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const TIMEOUT = 3000, REW = 5000, FFWD = 15000;
  // MediaController.stringForTime.
  const time = ms => { const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, r = s % 60; return h ? `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}` : `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`; };
  const tile = photo => photo?.video ? '<img class="gpv-tile" src="assets/gp-ov_play_video_32.png" alt="">' : '';
  const viewerIcon = (photo, label) => photo?.video ? `<button class="gpv-play" data-action="photos-play" aria-label="${e(label)}"><img src="assets/gp-ov_play_video_48.png" alt=""></button>` : '';
  function render(photo, {ui, t, media}) {
    const v = ui.photosVideo || {}, pos = Math.min(v.pos || 0, photo.duration), playing = !v.paused && !v.ended;
    const button = (key, label, src) => `<button type="button" data-gpv="${key}" aria-label="${e(t(label))}"><img src="assets/gpv-ic_media_${src}.png" alt=""></button>`;
    return `<div class="app-view gpv${v.shown === false ? '' : ' shown'}" data-gpv-root>
      <div class="gpv-frame" data-gpv-frame>${media.art(photo)}</div>
      <div class="gpv-mc" data-gpv-mc><div class="gpv-buttons">${button('rew', 'Rewind', 'rew')}${button('pause', playing ? 'Pause' : 'Play', playing ? 'pause' : 'play')}${button('ffwd', 'Fast forward', 'ff')}</div>
        <div class="gpv-progress"><span data-gpv-now>${time(pos)}</span><span class="gpv-seek" data-gpv-seek role="slider" aria-valuemin="0" aria-valuemax="${photo.duration}" aria-valuenow="${Math.round(pos)}"><i data-gpv-played style="width:${pos / photo.duration * 100}%"></i><b data-gpv-thumb style="left:${pos / photo.duration * 100}%"></b></span><span>${time(photo.duration)}</span></div></div>
    </div>`;
  }
  function attach(root, {photo, ui, rerender, reduced}) {
    const v = ui.photosVideo ||= {id: photo.id, pos: 0, paused: false, ended: false, shown: true};
    let destroyed = false, last = performance.now(), frame = 0, hideTimer = 0;
    const node = sel => root.querySelector(sel), duration = photo.duration;
    const paint = () => {
      const k = Math.min(1, v.pos / duration);
      node('[data-gpv-played]').style.width = `${k * 100}%`; node('[data-gpv-thumb]').style.left = `${k * 100}%`;
      node('[data-gpv-now]').textContent = time(v.pos); node('[data-gpv-seek]').setAttribute('aria-valuenow', Math.round(v.pos));
      if (!reduced) node('[data-gpv-frame]').style.transform = `scale(${1 + .08 * k}) translateX(${-2 * k}%)`;
    };
    const show = (on, timeout = TIMEOUT) => { v.shown = on; root.classList.toggle('shown', on); clearTimeout(hideTimer); if (on && timeout) hideTimer = setTimeout(() => !destroyed && show(false), timeout); };
    const tick = now => {
      if (destroyed) return;
      if (!v.paused && !v.ended) {
        v.pos = Math.min(duration, v.pos + now - last);
        if (v.pos >= duration) { v.ended = true; v.shown = false; clearTimeout(hideTimer); rerender(); return; }
        paint();
      }
      last = now; frame = requestAnimationFrame(tick);
    };
    const seek = clientX => { const r = node('[data-gpv-seek]').getBoundingClientRect(); v.pos = Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * duration; v.ended = false; paint(); };
    root.addEventListener('pointerdown', event => {
      const bar = event.target.closest('[data-gpv-seek]');
      if (!bar || !v.shown) return;
      event.preventDefault(); show(true, 0); seek(event.clientX);
      const move = ev => seek(ev.clientX), up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); show(true); rerender(); };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    });
    root.addEventListener('click', event => {
      const key = event.target.closest('[data-gpv]')?.dataset.gpv;
      if (event.target.closest('[data-gpv-seek]')) return;
      if (!key) { show(!v.shown); return; }
      if (key === 'pause') { if (v.ended) { v.ended = false; v.pos = 0; v.paused = false; } else v.paused = !v.paused; }
      if (key === 'rew') { v.pos = Math.max(0, v.pos - REW); v.ended = false; }
      if (key === 'ffwd') v.pos = Math.min(duration, v.pos + FFWD);
      v.shown = true; rerender();
    });
    paint(); if (v.shown) show(true); frame = requestAnimationFrame(now => { last = now; tick(now); });
    return {destroy() { destroyed = true; cancelAnimationFrame(frame); clearTimeout(hideTimer); }};
  }
  window.GPVideo = {time, tile, viewerIcon, render, attach};
})();
