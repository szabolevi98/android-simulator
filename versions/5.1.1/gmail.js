/* Gmail 5.0.2 on the Nexus 6 (LMY48Y): a separate offline Gmail account with the inbox categories (Primary, Social,
   Promotions), Gmail's labels and personal-level carets, rendered by the Material UnifiedEmail in lp-email.js. Nothing
   is sent. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const account = 'nexus6.demo@gmail.com';
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
  // A 2015 inbox: personal mail in Primary, Google+ in Social, Google Play offers in Promotions.
  const SAMPLES = [
    ['Google', 'android-noreply@google.com', 'Get started with your Nexus 6', 'Welcome to Android 5.1 Lollipop. Learn how to set up your phone, move your stuff over and get the most out of the new Material design.', 'primary', true, 'only', 0],
    ['Alex Morgan', 'alex@example.com', 'Hike on Saturday?', 'Are you up for the ridge trail this weekend? I can pick you up at 8. Bring the Nexus 6, the camera is supposed to be great.', 'primary', true, 'only', 1],
    ['Google Calendar', 'calendar-notification@google.com', 'Reminder: Coffee with Alex @ 11am', 'Coffee with Alex. When: 11am – 12pm. Calendar: ' + account, 'primary', false, 'only', 2],
    ['Mom', 'mom@example.com', 'Sunday lunch', 'Don’t forget Sunday lunch at ours. Bring dessert if you can — lollipops are fine!', 'primary', false, 'only', 30],
    ['Taylor Lee', 'taylor@example.com', 'Slides for Monday', 'Here are the slides from the meetup. Let me know what you think.', 'primary', false, 'list', 50],
    ['Google+', 'noreply-plus@google.com', 'Sam Rivera added you on Google+', 'Follow and share with Sam Rivera. Add Sam to your circles.', 'social', false, 'only', 3],
    ['Google+', 'noreply-plus@google.com', 'Taylor Lee shared a photo with you', 'Taylor Lee shared an album: Meetup 2015. View photos on Google+.', 'social', false, 'only', 26],
    ['Google Play', 'googleplay-noreply@google.com', 'New on Google Play: apps made for Lollipop', 'Material design apps, games and movies picked for your new Nexus 6 — this week only.', 'promotions', false, 'list', 6]
  ];
  function restore(saved, now = Date.now()) {
    if (Array.isArray(saved)) return saved.map(item => ({...item, id: String(item.id), body: String(item.body || ''), subject: String(item.subject || ''), to: String(item.to || ''), cc: String(item.cc || ''), bcc: String(item.bcc || ''), read: !!item.read, starred: !!item.starred}));
    return SAMPLES.map(([from, address, subject, body, category, important, personal, hoursAgo], i) => ({id: 'gm-' + (i + 1), from, address, to: account, subject, body, folder: 'Inbox', category, important, personal, created: now - hoursAgo * 36e5, read: i >= 3 && category === 'primary', starred: i === 1}));
  }
  const live = item => !['Trash', 'Spam'].includes(item.folder);
  function list(mail, folder = 'Primary', query = '') {
    const q = query.toLocaleLowerCase();
    const match = item => {
      if (CATEGORY[folder]) return item.folder === 'Inbox' && (item.category || 'primary') === CATEGORY[folder];
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
  // The top of Primary in Gmail 5: the Social and Promotions folder teasers (the 40 dp category icon on #EEEEEE,
  // the 16 sp #212121 name, the senders in #757575 and the "%d new" count in the category colour).
  function top(mail, folder, lang) {
    if (folder !== 'Primary') return '';
    const T = key => tr(lang, key);
    const row = name => {
      const items = list(mail, name), n = items.filter(item => !item.read).length;
      if (!items.length) return '';
      const senders = [...new Set(items.map(item => item.from))].slice(0, 3).join(', ');
      return `<button class="gm-category" data-action="email-folder" data-id="${name}"><span class="gm-cat-icon gm-${CATEGORY[name]}" style="-webkit-mask-image:url(assets/gm5-ic_drawer_${CATEGORY[name]}_24dp.png);mask-image:url(assets/gm5-ic_drawer_${CATEGORY[name]}_24dp.png)"></span><span class="gm-cat-copy"><b>${e(T(name))}</b><small>${e(senders)}</small></span>${n ? `<em class="gm-${CATEGORY[name]}">${e(T('%d new').replace('%d', n))}</em>` : ''}</button>`;
    };
    return `<div class="gm-categories">${row('Social')}${row('Promotions')}</div>`;
  }
  function marker(item) {
    if (!item.personal || item.folder === 'Sent' || item.folder === 'Drafts') return '';
    const file = `ic_email_caret_${item.personal === 'only' ? 'double' : 'single'}${item.important ? '_important_unread' : ''}`;
    return `<img class="gm-caret" src="assets/gm5-${file}.png" alt="">`;
  }
  // Options for LPEmail.render / overlay.
  function options(data, ui, lang, emailT) {
    const mail = data.gmailbox;
    const name = folder => S[folder] ? tr(lang, folder) : emailT(folder);
    return {
      app: 'gmail', account, accountName: 'Nexus 6', archive: true,
      folders: [['', ['Primary', 'Social', 'Promotions']], ['All labels', ['Starred', 'Important', 'Sent', 'Outbox', 'Drafts', 'All mail', 'Spam', 'Trash']]],
      list, folderName: name,
      subtitle: folder => { const n = unread(mail, folder); return n && folder !== 'Sent' && folder !== 'Drafts' ? tr(lang, '%d unread').replace('%d', n) : account; },
      top: folder => top(mail, folder, lang),
      marker,
      chip: item => item.folder === 'Inbox' ? `<span class="gm-chip">${e(emailT('Inbox'))}</span>` : ''
    };
  }
  window.GmailApp = {account, FOLDERS, S, tr, restore, list, unread, options};
})();
