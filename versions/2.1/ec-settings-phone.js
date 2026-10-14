/* Android 2.1 Settings › Call settings and Wireless › Mobile networks: Phone.apk's own screens (ec-prefs.py brings their
   xml into EC.settingsXml), with what its activities change after inflating them on the Nexus One.
   - CallFeaturesSetting (call_feature_setting.xml): Phone's bools tty_enabled, hac_enabled, dtmf_type_enabled and
     auto_retry_enabled are false and world_phone is false on a GSM phone, so TTY mode, Hearing aids, DTMF tones,
     Auto-retry and the CDMA call settings go; Voicemail service lists the providers: "My carrier" and Google Voice
     (googlevoice.apk's HidingVoicemailProviderActivity takes CONFIGURE_VOICEMAIL).
   - Additional GSM call settings and Call forwarding are TimeConsumingPreferenceActivity screens: "Reading settings…"
     and, with no answer from the network, "Call settings error" / "Network or SIM card error.", the rows left off.
   - Fixed Dialing Numbers: FDN activation and Change PIN2 ask for PIN2 ("PIN2 invalid!" — the simulated SIM has none
     to match); FDN list reads the SIM ("No contacts on your SIM card.").
   - Mobile networks (com.android.phone.Settings, network_setting.xml): not a world phone, so Preferred network mode and
     the CDMA screen go and gsm_umts_options.xml comes inline: Data roaming (it asks "Allow data roaming? …" before
     turning on), Access Point Names, Use only 2G networks, Network operators (carrier_select.xml: Search networks →
     "Searching…" → "Error while searching for networks."; Select automatically → "Automatic registration..." →
     "Registered on network."). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const X = () => EC.text('settingsx');
  const t = k => X().t(k);
  const F = () => EC.text('framework');
  const stack = c => c.ui.settingsStack;
  Object.assign(EC.settingsClass, {
    CallFeaturesSetting: 'call_feature_setting', FdnSetting: 'fdn_setting', GsmUmtsCallOptions: 'gsm_umts_call_options',
    NetworkSetting: 'carrier_select', 'com.android.phone.Settings': 'network_setting'
  });
  const GONE = {call_feature_setting: ['button_auto_retry_key', 'button_tty_mode_key', 'button_hac_key', 'button_dtmf_settings', 'button_cdma_more_expand_key'],
    network_setting: ['preferred_network_mode_key', 'gsm_umts_options_key', 'cdma_options_key']};
  EC.settingsPrune.push((name, n) => !(GONE[name] || []).includes(n.key));
  // gsm_umts_options.xml comes inline after Data roaming; the 2G box is a CheckBoxPreference of its own kind.
  EC.settingsExtra.network_setting = (c, kids) => [...kids, ...(EC.settingsXml.gsm_umts_options.c || [])];
  EC.settingsExtra.call_feature_setting = (c, kids) => kids.map(n => n.key !== 'button_voicemail_category_key' ? n : {...n, c: n.c.map(ch => ch.key !== 'button_voicemail_provider_key' ? ch
    : {...ch, t: 'VoicemailProviderList', summary: t('Phone/voicemail_default')})});
  const progress = (c, text) => c.dialog({title: '', icon: null, cancelable: false, html: `<div class="ecsys-progress"><img class="ecsys-spinner" src="assets/fw-spinner_white_48.png" alt=""><span>${esc(text)}</span></div>`});
  // TimeConsumingPreferenceActivity: reading the settings from the network, which does not answer here.
  function query(c, screen) {
    stack(c).push(screen); c.ui.phoneQueryFailed = false; c.render();
    progress(c, t('Phone/reading_settings'));
    setTimeout(() => {
      c.ui.phoneQueryFailed = true; c.render();
      c.dialog({title: t('Phone/error_updating_title'), icon: 'fw-ic_dialog_alert.png', message: t('Phone/exception_error'), buttons: [{label: F().t('ok')}]});
    }, 1500);
  }
  EC.settingsTargets = {...EC.settingsTargets,
    'com.android.phone.GsmUmtsAdditionalCallOptions': c => query(c, 'gsm_umts_additional_options'),
    'com.android.phone.GsmUmtsCallForwardOptions': c => query(c, 'callforward_options'),
    'com.android.phone.FdnList': c => {
      stack(c).push('fdn-list'); c.ui.fdnLoading = true; c.render();
      setTimeout(() => { c.ui.fdnLoading = false; if (stack(c).at(-1) === 'fdn-list') c.render(); }, 1000);
    },
  };
  const pin = (c, title, fields) => c.dialog({title, icon: null, html: `<div class="ecpf-dlg">${fields.map(label => `<div class="ecpf-dlg-label">${esc(label)}</div><span class="ecwf-edit ecsp-field npp-fw-textfield_default"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><input class="ecwf-input" type="password" inputmode="numeric" autocomplete="off"></span>`).join('')}</div>`,
    buttons: [{label: F().t('ok'), action: () => setTimeout(() => c.toast(t('Phone/pin2_invalid')), 0)}, {label: F().t('cancel')}]});
  const value = (c, key, def) => c.data.prefs?.[key] ?? def;
  Object.assign(EC.settingsPrefTypes, {
    VoicemailProviderList: (c, n) => {
      const items = [t('Phone/voicemail_default'), t('googlevoice/voicemail_provider_label')], cur = value(c, n.key, '');
      c.dialog({title: EC.text('settings').has('Phone/voicemail_provider') ? EC.text('settings').t('Phone/voicemail_provider') : '', icon: null, items, choice: 'single', checked: cur === 'googlevoice' ? 1 : 0, closeOnChoice: true,
        buttons: [{label: F().t('cancel')}], onItem: i => { if (i === 1) c.open('google-voice'); else { (c.data.prefs ||= {})[n.key] = ''; c.save(); c.render(); } }});
    },
    EditPhoneNumberPreference: (c, n) => c.dialog({title: EC.text('settings').t(n.title.slice(7)), icon: null,
      html: `<div class="ecpf-dlg"><span class="ecwf-edit ecsp-field npp-fw-textfield_default"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><input class="ecwf-input" type="tel" data-ime="phone" value="${esc(value(c, n.key, ''))}" autocomplete="off"></span></div>`,
      buttons: [{label: F().t('ok'), action: (c2, d, root) => { (c.data.prefs ||= {})[n.key] = root.querySelector('input')?.value || ''; c.save(); c.render(); }}, {label: F().t('cancel')}]}),
    EditPinPreference: (c, n) => n.key === 'button_change_pin2_key' ? pin(c, EC.text('settings').t('Phone/change_pin2'), [t('Phone/oldPin2Label'), t('Phone/newPin2Label'), t('Phone/confirmPin2Label')])
      : pin(c, t('Phone/enable_fdn'), [t('Phone/enter_pin2_text')]),
    Use2GOnlyCheckBoxPreference: (c, n) => { (c.data.prefs ||= {})[n.key] = !value(c, n.key, false); c.save(); c.render(); },
    CLIRListPreference: () => {}, CallWaitingCheckBoxPreference: () => {}, CallForwardEditPreference: () => {}
  });
  document.addEventListener('DOMContentLoaded', () => {
    const m = EC.module('settings'), base = {render: m.render, action: m.action};
    m.render = c => {
      const top = stack(c)?.at(-1);
      if (top === 'fdn-list') return c.window(EC.text('settings').t('Phone/fdnListLabel'), `<div class="ecsp-empty">${esc(t(c.ui.fdnLoading ? 'Phone/simContacts_emptyLoading' : 'Phone/simContacts_empty'))}</div>`);
      const html = base.render(c);
      // After a failed query the activity's rows stay off.
      if (['gsm_umts_additional_options', 'callforward_options'].includes(top)) return html.replace(/class="ecpf-row"/g, `class="ecpf-row"${c.ui.phoneQueryFailed ? ' disabled' : ''}`);
      return html;
    };
    // Data roaming asks before it turns on; Network operators' two rows run their own progress.
    m.action = (name, el, event, c) => {
      if (name === 'ecpf-row') {
        const top = stack(c)?.at(-1);
        const n = top === 'network_setting' || top === 'carrier_select' ? (EC.settingsExtra[top]?.(c, EC.settingsXml[top].c) || EC.settingsXml[top].c)[Number(el.dataset.path.split('.').pop())] : null;
        if (n?.key === 'button_roaming_key' && !value(c, n.key, false)) {
          c.dialog({title: F().t('dialog_alert_title'), icon: 'fw-ic_dialog_alert.png', message: t('Phone/roaming_warning'),
            buttons: [{label: F().t('yes'), action: () => { (c.data.prefs ||= {})[n.key] = true; c.save(); c.render(); }}, {label: F().t('no')}]});
          return true;
        }
        if (n?.key === 'button_srch_netwrks_key') {
          progress(c, t('Phone/load_networks_progress'));
          setTimeout(() => { c.closeDialog(); c.toast(t('Phone/network_query_error')); }, 2500);
          return true;
        }
        if (n?.key === 'button_auto_select_key') {
          progress(c, t('Phone/register_automatically'));
          setTimeout(() => { c.closeDialog(); c.toast(t('Phone/registration_done')); }, 2000);
          return true;
        }
      }
      return base.action(name, el, event, c);
    };
  });
})();
