/* Android 2.1 in-call screen: Phone.apk's InCallScreen (incall_screen.xml, padding 6 / 10 / 6 dp) with CallCard
   (call_card.xml, call_card_person_info.xml) and InCallTouchUi (incall_touch_ui.xml).
   - CallCard: the state over the call (upperTitle 28 sp: card_title_dialing / card_title_in_progress /
     card_title_call_ended), the 172 x 166 dp photo on incall_photo_border_lg (picture_unknown without one) with the
     elapsed time (15 sp bold, DateUtils.formatElapsedTime) at its lower right, the name (28 sp; the number when there is no
     contact; "Voicemail" for the voicemail number) and the number type + number (18 sp secondary). The whole screen takes
     bg_in_call_gradient_unidentified while dialing, _connected while active, _ended after.
   - InCallTouchUi bottom buttons (padding 4 dp, 8 dp margins, InCallTouchButton on incall_button, 14 sp): Add call, End
     (#ff6072), Dialpad / Hide (ic_in_call_touch_dialpad / _close, set in code); toggles on incall_toggle_button (the
     btn_in_call_switch_on / _off bars): Bluetooth (off, no headset), Mute, Speaker.
   - Dialpad: non_drawer_dialpad.xml, the DTMF field (24 sp, 32 dp high, 32 dp side margins) over the keypad.
   - The call is simulated: the other side answers after 2.5 s; End shows "Call ended" for CALL_ENDED_LONG_DELAY 2 s and
     goes back. While the call lasts, Phone's NotificationMgr shows the ongoing "Current call" (stat_sys_phone_call). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const I = () => EC.text('incall');
  const VOICEMAIL = '+18056377243';
  let call = null, timer = 0;
  const digitsOnly = n => String(n).replace(/[^\d+]/g, '');
  const elapsed = s => { const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, ss = String(s % 60).padStart(2, '0'); return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`; };
  const seconds = () => call?.start ? Math.floor(((call.end || Date.now()) - call.start) / 1000) : 0;

  function start(c, number) {
    clearInterval(timer);
    const person = (c.data.contacts || []).find(p => digitsOnly(p.phone) === digitsOnly(number));
    call = {number, person, state: 'dialing', start: 0, end: 0, mute: false, speaker: false, dialpad: false, dtmf: '', logId: c.data.calls?.[0]?.id};
    setTimeout(() => { if (call?.state === 'dialing' && call.number === number) { call.state = 'active'; call.start = Date.now(); refresh(c); } }, 2500);
    timer = setInterval(() => { if (call?.state === 'active') updateTime(c); }, 1000);
    notifyOngoing(c);
  }
  function notifyOngoing(c) {
    c.cancelNotification?.('incall');
    c.notify?.({id: 'incall', icon: 'fw-stat_sys_phone_call.png', title: I().t('ongoing'), text: name(c), ongoing: true, view: 'incall'});
  }
  function name(c) {
    if (!call) return '';
    if (digitsOnly(call.number) === digitsOnly(VOICEMAIL)) return I().t('voicemail');
    return call.person ? call.person.name : call.number;
  }
  function end(c) {
    if (!call || call.state === 'ended') return;
    call.end = Date.now(); call.state = 'ended';
    const row = (c.data.calls || []).find(x => x.id === call.logId);
    if (row) row.duration = seconds();
    c.cancelNotification?.('incall'); c.save();
    clearInterval(timer);
    refresh(c);
    setTimeout(() => { call = null; if (c.ui.view === 'incall') c.back(); }, 2000);
  }
  function refresh(c) { if (c.ui.view === 'incall') c.render(); }
  function updateTime(c) { const el = c.el.viewport.querySelector('.ecic-time'); if (el) el.textContent = elapsed(seconds()); }

  const KEYS = [['1', '1_no_vm'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['6', '6'], ['7', '7'], ['8', '8'], ['9', '9'], ['*', 'star'], ['0', '0'], ['#', 'pound']];
  function render(c) {
    if (!call) return '<div class="ecic ecic-ended"></div>';
    const types = EC.text('contacts').t('phoneTypes'), vm = digitsOnly(call.number) === digitsOnly(VOICEMAIL);
    const title = I().t({dialing: 'card_title_dialing', active: 'card_title_in_progress', ended: 'card_title_call_ended'}[call.state]);
    const bg = {dialing: 'unidentified', active: 'connected', ended: 'ended'}[call.state];
    const card = call.dialpad ? `<div class="ecic-dtmf"><div class="ecic-field">${esc(call.dtmf)}</div><div class="ecic-pad">${KEYS.map(([k, img]) => `<button type="button" class="ecph-key" data-action="ecic-key" data-key="${k}"><i class="ec-bg np-ct-btn_dial_normal"></i><i class="ec-bg ec-pressed np-ct-btn_dial_pressed"></i><img class="wht" src="assets/ct-dial_num_${img}_wht.png" alt="${k}"><img class="blk" src="assets/ct-dial_num_${img}_blk.png" alt=""></button>`).join('')}</div></div>`
      : `<div class="ecic-card"><div class="ecic-title">${esc(title)}</div>
        <div class="ecic-photo-row"><span class="ecic-photo npp-pn-incall_photo_border_lg"><i class="ec-bg np-pn-incall_photo_border_lg"></i><img src="assets/pn-picture_unknown.png" alt=""></span>${call.state !== 'dialing' ? `<span class="ecic-time">${esc(elapsed(seconds()))}</span>` : ''}</div>
        <div class="ecic-name">${esc(name(c))}</div>
        ${call.person ? `<div class="ecic-number"><span>${esc(types[call.person.phoneType ?? 1])}</span>${esc(call.person.phone)}</div>` : vm ? '' : ''}</div>`;
    const btn = (id, label, icon, extra = '') => `<button type="button" class="ecic-btn npp-pn-btn_in_call_main_normal ${extra}" data-action="ecic-${id}"${call.state === 'ended' ? ' disabled' : ''}><i class="ec-bg np-pn-btn_in_call_main_normal"></i><i class="ec-bg ec-pressed np-pn-btn_in_call_main_pressed"></i>${icon ? `<img src="assets/pn-${icon}.png" alt="">` : ''}<span>${esc(label)}</span></button>`;
    const toggle = (id, label, on, off) => `<button type="button" class="ecic-btn ecic-toggle npp-pn-btn_in_call_switch_off_normal" data-action="ecic-${id}"${off || call.state === 'ended' ? ' disabled' : ''}><i class="ec-bg np-pn-btn_in_call_switch_${on ? 'on' : 'off'}_normal"></i><i class="ec-bg ec-pressed np-pn-btn_in_call_switch_${on ? 'on' : 'off'}_pressed"></i><span>${esc(label)}</span></button>`;
    return `<div class="ecic"><i class="ecic-bg np-pn-bg_in_call_gradient_${bg}"></i>
      <div class="ecic-main">${card}</div>
      <div class="ecic-buttons"><div class="ecic-row">${btn('add', I().t('onscreenAddCallText'), 'ic_in_call_touch_add_call')}${btn('end', I().t('onscreenEndCallText'), 'ic_in_call_touch_end', 'end')}${btn('dialpad', I().t(call.dialpad ? 'onscreenHideDialpadText' : 'onscreenShowDialpadText'), call.dialpad ? 'ic_in_call_touch_dialpad_close' : 'ic_in_call_touch_dialpad')}</div>
        <div class="ecic-row">${toggle('bt', I().t('onscreenBluetoothText'), false, true)}${toggle('mute', I().t('onscreenMuteText'), call.mute)}${toggle('speaker', I().t('onscreenSpeakerText'), call.speaker)}</div></div></div>`;
  }
  EC.register('incall', {
    title: 'Phone',
    noStatus: () => false,
    active: () => call?.state === 'active',   // for BatteryStats' phone on time
    init(c) {
      // Dialtacts puts the number in ui.callNumber and opens this screen.
      const open = c.open;
      c.open = (view, sub, opts) => { if (view === 'incall' && c.ui.callNumber) { start(c, c.ui.callNumber); c.ui.callNumber = null; } return open(view, sub, opts); };
    },
    render,
    action(name, el, event, c) {
      if (!call) return false;
      switch (name) {
        case 'ecic-end': end(c); return true;
        case 'ecic-dialpad': call.dialpad = !call.dialpad; refresh(c); return true;
        case 'ecic-mute': call.mute = !call.mute; refresh(c); return true;
        case 'ecic-speaker': call.speaker = !call.speaker; refresh(c); return true;
        case 'ecic-add': c.back(); return true;
        case 'ecic-key': call.dtmf += el.dataset.key; const f = c.el.viewport.querySelector('.ecic-field'); if (f) f.textContent = call.dtmf; return true;
      }
      return false;
    },
    // Back leaves the call running behind its notification.
    back: () => false
  });
})();
