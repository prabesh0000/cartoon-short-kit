---
name: make-reel
description: Make a vertical animated reel for The Curious Manche (stories, legends, history, trending news, facts) with this repo's cartoon-short-kit. It goes from 10 ideas, to a script, to the user's ElevenLabs voiceover, to a finished 1080x1920 MP4 with a cinematic score and SFX. Use for "make a reel", "reel ideas", "new short", or a voiceover dropped in inbox/.
---

# make-reel: idea → script → voiceover → finished MP4 (local, on the user's Mac)

The repo is the kit; `CLAUDE.md` (brand, preferences) is loaded. **Read `LESSONS.md` and `guides/editing-grammar.md` before starting.** **The standard is `example/meat-shower/`**: read its README and start every reel from its `web/` and `audio.py`. Never rebuild the engine from memory.

Look: flat 2D bean-head cards (plum outlines) in a colourful 3D world with black ink outlines, painted textures, depth of field, gliding cameras. Output 1080x1920, 30 fps, exactly as long as the voiceover. The voice is never edited. Music is synthesized at 50 % of the voice level (-6 dB), SFX soft at -12 dB.

## Folders
`inbox/` voiceovers (`.mp3`/`.wav`) and final script text · `reels/<slug>/` one project per reel (`bash tools/setup.sh reels/<slug>`; MP4 in `out/`) · `brand/` profile photos and mascot · `example/` meat-shower (the standard), manjushri / yalambar / ice-capsule (techniques only).

## Rules
- Original stories and shots only; never recreate another creator's video. Verify news and facts: 2+ independent sources from the last few days, dated in the script ("गत हप्ता…"); say plainly if disputed. Diegetic text must not be mirrored.
- Never edit or re-time the voice. Every visual reaction lands 0-3 frames before its word.
- Captions by language and text rules: `CLAUDE.md` and `guides/caption-style.md` (English: word captions even if an old brief says key-phrase only).
- Audio: always mix with `mix.py` (music -6 dB vs voice by gated RMS; SFX -12 dB, peaks ≤0.4x the voice peak); no ducking or compression; one linear gain + limiter in `finish.sh`.
- Keep the user posted with a task list; show a stills contact sheet before the long render.

## Stage 1: Intake (always first)
`git pull`. **Each `scripts/<slug>.md` is the per-video brief** (format `scripts/_TEMPLATE.md`): read all of it; its rules, hook layers, visual journey, editing specifics, sound and QA list override these defaults. Check `scripts/` (pending briefs only; finished ones are in `scripts/done/`) for a ready script and `inbox/` for a voiceover. Voiceover present: match it to its script (`scripts/<slug>.md` or a `.txt` beside it; ask if unclear) and go to Stage 4. Script but no voiceover: show it, run the Stage 3 checklist, give recording tips. Otherwise ask once: **"Where are you starting from?"** (Need ideas + script / Have a script, need the voiceover / Voiceover ready). Ask the length if not given: 30-60 s by the story (single twist ≈ 30-40 s; doubter + mechanism cutaway + callback ≈ 45-60 s).

## Stage 2: 10 ideas
Exactly 10, numbered, mixing stories and legends, history, trending news and surprising facts across eras and countries (Nepal and international). Each: **Title** (5-8 words, curiosity-driven) · **Hook line** in Nepali (first spoken sentence, a paradox stated as fact) · **Twist** in one line · **Why it animates well** (2-3 big visual moments, incl. the mechanism cutaway and one carried transition it allows) · **Length** and why · **True / disputed / legend / news (date)**. Verify every fact by web search first; for trending news search today's/this week's and cite sources. Mark the top 3; ask for a number or "more".

## Stage 3: Script (after they pick)
**Load `storytelling-hooks` first** (and its `patterns.md`). Narration only. Language by platform (brief decides). Sizes: Nepali 20 s ≈ 40 words, 30 s ≈ 60; English 30 s ≈ 75.
1. **5 hook options**, each stacking 2-3 labelled levers (curiosity gap, emotional mirror, conflict, relatability, pattern + surprise, three-act); score on the storytelling-hooks checklist, recommend one with the reason. It must land in ~2 s and keep its question open until the payoff.
2. **Three hook layers** for 0:00 (feeds autoplay muted): first frame (mid-action, intriguing silent; it becomes frame 0) · spoken line · text overlay of 2-5 Devanagari words carrying the *other half* of the gap (never a caption of the spoken line).
3. **Script order** (shape from `guides/editing-grammar.md`: action + paradox → doubter → false calm → payoff → mechanism → callback): hook → setup (1-2 lines) → turning point ("तर…"/"अचम्मको कुरा…") → twist → bookend (repeat a hook word) folded into **one CTA**, usually one specific easy comment question.
4. **Beat overlays:** 2-4 words at the turning point and the twist, for muted viewers.

Storytelling rules: start from the real story and its tension, never invent facts, quotes or people · one arc, the viewer discovers, the channel guides · one concrete checkable detail beats ten general lines · one emotion built toward, no hype · one flowing story with linking words, twist planted early, question hooks about known things · plain spoken Nepali, numbers as words, no stage directions in the narration · present tense for story beats, a doubter or authority who laughs or forbids, a beat of false calm · a flowing script gets **one continuous camera journey** (whips, follow-the-object, fly-throughs; flashes/cuts only on time or place jumps).

**Reply with:** hook options and the pick, the three hook layers, the script in a copyable block, word count and length, the camera journey (one row per line), and recording tips (voice per brief, natural pauses at sentence ends, export without music, file into `inbox/`; delivery dramatic news-anchor; ElevenLabs tag rules in `LESSONS.md`). Save the full brief to `scripts/<slug>.md` from `scripts/_TEMPLATE.md` (git-tracked) and a plain narration copy to `inbox/<slug>.txt`.

## Stage 4: Build (after the voiceover arrives). Do everything without stopping except the stills check.
### 4.0 Project
`bash tools/setup.sh reels/<slug>`, copy `example/meat-shower/web/*` + `vendor/three.module.js` into `reels/<slug>/web/` and `example/meat-shower/audio.py` into the project (see its README), copy `inbox/<voice>` to `reels/<slug>/voice.mp3` and the narration lines to `work/script.txt`. Work inside `reels/<slug>/`.

### 4.1 Timing
`python3 timing.py voice.mp3 work/script.txt --out work` (whisper/faster-whisper if installed, else silence detection + script alignment). Check `work/phrases.json`: pauses fall at sentence ends. If it misaligns, follow "Timing and voice" in `LESSONS.md` (chunked whisper, `silencedetect`, hand-mapping as in `example/yalambar/phrases.json`). Total frames = round(duration × 30). **English reels: captions now:** `python3 captions.py work/words.json --script work/script.txt --accent "<0-4 key words>"` (or `work/whisper.json`); proofread the printed list against the script.

### 4.2 Shot plan (`work/PLAN.md` before code)
Start from the brief's visual journey and editing specifics; fill only gaps. **Apply `guides/editing-grammar.md`:** a new framing every 1.5-2.5 s; ≥3 carried transitions marked in the camera column; the mechanism cutaway; one hero insert with `fxGlint` + glow; diegetic screen/sign gags; a crowd shot for a group; light per shot following the story; an effect in most shots. Add a **post column** (whip blur ranges, glow boosts) and write `work/post.json` from it. English: keep y 1000-1300 clear for captions.
**All on-screen text follows `guides/caption-style.md`:** write `work/text.json`, mark every person and each shot's hero prop `protect: true`, wire `engine/protect.js` into `main.js`.
One row per shot: frames, words, setting, light, camera move, characters/poses/expressions, effects, SFX cue.
- **Frame 0 = the hook's first-frame layer** (strongest mid-action image). English: no hook title overlay. Nepali: the hook title card (`drawHook`, designed, word-by-word reveal; overlays via `drawOverlay`, glowing outlined text, no box) clear of the hero's face and raised props.
- **Every line gets a picture that proves it** (cause and effect in one frame; a science line needs a science image). Usually one shot per phrase, split long phrases. Vary shot sizes; light for beats; a time or place jump gets a white flash.
- The twist gets a sting (music to a low drone + low hit, never dead silence; push-in with roll); the payoff lands on the final word. Optional 1 s host intro/outro (`drawManche`).

### 4.3 World (`web/main.js` world section; `example/yalambar/web/world.js` as a model)
Primitives with painted canvas textures (`paint.js`), `tbox` for constant texel density, a 2-step toon gradient, fog = horizon colour, far-apart areas per place, flat normals for low-poly rocks/mountains.

### 4.4 Cast (`web/roman.js`, `nepal.js`, `mascot.js` → `web/toon.js`)
Rebuild: `cat web/toonbase.js web/roman.js web/nepal.js web/mascot.js web/manjushri.js web/fx.js > web/toon.js` (+ the reel's own cast file last; copy `engine/fx.js` in when starting from an older reel's `web/`), then `node --check web/toon.js`. bodyFront hooks (`tools/patch_toon.py`): `armFn` (POSES + `armBlend`), `behind`, `front`, `headExtra`, `back: true`. Facing vector per card, back-view when the camera is behind. Card keys hold every visual parameter, quantised with `q()`. Render a character test sheet before using new designs.

### 4.5 Motion
`camFromKeys` smootherstep glides; holds always creep; kicks on impacts; rolls on drama; continuous moves over cuts except place/time jumps. `motion.js` helpers: `whip(f0, A, B, len)` (camera keys + a `post.json` blur entry: always add it, an unblurred whip strobes), `followCam(posAt, f, {offset, lag, lead, half})`, `crowd(n, {x0, x1, z0, z1})`, `M.inOut`. Characters never freeze; animate actions for real (rules in `LESSONS.md` "Staging"). Something always moves; nothing is still for 0.4 s.

### 4.6 Look check (STOP here for the user)
`node render.mjs stills/a "<mid-frame of each shot>,..."` then `python3 sheet.py stills/a stills/sheet_a.jpg`. Read `work/text_report.json` (no `coversProtected`, no `frameWarnings`, contrast ≥4.5/3). Look at the sheet yourself first and fix: camera inside geometry, faces hidden, characters out of frame, mirrored text, boxed glows, a cause hidden behind its actor. Include a still mid-whip (smoothly blurred) and check the glow (no grey haze on bright skies). English: read the `CAPTIONS` line and `captions.blocked`. Then `open stills/sheet_a.jpg` with a one-line shot list and wait for OK.

### 4.7 Sound (`audio.py` → stems → `mix.py`)
Match the score and ambience to each reel's theme, place and mood; written to the beats, cinematic, never a happy loop, never dead air (the bed runs under the whole voice). Code template `example/yalambar/audio.py`; state the palette in the shot plan:
- Devotional/festival: drone, bansuri-like flute, tanpura, temple bells, gentle frame drum, no war drums. · War/legend/myth: war drums, braams, brass, choir, ostinato. · History: strings, slow pulse, pads, period instruments. · Trending news: modern tension, low synth pulse, ticking, clean hits. · Facts/science: curious plucks, light percussion, airy pads, reveal sting. · Mystery/horror: low drones, dissonant strings, heartbeat, near-silence.
- Ambience follows each shot's setting (river lapping, village birds/voices, city hum, night crickets, mountain wind, battlefield crowd), very low.
- Thriller structure: impact + braam open → drums + ostinato for action → drone/ticking/tremolo under dialogue → riser + reverse cymbal into hits → near-silent drop + heartbeat before the twist → biggest hit on the twist → choir + brass climax → final hit + gong.
- SFX and masking rules: `LESSONS.md` "Audio". Print per-section RMS (builds louder than drops).
`python3 mix.py voice.mp3 music.wav sfx.wav` (→ `mix_raw.wav`): confirm music -6.0 dB vs voice, SFX ≤ -12 dB. Then `sfx_check.py` and `audit.py` (limits in `LESSONS.md`); fix masking in the arrangement, not with ducking.

### 4.8 Render + finish
- `node gpucheck.mjs` once per machine (`GL=gpu` default on macOS; `swiftshader` slow fallback). `node render.mjs frames "0-<N-1>"` in the background, poll with `tail`; `RESUME=1` continues. Remind the user to keep the Mac awake (`caffeinate -i`).
- **After every full render:** `python3 framediff.py frames --planned "<cut and flash frames>"` (whip ranges from post.json count as planned). An unplanned fast move: blur in post.json if it is a deliberate whip, else slow it or cut on a word.
- Run the QA list at the end of `guides/editing-grammar.md` and "Final QA" in `LESSONS.md`.
- `bash finish.sh "Title"` → MP4 + `out/qa_sheet.jpg` (no frozen spans ≥0.4 s, no black frames, ~-14 LUFS). `open reels/<slug>/out/` and give a few lines per shot; offer captions, tweaks, or the next idea.

## Stage 5: After every reel
1. Add 2-6 general bullets under "Newest" in `LESSONS.md` (new rules only, no build diary).
2. Put reusable new characters/props in `engine/nepal.js` (or a new cast file) and new instruments in the audio template.
3. Offer post captions (Nepali + English, hook in the first 125 characters, 5 hashtags, sources for news) and, for YouTube Shorts, a title via `titles-and-thumbnails`.
4. Tidy: move the finished brief to `scripts/done/`, fold `LESSONS.md` "Newest" if it is long, commit no generated output. Remind the user to say "commit and push" (never force-push).
5. If a posted reel underperforms, run `retention-audit` with its retention graph; at 10+ reels run `channel-formula`.
