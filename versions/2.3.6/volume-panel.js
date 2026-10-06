/* Volume keys and the Gingerbread volume toast (frameworks/base android-2.3.6_r1: VolumePanel, volume_adjust.xml,
   AudioService). The panel is a Toast (LENGTH_SHORT, Gravity.TOP, not touchable) on panel_background: for the ringer the
   message ("Ringer volume") over the large ringer icon (ic_volume, ic_vibrate or ic_volume_off), for other streams the
   small icon (ic_volume_small / ic_volume_off_small) beside the message; then a 200 dp horizontal ProgressBar
   (progress_horizontal, 5 dp corners, the yellow progress gradient). AudioService.checkForRingerModeChange: lowering the
   ringer from its last audible step enters vibrate (VIBRATE_IN_SILENT defaults to on), raising leaves it, lowering in
   vibrate or silent does nothing. In-call volume shows one more step so it never reaches empty. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const TIMEOUT = 2000, VIBRATE_DELAY = 300, VIBRATE_DURATION = 300; // Toast.LENGTH_SHORT and the VolumePanel constants
  // AudioService.MAX_STREAM_VOLUME and the simulator settings that keep each stream's level (in percent).
  const STREAMS = {
    call: {max: 5, key: 'callVolume', fallback: 80, label: 'volume_call'},
    ring: {max: 7, key: 'ringVolume', fallback: 70, label: 'volume_ringtone'},
    music: {max: 15, key: 'mediaVolume', fallback: 60, label: 'volume_music'}
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
  // AudioService.adjustStreamVolume with checkForRingerModeChange (2.3.6).
  function adjust(settings, stream, direction) {
    const result = {vibrate: false};
    if (stream !== 'ring') { setIndex(settings, stream, index(settings, stream) + direction); return result; }
    const mode = ringerOf(settings), level = index(settings, 'ring');
    if (mode === 'normal') {
      if (direction < 0 && level === 1) { setRinger(settings, 'vibrate'); result.vibrate = true; }
      else setIndex(settings, 'ring', level + direction);
    } else if (direction > 0) { setRinger(settings, 'normal'); if (!level) setIndex(settings, 'ring', 1); }
    return result;
  }
  const fw = (key, lang) => window.GBStrings?.framework?.strings?.[key]?.[lang] ?? window.GBStrings?.framework?.strings?.[key]?.en ?? key;
  // onShowVolumeChanged: the ringer's level reads 0 while it is in vibrate or silent; in-call volume is shown one up.
  function render(settings, stream, t, lang = 'en') {
    const spec = STREAMS[stream], mode = ringerOf(settings), muted = stream === 'ring' && mode !== 'normal';
    const value = muted ? 0 : index(settings, stream) + (stream === 'call' ? 1 : 0), max = spec.max + (stream === 'call' ? 1 : 0);
    const small = stream === 'ring' ? '' : `<img class="gbvol-small" src="assets/gbvol-${value ? 'ic_volume_small' : 'ic_volume_off_small'}.png" alt="">`;
    const large = stream === 'ring' ? `<img class="gbvol-large" src="assets/gbvol-${mode === 'vibrate' ? 'ic_vibrate' : mode === 'silent' ? 'ic_volume_off' : 'ic_volume'}.png" alt="">` : '';
    return `<div class="vol-panel gbvol" data-stream="${stream}" role="status"><div class="gbvol-head">${small}<span>${e(fw(spec.label, lang))}</span></div>${large}<div class="gbvol-level" role="progressbar" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${value}"><i style="width:${value / max * 100}%"></i></div></div>`;
  }
  // The toast is not touchable: there is no slider to drag.
  function update() {}
  function bindSeek() {}
  window.VolumePanel = {TIMEOUT, VIBRATE_DELAY, VIBRATE_DURATION, STREAMS, ringerOf, setRinger, index, setIndex, activeStream, adjust, render, update, bindSeek};
})();
