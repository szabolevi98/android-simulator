/* Android 2.1 Settings: Factory data reset (MasterClear) and Format SD card (MediaFormat).
   - Each is two pages in its activity: master_clear_primary.xml / media_format_primary.xml (the explanation, then a
     150 dp button 40 dp below it: Reset phone / Format SD card) and, after ConfirmLockPattern when an unlock pattern is
     in use ("Draw your unlock pattern" with the reason as footer), master_clear_final.xml / media_format_final.xml
     (Erase everything). master_clear_desc's <li> lines carry a BulletSpan(10).
   - Erase everything: the reset wipes the stored phone and starts it again from the boot; the format empties the SD
     card's pictures and videos (the Camera's shots) and goes back. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const X = () => EC.text('settingsx');
  const t = k => X().t(k);
  const stack = c => c.ui.settingsStack;
  const button = (action, label) => `<button type="button" class="ecui-button ecsx-btn" data-action="${action}"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(label)}</span></button>`;
  // The lines that do not end in a colon are the <li> items.
  const bullets = text => text.split('\n').map(line => line.trim().endsWith(':') ? `<div>${esc(line)}</div>` : `<div class="ecsx-li">${esc(line)}</div>`).join('');
  const PAGES = {
    'master-clear': c => [t('master_clear_title'), bullets(t('master_clear_desc')), button('ecsx-mc-next', t('master_clear_button_text'))],
    'master-clear-final': c => [t('master_clear_title'), esc(t('master_clear_final_desc')), button('ecsx-mc-go', t('master_clear_final_button_text'))],
    'media-format': c => [t('media_format_title'), esc(t('media_format_desc')), button('ecsx-mf-next', t('media_format_button_text'))],
    'media-format-final': c => [t('media_format_title'), esc(t('media_format_final_desc')), button('ecsx-mf-go', t('media_format_final_button_text'))]
  };
  const show = (c, page) => { stack(c).push(page); c.render(); };
  EC.settingsTargets = {...EC.settingsTargets, MasterClear: c => show(c, 'master-clear'), MediaFormat: c => show(c, 'media-format')};
  document.addEventListener('DOMContentLoaded', () => {
    const m = EC.module('settings'), base = {render: m.render, action: m.action};
    m.render = c => {
      const page = PAGES[stack(c)?.at(-1)];
      if (!page) return base.render(c);
      const [title, text, btn] = page(c);
      return c.window(title, `<div class="ecsx-page"><div class="ecsx-text">${text}</div>${btn}</div>`);
    };
    m.action = (name, el, event, c) => {
      switch (name) {
        case 'ecsx-mc-next':
          EC.patternFlow.confirm(c, {header: t('master_clear_gesture_prompt'), footer: t('master_clear_gesture_explanation'), done: c2 => { stack(c2).pop(); show(c2, 'master-clear-final'); }});
          return true;
        case 'ecsx-mf-next':
          EC.patternFlow.confirm(c, {header: t('media_format_gesture_prompt'), footer: t('media_format_gesture_explanation'), done: c2 => { stack(c2).pop(); show(c2, 'media-format-final'); }});
          return true;
        case 'ecsx-mc-go': c.factoryReset(); return true;
        case 'ecsx-mf-go': c.data.photos = []; c.save(); stack(c).pop(); c.render(); return true;
      }
      return base.action(name, el, event, c);
    };
  });
})();
