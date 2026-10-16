/* Android 6.0.1 home screen: the Google Now Launcher (Launcher3 and GEL in Velvet.apk 5.3.27, the layout of
   BullheadLayout.apk), the screen 'home'.
   - InvariantDeviceProfile: the 5X's smallest / largest app sizes (387.43 x 659.43 dp without the system bars) are
     nearest the "Large Phone" profile: a 5 x 5 workspace, 5 hotseat icons with the all apps button at rank 2, 4 x 4
     folders; the sizes come from the three nearest profiles weighted 100000 / distance^5: icons 63.9 dp, labels 14.38
     sp, hotseat icons 56 dp. DeviceProfile in pixels at 420 dpi (getDimensionPixelSize rounds): edge margin 6 dp = 16 px,
     the search bar 32 px from the top and 56 dp = 147 px high, the workspace padded 11 px at the sides (32 px less the 21
     px default widget padding), 179 px at the top and hotseat 232 px (icon + 4 edges) + page indicator 53 px at the
     bottom; a cell is the icon with the label's font height and the 11 px drawable padding (230 px), the workspace's
     5 x 5 cells share the rest (211.6 x 253.4 px) and centre that content (ShortcutAndWidgetContainer: 11 px down).
   - The labels: Icon style, white, one line, BubbleTextView's two shadows (4 px at 2 px down #dd000000, 1.75 px #cc000000).
   - The search bar: the image's search_widget.xml (search_bg, the Google logo ic_searchbox_google 16 dp in, the 56 dp
     mic button ic_mic_none in gray_700), in the bounds DeviceProfile gives it; it opens Google (Velvet).
   - The hotseat: its CellLayout 2 edges in from each side, the icons centred without labels; the all apps button is
     ic_allapps (pressed: ic_allapps_pressed) at allAppsButtonVisualSize, 17 % smaller than the hotseat icon.
   - Folders: FolderIcon draws portal_ring_inner (folderIconSize, an edge larger all round, an edge higher) and the first
     three items stacked in perspective (PERSPECTIVE_SCALE_FACTOR 0.35, SHIFT 0.18, the back ones darkened up to 80 / 255);
     open, user_folder.xml: quantum_panel (#f5f5f5, 2 dp corners, 4 dp inset), the grid FolderPagedView sizes (taller
     first, at most 4 x 4) of folder cells (a cell + 3 edges wide, + 1 edge high), the name in a 14 sp condensed field
     below; it is centred on its icon and kept inside the workspace's page area.
   - Pages: GEL's Google Now page to the left of the home page (custom content) and the workspace pages; the wallpaper
     offset (Workspace.WallpaperOffsetInterpolator) is 0 with one workspace page, the default wallpaper's left edge. */
(() => {
  'use strict';
  const T = () => MM.text('launcher');
  const PX = 2.625;
  const dp = px => `calc(${(px / PX).toFixed(3)} * var(--dp))`;
  // DeviceProfile, portrait, in px.
  const G = (() => {
    const edge = 16, iconSize = 168, textSize = 38, drawablePadding = 11, fontHeight = 51;
    const W = 1080, H = 1731, searchTop = edge * 2, searchBottom = searchTop + 147;
    const cellContent = fontHeight + iconSize + drawablePadding, hotseatH = iconSize + edge * 4, indicatorH = 53;
    const ws = {left: 11, top: searchBottom, right: W - 11, bottom: H - hotseatH - indicatorH};
    return {edge, iconSize, textSize, drawablePadding, fontHeight, W, H, searchTop, searchBottom, cellContent, hotseatH, indicatorH, ws,
      cellW: (ws.right - ws.left) / 5, cellH: (ws.bottom - ws.top) / 5, hotseatIcon: 147, allAppsButton: Math.trunc((1 - .17) * 147),
      folderCellW: iconSize + edge * 3, folderCellH: cellContent + edge, folderIcon: iconSize + edge * 2};
  })();
  MM.launcherGrid = G;

  // The saved home: pages of {type, app | title + items, x, y}, the hotseat's five ranks (2 is the all apps button).
  function fromLayout() {
    const pages = [[]], hotseat = [null, null, 'allapps', null, null];
    for (const it of MM.defaultWorkspace || []) {
      if (it.type === 'app' && it.container === 'hotseat') hotseat[it.screen] = it.app;
      else if (it.type === 'app') (pages[it.screen] ||= []).push({type: 'app', app: it.app, x: it.x, y: it.y});
      else (pages[it.screen] ||= []).push({type: 'folder', title: it.title, items: it.items.slice(), x: it.x, y: it.y});
    }
    return {pages, hotseat};
  }
  MM.defaults.home = null;
  const home = c => c.data.home || (c.data.home = fromLayout());

  const label = (c, id) => { const a = MM.appsData[id]; return a ? (a.label[c.lang] || a.label.en) : id; };
  const folderTitle = (c, f) => typeof f.title === 'string' ? f.title : (f.title?.[c.lang] || f.title?.en || '');
  MM.appLabel = label;

  function icon(c, item, where) {
    if (item.type === 'folder') return folderIcon(c, item, where);
    const a = MM.appsData[item.app];
    return `<button type="button" class="mmh-icon ${where}" data-action="mmh-app" data-app="${item.app}"><img src="${a?.icon}" alt=""><span>${c.safe(label(c, item.app))}</span></button>`;
  }
  // FolderIcon.computePreviewDrawingParams / computePreviewItemDrawingParams, for its first three items.
  function folderPreview(f) {
    const previewSize = G.folderIcon, padding = 11, avail = previewSize - 2 * padding;
    const adjusted = Math.trunc(avail / 2 * 1.8), unscaledH = Math.trunc(G.iconSize * 1.18);
    const baseScale = adjusted / unscaledH, baseSize = Math.trunc(G.iconSize * baseScale), shift = baseSize * .18;
    const items = f.items.slice(0, 3);
    return items.map((app, i) => {
      const idx = 2 - i, r = idx / 2, scale = 1 - .35 * (1 - r), size = scale * baseSize;
      // dispatchDraw translates by mPreviewOffsetY (preview padding + folderBackgroundOffset); transY adds the icon's
      // top padding (11 px in a workspace cell); transX centres the item in the cell.
      const y = (padding - G.edge) + avail - ((1 - r) * shift + size + (1 - scale) * baseSize) + 11;
      const x = (G.cellW - size) / 2;
      return {app, x, y, size, overlay: Math.trunc((1 - r) * 80) / 255};
    }).reverse();
  }
  function folderIcon(c, f, where) {
    const items = folderPreview(f).map(p => `<span class="mmh-fi" style="left:${dp(p.x)};top:${dp(p.y)};width:${dp(p.size)};height:${dp(p.size)};--shade:${p.overlay.toFixed(3)}"><img src="${MM.appsData[p.app]?.icon}" alt=""></span>`).join('');
    return `<button type="button" class="mmh-icon mmh-folder ${where}" data-action="mmh-folder" aria-label="${c.safe(T().fmt('folder_name_format', null, folderTitle(c, f)))}"><i class="mmh-ring"></i>${items}<span>${c.safe(folderTitle(c, f))}</span></button>`;
  }

  function pageHtml(c, items, p) {
    return `<div class="mmh-page" data-page="${p}">${items.map((it, i) => `<div class="mmh-cell" style="left:${dp(G.cellW * it.x)};top:${dp(G.cellH * it.y)}" data-index="${i}">${icon(c, it, 'ws')}</div>`).join('')}</div>`;
  }

  function render(c) {
    const h = home(c), st = c.ui.home || (c.ui.home = {page: 1, folder: null});
    const t = T();
    const hotseat = h.hotseat.map((id, rank) => `<div class="mmh-hs" style="left:${dp(G.edge * 2 + rank * (G.W - G.edge * 4) / 5)}">${id === 'allapps'
      ? `<button type="button" class="mmh-allapps" data-action="mmh-allapps" aria-label="${c.safe(t.t('all_apps_button_label'))}"></button>`
      : id ? icon(c, {type: 'app', app: id}, 'hs') : ''}</div>`).join('');
    const pages = h.pages.map((items, i) => pageHtml(c, items, i + 1)).join('');
    const dots = [0, ...h.pages.map((_, i) => i + 1)].map(i => `<i class="${i === st.page ? 'on' : ''}"></i>`).join('');
    return `<div class="mmh${st.page === 0 ? ' now' : ''}" style="--page:${st.page}">
      <div class="mmh-strip"><div class="mmh-nowpage">${c.missing('now')}</div>${pages}</div>
      <div class="mmh-qsb np-gel-search_bg"><button type="button" class="mmh-qsb-plate" data-action="mmh-search" aria-label="${c.safe(t.t('accessibility_google_search_button'))}"><img src="assets/gel-ic_searchbox_google.png" alt="Google"></button><button type="button" class="mmh-qsb-mic" data-action="mmh-voice" aria-label="${c.safe(t.t('accessibility_voice_button'))}"><i></i></button></div>
      <div class="mmh-dots">${dots}</div>
      <div class="mmh-hotseat">${hotseat}</div>
      ${st.folder ? folderHtml(c, st.folder) : ''}</div>`;
  }

  // Folder / FolderPagedView.
  function folderGrid(n) {
    let x = 0, y = 0;
    for (;;) {
      const ox = x, oy = y;
      if (x * y < n) { if ((x <= y || y === 4) && x < 4) x++; else if (y < 4) y++; if (y === 0) y++; }
      else if ((y - 1) * x >= n && y >= x) y = Math.max(0, y - 1);
      else if ((x - 1) * y >= n) x = Math.max(0, x - 1);
      if (x === ox && y === oy) return [x, y];
    }
  }
  function folderHtml(c, ref) {
    const h = home(c), f = h.pages[ref.page - 1]?.[ref.index];
    if (!f) return '';
    const [cols, rows] = folderGrid(f.items.length), inset = 11, padX = 11, padTop = 21, footer = 32 + Math.ceil(37 * 1.172);
    const w = cols * G.folderCellW + padX * 2 + inset * 2, hgt = rows * G.folderCellH + padTop + footer + inset * 2;
    const cx = G.ws.left + G.cellW * (f.x + .5), cy = G.ws.top + G.cellH * f.y + 11 + G.iconSize / 2;
    const left = Math.min(Math.max(G.ws.left, cx - w / 2), G.ws.right - w), top = Math.min(Math.max(G.ws.top, cy - hgt / 2), G.ws.bottom - hgt);
    const cells = f.items.map((id, i) => `<div class="mmh-fcell" style="left:${dp(inset + padX + (i % cols) * G.folderCellW)};top:${dp(inset + padTop + Math.floor(i / cols) * G.folderCellH)}">${icon(c, {type: 'app', app: id}, 'fd')}</div>`).join('');
    return `<div class="mmh-fscrim" data-action="mmh-close-folder"></div><div class="mmh-fpanel" style="left:${dp(left)};top:${dp(top)};width:${dp(w)};height:${dp(hgt)};--ox:${dp(cx - left)};--oy:${dp(cy - top)}">
      <div class="mmh-fgrid">${cells}</div><div class="mmh-fname" style="top:${dp(inset + padTop + rows * G.folderCellH)}">${c.safe(folderTitle(c, f) || T().t('folder_hint_text'))}</div></div>`;
  }

  function mount(c, root) {
    const el = root.querySelector('.mmh'), strip = root.querySelector('.mmh-strip');
    if (!el) return;
    const st = c.ui.home, h = home(c), last = h.pages.length;
    let drag = null;
    el.addEventListener('pointerdown', e => {
      if (e.button || st.folder || e.target.closest('.mmh-hotseat,.mmh-qsb')) return;
      drag = {x: e.clientX, y: e.clientY, moved: false, w: el.clientWidth};
    });
    el.addEventListener('pointermove', e => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(e.clientY - drag.y)) { drag.moved = true; strip.style.transition = 'none'; el.classList.add('scrolling'); }
      if (drag.moved) strip.style.transform = `translateX(calc(${-st.page * 100}% + ${dx}px))`;
    });
    const end = e => {
      if (!drag) return;
      const d = drag; drag = null;
      if (!d.moved) return;
      st.suppressClick = true; setTimeout(() => { st.suppressClick = false; });
      const dx = e.clientX - d.x;
      let page = st.page;
      if (dx < -d.w / 4 && page < last) page++;
      else if (dx > d.w / 4 && page > 0) page--;
      strip.style.transition = ''; strip.style.transform = '';
      el.classList.remove('scrolling');
      st.page = page; el.style.setProperty('--page', page); el.classList.toggle('now', page === 0);
      root.querySelectorAll('.mmh-dots i').forEach((dot, i) => dot.classList.toggle('on', i === page));
    };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  }

  MM.register('home', {
    app: false,
    render, mount,
    reset(c) { if (c.ui.home) { c.ui.home.folder = null; c.ui.home.page = 1; } },
    back(c) { if (c.ui.home?.folder) { c.ui.home.folder = null; c.render(); } return true; },
    action(name, el, event, c) {
      const st = c.ui.home;
      if (st?.suppressClick) return true;
      if (name === 'mmh-app') { if (st.folder) st.folder = null; c.open(el.dataset.app); return true; }
      if (name === 'mmh-folder') {
        const cell = el.closest('.mmh-cell'), page = +el.closest('.mmh-page').dataset.page;
        st.folder = {page, index: +cell.dataset.index}; c.render(); return true;
      }
      if (name === 'mmh-close-folder') { st.folder = null; c.render(); return true; }
      if (name === 'mmh-allapps') { c.open('drawer'); return true; }
      if (name === 'mmh-search') { c.open('search'); return true; }
      if (name === 'mmh-voice') { c.open('search', 'voice'); return true; }
      return false;
    }
  });
})();
