# के सुन फेरि दुई लाखभन्दा तल झर्ला? (Will gold drop below 2 lakh again?): trending news explainer

Status: script ready; voiceover coming as `inbox/gold-2-lakh.*`. Slug: `gold-2-lakh`. Length: about 77 words, roughly 38-41 s (measure the real file; it rules). For about 32 s, cut line 5.
Emotion: hope (cheaper gold?) → the maths → the reason it could fall → the other side (banks expect a rebound) → surprise (the experts were badly wrong) → "nobody knows" → a comment question. Twist: one big bank forecast $6,000 for this year-end, and gold is at about $3,500.
Loop ending: no. End on the comment question.
Sensitive topic: **money / news.** No buy or sell advice, no prediction from us. Facts dated 22 Nov 2026 (मंसिर ६, २०८३). **Same-day news reel: render and post within 1-2 days.** Re-check the Nepal price on render day; if it has moved a lot, tell the user before rendering (lines 2-3 and the overlays may need an update).
Follow-up to `scripts/gold.md` ("आखिर सुन किन घट्यो?", 20 Nov). Reuse its cast from `reels/gold/web/gold.js` (price board, chalk chart, globe, gold-bar character with tag and shrug, generic bank).

## Rules for this reel
- **Not financial advice, and no forecast from the channel.** The reel explains what would have to happen; it never says it will or won't. The caption says "Not financial advice".
- **No real bank names or logos on screen.** The narration says "एउटा ठूलो बैंक"; the sources name it. Banks are generic buildings with columns.
- **The 18% / $2,900 figure is an estimate**, assuming the dollar rate and customs duty stay the same. The narration no longer says that condition, so the screen **must** show it: `अनुमान: डलर र भन्सार उस्तै`.
- **Balance:** the reason to fall (line 4) is always followed by the banks' rebound view (line 5). Keep both, or cut both; never one without the other.
- **The December rate hike is an expectation, not a decision.** Narration says "बढाउने अनुमान छ"; the screen shows a dashed "अनुमान" line, never a done deal.
- Lessons from the gold reel apply: **no seesaw or balance for "up/down"** (it reads as weight); give every beat caption the same slot; check every up/down arrow against the script in the stills.

## Hook options considered
1. **के सुन फेरि दुई लाखभन्दा तल झर्ला?** (curiosity gap + relatability; the exact question people are asking). **Chosen:** LESSONS says the user prefers the plain question everyone is already asking for trending news.
2. सुन सस्तो हुँदै छ... तर कति सस्तो? (curiosity gap; vaguer)
3. दुई लाखमा सुन किन्ने सपना पूरा होला? (emotional mirror; edges toward buying advice)
4. ठूला बैंकले भनेको भन्दा सुन ठ्याक्कै उल्टो गयो। (pattern + surprise; gives the twist away)
5. सुन दुई लाख पुग्न कति घट्नुपर्छ? (curiosity gap + number; less emotional)

## Hook layers (0:00)
- **First frame:** the jewellery shop's split-flap price board **mid-flip** on `२,४२,६००`, with a chalk line drawn under it at `२,००,०००` and a small bean-head customer on tiptoe staring at the gap. Works on mute.
- **Spoken line:** line 1.
- **Overlay:** `आज २,४२,६०० → २,००,०००?` (accent: `२,००,०००?`). The voice asks will it; the screen shows how far.
- **Beat overlays:** `−१८%` with a small `अनुमान: डलर र भन्सार उस्तै` under it (line 3; accent: −१८%), `डिसेम्बर: ब्याजदर ↑ ?` (line 4; accent: ब्याजदर), `२०२७: फेरि ↑ ?` (line 5), `भविष्यवाणी: $6,000` → `अहिले: $3,538` (line 6; accent: $3,538), `कमेन्ट: तल कि माथि?` (line 8).
- All text in style A via `tools/textlayer.js`. Never over faces, the price board digits or the chart.

## Narration (plain text, the timing source)
```
के सुन फेरि दुई लाखभन्दा तल झर्ला?
आज तोलाको दुई लाख बयालीस हजार छ सय।
दुई लाख पुग्न, विश्व बजारमा अझै झन्डै अठार प्रतिशत घट्नुपर्छ।
घट्ने कारण पनि छ: डिसेम्बरमा अमेरिकाले ब्याजदर बढाउने अनुमान छ, र ब्याज बढ्दा, ब्याज नदिने सुन बेचिन्छ।
तर ठूला बैंकहरू अर्को वर्ष फेरि बढ्ने अनुमान गर्छन्।
अचम्मको कुरा, एउटा ठूलो बैंकले यो वर्ष छ हजार डलर पुग्छ भनेको थियो। अहिले? साढे पैंतीस सय।
अर्थात्, सुनको भविष्य कसैलाई थाहा छैन।
तपाईंको अनुमान? दुई लाखभन्दा तल, कि माथि?
```

ElevenLabs v3 version (Ashok Pokhrel, Natural stability, speed 1.0):
```
[dramatically] के सुन फेरि दुई लाखभन्दा तल झर्ला?
[matter-of-fact] आज तोलाको दुई लाख बयालीस हजार छ सय।
दुई लाख पुग्न, विश्व बजारमा अझै झन्डै अठार प्रतिशत घट्नुपर्छ।
[serious] घट्ने कारण पनि छ: डिसेम्बरमा अमेरिकाले ब्याजदर बढाउने अनुमान छ, र ब्याज बढ्दा, ब्याज नदिने सुन बेचिन्छ।
[curious] तर ठूला बैंकहरू अर्को वर्ष फेरि बढ्ने अनुमान गर्छन्।
[short pause] [mysteriously] अचम्मको कुरा, एउटा ठूलो बैंकले यो वर्ष छ हजार डलर पुग्छ भनेको थियो। [dramatically] अहिले? साढे पैंतीस सय।
[softly] अर्थात्, सुनको भविष्य कसैलाई थाहा छैन।
[mischievously] तपाईंको अनुमान? दुई लाखभन्दा तल, कि माथि?
```
Expect a pause before "अचम्मको कुरा" (the turn), a hard beat on "अहिले?", and a rising, playful last question.

## Visual journey
| Line | Shot size | Visual | Motion |
|---|---|---|---|
| 1 | MCU | Price board mid-flip at `२,४२,६००`; a chalk line at `२,००,०००` below it; a customer on tiptoe looks at the gap | Slow push-in; flip clack on frame 0 |
| 2 | Insert | The board settles on `२,४२,६००`; a small "मंसिर ६" date tag swings on a hook | Settle with a tiny bounce |
| 3 | Designed card | A thermometer-style bar: gold level at `२,४२,६००`, a dashed target at `२,००,०००`; on "अठार प्रतिशत" the gap fills red with `−१८%`; the small `अनुमान: डलर र भन्सार उस्तै` label sits under it | Bar drains a little, then stops at the dashed line |
| 4 | Designed card → MCU | **No seesaw** (it reads as weight; see LESSONS 2026-11-20). A rising "ब्याजदर %" gauge with a dashed "अनुमान" line pointing to "डिसेम्बर"; on "ब्याज नदिने सुन" cut to bean-head investors in suits walking away from a shrinking gold pile toward a generic "ब्याज" bank with money bags, a red ↓ dropping onto the pile (reuse the gold v2 shot) | Gauge needle climbs along the dashed line; cut on "सुन"; slow drift with the walkers |
| 5 | Wide | Generic bank buildings (columns, no logos); analysts on the steps raise green "२०२७ ↑" signs | Slow drift; signs pop up on "बढ्ने" |
| 6 | Designed card → CU | Chalk chart: a dashed forecast line climbing to a `$6,000` flag, the real line diving to `$3,538`; on "अहिले?" cut to the gold-bar character shrugging at the bottom of the chart | The forecast line draws up, the real line draws down; snap-cut + low hit on "अहिले?" |
| 7 | MCU | The customer from shot 1 and a shopkeeper both shrug; a big "?" rises between them over the board | Slow pull-back |
| 8 | MCU | The board flips to a two-option card `तल ↓ / माथि ↑` with a comment bubble | Flip clack; hold for the comment prompt |

## Editing specifics
- Pace: a new visual or camera change every 1.5-3 s; nothing static for more than 3 s. Cuts on words, slow drifts in between.
- Text: style A (`guides/caption-style.md`), inside the safe area; zero flags in `work/text_report.json`.
- Subtitles: key-phrase overlays only.
- Ending: hold on the `तल ↓ / माथि ↑` card, then the outro card; no loop.
- Cover frame: the price board with the cover text `सुन २ लाखभन्दा तल?` (style A, accent: २ लाख).

## Sound
Modern news pulse, tense and curious (not a happy loop), built **without octaves** (the gold reel's masking fix: pattern 0, 0, 7, 0, 5, 0, 3, 7; no pulse under the hook line; deeper music dip in the speech band). A soft low sting on "अहिले?", then a lighter, playful pulse for the last two lines.
SFX: board flip clacks (an octave down + 900 Hz low-pass), a soft drain for the bar, a gauge tick-tick as the needle climbs, footsteps and a soft coin-slide as the gold pile shrinks, sign pops, a chalk scratch as the lines draw, a low hit on "अहिले?", a shrug "boop", a comment "pop".
SFX soft (-12 dB, peaks ≤ 0.4x voice); check every cue with `sfx_check.py`.

## Reach pack (for the user to post)
- **Caption (Instagram):**
  ```
  Will gold drop below Rs 2 lakh again? 🤔

  Today (22 Nov) gold is Rs 2,42,600 per tola. To reach Rs 2 lakh, world gold would need to fall about 18% more, if the dollar rate and customs duty stay the same. One reason it could: markets expect the US to raise interest rates in December, and gold pays no interest. But big banks expect a rebound in 2027, and one of them forecast $6,000 for the end of this year. It's about $3,500 now.

  Nobody knows. What's your guess? 👇

  Not financial advice.

  #GoldPrice #Nepal #NepalNews #Economy #TheCuriousManche
  ```
- **TikTok caption:** `Will gold go below 2 lakh? 📉 Even the banks got it wrong. #GoldPrice #Nepal #NepalNews #Economy #TheCuriousManche`
- **YouTube Shorts title:** `Will Gold Fall Below Rs 2 Lakh in Nepal? #Shorts`
- **Pinned comment:** `Gold first crossed Rs 2 lakh per tola in Nepal on 29 Aug 2025. Below or above by next Dashain? Comment ⬇️ or ⬆️`
- **Poll** (Story / Shorts sticker): `Gold by next Dashain?` → `Below 2 lakh ⬇️` / `Above ⬆️`
- **Platform notes:** post the same day on Facebook. Keep replies factual; never tell anyone to buy or sell. If the price moves a lot after posting, add a dated note in the pinned comment.

## QA before posting
- [ ] Every number matches the sources and the date  - [ ] Nepal price re-checked on render day
- [ ] "अनुमान" shown next to −18% / $2,900  - [ ] No buy/sell advice, no forecast from us
- [ ] No real bank names or logos on screen  - [ ] Text inside the safe area, nothing blocked

## Sources (checked 22 Nov 2026)
- Nepal today: gold fell Rs 2,800 to Rs 2,42,600 per tola on Sunday, मंसिर ६, २०८३, from Rs 2,45,400 on Friday (Federation of Nepal Gold and Silver Dealers' Associations): https://www.hamropatro.com/en/news/detail/1795337753969188224-nepali-bajarama-sunako-mulyama-thulo-giravat ; https://sangalokhabar.com/140270 ; https://beemadarpan.com/news/88778
- The maths: 2,42,600 − 2,00,000 = 42,600 = **17.6%** (≈ 18%). Nepal's price is set from the international (Kitco) price, converted at Nepal Rastra Bank's exchange rate, plus customs duty, freight, insurance and 0.5% margins each for dealers and banks, so a % fall in the world price gives roughly the same % fall here if the rate and duty don't change: https://myrepublica.nagariknetwork.com/news/how-reference-price-for-gold-is-determined-in-nepal ; https://english.onlinekhabar.com/gold-and-silver-prices-set-in-nepal.html . 3,538 × (1 − 0.176) ≈ **$2,915/oz** (estimate).
- World price: spot gold closed at $3,537.90/oz on 20 Nov 2026, its 2026 low, after a record $5,589.38 on 28 Jan: https://elkodaily.com/news/local/business/mining/article_aa93fc84-2e18-4fac-b707-e663a5d33618.html ; worst week in eight months, lowest since Sept 2025: https://www.cnbc.com/2026/11/20/gold-federal-reserve-price-dollar-metals.html
- Banks expect a 2027 rebound: Reuters analyst median $4,650 for 2027 (27 Oct): https://www.mitrade.eu/insights/commodities/xauusd-trading/gold-price-forecast-2027 ; Goldman Sachs end-2027 about $4,800: https://sg.finance.yahoo.com/news/goldman-sachs-revamps-2027-gold-161700634.html ; Société Générale $5,000 by Q4 2027 (20 Nov): https://www.kitco.com/news/article/2026-11-20/buy-dip-societe-generale-sees-gold-hitting-5000-2027-despite-sharp-selloff
- The reason it could fall (line 4): gold slid on expectations of a US Federal Reserve rate hike in December and a firm dollar: https://www.cnbc.com/2026/11/20/gold-federal-reserve-price-dollar-metals.html ; markets priced an 89% chance of a 25 bp hike in December (as of ~13 Nov): https://discoveryalert.com/analysis/gold-price-outlook-2027-fed-central-banks-november-2026/ ; higher yields raise the opportunity cost of holding non-yielding gold: https://www.cnbc.com/2026/11/19/gold-prices-fall-fed-rates-dollar.html . **Re-check on render day**: if the Fed has already decided, line 4 needs rewording.
- The twist: J.P. Morgan Global Research (June 2026) expected gold to push $6,000/oz by the end of 2026: https://www.jpmorgan.com/insights/global-research/commodities/gold-prices
- Pinned-comment fact: gold first crossed Rs 2 lakh per tola in Nepal at Rs 2,00,600, up from Rs 1,99,400 the day before: https://nepalface.com/content/138994/2025-08-29/ ; https://hamrosanchar.com/archives/208996
- Context (not in the script): a Nepali gold-trade veteran expects support near $3,500/oz; Kathmandu Post, 19 Nov 2026: https://kathmandupost.com/money/2026/11/19/gold-cheaper-by-rs78-400-a-tola-in-10-months
