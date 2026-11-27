// Painted canvas textures: flat colour with dark seams, in the toon style.
const R = (s) => { let x = Math.sin(s * 9301 + 49297) * 233280; return x - Math.floor(x); };
const mk = (w, h, fn) => { const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); fn(g, w, h); return c; };
const jit = (hex, k, s) => { // random brightness jitter
  const n = parseInt(hex.slice(1), 16), f = 1 + (R(s) - 0.5) * k;
  const c = (v) => Math.max(0, Math.min(255, Math.round(v * f))).toString(16).padStart(2, "0");
  return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`;
};

export const grass = (base = "#7fb24a") => mk(512, 512, (g, w, h) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 30; i++) { g.fillStyle = jit(base, 0.16, i + 3); g.beginPath(); g.ellipse(R(i) * w, R(i + 50) * h, 30 + R(i + 9) * 60, 20 + R(i + 7) * 40, 0, 0, 7); g.fill(); }
  g.strokeStyle = "rgba(40,80,20,0.45)"; g.lineWidth = 3; g.lineCap = "round";
  for (let i = 0; i < 260; i++) { const x = R(i * 3) * w, y = R(i * 3 + 1) * h, a = (R(i * 3 + 2) - 0.5) * 0.8; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.sin(a) * 10, y - 12); g.stroke(); }
});
export const dirt = (base = "#d2b07a") => mk(512, 512, (g, w, h) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) { g.fillStyle = jit(base, 0.12, i + 11); g.beginPath(); g.ellipse(R(i) * w, R(i + 70) * h, 40 + R(i + 9) * 70, 20 + R(i + 5) * 30, 0, 0, 7); g.fill(); }
  g.fillStyle = "rgba(90,60,30,0.35)";
  for (let i = 0; i < 120; i++) { g.beginPath(); g.ellipse(R(i * 5) * w, R(i * 5 + 2) * h, 3 + R(i) * 5, 2 + R(i + 1) * 3, 0, 0, 7); g.fill(); }
  g.strokeStyle = "rgba(110,75,40,0.35)"; g.lineWidth = 2;
  for (let i = 0; i < 18; i++) { let x = R(i * 7) * w, y = R(i * 7 + 3) * h; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (R(i * 13 + k) - 0.5) * 50; y += (R(i * 17 + k) - 0.5) * 50; g.lineTo(x, y); } g.stroke(); }
});
export const stone = (base = "#9a948a") => mk(256, 256, (g, w, h) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 16; i++) { g.fillStyle = jit(base, 0.2, i); g.beginPath(); g.ellipse(R(i) * w, R(i + 30) * h, 30 + R(i + 2) * 40, 20 + R(i + 3) * 30, 0, 0, 7); g.fill(); }
  g.strokeStyle = "rgba(40,36,40,0.5)"; g.lineWidth = 3;
  for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(R(i * 4) * w, R(i * 4 + 1) * h); g.lineTo(R(i * 4 + 2) * w, R(i * 4 + 3) * h); g.stroke(); }
});
export const blocks = (base = "#a49e92") => mk(512, 512, (g, w, h) => {
  g.fillStyle = "#5a5450"; g.fillRect(0, 0, w, h);
  const rows = 4;
  for (let r = 0; r < rows; r++) for (let c = -1; c < 3; c++) {
    const x = c * 256 + (r % 2) * 128, y = r * 128;
    g.fillStyle = jit(base, 0.14, r * 7 + c); g.fillRect(x + 4, y + 4, 248, 120);
  }
});
export const brick = (base = "#b4553a") => mk(512, 512, (g, w, h) => {
  g.fillStyle = "#6a3a2c"; g.fillRect(0, 0, w, h);
  const bh = 32, bw = 96;
  for (let r = 0; r < h / bh; r++) for (let c = -1; c < w / bw + 1; c++) {
    g.fillStyle = jit(base, 0.16, r * 31 + c); g.fillRect(c * bw + (r % 2) * bw / 2 + 3, r * bh + 3, bw - 6, bh - 6);
  }
});
export const wood = (base = "#6a4028") => mk(256, 512, (g, w, h) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  g.strokeStyle = "rgba(30,15,10,0.45)"; g.lineWidth = 3;
  for (let i = 0; i < 14; i++) { const x = (i + 0.5) * (w / 14); g.beginPath(); g.moveTo(x, 0); for (let y = 0; y <= h; y += 32) g.lineTo(x + Math.sin(y * 0.03 + i) * 4, y); g.stroke(); }
});
export const carved = () => mk(256, 256, (g, w, h) => { // newari lattice window
  g.fillStyle = "#4a2a1c"; g.fillRect(0, 0, w, h);
  g.strokeStyle = "#7a4a2c"; g.lineWidth = 12;
  for (let i = -w; i < w * 2; i += 42) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); g.beginPath(); g.moveTo(i, h); g.lineTo(i + h, 0); g.stroke(); }
  g.strokeStyle = "#2a160e"; g.lineWidth = 14; g.strokeRect(7, 7, w - 14, h - 14);
});
export const roof = (base = "#4d3a32") => mk(512, 512, (g, w, h) => {
  g.fillStyle = shadeHex(base, 0.7); g.fillRect(0, 0, w, h);
  for (let r = 0; r < 8; r++) for (let c = 0; c < 16; c++) {
    g.fillStyle = jit(base, 0.12, r * 17 + c); g.beginPath(); const x = c * 32 + (r % 2) * 16, y = r * 64;
    g.moveTo(x, y); g.lineTo(x + 30, y); g.lineTo(x + 30, y + 56); g.quadraticCurveTo(x + 15, y + 64, x, y + 56); g.closePath(); g.fill();
  }
});
export const cloth = (a = "#c8332f", b = "#f2ecdf", stripes = 6) => mk(256, 256, (g, w, h) => {
  for (let i = 0; i < stripes; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect((i * w) / stripes, 0, w / stripes + 1, h); }
});
export const flagTex = (col, sym = "#f6e7b0") => mk(256, 192, (g, w, h) => {
  g.fillStyle = col; g.fillRect(0, 0, w, h);
  g.fillStyle = sym; g.beginPath(); g.arc(w * 0.45, h * 0.5, h * 0.22, 0, 7); g.fill();
  g.fillStyle = shadeHex(col, 0.6); g.fillRect(0, 0, w, 12); g.fillRect(0, h - 12, w, 12);
});
export const gold = () => mk(128, 128, (g, w, h) => { g.fillStyle = "#e3b23c"; g.fillRect(0, 0, w, h); g.fillStyle = "#f6d36a"; for (let i = 0; i < 6; i++) g.fillRect(0, i * 22, w, 6); });
export const rock = (base = "#7d8aa0") => mk(512, 512, (g, w, h) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 30; i++) { g.fillStyle = jit(base, 0.22, i + 5); g.beginPath(); g.moveTo(R(i) * w, R(i + 1) * h); g.lineTo(R(i + 2) * w, R(i + 3) * h); g.lineTo(R(i + 4) * w, R(i + 5) * h); g.fill(); }
});
export const shadeHex = (hex, k) => {
  const n = parseInt(hex.slice(1), 16), c = (v) => Math.max(0, Math.min(255, Math.round(v * k))).toString(16).padStart(2, "0");
  return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`;
};
export const cloudTex = (seed) => mk(512, 256, (g, w, h) => {
  const blobs = [[0.25, 0.62, 0.17], [0.42, 0.45, 0.22], [0.6, 0.5, 0.2], [0.76, 0.62, 0.14], [0.5, 0.68, 0.2]];
  g.fillStyle = "#ffffff";
  for (const [x, y, r] of blobs) { g.beginPath(); g.ellipse((x + (R(seed + x) - 0.5) * 0.06) * w, y * h, r * w, r * w * 0.75, 0, 0, 7); g.fill(); }
  g.fillStyle = "rgba(200,215,235,0.9)"; g.beginPath(); g.ellipse(0.5 * w, 0.8 * h, 0.36 * w, 0.06 * h, 0, 0, 7); g.fill();
});
export const water = (base = "#3f8fb0") => mk(512, 512, (g, w, h) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) { g.fillStyle = jit(base, 0.08, i + 40); g.beginPath(); g.ellipse(R(i + 3) * w, R(i + 60) * h, 40 + R(i + 1) * 60, 18 + R(i + 2) * 22, 0, 0, 7); g.fill(); }
  g.strokeStyle = "rgba(235,248,255,0.22)"; g.lineWidth = 2.5; g.lineCap = "round";
  for (let i = 0; i < 90; i++) { const x = R(i * 7) * w, y = R(i * 7 + 1) * h, l = 6 + R(i * 7 + 2) * 12; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 3, x + l, y); g.stroke(); }
});
