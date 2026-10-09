/* Google Settings' pages on the Nexus 5 (PrebuiltGmsCore 4.3.23 of KTU84P), opened from GoogleSettingsActivity's list
   (stock-apps.js). These activities are ActionBarActivities in Theme.AppCompat.Light, so KitKat draws its own Holo
   Light action bar (ab_solid_light_holo #DDDDDD with the #D2D2D2 base, the app icon, the label); only the location
   pages handle Up. The pages are GMS layouts 16 dp in, with the #DDDDDD divider.xml / header_divider.xml lines:
   - Ads, AdsSettingsActivity (ads_settings.xml): ADVERTISING ID: Your advertising ID, Reset advertising ID (its
     dialog, then a new random ID), Opt out of interest-based ads (check box), Learn more; ADS BY GOOGLE: Ads Settings.
   - Verify apps, SecuritySettingsActivity (security_settings.xml): VerifyAppsCheckBox with its summary.
   - Android Device Manager, MdmSettingsActivity (mdm_settings.xml): Remotely locate this device (unavailable while
     Access location is off) and Allow remote lock and erase.
   - Drive apps, DriveSettingsActivity (drive_settings.xml): DATA USAGE, Transfer files only over WiFi (the image's
     Drive strings are English only).
   - Apps with Google+ Sign-In, ListAppsActivity: "Connected apps" and plus_list_apps_aspen_empty_message.
   - Location, GoogleLocationSettingsActivity (location_settings.xml): Access location (preference.xml with its check
     box), then location_account_settings.xml for the account: pref_header, Location Reporting, Location History;
     each page has the Switch in its action bar over the full text, Location History the delete button and dialog.
   Defaults: personalised ads, verify apps and locate on; remote erase, Wi-Fi only, reporting and history off.
   Play Games (GamesSettingsActivity) and Google+ (the Google+ app's settings) are not drawn here. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const ACCOUNT = 'kitkat.demo@gmail.com';
  const rich = text => e(text).replace(/&lt;a href=[^&]*?(?:&quot;[^&]*?&quot;)?[^&]*?&gt;(.*?)&lt;\/a&gt;/g, '<span class="gms-link">$1</span>').replace(/\n/g, '<br>');
  const newId = () => ([8, 4, 4, 4, 12].map(n => Array.from({length: n}, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')).join('-'));
  const state = data => ({optOut: false, adid: '', verify: true, locate: true, wipe: false, wifiOnly: false, access: true, reporting: false, history: false, ...data.gms});
  const check = (on, disabled) => `<i class="gms-check${on ? ' on' : ''}${disabled ? ' disabled' : ''}" aria-hidden="true"></i>`;
  const bar = (title, icon, up) => `<header class="gms-hbar">${up ? `<button class="gms-hup" data-action="back" aria-label="${e(title)}"><img class="gms-caret" src="assets/ic_ab_back_holo_light.png" alt="">` : '<span class="gms-hup">'}<img class="gms-appicon" src="assets/${icon}" alt="">${up ? '</button>' : '</span>'}<b>${e(title)}</b></header>`;
  const sw = (key, on, t) => `<button class="gms-switch${on ? ' on' : ''}" data-action="gms-toggle" data-id="${key}" role="switch" aria-checked="${on}"><i>${e(t(on ? 'ON' : 'OFF'))}</i></button>`;
  const ICON = 'gms-common_ic_googleplayservices.png';
  function render(ctx, g) {
    const {ui, data} = ctx, s = state(data), page = String(ui.sub || '').slice(4);
    const row = (action, id, title, summary = '', widget = '', disabled = false) => `<button class="gms-row" data-action="${action}" data-id="${id}" ${disabled ? 'disabled' : ''}><span class="gms-row-text"><b>${e(title)}</b>${summary ? `<small>${rich(summary)}</small>` : ''}</span>${widget}</button>`;
    const cat = title => `<h4 class="gms-cat">${e(title)}</h4><i class="gms-hdiv"></i>`, div = '<i class="gms-div"></i>';
    if (page === 'ads') {
      const dialog = ui.gmsDialog === 'reset' ? `<div class="gms-scrim" data-action="gms-dialog" data-id=""></div><div class="gms-dialog" role="dialog"><p>${e(g('Reset message'))}</p><div class="gms-dlgbuttons"><button data-action="gms-dialog" data-id="">${e(ctx.t('Cancel'))}</button><button data-action="gms-reset">${e(ctx.t('OK'))}</button></div></div>` : '';
      return `<div class="app-view gms-app">${bar(g('Ads'), ICON)}<div class="gms-scroll">${cat(g('Advertising ID'))}
        <div class="gms-row gms-static"><span class="gms-row-text"><b>${e(g('Your advertising ID'))}</b><small>${e(s.adid)}</small></span></div>${div}
        ${row('gms-dialog', 'reset', g('Reset advertising ID'), g('Reset summary'))}${div}
        ${row('gms-toggle', 'optOut', g('Opt out of interest-based ads'), g('Opt out summary'), check(s.optOut))}${div}
        ${row('sa-unsupported', '', g('Learn more'))}
        ${cat(g('Ads by Google'))}${row('sa-unsupported', '', g('Ads Settings'), g('Ads Settings summary'))}</div>${dialog}</div>`;
    }
    if (page === 'verify') return `<div class="app-view gms-app">${bar(g('Verify apps'), ICON)}<div class="gms-scroll">
      <button class="gms-box" data-action="gms-toggle" data-id="verify" role="checkbox" aria-checked="${s.verify}"><span>${e(g('Verify apps'))}</span>${check(s.verify)}</button>
      <p class="gms-caption">${rich(g('Verify apps summary'))}</p></div></div>`;
    if (page === 'mdm') return `<div class="app-view gms-app">${bar(g('Android Device Manager'), ICON)}<div class="gms-scroll">
      ${row('gms-toggle', 'locate', g('Remotely locate this device'), g(s.access ? 'Locate summary' : 'Locate disabled summary'), check(s.locate && s.access, !s.access), !s.access)}${div}
      ${row('gms-toggle', 'wipe', g('Allow remote lock and erase'), g('Wipe summary'), check(s.wipe))}</div></div>`;
    if (page === 'drive') return `<div class="app-view gms-app">${bar(g('Drive apps'), ICON)}<div class="gms-scroll gms-pad">${cat(g('Data usage'))}${row('gms-toggle', 'wifiOnly', g('Transfer files only over WiFi'), g('WiFi summary'), check(s.wifiOnly))}</div></div>`;
    if (page === 'apps') return `<div class="app-view gms-app">${bar(g('Connected apps'), 'gms-plus_icon_red_32.png')}<div class="gms-scroll gms-empty"><p>${rich(g('Apps empty').trim())}</p></div></div>`;
    if (page === 'location') return `<div class="app-view gms-app">${bar(g('Google location settings'), ICON, true)}<div class="gms-scroll">
      <div class="gms-access">${row('gms-toggle', 'access', g('Access location'), g('Access location summary'), check(s.access))}</div>
      <div class="gms-account${s.access ? '' : ' off'}"><h4 class="gms-cat">${e(ACCOUNT)}</h4>${row('gms-open', 'reporting', g('Location Reporting'), g(s.reporting ? 'On' : 'Off'))}${div}${row('gms-open', 'history', g('Location History'), g(s.history ? 'On' : 'Off'))}</div></div></div>`;
    if (page === 'reporting' || page === 'history') {
      const history = page === 'history', deleting = ui.gmsDeleting;
      const dialog = ui.gmsDialog === 'delete' ? `<div class="gms-scrim" data-action="gms-dialog" data-id=""></div><div class="gms-dialog" role="dialog"><h3>${e(g('Permanently delete?'))}</h3><p>${rich(g('Delete body'))}</p><button class="gms-dlgcheck" data-action="gms-understand" role="checkbox" aria-checked="${!!ui.gmsUnderstand}">${check(ui.gmsUnderstand)}<span>${e(g('I understand and want to delete'))}</span></button><div class="gms-dlgbuttons"><button data-action="gms-dialog" data-id="">${e(ctx.t('Cancel'))}</button><button data-action="gms-delete" ${ui.gmsUnderstand ? '' : 'disabled'}>${e(g('Delete'))}</button></div></div>` : '';
      return `<div class="app-view gms-app">${bar(g(history ? 'Location History' : 'Location Reporting'), ICON, true).replace('</header>', `${sw(page, s[page], ctx.t)}</header>`)}<div class="gms-text"><p>${rich(g(history ? 'History text' : 'Reporting text'))}</p></div>${history ? `<button class="gms-delete" data-action="gms-dialog" data-id="delete" ${deleting ? 'disabled' : ''}>${e(g(deleting ? 'DELETING...' : 'DELETE LOCATION HISTORY'))}</button>` : ''}${dialog}</div>`;
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
