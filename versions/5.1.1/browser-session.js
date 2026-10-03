/* Independent, persisted navigation stacks for the offline browser tabs. */
(() => {
  'use strict';
  const home='www.google.com';
  function restore(saved,legacy=[]) {
    const tabs=(Array.isArray(saved?.tabs)?saved.tabs:[]).slice(0,12).filter(t=>Array.isArray(t.history)&&t.history.length).map(t=>({history:t.history.filter(u=>typeof u==='string').slice(-50),index:t.index})).filter(t=>t.history.length);
    if(!tabs.length) tabs.push({history:legacy.length?legacy.filter(u=>typeof u==='string').slice(-50):[home],index:legacy.length-1});
    tabs.forEach(t=>{if(!t.history.length)t.history=[home];t.index=Math.max(0,Math.min(Number.isInteger(t.index)?t.index:t.history.length-1,t.history.length-1));});
    return {tabs,active:Math.max(0,Math.min(Number.isInteger(saved?.active)?saved.active:0,tabs.length-1))};
  }
  const current=s=>s.tabs[s.active];
  const url=s=>current(s).history[current(s).index];
  function navigate(s,value){const t=current(s);t.history=t.history.slice(0,t.index+1);t.history.push(value);t.history=t.history.slice(-50);t.index=t.history.length-1;}
  function move(s,delta){const t=current(s);t.index=Math.max(0,Math.min(t.history.length-1,t.index+delta));}
  function add(s){if(s.tabs.length>=12)return false;s.tabs.push({history:[home],index:0});s.active=s.tabs.length-1;return true;}
  function close(s,index){if(!Number.isInteger(index)||!s.tabs[index])return;s.tabs.splice(index,1);if(!s.tabs.length)s.tabs.push({history:[home],index:0});if(index<s.active)s.active--;s.active=Math.min(s.active,s.tabs.length-1);}
  window.ICSBrowserSession={restore,current,url,navigate,move,add,close};
})();
