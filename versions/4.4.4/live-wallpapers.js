/* Live wallpapers of the Nexus 5 KTU84P factory image: it declares exactly one WallpaperService, Sun Beam (SunBeam.apk,
   package com.android.phasebeamorange), which is AOSP's Phase Beam (packages/wallpapers/PhaseBeam, android-4.4.4_r1)
   with an orange res/raw/bgmesh.csv. Redrawn in WebGL from phasebeam.rs and PhaseBeamRS.java with the APK's own
   bg/dot GLSL (identical to Phase Beam's), mesh and dot / beam textures. */
(() => {
  'use strict';
  let DEVICE_WIDTH = 1080; // the panel width in device pixels; gl_PointSize is written for it
  const DENSITY_DPI = 480; // hammerhead's ro.sf.lcd_density; PhaseBeamRS: scaleSize = densityDPI / 240
  const DOT_COUNT = 28; // PhaseBeamRS.DOT_COUNT, the size of both particle allocations
  const rand = (a, b) => a + Math.random() * (b - a);
  // SunBeam.apk res/raw/bgmesh.csv: x, y, r, g, b per vertex, three vertices per triangle (Mesh.Primitive.TRIANGLE).
  const BG_MESH = [
    -0.75,1,0.894,0.231,0.122, -1.25,1,0.894,0.231,0.122, -1,0.6,0.894,0.231,0.122,
    0,1,0.894,0.231,0.122, -0.75,1,0.894,0.231,0.122, -0.5,0.6,0.894,0.231,0.122,
    0.625,1,0.733,0.055,0.141, 0,1,0.894,0.231,0.122, 0.375,0.6,0.667,0.043,0.145,
    1.25,1,0.376,0.008,0.075, 0.625,1,0.733,0.055,0.141, 0.875,0.4,0.435,0.012,0.125,
    -1,0.6,0.894,0.231,0.122, -1.25,1,0.894,0.231,0.122, -1.25,0.2,0.89,0.169,0.114,
    -0.75,0.4,0.898,0.298,0.133, -1,0.6,0.894,0.231,0.122, -1.25,0.2,0.89,0.169,0.114,
    -0.5,0.6,0.894,0.231,0.122, -0.75,1,0.894,0.231,0.122, -1,0.6,0.894,0.231,0.122,
    -0.5,0.6,0.894,0.231,0.122, -1,0.6,0.894,0.231,0.122, -0.75,0.4,0.898,0.298,0.133,
    0,0.3,0.639,0.039,0.149, 0,1,0.894,0.231,0.122, -0.5,0.6,0.894,0.231,0.122,
    0,0.3,0.639,0.039,0.149, 0.375,0.6,0.667,0.043,0.145, 0,1,0.894,0.231,0.122,
    0.875,0.4,0.435,0.012,0.125, 0.625,1,0.733,0.055,0.141, 0.375,0.6,0.667,0.043,0.145,
    1.25,0.1,0.392,0.008,0.102, 1.25,1,0.376,0.008,0.075, 0.875,0.4,0.435,0.012,0.125,
    0.375,0,0.388,0.008,0.102, 0.375,0.6,0.667,0.043,0.145, 0,0.3,0.639,0.039,0.149,
    -0.375,0,0.667,0.043,0.145, -0.5,0.6,0.894,0.231,0.122, -0.75,0.4,0.898,0.298,0.133,
    0,0.3,0.639,0.039,0.149, -0.5,0.6,0.894,0.231,0.122, -0.375,0,0.667,0.043,0.145,
    -0.75,-0.1,0.878,0.086,0.11, -0.75,0.4,0.898,0.298,0.133, -1.25,0.2,0.89,0.169,0.114,
    -0.75,-0.1,0.878,0.086,0.11, -1.25,0.2,0.89,0.169,0.114, -1.25,-0.64,0.667,0.043,0.145,
    -0.375,0,0.667,0.043,0.145, -0.75,0.4,0.898,0.298,0.133, -0.75,-0.1,0.878,0.086,0.11,
    0.375,0,0.388,0.008,0.102, 0,0.3,0.639,0.039,0.149, -0.375,0,0.667,0.043,0.145,
    0.875,0.4,0.435,0.012,0.125, 0.375,0.6,0.667,0.043,0.145, 0.375,0,0.388,0.008,0.102,
    1.25,0.1,0.392,0.008,0.102, 0.875,0.4,0.435,0.012,0.125, 0.375,0,0.388,0.008,0.102,
    -0.375,-0.5,0.424,0.012,0.118, -0.75,-0.1,0.878,0.086,0.11, -1.25,-0.64,0.667,0.043,0.145,
    -0.375,-0.5,0.424,0.012,0.118, -0.375,0,0.667,0.043,0.145, -0.75,-0.1,0.878,0.086,0.11,
    0.125,-0.5,0.376,0.008,0.09, -0.375,0,0.667,0.043,0.145, -0.375,-0.5,0.424,0.012,0.118,
    0.125,-0.5,0.376,0.008,0.09, 0.375,0,0.388,0.008,0.102, -0.375,0,0.667,0.043,0.145,
    0.625,-0.4,0.357,0.004,0.071, 0.375,0,0.388,0.008,0.102, 0.125,-0.5,0.376,0.008,0.09,
    0.625,-0.4,0.357,0.004,0.071, 1.25,0.1,0.392,0.008,0.102, 0.375,0,0.388,0.008,0.102,
    1.25,-1,0.4,0.008,0.098, 1.25,0.1,0.392,0.008,0.102, 0.625,-0.4,0.357,0.004,0.071,
    1.25,-1,0.4,0.008,0.098, 0.625,-0.4,0.357,0.004,0.071, 0.375,-1,0.286,0.004,0.035,
    0.375,-1,0.286,0.004,0.035, 0.625,-0.4,0.357,0.004,0.071, 0.125,-0.5,0.376,0.008,0.09,
    0.375,-1,0.286,0.004,0.035, 0.125,-0.5,0.376,0.008,0.09, -0.5,-1,0.341,0.004,0.059,
    -0.5,-1,0.341,0.004,0.059, 0.125,-0.5,0.376,0.008,0.09, -0.375,-0.5,0.424,0.012,0.118,
    -0.5,-1,0.341,0.004,0.059, -0.375,-0.5,0.424,0.012,0.118, -1.25,-1,0.373,0.004,0.078,
    -1.25,-0.64,0.667,0.043,0.145, -1.25,-1,0.373,0.004,0.078, -0.375,-0.5,0.424,0.012,0.118
  ];
  function program(gl, vs, fs) {
    const shader = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const p = gl.createProgram(); gl.attachShader(p, shader(gl.VERTEX_SHADER, vs)); gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
    return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
  }
  // The RenderScript shaders, with their ATTRIB_ / UNI_ inputs declared the way the RS runtime declares them.
  const BG_VS = 'attribute vec2 ATTRIB_position; attribute float ATTRIB_offsetX; attribute vec3 ATTRIB_color; varying lowp vec4 color;'
    + 'void main() { color = vec4(ATTRIB_color, 1.0); gl_Position = vec4(ATTRIB_position.x + ATTRIB_offsetX/3.5, ATTRIB_position.y, 0.0, 1.0); }';
  const BG_FS = 'precision mediump float; varying lowp vec4 color; void main() { gl_FragColor = color; }';
  const DOT_VS = 'attribute vec3 ATTRIB_position; attribute float ATTRIB_offsetX; uniform float UNI_scaleSize; varying float pointSize;'
    + 'void main() { vec4 objPos = vec4(ATTRIB_position, 1.0); float tmpPointSize = ATTRIB_position.z*7.0; pointSize = 0.5-tmpPointSize/1000.0;'
    + ' objPos.z = 0.0; objPos.x = objPos.x - ATTRIB_offsetX * tmpPointSize/100.0; gl_Position = objPos; gl_PointSize = tmpPointSize*UNI_scaleSize; }';
  const DOT_FS = 'precision mediump float; uniform sampler2D UNI_Tex0; varying float pointSize;'
    + 'void main() { gl_FragColor = texture2D(UNI_Tex0, gl_PointCoord); gl_FragColor.a = pointSize; }';

  function sunBeam(canvas, assets) {
    const gl = canvas.getContext('webgl', {alpha: false, antialias: false});
    if (!gl) return null;
    const bg = program(gl, BG_VS, BG_FS), pts = program(gl, DOT_VS, DOT_FS);
    if (!bg || !pts) return null;
    const bgBuffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bgBuffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(BG_MESH), gl.STATIC_DRAW);
    const dotBuffer = gl.createBuffer(), beamBuffer = gl.createBuffer(), scratch = new Float32Array(DOT_COUNT * 3);
    const texture = src => {
      const tex = gl.createTexture(), img = new Image();
      img.onload = () => { gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img); tex.ready = true; };
      // Sampler.CLAMP_LINEAR; dot.png is 64 x 65, so no mipmaps in WebGL 1 either.
      gl.bindTexture(gl.TEXTURE_2D, tex);
      for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
      img.src = assets + src;
      return tex;
    };
    const textureDot = texture('lw-sunbeam-dot.png'), textureBeam = texture('lw-sunbeam-beam.png');
    // phasebeam.rs positionParticles().
    const dots = [], beams = [];
    for (let i = 0; i < DOT_COUNT; i++) {
      const p = {x: rand(0, 3), y: rand(-1.25, 1.25), z: 0};
      // The script's "i < 4" branch after "i < 7" can never run.
      if (i < 3) p.z = 14; else if (i < 7) p.z = 25; else if (i === 10) { p.z = 24; p.x = 1; } else p.z = rand(6, 14);
      dots.push(p);
    }
    for (let i = 0; i < DOT_COUNT; i++) beams.push({x: rand(-1.25, 1.25), y: rand(-1.05, 1.205), z: (i < 20 ? rand(4, 10) : rand(4, 35)) / 2});
    let oldOffset = .5, bgOffset = 0;
    function points(buffer, list, tex, offset) {
      list.forEach((p, i) => scratch.set([p.x, p.y, p.z], i * 3));
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, scratch, gl.DYNAMIC_DRAW);
      const pos = gl.getAttribLocation(pts, 'ATTRIB_position'), off = gl.getAttribLocation(pts, 'ATTRIB_offsetX');
      gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0);
      gl.disableVertexAttribArray(off); gl.vertexAttrib1f(off, offset);
      gl.bindTexture(gl.TEXTURE_2D, tex); gl.drawArrays(gl.POINTS, 0, list.length);
    }
    return {
      interval: 66, // root() returns 66
      resize() { gl.viewport(0, 0, canvas.width, canvas.height); },
      draw(xOffset) {
        // phasebeam.rs root(): the particles only rise while the launcher is not moving the offset.
        const newOffset = xOffset * 2, still = newOffset === oldOffset;
        if (!still) bgOffset = -xOffset / 2;
        for (let i = 0; i < DOT_COUNT; i++) {
          const beam = beams[i], particle = dots[i];
          if (still) {
            if (beam.x / beam.z > .5) beam.x = -1;
            if (particle.x / particle.z > .5) particle.x = -1;
            if (beam.y > 1.05) { beam.y = -1.05; beam.x = rand(-1.25, 1.25); } else beam.y += .00016 * beam.z;
            if (particle.y > 1.25) { particle.y = -1.25; particle.x = rand(0, 3); } else particle.y += .00022 * particle.z;
          }
          beam.x += .0001 * beam.z;
          // The script advances its beam pointer first, so a dot drifts by the next beam's depth (none after the last).
          particle.x += .000156 * (beams[i + 1]?.z || 0);
        }
        gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // ProgramStore: SRC_ALPHA, ONE
        gl.useProgram(bg); gl.bindBuffer(gl.ARRAY_BUFFER, bgBuffer);
        const pos = gl.getAttribLocation(bg, 'ATTRIB_position'), col = gl.getAttribLocation(bg, 'ATTRIB_color'), off = gl.getAttribLocation(bg, 'ATTRIB_offsetX');
        gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 20, 0);
        gl.enableVertexAttribArray(col); gl.vertexAttribPointer(col, 3, gl.FLOAT, false, 20, 8);
        gl.disableVertexAttribArray(off); gl.vertexAttrib1f(off, bgOffset);
        gl.drawArrays(gl.TRIANGLES, 0, BG_MESH.length / 5);
        gl.disableVertexAttribArray(col);
        gl.useProgram(pts);
        gl.uniform1f(gl.getUniformLocation(pts, 'UNI_scaleSize'), DENSITY_DPI / 240 * canvas.width / DEVICE_WIDTH);
        gl.uniform1i(gl.getUniformLocation(pts, 'UNI_Tex0'), 0);
        if (textureBeam.ready) points(beamBuffer, beams, textureBeam, newOffset);
        if (textureDot.ready) points(dotBuffer, dots, textureDot, newOffset);
        oldOffset = newOffset;
      }
    };
  }

  // The one service LiveWallpaperListAdapter finds. Its wallpaper_label is "Sun Beam" in English only; the translations
  // are still Phase Beam's.
  const LIST = [{id: 'sunbeam', label: 'Sun Beam', thumb: 'lw-sunbeam_thumb.png', make: (c, a) => sunBeam(c, a)}];
  const find = id => LIST.find(item => item.id === id);
  function sorted(t, locale) { const collator = new Intl.Collator(locale); return [...LIST].sort((a, b) => collator.compare(t(a.label), t(b.label))); }

  /* A running wallpaper on its own canvas: resizes with its host, throttles to the original frame delay, and pauses
     while hidden. */
  function mount(host, id, options = {}) {
    const spec = find(id); if (!spec) return null;
    DEVICE_WIDTH = options.deviceWidth || 1080;
    const canvas = document.createElement('canvas'); canvas.className = 'lw-canvas'; host.append(canvas);
    let scene = spec.make(canvas, options.assets || 'assets/', options);
    if (!scene) { canvas.remove(); return null; }
    let raf = 0, lastFrame = 0, w = 0, h = 0, offset = options.offset ?? .5, running = true;
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
      if (t - lastFrame < scene.interval - 4) return;
      lastFrame = t;
      if (fit()) scene.draw(offset);
    }
    raf = requestAnimationFrame(loop);
    return {
      id, canvas,
      setOffset(value) { offset = Math.max(0, Math.min(1, value)); },
      tap() {},
      pause(value) { running = !value; },
      destroy() { cancelAnimationFrame(raf); canvas.remove(); scene = null; }
    };
  }
  window.LiveWallpapers = {LIST, find, sorted, mount};
})();
