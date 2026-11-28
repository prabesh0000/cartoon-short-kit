# Worked example: "मञ्जुश्रीको ताल" (legend + science, 32.2 s, 8 shots, 2026-11-17)

The newest and most complete reel. Use it as the starting point for legend/history reels.

- `web/main.js`: the engine variant with a `world.js` / `story.js` split and `lightAt(f)` returning a light **object**
  (presets mixed per frame with `seq`/`mixL` for time-lapses). Copy it over the template `main.js`.
- `web/story.js`: shots, cameras (`camFromKeys`, cuts on words, kicks + roll on the strike, quake shake), light,
  world state, actors. Shows the screen-space card helper (`screen(...)`: title card, overlays, seismograph at the
  focus distance), the hook question card, a walker whose camera follows him (shot 6), a cut-away diorama (shot 8).
- `web/world.js`: valley with a lake that drains (water fades out near the bed), a saddle that splits, villages that
  pop up and a city that grows from the centre, a Kathmandu street (wires, shops, pagoda), an underwater surface,
  the layered cut-away slab (`layersTex`, `FOSSILS`), a lake-rim knoll.
- Cast: `engine/manjushri.js` (now in every new project's `toon.js`).
- `audio.py`: "god-like cinematic" score (choir "oo", drones, singing bowl, timpani rolls, brass) + soft SFX,
  a fixed voice-band EQ dip, end fades. Check it with `tools/audit.py`.
- `PLAN.md`: timing table + shot plan.

To run it: `bash tools/setup.sh reels/x`, copy `web/*` and `audio.py` from here into the project, add the voice
(`inbox/majushree.mp3` as `voice.mp3`), then `node render.mjs frames "0-965"`, `python3 audio.py`, `python3 mix.py ...`, `bash finish.sh`.
