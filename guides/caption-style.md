# On-screen text: style A overlays (all reels) + word captions (English reels)

**Which when (user, 2026-11-27):** Nepali reels = style A key-phrase overlays only (hook + beats). English reels = style A beat overlays **plus word-by-word captions** of the whole narration (last section), and **no hook title overlay**. Style A (chosen 2026-11-18, the earlier overlays looked cheap) covers every hook, beat and cover overlay. Frame 1080x1920.

## Two rules
1. **Text is never blocked and never blocking:** nothing covers text; text never covers a face, a character or the shot's key prop.
2. **Colours adapt to the background** (light text on a dark plate over dark scenes, dark text on a light plate over bright ones; plate tinted from the background hue; contrast checked every time).

## How it works (`tools/textlayer.js`, run by `render.mjs`)
- **All on-screen text lives in `work/text.json`, never as 3D scene cards.** It is composited in the browser on top of each finished frame (never blurred, inked or graded). Diegetic text on a prop (a report title, a sign) stays in the scene.
- **Mark what text must not cover:** `protect: true` on every person card and each shot's hero prop; `engine/protect.js` turns these into screen rectangles (wire it into `main.js`, three lines, see the top of that file).
- **Plan pass (automatic):** samples the start/middle/end of each overlay, tries candidate slots inside the safe area, picks the calmest one covering no protected card or other text (shrinking to 90 % then 80 %), samples the pixels behind it for the colour mode. Writes `work/textplan.json` + `work/text_report.json`; re-plans when `text.json`, `story.js` or `main.js` change (`REPLAN=1` forces it). Every rendered frame is checked: covered protected cards go under `frameWarnings`.
- **`!! COVERS A PROTECTED CARD` or frame warnings: fix the story, not the check:** move/shrink the element, shift the frames, or drop the overlay when the picture already says it. Never deliver with these flags.

```json
{"overlays": [
 {"id": "hook", "kind": "hook", "from": 76, "to": 141, "text": "सत्य झन् डरलाग्दो छ", "accent": "डरलाग्दो", "y": 380},
 {"id": "ball", "kind": "beat", "from": 392, "to": 432, "text": "बल मात्र होइन", "accent": "मात्र"}
]}
```
`kind`: hook (top, 76 px) / beat (lower third, 64 px) / cover (92 px). `y` = preferred centre; `accent` = the one accent word/number; `\n` = second line (max 2); `"plate": true` forces a plate on a hook; `"lock": true` pins the overlay to its `y`.

## Look
| Part | Value |
|---|---|
| Font | "Kohinoor Devanagari" **Bold** (fallback "Devanagari Sangam MN" Bold), one family per reel |
| Light mode (dark background) | text #F4EFE6, accent #FFA04C, plate = background hue at 10 % lightness, ~62 % opacity |
| Dark mode (mean luminance > 0.45) | text #17203A, accent #A8470A, plate = background hue at 94 % lightness, ~78 % opacity |
| Contrast | text ≥4.5:1, accent ≥3:1 (plate opacity rises to 92 % until both pass) |
| Hook (top) | 76 px; plate unless the area behind is calm and contrast passes, else a soft shadow |
| Beat (lower third) | 64 px on a plate, radius 16, padding 18 x 36, no border |
| Cover | 92 px, hook colours, max 2 lines |
| Text | 2-5 words, max 2 lines, max width 780 px, centred, line height 1.35 (matras never clip), at most one accent word |

**Never (style A):** outlines/strokes on letters · more than two colours · pure white/yellow/red/green/rainbow, gradient, glow or neon · emoji in the video · bouncing, spinning, shaking, typewriter or letter-by-letter effects · word-for-word captions in Nepali reels (key phrases only unless the brief asks) · in English reels, a beat that repeats words the caption already shows.

**Motion:** in = fade 0 → 1 with a 12 px rise over 6 frames, ease-out, landing 0-3 frames before its word · hold ≥30 frames · out = fade over 4 frames, never cut mid-word · a number may count up over 10-15 frames, nothing else animates.

**Safe area:** keep clear of the top ~250 px, bottom ~420 px and right ~150 px. Hook centre line y ≈ 330-420; beats in the lower third, bottom edge ≤ y 1500 (preferred beat y ≤ 1420); never over a face or the key prop (move up/down instead).

**QA** (stills sheet + `text_report.json`): no `coversProtected`, `frameWarnings` empty, contrast ≥4.5 (accent ≥3) · one still per overlay · matras fully visible · not mirrored · inside the safe area · readable at arm's length.

## Word captions (English reels only)
Reference look: one word at a time, bold white with a black outline, centred, in sync with the voice.
- **Make them:** `python3 captions.py work/words.json --script work/script.txt --accent "forty,impossible"` (or `work/whisper.json`): timing from the audio, spelling/punctuation from the script; writes `captions` into `work/text.json`, keeping overlays. Proofread the printed list.
- **Grouping:** one word per caption; a short function word joins the next when spoken together ("put a", "to 300,000"); numbers stay digits; punctuation as in the script.
- **Timing:** lands 1 frame before its word, stays until the next; after a pause >0.35 s it clears 8 frames after the word.
- **Look (`tools/textlayer.js` `CAP`):** "Avenir Next" 800, 84 px (shrinks to fit 860 px), #FFFFFF, black outline 13 px (round joins), soft drop shadow, 3-frame pop-in from 86 %, no fade-out; `accent` words #FFD23F (0-4 per reel: the key number or twist word).
- **Placement:** centre x 495, slot y 1150, then 1290, 1010, 860, 1420, 700, 560; keeps the previous slot unless it covers a protected card (checked at the first/middle/last frame) or an active overlay. `render.mjs` prints `CAPTIONS n words, k slot changes`; anything under `captions.blocked` in `text_report.json` must be fixed in the shot (leave y 1000-1300 free of faces and hero props).
- **With overlays:** drop beat overlays that repeat spoken words; keep beats that add something unsaid (a label, a sound word like LOOK UP, BLEGH!).
- QA: `captions.blocked` empty, no frame warnings, every word spelled as in the script, nothing in the bottom 420 px.
