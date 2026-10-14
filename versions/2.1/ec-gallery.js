/* Android 2.1 Gallery (Gallery3D.apk, ERE27; an OpenGL app drawing its own textures, here in 2D after the 2010
   screenshots of it).
   - The path bar at the top left (pathbar_bg with pathbar_cap / pathbar_join, icon_home_small "Gallery", then
     icon_camera_small with the album, then the picture's "n/count"); the camera button in the top right corner of the
     album view (btn_camera); behind everything the album's cover, blurred and dimmed (default_background without
     pictures).
   - Albums: each a stack (stack_frame) of its last pictures, the name and count in bold white ("Camera (5)"); the
     pictures the Camera takes are in "Camera". With nothing on the SD card: "There are no items in your collection".
   - An album: its pictures in grid_frame, one column with the phone upright; mode_grid / mode_stack at the top right;
     the scroller (scroller_new) at the bottom.
   - A picture: full screen on black, the zoom buttons (btn_hud_zoom_in / _out) at the top right, the bottom bar
     (selection_menu_bg) Slideshow | Menu; Menu turns it into Share | Delete | More (Details, Set as, Crop, Rotate Left /
     Right, Show on map). Flicks go to the next / previous picture. Slideshow shows them one after the other. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const G = () => EC.text('gallery');
  let slideshow = 0, zoom = 1;
  const photos = c => c.data.photos || [];
  function pathbar(c, parts) {
    const seg = (icon, text, first) => `<span class="ecga-seg${first ? ' first' : ''}">${first ? '' : '<img class="ecga-join" src="assets/ga-pathbar_join.png" alt="">'}<span class="ecga-segbody"><img src="assets/ga-${icon}.png" alt="">${text ? `<span>${esc(text)}</span>` : ''}</span></span>`;
    return `<div class="ecga-path" data-action="ecga-up">${parts.map((p, i) => seg(p[0], p[1], i === 0)).join('')}<img class="ecga-cap" src="assets/ga-pathbar_cap.png" alt=""></div>`;
  }
  function background(c) {
    const p = photos(c).at(-1);
    return p ? `<div class="ecga-bg" style="background-image:url('${EC.media.url(p, 160)}')"></div>` : `<div class="ecga-bg" style="background-image:url('assets/ga-default_background.png')"></div>`;
  }
  function albums(c) {
    const list = photos(c);
    const stack = list.length ? `<button type="button" class="ecga-stack" data-action="ecga-album">${list.slice(-3).map((p, i, a) => `<span class="ecga-sitem" style="--r:${(a.length - 1 - i) * -7 + 4}deg"><img src="${EC.media.url(p, 160)}" alt=""><img class="ecga-frame" src="assets/ga-stack_frame.png" alt=""></span>`).join('')}<img class="ecga-sbadge" src="assets/ga-icon_camera_small.png" alt=""></button><div class="ecga-slabel">${esc(G().t('camera'))}  (${list.length})</div>` : `<div class="ecga-empty">${esc(G().t('no_items'))}</div>`;
    return `<div class="ecga">${background(c)}${pathbar(c, [['icon_home_small', G().t('app_name')]])}<button type="button" class="ecga-cam" data-action="ecga-camera"><img src="assets/ga-btn_camera.png" alt=""></button><div class="ecga-albums">${stack}</div></div>`;
  }
  function album(c) {
    const list = photos(c);
    return `<div class="ecga">${background(c)}${pathbar(c, [['icon_home_small', ''], ['icon_camera_small', G().t('camera')]])}<img class="ecga-mode" src="assets/ga-mode_grid.png" alt="">
      <div class="ecga-grid">${list.map((p, i) => `<button type="button" class="ecga-cell" data-action="ecga-photo" data-index="${i}"><img src="${EC.media.url(p, 160)}" alt="">${p.video ? '<img class="ecga-vid" src="assets/ga-videooverlay.png" alt="">' : ''}</button>`).join('')}</div>
      <img class="ecga-scroller" src="assets/ga-scroller_new.png" alt=""></div>`;
  }
  function photo(c) {
    const list = photos(c), i = Math.min(c.ui.galleryOpen ?? list.length - 1, list.length - 1), p = list[i];
    if (!p) return album(c);
    const menu = c.ui.galleryMenu;
    const bar = slideshow ? '' : menu
      ? `<div class="ecga-bar">${[['share', 'icon_share'], ['delete', 'icon_delete'], ['more', 'icon_more']].map(([k, ic], n) => `${n ? '<i class="ecga-div"></i>' : ''}<button type="button" class="ecga-bbtn" data-action="ecga-${k}"><img src="assets/ga-${ic}.png" alt=""><span>${esc(G().t(k))}</span></button>`).join('')}</div>`
      : `<div class="ecga-bar"><button type="button" class="ecga-bbtn" data-action="ecga-slideshow"><img src="assets/ga-icon_play.png" alt=""><span>${esc(G().t('slideshow'))}</span></button><i class="ecga-div"></i><button type="button" class="ecga-bbtn" data-action="ecga-menu"><img src="assets/ga-icon_more.png" alt=""><span>${esc(G().t('menu'))}</span></button></div>`;
    return `<div class="ecga ecga-full"><div class="ecga-pic" data-action="ecga-tap"><img style="transform:scale(${zoom})" src="${EC.media.url(p, 640)}" alt=""></div>
      ${slideshow ? '' : pathbar(c, [['icon_home_small', ''], ['icon_camera_small', ''], ['icon_home_small', `${i + 1}/${list.length}`]])}
      ${slideshow ? '' : `<div class="ecga-zoom"><button type="button" data-action="ecga-zoomin"><img src="assets/ga-btn_hud_zoom_in_normal.png" alt=""></button><button type="button" data-action="ecga-zoomout"><img src="assets/ga-btn_hud_zoom_out_normal.png" alt=""></button></div>`}${bar}</div>`;
  }
  function step(c, d) {
    const n = photos(c).length;
    if (!n) return;
    c.ui.galleryOpen = ((c.ui.galleryOpen ?? n - 1) + d + n) % n; zoom = 1; c.render();
  }
  EC.register('gallery', {
    title: 'Gallery',
    noStatus: c => c.ui.sub === 'photo',
    render(c) { return c.ui.sub === 'photo' ? photo(c) : c.ui.sub === 'album' ? album(c) : albums(c); },
    mount(c, root) {
      const pic = root.querySelector('.ecga-pic');
      if (!pic) return;
      let x0 = null;
      pic.addEventListener('pointerdown', e => { x0 = e.clientX; });
      pic.addEventListener('pointerup', e => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) { c.suppressClick = Date.now() + 300; step(c, dx < 0 ? 1 : -1); } });
    },
    action(name, el, event, c) {
      if ((c.suppressClick || 0) > Date.now() && name === 'ecga-tap') return true;
      switch (name) {
        case 'ecga-camera': c.open('camera'); return true;
        case 'ecga-album': c.open('gallery', 'album'); return true;
        case 'ecga-photo': c.ui.galleryOpen = Number(el.dataset.index); zoom = 1; c.ui.galleryMenu = false; c.open('gallery', 'photo'); return true;
        case 'ecga-up': if (c.ui.sub) c.back(); return true;
        case 'ecga-tap': if (slideshow) { clearInterval(slideshow); slideshow = 0; c.render(); } return true;
        case 'ecga-zoomin': zoom = Math.min(4, zoom * 1.5); c.render(); return true;
        case 'ecga-zoomout': zoom = Math.max(1, zoom / 1.5); c.render(); return true;
        case 'ecga-menu': c.ui.galleryMenu = true; c.render(); return true;
        case 'ecga-slideshow': slideshow = setInterval(() => { if (c.ui.view !== 'gallery') { clearInterval(slideshow); slideshow = 0; return; } step(c, 1); }, 3000); c.render(); return true;
        case 'ecga-share': c.ui.galleryMenu = false; c.ui.smsThread = null; c.open('messaging', 'compose'); return true;
        case 'ecga-delete':
          c.dialog({title: G().t('confirm_delete'), icon: 'fw-ic_dialog_alert.png', message: G().t('are_you_sure'), buttons: [{label: G().t('delete'), action: () => {
            const i = c.ui.galleryOpen; c.data.photos = photos(c).filter((_, n) => n !== i); c.ui.galleryMenu = false; c.save();
            if (!c.data.photos.length) { c.ui.sub = 'album'; } else c.ui.galleryOpen = Math.min(i, c.data.photos.length - 1);
            c.render(); }}, {label: G().t('cancel')}]});
          return true;
        case 'ecga-more': c.dialog({title: '', icon: null, items: ['details', 'set_as', 'crop', 'rotate_left', 'rotate_right', 'show_on_map'].map(k => G().t(k)), onItem: i => { if (i === 5) c.open('maps'); }}); return true;
      }
      return false;
    },
    back(c) {
      if (slideshow) { clearInterval(slideshow); slideshow = 0; c.render(); return true; }
      if (c.ui.galleryMenu) { c.ui.galleryMenu = false; c.render(); return true; }
      return false;
    }
  });
})();
