// World for "The Day It Rained Meat" (kentucky-meat-shower): a generic 1876 Kentucky farmyard around (0,0,0):
// log cabin (back left), split-rail fence, soap kettle over a fire (centre right), wood pile, trees, rolling hills,
// far blue ridges, painted clouds; a cloud bank at y 40-48 for the fly-through and open sky above it for the vultures.
const rnd = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const mkc = (w, h, fn) => { const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); return c; };
const logsTex = () => mkc(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { const y = i * 32;
  const gr = g.createLinearGradient(0, y, 0, y + 32); gr.addColorStop(0, "#9a6a40"); gr.addColorStop(0.5, "#86562f"); gr.addColorStop(1, "#5a3a20");
  g.fillStyle = gr; g.fillRect(0, y, w, 32); g.fillStyle = "#3a2414"; g.fillRect(0, y + 29, w, 3); g.fillStyle = "#e8dcc0"; g.fillRect(0, y + 27, w, 2);
  for (let k = 0; k < 4; k++) { g.strokeStyle = "rgba(60,36,20,0.35)"; g.lineWidth = 1.5; g.beginPath(); const x = rnd(i * 9 + k) * w; g.moveTo(x, y + 8); g.lineTo(x + 40, y + 12); g.stroke(); } } });
const ct = (THREE, c, rx = 1, ry = 1) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 4; return t; };

export const KETTLE = [1.3, 0, -2.0];

export const buildWorld = (C) => {
  const { THREE, add, tbox, toon, tex, P } = C;
  const H = { clouds: [], bank: [], low: [] };
  const flat = (geo) => { const g = geo.toNonIndexed(); g.computeVertexNormals(); return g; };
  const rep = (key, fn, n, m = n) => { const t = tex(key, fn).clone(); t.needsUpdate = true; t.repeat.set(n, m); return t; };
  const mats = { grass: toon(0xffffff, rep("grassK", () => P.grass("#86b552"), 60)), hill: toon(0xffffff, rep("grassH", () => P.grass("#78a84a"), 8)),
    dirt: toon(0xffffff, rep("dirtK", () => P.dirt("#c8a474"), 4)), logs: toon(0xffffff, ct(THREE, logsTex(), 2, 1.2)), roof: toon(0xffffff, rep("roofK", () => P.roof("#6a5040"), 3)),
    wood: toon(0xffffff, tex("woodK", () => P.wood("#8a6a48"))), rail: toon(0x9a7a56), stone: toon(0xffffff, rep("stoneK", () => P.stone("#a09888"), 1)),
    tree: toon(0x5f9a3e), treeD: toon(0x467a32), trunk: toon(0x6a4628), ridge: toon(0x8fa6c8), ridge2: toon(0xa8bcd8), iron: toon(0x2a2a30), door: toon(0x6a4426), win: toon(0x2a3448) };

  // ground, yard
  { const g = new THREE.PlaneGeometry(900, 900); g.rotateX(-Math.PI / 2); const m = add(new THREE.Mesh(g, mats.grass)); m.castShadow = false; }
  { const g = new THREE.CircleGeometry(7, 32); g.rotateX(-Math.PI / 2); const m = add(new THREE.Mesh(g, mats.dirt)); m.scale.set(1.3, 1, 1); m.position.set(0, 0.01, -2.5); m.castShadow = false; }

  // log cabin (back left): walls, gable roof, chimney, door, window
  { const cx = -4.2, cz = -7.2, w = 6.4, d = 4.6, h = 2.8;
    const wl = add(tbox(w, h, d, mats.logs, 2)); wl.position.set(cx, h / 2, cz);
    const gable = new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(0, 1.7)]);
    for (const s of [-1, 1]) { const gm = add(new THREE.Mesh(new THREE.ExtrudeGeometry(gable, { depth: 0.2, bevelEnabled: false }), [mats.logs, mats.logs])); gm.position.set(cx, h, cz + s * (d / 2) - (s > 0 ? 0.2 : 0)); }
    for (const s of [-1, 1]) { const r = add(tbox(Math.hypot(w / 2, 1.7) + 0.5, 0.18, d + 0.8, mats.roof, 2)); r.position.set(cx + s * (w / 4 + 0.05), h + 0.9, cz); r.rotation.z = -s * Math.atan2(1.7, w / 2); }
    const ch = add(tbox(0.9, 5.4, 0.9, mats.stone, 1)); ch.position.set(cx - w / 2 - 0.2, 2.7, cz - 0.6);
    const dr = add(tbox(1.1, 2.0, 0.08, mats.door, 1)); dr.position.set(cx + 1.2, 1.0, cz + d / 2 + 0.03);
    const wn = add(tbox(1.0, 0.8, 0.06, mats.win, 1)); wn.position.set(cx - 1.5, 1.6, cz + d / 2 + 0.03);
    for (const [x, y, ww, hh] of [[cx - 1.5, 2.04, 1.2, 0.08], [cx - 1.5, 1.16, 1.2, 0.08], [cx - 2.06, 1.6, 0.08, 0.96], [cx - 0.94, 1.6, 0.08, 0.96], [cx - 1.5, 1.6, 0.06, 0.8]]) { const fr = add(tbox(ww, hh, 0.1, mats.rail, 1)); fr.position.set(x, y, cz + d / 2 + 0.06); }
    H.chimneyTop = [cx - w / 2 - 0.2, 5.5, cz - 0.6]; }

  // split-rail fence: a zig-zag behind the yard and down the right side
  const fence = (x0, z0, x1, z1, n) => { for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 1) / n, za = (i % 2) * 0.35;
      const ax = x0 + (x1 - x0) * t0, az = z0 + (z1 - z0) * t0 + za, bx = x0 + (x1 - x0) * t1, bz = z0 + (z1 - z0) * t1 + (0.35 - za), L = Math.hypot(bx - ax, bz - az);
      for (const y of [0.45, 0.85, 1.2]) { const r = add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, L + 0.3, 6), mats.rail)); r.position.set((ax + bx) / 2, y, (az + bz) / 2); r.rotation.z = Math.PI / 2; r.rotation.y = -Math.atan2(bz - az, bx - ax); } } };
  fence(-1.0, -9.6, 12, -9.6, 6); fence(7.2, -9.4, 7.2, 4, 6);

  // soap cauldron beside her (closed iron body up to the rim, dark inside, soap just under the rim) on three short legs over a fire
  { const [x, , z] = KETTLE;
    const prof = [[0.001, 0.13], [0.2, 0.135], [0.36, 0.2], [0.45, 0.34], [0.47, 0.47], [0.45, 0.6], [0.41, 0.7], [0.4, 0.74]].map(([r, y]) => new THREE.Vector2(r, y));
    const pot = add(new THREE.Mesh(new THREE.LatheGeometry(prof, 32), toon(0x2a2a30, null, { side: THREE.DoubleSide }))); pot.position.set(x, 0, z);
    const rim = add(new THREE.Mesh(new THREE.TorusGeometry(0.405, 0.035, 8, 32), mats.iron)); rim.rotation.x = Math.PI / 2; rim.position.set(x, 0.745, z);
    const soap = add(new THREE.Mesh(new THREE.CircleGeometry(0.4, 32), toon(0xd8c8a0))); soap.rotation.x = -Math.PI / 2; soap.position.set(x, 0.68, z); soap.castShadow = false; H.soap = soap;
    for (let i = 0; i < 3; i++) { const a = i * 2.09 + 0.5, l = add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.22, 6), mats.iron)); l.position.set(x + 0.28 * Math.cos(a), 0.1, z + 0.28 * Math.sin(a)); }
    for (let i = 0; i < 4; i++) { const lg = add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 6), mats.trunk)); lg.rotation.z = Math.PI / 2; lg.rotation.y = i * 0.8; lg.position.set(x, 0.05, z); } }
  // the wooden paddle (posed every frame from her hand into the pot by applyWorld)
  { const g = new THREE.Group(); const h = add(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1, 8), mats.wood), "world", g); h.position.y = 0.5;
    const b = add(new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.2, 0.02), mats.wood), "world", g); b.position.y = 0.08; C.scene.add(g); H.paddle = { g, h, b, up: new THREE.Vector3(0, 1, 0), dir: new THREE.Vector3() }; }
  for (let i = 0; i < 9; i++) { const lg = add(new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 1.3, 7), mats.trunk)); lg.rotation.x = Math.PI / 2; lg.position.set(-0.6 + (i % 4) * 0.27 + (Math.floor(i / 4) % 2) * 0.13, 0.13 + Math.floor(i / 4) * 0.23, -5.6); }
  { const b = add(new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.42, 12), mats.wood)); b.position.set(2.2, 0.21, -1.1); }

  // trees
  const tree = (x, z, s = 1, dark = false) => { const t = add(new THREE.Mesh(new THREE.CylinderGeometry(0.16 * s, 0.24 * s, 2.4 * s, 7), mats.trunk)); t.position.set(x, 1.2 * s, z);
    for (let i = 0; i < 3; i++) { const b = add(new THREE.Mesh(flat(new THREE.IcosahedronGeometry((1.5 - i * 0.25) * s, 0)), dark ? mats.treeD : mats.tree)); b.position.set(x + (rnd(i + x) - 0.5) * s, (2.7 + i * 0.75) * s, z + (rnd(i + z) - 0.5) * 0.8 * s); } };
  [[9, -14, 1.6], [12, -11, 1.3, 1], [-12, -12, 1.7], [-15, -6, 1.4, 1], [15, -2, 1.5], [-9, -17, 1.2, 1], [4, -20, 1.5], [18, -16, 1.8, 1], [-20, -18, 2], [-6, -24, 1.6, 1], [22, 4, 1.6], [-18, 2, 1.5, 1]].forEach(([x, z, s, d]) => tree(x, z, s, !!d));

  // rolling hills + far blue ridges
  const hill = (x, z, r, sy, m) => { const h = add(new THREE.Mesh(new THREE.SphereGeometry(r, 24, 12), m)); h.scale.set(1, sy, 1); h.position.set(x, -r * sy * 0.35, z); h.castShadow = false; };
  for (let i = 0; i < 12; i++) { const a = -1.4 + i * 0.26; hill(130 * Math.sin(a), -110 - 40 * rnd(i) - 30 * Math.cos(a), 50 + 20 * rnd(i + 3), 0.35, mats.hill); }
  for (let i = 0; i < 9; i++) { const a = -1.2 + i * 0.3, m = add(new THREE.Mesh(flat(new THREE.ConeGeometry(110 + 40 * rnd(i), 70 + 30 * rnd(i + 2), 6)), i % 2 ? mats.ridge : mats.ridge2)); m.position.set(420 * Math.sin(a), 20, -420 * Math.cos(a)); m.castShadow = false; }
  for (let i = 0; i < 10; i++) { const a = -1.3 + i * 0.29; hill(260 * Math.sin(a + 0.12), -260 * Math.cos(a + 0.12), 70, 0.3, mats.hill); }

  // painted clouds (billboards turned to the camera every frame)
  const cloud = (x, y, z, s, seed, list = H.clouds) => { const m = add(new THREE.Mesh(new THREE.PlaneGeometry(1, 0.5), new THREE.MeshBasicMaterial({ map: tex("cloudM" + (seed % 5), () => C.cloudCanvas(seed % 5)), transparent: true, depthWrite: false, fog: false, color: 0xffffff })), "noink");
    m.position.set(x, y, z); m.scale.set(s, s, 1); list.push(m); return m; };
  for (let i = 0; i < 12; i++) cloud(-220 + i * 40 + rnd(i) * 20, 70 + rnd(i + 1) * 50, -200 - rnd(i + 2) * 80, 60 + rnd(i + 3) * 40, i);
  for (let i = 0; i < 5; i++) cloud(-50 + i * 26, 62 + rnd(i + 9) * 20, -70 - rnd(i) * 30, 30 + rnd(i + 4) * 12, i + 1);
  for (let i = 0; i < 8; i++) cloud(-40 + i * 12, 46 + rnd(i + 19) * 8, -40 + rnd(i + 2) * 30, 16 + rnd(i + 14) * 8, i + 3, H.low);
  for (let i = 0; i < 5; i++) cloud(-26 + i * 13 + rnd(i + 30) * 4, 50 + rnd(i + 31) * 12, -26 - rnd(i + 32) * 14, 14 + rnd(i + 33) * 6, i + 4);   // puffs in the hook's up-view
  // the cloud bank the camera flies through (y 40-48, above the yard)
  for (let i = 0; i < 14; i++) cloud(-14 + (i % 5) * 7 + rnd(i) * 3, 41 + Math.floor(i / 5) * 3 + rnd(i + 5) * 2, -12 + (i % 3) * 3 - Math.floor(i / 5) * 2, 18 + rnd(i + 7) * 8, i + 2, H.bank);
  return H;
};

export const applyWorld = (H, w) => {
  const cp = w.camPos; if (!cp) return;
  for (const m of [...H.clouds, ...H.bank, ...H.low]) m.lookAt(cp[0], cp[1], cp[2]);
  for (const m of H.bank) { m.visible = !!w.bank; const d = Math.hypot(m.position.x - cp[0], m.position.y - cp[1], m.position.z - cp[2]); m.material.opacity = Math.min(1, Math.max(0, (d - 2) / 10)); }
  for (const m of H.low) m.visible = !!w.low;
  if (H.soap) H.soap.material.color.set(w.soapCol ?? 0xd8c8a0);
  const P = H.paddle; if (P) { const pd = w.paddle; P.g.visible = !!pd; if (pd) { const [a, b] = [pd.top, pd.bot], d = [a[0] - b[0], a[1] - b[1], a[2] - b[2]], L = Math.hypot(...d);
    P.g.position.set(b[0], b[1], b[2]); P.h.scale.y = L + 0.12; P.h.position.y = (L + 0.12) / 2;
    P.dir.set(d[0] / L, d[1] / L, d[2] / L); P.g.quaternion.setFromUnitVectors(P.up, P.dir); } }
};
