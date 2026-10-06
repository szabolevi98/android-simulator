const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Nexus 6 (LMY48Y): the Play apps from their APKs (audit step 4).
const w={window:{}};vm.runInNewContext(fs.readFileSync('versions/5.1.1/stock-strings.js','utf8')+fs.readFileSync('versions/5.1.1/play-apps.js','utf8'),w);
const P=w.window.PlayApps,t=k=>k,tracks=[{title:'A',artist:'X',album:'One',duration:100},{title:'B',artist:'X',album:'One',duration:90}];
const music={queue:[0,1],track:0,position:10,playing:true,shuffle:false,repeat:'off',playlists:[]};
const ctx=(app,ui={},locale='en')=>({app,ui,data:{},t,locale,music,tracks,time:s=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`});
const labels=html=>[...html.matchAll(/<button[^>]*>(?:<img[^>]*>)?([^<]*)</g)].map(m=>m[1]).join();
// Play Music 5.8: the Toolbar with the drawer toggle, Search only, the PlayDrawer, MyLibraryFragment's tabs.
const listen=P.render(ctx('play-music'));
assert.ok(listen.includes('lpa-bar')&&listen.includes('>Listen Now<')&&listen.includes('pm58-ic_search_white.png')&&!listen.includes('pa-menu')&&!listen.includes('ALL MUSIC'));
const md=P.drawer(ctx('play-music'));
assert.equal(labels(md),'Listen Now,My Library,Playlists,Instant Mixes,Shop,Settings,Help,Send feedback');
assert.ok(md.includes('pm58-ic_drawer_listennow_selected.png')&&md.includes('nexus6.demo@gmail.com'));
assert.equal([...P.render(ctx('play-music',{paPage:{'play-music':'library'}})).matchAll(/data-action="pa-libtab" data-id="\w+">([^<]*)</g)].map(m=>m[1]).join(),'Genres,Artists,Albums,Songs');
assert.ok(!P.render(ctx('play-music',{sub:'album'})).includes('‹'));
// Play Movies 3.6: VideosDrawerHelper's verticals in the PlayDrawer, Search only, My Library's tabs.
assert.equal(labels(P.drawer(ctx('play-movies'))),'Watch Now,My Library,My Wishlist,Shop,Settings,Help &amp; feedback');
const lib=P.render(ctx('play-movies'));
assert.ok(lib.includes('>My Library<')&&lib.includes('mv36-abc_ic_search_api_mtrl_alpha.png')&&!lib.includes('pa-menu'));
assert.equal([...lib.matchAll(/data-action="pa-movietab" data-id="\w+">([^<]*)</g)].map(m=>m[1]).join(),'My Movies,My TV Shows');
assert.ok(!P.render(ctx('play-movies',{sub:'movie',paItem:'m1'})).includes('‹'));
console.log('lp-play-apps ok');
