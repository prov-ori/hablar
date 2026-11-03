/* 3D-атлас мозга и МРТ-атлас. Геометрия — реальные данные МРТ (см. tools/mozg/build_brain.py).
   Регистрирует лаборатории: brain3d (полный атлас), mri (срезы) и встраиваемые варианты для уроков (@lab id). */
(function () {
  'use strict';
  const P = window.PLATFORM, INFO = window.BRAIN_INFO, SI = INFO.s;
  const el_ = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const HEMI = { L: 'левое полушарие', R: 'правое полушарие', M: 'по средней линии' };

  /* ——— Загрузка данных (лениво: ~4 МБ грузятся только при открытии атласа) ——— */
  const once = {};
  const script = src => once[src] || (once[src] = new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => no(new Error('Не удалось загрузить ' + src)); document.head.appendChild(s); }));
  const b64 = s => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
  async function gunzip(u8) {
    if (typeof DecompressionStream === 'undefined') throw new Error('Браузер не поддерживает распаковку данных. Обновите браузер.');
    return new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
  }
  function parseMesh(buf) {
    const hl = new DataView(buf.buffer, buf.byteOffset).getUint32(0, true);
    const meta = JSON.parse(new TextDecoder().decode(buf.subarray(4, 4 + hl)));
    let off = 4 + hl;
    const take = (n, C) => { const b = n * C.BYTES_PER_ELEMENT; const o = new C(buf.slice(off, off + b).buffer); off += b; return o; };
    for (const m of meta.meshes) {
      const q = take(m.nv * 3, Int16Array), Q = meta.Q;
      m.pos = new Float32Array(m.nv * 3);
      for (let i = 0; i < m.nv; i++) { m.pos[3 * i] = q[3 * i] / Q; m.pos[3 * i + 1] = q[3 * i + 2] / Q; m.pos[3 * i + 2] = -q[3 * i + 1] / Q; } // МНИ (x,y,z) → three (x, z, −y)
      m.idx = take(m.nf * 3, m.it === 2 ? Uint16Array : Uint32Array);
      m.attr = {}; (m.attrs || []).forEach(a => { m.attr[a] = take(m.nv, Uint8Array); });
    }
    meta.lab = {}; meta.labels.forEach(l => { meta.lab[l[0]] = { id: l[0], key: l[1], hemi: l[2] }; });
    return meta;
  }
  let meshP, volP;
  const loadMesh = () => meshP || (meshP = script('brain-mesh.js').then(() => gunzip(b64(window.BRAIN_MESH))).then(b => { delete window.BRAIN_MESH; return parseMesh(b); }));
  const loadVol = () => volP || (volP = script('brain-vol.js').then(async () => {
    const v = window.BRAIN_VOL, raw = await gunzip(b64(v.d)), [nx, ny, nz] = v.n, n = nx * ny * nz;
    const labt = {}; v.labels.forEach(l => { labt[l[0]] = { id: l[0], key: l[1], hemi: l[2] }; });
    return { nx, ny, nz, o: v.o, t1: raw.subarray(0, n), lab: raw.subarray(n, 2 * n), labels: v.labels, labt };
  }));

  /* ——— Цвета ——— */
  const DEEP = { thalamus: '#e9a35d', caudate: '#58b1c9', putamen: '#d0605f', pallidum: '#9272cf', hippocampus: '#46c28b', amygdala: '#e2507c', accumbens: '#e5c24f', ventraldc: '#c98fd2',
    cerebellum: '#c8a595', 'cerebellum-wm': '#efe4d3', brainstem: '#d6c3a8', 'lateral-ventricle': '#4aa8e0', 'inf-lat-vent': '#4aa8e0', ventricle3: '#4aa8e0', ventricle4: '#4aa8e0', 'choroid-plexus': '#e0795f',
    'optic-chiasm': '#f4d35e', 'cc-anterior': '#f6f1e7', 'cc-midanterior': '#efe7d8', 'cc-central': '#f6f1e7', 'cc-midposterior': '#efe7d8', 'cc-posterior': '#f6f1e7', 'cerebral-wm': '#ece6d9' };
  const hsl = (h, s, l) => { const c = new THREE.Color(); c.setHSL(h, s, l); return '#' + c.getHexString(); };
  function regionColor(key, mode) {   // для коры: mode = lobes | gyri | sys
    const info = SI[key]; if (!info) return '#888';
    if (mode === 'lobes') return INFO.lobes[info.lobe][1];
    if (mode === 'sys') return INFO.sys[info.sys][1];
    const i = INFO.order.indexOf(key); return hsl(((i * 0.381966) % 1), 0.55, 0.58);
  }
  INFO.order = ['bankssts', 'caudalanteriorcingulate', 'caudalmiddlefrontal', 'cuneus', 'entorhinal', 'fusiform', 'inferiorparietal', 'inferiortemporal', 'isthmuscingulate', 'lateraloccipital', 'lateralorbitofrontal', 'lingual',
    'medialorbitofrontal', 'middletemporal', 'parahippocampal', 'paracentral', 'parsopercularis', 'parsorbitalis', 'parstriangularis', 'pericalcarine', 'postcentral', 'posteriorcingulate', 'precentral', 'precuneus',
    'rostralanteriorcingulate', 'rostralmiddlefrontal', 'superiorfrontal', 'superiorparietal', 'superiortemporal', 'supramarginal', 'frontalpole', 'temporalpole', 'transversetemporal', 'insula'];

  /* Шейдер: подсветка областей коры и мелкий рельеф «влажной» ткани */
  const NOISE = `
    float h31(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
    float vn(vec3 x){ vec3 i = floor(x), f = fract(x); f = f*f*(3.0-2.0*f);
      return mix(mix(mix(h31(i), h31(i+vec3(1,0,0)), f.x), mix(h31(i+vec3(0,1,0)), h31(i+vec3(1,1,0)), f.x), f.y),
                 mix(mix(h31(i+vec3(0,0,1)), h31(i+vec3(1,0,1)), f.x), mix(h31(i+vec3(0,1,1)), h31(i+vec3(1,1,1)), f.x), f.y), f.z); }
    float fbm(vec3 p){ return 0.55*vn(p) + 0.3*vn(p*2.1+3.1) + 0.15*vn(p*4.3+7.7); }`;
  function patch(mat, o) {
    mat.userData.u = { uHover: { value: -1 }, uSelA: { value: -1 }, uSelB: { value: -1 }, uDim: { value: 1 }, uVein: { value: o.vein ? 1 : 0 } };
    mat.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, mat.userData.u);
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nattribute float aRegion;\nvarying float vRegion;\nvarying vec3 vObj;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvRegion = aRegion; vObj = position;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform float uHover, uSelA, uSelB, uDim, uVein;\nvarying float vRegion;\nvarying vec3 vObj;\n' + NOISE)
        .replace('#include <color_fragment>', `#include <color_fragment>
          if (uVein > 0.01) { float a1 = fbm(vObj * 0.05 + 1.7), a2 = fbm(vObj * 0.12 + 9.1);
            float vein = (1.0 - smoothstep(0.0, 0.03, abs(a1 - 0.5))) + 0.7 * (1.0 - smoothstep(0.0, 0.025, abs(a2 - 0.5)));
            diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.40, 0.09, 0.13), clamp(vein, 0.0, 1.0) * 0.4 * uVein); }`)
        .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
          { float hgt = ${o.folia ? 'sin(vObj.y * 2.6 + 3.0 * fbm(vObj * 0.07)) * 0.5 + fbm(vObj * 1.1) * 0.5' : 'fbm(vObj * ' + (o.freq || 2.2).toFixed(1) + ')'};
            vec3 sx = dFdx(-vViewPosition), sy = dFdy(-vViewPosition); vec3 r1 = cross(sy, normal), r2 = cross(normal, sx);
            float det = dot(sx, r1); vec3 gr = sign(det) * (dFdx(hgt) * r1 + dFdy(hgt) * r2);
            normal = normalize(abs(det) * normal - ${(o.bump || 0.06).toFixed(3)} * gr); }`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          { bool hov = uHover > 0.5 && abs(vRegion - uHover) < 0.5;
            bool sel = (uSelA > 0.5 && abs(vRegion - uSelA) < 0.5) || (uSelB > 0.5 && abs(vRegion - uSelB) < 0.5);
            if (uSelA > 0.5 || uSelB > 0.5) { if (sel) { totalEmissiveRadiance += vec3(0.55, 0.42, 0.12); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0, 0.85, 0.35), 0.28); } else { diffuseColor.rgb *= uDim; } }
            if (hov) { totalEmissiveRadiance += vec3(0.22, 0.2, 0.12); } }`);
    };
    mat.customProgramCacheKey = () => 'b3d' + (o.folia ? 'f' : '') + (o.freq || 0) + (o.bump || 0);
    return mat;
  }

  /* ═════════════ 3D-атлас ═════════════ */
  async function atlas3d(el, K, opt) {
    opt = opt || {};
    el.classList.add('b3d-root');
    el.innerHTML = `<div class="b3d-load"><div class="b3d-spin"></div><p>Загружаем модель мозга (данные МРТ)…</p></div>`;
    let D;
    try { D = await loadMesh(); } catch (e) { el.innerHTML = `<p class="b3d-err">⚠ ${K.esc(e.message)}</p>`; return; }
    if (!el.isConnected) return;
    const tryGL = () => { try { return new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { return null; } };
    const renderer = tryGL();
    if (!renderer) { el.innerHTML = '<p class="b3d-err">⚠ Для 3D нужен WebGL. Включите аппаратное ускорение в браузере или откройте <a href="#/lab/mri">МРТ-атлас</a> — он работает без WebGL.</p>'; return; }

    el.innerHTML = `<div class="b3d">
      <div class="b3d-stage"><div class="b3d-hud b3d-views"></div><div class="b3d-hud b3d-tools"></div><div class="b3d-tip" hidden></div><div class="b3d-tag" hidden></div><div class="b3d-msg" hidden></div></div>
      <div class="b3d-side">
        <div class="b3d-tabs" role="tablist"></div>
        <div class="b3d-pane" data-p="info"></div><div class="b3d-pane" data-p="list" hidden></div><div class="b3d-pane" data-p="layers" hidden></div><div class="b3d-pane" data-p="slice" hidden></div><div class="b3d-pane" data-p="quiz" hidden></div>
      </div></div>`;
    const stage = el.querySelector('.b3d-stage'), tip = el.querySelector('.b3d-tip'), tag = el.querySelector('.b3d-tag'), msg = el.querySelector('.b3d-msg');
    stage.insertBefore(renderer.domElement, stage.firstChild);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.92; renderer.setClearColor(0x000000, 0);
    renderer.localClippingEnabled = true;
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(30, 1, 5, 2000);
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(new THREE.RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.55;
    const key = new THREE.DirectionalLight(0xfff1e2, 1.75); key.position.set(-160, 260, -120); scene.add(key);
    const rim = new THREE.DirectionalLight(0x8fb4ff, 1.1); rim.position.set(200, 80, 220); scene.add(rim);
    const fill = new THREE.HemisphereLight(0xffe9dd, 0x2a2430, 0.5); scene.add(fill);
    const ctl = new THREE.OrbitControls(cam, renderer.domElement);
    ctl.enableDamping = true; ctl.dampingFactor = 0.09; ctl.minDistance = 60; ctl.maxDistance = 700; ctl.rotateSpeed = 0.8; ctl.zoomSpeed = 0.8;
    const CENTER = new THREE.Vector3(0, 14, 16);
    ctl.target.copy(CENTER);

    /* — Объекты сцены — */
    const root = new THREE.Group(); scene.add(root);
    const objs = [];   // {mesh, m (мета), key, hemi, base:Color, group, home:Vector3}
    const cortexMats = [];
    let colorMode = 'natural';
    const lerp3 = (a, b, t) => a + (b - a) * t;
    const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const hash = (x, y, z) => { const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453; return s - Math.floor(s); };
    const vnoise = (x, y, z) => { const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), fx = x - xi, fy = y - yi, fz = z - zi;
      const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz); let r = 0;
      for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) for (let c = 0; c < 2; c++) r += hash(xi + a, yi + b, zi + c) * (a ? u : 1 - u) * (b ? v : 1 - v) * (c ? w : 1 - w); return r; };

    for (const m of D.meshes) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(m.pos, 3));
      g.setIndex(new THREE.BufferAttribute(m.idx, 1));
      g.computeVertexNormals();
      let mat, o = { m, key: m.key, hemi: m.hemi, kind: m.kind };
      if (m.kind === 'cortex') {
        const n = m.nv, col = new Float32Array(n * 3), reg = new Float32Array(n), dep = new Float32Array(n), nat = new Float32Array(n * 3);
        let lo = 255, hi = 0; for (let i = 0; i < n; i++) { const s = m.attr.sulc[i]; if (s < lo) lo = s; if (s > hi) hi = s; }
        const cg = new THREE.Color('#cfa597'), cs = new THREE.Color('#6f3f3a'), tmp = new THREE.Color();
        for (let i = 0; i < n; i++) {
          reg[i] = m.attr.region[i]; const d = sstep(0.38, 0.62, (m.attr.sulc[i] - lo) / (hi - lo)); dep[i] = d;
          const px = m.pos[3 * i], py = m.pos[3 * i + 1], pz = m.pos[3 * i + 2];
          const nz = vnoise(px * 0.11, py * 0.11, pz * 0.11) * 0.7 + vnoise(px * 0.42, py * 0.42, pz * 0.42) * 0.3;
          tmp.copy(cg).lerp(cs, d * 0.82); const jitter = 0.9 + 0.2 * nz;
          nat[3 * i] = tmp.r * jitter; nat[3 * i + 1] = tmp.g * (0.94 + 0.12 * nz) * (1 - 0.05 * Math.max(0, nz - 0.55)); nat[3 * i + 2] = tmp.b * (0.96 + 0.1 * nz);
        }
        g.setAttribute('color', new THREE.BufferAttribute(col, 3));
        g.setAttribute('aRegion', new THREE.BufferAttribute(reg, 1));
        o.nat = nat; o.dep = dep;
        mat = patch(new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.6, metalness: 0, clearcoat: 0.32, clearcoatRoughness: 0.42, sheen: 0.35, sheenColor: new THREE.Color('#ff9f8a'), sheenRoughness: 0.6, side: THREE.FrontSide }), { freq: 2.4, bump: 0.07, vein: true });
        cortexMats.push(mat); o.group = 'cortex' + m.hemi;
      } else {
        const cl = DEEP[m.key] || '#ccc';
        const isCer = m.key === 'cerebellum', isStem = m.key === 'brainstem', thin = /^cc-|optic|choroid/.test(m.key);
        mat = new THREE.MeshPhysicalMaterial({ color: cl, roughness: isCer ? 0.55 : 0.4, clearcoat: isCer ? 0.25 : 0.5, clearcoatRoughness: 0.35, side: thin ? THREE.DoubleSide : THREE.FrontSide, sheen: isCer ? 0.5 : 0, sheenColor: new THREE.Color('#ffd1b8') });
        if (isCer) patch(mat, { folia: true, bump: 0.16 }); else if (isStem) patch(mat, { freq: 0.9, bump: 0.09 });
        if (!mat.userData.u) mat.userData.u = {};
        const gm = { thalamus: 'deep', caudate: 'deep', putamen: 'deep', pallidum: 'deep', accumbens: 'deep', ventraldc: 'deep', hippocampus: 'limbic', amygdala: 'limbic', cerebellum: 'cerebellum', brainstem: 'stem', 'optic-chiasm': 'deep' };
        o.group = gm[m.key] || (/^cc-/.test(m.key) ? 'cc' : /vent|choroid/.test(m.key) ? 'vent' : 'deep');
        o.base = new THREE.Color(cl);
      }
      const mesh = new THREE.Mesh(g, mat); mesh.userData.o = o; o.mesh = mesh; root.add(mesh);
      g.computeBoundingBox(); const bb = g.boundingBox; o.center = bb.getCenter(new THREE.Vector3()); o.size = bb.getSize(new THREE.Vector3());
      objs.push(o);
    }
    const cortexObjs = objs.filter(o => o.kind === 'cortex');
    const hemiOf = h => cortexObjs.find(o => o.hemi === h);
    /* центры областей коры (для камеры и подписей) */
    const regCenter = {};
    for (const o of cortexObjs) { const acc = {}; const p = o.m.pos, r = o.m.attr.region;
      for (let i = 0; i < o.m.nv; i++) { const k = r[i]; const a = acc[k] || (acc[k] = [0, 0, 0, 0]); a[0] += p[3 * i]; a[1] += p[3 * i + 1]; a[2] += p[3 * i + 2]; a[3]++; }
      for (const k in acc) { const a = acc[k]; regCenter[k] = new THREE.Vector3(a[0] / a[3], a[1] / a[3], a[2] / a[3]); } }

    /* — Состояние — */
    const st = { sel: [], hover: 0, explode: 0, cortexOp: 1, autoGhost: false, autorot: false, clip: null, quiz: null, tab: 'info' };
    const labelOf = id => D.lab[id];
    function paintCortex() {
      const cache = {};
      for (const o of cortexObjs) {
        const n = o.m.nv, col = o.mesh.geometry.attributes.color.array, reg = o.m.attr.region, tmp = new THREE.Color();
        o.mesh.material.userData.u.uVein.value = colorMode === 'natural' ? 1 : 0;
        for (let i = 0; i < n; i++) {
          if (colorMode === 'natural') { col[3 * i] = o.nat[3 * i]; col[3 * i + 1] = o.nat[3 * i + 1]; col[3 * i + 2] = o.nat[3 * i + 2]; continue; }
          const l = labelOf(reg[i]); const k = l ? l.key : 'medialwall';
          const hex = cache[k + colorMode] || (cache[k + colorMode] = k === 'medialwall' ? '#6d6670' : regionColor(k, colorMode));
          tmp.set(hex); const s = 0.62 + 0.38 * (1 - o.dep[i] * 0.85);
          col[3 * i] = tmp.r * s; col[3 * i + 1] = tmp.g * s; col[3 * i + 2] = tmp.b * s;
        }
        o.mesh.geometry.attributes.color.needsUpdate = true;
      }
    }
    paintCortex();

    function applyVis() {
      const op = st.cortexOp;
      for (const o of objs) {
        const mt = o.mesh.material, tr = o.kind === 'cortex' && op < 0.99, cl = !!st.clip;
        if (o.kind === 'cortex') { mt.opacity = op; mt.depthWrite = op > 0.6; }
        mt.clippingPlanes = cl ? [st.clip.plane] : [];
        if (mt.transparent !== tr || mt.userData.cl !== cl) { mt.transparent = tr; mt.userData.cl = cl; mt.needsUpdate = true; }
      }
    }
    function layout() {   // положение с учётом «разведения»
      const e = st.explode;
      for (const o of objs) {
        const dir = new THREE.Vector3();
        if (o.kind === 'cortex') dir.set(o.hemi === 'L' ? -1 : 1, 0.12, 0);
        else if (o.key === 'cerebellum') dir.set(o.hemi === 'L' ? -0.35 : 0.35, -0.8, 0.9);
        else if (o.key === 'brainstem') dir.set(0, -1, 0.25);
        else { dir.copy(o.center).sub(CENTER); if (o.hemi === 'M') dir.x *= 0.2; dir.y += 0.4; }
        dir.normalize(); o.mesh.position.copy(dir.multiplyScalar(e * (o.kind === 'cortex' ? 55 : 70)));
      }
    }
    const visGroup = { cortexL: true, cortexR: true, cerebellum: true, stem: true, deep: true, limbic: true, vent: true, cc: true };
    function applyGroups() { for (const o of objs) o.mesh.visible = visGroup[o.group] !== false; }
    /* Подсветка */
    function setSel(ids) {
      st.sel = ids || [];
      // кора: идентификаторы регионов; прочие: меши
      const reg = st.sel.filter(i => { const l = labelOf(i); return l && SI[l.key] && SI[l.key].lobe !== 'sub' && ['frontal', 'parietal', 'temporal', 'occipital', 'limbic', 'insula'].includes(SI[l.key].lobe) || (l && l.key === 'medialwall'); });
      for (const mt of cortexMats) { mt.userData.u.uSelA.value = reg[0] || -1; mt.userData.u.uSelB.value = reg[1] || -1; mt.userData.u.uDim.value = 0.42; }
      for (const o of objs) {
        if (o.kind === 'cortex') continue;
        const on = st.sel.includes(o.m.id), mt = o.mesh.material;
        mt.color.copy(o.base).multiplyScalar(st.sel.length && !on ? 0.35 : 1);
        mt.emissive.copy(on ? o.base.clone().lerp(new THREE.Color('#ffffff'), 0.25) : new THREE.Color(0x000000)); mt.emissiveIntensity = on ? 0.42 : 0;
      }
      updateInfo();
    }
    function setHover(id) {
      if (id === st.hover) return; st.hover = id;
      for (const mt of cortexMats) mt.userData.u.uHover.value = id > 0 && cortexIds.has(id) ? id : -1;
    }
    const cortexIds = new Set(D.labels.filter(l => SI[l[1]] && ['frontal', 'parietal', 'temporal', 'occipital', 'limbic', 'insula'].includes(SI[l[1]].lobe)).map(l => l[0]));
    const mwIds = new Set([0]);

    /* — Камера — */
    let tw = null;
    function flyTo(pos, target, ms) { tw = { t0: performance.now(), ms: ms || 650, p0: cam.position.clone(), t0v: ctl.target.clone(), p1: pos.clone(), t1v: target.clone() }; }
    const VIEWS = { 'Слева': [-1, 0.12, 0], 'Справа': [1, 0.12, 0], 'Сверху': [0, 1, 0.001], 'Снизу': [0, -1, 0.001], 'Спереди': [0, 0.1, -1], 'Сзади': [0, 0.1, 1] };
    function view(name, dist) { const d = new THREE.Vector3(...VIEWS[name]).normalize(); flyTo(CENTER.clone().add(d.multiplyScalar(dist || 330)), CENTER.clone()); }
    function focusOn(c, size, deep) {
      const dir = c.clone().sub(CENTER);
      if (deep) { const sx = Math.abs(c.x) > 6 ? Math.sign(c.x) : -1; dir.set(sx, 0.3, -0.12); }
      else if (dir.length() < 8) dir.set(0, 0.2, -1);
      dir.normalize();
      flyTo(c.clone().add(dir.multiplyScalar(Math.max(95, size * 2.6))), c.clone());
    }
    cam.position.set(-260, 150, -190); ctl.update();
    view('Слева', 340);

    /* — Информация о выбранной структуре — */
    const info = el.querySelector('[data-p="info"]');
    const lessonOk = id => id && K.byId && K.byId[id];
    function describe(id) {
      const l = labelOf(id) || { key: 'medialwall', hemi: 'M', id: 0 }; const d = SI[l.key];
      return d ? { l, d } : null;
    }
    function updateInfo() {
      const q = st.quiz && st.quiz.hideName;
      if (!st.sel.length) { info.innerHTML = `<h3>Выберите структуру</h3><p class="muted">Нажмите на модель или выберите структуру в списке. Вращайте мозг одним пальцем, приближайте щипком или колесом мыши. Вкладка «Слои» разбирает мозг на части, а «Срез» показывает настоящую МРТ внутри.</p><p class="b3d-note">Геометрия получена из реальных МРТ (усреднённая кора fsaverage и атлас Desikan–Killiany). Это шаблон «среднего» мозга, а не снимок конкретного человека.</p>`; return; }
      if (q) { info.innerHTML = '<h3>Что это за структура?</h3><p class="muted">Выберите ответ ниже.</p>'; return; }
      const x = describe(st.sel[0]); if (!x) return;
      const both = st.sel.length > 1 && st.sel.map(i => labelOf(i)).every(l => l.key === x.l.key);
      const lobe = INFO.lobes[x.d.lobe], sys = x.d.sys !== 'none' ? INFO.sys[x.d.sys] : null;
      info.innerHTML = `<h3>${K.esc(x.d.ru)}</h3><p class="b3d-lat">${K.esc(x.d.lat)}</p>
        <p class="b3d-badges"><span style="--c:${lobe[1]}">${K.esc(lobe[0])}</span>${sys ? `<span style="--c:${sys[1]}">${K.esc(sys[0])}</span>` : ''}<span>${both ? 'оба полушария' : K.esc(HEMI[x.l.hemi])}</span></p>
        <dl><dt>Где находится</dt><dd>${K.esc(x.d.d)}</dd><dt>Что делает</dt><dd>${K.esc(x.d.f)}</dd>${x.d.c ? `<dt>Клиника</dt><dd>${K.esc(x.d.c)}</dd>` : ''}</dl>
        <div class="btn-row">${lessonOk(x.d.l) ? `<a class="btn primary" href="#/l/${x.d.l}">Урок: ${K.esc(K.byId[x.d.l].title)}</a>` : ''}<button class="btn ghost" data-act="clear">Сбросить</button></div>`;
      const c = info.querySelector('[data-act="clear"]'); if (c) c.onclick = () => { setSel([]); autoRestore(); };
    }
    updateInfo();

    /* выбор + камера */
    function idsOfKey(k, hemi) { return D.labels.filter(l => l[1] === k && (!hemi || l[2] === hemi)).map(l => l[0]); }
    function ensureVisible(k) {
      const d = SI[k]; const deep = d && !['frontal', 'parietal', 'temporal', 'occipital', 'insula'].includes(d.lobe) && !(d.lobe === 'limbic');
      if (deep && st.cortexOp > 0.4) { st.cortexOp = 0.12; st.autoGhost = true; syncLayerUI(); applyVis(); }
      else if (!deep && st.autoGhost) autoRestore();
      const grp = (objs.find(o => o.key === k) || {}).group; if (grp && visGroup[grp] === false) { visGroup[grp] = true; applyGroups(); syncLayerUI(); }
      if (!deep) { for (const h of ['L', 'R']) if (visGroup['cortex' + h] === false && idsOfKey(k, h).length) { /* оставляем скрытым */ } }
    }
    function autoRestore() { if (st.autoGhost) { st.cortexOp = 1; st.autoGhost = false; syncLayerUI(); applyVis(); } }
    function selectKey(k, hemi, fly = true) {
      ensureVisible(k);
      const ids = idsOfKey(k, hemi); setSel(ids);
      if (!fly) return;
      let c = null, sz = 40;
      const objk = objs.filter(o => o.key === k && (!hemi || o.hemi === hemi));
      let deepFocus = false;
      if (objk.length) {
        deepFocus = true; let use = objk;
        if (objk.length > 1) { const side = cam.position.x < 0 ? 'L' : 'R'; use = [objk.find(o => o.hemi === side) || objk[0]]; }   // билатеральную структуру показываем с ближней к камере стороны
        c = new THREE.Vector3(); use.forEach(o => c.add(o.center)); c.divideScalar(use.length); sz = Math.max(...use.map(o => Math.max(o.size.x, o.size.y, o.size.z)));
      }
      else { const cs = ids.map(i => regCenter[i]).filter(Boolean); if (cs.length) { c = new THREE.Vector3(); cs.forEach(v => c.add(v)); c.divideScalar(cs.length); sz = 55; } }
      if (c) focusOn(c, sz, deepFocus);
    }

    /* — Выбор мышью / касанием — */
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    function pick(ev) {
      const r = renderer.domElement.getBoundingClientRect();
      ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, cam);
      const list = objs.filter(o => o.mesh.visible && (o.kind !== 'cortex' || st.cortexOp > 0.45)).map(o => o.mesh);
      const hits = ray.intersectObjects(list, false);
      for (const h of hits) {
        if (st.clip && st.clip.plane.distanceToPoint(h.point) < 0) continue;
        const o = h.object.userData.o;
        if (o.kind === 'cortex') { const id = o.m.attr.region[o.m.idx[3 * h.faceIndex]]; return { id, o, point: h.point }; }
        return { id: o.m.id, o, point: h.point };
      }
      return null;
    }
    let down = null;
    renderer.domElement.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; st.autorotPause = true; });
    renderer.domElement.addEventListener('pointerup', e => {
      st.autorotPause = false;
      if (!down) return; const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), dt = performance.now() - down.t; down = null;
      if (moved > 6 || dt > 600) return;
      const h = pick(e);
      onClickHit(h);
    });
    let lastHover = 0;
    renderer.domElement.addEventListener('pointermove', e => {
      if (e.pointerType === 'touch' || e.buttons) { tip.hidden = true; return; }
      const now = performance.now(); if (now - lastHover < 45) return; lastHover = now;
      const h = pick(e);
      setHover(h ? h.id : 0);
      if (h && !(st.quiz && st.quiz.hideName) && !(st.quiz && st.quiz.mode === 'find')) {
        const x = describe(h.id); if (x) { const r = stage.getBoundingClientRect(); tip.hidden = false; tip.textContent = x.d.ru + (x.l.hemi !== 'M' ? ' · ' + (x.l.hemi === 'L' ? 'лев.' : 'прав.') : ''); tip.style.left = Math.min(r.width - 170, e.clientX - r.left + 14) + 'px'; tip.style.top = (e.clientY - r.top + 14) + 'px'; }
        else tip.hidden = true;
      } else tip.hidden = true;
      renderer.domElement.style.cursor = h ? 'pointer' : 'grab';
    });
    renderer.domElement.addEventListener('pointerleave', () => { setHover(0); tip.hidden = true; });
    function onClickHit(h) {
      if (st.quiz && st.quiz.active && st.quiz.mode === 'name') return;
      if (st.quiz && st.quiz.mode === 'find' && st.quiz.active) return quizFind(h);
      if (!h) { setSel([]); autoRestore(); return; }
      if (!describe(h.id)) { return; }
      setSel([h.id]); setTab('info'); showTag(h.point);
    }
    let tagPt = null;
    function showTag(p) { tagPt = p.clone(); tag.hidden = false; const x = describe(st.sel[0]); tag.textContent = x ? x.d.ru : ''; }

    /* ——— Вкладки ——— */
    const tabs = el.querySelector('.b3d-tabs');
    const TABS = [['info', 'Описание'], ['list', 'Структуры'], ['layers', 'Слои'], ['slice', 'Срез'], ['quiz', 'Тест']];
    TABS.forEach(([id, t]) => { const b = el_('button', '', t); b.dataset.t = id; b.setAttribute('role', 'tab'); b.onclick = () => setTab(id); tabs.appendChild(b); });
    function setTab(id) {
      st.tab = id;
      tabs.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', b.dataset.t === id));
      el.querySelectorAll('.b3d-pane').forEach(p => { p.hidden = p.dataset.p !== id; });
      if (id === 'slice') ensureSliceUI();
    }

    /* — Список структур — */
    const list = el.querySelector('[data-p="list"]');
    list.innerHTML = `<input type="search" class="b3d-search" placeholder="Найти структуру…" aria-label="Поиск структуры"><div class="b3d-list"></div>`;
    const groups = {};
    const keysAvail = new Set(D.labels.map(l => l[1]));
    Object.keys(SI).forEach(k => { if (!keysAvail.has(k) && k !== 'medialwall') return; if (k === 'medialwall' || k === 'cerebral-wm' || k === 'cerebellum-wm' || k === 'inf-lat-vent') return; (groups[SI[k].lobe] = groups[SI[k].lobe] || []).push(k); });
    function renderList(q) {
      q = (q || '').trim().toLowerCase(); const box = list.querySelector('.b3d-list'); box.innerHTML = '';
      Object.keys(INFO.lobes).forEach(lo => {
        const ks = (groups[lo] || []).filter(k => !q || (SI[k].ru + ' ' + SI[k].lat).toLowerCase().includes(q)); if (!ks.length) return;
        const h = el_('h4', '', K.esc(INFO.lobes[lo][0])); h.style.setProperty('--c', INFO.lobes[lo][1]); box.appendChild(h);
        ks.forEach(k => { const b = el_('button', 'b3d-item', K.esc(SI[k].ru)); b.onclick = () => { selectKey(k); setTab('info'); }; box.appendChild(b); });
      });
      if (!box.children.length) box.innerHTML = '<p class="muted">Ничего не найдено.</p>';
    }
    renderList(''); list.querySelector('input').oninput = e => renderList(e.target.value);

    /* — Слои — */
    const layers = el.querySelector('[data-p="layers"]');
    const GR = [['cortexL', 'Левое полушарие'], ['cortexR', 'Правое полушарие'], ['cerebellum', 'Мозжечок'], ['stem', 'Ствол мозга'], ['deep', 'Таламус и базальные ганглии'], ['limbic', 'Гиппокамп и миндалина'], ['cc', 'Мозолистое тело'], ['vent', 'Желудочки']];
    layers.innerHTML = `<h4>Что показывать</h4><div class="b3d-checks">${GR.map(([k, t]) => `<label><input type="checkbox" data-g="${k}" checked> ${t}</label>`).join('')}</div>
      <h4>Окраска коры</h4><div class="b3d-seg" data-seg="color">${[['natural', 'Натуральная'], ['lobes', 'Доли'], ['gyri', 'Извилины'], ['sys', 'Функции']].map(([k, t]) => `<button data-m="${k}" aria-pressed="${k === 'natural'}">${t}</button>`).join('')}</div><div class="b3d-legend"></div>
      <label class="b3d-range">Прозрачность коры <input type="range" min="0.05" max="1" step="0.01" value="1" data-r="op"></label>
      <label class="b3d-range">Разобрать на части <input type="range" min="0" max="1" step="0.01" value="0" data-r="ex"></label>
      <div class="btn-row"><button class="btn ghost" data-act="deep">Только глубокие структуры</button><button class="btn ghost" data-act="reset">Сбросить слои</button></div>`;
    function syncLayerUI() {
      layers.querySelector('[data-r="op"]').value = st.cortexOp;
      layers.querySelectorAll('[data-g]').forEach(c => { c.checked = visGroup[c.dataset.g] !== false; });
    }
    layers.querySelectorAll('[data-g]').forEach(c => { c.onchange = () => { visGroup[c.dataset.g] = c.checked; applyGroups(); }; });
    layers.querySelector('[data-r="op"]').oninput = e => { st.cortexOp = +e.target.value; st.autoGhost = false; applyVis(); };
    layers.querySelector('[data-r="ex"]').oninput = e => { st.explode = +e.target.value; layout(); };
    const legend = layers.querySelector('.b3d-legend');
    function renderLegend() {
      if (colorMode === 'lobes') legend.innerHTML = ['frontal', 'parietal', 'temporal', 'occipital', 'limbic', 'insula'].map(k => `<span><i style="background:${INFO.lobes[k][1]}"></i>${INFO.lobes[k][0]}</span>`).join('');
      else if (colorMode === 'sys') legend.innerHTML = Object.keys(INFO.sys).filter(k => k !== 'none').map(k => `<span><i style="background:${INFO.sys[k][1]}"></i>${INFO.sys[k][0]}</span>`).join('');
      else legend.innerHTML = colorMode === 'gyri' ? '<span class="muted">Каждая из 34 областей атласа Desikan–Killiany — своим цветом.</span>' : '';
    }
    layers.querySelectorAll('[data-seg="color"] button').forEach(b => b.onclick = () => {
      colorMode = b.dataset.m; layers.querySelectorAll('[data-seg="color"] button').forEach(x => x.setAttribute('aria-pressed', x === b)); paintCortex(); renderLegend();
    });
    layers.querySelector('[data-act="deep"]').onclick = () => { st.cortexOp = 0.1; st.autoGhost = false; syncLayerUI(); applyVis(); };
    layers.querySelector('[data-act="reset"]').onclick = () => { Object.keys(visGroup).forEach(k => { visGroup[k] = true; }); st.cortexOp = 1; st.explode = 0; st.autoGhost = false; layers.querySelector('[data-r="ex"]').value = 0; layout(); applyGroups(); applyVis(); syncLayerUI(); };

    /* — Срез МРТ внутри 3D — */
    const slice = el.querySelector('[data-p="slice"]');
    slice.innerHTML = `<p class="muted">Настоящий МРТ-срез и «срезанная» кора. Перемещайте ползунок — модель разрежется по плоскости, а на разрезе появится снимок.</p>
      <div class="b3d-seg" data-seg="axis">${[['', 'Нет'], ['x', 'Сагиттальный'], ['y', 'Фронтальный'], ['z', 'Горизонтальный']].map(([k, t]) => `<button data-a="${k}" aria-pressed="${k === ''}">${t}</button>`).join('')}</div>
      <label class="b3d-range">Положение <input type="range" min="-60" max="60" step="1" value="0" data-r="pos" disabled></label>
      <div class="b3d-checks"><label><input type="checkbox" data-o="flip" disabled> Показать другую сторону</label><label><input type="checkbox" data-o="lab" disabled> Цветные метки структур</label></div>
      <p class="b3d-slice-status muted"></p><div class="btn-row"><a class="btn ghost" href="#/lab/mri">Открыть МРТ-атлас ›</a></div>`;
    const sl = { mesh: null, mat: null, axis: '', loaded: false };
    function ensureSliceUI() { /* ленивая загрузка тома при первом выборе оси */ }
    let volData = null;
    const AX = { x: { n: new THREE.Vector3(1, 0, 0), lo: -66, hi: 66 }, y: { n: new THREE.Vector3(0, 0, -1), lo: -102, hi: 70 }, z: { n: new THREE.Vector3(0, 1, 0), lo: -50, hi: 78 } };
    function labPalette() {
      const data = new Uint8Array(256 * 4);
      D.labels.forEach(([id, k, h]) => { const d = SI[k]; let hex = DEEP[k]; if (!hex && d && d.lobe !== 'wm') hex = regionColor(k, 'gyri'); if (!hex) hex = '#999'; const c = new THREE.Color(hex).convertLinearToSRGB(); data.set([c.r * 255, c.g * 255, c.b * 255, 255], id * 4); });
      const t = new THREE.DataTexture(data, 256, 1, THREE.RGBAFormat); t.needsUpdate = true; return t;
    }
    async function setAxis(a) {
      const status = slice.querySelector('.b3d-slice-status');
      slice.querySelectorAll('[data-seg="axis"] button').forEach(x => x.setAttribute('aria-pressed', x.dataset.a === a));
      sl.axis = a;
      const pos = slice.querySelector('[data-r="pos"]'), flip = slice.querySelector('[data-o="flip"]'), lab = slice.querySelector('[data-o="lab"]');
      [pos, flip, lab].forEach(x => { x.disabled = !a; });
      if (!a) { st.clip = null; if (sl.mesh) sl.mesh.visible = false; applyVis(); status.textContent = ''; return; }
      if (!volData) { status.textContent = 'Загружаем МРТ-том (≈1,4 МБ)…'; try { volData = await loadVol(); } catch (e) { status.textContent = '⚠ ' + e.message; return; } status.textContent = ''; buildSlice(); }
      const ax = AX[a]; pos.min = ax.lo; pos.max = ax.hi; if (+pos.value < ax.lo || +pos.value > ax.hi) pos.value = 0;
      updSlice();
    }
    function buildSlice() {
      const V = volData, n = V.nx * V.ny * V.nz;
      const t1 = new THREE.Data3DTexture(V.t1, V.nx, V.ny, V.nz); t1.format = THREE.RedFormat; t1.type = THREE.UnsignedByteType; t1.minFilter = t1.magFilter = THREE.LinearFilter; t1.unpackAlignment = 1; t1.needsUpdate = true;
      const lb = new THREE.Data3DTexture(V.lab, V.nx, V.ny, V.nz); lb.format = THREE.RedFormat; lb.type = THREE.UnsignedByteType; lb.minFilter = lb.magFilter = THREE.NearestFilter; lb.unpackAlignment = 1; lb.needsUpdate = true;
      sl.mat = new THREE.ShaderMaterial({
        side: THREE.DoubleSide, uniforms: { uT1: { value: t1 }, uLab: { value: lb }, uPal: { value: labPalette() }, uOrg: { value: new THREE.Vector3(V.o[0], V.o[1], V.o[2]) }, uDim: { value: new THREE.Vector3(V.nx, V.ny, V.nz) }, uOv: { value: 0 } },
        vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
        fragmentShader: `precision highp float; precision highp sampler3D; varying vec3 vW; uniform sampler3D uT1, uLab; uniform sampler2D uPal; uniform vec3 uOrg, uDim; uniform float uOv;
          void main(){ vec3 m = vec3(vW.x, -vW.z, vW.y); vec3 uvw = (m - uOrg + 0.5) / uDim;
            if (any(lessThan(uvw, vec3(0.0))) || any(greaterThan(uvw, vec3(1.0)))) discard;
            float t = texture(uT1, uvw).r; float lb = floor(texture(uLab, uvw).r * 255.0 + 0.5);
            if (lb < 0.5 && t < 0.02) discard;
            vec3 c = vec3(t); c = pow(c, vec3(0.9));
            if (uOv > 0.5 && lb > 0.5) { vec3 pc = texture2D(uPal, vec2((lb + 0.5) / 256.0, 0.5)).rgb; c = mix(c, pc, 0.55); }
            gl_FragColor = vec4(c, 1.0); }`
      });
      sl.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), sl.mat); sl.mesh.renderOrder = 5; sl.mesh.frustumCulled = false; scene.add(sl.mesh);
    }
    function updSlice() {
      const a = sl.axis, pos = +slice.querySelector('[data-r="pos"]').value, flip = slice.querySelector('[data-o="flip"]').checked;
      const V = volData; sl.mat.uniforms.uOv.value = slice.querySelector('[data-o="lab"]').checked ? 1 : 0;
      const m = sl.mesh; m.visible = true; m.rotation.set(0, 0, 0); m.position.set(0, 0, 0);
      const sx = V.nx, sy = V.ny, sz = V.nz;
      if (a === 'x') { m.rotation.y = Math.PI / 2; m.scale.set(sy, sz, 1); m.position.set(pos, V.o[2] + sz / 2, -(V.o[1] + sy / 2)); }
      if (a === 'y') { m.scale.set(sx, sz, 1); m.position.set(V.o[0] + sx / 2, V.o[2] + sz / 2, -pos); }
      if (a === 'z') { m.rotation.x = -Math.PI / 2; m.scale.set(sx, sy, 1); m.position.set(V.o[0] + sx / 2, pos, -(V.o[1] + sy / 2)); }
      const n = AX[a].n.clone().multiplyScalar(flip ? -1 : 1);
      const d = a === 'x' ? pos : a === 'y' ? -pos : pos;
      const plane = new THREE.Plane(n, -n.dot(a === 'x' ? new THREE.Vector3(pos, 0, 0) : a === 'y' ? new THREE.Vector3(0, 0, -pos) : new THREE.Vector3(0, pos, 0)));
      st.clip = { plane }; applyVis();
      const nm = { x: 'лево (−) — право (+)', y: 'назад (−) — вперёд (+)', z: 'вниз (−) — вверх (+)' }[a];
      slice.querySelector('.b3d-slice-status').textContent = `Плоскость ${a} = ${pos} мм в системе MNI: ${nm}. Подсказка: поворачивайте модель, чтобы увидеть срез с обеих сторон.`;
    }
    slice.querySelectorAll('[data-seg="axis"] button').forEach(b => b.onclick = () => setAxis(b.dataset.a));
    slice.querySelector('[data-r="pos"]').oninput = () => updSlice();
    slice.querySelector('[data-o="flip"]').onchange = () => updSlice();
    slice.querySelector('[data-o="lab"]').onchange = () => updSlice();

    /* — Тест — */
    const quiz = el.querySelector('[data-p="quiz"]');
    const POOLS = {
      cortex: ['Кора (34 области)', () => INFO.order.slice()],
      deep: ['Глубокие структуры', () => ['thalamus', 'caudate', 'putamen', 'pallidum', 'hippocampus', 'amygdala', 'accumbens', 'cerebellum', 'brainstem', 'lateral-ventricle', 'ventricle3', 'ventricle4']],
      all: ['Всё вместе', () => POOLS.cortex[1]().concat(POOLS.deep[1](), ['cc-posterior', 'cc-anterior'])]
    };
    quiz.innerHTML = `<h4>Проверьте себя на модели</h4><p class="muted">10 вопросов. «Найди» — нажмите нужную структуру на модели. «Назови» — структура подсвечена, выберите её название.</p>
      <div class="b3d-seg" data-seg="qpool">${Object.keys(POOLS).map((k, i) => `<button data-k="${k}" aria-pressed="${i === 0}">${POOLS[k][0]}</button>`).join('')}</div>
      <div class="btn-row"><button class="btn primary" data-q="find">Найди на модели</button><button class="btn" data-q="name">Назови подсвеченное</button></div><div class="b3d-qbox"></div>`;
    let qpool = 'cortex';
    quiz.querySelectorAll('[data-seg="qpool"] button').forEach(b => b.onclick = () => { qpool = b.dataset.k; quiz.querySelectorAll('[data-seg="qpool"] button').forEach(x => x.setAttribute('aria-pressed', x === b)); });
    quiz.querySelectorAll('[data-q]').forEach(b => b.onclick = () => startQuiz(b.dataset.q));
    const qbox = quiz.querySelector('.b3d-qbox');
    const keyOk = k => keysAvail.has(k);
    function startQuiz(mode) {
      const keys = K.shuffle(POOLS[qpool][1]().filter(keyOk)).slice(0, 10);
      st.quiz = { mode, keys, i: 0, score: 0, tries: 0, active: true, hideName: mode === 'name', pool: qpool };
      setSel([]); tag.hidden = true;
      if (qpool === 'deep') { st.cortexOp = 0.1; st.autoGhost = false; } else { st.cortexOp = 1; st.autoGhost = false; }
      if (qpool !== 'cortex') { Object.keys(visGroup).forEach(k => { visGroup[k] = true; }); } else { Object.keys(visGroup).forEach(k => { visGroup[k] = k.startsWith('cortex'); }); }
      syncLayerUI(); applyGroups(); applyVis(); setTab('quiz'); nextQ();
    }
    function nextQ() {
      const q = st.quiz; if (q.i >= q.keys.length) return endQuiz();
      q.cur = q.keys[q.i]; q.tries = 0; q.answered = false; const d = SI[q.cur];
      if (q.mode === 'find') {
        setSel([]); qbox.innerHTML = `<div class="b3d-q"><b>${q.i + 1}/${q.keys.length}</b> Найдите на модели: <span class="b3d-target">${K.esc(d.ru)}</span></div><p class="muted">Нажмите на нужное место. Поворачивайте модель, если структуры не видно. <button class="b3d-link" data-act="skip">Пропустить</button></p>`;
      } else {
        const side = D.labels.find(l => l[1] === q.cur && l[2] !== 'R');
        selectKey(q.cur, side ? side[2] : undefined, true);
        const pool = POOLS[qpool][1]().filter(k => k !== q.cur && keyOk(k)); const opts = K.shuffle([q.cur, ...K.pick(pool, 3)]);
        qbox.innerHTML = `<div class="b3d-q"><b>${q.i + 1}/${q.keys.length}</b> Как называется подсвеченная структура?</div><div class="b3d-opts">${opts.map(k => `<button class="btn" data-k="${k}">${K.esc(SI[k].ru)}</button>`).join('')}</div><div class="b3d-fb"></div>`;
        qbox.querySelectorAll('[data-k]').forEach(b => b.onclick = () => quizName(b));
      }
      const sk = qbox.querySelector('[data-act="skip"]'); if (sk) sk.onclick = () => { q.i++; nextQ(); };
    }
    function feedback(ok, text) { const fb = qbox.querySelector('.b3d-fb') || msg; msg.hidden = false; msg.className = 'b3d-msg ' + (ok ? 'ok' : 'bad'); msg.textContent = text; clearTimeout(feedback.t); feedback.t = setTimeout(() => { msg.hidden = true; }, 1600); }
    function quizFind(h) {
      const q = st.quiz; if (!q || q.answered || !h) return;
      const l = labelOf(h.id); const k = l ? l.key : null;
      if (k === q.cur) { q.score += q.tries === 0 ? 1 : 0.5; q.answered = true; feedback(true, '✓ Верно: ' + SI[k].ru); selectKey(k, undefined, false); setTimeout(() => { setSel([]); q.i++; nextQ(); }, 900); }
      else { q.tries++; const nm = k && SI[k] ? SI[k].ru : 'пустое место'; if (q.tries >= 2) { q.answered = true; feedback(false, '✗ Это ' + nm + '. Правильно — подсвечено'); selectKey(q.cur, undefined, true); setTimeout(() => { setSel([]); q.i++; nextQ(); }, 1800); } else feedback(false, '✗ Это ' + nm + '. Попробуйте ещё раз'); }
    }
    function quizName(b) {
      const q = st.quiz; if (q.answered) return; q.answered = true; const ok = b.dataset.k === q.cur;
      if (ok) q.score++;
      qbox.querySelectorAll('[data-k]').forEach(x => { x.disabled = true; if (x.dataset.k === q.cur) x.classList.add('ok'); else if (x === b) x.classList.add('bad'); });
      const d = SI[q.cur]; qbox.querySelector('.b3d-fb').innerHTML = `<p><b>${ok ? '✓ Верно.' : '✗ Нет.'}</b> ${K.esc(d.f)}</p><button class="btn primary" data-act="next">Дальше</button>`;
      qbox.querySelector('[data-act="next"]').onclick = () => { q.i++; nextQ(); };
    }
    function endQuiz() {
      const q = st.quiz; q.active = false; q.hideName = false; setSel([]); autoRestore();
      Object.keys(visGroup).forEach(k => { visGroup[k] = true; }); st.cortexOp = 1; applyGroups(); applyVis(); syncLayerUI();
      const sc = Math.round(q.score * 10) / 10, xp = Math.round(sc * 2);
      K.addXP(xp); const best = K.S.best['b3d_' + q.pool] || 0; if (sc > best) { K.S.best['b3d_' + q.pool] = sc; K.save(); }
      qbox.innerHTML = `<div class="b3d-q"><b>Результат: ${sc} из ${q.keys.length}</b> (+${xp} опыта)</div><p class="muted">Лучший результат в этом наборе: ${Math.max(best, sc)}.</p><div class="btn-row"><button class="btn primary" data-act="again">Ещё раз</button></div>`;
      qbox.querySelector('[data-act="again"]').onclick = () => startQuiz(q.mode); updateInfo();
    }

    /* — HUD: виды и инструменты — */
    const vh = el.querySelector('.b3d-views'), th = el.querySelector('.b3d-tools');
    Object.keys(VIEWS).forEach(n => { const b = el_('button', '', n); b.onclick = () => view(n); vh.appendChild(b); });
    const bRot = el_('button', '', '⟳ Авто'); bRot.title = 'Автовращение'; bRot.setAttribute('aria-pressed', 'false'); bRot.onclick = () => { st.autorot = !st.autorot; bRot.setAttribute('aria-pressed', st.autorot); };
    const bFull = el_('button', '', '⛶'); bFull.title = 'На весь экран'; bFull.onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); else if (stage.requestFullscreen) stage.requestFullscreen(); };
    th.append(bRot, bFull);

    /* — Цикл — */
    function resize() { const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
    const ro = new ResizeObserver(resize); ro.observe(stage); resize();
    const proj = new THREE.Vector3();
    let raf = 0, alive = true;
    function frame(t) {
      if (!el.isConnected) { alive = false; ro.disconnect(); renderer.dispose(); renderer.forceContextLoss(); objs.forEach(o => { o.mesh.geometry.dispose(); o.mesh.material.dispose(); }); return; }
      raf = requestAnimationFrame(frame);
      if (tw) { const k = Math.min(1, (t - tw.t0) / tw.ms), e = k * k * (3 - 2 * k); cam.position.lerpVectors(tw.p0, tw.p1, e); ctl.target.lerpVectors(tw.t0v, tw.t1v, e); if (k >= 1) tw = null; }
      if (st.autorot && !st.autorotPause && !tw) { const a = 0.004, p = cam.position.clone().sub(ctl.target), c = Math.cos(a), s = Math.sin(a); cam.position.set(ctl.target.x + p.x * c - p.z * s, cam.position.y, ctl.target.z + p.x * s + p.z * c); }
      ctl.update();
      key.position.copy(cam.position).add(new THREE.Vector3(-90, 160, 0));
      if (tagPt && !tag.hidden) { proj.copy(tagPt).project(cam); const x = (proj.x * 0.5 + 0.5) * stage.clientWidth, y = (-proj.y * 0.5 + 0.5) * stage.clientHeight; tag.style.transform = `translate(${x + 10}px, ${y - 28}px)`; if (!st.sel.length) tag.hidden = true; }
      renderer.render(scene, cam); st.frames = (st.frames || 0) + 1;
    }
    raf = requestAnimationFrame(frame);
    document.addEventListener('fullscreenchange', () => setTimeout(resize, 60));

    setTab('info'); syncLayerUI(); renderLegend(); layout(); applyGroups(); applyVis();
    if (opt.mode) { colorMode = opt.mode; paintCortex(); renderLegend(); layers.querySelectorAll('[data-seg="color"] button').forEach(x => x.setAttribute('aria-pressed', x.dataset.m === colorMode)); }
    if (opt.ghost) { st.cortexOp = 0.1; applyVis(); syncLayerUI(); }
    if (opt.hide) opt.hide.forEach(g => { visGroup[g] = false; }); applyGroups(); syncLayerUI();
    if (opt.focus) setTimeout(() => { selectKey(opt.focus); setTab('info'); }, 200);
    if (opt.tab) setTab(opt.tab);
    el.__b3d = { selectKey, setSel, st, view };   // для тестов
  }

  /* ═════════════ МРТ-атлас (2D-срезы) ═════════════ */
  async function mri(el, K) {
    el.classList.add('b3d-root');
    el.innerHTML = '<div class="b3d-load"><div class="b3d-spin"></div><p>Загружаем МРТ-том (≈1,4 МБ)…</p></div>';
    let V, M;
    try { V = await loadVol(); M = { labels: V.labels, lab: V.labt }; } catch (e) { el.innerHTML = `<p class="b3d-err">⚠ ${K.esc(e.message)}</p>`; return; }
    if (!el.isConnected) return;
    const { nx, ny, nz, o } = V, SIr = SI;
    const pal = new Uint8ClampedArray(256 * 3);
    M.labels.forEach(([id, k]) => { const d = SIr[k]; let hex = DEEP[k]; if (!hex && d && d.lobe !== 'wm') hex = regionColor(k, 'gyri'); const c = new THREE.Color(hex || '#999').convertLinearToSRGB(); pal.set([c.r * 255, c.g * 255, c.b * 255], id * 3); });
    const st = { x: 0, y: -18, z: 10, ov: true, op: 0.5, gain: 1 };
    el.innerHTML = `<div class="mri"><div class="mri-grid">
        <figure><canvas data-v="ax"></canvas><figcaption>Горизонтальный срез <span class="muted">(вид снизу, как на МРТ)</span></figcaption></figure>
        <figure><canvas data-v="co"></canvas><figcaption>Фронтальный срез <span class="muted">(вид спереди: правая сторона слева)</span></figcaption></figure>
        <figure><canvas data-v="sa"></canvas><figcaption>Сагиттальный срез <span class="muted">(лицо слева)</span></figcaption></figure>
        <div class="mri-info"></div></div>
      <div class="mri-ctl"><label class="b3d-range">Лево–право (x) <input type="range" data-a="x" min="${o[0]}" max="${o[0] + nx - 1}" value="0"></label>
        <label class="b3d-range">Назад–вперёд (y) <input type="range" data-a="y" min="${o[1]}" max="${o[1] + ny - 1}" value="-18"></label>
        <label class="b3d-range">Вниз–вверх (z) <input type="range" data-a="z" min="${o[2]}" max="${o[2] + nz - 1}" value="10"></label>
        <div class="b3d-checks"><label><input type="checkbox" data-o="ov" checked> Цветные метки структур</label></div>
        <label class="b3d-range">Яркость <input type="range" data-o="gain" min="0.6" max="1.8" step="0.05" value="1"></label></div></div>`;
    const cv = { ax: el.querySelector('[data-v="ax"]'), co: el.querySelector('[data-v="co"]'), sa: el.querySelector('[data-v="sa"]') };
    const dims = { ax: [nx, ny], co: [nx, nz], sa: [ny, nz] };
    Object.keys(cv).forEach(k => { cv[k].width = dims[k][0]; cv[k].height = dims[k][1]; });
    const idx = (x, y, z) => (z - o[2]) * nx * ny + (y - o[1]) * nx + (x - o[0]);
    const inb = (x, y, z) => x >= o[0] && x < o[0] + nx && y >= o[1] && y < o[1] + ny && z >= o[2] && z < o[2] + nz;
    /* соответствие: пиксель ↔ воксель. ax: столбец c = nx-1-i (радиологически, право пациента слева), строка r = ny-1-j (вперёд — вверх) */
    const map = {
      ax: (c, r) => [o[0] + (nx - 1 - c), o[1] + (ny - 1 - r), st.z], co: (c, r) => [o[0] + (nx - 1 - c), st.y, o[2] + (nz - 1 - r)], sa: (c, r) => [st.x, o[1] + (ny - 1 - c), o[2] + (nz - 1 - r)]
    };
    // в сагиттальном виде лицо слева: столбец 0 — самый передний y
    map.sa = (c, r) => [st.x, o[1] + (ny - 1 - c), o[2] + (nz - 1 - r)];
    const inv = {   // воксель → пиксель (для перекрестия)
      ax: () => [nx - 1 - (st.x - o[0]), ny - 1 - (st.y - o[1])], co: () => [nx - 1 - (st.x - o[0]), nz - 1 - (st.z - o[2])], sa: () => [ny - 1 - (st.y - o[1]), nz - 1 - (st.z - o[2])]
    };
    const info = el.querySelector('.mri-info');
    function draw() {
      for (const k of ['ax', 'co', 'sa']) {
        const [w, h] = dims[k], ctx = cv[k].getContext('2d'), img = ctx.createImageData(w, h), d = img.data;
        for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
          const [x, y, z] = map[k](c, r), p = 4 * (r * w + c); if (!inb(x, y, z)) { d[p + 3] = 255; continue; }
          const ii = idx(x, y, z), t = Math.min(255, V.t1[ii] * st.gain), l = V.lab[ii];
          let R = t, G = t, B = t;
          if (st.ov && l) { R = t * (1 - st.op) + pal[l * 3] * st.op; G = t * (1 - st.op) + pal[l * 3 + 1] * st.op; B = t * (1 - st.op) + pal[l * 3 + 2] * st.op; }
          d[p] = R; d[p + 1] = G; d[p + 2] = B; d[p + 3] = 255;
        }
        ctx.putImageData(img, 0, 0);
        const [cx, cy] = inv[k](); ctx.strokeStyle = 'rgba(255,214,90,.9)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx + .5, 0); ctx.lineTo(cx + .5, h); ctx.moveTo(0, cy + .5); ctx.lineTo(w, cy + .5); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.font = 'bold 11px system-ui'; ctx.shadowColor = '#000'; ctx.shadowBlur = 3;
        const lab = { ax: ['Прав.', 'Лев.', 'перед', 'зад'], co: ['Прав.', 'Лев.', 'верх', 'низ'], sa: ['перед', 'зад', 'верх', 'низ'] }[k];
        ctx.textAlign = 'left'; ctx.fillText(lab[0], 4, h / 2 - 4); ctx.textAlign = 'right'; ctx.fillText(lab[1], w - 4, h / 2 - 4);
        ctx.textAlign = 'center'; ctx.fillText(lab[2], w / 2, 12); ctx.fillText(lab[3], w / 2, h - 5); ctx.shadowBlur = 0; ctx.textAlign = 'left';
      }
      describe(st.x, st.y, st.z);
      ['x', 'y', 'z'].forEach(a => { el.querySelector(`[data-a="${a}"]`).value = st[a]; });
    }
    function describe(x, y, z) {
      if (!inb(x, y, z)) { info.innerHTML = ''; return; }
      const id = V.lab[idx(x, y, z)], l = M.lab[id], d = l && SIr[l.key];
      let html = `<p class="muted">MNI: x ${x}, y ${y}, z ${z} мм</p>`;
      if (!id) html += '<h3>Вне мозга / ликвор</h3><p class="muted">Щёлкните по снимку или перетащите перекрестие.</p>';
      else if (d) {
        const lobe = INFO.lobes[d.lobe];
        html += `<h3>${K.esc(d.ru)}</h3><p class="b3d-lat">${K.esc(d.lat)}</p><p class="b3d-badges"><span style="--c:${lobe[1]}">${K.esc(lobe[0])}</span><span>${K.esc(HEMI[l.hemi])}</span></p><p>${K.esc(d.f)}</p>`;
        if (d.l && K.byId && K.byId[d.l]) html += `<a class="btn primary" href="#/l/${d.l}">Урок: ${K.esc(K.byId[d.l].title)}</a>`;
      }
      info.innerHTML = html;
    }
    function posAt(k, e) { const r = cv[k].getBoundingClientRect(); const c = Math.floor((e.clientX - r.left) / r.width * dims[k][0]), rr = Math.floor((e.clientY - r.top) / r.height * dims[k][1]); return map[k](Math.max(0, Math.min(dims[k][0] - 1, c)), Math.max(0, Math.min(dims[k][1] - 1, rr))); }
    for (const k of Object.keys(cv)) {
      let drag = false;
      const set = e => { const p = posAt(k, e); if (k !== 'sa') st.x = p[0]; if (k !== 'co') st.y = p[1]; if (k !== 'ax') st.z = p[2]; draw(); };
      cv[k].addEventListener('pointerdown', e => { drag = true; cv[k].setPointerCapture(e.pointerId); set(e); });
      cv[k].addEventListener('pointermove', e => { if (drag) set(e); else { const p = posAt(k, e); if (inb(...p)) { const id = V.lab[idx(...p)], l = M.lab[id], d = l && SIr[l.key]; cv[k].title = d ? d.ru + ' · ' + HEMI[l.hemi] : ''; } } });
      cv[k].addEventListener('pointerup', () => { drag = false; });
      cv[k].addEventListener('wheel', e => { e.preventDefault(); const dlt = e.deltaY > 0 ? 1 : -1; if (k === 'ax') st.z += dlt; if (k === 'co') st.y += dlt; if (k === 'sa') st.x += dlt; draw(); }, { passive: false });
    }
    el.querySelectorAll('[data-a]').forEach(i => { i.oninput = () => { st[i.dataset.a] = +i.value; draw(); }; });
    el.querySelector('[data-o="ov"]').onchange = e => { st.ov = e.target.checked; draw(); };
    el.querySelector('[data-o="gain"]').oninput = e => { st.gain = +e.target.value; draw(); };
    draw();
  }

  /* ——— Регистрация ——— */
  const add = (o) => P.labs.push(o);
  add({ id: 'brain3d', course: 1, ico: '🧠', title: '3D-атлас мозга', desc: 'Настоящая кора человека в 3D: вращайте, разбирайте на части, окрашивайте по долям и функциям, режьте плоскостью и проверяйте себя.', tags: 'мозг 3d модель кора доли извилины гиппокамп таламус мозжечок атлас', lesson: 'overview', render: (el, K) => { atlas3d(el, K, {}); } });
  add({ id: 'mri', course: 1, ico: '🩻', title: 'МРТ-атлас', desc: 'Три плоскости настоящего МРТ-снимка с подписанными структурами: щёлкните точку, и атлас назовёт её.', tags: 'мрт томография срез снимок плоскости', lesson: 'planes', render: (el, K) => { mri(el, K); } });
  add({ id: 'b3d-lobes', course: 2, embed: true, ico: '🧠', title: 'Доли мозга в 3D', desc: '', lesson: 'lobes', render: (el, K) => { atlas3d(el, K, { mode: 'lobes', tab: 'layers' }); } });
  add({ id: 'b3d-func', course: 2, embed: true, ico: '🧠', title: 'Функциональные области коры', desc: '', lesson: 'lobes', render: (el, K) => { atlas3d(el, K, { mode: 'sys', tab: 'layers' }); } });
  add({ id: 'b3d-deep', course: 3, embed: true, ico: '🧠', title: 'Глубокие структуры', desc: '', lesson: 'thalamus', render: (el, K) => { atlas3d(el, K, { ghost: true, tab: 'list' }); } });
  add({ id: 'b3d-limbic', course: 3, embed: true, ico: '🧠', title: 'Лимбическая система', desc: '', lesson: 'limbic', render: (el, K) => { atlas3d(el, K, { ghost: true, focus: 'hippocampus', hide: ['cerebellum', 'stem'] }); } });
  add({ id: 'b3d-stem', course: 4, embed: true, ico: '🧠', title: 'Ствол и мозжечок', desc: '', lesson: 'brainstem', render: (el, K) => { atlas3d(el, K, { ghost: true, focus: 'brainstem' }); } });
  add({ id: 'b3d-vent', course: 1, embed: true, ico: '🧠', title: 'Желудочки мозга', desc: '', lesson: 'meninges-csf', render: (el, K) => { atlas3d(el, K, { ghost: true, focus: 'lateral-ventricle' }); } });
})();
