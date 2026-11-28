# Worked example: "पट्टा लगाएको साथी" (comedy + facts, 42.77 s, 1283 frames, 16 shots)

Voice: `inbox/momo.mp3` (not in git). Brief: `scripts/done/leash-friend.md`. Notes: `LESSONS.md`, 2026-11-22.

- `web/leash.js`: the cast. Append it after `drunk.js` when building toon.js:
  `cat toonbase.js roman.js nepal.js mascot.js manjushri.js ice.js gold.js drunk.js leash.js > toon.js`
  (it needs `ice.js`, `gold.js` and `drunk.js` from `reels/alcohol-safety` / `example/ice-capsule`).
  Includes the friend with collar, leash, tail and paws, a playful-villain girlfriend, "you", a lion, lap and park dogs, a wall silhouette helper (`drawSil`), the five-friends diagram, chat and share phones, the 89-vs-2 counter, the lost poster and the hook title card.
- `web/story.js`: 16 fast shots, per-shot light presets with `mixL` blends, arc, crane, Dutch, orbit, dolly-zoom and follow-pan cameras.
- `web/world.js`: café (day and night), sunset savanna, park, diagram studio, clothes shop, night street.
- `audio.py`: mock-epic documentary score (sly pizz with rests under stressed words, lion swell, villain motif, sting) plus soft SFX.
- `tools/castshot.mjs` + `web/cast.html`: character test sheet (`node castshot.mjs stills/cast.png` inside a reel folder).
