/* Hangouts 1.0.2 on the Nexus 4 (the JWR66Y image; May 2013): chats with Google contacts only, SMS stays in Messaging.
   The KitKat simulator's Hangouts 2.0 screens (GSMArena Nexus 5 review; Android 4.4 Quick Start Guide) without the SMS
   tag; the editor hint is Hangouts 1.0's realtimechat_message_text_hint, "Send a message". A light Holo action bar with the green Hangouts icon, the
   conversation list with square avatars and an SMS tag, the New Hangout picker ("Type a name, email, number, or
   circle") and conversations of white cards on #e5e5e5 with the location and camera buttons beside the editor.
   The SMS data, drafts and message options are shared with the AOSP Mms presentation in messaging.js. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const AVATAR = 'assets/people-ic_contact_picture_holo_light.png';
  // Hangouts.apk's own texts (stock-strings.js, group hangouts), then the image's.
  const H = (t, key) => { const row = window.StockStrings?.hangouts?.[key], i = ['hu', 'de', 'fr', 'es'].indexOf(String(globalThis.document?.documentElement?.lang || '').slice(0, 2)); return row ? (i >= 0 ? row[i] : row[4] || key) : t(key); };
  // A conversation stays archived until something newer than the archiving arrives in it (conversation_archived).
  const isArchived = (data, thread) => { const at = data.hgArchived?.[thread.key]; return !!at && !(thread.last?.timestamp > at); };
  // EsApplication.showDndChoiceDialog: 60, 120, 240, 480, 1440 and 4320 minutes as plurals/dnd_hours.
  const SNOOZE_MINUTES = [60, 120, 240, 480, 1440, 4320];
  const hours = (t, minutes) => minutes === 60 ? H(t, '1 hour') : H(t, '%d hours').replace('%d', minutes / 60);
  const svg = {
    add: '<svg viewBox="0 0 24 24"><path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7z" fill="currentColor"/></svg>',
    call: '<svg viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" fill="currentColor"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="currentColor"/></svg>',
    camera: '<svg viewBox="0 0 24 24"><path d="M9 3 7.2 5H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.2L15 3zm3 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" fill="currentColor"/></svg>',
    video: '<svg viewBox="0 0 24 24"><path d="M3 6h12a1 1 0 0 1 1 1v3.5l5-3.5v10l-5-3.5V17a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" fill="currentColor"/></svg>',
    photo: '<svg viewBox="0 0 24 24"><path d="M3 4h18v16H3zm2 2v12h14V6zm1 10 3.5-4.5 2.5 3 3.5-4.5L19 16z" fill="currentColor"/></svg>',
    albums: '<svg viewBox="0 0 24 24"><path d="M3 3h18v18H3zm6.2 12.6a3.6 3.6 0 0 0 3.5-3.9H9.2v1.4h2a2 2 0 0 1-2 1.3 2.2 2.2 0 0 1 0-4.4c.6 0 1.1.2 1.5.6l1-1a3.6 3.6 0 1 0-2.5 6zm6.8-5.1V9h-1.2v1.5h-1.5v1.2h1.5v1.5H16v-1.5h1.5v-1.2z" fill="currentColor"/></svg>',
    send: '<svg viewBox="0 0 24 24"><path d="M3 20.5 22 12 3 3.5v6.6L16 12 3 13.9z" fill="currentColor"/></svg>'
  };
  const button = (action, label, icon, extra = '') => `<button type="button" class="hg-ab-btn" data-action="${action}" aria-label="${e(label)}" ${extra}>${svg[icon] || `<img src="assets/${icon}" alt="">`}</button>`;
  function stamp(message, t, locale, now, list) {
    if (!message) return '';
    if (!message.timestamp) return t(message.time || '');
    const date = new Date(message.timestamp);
    if (list && now - date < 60000) return t('Just now');
    if (list && date.toDateString() === new Date(now).toDateString()) return date.toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit'});
    return list ? date.toLocaleDateString(locale, {month: 'short', day: 'numeric'}) : date.toLocaleString(locale, {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'});
  }
  function bar({up, title, subtitle, spinner, actions}) {
    return `<header class="hg-bar"><button type="button" class="hg-up" data-action="${up ? 'back' : 'home'}" aria-label="${up ? 'Back' : 'Home'}">${up ? '<span aria-hidden="true">‹</span>' : ''}<img src="assets/hangouts.png" alt=""></button><div class="hg-title${spinner ? ' hg-spinner' : ''}"><h2>${e(title)}</h2>${subtitle ? `<small>${e(subtitle)}</small>` : ''}</div>${actions}</header>`;
  }
  function list(data, ui, t, locale, now) {
    const archived = ui.sub === 'archived';
    const rows = ICSMessaging.threads(data).filter(thread => isArchived(data, thread) === archived).map(thread => {
      const draft = thread.draft?.body || thread.draft?.attachment;
      const last = thread.last;
      const snippet = draft ? `<b>${e(t('Draft'))}:</b> ${e(thread.draft.body || t('Picture'))}` : last ? `${last.mine ? e(t('You:')) + ' ' : ''}${e(last.body || t('Picture'))}` : '';
      const unread = thread.messages.some(m => m.read === false);
      return `<button class="hg-thread${unread ? ' unread' : ''}" data-action="thread" data-id="${e(thread.key)}"><span class="hg-avatar"><img src="${AVATAR}" alt=""></span><span class="hg-thread-copy"><span class="hg-thread-top"><strong>${e(thread.person.name)}</strong><time>${e(stamp(last, t, locale, now, true))}</time></span><span class="hg-snippet">${snippet}</span></span></button>`;
    }).join('');
    if (archived) return `<div class="app-view mms-app hg-app">${bar({up: true, title: H(t, 'Archived Hangouts'), actions: ''})}<div class="mms-scroll hg-threads">${rows || `<p class="hg-empty">${e(H(t, 'No archived Hangouts'))}</p>`}</div></div>`;
    const pending = data.messageDrafts?.new?.body || data.messageDrafts?.new?.attachment;
    // dnd_list_item.xml: the snooze banner over the list.
    const snoozed = data.hgSnooze > now ? `<div class="hg-dnd-bar"><span><b>${e(H(t, 'Notifications snoozed'))}</b><small>${e(H(t, 'Will resume at %s').replace('%s', new Date(data.hgSnooze).toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit'})))}</small></span><i></i><button data-action="hg-dnd-cancel">${e(H(t, 'Resume'))}</button></div>` : '';
    return `<div class="app-view mms-app hg-app">${bar({title: t('Hangouts'), actions: button('new-message', t('New Hangout'), 'add') + button('mms-menu', t('More options'), 'ic_menu_moreoverflow_normal_holo_light.png')})}${snoozed}<div class="mms-scroll hg-threads">${pending ? `<button class="hg-pending" data-action="new-message">${e(t('Draft'))}: ${e(data.messageDrafts.new.body || t('Picture'))}</button>` : ''}${rows || `<p class="hg-empty">${e(t('No conversations'))}</p>`}</div></div>`;
  }
  function picker(data, ui, t) {
    const draft = data.messageDrafts?.new || {};
    const people = [...data.contacts].sort((a, b) => a.name.localeCompare(b.name));
    return `<div class="app-view mms-app hg-app">${bar({up: true, title: t('New Hangout'), actions: button('mms-menu', t('More options'), 'ic_menu_moreoverflow_normal_holo_light.png')})}<form class="hg-new" data-form="hg-new"><input name="recipient" autocomplete="off" maxlength="60" aria-label="${e(t('Type a name, email, number, or circle'))}" placeholder="${e(t('Type a name, email, number, or circle'))}" value="${e(draft.recipient || '')}"></form><div class="mms-scroll hg-people">${people.map(p => `<button class="hg-person" data-action="hg-pick" data-id="${e(p.id)}" data-search="${e(`${p.name} ${p.phone}`.toLocaleLowerCase())}"><img src="${AVATAR}" alt=""><span><strong>${e(p.name)}</strong><small>${e(p.email || p.phone)}</small></span></button>`).join('')}</div></div>`;
  }
  function conversation(data, ui, t, locale, now) {
    const person = ICSMessaging.identity(ui.thread, data.contacts), draft = data.messageDrafts?.[ICSMessaging.draftKey(ui)] || {};
    const messages = data.messages.filter(m => String(m.contact) === String(ui.thread));
    const actions = button('mms-call', t('Call'), 'call') + button('mms-menu', t('More options'), 'ic_menu_moreoverflow_normal_holo_light.png');
    const cards = messages.map(message => `<button type="button" class="mms-message hg-message ${message.mine ? 'sent' : 'received'}" data-action="mms-message" data-id="${message.id}"><img class="hg-avatar-small" src="${AVATAR}" alt=""><span class="hg-card"><span class="hg-body">${e(message.body)}</span>${message.attachment ? ICSMessaging.photo(message.attachment) : ''}<time>${e(stamp(message, t, locale, now, false))}</time></span></button>`).join('');
    const canSend = (draft.body || '').trim() || draft.attachment;
    return `<div class="app-view mms-app hg-app">${bar({up: true, title: person.name, spinner: true, actions})}<form class="mms-compose hg-compose" data-form="mms-send"><div class="mms-scroll mms-history hg-history">${cards}</div>${draft.attachment ? `<div class="mms-attachment">${ICSMessaging.photo(draft.attachment)}<button type="button" data-action="mms-remove-attachment" aria-label="Remove attachment">×</button></div>` : ''}<div class="mms-compose-bar hg-editor"><textarea name="body" rows="1" maxlength="2000" aria-label="${e(t('Send a message'))}" placeholder="${e(t('Send a message'))}">${e(draft.body || '')}</textarea><small class="mms-counter" hidden></small><button type="button" class="hg-tool" data-action="mms-attach" aria-label="${e(t('Attach'))}">${svg.camera}</button><button class="mms-send hg-send" type="submit" aria-label="${e(t('Send'))}" ${canSend ? '' : 'disabled'}>${svg.send}</button></div></form></div>`;
  }
  function render(data, ui, t, locale, now = Date.now()) {
    if (ui.sub === 'thread') return conversation(data, ui, t, locale, now);
    if (ui.sub === 'new') return picker(data, ui, t);
    return list(data, ui, t, locale, now);
  }
  // Overflow of the conversation list (GSMArena), of a conversation, and the camera button's attach menu.
  // Hangouts 1.0.2's conversation_list_activity_menu.xml (no mood setting yet) and conversation_activity_menu.xml.
  const MENU = [['hg-unsupported', 'Invites'], ['hg-dnd', 'Snooze notifications'], ['hg-archived', 'Archived Hangouts'], ['hg-unsupported', 'Settings'], ['hg-unsupported', 'Send feedback'], ['hg-unsupported', 'Help']];
  const ATTACH = [['hg-unsupported', 'Take photo', 'camera'], ['hg-unsupported', 'Take video', 'video'], ['hg-attach-photo', 'Attach photo', 'photo'], ['hg-unsupported', 'Google+ albums', 'albums']];
  function overlay(data, ui, t) {
    const option = (action, label, id = label) => `<button data-action="${action}" data-id="${e(id)}">${e(H(t, label))}</button>`;
    if (ui.overlay === 'mms-menu') {
      const thread = {key: ui.thread, last: [...data.messages].reverse().find(m => String(m.contact) === String(ui.thread))};
      const items = ui.sub === 'thread' ? [option('hg-unsupported', 'Add people'), isArchived(data, thread) ? option('hg-unarchive', 'Unarchive') : option('hg-archive', 'Archive'), option('mms-delete-thread', 'Delete')] : ui.sub === 'new' ? [option('hg-unsupported', 'Settings'), option('hg-unsupported', 'Help')] : MENU.map(([action, label]) => option(action, label));
      return `<div class="menu-scrim" data-action="close-overlay"></div><div class="hg-menu" role="menu">${items.join('')}</div>`;
    }
    if (ui.overlay === 'mms-hg-dnd') return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog hg-dnd" role="dialog" aria-label="${e(H(t, 'Snooze notifications for…'))}"><h3>${e(H(t, 'Snooze notifications for…'))}</h3><div class="hg-dnd-list">${SNOOZE_MINUTES.map(m => `<button data-action="hg-dnd-set" data-id="${m}">${e(hours(t, m))}</button>`).join('')}</div></div>`;
    if (ui.overlay === 'mms-attach') return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="hg-attach" role="menu">${ATTACH.map(([action, label, icon]) => `<button data-action="${action}" data-id="${e(label)}">${svg[icon]}${e(t(label))}</button>`).join('')}</div>`;
    return null;
  }
  window.Hangouts = {render, overlay, isArchived, SNOOZE_MINUTES, H};
})();
