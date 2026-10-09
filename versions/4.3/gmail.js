/* Gmail 4.5.1 on the Nexus 4 (Gmail2.apk of the JWR66Y image). Gmail is built on the same UnifiedEmail code as
   the AOSP Email (kk-email.js renders the screens); this file adds what Gmail2 has on top, from its layouts and code:
   - the sectioned inbox teaser at the top of Primary (section_teaser_view.xml, folder_teaser_item.xml,
     SectionedInboxTeaserView): while onboarding the welcome box, every enabled section and the change-categories box;
     afterwards only the sections with unseen mail. Each section row has its ic_menu_inbox_*_holo_light icon tinted
     (SRC_IN) in the section colour on #eeeeee, the name, the unseen senders and the "%d New" count on that colour;
   - the drawer (FolderListFragment, account_item.xml, folder_list_header.xml, folder_item.xml, FolderItemView): the
     account with the radio button, the "Inbox" and "All labels" headings, the section icons (holo_dark when
     activated), unseen counts on the section colour for inbox sections, unread counts elsewhere (the total for
     Drafts and Outbox), the activated row in mail_app_blue (#33b5e5);
   - the action bar subtitle "%d unread" (actionbar_unread_messages, a plain string in 4.5.1), the personal level markers
     (Gmail2's ic_email_caret_*: » only to me, › to me and others, yellow if important),
     Archive in the conversation and selection bars, and the "Inbox" label chip under the subject in the system label
     colours (LabelColorUtils DEFAULT_COLORS #dddddd / #777777).
   Section colours come from the server, not from the APK: Social and Promotions as the Nexus 5 screenshots of
   Gmail 4.7 show them, the other sections LabelColorUtils' default label colour.
   The mailbox is a separate offline Gmail account; nothing is sent. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const account = 'jellybean.demo@gmail.com';
  // Gmail2's own words (stock-strings.js, group gmail): [hu, de, fr, es, English when it differs from the key].
  const tr = (lang, key) => { const row = window.StockStrings?.gmail?.[key], i = ['hu', 'de', 'fr', 'es'].indexOf(lang); return row ? (i >= 0 ? row[i] : row[4] || key) : key; };
  // A plurals resource: "<key> one" holds the quantity "one" where the language has it.
  const count = (lang, key, n) => tr(lang, n === 1 && window.StockStrings?.gmail?.[key + ' one'] ? key + ' one' : key).replace(/%(1\$)?d/, n);
  const INBOX = ['Primary', 'Social', 'Promotions', 'Updates', 'Forums', 'Priority Inbox'];
  const LABELS = ['Starred', 'Important', 'Chats', 'Sent', 'Outbox', 'Drafts', 'All mail', 'Spam', 'Trash'];
  const FOLDERS = [...INBOX, ...LABELS];
  const CATEGORY = {Primary: 'primary', Social: 'social', Promotions: 'promotions', Updates: 'updates', Forums: 'forums'};
  const ICON = {primary: 'main', social: 'social', promotions: 'promotions', updates: 'notifications', forums: 'forums'};
  const COLOR = {social: '#4880d7', promotions: '#13a864'};
  const colorOf = id => COLOR[id] || '#dddddd';
  // A 2013 inbox: personal mail in Primary, Google+ in Social, Google Play offers in Promotions.
  const SAMPLES = [
    ['Google Nexus', 'nexus-noreply@google.com', 'Welcome to your Nexus 4 with Android 4.3, Jelly Bean', 'Discover what your new smartphone has to offer. Now that you own the Nexus 4, discover how you can tailor it to fit — and enhance — your life.', 'primary', true, 'only', 0],
    ['Alex Morgan', 'alex@example.com', 'Hike on Saturday?', 'Are you up for the ridge trail this weekend? I can pick you up at 8. Bring the new phone, the camera is supposed to be good.', 'primary', true, 'only', 1],
    ['Google Calendar', 'calendar-notification@google.com', 'Reminder: Coffee with Alex @ 11am', 'Coffee with Alex. When: 11am – 12pm. Calendar: ' + account, 'primary', false, 'only', 2],
    ['Mom', 'mom@example.com', 'Sunday lunch', 'Don’t forget Sunday lunch at ours. Bring dessert if you can — jelly beans are fine!', 'primary', false, 'only', 30],
    ['Taylor Lee', 'taylor@example.com', 'Slides for Monday', 'Here are the slides from the meetup. Let me know what you think.', 'primary', false, 'list', 50],
    ['Google+', 'noreply-plus@google.com', 'Sam Rivera added you on Google+', 'Follow and share with Sam Rivera. Add Sam to your circles.', 'social', false, 'only', 3],
    ['Google+', 'noreply-plus@google.com', 'Taylor Lee shared a photo with you', 'Taylor Lee shared an album: Meetup 2013. View photos on Google+.', 'social', false, 'only', 26],
    ['Google Play', 'googleplay-noreply@google.com', 'New on Google Play: sweet deals for Jelly Bean', 'Apps, games, movies and books picked for your new Nexus 4 — this week only.', 'promotions', false, 'list', 6]
  ];
  function restore(saved, now = Date.now()) {
    if (Array.isArray(saved)) return saved.map(item => ({...item, id: String(item.id), body: String(item.body || ''), subject: String(item.subject || ''), to: String(item.to || ''), cc: String(item.cc || ''), bcc: String(item.bcc || ''), read: !!item.read, starred: !!item.starred}));
    return SAMPLES.map(([from, address, subject, body, category, important, personal, hoursAgo], i) => ({id: 'gm-' + (i + 1), from, address, to: account, subject, body, folder: 'Inbox', category, important, personal, created: now - hoursAgo * 36e5, read: i >= 3 && category === 'primary', starred: i === 1}));
  }
  /* Settings (audit step 5), Gmail 4.5.1 (Gmail2.apk of JWR66Y): preference_headers.xml (General settings, the account, About Gmail),
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
  // Folder.unseenCount: unread mail that came after the section was last opened (data.gmailSeen); the app opens on Primary.
  let seen = {};
  const unseenItems = (mail, folder) => folder === 'Primary' || !CATEGORY[folder] ? [] : list(mail, folder).filter(item => !item.read && (item.created || 0) > (seen[folder] || 0));
  const SECTIONS = ['Social', 'Promotions', 'Updates', 'Forums'];
  // The top of Primary: SectionedInboxTeaserView (welcome and change-categories boxes until a conversation has been opened).
  function top(mail, folder, lang, data) {
    if (folder !== 'Primary') return '';
    const T = key => tr(lang, key), onboarding = !data.gmailWelcomeSeen;
    const row = name => {
      const id = CATEGORY[name], items = unseenItems(mail, name);
      if (categoriesOff[id] || (!onboarding && !items.length)) return '';
      const senders = [...new Set(items.map(item => item.from))].join(', ');
      return `<button type="button" class="gm-section" data-action="email-folder" data-id="${name}" style="--gm-color:${colorOf(id)}"><span class="gm-section-icon"><i style="--gm-icon:url('assets/gm-ic_menu_inbox_${ICON[id]}_holo_light.png')"></i></span><span class="gm-section-copy"><b>${e(T(name))}</b><small>${e(senders)}</small></span><em>${e(count(lang, '%d New', items.length))}</em></button>`;
    };
    const rows = SECTIONS.map(row).join('');
    if (!onboarding && !rows) return '';
    return `<div class="gm-teaser">${onboarding ? `<button type="button" class="gm-welcome" data-action="gmail-unavailable"><b>${e(T('Welcome to your new Inbox'))}</b><span>${e(T('Welcome text'))}</span><span class="gm-link">${e(T('Learn more'))}</span></button>` : ''}<div class="gm-sections">${rows}</div>${onboarding ? `<button type="button" class="gm-welcome gm-change" data-action="gmail-categories"><span>${e(T('Categories text'))}</span><span class="gm-link">${e(T('Change categories'))}</span></button>` : ''}</div>`;
  }
  function marker(item) {
    if (!item.personal || item.folder === 'Sent' || item.folder === 'Drafts') return '';
    const file = `ic_email_caret_${item.personal === 'only' ? 'double' : 'single'}${item.important ? '_important_unread' : ''}`;
    return `<img class="gm-caret" src="assets/kem-${file}.png" alt="">`;
  }
  function drawer(mail, ui, lang) {
    const T = key => tr(lang, key), folder = ui.emailFolder || 'Primary', total = unread(mail, 'Primary');
    const row = name => {
      const id = CATEGORY[name], on = name === folder, unseen = unseenItems(mail, name).length;
      const n = ['Drafts', 'Outbox'].includes(name) ? list(mail, name).length : unread(mail, name);
      const badge = unseen ? `<em class="gm-unseen" style="background:${colorOf(id)}">${unseen}</em>` : n ? `<em>${n}</em>` : '';
      const icon = id ? `<img class="gm-folder-icon" src="assets/gm-ic_menu_inbox_${ICON[id]}_holo_${on ? 'dark' : 'light'}.png" alt="">` : '';
      return `<button type="button" class="gm-folder${on ? ' on' : ''}${icon ? ' with-icon' : ''}" data-action="email-folder" data-id="${name}">${icon}<span>${e(T(name))}</span>${badge}</button>`;
    };
    return `<div class="kem-drawer-scrim" data-action="close-overlay"></div><nav class="kem-drawer gm-drawer" aria-label="Gmail"><button type="button" class="gm-account" data-action="close-overlay"><img src="assets/kem-ic_radiobutton_selected.png" alt=""><span>${e(account)}</span>${total ? `<em>${total}</em>` : ''}</button><h4>${e(T('Inbox heading'))}</h4>${INBOX.filter(name => !categoriesOff[CATEGORY[name]]).map(row).join('')}<h4>${e(T('All labels'))}</h4>${LABELS.map(row).join('')}</nav>`;
  }
  // Options for KKEmail.render / overlay.
  function options(data, ui, lang, emailT) {
    const mail = data.gmailbox;
    categoriesOff = Object.fromEntries(['social', 'promotions', 'updates', 'forums'].map(id => [id, !categoryOn(data, id)]));
    seen = data.gmailSeen || {};
    return {
      icon: 'gmail.png', account, archive: true, teaserDismissed: !!data.gmailTeaserDismissed,
      list, folderName: folder => tr(lang, folder),
      subtitle: folder => { const n = unread(mail, folder); return n && folder !== 'Sent' && folder !== 'Drafts' ? count(lang, '%d unread', n) : account; },
      top: folder => top(mail, folder, lang, data),
      marker,
      chip: item => item.folder === 'Inbox' ? `<span class="gm-chip">${e(tr(lang, 'Inbox'))}</span>` : '',
      drawer: () => drawer(mail, ui, lang)
    };
  }
  window.GmailApp = {account, FOLDERS, tr, restore, list, unread, options, settings};
})();
