const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},Intl};
vm.runInNewContext(fs.readFileSync('versions/2.3.6/gb-strings-contacts.js','utf8'),context);
vm.runInNewContext(fs.readFileSync('versions/2.3.6/gb-phone.js','utf8'),context);
const P=context.window.GBPhone,people=[{id:1,name:'Mom',phone:'1',favorite:true},{id:2,name:'Alex',phone:'2'},{id:3,name:'adam',phone:'3'}];
const ctx=(o={})=>({lang:'en',locale:'en',t:k=>k,now:1e12,tab:'dialpad',dial:'',calls:[],contactOf:n=>people.find(p=>p.phone===n),people,...o});
// Dialtacts tab order and labels (framework tab_indicator), translated from the Contacts app.
let html=P.render(ctx());assert.deepEqual([...html.matchAll(/data-id="([a-z]+)"><img src="assets\/gb-c-ic_tab/g)].map(m=>m[1]),['dialpad','history','contacts','favorites']);
assert.match(html,/<span>Phone<\/span>/);assert.match(P.render(ctx({lang:'hu'})),/Telefon/);
// Dial pad: 12 keys with white digits and the black pressed art, then voicemail / dial / delete.
assert.equal((html.match(/class="gbp-key"/g)||[]).length,12);assert.match(html,/dial_num_1_no_vm_wht/);assert.match(html,/dial_num_pound_blk/);
// Call log: newest first, contact name with the outgoing arrow, empty text when there are no calls.
html=P.render(ctx({tab:'history',calls:[{number:'1',time:1e12-7200000},{number:'99',time:1e12-60000}]}));
assert.ok(html.indexOf('>99<')<html.indexOf('>Mom<'));assert.match(html,/ic_call_log_list_outgoing_call/);assert.match(html,/2 hours ago/);
assert.match(P.render(ctx({tab:'history'})),/Call log is empty\./);
// Contacts: alphabetical with section headers; favorites only starred.
html=P.render(ctx({tab:'contacts'}));assert.deepEqual([...html.matchAll(/gbp-section">([A-Z])/g)].map(m=>m[1]),['A','M']);
assert.ok(html.indexOf('adam')<html.indexOf('Alex'));
html=P.render(ctx({tab:'favorites'}));assert.match(html,/Mom/);assert.doesNotMatch(html,/Alex/);
// Details and menus.
assert.match(P.render(ctx({detail:people[0]})),/btn_star_big_on/);
assert.deepEqual(JSON.parse(JSON.stringify(P.menu(ctx({dial:'5'})).map(i=>i.title))),['Add to contacts','Add 2-sec pause','Add wait']);
assert.equal(P.menu(ctx()).length,0);assert.equal(P.menu(ctx({tab:'history',calls:[{number:'1',time:1}]}))[0].action,'gbp-clear-log');
console.log('gb-phone ok');
