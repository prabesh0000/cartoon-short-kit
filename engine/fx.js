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
