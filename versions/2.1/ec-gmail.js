/* Android 2.1 Gmail 1.3 (Gmail.apk, ERE27), with a made-up account (eclair.demo@gmail.com) and mailbox, offline.
   - ConversationListActivity (Theme.Light, conversation_list_activity.xml under custom_title.xml): the label and its count
     at the left (Utils.setTitleWithAccount; Inbox and user labels count unread conversations, Sent, Starred, Chats, All
     Mail and Trash none), the account at the right (#f6f6f6, a black 1 px shadow). Rows are CanvasConversationHeaderView
     (60 dp): with Batch operations on (the default) the buttonless checkbox 3 dp in and 8 dp down; the subject in 18 sp
     black (bold while unread) 5 dp after it and " - snippet" in #777777 on the same line; under it the personal-level
     caret (double: only to me), the senders in 14 sp (unread ones bold), the labels in one #57a1d0 pill (3 dp corners,
     12 sp white), the paperclip, the date (DateUtils.getRelativeTimeSpanString: the time today, "Feb 3" this year, else
     the numeric date) 7 dp from the right; the star 5 dp down, 7 dp from the right. Read rows #e7e3e7. The 40 dp at
     either edge check and star. While conversations are checked, footer_organize (bottom_bar: Archive / Labels /
     Delete) shows, and the menu is conversation_list_menu_organize_mode. undo_textview (#fffff1a8): "Archived 1
     conversation. Undo". Menu (conversation_list_menu): Refresh, Compose, (Accounts: one account), View labels,
     Search, Back to Inbox (outside the Inbox), Settings. Refresh shows the footer's "Loading conversations…" while it syncs.
   - HtmlConversationActivity (Theme.Light.NoTitleBar): a WebView of the APK's assets/styles.css markup — the subject with
     its labels (conversationHeaderDiv, labelsDiv), each message a headerDiv card (ic_email_thread_open_top_default) with
     the presence dot, the sender in his AUTHOR_COLORS colour (bold 16 px), the star, "To: …" or the snippet and the
     date; unread and the last message open with the body and the Reply / Reply to all / Forward footer, the others
     closed (touching the header opens or closes one, toggleHeader). Under it bottom_bar with Archive (or Remove label /
     To inbox / Not spam), Delete and Older. Menu (conversation_menu): Archive, Newer, Add / Remove star, Mark unread,
     Change labels, Delete, Back to Inbox, Mute (Inbox), Report spam.
   - ComposeActivity (custom_title: "Compose", then the subject, and the account; compose_activity.xml on #ededed: To, Cc
     and Bcc (Menu › Add Cc/Bcc), Subject, the body "Compose Mail", Quoted text for replies; bottom_bar Send / Save as
     draft / Discard). Send wants a recipient ("Please add at least one recipient.") and valid addresses; Discard asks
     "Confirm discard"; Back with changes asks "Your message has not been sent. Discard your message?". Menu: Send, Add /
     Remove Cc/Bcc, Attach, Edit subject, Discard.
   - LabelsActivity (label_item.xml): Inbox, Starred, Chats, Sent, Outbox, Drafts, All Mail, Spam, Trash and the account's
     labels, the unread count in text_box with the unread indicator, the sync setting under the name.
   - PreferenceActivity (preferences.xml): Signature, Confirm delete (off), Batch operations (on), Clear search history,
     Labels; Email notifications, Select ringtone, Vibrate. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const G = () => EC.text('gmail');
  const t = k => G().t(k);
  const F = () => EC.text('framework');
  const ACCOUNT = 'eclair.demo@gmail.com';
  // Gmail's system labels (Gmail.LabelMap) and their names.
  const SYSTEM = {'^i': 'label_inbox', '^t': 'label_starred', '^b': 'label_chat', '^f': 'label_sent', '^^out': 'label_outbox', '^r': 'label_draft',
    '^all': 'label_all', '^s': 'label_spam', '^k': 'label_trash', '^g': 'label_ignored'};
  const LABEL_ORDER = ['^i', '^t', '^b', '^f', '^^out', '^r', '^all', '^s', '^k'];   // getSortedUserMeaningfulSystemLabels
  const NO_COUNT = ['^f', '^t', '^b', '^all', '^k'], TOTAL_COUNT = ['^r', '^^out', '^s'];
  const USER_LABELS = ['Friends', 'Travel', 'Work'];
  const AUTHOR_COLORS = ['#00681c', '#790619', '#5b1094', '#c88900', '#cc0060', '#008391', '#009486', '#b90038', '#846600', '#330099'];
  const H = 36e5;
  // A February 2010 mailbox: [subject, labels, starred, read, messages [from, address, body, hours ago]].
  const SAMPLES = [
    ['Welcome to your Nexus One', ['^i'], false, false, [['Google Nexus', 'nexus-noreply@google.com', 'Your Nexus One runs Android 2.1. Speak instead of typing with the microphone on the keyboard, set a live wallpaper, and find thousands of apps in Android Market.', 1]]],
    ['Hike on Saturday?', ['^i', 'Friends'], true, false, [['Alex Morgan', 'alex@example.com', 'Are you up for the ridge trail this weekend? I can pick you up at 8.', 20], ['me', ACCOUNT, 'Sounds great! I will bring sandwiches.', 18], ['Alex Morgan', 'alex@example.com', 'Perfect. Bring your phone, the new Maps shows the trail head.', 3]]],
    ['Gmail on your phone', ['^i'], false, true, [['Gmail Team', 'mail-noreply@google.com', 'Messages are grouped into conversations, labels work like folders that can overlap, and the star marks what matters to you. Press Menu for more.', 30]]],
    ['Sunday lunch', ['^i'], false, true, [['Mom', 'mom@example.com', 'Don’t forget Sunday lunch at ours. Bring dessert if you can!', 52]]],
    ['Slides for Monday', ['^i', 'Work'], false, true, [['Taylor Lee', 'taylor@example.com', 'Here are the slides from the meetup. Let me know what you think before Monday.', 76]]],
    ['Flight itinerary: Budapest', ['Travel'], false, true, [['Sam Rivera', 'sam@example.com', 'Here is the itinerary for March. We land at 14:20, the hotel is near the river.', 120]]],
    ['Your Android Market order', ['^i'], false, true, [['Android Market', 'android-market@google.com', 'Thanks for trying apps from Android Market. Your purchase is ready to install on your Nexus One.', 170]]]
  ];
  function mailbox(c) {
    if (Array.isArray(c.data.gmail)) return c.data.gmail;
    const now = Date.now();
    c.data.gmail = SAMPLES.map(([subject, labels, starred, read, messages], i) => ({id: `g${i + 1}`, subject, labels: [...labels, ...(starred ? ['^t'] : [])], read,
      messages: messages.map(([from, address, body, hours], j) => ({id: `g${i + 1}m${j}`, from, address, to: address === ACCOUNT ? [messages[0][1]] : [ACCOUNT], body, created: now - hours * H,
        read: read || j < messages.length - 1}))}));
    return c.data.gmail;
  }
  const prefs = c => c.data.gmailPrefs ||= {};
  const pref = (c, key, def) => prefs(c)[key] ?? def;
  const has = (v, l) => v.labels.includes(l);
  const live = v => !has(v, '^k') && !has(v, '^s');
  const last = v => v.messages.at(-1);
  function inLabel(v, label) {
    if (label === '^all') return live(v);
    if (label === '^t') return has(v, '^t') && live(v);
    if (label === '^k' || label === '^s') return has(v, label);
    return has(v, label) && live(v);
  }
  function list(c, label = c.ui.gmLabel || '^i', query = c.ui.gmQuery) {
    const q = String(query || '').toLocaleLowerCase();
    const out = mailbox(c).filter(v => q ? live(v) && [v.subject, ...v.messages.flatMap(m => [m.from, m.body])].join(' ').toLocaleLowerCase().includes(q) : inLabel(v, label));
    return out.sort((a, b) => last(b).created - last(a).created);
  }
  const labelName = l => SYSTEM[l] ? t(SYSTEM[l]) : l;
  const unread = (c, l) => list(c, l, '').filter(v => !v.read).length;

  // DateUtils.getRelativeTimeSpanString(context, millis): formatDateRange with the framework's Time.format patterns.
  function strftime(c, pattern, d) {
    const pad = n => String(n).padStart(2, '0'), h12 = d.getHours() % 12 || 12;
    const ampm = () => G().t(d.getHours() < 12 ? 'am' : 'pm');
    const month = () => d.toLocaleDateString(c.locale(), {month: 'short'});
    const map = {'-l': () => String(h12), '-k': () => String(d.getHours()), H: () => pad(d.getHours()), M: () => pad(d.getMinutes()), p: () => ampm().toUpperCase(), P: () => ampm().toLowerCase(),
      b: month, '-e': () => String(d.getDate()), d: () => pad(d.getDate()), m: () => pad(d.getMonth() + 1), '-m': () => String(d.getMonth() + 1), Y: () => String(d.getFullYear())};
    // Time.format's conversions (not message placeholders): split at each one and fill it in.
    return pattern.split(/(%-?[a-zA-Z])/).map(part => map[part.slice(1)] ? map[part.slice(1)]() : part).join('');
  }
  function relative(c, when) {
    const d = new Date(when), now = new Date();
    if (now - when < 864e5 && d.getDay() === now.getDay()) return strftime(c, G().t(c.is24() ? 'hour_minute_24' : 'hour_minute_ampm'), d);
    if (d.getFullYear() !== now.getFullYear()) return strftime(c, G().t('numeric_date'), d);
    return strftime(c, G().t('abbrev_month_day'), d);
  }
  const meName = () => t('me').toLocaleLowerCase();
  // Gmail.getSenderSnippet: the senders' first names (whole names alone), unread ones bold, "me", the message count.
  function senders(v) {
    const names = [];
    for (const m of v.messages) {
      const name = m.address === ACCOUNT ? meName() : v.messages.length > 1 ? m.from.split(' ')[0] : m.from;
      const found = names.find(n => n.name === name), bold = !v.read && m.address !== ACCOUNT;
      if (found) found.bold ||= bold; else names.push({name, bold});
    }
    return names.map(n => n.bold ? `<b>${esc(n.name)}</b>` : esc(n.name)).join(', ') + (v.messages.length > 1 ? ` (${v.messages.length})` : '') +
      (v.draft ? ` <span class="ecgm-draft">${esc(G().plural('draft', 1, c0().lang))}</span>` : '');
  }
  const c0 = () => EC.context;
  const userLabels = (v, except) => v.labels.filter(l => USER_LABELS.includes(l) && l !== except);
  // custom_title.xml: the left text and the account.
  const title = (left, right = ACCOUNT) => `<div class="ecgm-title npp-fw-title_bar"><i class="ec-bg np-fw-title_bar"></i><span class="ecgm-tleft">${esc(left)}</span><span class="ecgm-tright">${esc(right)}</span></div>`;
  const button = (action, label, disabled = false) => `<button type="button" class="ecui-button ecgm-bbtn" data-action="${action}"${disabled ? ' disabled' : ''}><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(label)}</span></button>`;
  const bar = buttons => `<div class="ecgm-bar">${buttons.join('')}</div>`;
  // MenuHandler.getYButtonText
  function yText(label) {
    if (label === '^k') return t('not_trash');
    if (label === '^s') return t('not_spam');
    if (label === '^i' || !label) return t('archive');
    if (label === '^t') return t('remove_star');
    return t('remove_label');
  }

  // ---- ConversationListActivity ----
  function listTitle(c) {
    if (c.ui.gmQuery) return c.ui.gmQuery;
    const l = c.ui.gmLabel || '^i';
    return NO_COUNT.includes(l) || TOTAL_COUNT.includes(l) ? labelName(l) : `${labelName(l)} (${unread(c, l)})`;
  }
  function row(c, v, label) {
    const checked = (c.ui.gmChecked || []).includes(v.id), batch = pref(c, 'allow-batch', true), m = last(v);
    const snippet = m.body.replace(/\s+/g, ' ');
    const labels = userLabels(v, label);
    const caret = v.messages.every(x => x.to.includes(ACCOUNT) && x.to.length === 1) ? 'double' : 'single';
    return `<div class="ecgm-row${v.read ? ' read' : ''}${batch ? '' : ' nobatch'}" data-id="${esc(v.id)}">
      <button type="button" class="ecgm-open" data-action="ecgm-open" data-id="${esc(v.id)}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i></button>
      ${batch ? `<button type="button" class="ecgm-check" data-action="ecgm-check" data-id="${esc(v.id)}"><img src="assets/gm-btn_check_buttonless_${checked ? 'on' : 'off'}.png" alt=""></button>` : ''}
      <button type="button" class="ecgm-star" data-action="ecgm-star" data-id="${esc(v.id)}"><img src="assets/gm-btn_star_big_buttonless_${has(v, '^t') ? 'on' : 'off'}.png" alt=""></button>
      <span class="ecgm-l1"><span class="ecgm-subj">${esc(v.subject)}</span><span class="ecgm-snip"> - ${esc(snippet)}</span></span>
      <span class="ecgm-l2"><img class="ecgm-caret" src="assets/gm-ic_email_caret_${caret}.png" alt=""><span class="ecgm-from">${senders(v)}</span>
        ${v.attachment ? '<img class="ecgm-clip" src="assets/gm-ic_gmail_paperclip_small.png" alt="">' : ''}${labels.length ? `<span class="ecgm-pill">${esc(labels.join(', '))}</span>` : ''}<span class="ecgm-date">${esc(relative(c, m.created))}</span></span>
    </div><i class="ecgm-div"></i>`;
  }
  function renderList(c) {
    const label = c.ui.gmLabel || '^i', items = list(c), checked = c.ui.gmChecked || [];
    const undo = c.ui.gmUndo ? `<div class="ecgm-undo">${esc(c.ui.gmUndo.text)} <button type="button" data-action="ecgm-undo">${esc(t('undo'))}</button></div>` : '';
    const footer = c.ui.gmSyncing ? `<div class="ecgm-loading"><img class="ecgm-spin" src="assets/fw-spinner_black_16.png" alt=""><span>${esc(t('loading'))}</span></div>` : '';
    const body = items.length ? items.map(v => row(c, v, label)).join('') + footer : footer || `<div class="ecgm-empty">${esc(t('no_conversations'))}</div>`;
    const organize = checked.length ? bar([button('ecgm-y', yText(c.ui.gmQuery ? '^i' : label)), button('ecgm-labels', t('apply_labels')), button('ecgm-delete', t('delete'))]) : '';
    return `<div class="ecgm ecgm-list">${title(listTitle(c))}<div class="ecgm-body">${undo}<div class="ecgm-scroll">${body}</div>${organize}</div></div>`;
  }

  // ---- HtmlConversationActivity ----
  function colorOf(map, address) { if (!map.has(address)) map.set(address, AUTHOR_COLORS[map.size % AUTHOR_COLORS.length]); return map.get(address); }
  function renderConversation(c) {
    const v = mailbox(c).find(x => x.id === c.ui.gmId);
    if (!v) return renderList(c);
    const open = c.ui.gmOpen || {}, colors = new Map();
    const labels = [...(has(v, '^i') ? ['^i'] : []), ...userLabels(v)].map(l => `<span class="ecgm-labelsDiv">${esc(labelName(l))}</span>&nbsp;`).join('');
    const msgs = v.messages.map((m, i) => {
      const expanded = open[m.id] ?? (i === v.messages.length - 1);
      const name = m.address === ACCOUNT ? meName() : m.from, color = colorOf(colors, m.address);
      const line2 = expanded ? `<div class="ecgm-addressDiv">${esc(t('to_heading'))} ${m.to.map(a => a === ACCOUNT ? meName() : esc(mailbox(c).flatMap(x => x.messages).find(y => y.address === a)?.from || a)).join(', ')}</div>`
        : `<div class="ecgm-snippetDiv">${esc(m.body)}</div>`;
      const footer = `<div class="ecgm-messageFooterDiv2"><table width="100%"><tr><td>${[['reply', 'ic_reply_default', 'reply'], ['replyall', 'ic_replyall_default', 'reply_all'], ['forward', 'ic_forward_default', 'forward']]
        .map(([a, icon, label]) => `<button type="button" class="ecgm-footerButton" data-action="ecgm-${a}" data-mid="${esc(m.id)}"><img class="ecgm-footerIconImg" src="assets/gm-web-${icon}.png" alt=""><div class="ecgm-footerTextElementDiv">${esc(t(label))}</div></button>`).join('')}</td></tr></table></div>`;
      return `<table class="ecgm-msg" border="0" cellspacing="0" cellpadding="0" width="100%"><tr><td><div class="ecgm-headerDiv"><table border="0" cellpadding="0"><tr>
          <td><div class="ecgm-presenceBgImg"><div><img class="ecgm-presenceImg" src="assets/gm-web-presence_invisible.png" alt=""></div></div></td>
          <td align="left" width="99%" data-action="ecgm-toggle" data-mid="${esc(m.id)}"><div class="ecgm-fromDiv"> <span style="color:${color}">${esc(name)}</span> </div></td>
          <td data-action="ecgm-mstar" style="min-width:calc(50 * var(--dp))" align="right"><img class="ecgm-bigstar" src="assets/gm-web-btn_star_big_${has(v, '^t') ? 'on' : 'off'}.png" alt=""></td></tr></table>
        <table border="0" cellspacing="0" cellpadding="0" width="100%"><tr><td width="99%" data-action="ecgm-toggle" data-mid="${esc(m.id)}">${line2}</td><td class="ecgm-when" valign="top" align="right">${esc(relative(c, m.created))}</td></tr></table></div></td></tr>
        <tr><td class="ecgm-bodyCell">${expanded ? `<div class="ecgm-bodyDiv">${esc(m.body).replace(/\n/g, '<br>')}</div>${footer}` : ''}</td></tr></table>`;
    }).join('');
    const items = list(c), i = items.findIndex(x => x.id === v.id), older = i >= 0 && i < items.length - 1;
    const label = c.ui.gmQuery ? '^i' : c.ui.gmLabel || '^i';
    const removable = label !== '^all' && label !== '^f' && label !== '^r' && label !== '^^out' && label !== '^b';
    return `<div class="ecgm ecgm-conv"><div class="ecgm-web"><div class="ecgm-conversationHeaderDiv">${esc(v.subject)}<br><div class="ecgm-labels">${labels}</div></div>${msgs}</div>
      ${bar([...(removable ? [button('ecgm-y', yText(label))] : []), ...(label !== '^k' ? [button('ecgm-delete', t('delete'))] : []), button('ecgm-older', t('next'), !older)])}</div>`;
  }

  // ---- LabelsActivity ----
  function renderLabels(c) {
    const rows = [...LABEL_ORDER, ...USER_LABELS].map(l => {
      const n = NO_COUNT.includes(l) ? 0 : TOTAL_COUNT.includes(l) ? list(c, l, '').length : unread(c, l);
      const sync = l === '^i' ? G().fmt('sync_recent', c.lang, 4) : '';
      return `<button type="button" class="ecgm-label" data-action="ecgm-golabel" data-label="${esc(l)}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i>
        <img class="ecgm-unreadbar" src="assets/gm-ic_sms_unread_msg_indicator.png" alt=""${n && !TOTAL_COUNT.includes(l) ? '' : ' style="visibility:hidden"'}>
        <span class="ecgm-lname"><span>${l === '^t' ? '<img src="assets/fw-btn_star_big_on.png" alt="">' : ''}${esc(labelName(l))}</span>${sync ? `<small>${esc(sync)}</small>` : ''}</span>
        ${n ? `<span class="ecgm-count npp-gm-text_box"><i class="ec-bg np-gm-text_box"></i><span>${n}</span></span>` : ''}</button><i class="ecgm-div"></i>`;
    }).join('');
    return c.window(t('activity_labels'), `<div class="ecgm-labels-list">${rows}</div>`, 'ecgm-light');
  }

  // ---- ComposeActivity ----
  function renderCompose(c) {
    const d = c.ui.gmDraft;
    const field = (name, hint, value, extra = '') => `<span class="ecwf-edit ecgm-field npp-fw-textfield_default"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><input class="ecwf-input" name="${name}" placeholder="${esc(hint)}" value="${esc(value)}" autocomplete="off"${extra}></span>`;
    return `<div class="ecgm ecgm-compose">${title(d.subject || t('activity_compose'))}<div class="ecgm-cbody"><div class="ecgm-cscroll"><div class="ecgm-content">
      ${field('to', t('to'), d.to, ' type="email" data-ime="email"')}
      ${d.cc ? `${field('cc', t('compose_activity_cc_label_text'), d.ccValue || '', ' type="email" data-ime="email"')}${field('bcc', t('compose_activity_bcc_label_text'), d.bccValue || '', ' type="email" data-ime="email"')}` : ''}
      <img class="ecgm-hdiv" src="assets/gm-divider_horizontal_email.9.png" alt="">
      ${field('subject', t('subject_hint'), d.subject)}
      <span class="ecwf-edit ecgm-field ecgm-bodyfield npp-fw-textfield_default"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><textarea class="ecwf-input" name="body" rows="3" placeholder="${esc(t('body_hint'))}">${esc(d.body)}</textarea></span>
      ${d.quoted ? `<div class="ecgm-quote">${esc(t('quoted_text'))}</div><div class="ecgm-quoted">${d.quoted}</div>` : ''}
      </div></div>${bar([button('ecgm-send', t('send')), button('ecgm-save', t('save')), button('ecgm-discard', t('discard'))])}</div></div>`;
  }
  function compose(c, kind, m, v) {
    const draft = {to: '', subject: '', body: '', cc: false, quoted: '', changed: false};
    if (m) {
      const prefix = t(kind === 'forward' ? 'forward_subject_label' : 'reply_subject_label');
      draft.subject = `${prefix} ${v.subject}`;
      if (kind === 'reply') draft.to = m.address === ACCOUNT ? m.to.join(', ') : `${m.from} <${m.address}>`;
      if (kind === 'replyall') { draft.to = m.address === ACCOUNT ? m.to.join(', ') : `${m.from} <${m.address}>`; }
      // java.text.DateFormat.getDateTimeInstance(MEDIUM, SHORT)
      const d = new Date(m.created), when = `${d.toLocaleDateString(c.locale(), {dateStyle: 'medium'})} ${d.toLocaleTimeString(c.locale(), {timeStyle: 'short'})}`;
      draft.quoted = kind === 'forward' ? G().fmt('forward_attribution', c.lang, `${esc(m.from)} &lt;${esc(m.address)}&gt;`, esc(when), esc(v.subject), esc(m.to.join(', '))) + esc(m.body)
        : `${G().fmt('reply_attribution', c.lang, esc(when), esc(m.from))}<blockquote type="cite">${esc(m.body)}</blockquote>`;
      draft.thread = v.id;
    }
    c.ui.gmDraft = draft;
    c.ui.gmScreen = 'compose'; c.render();
  }
  function readDraft(c) {
    const root = c.el.viewport.querySelector('.ecgm-compose'), d = c.ui.gmDraft;
    if (!root || !d) return d;
    for (const name of ['to', 'subject']) { const el = root.querySelector(`[name="${name}"]`); if (el) d[name] = el.value; }
    const cc = root.querySelector('[name="cc"]'), bcc = root.querySelector('[name="bcc"]'), body = root.querySelector('[name="body"]');
    if (cc) d.ccValue = cc.value; if (bcc) d.bccValue = bcc.value; if (body) d.body = body.value;
    return d;
  }
  const addresses = text => String(text || '').split(/[,;]/).map(s => s.trim()).filter(Boolean);
  const valid = a => /^[^@\s<>]+@[^@\s<>]+\.[^@\s<>]+$/.test((a.match(/<([^>]+)>/)?.[1] || a).trim());
  function sendOrSave(c, save) {
    const d = readDraft(c), all = [...addresses(d.to), ...addresses(d.ccValue), ...addresses(d.bccValue)];
    if (!save && !all.length) { c.toast(t('recipient_needed')); return false; }
    const bad = all.find(a => !valid(a));
    if (!save && bad) { c.toast(G().fmt('wrong_recipient', c.lang, bad)); return false; }
    const box = mailbox(c), msg = {id: `g${Date.now()}`, from: 'me', address: ACCOUNT, to: all.length ? all.map(a => a.match(/<([^>]+)>/)?.[1] || a) : [], body: d.body, created: Date.now(), read: true};
    const thread = d.thread && box.find(v => v.id === d.thread);
    if (d.draftOf) { const old = box.find(v => v.id === d.draftOf); if (old) box.splice(box.indexOf(old), 1); }
    if (save) {
      const v = {id: `g${Date.now()}`, subject: d.subject, labels: ['^r'], read: true, draft: true, messages: [msg]};
      box.push(v); d.draftOf = v.id;
      c.toast(t('message_saved'));
    } else if (thread) { thread.messages.push(msg); if (!has(thread, '^f')) thread.labels.push('^f'); }
    else box.push({id: msg.id, subject: d.subject, labels: ['^f'], read: true, messages: [msg]});
    c.save();
    return true;
  }
  function leaveCompose(c) { c.ui.gmDraft = null; c.ui.gmScreen = c.ui.gmId ? 'conversation' : ''; c.render(); }
  function discard(c) { const d = c.ui.gmDraft; if (d?.draftOf) { const box = mailbox(c), v = box.find(x => x.id === d.draftOf); if (v) box.splice(box.indexOf(v), 1); c.save(); } c.toast(t('message_discarded')); leaveCompose(c); }

  // ---- PreferenceActivity ----
  function renderPrefs(c) {
    const check = on => `<img class="ecpf-check" src="assets/fw-btn_check_${on ? 'on' : 'off'}.png" alt="">`;
    const r = (key, titleText, summary, on, disabled) => `<button type="button" class="ecpf-row" data-action="ecgm-pref" data-key="${key}"${disabled ? ' disabled' : ''}><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span class="ecpf-text"><span class="ecpf-title">${esc(titleText)}</span>${summary ? `<span class="ecpf-summary">${esc(summary)}</span>` : ''}</span>${on === undefined ? '' : check(on)}</button><i class="ecpf-divider"></i>`;
    const cat = text => `<div class="ecpf-cat npp-fw-dark_header_dither"><i class="ec-bg np-fw-dark_header_dither"></i><span>${esc(text)}</span></div>`;
    const notif = pref(c, 'enable-notifications', true);
    return c.window(t('activity_preferences'), `<div class="ecpf-list">${cat(t('preferences_title'))}
      ${r('signature', t('preferences_signature_title'), t('preferences_signature_summary'))}
      ${r('confirm-delete', t('preferences_confirm_delete'), t('preferences_confirm_delete_summary'), pref(c, 'confirm-delete', false))}
      ${r('allow-batch', t('preferences_allow_batch_title'), t('preferences_allow_batch_summary'), pref(c, 'allow-batch', true))}
      ${r('clear-search-history', t('clear_history_title'), t('clear_history_summary'))}
      ${r('labels', t('preferences_synchronization_title'), t('preferences_synchronization_summary'))}
      ${cat(t('preferences_notifications'))}
      ${r('enable-notifications', t('preferences_notifications_enable'), t('preferences_notifications_summary'), notif)}
      ${r('ringtone', t('preferences_ringtone'), '', undefined, !notif)}
      ${r('vibrate', t('preferences_vibrate_enable'), t('preferences_vibrate_summary'), pref(c, 'vibrate', false), !notif)}</div>`);
  }

  // ---- actions ----
  const selected = c => (c.ui.gmChecked || []).map(id => mailbox(c).find(v => v.id === id)).filter(Boolean);
  function setUndo(c, key, vs, before) {
    c.ui.gmUndo = {text: G().plural(key, vs.length, c.lang, vs.length), before};
  }
  const snapshot = vs => vs.map(v => [v, [...v.labels], v.read]);
  function apply(c, vs, fn, key) {
    if (!vs.length) return;
    const before = snapshot(vs);
    vs.forEach(fn);
    if (key) setUndo(c, key, vs, before);
    c.ui.gmChecked = [];
    c.save();
  }
  function yAction(c, vs) {
    const label = c.ui.gmQuery ? '^i' : c.ui.gmLabel || '^i';
    const remove = label === '^k' ? '^k' : label === '^s' ? '^s' : label;
    apply(c, vs, v => { v.labels = v.labels.filter(l => l !== remove); if (label === '^k' || label === '^s') v.labels.push('^i'); }, label === '^i' ? 'conversation_archived' : null);
  }
  function deleteAction(c, vs, after) {
    const run = () => { apply(c, vs, v => { v.labels = [...v.labels.filter(l => l !== '^i'), '^k']; }, 'conversation_deleted'); after?.(); c.render(); };
    if (pref(c, 'confirm-delete', false)) {
      c.dialog({title: t('confirm_delete_title'), icon: null, message: G().plural('confirm_delete_conversation', vs.length, c.lang, vs.length),
        buttons: [{label: t('delete'), action: () => setTimeout(run, 0)}, {label: t('dont_delete')}]});
    } else run();
  }
  function changeLabels(c, vs) {
    const checked = USER_LABELS.map((l, i) => vs.every(v => has(v, l)) ? i : -1).filter(i => i >= 0);
    c.dialog({title: t('menu_change_labels'), icon: null, items: USER_LABELS, choice: 'multi', checked,
      buttons: [{label: F().t('ok'), action: (c2, d) => { apply(c, vs, v => { v.labels = [...v.labels.filter(l => !USER_LABELS.includes(l)), ...(d.checked || []).map(i => USER_LABELS[i])]; }); c.render(); }}, {label: F().t('cancel')}]});
  }
  function openConversation(c, id) {
    const v = mailbox(c).find(x => x.id === id);
    if (!v) return;
    if (v.draft) { c.ui.gmDraft = {to: v.messages[0].to.join(', '), subject: v.subject, body: v.messages[0].body, cc: false, quoted: '', draftOf: v.id}; c.ui.gmScreen = 'compose'; c.render(); return; }
    // The unread messages stay open while the conversation is shown (then they are read).
    c.ui.gmId = id; c.ui.gmOpen = Object.fromEntries(v.messages.filter(m => m.read === false).map(m => [m.id, true])); c.ui.gmScreen = 'conversation';
    v.read = true; v.messages.forEach(m => { m.read = true; }); c.save(); c.render();
  }
  function goLabel(c, label) { c.ui.gmLabel = label; c.ui.gmQuery = ''; c.ui.gmChecked = []; c.ui.gmUndo = null; c.ui.gmScreen = ''; c.render(); }
  function refresh(c) {
    c.ui.gmSyncing = true; c.ui.gmUndo = null; c.render();
    setTimeout(() => { c.ui.gmSyncing = false; if (c.ui.view === 'gmail') c.render(); }, 1500);
  }
  function listMenu(c) {
    const checked = selected(c), label = c.ui.gmLabel || '^i';
    if (checked.length) {
      const allStarred = checked.every(v => has(v, '^t')), anyUnread = checked.some(v => !v.read);
      return c.menu([
        ...(label !== '^t' ? [{label: t(allStarred ? 'remove_star' : 'add_star'), icon: 'gm-ic_menu_star.png', action: () => { apply(c, checked, v => { v.labels = allStarred ? v.labels.filter(l => l !== '^t') : [...new Set([...v.labels, '^t'])]; }, allStarred ? null : 'conversation_starred'); c.render(); }}] : []),
        ...(label !== '^s' ? [{label: t('report_spam'), icon: 'gm-ic_menu_report_spam.png', action: () => { apply(c, checked, v => { v.labels = [...v.labels.filter(l => l !== '^i'), '^s']; }, 'conversation_spammed'); c.render(); }}] : []),
        ...(label === '^i' ? [{label: t('mute'), icon: 'gm-ic_menu_mute.png', action: () => { apply(c, checked, v => { v.labels = [...v.labels.filter(l => l !== '^i'), '^g']; }, 'conversation_muted'); c.render(); }}] : []),
        {label: t(anyUnread ? 'mark_read' : 'mark_unread'), icon: `gm-ic_menu_gmail_mark_${anyUnread ? 'read' : 'unread'}.png`, action: () => { apply(c, checked, v => { v.read = anyUnread; }, anyUnread ? 'conversation_marked_read' : 'conversation_marked_unread'); c.render(); }},
        {label: t('deselect_all'), icon: 'gm-ic_menu_gmail_deselect_mail.png', action: () => { c.ui.gmChecked = []; c.render(); }}]);
    }
    c.menu([{label: t('refresh'), icon: 'gm-ic_menu_refresh.png', action: () => refresh(c)},
      {label: t('menu_compose'), icon: 'gm-ic_menu_compose.png', action: () => compose(c)},
      {label: t('menu_labels'), icon: 'gm-ic_menu_navigate.png', action: () => { c.ui.gmScreen = 'labels'; c.render(); }},
      {label: t('menu_search'), icon: 'fw-ic_menu_search.png', action: () => search(c)},
      ...(label !== '^i' || c.ui.gmQuery ? [{label: t('back_to_inbox'), icon: 'gm-ic_menu_inbox.png', action: () => goLabel(c, '^i')}] : []),
      {label: t('menu_preferences'), icon: 'fw-ic_menu_preferences.png', action: () => { c.ui.gmScreen = 'prefs'; c.render(); }}]);
  }
  function search(c) {
    c.searchDialog({icon: 'app-gmail.png', hint: t('search_hint'), value: '', onGo: q => { if (!q.trim()) return; c.ui.gmQuery = q.trim(); c.ui.gmChecked = []; c.ui.gmScreen = ''; c.render(); }});
  }
  function conversationMenu(c) {
    const v = mailbox(c).find(x => x.id === c.ui.gmId);
    if (!v) return;
    const label = c.ui.gmQuery ? '^i' : c.ui.gmLabel || '^i', items = list(c), i = items.findIndex(x => x.id === v.id);
    const back = () => { c.ui.gmScreen = ''; c.ui.gmId = null; c.render(); };
    c.menu([
      ...(label !== '^all' && label !== '^f' ? [{label: yText(label), icon: 'gm-ic_menu_archive.png', action: () => { yAction(c, [v]); back(); }}] : []),
      ...(i > 0 ? [{label: t('previous'), icon: 'gm-ic_prev_gmail.png', action: () => openConversation(c, items[i - 1].id)}] : []),
      ...(label !== '^t' ? [{label: t(has(v, '^t') ? 'remove_star' : 'add_star'), icon: 'gm-ic_menu_star.png', action: () => { v.labels = has(v, '^t') ? v.labels.filter(l => l !== '^t') : [...v.labels, '^t']; c.save(); c.render(); }}] : []),
      {label: t('mark_unread'), icon: 'gm-ic_menu_gmail_mark_unread.png', action: () => { v.read = false; c.save(); back(); }},
      {label: t('menu_change_labels'), icon: 'gm-ic_menu_navigate.png', action: () => changeLabels(c, [v])},
      ...(label !== '^k' ? [{label: t('delete'), icon: 'fw-ic_menu_delete.png', action: () => deleteAction(c, [v], back)}] : []),
      ...(label !== '^i' ? [{label: t('back_to_inbox'), icon: 'gm-ic_menu_inbox.png', action: () => goLabel(c, '^i')}] : []),
      ...(label === '^i' ? [{label: t('mute'), icon: 'gm-ic_menu_mute.png', action: () => { apply(c, [v], x => { x.labels = [...x.labels.filter(l => l !== '^i'), '^g']; }, 'conversation_muted'); back(); }}] : []),
      ...(label !== '^s' ? [{label: t('report_spam'), icon: 'gm-ic_menu_report_spam.png', action: () => { apply(c, [v], x => { x.labels = [...x.labels.filter(l => l !== '^i'), '^s']; }, 'conversation_spammed'); back(); }}] : [])]);
  }
  function composeMenu(c) {
    const d = readDraft(c);
    c.menu([{label: t('send'), icon: 'fw-ic_menu_send.png', action: () => { if (sendOrSave(c, false)) { c.toast(t('sending_message')); leaveCompose(c); } }},
      d.cc ? {label: t('remove_cc_label'), icon: 'gm-ic_menu_cc.png', action: () => { d.cc = false; d.ccValue = d.bccValue = ''; c.render(); }}
        : {label: t('add_cc_label'), icon: 'gm-ic_menu_cc.png', action: () => { d.cc = true; c.render(); c.el.viewport.querySelector('[name="cc"]')?.focus(); }},
      {label: t('add_attachment'), icon: 'gm-ic_menu_attachment.png', action: () => c.open('gallery', 'pick')},
      {label: t('edit_subject'), icon: 'fw-ic_menu_edit.png', action: () => c.el.viewport.querySelector('[name="subject"]')?.focus()},
      {label: t('discard'), icon: 'fw-ic_menu_close_clear_cancel.png', action: () => confirmDiscard(c)}]);
  }
  function confirmDiscard(c) {
    c.dialog({title: t('confirm_discard_title'), icon: null, message: t('confirm_discard_text'), buttons: [{label: F().t('ok'), action: () => setTimeout(() => discard(c), 0)}, {label: F().t('cancel')}]});
  }

  EC.register('gmail', {
    title: 'Gmail',
    render(c) {
      if (c.ui.gmScreen === 'conversation') return renderConversation(c);
      if (c.ui.gmScreen === 'compose' && c.ui.gmDraft) return renderCompose(c);
      if (c.ui.gmScreen === 'labels') return renderLabels(c);
      if (c.ui.gmScreen === 'prefs') return renderPrefs(c);
      return renderList(c);
    },
    mount(c, root) {
      const body = root.querySelector('.ecgm-compose');
      body?.addEventListener('input', event => { const d = c.ui.gmDraft; if (!d) return; d.changed = true; if (event.target.name === 'subject') { d.subject = event.target.value; root.querySelector('.ecgm-tleft').textContent = d.subject || t('activity_compose'); } });
    },
    action(name, el, event, c) {
      const id = el.dataset.id;
      switch (name) {
        case 'ecgm-open': openConversation(c, id); return true;
        case 'ecgm-check': { const set = new Set(c.ui.gmChecked || []); set.has(id) ? set.delete(id) : set.add(id); c.ui.gmChecked = [...set]; c.render(); return true; }
        case 'ecgm-star': { const v = mailbox(c).find(x => x.id === id); v.labels = has(v, '^t') ? v.labels.filter(l => l !== '^t') : [...v.labels, '^t']; c.save(); c.render(); return true; }
        case 'ecgm-undo': for (const [v, labels, read] of c.ui.gmUndo?.before || []) { v.labels = labels; v.read = read; } c.ui.gmUndo = null; c.save(); c.render(); return true;
        case 'ecgm-y': {
          const vs = c.ui.gmScreen === 'conversation' ? [mailbox(c).find(x => x.id === c.ui.gmId)] : selected(c);
          yAction(c, vs.filter(Boolean)); if (c.ui.gmScreen === 'conversation') { c.ui.gmScreen = ''; c.ui.gmId = null; } c.render(); return true;
        }
        case 'ecgm-delete': {
          const conv = c.ui.gmScreen === 'conversation', vs = conv ? [mailbox(c).find(x => x.id === c.ui.gmId)] : selected(c);
          deleteAction(c, vs.filter(Boolean), conv ? () => { c.ui.gmScreen = ''; c.ui.gmId = null; } : null); return true;
        }
        case 'ecgm-labels': changeLabels(c, selected(c)); return true;
        case 'ecgm-older': { const items = list(c), i = items.findIndex(x => x.id === c.ui.gmId); if (items[i + 1]) openConversation(c, items[i + 1].id); return true; }
        case 'ecgm-toggle': { const v = mailbox(c).find(x => x.id === c.ui.gmId), i = v.messages.findIndex(m => m.id === el.dataset.mid); const cur = (c.ui.gmOpen ||= {})[el.dataset.mid] ?? (i === v.messages.length - 1); c.ui.gmOpen[el.dataset.mid] = !cur; c.render(); return true; }
        case 'ecgm-mstar': { const v = mailbox(c).find(x => x.id === c.ui.gmId); v.labels = has(v, '^t') ? v.labels.filter(l => l !== '^t') : [...v.labels, '^t']; c.save(); c.render(); return true; }
        case 'ecgm-reply': case 'ecgm-replyall': case 'ecgm-forward': {
          const v = mailbox(c).find(x => x.id === c.ui.gmId), m = v?.messages.find(x => x.id === el.dataset.mid);
          compose(c, name.slice(5), m, v); return true;
        }
        case 'ecgm-send': if (sendOrSave(c, false)) { c.toast(t('sending_message')); leaveCompose(c); } return true;
        case 'ecgm-save': sendOrSave(c, true); return true;
        case 'ecgm-discard': confirmDiscard(c); return true;
        case 'ecgm-golabel': goLabel(c, el.dataset.label); return true;
        case 'ecgm-pref': {
          const key = el.dataset.key;
          if (['confirm-delete', 'allow-batch', 'enable-notifications', 'vibrate'].includes(key)) { prefs(c)[key] = !pref(c, key, key === 'allow-batch' || key === 'enable-notifications'); c.save(); c.render(); return true; }
          if (key === 'signature') EC.editTextDialog(c, {title: t('preferences_signature_title'), value: pref(c, 'signature', ''), onOk: v => { prefs(c).signature = v; c.save(); }});
          if (key === 'ringtone') EC.ringtonePicker(c, {cat: 'notifications', title: t('preferences_ringtone'), current: pref(c, 'ringtone', null), showDefault: true, onPick: f => { prefs(c).ringtone = f; c.save(); }});
          if (key === 'labels') { c.ui.gmScreen = 'labels'; c.render(); }
          return true;
        }
      }
      return false;
    },
    menu(c) {
      if (c.ui.gmScreen === 'conversation') conversationMenu(c);
      else if (c.ui.gmScreen === 'compose') composeMenu(c);
      else if (!c.ui.gmScreen) listMenu(c);
      return true;
    },
    search(c) { if (!c.ui.gmScreen) { search(c); return true; } return false; },
    back(c) {
      const s = c.ui.gmScreen;
      if (s === 'compose') {
        const d = readDraft(c);
        if (d?.changed) {
          c.dialog({title: '', icon: null, message: t('message_not_sent'), buttons: [{label: F().t('ok'), action: () => setTimeout(() => discard(c), 0)}, {label: F().t('cancel')}], onCancel: () => discard(c)});
          return true;
        }
        leaveCompose(c); return true;
      }
      if (s === 'conversation') { c.ui.gmScreen = ''; c.ui.gmId = null; c.render(); return true; }
      if (s === 'labels' || s === 'prefs') { c.ui.gmScreen = ''; c.render(); return true; }
      if (c.ui.gmChecked?.length) { c.ui.gmChecked = []; c.render(); return true; }
      if (c.ui.gmQuery) { c.ui.gmQuery = ''; c.render(); return true; }
      return false;
    }
  });
  EC.gmail = {account: ACCOUNT, unread: c => unread(c, '^i')};
  document.addEventListener('DOMContentLoaded', () => {
    const c = EC.context, open = c.open;
    // The launcher opens the Inbox.
    c.open = (view, sub, opts) => { if (view === 'gmail' && c.ui.view !== 'gmail') { c.ui.gmScreen = ''; c.ui.gmLabel = '^i'; c.ui.gmQuery = ''; c.ui.gmChecked = []; c.ui.gmUndo = null; } return open(view, sub, opts); };
  });
})();
