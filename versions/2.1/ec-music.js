/* Android 2.1 Music (Music.apk, ERE27): MusicBrowserActivity's button bar (buttonbar.xml: Artists / Albums / Songs /
   Playlists, 64 dp, buttonbar_active / _inactive / _pressed, the ic_tab_* icon over textAppearanceSmall text, white when
   selected else #808080) over the list of the chosen tab. The phone's SD card holds no music, so Artists, Albums and
   Songs are empty and Playlists has only "Recently added" (ic_mp_playlist_recently_added_list). With the SD card
   unmounted the lists give way to sd_error.xml (ic_mp_sd_card, "SD card unavailable"). Menu: Party shuffle, Shuffle all. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const U = () => EC.text('music');
  const TABS = [['artists', 'browse_menu'], ['albums', 'albums_menu'], ['songs', 'tracks_menu'], ['playlists', 'playlists_menu']];
  function render(c) {
    const tab = c.ui.musicTab || 'artists';
    const bar = `<div class="ecmu-bar">${TABS.map(([id, label]) => `<button type="button" class="ecmu-tab${id === tab ? ' on' : ''}" data-action="ecmu-tab" data-tab="${id}"><i class="ec-bg np-mu-buttonbar_${id === tab ? 'active' : 'inactive'}"></i><i class="ec-bg ec-pressed np-mu-buttonbar_pressed"></i><img src="assets/mu-ic_tab_${id}_${id === tab ? 'selected' : 'unselected'}.png" alt=""><span>${esc(U().t(label))}</span></button>`).join('')}</div>`;
    let body = '';
    if (c.ui.sdUnmounted) body = `<div class="ecmu-sd"><img src="assets/mu-ic_mp_sd_card.png" alt=""><span>${esc(U().t('sdcard_busy_message'))}</span></div>`;
    else if (tab === 'playlists') body = `<button type="button" class="ecmu-row" data-action="ecmu-recent"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><img src="assets/mu-ic_mp_playlist_recently_added_list.png" alt=""><span>${esc(U().t('recentlyadded'))}</span></button><i class="ecph-div"></i>`;
    return `<div class="ecmu">${bar}<div class="ecmu-list">${body}</div></div>`;
  }
  EC.register('music', {
    title: 'Music',
    render,
    action(name, el, event, c) {
      if (name === 'ecmu-tab') { c.ui.musicTab = el.dataset.tab; c.render(); return true; }
      if (name === 'ecmu-recent') { c.toast(U().t('no_tracks_title')); return true; }
      return false;
    },
    menu(c) {
      c.menu([{label: U().t('party_shuffle'), icon: 'mu-ic_menu_party_shuffle.png', action: () => c.toast(U().t('no_tracks_title'))},
        {label: U().t('shuffle_all'), icon: 'mu-ic_menu_shuffle.png', action: () => c.toast(U().t('no_tracks_title'))}]);
      return true;
    }
  });
})();
