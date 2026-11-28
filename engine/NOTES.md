# Engine notes (read only when editing the engine itself)

## Gotchas
- `#include <fog_vertex>` / `<fog_fragment>` go on their own lines.
- The final pass writes `linearToOutputTexel(...)` (render targets are linear HalfFloat).
- The normal+depth pass swaps materials per mesh: world → normal/depth, cards → alpha-tested mask (rgb 0, a = depth), blobs/clouds/sky hidden, water → flat normal. Fog and shadows are off during it.
- Ink goes on the near side of depth jumps only. Creases come from the normal dot. Card neighbours are skipped. Ink fades at ~140-520 m. Ink radius ~2.5 px at 1080. The sky counts as far depth, not a card. Extrude material groups: 0 = caps, 1 = sides+top.
- DOF: 48 taps with a per-sample CoC test (no foreground bleed). The sun comes from az/el per light preset; the shadow camera is centred on each shot's action.
- Cards: 1200x2000 CanvasTexture planes, origin at soles, yaw-only billboards with a contact blob and alpha-tested shadow, never inked by the world pass. `romanFront` draws on a 600x1000 canvas, soles at y=975, card 2.25 m tall (1 unit = 0.00225 m).

## Architecture
- `web/index.html` loads `main.js` (ES module) over a local HTTP server.
- `main.js`: renderer, toon materials, world, cards, passes colour (RT samples 4) → normal/depth → ink + grade (saturation, gain/lift, vignette, flash) → DOF to screen. Exposes `window.renderFrame(f)` and `window.ready`.
- `story.js` exports SHOTS, `shotAt`, `camAt`, `dofAt`, LIGHTS/`lightFor`, `worldAt`, `actorsAt(f, T)`, `fxAt(f, T)`: all pure functions of the frame.
- `render.mjs`: Playwright → `renderFrame(f)` → `toDataURL('image/jpeg', .95)` → `frames/f0000.jpg`. `mix.py`: gated-RMS level lock. `finish.sh`: linear loudness gain, limiter, encode, QA.
- Characters: the Pen API from mromidev/claude-animated-shorts `templates/bridge/toon.ts`, extended in the same module scope by the cast file.
