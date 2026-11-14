// ================= Nepal cast (from "यलम्बरको शिर"): Kirat king + warriors, two armies, Krishna (back view), townsfolk with dhaka topi, Akash Bhairav mask, Sudarshan chakra, props + fx. Needs tools/patch_toon.py hooks. =================
// ================= cast for "यलम्बरको शिर" (appended to toonbase.js, same module scope) =================
const lerpP = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

export const headCenterO = (o, seed = 1, facing = 0) => {
  const Bd = BUILD[o.build ?? "adult"], H = headBlob(seed, Bd.a, facing), HH = 2 * H.b;
  const torsoBot = 975 - Bd.legs * HH, chin = torsoBot - Bd.torso * HH;
  return { hc: chin - H.b, H, HH, chin, torsoBot, u: (2 * H.a) / 100, crown: chin - 2 * H.b };
};

// ---------- arm poses (canvas design units, side -1 = screen left) ----------
const POSES = {
  hang: (c) => [c.hang(-1, 0), c.hang(1, 0)].map((pts) => ({ pts, front: false })),
  hip: (c) => [-1, 1].map((s) => { const S = c.sh(s); return { pts: [S, [c.tcx + s * (1.25 * c.T.a + 16 * c.u), S[1] + 0.3 * c.HH], [c.tcx + s * 0.88 * c.T.a, c.torsoBot - 0.28 * c.HH]], front: false }; }),
  up: (c) => [-1, 1].map((s) => { const S = c.sh(s); return { pts: [S, [c.tcx + s * (1.12 * c.T.a + 12 * c.u), S[1] - 0.38 * c.HH], [c.tcx + s * 0.62 * c.T.a, c.crown - 0.12 * c.HH]], front: false }; }),
  cheer: (c) => [-1, 1].map((s) => { const S = c.sh(s); return { pts: [S, [c.tcx + s * (1.2 * c.T.a + 18 * c.u), S[1] - 0.32 * c.HH], [c.tcx + s * (1.3 * c.T.a + 34 * c.u), S[1] - 0.78 * c.HH]], front: false }; }),
  point: (c) => { const S = c.sh(1); return [{ pts: c.hang(-1, 0), front: false }, { pts: [S, [c.tcx + 1.1 * c.T.a + 34 * c.u, S[1] - 0.04 * c.HH], [c.tcx + 1.1 * c.T.a + 78 * c.u, S[1] - 0.14 * c.HH]], front: false }]; },
  pointL: (c) => { const S = c.sh(-1); return [{ pts: [S, [c.tcx - 1.1 * c.T.a - 34 * c.u, S[1] - 0.04 * c.HH], [c.tcx - 1.1 * c.T.a - 78 * c.u, S[1] - 0.14 * c.HH]], front: false }, { pts: c.hang(1, 0), front: false }]; },
  thumb: (c) => { const S = c.sh(1); return [{ pts: c.hang(-1, 0), front: false }, { pts: [S, [c.tcx + 1.18 * c.T.a + 12 * c.u, S[1] + 0.36 * c.HH], [c.tcx + 0.12 * c.T.a, c.chin + 0.22 * c.HH]], front: true }]; },
  shrug: (c) => [-1, 1].map((s) => { const S = c.sh(s); return { pts: [S, [c.tcx + s * (1.2 * c.T.a + 8 * c.u), S[1] + 0.36 * c.HH], [c.tcx + s * (1.3 * c.T.a + 30 * c.u), S[1] + 0.06 * c.HH]], front: false }; }),
  flail: (c) => [-1, 1].map((s) => { const S = c.sh(s), w = Math.sin(c.t * 2 + s) * 14 * c.u; return { pts: [S, [c.tcx + s * (1.25 * c.T.a + 22 * c.u), S[1] - 0.25 * c.HH + w], [c.tcx + s * (1.35 * c.T.a + 40 * c.u), S[1] - 0.7 * c.HH - w]], front: false }; }),
  namaste: (c) => [-1, 1].map((s) => { const S = c.sh(s); return { pts: [S, [c.tcx + s * (1.05 * c.T.a + 6 * c.u), S[1] + 0.42 * c.HH], [c.tcx + s * 5 * c.u, c.chin + 0.3 * c.HH]], front: true }; }),
  spear: (c) => { const S = c.sh(1); return [{ pts: c.hang(-1, 0), front: false }, { pts: [S, [c.tcx + 1.15 * c.T.a + 8 * c.u, S[1] + 0.32 * c.HH], [c.tcx + 1.1 * c.T.a + 22 * c.u, c.chin + 0.38 * c.HH]], front: true }]; },
  raise: (c) => { const S = c.sh(1); return [{ pts: c.hang(-1, 0), front: false }, { pts: [S, [c.tcx + 1.15 * c.T.a + 14 * c.u, S[1] - 0.18 * c.HH], [c.tcx + 1.05 * c.T.a + 22 * c.u, S[1] - 0.6 * c.HH]], front: false }]; },
};

/** armFn blending pose a -> b by k (0..1) */
const armBlend = (a, b, k, t = 0) => (ctx) => {
  const c = { ...ctx, t };
  c.sh = (side) => [ctx.tcx + side * 0.85 * ctx.T.a, ctx.chin + 0.12 * ctx.HH];
  const A = POSES[a](c), B = POSES[b](c);
  A.forEach((x, i) => ctx.arms.push({ pts: x.pts.map((q, j) => lerpP(q, B[i].pts[j], k)), front: k > 0.5 ? B[i].front : x.front }));
};

// ---------- outfits ----------
export const YAL = { jacket: "#b8322e", pants: "#3e2c26", boots: "#5a3b2a", skin: "#f0c49c", moustache: "#241612", hat: "hair", hair: "#241a17", sash: "#e8b440", build: "stout" };
const KIRAT_SKIN = ["#f0c49c", "#e8b98e", "#f5d0aa", "#dcae84"];
export const kiratWarrior = (v) => ({ jacket: ["#efe7d6", "#e9dfc9", "#f2ecdf"][v % 3], pants: "#3a302c", boots: "#5a3b2a", skin: KIRAT_SKIN[v % 4], hat: "hair", hair: "#221a17", sash: "#c8332f", moustache: v % 3 === 1 ? "#2a1d18" : undefined });
const ARMY_SKIN = ["#f0c49c", "#d9a57a", "#c99067", "#e8b98e", "#b97f55"];
export const redSoldier = (v) => ({ jacket: ["#b04a2c", "#a6402a", "#b85634"][v % 3], pants: "#4a3226", boots: "#3b2a22", skin: ARMY_SKIN[v % 5], belt: "#e3c27a", moustache: v % 4 === 1 ? "#2a1d18" : undefined, side: "red" });
export const blueSoldier = (v) => ({ jacket: ["#2f5f9e", "#2b5590", "#3a6aaa"][v % 3], pants: "#2c3446", boots: "#262a33", skin: ARMY_SKIN[(v + 2) % 5], belt: "#e3c27a", moustache: v % 4 === 2 ? "#2a1d18" : undefined, side: "blue" });
const DAURA = ["#efe7d6", "#e6dcc6", "#f3eee3", "#d9cfb8"];
export const townsfolk2 = (v) => {
  const man = v % 2 === 0;
  const o = { jacket: man ? DAURA[v % 4] : ["#c0303a", "#e07b2a", "#8a2f6a", "#2f7a5a", "#d4a12a"][v % 5], pants: man ? "#e9e2d2" : "#3b2f2a", boots: "#4a3426", skin: KIRAT_SKIN[(v * 3) % 4], hat: "hair", hair: "#1f1816", man };
  if (!man) o.dress = o.jacket;
  if (man && v % 6 === 2) o.moustache = "#2a1d18";
  if (v % 7 === 3) o.build = "kid";
  return o;
};

// ---------- head extras ----------
const topi = (p, c, col1 = "#7a2f52") => {
  const { cx, crown, HH, u } = c, yb = crown + 0.2 * HH, ht = 0.3 * HH;
  const pts = [[cx - 46 * u, yb], [cx + 46 * u, yb + 2 * u], [cx + 40 * u, yb - ht * 0.75], [cx - 36 * u, yb - ht]];
  p.poly(pts, col1, 0);
  p.clip(pts, () => {
    const cols = ["#e2b33c", "#2f7a5a", "#d4483c", "#f2ecdf", "#2f5f9e"];
    for (let i = 0; i < 9; i++) for (let j = 0; j < 4; j++)
      p.ell(cx - 46 * u + i * 12 * u + (j % 2) * 6 * u, yb - 4 * u - j * 9 * u, 3.2 * u, 3.2 * u, cols[(i + j * 2) % 5], 0);
  });
  p.poly(pts, null, 4 * u);
};
const helmet = (p, c, crest) => {
  const { cx, crown, HH, u } = c, yb = crown + 0.36 * HH;
  p.ell(cx, yb, 56 * u, 0.42 * HH, "#c99a45", 4.5 * u, 180, 360);
  p.band([[cx - 58 * u, yb], [cx + 58 * u, yb]], "#a87a32", 7 * u, 2 * u, "round");
  p.ell(cx, yb - 0.3 * HH, 7 * u, 7 * u, "#e8c45a", 2.5 * u);
  const pl = [[cx - 8 * u, yb - 0.4 * HH], [cx + 30 * u, yb - 0.62 * HH], [cx + 52 * u, yb - 0.5 * HH], [cx + 10 * u, yb - 0.36 * HH]];
  p.poly(pl, crest, 3.5 * u);
};
const kiratBand = (p, c, king) => {
  const { cx, crown, HH, u } = c, yb = crown + 0.3 * HH;
  if (king) {
    // tall feather plume behind the band (white + red)
    p.poly([[cx - 8 * u, yb - 4 * u], [cx - 26 * u, yb - 0.75 * HH], [cx - 4 * u, yb - 0.62 * HH], [cx + 6 * u, yb - 4 * u]], "#f6f1e6", 3.5 * u);
    p.poly([[cx + 4 * u, yb - 4 * u], [cx + 18 * u, yb - 0.66 * HH], [cx + 30 * u, yb - 0.5 * HH], [cx + 14 * u, yb - 4 * u]], "#d23a33", 3.5 * u);
  }
  p.band([[cx - 54 * u, yb + 3 * u], [cx, yb - 2 * u], [cx + 54 * u, yb + 3 * u]], king ? "#e8b440" : "#c8332f", (king ? 13 : 9) * u, 2 * u, "round");
  if (king) { p.ell(cx, yb - 1 * u, 9 * u, 10 * u, "#d23a33", 2.5 * u); p.ell(cx, yb - 1 * u, 3.5 * u, 4 * u, "#ffd9d9", 0); }
};
const hairBack = (p, c, col, bun) => {
  p.shadedFill(c.hp, col, shade(col, 0.75), c.light, c.H.a);
  p.inkRing(c.hp, c.ow, c.thick);
  if (bun) p.ell(c.cx, c.hc + 0.25 * c.HH, 22 * c.u, 18 * c.u, col, 3 * c.u);
};

// ---------- body extras ----------
const cape = (col) => (c) => {
  const { p, tcx, T, chin, HH, u, sole } = c;
  p.poly([[tcx - 0.8 * T.a, chin + 0.05 * HH], [tcx + 0.8 * T.a, chin + 0.05 * HH], [tcx + 1.45 * T.a, sole - 60 * u], [tcx - 1.45 * T.a, sole - 54 * u]], col, 5 * u);
};
const bowBack = (c) => {
  const { p, tcx, T, chin, HH, u } = c;
  const bx = tcx + 0.55 * T.a, by = chin + 0.6 * HH, r = 0.8 * HH;
  p.arc(bx, by, r, r, 125, 235, 6 * u, "#7a4b2a");
  p.stroke([[bx + r * Math.cos(rad(125)), by + r * Math.sin(rad(125))], [bx + r * Math.cos(rad(235)), by + r * Math.sin(rad(235))]], 1.6 * u, INK);
};
const spearBehind = (c) => {
  const { p, tcx, T, chin, HH, u, crown, sole } = c;
  const x = tcx + 1.1 * T.a + 22 * c.u;
  p.band([[x, sole - 6 * u], [x, crown - 0.55 * HH]], "#7a4b2a", 5 * u, 1.5 * u, "round");
  p.poly([[x - 9 * u, crown - 0.5 * HH], [x, crown - 0.85 * HH], [x + 9 * u, crown - 0.5 * HH]], "#c9ccd2", 2.5 * u);
};
const shieldFront = (col) => (c) => {
  const { p, tcx, T, chin, HH, u } = c;
  const x = tcx - 0.95 * T.a, y = chin + 0.5 * HH;
  p.ell(x, y, 40 * u, 44 * u, col, 4.5 * u); p.ell(x, y, 22 * u, 24 * u, "#e3c27a", 3 * u); p.ell(x, y, 7 * u, 7 * u, shade(col, 0.6), 2 * u);
};
const khukuri = (c) => {
  const { p, tcx, T, torsoBot, HH, u } = c;
  const x = tcx + 0.35 * T.a, y = torsoBot - 0.3 * HH;
  p.poly([[x, y], [x + 10 * u, y + 6 * u], [x + 26 * u, y + 36 * u], [x + 30 * u, y + 52 * u], [x + 20 * u, y + 44 * u], [x + 4 * u, y + 14 * u]], "#3b2a22", 2.5 * u);
  p.poly([[x - 4 * u, y - 10 * u], [x + 8 * u, y - 6 * u], [x + 6 * u, y + 6 * u], [x - 6 * u, y + 2 * u]], "#e3c27a", 2 * u);
};
const lampFront = (c) => {
  const { p, tcx, chin, HH, u } = c, y = chin + 0.36 * HH;
  p.ell(tcx, y, 18 * u, 8 * u, "#c98a3a", 2.5 * u, 0, 180);
  p.ell(tcx, y - 10 * u, 6 * u, 11 * u, "#ffd35a", 1.5 * u);
  p.ell(tcx, y - 12 * u, 3 * u, 6 * u, "#fff6c8", 0);
};

// ---------- the drawers (6:10 canvas, design 600 x 1000, soles at 975) ----------
/** Yalambar. st: { expr, arms:[a,b,k], mode, phase, look, blink, tilt, headTilt, back } */
export const drawYalambar = (p, st) => {
  const t = st.t ?? 0;
  bodyFront(p, YAL, { expr: st.expr ?? "neutral", mode: st.mode ?? "stand", phase: st.phase ?? 0, look: st.look ?? 0, blink: st.blink ?? 0, tilt: st.tilt ?? 0, headTilt: st.headTilt ?? 0,
    facing: st.facing ?? 0, seed: 11, back: !!st.back,
    armFn: armBlend(...(st.arms ?? ["hang", "hang", 0]), t),
    behind: (c) => { cape("#7e1f22")(c); },
    front: (c) => { if (!st.back) khukuri(c); },
    headExtra: (c) => { if (st.back) hairBack(p, c, YAL.hair, false); kiratBand(p, c, true); } });
};
export const drawKirat = (p, v, st = {}) => {
  const o = kiratWarrior(v);
  bodyFront(p, o, { expr: st.expr ?? "stern", mode: st.mode ?? "stand", phase: st.phase ?? 0, seed: 20 + v, back: !!st.back,
    armFn: armBlend(v % 2 ? "spear" : "hang", v % 2 ? "spear" : "hang", 0),
    behind: (c) => { if (v % 2) spearBehind(c); else bowBack(c); },
    headExtra: (c) => { if (st.back) hairBack(p, c, o.hair, false); kiratBand(p, c, false); } });
};
export const drawSoldier = (p, side, v, st = {}) => {
  const o = side === "red" ? redSoldier(v) : blueSoldier(v);
  const col = side === "red" ? "#b5342c" : "#2d5fae";
  bodyFront(p, o, { expr: st.expr ?? "stern", mode: st.mode ?? "stand", phase: st.phase ?? 0, seed: 40 + v + (side === "red" ? 0 : 50), blink: st.blink ?? 0, tilt: st.tilt ?? 0,
    armFn: armBlend(st.arms?.[0] ?? "spear", st.arms?.[1] ?? "spear", st.arms?.[2] ?? 0, st.t ?? 0),
    behind: (c) => { if ((st.arms?.[1] ?? "spear") === "spear" && (st.arms?.[2] ?? 0) < 0.5) spearBehind(c); },
    front: (c) => { if (!st.noShield) shieldFront(col)(c); },
    headExtra: (c) => helmet(p, c, col) });
};
export const drawTown = (p, v, st = {}) => {
  const o = townsfolk2(v);
  bodyFront(p, o, { expr: st.expr ?? "smile", mode: "stand", seed: 70 + v, back: !!st.back, look: st.look ?? 0, blink: st.blink ?? 0,
    armFn: armBlend(st.arms?.[0] ?? "hang", st.arms?.[1] ?? "hang", st.arms?.[2] ?? 0, st.t ?? 0),
    front: (c) => { if (st.lamp && !st.back) lampFront(c); },
    headExtra: (c) => { if (st.back) hairBack(p, c, o.hair, !o.man); if (o.man && o.build !== "kid") topi(p, c, ["#7a2f52", "#2f3f6a", "#5a2a2a"][v % 3]); else if (!st.back && !o.man) p.ell(c.cx, c.crown + 6 * c.u, 20 * c.u, 14 * c.u, o.hair, 3 * c.u); } });
};

/** Krishna, seen from behind: blue skin, yellow garment, crown with a peacock feather, soft golden aura. g = glow 0..1, arm 0..1 */
export const drawKrishna = (p, st = {}) => {
  const g = p.g, glow = st.glow ?? 0.6;
  g.save(); g.translate(300, 520); g.scale(1, 1.65);
  const gr = g.createRadialGradient(0, 0, 20, 0, 0, 295);
  gr.addColorStop(0, `rgba(255,236,160,${0.8 * glow})`); gr.addColorStop(0.5, `rgba(255,214,110,${0.4 * glow})`); gr.addColorStop(1, "rgba(255,214,110,0)");
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 295, 0, Math.PI * 2); g.fill(); g.restore();
  const o = { jacket: "#e9b92c", pants: "#e9b92c", boots: "#3a5fb0", skin: "#4a72c4", dress: "#efc23a", hat: "hair", hair: "#141018" };
  bodyFront(p, o, { mode: "stand", seed: 7, back: true, facing: 0,
    armFn: armBlend("hang", "raise", st.arm ?? 0),
    behind: (c) => {}, front: (c) => {
      // flowing scarf across the back
      const { p: q, tcx, T, chin, HH, u } = c;
      q.band([[tcx - 1.1 * T.a, chin + 0.15 * HH], [tcx, chin + 0.35 * HH], [tcx + 1.1 * T.a, chin + 0.1 * HH]], "#e0533a", 9 * u, 2 * u, "round");
    },
    headExtra: (c) => {
      hairBack(p, c, "#3a2f5c", false);
      for (const s of [-1, 0, 1]) p.stroke([[c.cx + s * 30 * c.u, c.hc - 0.25 * c.HH], [c.cx + s * 38 * c.u, c.hc + 0.3 * c.HH]], 2.2 * c.u, "#5a4a8a");
      p.band([[c.cx - 50 * c.u, c.hc + 0.05 * c.HH], [c.cx + 50 * c.u, c.hc + 0.05 * c.HH]], "#f0c63c", 5 * c.u, 1.5 * c.u, "round");
      const { cx, crown, HH, u } = c, yb = crown + 0.22 * HH;
      // golden crown (mukut) with a peacock feather
      p.poly([[cx - 40 * u, yb], [cx - 34 * u, yb - 0.32 * HH], [cx - 14 * u, yb - 0.2 * HH], [cx, yb - 0.42 * HH], [cx + 14 * u, yb - 0.2 * HH], [cx + 34 * u, yb - 0.32 * HH], [cx + 40 * u, yb]], "#f0c63c", 4 * c.u);
      p.dot(cx, yb - 0.2 * HH, 6 * u, "#d23a33");
      p.stroke([[cx + 6 * u, yb - 0.36 * HH], [cx + 22 * u, yb - 0.78 * HH]], 3 * u, "#2f7a3a");
      p.ell(cx + 24 * u, yb - 0.84 * HH, 15 * u, 22 * u, "#2a9a6a", 3 * u, 0, 360, 20);
      p.ell(cx + 24 * u, yb - 0.84 * HH, 8 * u, 12 * u, "#3a6fd0", 0, 0, 360, 20);
      p.ell(cx + 24 * u, yb - 0.85 * HH, 3.5 * u, 5 * u, "#141018", 0, 0, 360, 20);
    } });
};

/** Akash Bhairav mask on a 900 x 1100 canvas (face centre 450, 640) */
export const drawMask = (p, st = {}) => {
  p.ol = 10;
  const cx = 450, cy = 650, gold = "#f0c03a", goldD = "#c48a22";
  // crown back plate
  const crown = [[cx - 300, 470], [cx - 330, 300], [cx - 250, 330], [cx - 210, 170], [cx - 120, 250], [cx, 60], [cx + 120, 250], [cx + 210, 170], [cx + 250, 330], [cx + 330, 300], [cx + 300, 470]];
  p.poly(crown, gold, 12);
  for (const [x, y] of [[cx - 200, 300], [cx, 200], [cx + 200, 300]]) { p.ell(x, y, 34, 40, "#d23a33", 8); p.ell(x, y - 6, 12, 14, "#ffb0a8", 0); }
  for (const [x, y] of [[cx - 110, 360], [cx + 110, 360]]) p.ell(x, y, 22, 26, "#2f9a5a", 7);
  // ear rings
  for (const s of [-1, 1]) { p.arc(cx + s * 300, cy + 130, 44, 56, 0, 360, 16, goldD); p.arc(cx + s * 300, cy + 130, 44, 56, 0, 360, 9, gold); }
  // face
  const F = { a: 285, b: 300, nTop: 2.1, nBot: 2.4, egg: -0.08, asym: 0, rot: 0, noise: 0.004, seed: 3 };
  const fp = blobPts(cx, cy, F);
  p.shadedFill(fp, "#3a74d6", "#24519f", rad(-120), 285, 0.4);
  p.inkRing(fp, 16, thickAngle(rad(-120)));
  // crown band over the forehead
  p.band([[cx - 270, 450], [cx, 410], [cx + 270, 450]], gold, 46, 6, "round");
  for (let i = -3; i <= 3; i++) p.ell(cx + i * 70, 432 + Math.abs(i) * 6, 13, 13, i % 2 ? "#d23a33" : "#2f9a5a", 5);
  // third eye
  p.ell(cx, 515, 22, 40, "#ffffff", 7); p.ell(cx, 520, 9, 16, INK, 0);
  // brows
  for (const s of [-1, 1]) p.poly([[cx + s * 50, 590], [cx + s * 210, 520], [cx + s * 240, 560], [cx + s * 70, 615]], "#1d1a2a", 0);
  // eyes
  const look = st.look ?? 0;
  for (const s of [-1, 1]) { p.ell(cx + s * 130, 650, 72, 58, "#ffffff", 9); p.ell(cx + s * 130 + look * 22, 655, 30, 32, INK, 0); p.ell(cx + s * 130 + look * 22 - 10, 642, 8, 8, "#ffffff", 0); }
  // nose
  p.poly([[cx - 22, 690], [cx + 22, 690], [cx + 48, 770], [cx, 790], [cx - 48, 770]], "#3168c8", 8);
  // moustache
  for (const s of [-1, 1]) p.poly([[cx, 805], [cx + s * 120, 790], [cx + s * 210, 740], [cx + s * 200, 790], [cx + s * 120, 835], [cx, 830]], "#1d1a2a", 0);
  // mouth: wide open grin, teeth + two small fangs
  p.ell(cx, 850, 175, 95, "#7a1a26", 9, 0, 180);
  p.clip(ellPts(cx, 850, 175, 95, 0, 180), () => {
    p.poly([[cx - 175, 850], [cx + 175, 850], [cx + 175, 885], [cx - 175, 885]], "#ffffff", 0);
    for (const s of [-1, 1]) p.poly([[cx + s * 95, 850], [cx + s * 125, 850], [cx + s * 110, 905]], "#ffffff", 5);
    p.ell(cx, 935, 80, 30, "#e86e78", 0);
  });
  p.ell(cx, 850, 175, 95, null, 10, 0, 180);
  p.stroke([[cx - 180, 848], [cx + 180, 848]], 10, "#d23a33");
};

/** Sudarshan chakra on a 600 x 600 canvas */
export const drawChakra = (p) => {
  const c = 300, n = 24, pts = [];
  for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2, r = i % 2 ? 250 : 290; pts.push([c + r * Math.cos(a), c + r * Math.sin(a)]); }
  p.poly(pts, "#f3c63e", 10);
  p.ell(c, c, 215, 215, "#ffdf72", 9);
  p.ell(c, c, 170, 170, "#e8a92a", 8);
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; p.band([[c + 40 * Math.cos(a), c + 40 * Math.sin(a)], [c + 165 * Math.cos(a), c + 165 * Math.sin(a)]], "#fff0b0", 14, 4, "round"); }
  p.ell(c, c, 52, 52, "#fff6d0", 8);
  p.ell(c, c, 18, 18, "#d23a33", 5);
};

/** soft additive glow on a 256 x 256 canvas */
export const drawGlow = (p, col = "255,226,140") => {
  const g = p.g, gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, `rgba(${col},1)`); gr.addColorStop(0.3, `rgba(${col},0.55)`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
};

/** round helmet lying on the ground (300 x 200) */
export const drawHelmetProp = (p, col) => {
  p.ell(150, 150, 110, 80, "#c99a45", 9, 180, 360);
  p.band([[38, 150], [262, 150]], "#a87a32", 18, 6, "round");
  p.poly([[150, 75], [210, 30], [250, 50], [170, 92]], col, 7);
};
/** fallen banner on the ground (500 x 200) */
export const drawFallenFlag = (p, col) => {
  p.band([[30, 170], [470, 120]], "#7a4b2a", 12, 4, "round");
  p.poly([[300, 128], [470, 108], [440, 60], [470, 20], [300, 50]], col, 7);
};
/** rolling tumbleweed (300 x 300) */
export const drawTumble = (p) => {
  for (let i = 0; i < 9; i++) p.arc(150, 150, 120 - i * 6, 110 - i * 9, i * 40, i * 40 + 300, 7, i % 2 ? "#a8854a" : "#8a6a3a");
};
/** dust puff (300 x 300), t 0..1 */
export const drawPuff = (p, t) => {
  for (let i = 0; i < 7; i++) {
    const a = rad(140 + i * 40), d = 30 + 90 * t, r = (46 + 18 * (i % 2)) * (1 - 0.55 * t);
    p.ell(150 + d * Math.cos(a), 170 + d * 0.6 * Math.sin(a), r, r * 0.85, `rgba(240,228,206,${(1 - t * t).toFixed(3)})`, Math.max(0, 6 * (1 - t * 1.6)));
  }
};
