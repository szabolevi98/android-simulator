const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// The system keyboards: KitKat's Google Keyboard 2.0 in KLP (kk-ime.js) and Lollipop's 4.0 in LXX Light (lp-ime.js).
for(const [v,file,name,prefix] of [['4.4.4','kk-ime.js','KKIme','kime'],['5.1.1','lp-ime.js','LPIme','lime']]){
  const context={window:{}};vm.runInNewContext(fs.readFileSync(`versions/${v}/${file}`,'utf8'),context);const K=context.window[name];
  const letters=(lang,shift=false)=>Array.from(K.rows({lang,shift}).slice(0,3),row=>row.keys.filter(k=>k.type==='normal').map(k=>k.k).join(''));
  // locale_and_extra_value_to_keyboard_layout_set_map
  assert.deepEqual(letters('en'),['qwertyuiop','asdfghjkl','zxcvbnm']);
  assert.deepEqual(letters('hu'),['qwertzuiop','asdfghjkl','yxcvbnm']);
  assert.deepEqual(letters('de'),['qwertzuiop','asdfghjkl','yxcvbnm']);
  assert.deepEqual(letters('fr'),['azertyuiop','qsdfghjklm',"wxcvbn'"]);
  assert.deepEqual(letters('fr',true)[2],'WXCVBN?');
  assert.deepEqual(letters('es')[1],'asdfghjklñ');
  // Every row spans 100 %p; a 9-key second row runs from 5 to 95 %p and the number pad from 10 to 90 %p. The top row
  // carries the digit hints.
  for(const opts of [{lang:'en'},{lang:'fr'},{symbols:true},{symbols:true,more:true},{mode:'number'}])
    for(const row of K.rows(opts)){const sum=(row.x||0)+row.keys.reduce((a,k)=>a+k.w,0);assert.ok(Math.abs(sum-(opts.mode==='number'?90:row.x===5?95:100))<0.02,`${v} ${JSON.stringify(opts)} row ${sum}`);}
  assert.deepEqual(K.rows({lang:'en'})[0].keys.map(k=>k.hint).join(''),'1234567890');
  // rows_number_password: 1-9, then delete, 0 and the action key, 10 %p in; the letters as hint labels.
  const num=K.rows({mode:'number',action:'next',lang:'hu'});
  assert.deepEqual(Array.from(num,r=>r.keys.map(k=>k.k).join(' ')),['1 2 3','4 5 6','7 8 9','delete 0 next']);
  assert.equal(num[0].x,10);assert.equal(num[2].keys[0].hint,'PQRS');
  // Symbols and the more-symbols page.
  assert.equal(K.rows({symbols:true})[1].keys.map(k=>k.k).join(''),'@#$%&-+()');
  assert.equal(K.rows({symbols:true,more:true})[0].keys.map(k=>k.k).join(''),v==='4.4.4'?'~`|•√Π÷×¶∆':'~`|•√π÷×¶∆');
  assert.equal(K.rows({symbols:true})[3].keys.map(k=>k.k).join(' '),v==='4.4.4'?'symbols _ / space , . next':'symbols , _ space / . next');
  // The action key: KLP labels it in this LatinIME's words, LXX draws the action icon on the teal circle.
  const enter=(action,lang)=>K.rows({action,lang})[3].keys.at(-1);
  if(v==='4.4.4'){assert.equal(enter('done','hu').label,'Kész');assert.equal(enter('next','hu').label,'Köv.');assert.equal(enter('next','de').label,'Weiter');}
  else{assert.equal(enter('done','hu').icon,'sym_keyboard_done_lxx_light');assert.equal(enter('next','hu').icon,'sym_keyboard_next_lxx_light');assert.equal(enter('done','fr').aria,'OK');}
  const html=K.render({lang:'hu',shift:'lock'});
  assert.match(html,new RegExp(`class="${prefix}-key ${prefix}-shift ${prefix}-on`));assert.match(html,/data-lock-key="Q"/);assert.match(html,/data-lock-key="next"/);
  // Every asset the module and its stylesheet use is in the image's folder; the ICS keyboard art is gone.
  const css=fs.readFileSync(`versions/${v}/${file.replace('.js','.css')}`,'utf8'),js=fs.readFileSync(`versions/${v}/${file}`,'utf8');
  const icons=[...js.matchAll(/'(sym_keyboard_[a-z_]+)'/g)].map(m=>`${prefix}-${m[1]}.png`).concat(['done','next'].map(a=>v==='5.1.1'?`lime-sym_keyboard_${a}_lxx_light.png`:null).filter(Boolean));
  for(const f of [...css.matchAll(/assets\/([\w.-]+)/g)].map(m=>m[1]).concat(icons))assert.ok(fs.existsSync(`versions/${v}/assets/${f}`),`${v} ${f}`);
  assert.ok(!fs.readdirSync(`versions/${v}/assets`).some(f=>f.startsWith('ime-')),`${v} keeps no ICS keyboard art`);
  const lock=fs.readFileSync(`versions/${v}/lockscreen.js`,'utf8'),index=fs.readFileSync(`versions/${v}/index.html`,'utf8');
  assert.match(lock,new RegExp(`${name}\\.render\\(`));assert.doesNotMatch(lock,/credential-keyboard alpha/);
  assert.ok(index.indexOf(file)>0&&index.indexOf(file)<index.indexOf('lockscreen.js'),`${v} loads ${file} before lockscreen.js`);
}
console.log('System keyboard checks passed: layouts per language, rows, number pad, symbols, action keys and assets.');
