const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Hangouts (audit step 6): archiving and Archived Hangouts, Snooze notifications with the banner, sharing a location.
const load=(v,files)=>{const context={document:{documentElement:{lang:'hu'}}};context.window=context;for(const f of files)vm.runInNewContext(fs.readFileSync(`versions/${v}/${f}`,'utf8'),context);return context.window;};
const t=k=>k;

// 4.4.4: Hangouts 2.0.303.
{
  const W=load('4.4.4',['stock-strings.js','messaging.js','hangouts.js']),H=W.Hangouts;
  const now=Date.UTC(2014,5,20,12);
  const data={contacts:[{id:1,name:'Mom',phone:'555'},{id:2,name:'Alex',phone:'556'}],messages:[{id:1,contact:1,body:'Hi',mine:false,time:'Yesterday'},{id:2,contact:2,body:'Yo',mine:true,timestamp:now-1000}],messageDrafts:{},hgArchived:{1:now-5000}};
  const list=H.render(data,{sub:''},t,'hu',now);assert.ok(!list.includes('>Mom<')&&list.includes('Alex'),'archived threads leave the list');
  const arch=H.render(data,{sub:'archived'},t,'hu',now);assert.ok(arch.includes('Archív Hangouts-beszélgetések')&&arch.includes('Mom')&&!arch.includes('Alex'));
  assert.ok(H.render({...data,hgArchived:{}},{sub:'archived'},t,'hu',now).includes('Nincs archivált Hangouts-beszélgetés')||H.render({...data,hgArchived:{}},{sub:'archived'},t,'hu',now).includes('hg-empty'));
  // Something newer than the archiving brings the conversation back.
  assert.ok(H.render({...data,hgArchived:{2:now-5000}},{sub:''},t,'hu',now).includes('Alex'));
  const snoozed=H.render({...data,hgSnooze:now+3600000},{sub:''},t,'hu',now);assert.ok(snoozed.includes('hg-dnd-bar')&&snoozed.includes('data-action="hg-dnd-cancel"'));
  assert.ok(!H.render({...data,hgSnooze:now-1},{sub:''},t,'hu',now).includes('hg-dnd-bar'));
  const menu=H.overlay(data,{overlay:'mms-menu',sub:''},t);assert.ok(menu.includes('data-action="hg-dnd"')&&menu.includes('data-action="hg-archived"'));
  const tmenu=H.overlay(data,{overlay:'mms-menu',sub:'thread',thread:'1'},t);assert.ok(tmenu.includes('data-action="hg-unarchive"')&&!tmenu.includes('data-action="hg-archive"'));
  assert.ok(H.overlay(data,{overlay:'mms-menu',sub:'thread',thread:'2'},t).includes('data-action="hg-archive"'));
  const dnd=H.overlay(data,{overlay:'mms-hg-dnd'},t);assert.deepEqual([...dnd.matchAll(/data-id="(\d+)">([^<]+)</g)].map(m=>m[2]),['1 óra','2 óra','4 óra','8 óra','24 óra','72 óra']);
  const loc=H.render(data,{sub:'thread',thread:'1',hgLocation:true},t,'hu',now);assert.ok(loc.includes('hg-ic_map_pin')&&loc.includes('data-action="hg-share-location"')&&loc.includes('Hely megosztása'));
  assert.ok(H.locationBody(t).includes('maps.google.com/maps?q=37.422,-122.0841'));
  const sim=fs.readFileSync('versions/4.4.4/simulator.js','utf8');
  assert.ok(sim.includes("case 'hg-share-location':")&&sim.includes("case 'hg-dnd-set':")&&sim.includes("ui.sub === 'archived' ? 'archived'"));
}
console.log('hangouts-features ok');
