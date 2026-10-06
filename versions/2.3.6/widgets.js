/* Gingerbread keeps only the picture lists the home screen's photo plumbing reads; the Picture frame itself is
   GBWidgets.pictureFrame and the music widget GBLauncher.music. */
(() => {
  'use strict';
  function seeded(text) {
    let seed=[...String(text)].reduce((hash,char)=>Math.imul(hash^char.charCodeAt(0),16777619),2166136261)>>>0;
    return ()=>{seed=seed+0x6d2b79f5>>>0;let value=seed;value=Math.imul(value^value>>>15,value|1);value^=value+Math.imul(value^value>>>7,value|61);return((value^value>>>14)>>>0)/4294967296;};
  }
  function photoItems(data,widget) {
    const photos=Array.isArray(data.photos)?data.photos:[];
    if(!('source' in widget))return photos.slice(0,1);
    if(widget.source==='photo')return photos.filter(photo=>photo.id===widget.photo);
    if(widget.source==='album')return window.ICSMedia.photos(data,widget.album);
    if(widget.source==='shuffle') {
      const random=seeded(widget.id),items=[...photos];
      for(let i=items.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[items[i],items[j]]=[items[j],items[i]];}
      return items;
    }
    return [];
  }
  const wrap=(index,length)=>length?(index%length+length)%length:0;
  window.ICSWidgets={photoItems,wrap};
})();
