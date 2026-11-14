# Lessons learned (read before every new short; add to it after every project)

Newest first. Each entry says what happened and what to do next time.

## 2026-11-14 — Mac setup check (Apple M4)
- **Mac M4 GPU renders at about 0.5 s/frame with `GL=gpu`** (`gpucheck.mjs` reports "ANGLE Metal Renderer: Apple M4"). That is about 5x faster than the cloud's 2-3.5 s/frame with SwiftShader, so a 30 s reel (900 frames) takes about 8 min.
- Node 26 accepts only `mode:'strip'` in `stripTypeScriptTypes`; `'transform'` throws. `tools/setup.sh` now tries `transform` and falls back to `strip` (`vendor/toon.ts` strips cleanly).
- `setup.sh` hides that step's errors (`2>/dev/null` + `set -e`), so a failure there exits with no message. Run it with `bash -x` to see where it stops.
- The project folder is now `~/Desktop/CuriousManche/cartoon-short-kit`. Start Claude Code from there.

## 2026-11 — Channel brand: "The Curious Manche"
- Channel name: **The Curious Manche** (मान्छे = person). It covers international stories, trending news and facts, voiced in Nepali for now.
- Mascot: `engine/mascot.js` → `drawManche` (bean-head in a dhaka topi, one eyebrow raised, eyes looking up-right, small "o" mouth) + `drawQ` question mark.
  Profile photo: orange sunburst, navy jacket, white "?" (blue and yellow variants too). No text: it must read at about 110 px.
- Faces drawn under a `hat: "hair"` cap hide the brows. For expressive custom faces use `hat: null`, draw a fringe and brows on skin, and skip the default face with `back: true` + `headExtra`.
- A hand at the chin is hidden by the head (it is drawn after the arms) and looks like a button just below. Use it only with a visible elbow and a clear hand.

## 2026-11 — "यलम्बरको शिर" (Nepali legend, 38.5 s, 11 shots)

### Workflow and time
- The skill folder can arrive with only SKILL.md. Clone this repo; never rebuild the engine from memory (that cost about an hour).
- Rendering 1080x1920 on a 2-core CPU with SwiftShader takes about 2-3.5 s per frame. 1156 frames took about 45 min, and crowd shots are the slowest.
- A process left in the background after the reply ends is killed, so keep the turn alive with foreground
  `sleep 580; tail render.log` loops until the render finishes. `RESUME=1` continues after an interruption.
- Chrome at `/usr/bin/google-chrome` with Playwright from `/opt/npm-tools/node_modules/playwright` works when Playwright's own Chromium is missing.
- Always render a stills contact sheet first. It caught a camera inside a house, armies behind the camera, a
  boxed glow and pyramid-looking mountains before the long render.

### Nepali scripts and timing
- ElevenLabs Nepali narration ("Ashok Pokhrel" voice) runs at **about 2 words/s**, not 3.7. A 77-word script came
  out at 38.5 s. For 30 s write about 60 words, for 20 s about 40.
- Whisper models can't be downloaded here (Hugging Face is blocked), and Claude can't hear audio. Timing came from
  `ffmpeg -af silencedetect=noise=-38dB:d=0.18`: map the script phrases to the speech segments by hand.
  Short repeated words ("फेरि। फेरि।") are perfect anchors. The TTS sometimes pauses mid-sentence
  ("किरात राजा यलम्बर | महाभारतमा…") and sometimes runs straight over a comma.
- Write numbers as words and keep the Devanagari text exactly as recorded. It is the timing source.

### Story and content
- The hook frame should be the strongest image (the flying mask, the chakra), not a smiling close-up.
- Captions: recommended for reels, because many people watch with the sound off. **No Devanagari font is installed
  here yet**, so set one up (e.g. a Noto Sans Devanagari web font) before promising Nepali captions.
- Aim for 25-30 s and end on a question line to bring comments.
- Religious figures: show deities respectfully. Krishna was seen from behind with an aura, with no cartoon face.
  Violence is a flash cut (the chakra dives, then a white flash); the head is shown as the worshipped mask.
  Frame legends with "कथा अनुसार".
- Fact-check the hook, twist and "true or legend" status with a web search before pitching an idea.
- Visual metaphors work: the "joins the losing side" paradox became a giant balance scale he hops between.

### Camera and framing (vertical 9:16)
- Horizontal FOV is narrow: hfov = 2·atan(tan(vfov/2)·0.5625), about 19° at fov 36. For an over-the-shoulder shot,
  put the camera on the line through both characters, or one of them falls out of frame.
- Keep cameras out of buildings: check house footprints against camera keys (`house()` in world.js).
- Cones on a flat sandy plain read as Egyptian pyramids, so use low dune hills there instead.
- Cards billboard to the camera, so give each character a facing vector and switch to a back-view drawing when
  the camera is behind them (`facingBack` in story.js). Crowds watching a stage need this.
- Pull the opening close-up back enough to keep plumes and crowns in frame.

### Engine and cast (now in the kit)
- `tools/patch_toon.py` adds hooks to bodyFront: `armFn`, `behind`, `front`, `headExtra`, `back`. setup.sh runs it.
- `engine/nepal.js`: POSES (hang, hip, up, cheer, point, pointL, thumb, shrug, flail, namaste, spear, raise),
  `armBlend(a, b, k)` for smooth pose changes, Yalambar, Kirat warriors, red and blue armies, Krishna (back
  view), townsfolk with dhaka topi or a bun, the Akash Bhairav mask, the Sudarshan chakra, a lying helmet, a
  fallen flag, a tumbleweed, dust puffs and an additive glow.
- Radial glows inside a 600x1000 card must fit the canvas, or their edges show as a box.
- Use flat normals (`toNonIndexed().computeVertexNormals()`) for low-poly rocks, mountains and trees. MeshToonMaterial ignores `flatShading`.
- A card's texture key must include every visual parameter, quantised with `q()`. Background crowds use static keys and get idle motion from transforms only.

### Sound (the user's preference: cinematic and thrilling, never a happy loop)
- The user rejected the happy march loop: "same and happy". The default is now a **cinematic thriller score
  written to the beats**: impact plus braam, war drums plus ostinato for action, drone, ticking and tremolo under
  dialogue, risers and reverse cymbals into hits, a near-silent drop with a heartbeat before the twist, the biggest
  hit on the twist, a choir and brass climax, and a final hit plus gong on the payoff word.
  Template: `example/yalambar/audio.py`.
- SFX on everything: a swish on every cut; on every jump a take-off whoosh and a landing (thud, metal clang, wood
  creak, debris) that grows with each repeat; fly-bys, wind and a sparkle trail on flights; thunder, a shing and a
  whir for the chakra; poofs for vanishing armies; a crowd bed with a cheer swell.
- Print per-section RMS: quiet sections must really be quieter than the builds. The first try had the "drop" louder than the build.
- Plot stem levels against the cut frames (matplotlib) to check that hits land, since Claude can't listen.
- Levels stay locked: music at -6.0 dB vs the voice (gated RMS), SFX at or below that with peaks of at most
  0.7x the voice peak, one anti-clip gain, then -14 LUFS and a -1 dBFS limiter in finish.sh.
- Offer a voice-plus-SFX-only export when the user wants to add trending or licensed music inside Instagram or TikTok.
