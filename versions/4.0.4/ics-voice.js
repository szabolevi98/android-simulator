/* Voice Search 3.0.1 (VoiceSearch.apk, IMM76I): RecognitionActivity on Theme.Recognition (Theme.Holo.Dialog without a
   title), opened by the search bar's and the Google Search widget's microphone. recognition_dialog.xml at dialog_width
   320 dp: the 48 dp header with the 18 sp state text and the settings button (ic_menu_preferences), the 1 dp divider in
   the state's colour, IndicatorView (100 dp: inactive_ring, the listening level, the working_glow rings turning both
   ways, error_ring) around the image, google_logo and the 14 sp #AAAAAA recognition language; the button bar with
   Cancel, Speak again (errors only) and Help.
   RecognitionDialog: showWaiting (translucent_black divider), showListening ("Speak now", divider_listening #FF0000),
   showWorking ("Working", divider_working #0760B8), showError (divider_error #6C7011, "Speak again" shown).
   The simulator has no microphone, so a capture ends in the recognizer's speech timeout ("No speech heard").
   Help opens help_dialog.xml, whose voice actions VoiceSearch loads from Google's servers (the APK carries none): its
   spinner over Cancel / Speak now. Texts and language names are the APK's. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const STR = {
    'speak_now': {res: 'VoiceSearch:speak_now', en: 'Speak now', hu: 'Most beszéljen', de: 'Jetzt sprechen', fr: 'Parler', es: 'Hablar ahora'},
    'working': {res: 'VoiceSearch:working', en: 'Working', hu: 'Feldolgozás', de: 'In Bearbeitung', fr: 'En cours', es: 'En curso...'},
    'speech_timeout': {res: 'VoiceSearch:speech_timeout', en: 'No speech heard', hu: 'Nem észlelhető beszéd', de: 'Keine Sprachdaten erkannt', fr: 'Aucune requête vocale détectée.', es: 'Voz no detectada'},
    'cancel': {res: 'VoiceSearch:cancel', en: 'Cancel', hu: 'Mégse', de: 'Abbrechen', fr: 'Annuler', es: 'Cancelar'},
    'tryagain': {res: 'VoiceSearch:tryagain', en: 'Speak again', hu: 'Újramondás', de: 'Wiederholen', fr: 'Réessayer', es: 'Volver a hablar'},
    'help': {res: 'VoiceSearch:help', en: 'Help', hu: 'Súgó', de: 'Hilfe', fr: 'Aide', es: 'Ayuda'},
    'settings_button': {res: 'VoiceSearch:settings_button', en: 'Settings', hu: 'Beállítások', de: 'Einstellungen', fr: 'Paramètres', es: 'Ajustes'}
  };
  // languageCodes / languageNames: the recognition language (Voice Search settings' Language) in the interface language.
  const LANGUAGE_NAMES = {
    'en-US': {res: 'VoiceSearch:voice_ime_language_en_us', en: 'English (US)', hu: 'angol (Amerikai Egyesült Államok)', de: 'Englisch (USA)', fr: 'Anglais (États-Unis)', es: 'inglés (Estados Unidos)'},
    'en-GB': {res: 'VoiceSearch:voice_ime_language_en_gb', en: 'English (UK)', hu: 'angol (Egyesült-Királyság)', de: 'Englisch (Großbritannien)', fr: 'Anglais (Royaume-Uni)', es: 'inglés (Reino Unido)'},
    'de-DE': {res: 'VoiceSearch:voice_ime_language_de_de', en: 'German (Germany)', hu: 'német (Németország)', de: 'Deutsch (Deutschland)', fr: 'Allemand (Allemagne)', es: 'alemán (Alemania)'},
    'es-ES': {res: 'VoiceSearch:voice_ime_language_es_es', en: 'Spanish (Spain)', hu: 'spanyol (Spanyolország)', de: 'Spanisch (Spanien)', fr: 'Espagnol (Espagne)', es: 'español (España)'},
    'fr-FR': {res: 'VoiceSearch:voice_ime_language_fr_fr', en: 'French (France)', hu: 'francia (Franciaország)', de: 'Französisch (Frankreich)', fr: 'Français (France)', es: 'francés (Francia)'},
    'hu-HU': {res: 'VoiceSearch:voice_ime_language_hu_hu', en: 'Hungarian (Hungary)', hu: 'magyar (Magyarország)', de: 'Ungarisch (Ungarn)', fr: 'Hongrois (Hongrie)', es: 'húngaro (Hungría)'}
  };
  const TABLE = AndroidStrings.table('', STR), text = (lang, key) => TABLE.t(key, lang);
  const WAIT_MS = 400, LISTEN_MS = 5000;
  const DIVIDER = {waiting: '#dd000000', listening: '#ff0000', working: '#0760b8', error: '#6c7011'};
  function render(state, lang, recognition = 'en-US', now = Date.now()) {
    const T = key => text(lang, key), phase = state.phase;
    if (phase === 'help') return `<div class="vs3-scrim" data-action="vs3-cancel"></div><div class="vs3-dialog vs3-help" role="dialog" aria-label="${e(T('help'))}"><div class="vs3-body"><span class="vs3-spinny" aria-hidden="true"></span></div><div class="vs3-buttons"><button data-action="vs3-cancel">${e(T('cancel'))}</button><button data-action="vs3-again">${e(T('speak_now'))}</button></div></div>`;
    const header = phase === 'listening' ? T('speak_now') : phase === 'working' ? T('working') : phase === 'error' ? T('speech_timeout') : '';
    const level = phase === 'listening' ? .35 + .5 * Math.abs(Math.sin(now / 230) * Math.sin(now / 570)) : 0;
    const ring = phase === 'working' ? '<img class="vs3-ring vs3-spin" src="assets/vs3-working_glow.png" alt=""><img class="vs3-ring vs3-spin-rev" src="assets/vs3-working_glow.png" alt="">'
      : phase === 'error' ? '<img class="vs3-ring" src="assets/vs3-error_ring.png" alt="">'
      : `<img class="vs3-ring" src="assets/vs3-inactive_ring.png" alt="">${phase === 'listening' ? `<img class="vs3-ring vs3-level" src="assets/vs3-listen_outer_glow.png" alt="" style="transform:scale(${(.8 + level * .4).toFixed(3)});opacity:${level.toFixed(2)}">` : ''}`;
    const image = phase === 'error' ? 'ic_error' : 'ic_mic_cd';
    return `<div class="vs3-scrim" data-action="vs3-cancel"></div><div class="vs3-dialog" role="dialog" aria-label="${e(header || T('speak_now'))}"><div class="vs3-body"><div class="vs3-header"><span>${e(header)}</span><button class="vs3-settings" data-action="vs3-settings" aria-label="${e(T('settings_button'))}"><img src="assets/vs3-ic_menu_preferences.png" alt=""></button></div><i class="vs3-divider" style="background:${DIVIDER[phase] || DIVIDER.waiting}"></i><div class="vs3-indicator">${ring}<img class="vs3-image" src="assets/vs3-${image}.png" alt=""></div><img class="vs3-logo" src="assets/vs3-google_logo.png" alt="Google"><span class="vs3-lang">${e(AndroidStrings.pick(LANGUAGE_NAMES[recognition] || LANGUAGE_NAMES['en-US'], lang, recognition))}</span></div><div class="vs3-buttons"><button data-action="vs3-cancel">${e(T('cancel'))}</button>${phase === 'error' ? `<button data-action="vs3-again">${e(T('tryagain'))}</button>` : ''}<button data-action="vs3-help">${e(T('help'))}</button></div></div>`;
  }
  window.ICSVoice = {STR, text, WAIT_MS, LISTEN_MS, render};
})();
