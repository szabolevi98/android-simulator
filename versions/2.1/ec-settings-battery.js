/* Android 2.1 Settings › About phone › Battery use: com.android.settings.fuelgauge, read from the image's Settings.odex.
   - PowerUsageSummary (power_usage_summary.xml: the screen itself is the list, no header): refreshStats on resume and
     from the menu's one item, Refresh (ic_menu_refresh, shortcut r). processMiscUsage adds, in this order, Voice calls,
     Display, Wi-Fi, Bluetooth, Phone idle and Cell standby, each as time × the Nexus One's power_profile.xml
     (framework-res res/xml): Display = screen on × screen.on 100 + the time in each of the 5 brightness bins ×
     screen.full 160 × (bin + 0.5) / 5; Cell standby = whole seconds with a signal × radio.on 3; Phone idle = the time
     with the screen off × cpu.idle 2.8; Wi-Fi = running × wifi.on 1.5; Bluetooth = on × bluetooth.on 0.3; Voice calls =
     in call × radio.active 300 (mA·s). Sorted by that, dropping what is under 1 mA·s or under 1 %, at most 11 rows.
     processAppUsage's per-uid CPU, wake lock and network counts have nothing to come from here, so no app rows.
   - PowerGaugePreference (preference_powergauge.xml): the 48 dp icon, the title, "(int) ceil(percent) %" in bold small
     text, and the PercentageBar: app_gauge stretched to the share of the largest item over #80404040.
   - PowerUsageDetail (power_usage_details.xml, "Battery use details"): the header again with the drain type's
     description, Use details ("Time on" in Utils.formatElapsedTime: "1m 5s"; Cell standby adds "Time without a
     signal" when above 0) and Adjust power use (power_usage_action_item.xml: the suggestion and a button that opens
     Sound & display / Wi-Fi settings / Bluetooth settings, or Wireless & networks for Cell standby over 10 % without a
     signal). Phone idle and Voice calls have no control, so that section goes. Included packages is for apps only.
   The stats are ec-core's: the page load counts as unplugging the phone. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const X = () => EC.text('settingsx');
  const t = k => X().t(k);
  const S = k => EC.text('settings').t(k);
  const stack = c => c.ui.settingsStack;
  // power_profile.xml (passion framework-res).
  const POWER = {'screen.on': 100, 'screen.full': 160, 'radio.on': 3, 'radio.active': 300, 'cpu.idle': 2.8, 'wifi.on': 1.5, 'bluetooth.on': 0.3};
  // PowerUsageDetail.sDrainTypeDesciptions and fillControlsSection, by drain type.
  const TYPES = {
    PHONE: {name: 'power_phone', icon: 'ic_settings_voice_calls', desc: 'battery_desc_voice'},
    SCREEN: {name: 'power_screen', icon: 'ic_settings_display', desc: 'battery_desc_display', control: ['sound_and_display_settings', 'battery_sugg_display', 'sound_and_display_settings']},
    WIFI: {name: 'power_wifi', icon: 'ic_settings_wifi', desc: 'battery_desc_wifi', control: ['wifi_settings', 'battery_sugg_wifi', 'wifi_settings']},
    BLUETOOTH: {name: 'power_bluetooth', icon: 'ic_settings_bluetooth', desc: 'battery_desc_bluetooth', control: ['bluetooth_settings', 'battery_sugg_bluetooth_basic', 'bluetooth_settings']},
    IDLE: {name: 'power_idle', icon: 'ic_settings_phone_idle', desc: 'battery_desc_standby'},
    CELL: {name: 'power_cell', icon: 'ic_settings_cell_standby', desc: 'battery_desc_radio', control: ['radio_controls_title', 'battery_sugg_radio', 'wireless_settings']}
  };

  function refreshStats(c) {
    const st = c.batteryStats(), list = [];
    const add = (type, time, power) => list.push({type, time, power});
    add('PHONE', st.phone, st.phone * POWER['radio.active'] / 1000);
    const screenOn = st.screen.reduce((a, b) => a + b, 0);
    add('SCREEN', screenOn, (screenOn * POWER['screen.on'] + st.screen.reduce((sum, ms, i) => sum + POWER['screen.full'] * (i + 0.5) / 5 * ms, 0)) / 1000);
    add('WIFI', st.wifi, st.wifi * POWER['wifi.on'] / 1000);
    add('BLUETOOTH', st.bluetooth, st.bluetooth * POWER['bluetooth.on'] / 1000);
    add('IDLE', st.up - screenOn, (st.up - screenOn) * POWER['cpu.idle'] / 1000);
    add('CELL', st.radio, Math.floor(st.radio / 1000) * POWER['radio.on']);
    const total = list.reduce((a, s) => a + s.power, 0), max = Math.max(...list.map(s => s.power));
    const rows = [];
    for (const s of list.sort((a, b) => b.power - a.power)) {
      if (s.power < 1) continue;
      s.percent = s.power / total * 100;
      if (s.percent < 1) continue;
      s.gauge = s.power * 100 / max;
      rows.push(s);
      if (rows.length > 10) break;
    }
    c.ui.batteryUse = {rows, total, max};
  }

  // Utils.formatElapsedTime.
  function elapsed(c, millis) {
    let seconds = Math.floor(millis / 1000), days = 0, hours = 0, minutes = 0;
    if (seconds > 86400) { days = Math.floor(seconds / 86400); seconds -= days * 86400; }
    if (seconds > 3600) { hours = Math.floor(seconds / 3600); seconds -= hours * 3600; }
    if (seconds > 60) { minutes = Math.floor(seconds / 60); seconds -= minutes * 60; }
    if (days > 0) return X().fmt('battery_history_days', c.lang, days, hours, minutes, seconds);
    if (hours > 0) return X().fmt('battery_history_hours', c.lang, hours, minutes, seconds);
    if (minutes > 0) return X().fmt('battery_history_minutes', c.lang, minutes, seconds);
    return X().fmt('battery_history_seconds', c.lang, seconds);
  }

  const gauge = value => `<span class="ecbu-gauge"><i class="np-st-app_gauge" style="width:max(calc(4 * var(--dp)), ${value}%)"></i></span>`;
  const head = (type, percent, value, summary) => `<img class="ecbu-icon" src="assets/st-${TYPES[type].icon}.png" alt=""><span class="ecbu-body"><span class="ecbu-top"><span class="ecbu-title">${esc(t(TYPES[type].name))}</span><b class="ecbu-percent">${percent}%</b></span>${gauge(value)}<span class="ecbu-summary">${esc(summary)}</span></span>`;
  const cat = title => `<div class="ecpf-cat npp-fw-dark_header_dither"><i class="ec-bg np-fw-dark_header_dither"></i><span>${esc(title)}</span></div>`;

  function summary(c) {
    if (!c.ui.batteryUse) refreshStats(c);
    const rows = c.ui.batteryUse.rows.map((s, i) => `<button type="button" class="ecbu-row" data-action="ecbu-detail" data-index="${i}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i>${head(s.type, Math.ceil(s.percent), s.gauge, '')}</button><i class="ecpf-divider"></i>`).join('');
    return c.window(S('power_usage_summary_title'), `<div class="ecpf-list">${rows}</div>`);
  }

  function detail(c) {
    const {rows, total, max} = c.ui.batteryUse, s = rows[c.ui.batteryDetail], type = TYPES[s.type];
    const noCoverage = 0;   // the simulated signal never drops to bin 0
    const values = s.type === 'CELL' ? [['usage_type_on_time', s.time], ['usage_type_no_coverage', noCoverage]] : [['usage_type_on_time', s.time]];
    const details = values.filter(([, v]) => v > 0).map(([label, v]) => `<div class="ecbu-item"><b>${esc(t(label))}</b><span>${esc(label === 'usage_type_no_coverage' ? `${Math.floor(v)}%` : elapsed(c, v))}</span></div>`).join('');
    const control = type.control && (s.type !== 'CELL' || noCoverage > 10) ? type.control : null;
    const controls = control ? `${cat(t('controls_subtitle'))}<div class="ecbu-action"><div class="ecbu-sugg">${esc(t(control[1]))}</div><div class="ecbu-btns"><span></span>
      <button type="button" class="ecui-button ecbu-btn" data-action="ecbu-control" data-screen="${control[2]}"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(S(control[0]))}</span></button></div></div>` : '';
    return c.window(S('details_title'), `<div class="ecbu-details"><div class="ecbu-row ecbu-head">${head(s.type, Math.ceil(s.power * 100 / total), Math.ceil(s.power * 100 / max), t(type.desc))}</div>
      ${cat(t('details_subtitle'))}<div class="ecbu-list">${details}</div>${controls}</div>`);
  }

  EC.settingsTargets = {...EC.settingsTargets, PowerUsageSummary: c => { c.ui.batteryUse = null; stack(c).push('battery-use'); c.render(); }};
  document.addEventListener('DOMContentLoaded', () => {
    const m = EC.module('settings'), base = {render: m.render, action: m.action, menu: m.menu, back: m.back};
    m.render = c => {
      const top = stack(c)?.at(-1);
      return top === 'battery-use' ? summary(c) : top === 'battery-detail' ? detail(c) : base.render(c);
    };
    m.action = (name, el, event, c) => {
      if (name === 'ecbu-detail') { c.ui.batteryDetail = Number(el.dataset.index); stack(c).push('battery-detail'); c.render(); return true; }
      if (name === 'ecbu-control') { stack(c).push(el.dataset.screen); c.render(); return true; }
      return base.action(name, el, event, c);
    };
    m.menu = c => {
      if (stack(c)?.at(-1) !== 'battery-use') return base.menu(c);
      c.menu([{label: t('menu_stats_refresh'), icon: 'fw-ic_menu_refresh.png', action: () => { refreshStats(c); c.render(); }}]);
      return true;
    };
    // Back to the list is onResume: refreshStats again.
    m.back = c => {
      const leaving = stack(c)?.at(-1), handled = base.back(c);
      if (leaving !== 'battery-use' && stack(c)?.at(-1) === 'battery-use') { refreshStats(c); c.render(); }
      return handled;
    };
  });
})();
