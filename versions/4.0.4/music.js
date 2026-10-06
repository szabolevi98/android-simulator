/* AOSP Music's pre-Holo library and player (packages/apps/Music android-4.0.4_r2.1, targetSdkVersion 9), with a local simulated queue.
   The image ships Play Music; the AOSP app is kept from the source of the same release (layouts and menus as in the other
   4.x tag, its delete question is the 4.0.4 wording ("… will be permanently deleted …")).
   Its menus are the app's: long press opens the context menu of a song, artist, album or playlist (Play, Add to playlist,
   Use as phone ringtone, Delete, Search), the navigation bar's legacy menu key the options (Party shuffle, Shuffle all;
   in the player Library, Party shuffle, Add to playlist, Use as phone ringtone, Delete). Playlists starts with Recently
   added. Texts: music-strings.js (docs/aosp-music-strings.py). */
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
  function listing(state,ui) {
    if(ui.sub==='queue')return state.queue;
    if(ui.sub==='music-group'&&ui.musicGroup==='recent')return ids().filter(id=>!(state.deleted||[]).includes(id));
    if(ui.sub==='music-group')return ui.musicTab==='Artists'?ids().filter(id=>tracks[id].artist===ui.musicGroup):ui.musicTab==='Albums'?ids().filter(id=>tracks[id].album===ui.musicGroup):(state.playlists.find(p=>String(p.id)===ui.musicGroup)?.tracks||[]);
    return ids().filter(id=>!(state.deleted||[]).includes(id));
  }
  const M=(key,lang=window.AndroidI18n?.language||'en')=>{const row=window.AOSPMusicStrings?.[key];return row?row[lang]||row.en:key;};
  function render(state,ui,t) {
    const track=tracks[state.track],tab=ui.musicTab||'Artists';
    const button=(action,label,asset,extra='')=>`<button data-action="${action}" aria-label="${e(t(label))}" ${extra}>${img(asset)}</button>`;
    if(ui.sub==='player')return `<div class="app-view stock-music music-player"><div class="music-player-top"><div class="music-cover">${img('albumart_mp_unknown')}</div><div class="music-player-options">${button('music-queue','Now playing','ic_mp_current_playlist_btn')}${button('music-shuffle','Shuffle','ic_mp_shuffle_'+(state.shuffle?'on':'off')+'_btn',`aria-pressed="${state.shuffle}"`)}${button('music-repeat',t('Repeat')+': '+t({off:'Off',all:'Repeat all',one:'Repeat one'}[state.repeat]),'ic_mp_repeat_'+({off:'off',all:'all',one:'once'}[state.repeat])+'_btn')}</div></div><div class="music-track-details">${[['artist','ic_mp_artist_playback'],['album','ic_mp_album_playback'],['title','ic_mp_song_playback']].map(([key,asset])=>`<div>${img(asset)}<span>${e(track[key])}</span></div>`).join('')}</div><footer class="music-transport"><div><time class="music-elapsed">${time(state.position)}</time>${button('music-prev','Previous track','ic_media_previous')}${button('music-play',state.playing?'Pause':'Play',state.playing?'ic_media_pause':'ic_media_play')}${button('music-next','Next track','ic_media_next')}<time>${time(track.duration)}</time></div><input class="music-progress" type="range" min="0" max="${track.duration}" value="${state.position}" data-field="music-position" aria-label="${e(t('Track position'))}"></footer></div>`;
    let rows='';
    const song=id=>`<div class="music-library-row"><button data-action="music-select" data-id="${id}" data-music-hold="track:${id}">${img('ic_mp_song_list')}<span><strong>${e(tracks[id].title)}</strong><small>${e(tracks[id].artist+' — '+tracks[id].album)}</small></span>${state.track===id&&state.playing?img('indicator_ic_mp_playing_large','music-playing-mark'):''}</button></div>`;
    const group=(id,title,subtitle,asset)=>`<div class="music-library-row"><button data-action="music-group" data-id="${e(id)}" data-music-hold="${e((ui.musicTab||'Artists')==='Playlists'?'playlist':'group')}:${e(id)}">${img(asset)}<span><strong>${e(title)}</strong><small>${e(subtitle)}</small></span></button></div>`;
    if(ui.sub==='queue'||ui.sub==='music-group'||tab==='Songs')rows=listing(state,ui).map(song).join('');
    else if(tab==='Artists'||tab==='Albums') {const key=tab==='Artists'?'artist':'album';rows=[...new Set(tracks.map(item=>item[key]))].sort().map(name=>group(name,name,tab==='Albums'?tracks.find(item=>item.album===name).artist:`${tracks.filter(item=>item.artist===name).length} ${t('Songs')}`,tab==='Artists'?'ic_mp_artist_list':'albumart_mp_unknown_list')).join('');}
    else rows=group('recent',M('recentlyadded',ui.lang),'','ic_mp_playlist_recently_added_list')+state.playlists.map(p=>group(String(p.id),p.name,`${p.tracks.length} ${t(p.tracks.length===1?'Song':'Songs')}`,'ic_mp_playlist_list')).join('');
    const tabs=`<nav class="music-tabs" aria-label="${e(t('Music library'))}">${['Artists','Albums','Songs','Playlists'].map(name=>`<button data-action="music-tab" data-id="${name}" aria-pressed="${tab===name}">${img('ic_tab_'+name.toLowerCase()+'_'+(tab===name?'selected':'unselected'))}<span>${e(t(name))}</span></button>`).join('')}</nav>`;
    const groupHeader=ui.sub?`<header class="music-group-header"><span>${e(ui.sub==='queue'?t('Now playing'):ui.musicGroup==='recent'?M('recentlyadded',ui.lang):ui.musicTab==='Playlists'?state.playlists.find(p=>String(p.id)===ui.musicGroup)?.name:ui.musicGroup)}</span></header>`:'';
    return `<div class="app-view stock-music">${tabs}${groupHeader}<div class="music-library-scroll">${rows||'<p class="empty-note">No songs</p>'}</div><button class="music-nowplaying" data-action="music-player"><span><strong>${e(track.title)}</strong><small>${e(track.artist)}</small></span>${img('indicator_ic_mp_playing_large')}</button></div>`;
  }
  function overlay(state,ui,t) {
    const shell=(title,body,form='')=>`<div class="settings-dialog-scrim" data-action="close-overlay"></div><${form?'form':'div'} class="settings-dialog music-dialog" ${form?`data-form="${form}"`:''} role="dialog" aria-label="${e(t(title))}"><h3>${e(t(title))}</h3>${body}</${form?'form':'div'}>`;
    const lang=ui.lang,item=(action,key,id='')=>`<button data-action="${action}"${id!==''?` data-id="${e(id)}"`:''}>${e(M(key,lang))}</button>`;
    // TrackBrowserActivity / AlbumBrowserActivity / ArtistAlbumBrowserActivity / PlaylistBrowserActivity context menus.
    if(ui.overlay==='music-context'){
      const [kind,id]=String(ui.musicHold||'').split(/:(.*)/s),inPlaylist=ui.musicTab==='Playlists'&&ui.sub==='music-group'&&ui.musicGroup!=='recent';
      if(kind==='track')return shell(tracks[id]?.title||'',`${item('music-ctx-play','play_selection',id)}${item('music-add-to-playlist','add_to_playlist',id)}${inPlaylist?item('music-remove-from-playlist','remove_from_playlist',id):''}${item('music-ringtone','ringtone_menu',id)}${item('music-delete','delete_item',id)}${item('music-search','search_title',tracks[id]?.title)}`);
      if(kind==='playlist')return shell(id==='recent'?M('recentlyadded',lang):state.playlists.find(p=>String(p.id)===id)?.name||'',`${item('music-ctx-play','play_selection','playlist:'+id)}${id==='recent'?'':item('music-playlist-delete','delete_playlist_menu',id)}`);
      return shell(id,`${item('music-ctx-play','play_selection','group:'+id)}${item('music-add-to-playlist','add_to_playlist','group:'+id)}${item('music-delete','delete_item','group:'+id)}${item('music-search','search_title',id)}`);
    }
    // The legacy menu key's options menu (MusicBrowserActivity / MediaPlaybackActivity onCreateOptionsMenu).
    if(ui.overlay==='music-options')return `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu music-options">${ui.sub==='player'?`${item('music-library','goto_start')}${item('music-party',state.party?'party_shuffle_off':'party_shuffle')}${item('music-add-to-playlist','add_to_playlist',String(state.track))}${item('music-ringtone','ringtone_menu',String(state.track))}${item('music-delete','delete_item',String(state.track))}`:`${item('music-party',state.party?'party_shuffle_off':'party_shuffle')}${item('music-shuffle-all','shuffle_all')}`}</div>`;
    if(ui.overlay==='music-delete')return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog music-dialog" role="dialog"><p>${e(M('delete_song_desc',lang).replace('%s',tracks[ui.musicSelected]?.title||''))}</p><div class="settings-dialog-actions"><button data-action="close-overlay">${e(t('Cancel'))}</button><button data-action="music-delete-confirm">${e(M('delete_confirm_button_text',lang))}</button></div></div>`;
    if(ui.overlay==='music-playlist-choice')return shell(M('add_to_playlist',ui.lang),`${state.playlists.map(p=>`<button data-action="music-add-confirm" data-id="${p.id}">${e(p.name)}</button>`).join('')}<button data-action="music-new-playlist" data-id="add">${e(M('new_playlist',ui.lang))}</button>`);
    if(ui.overlay==='music-new-playlist')return shell('New playlist',`<label><span>Playlist name</span><input name="name" maxlength="60" required autofocus></label><div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">Save</button></div>`,'music-playlist');
    return '';
  }
  window.ICSMusic={tracks,restore,step,tick,time,listing,render,overlay,M};
})();
