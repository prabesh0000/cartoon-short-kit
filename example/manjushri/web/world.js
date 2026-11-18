// World: V = Kathmandu valley (0,0,0): lakebed y -6, lake water at level w.level, rim ground y 2, Chobhar saddle at +z (z 150).
// S = modern street (3000,0,0), street along z. F = lake-rim knoll for the last shot (-3000,0,0).
import { AREA, VW } from "./story.js";

const rnd = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const mkc = (w, h, fn) => { const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); return c; };
const fieldsTex = () => mkc(512, 512, (g, w, h) => {
  const cols = ["#7fb24a", "#94c057", "#c9c25a", "#6fa043", "#a8c860", "#b8a050", "#86b84e"];
  g.fillStyle = "#5a4a2e"; g.fillRect(0, 0, w, h);
  for (let r = 0; r < 6; r++) { let x = 0; let i = 0; while (x < w) { const pw = 50 + rnd(r * 13 + i) * 90; g.fillStyle = cols[Math.floor(rnd(r * 7 + i * 3) * cols.length)]; g.fillRect(x + 3, r * 85 + 3, pw - 6, 79); g.strokeStyle = "rgba(40,60,20,0.25)"; g.lineWidth = 2; for (let k = 10; k < 79; k += 12) { g.beginPath(); g.moveTo(x + 5, r * 85 + k); g.lineTo(x + pw - 5, r * 85 + k); g.stroke(); } x += pw; i++; } }
});
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

/** layered lake deposits (512 x 1024 = 20 m x 20 m): soil, clay bands, shells, fish fossils, bedrock */
export const FOSSILS = [[470, 935, 1.2], [300, 560, 1.0], [120, 820, 0.9], [380, 330, 0.8], [200, 700, 0.8]];
const layersTex = () => mkc(512, 1024, (g, w, h) => {
  const bands = [["#5a3e28", 40], ["#d2a868", 70], ["#6f8fae", 90], ["#e6d2a4", 60], ["#3e3a44", 80], ["#8fb4c8", 70], ["#d8b878", 60], ["#4f6f92", 110], ["#efdcb4", 60], ["#2f2c34", 100], ["#a6c2cc", 80], ["#c89a6a", 90], ["#4a3e40", 114]];
  let y = 0;
  for (const [col, hh] of bands) { g.fillStyle = col; g.beginPath(); g.moveTo(0, y + 6 * Math.sin(y)); for (let x = 0; x <= w; x += 16) g.lineTo(x, y + 6 * Math.sin((x / w) * 6 * Math.PI + y)); g.lineTo(w, y + hh + 8); g.lineTo(0, y + hh + 8); g.fill();
    g.strokeStyle = "rgba(30,20,30,0.35)"; g.lineWidth = 3; g.beginPath(); for (let x = 0; x <= w; x += 16) (x ? g.lineTo(x, y + 6 * Math.sin((x / w) * 6 * Math.PI + y)) : g.moveTo(x, y + 6 * Math.sin(y))); g.stroke(); y += hh; }
  for (let i = 0; i < 120; i++) { g.fillStyle = `rgba(${rnd(i) > 0.5 ? "255,255,255" : "20,20,30"},0.18)`; g.beginPath(); g.ellipse(rnd(i * 3) * w, 60 + rnd(i * 3 + 1) * (h - 160), 3 + rnd(i) * 5, 2 + rnd(i + 1) * 3, 0, 0, 7); g.fill(); }
  g.strokeStyle = "rgba(255,250,235,0.8)"; g.lineWidth = 3;
  for (let i = 0; i < 26; i++) { const x = rnd(i * 7 + 2) * w, yy = 160 + rnd(i * 7 + 3) * (h - 300); g.beginPath(); g.arc(x, yy, 7, Math.PI, 2 * Math.PI); g.stroke(); g.beginPath(); g.moveTo(x - 7, yy); g.lineTo(x + 7, yy); g.stroke(); }
  for (const [x, yy, s] of FOSSILS) { g.save(); g.translate(x, yy); g.scale(s, s); g.strokeStyle = "rgba(255,248,225,0.95)"; g.lineWidth = 4; g.lineCap = "round";
    g.beginPath(); g.moveTo(-40, 0); g.lineTo(34, 0); g.stroke();
    for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(k * 8, -14 + Math.abs(k) * 1.5); g.lineTo(k * 8 + 3, 14 - Math.abs(k) * 1.5); g.stroke(); }
    g.beginPath(); g.ellipse(42, 0, 10, 9, 0, 0, 7); g.stroke(); g.beginPath(); g.moveTo(-40, 0); g.lineTo(-54, -11); g.lineTo(-54, 11); g.closePath(); g.stroke(); g.restore(); }
  g.strokeStyle = "rgba(20,15,20,0.45)"; g.lineWidth = 3; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(rnd(i + 50) * w, h - 110); g.lineTo(rnd(i + 51) * w, h); g.stroke(); }
});

export const buildWorld = (C) => {
  const { THREE, add, tbox, toon, tex, P } = C;
  const H = { clouds: [], waters: [], houses: [], city: [], halves: [], foam: [] };
  const mats = {
    grass: toon(0xffffff, tex("grass", () => P.grass())), hillG: toon(0xffffff, tex("grassH", () => P.grass("#6f9e46"))),
    dirt: toon(0xffffff, tex("dirt", () => P.dirt("#b89a6a"))), rock: toon(0xffffff, tex("rock", () => P.rock("#8a8478"))),
    brick: toon(0xffffff, tex("brick", () => P.brick())), roof: toon(0xffffff, tex("roof", () => P.roof())), wood: toon(0xffffff, tex("wood", () => P.wood())),
    tree: toon(0x3f7a3a), treeD: toon(0x2f5f30), trunk: toon(0x6a4028), mount: toon(0x8a96b8), snow: toon(0xf4f6fa),
    white: toon(0xf4f0e6), gold: toon(0xe3b23c), tank: toon(0x2a2a30), pole: toon(0x4a4a50), redwood: toon(0x7a2a22),
    sidewalk: toon(0xffffff, tex("blocks", () => P.blocks("#b8aa98"))),
  };
  const flat = (geo) => { const g = geo.toNonIndexed(); g.computeVertexNormals(); return g; };
  const rep = (m, n, m2 = n) => { const c = m.clone(); c.map = m.map.clone(); c.map.needsUpdate = true; c.map.repeat.set(n, m2); return c; };
  const tree = (x, y, z, s = 1, dark = false, parent) => {
    const grp = new THREE.Group(); grp.position.set(x, y, z); (parent ?? C.scene).add(grp);
    const t = add(new THREE.Mesh(new THREE.CylinderGeometry(0.16 * s, 0.24 * s, 2.2 * s, 6), mats.trunk), "world", grp); t.position.set(0, 1.1 * s, 0);
    for (let i = 0; i < 3; i++) { const b = add(new THREE.Mesh(flat(new THREE.IcosahedronGeometry((1.3 - i * 0.2) * s, 0)), dark ? mats.treeD : mats.tree), "world", grp); b.position.set((rnd(i + x) - 0.5) * s, (2.6 + i * 0.7) * s, (rnd(i + z) - 0.5) * 0.8 * s); }
    return grp;
  };
  const cloud = (x, y, z, s, seed) => {
    const m = add(new THREE.Mesh(new THREE.PlaneGeometry(1, 0.5), new THREE.MeshBasicMaterial({ map: tex("cloud" + (seed % 4), () => P.cloudTex(seed % 4)), transparent: true, depthWrite: false, fog: true, color: 0xffffff })), "noink");
    m.position.set(x, y, z); m.scale.set(s, s, 1); H.clouds.push(m); return m;
  };
  const waterMat = (key, n) => { const t = tex("water" + key, () => P.water("#3a8fb4"), 1).clone(); t.needsUpdate = true; t.repeat.set(n, n); return toon(0xffffff, t, { emissive: new THREE.Color(0x000000) }); };
  /** hill: sphere scaled in y, its base at y0 (top = y0 + 0.75 r sy) */
  const hill = (x, y0, z, r, sy, mat, parent) => { const m = add(new THREE.Mesh(new THREE.SphereGeometry(r, 24, 12), rep(mat, Math.max(2, r / 6))), "world", parent); m.scale.set(1, sy, 1); m.position.set(x, y0 - r * sy * 0.25, z); m.castShadow = false; return m; };

  // ================= V: valley =================
  const V = AREA.V, R = VW.R;
  { const g = new THREE.CircleGeometry(R + 2, 64); g.rotateX(-Math.PI / 2); const m = add(new THREE.Mesh(g, toon(0xffffff, (() => { const t = new THREE.CanvasTexture(fieldsTex()); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 10); return t; })()))); m.position.set(V[0], -6, V[2]); m.castShadow = false; }
  { const g = new THREE.CylinderGeometry(R + 2, R + 2, 10, 64, 1, true); const m = add(new THREE.Mesh(g, rep(mats.dirt, 30, 1))); m.material.side = THREE.DoubleSide; m.position.set(V[0], -3, V[2]); m.castShadow = false; }
  { const g = new THREE.RingGeometry(R, 1700, 64, 1); g.rotateX(-Math.PI / 2); const m = add(new THREE.Mesh(g, rep(mats.grass, 120))); m.position.set(V[0], 2, V[2]); m.castShadow = false; }
  // lake water (moves with w.level)
  { const g = new THREE.CircleGeometry(R + 1, 64); g.rotateX(-Math.PI / 2); H.lake = add(new THREE.Mesh(g, waterMat("L", 40))); H.lake.material.transparent = true; H.lake.position.set(V[0], 0, V[2]); H.lake.castShadow = false; H.waters.push(H.lake); }
  // ghost lake (shot 4): translucent shimmer at the old level
  { const g = new THREE.CircleGeometry(R + 1, 64); g.rotateX(-Math.PI / 2); const t = tex("waterG", () => P.water("#5ab4e0"), 1).clone(); t.needsUpdate = true; t.repeat.set(30, 30);
    H.ghost = add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: t, color: 0xbfe8ff, transparent: true, opacity: 0, depthWrite: false, fog: true })), "noink"); H.ghost.position.set(V[0], 0.05, V[2]); H.ghost.renderOrder = 3; }
  // Bagmati river on the lakebed (shows once drained) + the outflow through the gorge
  { const g = new THREE.PlaneGeometry(5, 2 * R); g.rotateX(-Math.PI / 2); H.river = add(new THREE.Mesh(g, waterMat("R", 1))); H.river.material.map.repeat.set(1, 50); H.river.position.set(V[0] + 1, -5.93, V[2]); H.river.castShadow = false; H.waters.push(H.river); }
  { const g = new THREE.PlaneGeometry(16, 320); g.rotateX(-Math.PI / 2); H.out = add(new THREE.Mesh(g, waterMat("O", 1))); H.out.material.map.repeat.set(3, 60); H.out.position.set(V[0], 2.08, V[2] + VW.SAD + 160); H.out.castShadow = false; H.waters.push(H.out); }
  { const g = new THREE.PlaneGeometry(1, 1); g.rotateX(-Math.PI / 2); H.spill = add(new THREE.Mesh(g, waterMat("P", 1)), "noink"); H.spill.material.map.repeat.set(3, 3); H.spill.castShadow = false; H.waters.push(H.spill); }
  // rim hills (gap at the Chobhar saddle, +z)
  for (let i = 0; i < 44; i++) {
    const th = (i / 44) * Math.PI * 2 + rnd(i) * 0.05; const d = Math.atan2(Math.sin(th), Math.cos(th));
    if (Math.abs(d) < 0.3) continue;
    const r = 26 + rnd(i + 3) * 18, Rr = R + 12 + rnd(i + 5) * 16;
    hill(V[0] + Rr * Math.sin(th), 2, V[2] + Rr * Math.cos(th), r, 0.55 + rnd(i + 8) * 0.25, mats.hillG);
    if (i % 2 === 0) for (let k = 0; k < 3; k++) tree(V[0] + (Rr + 14 + k * 6) * Math.sin(th + k * 0.03), 2, V[2] + (Rr + 14 + k * 6) * Math.cos(th + k * 0.03), 2.6, k % 2 === 0);
  }
  // Manjushri's hill (west of the saddle) + its rock, the east hill
  hill(V[0] + VW.MJ[0], 2, V[2] + VW.MJ[2] + 2, 18, 0.5, mats.hillG);
  hill(V[0] + 36, 2, V[2] + 160, 18, 0.55, mats.hillG);
  // the saddle: two halves that part
  for (const s of [-1, 1]) {
    const grp = new THREE.Group(); grp.position.set(V[0] + s * 10, 0, V[2] + VW.SAD); C.scene.add(grp);
    hill(0, 2, 0, 14, 0.72, mats.hillG, grp);
    const rk = add(new THREE.Mesh(flat(new THREE.IcosahedronGeometry(6, 0)), mats.rock), "world", grp); rk.scale.set(0.7, 1.0, 1.2); rk.position.set(-s * 6.5, 3.5, -6);
    for (let k = 0; k < 4; k++) tree(s * (7 + k * 2), 5.6 - k * 0.7, 3 - k * 2.4, 1.6, k % 2 === 0, grp);
    if (s < 0) { const r = add(new THREE.Mesh(flat(new THREE.IcosahedronGeometry(3.2, 0)), mats.rock), "world", grp); r.scale.set(1.2, 0.5, 1.1); r.position.set(VW.MJ[0] + 10, VW.MJ[1] - 1.5, VW.MJ[2] - VW.SAD); }
    H.halves.push({ grp, s });
  }
  // mountains to the north + far ranges
  for (let i = 0; i < 16; i++) {
    const x = V[0] - 700 + i * 95 + rnd(i) * 40, z = V[2] - 520 - rnd(i + 2) * 180, h = 140 + rnd(i + 4) * 160, r = 90 + rnd(i + 6) * 60;
    const m = add(new THREE.Mesh(flat(new THREE.ConeGeometry(r, h, 7)), mats.mount)); m.position.set(x, 2 + h / 2 - 4, z); m.rotation.y = rnd(i) * 3; m.castShadow = false;
    const sc = add(new THREE.Mesh(flat(new THREE.ConeGeometry(r * 0.36, h * 0.36, 7)), mats.snow)); sc.position.set(x, 2 + h - 4 - h * 0.18 + 0.5, z); sc.rotation.y = m.rotation.y; sc.castShadow = false;
  }
  for (let i = 0; i < 14; i++) { const th = (i / 14) * Math.PI * 2; if (Math.cos(th) < -0.5) continue; hill(V[0] + 420 * Math.sin(th), 2, V[2] + 420 * Math.cos(th), 90 + rnd(i) * 40, 0.5, mats.hillG); }
  for (let i = 0; i < 9; i++) cloud(V[0] - 500 + i * 120 + rnd(i) * 40, 110 + rnd(i + 1) * 60, V[2] - 520, 140 + rnd(i + 2) * 60, i);
  for (let i = 0; i < 5; i++) cloud(V[0] - 300 + i * 150, 90 + rnd(i + 7) * 40, V[2] + 600, 120, i + 2);
  // central hill (Swayambhu) - top just under the full lake
  H.cHill = hill(V[0], -6, V[2], 15, 0.5, mats.hillG); H.cHill.position.y = -7.8;
  H.cTrees = new THREE.Group(); C.scene.add(H.cTrees);
  for (let i = 0; i < 9; i++) { const a = i * 0.7, rr = 5 + (i % 3) * 2.5; tree(V[0] + Math.cos(a) * rr, -7.8 + 7.5 * Math.sqrt(1 - (rr / 15) ** 2) - 0.6, V[2] + Math.sin(a) * rr, 0.9, i % 2 === 0, H.cTrees); }
  { const st = new THREE.Group(); st.position.set(V[0], -0.5, V[2]); C.scene.add(st); H.stupa = st;
    const base = add(new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.6, 0.8, 20), mats.white), "world", st); base.position.y = 0.4;
    const dome = add(new THREE.Mesh(new THREE.SphereGeometry(2.6, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mats.white), "world", st); dome.position.y = 0.8;
    const hm = add(new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.9, 1.3), mats.gold), "world", st); hm.position.y = 3.75;
    const sp = add(new THREE.Mesh(new THREE.ConeGeometry(0.75, 3.0, 12), mats.gold), "world", st); sp.position.y = 5.7;
    for (let k = 0; k < 4; k++) { const ring = add(new THREE.Mesh(new THREE.CylinderGeometry(0.72 - k * 0.14, 0.72 - k * 0.14, 0.12, 12), mats.gold), "world", st); ring.position.y = 4.6 + k * 0.55; }
    const um = add(new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.45, 12), mats.gold), "world", st); um.position.y = 7.4; }
  // village (Newari houses + trees) and modern city on the lakebed
  const ok = (x, z) => Math.hypot(x, z) < R - 10 && Math.hypot(x, z) > 18 && Math.abs(x - 1) > 6;
  for (let i = 0, n = 0; n < 70 && i < 900; i++) {
    const a = rnd(i * 2) * Math.PI * 2, rr = 22 + Math.sqrt(rnd(i * 2 + 1)) * (R - 34), x = Math.cos(a) * rr, z = Math.sin(a) * rr; if (!ok(x, z)) continue; n++;
    const grp = new THREE.Group(); grp.position.set(V[0] + x, -6, V[2] + z); grp.rotation.y = rnd(i) * 1.5; C.scene.add(grp);
    const b = add(tbox(4, 3, 3.6, mats.brick, 1.6), "world", grp); b.position.y = 1.5;
    const rf = add(new THREE.Mesh(flat(new THREE.ConeGeometry(3.4, 1.7, 4)), mats.roof), "world", grp); rf.position.y = 3.85; rf.rotation.y = Math.PI / 4; rf.scale.set(1.2, 1, 1.05);
    const wd = add(tbox(1.0, 1.0, 0.1, mats.wood, 1), "world", grp); wd.position.set(0, 1.9, 1.82);
    if (n % 3 === 0) tree(2.8, 0, 0.5, 0.9, n % 2 === 0, grp);
    H.houses.push({ grp, d: rr, k: rnd(i + 5) });
  }
  const PAST = ["#f2d6b8", "#f0c8c8", "#f6e8b0", "#cfe0e8", "#e8e2d6", "#d8e8c8", "#f4b8a0", "#ffffff"].map((c) => { const t = new THREE.CanvasTexture(winTex()); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return toon(new THREE.Color(c), t); });
  const block = (w, h, d, matI) => { const m = add(tbox(w, h, d, PAST[matI % PAST.length], 3)); return m; };
  for (let i = 0, n = 0; n < 330 && i < 4000; i++) {
    const x = (rnd(i * 3) - 0.5) * 2 * R, z = (rnd(i * 3 + 1) - 0.5) * 2 * R; if (!ok(x, z)) continue;
    const w = 5 + rnd(i + 7) * 5, d = 5 + rnd(i + 8) * 5, h = 6 + rnd(i + 9) ** 2 * 16;
    const grp = new THREE.Group(); grp.position.set(V[0] + x, -6, V[2] + z); grp.rotation.y = Math.round(rnd(i) * 3) * 0.08; C.scene.add(grp);
    const b = block(w, h, d, n); grp.add(b); b.position.y = h / 2;
    if (n % 2 === 0) { const t = add(new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.2, 10), mats.tank), "world", grp); t.position.set(w * 0.25, h + 0.6, -d * 0.2); }
    H.city.push({ grp, d: Math.hypot(x, z), k: rnd(i + 11) }); n++;
  }

  // ================= S: modern street (street along z, the walker comes toward +z) =================
  const S = AREA.S;
  { const g = new THREE.PlaneGeometry(9, 260); g.rotateX(-Math.PI / 2); const t = new THREE.CanvasTexture(asphaltTex()); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 26);
    const m = add(new THREE.Mesh(g, toon(0xffffff, t))); m.position.set(S[0], 0, S[2] - 90); m.castShadow = false; }
  for (const s of [-1, 1]) { const sw = add(tbox(2.4, 0.18, 260, mats.sidewalk, 1.2)); sw.position.set(S[0] + s * 5.7, 0.09, S[2] - 90); }
  { const g = new THREE.PlaneGeometry(600, 600); g.rotateX(-Math.PI / 2); const m = add(new THREE.Mesh(g, rep(mats.dirt, 60))); m.position.set(S[0], -0.02, S[2]); m.castShadow = false; }
  const SH = ["#2f7a5a", "#2f5f9e", "#b8323a", "#d9a23a", "#6a6a72", "#3a8a8a"].map((c) => toon(new THREE.Color(c)));
  for (const s of [-1, 1]) for (let i = 0, z = 30; z > -200; i++) {
    const wz = 7 + rnd(i * 5 + s) * 4, h = 9 + rnd(i * 5 + s + 1) * 9, dd = 10;
    const b = block(dd, h, wz, i * 3 + (s > 0 ? 1 : 0)); b.position.set(S[0] + s * (6.9 + dd / 2), h / 2, S[2] + z - wz / 2);
    const sh = add(tbox(0.2, 2.4, wz * 0.7, SH[(i + (s > 0 ? 2 : 0)) % SH.length], 1)); sh.position.set(S[0] + s * 6.85, 1.3, S[2] + z - wz / 2);
    const sg = add(tbox(0.25, 0.9, wz * 0.6, SH[(i + 3) % SH.length], 1)); sg.position.set(S[0] + s * 6.8, 3.2, S[2] + z - wz / 2);
    if (i % 2 === 0) { const t = add(new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.4, 10), mats.tank)); t.position.set(S[0] + s * (6.9 + dd * 0.6), h + 0.7, S[2] + z - wz / 2); }
    z -= wz + 0.2;
  }
  // poles + sagging wires (the Kathmandu tangle)
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x1a1a20, fog: true });
  const poles = [];
  for (let i = 0; i < 14; i++) for (const s of [-1, 1]) { const z = S[2] + 20 - i * 14 + (s > 0 ? 5 : 0), x = S[0] + s * 4.8; const p = add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 8, 6), mats.pole)); p.position.set(x, 4, z); poles.push([x, 7.6, z, s]); }
  const wire = (a, b, sag, k) => { const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(new THREE.Vector3(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t) - k * 0.25, a[2] + (b[2] - a[2]) * t)); }
    add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.028, 4), wireMat), "noink"); };
  for (let i = 0; i < poles.length - 2; i++) { const a = poles[i], b = poles[i + 2]; for (let k = 0; k < 3; k++) wire(a, b, 0.6 + k * 0.35, k); }
  for (let i = 0; i < poles.length - 1; i += 2) for (let k = 0; k < 2; k++) wire(poles[i], poles[i + 1], 0.9 + k * 0.5, k);
  // a pagoda temple closing the street
  { const pz = S[2] - 175, px = S[0];
    for (let k = 0; k < 4; k++) { const st = add(tbox(14 - k * 2.2, 0.8, 14 - k * 2.2, mats.sidewalk, 1.4)); st.position.set(px, 0.4 + k * 0.8, pz); }
    const bd = add(tbox(6, 5, 6, mats.brick, 1.6)); bd.position.set(px, 5.7, pz);
    for (let k = 0; k < 3; k++) { const rf = add(new THREE.Mesh(flat(new THREE.ConeGeometry(7 - k * 1.6, 2.6, 4)), mats.redwood)); rf.rotation.y = Math.PI / 4; rf.position.set(px, 9.2 + k * 3.2, pz);
      if (k < 2) { const tier = add(tbox(4 - k * 1.2, 2, 4 - k * 1.2, mats.brick, 1.6)); tier.position.set(px, 10.9 + k * 3.2, pz); } }
    const pin = add(new THREE.Mesh(new THREE.ConeGeometry(0.5, 2.6, 8), mats.gold)); pin.position.set(px, 17.6, pz); }
  for (let i = 0; i < 5; i++) cloud(S[0] - 200 + i * 100, 70 + rnd(i + 3) * 30, S[2] - 380, 110, i + 1);
  // lake surface seen from below (shot 6, the old lake returns)
  { const g = new THREE.PlaneGeometry(500, 500); g.rotateX(Math.PI / 2); const t = tex("waterU", () => P.water("#7fd0f0"), 1).clone(); t.needsUpdate = true; t.repeat.set(40, 40);
    H.surf = add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: t, color: 0xd8f6ff, transparent: true, opacity: 0, depthWrite: false, fog: false, side: THREE.DoubleSide })), "noink"); H.surf.position.set(S[0], 21, S[2] - 60); H.surf.renderOrder = 4; }

  // ================= D: cut-away of the valley floor (science beat) =================
  const D = AREA.D;
  { const lay = new THREE.CanvasTexture(layersTex()); lay.colorSpace = THREE.SRGBColorSpace; lay.wrapS = THREE.RepeatWrapping; lay.repeat.set(6, 1);
    const side = new THREE.CanvasTexture(layersTex()); side.colorSpace = THREE.SRGBColorSpace; side.wrapS = THREE.RepeatWrapping; side.repeat.set(2, 1);
    const top = new THREE.CanvasTexture(fieldsTex()); top.colorSpace = THREE.SRGBColorSpace; top.wrapS = top.wrapT = THREE.RepeatWrapping; top.repeat.set(8, 3);
    const ml = toon(0xffffff, lay), ms = toon(0xffffff, side), mt = toon(0xffffff, top), md = toon(0x5a4a3c);
    const slab = add(new THREE.Mesh(new THREE.BoxGeometry(120, 20, 40), [ms, ms, mt, md, ml, md])); slab.position.set(D[0], -10, D[2] - 20); slab.castShadow = false; }
  { const g = new THREE.PlaneGeometry(400, 300); g.rotateX(-Math.PI / 2); const m = add(new THREE.Mesh(g, rep(mats.dirt, 40))); m.position.set(D[0], -20, D[2] + 150); m.castShadow = false; }
  for (let i = 0, n = 0; n < 60 && i < 600; i++) { const x = (rnd(i * 5) - 0.5) * 60, z = -3 - rnd(i * 5 + 1) * 34; if (Math.abs(x) < 3) continue;
    const w = 3 + rnd(i + 2) * 3, d = 3 + rnd(i + 3) * 3, h = 3 + rnd(i + 4) ** 2 * 9; const b = block(w, h, d, i); b.position.set(D[0] + x, h / 2, D[2] + z); n++;
    if (n % 3 === 0) { const t = add(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.8, 8), mats.tank)); t.position.set(D[0] + x + w * 0.2, h + 0.4, D[2] + z); } }
  for (let i = 0; i < 10; i++) tree(D[0] - 28 + i * 6 + rnd(i) * 2, 0, D[2] - 1.6 - rnd(i + 1) * 2, 0.8, i % 2 === 0);
  { const g = new THREE.BoxGeometry(120, 1, 40); g.translate(0, 0.5, 0); const t = tex("waterD", () => P.water("#5ab4e0"), 1).clone(); t.needsUpdate = true; t.repeat.set(12, 4);
    H.dwater = add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: t, color: 0xbfe8ff, transparent: true, opacity: 0.5, depthWrite: false, fog: true })), "noink"); H.dwater.position.set(D[0], 0.02, D[2] - 20); H.dwater.renderOrder = 3; }
  for (let i = 0; i < 5; i++) cloud(D[0] - 200 + i * 100, 40 + rnd(i + 3) * 30, D[2] - 300, 100, i + 1);
  for (let i = 0; i < 8; i++) hill(D[0] - 400 + i * 110, -20, D[2] - 220 - rnd(i) * 60, 60 + rnd(i + 2) * 30, 0.6, mats.hillG);

  // ================= F: lake-rim knoll (last shot) =================
  const F = AREA.F;
  { const g = new THREE.CircleGeometry(30, 40); g.rotateX(-Math.PI / 2); const m = add(new THREE.Mesh(g, rep(mats.grass, 8))); m.position.set(F[0], 0, F[2] + 10); m.castShadow = false; }
  { const g = new THREE.PlaneGeometry(1400, 900); g.rotateX(-Math.PI / 2); const m = add(new THREE.Mesh(g, waterMat("F", 120))); m.position.set(F[0], -0.6, F[2] - 300); m.castShadow = false; H.waters.push(m); }
  for (let i = 0; i < 12; i++) hill(F[0] - 500 + i * 90 + rnd(i) * 30, -0.6, F[2] - 260 - rnd(i + 1) * 120, 50 + rnd(i + 2) * 40, 0.5, mats.hillG);
  for (let i = 0; i < 10; i++) { const x = F[0] - 600 + i * 130, z = F[2] - 700, h = 200 + rnd(i) * 120, r = 120;
    const m = add(new THREE.Mesh(flat(new THREE.ConeGeometry(r, h, 7)), mats.mount)); m.position.set(x, h / 2 - 2, z); m.castShadow = false;
    const sc = add(new THREE.Mesh(flat(new THREE.ConeGeometry(r * 0.36, h * 0.36, 7)), mats.snow)); sc.position.set(x, h - 2 - h * 0.18 + 0.5, z); sc.castShadow = false; }
  for (let i = 0; i < 6; i++) tree(F[0] + (i < 3 ? -8 - i * 3 : 8 + (i - 3) * 3), 0, F[2] - 3 - rnd(i) * 4, 1.4 + rnd(i) * 0.5, i % 2 === 0);
  for (let i = 0; i < 6; i++) cloud(F[0] - 300 + i * 120, 60 + rnd(i + 3) * 40, F[2] - 500, 120, i + 1);
  return H;
};

const sm = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
const backE = (t) => { t = Math.max(0, Math.min(1, t)); const s = 1.6; return 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2; };
export const applyWorld = (H, w, f, C) => {
  for (const m of H.waters) { m.material.map.offset.set(f * 0.0006, f * 0.0025); if (m.material.emissive) m.material.emissive.set(w.waterGlow ?? "#000000"); }
  H.out.material.map.offset.set(0, -f * 0.03 * (w.flow ?? 0));
  H.river.material.map.offset.set(0, -f * 0.01);
  if (w.camPos) for (const c of H.clouds) c.rotation.set(0, Math.atan2(w.camPos[0] - c.position.x, w.camPos[2] - c.position.z), 0);
  H.lake.position.y = Math.max(w.level ?? 0, -5.85); { const op = Math.max(0, Math.min(1, ((w.level ?? 0) + 6.4) / 2.6)); H.lake.material.opacity = op; H.lake.visible = op > 0.01; }
  H.river.visible = (w.level ?? 0) < -5.2;
  { const o = w.open ?? 0, lv = w.level ?? 0, z0 = VW.SAD + 3.5, z1 = VW.SAD - 12, dy = 2.08 - lv, len = Math.hypot(z0 - z1, dy);
    H.spill.visible = o > 0.02; H.spill.scale.set(Math.max(0.02, 16 * o), 1, len); H.spill.position.set(0, (2.08 + lv) / 2, (z0 + z1) / 2); H.spill.rotation.set(-Math.atan2(dy, z0 - z1), 0, 0);
    H.spill.material.map.offset.set(0, -f * 0.04); }
  H.out.visible = (w.open ?? 0) > 0.02; H.out.scale.x = Math.max(0.02, w.open ?? 0);
  for (const { grp, s } of H.halves) { const o = w.open ?? 0, sh = w.shake ?? 0; grp.position.x = s * (10 + 12 * o) + sh * Math.sin(f * 2.3 + s); grp.rotation.z = -s * 0.14 * o; grp.position.y = -1.2 * o + sh * 0.4 * Math.sin(f * 3.1); }
  H.ghost.material.opacity = w.ghost ?? 0; H.ghost.visible = (w.ghost ?? 0) > 0.01; H.ghost.material.map.offset.set(f * 0.002, f * 0.004);
  H.cTrees.visible = (w.level ?? 0) < -2.5;
  const stp = w.stupa ?? 0; H.stupa.visible = stp > 0.01; H.stupa.scale.setScalar(Math.max(0.01, stp));
  for (const h of H.houses) { const t = backE(((w.village ?? 0) * 1.6 - h.k * 0.6)) * (1 - sm((w.city ?? 0) * 2.2 - h.k)); h.grp.visible = t > 0.01; h.grp.scale.set(1, Math.max(0.01, t), 1); }
  for (const c of H.city) { const t = backE((w.city ?? 0) * 1.7 - (c.d / 150) * 0.55 - c.k * 0.15); c.grp.visible = t > 0.01; c.grp.scale.set(1, Math.max(0.01, t), 1); }
  { const k = w.dwater ?? 0; H.dwater.visible = k > 0.01; H.dwater.scale.y = Math.max(0.01, 12 * k); H.dwater.material.map.offset.set(f * 0.002, f * 0.003); }
  H.surf.material.opacity = w.under ?? 0; H.surf.visible = (w.under ?? 0) > 0.01; H.surf.material.map.offset.set(f * 0.003, f * 0.002);
};
