#!/usr/bin/env python3
"""Frame-diff scan after a full render: finds pops, cameras inside geometry and moves that read as unplanned whips,
plus frozen spans.

Usage (inside a reel project):  python3 framediff.py [frames/] [--planned "120-131,402,655-660"]
- Mean abs diff of consecutive frames at 108x192 (grey). A spike = more than 6x the median.
- Planned = frames listed with --planned, plus every whip range in work/post.json "blur" (they are meant to be fast),
  plus a few frames around it. Unplanned spikes are listed: fix the move (shorter, linear, cut on a word) or add
  motion blur in post.json if the move is a deliberate whip.
- Frozen = a 0.4 s span (12 frames) whose first and last frames differ by under 0.35 (a slow creep adds up and passes;
  a real hold does not): add a creep, an idle or an effect.
"""
import glob, json, os, sys
import numpy as np
from PIL import Image

d = next((a for a in sys.argv[1:] if not a.startswith("--") and sys.argv[sys.argv.index(a) - 1] != "--planned"), "frames")
fs = sorted(glob.glob(os.path.join(d, "f*.jpg")))
if len(fs) < 3: sys.exit(f"no frames in {d}")
planned = set()
def add(a, b, pad=2):
    planned.update(range(a - pad, b + pad + 1))
if "--planned" in sys.argv:
    for part in sys.argv[sys.argv.index("--planned") + 1].split(","):
        if "-" in part: a, b = map(int, part.split("-")); add(a, b)
        elif part.strip(): add(int(part), int(part))
if os.path.exists("work/post.json"):
    for b in json.load(open("work/post.json")).get("blur", []): add(b["from"], b["to"])
prev, diffs, imgs = None, [], []
for f in fs:
    a = np.asarray(Image.open(f).convert("L").resize((108, 192)), np.float32)
    if prev is not None: diffs.append(float(np.abs(a - prev).mean()))
    prev = a; imgs.append(a)
diffs = np.array(diffs); med = max(0.3, float(np.median(diffs)))
first = int(os.path.basename(fs[0])[1:5])
spikes = [(first + i + 1, v) for i, v in enumerate(diffs) if v > 6 * med]
bad = [(f, v) for f, v in spikes if f not in planned]
frozen, i = [], 0
while i + 12 < len(imgs):
    if float(np.abs(imgs[i + 12] - imgs[i]).mean()) < 0.35 and max(diffs[i:i + 12]) < 0.25:
        frozen.append(first + i); i += 12
    else: i += 1
print(f"{len(fs)} frames, median diff {med:.2f}, spikes {len(spikes)} ({len(spikes) - len(bad)} planned)")
for f, v in bad: print(f"  UNPLANNED spike f{f}: {v:.1f} ({v / med:.0f}x median)")
for f in frozen: print(f"  FROZEN from f{f} (0.4 s+ with no motion)")
print("OK" if not bad and not frozen else "FIX the frames above (or mark deliberate whips in work/post.json)")
