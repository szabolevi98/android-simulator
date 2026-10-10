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
  const LANGS = ['en', 'hu', 'de', 'fr', 'es'];
  const STR = {
    speak_now: ["Speak now", "Most beszéljen", "Jetzt sprechen", "Parler", "Hablar ahora"],
    working: ["Working", "Feldolgozás", "In Bearbeitung", "En cours", "En curso..."],
    speech_timeout: ["No speech heard", "Nem észlelhető beszéd", "Keine Sprachdaten erkannt", "Aucune requête vocale détectée.", "Voz no detectada"],
    cancel: ["Cancel", "Mégse", "Abbrechen", "Annuler", "Cancelar"],
    tryagain: ["Speak again", "Újramondás", "Wiederholen", "Réessayer", "Volver a hablar"],
    help: ["Help", "Súgó", "Hilfe", "Aide", "Ayuda"],
    settings_button: ["Settings", "Beállítások", "Einstellungen", "Paramètres", "Ajustes"]
  };
  // languageCodes / languageNames: the recognition language (Voice Search settings' Language) in the interface language.
  const LANGUAGE_NAMES = {
    'en-US': ["English (US)", "angol (Egyesült Államok)", "Englisch (USA)", "Anglais (États-Unis)", "inglés (EE.UU.)"],
    'en-GB': ["English (UK)", "angol (Egyesült Királyság)", "Englisch (Großbritannien)", "Anglais (Royaume-Uni)", "inglés (Reino Unido)"],
    'de-DE': ["German (Germany)", "német (Németország)", "Deutsch (Deutschland)", "Allemand (Allemagne)", "alemán (Alemania)"],
    'es-ES': ["Spanish (Spain)", "spanyol (Spanyolország)", "Spanisch (Spanien)", "Espagnol (Espagne)", "español (España)"],
    'fr-FR': ["French (France)", "francia (Franciaország)", "Französisch (Frankreich)", "Français (France)", "francés (Francia)"],
    'hu-HU': ["Hungarian (Hungary)", "magyar (Magyarország)", "Ungarisch (Ungarn)", "Hongrois (Hongrie)", "húngaro (Hungría)"]
  };
  const text = (lang, key) => (STR[key] || [key])[Math.max(0, LANGS.indexOf(lang))];
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
    return `<div class="vs3-scrim" data-action="vs3-cancel"></div><div class="vs3-dialog" role="dialog" aria-label="${e(header || T('speak_now'))}"><div class="vs3-body"><div class="vs3-header"><span>${e(header)}</span><button class="vs3-settings" data-action="vs3-settings" aria-label="${e(T('settings_button'))}"><img src="assets/vs3-ic_menu_preferences.png" alt=""></button></div><i class="vs3-divider" style="background:${DIVIDER[phase] || DIVIDER.waiting}"></i><div class="vs3-indicator">${ring}<img class="vs3-image" src="assets/vs3-${image}.png" alt=""></div><img class="vs3-logo" src="assets/vs3-google_logo.png" alt="Google"><span class="vs3-lang">${e((LANGUAGE_NAMES[recognition] || LANGUAGE_NAMES['en-US'])[Math.max(0, LANGS.indexOf(lang))])}</span></div><div class="vs3-buttons"><button data-action="vs3-cancel">${e(T('cancel'))}</button>${phase === 'error' ? `<button data-action="vs3-again">${e(T('tryagain'))}</button>` : ''}<button data-action="vs3-help">${e(T('help'))}</button></div></div>`;
  }
  window.ICSVoice = {STR, text, WAIT_MS, LISTEN_MS, render};
})();
