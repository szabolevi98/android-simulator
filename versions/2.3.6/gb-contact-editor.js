/* Android 2.3.6 Contacts editor (ContactEditorActivity: act_edit.xml, item_contact_editor.xml, item_kind_section.xml,
   item_generic_editor.xml, item_photo_editor.xml) for the phone-only account of FallbackSource: the 64 dip account header,
   the 76 dip photo button, the structured name (given / family, more fields behind the expander), the Phone, Email and
   Organization kind sections with their label buttons and minus buttons, the collapsible "More" section with Notes, and
   the Done / Revert ButtonBar. Strings come from gb-strings-contacts.js. 1 dp = 0.8625 px. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const text = (lang, key) => { const entry = window.GBStrings?.contacts?.strings?.[key]; return entry ? entry[lang] ?? entry.en : key; };
  // FallbackSource type lists (the primary types; the label button cycles through them in a list dialog).
  const PHONE_TYPES = ['home', 'mobile', 'work', 'other'], EMAIL_TYPES = ['home', 'work', 'other', 'mobile'];
  const typeLabel = (kind, type, lang) => text(lang, `${kind}Type${type[0].toUpperCase()}${type.slice(1)}`);
  // StructuredName: the editor shows given and family names; the simulator stores one display name.
  function split(name) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    return parts.length < 2 ? {given: parts[0] || '', family: ''} : {given: parts.slice(0, -1).join(' '), family: parts.at(-1)};
  }
  const join = (given, family) => [given, family].map(v => String(v || '').trim()).filter(Boolean).join(' ');
  const field = (name, hint, value, type = 'text') => `<input class="gbce-field" type="${type}" name="${name}" value="${e(value)}" placeholder="${e(hint)}" aria-label="${e(hint)}" autocomplete="off">`;
  const round = (action, kind, label, id = '') => `<button type="button" class="gbce-round ${kind}" data-action="${action}"${id ? ` data-id="${e(id)}"` : ''} aria-label="${e(label)}"></button>`;
  function section(title, plus, rows) {
    return `<div class="gbce-kind"><i class="gbce-divider"></i><div class="gbce-kind-head"><span>${e(title)}</span>${plus || ''}</div><div class="gbce-kind-rows">${rows}</div></div>`;
  }
  function render(ctx) {
    const T = key => text(ctx.lang, key), d = ctx.draft || {}, name = split(d.name);
    const given = d.given ?? name.given, family = d.family ?? name.family, isNew = ctx.isNew;
    const phoneRow = d.phone !== null && d.phone !== undefined && d.phoneOn !== false ? `<div class="gbce-row"><button type="button" class="gbce-label" data-action="gbce-type" data-id="phone">${e(typeLabel('phone', d.phoneType || 'mobile', ctx.lang))}</button>${field('phone', T('phoneLabelsGroup'), d.phone, 'tel')}${round('gbce-remove', 'minus', 'Remove', 'phone')}</div>` : '';
    const emailRow = d.email !== null && d.email !== undefined && d.emailOn !== false ? `<div class="gbce-row"><button type="button" class="gbce-label" data-action="gbce-type" data-id="email">${e(typeLabel('email', d.emailType || 'home', ctx.lang))}</button>${field('email', T('emailLabelsGroup'), d.email, 'email')}${round('gbce-remove', 'minus', 'Remove', 'email')}</div>` : '';
    const orgRow = d.companyOn !== false && (d.company !== undefined && d.company !== null) ? `<div class="gbce-row">${field('company', T('ghostData_company'), d.company)}${round('gbce-remove', 'minus', 'Remove', 'company')}</div>` : '';
    const more = ctx.moreName ? `${field('prefix', T('name_prefix'), d.prefix || '')}${field('middle', T('name_middle'), d.middle || '')}${field('suffix', T('name_suffix'), d.suffix || '')}` : '';
    const secondary = ctx.secondary ? section(T('label_notes'), d.notes === undefined || d.notes === null ? round('gbce-add', 'plus', T('label_notes'), 'notes') : '', d.notes !== undefined && d.notes !== null ? `<div class="gbce-row">${field('notes', T('label_notes'), d.notes)}${round('gbce-remove', 'minus', 'Remove', 'notes')}</div>` : '') : '';
    return `<form class="app-view gbce" data-form="people-save" data-no-translate><div class="gb-titlebar">${e(T(isNew ? 'editContact_title_insert' : 'editContact_title_edit'))}</div><div class="gbce-scroll">
      <div class="gbce-header"><i class="gbce-colorbar"></i><img src="assets/people.png" alt=""><div><b>${e(T('account_phone'))}</b></div></div><i class="gbce-divider"></i>
      <div class="gbce-photo-row"><button type="button" class="gbce-photo${d.photo ? ' has-photo' : ''}" data-action="gbce-photo" aria-label="${e(T('attachToContact'))}">${d.photo && window.GBContactPhoto?.(d) ? `<img src="${window.GBContactPhoto(d)}" alt="">` : ''}</button></div>
      <div class="gbce-name"><div class="gbce-name-fields">${ctx.familyFirst ? field('family', T('name_family'), family) + field('given', T('name_given'), given) : field('given', T('name_given'), given) + field('family', T('name_family'), family)}${more}</div>${round('gbce-more-name', ctx.moreName ? 'less' : 'more', 'More')}</div>
      ${section(T('phoneLabelsGroup'), phoneRow ? '' : round('gbce-add', 'plus', T('phoneLabelsGroup'), 'phone'), phoneRow)}
      ${section(T('emailLabelsGroup'), emailRow ? '' : round('gbce-add', 'plus', T('emailLabelsGroup'), 'email'), emailRow)}
      ${section(T('organizationLabelsGroup'), orgRow ? '' : round('gbce-add', 'plus', T('organizationLabelsGroup'), 'company'), orgRow)}
      <i class="gbce-divider"></i><button type="button" class="gbce-secondary${ctx.secondary ? ' open' : ''}" data-action="gbce-secondary">${e(T('edit_secondary_collapse'))}</button>${secondary}
      <input type="hidden" name="name" value="${e(join(given, family))}"></div>
      <div class="gbce-buttonbar"><button type="submit">${e(T('menu_done'))}</button><button type="button" data-action="gbce-revert">${e(T('menu_doNotSave'))}</button></div></form>`;
  }
  function dialog(kind, ctx) {
    const d = ctx.draft || {};
    // EditContactActivity.createPickPhotoDialog / PhotoEditorView: Take photo or pick one; with a photo, use, remove or change it.
    if (kind === 'photo') return {title: text(ctx.lang, 'attachToContact'), items: [{action: 'gbce-photo-take', title: text(ctx.lang, 'take_photo')}, {action: 'gbce-photo-pick', title: text(ctx.lang, 'pick_photo')}]};
    if (kind === 'photo-edit') return {title: text(ctx.lang, 'attachToContact'), items: [{action: 'close-overlay', title: text(ctx.lang, 'use_photo_as_primary')}, {action: 'gbce-photo-remove', title: text(ctx.lang, 'removePicture')}, {action: 'gbce-photo-pick', title: text(ctx.lang, 'changePicture')}]};
    if (kind === 'phone' || kind === 'email') {
      const types = kind === 'phone' ? PHONE_TYPES : EMAIL_TYPES, current = d[`${kind}Type`] || (kind === 'phone' ? 'mobile' : 'home');
      return {title: text(ctx.lang, 'selectLabel'), items: types.map(type => ({action: 'gbce-set-type', id: `${kind}:${type}`, title: typeLabel(kind, type, ctx.lang)})), selected: types.indexOf(current)};
    }
    return null;
  }
  window.GBContactEditor = {PHONE_TYPES, EMAIL_TYPES, text, typeLabel, split, join, render, dialog};
})();
