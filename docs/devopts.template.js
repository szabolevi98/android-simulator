__HEADER__
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // [kind, title, summary, setting key, depends on USB debugging, ...]; kind: check (CheckBoxPreference), switch
  // (SwitchPreference), choice (ListPreference: + entries, summaries or null, default index, dialog title), list (a row
  // with its summary: PreferenceScreen, Preference), scale (the animation scale dialog).
  const SECTIONS = __SECTIONS__;
  // English -> [hu, de, fr, es] as the image's Settings.apk (or framework-res) translates it.
  const STRINGS = {
    __STRINGS__
  };
  const LANGS = ['hu', 'de', 'fr', 'es'];
  const DEFAULTS = {developerEnabled: true, verifyUsb: true, animatorScale: 1};
  const keys = () => SECTIONS.flatMap(([, rows]) => rows.map(row => row[3]).filter(Boolean));
  // PreferenceCategory titles: Holo's list separators are all caps, Material's preference_category_material is not.
  const CATEGORY_CAPS = __CATEGORY_CAPS__;

  function render(settings, t, scaleLabel, lang = 'en') {
    const on = settings.developerEnabled !== false, i = LANGS.indexOf(lang);
    const T = text => STRINGS[text] && i >= 0 ? STRINGS[text][i] : STRINGS[text] ? text : t(text);
    return SECTIONS.map(([category, rows]) => `${category ? `<div class="section-label">${e(CATEGORY_CAPS ? T(category).toLocaleUpperCase() : T(category))}</div>` : ''}${rows.map(([kind, title, summary, key, dependent]) => {
      const disabled = !on || (dependent && !settings.usbDebug) || (key === 'waitDebugger');
      const attrs = disabled ? 'disabled aria-disabled="true"' : '';
      const copy = `<span class="row-copy">${e(T(title))}${summary ? `<small>${e(T(summary))}</small>` : ''}</span>`;
      if (kind === 'check') return `<button class="settings-row wireless-row jb-dev-row" data-action="toggle-setting" data-id="${key}" role="checkbox" aria-checked="${!!settings[key]}" ${attrs}>${copy}<img class="holo-checkbox" src="assets/btn_check_${settings[key] ? 'on' : 'off'}_holo_dark.png" alt=""></button>`;
      if (kind === 'switch') return `<button class="settings-row lp-switch-row jb-dev-row" data-action="toggle-setting" data-id="${key}" role="switch" aria-checked="${!!settings[key]}" ${attrs}>${copy}<span class="lp-mswitch${settings[key] ? ' on' : ''}" aria-hidden="true"></span></button>`;
      if (kind === 'choice') { const [, , , , , entries, summaries, fallback] = SECTIONS.flatMap(([, list]) => list).find(row => row[3] === key); const index = settings[key] ?? fallback; return `<button class="settings-row jb-dev-row" data-action="dev-list" data-id="${key}" ${attrs}><span class="row-copy">${e(T(title))}<small>${e(T((summaries || entries)[index] ?? entries[0]))}</small></span></button>`; }
      if (kind === 'scale') return `<button class="settings-row jb-dev-row" data-action="sd-dialog" data-id="${key}" ${attrs}><span class="row-copy">${e(T(title))}<small>${e(t(scaleLabel(settings[key] ?? 1)))}</small></span></button>`;
      return `<button class="settings-row jb-dev-row" data-action="dev-info" data-id="${e(title)}" ${attrs}>${copy}</button>`;
    }).join('')}`).join('');
  }

  // ListPreference's dialog: the title, the entries as single-choice rows, Cancel; a tap picks and closes.
  function dialog(key, settings, t, lang = 'en') {
    const row = SECTIONS.flatMap(([, rows]) => rows).find(item => item[0] === 'choice' && item[3] === key);
    if (!row) return '';
    const i = LANGS.indexOf(lang), T = text => STRINGS[text] && i >= 0 ? STRINGS[text][i] : STRINGS[text] ? text : t(text);
    const [, , , , , entries, , fallback, title] = row, current = settings[key] ?? fallback;
    return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${e(T(title))}"><h3>${e(T(title))}</h3>${entries.map((entry, n) => `<button class="settings-row wireless-row" data-action="dev-list-pick" data-id="${key}:${n}" role="radio" aria-checked="${n === current}"><span class="row-copy">${e(T(entry))}</span>${CATEGORY_CAPS ? `<img class="holo-radio" src="assets/btn_radio_${n === current ? 'on' : 'off'}_holo_dark.png" alt="">` : `<span class="lp-radio${n === current ? ' on' : ''}" aria-hidden="true"></span>`}</button>`).join('')}<div class="settings-dialog-actions"><button data-action="close-overlay">${e(t('Cancel'))}</button></div></div>`;
  }

  /* Overlays: layout bounds (red clip bounds and blue corner marks), PointerLocationView's top bar, and the
     LoadAverageService panel at the top right. */
  function apply(screen, settings) {
    const on = settings.developerEnabled !== false;
    screen.classList.toggle('dev-layout-bounds', on && !!settings.layoutBounds);
    let pointer = screen.querySelector('.dev-pointer-bar'), cpu = screen.querySelector('.dev-cpu');
    if (on && settings.pointerLocation && !pointer) { pointer = document.createElement('div'); pointer.className = 'dev-pointer-bar'; pointer.setAttribute('aria-hidden', 'true'); pointer.textContent = 'P: 0 / 0   X: 0.0   Y: 0.0   Xv: 0.000   Yv: 0.000   Prs: 0.00   Size: 0.00'; screen.append(pointer); }
    if (!(on && settings.pointerLocation) && pointer) pointer.remove();
    if (on && settings.showCpu && !cpu) { cpu = document.createElement('div'); cpu.className = 'dev-cpu'; cpu.setAttribute('aria-hidden', 'true'); screen.append(cpu); updateCpu(cpu); }
    if (!(on && settings.showCpu) && cpu) cpu.remove();
  }
  function updateCpu(cpu) {
    const t = Date.now() / 1000, load = [0.48 + .12 * Math.sin(t / 7), 0.42 + .06 * Math.sin(t / 19), 0.39];
    const procs = [['system_server', 4 + 3 * Math.abs(Math.sin(t / 3))], ['com.android.systemui', 2 + 2 * Math.abs(Math.sin(t / 5))], ['surfaceflinger', 1.5 + Math.abs(Math.sin(t / 2))], ['com.android.launcher', 1 + Math.abs(Math.sin(t / 4))]];
    cpu.innerHTML = `<b>${load.map(v => v.toFixed(2)).join(' / ')}</b>${procs.map(([name, value]) => `<span><i style="width:${value * 6}px"></i>${name}</span>`).join('')}`;
  }
  function pointerMove(screen, event, down, count) {
    const bar = screen.querySelector('.dev-pointer-bar'); if (!bar) return;
    const box = screen.getBoundingClientRect(), k = box.width / screen.offsetWidth || 1, x = (event.clientX - box.left) / k * 2, y = (event.clientY - box.top) / k * 2;
    bar.textContent = `P: ${down ? 1 : 0} / ${count}   X: ${x.toFixed(1)}   Y: ${y.toFixed(1)}   Xv: 0.000   Yv: 0.000   Prs: ${down ? '1.00' : '0.00'}   Size: ${down ? '0.20' : '0.00'}`;
  }
  window.JBDeveloperOptions = {SECTIONS, STRINGS, DEFAULTS, keys, render, dialog, apply, updateCpu, pointerMove};
})();
