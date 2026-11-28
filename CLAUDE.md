# The Curious Manche: reel studio

Production kit for **The Curious Manche** (मान्छे = person), an animated reel channel by Prabesh ("Mr. P"). Loaded every session: keep it short and current.

## What we make
- Vertical animated reels, 1080x1920, 30 fps, **30-60 s set by the story**, for Instagram, TikTok, YouTube Shorts, Facebook. Topics: stories and legends, history, trending news, surprising facts (international, not only Nepal).
- Language by platform: **YouTube = English fact videos** (English script, narrator, on-screen text). **Instagram/TikTok/Facebook = Nepali (Devanagari).** The brief (`scripts/<slug>.md`) names the language and voice (ElevenLabs, Azure, Kokoro or the user's recording; timing works the same).
- Look: bean-head toon characters on canvas cards in an inked, painted three.js world (`README.md`).

## How to work here
- **Start of every session: `git pull`** (scripts planned in the claude.ai chat arrive as `scripts/<slug>.md`).
- Make a reel with the **make-reel** skill (`/make-reel`). Each reel has a per-video brief in `scripts/<slug>.md` (template `scripts/_TEMPLATE.md`); follow it, it overrides defaults.
- **Read `LESSONS.md` (the distilled rules) and `guides/editing-grammar.md` before every reel.** Do not read `docs/lessons-archive.md` whole; grep it for a keyword.
- Every script goes through `storytelling-hooks` (5 hook options, three hook layers, one arc, bookend + one CTA). Also available: `titles-and-thumbnails`, `retention-audit`, `channel-formula` (yaxeen/storytelling-skills, MIT, `licenses/`).
- **THE STANDARD: `example/meat-shower/`** (user 2026-11-27: "every video needs to be created like this"). Start every reel from it (its README says how) and match it: action hook at frame 0, a new framing every ~2 s, carried motion-blurred transitions, props animated as real actions, gags/crowds, effects in every shot, English word captions, a score that follows the story, a loop ending. `example/manjushri/`, `yalambar/`, `ice-capsule/` are for specific techniques only (ice-capsule: loops, safe-area text, diagrams, SFX checks).
- Voiceovers arrive in `inbox/`; each reel is built in `reels/<slug>/` (git-ignored); brand assets in `brand/`. Never rebuild the engine from memory (`engine/`, `tools/`, `vendor/`).
- **Keep the repo tidy:** `scripts/` holds only pending briefs; move a brief to `scripts/done/` once its reel ships. Never commit renders, frames, voiceovers, contact sheets or other regenerable output. Keep `LESSONS.md` near 16 KB (fold "Newest" into the sections, move detail to the archive). Update README/docs when a file moves.
- Commit or push only when asked. **"end" = commit everything and push.** Otherwise end a session by reminding them to say "commit and push" so lessons reach GitHub. Never force-push.

## The user's standing preferences
- Be direct and concise, prioritise accuracy, verify facts by web search, say plainly when uncertain. News: 2+ sources per claim.
- **Music: cinematic and thrilling, never a happy repetitive loop**, fitted to each reel's theme and setting (devotional for festivals, drums for war legends, modern pulse for news; ambience per shot). Templates: `example/manjushri/audio.py`, `example/yalambar/audio.py`.
- **SFX on key transitions and actions, always soft and soothing**: -12 dB, peaks ≤0.4x the voice (Chhath was too loud).
- Hooks: open mid-action on the strongest image; question hooks about known stories work. End on the twist, then a bookend comment question. Scripts flow like one story (linking words, twist planted early). Voiceover: dramatic news-anchor energy, not whispers.
- Script size: Nepali ~2 words/s (60 words ≈ 30 s), English ~2.5 words/s (75 ≈ 30 s); the real voice file rules.
- **Captions:** English reels get word-by-word captions (`tools/captions.py`; bold white + black outline) and **no hook title overlay**; beat overlays only for unspoken words (LOOK UP, BLEGH!). Nepali reels keep style A key-phrase overlays only.
- **Overlays: style A** (`guides/caption-style.md`) from `work/text.json`, drawn by the text layer: never blocked, never blocking (mark people and hero props `protect: true`), colours adapt to the background. Zero flags in `work/text_report.json` before delivery.
- Show a stills contact sheet before the long render. **Recheck before delivering:** `tools/audit.py`, `tools/framediff.py`, and every line has a picture that proves it. Nepali reels open with the central question as a designed title card over the mid-action frame 0.

## Brand
The Curious Manche; handle @thecuriousmanche (fallback @curiousmanche) on every platform. Mascot: curious bean-head in a dhaka topi, one raised eyebrow, eyes up-right, small "o" mouth, a "?" (`engine/mascot.js`: `drawManche`, `drawQ`). Profile photo `brand/profile_orange.png` (blue/yellow variants alongside).

## Machine (macOS)
Render with `GL=gpu` (default; check once with `node gpucheck.mjs` in a reel project; `GL=swiftshader` is the slow fallback). `caffeinate -i` during renders. Caption fonts: "Kohinoor Devanagari", "Devanagari Sangam MN" (both cover English letters).
