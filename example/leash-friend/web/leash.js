// ================= "पट्टा लगाएको साथी" cast (appended after drunk.js, same module scope) =================
// Comedy, not mockery: the friend and the girlfriend are both likeable; she is never shown as mean or controlling.
// No brands, no real people, adults only. "Beers" stay "मःम".

const backL = (t, s = 1.7) => 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2;
const smoothL = (t) => t * t * (3 - 2 * t);
export const drawMomo = (p) => {
  p.ell(150, 140, 130, 42, "#f4f6fa", 6); p.ell(150, 132, 100, 28, "#e4e8ee", 0);
  for (let i = 0; i < 5; i++) { const x = 80 + i * 35, y = 112 - (i % 2) * 10; p.ell(x, y, 26, 22, "#f6ecd8", 4); p.stroke([[x - 9, y - 12], [x, y - 18], [x + 9, y - 12]], 3); }
};
const DN = (n) => String(n).replace(/\d/g, (d) => "०१२३४५६७८९"[+d]);
const PINK = "#ff5fa2", PINKD = "#c8306e";
export const OUTL = {
  bhai: { jacket: "#2f6fb0", pants: "#34496e", boots: "#3a2a22", skin: "#e8b98e", hat: "hair", hair: "#1a1414" },
  gf: { jacket: "#c8283e", dress: "#4a2a6a", pants: "#2b2b38", boots: "#7a3b3a", skin: "#f0c49c", hat: "hair", hair: "#2a1a16" },
  you: { jacket: "#e07b2a", pants: "#3a3f52", boots: "#3a2a22", skin: "#d9a57a", hat: "hair", hair: "#1a1414" },
  owner: { jacket: "#2f7a5a", pants: "#3a3f52", boots: "#3a2a22", skin: "#c99067", hat: "hair", hair: "#3a3030" },
};
POSES.phoneUp = (c) => { const S = c.sh(1); return [{ pts: c.hang(-1, 0), front: false }, { pts: [S, [c.tcx + 1.15 * c.T.a + 6 * c.u, S[1] + 0.34 * c.HH], [c.tcx + 0.55 * c.T.a, c.chin + 0.22 * c.HH]], front: true }]; };
POSES.bags = (c) => [-1, 1].map((s) => { const S = c.sh(s); return { pts: [S, [c.tcx + s * (1.18 * c.T.a + 6 * c.u), S[1] + 0.42 * c.HH], [c.tcx + s * (1.22 * c.T.a + 8 * c.u), c.chin + 0.92 * c.HH]], front: false }; });
POSES.leashHold = (c) => { const S = c.sh(-1); return [{ pts: [S, [c.tcx - (1.15 * c.T.a + 10 * c.u), S[1] + 0.36 * c.HH], [c.tcx - (1.4 * c.T.a + 26 * c.u), c.chin + 0.62 * c.HH]], front: false }, { pts: c.hang(1, 0), front: false }]; };
POSES.pet = (c) => [-1, 1].map((s) => { const S = c.sh(s); return { pts: [S, [c.tcx + s * (1.1 * c.T.a + 6 * c.u), S[1] + 0.36 * c.HH], [c.tcx + s * 0.35 * c.T.a, c.torsoBot - 0.05 * c.HH]], front: true }; });
POSES.cheek = (c) => [-1, 1].map((s) => { const S = c.sh(s); return { pts: [S, [c.tcx + s * (1.05 * c.T.a + 4 * c.u), S[1] + 0.3 * c.HH], [c.tcx + s * 0.72 * c.W, c.hc + 0.3 * c.HH]], front: true }; });
POSES.eatL = (c) => { const S = c.sh(1); return [{ pts: c.hang(-1, 0), front: false }, { pts: [S, [c.tcx + 1.1 * c.T.a + 6 * c.u, S[1] + 0.32 * c.HH], [c.tcx + 0.3 * c.T.a, c.chin - 0.02 * c.HH]], front: true }]; };
FACE.evil = { eye: ["lid", "lid"], brow: [6, -5], mouth: "smirk" };
FACE.evilLaugh = { eye: ["squeeze", "squeeze"], brow: [6, -5], mouth: "laugh" };
FACE.pant = { eye: ["dot", "dot"], brow: [-5, -2], mouth: "lick" };
POSES.beg = (c) => [-1, 1].map((s) => { const S = c.sh(s); return { pts: [S, [c.tcx + s * (1.0 * c.T.a + 8 * c.u), S[1] + 0.42 * c.HH], [c.tcx + s * 0.38 * c.T.a, S[1] + 0.16 * c.HH]], front: true }; });
POSES.rub = (c) => [-1, 1].map((s) => { const S = c.sh(s); return { pts: [S, [c.tcx + s * (1.05 * c.T.a + 6 * c.u), S[1] + 0.36 * c.HH], [c.tcx + s * 0.05 * c.T.a, c.chin + 0.32 * c.HH]], front: true }; });
FACE.puppy = { eye: ["dot", "dot"], brow: [-5, 1], mouth: "smile" };
FACE.sadL = { eye: ["lid", "lid"], brow: [-5, 3], mouth: "frown" };
FACE.side = { eye: ["lid", "lid"], brow: [3, -4], mouth: "smirk" };

const collar = (p, c) => { const { tcx, T, chin, HH, u } = c;
  p.arc(tcx, chin + 0.02 * HH, 0.52 * T.a, 0.12 * HH, 15, 165, 8 * u, PINK);
  p.ell(tcx, chin + 0.17 * HH, 6 * u, 7 * u, "#f6c94a", 2 * u); };
const curveQ = (a, b, sag, n = 18) => { const pts = []; for (let i = 0; i <= n; i++) { const t = i / n; pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + sag * 4 * t * (1 - t)]); } return pts; };
const leashLine = (p, pts, u) => { p.line(pts, PINK, 6 * u); };
const tail = (p, c, wag, up = 0) => { const { tcx, T, hipY, HH, u } = c, a = -0.9 - 0.8 * up + 0.55 * Math.sin(wag * Math.PI * 2);
  const b = [tcx + 0.7 * T.a, hipY - 0.12 * HH], m = [b[0] + 38 * u * Math.cos(a + 0.5), b[1] + 38 * u * Math.sin(a + 0.5)], e = [m[0] + 34 * u * Math.cos(a), m[1] + 34 * u * Math.sin(a)];
  p.line([b, m, e], "#c8905a", 11 * u); p.ell(e[0], e[1], 9 * u, 9 * u, "#f2e2c8", 2.5 * u); };
const bag = (p, x, y, u, col, s = 1) => { p.poly([[x - 26 * u * s, y], [x + 26 * u * s, y], [x + 30 * u * s, y + 60 * u * s], [x - 30 * u * s, y + 60 * u * s]], col, 2.5 * u);
  p.arc(x, y, 13 * u * s, 14 * u * s, 180, 360, 3 * u, INK); };
const phoneHand = (p, c) => { const [px, py] = c.arms[1].pts[2], u = c.u;
  p.poly([[px - 13 * u, py - 32 * u], [px + 13 * u, py - 32 * u], [px + 13 * u, py + 6 * u], [px - 13 * u, py + 6 * u]], "#22222c", 2.5 * u);
  p.poly([[px - 9 * u, py - 28 * u], [px + 9 * u, py - 28 * u], [px + 9 * u, py + 2 * u], [px - 9 * u, py + 2 * u]], "#8fd4ff", 0); p.dot(px, py, 5.5 * u); };

/** the friend. st: { mode, phase, pose:[a,b,k], expr, blink, look, headTilt, seed,
 *  leash: null | {to:[x,y] design px, sag} (collar -> point), tail: wag phase | null, phone, bags, blush } */
export const drawBhai = (p, st = {}) => {
  const o = OUTL.bhai, pose = st.pose ?? ["hang", "hang", 0];
  bodyFront(p, o, { mode: st.mode ?? "stand", phase: st.phase ?? 0, lift: 34, seed: st.seed ?? 700, expr: st.expr ?? "neutral", blink: st.blink ?? 0, look: st.look ?? 0, headTilt: st.headTilt ?? 0,
    armFn: armBlend(pose[0], pose[1], pose[2]),
    behind: (c) => { if (st.tail != null) tail(p, c, st.tail, st.tailUp ?? 0); },
    front: (c) => {
      collar(p, c);
      if (st.leash) { const a = [c.tcx, c.chin + 0.17 * c.HH]; leashLine(p, curveQ(a, st.leash.to, st.leash.sag ?? 40), c.u); }
      if (st.paws) for (const a of c.arms) { const [hx, hy] = a.pts[2], u = c.u; p.ell(hx, hy + 6 * u, 10 * u, 12 * u, OUTL.bhai.skin, 2.5 * u); for (const d of [-4, 0, 4]) p.stroke([[hx + d * u, hy + 12 * u], [hx + d * u, hy + 17 * u]], 1.8 * u); }
      if (st.phone) phoneHand(p, c);
      if (st.bags) for (const [i, s] of [[0, -1], [1, 1]]) { const [hx, hy] = c.arms[i].pts[2]; bag(p, hx, hy, c.u, s < 0 ? "#f2a0c0" : "#9ad0f0"); bag(p, hx + s * 16 * c.u, hy + 30 * c.u, c.u, s < 0 ? "#f6d26a" : "#c8a0f0", 0.85); }
    },
    headExtra: (c) => { topi(p, c, "#7a2f52"); if (st.blush) for (const s of [-1, 1]) p.ell(c.cx + s * 0.27 * c.W, c.hc + 0.16 * c.HH, 13 * c.u, 7 * c.u, `rgba(235,80,80,${0.5 * st.blush})`, 0); } });
};
/** girlfriend: warm, smiling. st: { mode, pose, expr, blink, look, headTilt, phone, seed, purse } */
export const drawGF = (p, st = {}) => {
  const o = OUTL.gf, pose = st.pose ?? ["hang", "hang", 0];
  bodyFront(p, o, { mode: st.mode ?? "stand", phase: st.phase ?? 0, lift: 34, seed: st.seed ?? 720, expr: st.expr ?? "evil", blink: st.blink ?? 0, look: st.look ?? 0, headTilt: st.headTilt ?? 0,
    armFn: armBlend(pose[0], pose[1], pose[2]),
    front: (c) => { if (st.phone) phoneHand(p, c);
      if (st.hold && c.arms[0]) { const [hx, hy] = c.arms[0].pts[2]; p.ell(hx, hy, 7 * c.u, 7 * c.u, PINK, 2 * c.u); } },
    headExtra: (c) => { const { cx, hc, W, HH, u } = c;
      // two horn-shaped buns (playful villain), a red clip, a sly red-lip smirk line
      for (const s of [-1, 1]) p.poly([[cx + s * 0.22 * W, hc - 0.4 * HH], [cx + s * 0.44 * W, hc - 0.34 * HH], [cx + s * 0.42 * W, hc - 0.66 * HH]], o.hair, 3 * u);
      p.ell(cx + 0.34 * W, hc - 0.4 * HH, 6 * u, 6 * u, "#e02a4a", 1.8 * u);
      for (const s of [-1, 1]) p.ell(cx + s * 0.27 * W, hc + 0.16 * HH, 11 * u, 5 * u, "rgba(200,40,80,0.35)", 0);
      p.ell(cx - 0.47 * W, hc + 0.12 * HH, 4 * u, 4 * u, "#e02a4a", 1.5 * u);
      if (st.glint) { const g = p.g; g.save(); g.globalAlpha = st.glint; for (const s of [-1, 1]) { const x = cx + s * 0.2 * W, y = hc - 0.02 * HH; p.stroke([[x - 9 * u, y], [x + 9 * u, y]], 2.5 * u, "#ffe27a"); p.stroke([[x, y - 9 * u], [x, y + 9 * u]], 2.5 * u, "#ffe27a"); } g.restore(); } } });
};
export const drawYou = (p, st = {}) => {
  const o = OUTL.you, pose = st.pose ?? ["hang", "hang", 0];
  bodyFront(p, o, { mode: st.mode ?? "sit", phase: 0, lift: 34, seed: st.seed ?? 740, expr: st.expr ?? "neutral", blink: st.blink ?? 0, look: st.look ?? 0, headTilt: st.headTilt ?? 0,
    armFn: armBlend(pose[0], pose[1], pose[2]), front: (c) => { if (st.phone) phoneHand(p, c); } });
};

// ---------- animals (profile, facing right unless flipped by the card) ----------
const mane = (p, x, y, r, col = "#c8641e", n = 14) => { const pts = []; for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2, rr = i % 2 ? r * 0.8 : r * 1.06; pts.push([x + rr * Math.cos(a), y + rr * Math.sin(a)]); } p.poly(pts, col, 7); };
const topiAt = (p, x, y, w, ang = 0) => { const g = p.g; g.save(); g.translate(x, y); g.rotate(ang);
  const pts = [[-w / 2, 0], [w / 2, 2], [w * 0.43, -w * 0.33], [-w * 0.4, -w * 0.4]]; p.poly(pts, "#7a2f52", 0);
  p.clip(pts, () => { const cols = ["#e2b33c", "#2f7a5a", "#d4483c", "#f2ecdf", "#2f5f9e"]; for (let i = 0; i < 9; i++) for (let j = 0; j < 4; j++) p.ell(-w / 2 + i * w / 8 + (j % 2) * w / 16, -w * 0.05 - j * w * 0.1, w * 0.035, w * 0.035, cols[(i + j * 2) % 5], 0); });
  p.poly(pts, null, w * 0.045); g.restore(); };
/** lion with the friend's topi (900 x 800, ground at y 780). st: { roar 0..1, tail phase, look } */
export const drawLion = (p, st = {}) => {
  const r = st.roar ?? 0, tp = st.tail ?? 0, BODY = "#e8a640", g = p.g;
  // tail
  const ta = -0.6 + 0.25 * Math.sin(tp * 6.28); p.line([[690, 470], [770, 470 + 60 * Math.sin(ta)], [830, 380 + 40 * Math.sin(ta)]], BODY, 16); p.ell(836, 372 + 40 * Math.sin(ta), 22, 26, "#a8501a", 6);
  // far legs
  for (const x of [380, 640]) p.poly([[x - 26, 520], [x + 26, 520], [x + 22, 770], [x - 30, 770]], "#d08e30", 7);
  p.ell(520, 470, 210, 120, BODY, 8); // body
  for (const x of [330, 600]) { p.poly([[x - 30, 520], [x + 30, 520], [x + 26, 772], [x - 34, 772]], BODY, 7); p.ell(x - 10, 772, 42, 16, BODY, 7); }
  p.ell(530, 520, 120, 40, "#f2c878", 0);
  // head + mane, roaring up-left
  const hx = 270, hy = 330 - 12 * r; mane(p, hx + 10, hy, 170 + 8 * r); mane(p, hx + 10, hy, 130, "#e07a24", 12);
  p.ell(hx, hy + 10, 108, 100, "#f2b84e", 8);
  p.ell(hx - 60, hy - 62, 26, 24, "#f2b84e", 6); p.ell(hx + 60, hy - 70, 26, 24, "#f2b84e", 6);
  // eyes: fierce brows
  for (const s of [-1, 1]) { const ex = hx + s * 38; p.ell(ex, hy - 18, 13, 15, "#ffffff", 4); p.dot(ex - 3, hy - 16, 7); p.stroke([[ex - 20 * s - 4, hy - 46 + 8 * r], [ex + 20 * s - 4, hy - 38 - 4 * r]], 9); }
  // muzzle + roar
  p.ell(hx, hy + 42, 56, 38, "#fbe2b0", 6); p.poly([[hx - 18, hy + 14], [hx + 18, hy + 14], [hx, hy + 34]], "#5a2a2a", 4);
  const mo = 14 + 64 * r; p.ell(hx, hy + 76 + mo * 0.3, 40 + 8 * r, mo, "#7a1e2a", 6);
  if (r > 0.2) { for (const s of [-1, 1]) p.poly([[hx + s * 26, hy + 64], [hx + s * 18, hy + 64], [hx + s * 22, hy + 84]], "#ffffff", 3); p.ell(hx, hy + 96 + mo * 0.5, 22, 10, "#e0607a", 0); }
  // roar lines
  if (r > 0.3) { g.save(); g.globalAlpha = (r - 0.3) / 0.7; for (let i = 0; i < 3; i++) p.arc(hx - 120 - i * 34, hy + 80, 30 + i * 22, 60 + i * 26, 130, 230, 8, "#fff6d8"); g.restore(); }
  topiAt(p, hx + 6, hy - 92, 120, -0.12);
};
/** lion shadow silhouette for the café wall (700 x 500), roar 0..1 */
export const drawLionShadow = (p, r = 0) => { const g = p.g; g.save(); g.fillStyle = "rgba(40,20,30,0.42)"; g.beginPath();
  const hx = 230, hy = 230; for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2, rr = i % 2 ? 120 : 150; g.lineTo(hx + rr * Math.cos(a), hy + rr * Math.sin(a)); } g.closePath(); g.fill();
  g.beginPath(); g.ellipse(430, 330, 200, 100, 0, 0, 7); g.fill(); g.fillRect(300, 380, 50, 120); g.fillRect(540, 380, 50, 120);
  g.globalCompositeOperation = "destination-out"; g.beginPath(); g.ellipse(hx - 40, hy + 70, 40, 14 + 50 * r, -0.3, 0, 7); g.fill(); g.restore(); };

/** dog (600 x 500, ground at y 480). st: { kind "lap"|"park", lie 0..1, look 0..1 (head up to the owner), wag phase, topi, mouth "smile"|"open"|"pant", blink } */
export const drawDog = (p, st = {}) => {
  const lap = st.kind === "lap", FUR = lap ? "#f6f0e6" : "#b8743a", FUR2 = lap ? "#e2d6c6" : "#8a5226", lie = st.lie ?? 0, g = p.g;
  const by = 330 + 70 * lie, look = st.look ?? 0, wag = st.wag ?? 0;
  // tail
  const ta = 0.5 * Math.sin(wag * 6.28); g.save(); g.translate(150, by - 20); g.rotate(-0.9 + ta);
  if (lap) p.ell(-10, -40, 40, 44, FUR, 6); else p.line([[0, 0], [-20, -50], [-10, -100]], FUR, 16); g.restore();
  // legs (back, then front)
  if (lie < 0.5) { p.poly([[175, by + 30], [235, by + 30], [235, 478], [190, 478]], FUR2, 6); p.poly([[345, by + 10], [385, by + 10], [388, 478], [348, 478]], FUR2, 6); }
  p.ell(260, by, 130, 82 - 18 * lie, FUR, 7); // body
  if (lap) for (let i = 0; i < 7; i++) p.ell(160 + i * 34, by - 62 + 18 * lie + (i % 2) * 8, 24, 20, FUR, 0);
  if (lie < 0.5) { p.poly([[200, by + 40], [250, by + 40], [252, 478], [204, 478]], FUR, 6); p.poly([[360, by + 20], [404, by + 20], [406, 478], [362, 478]], FUR, 6);
    for (const x of [228, 384]) p.ell(x, 476, 30, 12, FUR, 6); }
  else for (const x of [300, 380]) p.ell(x + 30, by + 58, 42, 18, FUR, 6);
  // head: rotates up toward the owner
  const hx = 400 + 10 * lie, hy = by - 110 + 40 * lie - 20 * look; g.save(); g.translate(hx, hy); g.rotate(-0.55 * look);
  p.ell(-40, -10, 30, 60, FUR2, 6); // far ear
  p.ell(0, 0, 82, 74, FUR, 7);
  if (lap) for (let i = 0; i < 8; i++) { const a = -Math.PI + i * 0.45; p.ell(70 * Math.cos(a), 64 * Math.sin(a) - 4, 22, 18, FUR, 0); }
  p.ell(66, 26, 50, 34, lap ? "#fffaf2" : "#d89a62", 6); p.ell(108, 14, 15, 12, "#2a1a1a", 4);
  const bl = st.blink ?? 0; if (bl > 0.5) p.arc(22, -14, 12, 8, 200, 340, 6); else { p.ell(22, -16, 12, 14, "#ffffff", 4); p.dot(26 + 4 * look, -18 - 4 * look, 8); }
  const m = st.mouth ?? "smile";
  if (m === "pant" || m === "open") { p.ell(80, 52, 26, m === "open" ? 22 : 14, "#7a1e2a", 5); p.ell(82, 64, 12, 14, "#ff7a9a", 4); }
  else p.arc(80, 44, 22, 10, 20, 160, 5);
  p.ell(-52, 18, 22, 46, FUR2, 6, 0, 360, -0.2); // near ear
  if (st.collar !== false) p.arc(-10, 60, 60, 24, 20, 170, 12, lap ? PINK : "#2f6fb0");
  if (st.topi) topiAt(p, 6, -64, 96, -0.1);
  g.restore();
};

// ---------- small heads for diagrams ----------
const miniHead = (p, x, y, r, o = {}) => { const g = p.g; g.save(); if (o.alpha != null) g.globalAlpha = o.alpha;
  p.ell(x, y + r * 1.15, r * 0.95, r * 0.55, o.shirt ?? "#2f6fb0", r * 0.08);
  p.ell(x, y, r * 0.8, r * 0.92, o.skin ?? "#e8b98e", r * 0.08);
  p.ell(x, y - r * 0.55, r * 0.76, r * 0.42, o.hair ?? "#1a1414", 0, 180, 360);
  if (o.topi) topiAt(p, x, y - r * 0.62, r * 1.5, -0.05);
  if (o.bun) p.ell(x + r * 0.6, y - r * 0.7, r * 0.3, r * 0.28, o.hair ?? "#2a1a16", r * 0.05);
  const sad = o.sad; for (const s of [-1, 1]) p.dot(x + s * r * 0.3, y - r * 0.02, r * 0.09);
  if (sad) p.arc(x, y + r * 0.42, r * 0.22, r * 0.1, 200, 340, r * 0.07); else p.arc(x, y + r * 0.28, r * 0.24, r * 0.14, 20, 160, r * 0.07);
  if (o.collar) p.arc(x, y + r * 0.72, r * 0.5, r * 0.2, 20, 160, r * 0.14, PINK);
  g.restore(); };
const heartP = (p, x, y, s, col = "#ff4f7a", ol = 6) => { const pts = []; for (let i = 0; i <= 40; i++) { const t = (i / 40) * Math.PI * 2; pts.push([x + s * 16 * Math.sin(t) ** 3, y - s * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]); } p.poly(pts, col, ol); };
const card = (p, x0, y0, x1, y1, col = "rgba(14,22,52,0.6)") => { const g = p.g; g.save(); g.fillStyle = col; g.beginPath(); g.roundRect(x0, y0, x1 - x0, y1 - y0, 40); g.fill(); g.restore(); };
const flask = (p, x, y, s) => { p.poly([[x - 14 * s, y - 50 * s], [x + 14 * s, y - 50 * s], [x + 14 * s, y - 14 * s], [x + 44 * s, y + 40 * s], [x - 44 * s, y + 40 * s], [x - 14 * s, y - 14 * s]], "#e8f4ff", 5 * s);
  p.poly([[x - 28 * s, y + 12 * s], [x + 28 * s, y + 12 * s], [x + 40 * s, y + 36 * s], [x - 40 * s, y + 36 * s]], "#7ad8a0", 0); p.poly([[x - 14 * s, y - 50 * s], [x + 14 * s, y - 50 * s], [x + 14 * s, y - 14 * s], [x + 44 * s, y + 40 * s], [x - 44 * s, y + 40 * s], [x - 14 * s, y - 14 * s]], null, 5 * s); };

/** five-friends circle (1000 x 1300). st: { sci 0..1, ring 0..1, heart 0..1 (drops in), hi 0..1 (two friends highlighted), out 0..1 (slide out), ph } */
export const drawCircle5 = (p, st = {}) => {
  const g = p.g, cx = 500, cy = 700, R = 300; card(p, 20, 20, 980, 1280);
  // title: flask + "विज्ञान"
  const sk = st.sci ?? 1; if (sk > 0.01) { g.save(); g.globalAlpha = sk; flask(p, 330, 120, 1.0); txt(g, "विज्ञान", 560, 120, 90, "#f4efe6"); g.restore(); }
  // the dashed circle
  const rk = st.ring ?? 1; g.save(); g.globalAlpha = rk; g.setLineDash([22, 18]); g.lineWidth = 7; g.strokeStyle = "rgba(255,240,210,0.65)"; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2 * rk); g.stroke(); g.restore();
  // centre: the friend
  miniHead(p, cx, cy - 20, 82, { topi: true, collar: (st.heart ?? 0) > 0.5 });
  // five friends; #1 (orange = you) and #4 slide out
  const F = [{ a: -120, shirt: "#e07b2a", out: true }, { a: -40, shirt: "#2f7a5a" }, { a: 40, shirt: "#8a3fa0" }, { a: 150, shirt: "#c0303a", out: true }, { a: 95, shirt: "#e2a83a" }];
  const out = st.out ?? 0, hi = st.hi ?? 0;
  F.forEach((fr, i) => { const a = (fr.a * Math.PI) / 180, rr = R + (fr.out ? 160 * out : 0), x = cx + rr * Math.cos(a), y = cy + rr * Math.sin(a);
    if (fr.out && hi > 0.01) { g.save(); g.globalAlpha = hi * (1 - 0.6 * out); g.strokeStyle = "#ffd25a"; g.lineWidth = 9; g.beginPath(); g.arc(x, y + 14, 84 + 6 * Math.sin((st.ph ?? 0) * 12), 0, 7); g.stroke(); g.restore(); }
    miniHead(p, x, y, 56, { shirt: fr.shirt, alpha: fr.out ? 1 - 0.45 * out : 1, sad: fr.out && out > 0.5, skin: ["#e8b98e", "#d9a57a", "#f0c49c", "#c99067", "#e8b98e"][i] }); });
  // heart (the girlfriend) drops in next to him
  const hk = st.heart ?? 0; if (hk > 0.01) { const y = cy - 900 * (1 - hk) - 20; heartP(p, cx + 180, y + 150, 3.6 + 0.2 * Math.sin((st.ph ?? 0) * 20)); miniHead(p, cx + 180, y + 20, 48, { shirt: "#f08a5a", bun: true, hair: "#2a1a16", skin: "#f0c49c" }); }
  // count
  txt(g, out > 0.6 ? "३ +" : "५", out > 0.6 ? 440 : 500, 1180, 92, "#f4efe6"); if (out > 0.6) heartP(p, 560, 1180, 2.6);
  if (out > 0.3) { g.save(); g.globalAlpha = Math.min(1, (out - 0.3) / 0.4); txt(g, "−२", 860, 1180, 96, "#ff8a6a"); g.restore(); }
};

/** chat phone held in a hand (600 x 1000). st: { type 0..1, sent 0..1, seen 0..1, dots phase } */
export const drawChat = (p, st = {}) => {
  const g = p.g; p.poly([[110, 40], [490, 40], [490, 820], [110, 820]], "#1c1c24", 10);
  const S = [[134, 80], [466, 80], [466, 780], [134, 780]], MSG = "आज मःम?";
  p.clip(S, () => { p.poly(S, "#f4f6fa", 0); p.poly([[134, 80], [466, 80], [466, 170], [134, 170]], "#2f6fb0", 0);
    miniHead(p, 190, 122, 30, { topi: true, collar: true }); g.save(); g.font = `bold 40px ${DEVA}`; g.fillStyle = "#ffffff"; g.textBaseline = "middle"; g.fillText("साथी", 236, 126); g.restore();
    // old bubbles (grey, from him, long ago)
    p.poly([[156, 200], [380, 200], [380, 250], [156, 250]], "#e2e6ee", 0); p.poly([[156, 266], [330, 266], [330, 316], [156, 316]], "#e2e6ee", 0);
    // sent bubble
    const sk = st.sent ?? 0; if (sk > 0.01) { g.save(); g.globalAlpha = Math.min(1, sk * 2); const y = 470 + 80 * (1 - sk); p.poly([[170, y], [455, y], [455, y + 110], [170, y + 110]], "#cfe6ff", 4);
      txt(g, MSG, 280, y + 56, 44, "#17203A"); drawMomoMini(p, 410, y + 54, 0.9); if ((st.seen ?? 0) > 0.5) txt(g, "देखियो", 400, y + 140, 26, "#7a8090"); g.restore(); }
    // typing dots from him
    if ((st.seen ?? 0) > 0.5) { const t = st.dots ?? 0; p.poly([[156, 650], [270, 650], [270, 700], [156, 700]], "#e2e6ee", 0); for (let i = 0; i < 3; i++) p.dot(184 + i * 30, 675 - 8 * Math.max(0, Math.sin(t * 6.28 - i)), 9, "#8a90a0"); }
    // input field with the typed text
    p.poly([[150, 720], [450, 720], [450, 770], [150, 770]], "#ffffff", 3); const n = Math.round((st.type ?? 0) * MSG.length);
    if (sk < 0.05 && n > 0) { g.save(); g.font = `bold 34px ${DEVA}`; g.fillStyle = "#17203A"; g.textBaseline = "middle"; g.fillText(MSG.slice(0, n), 166, 746); g.restore(); }
  });
  p.poly([[60, 1000], [80, 760], [150, 700], [180, 820], [420, 820], [520, 760], [560, 1000]], "#d9a57a", 9);
  p.ell(500, 640, 46, 70, "#d9a57a", 9);
};
const drawMomoMini = (p, x, y, s) => { p.ell(x, y + 14 * s, 34 * s, 12 * s, "#ffffff", 3 * s); for (const dx of [-14, 0, 14]) { p.ell(x + dx * s, y + (dx ? 2 : -4) * s, 12 * s, 11 * s, "#f6ecd8", 3 * s); p.stroke([[x + dx * s - 4 * s, y - 6 * s], [x + dx * s, y - 9 * s], [x + dx * s + 4 * s, y - 6 * s]], 2 * s); } };

/** word counter (1000 x 1300): top half dog + 89 words, bottom half the friend + 2 words.
 *  st: { n 0..89, chips 0..1, b 0..1 (bottom half on), two 0..1, bub 0..1, wag, ph } */
const CHIPS = ["बस्", "आइज", "खाना", "बल", "घुम्न", "नाइँ", "बाहिर", "राम्रो", "बसिराख", "पानी"];
export const drawCounter = (p, st = {}) => {
  const g = p.g; card(p, 20, 20, 980, 620); card(p, 20, 680, 980, 1280, "rgba(52,22,40,0.62)");
  // top: dog + counter
  g.save(); g.translate(40, 150); g.scale(0.82, 0.82); drawDog(p, { kind: "park", wag: st.wag ?? 0, mouth: "pant", look: 0.2 }); g.restore();
  const n = Math.round(st.n ?? 0); odo(p, 760, 250, DN(n)); txt(g, "शब्द चिन्छ", 760, 380, 52, "#f4efe6");
  const ck = st.chips ?? 0; CHIPS.forEach((w, i) => { const k = clamp(ck * CHIPS.length - i, 0, 1); if (k < 0.01) return; const a = i * 0.63 + 0.4, x = 300 + 250 * Math.cos(a) * 1.4, y = 170 + 110 * Math.sin(a) * 1.1 + (1 - k) * 30;
    if (x > 600 || x < 60) return; g.save(); g.globalAlpha = k * 0.92; chip(p, x, y, w); g.restore(); });
  // bottom: the friend + counter "२"
  const b = st.b ?? 0; if (b > 0.01) { g.save(); g.globalAlpha = b;
    miniHead(p, 250, 960, 140, { topi: true, collar: true }); const tk = st.two ?? 0; odo(p, 760, 900, DN(tk > 0.5 ? 2 : 0)); txt(g, "शब्द मात्र", 760, 1030, 52, "#f4efe6");
    const bk = st.bub ?? 0; if (bk > 0.01) { const s = backL(bk); g.save(); g.translate(560, 1180); g.scale(s, s); g.translate(-560, -1180);
      p.poly([[340, 1120], [780, 1120], [780, 1240], [430, 1240], [370, 1275], [390, 1240], [340, 1240]], "#ffffff", 7); txt(g, "हस्, बेबी", 560, 1182, 72, "#17203A"); g.restore(); }
    g.restore(); }
};
const odo = (p, x, y, s) => { const g = p.g; p.poly([[x - 170, y - 80], [x + 170, y - 80], [x + 170, y + 80], [x - 170, y + 80]], "#fffaf0", 8); txt(g, s, x, y + 6, 130, "#17203A"); };
const chip = (p, x, y, w) => { const g = p.g; g.font = `bold 40px ${DEVA}`; const tw = g.measureText(w).width + 40; p.poly([[x - tw / 2, y - 32], [x + tw / 2, y - 32], [x + tw / 2, y + 32], [x - tw / 2, y + 32]], "#ffe9b8", 4); txt(g, w, x, y + 2, 40, "#5a3a10"); };

/** share sheet phone (600 x 1000). st: { open 0..1, pick 0..1, tap 0..1, sent 0..1 } */
export const drawShare = (p, st = {}) => {
  const g = p.g; p.poly([[110, 40], [490, 40], [490, 820], [110, 820]], "#1c1c24", 10);
  const S = [[134, 80], [466, 80], [466, 780], [134, 780]];
  p.clip(S, () => { p.poly(S, "#123048", 0); // the reel (blurred look)
    miniHead(p, 300, 300, 80, { topi: true, collar: true }); p.line(curveQ([300, 380], [470, 360], 60), PINK, 6);
    const o = st.open ?? 0, y0 = 780 - 420 * smoothL(o); p.poly([[134, y0], [466, y0], [466, 780], [134, 780]], "#f4f6fa", 0);
    txt(g, "पठाउनुहोस्", 300, y0 + 50, 40, "#17203A");
    const C = [["साथी", { topi: true, collar: true }], ["दाइ", { shirt: "#2f7a5a" }], ["दिदी", { shirt: "#8a3fa0", bun: true }]];
    C.forEach(([nm, o2], i) => { const x = 195 + i * 110, y = y0 + 160; if (i === 0 && (st.pick ?? 0) > 0.01) { g.save(); g.globalAlpha = st.pick; p.ell(x, y, 56, 56, "#ffd25a", 0); g.restore(); }
      miniHead(p, x, y - 6, 36, o2); txt(g, nm, x, y + 70, 28, "#17203A"); });
    const sk = st.sent ?? 0; p.poly([[170, y0 + 280], [430, y0 + 280], [430, y0 + 350], [170, y0 + 350]], sk > 0.5 ? "#2f9a6a" : "#2f6fb0", 0);
    txt(g, sk > 0.5 ? "पठाइयो ✓" : "पठाउनुहोस्", 300, y0 + 316, 36, "#ffffff");
  });
  // hand + tapping finger
  p.poly([[60, 1000], [80, 760], [150, 700], [180, 820], [420, 820], [520, 760], [560, 1000]], "#d9a57a", 9);
  const tp = st.tap ?? 0, fx = 195 + 105 * clamp(tp * 2 - 1, 0, 1), fy = 860 - 260 * Math.sin(Math.PI * Math.min(1, tp * 1.0)) + (tp > 0.5 ? 120 * (tp - 0.5) : 0);
  p.ell(500, 640, 46, 70, "#d9a57a", 9);
  if (tp > 0.01) { p.poly([[fx - 22, fy], [fx + 22, fy], [fx + 30, 1000], [fx - 34, 1000]], "#d9a57a", 8); p.ell(fx, fy, 22, 26, "#d9a57a", 8); }
};

/** lost poster (600 x 800): "हराएको" + his face + "पुरस्कार: मःम" */
export const drawPoster = (p, st = {}) => { const g = p.g; p.poly([[20, 20], [580, 26], [574, 780], [26, 774]], "#fbf3dc", 8);
  txt(g, "हराएको", 300, 110, 110, "#c8281e"); p.poly([[90, 190], [510, 190], [510, 560], [90, 560]], "#cfe0ef", 6);
  miniHead(p, 300, 380, 120, { topi: true, collar: true, sad: true });
  txt(g, "पुरस्कार: मःम", 300, 650, 60, "#17203A"); drawMomoMini(p, 300, 728, 1.4);
  for (const [x, y] of [[50, 50], [550, 54], [546, 750], [54, 746]]) p.ell(x, y, 12, 12, "#c8281e", 3); };

/** broken heart (300 x 300), k = split 0..1 */
export const drawBroken = (p, k = 0) => { const g = p.g;
  for (const s of [-1, 1]) { g.save(); g.translate(150 + s * 30 * k, 150 + 10 * k); g.rotate(s * 0.25 * k); g.translate(-150, -150);
    g.beginPath(); if (s < 0) g.rect(0, 0, 150, 300); else g.rect(150, 0, 150, 300); g.clip(); heartP(p, 150, 150, 7.5, "#ff4f7a", 8); g.restore(); }
  if (k > 0.05) p.line([[150, 50], [130, 110], [170, 160], [140, 220], [150, 260]], "#2a1020", 6, false); };
export const drawHeart = (p, col = "#ff4f7a") => heartP(p, 150, 150, 7.5, col, 8);
/** sparkle burst (300 x 300) */
export const drawSpk = (p, t) => { for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r0 = 30 + 90 * t, r1 = r0 + 40 * (1 - t); p.stroke([[150 + r0 * Math.cos(a), 150 + r0 * Math.sin(a)], [150 + r1 * Math.cos(a), 150 + r1 * Math.sin(a)]], 10 * (1 - t) + 2, i % 2 ? "#ffe27a" : "#ffb0d0"); } };
/** loose leash (600 x 300) lying / dragging: from (40,40) to the clip at the right */
export const drawLeash = (p, a, b, sag = 40) => { leashLine(p, curveQ(a, b, sag), 2.2); p.ell(b[0], b[1], 14, 10, "#c8c8d0", 4); };

/** hook title card (1000 x 600): "सिंह" / "कि" / "कुकुर?"  a, b, c reveal; t time */
export const drawHookL = (p, a, b, c, t = 0) => { const g = p.g, LION = ["#fff6c8", "#f6c94a", "#d9821e"], DOG = ["#fff0fa", "#ffa0cc", "#d04a8a"];
  if (a > 0.01) { glowText(g, "सिंह", 330, 170 + 24 * (1 - a), 150, LION, "rgba(255,190,80,0.95)", a);
    g.save(); g.globalAlpha = a; g.translate(600, 150); g.scale(0.34, 0.34); mane(p, 0, 0, 170); p.ell(0, 10, 108, 100, "#f2b84e", 8); for (const s of [-1, 1]) p.dot(s * 38, -14, 12); p.ell(0, 42, 56, 38, "#fbe2b0", 6); p.poly([[-18, 14], [18, 14], [0, 34]], "#5a2a2a", 4); g.restore(); }
  glowText(g, "कि", 500, 305, 76, ["#ffffff", "#f2e6d8"], "rgba(255,255,255,0.6)", b);
  if (c > 0.01) { glowText(g, "कुकुर?", 450, 445 + 20 * (1 - c), 150, DOG, "rgba(255,120,190,0.95)", c);
    g.save(); g.globalAlpha = c; g.translate(800, 420); g.scale(0.62, 0.62); g.rotate(0.06 * Math.sin(t * 12)); g.translate(-400, -230); drawDog(p, { kind: "lap", lie: 0, look: 0.2, topi: true, mouth: "pant", wag: t * 3 }); g.restore(); }
};

/** dark silhouette of any drawing (for wall shadows): fn draws in its own design space */
export const drawSil = (p, fn, a = 0.4) => { const g = p.g, cv = document.createElement("canvas"); cv.width = g.canvas.width; cv.height = g.canvas.height;
  const g2 = cv.getContext("2d"); g2.setTransform(g.getTransform()); g2.lineJoin = g2.lineCap = "round"; fn(new Pen(g2));
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = "brightness(0)"; g.globalAlpha = a; g.drawImage(cv, 0, 0); g.restore(); };
