/* Android 6.0.1 framework AlertDialog (framework-res.apk, Theme.DeviceDefault.Light.Dialog.Alert, the system context's
   theme set by SystemServer, and the Material light dialogs of the apps):
   - the window is dialog_min_width_minor (95 %) of the screen wide in portrait, dialog_background_material insets it
     16 dp (2 dp corners, colorBackgroundFloating white), floating_window_z elevation, the dim behind at 0.6;
   - alert_dialog_material.xml: the title (alert_dialog_title_material: 18 dp from the top, dialogPreferredPadding 24 dp at
     the sides, an optional 32 dp icon 8 dp before it, TextAppearance.Material.Title 20 sp sans-serif-medium #de000000), the
     message (18 dp under the top, TextAppearance.Material.Subhead 16 sp #de000000, 24 dp at the sides), a list
     (select_dialog_material: 8 dp above and below) or custom content, then the button bar
     (alert_dialog_button_bar_material: 4 dp above and below, 12 dp at the sides, neutral at the start and negative,
     positive at the end; Widget.Material.Button.ButtonBar.AlertDialog: 64 x 48 dp minimum, 14 sp medium caps in
     colorAccent #009688);
   - progress_dialog_material.xml: the 48 dp indeterminate spinner (vector_drawable_progress_bar_medium: a 19 dp circle,
     4 dp stroke, square caps, in colorControlActivated) 24 dp before the message, 18 dp above and below.
   Use: c.dialog({title, icon, message, items: [{html}], html, buttons: [{label, action(c), neutral, disabled}], progress,
   cancelable, onItem(i, c), onLongItem(i, c), mount(c, win)}) opens it as the overlay 'dialog'; MM.dialog.markup / .action draw and drive the same for a module
   that owns its overlay (the power menu). */
(() => {
  'use strict';
  function markup(c, d) {
    const head = d.title ? `<div class="mmdlg-title">${d.icon ? `<img src="${c.safe(d.icon)}" alt="">` : ''}<span>${c.safe(d.title)}</span></div>` : '';
    const message = d.message ? `<div class="mmdlg-message${d.title ? '' : ' first'}">${c.safe(d.message)}</div>` : '';
    const progress = d.progress ? `<div class="mmdlg-progress"><svg class="mmdlg-spinner" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="19"/></svg><span>${c.safe(d.progress)}</span></div>` : '';
    const items = d.items ? `<div class="mmdlg-list">${d.items.map((item, i) => `<button type="button" class="mmdlg-item" data-action="mmdlg-item" data-index="${i}">${item.html}</button>`).join('')}</div>` : '';
    const buttons = d.buttons?.length ? `<div class="mmdlg-buttons">${d.buttons.map((b, i) => `${b.neutral ? '' : i === 0 || d.buttons[i - 1]?.neutral ? '<i class="mmdlg-spacer"></i>' : ''}<button type="button" class="mmdlg-button" data-action="mmdlg-button" data-index="${i}"${b.disabled ? ' disabled' : ''}>${c.safe(b.label)}</button>`).join('')}</div>` : '';
    return `<div class="mmdlg"><div class="mmdlg-dim" data-action="mmdlg-cancel"></div><div class="mmdlg-win" role="dialog">${head}${message}${progress}${items}${d.html ? `<div class="mmdlg-body">${d.html}</div>` : ''}${buttons}</div></div>`;
  }
  function close(c) { if (c.ui.overlay === 'dialog') { c.ui.dialogSpec = null; c.closeOverlay(); } }
  function action(c, name, el, d, done = () => close(c)) {
    if (name === 'mmdlg-cancel') { if (d.cancelable !== false) { done(); d.onCancel?.(c); } return true; }
    if (name === 'mmdlg-button') { const b = d.buttons[+el.dataset.index]; done(); b.action?.(c); return true; }
    if (name === 'mmdlg-item') { const i = +el.dataset.index; if (!d.keepOpen) done(); d.onItem?.(i, c); return true; }
    return false;
  }
  // A long press on a list row (GlobalActions' setOnItemLongClickListener).
  function mountLong(c, root, d, done = () => close(c)) {
    if (!d.onLongItem) return;
    for (const el of root.querySelectorAll('.mmdlg-item')) {
      let timer = 0, held = false;
      el.addEventListener('pointerdown', () => { held = false; timer = setTimeout(() => { held = true; if (d.onLongItem(+el.dataset.index, c)) done(); }, 500); });
      for (const type of ['pointerup', 'pointerleave', 'pointercancel']) el.addEventListener(type, () => clearTimeout(timer));
      el.addEventListener('click', e => { if (held) { e.stopPropagation(); held = false; } }, true);
    }
  }
  MM.dialog = {markup, action, mountLong, close};

  MM.register('dialog', {
    app: false,
    init(c) { c.dialog = spec => { c.ui.dialogSpec = spec; c.overlay('dialog'); }; c.closeDialog = () => close(c); },
    render: c => c.ui.dialogSpec ? markup(c, c.ui.dialogSpec) : '',
    mount(c, root) { const d = c.ui.dialogSpec; if (d) { mountLong(c, root, d); d.mount?.(c, root.querySelector('.mmdlg-win')); } },
    back(c) { const d = c.ui.dialogSpec; if (d?.cancelable === false) return true; close(c); d?.onCancel?.(c); return true; },
    action(name, el, event, c) { return c.ui.dialogSpec ? action(c, name, el, c.ui.dialogSpec) : false; }
  });
})();
