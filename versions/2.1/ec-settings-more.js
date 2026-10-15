/* Android 2.1 Settings: the rows left after the screens themselves (Settings.odex).
   - EditTextPreference (preference_dialog_edittext.xml): the title over a one-line field with the value, OK / Cancel;
     the value shows as the summary. Wi-Fi › Advanced's static IP fields (AdvancedSettings) take only IP addresses
     ("Please type a valid IP address."). Bluetooth's Device name (BluetoothNamePreference) is the adapter's name,
     ro.product.model "Nexus One" until changed.
   - Bluetooth › Scan for devices: LocalBluetoothManager.startScanning — the "Bluetooth devices" ProgressCategory shows
     "Scanning" with its spinner for the 12 s of discovery; nothing answers here.
   - IccLockSettings (sim_lock_settings.xml, "SIM card lock settings"): Lock SIM card asks "SIM PIN" (4 to 8 digits, else
     "Incorrect PIN!"); the SIM refuses it ("Unable to change SIM card lock state. Possibly incorrect PIN." — this SIM's
     PIN is not known here). Change SIM PIN stays off while the lock is off.
   - DockSettings › Audio: not docked, "Phone not docked" and the "Dock not found" dialog. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const X = () => EC.text('settingsx');
  const t = k => X().t(k);
  const S = k => EC.text('settings').t(k);
  const F = () => EC.text('framework');
  const prefs = c => c.data.prefs ||= {};
  const input = (value, type = 'text') => `<span class="ecwf-edit ecsp-field npp-fw-textfield_default"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><input class="ecwf-input" type="${type}"${type === 'password' ? ' inputmode="numeric"' : ''} value="${esc(value)}" autocomplete="off"></span>`;
  const field = value => `<div class="ecpf-dlg">${input(value)}</div>`;
  const DEFAULTS = {bt_name: 'Nexus One'};
  const valueOf = (c, key) => prefs(c)[key] ?? DEFAULTS[key] ?? '';
  const IP = ['ip_address', 'gateway', 'netmask', 'dns1', 'dns2'];
  const isIp = v => /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(v) && v.split('.').every(n => Number(n) <= 255);
  EC.settingsPrefTypes.EditTextPreference = EC.settingsPrefTypes.BluetoothNamePreference = (c, n) => c.dialog({title: S((n.dialogTitle || n.title).slice(7)), icon: null, html: field(valueOf(c, n.key)),
    buttons: [{label: F().t('ok'), action: (c2, d, root) => {
      const v = root.querySelector('input').value.trim();
      if (IP.includes(n.key) && v && !isIp(v)) { setTimeout(() => c.toast(t('wifi_ip_settings_invalid_ip')), 0); return; }
      prefs(c)[n.key] = v; c.save(); c.render();
    }}, {label: F().t('cancel')}]});
  for (const key of [...IP, 'bt_name']) EC.settingsSummaries[key] = c => valueOf(c, key);

  // Bluetooth discovery.
  let scanTimer = 0;
  EC.settingsKeys.bt_scan = c => { clearTimeout(scanTimer); c.ui.btScanning = true; c.render(); scanTimer = setTimeout(() => { c.ui.btScanning = false; c.render(); }, 12000); };
  EC.settingsProgress.bt_device_list = c => !!c.ui.btScanning;

  // IccLockSettings.
  EC.settingsClass.SimLockSettings = EC.settingsClass.IccLockSettings = 'sim_lock_settings';
  EC.settingsDisabled.sim_pin = c => !prefs(c).sim_toggle;
  const pinDialog = (c, title, label, next) => c.dialog({title, icon: null, html: `<div class="ecpf-dlg"><div class="ecpf-dlg-label">${esc(label)}</div>${input('', 'password')}</div>`,
    buttons: [{label: t('sim_enter_ok'), action: (c2, d, root) => {
      const pin = root.querySelector('input').value;
      // IccLockSettings.reasonablePin: 4 to 8 digits.
      if (!/^\d{4,8}$/.test(pin)) { setTimeout(() => { c.toast(t('sim_bad_pin')); pinDialog(c, title, label, next); }, 0); return; }
      setTimeout(() => next(pin), 0);
    }}, {label: t('sim_enter_cancel')}]});
  EC.settingsKeys.sim_toggle = c => pinDialog(c, t(prefs(c).sim_toggle ? 'sim_disable_sim_lock' : 'sim_enable_sim_lock'), t('sim_enter_pin'), () => c.toast(t('sim_lock_failed')));
  EC.settingsKeys.sim_pin = c => pinDialog(c, t('sim_change_pin'), t('sim_enter_old'), () => pinDialog(c, t('sim_change_pin'), t('sim_enter_new'), first =>
    pinDialog(c, t('sim_change_pin'), t('sim_reenter_new'), again => c.toast(t(first === again ? 'sim_change_failed' : 'sim_pins_dont_match')))));

  // DockSettings.
  EC.settingsSummaries.dock_audio = () => t('dock_audio_summary_none');
  EC.settingsKeys.dock_audio = c => c.dialog({title: t('dock_not_found_title'), icon: null, message: t('dock_not_found_text'), buttons: [{label: F().t('ok')}]});
})();
