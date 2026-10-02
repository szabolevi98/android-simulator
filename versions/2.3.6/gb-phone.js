/* Android 2.3.6 Contacts / Dialtacts (packages/apps/Contacts, layout-finger): the TabWidget with Phone, Call log,
   Contacts and Favorites (framework tab_indicator.xml, 64 dip), TwelveKeyDialer (twelve_key_dialer.xml, dialpad.xml,
   voicemail_dial_delete.xml), RecentCallsListActivity, ContactsListActivity and ViewContactActivity.
   hdpi px x 0.575, 1 dp = 0.8625px. Strings come from gb-strings-contacts.js. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const text = (lang, key) => { const entry = window.GBStrings?.contacts?.strings?.[key]; return entry ? entry[lang] ?? entry.en : key; };
  const TABS = [['dialpad', 'dialerIconLabel', 'dialer'], ['history', 'recentCallsIconLabel', 'recent'], ['contacts', 'contactsIconLabel', 'contacts'], ['favorites', 'contactsFavoritesLabel', 'starred']];
  const KEYS = [['1', 'dial_num_1_no_vm'], ['2', 'dial_num_2'], ['3', 'dial_num_3'], ['4', 'dial_num_4'], ['5', 'dial_num_5'], ['6', 'dial_num_6'], ['7', 'dial_num_7'], ['8', 'dial_num_8'], ['9', 'dial_num_9'], ['*', 'dial_num_star'], ['0', 'dial_num_0'], ['#', 'dial_num_pound']];

  function tabs(current, lang) {
    return `<div class="gbp-tabs" role="tablist">${TABS.map(([id, label, icon]) => `<button class="gbp-tab${current === id ? ' selected' : ''}" role="tab" aria-selected="${current === id}" data-action="phone-tab" data-id="${id}"><img src="assets/gb-c-ic_tab_${current === id ? 'selected' : 'unselected'}_${icon}.png" alt=""><span>${e(text(lang, label))}</span></button>`).join('')}</div>`;
  }
  // TwelveKeyDialer: the 67 dip digits field (33 sp), the ButtonGridLayout of 88 x 50 dp keys with white digits that turn
  // black on the green pressed key, then voicemail / dial / delete.
  function dialer(dial) {
    return `<div class="gbp-dialer"><div class="gbp-digits${dial ? ' filled' : ''}"><output aria-label="Phone number">${e(dial)}</output></div><div class="gbp-pad">${KEYS.map(([key, art]) => `<button class="gbp-key" data-action="dial" data-id="${e(key)}" aria-label="${e(key)}" style="--wht:url('assets/gb-c-${art}_wht.png');--blk:url('assets/gb-c-${art}_blk.png')"></button>`).join('')}</div><div class="gbp-actions"><button class="gbp-voicemail" data-action="gbp-voicemail" aria-label="Voicemail"><img src="assets/gb-c-ic_dial_action_voice_mail.png" alt=""></button><button class="gbp-dial" data-action="call" aria-label="Dial"><img src="assets/gb-c-ic_dial_action_call.png" alt=""></button><button class="gbp-delete" data-action="dial-delete" aria-label="Delete"><img src="assets/gb-c-ic_dial_action_delete.png" alt=""></button></div></div>`;
  }
  // RecentCallsListItemView: name or number (22 sp), then the call type arrow, the number label (bold) and the relative
  // date (14 sp); a 1 px divider and the call button on the right.
  function relative(time, now, locale) {
    const minutes = Math.max(0, Math.round((now - time) / 60000));
    const rtf = new Intl.RelativeTimeFormat(locale, {numeric: 'auto'});
    if (minutes < 60) return rtf.format(-minutes, 'minute');
    if (minutes < 1440) return rtf.format(-Math.round(minutes / 60), 'hour');
    return rtf.format(-Math.round(minutes / 1440), 'day');
  }
  function callLog(calls, contactOf, ctx) {
    if (!calls.length) return `<p class="gbp-empty">${e(text(ctx.lang, 'recentCalls_empty'))}</p>`;
    return `<div class="gbp-list">${[...calls].reverse().map(call => {
      const person = contactOf(call.number), type = call.type || 'outgoing';
      return `<div class="gbp-log"><button class="gbp-log-main" data-action="phone-log-detail" data-id="${call.time}"><span class="gbp-log-name">${e(person?.name || call.number)}</span><span class="gbp-log-meta"><img src="assets/gb-c-ic_call_log_list_${type === 'missed' ? 'missed' : type === 'incoming' ? 'incoming' : 'outgoing'}_call.png" alt="">${person ? `<b>${e(ctx.t('Mobile'))}</b> ` : ''}${e(relative(call.time, ctx.now, ctx.locale))}</span></button><i class="gbp-divider"></i><button class="gbp-log-call" data-action="phone-redial" data-id="${e(call.number)}" aria-label="${e(text(ctx.lang, 'recentCalls_callNumber').replace('%s', person?.name || call.number))}"><img src="assets/gb-c-badge_action_call.png" alt=""></button></div>`;
    }).join('')}</div>`;
  }
  // ContactsListActivity: alphabetical with list_separator headers, a 48 dp QuickContactBadge and the 22 sp name.
  function contacts(people, ctx, favorites = false) {
    const sorted = [...people].sort((a, b) => a.name.localeCompare(b.name, ctx.locale));
    if (!sorted.length) return `<p class="gbp-empty">${e(text(ctx.lang, favorites ? 'noFavoritesHelpText' : 'noContactsHelpText')).replace(/\n/g, '<br>')}</p>`;
    let letter = '';
    return `<div class="gbp-list">${sorted.map(person => {
      const initial = favorites ? '' : person.name[0].toLocaleUpperCase(ctx.locale);
      const header = initial && initial !== letter ? `<div class="gbp-section">${e(letter = initial)}</div>` : '';
      return `${header}<button class="gbp-contact" data-action="gbp-contact" data-id="${person.id}"><img src="assets/gb-c-ic_contact_list_picture.png" alt=""><span>${e(person.name)}</span>${favorites ? '' : ''}</button>`;
    }).join('')}</div>`;
  }
  // ViewContactActivity: the contact header (photo, name, star) and the data rows - call, text and email.
  function detail(person, ctx) {
    const T = key => text(ctx.lang, key);
    const row = (action, id, icon, title, value) => `<button class="gbp-data" data-action="${action}" data-id="${e(id)}"><span class="gbset-text"><span class="gbset-title">${e(title)}</span><span class="gbset-sum">${e(value)}</span></span><img src="assets/gb-c-${icon}.png" alt=""></button>`;
    return `<div class="gbp-detail"><div class="gbp-header"><img src="assets/gb-c-ic_contact_picture.png" alt=""><span>${e(person.name)}</span><button data-action="people-star" data-id="${person.id}" aria-label="${e(T(person.favorite ? 'menu_removeStar' : 'menu_addStar'))}"><img src="assets/gb-btn_star_big_${person.favorite ? 'on' : 'off'}.png" alt=""></button></div><div class="gbp-list">${person.phone ? row('phone-redial', person.phone, 'badge_action_call', T('call_mobile'), person.phone) + row('phone-log-message', person.phone, 'sym_action_sms', T('sms_mobile'), person.phone) : ''}${person.email ? `<div class="gbset-cat">${e(ctx.t('Email'))}</div>` + row('gbp-email', person.email, 'sym_action_add', T('email_home'), person.email) : ''}</div></div>`;
  }

  function render(ctx) {
    const tab = ctx.tab || 'dialpad';
    if (ctx.detail) return `<div class="app-view gbp" data-no-translate><div class="gb-titlebar">${e(text(ctx.lang, 'viewContactTitle'))}</div>${detail(ctx.detail, ctx)}</div>`;
    const body = tab === 'history' ? callLog(ctx.calls, ctx.contactOf, ctx) : tab === 'contacts' ? contacts(ctx.people, ctx) : tab === 'favorites' ? contacts(ctx.people.filter(person => person.favorite), ctx, true) : dialer(ctx.dial);
    return `<div class="app-view gbp" data-no-translate>${tabs(tab, ctx.lang)}<div class="gbp-body">${body}</div></div>`;
  }
  // Options menus: TwelveKeyDialer (Add to contacts, Add 2-sec pause, Add wait), RecentCalls (Clear call log),
  // ContactsListActivity (Search, New contact, Display options, Accounts, Import/Export).
  function menu(ctx) {
    const T = key => text(ctx.lang, key), tab = ctx.tab || 'dialpad';
    if (ctx.detail) return [{action: 'people-edit', title: T('menu_editContact'), icon: 'ic_menu_edit'}, {action: 'people-share', title: T('menu_share'), icon: 'ic_menu_share'}, {action: 'people-delete', title: T('menu_deleteContact'), icon: 'ic_menu_delete'}];
    if (tab === 'dialpad') return ctx.dial ? [{action: 'phone-add-contact', title: T('recentCalls_addToContact'), icon: 'ic_menu_add'}, {action: 'dial', id: ',', title: T('add_2sec_pause'), icon: 'ic_menu_add'}, {action: 'dial', id: ';', title: T('add_wait'), icon: 'ic_menu_add'}] : [];
    if (tab === 'history') return ctx.calls.length ? [{action: 'gbp-clear-log', title: T('recentCalls_deleteAll'), icon: 'ic_menu_close_clear_cancel'}] : [];
    return [{action: 'people-search', title: T('menu_search'), icon: 'ic_menu_search'}, {action: 'gbp-new-contact', title: T('menu_newContact'), icon: 'ic_menu_add'}, {action: 'gbset-toast', id: 'Display options', title: T('menu_displayGroup'), icon: 'ic_menu_view'}, {action: 'gbset-toast', id: 'Accounts', title: T('menu_accounts'), icon: 'ic_menu_account_list'}, {action: 'gbset-toast', id: 'Import/Export', title: T('menu_import_export'), icon: 'c-ic_menu_import_export'}];
  }

  window.GBPhone = {TABS, KEYS, text, relative, render, menu};
})();
