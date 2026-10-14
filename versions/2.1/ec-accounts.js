/* Android 2.1 Settings › Accounts & sync (AccountAndSyncSettings.apk), with no account on the phone.
   - ManageAccountsSettings (android.settings.SYNC_SETTINGS; manage_accounts_settings.xml in manage_accounts_screen.xml):
     General sync settings (Background data — turning it off asks first, background_data_dialog — and Auto-sync, which
     depends on it), the Manage accounts category (empty) and the bottom_bar with Add account.
   - AddAccountSettings ("Add an account"): the image's account authenticators, each with its label and icon:
     Email's Microsoft Exchange ActiveSync, Facebook, and GoogleApps' Google. Exchange opens Email's account setup,
     Facebook its sign-in; Google is GoogleApps' LoginActivity (Theme.Dialog, "Google sign-in": "Sign in to your Google
     account.", Username, Password, the #c6c3c6 bar with Sign in), "Authenticating…", and with no network its
     ErrorActivity ("There was a network error while trying to sign in to Google. …", Try again). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const A = () => EC.text('accounts');
  const t = k => A().t(k);
  // TextUtils.expandTemplate: ^1 is the first value.
  const expand = (text, value) => text.split('^1').join(value);
  const stack = c => c.ui.settingsStack;
  let timer = 0;
  const check = on => `<img class="ecpf-check" src="assets/fw-btn_check_${on ? 'on' : 'off'}.png" alt="">`;
  const row = (action, title, summary, on, disabled) => `<button type="button" class="ecpf-row" data-action="${action}"${disabled ? ' disabled' : ''}><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span class="ecpf-text"><span class="ecpf-title">${esc(title)}</span><span class="ecpf-summary">${esc(summary)}</span></span>${check(on)}</button><i class="ecpf-divider"></i>`;
  const cat = title => `<div class="ecpf-cat npp-fw-dark_header_dither"><i class="ec-bg np-fw-dark_header_dither"></i><span>${esc(title)}</span></div>`;
  function manage(c) {
    const s = c.data.settings, bg = s.backgroundData !== false, auto = s.autoSync !== false;
    return c.window(t('sync_settings'), `<div class="ecacs"><div class="ecpf-list ecacs-list">${cat(t('header_general_sync_settings'))}${row('ecacs-bg', t('background_data'), t('background_data_summary'), bg)}${row('ecacs-auto', t('sync_automatically'), t('sync_automatically_summary'), auto, !bg)}${cat(t('header_manage_accounts'))}</div>
      <div class="ecacs-bar"><button type="button" class="ecui-button" data-action="ecacs-add"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(t('add_account_label'))}</span></button></div></div>`);
  }
  const PROVIDERS = [['exchange', 'Email/exchange_name', 'em-ic_exchange_selected.png'], ['facebook', 'Facebook/app_name', 'fb-ic_facebook_selected.png'], ['google', 'GoogleApps/label', 'pk-com.google.android.googleapps.png']];
  function add(c) {
    const rows = PROVIDERS.map(([id, label, icon]) => `<button type="button" class="ecpf-row ecacs-provider" data-action="ecacs-provider" data-id="${id}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><img src="assets/${icon}" alt=""><span class="ecpf-text"><span class="ecpf-title">${esc(t(label))}</span></span></button><i class="ecpf-divider"></i>`).join('');
    return c.window(t('header_add_an_account'), `<div class="ecpf-list">${rows}</div>`);
  }
  // GoogleApps' LoginActivity and ErrorActivity are dialog-themed activities.
  function google(c) {
    const field = (key, type) => `<span class="ecwf-edit npp-fw-textfield_default"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><input class="ecwf-input" data-field="${key}" type="${type}" ${type === 'email' ? 'data-ime="email"' : ''} autocomplete="off" spellcheck="false"></span>`;
    c.dialog({title: t('GoogleApps/ui_activity_title'), icon: null, html: `<div class="ecacs-login"><div class="ecacs-body"><p>${esc(expand(t('GoogleApps/login_activity_newaccount_text'), t('GoogleApps/label')).trim())}</p><b>${esc(t('GoogleApps/login_activity_username_label'))}</b>${field('user', 'email')}<b>${esc(t('GoogleApps/login_activity_password_label'))}</b>${field('pass', 'password')}</div>
      <div class="ecacs-gbar"><button type="button" class="ecui-button" data-action="ecacs-signin"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(t('GoogleApps/login_activity_ok_button'))}</span></button></div></div>`});
  }
  function signIn(c) {
    c.dialog({title: '', icon: null, cancelable: false, html: `<div class="ecsys-progress"><img class="ecsys-spinner" src="assets/fw-spinner_white_48.png" alt=""><span>${esc(t('GoogleApps/ui_activity_authenticating'))}</span></div>`});
    clearTimeout(timer);
    timer = setTimeout(() => c.dialog({title: t('GoogleApps/ui_activity_title'), icon: null, html: `<div class="ecacs-login"><div class="ecacs-body"><p>${esc(expand(t('GoogleApps/error_activity_message'), t('GoogleApps/label')))}</p></div>
      <div class="ecacs-gbar"><button type="button" class="ecui-button" data-action="ecacs-retry"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(t('GoogleApps/error_activity_retry_button'))}</span></button></div></div>`}), 2500);
  }
  EC.settingsActions = {...EC.settingsActions, 'android.settings.SYNC_SETTINGS': c => { stack(c).push('accounts'); c.render(); }};
  document.addEventListener('DOMContentLoaded', () => {
    const m = EC.module('settings'), base = {render: m.render, action: m.action};
    m.render = c => {
      const top = stack(c)?.at(-1);
      return top === 'accounts' ? manage(c) : top === 'add-account' ? add(c) : base.render(c);
    };
    m.action = (name, el, event, c) => {
      const s = c.data.settings;
      switch (name) {
        case 'ecacs-bg':
          if (s.backgroundData === false) { s.backgroundData = true; c.save(); c.render(); return true; }
          c.dialog({title: t('background_data_dialog_title'), icon: 'fw-ic_dialog_alert.png', message: t('background_data_dialog_message'),
            buttons: [{label: EC.text('framework').t('ok'), action: () => { s.backgroundData = false; c.save(); c.render(); }}, {label: EC.text('framework').t('cancel')}]});
          return true;
        case 'ecacs-auto': s.autoSync = s.autoSync === false; c.save(); c.render(); return true;
        case 'ecacs-add': stack(c).push('add-account'); c.render(); return true;
        case 'ecacs-provider': {
          const id = el.dataset.id;
          if (id === 'google') google(c);
          else c.open(id === 'facebook' ? 'facebook' : 'email');
          return true;
        }
        case 'ecacs-signin': signIn(c); return true;
        case 'ecacs-retry': signIn(c); return true;
      }
      return base.action(name, el, event, c);
    };
  });
})();
