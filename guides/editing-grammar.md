# Editing grammar (all reels): learned from three reference shorts (2026-11-27)

Mr. P gave three top-performing cartoon history/science shorts as references (an ancient earthquake jar, why astronauts
can't flush in space, the samurai "flying thunder" bomb; 59-65 s each, 1080x1920, 30 fps). They were measured frame by
frame (cuts, motion, still spans, loudness). **Use everything here in every reel**, on top of the brief.
We learn their pacing and grammar; our stories, shots and characters stay our own (never recreate their scenes).

## The standard in our own style: `example/meat-shower/`
User, 2026-11-27: "this is the best video till now, from now on every video needs to be created like this." Every rule below is
shown working there; start new reels from it (its README).

## Measured benchmark (what "good" looks like)
| | Jar | Astronaut | Samurai | Our target |
|---|---|---|---|---|
| Length | 64.9 s | 61.3 s | 59.1 s | **30-60 s, whatever the story needs** |
| New framing every | ~2.3 s | ~1.9 s | ~2.4 s | **1.5-2.5 s** (≈ 13-15 framings per 30 s, 25-30 per 60 s) |
| Longest still span | 0.53 s | 0.70 s | 0.57 s | **< 0.4 s** (framediff.py flags 0.4 s) |
| Near-still frames | 7 % | 3 % | 8 % | under 8 % |
| Transitions | ~10 whips, 2 cuts | ~5 whips/fly-throughs, 12 cuts | ~4 whips, 9 cuts | mix: whips + carried moves + cuts on words |
| Silences in the bed | none | none | none | **none**: music or a drone always under the voice |
| Loudness | -14.1 LUFS | -14.1 | -14.1 | -14 LUFS (finish.sh already) |

## Story shape (all three use it)
1. **Frame 0 = the action and the paradox at once.** No intro, no setup line: "He put a bronze ball in a dragon's mouth…",
   "If you flush a toilet on a spaceship, you'll never get it back.", "He rolled the bomb into the enemy camp but made sure
   it wouldn't go off." Our designed hook card/overlay sits ON this action image, never on a blank card.
2. **A doubter or an authority** laughs, forbids or mocks (the court bursts out laughing; a NO FLUSHING TONIGHT screen;
   "A bomb that doesn't explode?").
3. **False calm, then the payoff**: "nothing happens… not even a ripple in the wine" → the big event.
4. **The mechanism as a cutaway**: the camera goes INSIDE the object (pendulum in the jar, hose to the vent, the fuse wound
   like thread on a spool). Characters leave the frame; the object is the star, big and detailed.
5. **Callback ending + a big visual**: an earth cross-section with a glowing wave; a phone saying "No GPS Signal"; a huge
   explosion behind two shrugging soldiers. It lands on the last word (or loops to frame 0).
- Narration in the **present tense** ("he sneaks out, rolls it…"), often second person ("If you…"). Short sentences.
- Their pace is ~3.5 words/s; ours stays at the voice's real rate (Nepali ~2, English ~2.5) — size scripts by that.

## Shot grammar
- **One new framing every 1.5-2.5 s**, and the camera is never still for more than 0.4 s (creeps, idles, effects).
- **Transitions are carried moves, not just cuts.** Plan at least 3 per reel from this list:
  - **Whip pan** (8-12 f, `ease: "inOut"`, motion-blurred via `work/post.json`): `whip()` in `engine/motion.js`.
    Use it for "meanwhile / elsewhere / the next one" and for gags along a row (each vulture, each soldier).
  - **Follow the object**: the camera chases the thing that moves (the rolled bomb, the flushed waste, a falling steak) from
    one place into the next: `followCam()` in motion.js (`half: true` if framediff flags it).
  - **Fly-through**: the camera dives into a pipe, a mouth, a crack, a window and comes out somewhere else (a Catmull-Rom
    `path` through the object; a 6-frame dark or white pass hides the join).
  - **Reflection / object pull-out**: start on a face in a cup, a coin, an eye, a phone screen, then pull out to the scene.
  - **Cut on a word**: still the right choice for place/time jumps (plus a 6-frame flash) and for anything framediff flags.
- **Hero inserts of the key prop** in every reel: the gold dragon head, the glass-eyed frog, the fuse spool. Big in frame,
  detailed, with a `fxGlint` sweep and a glow entry in post.json. The prop carries the beat.
- **Diegetic screens and props as jokes**: wall screens (NO FLUSHING TONIGHT, GO, OFF COURSE, a countdown "1"), a phone
  (No GPS Signal), signs and stamps. Big, readable, on screen < 1 s, part of the scene (not the text layer), never mirrored.
- **Crowds**: at least one crowd shot when the story has a group (army, court, camp, audience): `crowd()` in motion.js,
  every member with its own seed and phase (laughs and idles never in sync).
- **Light arc follows the story**: warm interior → day → sunset for decline → night-blue for the mystery/explanation →
  morning for the aftermath. Plan the light per shot in PLAN.md.
- **Faces change on every line**: smug → shocked → sweat drop → squint → laugh. Close-ups put the head big in frame.
- **Effects in most shots** (`engine/fx.js` + the toon set): `fxSparks` (fuses, campfires), `fxGlitter` (ice, magic, gold),
  `fxLightning` (thunder, electricity), `fxGlint` (metal and gold), plus fxDust, fxZ, fxBurst, fxSplash, fxRing.

## Post: whips and glow (`work/post.json`, applied by `tools/post.js` in render.mjs)
```json
{"blur": [{"from": 121, "to": 129, "n": 10, "shutter": 0.9}],
 "glow": [{"from": 0, "to": 99999, "amount": 0.22},
          {"from": 300, "to": 360, "amount": 0.5, "radius": 26, "threshold": 0.6}]}
```
- `blur`: every whip and every deliberately fast move gets a range (n = 8-12 sub-frames). Motion blur is what makes a
  whip read as smooth instead of strobing (older reels replaced whips with cuts because they had no blur).
  `framediff.py` treats these ranges as planned. Cost: n renders per blurred frame.
- `glow`: setup.sh writes a subtle global glow (0.22, the reference look). Raise it (0.4-0.6) on gold, fire, lightning,
  screens, magic and explosions. Last matching entry wins. Check the stills: no grey haze on bright skies (raise
  `threshold` to 0.7 if so).
- Text and captions are drawn after post, so they stay sharp.

## Captions by language (guides/caption-style.md has the details)
- **English reels: word-by-word captions** and **no hook title overlay** (user, 2026-11-27): one word (or a short pair like "the city") at a time, bold
  white with a black outline, centred at ~60 % height, landing 1 frame before the word. Made by `tools/captions.py` from the
  word timings + script. No hook overlay (the captions already say the hook); drop beat overlays that repeat spoken
  words (the caption already shows them); keep overlays that add something not said (a number, a label, a sound word).
- **Nepali reels: style A key-phrase overlays** (unchanged).

## Sound
- **No dead air**: the bed never stops. At the twist the music cuts to a low drone or room tone + a sub hit, not silence.
- Everything else as in CLAUDE.md (theme-fitting palette, music -6 dB, SFX soft at -12 dB).

## QA (add to every reel's checks)
- [ ] Frame 0 is action + paradox (no blank title card)  - [ ] A new framing every 1.5-2.5 s
- [ ] At least 3 carried transitions (whip / follow / fly-through / pull-out), whips listed in post.json
- [ ] One mechanism cutaway (for explainers)  - [ ] One hero insert with glint + glow
- [ ] A crowd shot if the story has a group  - [ ] Light changes with the story beats
- [ ] `python3 framediff.py`: OK (no unplanned spikes, nothing frozen ≥ 0.4 s)
- [ ] English: captions on, `text_report.json` → `captions.blocked` empty  - [ ] No silent gaps in the bed
