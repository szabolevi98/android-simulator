/* Android 4.3 keyguard: KeyguardWidgetPager pages above a GlowPadView challenge (AOSP android-4.3_r1.1). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const DP = .9;
  // GlowPadView dimensions and timings (dimens.xml, GlowPadView.java, PointCloud.java).
  const G = {outer: 135 * DP, inner: 15 * DP, glow: 75 * DP, snap: 40 * DP, waveWidth: 100 * DP, wave: 1350, show: 200, showDelay: 50, hide: 200, innerPoints: 8, minPoint: 2, maxPoint: 4};
  const MAX_WIDGETS = 5;

  // PointCloud.makePointCloud: rings from the inner to the outer radius, spaced like the inner ring's points.
  function pointCloud(inner = G.inner, outer = G.outer) {
    const points = [], ds = 2 * Math.PI * inner / G.innerPoints, bands = Math.round((outer - inner) / ds), dr = (outer - inner) / bands;
    for (let b = 0, r = inner; b <= bands; b++, r += dr) {
      const count = Math.floor(2 * Math.PI * r / ds), step = 2 * Math.PI / count;
      for (let i = 0, eta = Math.PI / 2; i < count; i++, eta += step) points.push({x: r * Math.cos(eta), y: r * Math.sin(eta), r});
    }
    return points;
  }
  // PointCloud.getAlphaForPoint: cos^10 glow around the finger, cos^20 trailing edge of the wave.
  function pointAlpha(point, glow, wave) {
    let glowAlpha = 0, waveAlpha = 0;
    const distance = Math.hypot(glow.x - point.x, glow.y - point.y);
    if (distance < glow.radius) glowAlpha = glow.alpha * Math.max(0, Math.cos(Math.PI * .25 * distance / glow.radius) ** 10);
    const toRing = Math.hypot(point.x, point.y) - wave.radius;
    if (toRing < wave.width * .5 && toRing < 0) waveAlpha = wave.alpha * Math.max(0, Math.cos(Math.PI * .25 * toRing / wave.width) ** 20);
    return Math.max(glowAlpha, waveAlpha);
  }
  // KeyguardHostView page order: add-widget slot, user widgets, transport (when music is active), status clock, camera.
  function pages(widgets = [], {music = false} = {}) {
    const list = [];
    if (widgets.length < MAX_WIDGETS) list.push({type: 'add'});
    widgets.forEach(widget => list.push({type: 'widget', widget}));
    if (music) list.push({type: 'transport'});
    list.push({type: 'status'}, {type: 'camera'});
    return list;
  }
  const defaultPage = list => Math.max(0, list.findIndex(page => page.type === 'transport') >= 0 ? list.findIndex(page => page.type === 'transport') : list.findIndex(page => page.type === 'status'));
  const quad = t => 1 - (1 - t) * (1 - t), cubicOut = t => 1 - (1 - t) ** 3, cubicIn = t => t * t * t, quartOut = t => 1 - (1 - t) ** 4;

  function render(list, current, parts) {
    const page = item => {
      if (item.type === 'add') return `<div class="jbk-page jbk-add"><button class="jbk-add-button" data-action="kg-add-widget" aria-label="${e(parts.t('Add widget'))}"><img src="assets/jb-kg_add_widget.png" alt=""></button></div>`;
      if (item.type === 'widget') return `<div class="jbk-page jbk-user-widget" data-kg-widget="${e(item.widget.id)}">${parts.widget(item.widget)}</div>`;
      if (item.type === 'transport') return `<div class="jbk-page jbk-transport">${parts.transport}</div>`;
      if (item.type === 'camera') return `<div class="jbk-page jbk-camera" aria-label="${e(parts.t('Camera'))}"><img src="assets/ic_lockscreen_camera_normal.png" alt=""></div>`;
      return `<div class="jbk-page jbk-status"><div class="jbk-clock">${e(parts.clock)}${parts.ampm ? `<small>${e(parts.ampm)}</small>` : ''}</div><div class="jbk-status-line"><span>${e(parts.date)}</span>${parts.alarm ? `<span class="jbk-alarm"><img src="assets/jb-ic_lock_idle_alarm.png" alt="">${e(parts.alarm)}</span>` : ''}</div>${parts.owner ? `<div class="jbk-owner">${e(parts.owner)}</div>` : ''}</div>`;
    };
    return `<div class="lock-view jb-keyguard"><div class="jbk-remove" aria-hidden="true">${e(parts.t('Remove'))}</div><div class="jbk-pager" data-kg-pager style="--kg-page:${current}"><div class="jbk-track">${list.map(page).join('')}</div></div><div class="jbk-challenge"><canvas class="jbk-points" aria-hidden="true"></canvas><div class="jbk-ring"></div><img class="jbk-target" src="assets/ic_lockscreen_unlock_normal.png" alt=""><img class="jbk-target-active" src="assets/ic_lockscreen_unlock_activated.png" alt=""><button class="jbk-handle" aria-label="${e(parts.t('Slide area.'))}"><img src="assets/ic_lockscreen_handle_normal.png" alt=""></button><div class="jbk-eca">${e(parts.carrier)}</div></div></div>`;
  }

  /* GlowPadView controller. Single unlock target with magnetic snapping: any drag past outer radius minus the
     snap margin activates it, as in handleMove's singleTarget branch. */
  function glowPad(root, {onUnlock, haptic, reduced}) {
    const canvas = root.querySelector('.jbk-points'), ctx = canvas.getContext('2d'), handle = root.querySelector('.jbk-handle');
    const dot = new Image(); dot.src = 'assets/jb-ic_lockscreen_glowdot.png';
    const points = pointCloud(), glow = {x: 0, y: 0, radius: G.glow, alpha: 0}, wave = {radius: 0, width: G.waveWidth, alpha: 0};
    let tweens = [], frame = 0, grabbed = null, active = false, destroyed = false;
    const center = () => { const box = canvas.getBoundingClientRect(), k = box.width / canvas.clientWidth || 1; return {x: box.left + box.width / 2, y: box.top + box.height / 2, k}; };
    const tween = (target, key, to, duration, ease, delay = 0, done) => {
      tweens = tweens.filter(item => !(item.target === target && item.key === key));
      if (!duration || reduced) { target[key] = to; done?.(); return; }
      tweens.push({target, key, from: target[key], to, duration, ease, start: performance.now() + delay, done});
    };
    const draw = now => {
      if (destroyed) return;
      tweens = tweens.filter(item => { const t = Math.min(1, Math.max(0, (now - item.start) / item.duration)); item.target[item.key] = item.from + (item.to - item.from) * item.ease(t); if (t >= 1) { item.done?.(); return false; } return true; });
      const dpr = window.devicePixelRatio || 1, w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      for (const point of points) {
        const alpha = pointAlpha(point, glow, wave);
        if (alpha <= 0) continue;
        const size = G.maxPoint + (G.minPoint - G.maxPoint) * point.r / G.outer, s = size / G.maxPoint * 12 / 1.5 * DP;
        ctx.globalAlpha = alpha;
        if (dot.complete && dot.naturalWidth) ctx.drawImage(dot, w / 2 + point.x - s / 2, h / 2 + point.y - s / 2, s, s);
      }
      frame = requestAnimationFrame(draw);
    };
    const ping = () => { wave.alpha = 1; wave.radius = 54 * DP; tween(wave, 'radius', 2 * G.outer, G.wave, quad, 0, () => { wave.radius = 0; wave.alpha = 0; }); };
    const setActive = value => {
      if (value === active) return;
      active = value; root.classList.toggle('jbk-snapped', active);
      tween(glow, 'alpha', active ? 0 : 1, 0, cubicIn);
      if (active && haptic()) navigator.vibrate?.(20);
    };
    const move = event => {
      if (!grabbed || event.pointerId !== grabbed.id) return;
      event.preventDefault();
      const c = center(), dx = (event.clientX - c.x) / c.k, dy = (event.clientY - c.y) / c.k, distance = Math.hypot(dx, dy);
      const scale = distance > G.outer ? G.outer / distance : 1;
      glow.x = dx * scale; glow.y = dy * scale;
      setActive(distance > G.outer - G.snap);
    };
    const up = event => {
      if (!grabbed || event.pointerId !== grabbed.id) return;
      grabbed = null; root.classList.remove('jbk-grabbed');
      if (active) { root.classList.add('jbk-triggered'); if (haptic()) navigator.vibrate?.(20); onUnlock(); return; }
      tween(glow, 'alpha', 0, G.hide, quartOut); tween(glow, 'x', 0, G.hide, quartOut); tween(glow, 'y', 0, G.hide, quartOut, 0, ping);
    };
    handle.addEventListener('pointerdown', event => {
      if (event.button > 0) return;
      event.preventDefault(); event.stopPropagation();
      grabbed = {id: event.pointerId}; active = false;
      try { handle.setPointerCapture(event.pointerId); } catch {}
      root.classList.add('jbk-grabbed'); root.classList.remove('jbk-snapped');
      glow.x = 0; glow.y = 0; tween(glow, 'alpha', 1, 0, cubicIn);
      if (haptic()) navigator.vibrate?.(20);
    });
    handle.addEventListener('pointermove', move); handle.addEventListener('pointerup', up); handle.addEventListener('pointercancel', up);
    handle.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onUnlock(); } });
    root.addEventListener('pointerdown', event => { if (!event.target.closest('.jbk-handle')) ping(); });
    frame = requestAnimationFrame(draw); requestAnimationFrame(ping);
    return {ping, destroy() { destroyed = true; cancelAnimationFrame(frame); }, state: () => ({glow: {...glow}, wave: {...wave}, active, grabbed: !!grabbed})};
  }

  /* KeyguardWidgetPager: horizontal paging with the widget frames shown while scrolling; settling on the camera
     page launches the camera (CameraWidgetFrame). Long-pressing a user widget lets it be dragged up to Remove. */
  function pager(root, {count, current, onSettle, onCamera, onRemove, reduced}) {
    const track = root.querySelector('.jbk-track'), view = root.closest('.jb-keyguard');
    let page = current, start = null;
    const width = () => root.clientWidth;
    const place = (offset = 0, animate = false) => { track.style.transition = animate && !reduced ? 'transform .3s cubic-bezier(.22,.61,.36,1)' : 'none'; track.style.transform = `translateX(${-page * width() + offset}px)`; };
    place();
    root.addEventListener('pointerdown', event => {
      if (event.button > 0 || event.target.closest('button')) return;
      start = {x: event.clientX, y: event.clientY, id: event.pointerId, time: performance.now(), dragging: false, widget: event.target.closest('[data-kg-widget]')};
      if (start.widget) start.timer = setTimeout(() => { if (start && !start.dragging) { start.removing = true; view.classList.add('jbk-removing'); start.widget.classList.add('jbk-lifted'); try { root.setPointerCapture(start.id); } catch {} } }, 500);
    });
    root.addEventListener('pointermove', event => {
      if (!start || event.pointerId !== start.id) return;
      const dx = event.clientX - start.x, dy = event.clientY - start.y;
      if (start.removing) { event.preventDefault(); start.widget.style.transform = `translateY(${Math.min(0, dy)}px) scale(.9)`; view.classList.toggle('jbk-over-remove', event.clientY < view.getBoundingClientRect().top + 60); return; }
      if (!start.dragging && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) { start.dragging = true; clearTimeout(start.timer); view.classList.add('jbk-paging'); try { root.setPointerCapture(start.id); } catch {} }
      if (!start.dragging) { if (Math.hypot(dx, dy) > 8) clearTimeout(start.timer); return; }
      event.preventDefault();
      const edge = (page === 0 && dx > 0) || (page === count - 1 && dx < 0);
      place(edge ? dx * .3 : dx);
    });
    const finish = event => {
      if (!start || event.pointerId !== start.id) return;
      clearTimeout(start.timer);
      const dx = event.clientX - start.x, velocity = dx / Math.max(1, performance.now() - start.time);
      if (start.removing) {
        const remove = view.classList.contains('jbk-over-remove');
        view.classList.remove('jbk-removing', 'jbk-over-remove'); start.widget.classList.remove('jbk-lifted'); start.widget.style.transform = '';
        const id = start.widget.dataset.kgWidget; start = null;
        if (remove) onRemove(id);
        return;
      }
      if (start.dragging) {
        if (Math.abs(dx) > width() * .4 || Math.abs(velocity) > .5) page = Math.max(0, Math.min(count - 1, page + (dx < 0 ? 1 : -1)));
        place(0, true);
        setTimeout(() => view.classList.remove('jbk-paging'), 300);
        onSettle(page);
        if (page === count - 1) setTimeout(onCamera, reduced ? 0 : 300);
      }
      start = null;
    };
    root.addEventListener('pointerup', finish); root.addEventListener('pointercancel', finish);
    return {go(index) { page = Math.max(0, Math.min(count - 1, index)); place(0, true); onSettle(page); if (page === count - 1) setTimeout(onCamera, reduced ? 0 : 300); }, page: () => page};
  }
  window.JBKeyguard = {G, MAX_WIDGETS, pointCloud, pointAlpha, pages, defaultPage, render, glowPad, pager};
})();
