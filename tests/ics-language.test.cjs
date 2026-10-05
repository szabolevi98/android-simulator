const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Galaxy Nexus Settings > Language & input (ics-language.js, from language_settings.xml and the pages it opens).
const ctx={window:{},Intl,requestAnimationFrame:()=>{},document:{querySelector:()=>null}};vm.runInNewContext(fs.readFileSync('versions/4.0.4/ics-language.js','utf8'),ctx);
const L=ctx.window.ICSLanguage;
const data={settings:{}},ui={sub:'language'};
let page=L.render(data,ui,'en-US');
assert.equal(page.title,'Language & input');
const texts=page.body.replace(/&amp;/g,'&').replace(/<[^>]+>/g,'|').split('|').map(s=>s.trim()).filter(Boolean);
// The order of language_settings.xml; no physical keyboard and, with one recognizer, no "Voice recognizer" list.
assert.deepEqual(texts.filter(x=>['Language','Spelling correction','Personal dictionary','KEYBOARD & INPUT METHODS','Keyboard & input methods','Default','Android keyboard','Google voice typing','Speech','Voice Search','Text-to-speech output','Mouse/trackpad','Pointer speed'].includes(x)),
  ['Language','Spelling correction','Personal dictionary','Keyboard & input methods','Default','Android keyboard','Google voice typing','Speech','Voice Search','Text-to-speech output','Mouse/trackpad','Pointer speed']);
assert.match(page.body,/English \(US\) - Android keyboard/);assert.match(page.body,/Android correction/);assert.doesNotMatch(page.body,/Physical keyboard|Voice recognizer/);
assert.match(L.render(data,ui,'hu-HU').title,/Nyelv és bevitel/);
// Android keyboard settings (prefs.xml): defaults from config_default_* (vibrate and popup on, sound off).
page=L.render(data,{sub:'lng-latin'},'en-US').body;
for(const [title,on] of [['Auto-capitalization',true],['Vibrate on keypress',true],['Sound on keypress',false],['Popup on keypress',true],['Show settings key',false]])
  assert.match(page,new RegExp(`aria-checked="${on}"><span class="row-copy">${title}`),title);
assert.match(page,/Voice input key<small>On main keyboard/);
// TTS: GoogleTTS 4.0.4 has no sample text, so "Listen to an example" is disabled.
assert.match(L.render(data,{sub:'lng-tts'},'en-US').body,/<button class="settings-row wireless-row" disabled><span class="row-copy">Listen to an example/);
// Toggles, list choices, the dictionary and the input method picker.
const c={data,ui:{sub:'lng-latin'},save(){},render(){},renderOverlay(){},toast(){}};
L.handle('lng-toggle','sound',c);assert.equal(L.prefs(data).sound,true);
L.handle('lng-set','autoCorrect:very',c);assert.match(L.render(data,{sub:'lng-latin'},'en-US').body,/data-id="autoCorrect"/);assert.equal(L.prefs(data).autoCorrect,'very');
L.handle('lng-toggle','subtype:hu',c);assert.deepEqual([...L.prefs(data).subtypes],['en_US','hu']);L.handle('lng-toggle','subtype:en_US',c);L.handle('lng-toggle','subtype:hu',c);assert.deepEqual([...L.prefs(data).subtypes],['hu']);
const form=new Map([['word','Kecskemét'],['old','']]);L.submit('lng-word',{get:k=>form.get(k)},c);assert.deepEqual([...data.userDictionary],['Kecskemét']);
assert.match(L.render(data,{sub:'lng-dict'},'en-US').body,/Kecskemét/);L.handle('lng-word-delete','Kecskemét',c);assert.match(L.render(data,{sub:'lng-dict'},'en-US').body,/You don&#39;t have any words/);
L.handle('lng-toggle','latin',c);assert.equal(L.prefs(data).ime,'voice');L.handle('lng-toggle','voiceIme',c);assert.equal(L.prefs(data).voiceIme,true,'the last input method stays on');
c.ui.lngDialog='ime';assert.match(L.overlay(data,c.ui,'en-US'),/Select input method/);assert.doesNotMatch(L.overlay(data,c.ui,'en-US'),/data-id="ime:latin"/);
console.log('ics-language ok');
