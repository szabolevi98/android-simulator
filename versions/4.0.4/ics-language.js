/* Settings > Language & input of the Galaxy Nexus image (IMM76I), from Settings.apk res/xml/language_settings.xml and
   the pages it opens, with the texts of the APKs that draw them (docs/tools/apk-strings.py):
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
  const STRINGS = {
    "Language & input": {"res": "Settings:language_keyboard_settings_title", "hu": "Nyelv és bevitel", "de": "Sprache & Eingabe", "fr": "Langue et saisie", "es": "Idioma y entrada de texto"},
    "Language": {"res": "Settings:phone_language", "hu": "Nyelv", "de": "Sprache", "fr": "Langue", "es": "Idioma"},
    "Spelling correction": {"res": "Settings:spellcheckers_settings_title", "hu": "Helyesírás-ellenőrzés és -javítás", "de": "Rechtschreibprüfung", "fr": "Correction orthographique", "es": "Corrección ortográfica"},
    "Personal dictionary": {"res": "Settings:user_dict_single_settings_title", "hu": "Személyes szótár", "de": "Persönliches Wörterbuch", "fr": "Dictionnaire personnel", "es": "Diccionario personal"},
    "Keyboard & input methods": {"res": "Settings:keyboard_settings_category", "hu": "Billentyűzet- és beviteli módok", "de": "Tastatur und Eingabemethoden", "fr": "Clavier et modes de saisie", "es": "Teclado y métodos de introducción"},
    "Default": {"res": "Settings:current_input_method", "hu": "Alapértelmezett", "de": "Standard", "fr": "Par défaut", "es": "Predeterminado"},
    "Speech": {"res": "Settings:voice_category", "hu": "Beszéd", "de": "Sprache", "fr": "Voix", "es": "Voz"},
    "Voice Search": {"res": "Settings:recognizer_settings_title", "hu": "Hangalapú keresés", "de": "Sprachsuche", "fr": "Recherche vocale", "es": "Búsqueda por voz"},
    "Text-to-speech output": {"res": "Settings:tts_settings_title", "hu": "Szövegfelolvasó kimenet", "de": "Text-in-Sprache-Ausgabe", "fr": "Sortie de la synthèse vocale", "es": "Síntesis de voz"},
    "Mouse/trackpad": {"res": "Settings:pointer_settings_category", "hu": "Egér/érintőpad", "de": "Maus/Touchpad", "fr": "Souris/Pavé tactile", "es": "Ratón/trackpad"},
    "Pointer speed": {"res": "Settings:pointer_speed", "hu": "Mutató sebessége", "de": "Zeigergeschwindigkeit", "fr": "Vitesse du pointeur", "es": "Velocidad del puntero"},
    "Add to dictionary": {"res": "Settings:user_dict_settings_add_dialog_title", "hu": "Hozzáadás a szótárhoz", "de": "Ins Wörterbuch", "fr": "Ajouter au dictionnaire", "es": "Añadir al diccionario"},
    "Add": {"res": "Settings:user_dict_settings_add_menu_title", "hu": "Hozzáadás", "de": "Hinzufügen", "fr": "Ajouter", "es": "Añadir"},
    "Edit": {"res": "Settings:user_dict_settings_context_menu_edit_title", "hu": "Szerkesztés", "de": "Bearbeiten", "fr": "Modifier", "es": "Editar"},
    "Delete": {"res": "Settings:user_dict_settings_context_menu_delete_title", "hu": "Törlés", "de": "Löschen", "fr": "Supprimer", "es": "Eliminar"},
    "Edit word": {"res": "Settings:user_dict_settings_edit_dialog_title", "hu": "Szó szerkesztése", "de": "Wort bearbeiten", "fr": "Modifier le mot", "es": "Editar palabra"},
    "You don't have any words in the user dictionary. Add a word by touching the Add (+) button": {"res": "Settings:user_dict_settings_empty_text", "hu": "Nincsenek szavak a felhasználói szótárban. Új szavakat a Hozzáadás (+) gomb megérintésével vehet fel.", "de": "Es sind keine Wörter in Ihrem Wörterbuch vorhanden. Sie können durch Berühren der Schaltfläche \"+\" ein Wort hinzufügen.", "fr": "Votre dictionnaire personnel ne contient aucun mot. Ajoutez un mot en appuyant sur le bouton d'ajout (\"+\").", "es": "No tienes ninguna palabra en el diccionario del usuario. Toca el botón Añadir (+) para añadir una palabra.", "en": "You don't have any words in the user dictionary. Add a word by touching the Add (+) button."},
    "Set up input methods": {"res": "Settings:configure_input_method", "hu": "Beviteli módok beállítása", "de": "Eingabemethoden einrichten", "fr": "Configurer les méthodes de saisie", "es": "Configurar métodos de introducción"},
    "Preferred engine": {"res": "Settings:tts_engine_preference_section_title", "hu": "Preferált motor", "de": "Bevorzugtes Modul", "fr": "Moteur préféré", "es": "Motor preferido"},
    "General": {"res": "Settings:tts_general_section_title", "hu": "Általános", "de": "Allgemein", "fr": "Paramètres généraux", "es": "General"},
    "Speech rate": {"res": "Settings:tts_default_rate_title", "hu": "Beszéd sebessége", "de": "Sprechgeschwindigkeit", "fr": "Cadence", "es": "Velocidad de la voz"},
    "Speed at which the text is spoken": {"res": "Settings:tts_default_rate_summary", "hu": "A szöveg kimondásának sebessége", "de": "Geschwindigkeit, mit der der Text gesprochen wird", "fr": "Vitesse à laquelle le texte est énoncé", "es": "Velocidad a la que se lee el texto"},
    "Listen to an example": {"res": "Settings:tts_play_example_title", "hu": "Példa meghallgatása", "de": "Beispiel anhören", "fr": "Écouter un échantillon", "es": "Escuchar un ejemplo"},
    "Play a short demonstration of speech synthesis": {"res": "Settings:tts_play_example_summary", "hu": "Rövid demonstráció megtekintése a beszédszintézisről", "de": "Kurze Demonstration der Sprachsynthese abspielen", "fr": "Lire une courte démonstration de la synthèse vocale", "es": "Reproducir una breve demostración de síntesis de voz"},
    "Very slow": {"res": "Settings:@array/tts_rate_entries:0", "hu": "Nagyon lassú", "de": "Sehr langsam", "fr": "Très lente", "es": "Muy lenta"},
    "Slow": {"res": "Settings:@array/tts_rate_entries:1", "hu": "Lassú", "de": "Langsam", "fr": "Lente", "es": "Lenta"},
    "Normal": {"res": "Settings:@array/tts_rate_entries:2", "hu": "Normál", "de": "Normal", "fr": "Normale", "es": "Normal"},
    "Fast": {"res": "Settings:@array/tts_rate_entries:3", "hu": "Gyors", "de": "Schnell", "fr": "Rapide", "es": "Rápida"},
    "Very fast": {"res": "Settings:@array/tts_rate_entries:4", "hu": "Nagyon gyors", "de": "Sehr schnell", "fr": "Très rapide", "es": "Muy rápida"},
    "Settings for %s": {"res": "Settings:tts_engine_settings_title", "hu": "A(z) %s beállításai", "de": "Einstellungen für %s", "fr": "Paramètres de %s", "es": "Ajustes de %s"},
    "Install voice data": {"res": "Settings:tts_install_data_title", "hu": "Hangadatok telepítése", "de": "Sprachdaten installieren", "fr": "Installer les données vocales", "es": "Instalar archivos de voz"},
    "Install the voice data required for speech synthesis": {"res": "Settings:tts_install_data_summary", "hu": "A beszédszintetizáláshoz szükséges hangadatok telepítése", "de": "Sprachdaten für Sprachsynthese installieren", "fr": "Installer les données nécessaires à la synthèse vocale", "es": "Instalar los archivos de datos de voz necesarios para la síntesis de voz"},
    "Sets the language-specific voice for the spoken text": {"res": "Settings:tts_default_lang_summary", "hu": "Beállítja a beszélt szöveg nyelvspecifikus hangját", "de": "Legt die sprachspezifische Stimme für den gesprochenen Text fest", "fr": "Définir la langue utilisée par la synthèse vocale", "es": "Establecer la voz del idioma específico para el texto hablado"},
    "Cancel": {"res": "Settings:cancel", "hu": "Mégse", "de": "Abbrechen", "fr": "Annuler", "es": "Cancelar"},
    "OK": {"res": "framework:ok", "hu": "OK", "de": "OK", "fr": "OK", "es": "Aceptar"},
    "Select input method": {"res": "framework:select_input_method", "hu": "Válassza ki a beviteli módszert", "de": "Eingabemethode auswählen", "fr": "Sélectionner un mode de saisie", "es": "Selecciona un método de introducción de texto"},
    "Android keyboard": {"res": "LatinImeGoogle:english_ime_name", "hu": "Android-billentyűzet", "de": "Android-Tastatur", "fr": "Clavier Android", "es": "Teclado de Android"},
    "Android keyboard settings": {"res": "LatinImeGoogle:english_ime_settings", "hu": "Android billentyűzetbeállítások", "de": "Android-Tastatureinstellungen", "fr": "Paramètres du clavier Android", "es": "Ajustes del teclado de Android"},
    "English (US)": {"res": "LatinImeGoogle:subtype_en_US", "hu": "angol (amerikai)", "de": "Englisch (USA)", "fr": "Anglais (États-Unis)", "es": "inglés (EE.UU.)"},
    "English (UK)": {"res": "LatinImeGoogle:subtype_en_GB", "hu": "angol (brit)", "de": "Englisch (Großbritannien)", "fr": "Anglais (Royaume-Uni)", "es": "inglés (Reino Unido)"},
    "Input languages": {"res": "LatinImeGoogle:language_selection_title", "hu": "Beviteli nyelvek", "de": "Eingabesprachen", "fr": "Langues de saisie", "es": "Idiomas"},
    "Auto-capitalization": {"res": "LatinImeGoogle:auto_cap", "hu": "Automatikusan nagy kezdőbetű", "de": "Autom. Groß-/Kleinschr.", "fr": "Majuscules auto", "es": "Mayúsculas automáticas"},
    "Vibrate on keypress": {"res": "LatinImeGoogle:vibrate_on_keypress", "hu": "Rezgés billentyű megnyomása esetén", "de": "Bei Tastendruck vibrieren", "fr": "Vibrer à chaque touche", "es": "Vibrar al pulsar tecla"},
    "Sound on keypress": {"res": "LatinImeGoogle:sound_on_keypress", "hu": "Hangjelzés billentyű megnyomása esetén", "de": "Ton bei Tastendruck", "fr": "Son à chaque touche", "es": "Sonido al pulsar tecla"},
    "Popup on keypress": {"res": "LatinImeGoogle:popup_on_keypress", "hu": "Legyen nagyobb billentyű lenyomásakor", "de": "Pop-up bei Tastendruck", "fr": "Agrandir les caractères", "es": "Pop-up al pulsar tecla"},
    "Show settings key": {"res": "LatinImeGoogle:prefs_settings_key", "hu": "Beállítások billentyű megjelenítése", "de": "Taste für Einstellungen", "fr": "Afficher touche param.", "es": "Mostrar tecla de ajustes"},
    "Voice input key": {"res": "LatinImeGoogle:voice_input", "hu": "Hangbeviteli gomb", "de": "Taste für Spracheingabe", "fr": "Touche de saisie vocale", "es": "Tecla de entrada de voz"},
    "On main keyboard": {"res": "LatinImeGoogle:voice_input_modes_main_keyboard", "hu": "A fő billentyűzeten", "de": "Auf Haupttastatur", "fr": "Sur clavier principal", "es": "En teclado principal"},
    "On symbols keyboard": {"res": "LatinImeGoogle:voice_input_modes_symbols_keyboard", "hu": "Szimbólumoknál", "de": "Auf Symboltastatur", "fr": "Sur clavier symboles", "es": "En teclado de símbolos"},
    "Off": {"res": "LatinImeGoogle:voice_input_modes_off", "hu": "Ki", "de": "Aus", "fr": "Désactiver", "es": "Desactivada"},
    "Text correction": {"res": "LatinImeGoogle:correction_category", "hu": "Szövegjavítás", "de": "Textkorrektur", "fr": "Correction du texte", "es": "Corrección ortográfica"},
    "Add-on dictionaries": {"res": "LatinImeGoogle:configure_dictionaries_title", "hu": "Bővítmények: szótárak", "de": "Erweiterte Wörterbücher", "fr": "Dictionnaires complémentaires", "es": "Diccionarios complementarios"},
    "Auto correction": {"res": "LatinImeGoogle:auto_correction", "hu": "Automatikus javítás", "de": "Autokorrektur", "fr": "Correction automatique", "es": "Autocorrección"},
    "Spacebar and punctuation automatically correct mistyped words": {"res": "LatinImeGoogle:auto_correction_summary", "hu": "Szóköz és központozás automatikusan javítja az elgépelést", "de": "Korrektur fehlerhafter Wörter durch Leertaste und Satzzeichen", "fr": "Corriger autom. orthographe (pression sur barre espace/signes ponctuation)", "es": "Pulsar la tecla de espacio o punto para corregir errores"},
    "Modest": {"res": "LatinImeGoogle:auto_correction_threshold_mode_modest", "hu": "Mérsékelt", "de": "Mäßig", "fr": "Simple", "es": "Parcial"},
    "Aggressive": {"res": "LatinImeGoogle:auto_correction_threshold_mode_aggeressive", "hu": "Agresszív", "de": "Stark", "fr": "Proactive", "es": "Total"},
    "Very aggressive": {"res": "LatinImeGoogle:auto_correction_threshold_mode_very_aggeressive", "hu": "Nagyon agresszív", "de": "Sehr stark", "fr": "Très exigeante", "es": "Muy agresiva"},
    "Show correction suggestions": {"res": "LatinImeGoogle:prefs_show_suggestions", "hu": "Javítási ajánlások megjelenítése", "de": "Änderungsvorschläge", "fr": "Afficher les suggestions de correction", "es": "Mostrar sugerencias de correcciones"},
    "Display suggested words while typing": {"res": "LatinImeGoogle:prefs_show_suggestions_summary", "hu": "A javasolt szavak megjelenítése gépelés közben", "de": "Vorgeschlagene Wörter während des Tippens anzeigen", "fr": "Afficher les suggestions de terme lors de la saisie", "es": "Muestra las palabras sugeridas mientras se escribe."},
    "Always show": {"res": "LatinImeGoogle:prefs_suggestion_visibility_show_name", "hu": "Mindig látszik", "de": "Immer anzeigen", "fr": "Toujours afficher", "es": "Mostrar siempre"},
    "Show on portrait mode": {"res": "LatinImeGoogle:prefs_suggestion_visibility_show_only_portrait_name", "hu": "Megjelenítés álló tájolásban", "de": "Im Hochformat anzeigen", "fr": "Afficher en mode Portrait", "es": "Mostrar en modo vertical"},
    "Always hide": {"res": "LatinImeGoogle:prefs_suggestion_visibility_hide_name", "hu": "Mindig rejtve", "de": "Nie anzeigen", "fr": "Toujours masquer", "es": "Ocultar siempre"},
    "Other options": {"res": "LatinImeGoogle:misc_category", "hu": "Egyéb beállítások", "de": "Sonstige Optionen", "fr": "Autres options", "es": "Otras opciones"},
    "Advanced settings": {"res": "LatinImeGoogle:advanced_settings", "hu": "Speciális beállítások", "de": "Erweiterte Einstellungen", "fr": "Paramètres avancés", "es": "Ajustes avanzados"},
    "Options for expert users": {"res": "LatinImeGoogle:advanced_settings_summary", "hu": "Beállítások gyakorlott felhasználóknak", "de": "Optionen für Experten", "fr": "Options destinées aux utilisateurs expérimentés", "es": "Opciones para usuarios expertos"},
    "Suggest Contact names": {"res": "LatinImeGoogle:use_contacts_dict", "hu": "Javasolt névjegyek", "de": "Kontakte vorschlagen", "fr": "Proposer noms de contacts", "es": "Sugerir nombres contactos"},
    "Use names from Contacts for suggestions and corrections": {"res": "LatinImeGoogle:use_contacts_dict_summary", "hu": "A névjegyek használata a javaslatokhoz és javításokhoz", "de": "Namen aus \"Kontakte\" als Vorschläge und Korrekturmöglichkeiten anzeigen", "fr": "Utiliser des noms de contacts pour les suggestions et corrections", "es": "Utilizar nombres de contactos para sugerencias y correcciones"},
    "Bigram suggestions": {"res": "LatinImeGoogle:bigram_suggestion", "hu": "Bigram javaslatok", "de": "Bigramm-Vorschläge", "fr": "Suggestions de type bigramme", "es": "Sugerencias de bigramas"},
    "Use previous word to improve suggestion": {"res": "LatinImeGoogle:bigram_suggestion_summary", "hu": "Előző szó használata a javaslatok javításához", "de": "Zur Verbesserung des Vorschlags vorheriges Wort verwenden", "fr": "Améliorer la suggestion en fonction du mot précédent", "es": "Usar palabra anterior para mejorar sugerencias"},
    "Enable recorrections": {"res": "LatinImeGoogle:enable_span_insert", "hu": "Újbóli javítás engedélyezése", "de": "Korrekturen aktivieren", "fr": "Activer la recorrection", "es": "Activar nuevas correcciones"},
    "Set suggestions for recorrections": {"res": "LatinImeGoogle:enable_span_insert_summary", "hu": "Javaslatok beállítása az újbóli javításokhoz", "de": "Vorschläge für Korrekturen festlegen", "fr": "Définir des suggestions de recorrection", "es": "Establecer sugerencias para nuevas correcciones"},
    "Android correction": {"res": "LatinImeGoogle:spell_checker_service_name", "hu": "Android korrekció", "de": "Rechtschreibprüfung für Android", "fr": "Correcteur Android", "es": "Corrector de Android"},
    "Spell checking settings": {"res": "LatinImeGoogle:android_spell_checker_settings", "hu": "Helyesírás-ellenőrzés beállításai", "de": "Einstellungen für Rechtschreibprüfung", "fr": "Paramètre du correcteur orthographique", "es": "Ajustes del corrector ortográfico"},
    "Use proximity data": {"res": "LatinImeGoogle:use_proximity_option_title", "hu": "Közelségi adatok haszn.", "de": "Näherungsdaten verwenden", "fr": "Utiliser données proximité", "es": "Usar datos de proximidad"},
    "Use a keyboard-like proximity algorithm for spell checking": {"res": "LatinImeGoogle:use_proximity_option_summary", "hu": "Billentyűzetszerű algoritmus a helyesírás-ellenőrzéshez", "de": "Tastaturähnl. Abstandsalgorith. für Rechtschreibprüfung verwenden", "fr": "Utiliser algorithme de proximité clavier pour correcteur ortho", "es": "Usar algoritmo de proximidad de teclado para corregir la ortografía"},
    "Google voice typing": {"res": "VoiceSearch:ime_service_label", "hu": "Google hangalapú gépelés", "de": "Google-Spracheingabe", "fr": "Saisie Google Voice", "es": "Escritura por voz de Google"},
    "Google voice typing settings": {"res": "VoiceSearch:imePreferences", "hu": "A Google hangalapú gépelés beállításai", "de": "Einstellungen für Google-Spracheingabe", "fr": "Paramètres de saisie Google Voice", "es": "Ajustes de escritura por voz de Google"},
    "Block offensive words": {"res": "VoiceSearch:prefTitle_profanityFilter", "hu": "Sértő szavak kizárása", "de": "Anstößiges blockieren", "fr": "Bloquer les termes choquants", "es": "Filtrar palabras ofensivas"},
    "Hide recognized offensive text": {"res": "VoiceSearch:prefSummary_ime_profanityFilter", "hu": "A felismert sértő szöveg elrejtése", "de": "Erkannten anstößigen Text ausblenden", "fr": "Masquer les contenus choquants", "es": "Ocultar texto ofensivo reconocido"},
    "Voice Search settings": {"res": "VoiceSearch:voiceSearchPreferences", "hu": "Hangalapú keresés beállításai", "de": "Sprachsuche - Einstell.", "fr": "Paramètres rech. vocale", "es": "Ajustes de Búsqueda por voz"},
    "SafeSearch": {"res": "VoiceSearch:prefTitle_safeSearch", "hu": "Biztonságos Keresés", "de": "SafeSearch", "fr": "SafeSearch", "es": "SafeSearch"},
    "Moderate": {"res": "VoiceSearch:@array/prefEntries_safeSearch:1", "hu": "Közepes", "de": "Moderat", "fr": "Modéré", "es": "Moderado"},
    "Strict": {"res": "VoiceSearch:@array/prefEntries_safeSearch:2", "hu": "Szigorú", "de": "Strikt", "fr": "Strict", "es": "Estricto"},
    "Hide recognized offensive voice results": {"res": "VoiceSearch:prefSummary_profanityFilter", "hu": "A felismert sértő hangtalálatok elrejtése", "de": "Ergebnisse für erkannte anstößige Begriffe ausblenden", "fr": "Masquer les résultats de recherche vocale qui contiennent des termes choquants", "es": "Ocultar los resultados de voz ofensivos reconocidos"},
    "Personalized recognition": {"res": "VoiceSearch:personalization_header", "hu": "Személyre szabott felismerés", "de": "Personalisierte Erkennung", "fr": "Reconnaissance personnalisée", "es": "Reconocimiento personalizado"},
    "Improve speech recognition accuracy": {"res": "VoiceSearch:personalization_settings_message", "hu": "Beszédfelismerés pontosságának javítása", "de": "Qualität der Spracherkennung verbessern", "fr": "Améliorez la précision de la reconnaissance vocale.", "es": "Mejora la precisión del reconocimiento de voz."},
    "Google Account dashboard": {"res": "VoiceSearch:manage_personalization", "hu": "Google Fiók irányítópult", "de": "Google-Konto-Dashboard", "fr": "Tableau de bord du compte Google", "es": "Panel de cuentas de Google"},
    "Manage your collected data": {"res": "VoiceSearch:manage_personalization_message", "hu": "Az összegyűjtött adatok kezelése", "de": "Verwaltung Ihrer gesammelten Daten", "fr": "Gérer les données collectées", "es": "Permite administrar los datos recopilados."},
    "Google Text-to-speech Engine": {"res": "GoogleTTS:app_name", "hu": "Google Szövegfelolvasó", "de": "Google Text-in-Sprache-Engine", "fr": "Moteur de synthèse vocale Google", "es": "Síntesis de voz de Google"}
  };
  const STR = AndroidStrings.table('', STRINGS), T = (locale, key) => STR.t(key, locale);
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
      + row(AndroidStrings.format(t('Settings for %s'), t('Google Text-to-speech Engine')), '', 'lng-online') + row(t('Install voice data'), t('Install the voice data required for speech synthesis'), 'lng-online')};
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
