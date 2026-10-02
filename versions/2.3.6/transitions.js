/* AOSP 2.3.6 window transitions and Launcher2 state animations, sampled for the Web Animations API. */
(() => {
  'use strict';
  // android.view.animation interpolators; factor 1 uses the faster quadratic path, as Android does.
  const decelerate=f=>t=>f===1?1-(1-t)*(1-t):1-Math.pow(1-t,2*f);
  const accelerate=f=>t=>f===1?t*t:Math.pow(t,2*f);
  // Launcher2 Workspace.ZInterpolator and its zoom compositions.
  const z=focal=>t=>(1-focal/(focal+t))/(1-focal/(focal+1));
  const curves={
    linear:t=>t,
    decelerateQuad:decelerate(1),decelerateCubic:decelerate(1.5),decelerateQuint:decelerate(2.5),decelerate2:decelerate(2),accelerate2:accelerate(2),
    accelerateQuad:accelerate(1),accelerateCubic:accelerate(1.5),accelerateQuint:accelerate(2.5),
    accelerateDecelerate:t=>Math.cos((t+1)*Math.PI)/2+.5,
    zoomOut:t=>decelerate(.75)(z(.13)(t)),
    zoomIn:t=>decelerate(3)(1-z(.35)(1-t))
  };
  const alpha=(from,to,duration,delay,curve)=>({kind:'alpha',from,to,duration,delay,curve});
  const scale=(from,to,duration,delay,curve,origin='50% 50%')=>({kind:'scale',from:[].concat(from,from).slice(0,2),to:[].concat(to,to).slice(0,2),duration,delay,curve,origin});
  // fromXDelta/toXDelta as a percentage of the window's own width.
  const slide=(from,to,duration,delay,curve)=>({kind:'translate',unit:'%',from:[from,0],to:[to,0],duration,delay,curve});
  /* Values copied from the 2.3.6 core/res/res/anim/*.xml (config_shortAnimTime 150, config_mediumAnimTime 300,
     config_longAnimTime 400; @anim/decelerate_interpolator is factor 1). "top" means zAdjustment="top". */
  const specs={
    // Launcher -> app: wallpaper_close_enter (scale .5 -> 1, alpha with accelerate_decelerate) above wallpaper_close_exit
    // (scale 1 -> 2; detachWallpaper keeps the wallpaper still).
    'wallpaper-close':{enter:{top:true,tracks:[scale(.5,1,300,0,'decelerateQuad'),alpha(0,1,300,0,'accelerateDecelerate')]},exit:{tracks:[scale(1,2,300,0,'decelerateQuad')]}},
    // App -> launcher: wallpaper_open_enter (scale 2 -> 1) under wallpaper_open_exit (scale 1 -> .5, fade out).
    'wallpaper-open':{enter:{tracks:[scale(2,1,300,0,'decelerateQuad')]},exit:{top:true,tracks:[scale(1,.5,300,0,'decelerateQuad'),alpha(1,0,300,0,'accelerateDecelerate')]}},
    // task_open_enter slides in from 33%; task_open_exit (on top) grows to 2x about its right edge while sliding off left.
    'task-open':{black:true,enter:{tracks:[slide(33,0,150,0,'decelerateQuad')]},exit:{top:true,tracks:[scale(1,2,150,0,'decelerateQuad','100% 50%'),slide(0,-100,150,0,'decelerateQuad')]}},
    'task-close':{black:true,enter:{top:true,tracks:[scale(2,1,150,0,'decelerateQuad','100% 50%'),slide(-100,0,150,0,'decelerateQuad')]},exit:{tracks:[slide(0,33,150,0,'decelerateQuad')]}},
    // activity_open_*: the new screen slides in from 33% while the old one (on top) slides off to the left.
    'activity-open':{black:true,enter:{tracks:[slide(33,0,150,0,'decelerateQuad')]},exit:{top:true,tracks:[slide(0,-100,150,0,'decelerateQuad')]}},
    'activity-close':{black:true,enter:{top:true,tracks:[slide(-100,0,150,0,'decelerateQuad')]},exit:{tracks:[slide(0,33,150,0,'decelerateQuad')]}},
    // Keyguard: lock_screen_exit fades out above lock_screen_behind_enter, both 400 ms accelerate.
    'unlock':{enter:{tracks:[alpha(0,1,400,0,'accelerateQuad')]},exit:{top:true,tracks:[alpha(1,0,400,0,'accelerateQuad')]}},
    // AllApps2D.zoom: all_apps_2d_fade_in / _fade_out, config_allAppsFadeInTime / FadeOutTime = 700 ms.
    'drawer-open':{enter:{top:true,tracks:[alpha(0,1,700,0,'decelerateQuad')]},exit:{tracks:[]}},
    'drawer-close':{enter:{tracks:[]},exit:{top:true,tracks:[alpha(1,0,700,0,'accelerateQuad')]}},
    // UserFolder: no open animation in 2.3; kept as instant.
    'folder-open':{enter:{tracks:[]},exit:{tracks:[]}},
    'folder-close':{enter:{tracks:[]},exit:{tracks:[]}},
    // DragView: 110 ms DecelerateInterpolator(2.5) lift by dragViewOffsetY (-8dp).
    'drag-lift':{enter:{tracks:[{kind:'translate',from:[0,0],to:[0,-8],duration:110,delay:0,curve:'decelerateQuint'}]},exit:{tracks:[]}}
  };
  const launcher=view=>view==='home'||view==='drawer';
  // Chooses the WindowManager transit for a view change; nav is 'back' when Back initiated it.
  function kind(previous,next,nav='') {
    if(!previous||!next||next.view==='lock')return '';
    if(previous.view==='lock')return 'unlock';
    if(launcher(previous.view)&&launcher(next.view))return previous.view===next.view?'':next.view==='drawer'?'drawer-open':'drawer-close';
    if(launcher(previous.view))return 'wallpaper-close';
    if(launcher(next.view))return 'wallpaper-open';
    if(previous.view!==next.view)return nav==='back'?'task-close':'task-open';
    if(previous.sub!==next.sub)return nav==='back'?'activity-close':'activity-open';
    return '';
  }
  const steps=24;
  function frames(track) {
    const curve=curves[track.curve]||curves.linear;
    return Array.from({length:steps+1},(_,i)=>{
      const p=curve(i/steps),offset=i/steps;
      if(track.kind==='alpha')return {offset,opacity:track.from+(track.to-track.from)*p};
      const unit=track.unit||'px';
      if(track.kind==='translate')return {offset,translate:`${track.from[0]+(track.to[0]-track.from[0])*p}${unit} ${track.from[1]+(track.to[1]-track.from[1])*p}${unit}`};
      const [x,y]=[0,1].map(n=>track.from[n]+(track.to[n]-track.from[n])*p);
      return {offset,transform:`scale(${x},${y})`,transformOrigin:track.origin||'50% 50%'};
    });
  }
  const length=spec=>Math.max(0,...['enter','exit'].flatMap(side=>(spec[side]?.tracks||[]).map(track=>track.delay+track.duration)));
  // Each property is a separate animation so independent delays and curves match the XML sets.
  function play(element,side,scaleFactor=1) {
    if(!element?.animate)return [];
    return side.tracks.map(track=>element.animate(frames(track),{duration:track.duration*scaleFactor,delay:track.delay*scaleFactor,fill:'both',easing:'linear'}));
  }
  /* DragLayer.animateView: duration = config_dropAnimMaxDuration (500) eased by DecelerateInterpolator(1.5)
     over config_dropAnimMaxDist (800 px on the xhdpi Galaxy Nexus, roughly 2 device px per CSS px). */
  function dropDuration(distance,devicePixels=2) {
    const dist=distance*devicePixels;
    return dist<800?500*curves.decelerateCubic(dist/800):500;
  }
  // Moves an element whose untransformed layout box is base from one rectangle to another.
  function fly(element,base,from,to,{duration,motion='decelerateCubic',fade=null}) {
    if(!element?.animate||!base.width||!base.height)return null;
    const move=curves[motion]||curves.linear,fadeCurve=fade&&(curves[fade.curve]||curves.linear);
    return element.animate(Array.from({length:steps+1},(_,i)=>{
      const t=i/steps,p=move(t),value=(key)=>from[key]+(to[key]-from[key])*p;
      const frame={offset:t,transformOrigin:'0 0',transform:`translate(${value('left')-base.left}px,${value('top')-base.top}px) scale(${value('width')/base.width},${value('height')/base.height})`};
      if(fade)frame.opacity=1+(fade.to-1)*fadeCurve(t);
      return frame;
    }),{duration,easing:'linear',fill:'forwards'});
  }
  window.ICSTransitions={dropDuration,fly,curves,specs,kind,frames,length,play};
})();
