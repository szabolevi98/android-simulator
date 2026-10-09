const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},document:{}};vm.runInNewContext(fs.readFileSync('versions/4.3/jb-devopts.js','utf8'),context);
const dev=context.window.JBDeveloperOptions,t=k=>k;
// development_prefs.xml order: six categories after the top group (Take bug report first), 35 rows in all.
assert.deepEqual(JSON.parse(JSON.stringify(dev.SECTIONS.map(s=>s[0]))),['','Debugging','Input','Drawing','Hardware accelerated rendering','Monitoring','Apps']);
assert.equal(dev.SECTIONS.reduce((n,s)=>n+s[1].length,0),35);
assert.ok(dev.keys().includes('layoutBounds')&&dev.keys().includes('animatorScale')&&dev.keys().includes('pointerLocation'));
assert.equal(dev.DEFAULTS.verifyUsb,true);assert.equal(dev.DEFAULTS.developerEnabled,true);
const on=dev.render({developerEnabled:true,usbDebug:false,stayAwake:true},t,v=>`Animation scale ${v}x`);
assert.ok(on.includes('data-id="stayAwake" role="checkbox" aria-checked="true"')&&on.includes('Animation scale 1x')&&on.includes('>DEBUGGING<'));
assert.ok(/data-id="waitDebugger"[^>]*disabled/.test(on),'Wait for debugger needs a debug app');
const off=dev.render({developerEnabled:false},t,v=>`${v}`);assert.equal((off.match(/ disabled /g)||[]).length,35,'master switch off disables every row');
// 4.4.4 and 5.1.1 from their own images (docs/devopts.py): KitKat's Select runtime, Process Stats and Local terminal;
// Lollipop's SwitchPreferences, OEM unlocking, the Wi-Fi rows, Media and its Material category titles.
for(const [file,first,count,has] of [['versions/4.4.4/kk-devopts.js','check',39,'Select runtime'],['versions/5.1.1/lp-devopts.js','switch',47,'OEM unlocking']]){
  const w={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),w);const d=w.window.JBDeveloperOptions;
  assert.equal(d.SECTIONS.reduce((n,s)=>n+s[1].length,0),count);assert.equal(d.SECTIONS[0][1][2][0],first);
  assert.ok(d.SECTIONS.some(([,rows])=>rows.some(r=>r[1]===has)));
  const hu=d.render({developerEnabled:true},t,v=>v,'hu');assert.ok(hu.includes('Hibajelentés készítése'));
  if(first==='switch')assert.ok(hu.includes('>Hibakeresés<')&&hu.includes('role="switch"'));
}
// ListPreferences (audit step 6): entries and summaries from the image's arrays, the default index, a single-choice
// dialog, and the saved choice (data.settings.dev_<key>) shown as the summary.
for(const file of ['versions/4.0.4/ics-devopts.js','versions/4.3/jb-devopts.js','versions/4.4.4/kk-devopts.js','versions/5.1.1/lp-devopts.js']){
  const w={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),w);const d=w.window.JBDeveloperOptions;
  const hdcp=d.SECTIONS.flatMap(([,rows])=>rows).find(r=>r[3]==='dev_hdcp_checking');
  assert.deepEqual([...hdcp[5]],['Never check','Check for DRM content only','Always check']);assert.equal(hdcp[7],1);assert.equal(hdcp[8],'Set HDCP checking behavior');
  assert.ok(d.render({developerEnabled:true},t,v=>v).includes('Use HDCP checking for DRM content only'));
  assert.ok(d.render({developerEnabled:true,dev_hdcp_checking:2},t,v=>v).includes('Always use HDCP checking'));
  const dlg=d.dialog('dev_hdcp_checking',{dev_hdcp_checking:0},t);
  assert.ok(dlg.includes('data-id="dev_hdcp_checking:0" role="radio" aria-checked="true"')&&dlg.includes('>Set HDCP checking behavior<'));
  assert.ok(!d.SECTIONS.flatMap(([,rows])=>rows).some(r=>r[0]==='list'&&/scale|Profile GPU|Background process/.test(r[1])),file+': every ListPreference is a choice');
}
console.log('JB developer options checks passed: categories, rows, defaults, dependencies and the master switch.');
