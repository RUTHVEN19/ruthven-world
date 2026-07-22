/**
 * Load an artifact inside an iframe sandboxed EXACTLY as Objkt does
 * (allow-scripts allow-downloads — note: no allow-same-origin) and report
 * whether the images and, crucially, the VIDEO actually play.
 */
import puppeteer from '../frontend/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = process.argv[2];
if (!file || !fs.existsSync(file)) { console.error('usage: node test-in-objkt-sandbox.mjs <artifact.html>'); process.exit(1); }

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/artifact')) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return fs.createReadStream(file).pipe(res);
  }
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`<!doctype html><body style="margin:0">
    <iframe id="f" src="/artifact" sandbox="allow-scripts allow-downloads"
      style="width:800px;height:1200px;border:0"></iframe></body>`);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const b = await puppeteer.launch({ args: ['--no-sandbox', '--mute-audio'] });
const p = await b.newPage();
await p.setViewport({ width: 900, height: 1250 });
await p.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 4000));

const frame = p.frames().find((f) => f.url().includes('/artifact'));
if (!frame) { console.log('  could not reach the sandboxed frame'); await b.close(); server.close(); process.exit(1); }

const before = await frame.evaluate(() => ({
  imgsOk: [...document.images].every((i) => i.naturalWidth > 0),
  videoSrcKind: (document.getElementById('vid')?.getAttribute('src') || '').slice(0, 12),
  readyState: document.getElementById('vid')?.readyState,
  err: document.getElementById('vid')?.error?.code ?? null,
}));

// pull the lever, then see whether the film actually runs
const box = await (await frame.$('#lever')).boundingBox();
const fEl = await p.$('#f');
const fBox = await fEl.boundingBox();
await p.mouse.click(fBox.x + box.x + box.width / 2, fBox.y + box.y + box.height / 2);
await new Promise((r) => setTimeout(r, 6000));
const after = await frame.evaluate(() => {
  const v = document.getElementById('vid');
  return { state: document.body.dataset.state, readyState: v?.readyState,
           currentTime: +(v?.currentTime || 0).toFixed(2), paused: v?.paused,
           err: v?.error?.code ?? null, muted: v?.muted };
});

console.log('  BEFORE lever:', JSON.stringify(before));
console.log('  AFTER  lever:', JSON.stringify(after));
console.log(after.currentTime > 0.3 ? '  ✅ VIDEO IS PLAYING' : '  ❌ VIDEO NOT PLAYING');
await b.close(); server.close();
