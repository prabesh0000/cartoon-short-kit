// Our own flat 2D cartoon cast (riflemen, officer, townsfolk, kid, parent) + 2D effects, drawn on a canvas.
// Construction v2 (characters.md, our own cast): superellipse heads (pointed crown 1.75 / full jaw 2.3, chin taper,
// seeded side bulge + tilt), bean torsos, single-stroke limbs with ink-dot hands, a thick-thin plum outline weighted
// away from the light, soft painted crescents, deadpan lidded eyes, no blush, no catchlights.
// Design space 600 x 1000 units (soles at y = 975); the canvas transform scales it.
export const INK = "#241726";
export const SKIN = "#ffe2c2";
const WHITE = "#ffffff";
const MOUTH = "#5a1e28";
const TONGUE = "#e86e78";
                                   
const SH_SKIN     = [0.96, 0.86, 0.84]; // measured shadow/lit ratio on skin heads
const SH_CLOTH     = [0.64, 0.66, 0.74]; // torsos: lit side -> far side ~0.65
const SH_FELT     = [0.62, 0.62, 0.7];

                                              
                      
                                                                                                                             
                                                                                                                                
                
  
                           

const rad = (d        ) => (d * Math.PI) / 180;
const clamp = (x        , a        , b        ) => Math.max(a, Math.min(b, x));
export const mul = (c        , m    ) => {
  const n = parseInt(c.slice(1), 16);
  const ch = (v        , k        ) => Math.min(255, Math.round(v * k)).toString(16).padStart(2, "0");
  return `#${ch((n >> 16) & 255, m[0])}${ch((n >> 8) & 255, m[1])}${ch(n & 255, m[2])}`;
};
export const shade = (c        , k        ) => mul(c, [k, k, k]);
export const mix = (a        , b        , t        ) => {
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
  const ch = (s        ) => Math.round(((A >> s) & 255) * (1 - t) + ((B >> s) & 255) * t).toString(16).padStart(2, "0");
  return `#${ch(16)}${ch(8)}${ch(0)}`;
};
/** deterministic per-character random in [0, 1) */
const rnd = (seed        , k        ) => { const x = Math.sin(seed * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const rotPts = (pts      , a        , cx        , cy        )       =>
  pts.map(([x, y]) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)]);
const rotAbout = (q    , a        , c    )     => rotPts([q], a, c[0], c[1])[0];
const lerp2 = (a    , b    , t        )     => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
/** smooth curve from a through (near) k to b, as a polyline */
const curve = (a    , k    , b    , n = 10)       => {
  const c     = [2 * k[0] - (a[0] + b[0]) / 2, 2 * k[1] - (a[1] + b[1]) / 2], out       = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, s = 1 - t;
    out.push([s * s * a[0] + 2 * s * t * c[0] + t * t * b[0], s * s * a[1] + 2 * s * t * c[1] + t * t * b[1]]);
  }
  return out;
};

export const RIFLEMAN         = { jacket: "#357650", pants: "#3d4440", boots: INK, hat: "shako", belt: "#f1efe6", buttons: "#d9dde0", rifle: true };
export const OFFICER         = { ...RIFLEMAN, hat: "shako_tall", buttons: "#e8c45a", sash: "#c0353a", sword: true, moustache: "#4a3020", rifle: false, belt: null, build: "stout" };
export const KID         = { jacket: "#f08a2c", pants: "#3b5b9a", boots: "#f4f1ea", hat: "cap", cap: "#e2453c", build: "kid" };
export const PARENT         = { jacket: "#7b5ac9", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#5a3b2a" };
export const SKINS = [SKIN, "#f5c9a0", "#ecd0b6", "#c99067"];

export const soldier = (v = 0, extra                  = {})         => {
  const o         = { ...RIFLEMAN, skin: SKINS[v % 4] };
  if (v % 4 === 1) o.moustache = "#4a3426";
  if (v % 4 === 3) o.moustache = "#2a201a";
  return { ...o, ...extra };
};

export const townsfolk = (v = 0)         => {
  const coats = ["#3f6fb5", "#8c3b4a", "#5d7a3a", "#b5653f", "#2f5f6a", "#7b5ac9"];
  const o         = { jacket: coats[v % 6], pants: "#3b3f52", boots: "#4a3426", skin: SKINS[v % 4] };
  return v % 2 ? { ...o, hat: "bonnet", dress: ["#d9a441", "#c25a7a", "#5a8fc2"][v % 3] } : { ...o, hat: "tophat" };
};

export class Pen {
  g                          ;
  ol = 12;
  /** [angle, cx, cy] rotation about (cx, cy), optional post-translation [.., dx, dy] */
  rot                  = null;
  constructor(g                          ) { this.g = g; }
  P(x        , y        )     {
    if (!this.rot) return [x, y];
    const r = this.rot, a = r[0], cx = r[1], cy = r[2], dx = r.length > 3 ? r[3] : 0, dy = r.length > 4 ? r[4] : 0, c = Math.cos(a), s = Math.sin(a);
    return [cx + (x - cx) * c - (y - cy) * s + dx, cy + (x - cx) * s + (y - cy) * c + dy];
  }
  path(pts      , close         ) {
    const g = this.g;
    g.beginPath();
    pts.forEach((p, i) => { const [x, y] = this.P(p[0], p[1]); if (i) g.lineTo(x, y); else g.moveTo(x, y); });
    if (close) g.closePath();
  }
  /** filled shape with an ink outline; fill=null draws the outline only */
  poly(pts      , fill               , ol         ) {
    const g = this.g, w = ol ?? this.ol;
    this.path(pts, true);
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (w) { g.lineWidth = w; g.strokeStyle = INK; g.lineJoin = "round"; g.stroke(); }
  }
  ell(cx        , cy        , rx        , ry        , fill               , ol         , a0 = 0, a1 = 360, rot = 0) {
    this.poly(ellPts(cx, cy, rx, ry, a0, a1, rot), fill, ol);
  }
  /** thick round-capped limb with an ink rim (effects, rope) */
  line(pts      , fill        , w        , ink = true) {
    const g = this.g;
    g.lineCap = "round"; g.lineJoin = "round";
    if (ink) { this.path(pts, false); g.strokeStyle = INK; g.lineWidth = w + 2 * this.ol * 0.9; g.stroke(); }
    this.path(pts, false); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
  }
  stroke(pts      , w        , fill = INK) {
    const g = this.g;
    g.lineCap = "round"; g.lineJoin = "round";
    this.path(pts, false); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
  }
  arc(cx        , cy        , rx        , ry        , a0        , a1        , w        , fill = INK) {
    const pts       = [];
    for (let i = 0; i <= 24; i++) pts.push([cx + rx * Math.cos(rad(a0 + ((a1 - a0) * i) / 24)), cy + ry * Math.sin(rad(a0 + ((a1 - a0) * i) / 24))]);
    this.stroke(pts, w, fill);
  }
  dot(cx        , cy        , r        , fill = INK) {
    const [x, y] = this.P(cx, cy);
    this.g.beginPath(); this.g.arc(x, y, r, 0, Math.PI * 2); this.g.fillStyle = fill; this.g.fill();
  }
  /** draw with a closed shape as clip */
  clip(pts      , fn            ) { const g = this.g; g.save(); this.path(pts, true); g.clip(); fn(); g.restore(); }
  /** flat fill + soft crescent on the side away from the light (light = canvas angle the light comes FROM).
   *  Radial ramp centred `shift` R toward the light: flat out to ~0.6 R on the far side, full shadow by ~0.8 R. */
  shadedFill(pts      , base        , shadow        , light        , R        , shift = 0.45, r0 = 1.05, r1 = 1.25) {
    const g = this.g, n = pts.length;
    let cx = 0, cy = 0;
    for (const [x, y] of pts) { cx += x / n; cy += y / n; }
    const [gx, gy] = this.P(cx + Math.cos(light) * shift * R, cy + Math.sin(light) * shift * R);
    const gr = g.createRadialGradient(gx, gy, 0, gx, gy, r1 * R);
    gr.addColorStop(0, base); gr.addColorStop(r0 / r1, base); gr.addColorStop(1, shadow);
    this.path(pts, true); g.fillStyle = gr; g.fill();
  }
  /** broad gradient across a shape along the light: lit edge = base, far edge = shadow (torsos, coats) */
  gradFill(pts      , base        , shadow        , light        , flat = 0.22) {
    const g = this.g, dx = Math.cos(light), dy = Math.sin(light), n = pts.length;
    let cx = 0, cy = 0, lo = Infinity, hi = -Infinity;
    for (const [x, y] of pts) { cx += x / n; cy += y / n; const d = x * dx + y * dy; lo = Math.min(lo, d); hi = Math.max(hi, d); }
    const dc = cx * dx + cy * dy;
    const [ax, ay] = this.P(cx + dx * (hi - dc), cy + dy * (hi - dc)), [bx, by] = this.P(cx + dx * (lo - dc), cy + dy * (lo - dc));
    const gr = g.createLinearGradient(ax, ay, bx, by);
    gr.addColorStop(0, base); gr.addColorStop(flat, base); gr.addColorStop(1, shadow);
    this.path(pts, true); g.fillStyle = gr; g.fill();
  }
  /** thick-thin ink ring: w(θ) = w0 (1 + k cos(θ − thick)), θ from the contour centroid (canvas angles) */
  inkRing(pts      , w0        , thick        , k = 0.45, col = INK) {
    const n = pts.length;
    let cx = 0, cy = 0;
    for (const [x, y] of pts) { cx += x / n; cy += y / n; }
    const out       = [], inn       = [];
    pts.forEach((q, i) => {
      const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
      let nx = b[1] - a[1], ny = a[0] - b[0]; // outward normal for clockwise-on-screen contours
      const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
      const h = 0.5 * w0 * (1 + k * Math.cos(Math.atan2(q[1] - cy, q[0] - cx) - thick));
      out.push([q[0] + nx * h, q[1] + ny * h]); inn.push([q[0] - nx * h, q[1] - ny * h]);
    });
    const g = this.g;
    const trace = (r      ) => { r.forEach(([x0, y0], i) => { const [x, y] = this.P(x0, y0); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath(); };
    g.beginPath(); trace(out); trace(inn.reverse());
    g.fillStyle = col; g.fill("evenodd");
  }
  /** flat strap with a thin ink rim (cross belts, sash, rifle, handles) */
  band(pts      , fill        , w        , rim        , cap                = "butt") {
    const g = this.g; g.lineCap = cap; g.lineJoin = "round";
    this.path(pts, false); g.strokeStyle = INK; g.lineWidth = w + 2 * rim; g.stroke();
    this.path(pts, false); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
    g.lineCap = "round";
  }
}

const ellPts = (cx        , cy        , rx        , ry        , a0 = 0, a1 = 360, rot = 0, n = 48)       => {
  const r = rad(rot), pts       = [];
  for (let i = 0; i <= n; i++) {
    const a = rad(a0 + ((a1 - a0) * i) / n), x = rx * Math.cos(a), y = ry * Math.sin(a);
    pts.push([cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)]);
  }
  return pts;
};

const rrect = (x0        , y0        , x1        , y1        , r        , n = 8)       => {
  const pts       = [];
  for (const [cx, cy, a] of [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]])
    for (let i = 0; i <= n; i++) pts.push([cx + r * Math.cos(rad(a + (90 * i) / n)), cy + r * Math.sin(rad(a + (90 * i) / n))]);
  return pts;
};

/** tapered stroke, thick end at a: brows, moustache halves */
const taper = (p     , a    , b    , wa        , wb        , col = INK) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  p.poly([[a[0] + nx * wa / 2, a[1] + ny * wa / 2], [b[0] + nx * wb / 2, b[1] + ny * wb / 2],
    [b[0] - nx * wb / 2, b[1] - ny * wb / 2], [a[0] - nx * wa / 2, a[1] - ny * wa / 2]], col, 0);
  p.dot(a[0], a[1], wa / 2, col); p.dot(b[0], b[1], wb / 2, col);
};

// ---------------- contours ----------------
                                                                                                                                             

/** superellipse "bean": separate crown / jaw exponents, egg taper (neg = narrower chin), one-side bulge, soft noise.
 *  Points run right -> down -> left -> up (clockwise on screen). */
export const blobPts = (cx        , cy        , B      , n = 72)       => {
  const ph = [rnd(B.seed, 11), rnd(B.seed, 12), rnd(B.seed, 13)].map((v) => v * Math.PI * 2);
  const pts       = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t), e = 2 / (s < 0 ? B.nTop : B.nBot);
    let X = Math.sign(c) * Math.abs(c) ** e;
    const Y = Math.sign(s) * Math.abs(s) ** e;
    X *= (1 + B.egg * Y) * (1 + B.asym * Math.sign(X));
    const r = 1 + B.noise * (Math.cos(2 * t + ph[0]) + 0.7 * Math.cos(3 * t + ph[1]) + 0.5 * Math.cos(4 * t + ph[2]));
    const x = B.a * X * r, y = B.b * Y * r;
    pts.push([cx + x * Math.cos(B.rot) - y * Math.sin(B.rot), cy + x * Math.sin(B.rot) + y * Math.cos(B.rot)]);
  }
  return pts;
};

/** measured head: H/W 0.94, slightly pointed crown (1.75), fuller jaw (2.3), chin taper -0.12, 8 % bulge to the facing side */
export const headBlob = (seed        , a = 118, facing = 0)       => ({
  a, b: a * (0.94 + 0.08 * (rnd(seed, 1) - 0.5)),
  nTop: 1.75 + 0.3 * (rnd(seed, 2) - 0.5), nBot: 2.3 + 0.3 * (rnd(seed, 3) - 0.5),
  egg: -0.12 + 0.06 * (rnd(seed, 4) - 0.5),
  asym: (0.06 + 0.04 * rnd(seed, 5)) * (facing || (rnd(seed, 6) < 0.5 ? -1 : 1)),
  rot: rad(8 * (rnd(seed, 7) - 0.5)), noise: 0.008, seed,
});

/** thickest outline direction: away from the light, pulled toward the ground (64 deg measured for upper-left light) */
export const thickAngle = (light        ) => Math.atan2(-Math.sin(light) + 0.8, -Math.cos(light));
const DEF_LIGHT = rad(-120);

// ---------------- faces ----------------
                                                                                                                                
                                                 
                                                                                                               
                                                                                                                            
/** eyes [back, front], brows [inner, outer] offsets in u (+ = down), mouth kind */
const FACE                                                                             = {
  neutral: { eye: ["lid", "lid"], brow: [0, -1], mouth: "dash" },
  stern: { eye: ["lid", "lid"], brow: [3, -2], mouth: "frown" },
  grin: { eye: ["happy", "happy"], brow: [-3, -3], mouth: "grin" },
  laugh: { eye: ["squeeze", "squeeze"], brow: [-4, -4], mouth: "laugh" },
  whistle: { eye: ["dash", "dash"], brow: [-2, -4], mouth: "o" },
  nervous: { eye: ["small", "small"], brow: [-3, 2], mouth: "wave" },
  shock: { eye: ["shock", "shock"], brow: [-7, -6], mouth: "O" },
  relief: { eye: ["happy", "happy"], brow: [-2, 1], mouth: "smileWide" },
  relief_open: { eye: ["happy", "happy"], brow: [-2, 1], mouth: "grin" },
  dazed: { eye: ["spiral", "spiral"], brow: [-3, 2], mouth: "wave" },
  pained: { eye: ["squeeze", "lid"], brow: [-3, 2], mouth: "teeth" },
  smile: { eye: ["dot", "dot"], brow: [0, -1], mouth: "smirk" },
  smile_closed: { eye: ["happy", "happy"], brow: [0, -1], mouth: "smile" },
  lick: { eye: ["dot", "dot"], brow: [0, -1], mouth: "lick" },
};
const halfLid = (k      )       => (k === "dot" || k === "small" ? "lid" : k === "lid" ? "slit" : k === "shock" ? "shockHalf" : k);
const eyeKind = (k      , lid        )       =>
  lid >= 1 && k !== "happy" && k !== "squeeze" && k !== "spiral" ? "dash" : lid > 0 ? halfLid(k) : k;
const lidOf = (b                              ) => (b === true ? 1 : Number(b) || 0);

const eye = (p     , kind      , x        , ey        , u        , side        , look        , skin        ) => {
  const lx = x + look * 3 * u, lw = 3.8 * u;
  switch (kind) {
    case "dot": p.ell(lx, ey, 3.8 * u, 5.5 * u, INK, 0); break;
    case "small": p.ell(lx, ey, 3 * u, 4.4 * u, INK, 0); break;
    case "lid": p.ell(lx, ey - u, 7 * u, 6 * u, INK, 0, 0, 180); p.stroke([[x - 9 * u, ey - u], [x + 9 * u, ey - u]], lw); break;
    case "slit": p.ell(lx, ey, 7 * u, 2.6 * u, INK, 0, 0, 180); p.stroke([[x - 9 * u, ey], [x + 9 * u, ey]], lw); break;
    case "happy": p.arc(x, ey + 3 * u, 8 * u, 6 * u, 200, 340, lw); break;
    case "dash": p.stroke([[x - 8.5 * u, ey], [x + 8.5 * u, ey]], lw); break;
    case "squeeze": p.stroke([[x + 6 * u * side, ey - 5 * u], [x - 6 * u * side, ey], [x + 6 * u * side, ey + 5 * u]], lw); break;
    case "shock": case "shockHalf":
      p.ell(x, ey, 11 * u, 11 * u, WHITE, 2.6 * u); p.dot(lx - side * 1.5 * u, ey + 1.5 * u, 3 * u);
      if (kind === "shockHalf") { p.ell(x, ey, 11 * u, 11 * u, skin, 0, 180, 360); p.stroke([[x - 11 * u, ey], [x + 11 * u, ey]], 2.6 * u); }
      break;
    default: {
      const s       = [];
      for (let t = 1; t < 15; t++) s.push([x + Math.cos(t * 0.9) * t * 0.55 * u, ey + Math.sin(t * 0.9) * t * 0.55 * u]);
      p.stroke(s, 2.4 * u);
    }
  }
};

/** open "D" mouth with a white teeth band (+ tongue) */
const dmouth = (p     , mx        , y        , rx        , ry        , u        , tongue = false) => {
  p.ell(mx, y, rx, ry, MOUTH, 0, 0, 180);
  p.clip([[mx - rx, y], [mx + rx, y], [mx + rx, y + 3 * u], [mx - rx, y + 3 * u]], () => p.ell(mx, y, rx, ry, WHITE, 0, 0, 180));
  if (tongue) p.ell(mx + 2 * u, y + 0.62 * ry, 0.4 * rx, 0.28 * ry, TONGUE, 0);
  p.ell(mx, y, rx, ry, null, 3 * u, 0, 180);
};

const mouth = (p     , kind        , mx        , my        , u        , k = 1) => {
  const mw = 4 * u;
  switch (kind) {
    case "dash": p.stroke([[mx - 5.5 * u * k, my], [mx + 5.5 * u * k, my - 0.8 * u]], mw); break;
    case "frown": p.arc(mx, my + 3 * u, 6.5 * u * k, 3.5 * u, 200, 340, mw); break;
    case "smirk": p.arc(mx + u, my - 3 * u, 7 * u * k, 4 * u, 10, 150, mw); break;
    case "smile": p.arc(mx, my - 3 * u, 8 * u * k, 4.5 * u, 20, 160, mw); break;
    case "smileWide": p.arc(mx, my - 4 * u, 11 * u * k, 6 * u, 15, 165, mw); break;
    case "grin": dmouth(p, mx, my - u, 12 * u * k, 8 * u, u); break;
    case "laugh": dmouth(p, mx, my, 16 * u * k, 11 * u, u, true); break;
    case "o": p.ell(mx + 4 * u, my, 3.5 * u, 4 * u, MOUTH, 2.8 * u); break;
    case "O": p.ell(mx, my + 2 * u, 9 * u * k, 11 * u, MOUTH, 3.2 * u); break;
    case "wave": { const s       = []; for (let i = 0; i <= 12; i++) s.push([mx - 9 * u * k + i * 1.5 * u * k, my + 1.5 * u * Math.sin(i * 1.3)]); p.stroke(s, 3 * u); break; }
    case "teeth":
      p.poly([[mx - 12 * u * k, my - 4 * u], [mx + 12 * u * k, my - 4 * u], [mx + 11 * u * k, my + 4 * u], [mx - 11 * u * k, my + 4 * u]], WHITE, 3 * u);
      for (const j of [-1, 0, 1]) p.stroke([[mx + j * 6 * u * k, my - 4 * u], [mx + j * 6 * u * k, my + 4 * u]], 1.5 * u);
      break;
    case "lick": p.arc(mx, my - 3 * u, 8 * u * k, 4.5 * u, 20, 160, mw); p.ell(mx + 6 * u * k, my + 3 * u, 3.6 * u, 4.6 * u, TONGUE, 2.4 * u); break;
  }
};

/** face v2 (front / 3-4). u = 1 % of the head path width W. Eyes 26u apart on the centre line, brows 20u up, mouth 20u
 *  down, everything slid toward the facing side. No blush, no catchlights. */
const faceFront = (p     , cx        , cy        , W        , expr      , facing        , look        , lid        , brim         ,
  skin        , moustache         , stout = false) => {
  const u = W / 100, F = FACE[expr], fx = cx + 7 * u * facing;
  const ex = (F.eye[0] === "shock" ? 12 : 13) * u, ey = cy;
  for (const side of [-1, 1]) {
    const x = fx + side * ex;
    const kind = eyeKind(F.eye[(facing ? side === facing : side > 0) ? 1 : 0], lid);
    eye(p, kind, x, ey, u, side, look, skin);
    const [dI, dO] = F.brow, by = ey - (brim ? 17 : 20) * u;
    if (kind === "shock" || kind === "shockHalf") p.arc(x, by - 6 * u, 9 * u, 3 * u, 200, 340, 4 * u);
    else taper(p, [x - side * 8.5 * u, by + dI * u], [x + side * 8.5 * u, by + dO * u], 5 * u, 2.5 * u);
  }
  const mx = cx + 8 * u * facing, my = cy + 20 * u;
  mouth(p, F.mouth, mx, my, u);
  if (moustache) for (const s of [-1, 1])
    taper(p, [mx + s * 1.5 * u, cy + 12.5 * u], [mx + s * (stout ? 19 : 15) * u, cy + (stout ? 10.5 : 15) * u], stout ? 5.5 * u : 4.5 * u, 1.6 * u, moustache);
  if (expr === "nervous") p.ell(cx + 40 * u * (facing || 1), cy - 22 * u, 3 * u, 5 * u, "#9fd4ff", 2 * u);
};

/** profile face (facing screen-right): one eye, brow, nose tick, mouth near the front edge; no skin bump nose, no ear */
const faceSide = (p     , hx        , hy        , W        , expr      , lid        , brim         , skin        , moustache         , stout = false) => {
  const u = W / 100, F = FACE[expr], ex = hx + 27 * u, ey = hy;
  const kind = eyeKind(F.eye[1], lid);
  eye(p, kind, ex, ey, u, 1, 0.6, skin);
  const by = ey - (brim ? 17 : 20) * u, [dI, dO] = F.brow;
  if (kind === "shock" || kind === "shockHalf") p.arc(ex, by - 6 * u, 9 * u, 3 * u, 200, 340, 4 * u);
  else taper(p, [ex + 8 * u, by + dI * u], [ex - 7 * u, by - u + dO * u], 5 * u, 2.5 * u);
  p.stroke([[hx + 44 * u, hy + 4 * u], [hx + 47.5 * u, hy + 9 * u], [hx + 43 * u, hy + 10 * u]], 3 * u);
  mouth(p, F.mouth, hx + 33 * u, hy + 21 * u, u, 0.62);
  if (moustache) taper(p, [hx + 41 * u, hy + 13.5 * u], [hx + 25 * u, hy + (stout ? 11.5 : 16) * u], stout ? 5.5 * u : 4.5 * u, 1.6 * u, moustache);
  if (expr === "nervous") p.ell(hx - 30 * u, hy - 24 * u, 3 * u, 5 * u, "#9fd4ff", 2 * u);
};

// ---------------- hats ----------------
const BONNET = "#e9cf8f", BONNET_BRIM = "#d6b46a";
/** parts of a hat that sit behind the head (bonnet) */
const hatBehind = (p     , o        , H      , cx        , hc        , light        , thick        , ow        , side         ) => {
  if (o.hat !== "bonnet") return;
  const bb = blobPts(cx - (side ? 12 : 0) * (H.a / 50), hc - 0.07 * 2 * H.b, { ...H, a: H.a * 1.17, b: H.b * 1.13, asym: 0, egg: 0.04, seed: H.seed + 3 });
  p.shadedFill(bb, BONNET, mul(BONNET, SH_CLOTH), light, H.a * 1.17);
  p.inkRing(bb, ow * 0.85, thick);
};

const hatOn = (p     , o        , hp      , H      , cx        , hc        , light        , seed        , facing        , side         ) => {
  const W = 2 * H.a, HH = 2 * H.b, u = W / 100, crown = hc - H.b, ow = 0.85 * 5 * u;
  const a = H.rot + rad(4 * (rnd(seed, 20) - 0.5)); // tilt with the head, +-2 deg extra
  const R = (pts      ) => rotPts(pts, a, cx, hc);
  const sag = (yb        , wb        )       => {
    const base       = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12; base.push([cx + wb * (2 * t - 1), yb + 3 * u * (1 - (2 * t - 1) ** 2)]); }
    return base;
  };
  if (o.hat === "shako" || o.hat === "shako_tall") {
    const tall = o.hat === "shako_tall", yb = crown + 0.25 * HH, ht = (tall ? 0.66 : 0.56) * HH, wb = 46 * u, wt = 52 * u;
    const body = R([...sag(yb, wb).reverse(), [cx - wt, yb - ht], [cx + wt, yb - ht]]);
    p.shadedFill(body, "#3a3d47", "#24262d", light, wt, 0.4);
    if (tall) p.clip(body, () => p.band(R([[cx - wt - 5 * u, yb - ht + 0.07 * HH], [cx + wt + 5 * u, yb - ht + 0.07 * HH]]), "#e8c45a", 0.06 * HH, 1.5 * u));
    p.poly(body, null, ow);
    const deg = (a * 180) / Math.PI;
    if (side) {
      p.poly(R([[cx + 36 * u, yb - 1 * u], [cx + 60 * u, yb + 8 * u], [cx + 34 * u, yb + 6 * u]]), "#16171b", 2.5 * u);
      const [tx, ty] = R([[cx + 24 * u, yb - ht - 6 * u]])[0];
      p.ell(tx, ty, 7 * u, 7 * u, "#2b7a4b", 2.5 * u);
    } else {
      const [px, py] = R([[cx + 3 * u * facing, yb + 3 * u]])[0];
      p.ell(px, py, 34 * u, 0.045 * HH, "#16171b", 2.5 * u, 0, 180, deg); // peak
      const [bx, by] = R([[cx, yb - 0.45 * ht]])[0];
      p.ell(bx, by, 7 * u, 6 * u, tall ? "#e8c45a" : "#c9ccd2", 2 * u, 0, 360, deg); // badge plate
      p.arc(bx, by, 3.5 * u, 2.8 * u, 200, 500, 1.6 * u);
      const [tx, ty] = R([[cx, yb - ht - 6 * u]])[0];
      p.ell(tx, ty, 7 * u, 7 * u, "#2b7a4b", 2.5 * u); // green tuft
    }
  } else if (o.hat === "cap" || o.hat === "hair") {
    const cut = crown + (o.hat === "cap" ? 0.3 : 0.42) * HH;
    const keep = (x        , y        ) => y < cut || (side && o.hat === "hair" && x < cx - 6 * u && y < hc + 0.42 * H.b);
    // start the arc at the first kept point after a dropped one, so the kept run is contiguous and the cut closes it
    const n = hp.length, startIdx = Math.max(0, hp.findIndex(([x, y], i) => keep(x, y) && !keep(hp[(i + n - 1) % n][0], hp[(i + n - 1) % n][1])));
    const arc = [...hp.slice(startIdx), ...hp.slice(0, startIdx)].filter(([x, y]) => keep(x, y))
      .map(([x, y]) => [cx + (x - cx) * 1.03, hc + (y - hc) * 1.03]      );
    if (arc.length < 3) return;
    if (o.hat === "hair") { // scalloped lower edge
      const [x0, y0] = arc[arc.length - 1], [x1, y1] = arc[0];
      for (let i = 1; i < 6; i++) arc.push([x0 + ((x1 - x0) * i) / 6, y0 + ((y1 - y0) * i) / 6 + (i % 2 ? 4 * u : 0)]);
    }
    const col = o.hat === "cap" ? o.cap  : o.hair ;
    p.shadedFill(arc, col, mul(col, SH_FELT), light, H.a, 0.35);
    p.poly(arc, null, ow);
    if (o.hat === "hair") {
      const s = side ? -1 : facing || 1;
      p.stroke([[cx + s * 10 * u, cut - 30 * u], [cx + s * 2 * u, cut - 12 * u]], 1.2 * u);
    }
    if (o.hat === "cap") {
      const deg = (a * 180) / Math.PI;
      if (side) p.poly(R([[cx + 40 * u, cut - 2 * u], [cx + 74 * u, cut + 4 * u], [cx + 40 * u, cut + 6 * u]]), shade(col, 0.8), ow);
      else {
        const s = facing || (rnd(seed, 21) < 0.5 ? -1 : 1), [px, py] = R([[cx + s * 4 * u, cut + 1.5 * u]])[0];
        p.ell(px, py, 32 * u, 0.06 * HH, shade(col, 0.8), ow, 0, 180, deg);
      }
    }
  } else if (o.hat === "tophat") {
    const yb = crown + 0.22 * HH, ht = 0.8 * HH, wb = 0.31 * W, wt = 0.33 * W, col = "#2e2a36";
    const body = R([...sag(yb, wb).reverse(), [cx - wt, yb - ht], [cx + wt, yb - ht]]);
    p.shadedFill(body, col, mul(col, SH_FELT), light, wt, 0.4);
    p.clip(body, () => p.band(R([[cx - wt - 4 * u, yb - 0.13 * HH], [cx + wt + 4 * u, yb - 0.13 * HH]]), shade(o.jacket, 0.9), 0.14 * HH, 0.8 * u));
    p.poly(body, null, ow);
    const [bx, by] = R([[cx, yb + 1 * u]])[0];
    p.ell(bx, by, 0.45 * W, 0.05 * HH, "#1d1b22", ow, 0, 360, (a * 180) / Math.PI);
  } else if (o.hat === "bonnet") {
    const [bx, by] = R([[cx + (side ? 6 * u : 0), crown + 0.16 * HH]])[0];
    p.arc(bx, by, 0.5 * W, 0.2 * HH, 200, 340, 7 * u, BONNET_BRIM);
    p.arc(bx, by, 0.5 * W + 3.5 * u, 0.2 * HH + 3.5 * u, 200, 340, 1.2 * u);
    const cy = hc + H.b * 0.98;
    p.stroke([[cx - 14 * u, cy - 4 * u], [cx, cy + 2 * u], [cx + 14 * u, cy - 4 * u]], 2 * u, BONNET_BRIM);
  }
};

// ---------------- bodies ----------------
                                
/** held prop; for the hammer the number is the strike 0 (raised) .. 1 (struck) */
                                                                    

const BUILD                                                                        = {
  adult: { a: 118, torso: 1.1, legs: 1.4, tw: 0.8 },
  stout: { a: 118, torso: 1.15, legs: 1.32, tw: 0.92 },
  kid: { a: 112, torso: 0.85, legs: 1.0, tw: 0.72 },
};

                         
                                                                                                                                            
                                                               
                                                                                      
                                                     
  

const footStroke = (p     , a    , b    , w        , col        ) => {
  if (col !== INK) p.stroke([a, b], w + 3, INK);
  p.stroke([a, b], w, col);
};

export const bodyFront = (p     , o        , opts           ) => {
  const { phase = 0, expr = "neutral", mode = "march", look = 0, blink = false, lift = 60, prop = null, tilt = 0, headTilt = 0, wave,
    light = DEF_LIGHT, facing = 0, seed = 1 } = opts;
  const Bd = BUILD[o.build ?? "adult"], skin = o.skin ?? SKIN, two = Math.PI * 2, lid = lidOf(blink);
  const H = headBlob(seed, Bd.a, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const tall = (1 + Bd.torso + Bd.legs) * HH, sole = 975;
  // body bob 5 % (march) / 3 % (stroll) of the height, lowest at contact (phase 0 and 0.5)
  const bob = mode === "march" ? 0.025 * tall * Math.cos(2 * two * phase) : mode === "stroll" ? 0.015 * tall * Math.cos(2 * two * phase) : 0;
  const torsoBot = mode === "sit" ? sole - 0.2 * HH : sole - Bd.legs * HH + bob;
  const chin = torsoBot - Bd.torso * HH, hc = chin - H.b, crown = hc - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u;
  const legCol = mix(o.pants, INK, 0.55), armCol = mix(o.jacket, INK, 0.5), footCol = o.boots;
  const legW = 5.8 * u, footW = 7.5 * u;
  // ---- legs + feet (not rotated) ----
  p.rot = null;
  if (mode === "sit") {
    for (const side of [-1, 1]) {
      const h     = [300 + side * 15 * u, hipY], k     = [300 + side * 36 * u, hipY + 0.2 * HH], f     = [300 + side * 44 * u, sole - 8 * u];
      p.stroke(curve(h, k, f), legW, legCol);
      footStroke(p, [f[0] - side * 2 * u, f[1]], [f[0] + side * 12 * u, f[1] - 5 * u], footW, footCol);
    }
  } else if (mode === "fall") {
    const legs                 = [
      [[300 - 15 * u, hipY], [300 - 46 * u, hipY + 0.5 * HH], [300 - 70 * u, hipY + 0.72 * HH]],
      [[300 + 15 * u, hipY], [300 + 50 * u, hipY + 0.45 * HH], [300 + 76 * u, hipY + 0.22 * HH]],
    ];
    legs.forEach(([h, k, f], i) => {
      p.stroke(curve(h, k, f), legW, legCol);
      footStroke(p, f, [f[0] + (i ? 14 : -14) * u, f[1] + (i ? -6 : 4) * u], footW, footCol);
    });
  } else if (o.dress) {
    for (const side of [-1, 1]) {
      const fx = 300 + side * 12 * u, fy = sole - 4 * u;
      p.stroke([[fx, sole - 0.4 * HH], [fx + side * u, fy]], legW, legCol);
      footStroke(p, [fx - side * 3 * u, fy], [fx + side * 12 * u, fy + u], footW, footCol);
    }
  } else {
    const L = mode === "march" ? lift * 1.25 : mode === "stroll" ? lift * 0.55 : 0;
    for (const [side, ph] of [[-1, 0], [1, 0.5]]         ) {
      const up = Math.max(0, Math.sin(two * (phase + ph))) * L;
      const hx = 300 + side * 15 * u, fx = 300 + side * 22 * u, fy = sole - 4 * u - up;
      const k     = [(hx + fx) / 2 + side * (1.5 * u + up * 0.16), (hipY + fy) / 2 - up * 0.08];
      p.stroke(curve([hx, hipY], k, [fx, fy]), legW, legCol);
      footStroke(p, [fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u], footW, footCol);
    }
  }
  // ---- upper body: rotates about the hips (tilt + a small weight-shift sway on every step) ----
  const sway = mode === "march" ? 1.6 * Math.sin(two * phase) : mode === "stroll" ? 1.0 * Math.sin(two * phase) : 0;
  const A = tilt + sway;
  p.rot = A ? [rad(A), 300, hipY] : null;
  const dress = !!o.dress && mode !== "sit" && mode !== "fall";
  const T       = { a: ((Bd.tw / 2) * W) / 1.06, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.6, egg: o.build === "stout" ? 0.17 : 0.12,
    asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = 300 + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const sh = (side        )     => [tcx + side * 0.85 * T.a, chin + 0.12 * HH];
  const hang = (side        , fwd        )               => {
    const S = sh(side), ex = tcx + side * (1.12 * T.a + 4 * u);
    const hx = ex + side * 3 * u - side * 6 * u * Math.max(0, fwd) + side * 4 * u * Math.max(0, -fwd);
    return [S, [ex, S[1] + 0.48 * HH], [hx, chin + 1.04 * HH - Math.abs(fwd) * 9 * u]];
  };
  const sw = mode === "march" || mode === "stroll" ? Math.sin(two * phase) : 0;
  // rifle at the order: butt by the right hip, held by the hanging right hand, muzzle past the crown
  const R0     = [300 + 47 * u, torsoBot + 0.12 * HH], R1     = [300 + 64 * u, crown - 0.32 * HH];
  const rifle = !!o.rifle && (mode === "march" || mode === "stand" || mode === "stroll");
                                                   
  const arms        = [];
  if (mode === "sit" && !opts.armFn) for (const side of [-1, 1]) arms.push({ pts: [sh(side), [tcx + side * (1.1 * T.a + 6 * u), sh(side)[1] + 0.4 * HH], [tcx + side * (1.2 * T.a + 10 * u), torsoBot + 0.04 * HH]], front: false });
  else if (mode === "fall") for (const side of [-1, 1]) arms.push({ pts: [sh(side), [tcx + side * (1.15 * T.a + 12 * u), sh(side)[1] - 0.25 * HH], [tcx + side * (1.3 * T.a + 24 * u), sh(side)[1] - 0.68 * HH]], front: false });
  else if (opts.armFn) { opts.armFn({ sh, tcx, T, HH, u, chin, torsoBot, hang, sw, arms, crown, hc, W, hipY }); }
  else {
    arms.push({ pts: prop === "shako" ? hang(-1, 0) : hang(-1, -sw), front: false });
    if (rifle) {
      const G = lerp2(R0, R1, 0.1);
      arms.push({ pts: [sh(1), [tcx + 1.12 * T.a + 5 * u, sh(1)[1] + 0.45 * HH], G], front: false });
    } else if (wave !== undefined) {
      const S = sh(1);
      arms.push({ pts: [S, [tcx + 1.1 * T.a + 10 * u + 3 * u * wave, S[1] - 0.22 * HH], [tcx + 1.18 * T.a + 16 * u + 12 * u * wave, S[1] - 0.6 * HH]], front: false });
    } else if (prop === "icecream") {
      const S = sh(1);
      arms.push({ pts: [S, [tcx + 1.05 * T.a + 4 * u, S[1] + 0.45 * HH], [tcx + 0.5 * T.a, S[1] + 0.4 * HH]], front: true });
    } else if (Array.isArray(prop)) {
      const S = sh(1), k = clamp(prop[1], 0, 1);
      const E = lerp2([tcx + 1.1 * T.a + 10 * u, S[1] - 0.15 * HH], [tcx + 1.2 * T.a + 10 * u, S[1] + 0.3 * HH], k);
      const Hd = lerp2([tcx + 1.15 * T.a + 14 * u, S[1] - 0.55 * HH], [tcx + 1.45 * T.a + 22 * u, S[1] + 0.35 * HH], k);
      arms.push({ pts: [S, E, Hd], front: true });
    } else arms.push({ pts: hang(1, sw), front: false });
  }
  const drawArm = (a     ) => { p.stroke(curve(a.pts[0], a.pts[1], a.pts[2]), 5.2 * u, armCol); p.dot(a.pts[2][0], a.pts[2][1], 5.5 * u); };
  // behind the body: rifle, sword, arms
  if (rifle) {
    p.band([R0, R1], "#7a4b2a", 5 * u, 1.5 * u, "round");
    p.band([lerp2(R0, R1, 0.6), R1], "#8d949c", 2.4 * u, 1.2 * u, "round");
  }
  if (o.sword && mode !== "sit") {
    const s0     = [tcx - 0.75 * T.a, torsoBot - 0.2 * HH];
    p.band([s0, [s0[0] - Math.sin(rad(25)) * 0.8 * HH, s0[1] + Math.cos(rad(25)) * 0.8 * HH]], "#c9ccd2", 3 * u, 1.2 * u, "round");
  }
  if (opts.behind) opts.behind({ p, tcx, T, HH, u, chin, torsoBot, hipY, crown, hc, W, sole, sw });
  for (const a of arms) if (!a.front) drawArm(a);
  // torso / dress: shaded fill -> clothing clipped to it -> thick-thin ink ring
  if (dress) {
    const D       = { a: 0.5 * W * 0.98, b: 0.5 * ((sole - 0.35 * HH) - (chin - 0.2 * HH)), nTop: 2.0, nBot: 3.0, egg: 0.35, asym: 0.03 * facing, rot: 0, noise: 0.006, seed: seed + 9 };
    const dp = blobPts(300, sole - 0.35 * HH - D.b, D);
    p.gradFill(dp, o.dress , mul(o.dress , SH_CLOTH), light);
    p.inkRing(dp, ow, thick);
    const Sw       = { a: 0.37 * W, b: 0.3 * HH, nTop: 2.2, nBot: 2.4, egg: 0.1, asym: 0, rot: 0, noise: 0.006, seed: seed + 8 };
    const sp = blobPts(300, chin + 0.12 * HH, Sw);
    p.gradFill(sp, o.jacket, mul(o.jacket, SH_CLOTH), light);
    p.inkRing(sp, ow * 0.9, thick);
  } else {
    p.gradFill(tp, o.jacket, mul(o.jacket, SH_CLOTH), light);
    p.clip(tp, () => {
      if (o.belt) {
        for (const s of [-1, 1]) p.band([[tcx - s * 0.75 * T.a, chin - 0.05 * HH], [tcx + s * 0.8 * T.a, torsoBot - 0.1 * HH]], o.belt , 5.5 * u, 1.8 * u);
        const xc = tcx + 0.025 * T.a, yc = chin - 0.05 * HH + (torsoBot - 0.1 * HH - (chin - 0.05 * HH)) * (0.75 / 1.55);
        p.poly([[xc - 3.5 * u, yc - 3.5 * u], [xc + 3.5 * u, yc - 3.5 * u], [xc + 3.5 * u, yc + 3.5 * u], [xc - 3.5 * u, yc + 3.5 * u]], "#d9dde0", 1.5 * u);
      }
      if (o.sash) p.band([[tcx - 1.3 * T.a, torsoBot - 0.32 * HH], [tcx + 1.3 * T.a, torsoBot - 0.32 * HH]], o.sash, 0.13 * HH, 1.8 * u);
      for (let i = 0; i < 4; i++) {
        const y = chin + 0.12 * HH + i * 0.2 * HH;
        if (o.sash && Math.abs(y - (torsoBot - 0.32 * HH)) < 0.08 * HH) continue;
        p.dot(tcx + 2 * u * facing, y, 2.2 * u + 0.8 * u, INK); p.dot(tcx + 2 * u * facing, y, 2.2 * u, o.buttons ?? shade(o.jacket, 0.7));
      }
    });
    if (o.sash) { const s = facing || 1; p.poly([[tcx + s * 0.55 * T.a, torsoBot - 0.3 * HH], [tcx + s * 0.75 * T.a, torsoBot + 0.05 * HH], [tcx + s * 0.45 * T.a, torsoBot + 0.02 * HH]], o.sash, 1.6 * u); }
    p.inkRing(tp, ow, thick);
  }
  // in front of the body: hands holding props
  for (const a of arms) if (a.front) {
    drawArm(a);
    const [hx, hy] = a.pts[2];
    if (prop === "icecream") {
      p.poly([[hx - 8 * u, hy - 12 * u], [hx + 8 * u, hy - 12 * u], [hx, hy + 7 * u]], "#e0a35a", 1.8 * u);
      p.ell(hx, hy - 19 * u, 11 * u, 10 * u, "#f7c6d9", 2.2 * u);
      p.dot(hx, hy, 5.5 * u);
    } else if (Array.isArray(prop)) {
      const ang = rad(-70 + 105 * clamp(prop[1], 0, 1));
      const Rh = (pts      ) => rotPts(pts, ang, hx, hy);
      p.band(Rh([[hx, hy + 12 * u], [hx, hy - 44 * u]]), "#8a5a34", 5 * u, 1.5 * u, "round");
      p.poly(Rh([[hx - 12 * u, hy - 58 * u], [hx + 20 * u, hy - 58 * u], [hx + 20 * u, hy - 42 * u], [hx - 12 * u, hy - 42 * u]]), "#7d848c", 2.2 * u);
      p.dot(hx, hy, 5.5 * u);
    }
  }
  if (opts.front) opts.front({ p, tcx, T, HH, u, chin, torsoBot, hipY, crown, hc, W, sole, arms, tp });
  if (prop === "shako") { // carried by the left hand
    const [hx, hy] = arms[0].pts[2];
    p.poly([[hx - 14 * u, hy + 3 * u], [hx + 14 * u, hy + 3 * u], [hx + 16 * u, hy + 30 * u], [hx - 16 * u, hy + 30 * u]], "#3a3d47", 2.2 * u);
    p.ell(hx, hy + 31 * u, 3.5 * u, 3.5 * u, "#2b7a4b", 1.5 * u);
    p.dot(hx, hy, 5.5 * u);
  }
  // ---- head: rotates with the body, plus its own tilt about the chin ----
  const Ah = A + headTilt, [cpx, cpy] = rotAbout([300, chin], rad(A), [300, hipY]);
  p.rot = Ah ? [rad(Ah), 300, chin, cpx - 300, cpy - chin] : null;
  hatBehind(p, o, H, 300, hc, light, thick, ow, false);
  const hp = blobPts(300, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  hatOn(p, o, hp, H, 300, hc, light, seed, facing, false);
  if (opts.headExtra) opts.headExtra({ p, cx: 300, hc, H, W, u, crown, HH, hp, thick, ow, light });
  const brim = !!o.hat && o.hat !== "hair" && o.hat !== "bonnet" && o.hat !== "cap";
  if (!opts.back) faceFront(p, 300, hc, W, expr, facing, look, lid, brim, skin, o.moustache, o.build === "stout");
  p.rot = null;
};

                        
                                                                                                                                    
                                                                                                                         
                                                 
                                                                                                     
                          
  

/** two-bone leg, knee bending forward (+x) */
const ik = (hip    , ank    , l1        , l2        )     => {
  const dx = ank[0] - hip[0], dy = ank[1] - hip[1], d = clamp(Math.hypot(dx, dy), 1, l1 + l2 - 0.01);
  const A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), k = Math.atan2(dy, dx) - A;
  return [hip[0] + l1 * Math.cos(k), hip[1] + l1 * Math.sin(k)];
};

/** hip height of the seated kid in `swing` mode (design units); swingKid seats the torso bottom on the plank */
const SWING_HIP = 733;

/** side view facing screen-right; march footfalls land at phase 0 (near foot) and 0.5 (far foot), like the front view.
 *  The stance foot is planted: it slides back at exactly the walking speed while the hip rises and falls over it. */
export const bodySide = (p     , o        , opts          ) => {
  const { phase = 0, expr = "neutral", mode = "march", blink = false, stomp = 1, pose = 0, stride = 1, light = DEF_LIGHT, seed = 1 } = opts;
  const Bd = BUILD[o.build ?? "adult"], skin = o.skin ?? SKIN, two = Math.PI * 2, lid = lidOf(blink);
  const H       = { ...headBlob(seed, Bd.a, 1), asym: 0.12, rot: rad(3 + 3 * (rnd(seed, 7) - 0.5)) };
  const W = 2 * H.a, HH = 2 * H.b, u = W / 100, sole = 975, ankY = sole - 4 * u;
  const thick = thickAngle(light), ow = 5 * u;
  const legLen = (Bd.legs + 0.12) * HH - 4 * u, l1 = legLen / 2, l2 = legLen / 2;
  const nearCol = mix(o.pants, INK, 0.55), farCol = mix(o.pants, INK, 0.75), footCol = o.boots;
                                                        
  const legs         = [];
  let hipY = ankY - legLen * 0.995, lean = 0, nearFwd = 0;
  if (mode === "march") {
    const S = 370 * stride, liftH = Math.max(22, 40 + 70 * (stomp - 1));
    const st = (ph        ) => {
      const c = (((phase + ph) % 1) + 1) % 1;
      if (c < 0.5) { const s = c / 0.5; return { x: S / 2 - S * s, h: 0, stance: true, s }; }
      const s = (c - 0.5) / 0.5; // swing: cycloid in world space, so the foot leaves and lands at zero ground speed
      return { x: -S / 2 + S * s - (S / Math.PI) * Math.sin(2 * Math.PI * s), h: liftH * Math.sin(Math.PI * s), stance: false, s };
    };
    const nL = st(0), fL = st(0.5), stance = nL.stance ? nL : fL;
    const Leff = legLen * (1 - 0.035 * Math.sin(Math.PI * stance.s));
    hipY = ankY - Math.sqrt(Math.max(1, Leff * Leff - stance.x * stance.x));
    for (const [L, near] of [[fL, false], [nL, true]]         )
      legs.push({ ank: [300 + L.x, ankY - L.h], pitch: L.stance ? 0 : rad(35 * Math.sin(Math.PI * L.s) * (1 - 1.6 * L.s)), near });
    lean = 4 + 3 * Math.cos(2 * two * phase); // 7 deg at contact, 1 deg at passing
    nearFwd = nL.x / (S / 2);
  } else if (mode === "push") {
    hipY = ankY - 0.87 * legLen;
    legs.push({ ank: [300 - 0.5 * legLen, ankY], pitch: rad(-8), near: false }, { ank: [300 + 0.32 * legLen, ankY], pitch: 0, near: true });
    lean = 14 * pose;
  } else if (mode === "swing") {
    hipY = SWING_HIP;
    const a = rad(60 * pose);
    for (const [dx, near] of [[-6, false], [0, true]]         ) {
      const knee     = [300 + l1 * 0.98 + dx * u, hipY + 6 * u];
      legs.push({ ank: [knee[0] + l2 * Math.sin(a), knee[1] + l2 * Math.cos(a)], pitch: -a * 0.5, near });
    }
  } else {
    legs.push({ ank: [300 - 4 * u, ankY], pitch: 0, near: false }, { ank: [300 + 4 * u, ankY], pitch: 0, near: true });
  }
  const torsoBot = hipY + 0.12 * HH, chin = torsoBot - Bd.torso * HH, hc = chin - H.b, crown = hc - H.b, hip     = [300, hipY];
  p.rot = null;
  for (const L of legs) {
    const knee = mode === "swing" ? ([300 + l1 * 0.98 + (L.near ? 0 : -6 * u), hipY + 6 * u]      ) : ik(hip, L.ank, l1, l2);
    const hp0     = [300 + (L.near ? 0 : -5 * u), hipY];
    p.stroke([hp0, knee, L.ank], 5.8 * u, L.near ? nearCol : farCol);
    const c = Math.cos(L.pitch), s = Math.sin(L.pitch);
    footStroke(p, [L.ank[0] - 3 * u * c, L.ank[1] - 3 * u * s], [L.ank[0] + 13 * u * c, L.ank[1] + 13 * u * s + 0.5 * u],
      7.5 * u, L.near ? footCol : footCol === INK ? INK : shade(footCol, 0.82));
  }
  // ---- upper body leans about the hip ----
  p.rot = lean ? [rad(lean), 300, hipY] : null;
  const T       = { a: (o.build === "stout" ? 0.36 : 0.31) * W, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.5, egg: 0.1, asym: 0.06,
    rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = 300 + 2 * u, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const armCol = mix(o.jacket, INK, 0.5), farArm = mix(o.jacket, INK, 0.68);
  const S     = [tcx + 0.05 * T.a, chin + 0.14 * HH], aLen = 0.95 * HH;
  const swingArm = (ang        )               => {
    const e     = [S[0] + Math.sin(ang) * aLen * 0.5, S[1] + Math.cos(ang) * aLen * 0.5], a2 = ang + rad(16) * Math.sign(ang || 1);
    return [S, e, [e[0] + Math.sin(a2) * aLen * 0.5, e[1] + Math.cos(a2) * aLen * 0.5]];
  };
  const rifle = !!o.rifle && (mode === "march" || mode === "stand");
  const B0     = [tcx + 0.72 * T.a, chin + 0.58 * HH], B1     = [tcx - 0.95 * T.a - 22 * u, crown - 0.4 * HH];
  let near              , far                     ;
  if (mode === "swing") { near = [S, [S[0] + 12 * u, S[1] - 0.16 * HH], [300 + 6 * u, chin - 0.3 * HH]]; far = [S, [S[0] + 8 * u, S[1] - 0.18 * HH], [300 + 2 * u, chin - 0.36 * HH]]; }
  else if (mode === "push") {
    const reach = 0.55 * HH + 0.45 * HH * pose;
    let hN     = [S[0] + reach, S[1] + 0.06 * HH];
    if (opts.hand) {
      // target is in final canvas units; the arm is drawn inside the lean rotation, so undo it
      const th = -rad(lean), dx = opts.hand[0] - 300, dy = opts.hand[1] - hipY;
      const tg     = [300 + dx * Math.cos(th) - dy * Math.sin(th), hipY + dx * Math.sin(th) + dy * Math.cos(th)];
      hN = [hN[0] + (tg[0] - hN[0]) * pose, hN[1] + (tg[1] - hN[1]) * pose];
    }
    near = [S, [(S[0] + hN[0]) / 2, (S[1] + hN[1]) / 2 + 0.06 * HH], hN];
    far = [S, [(S[0] + hN[0]) / 2 - 4 * u, (S[1] + hN[1]) / 2 - 0.02 * HH], [hN[0] - 6 * u, hN[1] - 0.08 * HH]];
  } else if (rifle) { near = [S, [S[0] - 4 * u, S[1] + 0.42 * HH], B0]; far = mode === "march" ? swingArm(rad(30) * nearFwd) : swingArm(0); }
  else { near = swingArm(rad(-30) * nearFwd); far = mode === "march" ? swingArm(rad(30) * nearFwd) : null; }
  if (far) { p.stroke(curve(far[0], far[1], far[2]), 5.2 * u, farArm); p.dot(far[2][0], far[2][1], 5.5 * u); }
  p.gradFill(tp, o.jacket, mul(o.jacket, SH_CLOTH), light);
  p.clip(tp, () => {
    if (o.belt) p.band([[tcx - 0.65 * T.a, chin - 0.05 * HH], [tcx + 0.75 * T.a, torsoBot - 0.1 * HH]], o.belt , 5.5 * u, 1.8 * u);
    if (o.sash) p.band([[tcx - 1.3 * T.a, torsoBot - 0.32 * HH], [tcx + 1.3 * T.a, torsoBot - 0.32 * HH]], o.sash, 0.13 * HH, 1.8 * u);
    if (!o.dress) for (let i = 0; i < 3; i++) { const y = chin + 0.16 * HH + i * 0.24 * HH; p.dot(tcx + 0.8 * T.a, y, 3 * u, INK); p.dot(tcx + 0.8 * T.a, y, 2.2 * u, o.buttons ?? shade(o.jacket, 0.7)); }
  });
  p.inkRing(tp, ow, thick);
  if (rifle) {
    p.band([B0, B1], "#7a4b2a", 5 * u, 1.5 * u, "round");
    p.band([lerp2(B0, B1, 0.6), B1], "#8d949c", 2.4 * u, 1.2 * u, "round");
  }
  p.stroke(curve(near[0], near[1], near[2]), 5.2 * u, armCol); p.dot(near[2][0], near[2][1], 5.5 * u);
  // ---- head ----
  const hx = 300 + 4 * u;
  hatBehind(p, o, H, hx, hc, light, thick, ow, true);
  const hp = blobPts(hx, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  hatOn(p, o, hp, H, hx, hc, light, seed, 1, true);
  const brim = !!o.hat && o.hat !== "hair" && o.hat !== "bonnet" && o.hat !== "cap";
  faceSide(p, hx, hc, W, expr, lid, brim, skin, o.moustache, o.build === "stout");
  p.rot = null;
};

/** rope + seat + seated kid on a 700 x 2300 canvas; the pivot is design (350, 20); kid drawn at 0.92 scale */
export const swingKid = (p     , o        , kick        , expr      , light = DEF_LIGHT, blink         = 0) => {
  const rope = 1830, k = 1.1, HH = 2 * headBlob(5, BUILD[o.build ?? "adult"].a, 1).b;
  // two ropes from the pivot to the ends of a wide plank, the kid framed between them: a single rope behind the kid
  // ended at the cap and read as a hanging. Far rope behind the kid, near rope drawn over (clear of the face).
  const seat = rope + 18, x0 = 150, x1 = 550;
  p.line([[350, 20], [x0 + 16, seat + 4]], "#a07a4c", 10);
  p.poly(rrect(x0, seat, x1, seat + 36, 10), "#b5653f", 9);
  const g = p.g;
  g.save();
  g.translate(350 - 300 * k, rope + 18 - (SWING_HIP + 0.12 * HH) * k);
  g.scale(k, k);
  bodySide(new Pen(g), o, { expr, mode: "swing", pose: kick, light, seed: 5, blink });
  g.restore();
  p.line([[350, 20], [x1 - 16, seat + 4]], "#a07a4c", 10);
};

// ---------------- effects ----------------
export const fxNote = (p     , kind        , col = "#1f2a44") => {
  p.ell(70, 200, 46, 34, col, 8, 0, 360, -20);
  p.stroke([[110, 190], [110, 40]], 14);
  if (kind === 0) p.poly([[110, 40], [170, 70], [170, 110], [110, 82]], col, 8);
  else {
    p.ell(150, 170, 40, 30, col, 8, 0, 360, -20);
    p.stroke([[186, 160], [186, 20]], 14);
    p.poly([[110, 40], [186, 20], [186, 50], [110, 70]], col, 8);
  }
};

/** spark / impact star on a 500 x 500 canvas; t in 0..1 */
export const fxBurst = (p     , t        , col = "#fff3b0", rays = 10, r0 = 40, r1 = 230) => {
  const c = 250, e = 1 - (1 - t) ** 3;
  for (let i = 0; i < rays; i++) {
    const a = rad((i * 360) / rays + 7 * (i % 2)), ra = r0 + (r1 - r0) * e * (0.75 + 0.25 * (i % 2));
    p.poly([[c + r0 * 0.5 * Math.cos(a + 0.18), c + r0 * 0.5 * Math.sin(a + 0.18)], [c + ra * Math.cos(a), c + ra * Math.sin(a)],
      [c + r0 * 0.5 * Math.cos(a - 0.18), c + r0 * 0.5 * Math.sin(a - 0.18)]], col, Math.max(3, 8 * (1 - t)));
  }
  if (t < 0.5) p.ell(c, c, r0 * (1.4 - t), r0 * (1.4 - t), WHITE, 8);
};

/** water splash crown on an 800 x 800 canvas; t in 0..1 */
export const fxSplash = (p     , t        ) => {
  const c = 400, size = 800, rise = Math.sin(Math.min(1, t * 1.3) * Math.PI);
  const blue = "#bfe8ff", deep = "#6cc0f0";
  if (rise > 0.02) {
    const pts       = [];
    for (let i = 0; i < 19; i++) {
      const h = (i % 2 ? 260 : 130) * rise * (0.7 + 0.3 * Math.sin(i * 1.7));
      pts.push([c - 330 + (660 * i) / 18, size - 120 - h]);
    }
    p.poly([...pts, [c + 330, size - 90], [c - 330, size - 90]], blue, 10);
    p.ell(c, size - 100, 360, 46, deep, 10);
  }
  for (let i = 0; i < 8; i++) {
    const a = rad(200 + i * 18), d = 120 + 380 * t, y = size - 160 + d * Math.sin(a) + 520 * t * t, r = 26 * (1 - t) + 6;
    if (t > 0.08 && y < size - 40) p.ell(c + d * Math.cos(a), y, r, r * 1.25, blue, 7);
  }
};

/** dust puff on a 300 x 300 canvas; t in 0..1 */
export const fxPuff = (p     , t        ) => {
  for (let i = 0; i < 5; i++) {
    const a = rad(160 + i * 55), d = 40 + 70 * t, r = (34 + 20 * (i % 2)) * (1 - 0.6 * t);
    p.ell(150 + d * Math.cos(a), 180 + d * 0.45 * Math.sin(a), r, r * 0.8, `rgba(238,225,205,${(1 - t).toFixed(3)})`, 0);
  }
};

/** circling stars on a 420 x 210 canvas */
export const fxStars = (p     , t        ) => {
  for (let i = 0; i < 4; i++) {
    const a = t * Math.PI * 2 + (i * Math.PI) / 2, x = 210 + 150 * Math.cos(a), y = 110 + 40 * Math.sin(a), pts       = [];
    for (let k = 0; k < 10; k++) { const r = k % 2 ? 14 : 34, b = rad(k * 36 - 90); pts.push([x + r * Math.cos(b), y + r * Math.sin(b)]); }
    p.poly(pts, "#ffd84a", 6);
  }
};

/** three jittering strain ticks on a 300 x 300 canvas */
export const fxCreak = (p     , t        ) => {
  const j = 6 * Math.sin(t * 40);
  for (const a of [-30, 0, 30]) {
    const b = rad(a - 90);
    p.stroke([[150 + 70 * Math.cos(b) + j, 230 + 70 * Math.sin(b)], [150 + 100 * Math.cos(b) + 10 + j, 230 + 100 * Math.sin(b)],
      [150 + 130 * Math.cos(b) + j, 230 + 130 * Math.sin(b)]], 10);
  }
};

/** flat water ring (drawn top-down) on a 600 x 600 canvas; t in 0..1 */
export const fxRing = (p     , t        ) => {
  // thin light water rings (white crest, pale blue trailing rings), thinning as they spread
  const g = p.g;
  for (let k = 0; k < 3; k++) {
    const u = t - k * 0.22;
    if (u <= 0 || u >= 1) continue;
    g.beginPath(); g.ellipse(300, 300, 60 + 230 * u, 60 + 230 * u, 0, 0, Math.PI * 2);
    g.strokeStyle = k === 0 ? "#f6fcff" : "#cfe8fa"; g.lineWidth = 9 * (1 - u) + 3; g.stroke();
  }
};

/** text-free sign on a 700 x 520 canvas: "no marching in step on the bridge". A bridge (deck + arch + piers), four
 *  identical pairs of marching legs in the same stride (in step), a bold red X over all of it. */
export const fxSign = (p     ) => {
  const g = p.g, RED = "#d42f2f";
  p.poly(rrect(14, 14, 686, 506, 40), "#f6ecd2", 0);
  p.poly(rrect(14, 14, 686, 506, 40), null, 14);
  // bridge: deck, stone arch underneath, two piers
  p.poly(rrect(70, 352, 630, 384, 8), "#8a5a3a", 9);
  g.beginPath(); g.moveTo(112, 470); g.quadraticCurveTo(350, 300, 588, 470);
  g.strokeStyle = INK; g.lineWidth = 16; g.lineCap = "round"; g.stroke();
  for (const x of [88, 612]) p.poly(rrect(x - 16, 384, x + 16, 470, 4), "#8a5a3a", 9);
  // four identical soldiers' legs mid-stride: same leg forward on every one = in step
  for (const x of [150, 278, 406, 534]) {
    p.poly(rrect(x - 30, 150, x + 30, 214, 14), "#357650", 9);                  // coat hem
    p.stroke([[x - 8, 210], [x + 34, 262], [x + 46, 338]], 15, INK);           // front leg
    p.stroke([[x + 6, 210], [x - 12, 274], [x - 36, 336]], 15, INK);           // back leg
    p.poly(rrect(x + 30, 330, x + 74, 350, 9), INK, 0);                          // boots point forward
    p.poly(rrect(x - 52, 328, x - 8, 348, 9), INK, 0);
  }
  // big red X
  for (const [a, b] of [[[96, 70], [604, 452]], [[604, 70], [96, 452]]]                                          ) {
    p.stroke([a, b], 58, "#ffffff");
    p.stroke([a, b], 42, RED);
  }
};

/** soft cartoon cloud on a 600 x 300 canvas */
export const fxCloud = (p     , seed        ) => {
  const blobs                             = [[150, 190, 80], [250, 150, 105], [360, 160, 95], [450, 195, 70], [300, 210, 90]];
  for (const [x, y, r] of blobs) p.ell(x + ((seed * 37) % 20) - 10, y, r, r * 0.8, "#ffffff", 0);
  p.ell(300, 235, 230, 40, "#ffffff", 0);
};

/** cast shadow on a 128 x 256 canvas: dark soft contact pool at the feet (y 205) and a softer tail that runs up the
 *  canvas = away from the sun, fading with distance; multiply colour (sRGB-encoded linear ratio), white = no change */
export const fxShadow = (p     , col        ) => {
  const g = p.g;
  g.fillStyle = WHITE; g.fillRect(0, 0, 128, 256);
  g.save(); g.filter = "blur(9px)";
  const lg = g.createLinearGradient(0, 205, 0, 22);
  lg.addColorStop(0, mix(col, WHITE, 0.08)); lg.addColorStop(0.55, mix(col, WHITE, 0.3)); lg.addColorStop(1, mix(col, WHITE, 0.85));
  g.fillStyle = lg;
  g.beginPath(); g.moveTo(40, 205); g.bezierCurveTo(36, 120, 46, 50, 64, 30); g.bezierCurveTo(82, 50, 92, 120, 88, 205); g.closePath(); g.fill();
  g.fillStyle = col; g.beginPath(); g.ellipse(64, 205, 30, 17, 0, 0, Math.PI * 2); g.fill();
  g.restore();
};

/** tight contact shadow right under the feet on a 128 x 128 canvas: dark core, short fall-off (multiply colour) */
export const fxContact = (p     , col        ) => {
  const g = p.g;
  g.fillStyle = WHITE; g.fillRect(0, 0, 128, 128);
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [r, k] of [[0, 0], [0.32, 0.02], [0.5, 0.22], [0.66, 0.58], [0.82, 0.88], [1, 1]]         ) gr.addColorStop(r, mix(col, WHITE, k));
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
};

/** floating wooden plank, side-on, on a 320 x 110 canvas */
export const fxPlank = (p     ) => {
  p.poly(rrect(14, 30, 306, 78, 10), "#a8744a", 9);
  p.line([[40, 46], [150, 44], [270, 50]], "#7d5234", 4);
  p.line([[60, 62], [200, 64], [284, 60]], "#7d5234", 4);
  p.dot(36, 54, 5, INK); p.dot(284, 54, 5, INK);
};

/** floating marching drum (no text) on a 260 x 240 canvas: white shell, red hoops, ink zig-zag cord */
export const fxDrum = (p     ) => {
  p.poly(rrect(40, 70, 220, 190, 16), "#f1ece0", 9);
  p.poly(rrect(32, 58, 228, 86, 12), "#c9373a", 8);
  p.poly(rrect(32, 176, 228, 204, 12), "#c9373a", 8);
  p.line([[52, 88], [82, 172], [112, 88], [142, 172], [172, 88], [202, 172]], INK, 6);
  p.ell(130, 58, 98, 18, "#f7f3ea", 8);
};

/** soft ground contact blob on a 128 x 128 canvas, multiply colour (sRGB-encoded linear ratio) in the centre */
export const fxBlob = (p     , col        ) => {
  const g = p.g;
  g.fillStyle = WHITE; g.fillRect(0, 0, 128, 128);
  // soft contact shadow: flat core, then a long smooth (roughly gaussian) fall-off to white = no change
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [r, k] of [[0, 0], [0.5, 0.04], [0.64, 0.18], [0.76, 0.42], [0.87, 0.72], [0.95, 0.92], [1, 1]]         ) gr.addColorStop(r, mix(col, WHITE, k));
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
};
FACE.snore = { eye: ["dash", "dash"], brow: [0, -1], mouth: "o" };
FACE.stubborn = { eye: ["lid", "lid"], brow: [4, -3], mouth: "frown" };
FACE.squint = { eye: ["slit", "slit"], brow: [3, -2], mouth: "dash" };

// ---------------- Roman-era cast (our own designs), built on the Pen / blob / face helpers above ----------------
const STEEL = "#aeb6bf", BRASS = "#d9a845", LEATHER = "#7a4a2a";
export const OUTFITS = {
  legion: { tunic: "#b8322f", cape: "#8f2228", skin: SKIN, helmet: true, armor: true, spear: true, shield: true },
  old: { tunic: "#9c4a3c", cape: "#6e3330", skin: "#f3d6bb", helmet: "old", armor: true, spear: true, shield: false, beard: "#f4f1ea", brows: "#f4f1ea" },
  toga: { tunic: "#f1ead8", skin: "#f5c9a0", toga: "#6b3c8f", hair: "#3b2a20", stout: true },
  civA: { tunic: "#4f7fb8", skin: "#f5c9a0", hair: "#5a3b2a" },
  civB: { tunic: "#d9a441", skin: SKIN, hair: "#2b211c", dress: "#c25a7a" },
  civC: { tunic: "#5d8a3a", skin: "#c99067", hair: "#1e1714", stout: true },
  workA: { tunic: "#8a5d3b", skin: "#f5c9a0", cap: "#c2733a", apron: "#d8c9a6" },
  workB: { tunic: "#3f6a6f", skin: "#ecd0b6", cap: "#5b4a8a", moustache: "#4a3020" },
};

/** galea: iron bowl, brass brow band, cheek guards, transverse red crest */
const galea = (p, H, cx, hc, light, thick, ow, old, u) => {
  const crest = old ? "#8d4b3f" : "#d2372f", bowl = old ? "#8f8a7e" : STEEL;
  // crest (behind the bowl top)
  const cy0 = hc - H.b * 0.98;
  const cr = ellPts(cx, cy0, 0.66 * 2 * H.a, 0.42 * 2 * H.b, 180, 360, 0, 40);
  cr.push([cx + 0.66 * 2 * H.a * 0.98, cy0 + 4 * u], [cx - 0.66 * 2 * H.a * 0.98, cy0 + 4 * u]);
  const crP = [...ellPts(cx, cy0 + 2 * u, 0.62 * 2 * H.a, 0.36 * 2 * H.b, 180, 360, 0, 40)];
  p.shadedFill(crP, crest, mul(crest, [0.7, 0.62, 0.7]), light, 0.62 * 2 * H.a, 0.3);
  p.clip(crP, () => { for (let i = -9; i <= 9; i++) p.stroke([[cx + i * 7.4 * u, cy0], [cx + i * 9.4 * u, cy0 - 0.62 * H.b * Math.cos(i / 11)]], 1.4 * u, mul(crest, [0.62, 0.55, 0.62])); });
  if (old) p.clip(crP, () => { for (let i = 0; i < 6; i++) p.ell(cx + (i - 3) * 22 * u, cy0 - 18 * u - (i % 2) * 10 * u, 9 * u, 5 * u, "#6f6a5e", 0); });
  p.inkRing(crP, ow * 0.85, thick);
  p.poly(rrect(cx - 10 * u, cy0 - 6 * u, cx + 10 * u, cy0 + 6 * u, 3 * u), BRASS, 2 * u);
  // bowl: upper head cap
  const bandY = hc - H.b * 0.42;
  const bp = ellPts(cx, bandY, H.a * 1.05, H.b * 0.66, 180, 360, 0, 48);
  p.shadedFill(bp, bowl, mul(bowl, [0.62, 0.64, 0.72]), light, H.a, 0.4);
  p.clip(bp, () => {
    p.stroke(ellPts(cx - 20 * u, bandY - 0.3 * H.b, 0.25 * H.a, 0.18 * H.b, 200, 300, 0, 16), 4 * u, "#ffffff55");
    if (old) for (let i = 0; i < 9; i++) p.ell(cx + Math.sin(i * 2.3) * 0.8 * H.a, bandY - (0.08 + 0.5 * ((i * 0.37) % 1)) * H.b, (3 + (i % 3) * 2) * u, (2 + (i % 2)) * u, "#8a4b22", 0);
  });
  p.inkRing(bp, ow * 0.9, thick);
  p.band([[cx - H.a * 1.04, bandY], [cx + H.a * 1.04, bandY]], old ? "#a88a4a" : BRASS, 7 * u, 1.8 * u, "round");
  for (const s of [-1, 1]) p.dot(cx + s * 0.55 * H.a, bandY, 2.2 * u, "#fff3c4");
};
const cheeks = (p, H, cx, hc, light, ow, old, u) => {
  const bowl = old ? "#8f8a7e" : STEEL;
  for (const s of [-1, 1]) {
    const x0 = cx + s * 0.78 * H.a, x1 = cx + s * 1.07 * H.a, y0 = hc - H.b * 0.42, y1 = hc + H.b * 0.48;
    const pts = [[x0, y0], [x1, y0], [x1 - s * 0.04 * H.a, y1 - 0.1 * H.b], [x0 + s * 0.06 * H.a, y1], [x0 - s * 0.05 * H.a, (y0 + y1) / 2]];
    p.shadedFill(pts, bowl, mul(bowl, [0.62, 0.64, 0.72]), light, 0.2 * H.a, 0.3);
    p.poly(pts, null, ow * 0.8);
    p.dot((x0 + x1) / 2, (y0 + y1) / 2 - 0.05 * H.b, 2.2 * u, BRASS);
  }
};
const cobweb = (p, cx, cy, r, u) => {
  const g = p.g; g.save(); g.globalAlpha = 0.8;
  for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.05 + 0.9 * i / 6); p.stroke([[cx, cy], [cx + Math.cos(a) * r, cy + Math.sin(a) * r]], 1.1 * u, "#f2f2f2"); }
  for (let k = 1; k <= 4; k++) { const rr = r * k / 4.3, pts = []; for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.05 + 0.9 * i / 6); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } p.stroke(pts, 1 * u, "#f2f2f2"); }
  g.restore();
};

/** front-facing Roman-era character. opts: expr, blink, look, facing, seed, L/R arm poses, tilt, headTilt, bob, nohelmet, light */
export const romanFront = (p, key, opts = {}) => {
  const O = typeof key === "string" ? OUTFITS[key] : key;
  const { expr = "neutral", blink = 0, look = 0, facing = 0, seed = 3, L = "hang", R = O.spear ? "spear" : "hang", tilt = 0, headTilt = 0,
    bob = 0, nohelmet = false, light = rad(-120), web = false, step = 0 } = opts;
  const lid = lidOf(blink), skin = O.skin ?? SKIN;
  const H = headBlob(seed, 118, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const torsoL = O.stout ? 1.12 : 1.08, legsL = 1.38, sole = 975;
  const torsoBot = sole - legsL * HH - bob * HH, chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u, cx = 300;
  const legCol = mix(O.tunic, INK, 0.62), armCol = mix(O.tunic, INK, 0.5);
  const helmet = !!O.helmet && !nohelmet, old = O.helmet === "old";
  p.rot = null;
  // ---- cape behind everything ----
  if (O.cape) {
    const cp = [[cx - 0.48 * W, chin + 0.08 * HH], [cx + 0.48 * W, chin + 0.08 * HH], [cx + 0.62 * W, sole - 0.55 * HH], [cx + 0.2 * W, sole - 0.45 * HH], [cx - 0.2 * W, sole - 0.5 * HH], [cx - 0.62 * W, sole - 0.55 * HH]];
    p.gradFill(cp, O.cape, mul(O.cape, [0.6, 0.6, 0.7]), light); p.inkRing(cp, ow * 0.8, thick);
  }
  // ---- legs ----
  const dress = !!O.dress;
  for (const side of [-1, 1]) {
    const up = Math.max(0, Math.sin(Math.PI * 2 * (step + (side > 0 ? 0.5 : 0)))) * 30 * (step ? 1 : 0);
    const hx = cx + side * 16 * u, fx = cx + side * 22 * u, fy = sole - 4 * u - up;
    p.stroke(curve([hx, hipY], [(hx + fx) / 2 + side * 2 * u, (hipY + fy) / 2], [fx, fy]), 5.8 * u, legCol);
    const sandal = O.helmet ? LEATHER : "#5a3b2a";
    p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.5 * u + 3, INK);
    p.stroke([[fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u]], 7.5 * u, sandal);
    if (O.helmet) for (let k = 1; k <= 3; k++) p.stroke([[fx - 4 * u, fy - k * 0.07 * HH], [fx + 4 * u, fy - k * 0.07 * HH - 2 * u]], 2 * u, LEATHER);
  }
  // ---- upper body ----
  p.rot = tilt ? [rad(tilt), cx, hipY] : null;
  const T = { a: (0.4 * W) / 1.06 * (O.stout ? 1.12 : 1), b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.6, egg: O.stout ? 0.17 : 0.12, asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = cx + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const S = (side) => [tcx + side * 0.85 * T.a, chin + 0.12 * HH];
  const arm = (side, pose) => {
    const s = S(side), X = (k) => tcx + side * (T.a * 1.1 + k * u);
    switch (pose) {
      case "spear": return { pts: [s, [X(6), s[1] + 0.42 * HH], [X(10), s[1] + 0.2 * HH]], front: false };
      case "point": return { pts: [s, [X(28), s[1] - 0.02 * HH], [X(62), s[1] - 0.1 * HH]], front: false, finger: true };
      case "up": return { pts: [s, [X(14), s[1] - 0.3 * HH], [X(22), s[1] - 0.75 * HH]], front: false };
      case "wave": return { pts: [s, [X(16), s[1] - 0.2 * HH], [X(30 + 10 * Math.sin(opts.wv || 0)), s[1] - 0.62 * HH]], front: false };
      case "hip": return { pts: [s, [X(22), s[1] + 0.3 * HH], [tcx + side * T.a * 0.95, torsoBot - 0.3 * HH]], front: false };
      case "belly": return { pts: [s, [X(8), s[1] + 0.45 * HH], [tcx + side * 0.25 * T.a, torsoBot - 0.35 * HH]], front: true };
      case "temple": return { pts: [s, [X(26), s[1] + 0.05 * HH], [cx + side * (H.a + 16 * u), hc - 0.1 * HH]], front: false, swirl: true };
      case "lift": return { pts: [s, [X(20), s[1] - 0.25 * HH], [X(4), s[1] - 0.82 * HH]], front: false };
      case "shield": return { pts: [s, [X(4), s[1] + 0.4 * HH], [tcx + side * 0.6 * T.a, torsoBot - 0.1 * HH]], front: true };
      case "cross": return { pts: [s, [X(2), s[1] + 0.38 * HH], [tcx - side * 0.45 * T.a, s[1] + 0.32 * HH]], front: true };
      case "reach": { const lf = (opts.lift || 0) * 0.62 * HH; return { pts: [s, [X(42), s[1] - 0.12 * HH - lf * 0.6], [X(82), s[1] - 0.5 * HH - lf]], front: false }; }
      case "cheek": return { pts: [s, [X(16), s[1] + 0.05 * HH], [cx + side * (H.a + 2 * u), hc + 0.25 * H.b]], front: false };
      case "thumb": return { pts: [s, [X(20), s[1] + 0.12 * HH], [X(44), s[1] - 0.12 * HH]], front: false, thumb: true };
      default: return { pts: [s, [X(4), s[1] + 0.48 * HH], [X(3), chin + 1.04 * HH]], front: false };
    }
  };
  const arms = [arm(-1, L), arm(1, R)];
  const drawArm = (a) => {
    p.stroke(curve(a.pts[0], a.pts[1], a.pts[2]), 5.2 * u, armCol);
    const [hx, hy] = a.pts[2];
    p.dot(hx, hy, 5.5 * u);
    if (a.finger) { const dx = a.pts[2][0] - a.pts[1][0], dy = a.pts[2][1] - a.pts[1][1], l = Math.hypot(dx, dy); p.stroke([[hx, hy], [hx + dx / l * 14 * u, hy + dy / l * 14 * u]], 2.6 * u); }
    if (a.thumb) p.stroke([[hx, hy], [hx + Math.sign(hx - cx) * 6 * u, hy - 12 * u]], 2.6 * u);
  };
  // spear behind
  if (O.spear && R === "spear") {
    const [hx, hy] = arms[1].pts[2], s0 = [hx + 2 * u, sole - 2 * u], s1 = [hx - 3 * u, 70];
    p.band([s0, s1], old ? "#6d5236" : "#8a5a34", 4.2 * u, 1.4 * u, "round");
    const tip = [[s1[0] - 7 * u, s1[1] + 6 * u], [s1[0], s1[1] - 34 * u], [s1[0] + 7 * u, s1[1] + 6 * u], [s1[0], s1[1] + 14 * u]];
    p.poly(tip, old ? "#8b7c6a" : "#c9cfd6", 2 * u);
    if (web) cobweb(p, s1[0] - 2 * u, s1[1] + 60 * u, 70 * u, u);
  }
  for (const a of arms) if (!a.front) drawArm(a);
  // torso
  if (dress) {
    const D = { a: 0.5 * W * 0.98, b: 0.5 * ((sole - 0.35 * HH) - (chin - 0.2 * HH)), nTop: 2.0, nBot: 3.0, egg: 0.35, asym: 0, rot: 0, noise: 0.006, seed: seed + 9 };
    const dp = blobPts(cx, sole - 0.35 * HH - D.b, D);
    p.gradFill(dp, O.dress, mul(O.dress, SH_CLOTH), light); p.inkRing(dp, ow, thick);
  }
  // skirt / pteruges below the torso
  if (!dress) {
    const sk = [[tcx - 0.92 * T.a, torsoBot - 0.2 * HH], [tcx + 0.92 * T.a, torsoBot - 0.2 * HH], [tcx + 1.0 * T.a, torsoBot + 0.3 * HH], [tcx - 1.0 * T.a, torsoBot + 0.3 * HH]];
    p.gradFill(sk, O.tunic, mul(O.tunic, SH_CLOTH), light); p.poly(sk, null, ow * 0.8);
    if (O.armor) for (let i = -3; i <= 3; i++) { const x = tcx + i * 0.27 * T.a, st = [[x - 9 * u, torsoBot - 0.05 * HH], [x + 9 * u, torsoBot - 0.05 * HH], [x + 9 * u, torsoBot + 0.22 * HH], [x - 9 * u, torsoBot + 0.22 * HH]]; p.poly(st, old ? "#5e4632" : LEATHER, 1.6 * u); }
  }
  p.gradFill(tp, O.tunic, mul(O.tunic, SH_CLOTH), light);
  p.clip(tp, () => {
    if (O.armor) {
      const top = chin - 0.1 * HH, bot = torsoBot - 0.25 * HH, n = 5;
      for (let i = 0; i < n; i++) {
        const y0 = top + (bot - top) * i / n, y1 = top + (bot - top) * (i + 1) / n;
        const c = old ? (i % 2 ? "#8d8679" : "#9a9384") : (i % 2 ? "#a7b0ba" : "#bcc4cc");
        p.poly([[tcx - 1.5 * T.a, y0], [tcx + 1.5 * T.a, y0 + 3 * u], [tcx + 1.5 * T.a, y1 + 3 * u], [tcx - 1.5 * T.a, y1]], c, 1.8 * u);
      }
      p.band([[tcx - 1.4 * T.a, torsoBot - 0.2 * HH], [tcx + 1.4 * T.a, torsoBot - 0.2 * HH]], LEATHER, 0.08 * HH, 1.5 * u);
      for (let i = -2; i <= 2; i++) p.dot(tcx + i * 0.3 * T.a, torsoBot - 0.2 * HH, 2.4 * u, BRASS);
      if (old) for (let i = 0; i < 5; i++) p.ell(tcx + Math.sin(i * 1.7) * 0.7 * T.a, top + (bot - top) * ((i * 0.31) % 1), 6 * u, 3 * u, "#8a4b22", 0);
    } else {
      p.band([[tcx - 1.4 * T.a, torsoBot - 0.24 * HH], [tcx + 1.4 * T.a, torsoBot - 0.24 * HH]], O.apron ? "#5a3b2a" : "#e2c27a", 0.05 * HH, 1.2 * u);
      if (O.toga) p.band([[tcx - 1.0 * T.a, chin - 0.1 * HH], [tcx + 1.1 * T.a, torsoBot - 0.1 * HH]], O.toga, 0.16 * HH, 1.6 * u);
      if (O.apron) p.poly([[tcx - 0.55 * T.a, torsoBot - 0.2 * HH], [tcx + 0.55 * T.a, torsoBot - 0.2 * HH], [tcx + 0.6 * T.a, torsoBot + 0.2 * HH], [tcx - 0.6 * T.a, torsoBot + 0.2 * HH]], O.apron, 1.6 * u);
      p.stroke([[tcx - 0.2 * T.a, chin + 0.02 * HH], [tcx, chin + 0.16 * HH], [tcx + 0.2 * T.a, chin + 0.02 * HH]], 2 * u);
    }
  });
  p.inkRing(tp, ow, thick);
  if (O.armor) for (const s of [-1, 1]) { // shoulder plates
    const sp = ellPts(tcx + s * 0.72 * T.a, chin + 0.1 * HH, 0.42 * T.a, 0.13 * HH, 180, 360, s * 8, 20);
    p.poly(sp, old ? "#9a9384" : "#c5ccd3", 1.8 * u);
  }
  if (O.moss) {/* reserved */}
  for (const a of arms) if (a.front) drawArm(a);
  // shield in front, held by the left hand
  if (O.shield && L === "shield") {
    const sx = tcx - 0.55 * T.a, sy = torsoBot + 0.05 * HH, sw = 0.36 * W, sh = 0.78 * HH;
    const sp = rrect(sx - sw, sy - sh, sx + sw, sy + sh, 8 * u);
    p.gradFill(sp, "#c0302c", "#7d1d22", light);
    p.clip(sp, () => {
      p.band([[sx - sw, sy], [sx + sw, sy]], BRASS, 6 * u, 1.2 * u);
      p.band([[sx, sy - sh], [sx, sy + sh]], BRASS, 6 * u, 1.2 * u);
      for (const s of [-1, 1]) { p.stroke([[sx + s * 12 * u, sy - 14 * u], [sx + s * 34 * u, sy - 46 * u], [sx + s * 22 * u, sy - 44 * u], [sx + s * 46 * u, sy - 74 * u]], 3.5 * u, BRASS); p.stroke([[sx + s * 12 * u, sy + 14 * u], [sx + s * 34 * u, sy + 46 * u], [sx + s * 22 * u, sy + 44 * u], [sx + s * 46 * u, sy + 74 * u]], 3.5 * u, BRASS); }
      p.stroke(ellPts(sx - sw * 0.5, sy - sh * 0.7, sw * 0.3, sh * 0.1, 200, 320, 0, 10), 3 * u, "#ffffff44");
    });
    p.ell(sx, sy, 13 * u, 13 * u, "#e6c068", 2.2 * u);
    p.inkRing(sp, ow, thick);
  }
  // ---- head ----
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt), [cx, hipY]);
  const Ah = tilt + headTilt;
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;
  if (helmet) galea(p, H, cx, hc, light, thick, ow, old, u);
  const hp = blobPts(cx, hc, H);
  if (O.hair && !helmet) { const hb = blobPts(cx, hc - 0.03 * HH, { ...H, a: H.a * 1.04, b: H.b * 1.05 }); p.poly(hb, O.hair, 0); }
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  if (helmet) {
    const bandY = hc - H.b * 0.42, bp = ellPts(cx, bandY, H.a * 1.05, H.b * 0.66, 180, 360, 0, 48);
    p.shadedFill(bp, old ? "#8f8a7e" : STEEL, mul(old ? "#8f8a7e" : STEEL, [0.62, 0.64, 0.72]), light, H.a, 0.4);
    p.clip(bp, () => { p.stroke(ellPts(cx - 20 * u, bandY - 0.3 * H.b, 0.25 * H.a, 0.18 * H.b, 200, 300, 0, 16), 5 * u, "#ffffff66");
      if (old) for (let i = 0; i < 9; i++) p.ell(cx + Math.sin(i * 2.3) * 0.8 * H.a, bandY - (0.08 + 0.5 * ((i * 0.37) % 1)) * H.b, (4 + (i % 3) * 2) * u, (2.5 + (i % 2)) * u, "#8a4b22", 0); });
    p.poly(bp, null, ow * 0.9);
    p.band([[cx - H.a * 1.05, bandY], [cx + H.a * 1.05, bandY]], old ? "#a88a4a" : BRASS, 7 * u, 1.8 * u, "round");
    p.poly(rrect(cx - 4 * u, bandY - 0.55 * H.b, cx + 4 * u, bandY - 3 * u, 2 * u), old ? "#a88a4a" : BRASS, 1.5 * u);
    cheeks(p, H, cx, hc, light, ow, old, u);
  } else if (O.cap) hatOn(p, { hat: "cap", cap: O.cap, jacket: O.tunic }, hp, H, cx, hc, light, seed, facing, false);
  else if (O.hair) hatOn(p, { hat: "hair", hair: O.hair, jacket: O.tunic }, hp, H, cx, hc, light, seed, facing, false);
  else if (O.helmet && nohelmet) { // bald old head with white side tufts
    for (const s of [-1, 1]) p.ell(cx + s * 0.9 * H.a, hc - 0.1 * H.b, 0.22 * H.a, 0.3 * H.b, "#f4f1ea", 3 * u);
  }
  if (O.beard) {
    const bd = blobPts(cx + 6 * u * facing, hc + 0.85 * H.b, { a: 0.62 * H.a, b: 0.75 * H.b, nTop: 2.4, nBot: 1.6, egg: -0.35, asym: 0, rot: 0, noise: 0.02, seed: seed + 4 });
    p.shadedFill(bd, O.beard, mul(O.beard, [0.86, 0.86, 0.92]), light, 0.6 * H.a, 0.3);
    p.clip(bd, () => { for (let i = -3; i <= 3; i++) p.stroke([[cx + i * 9 * u, hc + 0.45 * H.b], [cx + i * 7 * u, hc + 1.35 * H.b]], 1.2 * u, "#c9c4bb"); });
    p.inkRing(bd, ow * 0.8, thick);
  }
  faceFront(p, cx, hc, W, expr, facing, look, lid, helmet, skin, O.beard ? O.beard : O.moustache, !!O.stout);
  if (O.brows) for (const s of [-1, 1]) p.ell(cx + 7 * u * facing + s * 14 * u, hc - 20 * u, 11 * u, 5 * u, O.brows, 2 * u);
  if (O.beard) { // re-draw the mouth over the beard for open mouths
    if (expr === "shock" || expr === "snore") p.ell(cx + 8 * u * facing, hc + 22 * u, 6 * u, 7 * u, "#5a1e28", 2 * u);
  }
  p.rot = null;
  if (arms.some((a) => a.swirl)) { // cuckoo swirl next to the temple
    const a = arms.find((x) => x.swirl), [hx, hy] = a.pts[2], ph = opts.swirl || 0, pts = [];
    for (let i = 0; i < 40; i++) { const t = i / 40 * Math.PI * 4 + ph, r = (4 + i * 0.7) * u; pts.push([hx + Math.cos(t) * r, hy - 40 * u + Math.sin(t) * r]); }
    p.stroke(pts, 3 * u, "#ffffff"); p.stroke(pts, 1.4 * u, INK);
  }
};

/** loose helmet prop card (lifted off the old soldier) */
export const helmetCard = (p) => {
  const H = headBlob(3, 118, 0), u = 2 * H.a / 100, hc = 560, light = rad(-120), thick = thickAngle(light), ow = 5 * u;
  galea(p, H, 300, hc, light, thick, ow, true, u);
  const bandY = hc - H.b * 0.42, bp = ellPts(300, bandY, H.a * 1.05, H.b * 0.66, 180, 360, 0, 48);
  // dark inside visible from below
  p.ell(300, bandY, H.a * 1.05, 0.12 * H.b, "#2a221e", 0);
  p.shadedFill(bp, "#8f8a7e", mul("#8f8a7e", [0.62, 0.64, 0.72]), light, H.a, 0.4);
  p.clip(bp, () => { for (let i = 0; i < 9; i++) p.ell(300 + Math.sin(i * 2.3) * 0.8 * H.a, bandY - (0.08 + 0.5 * ((i * 0.37) % 1)) * H.b, (4 + (i % 3) * 2) * u, (2.5 + (i % 2)) * u, "#8a4b22", 0); });
  p.poly(bp, null, ow * 0.9);
  p.band([[300 - H.a * 1.05, bandY], [300 + H.a * 1.05, bandY]], "#a88a4a", 7 * u, 1.8 * u, "round");
  cheeks(p, H, 300, hc, light, ow, true, u);
};

/** ZZZ for the sleeping guard */
export const fxZ = (p, t) => {
  const g = p.g; g.save(); g.font = "900 120px Arial Black, Arial"; g.lineJoin = "round";
  for (let i = 0; i < 3; i++) {
    const k = (t + i / 3) % 1, x = 220 + i * 70 + Math.sin(k * 6) * 20, y = 700 - k * 500, s = 0.5 + k * 0.7;
    g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha = Math.min(1, (1 - k) * 2.5);
    g.lineWidth = 16; g.strokeStyle = INK; g.strokeText("Z", 0, 0); g.fillStyle = "#ffffff"; g.fillText("Z", 0, 0); g.restore();
  }
  g.restore();
};
/** falling leaf */
export const fxLeaf = (p, col) => { p.poly([[300, 380], [420, 470], [300, 620], [180, 470]], col, 14); p.stroke([[300, 400], [300, 600]], 8); };
/** dust cloud puff (k 0..1 growth) */
export const fxDust = (p, k, col = "#e8dcc4") => {
  const g = p.g; g.save(); g.globalAlpha = Math.max(0, 1 - k * k);
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, r = 90 + 150 * k; p.ell(300 + Math.cos(a) * r, 520 + Math.sin(a) * r * 0.6, 120 + 60 * k, 100 + 50 * k, col, 12); }
  p.ell(300, 520, 170 + 110 * k, 140 + 80 * k, col, 0);
  g.restore();
};
export const fxDrip = (p) => p.ell(300, 500, 40, 64, "#9fd4ff", 10);
export const fxWood = (p, seed) => { p.poly([[200, 420], [400, 400], [420, 560], [230, 600]], "#5b3d22", 14); p.stroke([[240, 450], [380, 440]], 6, "#3a2614"); p.ell(330, 520, 26, 18, "#4d7a32", 0); };

export const headCenter = (seed = 3) => { const H = headBlob(seed, 118, 0), HH = 2 * H.b; return 975 - 1.38 * HH - 1.08 * HH - H.b; };
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
// ================= "The Curious Manche" channel mascot (profile photo + intro host). Needs tools/patch_toon.py hooks. Draw with drawManche(p, {outfit:{jacket}, topi}); drawQ(p,x,y,size,col) = toon question mark. =================
// ================= "The Curious Manche" mascot =================
export const MANCHE = { jacket: "#24408E", pants: "#2b2b38", boots: "#3a2a22", skin: "#F0C49C", hat: null, hair: "#1f1816" };
const curiousFace = (p, c) => {
  const { cx, hc, W, u } = c;
  // blush
  p.ell(cx - 0.3 * W, hc + 0.13 * W, 0.07 * W, 0.04 * W, "rgba(235,120,110,0.45)", 0);
  p.ell(cx + 0.3 * W, hc + 0.13 * W, 0.07 * W, 0.04 * W, "rgba(235,120,110,0.45)", 0);
  // short hair peeking out under the topi
  p.poly([[cx - 0.47 * W, hc - 0.2 * W], [cx - 0.36 * W, hc - 0.36 * W], [cx - 0.1 * W, hc - 0.4 * W], [cx - 0.2 * W, hc - 0.3 * W], [cx - 0.42 * W, hc - 0.05 * W]], "#1f1816", 0);
  p.poly([[cx + 0.47 * W, hc - 0.2 * W], [cx + 0.36 * W, hc - 0.36 * W], [cx + 0.12 * W, hc - 0.4 * W], [cx + 0.24 * W, hc - 0.32 * W], [cx + 0.43 * W, hc - 0.06 * W]], "#1f1816", 0);
  // eyes: big, looking up-right
  for (const s of [-1, 1]) {
    const ex = cx + s * 0.19 * W, ey = hc + 0.02 * W, r = s > 0 ? 0.098 : 0.088;
    p.ell(ex, ey, r * W, (r + 0.016) * W, "#ffffff", 3.2 * u);
    p.ell(ex + 0.03 * W, ey - 0.032 * W, 0.048 * W, 0.054 * W, "#1b1420", 0);
    p.ell(ex + 0.045 * W, ey - 0.05 * W, 0.016 * W, 0.016 * W, "#ffffff", 0);
  }
  // brows: left lowered & tilted, right raised high (the curious look)
  p.band([[cx - 0.31 * W, hc - 0.09 * W], [cx - 0.1 * W, hc - 0.11 * W]], "#1f1816", 10 * u, 0, "round");
  p.band([[cx + 0.07 * W, hc - 0.15 * W], [cx + 0.19 * W, hc - 0.24 * W], [cx + 0.32 * W, hc - 0.2 * W]], "#1f1816", 10 * u, 0, "round");
  // mouth: small "o", slightly off-centre
  p.ell(cx + 0.05 * W, hc + 0.23 * W, 0.045 * W, 0.055 * W, "#8a2a35", 3 * u);
  p.ell(cx + 0.05 * W, hc + 0.255 * W, 0.025 * W, 0.018 * W, "#e8707a", 0);
};
const topiM = (p, c, base = "#7a2f52") => {
  const { cx, crown, HH, u } = c, yb = crown + 0.2 * HH, ht = 0.3 * HH;
  const pts = [[cx - 48 * u, yb], [cx + 48 * u, yb + 2 * u], [cx + 42 * u, yb - ht * 0.75], [cx - 38 * u, yb - ht]];
  p.poly(pts, base, 0);
  p.clip(pts, () => {
    const cols = ["#e2b33c", "#2f9a6a", "#e2483c", "#f2ecdf", "#3a6fd0"];
    for (let i = 0; i < 10; i++) for (let j = 0; j < 4; j++)
      p.ell(cx - 48 * u + i * 11 * u + (j % 2) * 5.5 * u, yb - 4 * u - j * 9 * u, 3.4 * u, 3.4 * u, cols[(i + j * 2) % 5], 0);
  });
  p.poly(pts, null, 4.5 * u);
};
export const drawManche = (p, o = {}) => {
  const out = { ...MANCHE, ...(o.outfit || {}) };
  bodyFront(p, out, { mode: "stand", seed: 5, back: true,
    headExtra: (c) => { curiousFace(p, c); topiM(p, c, o.topi || "#7a2f52"); } });
};
/** toon question mark, centred at x,y, size s (height) */
export const drawQ = (p, x, y, s, col = "#ffffff") => {
  const w = s * 0.13;
  const curve = []; for (let i = 0; i <= 24; i++) { const a = Math.PI * (1.05 - 1.55 * i / 24); curve.push([x + Math.cos(a) * s * 0.25, y - s * 0.22 - Math.sin(a) * s * 0.22]); }
  curve.push([x + s * 0.02, y + s * 0.12]);
  p.band(curve, col, w, s * 0.03, "round");
  p.ell(x + s * 0.02, y + s * 0.38, w * 0.62, w * 0.62, col, s * 0.03);
};
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
// ================= "आइस चुरोटको बल" cast (appended after manjushri.js, same module scope) =================
// Plain, unbranded props only (white filter + paper). Adults only. Symbols instead of organs.

POSES.whisper = (c) => { const S = c.sh(1); return [{ pts: c.hang(-1, 0), front: false }, { pts: [S, [c.tcx + 1.15 * c.T.a + 10 * c.u, S[1] + 0.3 * c.HH], [c.tcx + 0.62 * c.T.a, c.chin - 0.1 * c.HH]], front: true }]; };
POSES.cheek = (c) => [-1, 1].map((s) => { const S = c.sh(s); return { pts: [S, [c.tcx + s * (1.1 * c.T.a + 8 * c.u), S[1] + 0.32 * c.HH], [c.tcx + s * 0.55 * c.T.a, c.chin - 0.04 * c.HH]], front: true }; });
POSES.hold = (c) => [-1, 1].map((s) => { const S = c.sh(s); return { pts: [S, [c.tcx + s * (1.1 * c.T.a + 6 * c.u), S[1] + 0.42 * c.HH], [c.tcx + s * 0.35 * c.T.a, c.chin + 0.5 * c.HH]], front: true }; });
POSES.phoneLow = (c) => { const S = c.sh(1); return [{ pts: c.hang(-1, 0), front: false }, { pts: [S, [c.tcx + 1.1 * c.T.a + 6 * c.u, S[1] + 0.45 * c.HH], [c.tcx + 0.3 * c.T.a, c.chin + 0.42 * c.HH]], front: true }]; };
POSES.tap = (c) => [-1, 1].map((s) => { const S = c.sh(s); return { pts: [S, [c.tcx + s * (1.1 * c.T.a + 6 * c.u), S[1] + 0.44 * c.HH], [c.tcx + s * 0.18 * c.T.a, c.chin + (s > 0 ? 0.42 : 0.36) * c.HH]], front: true }; });
FACE.worry = { eye: ["small", "small"], brow: [-4, 3], mouth: "frown" };
FACE.sad = { eye: ["lid", "lid"], brow: [-4, 3], mouth: "frown" };
FACE.sly = { eye: ["lid", "lid"], brow: [2, -3], mouth: "smirk" };

const mkPuff = (p, cx, cy, r, col, a) => { const g = p.g, gr = g.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(0.6, `rgba(${col},${a * 0.6})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(cx - r, cy - r, 2 * r, 2 * r); };
/** soft cloud (300 x 300): col "r,g,b", t 0..1 grows + fades, seed */
export const drawCloud = (p, col, t, seed = 0) => {
  for (let i = 0; i < 6; i++) { const a = i * 1.1 + seed, d = 18 + 60 * t, r = (60 + 16 * ((i + seed) % 3)) * (0.75 + 0.35 * t);
    mkPuff(p, 150 + d * Math.cos(a), 150 + d * 0.8 * Math.sin(a), Math.min(r, 140 - d * 0.5), col, 0.55 * (1 - t * 0.6)); }
};
/** heavy, dull smoke puff (300 x 300): lumpy grey with a dark ink rim, not pretty */
export const drawSmoke = (p, t, seed = 0) => {
  const g = p.g;
  for (let i = 0; i < 5; i++) { const a = i * 1.3 + seed, d = 22 + 40 * t, r = 46 + 10 * ((i + seed) % 3);
    p.ell(150 + d * Math.cos(a), 160 + d * 0.7 * Math.sin(a), r, r * 0.86, `rgba(92,92,100,${(0.92 - 0.4 * t).toFixed(3)})`, 0); }
  g.globalAlpha = 0.5 * (1 - t); for (let i = 0; i < 5; i++) { const a = i * 1.3 + seed, d = 22 + 40 * t, r = 46 + 10 * ((i + seed) % 3); p.arc(150 + d * Math.cos(a), 160 + d * 0.7 * Math.sin(a), r, r * 0.86, 200, 340, 4, "#4a4a52"); }
  g.globalAlpha = 1;
};

/** giant cartoon fingertip (400 x 800), pointing up; nail on the tip */
export const drawFinger = (p, thumb = false) => {
  const sk = "#e8b98e", w = thumb ? 140 : 120, top = 40;
  const pts = []; for (let i = 0; i <= 24; i++) { const a = Math.PI + (Math.PI * i) / 24; pts.push([200 + w * Math.cos(a), top + w + w * Math.sin(a)]); }
  const body = [[200 - w, 820], ...pts, [200 + w, 820]];
  p.poly(body, sk, 9);
  p.g.save(); p.path(body, true); p.g.clip(); p.poly([[200 + w * 0.45, 0], [400, 0], [400, 820], [200 + w * 0.45, 820]], "rgba(170,100,70,0.22)", 0); p.poly([[200 - w, 0], [200 - w * 0.6, 0], [200 - w * 0.6, 820], [200 - w, 820]], "rgba(255,240,220,0.35)", 0); p.g.restore();
  // nail (back of the finger faces the camera): a rounded plate from the tip down
  const nw = w * 0.62, n0 = top + 26, n1 = top + w * 1.55, nail = [];
  for (let i = 0; i <= 12; i++) { const a = Math.PI + (Math.PI * i) / 12; nail.push([200 + nw * Math.cos(a), n0 + nw * 0.9 + nw * 0.9 * Math.sin(a)]); }
  nail.push([200 + nw, n1], [200 - nw, n1]);
  p.poly(nail, "#f6d6cc", 6); p.poly([[200 - nw * 0.55, n0 + 40], [200 - nw * 0.3, n0 + 30], [200 - nw * 0.3, n1 - 30], [200 - nw * 0.55, n1 - 30]], "rgba(255,255,255,0.7)", 0);
  for (const y of [n1 + 150, n1 + 175, n1 + 330]) p.stroke([[200 - w * 0.35, y], [200 + w * 0.35, y]], 5, "rgba(150,90,60,0.55)");
};

/** the capsule crack burst (600 x 600): t 0..1 */
export const drawBurst = (p, t) => {
  const g = p.g; mkPuff(p, 300, 300, 120 + 160 * t, "200,255,230", 0.9 * (1 - t));
  g.strokeStyle = `rgba(240,255,250,${(1 - t).toFixed(3)})`; g.lineCap = "round";
  for (let i = 0; i < 10; i++) { const a = i * 0.63 + 0.2, r0 = 40 + 120 * t, r1 = r0 + 70 + 40 * (i % 3); g.lineWidth = 10 * (1 - t) + 2; g.beginPath(); g.moveTo(300 + r0 * Math.cos(a), 300 + r0 * Math.sin(a)); g.lineTo(300 + r1 * Math.cos(a), 300 + r1 * Math.sin(a)); g.stroke(); }
};
/** green capsule ball (300 x 300); crack 0..1 */
export const drawCapsule = (p, crack = 0) => {
  mkPuff(p, 150, 150, 148, "120,255,190", 0.55);
  p.ell(150, 150, 82, 82, "#2fbf7f", 7); p.ell(150, 150, 82, 82, null, 0);
  p.ell(124, 120, 30, 22, "rgba(255,255,255,0.75)", 0, 0, 360, -30); p.ell(170, 185, 46, 30, "rgba(10,90,60,0.35)", 0, 0, 360, -30);
  if (crack > 0) p.stroke([[110, 92], [134, 128], [122, 150], [150, 176], [140, 214]].slice(0, 2 + Math.round(crack * 3)), 5);
};
/** shell halves flying apart (400 x 300), t 0..1 */
export const drawShell = (p, t) => {
  for (const s of [-1, 1]) { const x = 200 + s * (30 + 120 * t), y = 150 - 40 * t + 60 * t * t; p.g.save(); p.g.translate(x, y); p.g.rotate(s * t * 1.4);
    p.ell(0, 0, 60, 60, "#2fbf7f", 6, s < 0 ? 90 : 270, s < 0 ? 270 : 450); p.g.restore(); }
};
/** mint "menthol" tag (520 x 180) */
export const drawTag = (p, text) => {
  const g = p.g; g.save(); g.font = `bold 92px ${DEVA}`; g.textAlign = "center"; g.textBaseline = "middle";
  g.lineJoin = "round"; g.lineWidth = 14; g.strokeStyle = "#0f2b2a"; g.strokeText(text, 260, 96); g.fillStyle = "#b8ffe0"; g.fillText(text, 260, 96); g.restore();
};

/** rumour bubble (500 x 420): a cradle with a red cross + "?" */
export const drawRumour = (p) => {
  const g = p.g;
  p.poly([[60, 60], [440, 60], [440, 300], [180, 300], [110, 390], [130, 300], [60, 300]], "#fffaf0", 8);
  g.save(); g.translate(250, 200); g.scale(0.42, 0.42); drawCradleShape(p, 0); g.restore();
  p.stroke([[160, 110], [340, 270]], 14, "#d23a33"); p.stroke([[340, 110], [160, 270]], 14, "#d23a33");
  g.font = "bold 90px sans-serif"; g.fillStyle = "#24408E"; g.textAlign = "center"; g.fillText("?", 400, 140);
};
export const drawCradleShape = (p, glow = 0) => {
  const wd = "#a8703c", dk = "#7a4a22";
  p.arc(0, -40, 330, 150, 20, 160, 22, dk); // rocker
  p.poly([[-250, 40], [250, 40], [280, -150], [-280, -150]], wd, 9);
  for (let i = -4; i <= 4; i++) p.stroke([[i * 56, 20], [i * 61, -140]], 8, dk);
  p.band([[-300, -160], [300, -160]], "#c08a52", 26, 8, "round");
  p.poly([[-180, -150], [180, -150], [150, -110], [-150, -110]], "#f2ecdf", 5); // blanket edge
};
/** empty wooden cradle (800 x 560), drawn so the rocker touches the bottom */
export const drawCradle = (p) => { const g = p.g; g.save(); g.translate(400, 330); drawCradleShape(p); g.restore(); };

/** bar chart (800 x 760): k 0..1 = the smoker bar rising */
export const drawChart = (p, k) => {
  const g = p.g, base = 600, h0 = 260, h1 = h0 * (1 + 0.4 * k) + 30 * Math.sin(Math.PI * Math.min(1, k * 1.2)) * 0;
  p.poly([[40, 20], [760, 20], [760, 740], [40, 740]], "rgba(255,250,240,0.94)", 7);
  p.stroke([[110, base], [700, base]], 7);
  p.poly([[160, base], [330, base], [330, base - h0], [160, base - h0]], "#8fb4c8", 6);
  p.poly([[460, base], [630, base], [630, base - h1], [460, base - h1]], "#d9533c", 6);
  if (k > 0.05) { g.save(); g.setLineDash([16, 12]); g.strokeStyle = "rgba(36,23,38,0.6)"; g.lineWidth = 5; g.beginPath(); g.moveTo(150, base - h0); g.lineTo(640, base - h0); g.stroke(); g.restore(); }
  g.font = `bold 58px ${DEVA}`; g.fillStyle = "#241726"; g.textAlign = "center"; g.fillText("नखाने", 245, base + 80); g.fillText("खाने", 545, base + 80);
  if (k > 0.3) { g.globalAlpha = Math.min(1, (k - 0.3) / 0.3); g.font = `bold 78px ${DEVA}`; g.fillStyle = "#b8281e"; g.fillText("+४०%", 545, base - h1 - 34); g.globalAlpha = 1; }
};
/** report paper (600 x 760) with "WHO" header + a source line */
export const drawReport = (p) => {
  const g = p.g;
  p.poly([[50, 30], [520, 30], [560, 80], [560, 730], [50, 730]], "#fbf8f0", 8);
  p.poly([[520, 30], [520, 80], [560, 80]], "#e2dccd", 5);
  g.fillStyle = "#2f6fb0"; g.font = "bold 110px sans-serif"; g.textAlign = "center"; g.fillText("WHO", 300, 170);
  g.font = `bold 48px ${DEVA}`; g.fillStyle = "#241726"; g.fillText("रिपोर्ट, २०२६", 300, 250);
  for (let i = 0; i < 6; i++) p.stroke([[110, 330 + i * 60], [i % 3 === 2 ? 340 : 500, 330 + i * 60]], 8, "rgba(36,23,38,0.35)");
};

/** classroom board diagram (1000 x 1200): side-view bean-head, airway, cold mist on top, smoke deeper; m = mist 0..1, d = depth 0..1 */
export const drawDiagram = (p, m, d) => {
  const g = p.g, chalk = "rgba(245,245,235,0.92)";
  p.poly([[0, 0], [1000, 0], [1000, 1200], [0, 1200]], "#8a5a32", 0);
  p.poly([[30, 30], [970, 30], [970, 1170], [30, 1170]], "#24433a", 6);
  for (let i = 0; i < 40; i++) p.ell(60 + ((i * 337) % 880), 60 + ((i * 521) % 1080), 40, 8, "rgba(255,255,255,0.025)", 0);
  // head in profile (facing left), neck, chest outline
  g.strokeStyle = chalk; g.lineWidth = 10; g.lineCap = "round"; g.lineJoin = "round";
  g.beginPath(); g.ellipse(560, 300, 200, 190, 0, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(370, 330); g.lineTo(330, 345); g.lineTo(368, 372); g.stroke(); // nose
  g.beginPath(); g.ellipse(470, 260, 14, 18, 0, 0, Math.PI * 2); g.fillStyle = chalk; g.fill(); // eye
  g.beginPath(); g.moveTo(480, 480); g.lineTo(470, 620); g.moveTo(640, 480); g.lineTo(650, 620); g.stroke(); // neck
  g.beginPath(); g.moveTo(470, 620); g.quadraticCurveTo(240, 640, 230, 900); g.lineTo(230, 1110); g.moveTo(650, 620); g.quadraticCurveTo(880, 640, 890, 900); g.lineTo(890, 1110); g.stroke();
  // airway: mouth -> throat -> chest (a simple tube)
  const air = [[390, 420], [470, 440], [540, 520], [555, 640], [560, 800], [560, 1060]];
  g.lineWidth = 64; g.strokeStyle = "rgba(255,255,255,0.10)"; g.beginPath(); air.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
  g.lineWidth = 6; g.strokeStyle = "rgba(245,245,235,0.5)"; g.setLineDash([18, 14]); g.beginPath(); air.forEach(([x, y], i) => (i ? g.lineTo(x + 32, y) : g.moveTo(x, y - 30))); g.stroke(); g.beginPath(); air.forEach(([x, y], i) => (i ? g.lineTo(x - 32, y) : g.moveTo(x, y + 30))); g.stroke(); g.setLineDash([]);
  // smoke: dark blobs travelling down the tube to depth d
  const yMax = 520 + 540 * d;
  for (let i = 0; i < 9; i++) { const y = 470 + i * 64; if (y > yMax) break; const x = y < 520 ? 470 + (y - 440) : 553; p.ell(x + ((i * 37) % 30) - 15, y, 34, 28, "rgba(70,70,78,0.95)", 0); }
  // cold mist layer on top (blue) sits over the smoke in the mouth + throat
  if (m > 0) { for (let i = 0; i < 6; i++) mkPuff(p, 410 + i * 30, 420 + i * 22, 70, "150,220,255", 0.75 * m);
    g.font = `bold 60px ${DEVA}`; g.fillStyle = `rgba(170,230,255,${m})`; g.textAlign = "left"; g.fillText("चिसो", 160, 520); }
  g.font = `bold 60px ${DEVA}`; g.fillStyle = "rgba(200,200,205,0.95)"; g.textAlign = "left"; g.fillText("धुवाँ", 650, Math.min(yMax, 1000));
  // arrow down to the depth
  if (d > 0.02) { const ya = 560 + 500 * d; g.strokeStyle = "#ffcf4a"; g.lineWidth = 14; g.beginPath(); g.moveTo(720, 560); g.lineTo(720, ya); g.stroke();
    p.poly([[690, ya - 6], [750, ya - 6], [720, ya + 46]], "#ffcf4a", 0); }
};

/** phone held in a hand, screen facing the camera (600 x 1000); scr 0 = chat with the tag, 1 = the reel (filter) */
export const drawPhoneBig = (p, tag = 0, scr = 0) => {
  const g = p.g;
  p.poly([[110, 40], [490, 40], [490, 820], [110, 820]], "#1c1c24", 10);
  const S = [[134, 80], [466, 80], [466, 780], [134, 780]];
  p.clip(S, () => {
    if (scr < 0.5) { p.poly(S, "#f4f6fa", 0);
      for (let i = 0; i < 4; i++) p.poly([[160, 130 + i * 120], [i % 2 ? 440 : 380, 130 + i * 120], [i % 2 ? 440 : 380, 210 + i * 120], [160, 210 + i * 120]], i % 2 ? "#cfe6ff" : "#e6e8ee", 0);
      if (tag > 0) { const s = tag; g.save(); g.translate(300, 650); g.scale(s, s); p.poly([[-150, -60], [150, -60], [150, 60], [-150, 60]], "#24408E", 0); g.font = `bold 64px ${DEVA}`; g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("@साथी", 0, 4); g.restore(); }
    } else { p.poly(S, "#123038", 0); mkPuff(p, 300, 430, 260, "120,255,190", 0.6); p.poly([[180, 380], [420, 380], [420, 480], [180, 480]], "#f5f2ea", 6); p.ell(300, 430, 34, 34, "#2fbf7f", 5); }
  });
  // hand under the phone
  p.poly([[60, 1000], [80, 760], [150, 700], [180, 820], [420, 820], [520, 760], [560, 1000]], "#e8b98e", 9);
  p.ell(500, 640, 46, 70, "#e8b98e", 9); // thumb tapping
};
/** "@" tag pop (300 x 300) */
export const drawTagPop = (p) => { p.ell(150, 150, 110, 110, "#24408E", 8); const g = p.g; g.font = "bold 150px sans-serif"; g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("@", 150, 160); };

// ---------- people (adults only) ----------
const ADULT = (v) => {
  const woman = v % 2 === 1;
  const o = { jacket: ["#2f6fb0", "#c0303a", "#2f7a5a", "#e2a83a", "#6a4a8a", "#3a3f52"][v % 6], pants: ["#34496e", "#2b2b38", "#5a4a3a"][v % 3], boots: "#3a2a22", skin: ["#e8b98e", "#d9a57a", "#f0c49c", "#c99067"][v % 4], hat: "hair", hair: "#1a1414" };
  if (woman) o.dress = o.jacket; else if (v % 4 === 0) o.moustache = "#2a1d18";
  return { o, woman };
};
/** standing adult. st: { v, pose:[a,b,k], expr, blink, look, back, topi } */
export const drawAdult = (p, st = {}) => {
  const v = st.v ?? 0, { o, woman } = ADULT(v), pose = st.pose ?? ["hang", "hang", 0];
  bodyFront(p, o, { mode: "stand", seed: 200 + v, expr: st.expr ?? "neutral", blink: st.blink ?? 0, look: st.look ?? 0, back: !!st.back, headTilt: st.headTilt ?? 0,
    armFn: armBlend(pose[0], pose[1], pose[2]),
    front: st.phone ? (c) => { const { p: q, u, arms } = c, [hx, hy] = arms[1].pts[2];
      q.poly([[hx - 13 * u, hy - 32 * u], [hx + 13 * u, hy - 32 * u], [hx + 13 * u, hy + 6 * u], [hx - 13 * u, hy + 6 * u]], "#22222c", 2.5 * u);
      q.poly([[hx - 9 * u, hy - 28 * u], [hx + 9 * u, hy - 28 * u], [hx + 9 * u, hy + 2 * u], [hx - 9 * u, hy + 2 * u]], "#8fd4ff", 0); q.dot(hx, hy, 5.5 * u); } : undefined,
    headExtra: (c) => { if (st.back) hairBack(p, c, o.hair, woman); else { if (woman) p.ell(c.cx + 0.42 * c.W, c.hc - 0.25 * c.HH, 22 * c.u, 20 * c.u, o.hair, 3 * c.u); if (st.topi) topi(p, c, "#2f3f6a"); } } });
};

const ICE_GOLD = GOLD, ICE_ICE = ICE, RED = ["#ffe2d8", "#ff7a5a", "#c8281e"];
/** overlay that fits its text into the card (1000 x 240) */
export const drawOverlay2 = (p, text, style = "gold") => {
  const g = p.g; g.font = `bold 110px ${DEVA}`; const w = g.measureText(text).width, s = Math.min(110, (110 * 900) / Math.max(1, w));
  glowText(g, text, 500, 120, s, style === "ice" ? ICE : style === "red" ? RED : GOLD, style === "ice" ? "rgba(140,200,255,0.95)" : style === "red" ? "rgba(255,110,80,0.95)" : "rgba(255,200,90,0.95)");
};
/** hook card (1000 x 560): "बल फुटाउँदा" (ice, capsule icon) / "बच्चा हुँदैन?" (gold); a, b reveal, j shake */
export const drawHookIce = (p, a, b, j = 0) => {
  const g = p.g;
  if (a > 0.01) { g.save(); g.globalAlpha = a; g.translate(120, 165); g.scale(0.5, 0.5); g.translate(-150, -150); drawCapsule(p, 1); g.restore();
    glowText(g, "बल फुटाउँदा", 560, 165 + 24 * (1 - a), 128, ICE, "rgba(140,220,255,0.95)", a); }
  if (b > 0.01) { const jx = j * 8 * Math.sin(j * 40); glowText(g, "बच्चा हुँदैन?", 500 + jx, 380, 150, GOLD, "rgba(255,200,90,0.95)", b); }
};

// ---------- inhalation diagram (1000 x 1300): a person with a see-through chest, windpipe, bronchi, lungs ----------
// st: { m: cold mist 0..1, d: how deep the smoke reaches 0..1, br: breath 0 (out) .. 1 (full in), ph: particle phase 0..1, cmp: show the shallow marker }
const LUNG_TIPS = [[330, 770], [700, 770], [292, 905], [722, 905], [330, 1075], [680, 1075]];
const lungPath = (k) => { const L = k % 2 === 0, sx = L ? -1 : 1, bx = 500 + sx * 78, tip = LUNG_TIPS[k];
  return [[500, 352], [500, 470], [500, 600], [500, 742], [bx, 800], [(bx + tip[0]) / 2 + sx * 10, (800 + tip[1]) / 2], tip]; };
const polyAt = (pts, u) => { const seg = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); tot += l; }
  let r = u * tot; for (let i = 0; i < seg.length; i++) { if (r <= seg[i]) { const t = r / seg[i]; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t]; } r -= seg[i]; } return pts[pts.length - 1]; };
export const drawLungs = (p, st = {}) => {
  const g = p.g, m = st.m ?? 0, d = st.d ?? 0.2, br = st.br ?? 0.3, ph = st.ph ?? 0, sk = "#e8b98e", INKc = "#241726";
  // panel
  const bg = g.createLinearGradient(0, 0, 0, 1300); bg.addColorStop(0, "#1b2b44"); bg.addColorStop(1, "#0f1a2c"); g.fillStyle = bg; g.fillRect(0, 0, 1000, 1300);
  g.strokeStyle = "rgba(255,255,255,0.05)"; g.lineWidth = 2; for (let x = 0; x <= 1000; x += 50) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 1300); g.stroke(); } for (let y = 0; y <= 1300; y += 50) { g.beginPath(); g.moveTo(0, y); g.lineTo(1000, y); g.stroke(); }
  const chest = 1 + 0.035 * br;
  // body: shoulders + torso (shirt), neck
  g.save(); g.translate(500, 640); g.scale(chest, 1); g.translate(-500, -640);
  p.poly([[180, 1300], [190, 700], [240, 610], [400, 565], [600, 565], [760, 610], [810, 700], [820, 1300]], "#3a6fb0", 9);
  g.restore();
  p.poly([[435, 470], [565, 470], [575, 590], [425, 590]], sk, 8);
  // see-through chest window
  g.save(); g.beginPath(); g.ellipse(500, 935, 300 * chest, 330, 0, 0, Math.PI * 2); g.closePath(); g.fillStyle = "#f6dcc8"; g.fill(); g.lineWidth = 7; g.strokeStyle = INKc; g.stroke(); g.clip();
  g.fillStyle = "rgba(255,255,255,0.18)"; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(500, 700 + i * 70, 260, 18, 0, Math.PI * 0.05, Math.PI * 0.95); g.lineWidth = 10; g.strokeStyle = "rgba(220,170,150,0.35)"; g.stroke(); } // ribs, faint
  // lungs (expand with the breath)
  const s = 0.9 + 0.13 * br, lob = (cx, sx) => { const pts = []; for (let i = 0; i <= 40; i++) { const a = (i / 40) * Math.PI * 2, r = 1 + 0.08 * Math.sin(3 * a); let x = Math.cos(a) * 150 * r, y = Math.sin(a) * 250 * r; if (sx * x < 0) x *= 0.55; if (y < 0) x *= 0.8 + 0.2 * (1 + y / 250); pts.push([cx + x * s, 925 + y * s + 30 * (s - 1)]); } return pts; };
  for (const [cx, sx] of [[355, 1], [645, -1]]) { const pts = lob(cx, sx); p.poly(pts, "#f0928e", 7); g.save(); p.path(pts, true); g.clip(); g.fillStyle = "rgba(255,255,255,0.22)"; g.beginPath(); g.ellipse(cx - 40 * sx, 820, 50, 120, -0.3 * sx, 0, 7); g.fill(); g.fillStyle = "rgba(150,40,50,0.18)"; g.beginPath(); g.ellipse(cx + 60 * sx, 1050, 120, 110, 0, 0, 7); g.fill(); g.restore(); }
  // diaphragm
  g.beginPath(); g.moveTo(230, 1210 + 40 * br); g.quadraticCurveTo(500, 1110 + 70 * br, 770, 1210 + 40 * br); g.lineWidth = 10; g.strokeStyle = "#c8706a"; g.stroke();
  // bronchial tree
  g.lineCap = "round"; g.lineJoin = "round";
  for (let k = 0; k < 6; k++) { const pts = lungPath(k).slice(3); g.strokeStyle = "#c2575a"; g.lineWidth = 16; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
    const tip = LUNG_TIPS[k]; for (let j = 0; j < 4; j++) { const a = j * 1.6 + k; g.lineWidth = 6; g.beginPath(); g.moveTo(tip[0], tip[1]); g.lineTo(tip[0] + 38 * Math.cos(a), tip[1] + 38 * Math.sin(a)); g.stroke(); p.ell(tip[0] + 44 * Math.cos(a), tip[1] + 44 * Math.sin(a), 11, 11, "#f6b2ae", 3); } }
  // smoke haze settling where it reached: upper always, deeper with d
  for (let k = 0; k < 6; k++) { const tip = LUNG_TIPS[k], reach = tip[1] <= 790 + 330 * d ? 1 : clamp((790 + 330 * d - tip[1] + 120) / 120, 0, 1); if (reach > 0.02) mkPuff(p, tip[0], tip[1], 95, "70,70,80", 0.75 * reach * (0.4 + 0.6 * d)); }
  g.restore();
  // windpipe (rings) from the mouth down to the split
  g.lineCap = "round"; g.strokeStyle = INKc; g.lineWidth = 56; g.beginPath(); g.moveTo(500, 380); g.lineTo(500, 745); g.stroke();
  g.strokeStyle = "#f2c4b4"; g.lineWidth = 42; g.beginPath(); g.moveTo(500, 380); g.lineTo(500, 745); g.stroke();
  for (let y = 420; y < 740; y += 28) p.stroke([[480, y], [520, y]], 5, "#d39a8c");
  for (const sx of [-1, 1]) { g.strokeStyle = INKc; g.lineWidth = 46; g.beginPath(); g.moveTo(500, 742); g.lineTo(500 + sx * 78, 800); g.stroke(); g.strokeStyle = "#f2c4b4"; g.lineWidth = 32; g.beginPath(); g.moveTo(500, 742); g.lineTo(500 + sx * 78, 800); g.stroke(); }
  // head (front view, breathing in through the open mouth)
  p.ell(500, 250, 150, 165, sk, 9);
  p.poly([[352, 220], [372, 130], [450, 88], [560, 92], [630, 135], [650, 220], [600, 168], [500, 150], [400, 170]], "#1f1816", 0);
  for (const sx of [-1, 1]) { p.stroke([[500 + sx * 78, 262], [500 + sx * 40, 262]], 9); p.stroke([[500 + sx * 82, 222], [500 + sx * 38, 214]], 8); }
  p.ell(500, 340, 30 + 8 * br, 26 + 10 * br, "#7a2a35", 7);
  // smoke coming in from the left, then particles travelling down the airway
  mkPuff(p, 250, 345, 110, "90,90,100", 0.7); mkPuff(p, 180, 300, 80, "90,90,100", 0.5);
  const limitY = 790 + 330 * d;
  for (let i = 0; i < 30; i++) { const k = i % 6, path = lungPath(k), tip = LUNG_TIPS[k], u = (ph + i * 0.137) % 1;
    let pos = polyAt(path, u); if (pos[1] > limitY) pos = polyAt(path, Math.max(0, u - 0.25)); if (pos[1] > limitY) continue;
    const a = Math.sin(Math.PI * u); p.ell(pos[0], pos[1], 13, 13, `rgba(60,60,70,${(0.85 * a + 0.1).toFixed(2)})`, 0); }
  // cold menthol mist over the mouth + throat: it numbs the feel of the smoke
  if (m > 0) { for (let i = 0; i < 6; i++) mkPuff(p, 500 + (i % 2 ? 22 : -22), 345 + i * 42, 82, "150,225,255", 0.6 * m);
    g.font = `bold 58px ${DEVA}`; g.textAlign = "right"; g.lineJoin = "round"; g.lineWidth = 10; g.strokeStyle = "#0f1a2c"; g.strokeText("चिसो मेन्थोल", 430, 440); g.fillStyle = `rgba(170,230,255,${m})`; g.fillText("चिसो मेन्थोल", 430, 440);
    g.strokeStyle = `rgba(170,230,255,${m})`; g.lineWidth = 6; g.beginPath(); g.moveTo(436, 425); g.lineTo(468, 375); g.stroke(); }
  // depth gauge (left): how far down the smoke goes
  g.fillStyle = "rgba(255,255,255,0.12)"; g.fillRect(125, 640, 40, 520); const gy = 640 + 520 * clamp((limitY - 640) / 520, 0, 1);
  g.fillStyle = "#ffcf4a"; g.fillRect(125, 640, 40, gy - 640); p.poly([[105, gy - 4], [185, gy - 4], [145, gy + 40]], "#ffcf4a", 0);
  if (false) { g.strokeStyle = "rgba(255,255,255,0.7)"; g.setLineDash([12, 10]); g.lineWidth = 5; g.beginPath(); g.moveTo(80, 830); g.lineTo(870, 830); g.stroke(); g.setLineDash([]); }
  g.font = `bold 52px ${DEVA}`; g.textAlign = "left"; g.lineWidth = 9; g.strokeStyle = "#0f1a2c"; g.strokeText("धुवाँ", 618, 520); g.fillStyle = "#d8d8de"; g.fillText("धुवाँ", 618, 520);
  g.strokeStyle = "#d8d8de"; g.lineWidth = 5; g.beginPath(); g.moveTo(612, 505); g.lineTo(528, 540); g.stroke();
  if (st.deep > 0.01) { g.globalAlpha = st.deep; g.font = `bold 54px ${DEVA}`; g.textAlign = "left"; g.lineWidth = 10; g.strokeStyle = "#0f1a2c"; g.strokeText("गहिरो तान", 120, 548); g.fillStyle = "#ffcf4a"; g.fillText("गहिरो तान", 120, 548); g.globalAlpha = 1; }
};

// ---------- the filter cut open (1000 x 1400): upright tube, fibres, menthol capsule; b = burst 0..1, ph = smoke phase,
// tag = "मेन्थोल" label 0..1, cold = thermometer drop 0..1, light = "हल्का" label 0..1 ----------
const snow = (g, x, y, r, a) => { g.save(); g.globalAlpha = a; g.strokeStyle = "#e6f8ff"; g.lineWidth = Math.max(2, r * 0.18); g.lineCap = "round";
  for (let k = 0; k < 3; k++) { const t = (k * Math.PI) / 3; g.beginPath(); g.moveTo(x - r * Math.cos(t), y - r * Math.sin(t)); g.lineTo(x + r * Math.cos(t), y + r * Math.sin(t)); g.stroke();
    for (const s of [-1, 1]) { const cx = x + s * r * 0.55 * Math.cos(t), cy = y + s * r * 0.55 * Math.sin(t); g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + r * 0.3 * Math.cos(t + s * 2.4), cy + r * 0.3 * Math.sin(t + s * 2.4)); g.moveTo(cx, cy); g.lineTo(cx + r * 0.3 * Math.cos(t - s * 2.4), cy + r * 0.3 * Math.sin(t - s * 2.4)); g.stroke(); } }
  g.restore(); };
const label = (g, text, x, y, col, size = 62, align = "left", a = 1) => { if (a <= 0.01) return; g.save(); g.globalAlpha = a; g.font = `bold ${size}px ${DEVA}`; g.textAlign = align; g.textBaseline = "middle"; g.lineJoin = "round"; g.lineWidth = size * 0.2; g.strokeStyle = "#0b1d24"; g.strokeText(text, x, y); g.fillStyle = col; g.fillText(text, x, y); g.restore(); };
export const drawFilterCut = (p, st = {}) => {
  const g = p.g, b = st.b ?? 0, ph = st.ph ?? 0, X0 = 350, X1 = 770, CX = 560, Y0 = 250, Y1 = 1400, CY = 780, INKc = "#241726";
  const bg = g.createRadialGradient(CX, CY, 50, CX, CY, 900); bg.addColorStop(0, "#1d4a52"); bg.addColorStop(1, "#08171c"); g.fillStyle = bg; g.fillRect(0, 0, 1000, 1400);
  // the tube: back wall (inside, darker paper) + fibres
  p.poly([[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1]], "#d9d2c2", 0);
  g.save(); g.beginPath(); g.rect(X0, Y0, X1 - X0, Y1 - Y0); g.clip();
  const shade = g.createLinearGradient(X0, 0, X1, 0); shade.addColorStop(0, "rgba(0,0,0,0.28)"); shade.addColorStop(0.35, "rgba(0,0,0,0)"); shade.addColorStop(0.7, "rgba(0,0,0,0)"); shade.addColorStop(1, "rgba(0,0,0,0.3)"); g.fillStyle = shade; g.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
  g.lineCap = "round";
  for (let i = 0; i < 46; i++) { const x = X0 + 10 + ((i * 53) % (X1 - X0 - 20)), w = 3 + (i % 3) * 2; g.strokeStyle = i % 2 ? "rgba(255,255,255,0.75)" : "rgba(170,160,140,0.55)"; g.lineWidth = w; g.beginPath();
    for (let y = Y0; y <= Y1; y += 20) { const xx = x + 9 * Math.sin(y * 0.02 + i); y === Y0 ? g.moveTo(xx, y) : g.lineTo(xx, y); } g.stroke(); }
  // frost creeping over the fibres from the capsule
  if (b > 0) { const R = 80 + 560 * b; const fr = g.createRadialGradient(CX, CY, 0, CX, CY, R); fr.addColorStop(0, "rgba(200,240,255,0.65)"); fr.addColorStop(0.7, "rgba(170,225,255,0.35)"); fr.addColorStop(1, "rgba(170,225,255,0)"); g.fillStyle = fr; g.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
    for (let i = 0; i < 26; i++) { const a = i * 2.39, r = 40 + ((i * 97) % 520); if (r > R) continue; snow(g, CX + r * 0.55 * Math.cos(a), CY + r * Math.sin(a), 12 + (i % 3) * 5, 0.9 * Math.min(1, (R - r) / 80)); } }
  // smoke rising from the tobacco end (bottom): dark + heavy below the capsule, pale + soft above it once the menthol is out
  if (st.smoke) for (let i = 0; i < 16; i++) { const u = (ph + i / 16) % 1, y = Y1 + 60 - u * (Y1 - Y0 + 260), x = CX + 120 * Math.sin(i * 2.1 + u * 3);
    const soft = b > 0.05 ? Math.min(1, Math.max(0, (CY + 60 - y) / 160)) * Math.min(1, b * 2) : 0, r = 36 + 22 * soft + 8 * (i % 3);
    if (soft < 1) mkPuff(p, x, y, r * 1.2, "52,52,60", 0.95 * (1 - soft));
    if (soft > 0) { mkPuff(p, x, y, r * 1.45, "235,248,255", 0.95 * soft); if (i % 3 === 0) snow(g, x, y, 10, soft); } }
  g.restore();
  // capsule (menthol liquid inside) or its shell bursting
  if (b <= 0) {
    mkPuff(p, CX, CY, 260, "120,255,190", 0.45);
    p.ell(CX, CY, 125, 125, "#2fbf7f", 8);
    g.save(); g.beginPath(); g.ellipse(CX, CY, 118, 118, 0, 0, Math.PI * 2); g.clip();
    const lq = CY + 20 + 8 * Math.sin(ph * 30); g.fillStyle = "rgba(170,255,215,0.75)"; g.beginPath(); g.moveTo(CX - 130, lq); for (let x = -130; x <= 130; x += 10) g.lineTo(CX + x, lq + 6 * Math.sin(x * 0.06 + ph * 40)); g.lineTo(CX + 130, CY + 130); g.lineTo(CX - 130, CY + 130); g.fill();
    for (let k = 0; k < 5; k++) p.ell(CX - 50 + k * 25, lq + 40 + (k % 2) * 25, 7, 7, "rgba(255,255,255,0.7)", 0);
    g.restore();
    p.ell(CX - 40, CY - 48, 40, 26, "rgba(255,255,255,0.85)", 0, 0, 360, -30);
  } else {
    const t = Math.min(1, b * 1.6);
    const bl = g.createRadialGradient(CX, CY, 0, CX, CY, 140 + 420 * t); bl.addColorStop(0, `rgba(235,252,255,${0.95 * (1 - 0.5 * t)})`); bl.addColorStop(1, "rgba(170,225,255,0)"); g.fillStyle = bl; g.fillRect(0, 0, 1000, 1400);
    for (let k = 0; k < 6; k++) { const a = k * 1.05 + 0.3, d = 40 + 260 * t, x = CX + d * Math.cos(a), y = CY + d * Math.sin(a); if (t >= 1 && b > 0.9) continue;
      g.save(); g.translate(x, y); g.rotate(a + t * 2); g.globalAlpha = 1 - Math.max(0, (t - 0.6) / 0.4); p.ell(0, 0, 46, 30, "#2fbf7f", 6, 200, 340); g.restore(); }
  }
  // cut edges of the paper wrap + the open mouth end at the top (pores)
  for (const x of [X0, X1]) { p.poly([[x - 16, Y0], [x + 16, Y0], [x + 16, Y1], [x - 16, Y1]], "#f6f2e8", 6); }
  p.ell(CX, Y0, (X1 - X0) / 2 + 16, 46, "#efe9dc", 7);
  for (let i = 0; i < 40; i++) p.ell(CX - 150 + ((i * 37) % 300), Y0 - 30 + ((i * 23) % 60), 4, 3, "rgba(150,140,120,0.5)", 0);
  // pale, light wisps leaving the top once the menthol is out
  if (b > 0.2) for (let i = 0; i < 4; i++) { const u = (ph * 1.3 + i / 4) % 1; mkPuff(p, CX - 60 + i * 40 + 30 * Math.sin(u * 6), Y0 - 40 - 220 * u, 50 + 30 * u, "220,242,255", 0.7 * (1 - u) * Math.min(1, (b - 0.2) * 3)); }
  // labels (kept inside the safe area of the frame)
  if ((st.tag ?? 0) > 0.01) { const a = st.tag; g.save(); g.globalAlpha = a; g.strokeStyle = "#b8ffe0"; g.lineWidth = 6; g.beginPath(); g.restore(); label(g, "मेन्थोल", CX, CY - 185, "#b8ffe0", 70, "center", a); }
  if ((st.cold ?? 0) > 0.01 || b > 0) { const c = st.cold ?? 0, a = Math.min(1, b * 3); // thermometer
    g.save(); g.globalAlpha = a; p.poly([[200, 380], [244, 380], [244, 610], [200, 610]], "#f4f6fa", 6); p.ell(222, 640, 40, 40, c > 0.5 ? "#59b8ff" : "#e2483c", 6);
    const top = 400 + 200 * c; p.poly([[212, top], [232, top], [232, 640], [212, 640]], c > 0.5 ? "#59b8ff" : "#e2483c", 0); p.ell(222, 640, 30, 30, c > 0.5 ? "#59b8ff" : "#e2483c", 0);
    for (let k = 0; k < 5; k++) p.stroke([[244, 410 + k * 44], [262, 410 + k * 44]], 4, "#f4f6fa"); g.restore();
    label(g, "चिसो", 222, 730, "#aee4ff", 62, "center", a * Math.min(1, c * 2)); }
  if ((st.light ?? 0) > 0.01) { const a = st.light; g.save(); g.globalAlpha = a; g.strokeStyle = "#e6f6ff"; g.lineWidth = 8; g.lineCap = "round"; g.beginPath(); g.moveTo(180, 320); g.lineTo(180, 225); g.moveTo(156, 250); g.lineTo(180, 225); g.lineTo(204, 250); g.stroke(); g.restore(); label(g, "हल्का", 205, 268, "#e6f6ff", 54, "left", a); }
};
// ================= "आखिर सुन किन घट्यो?" cast (appended after ice.js, same module scope) =================
// Generic people only: no real brands, banks, officials or flags. Adults only. No buy/sell advice anywhere.

const GOLDC = ["#fff2b0", "#f2c84a", "#c98a1e"];
const NUMF = (px) => `bold ${px}px ${DEVA}`;
const txt = (g, s, x, y, px, col, align = "center", stroke = null, sw = 0) => {
  g.save(); g.font = NUMF(px); g.textAlign = align; g.textBaseline = "middle";
  if (stroke) { g.lineJoin = "round"; g.lineWidth = sw; g.strokeStyle = stroke; g.strokeText(s, x, y); }
  g.fillStyle = col; g.fillText(s, x, y); g.restore();
};
POSES.shrug = (c) => [-1, 1].map((s) => { const S = c.sh(s); return { pts: [S, [c.tcx + s * (1.25 * c.T.a + 16 * c.u), S[1] + 0.18 * c.HH], [c.tcx + s * (1.35 * c.T.a + 30 * c.u), S[1] - 0.12 * c.HH]], front: false }; });
POSES.clasp = (c) => [-1, 1].map((s) => { const S = c.sh(s); return { pts: [S, [c.tcx + s * (1.1 * c.T.a + 4 * c.u), S[1] + 0.36 * c.HH], [c.tcx + s * 0.08 * c.T.a, c.chin + 0.3 * c.HH]], front: true }; });
POSES.lift = (c) => [-1, 1].map((s) => { const S = c.sh(s); return { pts: [S, [c.tcx + s * (1.15 * c.T.a + 8 * c.u), S[1] + 0.1 * c.HH], [c.tcx + s * 0.4 * c.T.a, c.chin - 0.05 * c.HH]], front: true }; });

// ---------- props drawn in the hands ----------
const goldBar = (p, x, y, s) => { // trapezoid ingot centred at (x, y), s = scale (u)
  p.poly([[x - 26 * s, y + 9 * s], [x + 26 * s, y + 9 * s], [x + 19 * s, y - 9 * s], [x - 19 * s, y - 9 * s]], GOLDC[1], 2.4 * s);
  p.poly([[x - 19 * s, y - 9 * s], [x + 19 * s, y - 9 * s], [x + 15 * s, y - 13 * s], [x - 15 * s, y - 13 * s]], GOLDC[0], 2 * s);
  p.stroke([[x - 14 * s, y - 2 * s], [x - 4 * s, y - 2 * s]], 2 * s, "rgba(255,255,255,0.8)");
};
const marigold = (p, c, y0 = 0.08, drop = 0.42) => { const { tcx, T, chin, HH, u } = c, n = 15;
  for (let i = 0; i <= n; i++) { const t = i / n, x = tcx + (t - 0.5) * 1.5 * T.a, y = chin + y0 * HH + drop * HH * Math.sin(Math.PI * t);
    p.ell(x, y, 6.5 * u, 6.5 * u, i % 3 ? "#f29a1e" : "#f6c93a", 1.6 * u); } };
const necklace = (p, c, k = 1) => { const { tcx, T, chin, HH, u } = c, n = 11;
  p.arc(tcx, chin + 0.02 * HH, 0.55 * T.a, 0.22 * HH, 20, 160, 3 * u, GOLDC[2]);
  for (let i = 0; i <= n; i++) { const a = (20 + (140 * i) / n) * Math.PI / 180; p.ell(tcx + 0.55 * T.a * Math.cos(a), chin + 0.02 * HH + 0.22 * HH * Math.sin(a), 4.2 * u * k, 4.2 * u * k, GOLDC[1], 1.4 * u); }
  p.ell(tcx, chin + 0.26 * HH, 9 * u, 11 * u, GOLDC[1], 2 * u); p.ell(tcx, chin + 0.26 * HH, 4 * u, 5 * u, "#c8281e", 0); };
const sariDrape = (p, c, col, border = GOLDC[1]) => { const { tcx, T, chin, HH, u, torsoBot } = c;
  const pts = [[tcx + 0.55 * T.a, chin + 0.02 * HH], [tcx + 0.95 * T.a, chin + 0.12 * HH], [tcx - 0.55 * T.a, torsoBot - 0.05 * HH], [tcx - 0.95 * T.a, torsoBot - 0.2 * HH]];
  p.poly(pts, col, 2.5 * u); p.stroke([pts[1], pts[2]], 4 * u, border); };
const tie = (p, c) => { const { tcx, chin, HH, u } = c;
  p.poly([[tcx - 0.18 * 100 * u, chin + 0.01 * HH], [tcx, chin + 0.2 * HH], [tcx + 0.18 * 100 * u, chin + 0.01 * HH]], "#f4f2ec", 2 * u);
  p.poly([[tcx - 4 * u, chin + 0.04 * HH], [tcx + 4 * u, chin + 0.04 * HH], [tcx + 6 * u, chin + 0.36 * HH], [tcx, chin + 0.42 * HH], [tcx - 6 * u, chin + 0.36 * HH]], "#b8322c", 2 * u); };
const sweat = (p, c, k) => { const { cx, hc, W, HH, u } = c; for (const [dx, dy, s] of [[0.42, -0.25, 1], [-0.46, -0.1, 0.8], [0.5, 0.05, 0.7]]) {
  const x = cx + dx * W, y = hc + dy * HH + 10 * u * k; p.poly([[x, y - 12 * u * s], [x + 6 * u * s, y + 2 * u * s], [x, y + 8 * u * s], [x - 6 * u * s, y + 2 * u * s]], "#bfe6ff", 1.8 * u); } };
const handsMid = (c) => { const a = c.arms[0]?.pts[2], b = c.arms[1]?.pts[2]; return a && b ? [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] : [c.tcx, c.chin + 0.4 * c.HH]; };

// ---------- people ----------
/** generic person. o = outfit, st: { mode, phase, pose:[a,b,k], expr, blink, look, topi, bun, extra:[...], seed } */
export const drawPerson = (p, o, st = {}) => {
  const pose = st.pose ?? ["hang", "hang", 0], ex = st.extra ?? [];
  bodyFront(p, o, { mode: st.mode ?? "stand", phase: st.phase ?? 0, lift: 34, seed: st.seed ?? 500, expr: st.expr ?? "neutral", blink: st.blink ?? 0, look: st.look ?? 0, headTilt: st.headTilt ?? 0,
    armFn: armBlend(pose[0], pose[1], pose[2]),
    front: (c) => {
      if (ex.includes("sari")) sariDrape(p, c, st.sari ?? "#e8a21e");
      if (ex.includes("tie")) tie(p, c);
      if (ex.includes("necklace")) necklace(p, c, 1);
      if (ex.includes("garland")) marigold(p, c);
      const [hx, hy] = handsMid(c), u = c.u;
      if (ex.includes("dhol")) { p.poly([[hx - 46 * u, hy - 22 * u], [hx + 46 * u, hy - 22 * u], [hx + 46 * u, hy + 22 * u], [hx - 46 * u, hy + 22 * u]], "#b8322c", 2.5 * u);
        p.line([[hx - 40 * u, hy - 18 * u], [hx - 24 * u, hy + 18 * u], [hx - 8 * u, hy - 18 * u], [hx + 8 * u, hy + 18 * u], [hx + 24 * u, hy - 18 * u], [hx + 40 * u, hy + 18 * u]], "#f2ecdf", 2 * u, false);
        p.ell(hx - 46 * u, hy, 8 * u, 24 * u, "#f2e8d0", 2.5 * u); p.ell(hx + 46 * u, hy, 8 * u, 24 * u, "#f2e8d0", 2.5 * u); }
      if (ex.includes("horn")) { p.line([[hx - 4 * u, hy - 30 * u], [hx + 30 * u, hy - 4 * u]], GOLDC[1], 5 * u); p.ell(hx + 36 * u, hy + 2 * u, 12 * u, 14 * u, GOLDC[1], 2 * u, 0, 360, 40); }
      if (ex.includes("bar")) goldBar(p, hx, hy - 4 * u, 1.3 * u);
      if (ex.includes("bag")) { p.poly([[hx - 26 * u, hy + 22 * u], [hx + 26 * u, hy + 22 * u], [hx + 20 * u, hy - 14 * u], [hx + 8 * u, hy - 22 * u], [hx - 8 * u, hy - 22 * u], [hx - 20 * u, hy - 14 * u]], "#c8a46a", 2.5 * u);
        p.stroke([[hx - 9 * u, hy - 20 * u], [hx + 9 * u, hy - 20 * u]], 3 * u, "#7a5a2a"); txt(p.g, "रु", hx, hy + 6 * u, 22 * u, "#5a3a10"); }
      if (ex.includes("bagHand") && c.arms[1]) { const [bx, by0] = c.arms[1].pts[2], by = by0 + 18 * u;
        p.poly([[bx - 26 * u, by + 22 * u], [bx + 26 * u, by + 22 * u], [bx + 20 * u, by - 14 * u], [bx + 8 * u, by - 22 * u], [bx - 8 * u, by - 22 * u], [bx - 20 * u, by - 14 * u]], "#c8a46a", 2.5 * u);
        p.stroke([[bx - 9 * u, by - 20 * u], [bx + 9 * u, by - 20 * u]], 3 * u, "#7a5a2a"); txt(p.g, "रु", bx, by + 6 * u, 22 * u, "#5a3a10"); }
      if (ex.includes("coinbox")) { p.poly([[hx - 30 * u, hy - 16 * u], [hx + 30 * u, hy - 16 * u], [hx + 30 * u, hy + 14 * u], [hx - 30 * u, hy + 14 * u]], "#8a2a3a", 2.5 * u);
        for (let i = 0; i < 3; i++) p.ell(hx - 14 * u + i * 14 * u, hy - 18 * u, 8 * u, 4 * u, GOLDC[1], 1.6 * u); }
      if (ex.includes("necklaceHand")) { p.arc(hx, hy + 2 * u, 26 * u, 22 * u, 10, 170, 3 * u, GOLDC[2]);
        for (let i = 0; i <= 8; i++) { const a = (10 + 20 * i) * Math.PI / 180; p.ell(hx + 26 * u * Math.cos(a), hy + 2 * u + 22 * u * Math.sin(a), 3.6 * u, 3.6 * u, GOLDC[1], 1.2 * u); }
        p.ell(hx, hy + 27 * u, 7 * u, 8 * u, GOLDC[1], 1.6 * u); }
      if (st.phone && c.arms[1]) { const [px, py] = c.arms[1].pts[2];
        p.poly([[px - 13 * u, py - 32 * u], [px + 13 * u, py - 32 * u], [px + 13 * u, py + 6 * u], [px - 13 * u, py + 6 * u]], "#22222c", 2.5 * u);
        p.poly([[px - 9 * u, py - 28 * u], [px + 9 * u, py - 28 * u], [px + 9 * u, py + 2 * u], [px - 9 * u, py + 2 * u]], "#8fd4ff", 0); p.dot(px, py, 5.5 * u); }
    },
    headExtra: (c) => {
      if (st.bun) p.ell(c.cx + 0.42 * c.W, c.hc - 0.25 * c.HH, 22 * c.u, 20 * c.u, o.hair, 3 * c.u);
      if (st.topi) topi(p, c, st.topi);
      if (ex.includes("veil")) p.poly([[c.cx - 0.62 * c.W, c.hc + 0.1 * c.HH], [c.cx - 0.5 * c.W, c.crown - 0.04 * c.HH], [c.cx, c.crown - 0.12 * c.HH], [c.cx + 0.5 * c.W, c.crown - 0.04 * c.HH], [c.cx + 0.62 * c.W, c.hc + 0.1 * c.HH], [c.cx + 0.5 * c.W, c.crown + 0.12 * c.HH], [c.cx - 0.5 * c.W, c.crown + 0.12 * c.HH]], "rgba(214,40,50,0.92)", 2.5 * c.u);
      if (ex.includes("tika")) p.ell(c.cx, c.hc - 0.22 * c.HH, 3.5 * c.u, 5 * c.u, "#d0202a", 0);
      if (st.sweat) sweat(p, c, st.sweat);
    } });
};
// outfits
export const OUT = {
  keeper: { jacket: "#f2ecdf", pants: "#3a3f52", boots: "#3a2a22", skin: "#d9a57a", hat: "hair", hair: "#2a2424", moustache: "#2a1d18", build: "stout" },
  buyer: { jacket: "#3a6a8a", pants: "#2b2b38", boots: "#3a2a22", skin: "#e8b98e", hat: "hair", hair: "#1a1414" },
  mother: { jacket: "#2f7a5a", dress: "#2f7a5a", pants: "#2b2b38", boots: "#5a3b2a", skin: "#d9a57a", hat: "hair", hair: "#4a4040" },
  bride: { jacket: "#c8202e", dress: "#c8202e", pants: "#2b2b38", boots: "#5a3b2a", skin: "#f0c49c", hat: "hair", hair: "#1a1414" },
  sari1: { jacket: "#d0263a", dress: "#d0263a", pants: "#2b2b38", boots: "#5a3b2a", skin: "#e8b98e", hat: "hair", hair: "#1a1414" },
  sari2: { jacket: "#b8205e", dress: "#b8205e", pants: "#2b2b38", boots: "#5a3b2a", skin: "#c99067", hat: "hair", hair: "#1a1414" },
  band: { jacket: "#c8302e", pants: "#f2ecdf", boots: "#2a2024", skin: "#d9a57a", hat: "hair", hair: "#1a1414", buttons: "#e8c45a" },
  dhol: { jacket: "#f2ecdf", pants: "#f2ecdf", boots: "#3a2a22", skin: "#c99067", hat: "hair", hair: "#1a1414", moustache: "#2a1d18" },
  groom: { jacket: "#e8d8b0", pants: "#e8d8b0", boots: "#5a3b2a", skin: "#e8b98e", hat: "hair", hair: "#1a1414", buttons: "#c8a040" },
  suit: { jacket: "#2b2f3a", pants: "#2b2f3a", boots: "#1a1a20", skin: "#f0c49c", hat: "hair", hair: "#3a3030" },
  suit2: { jacket: "#3a3442", pants: "#3a3442", boots: "#1a1a20", skin: "#c99067", hat: "hair", hair: "#1a1414" },
  friendA: { jacket: "#2f6fb0", pants: "#34496e", boots: "#3a2a22", skin: "#e8b98e", hat: "hair", hair: "#1a1414" },
  friendB: { jacket: "#e07b2a", pants: "#3a3f52", boots: "#3a2a22", skin: "#d9a57a", hat: "hair", hair: "#1a1414" },
};
/** procession member i (cycled): returns [outfit, st extras] */
export const PROC = [
  [OUT.dhol, { pose: ["hold", "hold", 1], extra: ["dhol"], topi: "#2f3f6a", seed: 610 }],
  [OUT.band, { pose: ["hold", "hold", 1], extra: ["horn"], seed: 611 }],
  [OUT.sari1, { extra: ["sari", "garland"], bun: true, seed: 612, sari: "#e8a21e" }],
  [OUT.groom, { extra: ["garland", "tika"], topi: "#7a2f52", seed: 613 }],
  [OUT.band, { pose: ["hold", "hold", 1], extra: ["horn"], seed: 614 }],
  [OUT.sari2, { extra: ["sari", "garland"], bun: true, seed: 615, sari: "#f2c84a" }],
];

// ---------- the price board (1000 x 760) ----------
const OLD = "२,५७,६००", NEW = "२,४५,४००";
/** st: { flip 0..1 (old -> new, split-flap per digit), arrow 0..1 (slam), dip } */
export const drawPriceBoard = (p, st = {}) => {
  const g = p.g, flip = st.flip ?? 1, arrow = st.arrow ?? 0;
  p.poly([[0, 0], [1000, 0], [1000, 760], [0, 760]], "#6a4428", 0);
  p.poly([[26, 26], [974, 26], [974, 734], [26, 734]], "#1f1a22", 7);
  p.poly([[26, 26], [974, 26], [974, 150], [26, 150]], "#8a1e26", 7);
  txt(g, "आजको सुनको भाउ", 500, 92, 72, "#ffe9a8");
  txt(g, "छापावाल · प्रति तोला", 500, 212, 52, "rgba(240,232,214,0.85)");
  // split-flap tiles, the whole row (रु. + digits) centred on the board
  const chars = [...NEW], olds = [...OLD], n = chars.length, tw = 100, cw = 34, gap = 8, th = 190, y0 = 290, rw = 92;
  const widths = chars.map((c) => (c === "," ? cw : tw)), total = rw + widths.reduce((s, w) => s + w + gap, 0) - gap;
  let x = 500 - total / 2;
  txt(g, "रु.", x + rw / 2 - 6, y0 + th / 2 + 6, 66, "#f2e8d0"); x += rw;
  for (let i = 0; i < n; i++) {
    if (chars[i] === ",") { txt(g, ",", x + cw / 2, y0 + th * 0.8, 86, "#f2e8d0"); x += cw + gap; continue; }
    const ki = clamp(flip * 1.5 - (i / n) * 0.5, 0, 1), change = chars[i] !== olds[i];
    const showNew = !change || ki >= 0.5, sq = change ? Math.abs(1 - 2 * ki) : 1;
    p.poly([[x, y0], [x + tw, y0], [x + tw, y0 + th], [x, y0 + th]], "#2e2a32", 4);
    g.save(); g.translate(x + tw / 2, y0 + th / 2); g.scale(1, Math.max(0.04, sq)); txt(g, showNew ? chars[i] : olds[i], 0, 8, 146, showNew && change && flip > 0.02 ? "#ff6a4a" : "#ffe9a8"); g.restore();
    p.stroke([[x + 4, y0 + th / 2], [x + tw - 4, y0 + th / 2]], 4, "rgba(0,0,0,0.6)");
    x += tw + gap;
  }
  txt(g, "मंसिर ४, २०८३", 500, 590, 50, "rgba(240,232,214,0.72)");
  // the red down-arrow slams in at the right of the date line
  if (arrow > 0) { const a = Math.min(1, arrow), yo = (1 - a) * -240, sc = arrow > 1 ? 1 + 0.08 * (arrow - 1) : 1;
    g.save(); g.translate(845, 600 + yo); g.scale(0.6 * sc, 0.6 * sc);
    p.poly([[-38, -170], [38, -170], [38, -10], [86, -10], [0, 90], [-86, -10], [-38, -10]], "#e0302a", 8); g.restore(); }
};
/** "माग ↑" demand arrow (400 x 420) */
export const drawDemand = (p) => {
  p.poly([[110, 410], [290, 410], [290, 200], [370, 200], [200, 20], [30, 200], [110, 200]], "#2fae5a", 9);
  txt(p.g, "माग", 200, 318, 76, "#ffffff");
};

// ---------- the chalkboard chart (1000 x 900). k: line draws to today ----------
export const drawGoldChart = (p, k = 1) => {
  const g = p.g, chalk = "rgba(245,245,235,0.95)";
  p.poly([[0, 0], [1000, 0], [1000, 900], [0, 900]], "#8a5a32", 0);
  p.poly([[30, 30], [970, 30], [970, 870], [30, 870]], "#26392f", 6);
  txt(g, "सुन / तोला", 950, 92, 52, "rgba(245,245,235,0.75)", "right");
  const X0 = 110, X1 = 900, Y0 = 760, yv = (v) => Y0 - (v - 150000) / (360000 - 150000) * 560;
  p.stroke([[X0, 170], [X0, Y0], [X1 + 20, Y0]], 5, "rgba(245,245,235,0.6)");
  // schematic path: rise into the Magh peak, then a bumpy slide to today (only the two labelled points are data)
  const pts = [[X0, yv(205000)], [190, yv(240000)], [255, yv(339300)], [330, yv(286600)], [420, yv(300000)], [520, yv(275000)], [620, yv(285000)], [720, yv(268000)], [810, yv(257600)], [870, yv(245400)]];
  const N = pts.length - 1, upto = k * N, cut = []; for (let i = 0; i <= N; i++) { if (i <= upto) cut.push(pts[i]); else { const a = pts[i - 1], b = pts[i], t = upto - (i - 1); cut.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); break; } }
  // shaded drop (peak level down to the line), after the peak
  if (k > 0.25) { const sh = cut.filter((q) => q[0] >= 255); if (sh.length > 1) { const yP = yv(339300); p.poly([[255, yP], ...sh, [sh[sh.length - 1][0], yP]], "rgba(224,60,50,0.28)", 0);
    g.save(); g.setLineDash([14, 12]); p.stroke([[255, yP], [sh[sh.length - 1][0], yP]], 4, "rgba(245,245,235,0.55)"); g.restore(); } }
  p.stroke(cut, 10, "#ffcf4a");
  // peak flag
  const pk = [255, yv(339300)]; p.dot(pk[0], pk[1], 13, "#ffcf4a");
  p.stroke([[pk[0], pk[1]], [pk[0], pk[1] - 70]], 5, chalk); p.poly([[pk[0], pk[1] - 70], [pk[0] + 70, pk[1] - 56], [pk[0], pk[1] - 42]], "#e0302a", 3);
  txt(g, "३,३९,३००", pk[0] + 200, pk[1] - 50, 58, "#ffe9a8");
  txt(g, "माघ", pk[0], Y0 + 50, 50, chalk);
  if (k > 0.97) { const e = pts[N]; p.dot(e[0], e[1], 15, "#ff6a4a"); txt(g, "२,४५,४००", e[0] - 30, e[1] + 70, 58, "#ff8a6a"); }
  txt(g, "आज", 870, Y0 + 50, 50, chalk);
};

// ---------- globe (1000 x 1000). r 0..1 turns Nepal -> America; th 0..1 thread; us 0..1 skyline pop ----------
const landBlob = (p, cx, cy, rx, ry, seed, col) => { const pts = []; for (let i = 0; i < 40; i++) { const a = (i / 40) * Math.PI * 2, w = 1 + 0.18 * Math.sin(a * 3 + seed) + 0.1 * Math.sin(a * 5 + seed * 2); pts.push([cx + rx * w * Math.cos(a), cy + ry * w * Math.sin(a)]); } p.poly(pts, col, 0); };
export const drawGlobe = (p, st = {}) => {
  const g = p.g, r = st.r ?? 0, th = st.th ?? 0, us = st.us ?? 0, C = [500, 520], R = 400;
  const halo = g.createRadialGradient(C[0], C[1], R * 0.9, C[0], C[1], R * 1.2); halo.addColorStop(0, "rgba(120,190,255,0.35)"); halo.addColorStop(1, "rgba(120,190,255,0)"); g.fillStyle = halo; g.fillRect(0, 0, 1000, 1000);
  const disc = []; for (let i = 0; i < 72; i++) { const a = (i / 72) * Math.PI * 2; disc.push([C[0] + R * Math.cos(a), C[1] + R * Math.sin(a)]); }
  const oc = g.createRadialGradient(C[0] - 140, C[1] - 160, 40, C[0], C[1], R); oc.addColorStop(0, "#5fb0e8"); oc.addColorStop(1, "#1f5a9a");
  p.path(disc, true); g.fillStyle = oc; g.fill();
  // longitude position -> x on the disc (orthographic): lon in radians relative to the view centre
  const proj = (lon, lat) => [C[0] + R * Math.cos(lat) * Math.sin(lon), C[1] - R * Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
  const view = 0.05 + r * 0.95; // radians the globe has turned
  const pins = {};
  p.clip(disc, () => {
    const land = [[0.0, 0.42, 1.0, 0.5, 1], [-0.55, 0.3, 0.45, 0.35, 2], [0.35, -0.05, 0.4, 0.3, 3], [1.95, 0.5, 0.75, 0.45, 4], [2.25, -0.25, 0.35, 0.55, 5], [-1.2, -0.35, 0.4, 0.4, 6]];
    for (const [lon, lat, w, h, s] of land) { const [x, y, z] = proj(lon - view, lat); if (z < -0.1) continue; landBlob(p, x, y, R * w * 0.55 * Math.max(0.15, z), R * h * 0.55, s, "#5aa04a"); }
    for (let i = -3; i <= 3; i++) { const lon = i * 0.5 - (view % 0.5); const pts = []; for (let j = -10; j <= 10; j++) { const q = proj(lon, j * 0.15); if (q[2] > 0) pts.push([q[0], q[1]]); } if (pts.length > 1) p.stroke(pts, 2, "rgba(255,255,255,0.14)"); }
  });
  p.ell(C[0], C[1], R, R, null, 8);
  // Nepal (lon 0 in our frame) and the USA (lon 1.95)
  const np = proj(0.05 - view, 0.36), am = proj(1.9 - view, 0.52);
  if (np[2] > 0.05) pins.np = np; if (am[2] > 0.05) pins.am = am;
  if (pins.np && pins.am && th > 0) { const a = pins.np, b = pins.am, n = 30, pts = [];
    for (let i = 0; i <= n * th; i++) { const t = i / n; pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - 230 * Math.sin(Math.PI * t)]); }
    if (pts.length > 1) { p.stroke(pts, 12, "rgba(255,220,120,0.4)"); p.stroke(pts, 5, "#ffd24a"); } }
  const pin = (q, label, col) => { p.stroke([[q[0], q[1]], [q[0], q[1] - 60]], 6, INK); p.ell(q[0], q[1] - 70, 22, 22, col, 5); txt(g, label, q[0], q[1] - 130, 56, "#ffffff", "center", "#14243a", 10); };
  if (pins.am && us > 0) { const k = Math.min(1, us), x = pins.am[0] - 10, y = pins.am[1] - 96;
    g.save(); g.translate(x, y); g.scale(0.62, 0.62 * k);
    for (const [dx, w, h] of [[-90, 40, 120], [-46, 36, 190], [-6, 44, 150], [42, 30, 230], [76, 40, 130]]) p.poly([[dx, 0], [dx + w, 0], [dx + w, -h], [dx, -h]], "#3a4a6a", 5);
    g.restore(); }
  if (pins.np) pin(pins.np, "नेपाल", "#e0302a");
  if (pins.am && us > 0) { const q = pins.am; p.stroke([[q[0], q[1]], [q[0], q[1] - 40]], 6, INK); p.ell(q[0], q[1] - 46, 18, 18, "#2f6fb0", 5);
    if (us > 0.3) txt(g, "USA", q[0], q[1] + 52, 60, "#ffffff", "center", "#14243a", 12); }
  // a pulse of light travelling along the thread
  if (pins.np && pins.am && th >= 1 && st.ph != null) { const a = pins.np, b = pins.am, t = st.ph;
    const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t - 230 * Math.sin(Math.PI * t);
    const gr = g.createRadialGradient(x, y, 0, x, y, 40); gr.addColorStop(0, "rgba(255,240,170,0.95)"); gr.addColorStop(1, "rgba(255,210,80,0)"); g.fillStyle = gr; g.fillRect(x - 40, y - 40, 80, 80); }
};

// ---------- the seesaw (1000 x 800). t: -1..1 (1 = "%" side up, gold side down) ----------
export const drawSeesaw = (p, st = {}) => {
  const g = p.g, t = st.t ?? 0, bars = st.bars ?? 6, ang = 0.26 * t, pv = [500, 600];
  p.poly([[430, 760], [570, 760], [500, 600]], "#8a6a4a", 7);
  g.save(); g.translate(pv[0], pv[1]); g.rotate(ang);
  p.poly([[-430, -16], [430, -16], [430, 16], [-430, 16]], "#c08a52", 7);
  // left: the big "%" block (ब्याजदर)
  p.poly([[-420, -16], [-250, -16], [-250, -186], [-420, -186]], "#2f6fb0", 7);
  txt(g, "%", -335, -110, 150, "#ffffff", "center", "#14305a", 10);
  // right: the gold pile
  const slots = [[260, -26], [320, -26], [380, -26], [290, -52], [350, -52], [320, -78]];
  for (let i = 0; i < Math.min(bars, slots.length); i++) goldBar(p, slots[i][0], slots[i][1] - 2, 1.15);
  g.restore();
  // labels follow the ends
  const L = [pv[0] - 335 * Math.cos(ang), pv[1] - 335 * Math.sin(ang) - 210], Rr = [pv[0] + 320 * Math.cos(ang), pv[1] + 320 * Math.sin(ang) - 150];
  txt(g, "ब्याजदर", L[0], L[1] - 50, 58, "#ffffff", "center", "#14243a", 10);
  txt(g, "सुन", Rr[0], Rr[1] - 20, 58, "#ffffff", "center", "#14243a", 10);
};
/** generic bank vault (700 x 800): columns, a "%" in the pediment, a "ब्याज" banner, round vault door */
export const drawVault = (p, open = 0) => {
  const g = p.g;
  p.poly([[60, 220], [350, 60], [640, 220]], "#e8e0cc", 7);
  txt(g, "%", 350, 165, 100, "#2f6fb0");
  p.poly([[50, 220], [650, 220], [650, 260], [50, 260]], "#d8cfb8", 6);
  for (let i = 0; i < 4; i++) { const x = 90 + i * 160; p.poly([[x, 260], [x + 40, 260], [x + 40, 700], [x, 700]], "#f2ecdf", 5); }
  p.poly([[40, 700], [660, 700], [660, 780], [40, 780]], "#cfc6ae", 6);
  p.ell(350, 520, 120, 120, "#8a9098", 8); p.ell(350, 520, 80, 80, "#a8aeb6", 5);
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + open * 2; p.stroke([[350, 520], [350 + 70 * Math.cos(a), 520 + 70 * Math.sin(a)]], 8, "#5a6068"); }
  p.ell(350, 520, 20, 20, "#5a6068", 4);
  p.poly([[160, 330], [540, 330], [540, 400], [160, 400]], "#2f6fb0", 5); txt(g, "ब्याज", 350, 368, 58, "#ffffff");
};
/** the gold bar character (800 x 640). tag 0..1 swings in; shrug 0..1 */
export const drawBarGuy = (p, st = {}) => {
  const g = p.g, tag = st.tag ?? 0, sh = st.shrug ?? 0, cx = 360, cy = 420;
  // arms (stick, shrug lifts the hands)
  for (const s of [-1, 1]) { const sx = cx + s * 210, sy = cy - 10, hx = cx + s * (300 + 20 * sh), hy = cy - 20 - 120 * sh;
    p.line([[sx, sy], [cx + s * 280, cy + 10 - 40 * sh], [hx, hy]], GOLDC[2], 14); p.ell(hx, hy, 20, 20, GOLDC[1], 6); }
  p.poly([[cx - 250, cy + 110], [cx + 250, cy + 110], [cx + 190, cy - 90], [cx - 190, cy - 90]], GOLDC[1], 9);
  p.poly([[cx - 190, cy - 90], [cx + 190, cy - 90], [cx + 150, cy - 140], [cx - 150, cy - 140]], GOLDC[0], 8);
  p.stroke([[cx - 160, cy - 50], [cx - 60, cy - 50]], 10, "rgba(255,255,255,0.8)");
  // face
  p.ell(cx - 70, cy + 10, 16, 22, INK, 0); p.ell(cx + 70, cy + 10, 16, 22, INK, 0);
  if (sh > 0.3) { p.arc(cx, cy + 75, 40, 10, 200, 340, 8); p.stroke([[cx - 100, cy - 40], [cx - 40, cy - 30]], 7); p.stroke([[cx + 100, cy - 40], [cx + 40, cy - 30]], 7); }
  else p.arc(cx, cy + 60, 34, 14, 20, 160, 8);
  // the "० ब्याज" tag on a string from the corner
  if (tag > 0) { const k = Math.min(1, tag), ang = (1 - k) * -1.2 + 0.12 * Math.sin(k * 6) * (1 - k);
    g.save(); g.translate(cx + 190, cy - 110); g.rotate(ang);
    p.stroke([[0, 0], [60, 90]], 5, INK);
    g.translate(60, 90); g.rotate(-0.15);
    p.poly([[-24, 0], [250, 0], [272, 60], [250, 120], [-24, 120]], "#fff6e0", 6); p.dot(-2, 60, 9, INK);
    txt(g, st.label ?? "शून्य ब्याज", 124, 64, st.label ? 64 : 54, "#c8281e"); g.restore(); }
};
/** coin slipping off (200 x 200) */
export const drawCoin = (p) => { p.ell(100, 100, 70, 70, GOLDC[1], 7); p.ell(100, 100, 46, 46, null, 4); txt(p.g, "रु", 100, 106, 54, GOLDC[2]); };
/** price tag (500 x 300). s 0..1 = smaller-and-green after the flip */
export const drawPriceTag = (p, k = 0) => {
  p.poly([[50, 30], [470, 30], [530, 150], [470, 270], [50, 270]], k > 0.5 ? "#dff6e4" : "#fff6e0", 7); p.dot(470, 150, 14, INK);
  if (k > 0.5) { txt(p.g, "सस्तो", 215, 152, 96, "#1f7a3a"); p.poly([[352, 82], [398, 82], [398, 160], [428, 160], [375, 222], [322, 160], [352, 160]], "#2fae5a", 5); }
  else txt(p.g, "महँगो", 250, 152, 96, "#b8281e");
};
/** sparkle burst (300 x 300) */
export const drawSpark = (p, t) => { for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r0 = 30 + 80 * t, r1 = r0 + 40 * (1 - t); p.stroke([[150 + r0 * Math.cos(a), 150 + r0 * Math.sin(a)], [150 + r1 * Math.cos(a), 150 + r1 * Math.sin(a)]], 9 * (1 - t) + 2, "#ffe27a"); } };

/** interest-rate gauge (800 x 1000). k 0..1 fill rises from 30% to 72%; fc 0..1 the dashed forecast line appears */
export const drawRateGauge = (p, st = {}) => {
  const g = p.g, k = st.k ?? 0, fc = st.fc ?? 0, X0 = 300, X1 = 500, T0 = 190, B0 = 800;
  p.poly([[40, 30], [760, 30], [760, 980], [40, 980]], "rgba(255,252,244,0.97)", 7);
  txt(g, "ब्याजदर", 400, 110, 78, "#1f3a6a");
  // tube + bulb
  p.poly([[X0, T0], [X1, T0], [X1, B0], [X0, B0]], "#eef2f6", 7);
  for (let i = 0; i <= 8; i++) { const y = B0 - 30 - i * 70; p.stroke([[X1, y], [X1 + (i % 2 ? 26 : 44), y]], 5, "#5a6a80"); }
  const lvl = 0.3 + 0.42 * k, yF = B0 - (B0 - T0) * lvl;
  p.poly([[X0 + 18, yF], [X1 - 18, yF], [X1 - 18, B0], [X0 + 18, B0]], "#2f6fb0", 0);
  p.ell(400, 880, 120, 90, "#2f6fb0", 7); txt(g, "%", 400, 888, 130, "#ffffff");
  // forecast: dashed line + "अनुमान"
  if (fc > 0) { const yT = B0 - (B0 - T0) * 0.72; g.save(); g.globalAlpha = Math.min(1, fc); g.setLineDash([22, 14]); p.stroke([[X0 - 70, yT], [X1 + 70, yT]], 7, "#e07b2a"); g.restore();
    g.save(); g.globalAlpha = Math.min(1, fc); txt(g, "अनुमान", 170, yT - 6, 52, "#a8470a"); g.restore(); }
  // green arrow rides the level
  if (k > 0.05) { const ay = yF + 10; g.save(); g.translate(650, ay); g.scale(0.7, 0.7);
    p.poly([[-40, 120], [40, 120], [40, 10], [90, 10], [0, -90], [-90, 10], [-40, 10]], "#2fae5a", 8); g.restore(); }
};
/** gold pile (700 x 640): n bars (0..10) + red price arrow */
export const drawGoldPile = (p, st = {}) => {
  const g = p.g, n = st.n ?? 10, ar = st.arrow ?? 0;
  const slots = []; for (let r = 0; r < 4; r++) for (let i = 0; i < 4 - r; i++) slots.push([140 + i * 140 + r * 70, 590 - r * 64]);
  for (let i = 0; i < Math.min(n, slots.length); i++) goldBar(p, slots[i][0], slots[i][1], 2.6);
  txt(g, "सुन", 350, 250, 90, "#7a4a0a");
  if (ar > 0) { const a = Math.min(1, ar); g.save(); g.translate(600, 200 - (1 - a) * 140); g.globalAlpha = a; g.scale(0.7, 0.7);
    p.poly([[-38, -170], [38, -170], [38, -10], [86, -10], [0, 90], [-86, -10], [-38, -10]], "#e0302a", 8); g.restore(); }
};
/** soft radial light (400 x 400) for additive glows */
export const drawSoftGlow = (p, col = "255,220,150", a = 0.8) => { const g = p.g, gr = g.createRadialGradient(200, 200, 0, 200, 200, 200);
  gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(0.45, `rgba(${col},${a * 0.35})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(0, 0, 400, 400); };
/** marigold petal (100 x 100) */
export const drawPetal = (p, v = 0) => { p.ell(50, 50, 30, 18, v % 2 ? "#f6b52a" : "#f2861e", 4, 0, 360, 25); };
// ================= "के सुन फेरि दुई लाखभन्दा तल झर्ला?" cast (appended after gold.js, same module scope) =================
// Generic only: no real bank names or logos, no flags. No buy/sell advice. Every forecast is marked "अनुमान".

const RED2 = "#e0302a", GREEN2 = "#2fae5a", CHALK2 = "rgba(245,245,235,0.95)";
const upArrow2 = (p, x, y, s, col) => p.poly([[x - 38 * s, y + 120 * s], [x + 38 * s, y + 120 * s], [x + 38 * s, y + 10 * s], [x + 88 * s, y + 10 * s], [x, y - 90 * s], [x - 88 * s, y + 10 * s], [x - 38 * s, y + 10 * s]], col, 8 * s);
const downArrow2 = (p, x, y, s, col) => p.poly([[x - 38 * s, y - 120 * s], [x + 38 * s, y - 120 * s], [x + 38 * s, y - 10 * s], [x + 88 * s, y - 10 * s], [x, y + 90 * s], [x - 88 * s, y - 10 * s], [x - 38 * s, y - 10 * s]], col, 8 * s);
const dashed2 = (p, pts, w, col, d = [22, 14]) => { p.g.save(); p.g.setLineDash(d); p.stroke(pts, w, col); p.g.restore(); };

// ---------- the price board v2 (1000 x 760) ----------
// st: { flip 0..1 (२,४५,४०० -> २,४२,६००), choice 0..1 (whole board flips to the "तल / माथि" card), hl 0 none / 1 तल / 2 माथि }
const OLD2 = "२,४५,४००", NEW2 = "२,४२,६००";
const boardPrice = (p, flip) => {
  const g = p.g;
  p.poly([[26, 26], [974, 26], [974, 734], [26, 734]], "#1f1a22", 7);
  p.poly([[26, 26], [974, 26], [974, 150], [26, 150]], "#8a1e26", 7);
  txt(g, "आजको सुनको भाउ", 500, 92, 72, "#ffe9a8");
  txt(g, "छापावाल · प्रति तोला", 500, 212, 52, "rgba(240,232,214,0.85)");
  const chars = [...NEW2], olds = [...OLD2], n = chars.length, tw = 100, cw = 34, gap = 8, th = 200, y0 = 300, rw = 92;
  const widths = chars.map((c) => (c === "," ? cw : tw)), total = rw + widths.reduce((s, w) => s + w + gap, 0) - gap;
  let x = 500 - total / 2;
  txt(g, "रु.", x + rw / 2 - 6, y0 + th / 2 + 6, 66, "#f2e8d0"); x += rw;
  for (let i = 0; i < n; i++) {
    if (chars[i] === ",") { txt(g, ",", x + cw / 2, y0 + th * 0.8, 86, "#f2e8d0"); x += cw + gap; continue; }
    const ki = clamp(flip * 1.5 - (i / n) * 0.5, 0, 1), change = chars[i] !== olds[i];
    const showNew = !change || ki >= 0.5, sq = change ? Math.abs(1 - 2 * ki) : 1;
    p.poly([[x, y0], [x + tw, y0], [x + tw, y0 + th], [x, y0 + th]], "#2e2a32", 4);
    g.save(); g.translate(x + tw / 2, y0 + th / 2); g.scale(1, Math.max(0.04, sq)); txt(g, showNew ? chars[i] : olds[i], 0, 8, 150, showNew && change && flip > 0.02 ? "#ff6a4a" : "#ffe9a8"); g.restore();
    p.stroke([[x + 4, y0 + th / 2], [x + tw - 4, y0 + th / 2]], 4, "rgba(0,0,0,0.6)");
    x += tw + gap;
  }
  // small "down today" marker under the digits
  txt(g, "आज  −२,८००", 500, 600, 54, "#ff8a6a");
};
const boardChoice = (p, hl) => {
  const g = p.g;
  p.poly([[26, 26], [974, 26], [974, 734], [26, 734]], "#1f1a22", 7);
  p.poly([[26, 26], [974, 26], [974, 150], [26, 150]], "#8a1e26", 7);
  txt(g, "तपाईंको अनुमान?", 500, 92, 70, "#ffe9a8");
  // two halves
  const half = (x0, lab, col, on, up) => {
    p.poly([[x0, 200], [x0 + 420, 200], [x0 + 420, 690], [x0, 690]], on ? (up ? "#1f6a3a" : "#8a2a26") : "#2e2a32", 5);
    if (on) { p.poly([[x0 - 6, 194], [x0 + 426, 194], [x0 + 426, 696], [x0 - 6, 696]], null, 0); g.save(); g.lineWidth = 12; g.strokeStyle = "#ffe27a"; g.strokeRect(x0 - 4, 196, 428, 498); g.restore(); }
    (up ? upArrow2 : downArrow2)(p, x0 + 210, 360, 0.95, col);
    txt(g, lab, x0 + 210, 600, 96, on ? "#ffffff" : "#f2e8d0");
  };
  half(60, "तल", RED2, hl === 1, false); half(520, "माथि", GREEN2, hl === 2, true);
  txt(g, "२ लाख", 500, 448, 44, "rgba(240,232,214,0.75)");
};
export const drawBoard2 = (p, st = {}) => {
  const g = p.g, flip = st.flip ?? 1, ch = st.choice ?? 0;
  p.poly([[0, 0], [1000, 0], [1000, 760], [0, 760]], "#6a4428", 0);
  const sq = Math.abs(1 - 2 * ch), face = ch < 0.5 ? 0 : 1;
  g.save(); g.translate(500, 380); g.scale(1, Math.max(0.03, sq)); g.translate(-500, -380);
  if (face === 0) boardPrice(p, flip); else boardChoice(p, st.hl ?? 0);
  g.restore();
};
/** chalk slate under the board (1000 x 300): the 2 lakh line */
export const drawGapSlate = (p, k = 1) => {
  const g = p.g;
  p.poly([[0, 40], [1000, 40], [1000, 280], [0, 280]], "#8a5a32", 0);
  p.poly([[16, 56], [984, 56], [984, 264], [16, 264]], "#26392f", 5);
  dashed2(p, [[60, 190], [60 + 600 * k, 190]], 9, CHALK2, [26, 16]);
  if (k > 0.6) { g.save(); g.globalAlpha = clamp((k - 0.6) / 0.3, 0, 1); txt(g, "२,००,०००", 830, 178, 80, "#ffe9a8"); g.restore(); }
  // the gap: a chalk double arrow up to the board
  p.stroke([[130, 172], [130, 78]], 7, CHALK2); p.stroke([[106, 102], [130, 72], [154, 102]], 7, CHALK2);
  txt(g, "?", 210, 128, 90, "#ffcf4a");
};
/** date tag on a string (420 x 300) */
export const drawDateTag = (p) => {
  const g = p.g;
  p.stroke([[210, 0], [210, 70]], 6, INK);
  p.poly([[40, 70], [380, 70], [380, 280], [40, 280]], "#fff6e0", 7); p.dot(210, 98, 12, INK);
  txt(g, "मंसिर ६", 210, 190, 92, "#8a1e26");
};

// ---------- thermometer (800 x 1000): sun / tola, today vs the 2 lakh line ----------
// st: { show 0..1 target line, red 0..1 the gap fills red and the level drains to the line, pct 0..1 the −१८% label }
export const drawThermo = (p, st = {}) => {
  const g = p.g, show = st.show ?? 1, red = st.red ?? 0, pct = st.pct ?? 0;
  p.poly([[30, 30], [770, 30], [770, 990], [30, 990]], "rgba(255,252,244,0.97)", 7);
  txt(g, "सुन / तोला", 400, 100, 70, "#7a4a0a");
  const X0 = 250, X1 = 370, T0 = 170, B0 = 760, yv = (v) => B0 - (v - 170000) / (260000 - 170000) * (B0 - T0);
  const yNow = yv(242600), yTgt = yv(200000), yLvl = yNow + (yTgt - yNow) * red;
  p.poly([[X0, T0], [X1, T0], [X1, B0], [X0, B0]], "#f4efe6", 7);
  // red ghost of the gap (what has to go)
  if (red > 0) { g.save(); g.globalAlpha = 0.85; p.poly([[X0 + 14, yNow], [X1 - 14, yNow], [X1 - 14, yLvl], [X0 + 14, yLvl]], "#f08070", 0); g.restore(); }
  p.poly([[X0 + 14, yLvl], [X1 - 14, yLvl], [X1 - 14, B0], [X0 + 14, B0]], GOLDC[1], 0);
  p.stroke([[X0 + 24, yLvl + 14], [X0 + 24, B0 - 10]], 8, "rgba(255,255,255,0.7)");
  p.ell(310, 820, 96, 82, GOLDC[1], 7); p.ell(285, 797, 26, 20, "rgba(255,255,255,0.7)", 0);
  p.poly([[X0, T0], [X1, T0], [X1, B0], [X0, B0]], null, 7);
  // today
  p.stroke([[X1, yNow], [X1 + 40, yNow]], 6, INK);
  txt(g, "आज २,४२,६००", X1 + 52, yNow, 50, "#5a3a10", "left");
  // the 2 lakh line (dashed2)
  if (show > 0) { g.save(); g.globalAlpha = Math.min(1, show); dashed2(p, [[X0 - 60, yTgt], [740, yTgt]], 7, "#e07b2a"); txt(g, "२,००,०००", X1 + 52, yTgt + 46, 50, "#a8470a", "left"); g.restore(); }
  // −१८% in the gap
  if (pct > 0) { const s = 0.6 + 0.4 * Math.min(1, pct); g.save(); g.globalAlpha = Math.min(1, pct * 1.5); g.translate(X1 + 190, (yNow + yTgt) / 2 + 6); g.scale(s, s);
    txt(g, "−१८%", 0, 0, 120, RED2); g.restore(); }
  txt(g, "अनुमान: डलर र भन्सार उस्तै", 400, 950, 42, "#6a5a48");
};

// ---------- calendar (700 x 820). page: 0 अक्टोबर -> 1 नोभेम्बर -> 2 डिसेम्बर (fractional = a page flying off); us 0..1 "अमेरिका" pin ----------
const MONTHS = ["अक्टोबर", "नोभेम्बर", "डिसेम्बर"];
const calPage = (p, i) => { const g = p.g;
  p.poly([[40, 110], [660, 110], [660, 790], [40, 790]], "#fffaf0", 7);
  p.poly([[40, 110], [660, 110], [660, 250], [40, 250]], i === 2 ? "#c8281e" : "#3a6a8a", 7);
  txt(g, MONTHS[i], 350, 186, 82, "#ffffff");
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { const x = 95 + c * 102, y = 300 + r * 110; p.poly([[x, y], [x + 76, y], [x + 76, y + 76], [x, y + 76]], "rgba(60,50,40,0.08)", 0); }
  txt(g, "२०२६", 350, 750, 44, "rgba(60,50,40,0.6)");
};
export const drawCalendar = (p, st = {}) => {
  const g = p.g, pg = clamp(st.page ?? 0, 0, 2), i = Math.floor(pg + 1e-6), fr = pg - i, us = st.us ?? 0, qk = st.q ?? 0;
  calPage(p, Math.min(2, i + (fr > 0 ? 1 : 0)));
  if (fr > 0 && i < 2) { g.save(); g.translate(350, 110); g.rotate(-1.6 * fr); g.translate(fr * 120, -fr * 260); g.globalAlpha = 1 - fr * 0.7; g.translate(-350, -110); calPage(p, i); g.restore(); }
  for (let k = 0; k < 7; k++) { const x = 90 + k * 86; p.ell(x, 108, 14, 30, null, 6); }
  if (qk > 0) { const s = Math.min(1, qk); g.save(); g.translate(350, 500); g.scale(s, s); g.rotate(-0.12); drawQ(p, 0, -20, 330, RED2); g.restore(); }
  if (us > 0) { g.save(); g.globalAlpha = Math.min(1, us); p.poly([[400, 30], [690, 30], [690, 100], [400, 100]], "#2f6fb0", 6); txt(g, "अमेरिका", 545, 68, 52, "#ffffff"); g.restore(); }
};

// ---------- interest gauge v2 (800 x 1000): "अमेरिकी ब्याजदर", dashed2 "अनुमान" line pointing to "डिसेम्बर" ----------
export const drawRateGauge2 = (p, st = {}) => {
  const g = p.g, k = st.k ?? 0, fc = st.fc ?? 0, X0 = 300, X1 = 500, T0 = 190, B0 = 800;
  p.poly([[40, 30], [760, 30], [760, 980], [40, 980]], "rgba(255,252,244,0.97)", 7);
  txt(g, "अमेरिकी ब्याजदर", 400, 110, 66, "#1f3a6a");
  p.poly([[X0, T0], [X1, T0], [X1, B0], [X0, B0]], "#eef2f6", 7);
  for (let i = 0; i <= 8; i++) { const y = B0 - 30 - i * 70; p.stroke([[X1, y], [X1 + (i % 2 ? 26 : 44), y]], 5, "#5a6a80"); }
  const lvl = 0.3 + 0.42 * k, yF = B0 - (B0 - T0) * lvl;
  p.poly([[X0 + 18, yF], [X1 - 18, yF], [X1 - 18, B0], [X0 + 18, B0]], "#2f6fb0", 0);
  p.ell(400, 880, 120, 90, "#2f6fb0", 7); txt(g, "%", 400, 888, 130, "#ffffff");
  if (fc > 0) { const yT = B0 - (B0 - T0) * 0.72; g.save(); g.globalAlpha = Math.min(1, fc); dashed2(p, [[X0 - 60, yT], [X1 + 60, yT]], 7, "#e07b2a");
    txt(g, "डिसेम्बर", 150, yT - 44, 46, "#a8470a"); txt(g, "अनुमान", 150, yT + 30, 42, "#a8470a"); g.restore(); }
  if (k > 0.05) { g.save(); g.translate(650, yF + 10); g.scale(0.7, 0.7); upArrow2(p, 0, 0, 1, GREEN2); g.restore(); }
};

// ---------- placard "२०२७ ↑" (500 x 640) ----------
export const drawSign = (p) => {
  const g = p.g;
  p.poly([[236, 330], [264, 330], [264, 640], [236, 640]], "#8a6a4a", 5);
  p.poly([[30, 40], [470, 40], [470, 360], [30, 360]], "#e8f6ea", 8);
  txt(g, "२०२७", 190, 210, 104, "#1f7a3a");
  g.save(); g.translate(395, 200); g.scale(0.62, 0.62); upArrow2(p, 0, 0, 1, GREEN2); g.restore();
};

// ---------- crystal ball on a stand (520 x 640). glow 0..1, num 0..1 shows "$6,000" ----------
export const drawCrystal = (p, st = {}) => {
  const g = p.g, gl = st.glow ?? 0.5, nm = st.num ?? 0, sw = st.sw ?? 0;
  const halo = g.createRadialGradient(260, 260, 60, 260, 260, 260); halo.addColorStop(0, `rgba(190,150,255,${0.55 * gl})`); halo.addColorStop(1, "rgba(190,150,255,0)"); g.fillStyle = halo; g.fillRect(0, 0, 520, 520);
  p.poly([[150, 560], [370, 560], [330, 460], [190, 460]], "#6a4a3a", 7);
  p.poly([[110, 630], [410, 630], [380, 560], [140, 560]], "#4a3428", 7);
  const gr = g.createRadialGradient(220, 210, 20, 260, 260, 190); gr.addColorStop(0, "#f4eaff"); gr.addColorStop(0.5, "#b89af0"); gr.addColorStop(1, "#5a3aa8");
  g.beginPath(); g.arc(260, 270, 185, 0, Math.PI * 2); g.fillStyle = gr; g.fill();
  for (let i = 0; i < 3; i++) { const a = sw + i * 2.1; p.arc(260, 270, 120 - i * 25, 70 - i * 15, (a * 57) % 360, (a * 57) % 360 + 140, 6, "rgba(255,255,255,0.45)"); }
  p.ell(260, 270, 185, 185, null, 8);
  p.ell(195, 190, 40, 26, "rgba(255,255,255,0.75)", 0, 0, 360, -30);
  if (nm > 0) { g.save(); g.globalAlpha = Math.min(1, nm); txt(g, "$6,000", 260, 285, 92, "#ffffff", "center", "#3a1a7a", 10); g.restore(); }
};

// ---------- the forecast chart (1000 x 900). fk 0..1 dashed2 forecast line; rk 0..1 the real line ----------
export const drawForecast = (p, st = {}) => {
  const g = p.g, fk = st.fk ?? 0, rk = st.rk ?? 0;
  p.poly([[0, 0], [1000, 0], [1000, 900], [0, 900]], "#8a5a32", 0);
  p.poly([[30, 30], [970, 30], [970, 870], [30, 870]], "#26392f", 6);
  txt(g, "सुन $ / औंस · २०२६", 80, 92, 46, "rgba(245,245,235,0.75)", "left");
  const X0 = 110, X1 = 900, Y0 = 760, yv = (v) => Y0 - (v - 3000) / (6600 - 3000) * 590, xm = (m) => X0 + (m / 12) * (X1 - X0);
  p.stroke([[X0, 150], [X0, Y0], [X1 + 20, Y0]], 5, "rgba(245,245,235,0.6)");
  txt(g, "जनवरी", X0 + 30, Y0 + 50, 42, CHALK2);
  const part = (pts, k) => { const N = pts.length - 1, upto = k * N, out = []; for (let i = 0; i <= N; i++) { if (i <= upto) out.push(pts[i]); else { const a = pts[i - 1], b = pts[i], t = upto - (i - 1); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); break; } } return out; };
  // forecast: dashed2 from the year start to $6,000 at the year end
  const F = [[xm(0), yv(4350)], [xm(12), yv(6000)]], FF = []; for (let i = 0; i <= 20; i++) { const t = i / 20; FF.push([F[0][0] + (F[1][0] - F[0][0]) * t, F[0][1] + (F[1][1] - F[0][1]) * t]); }
  if (fk > 0) { const c = part(FF, fk); dashed2(p, c, 8, "#bfa0ff", [24, 16]);
    if (fk > 0.97) { const e = FF[20]; p.stroke([[e[0], e[1]], [e[0], e[1] - 80]], 5, CHALK2); p.poly([[e[0], e[1] - 80], [e[0] - 76, e[1] - 64], [e[0], e[1] - 48]], "#bfa0ff", 3);
      txt(g, "$6,000", e[0] - 60, e[1] - 128, 60, "#e2d4ff"); } }
  // real (schematic shape; only the end point is labelled): record in late January, then a long slide to today
  const R = [[xm(0), yv(4350)], [xm(0.6), yv(4900)], [xm(0.92), yv(5589)], [xm(1.6), yv(4900)], [xm(3), yv(5100)], [xm(4.5), yv(4700)], [xm(6), yv(4850)], [xm(7.5), yv(4300)], [xm(9), yv(4200)], [xm(10.2), yv(3800)], [xm(10.65), yv(3538)]];
  if (rk > 0) { const c = part(R, rk); p.stroke(c, 10, "#ffcf4a");
    if (rk > 0.98) { const e = R[R.length - 1]; p.dot(e[0], e[1], 16, "#ff6a4a"); txt(g, "$3,538", e[0] + 40, e[1] - 70, 60, "#ff8a6a"); } }
};

/** big "?" (500 x 640) with a soft glow */
export const drawBigQ = (p, col = "#ffcf4a") => { const g = p.g, gr = g.createRadialGradient(250, 330, 30, 250, 330, 250); gr.addColorStop(0, "rgba(255,220,120,0.5)"); gr.addColorStop(1, "rgba(255,220,120,0)"); g.fillStyle = gr; g.fillRect(0, 0, 500, 640); drawQ(p, 250, 300, 520, col); };
/** comment bubble (360 x 300) */
export const drawComment = (p) => { const g = p.g;
  p.poly([[30, 30], [330, 30], [330, 210], [130, 210], [70, 280], [86, 210], [30, 210]], "#ffffff", 8);
  for (let i = 0; i < 3; i++) p.dot(110 + i * 70, 120, 18, "#8a1e26"); };
// ================= "सुन अहिले किन्ने कि पर्खने?" cast (appended after gold2.js, same module scope) =================
// Generic only: no real bank names or logos. No buy/wait advice, no forecast from us. The current price is shown
// only as "−२४%" vs the record (the 19 Nov 2026 report), never as a figure.

const RED3 = "#e0302a", CHALK3 = "rgba(245,245,235,0.95)";
const dashed3 = (p, pts, w, col, d = [22, 14]) => { p.g.save(); p.g.setLineDash(d); p.stroke(pts, w, col); p.g.restore(); };
const DIG3 = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"], REC3 = "३,३९,३००";

// ---------- split-flap price board (1000 x 760) ----------
// st: { t spin clock (frames), settle 0..1 (digits land left to right on the record ३,३९,३००) }
export const drawBoard3 = (p, st = {}) => {
  const g = p.g, t = st.t ?? 0, settle = st.settle ?? 0;
  p.poly([[0, 0], [1000, 0], [1000, 760], [0, 760]], "#6a4428", 0);
  p.poly([[26, 26], [974, 26], [974, 734], [26, 734]], "#1f1a22", 7);
  p.poly([[26, 26], [974, 26], [974, 150], [26, 150]], "#8a1e26", 7);
  txt(g, "सुनको भाउ", 500, 92, 74, "#ffe9a8");
  txt(g, "छापावाल · प्रति तोला", 500, 212, 52, "rgba(240,232,214,0.85)");
  const chars = [...REC3], n = chars.length, tw = 100, cw = 34, gap = 8, th = 200, y0 = 300, rw = 92;
  const widths = chars.map((c) => (c === "," ? cw : tw)), total = rw + widths.reduce((s, w) => s + w + gap, 0) - gap;
  let x = 500 - total / 2, di = 0;
  txt(g, "रु.", x + rw / 2 - 6, y0 + th / 2 + 6, 66, "#f2e8d0"); x += rw;
  for (let i = 0; i < n; i++) {
    if (chars[i] === ",") { txt(g, ",", x + cw / 2, y0 + th * 0.8, 86, "#f2e8d0"); x += cw + gap; continue; }
    const ki = clamp(settle * 1.6 - (i / n) * 0.6, 0, 1);
    let ch, sq;
    if (ki >= 1) { ch = chars[i]; sq = 1; }
    else { const ph = t * (0.21 + 0.03 * di) + di * 0.37, fr = ph - Math.floor(ph); ch = DIG3[(((Math.floor(ph) * 7 + di * 3) % 10) + 10) % 10]; sq = Math.abs(1 - 2 * fr) * 0.85 + 0.15;
      if (ki > 0) { ch = ki > 0.5 ? chars[i] : ch; sq = Math.abs(1 - 2 * ki); } }
    p.poly([[x, y0], [x + tw, y0], [x + tw, y0 + th], [x, y0 + th]], "#2e2a32", 4);
    g.save(); g.translate(x + tw / 2, y0 + th / 2); g.scale(1, Math.max(0.04, sq)); txt(g, ch, 0, 8, 150, ki >= 1 ? "#ffe27a" : "#ffe9a8"); g.restore();
    p.stroke([[x + 4, y0 + th / 2], [x + tw - 4, y0 + th / 2]], 4, "rgba(0,0,0,0.6)");
    x += tw + gap; di++;
  }
};
/** chalk slate under the board (1000 x 300): a chalk line and a "?" (no numbers) */
export const drawSlate3 = (p) => {
  const g = p.g;
  p.poly([[0, 40], [1000, 40], [1000, 280], [0, 280]], "#8a5a32", 0);
  p.poly([[16, 56], [984, 56], [984, 264], [16, 264]], "#26392f", 5);
  dashed3(p, [[60, 190], [760, 190]], 9, CHALK3, [26, 16]);
  p.stroke([[130, 172], [130, 78]], 7, CHALK3); p.stroke([[106, 102], [130, 72], [154, 102]], 7, CHALK3);
  p.stroke([[300, 82], [300, 172]], 7, CHALK3); p.stroke([[276, 148], [300, 178], [324, 148]], 7, CHALK3);
  txt(g, "?", 870, 150, 130, "#ffcf4a");
};
/** a tag on a string (420 x 300) */
export const drawTag3 = (p, label = "रेकर्ड") => {
  const g = p.g;
  p.stroke([[210, 0], [210, 70]], 6, INK);
  p.poly([[30, 70], [390, 70], [390, 280], [30, 280]], "#fff6e0", 7); p.dot(210, 98, 12, INK);
  txt(g, label, 210, 192, 92, "#8a1e26");
};

// ---------- thermometer (800 x 1000): the record at the top, the latest report about 24% lower ----------
// st: { mark 0..1 the "पछिल्लो रिपोर्ट" line, drain 0..1 the level falls to it, pct 0..1 the −२४% label }
export const drawThermo3 = (p, st = {}) => {
  const g = p.g, mark = st.mark ?? 0, drain = st.drain ?? 0, pct = st.pct ?? 0;
  p.poly([[30, 30], [770, 30], [770, 990], [30, 990]], "rgba(255,252,244,0.97)", 7);
  txt(g, "सुन / तोला", 400, 100, 70, "#7a4a0a");
  const X0 = 190, X1 = 310, T0 = 170, B0 = 760, yv = (v) => B0 - (v - 160000) / (360000 - 160000) * (B0 - T0);
  const yRec = yv(339300), yNow = yv(339300 * (1 - 0.2408)), yLvl = yRec + (yNow - yRec) * drain;
  p.poly([[X0, T0], [X1, T0], [X1, B0], [X0, B0]], "#f4efe6", 7);
  if (drain > 0) { g.save(); g.globalAlpha = 0.85; p.poly([[X0 + 14, yRec], [X1 - 14, yRec], [X1 - 14, yLvl], [X0 + 14, yLvl]], "#f08070", 0); g.restore(); }
  p.poly([[X0 + 14, yLvl], [X1 - 14, yLvl], [X1 - 14, B0], [X0 + 14, B0]], GOLDC[1], 0);
  p.stroke([[X0 + 24, yLvl + 14], [X0 + 24, B0 - 10]], 8, "rgba(255,255,255,0.7)");
  p.ell(250, 820, 96, 82, GOLDC[1], 7); p.ell(225, 797, 26, 20, "rgba(255,255,255,0.7)", 0);
  p.poly([[X0, T0], [X1, T0], [X1, B0], [X0, B0]], null, 7);
  // the record
  p.stroke([[X1, yRec], [X1 + 40, yRec]], 6, INK);
  txt(g, "रेकर्ड", X1 + 54, yRec - 30, 50, "#5a3a10", "left");
  txt(g, "३,३९,३००", X1 + 54, yRec + 30, 54, "#5a3a10", "left");
  // the latest report (no figure, only the drop)
  if (mark > 0) { g.save(); g.globalAlpha = Math.min(1, mark); dashed3(p, [[X0 - 50, yNow], [740, yNow]], 7, "#e07b2a"); txt(g, "पछिल्लो रिपोर्ट", X1 + 54, yNow + 46, 46, "#a8470a", "left"); g.restore(); }
  if (pct > 0) { const s = 0.6 + 0.4 * Math.min(1, pct); g.save(); g.globalAlpha = Math.min(1, pct * 1.5); g.translate(X1 + 220, (yRec + yNow) / 2 + 10); g.scale(s, s);
    txt(g, "−२४%", 0, 0, 120, RED3); g.restore(); }
};

// ---------- chalk chart of what comes next (1000 x 900) ----------
// st: { rk 0..1 the past (solid), dot 0..1 "अहिले" point, up 0..1 dashed path up, dn 0..1 dashed path down, qk 0..1 "?" }
export const drawNext3 = (p, st = {}) => {
  const g = p.g, rk = st.rk ?? 0, dot = st.dot ?? 0, up = st.up ?? 0, dn = st.dn ?? 0, qk = st.qk ?? 0;
  p.poly([[0, 0], [1000, 0], [1000, 900], [0, 900]], "#8a5a32", 0);
  p.poly([[30, 30], [970, 30], [970, 870], [30, 870]], "#26392f", 6);
  txt(g, "सुनको भाउ", 80, 92, 48, "rgba(245,245,235,0.75)", "left");
  p.stroke([[100, 150], [100, 780], [930, 780]], 5, "rgba(245,245,235,0.55)");
  const part = (pts, k) => { const N = pts.length - 1, upto = k * N, out = []; for (let i = 0; i <= N; i++) { if (i <= upto) out.push(pts[i]); else { const a = pts[i - 1], b = pts[i], t = upto - (i - 1); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); break; } } return out; };
  const curve = (a, c, b, n = 24) => { const o = []; for (let i = 0; i <= n; i++) { const t = i / n; o.push([(1 - t) ** 2 * a[0] + 2 * t * (1 - t) * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * t * (1 - t) * c[1] + t * t * b[1]]); } return o; };
  const NOW = [540, 560];
  const R = [[120, 560], [170, 470], [215, 330], [250, 210], [290, 280], [330, 260], [370, 360], [410, 340], [450, 450], [490, 430], [NOW[0], NOW[1]]];
  if (rk > 0) p.stroke(part(R, rk), 10, "#ffcf4a");
  if (dot > 0) { const r = 16 + 10 * Math.max(0, Math.sin(dot * Math.PI)); p.dot(NOW[0], NOW[1], r, "#ff6a4a"); g.save(); g.globalAlpha = Math.min(1, dot * 2); txt(g, "अहिले", NOW[0] - 10, NOW[1] + 70, 48, CHALK3); g.restore(); }
  const Q = [840, 470];
  if (up > 0) dashed3(p, part(curve([NOW[0] + 16, NOW[1] - 10], [650, 420], [Q[0] - 60, 250]), up), 8, "#9fe0a8", [22, 14]);
  if (dn > 0) dashed3(p, part(curve([NOW[0] + 16, NOW[1] + 10], [650, 700], [Q[0] - 60, 720]), dn), 8, "#f2a08a", [22, 14]);
  if (qk > 0) { const s = Math.min(1.15, qk); g.save(); g.translate(Q[0], Q[1]); g.scale(s, s); g.rotate(0.06); drawQ(p, 0, -20, 260, "#ffcf4a"); g.restore(); }
};
// ================= "बालेन दिल्ली गए" cast (appended after gold3.js, same module scope) =================
// Rules (scripts/balen-india-visit.md, guides/sensitive-topics.md 3 + 6): the prime ministers and officials are FACELESS
// silhouettes with no names, no party symbols, no flags, no airline or brand marks. Maps are schematic: no border is drawn
// for the far-west corner, only a dashed zone with "?".

const smoothB = (t) => t * t * (3 - 2 * t);
const SILB = "#232838", SILH = "#2c3246", SILR = "rgba(150,160,190,0.55)", CREAMB = "#fbf6ea", INKB = "#2a2024";
const roundRectB = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
const fillRR = (p, x, y, w, h, r, col, lw = 6, stroke = INKB) => { const g = p.g; roundRectB(g, x, y, w, h, r); g.fillStyle = col; g.fill(); if (lw) { g.lineWidth = lw; g.strokeStyle = stroke; g.stroke(); } };
const arrowHeadB = (p, x, y, ang, s, col) => { const c = Math.cos(ang), sn = Math.sin(ang), pt = (u, v) => [x + u * c - v * sn, y + u * sn + v * c];
  p.poly([pt(0, 0), pt(-40 * s, -22 * s), pt(-40 * s, 22 * s)], col, 4 * s); };
const partB = (pts, k) => { const N = pts.length - 1, upto = k * N, out = []; for (let i = 0; i <= N; i++) { if (i <= upto) out.push(pts[i]); else { const a = pts[i - 1], b = pts[i], t = upto - (i - 1); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); break; } } return out; };

// ---------- faceless silhouette (600 x 1000), standing. st: { side 1 = reach to the right / -1 left, reach 0..1, shake (px), file } ----------
export const drawSilB = (p, st = {}) => {
  const g = p.g, s = st.side ?? 1, k = st.reach ?? 0, sh = st.shake ?? 0, cx = 300;
  // legs
  p.poly([[cx - 92, 700], [cx - 12, 700], [cx - 22, 975], [cx - 92, 975]], SILB, 0); p.poly([[cx + 12, 700], [cx + 92, 700], [cx + 92, 975], [cx + 22, 975]], SILB, 0);
  p.poly([[cx - 104, 960], [cx - 18, 960], [cx - 12, 992], [cx - 110, 992]], "#151822", 0); p.poly([[cx + 18, 960], [cx + 104, 960], [cx + 110, 992], [cx + 12, 992]], "#151822", 0);
  // far arm (hangs)
  p.line([[cx - s * 128, 430], [cx - s * 150, 560], [cx - s * 140, 690]], SILB, 46);
  // torso (suit) with a faint shirt V and lapels (no tie colour, no badge)
  p.poly([[cx - 140, 410], [cx + 140, 410], [cx + 118, 720], [cx - 118, 720]], SILB, 0);
  p.poly([[cx - 34, 410], [cx + 34, 410], [cx, 500]], "#d8dce6", 0);
  p.stroke([[cx - 40, 410], [cx - 6, 520], [cx - 30, 600]], 5, SILR); p.stroke([[cx + 40, 410], [cx + 6, 520], [cx + 30, 600]], 5, SILR);
  // head: bean shape, no face
  p.ell(cx, 250, 118, 138, SILH, 0); p.ell(cx, 392, 52, 30, SILH, 0);
  g.save(); g.globalAlpha = 0.6; p.arc(cx, 250, 118, 138, 200, 320, 7, SILR); g.restore();
  // near arm: hang -> reach out to the side
  const hx = cx + s * (150 + 128 * k), hy = 690 - 190 * k + sh, ex = cx + s * (150 + 70 * k), ey = 560 - 70 * k;
  p.line([[cx + s * 128, 430], [ex, ey], [hx, hy]], SILB, 46);
  p.ell(hx, hy, 26, 24, SILH, 0);
  if (st.file) { fillRR(p, hx - 70, hy - 50, 120, 90, 8, "#e8c96a", 5); p.stroke([[hx - 56, hy - 20], [hx + 30, hy - 20]], 4, "rgba(80,60,20,0.5)"); }
};

// ---------- generic airliner, side view (1600 x 560), nose to the right. st: { gear 0..1, stairs 0..1 } ----------
export const drawPlaneB = (p, st = {}) => {
  const g = p.g, gear = st.gear ?? 1, stairs = st.stairs ?? 0;
  // tail fin + stabiliser
  p.poly([[110, 250], [180, 40], [290, 40], [330, 250]], "#e9ecf0", 6); p.poly([[60, 300], [260, 290], [250, 320], [70, 324]], "#d8dce2", 5);
  p.stroke([[190, 70], [300, 230]], 18, "#3a8a8a");
  // fuselage
  g.save(); roundRectB(g, 100, 220, 1420, 150, 75); g.fillStyle = "#f6f6f2"; g.fill(); g.lineWidth = 7; g.strokeStyle = INKB; g.stroke(); g.restore();
  p.poly([[1440, 225], [1560, 285], [1560, 310], [1440, 368]], "#f6f6f2", 0);
  g.save(); g.beginPath(); g.moveTo(1440, 222); g.quadraticCurveTo(1590, 250, 1580, 300); g.quadraticCurveTo(1570, 360, 1440, 370); g.fillStyle = "#f6f6f2"; g.fill(); g.lineWidth = 7; g.strokeStyle = INKB; g.stroke(); g.restore();
  p.stroke([[150, 330], [1500, 330]], 14, "#3a8a8a");
  p.poly([[1470, 258], [1540, 272], [1548, 290], [1476, 288]], "#2f3f52", 3);
  for (let i = 0; i < 22; i++) p.ell(380 + i * 46, 280, 11, 14, "#3a4a5e", 0);
  // door (front)
  fillRR(p, 1340, 245, 54, 98, 10, "#e2e6ea", 4);
  // wing + engine
  p.poly([[640, 330], [900, 330], [760, 430], [600, 430]], "#cfd4da", 6);
  g.save(); roundRectB(g, 700, 380, 170, 60, 30); g.fillStyle = "#dfe3e8"; g.fill(); g.lineWidth = 6; g.strokeStyle = INKB; g.stroke(); g.restore(); p.ell(866, 410, 10, 26, "#3a4a5e", 0);
  // gear
  if (gear > 0.05) { const L = 130 * gear;
    for (const x of [560, 1330]) { p.stroke([[x, 368], [x, 368 + L - 30]], 12, "#5a5a62"); p.ell(x - 18, 368 + L - 22, 24, 24, "#2a2a30", 4); p.ell(x + 18, 368 + L - 22, 24, 24, "#2a2a30", 4); } }
  // mobile stairs to the door
  if (stairs > 0.02) { g.save(); g.globalAlpha = Math.min(1, stairs * 2);
    p.poly([[1300, 340], [1394, 340], [1560, 540], [1400, 540]], "#e8e2d2", 5);
    for (let i = 1; i < 8; i++) { const t = i / 8; p.stroke([[1300 + 100 * t, 340 + 200 * t], [1394 + 166 * t, 340 + 200 * t]], 4, "rgba(60,50,40,0.5)"); }
    p.stroke([[1394, 300], [1560, 500]], 6, "#8a8a90"); g.restore(); }
};

// ---------- ticket counter booth (900 x 900) ----------
export const drawBoothB = (p) => {
  const g = p.g;
  p.poly([[40, 120], [860, 120], [820, 40], [80, 40]], "#3a6a8a", 6);
  fillRR(p, 70, 120, 760, 760, 6, "#efe6d4", 6);
  fillRR(p, 160, 150, 580, 110, 10, "#2a3a5a", 5); txt(g, "टिकट काउन्टर", 450, 208, 64, "#f2e2b0");
  fillRR(p, 170, 300, 560, 320, 12, "#bcd6e6", 6);
  p.ell(450, 430, 70, 80, "#d9a57a", 5); p.poly([[360, 620], [540, 620], [520, 520], [380, 520]], "#3a6a8a", 5);
  fillRR(p, 110, 620, 680, 60, 6, "#8a6a4a", 5);
};
/** a small team counter board (600 x 420) */
export const drawCountB = (p, n = 0) => { const g = p.g;
  fillRR(p, 20, 20, 560, 380, 18, "#1f2a3a", 7); txt(g, "सरकारी टोली", 300, 100, 56, "#d8e2f0");
  txt(g, toNepB(n), 300, 260, 170, "#ffd25a"); };
const toNepB = (n) => String(n).replace(/[0-9]/g, (d) => "०१२३४५६७८९"[+d]);

// ---------- meeting (1000 x 820): two faceless silhouettes at the ends of a table; nod 0..1 ----------
export const drawMeetB = (p, st = {}) => {
  const g = p.g, nod = st.nod ?? 0;
  fillRR(p, 0, 0, 1000, 820, 0, "#efe3cc", 0);
  p.poly([[0, 0], [1000, 0], [1000, 300], [0, 300]], "#d9c7a6", 0);
  fillRR(p, 380, 70, 240, 170, 8, "#c9b48c", 5); p.ell(500, 155, 40, 50, "#9a7a4a", 0);
  const sil = (cx, dir, dy) => { p.poly([[cx - 120, 760], [cx + 120, 760], [cx + 100, 470], [cx - 100, 470]], SILB, 0);
    p.poly([[cx - 26, 470], [cx + 26, 470], [cx, 540]], "#d8dce6", 0);
    p.ell(cx + dir * 14, 370 + dy, 92, 108, SILH, 0); p.ell(cx, 462, 40, 22, SILH, 0); };
  sil(230, 1, 6 * Math.sin(nod * Math.PI * 2)); sil(770, -1, 6 * Math.sin(nod * Math.PI * 2 + 1.5));
  p.poly([[60, 600], [940, 600], [990, 760], [10, 760]], "#7a5236", 7);
  p.poly([[10, 760], [990, 760], [990, 800], [10, 800]], "#5a3a26", 5);
  for (const x of [330, 670]) { fillRR(p, x - 60, 640, 120, 70, 4, "#ffffff", 4); p.stroke([[x - 40, 660], [x + 40, 660]], 3, "rgba(0,0,0,0.3)"); p.stroke([[x - 40, 680], [x + 30, 680]], 3, "rgba(0,0,0,0.3)"); }
  for (const x of [440, 560]) { p.poly([[x - 16, 600], [x + 16, 600], [x + 12, 650], [x - 12, 650]], "rgba(200,230,250,0.9)", 4); }
};

// ---------- the eight MoU folders on a table, top view (1000 x 1100). st: { k: [8 x 0..1 slide-in], glow: [indices] } ----------
const ICONS_B = ["book", "shield", "leaf", "sat", "city", "people", "doc", "doc"];
const icoB = (p, kind, x, y) => { const g = p.g;
  if (kind === "book") { p.poly([[x - 60, y - 40], [x, y - 28], [x, y + 46], [x - 60, y + 34]], "#ffffff", 5); p.poly([[x + 60, y - 40], [x, y - 28], [x, y + 46], [x + 60, y + 34]], "#ffffff", 5); }
  if (kind === "shield") p.poly([[x, y - 56], [x + 50, y - 36], [x + 42, y + 20], [x, y + 56], [x - 42, y + 20], [x - 50, y - 36]], "#ffffff", 5);
  if (kind === "leaf") { p.ell(x, y, 34, 58, "#ffffff", 5, 0, 360, 35); p.stroke([[x - 26, y + 40], [x + 26, y - 40]], 4, INKB); }
  if (kind === "sat") { p.poly([[x - 18, y - 18], [x + 18, y - 18], [x + 18, y + 18], [x - 18, y + 18]], "#ffffff", 5); for (const s of [-1, 1]) p.poly([[x + s * 24, y - 12], [x + s * 70, y - 12], [x + s * 70, y + 12], [x + s * 24, y + 12]], "#bfe0ff", 4); p.stroke([[x, y - 18], [x, y - 46]], 4, INKB); p.dot(x, y - 50, 8, "#ffffff"); }
  if (kind === "city") { for (const [dx, h] of [[-40, 70], [0, 100], [40, 56]]) p.poly([[x + dx - 18, y + 46], [x + dx + 18, y + 46], [x + dx + 18, y + 46 - h], [x + dx - 18, y + 46 - h]], "#ffffff", 4); }
  if (kind === "people") { for (const dx of [-30, 30]) { p.ell(x + dx, y - 20, 18, 20, "#ffffff", 4); p.poly([[x + dx - 28, y + 46], [x + dx + 28, y + 46], [x + dx + 20, y + 6], [x + dx - 20, y + 6]], "#ffffff", 4); } }
  if (kind === "doc") { fillRR(p, x - 40, y - 52, 80, 104, 6, "#ffffff", 4); for (let i = 0; i < 4; i++) p.stroke([[x - 26, y - 30 + i * 20], [x + 26, y - 30 + i * 20]], 3, "rgba(0,0,0,0.35)"); }
};
const FCOL_B = ["#3a6a8a", "#8a2a3a", "#2f7a5a", "#5a4a9a", "#c87a2a", "#2a5a7a", "#6a6a72", "#7a5a3a"];
export const drawFoldersB = (p, st = {}) => {
  const g = p.g, K = st.k ?? Array(8).fill(1), glow = st.glow ?? [];
  p.poly([[0, 0], [1000, 0], [1000, 1100], [0, 1100]], "#8a5a36", 0);
  for (let i = 0; i < 14; i++) p.stroke([[0, 40 + i * 80], [1000, 30 + i * 80]], 3, "rgba(60,30,10,0.18)");
  for (let i = 0; i < 8; i++) {
    const c = i % 2, r = Math.floor(i / 2), k = K[i]; if (k <= 0) continue;
    const X = 90 + c * 450 + (1 - k) * 900, Y = 70 + r * 250, w = 380, h = 210, lit = glow.includes(i);
    if (lit) { g.save(); g.shadowColor = "rgba(255,220,120,0.95)"; g.shadowBlur = 40; fillRR(p, X - 6, Y - 6, w + 12, h + 12, 16, "#ffe27a", 0); g.restore(); }
    fillRR(p, X, Y - 26, 140, 40, 10, FCOL_B[i], 5);
    fillRR(p, X, Y, w, h, 14, FCOL_B[i], 6);
    icoB(p, ICONS_B[i], X + 110, Y + 105);
    txt(g, toNepB(i + 1), X + 300, Y + 110, 90, "rgba(255,255,255,0.85)");
  }
};

// ---------- coin piles (1000 x 1000). st: { grow 0..1, split 0..1, tag 0..1 } ----------
const pileB = (p, cx, base, n, w) => { for (let i = 0; i < n; i++) { const y = base - i * 22; p.ell(cx, y, w, w * 0.28, i % 2 ? "#f2c84a" : "#e8b83a", 4); } p.ell(cx, base - (n - 1) * 22, w, w * 0.28, "#fff2b0", 4); };
export const drawCoinsB = (p, st = {}) => {
  const g = p.g, gr = st.grow ?? 1, sp = st.split ?? 0, tg = st.tag ?? 0;
  fillRR(p, 20, 20, 960, 960, 24, "rgba(255,252,244,0.97)", 7);
  txt(g, "भारतले घोषणा गरेको सहयोग", 500, 90, 50, "#5a4a3a");
  const N = Math.max(1, Math.round(24 * gr)), base = 840;
  if (sp < 0.02) { pileB(p, 500, base, N, 170); if (gr > 0.6) { g.save(); g.globalAlpha = Math.min(1, (gr - 0.6) / 0.3); txt(g, "≈ २४,००० करोड", 500, base - N * 22 - 90, 80, "#7a4a0a"); g.restore(); } }
  else {
    const e = smoothB(Math.min(1, sp)), nS = Math.max(2, Math.round(N * 0.24)), nL = Math.max(2, N - nS);
    pileB(p, 500 - 270 * e, base, nS, 120); pileB(p, 500 + 120 * e, base, nL, 180);
    g.save(); g.globalAlpha = e; txt(g, "अनुदान ¼", 500 - 270 * e, base + 90, 60, "#2f7a5a"); txt(g, "ऋण ¾", 500 + 120 * e, base + 90, 66, "#c8281e"); g.restore();
    if (tg > 0) { const s = Math.min(1, tg); g.save(); g.translate(500 + 120 * e - 30, base - nL * 22 - 150); g.scale(s, s); g.rotate(0.12);
      fillRR(p, -10, -60, 240, 110, 14, "#fff1a8", 6); p.poly([[30, -50], [70, -50], [50, -6], [80, -6], [26, 46], [40, 4], [12, 4]], "#f2b51a", 4); txt(g, "ऊर्जा", 150, -4, 56, "#7a4a0a"); g.restore(); }
  }
};

// ---------- schematic map (1000 x 1000): Nepal (simplified, no far-west border), the air route ----------
// st: { route 0..1 one-way arrow draws, two 0..1 second arrowhead, tag 0..1 "२००९ देखि माग", tech 0..1 "प्राविधिक छलफल बाँकी" }
const NEPAL_B = [[230, 300], [330, 270], [450, 315], [560, 345], [680, 380], [800, 395], [905, 420], [915, 505], [800, 510], [690, 492], [560, 470], [440, 440], [330, 410], [235, 372]];
const mapBaseB = (p) => { const g = p.g;
  fillRR(p, 20, 20, 960, 960, 24, "#f4ecd8", 7);
  p.poly([[40, 40], [960, 40], [960, 260], [40, 260]], "#e6eef2", 0); txt(g, "चीन", 600, 150, 52, "rgba(60,70,90,0.55)");
  p.poly([[40, 260], [960, 260], [960, 960], [40, 960]], "#efe2c4", 0); txt(g, "भारत", 640, 820, 60, "rgba(90,70,40,0.55)");
  p.poly(NEPAL_B, "#f6d9a8", 0); p.line(NEPAL_B.slice(1).concat([NEPAL_B[NEPAL_B.length - 1]]), "#a8471a", 6, false);
  txt(g, "नेपाल", 820, 468, 40, "rgba(120,50,20,0.7)");
};
export const drawMapB = (p, st = {}) => {
  const g = p.g, r = st.route ?? 0, two = st.two ?? 0, tag = st.tag ?? 0, tech = st.tech ?? 0;
  mapBaseB(p);
  const LKO = [380, 700], BWA = [480, 452], KTM = [660, 418];
  const route = []; for (let i = 0; i <= 20; i++) { const t = i / 20; route.push([LKO[0] + (BWA[0] - LKO[0]) * t, LKO[1] + (BWA[1] - LKO[1]) * t]); }
  for (let i = 1; i <= 20; i++) { const t = i / 20; route.push([BWA[0] + (KTM[0] - BWA[0]) * t, BWA[1] + (KTM[1] - BWA[1]) * t - 40 * Math.sin(Math.PI * t)]); }
  const c = partB(route, r);
  if (r > 0) { p.stroke(c, 10, "#2f6fb0"); const e = c[c.length - 1], e0 = c[Math.max(0, c.length - 2)]; arrowHeadB(p, e[0], e[1], Math.atan2(e[1] - e0[1], e[0] - e0[0]), 1, "#2f6fb0"); }
  if (two > 0) { const s = Math.min(1.2, two); arrowHeadB(p, LKO[0], LKO[1], Math.atan2(LKO[1] - BWA[1], LKO[0] - BWA[0]), s, "#e07b2a"); }
  for (const [pt, name, dx, dy] of [[LKO, "लखनऊ", -10, 50], [BWA, "भैरहवा", -40, 52], [KTM, "काठमाडौं", 40, -46]]) { p.dot(pt[0], pt[1], 14, "#c8281e"); txt(g, name, pt[0] + dx, pt[1] + dy, 44, "#3a2a1a"); }
  if (tag > 0) { g.save(); g.globalAlpha = Math.min(1, tag); fillRR(p, 90, 560, 270, 90, 14, "#ffffff", 5); txt(g, "२००९ देखि माग", 225, 607, 42, "#5a3a1a"); g.restore(); }
  if (tech > 0) { g.save(); g.globalAlpha = Math.min(1, tech); fillRR(p, 300, 860, 520, 84, 14, "#fff1d6", 5); txt(g, "प्राविधिक छलफल बाँकी", 560, 904, 46, "#a8470a"); g.restore(); }
};
/** the far-west corner (1000 x 1000): a dashed zone (no border drawn), three names, "?" */
export const drawCornerB = (p, st = {}) => {
  const g = p.g, L = st.labels ?? [0, 0, 0], qk = st.q ?? 0;
  fillRR(p, 20, 20, 960, 960, 24, "#f4ecd8", 7);
  p.poly([[40, 40], [960, 40], [960, 300], [40, 300]], "#e6eef2", 0); p.poly([[40, 300], [960, 300], [960, 960], [40, 960]], "#efe2c4", 0);
  p.poly([[560, 300], [960, 360], [960, 960], [620, 960], [560, 620]], "#f6d9a8", 0); txt(g, "नेपाल", 790, 700, 60, "rgba(120,50,20,0.7)");
  g.save(); g.setLineDash([24, 16]); p.ell(400, 400, 250, 190, "rgba(224,123,42,0.12)", 8); g.restore();
  ["कालापानी", "लिपुलेक", "लिम्पियाधुरा"].forEach((n, i) => { if (L[i] > 0) { g.save(); g.globalAlpha = Math.min(1, L[i]); const s = 0.8 + 0.2 * Math.min(1, L[i]);
    g.translate(400, 300 + i * 90); g.scale(s, s); txt(g, n, 0, 0, 58, "#3a2a1a"); g.restore(); } });
  txt(g, "सुदूरपश्चिम कुना", 400, 700, 42, "rgba(90,70,40,0.6)");
  if (qk > 0) { const s = Math.min(1.15, qk); g.save(); g.translate(760, 300); g.scale(s, s); drawQ(p, 0, 0, 260, "#e0302a"); g.restore(); }
};

// ---------- the boundary file handed to two faceless officials (1000 x 900). st: { file 0..1 } ----------
export const drawSecB = (p, st = {}) => {
  const g = p.g, fk = st.file ?? 0;
  fillRR(p, 0, 0, 1000, 900, 0, "#e9e2d2", 0);
  for (const cx of [560, 800]) { p.poly([[cx - 110, 800], [cx + 110, 800], [cx + 92, 520], [cx - 92, 520]], SILB, 0); p.poly([[cx - 24, 520], [cx + 24, 520], [cx, 586]], "#d8dce6", 0); p.ell(cx, 420, 86, 100, SILH, 0); p.ell(cx, 512, 38, 20, SILH, 0); }
  p.poly([[380, 700], [990, 700], [990, 900], [380, 900]], "#7a5236", 6);
  fillRR(p, 470, 730, 420, 90, 12, "#1f2a3a", 5); txt(g, "परराष्ट्र सचिव", 680, 776, 54, "#f2e2b0");
  const x = 60 + 520 * smoothB(Math.min(1, fk)), y = 620 - 120 * Math.sin(Math.PI * Math.min(1, fk));
  fillRR(p, x, y - 70, 220, 150, 10, "#e8c96a", 6); fillRR(p, x, y - 96, 90, 34, 8, "#e8c96a", 5);
  txt(g, "सीमा", x + 110, y + 6, 52, "#5a3a10");
};

// ---------- receipt printer (800 x 1300). st: { len 0..1 paper out, tot 0..1 total line, qp question pulse } ----------
export const drawReceiptB = (p, st = {}) => {
  const g = p.g, len = st.len ?? 0, tot = st.tot ?? 0, qp = st.qp ?? 0;
  const H = 120 + 1000 * len;
  // paper
  g.save(); roundRectB(g, 170, 150, 460, H, 6); g.fillStyle = "#ffffff"; g.fill(); g.lineWidth = 5; g.strokeStyle = INKB; g.stroke(); g.restore();
  txt(g, "भ्रमण खर्च", 400, 210, 48, "#3a2a1a");
  const rows = Math.floor((H - 200) / 70);
  for (let i = 0; i < Math.min(rows, 10); i++) { const y = 290 + i * 70; p.stroke([[210, y], [420, y]], 8, "rgba(0,0,0,0.12)"); p.stroke([[480, y], [590, y]], 8, "rgba(0,0,0,0.12)"); }
  if (tot > 0) { const y = 150 + H - 90; g.save(); g.globalAlpha = Math.min(1, tot * 1.5); p.stroke([[200, y - 50], [600, y - 50]], 4, "rgba(0,0,0,0.4)");
    txt(g, "कुल खर्च:", 290, y, 52, "#3a2a1a"); const s = 1 + 0.12 * qp; g.translate(540, y); g.scale(s, s); txt(g, "?", 0, 0, 96, "#e0302a"); g.restore(); }
  // printer body on top
  fillRR(p, 80, 40, 640, 150, 26, "#3a3f4a", 7); fillRR(p, 150, 140, 500, 24, 8, "#1f2228", 4); p.dot(640, 90, 14, "#5ad06a");
};

// ---------- score card (1000 x 1000). st: { blink 0..1, sweep 0..1 } ----------
export const drawScoreB = (p, st = {}) => {
  const g = p.g, bl = st.blink ?? 1, sw = st.sweep ?? 0;
  fillRR(p, 20, 20, 960, 960, 30, "rgba(255,252,244,0.98)", 7);
  txt(g, "यो भ्रमण", 500, 130, 66, "#3a2a1a");
  fillRR(p, 250, 240, 500, 300, 26, "#1f2a3a", 7);
  if (bl > 0.5) p.stroke([[330, 470], [470, 470]], 14, "#ffd25a");
  txt(g, "/ १०", 600, 400, 110, "#f2e2b0");
  for (let i = 0; i <= 10; i++) { const x = 95 + i * 81, lit = Math.abs(sw * 10 - i) < 0.8;
    fillRR(p, x - 34, 640, 68, 90, 14, lit ? "#ffd25a" : "#efe6d4", 5); txt(g, toNepB(i), x, 688, 50, "#3a2a1a"); }
  txt(g, "कमेन्टमा लेख्नुहोस्", 500, 850, 56, "#a8470a");
};

// ---------- train, side view (2400 x 520), moving right ----------
export const drawTrainB = (p) => {
  const g = p.g;
  const car = (x, w, engine) => { fillRR(p, x, 120, w, 300, engine ? 60 : 24, engine ? "#b8322e" : "#2f6a8a", 7);
    p.stroke([[x + 10, 330], [x + w - 10, 330]], 16, "#f2e2b0");
    if (engine) { fillRR(p, x + w - 200, 160, 140, 100, 16, "#bcd6e6", 5); p.ell(x + w - 40, 300, 18, 18, "#ffe27a", 4);
      fillRR(p, x + 30, 165, w - 260, 110, 12, "#1f2a3a", 5); txt(g, "अयोध्या → जनकपुर", x + 30 + (w - 260) / 2, 222, 60, "#ffe27a"); }
    else for (let i = 0; i < Math.floor((w - 60) / 110); i++) fillRR(p, x + 40 + i * 110, 170, 80, 90, 10, "#bcd6e6", 4);
    for (const wx of [x + 80, x + 200, x + w - 200, x + w - 80]) p.ell(wx, 440, 46, 46, "#2a2a30", 5); };
  car(20, 760, false); car(800, 760, false); car(1580, 800, true);
  p.stroke([[780, 300], [800, 300]], 14, "#3a3a40"); p.stroke([[1560, 300], [1580, 300]], 14, "#3a3a40");
};
/** inauguration ribbon (1000 x 300). cut 0..1 */
export const drawRibbonB = (p, cut = 0) => {
  const g = p.g, c = smoothB(Math.min(1, cut));
  if (c < 0.02) { p.stroke([[20, 120], [980, 120]], 26, "#d0202a"); p.ell(470, 120, 44, 30, "#d0202a", 5); p.ell(530, 120, 44, 30, "#d0202a", 5); p.dot(500, 120, 16, "#a8141e"); }
  else { p.line([[20, 120], [260, 120 + 30 * c], [470 - 60 * c, 120 + 150 * c]], "#d0202a", 26); p.line([[980, 120], [740, 120 + 30 * c], [530 + 60 * c, 120 + 150 * c]], "#d0202a", 26); }
};

// ---------- the two prime ministers as respectful toon characters (user's choice, 2026-11-23; overrides the brief's
// faceless rule). Balen: black daura-suruwal + black coat + dark sunglasses + black dhaka topi. Modi: white hair and
// beard, rimless glasses, cream kurta + a muted sleeveless jacket (no party colour). Neutral expressions only.
const OUT_BALEN = { jacket: "#1c1c22", pants: "#202026", boots: "#141418", skin: "#c99067", hat: "hair", hair: "#141010", moustache: "#1a1414", build: "adult" };
const OUT_MODI = { jacket: "#f1ece0", pants: "#f1ece0", boots: "#5a3b2a", skin: "#c99067", hat: "hair", hair: "#ecebe6", moustache: "#f2f1ec", build: "stout" };
/** black dhaka topi: the usual topi shape, black dhaka cloth with a faint grey/white motif */
const topiBlackB = (p, c) => {
  const { cx, crown, HH, u } = c, yb = crown + 0.2 * HH, ht = 0.3 * HH;
  const pts = [[cx - 46 * u, yb], [cx + 46 * u, yb + 2 * u], [cx + 40 * u, yb - ht * 0.75], [cx - 36 * u, yb - ht]];
  p.poly(pts, "#141418", 0);
  p.clip(pts, () => { for (let i = 0; i < 9; i++) for (let j = 0; j < 4; j++)
    p.ell(cx - 46 * u + i * 12 * u + (j % 2) * 6 * u, yb - 4 * u - j * 9 * u, 2.6 * u, 2.6 * u, (i + j) % 3 ? "rgba(120,120,130,0.55)" : "rgba(235,235,240,0.45)", 0); });
  p.poly(pts, null, 2.6 * u);
};
export const drawLeaderB = (p, who, st = {}) => {
  const B = who === "balen", o = B ? OUT_BALEN : OUT_MODI, pose = st.pose ?? ["hang", "hang", 0];
  bodyFront(p, o, { mode: "stand", lift: 34, seed: st.seed ?? (B ? 801 : 802), expr: st.expr ?? "neutral", blink: B ? 0 : (st.blink ?? 0), look: st.look ?? 0, headTilt: 0,
    armFn: armBlend(pose[0], pose[1], pose[2]),
    front: (c) => { const { tcx, T, HH, u, chin, torsoBot } = c;
      if (B) { // daura's crossed front flap + the coat's lapels
        p.stroke([[tcx - 0.35 * T.a, chin + 0.08 * HH], [tcx + 0.3 * T.a, chin + 0.42 * HH]], 3 * u, "rgba(120,120,135,0.8)");
        p.dot(tcx + 0.3 * T.a, chin + 0.42 * HH, 3.5 * u, "#3a3a44");
        p.stroke([[tcx - 0.62 * T.a, chin + 0.02 * HH], [tcx - 0.42 * T.a, torsoBot - 0.05 * HH]], 3 * u, "rgba(150,150,165,0.7)");
        p.stroke([[tcx + 0.62 * T.a, chin + 0.02 * HH], [tcx + 0.42 * T.a, torsoBot - 0.05 * HH]], 3 * u, "rgba(150,150,165,0.7)");
      } else { // sleeveless jacket over the kurta
        for (const s of [-1, 1]) p.poly([[tcx + s * 0.98 * T.a, chin + 0.03 * HH], [tcx + s * 0.16 * T.a, chin + 0.06 * HH], [tcx + s * 0.1 * T.a, torsoBot + 0.02 * HH], [tcx + s * 0.92 * T.a, torsoBot + 0.02 * HH]], "#5c6a86", 2.2 * u);
        for (let i = 0; i < 4; i++) p.dot(tcx + 0.1 * T.a, chin + (0.14 + i * 0.1) * HH, 2.6 * u, "#d8c890");
      } },
    headExtra: (c) => { const { cx, hc, W, u } = c, ey = hc + 0.02 * W;
      if (B) { // dark sunglasses
        for (const s of [-1, 1]) { p.g.save(); p.g.beginPath(); p.g.roundRect(cx + s * 0.2 * W - 0.16 * W, ey - 0.1 * W, 0.32 * W, 0.2 * W, 0.05 * W); p.g.fillStyle = "#0e0e12"; p.g.fill(); p.g.lineWidth = 3 * u; p.g.strokeStyle = "#000"; p.g.stroke(); p.g.restore();
          p.stroke([[cx + s * 0.2 * W - 0.1 * W, ey - 0.05 * W], [cx + s * 0.2 * W - 0.02 * W, ey - 0.07 * W]], 2.5 * u, "rgba(255,255,255,0.45)"); }
        p.stroke([[cx - 0.04 * W, ey - 0.04 * W], [cx + 0.04 * W, ey - 0.04 * W]], 3 * u, "#000");
        for (const s of [-1, 1]) p.stroke([[cx + s * 0.36 * W, ey - 0.05 * W], [cx + s * 0.47 * W, ey - 0.07 * W]], 3 * u, "#000");
        // short, trimmed black beard along the jaw
        p.poly([[cx - 0.44 * W, hc + 0.06 * W], [cx - 0.38 * W, hc + 0.3 * W], [cx - 0.18 * W, hc + 0.45 * W], [cx, hc + 0.48 * W], [cx + 0.18 * W, hc + 0.45 * W], [cx + 0.38 * W, hc + 0.3 * W], [cx + 0.44 * W, hc + 0.06 * W], [cx + 0.36 * W, hc + 0.24 * W], [cx + 0.18 * W, hc + 0.36 * W], [cx, hc + 0.38 * W], [cx - 0.18 * W, hc + 0.36 * W], [cx - 0.36 * W, hc + 0.24 * W]], "#1a1414", 1.6 * u);
        topiBlackB(p, c);
      } else { // white beard + rimless glasses
        p.poly([[cx - 0.4 * W, hc + 0.2 * W], [cx - 0.34 * W, hc + 0.36 * W], [cx - 0.17 * W, hc + 0.47 * W], [cx, hc + 0.5 * W], [cx + 0.17 * W, hc + 0.47 * W], [cx + 0.34 * W, hc + 0.36 * W], [cx + 0.4 * W, hc + 0.2 * W], [cx + 0.22 * W, hc + 0.33 * W], [cx, hc + 0.36 * W], [cx - 0.22 * W, hc + 0.33 * W]], "#f2f1ec", 2 * u);
        for (const s of [-1, 1]) { p.g.save(); p.g.beginPath(); p.g.roundRect(cx + s * 0.2 * W - 0.14 * W, ey - 0.08 * W, 0.28 * W, 0.17 * W, 0.04 * W); p.g.lineWidth = 2 * u; p.g.strokeStyle = "rgba(90,90,100,0.75)"; p.g.stroke(); p.g.restore(); }
        p.stroke([[cx - 0.06 * W, ey - 0.03 * W], [cx + 0.06 * W, ey - 0.03 * W]], 2 * u, "rgba(90,90,100,0.75)");
      } } });
};
/** meeting room backdrop without people (1000 x 820) and the table in front (1000 x 300) */
export const drawRoomB = (p) => { fillRR(p, 0, 0, 1000, 820, 0, "#efe3cc", 0); p.poly([[0, 0], [1000, 0], [1000, 300], [0, 300]], "#d9c7a6", 0); fillRR(p, 380, 70, 240, 170, 8, "#c9b48c", 5); p.ell(500, 155, 40, 50, "#9a7a4a", 0); };
export const drawTableB = (p) => {
  p.poly([[60, 20], [940, 20], [990, 200], [10, 200]], "#7a5236", 7); p.poly([[10, 200], [990, 200], [990, 250], [10, 250]], "#5a3a26", 5);
  for (const x of [300, 700]) { fillRR(p, x - 60, 60, 120, 70, 4, "#ffffff", 4); p.stroke([[x - 40, 80], [x + 40, 80]], 3, "rgba(0,0,0,0.3)"); p.stroke([[x - 40, 100], [x + 30, 100]], 3, "rgba(0,0,0,0.3)"); }
  for (const x of [450, 550]) p.poly([[x - 16, 20], [x + 16, 20], [x + 12, 70], [x - 12, 70]], "rgba(200,230,250,0.9)", 4);
};

// ================= "मागेको मुन्द्रा-धाम्रा, पाएको कान्डला-पारादीप" cast (appended after balen.js, same module scope) =================
// Rules (scripts/nepaliport.md, guides/sensitive-topics.md 3 + 6): no real faces (officials = drawSilB), no logos (Adani, port
// authorities, parties), no flags. Ports are plain text labels + निजी / सरकारी tags. Map: coastline only, no borders; Nepal is a pin.
// The trader's line is labelled अनुमान. Visuals stay neutral (no smirks on silhouettes).

const INKP = "#2a2024", CREAMP = "#fbf6ea", ORGP = "#e07b2a", TEALP = "#2f7a5a", SLATEP = "#3a5a8a", REDP = "#c8323a", GREYP = "#9a948a";
const NEPN = (n) => String(n).replace(/[0-9]/g, (d) => "०१२३४५६७८९"[+d]);
const fitTxt = (g, s, x, y, px, col, maxW, align = "center") => { g.save(); let f = px; g.font = `bold ${f}px ${DEVA}`;
  while (g.measureText(s).width > maxW && f > 10) { f -= 2; g.font = `bold ${f}px ${DEVA}`; }
  g.textAlign = align; g.textBaseline = "middle"; g.fillStyle = col; g.fillText(s, x, y); g.restore(); };
const rrP = (p, x, y, w, h, r, col, lw = 6, stroke = INKP) => { const g = p.g; g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = col; g.fill(); if (lw) { g.lineWidth = lw; g.strokeStyle = stroke; g.stroke(); } };
const glowP = (g, x, y, r, rgb, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); };
const tickP = (p, x, y, s, k = 1, col = "#2f8a4a") => { const pts = [[x - 22 * s, y], [x - 6 * s, y + 18 * s], [x + 26 * s, y - 22 * s]];
  if (k <= 0) return; const L1 = Math.hypot(16, 18), L2 = Math.hypot(32, 40), t = k * (L1 + L2);
  const out = [pts[0]]; if (t <= L1) out.push([pts[0][0] + (pts[1][0] - pts[0][0]) * t / L1, pts[0][1] + (pts[1][1] - pts[0][1]) * t / L1]);
  else { out.push(pts[1]); const u = (t - L1) / L2; out.push([pts[1][0] + (pts[2][0] - pts[1][0]) * u, pts[1][1] + (pts[2][1] - pts[1][1]) * u]); }
  p.stroke(out, 10 * s, col); };
const crossP = (p, x, y, s, col = REDP) => { p.stroke([[x - 18 * s, y - 18 * s], [x + 18 * s, y + 18 * s]], 9 * s, col); p.stroke([[x + 18 * s, y - 18 * s], [x - 18 * s, y + 18 * s]], 9 * s, col); };
FACE.puzzled = { eye: ["dot", "dot"], brow: [-6, 1], mouth: "wave" };
FACE.curious = { eye: ["dot", "dot"], brow: [-6, -1], mouth: "o" };

// small bean head for the truck cab (cx, cy centre, r radius): skin, topi, eyes, brows, mouth
const miniHeadP = (p, cx, cy, r, st = {}) => {
  const lk = st.look ?? 0.3, ex = st.expr ?? "neutral";
  p.ell(cx, cy, r, r * 1.12, "#c99067", 5);
  // dhaka topi
  const yb = cy - r * 0.62, pts = [[cx - r * 0.78, yb], [cx + r * 0.78, yb + 3], [cx + r * 0.66, yb - r * 0.55], [cx - r * 0.6, yb - r * 0.64]];
  p.poly(pts, "#7a2f52", 4); p.clip(pts, () => { const cols = ["#e2b33c", "#2f7a5a", "#d4483c", "#f2ecdf"]; for (let i = 0; i < 10; i++) for (let j = 0; j < 3; j++) p.ell(cx - r * 0.8 + i * r * 0.18 + (j % 2) * r * 0.09, yb - r * 0.12 - j * r * 0.18, r * 0.05, r * 0.05, cols[(i + j) % 4], 0); });
  const ey = cy - r * 0.05, dx = r * 0.34, lx = lk * r * 0.12, ly = -Math.abs(lk) * r * 0.06 - (st.up ?? 0) * r * 0.08;
  for (const s of [-1, 1]) { p.ell(cx + s * dx, ey, r * 0.17, r * 0.19, "#ffffff", 3); p.dot(cx + s * dx + lx, ey + ly, r * 0.08); }
  const raise = ex === "puzzled" || ex === "curious" ? 1 : 0;
  p.stroke([[cx - dx - r * 0.17, ey - r * (0.34 + 0.12 * raise)], [cx - dx + r * 0.15, ey - r * (0.38 + 0.16 * raise)]], r * 0.08, "#1a1414");
  p.stroke([[cx + dx - r * 0.15, ey - r * 0.36], [cx + dx + r * 0.17, ey - r * 0.32]], r * 0.08, "#1a1414");
  p.stroke([[cx - r * 0.3, cy + r * 0.38], [cx + r * 0.3, cy + r * 0.36]], r * 0.12, "#2a1d18"); // moustache
  if (ex === "curious" || ex === "puzzled") p.ell(cx + r * 0.05, cy + r * 0.62, r * 0.1, r * 0.12, "#5a2a2a", 3); else p.stroke([[cx - r * 0.16, cy + r * 0.6], [cx + r * 0.16, cy + r * 0.58]], 4, INKP);
};

// ---------- Nepali truck, side view (1400 x 760), nose to the right. st: { spin, container, head:{expr, look, up}, lean } ----------
export const drawTruckP = (p, st = {}) => {
  const g = p.g, sp = st.spin ?? 0;
  // chassis
  p.poly([[110, 600], [1290, 600], [1290, 640], [110, 640]], "#2a2a30", 5);
  // cargo: painted wooden body or a container
  if (st.flatbed) {
    p.poly([[120, 560], [930, 560], [930, 600], [120, 600]], "#5a3a26", 6);
    for (const x of [130, 900]) p.poly([[x, 470], [x + 20, 470], [x + 20, 560], [x, 560]], "#3a3a40", 4);
  } else if (st.container) {
    const cc = st.container;
    p.poly([[120, 250], [930, 250], [930, 600], [120, 600]], cc, 7);
    for (let x = 150; x < 910; x += 34) p.stroke([[x, 268], [x, 584]], 5, "rgba(0,0,0,0.18)");
    p.stroke([[120, 262], [930, 262]], 6, "rgba(255,255,255,0.25)");
  } else {
    p.poly([[120, 300], [930, 300], [930, 600], [120, 600]], "#e05a2a", 7);
    p.poly([[120, 300], [930, 300], [930, 350], [120, 350]], "#f2c84a", 5);
    for (let i = 0; i < 9; i++) { const x = 170 + i * 88; p.ell(x, 325, 14, 14, ["#2f7a5a", "#c8202e", "#2f5f9e"][i % 3], 3); }
    for (let i = 0; i < 4; i++) { const x = 220 + i * 190; p.ell(x, 470, 46, 46, "#f6c93a", 4); p.ell(x, 470, 20, 20, "#c8202e", 3); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; p.ell(x + 62 * Math.cos(a), 470 + 62 * Math.sin(a), 10, 10, "#2f7a5a", 2); } }
    p.poly([[120, 560], [930, 560], [930, 600], [120, 600]], "#2f5f9e", 5);
    fitTxt(g, "शुभ यात्रा", 525, 580, 34, "#fbf6ea", 300);
  }
  // cab
  p.poly([[950, 610], [950, 290], [1150, 290], [1250, 420], [1290, 440], [1290, 610]], "#2f5f9e", 7);
  p.poly([[950, 250], [1150, 250], [1170, 290], [950, 290]], "#f2c84a", 6); // painted crown over the cab
  for (let i = 0; i < 5; i++) p.ell(985 + i * 40, 270, 9, 9, "#c8202e", 2);
  // window with the trader
  const win = [[985, 320], [1140, 320], [1225, 425], [985, 425]];
  p.poly(win, "#bfe0f0", 6);
  p.clip(win, () => miniHeadP(p, 1075 + (st.lean ?? 0) * 40, 392, 62, st.head ?? {}));
  p.poly([[1185, 470], [1285, 470], [1285, 520], [1185, 520]], "#f6e8b0", 4); // headlight panel
  p.ell(1268, 495, 16, 16, "#fff6c8", 3);
  p.stroke([[970, 470], [1150, 470]], 4, "rgba(0,0,0,0.3)");
  // tassels under the bumper
  for (let i = 0; i < 6; i++) p.stroke([[1170 + i * 20, 612], [1172 + i * 20, 642 + 4 * Math.sin(i + sp * 6)]], 5, ["#c8202e", "#f2c84a", "#2f7a5a"][i % 3]);
  // wheels
  for (const x of [270, 470, 1120]) { p.ell(x, 660, 74, 74, "#1e1e24", 6); p.ell(x, 660, 36, 36, "#9a9aa2", 4);
    for (let k = 0; k < 4; k++) { const a = sp * 6.283 + k * Math.PI / 2; p.stroke([[x, 660], [x + 30 * Math.cos(a), 660 + 30 * Math.sin(a)]], 6, "#5a5a62"); } }
};

// ---------- one signpost with two arrow boards (900 x 1400). st: { lit 0..1, barred 0..1 } ----------
const ARROW = (x0, y0, w, h, dir) => dir > 0 ? [[x0, y0], [x0 + w - 70, y0], [x0 + w, y0 + h / 2], [x0 + w - 70, y0 + h], [x0, y0 + h]] : [[x0 + 70, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0 + 70, y0 + h], [x0, y0 + h / 2]];
export const drawSignpostP = (p, st = {}) => {
  const g = p.g, lit = st.lit ?? 0, bar = st.barred ?? 1;
  if (lit > 0) glowP(g, 480, 560, 420, "255,214,120", 0.55 * lit);
  p.poly([[436, 140], [464, 140], [470, 1400], [430, 1400]], "#8a8a90", 5);
  // top board: asked ports, barred
  const A = ARROW(60, 170, 780, 230, -1);
  p.poly(A, "#2f6a4a", 7); p.poly(ARROW(78, 186, 744, 198, -1), null, 4);
  if (bar > 0) { g.save(); g.fillStyle = `rgba(30,30,36,${0.3 * Math.min(1, bar)})`; p.path(A, true); g.fill(); g.restore(); }
  fitTxt(g, "मुन्द्रा · धाम्रा", 548, 290, 88, "#e8e2d6", 540);
  if (bar > 0) { g.save(); g.globalAlpha = Math.min(1, bar);
    for (const [a, b] of [[[66, 186], [262, 394]], [[66, 394], [262, 186]]]) { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L * 16, ny = dx / L * 16;
      const band = [[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]];
      p.clip(band, () => { for (let i = -2; i < 22; i++) { const t0 = i / 20, t1 = (i + 0.5) / 20; g.fillStyle = i % 2 ? "#f4efe6" : "#d0323a";
        g.beginPath(); g.moveTo(a[0] + dx * t0 - nx * 2 + 40, a[1] + dy * t0 - ny * 2); g.lineTo(a[0] + dx * t1 - nx * 2 + 40, a[1] + dy * t1 - ny * 2); g.lineTo(a[0] + dx * t1 + nx * 2 - 40, a[1] + dy * t1 + ny * 2); g.lineTo(a[0] + dx * t0 + nx * 2 - 40, a[1] + dy * t0 + ny * 2); g.fill(); } });
      p.poly(band, null, 4); }
    g.restore(); }
  // bottom board: given ports, lit
  const B = ARROW(60, 470, 780, 230, 1);
  p.poly(B, lit > 0.5 ? "#3a8a5a" : "#2f6a4a", 7); p.poly(ARROW(78, 486, 744, 198, 1), null, 4);
  fitTxt(g, "कान्डला · पारादीप", 420, 590, 92, "#f4efe6", 620);
  // little lamp over the lower board
  p.poly([[300, 440], [540, 440], [520, 462], [320, 462]], "#4a4a50", 4);
  if (lit > 0) { g.save(); g.globalAlpha = lit; const gr = g.createLinearGradient(0, 462, 0, 700); gr.addColorStop(0, "rgba(255,236,170,0.55)"); gr.addColorStop(1, "rgba(255,236,170,0)"); g.fillStyle = gr; g.beginPath(); g.moveTo(320, 462); g.lineTo(520, 462); g.lineTo(780, 700); g.lineTo(90, 700); g.fill(); g.restore(); }
};

// ---------- desk: the 2019 paper + checklist + calendar (1500 x 1000). st: { tick, row2, pending, year, flip, dust, web } ----------
export const drawDeskP = (p, st = {}) => {
  const g = p.g;
  p.poly([[0, 0], [1500, 0], [1500, 1000], [0, 1000]], "#7a5236", 0);
  for (let i = 0; i < 14; i++) p.stroke([[0, 40 + i * 70 + 10 * Math.sin(i)], [1500, 52 + i * 70]], 3, "rgba(40,20,10,0.18)");
  // paper
  g.save(); g.translate(400, 520); g.rotate(-0.03); g.translate(-400, -520);
  p.poly([[110, 80], [700, 80], [700, 950], [110, 950]], "#fbf6ea", 6);
  fitTxt(g, "सम्झौता", 405, 180, 96, INKP, 520); fitTxt(g, "२०१९", 405, 280, 64, "#8a4a2a", 300);
  for (let i = 0; i < 4; i++) p.stroke([[170, 360 + i * 36], [640 - (i % 2) * 90, 360 + i * 36]], 8, "rgba(60,50,40,0.25)");
  // checklist
  rrP(p, 170, 520, 70, 70, 8, "#ffffff", 5); tickP(p, 205, 556, 1.3, st.tick ?? 0);
  fitTxt(g, "सहमति", 270, 556, 54, INKP, 360, "left");
  if ((st.row2 ?? 0) > 0) { g.save(); g.globalAlpha = Math.min(1, st.row2); rrP(p, 170, 640, 70, 70, 8, "#ffffff", 5); fitTxt(g, "कागजी काम", 270, 676, 54, INKP, 380, "left"); g.restore(); }
  // two signature squiggles, no names
  for (const x of [190, 450]) { p.stroke([[x, 905], [x + 40, 880], [x + 70, 912], [x + 110, 872], [x + 150, 905]], 6, "#2a3a6a"); p.stroke([[x - 10, 925], [x + 180, 925]], 3, "rgba(60,50,40,0.4)"); }
  const pend = st.pending ?? 0;
  if (pend > 0) { g.save(); g.translate(420, 790); g.rotate(-0.16); g.scale(pend, pend); rrP(p, -120, -46, 240, 92, 14, "rgba(200,50,58,0.10)", 8, REDP); fitTxt(g, "बाँकी", 0, 4, 60, REDP, 200); g.restore(); }
  // dust + cobweb
  const dust = st.dust ?? 0;
  if (dust > 0) { g.fillStyle = `rgba(150,140,125,${0.32 * dust})`; g.fillRect(110, 80, 590, 870);
    for (let i = 0; i < 160 * dust; i++) { const x = 115 + ((i * 97) % 580), y = 85 + ((i * 131) % 860); g.fillStyle = "rgba(120,110,100,0.5)"; g.beginPath(); g.arc(x, y, 2 + (i % 3), 0, 7); g.fill(); } }
  g.restore();
  const web = st.web ?? 0;
  if (web > 0) { g.save(); g.globalAlpha = web; g.strokeStyle = "rgba(255,255,255,0.75)"; g.lineWidth = 2.5; const ox = 110, oy = 80;
    for (let k = 0; k <= 6; k++) { const a = (k / 6) * Math.PI / 2; g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + 260 * Math.cos(a), oy + 260 * Math.sin(a)); g.stroke(); }
    for (let r = 40; r < 260; r += 40) { g.beginPath(); for (let k = 0; k <= 6; k++) { const a = (k / 6) * Math.PI / 2, rr = r * (k % 2 ? 0.92 : 1); const x = ox + rr * Math.cos(a), y = oy + rr * Math.sin(a); k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
    g.restore(); }
  // calendar: the page for year-1 lifts away (bottom edge rising) and reveals this year underneath
  const cx = 1000, cy = 140, yr = st.year ?? 2019, fl = st.flip ?? 0;
  const face = (y) => {
    p.poly([[cx - 20, cy + 40], [cx + 440, cy + 40], [cx + 440, cy + 720], [cx - 20, cy + 720]], "#fbf6ea", 6);
    p.poly([[cx - 20, cy + 40], [cx + 440, cy + 40], [cx + 440, cy + 190], [cx - 20, cy + 190]], "#c8323a", 6);
    fitTxt(g, NEPN(y), cx + 210, cy + 400, 170, INKP, 400); fitTxt(g, "वर्ष", cx + 210, cy + 118, 62, "#fbf6ea", 300);
    const n = Math.max(0, Math.min(7, y - 2019)); for (let i = 0; i < n; i++) p.stroke([[cx + 40 + i * 52, cy + 560], [cx + 52 + i * 52, cy + 660]], 9, REDP); };
  face(yr);
  if (fl > 0 && fl < 1) { const hgt = 680 * (1 - fl), reg = [[cx - 26, cy + 34], [cx + 446, cy + 34], [cx + 446, cy + 40 + hgt], [cx - 26, cy + 40 + hgt]];
    p.clip(reg, () => face(yr - 1)); g.save(); g.fillStyle = "rgba(0,0,0,0.12)"; g.fillRect(cx - 20, cy + 40 + hgt, 460, 14); g.restore(); p.stroke([[cx - 20, cy + 40 + hgt], [cx + 440, cy + 40 + hgt]], 5, INKP); }
  for (let i = 0; i < 6; i++) p.ell(cx + 30 + i * 74, cy + 40, 10, 22, null, 5);
};

// ---------- coastline map (1000 x 1760: map on top, the two state cards stacked below). Coast only, no borders; Nepal is a pin in the faded north. ----------
// st: { req 0..1 (dashed request lines), st 0..1 (state glows), swap 0..1, tagN, tagS (0..1.1 drop), card 0..1 }
const LL = (lon, lat) => [(lon - 66) * 38.5, 140 + (30 - lat) * 38.5];
const COAST = [[66, 25.3], [67, 24.8], [67.6, 24], [68.3, 23.6], [68.7, 23.2], [69.2, 22.85], [69.7, 22.75], [70, 22.85], [70.22, 23.02], [70.35, 22.85], [70, 22.6], [69.5, 22.45], [69.07, 22.4], [68.97, 22.2], [69.6, 21.6], [70.4, 20.9], [71, 20.7], [71.6, 20.95], [72.2, 21.5], [72.6, 22.25], [72.8, 21.7], [72.75, 21.1], [72.85, 20.2], [72.85, 19], [73.1, 18], [73.4, 16.8], [73.8, 15.5], [74.3, 14.3], [74.8, 12.9], [75.4, 11.8], [75.8, 11], [76.2, 10], [76.6, 8.9], [77.1, 8.3], [77.55, 8.08], [78.1, 8.7], [78.4, 9.3], [79.2, 9.3], [78.95, 9.75], [79.3, 10.3], [79.85, 10.3], [79.85, 11.5], [80.15, 12.5], [80.3, 13.3], [80.15, 14.5], [80.1, 15.4], [80.9, 15.8], [81.3, 16.35], [82.2, 16.6], [82.4, 17], [83.3, 17.65], [84.1, 18.3], [84.9, 19.2], [85.5, 19.7], [86.2, 19.95], [86.68, 20.25], [86.85, 20.55], [86.96, 20.8], [87.1, 21.3], [87.6, 21.65], [88.1, 21.75], [88.6, 21.6], [89.1, 21.75], [89.7, 22], [90.4, 22.2], [91, 22.6], [91.6, 22.4], [92, 21.4]].map(([a, b]) => LL(a, b));
const LANKA = [[79.9, 9.8], [80.3, 9.8], [81.2, 8.5], [81.8, 7.2], [81.6, 6.4], [80.6, 5.95], [80.05, 6.3], [79.85, 7.5], [79.7, 8.2]].map(([a, b]) => LL(a, b));
export const PORTS_P = { mundra: LL(69.7, 22.75), kandla: LL(70.22, 23.02), dhamra: LL(86.96, 20.8), paradip: LL(86.68, 20.25) };
const NEPAL_PIN = [727, 205];
const CARDS_P = { guj: { x: 140, y: 1180, name: "गुजरात", asked: "मुन्द्रा", given: "कान्डला", hub: [180, 420], side: -1 }, odi: { x: 140, y: 1480, name: "ओडिशा", asked: "धाम्रा", given: "पारादीप", hub: [800, 505], side: 1 } };
const pinP = (p, x, y, s, col) => { p.poly([[x, y], [x - 22 * s, y - 40 * s], [x - 22 * s, y - 56 * s], [x, y - 76 * s], [x + 22 * s, y - 56 * s], [x + 22 * s, y - 40 * s]], col, 5); p.ell(x, y - 54 * s, 9 * s, 9 * s, "#ffffff", 3); };
const dashTo = (p, a, b, k, col, bend = -120) => { const g = p.g, m = [(a[0] + b[0]) / 2 + bend * 0.3, (a[1] + b[1]) / 2 + bend * 0.2], N = 40, pts = [];
  for (let i = 0; i <= N * k; i++) { const t = i / N; pts.push([(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * m[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * m[1] + t * t * b[1]]); }
  if (pts.length < 2) return; g.save(); g.setLineDash([18, 14]); p.stroke(pts, 7, col); g.restore();
  if (k >= 1) { const q1 = pts[pts.length - 2], q2 = pts[pts.length - 1]; arrowHeadB(p, q2[0], q2[1], Math.atan2(q2[1] - q1[1], q2[0] - q1[0]), 0.7, col); } };
const tagChip = (p, x, y, text, col, k) => { if (k <= 0) return; const g = p.g, dy = (1 - Math.min(1, k)) * -70 + (k > 1 ? (k - 1) * -24 : 0);
  g.save(); g.globalAlpha = Math.min(1, k * 1.5); rrP(p, x, y - 36 + dy, 190, 72, 36, col, 5); fitTxt(g, text, x + 95, y + 3 + dy, 46, "#fbf6ea", 160); g.restore(); };
export const drawCoastP = (p, st = {}) => {
  const g = p.g;
  // sea
  const sea = g.createLinearGradient(0, 0, 0, 1760); sea.addColorStop(0, "#8ec3e0"); sea.addColorStop(1, "#4f8cbc"); g.fillStyle = sea; g.fillRect(0, 0, 1000, 1760);
  for (let i = 0; i < 12; i++) p.stroke([[40 + (i * 173) % 900, 620 + (i * 97) % 460], [90 + (i * 173) % 900, 616 + (i * 97) % 460]], 4, "rgba(255,255,255,0.35)");
  // land (closed off the top edge), coast outline only along the shore
  const land = [...COAST, [1000, 21.4 * 0 + LL(92, 21.4)[1]], [1000, 0], [0, 0], [0, COAST[0][1]]];
  p.poly(land, "#efe2c0", 0); p.poly(LANKA, "#efe2c0", 5);
  p.stroke(COAST, 6, INKP);
  // fade the north to paper so no border is implied
  const fade = g.createLinearGradient(0, 250, 0, 370); fade.addColorStop(0, "rgba(242,232,214,1)"); fade.addColorStop(1, "rgba(242,232,214,0)"); g.fillStyle = fade; g.fillRect(0, 0, 1000, 370);
  g.fillStyle = "rgba(242,232,214,1)"; g.fillRect(0, 0, 1000, 250);
  // Nepal pin
  pinP(p, NEPAL_PIN[0], NEPAL_PIN[1], 1, "#c8323a"); fitTxt(g, "नेपाल", NEPAL_PIN[0] + 92, NEPAL_PIN[1] - 52, 48, INKP, 200);
  // state glows
  const sg = st.st ?? 0;
  if (sg > 0) for (const c of Object.values(CARDS_P)) glowP(g, c.hub[0], c.hub[1], 120, "255,190,90", 0.6 * sg);
  // port dots
  const sw = st.swap ?? 0;
  const dotP = (pt, asked) => { const on = asked ? 1 - 0.75 * sw : 0.35 + 0.65 * sw; g.save(); g.globalAlpha = 0.35 + 0.65 * on;
    if (!asked && sw > 0) glowP(g, pt[0], pt[1], 46, "255,214,120", 0.9 * sw);
    p.ell(pt[0], pt[1], 12, 12, asked ? ORGP : TEALP, 4); g.restore(); };
  dotP(PORTS_P.mundra, true); dotP(PORTS_P.dhamra, true); dotP(PORTS_P.kandla, false); dotP(PORTS_P.paradip, false);
  // request lines (orange, to the asked ports) -> after the swap, teal lines to the given ports
  const rq = st.req ?? 0;
  if (rq > 0) { g.save(); g.globalAlpha = 1 - 0.8 * sw; dashTo(p, NEPAL_PIN, CARDS_P.guj.hub, rq, ORGP, -260); dashTo(p, NEPAL_PIN, CARDS_P.odi.hub, rq, ORGP, 120); g.restore(); }
  if (sw > 0) { dashTo(p, NEPAL_PIN, CARDS_P.guj.hub, sw, TEALP, -330); dashTo(p, NEPAL_PIN, CARDS_P.odi.hub, sw, TEALP, 200); }
  // callout cards per state (720 x 260), stacked below the map
  const ck = st.card ?? 0;
  if (ck > 0) for (const c of Object.values(CARDS_P)) { g.save(); g.globalAlpha = Math.min(1, ck);
    const ex = c.side < 0 ? c.x : c.x + 720; g.save(); g.setLineDash([10, 10]); p.stroke([[c.hub[0], c.hub[1]], [c.hub[0] + (ex - c.hub[0]) * 0.3, c.y - 40], [ex, c.y + 40]], 5, "rgba(42,32,36,0.55)"); g.restore();
    rrP(p, c.x, c.y, 720, 260, 26, "#fbf6ea", 7);
    fitTxt(g, c.name, c.x + 360, c.y + 40, 40, "#7a6a5a", 400);
    const ay = c.y + 116, gy = c.y + 206;
    g.save(); g.globalAlpha = Math.min(1, ck) * (1 - 0.5 * sw); p.ell(c.x + 60, ay, 15, 15, ORGP, 4); fitTxt(g, c.asked, c.x + 95, ay + 3, 60, INKP, 270, "left");
    fitTxt(g, "माग", c.x + 330, ay + 3, 34, "#9a6a3a", 90); g.restore();
    if (sw > 0) { g.save(); g.globalAlpha = Math.min(1, ck); p.stroke([[c.x + 40, ay + 4], [c.x + 40 + 330 * sw, ay + 4]], 7, REDP); g.restore(); }
    g.save(); g.globalAlpha = Math.min(1, ck) * (0.4 + 0.6 * sw); if (sw > 0) glowP(g, c.x + 60, gy, 46, "255,214,120", 0.9 * sw); p.ell(c.x + 60, gy, 15, 15, TEALP, 4); fitTxt(g, c.given, c.x + 95, gy + 3, 60, INKP, 270, "left");
    if (sw > 0.5) tickP(p, c.x + 345, gy + 2, 0.9, Math.min(1, (sw - 0.5) * 2)); g.restore();
    tagChip(p, c.x + 500, ay, "निजी", SLATEP, st.tagN ?? 0); tagChip(p, c.x + 500, gy, "सरकारी", TEALP, st.tagS ?? 0);
    g.restore(); }
};

// ---------- lectern (700 x 520) + empty speech bubble (700 x 460) ----------
export const drawLecternP = (p) => { p.poly([[120, 30], [580, 30], [530, 520], [170, 520]], "#7a5236", 7); p.poly([[90, 0], [610, 0], [620, 50], [80, 50]], "#5a3a26", 6);
  p.stroke([[200, 140], [500, 140]], 5, "rgba(255,255,255,0.15)"); for (const x of [240, 460]) p.stroke([[x, 34], [x + 6, 0], [x + 12, -40]], 6, "#3a3a40"); };
export const drawSayP = (p, st = {}) => { const g = p.g;
  p.poly([[40, 40], [660, 40], [660, 330], [260, 330], [170, 430], [190, 330], [40, 330]], "#ffffff", 8);
  fitTxt(g, "कारण:", 200, 140, 64, INKP, 260);
  g.save(); g.setLineDash([22, 16]); p.stroke([[330, 160], [610, 160]], 6, "rgba(42,32,36,0.45)"); g.restore();
  const d = st.dots ?? 0; for (let i = 0; i < 3; i++) p.dot(270 + i * 80, 250, 16, i < d ? "#8a8a90" : "rgba(138,138,144,0.25)"); };

// ---------- Birgunj shop backdrop (1600 x 1100), counter (1600 x 380) ----------
export const drawShopP = (p) => { const g = p.g;
  p.poly([[0, 0], [1600, 0], [1600, 1100], [0, 1100]], "#e8d6b0", 0);
  rrP(p, 520, 40, 480, 150, 14, "#2a3a5a", 7); fitTxt(g, "वीरगञ्ज", 760, 118, 92, "#f2e2b0", 420);
  for (let r = 0; r < 3; r++) { const y = 360 + r * 230; p.poly([[60, y], [1540, y], [1540, y + 24], [60, y + 24]], "#7a5236", 5);
    for (let i = 0; i < 9; i++) { const x = 120 + i * 160 + (r % 2) * 40; if (x > 1500) continue;
      if ((i + r) % 3 === 0) { p.poly([[x - 52, y], [x + 52, y], [x + 46, y - 120], [x - 46, y - 120]], "#c8b48a", 4); p.stroke([[x - 40, y - 100], [x + 40, y - 100]], 4, "rgba(80,60,30,0.4)"); }
      else if ((i + r) % 3 === 1) { p.poly([[x - 56, y], [x + 56, y], [x + 56, y - 90], [x - 56, y - 90]], "#b88a5a", 4); p.stroke([[x - 56, y - 45], [x + 56, y - 45]], 3, "rgba(60,40,20,0.4)"); }
      else { for (let k = 0; k < 3; k++) p.poly([[x - 50 + k * 34, y], [x - 22 + k * 34, y], [x - 22 + k * 34, y - 70], [x - 50 + k * 34, y - 70]], ["#e8c23a", "#3a6a8a", "#c8323a"][k], 3); } } } };
export const drawCounterP = (p) => { p.poly([[0, 40], [1600, 40], [1600, 380], [0, 380]], "#8a5a3a", 7); p.poly([[-10, 0], [1610, 0], [1610, 50], [-10, 50]], "#5a3a26", 6);
  for (let i = 0; i < 6; i++) p.stroke([[120 + i * 260, 90], [120 + i * 260, 340]], 4, "rgba(0,0,0,0.18)");
  p.poly([[1160, 0], [1290, 0], [1280, -120], [1170, -120]], "#f2ecdf", 4); for (let k = 0; k < 4; k++) p.stroke([[1185, -95 + k * 22], [1265, -95 + k * 22]], 3, "rgba(0,0,0,0.25)"); };

// ---------- thought bubble: a government building hands over a key (900 x 760). st: { key 0..1, tag 0..1 } ----------
export const drawThinkP = (p, st = {}) => { const g = p.g;
  const blobs = [[450, 330, 380, 260], [200, 300, 160, 140], [700, 300, 170, 150], [330, 160, 160, 120], [580, 160, 170, 120], [300, 480, 170, 110], [600, 480, 170, 110]];
  for (const [x, y, rx, ry] of blobs) p.ell(x, y, rx, ry, "#ffffff", 8); for (const [x, y, rx, ry] of blobs) p.ell(x, y, rx - 8, ry - 8, "#ffffff", 0);
  p.ell(150, 650, 40, 32, "#ffffff", 6); p.ell(90, 720, 22, 18, "#ffffff", 5);
  // building
  const bx = 300, by = 470; p.poly([[bx - 150, by], [bx + 150, by], [bx + 150, by - 30], [bx - 150, by - 30]], "#d8cbb4", 5);
  for (let i = 0; i < 5; i++) p.poly([[bx - 125 + i * 60, by - 30], [bx - 105 + i * 60, by - 30], [bx - 105 + i * 60, by - 200], [bx - 125 + i * 60, by - 200]], "#f2ecdf", 4);
  p.poly([[bx - 165, by - 200], [bx + 165, by - 200], [bx, by - 300]], "#e8dcc6", 5);
  rrP(p, bx - 110, by - 270 + 10, 220, 56, 10, "#2a3a5a", 4); fitTxt(g, "सरकारी पोर्ट", bx, by - 230 + 2, 34, "#f2e2b0", 200);
  // key sliding right toward a small truck
  const k = st.key ?? 0, kx = 420 + 230 * k, ky = 360;
  p.ell(kx, ky, 34, 34, "#f2c84a", 5); p.ell(kx, ky, 12, 12, "#ffffff", 4);
  p.poly([[kx + 30, ky - 9], [kx + 130, ky - 9], [kx + 130, ky + 9], [kx + 30, ky + 9]], "#f2c84a", 5);
  p.poly([[kx + 100, ky + 9], [kx + 114, ky + 9], [kx + 114, ky + 34], [kx + 100, ky + 34]], "#f2c84a", 4);
  // small truck at the right
  const tx = 690, ty = 520; p.poly([[tx - 70, ty], [tx + 30, ty], [tx + 30, ty - 70], [tx - 70, ty - 70]], "#e05a2a", 5); p.poly([[tx + 30, ty], [tx + 80, ty], [tx + 80, ty - 40], [tx + 60, ty - 60], [tx + 30, ty - 60]], "#2f5f9e", 5);
  for (const x of [tx - 40, tx + 55]) p.ell(x, ty + 8, 16, 16, "#1e1e24", 4);
  // अनुमान tag
  const tg = st.tag ?? 0; if (tg > 0) { g.save(); g.globalAlpha = Math.min(1, tg); g.translate(590, 165); g.rotate(0.06); g.scale(Math.min(1.08, tg), Math.min(1.08, tg)); rrP(p, -120, -42, 240, 84, 42, ORGP, 5); fitTxt(g, "अनुमान", 0, 4, 52, "#fbf6ea", 200); g.restore(); }
};

// ---------- ships, side view (2400 x 800), bow to the right. kind: "container" | "bulk" ----------
const CCOL = ["#c8323a", "#2f5f9e", "#2f7a5a", "#e8a21e", "#6a6a72", "#8a2a3a", "#3a8a9a", "#d86a2a"];
export const drawShipP = (p, kind = "container") => { const g = p.g;
  const hull = [[90, 520], [2160, 520], [2330, 540], [2260, 760], [180, 760], [110, 700]];
  if (kind === "container") {
    for (let c = 0; c < 15; c++) { const x = 360 + c * 116, tiers = 6 + ((c * 7) % 3);
      for (let t = 0; t < tiers; t++) { const y = 520 - (t + 1) * 52; p.poly([[x, y], [x + 110, y], [x + 110, y + 50], [x, y + 50]], CCOL[(c * 3 + t * 5) % 8], 3); p.stroke([[x + 18, y + 8], [x + 18, y + 42]], 3, "rgba(0,0,0,0.2)"); p.stroke([[x + 92, y + 8], [x + 92, y + 42]], 3, "rgba(0,0,0,0.2)"); } }
  } else {
    for (let h = 0; h < 6; h++) { const x = 420 + h * 270; p.poly([[x, 520], [x + 200, 520], [x + 190, 470], [x + 10, 470]], "#5a7a5a", 5); p.stroke([[x + 30, 492], [x + 170, 492]], 4, "rgba(0,0,0,0.2)"); }
    for (let c = 0; c < 4; c++) { const x = 600 + c * 400; p.poly([[x - 12, 520], [x + 12, 520], [x + 10, 300], [x - 10, 300]], "#e8c23a", 4); p.stroke([[x, 310], [x + 150, 400]], 10, "#e8c23a"); }
  }
  // superstructure at the stern
  p.poly([[130, 520], [330, 520], [330, 180], [150, 180]], "#f2f0ea", 6); p.poly([[120, 180], [350, 180], [350, 150], [120, 150]], "#e0ded8", 5);
  for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) p.poly([[160 + c * 42, 220 + r * 58], [190 + c * 42, 220 + r * 58], [190 + c * 42, 246 + r * 58], [160 + c * 42, 246 + r * 58]], "#3a4a5e", 0);
  p.poly([[220, 150], [290, 150], [285, 70], [225, 70]], "#3a3a40", 5);
  p.poly(hull, kind === "container" ? "#24304a" : "#5a2a2a", 7);
  p.poly([[110, 700], [180, 760], [2260, 760], [2290, 690]], "#a8302e", 0);
  p.stroke([[100, 560], [2200, 560]], 5, "rgba(255,255,255,0.4)");
};
// a single container (600 x 260) for the crane
export const drawBoxP = (p, col = "#2f7a5a") => { p.poly([[10, 20], [590, 20], [590, 250], [10, 250]], col, 7); for (let x = 40; x < 580; x += 30) p.stroke([[x, 34], [x, 236]], 4, "rgba(0,0,0,0.18)"); p.stroke([[300, 0], [300, 20]], 6, INKP); };
// small cargo tag (420 x 150)
export const drawTagP = (p, text, col = "#2a3a5a") => { rrP(p, 10, 10, 400, 130, 26, col, 6); fitTxt(p.g, text, 210, 78, 74, "#f4efe6", 360); };

// ---------- doors are 3D (world.js); trader poses ----------
POSES.knockL = (c) => { const S = c.sh(-1); return [{ pts: [S, [c.tcx - 1.2 * c.T.a - 26 * c.u, S[1] - 0.05 * c.HH], [c.tcx - 1.25 * c.T.a - 40 * c.u, S[1] - 0.42 * c.HH]], front: false }, { pts: c.hang(1, 0), front: false }]; };
POSES.knockL2 = (c) => { const S = c.sh(-1); return [{ pts: [S, [c.tcx - 1.2 * c.T.a - 30 * c.u, S[1] - 0.08 * c.HH], [c.tcx - 1.25 * c.T.a - 66 * c.u, S[1] - 0.36 * c.HH]], front: false }, { pts: c.hang(1, 0), front: false }]; };
export const OUT_TRADER = { jacket: "#5f7896", pants: "#3a3f52", boots: "#3a2a22", skin: "#c99067", hat: "hair", hair: "#1a1414", moustache: "#2a1d18", build: "stout" };
export const drawTraderP = (p, st = {}) => drawPerson(p, OUT_TRADER, { topi: "#7a2f52", ...st });

// ---------- extras (v2): gull (200 x 120, flap 0..1), hourglass (400 x 600, k = sand fallen 0..1) ----------
export const drawGullP = (p, flap = 0) => { const y = 60 - 30 * flap;
  p.stroke([[20, y], [70, 70 - 6 * flap], [100, 74], [130, 70 - 6 * flap], [180, y]], 9, "#3a3a44"); p.ell(100, 76, 10, 7, "#f4f2ec", 0); };
export const drawHourglassP = (p, k = 0) => { const g = p.g;
  p.poly([[60, 30], [340, 30], [340, 70], [60, 70]], "#7a5236", 6); p.poly([[60, 530], [340, 530], [340, 570], [60, 570]], "#7a5236", 6);
  const glass = [[90, 70], [310, 70], [215, 300], [310, 530], [90, 530], [185, 300]];
  p.poly(glass, "rgba(220,236,246,0.85)", 6);
  p.clip(glass, () => { const top = 90 + 190 * k, bot = 520 - 200 * k;
    p.poly([[80, top], [320, top], [200, 300], [200, 300]], "#e8b84a", 0);
    p.poly([[80, 540], [320, 540], [320, bot], [200, bot - 40 * Math.min(1, k * 2)], [80, bot]], "#e8b84a", 0);
    if (k < 0.98) p.stroke([[200, 300], [200, bot - 30]], 6, "#e8b84a"); });
  p.poly(glass, null, 6);
  for (const x of [72, 328]) p.stroke([[x, 70], [x, 530]], 10, "#5a3a26");
};

// ================= "के तपाईं कालो हुनुहुन्छ?" (skin-colour) cast (appended after port.js, same module scope) =================
// Rules (scripts/skin-colour.md, guides/sensitive-topics.md 5): house style only; skin tone changes ONLY the fill colour (no
// exaggerated lips, noses or hair, no "tribal" costume, no stereotyped props). The joke is on the teasing, never on the person.
// The ancient Briton is our own bean-head (dark skin, short dark curly hair, blue eyes, simple furs). No flags, no real people.

const TONE = { d1: "#6e452e", d2: "#7e5034", d3: "#8d5b3b", m1: "#a8714a", m2: "#c08458", l1: "#d9a57a", l2: "#e8c09c", l3: "#f3d6bc" };
const INKS = "#2a2024";
const fitS = (g, s, x, y, px, col, maxW, align = "center") => { g.save(); let f = px; g.font = `bold ${f}px ${DEVA}`;
  while (g.measureText(s).width > maxW && f > 10) { f -= 2; g.font = `bold ${f}px ${DEVA}`; }
  g.textAlign = align; g.textBaseline = "middle"; g.fillStyle = col; g.fillText(s, x, y); g.restore(); };
const rrS = (p, x, y, w, h, r, col, lw = 6) => { const g = p.g; g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = col; g.fill(); if (lw) { g.lineWidth = lw; g.strokeStyle = INKS; g.stroke(); } };
const glowS = (g, x, y, r, rgb, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); };

// short curly hair over the crown (hat: null)
const curls = (p, c, col = "#1a1414") => { const { cx, hc, H, u } = c;
  for (let row = 0; row < 3; row++) for (let i = 0; i <= 12; i++) { const a = Math.PI * (1.08 + 0.84 * i / 12), rr = 1 - row * 0.16;
    const x = cx + H.a * rr * Math.cos(a), y = hc + H.b * rr * Math.sin(a) + row * 2 * u; if (row && y > hc - H.b * 0.45) continue;
    p.ell(x, y, 6.5 * u, 6 * u, col, 1.4 * u); } };

POSES.hugR = (c) => { const S = c.sh(1); return [{ pts: c.hang(-1, 0), front: false }, { pts: [S, [c.tcx + 1.2 * c.T.a + 40 * c.u, S[1] - 0.06 * c.HH], [c.tcx + 1.2 * c.T.a + 96 * c.u, S[1] - 0.02 * c.HH]], front: true }]; };
POSES.laughHold = (c) => [-1, 1].map((s) => { const S = c.sh(s); return { pts: [S, [c.tcx + s * (1.1 * c.T.a + 8 * c.u), S[1] + 0.4 * c.HH], [c.tcx + s * 0.4 * c.T.a, c.torsoBot - 0.3 * c.HH]], front: true }; });

// ---------- the two friends on the chowk (600 x 1000) ----------
const OUT_DAI = { jacket: "#e0a030", pants: "#2f3a56", boots: "#f2f0ea", skin: TONE.d2, hat: "hair", hair: "#141010", build: "adult" };
const OUT_TEASE = { jacket: "#2f8a8a", pants: "#3a3f52", boots: "#2a2a30", skin: TONE.l1, hat: "hair", hair: "#1a1414", build: "adult" };
export const drawFriendS = (p, who, st = {}) => {
  const o = who === "dai" ? OUT_DAI : OUT_TEASE, pose = st.pose ?? ["hang", "hang", 0];
  bodyFront(p, o, { mode: st.mode ?? "stand", phase: st.phase ?? 0, lift: 34, seed: who === "dai" ? 1201 : 1202, expr: st.expr ?? "smile", blink: st.blink ?? 0, look: st.look ?? 0, headTilt: st.headTilt ?? 0,
    armFn: armBlend(pose[0], pose[1], pose[2]),
    front: (c) => { const { tcx, T, HH, chin, u } = c; // hoodie strings / tee collar
      if (who === "dai") { for (const s of [-1, 1]) p.stroke([[tcx + s * 0.12 * T.a, chin + 0.04 * HH], [tcx + s * 0.14 * T.a, chin + 0.3 * HH]], 2.5 * u, "#f2ecdf"); p.arc(tcx, chin + 0.02 * HH, 0.5 * T.a, 0.12 * HH, 20, 160, 3 * u, "rgba(0,0,0,0.25)"); }
      else p.arc(tcx, chin + 0.01 * HH, 0.32 * T.a, 0.08 * HH, 10, 170, 3 * u, "rgba(255,255,255,0.6)"); },
    headExtra: (c) => { if (st.sweat) p.ell(c.cx + 0.45 * c.W, c.hc - 0.2 * c.HH, 3 * c.u, 5 * c.u, "#9fd4ff", 2 * c.u); } });
};

// ---------- early humans on the savanna (600 x 1000): plain earth-tone wraps, short curly hair, no props ----------
const EARLY = [TONE.d1, TONE.d2, TONE.d3, TONE.d1, TONE.d2];
export const drawEarlyS = (p, v, st = {}) => {
  const o = { jacket: ["#b88a5a", "#a87a4a", "#c49a6a"][v % 3], pants: ["#8a6a48", "#7a5a3a"][v % 2], boots: EARLY[v % 5], skin: EARLY[v % 5], hat: null, build: v === 4 ? "kid" : "adult" };
  bodyFront(p, o, { mode: st.mode ?? "stroll", phase: st.phase ?? 0, lift: 34, seed: 1300 + v, expr: st.expr ?? "smile", blink: st.blink ?? 0, look: st.look ?? 0.4, facing: st.facing ?? 0,
    armFn: armBlend("hang", "hang", 0), headExtra: (c) => curls(p, c) });
};

// ---------- travellers in the cold north (600 x 1000): hooded fur cloak; tone varies ----------
export const drawTravS = (p, tone, st = {}) => {
  const o = { jacket: "#7a6a5a", pants: "#4a4038", boots: "#3a2a22", skin: tone, hat: null, build: "adult" };
  bodyFront(p, o, { mode: "stroll", phase: st.phase ?? 0, lift: 34, seed: st.seed ?? 1400, expr: st.expr ?? "smile", blink: 0, look: st.look ?? 0.5, facing: st.facing ?? 0,
    armFn: armBlend("hang", "hang", 0),
    front: (c) => { const { tcx, T, HH, chin, u, torsoBot } = c; p.poly([[tcx - 1.05 * T.a, chin + 0.02 * HH], [tcx + 1.05 * T.a, chin + 0.02 * HH], [tcx + 1.15 * T.a, torsoBot + 0.1 * HH], [tcx - 1.15 * T.a, torsoBot + 0.1 * HH]], "#8a7a68", 2.5 * u);
      for (let i = 0; i < 7; i++) p.ell(tcx - T.a + i * 0.33 * T.a, chin + 0.03 * HH, 7 * u, 5 * u, "#d8ccb8", 1.4 * u); },
    headExtra: (c) => { const { cx, hc, H, u } = c; p.arc(cx, hc + 0.05 * H.b, H.a * 1.16, H.b * 1.12, 180, 360, 10 * u, "#8a7a68"); curls(p, c, "#241a16"); } });
};

// ---------- the ancient Briton (600 x 1000): dark skin, short dark curly hair, BLUE eyes, simple furs ----------
export const drawBritonS = (p, st = {}) => {
  const o = { jacket: "#8a6a48", pants: "#5a4434", boots: "#4a3626", skin: TONE.d1, hat: null, build: "adult" };
  const gl = st.glint ?? 0, look = st.look ?? 0;
  bodyFront(p, o, { mode: "stand", lift: 34, seed: 1501, expr: "neutral", blink: 0, look, back: true, headTilt: st.headTilt ?? 0,
    armFn: armBlend("hang", "hang", 0),
    front: (c) => { const { tcx, T, HH, chin, u, torsoBot } = c; // fur over the shoulders, a simple belt
      for (let i = 0; i < 9; i++) p.ell(tcx - 1.05 * T.a + i * 0.26 * T.a, chin + 0.05 * HH + (i % 2) * 4 * u, 9 * u, 7 * u, "#a8865e", 1.6 * u);
      p.stroke([[tcx - 0.95 * T.a, torsoBot - 0.14 * HH], [tcx + 0.95 * T.a, torsoBot - 0.14 * HH]], 4 * u, "#4a3626"); },
    headExtra: (c) => { const { cx, hc, u } = c; curls(p, c, "#18120f");
      const lx = look * 3 * u;
      for (const s of [-1, 1]) { const x = cx + s * 13 * u, y = hc;
        p.ell(x, y, 7.5 * u, 7 * u, "#ffffff", 1.6 * u); p.ell(x + lx, y + 0.5 * u, 4.8 * u, 4.8 * u, "#3a8ad8", 0); p.ell(x + lx, y + 0.5 * u, 2.2 * u, 2.2 * u, INKS, 0);
        p.ell(x + lx + 1.6 * u, y - 1.4 * u, (1.3 + 1.4 * gl) * u, (1.3 + 1.4 * gl) * u, "#ffffff", 0);
        taper(p, [x - s * 8.5 * u, hc - 20 * u], [x + s * 8.5 * u, hc - 21 * u], 5 * u, 2.5 * u); }
      mouth(p, st.expr === "smile" ? "smirk" : "dash", cx, hc + 20 * u, u);
      if (gl > 0) for (const s of [-1, 1]) glowS(p.g, cx + s * 13 * u + lx + 1.6 * u, hc - 1.4 * u, 16 * u, "200,230,255", 0.7 * gl); } });
};

// ---------- world map (1600 x 900): continents only, no borders. st: { conv 0..1, pin 0..1.1, steps 0..1, clouds 0..1 } ----------
const WX = (lon) => (lon + 180) * 4.444, WY = (lat) => 60 + (80 - lat) * 5.6;
const WP = (pts) => pts.map(([a, b]) => [WX(a), WY(b)]);
const AFR = WP([[-17, 21], [-16, 12], [-8, 4.5], [5, 4], [9, 4], [10, -2], [13, -12], [12, -18], [18, -34], [26, -34], [32, -28], [35, -20], [40, -15], [40, -5], [51, 11], [43, 12], [37, 18], [33, 28], [32, 31], [20, 32], [10, 37], [-2, 35], [-6, 36], [-10, 30]]);
const EUR = WP([[-10, 36], [-9, 43], [-2, 44], [-5, 48], [2, 51], [8, 54], [5, 58], [10, 63], [20, 70], [30, 71], [45, 68], [60, 70], [80, 73], [100, 77], [120, 73], [140, 72], [160, 70], [180, 66], [180, 62], [160, 58], [156, 51], [142, 52], [140, 45], [130, 42], [127, 35], [122, 40], [120, 30], [110, 20], [108, 11], [105, 9], [100, 13], [98, 8], [100, 3], [104, 1], [98, 16], [94, 16], [90, 22], [85, 20], [80, 15], [77, 8], [73, 20], [67, 25], [57, 25], [56, 27], [50, 30], [48, 29], [55, 24], [59, 22], [52, 16], [43, 13], [36, 28], [35, 32], [36, 36], [30, 36], [26, 38], [26, 41], [23, 36], [20, 40], [15, 38], [12, 44], [8, 44], [3, 43], [-1, 37], [-6, 36]]);
const UK = WP([[-5, 50], [1, 51], [2, 53], [-1, 57], [-3, 59], [-6, 58], [-5, 55], [-3, 54], [-5, 52]]);
const NAM = WP([[-168, 66], [-140, 70], [-110, 72], [-80, 72], [-65, 60], [-55, 52], [-66, 45], [-75, 38], [-81, 31], [-80, 25], [-82, 29], [-90, 30], [-97, 26], [-97, 20], [-90, 16], [-84, 10], [-79, 8], [-86, 14], [-95, 16], [-105, 20], [-110, 24], [-117, 32], [-124, 40], [-124, 48], [-135, 58], [-150, 60], [-165, 62]]);
const SAM = WP([[-79, 8], [-72, 12], [-60, 10], [-50, 0], [-35, -5], [-39, -15], [-48, -26], [-58, -35], [-65, -42], [-70, -55], [-75, -50], [-73, -40], [-71, -20], [-80, -5]]);
const AUS = WP([[114, -22], [122, -17], [130, -12], [137, -12], [142, -11], [146, -19], [153, -26], [150, -37], [140, -38], [132, -32], [115, -34]]);
const GRL = WP([[-50, 60], [-20, 70], [-22, 79], [-60, 79], [-73, 76]]);
const MDG = WP([[44, -12], [50, -15], [47, -25], [44, -24]]);
export const AFRICA_PIN = [WX(22), WY(4)];
const FAR = [[10, 50], [115, 35], [135, -25], [-100, 40], [-60, -15], [78, 22], [100, 60]].map(([a, b]) => [WX(a), WY(b)]);
export const drawWorldS = (p, st = {}) => {
  const g = p.g, sea = g.createLinearGradient(0, 0, 0, 900); sea.addColorStop(0, "#8ec3e0"); sea.addColorStop(1, "#6aa6d0"); g.fillStyle = sea; g.fillRect(0, 0, 1600, 900);
  for (const c of [NAM, SAM, GRL, EUR, AFR, AUS, UK, MDG]) p.poly(c, c === AFR ? "#f0d090" : "#efe2c0", 5);
  // convergence lines: from everywhere back to Africa (drawn from the far ends inward)
  const cv = st.conv ?? 0;
  if (cv > 0) { g.save(); g.setLineDash([14, 12]);
    for (const [x, y] of FAR) { const k = Math.min(1, cv * 1.2); p.stroke([[x, y], [x + (AFRICA_PIN[0] - x) * k, y + (AFRICA_PIN[1] - y) * k]], 6, "rgba(200,90,40,0.85)"); p.ell(x, y, 9, 9, "#c85a28", 3); }
    g.restore();
    const fl = st.flow ?? -1; if (fl >= 0) for (const [x, y] of FAR) for (let j = 0; j < 3; j++) { const u = ((fl + j / 3) % 1) * Math.min(1, cv * 1.2); p.ell(x + (AFRICA_PIN[0] - x) * u, y + (AFRICA_PIN[1] - y) * u, 9, 9, "#fff2c8", 3); } }
  const pin = st.pin ?? 0;
  if (pin > 0) { const [x, y] = AFRICA_PIN, dy = (1 - Math.min(1, pin)) * -160 + (pin > 1 ? (pin - 1) * -30 : 0); glowS(g, x, y, 120, "255,190,90", 0.5 * Math.min(1, pin));
    p.poly([[x, y + dy], [x - 26, y - 48 + dy], [x - 26, y - 66 + dy], [x, y - 90 + dy], [x + 26, y - 66 + dy], [x + 26, y - 48 + dy]], "#c8323a", 5); p.ell(x, y - 64 + dy, 10, 10, "#ffffff", 3);
    if (pin >= 1) { rrS(p, x - 110, y + 14, 220, 64, 32, "#fbf6ea", 5); fitS(g, "अफ्रिका", x, y + 48, 44, INKS, 190); } }
  // footprints north into the grey clouds
  const sp = st.steps ?? 0;
  if (sp > 0) { const a = [WX(32), WY(14)], b = [WX(12), WY(50)], n = 14;
    for (let i = 0; i < n * sp; i++) { const t = i / n, x = a[0] + (b[0] - a[0]) * t + (i % 2 ? 8 : -8), y = a[1] + (b[1] - a[1]) * t; p.ell(x, y, 6, 9, "rgba(90,60,40,0.85)", 0, 0, 360, -0.5); } }
  const cl = st.clouds ?? 0;
  if (cl > 0) { g.save(); g.globalAlpha = cl; for (const [x, y, r] of [[WX(5), WY(56), 60], [WX(22), WY(58), 70], [WX(-2), WY(52), 50], [WX(35), WY(62), 60], [WX(12), WY(64), 55]]) { p.ell(x, y, r * 1.3, r * 0.7, "rgba(150,158,170,0.92)", 4); } g.restore(); }
};

// ---------- the sun-shield insert (1000 x 1780, 9:16). st: { t (ray phase), shield 0..1.1 } ----------
export const drawShieldS = (p, st = {}) => {
  const g = p.g, sk = g.createLinearGradient(0, 0, 0, 1780); sk.addColorStop(0, "#f2a850"); sk.addColorStop(0.55, "#f8d890"); sk.addColorStop(1, "#e8c880"); g.fillStyle = sk; g.fillRect(0, 0, 1000, 1780);
  p.poly([[0, 1330], [1000, 1300], [1000, 1780], [0, 1780]], "#c8a860", 0); for (let i = 0; i < 30; i++) p.stroke([[(i * 97) % 1000, 1340 + (i * 53) % 400], [(i * 97) % 1000 + 6, 1320 + (i * 53) % 400]], 5, "rgba(120,100,50,0.4)");
  glowS(g, 220, 330, 300, "255,240,180", 0.9); p.ell(220, 330, 110, 110, "#fff2b0", 6);
  const ay = 1170; p.poly([[-20, ay - 70], [760, ay - 80], [800, ay - 60], [800, ay + 60], [760, ay + 80], [-20, ay + 90]], TONE.d2, 7);
  p.ell(830, ay - 6, 90, 78, TONE.d2, 7); for (let i = 0; i < 4; i++) p.ell(905 + 10 * Math.abs(i - 1.5), ay - 50 + i * 32, 28, 16, TONE.d2, 5);
  p.stroke([[120, ay - 30], [520, ay - 40]], 6, "rgba(255,255,255,0.18)");
  const t = st.t ?? 0;
  for (let i = 0; i < 4; i++) { const sx = 300 + i * 110, hx = 260 + i * 150, hy = ay - 78, u = (t + i * 0.25) % 1;
    p.stroke([[sx, 430], [hx, hy]], 7, "rgba(255,200,60,0.65)"); p.stroke([[hx, hy], [hx + 160, hy - 260]], 7, "rgba(255,230,140,0.45)");
    const px = u < 0.5 ? sx + (hx - sx) * u * 2 : hx + 160 * (u - 0.5) * 2, py = u < 0.5 ? 430 + (hy - 430) * u * 2 : hy - 260 * (u - 0.5) * 2; p.ell(px, py, 12, 12, "#fff6c8", 3);
    glowS(g, hx, hy, 46, "255,240,200", 0.7); }
  const sh = st.shield ?? 0;
  if (sh > 0) { g.save(); g.translate(660, 680); g.scale(Math.min(1.1, sh), Math.min(1.1, sh)); glowS(g, 0, 0, 220, "255,255,255", 0.5);
    p.poly([[-130, -150], [130, -150], [130, 10], [0, 170], [-130, 10]], "#3a8a6a", 8); p.poly([[-104, -126], [104, -126], [104, 0], [0, 136], [-104, 0]], null, 4);
    p.ell(0, -20, 46, 46, "#f6c84a", 5); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; p.stroke([[66 * Math.cos(a), -20 + 66 * Math.sin(a)], [84 * Math.cos(a), -20 + 84 * Math.sin(a)]], 8, "#f6c84a"); }
    p.stroke([[-80, 60], [80, -100]], 12, "#c8323a"); g.restore(); }
};

// ---------- colour bar + vitamin D (1000 x 520). st: { k 0..1 (slider), d 0..1 (D fill) } ----------
export const drawBarS = (p, st = {}) => { const g = p.g, k = st.k ?? 0, d = st.d ?? 0;
  rrS(p, 10, 10, 980, 500, 36, "rgba(251,246,234,0.94)", 6);
  const gr = g.createLinearGradient(80, 0, 640, 0); [TONE.d1, TONE.d3, TONE.m2, TONE.l1, TONE.l3].forEach((c, i) => gr.addColorStop(i / 4, c));
  g.fillStyle = gr; g.beginPath(); g.roundRect(80, 200, 560, 90, 45); g.fill(); g.lineWidth = 6; g.strokeStyle = INKS; g.stroke();
  const hx = 120 + 480 * k; p.poly([[hx - 22, 170], [hx + 22, 170], [hx + 22, 320], [hx - 22, 320]], "#fbf6ea", 6); p.poly([[hx - 18, 150], [hx + 18, 150], [hx, 176]], INKS, 0);
  fitS(g, "छाला", 360, 380, 44, "#6a5a4a", 300);
  // vitamin D sun-drop
  const cx = 820, cy = 250; p.ell(cx, cy, 120, 120, "#fbf6ea", 7);
  g.save(); g.beginPath(); g.arc(cx, cy, 114, 0, 7); g.clip(); g.fillStyle = "#f6c84a"; g.fillRect(cx - 120, cy + 114 - 228 * d, 240, 240); g.restore();
  p.ell(cx, cy, 120, 120, null, 7); fitS(g, "डी", cx, cy + 6, 110, INKS, 180);
  fitS(g, "भिटामिन", cx, cy + 170, 40, "#6a5a4a", 220);
};

// ---------- timeline ruler (700 x 3200), time flows top -> bottom; st: { tip 0..1 } ----------
export const RULER = { top: 260, bot: 3050 };
export const drawRulerS = (p, st = {}) => { const g = p.g, T0 = RULER.top, T1 = RULER.bot, L = T1 - T0, x0 = 300, w = 120;
  g.fillStyle = "#f2e8d6"; g.fillRect(0, 0, 700, 3200);
  fitS(g, "३,००,००० वर्षअघि", 350, 120, 56, INKS, 640); fitS(g, "मान्छे: अफ्रिकामा", 350, 190, 40, "#7a6a5a", 600);
  const gr = g.createLinearGradient(0, T0, 0, T1); gr.addColorStop(0, TONE.d2); gr.addColorStop(1, TONE.d3); g.fillStyle = gr; g.fillRect(x0, T0, w, L);
  for (let i = 0; i <= 30; i++) { const y = T0 + L * i / 30; p.stroke([[x0 - (i % 5 ? 20 : 44), y], [x0, y]], i % 5 ? 4 : 7, INKS); }
  // 10,000 years ago marker (the Briton) and the last ~3,000 years (pale skin common in Europe)
  const y10 = T1 - L * 10000 / 300000, y3 = T1 - L * 3000 / 300000, tip = st.tip ?? 0;
  p.stroke([[x0 + w, y10], [x0 + w + 24, y10]], 6, "#3a8ad8"); fitS(g, "१०,०००", x0 + w + 32, y10 + 62, 36, "#2a5a9a", 110, "left");
  { const hx = 620, hy = y10 - 6, r = 44; p.ell(hx, hy, r, r * 1.08, TONE.d1, 5); for (let i = 0; i <= 8; i++) { const a = Math.PI * (1.1 + 0.8 * i / 8); p.ell(hx + r * Math.cos(a), hy + r * 1.05 * Math.sin(a), 11, 10, "#18120f", 2); }
    for (const sx of [-1, 1]) { p.ell(hx + sx * 14, hy + 4, 9, 9, "#ffffff", 2); p.ell(hx + sx * 14, hy + 5, 5.5, 5.5, "#3a8ad8", 0); } }
  g.fillStyle = TONE.l2; g.fillRect(x0, y3, w, T1 - y3);
  if (tip > 0) { glowS(g, x0 + w / 2, (y3 + T1) / 2, 170, "255,230,170", 0.9 * tip); g.fillStyle = TONE.l3; g.fillRect(x0, y3, w, T1 - y3); }
  p.poly([[x0, T0], [x0 + w, T0], [x0 + w, T1], [x0, T1]], null, 7);
  p.stroke([[x0 - 10, y3], [x0 + w + 10, y3]], 5, INKS);
  fitS(g, "~३,०००", x0 - 30, y3 - 34, 46, INKS, 260, "right"); fitS(g, "एक अध्ययन", x0 - 30, y3 + 14, 32, "#7a6a5a", 260, "right");
  fitS(g, "आज", 350, T1 + 80, 60, INKS, 300);
};

// ---------- family tree (1200 x 1600). st: { k 0..1 growth } ----------
const TREE_TONES = [TONE.d1, TONE.l2, TONE.m1, TONE.d3, TONE.l3, TONE.m2, TONE.d2, TONE.l1, TONE.m1, TONE.l3, TONE.d1, TONE.m2];
export const drawTreeS = (p, st = {}) => { const g = p.g, k = st.k ?? 0;
  // roots meet in one trunk: अफ्रिका
  for (let i = 0; i < 6; i++) { const dx = (i - 2.5) * 70; p.stroke([[600, 1400], [600 + dx * 0.6, 1470], [600 + dx * 1.4, 1560]], 18, "#6a4a2e"); }
  const th = 220 + 700 * Math.min(1, k * 1.6); p.poly([[560, 1420], [640, 1420], [624, 1420 - th], [576, 1420 - th]], "#7a5636", 6);
  rrS(p, 470, 1430, 260, 80, 40, "#fbf6ea", 5); fitS(g, "अफ्रिका", 600, 1472, 46, INKS, 230);
  // branches + people-leaves of every skin tone
  const B = [[-1, 1100, 380], [1, 1060, 400], [-1, 900, 330], [1, 860, 350], [-1, 740, 260], [1, 700, 280]];
  B.forEach(([s, y, len], i) => { const kk = Math.max(0, Math.min(1, (k - 0.15 - i * 0.08) * 2.5)); if (kk <= 0) return;
    const ex = 600 + s * len * kk, ey = y - 160 * kk; p.stroke([[600, y], [600 + s * len * 0.5 * kk, y - 40 * kk], [ex, ey]], 16, "#7a5636");
    for (let j = 0; j < 2; j++) { const lk = Math.max(0, Math.min(1, (k - 0.35 - i * 0.07 - j * 0.04) * 3)); if (lk <= 0) continue;
      const lx = ex - s * j * 110, ly = ey - 50 - j * 30, r = 50 * lk, tone = TREE_TONES[(i * 2 + j) % TREE_TONES.length];
      p.ell(lx, ly, r * 1.25, r * 1.25, "#7ab05a", 4); p.ell(lx, ly, r * 0.62, r * 0.7, tone, 3);
      if (lk > 0.8) { p.dot(lx - r * 0.2, ly - r * 0.08, r * 0.08); p.dot(lx + r * 0.2, ly - r * 0.08, r * 0.08); p.arc(lx, ly + r * 0.15, r * 0.22, r * 0.12, 20, 160, 3); } } });
  if (k > 0.9) { const lk = (k - 0.9) * 10; p.ell(600, 1420 - th - 40, 70 * lk, 70 * lk, "#7ab05a", 4); }
};

// ---------- speech bubble: "काले" crossed -> "दाइ" (760 x 460). st: { cross 0..1, dai 0..1.1 } ----------
export const drawCallS = (p, st = {}) => { const g = p.g, cr = st.cross ?? 0, dai = st.dai ?? 0;
  p.poly([[30, 30], [730, 30], [730, 330], [200, 330], [120, 430], [140, 330], [30, 330]], "#ffffff", 8);
  g.save(); g.globalAlpha = 1 - 0.55 * Math.min(1, cr); fitS(g, "\"काले\"", 230, 180, 92, INKS, 340); g.restore();
  if (cr > 0) p.stroke([[90, 180], [90 + 280 * Math.min(1, cr), 180]], 12, "#c8323a");
  if (dai > 0) { g.save(); g.translate(560, 180); g.scale(Math.min(1.1, dai), Math.min(1.1, dai)); fitS(g, "\"दाइ\"", 0, 0, 104, "#2f7a5a", 300); g.restore();
    if (dai >= 1) p.stroke([[480, 270], [510, 300], [580, 240]], 10, "#2f8a4a"); }
};
// share / send icon (300 x 300)
export const drawSendS = (p) => { p.ell(150, 150, 130, 130, "#2f8a8a", 7); p.poly([[70, 150], [230, 80], [190, 230], [150, 170]], "#ffffff", 5); p.stroke([[150, 170], [230, 80]], 4, INKS); };

// ---------- v2 extras ----------
// thought bubble with the dark-skinned friend's face (700 x 600)
export const drawThinkFriendS = (p) => { const g = p.g;
  const blobs = [[360, 260, 290, 210], [170, 240, 130, 110], [550, 240, 130, 110], [270, 120, 120, 90], [460, 120, 120, 90], [260, 380, 130, 90], [470, 380, 130, 90]];
  for (const b of blobs) p.ell(b[0], b[1], b[2], b[3], "#ffffff", 7); for (const b of blobs) p.ell(b[0], b[1], b[2] - 7, b[3] - 7, "#ffffff", 0);
  p.ell(120, 520, 34, 28, "#ffffff", 6); p.ell(70, 580, 18, 15, "#ffffff", 5);
  // the friend: yellow hoodie shoulders + face
  p.ell(360, 430, 150, 70, "#e0a030", 6);
  p.ell(360, 250, 120, 130, TONE.d2, 6);
  p.clip([[220, 110], [500, 110], [500, 205], [220, 205]], () => p.ell(360, 250, 120, 130, "#141010", 0));
  p.poly([[235, 205], [485, 205], [470, 180], [250, 175]], "#141010", 0);
  for (const s of [-1, 1]) p.ell(360 + s * 38, 255, 9, 13, INKS, 0);
  p.arc(360, 300, 36, 20, 20, 160, 7, INKS);
};
// rain streaks (600 x 1000), alpha card in front of the camera
export const drawRainS = (p, ph = 0) => { const g = p.g; g.lineCap = "round";
  for (let i = 0; i < 70; i++) { const x = (i * 83.7) % 640 - 20, y = ((i * 151.3) + ph * 1000) % 1100 - 60; g.strokeStyle = "rgba(230,240,250,0.55)"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 12, y + 60); g.stroke(); } };

// ================= "Did you know kids got X-rayed to buy shoes?" (xray-shoes) cast, English, appended after skin.js =================
// Rules (scripts/xray-shoes.md, guides/sensitive-topics.md 2): only documented claims; kids happy and never hurt; the worker's leg
// is bandaged with a soft red glow, never wounds; the cabinet is generic with an invented sign ("SEE YOUR FEET!"), no brands.

const XG = "#7dff9a", XG2 = "rgba(125,255,154,", WOODX = "#8a5a32", WOODX2 = "#6a4226", INKX = "#2a2024";
const fitX = (g, s, x, y, px, col, maxW, align = "center", font = "bold") => { g.save(); let f = px; g.font = `${font} ${f}px 'Kohinoor Devanagari', 'Devanagari Sangam MN', sans-serif`;
  while (g.measureText(s).width > maxW && f > 10) { f -= 2; g.font = `${font} ${f}px 'Kohinoor Devanagari', 'Devanagari Sangam MN', sans-serif`; }
  g.textAlign = align; g.textBaseline = "middle"; g.fillStyle = col; g.fillText(s, x, y); g.restore(); };
const glowX = (g, x, y, r, a, rgb = "125,255,154") => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); };
const rrX = (p, x, y, w, h, r, col, lw = 6) => { const g = p.g; g.beginPath(); g.roundRect(x, y, w, h, r); if (col) { g.fillStyle = col; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = INKX; g.stroke(); } };

// ---------- the fitting cabinet, front view (700 x 1300). st: { glow 0..1, cloth 0..1 (1 = covered), sign 0..1 } ----------
export const drawCabinetX = (p, st = {}) => { const g = p.g, gl = st.glow ?? 0, cl = st.cloth ?? 0, sg = st.sign ?? 0;
  if (gl > 0) { glowX(g, 350, 230, 300, 0.45 * gl); glowX(g, 350, 1120, 300, 0.5 * gl); }
  // base with the foot slot
  p.poly([[60, 960], [640, 960], [660, 1290], [40, 1290]], WOODX, 7);
  p.poly([[150, 1050], [550, 1050], [550, 1200], [150, 1200]], gl > 0 ? "#14301c" : "#1a1410", 6);
  if (gl > 0) { g.save(); g.globalAlpha = gl; const gr = g.createLinearGradient(0, 1050, 0, 1200); gr.addColorStop(0, "rgba(125,255,154,0.1)"); gr.addColorStop(1, "rgba(125,255,154,0.7)"); g.fillStyle = gr; g.fillRect(156, 1056, 388, 138); g.restore(); }
  p.stroke([[60, 1000], [640, 1000]], 5, "rgba(0,0,0,0.25)");
  // column with carved panels
  p.poly([[180, 330], [520, 330], [540, 960], [160, 960]], WOODX, 7);
  for (const [y0, y1] of [[380, 600], [700, 920]]) { p.poly([[220, y0], [480, y0], [480, y1], [220, y1]], WOODX2, 5); p.poly([[240, y0 + 20], [460, y0 + 20], [460, y1 - 20], [240, y1 - 20]], null, 3); }
  // the sign plaque
  rrX(p, 200, 610, 300, 80, 10, sg > 0 ? "#f6d870" : "#d8b860", 5); if (sg > 0) glowX(g, 350, 650, 220, 0.6 * sg, "255,220,120");
  fitX(g, "SEE YOUR FEET!", 350, 652, 38, INKX, 270);
  // top: three viewing hoods (customer centre, parent and salesman at the sides)
  p.poly([[150, 260], [550, 260], [570, 330], [130, 330]], WOODX2, 6);
  for (const [x, w, h] of [[350, 130, 120], [205, 90, 80], [495, 90, 80]]) { p.poly([[x - w / 2, 260], [x + w / 2, 260], [x + w / 2 - 12, 260 - h], [x - w / 2 + 12, 260 - h]], "#3a2a1e", 6);
    p.ell(x, 260 - h, w / 2 - 12, 14, gl > 0 ? XG : "#1a1410", 4); if (gl > 0) glowX(g, x, 260 - h, w, 0.6 * gl); }
  // brass trim
  for (const y of [330, 960]) p.stroke([[150, y], [550, y]], 8, "#c8a040");
  // cloth cover (pulled up and off to the right as cloth -> 0)
  if (cl > 0) { const dx = (1 - cl) * 700, lift = (1 - cl) * 400; g.save(); g.globalAlpha = Math.min(1, cl * 2);
    p.poly([[40 + dx, 120 - lift], [660 + dx, 120 - lift], [700 + dx, 1290 - lift * 1.6], [0 + dx, 1290 - lift * 1.2]], "#c8b8a0", 7);
    for (let i = 0; i < 6; i++) p.stroke([[120 + i * 95 + dx, 150 - lift], [100 + i * 100 + dx, 1270 - lift * 1.3]], 4, "rgba(80,60,40,0.25)"); g.restore(); }
};

// ---------- the X-ray view through the eyepiece (800 x 800). st: { wig 0..1, squash 0..1, on 0..1 } ----------
export const drawViewX = (p, st = {}) => { const g = p.g, on = st.on ?? 1, w = st.wig ?? 0, sq = st.squash ?? 0;
  g.fillStyle = "#0a120c"; g.fillRect(0, 0, 800, 800);
  g.save(); g.beginPath(); g.arc(400, 400, 360, 0, 7); g.clip();
  const bg = g.createRadialGradient(400, 400, 20, 400, 400, 380); bg.addColorStop(0, `rgba(60,140,80,${0.9 * on})`); bg.addColorStop(1, `rgba(10,40,20,${on})`); g.fillStyle = bg; g.fillRect(0, 0, 800, 800);
  // shoe outline (faint), foot pointing up
  const tw = 1 - 0.28 * sq; g.strokeStyle = `rgba(200,255,210,${0.35 * on})`; g.lineWidth = 10;
  g.beginPath(); g.moveTo(400 - 150 * tw, 720); g.bezierCurveTo(400 - 170 * tw, 400, 400 - 120 * tw, 120, 400, 110 + 30 * sq); g.bezierCurveTo(400 + 120 * tw, 120, 400 + 170 * tw, 400, 400 + 150 * tw, 720); g.stroke();
  // bones: heel + ankle + five metatarsals fanning out + short toes (2-3 small bones); wiggle lifts the toes, squash crowds and bends them
  const bone = (pts, wd) => { g.strokeStyle = `rgba(220,255,225,${on})`; g.lineWidth = wd; g.lineCap = "round"; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); };
  g.shadowColor = XG; g.shadowBlur = 24 * on;
  g.fillStyle = `rgba(220,255,225,${on})`; g.beginPath(); g.ellipse(400, 660, 70, 58, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(400, 560, 56, 46, 0, 0, 7); g.fill();
  for (let i = 0; i < 5; i++) { const s = (i - 2), spread = (62 - 22 * sq) * tw, bx = 400 + s * 26, by = 520, mx = 400 + s * spread, my = 330 - Math.abs(s) * 16 + 30 * sq;
    bone([[bx, by], [mx, my]], 24 - Math.abs(s) * 2.5);
    const wig = Math.sin(w * Math.PI * 2 + i * 1.3) * 16, bend = sq * (s === 0 ? 0 : -Math.sign(s) * 26), seg = i === 2 ? 2 : 3;
    let px = mx, py = my; for (let k = 0; k < seg; k++) { const nx = px + s * 3 + bend * (k + 1) / seg, ny = py - (38 - 8 * k) * (1 - 0.35 * sq) + (k === seg - 1 ? -wig * 0.6 : 0);
      g.beginPath(); g.ellipse((px + nx) / 2, (py + ny) / 2, 10 - Math.abs(s), Math.abs(ny - py) / 2 + 4, Math.atan2(nx - px, -(ny - py)) * -1, 0, 7); g.fill(); px = nx; py = ny - 6; } }
  g.restore();
  p.ell(400, 400, 360, 360, null, 14); g.save(); g.globalAlpha = 0.25 * on; glowX(g, 400, 400, 420, 0.4); g.restore();
};

// ---------- cut-away beam diagram (1000 x 1780). st: { beam 0..1, t phase } ----------
export const drawBeamX = (p, st = {}) => { const g = p.g, b = st.beam ?? 0, t = st.t ?? 0;
  g.fillStyle = "#1c2a24"; g.fillRect(0, 0, 1000, 1780);
  for (let i = 0; i < 18; i++) p.stroke([[0, i * 100], [1000, i * 100 + 40]], 2, "rgba(255,255,255,0.04)");
  // cabinet section
  p.poly([[180, 260], [820, 260], [860, 1600], [140, 1600]], "rgba(138,90,50,0.35)", 7);
  // tube at the bottom
  rrX(p, 330, 1430, 340, 110, 50, "#5a5a62", 6); p.ell(500, 1430, 70, 34, b > 0 ? "#c8ffd0" : "#8a8a90", 5); if (b > 0) glowX(g, 500, 1430, 220, 0.7 * b);
  fitX(g, "X-ray tube", 500, 1580, 46, "#d8e8dc", 400);
  // the feet in shoes on the slot floor
  p.poly([[260, 1100], [740, 1100], [740, 1120], [260, 1120]], "#4a3a2a", 4);
  for (const x of [400, 600]) { p.poly([[x - 70, 1100], [x + 70, 1100], [x + 60, 960], [x - 50, 940]], "#4a2a1a", 6); p.stroke([[x, 900], [x, 760]], 34, "#c99067"); }
  fitX(g, "your feet", 820, 1030, 44, "#d8e8dc", 300, "left");
  // screen + eyepieces
  p.poly([[300, 560], [700, 560], [700, 600], [300, 600]], b > 0 ? "#7dff9a" : "#4a6a52", 5); fitX(g, "screen", 500, 650, 40, "#d8e8dc", 300);
  for (const x of [330, 500, 670]) { p.poly([[x - 50, 300], [x + 50, 300], [x + 30, 230], [x - 30, 230]], "#3a2a1e", 5); }
  // rays: from the tube up through the feet to the screen
  if (b > 0) { g.save(); g.globalAlpha = b; for (let i = 0; i < 7; i++) { const x0 = 500 + (i - 3) * 14, x1 = 330 + i * 57;
      g.strokeStyle = XG2 + "0.55)"; g.lineWidth = 8; g.beginPath(); g.moveTo(x0, 1400); g.lineTo(x1, 610); g.stroke();
      for (let k = 0; k < 3; k++) { const u = ((t + k / 3 + i * 0.07) % 1); p.ell(x0 + (x1 - x0) * u, 1400 - 790 * u, 9, 9, "#eaffee", 0); } }
    glowX(g, 500, 580, 260, 0.5 * b); g.restore(); }
};

// ---------- the slot insert (1000 x 1000): shoes slide into the glowing slot. st: { k 0..1, glow } ----------
export const drawSlotX = (p, st = {}) => { const g = p.g, k = st.k ?? 0, gl = st.glow ?? 0;
  p.poly([[0, 0], [1000, 0], [1000, 1000], [0, 1000]], WOODX, 0);
  for (let i = 0; i < 8; i++) p.stroke([[0, 60 + i * 120], [1000, 70 + i * 120]], 4, "rgba(0,0,0,0.15)");
  p.poly([[120, 420], [880, 420], [880, 820], [120, 820]], "#14301c", 8);
  if (gl > 0) { g.save(); g.globalAlpha = gl; const gr = g.createLinearGradient(0, 420, 0, 820); gr.addColorStop(0, "rgba(125,255,154,0.15)"); gr.addColorStop(1, "rgba(125,255,154,0.75)"); g.fillStyle = gr; g.fillRect(128, 428, 744, 384); g.restore(); glowX(g, 500, 700, 400, 0.4 * gl); }
  // two small shoes + socks sliding in from the top
  const y = -320 + 760 * k; g.save(); g.beginPath(); g.rect(0, 0, 1000, 820); g.clip();
  for (const x of [330, 670]) { p.stroke([[x, y - 500], [x, y]], 110, "#f2ecdf"); p.stroke([[x, y - 500], [x, y - 200]], 110, "#3a4a6a"); p.poly([[x - 110, y], [x + 110, y], [x + 125, y + 200], [x - 95, y + 215]], "#5a2a1a", 8); p.stroke([[x - 60, y + 60], [x + 60, y + 60]], 9, "#3a1a10"); }
  g.restore(); p.poly([[120, 420], [880, 420], [880, 820], [120, 820]], null, 8);
};

// ---------- maps ----------
const FEET_PTS = [[-100, 40], [-90, 33], [-80, 40], [-118, 36], [-75, 43], [-95, 45], [-85, 30], [-110, 45], [-122, 47], [-72, 41], [2, 48], [13, 52], [-3, 52], [10, 45], [18, 60], [24, 50], [-4, 40], [12, 56], [30, 55], [5, 52]];
const footIcon = (p, x, y, s, col) => { p.ell(x, y + 4 * s, 9 * s, 18 * s, col, 0); for (let i = 0; i < 5; i++) { const a = Math.PI * (1.2 + 0.15 * i); p.ell(x + 12 * s * Math.cos(a) + 4 * s, y - 14 * s + 7 * s * Math.sin(a) - (i === 0 ? 2 * s : 0), (i === 0 ? 3.6 : 2.6) * s, (i === 0 ? 4 : 3) * s, col, 0); } };
export const drawFeetMapX = (p, st = {}) => { const g = p.g, k = st.k ?? 0, sea = g.createLinearGradient(0, 0, 0, 900); sea.addColorStop(0, "#8ec3e0"); sea.addColorStop(1, "#6aa6d0"); g.fillStyle = sea; g.fillRect(0, 0, 1600, 900);
  for (const c of [NAM, SAM, GRL, EUR, AFR, AUS, UK, MDG]) p.poly(c, "#efe2c0", 5);
  FEET_PTS.forEach(([lo, la], i) => { const kk = Math.max(0, Math.min(1.15, (k * FEET_PTS.length - i) * 0.9)); if (kk <= 0) return; const s = Math.min(1.15, kk) * 1.1;
    glowX(g, WX(lo), WY(la), 30 * s, 0.35, "255,255,255"); footIcon(p, WX(lo), WY(la), s, "#2a3a5a"); }); };
// contiguous US silhouette (schematic, 1000 x 1500, vertical) with dots, n lit; stamp 0..1.2
const USO = [[-124, 48], [-123, 42], [-120, 34], [-117, 32.5], [-111, 31.3], [-106, 31.8], [-103, 29], [-97, 26], [-94, 29.6], [-89, 29.2], [-84, 30], [-81, 25], [-80, 27], [-81, 31], [-76, 35], [-76, 38], [-74, 40.5], [-70, 41.5], [-70, 43.5], [-67, 45], [-69, 47.3], [-75, 45], [-83, 46], [-89, 48], [-95, 49], [-123, 49]];
const USX = (lo) => 20 + (lo + 126) * 16.4, USY = (la) => 330 + (50 - la) * 20;
export const drawUSX = (p, st = {}) => { const g = p.g, n = st.n ?? 0, stp = st.stamp ?? 0;
  g.fillStyle = "#f2e8d6"; g.fillRect(0, 0, 1000, 1500);
  rrX(p, 330, 90, 340, 120, 20, "#2a3a5a", 5); fitX(g, "1960", 500, 152, 78, "#f2e2b0", 300);
  const poly = USO.map(([a, b]) => [USX(a), USY(b)]); p.poly(poly, "#efe2c0", 7);
  const path = new Path2D("M" + poly.map((q) => q.join(",")).join("L") + "Z"), dots = [];
  for (let la = 47.5; la > 27; la -= 2.4) for (let lo = -122; lo < -68; lo += 4.6) { const x = USX(lo), y = USY(la); if (g.isPointInPath(path, x, y)) dots.push([x, y]); }
  const order = dots.map((d, i) => [((i * 37) % dots.length), d]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  order.forEach(([x, y], i) => p.ell(x, y, 15, 15, i < n ? "#c8323a" : "#d8cbb4", 3));
  fitX(g, String(Math.min(n, 34)), 500, 1060, 230, "#c8323a", 500); fitX(g, "US states", 500, 1220, 64, INKX, 600);
  if (stp > 0) { g.save(); g.translate(500, 560); g.rotate(-0.16); const s = Math.max(1, 2.2 - 1.2 * Math.min(1, stp)); g.scale(s, s); g.globalAlpha = Math.min(1, stp * 1.5);
    rrX(p, -320, -90, 640, 180, 24, "rgba(200,50,58,0.12)", 14); fitX(g, "BANNED", 0, 8, 140, "#c8323a", 580); g.restore(); } };

// ---------- years counter (700 x 700). n 1..10 ----------
export const drawYearsX = (p, n = 1) => { const g = p.g; rrX(p, 20, 20, 660, 660, 40, "#fbf6ea", 8); p.poly([[20, 60], [680, 60], [680, 200], [20, 200]], "#c8323a", 0); rrX(p, 20, 20, 660, 660, 40, null, 8);
  fitX(g, "YEARS", 350, 132, 64, "#fbf6ea", 500); fitX(g, String(n), 350, 400, 260, INKX, 500);
  for (let i = 0; i < n; i++) p.stroke([[90 + i * 54, 560], [104 + i * 54, 640]], 10, "#c8323a"); };

// ---------- the till full of cash (900 x 800). st: { open 0..1, ding 0..1 } ----------
export const drawTillX = (p, st = {}) => { const g = p.g, o = st.open ?? 0, d = st.ding ?? 0;
  p.poly([[120, 140], [780, 140], [820, 560], [80, 560]], "#c8a040", 8);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) p.ell(250 + j * 100, 270 + i * 60, 30, 22, "#f2ecdf", 4);
  rrX(p, 300, 40, 300, 120, 14, "#2a2a30", 6); fitX(g, "$", 450, 100, 80, "#7dff9a", 200);
  const dy = 140 * o; p.poly([[60, 560 + dy * 0.3], [840, 560 + dy * 0.3], [840, 640 + dy], [60, 640 + dy]], "#a8802a", 7);
  if (o > 0.2) for (let i = 0; i < 7; i++) { p.poly([[110 + i * 100, 580 + dy * 0.3], [190 + i * 100, 580 + dy * 0.3], [190 + i * 100, 620 + dy * 0.6], [110 + i * 100, 620 + dy * 0.6]], "#5a9a5a", 3); fitX(g, "$", 150 + i * 100, 600 + dy * 0.45, 30, "#2a5a2a", 60); }
  if (d > 0) { glowX(g, 450, 100, 260, 0.6 * d, "255,230,140"); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + 0.3; p.stroke([[450 + 150 * Math.cos(a), 100 + 110 * Math.sin(a)], [450 + (150 + 60 * d) * Math.cos(a), 100 + (110 + 50 * d) * Math.sin(a)]], 8, "#f6c84a"); } } };

// ---------- pin label (600 x 300) ----------
export const drawPinX = (p, text) => { const g = p.g; rrX(p, 20, 20, 560, 150, 30, "#fbf6ea", 6); fitX(g, text, 300, 98, 70, INKX, 500);
  p.poly([[300, 290], [270, 170], [330, 170]], "#c8323a", 5); };

// ---------- people ----------
POSES.rubL = (c) => { const S = c.sh(-1); return [{ pts: [S, [c.tcx - 1.15 * c.T.a - 10 * c.u, S[1] + 0.5 * c.HH], [c.tcx - 0.3 * c.T.a, c.torsoBot + 0.55 * c.HH]], front: true }, { pts: c.hang(1, 0), front: false }]; };
const OUT_KID = { jacket: "#d8483a", pants: "#3a4a6a", boots: "#5a2a1a", skin: "#e8b98e", hat: "hair", hair: "#5a3a22", build: "kid" };
const OUT_MOM = { jacket: "#3a7aa8", dress: "#3a7aa8", pants: "#2b2b38", boots: "#5a3b2a", skin: "#f0c49c", hat: "hair", hair: "#4a2a1a" };
const OUT_WORK = { jacket: "#5a6a8a", dress: "#5a6a8a", pants: "#2b2b38", boots: "#3a2a22", skin: "#f0c49c", hat: "hair", hair: "#8a5a2a" };
const OUT_OWN = { jacket: "#6a4a3a", pants: "#3a3a40", boots: "#2a1a12", skin: "#e8b98e", hat: "hair", hair: "#2a2020", moustache: "#2a1d18", build: "stout" };
// st.green: green under-light on the face (0..1)
const greenFace = (p, c, k) => { if (!k) return; const g = p.g; g.save(); g.globalAlpha = 0.5 * k; const gr = g.createRadialGradient(c.cx, c.hc + 0.5 * c.HH, 10, c.cx, c.hc, c.W * 0.7); gr.addColorStop(0, "rgba(125,255,154,0.9)"); gr.addColorStop(1, "rgba(125,255,154,0)"); g.fillStyle = gr; g.fillRect(c.cx - c.W, c.hc - c.W, 2 * c.W, 2 * c.W); g.restore(); };
export const drawKidX = (p, st = {}) => drawPerson(p, OUT_KID, { ...st, extra: st.extra ?? [] });
export const drawPeopleX = (p, who, st = {}) => { const o = who === "mom" ? OUT_MOM : who === "owner" ? OUT_OWN : OUT_KID;
  const pose = st.pose ?? ["hang", "hang", 0];
  bodyFront(p, o, { mode: st.mode ?? "stand", phase: st.phase ?? 0, lift: 34, seed: { mom: 1601, owner: 1602, kid: 1603 }[who] ?? 1600, expr: st.expr ?? "smile", blink: st.blink ?? 0, look: st.look ?? 0, facing: st.facing ?? 0, headTilt: st.headTilt ?? 0,
    armFn: armBlend(pose[0], pose[1], pose[2]),
    front: (c) => { if (who === "owner") { const { tcx, T, HH, chin, u } = c; p.poly([[tcx - 0.2 * T.a, chin + 0.02 * HH], [tcx, chin + 0.08 * HH], [tcx - 0.2 * T.a, chin + 0.14 * HH]], "#c8323a", 2 * u); p.poly([[tcx + 0.2 * T.a, chin + 0.02 * HH], [tcx, chin + 0.08 * HH], [tcx + 0.2 * T.a, chin + 0.14 * HH]], "#c8323a", 2 * u); } },
    headExtra: (c) => greenFace(p, c, st.green ?? 0) });
};
export const drawWorkerX = (p, st = {}) => { const pose = st.pose ?? ["hang", "hang", 0], hurt = st.hurt ?? 0;
  bodyFront(p, OUT_WORK, { mode: "stand", lift: 34, seed: 1610, expr: st.expr ?? "neutral", blink: st.blink ?? 0, look: st.look ?? 0, headTilt: st.headTilt ?? 0,
    armFn: armBlend(pose[0], pose[1], pose[2]),
    front: (c) => { const { tcx, T, HH, chin, u, torsoBot } = c;
      p.poly([[tcx - 0.62 * T.a, chin + 0.25 * HH], [tcx + 0.62 * T.a, chin + 0.25 * HH], [tcx + 0.7 * T.a, torsoBot + 0.1 * HH], [tcx - 0.7 * T.a, torsoBot + 0.1 * HH]], "#f4f2ec", 2.4 * u); // apron
      p.poly([[tcx - 0.3 * T.a, chin + 0.01 * HH], [tcx + 0.3 * T.a, chin + 0.01 * HH], [tcx, chin + 0.12 * HH]], "#f4f2ec", 2 * u); // collar
      if (st.bandage) { const x = 300 - 15 * u, y0 = torsoBot + 0.35 * (975 - torsoBot), y1 = 975 - 26 * u;
        if (hurt > 0) { const g = p.g; g.save(); g.globalAlpha = hurt; const gr = g.createRadialGradient(x, (y0 + y1) / 2, 4, x, (y0 + y1) / 2, 60 * u); gr.addColorStop(0, "rgba(230,70,70,0.75)"); gr.addColorStop(1, "rgba(230,70,70,0)"); g.fillStyle = gr; g.fillRect(x - 60 * u, y0 - 40 * u, 120 * u, y1 - y0 + 80 * u); g.restore(); }
        p.g.save(); p.g.beginPath(); p.g.roundRect(x - 6 * u, y0, 12 * u, y1 - y0, 4 * u); p.g.fillStyle = "#f8f6f0"; p.g.fill(); p.g.lineWidth = 2 * u; p.g.strokeStyle = INKX; p.g.stroke(); p.g.restore();
        for (let yy = y0 + 8 * u; yy < y1; yy += 9 * u) p.stroke([[x - 6 * u, yy], [x + 6 * u, yy + 4 * u]], 1.4 * u, "rgba(120,110,100,0.6)"); } },
    headExtra: (c) => { p.ell(c.cx + 0.38 * c.W, c.hc - 0.25 * c.HH, 20 * c.u, 18 * c.u, OUT_WORK.hair, 3 * c.u); greenFace(p, c, st.green ?? 0); } });
};
// new shoes in their box (900 x 700). lid 0..1 (1 = open)
export const drawShoeBoxX = (p, lid = 0) => { const g = p.g;
  p.poly([[100, 300], [800, 300], [760, 660], [140, 660]], "#e8dcc4", 7); p.stroke([[120, 360], [780, 360]], 5, "rgba(0,0,0,0.15)");
  for (const [x, s] of [[320, 1], [580, -1]]) { p.poly([[x - 140, 420], [x + 120, 420], [x + 150, 520], [x - 150, 540]], "#c8323a", 7); p.ell(x - 40, 430, 60, 22, "#3a1a10", 4); p.stroke([[x + 30, 440], [x + 120, 470]], 8, "#2a2024"); glowX(g, x - 60, 450, 60, 0.4, "255,255,255"); }
  const a = -1.2 * lid; g.save(); g.translate(100, 300); g.rotate(a); p.poly([[0, -60], [700, -60], [700, 0], [0, 0]], "#d8c8a8", 7); fitX(g, "NEW SHOES", 350, -30, 40, "#8a5a32", 500); g.restore();
};
// ---------- fx.js: effect cards learned from the reference shorts (sparks, glitter, lightning, glints) ----------
// Concatenated into web/toon.js by setup.sh (after the cast files), so it shares the Pen scope.
// Every drawer takes (p, t, ...) with t = 0..1 progress (or a looping phase) and draws on a 500 x 500 card unless
// stated. Pair bright effects with a glow entry in work/post.json (guides/editing-grammar.md).
const fxRnd = (i, s = 1) => { const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); };

/** sparks / embers flying out of a point (fuse, anvil, campfire, sword clash). t loops 0..1; n sparks; (cx, cy) origin. */
export const fxSparks = (p, t, n = 18, cx = 250, cy = 330, col = "255,196,92") => {
  const g = p.g; g.save(); g.globalCompositeOperation = "lighter";
  for (let i = 0; i < n; i++) {
    const u = (t + fxRnd(i)) % 1, a = -Math.PI / 2 + (fxRnd(i, 3) - 0.5) * 2.4, v = 160 + 180 * fxRnd(i, 5);
    const x = cx + Math.cos(a) * v * u, y = cy + Math.sin(a) * v * u + 220 * u * u, r = 3 + 4 * (1 - u), al = (1 - u) ** 1.5;
    g.strokeStyle = `rgba(${col},${al.toFixed(3)})`; g.lineWidth = r; g.lineCap = "round";
    g.beginPath(); g.moveTo(x, y); g.lineTo(x - Math.cos(a) * 16 * (1 - u), y - Math.sin(a) * 16 * (1 - u) - 10 * u); g.stroke();
  }
  g.restore();
};

/** glitter / frozen crystals: twinkling 4-point stars drifting slowly (space waste turning to ice, magic dust, gold reveal). */
export const fxGlitter = (p, t, n = 26, col = "235,246,255") => {
  const g = p.g; g.save(); g.globalCompositeOperation = "lighter";
  for (let i = 0; i < n; i++) {
    const x = 40 + 420 * fxRnd(i, 2) + 30 * Math.sin(t * 6.28 + i), y = 40 + 420 * fxRnd(i, 4) - 60 * t;
    const tw = 0.5 + 0.5 * Math.sin(t * 6.28 * (1 + fxRnd(i, 6) * 2) + i * 1.7), s = (6 + 14 * fxRnd(i, 8)) * (0.4 + 0.6 * tw);
    g.fillStyle = `rgba(${col},${(0.35 + 0.65 * tw).toFixed(3)})`;
    g.beginPath(); g.moveTo(x, y - s); g.quadraticCurveTo(x, y, x + s, y); g.quadraticCurveTo(x, y, x, y + s);
    g.quadraticCurveTo(x, y, x - s, y); g.quadraticCurveTo(x, y, x, y - s); g.fill();
  }
  g.restore();
};

/** lightning arcs around a centre (a "thunder" bomb, an electric spark, a magic charge). seed changes the bolt shape;
 *  change it every 2-3 frames for a crackle. Bright core + coloured halo. */
export const fxLightning = (p, seed = 1, arcs = 4, cx = 250, cy = 250, col = "150,200,255") => {
  const g = p.g; g.save(); g.globalCompositeOperation = "lighter"; g.lineCap = g.lineJoin = "round";
  for (let k = 0; k < arcs; k++) {
    let a = (k / arcs) * Math.PI * 2 + fxRnd(k, seed) * 0.8, x = cx, y = cy; const pts = [[x, y]];
    for (let j = 0; j < 7; j++) { a += (fxRnd(j + k * 9, seed + 1) - 0.5) * 1.2; const d = 22 + 18 * fxRnd(j, seed + k); x += Math.cos(a) * d; y += Math.sin(a) * d; pts.push([x, y]); }
    for (const [w, c] of [[16, `rgba(${col},0.25)`], [7, `rgba(${col},0.8)`], [2.5, "rgba(255,255,255,1)"]]) {
      g.strokeStyle = c; g.lineWidth = w; g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.stroke();
    }
  }
  const gr = g.createRadialGradient(cx, cy, 0, cx, cy, 90); gr.addColorStop(0, "rgba(255,255,255,0.9)"); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(cx - 90, cy - 90, 180, 180); g.restore();
};

/** a quick specular glint sweeping across metal or gold (dragon head, crown, coin, blade). t 0..1 = one sweep. 500 x 500. */
export const fxGlint = (p, t, angle = -0.6) => {
  const g = p.g, x = -150 + 800 * t; g.save(); g.globalCompositeOperation = "lighter";
  g.translate(250, 250); g.rotate(angle); g.translate(-250, -250);
  const gr = g.createLinearGradient(x - 60, 0, x + 60, 0);
  gr.addColorStop(0, "rgba(255,248,220,0)"); gr.addColorStop(0.5, "rgba(255,248,220,0.85)"); gr.addColorStop(1, "rgba(255,248,220,0)");
  g.fillStyle = gr; g.fillRect(x - 60, -100, 120, 700);
  const s = 30 * Math.sin(Math.PI * t);                                    // a star twinkle at the middle of the sweep
  g.fillStyle = "rgba(255,255,255,0.95)"; g.beginPath(); g.moveTo(x, 250 - s); g.lineTo(x + 4, 250); g.lineTo(x, 250 + s); g.lineTo(x - 4, 250); g.fill();
  g.beginPath(); g.moveTo(x - s, 250); g.lineTo(x, 254); g.lineTo(x + s, 250); g.lineTo(x, 246); g.fill();
  g.restore();
};
// ================= "The Day It Rained Meat" (kentucky-meat-shower) cast, English; appended after fx.js (same module scope) =================
// Rules (scripts/kentucky-meat-shower.md): cartoon meat only (pink-red chunks with a marbled fat stripe, no gore, bones or
// blood), generic 1876 farm bean-heads (Mrs. Crouch: bonnet + apron; two tasters: work shirts, braces, hats), vultures are
// funny cartoon birds, the vomit is a cartoon "blegh" with chunks. Suffix M on every name.

const INKM = "#241726";
const rndM = (i, s = 1) => { const x = Math.sin(i * 91.7 + s * 47.3) * 43758.5453; return x - Math.floor(x); };

// ---------- extra faces + poses ----------
FACE.chewA = { eye: ["lid", "lid"], brow: [1, -1], mouth: "wave" };
FACE.chewB = { eye: ["lid", "lid"], brow: [1, -1], mouth: "o" };
FACE.squint = { eye: ["squeeze", "lid"], brow: [4, -3], mouth: "wave" };
FACE.deadpan = { eye: ["lid", "lid"], brow: [2, 1], mouth: "dash" };
FACE.hum = { eye: ["happy", "happy"], brow: [-1, -2], mouth: "o" };
FACE.gape = { eye: ["dot", "dot"], brow: [-6, -5], mouth: "O" };
POSES.stirA = (c) => { const S = c.sh(1); return [{ pts: c.hang(-1, 0), front: false }, { pts: [S, [c.tcx + 1.15 * c.T.a + 10 * c.u, S[1] + 0.36 * c.HH], [c.tcx + 0.95 * c.T.a + 26 * c.u, c.torsoBot - 0.12 * c.HH]], front: true }]; };
POSES.stirB = (c) => { const S = c.sh(1); return [{ pts: c.hang(-1, 0), front: false }, { pts: [S, [c.tcx + 1.2 * c.T.a + 16 * c.u, S[1] + 0.3 * c.HH], [c.tcx + 1.25 * c.T.a + 44 * c.u, c.torsoBot - 0.22 * c.HH]], front: true }]; };
for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2;
  POSES["stirP" + i] = (c) => { const S = c.sh(1); return [{ pts: c.hang(-1, 0), front: false }, { pts: [S, [c.tcx + 1.1 * c.T.a + 12 * c.u, S[1] + 0.36 * c.HH], [c.tcx + 168 + 10 * Math.cos(a), 600 + 5 * Math.sin(a)]], front: true }]; }; }
POSES.ladleOut = (c) => { const S = c.sh(1), L = c.sh(-1); return [{ pts: [L, [c.tcx - 1.25 * c.T.a - 16 * c.u, L[1] + 0.3 * c.HH], [c.tcx - 0.88 * c.T.a, c.torsoBot - 0.28 * c.HH]], front: false },
  { pts: [S, [c.tcx + 1.15 * c.T.a + 18 * c.u, S[1] + 0.26 * c.HH], [c.tcx + 1.05 * c.T.a + 40 * c.u, S[1] + 0.08 * c.HH]], front: true }]; };
POSES.eatM = (c) => { const S = c.sh(1); return [{ pts: c.hang(-1, 0), front: false }, { pts: [S, [c.tcx + 1.05 * c.T.a + 24 * c.u, S[1] + 0.34 * c.HH], [c.tcx + 0.27 * c.W, c.chin - 0.22 * c.HH]], front: true }]; };
POSES.holdM = (c) => { const S = c.sh(1); return [{ pts: c.hang(-1, 0), front: false }, { pts: [S, [c.tcx + 1.1 * c.T.a + 22 * c.u, S[1] + 0.42 * c.HH], [c.tcx + 0.5 * c.T.a, c.chin + 0.36 * c.HH]], front: true }]; };
POSES.coverM = (c) => [-1, 1].map((s) => { const S = c.sh(s); return { pts: [S, [c.tcx + s * (1.15 * c.T.a + 14 * c.u), S[1] - 0.3 * c.HH], [c.tcx + s * 0.3 * c.T.a, c.crown - 0.02 * c.HH]], front: true }; });

// ---------- the meat (300 x 300, centred): marbled chunk, no bone, no blood ----------
const chunkPts = (cx, cy, r, seed, bites = 0) => { const pts = [], n = bites ? 40 : 11;
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, j = Math.floor((i / n) * 11), rr0 = r * (0.78 + 0.32 * rndM(j, seed)); let rr = rr0;
    for (let b = 0; b < bites; b++) { const ac = Math.PI + (b - (bites - 1) / 2) * 0.75, d = Math.abs(Math.atan2(Math.sin(a - ac), Math.cos(a - ac)));
      if (d < 0.42) rr = Math.min(rr, rr0 * (0.5 + 0.5 * (d / 0.42) ** 2)); }                                                   // scalloped bite
    pts.push([cx + Math.cos(a) * rr * 1.15, cy + Math.sin(a) * rr * 0.85]); } return pts; };
const meatAt = (p, cx, cy, r, seed = 1, lw = 6, glint = -1, bites = 0) => {
  const pts = chunkPts(cx, cy, r, seed, bites);
  p.poly(pts, "#d9505a", lw);
  const g = p.g; g.save(); g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
  g.fillStyle = "#b8363f"; g.beginPath(); g.ellipse(cx + r * 0.25, cy + r * 0.3, r * 0.9, r * 0.5, 0.3, 0, Math.PI * 2); g.fill();      // darker lean
  g.strokeStyle = "#fbe9dc"; g.lineCap = "round"; g.lineWidth = r * 0.16;                                                              // fat stripe
  g.beginPath(); g.moveTo(cx - r * 1.2, cy - r * 0.2); g.bezierCurveTo(cx - r * 0.3, cy - r * 0.7, cx + r * 0.3, cy + r * 0.2, cx + r * 1.2, cy - r * 0.3); g.stroke();
  g.lineWidth = r * 0.05; for (let k = 0; k < 4; k++) { const x0 = cx - r * 0.7 + k * r * 0.45 * (0.8 + 0.4 * rndM(k, seed + 3)), y0 = cy + r * 0.15 + r * 0.25 * rndM(k, seed);
    g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + r * 0.15, y0 - r * 0.15, x0 + r * 0.3, y0 + r * 0.02); g.stroke(); }                 // marbling
  if (glint >= 0) { const x = cx - r * 1.6 + 3.2 * r * glint, gr = g.createLinearGradient(x - r * 0.3, cy - r, x + r * 0.3, cy + r);
    gr.addColorStop(0, "rgba(255,250,235,0)"); gr.addColorStop(0.5, "rgba(255,250,235,0.85)"); gr.addColorStop(1, "rgba(255,250,235,0)"); g.fillStyle = gr; g.fillRect(cx - r * 1.4, cy - r * 1.2, r * 2.8, r * 2.4); }
  g.restore();
  p.ell(cx - r * 0.45, cy - r * 0.35, r * 0.18, r * 0.1, "rgba(255,255,255,0.55)", 0);                                                  // shine
};
export const drawMeatM = (p, seed = 1, glint = -1) => meatAt(p, 150, 150, 92, seed, 7, glint);
/** a handful of small chunks (vomit spray / rain streak), 600 x 600, k = spread 0..1 */
export const drawChunkSprayM = (p, k = 1, seed = 1) => { for (let i = 0; i < 9; i++) { const a = -0.6 + 1.2 * rndM(i, seed), d = 60 + 420 * k * (0.5 + 0.5 * rndM(i + 9, seed));
  meatAt(p, 80 + Math.cos(a) * d, 300 + Math.sin(a) * d * 0.8 + 140 * k * k, 26 + 12 * rndM(i, seed + 5), seed + i, 4); } };

// ---------- people ----------
const OUT_CROUCH = { jacket: "#5f86b5", dress: "#5f86b5", pants: "#2b2b38", boots: "#4a3020", skin: "#f0c49c", hat: "bonnet", hair: "#7a5232" };
const OUT_FA = { jacket: "#e7dcc0", pants: "#4b5d82", boots: "#4a3020", skin: "#e8b98e", hat: "hair", hair: "#6a4a2a", moustache: "#5a3a22" };
const OUT_FB = { jacket: "#b2483e", pants: "#6a4a32", boots: "#3a2618", skin: "#d9a57a", hat: "hair", hair: "#2a1d18", moustache: "#2a1d18", build: "stout" };
const apronM = (p, c) => { const { tcx, T, HH, chin, u, torsoBot } = c;
  p.poly([[tcx - 0.55 * T.a, chin + 0.3 * HH], [tcx + 0.55 * T.a, chin + 0.3 * HH], [tcx + 0.75 * T.a, torsoBot + 0.55 * HH], [tcx - 0.75 * T.a, torsoBot + 0.55 * HH]], "#f6f1e4", 2.4 * u);
  p.stroke([[tcx - 0.55 * T.a, chin + 0.3 * HH], [tcx - 0.62 * T.a, chin + 0.02 * HH]], 3 * u, "#e6dccb"); p.stroke([[tcx + 0.55 * T.a, chin + 0.3 * HH], [tcx + 0.62 * T.a, chin + 0.02 * HH]], 3 * u, "#e6dccb");
  p.poly([[tcx - 0.3 * T.a, torsoBot + 0.0 * HH], [tcx + 0.3 * T.a, torsoBot], [tcx + 0.28 * T.a, torsoBot + 0.2 * HH], [tcx - 0.28 * T.a, torsoBot + 0.2 * HH]], "#ece4d2", 1.6 * u); };
const bracesM = (p, c, col) => { const { tcx, T, HH, chin, u, torsoBot } = c;
  for (const s of [-1, 1]) p.band([[tcx + s * 0.42 * T.a, chin + 0.02 * HH], [tcx + s * 0.36 * T.a, torsoBot + 0.02 * HH]], col, 5 * u, 1.4 * u); };
/** wide-brim farm hat drawn over the head (straw or felt) */
const farmHatM = (p, c, col, band) => { const { cx, crown, W, HH, u } = c, y = crown + 0.13 * HH;
  p.ell(cx, y, 0.86 * W, 0.12 * HH, col, 3 * u);
  p.poly([[cx - 0.42 * W, y], [cx - 0.36 * W, crown - 0.1 * HH], [cx + 0.36 * W, crown - 0.1 * HH], [cx + 0.42 * W, y]], col, 3 * u);
  p.band([[cx - 0.41 * W, y - 0.05 * HH], [cx + 0.41 * W, y - 0.05 * HH]], band, 0.07 * HH, 1.2 * u); };
const ladleM = (p, c, chunk) => { const a = c.arms[1]; if (!a) return; const [hx, hy] = a.pts[2], u = c.u, out = c.ladleOut;
  const tip = out ? [hx + 62 * u, hy - 16 * u] : [hx - 30 * u, hy + 150 * u];
  p.band([[hx - (out ? 18 : -6) * u, hy - (out ? 2 : 22) * u], tip], "#a8743e", 7 * u, 1.6 * u, "round");
  p.ell(tip[0] + (out ? 22 : -4) * u, tip[1] + (out ? -4 : 14) * u, 26 * u, 16 * u, "#8a5a2e", 2.4 * u);
  if (chunk > 0) meatAt(p, tip[0] + 22 * u, tip[1] - 18 * u, 26 * u * chunk, 7, 2.4 * u); };
/** Mrs. Crouch on an 800 x 1000 card (body centred at x 400, room for the held-out ladle) */
export const drawCrouchM = (p, st = {}) => { const pose = st.pose ?? ["stirA", "stirB", 0]; p.g.translate(100, 0);
  bodyFront(p, OUT_CROUCH, { mode: "stand", lift: 34, seed: 1876, expr: st.expr ?? "hum", blink: st.blink ?? 0, look: st.look ?? 0, headTilt: st.headTilt ?? 0, facing: st.facing ?? 0,
    armFn: armBlend(pose[0], pose[1], pose[2]),
    front: (c) => { apronM(p, c); if (st.ladle !== false) ladleM(p, { ...c, ladleOut: pose[0] === "ladleOut" || (pose[1] === "ladleOut" && pose[2] > 0.5) }, st.chunk ?? 0); },
    headExtra: (c) => { if (st.sweat) sweat(p, c, st.sweat); } });
};
FACE.chewSqA = { eye: ["squeeze", "lid"], brow: [4, -3], mouth: "wave" };
FACE.chewSqB = { eye: ["squeeze", "lid"], brow: [4, -3], mouth: "o" };
FACE.bite = { eye: ["dot", "dot"], brow: [-4, -3], mouth: "O" };
/** st: { pose:[a,b,k], expr, blink, look, chunk, bites (notches), cheek 0..1 (chewing bulge), crumbs 0..1 (falling after a chomp) } */
export const drawFarmerM = (p, who = "a", st = {}) => { const o = who === "a" ? OUT_FA : OUT_FB, pose = st.pose ?? ["hang", "hang", 0]; let hand = null;
  bodyFront(p, o, { mode: st.mode ?? "stand", phase: st.phase ?? 0, lift: 34, seed: who === "a" ? 1877 : 1878, expr: st.expr ?? "neutral", blink: st.blink ?? 0, look: st.look ?? 0, headTilt: st.headTilt ?? 0, facing: st.facing ?? 0,
    armFn: armBlend(pose[0], pose[1], pose[2]),
    front: (c) => { bracesM(p, c, who === "a" ? "#7a4a2a" : "#2a2a34"); hand = c.arms[1] ? c.arms[1].pts[2] : null; },
    headExtra: (c) => { const u = c.u;
      if (st.cheek > 0) { const x = c.cx - 0.36 * c.W, y = c.hc + 0.26 * c.HH, r = 0.1 * c.W * st.cheek;                     // full cheek while chewing
        p.ell(x, y, r, r * 0.9, o.skin, 0); p.arc(x, y, r, r * 0.9, 110, 250, 2.4 * u); }
      if (st.chunk && hand) meatAt(p, hand[0] + 8 * u, hand[1] - 2 * u, 22 * u, who === "a" ? 3 : 5, 2.2 * u, -1, st.bites ?? 0);
      if (st.crumbs > 0 && st.crumbs < 1) for (let k = 0; k < 4; k++) { const t = st.crumbs, x = c.cx + 0.12 * c.W + (k - 1.5) * 9 * u, y = c.hc + 0.34 * c.HH + (40 + 30 * k) * u * t * t;
        p.ell(x + 6 * u * t * (k % 2 ? 1 : -1), y, 3.5 * u, 3 * u, k % 2 ? "#d9505a" : "#f2c9b8", 0.8 * u); }
      farmHatM(p, c, who === "a" ? "#e6c46a" : "#5a4030", who === "a" ? "#8a4a2a" : "#2a1a12"); if (who === "b") p.ell(c.cx, c.chin - 0.02 * c.HH, 0.34 * c.W, 0.12 * c.HH, "rgba(42,29,24,0.85)", 0); } });
};

// ---------- the chicken (400 x 400, soles at y 380) ----------
export const drawChickenM = (p, st = {}) => { const ph = st.ph ?? 0, fl = st.flap ?? 0, sq = st.squawk ?? 0, hop = 30 * fl, f = st.facing ?? 1;
  const g = p.g; g.save(); if (f < 0) { g.translate(400, 0); g.scale(-1, 1); }
  const by = 250 - hop;
  for (const s of [-1, 1]) { const k = Math.sin(ph * Math.PI * 2 + (s > 0 ? Math.PI : 0)) * 14; p.stroke([[200 + s * 22, by + 50], [200 + s * 22 + k, 375 - hop * 0.3]], 7, "#e8a03a"); p.stroke([[200 + s * 22 + k - 14, 378 - hop * 0.3], [200 + s * 22 + k + 18, 378 - hop * 0.3]], 6, "#e8a03a"); }
  p.ell(195, by, 95, 72, "#fbfaf4", 6);
  p.poly([[110, by - 20], [70, by - 70 - 20 * fl], [95, by - 10]], "#fbfaf4", 5);                                            // tail
  const wa = fl * 40; p.poly([[170, by - 20], [250, by - 10 - wa], [235, by + 30]], "#efeadc", 5);                          // wing
  p.ell(275, by - 75, 48, 46, "#fbfaf4", 6);                                                                                 // head
  p.poly([[262, by - 118], [272, by - 140], [284, by - 122], [296, by - 138], [302, by - 112]], "#e0453a", 4);               // comb
  p.poly([[318, by - 80], [358, by - 72 + 10 * sq], [318, by - 64]], "#f0b030", 4);                                           // beak
  if (sq > 0.3) p.poly([[318, by - 68], [352, by - 52], [318, by - 60]], "#f0b030", 4);
  p.ell(312, by - 50, 10, 14, "#e0453a", 3);
  p.ell(290, by - 86, 7, sq > 0.3 ? 9 : 6, INKM, 0);
  g.restore();
};

// ---------- vultures (800 x 800, centred): funny, bald pink head, white ruff, big wings ----------
export const drawVultureM = (p, st = {}) => { const fl = Math.sin((st.flap ?? 0) * Math.PI * 2), gag = st.gag ?? 0, f = st.facing ?? 1, bl = st.blink ?? 0;
  const g = p.g; g.save(); if (f < 0) { g.translate(800, 0); g.scale(-1, 1); }
  const wy = -90 * fl;                                                                                                        // wing tip lift
  for (const s of [-1, 1]) {
    const tip = [400 + s * 380, 330 + wy], mid = [400 + s * 220, 360 + wy * 0.55];
    const pts = [[400 + s * 60, 380], mid, tip];
    for (let k = 0; k < 5; k++) pts.push([tip[0] - s * (28 + k * 34), tip[1] + 40 + k * 18 + (k % 2) * 16]);                 // finger feathers
    pts.push([400 + s * 70, 450]);
    p.poly(pts, "#3a2c28", 7);
    p.stroke([[400 + s * 90, 400], [mid[0] + s * 20, mid[1] + 24]], 5, "#5a4840");
  }
  p.ell(400, 430, 95, 120, "#3f302b", 7);                                                                                     // body
  p.poly([[360, 540], [400, 610], [440, 540]], "#2e2220", 6);                                                                  // tail
  p.ell(400, 330, 74, 40, "#f4efe6", 6);                                                                                      // ruff
  const hx = 410, hy = 262 - 6 * gag;
  p.ell(hx, hy, 58, 54, gag > 0.2 ? "#d9a8a0" : "#e99a92", 6);                                                                // bald head
  if (gag > 0.2) { const gg = g.createRadialGradient(hx, hy + 20, 4, hx, hy + 20, 60); gg.addColorStop(0, `rgba(150,200,90,${0.7 * gag})`); gg.addColorStop(1, "rgba(150,200,90,0)"); g.fillStyle = gg; g.fillRect(hx - 60, hy - 40, 120, 110); }
  const open = gag > 0.5 ? 1 : 0;
  p.poly([[hx + 40, hy - 8], [hx + 100, hy + 2], [hx + 108, hy + 22], [hx + 92, hy + 18], [hx + 44, hy + 14]], "#efe2c0", 5);   // upper beak (hooked)
  if (open) p.poly([[hx + 44, hy + 20], [hx + 92, hy + 40 + 20 * gag], [hx + 40, hy + 34]], "#e6d6b0", 5);                   // lower beak open
  if (gag > 0.5) { p.ell(hx - 14, hy - 10, 12, 4, INKM, 0); p.stroke([[hx + 4, hy - 20], [hx + 22, hy - 12], [hx + 4, hy - 4]], 4, INKM); }  // squeezed eyes
  else if (bl > 0.5) p.stroke([[hx - 4, hy - 10], [hx + 22, hy - 10]], 4, INKM);
  else { p.ell(hx + 10, hy - 12, 13, 15, "#ffffff", 4); p.ell(hx + 14, hy - 10, 6, 7, INKM, 0); }
  p.stroke([[hx - 6, hy - 34 - 4 * gag], [hx + 26, hy - 28]], 4, INKM);                                                       // brow
  for (const s of [-1, 1]) p.stroke([[400 + s * 30, 540], [400 + s * 38, 590]], 6, "#cfbfa0");                                 // legs tucked
  g.restore();
  if (st.spew > 0) { g.save(); const sx = f > 0 ? 515 : 285; g.translate(sx, 300); if (f < 0) g.scale(-1, 1);
    for (let i = 0; i < 8; i++) { const t = st.spew, a = 0.15 + 0.85 * rndM(i, 4), d = 20 + 330 * t * (0.4 + 0.6 * rndM(i + 3, 4));
      meatAt(p, Math.cos(a) * d * 0.6, Math.sin(a) * d + 120 * t * t, 13 + 7 * rndM(i, 6), i + 2, 3); }
    g.restore(); }
};

// ---------- thought bubble (700 x 600): a lamb or a deer + "?" ----------
const lambM = (p, x, y, s) => { for (let i = 0; i < 7; i++) p.ell(x - 70 * s + (i % 4) * 46 * s, y - 20 * s + Math.floor(i / 4) * 40 * s, 40 * s, 36 * s, "#fbfaf4", 4 * s);
  p.ell(x + 110 * s, y - 30 * s, 36 * s, 30 * s, "#3a3230", 4 * s); p.ell(x + 96 * s, y - 52 * s, 16 * s, 9 * s, "#3a3230", 3 * s); p.dot(x + 118 * s, y - 36 * s, 4 * s, "#ffffff");
  for (const dx of [-60, -20, 30, 70]) p.stroke([[x + dx * s, y + 40 * s], [x + dx * s, y + 90 * s]], 9 * s, "#3a3230"); };
const deerM = (p, x, y, s) => { p.ell(x, y + 10 * s, 70 * s, 82 * s, "#b07a48", 5 * s); p.ell(x, y + 70 * s, 34 * s, 26 * s, "#e8d2b0", 4 * s); p.dot(x, y + 60 * s, 9 * s, INKM);
  for (const sx of [-1, 1]) { p.ell(x + sx * 72 * s, y - 30 * s, 34 * s, 16 * s, "#b07a48", 4 * s);
    p.stroke([[x + sx * 30 * s, y - 64 * s], [x + sx * 60 * s, y - 130 * s], [x + sx * 96 * s, y - 160 * s]], 9 * s, "#8a6038"); p.stroke([[x + sx * 52 * s, y - 112 * s], [x + sx * 30 * s, y - 150 * s]], 8 * s, "#8a6038"); }
  p.dot(x - 26 * s, y - 4 * s, 7 * s, INKM); p.dot(x + 26 * s, y - 4 * s, 7 * s, INKM); };
export const drawBubbleM = (p, kind = "lamb", k = 1) => { const g = p.g; g.save(); g.globalAlpha = Math.min(1, k * 1.4);
  const s = 0.6 + 0.4 * k, cx = 380, cy = 250;
  for (const [x, y, r] of [[-170, 0, 120], [-60, -90, 130], [80, -95, 125], [190, -10, 115], [80, 80, 130], [-80, 85, 125]]) p.ell(cx + x * s, cy + y * s, r * s, r * 0.85 * s, "#ffffff", 6);
  p.ell(cx, cy, 270 * s, 160 * s, "#ffffff", 0);
  p.ell(150, 470, 34 * s, 28 * s, "#ffffff", 5); p.ell(95, 545, 20 * s, 17 * s, "#ffffff", 4);
  if (kind === "lamb") lambM(p, cx - 20, cy + 10, 0.9 * s); else deerM(p, cx - 20, cy + 20, 0.85 * s);
  drawQ(p, cx + 200 * s, cy - 60 * s, 110 * s, "#e05a3a");
  g.restore(); };

// ---------- the kettle fire (300 x 300) ----------
export const drawFireM = (p, t = 0) => { for (let i = 0; i < 5; i++) { const x = 70 + i * 40, h = 90 + 50 * Math.sin(t * 6.28 * 2 + i * 1.7);
  p.poly([[x - 26, 270], [x - 8, 270 - h * 0.6], [x, 270 - h], [x + 10, 270 - h * 0.55], [x + 26, 270]], i % 2 ? "#ffb23a" : "#ff7a2a", 4);
  p.poly([[x - 12, 270], [x, 270 - h * 0.5], [x + 12, 270]], "#ffe58a", 0); }
  for (const [x0, x1] of [[40, 260], [60, 240]]) p.band([[x0, 280], [x1, 268]], "#6a4426", 16, 3); };
/** steam (300 x 300): soft white puffs rising, t loops */
export const drawSteamM = (p, t = 0) => { for (let i = 0; i < 4; i++) { const u = (t + i / 4) % 1, r = 26 + 46 * u;
  p.ell(150 + 30 * Math.sin(u * 6 + i), 260 - 220 * u, r, r * 0.8, `rgba(255,255,255,${(0.75 * (1 - u)).toFixed(3)})`, 0); } };
/** the channel's "?" (300 x 300) */
export const drawHookQM = (p, k = 1) => drawQ(p, 150, 150, 200 * k, "#ffffff");

/** soap splash (800 x 800): the toon splash recoloured to warm soap foam */
export const drawSoapSplashM = (p, t) => { fxSplash(p, t); const g = p.g; g.save(); g.globalCompositeOperation = "source-atop"; g.fillStyle = "rgba(244,228,196,0.82)"; g.fillRect(0, 0, 800, 800); g.restore(); };
/** puffy cloud (512 x 256): white blobs, soft blue-grey underside */
export const cloudCanvasM = (seed = 0) => { const c = document.createElement("canvas"); c.width = 512; c.height = 256; const g = c.getContext("2d");
  const blobs = []; for (let i = 0; i < 7; i++) blobs.push([90 + i * 55 + rndM(i, seed) * 20, 150 - 60 * Math.sin((i / 6) * Math.PI) * (0.7 + 0.5 * rndM(i + 3, seed)), 48 + 34 * Math.sin((i / 6) * Math.PI) + 10 * rndM(i + 5, seed)]);
  g.fillStyle = "#c9d9ec"; for (const [x, y, r] of blobs) { g.beginPath(); g.arc(x, y + 10, r, 0, Math.PI * 2); g.fill(); } g.fillRect(90, 150, 330, 50);
  g.fillStyle = "#ffffff"; for (const [x, y, r] of blobs) { g.beginPath(); g.arc(x, y, r * 0.96, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = "#c9d9ec"; g.beginPath(); g.ellipse(256, 196, 190, 16, 0, 0, Math.PI * 2); g.fill();
  return c; };
