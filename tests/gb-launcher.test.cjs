const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};vm.runInNewContext(fs.readFileSync('versions/2.3.6/gb-launcher.js','utf8'),context);
const l=context.window.GBLauncher,t=key=>key,plain=v=>JSON.parse(JSON.stringify(v));
// Protips: six tips per language, eight untranslated haiku in the secret set.
for(const lang of ['en','hu','de','fr','es'])assert.equal(l.tips(lang,0).length,6);
assert.equal(l.tips('hu',1).length,8);assert.equal(l.tips('xx',0),l.TIPS.en);
let html=l.protips({index:0,set:0},'en');assert.match(html,/See all your apps\./);assert.match(html,/gb-tips-all_apps\.png/);assert.match(html,/1 of 6/);
// The 2.3.6 Hungarian pager_footer swaps the numbers.
assert.match(l.protips({index:1,set:0},'hu'),/6\/2/);
assert.match(l.protips({index:7,set:1},'en'),/I am an Android/);
assert.doesNotMatch(l.protips({index:-1,set:0},'en'),/gbtips-bubble/);
// ProtipWidget.blink(3): closed, open/closed twice, then open.
assert.deepEqual(plain(l.blinkFrames(3)).map(f=>f[0]),['droidman_closed','droidman_open','droidman_closed','droidman_open','droidman_closed','droidman_open']);
// home_arrows level-list: one dot per screen on that side, up to four; hidden at the ends.
html=l.arrows(2,5,t);assert.match(html,/ic_home_arrows_2_normal\.png/);assert.match(html,/ic_home_arrows_2_normal_right\.png/);
html=l.arrows(0,5,t);assert.match(html,/gbl-arrow-left" data-action="page" data-id="-1" hidden/);assert.match(html,/ic_home_arrows_4_normal_right/);
// Button cluster and search widget wiring.
assert.match(l.dock(t),/data-app="phone".*data-action="drawer".*data-app="browser"/s);
assert.match(l.search(t),/browser-search.*voice-search/s);
// Music widget: initial text, then title/artist and the pause icon while playing.
assert.match(l.music({playing:false},{title:'A',artist:'B'},false,t),/Touch to select music\./);
html=l.music({playing:true},{title:'Song',artist:'Band'},true,t);assert.match(html,/<strong>Song<\/strong><span>Band/);assert.match(html,/music_pause/);
console.log('gb-launcher ok');
