/* Android 2.1 Contacts, the rest of its menus (Contacts.odex):
   - ContactOptionsActivity "Options" (contact_options.xml): Ringtone (edit_contact_entry_ringtone.xml: medium label,
     small "Default" or the ringtone's title, the MoreButton) opens RINGTONE_PICKER with SHOW_DEFAULT and without
     SHOW_SILENT; a 1 dp divider; Incoming calls (edit_contact_entry_voicemail.xml) "Send calls directly to voicemail"
     with its CheckBox. Saved as the contact's custom_ringtone / send_to_voicemail.
   - DisplayGroupsActivity "Display options" (act_display_groups.xml): display_header.xml "Only contacts with phones"
     (the only_phones preference) and the list_separator "Choose contacts to display" (#bebebe, centred) over the
     accounts' groups — none on a phone without accounts; Done / Revert; Back saves too. With only_phones the contact
     list keeps the contacts that have a number ("No contacts with phone numbers.").
   - Import/Export (displayImportExportDialog: simple_list_item_1 rows on the light list): Import from SIM card (Phone's
     SimContacts: "Reading from SIM card…", then "No contacts on your SIM card."), Import from SD card
     (ImportVCardActivity: "No SD card" when it is unmounted; "Searching for vCard"; no file: "Scanning SD card failed
     (Reason: …)"; one file: read straight away; more: Import one / multiple / all vCard files, then the files with
     their dates) and Export to SD card (ExportVCardActivity: /sdcard/<the first free 00001…99999>.vcf, "Confirm
     export", then the "Exporting contact data" progress; with no contacts "Failed to export contact data").
     The vCard files live in c.data.vcards and keep the contacts' raw data.
   - Share (ViewContactActivity): ACTION_SEND text/x-vcard in a "Share contact via" chooser; only Gmail's compose
     takes it (Email's MessageCompose stays disabled without an account), so the chooser goes straight to it.
   - The dialer's Add to contacts is INSERT_OR_EDIT: ContactsListActivity ("Contacts") with create_new_contact.xml
     (sym_action_add, "Create new contact" medium bold) over the contacts; either opens the editor with the number. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const T = () => EC.text('contactsio');
  const t = k => T().t(k);
  const F = () => EC.text('framework');
  const contact = c => (c.data.contacts || []).find(x => x.id === c.ui.contactId);
  const progress = (c, title, text) => c.dialog({title, icon: null, cancelable: false, html: `<div class="ecsys-progress"><img class="ecsys-spinner" src="assets/fw-spinner_white_48.png" alt=""><span>${esc(text)}</span></div>`});
  const alert = (c, title, message) => c.dialog({title, icon: 'fw-ic_dialog_alert.png', message, buttons: [{label: F().t('ok')}]});
  const roundMore = '<span class="ecio-more"><img src="assets/ct-btn_circle_normal.png" alt=""><img src="assets/ct-ic_btn_round_more.png" alt=""></span>';
  const check = on => `<img class="ecio-check" src="assets/fw-btn_check_${on ? 'on' : 'off'}.png" alt="">`;
  const barButton = (action, label) => `<button type="button" class="ecui-button" data-action="${action}"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(label)}</span></button>`;

  // Options --------------------------------------------------------------------------------------------------------------------
  function options(c) {
    const p = contact(c);
    if (!p) return '';
    const tone = p.ringtone ? (EC.sounds?.list.ringtones[p.ringtone] || [t('default_ringtone')])[0] : t('default_ringtone');
    return c.window(t('contactOptionsTitle'), `<div class="ecio-list">
      <button type="button" class="ecio-row" data-action="ecio-ringtone"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span class="ecio-text"><span class="ecio-l1">${esc(t('label_ringtone'))}</span><span class="ecio-l2">${esc(tone)}</span></span>${roundMore}</button>
      <i class="ecio-div"></i>
      <button type="button" class="ecio-row" data-action="ecio-voicemail"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span class="ecio-text"><span class="ecio-l1">${esc(t('actionIncomingCall'))}</span><span class="ecio-l2">${esc(t('send_to_voicemail_checkbox'))}</span></span>${check(!!p.voicemail)}</button></div>`);
  }
  EC.register('contact-options', {
    title: 'Contacts',
    render: options,
    action(name, el, event, c) {
      const p = contact(c);
      if (!p || !name.startsWith('ecio-')) return false;
      if (name === 'ecio-voicemail') { p.voicemail = !p.voicemail; c.save(); c.render(); }
      if (name === 'ecio-ringtone') EC.ringtonePicker(c, {cat: 'ringtones', title: F().t('ringtone_picker_title'), current: p.ringtone ?? null, showDefault: true, showSilent: false, onPick: file => { p.ringtone = file; c.save(); }});
      return true;
    }
  });

  // Display options ------------------------------------------------------------------------------------------------------------
  const prefs = c => c.data.contactsPrefs ||= {only_phones: false};
  function display(c) {
    const on = c.ui.displayOnlyPhones ?? prefs(c).only_phones;
    return c.window(t('displayGroups'), `<div class="ecio-display"><div class="ecio-scroll">
      <button type="button" class="ecio-row ecio-header" data-action="ecio-only-phones"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span class="ecio-text"><span class="ecio-l1">${esc(t('showFilterPhones'))}</span><span class="ecio-l2">${esc(t('showFilterPhonesDescrip'))}</span></span>${check(on)}</button>
      <i class="ecio-div"></i><div class="ecio-sep npp-fw-dark_header_dither"><i class="ec-bg np-fw-dark_header_dither"></i><span>${esc(t('headerContactGroups'))}</span></div></div>
      <div class="ecce-bar-bottom">${barButton('ecio-display-done', EC.text('contactedit').t('menu_done'))}${barButton('ecio-display-revert', EC.text('contactedit').t('menu_doNotSave'))}</div></div>`);
  }
  const saveDisplay = c => { if (c.ui.displayOnlyPhones !== undefined) prefs(c).only_phones = c.ui.displayOnlyPhones; c.ui.displayOnlyPhones = undefined; c.save(); };
  EC.register('contacts-display', {
    title: 'Contacts',
    render: display,
    action(name, el, event, c) {
      if (name === 'ecio-only-phones') { c.ui.displayOnlyPhones = !(c.ui.displayOnlyPhones ?? prefs(c).only_phones); c.render(); return true; }
      if (name === 'ecio-display-done') { saveDisplay(c); c.back(); return true; }
      if (name === 'ecio-display-revert') { c.ui.displayOnlyPhones = undefined; c.back(); return true; }
      return false;
    },
    back(c) { saveDisplay(c); return false; }
  });
  EC.contactsOnlyPhones = c => !!c.data.contactsPrefs?.only_phones;

  // Import / Export ------------------------------------------------------------------------------------------------------------
  const vcards = c => c.data.vcards ||= [];
  function importExport(c) {
    const items = [['import_from_sim', () => c.open('sim-contacts')], ['import_from_sdcard', () => importSd(c)], ['export_to_sdcard', () => exportSd(c)]];
    c.dialog({title: t('dialog_import_export'), icon: null, rows: 'simple', items: items.map(([k]) => t(k)), onItem: i => setTimeout(() => items[i][1](), 0)});
  }
  const stamp = when => { const d = new Date(when), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`; };
  function addContacts(c, files) {
    const contacts = c.data.contacts ||= [];
    for (const f of files) for (const raws of f.contacts) {
      const p = {id: Math.max(0, ...contacts.map(x => x.id)) + 1, starred: false, times: 0};
      EC.contactModel.apply(p, structuredClone(raws)); contacts.push(p);
    }
    c.save(); c.render();
  }
  function read(c, files) {
    progress(c, t('reading_vcard_title'), t('reading_vcard_message'));
    setTimeout(() => { c.closeDialog(); addContacts(c, files); }, 1200);
  }
  function importSd(c) {
    if (c.ui.sdUnmounted) { alert(c, t('no_sdcard_title'), t('no_sdcard_message')); return; }
    progress(c, t('searching_vcard_title'), t('searching_vcard_message'));
    setTimeout(() => {
      c.closeDialog();
      const files = vcards(c);
      if (!files.length) { alert(c, t('scanning_sdcard_failed_title'), T().fmt('scanning_sdcard_failed_message', c.lang, t('fail_reason_no_vcard_file'))); return; }
      if (files.length === 1) { read(c, files); return; }
      // getSelectImportTypeDialog, then getVCardFileSelectDialog (single or multiple choice; "name (date)").
      let type = 0;
      const label = f => `${f.file} (${stamp(f.time)})`;
      c.dialog({title: t('select_vcard_title'), icon: null, items: ['import_one_vcard_string', 'import_multiple_vcard_string', 'import_all_vcard_string'].map(t), choice: 'single', checked: 0,
        onSelect: i => { type = i; },
        buttons: [{label: F().t('ok'), action: () => setTimeout(() => {
          if (type === 2) { read(c, files); return; }
          let picked = type === 0 ? 0 : [];
          c.dialog({title: t('select_vcard_title'), icon: null, items: files.map(label), choice: type === 0 ? 'single' : 'multi', checked: type === 0 ? 0 : [],
            onSelect: i => { if (type === 0) picked = i; else picked = picked.includes(i) ? picked.filter(x => x !== i) : [...picked, i]; },
            buttons: [{label: F().t('ok'), action: () => setTimeout(() => read(c, type === 0 ? [files[picked]] : picked.map(i => files[i])), 0)}, {label: F().t('cancel')}]});
        }, 0)}, {label: F().t('cancel')}]});
    }, 1000);
  }
  // getAppropriateFileName: config_export_dir /sdcard, "%05d" from config_export_file_min_index 1, extension vcf.
  function exportSd(c) {
    if (c.ui.sdUnmounted) { alert(c, t('no_sdcard_title'), t('no_sdcard_message')); return; }
    const taken = new Set(vcards(c).map(f => f.file));
    let n = 1;
    while (taken.has(`${String(n).padStart(5, '0')}.vcf`)) n++;
    const file = `${String(n).padStart(5, '0')}.vcf`, path = `/sdcard/${file}`;
    c.dialog({title: t('confirm_export_title'), icon: null, message: T().fmt('confirm_export_message', c.lang, path), buttons: [{label: F().t('ok'), action: () => setTimeout(() => {
      const list = c.data.contacts || [];
      if (!list.length) { alert(c, t('exporting_contact_failed_title'), T().fmt('exporting_contact_failed_message', c.lang, t('composer_has_no_exportable_contact'))); return; }
      // ProgressDialog STYLE_HORIZONTAL (alert_dialog_progress.xml): the bar, the percent and "n/total".
      const total = list.length;
      const bar = done => `<div class="ecio-progress"><div class="ecio-hbar"><i style="width:${done * 100 / total}%"></i></div><div class="ecio-nums"><span>${Math.round(done * 100 / total)}%</span><span>${done}/${total}</span></div></div>`;
      c.dialog({title: t('exporting_contact_list_title'), icon: null, cancelable: false, message: T().fmt('exporting_contact_list_message', c.lang, path), html: bar(0)});
      let done = 0;
      const step = () => {
        done++;
        const box = document.querySelector('.ecio-progress');
        if (box) box.outerHTML = bar(done);
        if (done < total) { setTimeout(step, 150); return; }
        vcards(c).push({file, time: Date.now(), contacts: list.map(p => structuredClone(EC.contactModel.raws(p)))});
        c.save(); setTimeout(() => c.closeDialog(), 200);
      };
      setTimeout(step, 300);
    }, 0)}, {label: F().t('cancel')}]});
  }
  EC.contactsIO = {importExport, share: c => c.open('gmail')};

  // Phone's SimContacts (ADNList): the SIM has no contacts.
  EC.register('sim-contacts', {
    title: 'Contacts',
    render: c => c.window(T().t('Phone/simContacts_title'), `<div class="ecsp-empty">${esc(T().t(c.ui.simLoading ? 'Phone/simContacts_emptyLoading' : 'Phone/simContacts_empty'))}</div>`),
    start(c) { c.ui.simLoading = true; setTimeout(() => { c.ui.simLoading = false; if (c.ui.view === 'sim-contacts') c.render(); }, 1000); }
  });

  // INSERT_OR_EDIT: pick a contact or create one, the number goes into the editor.
  function pickRender(c) {
    const list = (c.data.contacts || []).slice().sort((a, b) => a.name.localeCompare(b.name, c.locale()));
    const rows = list.map(p => `<button type="button" class="ecph-person" data-action="ecio-pick" data-id="${p.id}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span class="ecph-badge"><i class="ec-bg np-fw-quickcontact_badge_unpressed"></i><img src="assets/ct-ic_contact_list_picture.png" alt=""></span><span class="ecph-name">${esc(p.name)}</span></button><i class="ecph-div"></i>`).join('');
    return c.window(t('contactsList'), `<div class="ecph-list"><button type="button" class="ecio-create" data-action="ecio-create"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><img src="assets/ct-sym_action_add.png" alt=""><span>${esc(t('pickerNewContactHeader'))}</span></button><i class="ecph-div"></i>${rows}</div>`);
  }
  EC.register('contact-pick', {
    title: 'Contacts',
    render: pickRender,
    action(name, el, event, c) {
      if (name !== 'ecio-pick' && name !== 'ecio-create') return false;
      const phone = c.ui.pickPhone;
      c.back();
      EC.contactEdit.open(c, name === 'ecio-pick' ? Number(el.dataset.id) : null, {phone, add: true});
      return true;
    }
  });
  EC.contactPick = (c, phone) => { c.ui.pickPhone = phone; c.open('contact-pick'); };

  document.addEventListener('DOMContentLoaded', () => {
    const ctx = EC.context, base = ctx.open;
    ctx.open = (view, sub, opts) => { const fresh = ctx.ui.view !== view; const r = base(view, sub, opts); if (fresh && view === 'sim-contacts') { EC.module(view).start(ctx); ctx.render(); } return r; };
  });
})();
