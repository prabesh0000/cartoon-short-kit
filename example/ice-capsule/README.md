# Worked example: "आइस चुरोटको बल" (health myth-buster, 36.7 s, 1100 frames, LOOP, 2026-11-18)

Brief: `scripts/ice-capsule-myth.md`.

- `web/main.js`: the Manjushri engine variant + a **top layer**: cards with `top: true` (text, phone) render after DOF, sharp and never hidden.
- `web/story.js`: 14 shots, `screen(id, px, py, hp)` places text cards by output pixels (safe area), loop tail (f1094-1099 = macro time -6..-1).
- `web/ice.js`: cast appended to `toon.js` (fingers, capsule, burst, rumour bubble, cradle, chart, WHO report, phone, adults,
  `drawFilterCut` = cut-away filter with menthol / frost / smoke turning pale, `drawLungs` = person + windpipe + lungs inhalation diagram).
  Rebuild: `cat web/toonbase.js web/roman.js web/nepal.js web/mascot.js web/manjushri.js web/ice.js > web/toon.js`.
- `audio.py`: modern tense pulse, **circular** (filters before the wrap), new soft SFX (pop, hiss, whisper, heart, creak, rise, slide, tap, ding, whip).
- Checks: `python3 audit.py` and `python3 sfx_check.py` (per-cue speech-band level, writes a table; cue list from `work/sfx_cues.json`).

To run: `bash tools/setup.sh reels/x`, copy `web/*` + `audio.py` here into it, copy `three.module.js` from `web/lib/` to `web/`,
rebuild `toon.js`, add the voice as `voice.mp3`, then `node render.mjs frames "0-1099"`, `python3 audio.py`, `python3 mix.py voice.mp3 music.wav sfx.wav`, `bash finish.sh "Title"`.
