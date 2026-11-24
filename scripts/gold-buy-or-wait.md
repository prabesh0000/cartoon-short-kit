# सुन अहिले किन्ने कि पर्खने? (Buy gold now or wait?): trending news explainer

Status: **script final**, voiceover pending as `inbox/gold-buy-or-wait.*` (rename to `inbox/gold-buy-or-wait.mp3` first, because spaces break the tools). Slug: `gold-buy-or-wait`. Length: about 65 words ≈ 30 s (measure the real file; it rules).
Emotion: curiosity → facts → "nobody knows". Twist: "अब यो तल्लो बिन्दु हो कि अझै घट्ने हो, त्यो पछि मात्र थाहा हुन्छ।"
Loop ending: yes. The closing question runs straight into line 1 on replay.
Sensitive topic: **money / news.** No buy or sell advice, no forecast from us. Facts from the 19 Nov 2026 report. **Same-day news reel: render and post within 1-2 days.** Re-check the Nepal price on render day; if it has moved a lot, update lines 2-3 and the overlays before rendering. Follow `guides/sensitive-topics.md` and run its checklist before rendering.
Follow-up to `scripts/gold.md` and `scripts/gold-2-lakh.md`. Reuse the cast from `reels/gold/web/gold.js` (price board, chalk chart, globe, gold-bar character, generic bank).

## Rules for this reel
- **Not financial advice, and no buy or wait recommendation.** The narration asks the viewer's own question and never answers it. The caption says "Not financial advice".
- **No real bank names or logos on screen.** Banks are generic buildings with columns.
- **The December rate hike is an expectation, not a decision.** Narration says "अपेक्षा छ"; the screen shows a dashed "अनुमान" marker, never a done deal.
- **No seesaw or balance for "up/down"** (it reads as weight).
- Keep the Nepal price claim dated: "पछिल्लो रिपोर्टमा" (in the latest report), never "आज" (today) unless re-checked on render day.

## Hook options considered
1. **तपाईं सुन अहिले किन्ने कि पर्खने सोचमा हुनुहुन्छ?** (the viewer's own question; **chosen**, per the user's request).
2. सुन किन्ने समय आएको हो? (plainer; drops the "wait" option)
3. सुन अझै घट्छ कि बढ्छ? (curiosity gap; invites a prediction)

## Hook layers (0:00)
- **First frame:** the jewellery shop's price board **mid-flip**, with a chalk line drawn under it and a small bean-head customer on tiptoe staring at the gap. Works on mute.
- **Spoken line:** line 1.
- **Overlay:** `सुन: किन्ने कि पर्खने?` (accent: पर्खने?). The voice asks the question; the screen shows the two choices.
- **Beat overlays:** `३ लाख+` (line 2; accent: ३ लाख+), `−२४%` with `पछिल्लो रिपोर्ट` underneath (line 3; accent: −२४%), `डिसेम्बर: ब्याजदर ↑ अनुमान` (line 4; accent: अनुमान), `अपेक्षा ≠ निर्णय` (line 5).
- All text in style A via `tools/textlayer.js`. Never over faces, the price board digits or the chart.

## Narration (plain text, the timing source)
```
तपाईं सुन अहिले किन्ने कि पर्खने सोचमा हुनुहुन्छ?
नेपालमा सुनको भाउ तीन लाखभन्दा माथि पुगेको थियो।
पछिल्लो रिपोर्टमा त्यो भन्दा झन्डै चौबिस प्रतिशत तल छ।
किन? अमेरिकाले डिसेम्बरमा ब्याजदर बढाउने अपेक्षा छ।
तर अपेक्षा हो, निर्णय होइन।
अब यो तल्लो बिन्दु हो कि अझै घट्ने हो, त्यो पछि मात्र थाहा हुन्छ।
तपाईं सुन अहिले किन्ने कि पर्खने सोचमा हुनुहुन्छ?
```
Recording: dramatic opening question, matter-of-fact facts, a clear pause before "तर अपेक्षा हो", a softer, unhurried twist line, and a rising last question that runs into line 1.

## Visual journey
| Line | Shot size | Visual | Motion |
|---|---|---|---|
| 1 | MCU | Price board mid-flip; chalk line under it; customer on tiptoe | Slow push-in; flip clack on frame 0 |
| 2 | Insert | The board settles on the record figure; a small "पछिल्लो रिपोर्ट" date tag swings | Settle with a tiny bounce |
| 3 | Designed card | Thermometer bar: record level at the top, current level about 24% lower; the gap fills with `−२४%` | Bar drains, then stops |
| 4 | Designed card → MCU | Rising "ब्याजदर %" gauge with a dashed "अनुमान" line pointing to "डिसेम्बर" | Needle climbs along the dashed line |
| 5 | MCU | Bean-head investor in a suit, hesitant, holding a gold coin box at a generic bank door | Slow drift |
| 6 | Designed card | Chalk chart: a dashed line and a solid line, both unlabelled, meeting at a question mark | Lines draw slowly; hold |
| 7 | MCU → loop | Customer and shopkeeper both shrug; a big "?" rises over the board; cut back to the frame-0 flip | Slow pull-back, then cut into line 1 |

## Editing specifics
- Pace: a new visual or camera change every 1.5-3 s; nothing static for more than 3 s. Cuts on words, slow drifts in between.
- Text: style A (`guides/caption-style.md`), inside the safe area; zero flags in `work/text_report.json`.
- Subtitles: key-phrase overlays only.
- **Ending: loop.** The last frame equals frame 0, with the same board-flip clack at both ends.
- Cover frame: the price board mid-flip with the cover text `सुन किन्ने कि पर्खने?` (style A, accent: पर्खने?).

## Sound
Modern news pulse, tense and curious (not a happy loop): low pulse, soft ticker ticks on eighths. A soft low sting on "निर्णय होइन", then a lighter pulse for the last two lines.
SFX: board flip clacks (an octave down + 900 Hz low-pass), a soft drain for the bar, a gauge tick, a chalk scratch as the lines draw, a shrug "boop".
SFX soft (-12 dB, peaks ≤ 0.4x voice); check every cue with `sfx_check.py`.

## Reach pack (for the user to post)
- **Caption (Instagram):**
  ```
  Are you thinking about buying gold now or waiting? 🤔

  The domestic price is about 24% below its record in the latest report. Markets expect a US rate hike in December, but that is an expectation, not a decision. Nobody knows if this is the bottom.

  Not financial advice.

  #GoldPrice #Nepal #NepalNews #Economy #TheCuriousManche
  ```
- **TikTok caption:** `Buy gold now or wait? 📉 Nobody knows the bottom. #GoldPrice #Nepal #NepalNews #Economy #TheCuriousManche`
- **YouTube Shorts title:** `Buy Gold Now or Wait? #Shorts`
- **Pinned comment:** `Nepal's gold price is set daily by the dealers' federation, following the international market. Are you buying now or waiting? 👀`
- **Poll:** `Buy gold now or wait?` → `Buy 💍` / `Wait ⏳`
- **Platform notes:** post the same day on Facebook. Keep replies factual; never tell anyone to buy or sell. If the price moves a lot after posting, add a dated note to the pinned comment.

## QA before posting
- [ ] Every number matches the sources and the date  - [ ] Nepal price re-checked on render day
- [ ] "अनुमान" shown next to the December hike  - [ ] No buy/sell advice, no forecast from us
- [ ] No real bank names or logos on screen  - [ ] Text inside the safe area, nothing blocked
- [ ] Sensitive-topic checklist (`guides/sensitive-topics.md`) passed  - [ ] The loop: last frame = frame 0

## Sources (checked 23 Nov 2026)
- Record and the latest fall: Nepal gold reached Rs 3,39,300 per tola as its domestic all-time high, and was down 24.08% in the 19 Nov report: https://www.sharesansar.com/newsdetail/gold-price-falls-2408-from-its-all-time-high-price-silver-by-5556-2026-11-19
- The Nepal price follows the international market: https://myrepublica.nagariknetwork.com/amp/news/gold-price-sees-increase-in-nepali-market
- The Fed rate-hike pressure: https://www.fxstreet.com/analysis/gold-remains-under-pressure-as-inflation-keeps-fed-rate-hikes-in-focus-202611160633
- Expectations are not decisions: https://www.bullionbypost.co.uk/gold-news/2026/october/14/forget-halloween-the-feds-already-thinking-about-the-christmas-holidays/
