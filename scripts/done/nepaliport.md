# मागेको मुन्द्रा-धाम्रा, पाएको कान्डला-पारादीप (Why didn't India give Nepal Mundra and Dhamra?): news explainer

Status: script final; **voiceover recorded by the user, saved as "nepaliport"** (look for `inbox/nepaliport.*`; rename it to `inbox/nepaliport.mp3` if needed). Slug: `nepaliport`. Check the take against the narration below with faster-whisper before building. Length: about 115 words ≈ 55 s (measure the real file; it rules).
Platform: **Facebook first** (informative format), then YouTube. For Instagram / TikTok, a 30 s cut only if the user asks.
Emotion: curiosity → "it was promised in 2019" → the swap (same states, different ports) → the clue (private vs government) → the catch (bulk ports, Paradip not ready) → open question. Twist: "ढोका त खुल्यो, तर नेपालले ढकढकाएको ढोका होइन।"
Loop ending: no. End on the comment question.

## Rules for this reel
- **India has given no official reason.** The private-vs-government point is a fact; the "easier to give its own government's port" line is **one Birgunj trader's guess**. The screen must label it `अनुमान` (guess). Never present it as India's reason.
- **No real faces, names or caricatures on screen.** The two prime ministers are **faceless silhouettes** in suits with no name tags; the narration names Balen, the screen doesn't.
  - **User override (24 Nov, in Claude Code):** in the handshake shot, Balen and Modi are recognisable toon characters (`drawLeaderB` from the Balen reel: Balen's black daura-suruwal + coat, black topi, dark sunglasses, trimmed beard; Modi's white hair and beard, rimless glasses, cream kurta, slate jacket). Neutral or smiling only, no name tags. The lectern figure ("India hasn't given a reason") stays a faceless silhouette.
- **No logos:** no Adani logo, no port authority logos, no party symbols, no flags waved. Ports are labelled with plain text only (`मुन्द्रा`, `धाम्रा`, `कान्डला`, `पारादीप`) plus small tags `निजी` (private) / `सरकारी` (government).
- **Visuals stay neutral.** The voice has light sarcasm on lines 3 and 7 (ElevenLabs tags); the picture must not mock India, the PMs or the company. No smirks, no eye-rolls on silhouettes. The everyman Nepali trader character may shrug.
- **Map:** if Nepal's outline is shown, use Nepal's official map (with Kalapani-Lipulekh-Limpiyadhura), or crop the far-west corner out of frame. Never use a map that leaves them out. Simplest: show only India's coastline with the six ports, and Nepal as a small labelled pin.
- **Ports by state (must be right on screen):** Gujarat = Mundra (asked) + Kandla (given); Odisha = Dhamra (asked) + Paradip (given, after construction). Kolkata and Visakhapatnam are the existing ports.
- "सात वर्ष" = in-principle agreement in March 2019, never made operational because the transit protocol was not amended by a letter of exchange.

## Hook options considered
1. **नेपालले मुन्द्रा र धाम्रा पोर्ट मागेको थियो। तर भारतले कान्डला र पारादीप दियो। किन होला?** (curiosity gap on fresh news; **chosen**)
2. सात वर्ष पर्खियो, अनि अर्कै पोर्ट आयो। (emotional, but hides the names people searched)
3. अदानीको पोर्ट किन पाएन नेपालले? (clickbait; implies a cause we can't prove)
4. बालेनले दिल्लीबाट दुई पोर्ट ल्याए। तर… (leans on the PM)
5. नेपालको समुद्री ढोका कहाँ खुल्यो? (vague)

## Hook layers (0:00)
- **First frame:** a Nepali truck at a fork in a coastal road, mid-turn. Two signposts: `मुन्द्रा · धाम्रा` taped over with a plain "closed" barrier; `कान्डला · पारादीप` open with a light on it. Works on mute.
- **Spoken line:** line 1.
- **Overlay:** `मागेको एउटा, पाएको अर्कै?` (accent: अर्कै?).
- **Beat overlays:** `२०१९: सहमति ✔ · काम ✖` (line 2; accent: ✖), `उही राज्य, फरक पोर्ट` (line 3; accent: फरक), `निजी vs सरकारी` (line 4; accent: सरकारी), `एक व्यापारीको अनुमान` (line 5; accent: अनुमान), `कन्टेनर vs कोइला-तेल-मल` (line 6), `पारादीप: निर्माणपछि` (line 7; accent: निर्माणपछि), `खास कारण?` (line 8; accent: कारण?).
- All text in style A via `tools/textlayer.js`. Never over the silhouettes, the map ports or the ships. Same slot for every beat overlay.

## Narration (plain text, the timing source)
```
नेपालले मुन्द्रा र धाम्रा पोर्ट मागेको थियो। तर भारतले कान्डला र पारादीप दियो। किन होला?
२०१९ मै भारतले यी दुई पोर्ट नेपाललाई दिने सहमति गरेको थियो। तर कागजी काम कहिल्यै सकिएन, र सात वर्षसम्म त्यो सम्झौता कागजमै मात्र रह्यो।
अनि बालेनको भारत भ्रमणमा नेपालले उही दुई राज्यमा पोर्ट त पायो, तर मागेको पोर्ट भने पाएन।
फरक यहीँ छ। मुन्द्रा र धाम्रा अदानी समूहले चलाउने निजी पोर्ट हुन्। कान्डला र पारादीप भने भारत सरकारले चलाउने पोर्ट हुन्।
भारतले कारण भनेको छैन। तर वीरगञ्जका एक व्यापारीको अनुमान छ, आफ्नै सरकारको पोर्ट दिन सजिलो हुन्छ।
अर्को कुरा पनि छ। नेपाललाई कन्टेनर पोर्ट चाहिन्छ। मुन्द्रा संसारकै ठूला कन्टेनर पोर्टमध्ये एक हो। तर कान्डला र पारादीपमा धेरैजसो कोइला, तेल र मल आउँछ।
अनि पारादीप त बनाउने काम सकिएपछि मात्र खुल्छ।
ढोका त खुल्यो, तर नेपालले ढकढकाएको ढोका होइन। तपाईंलाई के लाग्छ, खास कारण के होला? कमेन्टमा लेख्नुहोस्।
```

ElevenLabs v3 version given to the user (Ashok Pokhrel, Creative/Natural stability, speed 1.0-1.05):
```
[curious] नेपालले मुन्द्रा र धाम्रा पोर्ट मागेको थियो। [serious] तर भारतले कान्डला र पारादीप दियो। [pause] [curious] किन होला?
[thoughtful] २०१९ मै भारतले यी दुई पोर्ट नेपाललाई दिने सहमति गरेको थियो। [sighs] तर कागजी काम कहिल्यै सकिएन, र सात वर्षसम्म त्यो सम्झौता कागजमै मात्र रह्यो।
[excited] अनि बालेनको भारत भ्रमणमा नेपालले उही दुई राज्यमा पोर्ट त पायो, [short pause] [sarcastic] तर मागेको पोर्ट भने पाएन।
[serious] फरक यहीँ छ। [pause] मुन्द्रा र धाम्रा अदानी समूहले चलाउने निजी पोर्ट हुन्। कान्डला र पारादीप भने भारत सरकारले चलाउने पोर्ट हुन्।
[thoughtful] भारतले कारण भनेको छैन। [short pause] तर वीरगञ्जका एक व्यापारीको अनुमान छ, आफ्नै सरकारको पोर्ट दिन सजिलो हुन्छ।
[serious] अर्को कुरा पनि छ। नेपाललाई कन्टेनर पोर्ट चाहिन्छ। [excited] मुन्द्रा संसारकै ठूला कन्टेनर पोर्टमध्ये एक हो। [short pause] [serious] तर कान्डला र पारादीपमा धेरैजसो कोइला, तेल र मल आउँछ।
[sarcastic] अनि पारादीप त बनाउने काम सकिएपछि मात्र खुल्छ।
[dramatic] ढोका त खुल्यो, [pause] तर नेपालले ढकढकाएको ढोका होइन। [curious] तपाईंलाई के लाग्छ, खास कारण के होला? कमेन्टमा लेख्नुहोस्।
```
If the take differs from the plain text (skipped or changed words), time to what was actually said and tell the user.

## Visual journey
| Line | Shot size | Visual | Motion |
|---|---|---|---|
| 1 | MCU → wide | Truck at the fork; signposts: asked ports barred, given ports lit. Nepali trader (everyman, dhaka topi) in the cab, puzzled | slow push-in on the signs, then pull back to the fork |
| 2 | Insert → MS | A signed 2019 paper on a desk; calendar pages flip 2019 → 2026 while the paper gathers dust and a cobweb | rack focus paper → calendar; dust drifts |
| 3 | Wide | Two faceless silhouettes shake hands at a long table (static flag pins only). Cut to a coastline map: Gujarat and Odisha light up; in each state the asked port dims and the neighbouring port lights | crane down from the table into the map |
| 4 | MS split | Each port gets a tag: `निजी` drops on Mundra and Dhamra, `सरकारी` on Kandla and Paradip (plain text tags, no logos) | tags drop with soft `back` overshoot, small dust puff |
| 5 | MCU | The trader at his Birgunj shop shrugs, a thought bubble with a government building handing over a key; label `अनुमान` | gentle head tilt, bubble fades in |
| 6 | Wide → insert | A giant container ship stacked high at the "Mundra" berth; cut to a bulk carrier at "Kandla/Paradip" with coal heaps, oil tanks, fertilizer sacks | slow lateral drift on the ship, push-in on the coal heap |
| 7 | MS | Paradip berth behind a construction barrier, cranes idle, a sign `निर्माण हुँदैछ` | slow creep in; a crane swings once |
| 8 | MCU → wide | A door opens on the right side of a corridor while the trader stands knocking at the left door, which stays shut. He looks to camera, palms up | door swings on "खुल्यो", push-in on the trader for the question |

## Editing specifics
- Pace: a new visual or camera change every 1.5-3 s; nothing static for more than 3 s.
- Text: style A from `guides/caption-style.md` (accent word for each overlay listed under Hook layers); inside the safe area.
- Subtitles: key-phrase overlays only (default).
- Ending: outro on line 8 (no loop); hold the last frame ~0.8 s after the voice ends.
- Cover frame: frame 0 (the fork with the signposts), cover text `मागेको एउटा, पाएको अर्कै?` (accent: अर्कै?).

## Sound
Cinematic, tense music bed (not a happy loop), low strings and a soft pulse; it drops out under line 8's twist and returns as a low drone for the question. Port ambience under lines 1, 6, 7: distant waves, gulls, a soft ship horn, container clanks. SFX: paper rustle and calendar flips (line 2), soft tag drops (line 4), a crane creak (line 7), a door creak plus a single soft knock (line 8). All SFX soft (-12 dB, peaks ≤ 0.4x voice).

## Reach pack (for the user to post)
- Caption: "Nepal asked India for Mundra and Dhamra ports. It got Kandla and Paradip instead. Here's what's different, and what nobody has explained yet. What do you think the real reason is?"
- Hashtags (5): #Nepal #NepalIndia #NepalNews #TradeAndTransit #TheCuriousManche
- Pinned comment: "India hasn't given an official reason. The 'easier to give government ports' line is one Birgunj trader's guess, not India's statement. Sources in the description."
- Poll / Story sticker: "Why do you think Nepal didn't get Mundra and Dhamra?" → "Private vs government" / "Cost and distance" / "Just delay" / "Something else"
- Platform notes: Facebook: post with the sources in the first comment. YouTube: title "Nepal Asked for Mundra & Dhamra. Why Did India Give Kandla & Paradip?" and the sources in the description. Don't tag politicians or the company.

## QA before posting
- [ ] Facts match sources  - [ ] Text inside the safe area  - [ ] Ending lands on "कमेन्टमा लेख्नुहोस्"
- [ ] `अनुमान` label visible on line 5  - [ ] No logos, no faces, map correct or cropped

## Sources (checked 24 Nov 2026)
- Nepal got Kandla and Paradip; had asked for Dhamra and Mundra; agreed in 2019: https://english.onlinekhabar.com/india-grants-nepal-access-to-kandla-and-paradip-ports-for-trade.html
- Dhamra and Mundra run by the Adani Group; Kandla and Paradip by the Indian government: https://english.onlinekhabar.com/access-paradip-kandla-port-nepal.html
- No official reason; Hari Gautam's guess; protocol never amended by letter of exchange for 7 years; Kandla/Paradip mainly bulk (fertilizer, coal, crude oil), Mundra among the world's top 25 container ports; Paradip after infrastructure: https://www.onlinekhabar.com/2026/11/2064071/why-did-india-give-paradip-and-kandla-to-nepal-which-had-asked-for-dhamra-and-mundra-ports
- India agreed to facilitate access to Kandla (Deendayal) and Paradip; Paradip after infrastructure work: https://aninews.in/news/world/asia/india-nepal-announce-19-outcomes-during-pm-balen-shahs-two-day-visit-unveil-rs-15000-crore-package-rail-links20261123223527/
- Treaty and railway agreement must be amended before use: https://kathmandupost.com/money/2026/11/24/new-indian-ports-offer-nepal-more-options-but-cost-benefits-remain-unclear
