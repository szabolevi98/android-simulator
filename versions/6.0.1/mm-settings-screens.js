/* Android 6.0.1 Settings: what each preference screen's fragment does with its res/xml (Settings.apk code, MTC20K),
   as MM.settingsHooks[<xml name>] = {hidden: [keys], hide(c, key), get(c, key), set(c, key, v), summary(c, key),
   title(c, key), click(c, key), changed(c, key, v), switch: [keys drawn with a switch], top(c)}.
   - display_settings (DisplaySettings.onCreate): lift_to_wake goes without a wake gesture sensor (the 5X has none),
     tap_to_wake with config_supportDoubleTapWake false, camera_gesture with config_cameraLaunchGestureSensorType -1;
     camera_double_tap_power_gesture (config_cameraDoubleTapPowerGestureEnabled), doze (config_dozeComponent) and the
     screensaver (config_dreamsSupported) stay. The timeout's summary is screen_timeout_summary with the largest entry
     not over the value; auto_rotate is a DropDownPreference of "Rotate the contents of the screen" and, the 5X not
     allowing all rotations, "Stay in portrait view"; the screensaver's summary is the active dream's label
     (config_dreamsDefaultComponent: the Clock app's Screensaver) while dreams are on (config_dreamsEnabledByDefault). */
(() => {
  'use strict';
  const T = () => MM.text('settings');
  const H = MM.settingsHooks = MM.settingsHooks || {};
  const S = c => c.data.settings;

  H.display_settings = {
    hidden: ['lift_to_wake', 'tap_to_wake', 'camera_gesture'],
    get(c, key) {
      const s = S(c);
      if (key === 'auto_brightness') return s.brightnessAuto;
      if (key === 'screen_timeout') return String(s.screenTimeout ?? 30000);
      if (key === 'camera_double_tap_power_gesture') return !s.cameraDoubleTapDisabled;
      if (key === 'doze') return s.doze ?? true;
      if (key === 'font_size') return s.fontScale ?? '1.0';
      return undefined;
    },
    set(c, key, v) {
      const s = S(c);
      if (key === 'auto_brightness') { s.brightnessAuto = v; MM.system?.applyBrightness(c); return true; }
      if (key === 'screen_timeout') { s.screenTimeout = +v; return true; }
      if (key === 'camera_double_tap_power_gesture') { s.cameraDoubleTapDisabled = !v; return true; }
      if (key === 'doze') { s.doze = v; return true; }
      if (key === 'font_size') { s.fontScale = v; return true; }
      return false;
    },
    summary(c, key, n) {
      const t = T(), s = S(c);
      if (key === 'screen_timeout') {
        const values = n.entryValues, entries = MM.settingsArr(n.entries), cur = s.screenTimeout ?? 30000;
        let best = 0; values.forEach((v, i) => { if (cur >= +v) best = i; });
        return t.fmt('screen_timeout_summary', null, entries[best]);
      }
      if (key === 'auto_rotate') return t.t(s.rotationLocked ? 'display_auto_rotate_stay_in_portrait' : 'display_auto_rotate_rotate');
      if (key === 'screensaver') return s.dreams === false ? t.t('screensaver_settings_summary_off') : MM.appLabel(c, 'clock');
      return undefined;
    },
    click(c, key) {
      if (key === 'auto_rotate') {
        const t = T(), s = S(c), items = [t.t('display_auto_rotate_rotate'), t.t('display_auto_rotate_stay_in_portrait')];
        c.dialog({items: items.map((label, i) => ({html: `<span class="mmst-choice"><i class="mmw-radio${(i === 1) === !!s.rotationLocked ? ' on' : ''}"></i><span>${c.safe(label)}</span></span>`})),
          onItem: i => { s.rotationLocked = i === 1; c.save(); c.render(); }});
        return true;
      }
      if (key === 'brightness') { c.overlay('brightness'); return true; }
      return false;
    }
  };
})();
