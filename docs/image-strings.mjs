/* Generates versions/<version>/image-strings.js: the shared i18n.js rows whose English text a version's factory image
   has, with the Hungarian, German, French and Spanish text that image ships (Android 4.x Hungarian addresses the user
   formally, so the shared informal rows read wrong on these phones). Run from the repository root:
       node docs/image-strings.mjs 4.3
   The index comes from docs/image-index.py over the extracted image (see its header).
   A row is only taken from the APKs whose screens use it: every version file that quotes the English text names its
   APKs in FILES (a file not listed there counts as the system screens, GENERAL). When those APKs translate the text in
   more than one way the row stays as i18n.js has it, unless PIN names the resource to use; the docs/image-strings-
   <version>.tsv report lists every change and every such skip. KEEP lists rows left alone on purpose. */
import fs from 'fs';

const GENERAL = ['framework', 'SystemUI', 'Settings', 'Launcher2', 'Phone', 'Bluetooth', 'PackageInstaller', 'DownloadProviderUi',
  'CertInstaller', 'VpnDialogs', 'Calculator', 'LatinImeGoogle', 'LiveWallpapersPicker'];
const WALLPAPERS = ['LiveWallpapersPicker', 'LiveWallpapers', 'PhaseBeam', 'HoloSpiralWallpaper', 'NoiseField', 'VisualizationWallpapers'];
const PHONE = ['Phone', 'Dialer', 'Contacts', 'framework'];
const FILES = {
  'calendar.js': ['CalendarGoogle', 'framework'], 'desk-clock.js': ['DeskClockGoogle', 'framework'], 'jb-deskclock.js': ['DeskClockGoogle', 'framework'],
  'email.js': ['EmailGoogle', 'framework'], 'jb-camera.js': ['GalleryGoogle', 'CameraGoogle'], 'jb-gallery.js': ['GalleryGoogle', 'framework'],
  'jb-dialer.js': PHONE, 'phone-call.js': PHONE, 'people.js': ['Contacts', 'framework'], 'messaging.js': ['Mms', 'framework'],
  'jb-play.js': ['Phonesky'], 'play-store.js': ['Phonesky'], 'live-wallpapers.js': WALLPAPERS,
  'jb-keyguard.js': ['framework', 'Settings'], 'lockscreen.js': ['framework', 'Settings'],
  'jb-shade.js': ['SystemUI', 'framework'], 'jb-recents.js': ['SystemUI'], 'jb-search.js': ['SystemUI', 'framework'], 'beanbag.js': ['SystemUI'],
  'global-actions.js': ['framework'], 'volume-panel.js': ['framework', 'SystemUI'],
  'settings-detail.js': ['Settings', 'Phone', 'framework', 'Bluetooth'], 'settings-system.js': ['Settings', 'Phone', 'framework', 'Bluetooth'], 'jb-devopts.js': ['Settings'],
  'jb-launcher.js': ['Launcher2', 'framework'], 'launcher-clings.js': ['Launcher2'], 'launcher-folders.js': ['Launcher2'],
  'widgets.js': ['Launcher2', 'CalendarGoogle', 'GalleryGoogle', 'DeskClockGoogle'],
  'media.js': ['GalleryGoogle', 'CameraGoogle', 'framework'], 'ics-play.js': ['Phonesky'], 'nyandroid.js': ['SystemUI'],
  // Gingerbread screens (versions/2.3.6).
  'gb-browser.js': ['Browser', 'framework'], 'gb-calendar.js': ['CalendarGoogle', 'framework'], 'gb-camera.js': ['CameraGoogle'],
  'gb-contact-editor.js': ['Contacts', 'framework'], 'gb-deskclock.js': ['DeskClockGoogle', 'framework'], 'gb-downloads.js': ['DownloadProviderUi'],
  'gb-email.js': ['EmailGoogle', 'framework'], 'gb-gallery.js': ['Gallery3DGoogle'], 'gb-keyguard.js': ['framework'], 'gb-launcher.js': ['Launcher2', 'framework'],
  'gb-mms.js': ['Mms', 'framework'], 'gb-phone.js': ['Phone', 'Contacts', 'framework'], 'gb-search.js': ['GoogleQuickSearchBox'],
  'gb-settings.js': ['Settings', 'framework'], 'gb-settings-pages.js': ['Settings', 'framework'], 'gb-statusbar.js': ['framework'], 'gb-ui.js': ['framework'],
  'gb-widgets.js': ['Launcher2', 'CalendarGoogle', 'Gallery3DGoogle', 'MusicGoogle'],
  // Market 3.x is rebuilt from period material; the image's Vending is an older Market.
  'gb-market.js': [],
  // Screens with no counterpart in the image: AOSP Music (the 4.x images have Play Music).
  'music.js': [], 'browser-session.js': [], 'transitions.js': [], 'calculator-engine.js': [],
};
const STOCK = {
  'kk-dialer.js': ['GoogleDialer', 'TeleService', 'Contacts', 'framework'], 'jb-dialer.js': ['GoogleDialer', 'TeleService', 'Contacts', 'framework'],
  'phone-call.js': ['GoogleDialer', 'TeleService', 'framework'], 'people.js': ['Contacts', 'framework'],
  'kk-deskclock.js': ['DeskClockGoogle', 'framework'], 'kk-downloads.js': ['DownloadProviderUi', 'DocumentsUI'], 'kk-email.js': ['EmailGoogle', 'framework'],
  'kk-egg.js': ['SystemUI'], 'kk-play.js': ['Phonesky'], 'kk-wallpaper-picker.js': ['GoogleHome', 'WallpaperCropper'], 'gel-now.js': ['Velvet'],
  'kk-launcher.js': ['GoogleHome', 'framework'], 'lp-launcher.js': ['GoogleHome', 'framework'], 'launcher-clings.js': ['GoogleHome'], 'launcher-folders.js': ['GoogleHome'],
  'widgets.js': ['GoogleHome', 'CalendarGoogle', 'DeskClockGoogle'], 'kk-camera.js': ['GoogleCamera'], 'gmail.js': ['Gmail2'], 'hangouts.js': ['Hangouts'],
  'chrome.js': ['Chrome'], 'photos.js': ['PlusOne'], 'play-apps.js': ['Music2', 'Videos', 'Books', 'PlayGames'],
  // Simulated stock apps with texts of their own, and the AOSP Messaging kept in the drawer (the image has none).
  'kk-extra-apps.js': [], 'stock-apps.js': [], 'messaging.js': [], 'media.js': ['GalleryGoogle', 'framework'],
};
const VERSIONS = {
  // simulator.js also draws the Browser; the Nexus 4 image has Chrome instead, so 4.3 keeps the Browser rows.
  '2.3.6': {device: 'crespo', build: 'Nexus S GRK39F', general: ['Browser', 'Contacts', 'Mms', 'MusicGoogle', 'AccountAndSyncSettings']},
  '4.0.4': {device: 'maguro', build: 'Galaxy Nexus IMM76I', general: ['BrowserGoogle']},
  '4.3': {device: 'mako', build: 'Nexus 4 JWR66Y', general: []},
  // KitKat and Lollipop draw the stock Nexus 5 / Nexus 6 (Google apps); their own files map to those APKs here.
  '4.4.4': {device: 'hammerhead', build: 'Nexus 5 KTU84P', general: ['GoogleHome', 'Velvet', 'TeleService', 'Keyguard'], files: {...STOCK,
    'kk-keyguard.js': ['Keyguard', 'framework', 'Settings'], 'lockscreen.js': ['Keyguard', 'framework', 'Settings'], 'kk-devopts.js': ['Settings'],
    'kk-gallery.js': ['GalleryGoogle', 'framework'], 'kk-recents.js': ['SystemUI'], 'kk-search.js': ['SystemUI', 'framework'], 'kk-shade.js': ['SystemUI', 'framework']}},
  '5.1.1': {device: 'shamu', build: 'Nexus 6 LMY48Y', general: ['GoogleHome', 'Velvet', 'TeleService', 'Telecom'], files: {...STOCK,
    'calendar.js': ['CalendarGooglePrebuilt', 'framework'], 'email.js': ['PrebuiltEmailGoogle', 'framework'], 'kk-email.js': ['PrebuiltEmailGoogle', 'framework'],
    'lp-email.js': ['PrebuiltEmailGoogle', 'framework'], 'gmail.js': ['PrebuiltGmail'], 'people.js': ['GoogleContacts', 'framework'], 'photos.js': ['Photos', 'PlusOne'],
    'lp-camera.js': ['GoogleCamera'], 'lp-dialer.js': ['GoogleDialer', 'TeleService', 'Telecom', 'framework'], 'lp-egg.js': ['SystemUI'],
    'lp-keyguard.js': ['SystemUI', 'framework', 'Settings'], 'jb-keyguard.js': ['SystemUI', 'framework', 'Settings'], 'lockscreen.js': ['SystemUI', 'framework', 'Settings'],
    'lp-recents.js': ['SystemUI'], 'lp-shade.js': ['SystemUI', 'framework'], 'lp-qs-icons.js': ['SystemUI'], 'lp-settings-pages.js': ['Settings', 'framework'],
    'lp-devopts.js': ['Settings'], 'lp-gallery.js': ['GalleryGoogle', 'framework'], 'lp-search.js': ['SystemUI', 'framework'],
    'lp-downloads.js': ['DownloadProviderUi', 'DocumentsUI'], 'lp-play.js': ['Phonesky'], 'lp-wallpaper-picker.js': ['GoogleHome', 'WallpaperCropper'],
    'lp-extra-apps.js': [], 'lp-ripple.js': [], 'lp-scroll.js': [], 'messaging.js': ['PrebuiltBugle']},
    keep: {'Forward': "Chrome's toolbar shares it with Email; only Email's text is in the image"}},
};
// English text -> 'apk:resource' when the screens' APKs disagree.
const PIN = {
  'Continue': 'Settings:lockpassword_continue_label', 'Device administrators': 'Settings:manage_device_admin',
  'USB tethering': 'Settings:tether_settings_title_usb', 'Bluetooth tethering': 'Settings:tether_settings_title_bluetooth',
  'IP address': 'Settings:wifi_ip_address', 'Speaker': 'Phone:audio_mode_speaker', 'Font size': 'Settings:title_font_size',
  'Restrict background data': 'Settings:data_usage_menu_restrict_background', 'Running': 'Settings:filter_apps_running',
  'App info': 'SystemUI:status_bar_recent_inspect_item_title', 'Charging': 'Settings:battery_info_status_charging',
  'Use details': 'Settings:details_title', 'Night mode': 'DeskClockGoogle:menu_item_night_mode', 'Done': 'framework:action_mode_done',
  'Backup & reset': 'Settings:privacy_settings', 'Screen lock': 'Settings:unlock_set_unlock_launch_picker_title',
  'Allow mock locations': 'Settings:allow_mock_location', 'Location access': 'Settings:location_settings_title',
  'Wallpapers': 'Launcher2:pick_wallpaper', 'Data roaming': 'Settings:roaming', 'Internal storage': 'Settings:internal_storage',
  'Installed': 'Phonesky:my_apps_tab_installed', 'Open source licenses': 'Settings:settings_license_activity_title',
  'Compose': 'EmailGoogle:compose_action', 'Picture size': 'GalleryGoogle:pref_camera_picturesize_title', 'Rotate': 'GalleryGoogle:rotate',
  'Crop': 'GalleryGoogle:crop', 'Vibrate when ringing': 'Settings:vibrate_when_ringing_title',
  'Search for devices': 'Settings:bluetooth_search_for_devices', 'Repetition': 'CalendarGoogle:repeats_label', 'Label': 'DeskClockGoogle:label',
  'Auto-rotate screen': 'Settings:accelerometer_title', 'Advanced': 'Settings:wifi_menu_advanced', 'Forget': 'Settings:wifi_forget',
  'Connect': 'Settings:wifi_connect', 'Search contacts': 'Contacts:searchHint',
  // App names as the images' launchers show them.
  'Play Music': 'Music2:launcher_name', 'Play Books': 'Books:main_activity_name', 'Google Play Movies': 'Videos:long_app_name',
  'Messenger': 'PlusOne:realtimechat_launcher_title', 'Places': 'Maps:PLACES_APP_NAME', 'Local': 'Maps:PLACES_APP_NAME', 'Latitude': 'Maps:LATITUDE_APP_NAME',
  'Google Search': 'GoogleQuickSearchBox:google_app_label', 'Talk': 'Talk:app_label', 'Play Movies': 'Videos:application_name', 'Voice Dialer': 'VoiceDialer:voiceDialer', 'Navigation': 'Maps:da_navigation',
};
// Rows kept as i18n.js has them: English text -> why.
const KEEP = {
  'Lock screen': "the simulator header's power button (an action), not Android's lock-screen noun",
  'Keep': 'the Google Keep app name; the image only has the Downloads button of that name',
  'Mute': "Settings' silent-mode choice; the in-call button gets the Phone text through CONTEXT below",
};
// Texts one APK translates apart from the rest: written as '<context>|<English>' rows that i18n.t(text, context) reads.
const CONTEXT = {
  'Mute': ['Phone', 'Phone:onscreenMuteText', 'GoogleDialer:onscreenMuteText'],  // the in-call button ('Lezárás' in Hungarian), not Settings' silent mode
};

const version = process.argv[2], config = VERSIONS[version];
if (!config) { console.error('usage: node docs/image-strings.mjs <' + Object.keys(VERSIONS).join('|') + '>'); process.exit(1); }
const rows = eval(fs.readFileSync('i18n.js', 'utf8').match(/const rows = (\[[\s\S]*?\n  \]);/)[1]);
const index = JSON.parse(fs.readFileSync(`_aosp/${config.device}/strings-index.json`, 'utf8'));
const dir = `versions/${version}/`;
const sources = fs.readdirSync(dir).filter(name => /\.(js|html)$/.test(name) && !/^(image-strings|gb-strings-.*|gb-settings-strings|lp-strings)\.js$/.test(name)).map(name => [name, fs.readFileSync(dir + name, 'utf8')]);
const LANGS = ['hu', 'de', 'fr', 'es'];
const quoted = text => [`'${text.replaceAll("'", "\\'")}'`, `"${text.replaceAll('"', '\\"')}"`, '`' + text + '`', `>${text}<`];
const out = [], report = [], seen = new Set();
for (const row of rows) {
  const en = row[0];
  if (seen.has(en) || KEEP[en] || config.keep?.[en] || /%|<\/?[a-z]/i.test(en)) continue;
  seen.add(en);
  const all = (index[en] || []).filter(hit => LANGS.every(lang => hit[2][lang]));
  if (!all.length) continue;
  const users = sources.filter(([, text]) => quoted(en).some(q => text.includes(q))).map(([name]) => name);
  const apps = new Set(users.flatMap(name => (config.files || {})[name] ?? FILES[name] ?? [...GENERAL, ...config.general]));
  let hits = all.filter(hit => apps.has(hit[0]));
  if (PIN[en]) hits = all.filter(hit => `${hit[0]}:${hit[1]}` === PIN[en]);
  if (!hits.length) continue;
  const variants = new Map(hits.map(hit => [JSON.stringify(LANGS.map(lang => hit[2][lang])), hit]));
  if (variants.size > 1) { report.push(`SKIP\t${en}\t${row[1]}\t${[...variants.values()].map(hit => `${hit[0]}:${hit[1]}=${hit[2].hu}`).join(' / ')}\t[${users.join(' ')}]`); continue; }
  const [apk, name, tr] = hits[0];
  if (LANGS.some(lang => tr[lang] !== tr[lang].trim())) { report.push(`SKIP\t${en}\t${row[1]}\t${apk}:${name} has outer spaces`); continue; }
  // Settings' header rows are list separators (textAllCaps), so their translations show upper-case as well.
  const caps = /^header_category_/.test(name);
  const next = [en, ...LANGS.map(lang => caps ? tr[lang].toLocaleUpperCase(lang) : tr[lang])];
  if (next.every((text, i) => text === row[i])) continue;
  out.push(next);
  report.push(`${apk}:${name}\t${en}\t${LANGS.map((lang, i) => row[i + 1] === next[i + 1] ? '=' : `${row[i + 1]} -> ${next[i + 1]}`).join(' | ')}\t[${users.join(' ')}]`);
}
for (const [en, [context, ...resources]] of Object.entries(CONTEXT)) {
  const hit = (index[en] || []).find(hit => resources.includes(`${hit[0]}:${hit[1]}`) && LANGS.every(lang => hit[2][lang])), resource = hit && `${hit[0]}:${hit[1]}`;
  if (hit) { out.push([`${context}|${en}`, ...LANGS.map(lang => hit[2][lang])]); report.push(`${resource}\t${context}|${en}\t${LANGS.map(lang => hit[2][lang]).join(' | ')}`); }
}
const head = `/* Generated by docs/image-strings.mjs from the ${config.build} factory image (values, -hu, -de, -fr, -es). Do not edit. */\n`;
fs.writeFileSync(`${dir}image-strings.js`, head + 'window.AndroidI18n?.extend([\n' + out.map(row => '  ' + JSON.stringify(row)).join(',\n') + '\n]);\n');
fs.writeFileSync(`docs/image-strings-${version}.tsv`, report.join('\n') + '\n');
console.log(out.length, 'rows,', report.filter(line => line.startsWith('SKIP')).length, 'skipped');
