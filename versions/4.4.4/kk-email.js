/* Android 4.4 Email: the first AOSP Email built on UnifiedEmail (packages/apps/Email + packages/apps/UnifiedEmail,
   android-4.4.4_r1; UnifiedEmailTheme = Theme.Holo.Light). Rebuilt from the sources:
   - MailActionBarView: the drawer indicator, the folder name over the account; Compose and Search as actions, Refresh /
     Sync options / Settings / Help in the overflow (conversation_list_menu). In a conversation Delete and Mark unread
     are promoted (archive is unsupported for IMAP/POP), the rest overflows.
   - FolderListFragment (flat, not divided): the account row with its radio button and unread count, then the folders.
   - ConversationItemView (conversation_item_view_normal): a 48 dp sender image, LetterTileProvider tiles (first letter,
     sans-serif-light, colour from the address hash), the 18 sp sender and 12 sp date, the 13 sp two-line
     "subject — snippet", the star; list_unread_holo white rows and list_read_holo #eeeeee rows. Touching the sender
     image selects the conversation (ic_avatar_check) and opens the selection CAB.
   - The conversation view: the subject header with its star, the message header (photo, sender, "to me", date, reply
     and overflow) and the body.
   - ComposeActivity: From, To, optional Cc / Bcc, Subject and "Compose email"; Send in the bar, the rest in the overflow.
   Mail storage and actions are shared with the older Email (email.js, window.ICSEmail). 1 dp = 0.906 px. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // Email / UnifiedEmail strings from the AOSP values, values-hu, -de, -fr and -es.
  const S = {
    'Inbox': ['Inbox', 'Beérkezett üzenetek', 'Posteingang', 'Boîte de réception', 'Recibidos'],
    'Outbox': ['Outbox', 'Kimenő levelek', 'Postausgang', 'Boîte d’envoi', 'Por enviar'],
    'Drafts': ['Drafts', 'Piszkozatok', 'Entwürfe', 'Brouillons', 'Borradores'],
    'Sent': ['Sent', 'Elküldve', 'Gesendet', 'Éléments envoyés', 'Enviados'],
    'Trash': ['Trash', 'Kuka', 'Papierkorb', 'Corbeille', 'Papelera'],
    'Starred': ['Starred', 'Csillagozott', 'Markiert', 'Messages suivis', 'Destacados'],
    'Compose': ['Compose', 'Levélírás', 'Schreiben', 'Nouveau message', 'Redactar'],
    'Search': ['Search', 'Keresés', 'Suche', 'Rechercher', 'Buscar'],
    'Refresh': ['Refresh', 'Frissítés', 'Aktualisieren', 'Actualiser', 'Actualizar'],
    'Sync options': ['Sync options', 'Szinkronizálási beállítások', 'Synchronisierungsoptionen', 'Options de synchronisation', 'Ajustes de sincronización'],
    'Settings': ['Settings', 'Beállítások', 'Einstellungen', 'Paramètres', 'Ajustes'],
    'Help': ['Help', 'Súgó', 'Hilfe', 'Aide', 'Ayuda'],
    'Mark read': ['Mark read', 'Megjelölés olvasottként', 'Als gelesen markieren', 'Marquer comme lu', 'Marcar como leída'],
    'Mark unread': ['Mark unread', 'Megjelölés olvasatlanként', 'Als ungelesen markieren', 'Marquer comme non lu', 'Marcar como no leída'],
    'Delete': ['Delete', 'Törlés', 'Löschen', 'Supprimer', 'Eliminar'],
    'Add star': ['Add star', 'Csillagozás', 'Markieren', 'Activer le suivi', 'Añadir estrella'],
    'Remove star': ['Remove star', 'Csillag eltávolítása', 'Markierung entfernen', 'Désactiver le suivi', 'Eliminar estrella'],
    'Reply': ['Reply', 'Válasz', 'Antworten', 'Répondre', 'Responder'],
    'Reply all': ['Reply all', 'Válasz mind.', 'Allen antworten', 'Répondre à tous', 'Responder a todos'],
    'Forward': ['Forward', 'Továbbítás', 'Weiterleiten', 'Transférer', 'Reenviar'],
    'Send': ['Send', 'Küldés', 'Senden', 'Envoyer', 'Enviar'],
    'Discard': ['Discard', 'Elvetés', 'Löschen', 'Supprimer', 'Descartar'],
    'Save draft': ['Save draft', 'Piszkozat mentése', 'Entwurf speichern', 'Enregistrer le brouillon', 'Guardar borrador'],
    'To': ['To', 'Címzett', 'An', 'À', 'Para'],
    'Cc': ['Cc', 'Másolatot kap', 'Cc', 'Cc', 'Cc'],
    'Bcc': ['Bcc', 'Titkos másolat', 'Bcc', 'Cci', 'Cco'],
    'Subject': ['Subject', 'Tárgy', 'Betreff', 'Objet', 'Asunto'],
    'Compose email': ['Compose email', 'Levélírás', 'E-Mail schreiben', 'Composez un message', 'Escribe tu correo'],
    'Add Cc/Bcc': ['Add Cc/Bcc', 'Másolatmezők', 'Cc/Bcc hinzufügen', 'Ajouter Cc/Cci', 'Añadir Cc/Cco'],
    'Attach picture': ['Attach picture', 'Kép csatolása', 'Bild anhängen', 'Joindre une photo', 'Adjuntar imagen'],
    'Open navigation drawer': ['Open navigation drawer', 'Navigációs fiók kinyitása', 'Navigationsleiste öffnen', 'Ouvrir le panneau de navigation', 'Abrir control de navegación'],
    'Search email': ['Search email', 'E-mail keresése', 'In E-Mails suchen', 'Rechercher l’e-mail', 'Buscar correo'],
    'No messages.': ['No messages.', 'Nincsenek üzenetek.', 'Keine Nachrichten', 'Aucun message', 'No hay ningún mensaje.'],
    'me': ['me', 'nekem', 'ich', 'moi', 'yo'],
    'To: ': ['To: ', 'Címzett: ', 'An: ', 'À : ', 'Para: '],
    'Message saved as draft.': ['Message saved as draft.', 'Az üzenet mentve piszkozatként.', 'Nachricht wurde als Entwurf gespeichert.', 'Brouillon enregistré.', 'Mensaje guardado como borrador'],
    'Move to': ['Move to', 'Áthelyezés ide:', 'Verschieben nach', 'Déplacer vers', 'Mover a']
  };
  const LANGS = ['en', 'hu', 'de', 'fr', 'es'];
  const tr = (lang, key) => (S[key] || [key])[Math.max(0, LANGS.indexOf(lang))] ?? key;
  const FOLDERS = ['Inbox', 'Starred', 'Drafts', 'Outbox', 'Sent', 'Trash'];
  const ICON = name => `<img src="assets/kem-${name}.png" alt="">`;
  // LetterTileProvider: Java String.hashCode of the address picks one of the eight letter_tile_colors.
  const TILE_COLORS = ['#f16364', '#f58559', '#f9a43e', '#e4c62e', '#67bf74', '#59a2be', '#2093cd', '#ad62a7'];
  function hash(text) { let h = 0; for (const ch of String(text)) for (let i = 0; i < ch.length; i++) h = (h * 31 + ch.charCodeAt(i)) | 0; return h; }
  function tile(name, address, cls = 'kem-tile') {
    const first = String(name || address || '').trim().charAt(0);
    const color = TILE_COLORS[Math.abs(hash(address || name)) % TILE_COLORS.length];
    return /\p{L}/u.test(first) ? `<span class="${cls}" style="background:${color}" aria-hidden="true">${e(first.toLocaleUpperCase())}</span>` : `<span class="${cls} generic" aria-hidden="true">${ICON('ic_generic_man')}</span>`;
  }
  // FormattedDateBuilder.formatShortDate: today's messages show the time, older ones "MMM d".
  function shortDate(item, locale, now = Date.now()) {
    if (item.created) {
      const d = new Date(item.created), today = new Date(now);
      return d.toDateString() === today.toDateString() ? d.toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit'}) : d.toLocaleDateString(locale, {month: 'short', day: 'numeric'});
    }
    if (item.time === 'Yesterday') return new Date(now - 864e5).toLocaleDateString(locale, {month: 'short', day: 'numeric'});
    return item.time || '';
  }
  const bar = (left, title, sub, actions) => `<header class="kem-bar">${left}<span class="kem-title"><b>${e(title)}</b>${sub ? `<small>${e(sub)}</small>` : ''}</span>${actions}</header>`;
  const act = (action, label, icon, id = '') => `<button type="button" class="kem-act" data-action="${action}"${id ? ` data-id="${e(id)}"` : ''} aria-label="${e(label)}">${ICON(icon)}</button>`;
  const overflow = menu => `<button type="button" class="kem-act" data-action="email-menu" data-id="${menu}" aria-label="More options">${ICON('ic_menu_moreoverflow_normal_holo_light')}</button>`;
  const upHome = (ctx, action = 'email-list') => `<button type="button" class="kem-up" data-action="${action}" aria-label="Back">${ICON('ic_up_holo_light')}<img src="assets/email.png" alt=""></button>`;

  function render(mail, ui, t, locale, lang) {
    const T = key => tr(lang, key), account = window.ICSEmail.account;
    const folder = ui.emailFolder || 'Inbox', selected = ui.emailSelected || [], item = mail.find(m => m.id === ui.emailId);
    if (ui.sub === 'compose' && item) {
      const field = (key, label) => `<label class="kem-field"><input type="text" name="${key}" value="${e(item[key] || '')}" placeholder="${e(T(label))}" aria-label="${e(T(label))}"${key === 'subject' ? ' maxlength="160"' : ''}></label>`;
      const cc = ui.emailCc || item.cc || item.bcc;
      return `<form class="app-view kem kem-compose email-compose" data-form="email">${bar(upHome(), T('Compose'), '', `<button type="submit" class="kem-act" aria-label="${e(T('Send'))}">${ICON('ic_menu_send_holo_light')}</button>${overflow('compose')}`)}<div class="email-scroll kem-scroll"><div class="kem-from">${e(account)}</div>${field('to', 'To')}${cc ? field('cc', 'Cc') + field('bcc', 'Bcc') : ''}${field('subject', 'Subject')}<label class="kem-body"><textarea name="body" placeholder="${e(T('Compose email'))}" aria-label="${e(T('Compose email'))}" maxlength="10000">${e(item.body)}</textarea></label>${item.attachment ? `<div class="kem-attachment">${window.ICSMedia.art(item.attachment)}<span>${e(item.attachment.name)}</span><button type="button" data-action="email-remove-attachment" aria-label="${e(T('Discard'))}">×</button></div>` : ''}${ui.emailError ? `<p class="kem-error">${e(t(ui.emailError))}</p>` : ''}</div></form>`;
    }
    if (ui.sub === 'read' && item) {
      const trashLike = item.folder === 'Trash';
      const actions = (trashLike ? act('email-restore', T('Move to'), 'ic_menu_move_to_holo_light') : act('email-trash', T('Delete'), 'ic_menu_trash_holo_light')) + act('email-unread', T('Mark unread'), 'ic_menu_mark_unread_holo_light') + overflow('conversation');
      const sent = item.folder === 'Sent' || item.folder === 'Drafts';
      const to = sent ? item.to || '' : T('me');
      return `<div class="app-view kem kem-conversation">${bar(upHome(), T(folder), '', actions)}<div class="email-scroll kem-scroll"><div class="kem-subject"><h2>${e(item.subject || '')}</h2><button class="kem-conv-star" data-action="email-star" data-id="${e(item.id)}" aria-label="${e(T(item.starred ? 'Remove star' : 'Add star'))}" aria-pressed="${item.starred}">${ICON(item.starred ? 'ic_star_on_convo_view_holo_light' : 'ic_star_off_convo_view_holo_light')}</button></div><article class="kem-message"><div class="kem-msg-head">${tile(item.from, item.address)}<span class="kem-msg-who"><b>${e(item.from)}</b><small>${e(T('To: ').trimEnd())} ${e(to)}</small></span><span class="kem-msg-date">${e(shortDate(item, locale))}</span><button class="kem-msg-act" data-action="email-reply" aria-label="${e(T('Reply'))}">${ICON('ic_reply_holo_light')}</button><button class="kem-msg-act" data-action="email-menu" data-id="message" aria-label="More options">${ICON('ic_menu_moreoverflow_normal_holo_light')}</button></div><div class="kem-msg-body">${e(item.body).replace(/\n/g, '<br>')}</div>${item.attachment ? `<div class="kem-attachment">${window.ICSMedia.art(item.attachment)}<span>${e(item.attachment.name)}</span></div>` : ''}</article></div></div>`;
    }
    const rows = window.ICSEmail.list(mail, folder, ui.emailQuery || '');
    const head = selected.length
      ? `<header class="kem-bar cab"><button type="button" class="kem-cab-done" data-action="email-clear-selection" aria-label="Done">${ICON('ic_cab_done_holo_light')}</button><span class="kem-title"><b>${selected.length}</b></span>${folder === 'Trash' ? act('email-selected-restore', T('Move to'), 'ic_menu_move_to_holo_light') : act('email-selected-trash', T('Delete'), 'ic_menu_trash_holo_light')}${act('email-selected-read', T('Mark read'), 'ic_menu_mark_read_holo_light')}</header>`
      : ui.emailQuery !== undefined
        ? `<form class="kem-bar kem-searchbar" data-form="email-search">${upHome(null, 'email-list')}<input name="query" value="${e(ui.emailQuery)}" placeholder="${e(T('Search email'))}" aria-label="${e(T('Search email'))}" autocomplete="off"><button type="submit" class="kem-act" aria-label="${e(T('Search'))}">${ICON('ic_menu_search_holo_light')}</button></form>`
        : bar(`<button type="button" class="kem-up kem-nav" data-action="email-drawer" aria-label="${e(T('Open navigation drawer'))}">${ICON('ic_drawer')}<img src="assets/email.png" alt=""></button>`, T(folder), account, act('email-compose', T('Compose'), 'ic_menu_compose_normal_holo_light') + act('email-search', T('Search'), 'ic_menu_search_holo_light') + overflow('list'));
    const row = m => {
      const on = selected.includes(m.id), who = m.folder === 'Sent' || m.folder === 'Drafts' ? (m.to || m.from) : m.from;
      return `<div class="kem-row ${m.read ? 'read' : 'unread'}${on ? ' selected' : ''}"><button class="kem-photo" data-action="email-select" data-id="${e(m.id)}" role="checkbox" aria-checked="${on}" aria-label="${e(who)}">${on ? `<span class="kem-tile checked">${ICON('ic_avatar_check')}</span>` : tile(who, m.folder === 'Sent' ? m.to : m.address)}</button><button class="kem-row-main" data-action="email-read" data-id="${e(m.id)}"><span class="kem-line1"><b class="kem-senders">${m.folder === 'Drafts' ? `<span class="kem-draft">${e(T('Drafts'))}</span>` : e(who)}</b>${m.attachment ? `<i class="kem-clip">${ICON('ic_attachment_holo_light')}</i>` : ''}<span class="kem-date">${e(shortDate(m, locale))}</span></span><span class="kem-line2"><span class="kem-subj">${e(m.subject || '')}</span>${m.body ? ` — <span class="kem-snippet">${e(m.body.replace(/\s+/g, ' '))}</span>` : ''}</span></button><button class="kem-star" data-action="email-star" data-id="${e(m.id)}" aria-label="${e(T(m.starred ? 'Remove star' : 'Add star'))}" aria-pressed="${m.starred}">${ICON(m.starred ? 'ic_btn_star_on' : 'ic_btn_star_off')}</button></div>`;
    };
    return `<div class="app-view kem kem-list">${head}<div class="email-scroll kem-scroll">${rows.length ? rows.map(row).join('') : `<p class="kem-empty">${e(T('No messages.'))}</p>`}</div></div>`;
  }
  // The drawer (under the action bar), the overflow menus and the photo picker / discard dialogs.
  function overlay(mail, ui, photos, t, lang) {
    const T = key => tr(lang, key), account = window.ICSEmail.account, folder = ui.emailFolder || 'Inbox';
    const unread = name => window.ICSEmail.list(mail, name).filter(m => !m.read).length;
    if (ui.overlay === 'email-drawer') {
      const total = unread('Inbox');
      return `<div class="kem-drawer-scrim" data-action="close-overlay"></div><nav class="kem-drawer" aria-label="${e(T('Open navigation drawer'))}"><button class="kem-account" data-action="close-overlay">${ICON('ic_radiobutton_selected')}<span>${e(account)}</span>${total ? `<em>${total}</em>` : ''}</button>${FOLDERS.map(name => { const n = name === 'Drafts' || name === 'Outbox' ? window.ICSEmail.list(mail, name).length : unread(name); return `<button class="kem-folder${name === folder ? ' on' : ''}" data-action="email-folder" data-id="${name}"><span>${e(T(name))}</span>${n ? `<em>${n}</em>` : ''}</button>`; }).join('')}</nav>`;
    }
    const menu = items => `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu kem-menu">${items.map(([action, label]) => `<button data-action="${action}">${e(T(label))}</button>`).join('')}</div>`;
    if (ui.overlay === 'email-menu') {
      const kind = ui.emailMenu || 'list';
      if (kind === 'compose') return menu([['email-attach', 'Attach picture'], ['email-cc', 'Add Cc/Bcc'], ['email-save', 'Save draft'], ['email-discard', 'Discard'], ['email-unavailable', 'Settings'], ['email-unavailable', 'Help']]);
      if (kind === 'conversation') return menu([['email-folders', 'Move to'], ['email-unavailable', 'Settings'], ['email-unavailable', 'Help']]);
      if (kind === 'message') return menu([['email-reply-all', 'Reply all'], ['email-forward', 'Forward']]);
      return menu([['email-refresh', 'Refresh'], ['email-unavailable', 'Sync options'], ['email-unavailable', 'Settings'], ['email-unavailable', 'Help']]);
    }
    if (ui.overlay === 'email-folders') return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="kem-dialog" role="dialog" aria-label="${e(T('Move to'))}"><h3>${e(T('Move to'))}</h3>${['Inbox', 'Drafts', 'Sent', 'Trash'].map(name => `<button data-action="email-move" data-id="${name}">${e(T(name))}</button>`).join('')}</div>`;
    return window.ICSEmail.overlay(mail, ui, photos, t);
  }
  window.KKEmail = {S, tr, TILE_COLORS, hash, tile, shortDate, render, overlay};
})();
