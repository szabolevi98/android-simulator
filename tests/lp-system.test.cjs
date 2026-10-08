const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
// Lollipop 5.1.1: page wiring, Quick Settings tiles with their AnimatedVectorDrawables, Overview, texts from the image.
const dir='versions/5.1.1/',html=fs.readFileSync(dir+'index.html','utf8');
// Every script and stylesheet the page loads exists.
for(const [,src] of html.matchAll(/(?:src|href)="([^"?#:]+\.(?:js|css))(?:\?[^"]*)?"/g))assert.ok(fs.existsSync(path.join(dir,src)),src);
assert.ok(html.indexOf('lp-qs-icons.js')<html.indexOf('lp-shade.js')&&html.includes('lp-ripple.js')&&html.includes('lp-ripple.css'));
// Quick Settings: QSTile.AnimationIcon, *_enable_animation when on, *_disable_animation when off; rotation by lock state.
const w={window:{}};vm.runInNewContext(fs.readFileSync(dir+'lp-qs-icons.js','utf8'),w);vm.runInNewContext(fs.readFileSync(dir+'lp-shade.js','utf8'),w);
const icons=w.window.LPQSIcons,S=w.window.LPShade;
assert.equal(Object.keys(icons).length,14);
assert.equal(icons.ic_signal_airplane_enable_animation.duration,550);assert.equal(icons.ic_portrait_to_auto_rotate_animation.duration,617);
for(const {svg} of Object.values(icons))assert.ok(svg.startsWith('<svg class="lp-avd"')&&svg.includes('<animate')&&!svg.includes('NaN'));
const tile=(settings,id)=>S.tiles(settings,{carrier:'Telekom'}).find(t=>t.id===id);
assert.equal(tile({airplane:true},'airplane').avd,'ic_signal_airplane_enable_animation');
assert.equal(tile({airplane:false},'airplane').avd,'ic_signal_airplane_disable_animation');
assert.equal(tile({rotate:true},'rotation').avd,'ic_portrait_to_auto_rotate_animation');
assert.equal(tile({rotate:false},'rotation').avd,'ic_portrait_from_auto_rotate_animation');
assert.equal(tile({flashlight:true},'flashlight').avd,'ic_signal_flashlight_enable_animation');
const shade=S.render({settings:{wifi:true,wifiNetwork:'AndroidAP'},notifications:[]},{shadeSettings:true},k=>k,{locale:'en',clock:'12:00',date:'',shortDate:'',carrier:'Telekom',alarm:''});
assert.ok(shade.includes('data-avd="ic_signal_airplane_disable_animation"'));
// Inlined icons get their own clip-path ids, so two copies on the page never share one.
const ids=[...shade.matchAll(/(?<![-\w])id="([^"]+)"/g)].map(m=>m[1]),refs=[...shade.matchAll(/url\(#([^)]+)\)/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length);assert.ok(refs.length&&refs.every(ref=>ids.includes(ref)));
assert.equal(typeof S.expand,'function');assert.equal(typeof S.animate,'function');assert.equal(typeof S.playIcons,'function');
// Overview exports the enter and exit animations.
const r={window:{}};vm.runInNewContext(fs.readFileSync(dir+'lp-recents.js','utf8'),r);
assert.equal(typeof r.window.LPRecents.exit,'function');
// Screen pinning: only the front task (the last card) carries the pin, and only while the setting is on.
const opts=pin=>({names:{a:'A',b:'B'},icon:()=>'',snapshots:{},colors:{},statusColors:{},t:k=>k,pin});
const cards=r.window.LPRecents.render(['a','b'],opts(true)).split('class="recent-item lp-task"').slice(1);
assert.ok(!cards[0].includes('lp-task-pin')&&cards[1].includes('data-action="lp-pin" data-app="a"'));
assert.ok(!r.window.LPRecents.render(['a','b'],opts(false)).includes('lp-task-pin'));
for(const key of ['screen_pinning_title','lock_to_app_start','lock_to_app_exit','lock_to_app_toast'])assert.ok(fs.readFileSync('docs/lp-strings.txt','utf8').includes(key),key);
// Texts come from the LMY48Y APKs; Google Calendar 5.0.1 there has no 3 day view.
const strings=fs.readFileSync(dir+'lp-strings.js','utf8');
for(const [en,hu] of [['Schedule','Ütemezés'],['Search contacts & places','Névjegyek és helyek keresése'],['Contacts','Névjegyek'],['Interruptions','Zavaró üzenetek'],['Welcome','Üdvözöljük!']])assert.ok(strings.includes(`["${en}", "${hu}"`),en);
assert.ok(!fs.readFileSync(dir+'calendar.js','utf8').includes("'3 day','Week'"));
// Material touch feedback: RippleDrawable's constants.
const ripple=fs.readFileSync(dir+'lp-ripple.js','utf8');
assert.ok(ripple.includes('ENTER_DELAY = 80, DOWN = 1024, UP = 3400, OPACITY_DECAY = 3, BACKGROUND_ENTER = 667'));
console.log('lp-system ok');
