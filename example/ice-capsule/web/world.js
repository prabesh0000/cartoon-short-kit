// World for "आइस चुरोटको बल". M = macro set (giant plain cigarette along x, filter end at x -3), C = cut-away filter,
// S = tole street (along z) with a giant cigarette standing as a tower, R = room, B = classroom board wall.
// Everything is plain and unbranded: white filter, white paper.
import { AREA } from "./story.js";

const rnd = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const mkc = (w, h, fn) => { const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); return c; };
const paperTex = (base) => mkc(256, 256, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(${rnd(i) > 0.5 ? "255,255,255" : "120,110,90"},0.07)`; g.fillRect(rnd(i * 3) * w, rnd(i * 3 + 1) * h, 2, 2); }
  g.fillStyle = "rgba(120,110,90,0.12)"; g.fillRect(0, h * 0.5, w, 2); });
const fibreTex = () => mkc(512, 512, (g, w, h) => { g.fillStyle = "#f1ece0"; g.fillRect(0, 0, w, h);
  g.lineCap = "round"; for (let i = 0; i < 260; i++) { const y = rnd(i) * h, x = rnd(i + 7) * w; g.strokeStyle = `rgba(${rnd(i + 3) > 0.5 ? "200,190,170" : "255,255,255"},0.55)`; g.lineWidth = 2 + rnd(i + 2) * 3; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + 40, y - 10, x + 80, y + 12, x + 130, y + 2); g.stroke(); } });
const poresTex = () => mkc(256, 256, (g, w, h) => { g.fillStyle = "#efe9dc"; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(150,140,120,${0.15 + rnd(i) * 0.2})`; g.beginPath(); g.arc(rnd(i * 3) * w, rnd(i * 3 + 1) * h, 1.5 + rnd(i + 1) * 2.5, 0, 7); g.fill(); } });
const plasterTex = (base) => mkc(256, 256, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(${rnd(i) > 0.5 ? "255,255,255" : "0,0,0"},0.04)`; g.beginPath(); g.ellipse(rnd(i * 3) * w, rnd(i * 3 + 1) * h, 30 + rnd(i) * 50, 20 + rnd(i + 2) * 30, 0, 0, 7); g.fill(); } });
const winTex = () => mkc(256, 256, (g, w, h) => {
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, w, h);
  g.fillStyle = "rgba(0,0,0,0.12)"; g.fillRect(0, 120, w, 8); g.fillRect(0, 248, w, 8);
  for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) { const x = 34 + c * 128, y = 24 + r * 128; g.fillStyle = "#3a4a5e"; g.fillRect(x, y, 60, 74); g.fillStyle = "#8fb8d8"; g.fillRect(x + 6, y + 6, 22, 62); g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(x - 4, y + 74, 68, 8); }
});
const asphaltTex = () => mkc(256, 512, (g, w, h) => {
  g.fillStyle = "#5a5a60"; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(${rnd(i) > 0.5 ? "255,255,255" : "0,0,0"},0.06)`; g.fillRect(rnd(i * 3) * w, rnd(i * 3 + 1) * h, 4, 4); }
  g.fillStyle = "#e8e2c8"; g.fillRect(w / 2 - 5, 40, 10, 180);
});
const ct = (THREE, c, rx = 1, ry = 1) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 4; return t; };

export const buildWorld = (C) => {
  const { THREE, add, tbox, toon, tex, P } = C;
  const H = { clouds: [] };
  const mats = {
    dirt: toon(0xffffff, tex("dirt", () => P.dirt("#b89a6a"))), brick: toon(0xffffff, tex("brick", () => P.brick())), roof: toon(0xffffff, tex("roof", () => P.roof())),
    wood: toon(0xffffff, tex("wood", () => P.wood())), tank: toon(0x2a2a30), pole: toon(0x4a4a50), redwood: toon(0x7a2a22), gold: toon(0xe3b23c),
    sidewalk: toon(0xffffff, tex("blocks", () => P.blocks("#b8aa98"))),
  };
  const flat = (geo) => { const g = geo.toNonIndexed(); g.computeVertexNormals(); return g; };
  const cloud = (x, y, z, s, seed) => {
    const m = add(new THREE.Mesh(new THREE.PlaneGeometry(1, 0.5), new THREE.MeshBasicMaterial({ map: tex("cloud" + (seed % 4), () => P.cloudTex(seed % 4)), transparent: true, depthWrite: false, fog: true, color: 0xffffff })), "noink");
    m.position.set(x, y, z); m.scale.set(s, s, 1); H.clouds.push(m); return m;
  };
  const paperM = toon(0xffffff, ct(THREE, paperTex("#fbfbf8"), 4, 1)), filterM = toon(0xffffff, ct(THREE, paperTex("#f3efe4"), 3, 1)), poreM = toon(0xffffff, ct(THREE, poresTex(), 1, 1));
  const ashM = toon(0x6a6a70), emberM = new THREE.MeshBasicMaterial({ color: 0x8a3a2a, fog: true }), tobM = toon(0x8a5a32);

  // ================= M: macro cigarette (axis along x, filter x -3..0, rod 0..9, r 1) =================
  const M = AREA.M;
  H.mf = new THREE.Group(); H.mf.position.set(M[0] - 1.5, M[1], M[2]); C.scene.add(H.mf);
  { const g = new THREE.CylinderGeometry(1, 1, 3, 48, 1); g.rotateZ(Math.PI / 2); add(new THREE.Mesh(g, [filterM, poreM, poreM]), "world", H.mf); }
  { const g = new THREE.CylinderGeometry(0.995, 0.995, 9, 48, 1); g.rotateZ(Math.PI / 2); const m = add(new THREE.Mesh(g, [paperM, tobM, tobM])); m.position.set(M[0] + 4.5, M[1], M[2]); }
  // M backdrop: soft vignette plane far behind (the sky does the rest)

  // ================= C: the filter cut open (half pipe, opening toward +z), radius 3 =================
  const Cc = AREA.C;
  { const g = new THREE.CylinderGeometry(3, 3, 14, 48, 1, true, Math.PI / 2, Math.PI); g.rotateZ(Math.PI / 2);
    const m = add(new THREE.Mesh(g, toon(0xffffff, ct(THREE, fibreTex(), 3, 2), { side: THREE.DoubleSide }))); m.position.set(Cc[0], Cc[1], Cc[2]); }
  { const g = new THREE.CylinderGeometry(3.12, 3.12, 14, 48, 1, true, Math.PI / 2, Math.PI); g.rotateZ(Math.PI / 2);
    const m = add(new THREE.Mesh(g, toon(0xf6f3ea, null, { side: THREE.BackSide }))); m.position.set(Cc[0], Cc[1], Cc[2]); }
  { const g = new THREE.PlaneGeometry(14, 6); const m = add(new THREE.Mesh(g, toon(0xffffff, ct(THREE, fibreTex(), 3, 1)))); m.rotation.x = -Math.PI / 2; m.position.set(Cc[0], Cc[1] - 0.02, Cc[2]); m.visible = false; }
  H.cap = add(new THREE.Mesh(new THREE.SphereGeometry(0.9, 32, 16), toon(0x2fbf7f, null, { emissive: new THREE.Color(0x0f5a3a) }))); H.cap.position.set(Cc[0], Cc[1] - 0.4, Cc[2] - 0.6);

  // ================= S: tole street (from the Manjushri reel) =================
  const S = AREA.S;
  { const g = new THREE.PlaneGeometry(9, 260); g.rotateX(-Math.PI / 2); const m = add(new THREE.Mesh(g, toon(0xffffff, ct(THREE, asphaltTex(), 1, 26)))); m.position.set(S[0], 0, S[2] - 90); m.castShadow = false; }
  for (const s of [-1, 1]) { const sw = add(tbox(2.4, 0.18, 260, mats.sidewalk, 1.2)); sw.position.set(S[0] + s * 5.7, 0.09, S[2] - 90); }
  { const g = new THREE.PlaneGeometry(600, 600); g.rotateX(-Math.PI / 2); const t = mats.dirt.clone(); t.map = mats.dirt.map.clone(); t.map.needsUpdate = true; t.map.repeat.set(60, 60); const m = add(new THREE.Mesh(g, t)); m.position.set(S[0], -0.02, S[2]); m.castShadow = false; }
  const PAST = ["#f2d6b8", "#f0c8c8", "#f6e8b0", "#cfe0e8", "#e8e2d6", "#d8e8c8", "#f4b8a0", "#ffffff"].map((c) => toon(new THREE.Color(c), ct(THREE, winTex())));
  const block = (w, h, d, i) => add(tbox(w, h, d, PAST[i % PAST.length], 3));
  const SH = ["#2f7a5a", "#2f5f9e", "#b8323a", "#d9a23a", "#6a6a72", "#3a8a8a"].map((c) => toon(new THREE.Color(c)));
  for (const s of [-1, 1]) for (let i = 0, z = 30; z > -200; i++) {
    const wz = 7 + rnd(i * 5 + s) * 4, h = 9 + rnd(i * 5 + s + 1) * 9, dd = 10;
    const b = block(dd, h, wz, i * 3 + (s > 0 ? 1 : 0)); b.position.set(S[0] + s * (6.9 + dd / 2), h / 2, S[2] + z - wz / 2);
    const sh = add(tbox(0.2, 2.4, wz * 0.7, SH[(i + (s > 0 ? 2 : 0)) % SH.length], 1)); sh.position.set(S[0] + s * 6.85, 1.3, S[2] + z - wz / 2);
    const sg = add(tbox(0.25, 0.9, wz * 0.6, SH[(i + 3) % SH.length], 1)); sg.position.set(S[0] + s * 6.8, 3.2, S[2] + z - wz / 2);
    if (i % 2 === 0) { const t = add(new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.4, 10), mats.tank)); t.position.set(S[0] + s * (6.9 + dd * 0.6), h + 0.7, S[2] + z - wz / 2); }
    z -= wz + 0.2;
  }
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x1a1a20, fog: true }), poles = [];
  for (let i = 0; i < 14; i++) for (const s of [-1, 1]) { const z = S[2] + 20 - i * 14 + (s > 0 ? 5 : 0), x = S[0] + s * 4.8; if (!(s < 0 && z < S[2] - 10 && z > S[2] - 30)) { const p = add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 8, 6), mats.pole)); p.position.set(x, 4, z); } poles.push([x, 7.6, z, s]); }
  const wire = (a, b, sag, k) => { const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(new THREE.Vector3(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t) - k * 0.25, a[2] + (b[2] - a[2]) * t)); }
    add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.028, 4), wireMat), "noink"); };
  for (let i = 0; i < poles.length - 2; i++) { const a = poles[i], b = poles[i + 2]; for (let k = 0; k < 3; k++) wire(a, b, 0.6 + k * 0.35, k); }
  for (let i = 0; i < poles.length - 1; i += 2) for (let k = 0; k < 2; k++) wire(poles[i], poles[i + 1], 0.9 + k * 0.5, k);
  { const pz = S[2] - 175, px = S[0];
    for (let k = 0; k < 4; k++) { const st = add(tbox(14 - k * 2.2, 0.8, 14 - k * 2.2, mats.sidewalk, 1.4)); st.position.set(px, 0.4 + k * 0.8, pz); }
    const bd = add(tbox(6, 5, 6, mats.brick, 1.6)); bd.position.set(px, 5.7, pz);
    for (let k = 0; k < 3; k++) { const rf = add(new THREE.Mesh(flat(new THREE.ConeGeometry(7 - k * 1.6, 2.6, 4)), mats.redwood)); rf.rotation.y = Math.PI / 4; rf.position.set(px, 9.2 + k * 3.2, pz);
      if (k < 2) { const tier = add(tbox(4 - k * 1.2, 2, 4 - k * 1.2, mats.brick, 1.6)); tier.position.set(px, 10.9 + k * 3.2, pz); } }
    const pin = add(new THREE.Mesh(new THREE.ConeGeometry(0.5, 2.6, 8), mats.gold)); pin.position.set(px, 17.6, pz); }
  for (let i = 0; i < 5; i++) cloud(S[0] - 200 + i * 100, 70 + rnd(i + 3) * 30, S[2] - 380, 110, i + 1);
  // the giant cigarette tower (plain): filter 0..7, rod 7..30, ash 30..31.4, r 1.6
  const T = [S[0], 0, S[2] - 46]; H.tower = new THREE.Group(); H.tower.position.set(T[0], T[1], T[2]); C.scene.add(H.tower);
  { const f = add(new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 7, 40), [toon(0xffffff, ct(THREE, paperTex("#f3efe4"), 3, 2)), poreM, poreM]), "world", H.tower); f.position.y = 3.5;
    const r = add(new THREE.Mesh(new THREE.CylinderGeometry(1.59, 1.59, 23, 40), toon(0xffffff, ct(THREE, paperTex("#fbfbf8"), 3, 6))), "world", H.tower); r.position.y = 18.5;
    const a = add(new THREE.Mesh(flat(new THREE.CylinderGeometry(1.4, 1.58, 1.4, 12)), ashM), "world", H.tower); a.position.y = 30.7;
    const e = add(new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.09, 6, 40), emberM), "noink", H.tower); e.rotation.x = Math.PI / 2; e.position.y = 30.05;
    H.warn = add(new THREE.Mesh(new THREE.CylinderGeometry(1.75, 1.75, 31.8, 40), new THREE.MeshBasicMaterial({ color: 0xff3a2a, side: THREE.BackSide, transparent: true, opacity: 0, fog: false })), "noink", H.tower); H.warn.position.y = 15.8; }

  // ================= R: room (back wall at z -6, side wall at x -7) + B: board wall =================
  const R = AREA.R;
  const floorM = toon(0xffffff, (() => { const t = tex("woodF", () => P.wood("#8a5a3a")).clone(); t.needsUpdate = true; t.repeat.set(8, 4); return t; })());
  { const g = new THREE.PlaneGeometry(40, 30); g.rotateX(-Math.PI / 2); const m = add(new THREE.Mesh(g, floorM)); m.position.set(R[0], 0, R[2] + 5); m.castShadow = false; }
  H.wall = toon(0xffffff, ct(THREE, plasterTex("#e9d2b0"), 4, 2));
  { const m = add(tbox(40, 12, 0.4, H.wall, 4)); m.position.set(R[0], 6, R[2] - 6.2); }
  { const m = add(tbox(0.4, 12, 30, H.wall, 4)); m.position.set(R[0] - 9, 6, R[2] + 5); }
  { const fr = add(tbox(3.4, 2.6, 0.3, mats.wood, 1)); fr.position.set(R[0] + 4.6, 3.6, R[2] - 5.95);
    const gl = add(new THREE.Mesh(new THREE.PlaneGeometry(2.9, 2.1), new THREE.MeshBasicMaterial({ color: 0xcfe8ff, fog: false })), "noink"); gl.position.set(R[0] + 4.6, 3.6, R[2] - 5.78); }
  { const sk = add(tbox(40, 0.4, 0.5, mats.wood, 1)); sk.position.set(R[0], 0.2, R[2] - 5.9); }
  // a small side table + a plant (life in the room)
  { const top = add(tbox(1.6, 0.12, 0.9, mats.wood, 1)); top.position.set(R[0] - 3.4, 1.0, R[2] - 4.6);
    for (const [dx, dz] of [[-0.7, -0.35], [0.7, -0.35], [-0.7, 0.35], [0.7, 0.35]]) { const l = add(tbox(0.1, 1.0, 0.1, mats.wood, 1)); l.position.set(R[0] - 3.4 + dx, 0.5, R[2] - 4.6 + dz); }
    const pot = add(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.4, 12), toon(0xb8553a))); pot.position.set(R[0] - 3.8, 1.26, R[2] - 4.6);
    for (let i = 0; i < 3; i++) { const lf = add(new THREE.Mesh(flat(new THREE.IcosahedronGeometry(0.28 - i * 0.05, 0)), toon(0x3f8a4a))); lf.position.set(R[0] - 3.8 + (i - 1) * 0.12, 1.62 + i * 0.16, R[2] - 4.6); } }
  const B = AREA.B;
  { const g = new THREE.PlaneGeometry(40, 30); g.rotateX(-Math.PI / 2); const m = add(new THREE.Mesh(g, floorM)); m.position.set(B[0], 0, B[2] + 5); m.castShadow = false; }
  { const m = add(tbox(40, 14, 0.4, toon(0xffffff, ct(THREE, plasterTex("#cfe0d8"), 4, 2)), 4)); m.position.set(B[0], 7, B[2] - 0.6); }
  return H;
};

export const applyWorld = (H, w, f, C) => {
  if (w.camPos) for (const c of H.clouds) c.rotation.set(0, Math.atan2(w.camPos[0] - c.position.x, w.camPos[2] - c.position.z), 0);
  const sq = w.squeeze ?? 0; H.mf.scale.set(1, 1 - 0.2 * sq, 1 + 0.07 * sq);
  H.cap.visible = (w.capsule ?? 1) > 0.5; H.cap.scale.setScalar(1 + 0.05 * Math.sin(f * 0.2));
  H.warn.material.opacity = 0.75 * (w.warn ?? 0); H.warn.visible = (w.warn ?? 0) > 0.01;
};
