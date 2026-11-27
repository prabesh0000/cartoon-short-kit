# On-screen text: style A (overlays, all reels) + word captions (English reels)

**Which style when (user, 2026-11-27):**
- **Nepali reels:** style A key-phrase overlays only (hook + beats), as below.
- **English reels:** style A hook/beat overlays **plus word-by-word captions** of the whole narration (section
  "Word captions" at the end), learned from the reference shorts (`guides/editing-grammar.md`). No hook title overlay.

Style A was chosen by the user on 2026-11-18 because the earlier overlays looked cheap (too many bright colours, outlines, too much text).
It applies to every hook overlay, beat overlay and cover text. Frame size 1080x1920.

## The two rules the user asked for (2026-11-18)
1. **Text is always clean: never blocked and never blocking.** Nothing in the scene ever covers text, and text never covers a face, a character or the key prop of the shot.
2. **Colours adapt to the background.** Light text on a dark plate over dark scenes, dark text on a light plate over bright scenes, with the plate tinted from the background's own hue. Contrast is checked every time.

## How it works: the text layer (`tools/textlayer.js`, run by `render.mjs`)
- **All on-screen text goes in `work/text.json`, never into the 3D scene as cards.** `render.mjs` composites it in the browser on top of each finished frame, so it is never blurred, inked, graded or hidden by scenery. (Diegetic text that belongs to a prop, like a report's title or a sign, stays in the scene.)
- **Mark what text must not cover:** add `protect: true` to every person card and to the hero prop of each shot (chart, bubble, capsule, phone…). `engine/protect.js` turns these into screen rectangles; wire it into the reel's `main.js` (three lines, see the top of that file).
- **Plan pass (automatic):** before rendering, `render.mjs` samples the start, middle and end of every overlay, tries the candidate slots inside the safe area, and picks the calmest one that covers no protected card and no other text (shrinking to 90 % then 80 % if needed). It samples the pixels behind the chosen slot and picks the colour mode. It writes `work/textplan.json` and `work/text_report.json` and prints one line per overlay. It re-plans automatically when `text.json`, `story.js` or `main.js` change (`REPLAN=1` forces it).
- **Every rendered frame is checked:** if text covers a protected card on any frame, the frame is listed under `frameWarnings` in the report and a warning is printed.
- **If a line says `!! COVERS A PROTECTED CARD`, or there are frame warnings, fix the story, not the check:** move or shrink the element, shift the overlay's frames, or drop the overlay when the picture already says it (e.g. a chart already showing "+४०%"). Never deliver a reel with these flags.

### `work/text.json`
```json
{"overlays": [
 {"id": "hook", "kind": "hook", "from": 76, "to": 141, "text": "सत्य झन् डरलाग्दो छ", "accent": "डरलाग्दो", "y": 380},
 {"id": "ball", "kind": "beat", "from": 392, "to": 432, "text": "बल मात्र होइन", "accent": "मात्र"}
]}
```
`kind`: hook (top, 76 px) / beat (lower third, 64 px) / cover (92 px). `y` = preferred centre (optional). `accent` = the one word or number in the accent colour (optional). Use `\n` for a second line (maximum 2). `"plate": true` forces a plate on a hook. `"lock": true` pins the overlay to its `y` (the planner otherwise moves it to the calmest free slot; use it for the hook title at the top, and still check the report).

## Look
| Part | Value |
|---|---|
| Font | "Kohinoor Devanagari", **Bold** (fallback "Devanagari Sangam MN" Bold). One family per reel |
| **Light mode** (dark backgrounds) | text warm off-white **#F4EFE6**, accent brand orange **#FFA04C** (sampled from `brand/profile_orange.png`), plate = the background's hue at 10 % lightness, about 62 % opacity |
| **Dark mode** (bright backgrounds, mean luminance above 0.45) | text ink navy **#17203A**, accent deep orange **#A8470A**, plate = the background's hue at 94 % lightness, about 78 % opacity |
| Contrast (checked against the darkest and brightest parts behind the plate) | text at least 4.5:1, accent at least 3:1; the plate's opacity rises (up to 92 %) until both pass |
| Accent | **at most one accent word or number per overlay** |
| Hook overlay (top) | 76 px; no plate only when the area behind is calm and contrast passes, otherwise a plate; a soft shadow when there is no plate |
| Beat overlay (lower third) | 64 px on a plate, corner radius 16 px, padding 18 px × 36 px, no border |
| Cover text | 92 px, same colours as the hook, maximum 2 lines |
| Line height | 1.35 (Devanagari matras must never clip) |
| Words | 2-5 per overlay, maximum 2 lines, maximum width 780 px, centred |

## Never (style A overlays; word captions have their own look, below)
- Outlines or strokes around letters, thick or thin.
- More than two colours in one overlay (off-white + one accent).
- Pure white (#FFFFFF), pure yellow, red, green or rainbow text; gradient text; glow or neon.
- Emoji rendered in the video.
- Bouncing, spinning, shaking, typewriter or letter-by-letter effects.
- In Nepali reels: captioning every spoken line word for word (key phrases only, unless the brief asks for full subtitles).
- In English reels: a beat overlay that repeats words the caption is already showing.

## Motion
- In: fade 0 → 1 with a 12 px rise over 6 frames (0.2 s), ease-out. The overlay lands 0-3 frames before its spoken word.
- Hold at least 1 s (30 frames).
- Out: fade over 4 frames. Never cut text off mid-word.
- A number can count up (e.g. 0% → 40%) over 10-15 frames; nothing else animates inside the text.

## Placement (app UI safe area)
- Keep all text clear of roughly the top 250 px, the bottom 420 px and the right 150 px (app buttons, captions and the profile row sit there).
- Hook overlay: centre line at about y = 330-420.
- Beat overlays: lower third, bottom edge no lower than y = 1500.
- Never cover a character's face or the key prop of the shot; move the overlay up or down instead.

## QA (in the stills contact sheet and `work/text_report.json`)
- [ ] Report: no `coversProtected: true`, `frameWarnings` empty, every contrast at least 4.5 (accent at least 3)
- [ ] At least one still per overlay  - [ ] Matras and vowel signs fully visible  - [ ] Not mirrored
- [ ] Inside the safe area  - [ ] At most one accent word  - [ ] Readable on a phone at arm's length

## Word captions (English reels only, user 2026-11-27)
The reference look: one word at a time, bold, white with a black outline, centred, in sync with the voice.
- **Make them:** after timing, `python3 captions.py work/words.json --script work/script.txt --accent "forty,impossible"`
  (or `work/whisper.json`). Timing comes from the audio, spelling and punctuation from the script. It writes `captions`
  into `work/text.json`, keeping the overlays. Proofread the printed list against the script.
- **Grouping:** one word per caption; a short function word joins the next word when they are spoken together
  ("put a", "the city", "to 300,000"). Numbers stay as digits ("1876", "300,000"). Punctuation as in the script.
- **Timing:** each caption lands 1 frame before its word and stays until the next one; after a pause longer than
  0.35 s it clears 8 frames after the word (no stale word over silence).
- **Look (tools/textlayer.js `CAP`):** "Avenir Next" weight 800, 84 px (shrinks to fit 860 px), fill #FFFFFF, black
  outline 13 px (round joins), soft drop shadow, a 3-frame pop-in from 86 %, no fade-out. `accent` words in #FFD23F
  (0-4 per reel: the key number or the twist word).
- **Placement:** centre x 495 (clear of the right 150 px of app buttons), slot y 1150 (~60 % height), then 1290, 1010,
  860, 1420, 700, 560. It keeps the previous slot unless that covers a protected card (checked at the caption's first,
  middle and last frame) or an active overlay. render.mjs prints `CAPTIONS n words, k slot changes`; anything under
  `captions.blocked` in `work/text_report.json` must be fixed in the shot (leave room at y 1000-1300 for captions: put
  faces and hero props above or below it).
- **With overlays:** **no hook title overlay** in English reels (user, 2026-11-27: the captions already say the hook). Drop beat
  overlays that repeat spoken words; keep beats that add something not said (a label, a sound word like LOOK UP, BLEGH!).
- QA: `captions.blocked` empty, no frame warnings, every word spelled as in the script, nothing in the bottom 420 px.
