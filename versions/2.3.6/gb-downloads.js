/* Android 2.3.6 Downloads (packages/providers/DownloadProvider/ui): DownloadList (download_list.xml under the "Downloads"
   window title: the date-sorted ExpandableListView grouped by DateSorter - Today, Yesterday, Last 7 days, Last month,
   Older - or the size-sorted ListView, and the bottom_bar selection menu), download_list_item.xml rows (checkbox,
   48 dip icon, bold title, domain, status, size and the date or time) and the download_menu Sort by size / Sort by time
   items. Formatter.formatFileSize gives "845KB" / "2.13MB". */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const text = (lang, key) => { const entry = window.GBStrings?.downloads?.strings?.[key]; return entry ? entry[lang] ?? entry.en : key; };
  // The file type decides the icon (the activity that would open it) and what a click does.
  const KINDS = {image: {icon: 'gallery.png', app: 'gallery'}, audio: {icon: 'music.png', app: 'music'}, other: {icon: 'gb-dl-ic_download_misc_file_type.png'}};
  const DAY = 86400000;
  function seed(now) {
    return [
      {id: 1, title: 'gingerbread-wallpaper.jpg', domain: 'www.android.com', size: 865280, status: 'success', kind: 'image', time: now - 25 * 60000},
      {id: 2, title: 'NexusS_UserGuide.pdf', domain: 'www.google.com', size: 2236416, status: 'success', kind: 'other', time: now - 3 * 3600000},
      {id: 3, title: 'blue-horizon-sample.mp3', domain: 'demotapes.example', size: 4718592, status: 'failed', kind: 'audio', time: now - DAY - 2 * 3600000},
      {id: 4, title: 'android-2.3-highlights.html', domain: 'developer.android.com', size: 18432, status: 'success', kind: 'other', time: now - 4 * DAY},
      {id: 5, title: 'coffee-shop-menu.pdf', domain: 'coffeeshop.example', size: 311296, status: 'queued', kind: 'other', time: now - 12 * DAY}
    ];
  }
  // android.webkit.DateSorter: today, yesterday, the last 7 days, the last month, older.
  function bins(now) {
    const today = new Date(now); today.setHours(0, 0, 0, 0);
    const month = new Date(today); month.setMonth(month.getMonth() - 1);
    return [today.getTime(), today.getTime() - DAY, today.getTime() - 6 * DAY, month.getTime()];
  }
  const binOf = (time, edges) => { const i = edges.findIndex(edge => time >= edge); return i < 0 ? 4 : i; };
  const binLabel = (lang, i) => i === 0 ? text(lang, 'today') : i === 1 ? text(lang, 'yesterday') : i === 2 ? text(lang, 'last_num_days_other').replace('%d', 7) : i === 3 ? text(lang, 'last_month') : text(lang, 'older');
  // Formatter.formatFileSize (2.3): KB above 900 bytes, MB above 900 KB; two decimals below 100, none above.
  function size(bytes, locale) {
    let value = bytes, unit = 'B';
    for (const next of ['KB', 'MB', 'GB']) { if (value <= 900) break; value /= 1024; unit = next; }
    const digits = value < 100 ? 2 : 0;
    return value.toLocaleString(locale, {minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: false}) + unit;
  }
  const STATUS = {success: 'download_success', failed: 'download_error', running: 'download_running', queued: 'download_queued'};
  function when(time, ctx) {
    const today = new Date(ctx.now); today.setHours(0, 0, 0, 0);
    return time < today.getTime()
      ? new Date(time).toLocaleDateString(ctx.locale, {year: 'numeric', month: 'numeric', day: 'numeric'})
      : new Date(time).toLocaleTimeString(ctx.locale, {hour: 'numeric', minute: '2-digit', hour12: !ctx.hour24});
  }
  function item(d, ctx) {
    const on = ctx.selected.includes(d.id);
    return `<div class="gbdl-item" role="button" tabindex="0" data-action="gbdl-open" data-id="${d.id}"><button type="button" class="gbdl-check" data-action="gbdl-select" data-id="${d.id}" role="checkbox" aria-checked="${on}" aria-label="${e(d.title)}"><img src="assets/gb-btn_check_${on ? 'on' : 'off'}.png" alt=""></button><img class="gbdl-icon" src="assets/${(KINDS[d.kind] || KINDS.other).icon}" alt=""><span class="gbdl-title">${e(d.title || text(ctx.lang, 'missing_title'))}</span><span class="gbdl-domain">${e(d.domain)}</span><span class="gbdl-status"><span>${e(text(ctx.lang, STATUS[d.status]))}</span><span class="gbdl-size">${e(size(d.size, ctx.locale))}</span></span><span class="gbdl-date">${e(when(d.time, ctx))}</span></div>`;
  }
  function render(ctx) {
    const T = key => text(ctx.lang, key), list = ctx.downloads;
    let body = '';
    if (!list.length) body = `<div class="gbdl-empty">${e(T('no_downloads'))}</div>`;
    else if (ctx.bySize) body = [...list].sort((a, b) => b.size - a.size).map(d => item(d, ctx)).join('');
    else {
      const edges = bins(ctx.now), groups = [0, 1, 2, 3, 4].map(i => list.filter(d => binOf(d.time, edges) === i).sort((a, b) => b.time - a.time)).map((items, bin) => ({bin, items})).filter(g => g.items.length);
      // DownloadList.onCreate expands the first group.
      body = groups.map((g, i) => { const open = ctx.expanded ? ctx.expanded.includes(g.bin) : i === 0; return `<button type="button" class="gbdl-group" data-action="gbdl-group" data-id="${g.bin}" aria-expanded="${open}"><img src="assets/gb-expander_ic_${open ? 'maximized' : 'minimized'}.png" alt=""><span>${e(binLabel(ctx.lang, g.bin))}</span></button>${open ? g.items.map(d => item(d, ctx)).join('') : ''}`; }).join('');
    }
    // updateSelectionMenu: one selected failed download says Delete, a pending one Remove, a running one Cancel.
    let del = 'delete_download';
    if (ctx.selected.length === 1) { const d = list.find(x => x.id === ctx.selected[0]); if (d?.status === 'queued') del = 'remove_download'; else if (d?.status === 'running') del = 'cancel_running_download'; }
    const bar = ctx.selected.length ? `<div class="gbdl-selbar"><button type="button" class="gbdl-btn" data-action="gbdl-delete">${e(T(del))}</button><button type="button" class="gbdl-btn" data-action="gbdl-deselect">${e(T('deselect_all'))}</button></div>` : '';
    return `<div class="app-view gbdl" data-no-translate><div class="gb-titlebar">${e(T('download_title'))}</div><div class="gbdl-list">${body}</div>${bar}</div>`;
  }
  const menu = ctx => [ctx.bySize ? {action: 'gbdl-sort', id: 'date', title: text(ctx.lang, 'download_menu_sort_by_date'), icon: 'gb-dl-ic_menu_desk_clock.png'} : {action: 'gbdl-sort', id: 'size', title: text(ctx.lang, 'download_menu_sort_by_size'), icon: 'ic_menu_sort_by_size'}];
  // DownloadList.handleItemClick dialogs: a failed download offers Retry / Delete, a queued one Keep / Remove.
  function dialog(d, lang) {
    const T = key => text(lang, key);
    if (d?.status === 'failed') return {title: T('dialog_title_not_available'), icon: 'ic_dialog_alert', message: T('dialog_failed_body'), buttons: [{action: 'gbdl-retry', id: String(d.id), title: T('retry_download')}, {action: 'gbdl-remove', id: String(d.id), title: T('delete_download')}]};
    if (d?.status === 'queued') return {title: T('dialog_title_queued_body'), icon: 'ic_dialog_alert', message: T('dialog_queued_body'), buttons: [{action: 'close-overlay', title: T('keep_queued_download')}, {action: 'gbdl-remove', id: String(d.id), title: T('remove_download')}]};
    return null;
  }
  window.GBDownloads = {KINDS, seed, bins, binOf, size, render, menu, dialog, text};
})();
