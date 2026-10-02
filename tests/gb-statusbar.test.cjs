const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},requestAnimationFrame:()=>0,cancelAnimationFrame(){},performance:{now:()=>0}};vm.runInNewContext(fs.readFileSync('versions/2.3.6/gb-statusbar.js','utf8'),context);
const bar=context.window.GBStatusBar,t=key=>key;
// stat_sys_battery.xml level-list: 0-2 -> 0, 3-7 -> 5, ..., 78 -> 80, 98-100 -> 100.
assert.equal(bar.batteryIcon(2),'gb-stat_sys_battery_0.png');assert.equal(bar.batteryIcon(3),'gb-stat_sys_battery_5.png');
assert.equal(bar.batteryIcon(77),'gb-stat_sys_battery_75.png');assert.equal(bar.batteryIcon(78),'gb-stat_sys_battery_80.png');
assert.equal(bar.batteryIcon(100),'gb-stat_sys_battery_100.png');assert.equal(bar.batteryIcon(40,true),'gb-stat_sys_battery_charge_anim5.png');
// config_statusBarIcons order: bluetooth, mute, wifi (or data), signal, battery, alarm; Wi-Fi hides the 3G icon.
const icons=html=>[...html.matchAll(/assets\/([^"]+)\.png/g)].map(m=>m[1]);
assert.deepEqual(icons(bar.statusIcons({bluetooth:true,ringer:'vibrate',wifi:true,data:'3g',battery:78,alarm:true})),['gb-stat_sys_data_bluetooth','gb-stat_sys_ringer_vibrate','gb-stat_sys_wifi_signal_4_fully','gb-stat_sys_signal_4_fully','gb-stat_sys_battery_80','gb-stat_notify_alarm']);
assert.deepEqual(icons(bar.statusIcons({wifi:false,data:'3g',battery:50})),['gb-stat_sys_data_fully_connected_3g','gb-stat_sys_signal_4_fully','gb-stat_sys_battery_50']);
assert.deepEqual(icons(bar.statusIcons({airplane:true,wifi:true,data:'3g',battery:50})),['gb-stat_sys_signal_flightmode','gb-stat_sys_battery_50']);
// performFling (device px): 200 px/s and half height when closed, the last 25 px when open.
const h=460,px=bar.PX;
assert.equal(bar.flingDirection(false,h/2+1,0,h),true);assert.equal(bar.flingDirection(false,h/2-1,0,h),false);
assert.equal(bar.flingDirection(false,50,201*px,h),true);assert.equal(bar.flingDirection(false,400,-201*px,h),false);
assert.equal(bar.flingDirection(true,h-5,0,h),true);assert.equal(bar.flingDirection(true,h-30,0,h),false);
assert.equal(bar.ACCEL,2000*px);
// Shade: sections and the Clear button follow status_bar_expanded.xml.
const empty=bar.shade({t,carrier:'Telekom',ongoing:[],latest:[],clearable:false});
assert.match(empty,/No notifications/);assert.match(empty,/gbsh-clear" data-action="clear-notifications" hidden/);assert.doesNotMatch(empty,/>Ongoing</);
const full=bar.shade({t,carrier:'Telekom',ongoing:[{id:'call',action:'open-app',app:'phone',icon:'x.png',title:'Ongoing call',text:'Alex'}],latest:[{id:5,icon:'y.png',title:'<b>',text:'hi',time:'9:41'}],clearable:true});
assert.ok(full.indexOf('>Ongoing<')<full.indexOf('>Notifications<'));assert.match(full,/&lt;b&gt;/);assert.match(full,/gbsh-time">9:41/);assert.match(full,/data-app="phone"/);
console.log('gb-statusbar ok');
