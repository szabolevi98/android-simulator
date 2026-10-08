/* Android 2.3.6 Contacts: the list menu's Display options, Accounts and Import/Export, from the Nexus S GRK39F Contacts
   and Phone apps. ContactsPreferencesActivity (contacts_preferences.xml with display_options_phones_only, the sort and
   name-order rows of preference_with_more_button, the "Choose contacts to display" separator and the account's groups in
   display_group / display_child, Done / Revert on the ButtonBar); the Import/Export dialog (Import from SIM card, Import
   from / Export to USB storage — the image is a "nosdcard" build — and Share visible contacts); Phone's SimContacts
   (adn_list.xml, sim_import_list_entry.xml, Import all); ImportVCardActivity and ExportVCardActivity with their search,
   select, confirmation and ProgressDialogs, writing /sdcard/00001.vcf and on; ResolverActivity for sharing. The groups
   are the Google account's (their titles come from the server, so they stay as the account has them). Strings:
   gb-strings-contactsio.js (Contacts, framework) and gb-strings-phonenet.js (Phone). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const lookup = (group, lang, key) => { const entry = window.GBStrings?.[group]?.strings?.[key]; return entry ? entry[lang] ?? entry.en : key; };
  const fmt = (pattern, ...args) => { let next = 0; return String(pattern).replace(/%(?:(\d+)\$)?[sd]/g, (m, pos) => String(args[pos ? Number(pos) - 1 : next++] ?? '')); };
  const C = (ctx, key) => lookup('contactsio', ctx.lang, key);
  const P = (ctx, key) => lookup('phonenet', ctx.lang, key);

  // The SIM's ADN entries (demo contents, in the simulator's fictional 555 range).
  const SIM = [{name: 'Jordan Blake', phone: '202-555-0173'}, {name: 'Casey Quinn', phone: '202-555-0125'}, {name: 'Robin Hart', phone: '202-555-0161'}];
  // ExportVCardActivity: config_export_dir /sdcard, no prefix or suffix, vcf, indexes 1..99999 (five digits).
  const EXPORT_DIR = '/sdcard';
  const fileName = index => `${String(index).padStart(5, '0')}.vcf`;

  // ContactsPreferences: sort by given name, given name first; only_phones off. Groups sync by default (DEFAULT_SHOULD_SYNC)
  // and are hidden (DEFAULT_VISIBLE) except My Contacts, which the Google sync adapter shows.
  const prefs = data => ({onlyPhones: false, sortFamily: false, displayFamily: false, groups: {}, ...(data.gbContactPrefs || {})});
  function groups(data, lang, p = prefs(data)) {
    const people = data.contacts || [], grouped = new Set();
    const list = [{id: 'my', title: 'My Contacts', members: people.map(x => x.id)}, {id: 'starred', title: 'Starred in Android', members: people.filter(x => x.favorite).map(x => x.id)},
      ...(data.contactGroups || []).map(g => ({id: `g:${g.id}`, title: g.name, members: g.members || []}))];
    list.forEach(g => g.members.forEach(id => grouped.add(id)));
    list.push({id: 'ungrouped', title: lookup('contactsio', lang, 'display_ungrouped'), members: people.filter(x => !grouped.has(x.id)).map(x => x.id), ungrouped: true});
    return list.map(g => ({...g, sync: p.groups[g.id]?.sync ?? true, visible: p.groups[g.id]?.visible ?? g.id === 'my'}));
  }
  // StructuredName as the editor splits it; the alternative display name is "Family, Given".
  const split = name => { const parts = String(name || '').trim().split(/\s+/).filter(Boolean); return parts.length < 2 ? {given: parts[0] || '', family: ''} : {given: parts.slice(0, -1).join(' '), family: parts.at(-1)}; };
  function view(data, lang) {
    const p = prefs(data), shown = groups(data, lang, p).filter(g => g.sync && g.visible), ids = new Set(shown.flatMap(g => g.members));
    return {
      filter: people => people.filter(x => ids.has(x.id) && (!p.onlyPhones || x.phone)),
      name: person => { const n = split(person.name); return p.displayFamily && n.family ? `${n.family}, ${n.given}` : person.name; },
      key: person => { const n = split(person.name); return p.sortFamily && n.family ? `${n.family} ${n.given}` : person.name; }
    };
  }

  // ---- Pages -------------------------------------------------------------------------------------------------------
  const has = sub => sub === 'gbct-display' || sub === 'gbct-sim';
  function render(sub, ctx) {
    const {ui, data} = ctx;
    if (sub === 'gbct-display') {
      const d = ui.gbctDraft || (ui.gbctDraft = JSON.parse(JSON.stringify(prefs(data)))), list = groups(data, ctx.lang, d), synced = list.filter(g => g.sync);
      const check = on => `<img class="gbct-check" src="assets/gb-btn_check_${on ? 'on' : 'off'}.png" alt="">`;
      const more = (label, value, id) => `<button class="gbct-row gbct-more" data-action="gbct-dialog" data-id="${id}"><span><b>${e(C(ctx, label))}</b><small>${e(C(ctx, value))}</small></span><i></i></button>`;
      const open = ui.gbctExpanded !== false;
      const rows = `<button class="gbct-row gbct-phones" data-action="gbct-phones" role="checkbox" aria-checked="${d.onlyPhones}"><span><b>${e(C(ctx, 'showFilterPhones'))}</b><small>${e(C(ctx, 'showFilterPhonesDescrip'))}</small></span>${check(d.onlyPhones)}</button>` +
        more('display_options_sort_list_by', d.sortFamily ? 'display_options_sort_by_family_name' : 'display_options_sort_by_given_name', 'sort') +
        more('display_options_view_names_as', d.displayFamily ? 'display_options_view_family_name_first' : 'display_options_view_given_name_first', 'order') +
        `<div class="gbset-cat">${e(C(ctx, 'headerContactGroups'))}</div>` +
        `<button class="gbct-row gbct-account${open ? ' open' : ''}" data-action="gbct-expand" aria-expanded="${open}"><span><b class="large">${e(ctx.account)}</b><small>Google</small></span></button>` +
        (open ? synced.map(g => `<button class="gbct-row gbct-child" data-action="gbct-group" data-id="${e(g.id)}" data-gbct-hold="${e(g.id)}" role="checkbox" aria-checked="${g.visible}"><span><b>${e(g.title)}</b></span>${check(g.visible)}</button>`).join('') + `<button class="gbct-row gbct-child" data-action="gbct-dialog" data-id="sync-add"><span><b>${e(C(ctx, 'display_more_groups'))}</b></span></button>` : '');
      return `<div class="app-view gbct" data-no-translate><div class="gb-titlebar">${e(C(ctx, 'displayGroups'))}</div><div class="gbct-list">${rows}</div><div class="gbct-bar"><button data-action="gbct-done">${e(C(ctx, 'menu_done'))}</button><button data-action="gbct-revert">${e(C(ctx, 'menu_doNotSave'))}</button></div></div>`;
    }
    if (sub === 'gbct-sim') {
      const body = ui.gbctSimLoading ? `<p class="gbct-empty">${e(P(ctx, 'simContacts_emptyLoading'))}</p>` : SIM.length ? SIM.map((x, i) => `<button class="gbct-sim" data-action="gbct-sim-one" data-id="${i}" data-gbct-hold="sim:${i}">${e(x.name)}</button>`).join('') : `<p class="gbct-empty">${e(P(ctx, 'simContacts_empty'))}</p>`;
      return `<div class="app-view gbct" data-no-translate><div class="gb-titlebar">${e(P(ctx, 'simContacts_title'))}</div><div class="gbct-list">${body}</div></div>`;
    }
    return null;
  }
  const menu = (sub, ctx) => sub === 'gbct-sim' && !ctx.ui.gbctSimLoading ? [{action: 'gbct-sim-all', title: P(ctx, 'importAllSimEntries'), icon: 'ic_menu_add'}] : [];

  // ---- Dialogs -----------------------------------------------------------------------------------------------------
  // ProgressDialog STYLE_HORIZONTAL (alert_dialog_progress.xml): the bar, the percentage left and "n/max" right.
  const bar = (ctx, message) => { const [n, max] = ctx.ui.gbctProgress || [0, 1]; return `<div class="gbct-progress"><p>${e(message)}</p><i><b style="width:${max ? n / max * 100 : 0}%"></b></i><span><em>${Math.round(max ? n / max * 100 : 0)}%</em><em>${n}/${max}</em></span></div>`; };
  const stamp = time => { const d = new Date(time), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`; };
  function dialog(kind, ctx) {
    const {ui, data} = ctx, ok = C(ctx, 'ok'), cancel = C(ctx, 'cancel');
    if (kind === 'io') return {title: C(ctx, 'dialog_import_export'), items: [['sim', 'import_from_sim'], ['import', 'import_from_sdcard'], ['export', 'export_to_sdcard'], ['share', 'share_visible_contacts']].map(([id, key]) => ({action: 'gbct-io', id, title: C(ctx, key)})), buttons: [{action: 'close-overlay', title: cancel}]};
    if (kind === 'sort' || kind === 'order') {
      const d = ui.gbctDraft, keys = kind === 'sort' ? ['display_options_sort_by_given_name', 'display_options_sort_by_family_name'] : ['display_options_view_given_name_first', 'display_options_view_family_name_first'];
      return {title: C(ctx, kind === 'sort' ? 'display_options_sort_list_by' : 'display_options_view_names_as'), items: keys.map((key, i) => ({action: 'gbct-pick', id: `${kind}:${i}`, title: C(ctx, key)})), choice: 'single', selected: (kind === 'sort' ? d.sortFamily : d.displayFamily) ? 1 : 0, buttons: [{action: 'close-overlay', title: cancel}]};
    }
    if (kind === 'sync-add') {
      const unsynced = groups(data, ctx.lang, ui.gbctDraft).filter(g => !g.sync);
      return {title: C(ctx, 'dialog_sync_add'), items: unsynced.map(g => ({action: 'gbct-sync-add', id: g.id, title: g.title}))};
    }
    if (kind.startsWith('sync-remove:')) { const g = groups(data, ctx.lang, ui.gbctDraft).find(x => x.id === kind.slice(12)); return g ? {title: g.title, items: [{action: 'gbct-sync-remove', id: g.id, title: C(ctx, 'menu_sync_remove')}]} : null; }
    if (kind.startsWith('warn-remove:')) { const g = groups(data, ctx.lang, ui.gbctDraft).find(x => x.id === kind.slice(12)); return g ? {title: C(ctx, 'menu_sync_remove'), message: fmt(C(ctx, 'display_warn_remove_ungrouped'), g.title), buttons: [{action: 'gbct-sync-remove-ok', id: g.id, title: ok}, {action: 'close-overlay', title: cancel}]} : null; }
    if (kind.startsWith('sim-context:')) { const x = SIM[Number(kind.slice(12))]; return x ? {title: x.name, items: [{action: 'gbct-sim-one', id: kind.slice(12), title: P(ctx, 'importSimEntry')}]} : null; }
    if (kind === 'sim-progress') return {title: P(ctx, 'importAllSimEntries'), custom: bar(ctx, P(ctx, 'importingSimContacts')), cancel: 'noop', buttons: [{action: 'gbct-stop', title: P(ctx, 'cancel')}]};
    if (kind === 'searching') return {title: C(ctx, 'searching_vcard_title'), custom: `<div class="gbdlg-progress"><img src="assets/gb-spinner_white_48.png" alt=""><span>${e(C(ctx, 'searching_vcard_message'))}</span></div>`, cancel: 'noop'};
    if (kind === 'no-vcard') return {title: C(ctx, 'scanning_sdcard_failed_title'), icon: 'ic_dialog_alert', message: fmt(C(ctx, 'scanning_sdcard_failed_message'), C(ctx, 'fail_reason_no_vcard_file')), buttons: [{action: 'close-overlay', title: ok}]};
    if (kind === 'select-type') return {title: C(ctx, 'select_vcard_title'), items: ['import_one_vcard_string', 'import_multiple_vcard_string', 'import_all_vcard_string'].map((key, i) => ({action: 'gbct-type', id: String(i), title: C(ctx, key)})), choice: 'single', selected: ui.gbctType ?? 0, buttons: [{action: 'gbct-type-ok', title: ok}, {action: 'close-overlay', title: cancel}]};
    if (kind === 'select-one' || kind === 'select-multi') {
      const files = data.gbVcards || [], multi = kind === 'select-multi', chosen = ui.gbctFiles || [];
      return {title: C(ctx, 'select_vcard_title'), items: files.map((f, i) => ({action: 'gbct-file', id: String(i), title: f.name, summary: `(${stamp(f.time)})`, checked: chosen.includes(i)})), choice: multi ? 'multi' : 'single', selected: chosen[0] ?? 0, buttons: [{action: 'gbct-files-ok', title: ok}, {action: 'close-overlay', title: cancel}]};
    }
    if (kind === 'reading') return {title: C(ctx, 'reading_vcard_title'), custom: bar(ctx, C(ctx, 'reading_vcard_message')), cancel: 'noop'};
    if (kind === 'export-confirm') return {title: C(ctx, 'confirm_export_title'), message: fmt(C(ctx, 'confirm_export_message'), `${EXPORT_DIR}/${ui.gbctExportName}`), buttons: [{action: 'gbct-export-ok', title: ok}, {action: 'close-overlay', title: cancel}]};
    if (kind === 'exporting') return {title: C(ctx, 'exporting_contact_list_title'), custom: bar(ctx, fmt(C(ctx, 'exporting_contact_list_message'), `${EXPORT_DIR}/${ui.gbctExportName}`)), cancel: 'noop'};
    if (kind === 'export-failed') return {title: C(ctx, 'exporting_contact_failed_title'), message: fmt(C(ctx, 'exporting_contact_failed_message'), C(ctx, 'fail_reason_no_exportable_contact')), buttons: [{action: 'close-overlay', title: ok}]};
    // ResolverActivity for ACTION_SEND text/x-vcard: the apps that take it.
    if (kind === 'share') return {title: C(ctx, 'whichApplication'), items: [['bluetooth', 'Bluetooth', 'gb-app-bluetooth.png'], ['email', ctx.appName('email'), 'email.png'], ['gmail', ctx.appName('gmail'), 'gmail.png'], ['messaging', ctx.appName('messaging'), 'messaging.png']].map(([id, title, icon]) => ({action: 'gbct-share-to', id, title, icon}))};
    return null;
  }

  // ---- Actions -----------------------------------------------------------------------------------------------------
  const open = (ctx, kind) => { ctx.ui.gbctDialog = kind; ctx.ui.overlay = 'gb-dialog-gbct'; ctx.renderOverlay(); };
  const close = ctx => { ctx.ui.overlay = ''; ctx.renderOverlay(); };
  // A ProgressDialog stepping through n items, then done().
  function run(ctx, kind, total, step, done) {
    const {ui} = ctx, token = ui.gbctRun = (ui.gbctRun || 0) + 1;
    ui.gbctProgress = [0, total]; open(ctx, kind);
    const tick = () => {
      if (ui.gbctRun !== token) return;
      const [n] = ui.gbctProgress;
      if (n >= total) { ui.gbctRun = 0; close(ctx); done(); return; }
      step(n); ui.gbctProgress = [n + 1, total]; ctx.renderOverlay(); setTimeout(tick, 350);
    };
    setTimeout(tick, 350);
  }
  const nextId = data => Math.max(0, ...(data.contacts || []).map(x => Number(x.id) || 0)) + 1;
  const addContact = (ctx, person) => { const {data} = ctx; data.contacts = [...(data.contacts || []), {...person, id: nextId(data)}]; };
  function importFiles(ctx, indexes) {
    const files = (ctx.data.gbVcards || []).filter((f, i) => indexes.includes(i)), people = files.flatMap(f => f.contacts || []);
    run(ctx, 'reading', people.length, n => addContact(ctx, people[n]), () => { ctx.save(); ctx.render(); });
  }
  function startCompose(ctx, people, label) {
    const card = people.length === 1 ? `${people[0].name}.vcf` : `${label}.vcf`;
    ctx.shareVcard({name: card, size: `${Math.max(1, people.length)}KB`, vcard: true, count: people.length});
  }

  function handle(action, id, ctx) {
    const {ui, data} = ctx;
    switch (action) {
      case 'gbct-display': ui.gbctDraft = null; ui.gbctExpanded = true; ui.overlay = ''; ctx.renderOverlay(); ui.sub = 'gbct-display'; ctx.render(); return true;
      case 'gbct-io-menu': open(ctx, 'io'); return true;
      case 'gbct-accounts': close(ctx); ctx.openAccounts(); return true;
      case 'gbct-phones': ui.gbctDraft.onlyPhones = !ui.gbctDraft.onlyPhones; ctx.render(); return true;
      case 'gbct-expand': ui.gbctExpanded = ui.gbctExpanded === false; ctx.render(); return true;
      case 'gbct-group': { const g = (ui.gbctDraft.groups[id] ||= {}), cur = groups(data, ctx.lang, ui.gbctDraft).find(x => x.id === id); g.visible = !cur.visible; ctx.render(); return true; }
      case 'gbct-dialog': open(ctx, id); return true;
      case 'gbct-pick': { const [kind, i] = id.split(':'); ui.gbctDraft[kind === 'sort' ? 'sortFamily' : 'displayFamily'] = i === '1'; close(ctx); ctx.render(); return true; }
      case 'gbct-sync-add': (ui.gbctDraft.groups[id] ||= {}).sync = true; close(ctx); ctx.render(); return true;
      case 'gbct-sync-remove': {
        // SYNC_MODE_EVERYTHING: removing a group while the ungrouped contacts sync asks first and drops them too.
        const ungrouped = groups(data, ctx.lang, ui.gbctDraft).find(g => g.ungrouped);
        if (id !== 'ungrouped' && ungrouped.sync) { open(ctx, `warn-remove:${id}`); return true; }
        (ui.gbctDraft.groups[id] ||= {}).sync = false; close(ctx); ctx.render(); return true;
      }
      case 'gbct-sync-remove-ok': (ui.gbctDraft.groups[id] ||= {}).sync = false; (ui.gbctDraft.groups.ungrouped ||= {}).sync = false; close(ctx); ctx.render(); return true;
      case 'gbct-done': data.gbContactPrefs = ui.gbctDraft; ui.gbctDraft = null; ui.sub = ''; ctx.save(); ctx.render(); return true;
      case 'gbct-revert': ui.gbctDraft = null; ui.sub = ''; ctx.render(); return true;

      case 'gbct-io':
        close(ctx);
        if (id === 'sim') { ui.sub = 'gbct-sim'; ui.gbctSimLoading = true; ctx.render(); setTimeout(() => { ui.gbctSimLoading = false; if (ui.sub === 'gbct-sim') ctx.render(); }, 900); }
        if (id === 'import') {
          ui.gbctFiles = null; open(ctx, 'searching');
          setTimeout(() => {
            const files = data.gbVcards || [];
            if (!files.length) open(ctx, 'no-vcard');
            else if (files.length === 1) importFiles(ctx, [0]);
            else { ui.gbctType = 0; open(ctx, 'select-type'); }
          }, 1200);
        }
        if (id === 'export') {
          const used = new Set((data.gbVcards || []).map(f => f.name));
          let index = 1; while (used.has(fileName(index))) index++;
          ui.gbctExportName = fileName(index); open(ctx, (data.contacts || []).length ? 'export-confirm' : 'export-failed');
        }
        if (id === 'share') { const people = view(data, ctx.lang).filter(data.contacts || []); if (!people.length) { ctx.toast(C(ctx, 'share_error')); return true; } ui.gbctShare = people.map(x => x.id); open(ctx, 'share'); }
        return true;
      case 'gbct-share-one': { const person = (data.contacts || []).find(x => x.id === Number(id)); if (!person) return true; ui.gbctShare = [person.id]; open(ctx, 'share'); return true; }
      case 'gbct-share-to': {
        close(ctx);
        const people = (data.contacts || []).filter(x => (ui.gbctShare || []).includes(x.id));
        if (id === 'gmail') startCompose(ctx, people, 'contacts'); else ctx.unsupported();
        return true;
      }
      case 'gbct-export-ok': {
        const people = (data.contacts || []).map(({id: _, ...rest}) => rest), name = ui.gbctExportName;
        run(ctx, 'exporting', people.length, () => {}, () => { data.gbVcards = [...(data.gbVcards || []), {name, time: Date.now(), contacts: people}]; ctx.save(); });
        return true;
      }
      case 'gbct-type': ui.gbctType = Number(id); ctx.renderOverlay(); return true;
      case 'gbct-type-ok': {
        const files = data.gbVcards || [];
        if (ui.gbctType === 2) importFiles(ctx, files.map((f, i) => i));
        else { ui.gbctFiles = ui.gbctType === 1 ? [] : [0]; open(ctx, ui.gbctType === 1 ? 'select-multi' : 'select-one'); }
        return true;
      }
      case 'gbct-file': { const i = Number(id); if (ui.gbctDialog === 'select-multi') ui.gbctFiles = ui.gbctFiles.includes(i) ? ui.gbctFiles.filter(x => x !== i) : [...ui.gbctFiles, i]; else ui.gbctFiles = [i]; ctx.renderOverlay(); return true; }
      case 'gbct-files-ok': if ((ui.gbctFiles || []).length) importFiles(ctx, ui.gbctFiles); else close(ctx); return true;
      case 'gbct-stop': ui.gbctRun = 0; close(ctx); ctx.save(); ctx.render(); return true;

      // SimContacts: a tap imports that entry, Import all runs the progress dialog.
      case 'gbct-sim-one': { const x = SIM[Number(id)]; if (ui.overlay) close(ctx); if (x) { addContact(ctx, {...x}); ctx.save(); } return true; }
      case 'gbct-sim-all': close(ctx); run(ctx, 'sim-progress', SIM.length, n => addContact(ctx, {...SIM[n]}), () => { ctx.save(); ctx.render(); }); return true;
    }
    return false;
  }
  function hold(target, ctx) {
    if (target.startsWith('sim:')) open(ctx, `sim-context:${target.slice(4)}`);
    else if (ctx.ui.sub === 'gbct-display') open(ctx, `sync-remove:${target}`);
  }
  function back(ctx) {
    if (ctx.ui.sub === 'gbct-display') { ctx.ui.gbctDraft = null; ctx.ui.sub = ''; ctx.render(); return true; }
    if (ctx.ui.sub === 'gbct-sim') { ctx.ui.sub = ''; ctx.render(); return true; }
    return false;
  }

  window.GBContactsIO = {SIM, prefs, groups, view, has, render, menu, dialog, handle, hold, back, text: (lang, key) => lookup('contactsio', lang, key)};
})();
