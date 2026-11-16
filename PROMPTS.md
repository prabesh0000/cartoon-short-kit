# What to tell Claude Code

Open Terminal, then:
```
cd ~/CuriousManche/cartoon-short-kit
git pull
claude
```
`git pull` brings in scripts planned in the claude.ai chat (`scripts/`) and kit updates. Then copy-paste one of these. Swap the parts in [brackets].

## The whole flow in one prompt (script already planned in the chat)
Put the voiceover in `inbox/[slug].mp3` first, then:
```
/make-reel Build the reel for scripts/[slug].md. The voiceover is inbox/[slug].mp3.
Follow the full flow: read LESSONS.md, use the hook layers and camera journey from the script file,
cinematic score with SFX on every cut and action, show me the stills sheet before the full render.
```

## The whole flow from zero
```
/make-reel New reel from scratch: 10 verified ideas, then a storytelling-hooks script for the one I pick.
```

## Get ideas
```
/make-reel give me 10 reel ideas: mix legends, history, this week's trending news and surprising facts
```
```
/make-reel 10 ideas only about [space / ancient Egypt / Nepal's history / weird animals]
```

## Get a script
```
I pick idea [3]. Write the Nepali script, about 30 seconds.
```
```
Here is my own script, check the facts and tighten it for a 30-second reel: [paste script]
```

## Build the reel (after you put the voiceover in inbox/)
```
The voiceover is in inbox/[file].mp3 and the script is inbox/[slug].txt. Build the reel.
```
It stops once to show you a stills sheet. Then reply with one of:
```
Looks good, render it.
```
```
Fix: shot 2 is too dark, and in shot 5 the character is cut off. Then render.
```

## Changes after the render
```
Make the music more intense in the second half, and add a bigger hit on the last word.
```
```
Add Nepali captions, big and centred near the bottom, 2-4 words at a time.
```
```
Shorten the opening shot and start on the most dramatic image instead.
```

## After each reel (keeps the kit improving)
```
Add today's lessons to LESSONS.md, save any new characters to the kit, then commit and push.
```

## Quick checks and fixes
```
Run the GPU check and tell me which render mode to use on this Mac.
```
```
The render stopped. Resume it.
```
```
Export a version without music (voice + SFX only) so I can add trending audio in Instagram.
```

Tips
- One reel per Claude Code session keeps it focused. Type `/clear` between reels.
- Big changes to a rendered reel mean a re-render. Approve the stills sheet carefully first.
