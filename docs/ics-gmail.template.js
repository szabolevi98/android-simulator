/* Gmail 4.0.4 on the Galaxy Nexus (IMM76I), the Ice Cream Sandwich Gmail described in Android Police's "Getting To Know
   Android 4.0, Part 1: Gmail" (October 2011): the label name with the account at the top (a tap lists the recent labels),
   the split action bar at the bottom (Compose, Search, Labels, Refresh; Archive, Delete, Labels, Mark unread and Star
   for a selection or an open conversation), two-line previews with the sender first and check boxes, read conversations
   on grey, a sticky conversation header with the subject and its labels, contact photos in the message headers, and
   the open Honeycomb-style compose screen. Texts are Gmail.apk's from the image; the account is offline and made up. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const account = 'icecream.demo@gmail.com';
  // [hu, de, fr, es] from the image's Gmail.apk (docs/ics-gmail-strings.py fills them in from this template, docs/ics-gmail.template.js).
  const STRINGS = __STRINGS__;
  const LANGS = ['hu', 'de', 'fr', 'es'];
  // Gmail's own texts first, then the shared interface rows (More options, Cancel, ...).
  const T = (lang, key) => { const i = LANGS.indexOf(lang); return STRINGS[key] && i >= 0 ? STRINGS[key][i] : STRINGS[key] || lang === 'en' ? key : window.AndroidI18n?.t(key) ?? key; };
  const LABELS = ['Inbox', 'Priority Inbox', 'Starred', 'Important', 'Chats', 'Sent', 'Outbox', 'Drafts', 'All mail', 'Spam', 'Trash'];
  const ICON = name => `<img src="assets/kem-${name}.png" alt="">`;
  // A spring 2012 inbox.
  const SAMPLES = [
    ['Google Nexus', 'nexus-noreply@google.com', 'Get started with your Galaxy Nexus', 'Welcome to Android 4.0, Ice Cream Sandwich. Swipe away notifications, take a screenshot with Power + Volume down, and unlock with your face.', true, 0],
    ['Alex Morgan', 'alex@example.com', 'Hike on Saturday?', 'Are you up for the ridge trail this weekend? I can pick you up at 8. Bring the new phone, the panorama mode looks great.', true, 1],
    ['Google+ team', 'noreply-plus@google.com', 'Hangouts with extras', 'Share your screen, edit documents together and watch YouTube with friends in a Hangout.', false, 5],
    ['Mom', 'mom@example.com', 'Sunday lunch', 'Don’t forget Sunday lunch at ours. Bring dessert if you can — ice cream is fine!', false, 26],
    ['Taylor Lee', 'taylor@example.com', 'Slides for Monday', 'Here are the slides from the meetup. Let me know what you think.', false, 50],
    ['Google Play', 'googleplay-noreply@google.com', 'Welcome to Google Play', 'Android Market is now Google Play: apps, music, books and movies in one place.', false, 75]
  ];
  function restore(saved, now = Date.now()) {
    if (Array.isArray(saved)) return saved.map(item => ({...item, id: String(item.id)}));
    return SAMPLES.map(([from, address, subject, body, important, hoursAgo], i) => ({id: 'g4-' + (i + 1), from, address, to: account, subject, body, label: 'Inbox', important, created: now - hoursAgo * 36e5, read: i >= 2, starred: i === 1}));
  }
  const live = item => !['Trash', 'Spam'].includes(item.label);
  function list(mail, label, query = '') {
    const q = query.toLocaleLowerCase();
    const match = item => label === 'Priority Inbox' ? item.label === 'Inbox' && item.important : label === 'Starred' ? item.starred && live(item) : label === 'Important' ? item.important && live(item) : label === 'All mail' ? live(item) && item.label !== 'Drafts' : item.label === label;
    return mail.filter(item => (query !== undefined && query !== null && q ? live(item) : match(item)) && (!q || [item.from, item.subject, item.body].join(' ').toLocaleLowerCase().includes(q))).sort((a, b) => (b.created || 0) - (a.created || 0));
  }
  const unread = (mail, label) => list(mail, label).filter(item => !item.read).length;
  const when = (item, locale, now) => { const d = new Date(item.created || now); return d.toDateString() === new Date(now).toDateString() ? d.toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit'}) : d.toLocaleDateString(locale, {month: 'short', day: 'numeric'}); };
  const btn = (action, label, icon, id = '') => `<button class="g4-btn" data-action="${action}"${id ? ` data-id="${e(id)}"` : ''} aria-label="${e(label)}" title="${e(label)}">${ICON(icon)}</button>`;
  function top(ctx, title, sub, {up = false, spinner = false, actions = ''} = {}) {
    return `<header class="g4-top"><button class="g4-home" data-action="${up ? 'back' : 'home'}" aria-label="Gmail">${up ? '<span class="g4-caret">‹</span>' : ''}<img src="assets/gmail.png" alt=""></button><button class="g4-title${spinner ? ' g4-spinner' : ''}" data-action="${spinner ? 'g4-recent' : 'noop'}"><b>${e(title)}</b><small>${e(sub)}</small></button>${actions}</header>`;
  }
  const bottom = buttons => `<footer class="g4-bottom">${buttons}</footer>`;
  function rows(ctx, items) {
    const {ui, locale, now} = ctx, selected = ui.g4Selected || [];
    if (!items.length) return `<p class="g4-empty">${e(T(ctx.lang, 'No conversations.'))}</p>`;
    return items.map(item => `<div class="g4-row${item.read ? ' read' : ''}${selected.includes(item.id) ? ' checked' : ''}"><button class="g4-check" data-action="g4-select" data-id="${e(item.id)}" role="checkbox" aria-checked="${selected.includes(item.id)}" aria-label="${e(item.from)}"></button><button class="g4-row-main" data-action="g4-open" data-id="${e(item.id)}"><span class="g4-row-top"><b>${item.important && item.label === 'Inbox' ? '<i class="g4-chevron">›</i>' : ''}${e(item.label === 'Drafts' ? T(ctx.lang, 'Drafts') : item.from)}</b><time>${e(when(item, locale, now))}</time></span><span class="g4-row-text"><strong>${e(item.subject || '—')}</strong> – ${e(item.body)}</span></button><button class="g4-star${item.starred ? ' on' : ''}" data-action="g4-star" data-id="${e(item.id)}" aria-label="${e(T(ctx.lang, item.starred ? 'Remove star' : 'Add star'))}">${ICON(item.starred ? 'ic_btn_star_on' : 'ic_btn_star_off')}</button></div>`).join('');
  }
  function listView(ctx) {
    const {data, ui, lang} = ctx, mail = data.gmail40, label = ui.g4Label || 'Inbox', selected = ui.g4Selected || [];
    const searching = ui.g4Query !== undefined;
    const items = list(mail, label, searching ? ui.g4Query : '');
    const n = unread(mail, label);
    const head = selected.length
      ? `<header class="g4-top g4-cab"><button class="g4-done" data-action="g4-clear">${ICON('ic_cab_done_holo_light')}<b>${e(T(lang, 'Done'))}</b></button><span class="g4-count">${selected.length}</span></header>`
      : searching ? `<header class="g4-top"><button class="g4-home" data-action="g4-search-close" aria-label="Gmail"><span class="g4-caret">‹</span><img src="assets/gmail.png" alt=""></button><form class="g4-search" data-form="g4-search"><input name="query" autocomplete="off" value="${e(ui.g4Query)}" placeholder="${e(T(lang, 'Search mail'))}" aria-label="${e(T(lang, 'Search mail'))}"></form></header>`
      : top(ctx, T(lang, label), n ? T(lang, '%d unread').replace('%d', n) : account, {spinner: true});
    const actions = selected.length
      ? btn('g4-archive', T(lang, 'Archive'), 'ic_menu_archive_holo_light') + btn('g4-delete', T(lang, 'Delete'), 'ic_menu_trash_holo_light') + btn('g4-labels', T(lang, 'Labels'), 'ic_menu_move_to_holo_light') + btn('g4-unread', T(lang, 'Mark unread'), 'ic_menu_mark_unread_holo_light') + btn('g4-star-selected', T(lang, 'Add star'), 'ic_menu_add_star_holo_dark')
      : btn('g4-compose', T(lang, 'Compose'), 'ic_menu_compose_normal_holo_light') + btn('g4-search', T(lang, 'Search'), 'ic_menu_search_holo_light') + btn('g4-labels', T(lang, 'Labels'), 'ic_menu_move_to_holo_light') + btn('g4-refresh', T(lang, 'Refresh'), 'ic_menu_refresh_holo_light');
    return `<div class="app-view g4-app">${head}<div class="g4-scroll email-scroll">${rows(ctx, items)}</div>${bottom(actions)}</div>`;
  }
  function conversation(ctx) {
    const {data, ui, lang, locale, now} = ctx, item = data.gmail40.find(m => m.id === ui.g4Id);
    if (!item) return listView(ctx);
    const label = ui.g4Label || 'Inbox';
    const chip = l => `<span class="g4-chip">${e(T(lang, l))}</span>`;
    const actions = btn('g4-archive', T(lang, 'Archive'), 'ic_menu_archive_holo_light') + btn('g4-delete', T(lang, 'Delete'), 'ic_menu_trash_holo_light') + btn('g4-labels', T(lang, 'Labels'), 'ic_menu_move_to_holo_light') + btn('g4-unread', T(lang, 'Mark unread'), 'ic_menu_mark_unread_holo_light') + btn('g4-star', T(lang, item.starred ? 'Remove star' : 'Add star'), item.starred ? 'ic_btn_star_on' : 'ic_btn_star_off', item.id);
    return `<div class="app-view g4-app">${top(ctx, T(lang, label), account, {up: true})}<div class="g4-scroll"><div class="g4-subject"><h2>${e(item.subject || '—')}</h2>${chip(item.label)}${item.important ? chip('Important') : ''}</div><article class="g4-message"><header><img class="g4-photo" src="assets/kem-ic_generic_man.png" alt=""><span><b>${e(item.label === 'Sent' ? T(lang, 'me') : item.from)}</b><small>${e(T(lang, 'To:'))} ${e(item.label === 'Sent' ? item.to : T(lang, 'me'))}</small></span><time>${e(when(item, locale, now))}</time><button class="g4-reply" data-action="g4-reply" aria-label="${e(T(lang, 'Reply'))}">${ICON('ic_reply_holo_light')}</button></header><div class="g4-body">${e(item.body).replace(/\n/g, '<br>')}</div><div class="g4-respond">${[['g4-reply', 'Reply', 'ic_reply_holo_light'], ['g4-reply-all', 'Reply all', 'ic_reply_all_holo_light'], ['g4-forward', 'Forward', 'ic_forward_holo_light']].map(([a, l, i]) => `<button data-action="${a}">${ICON(i)}<span>${e(T(lang, l))}</span></button>`).join('')}</div></article></div>${bottom(actions)}</div>`;
  }
  function compose(ctx) {
    const {data, ui, lang} = ctx, draft = data.gmail40.find(m => m.id === ui.g4Id) || {};
    const actions = btn('g4-send', T(lang, 'Send'), 'ic_menu_send_holo_light') + btn('g4-compose-menu', T(lang, 'More options'), 'ic_menu_moreoverflow_normal_holo_light');
    return `<div class="app-view g4-app g4-compose-view"><header class="g4-top"><button class="g4-home" data-action="back" aria-label="Gmail"><span class="g4-caret">‹</span><img src="assets/gmail.png" alt=""></button><span class="g4-title"><b>${e(T(lang, 'Compose'))}</b><small>${e(account)}</small></span>${actions}</header><form class="g4-form" data-form="g4-compose"><label class="g4-field"><input name="to" type="email" multiple autocomplete="off" value="${e(draft.to === account ? '' : draft.to || '')}" placeholder="${e(T(lang, 'To'))}" aria-label="${e(T(lang, 'To'))}"></label>${ui.g4Cc ? `<label class="g4-field"><input name="cc" autocomplete="off" value="${e(draft.cc || '')}" placeholder="${e(T(lang, 'Cc'))}" aria-label="${e(T(lang, 'Cc'))}"></label><label class="g4-field"><input name="bcc" autocomplete="off" value="${e(draft.bcc || '')}" placeholder="${e(T(lang, 'Bcc'))}" aria-label="${e(T(lang, 'Bcc'))}"></label>` : ''}<label class="g4-field"><input name="subject" autocomplete="off" value="${e(draft.subject || '')}" placeholder="${e(T(lang, 'Subject'))}" aria-label="${e(T(lang, 'Subject'))}"></label><textarea name="body" placeholder="${e(T(lang, 'Compose email'))}" aria-label="${e(T(lang, 'Compose email'))}">${e(draft.body || '')}</textarea><button type="submit" hidden></button></form></div>`;
  }
  function labelsView(ctx) {
    const {data, ui, lang} = ctx;
    return `<div class="app-view g4-app">${top(ctx, T(lang, 'Labels'), account, {up: true})}<div class="g4-scroll g4-labels">${LABELS.map(l => { const n = ['Drafts', 'Outbox', 'Spam', 'Trash'].includes(l) ? list(data.gmail40, l).length : unread(data.gmail40, l); return `<button class="g4-label${l === (ui.g4Label || 'Inbox') ? ' on' : ''}" data-action="g4-label" data-id="${e(l)}"><span>${e(T(lang, l))}</span>${n ? `<em>${n}</em>` : ''}</button>`; }).join('')}</div></div>`;
  }
  function render(ctx) {
    if (ctx.ui.sub === 'conversation') return conversation(ctx);
    if (ctx.ui.sub === 'compose') return compose(ctx);
    if (ctx.ui.sub === 'labels') return labelsView(ctx);
    return listView(ctx);
  }
  // The recent labels under the title, the compose overflow and the move-to dialog.
  function overlay(ctx) {
    const {ui, lang} = ctx;
    if (ui.overlay === 'g4-recent') return `<div class="menu-scrim" data-action="close-overlay"></div><div class="g4-menu g4-recent" role="menu"><h4>${e(T(lang, 'Recent labels'))}</h4>${['Inbox', 'Starred', 'Sent', 'Drafts'].map(l => `<button data-action="g4-label" data-id="${l}">${e(T(lang, l))}</button>`).join('')}<button data-action="g4-labels">${e(T(lang, 'All labels'))}</button></div>`;
    if (ui.overlay === 'g4-compose-menu') return `<div class="menu-scrim" data-action="close-overlay"></div><div class="g4-menu g4-overflow" role="menu">${[['g4-cc', 'Add Cc/Bcc'], ['g4-save', 'Save draft'], ['g4-discard', 'Discard'], ['g4-unsupported', 'Attach file'], ['g4-unsupported', 'Settings']].map(([a, l]) => `<button data-action="${a}">${e(T(lang, l))}</button>`).join('')}</div>`;
    if (ui.overlay === 'g4-move') return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog g4-move" role="dialog"><h3>${e(T(lang, 'Change labels'))}</h3>${['Inbox', 'Starred', 'Important', 'Trash'].map(l => `<button class="settings-row" data-action="g4-move-to" data-id="${l}"><span class="row-copy">${e(T(lang, l))}</span></button>`).join('')}<div class="settings-dialog-actions"><button data-action="close-overlay">${e(T(lang, 'Cancel'))}</button></div></div>`;
    return null;
  }
  // Taps and forms; ctx: {data, ui, lang, save, render, renderOverlay, toast}. Returns true when handled.
  function handle(action, id, ctx) {
    const {data, ui} = ctx, mail = data.gmail40;
    const targets = () => ui.sub === 'conversation' ? [ui.g4Id] : ui.g4Selected || [];
    const done = () => { ui.g4Selected = []; if (ui.sub === 'conversation') ui.sub = ''; ui.overlay = ''; ctx.save(); ctx.renderOverlay(); ctx.render(); };
    switch (action) {
      case 'g4-open': { const item = mail.find(m => m.id === id); if (!item) break; ui.g4Id = id; if (item.label === 'Drafts') { ui.sub = 'compose'; } else { item.read = true; ui.sub = 'conversation'; } ctx.save(); ctx.render(); break; }
      case 'g4-select': ui.g4Selected = (ui.g4Selected || []).includes(id) ? ui.g4Selected.filter(x => x !== id) : [...(ui.g4Selected || []), id]; ctx.render(); break;
      case 'g4-clear': ui.g4Selected = []; ctx.render(); break;
      case 'g4-star': { const item = mail.find(m => m.id === (id || ui.g4Id)); if (item) item.starred = !item.starred; ctx.save(); ctx.render(); break; }
      case 'g4-star-selected': mail.filter(m => (ui.g4Selected || []).includes(m.id)).forEach(m => { m.starred = true; }); done(); break;
      case 'g4-archive': mail.filter(m => targets().includes(m.id) && m.label === 'Inbox').forEach(m => { m.label = 'All mail'; }); done(); break;
      case 'g4-delete': mail.filter(m => targets().includes(m.id)).forEach(m => { m.label = 'Trash'; }); done(); break;
      case 'g4-unread': mail.filter(m => targets().includes(m.id)).forEach(m => { m.read = false; }); done(); break;
      case 'g4-labels': if (targets().length) { ui.overlay = 'g4-move'; ctx.renderOverlay(); } else { ui.overlay = ''; ctx.renderOverlay(); ui.sub = 'labels'; ctx.render(); } break;
      case 'g4-move-to': mail.filter(m => targets().includes(m.id)).forEach(m => { if (id === 'Starred') m.starred = true; else if (id === 'Important') m.important = true; else m.label = id; }); done(); break;
      case 'g4-label': ui.g4Label = id; ui.sub = ''; ui.g4Selected = []; ui.g4Query = undefined; ui.overlay = ''; ctx.renderOverlay(); ctx.render(); break;
      case 'g4-recent': ui.overlay = 'g4-recent'; ctx.renderOverlay(); break;
      case 'g4-refresh': ctx.toast(T(ctx.lang, 'Refresh')); break;
      case 'g4-search': ui.g4Query = ''; ctx.render(); ctx.focus('.g4-search input'); break;
      case 'g4-search-close': ui.g4Query = undefined; ctx.render(); break;
      case 'g4-compose': case 'g4-reply': case 'g4-reply-all': case 'g4-forward': {
        const source = action === 'g4-compose' ? null : mail.find(m => m.id === ui.g4Id);
        const draft = {id: 'g4-' + Date.now(), from: account, address: account, to: source && action !== 'g4-forward' ? source.address : '', subject: source ? `${action === 'g4-forward' ? 'Fwd' : 'Re'}: ${source.subject}` : '', body: source && action === 'g4-forward' ? `\n\n---------- Forwarded message ----------\n${source.body}` : '', label: 'Drafts', created: Date.now(), read: true};
        mail.unshift(draft); ui.g4Id = draft.id; ui.g4Cc = false; ui.sub = 'compose'; ui.overlay = ''; ctx.save(); ctx.renderOverlay(); ctx.render(); ctx.focus(source && action !== 'g4-forward' ? '.g4-form textarea' : '.g4-form [name=to]'); break;
      }
      case 'g4-send': ctx.submit('.g4-form'); break;
      case 'g4-compose-menu': ui.overlay = 'g4-compose-menu'; ctx.renderOverlay(); break;
      case 'g4-cc': ctx.keep(); ui.g4Cc = true; ui.overlay = ''; ctx.renderOverlay(); ctx.render(); break;
      case 'g4-save': ctx.keep(); ui.sub = ''; ui.overlay = ''; ctx.renderOverlay(); ctx.render(); ctx.toast(T(ctx.lang, 'Message saved as draft.')); break;
      case 'g4-discard': { const i = mail.findIndex(m => m.id === ui.g4Id); if (i >= 0) mail.splice(i, 1); ui.sub = ''; ui.overlay = ''; ctx.save(); ctx.renderOverlay(); ctx.render(); break; }
      case 'g4-unsupported': ui.overlay = ''; ctx.renderOverlay(); ctx.toast('This feature is not part of the simulator.'); break;
      default: return false;
    }
    return true;
  }
  // Copies the compose fields into the draft (before Back, Save draft or Add Cc/Bcc).
  function keepDraft(data, ui, form) {
    const draft = data.gmail40.find(m => m.id === ui.g4Id); if (!draft || !form) return;
    for (const key of ['to', 'cc', 'bcc', 'subject', 'body']) { const field = form.querySelector(`[name=${key}]`); if (field) draft[key] = field.value; }
  }
  function submit(form, values, ctx) {
    const {data, ui} = ctx;
    if (form === 'g4-search') { ui.g4Query = String(values.get('query') || '').trim(); ctx.render(); return true; }
    if (form !== 'g4-compose') return false;
    const draft = data.gmail40.find(m => m.id === ui.g4Id); if (!draft) return true;
    for (const key of ['to', 'cc', 'bcc', 'subject', 'body']) if (values.has(key)) draft[key] = String(values.get(key)).trim();
    if (!/\S+@\S+\.\S+/.test(draft.to)) { ctx.toast(T(ctx.lang, 'To')); ctx.focus('.g4-form [name=to]'); return true; }
    draft.label = 'Sent'; draft.created = Date.now(); ui.sub = ''; ctx.save(); ctx.render(); ctx.toast(T(ctx.lang, 'Sending…')); return true;
  }
  window.ICSGmail = {account, restore, list, unread, render, overlay, handle, submit, keepDraft};
})();
