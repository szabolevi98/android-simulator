/* Google's other apps of the Galaxy Nexus image (IMM76I, spring 2012), as working screens in their 2012 looks, with the
   APKs' own colours and texts (docs/apk-strings.py):
   - Google+ 2.4.1 (PlusOne.apk): the home grid (home_screen_*_label) under the #292929 title, the Stream with the
     #3c3c3c tab row and its #dd4b39 line (stream_circles / stream_nearby / stream_whats_hot), posts in #333333 with
     #999999 times and #6f8fc7 links, +1s, Photos (the albums of the simulator's pictures) and Circles.
   - Google Talk (Talk.apk): the friends list with your status on top and presence dots on the roster's #edeff7 rows,
     chats on #eeeeee with the names in chat_from #7785e0 and chat_me #3492c5, "Type message". buddy_list_menu.xml's
     Search (a SearchView: search_extra.xml offers "Search chat history for '…'" and "Send invite to '…'", then
     search_results_fragment.xml / search_results_item.xml under 'Chats matching "…"') and Add friend (AddBuddyScreen:
     add_buddy_custom_actionbar.xml's CANCEL / DONE, "Send chat invitation to", the address field; a bare name gets
     @gmail.com; "Invitation sent."), the overflow with global_options.xml's Settings / Help / Send feedback.
   - YouTube 3.5.5 (Theme.Holo.Light.DarkActionBar on #e6e6e6): the bg_stripes_dark action bar with Search and Record,
     the Home / Browse / Account tabs, video_item.xml rows, and the watch page (watch_activity.xml): the player, the
     #3d3d3d Info / Related / Comments tab row, watch_info.xml with the +1 panel and the Like / Dislike image buttons;
     Add to and Share in the action bar, Like and Dislike in its overflow.
   - Play Books 2.3.6 (BooksTablet.apk): the library as VolumeCarouselFragment shows it (since audit step 9: the
     carousel or, from the overflow, the list, with each book's offline pin) and a reader. Play Movies 1.4.11 (Videos.apk; since audit step 9 from its layouts):
     VideosActivity on its background.png under the logo-only action bar (ActionBar: displayOptions useLogo|showHome),
     the My Rentals / Personal Videos tabs on tab_selected_holo / tab_unselected_holo, rentals_controller.xml's
     no_rentals_layout for an account without rentals (Top Rentals is server data: status.xml's alert_error, the
     error and Retry), local_videos_controller.xml's status for no personal videos; rentals_menu.xml's Shop and
     overflow, then common_menu.xml.
   - Search (Google Search 1.4.1, the Quick Search Box app before Google Now): "Google Search", recent queries and the
     searchable items; a search opens the Browser.
   - Voice Dialer (AOSP packages/apps/VoiceDialer): "Listening…", then "No results, try again." with its tip.
   All content is offline and made up. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const STRINGS = __STRINGS__({
    "Stream": "home_stream_label",
    "Photos": "home_screen_photos_label",
    "Profile": "home_screen_profile_label",
    "Circles": "home_screen_people_label",
    "Messenger": "home_screen_huddle_label",
    "Games": "home_screen_games_label",
    "All circles": "stream_circles",
    "Nearby": "stream_nearby",
    "What's hot": "stream_whats_hot",
    "New post": "menu_post",
    "Your albums": "photos_home_your_albums_label",
    "Photos of you": "photos_home_of_you_label",
    "No posts found.": "no_posts",
    "Just now": "posted_just_now",
    "Friends list": "Talk:menu_view_roster",
    "Available": "Talk:presence_available",
    "Busy": "Talk:presence_busy",
    "Away": "Talk:presence_away",
    "Invisible": "Talk:presence_invisible",
    "Offline": "Talk:presence_offline",
    "Type message": "Talk:compose_hint",
    "Add friend": "Talk:menu_add",
    "End chat": "Talk:menu_end_conversation",
    "Status message": "Talk:custom_status_hint",
    "Home": "YouTube:tab_feed",
    "Browse": "YouTube:tab_categories",
    "Search YouTube": "YouTube:search_hint",
    "Like": "YouTube:menu_like",
    "Dislike": "YouTube:menu_dislike",
    "Share": "YouTube:menu_share",
    "Most viewed": "YouTube:most_viewed_videos",
    "Account": "YouTube:tab_account",
    "Search": "YouTube:menu_search",
    "Record": "YouTube:menu_camera",
    "Settings": "YouTube:menu_settings",
    "Feedback": "YouTube:menu_feedback",
    "Help": "YouTube:menu_help",
    "Add to": "YouTube:menu_add_to",
    "Info": "YouTube:video_info",
    "Related": "YouTube:video_info_related_label_text",
    "Comments": "YouTube:comments",
    "No comments found.": "YouTube:no_comments_found",
    "by": "YouTube:by",
    "Description": "YouTube:description_label_text",
    "Category": "YouTube:category_label_text",
    "%1$,d views | %2$,d likes | %3$,d dislikes": "YouTube:num_views_likes_and_dislikes",
    "You like this video.": "YouTube:rating_like",
    "You dislike this video.": "YouTube:rating_dislike",
    "Your Channel": "YouTube:menu_my_channel",
    "Channel views": "YouTube:channel_stats_views_empty",
    "Uploaded": "YouTube:channel_stats_uploaded_empty",
    "Subscribers": "YouTube:channel_stats_subscribers_empty",
    "Video chat": "Talk:menu_video_chat",
    "Voice chat": "Talk:menu_voice_chat",
    "Display options": "Talk:menu_sort_header",
    "End all chats": "Talk:menu_leave_all_chats",
    "Sign out": "Talk:menu_sign_out",
    "Invites": "Talk:menu_show_invites",
    "Friend info": "Talk:menu_user_info",
    "Add to chat": "Talk:menu_add_contact",
    "Clear chat history": "Talk:menu_clear_chat",
    "Shop": "BooksTablet:menu_shop",
    "Contents": "BooksTablet:menu_table_of_contents",
    "My Rentals": "Videos:tab_rentals",
    "Personal Videos": "Videos:tab_personal_videos",
    "Movies: Shop": "Videos:menu_shop",
    "Welcome!": "Videos:welcome_title",
    "Looks like you don't have any rentals. Touch the shop icon above to browse our full catalog, or select from our most popular rentals below.": "Videos:welcome_instructions",
    "There was a problem with the network": "Videos:error_network",
    "Retry": "Videos:retry",
    "You don't have any personal videos": "Videos:no_local_videos_found",
    "Manage offline rentals": "Videos:menu_manage_offline",
    "Movies: Accounts": "Videos:logout",
    "Movies: Settings": "Videos:menu_settings",
    "Movies: Help": "Videos:menu_help",
    "Movies: Contact us": "Videos:menu_contact",
    "Movies: Send feedback": "Videos:menu_feedback",
    "Google Search": "GoogleQuickSearchBox:google_search_hint",
    "Searchable items": "GoogleQuickSearchBox:search_sources",
    "Listening…": "VoiceDialer:listening",
    "No results, try again.": "VoiceDialer:no_results_tts",
    "Did you know…": "VoiceDialer:tool_tip_title",
    "Search Google Talk": "Talk:search_hint",
    "Search chat history": "Talk:search_chats_line1",
    "for '%1$s'": "Talk:search_chats_line2",
    "Send invite": "Talk:add_friend_line1",
    "to '%1$s'": "Talk:add_friend_line2",
    "Chats matching \"%1$s\"": "Talk:search_results",
    "Invite a friend to chat": "Talk:invite_buddy",
    "Send chat invitation to": "Talk:invite_instruction",
    "Type email address": "Talk:invite_hint",
    "DONE": "Talk:invite_label",
    "CANCEL": "Talk:invite_label_cancel",
    "Invitation sent.": "Talk:invitation_sent",
    "Talk settings": "Talk:menu_settings",
    "Talk help": "Talk:menu_help",
    "Send feedback": "Talk:menu_feedback"
  });
  const LANGS = ['hu', 'de', 'fr', 'es'];
  // English reads the image's own text when it differs from the key (the fifth entry).
  const T = (lang, key) => { const i = LANGS.indexOf(lang); if (lang === 'en' && STRINGS[key]?.[4]) return STRINGS[key][4]; return STRINGS[key] && i >= 0 ? STRINGS[key][i] : STRINGS[key] || lang === 'en' ? key : window.AndroidI18n?.t(key) ?? key; };
  const APPS = ['google-plus', 'talk', 'youtube', 'play-books', 'play-movies', 'search', 'voice-dialer'];
  const AVATAR = 'assets/kem-ic_generic_man.png';
  const hash = text => [...String(text)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const COLORS = ['#3c5a8a', '#7a3a2a', '#2c6e5a', '#5a2a5e', '#8a6a2a', '#2a5a7a'];
  const art = (title, cls) => `<span class="ga-art ${cls}" style="--c:${COLORS[hash(title) % COLORS.length]}"><em>${e(title)}</em></span>`;
  // Action bars: the framework's up caret (ic_ab_back_holo_dark, or _light on the light bar of Books), the
  // apps' own menu icons (ga-<app>-*.png from their APKs) and the Holo overflow button.
  const LIGHT_BARS = ['ga-books-bar'];
  const head = (cls, icon, title, actions = '', up = false) => `<header class="ga-bar ${cls}"><button class="ga-home" data-action="${up ? 'back' : 'home'}" aria-label="${e(title)}">${up ? `<img class="ga-back" src="assets/ga-fw-ic_ab_back_holo_${LIGHT_BARS.includes(cls) ? 'light' : 'dark'}.png" alt="">` : ''}<img src="assets/${icon}.png" alt=""></button><h2>${e(title)}</h2>${actions}</header>`;
  const tabs = (items, current, action) => `<nav class="ga-tabs">${items.map(([id, label]) => `<button class="${id === current ? 'on' : ''}" data-action="${action}" data-id="${e(id)}">${e(label)}</button>`).join('')}</nav>`;
  const icon = (action, label, src) => `<button class="ga-icon" data-action="${action}" aria-label="${e(label)}"><img src="assets/${src}.png" alt=""></button>`;
  const more = (light = false) => `<button class="ga-icon" data-action="ga-menu" aria-label="More options"><img src="assets/ic_menu_moreoverflow_normal_holo_${light ? 'light' : 'dark'}.png" alt=""></button>`;

  // ---- Google+ 2.4.1 ----
  const POSTS = [
    {id: 'p1', name: 'Alex Morgan', time: '2h', text: 'First day with the Galaxy Nexus. Face Unlock actually works!', plus: 12, comments: 3},
    {id: 'p2', name: 'Sam Rivera', time: '5h', text: 'Hangout tonight at 9 — bring snacks and your best bad jokes.', plus: 4, comments: 7},
    {id: 'p3', name: 'Android', time: 'Yesterday', text: 'Android 4.0.4 is rolling out to the Galaxy Nexus: faster camera, better rotation and more.', plus: 2381, comments: 412}
  ];
  function gplus(ctx) {
    const {ui, lang, data} = ctx, sub = ui.gaSub || '';
    if (sub === 'stream') {
      const tab = ui.gaStream || 'All circles', plus = data.gaPlus || [];
      const posts = tab === 'Nearby' ? POSTS.slice(0, 1) : tab === "What's hot" ? POSTS.slice(2) : POSTS;
      return `<div class="app-view ga-app ga-gplus">${head('ga-gp-bar', 'google-plus', T(lang, 'Stream'), icon('ga-unsupported', T(lang, 'New post'), 'ga-gp-ic_menu_new_post_action_bar'), true)}${tabs(['All circles', 'Nearby', "What's hot"].map(t => [t, T(lang, t)]), tab, 'ga-stream')}<div class="ga-scroll ga-gp-stream">${posts.map(p => `<article class="ga-post"><header><img src="${AVATAR}" alt=""><span><b>${e(p.name)}</b><small>${e(p.time)}</small></span></header><p>${e(p.text)}</p><footer><button class="ga-plus${plus.includes(p.id) ? ' on' : ''}" data-action="ga-plus" data-id="${p.id}">+${p.plus + (plus.includes(p.id) ? 1 : 0)}</button><span><img src="assets/ga-gp-ic_comment.png" alt=""> ${p.comments}</span></footer></article>`).join('')}</div></div>`;
    }
    if (sub === 'photos') return `<div class="app-view ga-app ga-gplus">${head('ga-gp-bar', 'google-plus', T(lang, 'Photos'), '', true)}<div class="ga-scroll ga-gp-photos"><h3>${e(T(lang, 'Your albums'))}</h3><div class="ga-grid">${(data.photos || []).map(p => `<span class="ga-photo" style="background:linear-gradient(135deg,${p.colors?.[0] || '#555'},${p.colors?.[2] || '#222'})"><em>${e(p.name)}</em></span>`).join('')}</div></div></div>`;
    if (sub === 'circles') return `<div class="app-view ga-app ga-gplus">${head('ga-gp-bar', 'google-plus', T(lang, 'Circles'), '', true)}<div class="ga-scroll">${(data.contacts || []).map(c => `<div class="ga-person"><img src="${AVATAR}" alt=""><b>${e(c.name)}</b></div>`).join('')}</div></div>`;
    // home_screen_*_icon_default (xhdpi 128 px) over the labels.
    const tile = (id, label, src) => `<button class="ga-gp-tile" data-action="ga-gp-open" data-id="${id}"><img src="assets/ga-gp-home_screen_${src}_icon_default.png" alt=""><b>${e(T(lang, label))}</b></button>`;
    return `<div class="app-view ga-app ga-gplus ga-gp-home">${head('ga-gp-bar', 'google-plus', 'Google+')}<div class="ga-gp-grid">${tile('stream', 'Stream', 'stream')}${tile('photos', 'Photos', 'photos')}${tile('profile', 'Profile', 'profile')}${tile('circles', 'Circles', 'people')}${tile('messenger', 'Messenger', 'huddle')}${tile('games', 'Games', 'games')}</div></div>`;
  }

  // ---- Google Talk ----
  const PRESENCE = {1: 'Available', 2: 'Away', 3: 'Busy', 4: 'Offline'};
  function talk(ctx) {
    const {ui, lang, data} = ctx, chats = data.talkChats || [];
    if (ui.gaSub === 'chat') {
      const person = data.contacts.find(c => String(c.id) === String(ui.gaChat)) || {name: '?'};
      const msgs = chats.filter(m => String(m.contact) === String(ui.gaChat));
      return `<div class="app-view ga-app ga-talk">${head('ga-talk-bar', 'talk', person.name, icon('ga-unsupported', T(lang, 'Video chat'), 'ga-tk-ic_video_default_holo_dark') + icon('ga-unsupported', T(lang, 'Voice chat'), 'ga-tk-ic_audio_default_holo_dark') + more(), true)}<div class="ga-scroll ga-talk-chat">${msgs.map(m => `<p class="${m.mine ? 'me' : 'from'}"><b>${e(m.mine ? 'me' : person.name.split(' ')[0])}:</b> ${e(m.body)}</p>`).join('')}</div><form class="ga-talk-compose" data-form="ga-talk"><input name="body" autocomplete="off" placeholder="${e(T(lang, 'Type message'))}" aria-label="${e(T(lang, 'Type message'))}"><button type="submit" aria-label="Send"><img src="assets/ga-tk-ic_send_holo_light.png" alt=""></button></form></div>`;
    }
    if (ui.gaSub === 'add') {
      const value = ui.gaInvite || '';
      return `<form class="app-view ga-app ga-talk ga-tk-add" data-form="ga-talk-invite"><header class="ga-bar ga-talk-bar ga-tk-addbar"><button type="button" data-action="ga-talk-add-cancel"><img src="assets/ga-tk-ic_menu_cancel_holo_dark.png" alt=""><span>${e(T(lang, 'CANCEL'))}</span></button><i></i><button type="submit"><img src="assets/ga-tk-ic_menu_done_holo_dark.png" alt=""><span>${e(T(lang, 'DONE'))}</span></button></header><label class="ga-tk-add-label" for="ga-tk-invite">${e(T(lang, 'Send chat invitation to'))}</label><input id="ga-tk-invite" class="ga-tk-add-field" name="email" value="${e(value)}" placeholder="${e(T(lang, 'Type email address'))}" autocomplete="off" spellcheck="false"></form>`;
    }
    // The SearchView expanded in the bar, with search_extra.xml's two rows once there is text.
    if (ui.gaSub === 'search') {
      const q = ui.gaTalkQ || '', rows = q ? [['ga-talk-search-run', 'ic_menu_search_holo_light', 'Search chat history', "for '%1$s'"], ['ga-talk-invite-from', 'ic_menu_invite', 'Send invite', "to '%1$s'"]].map(([action, img, one, two]) => `<button class="ga-tk-extra" data-action="${action}" data-id="${e(q)}"><img src="assets/ga-tk-${img}.png" alt=""><span><b>${e(T(lang, one))}</b><small>${e(T(lang, two).replace('%1$s', q))}</small></span></button>`).join('') : '';
      return `<div class="app-view ga-app ga-talk"><form class="ga-bar ga-talk-bar ga-tk-sv" data-form="ga-talk-search"><button type="button" class="ga-home" data-action="back" aria-label="${e(T(lang, 'Search'))}"><img class="ga-back" src="assets/ga-fw-ic_ab_back_holo_dark.png" alt=""><img src="assets/talk.png" alt=""></button><input name="query" value="${e(q)}" placeholder="${e(T(lang, 'Search Google Talk'))}" autocomplete="off" spellcheck="false"></form><div class="ga-scroll ga-tk-extras">${rows}</div></div>`;
    }
    // SearchActivity: the chats whose messages match, newest message first.
    if (ui.gaSub === 'results') {
      const q = (ui.gaTalkQ || '').toLocaleLowerCase(), hits = data.contacts.map(c => ({c, m: chats.filter(m => String(m.contact) === String(c.id) && m.body.toLocaleLowerCase().includes(q)).pop()})).filter(h => h.m);
      return `<div class="app-view ga-app ga-talk">${head('ga-talk-bar', 'talk', T(lang, 'Chats matching "%1$s"').replace('%1$s', ui.gaTalkQ || ''), '', true)}<div class="ga-tk-results-head"><span></span><span>${hits.length}</span></div><div class="ga-scroll ga-tk-results">${hits.map(({c, m}) => `<button class="ga-tk-hit" data-action="ga-talk-open" data-id="${c.id}"><b>${e(c.name)}</b><span>${e(m.body)}</span><small><img src="assets/ga-tk-ic_email_caret_double.png" alt="">${e(m.mine ? ctx.account : c.name)}</small></button>`).join('')}</div></div>`;
    }
    const status = ctx.ui.gaPresence || 'Available';
    return `<div class="app-view ga-app ga-talk">${head('ga-talk-bar', 'talk', T(lang, 'Friends list'), icon('ga-talk-search', T(lang, 'Search'), 'ga-tk-ic_menu_search_holo_dark') + icon('ga-talk-add', T(lang, 'Add friend'), 'ga-tk-ic_menu_add_buddy_holo_light') + more())}<button class="ga-talk-self" data-action="ga-presence"><img src="${AVATAR}" alt=""><span><b>${e(ctx.account)}</b><small><i class="dot ${status.toLowerCase()}"></i>${e(T(lang, status))}</small></span></button><div class="ga-scroll">${data.contacts.map(c => { const p = PRESENCE[c.id] || 'Offline'; return `<button class="ga-buddy ${p === 'Offline' ? 'off' : ''}" data-action="ga-talk-open" data-id="${c.id}"><img src="${AVATAR}" alt=""><span><b>${e(c.name)}</b><small>${e(T(lang, p))}</small></span><i class="dot ${p.toLowerCase()}"></i></button>`; }).join('')}</div></div>`;
  }

  // ---- YouTube 3.5.5 ----
  const VIDEOS = [
    {id: 'v1', title: 'Galaxy Nexus — hands-on and first impressions', channel: 'Gadget Weekly', views: 1204311, likes: 8312, dislikes: 214, len: '8:42', hd: true, added: '2011-11-21', category: 'Science & Technology', text: 'Our first day with the Galaxy Nexus and Ice Cream Sandwich: the screen, the camera and Face Unlock.'},
    {id: 'v2', title: 'Ice Cream Sandwich: 10 tips for Android 4.0', channel: 'Droid Corner', views: 486020, likes: 5120, dislikes: 61, len: '6:15', hd: true, added: '2012-01-09', category: 'Howto & Style', text: 'Folders, the people app, screenshots, data usage and six more things to try.'},
    {id: 'v3', title: 'Panorama mode test on a mountain trail', channel: 'Trail & Summit', views: 52977, likes: 640, dislikes: 9, len: '3:08', hd: false, added: '2012-03-18', category: 'Travel & Events', text: 'One sweep from the ridge with the stock camera.'}
  ];
  const num = (lang, n) => Number(n).toLocaleString(lang === 'en' ? 'en-US' : lang);
  const ytRating = (data, id) => (data.gaYtRatings || {})[id] || ((data.gaYtLikes || []).includes(id) ? 'like' : '');
  // The bar is bg_stripes_dark tiled; the top level shows the launcher icon (ActionBar.TopLevel has no logo), other
  // screens the up caret and ic_logo_square, with no title (displayOptions useLogo | showHome).
  const ytBar = (up, actions) => `<header class="ga-bar ga-yt-bar"><button class="ga-home" data-action="${up ? 'back' : 'home'}" aria-label="YouTube">${up ? '<img class="ga-back" src="assets/ga-fw-ic_ab_back_holo_dark.png" alt=""><img src="assets/ga-yt-ic_logo_square.png" alt="">' : '<img src="assets/youtube.png" alt="">'}</button><span class="ga-yt-fill"></span>${actions}</header>`;
  const ytItem = (lang, v) => `<button class="ga-yt-row" data-action="ga-yt-watch" data-id="${v.id}"><span class="ga-yt-thumb">${art(v.title, 'thumb')}<i>${e(v.len)}</i></span><span class="ga-yt-details"><b>${e(v.title)}</b><small>${e(v.channel)}</small><small>${e(T(lang, '%1$,d views | %2$,d likes | %3$,d dislikes').split(' | ')[0].replace('%1$,d', num(lang, v.views)))}${v.hd ? '<img src="assets/ga-yt-ic_hd.png" alt="HD">' : ''}</small></span></button>`;
  function youtube(ctx) {
    const {ui, lang, data} = ctx;
    if (ui.gaSub === 'watch') {
      const v = VIDEOS.find(x => x.id === ui.gaVideo) || VIDEOS[0], rating = ytRating(data, v.id), plus = (data.gaYtPlus || []).includes(v.id);
      const wtab = ui.gaYtWatchTab || 'info', likes = v.likes + (rating === 'like'), dislikes = v.dislikes + (rating === 'dislike');
      const stats = T(lang, '%1$,d views | %2$,d likes | %3$,d dislikes').replace('%1$,d', num(lang, v.views)).replace('%2$,d', num(lang, likes)).replace('%3$,d', num(lang, dislikes));
      const rate = (kind, label) => `<button class="ga-yt-rate" data-action="ga-yt-rate" data-id="${kind}" aria-label="${e(T(lang, label))}"${rating ? ' disabled' : ''}><img src="assets/ga-yt-ic_${kind}${rating ? '_disabled' : ''}.png" alt=""></button>`;
      const info = `<div class="ga-yt-info"><h3>${e(v.title)}</h3><small>${e(new Date(v.added + 'T12:00').toLocaleDateString(lang === 'en' ? 'en-US' : lang, {year: 'numeric', month: 'short', day: 'numeric'}))}</small><small>${e(stats)}</small><div class="ga-yt-panel"><button class="ga-yt-plus" data-action="ga-yt-plus" aria-label="+1"><img src="assets/ga-yt-ic_plusone_standard_${plus ? 'on' : 'off'}.png" alt=""></button><i></i>${rate('like', 'Like')}${rate('dislike', 'Dislike')}</div><button class="ga-yt-channel" data-action="ga-unsupported">${e(T(lang, 'by'))} <b>${e(v.channel)}</b></button><h4>${e(T(lang, 'Description'))}</h4><p>${e(v.text)}</p><h4>${e(T(lang, 'Category'))}</h4><p class="dim">${e(v.category)}</p></div>`;
      const pane = wtab === 'related' ? VIDEOS.filter(x => x.id !== v.id).map(x => ytItem(lang, x)).join('') : wtab === 'comments' ? `<p class="ga-yt-none">${e(T(lang, 'No comments found.'))}</p>` : info;
      return `<div class="app-view ga-app ga-yt">${ytBar(true, icon('ga-unsupported', T(lang, 'Add to'), 'ga-yt-ic_menu_add_to_playlist') + icon('ga-unsupported', T(lang, 'Share'), 'ga-yt-ic_menu_share') + more())}<button class="ga-yt-video${ui.gaPaused ? ' paused' : ''}" data-action="ga-yt-toggle">${art(v.title, 'wide')}<img src="assets/ga-yt-ic_vidcontrol_${ui.gaPaused ? 'play' : 'pause'}.png" alt=""></button><nav class="ga-yt-tabrow">${[['info', 'Info'], ['related', 'Related'], ['comments', 'Comments']].map(([id, label]) => `<button class="${id === wtab ? 'on' : ''}" data-action="ga-yt-wtab" data-id="${id}">${e(T(lang, label))}</button>`).join('')}</nav><div class="ga-scroll ga-yt-pane">${pane}</div></div>`;
    }
    const tab = ui.gaYtTab || 'Home';
    const body = tab === 'Account'
      ? `<div class="ga-yt-channelhead"><img src="${AVATAR}" alt=""><span><b>${e(ctx.account)}</b><small>${e(T(lang, 'Channel views'))}</small><small>${e(T(lang, 'Uploaded'))}</small><small>${e(T(lang, 'Subscribers'))}</small></span></div>`
      : `${tab === 'Browse' ? `<h3 class="ga-yt-head">${e(T(lang, 'Most viewed'))}</h3>` : ''}${(tab === 'Home' ? VIDEOS : [...VIDEOS].sort((a, b) => b.views - a.views)).map(v => ytItem(lang, v)).join('')}`;
    return `<div class="app-view ga-app ga-yt">${ytBar(false, icon('ga-unsupported', T(lang, 'Search'), 'ga-yt-ic_menu_search') + icon('ga-unsupported', T(lang, 'Record'), 'ga-yt-ic_menu_capture') + more())}<nav class="ga-yt-tabs">${[['Home', 'Home'], ['Browse', 'Browse'], ['Account', 'Account']].map(([id, label]) => `<button class="${id === tab ? 'on' : ''}" data-action="ga-yt-tab" data-id="${id}">${e(T(lang, label))}</button>`).join('')}</nav><div class="ga-scroll">${body}</div></div>`;
  }
  // The action bar overflow of the screen on show (the apps' menu XML; showAsAction="never" items).
  function menu(ctx) {
    const {ui, lang} = ctx, item = (action, title, id = '') => ({action, title: T(lang, title), id});
    // Play Books' fragment_reader.xml: Contents is the action item; the rest of reader_items fills the overflow.
    if (ctx.view === 'play-books' && ui.gaSub === 'read') return [['ga-bk-options', 'Display options'], ['ga-unsupported', 'About the book'], ['ga-unsupported', 'Share'], ['ga-unsupported', 'Available offline'], ['ga-unsupported', 'Read aloud'], ['ga-unsupported', 'Help']].map(([action, key]) => ({action, title: BS(lang, key), id: ''}));
    if (ctx.view === 'play-books') return [['ga-unsupported', 'Refresh'], ['ga-unsupported', 'Accounts'], ['ga-unsupported', 'Help'], ['ga-unsupported', 'Make available offline'], ctx.data?.gaBkView === 'list' ? ['ga-bk-view', 'View as carousel'] : ['ga-bk-view', 'View as list']].map(([action, key]) => ({action, title: BS(lang, key), id: ''}));
    if (ctx.view === 'play-movies') return ['Manage offline rentals', 'Movies: Accounts', 'Movies: Settings', 'Movies: Help', 'Movies: Contact us', 'Movies: Send feedback'].map(key => item('ga-unsupported', key));
    if (ctx.view === 'youtube') return ui.gaSub === 'watch' ? [item('ga-yt-rate', 'Like', 'like'), item('ga-yt-rate', 'Dislike', 'dislike')] : [item('ga-unsupported', 'Settings'), item('ga-unsupported', 'Feedback'), item('ga-unsupported', 'Help')];
    if (ctx.view === 'talk') return ui.gaSub === 'chat' ? [item('ga-talk-end', 'End chat'), item('ga-unsupported', 'Friend info'), item('ga-unsupported', 'Add to chat'), item('ga-talk-clear', 'Clear chat history')]
      : [item('ga-unsupported', 'Display options'), item('ga-talk-end-all', 'End all chats'), item('ga-unsupported', 'Sign out'), item('ga-unsupported', 'Talk settings'), item('ga-unsupported', 'Talk help'), item('ga-unsupported', 'Send feedback')];
    return [];
  }

  // ---- Play Books 2.3.6 ----
  // BooksTablet.apk's own strings (stock-strings.js, group books).
  const BS = (lang, key) => { const row = window.StockStrings?.books?.[key], i = LANGS.indexOf(lang); return row ? (i >= 0 ? row[i] : row[4] || key) : key; };
  const BOOKS = [
    {id: "b1", title: "Alice’s Adventures in Wonderland", author: "Lewis Carroll", pages: [
      "CHAPTER I.\nDown the Rabbit-Hole",
      "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, “and what is the use of a book,” thought Alice “without pictures or conversations?”",
      "So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.",
      "There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, “Oh dear! Oh dear! I shall be late!”",
      "CHAPTER II.\nThe Pool of Tears",
      "“Curiouser and curiouser!” cried Alice (she was so much surprised, that for the moment she quite forgot how to speak good English); “now I’m opening out like the largest telescope that ever was! Good-bye, feet!”",
      "CHAPTER III.\nA Caucus-Race and a Long Tale",
      "They were indeed a queer-looking party that assembled on the bank—the birds with draggled feathers, the animals with their fur clinging close to them, and all dripping wet, cross, and uncomfortable."]},
    {id: "b2", title: "The Adventures of Sherlock Holmes", author: "Arthur Conan Doyle", pages: [
      "I. A Scandal in Bohemia",
      "To Sherlock Holmes she is always the woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex.",
      "It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind.",
      "II. The Red-Headed League",
      "I had called upon my friend, Mr. Sherlock Holmes, one day in the autumn of last year and found him in deep conversation with a very stout, florid-faced, elderly gentleman with fiery red hair."]}
  ];
  // Each chapter opens on its heading page; the Contents popup lists them.
  BOOKS.forEach(book => { book.starts = book.pages.map((page, i) => /^(CHAPTER [IVX]+\.|Chapter \d+|\d+\. |[IVX]+\. )/.test(page) ? i : -1).filter(i => i >= 0); });
  // LocalPreferences: themes 0 Day / 1 Night, typeface2, justification2, the window brightness (-1 follows the system),
  // textZoom (TextZoomPreference: steps of 0.1, never below 0.1) and lineHeight2 (LineHeightPreference: 1.55, which is
  // also the least, in steps of 0.25).
  const BOOK_PREFS = {theme: '0', typeface: 'default', justification: 'default', brightness: -1, textZoom: 1, lineHeight: 1.55};
  const ZOOM_STEP = .1, LINE_STEP = .25, LINE_MIN = 1.55;
  const bookPrefs = data => ({...BOOK_PREFS, ...(data.gaBookPrefs || {})});
  function stepPref(pr, key, dir) {
    if (key === 'textZoom') return dir < 0 && pr.textZoom <= ZOOM_STEP + 1e-6 ? pr.textZoom : Math.max(ZOOM_STEP, Math.round((pr.textZoom + dir * ZOOM_STEP) * 10) / 10);
    return Math.max(LINE_MIN, Math.round((pr.lineHeight + dir * LINE_STEP) * 100) / 100);
  }
  // TabletSpinnerPreference rows: arrays themes / typeface / justification with their entryIcons.
  const PREF_SPINNERS = {
    theme: [['Day', 'Night'], ['0', '1'], ['day', 'night']],
    typeface: [['Default', 'Sans', 'Serif', 'Merriweather', 'Sorts Mill Goudy', 'Vollkorn'], ['default', 'sans', 'serif', 'Merriweather', 'OFLGoudyStMTT', 'Vollkorn'], ['default', 'font', 'font', 'font', 'font', 'font']],
    justification: [['Default', 'Left', 'Justify'], ['default', 'left', 'justify'], ['default', 'align_left', 'align_justified']]
  };
  // ReaderSettingsFragment (layout-port/fragment_reader_settings.xml): the settings_panel under the action bar with the
  // THEME, TYPEFACE, TEXT ALIGNMENT and BRIGHTNESS rows in one column, then FONT SIZE and LINE HEIGHT side by side
  // (Preference.SegmentedButtons with the smaller / larger icons).
  function bookSettings(lang, ui, pr) {
    const b = key => BS(lang, key), open = ui.gaBkSpin;
    const head = key => `<b class="ga-bk-sub">${e(b(key))}</b>`;
    const spinner = key => {
      const [entries, values, icons] = PREF_SPINNERS[key], at = Math.max(0, values.indexOf(String(pr[key])));
      const iconOf = n => `<img src="assets/ga-bk-23-ic_settings_${icons[n]}_on.png" alt="">`;
      return `<div class="ga-bk-spin-wrap"><button class="ga-bk-spin" data-action="ga-bk-spin" data-id="${key}">${iconOf(at)}<span>${e(b(entries[at]))}</span></button>${open === key ? `<div class="ga-bk-drop">${entries.map((entry, n) => `<button data-action="ga-bk-pref" data-id="${key}:${values[n]}">${iconOf(n)}<span>${e(b(entry))}</span></button>`).join('')}</div>` : ''}</div>`;
    };
    const auto = pr.brightness < 0;
    const bright = `<div class="ga-bk-bright"><button class="ga-bk-auto${auto ? ' on' : ''}" data-action="ga-bk-auto" aria-pressed="${auto}"><span>${e(b('AUTO'))}</span></button><input type="range" min="5" max="100" value="${auto ? 100 : pr.brightness}" data-ga-bk-bright aria-label="${e(b('BRIGHTNESS'))}"${auto ? ' disabled' : ''}></div>`;
    const seg = (key, kind, smaller, larger, canSmaller) => `<div class="ga-bk-seg"><button data-action="ga-bk-step" data-id="${key}:-1" aria-label="${e(b(smaller))}"${canSmaller ? '' : ' disabled'}><img src="assets/ga-bk-23-ic_settings_${kind}_smaller_${canSmaller ? 'on' : 'off'}.png" alt=""></button><button data-action="ga-bk-step" data-id="${key}:1" aria-label="${e(b(larger))}"><img src="assets/ga-bk-23-ic_settings_${kind}_larger_on.png" alt=""></button></div>`;
    return `<div class="ga-bk-settings-scrim" data-action="ga-bk-options"></div><div class="ga-bk-settings"><div class="ga-bk-col">${head('THEME')}${spinner('theme')}<i></i>${head('TYPEFACE')}${spinner('typeface')}<i></i>${head('TEXT ALIGNMENT')}${spinner('justification')}<i></i>${head('BRIGHTNESS')}${bright}</div><i></i><div class="ga-bk-cols"><div class="ga-bk-col">${head('FONT SIZE')}${seg('textZoom', 'fontsize', 'Decrease font size', 'Increase font size', pr.textZoom > ZOOM_STEP + 1e-6)}</div><div class="ga-bk-col">${head('LINE HEIGHT')}${seg('lineHeight', 'lineheight', 'Decrease line height', 'Increase line height', pr.lineHeight > LINE_MIN + 1e-6)}</div></div></div>`;
  }
  // TableOfContentsActionItem.show: a ListPopupWindow (300 dp) under the button with list_item_navigation.xml rows, the
  // current chapter's title and page bold.
  function bookContents(book, index) {
    const current = book.starts.filter(start => start <= index).length - 1;
    return `<div class="ga-bk-toc-scrim" data-action="ga-bk-toc"></div><div class="ga-bk-toc">${book.starts.map((start, n) => `<button class="${n === current ? 'current' : ''}" data-action="ga-bk-chapter" data-id="${start}"><span>${e(book.pages[start].replace(/\n/g, ' '))}</span><em>${start + 1}</em></button>`).join('')}</div>`;
  }
  function books(ctx) {
    const {ui, lang, data} = ctx;
    if (ui.gaSub === 'read') {
      const b = BOOKS.find(x => x.id === ui.gaBook) || BOOKS[0], page = Math.min((data.gaBookPages || {})[b.id] || 0, b.pages.length - 1), pr = bookPrefs(data);
      const text = b.pages[page].split('\n').filter(Boolean).map((p, i) => b.starts.includes(page) ? `<h3${i ? ' class="sub"' : ''}>${e(p)}</h3>` : `<p>${e(p)}</p>`).join('');
      const style = `--bk-zoom:${pr.textZoom};--bk-lh:${(pr.lineHeight / 1.55).toFixed(4)};--bk-dim:${pr.brightness < 0 ? 0 : ((100 - pr.brightness) / 100 * .7).toFixed(3)}`;
      return `<div class="app-view ga-app ga-books ga-bk-reader ga-bk-${pr.theme === '1' ? 'night' : 'day'} ga-bk-face-${e(pr.typeface)} ga-bk-just-${e(pr.justification)}" style="${style}">${head('ga-books-bar', 'play-books', b.title, icon('ga-bk-toc', BS(lang, 'Contents'), 'ga-bk-ic_menu_toc_light') + more(true), true)}<button class="ga-page" data-action="ga-book-turn"><span class="ga-bk-text">${text}</span><small>${page + 1} / ${b.pages.length}</small></button>${ui.gaBkToc ? bookContents(b, page) : ''}${ui.gaBkOptions ? bookSettings(lang, ui, pr) : ''}<div class="ga-bk-dim"></div></div>`;
    }
    /* The library (Theme.Light: the action bar overlays carousel_bg; home.xml's Shop and Search in the bar).
       LocalPreferences' default view mode is "carousel": the covers on a turntable over volume_detail_view.xml (the btn_pin
       offline toggle, the 14 sp bold title and 14 sp author); "View as list" switches to fragment_carousel.xml's
       ListView of books_list_item.xml rows (36 dp cover, List.TitleText medium bold and List.AuthorText small at 75 %,
       the 30 dp pin). The covers are drawn: the books are public-domain demo texts without cover art. */
    const pinned = data.gaBkPinned || {}, pin = b => `<button class="ga-bk-pin${pinned[b.id] ? ' on' : ''}" data-action="ga-bk-pin" data-id="${b.id}" aria-pressed="${!!pinned[b.id]}" aria-label="${e(BS(lang, 'Make available offline'))}"></button>`;
    const bar = head('ga-books-bar', 'play-books', 'Play Books', icon('ga-shop', T(lang, 'Shop'), 'ga-bk-ic_menu_market_light') + icon('ga-unsupported', BS(lang, 'Search'), 'ga-bk-ic_menu_search_light') + more(true));
    if (data.gaBkView === 'list') return `<div class="app-view ga-app ga-books ga-bk-home">${bar}<div class="ga-scroll ga-bk-list">${BOOKS.map(b => `<div class="ga-bk-row"><button class="ga-bk-open" data-action="ga-book" data-id="${b.id}">${art(b.title, 'ga-bk-cover')}<span><b>${e(b.title)}</b><small>${e(b.author)}</small></span></button>${pin(b)}</div>`).join('')}</div></div>`;
    const at = Math.min(Math.max(ui.gaBkAt || 0, 0), BOOKS.length - 1), b = BOOKS[at];
    const covers = BOOKS.map((x, i) => `<button class="ga-bk-slot" style="--d:${i - at};--a:${Math.min(1, Math.abs(i - at))};z-index:${10 - Math.abs(i - at)}" data-action="${i === at ? 'ga-book' : 'ga-bk-at'}" data-id="${i === at ? x.id : i}" aria-label="${e(x.title)}">${art(x.title, 'ga-bk-cover')}</button>`).join('');
    return `<div class="app-view ga-app ga-books ga-bk-home">${bar}<div class="ga-bk-carousel">${covers}</div><div class="ga-bk-detail">${pin(b)}<b>${e(b.title)}</b><span>${e(b.author)}</span></div></div>`;
  }

  // ---- Play Movies 1.4.11 ----
  // status.xml: the 15 dp light_grey message between alert_error and Retry, centred.
  const mvStatus = (lang, message, error = false) => `<div class="ga-mv-status">${error ? '<img src="assets/ga-mv-alert_error.png" alt="">' : ''}<span>${e(T(lang, message))}</span>${error ? `<button class="ga-mv-retry" data-action="ga-unsupported">${e(T(lang, 'Retry'))}</button>` : ''}</div>`;
  function movies(ctx) {
    const {ui, lang} = ctx, tab = ui.gaMoviesTab || 'rentals';
    const body = tab === 'rentals'
      ? `<h3 class="ga-mv-welcome">${e(T(lang, 'Welcome!'))}</h3><p class="ga-mv-intro">${e(T(lang, "Looks like you don't have any rentals. Touch the shop icon above to browse our full catalog, or select from our most popular rentals below."))}</p><hr class="ga-mv-rule">${mvStatus(lang, 'There was a problem with the network', true)}`
      : mvStatus(lang, "You don't have any personal videos");
    return `<div class="app-view ga-app ga-movies"><header class="ga-bar ga-movies-bar"><button class="ga-home" data-action="home" aria-label="${e(T(lang, 'Play Movies'))}"><img src="assets/play-movies.png" alt=""></button><span class="ga-mv-fill"></span>${icon('ga-shop', T(lang, 'Movies: Shop'), 'ga-mv-ic_menu_shop_holo_dark')}${more()}</header><nav class="ga-mv-tabs">${[['rentals', 'My Rentals'], ['personal', 'Personal Videos']].map(([id, label]) => `<button class="${id === tab ? 'on' : ''}" data-action="ga-movies-tab" data-id="${id}">${e(T(lang, label))}</button>`).join('')}</nav><div class="ga-scroll ga-mv-page${tab === 'personal' ? ' ga-mv-empty' : ''}">${body}</div></div>`;
  }

  // ---- Google Search 1.4.1 (Quick Search Box) ----
  function search(ctx) {
    const {lang, data} = ctx, recent = data.gaSearches || ['nexus 4 release date', 'ice cream sandwich update', 'weather'];
    return `<div class="app-view ga-app ga-search"><form class="ga-qsb" data-form="ga-search"><img src="assets/search.png" alt=""><input name="query" autocomplete="off" placeholder="${e(T(lang, 'Google Search'))}" aria-label="${e(T(lang, 'Google Search'))}"><button type="submit" aria-label="Search"><img src="assets/ga-qsb-ic_search_normal.png" alt=""></button></form><div class="ga-scroll">${recent.map(q => `<button class="ga-suggest" data-action="ga-search-run" data-id="${e(q)}"><img src="assets/ga-qsb-ic_history_suggestion_normal.png" alt="">${e(q)}</button>`).join('')}<button class="ga-suggest ga-sources" data-action="ga-unsupported">${e(T(lang, 'Searchable items'))}</button></div></div>`;
  }

  // ---- Voice Dialer (AOSP) ----
  function voiceDialer(ctx) {
    const {ui, lang} = ctx, failed = ui.gaVoice === 'failed';
    return `<div class="app-view ga-app ga-voice"><h2>${e(T(lang, 'Voice Dialer'))}</h2><button class="ga-voice-mic" data-action="ga-voice-listen" aria-label="${e(T(lang, 'Listening…'))}"><img src="assets/ga-vd-ic_vd_${failed ? 'retry' : 'mic_on'}.png" alt=""></button><p>${e(T(lang, failed ? 'No results, try again.' : 'Listening…'))}</p><div class="ga-voice-tip"><b>${e(T(lang, 'Did you know…'))}</b><span>“Call Alex Morgan”, “Dial 202-555-0148”, “Open Calendar”</span></div></div>`;
  }

  function render(app, ctx) {
    return ({'google-plus': gplus, talk, youtube, 'play-books': books, 'play-movies': movies, search, 'voice-dialer': voiceDialer}[app] || (() => ''))(ctx);
  }
  // ctx: {data, ui, lang, account, save, render, toast, openApp, browse(query), listen()}.
  function handle(action, id, ctx) {
    const {ui, data} = ctx;
    switch (action) {
      case 'ga-gp-open': if (['stream', 'photos', 'circles'].includes(id)) { ui.gaSub = id; ctx.render(); } else if (id === 'messenger') ctx.openApp('messenger'); else ctx.toast('This feature is not part of the simulator.'); break;
      case 'ga-stream': ui.gaStream = id; ctx.render(); break;
      case 'ga-plus': { const list = data.gaPlus || []; data.gaPlus = list.includes(id) ? list.filter(x => x !== id) : [...list, id]; ctx.save(); ctx.render(); break; }
      case 'ga-presence': ui.gaPresence = {Available: 'Busy', Busy: 'Invisible', Invisible: 'Available'}[ui.gaPresence || 'Available']; ctx.render(); break;
      case 'ga-talk-open': ui.gaChat = id; ui.gaSub = 'chat'; ctx.render(); break;
      case 'ga-talk-search': ui.gaSub = 'search'; ui.gaTalkQ = ''; ctx.render(); ctx.focus?.('.ga-tk-sv input'); break;
      case 'ga-talk-search-run': ui.gaTalkQ = id; ui.gaSub = 'results'; ctx.render(); break;
      case 'ga-talk-add': ui.gaSub = 'add'; ui.gaInvite = ''; ctx.render(); ctx.focus?.('.ga-tk-add-field'); break;
      case 'ga-talk-invite-from': ui.gaSub = 'add'; ui.gaInvite = id; ctx.render(); break;
      case 'ga-talk-add-cancel': ui.gaSub = ''; ctx.render(); break;
      case 'ga-menu': ui.overlay = 'ga-menu'; ctx.renderOverlay(); break;
      case 'ga-talk-end': case 'ga-talk-end-all': ctx.closeOverlay(); ui.gaSub = ''; ctx.render(); break;
      case 'ga-talk-clear': ctx.closeOverlay(); data.talkChats = (data.talkChats || []).filter(m => String(m.contact) !== String(ui.gaChat)); ctx.save(); ctx.render(); break;
      case 'ga-yt-tab': ui.gaYtTab = id; ctx.render(); break;
      case 'ga-yt-watch': ui.gaVideo = id; ui.gaPaused = false; ui.gaYtWatchTab = 'info'; ui.gaSub = 'watch'; ctx.render(); break;
      case 'ga-yt-wtab': ui.gaYtWatchTab = id; ctx.render(); break;
      case 'ga-yt-toggle': ui.gaPaused = !ui.gaPaused; ctx.render(); break;
      // A rating is final (the buttons turn ic_like_disabled / ic_dislike_disabled) and toasts rating_like / rating_dislike.
      case 'ga-yt-rate': {
        ctx.closeOverlay(); const v = ui.gaVideo || VIDEOS[0].id; if (ytRating(data, v)) break;
        (data.gaYtRatings ||= {})[v] = id; ctx.save(); ctx.render(); ctx.toast(T(ctx.lang, id === 'like' ? 'You like this video.' : 'You dislike this video.')); break;
      }
      case 'ga-yt-plus': { const v = ui.gaVideo || VIDEOS[0].id, list = data.gaYtPlus || []; data.gaYtPlus = list.includes(v) ? list.filter(x => x !== v) : [...list, v]; ctx.save(); ctx.render(); break; }
      case 'ga-book': ui.gaBook = id; ui.gaSub = 'read'; ctx.render(); break;
      case 'ga-book-turn': { const b = BOOKS.find(x => x.id === ui.gaBook) || BOOKS[0]; data.gaBookPages ||= {}; data.gaBookPages[b.id] = ((data.gaBookPages[b.id] || 0) + 1) % b.pages.length; ctx.save(); ctx.render(); break; }
      // Play Books 2.3.6's reader: the Contents popup (TableOfContentsActionItem) and Display options (ReaderSettingsFragment).
      case 'ga-bk-toc': ui.gaBkToc = !ui.gaBkToc; ui.gaBkOptions = false; ui.gaBkSpin = ''; ctx.render(); break;
      case 'ga-bk-chapter': data.gaBookPages ||= {}; data.gaBookPages[ui.gaBook || BOOKS[0].id] = Number(id) || 0; ui.gaBkToc = false; ctx.save(); ctx.render(); break;
      case 'ga-bk-options': ctx.closeOverlay(); ui.gaBkOptions = !ui.gaBkOptions; ui.gaBkToc = false; ui.gaBkSpin = ''; ctx.render(); break;
      case 'ga-bk-spin': ui.gaBkSpin = ui.gaBkSpin === id ? '' : id; ctx.render(); break;
      case 'ga-bk-pref': case 'ga-bk-step': {
        const [key, value] = String(id).split(':'), prefs = bookPrefs(data);
        data.gaBookPrefs = {...prefs, [key]: action === 'ga-bk-pref' ? value : stepPref(prefs, key, Number(value))}; ui.gaBkSpin = ''; ctx.save(); ctx.render(); break;
      }
      case 'ga-bk-auto': { const prefs = bookPrefs(data); data.gaBookPrefs = {...prefs, brightness: prefs.brightness < 0 ? Math.max(5, Math.round(data.settings?.brightness ?? 100)) : -1}; ctx.save(); ctx.render(); break; }
      case 'ga-bk-view': ctx.closeOverlay(); data.gaBkView = data.gaBkView === 'list' ? 'carousel' : 'list'; ctx.save(); ctx.render(); break;
      case 'ga-bk-at': ui.gaBkAt = Number(id); ctx.render(); break;
      case 'ga-bk-pin': (data.gaBkPinned ||= {})[id] = !data.gaBkPinned[id]; ctx.save(); ctx.render(); break;
      case 'ga-movies-tab': ui.gaMoviesTab = id; ctx.render(); break;
      case 'ga-shop': ctx.openApp('play-store'); break;
      case 'ga-search-run': ctx.browse(id); break;
      case 'ga-voice-listen': ctx.listen(); break;
      case 'ga-unsupported': ctx.closeOverlay(); ctx.toast('This feature is not part of the simulator.'); break;
      default: return false;
    }
    return true;
  }
  function submit(form, values, ctx) {
    const {ui, data} = ctx;
    if (form === 'ga-talk') {
      const body = String(values.get('body') || '').trim(); if (!body) return true;
      data.talkChats ||= []; data.talkChats.push({contact: ui.gaChat, body, mine: true});
      ctx.save(); ctx.render(); return true;
    }
    if (form === 'ga-talk-search') { const q = String(values.get('query') || '').trim(); if (q) { ui.gaTalkQ = q; ui.gaSub = 'results'; ctx.render(); } return true; }
    if (form === 'ga-talk-invite') {
      const emails = String(values.get('email') || '').split(/[,;\s]+/).filter(Boolean).map(x => x.includes('@') ? x : `${x}@gmail.com`);
      if (!emails.length) return true;
      data.talkInvites = [...new Set([...(data.talkInvites || []), ...emails])]; ui.gaSub = ''; ctx.save(); ctx.render(); ctx.toast(T(ctx.lang, 'Invitation sent.')); return true;
    }
    if (form === 'ga-search') {
      const q = String(values.get('query') || '').trim(); if (!q) return true;
      data.gaSearches = [q, ...(data.gaSearches || []).filter(x => x !== q)].slice(0, 5); ctx.save(); ctx.browse(q); return true;
    }
    return false;
  }
  window.ICSGoogleApps = {APPS, render, handle, submit, menu, books: {BOOKS, BOOK_PREFS, bookPrefs, stepPref}};
})();
