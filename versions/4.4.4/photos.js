/* Google+ Photos, the "Photos" app of the stock Nexus 5 (GSMArena Nexus 5 review, "Gallery, video and music
   players": "Upon opening the app you'll see two tabs - Camera and Highlights ... three on a line. The very first
   thumb is marked as Folders"). A #dddddd action bar with the pinwheel, the Auto Awesome movie and search buttons,
   CAMERA / HIGHLIGHTS tabs, the Folders view of albums, and a black photo viewer. Pictures are the simulator's own. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const icon = {
    movie: '<svg viewBox="0 0 24 24"><path d="M3 9h18v11H3zm0-4.5 15.5-2.6.4 2.4L3.4 7zM11 12.5h2V14h1.5v2H13v1.5h-2V16H9.5v-2H11z" fill="currentColor" fill-rule="evenodd"/></svg>',
    search: '<svg viewBox="0 0 24 24"><path d="M10 3a7 7 0 0 1 5.6 11.2l5.6 5.6-1.4 1.4-5.6-5.6A7 7 0 1 1 10 3zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" fill="currentColor"/></svg>',
    overflow: '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="19" r="2" fill="currentColor"/></svg>',
    share: '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3" fill="currentColor"/><circle cx="6" cy="12" r="3" fill="currentColor"/><circle cx="18" cy="19" r="3" fill="currentColor"/><path d="m6 12 12-7M6 12l12 7" stroke="currentColor" stroke-width="1.6"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M4 17.2V20h2.8l9.6-9.6-2.8-2.8zm14.7-8.1a.8.8 0 0 0 0-1.1L17 6.3a.8.8 0 0 0-1.1 0l-1.4 1.4 2.8 2.8z" fill="currentColor"/></svg>',
    folder: '<svg viewBox="0 0 24 24"><path d="M3 5h7l2 2h9v12H3z" fill="currentColor"/></svg>',
    chevron: '<svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>'
  };
  const newest = photos => [...photos].sort((a, b) => (b.created || b.id || 0) - (a.created || a.id || 0));
  const thumb = (media, photo, list, cls = '') => `<button class="ph-thumb${cls}" data-action="photos-open" data-id="${photo.id}" data-list="${list}" aria-label="${e(photo.name)}"><img src="${media.image(photo)}" alt=""></button>`;
  function bar({up, title, actions, t}) {
    return `<header class="ph-bar"><button class="ph-up" data-action="${up ? 'back' : 'photos-drawer'}" aria-label="${up ? 'Back' : e(t('Photos'))}">${up ? '<span aria-hidden="true">‹</span>' : '<i aria-hidden="true"></i>'}<img src="assets/photos.png" alt=""></button><h2>${e(title)}</h2>${actions}</header>`;
  }
  const btn = (action, label, glyph) => `<button class="ph-btn" data-action="${action}" aria-label="${e(label)}">${icon[glyph]}</button>`;
  // Camera: the camera roll, newest first, three on a line, after the Folders tile.
  function camera(ctx) {
    const {data, media, t} = ctx, photos = newest(data.photos || []);
    const cover = photos[0];
    const folders = `<button class="ph-thumb ph-folders" data-action="photos-folders" aria-label="${e(t('Folders'))}">${cover ? `<img src="${media.image(cover)}" alt="">` : ''}<span>${icon.folder}${e(t('Folders'))}</span></button>`;
    return `<div class="ph-grid">${folders}${photos.map(p => thumb(media, p, 'camera')).join('')}</div>`;
  }
  // Highlights: a day header with a share button over the day's best shots, the first one larger.
  function highlights(ctx) {
    const {data, media, t, locale} = ctx;
    const days = new Map();
    for (const photo of newest(data.photos || [])) {
      const date = photo.created ? new Date(photo.created) : null, key = date ? date.toDateString() : 'unknown';
      if (!days.has(key)) days.set(key, {date, items: []});
      days.get(key).items.push(photo);
    }
    if (!days.size) return `<p class="ph-empty">${e(t('No photos'))}</p>`;
    return [...days.values()].map(day => `<section class="ph-day"><h3><span>${e(day.date ? day.date.toLocaleDateString(locale, {month: 'long', day: 'numeric', year: 'numeric'}) : t('Earlier'))}</span><button class="ph-btn" data-action="photos-share-day" data-id="${day.items[0].id}" aria-label="${e(t('Share'))}">${icon.share}</button></h3><div class="ph-mosaic">${day.items.slice(0, 7).map((p, i) => thumb(media, p, 'highlights', i === 0 ? ' big' : '')).join('')}</div></section>`).join('');
  }
  function folders(ctx) {
    const {data, media, t, groups} = ctx;
    return `<div class="ph-folders-list">${groups.map(group => `<button class="ph-folder" data-action="photos-folder" data-id="${e(group.key)}"><span class="ph-folder-name">${e(group.translate ? t(group.name) : group.name)}</span><span class="ph-folder-strip">${group.items.slice(0, 3).map((p, i) => `<img class="${i === 0 ? 'lead' : ''}" src="${media.image(p)}" alt="">`).join('')}<span class="ph-chevron">${icon.chevron}</span></span></button>`).join('') || `<p class="ph-empty">${e(t('No photos'))}</p>`}</div>`;
  }
  function viewer(ctx) {
    const {ui, media, t, list} = ctx;
    const photo = list[ui.photosIndex] || list[0];
    if (!photo) return '';
    return `<div class="app-view ph-app ph-viewer-view${ui.photosChrome === false ? ' ph-bare' : ''}"><div class="ph-viewer" data-action="photos-toggle-bars"><img src="${media.image(photo)}" alt="${e(photo.name)}" draggable="false"></div><header class="ph-bar ph-viewer-bar"><button class="ph-up" data-action="back" aria-label="Back"><span aria-hidden="true">‹</span><img src="assets/photos.png" alt=""></button><h2></h2>${btn('gallery-share-message', t('Share'), 'share')}${btn('photos-edit', t('Edit'), 'edit')}${btn('photos-menu', t('More options'), 'overflow')}</header></div>`;
  }
  function list(ctx) {
    const {data, ui, groups} = ctx;
    if (ui.photosList === 'folder') return groups.find(group => group.key === ui.photosFolder)?.items || [];
    return newest(data.photos || []);
  }
  function render(ctx) {
    const {ui, t} = ctx;
    ctx.list = list(ctx);
    if (ui.sub === 'photo') return viewer(ctx);
    if (ui.sub === 'folders') return `<div class="app-view ph-app">${bar({up: true, title: t('Folders'), actions: btn('photos-menu', t('More options'), 'overflow'), t})}<div class="ph-scroll">${folders(ctx)}</div></div>`;
    if (ui.sub === 'folder') {
      const group = ctx.groups.find(item => item.key === ui.photosFolder);
      return `<div class="app-view ph-app">${bar({up: true, title: group ? (group.translate ? t(group.name) : group.name) : t('Folders'), actions: btn('photos-menu', t('More options'), 'overflow'), t})}<div class="ph-scroll"><div class="ph-grid">${(group?.items || []).map(p => thumb(ctx.media, p, 'folder')).join('')}</div></div></div>`;
    }
    const tab = ui.photosTab || 'camera';
    const actions = btn('photos-unsupported', t('Create movie'), 'movie') + btn('photos-unsupported', t('Search'), 'search') + btn('photos-menu', t('More options'), 'overflow');
    return `<div class="app-view ph-app">${bar({title: t('Photos'), actions, t})}<nav class="ph-tabs">${[['camera', 'Camera'], ['highlights', 'Highlights']].map(([id, label]) => `<button class="${tab === id ? 'active' : ''}" data-action="photos-tab" data-id="${id}">${e(t(label))}</button>`).join('')}</nav><div class="ph-scroll">${tab === 'highlights' ? highlights(ctx) : camera(ctx)}</div></div>`;
  }
  function menu(ctx) {
    const {t, ui} = ctx;
    const item = (action, label) => `<button data-action="${action}" role="menuitem">${e(t(label))}</button>`;
    const items = ui.sub === 'photo' ? [item('photos-delete', 'Delete'), item('photos-wallpaper', 'Set as wallpaper'), item('photos-details', 'Details')] : [item('photos-unsupported', 'Settings'), item('photos-unsupported', 'Help')];
    return `<div class="menu-scrim" data-action="close-overlay"></div><div class="ph-menu${ui.sub === 'photo' ? ' dark' : ''}" role="menu">${items.join('')}</div>`;
  }
  window.PhotosApp = {render, menu, list};
})();
