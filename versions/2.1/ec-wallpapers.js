/* Android 2.1 wallpaper choice:
   - 'wallpaper-chooser': Launcher.startWallpaper's Intent.createChooser(ACTION_SET_WALLPAPER, chooser_wallpaper): the
     ChooserActivity list of the image's handlers, sorted by label (DisplayNameComparator): Gallery (Gallery3D
     Photographs), Live wallpapers (LiveWallpaperListActivity), Wallpapers (Launcher2 WallpaperChooser);
     resolve_list_item.xml rows: 48 dp icon, 22 sp label 10 dp from it, padding 10 / 15 dp.
   - 'wallpapers': Launcher2's WallpaperChooser (wallpaper_chooser.xml): the picture (fitCenter) over a Gallery of the
     array/wallpapers thumbnails (wallpaper_*_small, 170 x 142 px, gallery_item_background) and the Set wallpaper button.
     A picture wallpaper is the 960 x 800 image scrolled with the home screen (WallpaperManager offsets). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const W = () => EC.text('wallpapers');
  const NAMES = ['electric', 'grass', 'canyon', 'monumentvalley', 'tree', 'zanzibar', 'field', 'cloud', 'desert', 'goldengate', 'despair',
    'grass_night', 'galaxy', 'x67', 'nexusrain', 'nexuspattern', 'nexuswallpaper1', 'brown', 'pcut', 'bluedotgrid', 'hazybluedots',
    'ropelights', 'gray', 'greengray', 'lightgrad'];
  const full = n => `assets/l2-wallpaper_${n}.${n === 'nexuswallpaper1' ? 'png' : 'jpg'}`;

  function chooser(c) {
    const items = [
      {label: W().t('Gallery3D/app_name'), icon: 'app-gallery.png', go: () => c.open('gallery')},
      {label: W().t('LiveWallpapersPicker/live_wallpaper_picker_title'), icon: 'lwp-ic_launcher_live_wallpaper.png', go: () => c.open('live-wallpapers')},
      {label: W().t('pick_wallpaper'), icon: 'l2-ic_launcher_wallpaper.png', go: () => c.open('wallpapers')}
    ].sort((a, b) => a.label.localeCompare(b.label, c.locale()));
    c.dialog({title: W().t('chooser_wallpaper'), icon: null, rows: 'resolve', items, onItem: i => items[i].go()});
  }

  EC.register('wallpaper-chooser', {app: false, render: c => { setTimeout(() => chooser(c)); return ''; }});

  EC.register('wallpapers', {
    app: false,
    noStatus: () => false,
    render(c) {
      const pick = c.ui.wallpaperPick ?? 0;
      const strip = NAMES.map((n, i) => `<button type="button" class="ecwp-thumb${i === pick ? ' selected' : ''}" data-action="ecwp-pick" data-index="${i}"><img src="assets/l2-wallpaper_${n}_small.jpg" alt=""></button>`).join('');
      return `<div class="ecwp"><div class="ecwp-preview" style="background-image:url('${full(NAMES[pick])}')"></div><div class="ecwp-gallery">${strip}</div>
        <div class="ecwp-bar"><button type="button" class="ecui-button ecwp-set" data-action="ecwp-set"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(W().t('wallpaper_instructions'))}</span></button></div></div>`;
    },
    mount(c, root) {
      const strip = root.querySelector('.ecwp-gallery'), sel = strip?.querySelector('.selected');
      if (sel) strip.scrollLeft = sel.offsetLeft - strip.offsetLeft - (strip.clientWidth - sel.offsetWidth) / 2;
    },
    action(name, el, event, c) {
      if (name === 'ecwp-pick') { c.ui.wallpaperPick = Number(el.dataset.index); c.render(); return true; }
      if (name === 'ecwp-set') {
        c.data.wallpaper = {type: 'image', src: full(NAMES[c.ui.wallpaperPick ?? 0])};
        c.save(); c.wallpaper?.refresh(); c.home(); return true;
      }
      return false;
    }
  });
})();
