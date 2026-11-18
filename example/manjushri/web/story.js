// "मञ्जुश्रीको ताल" — every function is a pure function of the frame f (30 fps, 966 frames).
import * as T from "./toon.js";
import { FOSSILS } from "./world.js";
import { clamp, lin, smooth, smoother, easeOut, back, mixv, q, camFromKeys, drift, kick, idle, blinkAt } from "./motion.js";

export const TOTAL = 966;
export const AREA = { V: [0, 0, 0], S: [3000, 0, 0], F: [-3000, 0, 0], D: [6000, 0, 0] };
export const VW = { R: 150, MJ: [-11, 9.1, 154], SAD: 150 };
const S_ = AREA.S, F_ = AREA.F, D_ = AREA.D, MJ = VW.MJ;
const rnd = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

// ---------------- shots ----------------
export const SHOTS = [
  { id: 1, f0: 0, f1: 148 },    // Manjushri from behind, sword blazing, lake below
  { id: 2, f0: 148, f1: 310 },  // to the lotus, back to the saddle, the strike
  { id: 3, f0: 310, f1: 441 },  // the water rushes out, fields and villages
  { id: 4, f0: 441, f1: 476 },  // villages become the modern city
  { id: 8, f0: 476, f1: 570 },  // science: the cut-away valley floor, the lake was real
  { id: 5, f0: 570, f1: 698 },  // back to the ancient lake: the earthquake
  { id: 6, f0: 698, f1: 880 },  // today's street, then the lake floor
  { id: 7, f0: 880, f1: 966 },  // the question
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.f0 && f < s.f1) ?? SHOTS[SHOTS.length - 1];

// ---------------- light ----------------
export const LIGHTS = {
  myth: { top: "#262c74", hor: "#ffc08a", bot: "#4a5a8a", fog: "#d6a6b0", fogNear: 90, fogFar: 950, sun: "#ffd8a0", sunI: 2.3, az: 150, el: 11, sunSky: "#ffb070", hemiSky: "#c0b4ff", hemiGround: "#5a4a6a", hemiI: 1.12, card: "#fff0e2", sat: 1.14, vig: 0.36 },
  mythDay: { top: "#3f7ed6", hor: "#f6dcb0", bot: "#9fb98a", fog: "#e2e2dc", fogNear: 120, fogFar: 1100, sun: "#fff0d0", sunI: 2.6, az: 150, el: 38, sunSky: "#fff0c0", hemiSky: "#e0ecff", hemiGround: "#8a7a50", hemiI: 1.2, card: "#ffffff", sat: 1.12, vig: 0.28 },
  modern: { top: "#4a8ae0", hor: "#d8e6f2", bot: "#9fb0a0", fog: "#d6e2ec", fogNear: 120, fogFar: 1100, sun: "#fff4e0", sunI: 2.6, az: 200, el: 45, sunSky: "#fff0c0", hemiSky: "#dceaff", hemiGround: "#8a7a60", hemiI: 1.22, card: "#ffffff", sat: 1.1, vig: 0.28 },
  storm: { top: "#20243f", hor: "#a8706a", bot: "#2a2a3a", fog: "#6c5c74", fogNear: 60, fogFar: 700, sun: "#e0a8a0", sunI: 1.15, az: 165, el: 9, sunSky: "#c06a5a", hemiSky: "#7a7ab0", hemiGround: "#3a3040", hemiI: 0.9, card: "#d8ccdc", sat: 0.98, vig: 0.46 },
  street: { top: "#4a7ad0", hor: "#ffd8a8", bot: "#a08a70", fog: "#e8c8a8", fogNear: 40, fogFar: 320, sun: "#ffd8a0", sunI: 2.4, az: 210, el: 26, sunSky: "#ffc080", hemiSky: "#d8e4ff", hemiGround: "#8a6a50", hemiI: 1.15, card: "#fff2e2", sat: 1.12, vig: 0.3 },
  under: { top: "#5ac0e8", hor: "#1f6f9a", bot: "#103a5a", fog: "#2f80ac", fogNear: 6, fogFar: 140, sun: "#c8f0ff", sunI: 2.0, az: 210, el: 70, sunSky: "#000000", hemiSky: "#9fe0ff", hemiGround: "#1a4a6a", hemiI: 1.3, card: "#c4e6ff", sat: 1.06, vig: 0.42 },
  dusk: { top: "#33367a", hor: "#ff9a5a", bot: "#5a3a4a", fog: "#e8907a", fogNear: 60, fogFar: 700, sun: "#ffb070", sunI: 2.1, az: 180, el: 6, sunSky: "#ff8040", hemiSky: "#b0a0d0", hemiGround: "#6a4a3a", hemiI: 1.1, card: "#ffe6d2", sat: 1.15, vig: 0.34 },
};
const hx = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const toHex = (c) => "#" + c.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, "0")).join("");
const mixL = (A, B, t) => { const o = {}; for (const k of new Set([...Object.keys(A), ...Object.keys(B)])) { const a = A[k] ?? B[k], b = B[k] ?? A[k]; o[k] = typeof a === "string" ? toHex(mixv(hx(a), hx(b), t)) : a + (b - a) * t; } return o; };
const seq = (f, keys) => {
  const L0 = (k) => ({ ...LIGHTS[k[1]], ...(k[2] ?? {}) });
  if (f <= keys[0][0]) return L0(keys[0]);
  for (let i = 1; i < keys.length; i++) if (f <= keys[i][0]) return mixL(L0(keys[i - 1]), L0(keys[i]), smooth(lin(f, keys[i - 1][0], keys[i][0])));
  return L0(keys[keys.length - 1]);
};
export const lightAt = (f) => {
  const s = shotAt(f);
  switch (s.id) {
    case 1: return { ...LIGHTS.myth, el: 9 + 3 * lin(f, 0, 148) };
    case 2: return LIGHTS.myth;
    case 3: return seq(f, [[310, "myth"], [430, "mythDay"]]);
    case 4: return seq(f, [[441, "mythDay"], [476, "modern"]]);
    case 8: return { ...LIGHTS.modern, az: 25, el: 36, hemiI: 1.28 };
    case 5: return { ...LIGHTS.storm, sunI: 1.15 - 0.25 * smooth(lin(f, 615, 640)) };
    case 6: return seq(f, [[820, "street"], [852, "under"]]);
    default: return { ...LIGHTS.dusk, el: 6 - 2 * lin(f, 880, 966) };
  }
};

// ---------------- walker (shot 6) ----------------
const heroZ = (f) => { const t = f - 698; return S_[2] - 20 + 0.045 * Math.min(t, 147) + 0.02 * Math.max(0, t - 147); };

// ---------------- cameras ----------------
const K = {
  1: [{ f: 0, pos: [-15, 11.2, 178], look: [-9.5, 17.5, 140], fov: 46 }, { f: 148, pos: [-19, 30, 194], look: [-4, 0, 50], fov: 48 }],
  2: [{ f: 148, pos: [-19, 30, 194], look: [-4, 0, 50], fov: 48 },
      { f: 212, pos: [2.2, 3.4, 15], look: [0, 1.6, 0], fov: 44, via: [[-12, 22, 120], [-4, 9, 46]] },
      { f: 230, pos: [1.6, 2.7, 10.5], look: [0, 1.8, 0], fov: 42 },
      { f: 231, pos: [-6.5, 25, 208], look: [-3, 6.5, 152], fov: 50, ease: "lin" },
      { f: 281, pos: [-6, 24, 203], look: [-3, 6, 152], fov: 50 },
      { f: 310, pos: [-5, 27, 212], look: [-1.5, 4, 152], fov: 50, roll: 0 }],
  3: [{ f: 310, pos: [9, 9, 206], look: [0, 4, 150], fov: 46 }, { f: 360, pos: [7, 30, 222], look: [0, -2, 110], fov: 48, via: [[9, 18, 214]] }, { f: 441, pos: [0, 76, 246], look: [0, -8, 10], fov: 48 }],
  4: [{ f: 441, pos: [0, 76, 246], look: [0, -8, 10], fov: 48 }, { f: 476, pos: [-34, 82, 232], look: [0, -6, 0], fov: 48, ease: "lin" }],
  8: [{ f: 476, pos: [D_[0] + 4.4, -18.4, 6.4], look: [D_[0] - 0.4, -17.6, 0.4], fov: 44 }, { f: 515, pos: [D_[0] + 3.7, -18.15, 5.4], look: [D_[0] - 0.5, -17.4, 0.4], fov: 44 },
      { f: 516, pos: [D_[0] + 10, 3.4, 33], look: [D_[0], -6.2, -8], fov: 46, ease: "lin" }, { f: 570, pos: [D_[0] + 8.6, 2.2, 28.6], look: [D_[0], -6.6, -8], fov: 46 }],
  5: [{ f: 570, pos: [9, 14, 66], look: [0, 7, 150], fov: 44 }, { f: 698, pos: [5, 11, 100], look: [0, 6, 150], fov: 44 }],
  7: [{ f: 880, pos: [F_[0], 1.8, F_[2] + 7.4], look: [F_[0], 1.75, F_[2] - 0.5], fov: 42 }, { f: 966, pos: [F_[0] + 0.1, 1.75, F_[2] + 6.5], look: [F_[0], 1.8, F_[2] - 0.5], fov: 42 }],
};
const K6 = [{ f: 698, pos: [0.65, 1.2, 3.5], look: [0.25, 1.85, 0], fov: 44 }, { f: 790, pos: [0.75, 1.25, 3.7], look: [0.25, 1.95, 0], fov: 44 },
  { f: 836, pos: [0.9, 1.7, 4.8], look: [0.1, 3.9, -10], fov: 50 }, { f: 880, pos: [1.0, 1.8, 5.3], look: [0.0, 4.4, -10], fov: 50 }];
const KICKS = [[281, 0.9, 9], [284, 0.5, 7]];
export const camAt = (f) => {
  const s = shotAt(f);
  let c;
  if (s.id === 6) { const r = camFromKeys(K6, f), z = heroZ(f); c = { pos: [S_[0] + r.pos[0], r.pos[1], z + r.pos[2]], look: [S_[0] + r.look[0], r.look[1], z + r.look[2]], fov: r.fov, roll: 0 }; }
  else c = camFromKeys(K[s.id], f);
  const d = drift(f, s.id === 3 || s.id === 4 ? 0.15 : 0.02, s.id);
  let look = c.look.slice(), roll = c.roll ?? 0;
  for (const [at, a, n] of KICKS) { const k = kick(f, at, a, n); look = [look[0] + k[0], look[1] + k[1], look[2]]; }
  if (s.id === 2) roll += 3.5 * Math.sin(Math.PI * clamp(lin(f, 278, 304)));
  if (s.id === 5) { const sh = shakeAt(f); look = [look[0] + sh * 0.9 * Math.sin(f * 2.1), look[1] + sh * 0.7 * Math.cos(f * 2.9), look[2]]; roll += sh * 1.2 * Math.sin(f * 1.7); }
  return { pos: add3(c.pos, d), look, fov: c.fov ?? 40, roll };
};
const shakeAt = (f) => (f < 618 || f > 694 ? 0 : clamp(lin(f, 618, 626)) * (1 - smooth(lin(f, 672, 694))) * (0.55 + 0.45 * Math.sin(f * 0.37) ** 2));
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const s = shotAt(f), c = camAt(f);
  switch (s.id) {
    case 1: return { focus: dist(c.pos, add3(MJ, [0, 6, 0])), cInf: 3 * (1 - lin(f, 60, 140)) };
    case 2: return f < 231 && f > 196 ? { focus: dist(c.pos, [0, 1.6, 0]), cInf: 9 * clamp(lin(f, 196, 210)) } : { focus: 20, cInf: 0 };
    case 6: { const z = heroZ(f); return { focus: dist(c.pos, [S_[0] + 0.3, 1.9, z]), cInf: 9 - 5 * smooth(lin(f, 790, 836)) }; }
    case 7: return { focus: dist(c.pos, [F_[0], 1.6, F_[2] + 0.8]), cInf: 6 };
    case 8: return { focus: dist(c.pos, [D_[0] + 0.5, -18.4, D_[2] + 1.6]), cInf: f < 516 ? 7 : 0 };
    default: return { focus: 50, cInf: 0 };
  }
};
export const flashAt = (f) => {
  const fl = (a, len, k = 0.6, col = "#ffffff") => (f >= a - 2 && f < a + len ? { k: k * (f < a ? lin(f, a - 2, a) : 1 - smooth(lin(f, a, a + len))), col } : null);
  return fl(281, 16, 0.75, "#fff6e0") ?? fl(570, 14, 0.8) ?? fl(698, 14, 0.75) ?? fl(880, 12, 0.55, "#fff0e0") ?? fl(838, 14, 0.35, "#c8f0ff") ?? fl(623, 8, 0.22, "#d8d8ff") ?? fl(476, 8, 0.35) ?? fl(57, 10, 0.12, "#fff0c0") ?? { k: 0 };
};

// ---------------- world state ----------------
export const worldAt = (f) => {
  const Lt = lightAt(f), s = shotAt(f);
  const glow = toHex(hx(Lt.hor).map((v) => v * 0.22));
  const w = { camPos: camAt(f).pos, waterGlow: glow, level: 0, open: 0, flow: 0, village: 0, city: 0, stupa: 0, ghost: 0, shake: 0, under: 0, dwater: 0 };
  if (s.id === 2 || s.id === 3 || s.id === 4) {
    w.open = back(lin(f, 282, 300), 1.2);
    w.level = -6.6 * smoother(lin(f, 290, 405));
    w.flow = clamp(lin(f, 282, 292)) * (1 - 0.7 * lin(f, 380, 430));
    w.village = clamp(lin(f, 380, 430));
    w.city = clamp(lin(f, 442, 474));
    w.stupa = back(lin(f, 448, 468), 1.4);
  }
  if (s.id === 5) {
    w.shake = shakeAt(f) * 0.6;
    w.open = back(lin(f, 654, 676), 1.2);
    w.level = -2.6 * smoother(lin(f, 664, 698));
    w.flow = clamp(lin(f, 656, 668));
  }
  if (s.id === 6) w.under = 0.85 * smooth(lin(f, 828, 852));
  if (s.id === 8) w.dwater = smooth(lin(f, 538, 558));
  return w;
};
export const shadowCenter = (f) => {
  const s = shotAt(f);
  if (s.id === 1 || s.id === 2) return f > 196 && f < 231 ? [0, 0, 0] : MJ;
  if (s.id === 5) return [0, 6, 146];
  if (s.id === 6) return [S_[0], 0, heroZ(f) - 6];
  if (s.id === 7) return F_;
  if (s.id === 8) return f < 520 ? [D_[0], -20, D_[2] + 1] : [D_[0], 0, D_[2] - 15];
  return [0, -6, 60];
};

// ---------------- cards ----------------
const person = (id, pos, s, key, draw, res, extra = {}) => ({ id, pos, h: 2.25 * s, key: key + "@" + res, draw, res, design: [600, 1000], blobR: 0, shadow: true, groundY: pos[1], ...extra });
const fx = (id, pos, h, key, draw, design, extra = {}) => ({ id, pos, h, key, draw, res: 1, design, anchor: "center", bill: "screen", blend: "alpha", order: 2, ...extra });
const glowCard = (id, pos, h, col, op = 1, order = 1) => ({ id, pos, h, key: "glow|" + col, draw: (pp) => T.drawGlow(pp, col), res: 0.5, design: [256, 256], anchor: "center", bill: "screen", blend: "add", fog: false, noTint: true, opacity: op, order });
const armsAtS = (f) => { const k = q(smooth(lin(f, 532, 542)), 0.2); return ["magL", "up", k]; };
const norm = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const OVERLAYS = [[538, 569, "ताल = सत्य", "gold"], [838, 879, "तालको पिँध", "ice"]];
const seismo = (f) => { const v = []; for (let i = 0; i < 70; i++) { const g = f - 69 + i, a = 0.07 + 0.95 * shakeAt(g) * (0.6 + 0.4 * Math.sin(g * 0.9) ** 2); v.push(clamp(a * Math.sin(g * 2.7 + i * 0.4) * (0.7 + 0.3 * Math.sin(g * 5.1)), -1, 1)); } return v; };

export const actorsAt = (f, cam) => {
  const s = shotAt(f), A = [], C = camAt(f), w = worldAt(f);
  // ---- overlay text: a screen card in the top third, at the focus distance ----
  const screen = (id, upK, hK, key, draw, design, extra = {}) => { // a card fixed in screen space (top/bottom thirds), at the focus distance so DOF never blurs it
    const fwd = norm([C.look[0] - C.pos[0], C.look[1] - C.pos[1], C.look[2] - C.pos[2]]), right = norm(cross(fwd, [0, 1, 0])), up = cross(right, fwd);
    const D = clamp(dofAt(f).focus, 2.6, 30), vh = 2 * D * Math.tan((C.fov * Math.PI) / 360);
    const pos = [0, 1, 2].map((k) => C.pos[k] + fwd[k] * D + up[k] * vh * upK + right[k] * vh * 0.5625 * (extra.rightK ?? 0));
    A.push({ id, pos, h: vh * hK, key, draw, res: 1, design, anchor: "center", bill: "screen", blend: "alpha", fog: false, noTint: true, order: 10, ...extra });
  };
  for (const [a, b, text, style] of OVERLAYS) if (f >= a && f < b) {
    const pop = back(lin(f, a, a + 8), 1.6) * (1 - smooth(lin(f, b - 6, b)));
    if (pop > 0.02) screen("ov", 0.3, 0.13 * pop, "ov|" + text, (pp) => T.drawOverlay(pp, text, style), [1000, 240]);
  }
  // ---- hook question card: तरवार / कि / भूकम्प? ----
  if (f < 142) {
    const a = q(easeOut(lin(f, 3, 13)), 0.1), b = q(smooth(lin(f, 13, 20)), 0.2), c = q(back(lin(f, 19, 29), 1.6), 0.1);
    const j = f >= 19 && f < 34 ? q((1 - lin(f, 19, 34)) * (f % 2 ? 1 : -1), 0.25) : 0, out = 1 - smooth(lin(f, 128, 141));
    if (a > 0) screen("hook", 0.31, 0.22, `hook|${a}|${b}|${c}|${j}`, (pp) => T.drawHook(pp, a, b, c, j), [1000, 560], { opacity: out, rightK: -0.1 });
  }
  // ---- seismograph: the scientists' reading (5) ----
  if (s.id === 5 && f < 694) { const v = seismo(f), op = smooth(lin(f, 572, 586)) * (1 - smooth(lin(f, 680, 694)));
    screen("seis", -0.3, 0.075, "seis|" + f, (pp) => T.drawSeismo(pp, v), [1000, 220], { opacity: op }); }
  // ---- Manjushri (1, 2) ----
  if (s.id === 1 || s.id === 2) {
    let pose = ["swordUp", "swordUp", 1], ang = 0.1 + 0.05 * Math.sin(f * 0.06), glow = 0.7 + 0.3 * Math.exp(-((f - 60) ** 2) / 200);
    if (f >= 258) { const wind = smooth(lin(f, 258, 272)), str = back(lin(f, 272, 281), 1.4);
      ang = 0.1 - 0.45 * wind + (1.6 + 0.35) * str; pose = ["swordUp", "strike", clamp(str)]; glow = 0.8 + 0.2 * wind - 0.3 * lin(f, 285, 310); }
    const id_ = idle(f, 3), st = { pose: [pose[0], pose[1], q(pose[2], 0.1)], swordAng: q(ang, 0.05), glow: q(glow, 0.1) };
    const o_ = s.id === 2 ? w.open : 0;
    A.push({ id: "mj", pos: add3(MJ, [-12 * o_, id_.dy * 4 - 1.2 * o_, 0]), h: 2.25 * 1.4 * 4, key: `mj|${st.pose[2]}|${st.swordAng}|${st.glow}`, draw: (pp) => T.drawManjushri(pp, st), res: 1, design: [1400, 1400], blobR: 0, shadow: true, rotZ: id_.rot * 0.5 });
    A.push(glowCard("mjg", add3(MJ, [-12 * (s.id === 2 ? w.open : 0), 7, -1]), 22, "255,214,140", 0.3));
  }
  // ---- lotus (1-3) + its light ----
  if (s.id <= 3) {
    const y = Math.max(w.level, -0.25) + 0.05, op = 0.4 + 0.6 * clamp(lin(f, 150, 205));
    A.push({ id: "lotus", pos: [0, y, 0], h: 3.2, key: "lotus", draw: (pp) => T.drawLotus(pp, 1, 1), res: 1.2, design: [600, 420], bill: "yaw", noTint: true, order: 1 });
    A.push(glowCard("lotg", [0, y + 1.6, 0], 9 + 1.5 * Math.sin(f * 0.08), "255,236,180", 0.55 * op));
    A.push(glowCard("lotg2", [0, y + 14, 0], 40, "255,226,170", 0.12 * op * (f < 190 || f > 240 ? 1 : 0), 0));
  }
  // ---- strike slash (2) ----
  if (s.id === 2 && f >= 274 && f < 296) {
    const t = q(easeOut(lin(f, 274, 283)), 0.1);
    A.push({ id: "slash", pos: [-4.5, 12.5, 157], h: 17, key: "slash2|" + t, draw: (pp) => T.drawSlash2(pp, t), res: 0.6, design: [800, 800], anchor: "center", bill: "screen", blend: "add", fog: false, noTint: true, opacity: 1 - smooth(lin(f, 286, 298)), order: 5 });
  }
  if (s.id === 2 && f >= 280 && f < 300) { const op = 1 - smooth(lin(f, 286, 300));
    A.push({ id: "seam", pos: [0, 1.5, 160.6], h: 10, key: "crack|1", draw: (pp) => T.drawCrack(pp, 1), res: 0.8, design: [400, 1000], bill: "yaw", blend: "alpha", noTint: true, opacity: op, order: 3 });
    A.push(glowCard("seamg", [0, 6, 160], 16, "255,200,110", 0.7 * op)); }
  // ---- crack in the saddle (5) ----
  if (s.id === 5 && f >= 620) {
    const k = q(smooth(lin(f, 622, 652)), 0.05), op = 1 - smooth(lin(f, 660, 680));
    if (op > 0.02) { A.push({ id: "crack", pos: [0, 2.5, 139.4], h: 9, key: "crack|" + k, draw: (pp) => T.drawCrack(pp, k), res: 0.8, design: [400, 1000], bill: "yaw", blend: "alpha", noTint: true, opacity: op, order: 3 });
      A.push(glowCard("crackg", [0, 6, 139], 14, "255,160,80", 0.5 * k * op)); }
  }
  // ---- foam in the gorge while the water rushes out ----
  if (w.flow > 0.02) for (let i = 0; i < 10; i++) {
    const t = ((f * 0.025 + i / 10) % 1), z = 150 + t * 50, x = (rnd(i) - 0.5) * 11 * w.open, hh = 1.8 + rnd(i + 3) * 1.4, u = q((f * 0.08 + rnd(i)) % 1, 1 / 8);
    A.push({ id: "foam" + i, pos: [x, 2.1 + hh * 0.35, z], h: hh, key: "spl|" + u, draw: (pp) => T.fxSplash(pp, u), res: 0.5, design: [300, 300], anchor: "center", bill: "screen", blend: "alpha", noTint: false, opacity: 0.85 * w.flow * Math.sin(Math.PI * t), order: 2 });
  }
  // ---- shot 6: street ----
  if (s.id === 6) {
    const z = heroZ(f), ph = q(((z - S_[2]) / 1.3) % 1, 1 / 12), shock = f >= 846, bl = blinkAt(f, 4);
    const st = { phase: (ph + 1) % 1, expr: shock ? "shock" : "smile", blink: shock ? 0 : bl, headTilt: shock ? -6 : 0 };
    A.push(person("hero", [S_[0] + 0.3, 0, z], 1.0, `hero|${st.phase}|${st.expr}|${st.blink}`, (pp) => T.drawWalker(pp, st), 1.5));
    for (let i = 0; i < 10; i++) {
      const side = i % 2 ? 1 : -1, dir = rnd(i + 40) > 0.5 ? 1 : -1, x = S_[0] + side * (4.7 + rnd(i) * 0.7), zp = S_[2] - 50 + rnd(i + 20) * 40 + dir * (f - 698) * 0.04;
      const pp_ = q(((zp / 1.25) % 1 + 1) % 1, 1 / 10), backV = dir < 0;
      A.push(person("ped" + i, [x, 0.18, zp], 0.96 + rnd(i + 2) * 0.08, `ped|${i}|${pp_}|${backV}`, (pp) => T.drawPed(pp, i, { phase: pp_, back: backV }), 0.8));
    }
    if (w.under > 0.01) {
      A.push({ id: "rays", pos: [S_[0], 11, z - 16], h: 26, key: "rays", draw: (pp) => T.drawRays(pp), res: 0.5, design: [512, 1024], anchor: "center", bill: "yaw", blend: "add", fog: false, noTint: true, opacity: 0.45 * w.under, order: 2 });
      for (let i = 0; i < 9; i++) {
        const dir = i % 2 ? 1 : -1, sp = 0.05 + rnd(i) * 0.04, x0 = (((f - 830) * sp * dir + rnd(i + 9) * 24) % 24 + 24) % 24 - 12;
        const fz = z - 1.5 - rnd(i + 5) * 10, fy = 2.6 + rnd(i + 7) * 4.5, tw = q((f * 0.15 + i * 0.3) % 1, 1 / 6), v = i % 4;
        A.push({ id: "fish" + i, pos: [S_[0] + x0, fy + 0.2 * Math.sin(f * 0.1 + i), fz], h: 0.75 + rnd(i + 3) * 0.8, key: `fish|${v}|${tw}`, draw: (pp) => T.drawFish(pp, v, tw), res: 0.8, design: [300, 160], anchor: "center", bill: "yaw", flip: dir < 0, opacity: w.under / 0.85, blend: "alpha", order: 3 });
      }
      for (let i = 0; i < 16; i++) {
        const by = ((f - 828) * (0.05 + rnd(i) * 0.04) + rnd(i + 3) * 10) % 12;
        A.push({ id: "bub" + i, pos: [S_[0] + (rnd(i + 1) - 0.5) * 8, by + 0.3, z - 2 - rnd(i + 2) * 12], h: 0.18 + rnd(i + 4) * 0.2, key: "bub", draw: (pp) => T.drawBubble(pp), res: 0.6, design: [100, 100], anchor: "center", bill: "screen", blend: "alpha", fog: false, noTint: true, opacity: w.under, order: 4 });
      }
    }
  }
  // ---- quake dust when the ridge gives way (5) ----
  if (s.id === 5 && f >= 652) for (let i = 0; i < 5; i++) { const u = q(clamp(lin(f, 652 + i * 3, 684 + i * 3)), 1 / 10); if (u <= 0 || u >= 1) continue;
    if (i % 2) continue; A.push({ id: "dust" + i, pos: [(i - 2) * 3.0, 6 + u * 3, 141], h: 3.5 + u * 3, key: "puff|" + u, draw: (pp) => T.fxPuff(pp, u), res: 0.5, design: [300, 300], anchor: "center", bill: "screen", blend: "alpha", tint: "#9a8574", opacity: 0.55 * (1 - u), order: 3 }); }
  // ---- shot 8: scientist at the cut-away, fossils glow, the lake returns over the city ----
  if (s.id === 8) {
    const bl = blinkAt(f, 9), wow = f >= 540, pose = armsAtS(f), id_ = idle(f, 9);
    A.push(person("sci", [D_[0] + 0.6, -20 + id_.dy, D_[2] + 1.6], 1.0, `sci|${pose.join("|")}|${wow}|${bl}`, (pp) => T.drawScientist(pp, { pose, expr: wow ? "shock" : "whistle", blink: wow ? 0 : bl }), 1.4, { rotZ: id_.rot }));
    const gl = 0.25 + 0.75 * smooth(lin(f, 538, 552)) * (0.8 + 0.2 * Math.sin(f * 0.3));
    for (const [i, [cx, cy, sc]] of FOSSILS.entries()) for (const tile of [1, 2, 3]) {
      const x = -60 + (tile + cx / 512) * 20, y = -(cy / 1024) * 20; if (Math.abs(x) > 24) continue;
      A.push(glowCard(`fos${i}_${tile}`, [D_[0] + x, y, D_[2] + 0.3], 3.2 * sc, "200,240,255", (f < 520 && i === 0 && tile === 3 ? 0.6 : 0.35) * gl, 2));
    }
  }
  // ---- shot 7: sword ? rock, the mascot between ----
  if (s.id === 7) {
    const id_ = idle(f, 5);
    A.push(person("manche", [F_[0], id_.dy, F_[2] + 0.8], 1.0, "manche", (pp) => T.drawManche(pp, {}), 1.6, { rotZ: id_.rot }));
    const bob = 0.08 * Math.sin(f * 0.08), sw = back(lin(f, 884, 898), 1.5);
    if (sw > 0.02) { A.push({ id: "sword7", pos: [F_[0] - 0.95, 3.15 + bob, F_[2] - 1.2], h: 2.5 * sw, key: "sword7", draw: (pp) => T.drawSwordCard(pp, 1), res: 1, design: [400, 1000], anchor: "center", bill: "yaw", noTint: true, rotZ: 0.25, order: 2 });
      A.push(glowCard("sw7g", [F_[0] - 0.95, 3.15 + bob, F_[2] - 1.1], 3.2 * sw, "255,200,120", 0.5)); }
    const rk = back(lin(f, 890, 904), 1.5), ck = q(smooth(lin(f, 900, 925)), 0.1);
    if (rk > 0.02) A.push({ id: "rock7", pos: [F_[0] + 0.8, 0, F_[2] - 2.0], h: 1.55 * rk, key: "rock7|" + ck, draw: (pp) => T.drawCrackRock(pp, ck), res: 1, design: [700, 640], bill: "yaw", order: 1 });
    const qa = back(lin(f, 904, 914), 2.0), q2 = 1;
    if (qa > 0.02) A.push(fx("q", [F_[0] + 0.05, 2.75 + 0.05 * Math.sin(f * 0.25), F_[2] + 0.9], 0.7 * qa * q2, "q", (pp) => T.drawQ(pp, 150, 175, 270, "#ffffff"), [300, 340], { res: 1.4, rotZ: 0.15 * Math.sin(f * 0.2), noTint: true }));
  }
  return A;
};
