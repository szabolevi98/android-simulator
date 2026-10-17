/* Android 6.0.1 Settings: Sound & notification (NotificationSettings) and Other sounds (OtherSoundSettings), Settings.apk
   MTC20K, as MM.settingsHooks.
   - The 5X is voice capable: Ring volume stays (STREAM_RING), Notification volume goes, the phone ringtone and Also
     vibrate for calls stay. VolumeSeekBarPreference (preference_volume_slider.xml: listPreferredItemHeight, 16 dp at the
     sides, the Subhead title 8 dp from the top, 6 dp under it the 24 dp icon and the SeekBar 24 dp after its start)
     for media (0–15), alarm (0–7) and ring (0–7), the mute icon at 0; the ring icon is ic_audio_ring_notif_vibrate in
     vibrate mode (updateRingOrNotificationPreference), and moving ring to 0 sets vibrate as AudioService does with a
     vibrator.
   - Also vibrate for calls: vibrate_when_ringing, 0 by default. Pulse notification light: config_intrusiveNotificationLed
     keeps it, notification_light_pulse def_notification_pulse false. When device is locked: without a secure lock "Show
     all notification content" and "Don’t show notifications at all" (lock_screen_show_notifications 1). Notification
     access: no listener enabled, manage_notification_access_summary_zero.
   - The ringtones: DefaultRingtonePreference opens the framework's RingtonePickerActivity (Ringtones, None and the
     system sounds' titles, Cancel / OK); the summaries are the chosen sound's title (build.prop: Titania, Tethys).
   - Other sounds: dial pad tones (dtmf_tone), screen locking (lockscreen_sounds_enabled), charging and touch sounds
     and vibrate on touch on (def_dtmf_tones_enabled, def_lockscreen_sounds_enabled, def_sound_effects_enabled,
     def_haptic_feedback true); docking sounds and dock audio go (has_dock_settings false), the emergency tone too (a GSM
     phone). */
(() => {
  'use strict';
  const T = () => MM.text('settings');
  const F = () => MM.text('framework');
  const H = MM.settingsHooks = MM.settingsHooks || {};
  const S = c => c.data.settings;
  const vol = c => S(c).volume || (S(c).volume = {voice: 5, ring: 5, music: 11, alarm: 6});
  const STREAMS = {media_volume: ['music', 15, 'ic_audio_media'], alarm_volume: ['alarm', 7, 'ic_audio_alarm'], ring_volume: ['ring', 7, 'ic_audio_ring_notif']};
  const tone = (c, kind) => (S(c).tones || {})[kind] ?? MM.settingsRingtones[kind].default;

  function icon(c, key, level) {
    const [, , base] = STREAMS[key], s = S(c);
    if (key === 'ring_volume' && s.zen === 2) return `${base}_mute`;
    if (key === 'ring_volume' && s.ringerMode === 'vibrate') return 'ic_audio_ring_notif_vibrate';
    return level === 0 ? `${base}_mute` : base;
  }
  function slider(c, n) {
    const [stream, max] = STREAMS[n.key], level = vol(c)[stream] ?? 0, v = level / max;
    return `<div class="mmst-volume" data-key="${n.key}"><div class="mmst-title">${c.safe(MM.settingsStr(n.title))}</div>
      <div class="mmst-volrow"><img class="mmst-volicon" src="assets/fw-${icon(c, n.key, level)}.svg" alt=""><div class="mmst-seek" role="slider" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${level}" style="--v:${v.toFixed(4)}"><i class="mmst-seek-track"></i><i class="mmst-seek-progress"></i><i class="mmst-seek-thumb"></i></div></div></div>`;
  }
  // The SeekBar follows the pointer; the stream takes the nearest step.
  function bind(c, root) {
    for (const row of root.querySelectorAll('.mmst-volume')) {
      const key = row.dataset.key, [stream, max] = STREAMS[key], bar = row.querySelector('.mmst-seek');
      bar.addEventListener('pointerdown', e => {
        e.preventDefault(); try { bar.setPointerCapture(e.pointerId); } catch {}
        const move = ev => {
          const r = bar.getBoundingClientRect(), pad = 16 * c.el.screen.clientWidth / 411.4286;
          const level = Math.round(Math.min(1, Math.max(0, (ev.clientX - r.left - pad) / (r.width - 2 * pad))) * max);
          if (vol(c)[stream] === level) return;
          vol(c)[stream] = level;
          if (stream === 'ring') S(c).ringerMode = level === 0 ? 'vibrate' : 'normal';
          bar.style.setProperty('--v', (level / max).toFixed(4)); bar.setAttribute('aria-valuenow', level);
          row.querySelector('.mmst-volicon').src = `assets/fw-${icon(c, key, level)}.svg`;
        };
        move(e);
        const up = () => { bar.removeEventListener('pointermove', move); c.save(); MM.system?.changed(c); };
        bar.addEventListener('pointermove', move);
        bar.addEventListener('pointerup', up, {once: true}); bar.addEventListener('pointercancel', up, {once: true});
      });
    }
  }
  // RingtonePickerActivity: None first (showSilent), then the titles; OK keeps the choice.
  function picker(c, kind) {
    const f = F(), list = ['', ...MM.settingsRingtones[kind].titles], cur = tone(c, kind);
    let pick = list.indexOf(cur);
    const html = i => `<span class="mmst-choice"><i class="mmw-radio${i === pick ? ' on' : ''}"></i><span>${c.safe(list[i] || f.t('ringtone_silent'))}</span></span>`;
    c.dialog({title: f.t('ringtone_picker_title'), keepOpen: true, items: list.map((_, i) => ({html: html(i)})),
      onItem: (i, c) => { pick = i; c.el.overlay.querySelectorAll('.mmdlg-item .mmw-radio').forEach((r, j) => r.classList.toggle('on', j === i)); },
      buttons: [{label: f.t('cancel')}, {label: f.t('ok'), action: c => { S(c).tones = {...(S(c).tones || {}), [kind]: list[pick]}; c.save(); c.render(); }}]});
  }

  H.notification_settings = {
    hidden: ['notification_volume'],
    row: (c, key, n) => STREAMS[key] ? slider(c, n) : null,
    mount: bind,
    get(c, key) {
      const s = S(c);
      if (key === 'vibrate_when_ringing') return !!s.vibrateWhenRinging;
      if (key === 'notification_pulse') return !!s.notificationPulse;
      return undefined;
    },
    set(c, key, v) {
      const s = S(c);
      if (key === 'vibrate_when_ringing') { s.vibrateWhenRinging = v; return true; }
      if (key === 'notification_pulse') { s.notificationPulse = v; return true; }
      return false;
    },
    summary(c, key) {
      const t = T(), s = S(c);
      if (key === 'ringtone') return tone(c, 'ringtone') || F().t('ringtone_silent');
      if (key === 'notification_ringtone') return tone(c, 'notification') || F().t('ringtone_silent');
      if (key === 'lock_screen_notifications') return t.t((s.lockNotifications ?? true) ? 'lock_screen_notifications_summary_show' : 'lock_screen_notifications_summary_disable');
      if (key === 'manage_notification_access') return t.t('manage_notification_access_summary_zero');
      return undefined;
    },
    click(c, key) {
      const t = T(), s = S(c);
      if (key === 'ringtone') { picker(c, 'ringtone'); return true; }
      if (key === 'notification_ringtone') { picker(c, 'notification'); return true; }
      if (key === 'lock_screen_notifications') {
        const items = [['lock_screen_notifications_summary_show', true], ['lock_screen_notifications_summary_disable', false]], cur = s.lockNotifications ?? true;
        c.dialog({items: items.map(([label, v]) => ({html: `<span class="mmst-choice"><i class="mmw-radio${v === cur ? ' on' : ''}"></i><span>${c.safe(t.t(label))}</span></span>`})),
          onItem: i => { s.lockNotifications = items[i][1]; c.save(); c.render(); }});
        return true;
      }
      return false;
    }
  };

  H.other_sound_settings = {
    hidden: ['docking_sounds', 'dock_audio_media', 'emergency_tone'],
    get(c, key) {
      const o = S(c).otherSounds || {};
      return ['dial_pad_tones', 'screen_locking_sounds', 'charging_sounds', 'touch_sounds', 'vibrate_on_touch'].includes(key) ? o[key] ?? true : undefined;
    },
    set(c, key, v) { S(c).otherSounds = {...(S(c).otherSounds || {}), [key]: v}; return true; }
  };
})();
