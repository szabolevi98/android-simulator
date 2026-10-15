/* Android 2.1 YouTube 1.5.20 (YouTube.apk, ERE27; the default dark Theme) with made-up videos, offline.
   - Every screen but the player has custom_title_1.xml in the title bar: the title (windowTitleStyle) at the left, the
     YouTube user at the right where showUsernameInCustomTitle (home, comments, categories, My account) and "Loading"
     with the small title spinner while a feed loads.
   - HomeActivity (home_page.xml): ic_youtube_logo with the record (ic_camera) and search (ic_search_button) 50 dp
     ImageButtons, then four FeedModuleViews (feed_module_view.xml: the bold 15 dp header on title_bar, max_list_size 3
     videos, the footer "View all …" with its icon in 18 dp): Most viewed, Most discussed, Most recent, Top rated.
   - video_list_item.xml rows: the 88 x 68 dp thumbnail in thumbnail_background (border_youtube_thumbnail) with the
     duration (Util.secondsToString, #ffcccccc on black), the bold 15 dp title, the 12 dp grey description, the small
     YouTubeRatingBar (ic_rate_star_small_*), "… ago" and "%1$s views" in bold 12 dp, the 44 dp info button; holding a
     row opens the context menu (context_menu_video_header.xml: View, Details, Rate, Comments, Favorite, Share, Flag).
   - VideoListActivity (query_page.xml): a feed ("View all"), a search ("Results for …"), a category, Favorites or My
     videos; the menu adds Time filter (array time_filter_dialog_items, "View videos from") and the title becomes
     "%1$s - %2$s".
   - VideoDetailsActivity (video_details_view.xml): the 120 x 90 dp thumbnail with play_bug_large, rating, ratings,
     views, the owner (btn_thin) and the date added; the expander (expander_min / _max: 2 lines or all, with Category,
     Tags, Copy URL and the watch URL), video_toolbar.xml (Rate, Comments, Favorite / Unfavorite, Share, Flag) and the
     Related videos under related_title.xml.
   - PlayerActivity (player.xml, landscape and full screen): "Loading video…", then the made-up video plays with
     youtube_media_controller.xml (rew / pause / ffwd, the times, the playbar SeekBar) and, at the end, the play_ended
     panel (Play again, Related videos). Its menu adds Watch in high quality / normal quality.
   - CommentsActivity (comment_list_item.xml), CategoriesActivity (playlist_item.xml rows), MyAccountActivity
     (user_profile_view.xml and the My videos / Favorites / Playlists / Subscriptions modules, Sign out), ChannelActivity
     (channel_header.xml: Subscribe and the channel stats), SettingsActivity (youtube_preferences.xml).
   - Signing in (GlsLoginActivity) offers the phone's Google account under "YouTube accounts" (or Add account).
   - Menus from MenuBuilder: Search, Upload (MediaUploader is in the image), Home, My account, Categories, Settings; the
     video menu: Details, Rate, Comments, Favorite / Unfavorite, Share, Flag, Search, Home.
   YouTube 1.5.20 has no Hungarian: its texts stay English there (the [youtube] table is hu=none). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const Y = () => EC.text('youtube');
  const t = k => Y().t(k);
  const USER = 'eclairdemo';
  // The categories YouTube's server sent in early 2010 (categories.cat; not part of the APK).
  const CATEGORIES = ['Autos & Vehicles', 'Comedy', 'Education', 'Entertainment', 'Film & Animation', 'Gaming', 'Howto & Style', 'Music', 'News & Politics',
    'Nonprofits & Activism', 'People & Blogs', 'Pets & Animals', 'Science & Technology', 'Sports', 'Travel & Events'];
  // Early 2010 videos: [title, author, seconds, views, category, days ago, rating, ratings, comments, colours, description, tags].
  const VIDEOS = [
    ['Nexus One hands-on: Android 2.1, live wallpapers and voice input', 'GadgetWeekly', 512, 1204311, 'Science & Technology', 12, 4.7, 8123, 2311, ['#1d3557', '#a8dadc'], 'A first look at the new phone: the 3D app drawer, live wallpapers, voice input in every text field and the trackball.', 'nexus one android eclair phone review'],
    ['Eclair tips: 10 things to try on Android 2.1', 'DroidCorner', 375, 486020, 'Howto & Style', 6, 4.6, 3920, 840, ['#264653', '#e9c46a'], 'Quick contact badges, the new gallery, pinch to zoom in the browser and seven more things worth trying.', 'android tips eclair howto'],
    ['Cat vs. cardboard box — the rematch', 'WhiskerTV', 142, 9871442, 'Pets & Animals', 9, 4.9, 51220, 12044, ['#6d597a', '#e56b6f'], 'He lost last time. He trained all winter. This time it is personal.', 'cat box funny pets'],
    ['Sunset timelapse over the old town bridge', 'Trail & Summit', 188, 52977, 'Travel & Events', 60, 4.8, 1204, 158, ['#f4a261', '#2a9d8f'], 'Two hours of a winter sunset in three minutes, shot from the hill above the river.', 'timelapse sunset travel winter'],
    ['Learn three chords in ten minutes', 'StrumSchool', 603, 2311020, 'Music', 120, 4.7, 22018, 3207, ['#3a0ca3', '#f72585'], 'G, C and D: enough for a hundred songs. Slow, friendly and for complete beginners.', 'guitar lesson chords music beginner'],
    ['First-day snowboard tricks', 'SlopeStyle TV', 255, 731554, 'Sports', 14, 4.5, 6112, 977, ['#2b9348', '#e0fbfc'], 'Ollies, butters and a first small jump: everything you can learn before lunch.', 'snowboard winter sports tricks'],
    ['How a paper airplane really flies', 'Physics Explained', 421, 318020, 'Education', 75, 4.8, 4502, 611, ['#023e8a', '#90e0ef'], 'Lift, drag and the fold that makes the difference, with a slow-motion camera.', 'physics science paper airplane'],
    ['Live wallpapers on the Nexus One, side by side', 'TechTalk Daily', 334, 155802, 'Science & Technology', 3, 4.4, 1802, 529, ['#343a40', '#adb5bd'], 'Galaxy, Grass, Magic Smoke, Water and the others, running on the phone.', 'android live wallpapers nexus one'],
    ['Five-minute pasta for busy evenings', 'Kitchen Corner', 301, 90311, 'Howto & Style', 33, 4.6, 1350, 96, ['#9d0208', '#ffba08'], 'Garlic, olive oil, chilli and a little parsley. Dinner is ready before the water cools.', 'cooking pasta recipe quick'],
    ['Stand-up: smartphones and our grandparents', 'Laugh Track', 480, 2650098, 'Comedy', 19, 4.8, 30512, 5120, ['#5f0f40', '#fb8b24'], '"Why does the phone not have buttons?" A set about teaching Grandma to swipe.', 'comedy standup smartphones family'],
    ['Voice search vs. typing: a quick race', 'DroidCorner', 96, 64210, 'Science & Technology', 1, 4.2, 412, 88, ['#3d405b', '#81b29a'], 'Five searches, two ways. Guess which one wins.', 'android voice search google'],
    ['Building a backyard ice rink in one weekend', 'DIY Dad', 418, 211400, 'Howto & Style', 2, 4.5, 980, 140, ['#0077b6', '#caf0f8'], 'Boards, a liner, a garden hose and two cold nights.', 'diy winter ice rink backyard']
  ].map(([title, author, seconds, views, category, days, rating, ratings, comments, colors, description, tags], i) =>
    ({id: `eclairDem${String(i + 1).padStart(2, '0')}`, title, author, seconds, views, category, days, rating, ratings, comments, colors, description, tags}));
  const COMMENTS = [['jake88', 'Great video, thanks for sharing!'], ['anna_k', 'Watching this on my Nexus One right now :)'], ['mrtechguy', 'The ending was the best part.'],
    ['sunnyday', 'Subscribed!'], ['droidfan2010', 'How long did this take you?']];
  const FEEDS = {
    most_viewed: {name: 'most_viewed_videos', icon: 'ic_most_viewed', sort: (a, b) => b.views - a.views},
    most_discussed: {name: 'most_discussed_videos', icon: 'ic_most_discussed', sort: (a, b) => b.comments - a.comments},
    most_recent: {name: 'most_recent_videos', icon: 'ic_most_recent', sort: (a, b) => a.days - b.days, untimed: true},
    top_rated: {name: 'top_rated_videos', icon: 'ic_top_rated', sort: (a, b) => b.rating - a.rating || b.ratings - a.ratings}
  };
  const FILTERS = ['today', 'week', 'month', 'all'], FILTER_DAYS = {today: 1, week: 7, month: 31, all: Infinity};
  const FILTER_TITLES = {today: 'new_today_title', week: 'new_this_week_title', month: 'new_this_month_title', all: 'all_time_title'};
  const video = id => VIDEOS.find(v => v.id === id);
  const st = c => c.data.youtube ||= {account: '', favorites: [], ratings: {}, subscriptions: [], history: [], filter: 'all', watched: 0};
  const top = c => c.ui.ytStack.at(-1) || {page: 'home'};
  const A = name => `assets/yt-${name}.png`;
  const num = (c, n) => Number(n).toLocaleString(c.locale());
  // Util.secondsToString: mm:ss with both padded, h:mm:ss past an hour.
  const length = s => { const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = s % 60, p = n => String(n).padStart(2, '0'); return h ? `${h}:${p(m)}:${p(x)}` : `${p(m)}:${p(x)}`; };
  function ago(c, days) {
    const unit = days >= 365 ? ['year', Math.floor(days / 365)] : days >= 30 ? ['month', Math.floor(days / 30)] : days >= 7 ? ['week', Math.floor(days / 7)] : days >= 1 ? ['day', Math.floor(days)] : ['hour', Math.max(1, Math.round(days * 24))];
    return Y().fmt(`ago_${unit[0]}_${unit[1] === 1 ? 'singular' : 'plural'}`, c.lang, unit[1]);
  }
  const watchUrl = v => `http://www.youtube.com/watch?v=${v.id}`;
  const loggedIn = c => !!st(c).account;

  // ---- pieces ----
  const art = (v, cls = '') => `<span class="ecyt-art ${cls}" style="--a:${v.colors[0]};--b:${v.colors[1]}"><em>${esc(v.title.split(/[:—]/)[0])}</em></span>`;
  const stars = rating => `<span class="ecyt-stars">${[1, 2, 3, 4, 5].map(n => `<img src="${A(`ic_rate_star_small_${rating >= n ? 'full' : rating >= n - .5 ? 'half' : 'empty'}`)}" alt="">`).join('')}</span>`;
  const divider = '<img class="ecyt-div" src="assets/fw-divider_horizontal_dim_dark.9.png" alt="">';
  function title(c, left, user) {
    const p = top(c);
    return `<div class="ecyt-title npp-fw-title_bar"><i class="ec-bg np-fw-title_bar"></i><span class="ecyt-tleft">${esc(left)}</span>${user && loggedIn(c) ? `<span class="ecyt-tright">${esc(USER)}</span>` : ''}
      ${p.loading ? `<span class="ecyt-tload"><span>${esc(t('loading'))}</span><img class="ecyt-tspin" src="assets/fw-spinner_white_16.png" alt=""></span>` : ''}</div>`;
  }
  const win = (c, left, user, inner) => `<div class="ecyt">${title(c, left, user)}<div class="ecyt-body"><div class="ecyt-scroll">${inner}</div><img class="ecwin-shadow" src="assets/fw-title_bar_shadow.9.png" alt=""></div></div>`;
  // video_list_item.xml
  const row = (c, v, src = '') => `<div class="ecyt-row" data-id="${v.id}" data-src="${src}"><button type="button" class="ecyt-rmain" data-action="ecyt-play" data-id="${v.id}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i>
    <span class="ecyt-tbox"><span class="ecyt-thumb np-yt-border_youtube_thumbnail">${art(v)}</span><span class="ecyt-dur">${length(v.seconds)}</span></span>
    <span class="ecyt-rtext"><span class="ecyt-rtitle">${esc(v.title)}</span><span class="ecyt-rdesc">${esc(v.description)}</span>${stars(v.rating)}<span class="ecyt-rline"><span>${esc(ago(c, v.days))}</span><span>${esc(Y().fmt('video_view_count_text', c.lang, num(c, v.views)))}</span></span></span></button>
    <button type="button" class="ecyt-infob" data-action="ecyt-details" data-id="${v.id}" aria-label="${esc(t('video_details'))}"><img class="n" src="${A('ic_info')}" alt=""><img class="p" src="${A('ic_info_pressed')}" alt=""></button></div>`;
  const rows = (c, list, src) => list.map(v => row(c, v, src)).join(divider);
  const empty = text => `<div class="ecyt-empty">${esc(text)}</div>`;
  // FeedModuleView: header, up to three videos, the footer.
  const module = (header, body, icon, footer, action, extra = '') => `<div class="ecyt-module"><div class="ecyt-mhead npp-fw-title_bar"><i class="ec-bg np-fw-title_bar"></i><span>${esc(header)}</span></div>${body}
    <button type="button" class="ecyt-mfoot" data-action="${action}" ${extra}><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><img src="${A(icon)}" alt=""><span>${esc(footer)}</span></button></div>`;

  // ---- screens ----
  function renderHome(c) {
    const p = top(c);
    const head = `<div class="ecyt-head"><img class="ecyt-logo" src="${A('ic_youtube_logo')}" alt="YouTube"><span class="ecyt-sp"></span>
      <button type="button" class="ecyt-ibtn" data-action="ecyt-record"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><img src="${A('ic_camera')}" alt=""></button>
      <button type="button" class="ecyt-ibtn" data-action="ecyt-search"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><img src="${A('ic_search_button')}" alt=""></button></div>`;
    const mods = Object.entries(FEEDS).map(([id, f]) => module(t(f.name), p.loading ? '' : divider + rows(c, feed(c, id, 'all').slice(0, 3), id) + divider, f.icon, Y().fmt('view_all_something', c.lang, t(f.name)), 'ecyt-feed', `data-id="${id}"`)).join('');
    return win(c, t('youtube_title'), true, head + mods);
  }
  function feed(c, id, filter) {
    const f = FEEDS[id], days = FILTER_DAYS[f.untimed ? 'all' : filter];
    return VIDEOS.filter(v => v.days <= days).sort(f.sort);
  }
  function listOf(c, p) {
    const s = st(c);
    if (p.kind === 'feed') return feed(c, p.id, p.filter);
    if (p.kind === 'search') { const words = p.query.toLocaleLowerCase().split(/\s+/).filter(Boolean); return VIDEOS.filter(v => words.every(w => `${v.title} ${v.author} ${v.tags} ${v.category}`.toLocaleLowerCase().includes(w))); }
    if (p.kind === 'category') return VIDEOS.filter(v => v.category === p.id && v.days <= FILTER_DAYS[p.filter]).sort(FEEDS.most_viewed.sort);
    if (p.kind === 'favorites') return s.favorites.map(video).filter(Boolean);
    if (p.kind === 'channel') return VIDEOS.filter(v => v.author === p.id).sort((a, b) => a.days - b.days);
    return [];   // My videos: nothing uploaded
  }
  function listTitle(c, p) {
    const base = p.kind === 'feed' ? t(FEEDS[p.id].name) : p.kind === 'search' ? Y().fmt('videos_matching', c.lang, p.query) : p.kind === 'category' ? Y().fmt('category_title', c.lang, p.id)
      : p.kind === 'favorites' ? t('my_favorite_videos') : p.kind === 'channel' ? Y().fmt('channel_title', c.lang, p.id) : t('my_videos');
    // getTimeFilteredTitle: only a feed asked with a time= parameter says which.
    return timed(p) && p.filter !== 'all' ? Y().fmt('time_filtered_title', c.lang, base, t(FILTER_TITLES[p.filter])) : base;
  }
  const timed = p => (p.kind === 'feed' && !FEEDS[p.id].untimed) || p.kind === 'category';
  function renderList(c, p) {
    const list = listOf(c, p), src = p.kind === 'favorites' ? 'favorites' : p.kind === 'mine' ? 'mine' : '';
    let body = p.loading ? '' : list.length ? rows(c, list, src) + divider : empty(t('no_videos_found'));
    if (p.kind === 'channel') body = channelHeader(c, p.id) + body;
    return win(c, listTitle(c, p), false, `<div class="ecyt-list">${body}</div>`);
  }
  // channel_header.xml: Subscribe and the UserProfileView with the channel stats.
  function channelHeader(c, author) {
    const vids = VIDEOS.filter(v => v.author === author), views = vids.reduce((n, v) => n + Math.round(v.views / 7), 0), subs = vids.reduce((n, v) => n + Math.round(v.ratings / 3), 0);
    const subscribed = st(c).subscriptions.includes(author);
    return `<div class="ecyt-chead"><button type="button" class="ecui-button ecyt-subscribe" data-action="ecyt-subscribe" data-id="${esc(author)}"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(t(subscribed ? 'unsubscribe' : 'subscribe'))}</span></button>
      ${profile(c, [], [Y().fmt('channel_stats_uploaded', c.lang, vids.length), Y().fmt('channel_stats_views', c.lang, num(c, views)), Y().fmt('channel_stats_subscribers', c.lang, num(c, subs))], vids[0])}</div>${divider}`;
  }
  // user_profile_view.xml: the stats columns and the 68 dp thumbnail.
  const profile = (c, personal, channel, v) => `<div class="ecyt-profile">${personal.length ? `<span class="ecyt-pstats">${personal.map(x => `<span>${esc(x)}</span>`).join('')}</span>` : ''}${channel.length ? `<span class="ecyt-pstats">${channel.map(x => `<span>${esc(x)}</span>`).join('')}</span>` : ''}
    <span class="ecyt-pthumb np-yt-border_youtube_thumbnail">${v ? art(v) : `<img src="${A('ic_youtube_thumbnail_small')}" alt="">`}</span></div>`;
  function renderCategories(c) {
    const p = top(c);
    return win(c, t('categories'), true, `<div class="ecyt-list">${p.loading ? '' : CATEGORIES.map(name => `<button type="button" class="ecyt-cat" data-action="ecyt-category" data-id="${esc(name)}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span>${esc(name)}</span></button>`).join(divider) + divider}</div>`);
  }
  function renderDetails(c, p) {
    const v = video(p.id), fav = st(c).favorites.includes(v.id), open = p.expanded;
    const tool = (action, icon, label, id = '') => `<button type="button" class="ecyt-tool" data-action="${action}"${id}><i class="ec-bg ec-pressed np-yt-button_background_pressed"></i><img src="${A(icon)}" alt=""><span>${esc(label)}</span></button>`;
    const related = VIDEOS.filter(x => x.id !== v.id && (x.category === v.category || x.author === v.author || x.views > 1000000)).slice(0, 6);
    const head = `<div class="ecyt-details"><div class="ecyt-dtop"><button type="button" class="ecyt-dthumb" data-action="ecyt-play" data-id="${v.id}"><span class="ecyt-thumb np-yt-border_youtube_thumbnail">${art(v, 'big')}</span><img class="ecyt-bug" src="${A('play_bug_large')}" alt=""><span class="ecyt-dur">${length(v.seconds)}</span></button>
        <span class="ecyt-dinfo"><span class="ecyt-drate">${stars(v.rating)}<span>${esc(Y().fmt('video_rating_count_text', c.lang, num(c, v.ratings)))}</span></span><span>${esc(Y().fmt('video_view_count_text', c.lang, num(c, v.views)))}</span>
        <button type="button" class="ecyt-owner npp-yt-btn_thin" data-action="ecyt-channel" data-id="${esc(v.author)}"><i class="ec-bg np-yt-btn_thin"></i><i class="ec-bg ec-pressed np-yt-btn_thin_pressed"></i><span>${esc(v.author)}</span></button><span>${esc(c.shortDate(new Date(c.now() - v.days * 864e5)))}</span></span></div>
      <div class="ecyt-drow"><button type="button" class="ecyt-expander" data-action="ecyt-expand"><img class="n" src="${A(`btn_expander_${open ? 'maximized' : 'minimized'}_default`)}" alt=""><img class="p" src="${A(`btn_expander_${open ? 'maximized' : 'minimized'}_pressed`)}" alt=""></button><span class="ecyt-ddesc${open ? ' open' : ''}">${esc(v.description)}</span></div>
      ${open ? `<div class="ecyt-dpair"><b>${esc(t('category_label_text'))}</b><span>${esc(v.category)}</span></div><div class="ecyt-dpair"><b>${esc(t('tags_label_text'))}</b><span>${esc(v.tags)}</span></div>
        <button type="button" class="ecui-button ecyt-copy" data-action="ecyt-copy"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(t('copy_url_button_text'))}</span></button><div class="ecyt-url">${esc(watchUrl(v))}</div>` : ''}
      ${divider}<div class="ecyt-toolbar">${tool('ecyt-rate', 'ic_rate', t('rate_video'))}${tool('ecyt-comments', 'ic_comment', t('comments'))}${tool(fav ? 'ecyt-unfav' : 'ecyt-fav', fav ? 'ic_unfavorite' : 'ic_favorite', t(fav ? 'remove_from_favorites' : 'favorites_short'))}${tool('ecyt-share', 'ic_share', t('email_video'))}${tool('ecyt-flag', 'ic_flag', t('flag_video'))}</div></div>
      ${relatedTitle()}`;
    return win(c, v.title, false, `<div class="ecyt-list">${head}${rows(c, related)}${divider}</div>`);
  }
  const relatedTitle = () => `<div class="ecyt-related"><img class="ecyt-dark" src="assets/fw-divider_horizontal_dark.9.png" alt=""><div class="ecyt-rtitle-bar npp-fw-title_bar"><i class="ec-bg np-fw-title_bar"></i><span>${esc(t('video_info_related_label_text'))}</span></div><img class="ecyt-dark" src="assets/fw-divider_horizontal_dark.9.png" alt=""></div>`;
  function renderComments(c, p) {
    const v = video(p.id);
    const list = COMMENTS.map(([author, text], i) => `<div class="ecyt-comment"><span class="ecyt-cline"><span class="ecyt-cauthor">${esc(author)}</span><span class="ecyt-ctime">${esc(ago(c, Math.max(v.days * (4 - i) / 5, .1)))}</span></span><span class="ecyt-ctext">${esc(text)}</span></div>`).join(divider);
    return win(c, Y().fmt('comments_title', c.lang, num(c, v.comments)), true, `<div class="ecyt-list">${p.loading ? '' : list + divider}</div>`);
  }
  function renderAccount(c) {
    const s = st(c), p = top(c), favs = s.favorites.map(video).filter(Boolean);
    const personal = [Y().fmt('user_stats_watched', c.lang, num(c, s.watched)), Y().fmt('user_stats_favorites', c.lang, favs.length), Y().fmt('user_stats_subscriptions', c.lang, s.subscriptions.length)];
    const count = (key, n) => Y().fmt('title_followed_by_count', c.lang, t(key), n);
    const subs = s.subscriptions.map(a => `<button type="button" class="ecyt-sub" data-action="ecyt-channel" data-id="${esc(a)}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span class="ecyt-stitle">${esc(a)}</span><span class="ecyt-sdesc">${esc(Y().fmt('channel_title', c.lang, a))}</span></button>`).join(divider);
    const body = p.loading ? '' : `${profile(c, personal, [], favs[0])}
      ${module(count('my_videos', 0), '', 'ic_my_videos', Y().fmt('view_all_something', c.lang, t('my_videos')), 'ecyt-mine')}
      ${module(count('my_favorite_videos', favs.length), favs.length ? divider + rows(c, favs.slice(0, 3), 'favorites') + divider : '', 'ic_favorite', Y().fmt('view_all_something', c.lang, t('my_favorite_videos')), 'ecyt-favorites')}
      ${module(t('my_playlists'), '', 'ic_playlists', Y().fmt('view_all_something', c.lang, t('my_playlists')), 'ecyt-playlists')}
      ${module(count('my_subscriptions', s.subscriptions.length), s.subscriptions.length ? divider + subs + divider : '', 'ic_subscriptions', Y().fmt('view_all_something', c.lang, t('my_subscriptions')), 'ecyt-subscriptions')}`;
    return win(c, t('my_account'), true, body);
  }
  function renderSettings(c) {
    const r = (key, title, summary, disabled) => `<button type="button" class="ecpf-row" data-action="ecyt-pref" data-key="${key}"${disabled ? ' disabled' : ''}><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span class="ecpf-text"><span class="ecpf-title">${esc(title)}</span><span class="ecpf-summary">${esc(summary)}</span></span></button><i class="ecpf-divider"></i>`;
    const cat = text => `<div class="ecpf-cat npp-fw-dark_header_dither"><i class="ec-bg np-fw-dark_header_dither"></i><span>${esc(text)}</span></div>`;
    return c.window(t('settings'), `<div class="ecpf-list">${cat(t('pref_youtube_category'))}${r('clear_history', t('pref_youtube_clear_search_history_title'), t('pref_youtube_clear_search_history_summary'))}
      ${cat(t('pref_time_category'))}${r('time_filter', t('pref_youtube_time_filter_title'), t('pref_youtube_time_filter_summary'))}
      ${cat(t('pref_about_category'))}${r('terms', t('pref_terms_title'), t('pref_terms_summary'))}${r('youtube_version', t('pref_about_version_title'), '1.5.20', true)}</div>`);
  }

  // ---- the player (landscape, full screen) ----
  const player = {timer: 0, hide: 0};
  function renderPlayer(c, p) {
    const v = video(p.id), pos = Math.min(p.pos || 0, v.seconds), ended = p.ended;
    const screen = p.loading ? `<div class="ecyt-ploading"><img class="ecyt-bigspin" src="assets/fw-spinner_white_76.png" alt=""><span>${esc(t('loading_video'))}</span></div>`
      : `<button type="button" class="ecyt-video${p.playing ? ' playing' : ''}${p.hq ? ' hq' : ''}" data-action="ecyt-touch" style="--a:${v.colors[0]};--b:${v.colors[1]}"><em>${esc(v.title)}</em></button>`;
    const ctl = (id, img) => `<button type="button" class="ecyt-cbtn" data-action="ecyt-${id}"><img class="n" src="${A(img)}" alt=""><img class="p" src="${A(`${img}_selected`)}" alt=""></button>`;
    const controller = !p.loading && !ended && p.controls ? `<div class="ecyt-mc npp-yt-media_controller_bg"><i class="ec-bg np-yt-media_controller_bg"></i><div class="ecyt-mcbtns">${ctl('rew', 'btn_rew')}${ctl('pause', p.playing ? 'btn_pause' : 'btn_play')}${ctl('ffwd', 'btn_ffwd')}</div>
      <div class="ecyt-mctimes"><span>${length(Math.floor(pos))}</span><span>${length(v.seconds)}</span></div>
      <div class="ecyt-seek npp-yt-playbar_frame" data-action="ecyt-seek"><i class="ec-bg np-yt-playbar_frame"></i><span class="ecyt-track"><span class="ecyt-buf np-yt-playbar_buffered" style="width:${Math.min(100, pos / v.seconds * 100 + 35)}%"></span><span class="ecyt-played np-yt-playbar" style="width:${pos / v.seconds * 100}%"></span><img class="ecyt-phead" style="left:${pos / v.seconds * 100}%" src="${A('playhead')}" alt=""></span></div></div>` : '';
    const related = VIDEOS.filter(x => x.id !== v.id && (x.category === v.category || x.views > 1000000)).slice(0, 5);
    const end = ended ? `<div class="ecyt-ended"><div class="ecyt-ebar"><span>${esc(v.title)}</span><button type="button" class="ecui-button" data-action="ecyt-again"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(t('play_again_button'))}</span></button></div>${relatedTitle()}<div class="ecyt-elist">${rows(c, related)}</div></div>` : '';
    return `<div class="ecyt-player"><div class="ecyt-land">${screen}${controller}${end}</div></div>`;
  }
  function tick(c) {
    clearInterval(player.timer);
    player.timer = setInterval(() => {
      const p = top(c);
      if (c.ui.view !== 'youtube' || p.page !== 'player' || !p.playing) { clearInterval(player.timer); return; }
      const v = video(p.id);
      p.pos = Math.min(v.seconds, (p.pos || 0) + 1);
      if (p.pos >= v.seconds) { p.playing = false; p.ended = true; clearInterval(player.timer); c.render(); return; }
      const root = c.el.viewport;
      const set = (sel, prop, val) => { const el = root.querySelector(sel); if (el) el.style[prop] = val; };
      set('.ecyt-played', 'width', `${p.pos / v.seconds * 100}%`); set('.ecyt-phead', 'left', `${p.pos / v.seconds * 100}%`); set('.ecyt-buf', 'width', `${Math.min(100, p.pos / v.seconds * 100 + 35)}%`);
      const time = root.querySelector('.ecyt-mctimes span'); if (time) time.textContent = length(p.pos);
    }, 1000);
  }
  // MediaController: shown on a touch, hidden again after 3 s.
  function showControls(c, p) {
    p.controls = true; clearTimeout(player.hide);
    player.hide = setTimeout(() => { if (top(c) === p && p.playing) { p.controls = false; c.render(); } }, 3000);
  }
  function play(c, id) {
    const p = {page: 'player', id, loading: true, pos: 0, playing: false, controls: false, hq: false};
    push(c, p, false);
    st(c).watched++; c.save();
    setTimeout(() => { if (top(c) !== p) return; p.loading = false; p.playing = true; showControls(c, p); c.render(); tick(c); }, 1500);
  }

  // ---- navigation ----
  // A page that comes from the network shows "Loading" in the title for a moment first.
  function push(c, page, load = true) {
    if (load) { page.loading = true; setTimeout(() => { if (page.loading) { page.loading = false; if (top(c) === page && c.ui.view === 'youtube') c.render(); } }, 700); }
    c.ui.ytStack.push(page); c.render(); c.el.viewport.querySelector('.ecyt-scroll')?.scrollTo(0, 0);
  }
  const home = c => { c.ui.ytStack = []; c.render(); };
  const search = c => c.searchDialog({icon: 'app-youtube.png', hint: t('search_hint'), value: '',
    suggest: q => st(c).history.filter(h => h.toLocaleLowerCase().startsWith(q.toLocaleLowerCase())).slice(0, 5).map(h => ({icon: 'fw-ic_menu_search.png', text1: h, value: h})),
    onGo: q => { q = q.trim(); if (!q) return; const s = st(c); s.history = [q, ...s.history.filter(h => h !== q)].slice(0, 20); c.save(); push(c, {page: 'list', kind: 'search', query: q, filter: 'all'}); }});
  // GlsLoginActivity: the phone's Google accounts with the YouTube service, or Add account.
  function login(c, then) {
    if (loggedIn(c)) { then(); return; }
    const items = [{label: EC.gmail?.account || 'eclair.demo@gmail.com'}, {label: t('other_account')}];
    c.dialog({title: t('accounts_title'), icon: null, items, onItem: i => { if (i) { c.open('settings', 'accounts'); return; } st(c).account = items[0].label; c.save(); c.render(); then(); }});
  }
  function rate(c, v) {
    login(c, () => {
      const s = st(c);
      if (s.ratings[v.id]) { c.toast(t('video_already_rated')); return; }
      let n = 0;
      const html = () => `<div class="ecyt-picker"><span>${esc(t('rating_picker_title'))}</span><span class="ecyt-pstars">${[1, 2, 3, 4, 5].map(i => `<button type="button" data-action="ecyt-star" data-n="${i}"><img src="assets/fw-btn_star_big_${n >= i ? 'on' : 'off'}.png" alt=""></button>`).join('')}</span></div>`;
      // RatingPickerDialog: a star rates the video at once.
      c.dialog({title: '', icon: null, html: html(), action(name, el) { if (name !== 'ecyt-star') return false; n = Number(el.dataset.n); el.closest('.ecui-custom-inner').innerHTML = html(); setTimeout(() => { c.closeDialog(); s.ratings[v.id] = n; c.save(); c.toast(t('rating_picker_video_rated')); c.render(); }, 250); return true; }});
    });
  }
  function favorite(c, v, add) {
    login(c, () => {
      const s = st(c), has = s.favorites.includes(v.id);
      if (add) { if (has) { c.toast(t('video_info_already_added_text')); return; } s.favorites.unshift(v.id); c.toast(t('video_info_added_video_text')); }
      else { s.favorites = s.favorites.filter(id => id !== v.id); c.toast(t('video_info_removed_from_favorites_text')); }
      c.save(); c.render();
    });
  }
  // VideoActions.shareVideoByEmail: ACTION_SEND text/plain in a "Share this video via" chooser (Gmail, Messaging).
  function share(c, v) {
    const items = [{label: EC.apps.label('gmail'), icon: 'app-gmail.png', go: () => { c.open('gmail'); c.ui.gmDraft = {to: '', subject: t('email_subject'), body: watchUrl(v), cc: false, quoted: ''}; c.ui.gmScreen = 'compose'; c.render(); }},
      {label: EC.apps.label('messaging'), icon: 'app-messaging.png', go: () => { c.ui.composeTo = null; c.ui.smsDraft = watchUrl(v); c.ui.smsThread = null; c.open('messaging', 'compose'); }}]
      .sort((a, b) => a.label.localeCompare(b.label, c.locale()));
    c.dialog({title: t('send_video'), icon: null, rows: 'resolve', items, onItem: i => items[i].go()});
  }
  const flag = (c, v) => { c.ui.browserGo = `http://m.youtube.com/flag?v=${v.id}`; c.open('browser'); };
  const comments = (c, v) => push(c, {page: 'comments', id: v.id});
  const details = (c, v) => push(c, {page: 'details', id: v.id});
  function timeFilter(c, current, onPick) {
    c.dialog({title: t('time_filter_title'), icon: null, items: Y().t('time_filter_dialog_items'), choice: 'single', checked: FILTERS.indexOf(current), onItem: i => onPick(FILTERS[i])});
  }
  function videoMenuItems(c, v, src, {details: withDetails = true} = {}) {
    const fav = src === 'favorites';
    return [
      ...(withDetails ? [{label: t('video_details'), icon: 'yt-ic_menu_info.png', action: () => details(c, v)}] : []),
      {label: t('rate_video'), icon: 'yt-ic_menu_favorite.png', action: () => rate(c, v)},
      {label: t('comments'), icon: 'yt-ic_menu_comment.png', action: () => comments(c, v)},
      fav ? {label: t('remove_from_favorites'), icon: 'yt-ic_menu_favorite_remove_youtube.png', action: () => favorite(c, v, false)} : {label: t('favorites_short'), icon: 'yt-ic_menu_favorite_youtube.png', action: () => favorite(c, v, true)},
      {label: t('email_video'), icon: 'fw-ic_menu_share.png', action: () => share(c, v)},
      {label: t('flag_video'), icon: 'yt-ic_menu_flag.png', action: () => flag(c, v)},
      {label: t('search'), icon: 'fw-ic_menu_search.png', action: () => search(c)},
      {label: t('youtube_home'), icon: 'yt-ic_menu_home.png', action: () => home(c)}];
  }
  function mainMenuItems(c) {
    return [{label: t('search'), icon: 'fw-ic_menu_search.png', action: () => search(c)},
      {label: t('upload'), icon: 'fw-ic_menu_upload_you_tube.png', action: () => c.open('gallery')},
      {label: t('youtube_home'), icon: 'yt-ic_menu_home.png', action: () => home(c)},
      {label: t('my_account'), icon: 'yt-ic_menu_my_account.png', action: () => login(c, () => push(c, {page: 'account'}))},
      {label: t('more_categories'), icon: 'yt-ic_menu_more_catagories.png', action: () => push(c, {page: 'categories'})},
      {label: t('settings'), icon: 'fw-ic_menu_preferences.png', action: () => push(c, {page: 'settings'}, false)}];
  }
  // createVideoContextMenu: the header (thumbnail and title), then the video actions.
  function contextMenu(c, v, src) {
    const fav = src === 'favorites';
    const items = [[t('view_video'), () => play(c, v.id)], [t('video_details'), () => details(c, v)], [t('rate_video'), () => rate(c, v)], [t('comments'), () => comments(c, v)],
      ...(fav ? [[t('remove_from_favorites'), () => favorite(c, v, false)]] : [[t('favorites_short'), () => favorite(c, v, true)]]), [t('email_video'), () => share(c, v)], [t('flag_video'), () => flag(c, v)]];
    c.dialog({title: v.title, header: `<span class="ecyt-cmthumb np-yt-border_youtube_thumbnail">${art(v)}</span><span class="ecyt-cmtitle">${esc(v.title)}</span>`, icon: null, items: items.map(([label]) => label), onItem: i => items[i][1]()});
  }

  EC.register('youtube', {
    title: 'YouTube',
    noStatus: c => top(c).page === 'player',
    render(c) {
      const p = top(c);
      switch (p.page) {
        case 'list': return renderList(c, p);
        case 'categories': return renderCategories(c);
        case 'details': return renderDetails(c, p);
        case 'comments': return renderComments(c, p);
        case 'account': return renderAccount(c);
        case 'settings': return renderSettings(c);
        case 'player': return renderPlayer(c, p);
      }
      return renderHome(c);
    },
    mount(c, root) {
      c.el.screen.classList.toggle('ecyt-landscape', top(c).page === 'player');
      for (const el of root.querySelectorAll('.ecyt-row')) {
        let hold = 0;
        el.addEventListener('pointerdown', e => { if (e.target.closest('.ecyt-infob')) return; hold = setTimeout(() => { c.ui.ytHeld = Date.now() + 400; contextMenu(c, video(el.dataset.id), el.dataset.src); }, 500); });
        for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) el.addEventListener(ev, () => clearTimeout(hold));
      }
    },
    action(name, el, event, c) {
      const p = top(c), v = video(el.dataset.id || p.id);
      switch (name) {
        case 'ecyt-play': if ((c.ui.ytHeld || 0) > Date.now()) return true; play(c, el.dataset.id); return true;
        case 'ecyt-details': details(c, v); return true;
        case 'ecyt-search': search(c); return true;
        // createStartRecordIntent: VIDEO_CAPTURE, then the upload.
        case 'ecyt-record': EC.cameraCapture?.(c, {video: true, onDone: () => c.open('youtube')}); return true;
        case 'ecyt-feed': push(c, {page: 'list', kind: 'feed', id: el.dataset.id, filter: FEEDS[el.dataset.id].untimed ? 'all' : st(c).filter}); return true;
        case 'ecyt-category': push(c, {page: 'list', kind: 'category', id: el.dataset.id, filter: st(c).filter}); return true;
        case 'ecyt-channel': push(c, {page: 'list', kind: 'channel', id: el.dataset.id, filter: 'all'}); return true;
        case 'ecyt-favorites': push(c, {page: 'list', kind: 'favorites', filter: 'all'}); return true;
        case 'ecyt-mine': push(c, {page: 'list', kind: 'mine', filter: 'all'}); return true;
        case 'ecyt-playlists': c.toast(t('no_playlists_found')); return true;
        case 'ecyt-subscriptions': if (!st(c).subscriptions.length) c.toast(t('no_subscriptions_found')); return true;
        case 'ecyt-subscribe': login(c, () => {
          const s = st(c), a = el.dataset.id, on = s.subscriptions.includes(a);
          s.subscriptions = on ? s.subscriptions.filter(x => x !== a) : [...s.subscriptions, a]; c.save(); c.render();
          c.toast(t(on ? 'unsubscribe_success_toast' : 'subscribe_success_toast'));
        }); return true;
        case 'ecyt-expand': p.expanded = !p.expanded; c.render(); return true;
        case 'ecyt-copy': c.toast(t('url_copied')); return true;
        case 'ecyt-rate': rate(c, v); return true;
        case 'ecyt-comments': comments(c, v); return true;
        case 'ecyt-fav': favorite(c, v, true); return true;
        case 'ecyt-unfav': favorite(c, v, false); return true;
        case 'ecyt-share': share(c, v); return true;
        case 'ecyt-flag': flag(c, v); return true;
        case 'ecyt-pref': {
          const key = el.dataset.key;
          if (key === 'clear_history') c.dialog({title: t('confirm_clear_search_title'), icon: null, message: t('confirm_clear_search_text'), buttons: [{label: t('ok'), action: () => { st(c).history = []; c.save(); }}, {label: t('cancel')}]});
          if (key === 'time_filter') timeFilter(c, st(c).filter, f => { st(c).filter = f; c.save(); });
          if (key === 'terms') { c.ui.browserGo = 'http://www.youtube.com/t/terms'; c.open('browser'); }
          return true;
        }
        // The player
        case 'ecyt-touch': if (p.page === 'player') { if (p.controls && !p.playing) { p.controls = true; } else showControls(c, p); c.render(); } return true;
        case 'ecyt-pause': p.playing = !p.playing; if (p.playing) tick(c); showControls(c, p); c.render(); return true;
        case 'ecyt-rew': p.pos = Math.max(0, (p.pos || 0) - 5); showControls(c, p); c.render(); return true;
        case 'ecyt-ffwd': p.pos = Math.min(v.seconds - 1, (p.pos || 0) + 15); showControls(c, p); c.render(); return true;
        case 'ecyt-seek': {
          const track = el.querySelector('.ecyt-track').getBoundingClientRect(), r = event.clientY !== undefined ? (event.clientY - track.top) / track.height : 0;
          // The landscape layout is turned 90 degrees clockwise: along the track is down the screen.
          p.pos = Math.round(Math.max(0, Math.min(.99, r)) * v.seconds); showControls(c, p); c.render(); return true;
        }
        case 'ecyt-again': Object.assign(p, {pos: 0, ended: false, playing: true}); showControls(c, p); c.render(); tick(c); return true;
      }
      return false;
    },
    menu(c) {
      const p = top(c), v = p.id && video(p.id);
      if (p.page === 'player') {
        c.menu([...videoMenuItems(c, v, ''), {label: t(p.hq ? 'lo_res' : 'hi_res'), action: () => { p.hq = !p.hq; c.render(); }}]);
      } else if (p.page === 'details') c.menu(videoMenuItems(c, v, '', {details: false}));
      else if (p.page === 'settings') return false;
      else {
        let items = mainMenuItems(c);
        if (p.page === 'list') items = [...items.filter(x => x.label !== t('settings')), {label: t('filter_by_time'), icon: 'fw-ic_menu_today.png', action: () => timeFilter(c, p.filter, f => { c.ui.ytStack.pop(); push(c, {...p, filter: f}); })}];
        if (p.page === 'categories') items = items.filter(x => x.label !== t('more_categories'));
        if (p.page === 'account') items = [...items.filter(x => x.label !== t('my_account')), {label: t('logout'), icon: 'yt-ic_menu_signout.png', action: () => { st(c).account = ''; c.save(); c.toast(t('logout_success')); home(c); }}];
        c.menu(items);
      }
      return true;
    },
    search(c) { search(c); return true; },
    back(c) {
      if (c.ui.ytStack.length) {
        const p = c.ui.ytStack.pop();
        if (p.page === 'player') { clearInterval(player.timer); clearTimeout(player.hide); }
        c.render(); return true;
      }
      return false;
    }
  });
  EC.youtube = {VIDEOS};
  document.addEventListener('DOMContentLoaded', () => {
    const c = EC.context, open = c.open;
    c.ui.ytStack = [];
    // The launcher opens the home page.
    c.open = (view, sub, opts) => { if (view === 'youtube' && c.ui.view !== 'youtube') c.ui.ytStack = []; return open(view, sub, opts); };
  });
})();
