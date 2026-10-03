/* Volume keys and the Lollipop volume dialog (SystemUI 5.1 VolumePanel: volume_dialog.xml, volume_panel_item.xml,
   zen_mode_panel.xml; AudioService). A phone shows the active stream: the #263238 dialog 8 dp in from the sides under
   the status bar, the #384248 slider panel (48 dp stream icon, the Material seekbar in #80CBC4, a divider and the
   settings gear) and the interruption buttons None / Priority / All; outside All the subhead reads "Until you turn
   this off". */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const TIMEOUT = 3000, VIBRATE_DELAY = 300, VIBRATE_DURATION = 300; // VolumePanel constants
  // AudioService.MAX_STREAM_VOLUME and the simulator settings that keep each stream's level (in percent).
  const STREAMS = {
    call: {max: 5, key: 'callVolume', fallback: 80, icon: 'ic_audio_phone', label: 'Call volume'},
    ring: {max: 7, key: 'ringVolume', fallback: 70, icon: 'ic_ringer_audible', mute: 'ic_ringer_mute', vibrate: 'ic_ringer_vibrate', label: 'Ringtone volume'},
    music: {max: 15, key: 'mediaVolume', fallback: 60, icon: 'ic_audio_vol', mute: 'ic_audio_vol_mute', label: 'Media volume'}
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
    const icon = stream === 'ring' && mode === 'vibrate' ? spec.vibrate : muted || (!value && spec.mute) ? spec.mute : spec.icon;
    const pct = value / spec.max * 100, zen = settings.zenMode || 'all';
    const zenButtons = [['none', 'None'], ['priority', 'Priority'], ['all', 'All']].map(([id, label]) => `<button type="button" class="vol-zen${zen === id ? ' on' : ''}" data-action="vol-zen" data-id="${id}" aria-pressed="${zen === id}">${e(t(label))}</button>`).join('');
    return `<div class="vol-panel lp-vol" data-stream="${stream}"><div class="vol-sliders"><div class="vol-item"><span class="vol-icon">${stream === 'call' ? '<img class="vol-am" src="assets/lp-fw-ic_audio_phone.png" alt="">' : `<img src="assets/lp-sysui-${icon}.svg" alt="">`}</span><div class="vol-seek${muted ? ' disabled' : ''}" role="slider" tabindex="0" aria-label="${e(t(spec.label))}" aria-valuemin="0" aria-valuemax="${spec.max}" aria-valuenow="${value}"${muted ? ' aria-disabled="true"' : ''}><span class="vol-track"><span class="vol-progress" style="width:${pct}%"></span><span class="vol-thumb" style="left:${pct}%"></span></span></div><i class="vol-divider"></i><button type="button" class="vol-settings" data-action="vol-settings" aria-label="${e(t('Settings'))}"><img src="assets/lp-sysui-ic_settings.svg" alt=""></button></div></div><div class="vol-zen-row">${zenButtons}</div>${zen !== 'all' ? `<div class="vol-subhead"><span>${e(t('Until you turn this off'))}</span><img src="assets/lp-sysui-qs_subhead_caret.svg" alt=""></div>` : ''}</div>`;
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
