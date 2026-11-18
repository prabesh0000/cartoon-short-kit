#!/usr/bin/env bash
# Creates a new short project:  bash tools/setup.sh <project_dir>
# Needs: node >= 22.6 (type stripping), python3 + numpy + Pillow, ffmpeg, Playwright Chromium
# (npm i -g playwright && npx playwright install chromium if missing).
# Uses the vendored three.js r160 and toon.ts in kit/vendor (no network). Falls back to npm / GitHub
# only if they are missing. The kit folder is treated as read-only.
set -e
KIT="$(cd "$(dirname "$0")/.." && pwd)"; P="${1:?project dir}"
node -e "const [a,b]=process.versions.node.split('.').map(Number); if(a<22||(a===22&&b<6)){console.error('node >= 22.6 needed (have '+process.versions.node+')');process.exit(1)}"
command -v ffmpeg >/dev/null || { echo "ffmpeg missing"; exit 1; }
python3 -c "import numpy, PIL" 2>/dev/null || echo "WARN: python3 needs numpy + Pillow (pip install numpy pillow --break-system-packages)"
mkdir -p "$P/web/lib" "$P/work" "$P/stills" "$P/out"
cp "$KIT"/engine/*.js "$KIT"/engine/index.html "$P/web/"
cp "$KIT"/example/soldier/story.js "$P/web/story.js"        # starting point: rewrite for the new story
cp "$KIT"/example/soldier/audio.py "$P/audio.py"            # starting point: rewrite the cue table
cp "$KIT"/tools/*.mjs "$KIT"/tools/*.py "$KIT"/tools/textlayer.js "$KIT"/tools/finish.sh "$P/"
# three.js r160 (module build): vendored, else npm, else a sparse git clone (works where only GitHub is reachable)
if [ -f "$KIT/vendor/three.module.js" ]; then cp "$KIT/vendor/three.module.js" "$P/web/lib/"
else
  ( cd /tmp && rm -rf _three && mkdir _three && cd _three && npm pack three@0.160.0 >/dev/null 2>&1 && tar xzf three-0.160.0.tgz && cp package/build/three.module.js "$P/web/lib/" ) \
  || ( cd /tmp && rm -rf _t3 && git clone -q --depth 1 --filter=blob:none --sparse --branch r160 https://github.com/mrdoob/three.js _t3 && cd _t3 && git sparse-checkout set build && cp build/three.module.js "$P/web/lib/" )
fi
# toon base: the Pen / head / face library from mromidev/claude-animated-shorts (MIT), types stripped
TOON="$KIT/vendor/toon.ts"
if [ ! -f "$TOON" ]; then rm -rf /tmp/_cas; git clone -q --depth 1 https://github.com/mromidev/claude-animated-shorts /tmp/_cas; TOON=/tmp/_cas/templates/bridge/toon.ts; fi
node -e "const m=require('node:module'),fs=require('fs');src=fs.readFileSync(process.argv[2],'utf8');let out;try{out=m.stripTypeScriptTypes(src,{mode:'transform'})}catch(e){out=m.stripTypeScriptTypes(src,{mode:'strip'})}fs.writeFileSync(process.argv[1],out)" "$P/web/toonbase.js" "$TOON" 2>/dev/null
[ -s "$P/web/toonbase.js" ] || { echo "toonbase.js empty: type stripping failed"; exit 1; }
python3 "$KIT/tools/patch_toon.py" "$P/web/toonbase.js"
cat "$P/web/toonbase.js" "$P/web/roman.js" "$P/web/nepal.js" "$P/web/mascot.js" "$P/web/manjushri.js" > "$P/web/toon.js"
# playwright: use a global install if there is one
mkdir -p "$P/node_modules"; [ -e "$P/node_modules/playwright" ] || ln -sf "$(npm root -g)/playwright" "$P/node_modules/playwright"
[ -e "$P/node_modules/playwright/package.json" ] || echo "WARN: playwright not found globally (npm i -g playwright && npx playwright install chromium)"
echo "ready: $P   (after editing cast code run: cat web/toonbase.js web/roman.js web/nepal.js web/mascot.js web/manjushri.js > web/toon.js)"
