/* Android 2.1 All applications: Launcher2's AllAppsView, the RenderScript "rollo" (res/raw/rollo3.c, compiled on the phone)
   drawn here with WebGL as the script draws it:
   - drawFrontGrid: 4 columns of colWidth = width / 4, rows of colWidth + 25 px, centred and 110 px up, each app a
     128 x 128 sprite (Utilities.createAllAppsBitmap: the 72 px icon, its label of up to two 13 sp lines under it);
     cropped between the grid's top and bottom;
   - drawTop / drawBottom: the rows above and below bend away on strips of initMesh's mesh (200 segments of 0.1, flat for
     7, then turning by 0.2 x 0.16 pi per segment up to 0.16 pi; brightness 1 - 0.1 per segment after the 7th, at least
     0.4; texture u 0.08 … 0.92) placed by positionStrip (scale 72 * 3 / width, top at y 0.8, bottom at -0.9 mirrored,
     texture rows 1.4 apart) in setupProjectionNormalized's perspective;
   - the home button (home_button_*) at the bottom centre, 30 px below the edge;
   - physics (updatePos): attraction / friction tables pulling to whole rows, drags of 5.2 rows per screen height, flings
     of -4 x the velocity with a 3.5 minimum near a row, damping past either end; zoom in (1 - zoom) * 0.2 per frame,
     out -dt - (1 - zoom) * 0.2, at least 0.02; the background darkens with the zoom (pfClearColor alpha).
   Coordinates are the phone's pixels (480 wide). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const PI = 3.14159, ATTRACTION = [20, 20, 20, 10, -10, -20, -20, -20, -20], FRICTION = [10, 10, 11, 15, 15, 11, 10, 10, 10], TABLE = 7;
  const lerp = (a, b, t) => a + (b - a) * t, clamp = (v, a, b) => Math.min(b, Math.max(a, v)), frac = v => v - Math.floor(v);

  // initMesh: the strip every bent row is drawn on.
  function mesh() {
    const pos = [], tex = [], col = [];
    let y = 0, z = 0;
    for (let ct = 0; ct < 200; ct++) {
      const maxAngle = 3.14 * 0.16;
      let angle = 0, l = 1 - (ct - 7) * 0.1;
      if (ct > 7) angle = Math.min(maxAngle * (ct - 7) * 0.2, maxAngle);
      l = Math.min(1, Math.max(0.4, l));
      y += 0.1 * Math.cos(angle); z += 0.1 * Math.sin(angle);
      const t = 0.1 * ct, ds = 0.08;
      pos.push(-0.5, y, z, 0.5, y, z); tex.push(ds, t, 1 - ds, t); col.push(l, l);
    }
    const idx = [];
    for (let ct = 0; ct < 200 * 2 - 2; ct += 2) idx.push(ct, ct + 1, ct + 2, ct + 1, ct + 3, ct + 2);
    return {pos: new Float32Array(pos), tex: new Float32Array(tex), col: new Float32Array(col), idx: new Uint16Array(idx)};
  }
  // 4x4 matrices, column-major like RenderScript's rs_matrix.
  const ident = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const mul = (a, b) => { const o = new Array(16).fill(0); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k]; return o; };
  const translate = (x, y, z) => { const m = ident(); m[12] = x; m[13] = y; m[14] = z; return m; };
  const scale = (x, y, z) => { const m = ident(); m[0] = x; m[5] = y; m[10] = z; return m; };
  const rotateX = deg => { const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r), m = ident(); m[5] = c; m[6] = s; m[9] = -s; m[10] = c; return m; };
  // ProgramVertex.MatrixAllocation.setupProjectionNormalized(w, h), w < h: frustum(-1, 1, -h/w, h/w, 1, 100) x rotate 180°
  // about y x scale(-2, 2, 1) x translate(0, 0, 2).
  function projection(w, h) {
    const a = h / w, n = 1, f = 100;
    const fr = [2 * n / 2, 0, 0, 0, 0, 2 * n / (2 * a), 0, 0, 0, 0, -(f + n) / (f - n), -1, 0, 0, -2 * f * n / (f - n), 0];
    const rotY = [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1];
    return mul(mul(mul(fr, rotY), scale(-2, 2, 1)), translate(0, 0, 2));
  }

  // Utilities.createAllAppsBitmap: the icon and its label in a 128 x 128 sprite (BubbleText: 13 sp white, two lines at most,
  // as wide as a workspace cell, 80 dp).
  function sprite(app, label, icon) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 128;
    const x = cv.getContext('2d');
    if (icon.complete && icon.naturalWidth) x.drawImage(icon, 28, 12, 72, 72);
    x.font = '19.5px DroidSans, Arial, sans-serif'; x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    const words = label.split(/\s+/), lines = [];
    let line = '';
    for (const w of words) { const next = line ? `${line} ${w}` : w; if (line && x.measureText(next).width > 114) { lines.push(line); line = w; } else line = next; }
    if (line) lines.push(line);
    lines.slice(0, 2).forEach((text, i) => {
      let t = text;
      while (x.measureText(t).width > 114 && t.length > 1) t = t.slice(0, -1);
      x.fillText(t, 64, 96 + i * 23);
    });
    return cv;
  }

  const VS = `attribute vec3 aPos; attribute vec2 aTex; attribute float aCol; uniform mat4 uProj, uModel, uTexM; varying vec2 vTex; varying float vCol;
    void main(){ vec4 t = uTexM * vec4(aTex, 0.0, 1.0); vTex = t.xy; vCol = aCol; gl_Position = uProj * uModel * vec4(aPos, 1.0); }`;
  const FS = `precision mediump float; uniform sampler2D uTex; uniform vec4 uColor; varying vec2 vTex; varying float vCol;
    void main(){ if (vTex.x < 0.0 || vTex.x > 1.0 || vTex.y < 0.0 || vTex.y > 1.0) discard; vec4 c = texture2D(uTex, vTex);
      gl_FragColor = vec4(c.rgb * vCol, c.a * 0.99) * uColor; }`;

  let gl = null, canvas = null, prog = null, buffers = null, textures = [], homeTex = {}, W = 480, H = 762, apps = [];
  const st = {pos: 0, vel: 0, zoom: 0, target: 0, touch: false, lastY: 0, moveTo: 0, moveFrom: 0, moveTarget: 0, last: 0, frame: 0, pressedHome: false};

  function setup(c, root) {
    canvas = root.querySelector('.ecdr-gl');
    gl = canvas.getContext('webgl', {premultipliedAlpha: false, alpha: true, antialias: true});
    if (!gl) return false;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    const m = mesh(), buf = (data, target = gl.ARRAY_BUFFER) => { const b = gl.createBuffer(); gl.bindBuffer(target, b); gl.bufferData(target, data, gl.STATIC_DRAW); return b; };
    buffers = {pos: buf(m.pos), tex: buf(m.tex), col: buf(m.col), idx: buf(m.idx, gl.ELEMENT_ARRAY_BUFFER), quadPos: gl.createBuffer(), quadTex: gl.createBuffer(), quadCol: buf(new Float32Array([1, 1, 1, 1]))};
    apps = EC.apps.sorted();
    textures = apps.map(app => {
      const t = gl.createTexture(), icon = new Image();
      icon.onload = () => upload(t, sprite(app, EC.apps.label(app.id), icon));
      icon.src = `assets/${app.icon}`;
      upload(t, sprite(app, EC.apps.label(app.id), icon));
      return t;
    });
    for (const state of ['normal', 'pressed']) {
      const t = gl.createTexture(), img = new Image(); img.onload = () => upload(t, img); img.src = `assets/l2-home_button_${state}.png`; homeTex[state] = t;
    }
    return true;
  }
  function upload(t, source) {
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }
  function attrib(name, b, size) { const loc = gl.getAttribLocation(prog, name); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0); }
  const uni = (name, m) => gl.uniformMatrix4fv(gl.getUniformLocation(prog, name), false, new Float32Array(m));

  // positionStrip: the model and texture matrices of one bent row; returns the first mesh segment to draw.
  function positionStrip(row, column, isTop, p) {
    const x = 0.5 * (column - 1.5), s = 72 * 3 / W;
    let model = isTop ? mul(translate(x, 0.8, 0), scale(s, s, 1)) : mul(translate(x, -0.9, 0), scale(s, -s, 1));
    model = mul(mul(model, translate(0, p * 2, 0)), rotateX(-p * 50));
    const soff = -(row * 1.4);
    const texM = isTop ? mul(scale(1, -0.85, 1), translate(0, soff - 0.95 + 0.18, 0)) : mul(scale(1, 0.85, 1), translate(0, soff - 0.65, 0));
    return {model, texM, offset: -(soff + 0.3) * 10};
  }
  function drawStrip(row, column, isTop, icon, p) {
    if (icon < 0 || icon >= textures.length) return;
    const {model, texM, offset: o} = positionStrip(row, column, isTop, p);
    if (o < -20) return;
    let offset = clamp(Math.trunc(o), 0, 199 - 20), len = 20;
    if (isTop && offset < 7) { len -= 7 - offset; offset = 7; }
    uni('uModel', model); uni('uTexM', texM);
    gl.bindTexture(gl.TEXTURE_2D, textures[icon]);
    gl.drawElements(gl.TRIANGLES, len * 6, gl.UNSIGNED_SHORT, offset * 6 * 2);
  }
  function drawTop(rowOffset, p) {
    let icon = 0;
    for (let row = 0; row <= Math.trunc(rowOffset + 1); row++) for (let col = 0; col < 4; col++) { if (icon >= apps.length) return; drawStrip(rowOffset - row, col, 1, icon, p); icon++; }
  }
  function drawBottom(rowOffset, p) {
    const intRow = Math.trunc(rowOffset);
    let pos = -1 - (rowOffset - intRow), icon = (intRow + 3) * 4;
    for (let guard = 0; guard < 50; guard++) {
      for (let col = 0; col < 4; col++) { if (icon >= apps.length) return; if (pos > -1) drawStrip(pos, col, 0, icon, p); icon++; }
      pos += 1;
    }
  }
  // Screen-space sprites (drawSpriteScreenspace: origin bottom left, in pixels) through an orthographic matrix.
  function sprite2d(tex, x, y, w, h, u0 = 0, v0 = 1, u1 = 1, v1 = 0) {
    const L = x / W * 2 - 1, R = (x + w) / W * 2 - 1, B = y / H * 2 - 1, Tp = (y + h) / H * 2 - 1;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.quadPos); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([L, B, 0, R, B, 0, L, Tp, 0, R, Tp, 0]), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.quadTex); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([u0, v0, u1, v0, u0, v1, u1, v1]), gl.DYNAMIC_DRAW);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  function quad3d(tex, px, py, d, z) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.quadPos); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([px - d, py - d, z, px + d, py - d, z, px - d, py + d, z, px + d, py + d, z]), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.quadTex); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]), gl.DYNAMIC_DRAW);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  function frontLayout() {
    const colWidth = W / 4, rowHeight = colWidth + 25;
    let yoff = H - (H - rowHeight * 4) / 2;
    yoff -= 110;
    return {colWidth, rowHeight, yoff, ymax: yoff + rowHeight, ymin: yoff - 3 * rowHeight - 70, gridTop: yoff - 3, gridBottom: yoff - 3 * rowHeight - 70 + 50};
  }
  function drawFrontGrid(rowOffset, p, proj) {
    const g = frontLayout(), intRow = Math.trunc(rowOffset), rowFrac = rowOffset - intRow;
    let icon = intRow * 4;
    for (let row = 0; row < 5; row++) {
      const y = g.yoff - (-rowFrac + row) * g.rowHeight;
      for (let col = 0; col < 4; col++) {
        if (icon >= apps.length) return;
        if (icon >= 0 && y >= g.ymin && y <= g.ymax) {
          const x = g.colWidth * col - (128 - g.colWidth) / 2, iconY = y - 20;
          if (!p) {
            const cropT = y > g.gridTop ? y - g.gridTop : 0, cropB = y < g.gridBottom ? g.gridBottom - y : 0;
            // drawSpriteScreenspaceCropped(x, iconY + cropB, 0, 128, 128 - cropT - cropB, 0, 128 - cropB, 128, -128 + cropT + cropB)
            sprite2d(textures[icon], x, iconY + cropB, 128, 128 - cropT - cropB, 0, (128 - cropB) / 128, 1, cropT / 128);
          } else {
            uni('uProj', proj); uni('uModel', ident());
            const px = ((x + 64) - W / 2) / (W / 2), py = ((iconY + 64) - H / 2) / (W / 2), d = 64 / (W / 2);
            quad3d(textures[icon], px * (p + 1), py * (p + 1), d, -p);
            uni('uProj', ident());
          }
        }
        icon++;
      }
    }
  }

  function updatePos(dt) {
    if (st.touch) return;
    const tablePosNorm = frac(st.pos + 0.5), tablePosF = tablePosNorm * TABLE, i = Math.trunc(tablePosF), f = tablePosF - i;
    const accel = lerp(ATTRACTION[i], ATTRACTION[i + 1], f) * dt, friction = lerp(FRICTION[i], FRICTION[i + 1], f) * dt;
    if (st.moveTo) {
      const total = 0.2, k = (total - st.moveTo) / total;
      st.pos = st.moveFrom + (st.moveTarget - st.moveFrom) * (Math.cos((k + 1) * PI) / 2 + 0.5);
      st.moveTo -= dt; if (st.moveTo <= 0) { st.moveTo = 0; st.pos = st.moveTarget; }
      return;
    }
    if (Math.abs(st.vel) < 4 || st.vel * accel < 0) st.vel += accel;
    if (st.vel > 0) st.vel = Math.max(st.vel - friction, 0); else st.vel = Math.min(st.vel + friction, 0);
    if (friction > Math.abs(st.vel) && friction > Math.abs(accel)) {
      const t = tablePosNorm - 0.5;
      if (Math.abs(t) < friction * dt) { st.pos = Math.round(st.pos); st.vel = 0; }
      else st.vel = t > 0 ? -friction : friction;
    }
    const max = posMax();
    if (st.pos < 0 && st.vel < 0) st.vel *= clamp(1 + st.pos * 4, 0, 0.9);
    if (st.pos > max && st.vel > 0) st.vel *= clamp(1 - (st.pos - max) * 4, 0, 0.9);
    st.pos = clamp(st.pos + st.vel * dt, -0.49, max + 0.49);
  }
  const posMax = () => Math.max(0, Math.trunc((apps.length + 3) / 4) - 4);

  function frame(c) {
    st.frame = 0;
    if (!gl || !canvas.isConnected) return;
    const now = performance.now(), dt = Math.min(0.2, st.last ? (now - st.last) / 1000 : 0.033);
    st.last = now;
    if (st.zoom !== st.target) {
      let dz = st.target > 0.5 ? (1 - st.zoom) * 0.2 : -dt - (1 - st.zoom) * 0.2;
      if (dz && Math.abs(dz) < 0.02) dz = dz > 0 ? 0.02 : -0.02;
      st.zoom = Math.abs(st.zoom - st.target) < Math.abs(dz) ? st.target : st.zoom + dz;
    }
    if (st.zoom < 0.001 && st.target < 0.001) { st.pos = 0; finishClose(c); return; }
    updatePos(dt);
    const w = canvas.width, h = canvas.height;
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, st.zoom); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform4f(gl.getUniformLocation(prog, 'uColor'), 1, 1, 1, 1);
    const proj = projection(W, H), p = 1 - st.zoom;
    // the bent rows
    uni('uProj', proj);
    attrib('aPos', buffers.pos, 3); attrib('aTex', buffers.tex, 2); attrib('aCol', buffers.col, 1);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.idx);
    drawTop(st.pos, p); drawBottom(st.pos, p);
    // the front grid and the home button, in screen space
    uni('uProj', ident()); uni('uModel', ident()); uni('uTexM', ident());
    attrib('aPos', buffers.quadPos, 3); attrib('aTex', buffers.quadTex, 2);
    const colLoc = gl.getAttribLocation(prog, 'aCol'); gl.disableVertexAttribArray(colLoc); gl.vertexAttrib1f(colLoc, 1);
    drawFrontGrid(st.pos, p, proj);
    const home = st.pressedHome ? homeTex.pressed : homeTex.normal;
    sprite2d(home, (W - 128) / 2, (st.zoom - 1) * 128 - 30, 128, 128);
    const busy = st.vel !== 0 || frac(st.pos) || st.zoom !== st.target || st.moveTo || st.touch;
    if (busy) st.frame = requestAnimationFrame(() => frame(c));
  }
  const kick = c => { if (!st.frame) { st.last = 0; st.frame = requestAnimationFrame(() => frame(c)); } };
  let closing = null;
  function close(c, then) { closing = then || (() => c.home()); st.target = 0; kick(c); }
  function finishClose(c) { const done = closing; closing = null; cancelAnimationFrame(st.frame); st.frame = 0; if (done) done(); }

  // chooseTappedIcon: the front grid's cells at the current position.
  function tapped(x, y) {
    const g = frontLayout(), intRow = Math.trunc(st.pos), rowFrac = st.pos - intRow, gy = H - y;
    let icon = intRow * 4;
    for (let row = 0; row < 5; row++) {
      const top = g.yoff - (-rowFrac + row) * g.rowHeight;
      for (let col = 0; col < 4; col++, icon++) {
        if (icon >= apps.length) return -1;
        const left = g.colWidth * col, iconY = top - 20;
        if (top >= g.ymin && top <= g.ymax && x >= left && x < left + g.colWidth && gy >= iconY && gy < iconY + 128 && gy > g.gridBottom - 20) return icon;
      }
    }
    return -1;
  }

  EC.register('drawer', {
    app: false,
    render: c => `<div class="ecdr"><canvas class="ecdr-gl" aria-label="${esc(c.t('All applications'))}"></canvas><div class="ecdr-list">${EC.apps.sorted().map(a => `<button type="button" data-action="ecdr-open" data-app="${a.id}">${esc(EC.apps.label(a.id))}</button>`).join('')}</div></div>`,
    mount(c, root) {
      const ratio = (window.devicePixelRatio || 1) * root.clientWidth / 480;
      W = 480; H = Math.round(480 * root.clientHeight / root.clientWidth);
      const cv = root.querySelector('.ecdr-gl'); cv.width = Math.round(W * ratio); cv.height = Math.round(H * ratio);
      if (!setup(c, root)) { root.classList.add('ecdr-fallback'); return; }
      if (c.ui.drawerFresh) { c.ui.drawerFresh = false; st.zoom = 0; st.pos = 0; st.vel = 0; }
      st.target = 1; kick(c);
      let down = null;
      const k = () => 480 / root.clientWidth;
      cv.addEventListener('pointerdown', event => {
        const r = cv.getBoundingClientRect(), x = (event.clientX - r.left) * k(), y = (event.clientY - r.top) * k();
        down = {x, y, t: performance.now(), samples: [[performance.now(), event.clientY]], id: event.pointerId, moved: false, home: y > H - 80 && Math.abs(x - W / 2) < 64};
        st.pressedHome = down.home;
        st.touch = true; st.vel = 0; st.lastY = event.clientY / c.el.screen.clientHeight; st.moveTo = 0;
        cv.setPointerCapture?.(event.pointerId); kick(c);
      });
      cv.addEventListener('pointermove', event => {
        if (!down || event.pointerId !== down.id) return;
        const r = cv.getBoundingClientRect(), y = (event.clientY - r.top) * k();
        if (Math.abs(y - down.y) > 16 * 1.5) { down.moved = true; st.pressedHome = false; }
        // move(): dx = -(new - last) in screen heights, 5.2 rows per screen height
        const ny = event.clientY / c.el.screen.clientHeight;
        if (down.moved) st.pos = clamp(st.pos - (ny - st.lastY) * 5.2, -0.49, posMax() + 0.49);
        st.lastY = ny;
        down.samples.push([performance.now(), event.clientY]); if (down.samples.length > 5) down.samples.shift();
        kick(c);
      });
      const up = event => {
        if (!down || event.pointerId !== down.id) return;
        const d = down; down = null; st.touch = false; st.pressedHome = false;
        if (!d.moved) {
          if (d.home) { close(c); return; }
          const icon = tapped(d.x, d.y);
          if (icon >= 0) { const app = apps[icon]; close(c, () => c.open(app.id)); }
          kick(c); return;
        }
        // fling(): -velocity * 4 in screen heights per second, at least 3.5 rows/s near a row
        const [t0, y0] = d.samples[0], [t1, y1] = d.samples.at(-1);
        const v = (y1 - y0) / Math.max(0.001, (t1 - t0) / 1000) / c.el.screen.clientHeight;
        st.vel = -v * 4;
        let minVel = 3.5 * (1 - Math.abs(frac(st.pos + 0.5) - 0.5) * 0.45);
        const av = Math.abs(st.vel);
        if (av < minVel && av > 0.2) st.vel = st.vel > 0 ? minVel : -minVel;
        if (st.pos <= 0) st.vel = Math.max(0, st.vel);
        if (st.pos > posMax()) st.vel = Math.min(0, st.vel);
        kick(c);
      };
      cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    },
    action(name, el, event, c) {
      if (name === 'ecdr-open') { c.open(el.dataset.app); return true; }
      return false;
    },
    back(c) { close(c); return true; }
  });
  // Opening from the home screen starts from zoom 0.
  document.addEventListener('DOMContentLoaded', () => {
    const c = EC.context;
    const origOpen = c.open;
    c.open = (view, sub, opts) => { if (view === 'drawer') c.ui.drawerFresh = true; return origOpen(view, sub, opts); };
  });
})();
