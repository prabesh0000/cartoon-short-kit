# भारतसँग २६, पाकिस्तानसँग ७२: नेपाली क्रिकेटलाई भएको के हो? (Nepali reel): sports news explainer

Status: script final; **voiceover recorded by the user, saved as "cricekt"** (look for `inbox/cricekt*`; rename it to `inbox/nepal-cricket-np.mp3` first). Slug: `nepal-cricket-np`. Voice: ElevenLabs v3, Ashok Pokhrel (tagged version below). Check the take against the narration with faster-whisper before building. Length: about 105 words ≈ 50-55 s (measure the real file; it rules).
Platform: **Facebook, Instagram, TikTok (Nepali).** On-screen text in **Nepali**. The English YouTube version is `scripts/nepal-cricket.md`; reuse its world, cast and shots, change only text, timing and sound cues.
Emotion: shock (the two scores) → hope (beat the UAE, bowlers held Pakistan A to 168) → collapse (six ducks, knocked out) → reveal (not the full team, said by the captain) → open question. Twist: "यो नेपालको पूरा टिम नै थिएन।"
Loop ending: no. End on "कमेन्टमा लेख्नुहोस्।"

## Rules for this reel
- **No real faces or caricatures.** Players are generic bean-heads in Nepal blue (red trim); India A in light blue, Pakistan A in green. No names or numbers on shirts, no team, sponsor, ACC/ICC or NPL logos. Real names are only spoken.
- **No mocking.** Frustration, not insults. The bowlers get a real celebration on the 168 line. The captain line is his own statement: show a generic captain silhouette at a press table with a mic, no likeness.
- No flags waved; national colours on kits only.
- **Scores on screen must match exactly:** India A 332/9; Nepal 26 all out (11.3 ov); Pakistan A 168 all out (42 ov); Nepal 72 all out (17.3 ov). Nepal beat the UAE by six wickets between them.
- No time words on screen ("अस्ति", "आज"); the script avoids them on purpose so the reel stays correct after posting.

## Hook options considered
1. **"भारतसँग छब्बीस रन, अनि पाकिस्तानसँग बहत्तर रन। आखिर नेपाली क्रिकेटलाई भएको के हो?"** (chosen; the user asked for "अनि" in place of "आज")
2. "नेपाल छब्बीस रनमै अलआउट।" (one score only)
3. "तीन सय छ रनले हार।" (margin less visual)
4. "यो त नेपालको पूरा टिम नै थिएन।" (gives the twist away)
5. "छ जना ब्याटर, छ वटा शून्य।" (too narrow)

## Hook layers (0:00)
- **First frame:** the big scoreboard mid-flip, `भारत 'ए' ३३२` above `नेपाल २६`, the Nepali fan in a dhaka topi below it, hands on his head. Works on mute.
- **Spoken line:** line 1.
- **Overlay:** `भारतसँग २६ · पाकिस्तानसँग ७२` (accent: ७२).
- **Beat overlays:** `भारत 'ए' ३३२ · नेपाल २६` (line 2; accent: २६), `युएईलाई हरायो` (line 3a; accent: हरायो), `पाकिस्तान 'ए' १६८` (line 3b; accent: १६८), `६ शून्य · बाहिर` (line 4; accent: बाहिर), `पूरा टिम थिएन` (line 5; accent: पूरा), `एनपीएलसँग जुधाइ` (line 6; accent: एनपीएल), `दोष कसको?` (line 8; accent: कसको?).
- All text in style A via `tools/textlayer.js` (Devanagari, Kohinoor Devanagari). Never over faces, the scoreboard digits or the stumps.

## Narration (plain text, the timing source)
```
भारतसँग छब्बीस रन, अनि पाकिस्तानसँग बहत्तर रन। आखिर नेपाली क्रिकेटलाई भएको के हो?
कतारको राइजिङ स्टार्स एसिया कपमा भारत 'ए' ले तीन सय बत्तीस रन ठोक्यो, जवाफमा नेपाल बाह्र ओभर पनि नपुग्दै छब्बीसमै सकियो।
त्यसपछि युएईलाई हराएर नेपालले आशा जगायो। पाकिस्तान 'ए' विरुद्ध त हाम्रा बलरले उनीहरूलाई एक सय अठसट्ठीमै समेटे।
तर ब्याटिङ फेरि ढल्यो। छ जना ब्याटर शून्यमै आउट, नेपाल बहत्तरमै अलआउट, र प्रतियोगिताबाटै बाहिर।
तर कुरो यहीँ छ। यो नेपालको पूरा टिम नै थिएन।
एनपीएलका कारण रोहित पौडेल, दीपेन्द्र सिंह ऐरी र करण केसी टिममै परेनन्। कप्तान सन्दीप लामिछानेले नै भने, केही खेलाडी त खेलकै दिन बिहान कतार पुगे।
अर्थात्, ठूला नाम नहुँदा पछाडिका ब्याटरले टिम धान्नै सकेनन्।
अब तपाईं भन्नुहोस्, दोष एनपीएलको तालिकाको कि कमजोर ब्याकअप ब्याटिङको? कमेन्टमा लेख्नुहोस्।
```

ElevenLabs v3 version the user recorded (Ashok Pokhrel):
```
[dramatic] भारतसँग छब्बीस रन, [short pause] अनि पाकिस्तानसँग बहत्तर रन। [pause] [curious] आखिर नेपाली क्रिकेटलाई भएको के हो?
[serious] कतारको राइजिङ स्टार्स एसिया कपमा भारत 'ए' ले तीन सय बत्तीस रन ठोक्यो, [sighs] जवाफमा नेपाल बाह्र ओभर पनि नपुग्दै छब्बीसमै सकियो।
[hopeful] त्यसपछि युएईलाई हराएर नेपालले आशा जगायो। [excited] पाकिस्तान 'ए' विरुद्ध त हाम्रा बलरले उनीहरूलाई एक सय अठसट्ठीमै समेटे।
[serious] तर ब्याटिङ फेरि ढल्यो। [short pause] छ जना ब्याटर शून्यमै आउट, नेपाल बहत्तरमै अलआउट, [shocked] र प्रतियोगिताबाटै बाहिर।
[dramatic] तर कुरो यहीँ छ। [pause] यो नेपालको पूरा टिम नै थिएन।
[serious] एनपीएलका कारण रोहित पौडेल, दीपेन्द्र सिंह ऐरी र करण केसी टिममै परेनन्। [short pause] कप्तान सन्दीप लामिछानेले नै भने, केही खेलाडी त खेलकै दिन बिहान कतार पुगे।
[thoughtful] अर्थात्, ठूला नाम नहुँदा पछाडिका ब्याटरले टिम धान्नै सकेनन्।
[curious] अब तपाईं भन्नुहोस्, दोष एनपीएलको तालिकाको कि कमजोर ब्याकअप ब्याटिङको? [short pause] कमेन्टमा लेख्नुहोस्।
```
**The user may have recorded an earlier wording** (e.g. "अस्ति…आज…", "बीचमा युएईलाई त हरायो", "मुख्य खेलाडी नहुँदा बाँकी ब्याटरले ब्याटिङ सम्हाल्नै सकेनन्"). Transcribe the take first; if it differs, time to what was actually said, keep the shots, adjust overlays to match, and tell the user.

## Visual journey
| Line | Shot size | Visual | Motion |
|---|---|---|---|
| 1 | MCU → wide | Scoreboard flips ३३२/२६, then १६८/७२; the fan below, hands on head | push-in on the digits, pull back to the fan and stands |
| 2 | Wide | Doha stadium at dusk; Nepal batters walking back one after another; an over counter stops at 11.3 | slow crane down the pavilion steps |
| 3 | MS | Hope beat: Nepal players hugging after the UAE win (sunny light), then bowlers in blue celebrating a wicket, scoreboard `पाकिस्तान 'ए' १६८ अलआउट` | snappy cut, celebration jump with overshoot |
| 4 | Insert → MS | Six stumps cartwheel one after another on the three punches, then a `बाहिर` stamp | cut on each phrase, stamp thunk + small shake |
| 5 | MCU | Whip to the dressing room: three empty seats with folded blue shirts (no names) | whip-pan, slow push |
| 6 | Wide → MS | An NPL-style night match back home (generic, no logos); cut to a captain silhouette at a press table with a mic; then players with kit bags hurrying off a plane at dawn | cross-cut with a 6-frame flash; dawn sky |
| 7 | MS | Batting line-up cards: top three are empty outlines, the ones below wobble and topple like dominoes | dominoes with stagger |
| 8 | MCU | The fan turns to camera between two signs `एनपीएल तालिका` and `ब्याकअप ब्याटिङ`, shrugs | slow creep; end on "लेख्नुहोस्" |

## Editing specifics
- Pace: fast; a new visual or camera change every 1-2.5 s.
- Text: style A (`guides/caption-style.md`), Nepali overlays as listed; inside the safe area; zero flags in `work/text_report.json`.
- Subtitles: key-phrase overlays only.
- Ending: outro; hold the last frame ~0.6 s after the voice.
- Cover frame: frame 0, cover text `भारतसँग २६, पाकिस्तानसँग ७२` (accent: ७२).

## Sound
Modern sports-news pulse with tense low strings and a madal-like accent; stadium crowd ambience (cheer on the UAE win and the 168 wicket, a groan on the collapse), a soft stump "clack" on each of the three punches, a stamp thunk on "बाहिर", a hush and low drone on "यो नेपालको पूरा टिम नै थिएन", a jet whoosh on the airport line, a tick-tock under the final question. All SFX soft (-12 dB, peaks ≤ 0.4x voice).

## Reach pack (for the user to post)
- Facebook caption: "Nepal were bowled out for 26 by India A and 72 by Pakistan A at the Asia Cup Rising Stars in Doha, and went out of the tournament. But several first-choice players weren't there: the event clashed with the NPL, and captain Sandeep Lamichhane said some players arrived on the morning of the match. Is the NPL schedule to blame, or our backup batting? 👇 #NepalCricket #AsiaCupRisingStars #Cricket #NepaliReels #TheCuriousManche"
- Instagram/TikTok caption: "26 vs India. 72 vs Pakistan. 💔 But was it even our full team? Schedule or backup batting? 👇 #NepalCricket #Cricket #NepaliReels #Reels #TheCuriousManche"
- Pinned comment: "Not the full squad: Rohit Paudel, Dipendra Singh Airee and Karan KC weren't picked because of the NPL. Sources: ESPNcricinfo, Himal Press, Nepal Press, Yahoo Sports (Nov 20-24, 2026)."
- Poll / Story sticker: "दोष कसको?" → "एनपीएल तालिका" / "ब्याकअप ब्याटिङ"
- Platform notes: don't tag players or the cricket board.

## QA before posting
- [ ] Scores match the sources exactly  - [ ] Text inside the safe area  - [ ] Ending lands on "लेख्नुहोस्"
- [ ] No recognisable real players, no logos, nobody mocked
- [ ] Overlays match the words actually recorded

## Sources (checked 24 Nov 2026)
- India A 332/9, Nepal 26 all out (11.3 ov), India A won by 306 runs; Nepal missing key players due to the NPL: https://www.cricinfo.com/series/asia-cup-rising-stars-50-overs-2026-27-1562333/india-a-vs-nepal-4th-match-group-b-1562345/live-cricket-score
- Captain: "We didn't have our full-strength team here. A few of the players arrived this morning. NPL is going on back home.": https://sports.yahoo.com/articles/didnt-full-strength-team-nepal-222000997.html
- Pakistan A 168 in 42 overs (Rashid Khan five wickets), Nepal 72 in 17.3 overs, lost by 96, eliminated: https://en.himalpress.com/nepal-crash-out-of-asia-cup-rising-stars-after-heavy-defeat-to-pakistan-a/
- Six Nepali batters out for zero: https://www.ratopati.com/story/607398/nepal-all-out-for-72-against-pakistan-a-6-batters-fail-to-open-account
- Rohit Paudel, Dipendra Singh Airee, Karan KC (NPL captains) not in the squad: https://dev.nepalpress.com/2026/11/20/782803/nepal-faces-a-powerful-indian-team-but-key-players-are-missing/
- Nepal beat the UAE by six wickets: https://cwibc.co.id/en/pakistan-nepal-rising-stars-clash
