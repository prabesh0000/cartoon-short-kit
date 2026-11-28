# Lessons: the rules every reel follows (read this whole file before each reel)

Distilled from 25 reels. Full per-reel history is in `docs/lessons-archive.md` (96 KB): never read it whole, run `grep -n -i "<keyword>" docs/lessons-archive.md` and read only that entry.
**After each reel:** add 2-6 bullets under "Newest" (only what is NEW and general, no build diary). When "Newest" passes ~12 bullets, fold them into the sections below and move the detail to the archive.

## Newest
- (empty; add dated bullets here)

## User decisions (they override defaults; the latest instruction always wins, flag a conflict once)
- Standard = `example/meat-shower/`. Length 30-60 s, set by the story. Music cinematic, never a happy loop; SFX soft; no dead air.
- English (YouTube): word-by-word captions, no hook title overlay, frame 0 is pure action. Nepali: style A key-phrase overlays; the hook may be a designed title card shown after the first action beat.
- The user has overridden the guides when asked (real organs drawn for lungs/brain, recognisable leader characters, an evil-playful girlfriend). Follow it. There is no sensitive-topics guide (removed 2026-11-26).
- News on real people: every claim from 2+ sources, "आरोप छ" + "दोष प्रमाणित भएको छैन"; legends: never say false, confirm what science confirms, hedge the rest ("सम्भवतः"). Money: no buy/sell advice, "Not financial advice".

## Workflow and machine
- Clone the kit, never rebuild the engine from memory. `git pull` first (scripts arrive as `scripts/<slug>.md`; also check new remote branches for the brief).
- The voice file never has the brief's name. Transcribe it first and compare with the brief; time the take as recorded. A script the user pastes mid-build is the timing source (strip `[tags]`, they are not spoken).
- Always render a stills contact sheet before the long render (it catches cameras inside geometry, hidden faces, boxed glows). Check the text report and the sheet before showing it.
- Render speed: Mac M4 `GL=gpu` stills 0.03-0.1 s/frame, a full 900-1000 frame reel from under a minute to ~8 min. Cloud SwiftShader 2-3.5 s/frame (~45 min for 1150 frames): keep the turn alive with foreground `sleep 580; tail render.log`, `RESUME=1` continues. A background process dies when the reply ends.
- `node --check web/toon.js` after every rebuild. Cast files are concatenated, so name clashes (`RED`, `drawChart`, `drawBubble`) break it silently in the browser: suffix every new constant/function per reel (`RED2`, `drawThink`).
- Scripted edits: assert the old text matched before re-rendering. `text.json` is rewritten by `captions.py`: edit it as JSON, not with sed. macOS sed has no `\b` (use `perl -pi -e`). zsh does not word-split (`set -- $r`, loops over "a b"): use Python for frame deletes and chunk loops.
- `setup.sh`: hides errors (use `bash -x`); its template `main.js` is old. Start from `example/meat-shower/web/` instead. Node 26 only accepts `stripTypeScriptTypes` mode `strip` (setup falls back).
- Cover: rendering with `TEXT=work/cover.json` overwrites `textplan.json`/`text_report.json`: render the cover last, then `REPLAN=1`. A cover overlay needs only frames around the cover frame.
- Offer a voice + SFX-only export if the user wants trending music in Instagram/TikTok.

## Timing and voice
- Rates: Nepali TTS ~2 words/s (loop scripts ~1.75), English ~2.5. User edits add words: start drafts at ~55 words for a 30 s Nepali reel.
- Preferred timing: faster-whisper (`~/.venvs/whisper`, built with `/usr/bin/python3` 3.9; Homebrew Python fails on `av`), model `small`, `language` ne/en, `word_timestamps=True`. Re-run unclear chunks WITHOUT `initial_prompt` (it makes Whisper skip lines).
- Nepali whisper often skips a middle stretch (12-39 s, 26-57 s, 29-45 s). Re-run it in ~10 s chunks (`ffmpeg -ss/-to`, 16 kHz wav, add the offset back). English transcribes in one pass.
- Fallback: `silencedetect=noise=-32dB:d=0.08` maps script phrases to pauses (often exact for ElevenLabs Nepali); hand-map with `-38dB:d=0.18` and syllable counts (7-8 syll/s) when needed. Always eyeball `phrases.json` (the DP merges lines; v3 tags create extra gaps). Cloud has no Hugging Face and Claude cannot hear audio.
- Sped-up voice (`atempo=1.1`): time from the sped-up file.
- Frames: TOTAL = round(dur x 30); check `nb_read_frames` = TOTAL. `finish.sh -shortest` can drop the last frame when the voice is a few ms short: mix against `voice_pad.wav` (`apad=whole_dur`). An outro after the voice uses the same pad; point `audit.py`/`sfx_check.py` at it.
- ElevenLabs: v3/v4 take audio tags (`[dramatically]`, `[short pause]`, at most 2 per line, Natural stability, speed 1.0); v2/Flash use `<break time="0.5s" />`. Tags are read aloud on the wrong model: test one line. Delivery: dramatic news-anchor, not whispers. Nepali voice "Ashok Pokhrel". Write numbers as words; the recorded Devanagari is the timing source.

## Scripting and content
- One flowing story (linking words भनिन्छ / र / तर / जुन / अचम्मको कुरा), never cut-off facts. Plant the twist early. Say the expectation out loud, then break it. A myth-buster needs a believer character. Let characters speak instead of the narrator summarising. A beat of false calm before the payoff.
- Hooks: question about something everyone already knows; for trending news the plain question everyone asks. Twists as direct statements. Bookend: callback to the hook + one specific comment CTA tied to the topic's audience; for loops end on an unfinished "…सोध्नुहोस् कि…" that completes with the hook.
- Prefer "अध्ययन अनुसार" to numbers in the narration; put the number on screen. Round in speech, exact on screen. Date every figure, re-check on render day, post within 1-2 days. Search the exact event + city + month (a look-alike women's event came up once).
- Accuracy catches: "less than others" vs "less"; "not only in the ball"; "found" hedges a single study. Say "डब्लुएचओ" in letters. Instagram: 5 hashtags max.
- Third-party "visual storyteller" skills are for app/pitch visuals; read before installing. Git loop: chat pushes `scripts/<slug>.md`, Code pulls, user says "commit and push" (`inbox/`, `reels/` are git-ignored).

## Staging and camera (vertical 9:16)
- hfov = 2·atan(tan(vfov/2)·0.5625) (~19° at fov 36). A subject 1-2 m off the look line is out of frame at fov 42: aim the look point through the subject's depth, stage in depth, put the camera on the line through both characters for over-the-shoulder. Two-shot ≈ 3.7 m at fov 42.
- Card `h` is its HEIGHT (scale = h / pixel height, not h / width). A 9:16 insert card (1000 x 1780) fills the frame at d = h/0.728. A panel card is 1780 tall: keep `centre ± 0.364·d/0.004` inside 0-1780 and move the drawing (`g.translate`), not the camera.
- Bean-head: head centre ≈ 0.63 h, crown ≈ 0.72 h of the card. Seated head sits ~0.8 m above the soles, ~0.45 m wide (first cameras were 2x too close). A "short" person keeps the head size (shorter legs/torso); shrinking the card reads as farther away. Give recurring characters a signature (topi, hair, moustache) and women a hair cap + bun (`hat: null` is bald).
- Plan the camera height first for "person looking at a sign" hooks. Keep cameras out of buildings/hills (check keys against footprints and rim hills). A look point passing the camera position points straight down: cut on a whoosh. A camera pitched up hides ground props. Set dressing goes beside camera paths, never between camera and subject.
- Wide boards/maps crop in 9:16 (text under ~14 px is unreadable): portrait boards (1000 x 1700), map on top with detail cards below, overview then cut. Labels ≥120 px from the card edge; labels above the subject (frame y 250-450 safe); fade labels in on the wide cut.
- Every spoken line needs a picture that proves it; cause and effect in one frame: the actor ON the thing he acts on, the tool visibly touching its target and standing beside the actor (never between him and the camera). Do not show a number before it is said. Check every up/down diagram against the script in the stills (canvas rotate + is clockwise; a seesaw reads as WEIGHT). Absence needs a person-shaped gap (glowing "?" outlines), not empty seats. Show an abstract idea literally (the middleman stands in the middle of the path). Explanatory beats read better as a designed 2D cut-away card than a literal 3D macro.
- Switch to a back-view drawing when the camera is behind a card (`facingBack`). Eating reads as eating: food held at chest centre, mouth opens 5 frames before the chomp, bite notch, crumbs, chewing cheek. Stop rain/fall in close-ups (a chunk reads as touching the shoulder). Hand at the chin or at the head: end the arm outside the head outline and draw the prop in `headExtra`; do not combine with body `tilt`.
- Handoffs: ONE prop card on ONE world-space path with arm poses timed to it.

## Motion and frame-diff
- Carried moves (whip with blur, follow-the-object, fly-through, pull-out from a reflection) are the style; every fast move needs a `post.json` blur range, otherwise cut on a word. A new framing every ~2 s, never still >0.7 s.
- Frame-diff spikes (>6x median) came from: pans/tilts/pull-backs across textured walls, crowds, lit windows, string-covered boards; `ease: out` pushes; one-frame pose switches; tags appearing in one frame; kicks >0.02 after a cut; calendar flips that blank the face. Fixes: cut on a word, slower/shorter linear push, tilt travel ~0.3 m, fade cards in over ~10 frames, blend pose changes over ~10 frames, wipe instead of blank, a camera that travels half a follower's distance, kicks 0.004-0.022. Judge by cause: a tiny median in static shots makes steady walks read 7-12x.
- Follow cameras judder: pan ≤0.5 screen widths/s and let the vehicle move through the frame.
- Characters never freeze: idle bob, blinks, anticipation → overshoot → settle, new expression per line. Fractional shot ids (4.5) insert shots without renumbering.
- Draining water onto a flat bed pops: fade opacity over the last ~2.5 m (set `transparent = true` once at build). Flash: `flashAt` k ≤0.05 for 3 frames (0.22 washed a night frame); rely on puffs.

## Engine, cards and drawing gotchas
- Cards with alpha <0.5 vanish (alphaTest 0.5) unless `blend: "alpha"`. Texture keys hold every visual parameter, quantised with `q()`. Radial glows must fit the card canvas or show a box edge. Additive glow/cone cards at the same depth as a card wash it out or depth-fight (flicker): put cones ≥1 m behind. Glow cards lower than the ground clip into boxes. Light beams vanish on bright skies.
- Pen helpers: `poly`/`ell` outlines take a WIDTH only; use `stroke([...pts, pts[0]], w, col)` for coloured outlines. Helpers must skip the fill when colour is `null`. `camAt().roll` is DEGREES. armFn ctx has `tcx`, not `cx` (an undefined draws nothing silently). `bodyFront(..., back: true)` skips the face; draw custom faces in `headExtra` (hat null + fringe + brows). Seated characters honour `armFn` (tools/patch_toon.py; re-run on older `toonbase.js`). Test new poses on a cast sheet.
- Faces: squint/sly read as sleepy (use raised brows + smirk); a curved nail + creases on a fingertip reads as a smile; long straight bone lines read as a fork; a fist with the product reads rude (fingers curled above the thumb); hard grey discs read as stains (soft dark glow); background figures behind shallow focus ghost (lower DOF `cInf` ~1.2, push back and darker). Ghosts need real transparency + glow outline + float; hanging signs need something to hang from.
- Lying down: `bill: "fixed"` + `rotZ: π/2`, or flat card + pillow/blanket and `roll: 90`. Silhouettes: draw into an offscreen canvas with `filter = brightness(0)`. Hi-res XCU: a second card with the same drawing scaled 5x, in front of the body card. Detached part = its own card aligned with `headCenter`.
- Low-poly rocks/mountains: flat normals (`toNonIndexed().computeVertexNormals()`); cones on flat sand read as pyramids; squat 4.5-5 m banks read better than tall pillars; a crane needs a small lattice mast + long jib set back (z -30); a sun must sit above the roofline angle; cloud textures from below need puffy `cloudCanvasM`, not streaks. Decide skips before creating meshes (a `continue` after `add` left rocks at the origin). Skip `needsUpdate` toggling: set `transparent` once.
- Seamless tiling: band wave periods must divide the texture width. A tall time ruler (700 x 3200) makes "last 1 %" literal. Crowds: static keys + transform idle. Layer foliage + mist/rays on muddy beige worlds.

## Text layer
- All text in `work/text.json`, composited after the frame (never blurred). Mark every person and each shot's hero prop `protect: true`. The protect box is the WHOLE card (including air above heads): in XCU/MCU or full-frame panels set the card `protect: false` and add invisible proxy cards over the real subject (head-sized; only in shots that character is in). Proxies must be cards, not fx; a proxy behind/below the camera projects garbage. Drop a far-background proxy during the hook.
- Fix `COVERS A PROTECTED CARD`/`frameWarnings` in the story (shrink/move the prop, shift frames, or drop the overlay when the picture says it), never in the check. A preferred `y` the planner can't use is dropped silently (beats ≤ 1420). A top hook cannot survive a continuous tilt-up reveal: snap-cut to a framing with the face below ~600 px. Full-frame panels: draw labels inside the diagram. Same beat slot (y 380) across shots when the lower third is blocked. Raise the camera ~0.35 m rather than moving text.
- English captions need room: keep y 1000-1300 clear of faces/hero props. `captions.py` merges words <5 frames and never overlaps. Text inside a card must include its labels in the design width.

## Audio
- Levels are locked: music -6.0 dB vs voice (gated RMS), SFX -12 dB with peaks ≤0.4x voice, no ducking/compression, one linear gain, ~-14.5 LUFS, -1 dBFS limiter (`LUFS=-16` for high-crest or quiet voices). SFX were too loud once (Chhath): fewer cues, low-pass 3-4 kHz, attacks ≥10 ms, warm over bright, whooshes in pauses not on fast cuts; `mix.py` normalises the SFX stem as a whole, so drop cues under dense narration instead of lowering one.
- Music fits each theme and setting, never one generic bed, never dead air under the voice (a near-silent drop + sting before the twist is fine). Ambience per setting, very low.
- Masking is judged in the 300 Hz-4 kHz band: bed ~8 dB under the voice (median). Fixes: pads/strings an octave down + low-pass 450-700 Hz, no top notes/octaves, "oo" choir, a fixed dip -0.8 x 350-4 kHz, crowds band-limited 70-300 Hz, tones 150-310 Hz low-passed 700-900 Hz, hook cues low-passed ~420 Hz (a bell or 700 Hz whoosh under the first word fails), clacks/chimes/birds in pauses. Windows flagged at word gaps are voice dips: check per-stem levels first.
- Checks: `sfx_check.py` (each cue ≤ -8 dB in the speech band, ≤0.4x peak), `audit.py` (speech-band median ≤ -8 dB, last 50 ms quiet, fade stems over the last ~0.9 s unless looping), SFX onsets within 3 frames of picture, per-section RMS (builds louder than drops).
- Loops: render stems 4 s long and wrap the tail onto the start; run every filter BEFORE the wrap; loop pop 12 ms before the end; tempo whose eighth divides the length; music runs to the last frame; the shot-1 camera is a closed-form `L1(u)` replayed with a decaying offset; seam diff < 6x median.

## Final QA before delivery
`sfx_check.py` + `audit.py`, frame-diff with planned events (cuts, flashes, whips from post.json), `work/text_report.json` clean, an overlap sheet every 12th frame (text/props touching frame edges, one thing blocking another, characters cut by the bottom edge), every line has its picture, `nb_read_frames` = TOTAL, no frozen span ≥0.4 s, no black frames.
