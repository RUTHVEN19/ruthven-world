// prerender.mjs — bakes the Miss AL Simpson portfolio content routes into static
// HTML after `vite build`, so Google AND no-JS AI crawlers (GPTBot, ClaudeBot,
// PerplexityBot) read fully-formed pages instead of an empty <div id="root">.
//
// HOW IT WORKS
//   1. Serves the freshly built dist/ over a tiny local HTTP server (with SPA
//      fallback) so the real app — bundle, assets, fonts — runs exactly as in prod.
//   2. Loads each route in headless Chromium, waits for React to render and for
//      react-helmet-async to write the <head>, then captures the full HTML.
//   3. Writes dist/<route>/index.html. Netlify serves that static file first, so
//      crawlers get real HTML; the JS bundle then takes over for human visitors.
//
// SAFETY: this NEVER fails the build. If Chromium can't be installed/launched, or
// a single route errors, it logs a warning and the plain SPA still ships. That is
// why it's wired as a separate `build:seo` script, not the default `build`.
//
// Only PORTFOLIO content routes are listed — they render on any hostname (not
// domain-gated) and never auto-mount a WebGL canvas (the 3D gallery/cosmos are
// behind an explicit toggle), so they prerender cleanly and quickly.

import { createServer } from 'http';
import { readFile, writeFile, mkdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const PORT = 4185;

const ROUTES = [
  '/portfolio',
  '/portfolio/works',
  '/portfolio/originals',
  '/portfolio/projects',
  '/portfolio/exhibitions',
  '/portfolio/feed',
  '/portfolio/about',
  '/portfolio/cinema',
  '/portfolio/worlds',
];

// index.html carries Diamond Drones' static canonical/OG/JSON-LD (it's the default
// brand). On the prerendered missalsimpson.com pages those are wrong, and Helmet
// can't remove tags it didn't create — so it appends its correct ones alongside
// the stale ones (duplicate canonical/og). Strip the Diamond Drones static tags
// from the portfolio output; the Helmet-injected Miss AL Simpson tags stay.
function stripStaleSeo(html) {
  return html
    .replace(/\s*<link[^>]*rel="canonical"[^>]*href="https:\/\/diamonddrones\.world\/"[^>]*>/gi, '')
    .replace(/\s*<meta[^>]*(?:property|name)="(?:og:|twitter:)[^"]*"[^>]*content="[^"]*(?:diamonddrones|DIAMOND DRONES)[^"]*"[^>]*>/gi, '')
    // static Diamond Drones <meta name="description"> (the one WITHOUT Helmet's data-rh)
    .replace(/\s*<meta name="description" content="DIAMOND DRONES[^"]*"\s*>/gi, '')
    .replace(/\s*<script type="application\/ld\+json">[\s\S]*?(?:DIAMOND DRONES|Diamond Drones Genesis)[\s\S]*?<\/script>/gi, '');
}

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.webm': 'video/webm',
  '.mp3': 'audio/mpeg', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.txt': 'text/plain', '.map': 'application/json',
};

// Static server for dist/ with SPA fallback to index.html.
function serveDist() {
  return createServer(async (req, res) => {
    try {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      const filePath = join(DIST, urlPath);
      if (filePath.startsWith(DIST) && existsSync(filePath) && (await stat(filePath)).isFile()) {
        res.writeHead(200, { 'content-type': MIME[extname(filePath)] || 'application/octet-stream' });
        res.end(await readFile(filePath));
        return;
      }
      res.writeHead(200, { 'content-type': 'text/html' });
      res.end(await readFile(join(DIST, 'index.html')));
    } catch (e) {
      res.writeHead(500); res.end(String(e));
    }
  });
}

async function main() {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.warn('prerender: no dist/index.html — run `vite build` first. Skipping.');
    return;
  }

  let puppeteer;
  try {
    puppeteer = (await import('puppeteer')).default;
  } catch {
    console.warn('prerender: puppeteer not installed — skipping (plain SPA still ships).');
    return;
  }

  const server = serveDist();
  await new Promise(resolve => server.listen(PORT, resolve));

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
  } catch (e) {
    console.warn(`prerender: could not launch Chromium — skipping. ${e.message}`);
    server.close();
    return;
  }

  let ok = 0, failed = 0;
  for (const route of ROUTES) {
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 900 });
      // domcontentloaded (not networkidle) — the Works catalogue lazy-loads hundreds
      // of CDN images so the network never goes idle; React render is gated below.
      await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      // Wait until React has rendered real content into #root.
      await page.waitForFunction(() => {
        const root = document.getElementById('root');
        return root && root.children.length > 0 && document.querySelector('h1, h2, main, section');
      }, { timeout: 20000 }).catch(() => {});
      // Brief settle so react-helmet-async finishes writing the <head>.
      await new Promise(r => setTimeout(r, 500));
      const html = stripStaleSeo(await page.content());
      const outDir = route === '/' ? DIST : join(DIST, route.replace(/^\//, ''));
      await mkdir(outDir, { recursive: true });
      await writeFile(join(outDir, 'index.html'), html);
      await page.close();
      ok++;
      console.log(`prerender ✓ ${route}`);
    } catch (e) {
      failed++;
      console.warn(`prerender ✗ ${route}: ${e.message}`);
    }
  }

  await browser.close();
  server.close();
  console.log(`prerender done — ${ok} ok, ${failed} failed.`);
}

main().catch(e => {
  // Never break the build — a prerender failure must still leave a deployable SPA.
  console.warn(`prerender: unexpected error, skipping. ${e.message}`);
});
