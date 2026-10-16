/* Android 6.0.1 volume panel (SystemUI.apk VolumeDialog, VolumeDialogController, ZenFooter; AudioService's defaults).
   - The streams: AudioService's DEFAULT_STREAM_VOLUME / MAX_STREAM_VOLUME (ring 5 of 7, media 11 of 15, alarm 6 of 7,
     voice call of ro.config.vc_call_vol_steps 7); the keys move the active stream (media while something plays, else the
     ring stream) a step; VolumePolicy.DEFAULT: the ring stream goes to vibrate below its first step (the 5X vibrates) and
     never to silent from the keys, up from vibrate returns to the first step.
   - The dialog: a window at the top of the screen (gravity top, volume_offset_top 0), as wide as the screen up to
     standard_notification_panel_width 416 dp less 2 x 8 dp, volume_dialog.xml inside it 8 dp from the sides
     (volume_dialog_background: system_primary_color, 2 dp corners, translationZ 4 dp), 8 dp padding above and below.
   - volume_dialog_row.xml per stream: the header (TextAppearance.Volume.Header 12 sp volume_slider_inactive #b0bec5, 4 dp
     above, 12 dp at the sides; the stream's title from volume_stream_titles, in English only in the image, combined with
     its state: "%s silent", "%s vibrate", "%s — Priority only" …), the 48 dp icon button (a click mutes or unmutes: the
     ring stream to vibrate and back), the SeekBar (max level x 100, 8 dp padding; the active row in system_accent_color,
     the others volume_slider_inactive), the 48 dp settings button (empty collapsed, ic_volume_settings expanded); the
     rows 8 dp apart (volume_slider_interspacing).
   - Collapsed only the active stream shows; the expand button (ic_volume_expand_animation / collapse, 48 dp) sits on the
     first row's settings button; expanded the important rows (ring, media) and the active one show, the inactive ones'
     headers at 0.5.
   - ZenFooter while Do not disturb is on and the active stream follows the ringer mode: the 1 dp divider (8 dp above, 12
     below), ic_dnd / ic_dnd_total_silence, the level (14 sp medium) over its end ("Until you turn off Do Not Disturb" or
     the countdown's time), END NOW in the accent.
   - It goes after computeTimeoutH: 3 s, 1.5 s for media, 5 s expanded; a touch outside closes it. */
(() => {
  'use strict';
  const A = name => `assets/${name}`;
  const T = () => MM.text('volume');
  const MAX = {voice: 7, ring: 7, music: 15, alarm: 7};
  const TYPE = {voice: 0, ring: 2, music: 3, alarm: 4};
  const ICONS = {ring: ['ic_volume_ringer', 'ic_volume_ringer_mute'], music: ['ic_volume_media', 'ic_volume_media_mute'],
    alarm: ['ic_volume_alarm', 'ic_volume_alarm_mute'], voice: ['ic_volume_voice', 'ic_volume_voice']};
  const IMPORTANT = {ring: true, music: true, alarm: false, voice: false};
  Object.assign(MM.defaults.settings, {volume: {voice: 5, ring: 5, music: 11, alarm: 6}, ringerMode: 'normal'});

  let layer = null, timer = 0;
  const st = {showing: false, expanded: false, active: 'ring'};

  const vol = c => c.data.settings.volume || (c.data.settings.volume = {voice: 5, ring: 5, music: 11, alarm: 6});
  function activeStream(c) { return c.ui.inCall ? 'voice' : c.ui.musicPlaying ? 'music' : 'ring'; }

  // VolumeDialog.updateVolumeRowH: the header, the icon and whether the slider follows.
  function rowState(c, stream) {
    const s = c.data.settings, t = T(), v = vol(c);
    const title = t.t('volume_stream_titles')[TYPE[stream]];
    const ring = stream === 'ring', vibrate = ring && s.ringerMode === 'vibrate';
    const zenMuted = ring && (s.zen === 2 || s.zen === 3), priority = ring && s.zen === 1;
    let header = title, icon = ICONS[stream][0], level = v[stream];
    if (s.zen === 2 && ring) { header = t.fmt('volume_stream_muted_dnd', null, title); icon = ICONS[stream][1]; level = 0; }
    else if (zenMuted) { header = t.fmt('volume_stream_muted', null, title); icon = ICONS[stream][1]; level = 0; }
    else if (vibrate && priority) { header = t.fmt('volume_stream_vibrate_dnd', null, title); icon = 'ic_volume_ringer_vibrate'; level = 0; }
    else if (vibrate) { header = t.fmt('volume_stream_vibrate', null, title); icon = 'ic_volume_ringer_vibrate'; level = 0; }
    else if (v[stream] === 0) { header = t.fmt('volume_stream_muted', null, title); icon = ICONS[stream][1]; }
    else if (priority) header = t.fmt('volume_stream_limited_dnd', null, title);
    return {header, icon, level, max: MAX[stream], enabled: !zenMuted};
  }

  function visibleRows(c) {
    const active = st.active;
    return ['ring', 'music', 'alarm', 'voice'].filter(id => id === active || (st.expanded && IMPORTANT[id]));
  }

  function footer(c) {
    const s = c.data.settings, t = T();
    if (!s.zen || st.active !== 'ring') return '';
    const line1 = t.t(s.zen === 2 ? 'interruption_level_none' : s.zen === 3 ? 'interruption_level_alarms' : 'interruption_level_priority');
    const line2 = s.zenUntil ? t.fmt('zen_mode_until', null, new Intl.DateTimeFormat(c.locale(), {hour: 'numeric', minute: '2-digit'}).format(new Date(s.zenUntil))) : t.t('zen_mode_forever_dnd');
    return `<div class="mmvol-zen"><i class="mmvol-divider"></i><div class="mmvol-zenrow"><img src="${A(`sui-${s.zen === 2 ? 'ic_dnd_total_silence' : 'ic_dnd'}.svg`)}" alt=""><div><div class="mmvol-zen1">${c.safe(line1)}</div><div class="mmvol-zen2">${c.safe(line2)}</div></div></div>
      <button type="button" class="mmvol-end" data-vol="end">${c.safe(t.t('volume_zen_end_now'))}</button></div>`;
  }

  function render(c) {
    const t = T(), rows = visibleRows(c);
    const html = rows.map((id, i) => {
      const r = rowState(c, id), value = r.level / r.max;
      return `${i ? '<i class="mmvol-space"></i>' : ''}<div class="mmvol-row${id === st.active ? ' active' : ''}${st.expanded && id !== st.active ? ' dim' : ''}" data-stream="${id}">
        <div class="mmvol-header">${c.safe(r.header)}</div>
        <div class="mmvol-line"><button type="button" class="mmvol-icon${r.enabled ? '' : ' off'}" data-vol="mute" aria-label="${c.safe(t.t('volume_stream_titles')[TYPE[id]])}"><img src="${A(`sui-${r.icon}.svg`)}" alt=""></button>
          <div class="mmvol-slider${r.enabled ? '' : ' off'}" style="--v:${value.toFixed(4)}"><i class="mmvol-track"></i><i class="mmvol-progress"></i><i class="mmvol-thumb"></i></div>
          <button type="button" class="mmvol-settings" data-vol="settings" ${st.expanded && i ? '' : 'tabindex="-1"'}>${st.expanded && i ? `<img src="${A('sui-ic_volume_settings.svg')}" alt="">` : ''}</button></div></div>`;
    }).join('');
    return `<div class="mmvol-dialog"><button type="button" class="mmvol-expand" data-vol="expand" aria-label="${c.safe(t.t(st.expanded ? 'accessibility_volume_collapse' : 'accessibility_volume_expand'))}"><img src="${A(`sui-${st.expanded ? 'ic_volume_collapse_animation' : 'ic_volume_expand_animation'}.svg`)}" alt=""></button>
      <div class="mmvol-content">${html}${footer(c)}</div></div>`;
  }

  function draw(c) {
    if (!layer) {
      layer = document.createElement('div'); layer.className = 'mmvol-layer'; c.el.screen.append(layer);
      layer.addEventListener('pointerdown', e => { if (e.target === layer) dismiss(c); });
      layer.addEventListener('click', e => onClick(c, e));
      layer.addEventListener('pointerdown', e => slide(c, e));
    }
    layer.innerHTML = render(c);
    layer.classList.add('open');
  }

  function rescheduleTimeout(c) {
    clearTimeout(timer);
    const ms = st.expanded ? 5000 : st.active === 'music' ? 1500 : 3000;
    timer = setTimeout(() => dismiss(c), ms);
  }
  function show(c) {
    st.active = activeStream(c);
    if (!st.showing) { st.showing = true; st.expanded = false; }
    draw(c); rescheduleTimeout(c);
  }
  function dismiss(c) {
    clearTimeout(timer);
    if (!layer || !st.showing) return;
    st.showing = false; st.expanded = false;
    layer.classList.remove('open');
    setTimeout(() => { if (!st.showing && layer) layer.innerHTML = ''; }, 300);
  }

  function setLevel(c, stream, level) {
    const s = c.data.settings, v = vol(c), max = MAX[stream];
    if (stream === 'ring') {
      if (level <= 0) { if (s.ringerMode === 'normal') { s.ringerMode = 'vibrate'; navigator.vibrate?.(100); } }
      else { s.ringerMode = 'normal'; v.ring = Math.min(max, level); }
    } else v[stream] = Math.max(0, Math.min(max, level));
    c.save(); MM.system?.changed(c);
  }

  function key(c, dir) {
    const stream = activeStream(c), s = c.data.settings, v = vol(c);
    if (!(stream === 'ring' && (s.zen === 2 || s.zen === 3))) {
      if (stream === 'ring' && s.ringerMode === 'vibrate') { if (dir > 0) setLevel(c, 'ring', 1); }
      else setLevel(c, stream, v[stream] + dir);
    }
    show(c);
  }

  function onClick(c, e) {
    const el = e.target.closest('[data-vol]'); if (!el) return;
    const what = el.dataset.vol, row = el.closest('.mmvol-row')?.dataset.stream, s = c.data.settings, v = vol(c);
    if (what === 'expand') { st.expanded = !st.expanded; draw(c); rescheduleTimeout(c); return; }
    if (what === 'settings') { dismiss(c); c.closeOverlay(); c.open('settings', 'sound'); return; }
    if (what === 'end') { MM.system.setZen(c, 0); draw(c); rescheduleTimeout(c); return; }
    if (what === 'mute' && row) {
      if (row === 'ring') {
        if (s.zen === 2 || s.zen === 3) return;
        if (s.ringerMode === 'normal') { s.ringerMode = 'vibrate'; navigator.vibrate?.(100); }
        else { s.ringerMode = 'normal'; if (!v.ring) v.ring = 1; }
        c.save(); MM.system?.changed(c);
      } else {
        st.lastAudible = st.lastAudible || {};
        if (v[row]) { st.lastAudible[row] = v[row]; v[row] = 0; } else v[row] = st.lastAudible[row] || 1;
        c.save();
      }
      draw(c); rescheduleTimeout(c);
    }
  }
  // Dragging a slider: the level VolumeDialog.getImpliedLevel gives the progress.
  function slide(c, e) {
    const slider = e.target.closest('.mmvol-slider'); if (!slider || slider.classList.contains('off')) return;
    const stream = slider.closest('.mmvol-row').dataset.stream, max = MAX[stream];
    e.preventDefault();
    try { slider.setPointerCapture(e.pointerId); } catch {}
    const move = ev => {
      const r = slider.getBoundingClientRect(), pad = 8 * c.el.screen.clientWidth / 411.4286;
      const frac = Math.min(1, Math.max(0, (ev.clientX - r.left - pad) / (r.width - 2 * pad)));
      const progress = frac * max * 100, level = progress === 0 ? 0 : progress >= max * 100 ? max : Math.floor(progress / (max * 100) * (max - 1)) + 1;
      slider.style.setProperty('--v', frac.toFixed(4));
      if (level !== (stream === 'ring' && c.data.settings.ringerMode === 'vibrate' ? 0 : vol(c)[stream])) {
        setLevel(c, stream, level);
        const r2 = rowState(c, stream), row = slider.closest('.mmvol-row');
        row.querySelector('.mmvol-header').textContent = r2.header;
        row.querySelector('.mmvol-icon img').src = A(`sui-${r2.icon}.svg`);
      }
      rescheduleTimeout(c);
    };
    move(e);
    const up = () => { slider.removeEventListener('pointermove', move); draw(c); };
    slider.addEventListener('pointermove', move);
    slider.addEventListener('pointerup', up, {once: true}); slider.addEventListener('pointercancel', up, {once: true});
  }

  MM.register('volume', {
    app: false,
    render: () => '',
    key(c, dir) { if (c.ui.power) return; key(c, dir); },
    init(c) {
      MM.volume = {dismiss: () => dismiss(c), ringerMode: () => c.data.settings.ringerMode};
    }
  });
})();
