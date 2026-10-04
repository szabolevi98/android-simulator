/* The Nexus S image's Google apps (Gmail, Maps, Talk, YouTube, ...) register here, so the simulator wires them once:
   GBApps.register(id, {render(ctx), mounted(ctx), menu(ctx), dialog(kind, ctx), handle(action, id, ctx, button), submit(form, values, ctx),
   back(ctx), open(ctx, resume)}); every hook but render is optional. A module's texts come from its
   APK in the image (docs/apk-strings.py), falling back to the shared interface rows. */
(() => {
  'use strict';
  const apps = new Map();
  const LANGS = ['hu', 'de', 'fr', 'es'];
  // T(STRINGS)(lang, key): the APK's own translation, else the shared i18n row, else the English key.
  const texts = strings => (lang, key) => {
    const i = LANGS.indexOf(lang);
    if (strings[key]) return (i >= 0 ? strings[key][i] : strings[key][4]) || key;
    return lang === 'en' ? key : window.AndroidI18n?.t(key) ?? key;
  };
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // The launcher labels as the Nexus S image has them (_aosp/crespo/launcher.txt and the apps' own label strings): Maps 5.4,
  // Voice Search and Car Home had no Hungarian, and Google Voice's label is "Voice" everywhere. These override the shared
  // rows (which follow later images) on 2.3.6 only.
  window.AndroidI18n?.extend([
    ['Maps', 'Maps', 'Maps', 'Maps', 'Maps'], ['Places', 'Places', 'Places', 'Adresses', 'Sitios'], ['Latitude', 'Latitude', 'Latitude', 'Latitude', 'Latitude'],
    ['Voice Search', 'Voice Search', 'Sprachsuche', 'Recherche vocale', 'Búsqueda por voz'], ['Voice', 'Voice', 'Voice', 'Voice', 'Voice'],
    ['Car Home', 'Car Home', 'Automodus', 'Mode Voiture', 'Car Home']
  ]);
  window.GBApps = {
    register(id, module) { apps.set(id, module); },
    has: id => apps.has(id),
    get: id => apps.get(id),
    ids: () => [...apps.keys()],
    texts, e
  };
})();
