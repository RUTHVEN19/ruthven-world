/**
 * Capture the Mini Manga Machine cabinet as a still — used as the token's
 * thumbnail/display image on Objkt, so the grid shows the machine itself.
 *
 * Screenshots the real artifact (the same HTML that gets minted), so the
 * thumbnail can never drift from the artwork.
 *
 * Usage: node scripts/shoot-machine-thumbnail.mjs <slug> [state]
 *        state = porcelain (default) | reveal
 */
import puppeteer from '../frontend/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const slug = process.argv[2] || 'neon-graffiti-girl';
const state = process.argv[3] || 'porcelain';
const DIR = path.join(ROOT, 'artifacts', slug);
if (!fs.existsSync(DIR)) { console.error('no artifact at', DIR); process.exit(1); }

const MIME = { '.html': 'text/html', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4' };
const server = http.createServer((req, res) => {
  const f = path.join(DIR, decodeURIComponent(req.url.split('?')[0]).replace(/^\//, '') || 'index.html');
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});

await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await puppeteer.launch({ args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
// tall portrait viewport at 2x so the cabinet is captured crisply
await page.setViewport({ width: 760, height: 1180, deviceScaleFactor: 2 });
await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'networkidle0' });

// let the images decode and the neon settle
await page.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? 1 : i.decode().catch(() => {})))));
await new Promise((r) => setTimeout(r, 1200));

if (state === 'reveal') {
  await page.evaluate(() => document.getElementById('lever').click());
  await page.evaluate(() => new Promise((res) => {
    const v = document.getElementById('vid');
    const go = () => { if (v.duration) v.currentTime = Math.max(0, v.duration - 0.05); };
    setTimeout(go, 3600);
    const t = setInterval(() => { if (document.body.dataset.state === 'manga' &&
      document.getElementById('rewards').classList.contains('on')) { clearInterval(t); res(); } }, 400);
    setTimeout(() => { clearInterval(t); res(); }, 30000);
  }));
  await new Promise((r) => setTimeout(r, 1500));
}

const el = await page.$('#cab');
const box = await el.boundingBox();
const pad = 26;                       // keep a little of the neon glow around it
const clip = {
  x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad),
  width: box.width + pad * 2, height: box.height + pad * 2,
};
const out = path.join(DIR, `machine-${state}.png`);
await page.screenshot({ path: out, clip, omitBackground: false });

await browser.close();
server.close();

const { size } = fs.statSync(out);
console.log(`  captured ${path.basename(out)}  ${Math.round(clip.width * 2)}×${Math.round(clip.height * 2)}  ${(size / 1024).toFixed(0)} KB`);
