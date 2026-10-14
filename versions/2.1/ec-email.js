/* Android 2.1 Email (Email.apk, ERE27): with no account it starts in AccountSetupBasics (account_setup_basics.xml,
   titled "Set up email": the 20 sp welcome text, Email address and Password fields, "Send email from this account by
   default.", and on bottom_bar Manual setup at the left and Next at the right, Next enabled once both are filled).
   Next runs AccountSetupCheckSettings (account_setup_check_settings.xml: 100 dp down, the message over the
   indeterminate horizontal progress bar, Cancel): "Retrieving account information…", "Checking incoming server
   settings…". The simulator has no network, so it ends as the phone would offline: "Setup could not finish" with
   "Cannot connect to server. (Unable to open connection to server.)" and Edit details. Manual setup asks for the type
   (account_setup_account_type.xml: POP3, IMAP, Microsoft Exchange ActiveSync, 150 sp buttons 25 dp apart). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const E = () => EC.text('email');
  let timer = 0;
  const button = (action, label, extra = '') => `<button type="button" class="ecui-button ecem-btn" data-action="${action}"${extra}><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(label)}</span></button>`;
  const field = (key, hint, type, value) => `<span class="ecwf-edit npp-fw-textfield_default"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><input class="ecwf-input" data-field="${key}" type="${type}" ${type === 'email' ? 'data-ime="email"' : ''} value="${esc(value || '')}" placeholder="${esc(E().t(hint))}" autocomplete="off" spellcheck="false"></span>`;
  function basics(c) {
    const f = c.ui.emailSetup || {}, ok = f.email && f.password;
    return c.window(E().t('account_setup_basics_title'), `<div class="ecem"><div class="ecem-body"><div class="ecem-welcome">${esc(E().t('accounts_welcome'))}</div>
      ${field('email', 'account_setup_basics_email_hint', 'email', f.email)}${field('password', 'account_setup_basics_password_hint', 'password', f.password)}
      ${c.checkbox('default', f.default !== false, E().t('account_setup_basics_default_label'))}</div>
      <div class="ecem-bar">${button('ecem-manual', E().t('account_setup_basics_manual_setup_action'))}${button('ecem-next', E().t('next_action'), ok ? '' : ' disabled')}</div></div>`);
  }
  function type(c) {
    return c.window(E().t('account_setup_account_type_title'), `<div class="ecem"><div class="ecem-body"><div class="ecem-instr">${esc(E().t('account_setup_account_type_instructions'))}</div>
      ${['pop', 'imap', 'exchange'].map(k => button('ecem-type', E().t(`account_setup_account_type_${k}_action`), ` data-type="${k}"`)).join('')}</div></div>`);
  }
  function check(c) {
    return c.window(E().t('account_setup_basics_title'), `<div class="ecem"><div class="ecem-body ecem-check"><div class="ecem-msg">${esc(E().t(c.ui.emailStep || 'account_setup_check_settings_retr_info_msg'))}</div><div class="ecem-progress"><i></i></div></div>
      <div class="ecem-bar">${button('ecem-cancel', E().t('cancel_action'))}</div></div>`);
  }
  function run(c) {
    clearTimeout(timer);
    c.ui.emailStep = 'account_setup_check_settings_retr_info_msg'; c.open('email', 'check');
    timer = setTimeout(() => {
      if (c.ui.sub !== 'check') return;
      c.ui.emailStep = 'account_setup_check_settings_check_incoming_msg'; c.render();
      timer = setTimeout(() => {
        if (c.ui.sub !== 'check') return;
        c.dialog({title: E().t('account_setup_failed_dlg_title'), icon: 'fw-ic_dialog_alert.png', message: E().fmt('account_setup_failed_dlg_server_message_fmt', c.lang, E().t('account_setup_failed_ioerror')),
          buttons: [{label: E().t('account_setup_failed_dlg_edit_details_action'), action: () => c.back()}], onCancel: () => c.back()});
      }, 2500);
    }, 1500);
  }
  EC.register('email', {
    title: 'Email',
    render(c) { return c.ui.sub === 'type' ? type(c) : c.ui.sub === 'check' ? check(c) : basics(c); },
    mount(c, root) {
      for (const input of root.querySelectorAll('.ecwf-input')) input.addEventListener('input', () => {
        c.ui.emailSetup = {...(c.ui.emailSetup || {}), [input.dataset.field]: input.value};
        const next = root.querySelector('[data-action="ecem-next"]'), f = c.ui.emailSetup;
        if (next) next.disabled = !(f.email && f.password);
      });
    },
    action(name, el, event, c) {
      switch (name) {
        case 'ecem-next': if (!el.disabled) run(c); return true;
        case 'ecem-manual': c.open('email', 'type'); return true;
        case 'ecem-type': run(c); return true;
        case 'ecem-cancel': clearTimeout(timer); c.back(); return true;
        case 'ecui-check': { const on = el.getAttribute('aria-pressed') !== 'true'; el.setAttribute('aria-pressed', on); el.querySelector('img').src = `assets/fw-btn_check_${on ? 'on' : 'off'}.png`; c.ui.emailSetup = {...(c.ui.emailSetup || {}), default: on}; return true; }
      }
      return false;
    },
    back(c) { clearTimeout(timer); return false; }
  });
})();
