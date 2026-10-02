/* AOSP Music's pre-Holo library and player, with a local simulated queue. */
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
    if(ui.sub==='music-group')return ui.musicTab==='Artists'?ids().filter(id=>tracks[id].artist===ui.musicGroup):ui.musicTab==='Albums'?ids().filter(id=>tracks[id].album===ui.musicGroup):(state.playlists.find(p=>String(p.id)===ui.musicGroup)?.tracks||[]);
    return ids();
  }
  function render(state,ui,t) {
    const track=tracks[state.track],tab=ui.musicTab||'Artists';
    const button=(action,label,asset,extra='')=>`<button data-action="${action}" aria-label="${e(t(label))}" ${extra}>${img(asset)}</button>`;
    if(ui.sub==='player')return `<div class="app-view stock-music music-player"><div class="music-player-top"><div class="music-cover">${img('albumart_mp_unknown')}</div><div class="music-player-options">${button('music-queue','Now playing','ic_mp_current_playlist_btn')}${button('music-shuffle','Shuffle','ic_mp_shuffle_'+(state.shuffle?'on':'off')+'_btn',`aria-pressed="${state.shuffle}"`)}${button('music-repeat',t('Repeat')+': '+t({off:'Off',all:'Repeat all',one:'Repeat one'}[state.repeat]),'ic_mp_repeat_'+({off:'off',all:'all',one:'once'}[state.repeat])+'_btn')}</div></div><div class="music-track-details">${[['artist','ic_mp_artist_playback'],['album','ic_mp_album_playback'],['title','ic_mp_song_playback']].map(([key,asset])=>`<div>${img(asset)}<span>${e(track[key])}</span></div>`).join('')}</div><footer class="music-transport"><div><time class="music-elapsed">${time(state.position)}</time>${button('music-prev','Previous track','ic_media_previous')}${button('music-play',state.playing?'Pause':'Play',state.playing?'ic_media_pause':'ic_media_play')}${button('music-next','Next track','ic_media_next')}<time>${time(track.duration)}</time></div><input class="music-progress" type="range" min="0" max="${track.duration}" value="${state.position}" data-field="music-position" aria-label="${e(t('Track position'))}"></footer></div>`;
    let rows='';
    const song=id=>`<div class="music-library-row"><button data-action="music-select" data-id="${id}">${img('ic_mp_song_list')}<span><strong>${e(tracks[id].title)}</strong><small>${e(tracks[id].artist+' — '+tracks[id].album)}</small></span>${state.track===id&&state.playing?img('indicator_ic_mp_playing_large','music-playing-mark'):''}<time class="music-duration">${time(tracks[id].duration)}</time></button></div>`;
    const group=(id,title,subtitle,asset)=>`<div class="music-library-row"><button data-action="music-group" data-id="${e(id)}">${img(asset)}<span><strong>${e(title)}</strong><small>${e(subtitle)}</small></span></button></div>`;
    if(ui.sub==='queue'||ui.sub==='music-group'||tab==='Songs')rows=listing(state,ui).map(song).join('');
    else if(tab==='Artists'||tab==='Albums') {const key=tab==='Artists'?'artist':'album';rows=[...new Set(tracks.map(item=>item[key]))].sort().map(name=>group(name,name,tab==='Albums'?tracks.find(item=>item.album===name).artist:`${tracks.filter(item=>item.artist===name).length} ${t('Songs')}`,tab==='Artists'?'ic_mp_artist_list':'albumart_mp_unknown_list')).join('');}
    else rows=`<button class="music-new-playlist" data-action="music-new-playlist">＋ ${e(t('New playlist'))}</button>`+state.playlists.map(p=>group(String(p.id),p.name,`${p.tracks.length} ${t(p.tracks.length===1?'Song':'Songs')}`,'ic_mp_playlist_list')).join('');
    const tabs=`<nav class="music-tabs" aria-label="${e(t('Music library'))}">${['Artists','Albums','Songs','Playlists'].map(name=>`<button data-action="music-tab" data-id="${name}" aria-pressed="${tab===name}">${img('ic_tab_'+name.toLowerCase()+'_'+(tab===name?'selected':'unselected'))}<span>${e(t(name))}</span></button>`).join('')}</nav>`;
    const groupHeader=ui.sub?`<header class="music-group-header"><button data-action="music-library" aria-label="${e(t('Back'))}">‹</button><span>${e(ui.sub==='queue'?t('Now playing'):ui.musicTab==='Playlists'?state.playlists.find(p=>String(p.id)===ui.musicGroup)?.name:ui.musicGroup)}</span></header>`:'';
    return `<div class="app-view stock-music">${tabs}${groupHeader}<div class="music-library-scroll">${rows||'<p class="empty-note">No songs</p>'}</div><button class="music-nowplaying" data-action="music-player"><span><strong>${e(track.title)}</strong><small>${e(track.artist)}</small></span>${img('indicator_ic_mp_playing_large')}</button></div>`;
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
