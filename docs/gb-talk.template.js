/* Google Talk 1.3 of the Nexus S image (Talk2.apk, with voice and video chat), from its layouts, colours and texts:
   - The friends list (BuddyList): roster_list.xml on roster_list_online_background #e3e3e3, roster_list_self_item.xml
     (your picture in im_avatar_picture_border_normal, your name and status, the presence on the right) and
     roster_list_item.xml rows (65 dip: the picture, the 18 sp bold name, the 14 sp status, a seperator_vertical_light and
     the 62 dip presence column; offline friends on #cccccc in #666666), and the Set status choices.
   - The chat (ChatScreen): title_message_bar.xml on header_chat (the friend's name in bold, the status, the presence and
     the voice / video buttons), chat_screen_item.xml rows (18 sp; received chats on received_chat_color #effbff, names in
     chat_from #7785e0 / chat_me #3492c5), the compose bar on bottombar_landscape_565 ("Type to compose", Send), and the
     emoticons of Insert smiley.
   - The Menu-key menus of both screens, in Talk2.apk's texts.
   Friends' replies are made up and offline. 1 dp = 0.8625 px. */
(() => {
  'use strict';
  const {e} = GBApps;
  const STRINGS = __STRINGS__({
    "Talk": "app_label", "Google Talk": "landing_page_title", "Friends list": "menu_view_roster", "Available": "presence_available", "Busy": "presence_busy",
    "Away": "presence_away", "Invisible": "presence_invisible", "Offline": "presence_offline", "Status message": "custom_status_hint",
    "Set Status": "set_status_activity_title", "Type to compose": "compose_hint", "Send": "send", "Add friend": "menu_add", "Search": "menu_search",
    "All friends": "menu_show_all_contacts", "Most popular": "menu_show_quick_contacts", "Invites": "menu_show_invites", "Settings": "menu_settings",
    "Sign out": "menu_sign_out", "Switch chats": "menu_switch_chats", "Chat off record": "menu_go_off_record", "Chat on record": "menu_go_on_record",
    "Add to chat": "menu_add_contact", "End chat": "menu_end_conversation", "End all chats": "menu_leave_all_chats", "Insert smiley": "menu_insert_smiley",
    "Clear chat history": "menu_clear_chat", "Friend info": "menu_user_info", "Video chat": "menu_video_chat", "Voice chat": "menu_voice_chat",
    "Send video chat invitation?": "confirm_dialog_video_chat_message", "Send voice chat invitation?": "confirm_dialog_voice_chat_message",
    "Calling…": "video_audio_chat_calling", "No active chats": "no_chats", "%s is away": "user_away", "%s is busy": "user_busy", "%s is offline": "user_offline",
    "Chat with %s": "chat_with", "Video chat available": "video_chat_available", "Mobile indicator": "mobile_indicator_title"
  });
  const T = GBApps.texts(STRINGS);
  const A = name => `assets/tk-${name}.png`;
  const PRESENCE = ['available', 'away', 'busy', 'offline'];
  // The made-up roster over the simulator's contacts: presence, status message, voice / video and mobile.
  const ROSTER = {1: ['available', 'On the trail with my Nexus S', 'video'], 2: ['away', 'Back in 10', 'voice'], 3: ['busy', 'Meetings all day', ''], 4: ['available', '', 'mobile']};
  const REPLIES = ['Sounds good!', 'Haha, nice :)', 'On my way.', 'Let me check and get back to you.', 'Sure, see you then!'];
  const SMILEYS = [['happy', ':-)'], ['sad', ':-('], ['winking', ';-)'], ['tongue_sticking_out', ':-P'], ['surprised', '=-O'], ['kissing', ':-*'], ['cool', 'B-)'], ['laughing', ':-D']];
  const smileys = text => SMILEYS.reduce((html, [img, code]) => html.split(e(code)).join(`<img class="tk-emo" src="${A(`emo_im_${img}`)}" alt="${e(code)}">`), e(text));
  const friend = (ctx, id) => { const c = (ctx.contacts || []).find(x => String(x.id) === String(id)); if (!c) return null; const [presence, status, kind] = ROSTER[c.id] || ['offline', '', '']; return {...c, presence, status, kind}; };
  const presenceIcon = f => f.presence === 'offline' ? 'assets/gb-presence_offline.png' : f.kind === 'voice' || f.kind === 'video' ? A(`presence_audio_${f.presence === 'available' ? 'online' : f.presence}`) : `assets/gb-presence_${f.presence === 'available' ? 'online' : f.presence}.png`;
  const store = data => (data.talk23 ||= {presence: 'available', message: '', chats: {}, offRecord: {}});
  const label = (lang, p) => T(lang, p === 'available' ? 'Available' : p === 'away' ? 'Away' : p === 'busy' ? 'Busy' : p === 'invisible' ? 'Invisible' : 'Offline');

  function roster(ctx) {
    const {lang, data} = ctx, s = store(data);
    const friends = (ctx.contacts || []).map(c => friend(ctx, c.id)).sort((a, b) => PRESENCE.indexOf(a.presence) - PRESENCE.indexOf(b.presence) || a.name.localeCompare(b.name));
    const self = `<button class="tk-self" data-action="tk-status"><span class="tk-avatar"><img src="${A('ic_contact_picture')}" alt=""></span><span class="tk-text"><b>${e(ctx.account)}</b><small>${e(s.message || label(lang, s.presence))}</small></span><i class="tk-sep"></i><span class="tk-presence"><img src="assets/gb-presence_${s.presence === 'available' ? 'online' : s.presence}.png" alt=""></span></button>`;
    const active = Object.keys(s.chats).filter(id => s.chats[id].length);
    const rows = friends.map(f => `<button class="tk-buddy${f.presence === 'offline' ? ' off' : ''}" data-action="tk-chat" data-id="${f.id}"><span class="tk-avatar"><img src="${A('ic_contact_picture')}" alt=""></span><span class="tk-text"><b>${e(f.name)}</b><small>${e(f.status || label(lang, f.presence))}</small>${f.kind === 'mobile' ? `<img class="tk-kind" src="${A('im_contact_icon_mobile_light')}" alt="">` : ''}</span>${active.includes(String(f.id)) ? `<img class="tk-active" src="${A('status_chat')}" alt="">` : ''}<i class="tk-sep"></i><span class="tk-presence"><img src="${presenceIcon(f)}" alt=""></span></button>`).join('');
    return `<div class="app-view tk tk-roster" data-no-translate><div class="gb-titlebar">${e(T(lang, 'Friends list'))}</div><div class="tk-scroll">${self}${rows}</div></div>`;
  }
  function chat(ctx) {
    const {lang, data, ui, locale} = ctx, s = store(data), f = friend(ctx, ui.tkChat);
    if (!f) return roster(ctx);
    const msgs = s.chats[f.id] || [], off = s.offRecord[f.id];
    const buttons = f.kind === 'video' || f.kind === 'voice' ? `${f.kind === 'video' ? `<i class="tk-msep"></i><button data-action="tk-call" data-id="video" aria-label="${e(T(lang, 'Video chat'))}"><img src="${A('ic_start_video_holo_light')}" alt=""></button>` : ''}<i class="tk-msep"></i><button data-action="tk-call" data-id="voice" aria-label="${e(T(lang, 'Voice chat'))}"><img src="${A('ic_start_audio_gray_holo_light')}" alt=""></button>` : '';
    const rows = msgs.map(m => `<div class="tk-msg${m.me ? ' me' : ''}"><img class="tk-badge" src="${A('ic_contact_picture')}" alt=""><p><b>${e(m.me ? 'me' : f.name.split(' ')[0])}:</b> ${smileys(m.body)}</p></div>`).join('');
    const note = off ? `<p class="tk-note">${e(T(lang, 'Chat off record'))}</p>` : '';
    return `<div class="app-view tk tk-chatview" data-no-translate><div class="tk-bar"><span class="tk-who"><b>${e(f.name)}</b><small>${e(f.status || label(lang, f.presence))}</small></span><img class="tk-pres" src="${presenceIcon(f)}" alt="">${buttons}</div><div class="tk-scroll tk-history">${note}${rows}</div><form class="tk-compose" data-form="tk-send"><input name="body" placeholder="${e(T(lang, 'Type to compose'))}" aria-label="${e(T(lang, 'Type to compose'))}" autocomplete="off"><button type="submit">${e(T(lang, 'Send'))}</button></form></div>`;
  }
  function render(ctx) { return ctx.ui.tkChat ? chat(ctx) : roster(ctx); }
  function menu(ctx) {
    const {lang, ui, data} = ctx, t = k => T(lang, k), s = store(data);
    if (ui.tkChat) return [
      {action: 'tk-roster', title: t('Friends list'), icon: 'tk-ic_menu_friendslist.png'}, {action: 'tk-switch', title: t('Switch chats'), icon: 'tk-ic_menu_chat_dashboard.png'},
      {action: 'tk-record', title: t(s.offRecord[ui.tkChat] ? 'Chat on record' : 'Chat off record'), icon: s.offRecord[ui.tkChat] ? 'tk-ic_menu_chat_on_record.png' : 'tk-ic_menu_chat_off_record.png'},
      {action: 'tk-unsupported', title: t('Add to chat'), icon: 'tk-ic_menu_invite.png'}, {action: 'tk-end', title: t('End chat'), icon: 'tk-ic_menu_end_conversation.png'},
      {action: 'tk-smiley', title: t('Insert smiley'), icon: 'tk-ic_menu_emoticons.png'}, {action: 'tk-clear', title: t('Clear chat history')}, {action: 'tk-info', title: t('Friend info')}];
    return [{action: 'tk-unsupported', title: t('Add friend'), icon: 'ic_menu_add'}, {action: 'tk-unsupported', title: t('Search'), icon: 'ic_menu_search'},
      {action: 'tk-switch', title: t('Switch chats'), icon: 'tk-ic_menu_chat_dashboard.png'}, {action: 'tk-end-all', title: t('End all chats'), icon: 'tk-ic_menu_end_all_conversations.png'},
      {action: 'tk-unsupported', title: t('Settings'), icon: 'ic_menu_preferences'}, {action: 'tk-unsupported', title: t('Sign out'), icon: 'tk-ic_menu_logout.png'}];
  }
  function dialog(kind, ctx) {
    const {lang, data, ui} = ctx, s = store(data), t = k => T(lang, k);
    if (kind === 'status') return {title: t('Set Status'), items: ['available', 'busy', 'invisible'].map(p => ({action: 'tk-presence', id: p, title: label(lang, p), icon: `gb-presence_${p === 'available' ? 'online' : p}.png`})), custom: `<form data-form="tk-message"><input class="gbdlg-input" name="message" value="${e(s.message)}" placeholder="${e(t('Status message'))}" aria-label="${e(t('Status message'))}" autocomplete="off"></form>`, buttons: [{action: 'tk-message-ok', title: ctx.ok}, {action: 'close-overlay', title: ctx.cancel}]};
    if (kind === 'switch') { const ids = Object.keys(s.chats).filter(id => s.chats[id].length); return {title: t('Switch chats'), items: ids.length ? ids.map(id => ({action: 'tk-chat', id, title: friend(ctx, id)?.name || id, icon: 'tk-status_chat.png'})) : [{action: 'close-overlay', title: t('No active chats')}]}; }
    if (kind === 'smiley') return {title: t('Insert smiley'), items: SMILEYS.map(([img, code]) => ({action: 'tk-insert', id: code, title: code, icon: `tk-emo_im_${img}.png`}))};
    if (kind === 'call') return {title: friend(ctx, ui.tkChat)?.name || '', message: t(ui.tkCall === 'video' ? 'Send video chat invitation?' : 'Send voice chat invitation?'), buttons: [{action: 'tk-call-ok', title: ctx.ok}, {action: 'close-overlay', title: ctx.cancel}]};
    if (kind === 'info') { const f = friend(ctx, ui.tkChat); return f ? {title: t('Friend info'), message: `${f.name}\n${f.email || ''}\n${label(lang, f.presence)}${f.status ? ` – ${f.status}` : ''}`, buttons: [{action: 'close-overlay', title: ctx.ok}]} : null; }
    return null;
  }
  let replyTimer = 0;
  function handle(action, id, ctx) {
    const {ui, data, lang} = ctx, s = store(data), close = () => { ui.overlay = ''; ctx.renderOverlay(); };
    switch (action) {
      case 'tk-chat': close(); ui.tkChat = id; s.chats[id] ||= []; ctx.save(); ctx.render(); ctx.focus('.tk-compose input'); break;
      case 'tk-roster': close(); ui.tkChat = ''; ctx.render(); break;
      case 'tk-status': ctx.dialog('status'); break;
      case 'tk-presence': s.presence = id; ctx.save(); close(); ctx.render(); break;
      case 'tk-message-ok': { const input = document.querySelector('.gbdlg [name=message]'); s.message = (input?.value || '').trim(); ctx.save(); close(); ctx.render(); break; }
      case 'tk-switch': ctx.dialog('switch'); break;
      case 'tk-record': s.offRecord[ui.tkChat] = !s.offRecord[ui.tkChat]; ctx.save(); close(); ctx.render(); break;
      case 'tk-end': delete s.chats[ui.tkChat]; ui.tkChat = ''; ctx.save(); close(); ctx.render(); break;
      case 'tk-end-all': s.chats = {}; ctx.save(); close(); ctx.render(); break;
      case 'tk-clear': s.chats[ui.tkChat] = []; ctx.save(); close(); ctx.render(); break;
      case 'tk-smiley': ctx.dialog('smiley'); break;
      case 'tk-insert': { close(); const input = ctx.root.querySelector('.tk-compose input'); if (input) { input.value = `${input.value}${input.value && !input.value.endsWith(' ') ? ' ' : ''}${id}`; input.focus(); } break; }
      case 'tk-info': ctx.dialog('info'); break;
      case 'tk-call': ui.tkCall = id; ctx.dialog('call'); break;
      case 'tk-call-ok': close(); ctx.toast(T(lang, 'Calling…')); break;
      case 'tk-unsupported': close(); ctx.toast('This feature is not part of the simulator.'); break;
      default: return false;
    }
    return true;
  }
  function submit(form, values, ctx) {
    const {ui, data} = ctx, s = store(data);
    if (form === 'tk-message') { handle('tk-message-ok', null, ctx); return true; }
    if (form !== 'tk-send') return false;
    const body = String(values.get('body') || '').trim(), id = ui.tkChat; if (!body || !id) return true;
    (s.chats[id] ||= []).push({me: true, body, time: Date.now()}); ctx.save(); ctx.render(); ctx.focus('.tk-compose input');
    const f = friend(ctx, id);
    if (f && f.presence !== 'offline') {
      clearTimeout(replyTimer);
      replyTimer = setTimeout(() => { s.chats[id]?.push({me: false, body: REPLIES[(s.chats[id].length + Number(id)) % REPLIES.length], time: Date.now()}); ctx.save(); if (ui.view === 'talk' && ui.tkChat === id) { ctx.render(); ctx.focus('.tk-compose input'); } }, 1800);
    }
    return true;
  }
  function back(ctx) { if (ctx.ui.tkChat) { ctx.ui.tkChat = ''; ctx.render(); return true; } return false; }
  function mounted(ctx) { const box = ctx.root.querySelector('.tk-history'); if (box) box.scrollTop = box.scrollHeight; }
  function open(ctx, resume) { if (!resume) ctx.ui.tkChat = ''; }
  GBApps.register('talk', {render, mounted, menu, dialog, handle, submit, back, open, scroll: '.tk-scroll'});
  window.GBTalk = {T, ROSTER};
})();
