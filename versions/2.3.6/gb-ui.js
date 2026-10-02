/* Android 2.3.6 framework widgets shared by every screen: the options IconMenu (Menu key) and AlertDialog.
   hdpi px x 0.575, 1 dp = 0.8625px. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // Icons are framework drawables ("ic_menu_add" -> assets/gb-ic_menu_add.png) or full asset file names.
  const src = icon => icon.includes('.') ? `assets/${icon}` : `assets/gb-${icon}.png`;
  const attrs = item => `data-action="${e(item.action)}"${item.id != null ? ` data-id="${e(item.id)}"` : ''}${item.app ? ` data-app="${e(item.app)}"` : ''}${item.disabled ? ' disabled' : ''}`;

  /* icon_menu_layout.xml: rowHeight 66 dip, maxItems 6, maxRows 3, maxItemsPerRow 3. More than six items show the
     first five plus "More" (ic_menu_more). IconMenuView.layoutItemsUsingGravity spreads the items evenly over
     ceil(n / 3) rows and gives the leftovers to the bottom rows. */
  function rows(count) {
    if (!count) return [];
    const numRows = Math.min(Math.ceil(count / 3), 3), base = Math.floor(count / numRows), leftover = count % numRows;
    return Array.from({length: numRows}, (_, i) => base + (i >= numRows - leftover ? 1 : 0));
  }
  function menu(items, t) {
    const shown = items.length > 6 ? [...items.slice(0, 5), {action: 'gb-menu-more', title: t('More'), icon: 'ic_menu_more'}] : items;
    let index = 0;
    const layout = rows(shown.length).map(n => shown.slice(index, index += n));
    const item = entry => `<button type="button" class="gbmenu-item" role="menuitem" ${attrs(entry)}>${entry.icon ? `<img src="${e(src(entry.icon))}" alt="">` : ''}<span>${e(entry.title)}</span></button>`;
    return `<div class="gbmenu-scrim" data-action="close-overlay"></div><div class="gbmenu" role="menu">${layout.map(row => `<div class="gbmenu-row">${row.map(item).join('<i class="gbmenu-vdiv"></i>')}</div>`).join('<i class="gbmenu-hdiv"></i>')}</div>`;
  }
  // The expanded menu behind "More": ExpandedMenuView (296 dip) in a dialog with the remaining items.
  const expanded = (items, t) => dialog({items: items.slice(5).map(item => ({...item})), t, expanded: true});

  /* AlertDialog (alert_dialog.xml + AlertController.setBackground): a dark title panel (popup_top_dark, 22 sp title,
     the dialog icon, 1 dip divider), then a dark message (18 sp) or a bright list (22 sp black, 64 dip rows), then the
     buttons on popup_bottom_medium. The window dims what is behind it by 0.6. */
  function dialog({title, icon, message, items, buttons = [], choice, selected, t, expanded, cancel = 'close-overlay', custom}) {
    const sections = [];
    if (title) sections.push({kind: 'title', light: false});
    if (message || custom) sections.push({kind: 'message', light: false});
    if (items) sections.push({kind: 'list', light: true});
    if (buttons.length) sections.push({kind: 'buttons', light: true});
    // setBackground: top / center / bottom pieces, or the full piece when there is only one section.
    const background = (index) => {
      const s = sections[index], light = s.light ? 'bright' : 'dark';
      if (sections.length === 1) return `full-${light}`;
      if (index === 0) return `top-${light}`;
      if (index === sections.length - 1) return s.light ? (buttons.length ? 'bottom-medium' : 'bottom-bright') : 'bottom-dark';
      return `center-${light}`;
    };
    const row = (item, i) => {
      const check = choice ? `<img class="gbdlg-check" src="assets/gb-btn_${choice === 'multi' ? 'check' : 'radio'}_${(choice === 'multi' ? item.checked : i === selected) ? 'on' : 'off'}.png" alt="">` : '';
      return `<button type="button" class="gbdlg-item${item.icon ? ' with-icon' : ''}" ${attrs(item)} ${choice ? `role="${choice === 'multi' ? 'menuitemcheckbox' : 'menuitemradio'}" aria-checked="${choice === 'multi' ? !!item.checked : i === selected}"` : ''}>${item.icon ? `<img class="gbdlg-icon" src="${e(src(item.icon))}" alt="">` : ''}<span>${e(item.title)}</span>${check}</button>`;
    };
    const body = sections.map((s, i) => {
      const cls = `gbdlg-section gbdlg-s-${s.kind} gbdlg-bg-${background(i)}`;
      if (s.kind === 'title') return `<div class="${cls}"><div class="gbdlg-title">${icon ? `<img src="${e(src(icon))}" alt="">` : ''}<h3>${e(title)}</h3></div><i class="gbdlg-divider"></i></div>`;
      if (s.kind === 'message') return `<div class="${cls}">${custom || `<p>${e(message)}</p>`}</div>`;
      if (s.kind === 'list') return `<div class="${cls}"><div class="gbdlg-list" role="${choice ? 'radiogroup' : 'menu'}">${items.map(row).join('')}</div></div>`;
      return `<div class="${cls}"><div class="gbdlg-buttons${buttons.length === 1 ? ' single' : ''}">${buttons.map(button => `<button type="button" class="gbdlg-button" ${attrs(button)}>${e(button.title)}</button>`).join('')}</div></div>`;
    }).join('');
    return `<div class="gbdlg-scrim" data-action="${e(cancel)}"></div><div class="gbdlg${expanded ? ' gbdlg-expanded' : ''}" role="dialog" aria-label="${e(title || '')}">${body}</div>`;
  }

  window.GBUI = {rows, menu, expanded, dialog};
})();
