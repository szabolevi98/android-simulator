__HEADER__
/* The image's own ringtones, notification sounds and alarms (WebM / Opus copies in assets/audio, loaded only when played):
   - a ringtone list plays the tone touched, as RingtonePickerActivity does: the Settings dialogs mark their form with
     data-sound (ringtone / notificationTone, values are titles), Gingerbread's list uses gbset-sound-pick (file names);
     closing the list stops it;
   - a ringing alarm (the AlarmAlert / AlarmActivity screen of each version) loops the image's default alarm
     (ro.config.alarm_alert) until it is dismissed or snoozed.
   Browsers only play sound after the first touch on the page. */
(() => {
  'use strict';
  // category -> file name -> [title, asset]; the build.prop defaults by file name.
  const SOUNDS = __SOUNDS__;
  const DEFAULTS = __DEFAULTS__;
  const RINGING = '.gbdc-ring, .dcal-ics, .dcal-glow, .dcal-lp';
  const asset = (cat, key) => { const list = SOUNDS[cat] || {}; const hit = list[key] || Object.values(list).find(([title]) => title === key); return hit ? hit[1] : null; };
  let preview = null, alarm = null;
  const start = (name, loop) => { const audio = new Audio(`../../assets/audio/${name}.webm`); audio.loop = loop; audio.play().catch(() => {}); return audio; };
  function play(cat, key) { stop(); const name = asset(cat, key); if (name) preview = start(name, false); }
  function stop() { if (preview) { preview.pause(); preview = null; } }
  document.addEventListener('change', event => {
    const input = event.target.closest?.('form[data-sound] input[name="choice"]');
    if (input) play(input.form.dataset.sound === 'ringtone' ? 'ringtones' : 'notifications', input.value);
  });
  document.addEventListener('click', event => {
    const pick = event.target.closest?.('[data-action="gbset-sound-pick"]');
    if (!pick) return;
    const [kind, name] = pick.dataset.id.split(':');
    if (name) play(kind === 'ringtone' ? 'ringtones' : 'notifications', name); else stop();
  }, true);
  // The list closing stops the preview; the ringing screen appearing or leaving starts or stops the alarm.
  let queued = false;
  new MutationObserver(() => {
    if (queued) return; queued = true;
    requestAnimationFrame(() => {
      queued = false;
      if (preview && !document.querySelector('form[data-sound], [data-action="gbset-sound-pick"]')) stop();
      const ringing = !!document.querySelector(RINGING);
      if (ringing && !alarm) { const name = asset('alarms', DEFAULTS.alarms); if (name) alarm = start(name, true); }
      if (!ringing && alarm) { alarm.pause(); alarm = null; }
    });
  }).observe(document.body, {childList: true, subtree: true});
  window.SystemSounds = {SOUNDS, DEFAULTS, asset, play, stop};
})();
