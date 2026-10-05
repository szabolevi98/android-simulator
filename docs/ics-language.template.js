/* Settings > Language & input of the Galaxy Nexus image (IMM76I), from Settings.apk res/xml/language_settings.xml and
   the pages it opens, with the texts of the APKs that draw them (docs/apk-strings.py):
   - Language (LocalePicker); Spelling correction (SpellCheckersPreference: Android correction, with LatinImeGoogle's
     spell_checker_settings.xml behind its settings button); Personal dictionary (UserDictionarySettings: the words,
     Add in the action bar, Edit / Delete).
   - KEYBOARD & INPUT METHODS: Default (the framework's "Select input method" list) and the enabled input methods of the
     image, Android keyboard (LatinImeGoogle 4.0.4, res/xml/prefs.xml: General, Text correction, Other options >
     Advanced settings; Input languages from res/xml/method.xml) and Google voice typing (VoiceSearch
     ime_preferences.xml). The image has no physical keyboard, so that category stays hidden.
   - SPEECH: one recognizer, so no "Voice recognizer" list: Voice Search (VoiceSearch preferences.xml) and
     Text-to-speech output (tts_settings.xml with Google Text-to-speech Engine and tts_engine_settings.xml). GoogleTTS
     4.0.4 has no GET_SAMPLE_TEXT activity, so "Listen to an example" stays disabled as on the phone.
   - MOUSE/TRACKPAD: Pointer speed (the seek bar dialog, -7 to 7).
   Choices are kept in data.inputPrefs and data.userDictionary. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const STRINGS = __STRINGS__({
    "Language & input": "language_keyboard_settings_title", "Language": "phone_language", "Spelling correction": "spellcheckers_settings_title",
    "Personal dictionary": "user_dict_single_settings_title", "Keyboard & input methods": "keyboard_settings_category", "Default": "current_input_method",
    "Speech": "voice_category", "Voice Search": "recognizer_settings_title", "Text-to-speech output": "tts_settings_title", "Mouse/trackpad": "pointer_settings_category",
    "Pointer speed": "pointer_speed", "Add to dictionary": "user_dict_settings_add_dialog_title", "Add": "user_dict_settings_add_menu_title",
    "Edit": "user_dict_settings_context_menu_edit_title", "Delete": "user_dict_settings_context_menu_delete_title", "Edit word": "user_dict_settings_edit_dialog_title",
    "You don't have any words in the user dictionary. Add a word by touching the Add (+) button": "user_dict_settings_empty_text",
    "Set up input methods": "configure_input_method", "Preferred engine": "tts_engine_preference_section_title", "General": "tts_general_section_title",
    "Speech rate": "tts_default_rate_title", "Speed at which the text is spoken": "tts_default_rate_summary", "Listen to an example": "tts_play_example_title",
    "Play a short demonstration of speech synthesis": "tts_play_example_summary", "Very slow": "@array/tts_rate_entries:0", "Slow": "@array/tts_rate_entries:1",
    "Normal": "@array/tts_rate_entries:2", "Fast": "@array/tts_rate_entries:3", "Very fast": "@array/tts_rate_entries:4", "Settings for %s": "tts_engine_settings_title",
    "Install voice data": "tts_install_data_title", "Install the voice data required for speech synthesis": "tts_install_data_summary",
    "Sets the language-specific voice for the spoken text": "tts_default_lang_summary", "Cancel": "cancel", "OK": "framework:ok",
    "Select input method": "framework:select_input_method",
    "Android keyboard": "LatinImeGoogle:english_ime_name", "Android keyboard settings": "LatinImeGoogle:english_ime_settings", "English (US)": "LatinImeGoogle:subtype_en_US",
    "English (UK)": "LatinImeGoogle:subtype_en_GB", "Input languages": "LatinImeGoogle:language_selection_title", "Auto-capitalization": "LatinImeGoogle:auto_cap",
    "Vibrate on keypress": "LatinImeGoogle:vibrate_on_keypress", "Sound on keypress": "LatinImeGoogle:sound_on_keypress", "Popup on keypress": "LatinImeGoogle:popup_on_keypress",
    "Show settings key": "LatinImeGoogle:prefs_settings_key", "Voice input key": "LatinImeGoogle:voice_input", "On main keyboard": "LatinImeGoogle:voice_input_modes_main_keyboard",
    "On symbols keyboard": "LatinImeGoogle:voice_input_modes_symbols_keyboard", "Off": "LatinImeGoogle:voice_input_modes_off", "Text correction": "LatinImeGoogle:correction_category",
    "Add-on dictionaries": "LatinImeGoogle:configure_dictionaries_title", "Auto correction": "LatinImeGoogle:auto_correction",
    "Spacebar and punctuation automatically correct mistyped words": "LatinImeGoogle:auto_correction_summary", "Modest": "LatinImeGoogle:auto_correction_threshold_mode_modest",
    "Aggressive": "LatinImeGoogle:auto_correction_threshold_mode_aggeressive", "Very aggressive": "LatinImeGoogle:auto_correction_threshold_mode_very_aggeressive",
    "Show correction suggestions": "LatinImeGoogle:prefs_show_suggestions", "Display suggested words while typing": "LatinImeGoogle:prefs_show_suggestions_summary",
    "Always show": "LatinImeGoogle:prefs_suggestion_visibility_show_name", "Show on portrait mode": "LatinImeGoogle:prefs_suggestion_visibility_show_only_portrait_name",
    "Always hide": "LatinImeGoogle:prefs_suggestion_visibility_hide_name", "Other options": "LatinImeGoogle:misc_category", "Advanced settings": "LatinImeGoogle:advanced_settings",
    "Options for expert users": "LatinImeGoogle:advanced_settings_summary", "Suggest Contact names": "LatinImeGoogle:use_contacts_dict",
    "Use names from Contacts for suggestions and corrections": "LatinImeGoogle:use_contacts_dict_summary", "Bigram suggestions": "LatinImeGoogle:bigram_suggestion",
    "Use previous word to improve suggestion": "LatinImeGoogle:bigram_suggestion_summary", "Enable recorrections": "LatinImeGoogle:enable_span_insert",
    "Set suggestions for recorrections": "LatinImeGoogle:enable_span_insert_summary", "Android correction": "LatinImeGoogle:spell_checker_service_name",
    "Spell checking settings": "LatinImeGoogle:android_spell_checker_settings", "Use proximity data": "LatinImeGoogle:use_proximity_option_title",
    "Use a keyboard-like proximity algorithm for spell checking": "LatinImeGoogle:use_proximity_option_summary",
    "Google voice typing": "VoiceSearch:ime_service_label", "Google voice typing settings": "VoiceSearch:imePreferences", "Block offensive words": "VoiceSearch:prefTitle_profanityFilter",
    "Hide recognized offensive text": "VoiceSearch:prefSummary_ime_profanityFilter", "Voice Search settings": "VoiceSearch:voiceSearchPreferences", "SafeSearch": "VoiceSearch:prefTitle_safeSearch",
    "Moderate": "VoiceSearch:@array/prefEntries_safeSearch:1", "Strict": "VoiceSearch:@array/prefEntries_safeSearch:2",
    "Hide recognized offensive voice results": "VoiceSearch:prefSummary_profanityFilter", "Personalized recognition": "VoiceSearch:personalization_header",
    "Improve speech recognition accuracy": "VoiceSearch:personalization_settings_message", "Google Account dashboard": "VoiceSearch:manage_personalization",
    "Manage your collected data": "VoiceSearch:manage_personalization_message", "Google Text-to-speech Engine": "GoogleTTS:app_name"
  });
  const LANGS = ['hu', 'de', 'fr', 'es'];
  const T = (locale, key) => { const i = LANGS.indexOf(String(locale).slice(0, 2)); const row = STRINGS[key]; return row ? (i >= 0 ? row[i] : row[4]) || key : key; };
  // LatinImeGoogle res/xml/method.xml subtypes and the defaults of res/xml/prefs.xml (config_default_*).
  const SUBTYPES = ['en_US', 'en_GB', 'ar', 'cs', 'da', 'de', 'es', 'fi', 'fr', 'fr_CA', 'fr_CH', 'hr', 'hu', 'it', 'iw', 'nb', 'nl', 'pl', 'pt', 'ru', 'sr', 'sv', 'tr'];
  const DEFAULTS = {ime: 'latin', latin: true, voiceIme: true, spell: true, proximity: true, autoCap: true, vibrate: true, sound: false, popup: true, settingsKey: false,
    voiceKey: 'main', autoCorrect: 'modest', suggestions: 'show', contactsDict: true, bigram: true, recorrection: true, subtypes: ['en_US'],
    vsLanguage: 'en-US', safeSearch: 'moderate', profanity: true, personalized: false, imeProfanity: true, ttsRate: 'normal', ttsLang: 'en-US', pointerSpeed: 0};
  const prefs = data => ({...DEFAULTS, ...data.inputPrefs});
  const subtypeName = (code, locale) => code === 'en_US' ? T(locale, 'English (US)') : code === 'en_GB' ? T(locale, 'English (UK)')
    : (() => { const [lang, region] = code.split('_'); const n = new Intl.DisplayNames([locale], {type: 'language'}).of(lang === 'iw' ? 'he' : lang); const name = n.charAt(0).toUpperCase() + n.slice(1); return region ? `${name} (${region})` : name; })();
  const LISTS = {
    voiceKey: [['main', 'On main keyboard'], ['symbols', 'On symbols keyboard'], ['off', 'Off']],
    autoCorrect: [['off', 'Off'], ['modest', 'Modest'], ['aggressive', 'Aggressive'], ['very', 'Very aggressive']],
    suggestions: [['show', 'Always show'], ['portrait', 'Show on portrait mode'], ['hide', 'Always hide']],
    safeSearch: [['off', 'Off'], ['moderate', 'Moderate'], ['strict', 'Strict']],
    ttsRate: [['veryslow', 'Very slow'], ['slow', 'Slow'], ['normal', 'Normal'], ['fast', 'Fast'], ['veryfast', 'Very fast']],
    vsLanguage: ['en-US', 'en-GB', 'de-DE', 'es-ES', 'fr-FR', 'hu-HU'].map(c => [c, '']),
    ttsLang: [['en-US', ''], ['en-GB', '']]
  };
  // Voice Search / TTS languages as Android names them: "English (US)" / "English (UK)" from LatinIME, the rest as
  // language (country).
  const localeName = (code, locale) => code === 'en-US' ? T(locale, 'English (US)') : code === 'en-GB' ? T(locale, 'English (UK)')
    : new Intl.DisplayNames([locale], {type: 'language', languageDisplay: 'standard'}).of(code).replace(/^./, c => c.toUpperCase());
  const label = (list, value, locale) => { const item = LISTS[list].find(([id]) => id === value) || LISTS[list][0]; return item[1] ? T(locale, item[1]) : localeName(item[0], locale); };
  // Rows in the Settings app's markup (settings-row / section-label / holo check boxes).
  const row = (title, summary = '', action = 'noop', id = '', extra = '') => `<button class="settings-row wireless-row" data-action="${action}" data-id="${e(id)}"${extra}><span class="row-copy">${e(title)}${summary ? `<small>${e(summary)}</small>` : ''}</span></button>`;
  const check = (title, key, on, summary = '') => `<button class="settings-row wireless-row" data-action="lng-toggle" data-id="${key}" role="checkbox" aria-checked="${!!on}"><span class="row-copy">${e(title)}${summary ? `<small>${e(summary)}</small>` : ''}</span><img class="holo-checkbox" src="assets/btn_check_${on ? 'on' : 'off'}_holo_dark.png" alt=""></button>`;
  // A checked input method / spell checker with its settings button (InputMethodPreference, SpellCheckersPreference).
  const withSettings = (title, summary, key, on, page) => `<div class="settings-row lng-ime"><button class="lng-ime-check" data-action="lng-toggle" data-id="${key}" role="checkbox" aria-checked="${!!on}"><img class="holo-checkbox" src="assets/btn_check_${on ? 'on' : 'off'}_holo_dark.png" alt=""><span class="row-copy">${e(title)}${summary ? `<small>${e(summary)}</small>` : ''}</span></button><i></i><button class="lng-ime-settings" data-action="settings-sub" data-id="${page}" aria-label="Settings"><img src="assets/lng-ic_sysbar_quicksettings.png" alt=""></button></div>`;
  const section = title => `<div class="section-label">${e(title)}</div>`;
  function render(data, ui, locale) {
    const p = prefs(data), t = key => T(locale, key), s = ui.sub;
    const imeName = p.ime === 'voice' ? t('Google voice typing') : `${subtypeName(p.subtypes[0] || 'en_US', locale)} - ${t('Android keyboard')}`;
    if (s === 'language') return {title: t('Language & input'), body: row(t('Language'), new Intl.DisplayNames([locale], {type: 'language'}).of(locale.slice(0, 2)).replace(/^./, c => c.toUpperCase()), 'settings-sub', 'lng-locale')
      + withSettings(t('Spelling correction'), t('Android correction'), 'spell', p.spell, 'lng-spell') + row(t('Personal dictionary'), '', 'settings-sub', 'lng-dict')
      + section(t('Keyboard & input methods')) + row(t('Default'), imeName, 'lng-dialog', 'ime')
      + withSettings(t('Android keyboard'), p.subtypes.map(c => subtypeName(c, locale)).join(', '), 'latin', p.latin, 'lng-latin')
      + withSettings(t('Google voice typing'), localeName(p.vsLanguage, locale), 'voiceIme', p.voiceIme, 'lng-voiceime')
      + section(t('Speech')) + row(t('Voice Search'), '', 'settings-sub', 'lng-vs') + row(t('Text-to-speech output'), '', 'settings-sub', 'lng-tts')
      + section(t('Mouse/trackpad')) + row(t('Pointer speed'), '', 'lng-dialog', 'pointer')};
    if (s === 'lng-locale') return {title: t('Language'), body: [['en-US', 'English'], ['hu-HU', 'Magyar'], ['de-DE', 'Deutsch'], ['fr-FR', 'Français'], ['es-ES', 'Español']].map(([code, name]) => `<button class="settings-row wireless-row" data-action="set-language" data-id="${code.slice(0, 2)}" data-no-translate><span class="row-copy">${e(name)}</span></button>`).join('')};
    if (s === 'lng-spell') return {title: t('Spell checking settings'), body: check(t('Use proximity data'), 'proximity', p.proximity, t('Use a keyboard-like proximity algorithm for spell checking'))};
    if (s === 'lng-dict') {
      const words = [...(data.userDictionary || [])].sort((a, b) => a.localeCompare(b, locale));
      return {title: t('Personal dictionary'), right: `<button class="lng-add" data-action="lng-dialog" data-id="add" aria-label="${e(t('Add'))}"><img src="assets/lng-ic_menu_add.png" alt=""></button>`,
        body: words.length ? words.map(w => row(w, '', 'lng-dialog', 'word:' + w)).join('') : `<p class="lng-empty">${e(t("You don't have any words in the user dictionary. Add a word by touching the Add (+) button"))}</p>`};
    }
    if (s === 'lng-latin') return {title: t('Android keyboard settings'), body: section(t('General')) + row(t('Input languages'), p.subtypes.map(c => subtypeName(c, locale)).join(', '), 'settings-sub', 'lng-subtypes')
      + check(t('Auto-capitalization'), 'autoCap', p.autoCap) + check(t('Vibrate on keypress'), 'vibrate', p.vibrate) + check(t('Sound on keypress'), 'sound', p.sound)
      + check(t('Popup on keypress'), 'popup', p.popup) + check(t('Show settings key'), 'settingsKey', p.settingsKey) + row(t('Voice input key'), label('voiceKey', p.voiceKey, locale), 'lng-dialog', 'voiceKey')
      + section(t('Text correction')) + row(t('Add-on dictionaries'), '', 'lng-addons') + row(t('Auto correction'), t('Spacebar and punctuation automatically correct mistyped words'), 'lng-dialog', 'autoCorrect')
      + row(t('Show correction suggestions'), t('Display suggested words while typing'), 'lng-dialog', 'suggestions')
      + section(t('Other options')) + row(t('Advanced settings'), t('Options for expert users'), 'settings-sub', 'lng-latin-adv')};
    if (s === 'lng-latin-adv') return {title: t('Advanced settings'), body: check(t('Suggest Contact names'), 'contactsDict', p.contactsDict, t('Use names from Contacts for suggestions and corrections'))
      + check(t('Bigram suggestions'), 'bigram', p.bigram, t('Use previous word to improve suggestion')) + check(t('Enable recorrections'), 'recorrection', p.recorrection, t('Set suggestions for recorrections'))};
    if (s === 'lng-subtypes') return {title: t('Input languages'), body: SUBTYPES.map(code => check(subtypeName(code, locale), 'subtype:' + code, p.subtypes.includes(code))).join('')};
    if (s === 'lng-voiceime') return {title: t('Google voice typing settings'), body: section(t('General')) + check(t('Block offensive words'), 'imeProfanity', p.imeProfanity, t('Hide recognized offensive text'))};
    if (s === 'lng-vs') return {title: t('Voice Search settings'), body: row(t('Language'), localeName(p.vsLanguage, locale), 'lng-dialog', 'vsLanguage') + row(t('SafeSearch'), label('safeSearch', p.safeSearch, locale), 'lng-dialog', 'safeSearch')
      + check(t('Block offensive words'), 'profanity', p.profanity, t('Hide recognized offensive voice results')) + check(t('Personalized recognition'), 'personalized', p.personalized, t('Improve speech recognition accuracy'))
      + row(t('Google Account dashboard'), t('Manage your collected data'), 'lng-online')};
    if (s === 'lng-tts') return {title: t('Text-to-speech output'), body: section(t('Preferred engine')) + `<div class="settings-row lng-ime"><button class="lng-ime-check" data-action="noop" role="radio" aria-checked="true"><img class="holo-checkbox" src="assets/btn_radio_on_holo_dark.png" alt=""><span class="row-copy">${e(t('Google Text-to-speech Engine'))}</span></button><i></i><button class="lng-ime-settings" data-action="settings-sub" data-id="lng-tts-engine" aria-label="Settings"><img src="assets/lng-ic_sysbar_quicksettings.png" alt=""></button></div>`
      + section(t('General')) + row(t('Speech rate'), t('Speed at which the text is spoken'), 'lng-dialog', 'ttsRate')
      + `<button class="settings-row wireless-row" disabled><span class="row-copy">${e(t('Listen to an example'))}<small>${e(t('Play a short demonstration of speech synthesis'))}</small></span></button>`};
    if (s === 'lng-tts-engine') return {title: t('Google Text-to-speech Engine'), body: row(t('Language'), t('Sets the language-specific voice for the spoken text'), 'lng-dialog', 'ttsLang')
      + row(t('Settings for %s').replace('%s', t('Google Text-to-speech Engine')), '', 'lng-online') + row(t('Install voice data'), t('Install the voice data required for speech synthesis'), 'lng-online')};
    return null;
  }
  // Dialogs: list preferences as Holo single-choice lists, the input method picker, the dictionary word, pointer speed.
  function overlay(data, ui, locale) {
    const p = prefs(data), t = key => T(locale, key), field = ui.lngDialog || '';
    const shell = (title, body, buttons) => `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog lng-dialog" role="dialog" aria-label="${e(title)}"><h3>${e(title)}</h3>${body}${buttons ? `<div class="settings-dialog-actions">${buttons}</div>` : ''}</div>`;
    const radios = (list, title, value) => shell(title, `<div class="lng-radios">${LISTS[list].map(([id, text]) => `<button class="sx-radio" data-action="lng-set" data-id="${list}:${id}" role="radio" aria-checked="${id === value}"><span>${e(text ? t(text) : localeName(id, locale))}</span><img src="assets/btn_radio_${id === value ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join('')}</div>`, `<button data-action="close-overlay">${e(t('Cancel'))}</button>`);
    if (LISTS[field]) return radios(field, {voiceKey: t('Voice input key'), autoCorrect: t('Auto correction'), suggestions: t('Show correction suggestions'), safeSearch: t('SafeSearch'), ttsRate: t('Speech rate'), vsLanguage: t('Language'), ttsLang: t('Language')}[field], p[field]);
    if (field === 'ime') return shell(t('Select input method'), `<div class="lng-radios">${[['latin', t('Android keyboard'), subtypeName(p.subtypes[0] || 'en_US', locale)], ['voice', t('Google voice typing'), localeName(p.vsLanguage, locale)]].filter(([id]) => id === 'latin' ? p.latin : p.voiceIme).map(([id, name, sub]) => `<button class="sx-radio" data-action="lng-set" data-id="ime:${id}" role="radio" aria-checked="${p.ime === id}"><span>${e(name)}<small>${e(sub)}</small></span><img src="assets/btn_radio_${p.ime === id ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join('')}</div><button class="lng-setup" data-action="lng-setup">${e(t('Set up input methods'))}</button>`, '');
    if (field === 'pointer') return shell(t('Pointer speed'), `<input class="lng-seek" type="range" min="-7" max="7" step="1" value="${p.pointerSpeed}" aria-label="${e(t('Pointer speed'))}">`, `<button data-action="close-overlay">${e(t('Cancel'))}</button><button data-action="lng-pointer-ok">${e(t('OK'))}</button>`);
    if (field === 'add' || field.startsWith('edit:')) return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog lng-dialog" data-form="lng-word" role="dialog"><h3>${e(t(field === 'add' ? 'Add to dictionary' : 'Edit word'))}</h3><input class="lng-word" name="word" maxlength="48" value="${e(field.startsWith('edit:') ? field.slice(5) : '')}" autocomplete="off" required><input type="hidden" name="old" value="${e(field.startsWith('edit:') ? field.slice(5) : '')}"><div class="settings-dialog-actions"><button type="button" data-action="close-overlay">${e(t('Cancel'))}</button><button type="submit">${e(t('OK'))}</button></div></form>`;
    if (field.startsWith('word:')) { const w = field.slice(5); return shell(w, `<div class="lng-radios"><button class="sx-radio" data-action="lng-dialog" data-id="edit:${e(w)}"><span>${e(t('Edit'))}</span></button><button class="sx-radio" data-action="lng-word-delete" data-id="${e(w)}"><span>${e(t('Delete'))}</span></button></div>`, ''); }
    return '';
  }
  // Actions; ctx: {data, ui, save, render, renderOverlay, toast}. True when handled.
  function handle(action, id, ctx) {
    const {data, ui} = ctx, p = (data.inputPrefs ||= {}), close = () => { ui.overlay = ''; ui.lngDialog = ''; ctx.renderOverlay(); };
    switch (action) {
      case 'lng-toggle': {
        if (id.startsWith('subtype:')) { const code = id.slice(8), list = prefs(data).subtypes; p.subtypes = list.includes(code) ? (list.length > 1 ? list.filter(c => c !== code) : list) : [...list, code]; }
        else { const cur = prefs(data); if ((id === 'latin' && cur.latin && !cur.voiceIme) || (id === 'voiceIme' && cur.voiceIme && !cur.latin)) return true; p[id] = !cur[id]; if (id === 'latin' && !p[id]) p.ime = 'voice'; if (id === 'voiceIme' && !p[id]) p.ime = 'latin'; }
        ctx.save(); ctx.render(); return true;
      }
      case 'lng-dialog': ui.lngDialog = id; ui.overlay = 'lng-dialog'; ctx.renderOverlay(); if (id === 'add' || id.startsWith('edit:')) requestAnimationFrame(() => document.querySelector('.lng-word')?.focus()); return true;
      case 'lng-set': { const [key, value] = id.split(':'); p[key] = value; close(); ctx.save(); ctx.render(); return true; }
      case 'lng-pointer-ok': p.pointerSpeed = Number(document.querySelector('.lng-seek')?.value) || 0; close(); ctx.save(); return true;
      case 'lng-word-delete': data.userDictionary = (data.userDictionary || []).filter(w => w !== id); close(); ctx.save(); ctx.render(); return true;
      case 'lng-setup': close(); ui.sub = 'language'; ctx.render(); return true;
      case 'lng-addons': case 'lng-online': close(); ctx.toast('This feature is not part of the simulator.'); return true;
    }
    return false;
  }
  function submit(form, values, ctx) {
    if (form !== 'lng-word') return false;
    const {data, ui} = ctx, word = String(values.get('word') || '').trim(), old = String(values.get('old') || '');
    if (!word) return true;
    data.userDictionary = [...new Set([...(data.userDictionary || []).filter(w => w !== old), word])];
    ui.overlay = ''; ui.lngDialog = ''; ctx.renderOverlay(); ctx.save(); ctx.render(); return true;
  }
  window.ICSLanguage = {render, overlay, handle, submit, prefs, T};
})();
