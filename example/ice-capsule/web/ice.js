// ================= "आइस चुरोटको बल" cast (appended after manjushri.js, same module scope) =================
// Plain, unbranded props only (white filter + paper). Adults only. Symbols instead of organs.

POSES.whisper = (c) => { const S = c.sh(1); return [{ pts: c.hang(-1, 0), front: false }, { pts: [S, [c.tcx + 1.15 * c.T.a + 10 * c.u, S[1] + 0.3 * c.HH], [c.tcx + 0.62 * c.T.a, c.chin - 0.1 * c.HH]], front: true }]; };
POSES.cheek = (c) => [-1, 1].map((s) => { const S = c.sh(s); return { pts: [S, [c.tcx + s * (1.1 * c.T.a + 8 * c.u), S[1] + 0.32 * c.HH], [c.tcx + s * 0.55 * c.T.a, c.chin - 0.04 * c.HH]], front: true }; });
POSES.hold = (c) => [-1, 1].map((s) => { const S = c.sh(s); return { pts: [S, [c.tcx + s * (1.1 * c.T.a + 6 * c.u), S[1] + 0.42 * c.HH], [c.tcx + s * 0.35 * c.T.a, c.chin + 0.5 * c.HH]], front: true }; });
POSES.phoneLow = (c) => { const S = c.sh(1); return [{ pts: c.hang(-1, 0), front: false }, { pts: [S, [c.tcx + 1.1 * c.T.a + 6 * c.u, S[1] + 0.45 * c.HH], [c.tcx + 0.3 * c.T.a, c.chin + 0.42 * c.HH]], front: true }]; };
POSES.tap = (c) => [-1, 1].map((s) => { const S = c.sh(s); return { pts: [S, [c.tcx + s * (1.1 * c.T.a + 6 * c.u), S[1] + 0.44 * c.HH], [c.tcx + s * 0.18 * c.T.a, c.chin + (s > 0 ? 0.42 : 0.36) * c.HH]], front: true }; });
FACE.worry = { eye: ["small", "small"], brow: [-4, 3], mouth: "frown" };
FACE.sad = { eye: ["lid", "lid"], brow: [-4, 3], mouth: "frown" };
FACE.sly = { eye: ["lid", "lid"], brow: [2, -3], mouth: "smirk" };

const mkPuff = (p, cx, cy, r, col, a) => { const g = p.g, gr = g.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(0.6, `rgba(${col},${a * 0.6})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(cx - r, cy - r, 2 * r, 2 * r); };
/** soft cloud (300 x 300): col "r,g,b", t 0..1 grows + fades, seed */
export const drawCloud = (p, col, t, seed = 0) => {
  for (let i = 0; i < 6; i++) { const a = i * 1.1 + seed, d = 18 + 60 * t, r = (60 + 16 * ((i + seed) % 3)) * (0.75 + 0.35 * t);
    mkPuff(p, 150 + d * Math.cos(a), 150 + d * 0.8 * Math.sin(a), Math.min(r, 140 - d * 0.5), col, 0.55 * (1 - t * 0.6)); }
};
/** heavy, dull smoke puff (300 x 300): lumpy grey with a dark ink rim, not pretty */
export const drawSmoke = (p, t, seed = 0) => {
  const g = p.g;
  for (let i = 0; i < 5; i++) { const a = i * 1.3 + seed, d = 22 + 40 * t, r = 46 + 10 * ((i + seed) % 3);
    p.ell(150 + d * Math.cos(a), 160 + d * 0.7 * Math.sin(a), r, r * 0.86, `rgba(92,92,100,${(0.92 - 0.4 * t).toFixed(3)})`, 0); }
  g.globalAlpha = 0.5 * (1 - t); for (let i = 0; i < 5; i++) { const a = i * 1.3 + seed, d = 22 + 40 * t, r = 46 + 10 * ((i + seed) % 3); p.arc(150 + d * Math.cos(a), 160 + d * 0.7 * Math.sin(a), r, r * 0.86, 200, 340, 4, "#4a4a52"); }
  g.globalAlpha = 1;
};

/** giant cartoon fingertip (400 x 800), pointing up; nail on the tip */
export const drawFinger = (p, thumb = false) => {
  const sk = "#e8b98e", w = thumb ? 140 : 120, top = 40;
  const pts = []; for (let i = 0; i <= 24; i++) { const a = Math.PI + (Math.PI * i) / 24; pts.push([200 + w * Math.cos(a), top + w + w * Math.sin(a)]); }
  const body = [[200 - w, 820], ...pts, [200 + w, 820]];
  p.poly(body, sk, 9);
  p.g.save(); p.path(body, true); p.g.clip(); p.poly([[200 + w * 0.45, 0], [400, 0], [400, 820], [200 + w * 0.45, 820]], "rgba(170,100,70,0.22)", 0); p.poly([[200 - w, 0], [200 - w * 0.6, 0], [200 - w * 0.6, 820], [200 - w, 820]], "rgba(255,240,220,0.35)", 0); p.g.restore();
  // nail (back of the finger faces the camera): a rounded plate from the tip down
  const nw = w * 0.62, n0 = top + 26, n1 = top + w * 1.55, nail = [];
  for (let i = 0; i <= 12; i++) { const a = Math.PI + (Math.PI * i) / 12; nail.push([200 + nw * Math.cos(a), n0 + nw * 0.9 + nw * 0.9 * Math.sin(a)]); }
  nail.push([200 + nw, n1], [200 - nw, n1]);
  p.poly(nail, "#f6d6cc", 6); p.poly([[200 - nw * 0.55, n0 + 40], [200 - nw * 0.3, n0 + 30], [200 - nw * 0.3, n1 - 30], [200 - nw * 0.55, n1 - 30]], "rgba(255,255,255,0.7)", 0);
  for (const y of [n1 + 150, n1 + 175, n1 + 330]) p.stroke([[200 - w * 0.35, y], [200 + w * 0.35, y]], 5, "rgba(150,90,60,0.55)");
};

/** the capsule crack burst (600 x 600): t 0..1 */
export const drawBurst = (p, t) => {
  const g = p.g; mkPuff(p, 300, 300, 120 + 160 * t, "200,255,230", 0.9 * (1 - t));
  g.strokeStyle = `rgba(240,255,250,${(1 - t).toFixed(3)})`; g.lineCap = "round";
  for (let i = 0; i < 10; i++) { const a = i * 0.63 + 0.2, r0 = 40 + 120 * t, r1 = r0 + 70 + 40 * (i % 3); g.lineWidth = 10 * (1 - t) + 2; g.beginPath(); g.moveTo(300 + r0 * Math.cos(a), 300 + r0 * Math.sin(a)); g.lineTo(300 + r1 * Math.cos(a), 300 + r1 * Math.sin(a)); g.stroke(); }
};
/** green capsule ball (300 x 300); crack 0..1 */
export const drawCapsule = (p, crack = 0) => {
  mkPuff(p, 150, 150, 148, "120,255,190", 0.55);
  p.ell(150, 150, 82, 82, "#2fbf7f", 7); p.ell(150, 150, 82, 82, null, 0);
  p.ell(124, 120, 30, 22, "rgba(255,255,255,0.75)", 0, 0, 360, -30); p.ell(170, 185, 46, 30, "rgba(10,90,60,0.35)", 0, 0, 360, -30);
  if (crack > 0) p.stroke([[110, 92], [134, 128], [122, 150], [150, 176], [140, 214]].slice(0, 2 + Math.round(crack * 3)), 5);
};
/** shell halves flying apart (400 x 300), t 0..1 */
export const drawShell = (p, t) => {
  for (const s of [-1, 1]) { const x = 200 + s * (30 + 120 * t), y = 150 - 40 * t + 60 * t * t; p.g.save(); p.g.translate(x, y); p.g.rotate(s * t * 1.4);
    p.ell(0, 0, 60, 60, "#2fbf7f", 6, s < 0 ? 90 : 270, s < 0 ? 270 : 450); p.g.restore(); }
};
/** mint "menthol" tag (520 x 180) */
export const drawTag = (p, text) => {
  const g = p.g; g.save(); g.font = `bold 92px ${DEVA}`; g.textAlign = "center"; g.textBaseline = "middle";
  g.lineJoin = "round"; g.lineWidth = 14; g.strokeStyle = "#0f2b2a"; g.strokeText(text, 260, 96); g.fillStyle = "#b8ffe0"; g.fillText(text, 260, 96); g.restore();
};

/** rumour bubble (500 x 420): a cradle with a red cross + "?" */
export const drawRumour = (p) => {
  const g = p.g;
  p.poly([[60, 60], [440, 60], [440, 300], [180, 300], [110, 390], [130, 300], [60, 300]], "#fffaf0", 8);
  g.save(); g.translate(250, 200); g.scale(0.42, 0.42); drawCradleShape(p, 0); g.restore();
  p.stroke([[160, 110], [340, 270]], 14, "#d23a33"); p.stroke([[340, 110], [160, 270]], 14, "#d23a33");
  g.font = "bold 90px sans-serif"; g.fillStyle = "#24408E"; g.textAlign = "center"; g.fillText("?", 400, 140);
};
export const drawCradleShape = (p, glow = 0) => {
  const wd = "#a8703c", dk = "#7a4a22";
  p.arc(0, -40, 330, 150, 20, 160, 22, dk); // rocker
  p.poly([[-250, 40], [250, 40], [280, -150], [-280, -150]], wd, 9);
  for (let i = -4; i <= 4; i++) p.stroke([[i * 56, 20], [i * 61, -140]], 8, dk);
  p.band([[-300, -160], [300, -160]], "#c08a52", 26, 8, "round");
  p.poly([[-180, -150], [180, -150], [150, -110], [-150, -110]], "#f2ecdf", 5); // blanket edge
};
/** empty wooden cradle (800 x 560), drawn so the rocker touches the bottom */
export const drawCradle = (p) => { const g = p.g; g.save(); g.translate(400, 330); drawCradleShape(p); g.restore(); };

/** bar chart (800 x 760): k 0..1 = the smoker bar rising */
export const drawChart = (p, k) => {
  const g = p.g, base = 600, h0 = 260, h1 = h0 * (1 + 0.4 * k) + 30 * Math.sin(Math.PI * Math.min(1, k * 1.2)) * 0;
  p.poly([[40, 20], [760, 20], [760, 740], [40, 740]], "rgba(255,250,240,0.94)", 7);
  p.stroke([[110, base], [700, base]], 7);
  p.poly([[160, base], [330, base], [330, base - h0], [160, base - h0]], "#8fb4c8", 6);
  p.poly([[460, base], [630, base], [630, base - h1], [460, base - h1]], "#d9533c", 6);
  if (k > 0.05) { g.save(); g.setLineDash([16, 12]); g.strokeStyle = "rgba(36,23,38,0.6)"; g.lineWidth = 5; g.beginPath(); g.moveTo(150, base - h0); g.lineTo(640, base - h0); g.stroke(); g.restore(); }
  g.font = `bold 58px ${DEVA}`; g.fillStyle = "#241726"; g.textAlign = "center"; g.fillText("नखाने", 245, base + 80); g.fillText("खाने", 545, base + 80);
  if (k > 0.3) { g.globalAlpha = Math.min(1, (k - 0.3) / 0.3); g.font = `bold 78px ${DEVA}`; g.fillStyle = "#b8281e"; g.fillText("+४०%", 545, base - h1 - 34); g.globalAlpha = 1; }
};
/** report paper (600 x 760) with "WHO" header + a source line */
export const drawReport = (p) => {
  const g = p.g;
  p.poly([[50, 30], [520, 30], [560, 80], [560, 730], [50, 730]], "#fbf8f0", 8);
  p.poly([[520, 30], [520, 80], [560, 80]], "#e2dccd", 5);
  g.fillStyle = "#2f6fb0"; g.font = "bold 110px sans-serif"; g.textAlign = "center"; g.fillText("WHO", 300, 170);
  g.font = `bold 48px ${DEVA}`; g.fillStyle = "#241726"; g.fillText("रिपोर्ट, २०२६", 300, 250);
  for (let i = 0; i < 6; i++) p.stroke([[110, 330 + i * 60], [i % 3 === 2 ? 340 : 500, 330 + i * 60]], 8, "rgba(36,23,38,0.35)");
};

/** classroom board diagram (1000 x 1200): side-view bean-head, airway, cold mist on top, smoke deeper; m = mist 0..1, d = depth 0..1 */
export const drawDiagram = (p, m, d) => {
  const g = p.g, chalk = "rgba(245,245,235,0.92)";
  p.poly([[0, 0], [1000, 0], [1000, 1200], [0, 1200]], "#8a5a32", 0);
  p.poly([[30, 30], [970, 30], [970, 1170], [30, 1170]], "#24433a", 6);
  for (let i = 0; i < 40; i++) p.ell(60 + ((i * 337) % 880), 60 + ((i * 521) % 1080), 40, 8, "rgba(255,255,255,0.025)", 0);
  // head in profile (facing left), neck, chest outline
  g.strokeStyle = chalk; g.lineWidth = 10; g.lineCap = "round"; g.lineJoin = "round";
  g.beginPath(); g.ellipse(560, 300, 200, 190, 0, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(370, 330); g.lineTo(330, 345); g.lineTo(368, 372); g.stroke(); // nose
  g.beginPath(); g.ellipse(470, 260, 14, 18, 0, 0, Math.PI * 2); g.fillStyle = chalk; g.fill(); // eye
  g.beginPath(); g.moveTo(480, 480); g.lineTo(470, 620); g.moveTo(640, 480); g.lineTo(650, 620); g.stroke(); // neck
  g.beginPath(); g.moveTo(470, 620); g.quadraticCurveTo(240, 640, 230, 900); g.lineTo(230, 1110); g.moveTo(650, 620); g.quadraticCurveTo(880, 640, 890, 900); g.lineTo(890, 1110); g.stroke();
  // airway: mouth -> throat -> chest (a simple tube)
  const air = [[390, 420], [470, 440], [540, 520], [555, 640], [560, 800], [560, 1060]];
  g.lineWidth = 64; g.strokeStyle = "rgba(255,255,255,0.10)"; g.beginPath(); air.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
  g.lineWidth = 6; g.strokeStyle = "rgba(245,245,235,0.5)"; g.setLineDash([18, 14]); g.beginPath(); air.forEach(([x, y], i) => (i ? g.lineTo(x + 32, y) : g.moveTo(x, y - 30))); g.stroke(); g.beginPath(); air.forEach(([x, y], i) => (i ? g.lineTo(x - 32, y) : g.moveTo(x, y + 30))); g.stroke(); g.setLineDash([]);
  // smoke: dark blobs travelling down the tube to depth d
  const yMax = 520 + 540 * d;
  for (let i = 0; i < 9; i++) { const y = 470 + i * 64; if (y > yMax) break; const x = y < 520 ? 470 + (y - 440) : 553; p.ell(x + ((i * 37) % 30) - 15, y, 34, 28, "rgba(70,70,78,0.95)", 0); }
  // cold mist layer on top (blue) sits over the smoke in the mouth + throat
  if (m > 0) { for (let i = 0; i < 6; i++) mkPuff(p, 410 + i * 30, 420 + i * 22, 70, "150,220,255", 0.75 * m);
    g.font = `bold 60px ${DEVA}`; g.fillStyle = `rgba(170,230,255,${m})`; g.textAlign = "left"; g.fillText("चिसो", 160, 520); }
  g.font = `bold 60px ${DEVA}`; g.fillStyle = "rgba(200,200,205,0.95)"; g.textAlign = "left"; g.fillText("धुवाँ", 650, Math.min(yMax, 1000));
  // arrow down to the depth
  if (d > 0.02) { const ya = 560 + 500 * d; g.strokeStyle = "#ffcf4a"; g.lineWidth = 14; g.beginPath(); g.moveTo(720, 560); g.lineTo(720, ya); g.stroke();
    p.poly([[690, ya - 6], [750, ya - 6], [720, ya + 46]], "#ffcf4a", 0); }
};

/** phone held in a hand, screen facing the camera (600 x 1000); scr 0 = chat with the tag, 1 = the reel (filter) */
export const drawPhoneBig = (p, tag = 0, scr = 0) => {
  const g = p.g;
  p.poly([[110, 40], [490, 40], [490, 820], [110, 820]], "#1c1c24", 10);
  const S = [[134, 80], [466, 80], [466, 780], [134, 780]];
  p.clip(S, () => {
    if (scr < 0.5) { p.poly(S, "#f4f6fa", 0);
      for (let i = 0; i < 4; i++) p.poly([[160, 130 + i * 120], [i % 2 ? 440 : 380, 130 + i * 120], [i % 2 ? 440 : 380, 210 + i * 120], [160, 210 + i * 120]], i % 2 ? "#cfe6ff" : "#e6e8ee", 0);
      if (tag > 0) { const s = tag; g.save(); g.translate(300, 650); g.scale(s, s); p.poly([[-150, -60], [150, -60], [150, 60], [-150, 60]], "#24408E", 0); g.font = `bold 64px ${DEVA}`; g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("@साथी", 0, 4); g.restore(); }
    } else { p.poly(S, "#123038", 0); mkPuff(p, 300, 430, 260, "120,255,190", 0.6); p.poly([[180, 380], [420, 380], [420, 480], [180, 480]], "#f5f2ea", 6); p.ell(300, 430, 34, 34, "#2fbf7f", 5); }
  });
  // hand under the phone
  p.poly([[60, 1000], [80, 760], [150, 700], [180, 820], [420, 820], [520, 760], [560, 1000]], "#e8b98e", 9);
  p.ell(500, 640, 46, 70, "#e8b98e", 9); // thumb tapping
};
/** "@" tag pop (300 x 300) */
export const drawTagPop = (p) => { p.ell(150, 150, 110, 110, "#24408E", 8); const g = p.g; g.font = "bold 150px sans-serif"; g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("@", 150, 160); };

// ---------- people (adults only) ----------
const ADULT = (v) => {
  const woman = v % 2 === 1;
  const o = { jacket: ["#2f6fb0", "#c0303a", "#2f7a5a", "#e2a83a", "#6a4a8a", "#3a3f52"][v % 6], pants: ["#34496e", "#2b2b38", "#5a4a3a"][v % 3], boots: "#3a2a22", skin: ["#e8b98e", "#d9a57a", "#f0c49c", "#c99067"][v % 4], hat: "hair", hair: "#1a1414" };
  if (woman) o.dress = o.jacket; else if (v % 4 === 0) o.moustache = "#2a1d18";
  return { o, woman };
};
/** standing adult. st: { v, pose:[a,b,k], expr, blink, look, back, topi } */
export const drawAdult = (p, st = {}) => {
  const v = st.v ?? 0, { o, woman } = ADULT(v), pose = st.pose ?? ["hang", "hang", 0];
  bodyFront(p, o, { mode: "stand", seed: 200 + v, expr: st.expr ?? "neutral", blink: st.blink ?? 0, look: st.look ?? 0, back: !!st.back, headTilt: st.headTilt ?? 0,
    armFn: armBlend(pose[0], pose[1], pose[2]),
    front: st.phone ? (c) => { const { p: q, u, arms } = c, [hx, hy] = arms[1].pts[2];
      q.poly([[hx - 13 * u, hy - 32 * u], [hx + 13 * u, hy - 32 * u], [hx + 13 * u, hy + 6 * u], [hx - 13 * u, hy + 6 * u]], "#22222c", 2.5 * u);
      q.poly([[hx - 9 * u, hy - 28 * u], [hx + 9 * u, hy - 28 * u], [hx + 9 * u, hy + 2 * u], [hx - 9 * u, hy + 2 * u]], "#8fd4ff", 0); q.dot(hx, hy, 5.5 * u); } : undefined,
    headExtra: (c) => { if (st.back) hairBack(p, c, o.hair, woman); else { if (woman) p.ell(c.cx + 0.42 * c.W, c.hc - 0.25 * c.HH, 22 * c.u, 20 * c.u, o.hair, 3 * c.u); if (st.topi) topi(p, c, "#2f3f6a"); } } });
};

const ICE_GOLD = GOLD, ICE_ICE = ICE, RED = ["#ffe2d8", "#ff7a5a", "#c8281e"];
/** overlay that fits its text into the card (1000 x 240) */
export const drawOverlay2 = (p, text, style = "gold") => {
  const g = p.g; g.font = `bold 110px ${DEVA}`; const w = g.measureText(text).width, s = Math.min(110, (110 * 900) / Math.max(1, w));
  glowText(g, text, 500, 120, s, style === "ice" ? ICE : style === "red" ? RED : GOLD, style === "ice" ? "rgba(140,200,255,0.95)" : style === "red" ? "rgba(255,110,80,0.95)" : "rgba(255,200,90,0.95)");
};
/** hook card (1000 x 560): "बल फुटाउँदा" (ice, capsule icon) / "बच्चा हुँदैन?" (gold); a, b reveal, j shake */
export const drawHookIce = (p, a, b, j = 0) => {
  const g = p.g;
  if (a > 0.01) { g.save(); g.globalAlpha = a; g.translate(120, 165); g.scale(0.5, 0.5); g.translate(-150, -150); drawCapsule(p, 1); g.restore();
    glowText(g, "बल फुटाउँदा", 560, 165 + 24 * (1 - a), 128, ICE, "rgba(140,220,255,0.95)", a); }
  if (b > 0.01) { const jx = j * 8 * Math.sin(j * 40); glowText(g, "बच्चा हुँदैन?", 500 + jx, 380, 150, GOLD, "rgba(255,200,90,0.95)", b); }
};

// ---------- inhalation diagram (1000 x 1300): a person with a see-through chest, windpipe, bronchi, lungs ----------
// st: { m: cold mist 0..1, d: how deep the smoke reaches 0..1, br: breath 0 (out) .. 1 (full in), ph: particle phase 0..1, cmp: show the shallow marker }
const LUNG_TIPS = [[330, 770], [700, 770], [292, 905], [722, 905], [330, 1075], [680, 1075]];
const lungPath = (k) => { const L = k % 2 === 0, sx = L ? -1 : 1, bx = 500 + sx * 78, tip = LUNG_TIPS[k];
  return [[500, 352], [500, 470], [500, 600], [500, 742], [bx, 800], [(bx + tip[0]) / 2 + sx * 10, (800 + tip[1]) / 2], tip]; };
const polyAt = (pts, u) => { const seg = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); tot += l; }
  let r = u * tot; for (let i = 0; i < seg.length; i++) { if (r <= seg[i]) { const t = r / seg[i]; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t]; } r -= seg[i]; } return pts[pts.length - 1]; };
export const drawLungs = (p, st = {}) => {
  const g = p.g, m = st.m ?? 0, d = st.d ?? 0.2, br = st.br ?? 0.3, ph = st.ph ?? 0, sk = "#e8b98e", INKc = "#241726";
  // panel
  const bg = g.createLinearGradient(0, 0, 0, 1300); bg.addColorStop(0, "#1b2b44"); bg.addColorStop(1, "#0f1a2c"); g.fillStyle = bg; g.fillRect(0, 0, 1000, 1300);
  g.strokeStyle = "rgba(255,255,255,0.05)"; g.lineWidth = 2; for (let x = 0; x <= 1000; x += 50) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 1300); g.stroke(); } for (let y = 0; y <= 1300; y += 50) { g.beginPath(); g.moveTo(0, y); g.lineTo(1000, y); g.stroke(); }
  const chest = 1 + 0.035 * br;
  // body: shoulders + torso (shirt), neck
  g.save(); g.translate(500, 640); g.scale(chest, 1); g.translate(-500, -640);
  p.poly([[180, 1300], [190, 700], [240, 610], [400, 565], [600, 565], [760, 610], [810, 700], [820, 1300]], "#3a6fb0", 9);
  g.restore();
  p.poly([[435, 470], [565, 470], [575, 590], [425, 590]], sk, 8);
  // see-through chest window
  g.save(); g.beginPath(); g.ellipse(500, 935, 300 * chest, 330, 0, 0, Math.PI * 2); g.closePath(); g.fillStyle = "#f6dcc8"; g.fill(); g.lineWidth = 7; g.strokeStyle = INKc; g.stroke(); g.clip();
  g.fillStyle = "rgba(255,255,255,0.18)"; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(500, 700 + i * 70, 260, 18, 0, Math.PI * 0.05, Math.PI * 0.95); g.lineWidth = 10; g.strokeStyle = "rgba(220,170,150,0.35)"; g.stroke(); } // ribs, faint
  // lungs (expand with the breath)
  const s = 0.9 + 0.13 * br, lob = (cx, sx) => { const pts = []; for (let i = 0; i <= 40; i++) { const a = (i / 40) * Math.PI * 2, r = 1 + 0.08 * Math.sin(3 * a); let x = Math.cos(a) * 150 * r, y = Math.sin(a) * 250 * r; if (sx * x < 0) x *= 0.55; if (y < 0) x *= 0.8 + 0.2 * (1 + y / 250); pts.push([cx + x * s, 925 + y * s + 30 * (s - 1)]); } return pts; };
  for (const [cx, sx] of [[355, 1], [645, -1]]) { const pts = lob(cx, sx); p.poly(pts, "#f0928e", 7); g.save(); p.path(pts, true); g.clip(); g.fillStyle = "rgba(255,255,255,0.22)"; g.beginPath(); g.ellipse(cx - 40 * sx, 820, 50, 120, -0.3 * sx, 0, 7); g.fill(); g.fillStyle = "rgba(150,40,50,0.18)"; g.beginPath(); g.ellipse(cx + 60 * sx, 1050, 120, 110, 0, 0, 7); g.fill(); g.restore(); }
  // diaphragm
  g.beginPath(); g.moveTo(230, 1210 + 40 * br); g.quadraticCurveTo(500, 1110 + 70 * br, 770, 1210 + 40 * br); g.lineWidth = 10; g.strokeStyle = "#c8706a"; g.stroke();
  // bronchial tree
  g.lineCap = "round"; g.lineJoin = "round";
  for (let k = 0; k < 6; k++) { const pts = lungPath(k).slice(3); g.strokeStyle = "#c2575a"; g.lineWidth = 16; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
    const tip = LUNG_TIPS[k]; for (let j = 0; j < 4; j++) { const a = j * 1.6 + k; g.lineWidth = 6; g.beginPath(); g.moveTo(tip[0], tip[1]); g.lineTo(tip[0] + 38 * Math.cos(a), tip[1] + 38 * Math.sin(a)); g.stroke(); p.ell(tip[0] + 44 * Math.cos(a), tip[1] + 44 * Math.sin(a), 11, 11, "#f6b2ae", 3); } }
  // smoke haze settling where it reached: upper always, deeper with d
  for (let k = 0; k < 6; k++) { const tip = LUNG_TIPS[k], reach = tip[1] <= 790 + 330 * d ? 1 : clamp((790 + 330 * d - tip[1] + 120) / 120, 0, 1); if (reach > 0.02) mkPuff(p, tip[0], tip[1], 95, "70,70,80", 0.75 * reach * (0.4 + 0.6 * d)); }
  g.restore();
  // windpipe (rings) from the mouth down to the split
  g.lineCap = "round"; g.strokeStyle = INKc; g.lineWidth = 56; g.beginPath(); g.moveTo(500, 380); g.lineTo(500, 745); g.stroke();
  g.strokeStyle = "#f2c4b4"; g.lineWidth = 42; g.beginPath(); g.moveTo(500, 380); g.lineTo(500, 745); g.stroke();
  for (let y = 420; y < 740; y += 28) p.stroke([[480, y], [520, y]], 5, "#d39a8c");
  for (const sx of [-1, 1]) { g.strokeStyle = INKc; g.lineWidth = 46; g.beginPath(); g.moveTo(500, 742); g.lineTo(500 + sx * 78, 800); g.stroke(); g.strokeStyle = "#f2c4b4"; g.lineWidth = 32; g.beginPath(); g.moveTo(500, 742); g.lineTo(500 + sx * 78, 800); g.stroke(); }
  // head (front view, breathing in through the open mouth)
  p.ell(500, 250, 150, 165, sk, 9);
  p.poly([[352, 220], [372, 130], [450, 88], [560, 92], [630, 135], [650, 220], [600, 168], [500, 150], [400, 170]], "#1f1816", 0);
  for (const sx of [-1, 1]) { p.stroke([[500 + sx * 78, 262], [500 + sx * 40, 262]], 9); p.stroke([[500 + sx * 82, 222], [500 + sx * 38, 214]], 8); }
  p.ell(500, 340, 30 + 8 * br, 26 + 10 * br, "#7a2a35", 7);
  // smoke coming in from the left, then particles travelling down the airway
  mkPuff(p, 250, 345, 110, "90,90,100", 0.7); mkPuff(p, 180, 300, 80, "90,90,100", 0.5);
  const limitY = 790 + 330 * d;
  for (let i = 0; i < 30; i++) { const k = i % 6, path = lungPath(k), tip = LUNG_TIPS[k], u = (ph + i * 0.137) % 1;
    let pos = polyAt(path, u); if (pos[1] > limitY) pos = polyAt(path, Math.max(0, u - 0.25)); if (pos[1] > limitY) continue;
    const a = Math.sin(Math.PI * u); p.ell(pos[0], pos[1], 13, 13, `rgba(60,60,70,${(0.85 * a + 0.1).toFixed(2)})`, 0); }
  // cold menthol mist over the mouth + throat: it numbs the feel of the smoke
  if (m > 0) { for (let i = 0; i < 6; i++) mkPuff(p, 500 + (i % 2 ? 22 : -22), 345 + i * 42, 82, "150,225,255", 0.6 * m);
    g.font = `bold 58px ${DEVA}`; g.textAlign = "right"; g.lineJoin = "round"; g.lineWidth = 10; g.strokeStyle = "#0f1a2c"; g.strokeText("चिसो मेन्थोल", 430, 440); g.fillStyle = `rgba(170,230,255,${m})`; g.fillText("चिसो मेन्थोल", 430, 440);
    g.strokeStyle = `rgba(170,230,255,${m})`; g.lineWidth = 6; g.beginPath(); g.moveTo(436, 425); g.lineTo(468, 375); g.stroke(); }
  // depth gauge (left): how far down the smoke goes
  g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(125, 640, 40, 520); const gy = 640 + 520 * clamp((limitY - 640) / 520, 0, 1);
  g.fillStyle = "#ffcf4a"; g.fillRect(125, 640, 40, gy - 640); p.poly([[105, gy - 4], [185, gy - 4], [145, gy + 40]], "#ffcf4a", 0);
  if (false) { g.strokeStyle = "rgba(255,255,255,0.7)"; g.setLineDash([12, 10]); g.lineWidth = 5; g.beginPath(); g.moveTo(80, 830); g.lineTo(870, 830); g.stroke(); g.setLineDash([]); }
  g.font = `bold 52px ${DEVA}`; g.textAlign = "left"; g.lineWidth = 9; g.strokeStyle = "#0f1a2c"; g.strokeText("धुवाँ", 618, 520); g.fillStyle = "#d8d8de"; g.fillText("धुवाँ", 618, 520);
  g.strokeStyle = "#d8d8de"; g.lineWidth = 5; g.beginPath(); g.moveTo(612, 505); g.lineTo(528, 540); g.stroke();
  if (st.deep > 0.01) { g.globalAlpha = st.deep; g.font = `bold 54px ${DEVA}`; g.textAlign = "left"; g.lineWidth = 10; g.strokeStyle = "#0f1a2c"; g.strokeText("गहिरो तान", 120, 548); g.fillStyle = "#ffcf4a"; g.fillText("गहिरो तान", 120, 548); g.globalAlpha = 1; }
};

// ---------- the filter cut open (1000 x 1400): upright tube, fibres, menthol capsule; b = burst 0..1, ph = smoke phase,
// tag = "मेन्थोल" label 0..1, cold = thermometer drop 0..1, light = "हल्का" label 0..1 ----------
const snow = (g, x, y, r, a) => { g.save(); g.globalAlpha = a; g.strokeStyle = "#e6f8ff"; g.lineWidth = Math.max(2, r * 0.18); g.lineCap = "round";
  for (let k = 0; k < 3; k++) { const t = (k * Math.PI) / 3; g.beginPath(); g.moveTo(x - r * Math.cos(t), y - r * Math.sin(t)); g.lineTo(x + r * Math.cos(t), y + r * Math.sin(t)); g.stroke();
    for (const s of [-1, 1]) { const cx = x + s * r * 0.55 * Math.cos(t), cy = y + s * r * 0.55 * Math.sin(t); g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + r * 0.3 * Math.cos(t + s * 2.4), cy + r * 0.3 * Math.sin(t + s * 2.4)); g.moveTo(cx, cy); g.lineTo(cx + r * 0.3 * Math.cos(t - s * 2.4), cy + r * 0.3 * Math.sin(t - s * 2.4)); g.stroke(); } }
  g.restore(); };
const label = (g, text, x, y, col, size = 62, align = "left", a = 1) => { if (a <= 0.01) return; g.save(); g.globalAlpha = a; g.font = `bold ${size}px ${DEVA}`; g.textAlign = align; g.textBaseline = "middle"; g.lineJoin = "round"; g.lineWidth = size * 0.2; g.strokeStyle = "#0b1d24"; g.strokeText(text, x, y); g.fillStyle = col; g.fillText(text, x, y); g.restore(); };
export const drawFilterCut = (p, st = {}) => {
  const g = p.g, b = st.b ?? 0, ph = st.ph ?? 0, X0 = 350, X1 = 770, CX = 560, Y0 = 250, Y1 = 1400, CY = 780, INKc = "#241726";
  const bg = g.createRadialGradient(CX, CY, 50, CX, CY, 900); bg.addColorStop(0, "#1d4a52"); bg.addColorStop(1, "#08171c"); g.fillStyle = bg; g.fillRect(0, 0, 1000, 1400);
  // the tube: back wall (inside, darker paper) + fibres
  p.poly([[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1]], "#d9d2c2", 0);
  g.save(); g.beginPath(); g.rect(X0, Y0, X1 - X0, Y1 - Y0); g.clip();
  const shade = g.createLinearGradient(X0, 0, X1, 0); shade.addColorStop(0, "rgba(0,0,0,0.28)"); shade.addColorStop(0.35, "rgba(0,0,0,0)"); shade.addColorStop(0.7, "rgba(0,0,0,0)"); shade.addColorStop(1, "rgba(0,0,0,0.3)"); g.fillStyle = shade; g.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
  g.lineCap = "round";
  for (let i = 0; i < 46; i++) { const x = X0 + 10 + ((i * 53) % (X1 - X0 - 20)), w = 3 + (i % 3) * 2; g.strokeStyle = i % 2 ? "rgba(255,255,255,0.75)" : "rgba(170,160,140,0.55)"; g.lineWidth = w; g.beginPath();
    for (let y = Y0; y <= Y1; y += 20) { const xx = x + 9 * Math.sin(y * 0.02 + i); y === Y0 ? g.moveTo(xx, y) : g.lineTo(xx, y); } g.stroke(); }
  // frost creeping over the fibres from the capsule
  if (b > 0) { const R = 80 + 560 * b; const fr = g.createRadialGradient(CX, CY, 0, CX, CY, R); fr.addColorStop(0, "rgba(200,240,255,0.65)"); fr.addColorStop(0.7, "rgba(170,225,255,0.35)"); fr.addColorStop(1, "rgba(170,225,255,0)"); g.fillStyle = fr; g.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
    for (let i = 0; i < 26; i++) { const a = i * 2.39, r = 40 + ((i * 97) % 520); if (r > R) continue; snow(g, CX + r * 0.55 * Math.cos(a), CY + r * Math.sin(a), 12 + (i % 3) * 5, 0.9 * Math.min(1, (R - r) / 80)); } }
  // smoke rising from the tobacco end (bottom): dark + heavy below the capsule, pale + soft above it once the menthol is out
  if (st.smoke) for (let i = 0; i < 16; i++) { const u = (ph + i / 16) % 1, y = Y1 + 60 - u * (Y1 - Y0 + 260), x = CX + 120 * Math.sin(i * 2.1 + u * 3);
    const soft = b > 0.05 ? Math.min(1, Math.max(0, (CY + 60 - y) / 160)) * Math.min(1, b * 2) : 0, r = 36 + 22 * soft + 8 * (i % 3);
    if (soft < 1) mkPuff(p, x, y, r * 1.2, "52,52,60", 0.95 * (1 - soft));
    if (soft > 0) { mkPuff(p, x, y, r * 1.45, "235,248,255", 0.95 * soft); if (i % 3 === 0) snow(g, x, y, 10, soft); } }
  g.restore();
  // capsule (menthol liquid inside) or its shell bursting
  if (b <= 0) {
    mkPuff(p, CX, CY, 260, "120,255,190", 0.45);
    p.ell(CX, CY, 125, 125, "#2fbf7f", 8);
    g.save(); g.beginPath(); g.ellipse(CX, CY, 118, 118, 0, 0, Math.PI * 2); g.clip();
    const lq = CY + 20 + 8 * Math.sin(ph * 30); g.fillStyle = "rgba(170,255,215,0.75)"; g.beginPath(); g.moveTo(CX - 130, lq); for (let x = -130; x <= 130; x += 10) g.lineTo(CX + x, lq + 6 * Math.sin(x * 0.06 + ph * 40)); g.lineTo(CX + 130, CY + 130); g.lineTo(CX - 130, CY + 130); g.fill();
    for (let k = 0; k < 5; k++) p.ell(CX - 50 + k * 25, lq + 40 + (k % 2) * 25, 7, 7, "rgba(255,255,255,0.7)", 0);
    g.restore();
    p.ell(CX - 40, CY - 48, 40, 26, "rgba(255,255,255,0.85)", 0, 0, 360, -30);
  } else {
    const t = Math.min(1, b * 1.6);
    const bl = g.createRadialGradient(CX, CY, 0, CX, CY, 140 + 420 * t); bl.addColorStop(0, `rgba(235,252,255,${0.95 * (1 - 0.5 * t)})`); bl.addColorStop(1, "rgba(170,225,255,0)"); g.fillStyle = bl; g.fillRect(0, 0, 1000, 1400);
    for (let k = 0; k < 6; k++) { const a = k * 1.05 + 0.3, d = 40 + 260 * t, x = CX + d * Math.cos(a), y = CY + d * Math.sin(a); if (t >= 1 && b > 0.9) continue;
      g.save(); g.translate(x, y); g.rotate(a + t * 2); g.globalAlpha = 1 - Math.max(0, (t - 0.6) / 0.4); p.ell(0, 0, 46, 30, "#2fbf7f", 6, 200, 340); g.restore(); }
  }
  // cut edges of the paper wrap + the open mouth end at the top (pores)
  for (const x of [X0, X1]) { p.poly([[x - 16, Y0], [x + 16, Y0], [x + 16, Y1], [x - 16, Y1]], "#f6f2e8", 6); }
  p.ell(CX, Y0, (X1 - X0) / 2 + 16, 46, "#efe9dc", 7);
  for (let i = 0; i < 40; i++) p.ell(CX - 150 + ((i * 37) % 300), Y0 - 30 + ((i * 23) % 60), 4, 3, "rgba(150,140,120,0.5)", 0);
  // pale, light wisps leaving the top once the menthol is out
  if (b > 0.2) for (let i = 0; i < 4; i++) { const u = (ph * 1.3 + i / 4) % 1; mkPuff(p, CX - 60 + i * 40 + 30 * Math.sin(u * 6), Y0 - 40 - 220 * u, 50 + 30 * u, "220,242,255", 0.7 * (1 - u) * Math.min(1, (b - 0.2) * 3)); }
  // labels (kept inside the safe area of the frame)
  if ((st.tag ?? 0) > 0.01) { const a = st.tag; g.save(); g.globalAlpha = a; g.strokeStyle = "#b8ffe0"; g.lineWidth = 6; g.beginPath(); g.restore(); label(g, "मेन्थोल", CX, CY - 185, "#b8ffe0", 70, "center", a); }
  if ((st.cold ?? 0) > 0.01 || b > 0) { const c = st.cold ?? 0, a = Math.min(1, b * 3); // thermometer
    g.save(); g.globalAlpha = a; p.poly([[200, 380], [244, 380], [244, 610], [200, 610]], "#f4f6fa", 6); p.ell(222, 640, 40, 40, c > 0.5 ? "#59b8ff" : "#e2483c", 6);
    const top = 400 + 200 * c; p.poly([[212, top], [232, top], [232, 640], [212, 640]], c > 0.5 ? "#59b8ff" : "#e2483c", 0); p.ell(222, 640, 30, 30, c > 0.5 ? "#59b8ff" : "#e2483c", 0);
    for (let k = 0; k < 5; k++) p.stroke([[244, 410 + k * 44], [262, 410 + k * 44]], 4, "#f4f6fa"); g.restore();
    label(g, "चिसो", 222, 730, "#aee4ff", 62, "center", a * Math.min(1, c * 2)); }
  if ((st.light ?? 0) > 0.01) { const a = st.light; g.save(); g.globalAlpha = a; g.strokeStyle = "#e6f6ff"; g.lineWidth = 8; g.lineCap = "round"; g.beginPath(); g.moveTo(180, 320); g.lineTo(180, 225); g.moveTo(156, 250); g.lineTo(180, 225); g.lineTo(204, 250); g.stroke(); g.restore(); label(g, "हल्का", 205, 268, "#e6f6ff", 54, "left", a); }
};
