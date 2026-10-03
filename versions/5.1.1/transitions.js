/* AOSP 5.1 window transitions (core/res/res/anim at android-5.1.1_r26, AppTransition) and the Launcher3 state animations,
   sampled for the Web Animations API. */
(() => {
  'use strict';
  // android.view.animation interpolators; factor 1 uses the faster quadratic path, as Android does.
  const decelerate=f=>t=>f===1?1-(1-t)*(1-t):1-Math.pow(1-t,2*f);
  const accelerate=f=>t=>f===1?t*t:Math.pow(t,2*f);
  // A cubic Bezier from (0,0) to (1,1), solved for x by bisection (PathInterpolator).
  function bezier(x1,y1,x2,y2) {
    const at=(a,b,t)=>3*a*(1-t)*(1-t)*t+3*b*(1-t)*t*t+t*t*t;
    return x=>{let lo=0,hi=1;for(let i=0;i<30;i++){const mid=(lo+hi)/2;if(at(x1,x2,mid)<x)lo=mid;else hi=mid;}return at(y1,y2,(lo+hi)/2);};
  }
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
    zoomIn:t=>decelerate(3)(1-z(.35)(1-t)),
    // Lollipop's interpolators (core/res/res/interpolator): the Material path curves and the quart/quint powers.
    fastOutSlowIn:bezier(.4,0,.2,1),linearOutSlowIn:bezier(0,0,.2,1),fastOutLinearIn:bezier(.4,0,1,1),
    decelerateQuart:decelerate(2),accelerateQuart:accelerate(2)
  };
  const alpha=(from,to,duration,delay,curve)=>({kind:'alpha',from,to,duration,delay,curve});
  const scale=(from,to,duration,delay,curve,origin='')=>({kind:'scale',from:[].concat(from,from).slice(0,2),to:[].concat(to,to).slice(0,2),duration,delay,curve,origin});
  // translate with percentages of the window's own size (fromYDelta="120%").
  const shift=(from,to,duration,delay,curve)=>({kind:'translate',unit:'%',from:[0,from],to:[0,to],duration,delay,curve});
  /* Values copied from core/res/res/anim/*.xml at android-4.3_r1.1 (config_shortAnimTime = 200) and Launcher2 config.xml.
     "top" means the window is drawn above the other one (zAdjustment="top"). */
  const specs={
    // Launcher -> app without a launch rectangle: wallpaper_close_enter rises 110% from below after 300 ms over the held launcher.
    'wallpaper-close':{enter:{top:true,tracks:[alpha(0,1,167,300,'decelerateQuart'),shift(110,0,417,300,'decelerateQuint')]},exit:{tracks:[alpha(1,1,417,0,'linear')]}},
    // App -> launcher: wallpaper_open_exit drops the app 110% (fast_out_linear_in, 225 ms) and fades it after 250 ms.
    'wallpaper-open':{enter:{tracks:[alpha(1,1,225,0,'linear')]},exit:{top:true,tracks:[shift(0,110,225,0,'fastOutLinearIn'),alpha(1,0,167,250,'accelerateQuad')]}},
    // Another task in front: task_open_*. The old task sinks 10% and shrinks to 0.9 while dimming to 0.6; after 300 ms
    // the new one rises 110% from below.
    'task-open':{black:true,enter:{top:true,tracks:[alpha(0,1,167,300,'decelerateQuart'),shift(110,0,417,300,'decelerateQuint')]},exit:{tracks:[alpha(1,.6,133,0,'accelerateCubic'),shift(0,10,433,0,'accelerateCubic'),scale(1,.9,433,0,'fastOutSlowIn')]}},
    'task-close':{black:true,enter:{tracks:[alpha(.6,1,133,600,'decelerateCubic'),shift(10,0,433,300,'decelerateCubic'),scale(.9,1,433,300,'fastOutSlowIn','50% 0%')]},exit:{top:true,tracks:[shift(0,110,417,0,'accelerateQuint'),alpha(1,0,167,250,'accelerateQuad')]}},
    // Within one app: activity_open_* (rise 8% while fading in over a dimming parent) and activity_close_*.
    'activity-open':{black:true,enter:{top:true,tracks:[alpha(0,1,200,0,'decelerateQuart'),shift(8,0,350,0,'decelerateQuint')]},exit:{tracks:[alpha(1,.7,217,0,'fastOutSlowIn')]}},
    'activity-close':{enter:{tracks:[alpha(.7,1,250,0,'linearOutSlowIn')]},exit:{top:true,tracks:[shift(0,8,250,0,'accelerateQuart'),alpha(1,0,150,100,'linear')]}},
    // Keyguard: lock_screen_exit (1 -> 1.1, 200 ms) above lock_screen_behind_enter (110% up after 100 ms, 300 ms).
    'unlock':{enter:{tracks:[shift(110,0,300,100,'decelerateQuint')]},exit:{top:true,tracks:[scale(1,1.1,200,0,'accelerateQuint'),alpha(1,0,200,0,'accelerateQuad')]}},
    // Launcher.showAppsCustomizeHelper (material): the workspace fades out (NORMAL_HIDDEN) while the panel reveals in
    // its own animation (lp-launcher.css); hideAppsCustomizeHelper conceals it in 250 ms as the workspace comes back.
    'drawer-open':{enter:{tracks:[alpha(1,1,220,0,'linear')]},exit:{tracks:[alpha(1,0,250,0,'decelerateCubic')]}},
    // Launcher3 Folder.animateOpen (material): a 200 ms circular reveal from the folder icon, drawn by lp-launcher.css
    // (config_materialFolderExpandDuration); this track only times it. animateClosed fades and shrinks.
    'folder-open':{enter:{tracks:[alpha(1,1,260,0,'linear')]}},
    'folder-close':{exit:{tracks:[scale(1,.8,150,0,'fastOutSlowIn'),alpha(1,0,150,0,'accelerateQuad')]}},
    // DragView: 110 ms DecelerateInterpolator(2.5) lift by dragViewOffsetY (-8dp).
    'drag-lift':{enter:{tracks:[{kind:'translate',from:[0,0],to:[0,-8],duration:110,delay:0,curve:'decelerateQuint'}]}},
    // Launcher.hideAppsCustomizeHelper (material) with the GNL 1.1 integers in Velvet: the page's icons fade in 100 ms,
    // the white panel conceals in a circle from half its diagonal to the all-apps button (allAppsButtonVisualSize / 2)
    // over config_appsCustomizeConcealTime (250 ms) after config_appsCustomizeItemsAlphaStagger (60 ms), drifting to
    // the button, all with LogDecelerateInterpolator(100, 0) (conceal() below). The workspace's items, hotseat, page
    // indicator and search bar come back over config_appsCustomizeWorkspaceShrinkTime (300 ms), ZoomInInterpolator.
    'drawer-close':{enter:{tracks:[alpha(0,1,300,0,'zoomIn')]},exit:{top:true,tracks:[alpha(1,1,326,0,'linear')]},custom:(outgoing,incoming,factor)=>conceal(outgoing,incoming,factor)}
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
  // LogDecelerateInterpolator(base 100, drift 0): (1 - 100^-t) / (1 - 1 / 100).
  const logDecelerate=t=>(1-Math.pow(100,-t))/(1-.01);
  function conceal(outgoing,incoming,factor=1) {
    const panel=outgoing?.querySelector('.lp-drawer-panel'),page=outgoing?.querySelector('.drawer-page'),dots=outgoing?.querySelector('.drawer-indicators');
    const button=incoming?.querySelector('[data-action="drawer"]');
    if(!panel)return [];
    const zoom=panel.getBoundingClientRect().width/(panel.offsetWidth||1)||1,p=panel.getBoundingClientRect(),b=button?.getBoundingClientRect();
    const dx=b?(b.left+b.width/2-(p.left+p.width/2))/zoom:0,dy=b?(b.top+b.height/2-(p.top+p.height/2))/zoom:p.height/zoom/2;
    const r0=Math.hypot(panel.offsetWidth,panel.offsetHeight)/2,r1=b?Math.min(b.width,b.height)/zoom/2:0;
    const steps=Array.from({length:17},(_,i)=>i/16),run=(node,frames,duration,delay)=>node.animate(frames,{duration:duration*factor,delay:delay*factor,fill:'both',easing:'linear'});
    const drift=k=>`translate(${(dx*k).toFixed(1)}px,${(dy*k).toFixed(1)}px)`;
    const out=[run(panel,steps.map(t=>({offset:t,clipPath:`circle(${(r0+(r1-r0)*logDecelerate(t)).toFixed(1)}px at 50% 50%)`,transform:drift(logDecelerate(t))})),250,60)];
    if(page)out.push(run(page,steps.map(t=>({offset:t,opacity:1-logDecelerate(Math.min(1,t*250/100))})),250,0),run(page,steps.map(t=>({offset:t,transform:drift(logDecelerate(t))})),234,76));
    if(dots)out.push(dots.animate([{opacity:1},{opacity:0}],{duration:250*factor,easing:'cubic-bezier(0,0,.3,1)',fill:'both'}));
    return out;
  }
  window.ICSTransitions={dropDuration,fly,curves,specs,kind,frames,length,play,scaleUp,conceal};
})();
