# आखिर सुन किन घट्यो? (Why did gold fall?): trending news explainer

Status: **voiceover coming** as `inbox/gold.*` (ElevenLabs v3, Ashok Pokhrel, tagged version below). Slug: `gold`. Length: 63 words ≈ 32-36 s (measure the real file; it rules).
Emotion: surprise → curiosity → "aha" (a decision in America changed the price of wedding jewellery in Nepal). Twist: "कारण नेपाल होइन, अमेरिका हो।"
Loop ending: yes. "…ट्याग गरेर सोध्नुहोस् कि…" runs straight into line 1 ("आखिर सुन किन घट्यो?") on replay.
Sensitive topic: **money / news.** No buy or sell advice. Facts dated 20 Nov 2026 (मंसिर ४, २०८३). **Same-day news reel: render and post within 1-2 days.** Re-check the Nepal price on render day; if it has moved a lot, tell the user before rendering (lines 2-3 and the overlays may need an update).

## Rules for this reel
- **Not financial advice.** Nobody on screen tells the viewer to buy or sell. The last line only asks a friend; the caption says "Not financial advice".
- **No real brands, banks, jewellers or logos.** Generic jewellery shop, generic bank with columns and a "%" sign. No real officials or faces (no Fed chair, no politicians); investors are generic bean-heads in suits.
- **America shown generically:** a skyline and a small "USA" label on a globe. No flags waved, nothing political.
- **Wedding scenes respectful and generic:** red sari, marigold garlands, dhol and band-baaja, a procession. Don't tie it to one community's specific dress or ritual. The bride is clearly adult.
- **Numbers on screen must match the sources exactly** (see Hook layers). The narration rounds Rs 93,900 to "झन्डै एक लाख" (almost one lakh); the screen shows the exact figures.
- Follow the newest LESSONS: cuts on words plus slow drifts (no lateral pans across textured walls, no continuous tilt-up reveals under a top overlay), invisible proxy cards for `protect`, mix against `voice_pad.wav` for the exact loop length.

## Hook layers (0:00)
- **First frame:** a jewellery shop's price board **mid-flip**, the digits dropping from `२,५७,६००` to `२,४५,४००`, with the shopkeeper's jaw dropping below it (face below ~600 px so the top overlay is clear). Works on mute.
- **Spoken line:** line 1.
- **Overlay:** `माघ ३,३९,३०० → आज २,४५,४००` (0:00 to the end of line 1; accent: `२,४५,४००`). The voice asks why; the screen shows how much.
- **Beat overlays:** `एकैदिन −१२,२००` (line 2; accent: −१२,२००), `रेकर्डभन्दा −९३,९००` (line 3; accent: −९३,९००), `सुन = ० ब्याज` (line 6; accent: ०).
- All text in style A via `tools/textlayer.js`. Never over faces, the price board digits, the chart or the seesaw.

## Narration (plain text, the timing source)
```
आखिर सुन किन घट्यो?
बिहेको सिजनमा त महँगिनुपर्ने हो, तर आज एकैदिन तोलामा बाह्र हजारभन्दा बढी घट्यो,
माघको रेकर्डभन्दा झन्डै एक लाख सस्तो!
माघमा किन्नेहरूलाई घाटा, बिहे पर्खिनेहरूलाई फाइदा।
तर अचम्मको कुरा, कारण नेपाल होइन, अमेरिका हो।
त्यहाँ ब्याजदर बढ्ला भन्ने अनुमानले, लगानीकर्ताले सुन बेचे, किनकि सुनले ब्याज दिँदैन।
अर्थात्, अमेरिकाको ब्याजदरले नेपालको बिहेको गहना सस्तो बनायो।
चाँडै बिहे गर्ने साथीलाई ट्याग गरेर सोध्नुहोस् कि...
```

ElevenLabs v3 version that was recorded (Natural stability, speed 1.0):
```
[dramatically] आखिर सुन किन घट्यो?
[curious] बिहेको सिजनमा त महँगिनुपर्ने हो, तर आज एकैदिन तोलामा बाह्र हजारभन्दा बढी घट्यो,
[urgently] माघको रेकर्डभन्दा झन्डै एक लाख सस्तो!
माघमा किन्नेहरूलाई घाटा, बिहे पर्खिनेहरूलाई फाइदा।
[short pause] [mysteriously] तर अचम्मको कुरा, कारण नेपाल होइन, अमेरिका हो।
त्यहाँ ब्याजदर बढ्ला भन्ने अनुमानले, लगानीकर्ताले सुन बेचे, किनकि सुनले ब्याज दिँदैन।
[dramatically] अर्थात्, अमेरिकाको ब्याजदरले नेपालको बिहेको गहना सस्तो बनायो।
[mischievously] चाँडै बिहे गर्ने साथीलाई ट्याग गरेर सोध्नुहोस् कि...
```
Expect a clear pause before line 5 (the turn), weight on "अमेरिका हो", and a rising, unfinished "कि…". Trim any silence at either end before timing (loop).

## Visual journey
| Line | Shot size | Visual | Motion |
|---|---|---|---|
| 1 | Medium close-up | Generic New Road-style jewellery shop: the price board flips down mid-shot; the shopkeeper's jaw drops, a gold bangle on the counter wobbles | Slow push-in; a 2-frame dip on the last digit |
| 2 | Wide | Cut on "बिहेको": a Mangsir wedding procession (dhol, band-baaja, marigolds) passes the shop; a green "माग ↑" (demand) arrow pops above the crowd. Cut on "तर" to the board: a heavy red down-arrow slams onto it on "घट्यो" | Slow drift with the procession; cuts on "तर" and "घट्यो" |
| 3 | Insert (designed 2D card) | Simple line chart on a shop chalkboard: a peak flag in Magh (`३,३९,३००`) and a slide down to today (`२,४५,४००`); the drop is shaded | The line draws itself to today; slow push |
| 4 | Two-shot, split | Left: a man who bought in Magh clutching a gold-coin box, sweating, a coin slips away. Right: a mother and her adult daughter (bride-to-be) smiling at a necklace in the shop | Cut on "फाइदा" from left to right half; small drifts |
| 5 | Wide → globe | Snap-cut on a soft whoosh: a globe turns from Nepal to America; a thin gold thread runs from Kathmandu to a generic US skyline with a "USA" label. Music sting on "अमेरिका हो" | Snap-cut, then slow drift; low hit on "हो" |
| 6 | Medium (designed card) | A seesaw: a big "%" (ब्याजदर) on one end rises while a pile of gold bars on the other end drops; bean-head investors in suits carry gold bars to a generic bank vault labelled "ब्याज". On "सुनले ब्याज दिँदैन" a gold bar gets a "० ब्याज" tag and shrugs | Cuts on "बेचे" and "दिँदैन"; seesaw springs with overshoot |
| 7 | Medium → wide | Back in Kathmandu: the mother clasps the necklace on her daughter; the price tag flips smaller; the procession passes behind | Cut on "अर्थात्"; slow pull-back |
| 8 | Medium → close-up | Two adult friends at the procession; one taps his phone to tag the groom-to-be friend; on "कि…" cut into the price board so the last frame matches frame 0 (loop) | Cut, then the same slow push as shot 1 so f_last → f0 is one move |

## Editing specifics
- Pace: a new visual or camera change every 1.5-3 s; nothing static for more than 3 s. Cuts on words, slow drifts in between.
- Text: style A (`guides/caption-style.md`), inside the safe area; zero flags in `work/text_report.json`.
- Subtitles: key-phrase overlays only.
- **Ending: loop.** No outro, no fade; the last frame equals frame 0; music runs to the last frame; the same board-flip clack at both ends.
- Cover frame: the price board mid-drop with the cover text `सुन किन घट्यो?` (style A, accent: घट्यो).

## Sound
Modern news pulse, tense and curious (not a happy loop): low pulse, soft ticker ticks on eighths. **Wedding colour** in shots 2 and 7: a short band-baaja/naumati phrase, low-passed and only in the pauses. A soft low sting at "अमेरिका हो", then the pulse returns lighter.
SFX: price-board flip clacks (an octave down + 900 Hz low-pass, per the masking lesson), a soft thud for the down-arrow, a coin clink and slide (shot 4), a whoosh on the globe snap-cut, the seesaw creak and spring, a soft "ching" when the tag flips smaller, a phone tap.
SFX soft (-12 dB, peaks ≤ 0.4x voice); check every cue with `sfx_check.py`.

## Reach pack (for the user to post)
- **Caption (Instagram):**
  ```
  Why did gold fall so much in Nepal? 🤔

  On 20 Nov, gold dropped Rs 12,200 per tola in a single day to Rs 2,45,400, about Rs 94,000 below its January record. The reason isn't in Nepal: traders expect the US to raise interest rates, and gold pays no interest, so big investors sold.

  Not financial advice.

  Tag a friend who's getting married soon 👇

  #GoldPrice #Nepal #NepalNews #Economy #TheCuriousManche
  ```
  On Facebook, swap the tag line for "Would you buy gold now, or wait?"
- **TikTok caption:** `Why gold just crashed 📉 The reason is in America. #GoldPrice #Nepal #NepalNews #Economy #TheCuriousManche`
- **YouTube Shorts title:** `Why Did Gold Prices Crash in Nepal? #Shorts`
- **Pinned comment:** `Fun fact: Nepal's gold price is set every day by the gold dealers' federation, and it mostly follows the international market. Would you buy now or wait? 👀`
- **Poll** (Story / YouTube Shorts sticker): `Buy gold now or wait?` → `Buy 💍` / `Wait ⏳`
- **Platform notes:** post on Facebook the same day (Meta surfaces same-day reels). Keep replies factual; never tell anyone to buy or sell. If the price moves a lot after posting, add a dated note in the pinned comment.

## QA before posting
- [ ] Every number matches the sources and the date  - [ ] Nepal price re-checked on render day
- [ ] No buy/sell advice anywhere  - [ ] No real brands, logos, officials or flags
- [ ] Text inside the safe area, nothing blocked  - [ ] The loop: last frame = frame 0, no silence gap

## Sources (checked 20 Nov 2026)
- Nepal: gold fell Rs 12,200 per tola on Friday (मंसिर ४) to Rs 2,45,400 (hallmarked), from Rs 2,57,600 on Thursday; silver down Rs 225 to Rs 3,110 (Federation of Nepal Gold and Silver Dealers' Associations): https://www.hamropatro.com/news/detail/1795155831429891294-sunako-muly-ekaidin-12-hajarabhanda-badhile-ghatyo-chandi-pani-sastiyo ; https://www.arthikpati.com/content/2026/11/20/151447 (also: the federation says the fall follows the international market)
- Nepal record: Rs 3,39,300 per tola on Magh 15, 2082: https://ekantipur.com/business/2026/02/02/the-price-of-gold-has-dropped-by-52700-in-3-days-what-is-the-price-today-38-28.html ; https://www.onlinekhabar.com/?p=1859148 . Difference today: 3,39,300 − 2,45,400 = **93,900** (≈ 27.7%).
- World: gold fell below $3,550/oz on Fri 20 Nov, lowest since Sept 2025, as traders bet the Fed will raise rates in December and the dollar hit a 19-month high: https://www.nacionale.com/en/articles/why-is-gold-price-falling-today-14-month-low-fed-rate-hike-strong-dollar ; Kitco live: $3,526.90, −2.68%: https://www.kitco.com/charts/gold
- World record: $5,589.38/oz on 28 Jan 2026: https://www.cbsnews.com/news/highest-gold-price-in-history-how-its-changed-from-2025-to-2026
- Why rates matter: higher rates raise the opportunity cost of holding non-yielding gold: https://tw.tradingview.com/chart/GOLD/Y51Frg2a-XAUUSD-SHort-will-it-finally-make-it-through
- Also cited (not in the script): forced selling after an equity (AI stock) sell-off added to the drop: https://www.xtb.com/cy/market-analysis/news-and-research/gold-loses-a-third-of-its-value-it-s-liquidity-and-the-fed-not-peace-in-shenzhen
