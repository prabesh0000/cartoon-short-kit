# Adds optional pose/prop/back-view hooks to bodyFront in web/toonbase.js. Backward compatible:
# nothing changes unless a caller passes one of these options.
#   armFn(ctx)      push your own arms into ctx.arms (see engine/nepal.js: POSES + armBlend)
#   behind(ctx)     draw behind the arms/torso (capes, bows, spears)
#   front(ctx)      draw in front of the body (shields, lamps, sheathed blades)
#   headExtra(ctx)  draw on the head with its rotation active (crowns, helmets, topi, back-of-head hair)
#   back: true      skip the face (back view)
# Also: a seated character (mode "sit") uses armFn when one is given (before, sit always forced hanging arms).
# Whitespace-tolerant: works on the plain and the reformatted ("transform") type-stripped output.
import re, sys
p = sys.argv[1]; s = open(p).read()
SIT = (r'if \(mode === "sit"\) for \(const side of \[-1, 1\]\) arms\.push', 'if (mode === "sit" && !opts.armFn) for (const side of [-1, 1]) arms.push')
if "opts.armFn" in s:
    s, n = re.subn(SIT[0], SIT[1], s, count=1)
    if n: open(p, "w").write(s); print("sit armFn fix applied")
    print("toon hooks already present"); sys.exit(0)
R = [
 (r'\n(\s*)else \{\n(\s*)arms\.push\(\{\s*pts: prop === "shako"',
  lambda m: f'\n{m[1]}else if (opts.armFn) {{ opts.armFn({{ sh, tcx, T, HH, u, chin, torsoBot, hang, sw, arms, crown, hc, W, hipY }}); }}' + m[0]),
 (r'\n(\s*)for \(const a of arms\)\s*if \(!a\.front\) drawArm\(a\);',
  lambda m: f'\n{m[1]}if (opts.behind) opts.behind({{ p, tcx, T, HH, u, chin, torsoBot, hipY, crown, hc, W, sole, sw }});' + m[0]),
 (r'\n(\s*)if \(prop === "shako"\) \{',
  lambda m: f'\n{m[1]}if (opts.front) opts.front({{ p, tcx, T, HH, u, chin, torsoBot, hipY, crown, hc, W, sole, arms, tp }});' + m[0]),
 (r'\n(\s*)hatOn\(p, o, hp, H, 300, hc, light, seed, facing, false\);',
  lambda m: m[0] + f'\n{m[1]}if (opts.headExtra) opts.headExtra({{ p, cx: 300, hc, H, W, u, crown, HH, hp, thick, ow, light }});'),
 (r'\n(\s*)faceFront\(p, 300, hc, W, expr', lambda m: f'\n{m[1]}if (!opts.back) faceFront(p, 300, hc, W, expr'),
]
ok = 0
for pat, rep in R:
    s, n = re.subn(pat, rep, s, count=1)
    if n != 1: print("WARN: toon hook anchor not found:", pat[:60])
    ok += n
s, n = re.subn(SIT[0], SIT[1], s, count=1)
if n != 1: print("WARN: sit arms anchor not found")
open(p, "w").write(s); print(f"toon hooks added ({ok}/5)" + (", sit armFn fix" if n else ""))
if ok != 5: sys.exit(1)
