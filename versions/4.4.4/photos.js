/* Photos on the stock Nexus 5: Google+ 4.2.3 (PlusOne.apk of the KTU84P image), PhotosHomeActivity in Theme.Host.
   host_action_bar.xml: the 48 dp #dddddd bar (ab_solid_light_holo, a 3 dp #d2d2d2 base) with ic_ab_back_holo_light and
   ic_photos_color_32, the primary spinner (btn_froyo_spinner) whose host_navigation_item.xml rows (48 dp, the 20 dp nav
   icon 16 dp before the 18 sp #303030 text) are photo_spinner_*: Photos, Photos of you, Albums, Auto Awesome, Videos,
   Trash; the action buttons (ic_create_movie_20, ic_search_grey_20) and the overflow. hosted_photos_home_fragment.xml:
   photos_home_tab_container.xml's tab strip over play_checker_tile (48 dp, 14 sp bold #505050 titles 24 dp in, the
   4 dp photos_home_tab_color #427fed underline, a 1 dp #26000000 base) with CAMERA and HIGHLIGHTS, then the pager on
   #f5f5f5. CAMERA is the camera roll on the 2 dp album grid, three across, after all_folders_tile_view.xml (the
   newest photo under ov_photos_gradient_64 with ic_folder_white_20 and "Folders" in 12 sp white); HIGHLIGHTS lists
   each day as best_photos_container_tile_view.xml (48 dp: the 36 dp round avatar, the 18 sp sans-serif-light #262626
   date, ic_share_alt_darkgrey_20) over its photos. host_photo_tile_search_activity.xml searches the photos: the
   instructions (20 sp light #737373, the person / place / sunglasses icons, 16 sp #999999 examples), then the
   matching pictures under "Camera & folders" or "No photos found for <b>…</b>". The one-up view is black with
   photo_action_bar.xml at the bottom (#8c000000: ic_brush_white_20 Edit, ic_share_alt_white_20 Share,
   ic_trash_white_20 Delete; 20 / 10 dp padding); Edit opens the Gallery's editor as the phone does. The texts are
   the APK's (stock-strings.js, group photos). Pictures are the simulator's own. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const P = (ctx, key) => { const row = window.StockStrings?.photos?.[key], i = ['hu', 'de', 'fr', 'es'].indexOf(String(ctx.locale || 'en').slice(0, 2)); return row ? (i >= 0 ? row[i] : row[4] || key) : ctx.t(key); };
  const newest = photos => [...photos].sort((a, b) => (b.created || b.id || 0) - (a.created || a.id || 0));
  // photo_spinner_*: the home spinner's views, with the nav icons the APK has for them.
  const VIEWS = [['photos', 'Photos', ''], ['of-you', 'Photos of you', 'ic_photos_of_you_nav_20'], ['albums', 'Albums', 'ic_albums_nav_20'], ['auto-awesome', 'Auto Awesome', 'ic_auto_awesome_nav_20'], ['videos', 'Videos', ''], ['trash', 'Trash', 'ic_trash_dark_grey_20']];
  const thumb = (ctx, photo, list) => `<button class="ph-thumb" data-action="photos-open" data-id="${photo.id}" data-list="${list}" aria-label="${e(photo.name)}"><img src="${ctx.media.image(photo)}" alt="">${window.GPVideo.tile(photo)}</button>`;
  function bar(ctx, {up, title, actions = ''}) {
    const start = up
      ? `<button class="ph-up" data-action="back" aria-label="${e(P(ctx, 'Navigate up'))}"><img class="ph-caret" src="assets/ic_ab_back_holo_light.png" alt=""><img class="ph-icon" src="assets/gp-ic_photos_color_32.png" alt=""></button>${title ? `<h2>${e(title)}</h2>` : ''}`
      : `<span class="ph-up ph-home"><img class="ph-icon" src="assets/gp-ic_photos_color_32.png" alt=""></span><button class="ph-spinner" data-action="photos-spinner" aria-haspopup="listbox">${e(P(ctx, VIEWS.find(([id]) => id === (ctx.ui.photosView || 'photos'))[1]))}</button>`;
    return `<header class="ph-bar">${start}<span class="ph-gap"></span>${actions}<button class="ph-btn" data-action="photos-menu" aria-label="${e(ctx.t('More options'))}"><img src="assets/gp-abc_ic_menu_moreoverflow_normal_holo_light.png" alt=""></button></header>`;
  }
  const action = (name, label, src) => `<button class="ph-btn" data-action="${name}" aria-label="${e(label)}"><img src="assets/gp-${src}.png" alt=""></button>`;
  // CAMERA: all_folders_tile_view.xml first, then the camera roll, newest first.
  function camera(ctx) {
    const photos = newest(ctx.data.photos || []), cover = photos[0];
    const folders = `<button class="ph-thumb ph-folders" data-action="photos-folders" aria-label="${e(P(ctx, 'Folders'))}">${cover ? `<img src="${ctx.media.image(cover)}" alt="">` : ''}<span><img src="assets/gp-ic_folder_white_20.png" alt="">${e(P(ctx, 'Folders'))}</span></button>`;
    return `<div class="ph-grid">${folders}${photos.map(p => thumb(ctx, p, 'camera')).join('')}</div>`;
  }
  // HIGHLIGHTS: a best_photos_container_tile_view.xml row per day over that day's pictures.
  function highlights(ctx) {
    const days = new Map();
    for (const photo of newest(ctx.data.photos || [])) {
      const date = photo.created ? new Date(photo.created) : null, key = date ? date.toDateString() : 'unknown';
      if (!days.has(key)) days.set(key, {date, items: []});
      days.get(key).items.push(photo);
    }
    if (!days.size) return `<p class="ph-empty">${e(ctx.t('No photos'))}</p>`;
    return [...days.values()].map(day => `<section class="ph-day"><header class="ph-day-head"><img class="ph-avatar" src="assets/photos.png" alt=""><h3>${e(day.date ? day.date.toLocaleDateString(ctx.locale, {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'}) : ctx.t('Earlier'))}</h3><button class="ph-share" data-action="photos-share-day" data-id="${day.items[0].id}" aria-label="${e(P(ctx, 'Share'))}"><img src="assets/gp-ic_share_alt_darkgrey_20.png" alt=""></button></header><div class="ph-grid">${day.items.map(p => thumb(ctx, p, 'highlights')).join('')}</div></section>`).join('');
  }
  function folders(ctx) {
    return `<div class="ph-grid ph-albums">${ctx.groups.map(group => `<button class="ph-thumb ph-folder" data-action="photos-folder" data-id="${e(group.key)}">${group.items[0] ? `<img src="${ctx.media.image(group.items[0])}" alt="">` : ''}<span>${e(group.translate ? ctx.t(group.name) : group.name)}</span></button>`).join('') || `<p class="ph-empty">${e(ctx.t('No photos'))}</p>`}</div>`;
  }
  // host_photo_tile_search_activity.xml.
  function search(ctx) {
    const q = String(ctx.ui.photosQuery || ''), query = q.trim().toLocaleLowerCase();
    const found = query ? newest(ctx.data.photos || []).filter(p => [p.name, p.album, p.created ? new Date(p.created).toLocaleDateString(ctx.locale, {month: 'long', year: 'numeric'}) : ''].join(' ').toLocaleLowerCase().includes(query)) : [];
    const body = !query
      ? `<div class="ph-search-help"><p class="ph-search-title">${e(P(ctx, 'Search instructions'))}</p><p class="ph-search-icons"><img src="assets/gp-ic_person_grey_24.png" alt=""><img src="assets/gp-ic_location_grey_24.png" alt=""><img src="assets/gp-ic_sunglasses_24.png" alt=""></p><p class="ph-search-examples">${e(P(ctx, 'Search examples'))}</p></div>`
      : found.length ? `<h4 class="ph-search-head">${e(P(ctx, 'Camera & folders'))}</h4><div class="ph-grid">${found.map(p => thumb(ctx, p, 'search')).join('')}</div>`
      : `<p class="ph-empty">${P(ctx, 'No photos found for %s').replace('%s', e(q))}</p>`;
    return `<div class="app-view ph-app"><header class="ph-bar ph-search-bar"><button class="ph-up" data-action="back" aria-label="${e(P(ctx, 'Navigate up'))}"><img class="ph-caret" src="assets/ic_ab_back_holo_light.png" alt=""><img class="ph-icon" src="assets/gp-ic_photos_color_32.png" alt=""></button><input data-photos-search value="${e(q)}" placeholder="${e(P(ctx, 'Search for photos'))}" aria-label="${e(P(ctx, 'Search for photos'))}" autocomplete="off" spellcheck="false"></header><div class="ph-scroll">${body}</div></div>`;
  }
  function viewer(ctx) {
    const {ui, list} = ctx, photo = list[ui.photosIndex] || list[0];
    if (!photo) return '';
    const bottom = [...(photo.video ? [] : [['photos-edit', 'Edit', 'ic_brush_white_20']]), ['gallery-share-message', 'Share', 'ic_share_alt_white_20'], ['photos-delete', 'Delete', 'ic_trash_white_20']].map(([name, label, src]) => `<button data-action="${name}" aria-label="${e(P(ctx, label))}"><img src="assets/gp-${src}.png" alt=""></button>`).join('');
    return `<div class="app-view ph-app ph-viewer-view${ui.photosChrome === false ? ' ph-bare' : ''}"><div class="ph-viewer" data-action="photos-toggle-bars"><img src="${ctx.media.image(photo)}" alt="${e(photo.name)}" draggable="false">${window.GPVideo.viewerIcon(photo, ctx.t('Play video'))}</div>${bar(ctx, {up: true})}<nav class="ph-actionbar">${bottom}</nav></div>`;
  }
  function list(ctx) {
    const {data, ui, groups} = ctx;
    if (ui.photosList === 'folder') return groups.find(group => group.key === ui.photosFolder)?.items || [];
    if (ui.photosList === 'videos') return newest((data.photos || []).filter(p => p.video));
    if (ui.photosList === 'search') { const q = String(ui.photosQuery || '').trim().toLocaleLowerCase(); return newest(data.photos || []).filter(p => [p.name, p.album].join(' ').toLocaleLowerCase().includes(q)); }
    return newest(data.photos || []);
  }
  function render(ctx) {
    const {ui} = ctx;
    ctx.list = list(ctx);
    if (ui.sub === 'photo') return viewer(ctx);
    // VideoViewActivity (photos-video.js).
    if (ui.sub === 'video') { const photo = ctx.list[ui.photosIndex]; if (photo?.video) return window.GPVideo.render(photo, ctx); }
    if (ui.sub === 'search') return search(ctx);
    if (ui.sub === 'folders') return `<div class="app-view ph-app">${bar(ctx, {up: true, title: P(ctx, 'Folders')})}<div class="ph-scroll">${folders(ctx)}</div></div>`;
    if (ui.sub === 'folder') {
      const group = ctx.groups.find(item => item.key === ui.photosFolder);
      return `<div class="app-view ph-app">${bar(ctx, {up: true, title: group ? (group.translate ? ctx.t(group.name) : group.name) : P(ctx, 'Folders')})}<div class="ph-scroll"><div class="ph-grid">${(group?.items || []).map(p => thumb(ctx, p, 'folder')).join('')}</div></div></div>`;
    }
    const actions = action('photos-unsupported', P(ctx, 'Make a movie'), 'ic_create_movie_20') + action('photos-search', P(ctx, 'Search photos'), 'ic_search_grey_20');
    const view = ui.photosView || 'photos';
    const videos = newest((ctx.data.photos || []).filter(p => p.video));
    if (view === 'videos' && videos.length) return `<div class="app-view ph-app">${bar(ctx, {actions})}<div class="ph-scroll"><div class="ph-grid">${videos.map(p => thumb(ctx, p, 'videos')).join('')}</div></div>${spinner(ctx)}</div>`;
    if (view !== 'photos') return `<div class="app-view ph-app">${bar(ctx, {actions})}<div class="ph-scroll"><p class="ph-empty">${e(ctx.t('No photos'))}</p></div>${spinner(ctx)}</div>`;
    const tab = ui.photosTab || 'camera';
    return `<div class="app-view ph-app">${bar(ctx, {actions})}<nav class="ph-tabs">${[['camera', 'CAMERA'], ['highlights', 'HIGHLIGHTS']].map(([id, label]) => `<button class="${tab === id ? 'active' : ''}" data-action="photos-tab" data-id="${id}">${e(P(ctx, label))}</button>`).join('')}</nav><div class="ph-scroll">${tab === 'highlights' ? highlights(ctx) : camera(ctx)}</div>${spinner(ctx)}</div>`;
  }
  // The spinner's dropdown: host_navigation_item.xml rows.
  function spinner(ctx) {
    if (!ctx.ui.photosSpinner) return '';
    return `<button class="ph-spinner-scrim" data-action="photos-spinner" aria-label="${e(ctx.t('Close'))}"></button><div class="ph-spinner-list" role="listbox">${VIEWS.map(([id, key, icon]) => `<button role="option" aria-selected="${(ctx.ui.photosView || 'photos') === id}" data-action="photos-view" data-id="${id}">${icon ? `<img src="assets/gp-${icon}.png" alt="">` : '<i></i>'}<span>${e(P(ctx, key))}</span></button>`).join('')}</div>`;
  }
  // host_menu.xml: the home shows Select photos, Send feedback, Settings and Help; the one-up view Photo details, Print,
  // Slideshow, Set as and Download.
  function menu(ctx) {
    const {ui} = ctx, item = (name, label) => `<button data-action="${name}" role="menuitem">${e(P(ctx, label))}</button>`;
    const items = ui.sub === 'photo'
      ? [item('photos-details', 'Photo details'), item('photos-unsupported', 'Print'), item('photos-unsupported', 'Slideshow'), item('photos-wallpaper', 'Set as'), item('photos-unsupported', 'Download')]
      : [item('photos-unsupported', 'Select photos'), item('photos-unsupported', 'Send feedback'), item('photos-unsupported', 'Settings'), item('photos-unsupported', 'Help')];
    return `<div class="menu-scrim" data-action="close-overlay"></div><div class="ph-menu" role="menu">${items.join('')}</div>`;
  }
  window.PhotosApp = {render, menu, list, VIEWS};
})();
