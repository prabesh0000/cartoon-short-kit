# के तपाईं कालो हुनुहुन्छ? (Why is your skin this colour?): science fact

Status: script final, **voiceover coming** as `inbox/skin-colour.*` (ElevenLabs v3, Ashok Pokhrel, tagged version below). Slug: `skin-colour`. Length: about 88 words ≈ 42-45 s (measure the real file; it rules).
Platform: **Instagram + TikTok first** (Gen Z, playful), also fine for YouTube Shorts and Facebook.
Emotion: surprise ("we were all dark") → curiosity (why skin changed) → "wow" (dark skin + blue eyes, pale skin only ~3,000 years ago) → warm, funny ending (call him दाइ, not काले). Twist: "युरोपमा गोरो छाला धेरै हुन थालेको त करिब तीन हजार वर्षअघि मात्र हो।"
Loop ending: no. Ends on a share CTA ("…त्यो दाइलाई पठाउनुहोस्").

## Rules for this reel
- **Original reel.** The idea came from another creator's video; never copy its shots, layout, captions or its "sorry, your cousin" ending. Our ending is the काले → दाइ line.
- **No caricature.** Every bean-head keeps the house style; skin tone changes only the fill colour. No exaggerated lips, noses or hair, no "tribal" costumes, no stereotyped accents or props. Africa is shown as savanna, sun and people, not as a cliché (no huts-and-spears scenes).
- **The joke is on the teasing, never on the person.** On "काले", the dark-skinned friend is confident and smiling; the teaser is the one who looks sheepish. Nobody is laughed at for their colour.
- **The ancient Briton (Cheddar Man)** is our own bean-head with dark skin, short dark curly hair and blue eyes, in simple furs. Do not copy the museum reconstruction or the TV images.
- **Hedge the 3,000-year claim:** the narration says "एक अध्ययनअनुसार" (according to one study); keep that on screen too (`एक अध्ययन` in small text under the number). The study was a preprint when last checked.
- No real people, flags or national symbols.

## Hook options considered
1. **के तपाईं कालो हुनुहुन्छ, वा तपाईंको कुनै साथी कालो छ? त्यसो भए, एउटा अचम्मको कुरा सुन्नुहोस्।** (direct, relatable question; **chosen by the user**)
2. तपाईंको छाला किन यो रङको छ? जवाफ घाममा लुकेको छ। (curiosity; weaker personal pull)
3. दस हजार वर्षअघि बेलायतीको छाला कालो थियो। (fact hook; gives the twist away)
4. गोरो छाला त भर्खरको कुरा हो। (bold, but needs context)
5. एक समय, हामी सबै कालै थियौं। (strong, used as line 2)

## Hook layers (0:00)
- **First frame:** two Nepali bean-head friends on a Kathmandu chowk mid-laugh, one darker-skinned, one lighter, the lighter one mid-point at the other with a teasing grin; a giant sun glares over the rooftops. Works on mute.
- **Spoken line:** line 1.
- **Overlay:** `तपाईंको छाला किन यो रङको?` (accent: रङको?).
- **Beat overlays:** `हामी सबैको जरा: अफ्रिका` (line 2; accent: अफ्रिका), `कालो छाला = प्राकृतिक सनस्क्रिन` (line 2 end; accent: सनस्क्रिन), `कम घाम → भिटामिन डी` (line 3; accent: डी), `१०,००० वर्षअघि: कालो छाला, नीलो आँखा` (line 4; accent: नीलो), `गोरो छाला: ~३,००० वर्षअघि मात्र` + small `एक अध्ययन` (line 5; accent: ३,०००), `एउटै परिवार` (line 6; accent: परिवार), `काले ✖ दाइ ✔` (line 7; accent: दाइ).
- All text in style A via `tools/textlayer.js`. Never over faces or the sun/colour-bar diagram.

## Narration (plain text, the timing source)
```
के तपाईं कालो हुनुहुन्छ, वा तपाईंको कुनै साथी कालो छ? त्यसो भए, एउटा अचम्मको कुरा सुन्नुहोस्।
एक समय, हामी सबै कालै थियौं। आज बाँचेका हरेक मान्छेको जरा एउटै ठाउँमा छ, अफ्रिका। त्यहाँको कडा घाममा कालो छाला प्राकृतिक सनस्क्रिन थियो।
पछि कम घाम हुने चिसो ठाउँ पुगेकाहरूको छाला, भिटामिन डी बनाउन बिस्तारै उज्यालो भयो।
अचम्म त के भने, दस हजार वर्षअघिको एक बेलायती कालो छाला र नीलो आँखाको थियो।
एक अध्ययनअनुसार, युरोपमा गोरो छाला धेरै हुन थालेको त करिब तीन हजार वर्षअघि मात्र हो।
त्यसैले तपाईंको कालो साथी साथी मात्र होइन। धेरै पुस्ता पछाडि फर्किनुहोस्, तपाईंहरू एउटै परिवार हुनुहुन्छ।
अब उसलाई "काले" होइन, "दाइ" भन्नुहोस्। यो भिडियो आफ्नो त्यो दाइलाई पठाउनुहोस्।
```

ElevenLabs v3 version given to the user (Creative/Natural stability, speed 1.0-1.05):
```
[curious] के तपाईं कालो हुनुहुन्छ, [short pause] वा तपाईंको कुनै साथी कालो छ? [excited] त्यसो भए, एउटा अचम्मको कुरा सुन्नुहोस्।
[serious] एक समय, हामी सबै कालै थियौं। [pause] आज बाँचेका हरेक मान्छेको जरा एउटै ठाउँमा छ, [dramatic] अफ्रिका। [thoughtful] त्यहाँको कडा घाममा कालो छाला प्राकृतिक सनस्क्रिन थियो।
[thoughtful] पछि कम घाम हुने चिसो ठाउँ पुगेकाहरूको छाला, भिटामिन डी बनाउन बिस्तारै उज्यालो भयो।
[excited] अचम्म त के भने, [short pause] दस हजार वर्षअघिको एक बेलायती कालो छाला र नीलो आँखाको थियो।
[serious] एक अध्ययनअनुसार, युरोपमा गोरो छाला धेरै हुन थालेको त करिब तीन हजार वर्षअघि मात्र हो।
[warm] त्यसैले तपाईंको कालो साथी साथी मात्र होइन। [pause] धेरै पुस्ता पछाडि फर्किनुहोस्, तपाईंहरू एउटै परिवार हुनुहुन्छ।
[playful] अब उसलाई "काले" होइन, [short pause] "दाइ" भन्नुहोस्। यो भिडियो आफ्नो त्यो दाइलाई पठाउनुहोस्।
```
If the take differs from the plain text, time to what was actually said and tell the user.

## Visual journey
| Line | Shot size | Visual | Motion |
|---|---|---|---|
| 1 | MCU → MS | The two friends on the chowk, teasing point frozen mid-gesture; the sun flares on "अचम्मको" | push-in, sun flare pulse |
| 2 | Wide | Time-rewind whoosh: the chowk dissolves into an African savanna under a blazing sun; a group of early humans, all dark-skinned, walking. A world map pin drops on Africa | crane up from the group to the sun; pin drop with `back` overshoot |
| 2 end | Insert | Sun rays bounce off a dark-skinned arm like a shield (soft glow), a small "SPF" style shield icon (no brand) | slow drift |
| 3 | Wide → MS | Footprints trail north on the map into grey clouds; a traveller under a weak sun; a colour bar beside him slides from dark toward light as a "D" icon fills up | camera follows the trail; colour bar animates over ~2 s |
| 4 | MCU reveal | A foggy British forest 10,000 years ago; the ancient Briton turns to camera: dark skin, blue eyes (eyes catch a glint on "नीलो") | rack focus from fog to his eyes, push-in |
| 5 | Wide | A timeline ruler from 300,000 years to today; a thin pale segment lights up only at the very end (~3,000 years) | slow lateral glide along the ruler to the bright tip |
| 6 | MS | Back to the chowk: a family tree grows behind the two friends; its roots meet in one trunk labelled `अफ्रिका` | tree grows upward, camera cranes up |
| 7 | MCU | The teaser lowers his pointing finger, grins sheepishly and puts an arm around his friend; the friend laughs. End on both looking at camera | arm-around action with anticipation → overshoot → settle; hold 0.8 s |

## Editing specifics
- Pace: a new visual or camera change every 1.5-3 s; nothing static for more than 3 s.
- Text: style A from `guides/caption-style.md` (accent word for each overlay listed under Hook layers); inside the safe area.
- Subtitles: key-phrase overlays only (default).
- Ending: outro (no loop); hold the final arm-around frame ~0.8 s after the voice.
- Cover frame: the ancient Briton's blue-eye reveal (line 4), cover text `१०,००० वर्षअघि: कालो छाला, नीलो आँखा`.

## Sound
Warm, curious and a little epic: a modern pulse with soft hand drums on the chowk, wide cinematic strings and distant wind on the savanna, a cold breeze and light rain in the north, a misty forest drone for the Briton reveal, a playful pluck for the ending. SFX: a rewind whoosh (line 2), soft footsteps (line 3), a light chime on the blue eyes (line 4), a tick-sweep along the ruler (line 5), a gentle laugh bed and a soft pat on the arm-around (line 7). All SFX soft (-12 dB, peaks ≤ 0.4x voice).

## Reach pack (for the user to post)
- Caption: "Every human alive today traces back to Africa, and pale skin is way newer than you think. Tag the दाइ you used to call काले."
- Hashtags (5): #HumanHistory #ScienceFacts #NepaliReels #SkinColour #TheCuriousManche
- Pinned comment: "Have you ever been called 'काले'? 👇 (The 3,000-year figure is from one 2025 ancient-DNA study; sources in the description.)"
- Poll / Story sticker: "Did you know pale skin is this recent?" → "Yes" / "No way"
- Platform notes: Instagram/TikTok: playful cover, post in the evening. YouTube Shorts: title "We Were All Dark Once? | The Science of Skin Colour".

## QA before posting
- [ ] Facts match sources  - [ ] Text inside the safe area  - [ ] Ending lands on "पठाउनुहोस्"
- [ ] No caricature or stereotyped features; dark-skinned friend is never the butt of the joke
- [ ] `एक अध्ययन` shown with the 3,000-year number

## Sources (checked 24 Nov 2026)
- Cheddar Man, Britain, ~10,000 years ago, dark skin and blue eyes (2018 genome study): https://www.aljazeera.com/amp/news/2018/2/7/scientists-say-earliest-britons-had-dark-skin and https://www.smithsonianmag.com/smart-news/ancient-briton-had-dark-skin-and-light-eyes-dna-analysis-shows-180968097/
- 348 ancient genomes (45,000-1,700 years ago): most Europeans dark-skinned; light skin dominant only ~3,000 years ago; vitamin D explanation: https://www.zmescience.com/science/news-science/ancient-dna-reveals-most-europeans-had-dark-skin-until-just-3000-years-ago
- Same study not yet peer-reviewed (University of Ferrara, Barbujani): https://www.iflscience.com/europeans-were-mostly-dark-skinned-until-roman-times-ancient-dna-suggests-78333
- Humans left Africa ~60,000-70,000 years ago; Homo sapiens originated in Africa (~300,000 years ago, standard estimate)
