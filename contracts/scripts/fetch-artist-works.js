// fetch-artist-works.js
// Pulls EVERY NFT minted by an artist wallet (including pieces since sold) from
// the OpenSea API, derives the year from the mint timestamp, and writes a clean
// by-year catalogue to frontend/src/config/artistWorks.json.
//
// Usage:
//   OPENSEA_API_KEY=xxxxx node scripts/fetch-artist-works.js 0xWALLET [0xWALLET2 ...]
//
// Notes:
//   - Requires Node 18+ (uses global fetch).
//   - A "mint" is a transfer event whose from_address is the zero address.
//   - Supports multiple chains; add/remove in CHAINS below.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_KEY = process.env.OPENSEA_API_KEY;
const WALLETS = process.argv.slice(2).map(w => w.toLowerCase());
const ZERO = '0x0000000000000000000000000000000000000000';
const CHAINS = ['ethereum', 'base', 'matic']; // marketplaces she's likely minted on
const OUT = path.resolve(__dirname, '../../frontend/src/config/artistWorks.json');
const BASE = 'https://api.opensea.io/api/v2';

if (!API_KEY) { console.error('Set OPENSEA_API_KEY'); process.exit(1); }
if (WALLETS.length === 0) { console.error('Pass at least one wallet address'); process.exit(1); }

const headers = { 'accept': 'application/json', 'x-api-key': API_KEY };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getJSON(url) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, { headers });
    if (res.status === 429) { await sleep(1500 * (attempt + 1)); continue; }
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
    return res.json();
  }
  throw new Error(`Rate limited repeatedly: ${url}`);
}

// 1. Collect mint events (from zero address) for each wallet+chain.
async function collectMints(wallet, chain) {
  const mints = new Map(); // key: contract|tokenId -> { mintedAt }
  let next = '';
  do {
    const url = `${BASE}/events/accounts/${wallet}?chain=${chain}` +
                `&event_type=transfer&limit=50${next ? `&next=${next}` : ''}`;
    let data;
    try { data = await getJSON(url); } catch (e) { console.warn(`  ! ${chain}: ${e.message}`); break; }
    for (const ev of data.asset_events || []) {
      if ((ev.from_address || '').toLowerCase() !== ZERO) continue; // only mints
      const nft = ev.nft || {};
      if (!nft.contract || nft.identifier == null) continue;
      const key = `${chain}|${nft.contract.toLowerCase()}|${nft.identifier}`;
      if (!mints.has(key)) {
        mints.set(key, {
          chain,
          contract: nft.contract,
          tokenId: nft.identifier,
          mintedAt: ev.event_timestamp ? Number(ev.event_timestamp) * 1000 : null,
        });
      }
    }
    next = data.next || '';
    await sleep(250);
  } while (next);
  return mints;
}

// 2. Fetch full metadata for a token.
async function fetchToken(chain, contract, tokenId) {
  const url = `${BASE}/chain/${chain}/contract/${contract}/nfts/${tokenId}`;
  try {
    const data = await getJSON(url);
    return data.nft || null;
  } catch (e) {
    console.warn(`  ! token ${contract}/${tokenId}: ${e.message}`);
    return null;
  }
}

async function main() {
  const all = new Map();
  for (const wallet of WALLETS) {
    for (const chain of CHAINS) {
      console.log(`Scanning ${wallet} on ${chain}…`);
      const mints = await collectMints(wallet, chain);
      for (const [key, m] of mints) if (!all.has(key)) all.set(key, m);
      console.log(`  +${mints.size} mints`);
    }
  }

  console.log(`\nFetching metadata for ${all.size} tokens…`);
  const works = [];
  let i = 0;
  for (const m of all.values()) {
    i++;
    const nft = await fetchToken(m.chain, m.contract, m.tokenId);
    await sleep(250);
    if (!nft) continue;
    const year = m.mintedAt ? new Date(m.mintedAt).getUTCFullYear() : null;
    works.push({
      id: `${m.chain}-${m.contract}-${m.tokenId}`,
      title: nft.name || `Untitled #${m.tokenId}`,
      year,
      mintedAt: m.mintedAt,
      chain: m.chain,
      contract: m.contract,
      tokenId: m.tokenId,
      image: nft.display_image_url || nft.image_url || '',
      animation: nft.animation_url || '',
      collection: nft.collection || '',
      description: nft.description || '',
      openseaUrl: nft.opensea_url || '',
      edition: '1/1', // refine by hand where editions apply
    });
    if (i % 10 === 0) console.log(`  ${i}/${all.size}`);
  }

  // Sort newest first, group-friendly.
  works.sort((a, b) => (b.mintedAt || 0) - (a.mintedAt || 0));

  fs.writeFileSync(OUT, JSON.stringify(works, null, 2));
  const years = [...new Set(works.map(w => w.year).filter(Boolean))].sort((a, b) => b - a);
  console.log(`\nWrote ${works.length} works to ${OUT}`);
  console.log(`Years: ${years.join(', ')}`);
}

main().catch(e => { console.error(e); process.exit(1); });
