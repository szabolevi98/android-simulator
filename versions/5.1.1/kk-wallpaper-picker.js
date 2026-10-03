/* Android 4.4 Launcher3 WallpaperPickerActivity (packages/apps/Launcher3/WallpaperPicker, android-4.4.4_r1).
   Theme.WallpaperPicker is fullscreen with the wallpaper showing through, and its action bar is a #88000000 overlay with
   one custom button: ic_actionbar_accept and "Set wallpaper". At the bottom sits the wallpaper strip: 2 dp tile shadows
   around a HorizontalScrollView of 106.5 × 94.5 dp tiles. The order is Pick image (the last photo under #66000000 with
   ic_images), then the images picked in this session, the default wallpaper (KitKat: getBuiltInDrawable), the saved
   images, and the live wallpapers with their translucent label bar. AOSP's wallpapers array is empty, so nothing is
   bundled. Selecting a tile previews it full screen; until something is picked the current wallpaper shows. Tapping the
   preview hides or shows the strip. A long press on a picked or saved image starts the "%d selected" CAB with Delete.
   Pick image sends ACTION_GET_CONTENT image/*, which 4.4 answers with DocumentsUI "Open from" on Recent. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // The strip in order; keys are 'default', 'photo:<id>' and 'live:<id>'.
  function tiles(ctx) {
    const {data, ui} = ctx, wp = ui.wp || {};
    const photo = id => data.photos.find(p => p.id === id);
    const temp = (wp.temp || []).filter(photo), saved = (data.kkSavedWallpapers || []).filter(id => photo(id) && !temp.includes(id));
    return [
      ...temp.map(id => ({key: `photo:${id}`, kind: 'photo', photo: photo(id), deletable: true})),
      {key: 'default', kind: 'default'},
      ...saved.map(id => ({key: `photo:${id}`, kind: 'photo', photo: photo(id), deletable: true})),
      ...ctx.live.map(spec => ({key: `live:${spec.id}`, kind: 'live', spec}))
    ];
  }
  function render(ctx) {
    const {data, ui, t} = ctx, wp = ui.wp || {}, list = tiles(ctx), checked = wp.checked || [];
    const nameless = list.filter(tile => tile.kind !== 'live');
    const last = data.photos[data.photos.length - 1];
    const sel = list.find(tile => tile.key === wp.selected);
    const preview = !sel ? '' : sel.kind === 'default' ? "url('assets/kk-default_wallpaper.jpg')" : sel.kind === 'photo' ? `url('${ctx.image(sel.photo)}')` : '';
    const tile = item => {
      const cls = `kwp-tile ${item.kind}${item.key === wp.selected && !checked.length ? ' selected' : ''}${checked.includes(item.key) ? ' checked' : ''}`;
      const label = item.kind === 'live' ? t(item.spec.label) : t('Wallpaper %1$d of %2$d').replace('%1$d', nameless.indexOf(item) + 1).replace('%2$d', nameless.length);
      const img = item.kind === 'default' ? 'assets/kk-default_wallpaper.jpg' : item.kind === 'photo' ? ctx.image(item.photo) : `assets/${item.spec.thumb}`;
      return `<button class="${cls}" data-action="kwp-tile" data-id="${e(item.key)}"${item.deletable ? ' data-kwp-long="1"' : ''} aria-label="${e(label)}" aria-pressed="${item.key === wp.selected}"><img src="${e(img)}" alt="">${item.kind === 'live' ? `<span class="kwp-label">${e(t(item.spec.label))}</span>` : ''}</button>`;
    };
    const pick = `<button class="kwp-tile pick" data-action="kwp-pick"><img src="${last ? e(ctx.image(last)) : ''}" alt=""><span class="kwp-pick-label"><img src="assets/kwp-ic_images.png" alt="">${e(t('Pick image'))}</span></button>`;
    const bar = checked.length
      ? `<div class="kwp-bar cab"><button class="kwp-cab-done" data-action="kwp-cab-done" aria-label="${e(t('Done'))}"><img src="assets/kwp-ic_cab_done_holo_dark.png" alt=""></button><b>${e(t('%1$d selected').replace('%1$d', checked.length))}</b><button class="kwp-cab-delete" data-action="kwp-delete" aria-label="${e(t('Delete'))}"><img src="assets/kwp-ic_menu_delete.png" alt=""></button></div>`
      : `<div class="kwp-bar"><button class="kwp-set" data-action="kwp-set"><img src="assets/kwp-ic_actionbar_accept.png" alt="">${e(t('Set wallpaper'))}</button></div>`;
    return `<div class="app-view kwp" data-no-translate><button class="kwp-crop${preview ? ' on' : ''}" data-action="kwp-tap" aria-label="${e(t('Wallpapers'))}" style="${preview ? `background-image:${preview}` : ''}"></button>${bar}<div class="kwp-strip${wp.stripHidden ? ' hidden' : ''}"><i class="kwp-shadow top"></i><div class="kwp-scroll"><div class="kwp-list">${pick}${list.map(tile).join('')}</div></div><i class="kwp-shadow bottom"></i></div></div>`;
  }
  // DocumentsUI in ACTION_GET_CONTENT mode for image/*: the light action bar with the drawer glyph, the Recent root
  // icon and title, and the item_doc_grid cards (centerCrop thumbnail, title) of the recent images.
  function openFrom(ctx) {
    const {data, t} = ctx, photos = [...data.photos].reverse();
    const card = p => `<button class="kdu-item kwp-doc" data-action="kwp-picked" data-id="${p.id}"><span class="kdu-icon"><img class="kwp-doc-thumb" src="${e(ctx.image(p))}" alt=""></span><span class="kdu-copy"><span class="kdu-title">${e(p.name || '')}</span></span></button>`;
    return `<div class="app-view kdu-app kwp-open" data-no-translate><header class="kdu-ab"><button class="kdu-home kwp-roots" data-action="back" aria-label="${e(t('Open from'))}"><img class="kwp-glyph" src="assets/kdu-ic_drawer_glyph.png" alt=""><img src="assets/kdu-ic_root_recent.png" alt=""></button><h2>${e(t('Recent'))}</h2></header><div class="kdu-content">${photos.length ? `<div class="kdu-grid">${photos.map(card).join('')}</div>` : `<p class="kdu-empty">${e(t('No items'))}</p>`}</div></div>`;
  }
  window.KKWallpaperPicker = {tiles, render, openFrom};
})();
