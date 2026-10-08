const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Videos in Photos (Google+ 4.2.3 on 4.4.4, 4.9.0 on 5.1.1): tile overlay, the one-up play button without Edit,
// the Videos view, and VideoViewActivity's MediaController.
for(const [ver,tile] of [['4.4.4','gp-ov_play_video_32'],['5.1.1','gp4-quantum_ic_play_circle_fill_white_36']]){
  const dir=`versions/${ver}/`,html=fs.readFileSync(dir+'index.html','utf8');
  assert.ok(html.indexOf('photos-video.js')<html.indexOf('photos.js?')&&html.includes('photos-video.css'),ver);
  const c={window:{}};vm.createContext(c);for(const f of ['photos-video.js','photos.js'])vm.runInContext(fs.readFileSync(dir+f,'utf8'),c);
  const V=c.window.GPVideo,P=c.window.PhotosApp,t=k=>k;
  assert.equal(V.time(65000),'01:05');assert.ok(V.tile({video:true}).includes(tile));assert.equal(V.tile({}),'');
  const clip={id:9,name:'VID_1',video:true,duration:6000,created:2},pic={id:8,name:'IMG_1',created:1};
  const ctx=extra=>({data:{photos:[pic,clip]},ui:{...extra},groups:[],t,locale:'en',media:{image:()=>'x.png',art:()=>'<img>'}});
  assert.ok(P.render(ctx({})).includes(tile));
  const videos=P.render(ctx({photosView:'videos'}));assert.ok(videos.includes('data-list="videos"')&&!videos.includes('data-id="8"'));
  assert.equal(JSON.stringify(P.list(ctx({photosList:'videos'})).map(p=>p.id)),'[9]');
  const one=P.render(ctx({sub:'photo',photosIndex:0}));assert.ok(one.includes('photos-play')&&!one.includes('photos-edit'));
  assert.ok(!P.render(ctx({sub:'photo',photosIndex:1})).includes('photos-play'));
  const player=P.render(ctx({sub:'video',photosIndex:0,photosVideo:{pos:2000,paused:true}}));
  assert.ok(player.includes('gpv-ic_media_play')&&player.includes('gpv-ic_media_rew')&&player.includes('00:02')&&player.includes('00:06'));
}
console.log('photos-video ok');
