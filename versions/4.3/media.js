/* Offline Camera/Gallery presentation. Scenes are local illustrations, never device captures. */
(() => {
  'use strict';
  const e=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const palettes=[['#96c8d0','#e8ad7a','#364e59'],['#223850','#ce6979','#101d32'],['#67aab6','#f3d3a0','#21617a']];
  const album=photo=>photo.album || (photo.id<=4?'pictures':'camera');
  const photos=(data,key)=>data.photos.filter(p=>!key||album(p)===key);
  function settings(data) { return {flash:'auto',balance:'auto',exposure:0,zoom:1,front:false,...data.cameraSettings}; }
  function scene(data) { const s=settings(data);return {colors:palettes[s.front?1:0],zoom:s.zoom,balance:s.balance,exposure:s.exposure,front:s.front,scene:s.scene||'auto'}; }
  function image(photo) {
    const colors=(photo.colors||palettes[0]).map((c,i)=>/^#[\da-f]{6}$/i.test(c)?c:palettes[0][i%3]);
    const [sky,sun,land]=[...colors,...palettes[0]];
    const rotation=((Number(photo.rotation)||0)%360+360)%360,zoom=Math.min(4,Math.max(1,Number(photo.zoom)||1));
    const width=rotation%180?768:1024,height=rotation%180?1024:768;
    const exposure=Math.min(3,Math.max(-3,Number(photo.exposure)||0));
    const tint=photo.balance==='incandescent'?'#7899ff':photo.balance==='fluorescent'?'#d6a6ff':photo.balance==='cloudy'?'#ffbb66':photo.balance==='daylight'?'#ffe7a0':null;
    // 4.3 scene modes: night lifts the shadows, sunset and party warm the picture.
    const sceneTint={night:['#203060',.28],sunset:['#ff8040',.22],party:['#ff60a0',.14]}[photo.scene];
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${sky}"/><stop offset="1" stop-color="${sun}"/></linearGradient></defs><rect width="${width}" height="${height}" fill="${land}"/><g transform="translate(${width/2} ${height/2}) rotate(${rotation}) scale(${photo.front?-zoom:zoom} ${zoom}) translate(-512 -384)"><rect width="1024" height="768" fill="url(#sky)"/><circle cx="755" cy="200" r="65" fill="${sun}"/><path d="M0 610 260 250 565 580 780 320 1024 610V768H0Z" fill="${land}"/><path d="m170 375 90-125 105 126-98-40Z" fill="#ffffffa0"/><path d="M0 630Q260 510 510 665T1024 610V768H0Z" fill="${sky}" opacity=".7"/><path d="M0 710Q300 630 550 738T1024 700V768H0Z" fill="${land}"/></g>${tint?`<rect width="${width}" height="${height}" fill="${tint}" opacity=".22"/>`:''}${sceneTint?`<rect width="${width}" height="${height}" fill="${sceneTint[0]}" opacity="${sceneTint[1]}"/>`:''}${exposure?`<rect width="${width}" height="${height}" fill="${exposure>0?'white':'black'}" opacity="${Math.abs(exposure)*.12}"/>`:''}</svg>`;
    return 'data:image/svg+xml,'+encodeURIComponent(svg);
  }
  const art=photo=>`<img class="media-photo" src="${image(photo)}" alt="${e(photo.name||'')}">`;
  const icon=(action,label,file,id='')=>`<button data-action="${action}" data-id="${e(id)}" aria-label="${e(label)}"><img src="assets/${file}" alt=""></button>`;
  function gallery(data,ui,t) {
    const photo=data.photos.find(p=>p.id===ui.selectedPhoto),inPhoto=ui.sub==='photo',inAlbum=ui.sub==='album';
    const items=photos(data,ui.galleryAlbum),title=inPhoto?photo?.name||t('Photo unavailable'):inAlbum?t(ui.galleryAlbum==='camera'?'Camera':'Pictures'):t('Albums');
    const header=`<header class="gallery-header">${icon('back','Back','gallery.png')}<h2>${e(title)}</h2>${inPhoto?icon('gallery-share','Share','gallery-ic_menu_share_holo_light.png'):!inAlbum?icon('gallery-camera','Camera','gallery-ic_menu_camera_holo_light.png'):icon('gallery-slideshow','Slideshow','gallery-ic_menu_slideshow_holo_light.png')}${(inPhoto||inAlbum)?icon('gallery-menu','More options','ic_menu_overflow.png'):''}</header>`;
    if(inPhoto && photo)return `<div class="app-view gallery-app ${ui.gallerySlideshow?'gallery-slideshow':''}">${header}<div class="gallery-stage" data-gallery-swipe><button data-action="gallery-photo-zoom" class="gallery-image ${ui.galleryZoom?'zoomed':''}" aria-label="Zoom">${art(photo)}</button><button class="gallery-previous" data-action="gallery-step" data-id="-1" aria-label="Previous photo">‹</button><button class="gallery-next" data-action="gallery-step" data-id="1" aria-label="Next photo">›</button>${ui.gallerySlideshow?'<button class="gallery-stop" data-action="gallery-stop">Stop slideshow</button>':''}</div><div class="gallery-filmstrip">${items.map(p=>`<button class="${p.id===photo.id?'selected':''}" data-action="photo" data-id="${p.id}" aria-label="${e(p.name)}">${art(p)}</button>`).join('')}</div></div>`;
    if(inAlbum)return `<div class="app-view gallery-app">${header}<div class="gallery-scroll gallery-photo-grid">${items.map(p=>`<button data-action="photo" data-id="${p.id}" aria-label="${e(p.name)}">${art(p)}</button>`).join('')||'<p class="empty-note">No photos</p>'}</div></div>`;
    return `<div class="app-view gallery-app">${header}<div class="gallery-scroll gallery-albums">${['camera','pictures'].map(key=>{const group=photos(data,key);return group.length?`<button class="gallery-album" data-action="gallery-album" data-id="${key}">${art(group[0])}<span><img src="assets/gallery-frame_overlay_gallery_${key==='camera'?'camera':'folder'}.png" alt="">${e(t(key==='camera'?'Camera':'Pictures'))}<small>${group.length}</small></span></button>`:'';}).join('')||'<p class="empty-note">No photos</p>'}</div></div>`;
  }
  function camera(data,ui,t) {
    const s=settings(data),last=photos(data,'camera')[0];
    return `<div class="app-view camera-app"><div class="camera-preview"><button class="camera-focus-area" data-action="camera-focus" aria-label="Focus">${art(scene(data))}<span class="camera-focus-ring"></span></button><span class="camera-facing">${e(t(s.front?'Front camera':'Back camera'))}</span><div class="camera-indicators">${icon('camera-options','Camera settings','camera-ic_settings_holo_light.png')}${icon('camera-flash','Flash','camera-ic_flash_'+s.flash+'_holo_light.png')}${icon('camera-balance','White balance','camera-ic_white_balance_auto_holo_light.png')}${icon('camera-flip','Switch camera','camera-ic_rotate_camera_holo_dark.png')}</div><label class="camera-zoom"><img src="assets/camera-ic_zoom_in_holo_light.png" alt=""><input type="range" min="1" max="4" step=".1" value="${s.zoom}" aria-label="Zoom"><output>${Number(s.zoom).toFixed(1)}×</output></label></div><div class="camera-bottom"><span class="camera-photo-mode"><img src="assets/camera-ic_switch_camera_holo_light.png" alt="${e(t('Camera'))}"></span><button class="camera-shutter" data-action="shoot" aria-label="Take photo"></button><button class="camera-thumbnail" data-action="camera-review" aria-label="Gallery">${last?art(last):'<img src="assets/gallery.png" alt="">'}</button></div></div>`;
  }
  function overlay(data,ui,t,locale) {
    const p=data.photos.find(p=>p.id===ui.selectedPhoto),s=settings(data);
    const menu=body=>`<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu media-menu">${body}</div>`;
    const item=(action,label,id='')=>`<button data-action="${action}" data-id="${e(id)}">${e(t(label))}</button>`;
    if(ui.overlay==='gallery-menu')return menu(ui.sub==='photo'?item('gallery-slideshow','Slideshow')+item('gallery-rotate','Rotate left','-90')+item('gallery-rotate','Rotate right','90')+item('gallery-details','Details')+item('photo-wallpaper','Set wallpaper',p?.id)+item('photo-delete','Delete',p?.id):item('gallery-slideshow','Slideshow'));
    if(ui.overlay==='gallery-share')return menu(item('gallery-share-message','Messaging'));
    if(ui.overlay==='camera-options')return menu(`<div class="camera-setting-title">${e(t('Exposure'))}</div>${[-2,-1,0,1,2].map(value=>`<button data-action="camera-exposure" data-id="${value}" aria-pressed="${s.exposure===value}">${value>0?'+':''}${value} ${s.exposure===value?'✓':''}</button>`).join('')}`);
    if(ui.overlay==='camera-balance')return menu([['auto','Auto'],['daylight','Daylight'],['cloudy','Cloudy'],['incandescent','Incandescent']].map(([value,label])=>`<button data-action="camera-set-balance" data-id="${value}" aria-pressed="${s.balance===value}">${e(t(label))} ${s.balance===value?'✓':''}</button>`).join(''));
    if(ui.overlay==='gallery-delete')return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="Delete photo?"><h3>Delete photo?</h3><p>${e(p?.name)}</p><div class="settings-dialog-actions">${item('close-overlay','Cancel')}${item('gallery-confirm-delete','Delete')}</div></div>`;
    if(ui.overlay==='gallery-details')return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog media-details" role="dialog" aria-label="Details"><h3>Details</h3><dl><dt>Name</dt><dd>${e(p?.name)}</dd><dt>Album</dt><dd>${e(t(album(p||{})==='camera'?'Camera':'Pictures'))}</dd><dt>Dimensions</dt><dd>${(p?.rotation||0)%180?'768 × 1024':'1024 × 768'}</dd><dt>Rotation</dt><dd>${p?.rotation||0}°</dd>${p?.created?`<dt>Date</dt><dd>${e(new Date(p.created).toLocaleString(locale))}</dd>`:''}</dl><div class="settings-dialog-actions">${item('close-overlay','OK')}</div></div>`;
    return '';
  }
  window.ICSMedia={image,art,album,photos,settings,scene,gallery,camera,overlay};
})();
