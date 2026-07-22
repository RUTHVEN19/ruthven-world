/**
 * Simulate the failure AL sees: video refuses to play. The transformation must
 * still happen via the frame fallback, and the machine must still reach the
 * reveal with the three cards.
 */
import puppeteer from '../frontend/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = process.argv[2];

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/artifact')) { res.writeHead(200,{'Content-Type':'text/html'}); return fs.createReadStream(file).pipe(res); }
  res.writeHead(200,{'Content-Type':'text/html'});
  res.end(`<!doctype html><body style="margin:0"><iframe id="f" src="/artifact" sandbox="allow-scripts allow-downloads" style="width:800px;height:1250px;border:0"></iframe></body>`);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const port = server.address().port;

const b = await puppeteer.launch({args:['--no-sandbox','--mute-audio']});
const p = await b.newPage();
await p.setViewport({width:900,height:1300});
await p.goto(`http://127.0.0.1:${port}/`,{waitUntil:'networkidle0'});
await new Promise(r=>setTimeout(r,3500));
const frame = p.frames().find(f=>f.url().includes('/artifact'));

// BREAK the video exactly as if the browser refused it
await frame.evaluate(() => {
  const v = document.getElementById('vid');
  v.play = () => Promise.reject(new Error('simulated: browser refuses to play'));
  Object.defineProperty(v, 'currentTime', { get: () => 0, set: () => {} });
});

const box = await (await frame.$('#lever')).boundingBox();
const fBox = await (await p.$('#f')).boundingBox();
await p.mouse.click(fBox.x + box.x + box.width/2, fBox.y + box.y + box.height/2);

// watch for the flipbook
await new Promise(r=>setTimeout(r,5000));   // past the 起動/処理中 intro
const during = await frame.evaluate(() => ({
  state: document.body.dataset.state,
  flipLayerOn: document.getElementById('l-flip')?.classList.contains('on'),
  flipHasImage: (document.getElementById('flipimg')?.src||'').startsWith('data:'),
  frameCount: (window.__FRAMES||[]).length,
}));

// let it run to the end
await new Promise(r=>setTimeout(r,20000));  // 90 frames @6fps = 15s + reveal
const after = await frame.evaluate(() => ({
  state: document.body.dataset.state,
  rewardsShown: document.getElementById('rewards')?.classList.contains('on'),
  status: document.getElementById('stext')?.textContent,
}));

console.log('  DURING:', JSON.stringify(during));
console.log('  AFTER :', JSON.stringify(after));
console.log(during.flipLayerOn && during.flipHasImage ? '  ✅ FALLBACK RAN — transformation still played' : '  ❌ fallback did not run');
console.log(after.rewardsShown ? '  ✅ reached the reveal with the three cards' : '  ❌ never reached the reveal');
await b.close(); server.close();
