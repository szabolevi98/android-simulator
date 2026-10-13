/* Android 2.1 framework windows every app uses: the options menu, AlertDialog and Toast (framework-res ERE27).
   - c.menu(items): the icon menu (icon_menu_layout.xml: IconMenuView, rows of 65 dp, at most 3 a row and 6 items; with
     more, the sixth is More (ic_menu_more) and opens the expanded list menu, 296 dp wide, rows of 64 dp). Rows are
     filled from the bottom: the top row has the fewer items (5 = 2 + 3). Items: icon over a 14 sp textColorPrimaryInverse
     title (TextAppearance.Widget.IconMenu.Item), padding 3 / 3 / 1 dp, divider_vertical_bright / divider_horizontal_bright
     between, highlight_pressed when pressed; the panel is menu_background_fill_parent_width; options_panel_enter / exit:
     150 ms, a quarter of its height up and fading in (decelerate), half its height down and fading out (accelerate).
     items: [{label, icon, action(c)}].
   - c.dialog(spec): alert_dialog.xml with AlertController's backgrounds (title dark, message dark, list bright, buttons
     bright; full / top / center / bottom pieces, bottomMedium under a list with buttons), the window dimmed 0.6.
     spec: {title, icon, message, items: [label…], choice: 'single' | 'multi', checked, buttons: [{label, action}],
     onItem(index, c), html}. Title: textAppearanceLarge (22 sp, white); message: textAppearanceMedium (18 sp, white);
     list rows: select_dialog_item (22 sp black, 64 dp, padding 14 / 15 dp); buttons: btn_default, 14 sp black.
   - c.toast(text, long): transient_notification.xml (toast_frame, 14 sp white, shadow #bb000000 radius 2.75), bottom
     centre 64 dp up (toast_y_offset), 2 s or 3.5 s. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const F = () => EC.text('framework');
  let menu = null, dialog = null, toastTimer = 0;

  // IconMenuView.layoutItems: as few rows as the items need, the extra items in the lower rows.
  function rows(n) {
    const count = Math.ceil(n / 3), base = Math.floor(n / count), extra = n % count;
    return Array.from({length: count}, (_, i) => base + (i >= count - extra ? 1 : 0));
  }
  function renderMenu(c) {
    if (menu.expanded) {
      const list = menu.items.slice(5).map((item, i) => `<button type="button" class="ecui-xitem" data-action="ecui-item" data-index="${i + 5}"><span>${esc(item.label)}</span></button>`).join('');
      return `<div class="ecui-scrim" data-action="ecui-dismiss"></div><div class="ecui-expanded"><i class="ec-bg np-fw-menu_background"></i><div class="ecui-xlist">${list}</div></div>`;
    }
    const items = menu.items.length > 6 ? [...menu.items.slice(0, 5), {label: F().t('more_item_label'), icon: 'fw-ic_menu_more.png', more: true}] : menu.items;
    let index = 0;
    const html = rows(items.length).map(n => `<div class="ecui-row">${Array.from({length: n}, () => {
      const i = index++, item = items[i];
      return `<button type="button" class="ecui-item" data-action="ecui-item" data-index="${item.more ? 'more' : i}"${item.disabled ? ' disabled' : ''}><i class="ec-bg ec-pressed np-fw-highlight_pressed"></i>${item.icon ? `<img src="assets/${esc(item.icon)}" alt="">` : ''}<span>${esc(item.label)}</span></button>`;
    }).join('')}</div>`).join('');
    return `<div class="ecui-scrim" data-action="ecui-dismiss"></div><div class="ecui-menu${menu.closing ? ' closing' : ''}"><i class="ec-bg np-fw-menu_background_fill_parent_width"></i><div class="ecui-rows">${html}</div></div>`;
  }

  // AlertController.setBackground
  function renderDialog(c) {
    const d = dialog, panels = [];
    if (d.title) panels.push(['top', false]);
    if (d.message || d.items) panels.push(['content', !!d.items]);
    if (d.html) panels.push(['custom', false]);
    if (d.buttons?.length) panels.push(['buttons', true]);
    const bg = {};
    panels.forEach(([name, light], i) => {
      const last = i === panels.length - 1, first = i === 0;
      bg[name] = panels.length === 1 ? (light ? 'full_bright' : 'full_dark')
        : first ? (light ? 'top_bright' : 'top_dark')
        : last ? (light ? (d.buttons?.length && name === 'buttons' && panels[i - 1]?.[1] ? 'bottom_medium' : 'bottom_bright') : 'bottom_dark')
        : (light ? 'center_bright' : 'center_dark');
    });
    // ListView with buttons below: the bright list sits on bottomMedium; AlertController gives the buttons it.
    if (d.items && d.buttons?.length) bg.buttons = 'bottom_medium';
    const piece = name => `<i class="ec-bg np-fw-popup_${bg[name]}"></i>`;
    const pad = name => `npp-fw-popup_${bg[name]}`;
    const top = d.title ? `<div class="ecui-top ${pad('top')}">${piece('top')}<div class="ecui-title-row">${d.icon !== null ? `<img src="assets/${esc(d.icon || 'fw-ic_dialog_info.png')}" alt="">` : ''}<span class="ecui-title">${esc(d.title)}</span></div></div>` : '';
    let content = '';
    if (d.items) {
      const mark = i => d.choice === 'single' ? `<img class="ecui-mark" src="assets/fw-btn_radio_${d.checked === i ? 'on' : 'off'}.png" alt="">`
        : d.choice === 'multi' ? `<img class="ecui-mark" src="assets/fw-btn_check_${(d.checked || []).includes(i) ? 'on' : 'off'}.png" alt="">` : '';
      // An item is a label, or {label, icon} for add_list_item.xml rows (drawableLeft, drawablePadding 14 dp, padding 15 dp).
      content = `<div class="ecui-content ecui-list ${pad('content')}">${piece('content')}<div class="ecui-scroll">${d.items.map((item, i) => { const label = typeof item === 'string' ? item : item.label, icon = item?.icon;
        // global_actions_item.xml: the icon, a 22 sp message and a 14 sp status line under it.
        if (d.rows === 'global') return `<button type="button" class="ecui-li ecui-global" data-action="ecui-li" data-index="${i}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><img src="assets/${esc(icon)}" alt=""><span class="ecui-global-text"><span>${esc(label)}</span>${item.status ? `<small>${esc(item.status)}</small>` : ''}</span></button>`;
        return `<button type="button" class="ecui-li${icon ? ' ecui-li-icon' : ''}${d.rows === 'resolve' ? ' ecui-resolve' : ''}" data-action="ecui-li" data-index="${i}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i>${icon ? `<img src="assets/${esc(icon)}" alt="">` : ''}<span>${esc(label)}</span>${mark(i)}</button>`; }).join('<i class="ecui-divider"></i>')}</div></div>`;
    } else if (d.message) content = `<div class="ecui-content ${pad('content')}">${piece('content')}<div class="ecui-scroll ecui-message">${esc(d.message)}</div></div>`;
    const custom = d.html ? `<div class="ecui-custom ${pad('custom')}">${piece('custom')}<div class="ecui-custom-inner">${d.html}</div></div>` : '';
    const buttons = d.buttons?.length ? `<div class="ecui-buttons ${pad('buttons')}">${piece('buttons')}<div class="ecui-button-row${d.buttons.length === 1 ? ' single' : ''}">${d.buttons.map((b, i) => `<button type="button" class="ecui-button" data-action="ecui-button" data-index="${i}"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(b.label)}</span></button>`).join('')}</div></div>` : '';
    return `<div class="ecui-dim${d.blur ? ' blur' : ''}${d.closing ? ' closing' : ''}" data-action="ecui-outside"></div><div class="ecui-dialog" role="dialog" aria-label="${esc(d.title || '')}">${top}${content}${custom}${buttons}</div>`;
  }

  EC.register('ui-menu', {
    app: false,
    render: c => menu ? renderMenu(c) : '',
    action(name, el, event, c) {
      if (name === 'ecui-dismiss') { closeMenu(c); return true; }
      if (name === 'ecui-item') {
        if (el.dataset.index === 'more') { menu.expanded = true; c.overlay('ui-menu'); return true; }
        const item = menu.items[Number(el.dataset.index)];
        closeMenu(c, true);
        item?.action?.(c);
        return true;
      }
      return false;
    },
    back(c) { closeMenu(c); return true; },
    menu(c) { closeMenu(c); return true; }
  });
  function closeMenu(c, instant) {
    if (!menu) return;
    if (instant || menu.expanded) { menu = null; if (c.ui.overlay === 'ui-menu') c.closeOverlay(); return; }
    menu.closing = true;
    c.el.overlay.querySelector('.ecui-menu')?.classList.add('closing');
    setTimeout(() => { menu = null; if (c.ui.overlay === 'ui-menu') c.closeOverlay(); }, 150);
  }

  EC.register('ui-dialog', {
    app: false,
    render: c => dialog ? renderDialog(c) : '',
    mount(c, root) { dialog?.mount?.(root, c); },
    action(name, el, event, c) {
      if (name === 'ecui-outside') { if (dialog.cancelable !== false) closeDialog(c); return true; }
      if (name === 'ecui-button') { const b = dialog.buttons[Number(el.dataset.index)], d = dialog; if (b.keep !== true) closeDialog(c); b.action?.(c, d, c.el.overlay); return true; }
      if (name === 'ecui-li') {
        const i = Number(el.dataset.index), d = dialog;
        if (d.choice === 'multi') { const set = new Set(d.checked || []); set.has(i) ? set.delete(i) : set.add(i); d.checked = [...set]; c.overlay('ui-dialog'); d.onItem?.(i, c, d); return true; }
        if (d.choice === 'single') { d.checked = i; if (!d.buttons?.length || d.closeOnChoice) { closeDialog(c); d.onItem?.(i, c, d); } else c.overlay('ui-dialog'); return true; }
        closeDialog(c); d.onItem?.(i, c, d); return true;
      }
      return dialog?.action?.(name, el, event, c) || false;
    },
    submit(form, event, c) { dialog?.submit?.(form, c); },
    back(c) { if (dialog?.cancelable !== false) { const d = dialog; closeDialog(c); d.onCancel?.(c); } return true; },
    menu: () => true
  });
  function closeDialog(c) { dialog = null; if (c.ui.overlay === 'ui-dialog') c.closeOverlay(); }

  EC.register('ui', {
    app: false,
    init(c) {
      // An activity window with the default theme's title bar (screen_title.xml: 25 dp windowTitleSize, title_bar,
      // TextAppearance.WindowTitle 14 sp bold white with a #bb000000 shadow) and windowContentOverlay title_bar_shadow.
      c.window = (title, inner, cls = '') => `<div class="ecwin ${cls}"><div class="ecwin-title npp-fw-title_bar"><i class="ec-bg np-fw-title_bar"></i><span>${esc(title)}</span></div><div class="ecwin-body"><div class="ecwin-content">${inner}</div><img class="ecwin-shadow" src="assets/fw-title_bar_shadow.9.png" alt=""></div></div>`;
      c.menu = items => { menu = {items}; c.overlay('ui-menu'); };
      c.dialog = spec => { dialog = {...spec}; c.overlay('ui-dialog'); return dialog; };
      c.closeDialog = () => closeDialog(c);
      c.toast = (text, long) => {
        let layer = c.el.screen.querySelector('.ecui-toast-layer');
        if (!layer) { layer = document.createElement('div'); layer.className = 'ecui-toast-layer'; c.el.screen.append(layer); }
        clearTimeout(toastTimer);
        layer.innerHTML = `<div class="ecui-toast npp-fw-toast_frame"><i class="ec-bg np-fw-toast_frame"></i><span>${esc(text)}</span></div>`;
        toastTimer = setTimeout(() => { const t = layer.firstElementChild; if (t) { t.classList.add('out'); setTimeout(() => t.remove(), 250); } }, long ? 3500 : 2000);
      };
    },
    render: () => ''
  });
})();
