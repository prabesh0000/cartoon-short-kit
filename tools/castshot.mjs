import { chromium } from "playwright";
import http from "http"; import fs from "fs"; import path from "path";
const root = path.resolve("web"); const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split("?")[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { "content-type": f.endsWith(".js") || f.endsWith(".mjs") ? "text/javascript" : "text/html" }); r.end(d); }); }).listen(8765);
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 2400, height: 2000 } });
pg.on("console", (m) => console.log(m.text())); pg.on("pageerror", (e) => console.log("ERR", e.message));
await pg.goto("http://localhost:8765/cast.html"); await pg.waitForFunction("window.done", null, { timeout: 20000 }).catch(() => {});
await pg.waitForTimeout(500); await pg.screenshot({ path: process.argv[2] || "stills/cast.png" }); await b.close(); srv.close();
