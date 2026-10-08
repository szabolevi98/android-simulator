/* Videos in the KitKat Gallery (GalleryGoogle 1.1.40304 of the Nexus 5 KTU84P image), written by docs/gallery2-video.py.
   AbstractSlotRenderer.drawVideoOverlay: ic_video_thumb scaled to the slot height on the left, ic_gallery_play at a
   sixth of the slot in the middle. PhotoView draws ic_control_play (hdpi only, so at 96.7 dp) over a video; a tap in
   the middle sixth (|x - w/2| * 12 <= w, the same for y) plays it in MovieActivity: movie_view.xml's black root, the
   Holo.ActionBar with the title and Share (menu/movie.xml), CommonControllerOverlay's play / pause / replay button on
   bg_vidcontrol in the middle and TimeBar at the foot (#C1000000 darker_transparent strip, the #808080 bar with the
   white played part, scrubber_knob, 14 dp #CECECE times "%02d:%02d", 10 dp scrubber and 30 dp vertical paddings).
   MovieControllerOverlay hides it 2.5 s after playback starts with player_out (500 ms alpha) and MoviePlayer hides
   the system bars with it; a touch shows them again. At the end the replay icon stays. The picture is the clip's
   frame from the camera, slowly moving while it plays. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const HIDE = 2500, FADE = 500;
  // TimeBar.stringForTime and DetailsAdapter's details_ms.
  const time = ms => { const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, r = s % 60; return h ? `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}` : `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`; };
  const slot = photo => photo?.video ? '<span class="g2v-strip" aria-hidden="true"></span><img class="g2v-slot-play" src="assets/gallery-ic_gallery_play.png" alt="">' : '';
  const photoIcon = photo => photo?.video ? '<img class="g2v-photo-play" src="assets/gallery-ic_control_play.png" alt="">' : '';
  // PhotoPage.onSingleTapUp: only the middle of the view starts the video.
  const centerTap = (rect, x, y) => Math.abs(x - rect.left - rect.width / 2) * 12 <= rect.width && Math.abs(y - rect.top - rect.height / 2) * 12 <= rect.height;
  function render(photo, {ui, t, media, bar}) {
    const m = ui.galleryMovie || {}, pos = Math.min(m.pos || 0, photo.duration), state = m.ended ? 'ended' : m.paused ? 'paused' : 'playing';
    const icon = {playing: ['ic_vidcontrol_pause', 'Pause video'], paused: ['ic_vidcontrol_play', 'Play video'], ended: ['ic_vidcontrol_reload', 'Reload video']}[state];
    return `<div class="app-view gallery-app jbgal jbgal-photo g2v${m.hidden ? "" : " bars"}" data-jbgal data-page="movie" data-g2v data-state="${state}">
      <div class="g2v-frame" data-g2v-frame>${media.art(photo)}</div>
      ${bar}
      <div class="g2v-overlay" data-g2v-overlay>
        <div class="g2v-timebar" data-g2v-bar role="slider" aria-label="${e(t('Video player time bar'))}" aria-valuemin="0" aria-valuemax="${photo.duration}" aria-valuenow="${pos}"><span class="g2v-back"></span><span class="g2v-time g2v-now" data-g2v-now>${time(pos)}</span><span class="g2v-track" data-g2v-track><i data-g2v-played style="width:${pos / photo.duration * 100}%"></i><b data-g2v-knob style="left:${pos / photo.duration * 100}%"></b></span><span class="g2v-time g2v-total">${time(photo.duration)}</span></div>
        <button type="button" class="g2v-button" data-g2v-toggle aria-label="${e(t(icon[1]))}"><img src="assets/gallery-${icon[0]}.png" alt=""></button>
      </div>
    </div>`;
  }
  // MoviePlayer: plays from the start, pauses, replays, seeks on the time bar; controls hide while playing.
  function attach(root, {photo, ui, rerender, reduced}) {
    const m = ui.galleryMovie ||= {id: photo.id, pos: 0, paused: false, ended: false, hidden: false};
    let destroyed = false, last = performance.now(), hideTimer = 0, frame = 0;
    const node = sel => root.querySelector(sel), duration = photo.duration;
    const paint = () => {
      const k = Math.min(1, m.pos / duration);
      node('[data-g2v-played]').style.width = `${k * 100}%`; node('[data-g2v-knob]').style.left = `${k * 100}%`;
      node('[data-g2v-now]').textContent = time(m.pos); node('[data-g2v-bar]').setAttribute('aria-valuenow', Math.round(m.pos));
      if (!reduced) node('[data-g2v-frame]').style.transform = `scale(${1 + .08 * k}) translateX(${-2 * k}%)`;
    };
    const setHidden = hidden => { m.hidden = hidden; root.classList.toggle('bars', !hidden); root.classList.remove('fading'); };
    const scheduleHide = () => { clearTimeout(hideTimer); if (!m.paused && !m.ended) hideTimer = setTimeout(() => { if (destroyed) return; root.classList.add('fading'); hideTimer = setTimeout(() => !destroyed && setHidden(true), FADE); }, HIDE); };
    const tick = now => {
      if (destroyed) return;
      if (!m.paused && !m.ended) {
        m.pos = Math.min(duration, m.pos + now - last);
        if (m.pos >= duration) { m.ended = true; clearTimeout(hideTimer); setHidden(false); rerender(); return; }
        paint();
      }
      last = now; frame = requestAnimationFrame(tick);
    };
    const seek = clientX => { const r = node('[data-g2v-track]').getBoundingClientRect(); m.pos = Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * duration; if (m.ended && m.pos < duration) m.ended = false; paint(); };
    root.addEventListener('pointerdown', event => {
      if (m.hidden) { event.stopPropagation(); setHidden(false); scheduleHide(); return; }
      const bar = event.target.closest('[data-g2v-bar]');
      if (!bar) { scheduleHide(); return; }
      clearTimeout(hideTimer); seek(event.clientX);
      const move = ev => seek(ev.clientX), up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); rerender(); };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    }, true);
    root.addEventListener('click', event => {
      if (!event.target.closest('[data-g2v-toggle]')) return;
      if (m.ended) { m.ended = false; m.paused = false; m.pos = 0; } else m.paused = !m.paused;
      rerender();
    });
    paint(); scheduleHide(); frame = requestAnimationFrame(now => { last = now; tick(now); });
    return {destroy() { destroyed = true; cancelAnimationFrame(frame); clearTimeout(hideTimer); }};
  }
  window.G2Video = {time, slot, photoIcon, centerTap, render, attach};
})();
