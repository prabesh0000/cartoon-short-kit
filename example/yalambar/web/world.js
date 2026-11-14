// World: A = Nepal ridge (0,0,0), B = Kurukshetra (1000,0,0), C/D = Kathmandu (-1000,0,0).
import { SCALE, panTops, AREA } from "./story.js";

const rnd = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export const buildWorld = (C) => {
  const { THREE, add, tbox, toon, tex, P } = C;
  const H = { flags: [], clouds: [], scale: null };
  const mats = {
    grass: toon(0xffffff, tex("grass", () => P.grass())), grassDry: toon(0xffffff, tex("grassDry", () => P.grass("#9db45a"))),
    dirt: toon(0xffffff, tex("dirt", () => P.dirt())), stone: toon(0xffffff, tex("stone", () => P.stone())),
    blocks: toon(0xffffff, tex("blocks", () => P.blocks())), brick: toon(0xffffff, tex("brick", () => P.brick())),
    wood: toon(0xffffff, tex("wood", () => P.wood())), carved: toon(0xffffff, tex("carved", () => P.carved())),
    roof: toon(0xffffff, tex("roof", () => P.roof())), gold: toon(0xffffff, tex("gold", () => P.gold())),
    rock: toon(0xffffff, tex("rock", () => P.rock())), snow: toon(0xf4f8ff, null),
    pine: toon(0x2f6a3a, null), trunk: toon(0x6a4028), bush: toon(0x4f8a3a, null),
    rhodo: toon(0xd8433c, null), hillB: toon(0xffffff, tex("dirtHill", () => P.dirt("#c9a56e"))),
  };
  const flat = (geo) => { const g = geo.toNonIndexed(); g.computeVertexNormals(); return g; };
  const rep = (m, k, n) => { const c = m.clone(); c.map = m.map.clone(); c.map.needsUpdate = true; c.map.repeat.set(n, n); return c; };
  const ground = (cx, cz, size, mat, tile) => {
    const g = new THREE.PlaneGeometry(size, size, 1, 1); g.rotateX(-Math.PI / 2);
    const m = add(new THREE.Mesh(g, rep(mat, 0, size / tile))); m.position.set(cx, 0, cz); m.castShadow = false; return m;
  };
  const hill = (x, z, r, sy, mat, k) => { const m = add(new THREE.Mesh(new THREE.SphereGeometry(r, 20, 10), rep(mat, 0, Math.max(2, r / 6)))); m.scale.set(1, sy, 1); m.position.set(x, -r * sy * 0.2, z); m.castShadow = false; return m; };
  const mountain = (x, z, r, h, s) => {
    const m = add(new THREE.Mesh(flat(new THREE.ConeGeometry(r, h, 7, 1)), mats.rock)); m.position.set(x, h / 2 - 2, z); m.rotation.y = s; m.castShadow = false;
    const c = add(new THREE.Mesh(flat(new THREE.ConeGeometry(r * 0.37, h * 0.37, 7, 1)), mats.snow)); c.position.set(x, h - 2 - h * 0.185 + 0.3, z); c.rotation.y = s; c.castShadow = false;
  };
  const pine = (x, z, s = 1) => {
    const t = add(new THREE.Mesh(new THREE.CylinderGeometry(0.12 * s, 0.18 * s, 1.2 * s, 6), mats.trunk)); t.position.set(x, 0.6 * s, z);
    for (let i = 0; i < 3; i++) { const c = add(new THREE.Mesh(flat(new THREE.ConeGeometry((1.3 - i * 0.32) * s, 1.7 * s, 7)), mats.pine)); c.position.set(x, (1.5 + i * 0.85) * s, z); }
  };
  const bush = (x, z, s = 1, red = false) => {
    const b = add(new THREE.Mesh(flat(new THREE.IcosahedronGeometry(0.8 * s, 0)), mats.bush)); b.position.set(x, 0.45 * s, z); b.scale.set(1.2, 0.8, 1);
    if (red) for (let i = 0; i < 5; i++) { const f = add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.16 * s, 0), mats.rhodo)); f.position.set(x + (rnd(i + x) - 0.5) * 1.4 * s, 0.75 * s + rnd(i * 3 + z) * 0.25 * s, z + (rnd(i * 7 + x) - 0.5) * 0.9 * s); }
  };
  const flag = (x, y, z, w, h, texName, texFn, poleH, ry = 0) => {
    if (poleH) { const p = add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, poleH, 6), mats.wood)); p.position.set(x, poleH / 2, z); }
    const g = new THREE.PlaneGeometry(w, h, 14, 2); g.translate(w / 2, -h / 2, 0);
    const m = add(new THREE.Mesh(g, toon(0xffffff, tex(texName, texFn), { side: THREE.DoubleSide }))); m.position.set(x, y, z); m.rotation.y = ry;
    m.userData.base = Float32Array.from(g.attributes.position.array); m.userData.w = w; m.userData.ph = rnd(x * 3 + z);
    H.flags.push(m); return m;
  };
  const cloud = (x, y, z, s, seed) => {
    const m = add(new THREE.Mesh(new THREE.PlaneGeometry(1, 0.5), new THREE.MeshBasicMaterial({ map: tex("cloud" + (seed % 4), () => P.cloudTex(seed % 4)), transparent: true, depthWrite: false, fog: true })), "noink");
    m.position.set(x, y, z); m.scale.set(s, s, 1); H.clouds.push(m); return m;
  };

  // ================= A: Nepal ridge =================
  ground(0, 0, 900, mats.grass, 5);
  for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2, d = 70 + rnd(i) * 80; hill(Math.cos(a) * d, Math.sin(a) * d - 40, 25 + rnd(i + 3) * 30, 0.45, mats.grass); }
  for (let i = 0; i < 9; i++) mountain(-360 + i * 90 + rnd(i) * 30, -330 - rnd(i + 9) * 120, 70 + rnd(i + 2) * 60, 150 + rnd(i + 4) * 120, i);
  for (let i = 0; i < 26; i++) { const a = rnd(i * 5) * Math.PI * 2, d = 9 + rnd(i * 5 + 1) * 40; const x = Math.cos(a) * d, z = Math.sin(a) * d - 6; if (Math.abs(x) < 4 && z > -4) continue; pine(x, z, 0.9 + rnd(i) * 0.7); }
  for (let i = 0; i < 18; i++) { const a = rnd(i * 9) * Math.PI * 2, d = 4 + rnd(i * 9 + 2) * 22; const x = Math.cos(a) * d, z = Math.sin(a) * d - 4; if (Math.abs(x) < 2.5 && Math.abs(z) < 3) continue; bush(x, z, 0.8 + rnd(i) * 0.6, i % 2 === 0); }
  // Kirat banner behind Yalambar
  flag(-1.4, 4.1, -1.8, 1.6, 1.0, "flagKirat", () => P.flagTex("#c8332f", "#f6f1e6"), 4.2);
  const boulder = add(new THREE.Mesh(flat(new THREE.IcosahedronGeometry(0.55, 0)), toon(0xffffff, tex("stoneB", () => P.stone("#8f8a80")))));
  H.boulder = boulder;
  for (let i = 0; i < 6; i++) cloud(-200 + i * 80, 90 + rnd(i) * 40, -260 - rnd(i + 1) * 60, 80 + rnd(i + 2) * 40, i);

  // ================= B: Kurukshetra =================
  const B = AREA.B;
  { const g = ground(B[0], B[2], 900, mats.dirt, 5); }
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, d = 160 + rnd(i + 20) * 120; hill(B[0] + Math.cos(a) * d, B[2] + Math.sin(a) * d, 40 + rnd(i + 23) * 40, 0.3, mats.hillB); }
  const tent = (x, z, a, b) => {
    const c = add(new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 1.4, 10), toon(0xffffff, tex("tent" + a, () => P.cloth(a, b, 10))))); c.position.set(x, 0.7, z);
    const r = add(new THREE.Mesh(new THREE.ConeGeometry(2.1, 1.9, 10), toon(0xffffff, tex("tent" + a, () => P.cloth(a, b, 10))))); r.position.set(x, 2.35, z);
  };
  for (let i = 0; i < 7; i++) for (let j = 0; j < 2; j++) {
    tent(B[0] - 26 - i * 5.5 - j * 2.5, B[2] - 62 - j * 7 - rnd(i) * 3, "#b5342c", "#f2e6cf");
    tent(B[0] + 26 + i * 5.5 + j * 2.5, B[2] - 62 - j * 7 - rnd(i + 5) * 3, "#2d5fae", "#f2e6cf");
  }
  for (let i = 0; i < 6; i++) {
    flag(B[0] - 14 - i * 4.5, 6.2, B[2] - 50 - (i % 2) * 3, 1.6, 1.0, "flagRed", () => P.flagTex("#b5342c"), 6.3);
    flag(B[0] + 14 + i * 4.5, 6.2, B[2] - 50 - (i % 2) * 3, 1.6, 1.0, "flagBlue", () => P.flagTex("#2d5fae"), 6.3, Math.PI);
  }
  for (let i = 0; i < 20; i++) { const x = B[0] + (rnd(i * 4) - 0.5) * 120, z = B[2] + 20 - rnd(i * 4 + 1) * 90; if (Math.abs(x - B[0]) < 10 && z > B[2] - 50) continue; const r = add(new THREE.Mesh(flat(new THREE.IcosahedronGeometry(0.4 + rnd(i) * 0.6, 0)), mats.stone)); r.position.set(x, 0.2, z); }
  // Kirat banner carried by the marching army (pole drawn on the card; flag here)
  H.kiratFlag = flag(0, 0, 0, 1.4, 0.9, "flagKirat", () => P.flagTex("#c8332f", "#f6f1e6"), 0);
  { const pole = add(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 3.8, 6), mats.wood)); H.kiratPole = pole; }
  // balance scale
  {
    const S = SCALE, g = new THREE.Group(); C.scene.add(g); g.position.set(S.pivot[0], 0, S.pivot[2]);
    const base = add(tbox(3.2, 0.6, 3.2, mats.blocks, 1.6), "world", g); base.position.y = 0.3;
    const step = add(tbox(2.2, 0.4, 2.2, mats.blocks, 1.6), "world", g); step.position.y = 0.8;
    const post = add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, S.pivot[1] - 1.0, 8), mats.wood), "world", g); post.position.y = 1.0 + (S.pivot[1] - 1.0) / 2;
    const knob = add(new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 8), mats.gold), "world", g); knob.position.y = S.pivot[1];
    const pivot = new THREE.Group(); pivot.position.y = S.pivot[1]; g.add(pivot);
    const beam = add(tbox(S.half * 2 + 0.4, 0.28, 0.28, mats.wood, 1), "world", pivot);
    for (const s of [-1, 1]) { const c = add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), mats.gold), "world", pivot); c.position.x = s * (S.half + 0.2); }
    const hanger = () => {
      const h = new THREE.Group(); C.scene.add(h);
      for (const dx of [-1, 1]) {
        const v = new THREE.Vector3(dx * S.panR * 0.85, -S.L, 0), len = v.length();
        const rod = add(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, len, 5), mats.gold), "world", h);
        rod.position.copy(v.clone().multiplyScalar(0.5)); rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.clone().normalize());
      }
      const pan = add(new THREE.Mesh(new THREE.CylinderGeometry(S.panR, S.panR * 0.85, 0.22, 20), mats.gold), "world", h); pan.position.y = -S.L;
      return h;
    };
    H.scale = { g, pivot, hL: hanger(), hR: hanger() };
  }

  // ================= C/D: Kathmandu =================
  const K = AREA.K;
  ground(K[0], K[2], 900, mats.grass, 5);
  { const sq = add(tbox(44, 0.1, 40, mats.blocks, 2)); sq.position.set(K[0], 0.04, K[2] - 4); sq.castShadow = false; }
  for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2, d = 140 + rnd(i + 40) * 90; hill(K[0] + Math.cos(a) * d, K[2] + Math.sin(a) * d, 45 + rnd(i + 41) * 40, 0.42, mats.grass); }
  for (let i = 0; i < 10; i++) mountain(K[0] - 420 + i * 95 + rnd(i + 50) * 30, K[2] - 420 - rnd(i + 51) * 120, 80 + rnd(i + 52) * 50, 170 + rnd(i + 53) * 110, i + 7);
  for (let i = 0; i < 7; i++) mountain(K[0] + 300 + rnd(i + 60) * 80, K[2] - 200 + i * 90, 70, 120 + rnd(i + 61) * 80, i + 9);
  const pagoda = (x, z, s, tiers) => {
    let y = 0;
    for (let i = 0; i < 3; i++) { const b = add(tbox((7 - i * 1.4) * s, 0.55 * s, (7 - i * 1.4) * s, mats.blocks, 1.2)); b.position.set(x, y + 0.275 * s, z); y += 0.55 * s; }
    let w = 3.6 * s;
    for (let t = 0; t < tiers; t++) {
      const hh = (t === 0 ? 2.6 : 1.5) * s;
      const body = add(tbox(w, hh, w, mats.brick, 1.4)); body.position.set(x, y + hh / 2, z);
      for (const [dx, dz, ry] of [[0, 1, 0], [0, -1, 0], [1, 0, Math.PI / 2], [-1, 0, Math.PI / 2]]) {
        const win = add(tbox(w * 0.38, hh * 0.5, 0.12, mats.carved, w * 0.38)); win.position.set(x + dx * (w / 2 + 0.03), y + hh * 0.52, z + dz * (w / 2 + 0.03)); win.rotation.y = ry;
      }
      y += hh;
      const rw = w * 1.55, rh = (t === tiers - 1 ? 2.0 : 1.2) * s;
      const roofM = add(new THREE.Mesh(new THREE.ConeGeometry(rw * 0.72, rh, 4, 1), rep(mats.roof, 0, 2))); roofM.position.set(x, y + rh / 2 - 0.1, z); roofM.rotation.y = Math.PI / 4;
      const eave = add(tbox(rw * 1.02, 0.12 * s, rw * 1.02, mats.wood, 1)); eave.position.set(x, y - 0.05, z);
      y += rh * 0.55; w *= 0.72;
    }
    const fin = add(new THREE.Mesh(new THREE.ConeGeometry(0.28 * s, 1.3 * s, 8), mats.gold)); fin.position.set(x, y + 0.9 * s, z);
    const ball = add(new THREE.Mesh(new THREE.SphereGeometry(0.26 * s, 10, 8), mats.gold)); ball.position.set(x, y + 0.25 * s, z);
  };
  pagoda(K[0], K[2] - 16, 1.0, 3);
  pagoda(K[0] - 15, K[2] - 22, 0.75, 2);
  pagoda(K[0] + 15, K[2] - 24, 0.7, 2);
  const house = (x, z, w, h, d, ry) => {
    const g = new THREE.Group(); C.scene.add(g); g.position.set(x, 0, z); g.rotation.y = ry;
    const b = add(tbox(w, h, d, mats.brick, 1.4), "world", g); b.position.y = h / 2;
    for (let i = 0; i < Math.floor(w / 2.2); i++) for (let fl = 0; fl < 2; fl++) {
      const win = add(tbox(0.9, 0.9, 0.1, mats.carved, 0.9), "world", g); win.position.set(-w / 2 + 1.2 + i * 2.2, 1.6 + fl * 2.0, d / 2 + 0.04);
    }
    const r = add(tbox(w + 0.8, 0.25, d + 1.2, mats.roof, 2), "world", g); r.position.set(0, h + 0.1, 0.2); r.rotation.x = -0.08;
  };
  for (let i = 0; i < 4; i++) { house(K[0] - 15.5, K[2] - 6 + i * 6.2, 5.6, 5.2 + rnd(i) * 1.6, 4, Math.PI / 2); house(K[0] + 15.5, K[2] - 6 + i * 6.2, 5.6, 5.4 + rnd(i + 3) * 1.4, 4, -Math.PI / 2); }
  for (let i = 0; i < 3; i++) house(K[0] - 9 + i * 9, K[2] + 21, 8, 5 + rnd(i + 8) * 1.5, 4, Math.PI);
  // Indra Jatra pole (yosin) with a long banner
  { const pole = add(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 17, 8), mats.wood)); pole.position.set(K[0] - 7.5, 8.5, K[2] - 9); }
  flag(K[0] - 7.5, 16.6, K[2] - 9, 1.1, 5.5, "flagIndra", () => P.cloth("#e8b440", "#c8332f", 2), 0);
  // mask platform
  { const pl = add(tbox(3.4, 1.1, 2.2, mats.wood, 1.2)); pl.position.set(K[0], 0.55, K[2] - 6);
    const tr = add(tbox(3.6, 0.18, 2.4, mats.gold, 1)); tr.position.set(K[0], 1.14, K[2] - 6);
    const back = add(tbox(4.2, 3.6, 0.25, toon(0xffffff, tex("drape", () => P.cloth("#a8262c", "#c23a36", 8))), 2)); back.position.set(K[0], 2.9, K[2] - 7.3); }
  // lamps (string lights + oil lamps), not inked
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xffd27a, fog: true });
  H.lampMeshes = [];
  for (let s = 0; s < 4; s++) for (let i = 0; i < 16; i++) {
    const t = i / 15, x = K[0] - 13 + t * 26, z = K[2] - 2 + s * 5.5, y = 6.2 - Math.sin(t * Math.PI) * 1.4;
    const m = add(new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 4), lampMat), "noink"); m.position.set(x, y, z); H.lampMeshes.push(m);
  }
  for (let i = 0; i < 9; i++) { const m = add(new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 4), lampMat), "noink"); m.position.set(K[0] - 1.6 + i * 0.4, 1.32, K[2] - 4.85); H.lampMeshes.push(m); }
  C.lampLights[0].position.set(K[0] - 2, 3, K[2] - 3); C.lampLights[1].position.set(K[0] + 3, 3.5, K[2] + 2); C.lampLights[2].position.set(K[0] - 4, 3.5, K[2] + 6);
  // clouds along the flight
  for (let i = 0; i < 16; i++) cloud(K[0] + 120 + rnd(i + 70) * 260, 30 + rnd(i + 71) * 60, K[2] + 40 + rnd(i + 72) * 300, 30 + rnd(i + 73) * 40, i);
  for (let i = 0; i < 8; i++) cloud(K[0] - 300 + i * 80, 100 + rnd(i + 80) * 40, K[2] - 300, 90, i + 3);
  return H;
};

export const applyWorld = (H, w, f, C) => {
  // flags wave
  for (const m of H.flags) {
    const pos = m.geometry.attributes.position, b = m.userData.base, W = m.userData.w, ph = m.userData.ph;
    for (let i = 0; i < pos.count; i++) { const x = b[i * 3], k = x / W; pos.setZ(i, b[i * 3 + 2] + Math.sin(x * 3.2 - f * 0.22 + ph * 6) * 0.14 * k + Math.sin(x * 5.1 - f * 0.31) * 0.05 * k); }
    pos.needsUpdate = true; m.geometry.computeVertexNormals();
  }
  // boulder
  H.boulder.position.set(...w.boulder); H.boulder.rotation.set(w.boulderRot, w.boulderRot * 0.6, 0);
  // carried Kirat banner
  if (w.kiratFlag) { H.kiratFlag.visible = H.kiratPole.visible = true; const [x, y, z] = w.kiratFlag; H.kiratPole.position.set(x, y + 1.9, z); H.kiratFlag.position.set(x, y + 3.75, z); H.kiratFlag.rotation.y = w.kiratFlagRy ?? 0; }
  else H.kiratFlag.visible = H.kiratPole.visible = false;
  // scale
  const S = H.scale; S.g.visible = S.hL.visible = S.hR.visible = !!w.scaleOn;
  S.pivot.rotation.z = w.theta;
  const pt = panTops(w.theta);
  S.hL.position.set(pt.endL[0], pt.endL[1], pt.endL[2]); S.hR.position.set(pt.endR[0], pt.endR[1], pt.endR[2]);
  // clouds face the camera (yaw)
  if (w.camPos) for (const c of H.clouds) { c.rotation.set(0, Math.atan2(w.camPos[0] - c.position.x, w.camPos[2] - c.position.z), 0); }
  // lamp flicker
  const fl = 0.85 + 0.15 * Math.sin(f * 0.9) * Math.sin(f * 0.37);
  for (const l of C.lampLights) l.intensity *= fl;
};
