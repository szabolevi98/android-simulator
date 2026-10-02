const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};
for(const f of ['gb-strings-settings2.js','gb-strings-accounts.js','gb-settings-pages.js'])vm.runInNewContext(fs.readFileSync(`versions/2.3.6/${f}`,'utf8'),context);
const G=context.window.GBSettingsPages;
const icon='<span class="app-icon"></span>';
const apps=[{id:'phone',name:'Phone',icon},{id:'browser',name:'Browser',icon},{id:'calculator',name:'Calculator',icon}];
const usage=[{id:'screen',name:'Display',icon,percent:40,details:[['usage_type_on_time','1h']],action:'settings-sub',actionLabel:'battery_action_display',actionId:'display'},{id:'app:browser',app:'browser',name:'Browser',icon,percent:10,details:[['usage_type_cpu','3s']]}];
const ctx=(o={})=>({lang:'en',locale:'en-US',tab:'downloaded',sortBySize:false,apps,running:[{...apps[0],ram:3200000,uptime:'12:30'}],app:apps[1],isRunning:false,cleared:false,permissions:[['Network communication','full Internet access']],usage,item:'screen',onBattery:'3h',eraseExternal:false,usedText:'312MB',freeText:'1.67GB',...o});
// Formatter sizes and stable app sizes.
assert.equal(G.size(1300000),'1.24MB');assert.equal(G.size(2048),'2.00KB');assert.deepEqual({...G.sizes('browser')},{...G.sizes('browser')});
// ManageApplications: tabs, empty Downloaded, All sorted by name or size, the storage bar, the Sort menu.
let html=G.render('apps',ctx());
assert.match(html,/>Downloaded</);assert.match(html,/>USB storage</);assert.match(html,/>Running</);assert.match(html,/>All</);assert.match(html,/No applications\./);assert.match(html,/Internal storage/);assert.match(html,/312MB used/);assert.match(html,/1\.67GB free/);
html=G.render('apps',ctx({tab:'all'}));
assert.ok(html.indexOf('Browser')<html.indexOf('Calculator')&&html.indexOf('Calculator')<html.indexOf('>Phone<'));
assert.equal(G.menu('apps',ctx()).at(0).title,'Sort by size');assert.equal(G.menu('apps',ctx({sortBySize:true})).at(0).title,'Sort by name');assert.equal(G.menu('apps',ctx({tab:'running'})).length,0);
// Running services.
html=G.render('running',ctx());assert.match(html,/1 process and 1 service/);assert.match(html,/12:30/);assert.match(html,/RAM/);
// InstalledAppDetails: snippet, buttons, storage, cache, defaults, permissions; cleared data.
html=G.render('app-info',ctx());
assert.match(html,/Application info/);assert.match(html,/version 2\.3\.6/);assert.match(html,/gbsp-force-stop" data-id="browser" disabled/);assert.match(html,/>Uninstall<\/button>/);
assert.match(html,/>Total</);assert.match(html,/>Clear data</);assert.match(html,/>Clear cache</);assert.match(html,/No defaults set\./);assert.match(html,/full Internet access/);
assert.match(G.render('app-info',ctx({cleared:true})),/gbsp-clear-data" data-id="browser" disabled/);
// Battery use and details.
html=G.render('battery',ctx());assert.match(html,/3h on battery/);assert.match(html,/Battery use since unplugged/);assert.match(html,/<b>40%<\/b>/);assert.match(html,/width:25\.0%/);
html=G.render('battery-detail',ctx());assert.match(html,/Battery use details/);assert.match(html,/Time on/);assert.match(html,/Display settings/);
assert.match(G.render('battery-detail',ctx({item:'app:browser'})),/Force stop/);
// Legal, licenses, factory data reset.
assert.match(G.render('about-legal',ctx()),/Open source licenses/);assert.match(G.render('gb-licenses',ctx()),/Notices for files/);
html=G.render('reset-info',ctx());assert.match(html,/Factory data reset/);assert.match(html,/Erase USB storage/);assert.match(html,/>Reset phone</);
assert.match(G.render('gb-reset-final',ctx()),/factory-reset-confirmed">Erase everything</);
// Dialogs and translations.
assert.equal(G.dialog('force-stop',ctx()).title,'Force stop');assert.equal(G.dialog('clear-data',ctx()).buttons[0].action,'gbsp-clear-data-ok');
assert.equal(G.text('hu','filter_apps_all'),'Összes');
// Accounts & sync: general settings, the account row, the account screen with its sync items, menu and dialogs.
const sx=(o={})=>ctx({settings:{backgroundData:true,autoSync:true},account:'demo@example.com',accountRemoved:false,syncing:false,lastSync:'10/2/2026, 3:00 PM',...o});
html=G.render('sync',sx());assert.match(html,/Accounts &amp; sync settings/);assert.match(html,/General sync settings/);assert.match(html,/Background data/);assert.match(html,/Auto-sync/);assert.match(html,/Sync is ON/);assert.match(html,/ic_sync_green/);assert.match(html,/Add account/);
assert.match(G.render('sync',sx({settings:{autoSync:false}})),/Sync is OFF/);assert.doesNotMatch(G.render('sync',sx({accountRemoved:true})),/gbacc-account/);
html=G.render('sync-account',sx());assert.match(html,/Data &amp; synchronization/);assert.match(html,/Sync Contacts/);assert.match(html,/Sync Calendar/);assert.match(html,/Sync Email/);assert.match(html,/10\/2\/2026, 3:00 PM/);assert.match(html,/Remove account/);
assert.match(G.render('sync-account',sx({syncing:true})),/Touch to sync now/);assert.equal(G.menu('sync-account',sx()).at(0).title,'Sync now');assert.equal(G.menu('sync-account',sx({syncing:true})).at(0).title,'Cancel sync');
assert.equal(G.dialog('background',sx()).title,'Attention');assert.equal(G.dialog('remove',sx()).buttons[0].action,'gbacc-remove-ok');
console.log('gb-settings-pages ok');
