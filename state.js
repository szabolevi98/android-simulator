/* Saved simulator state (audit point 13): one localStorage key per Android version, read and written here so a broken
   save never costs more than the part that is broken.
     AndroidState.load(key, defaults, build)
       - nothing saved: a fresh copy of defaults
       - unreadable JSON: kept under '<key>:unreadable', a fresh copy of defaults, the problem reported
       - a top-level field whose kind differs from the default's (array, object, string, number, boolean) takes the
         default for that field alone; the rest of the save stays (reported)
       - build(saved) is the version's own merge and upgrades; if it throws, the repaired save over the defaults is used
         and the error reported, instead of starting over
     AndroidState.save(key, data)  true when stored; a full or blocked storage is reported once per page
     AndroidState.onProblem(fn)    fn({kind, key, detail}) for every problem so far and later ('unreadable', 'repaired',
                                   'upgrade', 'unsaved') */
(() => {
  'use strict';
  const problems = [], listeners = [];
  let unsavedReported = false;
  const report = problem => { problems.push(problem); for (const fn of listeners) { try { fn(problem); } catch {} } };
  const clone = value => JSON.parse(JSON.stringify(value));
  const kind = value => Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
  const storage = () => { try { return globalThis.localStorage; } catch { return null; } };

  function repair(saved, defaults, key) {
    const out = {}, fixed = [];
    for (const [name, value] of Object.entries(saved)) {
      if (name in defaults && defaults[name] !== null && value !== null && kind(value) !== kind(defaults[name])) { fixed.push(name); continue; }
      out[name] = value;
    }
    if (fixed.length) report({kind: 'repaired', key, detail: fixed.join(', ')});
    return out;
  }
  function load(key, defaults, build = saved => ({...clone(defaults), ...saved})) {
    let text = null;
    try { text = storage()?.getItem(key) ?? null; } catch {}
    if (text === null) return clone(defaults);
    let saved;
    try { saved = JSON.parse(text); } catch { saved = undefined; }
    if (kind(saved) !== 'object') {
      try { storage()?.setItem(`${key}:unreadable`, text); } catch {}
      report({kind: 'unreadable', key, detail: String(text).slice(0, 80)});
      return clone(defaults);
    }
    const repaired = repair(saved, defaults, key);
    try { return build(repaired); } catch (error) {
      report({kind: 'upgrade', key, detail: String(error?.message || error)});
      return {...clone(defaults), ...repaired};
    }
  }
  function save(key, data) {
    try { storage().setItem(key, JSON.stringify(data)); unsavedReported = false; return true; } catch (error) {
      if (!unsavedReported) { unsavedReported = true; report({kind: 'unsaved', key, detail: String(error?.name || error)}); }
      return false;
    }
  }
  function onProblem(fn) { listeners.push(fn); for (const problem of problems) { try { fn(problem); } catch {} } }
  const api = {load, save, onProblem, problems};
  globalThis.AndroidState = api;
  if (globalThis.window) globalThis.window.AndroidState = api;
})();
