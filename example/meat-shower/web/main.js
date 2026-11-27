// Engine: toon world + canvas character cards + ink/grade + DOF. window.renderFrame(f) draws frame f.
import * as THREE from "./three.module.js";
import { Pen, fxBlob } from "./toon.js";
import * as T from "./toon.js";
import * as P from "./paint.js";
import { buildWorld, applyWorld } from "./world.js";
import * as S from "./story.js";
import { protectRectsFn } from "./protect.js";

const W = 1080, H = 1920;
const canvas = document.getElementById("c");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 2200);
const topScene = new THREE.Scene();

// ---------- toon materials ----------
const grad = new THREE.DataTexture(new Uint8Array([150, 150, 150, 255, 255, 255, 255, 255]), 2, 1, THREE.RGBAFormat);
grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
const texCache = new Map();
const tex = (name, fn, rep = 1) => {
  const k = name;
  if (!texCache.has(k)) { const t = new THREE.CanvasTexture(fn()); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; texCache.set(k, t); }
  return texCache.get(k);
};
const toon = (color = 0xffffff, map = null, extra = {}) => new THREE.MeshToonMaterial({ color, map, gradientMap: grad, ...extra });

// ---------- ink contract: every mesh is "world" (inked), "card" or "noink" ----------
const worldList = [], cardList = [], noinkList = [];
const add = (mesh, kind = "world", parent = scene) => {
  mesh.userData.kind = kind;
  if (kind === "world") { mesh.castShadow = mesh.receiveShadow = true; worldList.push(mesh); }
  else if (kind === "card") cardList.push(mesh); else noinkList.push(mesh);
  parent.add(mesh); return mesh;
};
/** box with constant texel density: UVs scaled to face size / tile */
const tbox = (w, h, d, mat, tile = 2) => {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv;
  const sz = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) { const i = f * 4 + v; uv.setXY(i, uv.getX(i) * sz[f][0] / tile, uv.getY(i) * sz[f][1] / tile); }
  return new THREE.Mesh(g, mat);
};
const ctx = { THREE, scene, add, tbox, toon, tex, P, noinkList, cardList, cloudCanvas: (i) => T.cloudCanvasM(i) };

// ---------- sky ----------
const skyMat = new THREE.ShaderMaterial({
  uniforms: { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, bot: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() } },
  vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `uniform vec3 top, hor, bot, sunDir, sunCol; varying vec3 vD;
    void main(){ float y = vD.y; vec3 c = y > 0.0 ? mix(hor, top, pow(clamp(y*1.6,0.0,1.0), 0.75)) : mix(hor, bot, clamp(-y*6.0,0.0,1.0));
      float s = max(dot(normalize(vD), normalize(sunDir)), 0.0); c += sunCol * (pow(s, 12.0) * 0.35 + pow(s, 400.0) * 1.5);
      gl_FragColor = vec4(c, 1.0); }`,
  side: THREE.BackSide, depthWrite: false, fog: false,
});
const sky = add(new THREE.Mesh(new THREE.SphereGeometry(1800, 32, 16), skyMat), "noink");
sky.renderOrder = -10; sky.frustumCulled = false;

// ---------- lights ----------
const hemi = new THREE.HemisphereLight(0xffffff, 0x888866, 1.2); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 2.6); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
const sc = sun.shadow.camera; sc.left = -34; sc.right = 34; sc.top = 34; sc.bottom = -34; sc.near = 1; sc.far = 400;
scene.add(sun, sun.target);
scene.fog = new THREE.Fog(0xffffff, 60, 500);

const lampLights = [];
for (let i = 0; i < 3; i++) { const l = new THREE.PointLight(0xffb060, 0, 22, 2); scene.add(l); lampLights.push(l); }
ctx.lampLights = lampLights;

let curLight = null, cardTint = new THREE.Color(1, 1, 1);
const applyLight = (name, f) => {
  const L = typeof name === "string" ? S.LIGHTS[name] : name;
  skyMat.uniforms.top.value.set(L.top); skyMat.uniforms.hor.value.set(L.hor); skyMat.uniforms.bot.value.set(L.bot ?? L.hor);
  const el = THREE.MathUtils.degToRad(L.el), az = THREE.MathUtils.degToRad(L.az);
  const dir = new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
  skyMat.uniforms.sunDir.value.copy(dir); skyMat.uniforms.sunCol.value.set(L.sunSky ?? L.sun);
  sun.color.set(L.sun); sun.intensity = L.sunI; hemi.color.set(L.hemiSky); hemi.groundColor.set(L.hemiGround); hemi.intensity = L.hemiI;
  scene.fog.color.set(L.fog ?? L.hor); scene.fog.near = L.fogNear ?? 60; scene.fog.far = L.fogFar ?? 520;
  cardTint.set(L.card ?? 0xffffff);
  for (const l of lampLights) l.intensity = L.lamps ?? 0;
  curLight = { ...L, dir };
};

// ---------- cards ----------
const cardGeoSole = new THREE.PlaneGeometry(1, 1).translate(0, 0.475, 0);
const cardGeoCenter = new THREE.PlaneGeometry(1, 1);
const blobTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 128; fxBlob(new Pen(c.getContext("2d")), "#77695e"); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
const blobGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
const cardTexCache = new Map();
const CARD_CAP = 140;
const getCardTex = (spec) => {
  const k = spec.key;
  if (cardTexCache.has(k)) { const t = cardTexCache.get(k); cardTexCache.delete(k); cardTexCache.set(k, t); return t; }
  const d = spec.design ?? [600, 1000], r = spec.res ?? 1;
  const c = document.createElement("canvas"); c.width = Math.round(d[0] * r); c.height = Math.round(d[1] * r);
  const g = c.getContext("2d"); g.scale(r, r); g.lineJoin = "round"; g.lineCap = "round";
  spec.draw(new Pen(g));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  cardTexCache.set(k, t);
  if (cardTexCache.size > CARD_CAP) { const [ok, ot] = cardTexCache.entries().next().value; if (!inUse.has(ok)) { ot.dispose(); cardTexCache.delete(ok); } }
  return t;
};
const inUse = new Set();
const pool = new Map();
const maskVS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const maskFS = `uniform sampler2D map; varying vec2 vUv; void main(){ if (texture2D(map, vUv).a < 0.5) discard; gl_FragColor = vec4(0.0, 0.0, 0.0, 0.5); }`;
const getCard = (spec) => {
  let m = pool.get(spec.id);
  if (!m) {
    const fx = spec.blend === "add" || spec.blend === "alpha";
    const mat = new THREE.MeshBasicMaterial({ transparent: fx, alphaTest: fx ? 0 : 0.5, side: THREE.DoubleSide, depthWrite: !fx, fog: spec.fog ?? true,
      blending: spec.blend === "add" ? THREE.AdditiveBlending : THREE.NormalBlending });
    m = new THREE.Mesh(spec.anchor === "center" ? cardGeoCenter : cardGeoSole, mat);
    m.frustumCulled = false;
    add(m, fx ? "noink" : "card");
    if (!fx) {
      m.userData.mask = new THREE.ShaderMaterial({ uniforms: { map: { value: null } }, vertexShader: maskVS, fragmentShader: maskFS, side: THREE.DoubleSide });
      m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, alphaTest: 0.5 });
    }
    if (spec.blob) { const b = new THREE.Mesh(blobGeo, new THREE.MeshBasicMaterial({ map: blobTex, blending: THREE.MultiplyBlending, transparent: true, depthWrite: false, premultipliedAlpha: true })); add(b, "noink"); b.renderOrder = 1; m.userData.blob = b; }
    pool.set(spec.id, m);
  }
  return m;
};
const camPos = new THREE.Vector3();
const updateCards = (list) => {
  inUse.clear(); for (const s of list) inUse.add(s.key);
  const seen = new Set();
  for (const s of list) {
    const m = getCard(s); seen.add(s.id);
    const t = getCardTex(s);
    if (m.material.map !== t) { m.material.map = t; m.material.needsUpdate = true; if (m.userData.mask) m.userData.mask.uniforms.map.value = t; if (m.customDepthMaterial) { m.customDepthMaterial.map = t; m.customDepthMaterial.needsUpdate = true; } }
    const d = s.design ?? [600, 1000], h = s.h, w = (h * d[0]) / d[1];
    m.scale.set(w * (s.flip ? -1 : 1), h, 1);
    m.position.set(s.pos[0], s.pos[1], s.pos[2]);
    m.rotation.set(0, 0, 0);
    if (s.bill === "screen") { m.quaternion.copy(camera.quaternion); if (s.rotZ) m.rotateZ(s.rotZ); }
    else if (s.bill === "flat") { m.rotation.set(-Math.PI / 2, 0, s.rotZ ?? 0); }
    else if (s.bill === "fixed") { m.rotation.set(0, s.rotY ?? 0, s.rotZ ?? 0); }
    else { m.rotation.y = Math.atan2(camPos.x - s.pos[0], camPos.z - s.pos[2]); if (s.rotZ) m.rotation.z = s.rotZ; }
    const tint = s.tint ? new THREE.Color(s.tint) : (s.noTint ? new THREE.Color(1, 1, 1) : cardTint);
    m.material.color.copy(tint);
    m.material.opacity = s.opacity ?? 1;
    m.castShadow = !!s.shadow;
    m.visible = true; m.renderOrder = s.order ?? 0; m.userData.top = !!s.top; m.userData.protect = !!s.protect;
    const b = m.userData.blob;
    if (b) { b.visible = s.blobR > 0; b.position.set(s.pos[0], (s.groundY ?? s.pos[1]) + 0.02, s.pos[2]); b.scale.set(s.blobR * 2, 1, s.blobR * 1.2); }
  }
  for (const [id, m] of pool) if (!seen.has(id)) { m.visible = false; if (m.userData.blob) m.userData.blob.visible = false; }
};

// ---------- render targets + passes ----------
const colorRT = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
const ndRT = new THREE.WebGLRenderTarget(W, H, { type: THREE.UnsignedByteType });
ndRT.depthTexture = new THREE.DepthTexture(W, H); ndRT.depthTexture.type = THREE.UnsignedIntType;
const aRT = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const normalMat = new THREE.ShaderMaterial({
  vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `varying vec3 vN; void main(){ vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n; gl_FragColor = vec4(n * 0.5 + 0.5, 1.0); }`,
  side: THREE.DoubleSide,
});
const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const quadVS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const inkMat = new THREE.ShaderMaterial({
  uniforms: { tColor: { value: colorRT.texture }, tND: { value: ndRT.texture }, tDepth: { value: ndRT.depthTexture }, near: { value: 0.1 }, far: { value: 2200 },
    px: { value: new THREE.Vector2(1 / W, 1 / H) }, inkCol: { value: new THREE.Color("#120c16") }, inkStr: { value: 0.92 },
    sat: { value: 1.12 }, gain: { value: 1.03 }, lift: { value: 0.0 }, vig: { value: 0.28 }, tintAmt: { value: new THREE.Vector3(0, 0, 0) } },
  vertexShader: quadVS,
  fragmentShader: `uniform sampler2D tColor, tND, tDepth; uniform float near, far, inkStr, sat, gain, lift, vig; uniform vec2 px; uniform vec3 inkCol, tintAmt; varying vec2 vUv;
    float lz(vec2 uv){ float d = texture2D(tDepth, uv).r; return near * far / (far - d * (far - near)); }
    vec3 enc(vec3 c){ return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0)), vec3(1.0/2.4)) - 0.055, step(vec3(0.0031308), c)); }
    vec3 dec(vec3 c){ return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), c)); }
    void main(){
      vec3 col = texture2D(tColor, vUv).rgb;
      vec4 nd = texture2D(tND, vUv);
      float ink = 0.0;
      if (nd.a > 0.75) {
        float z = lz(vUv), iz = 1.0 / z; vec3 n = nd.xyz * 2.0 - 1.0;
        vec2 dirs[4]; dirs[0] = vec2(1.0, 0.0); dirs[1] = vec2(0.0, 1.0); dirs[2] = vec2(0.7071, 0.7071); dirs[3] = vec2(0.7071, -0.7071);
        for (int d = 0; d < 4; d++) for (int k = 1; k <= 3; k++) {
          vec2 o = dirs[d] * float(k) * px * 0.95;
          float za = lz(vUv + o), zb = lz(vUv - o);
          float s = 1.0 / za + 1.0 / zb - 2.0 * iz;
          float wk = k == 3 ? 0.55 : 1.0;
          ink = max(ink, smoothstep(0.025, 0.07, -s * z) * wk);
          if (k <= 2) {
            vec4 na = texture2D(tND, vUv + o);
            if (na.a > 0.75) {
              float c = 1.0 - smoothstep(0.5, 0.72, dot(n, na.xyz * 2.0 - 1.0));
              float same = 1.0 - smoothstep(0.015, 0.05, abs(za - z) / z);
              ink = max(ink, c * same * 0.75 * (k == 2 ? 0.6 : 1.0));
            }
          }
        }
        ink *= 1.0 - smoothstep(140.0, 520.0, z);
      }
      vec3 c = enc(col);
      c = mix(c, inkCol, ink * inkStr);
      float y = dot(c, vec3(0.2126, 0.7152, 0.0722));
      c = vec3(y) + sat * (c - vec3(y));
      c = c * gain + lift + tintAmt;
      vec2 p = vUv * 2.0 - 1.0; float r = length(p * vec2(0.75, 1.0));
      c *= 1.0 - vig * smoothstep(0.55, 1.35, r);
      gl_FragColor = vec4(dec(clamp(c, 0.0, 1.0)), 1.0);
    }`,
  depthTest: false, depthWrite: false,
});
const dofMat = new THREE.ShaderMaterial({
  uniforms: { tA: { value: aRT.texture }, tDepth: { value: ndRT.depthTexture }, near: { value: 0.1 }, far: { value: 2200 }, px: { value: new THREE.Vector2(1 / W, 1 / H) },
    focus: { value: 5 }, cInf: { value: 0 }, maxCoc: { value: 16 }, flash: { value: 0 }, flashCol: { value: new THREE.Color(1, 1, 1) } },
  vertexShader: quadVS,
  fragmentShader: `uniform sampler2D tA, tDepth; uniform float near, far, focus, cInf, maxCoc, flash; uniform vec2 px; uniform vec3 flashCol; varying vec2 vUv;
    float lz(vec2 uv){ float d = texture2D(tDepth, uv).r; return near * far / (far - d * (far - near)); }
    float coc(float z){ return min(maxCoc, cInf * abs(1.0 - focus / z)); }
    void main(){
      vec3 c = texture2D(tA, vUv).rgb;
      if (cInf > 0.01) {
        float zc = lz(vUv), cc = coc(zc);
        if (cc > 0.6) {
          vec3 acc = c; float wsum = 1.0;
          for (int i = 1; i < 40; i++) {
            float fi = float(i), r = sqrt(fi / 40.0) * cc, a = fi * 2.39996;
            vec2 o = vec2(cos(a), sin(a)) * r * px;
            float zj = lz(vUv + o), cj = coc(zj);
            float w = zj < zc * 0.97 ? clamp(cj / (r + 0.5), 0.0, 1.0) : 1.0;
            acc += texture2D(tA, vUv + o).rgb * w; wsum += w;
          }
          c = acc / wsum;
        }
      }
      c = mix(c, flashCol, flash);
      gl_FragColor = linearToOutputTexel(vec4(c, 1.0));
    }`,
  depthTest: false, depthWrite: false,
});
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), inkMat);
const quadScene = new THREE.Scene(); quadScene.add(quad);

// ---------- world ----------
const world = buildWorld(ctx);

// ---------- frame ----------
const v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
window.renderFrame = (f) => {
  const cam = S.camAt(f);
  camera.position.copy(v3(cam.pos)); camera.fov = cam.fov; camera.up.set(0, 1, 0); camera.lookAt(v3(cam.look));
  if (cam.roll) camera.rotateZ(THREE.MathUtils.degToRad(cam.roll));
  camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  camPos.copy(camera.position);
  sky.position.copy(camera.position);
  applyLight(S.lightAt(f), f);
  const wst = S.worldAt(f);
  applyWorld(world, wst, f, ctx);
  const sc0 = S.shadowCenter(f);
  sun.target.position.set(sc0[0], sc0[1], sc0[2]);
  sun.position.copy(sun.target.position).addScaledVector(curLight.dir, 150);
  sun.target.updateMatrixWorld();
  updateCards(S.actorsAt(f, cam.pos));
  // top-layer cards (text, phone) are drawn after DOF, unblurred and never hidden by the scene
  const tops = []; for (const m of [...cardList, ...noinkList]) if (m.visible && m.userData.top) { tops.push(m); topScene.add(m); }
  // colour
  renderer.shadowMap.needsUpdate = true; renderer.shadowMap.autoUpdate = true;
  renderer.setRenderTarget(colorRT); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
  // normal + depth (world inked, cards masked, the rest hidden)
  renderer.shadowMap.autoUpdate = false;
  const fog = scene.fog; scene.fog = null;
  const saved = [];
  for (const m of worldList) { saved.push([m, m.material]); m.material = normalMat; }
  for (const m of cardList) if (m.userData.mask) { saved.push([m, m.material]); m.material = m.userData.mask; }
  const hid = []; for (const m of noinkList) if (m.visible) { m.visible = false; hid.push(m); }
  renderer.setRenderTarget(ndRT); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera);
  for (const [m, mat] of saved) m.material = mat;
  for (const m of hid) m.visible = true;
  scene.fog = fog;
  // ink + grade
  const D = S.dofAt(f), G = curLight;
  inkMat.uniforms.near.value = dofMat.uniforms.near.value = camera.near; inkMat.uniforms.far.value = dofMat.uniforms.far.value = camera.far;
  inkMat.uniforms.sat.value = G.sat ?? 1.12; inkMat.uniforms.gain.value = G.gain ?? 1.03; inkMat.uniforms.lift.value = G.lift ?? 0; inkMat.uniforms.vig.value = G.vig ?? 0.28;
  quad.material = inkMat; renderer.setRenderTarget(aRT); renderer.render(quadScene, quadCam);
  // DOF + flash -> screen
  dofMat.uniforms.focus.value = D.focus; dofMat.uniforms.cInf.value = D.cInf;
  const fl = S.flashAt(f); dofMat.uniforms.flash.value = fl.k; dofMat.uniforms.flashCol.value.set(fl.col ?? "#ffffff");
  quad.material = dofMat; renderer.setRenderTarget(null); renderer.render(quadScene, quadCam);
  if (tops.length) { renderer.autoClear = false; renderer.clearDepth(); renderer.render(topScene, camera); renderer.autoClear = true; for (const m of tops) scene.add(m); }
  renderer.getContext().finish();
  return true;
};
window.protectRects = protectRectsFn(THREE, camera, cardList, W, H);
window.TOTAL = S.TOTAL;
window.ready = true;
