const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// The shared rows, then a version's image-strings.js, as the page loads them.
function load(version,language){
  const store={'android-time-machine-language':language};
  const context={window:{},document:{documentElement:{},querySelectorAll:()=>[]},localStorage:{getItem:k=>store[k]??null,setItem(){}}};
  vm.runInNewContext(fs.readFileSync('i18n.js','utf8'),context);
  vm.runInNewContext(fs.readFileSync(`versions/${version}/image-strings.js`,'utf8'),context);
  const i18n=context.window.AndroidI18n;i18n.setLanguage(language);return i18n;
}
for(const version of ['2.3.6','4.0.4','4.3']){
  const hu=load(version,'hu');
  // Android 4.x Hungarian addresses the user formally (Settings lockpassword_confirm_your_pin_header).
  assert.equal(hu.t('Confirm your PIN'),'PIN-kód megerősítése',version);
  // The in-call Mute button reads Phone's onscreenMuteText; Settings' silent-mode choice keeps the shared row.
  assert.equal(hu.t('Mute','Phone'),'Lezárás',version);
  assert.equal(hu.t('Mute'),'Némítás',version);
  assert.equal(hu.t('Speaker','Phone'),hu.t('Speaker'),'a context without its own row falls back to the plain row');
  assert.equal(load(version,'en').t('Mute','Phone'),'Mute');
  assert.ok(!/\\'/.test(fs.readFileSync(`versions/${version}/image-strings.js`,'utf8')),'no escaped apostrophes');
}
assert.equal(load('4.3','hu').t('Draw pattern to unlock'),'Rajzolja le a mintát a feloldáshoz');
console.log('Image string checks passed: formal Hungarian, the Phone context for Mute and the English fallback.');
