/* Volume keys and the volume panel of the KTU84P (Nexus 5) image (frameworks/base VolumePanel, volume_adjust.xml and
   AudioService; the same layout, timeouts and ringer steps from 4.0.4 to 4.4; 4.4 draws the stream icons from the auto-mirrored *_am bitmaps). A phone (config_voice_capable)
   shows only the active stream's slider, without the expand button. Icons and SeekBar art are this image's framework-res. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const TIMEOUT = 3000, VIBRATE_DELAY = 300, VIBRATE_DURATION = 300; // VolumePanel constants
  // AudioService.MAX_STREAM_VOLUME and the simulator settings that keep each stream's level (in percent).
  const STREAMS = {
    call: {max: 5, key: 'callVolume', fallback: 80, icon: 'ga-ic_audio_phone', label: 'Call volume'},
    ring: {max: 7, key: 'ringVolume', fallback: 70, icon: 'ga-ic_audio_ring_notif', mute: 'ga-ic_audio_ring_notif_mute', vibrate: 'ga-ic_audio_ring_notif_vibrate', label: 'Ringtone volume'},
    music: {max: 15, key: 'mediaVolume', fallback: 60, icon: 'ga-ic_audio_vol', label: 'Media volume'}
  };
  const ringerOf = settings => !settings.silent ? 'normal' : settings.silentMode === 'vibrate' ? 'vibrate' : 'silent';
  function setRinger(settings, mode) { settings.silent = mode !== 'normal'; settings.silentMode = mode === 'vibrate' ? 'vibrate' : mode === 'silent' ? 'mute' : 'off'; }
  function index(settings, stream) {
    const spec = STREAMS[stream], pct = Number(settings[spec.key] ?? spec.fallback);
    return Math.max(0, Math.min(spec.max, Math.round(pct / 100 * spec.max)));
  }
  function setIndex(settings, stream, value) {
    const spec = STREAMS[stream];
    settings[spec.key] = Math.round(Math.max(0, Math.min(spec.max, value)) / spec.max * 100);
  }
  // AudioService.getActiveStreamType on a voice-capable device: the call, then playing music, else the ringer.
  const activeStream = ({inCall, musicActive}) => inCall ? 'call' : musicActive ? 'music' : 'ring';
  /* adjustStreamVolume + checkForRingerModeChange with a vibrator: on the ringer, lowering from the last audible step
     enters vibrate; lowering again reaches silent only if the previous key was not also a lower (so held or repeated
     presses stop at vibrate); raising leaves silent for vibrate and vibrate for normal. */
  function adjust(settings, stream, direction, previous) {
    const result = {vibrate: false};
    if (stream !== 'ring') { setIndex(settings, stream, index(settings, stream) + direction); return result; }
    const mode = ringerOf(settings), level = index(settings, 'ring');
    if (mode === 'normal') {
      if (direction < 0 && level <= 1) { setRinger(settings, 'vibrate'); result.vibrate = true; }
      else setIndex(settings, 'ring', level + direction);
    } else if (mode === 'vibrate') {
      if (direction < 0 && previous >= 0) setRinger(settings, 'silent');
      else if (direction > 0) { setRinger(settings, 'normal'); if (!level) setIndex(settings, 'ring', 1); }
    } else if (direction > 0) { setRinger(settings, 'vibrate'); result.vibrate = true; }
    return result;
  }
  function render(settings, stream, t) {
    const spec = STREAMS[stream], mode = ringerOf(settings);
    const muted = stream === 'ring' && mode !== 'normal', value = muted ? 0 : index(settings, stream);
    const icon = stream === 'ring' && mode === 'vibrate' ? spec.vibrate : muted ? spec.mute : spec.icon;
    const pct = value / spec.max * 100;
    return `<div class="vol-panel" data-stream="${stream}"><div class="vol-item"><span class="vol-icon"><img src="assets/${icon}.png" alt=""></span><div class="vol-seek${muted ? ' disabled' : ''}" role="slider" tabindex="0" aria-label="${e(t(spec.label))}" aria-valuemin="0" aria-valuemax="${spec.max}" aria-valuenow="${value}"${muted ? ' aria-disabled="true"' : ''}><span class="vol-track"><span class="vol-progress" style="width:${pct}%"></span><span class="vol-thumb" style="left:${pct}%"></span></span></div></div></div>`;
  }
  // While dragging only the bar moves, so the pointer capture survives.
  function update(root, settings, stream) {
    const spec = STREAMS[stream], value = index(settings, stream), pct = `${value / spec.max * 100}%`;
    const bar = root.querySelector('.vol-seek'); if (!bar) return;
    bar.setAttribute('aria-valuenow', value); bar.querySelector('.vol-progress').style.width = pct; bar.querySelector('.vol-thumb').style.left = pct;
  }
  // SeekBar dragging: the track spans the bar minus its 16dp paddings; returns the stream index under the pointer.
  function bindSeek(root, max, onChange) {
    const bar = root.querySelector('.vol-seek'), track = root.querySelector('.vol-track');
    if (!bar || bar.classList.contains('disabled')) return;
    const at = event => { const r = track.getBoundingClientRect(); return Math.round(Math.max(0, Math.min(1, (event.clientX - r.left) / r.width)) * max); };
    bar.addEventListener('pointerdown', event => {
      event.preventDefault(); bar.setPointerCapture?.(event.pointerId); bar.classList.add('pressed'); onChange(at(event));
      const move = next => onChange(at(next));
      const up = () => { bar.classList.remove('pressed'); bar.removeEventListener('pointermove', move); bar.removeEventListener('pointerup', up); bar.removeEventListener('pointercancel', up); };
      bar.addEventListener('pointermove', move); bar.addEventListener('pointerup', up); bar.addEventListener('pointercancel', up);
    });
  }
  window.VolumePanel = {TIMEOUT, VIBRATE_DELAY, VIBRATE_DURATION, STREAMS, ringerOf, setRinger, index, setIndex, activeStream, adjust, render, update, bindSeek};
})();
