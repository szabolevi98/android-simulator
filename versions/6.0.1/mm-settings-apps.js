/* Android 6.0.1 Settings: Apps (ManageApplications, LIST_TYPE_MAIN) and App info (InstalledAppDetails), Settings.apk
   MTC20K, as MM.settingsScreens.apps / app.
   - The list: ApplicationsState's FILTER_DOWNLOADED_AND_LAUNCHER, so the system apps with a launcher entry
   (mm-apps.js, one row per package), sorted by label; manage_applications_apps.xml with apps_filter_spinner.xml pinned
   above it (switchbar_background, the Spinner 64 dp in: All apps, Enabled and, when some app is off, Disabled);
   app_item.xml rows (72 dp at least, 16 dp padding, the 40 dp icon 16 dp before the Subhead label, the size in
   textColorSecondary at the end: Formatter.formatFileSize of the package's size, here the APK and its oat files, and
   "Disabled" under the label of an app that is off). manage_apps.xml: Configure apps (ic_settings_24dp, always shown),
   Show system / Hide system and Reset app preferences in the overflow.
   - App info: the installed_app_details.xml header (app_item with "version %1$s" under the label, then
   two_buttons_panel: Disable / Enable for a system app that is not part of the platform (Utils.isSystemPackage greys
   it for Settings and the platform-signed Downloads), Force stop enabled while the app has run), then Storage
   (storage_summary_format, Internal storage), Data usage (No data used), Permissions (the groups
   DefaultPermissionGrantPolicy grants the app's default roles, of those it requests, in ICU's ListFormatter; none:
   No permissions granted / requested), Notifications (Normal), Open by default (No defaults set), Battery and Memory
   (nothing used since the last charge / in the last 3 hours). Disabling asks app_disable_dlg_text and turns the
   package off: its launcher shortcuts and drawer entry go. */
(() => {
  'use strict';
  const T = () => MM.text('settings');
  const S = c => c.data.settings;

  // DefaultPermissionGrantPolicy.grantDefaultSystemHandlerPermissions for the 5X's handlers: the camera
  // (IMAGE_CAPTURE), the dialer, contacts (APP_CONTACTS), the SMS app, calendar (APP_CALENDAR), maps (APP_MAPS), email
  // (APP_EMAIL), the browser (APP_BROWSER), the gallery (APP_GALLERY), music (APP_MUSIC), the voice interaction service
  // (the Google app), the package verifier (Play Store); Settings runs as the system uid and holds what it asks for.
  const ROLES = {camera: ['camera', 'microphone', 'storage'], phone: ['phone', 'contacts', 'sms', 'microphone'], contacts: ['contacts', 'phone'],
    messenger: ['phone', 'contacts', 'sms'], calendar: ['calendar', 'contacts'], maps: ['location'], gmail: ['contacts'], chrome: ['location'],
    photos: ['storage'], 'play-music': ['storage'], search: ['contacts', 'calendar', 'microphone', 'phone', 'sms', 'location'],
    'play-store': ['storage', 'phone', 'sms'], settings: null};
  // Utils.isSystemPackage: signed with the platform key.
  const PLATFORM = ['settings', 'downloads'];
  const disabled = (c, id) => MM.appDisabled(c, id);
  const ids = c => {
    const seen = new Set(), collator = new Intl.Collator(c.locale(), {sensitivity: 'base'});
    return Object.keys(MM.appsData).filter(id => { const p = MM.appsData[id].pkg; if (seen.has(p)) return false; seen.add(p); return true; })
      .sort((a, b) => collator.compare(MM.appLabel(c, a), MM.appLabel(c, b)));
  };
  const size = (c, id) => MM.fileSize(c, MM.appsData[id].codeSize);

  function permissions(c, id) {
    const t = T(), a = MM.appsData[id], asked = a.permGroups || [];
    if (!asked.length) return t.t('runtime_permissions_summary_no_permissions_requested');
    const roles = ROLES[id] === null ? asked : ROLES[id] || [];
    const granted = asked.filter(g => roles.includes(g)).map(g => t.t(`framework/permgrouplab_${g}`));
    if (!granted.length) return t.t('runtime_permissions_summary_no_permissions_granted');
    const collator = new Intl.Collator(c.locale());
    granted.sort((x, y) => collator.compare(x, y));
    try { return new Intl.ListFormat(c.locale(), {type: 'conjunction'}).format(granted); } catch { return granted.join(', '); }
  }

  // -- the list ------------------------------------------------------------------------------------------------------
  const st = c => c.ui.apps || (c.ui.apps = {filter: 0});
  function filters(c) {
    const t = T(), list = [t.t('filter_all_apps'), t.t('filter_enabled_apps')];
    if (ids(c).some(id => disabled(c, id))) list.push(t.t('filter_apps_disabled'));
    return list;
  }
  function bar(c) {
    const f = filters(c), i = Math.min(st(c).filter, f.length - 1);
    return `<div class="mmst-spinbar"><button type="button" class="mmst-spinner" data-action="mmap-filter"><span>${c.safe(f[i])}</span><i></i></button></div>`;
  }
  function render(c) {
    const t = T(), i = Math.min(st(c).filter, filters(c).length - 1);
    const list = ids(c).filter(id => i === 0 || (i === 1 ? !disabled(c, id) : disabled(c, id)));
    if (!list.length) return `<div class="mmst-empty center">${c.safe(t.t('no_applications'))}</div>`;
    return `<div class="mmst-list">${list.map(id => `<button type="button" class="mmap-row" data-action="mmap-app" data-app="${id}"><img src="${MM.appsData[id].icon}" alt=""><span class="mmap-texts"><span class="mmap-line"><span class="mmap-label">${c.safe(MM.appLabel(c, id))}</span><span class="mmap-size">${c.safe(size(c, id))}</span></span>${disabled(c, id) ? `<span class="mmap-sub">${c.safe(t.t('disabled'))}</span>` : ''}</span></button>`).join('')}</div>`;
  }
  const actions = c => `<button type="button" class="mmst-ab-btn" data-action="mmap-advanced" aria-label="${c.safe(T().t('advanced_apps'))}"><img src="assets/st-ic_settings_24dp.svg" alt=""></button>${MM.menu.button(c)}`;

  MM.settingsScreens.apps = {
    title: () => T().t('applications_settings'),
    render, bar, actions,
    action(c, name, el) {
      const t = T();
      if (name === 'mmap-app') { MM.settingsGo(c, `app:${el.dataset.app}`, t.t('application_info_label')); return true; }
      if (name === 'mmap-advanced') { MM.settingsGo(c, 'xml:advanced_apps', t.t('advanced_apps')); return true; }
      if (name === 'mmap-filter') {
        const f = filters(c), cur = Math.min(st(c).filter, f.length - 1);
        c.dialog({items: f.map((label, i) => ({html: `<span class="mmst-choice"><i class="mmw-radio${i === cur ? ' on' : ''}"></i><span>${c.safe(label)}</span></span>`})),
          onItem: i => { st(c).filter = i; c.render(); }});
        return true;
      }
      if (name === 'mm-menu') {
        c.menu([{label: t.t('menu_show_system'), action: c => MM.settingsGo(c, 'missing:com.android.settings.applications.ManageApplications#showSystem', t.t('applications_settings'))},
          {label: t.t('reset_app_preferences'), action: c => c.dialog({title: t.t('reset_app_preferences_title'), message: t.t('reset_app_preferences_desc'),
            buttons: [{label: t.t('dlg_cancel')}, {label: t.t('reset_app_preferences_button'), action: c => { S(c).disabledApps = []; c.save(); c.render(); }}]})}]);
        return true;
      }
      return false;
    }
  };

  // -- App info ------------------------------------------------------------------------------------------------------
  function details(c, cur) {
    const t = T(), id = cur.screen.slice(4), a = MM.appsData[id];
    if (!a) return '';
    const off = disabled(c, id), running = (c.ui.recent || []).includes(id) && !off;
    const pref = (key, title, summary) => `<button type="button" class="mmst-pref" data-action="mmai-pref" data-key="${key}"><span class="mmst-texts"><span class="mmst-title">${c.safe(title)}</span><span class="mmst-summary">${c.safe(summary)}</span></span></button>`;
    return `<div class="mmst-list"><div class="mmai-head"><div class="mmap-row static"><img src="${a.icon}" alt=""><span class="mmap-texts"><span class="mmap-line"><span class="mmap-label">${c.safe(MM.appLabel(c, id))}</span></span><span class="mmap-sub">${c.safe(t.fmt('version_text', null, a.version))}</span></span></div>
      <div class="mmai-buttons"><button type="button" class="mmai-button" data-action="mmai-disable"${PLATFORM.includes(id) ? ' disabled' : ''}>${c.safe(t.t(off ? 'enable_text' : 'disable_text'))}</button><i></i><button type="button" class="mmai-button" data-action="mmai-stop"${running ? '' : ' disabled'}>${c.safe(t.t('force_stop'))}</button></div></div>
      ${pref('storage_settings', t.t('storage_settings'), t.fmt('storage_summary_format', null, MM.fileSize(c, a.codeSize), t.t('storage_type_internal')))}
      ${pref('data_settings', t.t('data_usage_summary_title'), t.t('no_data_usage'))}
      ${pref('permission_settings', t.t('permissions_label'), permissions(c, id))}
      ${pref('notification_settings', t.t('notifications_label'), t.t('notifications_enabled'))}
      ${pref('preferred_settings', t.t('launch_by_default'), t.t('launch_defaults_none'))}
      ${pref('battery', t.t('power_usage_summary_title'), t.t('no_battery_summary'))}
      ${pref('memory', t.t('memory_settings_title'), t.t('no_memory_use_summary'))}</div>`;
  }
  MM.settingsScreens.app = {
    title: () => T().t('application_info_label'),
    render: details,
    action(c, name, el, cur) {
      const t = T(), id = cur.screen.slice(4), s = S(c);
      if (name === 'mmai-disable') {
        if (disabled(c, id)) { s.disabledApps = (s.disabledApps || []).filter(x => x !== id); c.save(); c.render(); return true; }
        c.dialog({message: t.t('app_disable_dlg_text'), buttons: [{label: t.t('dlg_cancel')}, {label: t.t('app_disable_dlg_positive'), action: c => {
          s.disabledApps = [...new Set([...(s.disabledApps || []), id])]; c.ui.recent = (c.ui.recent || []).filter(x => x !== id); c.save(); c.render();
        }}]});
        return true;
      }
      if (name === 'mmai-stop') {
        c.dialog({title: t.t('force_stop_dlg_title'), message: t.t('force_stop_dlg_text'), buttons: [{label: t.t('dlg_cancel')}, {label: t.t('dlg_ok'), action: c => {
          c.ui.recent = (c.ui.recent || []).filter(x => x !== id); if (c.ui.thumbs) delete c.ui.thumbs[id]; c.render();
        }}]});
        return true;
      }
      if (name === 'mmai-pref') { MM.settingsGo(c, `missing:${el.dataset.key}`, ''); return true; }
      return false;
    }
  };
})();
