/* Android 2.1 Google Talk 1.3 (Talk.apk, ERE27) on the made-up account (EC.gmail.account), offline; the friends are the
   phone's made-up people and their replies are made up too.
   - SigningInActivity (FEATURE_INDETERMINATE_PROGRESS, "Signing in to Google Talk"): ic_im_logo_gtalk_splash over the
     spinner and "Signing in…", once a session (TalkApp binds the service).
   - BuddyList ("Friends list", custom_title_1.xml: the account at the right in #f6f6f6 with a black shadow): the
     status_view.xml header (#5b5c5c: your picture on avatar_border, the status message field on
     textfield_default_dormant in white — "Invisible" while invisible — and the presence button), then
     roster_list_item.xml rows (listPreferredItemHeight: the QuickContactBadge, the name in textAppearanceMedium bold, the
     status in textAppearanceSmall, the presence icon at the right, the mobile indicator): friends you chat with on the
     im_bubble_normal bubble with their last message; offline friends dimmed. Most popular (the default) lists the friends
     you talk to most, All friends everyone. The presence button opens "Status" (Available, Busy, Invisible, your own
     messages as "+ text" / "- text", Clear custom messages); typing a status message and Enter sets it.
   - Holding a friend (onCreateContextMenu): Go to chat / End chat (chatting) or Start chat, Friend info, Block friend,
     Remove friend, Always show / Hide friend.
   - Menu (buddy_list_menu): All friends / Most popular, Add friend, Blocked, Search, Invites, Close all chats, Settings,
     Sign out, Terms & Privacy.
   - ChatScreen (FEATURE_NO_TITLE, chat_screen.xml on white): ContactHeaderWidget (title_bar_medium, the badge, the name,
     the status and presence), the history (chat_screen_item.xml: 18 sp, padding 7 / 5 / 7 / 3 dp; "Alex:" or "Me:" in
     bold, then the text with its smileys; received messages on light_blue_background #ecfbff; "Sent at 3:41 PM on
     Thursday" after a pause of more than a minute), and bottombar_landscape_565 with "Type to compose" and Send.
     Menu (chat_screen_menu): Chat off record / on record, Switch chats, Friends list, Add to chat, End chat, Clear chat
     history, Insert smiley (SmileyMenuHelper: the 17 framework smileys and Talk's smirk, mad, poker face and heart),
     View contact.
   - AddBuddyScreen ("Add friend": "Send chat invitation to", Send invitation), Settings (gtalk_preferences.xml). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const K = () => EC.text('talk');
  const t = k => K().t(k);
  const F = () => EC.text('framework');
  const account = () => EC.gmail?.account || 'eclair.demo@gmail.com';
  // The friends' made-up presence: [mode, status message, mobile, popular] by contact id.
  const PRESENCE = {1: ['available', 'Out hiking this weekend', true, true], 2: ['away', '', false, true], 3: ['busy', 'In a meeting', false, false], 4: ['offline', '', false, true]};
  const ICON = {available: 'fw-presence_online.png', away: 'fw-presence_away.png', busy: 'fw-presence_busy.png', offline: 'fw-presence_offline.png', invisible: 'fw-presence_invisible.png'};
  const ORDER = ['available', 'away', 'busy', 'offline'];
  const REPLIES = ['Sounds good!', 'Haha, nice :-)', 'On my way.', 'Let me check and get back to you.', 'Sure, see you then!'];
  // SmileyMenuHelper.sIconIds: com.android.internal.widget.Smileys, then Talk's own four.
  const SMILEYS = ['fw-emo_im_happy', 'fw-emo_im_sad', 'fw-emo_im_winking', 'fw-emo_im_tongue_sticking_out', 'fw-emo_im_surprised', 'fw-emo_im_kissing', 'fw-emo_im_yelling', 'fw-emo_im_cool',
    'fw-emo_im_money_mouth', 'fw-emo_im_foot_in_mouth', 'fw-emo_im_embarrassed', 'fw-emo_im_angel', 'fw-emo_im_undecided', 'fw-emo_im_crying', 'fw-emo_im_lips_are_sealed', 'fw-emo_im_laughing',
    'fw-emo_im_wtf', 'tk-emo_im_smirk', 'tk-emo_im_mad', 'tk-emo_im_pokerface', 'tk-emo_im_heart'];
  const st = c => c.data.talk ||= {mode: 'available', status: '', customs: [], dnd: [], chats: {}, active: [], hidden: [], blocked: [], invited: [], popular: true, offRecord: {}};
  let signedIn = false, signingTimer = 0, replyTimer = 0;
  function friends(c) {
    const s = st(c);
    return (c.data.contacts || EC.defaults.contacts || []).filter(p => p.email && !s.blocked.includes(p.email)).map(p => {
      const [mode, status, mobile, popular] = PRESENCE[p.id] || ['offline', '', false, false];
      return {id: String(p.id), name: p.name, email: p.email, mode, status, mobile, popular, contact: p};
    });
  }
  const friend = (c, id) => friends(c).find(f => f.id === id);
  const chatting = (c, f) => st(c).active.includes(f.id);
  const badge = (f, cls = '') => { const photo = f && EC.contactModel?.photoOf(f.contact); return `<span class="ecph-badge ${cls}"><i class="ec-bg np-fw-quickcontact_badge_unpressed"></i>${photo ? `<span class="ecph-photo" style="${EC.contactModel.photoCss(photo)}"></span>` : '<img src="assets/tk-ic_contact_picture.png" alt="">'}</span>`; };
  // Markup: the smiley texts as their icons.
  function markup(c, text) {
    const texts = K().t('smiley_text'), sorted = texts.map((x, i) => [x, i]).sort((a, b) => b[0].length - a[0].length);
    let out = '', i = 0;
    while (i < text.length) {
      const hit = sorted.find(([x]) => text.startsWith(x, i));
      if (hit) { out += `<img class="ectk-emo" src="assets/${SMILEYS[hit[1]]}.png" alt="${esc(hit[0])}">`; i += hit[0].length; }
      else { out += esc(text[i]); i++; }
    }
    return out;
  }
  const title = (left, right, progress) => `<div class="ecgm-title npp-fw-title_bar"><i class="ec-bg np-fw-title_bar"></i><span class="ecgm-tleft">${esc(left)}</span><span class="ecgm-tright ectk-tright">${esc(right || '')}</span>${progress ? '<img class="ectk-tspin" src="assets/fw-spinner_white_16.png" alt="">' : ''}</div>`;

  // ---- SigningInActivity ----
  function renderSigning() {
    return `<div class="ectk">${title(t('signing_in_to'), '', true)}
      <div class="ectk-signing"><img src="assets/tk-ic_im_logo_gtalk_splash.png" alt=""><div><img class="ectk-spin48" src="assets/fw-spinner_white_48.png" alt=""><span>${esc(t('signing_in_wait'))}</span></div></div></div>`;
  }

  // ---- BuddyList ----
  function sorted(c) {
    const s = st(c), all = friends(c).filter(f => !s.hidden.includes(f.id));
    const list = s.popular ? all.filter(f => f.popular || chatting(c, f)) : all;
    return list.sort((a, b) => (chatting(c, b) - chatting(c, a)) || ORDER.indexOf(a.mode) - ORDER.indexOf(b.mode) || a.name.localeCompare(b.name));
  }
  function renderList(c) {
    const s = st(c), own = s.mode === 'invisible' ? t('presence_invisible') : s.status;
    const header = `<div class="ectk-status"><span class="ectk-avatar npp-tk-im_avatar_picture_border_normal"><i class="ec-bg np-tk-im_avatar_picture_border_normal"></i><img src="assets/tk-ic_contact_picture.png" alt=""></span>
      <span class="ectk-sfield npp-tk-textfield_default_dormant"><i class="ec-bg np-tk-textfield_default_dormant"></i><i class="ec-bg ecwf-focus np-tk-textfield_selected"></i><input class="ecwf-input" placeholder="${esc(t('custom_status_hint'))}" value="${esc(own)}" autocomplete="off"${s.mode === 'invisible' ? ' disabled' : ''}></span>
      <button type="button" class="ectk-sbtn" data-action="ectk-status"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><img src="assets/${ICON[s.mode]}" alt=""></button></div>`;
    const rows = sorted(c).map(f => {
      const chat = s.chats[f.id] || [], on = chatting(c, f), lastIn = [...chat].reverse().find(m => !m.me);
      const line2 = on && lastIn ? markup(c, lastIn.body) : esc(f.status);
      return `<button type="button" class="ectk-row${f.mode === 'offline' ? ' offline' : ''}" data-action="ectk-chat" data-id="${f.id}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i>
        ${badge(f)}<span class="ectk-text${on ? ' npp-tk-im_bubble_normal' : ''}">${on ? '<i class="ec-bg np-tk-im_bubble_normal"></i>' : ''}<span class="ectk-l1">${esc(f.name)}</span><span class="ectk-l2">${line2}</span>
        ${f.mobile && f.mode !== 'offline' ? '<img class="ectk-type" src="assets/tk-im_contact_icon_mobile_dark.png" alt="">' : ''}<img class="ectk-presence" src="assets/${ICON[f.mode]}" alt=""></span></button><i class="ecpf-divider"></i>`;
    }).join('');
    return `<div class="ectk">${title(t('buddy_list'), account())}<div class="ectk-list">${header}${rows}</div></div>`;
  }
  function statusDialog(c) {
    const s = st(c);
    const items = [{label: t('presence_available'), icon: ICON.available, go: () => { s.mode = 'available'; s.status = ''; }},
      {label: t('presence_busy'), icon: ICON.busy, go: () => { s.mode = 'busy'; s.status = ''; }},
      {label: t('presence_invisible'), icon: ICON.invisible, go: () => { s.mode = 'invisible'; }},
      ...s.customs.map(x => ({label: `+ ${x}`, icon: ICON.available, go: () => { s.mode = 'available'; s.status = x; }})),
      ...s.dnd.map(x => ({label: `- ${x}`, icon: ICON.busy, go: () => { s.mode = 'busy'; s.status = x; }})),
      {label: t('clear_status_list'), go: () => { s.customs = []; s.dnd = []; }}];
    c.dialog({title: t('label_status'), icon: null, items: items.map(x => ({label: x.label, icon: x.icon})), rows: 'talk',
      onItem: i => { items[i].go(); c.save(); c.render(); }});
  }
  function contextMenu(c, f) {
    const s = st(c), on = chatting(c, f);
    const items = on ? [[t('menu_join_conversation'), () => openChat(c, f.id)], [t('menu_end_conversation'), () => endChat(c, f.id)], [t('menu_user_info'), () => info(c, f)], [t('menu_block'), () => block(c, f)]]
      : [[t('menu_start_conversation'), () => openChat(c, f.id)], [t('menu_user_info'), () => info(c, f)], [t('menu_block'), () => block(c, f)], [t('menu_remove'), () => remove(c, f)],
        s.hidden.includes(f.id) ? [t('menu_unhide'), () => { s.hidden = s.hidden.filter(x => x !== f.id); c.save(); c.render(); }] : [t('menu_hide'), () => { s.hidden.push(f.id); c.save(); c.render(); }]];
    c.dialog({title: f.name, icon: null, items: items.map(x => x[0]), onItem: i => items[i][1]()});
  }
  // BuddyInfo: the friend's address and nickname (Done / Revert).
  function info(c, f) {
    c.dialog({title: t('user_profile_title'), icon: null, html: `<div class="ectk-info"><div>${esc(t('label_username'))}</div><b>${esc(f.email)}</b><div>${esc(t('label_nickname'))}</div><b>${esc(f.name)}</b><div>${esc(t('label_status'))}</div><b>${esc(f.status || t(`presence_${f.mode}`))}</b></div>`,
      buttons: [{label: t('ok')}]});
  }
  function block(c, f) { const s = st(c); s.blocked.push(f.email); s.active = s.active.filter(x => x !== f.id); c.save(); c.render(); }
  function remove(c, f) {
    c.dialog({title: t('confirm_remove_buddy_title'), icon: null, message: K().fmt('confirm_remove_buddy', c.lang, f.name),
      buttons: [{label: t('ok'), action: () => { const s = st(c); s.hidden.push(f.id); c.save(); c.render(); }}, {label: t('cancel')}]});
  }
  function listMenu(c) {
    const s = st(c);
    c.menu([{label: t(s.popular ? 'menu_show_all_contacts' : 'menu_show_quick_contacts'), icon: 'tk-ic_menu_allfriends.png', action: () => { s.popular = !s.popular; c.save(); c.render(); }},
      {label: t('menu_add'), icon: 'tk-ic_menu_invite.png', action: () => { c.ui.tkScreen = 'add'; c.render(); }},
      {label: t('menu_show_blocked_contacts'), icon: 'tk-ic_menu_blocked_user.png', action: () => { c.ui.tkScreen = 'blocked'; c.render(); }},
      {label: t('menu_search'), icon: 'tk-ic_menu_search.png', action: () => search(c)},
      {label: t('menu_show_invites'), icon: 'tk-ic_menu_invites.png', action: () => { c.ui.tkScreen = 'invites'; c.render(); }},
      {label: t('menu_leave_all_chats'), icon: 'tk-ic_menu_end_all_conversations.png', action: () => { s.active = []; c.save(); c.render(); }},
      {label: t('menu_settings'), icon: 'fw-ic_menu_preferences.png', action: () => { c.ui.tkScreen = 'prefs'; c.render(); }},
      {label: t('menu_logout'), icon: 'fw-ic_menu_close_clear_cancel.png', action: () => { signedIn = false; c.home(); }},
      {label: t('menu_terms'), action: () => { c.ui.browserGo = 'http://www.google.com/mobile/privacy.html'; c.open('browser'); }}]);
  }
  function search(c) {
    c.searchDialog({icon: 'app-talk.png', hint: t('search_hint'), value: '', onGo: q => { if (q.trim()) { c.ui.tkQuery = q.trim(); c.ui.tkScreen = 'search'; c.render(); } }});
  }

  // ---- ChatScreen ----
  function openChat(c, id) {
    const s = st(c);
    if (!s.active.includes(id)) s.active.push(id);
    s.chats[id] ||= [];
    c.ui.tkChat = id; c.ui.tkScreen = 'chat'; c.save(); c.render();
    c.el.viewport.querySelector('.ectk-input input')?.focus();
  }
  function endChat(c, id) { const s = st(c); s.active = s.active.filter(x => x !== id); delete s.chats[id]; c.save(); if (c.ui.tkChat === id) { c.ui.tkScreen = ''; c.ui.tkChat = null; } c.render(); }
  function renderChat(c) {
    const s = st(c), f = friend(c, c.ui.tkChat);
    if (!f) { c.ui.tkScreen = ''; return renderList(c); }
    const chat = s.chats[f.id] || [], first = f.name.split(' ')[0];
    const weekday = d => d.toLocaleDateString(c.locale(), {weekday: 'long'});
    let prev = 0;
    const items = chat.map(m => {
      if (m.note) return `<div class="ectk-note">${esc(m.note)}</div>`;
      const d = new Date(m.time), showTs = m.time - prev > 60000; prev = m.time;
      const who = m.me ? t('meString') : `${first}:`;
      return `<div class="ectk-msg${m.me ? '' : ' in'}"><div class="ectk-body"><b>${esc(who)}</b> ${markup(c, m.body)}</div>${showTs ? `<div class="ectk-ts">${esc(K().fmt('time_stamp', c.lang, c.timeText(d), weekday(d)))}</div>` : ''}</div>`;
    }).join('');
    return `<div class="ectk ectk-chat"><div class="eccv-head ectk-head"><i class="ec-bg np-fw-title_bar_medium"></i>${badge(f)}<span class="ectk-hname"><span class="eccv-name">${esc(f.name)}</span>${f.status ? `<small>${esc(f.status)}</small>` : ''}</span><img class="ectk-hpres" src="assets/${ICON[f.mode]}" alt=""></div>
      <div class="ectk-history">${items}</div>
      <div class="ectk-input"><span class="ecwf-edit npp-fw-textfield_default"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><input class="ecwf-input" placeholder="${esc(t('compose_hint'))}" maxlength="2000" autocomplete="off" data-ime="im"></span>
        <button type="button" class="ecui-button ectk-send" data-action="ectk-send"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(t('send'))}</span></button></div></div>`;
  }
  function send(c) {
    const input = c.el.viewport.querySelector('.ectk-input input'), text = input?.value.trim();
    if (!text) return;
    const s = st(c), id = c.ui.tkChat, f = friend(c, id);
    s.chats[id].push({me: true, body: text, time: Date.now()});
    c.save(); c.render(); c.el.viewport.querySelector('.ectk-input input')?.focus();
    clearTimeout(replyTimer);
    if (f.mode === 'offline') return;
    // The friend answers (made up).
    replyTimer = setTimeout(() => {
      if (!s.chats[id]) return;
      s.chats[id].push({me: false, body: REPLIES[(s.chats[id].length + Number(id)) % REPLIES.length], time: Date.now()});
      c.save();
      if (c.ui.view === 'talk' && c.ui.tkScreen === 'chat' && c.ui.tkChat === id) { const v = c.el.viewport.querySelector('.ectk-input input')?.value || ''; c.render(); const i = c.el.viewport.querySelector('.ectk-input input'); if (i) { i.value = v; i.focus(); } }
    }, 2500);
  }
  function chatMenu(c) {
    const s = st(c), id = c.ui.tkChat, off = !!s.offRecord[id], f = friend(c, id);
    c.menu([{label: t(off ? 'menu_go_on_record' : 'menu_go_off_record'), icon: `tk-ic_menu_chat_${off ? 'on' : 'off'}_record.png`, action: () => { s.offRecord[id] = !off; s.chats[id].push({note: t(off ? 'otr_turned_off' : 'otr_turned_on_by_user')}); c.save(); c.render(); }},
      {label: t('menu_switch_chats'), icon: 'tk-ic_menu_chat_dashboard.png', action: () => switcher(c)},
      {label: t('menu_view_roster'), icon: 'tk-ic_menu_friendslist.png', action: () => { c.ui.tkScreen = ''; c.render(); }},
      {label: t('menu_add_contact'), icon: 'fw-ic_menu_add.png', action: () => { const others = friends(c).filter(x => x.id !== id && x.mode !== 'offline'); c.dialog({title: t('group_chat_add_contact'), icon: null, items: others.map(x => x.name), onItem: i => { s.chats[id].push({note: K().fmt('group_chat_invited', c.lang, others[i].name)}); c.save(); c.render(); }}); }},
      {label: t('menu_close_chat'), icon: 'tk-ic_menu_end_conversation.png', action: () => endChat(c, id)},
      {label: t('menu_clear_chat'), icon: 'tk-ic_menu_end_conversation.png', action: () => { s.chats[id] = []; c.save(); c.render(); }},
      {label: t('menu_insert_smiley'), icon: 'tk-ic_menu_emoticons.png', action: () => smileys(c)},
      {label: t('menu_view_contact'), icon: 'tk-ic_menu_contact.png', action: () => { c.ui.contactId = f.contact.id; c.open('contacts', 'view'); }}]);
  }
  // SmileyMenuHelper.makeSmileyAlert: smiley_menu_item.xml rows, Insert smiley.
  function smileys(c) {
    const names = K().t('smiley_names'), texts = K().t('smiley_text');
    c.dialog({title: t('menu_insert_smiley'), icon: null, rows: 'smiley', items: names.map((n, i) => ({label: n, icon: `${SMILEYS[i]}.png`, text: texts[i]})),
      onItem: i => { const input = c.el.viewport.querySelector('.ectk-input input'); if (input) { input.value += texts[i]; input.focus(); } }});
  }
  // The chat switcher: the active chats as chat_switcher_item cells on the dimmed strip.
  function switcher(c) {
    const s = st(c), list = s.active.map(id => friend(c, id)).filter(Boolean);
    c.dialog({title: K().fmt('switcher_open_hint', c.lang, list.length), icon: null, items: list.length ? list.map(f => ({label: f.name, icon: ICON[f.mode]})) : [t('no_chats')], onItem: i => { if (list[i]) openChat(c, list[i].id); }});
  }

  // ---- AddBuddyScreen, Blocked, Invites, Settings ----
  function renderAdd(c) {
    return `<div class="ectk">${title(t('menu_add'))}<div class="ectk-add"><div class="ectk-addbody"><div class="ectk-addlabel">${esc(t('invite_instruction'))}</div>
      <span class="ecwf-edit npp-fw-textfield_default"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><input class="ecwf-input" type="email" data-ime="email" placeholder="${esc(t('invitee_hint'))}" autocomplete="off"></span></div>
      <div class="ectk-bbar"><button type="button" class="ecui-button" data-action="ectk-invite"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(t('invite_label'))}</span></button></div></div></div>`;
  }
  function renderPeople(c, which) {
    const s = st(c), list = which === 'blocked' ? s.blocked : s.invited;
    const head = t(which === 'blocked' ? 'blocked_title' : 'pending_invitations_title');
    return `<div class="ectk">${title(head)}<div class="ectk-list">${list.map(a => `<button type="button" class="ectk-row" data-action="ectk-${which}" data-addr="${esc(a)}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i>${badge(null)}<span class="ectk-text"><span class="ectk-l1">${esc(a)}</span></span></button><i class="ecpf-divider"></i>`).join('')}</div></div>`;
  }
  function renderPrefs(c) {
    const p = c.data.talkPrefs ||= {};
    const v = (k, d) => p[k] ?? d;
    const check = on => `<img class="ecpf-check" src="assets/fw-btn_check_${on ? 'on' : 'off'}.png" alt="">`;
    const r = (key, title, summary, on, off) => `<button type="button" class="ecpf-row" data-action="ectk-pref" data-key="${key}"${off ? ' disabled' : ''}><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span class="ecpf-text"><span class="ecpf-title">${esc(title)}</span>${summary ? `<span class="ecpf-summary">${esc(summary)}</span>` : ''}</span>${on === undefined ? '' : check(on)}</button><i class="ecpf-divider"></i>`;
    const cat = x => `<div class="ecpf-cat npp-fw-dark_header_dither"><i class="ec-bg np-fw-dark_header_dither"></i><span>${esc(x)}</span></div>`;
    const n = v('gtalk-enable-notifications', true);
    return c.window(t('activity_preferences'), `<div class="ecpf-list">${cat(t('gtalk_general_settings'))}${r('gtalk-auto-login', t('auto_login'), '', v('gtalk-auto-login', true))}
      ${r('gtalk-mobile-indicator', t('mobile_indicator_title'), t('mobile_indicator_summary'), v('gtalk-mobile-indicator', true))}
      ${r('gtalk-show-away-on-idle', t('show_away_on_idle_title'), t('show_away_on_idle_summary'), v('gtalk-show-away-on-idle', true))}
      ${r('clear', t('pref_gtalk_clear_search_history_title'), t('pref_gtalk_clear_search_history_summary'))}
      ${cat(t('notification_group_title'))}${r('gtalk-enable-notifications', t('notification_enabled_title'), t('notification_enabled_summary'), n)}
      ${r('gtalk-ringtone', t('notification_ringtone_title'), '', undefined, !n)}${r('gtalk-vibrate', t('notification_vibrate_title'), t('notification_vibrate_summary'), v('gtalk-vibrate', false), !n)}</div>`);
  }
  // SearchActivity: the chats that contain the words.
  function renderSearch(c) {
    const s = st(c), q = (c.ui.tkQuery || '').toLocaleLowerCase();
    const hits = Object.entries(s.chats).flatMap(([id, chat]) => chat.filter(m => m.body?.toLocaleLowerCase().includes(q)).map(m => ({id, m})));
    return `<div class="ectk">${title(t('menu_search'))}<div class="ectk-list">${hits.map(({id, m}) => `<button type="button" class="ectk-row" data-action="ectk-chat" data-id="${id}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i>${badge(friend(c, id))}<span class="ectk-text"><span class="ectk-l1">${esc(friend(c, id)?.name || '')}</span><span class="ectk-l2">${markup(c, m.body)}</span></span></button><i class="ecpf-divider"></i>`).join('')}</div></div>`;
  }

  EC.register('talk', {
    title: 'Talk',
    render(c) {
      if (!signedIn) return renderSigning();
      switch (c.ui.tkScreen) {
        case 'chat': return renderChat(c);
        case 'add': return renderAdd(c);
        case 'blocked': case 'invites': return renderPeople(c, c.ui.tkScreen);
        case 'prefs': return renderPrefs(c);
        case 'search': return renderSearch(c);
      }
      return renderList(c);
    },
    mount(c, root) {
      const hist = root.querySelector('.ectk-history');
      if (hist) hist.scrollTop = hist.scrollHeight;   // transcriptMode / stackFromBottom
      root.querySelector('.ectk-input input')?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); send(c); } });
      const status = root.querySelector('.ectk-sfield input');
      status?.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        const s = st(c), text = status.value.trim();
        // applyNewCustomStatusText: the message becomes the status and joins the list for its mode.
        if (s.mode === 'busy') { if (text && !s.dnd.includes(text)) s.dnd.unshift(text); } else { s.mode = 'available'; if (text && !s.customs.includes(text)) s.customs.unshift(text); }
        s.status = text; c.save(); status.blur(); c.render();
      });
      // Holding a friend opens the context menu.
      for (const el of root.querySelectorAll('.ectk-row[data-action="ectk-chat"]')) {
        let hold = 0;
        el.addEventListener('pointerdown', () => { hold = setTimeout(() => { c.suppressClick = Date.now() + 400; const f = friend(c, el.dataset.id); if (f && !c.ui.tkScreen) contextMenu(c, f); }, 500); });
        for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) el.addEventListener(ev, () => clearTimeout(hold));
      }
    },
    action(name, el, event, c) {
      switch (name) {
        case 'ectk-chat': if ((c.suppressClick || 0) > Date.now()) return true; openChat(c, el.dataset.id); return true;
        case 'ectk-status': statusDialog(c); return true;
        case 'ectk-send': send(c); return true;
        case 'ectk-invite': {
          let a = el.closest('.ectk-add').querySelector('input').value.trim();
          if (!a) return true;
          // AddBuddyScreen: a name without a domain is a Gmail address.
          if (!a.includes('@')) a += '@gmail.com';
          const s = st(c); if (!s.invited.includes(a)) s.invited.push(a); c.save();
          c.ui.tkScreen = ''; c.render(); return true;
        }
        case 'ectk-blocked': {
          const a = el.dataset.addr;
          c.dialog({title: t('unblock_buddy'), icon: null, message: K().fmt('confirm_unblock', c.lang, a), buttons: [{label: t('ok'), action: () => { const s = st(c); s.blocked = s.blocked.filter(x => x !== a); c.save(); c.render(); }}, {label: t('cancel')}]});
          return true;
        }
        case 'ectk-pref': {
          const p = c.data.talkPrefs ||= {}, key = el.dataset.key;
          if (key === 'gtalk-ringtone') { EC.ringtonePicker(c, {cat: 'notifications', title: t('notification_ringtone_title'), current: p[key] ?? null, showDefault: true, onPick: f => { p[key] = f; c.save(); }}); return true; }
          if (key === 'clear') { c.dialog({title: t('confirm_clear_search_title'), icon: null, message: t('confirm_clear_search_text'), buttons: [{label: t('ok')}, {label: t('cancel')}]}); return true; }
          const defaults = {'gtalk-auto-login': true, 'gtalk-mobile-indicator': true, 'gtalk-show-away-on-idle': true, 'gtalk-enable-notifications': true, 'gtalk-vibrate': false};
          p[key] = !(p[key] ?? defaults[key]); c.save(); c.render(); return true;
        }
      }
      return false;
    },
    menu(c) {
      if (!signedIn) return true;
      if (c.ui.tkScreen === 'chat') chatMenu(c);
      else if (!c.ui.tkScreen) listMenu(c);
      return true;
    },
    search(c) { if (signedIn && !c.ui.tkScreen) { search(c); return true; } return false; },
    back(c) {
      if (!signedIn) { clearTimeout(signingTimer); return false; }
      if (c.ui.tkScreen) { c.ui.tkScreen = ''; c.render(); return true; }
      return false;
    }
  });
  document.addEventListener('DOMContentLoaded', () => {
    const c = EC.context, open = c.open;
    c.open = (view, sub, opts) => {
      const fresh = c.ui.view !== 'talk' && view === 'talk';
      const r = open(view, sub, opts);
      if (fresh) {
        c.ui.tkScreen = '';
        if (!signedIn) { clearTimeout(signingTimer); signingTimer = setTimeout(() => { signedIn = true; if (c.ui.view === 'talk') c.render(); }, 1800); }
      }
      return r;
    };
  });
})();
