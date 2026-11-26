# 26 vs India, 72 vs Pakistan: what's going on with Nepal cricket? (English, YouTube Shorts): sports news explainer

Status: script final, **voiceover coming** as `inbox/nepal-cricket.*` (user's TTS tool, English narrator, fast sports-explainer style). Slug: `nepal-cricket`. Length: about 115 words ≈ 42-46 s (measure the real file; it rules).
Platform: **YouTube (English).** All on-screen text in **English**.
Emotion: shock (the scores) → a flicker of hope (beat UAE, bowlers held Pakistan A to 168) → frustration (collapse, knocked out) → the reveal (not the full team) → open question. Twist: "This wasn't Nepal's full team."
Loop ending: no. End on the comment question.

## Rules for this reel
- **No real faces or caricatures.** Players are generic bean-heads in Nepal blue (red trim) and in neutral opponent colours (India A light blue, Pakistan A green), no names or numbers on shirts, no team or sponsor logos, no ACC/ICC marks. Real names are only spoken.
- **No mocking.** The fan is frustrated, not insulting; nobody is laughed at. The bowlers get a real celebration on the 168 line.
- **No flags waved, nothing political**; national colours on kits only.
- Scores on screen must match exactly: India A 332/9, Nepal 26 all out (11.3 ov); Pakistan A 168 all out (42 ov), Nepal 72 all out (17.3 ov); Pakistan A won by 96 runs; India A won by 306 runs.
- "Weren't even picked" refers to Rohit Paudel, Dipendra Singh Airee and Karan KC (NPL captains, not in the Rising Stars squad). "Landed on the morning of the match" refers to the India A game (captain's own words).

## Hook options considered
1. **"Twenty-six against India. Seventy-two against Pakistan. What is going on with Nepal's cricket team?"** (chosen: the two scores are the shock)
2. "Nepal just got bowled out for twenty-six." (one score only)
3. "Nepal lost by three hundred and six runs." (margin is less visual than the total)
4. "This wasn't even Nepal's real team." (gives the twist away)
5. "Six Nepali batters. Six zeros." (too narrow)

## Hook layers (0:00)
- **First frame:** a big stadium scoreboard mid-flip, `INDIA A 332` above `NEPAL 26`, with a Nepali fan in a dhaka topi below it, hands on his head. Works on mute.
- **Spoken line:** line 1.
- **Overlay:** `26 vs India. 72 vs Pakistan.` (accent: 72).
- **Beat overlays:** `India A 332 · Nepal 26` (line 2; accent: 26), `Pakistan A 168` (line 3; accent: 168), `6 ducks · knocked out` (line 4; accent: 6), `Not the full team` (line 5; accent: full), `NPL clash` (line 6; accent: NPL), `Who's to blame?` (line 8; accent: blame?).
- All text in style A via `tools/textlayer.js` (English). Never over faces, the scoreboard digits or the stumps.

## Narration (plain text, the timing source)
```
Twenty-six against India. Seventy-two against Pakistan. What is going on with Nepal's cricket team?
At the Rising Stars Asia Cup in Qatar, India A scored three hundred and thirty-two. Nepal were all out for twenty-six.
They did beat the UAE in between. And today, Nepal's bowlers held Pakistan A to just one sixty-eight.
But the batting collapsed again. Six batters out for zero. Nepal were knocked out.
But here's the thing. This wasn't Nepal's full team.
Because of the Nepal Premier League, Rohit Paudel, Dipendra Singh Airee and Karan KC weren't even picked. Some players landed in Qatar on the morning of the match.
And it exposed one thing. When the top players are missing, the backups can't hold the batting together.
So who's to blame? The league schedule, or Nepal's weak backup batting? Tell me in the comments.
```
If the take differs from this text, time to what was actually said and tell the user.

## Visual journey
| Line | Shot size | Visual | Motion |
|---|---|---|---|
| 1 | MCU → wide | Scoreboard flips 332/26, then 168/72; the fan below, hands on head | push-in on the digits, pull back to reveal the fan and the stands |
| 2 | Wide | Doha stadium at dusk (desert, floodlights); Nepal batters walking back one after another, a tiny "26" glowing | slow crane down the pavilion steps |
| 3 | MS | Quick win beat (UAE), then Nepal bowlers in blue celebrating a wicket, scoreboard `PAK A 168 all out` | snappy cut, celebration jump with overshoot |
| 4 | Insert → MS | Six stumps cartwheel one after another (6 ducks), then a `KNOCKED OUT` stamp | rhythmic cuts on each stump, stamp thunk + small shake |
| 5 | MCU | Whip to the dressing room: three empty seats with neatly folded blue shirts (no names) | whip-pan, slow push to the empty seats |
| 6 | Wide → MS | Back in Nepal: an NPL-style night match with crowds (generic league, no logos); then players with kit bags hurrying off a plane at dawn in Doha | cross-cut with a 6-frame flash; dawn sky |
| 7 | MS | A batting line-up of cards: the top three are cut-out silhouettes (missing), the ones below wobble and fall like dominoes | dominoes topple with stagger |
| 8 | MCU | The fan turns to camera between two signs: `LEAGUE SCHEDULE` and `BACKUP BATTING`, shrugs | slow creep; end on "comments" |

## Editing specifics
- Pace: fast; a new visual or camera change every 1-2.5 s.
- Text: style A from `guides/caption-style.md` (English overlays, accent as listed); inside the safe area.
- Subtitles: key-phrase overlays only (default).
- Ending: outro; hold the last frame ~0.6 s after the voice.
- Cover frame: frame 0 (scoreboard 332/26 with the fan), cover text `26 vs India. 72 vs Pakistan.`

## Sound
Modern sports-news pulse with tense low strings; stadium crowd ambience (cheers on the bowlers' beat, a groan on the collapse), soft stump "clack" on each duck, a stamp thunk on "knocked out", a hush and low drone on "This wasn't Nepal's full team", jet whoosh on the airport line, a single tick-tock under the final question. All SFX soft (-12 dB, peaks ≤ 0.4x voice).

## Reach pack (for the user to post)
- YouTube title: "26 vs India, 72 vs Pakistan: What's Wrong With Nepal Cricket?"
- Description: "Nepal were bowled out for 26 by India A and 72 by Pakistan A at the Asia Cup Rising Stars 2026 in Doha, and went out of the tournament. But several first-choice players were missing because the tournament clashed with the Nepal Premier League. Sources below."
- Hashtags (5): #NepalCricket #AsiaCupRisingStars #Cricket #Shorts #TheCuriousManche
- Pinned comment: "League schedule or backup batting? 👇 Sources: ESPNcricinfo, Himal Press, Nepal Press, Yahoo Sports (Nov 20-24, 2026)."
- Platform notes: YouTube Shorts; don't tag players or the cricket board.

## QA before posting
- [ ] Scores match the sources exactly  - [ ] Text inside the safe area  - [ ] Ending lands on "comments"
- [ ] No recognisable real players, no logos, nobody mocked

## Sources (checked 24 Nov 2026)
- India A 332/9, Nepal 26 all out, India A won by 306 runs; Nepal missing key players due to the NPL: https://www.cricinfo.com/series/asia-cup-rising-stars-50-overs-2026-27-1562333/india-a-vs-nepal-4th-match-group-b-1562345/live-cricket-score
- Captain: "We didn't have our full-strength team here. A few of the players arrived this morning. NPL is going on back home.": https://sports.yahoo.com/articles/didnt-full-strength-team-nepal-222000997.html
- Pakistan A 168 in 42 overs (Rashid Khan five wickets), Nepal 72 in 17.3 overs, lost by 96, eliminated; second loss in three games: https://en.himalpress.com/nepal-crash-out-of-asia-cup-rising-stars-after-heavy-defeat-to-pakistan-a/
- Six Nepali batters out for zero: https://www.ratopati.com/story/607398/nepal-all-out-for-72-against-pakistan-a-6-batters-fail-to-open-account
- Rohit Paudel, Dipendra Singh Airee, Karan KC (NPL captains) not in the squad: https://dev.nepalpress.com/2026/11/20/782803/nepal-faces-a-powerful-indian-team-but-key-players-are-missing/
- Nepal beat the UAE by six wickets: https://cwibc.co.id/en/pakistan-nepal-rising-stars-clash
