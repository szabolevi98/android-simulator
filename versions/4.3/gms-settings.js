/* Google Settings' pages on the Nexus 4 (PrebuiltGmsCore 3.1.58 of JWR66Y), opened from GoogleSettingsActivity's list
   (stock-apps.js). The GMS pages use common.Activity.Light.NoTitleBar with common_settings_action_bar.xml (the up
   arrow, a 32 dp icon, the 18 sp title) over a list 16 dp in:
   - Ads, AdsSettingsActivity: "Google Ads" (ic_google_selected), ads_checkbox.xml (18 sp title, the check box in a
     48 dp cell) and link_preference.xml (14 sp secondary text 30 dp in) with admob_ads_description.
   - Verify apps, SecuritySettingsActivity: verify_apps_checkbox.xml whose caption is verify_applications_summary.
   - Apps with Google+ Sign-In, ListAppsActivity: plus_icon_red_32, "Connected apps" over the account
     (plus_list_apps_account_static.xml), and list_apps_empty_message as nothing is connected.
   - Location, GoogleLocationSettingsActivity in Theme.Holo.Light: the "Access location" CheckBoxPreference, then a
     PreferenceCategory titled with the account holding Location reporting and Location history (summaries On / Off);
     each opens a Theme.Holo.Light page with a Switch in the action bar (setCustomView) over its full text, and
     Location history adds the DELETE LOCATION HISTORY button with its confirmation dialog (the "I understand"
     check box enables Delete). Defaults: access on, reporting and history off, as on a newly set-up phone.
   Links ("Learn more") are drawn as link text only. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const ACCOUNT = 'jellybean.demo@gmail.com';
  // The APK's <a href=%1$s>…</a> markup as link-coloured text; new lines kept.
  const rich = text => e(text).replace(/&lt;a href=[^&]*?(?:&quot;[^&]*?&quot;)?[^&]*?&gt;(.*?)&lt;\/a&gt;/g, '<span class="gms-link">$1</span>').replace(/\n/g, '<br>');
  const state = data => ({ads: true, verify: true, access: true, reporting: false, history: false, ...data.gms});
  const check = on => `<i class="gms-check${on ? ' on' : ''}" aria-hidden="true"></i>`;
  const gbar = (g, icon, title) => `<header class="gs-bar"><button class="gs-up" data-action="back" aria-label="${e(g('Google Settings'))}"><i></i><img src="assets/${icon}" alt=""></button>${title}</header>`;
  const hbar = (g, title, toggle) => `<header class="gms-hbar"><button class="gms-hup" data-action="back" aria-label="${e(title)}"><img class="gms-caret" src="assets/ic_ab_back_holo_light.png" alt=""><img class="gms-appicon" src="assets/gms-common_ic_googleplayservices.png" alt=""></button><b>${e(title)}</b>${toggle || ''}</header>`;
  const sw = (key, on, g) => `<button class="gms-switch${on ? ' on' : ''}" data-action="gms-toggle" data-id="${key}" role="switch" aria-checked="${on}"><i>${e(g(on ? 'ON' : 'OFF'))}</i></button>`;
  function render(ctx, g) {
    const {ui, data} = ctx, s = state(data), page = String(ui.sub || '').slice(4);
    if (page === 'ads') return `<div class="app-view gms-app">${gbar(g, 'gms-ic_google_selected.png', `<b>${e(g('Google Ads'))}</b>`)}<div class="gms-list">
      <button class="gms-box" data-action="gms-toggle" data-id="ads" role="checkbox" aria-checked="${s.ads}"><span>${e(g('Personalize Google Ads in Apps'))}</span>${check(s.ads)}</button>
      <p class="gms-linkpref">${rich(g('Ads description'))}</p></div></div>`;
    if (page === 'verify') return `<div class="app-view gms-app">${gbar(g, 'google-settings.png', `<b>${e(g('Verify apps'))}</b>`)}<div class="gms-list">
      <button class="gms-box" data-action="gms-toggle" data-id="verify" role="checkbox" aria-checked="${s.verify}"><span>${e(g('Verify apps'))}</span>${check(s.verify)}</button>
      <p class="gms-caption">${rich(g('Verify apps summary'))}</p></div></div>`;
    if (page === 'apps') return `<div class="app-view gms-app">${gbar(g, 'gms-plus_icon_red_32.png', `<span class="gms-two"><b>${e(g('Connected apps'))}</b><small>${e(ACCOUNT)}</small></span>`)}<div class="gms-list gms-empty"><p>${rich(g('Apps empty').trim())}</p></div></div>`;
    if (page === 'location') {
      const pref = (action, title, summary, widget = '', id = '') => `<button class="gms-pref" data-action="${action}" data-id="${id}"><span class="gms-pref-text"><b>${e(title)}</b><small>${e(summary)}</small></span>${widget}</button>`;
      return `<div class="app-view gms-app gms-holo">${hbar(g, g('Google location settings'))}<div class="gms-prefs">
        ${pref('gms-toggle', g('Access location'), g('Access location summary'), check(s.access), 'access')}
        <h4 class="gms-cat">${e(ACCOUNT)}</h4>
        <div class="gms-catbody${s.access ? '' : ' off'}">${pref('gms-open', g('Location reporting'), g(s.reporting ? 'On' : 'Off'), '', 'reporting')}${pref('gms-open', g('Location history'), g(s.history ? 'On' : 'Off'), '', 'history')}</div></div></div>`;
    }
    if (page === 'reporting' || page === 'history') {
      const history = page === 'history', deleting = ui.gmsDeleting;
      const dialog = ui.gmsDialog === 'delete' ? `<div class="gms-scrim" data-action="gms-dialog" data-id=""></div><div class="gms-dialog" role="dialog"><h3>${e(g('Permanently delete?'))}</h3><p>${rich(g('Delete body'))}</p><button class="gms-dlgcheck" data-action="gms-understand" role="checkbox" aria-checked="${!!ui.gmsUnderstand}">${check(ui.gmsUnderstand)}<span>${e(g('I understand and want to delete'))}</span></button><div class="gms-dlgbuttons"><button data-action="gms-dialog" data-id="">${e(ctx.t('Cancel'))}</button><button data-action="gms-delete" ${ui.gmsUnderstand ? '' : 'disabled'}>${e(g('Delete'))}</button></div></div>` : '';
      return `<div class="app-view gms-app gms-holo">${hbar(g, g(history ? 'Location History' : 'Location Reporting'), sw(page, s[page], ctx.t))}<div class="gms-text"><p>${rich(g(history ? 'History text' : 'Reporting text'))}</p></div>${history ? `<button class="gms-delete" data-action="gms-dialog" data-id="delete" ${deleting ? 'disabled' : ''}>${e(g(deleting ? 'DELETING...' : 'DELETE LOCATION HISTORY'))}</button>` : ''}${dialog}</div>`;
    }
    return '';
  }
  // Back: a dialog first, then the location pages to Google location settings, the rest to Google Settings.
  function back(ui) {
    if (ui.gmsDialog) { ui.gmsDialog = ''; return true; }
    if (['gms-reporting', 'gms-history'].includes(ui.sub)) { ui.sub = 'gms-location'; return true; }
    if (String(ui.sub || '').startsWith('gms-')) { ui.sub = ''; return true; }
    return false;
  }
  window.GMSSettings = {render, back, state};
})();
