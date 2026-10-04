/* AOSP live wallpapers of the Nexus S build (android-2.3.6_r1 packages/wallpapers/Basic, MusicVisualization and MagicSmoke),
   redrawn from their RenderScript and Canvas sources. Nexus is the Nexus S version from the crespo
   overlay (device/samsung/crespo overlay/packages/wallpapers/Basic): its dark light-wave background and nexus.rs with a
   random scale per pulse; Magic Smoke is clouds.rs with MagicSmokeRS's twenty presets. Galaxy and Water use WebGL like the originals; Nexus, Grass
   and Polar clock draw on a 2D canvas. Sizes written in device pixels are scaled from the panel width (480px Nexus S, 720px Galaxy Nexus, 768px Nexus 4). */
(() => {
  'use strict';
  let DEVICE_WIDTH = 720; // the panel width in device pixels: 480 on the Nexus S, 720 on the Galaxy Nexus, 768 on the Nexus 4
  const rand = (a, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a);
  const irand = n => Math.floor(Math.random() * n);
  const mix = (a, b, t) => a + (b - a) * t;
  const images = {};
  function image(src) {
    if (!images[src]) { const img = new Image(); img.src = src; images[src] = img; }
    return images[src];
  }
  const ready = img => img.complete && img.naturalWidth > 0;

  /* ---------- 4×4 matrices (column-major, as rs_matrix4x4 and android.renderscript.Matrix4f) ---------- */
  const M = {
    identity: () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    multiply(a, b) { const o = new Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; },
    translate: (x, y, z) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1],
    scale: (x, y, z) => [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1],
    rotate(deg, x, y, z) {
      const len = Math.hypot(x, y, z); if (!len) return M.identity();
      x /= len; y /= len; z /= len;
      const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r), nc = 1 - c;
      return [x * x * nc + c, y * x * nc + z * s, x * z * nc - y * s, 0, x * y * nc - z * s, y * y * nc + c, y * z * nc + x * s, 0, x * z * nc + y * s, y * z * nc - x * s, z * z * nc + c, 0, 0, 0, 0, 1];
    },
    frustum(l, r, b, t, n, f) { return [2 * n / (r - l), 0, 0, 0, 0, 2 * n / (t - b), 0, 0, (r + l) / (r - l), (t + b) / (t - b), -(f + n) / (f - n), -1, 0, 0, -2 * f * n / (f - n), 0]; },
    // Matrix4f.loadProjectionNormalized: -1..1 across the narrow axis at z = 0.
    projectionNormalized(w, h) {
      let m = w > h ? M.frustum(-w / h, w / h, -1, 1, 1, 100) : M.frustum(-1, 1, -h / w, h / w, 1, 100);
      m = M.multiply(m, M.rotate(180, 0, 1, 0)); m = M.multiply(m, M.scale(-2, 2, 1)); return M.multiply(m, M.translate(0, 0, 2));
    },
    ortho(w, h) { return [2 / w, 0, 0, 0, 0, -2 / h, 0, 0, 0, 0, -1, 0, -1, 1, 0, 1]; }
  };

  /* ---------- Small WebGL helper ---------- */
  function gl3(canvas) {
    const gl = canvas.getContext('webgl', {premultipliedAlpha: false, alpha: false, antialias: true, preserveDrawingBuffer: false});
    if (!gl) return null;
    const program = (vs, fs) => {
      const p = gl.createProgram();
      for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); gl.attachShader(p, s); }
      gl.linkProgram(p); return p;
    };
    const texture = (img, repeat = false, premultiply = false) => {
      const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premultiply);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      const pot = n => (n & (n - 1)) === 0, mip = pot(img.width) && pot(img.height);
      if (mip) gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      const wrap = repeat && mip ? gl.REPEAT : gl.CLAMP_TO_EDGE;
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
      return t;
    };
    const buffer = data => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW); return b; };
    return {gl, program, texture, buffer};
  }
  // A textured quad program shared by backgrounds, lights and leaves: position, texcoord, matrix and a modulating colour.
  const QUAD_VS = 'attribute vec3 aPos;attribute vec2 aTex;uniform mat4 uMVP;varying vec2 vTex;void main(){vTex=aTex;gl_Position=uMVP*vec4(aPos,1.0);}';
  const QUAD_FS = 'precision mediump float;uniform sampler2D uTex;uniform vec4 uColor;varying vec2 vTex;void main(){gl_FragColor=texture2D(uTex,vTex)*uColor;}';
  function quadDrawer(G) {
    const {gl} = G, prog = G.program(QUAD_VS, QUAD_FS), buf = gl.createBuffer();
    const loc = {pos: gl.getAttribLocation(prog, 'aPos'), tex: gl.getAttribLocation(prog, 'aTex'), mvp: gl.getUniformLocation(prog, 'uMVP'), color: gl.getUniformLocation(prog, 'uColor'), sampler: gl.getUniformLocation(prog, 'uTex')};
    // corners: [x, y, z, u, v] × 4 in fan order
    return (texture, mvp, corners, color = [1, 1, 1, 1]) => {
      gl.useProgram(prog); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(corners.flat()), gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(loc.pos); gl.vertexAttribPointer(loc.pos, 3, gl.FLOAT, false, 20, 0);
      gl.enableVertexAttribArray(loc.tex); gl.vertexAttribPointer(loc.tex, 2, gl.FLOAT, false, 20, 12);
      gl.uniformMatrix4fv(loc.mvp, false, new Float32Array(mvp)); gl.uniform4fv(loc.color, color);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture); gl.uniform1i(loc.sampler, 0);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    };
  }

  /* ---------- Nexus (nexus.rs): coloured pulses with glowing heads running along a 14px grid ----------
     The script works in device pixels (14 px cells, 64 px glow), so the scene runs in panel pixels and is scaled to the canvas. */
  function nexus(ctx, assets) {
    const COLORS = [[1, 0, 0], [0, .8, 0], [0, .4, .9], [1, .8, 0]], SPEED = 0.2, PULSE = 14, GLOW = 64, TRAIL = 40, MAX_DELAY = 2000;
    const bg = image(assets + 'lw-pyramid_background.png?v=2'), pulseImg = image(assets + 'lw-pulse.png'), glowImg = image(assets + 'lw-glow.png');
    let tinted = null;
    // Modulate by the constant colour (alpha 0.8); 'lighter' then adds them as BlendSrcFunc.SRC_ALPHA / ONE does.
    const tint = (img, [r, g, b], keepAlpha) => {
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d');
      x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, c.width, c.height);
      for (let i = 0; i < d.data.length; i += 4) { d.data[i] *= r; d.data[i + 1] *= g; d.data[i + 2] *= b; d.data[i + 3] = (keepAlpha ? d.data[i + 3] : 255) * .8; }
      x.putImageData(d, 0, 0); return c;
    };
    const state = {pulses: [], extras: [], w: 0, h: 0, k: 1};
    const now = () => performance.now();
    function init(p, extra) {
      // crespo nexus.rs: every pulse gets a random scale (0.7-1.7) that sets both its size and its speed, so the
      // pulses look as if they ran at different depths; origins on the far edges are divided by the scale.
      const {w, h} = state, scale = rand(.7, 1.7); p.scale = scale;
      if (Math.random() > .5) { p.originX = irand(w * 2 / PULSE) * PULSE; p.dx = 0; if (Math.random() > .5) { p.originY = 0; p.dy = scale; } else { p.originY = h / scale; p.dy = -scale; } }
      else { p.originY = irand(h / PULSE) * PULSE; p.dy = 0; if (Math.random() > .5) { p.originX = 0; p.dx = scale; } else { p.originX = w * 2 / scale; p.dx = -scale; } }
      p.start = now() + rand(MAX_DELAY); p.color = irand(4); p.active = !extra;
    }
    return {
      interval: 45,
      resize(cw, ch) { state.k = cw / DEVICE_WIDTH; state.w = DEVICE_WIDTH; state.h = ch / state.k; state.pulses = Array.from({length: 20}, () => { const p = {}; init(p, false); return p; }); state.extras = Array.from({length: 40}, () => ({active: false, extra: true})); },
      // NexusRS.onCommand: the tap moves with the scrolled background, x + xOffset * (960 - width) on the 2-screen texture.
      tap(x, y, offset = .5) {
        // crespo nexus.rs addTap: the four pulses share a random scale (0.9-1.9), which is also their speed.
        let color = irand(4), count = 0; const scale = rand(.9, 1.9), speed = scale; x = Math.floor((x / state.k + offset * state.w) / PULSE) * PULSE; y = Math.floor(y / state.k / PULSE) * PULSE;
        for (const p of state.extras) {
          if (p.active) continue;
          Object.assign(p, {originX: x / scale, originY: y / scale, scale, dx: [speed, -speed, 0, 0][count], dy: [0, 0, speed, -speed][count], active: true, color, start: now()});
          color = (color + 1) % 4; if (++count === 4) break;
        }
      },
      draw(offset) {
        const {w, h, k} = state;
        ctx.save(); ctx.scale(k, k);
        ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
        if (ready(bg)) ctx.drawImage(bg, -offset * w, 0, w * 2, h);
        if (!ready(pulseImg) || !ready(glowImg)) { ctx.restore(); return; }
        tinted ||= COLORS.map(c => [tint(pulseImg, c, true), tint(glowImg, c, false)]);
        ctx.globalCompositeOperation = 'lighter';
        const t = now();
        for (const p of [...state.pulses, ...state.extras]) {
          const delta = t - p.start; if (!p.active || delta < 0) continue;
          const s = p.scale, [trail, glow] = tinted[p.color];
          let x = p.originX + p.dx * SPEED * delta, y = p.originY + p.dy * SPEED * delta;
          ctx.save(); ctx.translate(-offset * w, 0); ctx.scale(s, s);
          let done = false;
          if (p.dx < 0) { const xx = x + TRAIL * PULSE; if (xx <= 0) done = true; else { ctx.drawImage(trail, x, y, xx - x, PULSE); ctx.drawImage(glow, x + PULSE / 2 - GLOW / 2, y + PULSE / 2 - GLOW / 2, GLOW, GLOW); } }
          else if (p.dx > 0) { x += PULSE; const xx = x - TRAIL * PULSE; if (xx >= w * 2) done = true; else { ctx.save(); ctx.translate(x, y); ctx.scale(-1, 1); ctx.drawImage(trail, 0, 0, x - xx, PULSE); ctx.restore(); ctx.drawImage(glow, x - PULSE / 2 - GLOW / 2, y + PULSE / 2 - GLOW / 2, GLOW, GLOW); } }
          else if (p.dy < 0) { const yy = y + TRAIL * PULSE; if (yy <= 0) done = true; else { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 2); ctx.drawImage(trail, 0, -PULSE, yy - y, PULSE); ctx.restore(); ctx.drawImage(glow, x + PULSE / 2 - GLOW / 2, y + PULSE / 2 - GLOW / 2, GLOW, GLOW); } }
          else if (p.dy > 0) { y += PULSE; const yy = y - TRAIL * PULSE; if (yy >= h) done = true; else { ctx.save(); ctx.translate(x, y); ctx.rotate(-Math.PI / 2); ctx.drawImage(trail, 0, 0, y - yy, PULSE); ctx.restore(); ctx.drawImage(glow, x + PULSE / 2 - GLOW / 2, y - PULSE / 2 - GLOW / 2, GLOW, GLOW); } }
          ctx.restore();
          if (done) { if (p.extra) p.active = false; else init(p, false); }
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
      }
    };
  }

  /* ---------- Polar clock (PolarClockWallpaper): round-capped arcs for seconds, minutes, hours, day and month ---------- */
  const PALETTES = {
    palette_white_c: {kind: 'cycling', background: '#FFFFFF', s: .8, b: .9},
    palette_black_c: {kind: 'cycling', background: '#000000', s: 1, b: .25},
    palette_gray: {background: '#555555', second: '#CC8800', minute: '#333333', hour: '#000000', day: '#999999', month: '#777777'},
    palette_violet: {background: '#181020', second: '#602070', minute: '#603050', hour: '#040008', day: '#706080', month: '#403050'},
    palette_matrix: {background: '#002200', second: '#00FF00', minute: '#00BB00', hour: '#007700', day: '#00AA00', month: '#006600'},
    palette_halloween: {background: '#884400', second: '#FFFF00', minute: '#FF8800', hour: '#FF8800', day: '#000000', month: '#000000'},
    palette_zenburn: {background: '#3f3f3f', second: '#8aCCCF', minute: '#CB9292', hour: '#CCDC90', day: '#DCA3A3', month: '#7f9f7f'},
    palette_oceanic: {background: '#000066', second: '#6666FF', minute: '#0000FF', hour: '#0000AA', day: '#000033', month: '#000011'}
  };
  // polar_clock_palette_ids order, as listed in the settings.
  const PALETTE_NAMES = {palette_gray: 'Iron', palette_white_c: 'Polar Bear (dynamic)', palette_black_c: 'Black Hole (dynamic)', palette_matrix: 'Green Screen', palette_halloween: 'Pumpkin Pie', palette_violet: 'Midnight', palette_oceanic: 'Blue Laser', palette_zenburn: 'Alien Fruit Salad'};
  const PALETTE_ORDER = ['palette_gray', 'palette_white_c', 'palette_black_c', 'palette_matrix', 'palette_halloween', 'palette_violet', 'palette_oceanic', 'palette_zenburn'];
  const hsb = (h, s, v) => { const i = Math.floor(h * 6), f = h * 6 - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s); const [r, g, b] = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i % 6]; return `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`; };
  function polarClock(ctx, assets, prefs) {
    const state = {w: 0, h: 0};
    return {
      get interval() { return prefs().showSeconds === false ? 2000 : 40; },
      resize(w, h) { state.w = w; state.h = h; },
      draw(offset, clock) {
        const {w, h} = state, k = w / DEVICE_WIDTH, p = prefs(), showSeconds = p.showSeconds !== false, variable = p.variableWidth !== false;
        const pal = PALETTES[p.palette] || {kind: 'cycling', background: '#FFFFFF', s: .8, b: .9};
        const color = (ring, angle) => pal.kind === 'cycling' ? hsb(angle >= 1 || angle < 0 ? 0 : angle, pal.s, pal.b) : pal[ring];
        const now = clock(), millis = now.getTime();
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = pal.background; ctx.fillRect(0, 0, w, h);
        const s = w / 2, t = h / 2;
        ctx.translate(s + mix(s, -s, offset), t); ctx.rotate(-Math.PI / 2); if (h < w) ctx.scale(.9, .9);
        ctx.lineCap = 'round';
        let size = Math.min(w, h) * .5 - 24 * k, last = 24 * k;
        const ring = (angle, name, thickness) => { ctx.strokeStyle = color(name, angle); if (variable) last = thickness * k; ctx.lineWidth = variable ? last : 24 * k; ctx.beginPath(); ctx.arc(0, 0, Math.max(0, size), 0, angle * Math.PI * 2, false); ctx.stroke(); };
        if (showSeconds) ring((millis % 60000) / 60000, 'second', 8);
        size -= 14 * k + last; ring(((now.getMinutes() * 60 + now.getSeconds()) % 3600) / 3600, 'minute', 16);
        size -= 14 * k + last; ring(((now.getHours() * 60 + now.getMinutes()) % 1440) / 1440, 'hour', 32);
        const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        size -= 38 * k + last; ring((now.getDate() - 1) / (days - 1), 'day', 16);
        size -= 14 * k + last; ring(now.getMonth() / 11, 'month', 32);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
    };
  }

  /* ---------- Grass (grass.rs): 200 tessellated blades bending in Perlin turbulence over the time-of-day sky ---------- */
  function grass(ctx, assets, preview) {
    const sky = {night: image(assets + 'lw-night.jpg'), sunrise: image(assets + 'lw-sunrise.jpg'), noon: image(assets + 'lw-sky.jpg'), sunset: image(assets + 'lw-sunset.jpg')};
    const B = 256, p = new Int32Array(B + B + 2), g2 = [];
    for (let i = 0; i < B; i++) { p[i] = i; const v = [(irand(B * 2) - B) / B, (irand(B * 2) - B) / B], l = Math.hypot(v[0], v[1]) || 1; g2[i] = [v[0] / l, v[1] / l]; }
    for (let i = B - 1; i >= 0; i--) { const j = irand(B), k = p[i]; p[i] = p[j]; p[j] = k; }
    for (let i = 0; i < B + 2; i++) { p[B + i] = p[i]; g2[B + i] = g2[i]; }
    const sCurve = t => t * t * (3 - 2 * t);
    function noise2(x, y) {
      let t = x + 4096; const bx0 = Math.floor(t) & 255, bx1 = (bx0 + 1) & 255, rx0 = t - Math.floor(t), rx1 = rx0 - 1;
      t = y + 4096; const by0 = Math.floor(t) & 255, by1 = (by0 + 1) & 255, ry0 = t - Math.floor(t), ry1 = ry0 - 1;
      const i = p[bx0], j = p[bx1], b00 = p[i + by0], b10 = p[j + by0], b01 = p[i + by1], b11 = p[j + by1], sx = sCurve(rx0), sy = sCurve(ry0);
      let q = g2[b00], u = rx0 * q[0] + ry0 * q[1]; q = g2[b10]; let v = rx1 * q[0] + ry0 * q[1]; const a = mix(u, v, sx);
      q = g2[b01]; u = rx0 * q[0] + ry1 * q[1]; q = g2[b11]; v = rx1 * q[0] + ry1 * q[1]; const b = mix(u, v, sx);
      return 1.5 * mix(a, b, sy);
    }
    const turbulence = (x, y, octaves) => { let t = 0; for (let f = 1; f <= octaves; f *= 2) t += Math.abs(noise2(f * x, f * y)) / f; return t; };
    const TESS = .5, MAX_BEND = .09, state = {w: 0, h: 0, blades: []};
    // GrassRS.createBlade, then updateBlades (blades span twice the screen width, rooted at the bottom).
    function blade(w, h) {
      const size = rand(4) + 4, xPos = rand(-w, w);
      return {angle: 0, size: Math.floor(size / TESS), xPos, yPos: h, turbulencex: xPos * .006, offset: rand(.2) - .1, scale: 4 / (size / TESS) + (rand(.6) + .2) * TESS,
        lengthX: (rand(4.5) + 3) * TESS * size, lengthY: (rand(5.5) + 2) * TESS * size, hardness: (rand(1) + .2) * TESS, h: rand(.02) + .2, s: rand(.22) + .78, b: rand(.65) + .35};
    }
    const DAWN = 6 / 24, MORNING = 8 / 24, AFTERNOON = 16 / 24, DUSK = 18 / 24;
    return {
      interval: 50,
      resize(w, h) { state.w = w; state.h = h; state.k = w / DEVICE_WIDTH; state.blades = Array.from({length: 200}, () => blade(DEVICE_WIDTH, h / state.k)); },
      draw(offset, clock) {
        const {w, h, k} = state, dw = DEVICE_WIDTH, dh = h / k;
        // time(): the local time of day, or in the preview a whole day every 30 seconds.
        const d = clock(), now = preview ? (performance.now() / 30000) % 1 : (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) / 86400;
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
        // drawNight samples t = 1 at the top edge (y = -32) and repeats twice across, so the sky is mirrored vertically.
        const night = a => { if (!ready(sky.night)) return; ctx.globalAlpha = a; ctx.save(); ctx.translate(0, h); ctx.scale(1, -1); ctx.drawImage(sky.night, 0, 0, w / 2, h + 32 * k); ctx.drawImage(sky.night, w / 2, 0, w / 2, h + 32 * k); ctx.restore(); };
        const full = (img, a) => { if (!ready(img)) return; ctx.globalAlpha = a; ctx.drawImage(img, 0, 0, w, h); };
        const norm = (a, b, v) => (v - a) / (b - a);
        let bright = 1;
        if (now < DAWN || now > DUSK) { night(1); bright = 0; }
        else if (now <= MORNING) { const half = DAWN + (MORNING - DAWN) / 2; if (now <= half) { night(1); bright = norm(DAWN, half, now); full(sky.sunrise, bright); } else { full(sky.sunrise, 1); full(sky.noon, norm(half, MORNING, now)); } }
        else if (now < AFTERNOON) full(sky.noon, 1);
        else { const half = AFTERNOON + (DUSK - AFTERNOON) / 2; if (now <= half) { full(sky.noon, 1); const a = norm(AFTERNOON, half, now); full(sky.sunset, a); bright = 1 - a; } else { full(sky.sunset, 1); night(norm(half, DUSK, now)); bright = 0; } }
        ctx.globalAlpha = 1;
        const x0 = mix(dw, 0, offset), tnow = performance.now() * .00004;
        ctx.setTransform(k, 0, 0, k, 0, 0);
        for (const b of state.blades) {
          const color = hsb(b.h, b.s, b.b * bright);
          const newAngle = (turbulence(b.turbulencex, tnow, 4) - .5) * .5;
          b.angle = Math.max(-MAX_BEND, Math.min(MAX_BEND, b.angle + (newAngle + b.offset - b.angle) * .15));
          let current = Math.PI / 2, bottomX = b.xPos + x0, bottomY = b.yPos; const dAng = b.angle * b.hardness;
          const left = [[bottomX - b.size * b.scale, bottomY + TESS / 2]], right = [[bottomX + b.size * b.scale, bottomY + TESS / 2]];
          for (let size = b.size; size > 0; size--) {
            const topX = bottomX - Math.cos(current) * b.lengthX, topY = bottomY - Math.sin(current) * b.lengthY, spi = size * b.scale - b.scale;
            left.push([topX - spi, topY]); right.push([topX + spi, topY]); bottomX = topX; bottomY = topY; current += dAng;
          }
          ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(...left[0]); for (const pt of left.slice(1)) ctx.lineTo(...pt); for (const pt of right.reverse()) ctx.lineTo(...pt); ctx.closePath(); ctx.fill();
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
    };
  }

  /* ---------- Galaxy (galaxy.rs + GalaxyRS): 12000 point sprites in a twisted ellipse, tilted by the home page ---------- */
  function galaxy(canvas, assets, preview) {
    const G = gl3(canvas); if (!G) return null;
    const {gl} = G, quad = quadDrawer(G), COUNT = 12000, RADIUS = 300;
    const space = image(assets + 'lw-space.jpg'), flares = image(assets + 'lw-flares.png'), light = image(assets + 'lw-light1.jpg');
    const VS = 'attribute vec3 aPos;attribute vec4 aColor;uniform mat4 uMVP;uniform float uPx;varying vec3 vColor;void main(){float dist=aPos.y;float angle=aPos.x;float x=dist*sin(angle);float y=dist*cos(angle)*0.892;float p=dist*5.5;float s=cos(p);float t=sin(p);vec4 pos=vec4(t*x+s*y,s*x-t*y,aPos.z,1.0);gl_Position=uMVP*pos;gl_PointSize=aColor.a*10.0*uPx;vColor=aColor.rgb;}';
    const FS = 'precision mediump float;uniform sampler2D uTex;varying vec3 vColor;void main(){gl_FragColor=texture2D(uTex,gl_PointCoord)*vec4(vColor,1.0);}';
    const prog = G.program(VS, FS), loc = {pos: gl.getAttribLocation(prog, 'aPos'), color: gl.getAttribLocation(prog, 'aColor'), mvp: gl.getUniformLocation(prog, 'uMVP'), px: gl.getUniformLocation(prog, 'uPx'), tex: gl.getUniformLocation(prog, 'uTex')};
    const gauss = () => { let x1, x2, w = 2; while (w >= 1) { x1 = rand(2) - 1; x2 = rand(2) - 1; w = x1 * x1 + x2 * x2; } return x1 * Math.sqrt(-2 * Math.log(w) / w); };
    const mapf = (a, b, c, d, v) => c + (c - d) * ((v - a) / (b - a));
    const pos = new Float32Array(COUNT * 3), colors = new Uint8Array(COUNT * 4), speed = new Float32Array(COUNT);
    let posBuf, colBuf, tex = {}, w = 0, h = 0, angle = preview ? 0 : 50;
    function create(scale) {
      for (let i = 0; i < COUNT; i++) {
        let d = Math.abs(gauss()) * RADIUS * .5 + rand(64); const id = d / RADIUS; let z = gauss() * .4 * (1 - id);
        if (d < RADIUS * .33) colors.set([220 + id * 35, 220, 220], i * 4); else colors.set([180, 180, Math.min(255, Math.max(140, 140 + id * 115))], i * 4);
        colors[i * 4 + 3] = rand(1.2, 2.1) * 60;
        z *= d > RADIUS * .15 ? .6 * (1 - id) : .72;
        d = mapf(-4, RADIUS + 4, 0, scale, d);
        pos[i * 3] = rand(Math.PI * 2); pos[i * 3 + 1] = d; pos[i * 3 + 2] = z / 5;
        speed[i] = rand(.0015, .0025) * (.5 + scale / d) * .8;
      }
    }
    return {
      interval: 45,
      resize(cw, ch, dw) { w = cw; h = ch; this.dw = dw; create(RADIUS / (DEVICE_WIDTH * .5)); posBuf = G.buffer(pos); colBuf = G.buffer(colors); },
      draw(offset) {
        if (!ready(space) || !ready(flares) || !ready(light)) { gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); return; }
        tex.space ||= G.texture(space, true); tex.flares ||= G.texture(flares); tex.light ||= G.texture(light);
        gl.viewport(0, 0, canvas.width, canvas.height); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); gl.disable(gl.BLEND);
        quad(tex.space, M.ortho(w, h), [[0, 0, 0, 0, 1], [w, 0, 0, 2, 1], [w, h, 0, 2, 0], [0, h, 0, 0, 0]]);
        // calcMatrix: translate, scale (6.6, 6.0) in portrait, tilt by |a| about x and turn by a about (0, 0.4, 0.1).
        const a = mix(-.5, .5, offset) * angle, abs = Math.abs(a);
        let m = M.translate(0, 0, 10 - 6 * abs / 50); m = M.multiply(m, h > w ? M.scale(6.6, 6, 1) : M.scale(12.6, 12, 1)); m = M.multiply(m, M.rotate(abs, 1, 0, 0)); m = M.multiply(m, M.rotate(a, 0, .4, .1));
        const mvp = M.multiply(M.projectionNormalized(w, h), m);
        for (let i = 0; i < COUNT; i++) pos[i * 3] += speed[i];
        gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.useProgram(prog);
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf); gl.bufferData(gl.ARRAY_BUFFER, pos, gl.DYNAMIC_DRAW); gl.enableVertexAttribArray(loc.pos); gl.vertexAttribPointer(loc.pos, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, colBuf); gl.enableVertexAttribArray(loc.color); gl.vertexAttribPointer(loc.color, 4, gl.UNSIGNED_BYTE, true, 0, 0);
        gl.uniformMatrix4fv(loc.mvp, false, new Float32Array(mvp)); gl.uniform1f(loc.px, canvas.width / DEVICE_WIDTH);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex.flares); gl.uniform1i(loc.tex, 0);
        gl.drawArrays(gl.POINTS, 0, COUNT);
        gl.disableVertexAttribArray(loc.color);
        const sx = 512 / DEVICE_WIDTH * 1.1, sy = 512 / DEVICE_WIDTH * 1.2;
        quad(tex.light, mvp, [[-sx, -sy, 0, 0, 1], [sx, -sy, 0, 1, 1], [sx, sy, 0, 1, 0], [-sx, sy, 0, 0, 0]]);
      }
    };
  }

  /* ---------- Water (fall.rs + FallRS): a 48-column mesh refracting the riverbed with ten ripples, and floating leaves ---------- */
  function water(canvas, assets) {
    const G = gl3(canvas); if (!G) return null;
    const {gl} = G, quad = quadDrawer(G), RES = 48, LEAVES = 14, LEAF = .55, SPRITES = 8;
    const pond = image(assets + 'lw-pond.jpg'), leavesImg = image(assets + 'lw-leaves.png');
    const VS = 'attribute vec2 aPos;uniform vec4 uDrops[10];uniform float uOffset;varying vec2 vTex;vec2 addDrop(vec4 d,vec2 pos){vec2 ret=vec2(0.0);vec2 delta=d.xy-pos;float dist=length(delta);if(dist<d.w){float amp=d.z*dist;amp/=d.w*d.w;amp*=sin(d.w-dist);ret=delta*amp;}return ret;}void main(){vec2 pos=aPos;gl_Position=vec4(pos.x,pos.y,0.0,1.0);vTex=vec2(pos.x+1.0,pos.y+1.6666)*vec2(0.25,0.33);vTex.x+=uOffset*0.5;pos.x+=uOffset*2.0;pos+=vec2(1.0);pos*=vec2(25.0,42.0);for(int i=0;i<10;i++)vTex+=addDrop(uDrops[i],pos);}';
    const FS = 'precision mediump float;uniform sampler2D uTex;varying vec2 vTex;void main(){gl_FragColor=texture2D(uTex,vTex);}';
    const prog = G.program(VS, FS), loc = {pos: gl.getAttribLocation(prog, 'aPos'), drops: gl.getUniformLocation(prog, 'uDrops'), offset: gl.getUniformLocation(prog, 'uOffset'), tex: gl.getUniformLocation(prog, 'uTex')};
    let mesh = null, count = 0, meshW = 0, meshH = 0, glH = 0, w = 0, h = 0, last = performance.now(), dt = .1, tex = {};
    const drops = Array.from({length: 10}, () => ({ampS: 0, ampE: 0, spread: 1, x: 0, y: 0}));
    const updateDrop = d => { d.spread += 30 * dt; d.ampE = d.ampS / d.spread; };
    function drop(x, y, s) { let min = 0; drops.forEach((d, i) => { if (d.ampE < drops[min].ampE) min = i; }); const d = drops[min]; Object.assign(d, {ampS: s, spread: 0, x, y: meshH - y - 1}); updateDrop(d); }
    const newLeaf = (initial) => { const sprite = irand(SPRITES); return {x: rand(-2, 2), y: initial ? rand(-3.333 / 2, 3.333 / 2) : rand(-glH / 2, glH / 2), scale: rand(.4, .5), angle: rand(360), spin: rand(-.02, .02) * 180 / Math.PI * (initial ? .25 : .35), u1: sprite / SPRITES, u2: (sprite + 1) / SPRITES, altitude: initial ? -1 : .7, rippled: initial ? 1 : -1, dx: rand(-.01, .01), dy: -rand(.036, .044)}; };
    const leaves = Array.from({length: LEAVES}, () => newLeaf(true));
    const leafDrop = (leaf, amp) => { const nx = (leaf.x + 1) / 2, ny = (leaf.y + glH / 2) / glH; drop(nx * meshW, meshH - ny * meshH, amp); };
    let offsetNow = 0;
    return {
      interval: 50,
      resize(cw, ch) {
        w = cw; h = ch; const width = Math.min(w, h), height = Math.max(w, h), wr = RES + 2, hr = Math.floor(RES * height / width) + 2;
        glH = 2 * height / width; meshW = wr + 1; meshH = hr + 1;
        const verts = [];
        const v = (x, y) => [x / wr * 2 - 1, (y / hr * 2 - 1) * height / width];
        for (let y = 0; y < hr; y++) for (let x = 0; x < wr; x++) { const a = v(x, y), b = v(x + 1, y), c = v(x, y + 1), d = v(x + 1, y + 1); verts.push(...a, ...b, ...c, ...b, ...d, ...c); }
        mesh = G.buffer(new Float32Array(verts)); count = verts.length / 2;
      },
      tap(x, y) { drop(Math.floor(x / w * meshW + offsetNow * meshW), Math.floor(y / h * meshH), 2); },
      draw(offset) {
        offsetNow = offset;
        if (!ready(pond) || !ready(leavesImg)) { gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); return; }
        tex.pond ||= G.texture(pond); tex.leaves ||= G.texture(leavesImg);
        const t = performance.now(); dt = Math.min((t - last) * .001, .2); last = t;
        if (drops.some(d => d.ampE < .005)) leafDrop(leaves[irand(LEAVES)], rand(.3) + .1);
        const uni = new Float32Array(40); drops.forEach((d, i) => uni.set([d.x, d.y, d.ampE * .12, d.spread], i * 4)); drops.forEach(updateDrop);
        gl.viewport(0, 0, canvas.width, canvas.height); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); gl.disable(gl.BLEND);
        gl.useProgram(prog); gl.bindBuffer(gl.ARRAY_BUFFER, mesh); gl.enableVertexAttribArray(loc.pos); gl.vertexAttribPointer(loc.pos, 2, gl.FLOAT, false, 0, 0);
        gl.uniform4fv(loc.drops, uni); gl.uniform1f(loc.offset, offset);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex.pond); gl.uniform1i(loc.tex, 0);
        gl.drawArrays(gl.TRIANGLES, 0, count);
        gl.disableVertexAttribArray(loc.pos);
        gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        const proj = M.projectionNormalized(w, h);
        leaves.forEach((leaf, i) => {
          const {x, y, u1, u2, scale: s} = leaf, a = leaf.altitude, r = leaf.angle;
          const corners = [[-LEAF, -LEAF, 0, u1, 1], [LEAF, -LEAF, 0, u2, 1], [LEAF, LEAF, 0, u2, 0], [-LEAF, LEAF, 0, u1, 0]];
          const model = (tz) => M.multiply(proj, M.multiply(M.multiply(M.translate(x - offset * 2, y, tz), M.scale(s, s, 1)), M.rotate(r, 0, 0, 1)));
          let alpha = 1;
          if (a > 0) { if (a >= .4) alpha = 1 - (a - .4) / .1; quad(tex.leaves, model(0), corners, [0, 0, 0, alpha * .15]); }
          quad(tex.leaves, model(a > 0 ? -a : 0), corners, [1, 1, 1, a > 0 ? alpha : 1]);
          if (a <= 0) {
            if (leaf.rippled < 0) { leafDrop(leaf, 1.5); leaf.spin *= .25; leaf.rippled = 1; }
            leaf.x += leaf.dx * dt; leaf.y += leaf.dy * dt; leaf.angle += leaf.spin;
          } else { leaf.altitude -= .15 * dt; leaf.angle += leaf.spin * 2; }
          if (-LEAF * s + leaf.x > 2 || LEAF * s + leaf.x < -2 || LEAF * s + leaf.y < -glH / 2) leaves[i] = newLeaf(false);
        });
      }
    };
  }

  /* ---------- Music visualization (packages/wallpapers/MusicVisualization) ---------- */
  /* AudioCapture stand-in. The simulator plays no real audio, so while Music is playing a synthetic 120 bpm mix feeds Visualizer-style 8-bit PCM and FFT captures. After more than
     MAX_IDLE_TIME_MS (3 s) of silence the capture returns no data, which switches the scenes to their idle animations. */
  function audioCapture(playing) {
    let lastValid = performance.now();
    const BASS = [55, 55, 73.42, 65.41, 49, 49, 65.41, 61.74], LEAD = [329.6, 392, 440, 493.9, 523.3, 493.9, 440, 392];
    const saw = x => 2 * (x - Math.floor(x + .5)), square = x => (x - Math.floor(x)) < .5 ? 1 : -1;
    // A kick, saw bass, square lead, off-beat hi-hat and a quiet noise floor, so every FFT band carries some energy.
    function sample(t) {
      const beat = t * 2, i = Math.floor(beat), ph = beat - i, bass = BASS[i % BASS.length], lead = LEAD[Math.floor(beat * 2) % LEAD.length];
      let v = Math.sin(2 * Math.PI * (50 + 70 * Math.exp(-ph * 30)) * ph / 2) * 48 * Math.exp(-ph * 6);
      v += saw(bass * t) * 22 * (.5 + .5 * Math.exp(-ph * 3));
      v += square(lead * t) * 12 * Math.exp(-((beat * 2) % 1) * 2);
      if (ph > .5) v += (Math.random() * 2 - 1) * 28 * Math.exp(-(ph - .5) * 18);
      v += (Math.random() * 2 - 1) * 4;
      return Math.max(-128, Math.min(127, Math.round(v)));
    }
    const pcm = n => { const t = performance.now() / 1000, out = new Array(n); for (let k = 0; k < n; k++) out[k] = sample(t + k / 44100); return out; };
    function fft(n) {
      const re = pcm(n), im = new Array(n).fill(0);
      for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) [re[i], re[j]] = [re[j], re[i]]; }
      for (let len = 2; len <= n; len <<= 1) {
        const ang = -2 * Math.PI / len;
        for (let i = 0; i < n; i += len) for (let k = 0; k < len / 2; k++) {
          const wr = Math.cos(ang * k), wi = Math.sin(ang * k), a = i + k, b = a + len / 2, xr = re[b] * wr - im[b] * wi, xi = re[b] * wi + im[b] * wr;
          re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
        }
      }
      // Visualizer.getFft layout: Rf0, Rf(n/2), then (Rk, Ik) pairs, as signed bytes.
      // Visualizer's fixed-point FFT keeps more gain than a 1/(N/2) normalisation; loud bands clip at ±127 as on devices.
      const out = new Array(n), clamp = v => Math.max(-128, Math.min(127, Math.round(v / (n / 32))));
      out[0] = clamp(re[0]); out[1] = clamp(re[n / 2]);
      for (let k = 1; k < n / 2; k++) { out[k * 2] = clamp(re[k]); out[k * 2 + 1] = clamp(im[k]); }
      return out;
    }
    const silent = size => performance.now() - lastValid > 3000 ? [] : new Array(size).fill(0);
    return {
      // getFormattedData(num, den): PCM is centred (-128..127); both kinds are scaled by num / den.
      pcm(size, num = 1, den = 1) { if (!playing()) return silent(size); lastValid = performance.now(); return pcm(size).map(v => Math.trunc(v * num / den)); },
      fft(size) { if (!playing()) return silent(size); lastValid = performance.now(); return fft(size); }
    };
  }
  /* The idle wave and the fade between idle and live data (waveform.rs makeIdleWave / root; many.rs uses 256 points,
     every fourth sample and a 1024× amplitude without the absolute value). */
  function idleWave(count, step, ampScale) {
    const st = {w1p: 0, w1a: 0, w2p: 0, w2a: 0, w3p: 0, w3a: 0, w4p: 0, w4a: 0, fadeout: 0, fadein: 0, counter: 0};
    const make = points => {
      const a1 = Math.sin(.007 * st.w1a) * 120 * ampScale, a2 = Math.sin(.023 * st.w2a) * 80 * ampScale, a3 = Math.sin(.011 * st.w3a) * 40 * ampScale, a4 = Math.sin(.031 * st.w4a) * 20 * ampScale;
      for (let i = 0; i < count; i++) {
        let val = Math.sin(.013 * (st.w1p + i * step)) * a1 + Math.sin(.029 * (st.w2p + i * step)) * a2;
        if (ampScale === 1) val = Math.abs(val);
        const off = Math.sin(.005 * (st.w3p + i * step)) * a3 + Math.sin(.017 * (st.w4p + i * step)) * a4;
        if (val < 2 && val > -2) val = 2;
        points[i * 2] = val + off; points[i * 2 + 1] = -val + off;
      }
    };
    const advance = () => { st.w1p++; st.w1a++; st.w2p--; st.w2a++; st.w3p++; st.w3a++; st.w4p++; st.w4a++; };
    const idle = new Float32Array(count * 2);
    return {
      advance,
      frame(points, isIdle, waveCounter, advanceInMake) {
        if (isIdle) {
          if (st.fadeout > 0) {
            for (let i = 0; i < count; i++) { let v = Math.abs(points[i * 2]) * .95; if (v < 2) v = 2; points[i * 2] = v; points[i * 2 + 1] = -v; }
            if (--st.fadeout === 0) st.w1a = st.w2a = st.w3a = st.w4a = 0;
          } else { make(points); if (advanceInMake) advance(); }
          st.fadein = 15;
        } else if (st.fadein > 0 && st.fadeout === 0) {
          make(idle); if (advanceInMake) advance();
          if (st.counter !== waveCounter) {
            st.counter = waveCounter;
            for (let i = 0; i < count; i++) { const v = Math.abs(points[i * 2]); points[i * 2] = (v * (15 - st.fadein) + idle[i * 2] * st.fadein) / 15; points[i * 2 + 1] = (-v * (15 - st.fadein) + idle[i * 2 + 1] * st.fadein) / 15; }
          }
          if (--st.fadein === 0) st.fadeout = 100;
        } else st.fadeout = 100;
      }
    };
  }
  const WAVE_VS = 'attribute vec2 aPos;attribute vec2 aTex;uniform mat4 uMVP;varying vec2 vTex;void main(){vTex=aTex;gl_Position=uMVP*vec4(aPos,0.0,1.0);}';
  const WAVE_FS = 'precision mediump float;uniform sampler2D uTex;varying vec2 vTex;void main(){gl_FragColor=texture2D(uTex,vTex);}';
  // A TRIANGLE_STRIP of (x, +amp) / (x, -amp) pairs; the line texture's 64px gradient runs across the band.
  function waveDrawer(G, count) {
    const {gl} = G, prog = G.program(WAVE_VS, WAVE_FS), buf = gl.createBuffer(), data = new Float32Array(count * 8);
    for (let i = 0; i < count; i++) data.set([i - count / 2, 0, 0, 0, i - count / 2, 0, 1, 0], i * 8);
    const loc = {pos: gl.getAttribLocation(prog, 'aPos'), tex: gl.getAttribLocation(prog, 'aTex'), mvp: gl.getUniformLocation(prog, 'uMVP'), sampler: gl.getUniformLocation(prog, 'uTex')};
    return (points, texture, mvp) => {
      for (let i = 0; i < count; i++) { data[i * 8 + 1] = points[i * 2]; data[i * 8 + 5] = points[i * 2 + 1]; }
      gl.useProgram(prog); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(loc.pos); gl.vertexAttribPointer(loc.pos, 2, gl.FLOAT, false, 16, 0);
      gl.enableVertexAttribArray(loc.tex); gl.vertexAttribPointer(loc.tex, 2, gl.FLOAT, false, 16, 8);
      gl.uniformMatrix4fv(loc.mvp, false, new Float32Array(mvp));
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture); gl.uniform1i(loc.sampler, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, count * 2);
    };
  }
  // GenericWaveRS + waveform.rs: Waveform (PCM, fire.png, 180° of turn per page) and Spectrum (FFT, ice.png, 360°).
  function waveScene(canvas, assets, audio, spectrum) {
    const G = gl3(canvas); if (!G) return null;
    const {gl} = G, draw = waveDrawer(G, 1024), lineImg = image(assets + (spectrum ? 'lw-vis-ice.png' : 'lw-vis-fire.png'));
    const capture = audioCapture(audio), points = new Float32Array(2048), wave = idleWave(1024, 1, 1), analyzer = new Int16Array(512);
    let tex = null, w = 0, h = 0, idle = 0, counter = 0, lastUpdate = 0;
    function update() {
      if (!spectrum) {
        const data = capture.pcm(1024); if (!data.length) { idle = 1; return; }
        idle = 0; counter++; for (let i = 0; i < 1024; i++) { points[i * 2] = data[i]; points[i * 2 + 1] = -data[i]; }
        return;
      }
      // Visualization3RS.update: power per bin, weighted up the range, falling by at most 800 per update.
      const data = capture.fft(512); let len = data.length / 2; if (!len) { idle = 1; return; }
      len /= 2; idle = 0; counter++;
      for (let i = 1; i < len - 1; i++) { const v1 = data[i * 2], v2 = data[i * 2 + 1]; let nv = ((v1 * v1 + v2 * v2) * (Math.floor(i / 16) + 1)) << 16 >> 16; const old = analyzer[i]; if (nv < old - 800) nv = (old - 800) << 16 >> 16; analyzer[i] = nv; }
      const width = Math.min(DEVICE_WIDTH, 1024), skip = Math.floor((1024 - width) / 2); let src = 0, cnt = 0;
      for (let i = 0; i < width; i++) { let v = Math.trunc(analyzer[src] / 8); if (v < 1 && v > -1) v = 1; points[(i + skip) * 2] = v; points[(i + skip) * 2 + 1] = -v; cnt += len; if (cnt > width) { src++; cnt -= width; } }
    }
    return {
      interval: 16,
      resize(cw, ch) { w = cw; h = ch; },
      draw(offset) {
        const t = performance.now(); if (t - lastUpdate >= 20) { lastUpdate = t; update(); }
        wave.frame(points, idle, counter, true);
        gl.viewport(0, 0, canvas.width, canvas.height); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); gl.disable(gl.BLEND);
        if (!ready(lineImg)) return; tex ||= G.texture(lineImg, true);
        const yrot = offset * 4 * (spectrum ? 360 : 180), scale = .004165 * (1 + 2 * Math.abs(Math.sin(yrot * Math.PI / 180)));
        draw(points, tex, M.multiply(M.projectionNormalized(w, h), M.multiply(M.rotate(yrot, 0, 0, 1), M.scale(scale, scale, scale))));
      }
    };
  }
  // Visualization4RS: the needle follows the rectified signal through a coil, spring and friction model.
  function needleModel() {
    let pos = 0, speed = 0, peak = 0;
    return {
      get angle() { return 131 - pos / 410; }, get peak() { return peak; },
      step(data) {
        let volt = 0; if (data.length) { for (const v of data) volt += Math.abs(v); volt = Math.trunc(volt / data.length); }
        const net = volt - speed * 3 - (pos + 200); speed += Math.trunc(net / 10); pos += speed;
        if (pos < 0) { pos = 0; speed = 0; } else if (pos > 32767) { if (pos > 33333) peak = 10; pos = 32767; speed = 0; }
        if (peak > 0) peak--;
      }
    };
  }
  const VU_IMAGES = ['background', 'frame', 'needle', 'peak_on', 'peak_off', 'black', 'albumart', 'fire'];
  function vuParts(G, assets) {
    const imgs = Object.fromEntries(VU_IMAGES.map(n => [n, image(assets + `lw-vis-${n}.png`)])), tex = {};
    // Blending is ONE / ONE_MINUS_SRC_ALPHA, so the meter images are uploaded premultiplied.
    return {tex, ready: () => VU_IMAGES.every(n => ready(imgs[n])), load() { for (const n of VU_IMAGES) tex[n] ||= G.texture(imgs[n], n === 'fire', n !== 'fire'); }};
  }
  // vu.rs: background, peak lamp, needle (rotated about its pivot), the black cover and the frame, in that order.
  function vuDraw(quad, tex, base, needle, z = 0) {
    const s = .0041, q = (t, m, x1, y1, x2, y2) => quad(t, m, [[x1, y1, z, 0, 1], [x2, y1, z, 1, 1], [x2, y2, z, 1, 0], [x1, y2, z, 0, 0]]);
    const m1 = M.multiply(base.background, M.scale(s, s, s));
    q(tex.background, m1, -208, -33, 208, 200);
    q(needle.peak > 0 ? tex.peak_on : tex.peak_off, m1, 140, 70, 196, 128);
    q(tex.needle, M.multiply(base.needle, M.multiply(M.rotate(needle.angle - 90, 0, 0, 1), M.scale(s, s, s))), -44, -102 + 57, 44, 160 + 57);
    q(tex.black, m1, -100, -105, 100, -55);
    q(tex.frame, m1, -236, -60, 236, 230);
    return m1;
  }
  function vuScene(canvas, assets, audio) {
    const G = gl3(canvas); if (!G) return null;
    const {gl} = G, quad = quadDrawer(G), parts = vuParts(G, assets), capture = audioCapture(audio), needle = needleModel();
    let w = 0, h = 0, last = 0;
    return {
      interval: 16,
      resize(cw, ch) { w = cw; h = ch; },
      draw() {
        const t = performance.now(); if (t - last >= 20) { last = t; needle.step(capture.pcm(1024, 512, 1)); }
        gl.viewport(0, 0, canvas.width, canvas.height); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
        if (!parts.ready()) return; parts.load();
        gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        const P = M.projectionNormalized(w, h), s = .0041;
        vuDraw(quad, parts.tex, {background: M.multiply(P, M.translate(0, -90 * s, 0)), needle: M.multiply(P, M.translate(0, -147 * s, 0))}, needle);
      }
    };
  }
  // Visualization5RS + many.rs: six panels (waves and meters) revolving above a mirrored album-art floor.
  function manyScene(canvas, assets, audio) {
    const G = gl3(canvas); if (!G) return null;
    const {gl} = G, quad = quadDrawer(G), parts = vuParts(G, assets), draw = waveDrawer(G, 256), capture = audioCapture(audio), needle = needleModel();
    const points = new Float32Array(512), wave = idleWave(256, 4, 1024), TILT = -20;
    let w = 0, h = 0, lastUpdate = 0, lastFrame = performance.now(), autorotation = 0, idle = 0, counter = 0;
    function update() {
      const data = capture.pcm(1024, 512, 1); needle.step(data);
      if (!data.length) { idle = 1; return; }
      idle = 0; counter++;
      for (let i = 0; i < 256; i++) { const amp = data[i * 4] + data[i * 4 + 1] + data[i * 4 + 2] + data[i * 4 + 3]; points[i * 2] = amp; points[i * 2 + 1] = -amp; }
    }
    function layer(ident) {
      let last = null;
      for (let i = 0; i < 6; i++) {
        if (i & 1) last = vuDraw(quad, parts.tex, {background: ident, needle: M.multiply(ident, M.translate(0, -57 * .0041, 0))}, needle, 600);
        else draw(points, parts.tex.fire, M.multiply(ident, M.multiply(M.scale(.008, .008 / 2048, .008), M.translate(0, 81920, 350))));
        ident = M.multiply(ident, M.rotate(60, 0, 1, 0));
      }
      return {ident, last};
    }
    return {
      interval: 16,
      resize(cw, ch) { w = cw; h = ch; },
      draw(offset) {
        const t = performance.now(); if (t - lastUpdate >= 20) { lastUpdate = t; update(); }
        wave.frame(points, idle, counter, false);
        gl.viewport(0, 0, canvas.width, canvas.height); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
        if (!parts.ready()) return; parts.load();
        gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        const delta = Math.min(80, t - lastFrame); lastFrame = t; autorotation = (autorotation + .3 * delta / 35) % 360;
        const P = M.projectionNormalized(w, h);
        let ident = M.multiply(P, M.multiply(M.rotate(TILT, 1, 0, 0), M.multiply(M.rotate(autorotation + (offset - .5) * 90, 0, 1, 0), M.multiply(M.translate(0, -1, 0), M.scale(1, -1, 1)))));
        const first = layer(ident);
        // The floor is drawn while the last meter's model matrix is still loaded, as the script does.
        quad(parts.tex.albumart, first.last, [[-1500, -60, 1500, 0, 1], [1500, -60, 1500, 1, 1], [1500, -60, -1500, 1, 0], [-1500, -60, -1500, 0, 0]]);
        ident = M.multiply(M.multiply(first.ident, M.scale(1, -1, 1)), M.translate(0, 1, 0));
        layer(ident);
        wave.advance();
      }
    };
  }

  /* ---------- Magic Smoke (MagicSmokeRS and clouds.rs): five 256 px noise layers recoloured by the preset, drifting and
     turning at their own rates behind a perspective projection ---------- */
  // MagicSmokeRS.mPreset: process mode, background, low colour, high colour, alpha multiplier, layer mask, rotate, blend,
  // texture swap, premultiply. DEFAULT_PRESET is 4; MagicSmokeSelector steps backwards through them on each tap.
  const SMOKE_PRESETS = [
    [1, 0x000000, 0x000000, 0xffffff, 2.0, 0x0f, true, 0, false, false],
    [1, 0x0000ff, 0x000000, 0xffffff, 2.0, 0x0f, true, 0, false, false],
    [1, 0x00ff00, 0x000000, 0xffffff, 2.0, 0x0f, true, 0, false, false],
    [1, 0x00ff00, 0x000000, 0xffffff, 2.0, 0x0f, true, 0, false, true],
    [1, 0x00ff00, 0x00ff00, 0xffffff, 2.5, 0x1f, true, 0, true, true],
    [1, 0x800000, 0xff0000, 0xffffff, 2.5, 0x1f, true, 0, true, false],
    [0, 0x000000, 0x000000, 0xffffff, 0.0, 0x1f, true, 0, false, false],
    [1, 0x0000ff, 0x00ff00, 0xffff00, 2.0, 0x1f, true, 0, true, false],
    [1, 0x008000, 0x00ff00, 0xffffff, 2.5, 0x1f, true, 0, true, false],
    [1, 0x800000, 0xff0000, 0xffffff, 2.5, 0x1f, true, 0, true, true],
    [1, 0x808080, 0x000000, 0xffffff, 2.0, 0x0f, true, 0, false, true],
    [1, 0x0000ff, 0x000000, 0xffffff, 2.0, 0x0f, true, 0, false, true],
    [1, 0x0000ff, 0x00ff00, 0xffff00, 1.5, 0x1f, false, 0, false, true],
    [1, 0x0000ff, 0x00ff00, 0xffff00, 2.0, 0x1f, true, 0, true, true],
    [1, 0x0000ff, 0x00ff00, 0xffff00, 1.5, 0x1f, true, 0, true, true],
    [1, 0x808080, 0x000000, 0xffffff, 2.0, 0x0f, true, 0, false, false],
    [1, 0x000000, 0x000000, 0xffffff, 2.0, 0x0f, true, 0, true, false],
    [2, 0x000000, 0x000070, 0xff2020, 2.5, 0x1f, true, 0, false, false],
    [2, 0x6060ff, 0x000070, 0xffffff, 2.5, 0x1f, true, 0, false, false],
    [3, 0x0000f0, 0x000000, 0xffffff, 2.0, 0x0f, true, 0, true, false]
  ];
  const SMOKE_DEFAULT = 4;
  // noise1..5.png are grey; noise2..5 carry a constant alpha (128, 64, 64, 38) that only process mode 0 uses.
  const SMOKE_ALPHA = [255, 128, 64, 64, 38], SMOKE_SCALE = [4, 3, 3.4, 3.8, 4.2], SMOKE_SHIFT = [.001, .00106, .00114, .00118, .00127], SMOKE_TURN = [.1, .102, .106, .114, .123];
  function magicSmoke(canvas, assets, prefs) {
    const G = gl3(canvas); if (!G) return null;
    const {gl} = G, quad = quadDrawer(G);
    const noise = [1, 2, 3, 4, 5].map(i => image(assets + 'lw-smoke-noise' + i + '.png'));
    const xshift = [0, 0, 0, 0, 0], rotation = [0, 72, 144, 216, 0];
    let w = 0, h = 0, last = performance.now(), current = -1, source = null, textures = null, back = [0, 0, 0];
    const split = c => [c >> 16 & 255, c >> 8 & 255, c & 255];
    // clouds.rs premul(): (c * a + 1 + ((c * a + 1) >> 8)) >> 8 per channel.
    const premul = (c, a) => { const r = c * a + 1; return (r + (r >> 8)) >> 8; };
    // clouds.rs makeTexture(): the blue channel picks the low or high colour and the alpha; alphafactor grows per layer.
    function makeTexture(src, index, preset, factor) {
      const [mode, , low, high, , , , , , pm] = preset, lo = split(low), hi = split(high), out = new Uint8Array(65536 * 4);
      const scale = 255 / (255 - low);
      for (let i = 0; i < 65536; i++) {
        const o = i * 4;
        let lum = src[i], col, a;
        if (mode === 0) { a = SMOKE_ALPHA[index]; const c = premul(lum, a); out[o] = c; out[o + 1] = c; out[o + 2] = c; out[o + 3] = a; continue; }
        if (mode === 2) { a = lum < low ? 0 : Math.trunc((lum - low) * scale); a = Math.trunc(a / factor); col = hi; }
        else {
          if (mode === 3) lum = lum < 128 ? lum * 2 : 255 - (lum - 128) * 2;
          if (lum < 128) { col = lo; a = Math.trunc((255 - lum * 2) / factor); } else { col = hi; a = Math.trunc((lum - 128) * 2 / factor); }
        }
        out[o] = pm ? premul(col[0], a) : col[0]; out[o + 1] = pm ? premul(col[1], a) : col[1]; out[o + 2] = pm ? premul(col[2], a) : col[2]; out[o + 3] = a;
      }
      return out;
    }
    function upload(texture, pixels) {
      gl.bindTexture(gl.TEXTURE_2D, texture); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    }
    return {
      interval: 55,
      resize(cw, ch) { w = cw; h = ch; },
      draw(offset) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        if (!noise.every(ready)) { gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); return; }
        source ||= noise.map(img => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.drawImage(img, 0, 0, 256, 256); const d = x.getImageData(0, 0, 256, 256).data, o = new Uint8Array(65536); for (let i = 0; i < 65536; i++) o[i] = d[i * 4 + 2]; return o; });
        let index = Number((prefs?.() || {}).preset ?? SMOKE_DEFAULT); if (!(index >= 0 && index < SMOKE_PRESETS.length)) index = 0;
        const preset = SMOKE_PRESETS[index], [mode, , , , mul, mask, rotate, blend, swap] = preset;
        if (index !== current) {
          current = index; back = split(preset[1]); textures ||= source.map(() => gl.createTexture());
          let factor = 1; source.forEach((src, i) => { upload(textures[i], makeTexture(src, i, preset, factor)); if (mode !== 0) factor *= mul; });
        }
        const now = performance.now(); let td = (now - last) / 44; last = now; if (td > 3) td = 3;
        gl.clearColor(back[0] / 255, back[1] / 255, back[2] / 255, 1); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND); if (blend) gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); else gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        if (rotate) SMOKE_TURN.forEach((r, i) => { rotation[i] += r * td; });
        const proj = M.projectionNormalized(w || 1, h || 1), tilt = 0;
        const ident = M.multiply(M.multiply(M.translate(-offset, 0, 0), M.scale(.0041, .0041, .0041)), M.rotate(-tilt, 1, 0, 0));
        for (let i = 0; i < 5; i++) {
          if (!(mask & (1 << i))) continue;
          xshift[i] += SMOKE_SHIFT[i] * td;
          const s = i === 0 ? (swap ? .25 : 4) : SMOKE_SCALE[i], u = xshift[i], z = -8 * i;
          const model = M.multiply(M.multiply(ident, M.translate(-offset * 8 * i, -tilt * i / 3, 0)), M.rotate(rotation[i], 0, 0, 1));
          quad(i === 0 && swap ? textures[4] : textures[i], M.multiply(proj, model), [[-1200, -1200, z, u, 0], [1200, -1200, z, s + u, 0], [1200, 1200, z, s + u, s], [-1200, 1200, z, u, s]], [1, 1, 1, 1]);
        }
        for (let i = 0; i < 5; i++) { while (xshift[i] >= 1) xshift[i] -= 1; while (rotation[i] >= 360) rotation[i] -= 360; }
      }
    };
  }

  /* ---------- Microbes (Google's MicrobesWallpaper, com.android.livewallpaper.microbesgl; Nexus S GRK39F and Galaxy Nexus IMM76I)
     Closed source: rebuilt from the images. The four GLSL programs are the strings in libmicrobes_jni.so (the same in both
     builds; only a uPx factor is added, since the originals size points in device pixels). The simulation follows the
     library's ARM code: up to 300 microbes, 600 food specks, 80 dead shells and 60 background blobs in a world as large as
     the wallpaper (Launcher2's desired size: twice the screen width by the screen height, y up), drawn additively on
     black (SRC_ALPHA, ONE) as blobs, shells, food and microbes. Each step a microbe swims at 20 px/s along its heading with
     a slow wobble, is pushed back inside a 90 px margin, keeps clear of up to four neighbours closer than 30 px, steers to
     up to four food specks within 80 px (eats one closer than 10 px and pulses), flees a fresh touch, and is capped at
     80 px/s. Energy drains (faster above .75, while the microbe grows); at scale 1.2 it splits into two of .7, at no
     energy it dies and leaves a shell that sinks off the bottom. Food appears every .2 s; a tap drops five specks
     around the finger (Native.touch on a tap that stays within 30 px, after Native.motion's touch ring). A random
     off-screen microbe changes colour now and then. MicrobesWallpaper renders continuously; Native.step gets the frame
     time, capped at .1 s. */
  function microbes(canvas) {
    const G = gl3(canvas); if (!G) return null;
    const {gl} = G;
    const MICROBE_VS = 'precision mediump float;uniform vec4 uTrans;uniform float time;uniform float uPx;attribute vec3 aPosition;attribute vec3 miscInfo;attribute vec3 aColor;varying vec3 vColor;varying vec2 vTransform;varying float vWidthScale;void main(){float scale=miscInfo.x;float energy=miscInfo.y;float pulseProgress=(time-miscInfo.z);float pulse=clamp(min(pulseProgress*2.,-(pulseProgress-1.)*.5),0.,1.);gl_Position=vec4(aPosition.xy*uTrans.xy+uTrans.zw,0,1);gl_PointSize=30.*scale*uPx;vTransform=vec2(cos(aPosition.z),sin(aPosition.z));vWidthScale=1./mix(.5,.9,energy);vColor=aColor*1.1+pulse;}';
    const MICROBE_FS = 'precision mediump float;varying vec3 vColor;varying vec2 vTransform;varying float vWidthScale;void main(){vec2 given=vec2(gl_PointCoord.xy-.5);vec2 rotated=vec2(given.x*vTransform.x-given.y*vTransform.y,given.x*vTransform.y+given.y*vTransform.x);vec2 scaled=rotated*vec2(1,vWidthScale);float h=length(scaled)*2.;gl_FragColor.rgb=vColor.xyz;float hyperb=-pow(h-.4,2.);gl_FragColor.a=clamp(hyperb*30.+.5,0.,.5)+clamp(-length(rotated*vec2(1.,(vWidthScale-1.)*.2+1.)*2.)+1.,0.,.5);}';
    const FOOD_VS = 'precision mediump float;uniform vec4 uTrans;uniform float time;uniform float uPx;attribute vec3 aPosition;void main(){gl_Position=vec4(aPosition.xy*uTrans.xy+uTrans.zw,0,1);float scale=cos(time*2.+aPosition.z*10.)*.2+.7;gl_PointSize=20.*scale*uPx;}';
    const FOOD_FS = 'precision mediump float;void main(){vec2 given=vec2(gl_PointCoord.xy-.5);float h=length(given)*2.;gl_FragColor.rgb=vec3(1,1,1);gl_FragColor.a=pow(2.81,-pow(h*2.,2.));}';
    const DEAD_VS = 'precision mediump float;uniform vec4 uTrans;uniform float time;uniform float uPx;attribute vec4 aPosition;varying vec2 vTransform;varying float vWidthScale;const float energy=3.;void main(){float angle=aPosition.z;float size=aPosition.w;gl_Position=vec4(aPosition.xy*uTrans.xy+uTrans.zw,0,1);gl_PointSize=30.*size*uPx;vTransform=vec2(cos(angle),sin(angle));vWidthScale=7./energy;}';
    const DEAD_FS = 'precision mediump float;varying vec2 vTransform;varying float vWidthScale;void main(){vec2 given=vec2(gl_PointCoord.xy-.5);vec2 rotated=vec2(given.x*vTransform.x-given.y*vTransform.y,given.x*vTransform.y+given.y*vTransform.x);vec2 scaled=rotated*vec2(1.,vWidthScale);float h=length(scaled)*2.;gl_FragColor.rgb=vec3(1.,1.,1.);float hyperb=-pow(h-.4,2.);gl_FragColor.a=clamp(hyperb*30.+.5,0.,.5);}';
    const DECO_VS = 'precision mediump float;uniform vec4 uTrans;uniform float time;uniform float uPx;attribute vec4 pos;varying vec4 vColor;void main(){vec2 offset=vec2(sin((time+pos.x)*.1),cos((time+pos.y)*.1))*mix(50.,200.,pos.z);gl_Position.xy=((pos.xy+offset)*uTrans.xy+uTrans.zw)*mix(.1,.9,pos.z);gl_Position.zw=vec2(0,1);gl_PointSize=200.*mix(.5,1.,pos.z)*uPx;vColor=vec4(.6,.6,1,mix(.03,.08,pos.z));}';
    const DECO_FS = 'precision mediump float;varying vec4 vColor;void main(){vec2 given=vec2(gl_PointCoord.xy-.5);float h=length(given)*2.;gl_FragColor.rgb=vColor.rgb;gl_FragColor.a=vColor.a*clamp((1.-h)*2.,0.,2.);}';
    const layer = (vs, fs, attributes, count, stride) => {
      const prog = G.program(vs, fs), data = new Float32Array(count * stride), buf = G.buffer(data);
      return {prog, data, buf, count, stride, attrs: attributes.map(([name, size, at]) => [gl.getAttribLocation(prog, name), size, at]),
        trans: gl.getUniformLocation(prog, 'uTrans'), time: gl.getUniformLocation(prog, 'time'), px: gl.getUniformLocation(prog, 'uPx')};
    };
    const microbeLayer = layer(MICROBE_VS, MICROBE_FS, [['aPosition', 3, 0], ['miscInfo', 3, 3], ['aColor', 3, 6]], 300, 9);
    const foodLayer = layer(FOOD_VS, FOOD_FS, [['aPosition', 3, 0]], 600, 3);
    const deadLayer = layer(DEAD_VS, DEAD_FS, [['aPosition', 4, 0]], 80, 4);
    const decoLayer = layer(DECO_VS, DECO_FS, [['pos', 3, 0]], 60, 3);
    // The four colours setColor() picks from.
    const COLORS = [[.199219, .410156, .90625], [.832031, .195312, .144531], [.929688, .695312, .0664062], [.0507812, .597652, .222656]];
    const OFF = -10000, FREE = -9000;
    let W = 0, H = 0, DH = 0, k = 1, time = 0, nextFood = 0, last = 0, xPixels = 0, scene = null;
    const trans = [0, 0, 0, -1];
    const color = m => { [m.r, m.g, m.b] = COLORS[Math.trunc(rand(0, 4))]; };
    function create() {
      const ms = Array.from({length: 300}, () => ({x: OFF, y: 0, a: 0, scale: rand(.9, 1.1), energy: rand(.5, .8), pulse: 0, r: 0, g: 0, b: 0, vx: 0, vy: 0, phase: Math.random(), period: rand(4, 5)}));
      const food = Array.from({length: 600}, () => ({x: OFF, y: 0, phase: Math.random()}));
      const dead = Array.from({length: 80}, () => ({x: 0, y: OFF, a: 0, scale: 0}));
      const deco = Array.from({length: 60}, () => { const z = Math.random(), s = 1 - .8 * z; return {x: s * W * (1 + rand(-1, 1)), y: s * H * (1 + rand(-1, 1)), z}; });
      const ripples = Array.from({length: 15}, () => ({x: 0, y: 0, end: 0}));
      ms.forEach(color);
      for (const m of ms.slice(0, 30)) { m.x = rand(0, W); m.y = rand(0, H); }
      for (const f of food.slice(0, 50)) { f.x = rand(0, W); f.y = rand(0, H); }
      return {ms, food, dead, deco, ripples};
    }
    // Native.motion: a touch ring the microbes flee for half a second.
    function ring(x, y) { const r = scene.ripples.find(item => !(item.end > time)) || scene.ripples[0]; Object.assign(r, {x, y, end: time + .5}); }
    function step(dt) {
      const {ms, food, dead, ripples} = scene, live = m => m.x > FREE;
      for (const m of ms) {
        if (!live(m)) continue;
        // Bounds {0, H, W, 0}: a push back from a 90 px margin, then the heading with its wobble.
        m.vx = (Math.max(0, 90 - m.x) + Math.min(0, W - 90 - m.x)) * .1;
        m.vy = (Math.max(0, 90 - m.y) + Math.min(0, H - 90 - m.y)) * .1;
        const p = m.phase * 30, dir = m.a + .01 * Math.cos(p + time * .3) + .03 * Math.cos(time + p);
        m.vx += Math.cos(dir) * 20; m.vy += Math.sin(dir) * 20;
      }
      const repel = (a, b) => { const d = Math.hypot(b.x - a.x, b.y - a.y), f = (30 - d) * .2; a.vx -= (b.x - a.x) / d * f; a.vy -= (b.y - a.y) / d * f; };
      for (let i = 0; i < ms.length; i++) {
        const m = ms[i]; if (!live(m)) continue;
        for (let j = i + 1, n = 0; j < ms.length; j++) {
          const o = ms[j]; if (!live(o) || (m.x - o.x) ** 2 + (m.y - o.y) ** 2 >= 900) continue;
          repel(m, o); n++; repel(o, m); if (n === 4) break;
        }
        for (let j = 0, n = 0; j < food.length; j++) {
          const f = food[j]; if ((m.x - f.x) ** 2 + (m.y - f.y) ** 2 >= 6400) continue;
          n++;
          if (!(m.energy > 1) && f.x > FREE) {
            const d = Math.hypot(f.x - m.x, f.y - m.y);
            if (d < 10) { m.energy += m.energy > .25 ? .125 : .375; f.x = OFF; m.pulse = time; }
            else { const pull = d < 20 && m.energy < .8 ? 40 : d < 40 ? 10 : 3; m.vx += (f.x - m.x) / d * pull; m.vy += (f.y - m.y) / d * pull; }
          }
          if (n === 4) break;
        }
        for (const r of ripples) {
          if (!(r.end > time) || (m.x - r.x) ** 2 + (m.y - r.y) ** 2 >= 6400) continue;
          const d = Math.hypot(m.x - r.x, m.y - r.y), push = (d < 20 ? 100 : d < 40 ? 40 : 20) / d;
          m.vx += (m.x - r.x) * push; m.vy += (m.y - r.y) * push;
        }
      }
      for (const m of ms) {
        if (!live(m)) continue;
        const speed = Math.hypot(m.vx, m.vy); if (speed > 80) { m.vx *= 80 / speed; m.vy *= 80 / speed; }
        m.x += m.vx * dt; m.y += m.vy * dt; m.a = Math.atan2(m.vy, m.vx);
        m.energy -= dt * .0125;
        if (m.energy > .75) { m.energy -= dt * .025; m.scale += dt * .02; }
        if (time - m.pulse > m.period) m.pulse = time;
      }
      for (const f of food) {
        if (!live(f)) continue;
        // The library adds the left / bottom push whole and a tenth of the right / top one.
        const t = time + f.phase * 1000, angle = Math.sin(t * .1) + t * (f.phase - .5) + Math.sin(f.phase + t * .01);
        f.x += (Math.max(0, 90 - f.x) + Math.min(0, W - 90 - f.x) * .1 + Math.cos(angle) * 3) * dt;
        f.y += (Math.max(0, 90 - f.y) + Math.min(0, H - 90 - f.y) * .1 + Math.sin(angle) * 3) * dt;
      }
      for (const s of dead) if (s.y > -10) s.y -= dt * 10;
      if (time > nextFood) { nextFood = time + .2; const f = food.find(item => !live(item)); if (f) { f.x = rand(0, W); f.y = rand(0, H); } }
      for (const m of ms) {
        if (!live(m)) continue;
        if (m.scale >= 1.2) {
          const child = ms.find(item => !live(item));
          if (child) {
            const cx = Math.cos(m.a) * 2, cy = Math.sin(m.a) * 2;
            Object.assign(child, {x: m.x - cx, y: m.y - cy, a: m.a + Math.PI, scale: .7, energy: rand(.5, .8), r: m.r, g: m.g, b: m.b});
            m.scale = .7; m.x += cx; m.y += cy;
          } else m.scale = 1.2;
        }
        if (m.energy < 0) {
          const s = dead.find(item => !(item.y > -10)) || dead[0];
          Object.assign(s, {x: m.x, y: m.y, a: m.a, scale: m.scale}); m.x = OFF;
        }
      }
      const pick = Math.floor(rand(0, 3000));
      if (pick < 300) {
        const m = ms[pick], cx = m.x * trans[0] + trans[2], cy = m.y * trans[1] + trans[3];
        if (cx < -1 || cx > 1 || cy < -1 || cy > 1) color(m);
      }
    }
    function drawLayer(L, fill) {
      fill(L.data);
      gl.useProgram(L.prog);
      gl.uniform4f(L.trans, ...trans); gl.uniform1f(L.time, time); gl.uniform1f(L.px, k);
      gl.bindBuffer(gl.ARRAY_BUFFER, L.buf); gl.bufferData(gl.ARRAY_BUFFER, L.data, gl.DYNAMIC_DRAW);
      for (const [loc, size, at] of L.attrs) { gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, L.stride * 4, at * 4); }
      gl.drawArrays(gl.POINTS, 0, L.count);
      for (const [loc] of L.attrs) gl.disableVertexAttribArray(loc);
    }
    return {
      interval: 16,
      resize(cw, ch) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        k = canvas.width / DEVICE_WIDTH; DH = ch / (cw / DEVICE_WIDTH);
        W = DEVICE_WIDTH * 2; H = DH;
        if (!scene) scene = create();
      },
      draw(offset) {
        const now = performance.now(), dt = last ? Math.min((now - last) / 1000, .1) : 0; last = now;
        xPixels = -offset * (W - DEVICE_WIDTH);
        trans[0] = 2 / DEVICE_WIDTH; trans[1] = 2 / DH; trans[2] = 2 * xPixels / DEVICE_WIDTH - 1;
        time += dt; step(dt);
        gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        drawLayer(decoLayer, d => scene.deco.forEach((s, i) => d.set([s.x, s.y, s.z], i * 3)));
        drawLayer(deadLayer, d => scene.dead.forEach((s, i) => d.set([s.x, s.y, s.a, s.scale], i * 4)));
        drawLayer(foodLayer, d => scene.food.forEach((f, i) => d.set([f.x, f.y, f.phase], i * 3)));
        drawLayer(microbeLayer, d => scene.ms.forEach((m, i) => d.set([m.x, m.y, m.a, m.scale, m.energy, m.pulse, m.r, m.g, m.b], i * 9)));
      },
      // A tap: Native.motion on the way down, then Native.touch (it stayed within 30 px): five specks within 35 px.
      tap(x, y, offset) {
        if (!scene) return;
        const kc = canvas.clientWidth / DEVICE_WIDTH || 1, wx = x / kc + offset * (W - DEVICE_WIDTH), wy = DH - y / kc;
        ring(wx, wy);
        for (let i = 0; i < 5; i++) { const f = scene.food.find(item => !(item.x > FREE)) || scene.food[0]; f.x = wx + rand(-1, 1) * 35; f.y = wy + rand(-1, 1) * 35; }
        ring(wx, wy);
      }
    };
  }

  /* ---------- Maps (Google Maps' MapWallpaper, com.google.googlenav.wallpaper; in the Nexus S, Galaxy Nexus and Nexus 4 images)
     The original draws Google's map tiles around the phone's location, with the blue my-location dot, and scrolls with
     the home screen. Those tiles cannot ship here, so the map is drawn: a made-up riverside city in the style of the
     simulator's Maps app, two screens wide. MapWallpaperSettingsActivity's wallpaper_prefs.xml gives the options:
     "Map mode" (Normal, Satellite or Terrain; map_mode_satellite by default) and, on the Nexus S build (Maps 5.4.0),
     "Show traffic" (off by default). */
  function mapsWallpaper(ctx, prefs) {
    let w = 0, h = 0, sheet = null, key = '';
    // A small seeded generator: the same city every time.
    const seeded = seed => () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const STYLE = {
      normal: {land: '#f1eee8', block: '#e9e5dc', water: '#a5bfdd', park: '#c8dfae', street: '#ffffff', casing: '#d9d4c8', avenue: '#fdf3a5', avenueCase: '#e6cf6b', highway: '#fbc679', highwayCase: '#d99a45', label: '#5b7b4a'},
      terrain: {land: '#ebe6d9', block: '#e4ded0', water: '#a5bfdd', park: '#bfd9a2', street: '#fdfcf8', casing: '#d5cfc0', avenue: '#fbf0a0', avenueCase: '#dcc56a', highway: '#f8c07a', highwayCase: '#d0944a', label: '#5b7b4a'},
      satellite: {land: '#4b5a3c', block: '#5f6355', water: '#22384a', park: '#34512a', street: '#8f8d84', casing: null, avenue: '#a8a396', avenueCase: null, highway: '#b7b0a0', highwayCase: null, label: null}
    };
    function build(mode, traffic) {
      const W = w * 2, H = h, r = Math.min(2, window.devicePixelRatio || 1), c = document.createElement('canvas');
      c.width = Math.round(W * r); c.height = Math.round(H * r);
      const g = c.getContext('2d'), S = STYLE[mode] || STYLE.satellite, rnd = seeded(1958), u = w / 360;
      g.scale(r, r);
      g.fillStyle = S.land; g.fillRect(0, 0, W, H);
      if (mode === 'satellite') {
        // Rooftops, yards and trees as a speckle of greys, ochres and greens.
        const tones = ['#5d6152', '#6b6a5e', '#56603f', '#475536', '#7a7362', '#3f4a33', '#686d61'];
        for (let i = 0; i < W * H / (14 * u * 14 * u) * 3; i++) { g.fillStyle = tones[Math.floor(rnd() * tones.length)]; g.fillRect(rnd() * W, rnd() * H, (4 + rnd() * 10) * u, (4 + rnd() * 10) * u); }
      }
      if (mode === 'terrain') {
        // Hill shading: soft light and dark lobes over the land.
        for (let i = 0; i < 26; i++) {
          const x = rnd() * W, y = rnd() * H, rad = (60 + rnd() * 140) * u, light = rnd() < .5, grad = g.createRadialGradient(x - rad * .2, y - rad * .2, 0, x, y, rad);
          grad.addColorStop(0, light ? '#ffffff80' : '#7f8a5a66'); grad.addColorStop(1, '#ffffff00');
          g.fillStyle = grad; g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
        }
      }
      // Parks.
      const parks = [[.12, .18, .16, .12], [.3, .62, .1, .16], [.78, .22, .12, .1], [.86, .7, .1, .14], [.5, .08, .08, .07]];
      g.fillStyle = S.park;
      for (const [x, y, pw, ph] of parks) { g.beginPath(); g.roundRect(x * W, y * H, pw * W, ph * H, 10 * u); g.fill(); }
      if (mode === 'satellite') {
        g.fillStyle = '#2a4321';
        for (const [x, y, pw, ph] of parks) for (let i = 0; i < 40; i++) { g.beginPath(); g.arc((x + rnd() * pw) * W, (y + rnd() * ph) * H, (2 + rnd() * 4) * u, 0, Math.PI * 2); g.fill(); }
      }
      // Streets: two grids at slightly different angles, either side of the river.
      const riverX = y => W * .56 + Math.sin(y / H * Math.PI * 1.4 + .6) * W * .05;
      const line = (pts, width, color) => { if (!color) return; g.strokeStyle = color; g.lineWidth = width; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); };
      const grid = (x0, x1, angle, step) => {
        const ca = Math.cos(angle), sa = Math.sin(angle), cx = (x0 + x1) / 2, cy = H / 2, span = Math.hypot(x1 - x0, H);
        const lines = [];
        for (let d = -span; d <= span; d += step) {
          lines.push([[cx + ca * d - sa * span, cy + sa * d + ca * span], [cx + ca * d + sa * span, cy + sa * d - ca * span]]);
          lines.push([[cx - sa * d - ca * span, cy + ca * d - sa * span], [cx - sa * d + ca * span, cy + ca * d + sa * span]]);
        }
        return lines;
      };
      const west = grid(0, W * .56, -.2, 34 * u), east = grid(W * .56, W, .12, 30 * u);
      for (const [lines, x0, x1] of [[west, 0, W * .56], [east, W * .56, W]]) {
        g.save(); g.beginPath(); g.rect(x0, 0, x1 - x0, H); g.clip();
        if (S.casing) for (const l of lines) line(l, 5 * u, S.casing);
        for (const l of lines) line(l, (mode === 'satellite' ? 1.6 : 3.2) * u, S.street);
        g.restore();
      }
      // The river with its embankments.
      const bank = [];
      for (let y = -10; y <= H + 10; y += 8) bank.push([riverX(y), y]);
      line(bank, 48 * u, S.water);
      // Avenues, the bridges and a ring road.
      const avenues = [[[0, H * .3], [W * .3, H * .27], [riverX(H * .26), H * .26], [W, H * .2]], [[0, H * .74], [W * .4, H * .7], [riverX(H * .68), H * .68], [W, H * .62]], [[W * .2, 0], [W * .24, H * .5], [W * .18, H]], [[W * .8, 0], [W * .76, H * .45], [W * .82, H]]];
      const ring = [];
      for (let a = 0; a <= Math.PI * 2 + .01; a += .1) ring.push([W * .5 + Math.cos(a) * W * .38, H * .5 + Math.sin(a) * H * .42]);
      for (const a of avenues) { line(a, 9 * u, S.avenueCase); line(a, 6.4 * u, S.avenue); }
      line(ring, 12 * u, S.highwayCase); line(ring, 8.6 * u, S.highway);
      if (traffic) {
        // Traffic on the arterials: mostly green, a few slow (yellow) and jammed (red) stretches.
        const paint = pts => { for (let i = 1; i < pts.length; i++) { const t = rnd(); line([pts[i - 1], pts[i]], 3.4 * u, t < .7 ? '#4fb34a' : t < .9 ? '#f4c430' : '#d93a2b'); } };
        for (const a of avenues) { const pts = []; for (let i = 1; i < a.length; i++) for (let s = 0; s < 6; s++) { const f = s / 6; pts.push([a[i - 1][0] + (a[i][0] - a[i - 1][0]) * f, a[i - 1][1] + (a[i][1] - a[i - 1][1]) * f]); } pts.push(a[a.length - 1]); paint(pts); }
        paint(ring.filter((_, i) => i % 2 === 0));
      }
      return c;
    }
    return {
      interval: 40,
      resize(cw, ch) { w = cw; h = ch; key = ''; },
      draw(offset) {
        const p = prefs?.() || {}, mode = p.mode || 'satellite', traffic = p.traffic === true, next = `${w}x${h}:${mode}:${traffic}`;
        if (next !== key) { sheet = build(mode, traffic); key = next; }
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(sheet, -offset * w, 0, w * 2, h);
        // My location, at the middle of the two screens: the blue dot with its accuracy circle.
        const x = w - offset * w, y = h * .52, s = w / 360;
        ctx.fillStyle = '#4a90e238'; ctx.strokeStyle = '#4a90e2aa'; ctx.lineWidth = 1.2 * s;
        ctx.beginPath(); ctx.arc(x, y, 34 * s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, 8.5 * s, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#2f80ed'; ctx.beginPath(); ctx.arc(x, y, 6 * s, 0, Math.PI * 2); ctx.fill();
      }
    };
  }

  /* ---------- Registry, in the order LiveWallpaperListAdapter sorts the labels ---------- */
  // gb: the 2.3.6 label and description keys (gb-strings-wallpapers.js; the visualisation labels come from cube.xml).
  const LIST = [
    {id: 'galaxy', label: 'Galaxy', gb: ['wallpaper_galaxy', 'wallpaper_galaxy_desc'], thumb: 'lw-galaxy_thumb.jpg', make: (c, a, o) => galaxy(c, a, o.preview), gl: true},
    {id: 'grass', label: 'Grass', gb: ['wallpaper_grass', 'wallpaper_grass_desc'], thumb: 'lw-grass_thumb.jpg', make: (c, a, o) => grass(c.getContext('2d'), a, o.preview)},
    {id: 'magicsmoke', label: 'Magic Smoke', gb: ['wallpaper_magicsmoke', 'magicsmoke_desc'], thumb: 'lw-magicsmoke_thumb.png', settings: true, make: (c, a, o) => magicSmoke(c, a, o.prefs), gl: true},
    {id: 'maps', label: 'Maps', gb: ['wallpaper_maps', 'wallpaper_maps_desc'], thumb: 'lw-maps_thumb.png', settings: true, make: (c, a, o) => mapsWallpaper(c.getContext('2d'), o.prefs)},
    {id: 'microbes', label: 'Microbes', gb: ['wallpaper_microbes', 'wallpaper_microbes_desc'], thumb: 'lw-microbes_thumb.png', make: c => microbes(c), gl: true},
    {id: 'nexus', label: 'Nexus', gb: ['wallpaper_nexus', 'wallpaper_nexus_desc'], thumb: 'lw-nexus_thumb.png?v=2', make: (c, a) => nexus(c.getContext('2d'), a)},
    {id: 'polar', label: 'Polar clock', gb: ['wallpaper_clock', 'wallpaper_clock_desc'], thumb: 'lw-polarclock_thumb.jpg', settings: true, make: (c, a, o) => polarClock(c.getContext('2d'), a, o.prefs)},
    {id: 'water', label: 'Water', gb: ['wallpaper_fall', 'wallpaper_fall_desc'], thumb: 'lw-water_thumb.jpg', make: (c, a) => water(c, a), gl: true},
    {id: 'waveform', label: 'Waveform', gb: ['wallpaper_vis2', 'vis2_desc'], thumb: 'lw-vis2.png', make: (c, a, o) => waveScene(c, a, o.audio || (() => false), false), gl: true},
    {id: 'spectrum', label: 'Spectrum', gb: ['wallpaper_vis3', 'vis3_desc'], thumb: 'lw-vis3.png', make: (c, a, o) => waveScene(c, a, o.audio || (() => false), true), gl: true},
    {id: 'vu', label: 'VU meter', gb: ['wallpaper_vis4', 'vis4_desc'], thumb: 'lw-vis4.png', make: (c, a, o) => vuScene(c, a, o.audio || (() => false)), gl: true},
    {id: 'many', label: 'Many', gb: ['wallpaper_vis5', 'vis5_desc'], thumb: 'lw-vis5.png', make: (c, a, o) => manyScene(c, a, o.audio || (() => false)), gl: true}
  ];
  const find = id => LIST.find(item => item.id === id);
  function sorted(t, locale) { const collator = new Intl.Collator(locale); return [...LIST].sort((a, b) => collator.compare(t(a.label), t(b.label))); }

  /* A running wallpaper on its own canvas: resizes with its host, throttles to the original frame delay, and pauses
     while hidden. */
  function mount(host, id, options = {}) {
    const spec = find(id); if (!spec) return null;
    DEVICE_WIDTH = options.deviceWidth || 720;
    const assets = options.assets || 'assets/';
    const canvas = document.createElement('canvas'); canvas.className = 'lw-canvas'; host.append(canvas);
    let scene = spec.make(canvas, assets, options);
    if (!scene) { canvas.remove(); return null; }
    let raf = 0, lastFrame = 0, w = 0, h = 0, offset = options.offset ?? .5, running = true;
    const clock = options.clock || (() => new Date());
    const ctx2d = spec.gl ? null : canvas.getContext('2d');
    // 2D scenes draw in CSS pixels: their setTransform calls are scaled by the backing-store ratio.
    if (ctx2d) { const base = ctx2d.setTransform.bind(ctx2d); ctx2d.setTransform = (a, b, c, d, e, f) => { const r = canvas.width / (w || 1); base(a * r, b * r, c * r, d * r, e * r, f * r); }; }
    function fit() {
      const r = host.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      if (!r.width || !r.height) return false;
      if (Math.round(r.width) === w && Math.round(r.height) === h) return true;
      w = Math.round(r.width); h = Math.round(r.height);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      scene.resize(w, h);
      return true;
    }
    function loop(t) {
      raf = requestAnimationFrame(loop);
      if (!running || document.hidden) return;
      if (t - lastFrame < (scene.interval || 40) - 4) return;
      lastFrame = t;
      if (!fit()) return;
      if (ctx2d) ctx2d.setTransform(1, 0, 0, 1, 0, 0);
      scene.draw(offset, clock);
    }
    raf = requestAnimationFrame(loop);
    return {
      id, canvas,
      setOffset(value) { offset = Math.max(0, Math.min(1, value)); },
      tap(x, y) { if (fit()) scene.tap?.(x, y, offset); },
      pause(value) { running = !value; },
      destroy() { cancelAnimationFrame(raf); canvas.remove(); scene = null; }
    };
  }
  window.LiveWallpapers = {LIST, SMOKE_PRESETS, SMOKE_DEFAULT, PALETTES, PALETTE_NAMES, PALETTE_ORDER, find, sorted, mount, M, audioCapture, needleModel};
})();
