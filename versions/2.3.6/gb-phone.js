/* Android 2.3.6 Contacts / Dialtacts (packages/apps/Contacts, layout-finger): the TabWidget with Phone, Call log,
   Contacts and Favorites (framework tab_indicator.xml, 64 dip), TwelveKeyDialer (twelve_key_dialer.xml, dialpad.xml,
   voicemail_dial_delete.xml), RecentCallsListActivity, ContactsListActivity and ViewContactActivity.
   hdpi px x 0.575, 1 dp = 0.8625px. Strings come from gb-strings-contacts.js. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const text = (lang, key, app = 'contacts') => { const entry = window.GBStrings?.[app]?.strings?.[key]; return entry ? entry[lang] ?? entry.en : key; };
  const phoneText = (lang, key) => text(lang, key, 'phone');
  const TABS = [['dialpad', 'dialerIconLabel', 'dialer'], ['history', 'recentCallsIconLabel', 'recent'], ['contacts', 'contactsIconLabel', 'contacts'], ['favorites', 'contactsFavoritesLabel', 'starred']];
  const KEYS = [['1', 'dial_num_1_no_vm'], ['2', 'dial_num_2'], ['3', 'dial_num_3'], ['4', 'dial_num_4'], ['5', 'dial_num_5'], ['6', 'dial_num_6'], ['7', 'dial_num_7'], ['8', 'dial_num_8'], ['9', 'dial_num_9'], ['*', 'dial_num_star'], ['0', 'dial_num_0'], ['#', 'dial_num_pound']];

  function tabs(current, lang) {
    return `<div class="gbp-tabs" role="tablist">${TABS.map(([id, label, icon]) => `<button class="gbp-tab${current === id ? ' selected' : ''}" role="tab" aria-selected="${current === id}" data-action="phone-tab" data-id="${id}"><img src="assets/gb-c-ic_tab_${current === id ? 'selected' : 'unselected'}_${icon}.png" alt=""><span>${e(text(lang, label))}</span></button>`).join('')}</div>`;
  }
  // TwelveKeyDialer: the 67 dip digits field (33 sp), the ButtonGridLayout of 88 x 50 dp keys with white digits that turn
  // black on the green pressed key, then voicemail / dial / delete.
  function dialer(dial) {
    return `<div class="gbp-dialer"><div class="gbp-digits${dial ? ' filled' : ''}"><output aria-label="Phone number">${e(dial)}</output></div><div class="gbp-pad">${KEYS.map(([key, art]) => `<button class="gbp-key" data-action="dial" data-id="${e(key)}" aria-label="${e(key)}" style="--wht:url('assets/gb-c-${art}_wht.png');--blk:url('assets/gb-c-${art}_blk.png')"></button>`).join('')}</div><div class="gbp-actions"><button class="gbp-voicemail" data-action="gbp-voicemail" aria-label="Voicemail"><img src="assets/gb-c-ic_dial_action_voice_mail.png" alt=""></button><button class="gbp-dial" data-action="call" aria-label="Dial"><img src="assets/gb-c-ic_dial_action_call.png" alt=""></button><button class="gbp-delete" data-action="dial-delete" aria-label="Delete"><img src="assets/gb-c-ic_dial_action_delete.png" alt=""></button></div></div>`;
  }
  // RecentCallsListItemView: name or number (22 sp), then the call type arrow, the number label (bold) and the relative
  // date (14 sp); a 1 px divider and the call button on the right.
  function relative(time, now, locale) {
    const minutes = Math.max(0, Math.round((now - time) / 60000));
    const rtf = new Intl.RelativeTimeFormat(locale, {numeric: 'auto'});
    if (minutes < 60) return rtf.format(-minutes, 'minute');
    if (minutes < 1440) return rtf.format(-Math.round(minutes / 60), 'hour');
    return rtf.format(-Math.round(minutes / 1440), 'day');
  }
  function callLog(calls, contactOf, ctx) {
    if (!calls.length) return `<p class="gbp-empty">${e(text(ctx.lang, 'recentCalls_empty'))}</p>`;
    return `<div class="gbp-list">${[...calls].reverse().map(call => {
      const person = contactOf(call.number), type = call.type || 'outgoing';
      return `<div class="gbp-log"><button class="gbp-log-main" data-action="phone-log-detail" data-id="${call.time}"><span class="gbp-log-name">${e(person?.name || call.number)}</span><span class="gbp-log-meta"><img src="assets/gb-c-ic_call_log_list_${type === 'missed' ? 'missed' : type === 'incoming' ? 'incoming' : 'outgoing'}_call.png" alt="">${person ? `<b>${e(ctx.t('Mobile'))}</b> ` : ''}${e(relative(call.time, ctx.now, ctx.locale))}</span></button><i class="gbp-divider"></i><button class="gbp-log-call" data-action="phone-redial" data-id="${e(call.number)}" aria-label="${e(text(ctx.lang, 'recentCalls_callNumber').replace('%s', person?.name || call.number))}"><img src="assets/gb-c-badge_action_call.png" alt=""></button></div>`;
    }).join('')}</div>`;
  }
  // ContactsListActivity: alphabetical with list_separator headers, a 48 dp QuickContactBadge and the 22 sp name.
  // Display options (gb-contacts-io.js): the visible groups, only contacts with phones, the sort key and the name order.
  function contacts(people, ctx, favorites = false) {
    const io = ctx.io, key = person => io ? io.key(person) : person.name, label = person => io ? io.name(person) : person.name;
    const sorted = [...(io && !favorites ? io.filter(people) : people)].sort((a, b) => key(a).localeCompare(key(b), ctx.locale));
    if (!sorted.length) return `<p class="gbp-empty">${e(text(ctx.lang, favorites ? 'noFavoritesHelpText' : 'noContactsHelpText')).replace(/\n/g, '<br>')}</p>`;
    let letter = '';
    return `<div class="gbp-list">${sorted.map(person => {
      const initial = favorites ? '' : key(person)[0].toLocaleUpperCase(ctx.locale);
      const header = initial && initial !== letter ? `<div class="gbp-section">${e(letter = initial)}</div>` : '';
      return `${header}<button class="gbp-contact" data-action="gbp-contact" data-id="${person.id}"><img src="${window.GBContactPhoto?.(person) || 'assets/gb-c-ic_contact_list_picture.png'}" alt=""><span>${e(label(person))}</span></button>`;
    }).join('')}</div>`;
  }
  // ViewContactActivity: the contact header (photo, name, star) and the data rows - call, text and email.
  function detail(person, ctx) {
    const T = key => text(ctx.lang, key);
    const row = (action, id, icon, title, value) => `<button class="gbp-data" data-action="${action}" data-id="${e(id)}"><span class="gbset-text"><span class="gbset-title">${e(title)}</span><span class="gbset-sum">${e(value)}</span></span><img src="assets/gb-c-${icon}.png" alt=""></button>`;
    return `<div class="gbp-detail"><div class="gbp-header"><img src="${window.GBContactPhoto?.(person) || 'assets/gb-c-ic_contact_picture.png'}" alt=""><span>${e(person.name)}</span><button data-action="people-star" data-id="${person.id}" aria-label="${e(T(person.favorite ? 'menu_removeStar' : 'menu_addStar'))}"><img src="assets/gb-btn_star_big_${person.favorite ? 'on' : 'off'}.png" alt=""></button></div><div class="gbp-list">${person.phone ? row('phone-redial', person.phone, 'badge_action_call', T(`call_${person.phoneType || 'mobile'}`), person.phone) + row('phone-log-message', person.phone, 'sym_action_sms', T(`sms_${person.phoneType || 'mobile'}`), person.phone) : ''}${person.email ? `<div class="gbset-cat">${e(ctx.t('Email'))}</div>` + row('gbp-email', person.email, 'sym_action_add', T(`email_${person.emailType === 'mobile' ? 'other' : person.emailType || 'home'}`), person.email) : ''}</div></div>`;
  }

  // CallDetailActivity (call_detail.xml, call_detail_list_item.xml): under the "Call details" title, the title_bar_tall
  // header with the 32 dip call type icon beside the type (textAppearanceLarge), the time (weekday, date, year and time)
  // and the duration ("%1$s mins %2$s secs", none for a missed call); then the actions, each with its 32 dip icon on the
  // right: the call ("Call <name>" with the label and number when the number is a contact's, else Call back / Call
  // again / Return call), Send text message, and View contact or Add to contacts.
  function callDetail(call, person, ctx) {
    const T = key => text(ctx.lang, key), type = call.type || 'outgoing';
    const when = new Date(call.time).toLocaleString(ctx.locale, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'});
    const secs = Math.max(0, Math.round(call.duration || 0)), duration = T('callDetailsDurationFormat').replace('%1$s', Math.floor(secs / 60)).replace('%2$s', secs % 60);
    const action = (act, id, icon, title, label = '', number = '') => `<button class="gbp-cd-action" data-action="${act}" data-id="${e(id)}"><span class="gbp-cd-copy"><span>${e(title)}</span>${number ? `<small>${label ? `<b>${e(label)}</b>` : ''}${e(number)}</small>` : ''}</span><img src="assets/${icon}.png" alt=""></button>`;
    const callText = person ? T('recentCalls_callNumber').replace('%s', person.name) : T({incoming: 'callBack', outgoing: 'callAgain', missed: 'returnCall'}[type]);
    const kind = person?.phoneType || 'mobile', label = person ? T(`phoneType${kind[0].toUpperCase()}${kind.slice(1)}`) : '';
    return `<div class="gbp-calldetail"><div class="gb-titlebar">${e(T('callDetailTitle'))}</div><div class="gbp-cd-head"><img src="assets/gb-c-ic_call_log_header_${type}_call.png" alt=""><span><strong>${e(T(`type_${type}`))}</strong><small>${e(when)}</small>${type === 'missed' ? '' : `<small>${e(duration)}</small>`}</span></div><div class="gbp-cd-list">${action('phone-redial', call.number, 'gb-sym_action_call', callText, person ? label : '', call.number)}${action('phone-log-message', call.number, 'gb-c-sym_action_sms', T('menu_sendTextMessage'))}${person ? action('gbp-contact', person.id, 'gb-c-sym_action_view_contact', T('menu_viewContact')) : action('phone-add-contact', call.number, 'gb-c-sym_action_add', T('recentCalls_addToContact'))}</div></div>`;
  }

  // TwelveKeyDialer.showDialpadChooser: while a call is in progress the dialpad is replaced by a ListView of
  // dialpad_chooser_list_item rows (64 dp icon, textAppearanceMedium).
  function chooser(lang) {
    const rows = [['gbp-dtmf', 'dialer_useDtmfDialpad', 'tt_keypad'], ['gbp-return-call', 'dialer_returnToInCallScreen', 'current_call'], ['gbp-add-call', 'dialer_addAnotherCall', 'add_call']];
    return `<div class="gbp-list gbp-chooser">${rows.map(([action, key, icon]) => `<button class="gbp-choice" data-action="${action}"><img src="assets/gb-c-ic_dialer_fork_${icon}.png" alt=""><span>${e(text(lang, key))}</span></button>`).join('')}</div>`;
  }

  /* InCallScreen (Phone 2.3.6): incall_screen.xml mainFrame with the state gradient (updateInCallBackground), CallCard
     (call_card.xml, call_card_person_info.xml) and InCallTouchUi (incall_touch_ui.xml): the round Hold button, the
     non_drawer_dialpad and the bottom cluster - Add call / End / Dialpad, then Bluetooth / Mute / Speaker toggles.
     A local hang-up shows DISCONNECTING ("Hanging up") and then DISCONNECTED ("Call ended") before the screen closes. */
  const HANGING_UP = 600, ENDED = 400;
  function callState(call, now = Date.now()) {
    if (call.endedAt) return now < call.endedAt + HANGING_UP ? 'hanging' : 'ended';
    if (now < call.connected) return 'dialing';
    return call.hold ? 'holding' : 'active';
  }
  const elapsedText = (call, now = Date.now()) => { const seconds = Math.max(0, Math.floor(((call.endedAt || now) - call.connected) / 1000)); return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; };
  function background(call, state) {
    if (state === 'ended') return 'ended';
    if (state === 'holding') return 'on_hold';
    if (call.bluetooth) return 'bluetooth';
    return state === 'dialing' || call.endedAt < call.connected ? 'unidentified' : 'connected';
  }
  // CallCard.updateCardTitleWidgets: the upper title for DIALING and DISCONNECTING/DISCONNECTED, the elapsed time
  // in green (blue with Bluetooth) while ACTIVE, red after the call ended and "On hold" in orange while HOLDING.
  function card(call, state, ctx) {
    const P = key => phoneText(ctx.lang, key), person = ctx.person;
    const title = {dialing: P('card_title_dialing'), hanging: P('card_title_hanging_up'), ended: P('card_title_call_ended')}[state] || '';
    const elapsed = state === 'holding' ? P('card_title_on_hold') : state === 'dialing' || call.endedAt < call.connected ? '' : elapsedText(call, ctx.now);
    return `<div class="gbic-card"><div class="gbic-title">${e(title)}</div><div class="gbic-photo-row"><img class="gbic-photo" src="${window.GBContactPhoto?.(person) || 'assets/gb-p-picture_unknown.png'}" alt="${e(P('contactPhoto'))}"><span class="gbic-elapsed">${e(elapsed)}</span></div><div class="gbic-name">${e(person?.name || call.number)}</div>${person ? `<div class="gbic-number"><span>${e(ctx.t('Mobile'))}</span><span>${e(call.number)}</span></div>` : ''}</div>`;
  }
  function inCall(call, ctx) {
    const P = key => phoneText(ctx.lang, key), now = ctx.now ?? Date.now(), state = callState(call, now);
    const connected = state === 'active' || state === 'holding', live = state !== 'ended';
    const keypad = !!call.keypad && state === 'active';
    const button = (action, id, label, icon, enabled, cls = '') => `<button class="gbic-btn${cls}" data-action="${action}"${id ? ` data-id="${id}"` : ''}${enabled ? '' : ' disabled'}><img src="assets/gb-p-${icon}.png" alt=""><span>${e(label)}</span></button>`;
    const toggle = (id, label, enabled) => `<button class="gbic-toggle" data-action="incall-toggle" data-id="${id}" aria-pressed="${!!call[id] && enabled}"${enabled ? '' : ' disabled'}><span>${e(label)}</span></button>`;
    const holdLabel = P(call.hold ? 'onscreenUnholdText' : 'onscreenHoldText');
    const hold = connected && !keypad ? `<div class="gbic-hold"><button data-action="incall-toggle" data-id="hold" aria-label="${e(holdLabel)}"><img src="assets/gb-p-ic_in_call_touch_round_${call.hold ? 'unhold' : 'hold'}.png" alt=""></button><span>${e(holdLabel)}</span></div>` : '';
    const pad = keypad ? `<div class="gbic-dtmf"><output>${e(call.digits)}</output><div class="gbic-pad">${KEYS.map(([key, art]) => `<button class="gbic-key" data-action="incall-digit" data-id="${e(key)}" aria-label="${e(key)}" style="--wht:url('assets/gb-c-${art}_wht.png');--blk:url('assets/gb-c-${art}_blk.png')"></button>`).join('')}</div></div>` : '';
    const row1 = button('gbp-add-call', '', P('onscreenAddCallText'), 'ic_in_call_touch_add_call', connected) + button('hangup', '', P('onscreenEndCallText'), 'ic_in_call_touch_end', state !== 'hanging', ' gbic-end') + button('incall-toggle', 'keypad', P(keypad ? 'onscreenHideDialpadText' : 'onscreenShowDialpadText'), keypad ? 'ic_in_call_touch_dialpad_close' : 'ic_in_call_touch_dialpad', state === 'active');
    const row2 = toggle('bluetooth', P('onscreenBluetoothText'), !!ctx.bluetoothAvailable) + toggle('mute', P('onscreenMuteText'), state !== 'holding') + toggle('speaker', P('onscreenSpeakerText'), true);
    const controls = live ? `<div class="gbic-touch">${hold}${pad}<div class="gbic-bottom"><div class="gbic-row">${row1}</div><div class="gbic-row">${row2}</div></div></div>` : '';
    return `<div class="app-view gbic gbic-${background(call, state)}" data-no-translate data-state="${state}">${keypad ? '' : card(call, state, {...ctx, now})}${controls}</div>`;
  }

  function render(ctx) {
    const tab = ctx.tab || 'dialpad';
    if (ctx.detail) return `<div class="app-view gbp" data-no-translate><div class="gb-titlebar">${e(text(ctx.lang, 'viewContactTitle'))}</div>${detail(ctx.detail, ctx)}</div>`;
    const body = tab === 'history' ? callLog(ctx.calls, ctx.contactOf, ctx) : tab === 'contacts' ? contacts(ctx.people, ctx) : tab === 'favorites' ? contacts(ctx.people.filter(person => person.favorite), ctx, true) : ctx.callActive && !ctx.addCall ? chooser(ctx.lang) : dialer(ctx.dial);
    return `<div class="app-view gbp" data-no-translate>${tabs(tab, ctx.lang)}<div class="gbp-body">${body}</div></div>`;
  }
  // Options menus: TwelveKeyDialer (Add to contacts, Add 2-sec pause, Add wait), RecentCalls (Clear call log),
  // ContactsListActivity (Search, New contact, Display options, Accounts, Import/Export).
  function menu(ctx) {
    const T = key => text(ctx.lang, key), tab = ctx.tab || 'dialpad';
    if (ctx.detail) return [{action: 'people-edit', title: T('menu_editContact'), icon: 'ic_menu_edit'}, {action: 'gbct-share-one', id: ctx.detail.id, title: T('menu_share'), icon: 'ic_menu_share'}, {action: 'people-delete', title: T('menu_deleteContact'), icon: 'ic_menu_delete'}];
    if (tab === 'dialpad') return ctx.dial ? [{action: 'phone-add-contact', title: T('recentCalls_addToContact'), icon: 'ic_menu_add'}, {action: 'dial', id: ',', title: T('add_2sec_pause'), icon: 'ic_menu_add'}, {action: 'dial', id: ';', title: T('add_wait'), icon: 'ic_menu_add'}] : [];
    if (tab === 'history') return ctx.calls.length ? [{action: 'gbp-clear-log', title: T('recentCalls_deleteAll'), icon: 'ic_menu_close_clear_cancel'}] : [];
    return [{action: 'people-search', title: T('menu_search'), icon: 'ic_menu_search'}, {action: 'gbp-new-contact', title: T('menu_newContact'), icon: 'ic_menu_add'}, {action: 'gbct-display', title: T('menu_displayGroup'), icon: 'ic_menu_view'}, {action: 'gbct-accounts', title: T('menu_accounts'), icon: 'ic_menu_account_list'}, {action: 'gbct-io-menu', title: T('menu_import_export'), icon: 'c-ic_menu_import_export'}];
  }

  window.GBPhone = {TABS, KEYS, HANGING_UP, ENDED, text, phoneText, relative, render, menu, callState, elapsedText, inCall, callDetail};
})();
