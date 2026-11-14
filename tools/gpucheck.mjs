// node gpucheck.mjs  -> prints which WebGL renderer headless Chromium gets (GPU vs SwiftShader) for each GL mode.
// Use it once after setup: the mode whose renderer names your GPU (e.g. "Apple M2") is the fast one.
import { chromium } from 'playwright';
const modes = {
  gpu: { channel: 'chromium', args: ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', process.platform === 'darwin' ? '--use-angle=metal' : '--use-angle=gl'] },
  swiftshader: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] },
};
for (const [name, opts] of Object.entries(modes)) {
  try {
    const b = await chromium.launch(opts); const p = await b.newPage();
    const r = await p.evaluate(() => { const g = document.createElement('canvas').getContext('webgl2'); if (!g) return 'no WebGL2'; const e = g.getExtension('WEBGL_debug_renderer_info'); return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER); });
    console.log(`GL=${name}: ${r}`); await b.close();
  } catch (e) { console.log(`GL=${name}: failed (${e.message.split('\n')[0]})`); }
}
