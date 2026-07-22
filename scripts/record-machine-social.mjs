/**
 * Record the Manga Machine running, for social posts.
 * Captures the real artifact (the one that's minted), so what people see is
 * exactly what a collector gets.
 */
import puppeteer from '../frontend/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const URL_ = process.argv[2] || 'https://porcelainandroid.com/artifact/machine-final/index.html';
const out = path.join(ROOT, 'artifacts', 'social-manga-machine.webm');

const b = await puppeteer.launch({
  headless: 'shell' === 'never' ? false : true,
  args: ['--no-sandbox', '--mute-audio', '--autoplay-policy=no-user-gesture-required'],
});
const p = await b.newPage();
await p.setViewport({ width: 760, height: 1180, deviceScaleFactor: 2 });
await p.goto(URL_, { waitUntil: 'networkidle2' });

// let the film buffer so the recording never shows the fallback
await p.waitForFunction(() => document.getElementById('vid')?.readyState >= 3, { timeout: 60000 });
await new Promise((r) => setTimeout(r, 1500));

const rec = await p.screencast({ path: out });
await new Promise((r) => setTimeout(r, 2000));           // machine at rest
await p.evaluate(() => document.getElementById('lever').click());
await new Promise((r) => setTimeout(r, 25000));          // intro + film + reveal
await rec.stop();
await b.close();
console.log('  recorded →', path.relative(ROOT, out));
