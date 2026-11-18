// ================= Manjushri-lake cast (appended after nepal.js + mascot.js, same module scope): back-view deity with flaming sword + halo (drawManjushri), lotus, slashes, glowing crack + cracked rock, fish, bubbles, god rays, phone walker, modern pedestrians, scientist with magnifier (drawScientist), glowing Devanagari overlays (drawOverlay), hook question card (drawHook), seismograph trace (drawSeismo). =================
// Manjushri (back view only: golden robe, blue-green scarf, five-point crown, topknot, flaming sword + halo),
// lotus, slash arc, crack, fish, bubbles, phone walker, modern pedestrians, overlay text.

POSES.swordUp = (c) => { const S = c.sh(1); return [{ pts: c.hang(-1, 0), front: false }, { pts: [S, [c.tcx + 1.2 * c.T.a + 18 * c.u, S[1] - 0.42 * c.HH], [c.tcx + 0.9 * c.T.a + 16 * c.u, c.crown - 0.35 * c.HH]], front: true }]; };
POSES.strike = (c) => { const S = c.sh(1); return [{ pts: c.hang(-1, 0), front: false }, { pts: [S, [c.tcx + 1.3 * c.T.a + 34 * c.u, S[1] + 0.1 * c.HH], [c.tcx + 1.4 * c.T.a + 78 * c.u, S[1] + 0.42 * c.HH]], front: true }]; };
POSES.magL = (c) => { const S = c.sh(-1); return [{ pts: [S, [c.tcx - 1.15 * c.T.a - 16 * c.u, S[1] + 0.2 * c.HH], [c.tcx - 1.0 * c.T.a - 34 * c.u, c.chin - 0.05 * c.HH]], front: true }, { pts: c.hang(1, 0), front: false }]; };
POSES.phone = (c) => { const S = c.sh(1); return [{ pts: c.hang(-1, 0), front: false }, { pts: [S, [c.tcx + 1.12 * c.T.a + 6 * c.u, S[1] + 0.42 * c.HH], [c.tcx + 0.25 * c.T.a, c.chin + 0.26 * c.HH]], front: true }]; };

/** flaming sword (Chandrahasa) drawn from hilt point (x,y), angle a (rad, 0 = up), length L */
const flameSword = (p, x, y, a, L, glow = 1) => {
  const g = p.g; g.save(); g.translate(x, y); g.rotate(a);
  // flame aura around the blade
  if (glow > 0) {
    const gr = g.createRadialGradient(0, -L * 0.55, 10, 0, -L * 0.55, L * 0.7);
    gr.addColorStop(0, `rgba(255,236,160,${0.75 * glow})`); gr.addColorStop(0.5, `rgba(255,170,60,${0.35 * glow})`); gr.addColorStop(1, "rgba(255,150,40,0)");
    g.fillStyle = gr; g.beginPath(); g.ellipse(0, -L * 0.55, L * 0.32, L * 0.7, 0, 0, Math.PI * 2); g.fill();
  }
  const w = L * 0.045;
  // flames licking along the blade
  for (let i = 0; i < 9; i++) {
    const t = 0.18 + i * 0.09, s = i % 2 ? 1 : -1, fy = -L * t, fh = L * (0.13 + 0.04 * Math.sin(i * 2.1));
    p.poly([[s * w * 0.6, fy + fh * 0.2], [s * (w * 3.4 + 6), fy - fh * 0.35], [s * w * 1.6, fy - fh], [s * w * 0.4, fy - fh * 0.5]], i % 3 === 0 ? "#ffb02e" : "#ff7a1c", 3);
  }
  p.poly([[0, -L * 1.06], [w * 1.6, -L * 0.98], [w, -L * 0.14], [0, -L * 0.1], [-w, -L * 0.14], [-w * 1.6, -L * 0.98]], "#f4f2ea", 4); // blade
  p.stroke([[0, -L * 1.0], [0, -L * 0.16]], 3, "#b8c2cc");
  p.band([[-w * 3.4, -L * 0.13], [w * 3.4, -L * 0.13]], "#e3b23c", 9, 3, "round"); // guard
  p.band([[0, -L * 0.12], [0, L * 0.03]], "#7a3a1c", 9, 3, "round"); // grip
  p.dot(0, L * 0.05, 8, "#e3b23c");
  // flame tip
  p.poly([[0, -L * 1.25], [w * 2.2, -L * 1.06], [0, -L * 0.98], [-w * 2.2, -L * 1.06]], "#ffd24a", 3);
  g.restore();
};

/** Manjushri from behind. design [1400,1400]; st: { pose:[a,b,k], glow 0..1, swordAng (rad), sword: bool } */
export const drawManjushri = (p, st = {}) => {
  const g = p.g, glow = st.glow ?? 0.6;
  // halo / aura behind everything
  g.save(); g.translate(700, 760); g.scale(1, 1.45);
  const gr = g.createRadialGradient(0, 0, 30, 0, 0, 330);
  gr.addColorStop(0, `rgba(255,236,170,${0.75 * glow})`); gr.addColorStop(0.5, `rgba(255,205,110,${0.32 * glow})`); gr.addColorStop(1, "rgba(255,205,110,0)");
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 330, 0, Math.PI * 2); g.fill(); g.restore();
  g.save(); g.translate(400, 390);
  const o = { jacket: "#e8a432", pants: "#d88a2a", boots: "#e0aa7a", skin: "#e8b98e", dress: "#e89a2c", hat: "hair", hair: "#22305a" };
  const pose = st.pose ?? ["swordUp", "swordUp", 1];
  let hand = null;
  bodyFront(p, o, { mode: "stand", seed: 21, back: true, facing: 0,
    armFn: (ctx) => { armBlend(pose[0], pose[1], pose[2])(ctx); hand = ctx.arms[1] ? ctx.arms[1].pts[2] : null; },
    behind: (c) => { // scarf ends flowing behind the shoulders
      const { p: q, tcx, T, chin, HH, u } = c;
      q.band([[tcx - 0.9 * T.a, chin + 0.1 * HH], [tcx - 1.5 * T.a, chin + 0.7 * HH], [tcx - 1.9 * T.a, chin + 1.4 * HH]], "#2f8a7a", 16 * u, 3 * u, "round");
      q.band([[tcx + 0.9 * T.a, chin + 0.1 * HH], [tcx + 1.4 * T.a, chin + 0.8 * HH], [tcx + 1.7 * T.a, chin + 1.5 * HH]], "#2f6fb0", 16 * u, 3 * u, "round");
    },
    front: (c) => { // scarf draped across the back + a jewelled belt
      const { p: q, tcx, T, chin, HH, u, torsoBot } = c;
      q.band([[tcx - 1.0 * T.a, chin + 0.12 * HH], [tcx, chin + 0.3 * HH], [tcx + 1.0 * T.a, chin + 0.1 * HH]], "#2f8a7a", 11 * u, 2.5 * u, "round");
      q.band([[tcx - 1.0 * T.a, torsoBot - 0.05 * HH], [tcx + 1.0 * T.a, torsoBot - 0.05 * HH]], "#c8323e", 8 * u, 2 * u, "round");
      for (let i = -2; i <= 2; i++) q.dot(tcx + i * 14 * u, torsoBot - 0.05 * HH, 3 * u, "#f2c23c");
      if (hand && st.sword !== false) flameSword(q, hand[0], hand[1], st.swordAng ?? 0.1, 1.75 * HH, glow);
    },
    headExtra: (c) => {
      const { cx, hc, H, HH, u, crown } = c;
      hairBack(p, c, "#22305a", false);
      // topknot (ushnisha) with a jewel
      p.ell(cx, crown + 0.02 * HH, 26 * u, 22 * u, "#22305a", 4 * u);
      p.dot(cx, crown - 0.08 * HH, 6 * u, "#f2c23c");
      // five-point golden crown band (back of the crown)
      const yb = crown + 0.3 * HH;
      const pts = [[cx - 54 * u, yb]];
      for (let i = 0; i < 5; i++) { const x = cx - 44 * u + i * 22 * u; pts.push([x - 10 * u, yb - 0.08 * HH], [x, yb - (i === 2 ? 0.3 : 0.22) * HH], [x + 10 * u, yb - 0.08 * HH]); }
      pts.push([cx + 54 * u, yb]);
      p.poly(pts, "#f0c63c", 4 * u);
      for (let i = 0; i < 5; i++) p.dot(cx - 44 * u + i * 22 * u, yb - 0.12 * HH, 4.5 * u, i % 2 ? "#2f8a7a" : "#d23a33");
      p.band([[cx - 56 * u, yb + 2 * u], [cx + 56 * u, yb + 2 * u]], "#f0c63c", 8 * u, 2 * u, "round");
      // crown ribbons
      for (const s of [-1, 1]) p.band([[cx + s * 50 * u, yb + 4 * u], [cx + s * 60 * u, yb + 0.5 * HH], [cx + s * 74 * u, yb + 0.95 * HH]], "#d23a33", 6 * u, 1.5 * u, "round");
    } });
  g.restore();
};

/** lotus in bloom (600 x 420); open 0..1, glow 0..1 */
export const drawLotus = (p, open = 1, glow = 1) => {
  const g = p.g;
  if (glow > 0) { const gr = g.createRadialGradient(300, 250, 10, 300, 250, 200); gr.addColorStop(0, `rgba(255,240,190,${0.9 * glow})`); gr.addColorStop(1, "rgba(255,220,160,0)"); g.fillStyle = gr; g.beginPath(); g.arc(300, 250, 200, 0, Math.PI * 2); g.fill(); }
  p.ell(300, 360, 250, 44, "#3f8a4a", 5); p.ell(300, 352, 200, 26, "#5aa85a", 0);  // pad
  const petal = (ang, len, wid, col) => { const a = ang * Math.PI / 180, tx = 300 + Math.sin(a) * len, ty = 330 - Math.cos(a) * len;
    const nx = Math.cos(a) * wid, ny = Math.sin(a) * wid;
    p.poly([[300, 330], [300 + Math.sin(a) * len * 0.5 + nx, 330 - Math.cos(a) * len * 0.5 + ny], [tx, ty], [300 + Math.sin(a) * len * 0.5 - nx, 330 - Math.cos(a) * len * 0.5 - ny]], col, 4.5); };
  const sp = 0.35 + 0.65 * open;
  for (const a of [-80, 80, -60, 60]) petal(a * sp, 150, 34, "#f2a8bf");
  for (const a of [-38, 38, -18, 18]) petal(a * sp, 175, 36, "#f7c0d0");
  petal(0, 185, 38, "#fbd6e0");
  p.ell(300, 300, 34, 18, "#f2c23c", 4);
};

/** additive slash arc (800 x 800), t 0..1 sweep */
export const drawSlash = (p, t) => {
  const g = p.g, a0 = -2.4, a1 = a0 + 2.6 * t;
  for (let k = 0; k < 3; k++) { g.strokeStyle = ["rgba(255,200,90,0.35)", "rgba(255,236,170,0.7)", "rgba(255,255,240,1)"][k]; g.lineWidth = [70, 34, 12][k]; g.lineCap = "round";
    g.beginPath(); g.arc(400, 400, 320, a0, a1); g.stroke(); }
};

/** jagged glowing crack (400 x 1000), k 0..1 how far it has run down */
export const drawCrack = (p, k) => {
  const pts = [[200, 40]]; let x = 200;
  for (let i = 1; i <= 14; i++) { x += (Math.sin(i * 7.3) * 0.5) * 70; pts.push([Math.max(60, Math.min(340, x)), 40 + i * 66]); }
  const n = Math.max(2, Math.round(pts.length * k)), seg = pts.slice(0, n);
  p.stroke(seg, 34, "rgba(255,150,60,0.45)"); p.stroke(seg, 14, "#ffcf6a"); p.stroke(seg, 5, "#fff6d8");
  for (let i = 3; i < n; i += 4) p.stroke([seg[i], [seg[i][0] + (i % 8 ? 50 : -50), seg[i][1] + 40]], 6, "#ffcf6a");
};

/** dark rock with a glowing crack, for the last shot (700 x 640) */
export const drawCrackRock = (p, k = 1) => {
  const r = [[60, 620], [40, 420], [120, 220], [260, 90], [420, 60], [560, 160], [650, 360], [660, 620]];
  p.poly(r, "#7a6a5c", 7);
  p.clip(r, () => { p.poly([[360, 60], [700, 60], [700, 640], [430, 640]], "#5e5048", 0); for (let i = 0; i < 6; i++) p.stroke([[80 + i * 100, 640], [140 + i * 90, 260 + (i % 2) * 80]], 4, "rgba(40,30,30,0.35)"); });
  p.poly(r, null, 7);
  p.ell(200, 160, 50, 18, "#6f9e46", 4); p.ell(470, 90, 60, 20, "#6f9e46", 4); // moss on top
  const g = p.g; g.save(); g.translate(150, -60); g.scale(1, 0.72); drawCrack(p, k); g.restore();
};

/** big flaming sword alone (400 x 1000) for the question shot */
export const drawSwordCard = (p, glow = 1) => flameSword(p, 200, 900, 0, 700, glow);

/** fish (300 x 160), v = colour variant, t = tail phase */
export const drawFish = (p, v = 0, t = 0) => {
  const col = ["#f08a3c", "#f2c23c", "#7ab8e0", "#e8606a"][v % 4];
  const tw = 18 * Math.sin(t * Math.PI * 2);
  p.poly([[70, 80], [10, 40 + tw], [24, 80], [10, 120 + tw]], shade(col, 0.8), 5);
  p.ell(150, 80, 95, 52, col, 6);
  p.poly([[120, 34], [170, 14], [190, 36]], shade(col, 0.8), 4);
  p.arc(110, 80, 20, 40, -60, 60, 4, shade(col, 0.6));
  p.ell(205, 70, 14, 14, "#ffffff", 4); p.dot(209, 70, 7, INK);
};
export const drawBubble = (p) => { p.ell(50, 50, 40, 40, "rgba(220,245,255,0.35)", 4); p.ell(36, 36, 10, 8, "rgba(255,255,255,0.9)", 0); }; // 100 x 100

/** god rays from the water surface, additive (512 x 1024) */
export const drawRays = (p) => {
  const g = p.g;
  for (let i = 0; i < 6; i++) { const x = 40 + i * 85 + (i % 2) * 20, w = 30 + (i * 37) % 40;
    const gr = g.createLinearGradient(0, 0, 0, 1024); gr.addColorStop(0, "rgba(220,250,255,0.55)"); gr.addColorStop(1, "rgba(220,250,255,0)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + w, 0); g.lineTo(x + w * 2.2 + 60, 1024); g.lineTo(x + 40, 1024); g.closePath(); g.fill(); }
};

/** modern walker with a phone. st: { phase, look, expr, back, up } */
export const drawWalker = (p, st = {}) => {
  const o = { jacket: "#d9532c", pants: "#34496e", boots: "#f2f2f2", skin: "#e8b98e", hat: "hair", hair: "#1a1414" };
  const k = st.up ?? 0;
  bodyFront(p, o, { mode: "stroll", phase: st.phase ?? 0, expr: st.expr ?? "neutral", seed: 77, look: st.look ?? 0, blink: st.blink ?? 0, back: !!st.back, headTilt: st.headTilt ?? 0,
    armFn: armBlend("phone", "phone", 1),
    front: (c) => { // hoodie strings + phone in the right hand
      const { p: q, tcx, chin, HH, u, arms } = c;
      if (!st.back) { q.stroke([[tcx - 8 * u, chin + 0.04 * HH], [tcx - 9 * u, chin + 0.3 * HH]], 2.5 * u, "#f2f2f2"); q.stroke([[tcx + 8 * u, chin + 0.04 * HH], [tcx + 9 * u, chin + 0.3 * HH]], 2.5 * u, "#f2f2f2"); }
      const [hx, hy] = arms[1].pts[2];
      q.poly([[hx - 12 * u, hy - 30 * u], [hx + 12 * u, hy - 30 * u], [hx + 12 * u, hy + 6 * u], [hx - 12 * u, hy + 6 * u]], "#22222c", 2.5 * u);
      if (st.back) q.poly([[hx - 8 * u, hy - 26 * u], [hx + 8 * u, hy - 26 * u], [hx + 8 * u, hy + 2 * u], [hx - 8 * u, hy + 2 * u]], "#8fd4ff", 0);
      q.dot(hx, hy, 5.5 * u);
    },
    headExtra: (c) => { if (st.back) hairBack(p, c, o.hair, false); } });
};

/** modern pedestrian (jeans, jackets, kurta), v variant, walking */
export const drawPed = (p, v, st = {}) => {
  const woman = v % 3 === 1;
  const o = { jacket: ["#2f6fb0", "#c0303a", "#2f7a5a", "#e2a83a", "#6a4a8a", "#3a3f52"][v % 6], pants: ["#34496e", "#2b2b38", "#5a4a3a"][v % 3], boots: "#3a2a22", skin: ["#e8b98e", "#d9a57a", "#f0c49c", "#c99067"][v % 4], hat: "hair", hair: "#1a1414" };
  if (woman) o.dress = o.jacket;
  bodyFront(p, o, { mode: "stroll", phase: st.phase ?? 0, expr: "neutral", seed: 120 + v, back: !!st.back, blink: 0,
    headExtra: (c) => { if (st.back) hairBack(p, c, o.hair, woman); else if (v % 4 === 0) topi(p, c, "#2f3f6a"); } });
};

const DEVA = "'Kohinoor Devanagari', 'Devanagari Sangam MN', sans-serif";
/** glowing outlined text; fill = [colors top->bottom] */
const glowText = (g, text, x, y, size, fill, glow, a = 1) => {
  if (a <= 0.01) return;
  g.save(); g.globalAlpha = a; g.font = `bold ${size}px ${DEVA}`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
  g.shadowColor = glow; g.shadowBlur = size * 0.35; g.lineWidth = size * 0.13; g.strokeStyle = "#1e1226"; g.strokeText(text, x, y);
  g.shadowBlur = 0; const gr = g.createLinearGradient(0, y - size * 0.5, 0, y + size * 0.5); fill.forEach((c, i) => gr.addColorStop(i / Math.max(1, fill.length - 1), c));
  g.fillStyle = gr; g.fillText(text, x, y);
  g.restore();
};
const GOLD = ["#fff6c8", "#f6c94a", "#d9821e"], ICE = ["#ffffff", "#cdeeff", "#6fb4e6"];
/** hook question card (1000 x 560): "तरवार" / "कि" / "भूकम्प?"  a, b, c = reveal 0..1 per word, j = shake */
export const drawHook = (p, a, b, c, j = 0) => {
  const g = p.g;
  if (a > 0.01) {
    g.save(); g.globalAlpha = a; g.translate(155, 175); g.rotate(-0.35); g.scale(0.62, 0.62); flameSword(p, 0, 120, 0, 230, 0.9); g.restore();
    glowText(g, "तरवार", 520, 150 + 30 * (1 - a), 150, GOLD, "rgba(255,200,90,0.95)", a);
  }
  glowText(g, "कि", 500, 292, 78, ["#ffffff", "#f2e6d8"], "rgba(255,255,255,0.6)", b);
  if (c > 0.01) {
    const jx = j * 9 * Math.sin(j * 40), jy = j * 6 * Math.cos(j * 33);
    glowText(g, "भूकम्प?", 470 + jx, 430 + jy, 150, ICE, "rgba(140,200,255,0.95)", c);
    g.save(); g.globalAlpha = c; g.translate(790 + jx, 345 + jy); g.scale(0.3, 0.19); drawCrack(p, 1); g.restore();
  }
  // thin gold rule between the words
  if (b > 0.01) { g.save(); g.globalAlpha = b * 0.8; g.strokeStyle = "#f6c94a"; g.lineWidth = 4; g.lineCap = "round";
    g.beginPath(); g.moveTo(330 - 60 * (1 - b), 292); g.lineTo(440, 292); g.moveTo(560, 292); g.lineTo(670 + 60 * (1 - b), 292); g.stroke(); g.restore(); }
};
/** beat overlay (1000 x 240): glowing outlined text, no box. style "gold" | "ice" */
export const drawOverlay = (p, text, style = "gold") => glowText(p.g, text, 500, 120, 110, style === "ice" ? ICE : GOLD, style === "ice" ? "rgba(140,200,255,0.95)" : "rgba(255,200,90,0.95)");

/** downward sword slash from upper-left to lower-right (800 x 800), t 0..1 */
export const drawSlash2 = (p, t) => {
  const g = p.g, pts = []; const n = Math.max(2, Math.round(30 * t));
  for (let i = 0; i <= n; i++) { const u = i / 30; pts.push([90 + 620 * u + 90 * Math.sin(Math.PI * u), 80 + 640 * u - 60 * Math.sin(Math.PI * u)]); }
  for (const [w, col] of [[90, "rgba(255,190,80,0.30)"], [44, "rgba(255,226,150,0.75)"], [16, "rgba(255,255,240,1)"]]) {
    g.strokeStyle = col; g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); }
};

/** seismograph trace (1000 x 220): vals = amplitudes (0..1) oldest -> newest */
export const drawSeismo = (p, vals) => {
  const g = p.g;
  g.strokeStyle = "rgba(255,255,255,0.18)"; g.lineWidth = 2;
  for (let y = 40; y <= 180; y += 35) { g.beginPath(); g.moveTo(40, y); g.lineTo(960, y); g.stroke(); }
  const n = vals.length, pts = vals.map((v, i) => [40 + (920 * i) / (n - 1), 110 + v * 90]);
  for (const [w, col] of [[14, "rgba(255,150,70,0.35)"], [5, "#ffb060"], [2, "#fff2d8"]]) { g.strokeStyle = col; g.lineWidth = w; g.lineJoin = "round"; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); }
  const [lx, ly] = pts[n - 1]; g.fillStyle = "#fff2d8"; g.beginPath(); g.arc(lx, ly, 9, 0, Math.PI * 2); g.fill();
};

/** scientist: lab coat, round glasses, magnifier. st: { pose:[a,b,k], expr, blink, look } */
export const drawScientist = (p, st = {}) => {
  const o = { jacket: "#f2f2ee", pants: "#3a4a6a", boots: "#3a2a22", skin: "#d9a57a", hat: "hair", hair: "#2a2020", buttons: "#9aa4b0" };
  const pose = st.pose ?? ["magL", "magL", 1];
  bodyFront(p, o, { mode: "stand", seed: 88, expr: st.expr ?? "whistle", blink: st.blink ?? 0, look: st.look ?? -0.5,
    armFn: armBlend(pose[0], pose[1], pose[2]),
    front: (c) => { const { p: q, tcx, chin, HH, u, arms } = c;
      q.band([[tcx - 4 * u, chin + 0.02 * HH], [tcx - 10 * u, chin + 0.9 * HH]], "#dcdcd6", 3 * u, 0, "round");   // coat edge
      q.poly([[tcx + 14 * u, chin + 0.22 * HH], [tcx + 30 * u, chin + 0.22 * HH], [tcx + 30 * u, chin + 0.34 * HH], [tcx + 14 * u, chin + 0.34 * HH]], "#c8d4e0", 1.5 * u); // pocket
      q.stroke([[tcx + 18 * u, chin + 0.2 * HH], [tcx + 18 * u, chin + 0.3 * HH]], 2.5 * u, "#2f6fb0");          // pen
      const [hx, hy] = arms[0].pts[2]; // magnifier in the left hand
      q.band([[hx, hy], [hx - 4 * u, hy - 20 * u]], "#5a3a24", 6 * u, 1.5 * u, "round");
      q.ell(hx - 6 * u, hy - 38 * u, 19 * u, 19 * u, "rgba(200,235,255,0.55)", 4.5 * u); q.ell(hx - 11 * u, hy - 43 * u, 5 * u, 4 * u, "rgba(255,255,255,0.9)", 0);
      q.dot(hx, hy, 5.5 * u); },
    headExtra: (c) => { const { cx, hc, W, u } = c; // round glasses + tidy hair
      for (const s of [-1, 1]) p.ell(cx + s * 0.19 * W, hc + 0.02 * W, 0.12 * W, 0.12 * W, null, 3 * u);
      p.stroke([[cx - 0.07 * W, hc], [cx + 0.07 * W, hc]], 3 * u); } });
};
