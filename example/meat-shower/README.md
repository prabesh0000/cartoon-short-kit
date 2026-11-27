# The reference standard: "The Day It Rained Meat" (2026-11-27)

Mr. P: **"this is the best video till now, from now on every video needs to be created like this."**
English YouTube fact short, 33.6 s, 16 shots, loops. Built with `guides/editing-grammar.md`. Brief: `scripts/kentucky-meat-shower.md`.
Lessons: the two 2026-11-27 entries for this reel in `LESSONS.md`.

## Start every new reel from here
```
bash tools/setup.sh reels/<slug>
cp example/meat-shower/web/* reels/<slug>/web/          # engine (main/motion/protect/paint) + full cast in toon.js
cp vendor/three.module.js reels/<slug>/web/             # main.js imports ./three.module.js
cp example/meat-shower/audio.py reels/<slug>/           # synth library + arrangement to rewrite
```
Then replace `story.js`, `world.js` and the reel's own cast file (`meat.js` → `<slug>.js`, suffix your names), and rebuild
`toon.js` = this toon.js without the meat.js part + your cast file (or simply append your cast file: the meat cast is harmless).
`work/post.json` and `work/text.json` show the post and caption setup.

## What makes it the standard (keep all of it)
- **Frame 0 = the hook as action** (a steak tumbling at the lens out of a blue sky + more chunks + the channel "?"), no title card: the word captions say the hook.
- **A new framing every ~2 s**, 16 shots in 33 s, nothing still for 0.4 s; light per beat (morning → hush → high sky → morning).
- **Carried transitions**: follow the falling chunk down into the pot (shot 2), crane + tilt from the yard into the sky (11), fly up through a cloud with a white-out (12), whips between the two farmers and along the flock (`blendCam` of two follow-cameras with inOut over 10 frames). Every fast move has a `post.json` blur range.
- **Props carry the jokes and are animated like actions**: eating = lift in front of the chest, mouth opens wide 5 f before the chomp, chomp on the word, scalloped bite notch, crumbs, a full cheek while chewing; stirring = a real 3D paddle from her hand into a closed cauldron standing beside her (never behind or in front of her); a chunk lands on the ladle on "what".
- **Thought bubbles** (lamb / deer) answer the spoken guess; a chicken dodges; a crowd (the flock) does a domino gag; small effects everywhere (fire + sparks, steam, chimney smoke, splashes, dust puffs, falling meat).
- **Word-by-word captions** (English), faces protected by small proxies, beat overlays only for words not spoken (LOOK UP, BLEGH!).
- **Sound**: a theme-fitting score with sections that follow the story, never silent (drone + wind under the reveal), soft SFX (-12 dB) only where the narration has room, -14 LUFS.
- **Loop**: the last frame is the opening sky with the next steak already falling.
