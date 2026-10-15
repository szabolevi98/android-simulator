/* Android 2.1 Sound Recorder (SoundRecorder.apk, ERE27; no launcher icon: Messaging's Record audio starts it with
   GET_CONTENT audio/amr). layout-port/main.xml: a divider, the 242 dp timer panel on gradient_bg (the time "%02d:%02d" in
   112 dp, above it the LED and the state text in textAppearanceMedium, under the LED the small message, the horizontal
   ProgressBar 20 dp in while playing), a divider, the middle (the VUMeter, vumeter.png with its needle, or the exit
   buttons "Use this recording" / "Discard" 15 / 2 dp in), a divider and the 60 dp button bar on title_bar (record, play,
   stop as MediaButton: 71 x 52 dp btn_media_player).
   updateUi: idle with no sample — title "Record your message", idle_led and "Press record", only record on; recording —
   recording_led and "Recording", the time counting, stop on (the time left on the SD card shows only under 540 s);
   recorded — title "Message recorded", the exit buttons, record and play on; playing — title "Review message", the
   progress bar, stop on. Use this recording gives the sound back (saved with the title "yyyy-MM-dd HH:mm:ss", artist
   "Your recordings", album "Audio recordings"); Discard and Back drop it. There is no microphone here: the needle moves
   as it would with someone speaking. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const R = () => EC.text('recorder');
  // c.ui.recorder = {state: 'idle' | 'recording' | 'playing', length (s), started, onDone}.
  let timer = 0, needle = 0;
  const st = c => c.ui.recorder || (c.ui.recorder = {state: 'idle', length: 0});
  const fmt2 = s => R().fmt('timer_format', 'en', Math.floor(s / 60), s % 60);
  function render(c) {
    const r = st(c), now = Date.now();
    const shown = r.state === 'recording' ? Math.floor((now - r.started) / 1000) : r.state === 'playing' ? Math.min(r.length, Math.floor((now - r.started) / 1000)) : r.length;
    const title = R().t(r.state === 'playing' ? 'review_message' : r.state === 'idle' && r.length ? 'message_recorded' : 'record_your_message');
    const led = r.state === 'recording' ? 'recording_led' : r.state === 'idle' && !r.length ? 'idle_led' : '';
    const msg2 = r.state === 'recording' ? R().t('recording') : r.state === 'idle' && !r.length ? R().t('press_record') : '';
    const exit = r.length && r.state !== 'recording';
    const btn = (id, icon, on) => `<button type="button" class="ecsr-btn" data-action="ecsr-${id}"${on ? '' : ' disabled'}><i class="ec-bg np-fw-btn_media_player${on ? '' : '_disabled'}"></i>${on ? '<i class="ec-bg ec-pressed np-fw-btn_media_player_pressed"></i>' : ''}<img src="assets/sr-${icon}.png" alt=""></button>`;
    return c.window(title, `<div class="ecsr"><i class="ecsr-div"></i>
      <div class="ecsr-panel"><div class="ecsr-state">${led ? `<img src="assets/sr-${led}.png" alt="">` : ''}<span>${esc(msg2)}</span></div>
        ${r.state === 'playing' ? `<div class="ecsr-progress"><i style="width:${r.length ? Math.min(100, (now - r.started) / 10 / r.length) : 0}%"></i></div>` : ''}
        <div class="ecsr-time">${esc(fmt2(shown))}</div></div><i class="ecsr-div"></i>
      <div class="ecsr-middle">${exit ? `<div class="ecsr-exit">${[['accept', 'accept'], ['discard', 'discard']].map(([a, k]) => `<button type="button" class="ecui-button" data-action="ecsr-${a}"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(R().t(k))}</span></button>`).join('')}</div>`
        : `<div class="ecsr-vu"><img src="assets/sr-vumeter.png" alt=""><i class="ecsr-needle" style="transform:rotate(${r.state === 'recording' ? needle : 22.5}deg)"></i><i class="ecsr-pivot"></i></div>`}</div><i class="ecsr-div"></i>
      <div class="ecsr-bar">${btn('record', 'record', r.state !== 'recording')}${btn('play', 'play', r.state === 'idle' && r.length > 0)}${btn('stop', 'stop', r.state !== 'idle')}</div></div>`);
  }
  function tick(c) {
    clearInterval(timer);
    timer = setInterval(() => {
      const r = c.ui.recorder;
      if (!r || c.ui.view !== 'sound-recorder' || r.state === 'idle') { clearInterval(timer); return; }
      if (r.state === 'playing' && Date.now() - r.started >= r.length * 1000) r.state = 'idle';
      // VUMeter: π/8 + (7π/8 − π/8) · amplitude / 32768.
      needle = 22.5 + 135 * Math.min(1, Math.abs(Math.sin(Date.now() / 170)) * (0.4 + Math.random() * 0.6));
      c.render();
    }, 100);
  }
  function stop(c) {
    const r = st(c);
    if (r.state === 'recording') r.length = Math.max(1, Math.floor((Date.now() - r.started) / 1000));
    r.state = 'idle'; c.render();
  }
  EC.recordSound = (c, onDone) => { c.ui.recorder = {state: 'idle', length: 0, onDone}; c.open('sound-recorder'); };
  EC.register('sound-recorder', {
    title: 'Sound Recorder',
    render,
    action(name, el, event, c) {
      const r = st(c);
      switch (name) {
        case 'ecsr-record': r.state = 'recording'; r.started = Date.now(); r.length = 0; tick(c); c.render(); return true;
        case 'ecsr-play': r.state = 'playing'; r.started = Date.now(); tick(c); c.render(); return true;
        case 'ecsr-stop': stop(c); return true;
        case 'ecsr-discard': c.back(); return true;
        case 'ecsr-accept': {
          const d = new Date(), p = n => String(n).padStart(2, '0'), done = r.onDone;
          const sound = {type: 'audio', title: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`,
            artist: R().t('audio_db_artist_name'), album: R().t('audio_db_album_name'), length: r.length};
          c.back(); done?.(sound); return true;
        }
      }
      return false;
    },
    back(c) { clearInterval(timer); c.ui.recorder = null; return false; }
  });
})();
