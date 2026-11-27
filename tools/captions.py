#!/usr/bin/env python3
"""Word-by-word captions for ENGLISH reels -> merged into work/text.json as "captions".

Usage (inside a reel project):
  python3 captions.py [work/words.json | work/whisper.json] [--script work/script.txt] [--out work/text.json]
                      [--accent "forty,never,impossible"] [--early 1]

- Reads word timings from timing.py (words.json: [{"w","s","e"}]) or a whisper dump ([[s, e, "word"], ...]).
- With --script, spelling and punctuation come from the script (difflib alignment), timing from the audio.
- Shows ONE word at a time. A short function word ("a", "the", "in", "of"...) joins the next word, as in
  "put a" / "the city", when the pair is short and spoken without a pause.
- Each caption appears `--early` frames (default 1) before its word and stays until the next one starts;
  across a pause longer than 0.35 s it clears 8 frames after the word ends (no stale words in silences).
- --accent: comma list of words drawn in the accent yellow (numbers and key nouns; use sparingly, 0-4 per reel).
Nepali reels do NOT use this: they keep style A key-phrase overlays (guides/caption-style.md).
"""
import difflib, json, os, re, sys

FPS = 30
JOIN = {"a", "an", "the", "of", "in", "on", "at", "to", "is", "it", "and", "but", "or", "for", "by", "his", "her",
        "my", "your", "its", "was", "he", "she", "we", "they", "you", "i", "so", "as", "if", "no", "not", "be"}

def arg(name, default=None):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default

def glue(ws):
    """whisper splits "300,000" into "300" + ",000" and leaves lone dashes: glue such pieces to the previous word"""
    out = []
    for s, e, w in ws:
        if out and (re.match(r"^[,.]\d", w) or not re.search(r"[A-Za-z0-9]", w)):
            ps, pe, pw = out[-1]; out[-1] = (ps, max(pe, e), pw + (w if re.match(r"^[,.]\d", w) else ""))
        else: out.append((s, e, w))
    return out

def load_words(p):
    d = json.load(open(p))
    if d and isinstance(d[0], dict):
        return glue([(float(w["s"]), float(w["e"]), w["w"].strip()) for w in d if w["w"].strip()])
    return glue([(float(s), float(e), w.strip()) for s, e, w in d if w.strip()])

norm = lambda w: re.sub(r"[^a-z0-9']", "", w.lower().replace("’", "'"))

def respell(words, script):
    """keep timings, take the script's spelling + punctuation where the words match"""
    sw = [w for w in script.replace("\n", " ").replace("—", " ").replace("–", " ").split() if re.search(r"[A-Za-z0-9]", w)]
    a, b = [norm(w) for _, _, w in words], [norm(w) for w in sw]
    out = list(words)
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if tag == "equal" or (tag == "replace" and i2 - i1 == j2 - j1):
            for k in range(i2 - i1):
                s, e, _ = out[i1 + k]; out[i1 + k] = (s, e, sw[j1 + k])
    return out

def group(words):
    caps, i = [], 0
    while i < len(words):
        s, e, w = words[i]
        if i + 1 < len(words) and norm(w) in JOIN and not re.search(r"[,.;:!?]$", w):
            s2, e2, w2 = words[i + 1]
            if s2 - e < 0.15 and len(w) + len(w2) <= 13:
                caps.append([s, e2, f"{w} {w2}"]); i += 2; continue
        caps.append([s, e, w]); i += 1
    return caps

if __name__ == "__main__":
    pos = [a for a in sys.argv[1:] if not a.startswith("--") and sys.argv[sys.argv.index(a) - 1] not in ("--script", "--out", "--accent", "--early")]
    src = pos[0] if pos else next((p for p in ("work/words.json", "work/whisper.json") if os.path.exists(p)), None)
    if not src: sys.exit("no word timings: run timing.py first (work/words.json)")
    out = arg("--out", "work/text.json"); early = int(arg("--early", 1))
    accents = {norm(a) for a in (arg("--accent", "") or "").split(",") if a.strip()}
    words = load_words(src)
    if arg("--script"): words = respell(words, open(arg("--script")).read())
    caps = group(words)
    # very fast words (shorter than 5 frames on screen) merge with the next one when the pair is short: no flicker
    k = 0
    while k + 1 < len(caps):
        if (caps[k + 1][0] - caps[k][0]) * FPS < 5 and len(caps[k][2]) + len(caps[k + 1][2]) <= 15 and not re.search(r"[.!?]$", caps[k][2]):
            caps[k] = [caps[k][0], caps[k + 1][1], caps[k][2] + " " + caps[k + 1][2]]; del caps[k + 1]
        else: k += 1
    res = []
    for k, (s, e, w) in enumerate(caps):
        f0 = max(0, round(s * FPS) - early)
        nxt = round(caps[k + 1][0] * FPS) - early if k + 1 < len(caps) else None
        f1 = nxt if nxt is not None and caps[k + 1][0] - e <= 0.35 else round(e * FPS) + 8
        f1 = max(f1, f0 + 4)                     # readable for at least 4 frames
        if nxt is not None: f1 = min(f1, nxt)    # ...but never overlapping the next caption
        c = {"from": f0, "to": f1, "text": w}
        if any(norm(x) in accents for x in w.split()): c["accent"] = True
        res.append(c)
    tj = json.load(open(out)) if os.path.exists(out) else {"overlays": []}
    tj["captions"] = res; tj["captionStyle"] = "word-en"
    json.dump(tj, open(out, "w"), indent=1, ensure_ascii=False)
    print(f"{len(res)} captions from {len(words)} words -> {out}")
    print(" ".join(f"[{c['from']}]{c['text']}" for c in res[:40]) + (" ..." if len(res) > 40 else ""))
