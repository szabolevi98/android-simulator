/* The remaining apps of the Nexus 6 factory image (LMY48Y) as simple screens: Docs 1.4, Sheets 1.4 and Slides 1.2
   (the Drive editors: a toolbar in the brand colour, the recent files of that kind from the simulator's Drive, the red
   create button and a read-only file view), Fit 1.51 (today's active time and steps), Newsstand 3.3 (Read Now
   cards) and Wallet 8.0 (its #4285F4 toolbar, the Wallet balance and the empty card list). All content is offline and
   made up. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const APPS = ['docs', 'sheets', 'slides', 'fit', 'newsstand', 'wallet'];
  // Brand colours (toolbar, status bar) of the 2015 apps.
  const COLORS = {docs: ['#4285f4', '#3367d6'], sheets: ['#0f9d58', '#0b8043'], slides: ['#f4b400', '#f09300'], fit: ['#ffffff', '#bdbdbd'], newsstand: ['#3f51b5', '#303f9f'], wallet: ['#4285f4', '#3367d6']};
  const KIND = {docs: 'doc', sheets: 'sheet', slides: 'slides'};
  const TITLE = {docs: 'Recent documents', sheets: 'Recent spreadsheets', slides: 'Recent presentations'};
  const svg = {
    menu: '<svg viewBox="0 0 24 24"><path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" fill="currentColor"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20z" fill="currentColor"/></svg>',
    search: '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" fill="currentColor"/></svg>',
    more: '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="19" r="2" fill="currentColor"/></svg>',
    doc: '<svg viewBox="0 0 24 24"><path d="M6 2h9l5 5v15H6zm8 1.5V8h4.5zM8 12h8v1.5H8zm0 3h8v1.5H8zm0 3h5v1.5H8z" fill="currentColor"/></svg>',
    card: '<svg viewBox="0 0 24 24"><path d="M3 5h18v14H3zm2 3v2h14V8zm0 5v4h14v-4z" fill="currentColor"/></svg>'
  };
  const bar = (app, title, {up = false, dark = false} = {}) => `<header class="lpx-bar${dark ? ' dark' : ''}" style="background:${COLORS[app][0]}"><button class="lpx-btn" data-action="${up ? 'back' : 'lpx-menu'}" aria-label="${e(up ? 'Navigate up' : 'Open navigation drawer')}">${up ? svg.back : svg.menu}</button><h2>${e(title)}</h2><button class="lpx-btn" data-action="lpx-unavailable" aria-label="Search">${svg.search}</button><button class="lpx-btn" data-action="lpx-unavailable" aria-label="More options">${svg.more}</button></header>`;
  function render(app, {files, ui, t, locale}) {
    if (KIND[app]) {
      const list = files.filter(file => file.kind === KIND[app]);
      const open = ui.sub && list.find(file => file.id === ui.sub);
      if (open) return `<div class="app-view lpx-app lpx-editor">${bar(app, open.name, {up: true})}<div class="lpx-page"><article class="lpx-paper ${KIND[app]}">${KIND[app] === 'sheet' ? `<table>${open.text.split('\n').map((line, i) => `<tr><th>${i + 1}</th>${line.split(/\s+(?=\S+$)/).map(cell => `<td>${e(cell)}</td>`).join('')}</tr>`).join('')}</table>` : open.text.split('\n').map(line => `<p>${e(line)}</p>`).join('')}</article></div></div>`;
      const rows = list.map(file => `<button class="lpx-file" data-action="lpx-open" data-id="${e(file.id)}"><span class="lpx-file-icon" style="color:${COLORS[app][0]}">${svg.doc}</span><span class="lpx-file-copy"><strong>${e(file.name)}</strong><small>${e(t('Modified'))} ${e(file.date)}</small></span></button>`).join('');
      return `<div class="app-view lpx-app">${bar(app, t(TITLE[app]))}<div class="lpx-list">${rows || `<p class="lpx-empty">${e(t('No recent files'))}</p>`}</div><button class="lpx-fab" data-action="lpx-unavailable" aria-label="${e(t('Create new'))}">${svg.plus}</button></div>`;
    }
    if (app === 'fit') {
      const steps = 2431, active = 18, goal = 30, angle = Math.round(active / goal * 360);
      return `<div class="app-view lpx-app lpx-fit">${bar('fit', t('Fit'), {dark: true})}<div class="lpx-page"><div class="lpx-ring" style="--a:${angle}deg"><div><b>${active}</b><small>/${goal} ${e(t('min'))}</small><span>${e(t('Active time'))}</span></div></div><div class="lpx-stats"><div><b>${steps.toLocaleString(locale)}</b><small>${e(t('Steps'))}</small></div><div><b>1.7</b><small>km</small></div><div><b>86</b><small>${e(t('Calories'))}</small></div></div><div class="lpx-card"><strong>${e(t('Walking'))}</strong><small>${e(t('Today'))} · 18 ${e(t('min'))}</small></div></div></div>`;
    }
    if (app === 'newsstand') {
      const stories = [['Material design comes to more apps', 'Gadget Weekly', '#5c6bc0'], ['A weekend of trails above the city', 'Trail & Summit', '#43a047'], ['Five autumn soups in thirty minutes', 'Weekend Kitchen', '#ef6c00']];
      return `<div class="app-view lpx-app">${bar('newsstand', t('Read Now'))}<div class="lpx-list lpx-cards">${stories.map(([title, source, color]) => `<article class="lpx-story"><div class="lpx-story-art" style="background:${color}"></div><div class="lpx-story-copy"><small>${e(source)}</small><strong>${e(title)}</strong></div></article>`).join('')}</div></div>`;
    }
    if (app === 'wallet') return `<div class="app-view lpx-app">${bar('wallet', t('Wallet'))}<div class="lpx-page"><div class="lpx-card lpx-balance"><small>${e(t('Wallet Balance'))}</small><b>$0.00</b></div><div class="lpx-card"><span class="lpx-file-icon" style="color:#4285f4">${svg.card}</span><strong>${e(t('Add a card to tap and pay'))}</strong><small>${e(t('Pay in stores with your phone. Not available offline.'))}</small></div></div><button class="lpx-fab" style="background:#4285f4" data-action="lpx-unavailable" aria-label="${e(t('Send money'))}">${svg.plus}</button></div>`;
    return '';
  }
  window.LPExtraApps = {APPS, COLORS, render};
})();
