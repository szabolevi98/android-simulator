/* The Nexus S image's Google apps (Gmail, Maps, Talk, YouTube, ...) register here, so the simulator wires them once:
   GBApps.register(id, {render(ctx), mounted(ctx), menu(ctx), dialog(kind, ctx), handle(action, id, ctx, button), submit(form, values, ctx),
   back(ctx), open(ctx, resume)}); every hook but render is optional. A module's texts come from its
   APK in the image (docs/tools/apk-strings.py), falling back to the shared interface rows. */
(() => {
  'use strict';
  const apps = new Map();
  // T(STRINGS)(lang, key): the APK's own translation, else the shared i18n row, else the English key.
  const texts = strings => {
    const table = AndroidStrings.table('', strings, AndroidStrings.shared);
    return (lang, key) => table.t(key, lang);
  };
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  window.GBApps = {
    register(id, module) { apps.set(id, module); },
    has: id => apps.has(id),
    get: id => apps.get(id),
    ids: () => [...apps.keys()],
    texts, e
  };
})();
