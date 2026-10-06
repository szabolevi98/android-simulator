/* The simulator's own photo illustrations for the Nexus S Gallery and Camera (gb-gallery.js, gb-camera.js draw the apps):
   the scenes, their pictures, the albums, and the Share menu the Gallery opens. Never device captures. */
(() => {
  'use strict';
  const e=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const palettes=[['#96c8d0','#e8ad7a','#364e59'],['#223850','#ce6979','#101d32'],['#67aab6','#f3d3a0','#21617a']];
  const album=photo=>photo.album || (photo.id<=4?'pictures':'camera');
  const photos=(data,key)=>data.photos.filter(p=>!key||album(p)===key);
  function settings(data) { return {flash:'auto',balance:'auto',exposure:0,zoom:1,front:false,...data.cameraSettings}; }
  function scene(data) { const s=settings(data);return {colors:palettes[s.front?1:0],zoom:s.zoom,balance:s.balance,exposure:s.exposure,front:s.front}; }
  function image(photo) {
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
  function overlay(data,ui,t,locale) {
    const p=data.photos.find(p=>p.id===ui.selectedPhoto),s=settings(data);
    const menu=body=>`<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu media-menu">${body}</div>`;
    const item=(action,label,id='')=>`<button data-action="${action}" data-id="${e(id)}">${e(t(label))}</button>`;
    if(ui.overlay==='gallery-share')return menu(item('gallery-share-message','Messaging'));
    return '';
  }
  window.ICSMedia={image,art,album,photos,settings,scene,overlay};
})();
