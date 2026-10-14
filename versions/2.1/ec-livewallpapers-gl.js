/* Android 2.1 RenderScript live wallpapers, drawn with WebGL: the image's RenderScript sources (LiveWallpapers.apk
   res/raw/galaxy.rs, grass.rs, fall.rs; MagicSmokeWallpapers.apk res/raw/clouds.rs; VisualizationWallpapers.apk
   res/raw/many.rs) ported line by line, with what their Java scenes set up read from the image's dex.
   RS is a small stand-in for RenderScript's fixed pipeline: ProgramVertex projections (setupProjectionNormalized: at
   z = 0, x -1 … 1 spans the narrow side, y grows upwards; setupOrthoWindow: pixels from the top left), model and texture
   matrices that post-multiply like matrixRotate / matrixScale / matrixTranslate, REPLACE or MODULATE texturing, point
   sprites with distance attenuation and ProgramStore blending. Bitmaps are uploaded premultiplied, as Android keeps them.
   One WebGL canvas serves every wallpaper; a scene draws into it and the result is copied onto the 2D canvas. */
(() => {
  'use strict';
  const rand = max => Math.random() * max, rand2 = (a, b) => a + Math.random() * (b - a);

  // Matrices (column-major) ---------------------------------------------------------------------------------------------
  const M = {
    I: () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    mul(a, b) {
      const r = new Array(16);
      for (let c = 0; c < 4; c++) for (let w = 0; w < 4; w++) r[c * 4 + w] = a[w] * b[c * 4] + a[4 + w] * b[c * 4 + 1] + a[8 + w] * b[c * 4 + 2] + a[12 + w] * b[c * 4 + 3];
      return r;
    },
    T: (x, y, z) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1],
    S: (x, y, z) => [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1],
    // rsMatrixLoadRotate: degrees about an axis, normalised unless it is (1, 0, 0).
    R(deg, x, y, z) {
      if (x !== 1 || y !== 0 || z !== 0) { const l = Math.hypot(x, y, z); if (l && l !== 1) { x /= l; y /= l; z /= l; } }
      const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r), n = 1 - c;
      return [x * x * n + c, y * x * n + z * s, x * z * n - y * s, 0, x * y * n - z * s, y * y * n + c, y * z * n + x * s, 0,
        z * x * n + y * s, y * z * n - x * s, z * z * n + c, 0, 0, 0, 0, 1];
    },
    frustum: (l, r, b, t, n, f) => [2 * n / (r - l), 0, 0, 0, 0, 2 * n / (t - b), 0, 0, (r + l) / (r - l), (t + b) / (t - b), -(f + n) / (f - n), -1, 0, 0, -2 * f * n / (f - n), 0],
    ortho: (l, r, b, t, n, f) => [2 / (r - l), 0, 0, 0, 0, 2 / (t - b), 0, 0, 0, 0, -2 / (f - n), 0, -(r + l) / (r - l), -(t + b) / (t - b), -(f + n) / (f - n), 1]
  };
  const chain = (m, ...ops) => ops.reduce((a, b) => M.mul(a, b), m);
  // ProgramVertex.MatrixAllocation.setupProjectionNormalized / setupOrthoWindow.
  function normalized(w, h) {
    const a = w > h ? w / h : h / w;
    return chain(w > h ? M.frustum(-a, a, -1, 1, 1, 100) : M.frustum(-1, 1, -a, a, 1, 100), M.R(180, 0, 1, 0), M.S(-2, 2, 1), M.T(0, 0, 2));
  }
  const orthoWindow = (w, h) => M.ortho(0, w, h, 0, -1, 1);

  // The shared context ----------------------------------------------------------------------------------------------------
  let shared;
  function RS() {
    if (shared !== undefined) return shared;
    const canvas = document.createElement('canvas');
    const opts = {alpha: false, antialias: false, depth: false, premultipliedAlpha: false, preserveDrawingBuffer: true};
    const gl = canvas.getContext('webgl2', opts) || canvas.getContext('webgl', opts);
    if (!gl) return (shared = null);
    const gl2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
    const shader = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, `attribute vec3 aPos; attribute vec2 aTex; attribute vec4 aColor; attribute float aSize;
      uniform mat4 uProj; uniform mat4 uModel; uniform mat4 uTexM; uniform vec3 uAtten;
      varying vec2 vTex; varying vec4 vColor;
      void main() {
        vec4 e = uModel * vec4(aPos, 1.0);
        gl_Position = uProj * e;
        vTex = (uTexM * vec4(aTex, 0.0, 1.0)).xy;
        vColor = aColor;
        float d = length(e.xyz);
        gl_PointSize = max(1.0, aSize * inversesqrt(uAtten.x + uAtten.y * d + uAtten.z * d * d));
      }`));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, `precision mediump float;
      uniform sampler2D uTex; uniform float uModulate; uniform float uSprite;
      varying vec2 vTex; varying vec4 vColor;
      void main() {
        vec4 t = texture2D(uTex, uSprite > 0.5 ? gl_PointCoord : vTex);
        gl_FragColor = uModulate > 0.5 ? t * vColor : t;
      }`));
    ['aPos', 'aTex', 'aColor', 'aSize'].forEach((name, i) => gl.bindAttribLocation(prog, i, name));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const U = {};
    for (const name of ['uProj', 'uModel', 'uTexM', 'uAtten', 'uTex', 'uModulate', 'uSprite']) U[name] = gl.getUniformLocation(prog, name);
    const buffers = [gl.createBuffer(), gl.createBuffer(), gl.createBuffer(), gl.createBuffer()], index = gl.createBuffer();
    const pot = n => (n & (n - 1)) === 0;
    const blank = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, blank);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
    const images = new Map();
    let color = [1, 1, 1, 1];
    const rs = shared = {
      canvas, gl,
      // A texture: from an image URL (cached), a canvas, or {width, height, data}. premul as Android's Bitmaps; wrap = WRAP.
      texture(source, {premul = true, wrap = true, mip = false} = {}) {
        if (typeof source === 'string') {
          const key = `${source}|${premul}|${wrap}|${mip}`;
          if (images.has(key)) return images.get(key);
          const t = {tex: null, ready: false};
          images.set(key, t);
          const im = new Image();
          im.onload = () => { t.tex = rs.upload(null, im, {premul, wrap, mip}); t.ready = true; };
          im.src = source;
          return t;
        }
        return {tex: rs.upload(null, source, {premul, wrap, mip}), ready: true};
      },
      upload(tex, source, {premul = true, wrap = true, mip = false} = {}) {
        tex ||= gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premul);
        if (source.data) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, source.width, source.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, source.data);
        else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        const w = source.width || source.naturalWidth, h = source.height || source.naturalHeight, ok = gl2 || (pot(w) && pot(h));
        const repeat = wrap && ok ? gl.REPEAT : gl.CLAMP_TO_EDGE;
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, repeat);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, repeat);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        if (mip && ok) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); }
        else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        return tex;
      },
      ready: (...textures) => textures.every(t => t.ready),
      begin(w, h, [r, g, b] = [0, 0, 0]) {
        if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
        gl.viewport(0, 0, w, h);
        gl.clearColor(r, g, b, 1); gl.clear(gl.COLOR_BUFFER_BIT);
        rs.proj(M.I()); rs.model(M.I()); rs.texMatrix(M.I()); rs.store(null); rs.color(1, 1, 1, 1); rs.mode(0);
      },
      end(ctx, w, h) { ctx.drawImage(canvas, 0, 0, w, h); },
      proj: m => gl.uniformMatrix4fv(U.uProj, false, m),
      model: m => gl.uniformMatrix4fv(U.uModel, false, m),
      texMatrix: m => gl.uniformMatrix4fv(U.uTexM, false, m),
      tex(t) { gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, t?.tex || blank); gl.uniform1i(U.uTex, 0); },
      // ProgramFragment env mode: 0 REPLACE, 1 MODULATE (by the vertex or color() colour).
      mode: m => gl.uniform1f(U.uModulate, m),
      // ProgramStore blending: null for ONE / ZERO.
      store(src, dst) {
        if (!src) { gl.disable(gl.BLEND); return; }
        const f = {one: gl.ONE, zero: gl.ZERO, srcAlpha: gl.SRC_ALPHA, oneMinusSrcAlpha: gl.ONE_MINUS_SRC_ALPHA};
        gl.enable(gl.BLEND); gl.blendFunc(f[src], f[dst]);
      },
      color(r, g, b, a) { color = [r, g, b, a]; },
      // draw(primitive, {pos (xyz), tex (st), color (RGBA bytes), size}, count, {first, indices, sprite, atten}).
      draw(prim, arrays, count, {first = 0, indices = null, sprite = false, atten = [1, 0, 0]} = {}) {
        const spec = [['pos', 3, gl.FLOAT, false], ['tex', 2, gl.FLOAT, false], ['color', 4, gl.UNSIGNED_BYTE, true], ['size', 1, gl.FLOAT, false]];
        spec.forEach(([key, n, type, norm], i) => {
          const data = arrays[key];
          if (data) {
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i]); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STREAM_DRAW);
            gl.enableVertexAttribArray(i); gl.vertexAttribPointer(i, n, type, norm, 0, 0);
          } else {
            gl.disableVertexAttribArray(i);
            if (i === 1) gl.vertexAttrib2f(1, 0, 0);
            if (i === 2) gl.vertexAttrib4f(2, ...color);
            if (i === 3) gl.vertexAttrib1f(3, 1);
          }
        });
        gl.uniform1f(U.uSprite, sprite ? 1 : 0);
        gl.uniform3f(U.uAtten, ...atten);
        if (indices) {
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STREAM_DRAW);
          gl.drawElements(prim, count, gl.UNSIGNED_SHORT, first * 2);
        } else gl.drawArrays(prim, first, count);
      },
      // drawQuadTexCoords(x1, y1, z1, s1, t1, … x4, y4, z4, s4, t4).
      quad(...v) {
        const pos = new Float32Array(12), tex = new Float32Array(8);
        for (let i = 0; i < 4; i++) { pos.set(v.slice(i * 5, i * 5 + 3), i * 3); tex.set(v.slice(i * 5 + 3, i * 5 + 5), i * 2); }
        rs.draw(gl.TRIANGLE_FAN, {pos, tex}, 4);
      },
      // drawQuad: texture coordinates (0, 1), (1, 1), (1, 0), (0, 0).
      quadPlain(x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4) { rs.quad(x1, y1, z1, 0, 1, x2, y2, z2, 1, 1, x3, y3, z3, 1, 0, x4, y4, z4, 0, 0); },
      // drawRect(x1, y1, x2, y2, z) = drawQuad(x1, y2, x2, y2, x2, y1, x1, y1).
      rect(x1, y1, x2, y2, z) { rs.quadPlain(x1, y2, z, x2, y2, z, x2, y1, z, x1, y1, z); }
    };
    return rs;
  }
  // Frames: a script returns the milliseconds to its next run; the wallpaper layer redraws at that pace (interval).
  const fallback = ctx => { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 480, 800); };

  // Galaxy (GalaxyRS, galaxy.rs) ------------------------------------------------------------------------------------------
  // 12000 stars, GALAXY_RADIUS 300; space.jpg twice across under setupOrthoWindow; the stars as point sprites (flares.png,
  // MODULATE, SRC_ALPHA / ONE) through the normalized projection; light1.jpg added on top with the stars' matrix still
  // loaded. The preview runs at xOffset 0.5 with angle 0.
  EC.liveWallpapers.galaxy = ({preview = false} = {}) => {
    const rs = RS();
    if (!rs) return {resize() {}, draw: fallback};
    const COUNT = 12000, RADIUS = 300, ELLIPSE_RATIO = 0.892, TWIST = 0.023333333;
    const space = rs.texture('assets/lw-space.jpg'), light = rs.texture('assets/lw-light1.jpg'), flares = rs.texture('assets/lw-flares.png', {wrap: false});
    const pos = new Float32Array(COUNT * 3), color = new Uint8Array(COUNT * 4), size = new Float32Array(COUNT);
    const star = new Float32Array(COUNT * 5);   // angle, distance, speed, s, t
    let W = 480, H = 800, last = 0;
    const angle = preview ? 0 : 50;
    function gauss() {
      let x1, x2, w = 2;
      while (w >= 1) { x1 = 2 * rand2(0, 1) - 1; x2 = 2 * rand2(0, 1) - 1; w = x1 * x1 + x2 * x2; }
      return x1 * Math.sqrt(-2 * Math.log(w) / w);
    }
    function init() {
      const scale = RADIUS / (W * 0.5);
      for (let i = 0; i < COUNT; i++) {
        let d = Math.abs(gauss()) * RADIUS * 0.5 + rand(64);
        const id = d / RADIUS, p = -d * TWIST;
        let z = gauss() * 0.4 * (1 - id);
        const c = i * 4;
        if (d < RADIUS * 0.33) { color[c] = Math.trunc(220 + id * 35); color[c + 1] = 220; color[c + 2] = 220; }
        else { color[c] = 180; color[c + 1] = 180; color[c + 2] = Math.trunc(Math.min(255, Math.max(140, 140 + id * 115))); }
        color[c + 3] = Math.trunc(140 + (1 - id) * 115);
        z *= d > RADIUS * 0.15 ? 0.6 * (1 - id) : 0.72;
        d = scale * (d + 4) / (RADIUS + 8);   // mapf(-4, R + 4, 0, scale, d)
        star.set([rand(6.283), d, rand2(0.0015, 0.0025) * (0.5 + scale / d) * 0.8, Math.cos(p), Math.sin(p)], i * 5);
        pos[i * 3 + 2] = z / 5;
        size[i] = rand2(1.2, 2.1) * 6;
      }
    }
    return {
      interval: 45,
      resize(w, h) { W = w; H = h; init(); },
      draw(ctx, xOffset, now) {
        const steps = last ? Math.min(5, (now - last) / 45) : 1; last = now;
        const x0 = preview ? 0.5 : xOffset, offset = -1 + 2 * x0;
        rs.begin(W, H);
        rs.proj(orthoWindow(W, H)); rs.tex(space);
        rs.quad(0, 0, 0, 0, 1, W, 0, 0, 2, 1, W, H, 0, 2, 0, 0, H, 0, 0, 0);
        const a = offset * angle, abs = Math.abs(a);
        const model = chain(M.T(0, 0, 10 - 6 * abs / 50), W > H ? M.S(12.6, 12, 1) : M.S(6.6, 6, 1), M.R(abs, 1, 0, 0), M.R(a, 0, 0.4, 0.1));
        rs.proj(normalized(W, H)); rs.model(model); rs.tex(flares); rs.mode(1); rs.store('srcAlpha', 'one');
        for (let i = 0; i < COUNT; i++) {
          const k = i * 5, ang = star[k] + star[k + 2] * steps, d = star[k + 1];
          const x = d * Math.sin(ang), y = d * Math.cos(ang) * ELLIPSE_RATIO;
          pos[i * 3] = star[k + 4] * x + star[k + 3] * y;
          pos[i * 3 + 1] = star[k + 3] * x - star[k + 4] * y;
          star[k] = ang;
        }
        rs.draw(rs.gl.POINTS, {pos, color, size}, COUNT, {sprite: true, atten: [0.1 + 0.3 * Math.abs(offset), 0, 0.06 + 0.1 * Math.abs(offset)]});
        let s = 512 / W;
        const lx = -s - s * 0.05, ly = -s;
        s *= 2;
        rs.tex(light); rs.mode(0);
        rs.quadPlain(lx, ly, 0, lx + s * 1.1, ly, 0, lx + s * 1.1, ly + s, 0, lx, ly + s, 0);
        rs.end(ctx, W, H);
      }
    };
  };

  // Perlin noise for turbulencef2 (RenderScript's noise, a classic gradient noise) -----------------------------------------
  const PERM = (() => { const p = [...Array(256).keys()]; for (let i = 255; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } return p.concat(p); })();
  const GRAD = PERM.slice(0, 256).map((_, i) => { const a = i / 256 * Math.PI * 2; return [Math.cos(a), Math.sin(a)]; });
  function noise2(x, y) {
    const X = Math.floor(x), Y = Math.floor(y), fx = x - X, fy = y - Y, xi = X & 255, yi = Y & 255;
    const g = (i, j, dx, dy) => { const v = GRAD[PERM[PERM[xi + i] + yi + j] & 255]; return v[0] * dx + v[1] * dy; };
    const s = t => t * t * (3 - 2 * t), u = s(fx), v = s(fy);
    const a = g(0, 0, fx, fy) + u * (g(1, 0, fx - 1, fy) - g(0, 0, fx, fy));
    const b = g(0, 1, fx, fy - 1) + u * (g(1, 1, fx - 1, fy - 1) - g(0, 1, fx, fy - 1));
    return a + v * (b - a);
  }
  const turbulence2 = (x, y, octaves) => { let t = 0; for (let f = 1; f <= octaves; f *= 2) t += Math.abs(noise2(f * x, f * y)) / f; return t; };
  // SC_hsbToAbgr as RGBA bytes.
  function hsb(h, s, b, out, o) {
    const hf = (h - Math.trunc(h)) * 6, i = Math.trunc(hf), f = hf - i;
    const p = b * (1 - s), q = b * (1 - s * f), t = b * (1 - s * (1 - f));
    const [r, g, bl] = [[b, t, p], [q, b, p], [p, b, t], [p, q, b], [t, p, b], [b, p, q]][i] || [b, t, p];
    out[o] = r * 255; out[o + 1] = g * 255; out[o + 2] = bl * 255; out[o + 3] = 255;
  }

  // Grass (GrassRS, grass.rs) --------------------------------------------------------------------------------------------
  // 2600 blades (createBlade: size 4 … 8, TESSELATION 0.5, from x -width … width at the bottom), each a strip of quads
  // bending with turbulence, coloured hsbToAbgr(h, s, b × brightness) over a 4 x 1 alpha texture that softens their
  // edges; behind them night (twice across, flipped as the script maps it), sunrise, sky and sunset crossfade by the time
  // of day. No location fix: dawn 0.3 and dusk 0.75 of the day (updateLocation's defaults), sunrise and sunset taking an
  // hour each way (1 / 12 of a day overall). The preview runs a whole day every 30 seconds.
  EC.liveWallpapers.grass = ({preview = false} = {}) => {
    const rs = RS();
    if (!rs) return {resize() {}, draw: fallback};
    const COUNT = 2600, T = 0.5, MAX_BEND = 0.09, F = 13;
    const tex = {night: rs.texture('assets/lw-night.jpg'), sunrise: rs.texture('assets/lw-sunrise.jpg'), sky: rs.texture('assets/lw-sky.jpg'), sunset: rs.texture('assets/lw-sunset.jpg'),
      aa: rs.texture({width: 4, height: 1, data: new Uint8Array([255, 255, 255, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0])}, {premul: false})};
    let W = 480, H = 800, blades = null, tris = 0, pos = null, texc = null, col = null, col32 = null;
    const rgba = new Uint8Array(4), rgba32 = new Uint32Array(rgba.buffer);
    function create() {
      blades = new Float32Array(COUNT * F); tris = 0;
      for (let i = 0; i < COUNT; i++) {
        const size = rand(4) + 4, xpos = Math.trunc(rand2(-W, W)), b = i * F;
        blades[b] = 0; blades[b + 1] = size / T; blades[b + 2] = xpos; blades[b + 3] = H;
        blades[b + 4] = rand(0.2) - 0.1;
        blades[b + 5] = 4 / (size / T) + (rand(0.6) + 0.2) * T;
        blades[b + 6] = (rand(4.5) + 3) * T * size;
        blades[b + 7] = (rand(5.5) + 2) * T * size;
        blades[b + 8] = (rand(1) + 0.2) * T;
        blades[b + 9] = rand(0.02) + 0.2; blades[b + 10] = rand(0.22) + 0.78; blades[b + 11] = rand(0.65) + 0.35;
        blades[b + 12] = xpos * 0.006;
        tris += Math.trunc(size / T) * 2;
      }
      pos = new Float32Array(tris * 9); texc = new Float32Array(tris * 6); col = new Uint8Array(tris * 12); col32 = new Uint32Array(col.buffer);
      const st = [0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0];
      for (let q = 0; q < tris / 2; q++) texc.set(st, q * 12);
    }
    const now = () => {
      if (preview) { const t = performance.now() / 30000; return t - Math.trunc(t); }
      const d = EC.context.now(); return (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) / 86400;
    };
    return {
      interval: 30,
      resize(w, h) { W = w; H = h; create(); },
      draw(ctx, xOffset) {
        const x = W + (0 - W) * xOffset, t = now();
        const dawn = 0.3, dusk = 0.75, morning = dawn + 1 / 12, afternoon = dusk - 1 / 12;
        rs.begin(W, H);
        rs.proj(orthoWindow(W, H)); rs.mode(1); rs.store('srcAlpha', 'oneMinusSrcAlpha');
        const night = () => { rs.tex(tex.night); rs.quad(0, -32, 0, 0, 1, W, -32, 0, 2, 1, W, 1024 - 32, 0, 2, 0, 0, 1024 - 32, 0, 0, 0); };
        const full = k => { rs.tex(tex[k]); rs.rect(0, 0, W, H, 0); };
        const alpha = a => rs.color(1, 1, 1, a);
        const norm = (a, b, v) => (v - a) / (b - a);
        let B = 1;
        alpha(1);
        if (t < dawn) { night(); B = 0; }
        else if (t <= morning) {
          const half = dawn + (morning - dawn) * 0.5;
          if (t <= half) { night(); B = norm(dawn, half, t); alpha(B); full('sunrise'); }
          else { full('sunrise'); alpha(norm(half, morning, t)); full('sky'); }
        } else if (t < afternoon) full('sky');
        else if (t <= dusk) {
          const half = afternoon + (dusk - afternoon) * 0.5;
          if (t <= half) { full('sky'); B = norm(afternoon, half, t); alpha(B); B = 1 - B; full('sunset'); }
          else { full('sunset'); alpha(norm(half, dusk, t)); night(); B = 0; }
        } else { night(); B = 0; }
        // Blades.
        const time = performance.now() * 0.00004;
        let v = 0;
        for (let i = 0; i < COUNT; i++) {
          const b = i * F, scale = blades[b + 5], hard = blades[b + 8];
          const xpos = blades[b + 2] + x, lx = blades[b + 6], ly = blades[b + 7];
          let size = Math.trunc(blades[b + 1]);
          hsb(blades[b + 9], blades[b + 10], blades[b + 11] * B, rgba, 0);
          const color32 = rgba32[0];
          const target = (turbulence2(blades[b + 12], time, 4) - 0.5) * 0.5;
          const ang = Math.min(MAX_BEND, Math.max(-MAX_BEND, blades[b] + (target + blades[b + 4] - blades[b]) * 0.15));
          let cur = Math.PI / 2, bx = xpos, by = blades[b + 3];
          const d = ang * hard;
          for (; size > 0; size--) {
            const tx = bx - Math.cos(cur) * lx, ty = by - Math.sin(cur) * ly;
            const si = size * scale, spi = si - scale, bottom = by + 0.25;
            const o = v * 3, l = bx - si, r = bx + si, tl = tx - spi, tr = tx + spi;
            pos[o] = l; pos[o + 1] = bottom; pos[o + 3] = tl; pos[o + 4] = ty; pos[o + 6] = tr; pos[o + 7] = ty;
            pos[o + 9] = l; pos[o + 10] = bottom; pos[o + 12] = tr; pos[o + 13] = ty; pos[o + 15] = r; pos[o + 16] = bottom;
            col32.fill(color32, v, v + 6);
            v += 6; bx = tx; by = ty; cur += d;
          }
          blades[b] = ang;
        }
        rs.tex(tex.aa); rs.color(1, 1, 1, 1);
        rs.draw(rs.gl.TRIANGLES, {pos, tex: texc, color: col}, v);
        rs.end(ctx, W, H);
      }
    };
  };

  // Water (FallRS, fall.rs) -----------------------------------------------------------------------------------------------
  // The pond (pond.jpg through the texture matrix scale(0.5 × 960 / 1024, -800 / 1024) after translate(xOffset)) on a
  // 48 x (48 × height / width) mesh whose texture coordinates the ripples push by their normals; 10 drops spreading at 30
  // per second, a new one at a random leaf whenever one has died down; 14 leaves (leaves.png, 8 kinds) drifting on the
  // water, a fallen one coming down from altitude 0.7 with its shadow and rippling where it lands. A tap drops (amp 2).
  EC.liveWallpapers.water = () => {
    const rs = RS();
    if (!rs) return {resize() {}, draw: fallback};
    const RES = 48, LEAVES = 14, LEAF = 0.55;
    const pond = rs.texture('assets/lw-pond.jpg'), leavesTex = rs.texture('assets/lw-leaves.png');
    let W = 480, H = 800, glH = 0, meshW = 0, meshH = 0, verts = null, tex = null, indices = null, count = 0, last = 0, xOff = 0.5;
    const drops = Array.from({length: 10}, () => ({ampS: 0, ampE: 0, spread: 1, spread2: 1, invSpread: 1, x: 0, y: 0}));
    let leaves = [];
    const pending = [];
    function mesh() {
      let wRes = RES, hRes = Math.trunc(RES * H / W);
      glH = 2 * H / W;
      const qw = 2 / wRes, qh = glH / hRes;
      wRes += 2; hRes += 2;
      meshW = wRes + 1; meshH = hRes + 1;
      verts = new Float32Array(meshW * meshH * 3); tex = new Float32Array(meshW * meshH * 2);
      for (let y = 0; y <= hRes; y++) for (let x = 0; x <= wRes; x++) verts.set([-1 + x * qw - qw, (y / hRes) * glH - glH / 2 - qh, 0], (y * meshW + x) * 3);
      const list = [];
      for (let y = 0; y < hRes; y++) {
        const shift = (y & 1) === 0, o = y * (wRes + 1);
        for (let x = 0; x < wRes; x++) {
          const i = o + x, j = i + wRes + 1;
          if (shift) list.push(i, i + 1, j, i + 1, j + 1, j); else list.push(i, j + 1, j, i, i + 1, j + 1);
        }
      }
      indices = new Uint16Array(list); count = list.length;
    }
    function newLeaf(leaf, falling) {
      const sprite = Math.trunc(rand(8));
      Object.assign(leaf, {x: rand2(-2, 2), y: rand2(-glH * 0.5, glH * 0.5), scale: rand2(0.4, 0.5),
        spin: rand2(-0.02, 0.02) * 180 / Math.PI * (falling ? 0.35 : 0.25), u1: sprite / 8, u2: (sprite + 1) / 8,
        altitude: falling ? 0.7 : -1, rippled: falling ? -1 : 1, deltaX: rand2(-0.02, 0.02) / 2, deltaY: -0.08 * rand2(0.9, 1.1) / 2, newLeaf: falling ? 1 : 0});
      if (!falling) leaf.angle = rand2(0, 360);
      return leaf;
    }
    function updateDrop(d, dt) { d.spread += 30 * dt; d.spread2 = d.spread * d.spread; d.invSpread = 1 / d.spread; d.ampE = d.ampS * d.invSpread; }
    function drop(x, y, s) {
      let min = 0, amp = 10000;
      drops.forEach((d, i) => { if (d.ampE < amp) { min = i; amp = d.ampE; } });
      Object.assign(drops[min], {ampS: s, spread: 0, x, y: meshH - y - 1});
      updateDrop(drops[min], 0);
    }
    const leafDrop = (leaf, amp) => drop(Math.trunc((leaf.x + 1) / 2 * meshW), Math.trunc(meshH - (leaf.y + glH * 0.5) / glH * meshH), amp);
    function ripples(dt) {
      const xShift = xOff * (meshW / 2) * 2, z = new Float32Array(meshW * meshH);
      const live = drops.filter(d => d.ampE > 0.01);
      for (let y = 0; y < meshH; y++) for (let x = 0; x < meshW; x++) {
        let sum = 0;
        for (const d of live) {
          const dx = d.x - xShift - x, dy = d.y - y, dist2 = dx * dx + dy * dy;
          if (dist2 < d.spread2) { const dist = Math.sqrt(dist2); sum += Math.sin(d.spread - dist) * d.ampE * dist * d.invSpread; }
        }
        z[y * meshW + x] = sum;
      }
      drops.forEach(d => updateDrop(d, dt));
      const P = i => [verts[i * 3], verts[i * 3 + 1], z[i] || 0];
      const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
      const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
      const n = meshW * meshH;
      for (let i = 0; i < n; i++) {
        const x = i % meshW, y = (i - x) / meshW, v = P(i);
        const at = j => j < n ? P(j) : [0, 0, 0];
        let n1 = sub(at(i + 1), v);
        const n2 = sub(at(i + meshW), v);
        const n3 = cross(n1, n2);
        n1 = sub(at(i + meshW + 1), v);
        const n4 = cross(n1, n2);
        tex[i * 2] = x / meshW + n3[0] + n4[0];
        tex[i * 2 + 1] = y / meshH + n3[1] + n4[1];
      }
    }
    function drawLeaf(leaf, dt) {
      const {x, y, u1, u2, scale: s} = leaf, a = leaf.altitude;
      let r = leaf.angle;
      const tz = a > 0 ? -a : 0;
      const quad = () => rs.quad(-LEAF, -LEAF, 0, u1, 1, LEAF, -LEAF, 0, u2, 1, LEAF, LEAF, 0, u2, 0, -LEAF, LEAF, 0, u1, 0);
      if (a > 0) {
        const alpha = a >= 0.4 ? 1 - (a - 0.4) / 0.1 : 1, sh = a / 5;
        rs.color(0, 0, 0, alpha * 0.15);
        rs.model(chain(M.T(x - xOff * 2 + sh / 2, y - sh, tz), M.S(s, s, 1), M.R(r, 0, 0, 1))); quad();
        rs.color(1, 1, 1, alpha);
      } else rs.color(1, 1, 1, 1);
      rs.model(chain(M.T(x - xOff * 2, y, tz), M.S(s, s, 1), M.R(r, 0, 0, 1))); quad();
      let spin = leaf.spin;
      if (a <= 0) {
        if (leaf.rippled < 0) { leafDrop(leaf, 1.5); spin /= 4; leaf.spin = spin; leaf.rippled = 1; }
        leaf.x = x + leaf.deltaX * dt; leaf.y = y + leaf.deltaY * dt;
        leaf.angle = r + spin;
      } else { leaf.altitude = a - 0.15 * dt; leaf.angle = r + spin * 2; }
      if (-LEAF * s + x > 2 || LEAF * s + x < -2 || LEAF * s + y < -glH / 2) { newLeaf(leaf, true); return true; }
      return false;
    }
    return {
      interval: 30,
      resize(w, h) { W = w; H = h; mesh(); leaves = Array.from({length: LEAVES}, () => newLeaf({}, false)); },
      tap(x, y) { pending.push([x + xOff * W, y]); },
      draw(ctx, xOffset, now) {
        xOff = xOffset;
        const dt = Math.min(last ? (now - last) / 1000 : 0.2, 0.2); last = now;
        for (const [px, py] of pending.splice(0)) drop(Math.trunc(px / W * meshW), Math.trunc(py / H * meshH), 2);
        if (drops.some(d => d.ampE < 0.005)) leafDrop(leaves[Math.trunc(rand(LEAVES))], rand(0.3) + 0.1);
        ripples(dt);
        rs.begin(W, H);
        rs.proj(normalized(W, H)); rs.tex(pond); rs.mode(0); rs.store(null);
        rs.texMatrix(chain(M.S(0.5 * 960 / 1024, -800 / 1024, 1), M.T(xOff, 0, 0)));
        rs.draw(rs.gl.TRIANGLES, {pos: verts, tex}, count, {indices});
        rs.texMatrix(M.I());
        rs.tex(leavesTex); rs.mode(1); rs.store('srcAlpha', 'oneMinusSrcAlpha');
        let fresh = false;
        for (const leaf of leaves) if (drawLeaf(leaf, dt)) fresh = true;
        if (fresh) { leaves = [...leaves.filter(l => !l.newLeaf), ...leaves.filter(l => l.newLeaf)]; leaves.forEach(l => { l.newLeaf = 0; }); }
        rs.end(ctx, W, H);
      }
    };
  };

  // Magic Smoke (MagicSmokeRS, clouds.rs) ---------------------------------------------------------------------------------
  // Five 256 x 256 noise layers (noise1…5.png), each turned, shifted and scaled, recoloured per preset by makeTexture;
  // MagicSmokeRS's 20 presets as the image's static table has them: processTextureMode, back colour, low, high, alpha
  // multiplier, texture mask, rotate, texture swap, premultiply, blend ONE (else SRC_ALPHA). DEFAULT_PRESET 4; the
  // MagicSmokeSelector moves to the next one on each tap (the "preset" preference).
  const PRESETS = [
    [1, 0x000000, 0x000000, 0xffffff, 2.0, 15, 1, 0, 0, 0], [1, 0x0000ff, 0x000000, 0xffffff, 2.0, 15, 1, 0, 0, 0],
    [1, 0x00ff00, 0x000000, 0xffffff, 2.0, 15, 1, 0, 0, 0], [1, 0x00ff00, 0x000000, 0xffffff, 2.0, 15, 1, 0, 0, 1],
    [1, 0x00ff00, 0x00ff00, 0xffffff, 2.5, 31, 1, 0, 1, 1], [1, 0x800000, 0xff0000, 0xffffff, 2.5, 31, 1, 0, 1, 0],
    [0, 0x000000, 0x000000, 0xffffff, 0.0, 31, 1, 0, 0, 0], [1, 0x0000ff, 0x00ff00, 0xffff00, 2.0, 31, 1, 0, 1, 0],
    [1, 0x008000, 0x00ff00, 0xffffff, 2.5, 31, 1, 0, 1, 0], [1, 0x800000, 0xff0000, 0xffffff, 2.5, 31, 1, 0, 1, 1],
    [1, 0x808080, 0x000000, 0xffffff, 2.0, 15, 1, 0, 0, 1], [1, 0x0000ff, 0x000000, 0xffffff, 2.0, 15, 1, 0, 0, 1],
    [1, 0x0000ff, 0x00ff00, 0xffff00, 1.5, 31, 0, 0, 0, 1], [1, 0x0000ff, 0x00ff00, 0xffff00, 2.0, 31, 1, 0, 1, 1],
    [1, 0x0000ff, 0x00ff00, 0xffff00, 1.5, 31, 1, 0, 1, 1], [1, 0x808080, 0x000000, 0xffffff, 2.0, 15, 1, 0, 0, 0],
    [1, 0x000000, 0x000000, 0xffffff, 2.0, 15, 1, 0, 1, 0], [2, 0x000000, 0x000070, 0xff2020, 2.5, 31, 1, 0, 0, 0],
    [2, 0x6060ff, 0x000070, 0xffffff, 2.5, 31, 1, 0, 0, 0], [3, 0x0000f0, 0x000000, 0xffffff, 2.0, 15, 1, 0, 1, 0]
  ];
  const smokePreset = c => { const p = c.data.magicSmokePreset; return Number.isInteger(p) && p >= 0 && p < PRESETS.length ? p : 4; };
  EC.liveWallpapers.magicsmoke = () => {
    const rs = RS();
    if (!rs) return {resize() {}, draw: fallback};
    const sources = [1, 2, 3, 4, 5].map(i => { const im = new Image(); im.src = `assets/ms-noise${i}.png`; return im; });
    const textures = sources.map(() => ({tex: null, ready: false}));
    const xshift = [0, 0, 0, 0, 0], rotation = [0, 72, 144, 216, 0], scale = [4, 3, 3.4, 3.8, 4.2];
    let W = 480, H = 800, current = -1, lastUp = performance.now(), pixels = null;
    const premul = (rgb, a) => {
      let r = (rgb >> 16) * a + 1; r = (r + (r >> 8)) >> 8;
      let g = ((rgb >> 8) & 0xff) * a + 1; g = (g + (g >> 8)) >> 8;
      let b = (rgb & 0xff) * a + 1; b = (b + (b >> 8)) >> 8;
      return r << 16 | g << 8 | b;
    };
    function makeTextures(p) {
      if (!sources.every(s => s.complete && s.naturalWidth)) return false;
      if (!pixels) pixels = sources.map(s => { const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d'); x.drawImage(s, 0, 0); return x.getImageData(0, 0, 256, 256).data; });
      const [mode, , low, high, amul, , , , pm] = PRESETS[p];
      let alphafactor = 1;
      pixels.forEach((src, n) => {
        const dst = new Uint8Array(256 * 256 * 4);
        for (let i = 0; i < 256 * 256; i++) {
          let pix, a;
          if (mode === 1 || mode === 3) {
            let lum = src[i * 4 + 2];
            if (mode === 3) lum = lum < 128 ? lum * 2 : 255 - (lum - 128) * 2;
            if (lum < 128) { pix = low; a = Math.trunc((255 - lum * 2) / alphafactor); }
            else { pix = high; a = Math.trunc((lum - 128) * 2 / alphafactor); }
            if (pm) pix = premul(pix, a);
          } else if (mode === 2) {
            let alpha = src[i * 4 + 2];
            alpha = alpha < low ? 0 : Math.trunc((alpha - low) * (255 / (255 - low)));
            a = Math.trunc(alpha / alphafactor); pix = high;
            if (pm) pix = premul(pix, a);
          } else { a = src[i * 4 + 3]; pix = premul((src[i * 4] << 16) | (src[i * 4 + 1] << 8) | src[i * 4 + 2], a); }
          dst[i * 4] = (pix >> 16) & 255; dst[i * 4 + 1] = (pix >> 8) & 255; dst[i * 4 + 2] = pix & 255; dst[i * 4 + 3] = a & 255;
        }
        if (mode !== 0) alphafactor *= amul;
        textures[n].tex = rs.upload(textures[n].tex, {width: 256, height: 256, data: dst}, {premul: false});
        textures[n].ready = true;
      });
      return true;
    }
    return {
      interval: 55,
      resize(w, h) { W = w; H = h; },
      next(c) { c.data.magicSmokePreset = (smokePreset(c) + 1) % PRESETS.length; c.save(); },
      draw(ctx, xOffset, now) {
        const c = EC.context, p = smokePreset(c), [, back, , , , mask, rotate, swap, , one] = PRESETS[p];
        if (p !== current && makeTextures(p)) current = p;
        let delta = (now - lastUp) / 44; lastUp = now;
        if (delta > 100) delta = 1;
        rs.begin(W, H, [(back >> 16 & 255) / 255, (back >> 8 & 255) / 255, (back & 255) / 255]);
        if (current < 0) { rs.end(ctx, W, H); return; }
        const tilt = 0, ident = chain(M.T(-xOffset, 0, 0), M.S(0.0041, 0.0041, 0.0041), M.R(-tilt, 1, 0, 0));
        rs.proj(normalized(W, H)); rs.mode(1); rs.color(1, 1, 1, 1);
        if (one) rs.store('one', 'oneMinusSrcAlpha'); else rs.store('srcAlpha', 'oneMinusSrcAlpha');
        if (rotate) [0.10, 0.102, 0.106, 0.114, 0.123].forEach((r, i) => { rotation[i] += r * delta; });
        scale[0] = swap ? 0.25 : 4;
        const speeds = [0.0010, 0.00106, 0.00114, 0.00118, 0.00127];
        for (let i = 0; i < 5; i++) {
          if (!(mask & (1 << i))) continue;
          xshift[i] += speeds[i] * delta;
          rs.model(chain(ident, M.T(-xOffset * 8 * i, -tilt * i / 3, 0), M.R(rotation[i], 0, 0, 1)));
          rs.tex(textures[i === 0 && swap ? 4 : i]);
          const z = -8 * i, s = scale[i], x = xshift[i];
          rs.quad(-1200, -1200, z, x, 0, 1200, -1200, z, s + x, 0, 1200, 1200, z, s + x, s, -1200, 1200, z, x, s);
        }
        for (let i = 0; i < 5; i++) { while (xshift[i] >= 1) xshift[i] -= 1; while (rotation[i] >= 360) rotation[i] -= 360; }
        rs.end(ctx, W, H);
      }
    };
  };

  // Many (Visualization5RS, many.rs) --------------------------------------------------------------------------------------
  // Six panels round the viewer, waveform and VU meter in turn, 60 degrees apart, slowly revolving (0.3 degrees per 35 ms)
  // and turned by the home screen ((xOffset - 0.5) × 90); mirrored below through the semi-transparent album-art floor.
  // Every texture is REPLACE, blended ONE / ONE_MINUS_SRC_ALPHA. With no music: the idle wave and the needle at rest.
  EC.liveWallpapers.many = () => {
    const rs = RS();
    if (!rs) return {resize() {}, draw: fallback};
    const t = n => rs.texture(`assets/vz-${n}.png`, {wrap: false, mip: true});
    const T = {bg: t('background'), on: t('peak_on'), off: t('peak_off'), needle: t('needle'), frame: t('frame'), album: t('albumart'), line: rs.texture('assets/vz-fire.png', {wrap: false})};
    const black = rs.texture({width: 1, height: 1, data: new Uint8Array([0, 0, 0, 255])});
    const pos = new Float32Array(256 * 2 * 3), tex = new Float32Array(256 * 2 * 2);
    for (let i = 0; i < 256; i++) { pos[i * 6] = pos[i * 6 + 3] = i - 128; tex.set([0, 0, 1, 0], i * 4); }
    let W = 480, H = 800, lastUp = 0, autorotation = 0, n = 0;
    const angle = 131, tilt = 0;
    function drawVU(ident) {
      const s = 0.0041;
      rs.model(chain(ident, M.R(0, 0, 0, 1), M.S(s, s, s)));
      rs.tex(T.bg); rs.quad(-208, -33, 600, 0, 1, 208, -33, 600, 1, 1, 208, 200, 600, 1, 0, -208, 200, 600, 0, 0);
      rs.tex(T.off); rs.quad(140, 70, 600, 0, 1, 196, 70, 600, 1, 1, 196, 128, 600, 1, 0, 140, 128, 600, 0, 0);
      rs.model(chain(ident, M.T(0, -57 * s, 0), M.R(angle - 90, 0, 0, 1), M.S(s, s, s)));
      rs.tex(T.needle); rs.quad(-44, -45, 600, 0, 1, 44, -45, 600, 1, 1, 44, 217, 600, 1, 0, -44, 217, 600, 0, 0);
      rs.model(chain(ident, M.R(0, 0, 0, 1), M.S(s, s, s)));
      rs.tex(black); rs.quadPlain(-100, -55, 600, -100, -105, 600, 100, -105, 600, 100, -55, 600);
      rs.tex(T.frame); rs.quad(-236, -60, 600, 0, 1, 236, -60, 600, 1, 1, 236, 230, 600, 1, 0, -236, 230, 600, 0, 0);
    }
    function drawWave(ident) {
      const s = 0.008;
      rs.model(chain(ident, M.S(s, s / 2048, s), M.T(0, 81920, 350)));
      const amp1 = Math.sin(0.007 * n) * 120 * 1024, amp2 = Math.sin(0.023 * n) * 80 * 1024, amp3 = Math.sin(0.011 * n) * 40 * 1024, amp4 = Math.sin(0.031 * n) * 20 * 1024;
      for (let i = 0; i < 256; i++) {
        let val = Math.sin(0.013 * (n + i * 4)) * amp1 + Math.sin(0.029 * (-n + i * 4)) * amp2;
        const off = Math.sin(0.005 * (n + i * 4)) * amp3 + Math.sin(0.017 * (n + i * 4)) * amp4;
        if (val < 2 && val > -2) val = 2;
        pos[i * 6 + 1] = val + off; pos[i * 6 + 4] = -val + off;
      }
      rs.tex(T.line);
      rs.draw(rs.gl.LINES, {pos, tex}, 512);
    }
    function layer(ident) {
      for (let i = 0; i < 6; i++) {
        if (i & 1) drawVU(ident); else drawWave(ident);
        ident = M.mul(ident, M.R(60, 0, 1, 0));
      }
    }
    return {
      interval: 20,
      resize(w, h) { W = w; H = h; },
      draw(ctx, xOffset, now) {
        let delta = now - lastUp; lastUp = now;
        if (delta > 5000) delta = 100;
        autorotation = (autorotation + 0.3 * delta / 35) % 360;
        rs.begin(W, H);
        rs.proj(normalized(W, H)); rs.mode(0); rs.store('one', 'oneMinusSrcAlpha');
        let ident = chain(M.I(), M.R(tilt, 1, 0, 0), M.R(autorotation + (xOffset - 0.5) * 90, 0, 1, 0));
        ident = chain(ident, M.T(0, -1, 0), M.S(1, -1, 1));
        layer(ident);
        // The floor, drawn with the last VU's matrix still loaded.
        rs.model(chain(ident, M.R(300, 0, 1, 0), M.R(0, 0, 0, 1), M.S(0.0041, 0.0041, 0.0041)));
        rs.tex(T.album); rs.quad(-1500, -60, 1500, 0, 1, 1500, -60, 1500, 1, 1, 1500, -60, -1500, 1, 0, -1500, -60, -1500, 0, 0);
        ident = chain(ident, M.S(1, -1, 1), M.T(0, 1, 0));
        layer(ident);
        n++;
        rs.end(ctx, W, H);
      }
    };
  };
})();
