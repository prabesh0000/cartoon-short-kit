// "पट्टा लगाएको साथी" — every function is a pure function of the frame f (30 fps, 1283 frames, no loop).
// Voice: inbox/momo.mp3 (42.76 s). Phrase onsets from -32 dB / 80 ms pauses + whisper words (see work/PLAN.md).
import * as T from "./toon.js";
import { clamp, lin, smooth, smoother, easeOut, back, spring, q, camFromKeys, drift, kick, idle, blinkAt } from "./motion.js";

export const TOTAL = 1283;
export const AREA = { A: [0, 0, 0], B: [300, 0, 0], C: [600, 0, 0], S: [900, 0, 0], M: [1200, 0, 0], N: [1500, 0, 0] };
const B_ = AREA.B, C_ = AREA.C, S_ = AREA.S, M_ = AREA.M, N_ = AREA.N;
const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const at = (A, x, y, z) => [A[0] + x, y, A[2] + z];
const PK = 3 / 1300, PZ = -3;
const DP = (x, y) => [S_[0] + (x - 500) * PK, 1.9 - (y - 650) * PK, S_[2] + PZ];

export const SHOTS = [
  { id: 1, f0: 0, f1: 127, area: "A" },      // hook: leash + lion shadow, title card
  { id: 2, f0: 127, f1: 191, area: "B" },    // lion on the rock at sunset
  { id: 3, f0: 191, f1: 238, area: "A" },    // lap dog on her lap (booth)
  { id: 4, f0: 238, f1: 370, area: "S" },    // five friends circle
  { id: 5, f0: 370, f1: 440, area: "A" },    // the empty chair: which two?
  { id: 6, f0: 440, f1: 512, area: "A" },    // phone: "आज मःम?"
  { id: 7, f0: 512, f1: 611, area: "A" },    // he looks at her face before replying
  { id: 8, f0: 611, f1: 662, area: "C" },    // park dog looks up at its owner
  { id: 9, f0: 662, f1: 814, area: "S" },    // word counter 89 vs 2
  { id: 10, f0: 814, f1: 847, area: "A" },   // "हस्, बेबी"
  { id: 11, f0: 847, f1: 934, area: "M" },   // shopping bags + tail wag
  { id: 12, f0: 934, f1: 1007, area: "A" },  // you alone with two plates (sting)
  { id: 13, f0: 1007, f1: 1080, area: "N" }, // lost poster
  { id: 14, f0: 1080, f1: 1141, area: "A", night: true }, // breakup: he walks back
  { id: 15, f0: 1141, f1: 1212, area: "A" }, // share screen
  { id: 16, f0: 1212, f1: 1283, area: "A" }, // leash unclips
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.f0 && f < s.f1) ?? SHOTS[SHOTS.length - 1];

// ---------------- light ----------------
export const LIGHTS = {
  cafe: { top: "#f4d8b0", hor: "#f6e2c4", bot: "#c8a27a", fog: "#e8d0b0", fogNear: 30, fogFar: 140, sun: "#fff0d8", sunI: 1.5, az: 150, el: 50, sunSky: "#000000", hemiSky: "#fff4e0", hemiGround: "#8a6a50", hemiI: 1.35, card: "#fff8f0", sat: 1.1, vig: 0.3, lamps: 2.2 },
  night: { top: "#08102a", hor: "#1a2450", bot: "#0a1020", fog: "#141c40", fogNear: 25, fogFar: 140, sun: "#8aa0ff", sunI: 0.55, az: 200, el: 40, sunSky: "#000000", hemiSky: "#ffd8b0", hemiGround: "#2a2440", hemiI: 0.95, card: "#ffe2cc", sat: 1.1, vig: 0.42, lamps: 4.5 },
  sunset: { top: "#4a3a8a", hor: "#ff9a4a", bot: "#c86a3a", fog: "#f49a5a", fogNear: 60, fogFar: 420, sun: "#ffb070", sunI: 2.2, az: 250, el: 10, sunSky: "#ffb060", hemiSky: "#ffd0a0", hemiGround: "#7a4a3a", hemiI: 1.1, card: "#ffe2c4", sat: 1.15, vig: 0.34 },
  park: { top: "#5aa8f0", hor: "#d6ecff", bot: "#a8c880", fog: "#d6ecff", fogNear: 60, fogFar: 300, sun: "#fff6e0", sunI: 2.5, az: 210, el: 45, sunSky: "#fff0c0", hemiSky: "#e4f2ff", hemiGround: "#7a8a50", hemiI: 1.15, card: "#ffffff", sat: 1.1, vig: 0.26 },
  studio: { top: "#0a1230", hor: "#16285a", bot: "#0a1230", fog: "#101c40", fogNear: 60, fogFar: 300, sun: "#ffffff", sunI: 1.3, az: 160, el: 40, sunSky: "#000000", hemiSky: "#ffffff", hemiGround: "#30406a", hemiI: 1.5, card: "#ffffff", sat: 1.06, vig: 0.34 },
  shop: { top: "#fff4f8", hor: "#f6e8ee", bot: "#e8dcd4", fog: "#f6e8ee", fogNear: 30, fogFar: 140, sun: "#ffffff", sunI: 1.4, az: 160, el: 55, sunSky: "#000000", hemiSky: "#ffffff", hemiGround: "#b8a8a0", hemiI: 1.6, card: "#ffffff", sat: 1.08, vig: 0.26, lamps: 1.0 },
  street: { top: "#060c22", hor: "#16204a", bot: "#0a1020", fog: "#121a3a", fogNear: 20, fogFar: 90, sun: "#7a90ff", sunI: 0.5, az: 200, el: 40, sunSky: "#000000", hemiSky: "#8090d0", hemiGround: "#1a1a2a", hemiI: 0.85, card: "#ffe6c8", sat: 1.12, vig: 0.45, lamps: 5.0 },
};
Object.assign(LIGHTS, {
  gold: { top: "#f2b878", hor: "#f6cc94", bot: "#b8865a", fog: "#e8b880", fogNear: 30, fogFar: 140, sun: "#ffb860", sunI: 2.4, az: 245, el: 14, sunSky: "#000000", hemiSky: "#ffe0b0", hemiGround: "#7a4a30", hemiI: 1.05, card: "#ffe2c0", sat: 1.18, vig: 0.4, lamps: 3.0 },
  evil: { top: "#2a0e3a", hor: "#4a1a5a", bot: "#1a0a20", fog: "#3a1040", fogNear: 20, fogFar: 90, sun: "#ff4a8a", sunI: 1.7, az: 115, el: 12, sunSky: "#000000", hemiSky: "#b070ff", hemiGround: "#200a20", hemiI: 0.95, card: "#f2c8f6", sat: 1.22, vig: 0.52, lamps: 1.2 },
  spot: { top: "#3a2a20", hor: "#4a3626", bot: "#2a1a12", fog: "#2a1e16", fogNear: 15, fogFar: 60, sun: "#ffe0b0", sunI: 0.55, az: 160, el: 70, sunSky: "#000000", hemiSky: "#ffe0c0", hemiGround: "#2a1a10", hemiI: 0.55, card: "#ffe6c8", sat: 1.05, vig: 0.62, lamps: 4.5 },
  screen: { top: "#2a3040", hor: "#3a4050", bot: "#1a1a24", fog: "#2a3040", fogNear: 15, fogFar: 70, sun: "#9ab8ff", sunI: 0.8, az: 160, el: 40, sunSky: "#000000", hemiSky: "#b0c8ff", hemiGround: "#2a2430", hemiI: 0.8, card: "#d8e4ff", sat: 1.0, vig: 0.5, lamps: 1.5 },
  love: { top: "#ffb0c8", hor: "#ffc8d8", bot: "#c87a8a", fog: "#f0b0c0", fogNear: 20, fogFar: 100, sun: "#ff9ac0", sunI: 1.8, az: 230, el: 20, sunSky: "#000000", hemiSky: "#ffd0e4", hemiGround: "#8a4a5a", hemiI: 1.2, card: "#ffe0ec", sat: 1.15, vig: 0.42, lamps: 2.5 },
  gloom: { top: "#5a6070", hor: "#7a8090", bot: "#3a3a44", fog: "#6a7080", fogNear: 20, fogFar: 90, sun: "#a8b8d8", sunI: 0.75, az: 170, el: 60, sunSky: "#000000", hemiSky: "#b0bcd0", hemiGround: "#3a3a44", hemiI: 0.9, card: "#d4dcec", sat: 0.72, vig: 0.5, lamps: 0.6 },
  gloom2: { top: "#2a3040", hor: "#3a4050", bot: "#1a1a24", fog: "#2a3040", fogNear: 12, fogFar: 50, sun: "#8aa0d0", sunI: 0.45, az: 170, el: 75, sunSky: "#000000", hemiSky: "#8090b0", hemiGround: "#1a1a24", hemiI: 0.6, card: "#bcc8e0", sat: 0.6, vig: 0.66, lamps: 0.3 },
  morning: { top: "#7ab8f0", hor: "#ffe8c8", bot: "#a8c880", fog: "#ffe8c8", fogNear: 60, fogFar: 300, sun: "#ffd8a0", sunI: 2.6, az: 240, el: 18, sunSky: "#ffd090", hemiSky: "#e8f0ff", hemiGround: "#6a7a40", hemiI: 1.05, card: "#fff2e0", sat: 1.15, vig: 0.3 },
  pop: { top: "#ffe8a0", hor: "#fff2c8", bot: "#d8a860", fog: "#ffe8b0", fogNear: 30, fogFar: 140, sun: "#fff0c0", sunI: 2.8, az: 200, el: 40, sunSky: "#000000", hemiSky: "#fff8e0", hemiGround: "#a07a50", hemiI: 1.6, card: "#fffaf0", sat: 1.25, vig: 0.22, lamps: 3.5 },
});
const hx2 = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixL = (A, B, t) => { if (t <= 0) return A; if (t >= 1) return B; const o = {};
  for (const k of new Set([...Object.keys(A), ...Object.keys(B)])) { const a = A[k] ?? B[k], b = B[k] ?? A[k];
    if (typeof a === "string" && a[0] === "#") { const x = hx2(a), y = hx2(b); o[k] = "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join(""); }
    else if (typeof a === "number") o[k] = a + (b - a) * t; else o[k] = t < 0.5 ? a : b; }
  return o; };
export const lightAt = (f) => { const s = shotAt(f), L = LIGHTS;
  switch (s.id) {
    case 1: return mixL(L.gold, L.evil, 0.35 * smooth(lin(f, 57, 64)));            // golden café; the leash tug pulls a hint of her purple in
    case 3: return L.evil;
    case 5: return L.spot;
    case 6: return L.screen;
    case 7: return mixL(L.cafe, L.evil, smooth(lin(f, 562, 584)));                  // he looks at her: the room turns to her colour
    case 8: return L.morning;
    case 10: return L.love;
    case 12: return mixL(L.gloom, L.gloom2, smooth(lin(f, 968, 990)));
    case 15: return mixL(L.cafe, L.evil, 0.5);
    case 16: return f < 1252 ? L.evil : mixL(L.evil, L.pop, smooth(lin(f, 1252, 1262)));
    default: return s.night ? L.night : { A: L.cafe, B: L.sunset, C: L.park, S: L.studio, M: L.shop, N: L.street }[s.area];
  } };

// ---------------- places (café, relative to A = origin) ----------------
const F = [0, 0.2, -2.05], G = [0.78, 0.2, -2.12], YOU = [2.7, 0.2, -2.9], SIDE = [3.45, 0.2, -2.95];
const GBOOTH = [-3.0, 0.33, -3.35];

// ---------------- cameras ----------------
const K = {
  1: [{ f: 0, pos: [-0.5, 1.62, 1.45], look: [0, 1.42, -2.05], fov: 36 }, { f: 56, pos: [-0.15, 1.58, 1.05], look: [0, 1.42, -2.05], fov: 36, ease: "lin", via: [[-0.35, 1.6, 1.3]] },
    { f: 63, pos: [-0.08, 1.57, 0.8], look: [0.02, 1.42, -2.05], fov: 33, ease: "out" }, { f: 127, pos: [0.22, 1.55, 0.72], look: [0.02, 1.41, -2.05], fov: 33, ease: "lin" }],
  2: [{ f: 127, pos: at(B_, 1.5, 0.55, 5.4), look: at(B_, 0, 1.75, -3), fov: 40 }, { f: 158, pos: at(B_, 1.3, 1.1, 5.0), look: at(B_, -0.05, 1.95, -3), fov: 40, ease: "smooth" },
    { f: 168, pos: at(B_, 1.25, 1.2, 4.9), look: at(B_, -0.1, 2.0, -3), fov: 40, roll: -3, ease: "out" }, { f: 191, pos: at(B_, 1.15, 1.35, 4.8), look: at(B_, -0.15, 2.0, -3), fov: 40, roll: -1, ease: "smooth" }],
  3: [{ f: 191, pos: [-3.3, 1.22, -0.35], look: [-3.0, 0.98, -3.3], fov: 38, roll: -5 }, { f: 238, pos: [-3.08, 1.14, -0.75], look: [-3.0, 0.98, -3.3], fov: 38, roll: -9, ease: "lin" }],
  4: [{ f: 238, pos: add3(DP(440, 640), [0, 0, 6.1]), look: DP(470, 640), fov: 40, roll: -2 }, { f: 370, pos: add3(DP(540, 660), [0, 0, 5.4]), look: DP(520, 660), fov: 40, roll: 1.5, ease: "lin" }],
  5: [{ f: 370, pos: [2.7, 2.1, -0.7], look: [2.7, 0.7, -2.95], fov: 38 }, { f: 440, pos: [2.7, 1.0, -1.25], look: [2.7, 0.82, -2.95], fov: 38, ease: "smooth" }],
  6: [{ f: 440, pos: [2.6, 1.3, -0.9], look: [2.7, 0.62, -2.6], fov: 40, roll: -2 }, { f: 512, pos: [2.76, 1.26, -1.05], look: [2.7, 0.62, -2.6], fov: 40, roll: 2, ease: "lin" }],
  7: [{ f: 512, pos: [0.1, 1.3, 1.9], look: [0.12, 1.0, -2.08], fov: 42 }, { f: 560, pos: [0.18, 1.29, 1.75], look: [0.2, 1.0, -2.08], fov: 42, ease: "lin" },
    { f: 611, pos: [0.5, 1.26, 1.45], look: [0.48, 1.02, -2.08], fov: 42, ease: "smooth" }],
  8: [{ f: 611, pos: at(C_, -0.55, 0.55, 2.4), look: at(C_, -0.2, 0.85, -2.3), fov: 40 }, { f: 662, pos: at(C_, 0.4, 0.75, 2.3), look: at(C_, 0.22, 0.95, -2.3), fov: 40, ease: "lin" }],
  9: [{ f: 662, pos: add3(DP(500, 640), [0.15, 0, 6.2]), look: DP(500, 640), fov: 40, roll: 1.5 }, { f: 814, pos: add3(DP(500, 660), [-0.15, 0, 5.6]), look: DP(500, 660), fov: 40, roll: -1.5, ease: "lin" }],
  10: [{ f: 814, pos: [-0.3, 1.24, 0.5], look: [0.0, 1.08, -2.05], fov: 34 }, { f: 847, pos: [0.3, 1.2, 0.4], look: [0.0, 1.08, -2.05], fov: 34, ease: "lin", via: [[0, 1.22, 0.38]] }],
  11: [{ f: 847, pos: at(M_, -0.7, 1.45, 2.3), look: at(M_, 0.22, 1.28, -2.5), fov: 40 }, { f: 934, pos: at(M_, 1.0, 1.4, 2.0), look: at(M_, 0.3, 1.28, -2.5), fov: 40, ease: "lin", via: [[M_[0] + 0.15, 1.42, 1.85]] }],
  12: [{ f: 934, pos: [2.75, 1.25, 0.6], look: [2.72, 0.98, -2.9], fov: 36 }, { f: 970, pos: [2.74, 1.24, 0.4], look: [2.72, 0.98, -2.9], fov: 36, ease: "lin" },
    { f: 1000, pos: [2.72, 1.12, -0.9], look: [2.71, 1.0, -2.9], fov: 56, roll: 3, ease: "smooth" }, { f: 1007, pos: [2.72, 1.12, -0.95], look: [2.71, 1.0, -2.9], fov: 57, roll: 3.3, ease: "lin" }],
  13: [{ f: 1007, pos: at(N_, -0.45, 1.5, 0.4), look: at(N_, 0.08, 2.15, -3.1), fov: 40 }, { f: 1045, pos: at(N_, -0.42, 1.58, 0.3), look: at(N_, 0, 1.85, -3.05), fov: 40, ease: "smooth" },
    { f: 1046, pos: at(N_, -0.1, 1.74, -1.0), look: at(N_, 0, 1.75, -3.05), fov: 38, roll: -3, ease: "lin" }, { f: 1080, pos: at(N_, -0.08, 1.75, -1.25), look: at(N_, 0, 1.75, -3.05), fov: 38, roll: -4, ease: "lin" }],
  14: [{ f: 1080, pos: [3.4, 1.3, 0.9], look: [3.5, 1.0, -2.9], fov: 42 }, { f: 1120, pos: [3.2, 1.28, 0.7], look: [3.15, 1.0, -2.9], fov: 42, ease: "smooth" }, { f: 1141, pos: [3.15, 1.25, 0.5], look: [3.12, 1.0, -2.9], fov: 42, ease: "lin" }],
  15: [{ f: 1141, pos: [0.38, 1.3, 1.6], look: [0.38, 0.95, -2.0], fov: 40 }, { f: 1212, pos: [0.37, 1.28, 1.35], look: [0.38, 0.95, -2.0], fov: 40, ease: "lin" }],
  16: [{ f: 1212, pos: [0.4, 1.35, 2.1], look: [0.38, 1.1, -2.08], fov: 42 }, { f: 1236, pos: [0.38, 1.33, 1.9], look: [0.36, 1.12, -2.08], fov: 42, ease: "lin" },
    { f: 1283, pos: [0.32, 1.08, 1.65], look: [0.32, 1.3, -2.08], fov: 43, roll: 2.5, ease: "smooth" }],
};
const KICKS = [[60, 0.025, 6], [158, 0.04, 8], [344, 0.02, 6], [972, 0.035, 7], [1252, 0.03, 6]];
export const camAt = (f) => {
  const s = shotAt(f), c = camFromKeys(K[s.id], f);
  const d = drift(f, s.area === "S" ? 0.006 : 0.01, s.id);
  let look = c.look.slice();
  for (const [a, amp, n] of KICKS) { const k = kick(f, a, amp, n); look = [look[0] + k[0], look[1] + k[1], look[2]]; }
  return { pos: add3(c.pos, d), look, fov: c.fov ?? 40, roll: c.roll ?? 0 };
};
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const s = shotAt(f), c = camAt(f);
  switch (s.id) {
    case 1: case 10: return { focus: dist(c.pos, [0, 1.0, -2.05]), cInf: 7 };
    case 3: return { focus: dist(c.pos, [-3.0, 0.85, -3.2]), cInf: 6 };
    case 5: return { focus: dist(c.pos, [2.7, 0.8, -2.95]), cInf: 6 };
    case 6: case 15: return { focus: 0.6, cInf: 12 };
    case 7: case 16: return { focus: dist(c.pos, [0.38, 1.0, -2.08]), cInf: 5 };
    case 8: return { focus: dist(c.pos, at(C_, 0.1, 0.8, -2.3)), cInf: 6 };
    case 11: return { focus: dist(c.pos, at(M_, 0.3, 1.2, -2.4)), cInf: 5 };
    case 12: return { focus: dist(c.pos, [2.7, 0.95, -2.9]), cInf: 7 };
    case 13: return { focus: dist(c.pos, at(N_, 0, 1.75, -3.05)), cInf: 6 };
    case 14: return { focus: dist(c.pos, [3.1, 0.9, -2.9]), cInf: 5 };
    default: return { focus: 30, cInf: 0 };
  }
};
export const flashAt = (f) => {
  const fl = (a, len, k = 0.6, col = "#ffffff") => (f >= a - 2 && f < a + len ? { k: k * (f < a ? lin(f, a - 2, a) : 1 - smooth(lin(f, a, a + len))), col } : null);
  return fl(127, 6, 0.35, "#ffd8a0") ?? fl(238, 6, 0.2, "#cfe0ff") ?? fl(1007, 6, 0.25, "#cfe0ff") ?? fl(1252, 5, 0.3, "#ffe0f0") ?? { k: 0 };
};

// ---------------- world state ----------------
export const worldAt = (f) => { const s = shotAt(f);
  const lamps = s.area === "A" ? [[-2.2, 2.3, -2.0, 0xffc27a, 7], [0, 2.3, -1.6, 0xffc27a, 7], [2.6, 2.3, -2.0, 0xffc27a, 7]]
    : s.area === "N" ? [[N_[0] + 0.6, 3.7, -2.9, 0xffd8a0, 10]] : s.area === "M" ? [[M_[0] - 1.5, 3, -2.5, 0xffffff, 9], [M_[0] + 1.5, 3, -2.5, 0xffffff, 9]] : [];
  return { night: !!s.night, lamps }; };
export const shadowCenter = (f) => { const s = shotAt(f); return { A: s.id === 3 ? [-3, 0, -3] : s.id >= 12 && s.id <= 14 || s.id === 5 || s.id === 6 ? [2.8, 0, -2.6] : [0.3, 0, -2], B: at(B_, 0, 0, -3), C: at(C_, 0, 0, -2.3), S: [S_[0], 0, -3], M: at(M_, 0, 0, -2.6), N: at(N_, 0, 0, -3) }[s.area]; };

// ---------------- cards ----------------
const J = (st) => JSON.stringify(st, (k, v) => (typeof v === "number" ? Math.round(v * 1000) / 1000 : typeof v === "function" ? undefined : v));
const person = (id, pos, draw, st, extra = {}) => ({ id, pos, h: 2.25, key: id + "|" + J(st), draw: (pp) => draw(pp, st), res: 1.2, design: [600, 1000], blobR: 0.38, shadow: true, groundY: 0, protect: false, ...extra });
const proxy = (id, pos, h, w = 0.8) => ({ id: id + "_px", pos, h, key: "px", draw: () => {}, res: 0.1, design: [Math.round(w * 100), Math.round(h * 100)], anchor: "center", bill: "fixed", rotY: 0, protect: true, noTint: true });
const fxc = (id, pos, h, key, draw, design, extra = {}) => ({ id, pos, h, key, draw, res: 0.7, design, anchor: "center", bill: "screen", blend: "alpha", fog: false, noTint: true, order: 2, ...extra });
const panel = (id, pos, h, key, draw, design, extra = {}) => ({ id, pos, h, key, draw, res: 1, design, anchor: "center", bill: "fixed", rotY: 0, noTint: true, order: 0, protect: false, fog: false, ...extra });
const norm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const pop = (f, a, n = 9) => (f < a ? 0 : Math.max(0.02, back(lin(f, a, a + n), 1.7)));

/** leash from his collar to her hand when both sit at the main table (design px in his card) */
const LEASH_GF = { to: [520, 790], sag: 30 };

export const actorsAt = (f, cam) => {
  const s = shotAt(f), A = [], id = s.id, C = camAt(f);
  const screen = (sid, px, py, hp, key, draw, design, extra = {}) => {
    const fwd = norm([C.look[0] - C.pos[0], C.look[1] - C.pos[1], C.look[2] - C.pos[2]]), right = norm(cross(fwd, [0, 1, 0])), up = cross(right, fwd);
    const D = 3, vh = 2 * D * Math.tan((C.fov * Math.PI) / 360), upK = (960 - py) / 1920, rk = (px - 540) / 1080;
    const pos = [0, 1, 2].map((k) => C.pos[k] + fwd[k] * D + up[k] * vh * upK + right[k] * vh * 0.5625 * rk);
    A.push({ id: sid, pos, h: (vh * hp) / 1920, key, draw, res: 1, design, anchor: "center", bill: "screen", blend: "alpha", fog: false, noTint: true, order: 10, top: true, ...extra });
  };
  const i1 = idle(f, 3), i2 = idle(f, 7);
  const plates = (n = 2) => { for (let i = 0; i < n; i++) A.push({ id: "plate" + i, pos: [2.5 + i * 0.4, 0.7, -2.1 - 0.05 * i], h: 0.3, key: "momo", draw: (pp) => T.drawMomo(pp), res: 0.7, design: [300, 200], anchor: "center", noTint: false, order: 1, shadow: false, protect: false }); };

  // ---- 1: hook ----
  if (id === 1) {
    const snap = smooth(lin(f, 57, 63)), tug = f >= 57 && f < 70 ? Math.sin(Math.PI * lin(f, 57, 70)) : 0;
    // dog stance: perched on the chair, begging paws, tongue out, tail wagging; the leash yanks his head round on "पट्टा"
    const pant = f < 57 ? 0.014 * Math.abs(Math.sin(f * 0.55)) : 0;
    const st = { mode: "sit", pose: ["beg", "beg", 1], paws: true, tail: q((f / (f < 57 ? 5 : 9)) % 1, 0.125), tailUp: 1, expr: f < 57 ? "pant" : f < 70 ? "shock" : "puppy", look: q(0.3 * (1 - snap) + 0.95 * snap, 0.05), headTilt: q(0.06 * Math.sin(f * 0.2) * (1 - snap) - 0.1 * snap, 0.02), blink: blinkAt(f, 4), seed: 700,
      leash: { to: [600, q(560 - 120 * tug, 4)], sag: q(50 * (1 - tug), 2) } };
    A.push(person("bhai", [F[0] + 0.05 * tug, 0.45 + pant + i1.dy, F[2]], T.drawBhai, st, { rotZ: i1.rot - 0.06 * tug, blobR: 0 }));
    A.push(proxy("bhai", [F[0], 1.4, F[2] + 0.05], 0.5, 0.5));
    // wall shadow: a lion that roars, then shrinks into a little dog on "कुकुर"
    const dogK = smooth(lin(f, 80, 88)), roar = f < 50 ? Math.sin(Math.PI * lin(f, 6, 46)) : 0, wag = (f / 8) % 1;
    if (dogK < 0.5) { const sk = 1 - 0.6 * dogK * 2; A.push(panel("shadow", [-0.55, 1.45 - 0.2 * (1 - sk), -3.96], 1.25 * sk, "lsh|" + q(roar, 0.05), (pp) => T.drawSil(pp, (p2) => T.drawLion(p2, { roar, tail: f / 40 }), 0.38), [900, 800], { fog: true, noTint: true, order: -1, blend: "alpha" })); }
    else { const sk = 0.45 + 0.1 * back(lin(f, 84, 94)); A.push(panel("shadowD", [-0.6, 1.3, -3.96], 1.0 * sk, "dsh|" + q(wag, 0.125), (pp) => T.drawSil(pp, (p2) => T.drawDog(p2, { kind: "lap", wag, mouth: "pant" }), 0.38), [600, 500], { fog: true, noTint: true, order: -1, flip: true, blend: "alpha" })); }
    // title card
    const out = 1 - smooth(lin(f, 112, 124)), a = smooth(lin(f, 2, 14)), b = smooth(lin(f, 60, 70)), c = smooth(lin(f, 78, 90));
    if (f < 125) screen("hookPx", 540, 360, 500, "px", () => {}, [1000, 600], { top: false, protect: true, blend: "none", res: 0.05 });
    if (f < 125) screen("hook", 540, 360, 500 * out + 1, `hook|${q(a, 0.05)}|${q(b, 0.05)}|${q(c, 0.05)}|${q((f / 30) % 1, 0.05)}`, (pp) => T.drawHookL(pp, a, b, c, (f / 30) % 1), [1000, 600], { protect: false });
  }
  // ---- 2: lion on the rock ----
  if (id === 2) {
    const roar = f < 150 ? 0.15 : f < 158 ? 0.15 + 0.85 * easeOut(lin(f, 150, 158)) : 1 - 0.7 * smooth(lin(f, 172, 186));
    A.push({ id: "lion", pos: at(B_, 0, 1.22 + 0.02 * Math.sin(f * 0.2), -3), h: 2.0, key: "lion|" + q(roar, 0.05) + "|" + q((f / 40) % 1, 0.05), draw: (pp) => T.drawLion(pp, { roar, tail: (f / 40) % 1 }), res: 1, design: [900, 800], blobR: 0, shadow: true, protect: true, bill: "fixed", rotY: 0.12 });
  }
  // ---- 3: lap dog on her lap ----
  if (id === 3) {
    const sq = f >= 210 && f < 226 ? 1 : 0, pet = Math.sin(f * 0.35);
    const gl = f >= 198 && f < 208 ? Math.sin(Math.PI * lin(f, 198, 208)) : 0, cackle = f >= 214 && f < 236;
    A.push(person("gfB", [GBOOTH[0], GBOOTH[1] + i2.dy + (cackle ? 0.012 * Math.abs(Math.sin(f * 0.9)) : 0), GBOOTH[2]], T.drawGF, { mode: "sit", pose: ["pet", "pet", 1], expr: cackle ? "evilLaugh" : "evil", glint: q(gl, 0.25), blink: 0, look: 0.6, headTilt: q(0.06 * Math.sin(f * 0.1), 0.02), seed: 720 }, { blobR: 0 }));
    A.push({ id: "lapdog", pos: [GBOOTH[0] + 0.04, 0.6 + 0.01 * pet + (sq ? 0.03 * Math.sin(Math.PI * lin(f, 210, 226)) : 0), GBOOTH[2] + 0.28], h: 0.55, key: `lap|${sq}|${q((f / 6) % 1, 0.125)}|${blinkAt(f, 5)}`, draw: (pp) => T.drawDog(pp, { kind: "lap", lie: 1, topi: true, mouth: sq ? "open" : "smile", wag: (f / 6) % 1, blink: blinkAt(f, 5) }), res: 1, design: [600, 500], blobR: 0, shadow: false, protect: true, order: 1 });
    if (f >= 212) { const k = pop(f, 212, 8); A.push(fxc("hrt", [GBOOTH[0] + 0.35, 1.05 + 0.15 * lin(f, 212, 238), GBOOTH[2] + 0.4], 0.16 * k, "heart", (pp) => T.drawHeart(pp), [300, 300], { opacity: 1 - smooth(lin(f, 228, 238)) })); }
  }
  // ---- 4: five friends ----
  if (id === 4) {
    const st = { sci: smooth(lin(f, 238, 250)), ring: smooth(lin(f, 246, 272)), heart: f < 276 ? 0 : back(lin(f, 276, 290), 1.4), hi: smooth(lin(f, 298, 306)), out: smoother(lin(f, 343, 358)), ph: q((f / 60) % 1, 0.02) };
    const k = Object.fromEntries(Object.entries(st).map(([a, v]) => [a, q(v, 0.02)]));
    A.push(panel("circle", DP(500, 650), 3, "c5|" + J(k), (pp) => T.drawCircle5(pp, k), [1000, 1300], { res: 0.9 }));
  }
  // ---- 5: the empty chair ----
  if (id === 5) {
    const k = pop(f, 372, 9), pul = 1 + 0.06 * Math.sin(f * 0.3);
    A.push(fxc("spot", [2.7, 0.85, -3.3], 1.4, "glow", (pp) => T.drawSoftGlow(pp, "255,230,170", 0.3), [400, 400], { blend: "add", order: 0 }));
    A.push(fxc("q", [2.7, 1.12 + 0.03 * Math.sin(f * 0.12), -2.92], 0.42 * k * pul, "q", (pp) => T.drawQ(pp, 150, 150, 240, "#ffa04c"), [300, 300], { protect: true, order: 3 }));
    if (f >= 399) { const k2 = pop(f, 399, 9); A.push(fxc("q2", [2.4, 0.98, -2.85], 0.22 * k2, "q", (pp) => T.drawQ(pp, 150, 150, 240, "#ffa04c"), [300, 300], { order: 3, rotZ: -0.3 })); A.push(fxc("q3", [3.02, 1.02, -2.85], 0.2 * pop(f, 404, 9), "q", (pp) => T.drawQ(pp, 150, 150, 240, "#ffa04c"), [300, 300], { order: 3, rotZ: 0.3 })); }
  }
  // ---- 6: phone ----
  if (id === 6) {
    const st = { type: lin(f, 446, 478), sent: f < 488 ? 0 : easeOut(lin(f, 488, 496)), seen: f >= 503 ? 1 : 0, dots: (f / 24) % 1 };
    const k = { type: q(st.type, 0.05), sent: q(st.sent, 0.05), seen: st.seen, dots: q(st.dots, 0.1) };
    const up = easeOut(lin(f, 440, 450));
    screen("phone", 540, 1040 + 260 * (1 - up), 1560, "chat|" + J(k), (pp) => T.drawChat(pp, k), [600, 1000], { protect: true });
  }
  // ---- 7: he checks her face ----
  if (id === 7 || id === 10 || id === 16) {
    const turn = id === 7 ? smooth(lin(f, 560, 570)) : 1, buzz = id === 7 && f >= 516 && f < 528 ? 0.012 * Math.sin(f * 3) : 0;
    let st;
    const yank = id === 7 && f >= 586 && f < 598 ? Math.sin(Math.PI * lin(f, 586, 598)) : 0;
    if (id === 7) st = { mode: "sit", pose: ["hang", "phoneUp", 1], phone: true, expr: f < 560 ? "neutral" : f < 586 ? "puppy" : "nervous", look: q(-0.3 * (1 - turn) + 0.95 * turn, 0.05), headTilt: q(-0.1 * turn, 0.02), blink: blinkAt(f, 4), seed: 700, leash: { to: LEASH_GF.to, sag: q(30 * (1 - yank), 2) } };
    if (id === 10) st = { mode: "sit", pose: ["hang", "hang", 0], expr: "puppy", look: 0.95, headTilt: -0.1, blink: blinkAt(f, 4), blush: 1, seed: 700, leash: LEASH_GF };
    if (id === 16) { const free = f >= 1252, jump = f >= 1256;
      st = { mode: jump ? "stand" : "sit", pose: jump ? ["up", "up", 1] : ["hang", "phoneUp", 1], phone: !jump, expr: f < 1240 ? "neutral" : free ? "laugh" : "grin", look: free ? 0.2 : -0.2, blink: blinkAt(f, 4), seed: 700, leash: free ? null : LEASH_GF }; }
    const nod = id === 10 ? 0.025 * Math.max(0, Math.sin((f - 816) * 0.45)) : 0;
    const hop = id === 16 && f >= 1256 ? 0.18 * Math.sin(Math.PI * clamp((f - 1256) / 12)) + (f >= 1268 ? 0.1 * Math.abs(Math.sin((f - 1268) * 0.4)) : 0) : 0;
    const by = id === 16 && f >= 1256 ? 0 : F[1];
    A.push(person("bhai", [F[0] + buzz + 0.06 * yank, by + i1.dy - nod + hop, F[2]], T.drawBhai, st, { rotZ: i1.rot - 0.08 * yank, blobR: 0 }));
    A.push(proxy("bhai", [F[0], (id === 16 && f >= 1256 ? 1.3 : 1.0) + hop, F[2] + 0.05], 0.75, 0.5));
    if (id !== 10) {
      const nodG = id === 7 && f >= 584 && f < 600 ? 0.06 * Math.sin(Math.PI * lin(f, 584, 600)) : 0;
      const gst = { mode: "sit", pose: ["leashHold", "leashHold", 1], hold: !(id === 16 && f >= 1252), expr: id === 16 && f >= 1252 ? (f < 1266 ? "shock" : "stern") : id === 7 && f >= 584 && f < 600 ? "evilLaugh" : "evil", glint: id === 7 && f >= 572 && f < 584 ? 1 : 0, blink: blinkAt(f, 9), look: -0.8, headTilt: q(nodG, 0.02), seed: 720 };
      if (id === 16 && f >= 1252) gst.pose = ["hang", "hang", 0];
      A.push(person("gf", [G[0], G[1] + i2.dy - 0.4 * nodG * 0.2, G[2]], T.drawGF, gst, { rotZ: i2.rot, blobR: 0 }));
      A.push(proxy("gf", [G[0], 1.0, G[2] + 0.05], 0.7, 0.5));
    }
    if (id === 7 && f >= 516 && f < 540) A.push(fxc("buzz", [F[0] + 0.32, 0.98, F[2] + 0.2], 0.16, "bz|" + (Math.floor(f / 3) % 2), (pp) => { for (let i = 0; i < 3; i++) pp.arc(150, 150, 40 + i * 30 + (Math.floor(f / 3) % 2) * 8, 40 + i * 30, -50, 50, 8, "#ffffff"); }, [300, 300]));
    if (id === 16 && f >= 1252) { const t = lin(f, 1252, 1270);
      A.push({ id: "leashFall", pos: [0.42, 0.68 - 0.35 * easeOut(clamp(t * 1.4)), -2.0], h: 0.5, key: "lf", draw: (pp) => T.drawLeash(pp, [40, 60], [560, 200], 60), res: 0.7, design: [600, 300], anchor: "center", bill: "fixed", rotY: 0, rotZ: -0.3 * t, noTint: false, order: 2, protect: false });
      A.push(fxc("spk", [F[0] + 0.02, 0.85 + 0.1, F[2] + 0.2], 0.55, "spk|" + q(t, 0.05), (pp) => T.drawSpk(pp, t), [300, 300], { opacity: 1 - t })); }
  }
  // ---- 8: park dog ----
  if (id === 8) {
    const lk = smooth(lin(f, 612, 622)), wag = (f / 7) % 1;
    A.push(person("owner", at(C_, 0.55, 0, -2.5), T.drawPerson, { mode: "stand", expr: lk > 0.5 ? "smile_closed" : "smile", look: -0.8, blink: blinkAt(f, 11), seed: 760 }, { draw: (pp) => T.drawPerson(pp, T.OUTL.owner, { mode: "stand", expr: lk > 0.5 ? "smile_closed" : "smile", look: -0.8, blink: blinkAt(f, 11), seed: 760 }), protect: true }));
    A.push({ id: "pdog", pos: at(C_, -0.2, 0, -2.2), h: 0.95, key: `pd|${q(lk, 0.1)}|${q(wag, 0.125)}|${blinkAt(f, 6)}`, draw: (pp) => T.drawDog(pp, { kind: "park", look: lk, wag, mouth: lk > 0.5 ? "pant" : "smile", blink: blinkAt(f, 6) }), res: 1, design: [600, 500], blobR: 0.4, groundY: 0, shadow: true, protect: true });
  }
  // ---- 9: counter ----
  if (id === 9) {
    const st = { n: Math.round(89 * smoother(lin(f, 668, 738))), chips: lin(f, 668, 740), b: smooth(lin(f, 750, 762)), two: f >= 764 ? 1 : 0, bub: 0, wag: q((f / 7) % 1, 0.125), ph: 0 };
    A.push(panel("counter", DP(500, 650), 3, "cnt|" + J(st), (pp) => T.drawCounter(pp, st), [1000, 1300], { res: 0.9 }));
    if (f >= 764) { const k = pop(f, 764, 8); A.push(fxc("two", add3(DP(870, 860), [0, 0, 0.1]), 0.5 * k, "spk|0.3", (pp) => T.drawSpk(pp, 0.3), [300, 300], { opacity: 1 - lin(f, 770, 790) })); }
  }
  // ---- 11: shop ----
  if (id === 11) {
    const fast = f >= 880, wag = (f / (fast ? 4 : 9)) % 1;
    A.push(person("bhaiM", at(M_, 0.55, 0.01 * Math.abs(Math.sin(f * 0.3)), -2.35), T.drawBhai, { mode: "stand", pose: ["bags", "bags", 1], bags: true, tail: q(wag, 0.125), expr: fast ? "grin" : "smile_closed", look: -0.5, blink: blinkAt(f, 4), seed: 700 }, { rotZ: 0.02 * Math.sin(f * 0.2), protect: true }));
    const ck = f >= 885 && f < 915;
    A.push(person("gfM", at(M_, -0.12, ck ? 0.01 * Math.abs(Math.sin(f * 0.9)) : 0, -2.85), T.drawGF, { mode: "stand", pose: ["rub", "rub", 1], expr: ck ? "evilLaugh" : "evil", look: 0.7, blink: 0, seed: 720 }, { protect: true, rotZ: 0.02 * Math.sin(f * 1.3) }));
    if (f >= 885) for (const [j, x, y, d] of [[0, 0.85, 1.75, 0], [1, 0.45, 1.95, 5], [2, 1.0, 2.05, 10]]) { const k = pop(f, 885 + d, 8), t = lin(f, 885 + d, 934);
      A.push(fxc("hm" + j, at(M_, x, y + 0.3 * t, -2.2), 0.2 * k, "heart", (pp) => T.drawHeart(pp), [300, 300], { opacity: 1 - smooth(lin(f, 915 + d, 934)) })); }
  }
  // ---- 12: you alone ----
  if (id === 12 || id === 14) {
    plates(2);
    const sad = id === 12, look = id === 14 && f >= 1100 ? 0.8 : 0;
    A.push(person("you", [YOU[0], YOU[1] + i1.dy, YOU[2]], T.drawYou, { mode: "sit", pose: ["hang", "hang", 0], expr: id === 12 ? "sadL" : f >= 1118 ? "side" : "sadL", look, blink: blinkAt(f, 13), seed: 740 }, { rotZ: i1.rot, blobR: 0 }));
    A.push(proxy("you", [YOU[0], 1.0, YOU[2] + 0.05], 0.7, 0.5));
    if (id === 12 && f >= 972) { const k = pop(f, 972, 10); A.push(fxc("cloud", [YOU[0], 1.55 + 0.02 * Math.sin(f * 0.1), YOU[2] + 0.1], 0.38 * k, "cl|" + q((f / 40) % 1, 0.05), (pp) => T.drawCloud(pp, "138,144,168", (f / 40) % 1, 3), [600, 400], { blend: "alpha", order: 3 })); }
  }
  // ---- 14: he comes back ----
  if (id === 14) {
    const wk = smoother(lin(f, 1080, 1112)), x = 4.7 + (SIDE[0] - 4.7) * wk, sit = f >= 1114;
    const ph = q(((f - 1080) / 20) % 1, 0.125) % 1;
    A.push(person("bhaiN", [x, sit ? SIDE[1] : 0, SIDE[2]], T.drawBhai, { mode: sit ? "sit" : "stroll", phase: sit ? 0 : ph, pose: sit && f >= 1124 ? ["hang", "eatL", smooth(lin(f, 1124, 1132))] : ["hang", "hang", 0], expr: sit ? "grin" : "sadL", look: -0.8, blink: blinkAt(f, 4), seed: 700, leash: { to: [600, 975], sag: 10 } }, { blobR: sit ? 0 : 0.36 }));
    A.push(proxy("bhaiN", [x, sit ? 1.0 : 1.05, SIDE[2] + 0.05], sit ? 0.7 : 1.9, 0.5));
    if (f < 1112) { const k = f < 1084 ? 0 : smooth(lin(f, 1084, 1094)); A.push(fxc("broken", [x, 1.95, SIDE[2] + 0.1], 0.3, "br|" + q(k, 0.1), (pp) => T.drawBroken(pp, k), [300, 300], { order: 3 })); }
  }
  // ---- 15: share ----
  if (id === 15) {
    const st = { open: smooth(lin(f, 1143, 1153)), pick: smooth(lin(f, 1160, 1166)), tap: lin(f, 1160, 1190), sent: f >= 1186 ? 1 : 0 };
    const k = Object.fromEntries(Object.entries(st).map(([a, v]) => [a, q(v, 0.04)]));
    A.push(person("bhai", [F[0], F[1], F[2]], T.drawBhai, { mode: "sit", expr: "neutral", seed: 700, leash: LEASH_GF }, { blobR: 0 }));
    A.push(person("gf", [G[0], G[1], G[2]], T.drawGF, { mode: "sit", pose: ["leashHold", "leashHold", 1], hold: true, expr: "evil", seed: 720 }, { blobR: 0 }));
    screen("share", 540, 1040, 1560, "sh|" + J(k), (pp) => T.drawShare(pp, k), [600, 1000], { protect: true });
  }
  // ---- 13: poster ----
  if (id === 13) A.push({ id: "poster", pos: at(N_, 0, 1.75, -3.01), h: 1.15, key: "poster", draw: (pp) => T.drawPoster(pp), res: 1, design: [600, 800], anchor: "center", bill: "fixed", rotY: 0, rotZ: 0.03 * Math.sin(f * 0.13), noTint: false, order: 0, protect: true, shadow: false });
  return A;
};
