# The Curious Manche: reel studio

This repo is the production kit for **The Curious Manche** (मान्छे = person), an animated reel channel by Prabesh ("Mr. P").
Claude Code reads this file at the start of every session. Keep it short and current.

## What we make
- Vertical animated reels (1080x1920, 30 fps, 20-40 s) for Instagram, TikTok, YouTube Shorts and Facebook.
- Topics: **stories and legends, history, trending news, surprising facts**. International, not only Nepal.
- Narration: **Nepali (Devanagari)** for now, from ElevenLabs (voice "Ashok Pokhrel"). English may come later, on a separate account.
- Look: bean-head toon characters on canvas cards in an inked, painted three.js world (see `README.md`).

## How to work here
- To make a reel, use the **make-reel** skill (`.claude/skills/make-reel/SKILL.md`). Typing `/make-reel` also works.
- **Read `LESSONS.md` before every reel.** After every reel, add a dated entry at its top (the user wants learnings saved every time).
- Voiceovers arrive in `inbox/`. Each reel is built in `reels/<slug>/` (git-ignored). Brand assets are in `brand/`.
- Never rebuild the engine from memory; it is all in `engine/`, `tools/` and `vendor/`. Worked example: `example/yalambar/`.
- Commit or push only when the user asks.

## The user's standing preferences
- Be direct and concise, prioritise accuracy, verify facts (web search) before stating them, and say plainly when something is uncertain.
- **Music: cinematic, never a happy repetitive loop.** Template: `example/yalambar/audio.py`.
- **Background sound (music palette + ambience) must fit each reel's theme and setting**, e.g. devotional for festivals, drums for war legends, modern pulse for news, river/birds/crickets/traffic to match each shot. Never reuse one generic bed.
- **Sound effects: soft and soothing, never loud or distracting.** Use them on key transitions and actions only, sitting well under the voice (-12 dB, peaks <= 0.4x the voice). Chhath (2026-11-14) was too loud.
- Hooks: open on the strongest image. Aim for 25-30 s. End on the twist, and optionally a question.
- Nepali scripts are sized at about **2 words/s** (60 words ≈ 30 s).
- Show a stills contact sheet before the long render.

## Brand
- Name: The Curious Manche. Handles: @thecuriousmanche (fallback @curiousmanche); the same handle on every platform.
- Mascot: a curious bean-head in a dhaka topi, one eyebrow raised, eyes looking up-right, small "o" mouth, with a "?". Code: `engine/mascot.js` (`drawManche`, `drawQ`).
- Profile photo: `brand/profile_orange.png` (orange sunburst, navy jacket, white "?"). Blue and yellow variants are in `brand/`.

## Machine notes (macOS)
- Render with the GPU: `GL=gpu` is the default on macOS in `tools/render.mjs`. Check once by running `node gpucheck.mjs` inside any reel project; `GL=swiftshader` is the slow CPU fallback.
- Keep the Mac awake during renders (`caffeinate -i`).
- Devanagari fonts for captions: "Kohinoor Devanagari", "Devanagari Sangam MN".
