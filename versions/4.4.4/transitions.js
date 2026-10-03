/* AOSP 4.3 window transitions (core/res/res/anim, AppTransition) and the launcher's state animations (Launcher3 4.4.4 for
   all apps), sampled for the Web Animations API. */
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
    // AppTransition.mThumbnailFadeoutInterpolator: linear over the first quarter, then held.
    thumbnailFade:t=>t<.25?t/.25:1,
    zoomOut:t=>decelerate(.75)(z(.13)(t)),
    zoomIn:t=>decelerate(3)(1-z(.35)(1-t))
  };
  const alpha=(from,to,duration,delay,curve)=>({kind:'alpha',from,to,duration,delay,curve});
  const scale=(from,to,duration,delay,curve,origin='')=>({kind:'scale',from:[].concat(from,from).slice(0,2),to:[].concat(to,to).slice(0,2),duration,delay,curve,origin});
  // translate with percentages of the window's own size (fromYDelta="120%").
  const shift=(from,to,duration,delay,curve)=>({kind:'translate',unit:'%',from:[0,from],to:[0,to],duration,delay,curve});
  /* Values copied from core/res/res/anim/*.xml at android-4.3_r1.1 (config_shortAnimTime = 200) and Launcher2 config.xml.
     "top" means the window is drawn above the other one (zAdjustment="top"). */
  const specs={
    // Launcher -> app without a launch rectangle: wallpaper_close_enter (0.2 -> 1) above a held launcher.
    'wallpaper-close':{enter:{top:true,tracks:[scale(.2,1,300,0,'decelerateCubic'),alpha(0,1,300,0,'decelerateCubic')]},exit:{tracks:[alpha(1,1,300,0,'linear')]}},
    // App -> launcher: wallpaper_open_exit (fade in 200 ms, shrink to 0.5 in 375 ms) above the held launcher.
    'wallpaper-open':{enter:{tracks:[alpha(1,1,375,0,'linear')]},exit:{top:true,tracks:[alpha(1,0,200,0,'accelerateDecelerate'),scale(1,.5,375,0,'decelerateQuad')]}},
    // Another task in front: task_open_*. The old task shrinks to 0.5 towards the top and slides up 120%;
    // after 300 ms the new one rises from 120% below, growing from 0.5 about its bottom edge.
    'task-open':{black:true,enter:{top:true,tracks:[alpha(0,1,400,300,'decelerateQuad'),shift(120,0,400,300,'decelerateQuint'),scale(.5,1,400,300,'decelerateQuad','50% 100%')]},exit:{tracks:[alpha(1,0,300,0,'accelerateQuad'),shift(0,-120,300,0,'accelerateCubic'),scale(1,.5,300,0,'accelerateQuad','50% 0%'),alpha(1,1,700,0,'linear')]}},
    'task-close':{black:true,enter:{top:true,tracks:[alpha(0,1,400,300,'decelerateQuad'),shift(-120,0,400,300,'decelerateQuint'),scale(.5,1,400,300,'decelerateQuad','50% 0%')]},exit:{tracks:[alpha(1,0,300,0,'accelerateQuad'),shift(0,120,300,0,'accelerateCubic'),scale(1,.5,300,0,'accelerateQuad','50% 100%'),alpha(1,1,700,0,'linear')]}},
    // Within one app: activity_open_* / activity_close_* (0.8 <-> 1 with a fade, 300 ms).
    'activity-open':{black:true,enter:{top:true,tracks:[alpha(0,1,300,0,'decelerateCubic'),scale(.8,1,300,0,'decelerateCubic')]},exit:{tracks:[alpha(1,0,300,0,'decelerateQuint')]}},
    'activity-close':{enter:{tracks:[alpha(1,1,300,0,'linear')]},exit:{top:true,tracks:[alpha(1,0,300,0,'decelerateCubic'),scale(1,.8,300,0,'decelerateCubic')]}},
    // Keyguard: lock_screen_exit (1 -> 1.1) above lock_screen_wallpaper_behind_enter (fade in after 200 ms).
    'unlock':{enter:{tracks:[alpha(0,1,200,200,'decelerateQuad')]},exit:{top:true,tracks:[scale(1,1.1,200,0,'accelerateQuint'),alpha(1,0,200,0,'accelerateQuad')]}},
    /* Launcher3 4.4.4 showAppsCustomizeHelper: after config_workspaceAppsCustomizeAnimationStagger (100 ms) all apps zooms
       from config_appsCustomizeZoomScaleFactor (7) in 350 ms (ZoomOutInterpolator) and fades in over 250 ms
       (DecelerateInterpolator(1.5)). Workspace.getChangeStateAnimation(SMALL) meanwhile shrinks the workspace to
       overview scale - 0.3 (0.8 - 0.3) and fades its shortcuts, hotseat and page indicator out in
       config_workspaceUnshrinkTime (300 ms) with ZoomInInterpolator. */
    'drawer-open':{enter:{top:true,tracks:[scale(7,1,350,100,'zoomOut'),alpha(0,1,250,100,'decelerateCubic')]},exit:{tracks:[scale(1,.5,300,0,'zoomIn'),alpha(1,0,300,0,'zoomIn')]}},
    /* Launcher.hideAppsCustomizeHelper: all apps zooms back to 7 in 600 ms (ZoomInInterpolator) and fades out in 200 ms;
       the workspace returns from 0.5 and fades its page back in over config_appsCustomizeWorkspaceShrinkTime (300 ms)
       after config_appsCustomizeWorkspaceAnimationStagger (40 ms), ZoomInInterpolator. */
    // Launcher2 Folder PARTIAL_GROW: config_folderAnimDuration = 120 ms, ObjectAnimator's default accelerate/decelerate.
    'folder-open':{enter:{tracks:[scale(.8,1,120,0,'accelerateDecelerate'),alpha(0,1,120,0,'accelerateDecelerate')]}},
    'folder-close':{exit:{tracks:[scale(1,.9,120,0,'accelerateDecelerate'),alpha(1,0,120,0,'accelerateDecelerate')]}},
    // DragView: 110 ms DecelerateInterpolator(2.5) lift by dragViewOffsetY (-8dp).
    'drag-lift':{enter:{tracks:[{kind:'translate',from:[0,0],to:[0,-8],duration:110,delay:0,curve:'decelerateQuint'}]}},
    'drawer-close':{enter:{tracks:[scale(.5,1,300,40,'zoomIn'),alpha(0,1,300,40,'zoomIn')]},exit:{top:true,tracks:[scale(1,7,600,0,'zoomIn'),alpha(1,0,200,0,'accelerateDecelerate')]}}
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
      if(track.kind==='translate'){const unit=track.unit||'px';return {offset,translate:`${track.from[0]+(track.to[0]-track.from[0])*p}${unit} ${track.from[1]+(track.to[1]-track.from[1])*p}${unit}`};}
      const [x,y]=[0,1].map(n=>track.from[n]+(track.to[n]-track.from[n])*p);
      return track.origin?{offset,transform:`scale(${x},${y})`,transformOrigin:track.origin}:{offset,transform:`scale(${x},${y})`};
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
  /* Launcher2 starts apps with ActivityOptions.makeScaleUpAnimation(icon): AppTransition.createScaleUpAnimationLocked
     grows the app from the icon's rectangle (pivot = -start / (scale - 1)) with decelerate_cubic and fades it in over
     the first quarter; the launcher holds. Launcher -> app is a wallpaper transit, so it lasts 250 ms. */
  function scaleUp(rect,width,height,duration=250) {
    const sx=rect.width/width,sy=rect.height/height,pivot=(start,k)=>Math.abs(k-1)<.0001?start:-start/(k-1);
    return {enter:{top:true,tracks:[scale([sx,sy],1,duration,0,'decelerateCubic',`${pivot(rect.left,sx)}px ${pivot(rect.top,sy)}px`),alpha(0,1,duration,0,'thumbnailFade')]},exit:{tracks:[alpha(1,1,duration,0,'linear')]}};
  }
  window.ICSTransitions={dropDuration,fly,curves,specs,kind,frames,length,play,scaleUp};
})();
