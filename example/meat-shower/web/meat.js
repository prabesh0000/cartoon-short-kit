// ================= "The Day It Rained Meat" (kentucky-meat-shower) cast, English; appended after fx.js (same module scope) =================
// Rules (scripts/done/kentucky-meat-shower.md): cartoon meat only (pink-red chunks with a marbled fat stripe, no gore, bones or
// blood), generic 1876 farm bean-heads (Mrs. Crouch: bonnet + apron; two tasters: work shirts, braces, hats), vultures are
// funny cartoon birds, the vomit is a cartoon "blegh" with chunks. Suffix M on every name.

const INKM = "#241726";
const rndM = (i, s = 1) => { const x = Math.sin(i * 91.7 + s * 47.3) * 43758.5453; return x - Math.floor(x); };

// ---------- extra faces + poses ----------
FACE.chewA = { eye: ["lid", "lid"], brow: [1, -1], mouth: "wave" };
FACE.chewB = { eye: ["lid", "lid"], brow: [1, -1], mouth: "o" };
FACE.squint = { eye: ["squeeze", "lid"], brow: [4, -3], mouth: "wave" };
FACE.deadpan = { eye: ["lid", "lid"], brow: [2, 1], mouth: "dash" };
FACE.hum = { eye: ["happy", "happy"], brow: [-1, -2], mouth: "o" };
FACE.gape = { eye: ["dot", "dot"], brow: [-6, -5], mouth: "O" };
POSES.stirA = (c) => { const S = c.sh(1); return [{ pts: c.hang(-1, 0), front: false }, { pts: [S, [c.tcx + 1.15 * c.T.a + 10 * c.u, S[1] + 0.36 * c.HH], [c.tcx + 0.95 * c.T.a + 26 * c.u, c.torsoBot - 0.12 * c.HH]], front: true }]; };
POSES.stirB = (c) => { const S = c.sh(1); return [{ pts: c.hang(-1, 0), front: false }, { pts: [S, [c.tcx + 1.2 * c.T.a + 16 * c.u, S[1] + 0.3 * c.HH], [c.tcx + 1.25 * c.T.a + 44 * c.u, c.torsoBot - 0.22 * c.HH]], front: true }]; };
for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2;
  POSES["stirP" + i] = (c) => { const S = c.sh(1); return [{ pts: c.hang(-1, 0), front: false }, { pts: [S, [c.tcx + 1.1 * c.T.a + 12 * c.u, S[1] + 0.36 * c.HH], [c.tcx + 168 + 10 * Math.cos(a), 600 + 5 * Math.sin(a)]], front: true }]; }; }
POSES.ladleOut = (c) => { const S = c.sh(1), L = c.sh(-1); return [{ pts: [L, [c.tcx - 1.25 * c.T.a - 16 * c.u, L[1] + 0.3 * c.HH], [c.tcx - 0.88 * c.T.a, c.torsoBot - 0.28 * c.HH]], front: false },
  { pts: [S, [c.tcx + 1.15 * c.T.a + 18 * c.u, S[1] + 0.26 * c.HH], [c.tcx + 1.05 * c.T.a + 40 * c.u, S[1] + 0.08 * c.HH]], front: true }]; };
POSES.eatM = (c) => { const S = c.sh(1); return [{ pts: c.hang(-1, 0), front: false }, { pts: [S, [c.tcx + 1.05 * c.T.a + 24 * c.u, S[1] + 0.34 * c.HH], [c.tcx + 0.27 * c.W, c.chin - 0.22 * c.HH]], front: true }]; };
POSES.holdM = (c) => { const S = c.sh(1); return [{ pts: c.hang(-1, 0), front: false }, { pts: [S, [c.tcx + 1.1 * c.T.a + 22 * c.u, S[1] + 0.42 * c.HH], [c.tcx + 0.5 * c.T.a, c.chin + 0.36 * c.HH]], front: true }]; };
POSES.coverM = (c) => [-1, 1].map((s) => { const S = c.sh(s); return { pts: [S, [c.tcx + s * (1.15 * c.T.a + 14 * c.u), S[1] - 0.3 * c.HH], [c.tcx + s * 0.3 * c.T.a, c.crown - 0.02 * c.HH]], front: true }; });

// ---------- the meat (300 x 300, centred): marbled chunk, no bone, no blood ----------
const chunkPts = (cx, cy, r, seed, bites = 0) => { const pts = [], n = bites ? 40 : 11;
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, j = Math.floor((i / n) * 11), rr0 = r * (0.78 + 0.32 * rndM(j, seed)); let rr = rr0;
    for (let b = 0; b < bites; b++) { const ac = Math.PI + (b - (bites - 1) / 2) * 0.75, d = Math.abs(Math.atan2(Math.sin(a - ac), Math.cos(a - ac)));
      if (d < 0.42) rr = Math.min(rr, rr0 * (0.5 + 0.5 * (d / 0.42) ** 2)); }                                                   // scalloped bite
    pts.push([cx + Math.cos(a) * rr * 1.15, cy + Math.sin(a) * rr * 0.85]); } return pts; };
const meatAt = (p, cx, cy, r, seed = 1, lw = 6, glint = -1, bites = 0) => {
  const pts = chunkPts(cx, cy, r, seed, bites);
  p.poly(pts, "#d9505a", lw);
  const g = p.g; g.save(); g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
  g.fillStyle = "#b8363f"; g.beginPath(); g.ellipse(cx + r * 0.25, cy + r * 0.3, r * 0.9, r * 0.5, 0.3, 0, Math.PI * 2); g.fill();      // darker lean
  g.strokeStyle = "#fbe9dc"; g.lineCap = "round"; g.lineWidth = r * 0.16;                                                              // fat stripe
  g.beginPath(); g.moveTo(cx - r * 1.2, cy - r * 0.2); g.bezierCurveTo(cx - r * 0.3, cy - r * 0.7, cx + r * 0.3, cy + r * 0.2, cx + r * 1.2, cy - r * 0.3); g.stroke();
  g.lineWidth = r * 0.05; for (let k = 0; k < 4; k++) { const x0 = cx - r * 0.7 + k * r * 0.45 * (0.8 + 0.4 * rndM(k, seed + 3)), y0 = cy + r * 0.15 + r * 0.25 * rndM(k, seed);
    g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + r * 0.15, y0 - r * 0.15, x0 + r * 0.3, y0 + r * 0.02); g.stroke(); }                 // marbling
  if (glint >= 0) { const x = cx - r * 1.6 + 3.2 * r * glint, gr = g.createLinearGradient(x - r * 0.3, cy - r, x + r * 0.3, cy + r);
    gr.addColorStop(0, "rgba(255,250,235,0)"); gr.addColorStop(0.5, "rgba(255,250,235,0.85)"); gr.addColorStop(1, "rgba(255,250,235,0)"); g.fillStyle = gr; g.fillRect(cx - r * 1.4, cy - r * 1.2, r * 2.8, r * 2.4); }
  g.restore();
  p.ell(cx - r * 0.45, cy - r * 0.35, r * 0.18, r * 0.1, "rgba(255,255,255,0.55)", 0);                                                  // shine
};
export const drawMeatM = (p, seed = 1, glint = -1) => meatAt(p, 150, 150, 92, seed, 7, glint);
/** a handful of small chunks (vomit spray / rain streak), 600 x 600, k = spread 0..1 */
export const drawChunkSprayM = (p, k = 1, seed = 1) => { for (let i = 0; i < 9; i++) { const a = -0.6 + 1.2 * rndM(i, seed), d = 60 + 420 * k * (0.5 + 0.5 * rndM(i + 9, seed));
  meatAt(p, 80 + Math.cos(a) * d, 300 + Math.sin(a) * d * 0.8 + 140 * k * k, 26 + 12 * rndM(i, seed + 5), seed + i, 4); } };

// ---------- people ----------
const OUT_CROUCH = { jacket: "#5f86b5", dress: "#5f86b5", pants: "#2b2b38", boots: "#4a3020", skin: "#f0c49c", hat: "bonnet", hair: "#7a5232" };
const OUT_FA = { jacket: "#e7dcc0", pants: "#4b5d82", boots: "#4a3020", skin: "#e8b98e", hat: "hair", hair: "#6a4a2a", moustache: "#5a3a22" };
const OUT_FB = { jacket: "#b2483e", pants: "#6a4a32", boots: "#3a2618", skin: "#d9a57a", hat: "hair", hair: "#2a1d18", moustache: "#2a1d18", build: "stout" };
const apronM = (p, c) => { const { tcx, T, HH, chin, u, torsoBot } = c;
  p.poly([[tcx - 0.55 * T.a, chin + 0.3 * HH], [tcx + 0.55 * T.a, chin + 0.3 * HH], [tcx + 0.75 * T.a, torsoBot + 0.55 * HH], [tcx - 0.75 * T.a, torsoBot + 0.55 * HH]], "#f6f1e4", 2.4 * u);
  p.stroke([[tcx - 0.55 * T.a, chin + 0.3 * HH], [tcx - 0.62 * T.a, chin + 0.02 * HH]], 3 * u, "#e6dccb"); p.stroke([[tcx + 0.55 * T.a, chin + 0.3 * HH], [tcx + 0.62 * T.a, chin + 0.02 * HH]], 3 * u, "#e6dccb");
  p.poly([[tcx - 0.3 * T.a, torsoBot + 0.0 * HH], [tcx + 0.3 * T.a, torsoBot], [tcx + 0.28 * T.a, torsoBot + 0.2 * HH], [tcx - 0.28 * T.a, torsoBot + 0.2 * HH]], "#ece4d2", 1.6 * u); };
const bracesM = (p, c, col) => { const { tcx, T, HH, chin, u, torsoBot } = c;
  for (const s of [-1, 1]) p.band([[tcx + s * 0.42 * T.a, chin + 0.02 * HH], [tcx + s * 0.36 * T.a, torsoBot + 0.02 * HH]], col, 5 * u, 1.4 * u); };
/** wide-brim farm hat drawn over the head (straw or felt) */
const farmHatM = (p, c, col, band) => { const { cx, crown, W, HH, u } = c, y = crown + 0.13 * HH;
  p.ell(cx, y, 0.86 * W, 0.12 * HH, col, 3 * u);
  p.poly([[cx - 0.42 * W, y], [cx - 0.36 * W, crown - 0.1 * HH], [cx + 0.36 * W, crown - 0.1 * HH], [cx + 0.42 * W, y]], col, 3 * u);
  p.band([[cx - 0.41 * W, y - 0.05 * HH], [cx + 0.41 * W, y - 0.05 * HH]], band, 0.07 * HH, 1.2 * u); };
const ladleM = (p, c, chunk) => { const a = c.arms[1]; if (!a) return; const [hx, hy] = a.pts[2], u = c.u, out = c.ladleOut;
  const tip = out ? [hx + 62 * u, hy - 16 * u] : [hx - 30 * u, hy + 150 * u];
  p.band([[hx - (out ? 18 : -6) * u, hy - (out ? 2 : 22) * u], tip], "#a8743e", 7 * u, 1.6 * u, "round");
  p.ell(tip[0] + (out ? 22 : -4) * u, tip[1] + (out ? -4 : 14) * u, 26 * u, 16 * u, "#8a5a2e", 2.4 * u);
  if (chunk > 0) meatAt(p, tip[0] + 22 * u, tip[1] - 18 * u, 26 * u * chunk, 7, 2.4 * u); };
/** Mrs. Crouch on an 800 x 1000 card (body centred at x 400, room for the held-out ladle) */
export const drawCrouchM = (p, st = {}) => { const pose = st.pose ?? ["stirA", "stirB", 0]; p.g.translate(100, 0);
  bodyFront(p, OUT_CROUCH, { mode: "stand", lift: 34, seed: 1876, expr: st.expr ?? "hum", blink: st.blink ?? 0, look: st.look ?? 0, headTilt: st.headTilt ?? 0, facing: st.facing ?? 0,
    armFn: armBlend(pose[0], pose[1], pose[2]),
    front: (c) => { apronM(p, c); if (st.ladle !== false) ladleM(p, { ...c, ladleOut: pose[0] === "ladleOut" || (pose[1] === "ladleOut" && pose[2] > 0.5) }, st.chunk ?? 0); },
    headExtra: (c) => { if (st.sweat) sweat(p, c, st.sweat); } });
};
FACE.chewSqA = { eye: ["squeeze", "lid"], brow: [4, -3], mouth: "wave" };
FACE.chewSqB = { eye: ["squeeze", "lid"], brow: [4, -3], mouth: "o" };
FACE.bite = { eye: ["dot", "dot"], brow: [-4, -3], mouth: "O" };
/** st: { pose:[a,b,k], expr, blink, look, chunk, bites (notches), cheek 0..1 (chewing bulge), crumbs 0..1 (falling after a chomp) } */
export const drawFarmerM = (p, who = "a", st = {}) => { const o = who === "a" ? OUT_FA : OUT_FB, pose = st.pose ?? ["hang", "hang", 0]; let hand = null;
  bodyFront(p, o, { mode: st.mode ?? "stand", phase: st.phase ?? 0, lift: 34, seed: who === "a" ? 1877 : 1878, expr: st.expr ?? "neutral", blink: st.blink ?? 0, look: st.look ?? 0, headTilt: st.headTilt ?? 0, facing: st.facing ?? 0,
    armFn: armBlend(pose[0], pose[1], pose[2]),
    front: (c) => { bracesM(p, c, who === "a" ? "#7a4a2a" : "#2a2a34"); hand = c.arms[1] ? c.arms[1].pts[2] : null; },
    headExtra: (c) => { const u = c.u;
      if (st.cheek > 0) { const x = c.cx - 0.36 * c.W, y = c.hc + 0.26 * c.HH, r = 0.1 * c.W * st.cheek;                     // full cheek while chewing
        p.ell(x, y, r, r * 0.9, o.skin, 0); p.arc(x, y, r, r * 0.9, 110, 250, 2.4 * u); }
      if (st.chunk && hand) meatAt(p, hand[0] + 8 * u, hand[1] - 2 * u, 22 * u, who === "a" ? 3 : 5, 2.2 * u, -1, st.bites ?? 0);
      if (st.crumbs > 0 && st.crumbs < 1) for (let k = 0; k < 4; k++) { const t = st.crumbs, x = c.cx + 0.12 * c.W + (k - 1.5) * 9 * u, y = c.hc + 0.34 * c.HH + (40 + 30 * k) * u * t * t;
        p.ell(x + 6 * u * t * (k % 2 ? 1 : -1), y, 3.5 * u, 3 * u, k % 2 ? "#d9505a" : "#f2c9b8", 0.8 * u); }
      farmHatM(p, c, who === "a" ? "#e6c46a" : "#5a4030", who === "a" ? "#8a4a2a" : "#2a1a12"); if (who === "b") p.ell(c.cx, c.chin - 0.02 * c.HH, 0.34 * c.W, 0.12 * c.HH, "rgba(42,29,24,0.85)", 0); } });
};

// ---------- the chicken (400 x 400, soles at y 380) ----------
export const drawChickenM = (p, st = {}) => { const ph = st.ph ?? 0, fl = st.flap ?? 0, sq = st.squawk ?? 0, hop = 30 * fl, f = st.facing ?? 1;
  const g = p.g; g.save(); if (f < 0) { g.translate(400, 0); g.scale(-1, 1); }
  const by = 250 - hop;
  for (const s of [-1, 1]) { const k = Math.sin(ph * Math.PI * 2 + (s > 0 ? Math.PI : 0)) * 14; p.stroke([[200 + s * 22, by + 50], [200 + s * 22 + k, 375 - hop * 0.3]], 7, "#e8a03a"); p.stroke([[200 + s * 22 + k - 14, 378 - hop * 0.3], [200 + s * 22 + k + 18, 378 - hop * 0.3]], 6, "#e8a03a"); }
  p.ell(195, by, 95, 72, "#fbfaf4", 6);
  p.poly([[110, by - 20], [70, by - 70 - 20 * fl], [95, by - 10]], "#fbfaf4", 5);                                            // tail
  const wa = fl * 40; p.poly([[170, by - 20], [250, by - 10 - wa], [235, by + 30]], "#efeadc", 5);                          // wing
  p.ell(275, by - 75, 48, 46, "#fbfaf4", 6);                                                                                 // head
  p.poly([[262, by - 118], [272, by - 140], [284, by - 122], [296, by - 138], [302, by - 112]], "#e0453a", 4);               // comb
  p.poly([[318, by - 80], [358, by - 72 + 10 * sq], [318, by - 64]], "#f0b030", 4);                                           // beak
  if (sq > 0.3) p.poly([[318, by - 68], [352, by - 52], [318, by - 60]], "#f0b030", 4);
  p.ell(312, by - 50, 10, 14, "#e0453a", 3);
  p.ell(290, by - 86, 7, sq > 0.3 ? 9 : 6, INKM, 0);
  g.restore();
};

// ---------- vultures (800 x 800, centred): funny, bald pink head, white ruff, big wings ----------
export const drawVultureM = (p, st = {}) => { const fl = Math.sin((st.flap ?? 0) * Math.PI * 2), gag = st.gag ?? 0, f = st.facing ?? 1, bl = st.blink ?? 0;
  const g = p.g; g.save(); if (f < 0) { g.translate(800, 0); g.scale(-1, 1); }
  const wy = -90 * fl;                                                                                                        // wing tip lift
  for (const s of [-1, 1]) {
    const tip = [400 + s * 380, 330 + wy], mid = [400 + s * 220, 360 + wy * 0.55];
    const pts = [[400 + s * 60, 380], mid, tip];
    for (let k = 0; k < 5; k++) pts.push([tip[0] - s * (28 + k * 34), tip[1] + 40 + k * 18 + (k % 2) * 16]);                 // finger feathers
    pts.push([400 + s * 70, 450]);
    p.poly(pts, "#3a2c28", 7);
    p.stroke([[400 + s * 90, 400], [mid[0] + s * 20, mid[1] + 24]], 5, "#5a4840");
  }
  p.ell(400, 430, 95, 120, "#3f302b", 7);                                                                                     // body
  p.poly([[360, 540], [400, 610], [440, 540]], "#2e2220", 6);                                                                  // tail
  p.ell(400, 330, 74, 40, "#f4efe6", 6);                                                                                      // ruff
  const hx = 410, hy = 262 - 6 * gag;
  p.ell(hx, hy, 58, 54, gag > 0.2 ? "#d9a8a0" : "#e99a92", 6);                                                                // bald head
  if (gag > 0.2) { const gg = g.createRadialGradient(hx, hy + 20, 4, hx, hy + 20, 60); gg.addColorStop(0, `rgba(150,200,90,${0.7 * gag})`); gg.addColorStop(1, "rgba(150,200,90,0)"); g.fillStyle = gg; g.fillRect(hx - 60, hy - 40, 120, 110); }
  const open = gag > 0.5 ? 1 : 0;
  p.poly([[hx + 40, hy - 8], [hx + 100, hy + 2], [hx + 108, hy + 22], [hx + 92, hy + 18], [hx + 44, hy + 14]], "#efe2c0", 5);   // upper beak (hooked)
  if (open) p.poly([[hx + 44, hy + 20], [hx + 92, hy + 40 + 20 * gag], [hx + 40, hy + 34]], "#e6d6b0", 5);                   // lower beak open
  if (gag > 0.5) { p.ell(hx - 14, hy - 10, 12, 4, INKM, 0); p.stroke([[hx + 4, hy - 20], [hx + 22, hy - 12], [hx + 4, hy - 4]], 4, INKM); }  // squeezed eyes
  else if (bl > 0.5) p.stroke([[hx - 4, hy - 10], [hx + 22, hy - 10]], 4, INKM);
  else { p.ell(hx + 10, hy - 12, 13, 15, "#ffffff", 4); p.ell(hx + 14, hy - 10, 6, 7, INKM, 0); }
  p.stroke([[hx - 6, hy - 34 - 4 * gag], [hx + 26, hy - 28]], 4, INKM);                                                       // brow
  for (const s of [-1, 1]) p.stroke([[400 + s * 30, 540], [400 + s * 38, 590]], 6, "#cfbfa0");                                 // legs tucked
  g.restore();
  if (st.spew > 0) { g.save(); const sx = f > 0 ? 515 : 285; g.translate(sx, 300); if (f < 0) g.scale(-1, 1);
    for (let i = 0; i < 8; i++) { const t = st.spew, a = 0.15 + 0.85 * rndM(i, 4), d = 20 + 330 * t * (0.4 + 0.6 * rndM(i + 3, 4));
      meatAt(p, Math.cos(a) * d * 0.6, Math.sin(a) * d + 120 * t * t, 13 + 7 * rndM(i, 6), i + 2, 3); }
    g.restore(); }
};

// ---------- thought bubble (700 x 600): a lamb or a deer + "?" ----------
const lambM = (p, x, y, s) => { for (let i = 0; i < 7; i++) p.ell(x - 70 * s + (i % 4) * 46 * s, y - 20 * s + Math.floor(i / 4) * 40 * s, 40 * s, 36 * s, "#fbfaf4", 4 * s);
  p.ell(x + 110 * s, y - 30 * s, 36 * s, 30 * s, "#3a3230", 4 * s); p.ell(x + 96 * s, y - 52 * s, 16 * s, 9 * s, "#3a3230", 3 * s); p.dot(x + 118 * s, y - 36 * s, 4 * s, "#ffffff");
  for (const dx of [-60, -20, 30, 70]) p.stroke([[x + dx * s, y + 40 * s], [x + dx * s, y + 90 * s]], 9 * s, "#3a3230"); };
const deerM = (p, x, y, s) => { p.ell(x, y + 10 * s, 70 * s, 82 * s, "#b07a48", 5 * s); p.ell(x, y + 70 * s, 34 * s, 26 * s, "#e8d2b0", 4 * s); p.dot(x, y + 60 * s, 9 * s, INKM);
  for (const sx of [-1, 1]) { p.ell(x + sx * 72 * s, y - 30 * s, 34 * s, 16 * s, "#b07a48", 4 * s);
    p.stroke([[x + sx * 30 * s, y - 64 * s], [x + sx * 60 * s, y - 130 * s], [x + sx * 96 * s, y - 160 * s]], 9 * s, "#8a6038"); p.stroke([[x + sx * 52 * s, y - 112 * s], [x + sx * 30 * s, y - 150 * s]], 8 * s, "#8a6038"); }
  p.dot(x - 26 * s, y - 4 * s, 7 * s, INKM); p.dot(x + 26 * s, y - 4 * s, 7 * s, INKM); };
export const drawBubbleM = (p, kind = "lamb", k = 1) => { const g = p.g; g.save(); g.globalAlpha = Math.min(1, k * 1.4);
  const s = 0.6 + 0.4 * k, cx = 380, cy = 250;
  for (const [x, y, r] of [[-170, 0, 120], [-60, -90, 130], [80, -95, 125], [190, -10, 115], [80, 80, 130], [-80, 85, 125]]) p.ell(cx + x * s, cy + y * s, r * s, r * 0.85 * s, "#ffffff", 6);
  p.ell(cx, cy, 270 * s, 160 * s, "#ffffff", 0);
  p.ell(150, 470, 34 * s, 28 * s, "#ffffff", 5); p.ell(95, 545, 20 * s, 17 * s, "#ffffff", 4);
  if (kind === "lamb") lambM(p, cx - 20, cy + 10, 0.9 * s); else deerM(p, cx - 20, cy + 20, 0.85 * s);
  drawQ(p, cx + 200 * s, cy - 60 * s, 110 * s, "#e05a3a");
  g.restore(); };

// ---------- the kettle fire (300 x 300) ----------
export const drawFireM = (p, t = 0) => { for (let i = 0; i < 5; i++) { const x = 70 + i * 40, h = 90 + 50 * Math.sin(t * 6.28 * 2 + i * 1.7);
  p.poly([[x - 26, 270], [x - 8, 270 - h * 0.6], [x, 270 - h], [x + 10, 270 - h * 0.55], [x + 26, 270]], i % 2 ? "#ffb23a" : "#ff7a2a", 4);
  p.poly([[x - 12, 270], [x, 270 - h * 0.5], [x + 12, 270]], "#ffe58a", 0); }
  for (const [x0, x1] of [[40, 260], [60, 240]]) p.band([[x0, 280], [x1, 268]], "#6a4426", 16, 3); };
/** steam (300 x 300): soft white puffs rising, t loops */
export const drawSteamM = (p, t = 0) => { for (let i = 0; i < 4; i++) { const u = (t + i / 4) % 1, r = 26 + 46 * u;
  p.ell(150 + 30 * Math.sin(u * 6 + i), 260 - 220 * u, r, r * 0.8, `rgba(255,255,255,${(0.75 * (1 - u)).toFixed(3)})`, 0); } };
/** the channel's "?" (300 x 300) */
export const drawHookQM = (p, k = 1) => drawQ(p, 150, 150, 200 * k, "#ffffff");

/** soap splash (800 x 800): the toon splash recoloured to warm soap foam */
export const drawSoapSplashM = (p, t) => { fxSplash(p, t); const g = p.g; g.save(); g.globalCompositeOperation = "source-atop"; g.fillStyle = "rgba(244,228,196,0.82)"; g.fillRect(0, 0, 800, 800); g.restore(); };
/** puffy cloud (512 x 256): white blobs, soft blue-grey underside */
export const cloudCanvasM = (seed = 0) => { const c = document.createElement("canvas"); c.width = 512; c.height = 256; const g = c.getContext("2d");
  const blobs = []; for (let i = 0; i < 7; i++) blobs.push([90 + i * 55 + rndM(i, seed) * 20, 150 - 60 * Math.sin((i / 6) * Math.PI) * (0.7 + 0.5 * rndM(i + 3, seed)), 48 + 34 * Math.sin((i / 6) * Math.PI) + 10 * rndM(i + 5, seed)]);
  g.fillStyle = "#c9d9ec"; for (const [x, y, r] of blobs) { g.beginPath(); g.arc(x, y + 10, r, 0, Math.PI * 2); g.fill(); } g.fillRect(90, 150, 330, 50);
  g.fillStyle = "#ffffff"; for (const [x, y, r] of blobs) { g.beginPath(); g.arc(x, y, r * 0.96, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = "#c9d9ec"; g.beginPath(); g.ellipse(256, 196, 190, 16, 0, 0, Math.PI * 2); g.fill();
  return c; };
