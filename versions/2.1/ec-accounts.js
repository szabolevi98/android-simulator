/* Android 2.1 Settings › Accounts & sync (AccountAndSyncSettings.apk), with the phone's made-up Google account
   (eclair.demo@gmail.com, the one Gmail, Talk, YouTube and Market use).
   - ManageAccountsSettings (android.settings.SYNC_SETTINGS; manage_accounts_settings.xml in manage_accounts_screen.xml):
     General sync settings (Background data — turning it off asks first, background_data_dialog — and Auto-sync, which
     depends on it), the Manage accounts category (empty) and the bottom_bar with Add account.
   - AddAccountSettings ("Add an account"): the image's account authenticators, each with its label and icon:
     Email's Microsoft Exchange ActiveSync, Facebook, and GoogleApps' Google. Exchange opens Email's account setup,
     Facebook its sign-in; Google is GoogleApps' LoginActivity (Theme.Dialog, "Google sign-in": "Sign in to your Google
     account.", Username, Password, the #c6c3c6 bar with Sign in), "Authenticating…", and with no network its
     ErrorActivity ("There was a network error while trying to sign in to Google. …", Try again).
   - The account under Manage accounts: account_preference.xml (the provider icon, the account in textAppearanceMedium,
     "Sync is ON" / "Sync is OFF" in textAppearanceSmall, ic_sync_green / ic_sync_grey). It opens AccountSyncSettings
     (account_sync_screen.xml: title.xml on title_bar with the 48 dp icon, the account in bold and the account type;
     "Data & synchronization" with "Sync Calendar", "Sync Contacts", "Sync Gmail" (sync_item_title with each provider's
     label), the last sync time as the summary, preference_widget_sync_toggle's ic_list_sync_anim while it syncs; the
     bottom_bar with Remove account). Menu: Sync now / Cancel sync. The phone's first Google account cannot be removed:
     really_remove_account_title, then remove_account_failed. */
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
  const ACCOUNT = () => EC.gmail?.account || 'eclair.demo@gmail.com';
  // Each provider's sync: on or off, the last sync, syncing now.
  const PROVIDERS_SYNC = [['calendar', 'CalendarProvider/provider_label'], ['contacts', 'ContactsProvider/provider_label'], ['gmail', 'GmailProvider/provider_label']];
  // A phone in use has synced not long ago.
  const sync = c => c.data.accountSync ||= {calendar: true, contacts: true, gmail: true, last: Object.fromEntries(['calendar', 'contacts', 'gmail'].map((id, i) => [id, c.now().getTime() - (40 - i * 7) * 60000]))};
  let syncing = null, syncTimer = 0;
  const syncOn = c => { const s = c.data.settings, y = sync(c); return s.backgroundData !== false && s.autoSync !== false && PROVIDERS_SYNC.some(([id]) => y[id]); };
  function accountRow(c) {
    const on = syncOn(c);
    return `<button type="button" class="ecpf-row ecacs-account" data-action="ecacs-account"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><img class="ecacs-aicon" src="assets/pk-com.google.android.googleapps.png" alt=""><span class="ecpf-text"><span class="ecpf-title">${esc(ACCOUNT())}</span><span class="ecpf-summary">${esc(t(on ? 'sync_enabled' : 'sync_disabled'))}</span></span><img class="ecacs-sicon" src="assets/as-ic_sync_${on ? 'green' : 'grey'}.png" alt=""></button><i class="ecpf-divider"></i>`;
  }
  function accountSync(c) {
    const y = sync(c), s = c.data.settings, auto = s.backgroundData !== false && s.autoSync !== false;
    const when = id => { const at = y.last[id]; if (!at) return ''; const d = new Date(at); return `${c.shortDate(d)} ${c.timeText(d)}`; };
    const rows = PROVIDERS_SYNC.map(([id, label]) => {
      const summary = auto ? when(id) : AndroidStrings.format(t('sync_one_time_sync'), when(id)).trim();
      return `<button type="button" class="ecpf-row" data-action="ecacs-item" data-id="${id}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span class="ecpf-text"><span class="ecpf-title">${esc(AndroidStrings.format(t('sync_item_title'), t(label)))}</span>${summary ? `<span class="ecpf-summary">${esc(summary)}</span>` : ''}</span>${syncing?.has(id) ? '<img class="ecacs-anim" src="assets/as-ic_list_sync_anim0.png" alt="">' : ''}${check(y[id])}</button><i class="ecpf-divider"></i>`;
    }).join('');
    return c.window(t('sync_settings'), `<div class="ecacs"><div class="ecacs-title np-as-title_bar"><img src="assets/pk-com.google.android.googleapps.png" alt=""><span><b>${esc(ACCOUNT())}</b><small>${esc(t('GoogleApps/label'))}</small></span></div>
      <div class="ecpf-list ecacs-list">${cat(t('header_data_and_synchronization'))}${rows}</div>
      <div class="ecacs-bar"><button type="button" class="ecui-button" data-action="ecacs-remove"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(t('remove_account_label'))}</span></button></div></div>`);
  }
  // Sync now: each checked provider in turn, the animated icon while it runs.
  function syncNow(c, only) {
    const y = sync(c), list = PROVIDERS_SYNC.map(([id]) => id).filter(id => only ? id === only : y[id]);
    if (!list.length) return;
    syncing = new Set(list); clearInterval(syncTimer);
    let frame = 0, step = 0;
    syncTimer = setInterval(() => {
      frame = (frame + 1) % 4; step++;
      for (const img of c.el.viewport.querySelectorAll('.ecacs-anim')) img.src = `assets/as-ic_list_sync_anim${frame}.png`;
      if (step % 6 === 0) { const id = list[step / 6 - 1]; y.last[id] = Date.now(); syncing?.delete(id); c.save(); c.render(); }
      if (step >= list.length * 6) { clearInterval(syncTimer); syncing = null; c.render(); }
    }, 250);
    c.render();
  }
  function manage(c) {
    const s = c.data.settings, bg = s.backgroundData !== false, auto = s.autoSync !== false;
    return c.window(t('sync_settings'), `<div class="ecacs"><div class="ecpf-list ecacs-list">${cat(t('header_general_sync_settings'))}${row('ecacs-bg', t('background_data'), t('background_data_summary'), bg)}${row('ecacs-auto', t('sync_automatically'), t('sync_automatically_summary'), auto, !bg)}${cat(t('header_manage_accounts'))}${accountRow(c)}</div>
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
  EC.accountsSync = {menu(c) {
    if (stack(c)?.at(-1) !== 'account-sync') return false;
    c.menu([syncing ? {label: t('sync_menu_sync_cancel'), icon: 'fw-ic_menu_close_clear_cancel.png', action: () => { clearInterval(syncTimer); syncing = null; c.render(); }}
      : {label: t('sync_menu_sync_now'), icon: 'fw-ic_menu_refresh.png', action: () => syncNow(c)}]);
    return true;
  }};
  EC.settingsActions = {...EC.settingsActions, 'android.settings.SYNC_SETTINGS': c => { stack(c).push('accounts'); c.render(); }};
  document.addEventListener('DOMContentLoaded', () => {
    const m = EC.module('settings'), base = {render: m.render, action: m.action, menu: m.menu};
    m.menu = c => EC.accountsSync.menu(c) || (base.menu ? base.menu(c) : false);
    m.render = c => {
      const top = stack(c)?.at(-1);
      return top === 'accounts' ? manage(c) : top === 'add-account' ? add(c) : top === 'account-sync' ? accountSync(c) : base.render(c);
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
        case 'ecacs-account': stack(c).push('account-sync'); c.render(); return true;
        case 'ecacs-item': {
          // With auto-sync off a touch syncs that item once; otherwise it turns its sync on or off.
          const id = el.dataset.id, y = sync(c), auto = s.backgroundData !== false && s.autoSync !== false;
          if (!auto) { syncNow(c, id); return true; }
          y[id] = !y[id]; c.save(); if (y[id]) syncNow(c, id); else c.render(); return true;
        }
        case 'ecacs-remove':
          c.dialog({title: t('really_remove_account_title'), icon: 'fw-ic_dialog_alert.png', message: t('really_remove_account_message'),
            buttons: [{label: t('remove_account_label'), action: () => setTimeout(() => c.dialog({title: t('really_remove_account_title'), icon: 'fw-ic_dialog_alert.png', message: t('remove_account_failed'), buttons: [{label: EC.text('framework').t('ok')}]}))}, {label: EC.text('framework').t('cancel')}]});
          return true;
        case 'ecacs-signin': signIn(c); return true;
        case 'ecacs-retry': signIn(c); return true;
      }
      return base.action(name, el, event, c);
    };
  });
})();
