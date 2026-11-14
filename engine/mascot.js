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
