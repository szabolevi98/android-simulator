/* Sound Recorder 4.3 (SoundRecorder.apk, JWR66Y): it has no launcher icon; Messaging's "Record audio" attachment starts
   it with audio/amr and EXTRA_MAX_BYTES. Theme.SoundRecorder is Theme.Holo.DialogWhenLarge, a full-screen dark activity
   on the phone whose action bar shows SoundRecorder.updateUi's title. main.xml (port): the 242 dp timerViewLayout on
   gradient_bg with the 112 dp timer, the recording_led and "Recording" above it, the time left below that and the
   playback ProgressBar; the middle holds the VUMeter (200 x 80 px on vumeter, a white needle from pi/8 to 7pi/8 with a
   60/255 black shadow) or, with a recording, Discard / Done; the 60 dp title_bar strip has the record, play and stop
   MediaButtons (71 x 52 dp, btn_default). The states, enabled buttons and titles follow updateUi, the timer
   updateTimerView ("%02d:%02d"), the remaining time updateTimeRemaining (AMR at 5 900 bit/s against the MMS size
   limit: "%ds available" under a minute, "%d min available" under nine). The simulator records nothing: the length
   and the needle are simulated. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const LANGS = ['en', 'hu', 'de', 'fr', 'es'];
  const STR = {
    record_your_message: ["Record your message", "Rögzítse üzenetét", "Ihre Nachricht aufnehmen", "Enregistrez votre message", "Grabar mensaje"],
    message_recorded: ["Message recorded", "Az üzenet rögzítve", "Nachricht aufgezeichnet", "Message enregistré", "Mensaje grabado"],
    review_message: ["Review message", "Üzenet visszahallgatása", "Nachricht erneut anhören", "Revoir le message", "Revisar mensaje"],
    recording: ["Recording", "Rögzítés folyamatban", "Aufnahme", "Enregistrement audio", "Grabando..."],
    recording_stopped: ["Recording stopped", "A rögzítés leállt", "Aufnahme beendet", "Enregistrement audio interrompu", "Grabación detenida"],
    max_length_reached: ["Maximum length reached", "Elérte a maximális hosszúságot", "Maximale Länge erreicht", "Taille maximale atteinte", "Duración máxima alcanzada"],
    min_available: ["%d min available", "%d p áll rendelkezésére", "%d Min. verfügbar", "%d min disponibles", "%d minutos disponibles"],
    sec_available: ["%ds available", "%d mp áll rendelkezésére", "%d Sek. verfügbar", "Il reste %d s", "%d segundos disponibles"],
    accept: ["Done", "Kész", "Fertig", "OK", "Listo"],
    discard: ["Discard", "Elvetés", "Verwerfen", "Supprimer", "Descartar"],
    audio_db_artist_name: ["Your recordings", "Saját felvételek", "Ihre Aufnahmen", "Vos enregistrements audio", "Tus grabaciones"],
    audio_db_album_name: ["Audio recordings", "Hangfelvételek", "Audioaufnahmen", "Enregistrements audio", "Grabaciones de audio"]
  };
  const text = (lang, key) => (STR[key] || [key])[Math.max(0, LANGS.indexOf(lang))];
  // Mms passes MmsConfig's 300 KB message size limit (less the slideshow slop); AMR_NB is counted at 5 900 bit/s.
  const MAX_BYTES = 300 * 1024 - 1024, BYTES_PER_SECOND = 5900 / 8;
  const LIMIT = Math.floor(MAX_BYTES / BYTES_PER_SECOND);
  const initial = () => ({state: 'idle', length: 0, started: 0, interrupted: false, error: ''});
  const progress = (sr, now = Date.now()) => Math.floor((now - sr.started) / 1000);
  function remaining(sr, lang, now) {
    const t = LIMIT - progress(sr, now);
    return t < 60 ? text(lang, 'sec_available').replace('%d', t) : t < 540 ? text(lang, 'min_available').replace('%d', Math.floor(t / 60) + 1) : '';
  }
  // VUMeter.onDraw: the needle angle from pi/8 (silence) to 7pi/8 (full scale), drawn from the pivot at the bottom.
  function needle(sr, now) {
    const level = sr.state === 'recording' ? .25 + .45 * Math.abs(Math.sin(now / 170) * Math.cos(now / 410)) : 0;
    const angle = Math.PI / 8 + (Math.PI * 6 / 8) * level;
    return `<i class="sr-needle" style="transform:rotate(${(angle * 180 / Math.PI).toFixed(1)}deg)"></i>`;
  }
  function render(sr, lang, now = Date.now()) {
    const T = key => text(lang, key), st = sr.state, sample = sr.length > 0;
    const title = st === 'recording' ? T('record_your_message') : st === 'playing' ? T('review_message') : sample ? T('message_recorded') : T('record_your_message');
    const time = st === 'recording' || st === 'playing' ? progress(sr, now) : sr.length;
    const timer = `${String(Math.floor(time / 60)).padStart(2, '0')}:${String(time % 60).padStart(2, '0')}`;
    const msg2 = st === 'recording' ? `<img src="assets/sr-recording_led.png" alt=""><span>${e(T('recording'))}</span>` : st === 'idle' && sr.interrupted ? `<span>${e(T('recording_stopped'))}</span>` : '';
    const msg1 = st === 'recording' ? remaining(sr, lang, now) : st === 'idle' && sr.error ? T(sr.error) : '';
    const bar = st === 'playing' ? `<div class="sr-progress"><i style="width:${Math.min(100, 100 * time / sr.length)}%"></i></div>` : '';
    const exit = st !== 'recording' && sample;
    const middle = exit ? `<div class="sr-exit"><button class="sr-btn" data-action="sr-discard">${e(T('discard'))}</button><button class="sr-btn" data-action="sr-accept">${e(T('accept'))}</button></div>` : `<div class="sr-vumeter">${needle(sr, now)}</div>`;
    const button = (action, icon, enabled) => `<button class="sr-media" data-action="${action}" ${enabled ? '' : 'disabled'}><img src="assets/sr-${icon}.png" alt=""></button>`;
    return `<div class="app-view sr-app"><header class="sr-bar"><img src="assets/sr-ic_launcher_soundrecorder.png" alt=""><h2>${e(title)}</h2></header><div class="sr-timer-area"><div class="sr-state"><div class="sr-msg2">${msg2}</div><div class="sr-msg1">${e(msg1)}</div></div>${bar}<div class="sr-timer">${timer}</div></div><div class="sr-middle">${middle}</div><div class="sr-buttons">${button('sr-record', 'record', st !== 'recording')}${button('sr-play', 'play', st === 'idle' && sample)}${button('sr-stop', 'stop', st !== 'idle')}</div></div>`;
  }
  // The recording handed back to Messaging (addToMediaDB: the audio_db_title_format date as its title).
  function sample(sr, lang, now = new Date()) {
    const p = n => String(n).padStart(2, '0');
    const title = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())} ${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`;
    return {kind: 'audio', name: title, album: text(lang, 'audio_db_album_name'), artist: text(lang, 'audio_db_artist_name'), duration: sr.length};
  }
  window.SoundRecorder = {STR, text, LIMIT, initial, progress, render, sample};
})();
