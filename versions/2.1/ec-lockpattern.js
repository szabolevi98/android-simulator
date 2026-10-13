/* Android 2.1 unlock pattern set-up (Settings.apk): ChooseLockPatternTutorial → ChooseLockPatternExample → ChooseLockPattern,
   all titled lockpattern_change_lock_pattern_label; with a saved pattern, Change starts at ChooseLockPattern after
   ConfirmLockPattern.
   - Tutorial (choose_lock_pattern_tutorial.xml): lock_title (22 sp, centred), lock_intro_message (18 sp), padding 5 dp;
     ButtonBar (bottom_bar, padding 4 / 5 / 4 / 1 dp) with Cancel and Next (140 dp; ic_btn_next on the right).
   - Example (choose_lock_pattern_example.xml): lock_example_title, the lock_anim frames (8 × 400 ms, looping), the message.
   - ChooseLockPattern (choose_lock_pattern.xml): header 18 sp, code_lock_top, the LockPatternView, footer 14 sp, ButtonBar.
     Stage table (ChooseLockPattern$Stage, read from Settings.odex): Introduction (intro header / footer, Cancel,
     Continue off), HelpScreen (how to record, Ok; the animated example L), ChoiceTooShort (too short, Retry, Continue
     off), FirstChoiceValid (pattern entered, Retry, Continue), NeedToConfirm (need to confirm, Cancel off, Confirm off),
     ConfirmWrong (sorry, Cancel, Confirm off), ChoiceConfirmed (confirmed, Cancel, Confirm). A wrong pattern clears after
     2 s; while drawing the header says lockpattern_recording_inprogress. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const P = () => EC.text('pattern');
  const STAGES = {
    intro: ['lockpattern_recording_intro_header', 'cancel', 'continue-off', 'lockpattern_recording_intro_footer', true],
    help: ['lockpattern_settings_help_how_to_record', 'gone', 'ok', '', false],
    short: ['lockpattern_recording_incorrect_too_short', 'retry', 'continue-off', '', true],
    first: ['lockpattern_pattern_entered_header', 'retry', 'continue', '', false],
    confirm: ['lockpattern_need_to_confirm', 'cancel-off', 'confirm-off', '', true],
    wrong: ['lockpattern_need_to_unlock_wrong', 'cancel', 'confirm-off', '', true],
    done: ['lockpattern_pattern_confirmed_header', 'cancel', 'confirm', '', false]
  };
  const LABEL = {cancel: 'cancel', retry: 'lockpattern_retry_button_text', continue: 'lockpattern_continue_button_text', confirm: 'lockpattern_confirm_button_text'};
  const bar = (left, right) => {
    const btn = (mode, side) => {
      if (mode === 'gone') return '<span class="ecpt-btn-space"></span>';
      const [kind, off] = mode.split('-'), label = kind === 'ok' ? EC.text('framework').t('ok') : P().t(LABEL[kind]);
      return `<button type="button" class="ecui-button ecpt-btn" data-action="ecpt-${side}" data-mode="${kind}"${off ? ' disabled' : ''}><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(label)}</span>${side === 'right' && kind !== 'ok' ? '<img src="assets/st-ic_btn_next.png" alt="">' : ''}</button>`;
    };
    return `<div class="ecpt-bar">${btn(left, 'left')}<span class="ecpt-gap"></span>${btn(right, 'right')}</div>`;
  };
  const textBar = (left, right) => `<div class="ecpt-bar"><button type="button" class="ecui-button ecpt-btn" data-action="ecpt-cancel"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(left)}</span></button><span class="ecpt-gap"></span><button type="button" class="ecui-button ecpt-btn" data-action="ecpt-next"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(right)}</span><img src="assets/st-ic_btn_next.png" alt=""></button></div>`;

  let view = null, first = null, clearTimer = 0, animTimer = 0;
  function render(c) {
    const st = c.ui.patternStep || 'tutorial', title = P().t('lockpattern_change_lock_pattern_label');
    if (st === 'tutorial') return c.window(title, `<div class="ecpt-page"><div class="ecpt-scroll"><div class="ecpt-title">${esc(P().t('lock_title'))}</div><div class="ecpt-text">${esc(P().t('lock_intro_message'))}</div></div>${textBar(P().t('skip_button_label'), P().t('next_button_label'))}</div>`);
    if (st === 'example') return c.window(title, `<div class="ecpt-page"><div class="ecpt-scroll"><div class="ecpt-title">${esc(P().t('lock_example_title'))}</div><img class="ecpt-anim" src="assets/st-lock_anim_00.png" alt=""><div class="ecpt-text">${esc(P().t('lock_example_message'))}</div></div>${textBar(P().t('skip_button_label'), P().t('next_button_label'))}</div>`);
    const stage = c.ui.patternStage || 'intro', [header, left, right, footer] = STAGES[stage];
    const head = c.ui.patternDrawing ? P().t('lockpattern_recording_inprogress') : stage === 'short' ? P().fmt(header, c.lang, 4) : P().t(header);
    return c.window(title, `<div class="ecpt-record"><div class="ecpt-head">${esc(head)}</div><i class="ecpt-top"></i><canvas class="ecpt-pattern"></canvas><div class="ecpt-foot">${esc(footer && !c.ui.patternDrawing ? P().t(footer) : '')}</div>${bar(left, right)}</div>`);
  }
  function mount(c, root) {
    clearInterval(animTimer);
    const st = c.ui.patternStep || 'tutorial';
    if (st === 'example') {
      let i = 0; const frames = ['00', '02', '04', '06', '08', '10', '12', '14'], el = root.querySelector('.ecpt-anim');
      animTimer = setInterval(() => { if (!el.isConnected) { clearInterval(animTimer); return; } i = (i + 1) % frames.length; el.src = `assets/st-lock_anim_${frames[i]}.png`; }, 400);
      return;
    }
    if (st !== 'record') return;
    const cv = root.querySelector('.ecpt-pattern'), w = cv.clientWidth, ratio = window.devicePixelRatio || 1;
    cv.width = cv.height = Math.round(w * ratio);
    const stage = c.ui.patternStage || 'intro';
    view = EC.pattern(cv, {
      tactile: true,
      onStart() { clearTimeout(clearTimer); c.ui.patternDrawing = true; setText(c, root); },
      onDone(cells) {
        c.ui.patternDrawing = false;
        const s = c.ui.patternStage || 'intro';
        if (s === 'confirm' || s === 'wrong') {
          if (cells.join() === first.join()) go(c, 'done', cells, 'correct'); else go(c, 'wrong', cells, 'wrong');
        } else if (cells.length < 4) go(c, 'short', cells, 'wrong');
        else { first = cells; go(c, 'first', cells, 'correct'); }
      }
    });
    view.enable(STAGES[stage][4]);
    if (c.ui.patternShown) view.show(c.ui.patternShown.cells, c.ui.patternShown.mode);
    if (stage === 'help') view.show([0, 1, 4, 7], 'animate');
  }
  function setText(c, root) {
    const stage = c.ui.patternStage || 'intro', [header, , , footer] = STAGES[stage];
    root.querySelector('.ecpt-head').textContent = c.ui.patternDrawing ? P().t('lockpattern_recording_inprogress') : stage === 'short' ? P().fmt(header, c.lang, 4) : P().t(header);
    root.querySelector('.ecpt-foot').textContent = footer && !c.ui.patternDrawing ? P().t(footer) : '';
  }
  function go(c, stage, cells, mode) {
    clearTimeout(clearTimer);
    c.ui.patternStage = stage;
    c.ui.patternShown = cells ? {cells, mode} : null;
    c.render();
    // postClearPatternRunnable: a wrong pattern goes away after 2 s
    if (mode === 'wrong') clearTimer = setTimeout(() => { c.ui.patternShown = null; view?.clear(); }, 2000);
  }
  const reset = c => { clearInterval(animTimer); clearTimeout(clearTimer); c.ui.patternStep = null; c.ui.patternStage = null; c.ui.patternShown = null; c.ui.patternDrawing = false; };
  // Finishing goes back to the screen that started it (the core's history).
  function finish(c) { reset(c); c.back(); }

  EC.register('choose-pattern', {
    title: 'Change unlock pattern',
    app: false,
    render, mount,
    action(name, el, event, c) {
      if (name === 'ecpt-cancel') { finish(c); return true; }
      if (name === 'ecpt-next') { c.ui.patternStep = (c.ui.patternStep || 'tutorial') === 'tutorial' ? 'example' : 'record'; c.ui.patternStage = 'intro'; c.render(); return true; }
      if (name === 'ecpt-left') { if (el.dataset.mode === 'retry') go(c, 'intro'); else finish(c); return true; }
      if (name === 'ecpt-right') {
        const mode = el.dataset.mode;
        if (mode === 'continue') go(c, 'confirm');
        else if (mode === 'ok') go(c, 'intro');
        else if (mode === 'confirm') {   // saveChosenPatternAndFinish: the pattern is saved and the lock turned on
          c.data.settings.lockPattern = first; (c.data.prefs ||= {}).lockenabled = true; c.save(); finish(c);
        }
        return true;
      }
      return false;
    },
    // Introduction: Menu shows how to draw a pattern (HelpScreen).
    menu(c) { if ((c.ui.patternStage || 'intro') === 'intro' && c.ui.patternStep === 'record') go(c, 'help'); return true; },
    back(c) { reset(c); return false; }
  });
  EC.patternFlow = {start(c) { c.ui.patternStep = c.data.settings.lockPattern ? 'record' : 'tutorial'; c.ui.patternStage = 'intro'; c.ui.patternShown = null; c.open('choose-pattern'); }};
})();
