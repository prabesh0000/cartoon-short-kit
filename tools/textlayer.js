// Text layer (style A, clean cinematic), composited in the browser on top of each rendered frame.
// Loaded into the page by render.mjs when work/text.json exists. Text is never part of the 3D scene,
// so it is never blurred, inked, graded or hidden by scenery.
// - Placement: picks a slot inside the app-UI safe area that does not cover protected cards
//   (window.protectRects(f) -> [[x, y, w, h], ...] in output px) or other text, preferring calm areas.
// - Colour: samples the pixels behind the slot and picks light text on a dark plate or dark text on a
//   light plate, tinted from the background hue, with a WCAG contrast check (>= 4.5 text, >= 3 accent).
// - Word captions (English reels): text.json "captions" = [{from, to, text, accent?}], one word (or a short
//   word pair) at a time, bold white with a black outline, centred at about 60 % height (made by tools/captions.py).
// Spec: guides/caption-style.md. Plan + QA report: work/textplan.json, work/text_report.json.
(() => {
  const W = 1080, H = 1920;
  const SAFE = { x0: 60, x1: 930, y0: 250, y1: 1500 };           // clear of top 250, bottom 420, right 150
  const CX = (SAFE.x0 + SAFE.x1) / 2, MAXW = 780, PAD_X = 36, PAD_Y = 18, MARGIN = 16;
  const FONT = '"Kohinoor Devanagari", "Devanagari Sangam MN", "Noto Sans Devanagari", sans-serif';
  const SIZE = { hook: 76, beat: 64, cover: 92 };
  const LIGHT = { text: [244, 239, 230], accent: [255, 160, 76] };  // #F4EFE6 / #FFA04C on dark plates
  const DARK = { text: [23, 32, 58], accent: [168, 71, 10] };       // #17203A / #A8470A on light plates
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const easeOut = (t) => 1 - (1 - t) ** 3;
  const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const lum = (rgb) => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
  const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const over = (top, a, bot) => top.map((v, i) => v * a + bot[i] * (1 - a));
  const rgbHsl = ([r, g, b]) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    if (mx === mn) return [0, 0, l]; const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [h / 6, s, l]; };
  const hslRgb = ([h, s, l]) => { if (!s) return [l * 255, l * 255, l * 255];
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    const f = (t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255]; };
  const css = (rgb, a = 1) => `rgba(${rgb.map((v) => Math.round(v)).join(",")},${a})`;

  const c2 = document.createElement("canvas"); c2.width = W; c2.height = H;
  const g = c2.getContext("2d", { willReadFrequently: true });
  // source canvas: the post-processed frame from tools/post.js when present, else the WebGL canvas
  const gl = () => window.__src || document.getElementById("c");
  const TL = { overlays: [], plan: {}, warn: [], ready: false, caps: [], capPlan: {} };
  // word captions (English): bold sans, white fill, black outline, soft shadow
  const CAP = { font: '"Avenir Next", "Helvetica Neue", Arial, sans-serif', weight: 800, size: 84, stroke: 13, maxW: 860,
    fill: "#FFFFFF", accent: "#FFD23F", slots: [1150, 1290, 1010, 860, 1420, 700, 560], cx: 495 };
  const capFont = (k = 1) => `${CAP.weight} ${Math.round(CAP.size * k)}px ${CAP.font}`;
  const capBox = (c, cy) => { g.font = capFont(); let k = 1; const tw = g.measureText(c.text).width + CAP.stroke * 2;
    if (tw > CAP.maxW) k = CAP.maxW / tw; const w = tw * k + 24, h = CAP.size * k * 1.3;
    return { rect: [CAP.cx - w / 2, cy - h / 2, w, h], k }; };

  const fontOf = (ov, k = 1) => `700 ${Math.round((ov.size || SIZE[ov.kind] || 64) * k)}px ${FONT}`;
  const lines = (ov) => String(ov.text).split("\n").slice(0, 2);
  const box = (ov, cy, k = 1) => {                                   // text block rect centred at (CX, cy)
    g.font = fontOf(ov, k); const fs = (ov.size || SIZE[ov.kind] || 64) * k;
    const tw = Math.max(...lines(ov).map((l) => g.measureText(l).width));
    const w = Math.min(MAXW, tw + 2 * PAD_X * k), h = fs * 1.35 * lines(ov).length + 2 * PAD_Y * k;
    return [CX - w / 2, cy - h / 2, w, h];
  };
  const inter = (a, b, m = 0) => { const x = Math.max(0, Math.min(a[0] + a[2], b[0] + b[2] + m) - Math.max(a[0], b[0] - m));
    const y = Math.max(0, Math.min(a[1] + a[3], b[1] + b[3] + m) - Math.max(a[1], b[1] - m)); return x * y; };
  const slots = (ov) => {
    const pref = ov.y ?? (ov.kind === "beat" ? 1380 : 380);
    if (ov.lock) return [pref];                                      // "lock": true pins the overlay to its y (e.g. a hook title)
    const list = ov.kind === "beat" ? [pref, 1380, 1220, 1060, 560, 380] : [pref, 380, 560, 760, 1220];
    return [...new Set(list)];
  };
  const fitY = (r) => { const dy = r[1] < SAFE.y0 ? SAFE.y0 - r[1] : r[1] + r[3] > SAFE.y1 ? SAFE.y1 - r[1] - r[3] : 0; return [r[0], r[1] + dy, r[2], r[3]]; };
  const stats = (r) => {                                             // mean colour, luma spread, edge density
    const [x, y, w, h] = r.map(Math.round), d = g.getImageData(x, y, w, h).data, n = w * h;
    let R = 0, G = 0, B = 0, L = 0, L2 = 0, E = 0, cnt = 0, lumRow = new Float32Array(w);
    for (let j = 0; j < h; j += 2) for (let i = 0; i < w; i += 2) {
      const k = (j * w + i) * 4, l = (0.299 * d[k] + 0.587 * d[k + 1] + 0.114 * d[k + 2]) / 255;
      R += d[k]; G += d[k + 1]; B += d[k + 2]; L += l; L2 += l * l; cnt++;
      if (i >= 2) E += Math.abs(l - lumRow[i - 2]); lumRow[i] = l;
    }
    const m = L / cnt; return { mean: [R / cnt, G / cnt, B / cnt], sd: Math.sqrt(Math.max(0, L2 / cnt - m * m)), busy: E / cnt, n };
  };

  /** after window.renderFrame(f): metrics for every candidate slot of overlay ov at scale k */
  TL.analyze = (ov, k = 1, protect = []) => {
    g.drawImage(gl(), 0, 0);
    return slots(ov).map((cy) => { const r = fitY(box(ov, cy, k)), st = stats(r);
      const ov_ = protect.reduce((s, p) => s + inter(r, p, MARGIN), 0) / (r[2] * r[3]);
      return { cy, rect: r, overlap: ov_, ...st }; });
  };

  /** colours for a background (mean rgb, luma spread): mode, plate, text, accent, contrasts */
  TL.colours = (mean, sd, plateWanted = true) => {
    const L = lum(mean), light = L <= 0.45, P = light ? LIGHT : DARK, [h, s] = rgbHsl(mean);
    let plate = light ? hslRgb([h, Math.min(s, 0.35), 0.1]) : hslRgb([h, Math.min(s, 0.25), 0.94]);
    const lo = mean.map((v) => clamp(v - 255 * 2 * sd, 0, 255)), hi = mean.map((v) => clamp(v + 255 * 2 * sd, 0, 255));
    const worst = (a, c) => Math.min(contrast(c, over(plate, a, lo)), contrast(c, over(plate, a, hi)));
    let usePlate = plateWanted || sd > 0.06 || contrast(P.text, mean) < 4.5, a = usePlate ? (light ? 0.62 : 0.78) : 0;
    while (usePlate && a < 0.92 && (worst(a, P.text) < 4.5 || worst(a, P.accent) < 3)) a += 0.05;
    const tc = usePlate ? worst(a, P.text) : contrast(P.text, mean), ac = usePlate ? worst(a, P.accent) : contrast(P.accent, mean);
    return { mode: light ? "light" : "dark", plate: usePlate ? plate : null, alpha: +a.toFixed(2), text: P.text, accent: P.accent, contrast: +tc.toFixed(2), accentContrast: +ac.toFixed(2) };
  };

  TL.init = (overlays, plan, caps, capPlan) => { TL.overlays = overlays || []; TL.plan = plan || {}; TL.caps = caps || []; TL.capPlan = capPlan || {}; TL.ready = true; };

  /** caption slot choice for one caption: first slot that covers no protected card and no active overlay rect;
   *  prefers the previous caption's slot so captions do not jump around. */
  TL.capSlot = (c, protect = [], busyRects = [], prevY = null) => {
    const order = prevY != null ? [prevY, ...CAP.slots.filter((y) => y !== prevY)] : CAP.slots;
    for (const cy of order) { const b = capBox(c, cy);
      if (!protect.some((p) => inter(b.rect, p, 10) > 0) && !busyRects.some((p) => inter(b.rect, p, 10) > 0)) return { y: cy, rect: b.rect, k: b.k, blocked: false }; }
    // nothing free: least overlap with protected cards (never on top of other text), flagged for the report
    let best = null;
    for (const cy of order) { const b = capBox(c, cy); if (busyRects.some((p) => inter(b.rect, p, 10) > 0)) continue;
      const o = protect.reduce((s, p) => s + inter(b.rect, p, 0), 0); if (!best || o < best.o) best = { y: cy, rect: b.rect, k: b.k, o }; }
    best = best || { y: CAP.slots[0], ...capBox(c, CAP.slots[0]) };
    return { y: best.y, rect: best.rect, k: best.k, blocked: true };
  };
  const drawCap = (c, pl, f) => {
    const t = clamp((f - c.from + 1) / 3), k = pl.k * (0.86 + 0.14 * easeOut(t));     // quick 3-frame pop-in, no fade-out
    g.save(); g.translate(CAP.cx, pl.y); g.scale(k, k);
    g.font = capFont(); g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round"; g.miterLimit = 2;
    g.shadowColor = "rgba(0,0,0,0.45)"; g.shadowBlur = 14; g.shadowOffsetY = 5;
    g.lineWidth = CAP.stroke * 2; g.strokeStyle = "#000000"; g.strokeText(c.text, 0, 0);
    g.shadowColor = "transparent"; g.fillStyle = c.accent ? CAP.accent : CAP.fill; g.fillText(c.text, 0, 0);
    g.restore();
  };

  const drawOne = (ov, pl, f) => {
    const tin = easeOut(clamp((f - ov.from) / 6)), tout = clamp((ov.to - f) / 4), a = tin * tout; if (a <= 0.01) return;
    const k = pl.scale || 1, fs = (ov.size || SIZE[ov.kind] || 64) * k, [x, y, w, h] = pl.rect, rise = 12 * (1 - tin);
    g.save(); g.globalAlpha = a; g.translate(0, rise);
    if (pl.plate) { g.fillStyle = css(pl.plate, pl.alpha); g.beginPath(); g.roundRect(x, y, w, h, 16 * k); g.fill(); }
    else { g.shadowColor = pl.mode === "light" ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.4)"; g.shadowBlur = 16; g.shadowOffsetY = 4; }
    g.font = fontOf(ov, k); g.textBaseline = "middle"; g.textAlign = "left";
    lines(ov).forEach((ln, i, all) => {
      const cy = y + h / 2 + (i - (all.length - 1) / 2) * fs * 1.35;
      const at = ov.accent ? ln.indexOf(ov.accent) : -1;
      const segs = at < 0 ? [[ln, false]] : [[ln.slice(0, at), false], [ov.accent, true], [ln.slice(at + ov.accent.length), false]];
      let tw = segs.reduce((s, [t]) => s + g.measureText(t).width, 0), cx = x + w / 2 - tw / 2;
      if (tw > w - 2 * PAD_X * k) { const sc = (w - 2 * PAD_X * k) / tw; g.font = `700 ${Math.round(fs * sc)}px ${FONT}`; tw *= sc; cx = x + w / 2 - tw / 2; }
      for (const [t, acc] of segs) { if (!t) continue; g.fillStyle = css(acc ? pl.accent : pl.text); g.fillText(t, cx, cy); cx += g.measureText(t).width; }
    });
    g.restore();
  };

  /** after window.renderFrame(f): frame + text as a JPEG data URL; records any frame where text covers a protected card */
  TL.compose = (f, q = 0.96, protect = []) => {
    g.drawImage(gl(), 0, 0);
    const active = TL.overlays.filter((ov) => f >= ov.from && f < ov.to && TL.plan[ov.id]);
    for (const ov of active) { const pl = TL.plan[ov.id];
      const hit = protect.reduce((s, p) => s + inter(pl.rect, p, 0), 0); if (hit > 0) TL.warn.push({ f, id: ov.id, overlapPx: Math.round(hit) });
      drawOne(ov, pl, f); }
    for (const [i, c] of TL.caps.entries()) { if (f < c.from || f >= c.to || !TL.capPlan[i]) continue; const pl = TL.capPlan[i];
      const hit = protect.reduce((s, p) => s + inter(pl.rect, p, 0), 0); if (hit > 0) TL.warn.push({ f, id: `cap${i}:${c.text}`, overlapPx: Math.round(hit) });
      drawCap(c, pl, f); }
    return c2.toDataURL("image/jpeg", q);
  };
  window.TL = TL;
})();
