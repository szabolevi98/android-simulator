/* Launcher2 folder operations of the JWR66Y (Nexus 4) image, independent of pointer events and DOM rendering:
   folder_max_num_items 16 (4 x 4), the same in the 4.0.4 and 4.3 images. */
(() => {
  'use strict';
  const capacity=16;
  const folder=(data,id)=>Object.hasOwn(data.folders||{},id)?data.folders[id]:null;
  const list=(data,location)=>location.type==='home'?data.homePages[location.page]:location.type==='dock'?data.dock:location.type==='folder'?folder(data,location.folderId)?.items:null;
  const item=(data,location)=>location.type==='drawer'?location.id:list(data,location)?.[location.slot];
  function collapse(data,id) {
    const current=folder(data,id);if(!current||current.items.length>1)return;
    for(const entries of [...data.homePages,data.dock])for(let i=0;i<entries.length;i++)if(entries[i]===id)entries[i]=current.items[0]||null;
    delete data.folders[id];
  }
  function clearSource(data,source) {
    const entries=list(data,source);if(!entries)return;
    if(source.type==='folder')entries.splice(source.slot,1);else entries[source.slot]=null;
  }
  function remove(data,source) {
    const id=item(data,source);if(!id||id==='apps')return false;
    clearSource(data,source);
    if(source.type==='folder')collapse(data,source.folderId);
    if(folder(data,id)&&![...data.homePages.flat(),...data.dock].includes(id))delete data.folders[id];
    return true;
  }
  function initialize(data,validApps) {
    data.folders=data.folders&&typeof data.folders==='object'&&!Array.isArray(data.folders)?data.folders:{};
    if([...data.homePages.flat(),...data.dock].includes('google')) {
      data.folders['folder-google']||={name:'Google',items:['play-store','browser','email','calendar','gallery']};
      for(const entries of [...data.homePages,data.dock])for(let i=0;i<entries.length;i++)if(entries[i]==='google')entries[i]='folder-google';
    }
    for(const [id,value] of Object.entries(data.folders)) {
      if(!value||typeof value!=='object'){delete data.folders[id];continue;}
      value.name=String(value.name||'').slice(0,40);
      value.items=(Array.isArray(value.items)?value.items:[]).filter(app=>validApps.includes(app)).slice(0,capacity);
      collapse(data,id);
    }
  }
  function drop(data,source,target,stamp=Date.now()) {
    const id=item(data,source),entries=list(data,target);
    if(!id||id==='apps'||!entries||target.type==='dock'&&target.slot===2)return {ok:false,error:'This space is occupied'};
    if(source.type===target.type&&source.page===target.page&&source.folderId===target.folderId&&source.slot===target.slot)return {ok:true};
    if(target.type==='folder') {
      if(folder(data,id))return {ok:false,error:'Folders cannot contain folders'};
      if(source.type==='folder'&&source.folderId===target.folderId) {
        entries.splice(source.slot,1);entries.splice(Math.min(target.slot,entries.length),0,id);return {ok:true};
      }
      if(entries.length>=capacity)return {ok:false,error:'Folder is full'};
      clearSource(data,source);entries.splice(Math.min(target.slot,entries.length),0,id);
      if(source.type==='folder')collapse(data,source.folderId);
      return {ok:true};
    }
    const previous=entries[target.slot],destinationFolder=folder(data,previous);
    if(destinationFolder) {
      if(source.type==='folder'&&source.folderId===previous)return {ok:true};
      return drop(data,source,{type:'folder',folderId:previous,slot:destinationFolder.items.length},stamp);
    }
    if(previous&&folder(data,id)) {
      const origin=list(data,source);if(!origin||source.type==='folder')return {ok:false,error:'This space is occupied'};
      origin[source.slot]=previous;entries[target.slot]=id;return {ok:true};
    }
    clearSource(data,source);
    let created='';
    if(previous) {
      created=`folder-${stamp}`;let suffix=1;while(folder(data,created))created=`folder-${stamp}-${suffix++}`;
      data.folders[created]={name:'',items:[previous,id]};entries[target.slot]=created;
    } else entries[target.slot]=id;
    if(source.type==='folder')collapse(data,source.folderId);
    return {ok:true,created};
  }
  function dimensions(count) {
    let columns=0,rows=0;
    while(columns*rows<count){if(columns<=rows&&columns<4)columns++;else rows++;if(!rows)rows=1;}
    return {columns:Math.max(1,columns),rows:Math.max(1,rows)};
  }
  window.ICSLauncherFolders={capacity,folder,item,initialize,drop,remove,dimensions};
})();
