/* Android 2.1 credential storage: the keystore daemon (system/bin/keystore), SecuritySettings$CredentialStorage
   (Settings.odex) and CertInstaller (CertInstaller.odex) for Install from SD card.
   - keystore: UNINITIALIZED (3) until a password is set, LOCKED (2) after boot or a lock, NO_ERROR (1) while unlocked. A
     wrong password costs one of 4 retries (MAX_RETRY) and answers WRONG_PASSWORD (10) + the retries left; with none left
     the storage is wiped (UNINITIALIZED). A right one sets them back to 4. Changing the password checks the old one the
     same way.
   - createPreferences: Use secure credentials (enabled unless uninitialized, checked while unlocked: checking it asks for
     the password, or to set one, and unchecking locks), Install from SD card, Set password, Clear storage (enabled
     unless uninitialized).
   - credentials_unlock_dialog.xml "Enter password" (its hint only when another app asked, android.credentials.UNLOCK) and
     credentials_password_dialog.xml "Set password" (the first-time hint, or Current password first): padding 15 dp,
     TextViews in textAppearanceSmall, the hint 16 sp with 10 sp under it, the error bold red. OK runs checkPassword:
     empty password → "Please enter the password.", new or confirm empty → "You must enter and confirm a password.",
     under 8 characters → too short, different → "Passwords do not match."; a wrong password shows checkError's warning
     (more than 3 tries left: plain, 1: one more try, else %d more tries). With an error the dialog shows again, its
     fields kept. Clear storage: "Attention" with ic_dialog_alert, credentials_reset_hint, OK / Cancel.
   - updatePreferences toasts a change of state: enabled, disabled, erased.
   - CertInstaller: a PreferenceActivity (the app's label, "Certificate Installer") listing the files under /sdcard/download
     and /sdcard (createFileList); the card holds no .p12 file, so the list stays empty with "No .p12 file found in the
     SD card.". */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const X = () => EC.text('settingsx');
  const t = k => X().t(k);
  const F = () => EC.text('framework');
  const NO_ERROR = 1, LOCKED = 2, UNINITIALIZED = 3, WRONG_PASSWORD = 10, MAX_RETRY = 4;
  // Only a digest of the password is kept with the phone's data.
  const digest = text => { let h = 0x811c9dc5; for (const ch of String(text)) h = Math.imul(h ^ ch.codePointAt(0), 0x01000193) >>> 0; return h.toString(16); };
  const store = c => c.data.keystore ||= {password: null, retry: MAX_RETRY};
  let unlocked = false;   // the daemon's state: locked again after every boot

  const keystore = {
    test: c => !store(c).password ? UNINITIALIZED : unlocked ? NO_ERROR : LOCKED,
    // load_master_key with the retry counter.
    check(c, password) {
      const s = store(c);
      if (digest(password) === s.password) { s.retry = MAX_RETRY; unlocked = true; c.save(); return NO_ERROR; }
      if (s.retry > 0) { s.retry -= 1; c.save(); return WRONG_PASSWORD + s.retry; }
      keystore.reset(c);
      return UNINITIALIZED;
    },
    unlock: (c, password) => keystore.check(c, password),
    password(c, oldPassword, newPassword) {
      if (oldPassword !== null) { const r = keystore.check(c, oldPassword); if (r !== NO_ERROR) return r; }
      Object.assign(store(c), {password: digest(newPassword), retry: MAX_RETRY}); unlocked = true; c.save();
      return NO_ERROR;
    },
    lock: () => { unlocked = false; },
    reset(c) { c.data.keystore = {password: null, retry: MAX_RETRY}; unlocked = false; c.save(); }
  };
  EC.keystore = {...keystore, NO_ERROR, LOCKED, UNINITIALIZED};

  // updatePreferences: the toast when the state changed since the screen last looked.
  let shown = null;
  function update(c, state) {
    if (shown !== null && shown !== state) c.toast(t(state === NO_ERROR ? 'credentials_enabled' : state === UNINITIALIZED ? 'credentials_erased' : 'credentials_disabled'));
    shown = state;
    c.render();
  }

  const field = name => `<span class="ecwf-edit eccr-field npp-fw-textfield_default"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><input class="ecwf-input" type="password" name="${name}" autocomplete="off"></span>`;
  const label = text => `<div class="eccr-label">${esc(text)}</div>`;

  // createUnlockDialog / createPasswordDialog; onDone(ok) runs when the dialog goes away (onDismiss).
  function passwordDialog(c, kind, {external = false, onDone} = {}) {
    const first = keystore.test(c) === UNINITIALIZED, unlock = kind === 'unlock';
    const hint = unlock ? (external ? t('credentials_unlock_hint') : '') : first ? t('credentials_first_time_hint') : '';
    const html = `<div class="eccr-dlg">${hint ? `<div class="eccr-hint">${esc(hint)}</div>` : ''}<div class="eccr-error" hidden></div>${unlock ? field('old')
      : `${first ? '' : label(t('credentials_old_password')) + field('old')}${label(t('credentials_new_password'))}${field('new')}${label(t('credentials_confirm_password'))}${field('confirm')}`}</div>`;
    const finish = ok => { update(c, keystore.test(c)); onDone?.(ok); };
    const ok = {label: F().t('ok'), keep: true, action: (c2, d, root) => {
      const get = name => root.querySelector(`input[name="${name}"]`)?.value ?? null;
      const error = (key, n) => { const el = root.querySelector('.eccr-error'); el.textContent = n === undefined ? t(key) : X().fmt(key, c.lang, n); el.hidden = false; };
      // checkError: true when the dialog has to show again.
      const failed = code => {
        if (code === NO_ERROR || code === UNINITIALIZED || code < WRONG_PASSWORD) return false;
        const count = code - WRONG_PASSWORD + 1;
        if (count > 3) error('credentials_wrong_password'); else if (count === 1) error('credentials_reset_warning'); else error('credentials_reset_warning_plural', count);
        return true;
      };
      const oldPassword = get('old'), newPassword = get('new'), confirm = get('confirm');
      let done = false;
      if (oldPassword !== null && !oldPassword) error('credentials_password_empty');
      else if (newPassword === null) done = !failed(keystore.unlock(c, oldPassword));
      else if (!newPassword || !confirm) error('credentials_passwords_empty');
      else if (newPassword.length < 8) error('credentials_password_too_short');
      else if (newPassword !== confirm) error('credentials_passwords_mismatch');
      else done = !failed(keystore.password(c, oldPassword, newPassword));
      ok.keep = !done;
      if (done) setTimeout(() => finish(true), 0);
      // An uninitialized storage after the last wrong try closes the dialog too (checkError: no error to show).
    }};
    c.dialog({title: unlock ? t('credentials_unlock') : EC.text('settings2').t('credentials_set_password'), icon: null, html,
      mount: root => root.querySelector('.eccr-dlg input')?.focus(),
      buttons: [ok, {label: F().t('cancel'), action: () => setTimeout(() => finish(false), 0)}],
      onCancel: () => finish(false)});
  }
  EC.credentials = {
    // Credentials.unlock: SecuritySettings opens with the unlock dialog (or Set password when uninitialized) and finishes
    // when it is gone.
    unlock(c, onDone) {
      c.ui.settingsStack.push('security_settings'); c.render();
      shown = keystore.test(c);
      passwordDialog(c, shown === UNINITIALIZED ? 'password' : 'unlock', {external: true, onDone: ok => { c.ui.settingsStack.pop(); c.render(); onDone?.(ok && keystore.test(c) === NO_ERROR); }});
    }
  };

  EC.settingsChecked.enable_credentials = c => keystore.test(c) === NO_ERROR;
  EC.settingsDisabled.enable_credentials = EC.settingsDisabled.reset_credentials = c => keystore.test(c) === UNINITIALIZED;
  EC.settingsKeys.enable_credentials = c => {
    shown = keystore.test(c);
    if (shown === NO_ERROR) { keystore.lock(); update(c, LOCKED); return; }
    passwordDialog(c, shown === UNINITIALIZED ? 'password' : 'unlock');
  };
  EC.settingsKeys.set_password = c => { shown = keystore.test(c); passwordDialog(c, 'password'); };
  EC.settingsKeys.reset_credentials = c => {
    shown = keystore.test(c);
    c.dialog({title: F().t('dialog_alert_title'), icon: 'fw-ic_dialog_alert.png', message: t('credentials_reset_hint'),
      buttons: [{label: F().t('ok'), action: () => setTimeout(() => { keystore.reset(c); update(c, UNINITIALIZED); }, 0)}, {label: F().t('cancel')}]});
  };
  EC.settingsKeys.install_credentials = c => {
    c.ui.settingsStack.push('cert-installer'); c.render();
    c.toast(t('CertInstaller/no_pkcs12_found'));
  };

  document.addEventListener('DOMContentLoaded', () => {
    const m = EC.module('settings'), base = m.render;
    m.render = c => c.ui.settingsStack?.at(-1) === 'cert-installer' ? c.window(t('CertInstaller/app_name'), '<div class="ecpf-list"></div>') : base(c);
  });
})();
