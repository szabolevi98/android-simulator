/* Android 2.1 Settings: the image's preference screens (ec-settings-data.js, docs/tools/ec-prefs.py) drawn as
   PreferenceActivity lists in an activity window (title bar 25 dp):
   - preference.xml rows: at least 64 dp, the title (textAppearanceLarge, 22 sp, white) and up to two lines of summary
     (textAppearanceSmall, 14 sp, #bebebe) 15 dp from the left; the widget frame at the right (CheckBox 4 dp from the
     edge); Settings' preference_icon.xml rows put the icon 6 dp from the left with the text 2 dp after it;
   - categories: Widget.TextView.ListSeparator (25 dp, dark_header, 14 sp bold #bebebe, 5 sp in);
   - divider_horizontal_dark between rows; list_selector_background when pressed; a dependency switches a row off
     (#80ffffff / #80bebebe) as CheckBoxPreference.disableDependentsState says.
   ListPreference opens its entries as a single-choice dialog with Cancel; the screens an intent names open in place.
   Runtime changes the code makes: SoundAndDisplaySettings drops emergency_tone (GSM); DeviceInfoSettings fills the
   version rows from build.prop and drops safetylegal (no ro.url.safetylegal). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const S = () => EC.text('settings');
  const txt = ref => {
    if (!ref || typeof ref !== 'string') return '';
    if (!ref.startsWith('string/')) return ref;
    const name = ref.slice(7);
    return S().has(name) ? S().t(name) : S().has(`framework/${name}`) ? S().t(`framework/${name}`) : name;
  };
  const arr = ref => {
    const name = String(ref || '').replace(/^array\//, '');
    return S().has(name) ? S().t(name) : S().has(`framework/${name}`) ? S().t(`framework/${name}`) : [];
  };
  // intent targetClass → the screen's xml
  const CLASS = {
    WirelessSettings: 'wireless_settings', WifiSettings: 'wifi_settings', AdvancedSettings: 'wifi_advanced_settings', BluetoothSettings: 'bluetooth_settings',
    SoundAndDisplaySettings: 'sound_and_display_settings', SecuritySettings: 'security_settings', ApplicationSettings: 'application_settings',
    DevelopmentSettings: 'development_prefs', PrivacySettings: 'privacy_settings', Memory: 'device_info_memory', LanguageSettings: 'language_settings',
    AccessibilitySettings: 'accessibility_settings', TextToSpeechSettings: 'tts_settings', DateTimeSettings: 'date_time_prefs',
    DeviceInfoSettings: 'device_info_settings', Status: 'device_info_status', DockSettings: 'dock_settings', QuickLaunchSettings: 'quick_launch_settings',
    VpnSettings: 'vpn_settings', ApnSettings: 'apn_settings', PhysicalKeyboardSettings: 'keyboard_settings'
  };
  // Preference keys stored in the phone's state (the rest go to data.prefs with their defaultValue).
  const BOUND = {
    toggle_airplane: ['airplane'], toggle_wifi: ['wifi'], toggle_bluetooth: ['bluetooth'], silent: ['ringer'],
    accelerometer: ['rotate', true], auto_time: ['autoTime', true], '24 hour': ['hour24']
  };
  // build.prop (ERE27); the baseband in the update's radio.img; the kernel of ERE27's boot.img (the update's patch applied
  // to ERD79's, SHA-1 e7f20e51…: "Linux version 2.6.29-01117-g4bc62c2 (android-build@apa26…) #1"), as DeviceInfoSettings
  // formats it.
  const BUILD = {firmware_version: '2.1-update1', device_model: 'Nexus One', build_number: 'ERE27', baseband_version: '32.24.00.22U_4.03.00.21_2',
    kernel_version: '2.6.29-01117-g4bc62c2\nandroid-build@apa26 #1'};
  EC.defaults.prefs = {};

  function value(c, key, def) {
    if (BOUND[key]) {
      const [field, dflt] = BOUND[key], v = c.data.settings[field];
      if (key === 'silent') return !!v;
      if (key === '24 hour') return c.is24();
      return v ?? dflt ?? false;
    }
    if (key in (c.data.prefs || {})) return c.data.prefs[key];
    return def === 'true' ? true : def === 'false' ? false : def;
  }
  function setValue(c, key, v) {
    if (BOUND[key]) {
      const [field] = BOUND[key];
      if (key === 'silent') c.data.settings.ringer = v ? (value(c, 'vibrate') ? 'vibrate' : 'silent') : '';
      else if (key === '24 hour') c.data.settings.hour24 = !!v;
      else { c.data.settings[field] = v; if (key === 'toggle_wifi') c.data.settings.wifiConnected = v; }
    } else (c.data.prefs ||= {})[key] = v;
    c.save();
  }
  // CheckBoxPreference.shouldDisableDependents: disableDependentsState true → off when checked.
  function disabled(c, screen, node) {
    if (!node.dependency) return false;
    const dep = find(screen, node.dependency);
    if (!dep) return false;
    const v = !!value(c, dep.key, dep.defaultValue);
    return dep.disableDependentsState === 'true' ? v : !v;
  }
  const find = (n, key) => n.key === key ? n : (n.c || []).reduce((hit, ch) => hit || find(ch, key), null);

  function prune(name, n) {
    if (name === 'sound_and_display_settings' && n.key === 'emergency_tone') return false;
    if (name === 'device_info_settings' && n.key === 'safetylegal') return false;
    return true;
  }
  function summary(c, name, n) {
    if (BUILD[n.key]) return BUILD[n.key];
    if (n.t === 'CheckBoxPreference' && (n.summaryOn || n.summaryOff)) return txt(value(c, n.key, n.defaultValue) ? n.summaryOn : n.summaryOff) || txt(n.summary);
    return txt(n.summary);
  }
  function row(c, screen, name, n, path) {
    if (!prune(name, n)) return '';
    if (n.t === 'PreferenceCategory') return `<div class="ecpf-cat npp-fw-dark_header_dither"><i class="ec-bg np-fw-dark_header_dither"></i><span>${esc(txt(n.title))}</span></div>${(n.c || []).map((ch, i) => row(c, screen, name, ch, `${path}.${i}`)).join('')}`;
    const off = disabled(c, screen, n) || n.enabled === 'false';
    const check = n.t === 'CheckBoxPreference' ? `<img class="ecpf-check" src="assets/fw-btn_check_${value(c, n.key, n.defaultValue) ? 'on' : 'off'}.png" alt="">` : '';
    const icon = n.icon ? `<img class="ecpf-icon" src="assets/st-${n.icon.split('/')[1]}.png" alt="">` : '';
    const sum = summary(c, name, n);
    return `<button type="button" class="ecpf-row${icon ? ' ecpf-icon-row' : ''}" data-action="ecpf-row" data-path="${path}"${off ? ' disabled' : ''}><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i>${icon}<span class="ecpf-text"><span class="ecpf-title">${esc(txt(n.title))}</span>${sum ? `<span class="ecpf-summary">${esc(sum)}</span>` : ''}</span>${check}</button><i class="ecpf-divider"></i>`;
  }
  // The screen on top of the stack: an xml name, or "xml/path" for a nested PreferenceScreen.
  function current(c) {
    const top = c.ui.settingsStack?.at(-1) || 'settings';
    const [name, path] = top.split('|');
    let n = EC.settingsXml[name];
    for (const i of (path ? path.split('.').slice(1) : [])) n = n?.c?.[Number(i)];
    return {name, path, node: n, root: EC.settingsXml[name]};
  }
  function nodeAt(screen, path) { let n = screen.root; for (const i of path.split('.').slice(1)) n = n?.c?.[Number(i)]; return n; }

  function render(c) {
    const s = current(c);
    if (!s.node) return c.window(S().t('settings_label'), '<div class="ec-missing"><b>Not built yet</b></div>');
    const rows = (s.node.c || []).map((n, i) => row(c, s.root, s.name, n, `${s.path ? s.path : ''}.${i}`.replace(/^\./, '.'))).join('');
    // The window title is the activity's android:label (a nested PreferenceScreen shows its own title).
    const cls = Object.keys(CLASS).find(k => CLASS[k] === s.name) || (s.name === 'settings' ? 'Settings' : '');
    const title = (s.path ? txt(s.node.title) : '') || txt(EC.settingsLabels?.[cls]) || txt(s.node.title) || S().t('settings_label');
    return c.window(title, `<div class="ecpf-list" data-screen="${esc(s.name)}">${rows}</div>`);
  }

  function open(c, n, screen, path) {
    if (n.t === 'CheckBoxPreference') { setValue(c, n.key, !value(c, n.key, n.defaultValue)); c.render(); return; }
    if (n.t === 'ListPreference') {
      const entries = arr(n.entries), values = n.entryValues || [], v = String(value(c, n.key, n.defaultValue) ?? '');
      c.dialog({title: txt(n.dialogTitle || n.title), icon: null, items: entries, choice: 'single', checked: values.indexOf(v), closeOnChoice: true,
        buttons: [{label: EC.text('framework').t('cancel')}],
        onItem: i => { setValue(c, n.key, values[i]); if (n.key === 'screen_timeout') c.data.settings.screenTimeout = Number(values[i]); c.save(); c.render(); }});
      return;
    }
    if (n.intent?.targetClass) {
      const cls = n.intent.targetClass.split('.').pop();
      if (CLASS[cls] && EC.settingsXml[CLASS[cls]]) { c.ui.settingsStack.push(CLASS[cls]); c.render(); c.el.viewport.querySelector('.ecwin-content')?.scrollTo(0, 0); return; }
      c.ui.settingsStack.push(`missing:${cls}`); c.render(); return;
    }
    if (n.t === 'PreferenceScreen' && n.c) { c.ui.settingsStack.push(`${screen.name}|${path}`); c.render(); return; }
    if (n.intent?.action) { c.toast(txt(n.title)); return; }
    if (n.t !== 'Preference') c.dialog({title: txt(n.dialogTitle || n.title), icon: null, message: c.t('Not built yet'), buttons: [{label: EC.text('framework').t('ok')}]});
  }

  EC.register('settings', {
    title: 'Settings',
    init(c) { c.ui.settingsStack = ['settings']; },
    render(c) {
      const top = c.ui.settingsStack?.at(-1) || 'settings';
      if (top.startsWith('missing:')) return c.window(S().t('settings_label'), `<div class="ec-missing"><b>${esc(c.t('Not built yet'))}</b><span>${esc(top.slice(8))}</span><small>Android 2.1 · Settings.apk</small></div>`);
      return render(c);
    },
    action(name, el, event, c) {
      if (name !== 'ecpf-row') return false;
      const s = current(c), n = nodeAt(s, el.dataset.path);
      if (n) open(c, n, s, el.dataset.path);
      return true;
    },
    back(c) {
      if ((c.ui.settingsStack?.length || 0) > 1) { c.ui.settingsStack.pop(); c.render(); return true; }
      c.ui.settingsStack = ['settings'];
      return false;
    }
  });
  // Opening Settings from the launcher starts at the top list.
  document.addEventListener('DOMContentLoaded', () => {
    const c = EC.context, base = c.open;
    c.open = (view, sub, opts) => { if (view === 'settings' && c.ui.view !== 'settings') c.ui.settingsStack = ['settings']; return base(view, sub, opts); };
  });
})();
