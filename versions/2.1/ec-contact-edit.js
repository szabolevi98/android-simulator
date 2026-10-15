/* Android 2.1 Contacts editor: EditContactActivity (act_edit.xml) for the phone-only account, read from Contacts.odex.
   - With no account on the phone AddContactTask.selectAccount(null) builds the raw contact from FallbackSource and
     ensureKindExists puts in a name, a Phone and an Email row (types: getBestValidType, the first unused one: Home).
     Editing an existing contact only adds the name (and photo) when missing.
   - ContactEditorView (item_contact_editor.xml): the 64 dp header (4 dp #666666 bar, 5 dp gap, FallbackSource's
     ic_launcher_contacts 7 dp in, "Phone-only (unsynced) contact" in 24 sp from account_type_format, no account name),
     the 76 dp PhotoEditorView (btn_contact_picture with ic_menu_add_picture, 12 / 10 dp in), the name
     (GenericEditorView: Given name and Family name; prefix, middle, suffix and the phonetic names are optional, behind
     the More button; its minus button is there but invisible), then a KindSectionView per kind by weight: Phone (10),
     Email (15), IM (20), Postal address (25), Organization (30); and the secondary kinds behind "More" (a divider, the
     expander_ic_minimized / _maximized drawable 10 dp from the text, 64 dp high): Notes (110), Nickname (115), Website
     (120). Event (150) is not editable.
   - KindSectionView (item_kind_section.xml): a divider, the kind title (18 sp) with the plus button (btn_circle with
     ic_btn_round_plus; the whole header adds a row: EntityModifier.insertChild with the best valid type), its rows
     6 dp above the next section. GenericEditorView (item_generic_editor.xml): the 100 dp label button (btn_default, left
     aligned) for kinds with types, the fields 4 dp from it with their titles as hints (optional ones hidden while
     empty, the MoreButton then at the lower right), the MinusButton at the upper right. The label opens "Select label"
     (getValidTypes: every type, secondary ones too) and Custom… asks for "Custom label name" (EditText, capWords).
   - Phone numbers are formatted as typed (PhoneNumberFormattingTextWatcher).
   - ButtonBar: Done, Revert. Back saves too (onBackPressed → doSaveAction). Saving trims empty rows; anything left gives
     "Contact saved." (PersistTask); an empty new contact is dropped.
   - Menu (menu/edit.xml): Done, Revert, New contact (another raw contact from the same account below this one, joined
     with it), Delete contact (deleteConfirmation, or multipleContactDeleteConfirmation with more than one raw contact),
     Separate (only with more than one: splitConfirmation, then "Contacts separated") and Join (saves, then
     JoinContactActivity: title_bar_medium with ic_join, "Join contacts" and "Select the contact you want to join with
     <name>."; "Suggested contacts" — the same name, number or address — then "All contacts" when there are
     suggestions, else just the list; picking one joins them: "Contacts joined").
   Contacts stay one record each in c.data.contacts: their raw contacts in raws, and name / phone / phoneType / email
   for the lists, from the first raw contact that has them. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const T = () => EC.text('contactedit');
  const t = k => T().t(k);
  const F = () => EC.text('framework');
  const P = () => EC.text('contacts');

  // FallbackSource: the kinds, their types ([value, framework label, secondary, custom]) and fields ([column, hint,
  // input type, optional]).
  const PHONE = [[1, 'phoneTypeHome'], [2, 'phoneTypeMobile'], [3, 'phoneTypeWork'], [4, 'phoneTypeFaxWork', 1], [5, 'phoneTypeFaxHome', 1], [6, 'phoneTypePager', 1],
    [7, 'phoneTypeOther'], [0, 'phoneTypeCustom', 1, 1], [8, 'phoneTypeCallback', 1], [9, 'phoneTypeCar', 1], [10, 'phoneTypeCompanyMain', 1], [11, 'phoneTypeIsdn', 1],
    [12, 'phoneTypeMain', 1], [13, 'phoneTypeOtherFax', 1], [14, 'phoneTypeRadio', 1], [15, 'phoneTypeTelex', 1], [16, 'phoneTypeTtyTdd', 1], [17, 'phoneTypeWorkMobile', 1],
    [18, 'phoneTypeWorkPager', 1], [19, 'phoneTypeAssistant', 1, 1], [20, 'phoneTypeMms', 1]];
  const KINDS = [
    {id: 'phone', title: 'phoneLabelsGroup', types: PHONE, fields: [['value', 'phoneLabelsGroup', 'tel']]},
    {id: 'email', title: 'emailLabelsGroup', types: [[1, 'emailTypeHome'], [2, 'emailTypeWork'], [3, 'emailTypeOther'], [4, 'emailTypeMobile'], [0, 'emailTypeCustom', 1, 1]], fields: [['value', 'emailLabelsGroup', 'email']]},
    {id: 'im', title: 'imLabelsGroup', types: [[0, 'imProtocolAim'], [1, 'imProtocolMsn'], [2, 'imProtocolYahoo'], [3, 'imProtocolSkype'], [4, 'imProtocolQq'], [5, 'imProtocolGoogleTalk'],
      [6, 'imProtocolIcq'], [7, 'imProtocolJabber'], [-1, 'imProtocolCustom', 1, 1]], fields: [['value', 'imLabelsGroup', 'email']]},
    {id: 'postal', title: 'postalLabelsGroup', types: [[1, 'postalTypeHome'], [2, 'postalTypeWork'], [3, 'postalTypeOther'], [0, 'postalTypeCustom', 1, 1]],
      fields: [['street', 'postal_street', 'text'], ['pobox', 'postal_pobox', 'text', 1], ['neighborhood', 'postal_neighborhood', 'text', 1], ['city', 'postal_city', 'text'],
        ['region', 'postal_region', 'text'], ['postcode', 'postal_postcode', 'text'], ['country', 'postal_country', 'text', 1]]},
    {id: 'org', title: 'organizationLabelsGroup', types: [[1, 'orgTypeWork'], [2, 'orgTypeOther'], [0, 'orgTypeCustom', 1, 1]], fields: [['company', 'ghostData_company', 'text'], ['title', 'ghostData_title', 'text']]},
    {id: 'note', title: 'label_notes', secondary: true, fields: [['value', 'label_notes', 'text']]},
    {id: 'nickname', title: 'nicknameLabelsGroup', secondary: true, fields: [['value', 'nicknameLabelsGroup', 'text']]},
    {id: 'website', title: 'websiteLabelsGroup', secondary: true, fields: [['value', 'websiteLabelsGroup', 'url']]}
  ];
  const NAME = [['prefix', 'name_prefix', 1], ['given', 'name_given'], ['middle', 'name_middle', 1], ['family', 'name_family'], ['suffix', 'name_suffix', 1],
    ['pgiven', 'name_phonetic_given', 1], ['pmiddle', 'name_phonetic_middle', 1], ['pfamily', 'name_phonetic_family', 1]];
  const kindOf = id => KINDS.find(k => k.id === id);
  const typeOf = (kind, value) => kind.types?.find(([v]) => v === value);
  const typeLabel = (kindId, entry) => {
    const kind = kindOf(kindId), type = typeOf(kind, entry.type);
    if (type?.[3] && entry.label) return entry.label;
    return type ? t(`framework/${type[1]}`) : P().t('unknown');
  };
  const filled = entry => Object.entries(entry).some(([k, v]) => !['type', 'label'].includes(k) && String(v ?? '').trim());

  // The legacy records (and the made-up people): name, phone with phoneType 0-3 (home, mobile, work, other), email.
  const LEGACY_PHONE = [1, 2, 3, 7];
  function split(name) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    return parts.length < 2 ? {given: parts[0] || ''} : {given: parts.slice(0, -1).join(' '), family: parts.at(-1)};
  }
  function raws(p) {
    if (p?.raws) return p.raws;
    if (!p) return [];
    return [{name: split(p.name), phone: p.phone ? [{type: LEGACY_PHONE[p.phoneType ?? 1] ?? 7, value: p.phone}] : [], email: p.email ? [{type: 3, value: p.email}] : []}];
  }
  // NameSplitter.join, then the display name sources the provider falls back to: nickname, organization, phone, email.
  function displayName(list) {
    for (const r of list) {
      const n = r.name || {}, main = [n.prefix, n.given, n.middle, n.family].map(v => String(v || '').trim()).filter(Boolean).join(' ');
      if (main) return n.suffix?.trim() ? `${main}, ${n.suffix.trim()}` : main;
    }
    const first = kind => list.flatMap(r => r[kind] || []).find(filled);
    const nick = first('nickname'), org = first('org'), phone = first('phone'), email = first('email');
    return nick?.value || org?.company || org?.title || phone?.value || email?.value || '';
  }
  // Writes the raw contacts back into the record the lists use.
  function apply(p, list) {
    p.raws = list;
    p.name = displayName(list);
    const phone = list.flatMap(r => r.phone || []).find(filled), email = list.flatMap(r => r.email || []).find(filled);
    p.phone = phone ? phone.value : ''; p.phoneType = phone ? Math.max(0, LEGACY_PHONE.indexOf(phone.type)) : 1;
    if (phone && !LEGACY_PHONE.includes(phone.type)) p.phoneType = 3;
    p.email = email ? email.value : '';
  }
  // A contact's photo (the first raw contact's that has one; ContactsProvider's photo_id) as CSS: the picture, cropped.
  function photoCss(photo) {
    const {x = 0, y = 0, w = 1, h = 1} = photo.crop || {};
    return `background-image:url('${EC.media.url(photo, 160)}');background-size:${100 / w}% ${100 / h}%;background-position:${w < 1 ? x / (1 - w) * 100 : 0}% ${h < 1 ? y / (1 - h) * 100 : 0}%`;
  }
  const photoOf = p => p && raws(p).find(r => r.photo)?.photo;
  EC.contactModel = {KINDS, raws, displayName, typeLabel, apply, photoCss, photoOf};

  // EntityModifier.insertChild: getBestValidType, the first type no row uses yet (else the last one).
  function bestType(kind, rows) {
    if (!kind.types) return undefined;
    const valid = kind.types.filter(type => !type[2]);
    return (valid.find(([v]) => !rows.some(r => r.type === v)) || valid.at(-1))[0];
  }
  function insertChild(raw, kindId) {
    const kind = kindOf(kindId), rows = raw[kindId] ||= [];
    const entry = Object.fromEntries(kind.fields.map(([col]) => [col, '']));
    if (kind.types) entry.type = bestType(kind, rows);
    rows.push(entry);
  }
  const newRaw = () => { const raw = {name: {}}; insertChild(raw, 'phone'); insertChild(raw, 'email'); return raw; };

  // State: c.ui.ce = {id, raws, more, open: {key: true}} (open: name editors and rows whose optional fields show).
  function open(c, id, extras = {}) {
    const p = id != null ? (c.data.contacts || []).find(x => x.id === id) : null;
    // parseExtras puts a given number in a phone row of its own (before ensureKindExists on a new contact).
    const list = p ? structuredClone(raws(p)) : [{name: {}}];
    for (const r of list) r.name ||= {};
    if (extras.phone) { insertChild(list[0], 'phone'); list[0].phone.at(-1).value = EC.formatNumber(extras.phone); }
    if (!p) { if (!list[0].phone?.length) insertChild(list[0], 'phone'); insertChild(list[0], 'email'); }
    c.ui.ce = {id: p ? p.id : null, raws: list, more: false, open: {}};
    c.open('contact-edit');
    c.el.viewport.querySelector('.ecce-scroll')?.scrollTo(0, 0);
  }

  // Rendering --------------------------------------------------------------------------------------------------------------
  const roundImgs = icon => `<img class="n" src="assets/ct-btn_circle_normal.png" alt=""><img class="p" src="assets/ct-btn_circle_pressed.png" alt=""><img class="i" src="assets/ct-ic_btn_round_${icon}.png" alt="">`;
  const round = (action, icon, data = '', hidden = false) => `<button type="button" class="ecce-round${hidden ? ' hidden' : ''}" data-action="${action}" ${data}>${roundImgs(icon)}</button>`;
  const field = (path, hint, type, value) => `<span class="ecwf-edit ecce-field npp-fw-textfield_default"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><input class="ecwf-input" type="${type === 'tel' ? 'tel' : type}"${type === 'tel' ? ' data-ime="phone"' : ''} data-path="${path}" value="${esc(value)}" placeholder="${esc(hint)}" autocomplete="off"></span>`;
  function editor(c, ri, kindId, i, entry) {
    const kind = kindOf(kindId), key = `${ri}.${kindId}.${i}`, opened = c.ui.ce.open[key];
    const shown = kind.fields.filter(([col, , , optional]) => !optional || opened || String(entry[col] ?? '').trim());
    const hidden = shown.length < kind.fields.length;
    const label = kind.types ? `<button type="button" class="ecui-button ecce-label" data-action="ecce-label" data-key="${key}"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(typeLabel(kindId, entry))}</span></button>` : '';
    return `<div class="ecce-editor">${label}<div class="ecce-fields">${shown.map(([col, hint, type]) => field(`${key}.${col}`, t(hint), type, entry[col])).join('')}</div>
      <div class="ecce-side">${round('ecce-delete', 'minus', `data-key="${key}"`)}${hidden ? round('ecce-more', 'more', `data-key="${key}"`) : ''}</div></div>`;
  }
  function nameEditor(c, ri, raw) {
    const opened = c.ui.ce.open[`${ri}.name`];
    const shown = NAME.filter(([col, , optional]) => !optional || opened || String(raw.name[col] ?? '').trim());
    return `<div class="ecce-editor ecce-name"><div class="ecce-fields">${shown.map(([col, hint]) => field(`${ri}.name.${col}`, t(hint), 'text', raw.name[col])).join('')}</div>
      <div class="ecce-side">${round('', 'minus', '', true)}${shown.length < NAME.length ? round('ecce-more', 'more', `data-key="${ri}.name"`) : ''}</div></div>`;
  }
  const section = (c, ri, raw, kind) => `<div class="ecce-kind"><i class="ecpf-divider"></i><button type="button" class="ecce-kind-head" data-action="ecce-add" data-key="${ri}.${kind.id}"><span>${esc(t(kind.title))}</span><i class="ecce-round">${roundImgs('plus')}</i></button>
    ${(raw[kind.id] || []).length ? `<div class="ecce-rows">${raw[kind.id].map((entry, i) => editor(c, ri, kind.id, i, entry)).join('')}</div>` : ''}</div>`;
  function contactEditor(c, ri, raw) {
    const more = c.ui.ce.more;
    return `<div class="ecce-raw"><div class="ecce-header"><i class="ecce-bar"></i><img class="ecce-hicon" src="assets/ct-ic_launcher_contacts.png" alt=""><span class="ecce-account">${esc(T().fmt('account_type_format', c.lang, t('account_phone')))}</span><i class="ecpf-divider ecce-hdiv"></i></div>
      <div class="ecce-photo-row"><button type="button" class="ecce-photo npp-ct-contact_picture_border_normal" data-action="ecce-photo" data-key="${ri}"><i class="ec-bg np-ct-contact_picture_border_normal"></i><i class="ec-bg ec-pressed np-ct-contact_picture_border_pressed"></i>${raw.photo ? `<span class="ecce-photo-img" style="${photoCss(raw.photo)}"></span>` : '<img src="assets/ct-ic_menu_add_picture.png" alt="">'}</button></div>
      ${nameEditor(c, ri, raw)}
      ${KINDS.filter(k => !k.secondary).map(k => section(c, ri, raw, k)).join('')}
      <i class="ecpf-divider"></i><button type="button" class="ecce-more-head" data-action="ecce-secondary"><img src="assets/fw-expander_ic_${more ? 'maximized' : 'minimized'}.9.png" alt=""><span>${esc(t('edit_secondary_collapse'))}</span></button>
      ${more ? KINDS.filter(k => k.secondary).map(k => section(c, ri, raw, k)).join('') : ''}</div>`;
  }
  const barButton = (action, label) => `<button type="button" class="ecui-button" data-action="${action}"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(label)}</span></button>`;
  function render(c) {
    const ce = c.ui.ce;
    if (!ce) return '';
    return c.window(t('editContactDescription'), `<div class="ecce"><div class="ecce-scroll">${ce.raws.map((raw, ri) => contactEditor(c, ri, raw)).join('')}</div>
      <div class="ecce-bar-bottom">${barButton('ecce-done', t('menu_done'))}${barButton('ecce-revert', t('menu_doNotSave'))}</div></div>`);
  }
  function mount(c, root) {
    for (const input of root.querySelectorAll('.ecce input[data-path]')) {
      input.addEventListener('input', () => {
        const [ri, kindId, ...rest] = input.dataset.path.split('.'), raw = c.ui.ce.raws[Number(ri)];
        if (kindId === 'name') raw.name[rest[0]] = input.value;
        else {
          const [i, col] = rest;
          let value = input.value;
          if (kindId === 'phone') { const formatted = EC.formatNumber(value.replace(/-/g, '')); if (/^[\d-]*$/.test(value) && formatted !== value) { value = formatted; input.value = value; } }
          raw[kindId][Number(i)][col] = value;
        }
      });
    }
  }

  // Saving -------------------------------------------------------------------------------------------------------------------
  // EntityModifier.trimEmpty: rows without values go; a raw contact left with nothing goes too.
  function trimmed(list) {
    return list.map(r => {
      const out = {name: Object.fromEntries(Object.entries(r.name || {}).filter(([, v]) => String(v ?? '').trim()))};
      for (const kind of KINDS) { const rows = (r[kind.id] || []).filter(filled); if (rows.length) out[kind.id] = rows; }
      if (r.photo) out.photo = r.photo;
      return out;
    }).filter(r => Object.keys(r.name).length || r.photo || KINDS.some(k => r[k.id]));
  }
  // Returns the saved contact (or null when there was nothing to keep). Saving for Join says nothing (SAVE_MODE_JOIN).
  function persist(c, quiet = false) {
    const ce = c.ui.ce, list = trimmed(ce.raws), contacts = c.data.contacts ||= [];
    let p = ce.id != null ? contacts.find(x => x.id === ce.id) : null;
    if (!list.length) {
      if (p) { c.data.contacts = contacts.filter(x => x !== p); c.save(); }
      return null;
    }
    if (!p) { p = {id: Math.max(0, ...contacts.map(x => x.id)) + 1, starred: false, times: 0}; contacts.push(p); ce.id = p.id; }
    apply(p, list);
    c.save();
    if (!quiet) c.toast(t('contactSavedToast'));
    return p;
  }
  function finish(c) { c.ui.ce = null; c.back(); }
  function save(c) { persist(c); finish(c); }

  // Dialogs ------------------------------------------------------------------------------------------------------------------
  function labelDialog(c, key) {
    const [ri, kindId, i] = key.split('.'), kind = kindOf(kindId), entry = c.ui.ce.raws[Number(ri)][kindId][Number(i)];
    const types = kind.types;
    c.dialog({title: t('selectLabel'), icon: null, rows: 'simple', items: types.map(type => t(`framework/${type[1]}`)), onItem: n => {
      const [value, , , custom] = types[n];
      if (!custom) { entry.type = value; delete entry.label; c.render(); return; }
      setTimeout(() => c.dialog({title: t('customLabelPickerTitle'), icon: null,
        html: `<div class="ecce-dlg"><span class="ecwf-edit npp-fw-textfield_default"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><input class="ecwf-input" autocapitalize="words" autocomplete="off"></span></div>`,
        buttons: [{label: F().t('ok'), action: (c2, d, root) => { const text = root.querySelector('input')?.value.trim(); if (text) { entry.type = value; entry.label = text; } c.render(); }}, {label: F().t('cancel')}]}), 0);
    }});
  }
  function deleteContact(c) {
    const ce = c.ui.ce;
    c.dialog({title: P().t('deleteConfirmation_title'), icon: 'fw-ic_dialog_alert.png', message: ce.raws.length > 1 ? t('multipleContactDeleteConfirmation') : P().t('deleteConfirmation'),
      buttons: [{label: F().t('ok'), action: () => {
        if (ce.id != null) c.data.contacts = (c.data.contacts || []).filter(x => x.id !== ce.id);
        c.save(); finish(c);
        if (c.ui.view === 'contact-view') c.back();   // ViewContactActivity closes when its contact is gone
      }}, {label: F().t('cancel')}]});
  }
  function separate(c) {
    c.dialog({title: t('splitConfirmation_title'), icon: 'fw-ic_dialog_alert.png', message: t('splitConfirmation'), buttons: [{label: F().t('ok'), action: () => {
      const ce = c.ui.ce, list = trimmed(ce.raws), contacts = c.data.contacts ||= [];
      const p = ce.id != null ? contacts.find(x => x.id === ce.id) : null;
      list.forEach((raw, i) => {
        const target = i === 0 && p ? p : (() => { const q = {id: Math.max(0, ...contacts.map(x => x.id)) + 1, starred: false, times: 0}; contacts.push(q); return q; })();
        apply(target, [raw]);
      });
      c.save(); c.toast(t('contactsSplitMessage')); finish(c);
    }}, {label: F().t('cancel')}]});
  }

  // JoinContactActivity: suggestions are the contacts with the same name, number or email address.
  function join(c) {
    const p = persist(c, true);
    if (!p) return;
    c.ui.join = {id: p.id, all: false};
    c.open('contact-join');
  }
  const digits = n => String(n || '').replace(/\D/g, '');
  function joinRender(c) {
    const me = (c.data.contacts || []).find(x => x.id === c.ui.join?.id);
    if (!me) return '';
    const others = (c.data.contacts || []).filter(x => x !== me).sort((a, b) => a.name.localeCompare(b.name, c.locale()));
    const mine = raws(me), myPhones = mine.flatMap(r => r.phone || []).map(x => digits(x.value)).filter(Boolean), myMails = mine.flatMap(r => r.email || []).map(x => x.value.toLowerCase());
    const suggested = others.filter(o => o.name.toLowerCase() === me.name.toLowerCase() || raws(o).some(r => (r.phone || []).some(x => myPhones.includes(digits(x.value))) || (r.email || []).some(x => myMails.includes(x.value.toLowerCase()))));
    const row = o => `<button type="button" class="ecph-person" data-action="ecce-join-pick" data-id="${o.id}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span class="ecph-badge"><i class="ec-bg np-fw-quickcontact_badge_unpressed"></i><img src="assets/ct-ic_contact_list_picture.png" alt=""></span><span class="ecph-name">${esc(o.name)}</span></button><i class="ecph-div"></i>`;
    const sep = key => `<div class="ecph-section"><i class="ec-bg np-fw-dark_header"></i><span>${esc(t(key))}</span></div>`;
    let list;
    if (!suggested.length) list = others.map(row).join('');
    else list = sep('separatorJoinAggregateSuggestions') + suggested.map(row).join('') + (c.ui.join.all ? sep('separatorJoinAggregateAll') + others.map(row).join('')
      : `<button type="button" class="ecce-showall" data-action="ecce-join-all"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span>${esc(t('showAllContactsJoinItem'))}</span></button><i class="ecph-div"></i>`);
    return `<div class="ecce-join"><div class="ecce-join-head"><i class="ec-bg np-fw-title_bar_medium"></i><img src="assets/ct-ic_join.png" alt=""><span><b>${esc(t('titleJoinContactDataWith'))}</b><small>${esc(T().fmt('blurbJoinContactDataWith', c.lang, me.name))}</small></span></div><div class="ecph-list">${list}</div></div>`;
  }

  EC.contactEdit = {open};
  EC.register('contact-edit', {
    title: 'Contacts',
    render, mount,
    action(name, el, event, c) {
      if (!name.startsWith('ecce-') || !c.ui.ce) return false;
      const ce = c.ui.ce, [ri, kindId, i] = (el.dataset.key || '').split('.');
      switch (name) {
        case 'ecce-done': save(c); break;
        case 'ecce-revert': finish(c); break;
        case 'ecce-secondary': ce.more = !ce.more; c.render(); break;
        case 'ecce-add': insertChild(ce.raws[Number(ri)], kindId); c.render(); break;
        case 'ecce-delete': ce.raws[Number(ri)][kindId].splice(Number(i), 1); c.render(); break;
        case 'ecce-more': ce.open[el.dataset.key] = true; c.render(); break;
        case 'ecce-label': labelDialog(c, el.dataset.key); break;
        case 'ecce-photo': {
          // PhotoListener.onRequest: no photo yet → the picture picker with a 1:1 crop (getPhotoPickIntent); with one,
          // createPhotoDialog: Use this photo, Remove icon, Change icon.
          const raw = ce.raws[Number(ri)], pick = () => EC.galleryPick(c, {crop: true, onPick: p => { raw.photo = {seed: p.seed, effect: p.effect, wb: p.wb, crop: p.crop}; c.render(); }});
          if (!raw.photo) { pick(); break; }
          const items = [() => { ce.primaryPhoto = Number(ri); }, () => { delete raw.photo; c.render(); }, pick];
          c.dialog({title: t('attachToContact'), icon: null, rows: 'simple', items: [t('use_photo_as_primary'), t('removePicture'), t('changePicture')], onItem: i => setTimeout(items[i], 0)});
          break;
        }
      }
      return true;
    },
    menu(c) {
      const ce = c.ui.ce;
      if (!ce) return true;
      c.menu([{label: t('menu_done'), icon: 'fw-ic_menu_save.png', action: () => save(c)},
        {label: t('menu_doNotSave'), icon: 'fw-ic_menu_close_clear_cancel.png', action: () => finish(c)},
        {label: P().t('menu_newContact'), icon: 'fw-ic_menu_add.png', action: () => { ce.raws.push(newRaw()); c.render(); }},
        {label: P().t('menu_deleteContact'), icon: 'fw-ic_menu_delete.png', action: () => deleteContact(c)},
        ...(ce.raws.length > 1 ? [{label: t('menu_splitAggregate'), icon: 'ct-ic_menu_split.png', action: () => separate(c)}] : []),
        {label: t('menu_joinAggregate'), icon: 'ct-ic_menu_merge.png', action: () => join(c)}]);
      return true;
    },
    // onBackPressed saves.
    back(c) { if (!c.ui.ce) return false; persist(c); c.ui.ce = null; return false; }
  });
  EC.register('contact-join', {
    title: 'Contacts',
    noStatus: () => false,
    render: joinRender,
    action(name, el, event, c) {
      if (name === 'ecce-join-all') { c.ui.join.all = true; c.render(); return true; }
      if (name !== 'ecce-join-pick') return false;
      const contacts = c.data.contacts || [], me = contacts.find(x => x.id === c.ui.join.id), other = contacts.find(x => x.id === Number(el.dataset.id));
      if (me && other) {
        apply(me, [...raws(me), ...raws(other)]);
        me.starred = me.starred || other.starred; me.times = (me.times || 0) + (other.times || 0);
        c.data.contacts = contacts.filter(x => x !== other);
        c.save(); c.toast(t('contactsJoinedMessage'));
      }
      // Back in the editor, which loads the joined contact again (QueryEntitiesTask).
      c.back();
      c.ui.ce = {id: me.id, raws: structuredClone(raws(me)), more: false, open: {}};
      c.render();
      return true;
    }
  });
})();
