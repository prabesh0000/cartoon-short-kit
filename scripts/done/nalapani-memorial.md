# के तपाईंलाई थाहा छ? जित्नेले हार्नेलाई स्मारक (The British built a monument for the Nepali who fought them): history fact

Status: script final, voiceover pending as `inbox/nalapani-memorial.mp3` (no spaces in the file name). Slug: `nalapani-memorial`. Length: about 65 words ≈ 32 s (measure the real file; it rules).
Platform: **YouTube Shorts first** (facts format). Also fine for Facebook.
Emotion: curiosity → underdog tension → pride → surprise (respect from the enemy). Twist: "तर अंग्रेजले दुई स्तम्भ ठड्याए, एउटा आफ्नो जनरललाई, अर्को बलभद्रलाई।"
Loop ending: yes. "…भर्ती हुन थाले।" runs into "के तपाईंलाई थाहा छ…" on replay.

## Rules for this reel
- **No gore.** Gillespie's death is shown far away (a falling silhouette, a hat on the ground), never a wound or blood.
- **Respect both sides.** The British are not villains or cartoons; the story is mutual respect. No "Nepal beat Britain" framing: the British won the battle (the narration says the fort fell).
- **Women and children are defenders, not victims on screen:** carrying water and stones, no one hurt.
- **Balbhadra's name:** sources use both Kunwar and Thapa; we use "कुँवर" (most Nepali sources and the Nepal Army). If a commenter raises Thapa, reply that both names appear in sources.
- **Don't claim** "the world's first memorial to an enemy". Only travel sites say it; it isn't verified.
- No real portraits: Balbhadra and Gillespie are bean-head characters in period uniform, not likenesses.

## Hook options considered
1. **के तपाईंलाई थाहा छ, युद्ध जित्ने सेनाले, हार्ने कमान्डरको सम्मानमा स्मारक बनायो?** (paradox + "did you know"; **chosen**, the user asked to start with "के तपाईंलाई थाहा छ")
2. ६०० बनाम ३,५००, अनि एक महिना। (numbers; less mysterious)
3. अंग्रेजले आफ्नो दुश्मनलाई किन सलाम गरे? (curiosity gap; vaguer)
4. गोर्खालीको "बहादुर" नाम यहीँबाट सुरु भयो। (claim-heavy)
5. देहरादुनमा नेपाली कमान्डरको स्मारक छ। (flat)

## Hook layers (0:00)
- **First frame:** two stone obelisks at dusk on a forest hill, the camera already pushing toward the second one, a small Nepali flag-coloured ribbon of light behind it (no waving flags). Works on mute.
- **Spoken line:** line 1.
- **Overlay:** `के तपाईंलाई थाहा छ?` → `जित्नेले हार्नेलाई स्मारक?` (accent: स्मारक?).
- **Beat overlays:** `१८१४ · नालापानी` (line 2), `६००` (line 3; accent: ६००), `३,०००+` (line 4; accent: ३,०००+), `१ महिना` (line 5; accent: १ महिना), `दुई स्तम्भ` (line 6), `१८१५ →` (line 7).
- All text in style A via `tools/textlayer.js`. Never over faces or the obelisks. Same slot for every beat overlay.

## Narration (plain text, the timing source)
```
के तपाईंलाई थाहा छ, युद्ध जित्ने सेनाले, हार्ने कमान्डरको सम्मानमा स्मारक बनायो?
सन् अठार सय चौध, देहरादुन नजिकको नालापानी किल्ला।
पच्चीस वर्षका बलभद्र कुँवरसँग, महिला र बालबालिका सहित झन्डै छ सय जना।
सामु, अंग्रेजका तीन हजारभन्दा बढी सैनिक।
तैपनि किल्ला एक महिना टिक्यो, र अंग्रेज जनरल जिलेस्पी यहीँ मारिए।
अन्त्यमा किल्ला खस्यो, तर अंग्रेजले दुई स्तम्भ ठड्याए, एउटा आफ्नो जनरललाई, अर्को बलभद्रलाई।
अनि अर्को वर्षदेखि, गोर्खाली उनीहरूकै सेनामा भर्ती हुन थाले।
```

ElevenLabs v3 version (Ashok Pokhrel, Natural stability, speed 1.0):
```
[curious] के तपाईंलाई थाहा छ, [dramatically] युद्ध जित्ने सेनाले, हार्ने कमान्डरको सम्मानमा स्मारक बनायो?
[mysteriously] सन् अठार सय चौध, देहरादुन नजिकको नालापानी किल्ला।
[serious] पच्चीस वर्षका बलभद्र कुँवरसँग, महिला र बालबालिका सहित झन्डै छ सय जना।
[tense] सामु, अंग्रेजका तीन हजारभन्दा बढी सैनिक।
[proudly] तैपनि किल्ला एक महिना टिक्यो, र अंग्रेज जनरल जिलेस्पी यहीँ मारिए।
[short pause] [softly] अन्त्यमा किल्ला खस्यो, [dramatically] तर अंग्रेजले दुई स्तम्भ ठड्याए, एउटा आफ्नो जनरललाई, अर्को बलभद्रलाई।
[confident] अनि अर्को वर्षदेखि, गोर्खाली उनीहरूकै सेनामा भर्ती हुन थाले।
```
Expect a rising "थाहा छ?", weight on "छ सय" vs "तीन हजार", a pause before "अन्त्यमा", and the biggest lift on "अर्को बलभद्रलाई".

## Visual journey
| Line | Shot size | Visual | Motion |
|---|---|---|---|
| 1 | Wide → MCU | Two stone obelisks on a forested hill at dusk; push toward the second | Slow push-in; soft wind |
| 2 | Wide | Crane down from the sky to a small hill fort (stone walls, wooden gate) above a valley; "१८१४" | Crane down, then drift |
| 3 | MCU → medium | Inside the walls: a young commander (25) with a khukuri and a determined face; women and children carrying water pots and stones behind him | Rack focus from commander to the group |
| 4 | Wide (low angle from the fort) | Rows of red-coat soldiers and cannon below the hill, filling the frame | Slow lateral drift (no textured wall behind) |
| 5 | Wide → insert | Night siege: cannon flashes on the walls, the fort holds; far away a British officer's silhouette falls and his hat rolls; a calendar flips through 30 days | Cuts on "टिक्यो" and "मारिए"; calendar flips fast |
| 6 | Wide → MCU | Morning quiet over the empty fort; cut to British soldiers raising two obelisks, one plaque for each side; the camera lands on Balbhadra's | Cut on "तर"; slow push on "बलभद्रलाई" |
| 7 | Wide → loop | A line of Gorkhali soldiers marching in new uniforms past the obelisks; the camera rises and matches frame 0 | Rising move; last frame = frame 0 |

## Editing specifics
- Pace: a new visual or camera change every 1.5-3 s; nothing static for more than 3 s. Cuts on words, slow drifts in between.
- Text: style A (`guides/caption-style.md`), inside the safe area; zero flags in `work/text_report.json`.
- Subtitles: key-phrase overlays only.
- **Ending: loop.** Last frame = frame 0, music runs to the last frame, no outro.
- Cover frame: the two obelisks with the cover text `जित्नेले हार्नेलाई स्मारक?` (style A, accent: स्मारक?).

## Sound
Cinematic war thriller, restrained (template: `example/yalambar/audio.py`): low drums, a madal-like pulse, deep strings; it builds through the siege, drops to near-silence on "अन्त्यमा किल्ला खस्यो", then a warm, proud swell on the obelisks. Forest wind and birds at the start, distant cannon booms (low-passed, soft) in the siege, a stone thud as each obelisk is set, marching feet at the end.
SFX soft (-12 dB, peaks ≤ 0.4x voice); check every cue with `sfx_check.py`.

## Reach pack (for the user to post)
- **YouTube Shorts title:** `The British Built a Monument for the Nepali Who Fought Them #Shorts`
- **YouTube description:**
  ```
  In 1814, at Nalapani near Dehradun, about 600 defenders (women and children included) under 25-year-old Balbhadra Kunwar held a hill fort for a month against 3,000+ British troops. The British commander, Gen. Gillespie, was killed there. The fort fell, but the British raised two memorials: one for their general, one for their "gallant adversary" Balbhadra.

  #Nepal #History #Gurkha #NepaliHistory #TheCuriousManche
  ```
- **Facebook caption:** `के तपाईंलाई थाहा छ? जित्ने सेनाले हार्ने कमान्डरको सम्मानमा स्मारक बनायो। 🇳🇵 Nalapani, 1814: 600 vs 3,000+. Which Nepali history story should we tell next? 👇`
- **Pinned comment:** `The Khalanga War Memorial still stands at Nalapani, Dehradun. Which Nepali war story should we do next? 👇`
- **Poll:** `Did you know this story?` → `Yes 💪` / `First time 🤯`

## QA before posting
- [ ] Facts match the sources  - [ ] No gore; Gillespie's death far away and non-graphic
- [ ] Both sides shown with respect; the narration keeps "किल्ला खस्यो"
- [ ] No "world's first" claim anywhere  - [ ] Text inside the safe area, nothing blocked
- [ ] The loop: last frame = frame 0, no silence gap

## Sources (checked 23 Nov 2026)
- First battle of the Anglo-Nepalese War, Nalapani fort near Dehradun, month-long siege 31 Oct – 30 Nov 1814; British victory: https://en.wikipedia.org/wiki/Battle_of_Nalapani
- About 600 defenders including women and children vs 3,000-3,500 British; Gillespie killed: https://en.wikipedia.org/wiki/Balbhadra_Kunwar ; https://incredibleindia.gov.in/en/uttarakhand/dehradun/khalanga-war-memorial
- Balbhadra was 25 at the time: https://nepalitimes.com/from-nalapani-to-kalapani
- The British built the Khalanga memorial for Gillespie and for Balbhadra as a tribute; twin obelisks: https://www.thestatesman.com/india/nepal-army-chief-visits-khalanga-war-memorial-1502646217.html ; https://incredibleindia.gov.in/en/uttarakhand/dehradun/khalanga-war-memorial
- Plaque wording "Tribute of Respect for our Gallant Adversary Bulbudder…": https://prashant-mathawan.squarespace.com/kiki/the-legendary-gurkha-bulbudder
- Gurkhas in British service since 1815: https://ukdefencejournal.org.uk/britain-and-the-gurkhas-an-enduring-partnership/
