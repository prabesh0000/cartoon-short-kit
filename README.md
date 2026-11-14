# cartoon-short-kit
Audio in, finished vertical cartoon short out. 2D bean-head cards in an inked, painted 3D world
(three.js in headless Chromium, no Remotion and no GPU needed), with a synthesized music bed and SFX.

- `engine/` renderer: world helpers, cards, ink pass, lens blur, grade (`main.js`), painted textures (`paint.js`),
  cast drawing (`roman.js` on top of the Pen library from mromidev/claude-animated-shorts), motion helpers (`motion.js`).
- `example/soldier/` the worked example "The Soldier Who Never Left" (story.js shot plan + audio.py cue table).
- `tools/` setup.sh (new project), timing.py (word timings), render.mjs (frames), sheet.py (contact sheets),
  mix.py (level-locked mix), finish.sh (loudness + encode + QA).
- `vendor/` three.js r160 module build and toon.ts (both MIT, licenses alongside), so setup needs no network.

**Read `LESSONS.md` first.** It collects what each project taught (timing, framing, sound, Nepali specifics) and gets a new entry after every short.

Extras:
- `tools/patch_toon.py` (run by setup.sh) adds optional hooks to the toon `bodyFront`: `armFn`, `behind`, `front`, `headExtra`, `back` (custom poses, props, crowns, back views).
- `engine/nepal.js`: the Nepal cast (Kirat king and warriors, two armies, Krishna seen from behind, townsfolk in dhaka topi, the Akash Bhairav mask, the Sudarshan chakra, props, puffs, glows) plus POSES and `armBlend`.
- `example/yalambar/`: the Nepali short "यलम्बरको शिर" (standalone engine variant, cinematic thriller score template, hand-mapped timing).

Pipeline (run inside the project folder setup.sh creates):
```
bash <kit>/tools/setup.sh ~/shorts/my-short && cd ~/shorts/my-short
python3 timing.py voice.mp3 script.txt --out work      # word + phrase timings
# write web/story.js (shots, cameras, cast, fx) and the audio.py cue table
node render.mjs stills/a "5,40,..." && python3 sheet.py stills/a stills/sheet_a.jpg   # look check
node render.mjs frames "0-<N-1>"                       # RESUME=1 continues after an interruption
python3 audio.py                                       # -> music.wav + sfx.wav stems
python3 mix.py voice.mp3 music.wav sfx.wav             # -> mix_raw.wav, music at -6.0 dB vs voice
bash finish.sh "Title Of Short"                        # -> out/Title-Of-Short.mp4 + out/qa_sheet.jpg
```

Audio rules: the voice is never processed. `mix.py` sets the music bed to 50 % of the voice's gated RMS
(-6 dB) and SFX to 50 % with peaks capped at 0.7x the voice peak, with no ducking or compression.
`finish.sh` applies one linear gain to -14 LUFS (`LUFS=-16 bash finish.sh ...` to change) and a
delay-compensated -1 dBFS limiter.

Built on github.com/mromidev/claude-animated-shorts (MIT): toon.ts, look values and readability rules.
