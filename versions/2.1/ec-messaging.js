/* Android 2.1 Messaging (Mms.apk, ERE27; behaviour read from Mms.odex).
   - ConversationList (conversation_list_screen.xml, title "Messaging"): the "New message" / "Compose new message" header,
     then conversation_header.xml rows (listPreferredItemHeight; the QuickContactBadge, from in 18 sp with " (n)" for more
     than one message, the snippet 14 sp, the date 14 sp secondary at the right; unread rows bold on #404040, read on
     #000). Dates: MessageUtils.formatTimeStampString (today the time "h:mmaa", this year "Oct 5", else with the year).
     Menu (onPrepareOptionsMenu): Compose, Delete threads (with threads), Search, Settings. Holding a thread: its
     contact as the title, View thread, View contact (or Add to Contacts for a number not in Contacts), Delete thread.
     Deleting asks first ("The entire thread will be deleted." / "All threads will be deleted.", Delete / Cancel; with
     locked messages the "Delete locked messages" box, off, keeps them).
   - Search: onSearchRequested opens the search dialog for Mms's searchable (hint "Messaging Search"); SearchActivity
     lists the matching messages on white (search_item.xml: stat_notify_sms, the contact 16 sp, the text 13 sp grey)
     with the title "n results for "…"", or "No matches".
   - ComposeMessageActivity (compose_message_activity.xml): ContactHeaderWidget with the recipient; the top panel
     (white_background, padding 5 dp) with the RecipientsEditor for a new message ("To", the contacts it matches:
     recipient_filter_item, name, number type and number) and the Subject field (singleLine, 40 characters) once added;
     the MessageListView on white with message_list_item rows (18 sp black; "<b>name</b>: " then "<Subject: …> - " for
     MMS, the text with SmileyParser's icons, a 3 px spacer line and the timestamp in 12 px #bf000000, "Sent: …" for
     ours; ours on white, received on light_blue_background #ecfbff; the right status indicator: ic_email_pending while it
     goes out, ic_lock_message_sms when locked); the bottom panel (bottombar_landscape_565, padding 5 dp) with the
     embedded editor (edit_text, "Type to compose", up to 4 lines, 1000 characters; text_counter in 11 sp bold white on
     #88000000 at its top right: "remaining / messages" from 60 characters on, when more than one message or 10 or fewer
     are left, by SmsMessage.calculateLength: GSM 7-bit 160 / 153, else 70 / 67) and Send (on only when it can be sent).
     A subject, or text of MmsConfig's 4 messages or more, makes it a multimedia message ("Converting to multimedia
     message…" / "Converting to text message…" when that changes back: Delete in an empty subject removes it).
     Menu (onPrepareOptionsMenu): Call, View contact, Add subject, Attach, Send, Insert smiley, Delete thread / Discard,
     All threads, Add to Contacts. Insert smiley: the 17 SmileyParser icons with Mms's names and texts (smiley_menu_item:
     20 dp icon 18 dp in, the name and the text in textAppearanceLarge). Attach: AttachmentTypeSelectorAdapter (Pictures,
     Capture picture, Videos, Capture video, Audio, Record audio, Slideshow) under ic_dialog_attach.
     Holding a message ("Message options"): Lock / Unlock message, Call / Send email to / Add … to Contacts for the
     numbers and addresses in it, Forward, Copy message text, View message details, Delete message.
   The conversations are made up (the 2.3.6 simulator's). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const M = () => EC.text('mms');
  const F = () => EC.text('framework');
  const H = 3600000;
  // box: 1 inbox, 2 sent, 4 outbox (going out); ago: ms before the first start.
  EC.defaults.sms = [
    {id: 1, address: '202-555-0148', body: 'Hey! Are we still on for coffee tomorrow?', box: 1, ago: 2.2 * H, read: true},
    {id: 2, address: '202-555-0148', body: 'Absolutely. See you at 11!', box: 2, ago: 2.1 * H, read: true},
    {id: 3, address: '202-555-0107', body: 'Don’t forget to call this weekend :)', box: 1, ago: 26 * H, read: false}
  ];
  const digits = n => String(n).replace(/[^\d+]/g, '');
  const person = (c, address) => (c.data.contacts || []).find(p => EC.contactModel.raws(p).some(r => (r.phone || []).some(x => digits(x.value) === digits(address))));
  const nameOf = (c, address) => person(c, address)?.name || address;
  const when = (c, m) => m.when ?? (c.data.smsBase || Date.now()) - m.ago;
  const hm = (c, d) => `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}${c.javaAmPm(d.getHours())}`;
  function stamp(c, t) {
    const d = new Date(t), now = new Date();
    if (d.toDateString() === now.toDateString()) return hm(c, d);
    return d.toLocaleDateString(c.locale(), d.getFullYear() === now.getFullYear() ? {month: 'short', day: 'numeric'} : {year: 'numeric', month: 'short', day: 'numeric'});
  }
  // formatTimeStampString with fullFormat: the date with the year and the time.
  const fullStamp = (c, t) => { const d = new Date(t); return `${d.toLocaleDateString(c.locale(), {year: 'numeric', month: 'short', day: 'numeric'})} ${hm(c, d)}`; };
  function threads(c) {
    const by = new Map();
    for (const m of c.data.sms || []) { const k = digits(m.address); (by.get(k) || by.set(k, []).get(k)).push(m); }
    return [...by.values()].map(list => { list.sort((a, b) => when(c, a) - when(c, b)); return {address: list[0].address, list, last: list.at(-1)}; })
      .sort((a, b) => when(c, b.last) - when(c, a.last));
  }
  const threadOf = (c, address) => threads(c).find(t => digits(t.address) === digits(address));
  const badge = () => `<span class="ecms-badge"><i class="ec-bg np-fw-quickcontact_badge_unpressed"></i><img src="assets/mm-ic_contact_picture.png" alt=""></span>`;

  // SmileyParser: the texts Mms knows, each with com.android.internal.widget.Smileys' icon.
  const SMILEYS = ['happy', 'sad', 'winking', 'tongue_sticking_out', 'surprised', 'kissing', 'yelling', 'cool', 'money_mouth', 'foot_in_mouth', 'embarrassed', 'angel',
    'undecided', 'crying', 'lips_are_sealed', 'laughing', 'wtf'];
  const smileyTexts = () => M().t('default_smiley_texts');
  function withSmileys(text) {
    const texts = smileyTexts();
    if (!Array.isArray(texts)) return esc(text);
    const order = texts.map((t, i) => [t, i]).sort((a, b) => b[0].length - a[0].length);
    const re = new RegExp(order.map(([t]) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
    let out = '', at = 0;
    for (const m of String(text).matchAll(re)) {
      out += esc(text.slice(at, m.index)) + `<img class="ecms-emo" src="assets/fw-emo_im_${SMILEYS[texts.indexOf(m[0])]}.png" alt="${esc(m[0])}">`;
      at = m.index + m[0].length;
    }
    return out + esc(text.slice(at));
  }

  // SmsMessage.calculateLength: GSM 7-bit (the extension table counts twice) 160 / 153 a part, else UCS-2 70 / 67.
  const GSM = '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà';
  const GSM_EXT = '^{}\\[~]|€\f';
  function smsLength(text) {
    let septets = 0, gsm = true;
    for (const ch of text) { if (GSM.includes(ch)) septets++; else if (GSM_EXT.includes(ch)) septets += 2; else { gsm = false; break; } }
    const units = gsm ? septets : [...text].length, single = gsm ? 160 : 70, part = gsm ? 153 : 67;
    if (units <= single) return {count: 1, remaining: single - units};
    const count = Math.ceil(units / part);
    return {count, remaining: count * part - units};
  }
  // WorkingMessage: a subject, or text of MmsConfig.getSmsToMmsTextThreshold() (4) messages or more, needs MMS.
  const needsMms = c => c.ui.smsSubject !== undefined || !!c.ui.smsAttach || smsLength(c.ui.smsDraft || '').count >= 4;
  EC.mmsNeeds = needsMms;
  const recipient = c => c.ui.smsThread || (() => {
    const raw = (c.ui.smsTo || '').trim(), hit = (c.data.contacts || []).find(p => p.name.toLocaleLowerCase() === raw.toLocaleLowerCase());
    return hit ? hit.phone : raw;
  })();
  const prepared = c => !!recipient(c) && (!!(c.ui.smsDraft || '').trim() || !!c.ui.smsAttach);

  // Conversation list ---------------------------------------------------------------------------------------------------------
  function list(c) {
    const rows = threads(c).map(t => {
      const unread = t.list.some(m => m.box === 1 && !m.read);
      return `<button type="button" class="ecms-row${unread ? ' unread' : ''}" data-action="ecms-open" data-address="${esc(t.address)}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i>${badge()}
        <span class="ecms-from">${esc(nameOf(c, t.address))}${t.list.length > 1 ? ` (${t.list.length})` : ''}</span>
        <span class="ecms-subject">${esc(t.last.subject ? t.last.subject : t.last.body)}</span><span class="ecms-date">${esc(stamp(c, when(c, t.last)))}</span></button><i class="ecph-div"></i>`;
    }).join('');
    return c.window(M().t('app_label'), `<div class="ecms-list"><button type="button" class="ecms-row" data-action="ecms-new"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i>${badge()}<span class="ecms-from">${esc(M().t('new_message'))}</span><span class="ecms-subject">${esc(M().t('create_new_message'))}</span></button><i class="ecph-div"></i>${rows}</div>`);
  }
  function confirmDelete(c, message, list, done) {
    const locked = list.some(m => m.locked);
    let keepLocked = true;
    c.dialog({title: M().t('confirm_dialog_title'), icon: 'fw-ic_dialog_alert.png', message: locked ? undefined : message,
      html: locked ? `<div class="ecms-deldlg"><div>${esc(message)}</div>${c.checkbox('locked', false, M().t('delete_unlocked'))}</div>` : undefined,
      action(name, el) {
        if (name !== 'ecui-check') return false;
        keepLocked = el.getAttribute('aria-pressed') === 'true'; el.setAttribute('aria-pressed', !keepLocked); el.querySelector('img').src = `assets/fw-btn_check_${keepLocked ? 'off' : 'on'}.png`;
        return true;
      },
      buttons: [{label: M().t('delete'), action: () => {
        const gone = new Set(list.filter(m => !(keepLocked && m.locked)));
        c.data.sms = (c.data.sms || []).filter(m => !gone.has(m)); c.save(); done?.(); c.render();
      }}, {label: M().t('no')}]});
  }
  function threadMenu(c, address) {
    const p = person(c, address), t = threadOf(c, address);
    const items = [[M().t('menu_view'), () => { c.ui.smsThread = address; c.open('messaging', 'compose'); }],
      p ? [M().t('menu_view_contact'), () => { c.ui.contactId = p.id; c.open('contact-view'); }] : [M().t('menu_add_to_contacts'), () => EC.contactPick(c, address)],
      [M().t('menu_delete'), () => confirmDelete(c, M().t('confirm_delete_conversation'), t?.list || [])]];
    c.dialog({title: nameOf(c, address), icon: null, items: items.map(i => i[0]), onItem: i => setTimeout(() => items[i][1](), 0)});
  }

  // Search ---------------------------------------------------------------------------------------------------------------------
  function searchRender(c) {
    const q = c.ui.smsQuery || '', v = q.toLocaleLowerCase();
    const hits = (c.data.sms || []).filter(m => `${m.subject || ''} ${m.body}`.toLocaleLowerCase().includes(v)).sort((a, b) => when(c, b) - when(c, a));
    const mark = text => { const i = text.toLocaleLowerCase().indexOf(v); return i < 0 ? esc(text) : `${esc(text.slice(0, i))}<b>${esc(text.slice(i, i + q.length))}</b>${esc(text.slice(i + q.length))}`; };
    const rows = hits.map(m => `<button type="button" class="ecms-hitrow" data-action="ecms-open" data-address="${esc(m.address)}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span class="ecms-hitline"><img src="assets/mm-stat_notify_sms.png" alt=""><b>${esc(nameOf(c, m.address))}</b></span><span class="ecms-hitsnip">${mark(m.body)}</span></button><i class="ecms-mdiv"></i>`).join('');
    return c.window(M().plural('search_results_title', hits.length, c.lang, hits.length, q), `<div class="ecms-search">${rows || `<div class="ecms-empty">${esc(M().t('search_empty'))}</div>`}</div>`);
  }
  const search = c => c.searchDialog({icon: 'app-messaging.png', hint: M().t('search_hint'), onGo: q => { if (!q.trim()) return; c.ui.smsQuery = q.trim(); c.open('messaging', 'search'); }});

  // Compose --------------------------------------------------------------------------------------------------------------------
  function messageHtml(c, m) {
    const mine = m.box !== 1, who = mine ? M().t('messagelist_sender_self') : nameOf(c, m.address), t = stamp(c, when(c, m));
    const [pre, post = ''] = M().t('name_colon').split('%s');
    // formatMessage: "<Subject: …>" only when there is one (TextUtils.isEmpty).
    const subject = m.mms && m.subject ? `${esc(M().fmt('inline_subject', c.lang, m.subject))}${m.body ? ' - ' : ''}` : '';
    const icon = m.box === 4 ? 'mm-ic_email_pending.png' : m.locked ? 'mm-ic_lock_message_sms.png' : '';
    return `<div class="ecms-msg${mine ? '' : ' in'}" data-id="${m.id}"><span class="ecms-body">${EC.mmsRowView?.(m) || ''}<span>${esc(pre)}<b>${esc(who)}</b>${esc(post)}${subject}${withSmileys(m.body)}</span><i class="ecms-spacer"></i><small>${esc(mine ? M().fmt('sent_on', c.lang, t) : t)}</small></span>${icon ? `<img class="ecms-status" src="assets/${icon}" alt="">` : ''}</div>`;
  }
  function compose(c) {
    const address = c.ui.smsThread, fresh = !address;
    const msgs = fresh ? [] : threadOf(c, address)?.list || [];
    const head = fresh ? '' : `<div class="eccv-head"><i class="ec-bg np-fw-title_bar_medium"></i>${badge()}<span class="eccv-name">${esc(nameOf(c, address))}</span></div>`;
    const edit = (cls, extra) => `<span class="ecwf-edit npp-fw-textfield_default"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><input class="ecwf-input ${cls}" ${extra} autocomplete="off" spellcheck="false"></span>`;
    const to = fresh ? `<div class="ecms-to-wrap">${edit('ecms-to', `data-field="to" placeholder="${esc(M().t('to_hint'))}" value="${esc(c.ui.smsTo || '')}"`)}<div class="ecms-suggest"></div></div>` : '';
    const subject = c.ui.smsSubject !== undefined ? edit('ecms-subj', `maxlength="40" placeholder="${esc(M().t('subject_hint'))}" value="${esc(c.ui.smsSubject)}"`) : '';
    const top = to || subject ? `<div class="ecms-top">${to}${subject}</div>` : '';
    // A slideshow carries its own text and Send (drawBottomPanel hides the editor).
    const show = c.ui.smsAttach?.type === 'slideshow';
    return `<div class="ecms-compose">${head}${top}<div class="ecms-history">${msgs.map(m => messageHtml(c, m)).join('<i class="ecms-mdiv"></i>')}</div>${EC.mmsAttachEditor?.(c) || ''}
      <div class="ecms-bottom"${show ? ' hidden' : ''}><span class="ecms-editor"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><textarea class="ecms-text" data-ime="im" rows="1" maxlength="1000" placeholder="${esc(M().t('type_to_compose_text_enter_to_send'))}">${esc(c.ui.smsDraft || '')}</textarea><b class="ecms-counter" hidden></b></span>
        <button type="button" class="ecui-button ecms-send" data-action="ecms-send"${prepared(c) ? '' : ' disabled'}><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(M().t('send'))}</span></button></div></div>`;
  }
  // updateCounter, updateSendButtonState and the protocol change, as the text changes.
  function update(c, root, wasMms) {
    const text = c.ui.smsDraft || '', counter = root.querySelector('.ecms-counter'), mms = needsMms(c);
    if (counter) {
      const {count, remaining} = smsLength(text);
      const show = text.length >= 60 && !mms && (count > 1 || remaining <= 10);
      counter.hidden = !show; if (show) counter.textContent = `${remaining} / ${count}`;
    }
    const send = root.querySelector('.ecms-send');
    if (send) { send.disabled = !prepared(c); send.querySelector('.ec-pressed').hidden = send.disabled; }
    if (wasMms !== undefined && wasMms !== mms) c.toast(M().t(mms ? 'converting_to_picture_message' : 'converting_to_text_message'));
  }
  function suggest(c, root) {
    const box = root.querySelector('.ecms-suggest'), input = root.querySelector('.ecms-to');
    if (!box || !input) return;
    const q = input.value.trim().toLocaleLowerCase();
    // RecipientsAdapter: a row per phone number of the matching contacts.
    const phones = (c.data.contacts || []).flatMap(p => EC.contactModel.raws(p).flatMap(r => (r.phone || []).map(x => ({name: p.name, phone: x.value, label: EC.contactModel.typeLabel('phone', x)}))));
    const hits = q ? phones.filter(p => p.name.toLocaleLowerCase().split(/\s+/).some(w => w.startsWith(q)) || digits(p.phone).startsWith(digits(q)) && digits(q)) : [];
    box.innerHTML = hits.map(p => `<button type="button" class="ecms-hit" data-action="ecms-pick" data-address="${esc(p.phone)}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span class="ecms-hit-l1"><span>${esc(p.name)}</span><span class="ecms-hit-type">${esc(p.label)}</span></span><span class="ecms-hit-l2">${esc(p.phone)}</span></button>`).join('');
  }
  function send(c) {
    if (!prepared(c)) return;
    const address = recipient(c), mms = needsMms(c);
    const m = {id: Date.now(), address, body: (c.ui.smsDraft || '').trim(), box: 4, when: Date.now(), read: true, ...(mms ? {mms: true, subject: c.ui.smsSubject ?? ''} : {}), ...(c.ui.smsAttach ? {attach: c.ui.smsAttach} : {})};
    c.data.sms = [...(c.data.sms || []), m];
    c.ui.smsThread = address; c.ui.smsDraft = ''; c.ui.smsTo = ''; c.ui.smsSubject = undefined; c.ui.smsAttach = null;
    c.save(); c.render();
    // SmsReceiverService: the message leaves the outbox once the radio has sent it.
    setTimeout(() => { m.box = 2; c.save(); if (c.ui.view === 'messaging') c.render(); }, mms ? 4000 : 1500);
  }
  function insertSmiley(c) {
    const texts = smileyTexts(), names = M().t('default_smiley_names');
    c.dialog({title: M().t('menu_insert_smiley'), icon: null, rows: 'smiley', items: SMILEYS.map((s, i) => ({label: names[i], icon: `fw-emo_im_${s}.png`, text: texts[i]})),
      onItem: i => {
        const field = c.el.viewport.querySelector('.ecms-text'), at = field ? field.selectionStart ?? field.value.length : (c.ui.smsDraft || '').length, cur = c.ui.smsDraft || '';
        c.ui.smsDraft = cur.slice(0, at) + texts[i] + cur.slice(at); c.render();
      }});
  }
  // AttachmentTypeSelectorAdapter's rows; each opens what MessageUtils / ComposeMessageActivity starts for it.
  function attach(c) {
    const items = [['attach_image', 'mm-ic_launcher_gallery.png', 'image'], ['attach_take_photo', 'mm-ic_launcher_camera.png', 'take-photo'], ['attach_video', 'mm-ic_launcher_video_player.png', 'video'],
      ['attach_record_video', 'mm-ic_launcher_camera_record.png', 'record-video'], ['attach_sound', 'mm-ic_launcher_musicplayer_2.png', 'sound'], ['attach_record_sound', 'mm-ic_launcher_record_audio.png', 'record-sound'],
      ['attach_slideshow', 'mm-ic_launcher_slideshow_add_sms.png', 'slideshow']];
    c.dialog({title: M().t('add_attachment'), icon: 'mm-ic_dialog_attach.png', rows: 'iconlist', items: items.map(([k, icon]) => ({label: M().t(k), icon})), onItem: i => setTimeout(() => EC.mmsAttach?.(c, items[i][2]), 0)});
  }
  // MessageItem's numbers and addresses (addCallAndContactMenuItems, by Linkify's patterns).
  function linkItems(c, m) {
    const out = [], seen = new Set();
    for (const [, a] of m.body.matchAll(/(\+?\d[\d\-\s().]{5,}\d)/g)) {
      const n = digits(a); if (seen.has(n)) continue; seen.add(n);
      out.push([M().fmt('menu_call_back', c.lang, a), () => { c.ui.callNumber = a; c.open('incall'); }]);
      if (!person(c, a)) out.push([M().fmt('menu_add_address_to_contacts', c.lang, a), () => EC.contactPick(c, a)]);
    }
    for (const [a] of m.body.matchAll(/[\w.+-]+@[\w-]+\.[\w.-]+/g)) {
      if (seen.has(a)) continue; seen.add(a);
      out.push([M().fmt('menu_send_email', c.lang, a), () => { c.ui.composeTo = a; c.open('email'); }]);
    }
    return out;
  }
  function messageMenu(c, id) {
    const m = (c.data.sms || []).find(x => x.id === id);
    if (!m) return;
    const details = () => {
      const mine = m.box !== 1, lines = [M().t('message_type_label') + M().t(m.mms ? 'multimedia_message' : 'text_message'),
        M().t(mine ? 'to_address_label' : 'from_label') + m.address, M().t(mine ? 'sent_label' : 'received_label') + fullStamp(c, when(c, m))];
      if (m.mms && m.subject) lines.push(M().t('subject_label') + m.subject);
      c.dialog({title: M().t('message_details_title'), icon: null, message: lines.join('\n'), buttons: [{label: M().t('yes')}]});
    };
    const items = [[M().t(m.locked ? 'menu_unlock' : 'menu_lock'), () => { m.locked = !m.locked; c.save(); c.render(); }], ...linkItems(c, m),
      [M().t('menu_forward'), () => { c.ui.smsThread = null; c.ui.smsTo = ''; c.ui.smsDraft = m.body; c.ui.smsSubject = m.mms ? `${M().t('forward_prefix')}${m.subject || ''}` : undefined; c.open('messaging', 'compose', {replace: true}); }],
      ...(m.mms ? [] : [[M().t('copy_message_text'), () => { c.ui.clipboard = m.body; navigator.clipboard?.writeText(m.body).catch(() => {}); }]]),
      [M().t('view_message_details'), details],
      [M().t('delete_message'), () => c.dialog({title: M().t('confirm_dialog_title'), icon: 'fw-ic_dialog_alert.png', message: M().t(m.locked ? 'confirm_delete_locked_message' : 'confirm_delete_message'),
        buttons: [{label: M().t('delete'), action: () => { c.data.sms = c.data.sms.filter(x => x !== m); c.save(); c.render(); }}, {label: M().t('no')}]})]];
    c.dialog({title: M().t('message_options'), icon: null, items: items.map(i => i[0]), onItem: i => setTimeout(() => items[i][1](), 0)});
  }
  const held = (c, root, selector, fn) => {
    for (const el of root.querySelectorAll(selector)) {
      let timer = 0;
      el.addEventListener('pointerdown', () => { timer = setTimeout(() => { c.suppressClick = Date.now() + 400; fn(el); }, 500); });
      for (const t of ['pointerup', 'pointerleave', 'pointercancel']) el.addEventListener(t, () => clearTimeout(timer));
    }
  };

  EC.register('messaging', {
    title: 'Messaging',
    render(c) { return c.ui.sub === 'compose' ? compose(c) : c.ui.sub === 'search' ? searchRender(c) : list(c); },
    mount(c, root) {
      if (!c.data.smsBase) { c.data.smsBase = Date.now(); c.save(); }
      held(c, root, '.ecms-row[data-address]', el => threadMenu(c, el.dataset.address));
      held(c, root, '.ecms-msg', el => messageMenu(c, Number(el.dataset.id)));
      const text = root.querySelector('.ecms-text');
      if (text) {
        const grow = () => { text.style.height = 'auto'; text.style.height = `${Math.min(text.scrollHeight, text.clientHeight && parseFloat(getComputedStyle(text).lineHeight) * 4 || 999)}px`; };
        text.addEventListener('input', () => { const was = needsMms(c); c.ui.smsDraft = text.value; grow(); update(c, root, was); });
        grow(); update(c, root);
        const h = root.querySelector('.ecms-history'); if (h) h.scrollTop = h.scrollHeight;
      }
      const subj = root.querySelector('.ecms-subj');
      if (subj) {
        subj.addEventListener('input', () => { c.ui.smsSubject = subj.value; });
        // Delete in an empty subject takes the subject editor away (and with it the MMS).
        subj.addEventListener('keydown', event => { if (event.key === 'Backspace' && !subj.value) { c.ui.smsSubject = undefined; c.toast(M().t(needsMms(c) ? 'converting_to_picture_message' : 'converting_to_text_message')); c.render(); } });
      }
      const to = root.querySelector('.ecms-to');
      if (to) { to.addEventListener('input', () => { c.ui.smsTo = to.value; suggest(c, root); update(c, root); }); if (!c.ui.smsTo) setTimeout(() => to.focus(), 50); }
      // Opening a thread marks it read.
      if (c.ui.sub === 'compose' && c.ui.smsThread) {
        let changed = false;
        for (const m of c.data.sms || []) if (digits(m.address) === digits(c.ui.smsThread) && !m.read) { m.read = true; changed = true; }
        if (changed) c.save();
      }
    },
    action(name, el, event, c) {
      if ((c.suppressClick || 0) > Date.now() && name.startsWith('ecms-')) return true;
      switch (name) {
        case 'ecms-new': c.ui.smsThread = null; c.ui.smsTo = ''; c.ui.smsSubject = undefined; c.ui.smsAttach = null; c.open('messaging', 'compose'); return true;
        case 'ecms-open': c.ui.smsThread = el.dataset.address; c.ui.smsSubject = undefined; c.ui.smsAttach = null; c.open('messaging', 'compose'); return true;
        case 'ecms-pick': c.ui.smsThread = el.dataset.address; c.ui.smsTo = ''; c.render(); return true;
        case 'ecms-send': send(c); return true;
      }
      return false;
    },
    search(c) { if (c.ui.sub === 'compose') return false; search(c); return true; },
    menu(c) {
      if (c.ui.sub === 'search') return true;
      if (c.ui.sub !== 'compose') {
        const any = threads(c).length > 0;
        c.menu([{label: M().t('menu_compose_new'), icon: 'fw-ic_menu_compose.png', action: () => EC.module('messaging').action('ecms-new', document.createElement('i'), null, c)},
          ...(any ? [{label: M().t('menu_delete_all'), icon: 'fw-ic_menu_delete.png', action: () => confirmDelete(c, M().t('confirm_delete_all_conversations'), c.data.sms || [])}] : []),
          {label: M().t('framework/search_go'), icon: 'fw-ic_menu_search.png', action: () => search(c)},
          {label: M().t('menu_preferences'), icon: 'fw-ic_menu_preferences.png', action: () => c.open('messaging-settings')}]);
        return true;
      }
      const address = recipient(c), p = address && person(c, address), t = c.ui.smsThread && threadOf(c, c.ui.smsThread);
      c.menu([...(address ? [{label: M().t('menu_call'), icon: 'fw-ic_menu_call.png', action: () => { c.ui.callNumber = EC.formatNumber?.(address) || address; c.open('incall'); }}] : []),
        ...(p ? [{label: M().t('menu_view_contact'), icon: 'mm-ic_menu_contact.png', action: () => { c.ui.contactId = p.id; c.open('contact-view'); }}] : []),
        ...(c.ui.smsSubject === undefined ? [{label: M().t('add_subject'), icon: 'fw-ic_menu_edit.png', action: () => { const was = needsMms(c); c.ui.smsSubject = ''; c.render(); c.el.viewport.querySelector('.ecms-subj')?.focus(); if (!was) c.toast(M().t('converting_to_picture_message')); }}] : []),
        ...(c.ui.smsAttach ? [] : [{label: M().t('add_attachment'), icon: 'mm-ic_menu_attachment.png', action: () => attach(c)}]),
        ...(prepared(c) ? [{label: M().t('send'), icon: 'fw-ic_menu_send.png', action: () => send(c)}] : []),
        {label: M().t('menu_insert_smiley'), icon: 'fw-ic_menu_emoticons.png', action: () => insertSmiley(c)},
        t?.list.length ? {label: M().t('delete_thread'), icon: 'fw-ic_menu_delete.png', action: () => confirmDelete(c, M().t('confirm_delete_conversation'), t.list, () => { c.ui.sub = ''; })}
          : {label: M().t('discard'), icon: 'fw-ic_menu_delete.png', action: () => { c.ui.smsDraft = ''; c.ui.smsSubject = undefined; c.ui.smsAttach = null; c.back(); }},
        {label: M().t('all_threads'), icon: 'fw-ic_menu_friendslist.png', action: () => { c.ui.sub = ''; c.render(); }},
        ...(address && !p ? [{label: M().t('menu_add_to_contacts'), icon: 'fw-ic_menu_add.png', action: () => EC.contactPick(c, address)}] : [])]);
      return true;
    }
  });
  // Text contact (ViewContactActivity) opens the thread with that number.
  document.addEventListener('DOMContentLoaded', () => {
    const c = EC.context, open = c.open;
    c.open = (view, sub, opts) => {
      if (view === 'messaging' && c.ui.composeTo) { c.ui.smsThread = c.ui.composeTo; c.ui.composeTo = null; return open(view, 'compose', opts); }
      return open(view, sub, opts);
    };
  });
})();
