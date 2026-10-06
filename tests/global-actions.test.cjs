const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const load=v=>{const context={window:{}};vm.runInNewContext(fs.readFileSync(`versions/${v}/global-actions.js`,'utf8'),context);return context.window.GlobalActions;};
const ics=load('4.0.4'),jb=load('4.3'),gb=load('2.3.6'),lp=load('5.1.1'),t=k=>k,plain=v=>JSON.parse(JSON.stringify(v));
{const strip=f=>fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n').replace(/\/\*[\s\S]*?\*\//,'');assert.equal(strip('versions/4.4.4/global-actions.js'),strip('versions/4.3/global-actions.js'),'4.4.4: same code as 4.3, only the header differs');}
// createDialog() order: power off, airplane mode, bug report (4.2+ and only when enabled), silent mode; 4.0.4 has no bug report.
assert.deepEqual(plain(jb.items({bugreport:true}).map(i=>i.id)),['power','airplane','bugreport','ringer']);
assert.deepEqual(plain(jb.items({bugreport:false}).map(i=>i.id)),['power','airplane','ringer']);
assert.deepEqual(plain(ics.items({bugreport:true}).map(i=>i.id)),['power','airplane','ringer']);
assert.equal(jb.items({airplane:true})[1].status,'Airplane mode is ON');
assert.equal(jb.KEY_TIMEOUT,500);assert.equal(jb.DISMISS_DELAY,300);
// SilentModeTriStateAction indices follow AudioManager.RINGER_MODE_*, stored as the Sound settings' silent mode.
assert.deepEqual(plain(jb.RINGER.map(r=>r[0])),['silent','vibrate','normal']);
for(const mode of ['silent','vibrate','normal']){const s={};jb.setRinger(s,mode);assert.equal(jb.ringerOf(s),mode);}
const menu=jb.menu({ringer:'vibrate'},t);
assert.ok(menu.includes('data-id="vibrate" role="radio" aria-checked="true"')&&menu.includes('data-id="normal" role="radio" aria-checked="false"'));
assert.ok(menu.includes('assets/ga-ic_lock_airplane_mode_off.png'));
// ShutdownThread: Cancel on the left, OK on the right; the safe mode and bug report variants.
const confirm=jb.confirm('shutdown',t);assert.ok(confirm.indexOf('>Cancel<')<confirm.indexOf('>OK<')&&confirm.includes('Your phone will shut down.'));
assert.ok(jb.confirm('safemode',t).includes('Reboot to safe mode')&&jb.confirm('bugreport',t).includes('>Report<'));
assert.ok(jb.progress(t).includes('Shutting down…')&&jb.boot().includes('boot-android-logo-mask.png'));
assert.ok(!('safemode' in ics.CONFIRM)&&!('bugreport' in ics.CONFIRM),'4.0.4: no safe-mode reboot or bug report');
for(const v of ['4.0.4','4.3','4.4.4'])for(const f of ['ga-dialog_full_holo_dark','ga-ic_lock_power_off','ga-spinner_48_outer_holo','boot-android-logo-shine','stat_sys_ringer_vibrate','stat_sys_alarm'])assert.ok(fs.existsSync(`versions/${v}/assets/${f}.png`),`${v} ${f}`);
// Each image's own framework-res art: xhdpi on the Galaxy Nexus and Nexus 4, xxhdpi on the Nexus 5.
{const size=f=>{const b=fs.readFileSync(f);return [b.readUInt32BE(16),b.readUInt32BE(20)];};
assert.deepEqual(size('versions/4.3/assets/ga-ic_lock_power_off.png'),[64,64]);assert.deepEqual(size('versions/4.4.4/assets/ga-ic_lock_power_off.png'),[96,96]);
assert.ok(fs.readFileSync('versions/4.4.4/global-actions.css','utf8').includes("ga-dialog_full_holo_dark.png') 30 fill"));
assert.ok(fs.readFileSync('versions/4.0.4/global-actions.css','utf8').includes('padding:5.4px 0 5.4px 14.4px'),'4.0.4 row: 16dp start padding, no 56dp icon box');}
// Gingerbread: the list is a GBUI dialog; only the key hold, shutdown and boot come from here.
assert.deepEqual(Object.keys(gb).sort(),['BOOT_MS','KEY_TIMEOUT','SHUTDOWN_MS','boot','hold']);
// Lollipop: Power off and, when enabled, Take bug report with ic_lock_bugreport; no airplane or ringer rows.
assert.deepEqual(plain(lp.items({bugreport:true}).map(i=>[i.id,i.icon,i.message])),[['power','lp-fw-ic_lock_power_off.png','Power off'],['bugreport','lp-fw-ic_lock_bugreport.svg','Take bug report']]);
assert.ok(!lp.menu({},t).includes('ga-silent')&&!lp.progress(t).includes('<img'));
for(const f of ['lp-fw-ic_lock_power_off.png','lp-fw-ic_lock_bugreport.svg'])assert.ok(fs.existsSync(`versions/5.1.1/assets/${f}`),f);
assert.ok(!fs.readFileSync('versions/5.1.1/lp-dialogs.css','utf8').includes('.ga-'),'the LP power dialogs live in their own global-actions.css');
console.log('Global actions checks passed: item order per version, ringer modes, dialogs and assets.');
