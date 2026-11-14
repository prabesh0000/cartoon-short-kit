// "यलम्बरको शिर" — every function here is a pure function of the frame f (30 fps, 1156 frames).
import * as T from "./toon.js";
import { clamp, lin, smooth, smoother, easeOut, back, spring, mixv, q, path, camFromKeys, drift, kick, idle, blinkAt } from "./motion.js";

export const TOTAL = 1156;
export const AREA = { A: [0, 0, 0], B: [1000, 0, 0], K: [-1000, 0, 0] };
const B = AREA.B, K = AREA.K;
const rnd = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

// ---------------- shots ----------------
export const SHOTS = [
  { id: 1, f0: 0, f1: 104, light: "day" },      // hook: MCU Yalambar
  { id: 2, f0: 104, f1: 178, light: "day" },    // lifts a boulder
  { id: 3, f0: 178, f1: 247, light: "dusty" },  // army arrives at Kurukshetra
  { id: 4, f0: 247, f1: 331, light: "dusty" },  // Krishna asks
  { id: 5, f0: 331, f1: 428, light: "dusty" },  // "whoever is losing"
  { id: 6, f0: 428, f1: 570, light: "dusty" },  // Krishna realises -> the scale
  { id: 7, f0: 570, f1: 672, light: "dusty" },  // switching, again, again
  { id: 8, f0: 672, f1: 790, light: "dusty" },  // both armies gone
  { id: 9, f0: 790, f1: 856, light: "storm" },  // the chakra
  { id: 10, f0: 856, f1: 976, light: "golden" },// the flight to Kathmandu
  { id: 11, f0: 976, f1: 1156, light: "dusk" }, // Indra Jatra
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.f0 && f < s.f1) ?? SHOTS[SHOTS.length - 1];

export const LIGHTS = {
  day: { top: "#4f93e0", hor: "#cfe5f6", bot: "#9fb98a", fog: "#c9def0", fogNear: 70, fogFar: 620, sun: "#fff3dc", sunI: 2.7, az: -35, el: 48, hemiSky: "#d8ecff", hemiGround: "#8a7a50", hemiI: 1.25, card: "#ffffff", sat: 1.12 },
  dusty: { top: "#5d9ad8", hor: "#f2dfbb", bot: "#d2b07a", fog: "#ecd9b4", fogNear: 60, fogFar: 520, sun: "#ffeccc", sunI: 2.8, az: -40, el: 46, hemiSky: "#e6eefa", hemiGround: "#a98a58", hemiI: 1.2, card: "#fffaf0", sat: 1.1 },
  storm: { top: "#211c38", hor: "#6a4a63", bot: "#3a2c34", fog: "#4c3a4e", fogNear: 25, fogFar: 260, sun: "#ffcf8a", sunI: 1.5, az: 20, el: 30, sunSky: "#ffb060", hemiSky: "#8a7aa8", hemiGround: "#3a2a2a", hemiI: 0.9, card: "#c9b8d4", sat: 1.05, vig: 0.42 },
  golden: { top: "#3f7fd0", hor: "#ffd7a0", bot: "#c7a26a", fog: "#f2cfa0", fogNear: 80, fogFar: 700, sun: "#ffd29a", sunI: 2.6, az: -150, el: 22, sunSky: "#ffb060", hemiSky: "#ffe6c8", hemiGround: "#7a6a4a", hemiI: 1.2, card: "#fff2e2", sat: 1.12 },
  dusk: { top: "#1b2558", hor: "#e48a5c", bot: "#3a2c3c", fog: "#7a5a72", fogNear: 40, fogFar: 380, sun: "#ff9a5a", sunI: 1.2, az: -120, el: 8, sunSky: "#ff8a4a", hemiSky: "#6a72b8", hemiGround: "#4a3428", hemiI: 1.0, card: "#f4dccc", lamps: 55, sat: 1.12, vig: 0.34 },
};
export const lightAt = (f) => shotAt(f).light;

// ---------------- the balance scale ----------------
export const SCALE = { pivot: [B[0], 5.0, B[2] - 40], half: 3.6, L: 2.3, panR: 1.2 };
export const panTops = (th) => {
  const S = SCALE, c = Math.cos(th), s = Math.sin(th);
  const endL = [S.pivot[0] - S.half * c, S.pivot[1] - S.half * s, S.pivot[2]], endR = [S.pivot[0] + S.half * c, S.pivot[1] + S.half * s, S.pivot[2]];
  return { endL, endR, L: [endL[0], endL[1] - S.L + 0.11, endL[2]], R: [endR[0], endR[1] - S.L + 0.11, endR[2]] };
};
// landings: [frame, side] ; side L means Yalambar lands on the left pan, which then goes down (theta +)
const HOPS = [{ t0: 487, t1: 499, from: "base", to: "L" }, { t0: 590, t1: 606, from: "L", to: "R" }, { t0: 626, t1: 637, from: "R", to: "L" }, { t0: 648, t1: 658, from: "L", to: "R" }, { t0: 724, t1: 736, from: "R", to: "ground" }];
const thetaAt = (f) => {
  let th = -0.17, last = -1e9, from = -0.17, to = -0.17;
  for (const h of HOPS) if (h.to === "L" || h.to === "R") { if (f >= h.t1) { from = th; to = h.to === "L" ? 0.21 : -0.21; th = to; last = h.t1; } }
  if (f >= 700) { // armies gone: Yalambar alone on the right pan, it still sinks a little less
    const k = smooth(lin(f, 700, 730)); return -0.21 + 0.06 * k * (f < 724 ? 1 : 1) + (f >= 736 ? 0.15 * smooth(lin(f, 736, 760)) : 0);
  }
  const t = f - last;
  return from + (to - from) * spring(t, 0.34, 0.11);
};
const BASE_SPOT = [B[0], 1.0, B[2] - 38.6];
const GROUND_SPOT = [B[0] + 0.3, 0, B[2] - 35.8];
const spotPos = (name, f) => name === "base" ? BASE_SPOT : name === "ground" ? GROUND_SPOT : add3(panTops(thetaAt(f))[name], [0, 0, 0.45]);
const yalScalePos = (f) => {
  let cur = "base";
  for (const h of HOPS) {
    if (f < h.t0) break;
    if (f < h.t1) {
      const t = (f - h.t0) / (h.t1 - h.t0), a = spotPos(h.from, f), b = spotPos(h.to, f);
      const p = mixv(a, b, smooth(t)); p[1] += 4 * t * (1 - t) * (h.to === "ground" ? 1.6 : 2.4);
      return { pos: p, air: true, t };
    }
    cur = h.to;
  }
  return { pos: spotPos(cur, f), air: false, spot: cur };
};

// ---------------- cameras ----------------
const keysA = {
  1: [{ f: 0, pos: [0.55, 1.5, 3.15], look: [0.03, 1.47, 0], fov: 36 }, { f: 104, pos: [0.28, 1.52, 2.65], look: [0.0, 1.49, 0], fov: 36 }],
  2: [{ f: 104, pos: [2.5, 0.42, 4.7], look: [0.15, 1.55, 0], fov: 42 }, { f: 178, pos: [1.45, 0.34, 4.35], look: [0.05, 1.8, 0], fov: 42 }],
  3: [{ f: 178, pos: [B[0] + 1.6, 2.0, 31], look: [B[0], 1.3, 20], fov: 40 }, { f: 247, pos: [B[0] + 0.4, 8.0, 34], look: [B[0], 2.0, -30], fov: 46 }],
  4: [{ f: 247, pos: [B[0] - 4.4, 1.7, 10.8], look: [B[0] + 0.9, 1.45, 8.4], fov: 36 }, { f: 331, pos: [B[0] - 4.1, 1.68, 10.6], look: [B[0] + 0.95, 1.45, 8.35], fov: 36 }],
  5: [{ f: 331, pos: [B[0] - 0.75, 1.5, 8.85], look: [B[0] + 1.4, 1.42, 8.2], fov: 34 }, { f: 428, pos: [B[0] - 0.42, 1.5, 8.72], look: [B[0] + 1.4, 1.44, 8.2], fov: 34, roll: 2 }],
  6: [{ f: 428, pos: [B[0] - 4.2, 1.75, 10.6], look: [B[0] + 0.4, 1.7, 8.4], fov: 36 }, { f: 470, pos: [B[0] - 3.5, 1.85, 10.15], look: [B[0] - 0.2, 1.95, 8.5], fov: 36 },
    { f: 494, pos: [B[0] + 6.4, 4.0, B[2] - 21.5], look: [B[0], 3.6, B[2] - 40], fov: 46, via: [[B[0] + 3, 6.5, -4]], ease: "smooth" }, { f: 570, pos: [B[0] + 5.9, 3.95, B[2] - 22.2], look: [B[0], 3.5, B[2] - 40], fov: 46 }],
  7: [{ f: 570, pos: [B[0] + 5.9, 3.95, B[2] - 22.2], look: [B[0], 3.5, B[2] - 40], fov: 46 }, { f: 672, pos: [B[0] + 4.9, 4.2, B[2] - 23.2], look: [B[0], 3.4, B[2] - 40], fov: 46 }],
  8: [{ f: 672, pos: [B[0] + 4.9, 4.2, B[2] - 23.2], look: [B[0], 3.4, B[2] - 40], fov: 46 }, { f: 726, pos: [B[0] + 9, 13, B[2] + 2], look: [B[0], 2, B[2] - 40], fov: 48 },
    { f: 790, pos: [B[0] + 1.2, 1.5, B[2] - 31.0], look: [B[0] + 0.25, 1.35, B[2] - 35.8], fov: 40 }],
  9: [{ f: 790, pos: [B[0] + 1.2, 1.5, B[2] - 31.0], look: [B[0] + 0.25, 1.35, B[2] - 35.8], fov: 40 }, { f: 808, pos: [B[0] + 1.35, 0.75, B[2] - 33.1], look: [B[0] + 0.25, 1.95, B[2] - 35.8], fov: 42 },
    { f: 826, pos: [B[0] + 1.2, 1.1, B[2] - 32.6], look: [B[0], 13, B[2] - 44], fov: 46 }, { f: 856, pos: [B[0] + 0.6, 4.6, B[2] - 35.6], look: [B[0], 13, B[2] - 44], fov: 46, roll: 6, ease: "in" }],
  11: [{ f: 976, pos: [K[0] + 3.0, 5.0, 17.5], look: [K[0], 2.4, -6], fov: 40 }, { f: 1040, pos: [K[0] + 1.0, 3.4, 12.5], look: [K[0], 2.5, -6], fov: 40 },
    { f: 1100, pos: [K[0] + 0.3, 2.9, 5.5], look: [K[0], 2.5, -6], fov: 38 }, { f: 1156, pos: [K[0], 2.55, -1.6], look: [K[0], 2.5, -6], fov: 39 }],
};
// the flight: Catmull-Rom path for the mask (frames 856..966)
const MASK_PATH = [[K[0] + 240, 78, 310], [K[0] + 160, 58, 200], [K[0] + 80, 36, 105], [K[0] + 22, 13, 30], [K[0], 2.45, -6]];
const MASK_LAND = 966;
const maskFlight = (f) => path(MASK_PATH, smoother(lin(f, 852, MASK_LAND)) * 0.6 + lin(f, 852, MASK_LAND) * 0.4);
const camS10 = (f) => {
  const m = maskFlight(f), m2 = maskFlight(f + 6);
  const dir = [m2[0] - m[0], m2[1] - m[1], m2[2] - m[2]], L = Math.hypot(dir[0], dir[2]) || 1;
  const side = [dir[2] / L, 0, -dir[0] / L]; // right of travel
  const k = smooth(lin(f, 930, 976));
  const follow = [m[0] + side[0] * 9 - dir[0] / L * 6, m[1] + 3.2, m[2] + side[2] * 9 - dir[2] / L * 6];
  const endPos = [K[0] + 3.0, 5.0, 17.5];
  return { pos: mixv(follow, endPos, k), look: mixv(m, [K[0], 2.4, -6], k), fov: 42 - 2 * k, roll: 3 * (1 - k) * Math.sin(f * 0.05) };
};

const KICKS = [[499, 0.05], [606, 0.06], [637, 0.06], [658, 0.07], [736, 0.04], [966, 0.08]];
export const camAt = (f) => {
  const s = shotAt(f);
  let c = s.id === 10 ? camS10(f) : camFromKeys(keysA[s.id], f);
  const d = drift(f, s.id === 10 ? 0.02 : 0.01, s.id);
  let pos = add3(c.pos, d), look = c.look.slice();
  for (const [at, a] of KICKS) { const k = kick(f, at, a); look = [look[0] + k[0], look[1] + k[1], look[2]]; }
  if (s.id === 9 && f >= 826) { const k = kick(f, 826 + ((f - 826) % 4), 0.02 * lin(f, 826, 850), 4); look = [look[0] + k[0], look[1] + k[1], look[2]]; }
  return { pos, look, fov: c.fov ?? 40, roll: c.roll ?? 0 };
};

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const s = shotAt(f), c = camAt(f), yp = yalPos(f);
  const eye = add3(yp.pos, [0, 1.5 * (yp.s ?? 1), 0]);
  switch (s.id) {
    case 1: return { focus: dist(c.pos, eye), cInf: 10 };
    case 2: return { focus: dist(c.pos, eye), cInf: 5 };
    case 3: return { focus: dist(c.pos, eye), cInf: 3 * (1 - lin(f, 200, 240)) };
    case 4: return { focus: dist(c.pos, eye), cInf: 9 };
    case 5: return { focus: dist(c.pos, eye), cInf: 10 };
    case 6: return f < 472 ? { focus: dist(c.pos, eye), cInf: 8 } : { focus: 20, cInf: 0 };
    case 7: return { focus: 20, cInf: 0 };
    case 8: return { focus: dist(c.pos, eye), cInf: 6 * lin(f, 740, 785) };
    case 9: return f < 818 ? { focus: dist(c.pos, eye), cInf: 7 } : { focus: dist(c.pos, CHAKRA), cInf: 5 * (1 - lin(f, 818, 840)) };
    case 10: return { focus: dist(c.pos, maskFlight(Math.min(f, MASK_LAND))), cInf: 4 };
    default: return { focus: dist(c.pos, [K[0], 2.45, -6]), cInf: 3 + 6 * lin(f, 1080, 1150) };
  }
};
export const flashAt = (f) => {
  if (f >= 840 && f < 872) { const k = f < 849 ? easeOut(lin(f, 840, 849)) : 1 - smooth(lin(f, 849, 872)); return { k, col: "#fff8e8" }; }
  if (f >= 176 && f < 184) return { k: 0.5 * (1 - lin(f, 178, 184)) * (f >= 178 ? 1 : lin(f, 176, 178)), col: "#ffffff" };
  if (f >= 964 && f < 976) return { k: 0.45 * (1 - lin(f, 966, 976)) * (f >= 966 ? 1 : 0), col: "#fff2c8" };
  return { k: 0 };
};

// ---------------- world state ----------------
const CHAKRA = [B[0], 13, B[2] - 44];
export const worldAt = (f) => {
  // boulder: rests, is lifted onto the hands (back ease), held, tossed and caught
  let boulder = [1.05, 0.42, 0.55], boulderRot = 0.3;
  if (f >= 110) {
    const t = back(lin(f, 110, 126), 1.4), hand = [0.0, 2.33 + 0.012 * Math.sin(f * 0.11), 0.06];
    boulder = mixv([1.05, 0.42, 0.55], hand, t); boulderRot = 0.3 + t * 2.0;
    if (f >= 146 && f < 162) { const u = lin(f, 146, 162); boulder[1] += 0.55 * 4 * u * (1 - u); boulderRot += u * 3; }
  }
  const s = shotAt(f);
  let kiratFlag = null;
  if (s.id === 3) { const y = yalPos(f).pos; kiratFlag = [y[0] + 0.62, 0, y[2] + 0.15]; }
  return { boulder, boulderRot, kiratFlag, theta: thetaAt(f), scaleOn: f >= 468 && f < 860, camPos: camAt(f).pos };
};
export const shadowCenter = (f) => {
  const s = shotAt(f);
  if (s.id <= 2) return [0, 0, 0];
  if (s.id === 3) return [B[0], 0, 18];
  if (s.id === 4 || s.id === 5 || (s.id === 6 && f < 472)) return [B[0], 0, 8];
  if (s.id <= 9) return [B[0], 0, B[2] - 36];
  if (s.id === 10) return f < 930 ? maskFlight(f).map((v, i) => (i === 1 ? 0 : v)) : [K[0], 0, -2];
  return [K[0], 0, -2];
};

// ---------------- Yalambar ----------------
const yalPos = (f) => {
  const s = shotAt(f);
  if (s.id <= 2) return { pos: [0, 0, 0], face: [0, 0, 1] };
  if (s.id === 3) return { pos: [B[0], 0, 22 - 1.3 * (f - 178) / 30], face: [0, 0, -1], march: true };
  if (s.id === 4 || s.id === 5 || (s.id === 6 && f < 472)) return { pos: [B[0] + 1.4, 0, 8.2], face: [-1, 0, 0.1] };
  if (f < 790) { const p = yalScalePos(f); return { pos: p.pos, face: [0, 0, 1], air: p.air, t: p.t, spot: p.spot }; }
  if (f < 860) return { pos: GROUND_SPOT, face: [0, 0, 1] };
  return { pos: [0, -100, 0], face: [0, 0, 1], hidden: true };
};
const ARM_TL = []; // [frame, pose] transitions, 6-frame blends
const armsAt = (f, plan) => {
  let prev = plan[0][1], cur = plan[0][1], t0 = -1e9;
  for (const [at, p] of plan) { if (f >= at) { prev = cur; cur = p; t0 = at; } }
  const k = smooth(lin(f, t0, t0 + 6));
  return k >= 1 ? ["hang", cur, 1].map((v, i) => (i === 0 ? cur : v)) : [prev, cur, k];
};
const exprAt = (f, plan) => { let e = plan[0][1]; for (const [at, x] of plan) if (f >= at) e = x; return e; };
const yalState = (f) => {
  const s = shotAt(f), P = yalPos(f);
  let arms = ["hang", "hang", 0], expr = "neutral", mode = "stand", phase = 0, look = 0, headTilt = 0, tilt = 0, dy = 0, sy = 1;
  if (s.id === 1) {
    arms = armsAt(f, [[0, "hip"], [80, "shrug"]]); expr = exprAt(f, [[0, "grin"], [82, "nervous"]]);
    headTilt = -7 * smooth(lin(f, 82, 92)); look = 0.4 * smooth(lin(f, 82, 92));
  } else if (s.id === 2) {
    arms = armsAt(f, [[104, "shrug"], [106, "hip"], [110, "up"]]); expr = exprAt(f, [[104, "grin"], [110, "pained"], [124, "grin"], [148, "laugh"], [162, "grin"]]);
    if (f >= 106 && f < 118) { const u = lin(f, 106, 118); dy = -0.06 * Math.sin(Math.PI * u); sy = 1 - 0.04 * Math.sin(Math.PI * u); }
  } else if (s.id === 3) {
    mode = "march"; phase = ((f - 178) / 30) % 1; expr = "grin";
  } else if (s.id === 4) {
    expr = exprAt(f, [[247, "smile"], [300, "neutral"]]); look = -0.8; arms = ["hang", "hip", 1];
  } else if (s.id === 5) {
    arms = armsAt(f, [[331, "hip"], [368, "pointL"], [398, "thumb"]]);
    expr = exprAt(f, [[331, "smile"], [368, "smile_closed"], [400, "grin"]]); look = f < 368 ? -0.6 : f < 398 ? -1 : 0;
    headTilt = f >= 404 && f < 424 ? 6 * Math.sin((f - 404) * 0.55) * (1 - lin(f, 404, 424)) : 0;
  } else if (s.id === 6 && f < 472) {
    arms = ["hang", "hip", 1]; expr = "grin"; look = -0.8;
  } else if (f < 790) {
    const air = P.air;
    expr = air ? "laugh" : f >= 736 ? exprAt(f, [[736, "nervous"], [770, "nervous"]]) : f >= 690 ? "shock" : "grin";
    arms = air ? ["cheer", "cheer", 1] : f >= 736 ? armsAt(f, [[736, "hang"], [764, "shrug"]]) : ["hip", "hip", 1];
    if (f >= 740) look = Math.sin((f - 740) / 9) * (f < 764 ? 1 : 0.3);
    if (P.air) { tilt = 8 * Math.sin(Math.PI * P.t); }
    // landing squash
    for (const h of HOPS) if (f >= h.t1 && f < h.t1 + 6) { const u = (f - h.t1) / 6; sy = 1 - 0.08 * Math.sin(Math.PI * u); }
  } else if (s.id === 9) {
    expr = "shock"; arms = armsAt(f, [[790, "shrug"], [796, "hang"]]);
  }
  return { pos: P.pos, face: P.face, arms, expr, mode, phase, look, headTilt, tilt, dy, sy, hidden: P.hidden };
};

// ---------------- cards ----------------
const facingBack = (face, pos, cam) => face[0] * (cam[0] - pos[0]) + face[2] * (cam[2] - pos[2]) < 0;
const person = (id, pos, s, key, draw, res, extra = {}) => ({ id, pos, h: 2.25 * s, key: key + "@" + res, draw, res, design: [600, 1000], blobR: 0.42 * s, shadow: true, groundY: pos[1], ...extra });

const ARMY = (() => {
  const out = [];
  for (const side of ["red", "blue"]) for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) {
    const sx = side === "red" ? -1 : 1, x = B[0] + sx * (11 + c * 2.3 + (r % 2) * 0.9), z = B[2] - 33 - r * 2.7 - rnd(r * 7 + c) * 0.8;
    const d = Math.hypot(x - B[0], z - (B[2] - 40));
    out.push({ side, v: (r * 7 + c) % 6, x, z, vf: 676 + Math.round(d * 1.15 + rnd(r * 13 + c) * 6), helmet: (r + c) % 3 === 0 });
  }
  return out;
})();
const PANS = { L: [["red", 0, -0.72, -0.25], ["red", 1, 0.0, -0.45], ["red", 2, 0.72, -0.25]], R: [["blue", 0, -0.72, -0.25], ["blue", 1, 0.0, -0.45], ["blue", 2, 0.72, -0.25]] };
const KIRAT_FORM = [[-1.6, 1.4], [1.6, 1.4], [-0.8, 2.8], [0.8, 2.8], [-2.4, 2.9], [2.4, 2.9], [-1.6, 4.3], [1.6, 4.3]];
const CROWD = (() => {
  const out = [];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 7; c++) {
    if (r === 0 && (c === 3)) continue;
    out.push({ v: r * 7 + c, x: K[0] - 5.4 + c * 1.8 + (r % 2) * 0.9 + (rnd(r * 9 + c) - 0.5) * 0.5, z: -1.2 + r * 1.7 + (rnd(r * 5 + c) - 0.5) * 0.4, lamp: (r * 7 + c) % 4 === 1 });
  }
  return out;
})();

export const actorsAt = (f, cam) => {
  const s = shotAt(f), A = [];
  // ---- Yalambar ----
  const y = yalState(f);
  if (!y.hidden) {
    const close = s.id === 1 || s.id === 5 || s.id === 4 || (s.id === 9 && f < 830) || (s.id === 8 && f > 760);
    const res = close ? 2.2 : 1.1, back_ = facingBack(y.face, y.pos, cam);
    const blink = blinkAt(f, 11);
    const key = `yal|${y.expr}|${y.arms[0]}|${y.arms[1]}|${q(y.arms[2], 0.17)}|${y.mode}|${q(y.phase, 1 / 12)}|${blink}|${q(y.look, 0.2)}|${back_}|${q(y.headTilt, 1)}|${q(y.tilt, 1)}`;
    const st = { expr: y.expr, arms: [y.arms[0], y.arms[1], q(y.arms[2], 0.17)], mode: y.mode, phase: q(y.phase, 1 / 12), blink, look: q(y.look, 0.2), back: back_, headTilt: q(y.headTilt, 1), tilt: q(y.tilt, 1), t: 0 };
    const id_ = idle(f, 3);
    const p = add3(y.pos, [0, y.dy + (y.mode === "stand" ? id_.dy * 0.5 : 0), 0]);
    A.push(person("yal", p, 1.0, key, (pp) => T.drawYalambar(pp, st), res, { rotZ: y.mode === "stand" ? id_.rot * 0.5 : 0, groundY: y.pos[1], blobR: yalPos(f).air ? 0 : 0.45 }));
    if (y.sy !== 1) A[A.length - 1].h *= y.sy;
  }
  // ---- Kirat warriors (shot 3) ----
  if (s.id === 3) {
    const yp = yalPos(f).pos;
    KIRAT_FORM.forEach(([dx, dz], i) => {
      const pos = [yp[0] + dx, 0, yp[2] + dz], ph = q((((f - 178) / 30) + rnd(i) * 0.3) % 1, 1 / 12);
      const bk = facingBack([0, 0, -1], pos, cam);
      A.push(person("kirat" + i, pos, 0.97, `kirat|${i % 3}|${ph}|${bk}`, (pp) => T.drawKirat(pp, i % 3, { mode: "march", phase: ph, back: bk }), 0.7));
    });
  }
  // ---- armies (shots 3..8) ----
  if (s.id >= 3 && s.id <= 9) {
    for (const [i, a] of ARMY.entries()) {
      const gone = f >= a.vf;
      if (!gone && s.id <= 8) {
        const worried = f >= 500 && f < a.vf;
        const ex = worried ? ((i % 3) === 0 ? "shock" : "nervous") : "stern";
        A.push(person("army" + i, [a.x, 0, a.z], 0.95, `army|${a.side}|${a.v}|${ex}`, (pp) => T.drawSoldier(pp, a.side, a.v, { expr: ex }), 0.45, { blobR: 0.4, shadow: s.id !== 3 }));
      }
      if (gone && f < a.vf + 16) A.push({ id: "apuff" + i, pos: [a.x, 0.9, a.z], h: 2.2, key: `puff|${q(lin(f, a.vf, a.vf + 16), 1 / 8)}`, draw: (pp) => T.drawPuff(pp, q(lin(f, a.vf, a.vf + 16), 1 / 8)), res: 0.6, design: [300, 300], anchor: "center", bill: "screen", blend: "alpha", order: 2 });
      if (gone && a.helmet) A.push({ id: "helm" + i, pos: [a.x + 0.2, 0, a.z + 0.3], h: 0.36, key: `helm|${a.side}`, draw: (pp) => T.drawHelmetProp(pp, a.side === "red" ? "#b5342c" : "#2d5fae"), res: 0.8, design: [300, 200], bill: "yaw" });
    }
  }
  // ---- Krishna (shots 4..6) ----
  if (s.id === 4 || s.id === 5 || (s.id === 6 && f < 472)) {
    const arm = s.id === 4 ? smooth(lin(f, 252, 262)) * (1 - 0.6 * smooth(lin(f, 296, 310))) : 0.4;
    const glow = 0.6 + 0.12 * Math.sin(f * 0.12) + (s.id === 6 ? 0.35 * smooth(lin(f, 448, 460)) : 0);
    A.push(person("krishna", [B[0] - 1.1, 0, 8.6], 1.04, `kr|${q(arm, 0.1)}|${q(glow, 0.1)}`, (pp) => T.drawKrishna(pp, { arm: q(arm, 0.1), glow: q(glow, 0.1) }), 1.6, { shadow: true }));
    if (s.id === 6 && f >= 450 && f < 470) {
      const u = lin(f, 450, 470);
      A.push({ id: "idea", pos: [B[0] - 1.05, 2.55, 8.6], h: 1.1, key: `burst|${q(u, 1 / 10)}`, draw: (pp) => T.fxBurst(pp, q(u, 1 / 10), "#ffe27a"), res: 0.6, design: [500, 500], anchor: "center", bill: "screen", blend: "alpha", order: 3 });
    }
  }
  // ---- soldiers on the pans (shots 6..8) ----
  if (f >= 468 && f < 790) {
    const th = thetaAt(f), pt = panTops(th);
    for (const side of ["L", "R"]) for (const [i, [team, v, dx, dz]] of PANS[side].entries()) {
      const vf = side === "L" ? 688 + i * 3 : 694 + i * 3;
      const base = add3(pt[side], [dx, 0, dz]);
      if (f < vf) {
        const winning = side === "L" ? th > 0.06 : th < -0.06, losing = side === "L" ? th < -0.06 : th > 0.06;
        const dizzy = f >= 640;
        const ex = dizzy ? "dazed" : losing ? "shock" : winning ? "grin" : "nervous";
        const arms = losing ? ["spear", "flail", 1] : winning ? ["spear", "cheer", 1] : ["spear", "spear", 0];
        const tt = q((f * 0.6) % 6.28, 0.7);
        A.push(person("pan" + side + i, base, 0.78, `pan|${team}|${v}|${ex}|${arms[1]}|${losing ? tt : 0}`, (pp) => T.drawSoldier(pp, team, v, { expr: ex, arms, t: losing ? tt : 0, noShield: losing }), 0.9, { blobR: 0.32 }));
      } else if (f < vf + 16) {
        A.push({ id: "ppuff" + side + i, pos: add3(base, [0, 0.8, 0.2]), h: 2.0, key: `puff|${q(lin(f, vf, vf + 16), 1 / 8)}`, draw: (pp) => T.drawPuff(pp, q(lin(f, vf, vf + 16), 1 / 8)), res: 0.6, design: [300, 300], anchor: "center", bill: "screen", blend: "alpha", order: 2 });
      } else if (i === 1) {
        A.push({ id: "phelm" + side, pos: add3(base, [0.1, 0, 0.2]), h: 0.34, key: `helm|${team}`, draw: (pp) => T.drawHelmetProp(pp, team === "red" ? "#b5342c" : "#2d5fae"), res: 0.8, design: [300, 200], bill: "yaw" });
      }
    }
    // landing dust on each hop
    for (const h of HOPS) if (f >= h.t1 && f < h.t1 + 12) {
      const u = q(lin(f, h.t1, h.t1 + 12), 1 / 8), p = spotPos(h.to, f);
      A.push({ id: "hopdust", pos: add3(p, [0, 0.35, 0.3]), h: 1.6, key: `puff|${u}`, draw: (pp) => T.drawPuff(pp, u), res: 0.6, design: [300, 300], anchor: "center", bill: "screen", blend: "alpha", order: 2 });
    }
  }
  // tumbleweed
  if (f >= 736 && f < 790) {
    const u = lin(f, 736, 790), x = B[0] + 9 - 16 * u;
    A.push({ id: "tumble", pos: [x, 0.45 + 0.12 * Math.abs(Math.sin(u * 20)), B[2] - 33.4], h: 0.9, key: "tumble", draw: (pp) => T.drawTumble(pp), res: 0.8, design: [300, 300], anchor: "center", bill: "yaw", rotZ: u * 14 });
  }
  // ---- the chakra (shot 9) ----
  if (s.id === 9 && f >= 798) {
    const appear = back(lin(f, 798, 812), 1.6), dive = easeOutIn(lin(f, 834, 850));
    const cp = mixv(CHAKRA, add3(cam, [0, -0.6, -1.5]), dive);
    A.push({ id: "chakraGlow", pos: cp, h: 9 * appear, key: "glowGold", draw: (pp) => T.drawGlow(pp, "255,214,120"), res: 1, design: [256, 256], anchor: "center", bill: "screen", blend: "add", fog: false, noTint: true, order: 1 });
    A.push({ id: "chakra", pos: cp, h: 3.4 * appear, key: "chakra", draw: (pp) => T.drawChakra(pp), res: 1.6, design: [600, 600], anchor: "center", bill: "screen", rotZ: -f * 0.42, fog: false, noTint: true, blend: "alpha", order: 2 });
  }
  // ---- the mask (shots 10, 11) ----
  if (s.id >= 10) {
    const landed = f >= MASK_LAND, mp = landed ? [K[0], 2.45, -6] : maskFlight(f);
    const glowK = landed ? 0.45 + 0.08 * Math.sin(f * 0.1) : 1;
    if (!landed) for (let j = 1; j <= 5; j++) {
      const pp_ = maskFlight(f - j * 2.5);
      A.push({ id: "trail" + j, pos: pp_, h: 3.4 - j * 0.35, key: "glowGold", draw: (pp) => T.drawGlow(pp, "255,214,120"), res: 1, design: [256, 256], anchor: "center", bill: "screen", blend: "add", fog: false, noTint: true, opacity: 0.55 - j * 0.09, order: 1 });
    }
    A.push({ id: "maskGlow", pos: add3(mp, [0, 0, -0.3]), h: 6.5 * glowK, key: "glowGold", draw: (pp) => T.drawGlow(pp, "255,214,120"), res: 1, design: [256, 256], anchor: "center", bill: "screen", blend: "add", fog: false, noTint: true, opacity: landed ? 0.7 : 0.9, order: 1 });
    A.push({ id: "mask", pos: mp, h: 2.6, key: "mask", draw: (pp) => T.drawMask(pp), res: 1.5, design: [900, 1100], anchor: "center", bill: landed ? "yaw" : "screen", rotZ: landed ? 0 : 0.12 * Math.sin(f * 0.13), noTint: !landed ? false : false, shadow: false });
    if (f >= MASK_LAND && f < MASK_LAND + 14) {
      const u = q(lin(f, MASK_LAND, MASK_LAND + 14), 1 / 8);
      A.push({ id: "landBurst", pos: [K[0], 2.4, -5.2], h: 5, key: `burst|${u}`, draw: (pp) => T.fxBurst(pp, u, "#ffe27a"), res: 0.8, design: [500, 500], anchor: "center", bill: "screen", blend: "alpha", order: 3 });
    }
  }
  // ---- Indra Jatra crowd (shots 10 end, 11) ----
  if (s.id === 11 || (s.id === 10 && f >= 930)) {
    for (const c of CROWD) {
      const pos = [c.x, 0, c.z], bk = facingBack([0, 0, -1], pos, cam);
      const cheer = f >= 1036 && f < 1110 && c.v % 3 !== 1 && !c.lamp;
      const arms = c.lamp ? ["hang", "namaste", 1] : cheer ? ["hang", "cheer", 1] : ["hang", "hang", 0];
      const ph = cheer ? q((f * 0.25 + c.v) % 6.28, 1.05) : 0;
      A.push(person("crowd" + c.v, pos, 0.95, `tw|${c.v}|${bk}|${arms[1]}|${ph}`, (pp) => T.drawTown(pp, c.v, { back: bk, arms, lamp: c.lamp, expr: "grin", t: ph }), 0.55, { blobR: 0.36, rotZ: cheer ? 0.03 * Math.sin(f * 0.3 + c.v) : 0 }));
      if (c.lamp) A.push({ id: "lampG" + c.v, pos: [c.x, 1.25, c.z - 0.1], h: 0.9, key: "glowLamp", draw: (pp) => T.drawGlow(pp, "255,190,90"), res: 0.5, design: [256, 256], anchor: "center", bill: "screen", blend: "add", fog: false, noTint: true, opacity: 0.7 + 0.2 * Math.sin(f * 0.7 + c.v), order: 1 });
    }
  }
  return A;
};
const easeOutIn = (t) => t * t * (3 - 2 * t) * t;
