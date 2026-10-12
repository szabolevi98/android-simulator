/* Google Play Music 4.1.513 on the Galaxy Nexus (IMM76I), from the image's Music2.apk: a dark Holo app under the
   transparent dark action bar (top_action_bar: the headphones home icon, Search), the scrolling tab row of 140 dp tabs in
   12 sp (tab_layout: Recent, Artists, Albums, Songs, Playlists, Genres), the Recent carousel of album covers on its
   carousel_background #1a1a4d, art walls for artists, albums, playlists and genres (wall_*_label: the name over the
   count), song rows with 64 dp album art and the blue playing indicator (played_text #33b5e5), the now-playing bar, and
   the player (nowplaying: big art, the track in white, album and artist at 75 %, the timecodes in #dddddd). It plays the
   simulator's demo library through the shared music engine (music.js), so AOSP Music and Play Music share the queue.
   Texts are Music2.apk's (docs/tools/apk-strings.py); covers are drawn. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const STRINGS = {
    "Recent": {"res": "Music2:spinner_carousel", "hu": "Legutóbbiak", "de": "Letzte", "fr": "Sélections récentes", "es": "Reciente"},
    "Artists": {"res": "Music2:artists_title", "hu": "Előadók", "de": "Musiker", "fr": "Artistes", "es": "Artistas"},
    "Albums": {"res": "Music2:albums_title", "hu": "Albumok", "de": "Alben", "fr": "Albums", "es": "Álbumes"},
    "Songs": {"res": "Music2:tracks_title", "hu": "Dalok", "de": "Titel", "fr": "Titres", "es": "Canciones"},
    "Playlists": {"res": "Music2:playlists_title", "hu": "Lejátszási listák", "de": "Playlists", "fr": "Playlists", "es": "Listas"},
    "Genres": {"res": "Music2:genres_title", "hu": "Műfajok", "de": "Genres", "fr": "Genres", "es": "Géneros"},
    "Search music": {"res": "Music2:search_hint", "hu": "Zene keresése", "de": "In Musik suchen", "fr": "Recherchez musique", "es": "Buscar música"},
    "Shuffle all": {"res": "Music2:shuffle_all", "hu": "Keverés", "de": "Alle zufällig wiedergeben", "fr": "Lecture aléatoire", "es": "Aleatorio"},
    "Now playing": {"res": "Music2:nowplaying_title", "hu": "Most hallható", "de": "Aktuelle Wiedergabe", "fr": "À l’écoute", "es": "Reproduciendo"},
    "Shuffle": {"res": "Music2:shuffle", "hu": "Véletlen sorrendű lejátszás", "de": "Zufallsmix", "fr": "Lecture aléatoire", "es": "Reproducción aleatoria"},
    "Make instant mix": {"res": "Music2:menu_make_instant_mix", "hu": "Azonnali egyveleg készítése", "de": "Schnellmix erstellen", "fr": "Créer un mix instantané", "es": "Mix instantáneo"},
    "Add to playlist": {"res": "Music2:add_to_playlist", "hu": "Hozzáadás lejátszási listához", "de": "Zu Playlist hinzufügen", "fr": "Ajouter à la playlist", "es": "Añadir a lista"},
    "New playlist": {"res": "Music2:new_playlist_title", "hu": "Új lejátszási lista", "de": "Neue Playlist", "fr": "Nouvelle playlist", "es": "Nueva lista"},
    "Remove from playlist": {"res": "Music2:remove_from_playlist", "hu": "Eltávolítás a lejátszási listából", "de": "Aus Playlist entfernen", "fr": "Supprimer de la playlist", "es": "Eliminar de lista de reproducción"},
    "All songs": {"res": "Music2:all_songs_list", "hu": "Minden dal", "de": "Alle Titel", "fr": "Tous les titres", "es": "Todas las canciones"},
    "No songs": {"res": "Music2:no_tracks_title", "hu": "Nincsenek dalok", "de": "Keine Titel", "fr": "Aucun titre", "es": "Ninguna canción"},
    "More by artist": {"res": "Music2:more_by_artist", "hu": "Még több ettől az előadótól", "de": "Mehr vom Interpreten", "fr": "Autres albums de cet artiste", "es": "Más de este artista"},
    "Current playlist": {"res": "Music2:queue", "hu": "Jelenlegi lejátszási lista", "de": "Aktuelle Playlist", "fr": "Playlist actuelle", "es": "Lista de reproducción actual"},
    "Settings": {"res": "Music2:settings", "hu": "Beállítások", "de": "Einstellungen", "fr": "Paramètres", "es": "Ajustes"},
    "Help": {"res": "Music2:help_title", "hu": "Súgó", "de": "Hilfe", "fr": "Aide", "es": "Ayuda"},
    "Unknown artist": {"res": "Music2:unknown_artist_name", "hu": "Ismeretlen előadó", "de": "Unbekannter Musiker", "fr": "Artiste inconnu", "es": "Artista desconocido"}
  };
  const STR = AndroidStrings.table('', STRINGS, AndroidStrings.shared), T = (lang, key) => STR.t(key, lang);
  const TABS = ['Recent', 'Artists', 'Albums', 'Songs', 'Playlists', 'Genres'];
  const GENRE = {'The Demo Tapes': 'Electronic', 'Paper Satellites': 'Indie'};
  const PALETTE = [['#3c5a8a', '#f1b45d'], ['#5a2a5e', '#e0805c'], ['#2c6e5a', '#cfe08a'], ['#7a3a2a', '#f0c070'], ['#2a3a6a', '#8fc0f0']];
  const hash = text => [...String(text)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  // A drawn cover: two colours, a disc and the name.
  function cover(name, size = '') {
    const [a, b] = PALETTE[hash(name) % PALETTE.length];
    return `<span class="pm4-cover ${size}" style="--a:${a};--b:${b}"><i></i><em>${e(name)}</em></span>`;
  }
  const albums = tracks => [...new Set(tracks.map(t => t.album))];
  const artists = tracks => [...new Set(tracks.map(t => t.artist))];
  const genres = tracks => [...new Set(tracks.map(t => GENRE[t.artist] || 'Pop'))];
  function members(tracks, music, kind, id) {
    const all = tracks.map((t, i) => [t, i]);
    if (kind === 'album') return all.filter(([t]) => t.album === id).map(([, i]) => i);
    if (kind === 'artist') return all.filter(([t]) => t.artist === id).map(([, i]) => i);
    if (kind === 'genre') return all.filter(([t]) => (GENRE[t.artist] || 'Pop') === id).map(([, i]) => i);
    if (kind === 'playlist') return (music.playlists.find(p => String(p.id) === String(id))?.tracks || []);
    return all.map(([, i]) => i);
  }
  function bar(ctx, {up = false} = {}) {
    return `<header class="pm4-bar"><button class="pm4-home" data-action="${up ? 'back' : 'home'}" aria-label="Play Music">${up ? '<span class="pm4-back">‹</span>' : ''}<img src="assets/play-music.png" alt=""></button><span class="pm4-spacer"></span><button class="pm4-icon" data-action="pm4-unsupported" aria-label="${e(T(ctx.lang, 'Search music'))}"><img src="assets/pm4-ic_menu_search_holo_dark.png" alt=""></button><button class="pm4-icon" data-action="pm4-menu" aria-label="${e(T(ctx.lang, 'More options'))}"><img src="assets/pm4-ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button></header>`;
  }
  function songRows(ctx, ids, queue) {
    const {tracks, music} = ctx;
    if (!ids.length) return `<p class="pm4-empty">${e(T(ctx.lang, 'No songs'))}</p>`;
    return ids.map(i => { const t = tracks[i]; return `<button class="pm4-song${music.track === i ? ' playing' : ''}" data-action="pm4-play" data-id="${i}" data-queue="${e(queue)}">${cover(t.album, 'small')}<span class="pm4-song-copy"><b>${e(t.title)}</b><small>${e(t.artist)}</small></span>${music.track === i && music.playing ? '<i class="pm4-indicator" aria-hidden="true"><b></b><b></b><b></b></i>' : ''}</button>`; }).join('');
  }
  const wall = (kind, items) => `<div class="pm4-wall">${items.map(([id, name, sub]) => `<button class="pm4-tile" data-action="pm4-group" data-id="${e(kind + ':' + id)}">${cover(name, 'big')}<span class="pm4-label"><b>${e(name)}</b><small>${e(sub)}</small></span></button>`).join('')}</div>`;
  function tabContent(ctx, tab) {
    const {tracks, music, lang} = ctx, count = n => `${n} ${T(lang, 'Songs').toLocaleLowerCase()}`;
    if (tab === 'Recent') {
      const list = albums(tracks), center = Math.max(0, list.indexOf(tracks[music.track]?.album));
      return `<div class="pm4-carousel">${list.map((name, i) => `<button class="pm4-carousel-item" style="--d:${i - center}" data-action="pm4-group" data-id="album:${e(name)}">${cover(name, 'big')}</button>`).join('')}<div class="pm4-carousel-caption"><b>${e(list[center] || '')}</b><small>${e(tracks.find(t => t.album === list[center])?.artist || '')}</small></div><button class="pm4-shuffle-all" data-action="pm4-shuffle-all">${e(T(lang, 'Shuffle all'))}</button></div>`;
    }
    if (tab === 'Artists') return wall('artist', artists(tracks).map(a => [a, a, count(members(tracks, music, 'artist', a).length)]));
    if (tab === 'Albums') return wall('album', albums(tracks).map(a => [a, a, tracks.find(t => t.album === a).artist]));
    if (tab === 'Genres') return wall('genre', genres(tracks).map(g => [g, g, count(members(tracks, music, 'genre', g).length)]));
    if (tab === 'Playlists') return music.playlists.length ? wall('playlist', music.playlists.map(p => [p.id, p.name, count(p.tracks.length)])) : `<p class="pm4-empty">${e(T(lang, 'No songs'))}</p>`;
    return songRows(ctx, tracks.map((_, i) => i), 'all');
  }
  function nowBar(ctx) {
    const {tracks, music} = ctx, t = tracks[music.track]; if (!t) return '';
    return `<div class="pm4-nowbar"><button class="pm4-nowbar-open" data-action="pm4-player">${cover(t.album, 'small')}<span><b>${e(t.title)}</b><small>${e(t.artist)}</small></span></button><button class="pm4-nowbar-play" data-action="music-play" aria-label="${music.playing ? 'Pause' : 'Play'}">${music.playing ? '❚❚' : '▶'}</button></div>`;
  }
  function library(ctx) {
    const {ui, lang} = ctx, tab = TABS.includes(ui.pm4Tab) ? ui.pm4Tab : 'Recent';
    return `<div class="app-view pm4-app">${bar(ctx)}<nav class="pm4-tabs" role="tablist">${TABS.map(name => `<button role="tab" aria-selected="${name === tab}" class="${name === tab ? 'on' : ''}" data-action="pm4-tab" data-id="${name}">${e(T(lang, name))}</button>`).join('')}</nav><div class="pm4-scroll${tab === 'Recent' ? ' pm4-recent' : ''}">${tabContent(ctx, tab)}</div>${nowBar(ctx)}</div>`;
  }
  function group(ctx) {
    const {ui, tracks, music, lang} = ctx, [kind, ...rest] = String(ui.pm4Group || 'album:').split(':'), id = rest.join(':');
    const name = kind === 'playlist' ? music.playlists.find(p => String(p.id) === id)?.name || '' : id;
    const ids = members(tracks, music, kind, id);
    const sub = kind === 'album' ? tracks.find(t => t.album === id)?.artist || T(lang, 'Unknown artist') : `${ids.length} ${T(lang, 'Songs').toLocaleLowerCase()}`;
    return `<div class="app-view pm4-app">${bar(ctx, {up: true})}<div class="pm4-scroll"><div class="pm4-group-head">${cover(name, 'big')}<span><b>${e(name)}</b><small>${e(sub)}</small><button data-action="pm4-play" data-id="${ids[0] ?? ''}" data-queue="${e(ui.pm4Group)}">${e(T(lang, 'Shuffle all'))}</button></span></div>${songRows(ctx, ids, ui.pm4Group)}</div>${nowBar(ctx)}</div>`;
  }
  function player(ctx) {
    const {tracks, music, lang, time} = ctx, t = tracks[music.track] || tracks[0];
    const p = Math.min(100, music.position / t.duration * 100);
    return `<div class="app-view pm4-app pm4-player">${bar(ctx, {up: true})}<div class="pm4-np-head"><span class="pm4-np-label">${e(T(lang, 'Now playing'))}</span><b>${e(t.title)}</b><small>${e(t.album)} · ${e(t.artist)}</small></div><div class="pm4-np-art">${cover(t.album, 'huge')}</div><div class="pm4-np-seek"><time class="music-elapsed">${e(time(music.position))}</time><span class="pm4-np-track"><i style="width:${p.toFixed(1)}%"></i></span><time>${e(time(t.duration))}</time></div><div class="pm4-np-controls"><button data-action="music-shuffle" class="${music.shuffle ? 'on' : ''}" aria-label="${e(T(lang, 'Shuffle'))}">⤨</button><button data-action="music-prev" aria-label="Previous">⏮</button><button class="pm4-np-play" data-action="music-play" aria-label="${music.playing ? 'Pause' : 'Play'}">${music.playing ? '❚❚' : '▶'}</button><button data-action="music-next" aria-label="Next">⏭</button><button data-action="music-repeat" class="${music.repeat !== 'off' ? 'on' : ''}" aria-label="Repeat">${music.repeat === 'one' ? '↻¹' : '↻'}</button></div></div>`;
  }
  function render(ctx) {
    if (ctx.ui.sub === 'player') return player(ctx);
    if (ctx.ui.sub === 'group') return group(ctx);
    return library(ctx);
  }
  function overlay(ctx) {
    if (ctx.ui.overlay !== 'pm4-menu') return null;
    const item = (action, label) => `<button data-action="${action}">${e(T(ctx.lang, label))}</button>`;
    return `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu pm4-menu" role="menu">${item('pm4-shuffle-all', 'Shuffle all')}${item('pm4-unsupported', 'Make instant mix')}${item('pm4-unsupported', 'Settings')}${item('pm4-unsupported', 'Help')}</div>`;
  }
  // ctx: {tracks, music, ui, lang, time, play(ids, track), save, render, renderOverlay, toast}.
  function handle(action, id, ctx, button) {
    const {ui, tracks, music} = ctx;
    switch (action) {
      case 'pm4-tab': ui.pm4Tab = id; ui.sub = ''; ctx.render(); break;
      case 'pm4-group': ui.pm4Group = id; ui.sub = 'group'; ctx.render(); break;
      case 'pm4-player': ui.sub = 'player'; ctx.render(); break;
      case 'pm4-play': {
        const queue = button?.dataset.queue || 'all', [kind, ...rest] = queue.split(':');
        const ids = queue === 'all' ? tracks.map((_, i) => i) : members(tracks, music, kind, rest.join(':'));
        if (id === '' || !ids.length) break;
        ctx.play(ids, Number(id)); ui.sub = 'player'; ctx.render(); break;
      }
      case 'pm4-shuffle-all': { const ids = tracks.map((_, i) => i); music.shuffle = true; ctx.play(ids, ids[Math.floor(Math.random() * ids.length)]); ui.overlay = ''; ctx.renderOverlay(); ui.sub = 'player'; ctx.render(); break; }
      case 'pm4-menu': ui.overlay = 'pm4-menu'; ctx.renderOverlay(); break;
      case 'pm4-unsupported': ui.overlay = ''; ctx.renderOverlay(); ctx.toast('This feature is not part of the simulator.'); break;
      default: return false;
    }
    return true;
  }
  window.ICSPlayMusic = {TABS, render, overlay, handle};
})();
