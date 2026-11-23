# बालेन दिल्ली गए, नेपालले के पायो? (What did Nepal get from the PM's India visit?): news explainer

Status: script final; **voiceover recorded by the user, saved as "balen"** (look for `inbox/balen.*`; rename it to `inbox/balen-india-visit.mp3` first). Slug: `balen-india-visit`. Check the take against the narration below with faster-whisper before building. Length: about 100 words ≈ 50 s (measure the real file; it rules).
Platform: **Facebook first** (informative format). For Instagram / TikTok / YouTube, only a neutral "scorecard" cut; never a sarcastic version (sitting PM = politics).
Emotion: curiosity → what Nepal got → the catch (loan) → the big win (air route) → what it didn't get (border) → open question. Twist: "तर त्यसको चार भागमध्ये झन्डै तीन भाग ऊर्जाका लागि ऋण हो।"
Loop ending: no. End on the comment question (score out of 10).
Sensitive topic: **politics + news about real, living people.** Follow `guides/sensitive-topics.md` sections 3 and 6 and run its checklist. Facts dated 23 Nov 2026 (मंसिर ७, २०८३). **Same-day news reel: render and post within 1-2 days.** Re-check on render day whether the trip's cost has been published; if it has, tell the user (line 8 must change).

## Rules for this reel
- **No opinion from the channel.** Every "got" is followed by its limit (aid → mostly loan; air route → technical talks pending; border → no agreement). The ending asks the viewer to score it; we never score it.
- **No real faces, names or caricatures on screen** (guide section 3): the two prime ministers are **faceless silhouettes** in suits, with no name tags. The narration names them; the screen doesn't.
- **No party symbols, no flags waved, no tagging politicians** (guide section 6). Small static flag pins on the table are fine; nothing celebratory.
- **No mocking delivery or visuals.** The cost line is neutral: a blank receipt with "?", not a joke.
- The air route needs technical consultations before it works: the screen **must** show `प्राविधिक छलफल बाँकी` under the route.
- "करिब चौबीस हजार करोड" = INR 15,000 crore ≈ NPR 24,000 crore. Loan share: 11,500 / 15,000 = 76.7% → "चार भागमध्ये झन्डै तीन भाग".
- "सत्र वर्षदेखि" = Nepal has asked for extra air entry routes since 2009.

## Hook options considered
1. **बालेन दिल्ली गए, तर नेपालले के पायो, र के पाएन?** (curiosity gap + balance; **chosen**: the question everyone is asking tonight, and it promises both sides)
2. आठ सम्झौता, चौबीस हजार करोड… तर सीमा? (numbers first; gives the twist away)
3. तीन वर्षपछि नेपाली प्रधानमन्त्री दिल्ली पुगे। (fact hook; weaker)
4. भैरहवा रुट सत्र वर्षपछि खुल्यो? (narrow)
5. यो भ्रमण सफल कि असफल? (invites a verdict; leans opinion)

## Hook layers (0:00)
- **First frame:** a plane mid-landing on a Delhi runway at golden hour, two faceless silhouettes already reaching for a handshake on the tarmac. Works on mute.
- **Spoken line:** line 1.
- **Overlay:** `के पायो? के पाएन?` (accent: पाएन?).
- **Beat overlays:** `सरकारी टोली: ३४ | व्यवसायी: ५२ (आफ्नै खर्च)` (line 2), `८ समझदारीपत्र` (line 3; accent: ८), `≈ २४,००० करोड` → `झन्डै ¾ ऋण` (line 4; accent: ऋण), `भैरहवा रुट: दुईतर्फी` + small `प्राविधिक छलफल बाँकी` (line 5; accent: दुईतर्फी), `सीमा: ठोस सहमति छैन` (line 7; accent: छैन), `कुल खर्च: ?` (line 8), `तपाईंको नम्बर: _/१०` (line 9; accent: _/१०).
- All text in style A via `tools/textlayer.js`. Never over the silhouettes, the map or the coin piles. Same slot for every beat overlay.

## Narration (plain text, the timing source)
```
बालेन दिल्ली गए, तर नेपालले के पायो, र के पाएन?
मंसिर ६ र ७ को दुई दिने भ्रमणमा, चौंतीस जनाको सरकारी टोली गयो, बाउन्न व्यवसायी भने आफ्नै खर्चमा गए।
मोदीसँगको भेटपछि आठवटा समझदारीपत्रमा हस्ताक्षर भयो, शिक्षा र सुरक्षादेखि स्याटेलाइटसम्म।
भारतले करिब चौबीस हजार करोड नेपाली रुपैयाँको सहयोग घोषणा गर्‍यो, तर त्यसको चार भागमध्ये झन्डै तीन भाग ऊर्जाका लागि ऋण हो।
सबैभन्दा ठूलो खबर, नेपालले सत्र वर्षदेखि मागेको भैरहवा हवाई रुट दुईतर्फी बनाउने सहमति भयो।
अयोध्या–जनकपुर रेल र दार्चुला पुल पनि सुरु भयो।
तर कालापानी, लिपुलेक र लिम्पियाधुरामा कुनै ठोस सहमति भएन, जिम्मा परराष्ट्र सचिवलाई दिइयो।
अनि भ्रमणको कुल खर्च? अहिलेसम्म सार्वजनिक भएको देखिँदैन।
त्यसैले, यो भ्रमणलाई दसमा कति नम्बर दिनुहुन्छ? कमेन्टमा लेख्नुहोस्।
```

ElevenLabs v3 version that was recorded (Ashok Pokhrel, Natural stability, speed 1.0):
```
[dramatically] बालेन दिल्ली गए, तर नेपालले के पायो, [short pause] र के पाएन?
[matter-of-fact] मंसिर ६ र ७ को दुई दिने भ्रमणमा, चौंतीस जनाको सरकारी टोली गयो, बाउन्न व्यवसायी भने आफ्नै खर्चमा गए।
[confident] मोदीसँगको भेटपछि आठवटा समझदारीपत्रमा हस्ताक्षर भयो, शिक्षा र सुरक्षादेखि स्याटेलाइटसम्म।
[impressed] भारतले करिब चौबीस हजार करोड नेपाली रुपैयाँको सहयोग घोषणा गर्‍यो, [short pause] [serious] तर त्यसको चार भागमध्ये झन्डै तीन भाग ऊर्जाका लागि ऋण हो।
[excited] सबैभन्दा ठूलो खबर, नेपालले सत्र वर्षदेखि मागेको भैरहवा हवाई रुट दुईतर्फी बनाउने सहमति भयो।
[upbeat] अयोध्या–जनकपुर रेल र दार्चुला पुल पनि सुरु भयो।
[short pause] [serious] तर कालापानी, लिपुलेक र लिम्पियाधुरामा कुनै ठोस सहमति भएन, जिम्मा परराष्ट्र सचिवलाई दिइयो।
[curious] अनि भ्रमणको कुल खर्च? [short pause] अहिलेसम्म सार्वजनिक भएको देखिँदैन।
[engaging] त्यसैले, यो भ्रमणलाई दसमा कति नम्बर दिनुहुन्छ? कमेन्टमा लेख्नुहोस्।
```
If the take differs from this text (the user may have edited it), time to the take and tell the user which words changed.

## Visual journey
| Line | Shot size | Visual | Motion |
|---|---|---|---|
| 1 | Wide → MCU | Plane touches down at golden hour; two faceless silhouettes meet on the tarmac and shake hands; a big "?" forms above them | Slow push-in; cut on "पाएन?" |
| 2 | Wide | A plane door: a line of 34 small bean-head officials boards; beside it, a group of business people pays at a ticket counter with their own wallets | Slow drift; counter "३४" ticks up |
| 3 | Insert | Eight folders slide onto a table one by one, each with an icon (book, shield, leaf for Ayurveda, satellite, city…) | Each folder lands on a beat; small bounce |
| 4 | Designed card | A coin pile labelled "≈ २४,००० करोड"; on "तर" it splits into a small "अनुदान" pile (¼) and a big "ऋण" pile (¾) with a lightning-bolt "ऊर्जा" tag | Split on "तर" with a soft thud |
| 5 | Map card | Simple map: Lucknow → Bhairahawa → Kathmandu; the one-way arrow gains a second arrowhead; a small calendar flips from "२००९"; `प्राविधिक छलफल बाँकी` under the route | Arrow draws, then flips to two-way on "दुईतर्फी" |
| 6 | Wide | A train runs from an "अयोध्या" platform to "जनकपुर"; cut to a river bridge with a ribbon being cut | Train glide; cut on "पुल" |
| 7 | Map card → MCU | The far-west corner of the map with "कालापानी, लिपुलेक, लिम्पियाधुरा" and a "?"; a file is handed to two faceless officials labelled only "परराष्ट्र सचिव" | Slow push; cut on "दिइयो" |
| 8 | Insert | A long blank receipt prints out; the total line reads "खर्च: ?" | Receipt scrolls; hold |
| 9 | MCU | A 0-10 score card with an empty slot; a comment bubble pops | Slow pull-back; hold for the prompt |

## Editing specifics
- Pace: a new visual or camera change every 1.5-3 s; nothing static for more than 3 s. Cuts on words, slow drifts in between.
- Text: style A (`guides/caption-style.md`), inside the safe area; zero flags in `work/text_report.json`.
- Subtitles: key-phrase overlays only.
- Ending: hold on the score card, then the outro card; no loop.
- Cover frame: the handshake silhouettes with the cover text `नेपालले के पायो?` (style A, accent: पायो?).

## Sound
Modern diplomatic news pulse: low strings and a soft timpani roll, tense but neutral (not triumphant, not mocking). A plane whoosh at frame 0, a soft "ching" for each folder, a coin-split thud on "तर", a light train rumble and rail clack in shot 6, a low sting before "तर कालापानी", a printer whir for the receipt, a comment "pop" at the end.
SFX soft (-12 dB, peaks ≤ 0.4x voice); check every cue with `sfx_check.py`.

## Reach pack (for the user to post)
- **Caption (Facebook):**
  ```
  बालेन दिल्ली गए, नेपालले के पायो, र के पाएन? 🤔

  PM Balendra Shah's two-day India visit (22-23 Nov) ended with 8 MoUs, about NPR 24,000 crore in announced assistance (around three-quarters of it a line of credit for energy), and an agreement to make the Bhairahawa air route two-way (technical talks still pending). There was no specific agreement on Kalapani, Lipulekh or Limpiyadhura; the foreign secretaries were asked to work on outstanding boundary issues. The trip's total cost hasn't been made public.

  How would you rate the visit out of 10? 👇
  ```
- **Instagram / TikTok (neutral scorecard cut only):** `Balen's India visit: what Nepal got ✅ and didn't ❌ #Nepal #NepalNews #NepalIndia #TheCuriousManche`
- **YouTube Shorts title:** `What Did Nepal Get From Balen's India Visit? #Shorts`
- **Pinned comment:** `Sources: joint statement and reports from Ratopati, Onlinekhabar, Khabarhub, Annapurna Post (23 Nov 2026). Rate it out of 10 👇`
- **Hashtags (5):** #Nepal #NepalNews #NepalIndia #Diplomacy #TheCuriousManche (no party or politician hashtags; don't tag politicians)
- **Platform notes:** post on Facebook the same day. Keep replies factual and neutral; don't argue politics in the comments. If the trip cost is published after posting, add a dated note to the pinned comment.

## QA before posting
- [ ] Every number matches the sources and the date  - [ ] Trip cost re-checked on render day
- [ ] Faceless silhouettes only; no real faces, names, party symbols or caricatures on screen
- [ ] `प्राविधिक छलफल बाँकी` shown with the air route  - [ ] Loan share shown with the aid figure
- [ ] No opinion from the channel; delivery and visuals neutral
- [ ] `guides/sensitive-topics.md` checklist passed  - [ ] Text inside the safe area, nothing blocked
- [ ] For TikTok: run TikTok Studio's content check before posting

## Sources (checked 23 Nov 2026)
- Visit ended, two-day state visit, met Modi and President Murmu, 8 MoUs: https://english.ratopati.com/story/87957/prime-minister-shah-departs-for-home ; https://english.khabarhub.com/2026/23/576772/ (MoU areas: education and research, security, civil service capacity building, Ayurveda and traditional medicine, satellite communications, sustainable urban development…)
- First Nepali PM visit to India in three years (last: Dahal, May 2023): https://www.onlinekhabar.com/?p=2052157
- Delegation 34 (35 incl. PM per the PM's secretariat), 52 business people at their own expense, regular Nepal Airlines flight: https://www.annapurnapost.com/story/511771/ ; https://www.samayapost.com/11/483326.html ; https://www.ratopati.com/story/606873/these-are-the-35-member-government-team-for-the-prime-ministers-visit-to-india
- Assistance INR 15,000 crore = NPR 24,000 crore: INR 3,500 crore grants (post-disaster reconstruction, infrastructure) + INR 11,500 crore rupee line of credit for energy: https://thefederal.com/category/news/balen-shah-india-visit-modi-assuages-fears-says-shared-culture-equality-at-core-of-ties-263887 ; https://sundayguardianlive.com/news/balen-shahs-first-india-visit-marks-diplomatic-recalibration-eight-mous-signed-india-announces-rs-15000-crore-assistance-326572/
- Air route B345 Kathmandu-Bhairahawa-Lucknow to become two-way, technical consultations pending: https://english.khabarhub.com/2026/23/576762/ ; https://theannapurnaexpress.com/story/69013/ ; https://english.pardafas.com/nepal-india-agree-on-major-push-in-energy-connectivity-and-infrastructure-cooperation/
- Nepal has asked since 2009: https://www.thestatesman.com/india/can-balen-shah-break-the-air-route-deadlock-with-india-where-prachanda-oli-and-deuba-all-came-home-empty-handed-1503665835.html
- Dharchula-Darchula bridge inaugurated, Deendayal (Kandla) port transit route: https://english.ratopati.com/story/87929/nepal-india-joint-statement-bhairahawa-lucknow-air-route-to-be-two-way-joint-vision-of-developed-india-and-prosperous-nepal-made-public ; https://myrepublica.nagariknetwork.com/news/nepal-india-agree-to-make-kathmandu-bhairahawa-lucknow-air-route-bidirectio-35-49.html
- Ayodhya-Janakpur Saryu-Kamala Express launched: https://www.outlookindia.com/national/breaking-news-india-world-live-updates-nepal-pm-balendra-shah-visit-pm-modi-delhi-pollution-23-november-2026 ; https://english.dainikjagranmpcg.com/top-stories/balen-shahs-india-visit-ends-with-8-agreements-and-new/article-46142
- Border: no specific agreement on Kalapani, Lipulekh, Limpiyadhura or Susta; foreign secretaries directed to resolve outstanding issues: https://www.hamropatro.com/news/detail/1795435557358325969-balen-modi-vartama-uthenan-kalapani-lipulek-r-limpiyadhuraka-vishay ; https://english.pardafas.com/nepal-india-agree-on-major-push-in-energy-connectivity-and-infrastructure-cooperation/
- Trip cost: no published figure found on 23 Nov 2026. Re-check before rendering.
