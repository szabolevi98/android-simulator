"""Writes versions/<v>/email-prefs.js: the AOSP Email app's settings screens of each factory image, read from its
EmailGoogle APK: the general preferences and the account's account_settings_preferences.xml as a list of rows
(category, check box, list, edit text or a screen this simulator leaves out) with their texts, list entries and
defaults in English, Hungarian, German, French and Spanish.
    python docs/email-prefs.py
Rows an IMAP account does not show are dropped as AccountSettingsFragment drops them (contacts and calendar sync,
Exchange policies, the system folder pickers)."""
import glob, json, re
from loguru import logger; logger.remove()
from androguard.core.apk import APK
from androguard.core.axml import AXMLPrinter
ROOT = __file__.replace('\\', '/').rsplit('/docs/', 1)[0] + '/'
LANGS = ['', 'hu', 'de', 'fr', 'es']
VERSIONS = {
    '4.0.4': ('maguro', 'EmailGoogle', 'header_label_general_preferences'),
    '4.3': ('mako', 'EmailGoogle', 'header_label_general_preferences'),
    '4.4.4': ('hammerhead', 'EmailGoogle', 'header_label_general_preferences'),
    '5.1.1': ('shamu', 'PrebuiltEmailGoogle', 'general_preferences_title'),
}
# Defaults the code sets rather than the XML: normal text size, back to the list after a delete, a 15-minute check.
CODE_DEFAULTS = {'text_zoom': 2, 'auto_advance': 2, 'account_check_frequency': 3}
DROP = {'account_sync_contacts', 'account_sync_calendar', 'account_policies', 'system_folders', 'clear_trusted_senders'}
# The screens: Settings (General and the account), the two preference lists, single-choice and edit-text dialogs.
RENDERER = r'''(() => {
  'use strict';
  const D = window.EmailPrefData, e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const L = (row, lang) => row ? row[Math.max(0, ['en', 'hu', 'de', 'fr', 'es'].indexOf(lang))] || row[0] : '';
  const rowsOf = page => page === 'general' ? D.general : page === 'account' ? D.account : [];
  const find = key => [...D.general, ...D.account].find(row => row.key === key);
  function value(data, key, account) {
    const prefs = data.emailPrefs || {}, row = find(key);
    if (key in prefs) return prefs[key];
    if (key === 'account_description') return account;
    if (key === 'account_name') return account.split('@')[0];
    return row && 'default' in row ? row.default : '';
  }
  // The signature as the new message's body (MessageCompose / UnifiedEmail's R.string.signature).
  const signatureBody = data => { const sig = value(data, 'account_signature', ''); return sig ? D.signature.replace('%s', sig) : ''; };
  function render(data, ui, lang, t, account) {
    const page = ui.emPref || '', T = row => L(row, lang);
    const item = (action, id, label, summary = '', extra = '') => `<button type="button" class="emp-row" data-action="${action}" data-id="${e(id)}"><span class="emp-text"><b>${e(label)}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span>${extra}</button>`;
    let body;
    if (!page) body = item('emailpref-page', 'general', T(D.words.general)) + item('emailpref-page', 'account', value(data, 'account_description', account));
    else body = rowsOf(page).map(row => {
      if (row.kind === 'cat') return row.title ? `<h4 class="emp-cat">${e(T(row.title))}</h4>` : '';
      if (row.kind === 'check') { const on = !!value(data, row.key, account); return item('emailpref-toggle', row.key, T(row.title), T(row.summary), `<i class="emp-check${on ? ' on' : ''}" role="checkbox" aria-checked="${on}"></i>`); }
      if (row.kind === 'list') return item('emailpref-list', row.key, T(row.title), T(row.entries[value(data, row.key, account)]) || T(row.summary));
      if (row.kind === 'edit') { const current = value(data, row.key, account); return item('emailpref-edit', row.key, T(row.title), current || (row.key === 'account_signature' && D.words.notSet ? T(D.words.notSet) : T(row.summary))); }
      return item('emailpref-unsupported', row.key, T(row.title), T(row.summary));
    }).join('');
    const title = !page ? T(D.words.settings) : page === 'general' ? T(D.words.general) : T(D.words.account);
    const list = ui.emPrefList && find(ui.emPrefList), edit = ui.emPrefEdit && find(ui.emPrefEdit);
    const scrim = `<button type="button" class="emp-scrim" data-action="emailpref-close" aria-label="${e(t('Cancel'))}"></button>`;
    const dialog = list ? `${scrim}<div class="emp-dialog" role="dialog"><h3>${e(T(list.title))}</h3>${list.entries.map((entry, i) => `<button type="button" class="emp-choice${value(data, list.key, account) === i ? ' on' : ''}" data-action="emailpref-pick" data-id="${e(list.key)}:${i}" role="radio" aria-checked="${value(data, list.key, account) === i}"><span>${e(T(entry))}</span><i></i></button>`).join('')}<div class="emp-buttons"><button type="button" data-action="emailpref-close">${e(t('Cancel'))}</button></div></div>`
      : edit ? `${scrim}<div class="emp-dialog" role="dialog"><h3>${e(T(edit.dialog || edit.title))}</h3><textarea class="emp-edit" data-email-pref-edit data-no-translate rows="${edit.key === 'account_signature' ? 3 : 1}">${e(ui.emPrefEditValue ?? value(data, edit.key, account))}</textarea><div class="emp-buttons"><button type="button" data-action="emailpref-close">${e(t('Cancel'))}</button><button type="button" data-action="emailpref-save">${e(t('OK'))}</button></div></div>` : '';
    return `<div class="app-view emp-app${D.material ? ' material' : ''}"><header class="emp-bar"><button type="button" class="emp-up" data-action="back" aria-label="${e(t('Navigate up'))}">${D.material ? '<i></i>' : '<img class="emp-caret" src="assets/ic_ab_back_holo_light.png" alt=""><img class="emp-icon" src="assets/email.png" alt="">'}</button><b data-no-translate>${e(title)}</b></header><div class="emp-scroll" data-no-translate>${body}</div>${dialog}</div>`;
  }
  window.EmailPrefs = {render, value, signatureBody, find, version: D.version};
})();
'''
for v, (device, apk_name, general_title) in VERSIONS.items():
    path = glob.glob(f'{ROOT}_aosp/{device}/system/app/**/{apk_name}.apk', recursive=True)[0]
    apk = APK(path); res = apk.get_android_resources(); pkg = res.get_packages_names()[0]
    def by_lang(rid):
        out = {}
        for config, entry in res.get_res_configs(rid, None):
            lang, region = config.get_language(), config.get_country()
            if region and '\x00' not in region: continue
            if any(q in (config.get_qualifier() or '') for q in ('sw600', 'sw720', 'land', 'large')): continue
            out.setdefault('' if '\x00' in lang else lang, entry)
        return out
    def string(rid):
        """The five languages of a string (following references), English where a language is missing."""
        entries = by_lang(rid); out = []
        for lang in LANGS:
            entry = entries.get(lang) or entries.get('')
            key = entry.key
            out.append(string(key.data)[LANGS.index(lang)] if key.data_type == 1 else entry.get_key_data())
        return out
    def array(rid):
        entries = by_lang(rid); items = entries[''].item.items; out = []
        for i in range(len(items)):
            row = []
            for lang in LANGS:
                value = (entries.get(lang) or entries['']).item.items[i][1]
                row.append(string(value.data)[LANGS.index(lang)] if value.data_type == 1 else value.format_value())
            out.append(row)
        return out
    def plain(rid):
        entry = by_lang(rid)['']; key = entry.key if hasattr(entry, 'key') else None
        if key is not None and key.data_type == 1: return plain(key.data)
        if hasattr(entry, 'item') and hasattr(entry.item, 'items'): return [v.format_value() for _, v in entry.item.items]
        return entry.get_key_data()
    def named(kind, name):
        return res.get_res_id_by_key(pkg, kind, name)
    def screen(xml_name):
        xml = AXMLPrinter(apk.get_file(f'res/xml/{xml_name}')).get_xml().decode()
        rows, skipping = [], False
        for tag, attrs, close in re.findall(r'<(/?[\w.]+)([^>]*?)(/?)>', xml):
            if tag.startswith('/') or tag == 'PreferenceScreen' and not attrs.strip(): continue
            a = dict(re.findall(r'(?:android:)?(\w+)="([^"]*)"', attrs))
            ref = lambda key: int(a[key][1:], 16) if a.get(key, '').startswith('@') and a[key][1:] and a[key][1:] != '0' and re.fullmatch(r'[0-9A-Fa-f]{8}', a[key][1:]) else None
            key = a.get('key', '')
            if tag == 'PreferenceCategory': skipping = key in DROP
            if skipping or key in DROP or tag == 'PreferenceScreen' and not key: continue
            kind = 'cat' if tag == 'PreferenceCategory' else 'check' if tag.endswith('CheckBoxPreference') else 'list' if tag.endswith('ListPreference') and 'Policy' not in tag else 'edit' if tag.endswith('EditTextPreference') else 'screen'
            row = {'kind': kind, 'key': key}
            if ref('title'): row['title'] = string(ref('title'))
            if ref('summary'): row['summary'] = string(ref('summary'))
            if kind == 'list':
                row['entries'] = array(ref('entries'))
                values = plain(ref('entryValues')) if ref('entryValues') else [str(i) for i in range(len(row['entries']))]
                default = plain(ref('defaultValue')) if ref('defaultValue') else a.get('defaultValue', values[0])
                row['default'] = CODE_DEFAULTS.get(key, values.index(default) if default in values else 0)
            if kind == 'check':
                d = a.get('defaultValue', 'false')
                row['default'] = (plain(ref('defaultValue')) == 'true' if ref('defaultValue') else d == 'true') if d else False
                if isinstance(row['default'], str): row['default'] = row['default'] == 'true'
            if kind == 'edit' and ref('dialogTitle'): row['dialog'] = string(ref('dialogTitle'))
            rows.append(row)
        return rows
    general = screen('general_preferences.xml')
    account = screen('account_settings_preferences.xml')
    settings_title = 'settings_activity_title' if named('string', 'settings_activity_title') else 'activity_preferences'
    words = {'general': string(named('string', general_title)), 'account': string(named('string', 'account_settings_action')), 'settings': string(named('string', settings_title))}
    if named('string', 'preferences_signature_summary_not_set'): words['notSet'] = string(named('string', 'preferences_signature_summary_not_set'))
    # MessageCompose (Email 4.1) puts the signature on a new line; UnifiedEmail's compose uses R.string.signature.
    signature = '\n%s' if v in ('4.0.4', '4.3') else plain(named('string', 'signature'))
    data = {'version': apk.get_androidversion_name(), 'material': v == '5.1.1', 'signature': signature, 'general': general, 'account': account, 'words': words}
    js = (f'/* Generated by docs/email-prefs.py from {apk_name}.apk ({apk.get_androidversion_name()}) of the {device} image. Do not edit. */\n'
          f'window.EmailPrefData = {json.dumps(data, ensure_ascii=False, separators=(",", ":"))};\n' + RENDERER)
    open(f'{ROOT}versions/{v}/email-prefs.js', 'w', encoding='utf-8', newline='\n').write(js)
    print(v, len(general), len(account), [r['key'] for r in account])
