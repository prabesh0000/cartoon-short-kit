// Post layer: motion blur for whip pans and fast moves, plus a soft glow (bloom) on bright areas.
// Loaded into the page by render.mjs when work/post.json exists. It runs after window.renderFrame and before the
// text layer, so captions stay sharp. Spec: guides/editing-grammar.md ("Post: whips and glow").
//
// work/post.json
// {
//   "blur": [ {"from": 120, "to": 131, "n": 10, "shutter": 0.9} ],   // whip / fast-move frames: n sub-frames over
//                                                                      // `shutter` frames (0.5-1.0), centred on f
//   "glow": [ {"from": 0, "to": 99999, "amount": 0.22},              // a subtle global glow (default look)
//             {"from": 300, "to": 360, "amount": 0.5, "radius": 26, "threshold": 0.62} ]  // stronger on gold / fire / magic
// }
// The last matching glow entry wins. Missing post.json = no post (identical to older reels).
(() => {
  const W = 1080, H = 1920;
  const mk = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
  const acc = mk(W, H), out = mk(W, H), glow = mk(W / 2, H / 2);
  const ga = acc.getContext("2d"), go = out.getContext("2d"), gg = glow.getContext("2d");
  const gl = () => document.getElementById("c");
  const POST = { cfg: { blur: [], glow: [] } };
  const pick = (list, f) => { let r = null; for (const e of list || []) if (f >= e.from && f <= e.to) r = e; return r; };
  POST.init = (cfg) => { POST.cfg = { blur: [], glow: [], ...(cfg || {}) }; };
  POST.blurAt = (f) => pick(POST.cfg.blur, f);
  /** render frame f with post applied; returns the canvas to encode (also set as window.__src for the text layer) */
  POST.frame = (f) => {
    const b = POST.blurAt(f), gw = pick(POST.cfg.glow, f);
    let src;
    if (b && (b.n || 8) > 1) {
      const n = b.n || 8, sh = b.shutter ?? 0.85;
      for (let i = 0; i < n; i++) {
        window.renderFrame(f + ((i + 0.5) / n - 0.5) * sh);
        ga.globalAlpha = 1 / (i + 1); ga.drawImage(gl(), 0, 0);       // running average = box shutter
      }
      ga.globalAlpha = 1; window.renderFrame(f);                        // leave the scene at the whole frame (for protectRects)
      src = acc;
    } else { window.renderFrame(f); src = gl(); }
    if (gw && gw.amount > 0) {
      const th = gw.threshold ?? 0.6, c = 1 / Math.max(0.05, 1 - th);      // soft threshold: push mid-tones to black
      go.globalCompositeOperation = "copy"; go.drawImage(src, 0, 0);
      gg.globalCompositeOperation = "copy";
      gg.filter = `brightness(${(1 - th * 0.5).toFixed(3)}) contrast(${c.toFixed(2)}) saturate(1.25) blur(${((gw.radius ?? 22) / 2).toFixed(1)}px)`;
      gg.drawImage(src, 0, 0, W / 2, H / 2); gg.filter = "none";
      go.globalCompositeOperation = "screen"; go.globalAlpha = Math.min(1, gw.amount);
      go.drawImage(glow, 0, 0, W, H); go.globalAlpha = 1; go.globalCompositeOperation = "source-over";
      src = out;
    }
    window.__src = src === gl() ? null : src;
    return src;
  };
  window.POST = POST;
})();
