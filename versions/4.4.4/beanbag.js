/* SystemUI BeanBag from Android 4.3 (BeanBag.java): drifting, spinning jelly beans that can be grabbed and flung. */
(() => {
  'use strict';
  const NUM_BEANS = 40, MIN_SCALE = .2, MAX_SCALE = 1, LUCKY = .001;
  const BEANS = ['redbean0', 'redbean0', 'redbean0', 'redbean0', 'redbean1', 'redbean1', 'redbean2', 'redbean2', 'redbeandroid'];
  const COLORS = [0x00CC00, 0xCC0000, 0x0000CC, 0xFFFF00, 0xFF8000, 0x00CCFF, 0xFF0080, 0x8000FF, 0xFF8080, 0x8080FF, 0xB0C0D0, 0xDDDDDD, 0x333333];
  // Bitmaps are drawn at device pixels on the xhdpi Galaxy Nexus; CSS pixels are roughly half of that.
  const DEVICE = .5, MAX_RADIUS = 576 * MAX_SCALE * DEVICE;
  const lerp = (a, b, f) => (b - a) * f + a, range = (random, a, b) => lerp(a, b, random()), pick = (random, list) => list[Math.floor(random() * list.length)];
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value)), sign = random => random() < .5 ? -1 : 1;
  // Bean.pickBean's ColorMatrix: M[0], M[5] and M[10] are the first column, so red drives all three channels on top of identity.
  const filters = () => `<svg class="svg-defs" width="0" height="0" aria-hidden="true">${COLORS.map((color, i) => `<filter id="bean-color-${i}" color-interpolation-filters="sRGB"><feColorMatrix values="${((color >> 16) & 255) / 255} 0 0 0 0  ${((color >> 8) & 255) / 255} 1 0 0 0  ${(color & 255) / 255} 0 1 0 0  0 0 0 1 0"/></filter>`).join('')}</svg>`;

  function bean(index, board, random) {
    const z = (index / NUM_BEANS) ** 2;
    const item = {z, grabbed: false};
    reset(item, board, random);
    item.x = range(random, 0, board.width); item.y = range(random, 0, board.height);
    return item;
  }
  function reset(item, board, random) {
    item.image = random() <= LUCKY ? 'jandycane' : pick(random, BEANS);
    item.color = item.image === 'jandycane' ? -1 : Math.floor(random() * COLORS.length);
    item.w = (item.image === 'jandycane' ? 131 : 256) * DEVICE; item.size = 256 * DEVICE;
    item.scale = lerp(MIN_SCALE, MAX_SCALE, item.z);
    item.r = .3 * Math.max(item.w, item.size) * item.scale;
    item.a = range(random, 0, 360); item.va = range(random, -30, 30);
    item.vx = range(random, -40, 40) * item.z * DEVICE; item.vy = range(random, -40, 40) * item.z * DEVICE;
    if (random() < .5) {
      item.x = item.vx < 0 ? board.width + 2 * item.r : -item.r * 4;
      item.y = range(random, 0, board.height - 3 * item.r) * .5 + (item.vy < 0 ? board.height * .5 : 0);
    } else {
      item.y = item.vy < 0 ? board.height + 2 * item.r : -item.r * 4;
      item.x = range(random, 0, board.width - 3 * item.r) * .5 + (item.vx < 0 ? board.width * .5 : 0);
    }
    item.changed = true;
  }
  function step(items, board, dt, random) {
    for (const item of items) {
      if (item.grabbed) {
        item.vx = item.vx * .75 + (item.grabX - item.x) / dt * .25; item.x = item.grabX;
        item.vy = item.vy * .75 + (item.grabY - item.y) / dt * .25; item.y = item.grabY;
      } else { item.x += item.vx * dt; item.y += item.vy * dt; item.a += item.va * dt; }
      if (item.x < -MAX_RADIUS || item.x > board.width + MAX_RADIUS || item.y < -MAX_RADIUS || item.y > board.height + MAX_RADIUS) reset(item, board, random);
    }
  }
  // ACTION_UP: spin proportional to the release speed.
  function release(item, random) {
    item.grabbed = false;
    const spin = sign(random) * clamp(Math.hypot(item.vx, item.vy) / DEVICE * .33, 0, 1080);
    item.va = range(random, spin * .5, spin);
  }

  function start(root, random = Math.random) {
    const board = {width: root.clientWidth, height: root.clientHeight};
    const items = Array.from({length: NUM_BEANS}, (_, i) => bean(i, board, random));
    root.innerHTML = filters() + items.map((_, i) => `<img class="bean" data-bean="${i}" alt="" draggable="false">`).join('');
    const nodes = [...root.querySelectorAll('.bean')];
    let last = performance.now(), frame = 0, running = true;
    const paint = () => items.forEach((item, i) => {
      const node = nodes[i];
      if (item.changed) { node.src = `assets/${item.image}.png`; node.style.width = `${item.w}px`; node.style.height = `${item.size}px`; node.style.filter = item.color < 0 ? '' : `url(#bean-color-${item.color})`; item.changed = false; }
      node.style.transform = `translate(${item.x - item.w / 2}px,${item.y - item.size / 2}px) rotate(${item.a}deg) scale(${item.scale})`;
    });
    const tick = now => {
      if (!running) return;
      board.width = root.clientWidth || board.width; board.height = root.clientHeight || board.height;
      step(items, board, Math.min(.1, Math.max(.001, (now - last) / 1000)), random); last = now; paint();
      frame = requestAnimationFrame(tick);
    };
    const local = event => { const rect = root.getBoundingClientRect(), k = rect.width / root.clientWidth || 1; return [(event.clientX - rect.left) / k, (event.clientY - rect.top) / k]; };
    const grabs = new Map();
    root.addEventListener('pointerdown', event => {
      const node = event.target.closest('.bean'); if (!node) return;
      const item = items[Number(node.dataset.bean)], [x, y] = local(event);
      item.grabbed = true; item.offsetX = x - item.x; item.offsetY = y - item.y; item.grabX = item.x; item.grabY = item.y; item.va = 0;
      grabs.set(event.pointerId, item); try { root.setPointerCapture(event.pointerId); } catch {}
      event.preventDefault(); event.stopPropagation();
    });
    root.addEventListener('pointermove', event => { const item = grabs.get(event.pointerId); if (!item) return; const [x, y] = local(event); item.grabX = x - item.offsetX; item.grabY = y - item.offsetY; });
    const up = event => { const item = grabs.get(event.pointerId); if (item) { release(item, random); grabs.delete(event.pointerId); } };
    root.addEventListener('pointerup', up); root.addEventListener('pointercancel', up);
    paint(); frame = requestAnimationFrame(tick);
    return {items, stop() { running = false; cancelAnimationFrame(frame); }};
  }
  window.JBBeanBag = {NUM_BEANS, MIN_SCALE, MAX_SCALE, COLORS, BEANS, bean, reset, step, release, start};
})();
