const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// KitKat Launcher3 clings: first run, then the workspace cling; the folder cling on an open folder; none in overview.
const context={window:{}};vm.runInNewContext(fs.readFileSync('versions/4.4.4/launcher-clings.js','utf8'),context);
const c=context.window.LauncherClings,t=k=>k;
assert.equal(c.SHOW,250);assert.equal(c.DISMISS,200);
assert.ok(Math.abs(c.RING.outer-60*0.906)<1e-9&&Math.abs(c.RING.inner-50*0.906)<1e-9&&Math.abs(c.RING.lift-30*0.906)<1e-9);
const none=c.fresh();
assert.equal(c.wanted({view:'home',overlay:''},none),'firstRun');
assert.equal(c.wanted({view:'home',overlay:''},{...none,firstRun:true}),'workspace');
assert.equal(c.wanted({view:'home',overlay:'',overview:true},{...none,firstRun:true}),'');
assert.equal(c.wanted({view:'home',overlay:'folder'},none),'folder');
assert.equal(c.wanted({view:'drawer',overlay:''},none),'','Launcher3 has no all apps cling');
assert.equal(c.wanted({view:'home',overlay:''},c.dismissedAll()),'');
assert.ok(c.markup('firstRun',t).includes('Create more screens for apps and folders'));
assert.ok(c.markup('workspace',t).includes('kk-cling-ring')&&c.markup('workspace',t).includes('data-id="workspace"'));
// Launcher3 default_workspace.xml: three pages starting on the power control page, no Google folder.
const sim=fs.readFileSync('versions/4.4.4/simulator.js','utf8').replace(/\r\n/g,'\n');
assert.ok(sim.includes("page === 1 && slot === 12 ? 'camera' : page === 2 && slot === 13 ? 'gallery' : page === 2 && slot === 14 ? 'settings' : null"));
assert.ok(sim.includes("[{ id: 'default-power', type: 'power', x: 0, y: 3 }],\n      [{ id: 'default-analog', type: 'analog', x: 1, y: 0 }],\n      []"));
assert.ok(sim.includes("view: 'home', sub: '', page: 0,"),'config_workspaceDefaultScreen is 0');
assert.ok(!/homePages: Array\.from[^\n]*\n[^\n]*'google'/.test(sim),'no Google folder');
for(const f of ['l3-ic_allapps','l3-ic_home_google_logo_normal_holo','l3-ic_home_voice_search_holo','l3-search_frame','l3-workspace_bg','l3-portal_container_holo','l3-portal_ring_inner_holo','l3-ic_pageindicator_current','l3-ic_pageindicator_default','l3-ic_pageindicator_add','l3-cling','l3-cling_button','l3-screenpanel','kk-ic_sysbar_lights_out_dot_small','kk-ic_sysbar_lights_out_dot_large'])assert.ok(fs.existsSync(`versions/4.4.4/assets/${f}.png`),f);
assert.ok(fs.existsSync('versions/4.4.4/assets/kk-default_wallpaper.jpg')&&fs.existsSync('versions/4.4.4/assets/RobotoCondensed-Regular.ttf'));
console.log('kk-launcher ok');
