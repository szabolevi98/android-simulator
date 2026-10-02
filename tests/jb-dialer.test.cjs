const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};vm.runInNewContext(fs.readFileSync('versions/4.3/jb-dialer.js','utf8'),context);
const d=context.window.JBDialer,plain=v=>JSON.parse(JSON.stringify(v));
// SmartDialNameMatcher: word prefixes that may run on into following words, accents folded first.
assert.deepEqual(plain(d.matchName('Alex Morgan','25').positions),[0,1]);
assert.deepEqual(plain(d.matchName('Alex Morgan','26').positions),[0,5]);
assert.ok(d.matchName('Márta Kovács','627'));
assert.equal(d.matchName('Alex Morgan','99'),null);
assert.equal(d.matchName('Alex Morgan','2a'),null);
assert.ok(d.matchNumber('+36 30 123 4567','3630')&&d.matchNumber('+36 30 123 4567','30'));
const contacts=[{name:'Alex Morgan',phone:'202-555-0148'},{name:'Mom',phone:'202-555-0107',favorite:true},{name:'Márta Kovács',phone:'+36 30 123 4567'}];
assert.deepEqual(plain(d.suggestions(contacts,'6').map(x=>x.person.name)),['Mom','Márta Kovács','Alex Morgan']);
assert.deepEqual(plain(d.SLOT_ORDER),[1,0,2]);
const html=d.render(contacts,'6',k=>k),names=[...html.matchAll(/jb-smartdial-name">(.*?)<\/span>/g)].map(m=>m[1].replace(/<\/?b>/g,''));
assert.deepEqual(names,['Márta Kovács','Mom','Alex Morgan'],'best match in the middle slot');
assert.ok(html.includes('data-action="smartdial-call" data-id="202-555-0107"'));
assert.equal((d.render(contacts,'',k=>k).match(/empty/g)||[]).length,3,'empty query leaves three blank slots');
console.log('JB dialer checks passed: T9 name and number matching, ranking and slot order.');
