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

  /* Do not disturb (ZenModeSettings, ZenModePrioritySettings, ZenModeAutomationSettings) over the zen config: the
     framework's default_zen_mode_config.xml allows calls, reminders and events, not messages; ZenModeConfig's
     DEFAULT_SOURCE is contacts and repeat callers are off (config_zen_repeat_callers_threshold 15 minutes). The priority
     summary joins Alarms with the allowed kinds in lower case (join_many_items_middle); a DropDownPreference holds
     From anyone / From contacts only / From starred contacts only / None. Automatic rules lists ZenModeHelper's default
     rules (Weeknight and Weekend schedules, Event), all off, with ic_schedule / ic_event, then Add rule. */
  const zen = c => S(c).zenConfig || (S(c).zenConfig = {calls: true, messages: false, reminders: true, events: true, repeatCallers: false, callsFrom: 1, messagesFrom: 1});
  const SOURCES = [['zen_mode_from_anyone', 0], ['zen_mode_from_contacts', 1], ['zen_mode_from_starred', 2], ['zen_mode_from_none', -1]];
  const source = (z, kind) => z[kind] ? z[kind + 'From'] : -1;
  H.zen_mode_settings = {
    summary(c, key) {
      if (key !== 'priority_settings') return undefined;
      const t = T(), z = zen(c);
      let out = t.t('zen_mode_alarms');
      for (const [on, name] of [[z.reminders, 'zen_mode_reminders'], [z.events, 'zen_mode_events'], [z.calls || z.repeatCallers, 'zen_mode_selected_callers'], [z.messages, 'zen_mode_selected_messages']])
        if (on) out = t.fmt('join_many_items_middle', null, out, t.t(name).toLocaleLowerCase(c.locale()));
      return out;
    }
  };
  H.zen_mode_priority_settings = {
    get(c, key) {
      const z = zen(c);
      if (key === 'alarms') return true;
      if (key === 'reminders' || key === 'events') return z[key];
      if (key === 'repeat_callers') return z.repeatCallers;
      return undefined;
    },
    set(c, key, v) {
      const z = zen(c);
      if (key === 'reminders' || key === 'events') { z[key] = v; return true; }
      if (key === 'repeat_callers') { z.repeatCallers = v; return true; }
      return false;
    },
    disabled: (c, key) => key === 'alarms',
    summary(c, key) {
      const t = T(), z = zen(c);
      if (key === 'messages' || key === 'calls') return t.t(SOURCES.find(([, v]) => v === source(z, key))[0]);
      if (key === 'repeat_callers') return t.fmt('zen_mode_repeat_callers_summary', null, 15);
      return undefined;
    },
    click(c, key) {
      if (key !== 'messages' && key !== 'calls') return false;
      const t = T(), z = zen(c), cur = source(z, key);
      c.dialog({items: SOURCES.map(([label, v]) => ({html: `<span class="mmst-choice"><i class="mmw-radio${v === cur ? ' on' : ''}"></i><span>${c.safe(t.t(label))}</span></span>`})),
        onItem: i => { const v = SOURCES[i][1]; z[key] = v !== -1; if (v !== -1) z[key + 'From'] = v; c.save(); c.render(); }});
      return true;
    }
  };
  const RULES = [['framework/zen_mode_default_weeknights_name', 'ic_schedule'], ['framework/zen_mode_default_weekends_name', 'ic_schedule'], ['framework/zen_mode_default_events_name', 'ic_event']];
  MM.settingsScreens['xml:zen_mode_automation_settings'] = {
    title: () => T().t('zen_mode_automation_settings_title'),
    render(c) {
      const t = T(), row = (icon, title, summary, action) => `<button type="button" class="mmst-pref" data-action="${action}"><span class="mmst-iconframe"><img class="mmst-ic" src="assets/st-${icon}.svg" alt=""></span><span class="mmst-texts"><span class="mmst-title">${c.safe(title)}</span>${summary ? `<span class="mmst-summary">${c.safe(summary)}</span>` : ''}</span></button>`;
      return `<div class="mmst-list">${RULES.map(([name, icon]) => row(icon, t.t(name), t.t('switch_off_text'), 'mmzr-rule')).join('')}${row('ic_add', t.t('zen_mode_add_rule'), '', 'mmzr-add')}</div>`;
    },
    action(c, name) {
      if (name === 'mmzr-rule') { MM.settingsGo(c, 'missing:com.android.settings.notification.ZenModeScheduleRuleSettings', ''); return true; }
      if (name === 'mmzr-add') { MM.settingsGo(c, 'missing:com.android.settings.notification.ZenRuleNameDialog', ''); return true; }
      return false;
    }
  };
})();
