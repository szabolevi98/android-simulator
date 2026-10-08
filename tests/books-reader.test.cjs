const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Play Books' reader settings and contents (audit step 6): the Display options in each image's order with working
// theme / typeface / alignment / brightness / size / line height, and the chapter list that jumps to a chapter.
const load=(v,files)=>{const context={window:{}};for(const f of files)vm.runInNewContext(fs.readFileSync(`versions/${v}/${f}`,'utf8'),context);return context.window;};

// 4.3: Play Books 2.8.91 (ReaderSettingsController.createFlowingTextModeSettingsView, TableOfContentsActivity).
{
  const W=load('4.3',['stock-strings.js','play-apps.js']),P=W.PlayApps,t=k=>k;
  const book=P.BOOKS[0];assert.deepEqual([...book.starts],[0,4,6]);
  const ctx=(ui,data={})=>({app:'play-books',ui:{sub:'reader',paItem:'b1',...ui},t,locale:'hu',data:{playBooks:{b1:5},...data}});
  const reader=P.render(ctx({}));
  assert.ok(reader.includes('data-action="bk-toc"')&&reader.includes('bk28-ic_menu_toc_light')&&reader.includes('data-action="bk-options"')&&reader.includes('bk28-ic_menu_settings_light'));
  assert.ok(reader.includes('bk28-theme-day')&&reader.includes('--bk-zoom:1;')&&!reader.includes('bk28-options"'));
  const opts=P.render(ctx({bkOptions:true}));
  const order=['TÉMA','BETŰKÉP','SZÖVEG IGAZÍTÁSA','FÉNYERŐ','BETŰMÉRET','SORMAGASSÁG'].map(k=>opts.indexOf(`<b>${k}</b>`));
  assert.ok(order.every((n,i)=>n>0&&(i===0||n>order[i-1])),JSON.stringify(order));
  assert.ok(opts.includes('>Nappal<')&&opts.includes('100%')&&opts.includes('fontsize_smaller_on'));
  const drop=P.render(ctx({bkOptions:true,bkSpin:'typeface'}));
  assert.equal((drop.match(/data-action="bk-pref" data-id="typeface:/g)||[]).length,6);assert.ok(drop.includes('data-id="typeface:OFLGoudyStMTT">Sorts Mill Goudy'));
  const sepia=P.render(ctx({},{bookPrefs:{theme:'2',typeface:'Merriweather',justification:'left',brightness:40,textZoom:1.25,lineHeight:1.6875}}));
  assert.ok(sepia.includes('bk28-theme-sepia')&&sepia.includes('bk28-face-Merriweather')&&sepia.includes('bk28-just-left')&&sepia.includes('--bk-zoom:1.25')&&sepia.includes('--bk-lh:1.1250')&&sepia.includes('--bk-dim:0.420'));
  const night=P.render(ctx({},{bookPrefs:{theme:'1'}}));assert.ok(night.includes('bk28-reader-bar dark')&&night.includes('ic_menu_settings_dark'));
  // TextZoomPreference: 1/8 steps, down only while above 1.98 steps; LineHeightPreference: 0.1875 steps, never below 1.125.
  const pr=P.bookPrefs({});
  assert.equal(P.stepPref(pr,'textZoom',1),1.125);assert.equal(P.stepPref({...pr,textZoom:.25},'textZoom',-1),.125);assert.equal(P.stepPref({...pr,textZoom:.125},'textZoom',-1),.125);
  assert.equal(P.stepPref(pr,'lineHeight',-1),1.3125);assert.equal(P.stepPref({...pr,lineHeight:1.125},'lineHeight',-1),1.125);
  assert.ok(P.render(ctx({bkOptions:true},{bookPrefs:{textZoom:1.125,lineHeight:1.125}})).includes('113%')&&P.render(ctx({bkOptions:true},{bookPrefs:{lineHeight:1.125}})).includes('fontsize_smaller_on')&&P.render(ctx({bkOptions:true},{bookPrefs:{lineHeight:1.125}})).includes('lineheight_smaller_off'));
  const toc=P.render(ctx({bkToc:true}));
  assert.ok(toc.includes('>Tartalom<')&&toc.includes('>Fejezetek<')&&toc.includes('>Könyvjelzők<')&&toc.includes('>Jegyzetek<'));
  assert.equal((toc.match(/data-action="bk-chapter"/g)||[]).length,3);
  assert.ok(/class="current" data-action="bk-chapter" data-id="4"><span>CHAPTER II\. The Pool of Tears<\/span><em>5<\/em>/.test(toc));
  assert.ok(P.render(ctx({bkToc:true,bkTocTab:'bookmarks'})).includes('bk28-bookmark_sample_half'));
  const sim=fs.readFileSync('versions/4.3/simulator.js','utf8');
  assert.ok(sim.includes("case 'bk-chapter':")&&sim.includes("case 'bk-pref-step'")&&sim.includes('[data-bk-bright]')&&sim.includes("ui.view === 'play-books' && ui.sub === 'reader' && (ui.bkSpin || ui.bkOptions || ui.bkToc)"));
}
// 4.4.4: Play Books 3.1.33 keeps 2.8.91's ReaderSettingsController order, arrays and Contents.
{
  const W=load('4.4.4',['stock-strings.js','play-apps.js']),P=W.PlayApps,t=k=>k;
  const ctx=(ui,data={})=>({app:'play-books',ui:{sub:'reader',paItem:'b1',...ui},t,locale:'de',data:{playBooks:{b1:0},...data}});
  const opts=P.render(ctx({bkOptions:true}));
  assert.ok(opts.includes('bk3-options')&&opts.includes('bk3-ic_settings_fontsize_larger_on_holo_light')&&opts.indexOf('data-id="theme"')<opts.indexOf('data-id="typeface"')&&opts.indexOf('data-id="typeface"')<opts.indexOf('data-id="justification"'));
  assert.ok(P.render(ctx({},{bookPrefs:{theme:'1'}})).includes('pb-top bk3-dark'));
  const toc=P.render(ctx({bkToc:true}));assert.equal((toc.match(/data-action="bk-chapter"/g)||[]).length,3);assert.ok(toc.includes('class="current" data-action="bk-chapter" data-id="0"'));
  const sim=fs.readFileSync('versions/4.4.4/simulator.js','utf8');assert.ok(sim.includes("Play Books 3.1.33's reader")&&sim.includes('[data-bk-bright]'));
}
// 5.1.1: Play Books 3.3.15's card: theme buttons, brightness, the "T" and alignment spinners, size and line buttons
// (addTheme, addBrightness, addTypeFace, addJustification, addTextSize, addLineHeight), and ContentsView's blue header.
{
  const W=load('5.1.1',['stock-strings.js','play-apps.js']),P=W.PlayApps,t=k=>k;
  const ctx=(ui,data={})=>({app:'play-books',ui:{sub:'reader',paItem:'b2',...ui},t,locale:'en',data:{playBooks:{b2:5},...data}});
  const reader=P.render(ctx({}));assert.ok(reader.includes('bk33-ic_toc_24dp')&&reader.includes('bk33-ic_text_format_24dp'));
  const opts=P.render(ctx({bkOptions:true},{bookPrefs:{theme:'2',justification:'justify'}}));
  const at=k=>opts.indexOf(k),order=['class="bk33-pref themes"','class="bk33-pref bright"','data-id="typeface"','data-id="justification"','data-id="textZoom:-1"','data-id="lineHeight:-1"'].map(at);
  assert.ok(order.every((n,i)=>n>0&&(i===0||n>order[i-1])),JSON.stringify(order));
  assert.ok(opts.includes('bk33-theme sepia on')&&opts.includes('alignment_justify_holo_light')&&opts.includes('brightness_auto_on')&&!opts.slice(opts.indexOf('bk33-options"')).includes('<b>'));
  const toc=P.render(ctx({bkToc:true}));
  assert.ok(toc.includes('bk33-ic_close_wht_24dp')&&toc.includes('aria-label="Close table of contents"')&&toc.includes('<b>Pride and Prejudice</b>')&&toc.includes('class="current" data-action="bk-chapter" data-id="4"'));
  assert.ok(P.render(ctx({bkToc:true,bkTocTab:'bookmarks'})).includes('To add a bookmark, touch the top corner of the page'));
  assert.ok(fs.readFileSync('versions/5.1.1/simulator.js','utf8').includes("Play Books 3.3.15's reader"));
}
console.log('books-reader ok');
