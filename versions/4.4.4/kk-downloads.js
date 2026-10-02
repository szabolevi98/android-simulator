/* Android 4.4 Downloads: the launcher entry (DownloadProvider ui DownloadList.onCreate) trampolines into DocumentsUI
   with ACTION_MANAGE_ROOT for the "Downloads" root (frameworks/base/packages/DocumentsUI, Theme.Holo.Light).
   Manage mode has no roots drawer; the action bar shows the root icon (ic_root_download) and title with Search and
   Sort by, and Grid view / List view in the overflow. item_doc_list rows: 32 dp mime icon, title, date and size;
   the empty directory says "No items". */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const SORTS = [['name', 'By name'], ['date', 'By date modified'], ['size', 'By size']];
  function size(bytes) { return bytes >= 1048576 ? `${(bytes / 1048576).toFixed(2)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`; }
  function sorted(items, sort) {
    const list = [...items];
    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'size') list.sort((a, b) => b.size - a.size);
    else list.sort((a, b) => b.time - a.time);
    return list;
  }
  function render(items, ui, t, locale) {
    const sort = ui.dlSort || 'date', grid = !!ui.dlGrid;
    const list = sorted(items || [], sort);
    const row = item => `<button class="kdu-item" data-action="toast" data-id="${e(t('No app can open this file.'))}"><span class="kdu-icon"><img src="assets/kdu-ic_root_download.png" alt=""></span><span class="kdu-copy"><span class="kdu-title">${e(item.name)}</span><span class="kdu-line2"><span>${e(new Date(item.time).toLocaleDateString(locale, {month: 'short', day: 'numeric'}))}</span><span>${e(size(item.size))}</span></span></span></button>`;
    const body = list.length ? `<div class="kdu-${grid ? 'grid' : 'list'}">${list.map(row).join('')}</div>` : `<p class="kdu-empty">${e(t('No items'))}</p>`;
    return `<div class="app-view kdu-app"><header class="kdu-ab"><button class="kdu-home" data-action="home" aria-label="${e(t('Downloads'))}"><img src="assets/kdu-ic_root_download.png" alt=""></button><h2>${e(t('Downloads'))}</h2><button data-action="kdu-search" aria-label="${e(t('Search'))}"><img src="assets/kdu-ic_menu_search.png" alt=""></button><button data-action="kdu-menu" data-id="sort" aria-label="${e(t('Sort by'))}"><img src="assets/kdu-ic_menu_sortby_am.png" alt=""></button><button data-action="kdu-menu" data-id="overflow" aria-label="${e(t('More options'))}"><img src="assets/kdu-ic_menu_overflow.png" alt=""></button></header><div class="kdu-content">${body}</div></div>`;
  }
  function menu(kind, ui, t) {
    const items = kind === 'sort' ? SORTS.map(([id, label]) => `<button data-action="kdu-sort" data-id="${id}" role="menuitemradio" aria-checked="${(ui.dlSort || 'date') === id}">${e(t(label))}<img src="assets/btn_radio_${(ui.dlSort || 'date') === id ? 'on' : 'off'}_holo_light.png" alt=""></button>`).join('') : `<button data-action="kdu-view" data-id="${ui.dlGrid ? 'list' : 'grid'}">${e(t(ui.dlGrid ? 'List view' : 'Grid view'))}</button>`;
    return `<div class="menu-scrim" data-action="close-overlay"></div><div class="kdu-menu" role="menu">${items}</div>`;
  }
  window.KKDownloads = {render, menu, sorted, size, SORTS};
})();
