/* The last Google apps of the Nexus S image (GRK39F) as working 2011 screens, from their APKs:
   - Car Home 2.2.1.2 (CarHomeGoogle.apk): res/xml/default_carhome.xml (screen 1: Navigate, Phone, Voice Search, Contacts,
     Music, Exit car mode; screen 2: Maps, Places, Settings, Day/Night mode), the 160 x 133.3 dip cells on the
     container 9-patch over the home wallpaper ("Same as Home screen"), the 130 x 53.3 dip screen arrows and Add shortcut.
   - Google Voice 0.4.2.30 (googlevoice.apk, Theme.Light): conversation_item.xml rows (the 54 dip picture with its
     voicemail / text / call badge, the 18 sp bold name with the count and time, the star, the 14 sp message), the
     labels (label_item.xml), a conversation with the transcript and playback, and Compose; English only, as the
     service was US-only.
   - Tags 1.1 (TagGoogle.apk): the Tags / Starred / My tag tabs (ic_tab_*), tag_list_item.xml rows, tag_viewer.xml (65 dip
     title_bar_medium, the records, Done and Delete), the About Tags pages (intro_to_nfc.xml) and "NFC turned off".
   - Voice Dialer (packages/apps/VoiceDialer, VoiceDialer.apk): voice_dialing.xml ("Starting up.", "Listening…", the
     microphone, retry), "No results, try again." and the "Did you know…" tool tip.
   Mail, calls and tags are made up and offline. 1 dp = 0.8625 px. */
(() => {
  'use strict';
  const {e} = GBApps;
  const STRINGS = {
      "Tags": [
          "Címkék",
          "Tags",
          "Tags",
          "Etiquetas"
      ],
      "Starred": [
          "Csillagozott címkék",
          "Markiert",
          "Favoris",
          "Destacadas"
      ],
      "My tag": [
          "Saját címke",
          "Mein Tag",
          "Mon tag",
          "Mi etiqueta"
      ],
      "You have not scanned any tags.": [
          "Még nem olvasott be címkét.",
          "Sie haben keine Tags gescannt.",
          "Vous n'avez scanné aucun tag.",
          "No has escaneado ninguna etiqueta."
      ],
      "You have no starred tags.": [
          "Nincsenek csillagozott címkéi.",
          "Sie haben keine Tags markiert.",
          "Vous n'avez ajouté aucun tag à vos favoris.",
          "No has destacado ninguna etiqueta."
      ],
      "More info": [
          "További információ",
          "Weitere Informationen",
          "Plus d'infos",
          "Más información"
      ],
      "About Tags": [
          "A Címkék névjegye",
          "Über Tags",
          "À propos des tags",
          "Acerca de Etiquetas"
      ],
      "Back": [
          "Vissza",
          "Zurück",
          "Retour",
          "Atrás"
      ],
      "Next": [
          "Tovább",
          "Weiter",
          "Suivant",
          "Siguiente"
      ],
      "Done": [
          "Kész",
          "Fertig",
          "OK",
          "Listo"
      ],
      "Delete": [
          "Törlés",
          "Löschen",
          "Supprimer",
          "Eliminar"
      ],
      "Tag deleted": [
          "A címke törölve",
          "Tag gelöscht",
          "Tag supprimé",
          "Etiqueta eliminada"
      ],
      "NFC turned off": [
          "Az NFC ki van kapcsolva",
          "NFC deaktiviert",
          "Communication NFC désactivée",
          "NFC desactivada"
      ],
      "You must turn on NFC to scan tags.": [
          "Címkék beolvasásához be kell kapcsolnia az NFC-t.",
          "Sie müssen NFC aktivieren, um Tags zu scannen.",
          "Vous devez activer la communication NFC pour scanner des tags.",
          "Para escanear etiquetas, debes activar la opción NFC."
      ],
      "Settings": [
          "Beállítások",
          "Einstellungen",
          "Paramètres",
          "Ajustes"
      ],
      "Cancel": [
          "Mégse",
          "Abbrechen",
          "Annuler",
          "Cancelar"
      ],
      "Share my tag": [
          "Saját címke megosztása",
          "Mein Tag weitergeben",
          "Partager mon tag",
          "Compartir mi etiqueta"
      ],
      "Allow others to read my tag": [
          "Mások elolvashatják a címkéimet",
          "Anderen das Lesen meines Tags gestatten",
          "Autoriser les autres à lire mon tag",
          "Permitir que otros usuarios lean mi etiqueta"
      ],
      "Add new tag": [
          "Új címke hozzáadása",
          "Neues Tag hinzufügen",
          "Ajouter un tag",
          "Añadir nueva etiqueta"
      ],
      "You have no tags created.": [
          "Még nem hozott létre egyetlen címkét sem.",
          "Sie haben keine Tags erstellt.",
          "Aucun tag créé",
          "No has creado ninguna etiqueta."
      ],
      "Edit tag": [
          "Címke szerkesztése",
          "Tag bearbeiten",
          "Modifier le tag",
          "Editar etiqueta"
      ],
      "Delete tag": [
          "Címke törlése",
          "Tag löschen",
          "Supprimer le tag",
          "Eliminar etiqueta"
      ],
      "Help": [
          "Súgó",
          "Hilfe",
          "Aide",
          "Ayuda"
      ],
      "Set as active tag": [
          "Beállítás aktív címkeként",
          "Als aktives Tag festlegen",
          "Définir en tant que tag actif",
          "Establecer como etiqueta activa"
      ],
      "Text": [
          "Szöveg",
          "Text",
          "Texte",
          "Texto"
      ],
      "URL": [
          "URL",
          "URL",
          "URL",
          "URL"
      ],
      "Title": [
          "Cím",
          "Titel",
          "Titre",
          "Título"
      ],
      "Save": [
          "Mentés",
          "Speichern",
          "Enregistrer",
          "Guardar"
      ],
      "Contact": [
          "Ismerős",
          "Kontakt",
          "Contact",
          "Contacto"
      ],
      "Active tag": [
          "Aktív címke",
          "Aktives Tag",
          "Tag actif",
          "Etiqueta activa"
      ],
      "Call %s": [
          "%s hívása",
          "%s anrufen",
          "Appeler %s",
          "Llamar al %s"
      ],
      "Tags is for organizing and sharing Near Field Communication (NFC) tags.": [
          "A Címkék az NFC (Near Field Communication -- kis hatósugarú vezeték nélküli kommunikáció) címkék rendszerezésére és megosztására szolgálnak.",
          "Tags dient zur Organisation und Weitergabe von Tags für Nahfeldkommunikation (NFC).",
          "Tags vous permet d'organiser et de partager des tags de communication NFC (communication en champ proche).",
          "Tags se utiliza para organizar y compartir etiquetas de Comunicación de campo cercano (NFC)."
      ],
      "You scan a tag by turning on your phone and placing it right next to a tag.": [
          "Címkét úgy olvashat be, hogy megfordítja a telefonját, és közvetlenül a címke mellé teszi.",
          "Zum Scannen eines Tags Telefon einschalten und direkt an das Tag halten.",
          "Pour scanner un tag, il suffit d'allumer votre téléphone et de le rapprocher du tag.",
          "Para escanear una etiqueta, activa el teléfono y sitúalo junto a la etiqueta."
      ],
      "NFC tags can contain text, URLs, pictures, and other kinds of information.": [
          "Az NFC-címkék tartalmazhatnak szöveget, URL-eket, képeket és másfajta információkat.",
          "NFC-Tags können Text, URLs, Bilder und andere Informationen enthalten.",
          "Les tags NFC peuvent contenir du texte, des URL, des images et bien plus encore.",
          "Las etiquetas NFC pueden contener texto, direcciones URL, imágenes y otros tipos de información."
      ],
      "For more information, press Menu and touch Help on any Tags screen.": [
          "További információért nyomja meg a Menü, majd a Súgó gombot a Címkék bármelyik képernyőjén.",
          "Über \"Menü\" > \"Hilfe\" erhalten Sie auf allen Tags-Bildschirmen weitere Informationen.",
          "Pour en savoir plus, appuyez sur \"Menu\", puis sur \"Aide\", à partir de n'importe quelle page de l'application Tags.",
          "Para obtener más información, pulsa la tecla de menú y toca Ayuda en cualquier pantalla de la aplicación Tags."
      ],
      "Starting up.": [
          "Indítás.",
          "Startvorgang",
          "Démarrage en cours",
          "Iniciando..."
      ],
      "Listening…": [
          "Figyelés...",
          "Jetzt sprechen...",
          "Écoute en cours…",
          "Escuchando..."
      ],
      "No results, try again.": [
          "Nincs találat, próbálja újra.",
          "Keine Ergebnisse, versuchen Sie es erneut.",
          "Aucun résultat, réessayez.",
          "No se ha encontrado ningún resultado. Vuelve a intentarlo."
      ],
      "Please try again.": [
          "Próbálkozzon újra.",
          "Bitte versuchen Sie es erneut.",
          "Veuillez réessayer.",
          "Inténtalo de nuevo."
      ],
      "Did you know…": [
          "Tudta...",
          "Wussten Sie schon...",
          "Saviez-vous que...",
          "¿Sabías que...?"
      ],
      "Pressing & holding the green Call button opens the Voice Dialer.": [
          "A zöld Hívás gomb lenyomásával és nyomva tartásával a Hangtárcsázót nyitja meg.",
          "Durch Drücken und Halten der grünen Anruftaste wird die Sprachwahl geöffnet.",
          "Appuyez sur le bouton vert Appel et maintenez la touche enfoncée pour ouvrir l'application Reconnaissance vocale.",
          "Para abrir la ventana de marcación por voz, mantén pulsado el botón verde de llamada."
      ],
      "Voice Dialer": [
          "Hangtárcsázó",
          "Sprachwahl",
          "Reconnaissance vocale",
          "Marcación por voz"
      ],
      "Navigate": [
          "Navigate",
          "Navigieren",
          "Navigation",
          "Iniciar navegación"
      ],
      "Phone": [
          "Phone",
          "Telefon",
          "Téléphone",
          "Teléfono"
      ],
      "Voice Search": [
          "Voice Search",
          "Sprachsuche",
          "Recherche\nvocale",
          "Búsqueda\npor voz"
      ],
      "Contacts": [
          "Contacts",
          "Kontakte",
          "Contacts",
          "Contactos"
      ],
      "Music": [
          "Music",
          "Musik",
          "Musique",
          "Música"
      ],
      "Exit car mode": [
          "Exit car mode",
          "Automodus beenden",
          "Quitter le \nmode Voiture",
          "Salir de\nmodo coche"
      ],
      "Maps": [
          "Maps",
          "Google Maps",
          "Google Maps",
          "Google Maps"
      ],
      "Places": [
          "Places",
          "Orte",
          "Adresses",
          "Lugares"
      ],
      "Car Home": [
          "Car Home",
          "Automodus",
          "Mode Voiture",
          "Car Home"
      ],
      "Add shortcut": [
          "Add shortcut",
          "Verknüpfung hinzufügen",
          "Ajouter un raccourci",
          "Añadir acceso directo"
      ],
      "Day/Night mode": [
          "Day/Night mode",
          "Tag-/Nachtmodus",
          "Mode Jour/Nuit",
          "Modo nocturno/diurno"
      ],
      "Car applications": [
          "Car applications",
          "Autoanwendungen",
          "Applications en mode Voiture",
          "Aplicaciones de coche"
      ]
  };
  const T = GBApps.texts(STRINGS);

  // ---------- Car Home ----------
  const CA = name => `assets/ch-${name}.png`;
  const CAR = [[['navigate', 'Navigate', 'ic_navigate', 'navigation'], ['phone', 'Phone', 'ic_phone', 'phone'], ['voice', 'Voice Search', 'ic_voicesearch', 'voice-search'], ['contacts', 'Contacts', 'ic_contacts', 'people'], ['music', 'Music', 'ic_music', 'music'], ['exit', 'Exit car mode', 'ic_exit_carhome', '']],
    [['maps', 'Maps', 'ic_maps', 'maps'], ['places', 'Places', 'ic_places', 'places'], null, null, ['settings', 'Settings', 'ic_settings', ''], ['night', 'Day/Night mode', 'ic_brightness_auto', '']], [null, null, null, null, null, null], [null, null, null, null, null, null]];
  function carHome(ctx) {
    const {ui, lang, data} = ctx, screen = ui.chScreen || 0, custom = data.carHome || {};
    const cells = CAR[screen].map((cell, i) => {
      const item = custom[`${screen}:${i}`] ? [custom[`${screen}:${i}`], ctx.t(ctx.appName(custom[`${screen}:${i}`])), null, custom[`${screen}:${i}`]] : cell;
      if (!item) return `<button class="ch-cell add" data-action="ch-add" data-id="${screen}:${i}"><img src="${CA('ic_add_shortcut_semi')}" alt=""><span>${e(T(lang, 'Add shortcut'))}</span></button>`;
      const [id, label, icon, app] = item;
      return `<button class="ch-cell" data-action="ch-open" data-id="${e(id)}" data-app="${e(app)}"><img src="${icon ? CA(icon) : `assets/${app}.png`}" alt=""><span>${e(icon ? T(lang, label) : label)}</span></button>`;
    }).join('');
    return `<div class="app-view ch${data.carNight ? ' night' : ''}" data-no-translate><div class="ch-grid">${cells}</div><div class="ch-arrows"><button class="ch-prev" data-action="ch-screen" data-id="-1"${screen ? '' : ' disabled'} aria-label="‹"><img src="${CA(screen ? 'arrow_left_normal' : 'arrow_empty')}" alt=""></button><span class="ch-dots">${CAR.map((_, i) => `<i class="${i === screen ? 'on' : ''}"></i>`).join('')}</span><button class="ch-next" data-action="ch-screen" data-id="1"${screen < CAR.length - 1 ? '' : ' disabled'} aria-label="›"><img src="${CA(screen < CAR.length - 1 ? 'arrow_right_normal' : 'arrow_empty')}" alt=""></button></div></div>`;
  }

  // ---------- Google Voice ----------
  const GV = name => `assets/gv-${name}.png`;
  const GV_LABELS = [['inbox', 'Inbox'], ['starred', 'Starred'], ['voicemail', 'Voicemail'], ['sms', 'Text'], ['recorded', 'Recorded'], ['placed', 'Placed'], ['received', 'Received'], ['missed', 'Missed'], ['trash', 'Trash'], ['all', 'All']];
  // [id, name, number, kind, minutes ago, read, starred, items [from me?, text]]
  const GV_SAMPLE = [
    ['v1', 'Alex Morgan', '(202) 555-0148', 'voicemail', 35, false, true, [[false, 'Hey, it’s Alex. Just checking if we’re still on for Saturday’s hike. Call me back when you get this. Bye!']]],
    ['v2', 'Sam Rivera', '(202) 555-0192', 'sms', 140, false, false, [[false, 'Dinner at 8?'], [true, 'Sounds good, see you there'], [false, 'Great, I booked a table for four.']]],
    ['v3', 'Taylor Lee', '(202) 555-0116', 'missed', 320, true, false, []],
    ['v4', '(202) 555-0107', '(202) 555-0107', 'voicemail', 1500, true, false, [[false, 'Hi, this is a reminder from the dentist’s office about your appointment on Thursday at 10 am. Please call us if you need to reschedule.']]],
    ['v5', 'Mom', '(202) 555-0107', 'placed', 2900, true, false, []]
  ];
  const gvStore = data => (data.gvoice ||= GV_SAMPLE.map(([id, name, number, kind, mins, read, starred, items]) => ({id, name, number, kind, mins, read, starred, label: 'inbox', items: items.map(([me, text]) => ({me, text}))})));
  const gvBadge = kind => kind === 'voicemail' ? 'voicemail_with_border' : kind === 'sms' ? 'sms_with_border' : kind === 'missed' ? 'call_missed_with_border' : kind === 'placed' ? 'call_placed_with_border' : 'call_received_with_border';
  const gvTime = (ctx, mins) => mins < 1440 ? new Date(ctx.now.getTime() - mins * 6e4).toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'}) : new Date(ctx.now.getTime() - mins * 6e4).toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
  const gvIn = (c, label) => label === 'all' ? c.label !== 'trash' : label === 'starred' ? c.starred && c.label !== 'trash' : label === 'trash' ? c.label === 'trash' : ['voicemail', 'sms', 'missed', 'placed', 'received', 'recorded'].includes(label) ? c.kind === label && c.label !== 'trash' : c.label === label;
  function googleVoice(ctx) {
    const {ui} = ctx, list = gvStore(ctx.data), label = ui.gvLabel || 'inbox';
    if (ui.gvLabels) return `<div class="app-view gv" data-no-translate><div class="gb-titlebar">Google Voice - Labels</div><div class="gv-scroll">${GV_LABELS.map(([id, name]) => { const n = list.filter(c => gvIn(c, id) && !c.read).length; return `<button class="gv-label" data-action="gv-label" data-id="${id}"><img src="${GV(id === 'sms' ? 'text_message' : id === 'starred' ? 'star_on' : id === 'missed' ? 'call_missed' : id === 'placed' ? 'call_placed' : id === 'received' ? 'call_received' : id === 'recorded' ? 'call_recorded' : 'voicemail')}" alt=""><span>${e(name)}${n ? ` (${n})` : ''}</span></button>`; }).join('')}</div></div>`;
    const c = list.find(x => x.id === ui.gvOpen);
    if (c) {
      const rows = c.items.length ? c.items.map(m => c.kind === 'voicemail' ? `<div class="gv-vm"><button class="gv-play${ui.gvPlaying === c.id ? ' on' : ''}" data-action="gv-play" data-id="${c.id}" aria-label="Play"></button><span class="gv-bar"><i style="width:${ui.gvPlaying === c.id ? 100 : 0}%"></i></span><p class="gv-transcript">${e(m.text)}</p></div>` : `<div class="gv-sms${m.me ? ' me' : ''}"><b>${e(m.me ? 'Me' : c.name)}:</b> ${e(m.text)}</div>`).join('') : `<p class="gv-call">${e({missed: 'Missed call', placed: 'Placed call', received: 'Received call'}[c.kind] || '')} · ${e(gvTime(ctx, c.mins))}</p>`;
      return `<div class="app-view gv" data-no-translate><div class="gb-titlebar">${e(c.name)}</div><div class="gv-scroll gv-conv"><div class="gv-head"><img src="${GV('default_contact_picture')}" alt=""><span><b>${e(c.name)}</b><small>${e(c.number)}</small></span></div>${rows}</div>${c.kind === 'sms' ? `<form class="gv-compose" data-form="gv-sms"><input name="text" placeholder="Type to compose" aria-label="Type to compose" autocomplete="off"><button type="submit">Send</button></form>` : ''}</div>`;
    }
    const items = list.filter(x => gvIn(x, label)).sort((a, b) => a.mins - b.mins);
    const rows = items.map(x => `<div class="gv-item${x.read ? '' : ' unread'}"><button class="gv-open" data-action="gv-open" data-id="${x.id}"><span class="gv-photo"><img src="${GV('default_contact_picture')}" alt=""><img class="gv-badge" src="${GV(gvBadge(x.kind))}" alt=""></span><span class="gv-main"><span class="gv-top"><b>${e(x.name)}</b>${x.items.length > 1 ? `<i>(${x.items.length})</i>` : ''}<small>${e(gvTime(ctx, x.mins))}</small></span><span class="gv-text">${e(x.items.at(-1)?.text || {missed: 'Missed call', placed: 'Placed call', received: 'Received call'}[x.kind] || '')}</span></span></button><button class="gv-star${x.starred ? ' on' : ''}" data-action="gv-star" data-id="${x.id}" aria-label="Star"></button></div>`).join('');
    return `<div class="app-view gv" data-no-translate><div class="gb-titlebar">Google Voice - ${e((GV_LABELS.find(l => l[0] === label) || [0, 'Inbox'])[1])}</div><div class="gv-scroll">${rows || '<p class="gv-empty">No messages</p>'}</div></div>`;
  }

  // ---------- Tags ----------
  const TA = name => `assets/tg-${name}.png`;
  const tgStore = data => (data.tags23 ||= {tags: [
    {id: 't1', title: 'Riverside Park — summer concerts', kind: 'url', value: 'http://www.example.com/concerts', date: 'Jul 14, 2011', starred: true},
    {id: 't2', title: 'Alex Morgan', kind: 'contact', value: '202-555-0148', date: 'Jul 9, 2011', starred: false},
    {id: 't3', title: 'Bean There Café: free Wi-Fi', kind: 'text', value: 'Network: BeanThere · Password on the receipt', date: 'Jun 30, 2011', starred: false}], myTag: {title: '', text: '', on: false}});
  function tags(ctx) {
    const {ui, lang, data} = ctx, s = tgStore(data), tab = ui.tgTab || 'tags', t = k => T(lang, k);
    if (ui.tgIntro !== undefined) {
      const page = ui.tgIntro;
      return `<div class="app-view tg" data-no-translate><div class="tg-intro"><h3>${e(t('About Tags'))}</h3><div class="tg-page">${page === 0 ? `<p>${e(t('Tags is for organizing and sharing Near Field Communication (NFC) tags.'))}</p><img src="${TA('tag_scan_illustration')}" alt=""><p>${e(t('You scan a tag by turning on your phone and placing it right next to a tag.'))}</p>` : `<p>${e(t('NFC tags can contain text, URLs, pictures, and other kinds of information.'))}</p><p>${e(t('For more information, press Menu and touch Help on any Tags screen.'))}</p>`}</div><div class="tg-buttons"><button data-action="tg-intro" data-id="${page - 1}"${page ? '' : ' disabled'}>${e(t('Back'))}</button><button data-action="tg-intro" data-id="${page + 1}">${e(t(page ? 'Done' : 'Next'))}</button></div></div></div>`;
    }
    const tag = s.tags.find(x => x.id === ui.tgOpen);
    if (tag) return `<div class="app-view tg" data-no-translate><div class="tg-title"><img src="${TA('ic_launcher_nfc')}" alt=""><span><b>${e(tag.title)}</b><small>${e(tag.date)}</small></span><button class="tg-star${tag.starred ? ' on' : ''}" data-action="tg-star" data-id="${tag.id}" aria-label="${e(t('Starred'))}"></button></div><div class="tg-scroll"><button class="tg-record" data-action="tg-record" data-id="${tag.id}"><small>${e(t(tag.kind === 'url' ? 'URL' : tag.kind === 'contact' ? 'Contact' : 'Text'))}</small><b>${e(tag.kind === 'contact' ? T(lang, 'Call %s').replace('%s', tag.value) : tag.value)}</b></button></div><div class="tg-buttons"><button data-action="tg-done">${e(t('Done'))}</button><button data-action="tg-delete" data-id="${tag.id}">${e(t('Delete'))}</button></div></div>`;
    const tabs = [['tags', 'Tags', 'all_tags'], ['starred', 'Starred', 'starred'], ['my', 'My tag', 'my_tag']].map(([id, label, icon]) => `<button class="tg-tab${tab === id ? ' on' : ''}" data-action="tg-tab" data-id="${id}"><img src="${TA(`ic_tab_${tab === id ? 'selected' : 'unselected'}_${icon}`)}" alt=""><span>${e(t(label))}</span></button>`).join('');
    let body;
    if (tab === 'my') body = `<div class="tg-my"><label class="tg-switch"><span><b>${e(t('Share my tag'))}</b><small>${e(t('Allow others to read my tag'))}</small></span><input type="checkbox" data-action="tg-share" ${s.myTag.on ? 'checked' : ''}></label><form data-form="tg-my" class="tg-form"><input name="title" value="${e(s.myTag.title)}" placeholder="${e(t('Title'))}" aria-label="${e(t('Title'))}" autocomplete="off"><input name="text" value="${e(s.myTag.text)}" placeholder="${e(t('Text'))}" aria-label="${e(t('Text'))}" autocomplete="off"><button type="submit">${e(t('Save'))}</button></form></div>`;
    else {
      const list = s.tags.filter(x => tab === 'tags' || x.starred);
      body = list.length ? list.map(x => `<button class="tg-item" data-action="tg-open" data-id="${x.id}"><b>${e(x.title)}</b><small>${e(x.date)}</small></button>`).join('') : `<div class="tg-empty"><p>${e(t(tab === 'tags' ? 'You have not scanned any tags.' : 'You have no starred tags.'))}</p><button data-action="tg-intro" data-id="0">${e(t('More info'))}</button></div>`;
    }
    return `<div class="app-view tg" data-no-translate><div class="tg-tabs">${tabs}</div><div class="tg-scroll">${body}</div></div>`;
  }

  // ---------- Voice Dialer ----------
  const VD = name => `assets/vd-${name}.png`;
  function voiceDialer(ctx) {
    const {ui, lang} = ctx, state = ui.vdState || 'starting', t = k => T(lang, k);
    const names = (ctx.contacts || []).slice(0, 3).map(c => c.name);
    return `<div class="app-view vd" data-no-translate><div class="vd-box"><div class="vd-state">${e(t(state === 'starting' ? 'Starting up.' : state === 'failed' ? 'No results, try again.' : 'Listening…'))}</div><div class="vd-sub">${state === 'failed' ? e(t('Please try again.')) : ''}</div><div class="vd-row"><button class="vd-mic" data-action="vd-retry" aria-label="${e(t('Voice Dialer'))}"><img src="${VD(state === 'starting' ? 'ic_vd_mic_off' : state === 'failed' ? 'ic_vd_retry' : 'ic_vd_mic_on')}" alt=""></button><div class="vd-ex"><b>Examples:</b>${names.map(n => `<span>“Call ${e(n)}”</span>`).join('')}<span>“Dial 202 555 0148”</span><span>“Open Calendar”</span></div></div></div>${state === 'failed' ? `<div class="vd-tip"><b>${e(t('Did you know…'))}</b><i></i><p><img src="${VD('ic_vd_green_key')}" alt=""><span>${e(t('Pressing & holding the green Call button opens the Voice Dialer.'))}</span></p></div>` : ''}</div>`;
  }

  function render(ctx) {
    switch (ctx.view) {
      case 'car-home': return carHome(ctx);
      case 'google-voice': return googleVoice(ctx);
      case 'tags': return tags(ctx);
      default: return voiceDialer(ctx);
    }
  }
  let vdTimer = 0, gvTimer = 0;
  function mounted(ctx) {
    const {ui} = ctx;
    if (ctx.view === 'voice-dialer' && (ui.vdState || 'starting') !== 'failed') {
      clearTimeout(vdTimer);
      vdTimer = setTimeout(() => { if (ui.view !== 'voice-dialer') return; ui.vdState = ui.vdState === 'listening' ? 'failed' : 'listening'; ctx.render(); }, ui.vdState === 'listening' ? 3500 : 900);
    }
  }
  function menu(ctx) {
    const {view, ui, lang} = ctx, t = k => T(lang, k);
    if (view === 'google-voice') return ui.gvOpen
      ? [{action: 'gv-call', title: 'Call', icon: 'gv-ic_menu_call_gingerbread.png'}, {action: 'gv-sms-open', title: 'Text', icon: 'gv-ic_menu_sms_gingerbread.png'}, {action: 'gv-archive', title: 'Archive', icon: 'gv-ic_menu_archive_gingerbread.png'}, {action: 'gv-delete', title: 'Delete', icon: 'gv-ic_menu_delete_gingerbread.png'}, {action: 'gv-star', id: ui.gvOpen, title: 'Add star', icon: 'gv-ic_menu_star_gingerbread.png'}]
      : [{action: 'gv-compose', title: 'Compose', icon: 'gv-ic_menu_compose_gingerbread.png'}, {action: 'gv-labels', title: 'Labels', icon: 'gv-ic_menu_labels_gingerbread.png'}, {action: 'gv-refresh', title: 'Refresh', icon: 'gv-ic_menu_refresh_gingerbread.png'}, {action: 'gv-unsupported', title: 'Search', icon: 'gv-ic_menu_search_gingerbread.png'}, {action: 'gv-unsupported', title: 'Balance', icon: 'gv-ic_menu_balance_gingerbread.png'}, {action: 'gv-unsupported', title: 'Settings', icon: 'ic_menu_preferences'}, {action: 'gv-unsupported', title: 'Help', icon: 'ic_menu_help'}];
    if (view === 'tags') return ui.tgOpen ? [{action: 'tg-delete', id: ui.tgOpen, title: t('Delete tag'), icon: 'ic_menu_delete'}, {action: 'tg-intro', id: '0', title: t('Help'), icon: 'ic_menu_help'}] : [{action: 'tg-intro', id: '0', title: t('Help'), icon: 'ic_menu_help'}, {action: 'tg-settings', title: t('Settings'), icon: 'ic_menu_preferences'}];
    if (view === 'car-home') return [{action: 'ch-open', id: 'exit', title: T(lang, 'Exit car mode'), icon: 'ch-ic_exit_carhome.png'}, {action: 'ch-open', id: 'settings', title: t('Settings'), icon: 'ic_menu_preferences'}];
    return [];
  }
  function dialog(kind, ctx) {
    const {lang} = ctx, t = k => T(lang, k);
    if (kind === 'nfc') return {title: t('NFC turned off'), icon: 'ic_dialog_alert', message: t('You must turn on NFC to scan tags.'), buttons: [{action: 'tg-settings', title: t('Settings')}, {action: 'close-overlay', title: t('Cancel')}]};
    if (kind === 'car-add') return {title: t('Car applications'), items: ['navigation', 'maps', 'places', 'music', 'phone', 'people', 'voice-search', 'talk', 'gmail', 'news-weather'].map(app => ({action: 'ch-add-pick', id: app, title: ctx.t(ctx.appName(app)), icon: `${app}.png`}))};
    if (kind === 'gv-compose') return {title: 'Compose', custom: `<form data-form="gv-new"><input class="gbdlg-input" name="to" placeholder="To" aria-label="To" autocomplete="off"><input class="gbdlg-input" name="text" placeholder="Type to compose" aria-label="Type to compose" autocomplete="off"></form>`, buttons: [{action: 'gv-new-send', title: 'Send'}, {action: 'close-overlay', title: 'Cancel'}]};
    return null;
  }
  function handle(action, id, ctx, button) {
    const {ui, data, lang} = ctx, close = () => { ui.overlay = ''; ctx.renderOverlay(); };
    switch (action) {
      case 'ch-screen': ui.chScreen = Math.max(0, Math.min(CAR.length - 1, (ui.chScreen || 0) + Number(id))); ctx.render(); break;
      case 'ch-open': close();
        if (id === 'exit') { ui.chScreen = 0; ctx.home(); }
        else if (id === 'night') { data.carNight = !data.carNight; ctx.save(); ctx.render(); }
        else if (id === 'settings') ctx.toast('This feature is not part of the simulator.');
        else if (button?.dataset.app) ctx.openApp(button.dataset.app);
        else ctx.openApp(id);
        break;
      case 'ch-add': ui.chSlot = id; ctx.dialog('car-add'); break;
      case 'ch-add-pick': (data.carHome ||= {})[ui.chSlot] = id; close(); ctx.save(); ctx.render(); break;
      case 'gv-open': { const c = gvStore(data).find(x => x.id === id); if (c) { c.read = true; ui.gvOpen = id; ctx.save(); ctx.render(); } break; }
      case 'gv-star': { const c = gvStore(data).find(x => x.id === id); if (c) c.starred = !c.starred; close(); ctx.save(); ctx.render(); break; }
      case 'gv-labels': close(); ui.gvLabels = true; ctx.render(); break;
      case 'gv-label': ui.gvLabel = id; ui.gvLabels = false; ctx.render(); break;
      case 'gv-play': { ui.gvPlaying = ui.gvPlaying === id ? '' : id; ctx.render(); clearTimeout(gvTimer); if (ui.gvPlaying) gvTimer = setTimeout(() => { ui.gvPlaying = ''; if (ui.view === 'google-voice') ctx.render(); }, 6000); break; }
      case 'gv-call': { const c = gvStore(data).find(x => x.id === ui.gvOpen); close(); if (c) ctx.call(c.number); break; }
      case 'gv-sms-open': close(); ctx.focus('.gv-compose input'); break;
      case 'gv-archive': case 'gv-delete': { const c = gvStore(data).find(x => x.id === ui.gvOpen); if (c) c.label = action === 'gv-delete' ? 'trash' : 'archive'; ui.gvOpen = ''; close(); ctx.save(); ctx.render(); break; }
      case 'gv-compose': ctx.dialog('gv-compose'); ctx.focus('.gbdlg [name=to]'); break;
      case 'gv-new-send': document.querySelector('.gbdlg form[data-form="gv-new"]')?.requestSubmit(); break;
      case 'gv-refresh': close(); ctx.toast('Getting messages'); break;
      case 'gv-unsupported': close(); ctx.toast('This feature is not part of the simulator.'); break;
      case 'tg-tab': ui.tgTab = id; ctx.render(); break;
      case 'tg-open': ui.tgOpen = id; ctx.render(); break;
      case 'tg-done': ui.tgOpen = ''; ctx.render(); break;
      case 'tg-star': { const tag = tgStore(data).tags.find(x => x.id === id); if (tag) tag.starred = !tag.starred; ctx.save(); ctx.render(); break; }
      case 'tg-delete': { const s = tgStore(data); s.tags = s.tags.filter(x => x.id !== id); ui.tgOpen = ''; close(); ctx.save(); ctx.render(); ctx.toast(T(lang, 'Tag deleted')); break; }
      case 'tg-record': { const tag = tgStore(data).tags.find(x => x.id === id); if (!tag) break; if (tag.kind === 'url') ctx.browse(tag.value); else if (tag.kind === 'contact') ctx.call(tag.value); break; }
      case 'tg-intro': close(); { const n = Number(id); ui.tgIntro = n > 1 || n < 0 ? undefined : n; } ctx.render(); break;
      case 'tg-share': { const s = tgStore(data); s.myTag.on = !s.myTag.on; ctx.save(); break; }
      case 'tg-settings': close(); ctx.openApp('settings'); break;
      case 'vd-retry': ui.vdState = 'listening'; ctx.render(); break;
      default: return false;
    }
    return true;
  }
  function submit(form, values, ctx) {
    const {ui, data} = ctx;
    if (form === 'gv-sms') { const text = String(values.get('text') || '').trim(), c = gvStore(data).find(x => x.id === ui.gvOpen); if (!text || !c) return true; c.items.push({me: true, text}); c.mins = 0; ctx.save(); ctx.render(); ctx.toast('Message sent via Google Voice.'); return true; }
    if (form === 'gv-new') { const to = String(values.get('to') || '').trim(), text = String(values.get('text') || '').trim(); if (!to || !text) return true; gvStore(data).unshift({id: 'v' + Date.now(), name: to, number: to, kind: 'sms', mins: 0, read: true, starred: false, label: 'inbox', items: [{me: true, text}]}); ui.overlay = ''; ctx.renderOverlay(); ctx.save(); ctx.render(); ctx.toast('Message sent via Google Voice.'); return true; }
    if (form === 'tg-my') { const s = tgStore(data); s.myTag.title = String(values.get('title') || '').trim(); s.myTag.text = String(values.get('text') || '').trim(); ctx.save(); ctx.toast(T(ctx.lang, 'Save')); return true; }
    return false;
  }
  function back(ctx) {
    const {ui, view} = ctx;
    if (view === 'google-voice' && ui.gvOpen) { ui.gvOpen = ''; ctx.render(); return true; }
    if (view === 'google-voice' && ui.gvLabels) { ui.gvLabels = false; ctx.render(); return true; }
    if (view === 'tags' && ui.tgIntro !== undefined) { ui.tgIntro = undefined; ctx.render(); return true; }
    if (view === 'tags' && ui.tgOpen) { ui.tgOpen = ''; ctx.render(); return true; }
    if (view === 'car-home' && ui.chScreen) { ui.chScreen = 0; ctx.render(); return true; }
    return false;
  }
  function open(ctx, resume) {
    const {ui, view, data} = ctx;
    if (resume) return;
    if (view === 'google-voice') { ui.gvOpen = ''; ui.gvLabels = false; ui.gvLabel = 'inbox'; }
    if (view === 'tags') { ui.tgOpen = ''; ui.tgIntro = undefined; if (data.settings?.nfc === false) setTimeout(() => ctx.dialog('nfc')); }
    if (view === 'voice-dialer') ui.vdState = 'starting';
    if (view === 'car-home') ui.chScreen = 0;
  }
  // Launcher labels as the image has them (launcher.txt: Google Voice's app_icon_name is "Voice" in every language;
  // CarHomeGoogle's app_name has no Hungarian), over the shared rows that translate "Voice" as a noun.
  window.AndroidI18n?.extend([['Voice', 'Voice', 'Voice', 'Voice', 'Voice'], ['Car Home', 'Car Home', 'Automodus', 'Mode Voiture', 'Car Home']]);
  const module = {render, mounted, menu, dialog, handle, submit, back, open};
  for (const id of ['car-home', 'google-voice', 'tags', 'voice-dialer']) GBApps.register(id, module);
  window.GBExtraApps = {T, CAR, GV_LABELS};
})();
