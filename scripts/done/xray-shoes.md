# Did you know kids got X-rayed to buy shoes? (English, YouTube Shorts): fact

Status: script final; **voiceover recorded by the user, saved as "xrayfor kids"** (look for `inbox/xray*`; rename it to `inbox/xray-shoes.mp3` first). Slug: `xray-shoes`. Voice: speaker "Enzo" in the user's TTS tool, custom fast explainer style. Check the take against the narration below with faster-whisper before building. Length: about 100 words ≈ 35-40 s (measure the real file; it rules).
Platform: **YouTube (English fact video).** All on-screen text in **English**.
Emotion: curiosity → wonder (kids watching their bones) → unease (who got hurt) → ironic "aha" (it was only advertising). Twist: "It never helped shoes fit. It was just advertising. With X-rays."
Loop ending: no. End deadpan on "With X-rays."

## Rules for this reel
- **Pace matches the voice:** fast, punchy explainer style. Cuts and camera moves on almost every sentence (every 1-2 s), snappy whooshes, no lingering holds.
- **Only documented claims on screen.** Do not say or show that children got sick or got cancer; the sources don't support that for this script. The one documented injury is the shop worker's leg (skin damage and pain after ~10 years beside the machine).
- **No graphic imagery:** the worker's leg is shown bandaged or with a soft red glow outline, never wounds.
- **No real brands:** the cabinet is a generic wooden "X-RAY SHOE FITTER" style cabinet with an invented sign (e.g. `SEE YOUR FEET!`), no real company names.
- Kids are happy and curious at the machine; the tone turns only on line 7. Never show a child hurt.
- X-ray look: green fluorescent glow in the viewer window, bones of the toes wiggling in a shoe outline.

## Hook options considered
1. **"Did you know kids used to get X-rayed just to buy shoes?"** (user chose the "did you know" style; strongest paradox)
2. "For thirty years, buying shoes came with a free dose of radiation." (strong, but less curiosity-led)
3. "This shoe shop machine was banned in thirty-four states." (gives the ending away)
4. "Kids used to watch their own bones in shoe shops." (visual, less shock)
5. "The most dangerous thing in a 1950s shoe shop was the fitting machine." (slower)

## Hook layers (0:00)
- **First frame:** a kid mid-step into the glowing wooden cabinet, green light on his face, toe bones already lit in the viewer window. Works on mute.
- **Spoken line:** line 1.
- **Overlay:** `Did you know?` (accent: know?) at the top.
- **Beat overlays:** `1920s shoe shop` (line 2), `X-rays through your feet` (line 4; accent: X-rays), `Millions tried it` (line 6; accent: Millions), `10 years next to it` (line 8; accent: 10), `Banned in 34 states` (line 9; accent: 34), `Never helped the fit` (line 10; accent: Never).
- All text in style A via `tools/textlayer.js` (English, same font family). Never over faces, the viewer window or the bones.

## Narration (plain text, the timing source)
```
Did you know kids used to get X-rayed just to buy shoes?
In the nineteen twenties, shoe shops got a strange new machine.
A wooden cabinet. With a glowing window.
You stepped inside, and X-rays blasted straight up through your feet.
Kids loved it. They wiggled their toes and watched their own bones move.
Millions of people tried it.
But did you know who got hurt the most?
A shop worker. Ten years standing next to that machine left the skin on her leg damaged and painful.
By nineteen sixty, thirty-four US states had banned it.
And the craziest part? It never helped shoes fit.
It was just advertising. With X-rays.
```
If the take differs from this text, time to what was actually said and tell the user.

## Visual journey
| Line | Shot size | Visual | Motion |
|---|---|---|---|
| 1 | MCU | Kid stepping into the glowing cabinet, green light on his face | fast push-in |
| 2 | Wide | 1920s shoe shop (wooden shelves, shoe boxes, bench), the cabinet unveiled under a cloth | whip-pan to the cabinet, cloth pulled |
| 3 | Insert | The cabinet's carved wood, then its glowing viewer window | rack focus wood → window |
| 4 | Insert | Feet slide into the slot; a beam (soft green rays) shoots upward | low angle tilt up with the beam |
| 5 | MCU | Kid at the eyepiece, giggling; in the window, toe bones wiggle | two quick cuts: face / window |
| 6 | Wide | A queue of parents and kids out the door; a map with tiny foot icons popping across America and Europe | crane up from the queue into the map |
| 7 | MS | Light dims; the shop assistant beside the machine, the glow on her side | slow push, colour turns cool |
| 8 | MS → insert | Calendar pages flip 10 years; she rubs her bandaged leg, a soft red outline on the side nearest the machine | calendar flip, then push to the leg (no wounds) |
| 9 | Wide | US map: states light up one by one with a `BANNED` stamp on the last | stamp thunk, small shake |
| 10 | MS | A shoe that clearly doesn't fit (toes squashed) on the X-ray screen | quick zoom, comedic beat |
| 11 | MCU | The shop owner grinning behind a till full of cash, the cabinet glowing behind him | deadpan hold with slow creep; end on "X-rays" |

## Editing specifics
- Pace: fast; a new visual or camera change every 1-2 s; nothing static for more than 2 s.
- Text: style A from `guides/caption-style.md` (English overlays, accent word as listed); inside the safe area.
- Subtitles: key-phrase overlays only (default).
- Ending: outro; hold the last frame ~0.6 s after the voice.
- Cover frame: line 5 (kid at the eyepiece with glowing toe bones), cover text `Kids got X-rayed for shoes?`.

## Sound
Modern, curious, slightly eerie: a quick pulse with plucks and a light retro-1920s piano flavour for the shop, an electrical hum under the cabinet, a soft X-ray "zap" on line 4, a low tension drone from line 7, a stamp thunk on line 9, a cash-register "ding" on the last line. Snappy soft whooshes on cuts. All SFX soft (-12 dB, peaks ≤ 0.4x voice).

## Reach pack (for the user to post)
- YouTube title: "Kids Got X-Rayed Just to Buy Shoes?!" (alt: "The Shoe Shop Machine Banned in 34 States")
- Description: "For three decades from the mid-1920s, shoe shops used X-ray machines (shoe-fitting fluoroscopes) to show customers their foot bones. Experts later called them a sales gimmick, and by 1960, 34 US states had banned them. Sources below."
- Hashtags (5): #DidYouKnow #History #ScienceFacts #Shorts #TheCuriousManche
- Pinned comment: "Would you have tried it as a kid? 👣 Sources: Smithsonian Magazine, JSTOR Daily, Wisconsin 101."
- Platform notes: YouTube Shorts; also fine for Instagram/TikTok if the user wants an English cut.

## QA before posting
- [ ] Facts match sources  - [ ] Text inside the safe area  - [ ] Ending lands on "With X-rays."
- [ ] No claim that kids got sick; no graphic injury
- [ ] No real brand names on the cabinet

## Sources (checked 24 Nov 2026)
- Three decades from the mid-1920s; millions of children and adults in the US, Europe and elsewhere: https://www.smithsonianmag.com/science-nature/heres-looking-at-you-kids-85790281/
- "nothing more nor less than an elaborate form of advertising designed to sell shoes": https://www.smithsonianmag.com/arts-culture/better-feet-through-radiation-the-era-of-the-fluoroscope-171211371/
- Copenhagen case: woman with skin damage and pain on her right leg and foot after ~10 years working in a shoe shop with a fluoroscope; machines in shops from the mid-1920s to 1950s: https://daily.jstor.org/when-shoes-were-fit-with-x-rays
- Pennsylvania first state ban 1957; 34 states banned by 1960: https://wi101.wisc.edu/the-rise-and-fall-of-shoe-fitting-fluroscopes/
