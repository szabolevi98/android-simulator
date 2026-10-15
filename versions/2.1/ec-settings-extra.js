/* Android 2.1 Settings: Factory data reset (MasterClear) and Format SD card (MediaFormat).
   - Each is two pages in its activity: master_clear_primary.xml / media_format_primary.xml (the explanation, then a
     150 dp button 40 dp below it: Reset phone / Format SD card) and, after ConfirmLockPattern when an unlock pattern is
     in use ("Draw your unlock pattern" with the reason as footer), master_clear_final.xml / media_format_final.xml
     (Erase everything). master_clear_desc's <li> lines carry a BulletSpan(10).
   - Erase everything: the reset wipes the stored phone and starts it again from the boot; the format empties the SD
     card's pictures and videos (the Camera's shots) and goes back.
   - About phone's intents, each handled by the image's own app: System updates (SystemUpdater: "Your system is
     currently up to date."), Copyright (HtcCopyright's AlertActivity), License (SettingsLicenseActivity opens
     /system/etc/NOTICE.html.gz in HTMLViewer as "Open source licenses"), Terms and conditions (GoogleApps' "Google
     legal", offline: the fallback phone-legal URL for the locale), System tutorial (SetupWizard: "Learn how to use your
     Nexus One" — ro.product.model —, Skip / Begin; Begin starts the current input method's tutorial, LatinImeTutorial's
     com.google.android.voicesearch.tutorial: ec-tutorial.js).
   - Search settings (GlobalSearch): Search engine settings ("Settings for Google": EnhancedGoogleSearchProvider's Show
     web suggestions, Share with Google, Search history / Manage search history off with "No account configured"),
     Searchable items (the image's searchables with includeInGlobalSearch, by label) and Clear search shortcuts (none
     yet, so off). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const X = () => EC.text('settingsx');
  const t = k => X().t(k);
  const stack = c => c.ui.settingsStack;
  const button = (action, label) => `<button type="button" class="ecui-button ecsx-btn" data-action="${action}"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(label)}</span></button>`;
  // The lines that do not end in a colon are the <li> items.
  const bullets = text => text.split('\n').map(line => line.trim().endsWith(':') ? `<div>${esc(line)}</div>` : `<div class="ecsx-li">${esc(line)}</div>`).join('');
  const PAGES = {
    'master-clear': c => [t('master_clear_title'), bullets(t('master_clear_desc')), button('ecsx-mc-next', t('master_clear_button_text'))],
    'master-clear-final': c => [t('master_clear_title'), esc(t('master_clear_final_desc')), button('ecsx-mc-go', t('master_clear_final_button_text'))],
    'media-format': c => [t('media_format_title'), esc(t('media_format_desc')), button('ecsx-mf-next', t('media_format_button_text'))],
    'media-format-final': c => [t('media_format_title'), esc(t('media_format_final_desc')), button('ecsx-mf-go', t('media_format_final_button_text'))]
  };
  const show = (c, page) => { stack(c).push(page); c.render(); };
  EC.settingsTargets = {...EC.settingsTargets, MasterClear: c => show(c, 'master-clear'), MediaFormat: c => show(c, 'media-format')};
  document.addEventListener('DOMContentLoaded', () => {
    const m = EC.module('settings'), base = {render: m.render, action: m.action};
    m.render = c => {
      const page = PAGES[stack(c)?.at(-1)];
      if (!page) return base.render(c);
      const [title, text, btn] = page(c);
      return c.window(title, `<div class="ecsx-page"><div class="ecsx-text">${text}</div>${btn}</div>`);
    };
    m.action = (name, el, event, c) => {
      switch (name) {
        case 'ecsx-mc-next':
          EC.patternFlow.confirm(c, {header: t('master_clear_gesture_prompt'), footer: t('master_clear_gesture_explanation'), done: c2 => { stack(c2).pop(); show(c2, 'master-clear-final'); }});
          return true;
        case 'ecsx-mf-next':
          EC.patternFlow.confirm(c, {header: t('media_format_gesture_prompt'), footer: t('media_format_gesture_explanation'), done: c2 => { stack(c2).pop(); show(c2, 'media-format-final'); }});
          return true;
        case 'ecsx-mc-go': c.factoryReset(); return true;
        case 'ecsx-mf-go': c.data.photos = []; c.save(); stack(c).pop(); c.render(); return true;
      }
      return base.action(name, el, event, c);
    };
  });

  // About phone and Search settings ---------------------------------------------------------------------------------------
  const check = on => `<img class="ecpf-check" src="assets/fw-btn_check_${on ? 'on' : 'off'}.png" alt="">`;
  const pref = (action, title, summary, on, disabled, key = '') => `<button type="button" class="ecpf-row" data-action="${action}" data-key="${key}"${disabled ? ' disabled' : ''}><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span class="ecpf-text"><span class="ecpf-title">${esc(title)}</span>${summary ? `<span class="ecpf-summary">${esc(summary)}</span>` : ''}</span>${on === undefined ? '' : check(on)}</button><i class="ecpf-divider"></i>`;
  const cat = title => `<div class="ecpf-cat npp-fw-dark_header_dither"><i class="ec-bg np-fw-dark_header_dither"></i><span>${esc(title)}</span></div>`;
  const qsb = c => ({show_web_suggestions: true, use_location: false, sources: {}, ...c.data.qsb});
  const SOURCES = c => [['apps', t('ApplicationsProvider/search_label'), t('ApplicationsProvider/settings_description')], ['browser', t('Browser/bookmarks_search'), t('Browser/search_settings_description')],
    ['contacts', t('Contacts/contactsList'), t('Contacts/search_settings_description')], ['music', EC.apps.label('music'), t('Music/search_settings_description')], ['youtube', EC.apps.label('youtube'), '']]
    .sort((a, b) => a[1].localeCompare(b[1], c.locale()));
  const tutorialButton = (action, label) => `<button type="button" class="ecui-button" data-action="${action}"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(label)}</span></button>`;
  const PAGES2 = {
    'system-update': c => c.window(t('SystemUpdater/system_update_activity_title'), `<div class="ecsx-center">${esc(t('SystemUpdater/system_update_no_update_content_text'))}</div>`),
    licenses: c => c.window(t('settings_license_activity_title'), '<iframe class="ecsx-web" title=""></iframe>'),
    tutorial: c => {
      const lines = t('SetupWizard/tutorial_intro_message_generic').split('\n').map(l => l.trim());
      const body = lines.map((l, i) => !l ? '<br>' : i > 0 && i < lines.length - 1 ? `<div class="ecsx-li">${esc(l)}</div>` : `<div>${esc(l)}</div>`).join('');
      return `<div class="ecsx-tut"><div class="ecsx-tut-scroll"><div class="ecsx-tut-title">${esc(t('SetupWizard/tutorial_intro_title').split('^1').join('Nexus One'))}</div><i class="ecsx-tut-div"></i><div class="ecsx-tut-text">${body}</div></div>
        <div class="ecsx-tut-bar">${tutorialButton('ecsx-tut-skip', t('SetupWizard/skip_button_label'))}<span></span>${tutorialButton('ecsx-tut-begin', t('SetupWizard/begin_button_label'))}</div></div>`;
    },
    'search-settings': c => c.window(t('GlobalSearch/search_settings'), `<div class="ecpf-list">${cat(t('GlobalSearch/web_search_category_title'))}${pref('ecsx-qsb-engine', t('GlobalSearch/search_engine_settings'), X().fmt('GlobalSearch/search_engine_settings_summary_enabled', c.lang, t('EnhancedGoogleSearchProvider/search_label')))}
        ${cat(t('GlobalSearch/system_search_category_title'))}${pref('ecsx-qsb-sources', t('GlobalSearch/search_sources'), t('GlobalSearch/search_sources_summary'))}${pref('ecsx-none', t('GlobalSearch/clear_shortcuts'), t('GlobalSearch/clear_shortcuts_summary'), undefined, true)}</div>`),
    'search-sources': c => { const q = qsb(c); return c.window(t('GlobalSearch/search_sources'), `<div class="ecpf-list">${SOURCES(c).map(([id, label, desc]) => pref('ecsx-qsb-source', label, desc, q.sources[id] !== false, false, id)).join('')}</div>`); },
    'google-search': c => {
      const q = qsb(c);
      return c.window(t('EnhancedGoogleSearchProvider/google_search_settings'), `<div class="ecpf-list">${pref('ecsx-qsb-toggle', t('EnhancedGoogleSearchProvider/show_web_suggestions'), t(q.show_web_suggestions ? 'EnhancedGoogleSearchProvider/show_web_suggestions_summary_enabled' : 'EnhancedGoogleSearchProvider/show_web_suggestions_summary_disabled'), q.show_web_suggestions, false, 'show_web_suggestions')}
        ${pref('ecsx-qsb-toggle', t('EnhancedGoogleSearchProvider/use_location_title'), t('EnhancedGoogleSearchProvider/use_location_summary'), q.use_location, false, 'use_location')}${pref('ecsx-none', t('EnhancedGoogleSearchProvider/search_history'), t('EnhancedGoogleSearchProvider/search_history_summary_no_account'), true, true)}${pref('ecsx-none', t('EnhancedGoogleSearchProvider/manage_search_history'), t('EnhancedGoogleSearchProvider/manage_search_history_summary_no_account'), undefined, true)}</div>`);
    }
  };
  // HTMLViewer: the NOTICE file inflated (a server may already have done so), shown as a WebView shows it.
  async function licenses(c, root) {
    const frame = root.querySelector('.ecsx-web');
    if (!frame) return;
    try {
      let bytes = new Uint8Array(await (await fetch('assets/st-notice.html.gz')).arrayBuffer());
      if (bytes[0] === 0x1f && bytes[1] === 0x8b) bytes = new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
      frame.addEventListener('load', () => {
        const doc = frame.contentDocument, probe = document.createElement('i');
        probe.style.cssText = 'position:absolute;width:calc(100 * var(--dp))'; c.el.screen.append(probe);
        doc.documentElement.style.zoom = probe.offsetWidth / 100; probe.remove();
        const style = doc.createElement('style');
        style.textContent = "@font-face{font-family:DroidSans;src:url('fonts/DroidSans.ttf')}@font-face{font-family:DroidSans;font-weight:700;src:url('fonts/DroidSans-Bold.ttf')}body{font-family:DroidSans}";
        doc.head.append(style);
      }, {once: true});
      frame.srcdoc = new TextDecoder().decode(bytes).replace('<head>', `<head><base href="${location.href}">`);
    } catch { c.toast(t('settings_license_activity_unavailable')); }
  }
  const tosUrl = c => 'http://www.google.com/intl/%s/mobile/android/basic/phone-legal.html'.split('%s').join(c.locale().replace('-', '_').toLowerCase());
  EC.settingsActions = {...EC.settingsActions,
    'android.settings.SYSTEM_UPDATE_SETTINGS': c => show(c, 'system-update'),
    'android.settings.COPYRIGHT': c => c.dialog({title: t('HtcCopyright/settings_copyright_activity_title'), icon: null, message: t('HtcCopyright/settings_copyright_text').trim()}),
    'android.settings.LICENSE': c => show(c, 'licenses'),
    'android.settings.TERMS': c => c.dialog({title: t('GoogleApps/settings_tos_activity_title'), icon: null, message: X().fmt('GoogleApps/settings_tos_activity_unsuccessful_message', c.lang, tosUrl(c))}),
    'android.intent.action.SYSTEM_TUTORIAL': c => show(c, 'tutorial'),
    'android.search.action.SEARCH_SETTINGS': c => show(c, 'search-settings')
  };
  document.addEventListener('DOMContentLoaded', () => {
    const m = EC.module('settings'), base = {render: m.render, action: m.action, mount: m.mount};
    m.render = c => { const page = PAGES2[stack(c)?.at(-1)]; return page ? page(c) : base.render(c); };
    m.mount = (c, root) => { if (stack(c)?.at(-1) === 'licenses') licenses(c, root); base.mount?.(c, root); };
    m.action = (name, el, event, c) => {
      const q = (c.data.qsb = qsb(c));
      switch (name) {
        case 'ecsx-qsb-engine': show(c, 'google-search'); return true;
        case 'ecsx-qsb-sources': show(c, 'search-sources'); return true;
        case 'ecsx-qsb-source': q.sources = {...q.sources, [el.dataset.key]: q.sources[el.dataset.key] === false}; c.save(); c.render(); return true;
        case 'ecsx-qsb-toggle': q[el.dataset.key] = !q[el.dataset.key]; c.save(); c.render(); return true;
        case 'ecsx-tut-begin': stack(c).pop(); c.render(); c.open('system-tutorial'); return true;
        case 'ecsx-tut-skip': stack(c).pop(); c.render(); return true;
        case 'ecsx-none': return true;
      }
      return base.action(name, el, event, c);
    };
  });

  // User dictionary (UserDictionarySettings, a ListActivity over the UserDictionary provider): the words A–Z, or
  // user_dict_settings_empty_text; Menu: Add (ic_menu_add) → "Add to dictionary"; holding a word: Edit / Delete.
  const words = c => (c.data.userWords ||= []);
  function wordDialog(c, index) {
    const w = words(c), edit = index !== undefined;
    c.dialog({title: t(edit ? 'user_dict_settings_edit_dialog_title' : 'user_dict_settings_add_dialog_title'), icon: null,
      html: `<div class="ecpf-dlg"><span class="ecwf-edit ecsx-ud-field npp-fw-textfield_default"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><input class="ecwf-input" value="${esc(edit ? w[index] : '')}" autocomplete="off"></span></div>`,
      buttons: [{label: EC.text('framework').t('ok'), action: (c2, d, root) => {
        const v = (root.querySelector('input')?.value || '').trim();
        if (edit) w.splice(index, 1);
        if (v && !w.includes(v)) w.push(v);
        c.save(); c.render();
      }}, {label: EC.text('framework').t('cancel')}]});
  }
  PAGES2['user-dictionary'] = c => {
    const w = words(c).slice().sort((a, b) => a.localeCompare(b, c.locale()));
    return c.window(t('user_dict_settings_titlebar'), w.length ? `<div class="ecpf-list">${w.map(word => `<button type="button" class="ecsx-word" data-action="ecsx-word" data-word="${esc(word)}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span>${esc(word)}</span></button><i class="ecpf-divider"></i>`).join('')}</div>`
      : `<div class="ecsx-ud-empty">${esc(t('user_dict_settings_empty_text'))}</div>`);
  };
  EC.settingsTargets = {...EC.settingsTargets, UserDictionarySettings: c => show(c, 'user-dictionary')};
  document.addEventListener('DOMContentLoaded', () => {
    const m = EC.module('settings'), base = {menu: m.menu, mount: m.mount, action: m.action};
    m.menu = c => {
      if (stack(c)?.at(-1) !== 'user-dictionary') return base.menu(c);
      c.menu([{label: t('user_dict_settings_add_menu_title'), icon: 'fw-ic_menu_add.png', action: () => wordDialog(c)}]);
      return true;
    };
    // Holding a word opens its context menu (the word as title, Edit / Delete).
    m.mount = (c, root) => {
      base.mount?.(c, root);
      for (const el of root.querySelectorAll('.ecsx-word')) {
        let timer = 0;
        el.addEventListener('pointerdown', () => { timer = setTimeout(() => {
          c.suppressClick = Date.now() + 400;
          const index = words(c).indexOf(el.dataset.word);
          c.dialog({title: el.dataset.word, icon: null, items: [t('user_dict_settings_context_menu_edit_title'), t('user_dict_settings_context_menu_delete_title')],
            onItem: i => { if (i === 0) wordDialog(c, index); else { words(c).splice(index, 1); c.save(); c.render(); } }});
        }, 500); });
        for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) el.addEventListener(ev, () => clearTimeout(timer));
      }
    };
    m.action = (name, el, event, c) => name === 'ecsx-word' ? true : base.action(name, el, event, c);
  });
})();
