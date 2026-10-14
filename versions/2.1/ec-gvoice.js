/* Android 2.1 Google Voice 0.3.0 (googlevoice.apk; English only), as an offline phone without a Google Voice account
   shows it: HidingSplashActivity sends a phone that is not set up to SetupActivity (setup.xml).
   - Every page: the textAppearanceLarge title with first_use_icon (padding 13 / 10 / 13 dp), the horizontal_rule, the
     page (a WebView: white, the default 16 px text), and the bottom_bar with the left and right buttons.
   - Pages (SetupActivity's page switch): Welcome to Google Voice (setup_page_welcome_explanation; Exit / Next), then,
     with no Google account on the phone, Sign in to Google Voice ("Enter your account details:", Username and Password;
     Back / Sign in). Signing in shows the inline "Signing in" progress; offline it ends in LoginActivity's dialog
     (dialog_title_error, ic_dialog_alert, "Unable to sign in to your Google Voice account.", Cancel). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const V = () => EC.text('gvoice');
  const t = k => V().t(k);
  let timer = 0;
  const button = (action, label, extra = '') => `<button type="button" class="ecui-button" data-action="${action}"${extra}><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(label)}</span></button>`;
  const field = (key, type, hint) => `<span class="ecwf-edit npp-fw-textfield_default"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><input class="ecwf-input" data-field="${key}" type="${type}" ${type === 'email' ? 'data-ime="email"' : ''} placeholder="${esc(hint)}" autocomplete="off" spellcheck="false"></span>`;
  function render(c) {
    const signIn = c.ui.sub === 'signin', busy = c.ui.gvBusy;
    // The welcome text is the APK's own HTML (<p>), as its WebView shows it.
    const page = signIn
      ? `<div class="ecgv-web">${esc(t('setup_page_sign_in_prompt'))}</div><div class="ecgv-fields">${field('user', 'email', t('login_dialog_enter_credentials_prompt_account'))}${field('pass', 'password', t('login_dialog_enter_credentials_prompt_password'))}</div>`
      : `<div class="ecgv-web">${t('setup_page_welcome_explanation')}</div>`;
    return `<div class="ecgv"><div class="ecgv-head"><span>${esc(t(signIn ? 'setup_page_add_account_title' : 'setup_page_welcome_title'))}</span><img src="assets/gv-first_use_icon.png" alt=""></div>
      <img class="ecgv-rule" src="assets/gv-horizontal_rule.png" alt=""><div class="ecgv-page">${page}</div>
      ${busy ? `<div class="ecgv-progress"><img class="ecgv-spin" src="assets/fw-spinner_white_16.png" alt=""><span>${esc(t('setup_page_sign_in_progress_title'))}</span></div>` : ''}
      <div class="ecgv-bar">${button('ecgv-left', t(signIn ? 'button_back' : 'button_exit'))}<span></span>${button('ecgv-right', t(signIn ? 'button_sign_in' : 'button_next'), busy ? ' disabled' : '')}</div></div>`;
  }
  function signIn(c) {
    c.ui.gvBusy = true; c.render();
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (c.ui.view !== 'google-voice') return;
      c.ui.gvBusy = false; c.render();
      c.dialog({title: t('dialog_title_error'), icon: 'fw-ic_dialog_alert.png', message: t('login_dialog_authentication_failed'), buttons: [{label: EC.text('framework').t('cancel')}]});
    }, 2500);
  }
  EC.register('google-voice', {
    title: 'Voice',
    render,
    start(c) { c.ui.sub = ''; c.ui.gvBusy = false; },
    action(name, el, event, c) {
      if (name === 'ecgv-right') { if (c.ui.sub === 'signin') signIn(c); else { c.ui.sub = 'signin'; c.render(); } return true; }
      if (name === 'ecgv-left') { clearTimeout(timer); c.ui.gvBusy = false; if (c.ui.sub === 'signin') { c.ui.sub = ''; c.render(); } else c.back(); return true; }
      return false;
    },
    back(c) {
      clearTimeout(timer);
      if (c.ui.sub === 'signin') { c.ui.sub = ''; c.ui.gvBusy = false; c.render(); return true; }
      return false;
    }
  });
  document.addEventListener('DOMContentLoaded', () => {
    const c = EC.context, open = c.open;
    c.open = (view, sub, opts) => { const fresh = c.ui.view !== view; const r = open(view, sub, opts); if (fresh && view === 'google-voice') { EC.module('google-voice').start(c); c.render(); } return r; };
  });
})();
