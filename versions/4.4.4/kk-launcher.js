/* KitKat Google Now Launcher workspace behaviour (Launcher3 android-4.4.4_r1, which GoogleHome builds on): items move out
   of the way (CellLayout reorder) and widgets resize. DynamicGrid gives the Nexus 5 a 4 x 4 workspace. */
(() => {
  'use strict';
  const COLS = 4, ROWS = 4;
  // Workspace.REORDER_TIMEOUT (350 ms in Launcher3, 250 in Launcher2), CellLayout.REORDER_ANIMATION_DURATION,
  // AppWidgetResizeFrame.RESIZE_THRESHOLD, and Workspace's folder-creation radius (0.55 of the icon size).
  const REORDER_TIMEOUT = 350, REORDER_DURATION = 150, RESIZE_THRESHOLD = .66, FOLDER_RADIUS = .55;
  const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const inside = rect => rect.x >= 0 && rect.y >= 0 && rect.x + rect.w <= COLS && rect.y + rect.h <= ROWS;
  // One page as rectangles: shortcuts/folders are 1 x 1, widgets keep their spans.
  function items(page, widgets, spanOf) {
    const list = [];
    page.forEach((id, slot) => { if (id) list.push({key: `s${slot}`, kind: 'shortcut', id, x: slot % COLS, y: Math.floor(slot / COLS), w: 1, h: 1}); });
    widgets.forEach(widget => { const span = spanOf(widget); list.push({key: `w${widget.id}`, kind: 'widget', id: widget.id, x: widget.x, y: widget.y, w: span.width, h: span.height}); });
    return list;
  }
  /* A simplified CellLayout.findReorderSolution: reserve the drop rectangle, then move each overlapped item to the
     nearest free area, preferring the side the drag came from. Returns null when no arrangement fits. */
  function solve(list, moving, direction = [0, 0]) {
    const target = {x: moving.x, y: moving.y, w: moving.w, h: moving.h};
    if (!inside(target)) return null;
    const others = list.filter(item => item.key !== moving.key);
    const displaced = others.filter(item => overlaps(item, target));
    if (!displaced.length) return {moves: {}};
    const placed = others.filter(item => !displaced.includes(item)).map(item => ({...item}));
    placed.push(target);
    const moves = {};
    displaced.sort((a, b) => (b.w * b.h) - (a.w * a.h) || Math.hypot(a.x - target.x, a.y - target.y) - Math.hypot(b.x - target.x, b.y - target.y));
    for (const item of displaced) {
      let best = null, score = Infinity;
      for (let y = 0; y <= ROWS - item.h; y++) for (let x = 0; x <= COLS - item.w; x++) {
        const rect = {x, y, w: item.w, h: item.h};
        if (placed.some(other => overlaps(rect, other))) continue;
        const dx = x - item.x, dy = y - item.y;
        // Distance, with a small bonus for moving away from the incoming item (Launcher pushes in the drag direction).
        const s = Math.hypot(dx, dy) - .25 * (dx * -direction[0] + dy * -direction[1]) + .001 * (y * COLS + x);
        if (s < score) { score = s; best = rect; }
      }
      if (!best) return null;
      placed.push(best); moves[item.key] = {x: best.x, y: best.y};
    }
    return {moves};
  }
  // Apply a solution to the saved page: shortcut slots move, widget origins change.
  function apply(page, widgets, moves) {
    const next = page.slice(), moved = [];
    for (const [key, to] of Object.entries(moves)) {
      if (key[0] === 's') { const slot = Number(key.slice(1)); moved.push([page[slot], to]); next[slot] = null; }
      else { const widget = widgets.find(item => `w${item.id}` === key); if (widget) { widget.x = to.x; widget.y = to.y; } }
    }
    for (const [id, to] of moved) next[to.y * COLS + to.x] = id;
    return next;
  }
  // AppWidgetResizeFrame: a handle moves the span edge once the drag passes 66% of a cell.
  function resizeSpan(span, delta, cell, min, max) {
    const steps = delta / cell, change = Math.abs(steps - Math.trunc(steps)) > RESIZE_THRESHOLD ? Math.trunc(steps) + Math.sign(steps) : Math.trunc(steps);
    return Math.max(min, Math.min(max, span + change));
  }
  // Workspace.willCreateUserFolder: within 0.55 icon sizes of the icon centre, a drop makes a folder instead.
  const folderZone = (pointer, centre, icon) => Math.hypot(pointer.x - centre.x, pointer.y - centre.y) < FOLDER_RADIUS * icon;
  window.JBLauncher = {COLS, ROWS, REORDER_TIMEOUT, REORDER_DURATION, RESIZE_THRESHOLD, FOLDER_RADIUS, overlaps, items, solve, apply, resizeSpan, folderZone};
})();
