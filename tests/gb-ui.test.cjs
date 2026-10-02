const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};vm.runInNewContext(fs.readFileSync('versions/2.3.6/gb-ui.js','utf8'),context);
const ui=context.window.GBUI,t=key=>key,plain=v=>JSON.parse(JSON.stringify(v));
// IconMenuView.layoutItemsUsingGravity: leftovers go to the bottom rows.
assert.deepEqual(plain(ui.rows(1)),[1]);assert.deepEqual(plain(ui.rows(3)),[3]);assert.deepEqual(plain(ui.rows(4)),[2,2]);
assert.deepEqual(plain(ui.rows(5)),[2,3]);assert.deepEqual(plain(ui.rows(6)),[3,3]);
const items=n=>Array.from({length:n},(_,i)=>({action:'a',id:i,title:'Item '+i,icon:'ic_menu_add'}));
let html=ui.menu(items(8),t);assert.equal((html.match(/gbmenu-item/g)||[]).length,6);assert.match(html,/gb-menu-more/);assert.match(html,/Item 4/);assert.doesNotMatch(html,/Item 5/);
assert.match(ui.menu([{action:'x',title:'T',icon:'phone.png'}],t),/src="assets\/phone\.png"/);
// AlertController.setBackground: title dark top, list bright, buttons bottom medium; a lone message is full dark.
html=ui.dialog({t,title:'Title',items:items(2),buttons:[{action:'ok',title:'OK'}]});
assert.match(html,/gbdlg-s-title gbdlg-bg-top-dark/);assert.match(html,/gbdlg-s-list gbdlg-bg-center-bright/);assert.match(html,/gbdlg-s-buttons gbdlg-bg-bottom-medium/);
assert.match(ui.dialog({t,message:'Hello'}),/gbdlg-s-message gbdlg-bg-full-dark/);
assert.match(ui.dialog({t,title:'T',items:items(1)}),/gbdlg-s-list gbdlg-bg-bottom-bright/);
assert.match(ui.dialog({t,title:'T',message:'M'}),/gbdlg-s-message gbdlg-bg-bottom-dark/);
html=ui.dialog({t,title:'T',items:items(3),choice:'single',selected:1});assert.equal((html.match(/btn_radio_on/g)||[]).length,1);
assert.match(ui.dialog({t,title:'T',items:items(1),buttons:[{action:'a',title:'A'}]}),/gbdlg-buttons single/);
console.log('gb-ui ok');
