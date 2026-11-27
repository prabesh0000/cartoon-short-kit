// usage: node render.mjs <outdir> <frames: "a-b" or "1,2,3"> [step] [quality]
import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path'; import crypto from 'crypto';
const [,, outdir, spec, step = '1', qual = '0.96'] = process.argv;
fs.mkdirSync(outdir, { recursive: true });
let frames = [];
for (const part of spec.split(',')) { if (part.includes('-')) { const [a, b] = part.split('-').map(Number); for (let f = a; f <= b; f += +step) frames.push(f); } else frames.push(+part); }
const root = process.env.WEB || path.resolve('web');
const srv = http.createServer((q, s) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : 'text/html' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise(r => srv.on('listening', r));
// GL=gpu (default on macOS: Metal via ANGLE) or GL=swiftshader (CPU, works everywhere). CHROME=/path/to/chrome to use another browser.
const GL = process.env.GL || (process.platform === 'darwin' ? 'gpu' : 'swiftshader');
const launchOpts = GL === 'gpu'
  ? { channel: 'chromium', args: ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', process.platform === 'darwin' ? '--use-angle=metal' : '--use-angle=gl'] }
  : { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] };
if (process.env.CHROME) { delete launchOpts.channel; launchOpts.executablePath = process.env.CHROME; }
const b = await chromium.launch(launchOpts);
const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
pg.on('console', m => console.log('PAGE', m.text())); pg.on('pageerror', e => console.log('ERR', e.message));
await pg.goto(`http://localhost:${srv.address().port}/index.html${process.env.HASH||""}`);
await pg.waitForFunction(() => window.ready || window.err, null, { timeout: 180000 });
if (await pg.evaluate(() => window.err)) { console.log('page error'); process.exit(1); }
// ---- post layer (tools/post.js): whip motion blur + glow, on when work/post.json exists ----
const POSTCFG = path.resolve(process.env.POSTCFG || 'work/post.json');
const localOrKit = (n) => [path.resolve(n), new URL('./' + n, import.meta.url).pathname].find((p) => fs.existsSync(p));
let postOn = fs.existsSync(POSTCFG) && process.env.NOPOST !== '1';
if (postOn) {
  const pp = localOrKit('post.js');
  if (!pp) { console.log('WARN: post.js missing, rendering without post'); postOn = false; }
  else { await pg.addScriptTag({ content: fs.readFileSync(pp, 'utf8') }); await pg.evaluate((c) => window.POST.init(c), JSON.parse(fs.readFileSync(POSTCFG, 'utf8')));
    const c = JSON.parse(fs.readFileSync(POSTCFG, 'utf8')); console.log(`POST blur ranges ${(c.blur || []).length}, glow ranges ${(c.glow || []).length}`); }
}
// ---- text layer (guides/caption-style.md): on when work/text.json exists, or TEXT=path ----
const TEXT = path.resolve(process.env.TEXT || 'work/text.json'), CAPPLAN = path.resolve('work/capplan.json'), PLAN = path.resolve('work/textplan.json'), REPORT = path.resolve('work/text_report.json');
let textOn = fs.existsSync(TEXT) && process.env.NOTEXT !== '1';
if (textOn) {
  const tlPath = [path.resolve('textlayer.js'), new URL('./textlayer.js', import.meta.url).pathname].find((p) => fs.existsSync(p));
  if (!tlPath) { console.log('WARN: textlayer.js missing, rendering without text'); textOn = false; }
  else {
    await pg.addScriptTag({ content: fs.readFileSync(tlPath, 'utf8') });
    await pg.evaluate(async () => { for (const f of ['700 76px "Kohinoor Devanagari"', '700 76px "Devanagari Sangam MN"', '700 76px "Noto Sans Devanagari"']) { try { await document.fonts.load(f, 'अ'); } catch (e) {} } });
    const textJson = JSON.parse(fs.readFileSync(TEXT, 'utf8')), overlays = textJson.overlays || [], caps = textJson.captions || [];
    if (caps.length) await pg.evaluate(async () => { for (const f of ['800 84px "Avenir Next"', '800 84px "Helvetica Neue"']) { try { await document.fonts.load(f, 'Ag'); } catch (e) {} } });
    // re-plan when the text or the story (positions, protected cards) changes
    const storyHash = ['story.js', 'main.js'].map((n) => path.join(root, n)).filter((p) => fs.existsSync(p)).map((p) => crypto.createHash('md5').update(fs.readFileSync(p)).digest('hex')).join('');
    const sig = JSON.stringify(overlays) + storyHash;
    let plan = fs.existsSync(PLAN) ? JSON.parse(fs.readFileSync(PLAN, 'utf8')) : null;
    if (!plan || plan.sig !== sig || process.env.REPLAN) {
      // plan pass: sample start / middle / end of every overlay, choose a free, calm slot and colours for it
      plan = { sig, items: {} }; const report = [];
      const placed = [];
      for (const ov of [...overlays].sort((a, b) => a.from - b.from)) {
        const samples = [...new Set([ov.from + 6, Math.round((ov.from + ov.to) / 2), ov.to - 3].map((f) => Math.max(ov.from, Math.min(ov.to - 1, f))))];
        let pick = null;
        for (const k of [1, 0.9, 0.8]) {
          const per = [];
          for (const f of samples) per.push(await pg.evaluate(([f, ov, k]) => { window.renderFrame(f); const pr = window.protectRects ? window.protectRects(f) : []; return window.TL.analyze(ov, k, pr); }, [f, ov, k]));
          const cands = per[0].map((c, i) => {
            const all = per.map((p) => p[i]), overlap = Math.max(...all.map((a) => a.overlap)), busy = all.reduce((s, a) => s + a.busy, 0) / all.length;
            const clash = placed.some((p) => p.from < ov.to && ov.from < p.to && !(c.rect[1] + c.rect[3] < p.rect[1] || p.rect[1] + p.rect[3] < c.rect[1]));
            const mean = [0, 1, 2].map((j) => all.reduce((s, a) => s + a.mean[j], 0) / all.length), sd = Math.max(...all.map((a) => a.sd));
            const pref = ov.y ?? (ov.kind === 'beat' ? 1380 : 380);
            return { ...c, overlap, busy, mean, sd, clash, score: busy * 4 + Math.abs(c.cy - pref) / 1920 };
          });
          const ok = cands.filter((c) => c.overlap === 0 && !c.clash).sort((a, b) => a.score - b.score);
          if (ok.length) { pick = { ...ok[0], scale: k }; break; }
          if (k === 0.8) pick = { ...cands.filter((c) => !c.clash).concat(cands).sort((a, b) => a.overlap - b.overlap || a.score - b.score)[0], scale: k, blocked: true };
        }
        const col = await pg.evaluate(([m, sd, plateWanted]) => window.TL.colours(m, sd, plateWanted), [pick.mean, pick.sd, ov.kind !== 'hook' || !!ov.plate]);
        plan.items[ov.id] = { rect: pick.rect, scale: pick.scale, ...col };
        placed.push({ from: ov.from, to: ov.to, rect: pick.rect });
        report.push({ id: ov.id, text: ov.text, frames: `${ov.from}-${ov.to}`, y: Math.round(pick.rect[1] + pick.rect[3] / 2), scale: pick.scale, mode: col.mode, plate: !!col.plate, plateAlpha: col.alpha, contrast: col.contrast, accentContrast: col.accentContrast, coversProtected: !!pick.blocked });
      }
      fs.mkdirSync(path.dirname(PLAN), { recursive: true }); fs.writeFileSync(PLAN, JSON.stringify(plan, null, 1));
      fs.writeFileSync(REPORT, JSON.stringify({ overlays: report, frameWarnings: [] }, null, 1));
      for (const r of report) console.log(`TEXT ${r.id.padEnd(10)} y=${r.y} ${r.mode}${r.plate ? ' plate ' + r.plateAlpha : ''} contrast ${r.contrast}/${r.accentContrast}${r.scale < 1 ? ' scale ' + r.scale : ''}${r.coversProtected ? '  !! COVERS A PROTECTED CARD' : ''}`);
    }
    // caption plan: one slot per caption (sampled at its middle frame), kept steady unless something must not be covered
    let capPlan = {};
    if (caps.length) {
      const csig = JSON.stringify(caps) + sig + crypto.createHash('md5').update(fs.readFileSync(tlPath)).update(fs.readFileSync(new URL(import.meta.url).pathname)).digest('hex');
      const old = fs.existsSync(CAPPLAN) ? JSON.parse(fs.readFileSync(CAPPLAN, 'utf8')) : null;
      if (old && old.sig === csig && !process.env.REPLAN) capPlan = old.items;
      else {
        let prevY = null, moved = 0, blocked = [];
        for (const [i, c] of caps.entries()) {
          const mid = Math.round((c.from + c.to - 1) / 2);
          const fr = [...new Set([c.from, mid, Math.max(c.from, c.to - 1)])];   // camera may move during the word: protect the union
          const r = await pg.evaluate(([fr, c, items, overlays, prevY]) => { const pr = [], busy = [];
            for (const f of fr) { window.renderFrame(f); if (window.protectRects) pr.push(...window.protectRects(f));
              busy.push(...overlays.filter((o) => f >= o.from && f < o.to && items[o.id]).map((o) => items[o.id].rect)); }
            return window.TL.capSlot(c, pr, busy, prevY); }, [fr, c, plan.items, overlays, prevY]);
          capPlan[i] = r; if (prevY != null && r.y !== prevY) moved++; prevY = r.y; if (r.blocked) blocked.push(`${c.from} "${c.text}"`);
        }
        fs.writeFileSync(CAPPLAN, JSON.stringify({ sig: csig, items: capPlan }, null, 0));
        const rep = fs.existsSync(REPORT) ? JSON.parse(fs.readFileSync(REPORT, 'utf8')) : { overlays: [], frameWarnings: [] };
        rep.captions = { count: caps.length, slotChanges: moved, blocked }; fs.writeFileSync(REPORT, JSON.stringify(rep, null, 1));
        console.log(`CAPTIONS ${caps.length} words, ${moved} slot changes${blocked.length ? `, !! ${blocked.length} BLOCKED: ${blocked.slice(0, 6).join(', ')}` : ''}`);
      }
    }
    await pg.evaluate(([o, p, c, cp]) => window.TL.init(o, p, c, cp), [overlays, plan.items, caps, capPlan]);
  }
}
const t0 = Date.now();
for (const f of frames) {
  if (process.env.RESUME && fs.existsSync(path.join(outdir, `f${String(f).padStart(4, '0')}.jpg`))) continue;
  const d = await pg.evaluate(([f, q, textOn]) => { if (window.location.hash==="#nd") window.DEBUG_ND=1; if (window.location.hash==="#e") window.DEBUG_E=1; const src = window.POST ? window.POST.frame(f) : (window.renderFrame(f), document.getElementById('c'));
    if (textOn && window.TL && window.TL.ready) return window.TL.compose(f, q, window.protectRects ? window.protectRects(f) : []);
    return src.toDataURL('image/jpeg', q); }, [f, +qual, textOn]);
  fs.writeFileSync(path.join(outdir, `f${String(f).padStart(4, '0')}.jpg`), Buffer.from(d.split(',')[1], 'base64'));
}
if (textOn) { const w = await pg.evaluate(() => window.TL.warn); const rep = fs.existsSync(REPORT) ? JSON.parse(fs.readFileSync(REPORT, 'utf8')) : { overlays: [] };
  rep.frameWarnings = [...(rep.frameWarnings || []), ...w]; fs.writeFileSync(REPORT, JSON.stringify(rep, null, 1));
  if (w.length) console.log(`TEXT WARNING: text covers a protected card on ${w.length} frame(s), see work/text_report.json`); }
console.log(`done ${frames.length} frames, ${((Date.now() - t0) / frames.length / 1000).toFixed(2)} s/frame`);
await b.close(); srv.close();
