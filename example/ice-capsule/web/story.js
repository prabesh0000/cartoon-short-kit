// "आइस चुरोटको बल" — every function is a pure function of the frame f (30 fps, 1100 frames, loops: f1099 -> f0).
import * as T from "./toon.js";
import { clamp, lin, smooth, smoother, easeOut, back, mixv, q, camFromKeys, drift, kick, idle, blinkAt } from "./motion.js";

export const TOTAL = 1100;
export const AREA = { M: [0, 0, 0], C: [0, 0, -400], S: [3000, 0, 0], R: [-3000, 0, 0], B: [-3000, 0, -200] };
const S_ = AREA.S, R_ = AREA.R, B_ = AREA.B, C_ = AREA.C;
const TW = [S_[0], 0, S_[2] - 46]; // tower base
const rnd = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

export const SHOTS = [
  { id: 1, f0: 0, f1: 73 },      // macro: the crack (hook)
  { id: 2, f0: 73, f1: 145 },    // tole: the rumour passes
  { id: 3, f0: 145, f1: 240 },   // cut-away: capsule of menthol
  { id: 4, f0: 240, f1: 340 },   // cut-away: cold mist, smoke made soft
  { id: 5, f0: 340, f1: 430 },   // tower: the ball is a dot
  { id: 6, f0: 430, f1: 531 },   // tower: the whole cigarette
  { id: 7, f0: 531, f1: 636 },   // room: woman + WHO report
  { id: 8, f0: 636, f1: 713 },   // room: +40 % chart
  { id: 9, f0: 713, f1: 809 },   // room: man + the cradle stops
  { id: 10, f0: 809, f1: 905 },  // board: mist on top of smoke
  { id: 11, f0: 905, f1: 995 },  // board: deeper
  { id: 12, f0: 995, f1: 1066 }, // tole: friends, the tag
  { id: 13, f0: 1066, f1: 1094 },// phone: whip-zoom into the screen
  { id: 1, f0: 1094, f1: 1100 }, // macro again (t = -6..-1): the loop
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.f0 && f < s.f1) ?? SHOTS[SHOTS.length - 1];
const mt = (f) => (f >= 1094 ? f - 1100 : f); // macro time: 0 = the crack
const squeeze = (t) => (t < 0 ? smooth(lin(t, -8, 0)) : 1 - 0.45 * smooth(lin(t, 10, 34)));

// ---------------- light ----------------
export const LIGHTS = {
  macro: { top: "#0b2229", hor: "#1f4d55", bot: "#081a20", fog: "#123038", fogNear: 60, fogFar: 300, sun: "#fff4e8", sunI: 2.4, az: 140, el: 50, sunSky: "#000000", hemiSky: "#bfe8ff", hemiGround: "#2a3a40", hemiI: 1.15, card: "#ffffff", sat: 1.1, vig: 0.42 },
  cut: { top: "#0d2b33", hor: "#235a63", bot: "#0a2228", fog: "#163a42", fogNear: 40, fogFar: 200, sun: "#f4fbff", sunI: 2.2, az: 160, el: 60, sunSky: "#000000", hemiSky: "#cfeeff", hemiGround: "#3a4a50", hemiI: 1.25, card: "#ffffff", sat: 1.08, vig: 0.42 },
  street: { top: "#4a7ad0", hor: "#ffd8a8", bot: "#a08a70", fog: "#e8c8a8", fogNear: 40, fogFar: 320, sun: "#ffd8a0", sunI: 2.4, az: 210, el: 26, sunSky: "#ffc080", hemiSky: "#d8e4ff", hemiGround: "#8a6a50", hemiI: 1.15, card: "#fff2e2", sat: 1.12, vig: 0.3 },
  dread: { top: "#2e3358", hor: "#c88a7a", bot: "#5a4a50", fog: "#9a8088", fogNear: 50, fogFar: 380, sun: "#f0c0a0", sunI: 1.8, az: 220, el: 18, sunSky: "#d08a6a", hemiSky: "#a8acd8", hemiGround: "#5a4a48", hemiI: 1.05, card: "#f2e4dc", sat: 1.02, vig: 0.42 },
  room: { top: "#f6e0c0", hor: "#f6e0c0", bot: "#c8a888", fog: "#e8d2b0", fogNear: 30, fogFar: 140, sun: "#ffe6c8", sunI: 2.0, az: 150, el: 40, sunSky: "#000000", hemiSky: "#fff0dc", hemiGround: "#8a6a50", hemiI: 1.3, card: "#fff4ea", sat: 1.08, vig: 0.34 },
  roomCool: { top: "#c8d4e0", hor: "#c8d4e0", bot: "#8a98a8", fog: "#b8c4d0", fogNear: 30, fogFar: 140, sun: "#dfe8f4", sunI: 1.6, az: 150, el: 40, sunSky: "#000000", hemiSky: "#e0ecff", hemiGround: "#5a6070", hemiI: 1.2, card: "#e8eef6", sat: 0.92, vig: 0.44 },
  board: { top: "#e8f0ec", hor: "#e8f0ec", bot: "#b8c8c0", fog: "#d8e4de", fogNear: 30, fogFar: 140, sun: "#fff8ee", sunI: 1.8, az: 170, el: 45, sunSky: "#000000", hemiSky: "#ffffff", hemiGround: "#8a8070", hemiI: 1.35, card: "#ffffff", sat: 1.05, vig: 0.3 },
};
const hx = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const toHex = (c) => "#" + c.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, "0")).join("");
const mixL = (A, B, t) => { const o = {}; for (const k of new Set([...Object.keys(A), ...Object.keys(B)])) { const a = A[k] ?? B[k], b = B[k] ?? A[k]; o[k] = typeof a === "string" ? toHex(mixv(hx(a), hx(b), t)) : a + (b - a) * t; } return o; };
export const lightAt = (f) => {
  switch (shotAt(f).id) {
    case 1: return LIGHTS.macro;
    case 3: case 4: return LIGHTS.cut;
    case 2: case 12: case 13: return LIGHTS.street;
    case 5: return mixL(LIGHTS.street, LIGHTS.dread, smooth(lin(f, 340, 420)));
    case 6: return LIGHTS.dread;
    case 7: case 8: return LIGHTS.room;
    case 9: return mixL(LIGHTS.room, LIGHTS.roomCool, smooth(lin(f, 713, 760)));
    default: return LIGHTS.board;
  }
};

// ---------------- cameras ----------------
const M0 = { pos: [-6.9, 1.6, 6.6], look: [-1.7, 1.25, 0], fov: 38 };
const K = {
  1: [{ f: 0, ...M0 }, { f: 38, pos: [-6.6, 1.65, 6.3], look: [-1.65, 1.2, 0], fov: 38 }, { f: 73, pos: [-9, 3.2, 14.5], look: [0.5, 0, 0], fov: 42, ease: "in" }],
  2: [{ f: 73, pos: [S_[0] + 3.4, 1.7, S_[2] - 17.5], look: [S_[0] - 5.2, 1.55, S_[2] - 18.6], fov: 44 }, { f: 145, pos: [S_[0] + 3.4, 1.75, S_[2] - 23.2], look: [S_[0] - 5.2, 1.55, S_[2] - 23.6], fov: 44, ease: "lin" }],
  3: [{ f: 145, pos: [0, 0.05, C_[2] + 12.6], look: [0, 0, C_[2] + 1], fov: 40 }, { f: 240, pos: [0.05, -0.15, C_[2] + 11.2], look: [0.05, -0.15, C_[2] + 1], fov: 40 }],
  4: [{ f: 240, pos: [0.05, -0.15, C_[2] + 11.2], look: [0.05, -0.15, C_[2] + 1], fov: 40 }, { f: 340, pos: [-0.12, 0.2, C_[2] + 11.6], look: [-0.12, 0.2, C_[2] + 1], fov: 40 }],
  5: [{ f: 340, pos: [S_[0] + 2.6, 1.1, S_[2] - 33], look: [S_[0], 6, TW[2]], fov: 48 }, { f: 430, pos: [S_[0] + 3.4, 1.4, S_[2] - 31], look: [S_[0], 18, TW[2]], fov: 50 }],
  6: [{ f: 430, pos: [S_[0] + 6, 13, S_[2] - 30], look: [S_[0], 26, TW[2]], fov: 46 }, { f: 470, pos: [S_[0] + 6.5, 27, S_[2] - 31], look: [S_[0], 31, TW[2]], fov: 46 },
      { f: 531, pos: [S_[0] + 12, 17, S_[2] - 6], look: [S_[0], 16.5, TW[2]], fov: 50, ease: "out" }],
  7: [{ f: 531, pos: [R_[0] - 0.4, 1.75, R_[2] + 3.4], look: [R_[0] + 0.1, 1.55, R_[2] - 3.2], fov: 40 }, { f: 636, pos: [R_[0] - 0.2, 1.7, R_[2] + 1.9], look: [R_[0] + 0.3, 1.6, R_[2] - 3.2], fov: 40 }],
  8: [{ f: 636, pos: [R_[0] + 0.9, 1.75, R_[2] + 1.6], look: [R_[0] + 1.2, 1.75, R_[2] - 3.0], fov: 40 }, { f: 713, pos: [R_[0] + 1.25, 1.85, R_[2] + 0.6], look: [R_[0] + 1.35, 1.85, R_[2] - 3.0], fov: 40 }],
  9: [{ f: 713, pos: [R_[0] + 0.05, 1.55, R_[2] + 3.6], look: [R_[0] + 0.05, 1.15, R_[2] - 3.0], fov: 42 }, { f: 809, pos: [R_[0] + 0.15, 1.2, R_[2] + 1.7], look: [R_[0] + 0.2, 0.75, R_[2] - 2.4], fov: 42 }],
  10: [{ f: 809, pos: [B_[0] + 0.15, 4.0, B_[2] + 12.6], look: [B_[0], 4.0, B_[2]], fov: 42 }, { f: 905, pos: [B_[0] - 0.1, 3.9, B_[2] + 11.6], look: [B_[0] - 0.05, 3.9, B_[2]], fov: 42 }],
  11: [{ f: 905, pos: [B_[0] - 0.1, 3.9, B_[2] + 11.6], look: [B_[0] - 0.05, 3.9, B_[2]], fov: 42 }, { f: 995, pos: [B_[0] - 0.1, 3.4, B_[2] + 10.6], look: [B_[0] - 0.05, 3.3, B_[2]], fov: 42 }],
  12: [{ f: 995, pos: [S_[0] + 0.3, 1.7, S_[2] - 93.4], look: [S_[0] + 0.1, 1.6, S_[2] - 100.2], fov: 40 }, { f: 1066, pos: [S_[0] + 0.1, 1.65, S_[2] - 95.0], look: [S_[0] + 0.05, 1.6, S_[2] - 100.2], fov: 40 }],
  13: [{ f: 1066, pos: [S_[0] + 0.1, 1.65, S_[2] - 95.0], look: [S_[0] + 0.05, 1.6, S_[2] - 100.2], fov: 40 }, { f: 1094, pos: [S_[0] - 0.5, 1.55, S_[2] - 97.2], look: [S_[0] - 0.6, 1.45, S_[2] - 100.2], fov: 22, ease: "in" }],
};
const KICKS = [[0, 0.12, 8], [473, 0.5, 8], [250, 0.08, 6]];
export const camAt = (f) => {
  const s = shotAt(f);
  if (s.id === 2) { const z = S_[2] - 16.4 - 5.6 * smooth(clamp((f - 70) / 75)); return { pos: [S_[0] + 2.6, 1.5, z + 0.3], look: [S_[0] - 5.2, 1.75, z - 0.3], fov: 44, roll: 0 }; }
  let c = s.id === 1 ? camFromKeys(K[1], mt(f) < 0 ? 0 : f) : camFromKeys(K[s.id], f);
  if (s.id === 1 && mt(f) < 0) c = { ...M0, pos: M0.pos.slice(), roll: 0 };
  const d = drift(f, s.id === 1 || s.id === 3 || s.id === 4 ? 0.006 : 0.02, s.id);
  let look = c.look.slice(), roll = c.roll ?? 0;
  for (const [at, a, n] of KICKS) { const k = kick(f, at, a, n); look = [look[0] + k[0], look[1] + k[1], look[2]]; }
  if (s.id === 5) roll += 4 * Math.sin(Math.PI * clamp(lin(f, 346, 384)));
  return { pos: add3(c.pos, d), look, fov: c.fov ?? 40, roll };
};
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const s = shotAt(f), c = camAt(f);
  switch (s.id) {
    case 1: return { focus: dist(c.pos, [-1.6, 0, 0.4]), cInf: 5 };
    case 2: return { focus: dist(c.pos, [S_[0] - 5.2, 1.6, c.pos[2] - 1]), cInf: 6 };
    case 3: return { focus: 30, cInf: 0 };
    case 4: return { focus: 30, cInf: 0 };
    case 7: return { focus: dist(c.pos, [R_[0] + 0.2, 1.6, R_[2] - 3.1]), cInf: 6 };
    case 8: return { focus: dist(c.pos, [R_[0] + 1.35, 1.8, R_[2] - 2.9]), cInf: 6 };
    case 9: return { focus: dist(c.pos, [R_[0] + 0.55, 0.6, R_[2] - 2.4]), cInf: 6 * smooth(lin(f, 713, 760)) };
    case 12: case 13: return { focus: dist(c.pos, [S_[0], 1.6, S_[2] - 100.3]), cInf: 6 };
    default: return { focus: 30, cInf: 0 };
  }
};
export const flashAt = (f) => {
  const t = mt(f);
  if (t >= -2 && t < 9) return { k: t < 0 ? 0.12 * (t + 3) / 3 : 0.3 * (1 - smooth(lin(t, 0, 9))), col: "#e0fff0" };
  const fl = (a, len, k = 0.6, col = "#ffffff") => (f >= a - 2 && f < a + len ? { k: k * (f < a ? lin(f, a - 2, a) : 1 - smooth(lin(f, a, a + len))), col } : null);
  return fl(250, 10, 0.18, "#d8f6ff") ?? fl(473, 10, 0.3, "#ffd0c0") ?? fl(1088, 6, 0.25, "#ffffff") ?? { k: 0 };
};

// ---------------- world state ----------------
export const worldAt = (f) => {
  const s = shotAt(f), w = { camPos: camAt(f).pos, squeeze: 0, capsule: 1, warn: 0 };
  if (s.id === 1) w.squeeze = squeeze(mt(f));
  if (s.id === 4) w.capsule = f < 250 ? 1 : 0;
  if (s.id === 6) w.warn = smooth(lin(f, 473, 482)) * (0.75 + 0.25 * Math.sin(f * 0.3));
  return w;
};
export const shadowCenter = (f) => {
  const s = shotAt(f);
  if (s.id === 1) return [-1.5, 0, 0];
  if (s.id === 3 || s.id === 4) return C_;
  if (s.id === 2) return [S_[0] - 5, 0, S_[2] - 20];
  if (s.id === 5 || s.id === 6) return TW;
  if (s.id === 12 || s.id === 13) return [S_[0], 0, S_[2] - 100];
  if (s.id >= 7 && s.id <= 9) return [R_[0], 0, R_[2] - 3];
  return B_;
};

// ---------------- cards ----------------
const person = (id, pos, s, key, draw, res, extra = {}) => ({ id, pos, h: 2.25 * s, key: key + "@" + res, draw, res, design: [600, 1000], blobR: 0, shadow: true, groundY: pos[1], ...extra });
const glowCard = (id, pos, h, col, op = 1, order = 1) => ({ id, pos, h, key: "glow|" + col, draw: (pp) => T.drawGlow(pp, col), res: 0.5, design: [256, 256], anchor: "center", bill: "screen", blend: "add", fog: false, noTint: true, opacity: op, order });
const fxc = (id, pos, h, key, draw, design, extra = {}) => ({ id, pos, h, key, draw, res: 0.6, design, anchor: "center", bill: "screen", blend: "alpha", fog: false, noTint: true, order: 2, ...extra });
const norm = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
// overlays: [from, to, text, style, centre-y px, height px]
const OVERLAYS = [[76, 141, "सत्य झन् डरलाग्दो छ", "gold", 380, 200], [392, 432, "बल मात्र होइन", "ice", 470, 220], [652, 711, "४०% बढी खतरा", "red", 420, 220]];

export const actorsAt = (f, cam) => {
  const s = shotAt(f), A = [], C = camAt(f);
  /** screen-space card: centre (px, py) and height hp in output pixels (keeps text inside the safe area) */
  const screen = (id, px, py, hp, key, draw, design, extra = {}) => {
    const fwd = norm([C.look[0] - C.pos[0], C.look[1] - C.pos[1], C.look[2] - C.pos[2]]), right = norm(cross(fwd, [0, 1, 0])), up = cross(right, fwd);
    const D = 3, vh = 2 * D * Math.tan((C.fov * Math.PI) / 360), upK = (960 - py) / 1920, rk = (px - 540) / 1080;
    const pos = [0, 1, 2].map((k) => C.pos[k] + fwd[k] * D + up[k] * vh * upK + right[k] * vh * 0.5625 * rk);
    A.push({ id, pos, h: (vh * hp) / 1920, key, draw, res: 1, design, anchor: "center", bill: "screen", blend: "alpha", fog: false, noTint: true, order: 10, top: true, ...extra });
  };
  for (const [a, b, text, style, py, hp] of OVERLAYS) if (f >= a && f < b) {
    const pop = back(lin(f, a, a + 8), 1.6) * (1 - smooth(lin(f, b - 6, b)));
    if (pop > 0.02) screen("ov", 465, py, hp * pop, "ov2|" + text, (pp) => T.drawOverlay2(pp, text, style), [1000, 240]);
  }
  // ---- hook card: बल फुटाउँदा / बच्चा हुँदैन? ----
  if (f >= 1 && f < 73) {
    const a = q(easeOut(lin(f, 1, 10)), 0.1), b = q(back(lin(f, 12, 22), 1.6), 0.1), j = f >= 20 && f < 32 ? q((1 - lin(f, 20, 32)) * (f % 2 ? 1 : -1), 0.25) : 0, out = 1 - smooth(lin(f, 62, 72));
    screen("hook", 420, 470, 400, `hook|${a}|${b}|${j}`, (pp) => T.drawHookIce(pp, a, b, j), [1000, 560], { opacity: out });
  }

  // ---- 1: macro (and the loop tail) ----
  if (s.id === 1) {
    const t = mt(f), sq = squeeze(t), top = 1 - 0.2 * sq;
    const off = 1.68 + 0.6 * (1 - sq) + (t > 34 ? 0.5 * smooth(lin(t, 34, 60)) : 0);
    A.push({ id: "thumb", pos: [-1.55 + 0.55 * off, top + 0.83 * off, 0.35], h: 4, key: "thumb", draw: (pp) => T.drawFinger(pp, true), res: 0.8, design: [400, 800], anchor: "center", rotZ: 2.56, order: 1 });
    A.push({ id: "index", pos: [-1.45 + 0.55 * (1.68 + 0.6 * (1 - sq)), -top - 0.83 * (1.68 + 0.6 * (1 - sq)), 0.35], h: 4, key: "index", draw: (pp) => T.drawFinger(pp, false), res: 0.8, design: [400, 800], anchor: "center", rotZ: 0.58, order: 1 });
    const gl = t < 0 ? 0.2 + 0.1 * (t + 8) / 8 : 0.5 * Math.exp(-t / 14) + 0.2;
    A.push(glowCard("capg", [-1.5, 0, 1.15], 3.4 + 1.6 * (t >= 0 ? Math.exp(-t / 10) : 0), "120,255,190", gl, 3));
    if (t >= 0 && t < 18) A.push(fxc("burst", [-1.5, 0, 1.2], 3.0, "burst|" + q(lin(t, 0, 16), 0.1), (pp) => T.drawBurst(pp, q(lin(t, 0, 16), 0.1)), [600, 600], { blend: "add", order: 4 }));
    if (t >= 0) for (let i = 0; i < 6; i++) { const age = t - i * 3; if (age < 0) continue; const u = q(clamp(age / 60), 0.05);
      A.push(fxc("mist" + i, [-3.2 - 1.6 * u - 0.2 * i, 0.3 * Math.sin(i * 2.1) + 0.7 * u * Math.sin(i * 1.7), 0.4 + 0.5 * Math.cos(i * 1.3)], 1.6 + 2.4 * u, `cl|${i % 3}|${u}`, (pp) => T.drawCloud(pp, "190,255,230", u, i % 3), [300, 300], { opacity: 0.9 * (1 - u) })); }
  }
  // ---- 2: the rumour passes along a line of adults ----
  if (s.id === 2) {
    const zs = [-16.4, -17.8, -19.2, -20.6, -22.0], hold = (i) => 78 + i * 15; // bubble at person i from hold(i)
    const at = clamp((f - 78) / 15, 0, 4);
    for (let i = 0; i < 5; i++) {
      const v = [0, 1, 4, 3, 5][i], talking = at >= i && at < i + 1, heard = at >= i - 0.4 && at < i, id_ = idle(f, i + 3);
      const facing = i % 2 ? -1 : 1, pose = talking ? ["hang", "whisper", q(smooth(clamp((at - i) * 3)), 0.25)] : ["hang", "hang", 0];
      const st = { v, pose, expr: heard ? "shock" : talking ? "sly" : "neutral", blink: blinkAt(f, i + 2), look: facing * 0.6 };
      A.push(person("p" + i, [S_[0] - 5.2 + (i % 2) * 0.3, 0.18 + id_.dy, S_[2] + zs[i]], 1.0, `ad|${v}|${st.pose.join(",")}|${st.expr}|${st.blink}|${st.look}`, (pp) => T.drawAdult(pp, st), 1.2, { rotZ: id_.rot }));
    }
    const u = clamp((f - 78) / 60), z = -16.4 + (-22.0 + 16.4) * u, hop = Math.abs(Math.sin(Math.PI * ((f - 78) / 15)));
    if (f >= 76) { const pk = back(lin(f, 76, 84), 1.6); A.push({ id: "rum", pos: [S_[0] - 4.9, 2.5 + 0.15 * hop, S_[2] + z + 0.2], h: 1.0 * pk, key: "rum", draw: (pp) => T.drawRumour(pp), res: 0.8, design: [500, 420], anchor: "center", bill: "screen", noTint: true, order: 3 });
      A.push(glowCard("rumg", [S_[0] - 4.9, 2.08 + 0.15 * hop, S_[2] + z + 0.3], 0.55, "120,255,190", 0.9, 4)); }
  }
  // ---- 3 + 4: the filter cut open: capsule of menthol -> cold mist -> the smoke turns pale and light ----
  if (s.id === 3 || s.id === 4) {
    const bst = f < 250 ? 0 : q(easeOut(lin(f, 250, 300)), 0.05), ph = q((f * 0.006) % 1, 1 / 90);
    const st = { b: bst, ph, tag: q(back(lin(f, 160, 170), 1.5) * (1 - smooth(lin(f, 244, 252))), 0.1), cold: q(smooth(lin(f, 262, 295)), 0.1), light: q(smooth(lin(f, 300, 312)), 0.1), smoke: f >= 254 };
    A.push({ id: "fcut", pos: [0, 0, C_[2] + 1], h: 8, key: `fc|${st.smoke}|${st.b}|${ph}|${st.tag}|${st.cold}|${st.light}`, draw: (pp) => T.drawFilterCut(pp, st), res: 0.9, design: [1000, 1400], anchor: "center", noTint: true, order: 0 });
  }
  // ---- 5 + 6: the tower ----
  if (s.id === 5 || s.id === 6) {
    if (s.id === 5) { const k = 1 - smooth(lin(f, 346, 392)); A.push(glowCard("capT", [TW[0], 3.5, TW[2] + 1.75], 0.5 + 7 * k, "120,255,190", 0.5 + 0.5 * k, 3)); }
    for (let i = 0; i < 0; i++) { const id_ = idle(f, i + 20), st = { v: [2, 3, 0][i], pose: ["hang", "hang", 0], expr: "shock", blink: 0, look: 0 };
      A.push(person("tp" + i, [TW[0] + (i - 1) * 1.7 + 0.4, 0.0 + id_.dy, TW[2] + 3.2 + (i % 2) * 0.8], 1.0, `ad|${st.v}|tw`, (pp) => T.drawAdult(pp, { ...st, headTilt: -8 }), 0.9, { rotZ: id_.rot })); }
    for (let i = 0; i < 10; i++) { const age = ((f * 0.5 + i * 13) % 130) / 130, u = q(age, 0.1);
      A.push(fxc("tsm" + i, [TW[0] + 0.6 * Math.sin(i * 2.3) + 3 * age * Math.sin(i), 31.6 + 9 * age, TW[2] + 0.5 * Math.cos(i)], 2.4 + 4 * age, `smk|${i % 3}|${u}`, (pp) => T.drawSmoke(pp, u, i % 3), [300, 300], { opacity: Math.min(1, 1.6 * Math.sin(Math.PI * age)), res: 0.5, noTint: false, order: 2 })); }
    if (s.id === 6) A.push(glowCard("warnG", [TW[0], 16, TW[2] + 2], 34, "255,80,60", 0.3 * smooth(lin(f, 473, 482)), 1));
  }
  // ---- 7 + 8: the woman, the WHO report, the chart ----
  if (s.id === 7 || s.id === 8) {
    const id_ = idle(f, 30), st = { v: 1, pose: ["hang", "cheek", q(smooth(lin(f, 600, 612)), 0.25)], expr: f > 590 ? "worry" : "neutral", blink: blinkAt(f, 31), look: 0.3 };
    A.push(person("wom", [R_[0] + 0.15, id_.dy, R_[2] - 3.1], 1.0, `ad|wom|${st.pose[2]}|${st.expr}|${st.blink}`, (pp) => T.drawAdult(pp, st), 1.4, { rotZ: id_.rot }));
    const rp = back(lin(f, 531, 545), 1.4) * (1 - smooth(lin(f, 588, 597))); if (rp > 0.02) A.push({ id: "rep", pos: [R_[0] - 0.55 + 0.8 * (1 - rp), 2.35, R_[2] - 2.6], h: 1.0 * Math.min(1, rp + 0.3), key: "rep", draw: (pp) => T.drawReport(pp), res: 1, design: [600, 760], anchor: "center", rotZ: -0.08, order: 1 });
    if (f >= 597 && f < 636) { const k = back(lin(f, 597, 607), 1.6); A.push({ id: "wb", pos: [R_[0] - 0.35, 2.78, R_[2] - 2.9], h: 0.8 * k, key: "rum", draw: (pp) => T.drawRumour(pp), res: 0.8, design: [500, 420], anchor: "center", bill: "screen", noTint: true, order: 2 }); }
    const ck = q(smooth(lin(f, 652, 676)), 0.05);
    A.push({ id: "chart", pos: [R_[0] + 1.35, 1.82, R_[2] - 2.9], h: 1.5 * (s.id === 8 ? 0.0001 + 0.9999 * back(lin(f, 637, 646), 1.4) : 0.0001), key: "chart|" + ck, draw: (pp) => T.drawChart(pp, ck), res: 1, design: [800, 760], anchor: "center", order: 1 });
  }
  // ---- 9: the man + the cradle that stops ----
  if (s.id === 9) {
    const id_ = idle(f, 40), st = { v: 0, pose: ["hang", "hang", 0], expr: "sad", blink: blinkAt(f, 41), look: 0.6 };
    A.push(person("man", [R_[0] - 0.25, id_.dy, R_[2] - 3.6], 1.0, `ad|man|${st.blink}`, (pp) => T.drawAdult(pp, st), 1.3, { rotZ: id_.rot }));
    const amp = 0.16 * (1 - smooth(lin(f, 730, 782))), rock = amp * Math.sin((f - 713) * 0.21);
    A.push({ id: "cradle", pos: [R_[0] + 0.55, 0, R_[2] - 2.4], h: 1.05, key: "cradle", draw: (pp) => T.drawCradle(pp), res: 1, design: [800, 560], rotZ: rock, shadow: true, order: 1 });
  }
  // ---- 10 + 11: the inhalation diagram (person, windpipe, lungs) ----
  if (s.id === 10 || s.id === 11) {
    const m = q(smooth(lin(f, 815, 850)), 0.1), deep = q(smooth(lin(f, 912, 975)), 0.05), d = q(0.12 + 0.88 * deep, 0.05);
    const br = s.id === 10 ? q(0.35 + 0.25 * Math.sin((f - 809) * 0.09), 0.05) : q(0.35 + 0.65 * smooth(lin(f, 914, 972)), 0.05);
    const ph = q(((f * (s.id === 10 ? 0.008 : 0.014)) % 1), 1 / 60), st = { m, d, br, ph, deep: q(smooth(lin(f, 918, 930)), 0.1), cmp: s.id === 11 };
    A.push({ id: "lungs", pos: [B_[0], 4.0, B_[2] - 0.3], h: 6.8, key: `lu|${m}|${d}|${br}|${ph}|${st.deep}|${st.cmp}`, draw: (pp) => T.drawLungs(pp, st), res: 0.9, design: [1000, 1300], anchor: "center", noTint: true, order: 0 });
  }
  // ---- 12 + 13: two friends, the tag, the whip into the phone ----
  if (s.id === 12 || s.id === 13) {
    const tapK = f >= 1047 ? 1 : 0, id1 = idle(f, 50), id2 = idle(f, 51);
    const a = { v: 2, pose: ["hang", "phoneLow", 1], expr: "sly", blink: blinkAt(f, 52), look: 0.7, phone: true, topi: true };
    const b = { v: 3, pose: ["hang", "hang", 0], expr: tapK ? "shock" : "neutral", blink: tapK ? 0 : blinkAt(f, 53), look: -0.6 };
    A.push(person("fa", [S_[0] - 0.6, id1.dy, S_[2] - 100.0], 1.0, `ad|fa|${a.blink}`, (pp) => T.drawAdult(pp, a), 1.3, { rotZ: id1.rot }));
    A.push(person("fb", [S_[0] + 0.6, id2.dy, S_[2] - 100.7], 1.0, `ad|fb|${b.expr}|${b.blink}`, (pp) => T.drawAdult(pp, b), 1.3, { rotZ: id2.rot }));
    if (f >= 1047) { const k = back(lin(f, 1047, 1057), 1.8); A.push(fxc("at", [S_[0] + 0.45, 2.6 + 0.04 * Math.sin(f * 0.3), S_[2] - 100.6], 0.55 * k, "at", (pp) => T.drawTagPop(pp), [300, 300], { res: 1, order: 3 })); }
    if (s.id === 13) { // the phone rises into frame, then the whip-zoom fills the screen with the filter
      const rise = smoother(lin(f, 1066, 1076)), z = easeOut(lin(f, 1080, 1094)) ** 1.6, scr = f >= 1085 ? 1 : 0, tg = q(back(lin(f, 1068, 1076), 1.6), 0.1);
      screen("phone", 520, 1980 - 900 * rise + 1100 * z * 0.35, 1150 + 5200 * z, `ph|${tg}|${scr}`, (pp) => T.drawPhoneBig(pp, tg, scr), [600, 1000], { res: 1 });
    }
  }
  return A;
};
