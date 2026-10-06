/* The music player state behind Lollipop's Play Music and its widget (5.1.1): the demo tracks, the queue, shuffle, repeat and the
   playing position. The AOSP Music app is not in the image, so nothing here draws a screen. */
(() => {
  'use strict';
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
  window.ICSMusic={tracks,restore,step,tick,time};
})();
