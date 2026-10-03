/* Gmail 5.0.2 and Email 7.0 on the Nexus 6 (LMY48Y): both are the Material UnifiedEmail. Rebuilt from their resources:
   - the 56 dp toolbar in the app colour (Gmail #DA4336 over #B93221, Email #E7790D over #D06D0C) with the drawer
     button, the 20 sp folder name and Search; selection turns it into the contextual bar;
   - ConversationItemView: 16 dp in, the 40 dp round LetterTileProvider tile (Gmail's ten letter_tile_colors), the 18 sp
     #212121 senders (bold when unread) with the 12 sp date (#4285F4 when unread, #757575 read), the 14 sp subject and
     the #757575 snippet, the star at the end; Gmail's personal-level carets before the senders;
   - the compose FAB (56 dp, compose_button_background_color, the white pencil) 16 dp from the corner;
   - the 264 dp drawer: the 147 dp account header over the blue cover with the 64 dp avatar, then the folders with
     their 24 dp icons, the selected one on #12000000 in the app colour;
   - the conversation: Archive, Delete, Mark unread on the toolbar, the 20 sp subject with its label chip and the star,
     the message header (40 dp tile, sender, "to me", date, reply and overflow) and the body;
   - ComposeActivity: the toolbar with attach and send, From / To / Subject rows with #757575 labels, "Compose email".
   Mail storage and actions are shared with email.js (window.ICSEmail); strings come from kk-email.js (KKEmail.tr). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const TILE_COLORS = ['#f9a825', '#ff6e40', '#f06292', '#e06055', '#9e9e9e', '#b388ff', '#9575cd', '#4dd0e1', '#00bfa5', '#00c853'];
  function hash(text) { let h = 0; for (const ch of String(text)) for (let i = 0; i < ch.length; i++) h = (h * 31 + ch.charCodeAt(i)) | 0; return h; }
  function tile(name, address, cls = 'lem-tile') {
    const first = String(name || address || '').trim().charAt(0);
    const color = TILE_COLORS[Math.abs(hash(address || name)) % TILE_COLORS.length];
    return /\p{L}/u.test(first) ? `<span class="${cls}" style="background:${color}" aria-hidden="true">${e(first.toLocaleUpperCase())}</span>` : `<span class="${cls}" style="background:#f48fb1" aria-hidden="true"><img src="assets/gd-ic_person_white_120dp.png" alt=""></span>`;
  }
  const THEMES = {email: {primary: '#e7790d', dark: '#d06d0c', name: 'Email'}, gmail: {primary: '#da4336', dark: '#b93221', name: 'Gmail'}};
  const icon = name => `<img src="assets/gm5-${name}.png" alt="">`;
  const act = (action, label, name, id = '') => `<button type="button" class="lem-act" data-action="${action}"${id ? ` data-id="${e(id)}"` : ''} aria-label="${e(label)}">${icon(name)}</button>`;
  const overflow = (menu, dark = false) => `<button type="button" class="lem-act${dark ? ' dark' : ''}" data-action="email-menu" data-id="${menu}" aria-label="More options">${icon('ic_overflow_24dp')}</button>`;
  const FOLDER_ICONS = {Inbox: 'inbox', Primary: 'primary', Social: 'social', Promotions: 'promotions', 'Priority Inbox': 'priority', Starred: 'starred', Important: 'important', Chats: 'allmail', Sent: 'sent', Outbox: 'outbox', Drafts: 'drafts', 'All mail': 'allmail', Spam: 'spam', Trash: 'trash'};
  function render(mail, ui, t, locale, lang, opts = {}) {
    const T = key => { const v = window.KKEmail.tr(lang, key); return v !== key ? v : t(key); }, account = opts.account || window.ICSEmail.account;
    const theme = THEMES[opts.app || 'email'];
    const listOf = opts.list || window.ICSEmail.list, name = opts.folderName || (folder => T(folder));
    const folder = ui.emailFolder || (opts.app === 'gmail' ? 'Primary' : 'Inbox'), selected = ui.emailSelected || [], item = mail.find(m => m.id === ui.emailId);
    const style = `--lem:${theme.primary};--lem-dark:${theme.dark}`;
    if (ui.sub === 'compose' && item) {
      const field = (key, label) => `<label class="lem-field"><span>${e(T(label))}</span><input type="text" name="${key}" value="${e(item[key] || '')}" aria-label="${e(T(label))}"${key === 'subject' ? ' maxlength="160"' : ''}></label>`;
      const cc = ui.emailCc || item.cc || item.bcc;
      return `<form class="app-view lem lem-compose email-compose" style="${style}" data-form="email"><header class="lem-bar">${act('email-list', T('Navigate up'), 'ic_arrow_back_wht_24dp')}<h2>${e(T('Compose'))}</h2>${act('email-attach', T('Attach picture'), 'ic_attach_file_wht_24dp')}<button type="submit" class="lem-act" aria-label="${e(T('Send'))}">${icon('ic_send_wht_24dp')}</button>${overflow('compose')}</header><div class="email-scroll lem-scroll"><div class="lem-field lem-from"><span>${e(T('From'))}</span><b>${e(item.from === window.ICSEmail.account ? account : item.address || account)}</b></div>${field('to', 'To')}${cc ? field('cc', 'Cc') + field('bcc', 'Bcc') : ''}<label class="lem-field lem-subject-field"><input type="text" name="subject" value="${e(item.subject || '')}" placeholder="${e(T('Subject'))}" aria-label="${e(T('Subject'))}" maxlength="160"></label><label class="lem-body"><textarea name="body" placeholder="${e(T('Compose email'))}" aria-label="${e(T('Compose email'))}" maxlength="10000">${e(item.body)}</textarea></label>${item.attachment ? `<div class="lem-attachment">${window.ICSMedia.art(item.attachment)}<span>${e(item.attachment.name)}</span><button type="button" data-action="email-remove-attachment" aria-label="${e(T('Discard'))}">×</button></div>` : ''}${ui.emailError ? `<p class="lem-error">${e(t(ui.emailError))}</p>` : ''}</div></form>`;
    }
    if (ui.sub === 'read' && item) {
      const trashLike = item.folder === 'Trash';
      const actions = (opts.archive && item.folder === 'Inbox' ? act('email-archive', T('Archive'), 'ic_archive_wht_24dp') : '') + (trashLike ? act('email-restore', T('Move to'), 'ic_move_to_wht_24dp') : act('email-trash', T('Delete'), 'ic_delete_wht_24dp')) + act('email-unread', T('Mark unread'), 'ic_mark_unread_wht_24dp') + overflow('conversation');
      const sent = item.folder === 'Sent' || item.folder === 'Drafts';
      const to = sent ? item.to || '' : T('me');
      return `<div class="app-view lem lem-conversation" style="${style}"><header class="lem-bar">${act('email-list', T('Navigate up'), 'ic_arrow_back_wht_24dp')}<span class="lem-spacer"></span>${actions}</header><div class="email-scroll lem-scroll"><div class="lem-subject"><h2>${e(item.subject || '')}${opts.chip ? opts.chip(item) : ''}</h2><button class="lem-conv-star" data-action="email-star" data-id="${e(item.id)}" aria-label="${e(T(item.starred ? 'Remove star' : 'Add star'))}" aria-pressed="${item.starred}">${icon(item.starred ? 'ic_star_20dp' : 'ic_star_outline_20dp')}</button></div><article class="lem-message"><div class="lem-msg-head">${tile(item.from, item.address)}<span class="lem-msg-who"><b>${e(item.from)}</b><small>${e(T('to'))} ${e(to)} · ${e(window.KKEmail.shortDate(item, locale))}</small></span><button class="lem-msg-act" data-action="email-reply" aria-label="${e(T('Reply'))}">${icon('ic_reply_24dp')}</button><button class="lem-msg-act narrow" data-action="email-menu" data-id="message" aria-label="More options">${icon('ic_overflow_24dp')}</button></div><div class="lem-msg-body">${e(item.body).replace(/\n/g, '<br>')}</div>${item.attachment ? `<div class="lem-attachment">${window.ICSMedia.art(item.attachment)}<span>${e(item.attachment.name)}</span></div>` : ''}<div class="lem-msg-footer"><button data-action="email-reply">${icon('ic_reply_24dp')}<span>${e(T('Reply'))}</span></button><button data-action="email-reply-all">${icon('ic_reply_all_24dp')}<span>${e(T('Reply all'))}</span></button><button data-action="email-forward">${icon('ic_forward_24dp')}<span>${e(T('Forward'))}</span></button></div></article></div></div>`;
    }
    const rows = listOf(mail, folder, ui.emailQuery || '');
    const head = selected.length
      ? `<header class="lem-bar cab">${act('email-clear-selection', 'Done', 'ic_arrow_back_wht_24dp')}<h2>${selected.length}</h2>${opts.archive && folder !== 'Trash' ? act('email-selected-archive', T('Archive'), 'ic_archive_wht_24dp') : ''}${folder === 'Trash' ? act('email-selected-restore', T('Move to'), 'ic_move_to_wht_24dp') : act('email-selected-trash', T('Delete'), 'ic_delete_wht_24dp')}${act('email-selected-read', T('Mark read'), 'ic_mark_read_wht_24dp')}</header>`
      : ui.emailQuery !== undefined
        ? `<form class="lem-bar lem-searchbar" data-form="email-search">${act('email-list', T('Navigate up'), 'ic_arrow_back_wht_24dp')}<input name="query" value="${e(ui.emailQuery)}" placeholder="${e(T('Search email'))}" aria-label="${e(T('Search email'))}" autocomplete="off"></form>`
        : `<header class="lem-bar">${act('email-drawer', T('Open navigation drawer'), 'ic_menu_wht_24dp')}<h2>${e(name(folder))}</h2>${act('email-search', T('Search'), 'ic_menu_search')}${overflow('list')}</header>`;
    const row = m => {
      const on = selected.includes(m.id), who = m.folder === 'Sent' || m.folder === 'Drafts' ? (m.to || m.from) : m.from;
      return `<div class="lem-row ${m.read ? 'read' : 'unread'}${on ? ' selected' : ''}"><button class="lem-photo" data-action="email-select" data-id="${e(m.id)}" role="checkbox" aria-checked="${on}" aria-label="${e(who)}">${on ? '<span class="lem-tile checked">✓</span>' : tile(who, m.folder === 'Sent' ? m.to : m.address)}</button><button class="lem-row-main" data-action="email-read" data-id="${e(m.id)}"><span class="lem-line1">${opts.marker ? opts.marker(m) : ''}<b class="lem-senders">${m.folder === 'Drafts' ? `<span class="lem-draft">${e(T('Drafts'))}</span>` : e(who)}</b>${m.attachment ? `<i class="lem-clip">${icon('ic_attach_file_wht_24dp')}</i>` : ''}<span class="lem-date">${e(window.KKEmail.shortDate(m, locale))}</span></span><span class="lem-subj">${e(m.subject || '')}</span><span class="lem-snippet">${e((m.body || '').replace(/\s+/g, ' '))}</span></button><button class="lem-star" data-action="email-star" data-id="${e(m.id)}" aria-label="${e(T(m.starred ? 'Remove star' : 'Add star'))}" aria-pressed="${m.starred}">${icon(m.starred ? 'ic_star_20dp' : 'ic_star_outline_20dp')}</button></div>`;
    };
    const plain = !selected.length && ui.emailQuery === undefined;
    const top = plain && opts.top ? opts.top(folder) : '';
    return `<div class="app-view lem lem-list" style="${style}">${head}<div class="email-scroll lem-scroll">${top}${rows.length ? rows.map(row).join('') : `<p class="lem-empty">${e(T('No messages.'))}</p>`}</div>${plain ? `<button class="lem-fab" data-action="email-compose" aria-label="${e(T('Compose'))}">${icon('ic_pencil_wht_24dp')}</button>` : ''}</div>`;
  }
  // The navigation drawer: account header, then the folders with their icons.
  const translate = (lang, key) => { const v = window.KKEmail.tr(lang, key); return v !== key ? v : window.AndroidI18n?.t?.(key) ?? key; };
  function drawer(mail, ui, lang, opts) {
    const T = key => translate(lang, key);
    const theme = THEMES[opts.app || 'email'], account = opts.account || window.ICSEmail.account;
    const groups = opts.folders || [['', ['Inbox', 'Starred', 'Drafts', 'Outbox', 'Sent', 'Trash']]];
    const folder = ui.emailFolder || (opts.app === 'gmail' ? 'Primary' : 'Inbox');
    const listOf = opts.list || window.ICSEmail.list, name = opts.folderName || (f => T(f));
    const count = f => { const items = listOf(mail, f); return ['Drafts', 'Outbox', 'Spam', 'Trash', 'All mail', 'Starred'].includes(f) ? items.length : items.filter(m => !m.read).length; };
    const row = f => { const n = count(f); return `<button class="lem-folder${f === folder ? ' on' : ''}" data-action="email-folder" data-id="${e(f)}"><span class="lem-folder-icon" style="-webkit-mask-image:url(assets/gm5-ic_drawer_${FOLDER_ICONS[f] || 'label'}_24dp.png);mask-image:url(assets/gm5-ic_drawer_${FOLDER_ICONS[f] || 'label'}_24dp.png)"></span><span class="lem-folder-name">${e(name(f))}</span>${n ? `<em>${n}</em>` : ''}</button>`; };
    const initial = account.charAt(0).toLocaleUpperCase();
    return `<div class="lem-drawer-scrim" data-action="close-overlay"></div><nav class="lem-drawer" style="--lem:${theme.primary}" aria-label="${e(theme.name)}"><div class="lem-account"><span class="lem-account-avatar">${e(initial)}</span><b>${e(opts.accountName || 'Nexus 6')}</b><small>${e(account)}</small></div>${groups.map(([title, folders]) => `${title ? `<h4>${e(name(title))}</h4>` : ''}${folders.map(row).join('')}`).join('<hr>')}<hr><button class="lem-folder" data-action="email-unavailable"><span class="lem-folder-icon" style="-webkit-mask-image:url(assets/gm5-ic_drawer_settings_24dp.png);mask-image:url(assets/gm5-ic_drawer_settings_24dp.png)"></span><span class="lem-folder-name">${e(T('Settings'))}</span></button><button class="lem-folder" data-action="email-unavailable"><span class="lem-folder-icon" style="-webkit-mask-image:url(assets/gm5-ic_drawer_help_24dp.png);mask-image:url(assets/gm5-ic_drawer_help_24dp.png)"></span><span class="lem-folder-name">${e(T('Help & feedback'))}</span></button></nav>`;
  }
  function overlay(mail, ui, photos, t, lang, opts = {}) {
    const T = key => translate(lang, key);
    if (ui.overlay === 'email-drawer') return drawer(mail, ui, lang, opts);
    const menu = items => `<div class="menu-scrim" data-action="close-overlay"></div><div class="lp-popup-menu" role="menu">${items.map(([action, label]) => `<button role="menuitem" data-action="${action}">${e(T(label))}</button>`).join('')}</div>`;
    if (ui.overlay === 'email-menu') {
      const kind = ui.emailMenu || 'list';
      if (kind === 'compose') return menu([['email-cc', 'Add Cc/Bcc'], ['email-save', 'Save draft'], ['email-discard', 'Discard'], ['email-unavailable', 'Settings'], ['email-unavailable', 'Help & feedback']]);
      if (kind === 'conversation') return menu([['email-folders', 'Move to'], ['email-unavailable', 'Settings'], ['email-unavailable', 'Help & feedback']]);
      if (kind === 'message') return menu([['email-reply-all', 'Reply all'], ['email-forward', 'Forward']]);
      return menu([['email-refresh', 'Refresh'], ['email-unavailable', 'Settings'], ['email-unavailable', 'Help & feedback']]);
    }
    return window.KKEmail.overlay(mail, ui, photos, t, lang, {});
  }
  window.LPEmail = {TILE_COLORS, THEMES, hash, tile, render, overlay};
})();
