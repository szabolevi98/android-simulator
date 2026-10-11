/* Google Talk 1.3 of the Nexus S image (Talk2.apk, with voice and video chat), from its layouts, colours and texts:
   - The friends list (BuddyList): roster_list.xml on roster_list_online_background #e3e3e3, roster_list_self_item.xml
     (your picture in im_avatar_picture_border_normal, your name and status, the presence on the right) and
     roster_list_item.xml rows (65 dip: the picture, the 18 sp bold name, the 14 sp status, a seperator_vertical_light and
     the 62 dip presence column; offline friends on #cccccc in #666666), and the Set status choices.
   - The chat (ChatScreen): title_message_bar.xml on header_chat (the friend's name in bold, the status, the presence and
     the voice / video buttons), chat_screen_item.xml rows (18 sp; received chats on received_chat_color #effbff, names in
     chat_from #7785e0 / chat_me #3492c5), the compose bar on bottombar_landscape_565 ("Type to compose", Send), and the
     emoticons of Insert smiley.
   - The Menu-key menus of both screens in the order of buddy_list_menu.xml and chat_screen_menu.xml.
   - Add friend (AddBuddyScreen, add_buddy_screen.xml): "Send chat invitation to", the address field and Send invitation
     centred on the ButtonBar; a name without a domain gets @gmail.com, as onCreate does. Sent invitations wait in Invites
     (InvitedUserList, invited_user.xml); Blocked lists blocked friends (none). Most popular / All friends switches the
     list between the friends you chat with and everyone.
   Friends' replies are made up and offline. 1 dp = 0.8625 px. */
(() => {
  'use strict';
  const {e} = GBApps;
  const STRINGS = {
    "Talk": {"res": "Talk2:app_label", "hu": "Google Csevegő", "de": "Talk", "fr": "Talk", "es": "Google Talk"},
    "Google Talk": {"res": "Talk2:landing_page_title", "hu": "Google Csevegő", "de": "Google Talk", "fr": "Google Talk", "es": "Google Talk"},
    "Friends list": {"res": "Talk2:menu_view_roster", "hu": "Ismerőslista", "de": "Kontaktliste", "fr": "Liste d'amis", "es": "Lista de amigos"},
    "Available": {"res": "Talk2:presence_available", "hu": "Elérhető", "de": "Verfügbar", "fr": "Disponible", "es": "Disponible"},
    "Busy": {"res": "Talk2:presence_busy", "hu": "Elfoglalt", "de": "Nicht verfügbar", "fr": "Ne pas déranger", "es": "Ocupado/a"},
    "Away": {"res": "Talk2:presence_away", "hu": "Nincs a gépnél", "de": "Nicht da", "fr": "Absent", "es": "Ausente"},
    "Invisible": {"res": "Talk2:presence_invisible", "hu": "Láthatatlan", "de": "Unsichtbar", "fr": "Invisible", "es": "Invisible"},
    "Offline": {"res": "Talk2:presence_offline", "hu": "Offline", "de": "Offline", "fr": "Non connecté", "es": "Desconectado/a"},
    "Status message": {"res": "Talk2:custom_status_hint", "hu": "Állapotüzenet", "de": "Statusnachricht", "fr": "Disponibilité", "es": "Mensaje de estado"},
    "Set Status": {"res": "Talk2:set_status_activity_title", "hu": "Állapot beállítása", "de": "Status festlegen", "fr": "Définir la disponibilité", "es": "Establecer estado"},
    "Type to compose": {"res": "Talk2:compose_hint", "hu": "Kezdje meg a gépelést", "de": "Zum Schreiben eintippen", "fr": "Saisissez votre message", "es": "Escribir mensaje"},
    "Send": {"res": "Talk2:send", "hu": "Küldés", "de": "Senden", "fr": "Envoyer", "es": "Enviar"},
    "Add friend": {"res": "Talk2:menu_add", "hu": "Ismerős hozzáadása", "de": "Freund hinzufügen", "fr": "Ajouter un ami", "es": "Añadir amigo"},
    "Search": {"res": "Talk2:menu_search", "hu": "Keresés", "de": "Suche", "fr": "Rechercher", "es": "Buscar"},
    "All friends": {"res": "Talk2:menu_show_all_contacts", "hu": "Az összes ismerős", "de": "Alle Freunde", "fr": "Tous mes amis", "es": "Todos los amigos"},
    "Most popular": {"res": "Talk2:menu_show_quick_contacts", "hu": "Legkedveltebb", "de": "Beliebteste Kontakte", "fr": "Meilleurs amis", "es": "Más frecuentes"},
    "Invites": {"res": "Talk2:menu_show_invites", "hu": "Meghívások", "de": "Einladungen", "fr": "Invités", "es": "Invitados"},
    "Settings": {"res": "Talk2:menu_settings", "hu": "Beállítások", "de": "Einstellungen", "fr": "Paramètres", "es": "Ajustes"},
    "Sign out": {"res": "Talk2:menu_sign_out", "hu": "Kijelentkezés", "de": "Abmelden", "fr": "Se déconnecter", "es": "Salir"},
    "Switch chats": {"res": "Talk2:menu_switch_chats", "hu": "Váltás a csevegések között", "de": "Chat wechseln", "fr": "Changer de chat", "es": "Cambiar de chat"},
    "Chat off record": {"res": "Talk2:menu_go_off_record", "hu": "Csevegés rögzítés nélkül", "de": "Chat vertraulich", "fr": "Chat en mode privé", "es": "No guardar registro"},
    "Chat on record": {"res": "Talk2:menu_go_on_record", "hu": "Csevegés rögzítéssel", "de": "Chat nicht vertraulich", "fr": "Chat enregistré", "es": "Guardar registro de chat"},
    "Add to chat": {"res": "Talk2:menu_add_contact", "hu": "Hozzáadás a csevegéshez", "de": "Zum Chatten einladen", "fr": "Ajouter au chat", "es": "Añadir al chat"},
    "End chat": {"res": "Talk2:menu_end_conversation", "hu": "Csevegés befejezése", "de": "Chat beenden", "fr": "Arrêter le chat", "es": "Finalizar chat"},
    "End all chats": {"res": "Talk2:menu_leave_all_chats", "hu": "Minden csevegés befejezése", "de": "Alle Chats beenden", "fr": "Quitter tous les chats", "es": "Finalizar todos los chats"},
    "Insert smiley": {"res": "Talk2:menu_insert_smiley", "hu": "Hangulatjel beszúrása", "de": "Smiley einfügen", "fr": "Insérer une émoticône", "es": "Insertar emoticono"},
    "Clear chat history": {"res": "Talk2:menu_clear_chat", "hu": "Csevegési előzmények törlése", "de": "Chat-Protokoll löschen", "fr": "Effacer l'historique du chat", "es": "Borrar historial de chat"},
    "Friend info": {"res": "Talk2:menu_user_info", "hu": "Ismerős adatai", "de": "Info zu Freund", "fr": "Infos sur l'ami", "es": "Información de tu amigo/a"},
    "Video chat": {"res": "Talk2:menu_video_chat", "hu": "Videocsevegés", "de": "Video-Chat", "fr": "Chat vidéo", "es": "Chat de vídeo"},
    "Voice chat": {"res": "Talk2:menu_voice_chat", "hu": "Audiocsevegés", "de": "Voice-Chat", "fr": "Chat audio", "es": "Chat de voz"},
    "Send video chat invitation?": {"res": "Talk2:confirm_dialog_video_chat_message", "hu": "Elküldi a videocsevegési meghívót?", "de": "Video-Chat-Einladung senden?", "fr": "Envoyer l'invitation à un chat vidéo ?", "es": "¿Enviar invitación a chat de vídeo?"},
    "Send voice chat invitation?": {"res": "Talk2:confirm_dialog_voice_chat_message", "hu": "Elküldi az audiocsevegési meghívót?", "de": "Voice-Chat-Einladung senden?", "fr": "Envoyer l'invitation à un chat audio ?", "es": "¿Enviar invitación a chat de voz?"},
    "Calling…": {"res": "Talk2:video_audio_chat_calling", "hu": "Hívás…", "de": "Anruf wird getätigt…", "fr": "Appel en cours…", "es": "Llamando…"},
    "No active chats": {"res": "Talk2:no_chats", "hu": "Nincs aktív csevegés", "de": "Keine aktiven Chats", "fr": "Aucun chat actif", "es": "No hay chats activos."},
    "%s is away": {"res": "Talk2:user_away", "hu": "%s nincs számítógépközelben", "de": "%s ist nicht da.", "fr": "Ce contact (%s) est absent.", "es": "%s está ausente."},
    "%s is busy": {"res": "Talk2:user_busy", "hu": "%s elfoglalt", "de": "%s ist nicht verfügbar.", "fr": "%s n'est pas disponible.", "es": "%s está ocupado/a."},
    "%s is offline": {"res": "Talk2:user_offline", "hu": "%s állapota offline", "de": "%s ist offline.", "fr": "%s n'est pas en ligne.", "es": "%s está desconectado/a."},
    "Chat with %s": {"res": "Talk2:chat_with", "hu": "Csevegés a következő személlyel: %s", "de": "Chat mit %s", "fr": "Chatter avec %s", "es": "Chat con %s"},
    "Video chat available": {"res": "Talk2:video_chat_available", "hu": "A videocsevegés elérhető", "de": "Video-Chat verfügbar", "fr": "Chat vidéo disponible", "es": "Chat de vídeo disponible"},
    "Mobile indicator": {"res": "Talk2:mobile_indicator_title", "hu": "Mobil állapot jelzése", "de": "Mobilanzeige", "fr": "Indicateur de mobile", "es": "Indicador móvil"},
    "Search Google Talk": {"res": "Talk2:search_hint", "hu": "Keresés a Google Csevegőben", "de": "Google Talk durchsuchen", "fr": "Rechercher dans Google Talk", "es": "Buscar Google Talk"},
    "%1$s results for \"%2$s\"": {"res": "Talk2:chat_search_history", "hu": "%1$s találat a következőre: \"%2$s\"", "de": "%1$s Ergebnisse für \"%2$s\"", "fr": "%1$s résultats pour \"%2$s\"", "es": "%1$s resultados de \"%2$s\""},
    "Invite a friend to chat": {"res": "Talk2:invite_buddy", "hu": "Ismerős meghívása csevegésre", "de": "Laden Sie einen Freund zum Chatten ein.", "fr": "Inviter un ami à chatter", "es": "Invitar a un amigo a chatear"},
    "Send chat invitation to": {"res": "Talk2:invite_instruction", "hu": "Csevegési meghívás küldése a következőnek:", "de": "Einladung zum Chatten senden an", "fr": "Envoyer une invitation à", "es": "Enviar una invitación de chat a"},
    "Send invitation": {"res": "Talk2:invite_label", "hu": "Meghívó küldése", "de": "Einladung senden", "fr": "Envoyer une invitation", "es": "Enviar invitación"},
    "Pending invitations": {"res": "Talk2:pending_invitations_title", "hu": "Függőben lévő meghívások", "de": "Ausstehende Einladungen", "fr": "Invitations en attente", "es": "Invitaciones pendientes"},
    "Blocked friends": {"res": "Talk2:blocked_title", "hu": "Letiltott ismerősök", "de": "Blockierte Freunde", "fr": "Amis bloqués", "es": "Amigos bloqueados"},
    "Blocked": {"res": "Talk2:menu_show_blocked_contacts", "hu": "Letiltva", "de": "Blockiert", "fr": "Bloqués", "es": "Bloqueados"},
    "Help": {"res": "Talk2:menu_help", "hu": "Súgó", "de": "Hilfe", "fr": "Aide", "es": "Ayuda"},
    "View contact": {"res": "Talk2:menu_view_contact", "hu": "Névjegy megtekintése", "de": "Kontakt anzeigen", "fr": "Afficher le contact", "es": "Ver contacto"}
  };
  const T = GBApps.texts(STRINGS);
  const A = name => `assets/tk-${name}.png`;
  const PRESENCE = ['available', 'away', 'busy', 'offline'];
  // The made-up roster over the simulator's contacts: presence, status message, voice / video and mobile.
  const ROSTER = {1: ['available', 'On the trail with my Nexus S', 'video'], 2: ['away', 'Back in 10', 'voice'], 3: ['busy', 'Meetings all day', ''], 4: ['available', '', 'mobile']};
  const REPLIES = ['Sounds good!', 'Haha, nice :)', 'On my way.', 'Let me check and get back to you.', 'Sure, see you then!'];
  const SMILEYS = [['happy', ':-)'], ['sad', ':-('], ['winking', ';-)'], ['tongue_sticking_out', ':-P'], ['surprised', '=-O'], ['kissing', ':-*'], ['cool', 'B-)'], ['laughing', ':-D']];
  const smileys = text => SMILEYS.reduce((html, [img, code]) => html.split(e(code)).join(`<img class="tk-emo" src="${A(`emo_im_${img}`)}" alt="${e(code)}">`), e(text));
  const friend = (ctx, id) => { const c = (ctx.contacts || []).find(x => String(x.id) === String(id)); if (!c) return null; const [presence, status, kind] = ROSTER[c.id] || ['offline', '', '']; return {...c, presence, status, kind}; };
  const presenceIcon = f => f.presence === 'offline' ? 'assets/gb-presence_offline.png' : f.kind === 'voice' || f.kind === 'video' ? A(`presence_audio_${f.presence === 'available' ? 'online' : f.presence}`) : `assets/gb-presence_${f.presence === 'available' ? 'online' : f.presence}.png`;
  const store = data => (data.talk23 ||= {presence: 'available', message: '', chats: {}, offRecord: {}});
  const label = (lang, p) => T(lang, p === 'available' ? 'Available' : p === 'away' ? 'Away' : p === 'busy' ? 'Busy' : p === 'invisible' ? 'Invisible' : 'Offline');

  function roster(ctx) {
    const {lang, data} = ctx, s = store(data);
    const friends = (ctx.contacts || []).filter(c => !s.popular || s.chats[c.id]?.length).map(c => friend(ctx, c.id)).sort((a, b) => PRESENCE.indexOf(a.presence) - PRESENCE.indexOf(b.presence) || a.name.localeCompare(b.name));
    const self = `<button class="tk-self" data-action="tk-status"><span class="tk-avatar"><img src="${A('ic_contact_picture')}" alt=""></span><span class="tk-text"><b>${e(ctx.account)}</b><small>${e(s.message || label(lang, s.presence))}</small></span><i class="tk-sep"></i><span class="tk-presence"><img src="assets/gb-presence_${s.presence === 'available' ? 'online' : s.presence}.png" alt=""></span></button>`;
    const active = Object.keys(s.chats).filter(id => s.chats[id].length);
    const rows = friends.map(f => `<button class="tk-buddy${f.presence === 'offline' ? ' off' : ''}" data-action="tk-chat" data-id="${f.id}"><span class="tk-avatar"><img src="${A('ic_contact_picture')}" alt=""></span><span class="tk-text"><b>${e(f.name)}</b><small>${e(f.status || label(lang, f.presence))}</small>${f.kind === 'mobile' ? `<img class="tk-kind" src="${A('im_contact_icon_mobile_light')}" alt="">` : ''}</span>${active.includes(String(f.id)) ? `<img class="tk-active" src="${A('status_chat')}" alt="">` : ''}<i class="tk-sep"></i><span class="tk-presence"><img src="${presenceIcon(f)}" alt=""></span></button>`).join('');
    return `<div class="app-view tk tk-roster" data-no-translate><div class="gb-titlebar">${e(T(lang, 'Friends list'))}</div><div class="tk-scroll">${self}${rows}</div></div>`;
  }
  function chat(ctx) {
    const {lang, data, ui, locale} = ctx, s = store(data), f = friend(ctx, ui.tkChat);
    if (!f) return roster(ctx);
    const msgs = s.chats[f.id] || [], off = s.offRecord[f.id];
    const buttons = f.kind === 'video' || f.kind === 'voice' ? `${f.kind === 'video' ? `<i class="tk-msep"></i><button data-action="tk-call" data-id="video" aria-label="${e(T(lang, 'Video chat'))}"><img src="${A('ic_start_video_holo_light')}" alt=""></button>` : ''}<i class="tk-msep"></i><button data-action="tk-call" data-id="voice" aria-label="${e(T(lang, 'Voice chat'))}"><img src="${A('ic_start_audio_gray_holo_light')}" alt=""></button>` : '';
    const rows = msgs.map(m => `<div class="tk-msg${m.me ? ' me' : ''}"><img class="tk-badge" src="${A('ic_contact_picture')}" alt=""><p><b>${e(m.me ? 'me' : f.name.split(' ')[0])}:</b> ${smileys(m.body)}</p></div>`).join('');
    const note = off ? `<p class="tk-note">${e(T(lang, 'Chat off record'))}</p>` : '';
    return `<div class="app-view tk tk-chatview" data-no-translate><div class="tk-bar"><span class="tk-who"><b>${e(f.name)}</b><small>${e(f.status || label(lang, f.presence))}</small></span><img class="tk-pres" src="${presenceIcon(f)}" alt="">${buttons}</div><div class="tk-scroll tk-history">${note}${rows}</div><form class="tk-compose" data-form="tk-send"><input name="body" placeholder="${e(T(lang, 'Type to compose'))}" aria-label="${e(T(lang, 'Type to compose'))}" autocomplete="off"><button type="submit">${e(T(lang, 'Send'))}</button></form></div>`;
  }
  // Search (audit step 5): the framework SearchDialog with Talk's hint and history, then search_results.xml.
  function searchDialog(ctx) {
    const {lang, data} = ctx, s = store(data), hint = T(lang, 'Search Google Talk');
    return `<div class="gbbr-search-scrim" data-action="tk-search-cancel"></div><form class="gbbr-search" data-form="tk-search"><div class="gbbr-search-row"><img class="gbbr-search-app" src="assets/talk.png" alt=""><input name="query" autocomplete="off" aria-label="${e(hint)}" placeholder="${e(hint)}"><button class="gbbr-go" type="submit" aria-label="Go"><img src="assets/gb-ic_btn_search_go.png" alt=""></button></div><div class="gbbr-suggest">${(s.searches || []).slice(0, 4).map(q => `<button type="button" class="gbbr-suggestion" data-action="tk-search-run" data-id="${e(q)}"><img src="assets/gb-br-ic_search_category_history.png" alt=""><span><b>${e(q)}</b></span></button>`).join('')}</div></form>`;
  }
  function results(ctx) {
    const {lang, data, ui, locale} = ctx, s = store(data), q = ui.tkQuery.toLocaleLowerCase();
    const hits = Object.keys(s.chats).map(id => ({f: friend(ctx, id), m: [...(s.chats[id] || [])].reverse().find(m => m.body.toLocaleLowerCase().includes(q))})).filter(h => h.f && h.m);
    const rows = hits.map(({f, m}) => `<button class="tk-hit" data-action="tk-chat" data-id="${f.id}"><span class="tk-hit-title"><img src="assets/gb-stat_notify_chat.png" alt=""><b>${e(f.name)}</b></span><span class="tk-hit-snippet">${e(m.body)}</span><span class="tk-hit-meta"><i>${e(m.me ? ctx.account : f.name)}</i><time>${e(new Date(m.time).toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit'}))}</time></span></button>`).join('');
    const title = AndroidStrings.format(T(lang, '%1$s results for "%2$s"'), hits.length, ui.tkQuery);
    return `<div class="app-view tk tk-results" data-no-translate><div class="gb-titlebar">${e(title)}</div><div class="tk-scroll tk-hits">${rows}</div></div>`;
  }
  // AddBuddyScreen, InvitedUserList and the blocked list.
  function addBuddy(ctx) {
    const {lang, ui} = ctx, value = ui.tkInvite || '';
    return `<form class="app-view tk tk-add" data-form="tk-invite" data-no-translate><div class="gb-titlebar">${e(T(lang, 'Invite a friend to chat'))}</div><div class="tk-add-body"><label for="tk-invite">${e(T(lang, 'Send chat invitation to'))}</label><input id="tk-invite" class="gbdlg-input" name="email" value="${e(value)}" autocomplete="off" spellcheck="false"></div><div class="tk-buttonbar"><button type="submit"${value.trim() ? '' : ' disabled'}>${e(T(lang, 'Send invitation'))}</button></div></form>`;
  }
  function people(ctx, title, list) {
    return `<div class="app-view tk tk-people" data-no-translate><div class="gb-titlebar">${e(title)}</div><div class="tk-scroll">${list.map(x => `<div class="tk-invited"><span class="tk-avatar"><img src="${A('ic_contact_picture')}" alt=""></span><span class="tk-text"><b>${e(x.email.split('@')[0])}</b><small>${e(x.email)}</small></span></div>`).join('')}</div></div>`;
  }
  function render(ctx) {
    const {ui, lang, data} = ctx;
    if (ui.tkSub === 'add') return addBuddy(ctx);
    if (ui.tkSub === 'invites') return people(ctx, T(lang, 'Pending invitations'), store(data).invites || []);
    if (ui.tkSub === 'blocked') return people(ctx, T(lang, 'Blocked friends'), []);
    const html = ctx.ui.tkChat ? chat(ctx) : ctx.ui.tkQuery ? results(ctx) : roster(ctx); return ctx.ui.tkSearching ? html.replace(/<\/div>$/, `${searchDialog(ctx)}</div>`) : html; }
  function menu(ctx) {
    const {lang, ui, data} = ctx, t = k => T(lang, k), s = store(data);
    if (ui.tkSub) return [];
    if (ui.tkChat) {
      const f = friend(ctx, ui.tkChat);
      return [
        {action: 'tk-record', title: t(s.offRecord[ui.tkChat] ? 'Chat on record' : 'Chat off record'), icon: s.offRecord[ui.tkChat] ? 'tk-ic_menu_chat_on_record.png' : 'tk-ic_menu_chat_off_record.png'},
        {action: 'tk-switch', title: t('Switch chats'), icon: 'tk-ic_menu_chat_dashboard.png'}, {action: 'tk-roster', title: t('Friends list'), icon: 'tk-ic_menu_friendslist.png'},
        {action: 'tk-unsupported', title: t('Add to chat'), icon: 'ic_menu_add'}, {action: 'tk-end', title: t('End chat'), icon: 'tk-ic_menu_end_conversation.png'},
        ...(f && (f.kind === 'voice' || f.kind === 'video') ? [{action: 'tk-call', id: 'voice', title: t('Voice chat')}] : []),
        {action: 'tk-clear', title: t('Clear chat history'), icon: 'tk-ic_menu_end_conversation.png'}, {action: 'tk-smiley', title: t('Insert smiley'), icon: 'tk-ic_menu_emoticons.png'},
        {action: 'tk-contact', title: t('View contact'), icon: 'tk-ic_menu_contact.png'}, {action: 'tk-unsupported', title: t('Help'), icon: 'ic_menu_help'}];
    }
    return [{action: 'tk-popular', title: t(s.popular ? 'All friends' : 'Most popular'), icon: 'tk-ic_menu_allfriends.png'}, {action: 'tk-add', title: t('Add friend'), icon: 'tk-ic_menu_invite.png'},
      {action: 'tk-search', title: t('Search'), icon: 'ic_menu_search'}, {action: 'tk-unsupported', title: t('Sign out'), icon: 'tk-ic_menu_logout.png'},
      {action: 'tk-unsupported', title: t('Settings'), icon: 'ic_menu_preferences'}, {action: 'tk-end-all', title: t('End all chats'), icon: 'tk-ic_menu_end_all_conversations.png'},
      {action: 'tk-invites', title: t('Invites'), icon: 'tk-ic_menu_invites.png'}, {action: 'tk-blocked', title: t('Blocked'), icon: 'tk-ic_menu_blocked_user.png'},
      {action: 'tk-unsupported', title: t('Help'), icon: 'ic_menu_help'}];
  }
  function dialog(kind, ctx) {
    const {lang, data, ui} = ctx, s = store(data), t = k => T(lang, k);
    if (kind === 'status') return {title: t('Set Status'), items: ['available', 'busy', 'invisible'].map(p => ({action: 'tk-presence', id: p, title: label(lang, p), icon: `gb-presence_${p === 'available' ? 'online' : p}.png`})), custom: `<form data-form="tk-message"><input class="gbdlg-input" name="message" value="${e(s.message)}" placeholder="${e(t('Status message'))}" aria-label="${e(t('Status message'))}" autocomplete="off"></form>`, buttons: [{action: 'tk-message-ok', title: ctx.ok}, {action: 'close-overlay', title: ctx.cancel}]};
    if (kind === 'switch') { const ids = Object.keys(s.chats).filter(id => s.chats[id].length); return {title: t('Switch chats'), items: ids.length ? ids.map(id => ({action: 'tk-chat', id, title: friend(ctx, id)?.name || id, icon: 'tk-status_chat.png'})) : [{action: 'close-overlay', title: t('No active chats')}]}; }
    if (kind === 'smiley') return {title: t('Insert smiley'), items: SMILEYS.map(([img, code]) => ({action: 'tk-insert', id: code, title: code, icon: `tk-emo_im_${img}.png`}))};
    if (kind === 'call') return {title: friend(ctx, ui.tkChat)?.name || '', message: t(ui.tkCall === 'video' ? 'Send video chat invitation?' : 'Send voice chat invitation?'), buttons: [{action: 'tk-call-ok', title: ctx.ok}, {action: 'close-overlay', title: ctx.cancel}]};
    if (kind === 'info') { const f = friend(ctx, ui.tkChat); return f ? {title: t('Friend info'), message: `${f.name}\n${f.email || ''}\n${label(lang, f.presence)}${f.status ? ` – ${f.status}` : ''}`, buttons: [{action: 'close-overlay', title: ctx.ok}]} : null; }
    return null;
  }
  let replyTimer = 0;
  function handle(action, id, ctx) {
    const {ui, data, lang} = ctx, s = store(data), close = () => { ui.overlay = ''; ctx.renderOverlay(); };
    switch (action) {
      case 'tk-chat': close(); ui.tkChat = id; s.chats[id] ||= []; ctx.save(); ctx.render(); ctx.focus('.tk-compose input'); break;
      case 'tk-roster': close(); ui.tkChat = ''; ctx.render(); break;
      case 'tk-status': ctx.dialog('status'); break;
      case 'tk-presence': s.presence = id; ctx.save(); close(); ctx.render(); break;
      case 'tk-message-ok': { const input = document.querySelector('.gbdlg [name=message]'); s.message = (input?.value || '').trim(); ctx.save(); close(); ctx.render(); break; }
      case 'tk-switch': ctx.dialog('switch'); break;
      case 'tk-record': s.offRecord[ui.tkChat] = !s.offRecord[ui.tkChat]; ctx.save(); close(); ctx.render(); break;
      case 'tk-end': delete s.chats[ui.tkChat]; ui.tkChat = ''; ctx.save(); close(); ctx.render(); break;
      case 'tk-end-all': s.chats = {}; ctx.save(); close(); ctx.render(); break;
      case 'tk-clear': s.chats[ui.tkChat] = []; ctx.save(); close(); ctx.render(); break;
      case 'tk-smiley': ctx.dialog('smiley'); break;
      case 'tk-insert': { close(); const input = ctx.root.querySelector('.tk-compose input'); if (input) { input.value = `${input.value}${input.value && !input.value.endsWith(' ') ? ' ' : ''}${id}`; input.focus(); } break; }
      case 'tk-info': ctx.dialog('info'); break;
      case 'tk-call': ui.tkCall = id; ctx.dialog('call'); break;
      case 'tk-call-ok': close(); ctx.toast(T(lang, 'Calling…')); break;
      case 'tk-search': close(); ui.tkSearching = true; ctx.render(); ctx.focus('.gbbr-search input'); break;
      case 'tk-search-cancel': ui.tkSearching = false; ctx.render(); break;
      case 'tk-search-run': ui.tkSearching = false; ui.tkQuery = id; ctx.render(); break;
      case 'tk-unsupported': close(); ctx.toast('This feature is not part of the simulator.'); break;
      case 'tk-popular': s.popular = !s.popular; ctx.save(); close(); ctx.render(); break;
      case 'tk-add': close(); ui.tkSub = 'add'; ui.tkInvite = ''; ctx.render(); ctx.focus('.tk-add input'); break;
      case 'tk-invites': close(); ui.tkSub = 'invites'; ctx.render(); break;
      case 'tk-blocked': close(); ui.tkSub = 'blocked'; ctx.render(); break;
      case 'tk-contact': { close(); const id = Number(ui.tkChat); ctx.openApp('people'); ui.selectedContact = id; ui.sub = 'detail'; ctx.render(); break; }
      default: return false;
    }
    return true;
  }
  function submit(form, values, ctx) {
    const {ui, data} = ctx, s = store(data);
    // AddBuddyScreen.inviteBuddies: each address (a bare name gets @gmail.com), then the screen closes.
    if (form === 'tk-invite') {
      const emails = String(values.get('email') || '').split(/[,;\s]+/).map(x => x.trim()).filter(Boolean).map(x => x.includes('@') ? x : `${x}@gmail.com`);
      if (!emails.length) return true;
      s.invites = [...(s.invites || []).filter(x => !emails.includes(x.email)), ...emails.map(email => ({email, time: Date.now()}))];
      ctx.save(); ui.tkSub = ''; ui.tkInvite = ''; ctx.render(); return true;
    }
    if (form === 'tk-message') { handle('tk-message-ok', null, ctx); return true; }
    if (form === 'tk-search') { const query = String(values.get('query') || '').trim(); if (!query) return true; s.searches = [query, ...(s.searches || []).filter(q => q !== query)].slice(0, 10); ctx.save(); ui.tkSearching = false; ui.tkQuery = query; ctx.render(); return true; }
    if (form !== 'tk-send') return false;
    const body = String(values.get('body') || '').trim(), id = ui.tkChat; if (!body || !id) return true;
    (s.chats[id] ||= []).push({me: true, body, time: Date.now()}); ctx.save(); ctx.render(); ctx.focus('.tk-compose input');
    const f = friend(ctx, id);
    if (f && f.presence !== 'offline') {
      clearTimeout(replyTimer);
      replyTimer = setTimeout(() => { s.chats[id]?.push({me: false, body: REPLIES[(s.chats[id].length + Number(id)) % REPLIES.length], time: Date.now()}); ctx.save(); if (ui.view === 'talk' && ui.tkChat === id) { ctx.render(); ctx.focus('.tk-compose input'); } }, 1800);
    }
    return true;
  }
  function back(ctx) { if (ctx.ui.tkSub) { ctx.ui.tkSub = ''; ctx.render(); return true; } if (ctx.ui.tkSearching) { ctx.ui.tkSearching = false; ctx.render(); return true; } if (ctx.ui.tkChat) { ctx.ui.tkChat = ''; ctx.render(); return true; } if (ctx.ui.tkQuery) { ctx.ui.tkQuery = ''; ctx.render(); return true; } return false; }
  function mounted(ctx) { const invite = ctx.root.querySelector('.tk-add input'); if (invite) invite.addEventListener('input', () => { ctx.ui.tkInvite = invite.value; ctx.root.querySelector('.tk-add [type=submit]').disabled = !invite.value.trim(); }); const box = ctx.root.querySelector('.tk-history'); if (box) box.scrollTop = box.scrollHeight; }
  function open(ctx, resume) { if (!resume) { ctx.ui.tkSub = ''; ctx.ui.tkChat = ''; ctx.ui.tkQuery = ''; ctx.ui.tkSearching = false; } }
  GBApps.register('talk', {render, mounted, menu, dialog, handle, submit, back, open, scroll: '.tk-scroll'});
  window.GBTalk = {T, ROSTER};
})();
