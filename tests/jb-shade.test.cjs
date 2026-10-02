const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};vm.runInNewContext(fs.readFileSync('versions/4.3/jb-shade.js','utf8'),context);
const shade=context.window.JBShade,t=key=>key,plain=value=>JSON.parse(JSON.stringify(value));
// PhoneStatusBar clear-all timing: 140 ms gaps shrinking by 10 ms, never below 50 ms.
assert.deepEqual(plain(shade.clearDelays(4)),[0,130,250,360]);
assert.equal(shade.clearDelays(20).at(-1)-shade.clearDelays(20).at(-2),50);
assert.equal(shade.FLIP_OUT+shade.FLIP_IN,350);
// Phone quick settings order and states.
const base={wifi:true,wifiNetwork:'AndroidAP',bluetooth:false,airplane:false,dataEnabled:true,gps:false};
let tiles=shade.tiles(base,{carrier:'Telekom'});
assert.deepEqual(plain(tiles.map(tile=>tile.id)),['user','brightness','settings','wifi','rssi','battery','airplane','bluetooth']);
// mako: config_hspa_data_distinguishable shows H rather than 3G.
assert.equal(tiles[3].label,'AndroidAP');assert.equal(tiles[3].icon,'ic_qs_wifi_full_4');assert.equal(tiles[4].overlay,'ic_qs_signal_full_h');
tiles=shade.tiles({...base,airplane:true,wifi:false,bluetooth:true,pairedDevice:'Headset',gps:true},{carrier:'Telekom',alarm:'Fri 7:00 AM'});
assert.equal(tiles.find(tile=>tile.id==='wifi').label,'Wi-Fi Off');assert.equal(tiles.find(tile=>tile.id==='rssi').icon,'ic_qs_signal_no_signal');
assert.equal(tiles.find(tile=>tile.id==='airplane').pressed,true);assert.equal(tiles.find(tile=>tile.id==='bluetooth').label,'Headset');
assert.deepEqual(plain(tiles.slice(-2).map(tile=>tile.id)),['alarm','location']);
// Top notification with expanded content starts expanded; user gestures override it.
const notes=[{id:1,title:'A',detail:'a',big:'long'},{id:2,title:'B',detail:'b',big:'long'}];
assert.equal(shade.isExpanded(notes[0],0,{}),true);assert.equal(shade.isExpanded(notes[1],1,{}),false);
assert.equal(shade.isExpanded(notes[0],0,{noteExpanded:{1:false}}),false);
const html=shade.render({notifications:[{id:3,title:'<b>x</b>',detail:'<i>',actions:[{id:'snooze',label:'Snooze',icon:'a.png'}]}],settings:base},{},t,{locale:'en-US',clock:'7:00',date:'Thursday',carrier:'<c>'});
assert.ok(!html.includes('<b>x')&&!html.includes('<c>')&&html.includes('data-note-action="snooze"'));
assert.ok(shade.render({notifications:[],settings:base},{shadeSettings:true},t,{locale:'en-US',clock:'',date:'',carrier:''}).includes('show-settings'));
console.log('JB shade checks passed: clear-all timing, flip duration, quick settings order/states, expansion defaults and escaping.');
