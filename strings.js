/* One text contract for every version (audit point 10). A table maps a key (the English text, or on 2.3.6 the resource
   name) to an entry with named languages:
     {res?, hu, de, fr, es, en?}  or for the simulator's own texts  {own: true, hu, de, fr, es, en?}
   en is the image's English and is left out when it equals the key; res names the factory resource the row was read from
   ("Vending:install", "framework:ok"). A plural entry holds an object of quantities per language: {en: {one, other}, hu: …}.
   AndroidStrings.table(id, entries, missing?) gives the reader every module uses:
     t(key, lang)            the entry in that language, else its English, else missing(key, lang) (default: the key)
     fmt(key, lang, …args)   t() with %s / %d / %1$s / %2$d / %% / ^1 filled in
     plural(key, n, lang, …) the quantity Intl.PluralRules picks for n (args default to [n])
   lang is a language code or a locale ('hu', 'hu-HU'); without one the simulator's current language is used. */
(() => {
  'use strict';
  const LANGS = ['en', 'hu', 'de', 'fr', 'es'];
  const LOCALES = {en: 'en-US', hu: 'hu-HU', de: 'de-DE', fr: 'fr-FR', es: 'es-ES'};
  const tables = {};
  const code = lang => {
    const c = String(lang || (globalThis.window?.AndroidI18n ?? globalThis.AndroidI18n)?.language || 'en').slice(0, 2).toLowerCase();
    return LANGS.includes(c) ? c : 'en';
  };
  // Android's formatter: positional %1$s / %2$d, sequential %s / %d, %% for a percent sign; the Market's ^1 as well.
  function format(text, ...args) {
    let next = 0;
    return String(text ?? '')
      .replace(/%(?:(\d+)\$)?([-#+0]*\d*(?:\.\d+)?)([sdfS%])/g, (all, pos, flags, type) => {
        if (type === '%') return '%';
        const value = args[pos ? pos - 1 : next++];
        if (value === undefined) return all;
        if (type === 'f' && /\.(\d+)/.test(flags)) return Number(value).toFixed(Number(flags.match(/\.(\d+)/)[1]));
        return String(value);
      })
      .replace(/\^(\d)/g, (all, n) => args[n - 1] ?? all);
  }
  function value(entry, key, lang, missing) {
    if (entry === undefined || entry === null) return missing ? missing(key, code(lang)) : key;
    if (typeof entry === 'string') return entry;
    const c = code(lang);
    return entry[c] ?? entry.en ?? key;
  }
  // missing(key, lang) answers keys the table lacks; a module that falls back on the shared AndroidI18n rows passes
  // AndroidStrings.shared.
  function table(id, entries = {}, missing) {
    const has = key => Object.prototype.hasOwnProperty.call(entries, key);
    const reader = {
      id, entries, has,
      entry: key => has(key) ? entries[key] : undefined,
      t: (key, lang) => value(has(key) ? entries[key] : undefined, key, lang, missing),
      fmt: (key, lang, ...args) => format(reader.t(key, lang), ...args),
      plural(key, n, lang, ...args) {
        const forms = value(has(key) ? entries[key] : undefined, key, lang, missing);
        if (typeof forms === 'string') return format(forms, ...(args.length ? args : [n]));
        const quantity = new Intl.PluralRules(LOCALES[code(lang)]).select(Number(n));
        const english = entries[key]?.en || {};
        return format(forms[quantity] ?? forms.other ?? english[quantity] ?? english.other ?? key, ...(args.length ? args : [n]));
      }
    };
    if (id) tables[id] = reader;
    return reader;
  }
  // Tables keyed by resource name, as docs/gb-strings.py writes them: {strings: {name: {en, hu, …}}, arrays: {name: {en:
  // [...], hu: [...]}}, plurals: {name: {en: {one, other}, …}}}. get() is read on every call, so the order the scripts
  // load in does not matter.
  function resources(get) {
    const part = kind => get()?.[kind] || {};
    return {
      has: key => Object.prototype.hasOwnProperty.call(part('strings'), key),
      t: (key, lang) => table('', part('strings')).t(key, lang),
      fmt: (key, lang, ...args) => table('', part('strings')).fmt(key, lang, ...args),
      array: (key, lang) => { const entry = part('arrays')[key]; return entry ? entry[code(lang)] || entry.en : []; },
      plural: (key, n, lang, ...args) => table('', part('plurals')).plural(key, n, lang, ...args)
    };
  }
  // The shared rows (i18n.js and the version's image-strings.js) in the simulator's current language; English as is.
  const shared = (key, lang) => lang === 'en' ? key : (globalThis.window?.AndroidI18n ?? globalThis.AndroidI18n)?.t(key) ?? key;
  // Legacy shapes, for tables that have not moved to the named form yet: [hu, de, fr, es, en?] rows keyed by English.
  const fromRows = rows => Object.fromEntries(Object.entries(rows).map(([key, [hu, de, fr, es, en]]) => [key, en && en !== key ? {en, hu, de, fr, es} : {hu, de, fr, es}]));
  const api = {LANGS, LOCALES, code, format, table, tables, resources, shared, fromRows, locale: lang => LOCALES[code(lang)]};
  // A page's window is its global object; a test's vm context may carry a separate window object, so both get it.
  globalThis.AndroidStrings = api;
  if (globalThis.window) globalThis.window.AndroidStrings = api;
})();
