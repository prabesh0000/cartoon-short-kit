// Motion helpers: smooth, continuous, "animated" movement for cameras and cards.
// Import in story.js:  import { M } from './motion.js';
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
export const ramp = (f, a, b) => clamp((f - a) / (b - a));
export const M = {
  smooth: (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); },           // smootherstep (glides)
  easeOut: (t) => 1 - Math.pow(1 - clamp(t), 3),                                          // fast start, soft land (reference "burst" moves)
  easeIn: (t) => Math.pow(clamp(t), 3),
  back: (t, s = 1.7) => { t = clamp(t) - 1; return t * t * ((s + 1) * t + s) + 1; },        // overshoot then settle (pops, arrivals)
  anticip: (t, s = 0.12) => { t = clamp(t); return t < 0.25 ? -s * Math.sin(t / 0.25 * Math.PI) : M.back((t - 0.25) / 0.75); }, // wind-up then go
  inOut: (t) => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },   // whip pans: slow-fast-slow (pair with post.json blur)
  spring: (t, freq = 3, damp = 5) => { t = Math.max(0, t); return 1 - Math.exp(-damp * t) * Math.cos(freq * 2 * Math.PI * t); },  // settle wobble (t in s)
};
/** Centripetal Catmull-Rom through 3D points; u in [0,1] over the whole path (constant-ish speed). */
export const spline = (pts, u) => {
  const n = pts.length - 1, x = clamp(u) * n, i = Math.min(n - 1, Math.floor(x)), t = x - i;
  const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)];
  return p1.map((_, k) => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t * t * t));
};
/** Camera from keys {f,pos,look,fov,roll,ease?}. 3+ keys inside one glide use a spline (no corners).
 *  Every hold creeps (push-in) so nothing ever freezes; add kicks for impacts. */
export const camFromKeys = (K, f, { creep = 0.0012, kicks = [] } = {}) => {
  let c;
  if (f <= K[0].f) c = { ...K[0] };
  else if (f >= K[K.length - 1].f) c = { ...K[K.length - 1] };
  else {
    const i = K.findIndex((k, j) => f >= k.f && f <= K[j + 1].f), a = K[i], b = K[i + 1];
    const ease = M[b.ease || 'smooth'], t = ease((f - a.f) / (b.f - a.f));
    if (b.path) { // optional via-points for curved moves: b.path = [[x,y,z], ...]
      const pts = [a.pos, ...b.path, b.pos]; c = { pos: spline(pts, t), look: lerp3(a.look, b.look, t), fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll || 0, b.roll || 0, t) };
    } else c = { pos: lerp3(a.pos, b.pos, t), look: lerp3(a.look, b.look, t), fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll || 0, b.roll || 0, t) };
  }
  c.fov *= 1 - creep * Math.max(0, f - K[0].f) * 0.15; // gentle push-in during holds
  for (const k of kicks) { const d = f - k.f; if (d >= 0 && d < 7) { const s = (d % 2 ? -1 : 1) * k.a * (1 - d / 7); c.look = [c.look[0], c.look[1] + s * 3, c.look[2] + s * 2]; c.roll = (c.roll || 0) + s * 20; } }
  return c;
};
/** Idle life for a card: breathing bob + small sway, deterministic per seed. Use on EVERY on-screen character. */
export const idle = (f, seed = 1) => ({
  bob: 0.006 * Math.sin((f + seed * 11) * 0.11),
  tilt: 1.2 * Math.sin((f + seed * 7) * 0.05),
  headTilt: 1.5 * Math.sin((f + seed * 5) * 0.037 + 1),
});
/** Blink: 4-frame lid every 0.5-2.3 s. */
export const blinkAt = (f, seed) => { const per = 38 + (seed * 17) % 31, ph = (f + seed * 13) % per; return ph < 2 ? 0.5 : ph < 4 ? 1 : 0; };
/** Walk: phase for step cycles + planted travel. speed m/s, stride m. */
export const walk = (f, f0, speed = 1.1, stride = 0.8) => { const t = Math.max(0, f - f0) / 30; return { dist: t * speed, phase: (t * speed / (2 * stride)) % 1 }; };
/** Round values used in card keys so canvas redraws happen only when the pose visibly changes. */
export const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;

// ---------- transitions learned from the reference shorts (guides/editing-grammar.md) ----------
/** Whip pan as two camera keys: hold `from`, whip to `to` over `len` frames (8-12) with ease inOut.
 *  Add the returned blur entry to work/post.json so the whip is motion-blurred (no strobing, framediff treats it as planned).
 *  Usage: const w = whip(118, A, B); keys.push(...w.keys); post.blur.push(w.blur); */
export const whip = (f0, from, to, len = 10, n = 10) => ({
  keys: [{ ...from, f: f0 }, { ...to, f: f0 + len, ease: "inOut", roll: (to.roll || 0) }],
  blur: { from: f0 + 1, to: f0 + len - 1, n, shutter: 0.9 },
});
/** Follow-the-object camera: the camera trails a moving object (rolled bomb, flushed waste, thrown ball).
 *  posAt(f) -> [x,y,z] of the object. The camera sits at the object's position `lag` frames ago + offset and looks
 *  slightly ahead of it, so the object leads the frame. Moves only HALF the object's speed when `half` (calmer, no spikes). */
export const followCam = (posAt, f, { offset = [0, 0.6, 2.4], lag = 6, lead = 4, fov = 40, half = false, f0 = 0 } = {}) => {
  const p = posAt(Math.max(f0, f - lag)), a = posAt(f + lead);
  const base = half ? lerp3(posAt(f0), p, 0.5) : p;
  return { pos: [base[0] + offset[0], base[1] + offset[1], base[2] + offset[2]], look: a, fov, roll: 0 };
};
/** Crowd layout: n positions on a jittered grid inside [x0,x1] x [z0,z1], back rows first (draw order), each with a
 *  seed (outfit/face variety), a phase offset (so idles and laughs never move in sync) and a scale wobble.
 *  Use for armies, a laughing court, a whole camp: crowds make the world feel big. */
export const crowd = (n, { x0 = -4, x1 = 4, z0 = -6, z1 = -1, seed = 7, jitter = 0.35 } = {}) => {
  const cols = Math.max(1, Math.round(Math.sqrt(n * (x1 - x0) / Math.max(0.1, z1 - z0)))), rows = Math.ceil(n / cols), out = [];
  const rnd = (i) => { const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453; return x - Math.floor(x); };
  for (let i = 0; i < n; i++) {
    const c = i % cols, r = Math.floor(i / cols);
    const x = x0 + (cols === 1 ? 0.5 : (c + (r % 2) * 0.5) / cols) * (x1 - x0) + (rnd(i) - 0.5) * jitter;
    const z = z0 + (rows === 1 ? 0.5 : r / (rows - 1)) * (z1 - z0) + (rnd(i + 99) - 0.5) * jitter;
    out.push({ x, z, seed: 1 + Math.floor(rnd(i + 7) * 997), phase: Math.floor(rnd(i + 3) * 60), scale: 0.94 + rnd(i + 5) * 0.1 });
  }
  return out.sort((a, b) => a.z - b.z);
};
