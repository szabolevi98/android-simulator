const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Stock Nexus 5: Hangouts 2.0 presents the shared SMS data (conversation list, New Hangout, conversation, menus).
const context={window:{}};context.window.window=context.window;
for(const f of ['messaging.js','hangouts.js'])vm.runInNewContext(fs.readFileSync(`versions/4.4.4/${f}`,'utf8'),context.window);
const {Hangouts,ICSMessaging}=context.window;context.ICSMessaging=ICSMessaging;
const data={contacts:[{id:1,name:'Alex Morgan',phone:'202-555-0148'},{id:4,name:'Mom',phone:'202-555-0107'}],messages:[{id:1,contact:1,body:'Hey!',mine:false,time:'10:42'},{id:2,contact:1,body:'See you at 11!',mine:true,time:'10:45'}],messageDrafts:{},photos:[]};
const t=k=>k;
const list=Hangouts.render(data,{sub:''},t,'en');
assert.ok(list.includes('hg-thread')&&list.includes('<i>SMS</i>')&&list.includes('You: See you at 11!')&&list.includes('data-action="new-message"'));
const picker=Hangouts.render(data,{sub:'new'},t,'en');
assert.ok(picker.includes('Type a name, email, number, or circle')&&(picker.match(/data-action="hg-pick"/g)||[]).length===2);
const thread=Hangouts.render(data,{sub:'thread',thread:1},t,'en');
assert.ok(thread.includes('data-form="mms-send"')&&thread.includes('Send an SMS message')&&thread.includes('hg-message sent')&&thread.includes('data-action="hg-location"'));
assert.ok(Hangouts.overlay(data,{overlay:'mms-menu',sub:''},t).includes('Archived Hangouts'));
assert.ok(Hangouts.overlay(data,{overlay:'mms-attach',sub:'thread'},t).includes('Google+ albums'));
assert.equal(Hangouts.overlay(data,{overlay:'mms-details',sub:'thread'},t),null);
const sim=fs.readFileSync('versions/4.4.4/simulator.js','utf8');
// Hangouts is its own app; AOSP Messaging stays in the drawer. Notifications and shares open Hangouts.
assert.ok(sim.includes("case 'hangouts': return Hangouts.render(")&&!sim.includes("case 'messaging':")&&!sim.includes("['messaging', 'Messaging'")&&sim.includes("openApp('hangouts')"));
assert.ok(!/GEL_ALIASES = \{[^}]*hangouts/.test(sim));
assert.ok(fs.existsSync('versions/4.4.4/assets/stat_notify_hangouts.png'));
console.log('kk-hangouts ok');
