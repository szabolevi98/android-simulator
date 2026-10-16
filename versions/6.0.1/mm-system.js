/* Android 6.0.1: the phone's radios and switches, and what the status bar shows of them. Logic only.
   - Saved settings (SettingsProvider defaults of the image where the simulator does not differ): wifi on and connected to
     the simulator's network (the image's def_wifi_on is false, the simulator starts set up, as every version), bluetooth
     off (def_bluetooth_on), airplane off (def_airplane_mode_on), zen 0 (Settings.Global.ZEN_MODE: 0 off, 1 priority
     only, 2 total silence, 3 alarms only), mobile data on, rotation not locked (def_accelerometer_rotation true),
     location on (def_location_providers_allowed "gps"), automatic brightness (def_screen_brightness_automatic_mode true,
     def_screen_brightness 78, screen_auto_brightness_adj 0).
   - Airplane mode turns the radios of airplane_mode_radios off (cell, bluetooth, wifi) and back on as they were.
   - PhoneStatusBarPolicy: the status icons in config_statusBarIcons order (cast, hotspot, location, bluetooth, zen,
     volume, alarm_clock …); with the DND tile shown (VolumeDialogController shows it) zen is stat_sys_dnd, or
     stat_sys_dnd_total_silence for total silence. Bluetooth shows while it is on (connected: its own icon).
   - SignalClusterView: Wi-Fi, the 4 dp spacer when both show, the mobile signal with its data type over it (LTE:
     config_show4GForLTE is false outside mcc202), the airplane after its spacer. The mobile icon is drawn "fully" unless
     mobile is the default network without internet.
   - The screen's brightness: the simulator dims the phone with a CSS filter (manual: 0.5 at 0 up to 1 at 255; automatic:
     the adjustment below the middle dims down to 0.5). */
(() => {
  'use strict';
  Object.assign(MM.defaults.settings, {wifi: true, wifiSsid: 'Home Network', bluetooth: false, airplane: false, zen: 0, zenFavorite: 3, zenUntil: 0, mobileData: true,
    rotationLocked: false, location: true, brightnessAuto: true, brightness: 78, brightnessAdj: 0});
  // What is not saved: the flashlight (it goes off with the camera service on a reboot) and the radios coming up.
  const live = {flashlight: false, wifiConnecting: 0, btConnecting: 0};

  // The simulator's Wi-Fi networks, as every version has them (names are data, not interface text): level is
  // WifiManager.calculateSignalLevel(rssi, 4), 0..3; saved ones connect without a password.
  const NETWORKS = [{ssid: 'AndroidAP', secure: true, level: 3}, {ssid: 'CoffeeShop', secure: false, level: 2},
    {ssid: 'Home Network', secure: true, level: 3, saved: true}, {ssid: 'Library Wi-Fi', secure: false, level: 1}];

  const sys = MM.system = {
    live,
    // WifiTracker's list: AccessPoint.compareTo puts the active network first, then the stronger, then by name.
    accessPoints(c) {
      const s = c.data.settings, connected = sys.wifiState(c) === 'connected';
      return NETWORKS.map(n => ({...n, saved: n.saved || (s.wifiSaved || []).includes(n.ssid), active: connected && n.ssid === s.wifiSsid}))
        .sort((a, b) => (b.active - a.active) || (b.level - a.level) || a.ssid.localeCompare(b.ssid, undefined, {sensitivity: 'base'}));
    },
    connectWifi(c, ssid) {
      const s = c.data.settings;
      s.wifiSsid = ssid; s.wifiSaved = [...new Set([...(s.wifiSaved || []), ssid])];
      sys.setWifi(c, true);
    },
    // MobileDataControllerImpl.getDataUsageInfo: the policy's cycle (NetworkPolicyManagerService made it start on the
    // day the SIM was first seen; the simulator's starts on the 1st), the default 2 GB warning, no limit. The usage is
    // the simulator's own: about 42 MB a day of the cycle.
    dataUsage(c) {
      const now = new Date(), start = new Date(now.getFullYear(), now.getMonth(), 1), end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const usage = Math.round(now.getDate() * 41.7 * 1048576 + now.getHours() * 1.6 * 1048576);
      let period;
      try { period = new Intl.DateTimeFormat(c.locale(), {month: 'short', day: 'numeric'}).formatRange(start, end); }
      catch { const f = new Intl.DateTimeFormat(c.locale(), {month: 'short', day: 'numeric'}); period = `${f.format(start)} – ${f.format(end)}`; }
      return {usage, warning: 2147483648, limit: 0, period, carrier: c.data.settings.airplane ? '' : MM.text('shade').t('carrier')};
    },
    // Wi-Fi: off, searching (a moment after switching it on) or connected.
    wifiState(c) { const s = c.data.settings; return !s.wifi ? 'off' : live.wifiConnecting > Date.now() ? 'searching' : 'connected'; },
    setWifi(c, on) {
      const s = c.data.settings;
      s.wifi = on; if (on) live.wifiConnecting = Date.now() + 2500;
      c.save(); sys.changed(c);
      if (on) setTimeout(() => sys.changed(c), 2600);
    },
    setBluetooth(c, on) { c.data.settings.bluetooth = on; c.save(); sys.changed(c); },
    setAirplane(c, on) {
      const s = c.data.settings;
      if (on === s.airplane) return;
      if (on) { s.beforeAirplane = {wifi: s.wifi, bluetooth: s.bluetooth}; s.wifi = false; s.bluetooth = false; }
      else { const b = s.beforeAirplane || {}; s.wifi = !!b.wifi; s.bluetooth = !!b.bluetooth; if (s.wifi) live.wifiConnecting = Date.now() + 2500; delete s.beforeAirplane; }
      s.airplane = on; c.save(); sys.changed(c);
      if (!on && s.wifi) setTimeout(() => sys.changed(c), 2600);
    },
    setZen(c, zen) { const s = c.data.settings; s.zen = zen; if (!zen) s.zenUntil = 0; c.save(); sys.changed(c); },
    // The mobile network: no service in airplane mode; connected to data when Wi-Fi is not.
    mobile(c) {
      const s = c.data.settings;
      if (s.airplane) return {service: false};
      return {service: true, data: s.mobileData && sys.wifiState(c) !== 'connected'};
    },
    // The screen's brightness factor for the filter.
    brightness(c) {
      const s = c.data.settings;
      if (s.brightnessAuto) return s.brightnessAdj < 0 ? 1 + s.brightnessAdj * 0.5 : 1;
      return 0.5 + 0.5 * (s.brightness / 255);
    },
    applyBrightness(c) { const f = sys.brightness(c); c.el.screen.style.filter = f < 1 ? `brightness(${f.toFixed(3)})` : ''; },
    // Something changed: the status bar and an open shade draw it again.
    changed(c) {
      sys.applyBrightness(c);
      const bar = MM.module('statusbar'); if (bar) { c.el.status.innerHTML = bar.render(c); bar.mount?.(c, c.el.status); }
      if (c.ui.overlay === 'shade') MM.module('shade')?.refresh?.(c);
    }
  };

  MM.register('system', {
    app: false,
    render: () => '',
    init(c) {
      // The status icons (PhoneStatusBarPolicy) and the signal cluster (SignalClusterView), for mm-statusbar.js.
      c.statusIcons = () => {
        const s = c.data.settings, out = [];
        if (s.bluetooth) out.push('stat_sys_data_bluetooth');
        if (s.zen) out.push(s.zen === 2 ? 'stat_sys_dnd_total_silence' : 'stat_sys_dnd');
        // The volume slot: vibrate unless total silence or alarms only (PhoneStatusBarPolicy.updateVolumeZen).
        if (s.ringerMode === 'vibrate' && s.zen !== 2 && s.zen !== 3) out.push('stat_sys_ringer_vibrate');
        return out;
      };
      c.signal = () => {
        const s = c.data.settings, wifi = sys.wifiState(c), m = sys.mobile(c);
        return {
          wifi: wifi === 'connected' ? 'stat_sys_wifi_signal_4_fully' : null,
          mobile: m.service ? 'stat_sys_signal_4_fully' : null,
          type: m.service && m.data ? 'stat_sys_data_fully_connected_lte' : null,
          airplane: s.airplane
        };
      };
      sys.applyBrightness(c);
    },
    // A countdown condition ends Do not disturb at its time (ZenModeConditions / CountdownConditionProvider).
    tick(c) { const s = c.data.settings; if (s.zen && s.zenUntil && Date.now() >= s.zenUntil) sys.setZen(c, 0); }
  });
})();
