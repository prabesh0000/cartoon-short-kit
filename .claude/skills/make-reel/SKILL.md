---
name: make-reel
description: Make a vertical animated reel for The Curious Manche (stories, legends, history, trending news, facts) with this repo's cartoon-short-kit. It goes from 10 ideas, to a script, to the user's ElevenLabs voiceover, to a finished 1080x1920 MP4 with a cinematic score and SFX. Use for "make a reel", "reel ideas", "new short", or a voiceover dropped in inbox/.
---

# make-reel: idea → script → voiceover → finished MP4 (local, on the user's Mac)

The repo you are in **is** the kit. `CLAUDE.md` (brand, preferences, rules) is already loaded.
**Read `LESSONS.md` before starting**: it holds everything earlier reels taught. Never rebuild the engine from memory.

The look: flat 2D bean-head characters (canvas-drawn cards with plum outlines) in a colourful 3D world with black ink
outlines, painted textures, depth of field and gliding cameras. Output: 1080x1920, 30 fps, exactly as long as the
voiceover. The voice is never edited. Music is synthesized at **50 % of the voice level**; SFX are soft, at **25 %** (-12 dB).

## Folders
- `inbox/`: the user drops voiceovers (`.mp3`/`.wav`) and the final script text here.
- `reels/<slug>/`: one project per reel, made by `bash tools/setup.sh reels/<slug>`. The final MP4 goes to `reels/<slug>/out/`.
- `brand/`: profile photos and the transparent mascot. `engine/mascot.js` draws the host (`drawManche`, `drawQ`).
- `example/yalambar/`: a complete finished reel (11 shots, Nepali VO, cinematic score). Copy its patterns.

## Rules
- Original stories and shots only; never recreate another creator's video. No real, named living people as characters, and no brand mascots or logos.
- **News and facts must be verified**: at least 2 independent sources from the last few days for news, with the date in the script ("गत हप्ता…"). Say plainly if something is disputed. No political opinions, no mocking real people, nothing graphic. Show violence as a flash cut.
- Religious figures and deities: respectful, never mocked. Seen from behind, or as their worshipped form (see LESSONS.md, Yalambar).
- Diegetic text must read correctly (not mirrored). Captions only if the user asks (Devanagari fonts on macOS: "Kohinoor Devanagari", "Devanagari Sangam MN").
- Never edit or re-time the voice. Every visual reaction lands 0-3 frames before its word.
- Audio: always mix with `mix.py` (music exactly -6 dB vs the voice by gated RMS; SFX -12 dB, peaks ≤ 0.4x the voice peak). No ducking or compression; one linear gain + a limiter in `finish.sh`.
- Keep the user posted with a task list. Show a stills contact sheet before the long render.

## Stage 1: Intake (always first)
Check `inbox/` for a new voiceover. If there is one: ask which script it was recorded from (or read a `.txt` next to it), then go to Stage 4.
Otherwise ask once: **"Where are you starting from?"** Need ideas + script / Have a script, need the voiceover / Voiceover ready.
Also ask the length if not given. Default **25-30 s**.

## Stage 2: 10 ideas
Exactly 10, numbered, mixing **stories and legends, history, trending news, and surprising facts**, across eras and countries
(Nepal and international). Each idea gets:
- **Title** (5-8 words, curiosity-driven).
- **Hook line** in Nepali: the first spoken sentence, a paradox stated as fact.
- **The twist** in one line.
- **Why it animates well**: 2-3 big visual moments.
- **True / disputed / legend / news (date)**.
Verify every fact with web search before offering it. Trending news: search for today's or this week's news and cite sources in the reply.
Mark your top 3 picks. Ask for a number or "more".

## Stage 3: Script (after they pick)
Narration only, in **Nepali (Devanagari)** unless told otherwise. Nepali TTS runs about **2 words/s**: 20 s ≈ 40 words, 30 s ≈ 60. (English is about 3.7 words/s.)
1. **Hook** (sentence 1, no setup).
2. **Setting** in 1-2 lines.
3. **Escalation**, 2-4 beats, each bigger. Others doubt or mock.
4. **Pivot / mechanism** ("तर…").
5. **Twist** as the last words.
6. Optional final question for comments ("तपाईंलाई थाहा थियो?").
Plain spoken Nepali, numbers as words, no stage directions. Reply with the script in a copyable block, the word count, the estimated length, a one-paragraph visual plan, and recording tips: ElevenLabs voice "Ashok Pokhrel", natural pauses at sentence ends, export without music, put the file in `inbox/`.
Save the script to `inbox/<slug>.txt`.

## Stage 4: Build (after the voiceover arrives). Do everything without stopping, except the stills check.
### 4.0 Project
`bash tools/setup.sh reels/<slug>`, then copy `inbox/<voice>` to `reels/<slug>/voice.mp3` and the script to `reels/<slug>/work/script.txt`. Work inside `reels/<slug>/`.

### 4.1 Timing
`python3 timing.py voice.mp3 work/script.txt --out work` (uses whisper / faster-whisper if installed, else silence detection + script alignment).
Check `work/phrases.json`: pauses should fall at sentence ends. **Nepali:** if it misaligns, map the phrases to `ffmpeg -i voice.mp3 -af silencedetect=noise=-38dB:d=0.18 -f null -` segments by hand (short repeated words are anchors), as in `example/yalambar/phrases.json`. Total frames = round(duration × 30).

### 4.2 Shot plan (`work/PLAN.md` before code)
One row per shot: frames, words, setting, light, camera move, characters / poses / expressions, effects, SFX cue.
- **Frame 0 = the strongest image** (the payoff or the most dramatic moment), not a calm close-up.
- Usually one shot per phrase; merge tiny phrases. Illustrate every sentence literally; props carry the jokes.
- Vary shot sizes; light for beats (day / golden / storm / dusk); a time or place jump gets a white flash.
- The twist gets a sting (music stops, low hit, push-in with roll). The last shot's payoff lands on the final word.
- Optional 1 s intro/outro with the host (`drawManche`) if the user wants a branded opening.

### 4.3 World (`web/main.js` world section, or `example/yalambar/web/world.js` as a model)
Primitives with painted canvas textures (`paint.js`), `tbox` for constant texel density, a 2-step toon gradient, fog = the horizon colour.
Far-apart areas for different places. Flat normals (`toNonIndexed().computeVertexNormals()`) for low-poly rocks and mountains.
No cones on flat sand: they read as Egyptian pyramids.

### 4.4 Cast (`web/roman.js`, `web/nepal.js`, `web/mascot.js` → `web/toon.js`)
Rebuild after edits: `cat web/toonbase.js web/roman.js web/nepal.js web/mascot.js > web/toon.js`.
bodyFront hooks (from `tools/patch_toon.py`): `armFn` (POSES + `armBlend` in nepal.js), `behind`, `front`, `headExtra`, `back: true`.
Give each card a facing vector and switch to the back-view drawing when the camera is behind it. Card keys hold every visual parameter, quantised with `q()`.
Render a character test sheet before using new designs.

### 4.5 Motion
`camFromKeys` smootherstep glides; holds always creep; kicks on impacts; rolls on drama. Continuous moves over cuts, except for place or time jumps.
Characters never freeze: idle bob, blinks, anticipation → overshoot → settle. Something always moves.
Vertical frame: hfov = 2·atan(tan(vfov/2)·0.5625), about 19° at fov 36, so stage characters in depth. For an over-the-shoulder shot, put the camera on the line through both characters.

### 4.6 Look check (STOP here for the user)
`node render.mjs stills/a "<mid-frame of each shot>,..."` then `python3 sheet.py stills/a stills/sheet_a.jpg`. Look at the sheet yourself first and fix:
the camera inside geometry, faces hidden, characters out of frame, mirrored text, boxed glows. Then `open stills/sheet_a.jpg` for the user, with a one-line shot list, and wait for OK.

### 4.7 Sound (`audio.py` → stems → `mix.py`)
**Match the background sound (score + ambience) to the theme, place and mood of each reel; never reuse one bed for every reel.** Write it to the beats, cinematic, never a happy repetitive loop. Use `example/yalambar/audio.py` as the code template, but pick the palette per reel and state it in the shot plan:
- Devotional / festival (Chhath, Tihar, Dashain): drone, soft bansuri-like flute, tanpura, temple bells, gentle frame drum; calm swells, no war drums.
- War / legend / myth (Yalambar): war drums, braams, brass, choir, ostinato.
- History: strings, slow pulse, ambient pads, period-appropriate instruments where possible.
- Trending news: modern tension, low synth pulse, ticking, clean hits.
- Surprising facts / science: curious plucks, light percussion, airy pads, a reveal sting.
- Mystery / horror: low drones, dissonant strings, heartbeat, near-silence.
Ambience comes from each shot's setting and changes when the setting changes: river → water lapping; village → birds, distant voices; city → traffic hum; night → crickets; mountains → wind; battlefield → distant crowd. Keep it very low.
For thriller-type reels, the structure: impact + braam open; war drums + ostinato for action; drone, ticking and tremolo under dialogue; a riser + reverse cymbal into hits; a near-silent drop + heartbeat before the twist; the biggest hit on the twist; choir + brass for the climax; final hit + gong.
SFX must be **soft and soothing, never loud or distracting** (the user's rule since Chhath, 2026-11-14):
- Fewer cues: soft whooshes on major scene changes, not every cut; one gentle accent per key action. Ambience (water, wind, birds) stays very low.
- Gentle tone: low-pass noise-based cues at about 3-4 kHz (no 6-8 kHz hiss); attacks of 10 ms or more (no clicks, cracks or sharp pops); avoid metal, debris and harsh transients unless the story needs an impact, then keep it low and short.
- Warm over bright: bells, soft chimes, low thuds, breathy whooshes.
Print per-section RMS (builds louder than drops) and plot the stem levels against cut frames to check that hits land.
`python3 mix.py voice.mp3 music.wav sfx.wav` (→ `mix_raw.wav`) → confirm music -6.0 dB vs the voice, SFX ≤ -12 dB. Listen to a cut-heavy section before finishing.

### 4.8 Render + finish
- `node gpucheck.mjs` once per machine: use the GL mode that names the GPU. `GL=gpu` is the default on macOS; `GL=swiftshader` is the slow fallback.
- `node render.mjs frames "0-<N-1>"` in the background; poll with `tail` until done. `RESUME=1` continues after an interruption. Remind the user to keep the Mac awake (e.g. `caffeinate -i` in another terminal).
- `bash finish.sh "Title"` → MP4 + `out/qa_sheet.jpg`. No frozen spans ≥0.4 s, no black frames, loudness about -14 LUFS.
- `open reels/<slug>/out/` and give a few lines on each shot. Offer captions, tweaks, or the next idea.

## Stage 5: After every reel (the user asked for this every time)
Add a dated entry at the top of `LESSONS.md`: what was new, what broke, what to do next time.
Put reusable new characters or props into `engine/nepal.js` (or a new cast file) and new score instruments into the template.
Suggest a commit, and commit or push only when the user says so.
