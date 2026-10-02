const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const load=v=>{const context={window:{}};vm.runInNewContext(fs.readFileSync(`versions/${v}/global-actions.js`,'utf8'),context);return context.window.GlobalActions;};
const ics=load('4.0.4'),jb=load('4.3'),t=k=>k,plain=v=>JSON.parse(JSON.stringify(v));
assert.equal(fs.readFileSync('versions/4.0.4/global-actions.js','utf8'),fs.readFileSync('versions/4.3/global-actions.js','utf8'),'both versions share the file');
// createDialog() order: power off, airplane mode, bug report (4.2+ and only when enabled), silent mode.
assert.deepEqual(plain(jb.items({bugreport:true},'4.3').map(i=>i.id)),['power','airplane','bugreport','ringer']);
assert.deepEqual(plain(jb.items({bugreport:false},'4.3').map(i=>i.id)),['power','airplane','ringer']);
assert.deepEqual(plain(ics.items({bugreport:true},'4.0.4').map(i=>i.id)),['power','airplane','ringer']);
assert.equal(jb.items({airplane:true},'4.3')[1].status,'Airplane mode is ON');
assert.equal(jb.KEY_TIMEOUT,500);assert.equal(jb.DISMISS_DELAY,300);
// SilentModeTriStateAction indices follow AudioManager.RINGER_MODE_*, stored as the Sound settings' silent mode.
assert.deepEqual(plain(jb.RINGER.map(r=>r[0])),['silent','vibrate','normal']);
for(const mode of ['silent','vibrate','normal']){const s={};jb.setRinger(s,mode);assert.equal(jb.ringerOf(s),mode);}
const menu=jb.menu({ringer:'vibrate'},t,'4.3');
assert.ok(menu.includes('data-id="vibrate" role="radio" aria-checked="true"')&&menu.includes('data-id="normal" role="radio" aria-checked="false"'));
assert.ok(menu.includes('assets/ga-ic_lock_airplane_mode_off.png'));
// ShutdownThread: Cancel on the left, OK on the right; the safe mode and bug report variants.
const confirm=jb.confirm('shutdown',t);assert.ok(confirm.indexOf('>Cancel<')<confirm.indexOf('>OK<')&&confirm.includes('Your phone will shut down.'));
assert.ok(jb.confirm('safemode',t).includes('Reboot to safe mode')&&jb.confirm('bugreport',t).includes('>Report<'));
assert.ok(jb.progress(t).includes('Shutting down…')&&jb.boot().includes('boot-android-logo-mask.png'));
for(const v of ['4.0.4','4.3'])for(const f of ['ga-dialog_full_holo_dark','ga-ic_lock_power_off','ga-spinner_48_outer_holo','boot-android-logo-shine','stat_sys_ringer_vibrate','stat_sys_alarm'])assert.ok(fs.existsSync(`versions/${v}/assets/${f}.png`),`${v} ${f}`);
console.log('Global actions checks passed: item order per version, ringer modes, dialogs and assets.');
