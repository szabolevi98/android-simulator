/* Android 2.1 Facebook 1.1.3 (Facebook.apk, com.facebook.katana), as the phone shows it with no connection.
   - LoginActivity (Theme.Facebook = Theme.Light without a title, login.xml): the title strip (title_layout.xml, the
     facebook_logo nine-patch, 30 dp), the sign-in panel on login_background (#f8f9fb to #cad3e3) with Email and Password
     (14 sp #455898 labels), the blue Login button (100 dp, padding 10 dp, bold white), a bright divider, then "Don't have
     an account?" (bold #455898) and the green Sign up button. Menu: About (ic_menu_info_details).
   - onResume shows the EulaDialog until it is agreed to (UserValuesManager.getEULAAgreed): "End-User License Agreement"
     with res/raw/eula.html in a WebView, I agree / I don't agree (which closes the app).
   - Login: the ProgressDialog "Signing in. Please wait...", then, with no network, AlertDialogs.createAlert titled Login
     (ic_dialog_alert) with "An error had occurred during the sign in. Please try again later." and OK.
   - Sign up opens http://m.facebook.com/r.php in the Browser; About is HtmlAboutActivity (html_about_view.xml:
     res/raw/about.html with "0.0.0" replaced by the version, Terms | OK on the bottom bar; Terms opens
     http://www.facebook.com/terms.php). Links in the pages open in the Browser. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const F = () => EC.text('facebook');
  const VERSION = '1.1.3';
  let timer = 0;
  const field = (key, type) => `<span class="ecwf-edit npp-fw-textfield_default"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><input class="ecwf-input" data-field="${key}" type="${type}" ${type === 'email' ? 'data-ime="email"' : ''} autocomplete="off" spellcheck="false"></span>`;
  const button = (action, color, label) => `<button type="button" class="ecfb-btn" data-action="${action}"><i class="ec-bg np-fb-btn_${color}_normal"></i><i class="ec-bg ec-pressed np-fb-btn_${color}_pressed"></i><span>${esc(label)}</span></button>`;
  const browse = (c, url) => { c.ui.browserGo = url; c.open('browser'); };
  // A raw page of the APK in a WebView; its links go to the Browser.
  function page(root, c, version) {
    const frame = root.querySelector('.ecfb-web');
    if (!frame) return;
    frame.addEventListener('load', () => {
      const doc = frame.contentDocument;
      if (!doc) return;
      if (version) doc.body.innerHTML = doc.body.innerHTML.split('0.0.0').join(VERSION);
      // The WebView: no "lucida grande" etc. on the phone, so Droid Sans; a CSS pixel is a dp at the hdpi default scale.
      const style = doc.createElement('style');
      style.textContent = "@font-face{font-family:DroidSans;src:url('../fonts/DroidSans.ttf')}@font-face{font-family:DroidSans;font-weight:700;src:url('../fonts/DroidSans-Bold.ttf')}*{font-family:DroidSans!important}";
      doc.head.append(style);
      const probe = document.createElement('i');
      probe.style.cssText = 'position:absolute;width:calc(100 * var(--dp))';
      c.el.screen.append(probe);
      doc.documentElement.style.zoom = probe.offsetWidth / 100;
      probe.remove();
      doc.addEventListener('click', e => { const a = e.target.closest('a'); if (a) { e.preventDefault(); browse(c, a.getAttribute('href')); } });
    });
  }
  function eula(c) {
    if (c.data.facebookEula || c.ui.view !== 'facebook') return;
    c.dialog({title: F().t('eula_title'), icon: null, cancelable: true,
      html: '<iframe class="ecfb-web ecfb-eula" src="assets/fb-eula.html" title=""></iframe>', mount: root => page(root, c),
      buttons: [{label: F().t('eula_agree'), action: () => { c.data.facebookEula = true; c.save(); }}, {label: F().t('eula_disagree'), action: () => c.back()}],
      onCancel: () => c.back()});
  }
  function login(c) {
    clearTimeout(timer);
    c.dialog({title: '', icon: null, cancelable: false, html: `<div class="ecsys-progress"><img class="ecsys-spinner" src="assets/fw-spinner_white_48.png" alt=""><span>${esc(F().t('login_signing_in'))}</span></div>`});
    timer = setTimeout(() => {
      if (c.ui.view !== 'facebook') return;
      c.dialog({title: F().t('login_signin'), icon: 'fw-ic_dialog_alert.png', message: F().t('login_error_generic'), buttons: [{label: F().t('ok')}]});
    }, 2000);
  }
  EC.register('facebook', {
    title: 'Facebook',
    render(c) {
      if (c.ui.sub === 'about') {
        return `<div class="ecfb ecfb-about"><iframe class="ecfb-web" src="assets/fb-about.html" title=""></iframe><div class="ecfb-bar">
          <button type="button" class="ecui-button" data-action="ecfb-terms"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(F().t('login_terms'))}</span></button>
          <button type="button" class="ecui-button" data-action="ecfb-ok"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(F().t('ok'))}</span></button></div></div>`;
      }
      return `<div class="ecfb"><div class="ecfb-title np-fb-facebook_logo"></div>
        <div class="ecfb-panel"><div class="ecfb-label">${esc(F().t('login_email_title'))}</div>${field('email', 'email')}
          <div class="ecfb-label ecfb-gap">${esc(F().t('login_password_title'))}</div>${field('password', 'password')}
          <div class="ecfb-row">${button('ecfb-login', 'blue', F().t('login_signin'))}</div></div>
        <i class="ecfb-divider np-fb-fixed_divider_horizontal_bright"></i>
        <div class="ecfb-signup"><span>${esc(F().t('login_sign_up_here'))}</span>${button('ecfb-signup', 'green', F().t('login_signup'))}</div></div>`;
    },
    mount(c, root) { if (c.ui.sub === 'about') page(root, c, true); },
    start(c) { c.ui.sub = ''; setTimeout(() => eula(c), 0); },
    action(name, el, event, c) {
      switch (name) {
        case 'ecfb-login': login(c); return true;
        case 'ecfb-signup': browse(c, 'http://m.facebook.com/r.php'); return true;
        case 'ecfb-terms': browse(c, 'http://www.facebook.com/terms.php'); return true;
        case 'ecfb-ok': c.ui.sub = ''; c.render(); return true;
      }
      return false;
    },
    menu(c) {
      if (c.ui.sub === 'about') return false;
      c.menu([{label: F().t('login_about'), icon: 'fw-ic_menu_info_details.png', action: () => { c.ui.sub = 'about'; c.render(); }}]);
      return true;
    },
    back(c) {
      clearTimeout(timer);
      if (c.ui.sub === 'about') { c.ui.sub = ''; c.render(); return true; }
      return false;
    }
  });
  document.addEventListener('DOMContentLoaded', () => {
    const c = EC.context, open = c.open;
    c.open = (view, sub, opts) => { const fresh = c.ui.view !== view; const r = open(view, sub, opts); if (fresh && view === 'facebook') EC.module('facebook').start(c); return r; };
  });
})();
