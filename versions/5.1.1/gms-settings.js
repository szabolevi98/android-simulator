/* Google Settings' pages on the Nexus 6 (PrebuiltGmsCore 6.7.79 of LMY48Y), opened from GoogleSettingsActivity's list
   (stock-apps.js). common.Theme.GoogleSettings (v21: AppCompat Light with the #263238 action bar, #21272B status
   bar, #009688 accent); the GMS pages are common.widget setting lists (common_settings_item.xml: title over summary,
   the CheckBox toggle at the end; common_settings_category.xml headers in the accent):
   - Ads, AdsSettingsActivity, in the order it builds them: Opt out of interest-based ads (toggle), Reset advertising
     ID (its dialog, then a new random ID), Ads by Google, Your advertising ID with the ID.
   - Security, SecuritySettingsActivity: Android Device Manager (Remotely locate this device, unavailable while
     Access location is off; Allow remote lock and erase), Verify apps (Scan device for security threats; Improve
     harmful app detection, unavailable while scanning is off).
   - Connected apps, ListAppsActivity: plus_list_apps_aspen_empty_message.
   - Location, GoogleLocationSettingsActivity (location_settings.xml): Access location, then the account's
     location_account_settings.xml (Location Reporting "On / Off for this device", Location History On / Off); their
     pages put location_settings_switch_bar.xml (56 dp, #DB4337, 16 sp white On / Off, the check box) under the
     action bar over the full text; Location History adds the delete button and common.ui's confirmation (the
     "I understand" check box enables Delete).
   Defaults: personalised ads, locate, scanning and upload on; remote erase, reporting and history off.
   Account History, Google Fit, Play Games, Data management and Google+ are other screens, not drawn here. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const ACCOUNT = 'nexus6.demo@gmail.com';
  const rich = text => e(text).replace(/&lt;a href=[^&]*?(?:&quot;[^&]*?&quot;)?[^&]*?&gt;(.*?)&lt;\/a&gt;/g, '<span class="gms6-link">$1</span>').replace(/\n/g, '<br>');
  const newId = () => ([8, 4, 4, 4, 12].map(n => Array.from({length: n}, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')).join('-'));
  const state = data => ({optOut: false, adid: '', locate: true, wipe: false, verify: true, upload: true, access: true, reporting: false, history: false, ...data.gms});
  const check = (on, disabled) => `<span class="lp-check${on ? ' on' : ''}${disabled ? ' disabled' : ''}" aria-hidden="true"></span>`;
  const bar = (title, t) => `<header class="gms6-bar"><button class="gms6-up" data-action="back" aria-label="${e(t('Navigate up'))}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="#fff"/></svg></button><b>${e(title)}</b></header>`;
  function render(ctx, g) {
    const {ui, data, t} = ctx, s = state(data), page = String(ui.sub || '').slice(4);
    const item = (action, id, title, summary = '', widget = '', disabled = false) => `<button class="gms6-item" data-action="${action}" data-id="${id}" ${disabled ? 'disabled' : ''}><span class="gms6-text"><b>${e(title)}</b>${summary ? `<small>${rich(summary)}</small>` : ''}</span>${widget}</button>`;
    const cat = title => `<h4 class="gs6-cat">${e(title)}</h4>`;
    const confirm = (title, body, ok, okAction, extra = '') => `<div class="settings-dialog-scrim gms6-scrim" data-action="gms-dialog" data-id=""></div><div class="settings-dialog gms6-dialog" role="dialog">${title ? `<h3>${e(title)}</h3>` : ''}<p>${rich(body)}</p>${extra}<div class="gms6-buttons"><button data-action="gms-dialog" data-id="">${e(t('Cancel'))}</button>${ok ? `<button data-action="${okAction}" ${extra && !ui.gmsUnderstand ? 'disabled' : ''}>${e(ok)}</button>` : ''}</div></div>`;
    if (page === 'ads') return `<div class="app-view gms6-app">${bar(g('Ads'), t)}<div class="gms6-scroll">
      ${item('gms-toggle', 'optOut', g('Opt out of interest-based ads'), g('Opt out summary'), check(s.optOut))}
      ${item('gms-dialog', 'reset', g('Reset advertising ID'))}${item('sa-unsupported', '', g('Ads by Google'))}
      <div class="gms6-item gms6-static"><span class="gms6-text"><b>${e(g('Your advertising ID'))}</b><small>${e(s.adid)}</small></span></div></div>
      ${ui.gmsDialog === 'reset' ? confirm('', g('Reset message'), t('OK'), 'gms-reset') : ''}</div>`;
    if (page === 'security') return `<div class="app-view gms6-app">${bar(g('Security'), t)}<div class="gms6-scroll">${cat(g('Android Device Manager'))}
      ${item('gms-toggle', 'locate', g('Remotely locate this device'), g(s.access ? 'Locate summary' : 'Locate disabled summary'), check(s.locate && s.access, !s.access), !s.access)}
      ${item('gms-toggle', 'wipe', g('Allow remote lock and erase'), g('Wipe summary'), check(s.wipe))}${cat(g('Verify apps'))}
      ${item('gms-toggle', 'verify', g('Scan device for security threats'), g('Scan summary'), check(s.verify))}
      ${item('gms-toggle', 'upload', g('Improve harmful app detection'), g(s.verify ? 'Upload summary' : 'Upload disabled summary'), check(s.upload && s.verify, !s.verify), !s.verify)}</div></div>`;
    if (page === 'apps') return `<div class="app-view gms6-app">${bar(g('Connected apps title'), t)}<div class="gms6-scroll gms6-empty"><p>${rich(g('Apps empty').trim())}</p></div></div>`;
    if (page === 'location') return `<div class="app-view gms6-app">${bar(g('Google location settings'), t)}<div class="gms6-scroll gms6-pad">
      <div class="gms6-access">${item('gms-toggle', 'access', g('Access location'), g('Access location summary'), check(s.access))}</div>
      <div class="gms6-account${s.access ? '' : ' off'}"><h4 class="gms6-header">${e(ACCOUNT)}</h4>${item('gms-open', 'reporting', g('Location Reporting'), g(s.reporting ? 'Reporting on' : 'Reporting off'))}<i class="gms6-div"></i>${item('gms-open', 'history', g('Location History'), g(s.history ? 'History on' : 'History off'))}</div></div></div>`;
    if (page === 'reporting' || page === 'history') {
      const history = page === 'history', on = s[page];
      const switchBar = `<button class="gms6-switchbar" data-action="gms-toggle" data-id="${page}" role="switch" aria-checked="${on}"><span>${e(g(on ? 'On' : 'Off'))}</span>${check(on)}</button>`;
      const dialog = ui.gmsDialog === 'delete' ? confirm(g('Permanently delete?'), g('Delete body'), g('Delete'), 'gms-delete', `<button class="gms6-dlgcheck" data-action="gms-understand" role="checkbox" aria-checked="${!!ui.gmsUnderstand}">${check(ui.gmsUnderstand)}<span>${e(g('I understand and want to delete'))}</span></button>`) : '';
      return `<div class="app-view gms6-app">${bar(g(history ? 'Location History' : 'Location Reporting'), t)}${switchBar}<div class="gms6-text-page"><p>${rich(g(history ? 'History text' : 'Reporting text'))}</p></div>${history ? `<button class="gms6-delete" data-action="gms-dialog" data-id="delete" ${ui.gmsDeleting ? 'disabled' : ''}>${e(g(ui.gmsDeleting ? 'DELETING...' : 'DELETE LOCATION HISTORY'))}</button>` : ''}${dialog}</div>`;
    }
    return '';
  }
  function back(ui) {
    if (ui.gmsDialog) { ui.gmsDialog = ''; return true; }
    if (['gms-reporting', 'gms-history'].includes(ui.sub)) { ui.sub = 'gms-location'; return true; }
    if (String(ui.sub || '').startsWith('gms-')) { ui.sub = ''; return true; }
    return false;
  }
  window.GMSSettings = {render, back, state, newId};
})();
