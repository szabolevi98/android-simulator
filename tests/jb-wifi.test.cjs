const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},Intl,Date};vm.runInNewContext(fs.readFileSync('versions/4.3/settings-system.js','utf8'),context);
const sys=context.window.ICSSystemSettings,t=k=>k;
const data={settings:{wifi:true,wifiNetwork:'AndroidAP'}};
const page=sys.render(data,{sub:'wifi-advanced'},t,'en-US');
const titles=[...page.body.matchAll(/<span class="row-copy">([^<]+)/g)].map(m=>m[1]);
// wifi_advanced_settings.xml order at android-4.3_r1.1 (dual band kept: the Nexus 4 overlay sets config_wifi_dual_band_support).
assert.deepEqual(titles,['Network notification','Keep Wi-Fi on during sleep','Scanning always available','Avoid poor connections','Wi-Fi frequency band','Install certificates','Wi-Fi optimization','MAC address','IP address']);
assert.equal(sys.defaults.wifiOptimize,true);assert.equal(sys.defaults.wifiScanAlways,false);assert.equal(sys.defaults.wifiBand,'auto');
const off=sys.render({settings:{wifi:false}},{sub:'wifi-advanced'},t,'en-US');
assert.ok(/data-id="wifiNotify"[^>]*disabled/.test(off.body),'network notification follows the Wi-Fi switch');
const sim=fs.readFileSync('versions/4.3/simulator.js','utf8');
assert.ok(sim.includes('data-action="wifi-wps" data-id="pbc"')&&sim.includes('jb-ic_menu_add.png'),'WPS and Add network sit in the action bar');
assert.ok(sim.indexOf('>Scan</button><button data-action="wifi-wps" data-id="pin"')>0&&sim.includes('data-id="wifi-direct"'),'overflow: Scan, WPS Pin Entry, Wi-Fi Direct, Advanced');
for(const f of ['jb-ic_wps','jb-ic_menu_add','jb-progress_bg_holo_dark','jb-btn_default_normal_holo_dark'])assert.ok(fs.existsSync(`versions/4.3/assets/${f}.png`),f);
console.log('JB Wi-Fi checks passed: advanced rows, defaults, action bar and overflow.');
