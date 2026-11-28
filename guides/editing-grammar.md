# Editing grammar (all reels): learned from three reference shorts (2026-11-27)

Mr. P gave three top-performing cartoon history/science shorts (ancient earthquake jar, astronauts can't flush in space, samurai "flying thunder" bomb; 59-65 s) and they were measured frame by frame. **Use everything here in every reel**, on top of the brief. We learn their pacing and grammar; our stories, shots and characters stay our own (never recreate their scenes). **The standard in our own style is `example/meat-shower/`** (user: "this is the best video till now, from now on every video needs to be created like this"); start from it (its README).

## Benchmark (what "good" looks like)
- Length **30-60 s, whatever the story needs** · a new framing every **1.5-2.5 s** (≈13-15 per 30 s, 25-30 per 60 s) · longest still span **<0.4 s** (framediff flags it) · near-still frames under 8 % · transitions are a mix of whips, carried moves and cuts on words (references: ~5-10 whips, 2-12 cuts) · **no silence in the bed** · loudness ~-14 LUFS (finish.sh).

## Story shape (all three use it)
1. **Frame 0 = the action and the paradox at once.** No intro or setup line ("He put a bronze ball in a dragon's mouth…", "If you flush a toilet on a spaceship, you'll never get it back."). Our hook card/overlay sits ON this action image, never on a blank card.
2. **A doubter or an authority** laughs, forbids or mocks.
3. **False calm, then the payoff** ("nothing happens… not even a ripple in the wine" → the big event).
4. **The mechanism as a cutaway:** the camera goes INSIDE the object (pendulum in the jar, hose to the vent, fuse wound like thread); characters leave the frame, the object is the star.
5. **Callback ending + a big visual** (an earth cross-section with a glowing wave; a phone saying "No GPS Signal"; a huge explosion behind two shrugging soldiers), landing on the last word or looping to frame 0.
- Narration in the present tense, often second person ("If you…"), short sentences. Their pace is ~3.5 words/s; ours follows the voice's real rate (Nepali ~2, English ~2.5): size scripts by that.

## Shot grammar
- **One new framing every 1.5-2.5 s**; the camera is never still for more than 0.4 s (creeps, idles, effects).
- **Transitions are carried moves.** Plan at least 3 per reel:
  - **Whip pan** (8-12 f, `ease: "inOut"`, motion-blurred via `work/post.json`; `whip()` in `engine/motion.js`) for "meanwhile / the next one" and gags along a row.
  - **Follow the object:** the camera chases the thing that moves from one place into the next (`followCam()`, `half: true` if framediff flags it).
  - **Fly-through:** dive into a pipe, mouth, crack or window and come out elsewhere (Catmull-Rom `path`; a 6-frame dark or white pass hides the join).
  - **Reflection / object pull-out:** start on a face in a cup, coin, eye or phone screen, then pull out to the scene.
  - **Cut on a word:** right for place/time jumps (plus a 6-frame flash) and for anything framediff flags.
- **Hero inserts of the key prop** in every reel: big, detailed, with an `fxGlint` sweep and a glow entry in post.json.
- **Diegetic screens and props as jokes** (wall screens, a phone, signs, stamps): big, readable, on screen <1 s, part of the scene (not the text layer), never mirrored.
- **Crowds** when the story has a group: `crowd()`, every member with its own seed and phase.
- **Light arc follows the story:** warm interior → day → sunset for decline → night-blue for mystery/explanation → morning for the aftermath. Plan light per shot in PLAN.md.
- **Faces change on every line** (smug → shocked → sweat drop → squint → laugh); close-ups put the head big in frame.
- **Effects in most shots** (`engine/fx.js`): `fxSparks`, `fxGlitter`, `fxLightning`, `fxGlint`, plus fxDust, fxZ, fxBurst, fxSplash, fxRing.

## Post: whips and glow (`work/post.json`, applied by `tools/post.js`)
```json
{"blur": [{"from": 121, "to": 129, "n": 10, "shutter": 0.9}],
 "glow": [{"from": 0, "to": 99999, "amount": 0.22},
          {"from": 300, "to": 360, "amount": 0.5, "radius": 26, "threshold": 0.6}]}
```
- `blur`: every whip and deliberately fast move gets a range (n = 8-12 sub-frames); blur is what makes a whip read smooth instead of strobing. framediff treats these ranges as planned. Cost: n renders per blurred frame.
- `glow`: setup.sh writes a global 0.22. Raise to 0.4-0.6 on gold, fire, lightning, screens, magic, explosions; last matching entry wins; no grey haze on bright skies (raise `threshold` to 0.7).
- Text and captions are drawn after post, so they stay sharp.

## Captions, sound
- English reels: word-by-word captions, no hook title overlay; Nepali reels: style A key-phrase overlays (`guides/caption-style.md`).
- **No dead air:** the bed never stops; at the twist the music cuts to a low drone or room tone + a sub hit, not silence. Everything else as in `CLAUDE.md`.

## QA (add to every reel's checks)
- [ ] Frame 0 is action + paradox (no blank title card) · [ ] a new framing every 1.5-2.5 s
- [ ] ≥3 carried transitions, whips listed in post.json · [ ] one mechanism cutaway (explainers) · [ ] one hero insert with glint + glow
- [ ] a crowd shot if the story has a group · [ ] light changes with the story beats
- [ ] `python3 framediff.py` OK (no unplanned spikes, nothing frozen ≥0.4 s)
- [ ] English: captions on, `captions.blocked` empty · [ ] no silent gaps in the bed
