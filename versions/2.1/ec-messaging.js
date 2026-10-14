/* Android 2.1 Messaging (Mms.apk, ERE27).
   - ConversationList (conversation_list_screen.xml, title "Messaging"): the "New message" / "Compose new message" header,
     then conversation_header.xml rows (listPreferredItemHeight; the QuickContactBadge, from in 18 sp with " (n)" for more
     than one message, the snippet 14 sp, the date 14 sp secondary at the right; unread rows bold on #404040, read on
     #000). Dates: MessageUtils.formatTimeStampString (today the time "h:mmaa", this year "Oct 5", else with the year).
     Menu: Compose (ic_menu_compose), Delete threads, Search, Settings.
   - ComposeMessageActivity (compose_message_activity.xml): ContactHeaderWidget with the recipient; for a new message the
     RecipientsEditor ("To", white_background, padding 5 dp) with the contacts it matches (recipient_filter_item: name,
     number type and number); the MessageListView on white with message_list_item rows (18 sp black; "<b>name</b>: body",
     a 3 px spacer line and the timestamp in 12 px #bf000000, "Sent: …" for ours; ours on white, received on
     light_blue_background #ecfbff; divider_horizontal_bright); the bottom panel (bottombar_landscape_565, padding 5 dp)
     with the embedded editor (edit_text, "Type to compose", up to 4 lines) and Send. Menu: Call / View contact (a
     thread), Add subject, Attach, Insert smiley, Delete thread / Discard, All threads.
   The conversations are made up (the 2.3.6 simulator's). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const M = () => EC.text('mms');
  const H = 3600000;
  // box: 1 inbox, 2 sent; ago: ms before the first start.
  EC.defaults.sms = [
    {id: 1, address: '202-555-0148', body: 'Hey! Are we still on for coffee tomorrow?', box: 1, ago: 2.2 * H, read: true},
    {id: 2, address: '202-555-0148', body: 'Absolutely. See you at 11!', box: 2, ago: 2.1 * H, read: true},
    {id: 3, address: '202-555-0107', body: 'Don’t forget to call this weekend :)', box: 1, ago: 26 * H, read: false}
  ];
  const digits = n => String(n).replace(/[^\d+]/g, '');
  const person = (c, address) => (c.data.contacts || []).find(p => digits(p.phone) === digits(address));
  const nameOf = (c, address) => person(c, address)?.name || address;
  const when = (c, m) => m.when ?? (c.data.smsBase || Date.now()) - m.ago;
  function stamp(c, t) {
    const d = new Date(t), now = new Date();
    if (d.toDateString() === now.toDateString()) return `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}${c.javaAmPm(d.getHours())}`;
    return d.toLocaleDateString(c.locale(), d.getFullYear() === now.getFullYear() ? {month: 'short', day: 'numeric'} : {year: 'numeric', month: 'short', day: 'numeric'});
  }
  function threads(c) {
    const by = new Map();
    for (const m of c.data.sms || []) { const k = digits(m.address); (by.get(k) || by.set(k, []).get(k)).push(m); }
    return [...by.values()].map(list => { list.sort((a, b) => when(c, a) - when(c, b)); return {address: list[0].address, list, last: list.at(-1)}; })
      .sort((a, b) => when(c, b.last) - when(c, a.last));
  }
  const badge = () => `<span class="ecms-badge"><i class="ec-bg np-fw-quickcontact_badge_unpressed"></i><img src="assets/mm-ic_contact_picture.png" alt=""></span>`;

  function list(c) {
    const rows = threads(c).map(t => {
      const unread = t.list.some(m => m.box === 1 && !m.read);
      return `<button type="button" class="ecms-row${unread ? ' unread' : ''}" data-action="ecms-open" data-address="${esc(t.address)}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i>${badge()}
        <span class="ecms-from">${esc(nameOf(c, t.address))}${t.list.length > 1 ? ` (${t.list.length})` : ''}</span>
        <span class="ecms-subject">${esc(t.last.body)}</span><span class="ecms-date">${esc(stamp(c, when(c, t.last)))}</span></button><i class="ecph-div"></i>`;
    }).join('');
    return c.window(M().t('app_label'), `<div class="ecms-list"><button type="button" class="ecms-row" data-action="ecms-new"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i>${badge()}<span class="ecms-from">${esc(M().t('new_message'))}</span><span class="ecms-subject">${esc(M().t('create_new_message'))}</span></button><i class="ecph-div"></i>${rows}</div>`);
  }

  function compose(c) {
    const address = c.ui.smsThread, fresh = !address;
    const msgs = fresh ? [] : threads(c).find(t => digits(t.address) === digits(address))?.list || [];
    const head = fresh ? '' : `<div class="eccv-head"><i class="ec-bg np-fw-title_bar_medium"></i>${badge()}<span class="eccv-name">${esc(nameOf(c, address))}</span></div>`;
    const to = fresh ? `<div class="ecms-recipients"><span class="ecwf-edit npp-fw-textfield_default"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><input class="ecwf-input ecms-to" data-field="to" placeholder="${esc(M().t('to_hint'))}" value="${esc(c.ui.smsTo || '')}" autocomplete="off" spellcheck="false"></span><div class="ecms-suggest"></div></div>` : '';
    const items = msgs.map(m => {
      const mine = m.box === 2, who = mine ? M().t('messagelist_sender_self') : nameOf(c, m.address), t = stamp(c, when(c, m));
      const [pre, post = ''] = M().t('name_colon').split('%s');
      return `<div class="ecms-msg${mine ? '' : ' in'}"><span>${esc(pre)}<b>${esc(who)}</b>${esc(post)}${esc(m.body)}</span><i class="ecms-spacer"></i><small>${esc(mine ? M().fmt('sent_on', c.lang, t) : t)}</small></div>`;
    }).join('<i class="ecms-mdiv"></i>');
    return `<div class="ecms-compose">${head}${to}<div class="ecms-history">${items}</div>
      <div class="ecms-bottom"><span class="ecms-editor"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><textarea class="ecms-text" data-ime="im" rows="1" maxlength="1000" placeholder="${esc(M().t('type_to_compose_text_enter_to_send'))}">${esc(c.ui.smsDraft || '')}</textarea></span>
        <button type="button" class="ecui-button ecms-send" data-action="ecms-send"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(M().t('send'))}</span></button></div></div>`;
  }
  function suggest(c, root) {
    const box = root.querySelector('.ecms-suggest'), input = root.querySelector('.ecms-to');
    if (!box || !input) return;
    const q = input.value.trim().toLocaleLowerCase();
    const types = EC.text('contacts').t('phoneTypes');
    const hits = q ? (c.data.contacts || []).filter(p => p.name.toLocaleLowerCase().split(/\s+/).some(w => w.startsWith(q)) || digits(p.phone).startsWith(digits(q)) && digits(q)) : [];
    box.innerHTML = hits.map(p => `<button type="button" class="ecms-hit" data-action="ecms-pick" data-address="${esc(p.phone)}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span class="ecms-hit-l1"><span>${esc(p.name)}</span><span class="ecms-hit-type">${esc(types[p.phoneType ?? 1])}</span></span><span class="ecms-hit-l2">${esc(p.phone)}</span></button>`).join('');
  }
  function send(c) {
    const root = c.el.viewport, text = root.querySelector('.ecms-text')?.value.trim();
    let address = c.ui.smsThread;
    if (!address) {
      const raw = root.querySelector('.ecms-to')?.value.trim() || '';
      const hit = (c.data.contacts || []).find(p => p.name.toLocaleLowerCase() === raw.toLocaleLowerCase());
      address = hit ? hit.phone : raw;
    }
    if (!text || !address) return;
    c.data.sms = [...(c.data.sms || []), {id: Date.now(), address, body: text, box: 2, when: Date.now(), read: true}];
    c.ui.smsThread = address; c.ui.smsDraft = ''; c.ui.smsTo = '';
    c.save(); c.render();
  }

  EC.register('messaging', {
    title: 'Messaging',
    render(c) { return c.ui.sub === 'compose' ? compose(c) : list(c); },
    mount(c, root) {
      if (!c.data.smsBase) { c.data.smsBase = Date.now(); c.save(); }
      const text = root.querySelector('.ecms-text');
      if (text) {
        const grow = () => { text.style.height = 'auto'; text.style.height = `${Math.min(text.scrollHeight, text.clientHeight && parseFloat(getComputedStyle(text).lineHeight) * 4 || 999)}px`; };
        text.addEventListener('input', () => { c.ui.smsDraft = text.value; grow(); });
        grow();
        const h = root.querySelector('.ecms-history'); if (h) h.scrollTop = h.scrollHeight;
      }
      const to = root.querySelector('.ecms-to');
      if (to) { to.addEventListener('input', () => { c.ui.smsTo = to.value; suggest(c, root); }); if (!c.ui.smsTo) setTimeout(() => to.focus(), 50); }
      // Opening a thread marks it read.
      if (c.ui.sub === 'compose' && c.ui.smsThread) {
        let changed = false;
        for (const m of c.data.sms || []) if (digits(m.address) === digits(c.ui.smsThread) && !m.read) { m.read = true; changed = true; }
        if (changed) c.save();
      }
    },
    action(name, el, event, c) {
      switch (name) {
        case 'ecms-new': c.ui.smsThread = null; c.ui.smsTo = ''; c.open('messaging', 'compose'); return true;
        case 'ecms-open': c.ui.smsThread = el.dataset.address; c.open('messaging', 'compose'); return true;
        case 'ecms-pick': {
          c.ui.smsThread = el.dataset.address; c.ui.smsTo = '';
          c.render(); return true;
        }
        case 'ecms-send': send(c); return true;
      }
      return false;
    },
    menu(c) {
      const F = EC.text('framework');
      if (c.ui.sub !== 'compose') {
        const any = threads(c).length > 0;
        c.menu([{label: M().t('menu_compose_new'), icon: 'fw-ic_menu_compose.png', action: () => EC.module('messaging').action('ecms-new', document.createElement('i'), null, c)},
          ...(any ? [{label: M().t('menu_delete_all'), icon: 'fw-ic_menu_delete.png', action: () => c.dialog({title: M().t('confirm_dialog_title'), icon: 'fw-ic_dialog_alert.png', message: M().t('confirm_delete_conversation'),
            buttons: [{label: M().t('delete'), action: () => { c.data.sms = []; c.save(); c.render(); }}, {label: F.t('cancel')}]})}] : []),
          {label: M().t('framework/search_go'), icon: 'fw-ic_menu_search.png', action: () => c.open('search')},
          {label: M().t('menu_preferences'), icon: 'fw-ic_menu_preferences.png', action: () => c.open('messaging-settings')}]);
        return true;
      }
      const address = c.ui.smsThread, p = address && person(c, address), has = address && threads(c).some(t => digits(t.address) === digits(address));
      c.menu([...(has ? [{label: M().t('menu_call'), icon: 'fw-ic_menu_call.png', action: () => { c.ui.callNumber = EC.formatNumber?.(address) || address; c.open('incall'); }}] : []),
        ...(p ? [{label: M().t('menu_view_contact'), icon: 'mm-ic_menu_contact.png', action: () => { c.ui.contactId = p.id; c.open('contact-view'); }}] : []),
        {label: M().t('add_subject'), icon: 'fw-ic_menu_edit.png', action: () => {}},
        {label: M().t('add_attachment'), icon: 'mm-ic_menu_attachment.png', action: () => c.open('gallery')},
        {label: M().t('menu_insert_smiley'), icon: 'fw-ic_menu_emoticons.png', action: () => {}},
        has ? {label: M().t('delete_thread'), icon: 'fw-ic_menu_delete.png', action: () => c.dialog({title: M().t('confirm_dialog_title'), icon: 'fw-ic_dialog_alert.png', message: M().t('confirm_delete_conversation'),
          buttons: [{label: M().t('delete'), action: () => { c.data.sms = c.data.sms.filter(m => digits(m.address) !== digits(address)); c.save(); c.ui.sub = ''; c.render(); }}, {label: F.t('cancel')}]})}
          : {label: M().t('discard'), icon: 'fw-ic_menu_delete.png', action: () => { c.ui.smsDraft = ''; c.back(); }},
        {label: M().t('all_threads'), icon: 'fw-ic_menu_friendslist.png', action: () => { c.ui.sub = ''; c.render(); }}]);
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
