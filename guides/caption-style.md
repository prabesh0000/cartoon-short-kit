# On-screen text style: "A · clean cinematic" (all reels)

Chosen by the user on 2026-11-18 because the earlier overlays looked cheap (too many bright colours, outlines, too much text).
Applies to every hook overlay, beat overlay, cover text and subtitle. Frame size 1080x1920.

## Look
| Part | Value |
|---|---|
| Font | "Kohinoor Devanagari", **Bold** (fallback "Devanagari Sangam MN" Bold). One family per reel |
| Text colour | warm off-white **#F4EFE6** |
| Accent colour | brand orange **#FFA04C** (sampled from `brand/profile_orange.png`); **at most one accent word or number per overlay** |
| Hook overlay (top) | 76 px, no plate, soft shadow: offset 0 4 px, blur 16 px, rgba(0,0,0,0.45) |
| Beat overlay (lower third) | 64 px on a plate: rgba(12,18,40,0.62), corner radius 16 px, padding 18 px × 36 px, no border |
| Cover text | 92 px, same colours as the hook, maximum 2 lines |
| Line height | 1.35 (Devanagari matras must never clip) |
| Words | 2-5 per overlay, maximum 2 lines, maximum width 780 px, centred |

## Never
- Outlines or strokes around letters, thick or thin.
- More than two colours in one overlay (off-white + one accent).
- Pure white (#FFFFFF), pure yellow, red, green or rainbow text; gradient text; glow or neon.
- Emoji rendered in the video.
- Bouncing, spinning, shaking, typewriter or letter-by-letter effects.
- Captioning every spoken line word for word (key phrases only, unless the brief asks for full subtitles).

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

## QA (in the stills contact sheet)
- [ ] At least one still per overlay  - [ ] Matras and vowel signs fully visible  - [ ] Not mirrored
- [ ] Inside the safe area  - [ ] At most one accent word  - [ ] Readable on a phone at arm's length
