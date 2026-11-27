// "The Day It Rained Meat" (kentucky-meat-shower, English, YouTube) — pure functions of f (30 fps).
// Voice inbox/meatfall.wav 33.07 s (992 f) + 15 f hold = 1007 frames. Loop: the last frame matches frame 0 (sky).
// Editing grammar (guides/editing-grammar.md): follow-the-object (shot 2), crane + tilt up (11), cloud fly-through (12),
// whips between farmers (9->10) and along the flock (15), all motion-blurred via work/post.json.
import * as T from "./toon.js";
import { clamp, lin, smooth, smoother, easeOut, easeIn, back, q, camFromKeys, drift, kick, idle, blinkAt, mixv } from "./motion.js";
import { KETTLE } from "./world.js";

export const TOTAL = 1007;
const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const norm = (a) => { const l = Math.hypot(...a) || 1; return a.map((v) => v / l); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const rnd = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const inOut = (t) => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

export const SHOTS = [
  { id: 1, f0: 0, f1: 64 },      // sky: a steak tumbles at the lens ("What would you do if chunks of meat…")
  { id: 2, f0: 64, f1: 141 },    // follow a falling chunk down into the kettle; Mrs. Crouch gapes ("…falling from the sky?")
  { id: 3, f0: 141, f1: 232 },   // flash: calm March morning, crane down into the farmyard ("Because on a clear March morning in 1876")
  { id: 4, f0: 232, f1: 300 },   // medium: Mrs. Crouch humming, stirring ("that's exactly what happened to Mrs. Crouch")
  { id: 5, f0: 300, f1: 362 },   // into the soap kettle, a chunk plops in, tilt up to her face ("making soap in her Kentucky yard")
  { id: 6, f0: 362, f1: 410 },   // wide: it pours meat ("For several minutes")
  { id: 7, f0: 410, f1: 452 },   // low by the fence: chunks bounce, the chicken dodges ("it poured meat")
  { id: 8, f0: 452, f1: 512 },   // two farmers taste it ("and two men tasted it")
  { id: 9, f0: 512, f1: 547 },   // farmer A chewing, LAMB bubble ("guessing lamb")
  { id: 10, f0: 547, f1: 590 },  // whip to farmer B, DEER bubble, shrug ("maybe deer")
  { id: 11, f0: 590, f1: 672 },  // everyone stares at the ground; the camera alone cranes up into the sky ("But nobody looked high enough")
  { id: 12, f0: 672, f1: 720 },  // up through the clouds ("The best explanation?")
  { id: 13, f0: 720, f1: 782 },  // above the clouds: a flock of vultures circling ("A flock of vultures")
  { id: 14, f0: 782, f1: 852 },  // MCU one vulture: it throws up ("because when one vulture throws up")
  { id: 15, f0: 852, f1: 932 },  // whips along the flock, then wide: the rest join in ("the rest join in")
  { id: 16, f0: 932, f1: 1007 }, // Mrs. Crouch deadpan, a chunk lands on her ladle; tilt up to the sky = frame 0 ("So… what would you do?")
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.f0 && f < s.f1) ?? SHOTS[SHOTS.length - 1];

export const LIGHTS = {
  morning: { top: "#4f9ee8", hor: "#cfe6f7", bot: "#9ab870", fog: "#cfe6f7", fogNear: 80, fogFar: 700, sun: "#fff1d8", sunI: 2.3, az: 140, el: 36, sunSky: "#fff0c8", hemiSky: "#dff0ff", hemiGround: "#7a8a50", hemiI: 1.05, card: "#fffaf2", sat: 1.16, vig: 0.22 },
  hush: { top: "#3f78b8", hor: "#b4c8d8", bot: "#7a9060", fog: "#b8cad8", fogNear: 60, fogFar: 600, sun: "#e8eef6", sunI: 1.6, az: 140, el: 36, sunSky: "#c8d8e8", hemiSky: "#c8d8ea", hemiGround: "#5a6a48", hemiI: 0.95, card: "#e6ecf4", sat: 0.96, vig: 0.38 },
  high: { top: "#3a8ae6", hor: "#dbeefc", bot: "#ffffff", fog: "#dbeefc", fogNear: 120, fogFar: 900, sun: "#fff6e0", sunI: 2.4, az: 160, el: 48, sunSky: "#fff2cc", hemiSky: "#e8f4ff", hemiGround: "#b8c8d8", hemiI: 1.2, card: "#fffaf4", sat: 1.18, vig: 0.2 },
};
export const lightAt = (f) => { const id = shotAt(f).id; return id === 11 ? LIGHTS.hush : id >= 12 && id <= 15 ? LIGHTS.high : LIGHTS.morning; };

// ---------------- places ----------------
const CROUCH = [0.4, 0, -2.05], FA = [-2.2, 0, -3.0], FB = [-1.25, 0, -3.25];
const FACE = (P, h = 1.42) => [P[0], h, P[2]];
const C0 = [0, 66, -24];                                    // centre of the vulture circle
const NV = 9;
const vPos = (i, f) => { const a = (i / NV) * Math.PI * 2 + 0.004 * f + 0.4, r = 6.5 + (i % 3) * 0.8;
  return [C0[0] + r * Math.sin(a), C0[1] + 0.8 * Math.sin(0.05 * f + i * 1.3) + ((i % 3) - 1) * 1.2, C0[2] + r * Math.cos(a) * 0.55]; };
const HERO = [2, 5, 7];                                      // the three vultures the whips visit (shot 14 = HERO[0])

// ---------------- cameras ----------------
const CAM0 = { pos: [0.6, 1.4, 2.6], look: [0.4, 30, -12], fov: 40 };   // frame 0 (and the loop's last frame)
const K = {
  1: [{ f: 0, ...CAM0 }, { f: 64, pos: [0.62, 1.42, 2.5], look: [0.42, 29.5, -11.6], fov: 39, ease: "lin" }],
  3: [{ f: 141, pos: [7, 12, 14], look: [0, 2, -5], fov: 40 }, { f: 232, pos: [3.0, 2.4, 6.2], look: [0.3, 1.2, -2.6], fov: 40 }],
  4: [{ f: 232, pos: [0.95, 1.42, 1.15], look: [0.82, 1.05, -2.0], fov: 40 }, { f: 300, pos: [0.92, 1.42, 0.75], look: [0.8, 1.07, -2.0], fov: 40, ease: "lin" }],
  5: [{ f: 300, pos: [1.42, 1.5, -0.85], look: [1.22, 0.62, -2.0], fov: 40 }, { f: 326, pos: [1.4, 1.46, -1.0], look: [1.22, 0.63, -2.0], fov: 40, ease: "lin" },
      { f: 350, pos: [0.75, 1.5, 0.15], look: [0.45, 1.25, -2.05], fov: 40 }, { f: 362, pos: [0.74, 1.5, 0.05], look: [0.45, 1.25, -2.05], fov: 40, ease: "lin" }],
  6: [{ f: 362, pos: [2.6, 2.3, 7.4], look: [0.2, 1.3, -3], fov: 40 }, { f: 410, pos: [2.3, 2.1, 6.6], look: [0.2, 1.3, -3], fov: 40, ease: "lin" }],
  7: [{ f: 410, pos: [5.0, 0.75, -0.6], look: [5.75, 0.95, -3.0], fov: 40 }, { f: 452, pos: [5.05, 0.72, -0.9], look: [5.7, 0.93, -3.0], fov: 40, ease: "lin" }],
  8: [{ f: 452, pos: [-1.72, 1.5, 0.3], look: [-1.72, 1.12, -3.1], fov: 40 }, { f: 512, pos: [-1.72, 1.48, -0.15], look: [-1.72, 1.14, -3.1], fov: 40, ease: "lin" }],
  11: [{ f: 590, pos: [0.0, 0.9, 4.6], look: [-0.7, 1.0, -3], fov: 40 }, { f: 612, pos: [0.0, 0.95, 4.4], look: [-0.7, 1.05, -3], fov: 40, ease: "lin" },
       { f: 672, pos: [0.2, 5.8, 3.4], look: [-0.5, 36, -12], fov: 40 }],
  12: [{ f: 672, pos: [0.2, 5.8, 3.4], look: [-0.5, 36, -12], fov: 40 }, { f: 720, pos: [0.3, 47, -6], look: [0, 70, -26], fov: 42, ease: "in", via: [[0.3, 22, 0], [0.3, 38, -4]] }],
  13: [{ f: 720, pos: [0, 51, 2], look: add3(C0, [0, -1, 0]), fov: 44 }, { f: 782, pos: [0, 55, -5], look: C0, fov: 44, ease: "out" }],
  16: [{ f: 932, pos: [0.72, 1.52, 0.75], look: [0.72, 1.24, -2.05], fov: 43 }, { f: 980, pos: [0.73, 1.52, 0.5], look: [0.72, 1.25, -2.05], fov: 43, ease: "lin" },
       { f: 1004, ...CAM0 }, { f: 1007, ...CAM0, ease: "lin" }],
};
// falling objects used by the camera (pure)
const fall = (f, f0, f1, a, b) => { const t = easeIn(lin(f, f0, f1)); return mixv(a, b, t); };
const HOOK_A = add3(CAM0.pos, norm(sub3(CAM0.look, CAM0.pos)).map((v, i) => v * 7 + [0.25, 0, 0][i])), HOOK_B = add3(CAM0.pos, norm(sub3(CAM0.look, CAM0.pos)).map((v, i) => v * 0.7 + [0.12, 0, 0][i]));
const c2At = (f) => fall(f, 64, 118, [KETTLE[0], 8.5, -2.4], [KETTLE[0], 0.7, KETTLE[2]]);
const vCam = (i, f) => { const v = vPos(i, f); return { pos: add3(v, [0.4, -0.5, 4.6]), look: add3(v, [0.25, 0.15, 0]), fov: 40 }; };
const farmCam = (P) => ({ pos: [P[0], 1.5, P[2] + 2.4], look: [P[0], 1.25, P[2]], fov: 40 });
const blendCam = (a, b, t) => ({ pos: mixv(a.pos, b.pos, t), look: mixv(a.look, b.look, t), fov: a.fov + (b.fov - a.fov) * t });
const KICKS = [[118, 0.035, 7], [338, 0.025, 6], [416, 0.04, 8], [431, 0.025, 6], [473, 0.012, 5], [754, 0.03, 7], [836, 0.03, 7], [951, 0.02, 6]];
export const camAt = (f) => {
  const s = shotAt(f), id = s.id; let c;
  if (id === 2) { // follow the falling chunk down, then settle on her face
    const ch = c2At(Math.min(f, 118)), face = [0.45, 1.26, -2.05], t = smoother(lin(f, 112, 132));
    c = { pos: mixv([1.15, 1.5, 1.6], [0.8, 1.5, 0.2], smoother(lin(f, 64, 132))), look: mixv(add3(ch, [0, 0.2, 0]), face, t), fov: 40 };
  } else if (id === 9 || id === 10) { // farmer A, whip (inOut, 10 f, blurred) to farmer B
    const A = farmCam(FA), B = farmCam(FB), t = inOut(lin(f, 542, 552)); c = blendCam(A, B, t);
    c.pos = add3(c.pos, [0, 0, -0.25 * lin(f, 512, 590)]);
  } else if (id === 14) { c = vCam(HERO[0], f); c.pos = add3(c.pos, [0, 0, -0.6 * lin(f, 782, 852)]); }
  else if (id === 15) { // whip to HERO[1] (852-862), to HERO[2] (866-876), then pull back to the wide flock (878-912)
    const a = vCam(HERO[0], f), b = vCam(HERO[1], f), d = vCam(HERO[2], f), wide = { pos: [0, 60, -10], look: C0, fov: 46 };
    c = f < 866 ? blendCam(a, b, inOut(lin(f, 852, 862))) : f < 878 ? blendCam(b, d, inOut(lin(f, 866, 876))) : blendCam(d, wide, smoother(lin(f, 878, 912)));
  } else c = camFromKeys(K[id], f);
  const dr = drift(f, id === 1 || id === 16 && f > 980 ? 0.004 : 0.01, id);
  let look = c.look.slice();
  for (const [a, amp, n] of KICKS) { const k = kick(f, a, amp, n); look = [look[0] + k[0], look[1] + k[1], look[2]]; }
  if (id === 6 || id === 7) { const sh = 0.012; look = [look[0] + sh * Math.sin(f * 1.7), look[1] + sh * Math.cos(f * 2.3), look[2]]; } // handheld in the downpour
  const roll = id === 7 ? 2 * Math.sin(f * 0.1) : id === 14 ? -3 * smooth(lin(f, 826, 846)) : 0;
  return { pos: add3(c.pos, dr), look, fov: c.fov ?? 40, roll };
};
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => { const s = shotAt(f), c = camAt(f);
  switch (s.id) {
    case 2: return f > 112 ? { focus: dist(c.pos, FACE(CROUCH)), cInf: 2.2 * smooth(lin(f, 112, 128)) } : { focus: 30, cInf: 0 };
    case 4: case 16: return f < 982 ? { focus: dist(c.pos, FACE(CROUCH)), cInf: 2.2 } : { focus: 30, cInf: 0 };
    case 5: return f > 330 ? { focus: dist(c.pos, FACE(CROUCH)), cInf: 1.8 } : { focus: dist(c.pos, [KETTLE[0], 0.68, KETTLE[2]]), cInf: 1.6 };
    case 8: return { focus: dist(c.pos, FACE(FA)), cInf: 1.4 };
    case 9: case 10: return { focus: dist(c.pos, FACE(f < 547 ? FA : FB)), cInf: 2 };
    case 7: return { focus: dist(c.pos, [6.0, 0.5, -3.0]), cInf: 1.6 };
    default: return { focus: 30, cInf: 0 };
  } };
export const flashAt = (f) => {
  const fl = (a, len, k = 0.2, col = "#ffffff") => (f >= a - 2 && f < a + len ? { k: k * (f < a ? lin(f, a - 2, a) : 1 - smooth(lin(f, a, a + len))) , col } : null);
  if (f >= 700 && f < 728) return { k: 0.95 * (f < 714 ? smooth(lin(f, 700, 714)) : 1 - smooth(lin(f, 714, 728))), col: "#ffffff" };   // inside the cloud
  return fl(141, 7, 0.75) ?? fl(118, 4, 0.08, "#fff4e0") ?? fl(754, 5, 0.1, "#fff6e0") ?? { k: 0 };
};
/** her stirring phase (8 hand positions) */
const stirPh = (f) => Math.floor(((f * 0.16) / (Math.PI * 2)) * 8 + 800) % 8;
/** the paddle: from her hand (card px -> world, the card turns to the camera) down into the pot; resting against the rim when she lets go */
const paddleAt = (f, cam) => { const id = shotAt(f).id; if (id === 1 || id === 16 || id >= 12) return null;
  const stirring = [2, 3, 4, 11].includes(id) || (id === 5 && f < 342);
  if (!stirring) return { top: [KETTLE[0] - 0.36, 1.0, KETTLE[2] + 0.04], bot: [KETTLE[0] - 0.05, 0.4, KETTLE[2]] };
  const ph = id === 2 ? stirPh(Math.min(f, 112)) : id === 11 || id === 5 ? (id === 5 && f >= 342 ? 0 : stirPh(f)) : stirPh(f), a = (ph / 8) * Math.PI * 2;
  const px = 300 + 168 + 10 * Math.cos(a) + 100, py = 600 + 5 * Math.sin(a), lx = (px - 400) * 0.00225, ly = (975 - py) * 0.00225 + idle(f, 11).dy;
  const ry = Math.atan2(cam[0] - CROUCH[0], cam[2] - CROUCH[2]), hand = [CROUCH[0] + lx * Math.cos(ry), ly, CROUCH[2] - lx * Math.sin(ry) + 0.02];
  return { top: hand, bot: [KETTLE[0] - 0.1 + 0.1 * Math.cos(a), 0.4, KETTLE[2] + 0.1 * Math.sin(a)] }; };
export const worldAt = (f) => { const id = shotAt(f).id, cp = camAt(f).pos; return { camPos: cp, bank: id === 12, low: id >= 13 && id <= 15, paddle: paddleAt(f, cp) }; };
export const shadowCenter = (f) => { const id = shotAt(f).id; return id === 7 ? [5.5, 0, -3] : id >= 8 && id <= 10 ? [-1.7, 0, -3] : [0.5, 0, -2.5]; };

// ---------------- the meat rain (pure): each chunk falls, then rests on the ground or vanishes into the kettle ----------------
const RAIN = []; { let n = 0;
  const addR = (cnt, s0, s1, seed) => { for (let i = 0; i < cnt; i++, n++) { const k = seed + i;
    const x = -4 + 9.5 * rnd(k * 3 + 1), z = -5.5 + 6.5 * rnd(k * 3 + 2), s = s0 + (s1 - s0) * rnd(k * 3 + 3);
    RAIN.push({ id: "r" + n, x, z, s, y0: 7 + 5 * rnd(k + 7), v: 0.26 + 0.1 * rnd(k + 11), seed: k % 4, spin: (rnd(k + 5) - 0.5) * 0.4, rest: rnd(k + 9) * Math.PI }); } };
  addR(150, 330, 445, 100); addR(30, 445, 580, 300); }
const inKettle = (r) => Math.hypot(r.x - KETTLE[0], r.z - KETTLE[2]) < 0.55;
const rainAt = (r, f) => { if (f < r.s) return null; const y = r.y0 - r.v * (f - r.s); if (y > 0.1) return { y, falling: true };
  const tl = r.s + (r.y0 - 0.1) / r.v; return { y: 0.06, falling: false, t: f - tl }; };

// ---------------- cards ----------------
const keyOf = (o) => JSON.stringify(o, (k, v) => (typeof v === "number" ? Math.round(v * 1000) / 1000 : v));
const pop = (f, a, n = 10, s = 1.7) => (f < a ? 0 : Math.max(0.01, back(lin(f, a, a + n), s)));
const char = (id, pos, h, key, draw, extra = {}) => ({ id, pos, h, key, draw, res: 1.2, design: [600, 1000], blobR: 0.4, shadow: true, groundY: 0, protect: false, ...extra });
/** invisible card that only marks a face / hero prop the text must not cover */
const proxy = (id, pos, w, h) => ({ id, pos, h, key: "proxy", draw: () => {}, res: 0.05, design: [Math.round(1000 * w / h), 1000], anchor: "center", bill: "fixed", rotY: 0, noTint: true, protect: true });
const meat = (id, pos, h, seed, rotZ = 0, extra = {}) => ({ id, pos, h, key: "meat|" + seed + (extra.glint != null ? "|" + extra.glint : ""), draw: (p) => T.drawMeatM(p, seed, extra.glint ?? -1), res: 0.9, design: [300, 300], anchor: "center", bill: "screen", rotZ, noTint: false, ...extra });
const fx = (id, pos, h, key, draw, design = [300, 300], extra = {}) => ({ id, pos, h, key, draw, res: 0.8, design, noTint: true, ...extra });
/** a card at a fixed place in the frame: sx, sy in -1..1 of the half-width / half-height, d metres in front of the lens */
const camRel = (cam, sx, sy, d) => { const fw = norm(sub3(cam.look, cam.pos)), rt = norm(cross(fw, [0, 1, 0])), up = cross(rt, fw), th = Math.tan((cam.fov * Math.PI) / 360);
  return add3(add3(add3(cam.pos, fw.map((v) => v * d)), rt.map((v) => v * sx * d * th * 0.5625)), up.map((v) => v * sy * d * th)); };

export const actorsAt = (f) => {
  const s = shotAt(f), id = s.id, A = [], cam = camAt(f);
  const yard = id <= 11 || id === 16;
  // ---- shot 1: the hook steak at the lens + a few chunks + the "?" ----
  const hookChunks = (f) => { if (id === 1 || f >= 990) for (let i = 0; i < 6; i++) { const tt = (f >= 990 ? f - 1007 : f) / 64, dd = 9 + i * 2.2, base = add3(CAM0.pos, norm(sub3(CAM0.look, CAM0.pos)).map((v) => v * dd)), sp = add3(base, [(i % 2 ? 1 : -1) * (1.1 + 0.5 * i), 2 - 5 * tt - (i % 3), (i % 3 - 1) * 1.2]); A.push(meat("hc" + i, sp, 0.55, i % 4, f * 0.06 * (i % 2 ? 1 : -1) + i)); } };
  hookChunks(f);
  if (id === 1) {
    const t = easeIn(lin(f, 0, 60)), p = mixv(HOOK_A, HOOK_B, t), spin = 0.9 * Math.sin(f * 0.09) + f * 0.05;
    A.push(meat("hook", p, 0.75, 1, spin, { glint: q((f * 0.03) % 1, 0.05), protect: f < 40 }));
    if (f >= 14) A.push({ id: "q", pos: camRel(cam, -0.62, 0.32, 2), h: 0.42 * pop(f, 14, 10), key: "q", draw: (p) => T.drawHookQM(p, 1), res: 0.8, design: [300, 300], anchor: "center", bill: "screen", rotZ: 0.12 * Math.sin(f * 0.15), noTint: true, protect: false, order: 3 });
  }
  if (id === 16 && f >= 986) { const t = lin(f, 986, 1007), p = mixv(add3(CAM0.pos, norm(sub3(CAM0.look, CAM0.pos)).map((v) => v * 16)), HOOK_A, t);   // loop: the next steak is already falling = frame 0
    A.push(meat("hookE", p, 0.75, 1, 0.9 * Math.sin(f * 0.09) + (f - 1007) * 0.05)); }
  if (!yard) return vultures(f, id, A);
  // ---- the yard ----
  const fireT = q((f * 0.045) % 1, 0.125);
  A.push(fx("fire", [KETTLE[0], 0, KETTLE[2] + 0.05], 0.4, "fire|" + fireT, (p) => { T.drawFireM(p, fireT); T.fxSparks(p, fireT, 6, 150, 190); }, [300, 300], { noTint: false }));
  A.push(fx("steam", [KETTLE[0], 0.72, KETTLE[2]], 1.0, "steam|" + q((f * 0.02) % 1, 0.0625), (p) => T.drawSteamM(p, q((f * 0.02) % 1, 0.0625)), [300, 300], { blend: "alpha", opacity: id === 16 ? 0 : id === 5 ? 0.45 : 0.85 }));
  A.push(fx("smoke", [-7.6, 5.3, -7.8], 3.2, "smoke|" + q((f * 0.012) % 1, 0.0625), (p) => T.drawSteamM(p, q((f * 0.012) % 1, 0.0625)), [300, 300], { blend: "alpha", opacity: 0.7, tint: "#d8dde4", noTint: false }));
  // Mrs. Crouch
  { const i1 = idle(f, 11), bl = blinkAt(f, 11), stir = 0.5 + 0.5 * Math.sin(f * 0.16);
    const sp = "stirP" + stirPh(f), held = "stirP" + stirPh(Math.min(f, 112));
    let pose = [sp, sp, 0], expr = "hum", chunk = 0, tilt = 0;
    if (id === 2) { pose = [held, held, 0]; expr = f >= 112 ? "gape" : "hum"; }
    if (id === 5 && f >= 342) { pose = ["stirP0", "stirP0", 0]; expr = "gape"; tilt = -0.05; }
    if (id === 6 || id === 7) { pose = ["stirP0", "coverM", q(smooth(lin(f, 364, 374)), 0.1)]; expr = "shock"; }
    if (id === 8 || id === 9 || id === 10) { pose = ["coverM", "coverM", 1]; expr = "shock"; }
    if (id === 11) { pose = ["stirP0", "stirP0", 0]; expr = "squint"; }
    if (id === 16) { pose = ["stirP0", "ladleOut", q(smooth(lin(f, 926, 940)), 0.1)]; expr = "deadpan"; chunk = f >= 951 ? q(Math.min(1, back(lin(f, 951, 960), 1.4)), 0.1) : 0; }
    const st = { pose, expr, blink: bl, chunk, headTilt: tilt, ladle: id === 16 };
    A.push({ id: "crouch", pos: [CROUCH[0], i1.dy, CROUCH[2]], h: 2.25, key: "crouch|" + keyOf(st), draw: (p) => T.drawCrouchM(p, st), res: 1.2, design: [800, 1000], blobR: 0.4, shadow: true, groundY: 0, protect: false, rotZ: i1.rot });
    if (![1, 7, 8, 9, 10].includes(id) && !(id === 11 && f >= 640) && !(id === 16 && f >= 978)) A.push(proxy("pxC", [CROUCH[0], 1.52, CROUCH[2] + 0.05], 0.62, 0.66)); if (id === 16 && f >= 940 && f < 978) A.push(proxy("pxL", [CROUCH[0] + 0.62, 1.42, CROUCH[2] + 0.05], 0.4, 0.3)); }
  // the two farmers (they walk over from the gate once the rain starts; tasting from shot 8)
  if (id >= 6 && id !== 16) for (const [who, P, seed] of [["a", FA, 21], ["b", FB, 22]]) { const i2 = idle(f, seed), bl = blinkAt(f, seed), e = eatAt(who, f);
    let pose = ["holdM", "eatM", e.eat], expr = e.expr, look = 0;
    if (id < 8) { pose = ["hang", "hang", 0]; expr = "shock"; }
    if (who === "b" && f >= 570 && id === 10) { pose = ["holdM", "shrug", q(smooth(lin(f, 570, 578)), 0.1)]; }
    if (id === 11) { pose = ["holdM", "holdM", 1]; expr = "squint"; look = -0.3; }
    const st = { pose, expr, blink: e.bite ? 0 : bl, chunk: id >= 8 ? 1 : 0, bites: e.bites, cheek: e.cheek, crumbs: e.crumbs, look };
    A.push(char("f" + who, [P[0], i2.dy, P[2]], 2.25, "farm" + who + "|" + keyOf(st), (p) => T.drawFarmerM(p, who, st), { rotZ: i2.rot }));
    if (id >= 8 && id <= 11) A.push(proxy("px" + who, [P[0], 1.55, P[2] + 0.05], 0.8, 0.7)); }
  // thought bubbles
  if ((id === 9 || id === 10) && f >= 518) A.push(fx("bubA", [FA[0] - 0.12, 1.86, FA[2] + 0.05], 0.5 * pop(f, 518, 10), "bub|lamb", (p) => T.drawBubbleM(p, "lamb", 1), [700, 600], { anchor: "center", bill: "fixed", protect: true, res: 1 }));
  if (id === 10 && f >= 553) A.push(fx("bubB", [FB[0] - 0.12, 1.86, FB[2] + 0.05], 0.5 * pop(f, 553, 10), "bub|deer", (p) => T.drawBubbleM(p, "deer", 1), [700, 600], { anchor: "center", bill: "fixed", protect: true, res: 1 }));
  // the chicken: pecks, then dodges the rain by the fence
  { const ch = id === 7 ? [5.95 - 0.01 * (f - 410), 0, -3.0] : [3.1, 0, -4.6], dodge = id === 7 ? Math.max(0, Math.sin(Math.max(0, f - 414) * 0.25)) * (f > 414 ? 1 : 0) : 0;
    const st = { ph: q((f * 0.06) % 1, 0.125), flap: q(dodge, 0.25), squawk: id === 7 && f > 441 ? 1 : 0, facing: id === 7 ? -1 : 1 };
    A.push({ id: "chick", pos: [ch[0], 0.02 + 0.25 * st.flap, ch[2]], h: 0.62, key: "chick|" + keyOf(st), draw: (p) => T.drawChickenM(p, st), res: 1, design: [400, 400], blobR: 0.22, shadow: true, groundY: 0, protect: false }); }
  if (id === 7) for (let i = 0; i < 7; i++) { const s0 = 404 + i * 6, x = 5.2 + 1.3 * rnd(i + 70), z = -3.6 + 1.4 * rnd(i + 80), tt = f - s0; if (tt < 0) continue;
    const yy = 3.2 - 0.18 * tt; const y = yy > 0.1 ? yy : 0.1 + Math.max(0, 0.35 * Math.sin(Math.min(Math.PI, (0.1 - yy) / 0.18 * 0.5)));
    A.push(meat("k7" + i, [x, y, z], 0.3, i % 4, f * 0.1 * (i % 2 ? 1 : -1))); if (yy <= 0.1 && yy > -1.4) A.push(fx("k7d" + i, [x, 0, z], 0.4, "puff|" + q(Math.min(1, -yy / 1.4), 0.125), (p) => T.fxPuff(p, q(Math.min(1, -yy / 1.4), 0.125)), [300, 300], { blend: "alpha" })); }
  // chunk 2 (shot 2) and the first plop (shot 5) into the kettle, the ladle chunk (shot 16)
  if (id === 2 && f < 118) { A.push(meat("c2", c2At(f), 0.75, 2, f * 0.08, { glint: q((f * 0.04) % 1, 0.05) }));
    for (let i = 0; i < 4; i++) { const t0 = 70 + i * 9; if (f >= t0) A.push(meat("c2b" + i, fall(f, t0, t0 + 50, [1.0 + (i % 2 ? 2.2 : -2.4) + i * 0.3, 10 + i, -3.5 - i], [1.0 + (i % 2 ? 2.2 : -2.4) + i * 0.3, -3, -3.5 - i]), 0.45, i % 4, f * 0.07 * (i % 2 ? 1 : -1))); } }
  if (id === 5 && f >= 318 && f < 338) A.push(meat("c5", fall(f, 318, 338, [KETTLE[0] + 0.05, 4.5, KETTLE[2]], [KETTLE[0], 0.7, KETTLE[2]]), 0.3, 3, f * 0.08));
  if (id === 16 && f >= 936 && f < 951) A.push(meat("c16", fall(f, 936, 951, [1.6, 4.2, -1.95], [1.25, 1.42, -1.95]), 0.26, 0, f * 0.08));
  for (const [a, n] of [[118, 14], [338, 12]]) if (f >= a && f < a + n) A.push(fx("spl" + a, [KETTLE[0], 0.66, KETTLE[2] + 0.1], 0.6, "spl|" + q((f - a) / n, 0.1), (p) => T.drawSoapSplashM(p, q((f - a) / n, 0.1)), [800, 800]));
  // the rain + chunks resting on the ground
  if (f >= 320) for (const r of RAIN) { const st = rainAt(r, f); if (!st) continue;
    if (!st.falling) { if (inKettle(r)) { if (st.t < 8) A.push(fx("rs" + r.id, [r.x, 0.66, r.z], 0.5, "spl|" + q(st.t / 8, 0.125), (p) => T.drawSoapSplashM(p, q(st.t / 8, 0.125)), [800, 800])); continue; }
      A.push(meat(r.id, [r.x, 0.03, r.z], 0.26, r.seed, r.rest, { bill: "flat", anchor: "center" }));
      if (st.t < 9 && !(id >= 8 && id <= 10)) A.push(fx("rd" + r.id, [r.x, 0, r.z], 0.5, "puff|" + q(st.t / 9, 0.125), (p) => T.fxPuff(p, q(st.t / 9, 0.125)), [300, 300], { blend: "alpha" }));
      continue; }
    if (id >= 8 && id <= 10) continue;                                            // the downpour is over while they taste it
    A.push(meat(r.id, [r.x, st.y, r.z], 0.4, r.seed, r.spin * f)); }
  return A;
};

// ---------------- the tasting: two bites each, chomp on the word, then chewing with a full cheek ----------------
const BITES = { a: [474, 531], b: [481, 556] };
const eatAt = (who, f) => { const B = BITES[who]; let eat = 0, bites = 0, bite = false, sinceChomp = 999;
  for (const tb of B) { if (f >= tb) { bites++; sinceChomp = f - tb; }
    const up = smooth(lin(f, tb - 7, tb - 1)), down = smooth(lin(f, tb + 3, tb + 11)); eat = Math.max(eat, up * (1 - down) + (f >= tb + 3 ? 0.45 * down : 0) * 0);
    if (f >= tb - 5 && f < tb) bite = true; }
  if (bites > 0 && sinceChomp > 11) eat = 0.38;                                   // resting just under the chin while chewing
  else if (bites > 0 && sinceChomp >= 3) eat = Math.max(eat, 0.38 + 0.62 * (1 - smooth(lin(sinceChomp, 3, 11))));
  const chewing = bites > 0 && sinceChomp >= 0 && sinceChomp < 34, ph = Math.floor(f / 4) % 2;
  const sq = (who === "a" && f >= 516) || (who === "b" && f >= 551 && f < 570);
  const expr = bite ? "bite" : chewing ? (sq ? (ph ? "chewSqA" : "chewSqB") : (ph ? "chewA" : "chewB")) : bites ? (sq ? "squint" : "chewB") : "squint";
  return { eat: q(eat, 0.05), bites, bite, expr, cheek: chewing ? (ph ? 1 : 0.7) : 0, crumbs: sinceChomp < 14 ? q(sinceChomp / 14, 0.1) : 0 };
};

// ---------------- the vultures (shots 12-15) ----------------
const gagAt = (i, f) => { const hi = HERO.indexOf(i), t0 = hi === 0 ? 830 : hi === 1 ? 858 : hi === 2 ? 868 : 884 + 3 * ((i * 5) % NV); return f < t0 ? 0 : clamp((f - t0) / 4); };
const vultures = (f, id, A) => {
  if (id < 12) return A;
  for (let i = 0; i < NV; i++) { const p = vPos(i, f), g = gagAt(i, f), t0 = f - (HERO.indexOf(i) === 0 ? 834 : HERO.indexOf(i) === 1 ? 862 : HERO.indexOf(i) === 2 ? 872 : 888 + 3 * ((i * 5) % NV));
    const st = { flap: q((f * 0.03 + i * 0.13) % 1, 0.0625), gag: q(g, 0.25), spew: t0 > 0 ? q(Math.min(1, t0 / 22), 0.05) : 0, facing: Math.cos((i / NV) * Math.PI * 2 + 0.004 * f + 0.4) > 0 ? -1 : 1, blink: blinkAt(f, 40 + i) };
    A.push({ id: "v" + i, pos: p, h: 2.3, key: "vul|" + keyOf(st), draw: (pp) => T.drawVultureM(pp, st), res: 0.9, design: [800, 800], anchor: "center", bill: "screen", noTint: false, protect: false, order: 1 });
    if (st.spew > 0 && st.spew < 1) for (let k = 0; k < 3; k++) A.push(meat("vs" + i + k, add3(p, [(st.facing > 0 ? 0.5 : -0.5) + 0.25 * k, -0.6 - 3 * st.spew * st.spew - 0.5 * k, 0.1]), 0.34, k, f * 0.1));
    if (id === 14 && i === HERO[0]) A.push({ ...proxy("pxV", add3(p, [0.1, 0.45, 0.2]), 0.9, 0.8), bill: "screen" }); }
  return A;
};
