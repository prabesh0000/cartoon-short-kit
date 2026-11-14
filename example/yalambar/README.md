# Example: "यलम्बरको शिर" (Yalambar's Head), a Nepali legend, 38.5 s, 11 shots

Nepali (Devanagari) voiceover by ElevenLabs, voice "Ashok Pokhrel". Story: the Kirat king Yalambar goes to
Kurukshetra and promises to fight for whichever side is losing. Krishna realises that would destroy both
armies, the chakra flies, and the head lands in Kathmandu, where it is worshipped as Akash Bhairav at
Indra Jatra.

`web/` is a **standalone engine variant** written in this project (because the kit was not reachable at the time).
It is self-contained and was rendered end to end, so it is a working reference, not a drop-in for the kit's
`engine/main.js`:

- `main.js`: renderer, toon materials, sky, lights, card pool with an LRU texture cache, ink pass
  (1/z second difference: near side only, creases from normals, fades 140-520 m), a 40-tap DOF with no
  foreground bleed, and a grade and flash pass.
- `world.js`: three areas far apart: a Nepal ridge (0,0,0), Kurukshetra (1000,0,0) with camps and the balance
  scale, and Kathmandu (-1000,0,0) with pagodas, brick houses, the Indra Jatra pole, the mask platform and lamps.
- `story.js`: shots, camera keys (plus a procedural follow-cam for the flight), DOF, light presets, the
  balance-scale physics (`thetaAt`, `panTops`, `HOPS`) and every card.
- `audio.py`: the **cinematic thriller score + SFX** (braam, taiko, ostinato, risers, choir, heartbeat, gong,
  thunder, chakra whir, fly-bys, landings). Use it as the template for new scores: keep the instruments and
  rewrite the cue sections.

To run it: make a project with `tools/setup.sh`, then copy `example/yalambar/web/*` over `web/`. Copy
`web/lib/three.module.js` to `web/three.module.js`, because this variant imports `./three.module.js`. Then
`cat web/toonbase.js web/roman.js web/nepal.js > web/toon.js`, put `voice.mp3` in the project, and render as usual.
Timing came from `phrases.json`, which was hand-mapped from silence detection (see LESSONS.md).
