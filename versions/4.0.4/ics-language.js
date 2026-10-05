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
  const STRINGS = {
      "Language & input": [
          "Nyelv és bevitel",
          "Sprache & Eingabe",
          "Langue et saisie",
          "Idioma y entrada de texto"
      ],
      "Language": [
          "Nyelv",
          "Sprache",
          "Langue",
          "Idioma"
      ],
      "Spelling correction": [
          "Helyesírás-ellenőrzés és -javítás",
          "Rechtschreibprüfung",
          "Correction orthographique",
          "Corrección ortográfica"
      ],
      "Personal dictionary": [
          "Személyes szótár",
          "Persönliches Wörterbuch",
          "Dictionnaire personnel",
          "Diccionario personal"
      ],
      "Keyboard & input methods": [
          "Billentyűzet- és beviteli módok",
          "Tastatur und Eingabemethoden",
          "Clavier et modes de saisie",
          "Teclado y métodos de introducción"
      ],
      "Default": [
          "Alapértelmezett",
          "Standard",
          "Par défaut",
          "Predeterminado"
      ],
      "Speech": [
          "Beszéd",
          "Sprache",
          "Voix",
          "Voz"
      ],
      "Voice Search": [
          "Hangalapú keresés",
          "Sprachsuche",
          "Recherche vocale",
          "Búsqueda por voz"
      ],
      "Text-to-speech output": [
          "Szövegfelolvasó kimenet",
          "Text-in-Sprache-Ausgabe",
          "Sortie de la synthèse vocale",
          "Síntesis de voz"
      ],
      "Mouse/trackpad": [
          "Egér/érintőpad",
          "Maus/Touchpad",
          "Souris/Pavé tactile",
          "Ratón/trackpad"
      ],
      "Pointer speed": [
          "Mutató sebessége",
          "Zeigergeschwindigkeit",
          "Vitesse du pointeur",
          "Velocidad del puntero"
      ],
      "Add to dictionary": [
          "Hozzáadás a szótárhoz",
          "Ins Wörterbuch",
          "Ajouter au dictionnaire",
          "Añadir al diccionario"
      ],
      "Add": [
          "Hozzáadás",
          "Hinzufügen",
          "Ajouter",
          "Añadir"
      ],
      "Edit": [
          "Szerkesztés",
          "Bearbeiten",
          "Modifier",
          "Editar"
      ],
      "Delete": [
          "Törlés",
          "Löschen",
          "Supprimer",
          "Eliminar"
      ],
      "Edit word": [
          "Szó szerkesztése",
          "Wort bearbeiten",
          "Modifier le mot",
          "Editar palabra"
      ],
      "You don't have any words in the user dictionary. Add a word by touching the Add (+) button": [
          "Nincsenek szavak a felhasználói szótárban. Új szavakat a Hozzáadás (+) gomb megérintésével vehet fel.",
          "Es sind keine Wörter in Ihrem Wörterbuch vorhanden. Sie können durch Berühren der Schaltfläche \"+\" ein Wort hinzufügen.",
          "Votre dictionnaire personnel ne contient aucun mot. Ajoutez un mot en appuyant sur le bouton d'ajout (\"+\").",
          "No tienes ninguna palabra en el diccionario del usuario. Toca el botón Añadir (+) para añadir una palabra.",
          "You don't have any words in the user dictionary. Add a word by touching the Add (+) button."
      ],
      "Set up input methods": [
          "Beviteli módok beállítása",
          "Eingabemethoden einrichten",
          "Configurer les méthodes de saisie",
          "Configurar métodos de introducción"
      ],
      "Preferred engine": [
          "Preferált motor",
          "Bevorzugtes Modul",
          "Moteur préféré",
          "Motor preferido"
      ],
      "General": [
          "Általános",
          "Allgemein",
          "Paramètres généraux",
          "General"
      ],
      "Speech rate": [
          "Beszéd sebessége",
          "Sprechgeschwindigkeit",
          "Cadence",
          "Velocidad de la voz"
      ],
      "Speed at which the text is spoken": [
          "A szöveg kimondásának sebessége",
          "Geschwindigkeit, mit der der Text gesprochen wird",
          "Vitesse à laquelle le texte est énoncé",
          "Velocidad a la que se lee el texto"
      ],
      "Listen to an example": [
          "Példa meghallgatása",
          "Beispiel anhören",
          "Écouter un échantillon",
          "Escuchar un ejemplo"
      ],
      "Play a short demonstration of speech synthesis": [
          "Rövid demonstráció megtekintése a beszédszintézisről",
          "Kurze Demonstration der Sprachsynthese abspielen",
          "Lire une courte démonstration de la synthèse vocale",
          "Reproducir una breve demostración de síntesis de voz"
      ],
      "Very slow": [
          "Nagyon lassú",
          "Sehr langsam",
          "Très lente",
          "Muy lenta"
      ],
      "Slow": [
          "Lassú",
          "Langsam",
          "Lente",
          "Lenta"
      ],
      "Normal": [
          "Normál",
          "Normal",
          "Normale",
          "Normal"
      ],
      "Fast": [
          "Gyors",
          "Schnell",
          "Rapide",
          "Rápida"
      ],
      "Very fast": [
          "Nagyon gyors",
          "Sehr schnell",
          "Très rapide",
          "Muy rápida"
      ],
      "Settings for %s": [
          "A(z) %s beállításai",
          "Einstellungen für %s",
          "Paramètres de %s",
          "Ajustes de %s"
      ],
      "Install voice data": [
          "Hangadatok telepítése",
          "Sprachdaten installieren",
          "Installer les données vocales",
          "Instalar archivos de voz"
      ],
      "Install the voice data required for speech synthesis": [
          "A beszédszintetizáláshoz szükséges hangadatok telepítése",
          "Sprachdaten für Sprachsynthese installieren",
          "Installer les données nécessaires à la synthèse vocale",
          "Instalar los archivos de datos de voz necesarios para la síntesis de voz"
      ],
      "Sets the language-specific voice for the spoken text": [
          "Beállítja a beszélt szöveg nyelvspecifikus hangját",
          "Legt die sprachspezifische Stimme für den gesprochenen Text fest",
          "Définir la langue utilisée par la synthèse vocale",
          "Establecer la voz del idioma específico para el texto hablado"
      ],
      "Cancel": [
          "Mégse",
          "Abbrechen",
          "Annuler",
          "Cancelar"
      ],
      "OK": [
          "OK",
          "OK",
          "OK",
          "Aceptar"
      ],
      "Select input method": [
          "Válassza ki a beviteli módszert",
          "Eingabemethode auswählen",
          "Sélectionner un mode de saisie",
          "Selecciona un método de introducción de texto"
      ],
      "Android keyboard": [
          "Android-billentyűzet",
          "Android-Tastatur",
          "Clavier Android",
          "Teclado de Android"
      ],
      "Android keyboard settings": [
          "Android billentyűzetbeállítások",
          "Android-Tastatureinstellungen",
          "Paramètres du clavier Android",
          "Ajustes del teclado de Android"
      ],
      "English (US)": [
          "angol (amerikai)",
          "Englisch (USA)",
          "Anglais (États-Unis)",
          "inglés (EE.UU.)"
      ],
      "English (UK)": [
          "angol (brit)",
          "Englisch (Großbritannien)",
          "Anglais (Royaume-Uni)",
          "inglés (Reino Unido)"
      ],
      "Input languages": [
          "Beviteli nyelvek",
          "Eingabesprachen",
          "Langues de saisie",
          "Idiomas"
      ],
      "Auto-capitalization": [
          "Automatikusan nagy kezdőbetű",
          "Autom. Groß-/Kleinschr.",
          "Majuscules auto",
          "Mayúsculas automáticas"
      ],
      "Vibrate on keypress": [
          "Rezgés billentyű megnyomása esetén",
          "Bei Tastendruck vibrieren",
          "Vibrer à chaque touche",
          "Vibrar al pulsar tecla"
      ],
      "Sound on keypress": [
          "Hangjelzés billentyű megnyomása esetén",
          "Ton bei Tastendruck",
          "Son à chaque touche",
          "Sonido al pulsar tecla"
      ],
      "Popup on keypress": [
          "Legyen nagyobb billentyű lenyomásakor",
          "Pop-up bei Tastendruck",
          "Agrandir les caractères",
          "Pop-up al pulsar tecla"
      ],
      "Show settings key": [
          "Beállítások billentyű megjelenítése",
          "Taste für Einstellungen",
          "Afficher touche param.",
          "Mostrar tecla de ajustes"
      ],
      "Voice input key": [
          "Hangbeviteli gomb",
          "Taste für Spracheingabe",
          "Touche de saisie vocale",
          "Tecla de entrada de voz"
      ],
      "On main keyboard": [
          "A fő billentyűzeten",
          "Auf Haupttastatur",
          "Sur clavier principal",
          "En teclado principal"
      ],
      "On symbols keyboard": [
          "Szimbólumoknál",
          "Auf Symboltastatur",
          "Sur clavier symboles",
          "En teclado de símbolos"
      ],
      "Off": [
          "Ki",
          "Aus",
          "Désactiver",
          "Desactivada"
      ],
      "Text correction": [
          "Szövegjavítás",
          "Textkorrektur",
          "Correction du texte",
          "Corrección ortográfica"
      ],
      "Add-on dictionaries": [
          "Bővítmények: szótárak",
          "Erweiterte Wörterbücher",
          "Dictionnaires complémentaires",
          "Diccionarios complementarios"
      ],
      "Auto correction": [
          "Automatikus javítás",
          "Autokorrektur",
          "Correction automatique",
          "Autocorrección"
      ],
      "Spacebar and punctuation automatically correct mistyped words": [
          "Szóköz és központozás automatikusan javítja az elgépelést",
          "Korrektur fehlerhafter Wörter durch Leertaste und Satzzeichen",
          "Corriger autom. orthographe (pression sur barre espace/signes ponctuation)",
          "Pulsar la tecla de espacio o punto para corregir errores"
      ],
      "Modest": [
          "Mérsékelt",
          "Mäßig",
          "Simple",
          "Parcial"
      ],
      "Aggressive": [
          "Agresszív",
          "Stark",
          "Proactive",
          "Total"
      ],
      "Very aggressive": [
          "Nagyon agresszív",
          "Sehr stark",
          "Très exigeante",
          "Muy agresiva"
      ],
      "Show correction suggestions": [
          "Javítási ajánlások megjelenítése",
          "Änderungsvorschläge",
          "Afficher les suggestions de correction",
          "Mostrar sugerencias de correcciones"
      ],
      "Display suggested words while typing": [
          "A javasolt szavak megjelenítése gépelés közben",
          "Vorgeschlagene Wörter während des Tippens anzeigen",
          "Afficher les suggestions de terme lors de la saisie",
          "Muestra las palabras sugeridas mientras se escribe."
      ],
      "Always show": [
          "Mindig látszik",
          "Immer anzeigen",
          "Toujours afficher",
          "Mostrar siempre"
      ],
      "Show on portrait mode": [
          "Megjelenítés álló tájolásban",
          "Im Hochformat anzeigen",
          "Afficher en mode Portrait",
          "Mostrar en modo vertical"
      ],
      "Always hide": [
          "Mindig rejtve",
          "Nie anzeigen",
          "Toujours masquer",
          "Ocultar siempre"
      ],
      "Other options": [
          "Egyéb beállítások",
          "Sonstige Optionen",
          "Autres options",
          "Otras opciones"
      ],
      "Advanced settings": [
          "Speciális beállítások",
          "Erweiterte Einstellungen",
          "Paramètres avancés",
          "Ajustes avanzados"
      ],
      "Options for expert users": [
          "Beállítások gyakorlott felhasználóknak",
          "Optionen für Experten",
          "Options destinées aux utilisateurs expérimentés",
          "Opciones para usuarios expertos"
      ],
      "Suggest Contact names": [
          "Javasolt névjegyek",
          "Kontakte vorschlagen",
          "Proposer noms de contacts",
          "Sugerir nombres contactos"
      ],
      "Use names from Contacts for suggestions and corrections": [
          "A névjegyek használata a javaslatokhoz és javításokhoz",
          "Namen aus \"Kontakte\" als Vorschläge und Korrekturmöglichkeiten anzeigen",
          "Utiliser des noms de contacts pour les suggestions et corrections",
          "Utilizar nombres de contactos para sugerencias y correcciones"
      ],
      "Bigram suggestions": [
          "Bigram javaslatok",
          "Bigramm-Vorschläge",
          "Suggestions de type bigramme",
          "Sugerencias de bigramas"
      ],
      "Use previous word to improve suggestion": [
          "Előző szó használata a javaslatok javításához",
          "Zur Verbesserung des Vorschlags vorheriges Wort verwenden",
          "Améliorer la suggestion en fonction du mot précédent",
          "Usar palabra anterior para mejorar sugerencias"
      ],
      "Enable recorrections": [
          "Újbóli javítás engedélyezése",
          "Korrekturen aktivieren",
          "Activer la recorrection",
          "Activar nuevas correcciones"
      ],
      "Set suggestions for recorrections": [
          "Javaslatok beállítása az újbóli javításokhoz",
          "Vorschläge für Korrekturen festlegen",
          "Définir des suggestions de recorrection",
          "Establecer sugerencias para nuevas correcciones"
      ],
      "Android correction": [
          "Android korrekció",
          "Rechtschreibprüfung für Android",
          "Correcteur Android",
          "Corrector de Android"
      ],
      "Spell checking settings": [
          "Helyesírás-ellenőrzés beállításai",
          "Einstellungen für Rechtschreibprüfung",
          "Paramètre du correcteur orthographique",
          "Ajustes del corrector ortográfico"
      ],
      "Use proximity data": [
          "Közelségi adatok haszn.",
          "Näherungsdaten verwenden",
          "Utiliser données proximité",
          "Usar datos de proximidad"
      ],
      "Use a keyboard-like proximity algorithm for spell checking": [
          "Billentyűzetszerű algoritmus a helyesírás-ellenőrzéshez",
          "Tastaturähnl. Abstandsalgorith. für Rechtschreibprüfung verwenden",
          "Utiliser algorithme de proximité clavier pour correcteur ortho",
          "Usar algoritmo de proximidad de teclado para corregir la ortografía"
      ],
      "Google voice typing": [
          "Google hangalapú gépelés",
          "Google-Spracheingabe",
          "Saisie Google Voice",
          "Escritura por voz de Google"
      ],
      "Google voice typing settings": [
          "A Google hangalapú gépelés beállításai",
          "Einstellungen für Google-Spracheingabe",
          "Paramètres de saisie Google Voice",
          "Ajustes de escritura por voz de Google"
      ],
      "Block offensive words": [
          "Sértő szavak kizárása",
          "Anstößiges blockieren",
          "Bloquer les termes choquants",
          "Filtrar palabras ofensivas"
      ],
      "Hide recognized offensive text": [
          "A felismert sértő szöveg elrejtése",
          "Erkannten anstößigen Text ausblenden",
          "Masquer les contenus choquants",
          "Ocultar texto ofensivo reconocido"
      ],
      "Voice Search settings": [
          "Hangalapú keresés beállításai",
          "Sprachsuche - Einstell.",
          "Paramètres rech. vocale",
          "Ajustes de Búsqueda por voz"
      ],
      "SafeSearch": [
          "Biztonságos Keresés",
          "SafeSearch",
          "SafeSearch",
          "SafeSearch"
      ],
      "Moderate": [
          "Közepes",
          "Moderat",
          "Modéré",
          "Moderado"
      ],
      "Strict": [
          "Szigorú",
          "Strikt",
          "Strict",
          "Estricto"
      ],
      "Hide recognized offensive voice results": [
          "A felismert sértő hangtalálatok elrejtése",
          "Ergebnisse für erkannte anstößige Begriffe ausblenden",
          "Masquer les résultats de recherche vocale qui contiennent des termes choquants",
          "Ocultar los resultados de voz ofensivos reconocidos"
      ],
      "Personalized recognition": [
          "Személyre szabott felismerés",
          "Personalisierte Erkennung",
          "Reconnaissance personnalisée",
          "Reconocimiento personalizado"
      ],
      "Improve speech recognition accuracy": [
          "Beszédfelismerés pontosságának javítása",
          "Qualität der Spracherkennung verbessern",
          "Améliorez la précision de la reconnaissance vocale.",
          "Mejora la precisión del reconocimiento de voz."
      ],
      "Google Account dashboard": [
          "Google Fiók irányítópult",
          "Google-Konto-Dashboard",
          "Tableau de bord du compte Google",
          "Panel de cuentas de Google"
      ],
      "Manage your collected data": [
          "Az összegyűjtött adatok kezelése",
          "Verwaltung Ihrer gesammelten Daten",
          "Gérer les données collectées",
          "Permite administrar los datos recopilados."
      ],
      "Google Text-to-speech Engine": [
          "Google Szövegfelolvasó",
          "Google Text-in-Sprache-Engine",
          "Moteur de synthèse vocale Google",
          "Síntesis de voz de Google"
      ]
  };
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
