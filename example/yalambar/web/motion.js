// Motion helpers: all pure functions of the frame.
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lin = (f, a, b) => clamp((f - a) / (b - a));
export const smooth = (t) => t * t * (3 - 2 * t);
export const smoother = (t) => t * t * t * (t * (t * 6 - 15) + 10);
export const easeOut = (t) => 1 - (1 - t) ** 3;
export const easeIn = (t) => t * t * t;
export const back = (t, s = 1.7) => 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2;
/** damped spring settle from 0 -> 1 (t in frames since start) */
export const spring = (t, k = 0.32, d = 0.12) => (t <= 0 ? 0 : 1 - Math.exp(-d * t) * Math.cos(k * t));
export const mixv = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
export const q = (v, s = 0.02) => Math.round(v / s) * s;
const rnd = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** Catmull-Rom through points (arrays), t in 0..1 over the whole path */
export const path = (pts, t) => {
  const n = pts.length - 1, x = clamp(t) * n, i = Math.min(n - 1, Math.floor(x)), u = x - i;
  const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)];
  return p1.map((_, k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u * u + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u * u * u));
};

/** camera keys: [{f, pos, look, fov, roll, ease}] ; ease of the segment arriving at a key: 'smooth'|'out'|'in'|'lin' */
export const camFromKeys = (keys, f) => {
  if (f <= keys[0].f) return { ...keys[0], roll: keys[0].roll ?? 0 };
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1], b = keys[i];
    if (f <= b.f) {
      let t = (f - a.f) / (b.f - a.f);
      const e = b.ease ?? "smooth";
      t = e === "out" ? easeOut(t) : e === "in" ? easeIn(t) : e === "lin" ? t : smoother(t);
      const pos = b.via ? path([a.pos, ...b.via, b.pos], t) : mixv(a.pos, b.pos, t);
      return { pos, look: mixv(a.look, b.look, t), fov: (a.fov ?? 40) + ((b.fov ?? 40) - (a.fov ?? 40)) * t, roll: (a.roll ?? 0) + ((b.roll ?? 0) - (a.roll ?? 0)) * t };
    }
  }
  const z = keys[keys.length - 1];
  return { ...z, roll: z.roll ?? 0 };
};

/** subtle hand-held drift so nothing is ever static */
export const drift = (f, amp = 0.012, seed = 1) => [
  amp * Math.sin(f * 0.031 + seed), amp * 0.7 * Math.sin(f * 0.023 + seed * 2), amp * 0.5 * Math.sin(f * 0.027 + seed * 3)];

/** impact kick: decaying shake over n frames */
export const kick = (f, at, amp = 0.06, n = 7) => {
  const t = f - at;
  if (t < 0 || t > n) return [0, 0];
  const d = (1 - t / n) ** 2;
  return [amp * d * Math.sin(t * 2.7), amp * d * Math.cos(t * 3.3)];
};

/** idle: breathing bob + tiny sway, per character */
export const idle = (f, seed) => ({ dy: 0.012 * Math.sin(f * 0.11 + seed), rot: 0.012 * Math.sin(f * 0.07 + seed * 1.7) });

/** blink: 3-frame blink every 2.4-4 s */
export const blinkAt = (f, seed) => {
  const period = 75 + Math.floor(rnd(seed) * 45), off = Math.floor(rnd(seed + 1) * period), c = (f + off) % period;
  return c === 0 || c === 2 ? 0.5 : c === 1 ? 1 : 0;
};
