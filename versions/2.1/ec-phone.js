/* Android 2.1 Phone and Contacts: Contacts.apk's DialtactsActivity (dialer_activity.xml), a TabHost with Phone / Call log /
   Contacts / Favorites (framework tab_indicator.xml: 64 dp, the icon over 14 sp text, white when selected else #808080;
   tab_selected / tab_unselected / tab_press, -3 dp margins; TabWidget draws tab_selected_bar_left / _right under the
   others). The Phone launcher icon opens the last phone tab, Contacts the contact list.
   - TwelveKeyDialer (layout-long-finger/twelve_key_dialer.xml): the 74 dp digits field (btn_dial_textfield, 34 sp, white,
     no cursor), dialpad.xml (ButtonGridLayout, padding 7 / 6 dp, 88 x 58 dp btn_dial keys with dial_num_*_wht, _blk when
     pressed) and voicemail_dial_delete.xml (voicemail 87 dp, call 116 dp, delete 87 dp, btn_dial_action_left / middle /
     right, off while there is nothing to call or delete). A key plays its DTMF tone for TONE_LENGTH_MS 150 and buzzes
     with haptic feedback; 0 held is "+", 1 held calls voicemail, delete held clears. Calling with no digits plays
     TONE_PROP_NACK. Menu: Add to contacts, Add 2-sec pause, Wait (with digits).
   - RecentCallsListActivity (recent_calls_list_item.xml): the name (22 sp) or number, the number type label (14 sp bold)
     and number, the call type icon and the time (DateUtils.getRelativeTimeSpanString, abbreviated), a call button
     (sym_action_call on call_background) behind divider_vertical_dark; "Call log is empty."; menu: Clear call log.
   - ContactsListActivity (contacts_list_item_photo.xml): letter sections (list_section: dark_header 25 dp, 14 sp bold
     #bebebe in 56 dp), the QuickContactBadge (50 x 56 dp, quickcontact_badge) with ic_contact_list_picture, the name in
     22 sp; menu: Search, New contact, Display options, Accounts, Import/Export. Favorites: Starred, then Frequent.
   The contacts and the call log are made up (the same people as the 2.3.6 simulator's). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const P = () => EC.text('contacts');
  const H = 3600000, D = 24 * H;
  EC.defaults.contacts = [
    {id: 1, name: 'Alex Morgan', phone: '202-555-0148', phoneType: 1, email: 'alex@example.com', starred: false, times: 4},
    {id: 2, name: 'Sam Rivera', phone: '202-555-0192', phoneType: 1, email: 'sam@example.com', starred: false, times: 2},
    {id: 3, name: 'Taylor Lee', phone: '202-555-0116', phoneType: 2, email: 'taylor@example.com', starred: false, times: 0},
    {id: 4, name: 'Mom', phone: '202-555-0107', phoneType: 0, email: 'mom@example.com', starred: true, times: 6}
  ];
  // CallLog.Calls TYPE: 1 incoming, 2 outgoing, 3 missed; dates are offsets from the first start, fixed then.
  EC.defaults.calls = [
    {id: 1, number: '202-555-0148', type: 3, ago: 0.35 * H, duration: 0},
    {id: 2, number: '202-555-0107', type: 2, ago: 1.1 * D, duration: 312},
    {id: 3, number: '202-555-0192', type: 1, ago: 2.3 * D, duration: 95},
    {id: 4, number: '202-555-0173', type: 1, ago: 3.5 * D, duration: 41},
    {id: 5, number: '202-555-0107', type: 1, ago: 9 * D, duration: 640}
  ];
  const VOICEMAIL = '+18056377243';   // T-Mobile US voicemail access number (the SIM's)
  const TABS = [['dialer', 'dialerIconLabel', 'dialer'], ['calls', 'recentCallsIconLabel', 'recent'], ['contacts', 'contactsIconLabel', 'contacts'], ['favorites', 'contactsFavoritesLabel', 'starred']];
  const digitsOnly = n => String(n).replace(/[^\d+]/g, '');
  // PhoneNumberUtils.formatNanpNumber (the dialer's PhoneNumberFormattingTextWatcher): xxx-xxxx, xxx-xxx-xxxx,
  // 1-xxx-xxx-xxxx as the digits come; anything else (+, *, #, pauses, over 11 digits) stays as typed.
  EC.formatNumber = text => {
    const s = String(text);
    if (!/^\d*$/.test(s)) return s;
    const one = s.length > 10 && s[0] === '1', d = one ? s.slice(1) : s;
    if (d.length > 10 || (s.length > 10 && !one)) return s;
    const out = d.length <= 3 ? d : d.length <= 7 ? `${d.slice(0, 3)}-${d.slice(3)}` : `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
    return one ? `1-${out}` : out;
  };
  const contactFor = (c, number) => (c.data.contacts || []).find(p => EC.contactModel.raws(p).some(r => (r.phone || []).some(x => digitsOnly(x.value) === digitsOnly(number))));

  // DTMF: the two tones of each key (ToneGenerator), TONE_LENGTH_MS 150, quieter than full scale (TONE_RELATIVE_VOLUME 50).
  const DTMF = {1: [697, 1209], 2: [697, 1336], 3: [697, 1477], 4: [770, 1209], 5: [770, 1336], 6: [770, 1477], 7: [852, 1209], 8: [852, 1336], 9: [852, 1477], '*': [941, 1209], 0: [941, 1336], '#': [941, 1477]};
  let audio = null;
  function tone(freqs, ms = 150) {
    try {
      audio ||= new AudioContext();
      const gain = audio.createGain(); gain.gain.value = 0.08; gain.connect(audio.destination);
      for (const f of freqs) { const o = audio.createOscillator(); o.frequency.value = f; o.connect(gain); o.start(); o.stop(audio.currentTime + ms / 1000); }
    } catch {}
  }
  const nack = () => { tone([400], 200); setTimeout(() => tone([400], 200), 300); };   // TONE_PROP_NACK

  // DateUtils.getRelativeTimeSpanString(time, now, MINUTE, FORMAT_ABBREV_RELATIVE).
  function relative(c, when) {
    const now = Date.now(), d = Math.max(0, now - when);
    if (d < H) return P().plural('abbrev_num_minutes_ago', Math.floor(d / 60000));
    if (d < D) return P().plural('abbrev_num_hours_ago', Math.floor(d / H));
    const days = Math.round((new Date(now).setHours(0, 0, 0, 0) - new Date(when).setHours(0, 0, 0, 0)) / D);
    if (days < 7) return P().plural('abbrev_num_days_ago', days);
    return new Date(when).toLocaleDateString(c.locale(), {month: 'short', day: 'numeric'});
  }

  // Tabs ------------------------------------------------------------------------------------------------------------------
  function tabs(c, current) {
    const i = TABS.findIndex(t => t[0] === current);
    return `<div class="ecph-tabs">${TABS.map(([id, label, icon], n) => `<button type="button" class="ecph-tab${n === i ? ' on' : ''}" data-action="ecph-tab" data-tab="${id}"><i class="ec-bg np-fw-tab_${n === i ? 'selected' : 'unselected'}"></i><i class="ec-bg ec-pressed np-fw-tab_press"></i><img src="assets/ct-ic_tab_${n === i ? 'selected' : 'unselected'}_${icon}.png" alt=""><span>${esc(P().t(label))}</span></button>`).join('')}
      <i class="ecph-bar left np-fw-tab_selected_bar_left" style="width:${i * 25}%"></i><i class="ecph-bar right np-fw-tab_selected_bar_right" style="width:${(3 - i) * 25}%"></i></div>`;
  }

  // Dialer ----------------------------------------------------------------------------------------------------------------
  const KEYS = [['1', '1_no_vm'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['6', '6'], ['7', '7'], ['8', '8'], ['9', '9'], ['*', 'star'], ['0', '0'], ['#', 'pound']];
  function dialer(c) {
    const digits = c.ui.dialDigits || '';
    const keys = KEYS.map(([k, img]) => `<button type="button" class="ecph-key" data-action="ecph-key" data-key="${k}"><i class="ec-bg np-ct-btn_dial_normal"></i><i class="ec-bg ec-pressed np-ct-btn_dial_pressed"></i><img class="wht" src="assets/ct-dial_num_${img}_wht.png" alt="${k}"><img class="blk" src="assets/ct-dial_num_${img}_blk.png" alt=""></button>`).join('');
    const act = (pos, id, icon, on) => `<button type="button" class="ecph-act ${pos}" data-action="ecph-${id}"${on ? '' : ' disabled'}><i class="ec-bg np-ct-btn_dial_action_${pos}_${on ? 'normal' : 'disable'}"></i>${on ? `<i class="ec-bg ec-pressed np-ct-btn_dial_action_${pos}_pressed"></i>` : ''}<img src="assets/ct-ic_dial_action_${icon}.png" alt=""></button>`;
    return `<div class="ecph-dialer"><div class="ecph-digits"><i class="ec-bg np-ct-btn_dial_textfield_normal"></i><span>${esc(EC.formatNumber(digits))}</span></div>
      <div class="ecph-pad">${keys}</div>
      <div class="ecph-actions">${act('left', 'voicemail', 'voice_mail', true)}${act('middle', 'call', 'call', true)}${act('right', 'delete', 'delete', !!digits)}</div></div>`;
  }
  function setDigits(c, value) {
    c.ui.dialDigits = value;
    const span = c.el.viewport.querySelector('.ecph-digits span');
    if (span) { span.textContent = EC.formatNumber(value); const del = c.el.viewport.querySelector('[data-action="ecph-delete"]'); if (!!value !== !del.disabled) c.render(); }
  }
  function press(c, key) {
    tone(DTMF[key]);
    if (c.data.prefs?.haptic_feedback !== false) navigator.vibrate?.(30);
    setDigits(c, (c.ui.dialDigits || '') + key);
  }
  // Placing a call: Phone.apk's InCallScreen (ec-incall.js when it is there).
  function call(c, number) {
    if (!number) { nack(); return; }
    const p = contactFor(c, number);
    c.data.calls = [{id: Date.now(), number: EC.formatNumber(number), type: 2, when: Date.now(), duration: 0}, ...(c.data.calls || [])];
    if (p) p.times = (p.times || 0) + 1;
    c.save();
    c.ui.callNumber = EC.formatNumber(number); c.open('incall');
  }

  // Call log --------------------------------------------------------------------------------------------------------------
  function callRows(c) {
    const list = (c.data.calls || []).map(x => ({...x, when: x.when ?? (c.data.callsBase || Date.now()) - x.ago}));
    if (!list.length) return `<div class="ecph-empty">${esc(P().t('recentCalls_empty'))}</div>`;
    const icons = {1: 'incoming', 2: 'outgoing', 3: 'missed'};
    return list.sort((a, b) => b.when - a.when).map(x => {
      const p = contactFor(c, x.number), entry = p && EC.contactModel.raws(p).flatMap(r => r.phone || []).find(y => digitsOnly(y.value) === digitsOnly(x.number));
      const label = entry ? EC.contactModel.typeLabel('phone', entry) : '';
      return `<div class="ecph-call"><button type="button" class="ecph-call-main" data-action="ecph-calldetail" data-id="${x.id}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i>
          <span class="ecph-line1">${esc(p ? p.name : x.number)}</span>
          <span class="ecph-line2">${p ? `<b>${esc(label)}</b><span>${esc(x.number)}</span>` : ''}</span>
          <img class="ecph-type" src="assets/ct-ic_call_log_list_${icons[x.type]}_call.png" alt=""><span class="ecph-date">${esc(relative(c, x.when))}</span></button>
        <i class="ecph-vdiv"></i><button type="button" class="ecph-callbtn" data-action="ecph-dial" data-number="${esc(x.number)}"><img src="assets/fw-sym_action_call.png" alt=""></button></div><i class="ecph-div"></i>`;
    }).join('');
  }

  // Contacts and favorites -------------------------------------------------------------------------------------------------
  // QuickContactBadge: the contact's photo, else ic_contact_list_picture.
  const badge = p => { const photo = EC.contactModel.photoOf(p); return `<span class="ecph-badge"><i class="ec-bg np-fw-quickcontact_badge_unpressed"></i>${photo ? `<span class="ecph-photo" style="${EC.contactModel.photoCss(photo)}"></span>` : '<img src="assets/ct-ic_contact_list_picture.png" alt="">'}</span>`; };
  function contactRows(c, list, sections) {
    let last = '';
    return list.map(p => {
      const letter = (p.name[0] || '#').toLocaleUpperCase(c.locale());
      const head = sections && letter !== last ? `<div class="ecph-section"><i class="ec-bg np-fw-dark_header"></i><span>${esc(letter)}</span></div>` : '';
      last = letter;
      return `${head}<button type="button" class="ecph-person" data-action="ecph-person" data-id="${p.id}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i>${badge(p)}<span class="ecph-name">${esc(p.name)}</span></button><i class="ecph-div opaque"></i>`;
    }).join('');
  }
  const byName = c => (c.data.contacts || []).slice().sort((a, b) => a.name.localeCompare(b.name, c.locale()));
  function contacts(c) {
    // Display options' only_phones keeps the contacts that have a number.
    const only = EC.contactsOnlyPhones?.(c), list = byName(c).filter(p => !only || p.phone);
    return list.length ? `<div class="ecph-list">${contactRows(c, list, true)}</div>` : `<div class="ecph-empty top">${esc(only ? EC.text('contactsio').t('noContactsWithPhoneNumbers') : P().t('noContacts'))}</div>`;
  }
  function favorites(c) {
    const starred = byName(c).filter(p => p.starred), frequent = (c.data.contacts || []).filter(p => !p.starred && p.times > 0).sort((a, b) => b.times - a.times);
    if (!starred.length && !frequent.length) return `<div class="ecph-empty top">${esc(P().t('noFavorites'))}</div>`;
    const sep = key => `<div class="ecph-sep"><i class="ec-bg np-fw-dark_header"></i><span>${esc(P().t(key))}</span></div>`;
    return `<div class="ecph-list">${starred.length ? sep('starredList') + contactRows(c, starred, false) : ''}${frequent.length ? sep('frequentList') + contactRows(c, frequent, false) : ''}</div>`;
  }

  function render(c) {
    const tab = c.ui.phoneTab || 'dialer';
    const body = tab === 'dialer' ? dialer(c) : tab === 'calls' ? `<div class="ecph-list">${callRows(c)}</div>` : tab === 'contacts' ? contacts(c) : favorites(c);
    return `<div class="ecph">${tabs(c, tab)}<div class="ecph-body">${body}</div></div>`;
  }
  function mount(c, root) {
    if (!c.data.callsBase) { c.data.callsBase = Date.now(); c.save(); }
    // Held keys: 0 → "+", 1 → voicemail, delete → clear.
    for (const el of root.querySelectorAll('[data-key="0"], [data-key="1"], [data-action="ecph-delete"]')) {
      let timer = 0;
      el.addEventListener('pointerdown', () => { timer = setTimeout(() => {
        c.suppressClick = Date.now() + 400;
        if (el.dataset.key === '0') { tone(DTMF[0]); setDigits(c, (c.ui.dialDigits || '') + '+'); }
        else if (el.dataset.key === '1') call(c, VOICEMAIL);
        else { setDigits(c, ''); c.render(); }
      }, 500); });
      for (const t of ['pointerup', 'pointerleave', 'pointercancel']) el.addEventListener(t, () => clearTimeout(timer));
    }
  }
  const spec = tabFor => ({
    title: 'Phone',
    render, mount,
    action(name, el, event, c) {
      if (!name.startsWith('ecph-')) return false;
      if ((c.suppressClick || 0) > Date.now()) return true;
      switch (name) {
        case 'ecph-tab': c.ui.phoneTab = el.dataset.tab; if (el.dataset.tab !== 'contacts') c.ui.lastPhoneTab = el.dataset.tab; c.render(); break;
        case 'ecph-key': press(c, el.dataset.key); break;
        case 'ecph-delete': setDigits(c, (c.ui.dialDigits || '').slice(0, -1)); break;
        case 'ecph-call': call(c, c.ui.dialDigits || ''); break;
        case 'ecph-voicemail': call(c, VOICEMAIL); break;
        case 'ecph-dial': call(c, el.dataset.number); break;
        case 'ecph-calldetail': { const x = (c.data.calls || []).find(y => String(y.id) === el.dataset.id); if (x) call(c, x.number); break; }
        case 'ecph-person': c.ui.contactId = Number(el.dataset.id); c.open('contact-view'); break;
      }
      return true;
    },
    menu(c) {
      const tab = c.ui.phoneTab || 'dialer', F = EC.text('framework');
      if (tab === 'dialer') {
        if (!c.ui.dialDigits) return true;
        c.menu([{label: P().t('recentCalls_addToContact'), icon: 'fw-ic_menu_add.png', action: () => EC.contactPick(c, c.ui.dialDigits)},
          {label: P().t('add_2sec_pause'), icon: 'ct-ic_menu_2sec_pause.png', action: () => setDigits(c, c.ui.dialDigits + ',')},
          {label: P().t('wait'), icon: 'ct-ic_menu_wait.png', action: () => setDigits(c, c.ui.dialDigits + ';')}]);
      } else if (tab === 'calls') {
        if (!(c.data.calls || []).length) return true;
        c.menu([{label: P().t('recentCalls_deleteAll'), icon: 'fw-ic_menu_delete.png', action: () => { c.data.calls = []; c.save(); c.render(); }}]);
      } else {
        c.menu([{label: P().t('menu_search'), icon: 'fw-ic_menu_search.png', action: () => c.open('search')},
          {label: P().t('menu_newContact'), icon: 'fw-ic_menu_add.png', action: () => EC.contactEdit.open(c, null)},
          {label: P().t('menu_displayGroup'), icon: 'fw-ic_menu_allfriends.png', action: () => c.open('contacts-display')},
          {label: P().t('menu_accounts'), icon: 'ct-ic_menu_account_list.png', action: () => c.open('settings')},
          {label: P().t('menu_import_export'), icon: 'ct-ic_menu_import_export.png', action: () => EC.contactsIO.importExport(c)}]);
      }
      return true;
    },
    // Launching: Phone opens its last tab, Contacts the list.
    enter(c) { c.ui.phoneTab = tabFor === 'contacts' ? 'contacts' : (c.ui.lastPhoneTab || 'dialer'); }
  });
  // ViewContactActivity (contact_card_layout.xml): ContactHeaderWidget (title_bar_medium; the QuickContactBadge, the name
  // in 18 sp bold with a #bb000000 shadow, the btn_star checkbox) over the data list (list_item_text_icons.xml on
  // title_bar_shadow: the action header in 22 sp over the data in 14 sp, the kind's icon at the right). buildEntries puts
  // the rows in sections, in this order: phones ("Call mobile", with the Text button sym_action_sms behind
  // divider_vertical_dark — mShowSmsLinksForAllPhones is on), emails ("Email home"), IM ("Chat using AIM"), postal
  // addresses ("View home address", 4 lines), organizations (company over title) and nicknames, then notes (10 lines) and
  // websites. Phones call, emails write, Google Talk opens Talk, addresses Maps, websites the Browser; the rest do nothing.
  // Menu (menu/view.xml): Edit contact, Share, Options, Delete contact (deleteConfirmation).
  const PHONE_CALL = {1: 'call_home', 2: 'call_mobile', 3: 'call_work', 4: 'call_fax_work', 5: 'call_fax_home', 6: 'call_pager', 7: 'call_other', 8: 'call_callback', 9: 'call_car',
    10: 'call_company_main', 11: 'call_isdn', 12: 'call_main', 13: 'call_other_fax', 14: 'call_radio', 15: 'call_telex', 16: 'call_tty_tdd', 17: 'call_work_mobile', 18: 'call_work_pager', 19: 'call_assistant', 20: 'call_mms'};
  const EMAIL = {1: 'email_home', 2: 'email_work', 3: 'email_other', 4: 'email_mobile'}, MAP = {1: 'map_home', 2: 'map_work', 3: 'map_other'};
  const CHAT = ['chat_aim', 'chat_msn', 'chat_yahoo', 'chat_skype', 'chat_qq', 'chat_gtalk', 'chat_icq', 'chat_jabber'];
  // StructuredPostal's formatted address (the provider's PostalSplitter.join): street, PO box, neighborhood,
  // "city, region postcode", country, a line each.
  const postalText = x => [x.street, x.pobox, x.neighborhood, [x.city, [x.region, x.postcode].filter(Boolean).join(' ')].filter(Boolean).join(', '), x.country].map(v => String(v || '').trim()).filter(Boolean).join('\n');
  function entries(c, p) {
    const raws = EC.contactModel.raws(p), all = kind => raws.flatMap(r => r[kind] || []), E = EC.text('contactedit');
    // CommonInflater: a custom type (and Assistant) puts its label into the "… %s" string.
    const fmt = (key, label) => P().fmt(key, c.lang, label || '');
    const out = [];
    for (const x of all('phone')) out.push({head: PHONE_CALL[x.type] ? (x.type === 19 ? fmt('call_assistant', x.label) : P().t(PHONE_CALL[x.type])) : fmt('call_custom', x.label), body: x.value, icon: 'fw-sym_action_call.png', action: 'eccv-call', value: x.value, sms: true});
    for (const x of all('email')) out.push({head: EMAIL[x.type] ? P().t(EMAIL[x.type]) : fmt('email_custom', x.label), body: x.value, icon: 'fw-sym_action_email.png', action: 'eccv-email', value: x.value});
    for (const x of all('im')) out.push({head: P().t(CHAT[x.type] || 'chat'), body: x.value, icon: 'fw-sym_action_chat.png', action: x.type === 5 ? 'eccv-talk' : 'eccv-none', value: x.value});
    for (const x of all('postal')) out.push({head: MAP[x.type] ? P().t(MAP[x.type]) : fmt('map_custom', x.label), body: postalText(x), lines: 4, icon: 'ct-sym_action_map.png', action: 'eccv-map', value: postalText(x)});
    for (const x of all('org')) out.push({head: x.company || '', body: x.title || '', icon: 'ct-sym_action_organization.png', action: 'eccv-none'});
    for (const x of all('nickname')) out.push({head: E.t('nicknameLabelsGroup'), body: x.value, action: 'eccv-none'});
    for (const x of all('note')) out.push({head: E.t('label_notes'), body: x.value, lines: 10, icon: 'ct-sym_note.png', action: 'eccv-none'});
    for (const x of all('website')) out.push({head: E.t('websiteLabelsGroup'), body: x.value, action: 'eccv-web', value: x.value});
    return out;
  }
  function contactView(c) {
    const p = (c.data.contacts || []).find(x => x.id === c.ui.contactId);
    if (!p) return '';
    const sms = value => `<i class="ecph-vdiv"></i><button type="button" class="eccv-sms" data-action="eccv-sms" data-value="${esc(value)}"><img src="assets/ct-sym_action_sms.png" alt=""></button>`;
    const rows = entries(c, p).map(e => `<div class="eccv-row"><button type="button" class="eccv-main" data-action="${e.action}" data-value="${esc(e.value || '')}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span class="eccv-text"><span class="eccv-t1">${esc(e.head)}</span><span class="eccv-t2${e.lines ? ' multi' : ''}"${e.lines ? ` style="-webkit-line-clamp:${e.lines}"` : ''}>${esc(e.body)}</span></span>${e.icon ? `<img class="eccv-act" src="assets/${e.icon}" alt="">` : ''}</button>${e.sms ? sms(e.value) : ''}</div><i class="ecph-div"></i>`).join('');
    return `<div class="eccv"><div class="eccv-head"><i class="ec-bg np-fw-title_bar_medium"></i>${badge(p)}<span class="eccv-name">${esc(p.name)}</span>
        <button type="button" class="eccv-star" data-action="eccv-star"><img src="assets/fw-btn_star_big_${p.starred ? 'on' : 'off'}.png" alt=""></button></div>
      <div class="eccv-list"><i class="eccv-shadow np-ct-title_bar_shadow"></i>${rows || `<div class="ecph-empty top">${esc(P().t('no_contact_details'))}</div>`}</div></div>`;
  }
  EC.register('contact-view', {
    title: 'Contacts',
    render: contactView,
    action(name, el, event, c) {
      const p = (c.data.contacts || []).find(x => x.id === c.ui.contactId);
      if (!p || !name.startsWith('eccv-')) return false;
      const value = el.dataset.value;
      if (name === 'eccv-star') { p.starred = !p.starred; c.save(); c.render(); }
      else if (name === 'eccv-call') call(c, value);
      else if (name === 'eccv-sms') { c.ui.composeTo = value; c.open('messaging'); }
      else if (name === 'eccv-email') { c.ui.composeTo = value; c.open('email'); }
      else if (name === 'eccv-talk') c.open('talk');
      else if (name === 'eccv-map') c.open('maps');
      else if (name === 'eccv-web') { const url = /^[a-z]+:/i.test(value) ? value : `http://${value}`; c.ui.browserGo = url; c.open('browser'); }
      return true;
    },
    menu(c) {
      const p = (c.data.contacts || []).find(x => x.id === c.ui.contactId), F = EC.text('framework');
      c.menu([{label: P().t('menu_editContact'), icon: 'fw-ic_menu_edit.png', action: () => EC.contactEdit.open(c, p.id)},
        {label: P().t('menu_share'), icon: 'fw-ic_menu_share.png', action: () => EC.contactsIO.share(c)},
        {label: P().t('menu_contactOptions'), icon: 'ct-ic_menu_mark.png', action: () => c.open('contact-options')},
        {label: P().t('menu_deleteContact'), icon: 'fw-ic_menu_delete.png', action: () => c.dialog({title: P().t('deleteConfirmation_title'), icon: 'fw-ic_dialog_alert.png', message: P().t('deleteConfirmation'),
          buttons: [{label: F.t('ok'), action: () => { c.data.contacts = c.data.contacts.filter(x => x !== p); c.save(); c.back(); }}, {label: F.t('cancel')}]})}]);
      return true;
    }
  });
  // EmergencyDialer (emergency_dialer.xml, layout-long-finger: the 74 dp digits field in 34 sp over dialpad.xml and
  // voicemail_dial_delete.xml), from the lock screen's Emergency call (FLAG_SHOW_WHEN_LOCKED). Its onCreate turns the
  // voicemail button off; dial and delete are on only with digits; holding 0 gives "+", holding delete clears.
  // placeCall: 112 and 911 (PhoneNumberUtils.isEmergencyNumber without ril.ecclist) go out as CALL_EMERGENCY; any other
  // number gives the "Emergency call" dialog ("Call not sent, … is not an emergency number!", or "… please dial an
  // emergency number!" with none). After the call the keyguard is back.
  const I = () => EC.text('incall');
  function emergencyDialer(c) {
    const digits = c.ui.emergencyDigits || '';
    const keys = KEYS.map(([k, img]) => `<button type="button" class="ecph-key" data-action="eced-key" data-key="${k}"><i class="ec-bg np-ct-btn_dial_normal"></i><i class="ec-bg ec-pressed np-ct-btn_dial_pressed"></i><img class="wht" src="assets/ct-dial_num_${img}_wht.png" alt="${k}"><img class="blk" src="assets/ct-dial_num_${img}_blk.png" alt=""></button>`).join('');
    const act = (pos, id, icon, on) => `<button type="button" class="ecph-act ${pos}" data-action="eced-${id}"${on ? '' : ' disabled'}><i class="ec-bg np-ct-btn_dial_action_${pos}_${on ? 'normal' : 'disable'}"></i>${on ? `<i class="ec-bg ec-pressed np-ct-btn_dial_action_${pos}_pressed"></i>` : ''}<img src="assets/ct-ic_dial_action_${icon}.png" alt=""></button>`;
    return `<div class="eced">${c.window(I().t('emergencyDialerIconLabel'), `<div class="ecph-dialer"><div class="ecph-digits"><i class="ec-bg np-ct-btn_dial_textfield_normal"></i><span>${esc(EC.formatNumber(digits))}</span></div>
      <div class="ecph-pad">${keys}</div>
      <div class="ecph-actions">${act('left', 'voicemail', 'voice_mail', false)}${act('middle', 'call', 'call', !!digits)}${act('right', 'delete', 'delete', !!digits)}</div></div>`)}</div>`;
  }
  const setEmergency = (c, value) => { c.ui.emergencyDigits = value; c.renderOverlay ? c.renderOverlay() : c.overlay('emergency-dialer'); };
  function emergencyCall(c) {
    const number = c.ui.emergencyDigits || '';
    if (['112', '911'].includes(number)) {
      c.ui.emergencyDigits = ''; c.closeOverlay();
      c.data.calls = [{id: Date.now(), number, type: 2, when: Date.now(), duration: 0}, ...(c.data.calls || [])]; c.save();
      if (c.ui.view === 'lock') c.ui.history.push({view: 'lock', sub: ''});
      c.ui.callNumber = number; c.open('incall');
      return;
    }
    c.dialog({title: I().t('emergency_enable_radio_dialog_title'), icon: null, message: number ? I().fmt('dial_emergency_error', c.lang, number) : I().t('dial_emergency_empty_error'), buttons: [{label: I().t('ok')}]});
  }
  EC.register('emergency-dialer', {
    app: false,
    underDialog: true,
    render: emergencyDialer,
    mount(c, root) {
      for (const el of root.querySelectorAll('[data-action="eced-key"][data-key="0"], [data-action="eced-delete"]')) {
        let timer = 0;
        el.addEventListener('pointerdown', () => { timer = setTimeout(() => {
          c.suppressClick = Date.now() + 400;
          if (el.dataset.key === '0') { tone(DTMF[0]); setEmergency(c, (c.ui.emergencyDigits || '') + '+'); } else setEmergency(c, '');
        }, 500); });
        for (const t of ['pointerup', 'pointerleave', 'pointercancel']) el.addEventListener(t, () => clearTimeout(timer));
      }
    },
    action(name, el, event, c) {
      if (!name.startsWith('eced-')) return false;
      if ((c.suppressClick || 0) > Date.now()) return true;
      if (name === 'eced-key') { tone(DTMF[el.dataset.key]); if (c.data.prefs?.haptic_feedback !== false) navigator.vibrate?.(30); setEmergency(c, (c.ui.emergencyDigits || '') + el.dataset.key); }
      if (name === 'eced-delete') setEmergency(c, (c.ui.emergencyDigits || '').slice(0, -1));
      if (name === 'eced-call') emergencyCall(c);
      return true;
    },
    back(c) { c.ui.emergencyDigits = ''; return false; }
  });
  EC.register('phone', spec('phone'));
  EC.register('contacts', spec('contacts'));
  document.addEventListener('DOMContentLoaded', () => {
    const c = EC.context, base = c.open;
    c.open = (view, sub, opts) => { if ((view === 'phone' || view === 'contacts') && c.ui.view !== view) EC.module(view).enter(c); return base(view, sub, opts); };
  });
})();
