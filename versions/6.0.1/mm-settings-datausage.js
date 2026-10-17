/* Android 6.0.1 Settings: Data usage (DataUsageSummary, Settings.apk MTC20K), MM.settingsScreens['data-usage'].
   - data_usage_summary.xml with the Cellular tab alone (Wi-Fi only after Show Wi-Fi): data_usage_header.xml's network
     switches (Cellular data, Set cellular data limit), data_usage_cycles.xml (the cycle in the spinner as
     DateUtils.formatDateRange gives it, its total at the end), data_usage_chart.xml (228 dp: 16 dp above, 40 dp at the
     right, 24 dp below; ChartGridView's data_grid_border with the cycle's first and last day in Caption,
     ChartNetworkSeriesView's cumulative use in the accent, ChartSweepView's warning line data_sweep_warning_activated
     with "^1 ^2 warning" in data_usage_sweep_warning's sizes), the disclaimer, then the apps (data_usage_item.xml:
     app_item with the bytes and a bar against the largest).
   - Turning Cellular data off asks data_usage_disable_mobile; Set cellular data limit explains data_usage_limit_dialog.
   - The overflow menu: Restrict background data, Show Wi-Fi, Cellular networks (one SIM: no SIM cards).
   - The cycle and its use are mm-system.js's (MobileDataControllerImpl's figures, as the Quick Settings detail shows);
     the share of each app is the simulator's own. */
(() => {
  'use strict';
  const T = () => MM.text('settings');
  const S = c => c.data.settings;
  // The simulator's split of the cycle's use between the apps (Google Play services, Chrome, YouTube …).
  const SHARES = [['gms', 31], ['chrome', 22], ['youtube', 18], ['android', 9], ['search', 7], ['play-store', 6], ['gmail', 4], ['maps', 3]];

  function cycle(c) {
    const now = new Date(), start = new Date(now.getFullYear(), now.getMonth(), 1), end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {start, end, now};
  }
  function chart(c, u) {
    const t = T(), {start, end, now} = cycle(c);
    const days = (end - start) / 86400000 + 1, today = (now - start) / 86400000;
    const max = Math.max(u.usage, u.warning) * 1.2, W = 1000, H = 1000;
    const x = d => d / days * W, y = b => H - b / max * H;
    // A steady day-by-day use up to now.
    let d = `M0 ${H}`;
    for (let i = 0; i <= Math.ceil(today); i++) { const day = Math.min(i, today); d += ` L${x(day).toFixed(1)} ${y(u.usage * day / today).toFixed(1)}`; }
    d += ` L${x(today).toFixed(1)} ${H} Z`;
    const fmt = date => new Intl.DateTimeFormat(c.locale(), {month: 'short', day: 'numeric'}).format(date);
    const parts = MM.fileSize(c, u.warning).split(/\s+/), unit = parts.pop(), value = parts.join(' ');
    const label = t.t('data_usage_sweep_warning').split(/(\^[12])/).map(p => p === '^1' ? `<b>${c.safe(value)}</b>` : p === '^2' ? `<small>${c.safe(unit)}</small>` : `<em>${c.safe(p)}</em>`).join('');
    return `<div class="mmdu-chart"><div class="mmdu-plot np-st-data_grid_border"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><path d="${d}" fill="#009688"/></svg>
        <div class="mmdu-sweep" style="top:${(y(u.warning) / H * 100).toFixed(2)}%"><span class="mmdu-label">${label}</span><i class="np-st-data_sweep_warning_activated"></i></div></div>
      <div class="mmdu-dates"><span>${c.safe(fmt(start))}</span><span>${c.safe(fmt(end))}</span></div></div>`;
  }
  function render(c) {
    const t = T(), s = S(c), u = MM.system.dataUsage(c), {start, end} = cycle(c);
    let range;
    try { range = new Intl.DateTimeFormat(c.locale(), {month: 'short', day: 'numeric'}).formatRange(start, end); } catch { range = u.period; }
    const sw = (key, label, on) => `<button type="button" class="mmst-pref" data-action="mmdu-switch" data-key="${key}"><span class="mmst-texts"><span class="mmst-title">${c.safe(label)}</span></span><span class="mmst-widget"><i class="mmw-switch${on ? ' on' : ''}"><i class="mmw-thumb"></i></i></span></button>`;
    const label = id => id === 'gms' ? t.t('PrebuiltGmsCore/common_app_name') : id === 'android' ? t.t('process_kernel_label') : MM.appLabel(c, id);
    const icon = id => id === 'gms' ? 'assets/gms-ic_google.png' : id === 'android' ? 'assets/st-ic_power_system.png' : MM.appsData[id]?.icon;
    const max = SHARES[0][1];
    const apps = SHARES.filter(([id]) => id === 'gms' || id === 'android' || MM.appsData[id]).map(([id, share]) => `<button type="button" class="mmap-row" data-action="mmdu-app" data-app="${id}"><img src="${icon(id)}" alt=""><span class="mmap-texts"><span class="mmap-line"><span class="mmap-label">${c.safe(label(id))}</span><span class="mmap-size">${c.safe(MM.fileSize(c, u.usage * share / 100))}</span></span><span class="mmbt-bar"><i style="width:${(share / max * 100).toFixed(1)}%"></i></span></span></button>`).join('');
    return `<div class="mmst-list"><div class="mmdu-switches">${sw('mobile', t.t('data_usage_enable_mobile'), s.mobileData)}<i class="mmst-divider full"></i>${sw('limit', t.t('data_usage_disable_mobile_limit'), !!s.dataLimit)}</div><i class="mmst-divider full"></i>
      <div class="mmdu-cycle"><button type="button" class="mmdu-spinner" data-action="mmdu-cycle">${c.safe(range)}<i></i></button><span>${c.safe(MM.fileSize(c, u.usage))}</span></div>
      ${chart(c, u)}<div class="mmdu-disclaimer">${c.safe(t.t('data_usage_disclaimer'))}</div><i class="mmdu-pad"></i>${apps}</div>`;
  }
  MM.settingsScreens['data-usage'] = {
    title: () => T().t('data_usage_summary_title'),
    render,
    actions: c => MM.menu.button(c),
    action(c, name, el) {
      const t = T(), s = S(c);
      if (name === 'mm-menu') {
        c.menu([{label: t.t('data_usage_menu_restrict_background'), action: c => c.dialog({title: t.t('data_usage_restrict_background_title'), message: t.t('data_usage_restrict_background'),
            buttons: [{label: t.t('cancel')}, {label: t.t('okay'), action: c => { s.restrictBackground = true; c.save(); }}]})},
          {label: t.t('data_usage_menu_show_wifi'), action: c => MM.settingsGo(c, 'missing:com.android.settings.DataUsageSummary#wifi', t.t('data_usage_tab_wifi'))},
          {label: t.t('data_usage_menu_cellular_networks'), action: c => MM.settingsGo(c, 'missing:com.android.phone.MobileNetworkSettings', t.t('data_usage_menu_cellular_networks'))}]);
        return true;
      }
      if (name === 'mmdu-switch') {
        if (el.dataset.key === 'mobile') {
          if (s.mobileData) c.dialog({message: t.t('data_usage_disable_mobile'), buttons: [{label: t.t('cancel')}, {label: t.t('okay'), action: c => { s.mobileData = false; c.save(); MM.system.changed(c); c.render(); }}]});
          else { s.mobileData = true; c.save(); MM.system.changed(c); c.render(); }
        } else if (!s.dataLimit) {
          c.dialog({title: t.t('data_usage_limit_dialog_title'), message: t.t('data_usage_limit_dialog_mobile'), buttons: [{label: t.t('cancel')}, {label: t.t('okay'), action: c => { s.dataLimit = true; c.save(); c.render(); }}]});
        } else { s.dataLimit = false; c.save(); c.render(); }
        return true;
      }
      if (name === 'mmdu-app') {
        const id = el.dataset.app;
        MM.settingsGo(c, MM.appsData[id] ? `app:${id}` : 'missing:com.android.settings.DataUsageSummary#app', t.t('data_usage_app_summary_title'));
        return true;
      }
      if (name === 'mmdu-cycle') { MM.settingsGo(c, 'missing:com.android.settings.DataUsageSummary#CycleEditor', t.t('data_usage_cycle_editor_title')); return true; }
      return false;
    }
  };
})();
