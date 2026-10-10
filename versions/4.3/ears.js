/* Sound Search for Google Play 1.1.9 (GoogleEars.apk, JWR66Y): its only entry points, the 4 x 1 home screen widget
   (EarsMusicWidgetProvider: widget_ears_4_1_info.xml, minWidth 300 dp, minHeight 60 dp) and EarsHistoryActivity.
   - widget_ears_main / widget_ears_4_1.xml: 8 dp in, a ViewFlipper on appwidget_bg. Idle: "What's this song?" (21 dp
     #57C2D7 on play_logo, 24 dp in), a 1 dp #33FFFFFF divider and the 42 dp history button (history_icon).
     Listening (EarsWidgetCaptureService): capture_animation_imageview drawn by AudioProgressRenderer, which fills its
     bars with the captured levels (music_teal_eq over music_empty_eq) over at most 15 000 ms; a tap stops it. Then the
     small progress bar while the lookup runs, and either the results panel (the 80 dp album art on music_icon_small,
     the 18 dp white track and 14 dp artist, the close button) or relisten_panel on #80000000 with "No match found."
     (16 dp #54BFD4) and close.
   - EarsHistoryActivity (HistoryTheme: Theme.Holo, the action bar title 20 dp #57C2D7 after play_logo): history_entry
     rows (80 dp art, the 18 dp track with the 14 dp date at the end, the artist), "History is currently empty." when
     there is none; history_menu.xml's Change account and Clear all (with its Yes / No confirmation).
   The simulator has no microphone: the capture recognizes the song the simulator's Music app is playing, if any, and
   otherwise ends without a match after the full capture. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const LANGS = ['en', 'hu', 'de', 'fr', 'es'];
  const STR = {
    ears_widget_name: ["Sound Search", "Hangkeresés", "Sound Search", "Recherche audio", "Sound Search"],
    click_to_recognize: ["What's this song?", "Mi ez a dal?", "Welcher Song ist das?", "C'est quoi ce titre ?", "¿Cuál es esta canción?"],
    no_results_found_status: ["No match found.", "Nincs találat.", "Kein Treffer", "Aucune correspondance.", "No se ha encontrado ninguna coincidencia."],
    history_title_label2: ["Sound Search History", "Hangkeresési előzmények", "Sound Search-Verlauf", "Historique des recherches audio", "Historial de Sound Search"],
    no_history_status: ["History is currently empty.", "Jelenleg nincsenek előzmények.", "Der Verlauf ist momentan leer.", "Votre historique est vide pour le moment.", "Por ahora, el historial está vacío."],
    delete: ["Delete", "Törlés", "Löschen", "Supprimer", "Eliminar"],
    delete_all: ["Clear all", "Összes törlése", "Alle deaktivieren", "Tout effacer", "Borrar todo"],
    delete_all_confirmation: ["Are you sure you want to clear all your history?", "Biztos benne, hogy törli az összes előzményt?", "Möchten Sie wirklich Ihren gesamten Verlauf löschen?", "Voulez-vous vraiment effacer l'ensemble de votre historique ?", "¿Seguro que quieres eliminar todo el historial?"],
    yes: ["Yes", "Igen", "Ja", "Oui", "Sí"],
    no: ["No", "Nem", "Nein", "Non", "No"],
    switch_account: ["Change account", "Másik fiók választása", "Konto ändern", "Changer de compte", "Cambiar cuenta"],
    close_button_desc: ["Close", "Bezárás", "Schließen", "Fermer", "Cerrar"],
    listening_button_desc: ["Listening, click to stop", "Hallgatás folyamatban, a megállításhoz kattintson.", "Wird abgespielt, zum Beenden klicken", "Écoute en cours, cliquez pour arrêter.", "Escuchando... Haz clic para parar."],
    history_button_desc: ["Open Sound Search history", "Open Sound keresési előzmények", "Sound Search-Verlauf öffnen", "Ouvrir l'historique des recherches audio", "Abrir historial de Sound Search"],
    album_art_desc: ["Album art", "Lemezborító", "Album-Cover", "Image de l'album", "Imagen del álbum"]
  };
  const text = (lang, key) => (STR[key] || [key])[Math.max(0, LANGS.indexOf(lang))];
  const CAPTURE_MS = 15000, MATCH_MS = 4000, LOOKUP_MS = 900, BARS = 40;
  const A = name => `assets/ears-${name}.png`;
  // AudioProgressRenderer: the captured share of the bars in teal at the heard level, the rest empty.
  function bars(state, now) {
    const done = Math.min(1, (now - state.started) / CAPTURE_MS), lit = Math.round(done * BARS);
    return Array.from({length: BARS}, (_, i) => {
      const level = i < lit ? 18 + Math.abs(Math.sin(i * 1.7 + state.started % 7)) * 72 : 100;
      return `<i class="ears-eq${i < lit ? ' on' : ''}" style="height:${level.toFixed(0)}%"></i>`;
    }).join('');
  }
  function widget(state = {}, lang, now = Date.now()) {
    const T = key => text(lang, key), phase = state.phase || 'idle';
    const close = `<span class="ears-divider"></span><button class="ears-nav" data-action="ears-close" aria-label="${e(T('close_button_desc'))}"><img src="${A('close')}" alt=""></button>`;
    let body;
    if (phase === 'listening') body = `<button class="ears-capture" data-action="ears-stop" aria-label="${e(T('listening_button_desc'))}">${bars(state, now)}</button>`;
    else if (phase === 'lookup') body = '<span class="ears-progress" aria-hidden="true"></span>';
    else if (phase === 'nomatch') body = `<div class="ears-relisten"><span>${e(T('no_results_found_status'))}</span>${close}</div>`;
    else if (phase === 'result') body = `<div class="ears-result"><span class="ears-art" role="img" aria-label="${e(T('album_art_desc'))}"></span><span class="ears-result-text"><b>${e(state.title)}</b><small>${e(state.artist)}</small></span>${close}</div>`;
    else body = `<div class="ears-idle"><button class="ears-start" data-action="ears-listen"><img src="${A('play_logo')}" alt=""><span>${e(T('click_to_recognize'))}</span></button><span class="ears-divider"></span><button class="ears-nav" data-action="ears-history" aria-label="${e(T('history_button_desc'))}"><img src="${A('history_icon')}" alt=""></button></div>`;
    return `<div class="ears-widget"><div class="ears-flipper">${body}</div></div>`;
  }
  // DateUtils.formatSameDayTime-style: the time for today's matches, the date for older ones.
  const when = (time, locale, now = Date.now()) => new Date(time).toDateString() === new Date(now).toDateString()
    ? new Date(time).toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit'}) : new Date(time).toLocaleDateString(locale, {month: 'short', day: 'numeric'});
  function history(list = [], lang, locale, now = Date.now()) {
    const T = key => text(lang, key);
    const rows = list.length ? list.map(item => `<div class="ears-entry"><span class="ears-art"></span><span class="ears-entry-text"><span class="ears-entry-top"><b>${e(item.title)}</b><time>${e(when(item.time, locale, now))}</time></span><small>${e(item.artist)}</small></span></div>`).join('') : `<p class="ears-empty">${e(T('no_history_status'))}</p>`;
    return `<div class="app-view ears-history"><header class="ears-bar"><button class="ears-up" data-action="back" aria-label="${e(T('close_button_desc'))}"><img src="${A('play_logo')}" alt=""></button><h2>${e(T('history_title_label2'))}</h2><button class="ears-more" data-action="ears-menu" aria-label="More options"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button></header><div class="ears-list">${rows}</div></div>`;
  }
  const menu = lang => [['ears-account', text(lang, 'switch_account')], ['ears-clear-ask', text(lang, 'delete_all')]];
  window.Ears = {STR, text, CAPTURE_MS, MATCH_MS, LOOKUP_MS, widget, history, menu, when};
})();
