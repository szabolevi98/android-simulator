/* Hangouts 2.0.303 (the KTU84P image's Hangouts.apk) as the SMS app of the stock Nexus 5 (Android 4.4 Quick Start Guide,
   "Hangouts & SMS"); its menus follow conversation_list_activity_menu, its art is the APK's. A light Holo action bar with the green Hangouts icon, the
   conversation list with square avatars and an SMS tag, the New Hangout picker ("Type a name, email, number, or
   circle") and conversations of white cards on #e5e5e5 with the location and camera buttons beside the editor.
   The SMS data, drafts and message options are shared with the AOSP Mms presentation in messaging.js. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const AVATAR = 'assets/hg-default_avatar.png';
  // Hangouts 2.0.303's own xxhdpi art (32 dp icons): add, handset, location, camera, video, gallery, Google+ gallery, send.
  const ICONS = {add: 'ic_add_gray', call: 'ic_handset_dk', pin: 'ic_location_light_normal', camera: 'ic_camera_dark', video: 'ic_hangout_dark',
    photo: 'ic_gallery_dark', albums: 'ic_plus_gallery_dark', send: 'ic_send_dark_normal'};
  const svg = Object.fromEntries(Object.entries(ICONS).map(([key, file]) => [key, `<img class="hg-icon" src="assets/hg-${file}.png" alt="">`]));
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
    const rows = ICSMessaging.threads(data).map(thread => {
      const draft = thread.draft?.body || thread.draft?.attachment;
      const last = thread.last;
      const snippet = draft ? `<b>${e(t('Draft'))}:</b> ${e(thread.draft.body || t('Picture'))}` : last ? `${last.mine ? e(t('You:')) + ' ' : ''}${e(last.body || t('Picture'))}` : '';
      const unread = thread.messages.some(m => m.read === false);
      return `<button class="hg-thread${unread ? ' unread' : ''}" data-action="thread" data-id="${e(thread.key)}"><span class="hg-avatar"><img src="${AVATAR}" alt=""><img class="hg-sms-badge" src="assets/hg-ic_sms_status_badge.png" alt="SMS"></span><span class="hg-thread-copy"><span class="hg-thread-top"><strong>${e(thread.person.name)}</strong><time>${e(stamp(last, t, locale, now, true))}</time></span><span class="hg-snippet">${snippet}</span></span></button>`;
    }).join('');
    const pending = data.messageDrafts?.new?.body || data.messageDrafts?.new?.attachment;
    return `<div class="app-view mms-app hg-app">${bar({title: t('Hangouts'), actions: button('new-message', t('New Hangout'), 'add') + button('mms-menu', t('More options'), 'ic_menu_moreoverflow_normal_holo_light.png')})}<div class="mms-scroll hg-threads">${pending ? `<button class="hg-pending" data-action="new-message">${e(t('Draft'))}: ${e(data.messageDrafts.new.body || t('Picture'))}</button>` : ''}${rows || `<p class="hg-empty">${e(t('No conversations'))}</p>`}</div></div>`;
  }
  function picker(data, ui, t) {
    const draft = data.messageDrafts?.new || {};
    const people = [...data.contacts].sort((a, b) => a.name.localeCompare(b.name));
    return `<div class="app-view mms-app hg-app">${bar({up: true, title: t('New Hangout'), actions: button('mms-menu', t('More options'), 'ic_menu_moreoverflow_normal_holo_light.png')})}<form class="hg-new" data-form="hg-new"><input name="recipient" autocomplete="off" maxlength="60" aria-label="${e(t('Type a name, email, number, or circle'))}" placeholder="${e(t('Type a name, email, number, or circle'))}" value="${e(draft.recipient || '')}"></form><div class="mms-scroll hg-people">${people.map(p => `<button class="hg-person" data-action="hg-pick" data-id="${e(p.id)}" data-search="${e(`${p.name} ${p.phone}`.toLocaleLowerCase())}"><img src="${AVATAR}" alt=""><span><strong>${e(p.name)}</strong><small>${e(p.phone)} ${e(t('Mobile'))}</small></span></button>`).join('')}</div></div>`;
  }
  function conversation(data, ui, t, locale, now) {
    const person = ICSMessaging.identity(ui.thread, data.contacts), draft = data.messageDrafts?.[ICSMessaging.draftKey(ui)] || {};
    const messages = data.messages.filter(m => String(m.contact) === String(ui.thread));
    const actions = button('mms-call', t('Call'), 'call') + button('mms-menu', t('More options'), 'ic_menu_moreoverflow_normal_holo_light.png');
    const cards = messages.map(message => `<button type="button" class="mms-message hg-message ${message.mine ? 'sent' : 'received'}" data-action="mms-message" data-id="${message.id}"><img class="hg-avatar-small" src="${AVATAR}" alt=""><span class="hg-card"><span class="hg-body">${e(message.body)}</span>${message.attachment ? ICSMessaging.photo(message.attachment) : ''}<time>${e(stamp(message, t, locale, now, false))}</time></span></button>`).join('');
    const canSend = (draft.body || '').trim() || draft.attachment;
    return `<div class="app-view mms-app hg-app">${bar({up: true, title: person.name, subtitle: t('SMS'), spinner: true, actions})}<form class="mms-compose hg-compose" data-form="mms-send"><div class="mms-scroll mms-history hg-history">${cards}</div>${draft.attachment ? `<div class="mms-attachment">${ICSMessaging.photo(draft.attachment)}<button type="button" data-action="mms-remove-attachment" aria-label="Remove attachment">×</button></div>` : ''}<div class="mms-compose-bar hg-editor"><textarea name="body" rows="1" maxlength="2000" aria-label="${e(t('Send an SMS message'))}" placeholder="${e(t('Send an SMS message'))}">${e(draft.body || '')}</textarea><small class="mms-counter" hidden></small><button type="button" class="hg-tool" data-action="hg-location" aria-label="${e(t('Share location'))}">${svg.pin}</button><button type="button" class="hg-tool" data-action="mms-attach" aria-label="${e(t('Attach'))}">${svg.camera}</button><button class="mms-send hg-send" type="submit" aria-label="${e(t('Send'))}" ${canSend ? '' : 'disabled'}>${svg.send}</button></div></form></div>`;
  }
  function render(data, ui, t, locale, now = Date.now()) {
    if (ui.sub === 'thread') return conversation(data, ui, t, locale, now);
    if (ui.sub === 'new') return picker(data, ui, t);
    return list(data, ui, t, locale, now);
  }
  // Overflow of the conversation list (GSMArena), of a conversation, and the camera button's attach menu.
  const MENU = ['Set mood…', 'Invites', 'Snooze notifications', 'Archived Hangouts', 'Settings', 'Send feedback', 'Help'];
  const ATTACH = [['hg-unsupported', 'Take photo', 'camera'], ['hg-unsupported', 'Take video', 'video'], ['hg-attach-photo', 'Attach photo', 'photo'], ['hg-unsupported', 'Google+ albums', 'albums']];
  function overlay(data, ui, t) {
    const option = (action, label, id = label) => `<button data-action="${action}" data-id="${e(id)}">${e(t(label))}</button>`;
    if (ui.overlay === 'mms-menu') {
      const items = ui.sub === 'thread' ? [option('mms-delete-thread', 'Delete'), option('mms-discard', 'Discard draft'), option('hg-unsupported', 'Settings'), option('hg-unsupported', 'Help')] : ui.sub === 'new' ? [option('hg-unsupported', 'Settings'), option('hg-unsupported', 'Help')] : MENU.map(label => option('hg-unsupported', label));
      return `<div class="menu-scrim" data-action="close-overlay"></div><div class="hg-menu" role="menu">${items.join('')}</div>`;
    }
    if (ui.overlay === 'mms-attach') return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="hg-attach" role="menu">${ATTACH.map(([action, label, icon]) => `<button data-action="${action}" data-id="${e(label)}">${svg[icon]}${e(t(label))}</button>`).join('')}</div>`;
    return null;
  }
  window.Hangouts = {render, overlay};
})();
