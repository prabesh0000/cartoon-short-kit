# Setup guide: The Curious Manche reel studio on your Mac

You do this once. It takes about 30-45 minutes. After that, making a reel is: open Terminal → `claude` → "make a reel".

---

## 0. What you end up with

```
~/CuriousManche/
└── cartoon-short-kit/                ← this repo. Always open Claude Code HERE.
    ├── CLAUDE.md                     ← project memory: brand, your preferences, rules (Claude reads it every session)
    ├── SETUP.md                      ← this guide
    ├── PROMPTS.md                    ← what to type to Claude Code (copy-paste)
    ├── LESSONS.md                    ← what every reel taught us (Claude reads it before each reel and adds to it after)
    ├── README.md                     ← how the engine works
    ├── .claude/
    │   ├── settings.json             ← lets Claude run render/ffmpeg/python without asking every time
    │   └── skills/make-reel/SKILL.md ← the full reel-making workflow (/make-reel)
    ├── brand/                        ← profile photos + transparent mascot
    ├── engine/                       ← renderer, characters (nepal.js, mascot.js), textures, motion
    ├── tools/                        ← setup, timing, render, GPU check, mix, finish
    ├── vendor/                       ← three.js + toon library (no internet needed)
    ├── example/yalambar/             ← the finished Yalambar reel, used as a reference
    ├── inbox/                        ← YOU drop ElevenLabs voiceovers + script .txt here
    └── reels/                        ← one folder per reel; the final MP4 is in reels/<name>/out/
```
`inbox/` and `reels/` stay on your Mac. They are git-ignored, so big files never go to GitHub.

---

## 1. Requirements
- macOS 13 or newer. An Apple Silicon (M1/M2/M3/M4) Mac renders much faster.
- A few GB of free disk space. Each reel's frames take a few hundred MB, and you can delete `frames/` after export.
- A Claude plan that includes Claude Code. You log in once.
- Your GitHub account (prabesh0000) and an ElevenLabs account.

---

## 2. Install the tools (Terminal)

Open **Terminal** (Cmd+Space → "Terminal") and run these one block at a time.

**Homebrew** (the Mac package manager), if you don't have it:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
At the end it prints 2-3 "Next steps" lines (`echo ... >> ~/.zprofile` and `eval ...`). Copy and run them.

**Node, ffmpeg, Python, git:**
```bash
brew install node ffmpeg python git
node --version     # must be 22.6 or newer
ffmpeg -version | head -1
```

**Python packages** (for music, mixing and checks):
```bash
python3 -m pip install --user --break-system-packages numpy scipy pillow matplotlib
```

**Playwright + Chromium** (the headless browser that renders the frames):
```bash
npm install -g playwright
npx playwright install chromium
```

**Claude Code:**
```bash
curl -fsSL https://claude.ai/install.sh | bash
```
Close Terminal, open a new window, then check:
```bash
claude --version
```
If you see `command not found: claude`, run `source ~/.zshrc` or open a new window again.

---

## 3. Get the kit

1. On GitHub, open **github.com/prabesh0000/cartoon-short-kit/pull/1** and press **Merge pull request** → **Confirm merge**. That puts all these files on `main`.
2. In Terminal:
```bash
mkdir -p ~/CuriousManche && cd ~/CuriousManche
git clone https://github.com/prabesh0000/cartoon-short-kit
cd cartoon-short-kit
ls
```
You should see `CLAUDE.md`, `SETUP.md`, `PROMPTS.md`, `engine`, `tools`, `inbox`, `reels`…

---

## 4. First start + test run

```bash
cd ~/CuriousManche/cartoon-short-kit
claude
```
- First time: it asks you to **log in**. Follow the browser link.
- It asks whether you **trust this folder**. Choose yes: that turns on the project settings and the make-reel skill.

Now paste this whole message into Claude Code:
```
Setup check. Please:
1. Confirm node (>=22.6), ffmpeg, python3 with numpy/scipy/pillow/matplotlib, and playwright chromium are installed.
2. Run: bash tools/setup.sh reels/test
3. Inside reels/test run node gpucheck.mjs and tell me which GL mode uses my GPU.
4. Render 3 test stills with that mode (node render.mjs stills/t "0,60,120"), report seconds per frame, and open the contact sheet.
5. If anything fails, fix it and explain in one line.
```
**A good result:** `GL=gpu` reports your Apple GPU (e.g. "Apple M2"), and frames render much faster than on Claude's cloud workspace (about 2-3 s per frame there).
If the GPU mode fails, Claude falls back to `GL=swiftshader`. It still works, just slower.

Afterwards you can delete the test: `rm -rf reels/test`.

---

## 5. Making a reel (every time)

1. `cd ~/CuriousManche/cartoon-short-kit && claude`
2. Type: `/make-reel give me 10 ideas` (more prompts in **PROMPTS.md**).
3. Pick a number → Claude writes the Nepali script (about 60 words ≈ 30 s).
4. Record it in **ElevenLabs** (voice "Ashok Pokhrel", no music) and save the `.mp3` into `inbox/`.
5. Tell Claude: `The voiceover is in inbox/<file>.mp3. Build the reel.`
6. Claude shows a **stills contact sheet**. Reply "looks good, render" or list fixes.
7. Keep the Mac awake while it renders. In a second Terminal tab:
   ```bash
   caffeinate -i
   ```
   (Ctrl+C stops it afterwards.)
8. The finished MP4 opens from `reels/<name>/out/`. Polish it in Premiere if you like (captions, trending audio), then post.
9. Tell Claude: `Add today's lessons to LESSONS.md and commit and push.` The kit gets better every reel.

---

## 6. Keep things in sync
- **CLAUDE.md** = what Claude should always know (brand, preferences). Edit it yourself any time, in plain English.
- **LESSONS.md** = Claude adds an entry after every reel.
- **Chat on claude.ai** (ideas, research, branding) and **Claude Code on your Mac** (building reels) don't share memory automatically. When you decide something in chat (a new rule or a new brand colour), add a line to CLAUDE.md, or ask Claude Code to.
- On another Mac, or after a reset, just `git clone` again and repeat steps 2 and 4.

---

## 7. Troubleshooting
| Problem | Fix |
|---|---|
| `command not found: claude` | Open a new Terminal window, or run `source ~/.zshrc` |
| `node` too old | `brew upgrade node` |
| `pip` says "externally managed" | Use the exact pip command from step 2 (it includes `--break-system-packages`) |
| Playwright can't find a browser | `npx playwright install chromium` |
| Renders are slow | Ask Claude: "run the GPU check and switch to the fastest GL mode" |
| The render stopped (Mac slept) | Ask Claude: "resume the render". It continues from the last frame (`RESUME=1`) |
| Claude asks permission for every command | Make sure you trusted the folder; type `/permissions` to see the rules |
