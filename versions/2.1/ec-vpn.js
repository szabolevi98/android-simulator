/* Android 2.1 Settings › Wireless & networks › VPN settings (Settings.odex com.android.settings.vpn, VpnServices.odex).
   - VpnSettings (vpn_settings.xml): Add VPN, then the "VPNs" category with a VpnPreference per profile (its name over
     getProfileSummaryString: "Connect to network", "Connecting...", "Disconnecting...", "Connected"). The list is read
     sorted by name when the screen opens; new profiles go at the end. While one profile is busy (mActiveProfile) the
     rows of profiles connecting, disconnecting or idle are off. The activities have no label of their own: the window
     shows the app's "Settings".
   - Holding a profile: its name over Connect to network (idle and nothing active), Disconnect from network (connected),
     Edit network and Delete network (idle, disconnecting or cancelled); Delete asks "Are you sure you want to delete
     this VPN?" (Attention, OK / No).
   - VpnTypeSelection: VpnManager.getSupportedVpnTypes = VpnType.values(): PPTP, L2TP, L2TP/IPSec PSK, L2TP/IPSec CRT,
     each "Add <type> VPN" over its framework description.
   - VpnEditor: "Add <type> VPN" for a profile without a name, else "<type> details". VpnProfileEditor.loadPreferencesTo:
     VPN name, Set VPN server, the type's own rows, DNS search domains (optional); summaries are the value, or "%s not
     set" / "%s not set (optional)". PptpEditor: Enable encryption (on by default; "PPTP encryption is enabled").
     L2tpEditor: Enable L2TP secret (off by default) and Set L2TP secret (only while it is on). L2tpIpsecPskEditor: Set
     IPSec pre-shared key first, then L2TP's. L2tpIpsecEditor: L2TP's, then Set user certificate and Set CA certificate,
     ListPreferences of the keystore's USRCERT_ / CACERT_ keys (none here: nothing can be installed). SecretHandler:
     a password field hinted "(unchanged)" or "(not set)", summary "%s is set" / "%s not set".
     Back and Save validate (name, server, the secret, the key, the certificates: "You must enter %s." / "You must select
     %s." in an Attention dialog) and hand a changed profile back; Cancel / Revert ask first when something changed.
   - onActivityResult: a name another profile has ("The VPN name '%s' already exists…", Back reopens the editor); a new
     secret needs the keystore unlocked (Credentials.unlock); then "'%s' is added" / "Changes are made to '%s'".
   - Connecting (connect): PSK and CRT profiles, and L2TP with its secret on, need the keystore unlocked; checkSecrets
     wants every secret still in the keystore (else "One or more secrets are missing…", Yes opens the editor). Then the
     profile is Connecting and AuthenticationActor asks for the user name and password ("Connect to %s":
     vpn_connect_dialog_view.xml, 90 sp labels, Remember username; an empty field: "You must enter a username.", Back).
   - VpnService.onConnect: getIp resolves the server first; this phone resolves no name, so a name fails at once with
     VPN_ERROR_UNKNOWN_SERVER ("Server name cannot be resolved…", Yes opens the editor). An address is tried until
     waitUntilConnectedOrTimedout gives up (2 s, then 80 × 500 ms): VPN_ERROR_CONNECTION_FAILED, "Unable to connect to
     the network. Do you want to try again?" (Yes connects again). No VPN server answers here, so nothing gets connected. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const V = () => EC.text('vpn');
  const t = k => V().t(k);
  const f = (c, k, ...args) => V().fmt(k, c.lang, ...args);
  const F = () => EC.text('framework');
  const stack = c => c.ui.settingsStack;
  const top = c => stack(c)?.at(-1);
  const TYPES = [
    {id: 'PPTP', name: 'PPTP', desc: 'pptp_vpn_description'},
    {id: 'L2TP', name: 'L2TP', desc: 'l2tp_vpn_description'},
    {id: 'L2TP_IPSEC_PSK', name: 'L2TP/IPSec PSK', desc: 'l2tp_ipsec_psk_vpn_description'},
    {id: 'L2TP_IPSEC', name: 'L2TP/IPSec CRT', desc: 'l2tp_ipsec_crt_vpn_description'}
  ];
  const typeName = id => TYPES.find(x => x.id === id)?.name || id;
  const l2tp = p => p.type !== 'PPTP';
  const data = c => c.data.vpn ||= {profiles: []};
  const profiles = c => data(c).profiles;
  const byId = (c, id) => profiles(c).find(p => p.id === id);
  // The connection: the busy profile (mActiveProfile), its state and the pending timer.
  let active = null, timer = 0;
  const stateOf = p => active?.id === p.id ? active.state : 'IDLE';

  // ---- VpnSettings ----
  const row = ({key, title, summary, check, disabled, action = 'ecvp-row'}) => `<button type="button" class="ecpf-row" data-action="${action}" data-key="${esc(key)}"${disabled ? ' disabled' : ''}><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span class="ecpf-text"><span class="ecpf-title">${esc(title)}</span>${summary ? `<span class="ecpf-summary">${esc(summary)}</span>` : ''}</span>${check === undefined ? '' : `<img class="ecpf-check" src="assets/fw-btn_check_${check ? 'on' : 'off'}.png" alt="">`}</button><i class="ecpf-divider"></i>`;
  const category = title => `<div class="ecpf-cat npp-fw-dark_header_dither"><i class="ec-bg np-fw-dark_header_dither"></i><span>${esc(title)}</span></div>`;
  const summaryOf = p => t({CONNECTING: 'vpn_connecting', DISCONNECTING: 'vpn_disconnecting', CONNECTED: 'vpn_connected'}[stateOf(p)] || 'vpn_connect_hint');
  const appLabel = () => EC.text('settings').t('settings_label');
  function order(c) {
    if (!c.ui.vpnOrder) c.ui.vpnOrder = [...profiles(c)].sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0).map(p => p.id);
    return c.ui.vpnOrder.map(id => byId(c, id)).filter(Boolean);
  }
  function renderList(c) {
    const rows = order(c).map(p => row({key: p.id, action: 'ecvp-profile', title: p.name, summary: summaryOf(p), disabled: active && stateOf(p) !== 'CONNECTED'})).join('');
    return c.window(appLabel(), `<div class="ecpf-list">${row({key: 'add_new_vpn', title: t('vpn_type_title')})}${category(t('vpns'))}${rows}</div>`);
  }
  function renderTypes(c) {
    return c.window(appLabel(), `<div class="ecpf-list">${TYPES.map(x => row({key: x.id, action: 'ecvp-type', title: f(c, 'vpn_edit_title_add', x.name), summary: t(x.desc)})).join('')}</div>`);
  }

  // A profile's context menu (onCreateContextMenu / onContextItemSelected).
  function contextMenu(c, p) {
    const state = stateOf(p), idle = state === 'IDLE', free = idle || state === 'DISCONNECTING' || state === 'CANCELLED';
    c.dialog({title: p.name, icon: null, items: [
      {label: t('vpn_menu_connect'), disabled: !(idle && !active)}, {label: t('vpn_menu_disconnect'), disabled: state !== 'CONNECTED'},
      {label: t('vpn_menu_edit'), disabled: !free}, {label: t('vpn_menu_delete'), disabled: !free}],
    onItem: i => [() => connect(c, p), null, () => openEditor(c, p), () => remove(c, p)][i]?.()});
  }
  function remove(c, p) {
    c.dialog({title: F().t('dialog_alert_title'), icon: 'fw-ic_dialog_alert.png', message: t('vpn_confirm_profile_deletion'),
      buttons: [{label: F().t('ok'), action: () => {
        data(c).profiles = profiles(c).filter(x => x.id !== p.id);
        // removeProfileFromStorage: the profile's directory and its keystore secrets.
        EC.keystore.remove(c, `VPN_l${p.id}`); EC.keystore.remove(c, `VPN_i${p.id}`);
        c.save(); c.render();
      }}, {label: t('vpn_no_button')}]});
  }
  const alert = (c, message, back) => c.dialog({title: F().t('dialog_alert_title'), icon: 'fw-ic_dialog_alert.png', message,
    buttons: [back ? {label: t('vpn_back_button'), action: () => setTimeout(back, 0)} : {label: F().t('ok')}]});

  // ---- Connecting ----
  const onIdle = c => { active = null; clearTimeout(timer); if (top(c) === 'vpn_settings') c.render(); };
  function changeState(c, p, state, error) {
    active = state === 'IDLE' ? active : {id: p.id, state};
    if (state === 'IDLE') {
      // ConnectivityReceiver: an error code shows its dialog (while the screen is open), else onIdle.
      if (!error || top(c) !== 'vpn_settings' || c.ui.view !== 'settings') { onIdle(c); return; }
      active = {id: p.id, state: 'IDLE'};
      c.render();
      const yesNo = (message, yes) => c.dialog({title: F().t('dialog_alert_title'), icon: 'fw-ic_dialog_alert.png', message,
        buttons: [{label: t('vpn_yes_button'), action: () => setTimeout(yes, 0)}, {label: t('vpn_no_button'), action: () => onIdle(c)}], onCancel: () => onIdle(c)});
      if (error === 'unknown-server') yesNo(t('vpn_unknown_server_dialog_msg'), () => { onIdle(c); openEditor(c, p); });
      else yesNo(t('vpn_confirm_reconnect'), () => { active = null; connect(c, p); });
      return;
    }
    if (top(c) === 'vpn_settings') c.render();
  }
  const needKeyStoreToConnect = p => p.type === 'L2TP_IPSEC' || p.type === 'L2TP_IPSEC_PSK' || p.type === 'L2TP' && p.secretEnabled;
  function checkSecrets(c, p) {
    let missing = false;
    if (p.type === 'L2TP_IPSEC_PSK' && !(p.psk && EC.keystore.contains(c, `VPN_i${p.id}`))) { p.psk = false; missing = true; }
    if (l2tp(p) && p.secretEnabled && !(p.secret && EC.keystore.contains(c, `VPN_l${p.id}`))) { p.secret = false; missing = true; }
    if (!missing) return true;
    c.save();
    active = {id: p.id, state: 'IDLE'};
    c.dialog({title: F().t('dialog_alert_title'), icon: 'fw-ic_dialog_alert.png', message: t('vpn_secret_not_set_dialog_msg'),
      buttons: [{label: t('vpn_yes_button'), action: () => setTimeout(() => { active = null; openEditor(c, p); }, 0)}, {label: t('vpn_no_button'), action: () => onIdle(c)}],
      onCancel: () => onIdle(c)});
    return false;
  }
  function connect(c, p) {
    if (needKeyStoreToConnect(p) && EC.keystore.test(c) !== EC.keystore.NO_ERROR) { EC.credentials.unlock(c, ok => { if (ok) connect(c, p); }); return; }
    if (!checkSecrets(c, p)) return;
    changeState(c, p, 'CONNECTING');
    connectDialog(c, p);
  }
  // AuthenticationActor.createConnectView / validateInputs / connect.
  function connectDialog(c, p, fields = {user: p.username || '', password: '', remember: !!p.username}) {
    const input = (name, value, type) => `<span class="ecwf-edit ecvp-edit npp-fw-textfield_default"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><input class="ecwf-input" type="${type}" name="${name}" value="${esc(value)}" autocomplete="off"></span>`;
    const html = `<div class="ecvp-connect"><div class="ecvp-line"><span class="ecvp-label">${esc(t('vpn_username_colon'))}</span>${input('user', fields.user, 'text')}</div>
      <div class="ecvp-line"><span class="ecvp-label">${esc(t('vpn_password_colon'))}</span>${input('password', fields.password, 'password')}</div>
      <div class="ecvp-remember">${c.checkbox('remember', fields.remember, t('vpn_save_username'))}</div></div>`;
    const read = root => ({user: root.querySelector('input[name="user"]').value, password: root.querySelector('input[name="password"]').value,
      remember: root.querySelector('[data-check="remember"]').getAttribute('aria-pressed') === 'true'});
    c.dialog({title: f(c, 'vpn_connect_to', p.name), icon: null, html,
      // The saved user name fills the field and puts the cursor in the password.
      mount: root => root.querySelector(`input[name="${fields.user ? 'password' : 'user'}"]`)?.focus(),
      action(name, el) {
        if (name !== 'ecui-check') return false;
        const on = el.getAttribute('aria-pressed') !== 'true';
        el.setAttribute('aria-pressed', on); el.querySelector('img').src = `assets/fw-btn_check_${on ? 'on' : 'off'}.png`;
        return true;
      },
      buttons: [{label: t('vpn_connect_button'), action: (c2, d, root) => {
        const v = read(root), missing = !v.user ? t('vpn_a_username') : !v.password ? t('vpn_a_password') : '';
        setTimeout(() => {
          if (missing) { alert(c, f(c, 'vpn_error_miss_entering', missing), () => connectDialog(c, p, v)); return; }
          p.username = v.remember ? v.user : ''; c.save();
          start(c, p);
        }, 0);
      }}, {label: F().t('cancel'), action: () => changeState(c, p, 'IDLE')}],
      onCancel: () => changeState(c, p, 'IDLE')});
  }
  // VpnService.onConnect: getIp, then the daemons until waitUntilConnectedOrTimedout gives up.
  function start(c, p) {
    clearTimeout(timer);
    const address = /^\d{1,3}(\.\d{1,3}){3}$/.test(p.server.trim());
    timer = setTimeout(() => changeState(c, p, 'IDLE', address ? 'connection-failed' : 'unknown-server'), address ? 2000 + 80 * 500 : 0);
  }

  // ---- VpnTypeSelection / VpnEditor ----
  function newProfile(type) {
    return {id: '', type, name: '', server: '', domains: '', ...(type === 'PPTP' ? {encryption: true} : {secretEnabled: false, secret: false}),
      ...(type === 'L2TP_IPSEC_PSK' ? {psk: false} : {}), ...(type === 'L2TP_IPSEC' ? {userCert: '', caCert: ''} : {}), username: ''};
  }
  function openEditor(c, p) {
    const profile = structuredClone(p);
    c.ui.vpnEdit = {profile, adding: !p.name, newSecret: '', newPsk: ''};
    c.ui.vpnEdit.original = snapshot(c.ui.vpnEdit);
    stack(c).push('vpn-edit'); c.render();
  }
  // profileChanged: the profile as it came in, with the secrets typed since.
  const snapshot = e => JSON.stringify([e.profile, e.newSecret, e.newPsk]);
  const changed = e => snapshot(e) !== e.original;
  // The editor's rows, in loadPreferencesTo's order.
  function editorRows(c, e) {
    const p = e.profile, notSet = (field, v, optional) => v || f(c, optional ? 'vpn_field_not_set_optional' : 'vpn_field_not_set', t(field));
    const secretSummary = (field, had, typed) => f(c, typed || had ? 'vpn_field_is_set' : 'vpn_field_not_set', t(field));
    const rows = [
      {key: 'vpn_name', title: t('vpn_name'), summary: notSet('vpn_name', p.name)},
      {key: 'server', title: t('vpn_vpn_server_title'), summary: notSet('vpn_vpn_server', p.server)}];
    if (p.type === 'PPTP') rows.push({key: 'encryption', title: f(c, 'vpn_enable_field', t('vpn_pptp_encryption_title')), check: p.encryption,
      summary: f(c, p.encryption ? 'vpn_is_enabled' : 'vpn_is_disabled', t('vpn_pptp_encryption'))});
    if (p.type === 'L2TP_IPSEC_PSK') rows.push({key: 'psk', title: t('vpn_ipsec_presharedkey_title'), summary: secretSummary('vpn_ipsec_presharedkey', p.psk, e.newPsk)});
    if (l2tp(p)) rows.push(
      {key: 'secret_enabled', title: f(c, 'vpn_enable_field', t('vpn_l2tp_secret')), check: p.secretEnabled, summary: f(c, p.secretEnabled ? 'vpn_is_enabled' : 'vpn_is_disabled', t('vpn_l2tp_secret'))},
      {key: 'secret', title: t('vpn_l2tp_secret_string_title'), summary: secretSummary('vpn_l2tp_secret', p.secret, e.newSecret), disabled: !p.secretEnabled});
    if (p.type === 'L2TP_IPSEC') rows.push(
      {key: 'user_cert', title: t('vpn_user_certificate_title'), summary: notSet('vpn_user_certificate', p.userCert)},
      {key: 'ca_cert', title: t('vpn_ca_certificate_title'), summary: notSet('vpn_ca_certificate', p.caCert)});
    rows.push({key: 'domains', title: t('vpn_dns_search_list_title'), summary: notSet('vpn_dns_search_list', p.domains, true)});
    return rows;
  }
  function renderEditor(c) {
    const e = c.ui.vpnEdit;
    return c.window(f(c, e.adding ? 'vpn_edit_title_add' : 'vpn_edit_title_edit', typeName(e.profile.type)), `<div class="ecpf-list">${editorRows(c, e).map(row).join('')}</div>`);
  }
  function editClick(c, key) {
    const e = c.ui.vpnEdit, p = e.profile, redraw = () => c.render();
    const text = (title, field, trim = true) => EC.editTextDialog(c, {title, value: p[field], onOk: v => { p[field] = trim ? v.trim() : v; redraw(); }});
    const secret = (title, had, set) => EC.editTextDialog(c, {title, password: true, hint: t(had ? 'vpn_secret_unchanged' : 'vpn_secret_not_set'), onOk: v => { set(v); redraw(); }});
    const certs = (title, field, prefix) => {
      // The keystore's saw(prefix): no certificate was ever installed, so the list is empty.
      const keys = Object.keys(c.data.keystore?.keys || {}).filter(k => k.startsWith(prefix)).map(k => k.slice(prefix.length));
      c.dialog({title, icon: null, items: keys, choice: 'single', checked: keys.indexOf(p[field]), closeOnChoice: true, buttons: [{label: F().t('cancel')}],
        onItem: i => { p[field] = keys[i]; redraw(); }});
    };
    ({
      vpn_name: () => text(t('vpn_name'), 'name'),
      server: () => text(t('vpn_vpn_server_title'), 'server'),
      domains: () => text(t('vpn_dns_search_list_title'), 'domains'),
      encryption: () => { p.encryption = !p.encryption; redraw(); },
      secret_enabled: () => { p.secretEnabled = !p.secretEnabled; redraw(); },
      secret: () => secret(t('vpn_l2tp_secret_string_title'), p.secret, v => { e.newSecret = v; }),
      psk: () => secret(t('vpn_ipsec_presharedkey_title'), p.psk, v => { e.newPsk = v; }),
      user_cert: () => certs(t('vpn_user_certificate_title'), 'userCert', 'USRCERT_'),
      ca_cert: () => certs(t('vpn_ca_certificate_title'), 'caCert', 'CACERT_')
    })[key]?.();
  }
  // VpnProfileEditor.validate and the type editors' overrides, in their order.
  function validate(c, e) {
    const p = e.profile, enter = field => f(c, 'vpn_error_miss_entering', t(field)), select = field => f(c, 'vpn_error_miss_selecting', t(field));
    if (!p.name) return enter('vpn_a_name');
    if (!p.server) return enter('vpn_a_vpn_server');
    if (l2tp(p) && p.secretEnabled && !p.secret && !e.newSecret) return enter('vpn_l2tp_secret');
    if (p.type === 'L2TP_IPSEC_PSK' && !p.psk && !e.newPsk) return enter('vpn_ipsec_presharedkey');
    if (p.type === 'L2TP_IPSEC' && !p.userCert) return select('vpn_a_user_certificate');
    if (p.type === 'L2TP_IPSEC' && !p.caCert) return select('vpn_a_ca_certificate');
    return '';
  }
  // validateAndSetResult, then VpnSettings.onActivityResult.
  function finishEditor(c) {
    const e = c.ui.vpnEdit, error = validate(c, e);
    if (error) { alert(c, error); return; }
    stack(c).pop(); c.ui.vpnEdit = null;
    if (changed(e)) result(c, e); else c.render();
  }
  function result(c, e) {
    const p = e.profile, index = profiles(c).findIndex(x => x.id && x.id === p.id);
    if (profiles(c).some(x => x.name === p.name && x.id !== p.id)) {
      c.render();
      alert(c, f(c, 'vpn_error_duplicate_name', p.name), () => { c.ui.vpnEdit = {...e, adding: false}; c.ui.vpnEdit.original = snapshot(c.ui.vpnEdit); stack(c).push('vpn-edit'); c.render(); });
      return;
    }
    // needKeyStoreToSave: a new pre-shared key, or a new L2TP secret while it is on.
    const needKeyStore = !!e.newPsk || l2tp(p) && p.secretEnabled && !!e.newSecret;
    if (needKeyStore && EC.keystore.test(c) !== EC.keystore.NO_ERROR) { c.render(); EC.credentials.unlock(c, ok => { if (ok) result(c, e); }); return; }
    if (!p.id) p.id = String(Date.now());
    // processSecrets
    if (e.newPsk) p.psk = EC.keystore.put(c, `VPN_i${p.id}`) || p.psk;
    if (l2tp(p) && p.secretEnabled) { if (e.newSecret) p.secret = EC.keystore.put(c, `VPN_l${p.id}`) || p.secret; }
    else if (l2tp(p)) { EC.keystore.remove(c, `VPN_l${p.id}`); }
    if (index < 0) { profiles(c).push(p); c.ui.vpnOrder?.push(p.id); } else profiles(c)[index] = p;
    c.save(); c.render();
    c.toast(f(c, index < 0 ? 'vpn_profile_added' : 'vpn_profile_replaced', p.name));
  }
  function editorMenu(c) {
    const e = c.ui.vpnEdit;
    const leave = () => { stack(c).pop(); c.ui.vpnEdit = null; c.render(); };
    c.menu([{label: t('vpn_menu_done'), icon: 'fw-ic_menu_save.png', action: () => finishEditor(c)},
      {label: t(e.adding ? 'vpn_menu_cancel' : 'vpn_menu_revert'), icon: 'fw-ic_menu_close_clear_cancel.png', action: () => {
        if (!changed(e)) { leave(); return; }
        c.dialog({title: F().t('dialog_alert_title'), icon: 'fw-ic_dialog_alert.png', message: t(e.adding ? 'vpn_confirm_add_profile_cancellation' : 'vpn_confirm_edit_profile_cancellation'),
          buttons: [{label: t('vpn_yes_button'), action: () => setTimeout(leave, 0)}, {label: t('vpn_mistake_button')}]});
      }}]);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const m = EC.module('settings'), base = {render: m.render, action: m.action, menu: m.menu, back: m.back, mount: m.mount};
    m.render = c => top(c) === 'vpn_settings' ? renderList(c) : top(c) === 'vpn-type' ? renderTypes(c) : top(c) === 'vpn-edit' && c.ui.vpnEdit ? renderEditor(c) : base.render(c);
    m.action = (name, el, event, c) => {
      if (name === 'ecvp-row' && top(c) === 'vpn_settings') { stack(c).push('vpn-type'); c.render(); return true; }
      if (name === 'ecvp-type') { stack(c).pop(); openEditor(c, newProfile(el.dataset.key)); return true; }
      if (name === 'ecvp-row') { editClick(c, el.dataset.key); return true; }
      if (name === 'ecvp-profile') {
        if (c.suppressClick > Date.now()) return true;
        // connectOrDisconnect: idle connects; connecting does nothing.
        const p = byId(c, el.dataset.key);
        if (p && stateOf(p) === 'IDLE' && !active) connect(c, p);
        return true;
      }
      return base.action(name, el, event, c);
    };
    // Holding a profile row opens its context menu.
    m.mount = (c, root) => {
      base.mount?.(c, root);
      if (top(c) !== 'vpn_settings') return;
      for (const el of root.querySelectorAll('[data-action="ecvp-profile"]:not(:disabled)')) {
        let hold = 0;
        el.addEventListener('pointerdown', () => { hold = setTimeout(() => { c.suppressClick = Date.now() + 400; const p = byId(c, el.dataset.key); if (p) contextMenu(c, p); }, 500); });
        for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) el.addEventListener(ev, () => clearTimeout(hold));
      }
    };
    m.menu = c => { if (top(c) === 'vpn-edit') { editorMenu(c); return true; } return base.menu(c); };
    m.back = c => {
      if (top(c) === 'vpn-edit') { finishEditor(c); return true; }
      if (top(c) === 'vpn_settings') c.ui.vpnOrder = null;
      return base.back(c);
    };
  });
})();
