const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// strings.js: the one reader of the named-language tables (audit point 10).
const context={window:{},Intl};
vm.runInNewContext(fs.readFileSync('strings.js','utf8'),context);
const S=context.window.AndroidStrings;
const T=S.table('test',{
  'Install':{res:'Vending:install',hu:'Telepítés',de:'Installieren',fr:'Installer',es:'Instalar'},
  'Uninstall':{res:'Vending:uninstall',en:'Remove',hu:'Eltávolítás',de:'Deinstallieren',fr:'Désinstaller',es:'Desinstalar'},
  '%1$s of %2$s':{res:'framework:of',hu:'%2$s / %1$s',de:'%1$s von %2$s',fr:'%1$s sur %2$s',es:'%1$s de %2$s'},
  'apps':{res:'Vending:@plurals/apps',en:{one:'%d app',other:'%d apps'},hu:{other:'%d alkalmazás'},de:{one:'%d App',other:'%d Apps'}},
  'Demo':{own:true,hu:'Demó',de:'Demo',fr:'Démo',es:'Demo'}
});
// Named languages, locales, English (the image's own when it differs from the key), unknown keys.
assert.equal(T.t('Install','hu'),'Telepítés');assert.equal(T.t('Install','de-DE'),'Installieren');assert.equal(T.t('Install','en'),'Install');
assert.equal(T.t('Uninstall','en'),'Remove');assert.equal(T.t('Uninstall','xx'),'Remove');assert.equal(T.t('Nope','hu'),'Nope');
assert.ok(T.has('Demo'));assert.ok(!T.has('Nope'));assert.equal(S.tables.test,T);
// Without a language the simulator's current one is used.
context.window.AndroidI18n={language:'fr'};assert.equal(T.t('Install'),'Installer');delete context.window.AndroidI18n;assert.equal(T.t('Install'),'Install');
// Android's placeholders: positional, sequential, %%, a precision, the Market's ^1; a missing argument stays visible.
assert.equal(T.fmt('%1$s of %2$s','hu','3','10'),'10 / 3');
assert.equal(S.format('%s and %d%%','a',5),'a and 5%');assert.equal(S.format('%.1f MB',2.345),'2.3 MB');assert.equal(S.format('^1 by ^2','A','B'),'A by B');
assert.equal(S.format('%1$s %2$s','x'),'x %2$s');assert.equal(S.format('100% sure'),'100% sure');
// Plurals through Intl.PluralRules, with the English forms as the fallback for a language without that quantity.
assert.equal(T.plural('apps',1,'en'),'1 app');assert.equal(T.plural('apps',3,'en'),'3 apps');assert.equal(T.plural('apps',1,'hu'),'1 alkalmazás');
assert.equal(T.plural('apps',1,'de'),'1 App');assert.equal(T.plural('apps',2,'fr'),'2 apps');
// The legacy [hu, de, fr, es, en?] rows convert to the named form.
assert.deepEqual(JSON.parse(JSON.stringify(S.fromRows({A:['a','b','c','d'],B:['a','b','c','d','Bee']}))),{A:{hu:'a',de:'b',fr:'c',es:'d'},B:{en:'Bee',hu:'a',de:'b',fr:'c',es:'d'}});
// A width with zero padding, the grouping flag (the number arrives grouped), and the CLDR category Android picks plurals by.
assert.equal(S.format('%2$d:%5$02d',undefined,3,undefined,undefined,7),'3:07');assert.equal(S.format('%1$,d views','1,234'),'1,234 views');
assert.equal(S.quantity(1,'en'),'one');assert.equal(S.quantity(0,'en'),'other');assert.equal(S.quantity(0,'fr'),'one');assert.equal(S.quantity(2,'hu'),'other');
console.log('strings ok');
