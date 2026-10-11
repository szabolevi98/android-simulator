/* One text contract for every version (audit point 10). A table maps a key (the English text, or on 2.3.6 the resource
   name) to an entry with named languages:
     {hu, de, fr, es, en?, res?}  or for the simulator's own texts  {hu, de, fr, es, en?, own: true}
   en is the image's English and is left out when it equals the key; res names the factory resource the row was read from
   ("Vending:install", "framework:ok"). A plural entry holds an object of quantities per language: {en: {one, other}, hu: …}.
   AndroidStrings.table(id, entries) gives the reader every module uses:
     t(key, lang)            the entry in that language, else its English, else the key
     fmt(key, lang, …args)   t() with %s / %d / %1$s / %2$d / %% / ^1 filled in
     plural(key, n, lang, …) the quantity Intl.PluralRules picks for n (args default to [n])
   lang is a language code or a locale ('hu', 'hu-HU'); without one the simulator's current language is used. */
(() => {
  'use strict';
  const LANGS = ['en', 'hu', 'de', 'fr', 'es'];
  const LOCALES = {en: 'en-US', hu: 'hu-HU', de: 'de-DE', fr: 'fr-FR', es: 'es-ES'};
  const tables = {};
  const code = lang => {
    const c = String(lang || globalThis.window?.AndroidI18n?.language || 'en').slice(0, 2).toLowerCase();
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
  function value(entry, key, lang) {
    if (entry === undefined || entry === null) return key;
    if (typeof entry === 'string') return entry;
    const c = code(lang);
    return entry[c] ?? entry.en ?? key;
  }
  function table(id, entries = {}) {
    const reader = {
      id, entries,
      has: key => Object.prototype.hasOwnProperty.call(entries, key),
      entry: key => entries[key],
      t: (key, lang) => value(entries[key], key, lang),
      fmt: (key, lang, ...args) => format(value(entries[key], key, lang), ...args),
      plural(key, n, lang, ...args) {
        const forms = value(entries[key], key, lang);
        if (typeof forms === 'string') return format(forms, ...(args.length ? args : [n]));
        const quantity = new Intl.PluralRules(LOCALES[code(lang)]).select(Number(n));
        const english = entries[key]?.en || {};
        return format(forms[quantity] ?? forms.other ?? english[quantity] ?? english.other ?? key, ...(args.length ? args : [n]));
      }
    };
    if (id) tables[id] = reader;
    return reader;
  }
  // Legacy shapes, for tables that have not moved to the named form yet: [hu, de, fr, es, en?] rows keyed by English.
  const fromRows = rows => Object.fromEntries(Object.entries(rows).map(([key, [hu, de, fr, es, en]]) => [key, en && en !== key ? {en, hu, de, fr, es} : {hu, de, fr, es}]));
  (globalThis.window || globalThis).AndroidStrings ={LANGS, LOCALES, code, format, table, tables, fromRows, locale: lang => LOCALES[code(lang)]};
})();
