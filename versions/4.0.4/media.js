/* Offline Camera/Gallery presentation. Scenes are local illustrations, never device captures. */
(() => {
  'use strict';
  const e=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const palettes=[['#96c8d0','#e8ad7a','#364e59'],['#223850','#ce6979','#101d32'],['#67aab6','#f3d3a0','#21617a']];
  const album=photo=>photo.album || (photo.id<=4?'pictures':'camera');
  const photos=(data,key)=>data.photos.filter(p=>!key||album(p)===key);
  function settings(data) { return {flash:'auto',balance:'auto',exposure:0,zoom:1,front:false,...data.cameraSettings}; }
  function scene(data) { const s=settings(data);return {colors:palettes[s.front?1:0],zoom:s.zoom,balance:s.balance,exposure:s.exposure,front:s.front}; }
  // A cropped copy (CropImage's saved picture) keeps its source and the crop as fractions of the source's picture;
  // it draws the source inside its own frame, so later rotations turn the cropped picture.
  function size(photo) {
    const rotation=((Number(photo.rotation)||0)%360+360)%360;
    let width=1024,height=768;
    if(photo.source&&photo.crop){const [w,h]=size(photo.source);width=Math.max(1,Math.round(w*photo.crop.w));height=Math.max(1,Math.round(h*photo.crop.h));}
    return rotation%180?[height,width]:[width,height];
  }
  function image(photo) {
    if(photo.source&&photo.crop){
      const [sw,sh]=size(photo.source),c=photo.crop,rotation=((Number(photo.rotation)||0)%360+360)%360;
      const cw=Math.max(1,Math.round(sw*c.w)),ch=Math.max(1,Math.round(sh*c.h)),[width,height]=size(photo);
      return 'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><g transform="translate(${width/2} ${height/2}) rotate(${rotation}) translate(${-cw/2} ${-ch/2})"><svg width="${cw}" height="${ch}" viewBox="${(sw*c.x).toFixed(2)} ${(sh*c.y).toFixed(2)} ${(sw*c.w).toFixed(2)} ${(sh*c.h).toFixed(2)}" preserveAspectRatio="none"><image href="${image(photo.source)}" width="${sw}" height="${sh}"/></svg></g></svg>`);
    }
    const colors=(photo.colors||palettes[0]).map((c,i)=>/^#[\da-f]{6}$/i.test(c)?c:palettes[0][i%3]);
    const [sky,sun,land]=[...colors,...palettes[0]];
    const rotation=((Number(photo.rotation)||0)%360+360)%360,zoom=Math.min(4,Math.max(1,Number(photo.zoom)||1));
    const width=rotation%180?768:1024,height=rotation%180?1024:768;
    const exposure=Math.min(2,Math.max(-2,Number(photo.exposure)||0));
    const tint=photo.balance==='incandescent'?'#7899ff':photo.balance==='cloudy'?'#ffbb66':photo.balance==='daylight'?'#ffe7a0':null;
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${sky}"/><stop offset="1" stop-color="${sun}"/></linearGradient></defs><rect width="${width}" height="${height}" fill="${land}"/><g transform="translate(${width/2} ${height/2}) rotate(${rotation}) scale(${photo.front?-zoom:zoom} ${zoom}) translate(-512 -384)"><rect width="1024" height="768" fill="url(#sky)"/><circle cx="755" cy="200" r="65" fill="${sun}"/><path d="M0 610 260 250 565 580 780 320 1024 610V768H0Z" fill="${land}"/><path d="m170 375 90-125 105 126-98-40Z" fill="#ffffffa0"/><path d="M0 630Q260 510 510 665T1024 610V768H0Z" fill="${sky}" opacity=".7"/><path d="M0 710Q300 630 550 738T1024 700V768H0Z" fill="${land}"/></g>${tint?`<rect width="${width}" height="${height}" fill="${tint}" opacity=".22"/>`:''}${exposure?`<rect width="${width}" height="${height}" fill="${exposure>0?'white':'black'}" opacity="${Math.abs(exposure)*.14}"/>`:''}</svg>`;
    return 'data:image/svg+xml,'+encodeURIComponent(svg);
  }
  const art=photo=>`<img class="media-photo" src="${image(photo)}" alt="${e(photo.name||'')}">`;
  const icon=(action,label,file,id='')=>`<button data-action="${action}" data-id="${e(id)}" aria-label="${e(label)}"><img src="assets/${file}" alt=""></button>`;
  // Gallery2's own strings (stock-strings.js, group gallery): crop_action, crop_label, menu/crop.xml's cancel and
  // crop_save_text, saving_image.
  const G=(key,lang)=>{const row=window.StockStrings?.gallery?.[key],i=['hu','de','fr','es'].indexOf(lang);return row?(i>=0?row[i]:row[4]||key):key;};
  // CropImage (com.android.gallery3d.app): the overlay action bar titled crop_label with menu/crop.xml's Cancel and Crop
  // (ifRoom|withText), and the CropView: the picture fitted to the view, HighlightRectangle's selection (setInitRectangle:
  // 0.3 either side of the centre on both axes when no aspect is asked for) outlined 3 px #008aff over a #a0000000
  // shade, with camera_crop_holo on the edges' midpoints (all four at rest, only the dragged edges while resizing, none
  // while the box moves).
  const CROP={hit:30/2*.85,min:16/2*.85};
  const cropDefault=()=>({x:.2,y:.2,w:.6,h:.6});
  function crop(data,ui,t,lang) {
    const photo=data.photos.find(p=>p.id===ui.selectedPhoto),c=ui.galleryCrop,[w,h]=size(photo),pct=n=>`${(n*100).toFixed(3)}%`;
    return `<div class="app-view gallery-app gallery-crop"><header class="gallery-header">${icon('gallery-crop-cancel','Navigate up','gallery.png')}<h2>${e(G('Crop picture',lang))}</h2><button class="gallery-pick-cancel" data-action="gallery-crop-cancel">${e(G('Cancel',lang))}</button><button class="gallery-pick-cancel" data-action="gallery-crop-save">${e(G('Crop save',lang))}</button></header><div class="gallery-crop-stage"><div class="gallery-crop-frame" data-crop-frame style="--ar:${(w/h).toFixed(5)}"><img src="${image(photo)}" alt="${e(photo.name||'')}"><div class="gallery-crop-hl" data-crop-hl style="left:${pct(c.x)};top:${pct(c.y)};width:${pct(c.w)};height:${pct(c.h)}"><i class="l"></i><i class="r"></i><i class="t"></i><i class="b"></i></div></div></div></div>`;
  }
  // HighlightRectangle.setMovingEdges / moveEdges: within 30 px of an edge drags that edge (the nearer one when both
  // sides are close), inside drags the box; edges keep 16 px apart and everything stays on the picture.
  function cropDrag(event,frame,c,done) {
    const box=frame.getBoundingClientRect(),hl=frame.querySelector('[data-crop-hl]');
    if(!box.width||!hl)return false;
    const W=box.width,H=box.height,x=event.clientX-box.left,y=event.clientY-box.top,tol=CROP.hit;
    const r={l:c.x*W,t:c.y*H,r:(c.x+c.w)*W,b:(c.y+c.h)*H};
    if(!(r.l-tol<=x&&x<=r.r+tol&&r.t-tol<=y&&y<=r.b+tol))return false;
    const edge={l:Math.abs(x-r.l)<=tol,r:Math.abs(x-r.r)<=tol,t:Math.abs(y-r.t)<=tol,b:Math.abs(y-r.b)<=tol};
    if(edge.l&&edge.r){if(Math.abs(x-r.l)<Math.abs(x-r.r))edge.r=false;else edge.l=false;}
    if(edge.t&&edge.b){if(Math.abs(y-r.t)<Math.abs(y-r.b))edge.b=false;else edge.t=false;}
    const edges=Object.keys(edge).filter(k=>edge[k]),inside=x>=r.l&&x<=r.r&&y>=r.t&&y<=r.b;
    if(!edges.length&&!inside)return false;
    const start={...r},clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v)),min=CROP.min;
    hl.classList.add(edges.length?'resizing':'moving',...edges);
    const onMove=ev=>{
      const dx=ev.clientX-event.clientX,dy=ev.clientY-event.clientY,n={...start};
      if(!edges.length){const mx=clamp(dx,-start.l,W-start.r),my=clamp(dy,-start.t,H-start.b);n.l+=mx;n.r+=mx;n.t+=my;n.b+=my;}
      else{if(edge.l)n.l=clamp(start.l+dx,0,start.r-min);if(edge.r)n.r=clamp(start.r+dx,start.l+min,W);if(edge.t)n.t=clamp(start.t+dy,0,start.b-min);if(edge.b)n.b=clamp(start.b+dy,start.t+min,H);}
      c.x=n.l/W;c.y=n.t/H;c.w=(n.r-n.l)/W;c.h=(n.b-n.t)/H;
      Object.assign(hl.style,{left:`${c.x*100}%`,top:`${c.y*100}%`,width:`${c.w*100}%`,height:`${c.h*100}%`});
    };
    const onUp=()=>{window.removeEventListener('pointermove',onMove);window.removeEventListener('pointerup',onUp);window.removeEventListener('pointercancel',onUp);hl.className='gallery-crop-hl';done();};
    window.addEventListener('pointermove',onMove);window.addEventListener('pointerup',onUp);window.addEventListener('pointercancel',onUp);
    return true;
  }
  function gallery(data,ui,t,lang) {
    if(ui.sub==='photo'&&ui.galleryCrop&&data.photos.some(p=>p.id===ui.selectedPhoto))return crop(data,ui,t,lang);
    const photo=data.photos.find(p=>p.id===ui.selectedPhoto),inPhoto=ui.sub==='photo',inAlbum=ui.sub==='album';
    const items=photos(data,ui.galleryAlbum),title=inPhoto?photo?.name||t('Photo unavailable'):inAlbum?t(ui.galleryAlbum==='camera'?'Camera':'Pictures'):t('Albums');
    // GET_CONTENT (Email's Attach file): AlbumSetPage titles the picker select_image and shows menu/pickup.xml's Cancel.
    if(ui.galleryPick&&!inPhoto)return `<div class="app-view gallery-app">${`<header class="gallery-header">${icon('back','Back','gallery.png')}<h2>${e(inAlbum?title:t('Select photo'))}</h2><button class="gallery-pick-cancel" data-action="gallery-pick-cancel">${e(t('Cancel'))}</button></header>`}<div class="gallery-scroll ${inAlbum?'gallery-photo-grid':'gallery-albums'}">${inAlbum?items.map(p=>`<button data-action="gallery-pick" data-id="${p.id}" aria-label="${e(p.name)}">${art(p)}</button>`).join(''):['camera','pictures'].map(key=>{const group=photos(data,key);return group.length?`<button class="gallery-album" data-action="gallery-album" data-id="${key}">${art(group[0])}<span><img src="assets/gallery-frame_overlay_gallery_${key==='camera'?'camera':'folder'}.png" alt="">${e(t(key==='camera'?'Camera':'Pictures'))}<small>${group.length}</small></span></button>`:'';}).join('')}</div></div>`;
    const header=`<header class="gallery-header">${icon('back','Back','gallery.png')}<h2>${e(title)}</h2>${inPhoto?icon('gallery-share','Share','gallery-ic_menu_share_holo_light.png'):!inAlbum?icon('gallery-camera','Camera','gallery-ic_menu_camera_holo_light.png'):icon('gallery-slideshow','Slideshow','gallery-ic_menu_slideshow_holo_light.png')}${(inPhoto||inAlbum)?icon('gallery-menu','More options','ic_menu_overflow.png'):''}</header>`;
    if(inPhoto && photo)return `<div class="app-view gallery-app ${ui.gallerySlideshow?'gallery-slideshow':''}">${header}<div class="gallery-stage" data-gallery-swipe><button data-action="gallery-photo-zoom" class="gallery-image ${ui.galleryZoom?'zoomed':''}" aria-label="Zoom">${art(photo)}</button><button class="gallery-previous" data-action="gallery-step" data-id="-1" aria-label="Previous photo">‹</button><button class="gallery-next" data-action="gallery-step" data-id="1" aria-label="Next photo">›</button>${ui.gallerySlideshow?'<button class="gallery-stop" data-action="gallery-stop">Stop slideshow</button>':''}</div><div class="gallery-filmstrip">${items.map(p=>`<button class="${p.id===photo.id?'selected':''}" data-action="photo" data-id="${p.id}" aria-label="${e(p.name)}">${art(p)}</button>`).join('')}</div></div>`;
    if(inAlbum)return `<div class="app-view gallery-app">${header}<div class="gallery-scroll gallery-photo-grid">${items.map(p=>`<button data-action="photo" data-id="${p.id}" aria-label="${e(p.name)}">${art(p)}</button>`).join('')||'<p class="empty-note">No photos</p>'}</div></div>`;
    return `<div class="app-view gallery-app">${header}<div class="gallery-scroll gallery-albums">${['camera','pictures'].map(key=>{const group=photos(data,key);return group.length?`<button class="gallery-album" data-action="gallery-album" data-id="${key}">${art(group[0])}<span><img src="assets/gallery-frame_overlay_gallery_${key==='camera'?'camera':'folder'}.png" alt="">${e(t(key==='camera'?'Camera':'Pictures'))}<small>${group.length}</small></span></button>`:'';}).join('')||'<p class="empty-note">No photos</p>'}</div></div>`;
  }
  function camera(data,ui,t) {
    const s=settings(data),last=photos(data,'camera')[0];
    return `<div class="app-view camera-app"><div class="camera-preview"><button class="camera-focus-area" data-action="camera-focus" aria-label="Focus">${art(scene(data))}<span class="camera-focus-ring"></span></button><span class="camera-facing">${e(t(s.front?'Front camera':'Back camera'))}</span><div class="camera-indicators">${icon('camera-options','Camera settings','camera-ic_settings_holo_light.png')}${icon('camera-flash','Flash','camera-ic_flash_'+s.flash+'_holo_light.png')}${icon('camera-balance','White balance','camera-ic_white_balance_auto_holo_light.png')}${icon('camera-flip','Switch camera','camera-ic_rotate_camera_holo_dark.png')}</div><label class="camera-zoom"><img src="assets/camera-ic_zoom_in_holo_light.png" alt=""><input type="range" min="1" max="4" step=".1" value="${s.zoom}" aria-label="Zoom"><output>${Number(s.zoom).toFixed(1)}×</output></label></div><div class="camera-bottom"><span class="camera-photo-mode"><img src="assets/camera-ic_switch_camera_holo_light.png" alt="${e(t('Camera'))}"></span><button class="camera-shutter" data-action="shoot" aria-label="Take photo"></button><button class="camera-thumbnail" data-action="camera-review" aria-label="Gallery">${last?art(last):'<img src="assets/gallery.png" alt="">'}</button></div></div>`;
  }
  function overlay(data,ui,t,locale,lang) {
    const p=data.photos.find(p=>p.id===ui.selectedPhoto),s=settings(data);
    const menu=body=>`<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu media-menu">${body}</div>`;
    const item=(action,label,id='')=>`<button data-action="${action}" data-id="${e(id)}">${e(t(label))}</button>`;
    if(ui.overlay==='gallery-menu')return menu(ui.sub==='photo'?item('gallery-slideshow','Slideshow')+item('gallery-rotate','Rotate left','-90')+item('gallery-rotate','Rotate right','90')+(p&&!p.video?`<button data-action="gallery-crop" data-id="${p.id}">${e(G('Crop',lang))}</button>`:'')+item('gallery-details','Details')+item('photo-wallpaper','Set wallpaper',p?.id)+item('photo-delete','Delete',p?.id):item('gallery-slideshow','Slideshow'));
    if(ui.overlay==='gallery-crop-saving')return `<div class="ga-scrim"></div><div class="ga-dialog ga-alert" role="alertdialog" aria-label="${e(G('Saving picture…',lang))}"><div class="ga-progress"><span class="ga-spinner" aria-hidden="true"><img src="assets/ga-spinner_48_outer_holo.png" alt=""><img src="assets/ga-spinner_48_inner_holo.png" alt=""></span><span>${e(G('Saving picture…',lang))}</span></div></div>`;
    if(ui.overlay==='gallery-share')return menu(item('gallery-share-message','Messaging'));
    if(ui.overlay==='camera-options')return menu(`<div class="camera-setting-title">${e(t('Exposure'))}</div>${[-2,-1,0,1,2].map(value=>`<button data-action="camera-exposure" data-id="${value}" aria-pressed="${s.exposure===value}">${value>0?'+':''}${value} ${s.exposure===value?'✓':''}</button>`).join('')}`);
    if(ui.overlay==='camera-balance')return menu([['auto','Auto'],['daylight','Daylight'],['cloudy','Cloudy'],['incandescent','Incandescent']].map(([value,label])=>`<button data-action="camera-set-balance" data-id="${value}" aria-pressed="${s.balance===value}">${e(t(label))} ${s.balance===value?'✓':''}</button>`).join(''));
    if(ui.overlay==='gallery-delete')return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="Delete photo?"><h3>Delete photo?</h3><p>${e(p?.name)}</p><div class="settings-dialog-actions">${item('close-overlay','Cancel')}${item('gallery-confirm-delete','Delete')}</div></div>`;
    if(ui.overlay==='gallery-details')return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog media-details" role="dialog" aria-label="Details"><h3>Details</h3><dl><dt>Name</dt><dd>${e(p?.name)}</dd><dt>Album</dt><dd>${e(t(album(p||{})==='camera'?'Camera':'Pictures'))}</dd><dt>Dimensions</dt><dd>${p?size(p).join(' × '):''}</dd><dt>Rotation</dt><dd>${p?.rotation||0}°</dd>${p?.created?`<dt>Date</dt><dd>${e(new Date(p.created).toLocaleString(locale))}</dd>`:''}</dl><div class="settings-dialog-actions">${item('close-overlay','OK')}</div></div>`;
    return '';
  }
  window.ICSMedia={size,image,art,album,photos,settings,scene,gallery,camera,overlay,cropDefault,cropDrag};
})();
