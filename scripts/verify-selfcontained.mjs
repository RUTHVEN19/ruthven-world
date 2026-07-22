import puppeteer from '../frontend/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const slug = process.argv[2] || 'neon-graffiti-girl';
const file = path.join(ROOT, 'artifacts', `${slug}-selfcontained`, 'index.html');

const b = await puppeteer.launch({ args: ['--no-sandbox', '--mute-audio'] });
const p = await b.newPage();
await p.setViewport({ width: 760, height: 1180 });
// file:// is the harshest test — no server, no base URL, no relative resolution
await p.goto('file://' + file, { waitUntil: 'load' });
await new Promise((r) => setTimeout(r, 2500));
const res = await p.evaluate(() => ({
  imgsOk: [...document.images].every((i) => i.naturalWidth > 0),
  imgCount: document.images.length,
  imgWidths: [...document.images].map((i) => i.naturalWidth),
  videoReady: document.getElementById('vid')?.readyState,
  videoErr: document.getElementById('vid')?.error?.code ?? null,
  externalRefs: [...document.querySelectorAll('[src]')].filter((e) => !e.getAttribute('src').startsWith('data:')).length,
}));
console.log(JSON.stringify(res, null, 1));
await b.close();
