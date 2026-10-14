/* Android 2.1 Google Goggles 1.0.1 (GoogleGoggles.apk, com.google.android.apps.unveil; English only), offline.
   - FirstRunActivity (show_first_run_key; portrait, Theme.NoTitleBar, first_run.xml on white): the header_bg strip with
     the logo, then three pages (FirstRunActivity.updatePage): the ViewFlipper of animation_1…3 (flipInterval 2000 ms)
     over "Use pictures to search the web." (20 sp, padding 45 / 15 dp) and "Review the mobile terms of service";
     "Try taking pictures of..." over good_items; "Probably won't work with..." over bad_items and "Watch a video to learn
     more" over video_preview with the play button. The nav bar is Close / Accept on the first page, Back / Continue
     after it; past the last page HistoryPreferenceActivity (history_pref.xml): "Enable search history?", the two
     paragraphs, "Learn more »", Enable history / Disable history, Back / Get Started!.
   - CaptureActivity (landscape, Theme.NoTitleBar.Fullscreen, layout-hdpi/capture.xml): the camera preview with a 100 dp
     button_bar on the right and the shutter; its PingTask fails offline and onCreateDialog 1 is the "Connection
     problem" alert (title with ic_dialog_alert; Try again / Cancel). The shutter freezes the picture under
     progress_view.xml (progress_area_bg, "Analyzing…" 20 dp bold, the cancel button), which ends the same way.
     Menu: Help (menu_about) → AboutActivity (about.xml: the header, the version on #e8ecf9, Help, Terms of service,
     Privacy policy and Show tutorial, which open their links).
   The landscape screen is drawn turned 90 degrees, as the Camera is, and so are its dialogs. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const G = () => EC.text('goggles');
  const t = k => G().t(k);
  const VERSION = '1.0.1';
  const LINKS = {tos: 'http://m.google.com/toscountry', video: 'http://www.youtube.com/watch?v=4DXuGfIGfo8', privacy: 'http://m.google.com/static/en/privacy.html',
    help: 'http://google.com/support/mobile/bin/topic.py?hl=en&topic=25275', learn: 'http://m.google.com/goggles/learn_more.html'};
  let timer = 0, flip = 0, frame = 0;
  const header = () => '<div class="ecgg-header"><img src="assets/gg-logo.png" alt=""></div>';
  const button = (action, label, link) => `<button type="button" class="ecui-button" data-action="${action}"${link ? ` data-link="${link}"` : ''}><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(label)}</span></button>`;
  // wont_work is a styled string: <b> over "won't" (9…13).
  const bold = (text, from, to) => `${esc(text.slice(0, from))}<b>${esc(text.slice(from, to + 1))}</b>${esc(text.slice(to + 1))}`;
  function firstRun(c) {
    const page = c.ui.ggPage || 0;
    let body;
    if (page === 0) body = `<div class="ecgg-page ecgg-p1"><div class="ecgg-flip"><img src="assets/gg-animation_${(flip % 3) + 1}.png" alt=""></div><div class="ecgg-desc">${esc(t('description'))}</div>
      <div class="ecgg-tos"><span>${esc(t('review_the'))}</span><button type="button" class="ecgg-link" data-action="ecgg-link" data-link="tos">${esc(t('mobile_tos'))}</button></div></div>`;
    else if (page === 1) body = `<div class="ecgg-page"><div class="ecgg-band">${esc(t('try_pictures'))}</div><img class="ecgg-good" src="assets/gg-good_items.png" alt=""></div>`;
    else body = `<div class="ecgg-page"><div class="ecgg-band">${bold(t('wont_work'), 9, 13)}</div><img class="ecgg-bad" src="assets/gg-bad_items.png" alt=""><div class="ecgg-band">${esc(t('watch_video'))}</div>
      <div class="ecgg-video"><img src="assets/gg-video_preview.png" alt=""><button type="button" class="ecgg-play" data-action="ecgg-link" data-link="video"><img src="assets/fw-ic_media_play.png" alt=""></button></div></div>`;
    return `<div class="ecgg">${header()}${body}<div class="ecgg-nav">${button('ecgg-prev', t(page === 0 ? 'close' : 'previous'))}${button('ecgg-next', t(page === 0 ? 'accept_continue' : 'next'))}</div></div>`;
  }
  function history(c) {
    const h = c.ui.ggHistory;
    const radio = (v, label) => `<button type="button" class="ecgg-radio" data-action="ecgg-history" data-value="${v}"><img src="assets/fw-btn_radio_${h === v ? 'on' : 'off'}.png" alt=""><span>${esc(label)}</span></button>`;
    return `<div class="ecgg">${header()}<div class="ecgg-page ecgg-hist"><div class="ecgg-htitle"><b>${esc(t('enable_history_title'))}</b></div><p>${esc(t('history_explanation'))}</p><p>${esc(t('retained_by_google'))}</p>
      <button type="button" class="ecgg-link ecgg-learn" data-action="ecgg-link" data-link="learn">${esc(t('learn_more'))}</button><div class="ecgg-radios">${radio('on', t('enable_history'))}${radio('off', t('disable_history'))}</div></div>
      <div class="ecgg-nav">${button('ecgg-hback', t('previous'))}${button('ecgg-start', t('get_started'))}</div></div>`;
  }
  function about() {
    return `<div class="ecgg">${header()}<div class="ecgg-version">${esc(VERSION)}</div><div class="ecgg-about">${[['help', 'help'], ['tos', 'tos'], ['privacy', 'privacy_policy'], ['video', 'show_intro_video']].map(([link, label]) => button('ecgg-about', t(label), link)).join('')}</div></div>`;
  }
  function capture(c) {
    const busy = c.ui.ggBusy;
    return `<div class="ecgg-land"><div class="ecgg-preview"><canvas class="ecgg-cam" width="433" height="320"></canvas>${busy ? `<div class="ecgg-progress npp-gg-progress_area_bg"><i class="ec-bg np-gg-progress_area_bg"></i><span>${esc(t('working'))}</span><button type="button" class="ecgg-cancel" data-action="ecgg-cancel"><img class="n" src="assets/gg-cancel.png" alt=""><img class="p" src="assets/gg-cancel_pressed.png" alt=""></button></div>` : ''}</div>
      <div class="ecgg-bar"><i class="ec-bg np-gg-button_bar"></i><button type="button" class="ecgg-shutter" data-action="ecgg-shutter"><img class="n" src="assets/gg-shutter.png" alt=""><img class="p" src="assets/gg-shutter_pressed.png" alt=""></button></div></div>`;
  }
  // PingTask / the search: offline both end in onCreateDialog 1.
  function fail(c, ms) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (c.ui.view !== 'goggles' || c.ui.sub !== 'capture') return;
      c.ui.ggBusy = false; c.render();
      c.dialog({title: t('connection_problem'), icon: 'fw-ic_dialog_alert.png', buttons: [{label: t('try_again'), action: () => fail(c, 1500)}, {label: t('cancel')}]});
    }, ms);
  }
  function camera(c, root) {
    cancelAnimationFrame(frame);
    const cv = root.querySelector('.ecgg-cam');
    if (!cv) return;
    const still = c.ui.ggBusy ? c.ui.ggStill : 0;
    const step = now => { if (!cv.isConnected) return; EC.media.draw(cv, {seed: c.ui.cameraSeed ?? 7, t: still || now}); if (!still) frame = requestAnimationFrame(step); };
    step(performance.now());
  }
  const go = (c, sub) => { c.ui.sub = sub; c.render(); if (sub === 'capture') fail(c, 1500); };
  const browse = (c, link) => { if (link === 'video') { c.open('youtube'); return; } c.ui.browserGo = LINKS[link]; c.open('browser'); };
  EC.register('goggles', {
    title: 'Goggles',
    noStatus: c => c.ui.sub === 'capture',
    render(c) {
      c.el.overlay.classList.toggle('ecgg-turned', c.ui.sub === 'capture');
      return c.ui.sub === 'history' ? history(c) : c.ui.sub === 'about' ? about(c) : c.ui.sub === 'capture' ? capture(c) : firstRun(c);
    },
    mount(c, root) { if (c.ui.sub === 'capture') camera(c, root); },
    start(c) { c.ui.ggPage = 0; flip = 0; go(c, c.data.gogglesFirstRun ? 'capture' : ''); },
    tick(c) {
      if (c.ui.view !== 'goggles' || c.ui.sub || (c.ui.ggPage || 0) !== 0) return;
      const n = Math.floor(Date.now() / 2000);
      if (n !== flip) { flip = n; const im = c.el.viewport.querySelector('.ecgg-flip img'); if (im) im.src = `assets/gg-animation_${(flip % 3) + 1}.png`; }
    },
    action(name, el, event, c) {
      switch (name) {
        case 'ecgg-next': if ((c.ui.ggPage || 0) >= 2) go(c, 'history'); else { c.ui.ggPage = (c.ui.ggPage || 0) + 1; c.render(); } return true;
        case 'ecgg-prev': if (!c.ui.ggPage) c.back(); else { c.ui.ggPage--; c.render(); } return true;
        case 'ecgg-hback': c.ui.ggPage = 2; go(c, ''); return true;
        case 'ecgg-history': c.ui.ggHistory = el.dataset.value; c.render(); return true;
        case 'ecgg-start': c.data.gogglesFirstRun = true; c.data.gogglesHistory = c.ui.ggHistory === 'on'; c.save(); go(c, 'capture'); return true;
        case 'ecgg-link': case 'ecgg-about': browse(c, el.dataset.link); return true;
        case 'ecgg-shutter': if (c.ui.ggBusy) return true; c.ui.ggBusy = true; c.ui.ggStill = performance.now(); c.render(); fail(c, 2500); return true;
        case 'ecgg-cancel': clearTimeout(timer); c.ui.ggBusy = false; c.render(); return true;
      }
      return false;
    },
    menu(c) {
      if (c.ui.sub !== 'capture') return false;
      c.menu([{label: t('about_label'), icon: 'gg-menu_about.png', action: () => { clearTimeout(timer); c.ui.ggBusy = false; go(c, 'about'); }}]);
      return true;
    },
    back(c) {
      clearTimeout(timer);
      if (c.ui.sub === 'about') { go(c, 'capture'); return true; }
      if (c.ui.sub === 'capture' && c.ui.ggBusy) { c.ui.ggBusy = false; c.render(); return true; }
      if (c.ui.sub === 'history') { c.ui.ggPage = 2; go(c, ''); return true; }
      if (!c.ui.sub && c.ui.ggPage) { c.ui.ggPage--; c.render(); return true; }
      cancelAnimationFrame(frame);
      c.el.overlay.classList.remove('ecgg-turned');
      return false;
    }
  });
  document.addEventListener('DOMContentLoaded', () => {
    const c = EC.context, open = c.open;
    c.open = (view, sub, opts) => {
      const fresh = c.ui.view !== view;
      const r = open(view, sub, opts);
      if (view !== 'goggles') c.el.overlay.classList.remove('ecgg-turned');
      else if (fresh) EC.module('goggles').start(c);
      return r;
    };
  });
})();
