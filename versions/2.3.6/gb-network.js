/* Android 2.3.6 network screens behind Wireless & networks, from the Nexus S GRK39F Settings and Phone apps:
   WifiApSettings (wifi_ap_settings.xml) with WifiApDialog (wifi_ap_dialog.xml) and TetherSettings' help (assets/html
   tethering_help.html in a WebView dialog); VpnSettings (vpn_settings.xml), VpnTypeSelection and VpnEditor with the
   Pptp / L2tp / L2tpIpsecPsk / L2tpIpsec editors, AuthenticationActor's connect dialog (vpn_connect_dialog_view.xml) and
   VpnServices' notification; ApnSettings (apn_preference_layout.xml) and ApnEditor (apn_editor.xml) over the image's
   /system/etc/apns-conf.xml rows for the SIM (216 30); Phone's NetworkSetting (carrier_select.xml); and SecuritySettings'
   credential storage dialogs (credentials_password_dialog.xml, credentials_unlock_dialog.xml), which the VPN profiles
   that keep secrets unlock first. Strings: gb-strings-network.js (Settings, framework, VpnServices) and
   gb-strings-phonenet.js (Phone). Secrets are never stored: a profile only remembers that one was set. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const lookup = (group, lang, key) => { const entry = window.GBStrings?.[group]?.strings?.[key]; return entry ? entry[lang] ?? entry.en : key; };
  const array = (lang, name) => { const entry = window.GBStrings?.network?.arrays?.[name]; return entry ? entry[lang] || entry.en : []; };
  // Java's String.format for %s, %d and %1$s.
  const fmt = (pattern, ...args) => { let next = 0; return String(pattern).replace(/%(?:(\d+)\$)?[sd]/g, (m, pos) => String(args[pos ? Number(pos) - 1 : next++] ?? '')); };

  // VpnType (android.net.vpn): the display name and the framework description, in VpnManager.getSupportedVpnTypes order.
  const VPN_TYPES = [['PPTP', 'PPTP', 'pptp_vpn_description'], ['L2TP', 'L2TP', 'l2tp_vpn_description'], ['L2TP_IPSEC_PSK', 'L2TP/IPSec PSK', 'l2tp_ipsec_psk_vpn_description'], ['L2TP_IPSEC', 'L2TP/IPSec CRT', 'l2tp_ipsec_crt_vpn_description']];
  const vpnType = id => VPN_TYPES.find(type => type[0] === id) || VPN_TYPES[0];
  // apns-conf.xml (GRK39F) for mcc 216 / mnc 30, the simulator's SIM; "Web" is the APN the data connection uses.
  const APNS = [
    {id: '1', name: 'T-Mobile MMS', apn: 'mms', user: 'mms', password: 'mms', mmsc: 'http://mms.t-mobile.hu/servlets/mms', mmsproxy: '212.51.126.10', mmsport: '8080', mcc: '216', mnc: '30', type: 'mms'},
    {id: '2', name: 'Web', apn: 'wnw', mcc: '216', mnc: '30', type: 'default,supl'}];
  const DEFAULT_APN = '2';
  // NetworkSetting's scan: the Hungarian networks (apns-conf.xml mcc 216); the SIM may register on its own only.
  const NETWORKS = [['Telekom HU', true], ['Telenor HU', false], ['Vodafone HU', false]];
  const SSID_DEFAULT = 'AndroidAP';
  const MAX_RETRY = 4;

  const N = (ctx, key) => lookup('network', ctx.lang, key);
  const P = (ctx, key) => lookup('phonenet', ctx.lang, key);
  // WifiApSettings, VpnSettings and VpnTypeSelection have no label of their own: the window shows the Settings app's.
  const appTitle = ctx => window.GBSettings ? window.GBSettings.text(ctx.lang, 'settings_label') : 'Settings';
  // A small digest so the credential storage can check its password without keeping it.
  const digest = text => { let h = 0x811c9dc5; for (const ch of String(text)) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16); };

  // Preference rows in the Settings look (gb-settings.css).
  const text = (title, summary) => `<span class="gbset-text"><span class="gbset-title">${e(title)}</span>${summary ? `<span class="gbset-sum">${e(summary)}</span>` : ''}</span>`;
  const pref = (title, summary, action, id = '', extra = {}) => `<button class="gbset-row" data-action="${e(action)}" data-id="${e(id)}"${extra.hold ? ` data-gbnet-hold="${e(extra.hold)}"` : ''}${extra.disabled ? ' disabled aria-disabled="true"' : ''}>${text(title, summary)}</button>`;
  const checkRow = (title, summary, on, action, id, disabled) => `<button class="gbset-row" data-action="${e(action)}" data-id="${e(id)}" role="checkbox" aria-checked="${!!on}"${disabled ? ' disabled aria-disabled="true"' : ''}>${text(title, summary)}<img class="gbset-check" src="assets/gb-btn_check_${on ? 'on' : 'off'}${disabled ? '_disable' : ''}.png" alt=""></button>`;
  const category = title => `<div class="gbset-cat">${e(title)}</div>`;
  const page = (title, rows) => ({title, html: `<div class="app-view gbset gbnet" data-no-translate><div class="gb-titlebar">${e(title)}</div><div class="gbset-list">${rows}</div></div>`});

  // ---- State -------------------------------------------------------------------------------------------------------
  const hotspot = data => data.gbHotspot || null;
  const apSecurity = config => array('en', 'wifi_ap_security')[config && config.security === 1 ? 1 : 0];
  const credState = data => !data.settings.gbCredHash ? 'uninit' : data.settings.gbCredLocked ? 'locked' : 'unlocked';
  const vpns = data => (data.gbVpns || []).slice().sort((a, b) => a.name.localeCompare(b.name));
  const apns = data => data.gbApns || APNS;
  const selectedApn = data => data.gbApnSelected ?? DEFAULT_APN;
  const needKeyStoreToConnect = p => p.type === 'L2TP_IPSEC' || p.type === 'L2TP_IPSEC_PSK' || p.type === 'L2TP' && p.secretEnabled;
  const vpnState = (ctx, id) => ctx.ui.gbVpnActive?.id === id ? ctx.ui.gbVpnActive.state : 'idle';
  // VpnProfileEditor / VpnEditor fields compared for "changed" (secrets count once entered).
  const vpnFields = p => JSON.stringify([p.name, p.server, p.domains, p.encryption, p.secretEnabled, p.secretNew || false, p.pskNew || false, p.userCert, p.caCert]);
  const apnFields = a => JSON.stringify(['name', 'apn', 'proxy', 'port', 'user', 'password', 'server', 'mmsc', 'mmsproxy', 'mmsport', 'mcc', 'mnc', 'authtype', 'type', 'protocol'].map(k => a[k] ?? ''));

  // ---- Screens -----------------------------------------------------------------------------------------------------
  const SCREENS = ['wifi-ap', 'vpn', 'vpn-type', 'vpn-edit', 'apn', 'apn-edit', 'operators'];
  const has = sub => SCREENS.includes(sub);

  function hotspotSummary(ctx) {
    const s = ctx.data.settings;
    if (ctx.ui.gbApTurning) return N(ctx, ctx.ui.gbApTurning === 'on' ? 'wifi_starting' : 'wifi_stopping');
    return s.portableHotspot ? fmt(N(ctx, 'wifi_tether_enabled_subtext'), hotspot(ctx.data)?.ssid || SSID_DEFAULT) : '';
  }
  function render(sub, ctx) {
    const {data, ui} = ctx, s = data.settings;
    if (sub === 'wifi-ap') {
      const config = hotspot(data);
      return page(appTitle(ctx),
        checkRow(N(ctx, 'wifi_tether_checkbox_text'), hotspotSummary(ctx), s.portableHotspot, 'gbnet-hotspot', '', s.airplane || !!ui.gbApTurning) +
        pref(N(ctx, 'wifi_tether_configure_ap_text'), fmt(N(ctx, 'wifi_tether_configure_subtext'), config?.ssid || SSID_DEFAULT, apSecurity(config)), 'gbnet-dialog', 'ap'));
    }
    if (sub === 'vpn') {
      const active = ui.gbVpnActive;
      const summary = p => N(ctx, {connecting: 'vpn_connecting', disconnecting: 'vpn_disconnecting', connected: 'vpn_connected'}[vpnState(ctx, p.id)] || 'vpn_connect_hint');
      return page(appTitle(ctx), pref(N(ctx, 'vpn_add_new_vpn'), '', 'gbnet-go', 'vpn-type', {disabled: !!active}) + category(N(ctx, 'vpns')) +
        vpns(data).map(p => pref(p.name, summary(p), 'gbnet-vpn-tap', p.id, {hold: `vpn:${p.id}`, disabled: active && active.id !== p.id})).join(''));
    }
    if (sub === 'vpn-type') return page(appTitle(ctx), VPN_TYPES.map(([id, name, description]) => pref(fmt(N(ctx, 'vpn_edit_title_add'), name), N(ctx, description), 'gbnet-vpn-new', id)).join(''));
    if (sub === 'vpn-edit') {
      const d = ui.gbVpnDraft;
      if (!d) return page('', '');
      const notSet = (field, optional) => fmt(N(ctx, optional ? 'vpn_field_not_set_optional' : 'vpn_field_not_set'), N(ctx, field));
      const secret = (key, title, field) => pref(N(ctx, title), fmt(N(ctx, d[`${key}Set`] || d[`${key}New`] ? 'vpn_field_is_set' : 'vpn_field_not_set'), N(ctx, field)), 'gbnet-edit', key, {disabled: key === 'secret' && !d.secretEnabled});
      const toggle = (key, field) => checkRow(fmt(N(ctx, 'vpn_enable_field'), N(ctx, key === 'encryption' ? 'vpn_pptp_encryption_title' : field)), fmt(N(ctx, d[key] ? 'vpn_is_enabled' : 'vpn_is_disabled'), N(ctx, field)), d[key], 'gbnet-vpn-check', key);
      let rows = pref(N(ctx, 'vpn_name'), d.name || notSet('vpn_name'), 'gbnet-edit', 'name') + pref(N(ctx, 'vpn_vpn_server_title'), d.server || notSet('vpn_vpn_server'), 'gbnet-edit', 'server');
      if (d.type === 'PPTP') rows += toggle('encryption', 'vpn_pptp_encryption');
      else {
        rows += toggle('secretEnabled', 'vpn_l2tp_secret') + secret('secret', 'vpn_l2tp_secret_string_title', 'vpn_l2tp_secret');
        if (d.type === 'L2TP_IPSEC_PSK') rows += secret('psk', 'vpn_ipsec_presharedkey_title', 'vpn_ipsec_presharedkey');
        if (d.type === 'L2TP_IPSEC') rows += pref(N(ctx, 'vpn_user_certificate_title'), d.userCert || notSet('vpn_user_certificate'), 'gbnet-list', 'userCert') + pref(N(ctx, 'vpn_ca_certificate_title'), d.caCert || notSet('vpn_ca_certificate'), 'gbnet-list', 'caCert');
      }
      rows += pref(N(ctx, 'vpn_dns_search_list_title'), d.domains || notSet('vpn_dns_search_list', true), 'gbnet-edit', 'domains');
      return page(fmt(N(ctx, d.isNew ? 'vpn_edit_title_add' : 'vpn_edit_title_edit'), vpnType(d.type)[1]), rows);
    }
    if (sub === 'apn') {
      const selected = selectedApn(data), list = apns(data).slice().sort((a, b) => a.name.localeCompare(b.name));
      const row = a => { const selectable = a.type !== 'mms'; return `<div class="gbnet-apn"><button class="gbnet-apn-text" data-action="gbnet-apn-edit" data-id="${e(a.id)}"><b>${e(a.name)}</b><small>${e(a.apn)}</small></button>${selectable ? `<button class="gbnet-apn-radio" data-action="gbnet-apn-select" data-id="${e(a.id)}" role="radio" aria-checked="${a.id === selected}" aria-label="${e(a.name)}"><img src="assets/gb-btn_radio_${a.id === selected ? 'on' : 'off'}.png" alt=""></button>` : ''}</div>`; };
      return page(N(ctx, 'apn_settings'), [...list.filter(a => a.type !== 'mms'), ...list.filter(a => a.type === 'mms')].map(row).join(''));
    }
    if (sub === 'apn-edit') {
      const a = ui.gbApnDraft;
      if (!a) return page('', '');
      const notSet = N(ctx, 'apn_not_set'), field = (key, title) => pref(N(ctx, title), a[key] || notSet, 'gbnet-edit', key);
      const auth = array(ctx.lang, 'apn_auth_entries'), protocols = array(ctx.lang, 'apn_protocol_entries'), protocolIndex = ['IP', 'IPV6', 'IPV4V6'].indexOf(a.protocol || 'IP');
      return page(N(ctx, 'apn_edit'), field('name', 'apn_name') + field('apn', 'apn_apn') + field('proxy', 'apn_http_proxy') + field('port', 'apn_http_port') + field('user', 'apn_user') +
        pref(N(ctx, 'apn_password'), a.password ? '*'.repeat(a.password.length) : notSet, 'gbnet-edit', 'password') + field('server', 'apn_server') + field('mmsc', 'apn_mmsc') +
        field('mmsproxy', 'apn_mms_proxy') + field('mmsport', 'apn_mms_port') + field('mcc', 'apn_mcc') + field('mnc', 'apn_mnc') +
        pref(N(ctx, 'apn_auth_type'), a.authtype >= 0 ? auth[a.authtype] : notSet, 'gbnet-list', 'authtype') + field('type', 'apn_type') +
        pref(N(ctx, 'apn_protocol'), protocols[protocolIndex] || notSet, 'gbnet-list', 'protocol'));
    }
    if (sub === 'operators') {
      const busy = !!ui.gbNetBusy;
      return page(P(ctx, 'networks'), pref(P(ctx, 'search_networks'), P(ctx, 'sum_search_networks'), 'gbnet-op-search', '', {disabled: busy}) +
        pref(P(ctx, 'select_automatically'), P(ctx, 'sum_select_automatically'), 'gbnet-op-auto', '', {disabled: busy}) +
        (ui.gbNetFound || []).map(([name]) => pref(name, '', 'gbnet-op-pick', name, {disabled: busy})).join(''));
    }
    return null;
  }

  // ---- Menus -------------------------------------------------------------------------------------------------------
  function menu(sub, ctx) {
    if (sub === 'vpn-edit' && ctx.ui.gbVpnDraft) return [{action: 'gbnet-vpn-save', title: N(ctx, 'vpn_menu_done'), icon: 'ic_menu_save'}, {action: 'gbnet-vpn-cancel', title: N(ctx, ctx.ui.gbVpnDraft.isNew ? 'vpn_menu_cancel' : 'vpn_menu_revert'), icon: 'ic_menu_close_clear_cancel'}];
    if (sub === 'apn') return [{action: 'gbnet-apn-new', title: N(ctx, 'menu_new'), icon: 'ic_menu_add'}, {action: 'gbnet-apn-restore', title: N(ctx, 'menu_restore'), icon: 'ic_menu_upload'}];
    if (sub === 'apn-edit' && ctx.ui.gbApnDraft) return [...(ctx.ui.gbApnDraft.isNew ? [] : [{action: 'gbnet-apn-delete', title: N(ctx, 'menu_delete'), icon: 'ic_menu_delete'}]), {action: 'gbnet-apn-save', title: N(ctx, 'menu_save'), icon: 'ic_menu_save'}, {action: 'gbnet-apn-discard', title: N(ctx, 'menu_cancel'), icon: 'ic_menu_close_clear_cancel'}];
    return [];
  }

  // ---- Dialogs -----------------------------------------------------------------------------------------------------
  const EDIT_FIELDS = {
    // VpnEditor: title (also the dialog title), input type.
    vpn: {name: ['vpn_name'], server: ['vpn_vpn_server_title'], domains: ['vpn_dns_search_list_title'], secret: ['vpn_l2tp_secret_string_title', 'password'], psk: ['vpn_ipsec_presharedkey_title', 'password']},
    // ApnEditor (apn_editor.xml inputType: textUri / number / textPassword).
    apn: {name: ['apn_name'], apn: ['apn_apn'], proxy: ['apn_http_proxy'], port: ['apn_http_port', 'number'], user: ['apn_user'], password: ['apn_password', 'password'], server: ['apn_server'], mmsc: ['apn_mmsc'], mmsproxy: ['apn_mms_proxy'], mmsport: ['apn_mms_port', 'number'], mcc: ['apn_mcc', 'number'], mnc: ['apn_mnc', 'number'], type: ['apn_type']}
  };
  const input = (attrs, value = '') => `<input class="gbdlg-input gbnet-input" ${attrs} value="${e(value)}" autocomplete="off" spellcheck="false">`;
  const errorLine = ctx => ctx.ui.gbNetError ? `<p class="gbnet-error">${e(ctx.ui.gbNetError)}</p>` : '';
  function helpBody(ctx) {
    const lang = ['de', 'fr', 'es'].includes(ctx.lang) ? ctx.lang : 'en';
    if (help.lang !== lang) { help.lang = lang; help.html = ''; fetch(`assets/gb-tethering_help-${lang}.html`).then(r => r.text()).then(html => { help.html = html.replace(/^[\s\S]*?<body[^>]*>|<\/body>[\s\S]*$/gi, '').replace(/<a href="([^"]+)">/g, '<a href="#" data-action="gbnet-link" data-id="$1">'); if (ctx.ui.overlay === 'gb-dialog-net' && ctx.ui.gbNetDialog === 'help') ctx.renderOverlay(); }).catch(() => {}); }
    return help.html;
  }
  const help = {lang: '', html: ''};

  function dialog(kind, ctx) {
    const {ui, data} = ctx, ok = N(ctx, 'ok'), cancel = N(ctx, 'cancel'), alert = N(ctx, 'dialog_alert_title');
    if (kind === 'ap') {
      // WifiApDialog: SSID, the Security spinner (wifi_ap_security), Password with its hint and Show password; Save stays
      // disabled until the SSID is set and a WPA2 key has 8 characters. setInverseBackgroundForced: a bright body.
      const d = ui.gbApDraft, wpa = d.security === 1, valid = d.ssid.length > 0 && (!wpa || d.password.length >= 8);
      const fields = wpa ? `<label class="gbnet-label">${e(N(ctx, 'wifi_password'))}</label>${input(`type="${d.show ? 'text' : 'password'}" data-gbnet-ap="password" maxlength="63"`, d.password)}<p class="gbnet-hint">${e(N(ctx, 'credentials_password_too_short'))}</p><label class="gbnet-checkline"><input type="checkbox" data-gbnet-ap="show"${d.show ? ' checked' : ''}> ${e(N(ctx, 'wifi_show_password'))}</label>` : '';
      return {title: N(ctx, 'wifi_tether_configure_ap_text'), light: true, custom: `<div class="gbnet-form gbnet-inverse"><label class="gbnet-label">${e(N(ctx, 'wifi_ssid'))}</label>${input('data-gbnet-ap="ssid" maxlength="32"', d.ssid)}<label class="gbnet-label">${e(N(ctx, 'wifi_security'))}</label><button type="button" class="gbnet-spinner" data-action="gbnet-ap-security">${e(array(ctx.lang, 'wifi_ap_security')[d.security])}</button>${fields}</div>`,
        buttons: [{action: 'gbnet-ap-save', title: N(ctx, 'wifi_save'), disabled: !valid}, {action: 'gbnet-ap-cancel', title: N(ctx, 'wifi_cancel')}]};
    }
    if (kind === 'ap-security') return {title: N(ctx, 'wifi_security'), items: array(ctx.lang, 'wifi_ap_security').map((label, i) => ({action: 'gbnet-ap-security-pick', id: String(i), title: label})), choice: 'single', selected: ui.gbApDraft.security, cancel: 'gbnet-ap-security-back'};
    if (kind === 'help') return {title: N(ctx, 'tethering_help_button_text'), custom: `<div class="gbnet-web">${helpBody(ctx)}</div>`};
    if (kind.startsWith('edit:')) {
      const key = kind.slice(5), [title, type] = EDIT_FIELDS[ui.sub === 'apn-edit' ? 'apn' : 'vpn'][key] || [key];
      const draft = ui.sub === 'apn-edit' ? ui.gbApnDraft : ui.gbVpnDraft, isSecret = ui.sub === 'vpn-edit' && (key === 'secret' || key === 'psk');
      // SecretHandler: the field starts empty with the hint "(unchanged)" or "(not set)".
      const hint = isSecret ? ` placeholder="${e(N(ctx, draft[`${key}Set`] || draft[`${key}New`] ? 'vpn_secret_unchanged' : 'vpn_secret_not_set'))}"` : '';
      const attrs = `data-gbnet-edit type="${type === 'password' ? 'password' : 'text'}"${type === 'number' ? ' inputmode="numeric"' : ''}${hint}`;
      return {title: N(ctx, title), custom: `<div class="gbnet-form">${input(attrs, isSecret ? '' : draft[key] ?? '')}</div>`, buttons: [{action: 'gbnet-edit-ok', id: key, title: ok}, {action: 'close-overlay', title: cancel}]};
    }
    if (kind.startsWith('list:')) {
      const key = kind.slice(5);
      if (key === 'authtype') return {title: N(ctx, 'apn_auth_type'), items: array(ctx.lang, 'apn_auth_entries').map((label, i) => ({action: 'gbnet-list-pick', id: `authtype:${i}`, title: label})), choice: 'single', selected: ui.gbApnDraft.authtype ?? -1, buttons: [{action: 'close-overlay', title: cancel}]};
      if (key === 'protocol') return {title: N(ctx, 'apn_protocol'), items: array(ctx.lang, 'apn_protocol_entries').map((label, i) => ({action: 'gbnet-list-pick', id: `protocol:${i}`, title: label})), choice: 'single', selected: ['IP', 'IPV6', 'IPV4V6'].indexOf(ui.gbApnDraft.protocol || 'IP'), buttons: [{action: 'close-overlay', title: cancel}]};
      // L2tpIpsecEditor: the keystore's certificates; the simulator has none installed.
      return {title: N(ctx, key === 'userCert' ? 'vpn_user_certificate_title' : 'vpn_ca_certificate_title'), items: [], buttons: [{action: 'close-overlay', title: cancel}]};
    }
    if (kind.startsWith('vpn-context:')) {
      const p = (data.gbVpns || []).find(x => x.id === kind.slice(12)); if (!p) return null;
      const state = vpnState(ctx, p.id), idle = state === 'idle', notConnect = idle || state === 'disconnecting';
      return {title: p.name, items: [{action: 'gbnet-vpn-connect', id: p.id, title: N(ctx, 'vpn_menu_connect'), disabled: !(idle && !ui.gbVpnActive)}, {action: 'gbnet-vpn-disconnect', id: p.id, title: N(ctx, 'vpn_menu_disconnect'), disabled: state !== 'connected'}, {action: 'gbnet-vpn-edit', id: p.id, title: N(ctx, 'vpn_menu_edit'), disabled: !notConnect}, {action: 'gbnet-vpn-delete', id: p.id, title: N(ctx, 'vpn_menu_delete'), disabled: !notConnect}]};
    }
    if (kind === 'vpn-connect') {
      const p = (data.gbVpns || []).find(x => x.id === ui.gbVpnActive?.id); if (!p) return null;
      return {title: fmt(N(ctx, 'vpn_connect_to'), p.name), cancel: 'gbnet-vpn-connect-cancel', custom: `<div class="gbnet-form gbnet-connect"><div class="gbnet-pair"><span>${e(N(ctx, 'vpn_username_colon'))}</span>${input('data-gbnet-vpn="username"', ui.gbVpnUser ?? p.username ?? '')}</div><div class="gbnet-pair"><span>${e(N(ctx, 'vpn_password_colon'))}</span>${input('type="password" data-gbnet-vpn="password"')}</div><label class="gbnet-checkline gbnet-remember"><input type="checkbox" data-gbnet-vpn="save"${(ui.gbVpnSave ?? !!p.username) ? ' checked' : ''}> ${e(N(ctx, 'vpn_save_username'))}</label></div>`,
        buttons: [{action: 'gbnet-vpn-connect-ok', title: N(ctx, 'vpn_connect_button')}, {action: 'gbnet-vpn-connect-cancel', title: cancel}]};
    }
    // Util.createErrorDialog: Attention, the message, and Back (with a follow-up) or OK.
    if (kind === 'error') return {title: alert, icon: 'ic_dialog_alert', message: ui.gbNetError, cancel: ui.gbNetErrorNext || 'close-overlay', buttons: [{action: ui.gbNetErrorNext || 'close-overlay', title: N(ctx, ui.gbNetErrorNext ? 'vpn_back_button' : 'ok')}]};
    if (kind === 'vpn-delete') return {title: alert, icon: 'ic_dialog_alert', message: N(ctx, 'vpn_confirm_profile_deletion'), buttons: [{action: 'gbnet-vpn-delete-ok', id: ui.gbNetTarget, title: ok}, {action: 'close-overlay', title: N(ctx, 'vpn_no_button')}]};
    if (kind === 'vpn-discard') return {title: alert, icon: 'ic_dialog_alert', message: N(ctx, ui.gbVpnDraft?.isNew ? 'vpn_confirm_add_profile_cancellation' : 'vpn_confirm_edit_profile_cancellation'), buttons: [{action: 'gbnet-vpn-discard-ok', title: N(ctx, 'vpn_yes_button')}, {action: 'close-overlay', title: N(ctx, 'vpn_mistake_button')}]};
    if (kind === 'apn-error') return {title: N(ctx, 'error_title'), message: ui.gbNetError, buttons: [{action: 'close-overlay', title: ok}]};
    if (kind === 'progress') return {custom: `<div class="gbdlg-progress"><img src="assets/gb-spinner_white_48.png" alt=""><span>${e(ui.gbNetProgress)}</span></div>`, cancel: 'noop'};
    if (kind === 'roaming') return {title: P(ctx, 'dialog_alert_title'), icon: 'ic_dialog_alert', message: P(ctx, 'roaming_warning'), buttons: [{action: 'gbnet-roaming-ok', title: P(ctx, 'yes')}, {action: 'close-overlay', title: P(ctx, 'no')}]};
    // SecuritySettings.CredentialStorage: the password dialog (first-time hint, current password once one exists) and the
    // unlock dialog; errors show in red above the fields.
    if (kind === 'cred-set') {
      const fresh = credState(data) === 'uninit';
      return {title: N(ctx, 'credentials_set_password'), cancel: 'gbnet-cred-cancel', custom: `<div class="gbnet-form gbnet-cred">${fresh ? `<p class="gbnet-note">${e(N(ctx, 'credentials_first_time_hint'))}</p>` : ''}${errorLine(ctx)}${fresh ? '' : `<label class="gbnet-label">${e(N(ctx, 'credentials_old_password'))}</label>${input('type="password" data-gbnet-cred="old"')}`}<label class="gbnet-label">${e(N(ctx, 'credentials_new_password'))}</label>${input('type="password" data-gbnet-cred="new"')}<label class="gbnet-label">${e(N(ctx, 'credentials_confirm_password'))}</label>${input('type="password" data-gbnet-cred="confirm"')}</div>`,
        buttons: [{action: 'gbnet-cred-set-ok', title: ok}, {action: 'gbnet-cred-cancel', title: cancel}]};
    }
    if (kind === 'cred-unlock') return {title: N(ctx, 'credentials_unlock'), cancel: 'gbnet-cred-cancel', custom: `<div class="gbnet-form gbnet-cred">${ui.gbCredNext ? `<p class="gbnet-note">${e(N(ctx, 'credentials_unlock_hint'))}</p>` : ''}${errorLine(ctx)}${input('type="password" data-gbnet-cred="old"')}</div>`, buttons: [{action: 'gbnet-cred-unlock-ok', title: ok}, {action: 'gbnet-cred-cancel', title: cancel}]};
    if (kind === 'cred-reset') return {title: alert, icon: 'ic_dialog_alert', message: N(ctx, 'credentials_reset_hint'), buttons: [{action: 'gbnet-cred-reset-ok', title: ok}, {action: 'close-overlay', title: cancel}]};
    return null;
  }

  // Live inputs: the hotspot dialog re-validates Save and shows / hides the password; others keep their text in the draft.
  function wire(root, ctx) {
    const {ui} = ctx;
    root.querySelectorAll('[data-gbnet-ap]').forEach(field => field.addEventListener(field.type === 'checkbox' ? 'change' : 'input', () => {
      const d = ui.gbApDraft, key = field.dataset.gbnetAp;
      if (key === 'show') { d.show = field.checked; const pw = root.querySelector('[data-gbnet-ap="password"]'); if (pw) pw.type = d.show ? 'text' : 'password'; return; }
      d[key] = field.value;
      const save = root.querySelector('[data-action="gbnet-ap-save"]'); if (save) save.disabled = !(d.ssid.length > 0 && (d.security !== 1 || d.password.length >= 8));
    }));
    root.querySelector('[data-gbnet-edit], [data-gbnet-cred], [data-gbnet-vpn="username"], [data-gbnet-ap="ssid"]')?.focus({preventScroll: true});
  }

  // ---- Actions -----------------------------------------------------------------------------------------------------
  const open = (ctx, kind) => { ctx.ui.gbNetDialog = kind; ctx.ui.overlay = 'gb-dialog-net'; ctx.renderOverlay(); };
  const close = ctx => { ctx.ui.overlay = ''; ctx.renderOverlay(); };
  const error = (ctx, message, next = '') => { ctx.ui.gbNetError = message; ctx.ui.gbNetErrorNext = next; open(ctx, 'error'); };
  const progress = (ctx, message) => { ctx.ui.gbNetProgress = message; open(ctx, 'progress'); };
  const field = (ctx, selector) => ctx.overlayRoot.querySelector(selector)?.value ?? '';

  function setHotspot(ctx, on) {
    const {data, ui} = ctx, s = data.settings;
    // WifiApEnabler: Wi-Fi goes off while the hotspot runs (WIFI_SAVED_STATE) and comes back after it.
    ui.gbApTurning = on ? 'on' : 'off'; ctx.render();
    setTimeout(() => {
      ui.gbApTurning = '';
      if (on) { if (s.wifi) { s.gbWifiSaved = true; s.wifi = false; } s.portableHotspot = true; }
      else { s.portableHotspot = false; if (s.gbWifiSaved) { s.wifi = true; s.gbWifiSaved = false; } }
      ctx.save(); ctx.render(); ctx.renderStatus();
    }, 900);
  }

  function startVpnEditor(ctx, p, isNew) {
    ctx.ui.gbVpnDraft = {...p, secretSet: !!p.secretSet, pskSet: !!p.pskSet, isNew};
    ctx.ui.gbVpnDraft.orig = vpnFields(ctx.ui.gbVpnDraft);
    if (ctx.ui.sub !== 'vpn-edit') ctx.go('vpn-edit'); else ctx.render();
  }
  function vpnValidate(ctx, d) {
    const miss = key => fmt(N(ctx, 'vpn_error_miss_entering'), N(ctx, key)), select = key => fmt(N(ctx, 'vpn_error_miss_selecting'), N(ctx, key));
    if (!d.name.trim()) return miss('vpn_a_name');
    if (!d.server.trim()) return miss('vpn_a_vpn_server');
    if (d.type !== 'PPTP' && d.secretEnabled && !d.secretSet && !d.secretNew) return miss('vpn_a_l2tp_secret');
    if (d.type === 'L2TP_IPSEC_PSK' && !d.pskSet && !d.pskNew) return miss('vpn_a_ipsec_presharedkey');
    if (d.type === 'L2TP_IPSEC' && !d.userCert) return select('vpn_a_user_certificate');
    if (d.type === 'L2TP_IPSEC' && !d.caCert) return select('vpn_a_ca_certificate');
    return '';
  }
  // VpnEditor.validateAndSetResult, then VpnSettings.onActivityResult: duplicate names, the keystore for new secrets, the toast.
  function vpnSave(ctx) {
    const {ui, data} = ctx, d = ui.gbVpnDraft;
    const message = vpnValidate(ctx, d);
    if (message) { error(ctx, message); return; }
    if (vpnFields(d) === d.orig) { ui.gbVpnDraft = null; ctx.pop(); return; }
    const name = d.name.trim();
    if ((data.gbVpns || []).some(p => p.name === name && p.id !== d.id)) { error(ctx, fmt(N(ctx, 'vpn_error_duplicate_name'), name), 'gbnet-error-back'); return; }
    const needsKeyStore = d.type === 'L2TP_IPSEC_PSK' && d.pskNew || d.type !== 'PPTP' && d.secretEnabled && d.secretNew;
    if (needsKeyStore && credState(data) !== 'unlocked') { credentials(ctx, {kind: 'vpn-save'}); return; }
    const {orig, isNew, secretNew, pskNew, ...rest} = d, profile = {...rest, name, secretSet: d.secretSet || !!secretNew, pskSet: d.pskSet || !!pskNew};
    data.gbVpns = isNew ? [...(data.gbVpns || []), profile] : (data.gbVpns || []).map(p => p.id === d.id ? {...p, ...profile} : p);
    ui.gbVpnDraft = null; ctx.save(); ctx.pop();
    ctx.toast(fmt(N(ctx, isNew ? 'vpn_profile_added' : 'vpn_profile_replaced'), name));
  }
  function vpnConnect(ctx, id) {
    const {ui, data} = ctx, p = (data.gbVpns || []).find(x => x.id === id);
    if (!p || ui.gbVpnActive) return;
    if (needKeyStoreToConnect(p) && credState(data) !== 'unlocked') { credentials(ctx, {kind: 'vpn-connect', id}); return; }
    ui.gbVpnActive = {id, state: 'connecting'}; ui.gbVpnUser = undefined; ui.gbVpnSave = undefined;
    ctx.render(); open(ctx, 'vpn-connect');
  }
  function vpnDisconnect(ctx, id) {
    const {ui} = ctx;
    if (ui.gbVpnActive?.id !== id) return;
    ui.gbVpnActive = {id, state: 'disconnecting'}; ctx.render(); ctx.renderStatus();
    setTimeout(() => { if (ui.gbVpnActive?.id === id) { ui.gbVpnActive = null; ctx.render(); ctx.renderStatus(); } }, 800);
  }
  // Credentials.unlock from another screen: set a password first or unlock, then carry on.
  function credentials(ctx, next) {
    const {ui} = ctx; ui.gbCredNext = next; ui.gbNetError = '';
    open(ctx, credState(ctx.data) === 'uninit' ? 'cred-set' : 'cred-unlock');
  }
  function credResume(ctx) {
    const next = ctx.ui.gbCredNext; ctx.ui.gbCredNext = null; close(ctx);
    if (next?.kind === 'vpn-save') vpnSave(ctx);
    if (next?.kind === 'vpn-connect') vpnConnect(ctx, next.id);
  }
  // KeyStore: four tries, then the storage is reset.
  function credWrong(ctx) {
    const s = ctx.data.settings, left = (s.gbCredRetry ?? MAX_RETRY) - 1;
    if (left <= 0) { credReset(ctx); ctx.ui.gbCredNext = null; close(ctx); return; }
    s.gbCredRetry = left; ctx.save();
    ctx.ui.gbNetError = left > 3 ? N(ctx, 'credentials_wrong_password') : left === 1 ? N(ctx, 'credentials_reset_warning') : fmt(N(ctx, 'credentials_reset_warning_plural'), left);
    ctx.renderOverlay();
  }
  function credReset(ctx) {
    const s = ctx.data.settings; delete s.gbCredHash; delete s.gbCredLocked; delete s.gbCredRetry; ctx.save(); ctx.render();
    ctx.toast(N(ctx, 'credentials_erased'));
  }
  function credUnlocked(ctx, was) {
    const s = ctx.data.settings; s.gbCredLocked = false; s.gbCredRetry = MAX_RETRY; ctx.save(); ctx.render();
    if (was !== 'unlocked') ctx.toast(N(ctx, 'credentials_enabled'));
  }

  function apnValidate(ctx, a) {
    if (!(a.name || '').length) return N(ctx, 'error_name_empty');
    if (!(a.apn || '').length) return N(ctx, 'error_apn_empty');
    if ((a.mcc || '').length !== 3) return N(ctx, 'error_mcc_not3');
    if (![2, 3].includes((a.mnc || '').length)) return N(ctx, 'error_mnc_not23');
    return '';
  }
  function apnSave(ctx) {
    const {ui, data} = ctx, a = ui.gbApnDraft, message = apnValidate(ctx, a);
    if (message) { ui.gbNetError = message; open(ctx, 'apn-error'); return false; }
    const {isNew, orig, ...row} = a;
    if (isNew || apnFields(a) !== orig) data.gbApns = isNew ? [...apns(data), row] : apns(data).map(x => x.id === a.id ? row : x);
    ui.gbApnDraft = null; ctx.save(); ctx.pop(); return true;
  }

  function handle(action, id, ctx, button) {
    const {ui, data} = ctx, s = data.settings;
    switch (action) {
      case 'gbnet-go': ctx.go(id); return true;
      case 'gbnet-dialog':
        if (id === 'ap') { const c = hotspot(data); ui.gbApDraft = {ssid: c?.ssid ?? SSID_DEFAULT, security: c?.security ?? 0, password: c?.password ?? '', show: false}; }
        open(ctx, id); return true;
      case 'gbnet-hotspot': if (!s.airplane && !ui.gbApTurning) setHotspot(ctx, !s.portableHotspot); return true;
      case 'gbnet-ap-security': open(ctx, 'ap-security'); return true;
      case 'gbnet-ap-security-pick': ui.gbApDraft.security = Number(id); open(ctx, 'ap'); return true;
      case 'gbnet-ap-security-back': open(ctx, 'ap'); return true;
      case 'gbnet-ap-cancel': ui.gbApDraft = null; close(ctx); return true;
      case 'gbnet-ap-save': {
        const d = ui.gbApDraft;
        if (!d.ssid || d.security === 1 && d.password.length < 8) return true;
        data.gbHotspot = {ssid: d.ssid, security: d.security, password: d.security === 1 ? d.password : ''};
        ui.gbApDraft = null; ctx.save(); close(ctx); ctx.render(); return true;
      }
      case 'gbnet-link': close(ctx); ctx.openBrowser(id); return true;
      case 'gbnet-notification': ctx.openSettings(id === 'vpn' ? 'vpn' : 'tether'); return true;

      // VPN settings.
      case 'gbnet-vpn-new': {
        // VpnTypeSelection returns to VpnSettings, which opens the editor on a blank profile of that type.
        const p = {id: `v${Date.now().toString(36)}`, type: id, name: '', server: '', domains: '', encryption: true, secretEnabled: false, userCert: '', caCert: ''};
        ctx.pop(); startVpnEditor(ctx, p, true); return true;
      }
      case 'gbnet-vpn-tap': {
        const state = vpnState(ctx, id);
        if (state === 'idle') vpnConnect(ctx, id); else if (state === 'connected' || state === 'disconnecting') vpnDisconnect(ctx, id);
        return true;
      }
      case 'gbnet-vpn-connect': close(ctx); vpnConnect(ctx, id); return true;
      case 'gbnet-vpn-disconnect': close(ctx); vpnDisconnect(ctx, id); return true;
      case 'gbnet-vpn-edit': { close(ctx); const p = (data.gbVpns || []).find(x => x.id === id); if (p) startVpnEditor(ctx, p, false); return true; }
      case 'gbnet-vpn-delete': ui.gbNetTarget = id; open(ctx, 'vpn-delete'); return true;
      case 'gbnet-vpn-delete-ok': data.gbVpns = (data.gbVpns || []).filter(p => p.id !== id); ctx.save(); close(ctx); ctx.render(); return true;
      case 'gbnet-vpn-connect-cancel': ui.gbVpnActive = null; close(ctx); ctx.render(); return true;
      case 'gbnet-vpn-connect-ok': {
        // AuthenticationActor.validateInputs, then connect; the simulator's servers always answer.
        const username = field(ctx, '[data-gbnet-vpn="username"]'), password = field(ctx, '[data-gbnet-vpn="password"]'), remember = !!ctx.overlayRoot.querySelector('[data-gbnet-vpn="save"]')?.checked;
        ui.gbVpnUser = username; ui.gbVpnSave = remember;
        const missing = !username ? 'vpn_a_username' : !password ? 'vpn_a_password' : '';
        if (missing) { error(ctx, fmt(N(ctx, 'vpn_error_miss_entering'), N(ctx, missing)), 'gbnet-connect-back'); return true; }
        const active = ui.gbVpnActive; if (!active) { close(ctx); return true; }
        data.gbVpns = (data.gbVpns || []).map(p => p.id === active.id ? {...p, username: remember ? username : ''} : p);
        ctx.save(); close(ctx); ctx.render();
        setTimeout(() => { if (ui.gbVpnActive?.id === active.id && ui.gbVpnActive.state === 'connecting') { ui.gbVpnActive = {id: active.id, state: 'connected', since: Date.now()}; ctx.render(); ctx.renderStatus(); } }, 1800);
        return true;
      }
      case 'gbnet-connect-back': open(ctx, 'vpn-connect'); return true;
      case 'gbnet-error-back': close(ctx); return true;
      case 'gbnet-vpn-check': { const d = ui.gbVpnDraft; d[id] = !d[id]; ctx.render(); return true; }
      case 'gbnet-vpn-save': close(ctx); vpnSave(ctx); return true;
      case 'gbnet-vpn-cancel': close(ctx); if (vpnFields(ui.gbVpnDraft) !== ui.gbVpnDraft.orig) open(ctx, 'vpn-discard'); else { ui.gbVpnDraft = null; ctx.pop(); } return true;
      case 'gbnet-vpn-discard-ok': close(ctx); ui.gbVpnDraft = null; ctx.pop(); return true;

      // EditTextPreference / ListPreference dialogs of both editors.
      case 'gbnet-edit': open(ctx, `edit:${id}`); return true;
      case 'gbnet-list': open(ctx, `list:${id}`); return true;
      case 'gbnet-edit-ok': {
        const value = field(ctx, '[data-gbnet-edit]');
        if (ui.sub === 'apn-edit') ui.gbApnDraft[id] = value;
        else if (id === 'secret' || id === 'psk') { if (value) ui.gbVpnDraft[`${id}New`] = true; }
        else ui.gbVpnDraft[id] = id === 'name' ? value.trim() : value;
        close(ctx); ctx.render(); return true;
      }
      case 'gbnet-list-pick': {
        const [key, index] = id.split(':');
        if (key === 'authtype') ui.gbApnDraft.authtype = Number(index); else ui.gbApnDraft.protocol = ['IP', 'IPV6', 'IPV4V6'][Number(index)];
        close(ctx); ctx.render(); return true;
      }

      // APNs.
      case 'gbnet-apn-select': data.gbApnSelected = id; ctx.save(); ctx.render(); return true;
      case 'gbnet-apn-edit': case 'gbnet-apn-new': {
        const base = action === 'gbnet-apn-new' ? {id: String(Math.max(0, ...apns(data).map(a => Number(a.id) || 0)) + 1), name: '', apn: '', mcc: '216', mnc: '30', type: '', protocol: 'IP', authtype: -1, isNew: true} : apns(data).find(a => a.id === id);
        if (!base) return true;
        close(ctx); ui.gbApnDraft = {authtype: -1, protocol: 'IP', ...base}; ui.gbApnDraft.orig = apnFields(ui.gbApnDraft); ctx.go('apn-edit'); return true;
      }
      case 'gbnet-apn-save': close(ctx); apnSave(ctx); return true;
      case 'gbnet-apn-discard': close(ctx); ui.gbApnDraft = null; ctx.pop(); return true;
      case 'gbnet-apn-delete': { close(ctx); const target = ui.gbApnDraft.id; data.gbApns = apns(data).filter(a => a.id !== target); if (selectedApn(data) === target) data.gbApnSelected = null; ui.gbApnDraft = null; ctx.save(); ctx.pop(); return true; }
      case 'gbnet-apn-restore':
        progress(ctx, N(ctx, 'restore_default_apn'));
        setTimeout(() => { delete data.gbApns; delete data.gbApnSelected; ctx.save(); close(ctx); ctx.render(); ctx.toast(N(ctx, 'restore_default_apn_completed')); }, 1200);
        return true;

      // NetworkSetting: the scan, a manual choice, automatic selection; success closes the screen after 3 s.
      case 'gbnet-op-search':
        ui.gbNetBusy = true; progress(ctx, P(ctx, 'load_networks_progress'));
        setTimeout(() => { ui.gbNetBusy = false; ui.gbNetFound = s.airplane ? [] : NETWORKS; close(ctx); ctx.render(); }, 2500);
        return true;
      case 'gbnet-op-pick': case 'gbnet-op-auto': {
        const network = NETWORKS.find(([name]) => name === id), auto = action === 'gbnet-op-auto';
        ui.gbNetBusy = true; progress(ctx, auto ? P(ctx, 'register_automatically') : fmt(P(ctx, 'register_on_network'), id));
        setTimeout(() => {
          ui.gbNetBusy = false; close(ctx);
          if (!auto && !network?.[1]) { ctx.render(); ctx.toast(P(ctx, 'not_allowed')); return; }
          s.networkAuto = auto; ctx.save(); ctx.render(); ctx.toast(P(ctx, 'registration_done'));
          setTimeout(() => { if (ui.view === 'settings' && ui.sub === 'operators') ctx.pop(); }, 3000);
        }, 2000);
        return true;
      }
      case 'gbnet-data': s.dataEnabled = !(s.dataEnabled ?? true); ctx.save(); ctx.render(); ctx.renderStatus(); return true;
      case 'gbnet-roaming': if (s.dataRoaming) { s.dataRoaming = false; ctx.save(); ctx.render(); } else open(ctx, 'roaming'); return true;
      case 'gbnet-roaming-ok': s.dataRoaming = true; ctx.save(); close(ctx); ctx.render(); return true;

      // Credential storage (Security settings and the VPN's unlock requests).
      case 'gbnet-cred-access': {
        const state = credState(data);
        if (state === 'uninit') return true;
        if (state === 'unlocked') { s.gbCredLocked = true; ctx.save(); ctx.render(); ctx.toast(N(ctx, 'credentials_disabled')); }
        else { ui.gbCredNext = null; ui.gbNetError = ''; open(ctx, 'cred-unlock'); }
        return true;
      }
      case 'gbnet-cred-password': ui.gbCredNext = null; ui.gbNetError = ''; open(ctx, 'cred-set'); return true;
      case 'gbnet-cred-reset': if (credState(data) !== 'uninit') open(ctx, 'cred-reset'); return true;
      case 'gbnet-cred-reset-ok': close(ctx); credReset(ctx); return true;
      case 'gbnet-cred-cancel': ui.gbCredNext = null; ui.gbNetError = ''; close(ctx); return true;
      case 'gbnet-cred-set-ok': {
        const state = credState(data), old = state === 'uninit' ? null : field(ctx, '[data-gbnet-cred="old"]'), next = field(ctx, '[data-gbnet-cred="new"]'), confirm = field(ctx, '[data-gbnet-cred="confirm"]');
        const fail = message => { ui.gbNetError = message; ctx.renderOverlay(); return true; };
        if (old !== null && !old.length) return fail(N(ctx, 'credentials_password_empty'));
        if (!next.length || !confirm.length) return fail(N(ctx, 'credentials_passwords_empty'));
        if (next.length < 8) return fail(N(ctx, 'credentials_password_too_short'));
        if (next !== confirm) return fail(N(ctx, 'credentials_passwords_mismatch'));
        if (old !== null && digest(old) !== s.gbCredHash) { credWrong(ctx); return true; }
        s.gbCredHash = digest(next); ui.gbNetError = '';
        credUnlocked(ctx, state); credResume(ctx); return true;
      }
      case 'gbnet-cred-unlock-ok': {
        const state = credState(data), old = field(ctx, '[data-gbnet-cred="old"]');
        if (!old.length) { ui.gbNetError = N(ctx, 'credentials_password_empty'); ctx.renderOverlay(); return true; }
        if (digest(old) !== s.gbCredHash) { credWrong(ctx); return true; }
        ui.gbNetError = ''; credUnlocked(ctx, state); credResume(ctx); return true;
      }
    }
    return false;
  }

  // Back: VpnEditor and ApnEditor save on Back (showing their errors instead when a field is missing).
  function back(ctx) {
    if (ctx.ui.sub === 'vpn-edit' && ctx.ui.gbVpnDraft) { vpnSave(ctx); return true; }
    if (ctx.ui.sub === 'apn-edit' && ctx.ui.gbApnDraft) { apnSave(ctx); return true; }
    if (ctx.ui.sub === 'operators' && ctx.ui.gbNetBusy) return true;
    return false;
  }
  // Long press on a VPN: its context menu (VpnSettings.onCreateContextMenu).
  function hold(target, ctx) { if (target.startsWith('vpn:')) open(ctx, `vpn-context:${target.slice(4)}`); }

  // The status bar's notification icons and the shade's ongoing rows: Tethering's notification and VpnServices'.
  function ongoing(ctx) {
    const {ui, data} = ctx, rows = [];
    if (data.settings.portableHotspot) rows.push({id: 'tether', action: 'gbnet-notification', icon: 'gb-stat_sys_tether_wifi.png', title: N(ctx, 'tethered_notification_title'), text: N(ctx, 'tethered_notification_message')});
    const active = ui.gbVpnActive, p = active?.state === 'connected' && (data.gbVpns || []).find(x => x.id === active.id);
    if (p) {
      const seconds = Math.max(0, Math.floor((Date.now() - active.since) / 1000)), hours = Math.floor(seconds / 3600);
      rows.push({id: 'vpn', action: 'gbnet-notification', icon: 'gb-vpn_connected.png', title: fmt(N(ctx, 'vpn_notification_title_connected'), p.name), text: `${hours ? `${hours}:` : ''}${String(Math.floor(seconds % 3600 / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`});
    }
    return rows;
  }
  const statusIcons = ctx => ongoing(ctx).map(row => row.icon);
  const hotspotText = (data, ui, lang) => hotspotSummary({data, ui, lang});
  // Airplane mode drops the VPN connection along with the radios.
  function airplane(ctx) { ctx.ui.gbVpnActive = null; ctx.ui.gbApTurning = ''; }
  // Security settings' credential rows (createPreferences / updatePreferences).
  function credentialRows(ctx) {
    const state = credState(ctx.data);
    return {state, access: state === 'unlocked'};
  }

  window.GBNetwork = {hotspotText, has, render, menu, dialog, wire, handle, back, hold, ongoing, statusIcons, airplane, credentialRows, credState, text: (lang, key) => lookup('network', lang, key), phoneText: (lang, key) => lookup('phonenet', lang, key), APNS, NETWORKS};
})();
