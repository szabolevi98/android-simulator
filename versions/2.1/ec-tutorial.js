/* Android 2.1 System tutorial, second part: SetupWizard's TutorialActivity (ec-settings-extra.js) starts the current
   input method's tutorial (launchCurrentImeTutorial: "<IME package>.tutorial"; the IME is com.google.android.voicesearch,
   whose com.google.android.voicesearch.tutorial is LatinImeTutorial.apk's activity; Theme.NoTitleBar).
   - ime_tutorial_activity.xml: "Using the onscreen keyboard", green_divider, then four 14 sp texts each over its picture
     (kb_tutorial_open, kb_tutorial_close, kb_tutorial_roman_longpress, kb_tutorial_roman_settings) in a ScrollView; the
     hand (hand_anim: img_finger_open / close) shows the scroll once (scroll_anim: in, up 40 % of the screen, out); the
     bottom_bar with Back and Next, which ends the tutorial. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const T = () => EC.text('tutorial');
  const t = k => T().t(k);
  const button = (action, label, icon, side) => `<button type="button" class="ecui-button ectu-btn ${side}" data-action="${action}"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i>${side === 'left' && icon ? `<img src="assets/${icon}" alt="">` : ''}<span>${esc(label)}</span>${side === 'right' && icon ? `<img src="assets/${icon}" alt="">` : ''}</button>`;
  function ime() {
    // The texts are styled strings: the first line bold in 17 sp, the empty line 3 sp, then the 14 sp text.
    const part = (k, img) => { const [head, ...rest] = t(`LatinImeTutorial/${k}`).split('

'); return `<div class="ectu-small"><b>${esc(head)}</b><i class="ectu-gap"></i>${esc(rest.join('

'))}</div><img class="ectu-img" src="assets/lt-${img}.png" alt="">`; };
    return `<div class="ectu"><div class="ectu-scroll"><div class="ectu-title">${esc(t('LatinImeTutorial/keyboard_tutorial_title'))}</div><img class="ectu-div" src="assets/lt-green_divider.png" alt="">
      ${part('open_the_keyboard', 'kb_tutorial_open')}${part('close_the_keyboard', 'kb_tutorial_close')}${part('touch_and_hold', 'kb_tutorial_roman_longpress')}${part('keyboard_settings', 'kb_tutorial_roman_settings')}<i class="ectu-space"></i></div>
      <span class="ectu-hand"><img class="o" src="assets/lt-img_finger_open.png" alt=""><img class="c" src="assets/lt-img_finger_close.png" alt=""></span>
      <div class="ectu-bar">${button('ectu-back', t('LatinImeTutorial/back_button_label'), 'sw-ic_btn_back.png', 'left')}${button('ectu-done', t('LatinImeTutorial/next_button_label'), 'sw-ic_btn_next.png', 'right')}</div></div>`;
  }
  EC.register('system-tutorial', {
    title: 'Tutorial',
    render: () => ime(),
    action(name, el, event, c) {
      if (name === 'ectu-back' || name === 'ectu-done') { c.back(); return true; }
      return false;
    }
  });
})();
