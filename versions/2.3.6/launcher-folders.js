/* Launcher2 (2.3.6) UserFolder operations, independent of pointer events and DOM rendering. Gingerbread folders are
   created from Add > Folders > New folder, keep their place even when empty, and never form by dropping one icon on
   another. Live folders (Contacts) list their contents from the provider instead of holding items. */
(() => {
  'use strict';
  const capacity=16;
  const folder=(data,id)=>Object.hasOwn(data.folders||{},id)?data.folders[id]:null;
  const list=(data,location)=>location.type==='home'?data.homePages[location.page]:location.type==='dock'?data.dock:location.type==='folder'?folder(data,location.folderId)?.items:null;
  const item=(data,location)=>location.type==='drawer'?location.id:list(data,location)?.[location.slot];
  // Gingerbread folders never collapse into their last item.
  function collapse() {}
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
      if(value.live&&!['all','starred','phone'].includes(value.live))delete value.live;
    }
  }
  function drop(data,source,target,stamp=Date.now()) {
    const id=item(data,source),entries=list(data,target);
    if(!id||id==='apps'||!entries||target.type==='dock'&&target.slot===2)return {ok:false,error:'This space is occupied'};
    if(source.type===target.type&&source.page===target.page&&source.folderId===target.folderId&&source.slot===target.slot)return {ok:true};
    if(target.type==='folder') {
      if(folder(data,id))return {ok:false,error:'Folders cannot contain folders'};
      if(folder(data,target.folderId)?.live)return {ok:false,error:''};
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
  // Launcher.addFolder / addLiveFolder: the folder goes to the given (vacant) workspace cell.
  function create(data,page,slot,options={},stamp=Date.now()) {
    if(data.homePages[page]?.[slot]!==null)return '';
    data.folders=data.folders||{};
    let id=`folder-${stamp}`,suffix=1;while(folder(data,id))id=`folder-${stamp}-${suffix++}`;
    data.folders[id]={name:options.name||'',items:[],...(options.live?{live:options.live}:{})};
    data.homePages[page][slot]=id;
    return id;
  }
  window.ICSLauncherFolders={capacity,folder,item,initialize,drop,remove,dimensions,create};
})();
