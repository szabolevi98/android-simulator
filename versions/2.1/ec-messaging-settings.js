/* Android 2.1 Messaging › Settings: Mms.apk's MessagingPreferenceActivity (res/xml/preferences.xml, generated into
   EC.settingsXml.mms_preferences by docs/tools/ec-prefs.py) drawn by the Settings engine on a stack of its own.
   - onCreate keeps every category: the phone has a SIM (Manage SIM card messages stays) and MmsConfig's mMmsEnabled is 1.
   - Text / Multimedia message limit: Mms's NumberPickerDialog ("Set number of messages to save" in 12 sp over a 100 dp
     NumberPicker that stops at MmsConfig's 2 and 5000; Set / Cancel), the summary "%1$s messages per conversation";
     the defaults are MmsConfig's 200 and 20 (MaxSmsMessagesPerThread / MaxMmsMessagesPerThread).
   - Select ringtone: RingtonePreference (notifications, with Default and Silent).
   - Menu: Restore default settings (restoreDefaultPreferences: the preferences' defaults again).
   - ManageSimMessages "Text messages on SIM card": "Refreshing…" while it reads content://sms/icc, then "No messages on the
     SIM card." */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const M = () => EC.text('mms');
  const S = () => EC.text('settings');
  const KEYS = ['pref_key_auto_delete', 'pref_key_sms_delivery_reports', 'pref_key_mms_delivery_reports', 'pref_key_mms_read_reports', 'pref_key_mms_auto_retrieval',
    'pref_key_mms_retrieval_during_roaming', 'pref_key_enable_notifications', 'pref_key_ringtone', 'pref_key_vibrate', 'MaxSmsMessagesPerThread', 'MaxMmsMessagesPerThread'];
  const LIMITS = {pref_key_sms_delete_limit: ['MaxSmsMessagesPerThread', 200], pref_key_mms_delete_limit: ['MaxMmsMessagesPerThread', 20]};
  const limit = (c, key) => c.data.prefs?.[LIMITS[key][0]] ?? LIMITS[key][1];
  EC.settingsClass['com.android.mms.ui.MessagingPreferenceActivity'] = 'mms_preferences';
  for (const key of Object.keys(LIMITS)) {
    EC.settingsSummaries[key] = c => S().fmt('Mms/pref_summary_delete_limit', c.lang, limit(c, key));
    EC.settingsKeys[key] = (c, n) => c.numberPicker({title: S().t(n.title.slice(7)), label: M().t('pref_messages_to_save'), value: limit(c, key), min: 2, max: 5000,
      setLabel: M().t('set'), cancelLabel: M().t('no'), onSet: v => { (c.data.prefs ||= {})[LIMITS[key][0]] = v; c.save(); c.render(); }});
  }
  EC.settingsKeys.pref_key_manage_sim_messages = c => c.open('sim-messages');
  // RingtonePreference: its title over the picker, the stored choice (null: the default).
  EC.settingsPrefTypes.RingtonePreference = (c, n) => EC.ringtonePicker(c, {cat: n.ringtoneType === '0x00000002' ? 'notifications' : n.ringtoneType === '0x00000004' ? 'alarms' : 'ringtones',
    title: S().t(n.title.slice(7)), current: c.data.prefs?.[n.key] ?? null, showDefault: n.showDefault !== 'false', showSilent: n.showSilent !== 'false',
    onPick: file => { (c.data.prefs ||= {})[n.key] = file; c.save(); }});

  // The Settings module on this screen's own stack.
  const settings = () => EC.module('settings');
  function run(c, fn) {
    const saved = c.ui.settingsStack;
    c.ui.settingsStack = c.ui.mmsPrefStack ||= ['mms_preferences'];
    try { return fn(); } finally { c.ui.mmsPrefStack = c.ui.settingsStack; c.ui.settingsStack = saved; }
  }
  EC.register('messaging-settings', {
    title: 'Messaging',
    render: c => run(c, () => settings().render(c)),
    mount: (c, root) => run(c, () => settings().mount?.(c, root)),
    action: (name, el, event, c) => run(c, () => settings().action(name, el, event, c)),
    back(c) { const stack = c.ui.mmsPrefStack || []; if (stack.length > 1) { stack.pop(); c.render(); return true; } c.ui.mmsPrefStack = null; return false; },
    menu(c) {
      // menu.add(0, 1, 0, restore_default): no icon.
      c.menu([{label: M().t('restore_default'), action: () => { for (const k of KEYS) delete c.data.prefs?.[k]; c.save(); c.render(); }}]);
      return true;
    }
  });

  EC.register('sim-messages', {
    title: 'Messaging',
    render: c => c.window(M().t(c.ui.simMsgLoading ? 'refreshing' : 'sim_manage_messages_title'), c.ui.simMsgLoading ? '' : `<div class="ecsp-empty">${esc(M().t('sim_empty'))}</div>`),
    start(c) { c.ui.simMsgLoading = true; setTimeout(() => { c.ui.simMsgLoading = false; if (c.ui.view === 'sim-messages') c.render(); }, 1000); }
  });
  document.addEventListener('DOMContentLoaded', () => {
    const ctx = EC.context, base = ctx.open;
    ctx.open = (view, sub, opts) => { const fresh = ctx.ui.view !== view; const r = base(view, sub, opts); if (fresh && view === 'sim-messages') { EC.module(view).start(ctx); ctx.render(); } return r; };
  });
})();
