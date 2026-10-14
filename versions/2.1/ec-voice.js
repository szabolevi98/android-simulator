/* Android 2.1 Voice Search and Voice Dialer.
   - Voice Search (VoiceSearchWithKeyboard.apk RecognitionActivity, recognition_dialog.xml): "Speak now" (28 sp) over the
     microphone level (speak_now_level0…6) and the Google logo, Cancel; after the listening it goes to "Working", and as
     recognition needs Google's servers the simulator ends where an offline phone does: "Connection problem" with Try
     again / Cancel. (The browser has no microphone here, so the level only breathes.)
   - Voice Dialer (VoiceDialer.apk): "Listening…" with the examples, then "Please try again." */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const V = () => EC.text('voice');
  let timer = 0, level = 0;
  function voiceSearch(c, state = 'listening') {
    clearTimeout(timer); clearInterval(level);
    const text = state === 'listening' ? V().t('listening') : state === 'working' ? V().t('working') : V().t('network_error');
    const img = state === 'error' ? 'vs-ic_dialog_voice_input.png' : 'vs-speak_now_level0.png';
    c.dialog({title: '', icon: null, cancelable: true,
      html: `<div class="ecvs"><div class="ecvs-text">${esc(text)}</div><img class="ecvs-mic" src="assets/${img}" alt=""><img class="ecvs-brand" src="assets/vs-ic_logo_google_white.png" alt=""></div>`,
      mount: root => { if (state === 'listening') { let i = 0; const m = root.querySelector('.ecvs-mic'); level = setInterval(() => { if (!m.isConnected) { clearInterval(level); return; } i = (i + 1) % 6; m.src = `assets/vs-speak_now_level${[0, 3, 6, 3, 0, 0][i]}.png`; }, 250); } },
      buttons: state === 'error' ? [{label: V().t('try_again'), action: () => setTimeout(() => voiceSearch(c), 0)}, {label: V().t('cancel'), action: done}] : [{label: V().t('cancel'), action: done}],
      onCancel: done});
    if (state === 'listening') timer = setTimeout(() => voiceSearch(c, 'working'), 3500);
    if (state === 'working') timer = setTimeout(() => voiceSearch(c, 'error'), 1500);
    function done() { clearTimeout(timer); clearInterval(level); if (c.ui.view === 'voice-search') c.back(); }
  }
  function voiceDialer(c, state = 'listening') {
    clearTimeout(timer);
    c.dialog({title: V().t('VoiceDialer/voiceDialer'), icon: 'vs-ic_dialog_voice_input.png',
      message: state === 'listening' ? `${V().t('VoiceDialer/listening')}\n${V().t('VoiceDialer/examples')}` : V().t('VoiceDialer/please_try_again'),
      buttons: [{label: V().t('cancel'), action: () => { clearTimeout(timer); c.back(); }}], onCancel: () => { clearTimeout(timer); c.back(); }});
    if (state === 'listening') timer = setTimeout(() => voiceDialer(c, 'retry'), 5000);
  }
  // Both are dialogs over what was on screen; the "app" behind them is the home screen.
  for (const [id, run] of [['voice-search', voiceSearch], ['voice-dialer', voiceDialer]]) {
    EC.register(id, {title: id, render: () => '<div class="ecvs-behind"></div>', wallpaper: () => true, start: c => setTimeout(() => run(c), 0), back() { clearTimeout(timer); clearInterval(level); return false; }});
  }
  document.addEventListener('DOMContentLoaded', () => {
    const c = EC.context, open = c.open;
    c.open = (view, sub, opts) => { const r = open(view, sub, opts); if (view === 'voice-search' || view === 'voice-dialer') EC.module(view).start(c); return r; };
  });
})();
