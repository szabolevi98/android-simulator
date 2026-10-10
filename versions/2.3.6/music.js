/* Music 2.3.6 (MusicGoogle on the Nexus S): the library and the player, with a local simulated queue. */
(() => {
  'use strict';
  const e=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const tracks=[
    {title:'Blue Horizon',artist:'The Demo Tapes',album:'First Light',duration:213},
    {title:'Afterglow',artist:'The Demo Tapes',album:'First Light',duration:187},
    {title:'Night Drive',artist:'The Demo Tapes',album:'After Hours',duration:246},
    {title:'City Lights',artist:'Paper Satellites',album:'Small Worlds',duration:204},
    {title:'Sunday Morning',artist:'Paper Satellites',album:'Small Worlds',duration:178},
    {title:'Home Again',artist:'Paper Satellites',album:'Small Worlds',duration:231}
  ];
  const ids=()=>tracks.map((_,i)=>i);
  const good=id=>Number.isInteger(id)&&!!tracks[id];
  function restore(raw={}) {
    const queue=Array.isArray(raw.queue)?raw.queue.filter(good):ids();
    return {queue:queue.length?queue:ids(),track:good(raw.track)?raw.track:0,position:Math.max(0,Math.min(Number(raw.position)||0,tracks[good(raw.track)?raw.track:0].duration)),shuffle:!!raw.shuffle,repeat:['off','all','one'].includes(raw.repeat)?raw.repeat:'off',playing:false,
      playlists:Array.isArray(raw.playlists)?raw.playlists.filter(p=>p&&typeof p.name==='string'&&Array.isArray(p.tracks)).map(p=>({...p,tracks:[...new Set(p.tracks.filter(good))]})):[]};
  }
  function step(state,direction=1,automatic=false,random=Math.random) {
    if(direction<0&&state.position>3){state.position=0;return;}
    if(automatic&&state.repeat==='one'){state.position=0;return;}
    const queue=state.queue.length?state.queue:ids(),index=queue.indexOf(state.track);
    if(state.shuffle&&queue.length>1&&direction>0){const choices=queue.filter(id=>id!==state.track);state.track=choices[Math.min(choices.length-1,Math.floor(random()*choices.length))];}
    else {const next=index+direction;if(automatic&&next>=queue.length&&state.repeat==='off'){state.playing=false;state.position=tracks[state.track].duration;return;}state.track=queue[(next+queue.length)%queue.length];}
    state.position=0;
  }
  function tick(state,seconds=1) {if(!state.playing)return;state.position+=seconds;if(state.position>=tracks[state.track].duration)step(state,1,true);}
  const time=value=>`${Math.floor(value/60)}:${String(Math.floor(value%60)).padStart(2,'0')}`;
  const img=(name,cls='')=>`<img class="${cls}" src="assets/music-${name}.png" alt="">`;
  /* What a TrackBrowserActivity shows: ui.musicGroup is 'album|<artist>|<album>' (an album, from the Albums tab or an
     artist's expanded group), 'playlist|<id>' or 'recent' (Recently added: every song here is new); ui.sub 'queue' is the
     "nowplaying" playlist. */
  function listing(state,ui) {
    if(ui.sub==='queue')return state.queue;
    const [kind,a,b]=String(ui.musicGroup||'').split('|');
    if(ui.sub==='music-group'&&kind==='album')return ids().filter(id=>tracks[id].album===b&&(!a||tracks[id].artist===a));
    if(ui.sub==='music-group'&&kind==='playlist')return state.playlists.find(p=>String(p.id)===a)?.tracks||[];
    return ids();
  }
  const uniq=list=>[...new Set(list)];
  /* AOSP Music 2.3.6 (MusicGoogle 2.3.6 on the Nexus S: the same com.android.music classes, read from the
     android-2.3.6_r1 source). The library is media_picker_activity.xml: buttonbar.xml's four 64 dp tabs, the list and
     nowplaying.xml (shown while a song is loaded; it opens the player).
     - Artists (ArtistAlbumBrowserActivity): an ExpandableListView, the group indicator 8-52 dp in, track_list_item_group
       rows (47 dp in) with the artist and MusicUtils.makeAlbumsLabel ("1 album" plus albumsongseparator); an expanded
       artist lists its albums as track_list_item_child rows (the album art, the album, "1 song" / Nsongs / Nsongscomp).
     - Albums (AlbumBrowserActivity): the art, the album and its artist.
     - Songs (TrackBrowserActivity): no icon, the title, the artist and the duration (durationformatshort).
     - Playlists (PlaylistBrowserActivity.mergedCursor): "Recently added" (ic_mp_playlist_recently_added_list), then the
       saved playlists (ic_mp_playlist_list), one line each; new playlists come from "Add to playlist".
     The play indicator marks the current artist (collapsed), album or song. An album, a playlist or Recently added opens a
     track list under the window title (no "withtabs"); a saved playlist and Now playing are ACTION_EDIT lists
     (edit_track_list_item on playlist_tile, 47 dp in) without the now-playing bar. Texts are the image's
     (gb-strings-music.js: S strings, N plurals). */
  function render(state,ui,t,S=key=>key,N=(key,n)=>String(n)) {
    const track=tracks[state.track],tab=ui.musicTab||'Artists';
    const button=(action,label,asset,extra='')=>`<button data-action="${action}" aria-label="${e(t(label))}" ${extra}>${img(asset)}</button>`;
    if(ui.sub==='player')return `<div class="app-view stock-music music-player"><div class="music-player-top"><div class="music-cover">${img('albumart_mp_unknown')}</div><div class="music-player-options">${button('music-queue','Now playing','ic_mp_current_playlist_btn')}${button('music-shuffle','Shuffle','ic_mp_shuffle_'+(state.shuffle?'on':'off')+'_btn',`aria-pressed="${state.shuffle}"`)}${button('music-repeat',t('Repeat')+': '+t({off:'Off',all:'Repeat all',one:'Repeat one'}[state.repeat]),'ic_mp_repeat_'+({off:'off',all:'all',one:'once'}[state.repeat])+'_btn')}</div></div><div class="music-track-details">${[['artist','ic_mp_artist_playback'],['album','ic_mp_album_playback'],['title','ic_mp_song_playback']].map(([key,asset])=>`<div>${img(asset)}<span>${e(track[key])}</span></div>`).join('')}</div><footer class="music-transport"><div><time class="music-elapsed">${time(state.position)}</time>${button('music-prev','Previous track','ic_media_previous')}${button('music-play',state.playing?'Pause':'Play',state.playing?'ic_media_pause':'ic_media_play')}${button('music-next','Next track','ic_media_next')}<time>${time(track.duration)}</time></div><input class="music-progress" type="range" min="0" max="${track.duration}" value="${state.position}" data-field="music-position" aria-label="${e(t('Track position'))}"></footer></div>`;
    const indicator=on=>on?img('indicator_ic_mp_playing_large','music-playing-mark'):'';
    const row=(cls,action,id,icon,line1,line2,extra='')=>`<div class="music-library-row ${cls}"><button data-action="${action}" data-id="${e(id)}">${icon}<span><strong>${e(line1)}</strong>${line2==null?'':`<small>${e(line2)}</small>`}</span>${extra}</button></div>`;
    const duration=secs=>S('durationformatshort').replace('%2$d',Math.floor(secs/60)).replace('%5$02d',String(secs%60).padStart(2,'0'));
    const song=(id,edit=false,mark=state.track===id)=>row(edit?'music-edit-row':'music-song-row','music-select',id,'',tracks[id].title,tracks[id].artist,`<time class="music-duration">${duration(tracks[id].duration)}</time>${mark?img(edit?'indicator_ic_mp_playing_list':'indicator_ic_mp_playing_large','music-playing-mark'):''}`);
    const albumsOf=artist=>uniq(tracks.filter(x=>!artist||x.artist===artist).map(x=>x.album));
    const songsLabel=(album,artist)=>{const all=tracks.filter(x=>x.album===album).length,mine=tracks.filter(x=>x.album===album&&x.artist===artist).length;return all===1?S('onesong'):all===mine?N('Nsongs',all):N('Nsongscomp',all,mine,artist);};
    const art=img('albumart_mp_unknown_list','music-art');
    const nowPlaying=()=>`<button class="music-nowplaying" data-action="music-player"><span><strong>${e(track.title)}</strong><small>${e(track.artist)}</small></span>${img('indicator_ic_mp_playing_large')}</button>`;
    if(ui.sub==='queue'||ui.sub==='music-group') {
      const [kind,a,b]=String(ui.musicGroup||'').split('|');
      const queue=ui.sub==='queue',edit=queue||kind==='playlist';
      const title=queue?S(state.party?'partyshuffle_title':'nowplaying_title'):kind==='album'?b:kind==='playlist'?state.playlists.find(p=>String(p.id)===a)?.name||'':S('recentlyadded_title');
      const list=listing(state,ui),rows=list.map((id,i)=>song(id,edit,queue?i===state.queue.indexOf(state.track):state.track===id)).join('');
      return `<div class="app-view stock-music music-tracks${edit?' music-editing':''}"><div class="gb-titlebar">${e(title)}</div><div class="music-library-scroll">${rows||`<p class="music-empty">${e(S('emptyplaylist'))}</p>`}</div>${edit?'':nowPlaying()}</div>`;
    }
    let rows='';
    if(tab==='Artists') {
      const open=new Set(ui.musicExpanded||[]);
      rows=uniq(tracks.map(x=>x.artist)).sort().map(artist=>{
        const expanded=open.has(artist);
        const group=`<div class="music-library-row music-group-row${expanded?' expanded':''}"><button data-action="music-expand" data-id="${e(artist)}" aria-expanded="${expanded}"><img class="music-expander" src="assets/gb-expander_ic_${expanded?'maximized':'minimized'}.png" alt=""><span><strong>${e(artist)}</strong><small>${e(N('Nalbums',albumsOf(artist).length)+S('albumsongseparator'))}</small></span>${indicator(!expanded&&track.artist===artist)}</button></div>`;
        return group+(expanded?albumsOf(artist).map(album=>row('music-child-row','music-group',`album|${artist}|${album}`,art,album,songsLabel(album,artist),indicator(track.album===album))).join(''):'');
      }).join('');
    } else if(tab==='Albums') rows=albumsOf().sort().map(album=>row('music-album-row','music-group',`album||${album}`,art,album,tracks.find(x=>x.album===album).artist,indicator(track.album===album))).join('');
    else if(tab==='Songs') rows=ids().map(id=>song(id)).join('');
    else rows=row('music-playlist-row','music-group','recent',img('ic_mp_playlist_recently_added_list'),S('recentlyadded'),null)+state.playlists.map(p=>row('music-playlist-row','music-group',`playlist|${p.id}`,img('ic_mp_playlist_list'),p.name,null)).join('');
    const tabs=`<nav class="music-tabs" aria-label="${e(S('musicbrowserlabel'))}">${[['Artists','browse_menu'],['Albums','albums_menu'],['Songs','tracks_menu'],['Playlists','playlists_menu']].map(([name,key])=>`<button data-action="music-tab" data-id="${name}" aria-pressed="${tab===name}">${img('ic_tab_'+name.toLowerCase()+'_'+(tab===name?'selected':'unselected'))}<span>${e(S(key))}</span></button>`).join('')}</nav>`;
    return `<div class="app-view stock-music">${tabs}<div class="music-library-scroll">${rows}</div>${nowPlaying()}</div>`;
  }
  function overlay(state,ui,t) {
    const shell=(title,body,form='')=>`<div class="settings-dialog-scrim" data-action="close-overlay"></div><${form?'form':'div'} class="settings-dialog music-dialog" ${form?`data-form="${form}"`:''} role="dialog" aria-label="${e(t(title))}"><h3>${e(t(title))}</h3>${body}</${form?'form':'div'}>`;
    if(ui.overlay==='music-track-menu')return shell(tracks[ui.musicSelected]?.title||'Music',`<button data-action="music-add-to-playlist">Add to playlist</button>${ui.musicTab==='Playlists'&&ui.sub==='music-group'?'<button data-action="music-remove-from-playlist">Remove from playlist</button>':''}<button data-action="close-overlay">Cancel</button>`);
    if(ui.overlay==='music-playlist-choice')return shell('Add to playlist',`${state.playlists.map(p=>`<button data-action="music-add-confirm" data-id="${p.id}">${e(p.name)}</button>`).join('')}<button data-action="music-new-playlist" data-id="add">New playlist</button>`);
    if(ui.overlay==='music-new-playlist')return shell('New playlist',`<label><span>Playlist name</span><input name="name" maxlength="60" required autofocus></label><div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">Save</button></div>`,'music-playlist');
    return '';
  }
  window.ICSMusic={tracks,restore,step,tick,time,listing,render,overlay};
})();
