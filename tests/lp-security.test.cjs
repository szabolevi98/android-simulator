const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Settings 5.1 Security sub-pages: SIM card lock, Trusted credentials (the image's CA store), Trust agents, usage access.
const dir='versions/5.1.1/',html=fs.readFileSync(dir+'index.html','utf8');
assert.ok(html.indexOf('lp-cacerts.js')<html.indexOf('lp-security.js')&&html.includes('lp-security.css'));
const c={window:{}};vm.createContext(c);for(const f of ['lp-cacerts.js','lp-security.js'])vm.runInContext(fs.readFileSync(dir+f,'utf8'),c);
const S=c.window.LPSecurity,certs=c.window.LPCaCerts,t=k=>k;
assert.equal(certs.length,162);
for(let i=1;i<certs.length;i++){const a=certs[i-1],b=certs[i];assert.ok(a.p.toLowerCase()<b.p.toLowerCase()||(a.p.toLowerCase()===b.p.toLowerCase()&&a.s.toLowerCase()<=b.s.toLowerCase()),b.p);}
assert.ok(certs.every(x=>/^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(x.sha256)&&x.from<x.until));
const data={settings:{}},ui={};
assert.ok(S.page('sim-lock',{data,ui,t}).body.includes('disabled'));
// The demo SIM keeps the first PIN; a wrong one fails, a new PIN is typed twice.
ui.lpsPin={mode:'toggle',step:'pin'};assert.equal(S.pinOk(data,ui,'12'),null);assert.equal(S.pinOk(data,ui,'1234'),'');assert.ok(data.settings.simLock&&data.settings.simPin==='1234');
ui.lpsPin={mode:'change',step:'pin'};assert.match(S.pinOk(data,ui,'9999'),/Can't change PIN/);
ui.lpsPin={mode:'change',step:'pin'};assert.equal(S.pinOk(data,ui,'1234'),null);assert.equal(S.pinOk(data,ui,'5678'),null);assert.equal(S.pinOk(data,ui,'5679'),null);assert.equal(ui.lpsPin.error,"PINs don't match");
assert.equal(S.pinOk(data,ui,'5678'),null);assert.equal(S.pinOk(data,ui,'5678'),'SIM PIN changed successfully');assert.equal(data.settings.simPin,'5678');
const creds=S.page('trusted-creds',{data:{settings:{disabledCerts:[certs[0].file]}},ui:{},t});assert.equal((creds.body.match(/class="lps-cert"/g)||[]).length,162);assert.equal((creds.body.match(/lp-mswitch on/g)||[]).length,161);
assert.equal(S.page('trusted-creds',{data,ui:{lpsTab:'user'},t}).body.includes('lps-cert'),false);
const det=S.overlay({data,ui:{overlay:'lps-cert',lpsCert:certs[0].file},t,locale:'en'});assert.ok(det.includes('Issued to:')&&det.includes(certs[0].sha1));
assert.ok(S.page('trust-agents',{data,ui,t}).body.includes('Smart Lock (Google)'));assert.equal(S.page('usage-access',{data,ui,t}).body,'');
const sec=fs.readFileSync(dir+'lp-settings-pages.js','utf8');assert.ok(sec.includes("'settings-sub', 'trusted-creds'")&&sec.includes('To use, first set a screen lock')&&!sec.includes('Smart Lock needs'));
console.log('lp-security ok');
