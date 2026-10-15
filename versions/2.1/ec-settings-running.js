/* Android 2.1 Settings › Applications › Running services (Settings.odex RunningServices).
   - running_services.xml: the list, "No running services" when empty, and a bar at the bottom (4 dp padding,
     colorForeground, textAppearanceSmallInverse): "Avail: <free>+<background> in <n>" (readAvailMem, MemFree + Cached,
     less ro.SECONDARY_SERVER_MEM 4096 pages from init.rc) and "Other: <size> in <n>".
   - State.update: the services ActivityManager reports that are started or have a client label, without the persistent
     processes (so nothing of Phone or system_server), grouped by process. Each process row (bg 0xff505050, no icon, not
     clickable) has the app's label, its PSS as formatShortFileSize, "Process: <name>"; under it its services
     (running_services_item.xml: the app's icon, 48 dp with 5 / 11 dp margins, the label in bold medium, the time since
     it started as DateUtils.formatElapsedTime, ticking each second; "Started by application: touch to stop", or
     "<client label>: touch to manage"). A service without a label of its own shows its class name.
   - onListItemClick: a started service asks "Stop service?" (Stop / Cancel), a bound one opens its client's control
     panel: InputMethodManagerService's INPUT_METHOD_SETTINGS (Language & keyboard), WallpaperManagerService's chooser of
     SET_WALLPAPER ("Change wallpaper").
   What runs here: the keyboard (LatinIMEWithVoice in com.android.inputmethod.voice, bound since boot), the live
   wallpaper (bound since boot or since it was set) and Music's MediaPlaybackService (MusicUtils.bindToService starts it;
   it stops 60 s after Music is left). Processes come in uid order, which follows the APK names. Memory sizes are fixed
   stand-ins. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const A = () => EC.text('appmgr');
  const t = k => A().t(k);
  const stack = c => c.ui.settingsStack;
  const L = (c, entry) => entry?.[c.lang] ?? entry?.en ?? '';
  const pkgOf = id => EC.packages.find(p => p.pkg === id);
  const MB = 1024 * 1024;
  // Live wallpaper id → package, process, service label.
  const WALLS = {
    nexus: ['com.android.wallpaper', 'LiveWallpapers/wallpaper_nexus'], grass: ['com.android.wallpaper', 'LiveWallpapers/wallpaper_grass'],
    galaxy: ['com.android.wallpaper', 'LiveWallpapers/wallpaper_galaxy'], water: ['com.android.wallpaper', 'LiveWallpapers/wallpaper_fall'],
    polarclock: ['com.android.wallpaper', 'LiveWallpapers/wallpaper_clock'], magicsmoke: ['com.android.magicsmoke', 'MagicSmokeWallpapers/wallpaper_magicsmoke'],
    waveform: ['com.android.musicvis', 'VisualizationWallpapers/wallpaper_vis2'], spectrum: ['com.android.musicvis', 'VisualizationWallpapers/wallpaper_vis3'],
    vu: ['com.android.musicvis', 'VisualizationWallpapers/wallpaper_vis4'], many: ['com.android.musicvis', 'VisualizationWallpapers/wallpaper_vis5']
  };
  const SIZE = {'com.android.wallpaper': 6.9, 'com.android.magicsmoke': 7.4, 'com.android.musicvis': 5.6, 'com.android.music': 3.6, 'com.android.inputmethod.voice': 4.7};

  function processes(c) {
    const boot = EC.bootAt || Date.now(), list = [];
    const add = (pkg, process, service) => {
      const p = pkgOf(pkg);
      let proc = list.find(x => x.process === process);
      if (!proc) list.push(proc = {pkg, process, apk: p?.apk || '', label: L(c, p?.label), icon: p?.icon, services: []});
      proc.services.push({...service, label: service.label || L(c, p?.label)});
    };
    const wp = c.data.wallpaper || {};
    if (wp.type === 'live' && WALLS[wp.id]) {
      const [pkg, name] = WALLS[wp.id];
      add(pkg, pkg, {id: 'wallpaper', label: EC.text('livewp').t(name), client: 'framework/wallpaper_binding_label', since: Math.max(boot, c.ui.wallpaperSince || 0)});
    }
    add('com.google.android.voicesearch', 'com.android.inputmethod.voice', {id: 'ime', label: EC.text('settings2').t('VoiceSearchWithKeyboard/english_ime_name'), client: 'framework/input_method_binding_label', since: boot});
    const music = c.ui.musicService;
    if (music && (c.ui.view === 'music' || Date.now() - music.seen < 60000)) add('com.android.music', 'com.android.music', {id: 'music', label: 'MediaPlaybackService', since: music.since});
    return list.sort((a, b) => a.apk.localeCompare(b.apk));
  }
  // DateUtils.formatElapsedTime.
  const elapsed = since => {
    const s = Math.max(0, Math.floor((Date.now() - since) / 1000)), pad = n => String(n).padStart(2, '0');
    return s >= 3600 ? `${Math.floor(s / 3600)}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}` : `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
  };

  function render(c) {
    const procs = processes(c), size = b => EC.fileSize(c, b, true);
    let rows = '';
    for (const p of procs) {
      rows += `<div class="ecrs-item ecrs-proc"><i class="ecrs-sep"></i><div class="ecrs-main"><span class="ecrs-text"><span class="ecrs-top"><b>${esc(p.label)}</b><small>${esc(size(SIZE[p.process] * MB))}</small></span><small>${esc(A().fmt('service_process_name', c.lang, p.process))}</small></span></div></div>`;
      p.services.forEach((s, i) => {
        const desc = s.client ? A().fmt('service_client_name', c.lang, t(s.client)) : t('service_started_by_app');
        rows += `${i ? '<i class="ecrs-div"></i>' : ''}<button type="button" class="ecrs-item" data-action="ecrs-service" data-id="${s.id}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><i class="ecrs-sep${i ? ' on' : ''}"></i><div class="ecrs-main"><img src="assets/${esc(p.icon || 'fw-sym_def_app_icon.png')}" alt=""><span class="ecrs-text"><span class="ecrs-top"><b>${esc(s.label)}</b><small class="ecrs-time" data-since="${s.since}">${elapsed(s.since)}</small></span><small>${esc(desc)}</small></span></div></button>`;
      });
    }
    // Background: the apps left since the phone started; Other: the foreground, visible and service processes.
    const opened = new Set((c.ui.recent || []).filter(v => v !== 'settings' && v !== 'home')).size;
    const bgCount = 4 + Math.min(opened, 11), bg = bgCount * 3.4 * MB;
    const other = 7 + procs.length, otherMem = (71.3 + procs.reduce((n, p) => n + SIZE[p.process], 0)) * MB;
    const bar = `<div class="ecrs-bar"><span>${esc(A().fmt('service_background_processes', c.lang, bgCount, size(52 * MB), size(bg)))}</span><span>${esc(A().fmt('service_foreground_processes', c.lang, other, size(otherMem)))}</span></div>`;
    return c.window(t('runningservices_settings_title'), `<div class="ecrs"><div class="ecrs-list">${rows || `<div class="ecrs-empty">${esc(t('no_running_services'))}</div>`}</div>${bar}</div>`, 'ecrs-win');
  }

  function click(c, id) {
    const proc = processes(c).find(p => p.services.some(s => s.id === id));
    if (!proc) return;
    if (id === 'ime') { stack(c).push('language_settings'); c.render(); return; }
    if (id === 'wallpaper') { if (EC.module('wallpaper-chooser')) c.overlay('wallpaper-chooser'); return; }
    c.dialog({title: t('confirm_stop_service'), icon: null, message: A().fmt('confirm_stop_service_msg', c.lang, proc.label),
      buttons: [{label: t('confirm_stop_stop'), action: () => { c.ui.musicService = null; c.render(); }}, {label: t('confirm_stop_cancel')}]});
  }

  // TimeTicker: the service times tick every second.
  setInterval(() => {
    for (const el of document.querySelectorAll('.ecrs-time[data-since]')) el.textContent = elapsed(Number(el.dataset.since));
  }, 1000);

  EC.settingsTargets = {...EC.settingsTargets, RunningServices: c => { stack(c).push('running-services'); c.render(); }};
  document.addEventListener('DOMContentLoaded', () => {
    const m = EC.module('settings'), base = {render: m.render, action: m.action};
    m.render = c => stack(c)?.at(-1) === 'running-services' ? render(c) : base.render(c);
    m.action = (name, el, event, c) => {
      if (name === 'ecrs-service') { click(c, el.dataset.id); return true; }
      return base.action(name, el, event, c);
    };
  });
})();
