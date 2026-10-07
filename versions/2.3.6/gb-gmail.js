/* Gmail 2.3.5.1 of the Nexus S image (GRK39F), summer 2011, from Gmail.apk's layouts, drawables, styles and code:
   - ConversationListActivity: custom_title.xml (the label with its unread count on the left, the account on the right,
     #f6f6f6 text with a black 1 px shadow on title_bar), CanvasConversationHeaderView rows (60 dip; the check box at
     3 / 8 dip; the subject in 18 sp, bold while unread, followed by the #777777 snippet; below it the personal-level
     caret, the senders in 14 sp, the labels in their colours and the date; the star at the right, 5 dip from the top;
     unread rows white, read rows background_read_conversation #e7e3e7), the footer_organize bar (Archive, Delete,
     Labels) while conversations are checked, and the #A4C639 undo bar.
   - HtmlConversationActivity: res/raw-hdpi/styles.css (a WebView: the bold subject with label chips, message cards on
     message_header.9, the contact picture in contact_offline, the sender in 24 px bold, the action strip with Reply /
     Reply all / Forward, the body) over the bottom bar with Archive, Delete, Newer and Older.
   - ComposeActivity: compose_custom_title.xml (54 dip; "Compose", or the Reply / Reply all / Forward picker, then Send and
     Save draft) over compose_area_layout.xml on #ededed (From, To, Cc / Bcc, Subject, "Compose Mail"), with
     quoted_text.xml (#d5d5d5: "Include text" and "Respond inline").
   - LabelsActivity ("Go to labels"): label_item.xml rows with the unread count.
   - The Menu-key menus: conversation_list_menu, conversation_list_menu_organize_mode, conversation_menu, compose_menu.
   Texts are Gmail.apk's (docs/apk-strings.py); the account and the mail are offline and made up. 1 dp = 0.8625 px. */
(() => {
  'use strict';
  const {e} = GBApps;
  const STRINGS = {
      "Inbox": [
          "Beérkezett üzenetek",
          "Posteingang",
          "Boîte de réception",
          "Recibidos"
      ],
      "Priority Inbox": [
          "Prioritások",
          "Sortierter Eingang",
          "Prioritaire",
          "Prioritarios"
      ],
      "Starred": [
          "Csillaggal megjelölt",
          "Markiert",
          "Messages suivis",
          "Destacados"
      ],
      "Chats": [
          "Csevegések",
          "Chats",
          "Tous les chats",
          "Chats"
      ],
      "Sent": [
          "Elküldve",
          "Gesendet",
          "Messages envoyés",
          "Enviados"
      ],
      "Outbox": [
          "Kimenő levelek",
          "Postausgang",
          "Boîte d'envoi",
          "Bandeja de salida"
      ],
      "Drafts": [
          "Piszkozatok",
          "Entwürfe",
          "Brouillons",
          "Borradores"
      ],
      "All Mail": [
          "Összes levél",
          "Alle Nachrichten",
          "Tous les messages",
          "Todos"
      ],
      "Spam": [
          "Spam",
          "Spam",
          "Spam",
          "Spam"
      ],
      "Trash": [
          "Kuka",
          "Papierkorb",
          "Corbeille",
          "Papelera"
      ],
      "Important": [
          "Fontos",
          "Wichtig",
          "Important",
          "Importante"
      ],
      "Muted": [
          "Lezárva",
          "Unterdrückt",
          "Ignorée",
          "Silenciado"
      ],
      "Refresh": [
          "Frissítés",
          "Aktualisieren",
          "Actualiser",
          "Actualizar"
      ],
      "Compose": [
          "Levélírás",
          "E-Mail schreiben",
          "Nouveau message",
          "Redactar"
      ],
      "Accounts": [
          "Fiókok",
          "Konten",
          "Comptes",
          "Cuentas"
      ],
      "Go to labels": [
          "Ugrás a címkékhez",
          "Zu den Labels",
          "Ouvrir les libellés",
          "Ir a etiquetas"
      ],
      "Search": [
          "Keresés",
          "Suchen",
          "Rechercher",
          "Buscar"
      ],
      "Go to inbox": [
          "Beérk. lev.",
          "Posteingang",
          "Boîte réception",
          "Ir a Recibidos"
      ],
      "Settings": [
          "Beállítások",
          "Einstellungen",
          "Paramètres",
          "Ajustes"
      ],
      "Help": [
          "Súgó",
          "Hilfe",
          "Aide",
          "Ayuda"
      ],
      "About": [
          "Ismertető",
          "Über",
          "À propos",
          "Acerca de"
      ],
      "Star": [
          "Csillag",
          "Markierung",
          "Suivi",
          "Destacar"
      ],
      "Read/unread": [
          "Olvasott/olvasatlan",
          "Gelesen/ungelesen",
          "Lu/non lu",
          "Leídas / No leídas"
      ],
      "Mark important": [
          "Megjelölés fontosként",
          "Als wichtig markieren",
          "Marquer comme important",
          "Marcar como importante"
      ],
      "Not important": [
          "Nem fontos",
          "Unwichtig",
          "Non important",
          "Marcar como no importante"
      ],
      "Report spam": [
          "Ez spam",
          "Spam melden",
          "Signaler comme spam",
          "Marcar como spam"
      ],
      "Mute": [
          "Lezárás",
          "Ignorieren",
          "Ignorer",
          "Silenciar"
      ],
      "Deselect all": [
          "Az összes kijelölés törlése",
          "Auswahl aufheben",
          "Tout désélectionner",
          "Desmarcar todas"
      ],
      "Not spam": [
          "Nem spam",
          "Kein Spam",
          "Non-spam",
          "No es spam"
      ],
      "Archive": [
          "Archiválás",
          "Archiv.",
          "Archiver",
          "Archivar"
      ],
      "Delete": [
          "Törlés",
          "Löschen",
          "Suppr.",
          "Suprimir"
      ],
      "Labels": [
          "Címkék",
          "Labels",
          "Libellés",
          "Etiquetas"
      ],
      "Change labels": [
          "Címkék módosítása",
          "Labels ändern",
          "Changer de libellés",
          "Cambiar etiquetas"
      ],
      "Mark unread": [
          "Megjelölés olvasatlanként",
          "Als ungelesen markieren",
          "Marquer comme non lu",
          "Marcar como no leído"
      ],
      "Add star": [
          "Csillagozás",
          "Markieren",
          "Activer le suivi",
          "Añadir estrella"
      ],
      "Remove star": [
          "Csillag eltávolítása",
          "Markierung entfernen",
          "Désactiver le suivi",
          "Quitar estrella"
      ],
      "Select text": [
          "Szöveg kijelölése",
          "Text auswählen",
          "Sélectionner le texte",
          "Seleccionar texto"
      ],
      "Newer": [
          "Újabb",
          "Neuere",
          "Suiv.",
          "Más reciente"
      ],
      "Older": [
          "Régebbiek",
          "Ältere",
          "Préc.",
          "Anterior"
      ],
      "Undo": [
          "Visszavonás",
          "Rückgängig",
          "Annuler",
          "Deshacer"
      ],
      "No conversations.": [
          "Nincsenek beszélgetések.",
          "Keine Konversationen",
          "Aucune conversation.",
          "No hay conversaciones."
      ],
      "Reply": [
          "Válasz",
          "Antworten",
          "Répondre",
          "Responder"
      ],
      "Reply all": [
          "Mindenkinek",
          "Allen antw.",
          "Rép. à tous",
          "Responder a todos"
      ],
      "Forward": [
          "Továbbítás",
          "Weiterleiten",
          "Transférer",
          "Reenviar"
      ],
      "Send": [
          "Küldés",
          "Senden",
          "Envoyer",
          "Enviar"
      ],
      "Save draft": [
          "Piszkozat mentése",
          "Speichern",
          "Enr. brouillon",
          "Guardar borrador"
      ],
      "Discard": [
          "Elvetés",
          "Verwerfen",
          "Supprimer",
          "Descartar"
      ],
      "Add Cc/Bcc": [
          "Másolatot kap és Titkos másolat mezők hozzáadása",
          "\"Cc\"/\"Bcc\" hinzufügen",
          "Ajouter Cc/Cci",
          "Añadir Cc/CCO"
      ],
      "Remove Cc/Bcc": [
          "Másolatot kap és Titkos másolat mezők eltávolítása",
          "\"Cc\"/\"Bcc\" entfernen",
          "Supprimer Cc/Cci",
          "Eliminar Cc/CCO"
      ],
      "Attach": [
          "Csatolás",
          "Anhang",
          "Pièce jointe",
          "Adjuntar"
      ],
      "To": [
          "Címzett",
          "An",
          "À",
          "Para"
      ],
      "Cc": [
          "Másolatot kap",
          "Cc",
          "Cc",
          "Cc"
      ],
      "Bcc": [
          "Titkos másolat",
          "Bcc",
          "Cci",
          "CCO"
      ],
      "Subject": [
          "Tárgy",
          "Betreff",
          "Objet",
          "Asunto"
      ],
      "Compose Mail": [
          "Levélírás",
          "E-Mail schreiben",
          "Nouveau message",
          "Redactar"
      ],
      "From": [
          "Feladó",
          "Von",
          "De",
          "De"
      ],
      "Include text": [
          "Szöveggel együtt",
          "Text einfügen",
          "Inclure le texte",
          "Incluir texto"
      ],
      "Respond inline": [
          "Válasz belülről",
          "Inline antworten",
          "Répondre dans l'e-mail",
          "Responder entre líneas"
      ],
      "Message saved as draft.": [
          "Az üzenet mentve piszkozatként.",
          "Nachricht als Entwurf gespeichert",
          "Message enregistré comme brouillon.",
          "Mensaje guardado como borrador"
      ],
      "Message discarded.": [
          "Üzenet elvetve.",
          "Nachricht gelöscht",
          "Message supprimé.",
          "Mensaje descartado"
      ],
      "Sending message…": [
          "Üzenet küldése…",
          "Nachricht wird gesendet…",
          "Envoi du message…",
          "Enviando mensaje…"
      ],
      "Please add at least one recipient.": [
          "Kérjük, vegyen fel legalább egy címzettet.",
          "Fügen Sie mindestens einen Empfänger hinzu.",
          "Vous devez indiquer au moins un destinataire.",
          "Añade al menos un destinatario."
      ],
      "Your message has not been sent.\nDiscard your message?": [
          "A levele nem lett elküldve.\nElveti a levelet?",
          "Ihre Nachricht wurde nicht gesendet.\n Nachricht verwerfen?",
          "Votre message n'a pas été envoyé.\nSupprimer le message ?",
          "El mensaje no se ha enviado.\n¿Deseas descartarlo?"
      ],
      "The address %s is invalid.": [
          "A(z) %s cím érvénytelen.",
          "Die Adresse %s ist ungültig",
          "L'adresse \"%s\" est incorrecte.",
          "La dirección %s no es válida."
      ],
      "Me": [
          "én",
          "Ich",
          "Moi",
          "Yo"
      ],
      "To:": [
          "Címzett:",
          "An:",
          "À :",
          "Para:"
      ],
      "Cc:": [
          "Másolat:",
          "Cc:",
          "Cc :",
          "Cc:"
      ],
      "Show details": [
          "Részletek megjelenítése",
          "Details anzeigen",
          "Afficher les détails",
          "Mostrar detalles"
      ],
      "Hide details": [
          "Részletek elrejtése",
          "Details ausblenden",
          "Masquer les détails",
          "Ocultar detalles"
      ],
      "Re:": [
          "Re:",
          "Re:",
          "Re:",
          "Re:"
      ],
      "Fwd:": [
          "Fwd:",
          "Fwd:",
          "Fwd:",
          "Fwd:"
      ],
      "On %s, %s wrote:": [
          "%s, %s ezt írta:",
          "Am %s schrieb %s:",
          "Le %s, %s a écrit :",
          "El %s, %s escribió:"
      ],
      "No labels have been set for this account.": [
          "Nincs beállítva címke ehhez a fiókhoz.",
          "Für dieses Konto wurden noch keine Labels festgelegt.",
          "Aucun libellé n'a été défini pour ce compte.",
          "No se ha establecido ninguna etiqueta para esta cuenta."
      ],
      "Version %s": [
          "Verzió: %s",
          "Version %s",
          "Version %s",
          "Versión %s"
      ],
      "©%d Google Inc.": [
          "©%d Google Inc.",
          "© %d Google Inc.",
          "©%d Google Inc.",
          "©%d Google Inc."
      ],
      "Archiving %1$d conversation.": [
          "%1$d beszélgetés archiválása.",
          "%1$d Konversation werden archiviert.",
          "Archivage de %1$d conversation.",
          "Archivando %1$d conversación"
      ],
      "Archiving %1$d conversations.": [
          "%1$d beszélgetés archiválása.",
          "%1$d Konversationen werden archiviert.",
          "Archivage de %1$d conversations.",
          "Archivando %1$d conversaciones"
      ],
      "Deleting %1$d conversation.": [
          " %1$d beszélgetés törlése.",
          "%1$d Konversation wird gelöscht.",
          "Suppression de %1$d conversation.",
          "Eliminando %1$d conversación"
      ],
      "Deleting %1$d conversations.": [
          "%1$d beszélgetés törlése.",
          "%1$d Konversationen werden gelöscht.",
          "Suppression de %1$d conversations.",
          "Eliminando %1$d conversaciones"
      ],
      "Muting %1$d conversation.": [
          "%1$d beszélgetés lezárása.",
          "%1$d Konversation wird stummgeschaltet.",
          "Suspension de %1$d conversation",
          "Silenciando %1$d conversación..."
      ],
      "Muting %1$d conversations.": [
          "%1$d beszélgetés lezárása.",
          "%1$d Konversationen werden stummgeschaltet.",
          "Suspension de %1$d conversations",
          "Silenciando %1$d conversaciones..."
      ],
      "Reporting %1$d conversation as spam.": [
          "%1$d beszélgetés bejelentése spamként.",
          "%1$d Konversation wird als Spam gemeldet.",
          "Signalement de %1$d conversation comme spam",
          "Enviando notificación de spam de %1$d conversación..."
      ],
      "Reporting %1$d conversations as spam.": [
          "%1$d beszélgetés bejelentése spamként.",
          "%1$d Konversationen werden als Spam gemeldet.",
          "Signalement de %1$d conversations comme spam",
          "Enviando notificación de spam de %1$d conversaciones..."
      ]
  };
  const T = GBApps.texts(STRINGS);
  const ACCOUNT = 'gingerbread.demo@gmail.com', VERSION = '2.3.5.1';
  const SYSTEM = ['Priority Inbox', 'Inbox', 'Starred', 'Chats', 'Sent', 'Outbox', 'Drafts', 'All Mail', 'Spam', 'Trash'];
  // The account's own labels in Gmail's label palette (text colour, background).
  const USER_LABELS = {Friends: ['#206cff', '#e0ecff'], Travel: ['#64992c', '#f9ffef'], Work: ['#b36d00', '#fadcb3']};
  const ASSET = name => `assets/gm-${name}.png`;
  const H = 36e5, D = 864e5;
  // A summer 2011 mailbox: [subject, labels, important, starred, read, messages [from, address, body, hours ago]].
  const SAMPLES = [
    ['Welcome to your Nexus S', ['Inbox'], true, false, false, [['Google Nexus', 'nexus-noreply@google.com', 'Your Nexus S runs Android 2.3, Gingerbread. Tap your phone to NFC tags, make free Internet calls, and find thousands of apps on Android Market.', 1]]],
    ['Hike on Saturday?', ['Inbox', 'Friends'], true, true, false, [['Alex Morgan', 'alex@example.com', 'Are you up for the ridge trail this weekend? I can pick you up at 8.', 20], ['me', ACCOUNT, 'Sounds great! I will bring sandwiches.', 18], ['Alex Morgan', 'alex@example.com', 'Perfect. Don’t forget your phone, the new maps are great on the trail.', 3]]],
    ['Gmail is different. Here’s what you need to know.', ['Inbox'], false, false, true, [['Gmail Team', 'mail-noreply@google.com', 'Messages are grouped into conversations, labels work like folders that can overlap, and the star marks what matters to you. Priority Inbox puts your important mail first.', 30]]],
    ['Sunday lunch', ['Inbox'], false, false, true, [['Mom', 'mom@example.com', 'Don’t forget Sunday lunch at ours. Bring dessert if you can!', 52]]],
    ['Slides for Monday', ['Inbox', 'Work'], true, false, true, [['Taylor Lee', 'taylor@example.com', 'Here are the slides from the meetup. Let me know what you think before Monday.', 76]]],
    ['Flight itinerary: Budapest', ['Travel'], false, false, true, [['Sam Rivera', 'sam@example.com', 'Here is the itinerary for August. We land at 14:20, the hotel is near the river.', 120]]],
    ['Your Android Market order', ['Inbox'], false, false, true, [['Android Market', 'android-market@google.com', 'Thanks for trying apps from Android Market. Your purchase is ready to install on your Nexus S.', 170]]]
  ];
  function restore(saved, now = Date.now()) {
    if (Array.isArray(saved)) return saved;
    return SAMPLES.map(([subject, labels, important, starred, read, messages], i) => ({id: 'gm-' + (i + 1), subject, labels, important, starred, read,
      messages: messages.map(([from, address, body, hours], j) => ({id: `gm-${i + 1}-${j}`, from, address, to: address === ACCOUNT ? messages[0][1] : ACCOUNT, body, created: now - hours * H}))}));
  }
  const has = (c, label) => c.labels.includes(label);
  const live = c => !has(c, 'Trash') && !has(c, 'Spam');
  function inLabel(c, label) {
    if (label === 'Priority Inbox') return has(c, 'Inbox') && c.important;
    if (label === 'Starred') return c.starred && live(c);
    if (label === 'Important') return c.important && live(c);
    if (label === 'All Mail') return live(c) && !(c.messages.length === 1 && c.draft);
    return has(c, label);
  }
  const last = c => c.messages[c.messages.length - 1];
  const sorted = list => [...list].sort((a, b) => last(b).created - last(a).created);
  function list(mail, label, query) {
    const q = String(query || '').toLocaleLowerCase();
    return sorted(mail.filter(c => q ? live(c) && [c.subject, ...c.messages.flatMap(m => [m.from, m.body])].join(' ').toLocaleLowerCase().includes(q) : inLabel(c, label)));
  }
  const unread = (mail, label) => list(mail, label).filter(c => !c.read).length;
  const labelName = (lang, label) => USER_LABELS[label] ? label : T(lang, label);
  // The list's date: the time for today's mail, the month and day this year, otherwise the numeric date.
  function when(created, ctx) {
    const d = new Date(created), now = ctx.now;
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString(ctx.locale, {hour: 'numeric', minute: '2-digit', hour12: !ctx.hour24});
    if (d.getFullYear() === now.getFullYear()) return d.toLocaleDateString(ctx.locale, {month: 'short', day: 'numeric'});
    return d.toLocaleDateString(ctx.locale, {year: '2-digit', month: 'numeric', day: 'numeric'});
  }
  // Senders: the distinct names (unread senders bold), "me" for the account, and the message count.
  function senders(c, lang) {
    const names = [];
    for (const m of c.messages) {
      const name = m.address === ACCOUNT ? T(lang, 'Me').toLocaleLowerCase() : c.messages.length > 1 ? m.from.split(' ')[0] : m.from;
      const found = names.find(n => n.name === name);
      if (found) found.unread ||= !c.read && m.address !== ACCOUNT; else names.push({name, unread: !c.read && m.address !== ACCOUNT});
    }
    return names.map(n => n.unread ? `<b>${e(n.name)}</b>` : e(n.name)).join(', ') + (c.messages.length > 1 ? ` (${c.messages.length})` : '') + (c.draft ? ` <i class="gmd">${e(T(lang, 'Drafts'))}</i>` : '');
  }
  const chip = (label, lang) => { const [fg, bg] = USER_LABELS[label] || ['#888888', '#eeeeee']; return `<i class="gm-chip" style="color:${fg};background:${bg};border-color:${fg}">${e(labelName(lang, label))}</i>`; };
  const userLabels = c => c.labels.filter(l => USER_LABELS[l]);
  // CanvasConversationHeaderView.getPersonalIndicator: the importance caret (double when only to me), read or unread.
  const caret = c => c.important ? `<img class="gm-caret" src="${ASSET(`ic_email_caret_${c.messages.length > 1 ? 'double' : 'single'}_important_${c.read ? 'read' : 'unread'}`)}" alt="">` : '';
  function titleBar(ctx, left, right = ACCOUNT, action = 'gm-labels') {
    return `<div class="gm-title"><button data-action="${action}">${e(left)}</button><button data-action="gm-accounts">${e(right)}</button></div>`;
  }
  function conversationList(ctx) {
    const {data, ui, lang} = ctx, mail = data.gmail23, label = ui.gmLabel || 'Inbox', selected = ui.gmSelected || [];
    const searching = ui.gmQuery !== undefined;
    const items = list(mail, label, searching ? ui.gmQuery : '');
    const n = unread(mail, label);
    const rows = items.map(c => {
      const m = last(c), labels = label === 'Inbox' || USER_LABELS[label] ? userLabels(c).filter(l => l !== label) : userLabels(c);
      return `<div class="gm-row${c.read ? ' read' : ''}${selected.includes(c.id) ? ' checked' : ''}"><button class="gm-check" data-action="gm-select" data-id="${e(c.id)}" role="checkbox" aria-checked="${selected.includes(c.id)}" aria-label="${e(c.subject)}"></button><button class="gm-open" data-action="gm-open" data-id="${e(c.id)}"><span class="gm-line1"><span class="gm-subject">${e(c.subject)}</span><span class="gm-snippet"> ${e(m.body)}</span></span><span class="gm-line2">${caret(c)}<span class="gm-senders">${senders(c, lang)}</span>${labels.map(l => chip(l, lang)).join('')}<span class="gm-date">${e(when(m.created, ctx))}</span></span></button><button class="gm-star${c.starred ? ' on' : ''}" data-action="gm-star" data-id="${e(c.id)}" role="checkbox" aria-checked="${!!c.starred}" aria-label="${e(T(lang, c.starred ? 'Remove star' : 'Add star'))}"></button></div>`;
    }).join('');
    const empty = `<p class="gm-empty">${e(T(lang, 'No conversations.'))}</p>`;
    const search = searching ? `<form class="gm-search" data-form="gm-search"><input name="query" value="${e(ui.gmQuery)}" placeholder="${e(T(lang, 'Search'))}" aria-label="${e(T(lang, 'Search'))}" autocomplete="off"></form>` : '';
    const undo = ui.gmUndo ? `<div class="gm-undo"><span>${e(ui.gmUndo.text)}</span><button data-action="gm-undo">${e(T(lang, 'Undo'))}</button></div>` : '';
    const organize = selected.length ? `<div class="gm-bottombar">${['Archive', 'Delete', 'Labels'].map(a => `<button data-action="gm-${a.toLowerCase()}">${e(T(lang, a))}</button>`).join('')}</div>` : '';
    const title = searching ? T(lang, 'Search') : `${labelName(lang, label)}${n ? ` (${n})` : ''}`;
    return `<div class="app-view gm gm-list" data-no-translate>${titleBar(ctx, title)}${search}<div class="gm-scroll email-scroll">${undo}${rows || empty}</div>${organize}</div>`;
  }
  // HtmlConversationActivity: the WebView's conversation header and message cards (styles.css at 0.575 css px a device px).
  function conversation(ctx) {
    const {data, ui, lang, locale} = ctx, c = data.gmail23.find(x => x.id === ui.gmId);
    if (!c) return conversationList(ctx);
    const expanded = ui.gmExpanded || {};
    const cards = c.messages.map((m, i) => {
      const open = expanded[m.id] ?? (i === c.messages.length - 1);
      const mine = m.address === ACCOUNT, name = mine ? T(lang, 'Me').toLocaleLowerCase() : m.from, d = new Date(m.created);
      const date = d.toLocaleDateString(locale, {month: 'short', day: 'numeric'}), time = d.toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit', hour12: !ctx.hour24});
      const strip = ui.gmStrip === m.id;
      const actions = open ? `<div class="gm-strip${strip ? ' wide' : ''}">${strip ? [['reply', 'Reply'], ['reply_all', 'Reply all'], ['forward', 'Forward']].map(([icon, label]) => `<button class="gm-act" data-action="gm-${icon.replace('_', '-')}" data-id="${e(m.id)}"><img src="${ASSET(icon)}" alt=""><span>${e(T(lang, label))}</span></button>`).join('') : `<button class="gm-act" data-action="gm-reply-all" data-id="${e(m.id)}" aria-label="${e(T(lang, 'Reply all'))}"><img src="${ASSET('reply_all')}" alt=""></button>`}<button class="gm-more" data-action="gm-strip" data-id="${e(m.id)}" aria-label="${e(T(lang, 'Forward'))}"><img src="${ASSET(strip ? 'arrow_more_right' : 'arrow_more_left')}" alt=""></button></div>` : '';
      const details = ui.gmDetails === m.id;
      return `<div class="gm-msg${open ? ' open' : ''}"><div class="gm-head"><div class="gm-top"><button class="gm-toggle" data-action="gm-expand" data-id="${e(m.id)}" aria-expanded="${open}" aria-label="${e(name)}"></button><span class="gm-contact"><img src="${ASSET('ic_contact_picture')}" alt=""></span>${actions}${open ? '' : `<span class="gm-when"><b>${e(date)}</b><small>${e(time)}</small></span>`}<span class="gm-icons"><i class="gm-presence"></i></span><b class="gm-sender">${e(name)}</b><span class="gm-email">${e(mine ? ACCOUNT : m.address)}</span><i class="gm-sep"></i>${open ? '' : `<span class="gm-msnippet">${e(m.body)}</span>`}</div>${open ? `<div class="gm-bottom"><span class="gm-when"><b>${e(date)}</b><small>${e(time)}</small></span><button class="gm-details" data-action="gm-details" data-id="${e(m.id)}">${e(T(lang, details ? 'Hide details' : 'Show details'))}</button>${details ? `<table class="gm-recipients"><tr><td>${e(T(lang, 'To:'))}</td><td>${e(m.to === ACCOUNT ? T(lang, 'Me').toLocaleLowerCase() : m.to)}</td></tr>${m.cc ? `<tr><td>${e(T(lang, 'Cc:'))}</td><td>${e(m.cc)}</td></tr>` : ''}</table>` : ''}<i class="gm-sep"></i></div>` : ''}</div>${open ? `<div class="gm-body">${e(m.body).replace(/\n/g, '<br>')}</div>` : ''}</div>`;
    }).join('');
    const items = list(data.gmail23, ui.gmLabel || 'Inbox', ui.gmQuery), index = items.findIndex(x => x.id === c.id);
    const newer = index > 0 ? items[index - 1] : null, older = index >= 0 && index < items.length - 1 ? items[index + 1] : null;
    return `<div class="app-view gm gm-conv" data-no-translate><div class="gm-scroll gm-web"><div class="gm-subjecthead"><button class="gm-bigstar${c.starred ? ' on' : ''}" data-action="gm-star" data-id="${e(c.id)}" role="checkbox" aria-checked="${!!c.starred}" aria-label="${e(T(lang, c.starred ? 'Remove star' : 'Add star'))}"></button><div class="gm-subjecttext">${e(c.subject)}</div><div class="gm-labels">${c.labels.filter(l => !['Sent', 'Drafts', 'Outbox'].includes(l)).map(l => chip(l, lang)).join('')}${c.important ? chip('Important', lang) : ''}</div></div>${cards}</div><div class="gm-bottombar"><button data-action="gm-archive">${e(T(lang, 'Archive'))}</button><button data-action="gm-delete">${e(T(lang, 'Delete'))}</button><button class="gm-arrow left"${newer ? ` data-action="gm-open" data-id="${e(newer.id)}"` : ' disabled'} aria-label="${e(T(lang, 'Newer'))}"></button><button class="gm-arrow right"${older ? ` data-action="gm-open" data-id="${e(older.id)}"` : ' disabled'} aria-label="${e(T(lang, 'Older'))}"></button></div></div>`;
  }
  // image_attachment.xml: the #D5D5D5 row with ic_email_attachment, the 32 dp thumbnail 5 dp in, the black name and
  // size, and the framework's round btn_dialog to remove it.
  function attachmentRow(lang, item) {
    return `<div class="gm-attachment"><img class="gm-att-clip" src="assets/gb-gm-ic_email_attachment.png" alt=""><span class="gm-att-thumb">${window.ICSMedia ? ICSMedia.art(item) : ''}</span><span class="gm-att-copy"><b>${e(item.name || 'IMG.jpg')}</b><b>${e(item.size || '')}</b></span><button type="button" class="gm-att-remove" data-action="gm-remove-attachment" aria-label="${e(T(lang, 'Remove'))}"></button></div>`;
  }
  function attach(ctx, photo) {
    if (!ctx.ui.gmDraft || !photo) return;
    ctx.ui.gmDraft.attachment = {...JSON.parse(JSON.stringify(photo)), size: photo.size || '214KB'};
  }
  function compose(ctx) {
    const {ui, lang} = ctx, d = ui.gmDraft || {};
    const field = (name, hint, extra = '') => `<input class="gm-field" name="${name}" value="${e(d[name] || '')}" placeholder="${e(T(lang, hint))}" aria-label="${e(T(lang, hint))}" autocomplete="off"${extra}>`;
    const head = d.mode ? `<button type="button" class="gm-picker" data-action="gm-mode">${e(T(lang, d.mode === 'reply' ? 'Reply' : d.mode === 'reply-all' ? 'Reply all' : 'Forward'))}</button>` : `<span class="gm-heading">${e(T(lang, 'Compose'))}</span>`;
    const quoted = d.quoted ? `<div class="gm-quoted-bar"><label><input type="checkbox" name="include" ${d.include !== false ? 'checked' : ''} data-action="gm-include"><span>${e(T(lang, 'Include text'))}</span></label><button type="button" data-action="gm-inline">${e(T(lang, 'Respond inline'))}</button></div><div class="gm-quoted${d.include === false ? ' off' : ''}">${e(d.quoted).replace(/\n/g, '<br>')}</div>` : '';
    return `<form class="app-view gm gm-compose" data-form="gm-compose" data-no-translate><div class="gm-ctitle">${head}<i class="gm-vdiv"></i><button type="submit" class="gm-send" aria-label="${e(T(lang, 'Send'))}"></button><i class="gm-vdiv"></i><button type="button" class="gm-save" data-action="gm-save" aria-label="${e(T(lang, 'Save draft'))}"></button></div><div class="gm-scroll gm-carea"><div class="gm-from"><span>${e(T(lang, 'From'))}</span><b>${e(ACCOUNT)}</b></div>${field('to', 'To', ' type="email" multiple')}${ui.gmCc ? field('cc', 'Cc') + field('bcc', 'Bcc') : ''}<i class="gm-hdiv"></i>${field('subject', 'Subject')}${d.attachment ? attachmentRow(lang, d.attachment) : ''}<textarea class="gm-field gm-bodyfield" name="body" placeholder="${e(T(lang, 'Compose Mail'))}" aria-label="${e(T(lang, 'Compose Mail'))}">${e(d.body || '')}</textarea>${quoted}</div></form>`;
  }
  function labels(ctx) {
    const {data, lang} = ctx, mail = data.gmail23;
    const rows = [...SYSTEM, ...Object.keys(USER_LABELS)].map(l => {
      const count = ['Drafts', 'Outbox'].includes(l) ? list(mail, l).length : ['Sent', 'All Mail', 'Spam', 'Trash', 'Chats'].includes(l) ? 0 : unread(mail, l);
      const [fg, bg] = USER_LABELS[l] || ['#ffffff', '#888888'];
      return `<button class="gm-label" data-action="gm-label" data-id="${e(l)}"><span>${e(labelName(lang, l))}</span>${count ? `<b style="background:${USER_LABELS[l] ? fg : bg}">${count}</b>` : ''}</button>`;
    }).join('');
    return `<div class="app-view gm gm-labelsview" data-no-translate><div class="gb-titlebar gm-wtitle">${e(T(lang, 'Labels'))}</div><div class="gm-scroll">${rows}</div></div>`;
  }
  function render(ctx) {
    if (ctx.ui.gmView === 'conversation') return conversation(ctx);
    if (ctx.ui.gmView === 'compose') return compose(ctx);
    if (ctx.ui.gmView === 'labels') return labels(ctx);
    return conversationList(ctx);
  }
  function menu(ctx) {
    const {ui, lang, data} = ctx, t = key => T(lang, key), g = name => `gm-${name}.png`;
    if (ui.gmView === 'compose') return [
      {action: 'gm-send', title: t('Send'), icon: 'ic_menu_send'}, {action: 'gm-save', title: t('Save draft'), icon: 'ic_menu_save'},
      {action: 'gm-cc', title: t(ui.gmCc ? 'Remove Cc/Bcc' : 'Add Cc/Bcc'), icon: g('ic_menu_cc')}, {action: 'gm-attach', title: t('Attach'), icon: g('ic_menu_attachment')},
      {action: 'gm-discard', title: t('Discard'), icon: 'ic_menu_close_clear_cancel'}, {action: 'gm-unsupported', title: t('Help'), icon: 'ic_menu_help'}];
    if (ui.gmView === 'labels') return [{action: 'gm-unsupported', title: t('Settings'), icon: 'ic_menu_preferences'}, {action: 'gm-unsupported', title: t('Help'), icon: 'ic_menu_help'}];
    if (ui.gmView === 'conversation') {
      const c = data.gmail23.find(x => x.id === ui.gmId) || {};
      return [{action: 'gm-labels', title: t('Change labels'), icon: g('ic_menu_navigate')}, {action: 'gm-mark-unread', title: t('Mark unread'), icon: g('ic_menu_gmail_mark_unread')},
        {action: 'gm-important', title: t(c.important ? 'Not important' : 'Mark important'), icon: g(c.important ? 'ic_menu_mark_unimportant' : 'ic_menu_mark_important')},
        {action: 'gm-label', id: 'Inbox', title: t('Go to inbox'), icon: g('ic_menu_inbox')}, {action: 'gm-mute', title: t('Mute'), icon: g('ic_menu_mute')},
        {action: 'gm-star', id: c.id, title: t(c.starred ? 'Remove star' : 'Add star'), icon: g('ic_menu_star')}, {action: 'gm-spam', title: t('Report spam'), icon: g('ic_menu_report_spam')},
        {action: 'gm-unsupported', title: t('Settings'), icon: 'ic_menu_preferences'}, {action: 'gm-unsupported', title: t('Help'), icon: 'ic_menu_help'}, {action: 'gm-unsupported', title: t('Select text')}];
    }
    if ((ui.gmSelected || []).length) return [
      {action: 'gm-star-selected', title: t('Star'), icon: g('ic_menu_star')}, {action: 'gm-read-unread', title: t('Read/unread'), icon: g('ic_menu_gmail_mark_read')},
      {action: 'gm-important', title: t('Mark important'), icon: g('ic_menu_mark_important')}, {action: 'gm-spam', title: t('Report spam'), icon: g('ic_menu_report_spam')},
      {action: 'gm-mute', title: t('Mute'), icon: g('ic_menu_mute')}, {action: 'gm-deselect', title: t('Deselect all'), icon: g('ic_menu_gmail_deselect_mail')},
      {action: 'gm-unsupported', title: t('Help'), icon: 'ic_menu_help'}, {action: 'gm-about', title: t('About'), icon: 'ic_menu_info_details'}];
    return [{action: 'gm-refresh', title: t('Refresh'), icon: g('ic_menu_refresh')}, {action: 'gm-compose', title: t('Compose'), icon: g('ic_menu_compose')},
      {action: 'gm-accounts', title: t('Accounts'), icon: g('ic_mailboxes_accounts')}, {action: 'gm-labels', title: t('Go to labels'), icon: g('ic_menu_navigate')},
      {action: 'gm-search', title: t('Search'), icon: 'ic_menu_search'}, ...((ui.gmLabel || 'Inbox') !== 'Inbox' || ui.gmQuery !== undefined ? [{action: 'gm-label', id: 'Inbox', title: t('Go to inbox'), icon: g('ic_menu_inbox')}] : []),
      {action: 'gm-unsupported', title: t('Settings'), icon: 'ic_menu_preferences'}, {action: 'gm-unsupported', title: t('Help'), icon: 'ic_menu_help'}, {action: 'gm-about', title: t('About')}];
  }
  // The Change labels check list, the account list, the reply-mode picker and the About box (InfoDialog).
  function dialog(kind, ctx) {
    const {ui, lang, data} = ctx, t = key => T(lang, key);
    if (kind === 'labels') return {title: t('Change labels'), items: ['Inbox', ...Object.keys(USER_LABELS)].map(l => ({action: 'gm-toggle-label', id: l, title: labelName(lang, l), checked: (ui.gmLabelDraft || []).includes(l)})), choice: 'multi', buttons: [{action: 'gm-labels-ok', title: ctx.ok}, {action: 'close-overlay', title: ctx.cancel}]};
    if (kind === 'accounts') return {title: t('Accounts'), items: [{action: 'gm-label', id: 'Inbox', title: ACCOUNT, summary: `${labelName(lang, 'Inbox')} (${unread(data.gmail23, 'Inbox')})`}]};
    if (kind === 'mode') return {title: t('Reply'), items: [['reply', 'Reply'], ['reply-all', 'Reply all'], ['forward', 'Forward']].map(([id, label]) => ({action: 'gm-mode-pick', id, title: t(label)}))};
    if (kind === 'about') return {title: 'Gmail', custom: `<div class="gm-about"><img src="${ASSET('logo')}" alt="Gmail"><p>${e(t('Version %s').replace('%s', VERSION))}</p><p>${e(t('©%d Google Inc.').replace('%d', '2011'))}</p></div>`, buttons: [{action: 'close-overlay', title: ctx.ok}]};
    if (kind === 'discard') return {title: t('Discard'), icon: 'ic_dialog_alert', message: t('Your message has not been sent.\nDiscard your message?'), buttons: [{action: 'gm-discard-ok', title: ctx.ok}, {action: 'close-overlay', title: ctx.cancel}]};
    return null;
  }
  const plural = (lang, verb, n) => T(lang, `${verb} %1$d conversation${n === 1 ? '' : 's'}${verb === 'Reporting' ? ' as spam' : ''}.`).replace('%1$d', n);
  function handle(action, id, ctx) {
    const {data, ui, lang} = ctx, mail = data.gmail23;
    const targets = () => ui.gmView === 'conversation' ? [ui.gmId] : ui.gmSelected || [];
    // Archive / Delete / Mute / Report spam: back to the list with the undo bar.
    const bulk = (verb, change) => {
      const ids = targets(); if (!ids.length) return;
      const before = mail.filter(c => ids.includes(c.id)).map(c => [c.id, [...c.labels]]);
      mail.filter(c => ids.includes(c.id)).forEach(change);
      ui.gmUndo = {before, text: plural(lang, verb, ids.length)};
      ui.gmSelected = []; ui.gmView = ''; ui.overlay = ''; ctx.save(); ctx.renderOverlay(); ctx.render();
    };
    switch (action) {
      case 'gm-open': { const c = mail.find(x => x.id === id); if (!c) break; if (c.draft) { openDraft(ctx, c); break; } c.read = true; ui.gmId = id; ui.gmView = 'conversation'; ui.gmExpanded = Object.fromEntries(c.messages.map((m, i) => [m.id, i === c.messages.length - 1])); ui.gmStrip = ''; ui.gmDetails = ''; ui.gmUndo = null; ctx.save(); ctx.render(); break; }
      case 'gm-select': ui.gmSelected = (ui.gmSelected || []).includes(id) ? ui.gmSelected.filter(x => x !== id) : [...(ui.gmSelected || []), id]; ctx.render(); break;
      case 'gm-deselect': ui.gmSelected = []; ui.overlay = ''; ctx.renderOverlay(); ctx.render(); break;
      case 'gm-star': { const c = mail.find(x => x.id === (id || ui.gmId)); if (c) c.starred = !c.starred; ui.overlay = ''; ctx.save(); ctx.renderOverlay(); ctx.render(); break; }
      case 'gm-star-selected': mail.filter(c => (ui.gmSelected || []).includes(c.id)).forEach(c => { c.starred = true; }); ui.overlay = ''; ctx.save(); ctx.renderOverlay(); ctx.render(); break;
      case 'gm-read-unread': { const sel = mail.filter(c => (ui.gmSelected || []).includes(c.id)), read = !sel.every(c => c.read); sel.forEach(c => { c.read = read; }); ui.overlay = ''; ctx.save(); ctx.renderOverlay(); ctx.render(); break; }
      case 'gm-mark-unread': { const c = mail.find(x => x.id === ui.gmId); if (c) c.read = false; ui.gmView = ''; ui.overlay = ''; ctx.save(); ctx.renderOverlay(); ctx.render(); break; }
      case 'gm-important': { const sel = mail.filter(c => targets().includes(c.id)), value = !sel.every(c => c.important); sel.forEach(c => { c.important = value; }); ui.overlay = ''; ctx.save(); ctx.renderOverlay(); ctx.render(); break; }
      case 'gm-archive': bulk('Archiving', c => { c.labels = c.labels.filter(l => l !== 'Inbox'); }); break;
      case 'gm-delete': bulk('Deleting', c => { c.labels = ['Trash']; }); break;
      case 'gm-mute': bulk('Muting', c => { c.labels = [...c.labels.filter(l => l !== 'Inbox'), 'Muted']; }); break;
      case 'gm-spam': bulk('Reporting', c => { c.labels = ['Spam']; }); break;
      case 'gm-undo': for (const [cid, labels] of ui.gmUndo?.before || []) { const c = mail.find(x => x.id === cid); if (c) c.labels = labels; } ui.gmUndo = null; ctx.save(); ctx.render(); break;
      case 'gm-labels': {
        const ids = targets();
        if (ids.length) { ui.gmLabelDraft = [...new Set(mail.filter(c => ids.includes(c.id)).flatMap(c => c.labels).filter(l => l === 'Inbox' || USER_LABELS[l]))]; ctx.dialog('labels'); }
        else { ui.overlay = ''; ctx.renderOverlay(); ui.gmView = 'labels'; ctx.render(); }
        break;
      }
      case 'gm-toggle-label': ui.gmLabelDraft = (ui.gmLabelDraft || []).includes(id) ? ui.gmLabelDraft.filter(l => l !== id) : [...(ui.gmLabelDraft || []), id]; ctx.dialog('labels'); break;
      case 'gm-labels-ok': mail.filter(c => targets().includes(c.id)).forEach(c => { c.labels = [...c.labels.filter(l => l !== 'Inbox' && !USER_LABELS[l]), ...ui.gmLabelDraft]; }); ui.gmSelected = []; ui.overlay = ''; ctx.save(); ctx.renderOverlay(); ctx.render(); break;
      case 'gm-label': ui.gmLabel = id; ui.gmView = ''; ui.gmSelected = []; ui.gmQuery = undefined; ui.gmUndo = null; ui.overlay = ''; ctx.renderOverlay(); ctx.render(); break;
      case 'gm-accounts': ctx.dialog('accounts'); break;
      case 'gm-about': ctx.dialog('about'); break;
      case 'gm-refresh': ui.overlay = ''; ctx.renderOverlay(); ctx.toast(T(lang, 'Refresh') + '…'); break;
      case 'gm-search': ui.overlay = ''; ctx.renderOverlay(); ui.gmQuery = ''; ui.gmView = ''; ctx.render(); ctx.focus('.gm-search input'); break;
      case 'gm-expand': ui.gmExpanded = {...(ui.gmExpanded || {}), [id]: !(ui.gmExpanded || {})[id]}; ctx.render(); break;
      case 'gm-strip': ui.gmStrip = ui.gmStrip === id ? '' : id; ctx.render(); break;
      case 'gm-details': ui.gmDetails = ui.gmDetails === id ? '' : id; ctx.render(); break;
      case 'gm-compose': ui.overlay = ''; ctx.renderOverlay(); startCompose(ctx, null); break;
      case 'gm-reply': case 'gm-reply-all': case 'gm-forward': startCompose(ctx, action.slice(3), id); break;
      case 'gm-mode': keep(ctx); ctx.dialog('mode'); break;
      case 'gm-mode-pick': { const d = ui.gmDraft; if (d) { const source = findMessage(mail, d.source); Object.assign(d, header(ctx, id, source)); } ui.overlay = ''; ctx.renderOverlay(); ctx.render(); break; }
      case 'gm-include': keep(ctx); ui.gmDraft.include = !(ui.gmDraft.include !== false); ctx.render(); break;
      case 'gm-inline': keep(ctx); ui.gmDraft.body = `${ui.gmDraft.body || ''}\n\n${ui.gmDraft.quoted}`.replace(/^\n+/, ''); ui.gmDraft.quoted = ''; ctx.render(); break;
      case 'gm-cc': keep(ctx); ui.gmCc = !ui.gmCc; ui.overlay = ''; ctx.renderOverlay(); ctx.render(); break;
      // Attach: GET_CONTENT for a picture; the Gallery's picker hands it back (attach below).
      case 'gm-attach': keep(ctx); ui.overlay = ''; ctx.renderOverlay(); ctx.pickPicture(); break;
      case 'gm-remove-attachment': keep(ctx); if (ui.gmDraft) delete ui.gmDraft.attachment; ctx.render(); break;
      case 'gm-send': ui.overlay = ''; ctx.renderOverlay(); ctx.submit('.gm-compose'); break;
      case 'gm-save': keep(ctx); saveDraft(ctx); ui.gmView = ui.gmDraft?.source ? 'conversation' : ''; ui.gmDraft = null; ui.overlay = ''; ctx.save(); ctx.renderOverlay(); ctx.render(); ctx.toast(T(lang, 'Message saved as draft.')); break;
      case 'gm-discard': ctx.dialog('discard'); break;
      case 'gm-discard-ok': { const d = ui.gmDraft; if (d?.draftId) { const i = mail.findIndex(c => c.id === d.draftId); if (i >= 0) mail.splice(i, 1); } ui.gmView = d?.source ? 'conversation' : ''; ui.gmDraft = null; ui.overlay = ''; ctx.save(); ctx.renderOverlay(); ctx.render(); ctx.toast(T(lang, 'Message discarded.')); break; }
      case 'gm-unsupported': ui.overlay = ''; ctx.renderOverlay(); ctx.toast('This feature is not part of the simulator.'); break;
      default: return false;
    }
    return true;
  }
  const findMessage = (mail, mid) => { for (const c of mail) { const m = c.messages.find(x => x.id === mid); if (m) return {c, m}; } return null; };
  // The subject prefix, recipients and quoted text of a reply mode (ComposeActivity.initFromRefMessage).
  function header(ctx, mode, source) {
    const {lang, locale} = ctx;
    if (!source) return {mode: ''};
    const {c, m} = source, re = mode === 'forward' ? T(lang, 'Fwd:') : T(lang, 'Re:');
    const subject = c.subject.startsWith(re) ? c.subject : `${re} ${c.subject}`;
    const others = [...new Set(c.messages.map(x => x.address))].filter(a => a !== ACCOUNT && a !== m.address);
    const to = mode === 'forward' ? '' : m.address === ACCOUNT ? m.to : m.address;
    const when = new Date(m.created).toLocaleString(locale, {dateStyle: 'medium', timeStyle: 'short'});
    const quoted = mode === 'forward' ? `---------- Forwarded message ----------\nFrom: ${m.from} <${m.address}>\nDate: ${when}\nSubject: ${c.subject}\n\n${m.body}` : `${T(lang, 'On %s, %s wrote:').replace('%s', when).replace('%s', `${m.from} <${m.address}>`)}\n> ${m.body}`;
    return {mode, to, cc: mode === 'reply-all' ? others.join(', ') : '', subject, quoted, include: true};
  }
  function startCompose(ctx, mode, mid) {
    const {ui, data} = ctx, source = mode ? findMessage(data.gmail23, mid || last(data.gmail23.find(c => c.id === ui.gmId) || {messages: [{}]}).id) : null;
    ui.gmDraft = {source: source?.m.id || '', body: '', ...(source ? header(ctx, mode, source) : {mode: ''})};
    ui.gmCc = !!ui.gmDraft.cc; ui.gmView = 'compose'; ui.overlay = ''; ctx.renderOverlay(); ctx.render(); ctx.focus(mode && mode !== 'forward' ? '.gm-bodyfield' : '.gm-compose [name=to]');
  }
  function openDraft(ctx, c) {
    const m = c.messages[0];
    ctx.ui.gmDraft = {draftId: c.id, source: '', mode: '', to: m.to === ACCOUNT ? '' : m.to, cc: m.cc || '', subject: c.subject, body: m.body};
    ctx.ui.gmCc = !!m.cc; ctx.ui.gmView = 'compose'; ctx.render();
  }
  // Copies the compose fields into the draft before a re-render.
  function keep(ctx) {
    const form = ctx.root?.querySelector('.gm-compose'), d = ctx.ui.gmDraft; if (!form || !d) return;
    for (const key of ['to', 'cc', 'bcc', 'subject', 'body']) { const f = form.querySelector(`[name=${key}]`); if (f) d[key] = f.value; }
  }
  function saveDraft(ctx) {
    const {data, ui} = ctx, d = ui.gmDraft; if (!d) return;
    const message = {id: `${d.draftId || 'gm-d' + Date.now()}-0`, from: 'me', address: ACCOUNT, to: d.to || '', cc: d.cc || '', body: d.body || '', created: Date.now()};
    const existing = data.gmail23.find(c => c.id === d.draftId);
    if (existing) { existing.subject = d.subject || ''; existing.messages = [message]; return; }
    const id = 'gm-d' + Date.now(); d.draftId = id;
    data.gmail23.unshift({id, subject: d.subject || '', labels: ['Drafts'], important: false, starred: false, read: true, draft: true, messages: [{...message, id: id + '-0'}]});
  }
  function submit(form, values, ctx) {
    const {data, ui, lang} = ctx;
    if (form === 'gm-search') { ui.gmQuery = String(values.get('query') || '').trim(); ctx.render(); return true; }
    if (form !== 'gm-compose') return false;
    const d = ui.gmDraft; if (!d) return true;
    for (const key of ['to', 'cc', 'bcc', 'subject', 'body']) if (values.has(key)) d[key] = String(values.get(key)).trim();
    const recipients = [d.to, d.cc, d.bcc].join(',').split(',').map(s => s.trim()).filter(Boolean);
    if (!recipients.length) { ctx.toast(T(lang, 'Please add at least one recipient.')); return true; }
    const bad = recipients.find(a => !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(a));
    if (bad) { ctx.toast(T(lang, 'The address %s is invalid.').replace('%s', bad)); return true; }
    const body = d.quoted && d.include !== false ? `${d.body}\n\n${d.quoted}` : d.body;
    const message = {id: 'gm-m' + Date.now(), from: 'me', address: ACCOUNT, to: d.to, cc: d.cc, body, created: Date.now()};
    if (d.draftId) { const i = data.gmail23.findIndex(c => c.id === d.draftId); if (i >= 0) data.gmail23.splice(i, 1); }
    const source = d.source && d.mode !== 'forward' ? findMessage(data.gmail23, d.source) : null;
    if (source) { source.c.messages.push(message); if (!source.c.labels.includes('Sent')) source.c.labels.push('Sent'); }
    else data.gmail23.unshift({id: 'gm-s' + Date.now(), subject: d.subject, labels: ['Sent'], important: false, starred: false, read: true, messages: [message]});
    ui.gmView = source ? 'conversation' : ''; ui.gmDraft = null; ctx.save(); ctx.render(); ctx.toast(T(lang, 'Sending message…'));
    return true;
  }
  // Back: compose saves its draft, the conversation and the labels return to the list, search closes.
  function back(ctx) {
    const {ui} = ctx;
    if (ui.overlay) return false;
    if (ui.gmView === 'compose') { keep(ctx); const d = ui.gmDraft; if (d && [d.to, d.subject, d.body].some(v => String(v || '').trim())) { saveDraft(ctx); ctx.toast(T(ctx.lang, 'Message saved as draft.')); } ui.gmView = d?.source ? 'conversation' : ''; ui.gmDraft = null; ctx.save(); ctx.render(); return true; }
    if (ui.gmView) { ui.gmView = ''; ctx.render(); return true; }
    if (ui.gmQuery !== undefined) { ui.gmQuery = undefined; ctx.render(); return true; }
    if ((ui.gmSelected || []).length) { ui.gmSelected = []; ctx.render(); return true; }
    if ((ui.gmLabel || 'Inbox') !== 'Inbox') { ui.gmLabel = 'Inbox'; ctx.render(); return true; }
    return false;
  }
  function open(ctx, resume) {
    const {data, ui} = ctx;
    data.gmail23 = restore(data.gmail23);
    if (!resume) { ui.gmView = ''; ui.gmLabel = 'Inbox'; ui.gmSelected = []; ui.gmQuery = undefined; ui.gmUndo = null; }
  }
  GBApps.register('gmail', {render, menu, dialog, handle, submit, back, open, keep});
  window.GBGmail = {ACCOUNT, restore, list, unread, attach};
})();
