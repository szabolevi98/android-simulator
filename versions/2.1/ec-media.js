/* Android 2.1 simulator: the picture the camera "sees". The phone has no camera here, so the preview and the photos it
   takes are one drawn scene (sky, clouds, hills and a town skyline), different for each shot by its seed and moved a
   little by a hand's shake, then put through the colour effect and white balance chosen in the Camera's settings
   (CameraSettings' values). EC.media.draw(canvas, {seed, effect, wb, t}) draws it; EC.media.url(photo, w) caches a JPEG. */
(() => {
  'use strict';
  const rand = seed => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  function scene(ctx, w, h, seed, t = 0) {
    const r = rand(seed || 1), dx = Math.sin(t / 900) * w * 0.006, dy = Math.cos(t / 1300) * h * 0.006;
    ctx.save(); ctx.translate(dx, dy);
    const hue = 200 + r() * 20, sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
    sky.addColorStop(0, `hsl(${hue},55%,${45 + r() * 15}%)`); sky.addColorStop(1, `hsl(${hue - 10},45%,${78 + r() * 10}%)`);
    ctx.fillStyle = sky; ctx.fillRect(-w * 0.05, -h * 0.05, w * 1.1, h * 1.1);
    for (let i = 0; i < 6; i++) {   // clouds
      const cx = r() * w, cy = h * (0.08 + r() * 0.3), s = w * (0.08 + r() * 0.12);
      ctx.fillStyle = `rgba(255,255,255,${0.35 + r() * 0.4})`;
      for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.ellipse(cx + (k - 1.5) * s * 0.5, cy + (k % 2) * s * 0.12, s * 0.45, s * 0.22, 0, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.fillStyle = `hsl(${110 + r() * 30},20%,${38 + r() * 10}%)`;   // hills
    ctx.beginPath(); ctx.moveTo(-w * 0.05, h * 0.62);
    for (let x = 0; x <= 10; x++) ctx.lineTo(w * x / 10, h * (0.52 + Math.sin(x * 1.3 + r() * 2) * 0.04));
    ctx.lineTo(w * 1.05, h); ctx.lineTo(-w * 0.05, h); ctx.fill();
    for (let x = -0.02; x < 1.02;) {   // buildings
      const bw = w * (0.04 + r() * 0.07), bh = h * (0.12 + r() * 0.3), by = h * 0.72 - bh, light = 55 + r() * 30;
      ctx.fillStyle = `hsl(${30 + r() * 30},${10 + r() * 20}%,${light}%)`; ctx.fillRect(w * x, by, bw, bh + h * 0.3);
      ctx.fillStyle = `hsla(210,30%,${light - 30}%,0.8)`;
      for (let wy = by + h * 0.02; wy < h * 0.7; wy += h * 0.035) for (let wx = w * x + bw * 0.12; wx < w * x + bw - bw * 0.15; wx += bw * 0.22) ctx.fillRect(wx, wy, bw * 0.1, h * 0.015);
      x += bw / w + 0.004;
    }
    const road = ctx.createLinearGradient(0, h * 0.72, 0, h); road.addColorStop(0, '#6d6d68'); road.addColorStop(1, '#3d3d3a');
    ctx.fillStyle = road; ctx.fillRect(-w * 0.05, h * 0.72, w * 1.1, h * 0.35);
    ctx.restore();
  }
  // CameraSettings colour effects and white balance, on the drawn pixels.
  function effect(ctx, w, h, fx, wb) {
    if ((!fx || fx === 'none') && (!wb || wb === 'auto')) return;
    const img = ctx.getImageData(0, 0, w, h), d = img.data;
    const balance = {incandescent: [0.85, 0.95, 1.25], daylight: [1.05, 1, 0.92], fluorescent: [0.95, 1.05, 1.05], 'cloudy-daylight': [1.1, 1, 0.88]}[wb] || [1, 1, 1];
    for (let i = 0; i < d.length; i += 4) {
      let r = d[i] * balance[0], g = d[i + 1] * balance[1], b = d[i + 2] * balance[2];
      const y = 0.299 * r + 0.587 * g + 0.114 * b;
      switch (fx) {
        case 'mono': r = g = b = y; break;
        case 'sepia': r = y * 1.07 + 20; g = y * 0.95 + 8; b = y * 0.78; break;
        case 'negative': r = 255 - r; g = 255 - g; b = 255 - b; break;
        case 'solarize': if (r > 128) r = 255 - r; if (g > 128) g = 255 - g; if (b > 128) b = 255 - b; r *= 2; g *= 2; b *= 2; break;
        case 'posterize': r = Math.round(r / 64) * 64; g = Math.round(g / 64) * 64; b = Math.round(b / 64) * 64; break;
        case 'aqua': r = y * 0.6; g = y * 0.95 + 15; b = y * 1.05 + 30; break;
        case 'pastel': r = r * 0.6 + 100; g = g * 0.6 + 100; b = b * 0.6 + 100; break;
        case 'red-tint': r = y * 1.25; g = y * 0.85; b = y * 0.85; break;
        case 'blue-tint': r = y * 0.85; g = y * 0.9; b = y * 1.25; break;
        case 'green-tint': r = y * 0.85; g = y * 1.2; b = y * 0.85; break;
      }
      d[i] = r; d[i + 1] = g; d[i + 2] = b;
    }
    ctx.putImageData(img, 0, 0);
    if (fx === 'mosaic') {
      const s = Math.max(4, Math.round(w / 60)), tmp = document.createElement('canvas'); tmp.width = Math.ceil(w / s); tmp.height = Math.ceil(h / s);
      tmp.getContext('2d').drawImage(ctx.canvas, 0, 0, tmp.width, tmp.height); ctx.imageSmoothingEnabled = false; ctx.drawImage(tmp, 0, 0, w, h); ctx.imageSmoothingEnabled = true;
    }
  }
  function draw(canvas, {seed, effect: fx, wb, t} = {}) {
    const ctx = canvas.getContext('2d', {willReadFrequently: true}), w = canvas.width, h = canvas.height;
    scene(ctx, w, h, seed, t); effect(ctx, w, h, fx, wb);
  }
  const cache = new Map();
  function url(photo, w = 320) {
    const key = `${photo.id}:${w}`;
    if (!cache.has(key)) {
      const c = document.createElement('canvas'); c.width = w; c.height = Math.round(w * 3 / 4);
      draw(c, photo); cache.set(key, c.toDataURL('image/jpeg', 0.85));
    }
    return cache.get(key);
  }
  EC.media = {draw, url};
})();
