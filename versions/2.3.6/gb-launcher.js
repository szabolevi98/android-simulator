/* Android 2.3.6 Launcher2 pieces: the button cluster (hotseat), the previous/next screen arrows, the QuickSearchBox
   search widget and the Protips "Home screen tips" widget. hdpi px x 0.575, 1 dp = 0.8625px. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

  // Protips res/values*/arrays.xml: the first line is the bold header; "@drawable/x" puts that bitmap at the right.
  const TIPS = {
    en: [
      ['See all your apps.', 'Touch the Launcher icon.', 'all_apps'],
      ['Drag apps to your Home screen.', 'Touch & hold an app in the Launcher until it vibrates.'],
      ['Rearrange your Home screen.', 'Touch & hold an item and when it vibrates, drag it where you want.'],
      ['Remove items.', 'Touch & hold an item and when it vibrates, drag it to the Trash icon.', 'trash'],
      ['Multiple Home screens.', 'Swipe left or right to switch. Drag items to other screens.'],
      ['Done with this widget?', 'Touch & hold it and when it vibrates, drag it to the Trash icon.']
    ],
    hu: [
      ['Az összes alkalmazás megtekintése.', 'Érintse meg az Indító ikont.', 'all_apps'],
      ['Alkalmazások elhelyezése a főoldalon.', 'Tartsa az ujját az Indító egyik alkalmazásán, amíg az nem rezeg.'],
      ['A főoldal átrendezése.', 'Érintsen meg egy elemet és tartsa rajta az ujját, majd amikor rezeg, húzza a kívánt helyre.'],
      ['Elemek eltávolítása.', 'Érintsen meg egy elemet és tartsa rajta az ujját, majd amikor rezeg, húzza a Kuka ikonra.', 'trash'],
      ['Több főoldal.', 'Csúsztassa balra vagy jobbra a váltáshoz. Húzzon át elemeket egy másik képernyőkre.'],
      ['Nem használ már egy modult?', 'Érintse meg és tartsa rajta az ujját, majd amikor rezeg, húzza a Kuka ikonra.']
    ],
    de: [
      ['Alle Apps auf einen Blick:', 'Berühren Sie das Übersichtssymbol.', 'all_apps'],
      ['Apps auf den Startbildschirm ziehen:', 'Berühren & halten Sie ein App in der Übersicht, bis es vibriert.'],
      ['Startbildschirm neu anordnen:', 'Berühren & halten Sie ein Element. Sobald es vibriert, ziehen Sie es in Position.'],
      ['Elemente entfernen:', 'Berühren & halten Sie ein Element und ziehen Sie es in den Papierkorb.', 'trash'],
      ['Mehrere Startbildschirme:', 'Ziehen Sie zum Wechseln nach links oder rechts. Ziehen Sie Elemente auf andere Bildschirme.'],
      ['Dieses Widget entfernen?', 'Berühren & halten Sie es. Sobald es vibriert, ziehen Sie es in den Papierkorb.']
    ],
    fr: [
      ['Accéder aux applications', 'Appuyez sur le lanceur d\'applications.', 'all_apps'],
      ['Ajouter des applications à l\'écran d\'accueil', 'Appuyez sur une application du lanceur jusqu\'à ce qu\'elle vibre, puis faites-la glisser.'],
      ['Organiser l\'écran d\'accueil', 'Appuyez sur un élément et maintenez. Lorsqu\'il vibre, placez-le à l\'endroit souhaité.'],
      ['Supprimer un élément', 'Appuyez sur l\'élément et maintenez. Lorsqu\'il vibre, déplacez-le vers la corbeille.', 'trash'],
      ['Écrans d\'accueil multiples', 'Faites glisser l\'écran vers la droite/gauche. Déplacez les icônes d\'un écran à l\'autre.'],
      ['Supprimer un widget', 'Appuyez dessus et maintenez. Quand il vibre, déplacez-le vers la corbeille.']
    ],
    es: [
      ['Accede a tus aplicaciones', 'Toca en el icono cuadrado.', 'all_apps'],
      ['Añade aplicaciones al escritorio', 'Mantén pulsada una aplicación hasta que vibre.'],
      ['Organiza el escritorio', 'Mantén pulsado un icono. Cuando la pantalla vibre, arrástralo a donde quieras.'],
      ['Elimina iconos', 'Mantén pulsado un icono. Cuando la pantalla vibre, arrástralo hasta la papelera.', 'trash'],
      ['Crea varias pantallas', 'Desliza el dedo hacia la izquierda o derecha y arrastra iconos a otras pantallas.'],
      ['¿Quieres cerrar este widget?', 'Manténlo pulsado. Cuando la pantalla vibre, arrástralo a la papelera.']
    ]
  };
  // tips2 ("dial *#*#TIPS#*#*", not translated): haiku, one line per row.
  const HAIKU = [
    ['Home is a garden', 'Touch & hold an empty spot\nTo grow new icons'],
    ['Phone isn’t waterproof', 'Do not immerse in water\nor other fluids'],
    ['Want some more home screens?', 'Swipe left and right to find them\n(No theft required)'],
    ['Little Home screen dots', 'What could they possibly do?\nTouch & hold to learn.'],
    ['Status bar icons', 'To discover their secrets\nPull the windowshade'],
    ['There is a trick to', 'Dragging items twixt Home screens\nPause at the edges'],
    ['Touch Market for apps', 'Like a box of chocolates\nEach one a surprise'],
    ['Oh, and by the way:', 'Ceci n’est pas une trombone\nI am an Android']
  ];
  const tips = (lang, set) => set === 1 ? HAIKU : TIPS[lang] || TIPS.en;
  // R.string.pager_footer "%1$d of %2$d" (10 sp bold #AAAAAA). The 2.3.6 Hungarian string swaps the numbers ("6/1").
  const FOOTER = {en: '%1 of %2', hu: '%2/%1', de: '%1 von %2', fr: '%1 sur %2', es: '%1 de %2'};
  function protips(state, lang) {
    const list = tips(lang, state.set), index = state.index < 0 ? -1 : state.index % list.length, tip = list[index];
    const bubble = tip ? `<button class="gbtips-bubble" data-action="gb-tip-next" aria-label="${e(tip[0])}"><span class="gbtips-text"><strong>${e(tip[0])}</strong><span>${e(tip[1]).replace(/\n/g, '<br>')}</span></span>${tip[2] ? `<img class="gbtips-callout" src="assets/gb-tips-${tip[2]}.png" alt="">` : ''}<span class="gbtips-footer">${e((FOOTER[lang] || FOOTER.en).replace('%1', index + 1).replace('%2', list.length))}</span></button>` : '';
    return `<div class="gbtips">${bubble}<button class="gbtips-droid" data-action="gb-tip-poke" aria-label="Android"><img src="assets/gb-tips-${state.icon || 'droidman_open'}.png" alt=""></button></div>`;
  }
  // ProtipWidget.blink: closed 100 ms, then (open 200 ms, closed 100 ms) per extra blink, then open.
  function blinkFrames(times) {
    const frames = [['droidman_closed', 100]];
    for (let i = 1; i < times; i++) frames.push(['droidman_open', 200], ['droidman_closed', 100]);
    frames.push(['droidman_open', 0]);
    return frames;
  }

  // QuickSearchBox search_widget.xml: corpus indicator, the "Google" hint field and the voice button on search_floater.
  const search = t => `<div class="gbqsb"><button class="gbqsb-corpus" data-action="browser-search" aria-label="${e(t('Search'))}"><img src="assets/gb-qsb-search_app_icon.png" alt=""></button><button class="gbqsb-field" data-action="browser-search" aria-label="Google"><img src="assets/gb-qsb-hint_google.png" alt=""></button><button class="gbqsb-voice" data-action="voice-search" aria-label="${e(t('Voice search'))}"><img src="assets/gb-qsb-ic_btn_speak_now.png" alt=""></button></div>`;

  // launcher.xml (port): all_apps_button_cluster (phone, all apps, browser) and the 93 dp previous/next screen buttons
  // whose home_arrows level-list shows one dot per screen on that side (up to four).
  const dock = t => `<div class="gbl-cluster"><button class="gbl-hotseat gbl-hotseat-left" data-action="open-app" data-app="phone" aria-label="${e(t('Phone'))}"><span class="gbl-hotseat-phone"></span></button><button class="gbl-allapps" data-action="drawer" aria-label="${e(t('Apps'))}"><span></span></button><button class="gbl-hotseat gbl-hotseat-right" data-action="open-app" data-app="browser" aria-label="${e(t('Browser'))}"><span class="gbl-hotseat-browser"></span></button></div>`;
  function arrows(page, count, t) {
    const left = Math.min(4, page), right = Math.min(4, count - 1 - page);
    return `<button class="gbl-arrow gbl-arrow-left" data-action="page" data-id="${page - 1}" ${left ? '' : 'hidden'} aria-label="${e(t('Previous screen'))}" style="--dots:url('assets/gb-l2-ic_home_arrows_${left || 1}_normal.png');--dots-press:url('assets/gb-l2-ic_home_arrows_${left || 1}_press.png')"></button><button class="gbl-arrow gbl-arrow-right" data-action="page" data-id="${page + 1}" ${right ? '' : 'hidden'} aria-label="${e(t('Next screen'))}" style="--dots:url('assets/gb-l2-ic_home_arrows_${right || 1}_normal_right.png');--dots-press:url('assets/gb-l2-ic_home_arrows_${right || 1}_press_right.png')"></button>`;
  }

  // Music album_appwidget.xml (layout-finger): appwidget_bg with a 3:1:1 split - title (18 sp bold) and artist
  // (14 sp) or "Touch to select music.", then play/pause and next, separated by 1 dp dividers.
  function music(music, track, active, t) {
    const text = active ? `<strong>${e(track.title)}</strong><span>${e(track.artist)}</span>` : `<span>${e(t('Touch to select music.'))}</span>`;
    return `<div class="gbmusic"><button class="gbmusic-info" data-action="widget-music-open">${text}</button><i></i><button class="gbmusic-play" data-action="widget-music-play" aria-label="${e(t(music.playing ? 'Pause' : 'Play'))}"><img src="assets/gb-music-ic_appwidget_music_${music.playing ? 'pause' : 'play'}.png" alt=""></button><i></i><button class="gbmusic-next" data-action="widget-music-next" aria-label="${e(t('Next'))}"><img src="assets/gb-music-ic_appwidget_music_next.png" alt=""></button></div>`;
  }

  window.GBLauncher = {TIPS, HAIKU, tips, protips, blinkFrames, search, dock, arrows, music};
})();
