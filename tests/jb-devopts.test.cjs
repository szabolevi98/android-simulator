const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},document:{}};vm.runInNewContext(fs.readFileSync('versions/4.3/jb-devopts.js','utf8'),context);
const dev=context.window.JBDeveloperOptions,t=k=>k;
// development_prefs.xml order: six categories after the top group, 34 rows in all.
assert.deepEqual(JSON.parse(JSON.stringify(dev.SECTIONS.map(s=>s[0]))),['','Debugging','Input','Drawing','Hardware accelerated rendering','Monitoring','Apps']);
assert.equal(dev.SECTIONS.reduce((n,s)=>n+s[1].length,0),34);
assert.ok(dev.keys().includes('layoutBounds')&&dev.keys().includes('animatorScale')&&dev.keys().includes('pointerLocation'));
assert.equal(dev.DEFAULTS.verifyUsb,true);assert.equal(dev.DEFAULTS.developerEnabled,true);
const on=dev.render({developerEnabled:true,usbDebug:false,stayAwake:true},t,v=>`Animation scale ${v}x`);
assert.ok(on.includes('data-id="stayAwake" role="checkbox" aria-checked="true"')&&on.includes('Animation scale 1x')&&on.includes('>DEBUGGING<'));
assert.ok(/data-id="waitDebugger"[^>]*disabled/.test(on),'Wait for debugger needs a debug app');
const off=dev.render({developerEnabled:false},t,v=>`${v}`);assert.equal((off.match(/ disabled /g)||[]).length,34,'master switch off disables every row');
console.log('JB developer options checks passed: categories, rows, defaults, dependencies and the master switch.');
