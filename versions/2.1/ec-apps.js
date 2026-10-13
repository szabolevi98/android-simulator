/* Android 2.1: the image's launcher entries (every enabled LAUNCHER activity of /system/app, docs/tools/launcher-apps.py),
   with the label resource each one shows (ec-strings-apps.js) and its hdpi icon (docs/tools/image-icons.py, app-<id>.png).
   view is the simulator screen it opens. All applications lists them by label, as Launcher2's AllAppsList sorts. */
(() => {
  'use strict';
  const APPS = [
    ['browser', 'Browser/application_name'], ['calculator', 'Calculator/app_name'], ['calendar', 'Calendar/app_label'],
    ['camera', 'Camera/camera_label'], ['car-home', 'CarDock/application_name'], ['clock', 'DeskClock/app_label'],
    ['phone', 'Contacts/launcherDialer'], ['contacts', 'Contacts/contactsList'], ['email', 'Email/app_name'],
    ['facebook', 'Facebook/app_name'], ['gallery', 'Gallery3D/app_name'], ['news-weather', 'GenieWidget/app_name'],
    ['gmail', 'Gmail/activity_gmail'], ['goggles', 'GoogleGoggles/app_name_icon'], ['maps', 'Maps/MAPS_APP_NAME'],
    ['messaging', 'Mms/app_label'], ['music', 'Music/musicbrowserlabel'], ['settings', 'Settings/settings_label'],
    ['talk', 'Talk/app_label'], ['market', 'Vending/homepage_activity_name'], ['voice-dialer', 'VoiceDialer/voiceDialer'],
    ['voice-search', 'VoiceSearchWithKeyboard/appName'], ['youtube', 'YouTube/application_name'],
    ['amazon-mp3', 'com.amazon.mp3/dmusic_main_launcher_name'], ['google-voice', 'googlevoice/app_icon_name']
  ].map(([id, label]) => ({id, label, icon: `app-${id}.png`, view: id}));
  const T = () => EC.text('apps');
  EC.apps = {
    list: APPS,
    get: id => APPS.find(app => app.id === id),
    label: id => { const app = APPS.find(a => a.id === id); return app ? T().t(app.label) : id; },
    // Collator order in the simulator's language, like the launcher's ApplicationInfo sort.
    sorted: () => [...APPS].sort((a, b) => T().t(a.label).localeCompare(T().t(b.label), EC.context?.locale?.() || 'en'))
  };
})();
