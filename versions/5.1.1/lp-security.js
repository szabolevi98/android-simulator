/* Settings 5.1 (LMY48Y) Security sub-pages in a demonstration state:
   - SIM card lock (IccLockSettings, sim_lock_settings.xml): the Lock SIM card SwitchPreference ("Require PIN to use
     phone") and Change SIM PIN (EditPinPreference, dependent on the lock). The demo SIM takes the first 4-8 digit PIN
     as its PIN; afterwards a wrong one gives sim_lock_failed / sim_change_failed, a new PIN is typed twice.
   - Trusted credentials (TrustedCredentialsSettings, trusted_credentials.xml): System / User tabs; the system list is
     the image's 162 CA certificates (lp-cacerts.js, docs/lp-cacerts.py) as trusted_credential.xml rows (primary and
     secondary subject, the Switch); a row opens SslCertificate's details with Disable / Enable and its confirmation.
     The user tab is empty, as nothing is installed.
   - Trust agents (TrustAgentSettings): only with a secure screen lock (otherwise disabled_because_no_backup_security);
     the image's one agent, GMS's GoogleTrustAgent "Smart Lock (Google)", in trust_agent_item.xml with its check box.
   - Apps with usage access (UsageAccessSettings): only android and com.android.settings request
     PACKAGE_USAGE_STATS in the image and shouldIgnorePackage drops both, so the list is empty.
   Install from storage gives CertInstaller's no_cert_file_found; Clear credentials stays disabled (the store is
   empty). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const certs = () => window.LPCaCerts || [];
  function page(sub, {data, ui, t}) {
    const s = data.settings;
    if (sub === 'sim-lock') {
      const on = !!s.simLock;
      return {title: 'SIM card lock settings', body: `<button class="settings-row lp-switch-row" data-action="lps-sim" data-id="toggle" role="switch" aria-checked="${on}"><span class="row-copy">${e(t('Lock SIM card'))}<small>${e(t('Require PIN to use phone'))}</small></span><span class="lp-mswitch${on ? ' on' : ''}" aria-hidden="true"></span></button><button class="settings-row" data-action="lps-sim" data-id="change" ${on ? '' : 'disabled'}><span class="row-copy">${e(t('Change SIM PIN'))}</span></button>`};
    }
    if (sub === 'trusted-creds') {
      const tab = ui.lpsTab || 'system', off = new Set(s.disabledCerts || []);
      const tabs = `<div class="lps-tabs" role="tablist">${[['system', 'System'], ['user', 'User']].map(([id, label]) => `<button role="tab" aria-selected="${tab === id}" class="${tab === id ? 'on' : ''}" data-action="lps-tab" data-id="${id}">${e(t(label))}</button>`).join('')}</div>`;
      const list = tab === 'user' ? '' : certs().map(c => `<button class="lps-cert" data-action="lps-cert" data-id="${e(c.file)}"><span class="row-copy">${e(c.p)}${c.s ? `<small>${e(c.s)}</small>` : ''}</span><span class="lp-mswitch${off.has(c.file) ? '' : ' on'}" aria-hidden="true"></span></button>`).join('');
      return {title: 'Trusted credentials', body: `${tabs}<div class="lps-list">${list}</div>`};
    }
    if (sub === 'trust-agents') {
      const on = s.smartLockAgent !== false;
      return {title: 'Trust agents', body: `<button class="settings-row lps-agent" data-action="lps-agent" role="checkbox" aria-checked="${on}"><span class="lp-check${on ? ' on' : ''}" aria-hidden="true"></span><span class="row-copy">${e(t('Smart Lock (Google)'))}</span></button>`};
    }
    if (sub === 'usage-access') return {title: 'Apps with usage access', body: ''};
    return null;
  }
  // The dialogs: EditPinPreference's PIN entry, SslCertificate's details and the enable / disable confirmation.
  function overlay({data, ui, t, locale}) {
    const s = data.settings, box = (body, buttons) => `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog lps-dialog" role="dialog">${body}<div class="lps-buttons">${buttons}</div></div>`;
    const button = (action, label, id = '') => `<button data-action="${action}" data-id="${id}">${e(t(label))}</button>`;
    if (ui.overlay === 'lps-pin') {
      const p = ui.lpsPin || {}, step = p.step || 'pin';
      const title = p.mode === 'change' ? t('SIM PIN') : t(s.simLock ? 'Unlock SIM card' : 'Lock SIM card');
      const prompt = {pin: p.mode === 'change' ? 'Old SIM PIN' : 'SIM PIN', new: 'New SIM PIN', again: 'Re‑type new PIN'}[step];
      return box(`<h3>${e(title)}</h3><p>${e(t(prompt))}</p>${p.error ? `<p class="lps-error">${e(t(p.error))}</p>` : ''}<input class="lps-pin" data-lps-pin type="password" inputmode="numeric" maxlength="8" autocomplete="off" aria-label="${e(t(prompt))}">`, button('close-overlay', 'Cancel') + button('lps-pin-ok', 'OK'));
    }
    const cert = certs().find(c => c.file === ui.lpsCert);
    if (!cert) return '';
    const off = (s.disabledCerts || []).includes(cert.file);
    if (ui.overlay === 'lps-confirm') return box(`<p>${e(t(off ? 'Enable the system CA certificate?' : 'Disable the system CA certificate?'))}</p>`, button('close-overlay', 'Cancel') + button('lps-cert-toggle', 'OK'));
    if (ui.overlay === 'lps-cert') {
      const date = value => new Date(`${value}T12:00:00Z`).toLocaleDateString(locale, {year: 'numeric', month: 'numeric', day: 'numeric'});
      const field = (label, value) => value ? `<dt>${e(t(label))}</dt><dd>${e(value)}</dd>` : '';
      const who = n => field('Common name:', n.cn) + field('Organization:', n.o) + field('Organizational unit:', n.ou);
      return box(`<h3>${e(t('Security certificate'))}</h3><dl class="lps-details"><dt class="lps-head">${e(t('Issued to:'))}</dt>${who(cert.to)}<dt class="lps-head">${e(t('Issued by:'))}</dt>${who(cert.by)}<dt class="lps-head">${e(t('Validity:'))}</dt>${field('Issued on:', date(cert.from))}${field('Expires on:', date(cert.until))}<dt class="lps-head">${e(t('Fingerprints:'))}</dt>${field('SHA-256 fingerprint:', cert.sha256)}${field('SHA-1 fingerprint:', cert.sha1)}</dl>`,
        button('lps-cert-ask', off ? 'Enable' : 'Disable') + button('close-overlay', 'OK'));
    }
    return '';
  }
  // PIN entry: the demo SIM's PIN is the first one entered; returns a toast text when the dialog closes, or ''.
  function pinOk(data, ui, value) {
    const s = data.settings, p = ui.lpsPin ||= {mode: 'toggle', step: 'pin'};
    if (!/^\d{4,8}$/.test(value)) { p.error = 'Incorrect PIN'; return null; }
    if (p.step === 'pin') {
      if (s.simPin && value !== s.simPin) return p.mode === 'change' ? "Can't change PIN.\nPossibly incorrect PIN." : "Can't change SIM card lock state.\nPossibly incorrect PIN.";
      s.simPin ||= value;
      if (p.mode === 'toggle') { s.simLock = !s.simLock; return ''; }
      p.step = 'new'; p.error = ''; return null;
    }
    if (p.step === 'new') { p.next = value; p.step = 'again'; p.error = ''; return null; }
    if (value !== p.next) { p.step = 'new'; p.error = "PINs don't match"; return null; }
    s.simPin = value; return 'SIM PIN changed successfully';
  }
  window.LPSecurity = {page, overlay, pinOk};
})();
