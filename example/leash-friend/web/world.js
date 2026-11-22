// World for "पट्टा लगाएको साथी". A = café (day / night), B = savanna at sunset, C = park, S = diagram studio,
// M = clothes shop with trial rooms, N = night street with a lamp post. No brands or logos anywhere.
import { AREA } from "./story.js";

const rnd = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const mkc = (w, h, fn) => { const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); return c; };
const DEVA = "'Kohinoor Devanagari', 'Devanagari Sangam MN', sans-serif";
const plasterTex = (base) => mkc(256, 256, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(${rnd(i) > 0.5 ? "255,255,255" : "0,0,0"},0.04)`; g.beginPath(); g.ellipse(rnd(i * 3) * w, rnd(i * 3 + 1) * h, 30 + rnd(i) * 50, 20 + rnd(i + 2) * 30, 0, 0, 7); g.fill(); } });
const tileTex = (a, b) => mkc(256, 256, (g, w, h) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * 64, j * 64, 64, 64); } g.strokeStyle = "rgba(0,0,0,0.12)"; g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); } });
const menuTex = () => mkc(512, 384, (g, w, h) => { g.fillStyle = "#24302a"; g.fillRect(0, 0, w, h); g.strokeStyle = "#8a5a34"; g.lineWidth = 22; g.strokeRect(0, 0, w, h);
  g.fillStyle = "#f4efe6"; g.font = `bold 64px ${DEVA}`; g.textAlign = "center"; g.fillText("मेनु", w / 2, 82);
  g.font = `bold 44px ${DEVA}`; g.textAlign = "left"; [["मःम", "१५०"], ["चिया", "३०"], ["चाउमिन", "१२०"]].forEach(([a, b], i) => { g.fillStyle = "#ffe9a8"; g.fillText(a, 60, 160 + i * 70); g.fillStyle = "#f4efe6"; g.textAlign = "right"; g.fillText(b, 452, 160 + i * 70); g.textAlign = "left"; }); });
const dayTex = () => mkc(512, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#8cc8f4"); gr.addColorStop(1, "#e4f2ff"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let b = 0; b < 7; b++) { const x = b * 80 - 10, bh = 150 + rnd(b + 4) * 180; g.fillStyle = ["#e0b890", "#c8d0d8", "#e8d0a8"][b % 3]; g.fillRect(x, h - bh, 74, bh); g.fillStyle = "rgba(80,110,150,0.5)"; for (let r = 0; r < bh / 40 - 1; r++) for (let c = 0; c < 2; c++) g.fillRect(x + 12 + c * 30, h - bh + 16 + r * 40, 18, 22); } });
const nightTex = () => mkc(512, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#0c1638"); gr.addColorStop(1, "#24305e"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(255,255,255,${0.3 + rnd(i) * 0.6})`; g.fillRect(rnd(i + 1) * w, rnd(i + 2) * h * 0.45, 2, 2); }
  for (let b = 0; b < 9; b++) { const x = b * 60 - 10 + rnd(b) * 20, bh = 140 + rnd(b + 4) * 200; g.fillStyle = "#141c3a"; g.fillRect(x, h - bh, 56, bh);
    for (let r = 0; r < bh / 26; r++) for (let c = 0; c < 3; c++) if (rnd(b * 50 + r * 3 + c) > 0.55) { g.fillStyle = "#ffd890"; g.fillRect(x + 8 + c * 16, h - bh + 12 + r * 26, 9, 12); } } });
const facadeTex = (base, seed) => mkc(256, 512, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) { const lit = rnd(seed * 31 + r * 3 + c) > 0.45; g.fillStyle = lit ? "#ffd27a" : "#1a2040"; g.fillRect(24 + c * 76, 30 + r * 80, 50, 54); g.strokeStyle = "#0c1020"; g.lineWidth = 4; g.strokeRect(24 + c * 76, 30 + r * 80, 50, 54); } });
const curtainTex = (a, b) => mkc(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect(i * 32, 0, 32, h); } const gr = g.createLinearGradient(0, 0, 32, 0); });
const ct = (THREE, c, rx = 1, ry = 1) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 4; return t; };

export const buildWorld = (C) => {
  const { THREE, add, tbox, toon, tex, P } = C;
  const H = { areas: {} };
  const mats = { wood: toon(0xffffff, tex("wood", () => P.wood())), woodL: toon(0xffffff, tex("woodL", () => P.wood("#9a6a3e"))), dark: toon(0x2a2024) };
  const glowT = (() => { const c = mkc(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(255,240,200,1)"); gr.addColorStop(0.25, "rgba(255,200,120,0.55)"); gr.addColorStop(1, "rgba(255,170,80,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const glow = (x, y, z, s, op = 0.9, col = 0xffffff) => { const sp = add(new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: col, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: op, fog: false })), "noink"); sp.position.set(x, y, z); sp.scale.set(s, s, 1); return sp; };
  const floor = (A, w, d, mat) => { const g = new THREE.PlaneGeometry(w, d); g.rotateX(-Math.PI / 2); const m = add(new THREE.Mesh(g, mat)); m.position.set(A[0], 0, A[2]); return m; };
  const cyl = (r0, r1, h, mat, seg = 16) => add(new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), mat));
  const table = (x, z) => { const t = cyl(0.55, 0.55, 0.05, mats.wood, 24); t.position.set(x, 0.6, z); const l = cyl(0.05, 0.05, 0.58, mats.dark, 8); l.position.set(x, 0.29, z); const b = cyl(0.3, 0.32, 0.04, mats.dark, 16); b.position.set(x, 0.02, z); };
  const chairBack = (x, z, col = 0x9a5a34) => { const m = toon(col); const s = add(tbox(0.46, 0.05, 0.44, m, 1)); s.position.set(x, 0.4, z); const b = add(tbox(0.46, 0.55, 0.05, m, 1)); b.position.set(x, 0.7, z - 0.22);
    for (const [dx, dz] of [[-0.2, -0.19], [0.2, -0.19], [-0.2, 0.19], [0.2, 0.19]]) { const l = add(tbox(0.04, 0.4, 0.04, m, 1)); l.position.set(x + dx, 0.2, z + dz); } return [s, b]; };

  // ================= A: café =================
  const A = AREA.A;
  { const t = ct(THREE, tileTex("#c8a27a", "#b08a62"), 6, 6); floor(A, 16, 16, toon(0xffffff, t)); }
  const wallM = toon(0xffffff, ct(THREE, plasterTex("#e8c89a"), 4, 1));
  { const w = add(tbox(12, 3.6, 0.2, wallM, 3)); w.position.set(A[0], 1.8, A[2] - 4.1); }
  { const w = add(tbox(12, 0.9, 0.22, toon(0x7a4a2e), 3)); w.position.set(A[0], 0.45, A[2] - 3.98); } // wainscot
  for (const s of [-1, 1]) { const w = add(tbox(0.2, 3.6, 10, wallM, 3)); w.position.set(A[0] + s * 5.5, 1.8, A[2]); }
  { const c = add(tbox(12, 0.2, 10, toon(0xd8c0a0), 3)); c.position.set(A[0], 3.6, A[2]); }
  // window (day / night swap), left of centre
  const winDay = new THREE.MeshBasicMaterial({ map: ct(THREE, dayTex()), fog: false }), winNight = new THREE.MeshBasicMaterial({ map: ct(THREE, nightTex()), fog: false });
  { const fr = add(tbox(1.9, 1.5, 0.12, mats.woodL, 1)); fr.position.set(A[0] - 2.7, 1.95, A[2] - 3.98);
    const gl = add(new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.3), winDay), "noink"); gl.position.set(A[0] - 2.7, 1.95, A[2] - 3.9); H.win = gl; H.winDay = winDay; H.winNight = winNight;
    const bar = add(tbox(0.06, 1.3, 0.06, mats.woodL, 1)); bar.position.set(A[0] - 2.7, 1.95, A[2] - 3.88); }
  // menu board right of centre
  { const fr = add(new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.98), toon(0xffffff, ct(THREE, menuTex())))); fr.position.set(A[0] + 1.25, 2.15, A[2] - 3.98); }
  // second menu over the corner table
  { const fr = add(new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.75), toon(0xffffff, ct(THREE, menuTex())))); fr.position.set(A[0] + 3.4, 2.05, A[2] - 3.98); }
  // shelf with jars + plants
  { const s = add(tbox(1.4, 0.05, 0.3, mats.woodL, 1)); s.position.set(A[0] - 4.4, 2.5, A[2] - 3.85);
    for (let i = 0; i < 4; i++) { const j = cyl(0.08, 0.08, 0.22, toon([0xd86a3a, 0x4a8a5a, 0xe2b33c, 0x6a7ac0][i]), 10); j.position.set(A[0] - 4.9 + i * 0.32, 2.64, A[2] - 3.85); } }
  for (const [x, z] of [[-4.7, -3.4], [4.7, -3.4]]) { const pot = cyl(0.22, 0.17, 0.4, toon(0xc8643a), 12); pot.position.set(A[0] + x, 0.2, A[2] + z);
    for (let i = 0; i < 7; i++) { const lf = add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 5), toon(0x3f7a36))); lf.position.set(A[0] + x + 0.15 * Math.cos(i), 0.6 + 0.12 * (i % 3), A[2] + z + 0.15 * Math.sin(i)); lf.scale.set(1, 1.6, 0.7); lf.rotation.y = i; } }
  // pendant lamps
  for (const x of [-2.2, 0, 2.6]) { const cord = cyl(0.008, 0.008, 1.1, mats.dark, 4); cord.position.set(A[0] + x, 3.05, A[2] - 2.2);
    const sh = add(new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.22, 16, 1, true), toon(0x2f6a5a, null, { side: THREE.DoubleSide }))); sh.position.set(A[0] + x, 2.45, A[2] - 2.2);
    glow(A[0] + x, 2.32, A[2] - 2.2, 0.9, 0.7); }
  // main table (friend + girlfriend behind it), corner table (you), booth bench (left)
  table(A[0], A[2] - 1.45); chairBack(A[0], A[2] - 2.05); chairBack(A[0] + 0.78, A[2] - 2.1, 0x8a4a2e);
  table(A[0] + 2.7, A[2] - 2.35); chairBack(A[0] + 2.7, A[2] - 2.95); chairBack(A[0] + 3.45, A[2] - 2.95, 0x8a4a2e);
  { const b = add(tbox(2.2, 0.45, 0.7, toon(0x8a4a2e), 1)); b.position.set(A[0] - 3.0, 0.225, A[2] - 3.4); const c = add(tbox(2.1, 0.12, 0.62, toon(0xe86a8a), 1)); c.position.set(A[0] - 3.0, 0.5, A[2] - 3.38);
    const bk = add(tbox(2.2, 0.9, 0.18, toon(0x8a4a2e), 1)); bk.position.set(A[0] - 3.0, 0.9, A[2] - 3.8); const bc = add(tbox(2.1, 0.6, 0.1, toon(0xe86a8a), 1)); bc.position.set(A[0] - 3.0, 0.95, A[2] - 3.68); }
  // counter at the right wall
  { const c = add(tbox(0.7, 1.0, 3.0, mats.wood, 1)); c.position.set(A[0] + 5.0, 0.5, A[2] - 1.0); const t = add(tbox(0.8, 0.06, 3.1, toon(0xf2ecdf), 1)); t.position.set(A[0] + 5.0, 1.03, A[2] - 1.0); }

  // ================= B: savanna at sunset =================
  const B = AREA.B;
  { const t = tex("sand", () => P.dirt("#d8a45a")).clone(); t.needsUpdate = true; t.repeat.set(30, 30); floor(B, 300, 300, toon(0xffffff, t)); }
  { const r = add(new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 0).toNonIndexed(), toon(0xffffff, tex("rock", () => P.rock("#9a7a6a"))))); r.geometry.computeVertexNormals(); r.position.set(B[0], 0.25, B[2] - 3); r.scale.set(1.5, 0.75, 1.0); }
  { const r = add(new THREE.Mesh(new THREE.DodecahedronGeometry(0.8, 0).toNonIndexed(), toon(0xffffff, tex("rock", () => P.rock("#9a7a6a"))))); r.geometry.computeVertexNormals(); r.position.set(B[0] + 1.9, 0.2, B[2] - 2.2); r.scale.set(1.3, 0.7, 1); }
  const acacia = (x, z, s) => { const t = cyl(0.08 * s, 0.14 * s, 2.6 * s, toon(0x4a3020), 7); t.position.set(B[0] + x, 1.3 * s, B[2] + z); t.rotation.z = 0.08;
    for (const [dx, dy, w] of [[0, 2.7, 2.2], [-0.9, 2.45, 1.4], [0.9, 2.5, 1.5]]) { const c = add(new THREE.Mesh(new THREE.SphereGeometry(1, 10, 6).toNonIndexed(), toon(0x4a6a2a))); c.geometry.computeVertexNormals(); c.position.set(B[0] + x + dx * s, dy * s, B[2] + z); c.scale.set(w * s, 0.32 * s, w * 0.7 * s); } };
  acacia(-5, -10, 1.6); acacia(7, -16, 2); acacia(-14, -30, 2.4); acacia(18, -40, 2.4);
  for (const [x, z, r] of [[-60, -160, 60], [40, -190, 70], [130, -170, 50], [-150, -200, 80]]) { const h = add(new THREE.Mesh(new THREE.SphereGeometry(r, 18, 10).toNonIndexed(), toon(0x8a5a5a))); h.geometry.computeVertexNormals(); h.position.set(B[0] + x, -r * 0.7, B[2] + z); }
  for (let i = 0; i < 14; i++) { const g = add(new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.5, 4), toon(0xc89a40))); g.position.set(B[0] - 3 + rnd(i) * 6, 0.25, B[2] - 1 - rnd(i + 7) * 3); g.rotation.z = (rnd(i + 3) - 0.5) * 0.6; }
  H.sun = glow(B[0] - 40, 22, B[2] - 200, 80, 0.95, 0xffc070);

  // ================= C: park =================
  const Cp = AREA.C;
  { const t = tex("grassP", () => P.grass("#7fb24a")).clone(); t.needsUpdate = true; t.repeat.set(20, 20); floor(Cp, 200, 200, toon(0xffffff, t)); }
  { const g = new THREE.PlaneGeometry(1.6, 60); g.rotateX(-Math.PI / 2); const m = add(new THREE.Mesh(g, toon(0xffffff, tex("dirtP", () => P.dirt("#d8c090"))))); m.position.set(Cp[0] + 2.2, 0.01, Cp[2] - 10); m.rotation.y = 0.25; }
  const tree = (x, z, s) => { const t = cyl(0.12 * s, 0.18 * s, 2.2 * s, toon(0x6a4a2a), 7); t.position.set(Cp[0] + x, 1.1 * s, Cp[2] + z);
    for (const [dx, dy, r] of [[0, 2.6, 1.2], [-0.6, 2.2, 0.9], [0.6, 2.3, 0.9], [0, 3.2, 0.8]]) { const c = add(new THREE.Mesh(new THREE.IcosahedronGeometry(r * s, 0).toNonIndexed(), toon(0x4f9a3a))); c.geometry.computeVertexNormals(); c.position.set(Cp[0] + x + dx * s, dy * s, Cp[2] + z); } };
  tree(-2.6, -5, 1.1); tree(3.4, -7, 1.3); tree(-6, -12, 1.5); tree(7, -14, 1.6); tree(0.5, -16, 1.4); tree(-12, -20, 1.8);
  { const b = add(tbox(1.6, 0.06, 0.45, mats.woodL, 1)); b.position.set(Cp[0] + 1.8, 0.45, Cp[2] - 3.6); const bk = add(tbox(1.6, 0.4, 0.06, mats.woodL, 1)); bk.position.set(Cp[0] + 1.8, 0.75, Cp[2] - 3.82);
    for (const dx of [-0.7, 0.7]) { const l = add(tbox(0.06, 0.45, 0.4, mats.dark, 1)); l.position.set(Cp[0] + 1.8 + dx, 0.22, Cp[2] - 3.6); } }
  for (const [x, z, r] of [[-50, -120, 40], [30, -140, 50], [100, -130, 40]]) { const h = add(new THREE.Mesh(new THREE.SphereGeometry(r, 18, 10).toNonIndexed(), toon(0x6a9a4a))); h.geometry.computeVertexNormals(); h.position.set(Cp[0] + x, -r * 0.75, Cp[2] + z); }
  { const ball = add(new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 10), toon(0xe8e04a))); ball.position.set(Cp[0] - 0.95, 0.09, Cp[2] - 1.7); }

  // ================= S: diagram studio =================
  const S = AREA.S;
  floor(S, 60, 60, toon(0x18224a)).castShadow = false;
  { const w = add(new THREE.Mesh(new THREE.PlaneGeometry(40, 20), new THREE.MeshBasicMaterial({ map: ct(THREE, mkc(512, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#0e1636"); gr.addColorStop(1, "#22306a"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(160,190,255,0.08)"; g.lineWidth = 2; for (let i = 0; i < 16; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, h); g.stroke(); } for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(0, i * 32); g.lineTo(w, i * 32); g.stroke(); } })), fog: false })), "noink"); w.position.set(S[0], 8, S[2] - 6); }
  for (const [x, y, s] of [[-1.5, 2.2, 7], [1.8, 2.6, 6], [0, 1.5, 8]]) glow(S[0] + x, y, S[2] - 5.9, s, 0.18, 0x8fb0ff);

  // ================= M: clothes shop =================
  const M = AREA.M;
  { const t = ct(THREE, tileTex("#f4f0ea", "#e2dcd4"), 8, 8); floor(M, 16, 16, toon(0xffffff, t)); }
  { const w = add(tbox(12, 3.6, 0.2, toon(0xffffff, ct(THREE, plasterTex("#f2dce4"), 4, 1)), 3)); w.position.set(M[0], 1.8, M[2] - 4.0); }
  const booth = (x, a, b) => { for (const dx of [-0.6, 0.6]) { const p = add(tbox(0.08, 2.3, 1.0, toon(0xf2ecdf), 1)); p.position.set(M[0] + x + dx, 1.15, M[2] - 3.4); }
    const top = add(tbox(1.3, 0.12, 1.0, toon(0xf2ecdf), 1)); top.position.set(M[0] + x, 2.36, M[2] - 3.4);
    const c = add(new THREE.Mesh(new THREE.PlaneGeometry(1.12, 2.05), toon(0xffffff, ct(THREE, curtainTex(a, b), 1, 1), { side: THREE.DoubleSide }))); c.position.set(M[0] + x, 1.15, M[2] - 2.92); return c; };
  H.curtain = booth(-0.75, "#e86a8a", "#f08aa4"); booth(0.75, "#4aa0a8", "#6abcc2"); booth(-2.2, "#8a6ac0", "#a68ad6");
  { const m = add(tbox(0.7, 1.6, 0.05, toon(0xcfe6f6), 1)); m.position.set(M[0] + 2.3, 1.3, M[2] - 3.85); const f = add(tbox(0.8, 1.7, 0.04, toon(0xe2b33c), 1)); f.position.set(M[0] + 2.3, 1.3, M[2] - 3.88); }
  // clothes rail
  { const r = cyl(0.02, 0.02, 2.2, mats.dark, 6); r.rotation.z = Math.PI / 2; r.position.set(M[0] + 3.4, 1.7, M[2] - 2.8);
    for (let i = 0; i < 8; i++) { const sh = add(tbox(0.06, 0.7, 0.42, toon([0xe86a5a, 0x5a8ad0, 0xf2c84a, 0x6ac08a][i % 4]), 1)); sh.position.set(M[0] + 2.5 + i * 0.25, 1.3, M[2] - 2.8); } }
  for (const x of [-1.5, 1.5]) glow(M[0] + x, 3.2, M[2] - 3.7, 2.2, 0.35);

  // ================= N: night street =================
  const N = AREA.N;
  { const t = tex("pave", () => P.blocks("#5a5a6a")).clone(); t.needsUpdate = true; t.repeat.set(10, 10); floor(N, 60, 60, toon(0xffffff, t)); }
  [[-4.5, "#3a3050", 1], [-1.6, "#2f3a5a", 2], [1.6, "#4a3040", 3], [4.6, "#303a4a", 4]].forEach(([x, col, sd]) => { const b = add(tbox(3, 7, 2, toon(0xffffff, ct(THREE, facadeTex(col, sd), 1, 1)), 7)); b.position.set(N[0] + x, 3.5, N[2] - 6); });
  { const sw = add(tbox(20, 0.15, 2.4, toon(0x7a7a8a), 2)); sw.position.set(N[0], 0.075, N[2] - 4.0); }
  { const p = cyl(0.06, 0.08, 4.2, mats.dark, 8); p.position.set(N[0], 2.1, N[2] - 3.1); const arm = add(tbox(0.7, 0.06, 0.06, mats.dark, 1)); arm.position.set(N[0] + 0.3, 4.1, N[2] - 3.1);
    const lamp = add(new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.2, 12, 1, true), toon(0x2a2a30, null, { side: THREE.DoubleSide }))); lamp.position.set(N[0] + 0.6, 4.0, N[2] - 3.1); glow(N[0] + 0.6, 3.9, N[2] - 3.1, 2.4, 0.9, 0xffe0a0); }
  return H;
};

export const applyWorld = (H, w, f, C) => {
  H.win.material = w.night ? H.winNight : H.winDay;
  const L = C.lampLights, A = (k) => w.areaPos;
  const P = w.lamps ?? [];
  for (let i = 0; i < 3; i++) { const l = L[i]; if (!l) continue; const p = P[i]; if (p) { l.position.set(p[0], p[1], p[2]); l.color.set(p[3] ?? 0xffc27a); l.distance = p[4] ?? 8; } else l.position.set(0, -50, 0); }
};
