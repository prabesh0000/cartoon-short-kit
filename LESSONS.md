# Lessons learned (read before every new short; add to it after every project)

Newest first. Each entry says what happened and what to do next time.

## 2026-11-19 — Scripting lessons ("गाँजाले चाक सुक्छ?", drug myth-buster, brief in `scripts/ganja-chaak-myth.md`)
- **A myth-buster needs a character, not just facts.** The first draft was correct but flat (no emotional mirror, no conflict). Adding the chowk uncle (काका) who swears the myth is true gave the reel a conflict (uncle vs science), a false win in the middle and a bookend punchline ("काकाको कुरा … चोकको गफमा मात्र छ"). Use a believer character for every myth reel.
- **Pattern + surprise: say the expectation out loud before breaking it.** The user added "भोकले मान्छेहरू झन् धेरै खान्छन्, तौल त बढ्नुपर्ने हो नि?" before the "तर अध्ययन अनुसार…" twist. An implied expectation makes a weak twist.
- **Let characters speak instead of the narrator summarising.** The user rejected "काका जितेजस्तो भयो" (narrator says he won); his own line "काका झन् फुरुक्क, 'मैले भनेकै थिएँ!'" works better.
- **The user prefers "अध्ययन अनुसार" to numbers in the narration** ("तेत्तीस हजार मान्छेको अध्ययनमा" felt heavy). Put the number on screen as a beat overlay instead, so the claim stays concrete.
- After user edits, the script grew from 60 to 70 words (≈ 38-40 s). Expect edits to add words; start drafts at ~55 words.
- Accuracy catches: "users' weight rose less **than others**" (everyone in the study gained weight; without "अरूभन्दा" it sounds like users lost weight). "बढेको पाइयो" (was found) keeps a single study hedged.
- Drug topics: no smoking, joints, chillums, smoke or hero cannabis leaf on screen; the topic lives in narration and text. No drug hashtags (#weed, #ganja, #420). Caption says recreational cannabis is illegal in Nepal.
- ElevenLabs v3 directions for Nepali: Natural stability, speed 1.0, at most two English tags per line ([dramatically], [confidently], [curious], [surprised], [smug], [short pause], [playfully], [mischievously]). Keep the plain script as the timing source; the tags are not spoken.

## 2026-11-18 — Text layer: clean, adaptive, never blocking
- The user wants on-screen text always clean (never blocked, never covering anything) with colours that adapt to the background.
- New: `tools/textlayer.js` + `render.mjs` composite all text in the browser after each frame, from `work/text.json` (no more text cards in the 3D scene). A plan pass picks a free, calm slot inside the safe area (avoiding `protect: true` cards via `engine/protect.js` and other text), then light or dark mode from the pixels behind it, with the plate tinted from the background hue and contrast checked (4.5 text, 3 accent).
- Every frame is checked; `work/text_report.json` lists any overlap. Tested on the ice reel: the hook moved clear of the rumour bubble; "४०% बढी खतरा" had no free slot because the chart fills the safe area, and was flagged rather than covering it. Fix such flags in the story (shrink the prop, or drop the overlay when the picture already says it).

## 2026-11-18 — "आइस चुरोटको बल" (health myth-buster, 36.7 s, 1100 frames, LOOP)
- The voiceover ran 36.7 s, not the brief's ~31 s (63 words ≈ 1.7 words/s with the news-anchor pauses). Size loop scripts at about 1.75 words/s.
- Timing: silence detection (-32 dB, 80 ms) mapped all 7 lines onto the 9 long pauses again; no Whisper needed.
- **Loops:** the last frames (f1094-1099) replay the macro set at times -6..-1 before the crack, so f1099 -> f0 is one continuous move. Audio is **circular**: render the stems 4 s long, then add everything past the end onto the start. **Run every filter (EQ dip, low-pass) BEFORE the wrap**; filtering after it restarts the IIR state at sample 0 and puts a click on every loop (seam step was 1.7x the largest normal step, after the fix it is inside the normal range). Loop pop: place it 12 ms before the end so its peak lands on f0 after the wrap. Use a tempo whose eighth note divides the length (128 eighths here = 104.7 bpm) so the pulse grid survives the wrap.
- With a loop, `audit.py`'s "last 50 ms quiet" and the 0.9 s end fade do not apply: the music must run to the last frame.
- **Text cards are now drawn after DOF** (`top: true` cards go to a separate scene rendered last in `main.js`). Overlays at the "focus distance" still picked up the background's blur, because noink cards are not in the depth buffer. `screen(id, px, py, hp)` places cards by output pixels, which keeps them inside the safe area (clear of top 250 / bottom 420 / right 150 px).
- **New per-cue SFX test** (`tools/sfx_check.py`, now copied into every new project): for each named cue, its frame, its 300 Hz-4 kHz level vs the voice there, and its peak vs the voice peak. It caught a chart-rise tone sitting -3.4 dB under the key number "चालीस प्रतिशत", a falling tone at -5 dB and a whisper on a word tail. Fix: move tones an octave down (150-310 Hz) and low-pass them at 700-900 Hz.
- Music masking fixes that worked: pads one octave down with a 650 Hz low-pass, ticks on eighths (not 16ths) at a low level, icy plucks **only in the pauses**, and a deeper voice-band dip (-0.78 x 450 Hz-4 kHz). Speech band went from -5.1 to -8.5 dB median.
- New SFX designs (in `audio.py`): `pop` (pitch-drop sine + low-passed puff, 8-9 ms attack, no click), `hiss` (cold air), `whisper` (breathy AM noise), `heart`, `paper`, `rise`, `creak` (stick-slip wood), `slide`, `tap`, `ding`, `squeak`, `whip` (rising whoosh).
- Drawing lesson: a curved nail plus curved crease lines on a fingertip read as a smiling face. Draw the nail as a plate, with straight creases.
- **User feedback (v2): the "deeper inhale" chalkboard sketch looked bad.** The user wants a proper human, proper lungs and a visible inhalation. What replaced it (`drawLungs` in `example/ice-capsule/web/ice.js`):
  - a front-view person in a see-through chest window;
  - a ringed windpipe, bronchi and two lobes;
  - lungs that expand with a breath value, and a diaphragm that drops;
  - smoke particles that travel mouth → windpipe → bronchi → tips, stopping at a depth `d`, with grey haze settling where they reach;
  - a menthol-blue glow in the throat and a depth gauge.

  Clean textbook style, no disease or blood. The user asked for the organs, which overrides the guide's "symbols only" default.
- **User feedback (v3): "the ice menthol scene can be better."** The 3D half-pipe read as a flat wall of fibres with a green disc and fog. What replaced it (`drawFilterCut` in `example/ice-capsule/web/ice.js`), a designed cut-away illustration:
  - an upright filter opened to show its fibres, with a glossy capsule holding liquid menthol;
  - on the burst: shell shards, frost and snowflakes spreading through the fibres;
  - dark smoke rising from the tobacco end that turns pale, soft and sparkly as it passes the mist, then drifts out of the mouth end;
  - a thermometer that drops from red to blue under "चिसो", and an up-arrow with "हल्का".

  Lesson: for an explanatory beat, a designed 2D cut-away card in the 3D set reads better than a literal 3D macro. Every word of the line ("मेन्थोल", "चिसो", "हल्का") gets its own visible picture.
- Final-check routine that worked:
  - `sfx_check.py` (every cue: ≤ -8 dB in the speech band under speech, ≤ 0.4x the voice peak);
  - `audit.py` (speech-band median ≤ -8 dB);
  - the loop seam step ≤ the 99th-percentile sample step;
  - a frame-diff scan with the planned events listed;
  - a full overlap sheet (every 12th frame), looked at specifically for text or props touching frame edges.
- **User feedback: "things are blocking other things."** Audit a full sheet (every 12th frame) for overlaps before delivering. Found and fixed:
  - the hook card over the thumb (the fingers now come in diagonally from the right, the filter sits lower, and the card is upper-left);
  - a street pole in front of the rumour line (poles hidden in that stretch; the wires stay above frame);
  - the overlay touching the rumour bubble;
  - onlookers cut by the bottom (caption) edge;
  - a text overlay over the tower's smoking tip (shortened);
  - the chart card covering the rumour bubble and the window (the report gives way to the bubble in the same spot, the chart pops in after its own cut, the window moved);
  - a man pushed out of frame by the dolly-in;
  - diagram labels cropped by the push-in (labels kept ≥ 120 px from the card edges).
- Sensitive-topic pass: no brand anywhere (plain white filter and paper), nobody smokes on screen, the tower's smoke is heavy grey, adult bean-heads only, symbols instead of organs (airway tube on a chalkboard), "WHO" shown as text only (no logo).

## 2026-11-18 — Per-video briefs + sensitive topics (ice cigarette myth)
- From now on every reel gets a **per-video brief** in `scripts/<slug>.md` (template `scripts/_TEMPLATE.md`): rules, hook layers, visual journey with shot sizes and motion, editing specifics (pace, text safe area, ending, cover), sound, reach pack (caption, hashtags, pinned comment, poll, platform notes), QA, sources. The user asked for this after every voiceover.
- Sensitive topics now have `guides/sensitive-topics.md`. Tobacco: no brand anywhere (Nepal Act 2011, Section 10), no appealing smoking, adults only, educational framing from frame 0 (TikTok makes tobacco-promoting content For You feed-ineligible; educational exceptions exist).
- **Loop endings** work: end on an unfinished "…सोध्नुहोस् कि…" that completes with the hook; the last frame equals frame 0, there is no silence gap, and the same SFX plays at both ends. The verb must fit a question ("ask", not "let him know").
- Accuracy catch: "the danger isn't in the ball" was wrong (capsule chemicals can be toxic); say "not only in the ball".
- Say "डब्लुएचओ" (letters) instead of the full name; it is shorter and TTS reads it as W-H-O.
- The user found the on-screen text cheap (bright colours, outlines). From now on every reel uses **style A, clean cinematic** (`guides/caption-style.md`): Kohinoor Devanagari Bold, off-white #F4EFE6, one brand-orange #FFA04C accent word, a soft dark plate, a 0.2 s fade-up.

## 2026-11-17 — "मञ्जुश्रीको ताल" (legend + science, 32.2 s, 7 shots)
- Timing: silence detection at -32 dB / 80 ms found every comma pause, so the 7 script lines mapped exactly without Whisper (the faster-whisper venv from Inam was gone; it lived in a temp folder, so reinstall it somewhere permanent if needed).
- Score palette "god-like cinematic" (user's words): wordless choir, deep drone, singing bowl, timpani rolls (no war drums), D minor → D major on the strike, soft gong on the question. Mixed at music -6.0 dB / SFX -12.0 dB, SFX peak 0.36x voice; every SFX bus low-passed at 3.8 kHz. Waiting for the user's verdict on loudness.
- Deity on a card: Manjushri back view only (golden robe, five-point crown, topknot, flaming sword, halo), scaled 4x for a "divine giant". A raised sword needs a bigger design canvas (1400x1400, body offset so the sole stays at 97.5 %); a 600x1000 card clips the sword.
- Draining a lake onto a flat lakebed pops in one frame when the water plane crosses the bed. Fade the water's opacity over the last ~2.5 m instead (set `transparent = true` once at build: toggling it per frame needs `needsUpdate` and silently does nothing).
- A whip pan whose look point passes the camera position points the camera straight down (frame 231 was all water). Use a cut on a whoosh, or keep the look target ahead of the camera.
- After moving camera keys, check them against the rim hills: two keys sat inside hills (all-green frames). The frame-diff scan (skip the planned cuts and flashes) caught all three problems; run it after every full render.
- Additive glow cards lower than the ground clip into hard boxes; keep foam/spray cards small and centred above the surface.
- Screen-space overlays (Devanagari, Kohinoor) work as screen-billboard cards placed at the focus distance, so DOF never blurs them.
- Underwater "the lake returns" beat: blend the light to a blue preset with short fog, add a lake surface seen from below, light rays, fish and bubbles. It reads instantly and keeps the street recognisable.
- The whole render (966 frames) took about 20 s on the M4, so iterate on full renders freely.
- **Refinement pass (user: "recheck, refine")**, what it found:
  - The cause was hidden: a 4x Manjushri card covered the saddle he was cutting, and the slash arc floated in the sky. **Stage cause and effect in one frame**: put the actor ON the thing he acts on, shoot over the shoulder with the actor upper-left and the target centre-low, and draw the slash *into* the target, then a glowing seam, then the split.
  - A line like "विज्ञान पनि भन्छ" needs its own picture. A cut-away slab of the valley floor (clay bands, shells, fish fossils, a scientist with a magnifier, a translucent lake box rising over the city) explains "the lake was real" far better than an aerial city. Seamless tiling: band waves must use a period that divides the texture width.
  - Hook layer: the central question as a designed title card, **तरवार कि भूकम्प?** (gold vs ice gradients, sword + crack icons, word-by-word reveal, a shake on भूकम्प). It gives muted viewers the other half of the spoken hook. Keep it clear of the hero's raised prop.
  - Screen-space cards (title, overlays, seismograph): place them at the focus distance, offset in camera up/right units; glowing outlined text reads better than grey pill boxes.
  - Fast cranes past a striped wall read as a whip (frame diff 35-50 vs a median of 2.3). Cut on a word instead (here on "यहाँ").
  - **Audio audit** (`reels/manjushri-lake/work/audit.py`): measure the bed vs the voice in the **300 Hz-4 kHz band** during speech; broadband RMS overstates masking because sub-bass drones don't mask words. Fixes that worked without ducking: an "oo" choir instead of "ah" (its formants sit in the voice band), a fixed -9 dB dip at 500 Hz-4 kHz in the music, water as a low rumble (90-600 Hz), and bells/chimes/birds moved into the comma pauses. Result: speech-band median -8.3 dB.
  - Always fade the stems over the last ~0.9 s: the gong tail was cut off abruptly at the voice end.
  - SFX onsets checked against picture frames (energy jumps in the SFX stem): all within 3 frames.


## 2026-11-16 — Scripting lessons (Chhath, Inam Sapkota, Manjushri lake)
- Scripts must read as **one story**, not a list of cut-off facts: link sentences with भनिन्छ / र / तर / जुन / अचम्मको कुरा / जाँदाजाँदै. The user rejected a choppy version.
- **Question hooks** about something everyone already knows grab attention ("के मञ्जुश्रीले साँच्चै तरवारले काठमाडौंको ताल रित्याएका थिए?").
- **Plant the twist early**: "उर्वर माटोमा सभ्यता फस्टायो" sets up the ending where the same माटो amplifies earthquakes.
- Legend vs science: never say the legend is false. Confirm what science confirms ("ताल साँच्चै थियो") and hedge what is probable ("सम्भवतः").
- News on real people: every claim needs a source; one line ("नेताका भाइ पक्राउ") was missed in the first check and turned out true (Kathmandu Post, 14 Nov). Search the outlet's latest feed before calling a claim unverified. Keep "आरोप छ" + "दोष प्रमाणित भएको छैन".
- Dramatic VO: the user wants a **news-anchor** delivery, not whispers. ElevenLabs v3/v4 use audio tags ([dramatically], [short pause]); v2/Flash use `<break time="0.5s" />` (max 3 s, few per script). Tags in brackets are read aloud on the wrong model.
- Instagram hashtags: keep to 5 (a 5-tag cap was reported from Dec 2025).
- Third-party "visual storyteller" agents/skills are aimed at app/pitch visuals; read before installing. The useful parts (BEATS) now live in the make-reel skill, Stage 3.
- **storytelling-hooks** (yaxeen/storytelling-skills, MIT) is now in `.claude/skills/` and is used for every script: 5 hook options with labelled levers, three hook layers (mid-action first frame, spoken line, an overlay carrying the other half of the gap), bookend + one specific comment CTA. Also added: titles-and-thumbnails, retention-audit, channel-formula.
- Git loop between the claude.ai chat and Claude Code: the chat pushes `scripts/<slug>.md`; Code runs `git pull` at the start; the user says "commit and push" at the end. `inbox/` and `reels/` are git-ignored, so scripts must live in `scripts/` to travel.

## 2026-11-15 — "इनाम सापकोटा" (trending news, 30.6 s, 12 shots)
- **Timing: faster-whisper works on the Mac** and beats silence detection. Install it in a venv with the system Python 3.9 (`/usr/bin/python3 -m venv …`), not Homebrew Python 3.15, where `av` fails to build. Run model `small`, `language='ne'`, `word_timestamps=True`, `initial_prompt=<script>`. The recording differed from the script (a dropped line, reworded phrases), and Whisper caught that; silence matching alone could not.
- Live news with real people: the subject is a faceless dark silhouette with a white "?" (no real faces). Officials are generic and unnamed. The script says "आरोप छ" and "दोष प्रमाणित भएको छैन", and the visuals avoid implying guilt (the scale settles level).
- Built on the Chhath engine (`reels/chhath/web/main.js` + `motion.js`), not the template `main.js`: its world/story split is much easier to reuse. New: `inam.js` (drawMan, drawCop, drawJudge, drawApf, phone screen with Devanagari contact tiles, domino faces, scale, magnifier, spot pool + cone). A dark "void" hall is just a floor plus a dark sky and fog, with no walls.
- Devanagari text on canvas works headless on macOS with `'Kohinoor Devanagari'`.
- Dominoes: a group pivots at the far bottom edge and is rotated by `-angle` on x. Lean angle = asin((gap - d) / h), then fall further when the next one falls.
- Vertical framing again: a desk top-down shot only shows about 1 m of width, so stack the subjects in depth (scale behind the files), not side by side.
- Sound used the new soft rules: SFX -12 dB vs the voice, low-passed tocks and whooshes on major cuts only, news palette (pulse, ticks, pads, soft low hits). Waiting for the user's verdict.
- Whole render: 918 frames in about 20 s on the M4.
- **Bug (user spotted): the characters flickered after the domino part.** An additive light cone on a yaw billboard at the same x,z as a character card depth-fights with it: the card washes out or goes blocky from frame to frame. Put cones at least 1 m behind the subject (away from the camera). QA: diff consecutive frames and flag spikes that are not cuts or flashes.
- The user asked for a better "middleman" shot. A static wide shot with tiny figures did not read. What worked: a close two-shot for the handoff, then a crane up that reveals the queue, him and the court doors, plus a dotted gold line drawn through him on the key word ("बिचौलिया"). Show an abstract idea literally: put the person *in the middle* of a visible path.
- **Engine bug fixed: seated characters ignored armFn** (`mode: "sit"` always drew hanging arms), so a "phone at the ear" looked glued to the head. `tools/patch_toon.py` now makes sit use armFn when given; re-run it on older reels' `web/toonbase.js`. Always check a new pose on a cast sheet (`castshot.mjs` + `web/cast.html`) before using it in a shot.
- For a hand holding something at the head, end the arm *outside* the head outline (about 0.6 W from the centre) and draw the prop in headExtra, or the head hides the hand. Body `tilt` shifts the arm away from props drawn in headExtra, so do not combine them.
- **Prop handoffs: ONE prop card on ONE world-space path** (giver's chest -> hands meet -> taker's near hand), with arm poses timed to it. The first version drew the file twice (with the giver and inside the taker's drawing) and left the giver's arm out after the handoff, so it read as two handoffs.
- A faceless character can still act: light-ink sly eyes (heavy upper lid), a raised brow and a smirk on the dark head, with the "?" floating above it (`slyFace` in `inam.js`). Use the big "?" face only for back views.
- "Bland" news beats get better with one physical action on the key word: a stamp slamming "बर्खास्त" on an order letter, an evidence board with red strings, a spotlight that travels to something meaningful (towering "?" dominoes) rather than off into empty space. The user rejected the travelling light as "no value". What worked: the "?" lifts off the man's head on "उनी होइनन्" and settles, huge, over the court, so the question visibly moves from the person to the system.
- The white-on-dark "sly face" looked bad. Use a normal skin-tone cartoon head with engine expressions (add custom `FACE` entries such as `scheme` = lid eyes, brows inner-down, smirk) and float a small "?" above the head. Use `hat: null` plus a hair cap clipped to the head so the brows show.
- On-screen Latin text (a name sign) must fit about 2.5 m wide at that depth in a vertical frame, and check that near props (the chair) do not cover it in low-angle shots.
- Endings land better as a **callback to the hook**: the same empty red chair from shot 1 sits at the top of the staircase, lit by a cone of light, with the "?" over it. Shoot the "ordinary man" from the front at a low angle so the stairs tower behind him, not from above (from above, a dark figure on grey steps reads as nothing).
- Investigation beats: animate the evidence board as a card (`drawBoard(p, k)`, strings drawn in one by one), close the desk front so legs do not show, and remove props that read as blobs (the lamp model).

## 2026-11-15 — Feedback on Chhath: the SFX were too loud
- The user found the Chhath SFX too loud and distracting (already posted). From now on SFX must be **soft and soothing**.
- Causes: SFX mixed at -6 dB vs the voice by *gated* RMS (measured only while sounding, so every hit was nearly as loud as the music), peaks up to 0.7x the voice, swishes swept to 6-8 kHz, and a cue on almost every cut.
- The user also wants the **background sound to fit each reel's theme and setting**. The make-reel skill (4.7) now lists a music palette per topic type and ambience per setting. Pick both per reel and write them in the shot plan.
- Fix in the kit: `tools/mix.py` now defaults to `--sfx 0.25 --sfx-peak 0.4` (-12 dB, peaks <= 0.4x voice). The SFX rules in the make-reel skill now say: fewer cues, low-pass at about 3-4 kHz, attacks of 10 ms or more, warm sounds over bright ones.

## 2026-11-14 — "छठ: डुब्दो सूर्य पहिले" (Chhath, 33.9 s, 14 shots)
- Built on the Yalambar engine variant (`example/yalambar/web/main.js`), patched so `lightAt(f)` may return a light **object**. Presets mixed per frame (`mixL`/`seq` in story.js) give sunset → night → sunrise time-lapses in one shot.
- On the M4 the stills ran at 0.03-0.1 s/frame and the full 1016-frame render took about 30 s. Iterate on stills freely.
- Sun = a screen card at `cam + sunDir*1400` (fog off) + an additive glow; it hides itself below the horizon behind the water plane. Its reflection streak must be narrow (design 80 px wide); a 200 px card made white bars across the river.
- Waist-deep characters: stand cards at y -0.75 behind an opaque water plane at y 0. Ripple rings are flat alpha cards.
- New cast in `chhath.js`: `drawVrati` (sari veil, Chhath nose-to-forehead sindoor, soop/lota), `drawKarna` (back view), grandparents, props (soop, lota, stream, diya, garland, asana, sun, beam). New POSES: `offer`, `soopUp`, `pour`, `lap`. Worth moving into `engine/` if Nepali festivals recur.
- Bug: a `continue` placed after `add(mesh)` left skipped rocks at the world origin, right in the main river shot. Decide skips before creating meshes.
- Vertical framing: at fov 42 a character only 1-2 m off the look line is out of frame. Aim the look point through the subject's depth, not past it.
- An additive light beam is invisible against a bright golden sky. Use a darker sky or an alpha beam.
- Timing again came from silence detection: 10 script lines mapped exactly onto 12 speech segments, because "कथा छ," and the final question got their own pauses.

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
