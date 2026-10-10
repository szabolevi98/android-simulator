// Galaxy Nexus Settings pages from the IMM76I Settings (audit step 9): About, Status, Legal, Accounts & sync, Location,
// Backup & reset, Factory data reset, Accessibility (settings-system.js, ICS branch).
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c={window:{AndroidI18n:{language:'en'},ICSGmail:{account:'icecream.demo@gmail.com'}}};
for(const f of ['ics-sync-adapters.js','settings-system.js'])vm.runInNewContext(fs.readFileSync('versions/4.0.4/'+f,'utf8'),c);
const X=c.window.ICSSystemSettings,data={settings:{autoSync:true,backup:true,autoRestore:true,networkLocation:true,gps:false}},t=k=>k;
const r=sub=>X.render(data,{sub},t,'en-US');
const titles=html=>[...html.matchAll(/<span class="row-copy">([^<]+)/g)].map(m=>m[1]);
assert.deepEqual(titles(r('about').body),['System updates','Status','Legal information','Model number','Android version','Baseband version','Kernel version','Build number']);
assert.deepEqual(titles(r('about-status').body),['Battery status','Battery level','Network','Signal strength','Mobile network type','Service state','Roaming','Mobile network state','My phone number','IMEI','IMEI SV','IP address','Wi-Fi MAC address','Bluetooth address','Serial number','Up time']);
assert.deepEqual(titles(r('about-legal').body),['Open source licenses','Google legal']);
assert.match(r('sync').right,/ADD ACCOUNT/);assert.match(r('sync').body,/Sync is ON/);
const sync=titles(r('sync-google').body);assert.equal(sync.length,9);assert.ok(sync.includes('Sync Gmail'));
assert.match(r('location').body,/approximate location/);assert.match(r('backup').body,/Google servers/);assert.match(r('reset-info').body,/Reset phone/);
assert.deepEqual(titles(r('accessibility').body),['TalkBack','Large text','Power button ends call','Auto-rotate screen','Speak passwords','Touch &amp; hold delay','Install web scripts']);
for(const sub of ['sync','sync-google','reset-info'])for(const [,src] of (r(sub).body+(r(sub).right||'')).matchAll(/src="assets\/([^"]+)"/g))assert.ok(fs.existsSync('versions/4.0.4/assets/'+src),src);
console.log('ics-settings-pages ok');
