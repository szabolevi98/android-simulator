/* AOSP 4.0.4 window transitions and Launcher2 state animations, sampled for the Web Animations API. */
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
  const scale=(from,to,duration,delay,curve)=>({kind:'scale',from:[].concat(from,from).slice(0,2),to:[].concat(to,to).slice(0,2),duration,delay,curve});
  /* Values copied from core/res/res/anim/*.xml (config_shortAnimTime = 200) and Launcher2 config.xml.
     "top" means the window is drawn above the other one (zAdjustment="top"). */
  const specs={
    // Launcher -> app: wallpaper_close_enter / wallpaper_close_exit.
    'wallpaper-close':{enter:{top:true,tracks:[scale([1.2,.8],1,240,300,'decelerateQuint'),alpha(0,1,300,300,'decelerateQuad')]},exit:{tracks:[alpha(1,0,200,0,'decelerateCubic'),scale(1,.95,300,0,'decelerateQuint')]}},
    // App -> launcher: wallpaper_open_enter / wallpaper_open_exit.
    'wallpaper-open':{enter:{tracks:[scale(.95,1,300,200,'decelerateQuint'),alpha(0,1,300,200,'decelerateCubic')]},exit:{top:true,tracks:[alpha(1,0,200,0,'accelerateCubic'),scale(1,[1.2,.8],200,0,'accelerateQuint')]}},
    // Another task in front: task_open_* (also used for Recents); its window background is black.
    'task-open':{black:true,enter:{top:true,tracks:[scale([1.2,.8],1,240,300,'decelerateQuint'),alpha(0,1,300,300,'decelerateQuad')]},exit:{tracks:[alpha(1,0,200,0,'decelerateCubic'),scale(1,.95,300,0,'decelerateQuint')]}},
    'task-close':{black:true,enter:{tracks:[scale(.95,1,300,200,'decelerateQuint'),alpha(0,1,300,200,'decelerateCubic')]},exit:{top:true,tracks:[alpha(1,0,200,0,'accelerateCubic'),scale(1,[1.2,.8],200,0,'accelerateQuint')]}},
    // Within one app: activity_open_* / activity_close_*.
    'activity-open':{enter:{top:true,tracks:[alpha(0,1,200,0,'decelerateCubic'),scale(1.1,1,200,0,'decelerateQuint')]},exit:{tracks:[scale(1,.95,200,0,'decelerateQuint')]}},
    'activity-close':{enter:{tracks:[scale(.95,1,200,0,'accelerateQuint')]},exit:{top:true,tracks:[alpha(1,0,200,0,'decelerateCubic'),scale(1,1.1,200,0,'decelerateQuint')]}},
    // Keyguard: lock_screen_exit above lock_screen_behind_enter.
    'unlock':{enter:{tracks:[scale(.95,1,200,200,'decelerateCubic'),alpha(0,1,200,200,'decelerateQuad')]},exit:{top:true,tracks:[scale(1,1.15,200,0,'accelerateQuint'),alpha(1,0,200,0,'accelerateQuad')]}},
    // Launcher.showAppsCustomizeHelper: zoom factor 7, 350 ms zoom, 250 ms fade after the 100 ms stagger; the current workspace page stays opaque and shrinks to 0.7 in 300 ms.
    'drawer-open':{enter:{top:true,tracks:[scale(7,1,350,0,'zoomOut'),alpha(0,1,250,100,'decelerateCubic')]},exit:{tracks:[scale(1,.7,300,0,'accelerateDecelerate')]}},
    // Launcher.hideAppsCustomizeHelper: 600 ms zoom back to 7, 200 ms fade; workspace unshrinks with ZoomInInterpolator.
    // Launcher2 Folder PARTIAL_GROW: config_folderAnimDuration = 120 ms, ObjectAnimator's default accelerate/decelerate.
    'folder-open':{enter:{tracks:[scale(.8,1,120,0,'accelerateDecelerate'),alpha(0,1,120,0,'accelerateDecelerate')]}},
    'folder-close':{exit:{tracks:[scale(1,.9,120,0,'accelerateDecelerate'),alpha(1,0,120,0,'accelerateDecelerate')]}},
    // DragView: 110 ms DecelerateInterpolator(2.5) lift by dragViewOffsetY (-8dp).
    'drag-lift':{enter:{tracks:[{kind:'translate',from:[0,0],to:[0,-8],duration:110,delay:0,curve:'decelerateQuint'}]}},
    'drawer-close':{enter:{tracks:[scale(.7,1,300,0,'zoomIn')]},exit:{top:true,tracks:[scale(1,7,600,0,'zoomIn'),alpha(1,0,200,0,'accelerateDecelerate')]}}
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
      if(track.kind==='translate')return {offset,translate:`${track.from[0]+(track.to[0]-track.from[0])*p}px ${track.from[1]+(track.to[1]-track.from[1])*p}px`};
      const [x,y]=[0,1].map(n=>track.from[n]+(track.to[n]-track.from[n])*p);
      return {offset,transform:`scale(${x},${y})`};
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
