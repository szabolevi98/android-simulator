/* Gmail 4.7 on the stock Nexus 5 (GSMArena Nexus 5 review screenshots, November 2013). Gmail is built on the same
   UnifiedEmail code as the AOSP Email (kk-email.js renders the screens); this file adds what Gmail has on top:
   - the inbox categories: "Primary" with its unread count under the title, the "Welcome to your new Inbox" teaser,
     the Social and Promotions rows with their blue "53 New" and green "1 New" badges, and "Change categories";
   - the drawer: the account, INBOX (Primary, Social, Promotions, Priority Inbox) and ALL LABELS (Starred, Important,
     Chats, Sent, Outbox, Drafts, All mail, Spam, Trash) with the selected row in #33b5e5;
   - the personal level markers (UnifiedEmail ic_email_caret_*: » only to me, › to me and others, yellow if
     important), Archive in the conversation and selection bars, and the "Inbox" label chip under the subject.
   The mailbox is a separate offline Gmail account; nothing is sent. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const account = 'kitkat.demo@gmail.com';
  const LANGS = ['en', 'hu', 'de', 'fr', 'es'];
  // Gmail's own label names in the five simulator languages.
  const S = {
    'Primary': ['Primary', 'Elsődleges', 'Allgemein', 'Principale', 'Principal'],
    'Social': ['Social', 'Közösségi', 'Soziale Netzwerke', 'Réseaux sociaux', 'Social'],
    'Promotions': ['Promotions', 'Promóciók', 'Werbung', 'Promotions', 'Promociones'],
    'Priority Inbox': ['Priority Inbox', 'Prioritásos beérkező levelek', 'Sortierter Eingang', 'Boîte de réception prioritaire', 'Prioritarios'],
    'Important': ['Important', 'Fontos', 'Wichtig', 'Important', 'Importantes'],
    'Chats': ['Chats', 'Csevegések', 'Chats', 'Chats', 'Chats'],
    'All mail': ['All mail', 'Összes levél', 'Alle Nachrichten', 'Tous les messages', 'Todos'],
    'Spam': ['Spam', 'Spam', 'Spam', 'Spam', 'Spam'],
    'INBOX': ['INBOX', 'BEÉRKEZŐ LEVELEK', 'POSTEINGANG', 'BOÎTE DE RÉCEPTION', 'RECIBIDOS'],
    'ALL LABELS': ['ALL LABELS', 'ÖSSZES CÍMKE', 'ALLE LABELS', 'TOUS LES LIBELLÉS', 'TODAS LAS ETIQUETAS'],
    'Welcome to your new Inbox': ['Welcome to your new Inbox', 'Üdvözöljük az új postafiókban', 'Willkommen in Ihrem neuen Posteingang', 'Bienvenue dans votre nouvelle boîte de réception', 'Bienvenido a tu nueva bandeja de entrada'],
    'Mail categories group messages of the same type for reading all at once.': ['Mail categories group messages of the same type for reading all at once.', 'A levélkategóriák az azonos típusú üzeneteket csoportosítják, így egyszerre elolvashatja őket.', 'E-Mail-Kategorien gruppieren Nachrichten desselben Typs, damit Sie sie gemeinsam lesen können.', 'Les catégories regroupent les messages du même type pour que vous puissiez les lire en une seule fois.', 'Las categorías agrupan los mensajes del mismo tipo para que los leas todos a la vez.'],
    'Learn more': ['Learn more', 'További információ', 'Weitere Informationen', 'En savoir plus', 'Más información'],
    'You can enable and disable categories in settings.': ['You can enable and disable categories in settings.', 'A kategóriákat a beállításokban kapcsolhatja be és ki.', 'Sie können Kategorien in den Einstellungen aktivieren und deaktivieren.', 'Vous pouvez activer et désactiver les catégories dans les paramètres.', 'Puedes habilitar e inhabilitar las categorías en la configuración.'],
    'Change categories': ['Change categories', 'Kategóriák módosítása', 'Kategorien ändern', 'Modifier les catégories', 'Cambiar categorías'],
    '%d unread': ['%d unread', '%d olvasatlan', '%d ungelesen', '%d non lus', '%d no leídos'],
    '%d New': ['%d New', '%d új', '%d neu', '%d nouveaux', '%d nuevos']
  };
  const tr = (lang, key) => (S[key] || [key])[Math.max(0, LANGS.indexOf(lang))] ?? key;
  const INBOX = ['Primary', 'Social', 'Promotions', 'Priority Inbox'];
  const LABELS = ['Starred', 'Important', 'Chats', 'Sent', 'Outbox', 'Drafts', 'All mail', 'Spam', 'Trash'];
  const FOLDERS = [...INBOX, ...LABELS];
  const CATEGORY = {Primary: 'primary', Social: 'social', Promotions: 'promotions'};
  // A 2013 inbox: personal mail in Primary, Google+ in Social, Google Play offers in Promotions.
  const SAMPLES = [
    ['Google Nexus', 'nexus-noreply@google.com', 'Welcome to the new Nexus 5 powered by Android 4.4, KitKat', 'Discover what your new smartphone has to offer. Now that you own the new Google Nexus 5, discover how you can tailor it to fit — and enhance — your life.', 'primary', true, 'only', 0],
    ['Alex Morgan', 'alex@example.com', 'Hike on Saturday?', 'Are you up for the ridge trail this weekend? I can pick you up at 8. Bring the new phone, the camera is supposed to be good.', 'primary', true, 'only', 1],
    ['Google Calendar', 'calendar-notification@google.com', 'Reminder: Coffee with Alex @ 11am', 'Coffee with Alex. When: 11am – 12pm. Calendar: ' + account, 'primary', false, 'only', 2],
    ['Mom', 'mom@example.com', 'Sunday lunch', 'Don’t forget Sunday lunch at ours. Bring dessert if you can — KitKat is fine!', 'primary', false, 'only', 30],
    ['Taylor Lee', 'taylor@example.com', 'Slides for Monday', 'Here are the slides from the meetup. Let me know what you think.', 'primary', false, 'list', 50],
    ['Google+', 'noreply-plus@google.com', 'Sam Rivera added you on Google+', 'Follow and share with Sam Rivera. Add Sam to your circles.', 'social', false, 'only', 3],
    ['Google+', 'noreply-plus@google.com', 'Taylor Lee shared a photo with you', 'Taylor Lee shared an album: Meetup 2013. View photos on Google+.', 'social', false, 'only', 26],
    ['Google Play', 'googleplay-noreply@google.com', 'New on Google Play: sweet deals for KitKat', 'Apps, games, movies and books picked for your new Nexus 5 — this week only.', 'promotions', false, 'list', 6]
  ];
  function restore(saved, now = Date.now()) {
    if (Array.isArray(saved)) return saved.map(item => ({...item, id: String(item.id), body: String(item.body || ''), subject: String(item.subject || ''), to: String(item.to || ''), cc: String(item.cc || ''), bcc: String(item.bcc || ''), read: !!item.read, starred: !!item.starred}));
    return SAMPLES.map(([from, address, subject, body, category, important, personal, hoursAgo], i) => ({id: 'gm-' + (i + 1), from, address, to: account, subject, body, folder: 'Inbox', category, important, personal, created: now - hoursAgo * 36e5, read: i >= 3 && category === 'primary', starred: i === 1}));
  }
  /* Settings (audit step 5), Gmail 4.6.1 (Gmail2.apk of KTU84P): preference_headers.xml (General settings, the account, About Gmail),
     general_preferences.xml, the account's account_preferences.xml and inbox_section_preferences.xml, in the
     image's words (stock-strings.js). Values live in data.gmailPrefs. Inbox categories: Primary always, Social and
     Promotions on, Updates and Forums off by default; a category turned off sends its mail back to Primary and leaves
     the inbox, the drawer and the teaser. The signature (EditTextPreference) is added to new mail as "\n\n%s". */
  const P = (lang, key) => { const row = window.StockStrings?.gmailprefs?.[key], i = ['hu', 'de', 'fr', 'es'].indexOf(lang); return row ? (i >= 0 ? row[i] : row[4] || key) : key; };
  const GENERAL = [['list', 'removal-action', 'Archive & delete actions', ['Show archive only', 'Show delete only', 'Show archive & delete'], 0], ['check', 'swipe', 'Swipe to archive', 'In conversation list', true], ['check', 'sender-image', 'Sender image', 'Sender image summary', true], ['check', 'reply-all', 'Reply all', 'Reply all summary', false], ['check', 'auto-fit', 'Auto-fit messages', 'Auto-fit summary', true], ['list', 'auto-advance', 'Auto-advance', ['Newer', 'Older', 'Conversation list'], 2], ['list', 'text-size', 'Message text size', ['Tiny', 'Small', 'Normal', 'Large', 'Huge'], 2], ['list', 'snap-headers', 'Message actions', ['Always show', 'Only show in portrait', "Don't show"], 2], ['cat', 'Action Confirmations'], ['check', 'confirm-delete', 'Confirm before deleting', '', true], ['check', 'confirm-archive', 'Confirm before archiving', '', true], ['check', 'confirm-send', 'Confirm before sending', '', true]];
  const ACCOUNT = [['list', 'inbox-type', 'Inbox type', ['Default Inbox', 'Priority Inbox'], 0], ['screen', 'categories', 'Inbox categories'], ['check', 'notifications', 'Notifications', '', true], ['unsupported', 'sound', 'Inbox sound & vibrate'], ['signature'], ['cat', 'Data usage'], ['check', 'sync', 'Sync Gmail', '', true], ['unsupported', 'days', 'Days of mail to sync'], ['unsupported', 'labels', 'Manage labels'], ['check', 'prefetch', 'Download attachments', 'Download attachments summary', true]];
  const CATEGORIES = [['fixed', 'primary', 'Primary', 'Primary summary'], ['check', 'social', 'Social', 'Social summary', true], ['check', 'promotions', 'Promotions', 'Promotions summary', true], ['check', 'updates', 'Updates', 'Updates summary', false], ['check', 'forums', 'Forums', 'Forums summary', false], ['cat', 'Starred category'], ['check', 'starred', 'Include starred in Primary', 'Changes appear after sync', false]];
  let categoriesOff = {};
  const prefsOf = data => data.gmailPrefs || {};
  const pref = (data, key, fallback) => prefsOf(data)[key] ?? fallback;
  const categoryOn = (data, id) => pref(data, 'category-' + id, (CATEGORIES.find(row => row[1] === id) || [])[4] ?? true);
  function settings(data, ui, lang, emailT) {
    const T = key => P(lang, key), page = ui.gmPref || '';
    const screens = {general: GENERAL, account: ACCOUNT, categories: CATEGORIES};
    const row = (action, id, label, summary = '', extra = '', icon = '') => `<button type="button" class="gmp-row${icon ? ' with-icon' : ''}" data-action="${action}" data-id="${e(id)}">${icon}<span class="gmp-text"><b>${e(label)}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span>${extra}</button>`;
    const check = on => `<i class="gmp-check${on ? ' on' : ''}" role="checkbox" aria-checked="${!!on}"></i>`;
    const value = item => item[1].startsWith('category-') ? categoryOn(data, item[1].slice(9)) : pref(data, item[1], item[4]);
    let body;
    if (!page) body = [['general', 'General settings'], ['account', account], ['about', 'About Gmail']].map(([id, label]) => row(id === 'about' ? 'gmail-unavailable' : 'gmail-pref', id, id === 'account' ? label : T(label))).join('');
    else body = screens[page].map(item => {
      if (item[0] === 'cat') return `<h4 class="gmp-cat">${e(T(item[1]))}</h4>`;
      if (item[0] === 'signature') { const sig = pref(data, 'signature', ''); return row('gmail-signature', 'signature', T('Signature'), sig || T('Not set')); }
      if (item[0] === 'screen') return row('gmail-pref', item[1], T(item[2]));
      if (item[0] === 'unsupported') return row('gmail-unavailable', item[1], T(item[2]));
      if (item[0] === 'list') return row('gmail-pref-list', item[1], T(item[2]), T(item[3][pref(data, item[1], item[4])]));
      const icon = page === 'categories' ? `<i class="gmp-cat-icon gmp-${item[1]}"></i>` : '';
      if (item[0] === 'fixed') return row('gmail-noop', item[1], T(item[2]), T(item[3]), '', icon);
      const on = page === 'categories' && item[1] !== 'starred' ? categoryOn(data, item[1]) : pref(data, item[1], item[4]);
      return row('gmail-pref-toggle', page === 'categories' && item[1] !== 'starred' ? 'category-' + item[1] : item[1], T(item[2]), item[3] ? T(item[3]) : '', check(on), icon);
    }).join('');
    const title = !page ? T('Settings') : page === 'general' ? T('General settings') : page === 'categories' ? T('Inbox categories') : account;
    const list = ui.gmPrefList && [...GENERAL, ...ACCOUNT].find(item => item[0] === 'list' && item[1] === ui.gmPrefList);
    const dialog = list ? `<button type="button" class="gmp-scrim" data-action="gmail-pref-close" aria-label="${e(emailT('Cancel'))}"></button><div class="gmp-dialog" role="dialog"><h3>${e(T(list[2]))}</h3>${list[3].map((label, i) => `<button type="button" class="gmp-choice${pref(data, list[1], list[4]) === i ? ' on' : ''}" data-action="gmail-pref-pick" data-id="${list[1]}:${i}" role="radio" aria-checked="${pref(data, list[1], list[4]) === i}"><span>${e(T(label))}</span><i></i></button>`).join('')}<div class="gmp-buttons"><button type="button" data-action="gmail-pref-close">${e(emailT('Cancel'))}</button></div></div>`
      : ui.gmSignature !== undefined ? `<button type="button" class="gmp-scrim" data-action="gmail-pref-close" aria-label="${e(emailT('Cancel'))}"></button><div class="gmp-dialog" role="dialog"><h3>${e(T('Signature dialog'))}</h3><textarea class="gmp-signature" data-gmail-signature data-no-translate rows="3">${e(ui.gmSignature)}</textarea><div class="gmp-buttons"><button type="button" data-action="gmail-pref-close">${e(emailT('Cancel'))}</button><button type="button" data-action="gmail-signature-save">${e(emailT('OK'))}</button></div></div>` : '';
    return `<div class="app-view gmp-app"><header class="gmp-bar"><button type="button" class="gmp-up" data-action="back" aria-label="${e(emailT('Navigate up'))}"><img class="gmp-caret" src="assets/ic_ab_back_holo_light.png" alt=""><img class="gmp-icon" src="assets/gmail.png" alt=""></button><b data-no-translate>${e(title)}</b></header><div class="gmp-scroll">${body}</div>${dialog}</div>`;
  }
  const live = item => !['Trash', 'Spam'].includes(item.folder);
  function list(mail, folder = 'Primary', query = '') {
    const q = query.toLocaleLowerCase();
    const match = item => {
      if (CATEGORY[folder]) return item.folder === 'Inbox' && !categoriesOff[CATEGORY[folder]] && (categoriesOff[item.category] ? 'primary' : item.category || 'primary') === CATEGORY[folder];
      if (folder === 'Priority Inbox') return item.folder === 'Inbox' && item.important;
      if (folder === 'Starred') return item.starred && live(item);
      if (folder === 'Important') return item.important && live(item);
      if (folder === 'All mail') return live(item) && item.folder !== 'Drafts';
      if (folder === 'Chats') return false;
      return item.folder === folder;
    };
    return mail.filter(item => match(item) && (!q || [item.from, item.to, item.subject, item.body].join(' ').toLocaleLowerCase().includes(q))).sort((a, b) => (b.created || 0) - (a.created || 0));
  }
  const unread = (mail, folder) => list(mail, folder).filter(item => !item.read).length;
  const icons = {
    social: '<svg viewBox="0 0 24 24"><circle cx="8.5" cy="9" r="3" fill="#4a86e8"/><circle cx="16" cy="9.5" r="2.5" fill="#4a86e8"/><path d="M2.5 18c0-3 2.7-5 6-5s6 2 6 5zM14 18c0-1.6-.5-2.9-1.4-3.9 3.4-.9 7.4.6 7.4 3.9z" fill="#4a86e8"/></svg>',
    promotions: '<svg viewBox="0 0 24 24"><path d="M3 3h8.5L21 12.5 12.5 21 3 11.5zm4 2.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" fill="#16a765" fill-rule="evenodd"/><path d="m8 13 3 3 5-5" fill="none" stroke="#fff" stroke-width="1.8"/></svg>',
    inbox: '<svg viewBox="0 0 24 24"><path d="M3 4h18v16H3zm2 2v7h4l1 2h4l1-2h4V6z" fill="currentColor" fill-rule="evenodd"/></svg>'
  };
  // The top of Primary: the categories teaser (welcome text until a conversation has been opened) and the photo tip.
  function top(mail, folder, lang, data) {
    if (folder !== 'Primary') return '';
    const T = key => tr(lang, key);
    const row = name => {
      const items = list(mail, name), n = items.filter(item => !item.read).length;
      if (!items.length || categoriesOff[CATEGORY[name]]) return '';
      const senders = [...new Set(items.map(item => item.from))].slice(0, 3).join(', ');
      return `<button class="gm-category" data-action="email-folder" data-id="${name}"><span class="gm-cat-icon">${icons[CATEGORY[name]]}</span><span class="gm-cat-copy"><b>${e(T(name))}</b><small>${e(senders)}</small></span>${n ? `<em class="gm-${CATEGORY[name]}">${e(T('%d New').replace('%d', n))}</em>` : ''}</button>`;
    };
    const welcome = !data.gmailWelcomeSeen;
    return `${welcome ? `<div class="gm-welcome"><h3>${e(T('Welcome to your new Inbox'))}</h3><p>${e(T('Mail categories group messages of the same type for reading all at once.'))}</p><button data-action="gmail-unavailable">${e(T('Learn more'))}</button></div>` : ''}<div class="gm-categories">${row('Social')}${row('Promotions')}</div>${welcome ? `<div class="gm-welcome gm-change"><p>${e(T('You can enable and disable categories in settings.'))}</p><button data-action="gmail-categories">${e(T('Change categories'))}</button></div>` : ''}`;
  }
  function marker(item) {
    if (!item.personal || item.folder === 'Sent' || item.folder === 'Drafts') return '';
    const file = `ic_email_caret_${item.personal === 'only' ? 'double' : 'single'}${item.important ? '_important_unread' : ''}`;
    return `<img class="gm-caret" src="assets/kem-${file}.png" alt="">`;
  }
  function drawer(mail, ui, lang, emailT) {
    const T = key => S[key] ? tr(lang, key) : emailT(key), folder = ui.emailFolder || 'Primary';
    const total = unread(mail, 'Primary');
    const row = name => {
      const n = ['Drafts', 'Outbox'].includes(name) ? list(mail, name).length : name === 'Spam' || name === 'Trash' || name === 'All mail' || name === 'Starred' ? list(mail, name).length : unread(mail, name);
      const badge = n && (name === 'Social' || name === 'Promotions') ? `<em class="gm-badge gm-${CATEGORY[name]}">${n}</em>` : n ? `<em>${n}</em>` : '';
      const icon = name === 'Primary' ? icons.inbox : CATEGORY[name] && name !== 'Primary' ? icons[CATEGORY[name]] : '';
      return `<button class="kem-folder gm-folder${name === folder ? ' on' : ''}${icon ? ' with-icon' : ''}" data-action="email-folder" data-id="${name}">${icon ? `<i class="gm-folder-icon">${icon}</i>` : ''}<span>${e(T(name))}</span>${badge}</button>`;
    };
    return `<div class="kem-drawer-scrim" data-action="close-overlay"></div><nav class="kem-drawer gm-drawer" aria-label="Gmail"><button class="kem-account" data-action="close-overlay"><img src="assets/kem-ic_radiobutton_selected.png" alt=""><span>${e(account)}</span>${total ? `<em>${total}</em>` : ''}</button><h4>${e(T('INBOX'))}</h4>${INBOX.filter(name => !categoriesOff[CATEGORY[name]]).map(row).join('')}<h4>${e(T('ALL LABELS'))}</h4>${LABELS.map(row).join('')}</nav>`;
  }
  // Options for KKEmail.render / overlay.
  function options(data, ui, lang, emailT) {
    const mail = data.gmailbox;
    categoriesOff = {social: !categoryOn(data, 'social'), promotions: !categoryOn(data, 'promotions')};
    const name = folder => S[folder] ? tr(lang, folder) : emailT(folder);
    return {
      icon: 'gmail.png', account, archive: true, teaserDismissed: !!data.gmailTeaserDismissed,
      list, folderName: name,
      subtitle: folder => { const n = unread(mail, folder); return n && folder !== 'Sent' && folder !== 'Drafts' ? tr(lang, '%d unread').replace('%d', n) : account; },
      top: folder => top(mail, folder, lang, data),
      marker,
      chip: item => item.folder === 'Inbox' ? `<span class="gm-chip">${e(emailT('Inbox'))}</span>` : '',
      drawer: () => drawer(mail, ui, lang, emailT)
    };
  }
  window.GmailApp = {account, FOLDERS, S, tr, restore, list, unread, options, settings};
})();
