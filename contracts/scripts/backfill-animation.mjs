// backfill-animation.mjs
// The main fetch only read animation from `raw.metadata.animation_url`, so early
// video works (2019 SuperRare/KnownOrigin/Somnium etc.) came through with an
// empty `animation` and render as STILLS. This re-queries Alchemy for every work
// that currently has no animation, reads a BROADER set of animation fields
// (Alchemy's structured `animation.*`, the `media[]` array, and the raw
// metadata), and patches the animation URL back into artistWorks.json in place.
//
// Usage:
//   node scripts/backfill-animation.mjs            # all empty-animation works
//   node scripts/backfill-animation.mjs 2019       # only that mint year
//   node scripts/backfill-animation.mjs 2019 2020  # a set of years

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.ALCHEMY_API_KEY;
const OUT = path.resolve(__dirname, '../../frontend/src/config/artistWorks.json');
const NETWORKS = { ethereum: 'eth-mainnet', base: 'base-mainnet', matic: 'polygon-mainnet' };
const YEARS = process.argv.slice(2).map(Number).filter(Boolean);

if (!API_KEY) { console.error('Set ALCHEMY_API_KEY (env or contracts/.env)'); process.exit(1); }

const sleep = ms => new Promise(r => setTimeout(r, ms));
const nftUrl = chain => `https://${NETWORKS[chain]}.g.alchemy.com/nft/v3/${API_KEY}`;

async function getJSON(url) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (res.status === 429) { await sleep(1500 * (attempt + 1)); continue; }
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  }
  throw new Error(`Rate limited repeatedly: ${url}`);
}

// Pull an animation/video URL out of every place Alchemy can hide one.
function extractAnimation(meta) {
  const a = meta.animation || {};
  const raw = meta.raw?.metadata || {};
  // structured field (Alchemy v3), then raw metadata variants
  let url = a.cachedUrl || a.originalUrl || raw.animation_url || raw.animation || raw.animationUrl || '';
  // the media[] array — first entry whose mime/format is a video/animation
  if (!url && Array.isArray(meta.media)) {
    const vid = meta.media.find(m => /video|mp4|webm|gif/i.test(`${m?.mimeType || m?.format || ''}`) && (m?.gateway || m?.raw));
    if (vid) url = vid.gateway || vid.raw || '';
  }
  // some early works only carry the video under raw.metadata.media.uri (pixura)
  if (!url && raw.media?.uri) url = raw.media.uri;
  // don't treat the still image itself as an animation
  if (url && (url === meta.image?.cachedUrl || url === meta.image?.originalUrl)) url = '';
  return url || '';
}

async function main() {
  const works = JSON.parse(fs.readFileSync(OUT, 'utf8'));
  const targets = works.filter(w =>
    (!w.animation || w.animation === '') &&
    (YEARS.length === 0 || YEARS.includes(w.year))
  );
  console.log(`${targets.length} works with no animation${YEARS.length ? ` (years ${YEARS.join(', ')})` : ''} to check…`);

  let filled = 0, i = 0;
  for (const w of targets) {
    i++;
    const url = `${nftUrl(w.chain)}/getNFTMetadata?contractAddress=${w.contract}&tokenId=${w.tokenId}&refreshCache=true`;
    let meta;
    try { meta = await getJSON(url); } catch (e) { console.warn(`  ! ${w.contract}/${w.tokenId}: ${e.message}`); await sleep(150); continue; }
    const anim = extractAnimation(meta);
    if (anim) { w.animation = anim; filled++; console.log(`  + ${w.title} → ${anim.slice(0, 80)}`); }
    if (i % 20 === 0) console.log(`  …${i}/${targets.length} (${filled} filled)`);
    await sleep(150);
  }

  fs.writeFileSync(OUT, JSON.stringify(works, null, 2));
  console.log(`\nFilled ${filled} animation URLs. Wrote ${works.length} works to ${OUT}`);
}

main().catch(e => { console.error(e); process.exit(1); });
