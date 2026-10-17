/* Android 6.0.1 framework options menu (framework-res.apk): the action bar's overflow button
   (Widget.Material.ActionButton.Overflow: ic_menu_moreoverflow_material, 36 dp at least, 6 dp before and 10 dp after the
   icon, "More options") opens MenuPopupHelper's ListPopupWindow in Widget.Material.Light.PopupMenu.Overflow:
   overlapAnchor (its top on the button's top), dropDownHorizontalOffset -4 dp from the button's end,
   popup_background_material (2 dp corners, colorBackgroundFloating white), floating_window_z 16 dp; the width is the
   widest row (popup_menu_item_layout: 196 dp at least, the title 16 dp from the start and 16 dp from the end, 48 dp
   dropdownListPreferredItemHeight, TextAppearance.Material.Menu 16 sp in textColorPrimary, a disabled item at
   disabled_alpha_material_light 0.26). The popup_window_enter transition grows it out of the button's corner.
   A checkable item (checked: true / false) has list_menu_item_checkbox's CheckBox at its end.
   Use: c.menu([{label, disabled, checked, action(c)}]) opens it as the overlay 'menu'; MM.menu.button(c) is the overflow button's
   markup with data-action "mm-menu" for a module to open its own items. */
(() => {
  'use strict';
  const items = c => c.ui.menuItems || [];
  MM.menu = {
    button: (c, extra = '') => `<button type="button" class="mm-overflow${extra ? ' ' + extra : ''}" data-action="mm-menu" aria-label="${c.safe(MM.text('framework').t('action_menu_overflow_description'))}"><img src="assets/fw-ic_menu_moreoverflow_material.svg" alt=""></button>`
  };
  MM.register('menu', {
    app: false,
    init(c) { c.menu = list => { c.ui.menuItems = list; c.overlay('menu'); }; },
    render: c => `<div class="mmmenu"><div class="mmmenu-out" data-action="mmmenu-close"></div><div class="mmmenu-pop" role="menu">${items(c).map((it, i) =>
      `<button type="button" class="mmmenu-item" role="menuitem" data-action="mmmenu-item" data-index="${i}"${it.disabled ? ' disabled' : ''}><span>${c.safe(it.label)}</span>${'checked' in it ? `<i class="mmmenu-check${it.checked ? ' on' : ''}"></i>` : ''}</button>`).join('')}</div></div>`,
    action(name, el, event, c) {
      if (name === 'mmmenu-close') { c.closeOverlay(); return true; }
      if (name === 'mmmenu-item') { const it = items(c)[+el.dataset.index]; c.closeOverlay(); it?.action?.(c); return true; }
      return false;
    }
  });
})();
