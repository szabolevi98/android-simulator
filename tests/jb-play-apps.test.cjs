const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Nexus 4 (JWR66Y): the Play apps of the image, each from its APK (audit step 4).
const w={window:{}};vm.runInNewContext(fs.readFileSync('versions/4.3/stock-strings.js','utf8')+fs.readFileSync('versions/4.3/play-apps.js','utf8'),w);
const P=w.window.PlayApps,t=k=>k,tracks=[{title:'A',artist:'X',album:'One',duration:100},{title:'B',artist:'X',album:'One',duration:90}];
const music={queue:[0,1],track:0,position:10,playing:true,shuffle:false,repeat:'off',playlists:[]};
const ctx=(app,ui={},locale='en')=>({app,ui,data:{},t,locale,music,tracks,time:s=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`});
// Play Books 2.8.91: FlatBlue bar with the drawer toggle and ic_corpora_books, "Recent" over books_card_small cards.
const books=P.render(ctx('play-books'));
assert.ok(books.includes('bk28-ic_drawer_white.png')&&books.includes('bk28-ic_corpora_books.png')&&books.includes('Read Now')&&books.includes('>Recent<'));
assert.equal((books.match(/class="bk28-card"/g)||[]).length,P.BOOKS.length);
assert.ok(!books.includes('SEE ALL')&&!books.includes('‹'));
const lib=P.render(ctx('play-books',{paPage:{'play-books':'library'},bkFilterOpen:true}));
assert.ok(lib.includes('My Library')&&lib.includes('bk28-spinner')&&lib.includes('All books')&&lib.includes('Purchases')&&lib.includes('bk28-divider'));
// HomeFragment.createSideDrawerItems: Read Now, My Library, Shop.
assert.deepEqual([...P.drawer(ctx('play-books')).matchAll(/<button[^>]*>([^<]*)</g)].map(m=>m[1]),['Read Now','My Library','Shop']);
// menu/home.xml overflow: Sort only in My Library.
assert.equal(JSON.stringify(P.menu(ctx('play-books')).map(i=>i.title)),JSON.stringify(['Refresh','Settings','Help']));
assert.equal(JSON.stringify(P.menu(ctx('play-books',{paPage:{'play-books':'library'}})).map(i=>i.title)),JSON.stringify(['Sort','Refresh','Settings','Help']));
assert.equal(P.menu(ctx('play-books',{},'hu'))[0].title,w.window.StockStrings.books.Refresh[0]);
const reader=P.render(ctx('play-books',{sub:'reader',paItem:'b2'}));
assert.ok(reader.includes('bk28-ic_ab_back_holo_light.png')&&reader.includes('Pride and Prejudice')&&!reader.includes('‹'));
console.log('jb-play-apps ok');
