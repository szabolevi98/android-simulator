/* Android 4.3 Developer options (Settings development_prefs.xml, android-4.3_r1.1) and the visible debug overlays. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // [kind, title, summary, setting key]; kind: check (CheckBoxPreference), list (summary row), scale (animation dialog).
  const SECTIONS = [
    ['', [['list', 'Desktop backup password', 'Desktop full backups aren’t currently protected'], ['check', 'Stay awake', 'Screen will never sleep while charging', 'stayAwake'], ['list', 'HDCP checking', 'Use HDCP checking for DRM content only'], ['check', 'Protect USB storage', 'Apps must request permission to read USB storage', 'protectStorage']]],
    ['Debugging', [['check', 'USB debugging', 'Debug mode when USB is connected', 'usbDebug'], ['list', 'Revoke USB debugging authorizations', ''], ['check', 'Power menu bug reports', 'Include option in power menu for taking a bug report', 'bugreportPower'], ['check', 'Allow mock locations', 'Allow mock locations', 'mockLocations'], ['list', 'Select debug app', 'No debug application set'], ['check', 'Wait for debugger', 'Debugged application waits for debugger to attach before executing', 'waitDebugger', true], ['check', 'Verify apps over USB', 'Check apps installed via ADB/ADT for harmful behavior.', 'verifyUsb']]],
    ['Input', [['check', 'Show touches', 'Show visual feedback for touches', 'showTouches'], ['check', 'Pointer location', 'Screen overlay showing current touch data', 'pointerLocation']]],
    ['Drawing', [['check', 'Show surface updates', 'Flash entire window surfaces when they update', 'surfaceUpdates'], ['check', 'Show layout bounds', 'Show clip bounds, margins, etc.', 'layoutBounds'], ['scale', 'Window animation scale', '', 'windowScale'], ['scale', 'Transition animation scale', '', 'transitionScale'], ['scale', 'Animator duration scale', '', 'animatorScale'], ['list', 'Simulate secondary displays', 'None']]],
    ['Hardware accelerated rendering', [['check', 'Force GPU rendering', 'Force use of GPU for 2d drawing', 'forceGpu'], ['check', 'Show GPU view updates', 'Flash views inside windows when drawn with the GPU', 'gpuUpdates'], ['check', 'Show hardware layers updates', 'Flash hardware layers green when they update', 'layerUpdates'], ['check', 'Show GPU overdraw', 'From best to worst: blue, green, light red, red', 'gpuOverdraw'], ['list', 'Debug non-rectangular clip operations', 'Off'], ['check', 'Force 4x MSAA', 'Enable 4x MSAA in OpenGL ES 2.0 apps', 'forceMsaa'], ['check', 'Disable HW overlays', 'Always use GPU for screen compositing', 'disableOverlays']]],
    ['Monitoring', [['check', 'Strict mode enabled', 'Flash screen when apps do long operations', 'strictMode'], ['check', 'Show CPU usage', 'Screen overlay showing current CPU usage', 'showCpu'], ['list', 'Profile GPU rendering', 'Off'], ['list', 'Enable OpenGL traces', 'None']]],
    ['Apps', [['check', 'Don’t keep activities', 'Destroy every activity as soon as the user leaves it', 'dontKeep'], ['list', 'Background process limit', 'Standard limit'], ['check', 'Show all ANRs', 'Show App Not Responding dialog for background apps', 'showAnrs'], ['check', 'Use Experimental WebView', 'Apps will use the newest (beta) WebView', 'experimentalWebview']]]
  ];
  const DEFAULTS = {developerEnabled: true, verifyUsb: true, animatorScale: 1};
  const keys = () => SECTIONS.flatMap(([, rows]) => rows.map(row => row[3]).filter(Boolean));

  function render(settings, t, scaleLabel) {
    const on = settings.developerEnabled !== false;
    return SECTIONS.map(([category, rows]) => `${category ? `<div class="section-label">${e(t(category).toUpperCase())}</div>` : ''}${rows.map(([kind, title, summary, key, dependent]) => {
      const disabled = !on || (dependent && !settings.usbDebug) || (key === 'waitDebugger');
      const attrs = disabled ? 'disabled aria-disabled="true"' : '';
      if (kind === 'check') return `<button class="settings-row wireless-row jb-dev-row" data-action="toggle-setting" data-id="${key}" role="checkbox" aria-checked="${!!settings[key]}" ${attrs}><span class="row-copy">${e(t(title))}${summary ? `<small>${e(t(summary))}</small>` : ''}</span><img class="holo-checkbox" src="assets/btn_check_${settings[key] ? 'on' : 'off'}_holo_dark.png" alt=""></button>`;
      if (kind === 'scale') return `<button class="settings-row jb-dev-row" data-action="sd-dialog" data-id="${key}" ${attrs}><span class="row-copy">${e(t(title))}<small>${e(t(scaleLabel(settings[key] ?? 1)))}</small></span></button>`;
      return `<button class="settings-row jb-dev-row" data-action="dev-info" data-id="${e(title)}" ${attrs}><span class="row-copy">${e(t(title))}${summary ? `<small>${e(t(summary))}</small>` : ''}</span></button>`;
    }).join('')}`).join('');
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
  window.JBDeveloperOptions = {SECTIONS, DEFAULTS, keys, render, apply, updateCpu, pointerMove};
})();
