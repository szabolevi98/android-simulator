/* Android 2.1 LockPatternView (framework.jar com.android.internal.widget.LockPatternView): a square of 3 x 3 cells, each
   with the outer circle (indicator_code_lock_point_area_default / green / red, 128 px) and the button (btn_code_lock_default /
   touched) centred in it; the path in white at alpha 128, as wide as half a cell's radius (mDiameterFactor 0.5), round
   joins and caps, to the finger while drawing; the drag-direction arrows (green / red up, turned toward the next cell)
   when the path shows; hit areas 0.6 of a cell (mHitFactor); a cell skipped on a straight line is added
   (detectAndAddHit). Display modes: correct (green), wrong (red), animate (MILLIS_PER_CIRCLE_ANIMATING 700 per cell).
   EC.pattern(canvas, {onStart, onCellAdded, onDone(cells), stealth, tactile}) returns {clear, show(cells, mode), enable}. */
(() => {
  'use strict';
  const img = src => { const i = new Image(); i.src = src; return i; };
  const B = {
    btnDefault: img('assets/fw-btn_code_lock_default.png'), btnTouched: img('assets/fw-btn_code_lock_touched.png'),
    circleDefault: img('assets/fw-indicator_code_lock_point_area_default.png'), circleGreen: img('assets/fw-indicator_code_lock_point_area_green.png'),
    circleRed: img('assets/fw-indicator_code_lock_point_area_red.png'),
    arrowGreen: img('assets/fw-indicator_code_lock_drag_direction_green_up.png'), arrowRed: img('assets/fw-indicator_code_lock_drag_direction_red_up.png')
  };
  EC.pattern = (canvas, opts = {}) => {
    const ctx = canvas.getContext('2d');
    let cells = [], mode = 'correct', drawing = false, finger = null, enabled = true, animStart = 0, frame = 0;
    const size = () => canvas.width;                   // the canvas is square, in the phone's pixels × ratio
    const sq = () => size() / 3, k = () => size() / 480;  // bitmaps are hdpi pixels on a 480 px wide view
    const center = (r, cIdx) => [sq() * cIdx + sq() / 2, sq() * r + sq() / 2];
    const has = (r, cIdx) => cells.some(c => c[0] === r && c[1] === cIdx);
    function hit(x, y) {
      const h = sq() * 0.6, row = [0, 1, 2].find(r => Math.abs(y - (sq() * r + sq() / 2)) < h / 2), col = [0, 1, 2].find(c => Math.abs(x - (sq() * c + sq() / 2)) < h / 2);
      return row === undefined || col === undefined ? null : [row, col];
    }
    function add(cell) {
      const last = cells.at(-1);
      if (last) {   // fill in the cell between two on a line
        const dr = cell[0] - last[0], dc = cell[1] - last[1];
        if ((Math.abs(dr) === 2 || dr === 0) && (Math.abs(dc) === 2 || dc === 0)) {
          const mid = [last[0] + Math.sign(dr), last[1] + Math.sign(dc)];
          if (!has(...mid)) { cells.push(mid); opts.onCellAdded?.(cells); }
        }
      }
      cells.push(cell); opts.onCellAdded?.(cells);
      if (opts.tactile) navigator.vibrate?.(35);
    }
    function draw(now = performance.now()) {
      frame = 0;
      const s = size(), q = sq(), kk = k();
      ctx.clearRect(0, 0, s, s);
      let shown = cells;
      if (mode === 'animate') {
        const n = Math.floor((now - animStart) / 700) % (cells.length + 1);
        shown = cells.slice(0, n);
      }
      const showPath = !opts.stealth || mode === 'wrong';
      // circles
      for (let r = 0; r < 3; r++) for (let cIdx = 0; cIdx < 3; cIdx++) {
        const part = shown.some(c => c[0] === r && c[1] === cIdx) && showPath;
        const outer = !part ? B.circleDefault : mode === 'wrong' ? B.circleRed : B.circleGreen, inner = part ? B.btnTouched : B.btnDefault;
        const [x, y] = center(r, cIdx), w = 128 * kk;
        if (outer.complete) ctx.drawImage(outer, x - w / 2, y - w / 2, w, w);
        if (inner.complete) ctx.drawImage(inner, x - w / 2, y - w / 2, w, w);
      }
      if (showPath && shown.length) {
        // arrows, turned toward the next cell, at the top of the circle
        const arrow = mode === 'wrong' ? B.arrowRed : B.arrowGreen;
        for (let i = 0; i < shown.length - 1; i++) {
          const [x1, y1] = center(...shown[i]), [x2, y2] = center(...shown[i + 1]);
          const angle = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2, w = 32 * kk;
          ctx.save(); ctx.translate(x1, y1); ctx.rotate(angle); if (arrow.complete) ctx.drawImage(arrow, -w / 2, -64 * kk + 6 * kk, w, w); ctx.restore();
        }
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = q * 0.5 * 0.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath();
        shown.forEach((cell, i) => { const [x, y] = center(...cell); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
        if (drawing && finger) ctx.lineTo(finger[0], finger[1]);
        ctx.stroke(); ctx.restore();
      }
      if (mode === 'animate') frame = requestAnimationFrame(draw);
    }
    const point = event => { const r = canvas.getBoundingClientRect(); return [(event.clientX - r.left) * canvas.width / r.width, (event.clientY - r.top) * canvas.height / r.height]; };
    canvas.addEventListener('pointerdown', event => {
      if (!enabled) return;
      canvas.setPointerCapture?.(event.pointerId);
      cells = []; mode = 'correct'; drawing = true; finger = point(event);
      opts.onStart?.();
      const h = hit(...finger); if (h) add(h);
      draw();
    });
    canvas.addEventListener('pointermove', event => {
      if (!drawing) return;
      finger = point(event);
      const h = hit(...finger); if (h && !has(...h)) add(h);
      draw();
    });
    const end = () => { if (!drawing) return; drawing = false; finger = null; draw(); if (cells.length) opts.onDone?.(cells.map(c => c[0] * 3 + c[1])); };
    canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
    for (const b of Object.values(B)) if (!b.complete) b.addEventListener('load', () => draw(), {once: true});
    draw();
    return {
      clear() { cancelAnimationFrame(frame); cells = []; mode = 'correct'; draw(); },
      show(list, m = 'correct') { cancelAnimationFrame(frame); cells = list.map(i => [Math.floor(i / 3), i % 3]); mode = m; animStart = performance.now(); draw(); },
      setMode(m) { mode = m; draw(); },
      enable(on) { enabled = on; }
    };
  };
})();
