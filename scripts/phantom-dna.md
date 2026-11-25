# The Serial Killer Who Never Existed (English, YouTube): fact

Status: script final, awaiting voiceover `inbox/phantom-dna.mp3`. Length: 98 words ≈ 39 s.
Emotion: cold dread → stunned disbelief → quiet irony. Twist: the DNA was on the cotton swabs before they ever reached a crime scene — contamination at the factory, not a killer. Loop ending: no.
Sensitive topic: news about real people (a real murder victim, real police forces, a real living factory worker). Follow `guides/sensitive-topics.md` section 3.

**Language: English.** This is a YouTube fact video — English script, English narrator, English on-screen text.

## Rules for this reel
- **No real names anywhere**, spoken or on screen: not the murdered police officer, not the professor who cracked it, not the swab manufacturer, not the factory worker. The nickname "the Phantom" is not used in narration in the final cut; it only appears if an overlay needs it.
- **The factory worker is a real living person.** She is drawn as an anonymous worker in a hairnet and gloves, face neutral or absent (turned away / framed from the shoulders down). She is never the butt of the joke and never looks guilty or foolish. The joke is on the forensic system.
- **Police are faceless silhouettes** (reuse `drawSilB` from `web/balen.js`). No badges, no insignia, no identifiable uniforms of a real force.
- **Nothing graphic.** The six murders are represented only by blank case cards on an evidence board. No bodies, no blood, no weapons, no crime-scene tape over a shape on the ground. The one police death is not depicted at all in this cut.
- No real country flags or state coats of arms. The map is schematic: plain coastline and state outlines, no labels except the one noted below.
- "Forty crime scenes" and "six murders" are the source figures — do not round or inflate them.
- Re-check the facts on render day (section 3 of the sensitive-topics guide).

## Hook layers (0:00)
- **First frame:** a dark lab. One gloved hand holds a sealed cotton swab up to a lamp. The swab is already glowing faintly — the answer is on screen in frame one and nobody knows it yet. Motion: the swab turns slowly in the light, dust drifting through the beam.
- **Spoken line:** "Nineteen ninety-three. A woman's DNA appears at a German crime scene."
- **Overlay:** HOW DO YOU CATCH A KILLER WHO WAS NEVER THERE?
- **Beat overlays:** 40 CRIME SCENES (line 3), €300,000 REWARD (line 4), IMPOSSIBLE (line 6), DIFFERENT SUPPLIER (line 7, pointing at the one dark state on the map)

## Narration (record exactly this)
```
Nineteen ninety-three. A woman's DNA appears at a German crime scene.

Then another. Then another.

Sixteen years. Forty crime scenes. Six of them murders.

Police have her genetic code but nothing else. No face, no name. The reward climbs to three hundred thousand euros.

Then her DNA turns up in a man's fingerprints.

Impossible — unless it was never at the crime scenes at all.

It was on the cotton swabs used to collect it. A woman on the factory line had touched them before they were sealed.

Sixteen years, forty scenes, no killer. Would you have caught it?
```

ElevenLabs v3 version (tags, max two per line):

```
[serious] Nineteen ninety-three. [short pause] A woman's DNA appears at a German crime scene.

[ominous] Then another. Then another.

[serious] Sixteen years. Forty crime scenes. [dramatic] Six of them murders.

[serious] Police have her genetic code but nothing else. No face, no name. [urgent] The reward climbs to three hundred thousand euros.

[intense] Then her DNA turns up in a man's fingerprints.

[long pause] [deadpan] Impossible — unless it was never at the crime scenes at all.

[thoughtful] It was on the cotton swabs used to collect it. A woman on the factory line had touched them before they were sealed.

[reflective] Sixteen years, forty scenes, no killer. [curious] Would you have caught it?
```

Voice style prompt: male documentary narrator, late 30s to 40s. Deep, warm and controlled — news-anchor energy, never whispery or breathy. Measured and deliberate, letting each fact land. Tension builds across the read: calm and factual at the start, tightening as the count climbs, flat and stunned on the turn, quiet certainty at the end.

Recording: Eleven v3, stability Natural, speed 1.0, export without music. **"Impossible" must be flat, not performed** — if the take sells it, re-roll that line alone. Leave real pauses after "Then another. Then another." and after "Impossible". Last word "it" falls, it does not rise.

## Visual journey
| Line | Shot size | Visual | Motion |
|---|---|---|---|
| 1 | MCU insert | Dark lab, gloved hand, one sealed swab in a lamp beam, faint glow | Slow turn of the swab, dust in the beam |
| 1 | Wide | Pull back to an evidence board: one case card, one red string, a faceless silhouette | Smooth pull-back, 30 f |
| 2 | Medium | Two more case cards snap onto the board, two more strings | 2-frame snap per card, pin thunk |
| 3 | Wide → push | Board fills: cards multiply, strings cross, silhouette grows taller behind them; schematic map beside it fills with pins | Count climbs on screen to 40; light cools |
| 3 | Insert | Six case cards go dark red among the forty (murders). Blank cards only, no imagery | Slow drift, one card lifts |
| 4 | Medium | Night street, reward poster swinging on a pole, blank oval where the face should be | Poster sways; euro figure counts up to 300,000 |
| 5 | Insert CU | A fingerprint card fills the frame; the loops resolve into DNA bands | Push in with a 3° roll |
| 6 | Insert CU | Everything stops. The fingerprint holds, bands pulsing once | Hold with a creep; one sub hit, then room tone |
| 7 | Wide | Hard cut to a bright factory line: sealed swab packets gliding past gloved hands | Camera rides one packet |
| 7 | Tracking | **One unbroken handoff:** packet → box → van → evidence kit → out at a scene → into tweezers | Continuous move, ~5 s, no cuts |
| 7 | Inset | Map returns top-left: every state lit except one, label DIFFERENT SUPPLIER pointing at the dark one | Inset slides in, holds 2 s |
| 8 | Wide | Back at the board: all forty strings fall slack at once; the silhouette's question mark drops off | Strings fall staggered; slow pull-back |
| 8 | Insert | A plain standards page stamped 2016 | Hold to the end |

## Editing specifics
- Pace: a new visual or camera change every 1.5-3 s; nothing static for more than 3 s. The exception is the "Impossible" hold, which is deliberately frozen except for a camera creep — this is the one place stillness is the point. Expect the frame-diff scan to read it as a near-freeze; it is intended, keep it under 0.4 s of true freeze by letting the DNA bands pulse.
- The factory handoff is one continuous move. Do not cut it into pieces — the unbroken camera is what explains sixteen years without narration.
- Text: style A from `guides/caption-style.md`; inside the safe area. Mark the evidence board and the fingerprint card `protect: false` with proxy cards over the parts that matter, so overlays sit on empty board.
- Subtitles: key-phrase overlays only.
- Ending: no loop. The slack strings and the 2016 page carry the last line.
- Cover frame: the frame-one swab in the lamp beam, cover text THE KILLER WHO NEVER EXISTED.

## Sound
Cold forensic thriller, not action. Low pulse under the count with **one new low note per crime scene** so the stack is audible as it grows; sparse high ticks like a lab timer. Everything cuts dead on "Impossible" — one sub hit, then room tone only for the length of the pause. The factory line comes in bright and clinical, almost cheerful, against what the viewer now knows: a light mechanical loop, conveyor hum at 60/120 Hz, soft packet clicks. Final line over a low drone alone.
SFX: pin thunks on each case card (in the pauses, never on words), poster creak, a single paper rustle on the fingerprint card, conveyor hum, packet clicks, one soft stamp on the 2016 page. Soft throughout: -12 dB, peaks ≤ 0.4× the voice. Low-pass the conveyor hum at 450 Hz and the ticks at 700 Hz so they clear the speech band.

## Reach pack (for the user to post)
- Caption: For 16 years, police across three countries hunted a woman whose DNA was at 40 crime scenes. She had never committed a crime. The twist is in how they collect DNA.
- Hashtags (5): #truecrime #forensics #DNA #unsolved #sciencefacts
- Pinned comment: The case led to a new international standard in 2016 (ISO 18385) requiring forensic kits to be certified DNA-free.
- Poll / Story sticker: "Would you have caught it? YES / NO WAY"
- Platform notes: YouTube Shorts is the target. Title: "The Serial Killer Who Never Existed". Avoid the word "murder" in the title for ad-friendliness; the script keeps it, which is fine for Shorts.

## QA before posting
- [ ] Facts match sources  - [ ] Text inside the safe area  - [ ] Ending works
- [ ] Sensitive-topic checklist passed: no real names anywhere, police faceless, factory worker anonymous and not mocked, nothing graphic, figures match sources, facts re-checked on render day

## Sources (checked 2026-11-25)
- 40 crime scenes across Austria, France and Germany, 1993-2009; swabs traced to one factory employing Eastern European women whose DNA matched; led to ISO 18385 in 2016: https://boingboing.net/?p=1114612
- Investigators concluded in March 2009 the suspect did not exist; DNA belonged to a woman working at the factory that made the collection swabs; Bavarian police used a different factory, which is why the Phantom never appeared there; swabs were sterile but not certified for human DNA collection: https://en.wikipedia.org/wiki/Phantom_of_Heilbronn
- Linked to 40 crimes, six of them murders; contamination occurred before the swabs were used; ISO 18385 published to prevent recurrence: https://www.iso.org/news/2016/07/Ref2094.html
- Reward raised to €300,000 in January 2009; the breakthrough came when the Phantom's female DNA appeared in fingerprints on a male asylum seeker's application: https://en.wikipedia.org/wiki/Phantom_of_Heilbronn
- Background on the contamination route and the investigation: https://www.amusingplanet.com/2025/08/the-phantom-of-heilbronn-how.html

## Open decisions for the user
- Length is 39 s against the channel's 25-30 s aim. To cut to ~30 s, drop "The reward climbs to three hundred thousand euros." and "Then another. Then another."
- An optional stake line was offered and not included: "One of them was a police officer, shot dead in a car park" after "Six of them murders." Adds ~4 s. If added, it is shown as a cap on asphalt — nothing graphic — and she is never named.
