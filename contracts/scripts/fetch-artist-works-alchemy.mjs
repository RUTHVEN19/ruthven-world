// fetch-artist-works-alchemy.mjs
// Same job as the OpenSea version, but via Alchemy (free, instant API key, no
// approval queue). Pulls EVERY NFT minted by the artist — both mints to her
// wallet AND every token on contracts she created (catches lazy mints) — derives
// the year from the mint timestamp, and writes a by-year catalogue to
// frontend/src/config/artistWorks.json.
//
// Setup:
//   1. Sign up free at alchemy.com, create an App, copy the API key.
//   2. Put ALCHEMY_API_KEY=... in contracts/.env  (one key works for all chains).
//
// Usage:
//   node scripts/fetch-artist-works-alchemy.mjs 0xWALLET [0xWALLET2 ...]
//
// Reuses contracts/artist-exclude.json (editions/projects to skip) and
// contracts/artist-contracts.json (extra contracts she created to enumerate).

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_KEY = process.env.ALCHEMY_API_KEY;
const WALLETS = process.argv.slice(2).map(w => w.toLowerCase());
const ZERO = '0x0000000000000000000000000000000000000000';
// chain key -> Alchemy network subdomain
const NETWORKS = { ethereum: 'eth-mainnet', base: 'base-mainnet', matic: 'polygon-mainnet' };
const OUT = path.resolve(__dirname, '../../frontend/src/config/artistWorks.json');
const CONTRACTS_FILE = path.resolve(__dirname, '../artist-contracts.json');
const EXCLUDE_FILE = path.resolve(__dirname, '../artist-exclude.json');

const loadList = file => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return []; } };
const EXCLUDE = new Set(loadList(EXCLUDE_FILE).map(c => `${c.chain}|${c.address.toLowerCase()}`));

if (!API_KEY) { console.error('Set ALCHEMY_API_KEY (env or contracts/.env)'); process.exit(1); }
if (WALLETS.length === 0) { console.error('Pass at least one wallet address'); process.exit(1); }

const sleep = ms => new Promise(r => setTimeout(r, ms));
const rpcUrl = chain => `https://${NETWORKS[chain]}.g.alchemy.com/v2/${API_KEY}`;
const nftUrl = chain => `https://${NETWORKS[chain]}.g.alchemy.com/nft/v3/${API_KEY}`;

async function post(url, body) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'accept': 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.status === 429) { await sleep(1500 * (attempt + 1)); continue; }
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  }
  throw new Error(`Rate limited repeatedly: ${url}`);
}

async function getJSON(url) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (res.status === 429) { await sleep(1500 * (attempt + 1)); continue; }
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
    return res.json();
  }
  throw new Error(`Rate limited repeatedly: ${url}`);
}

// Mints = ERC-721/1155 transfers FROM the zero address. Filter by `toAddress`
// (mints to her wallet) or `contractAddresses` (every mint on her contracts).
async function getMintTransfers(chain, { toAddress, contractAddresses }) {
  const out = new Map(); // contract|tokenId -> mintedAt(ms)
  let pageKey;
  do {
    const params = {
      fromBlock: '0x0', toBlock: 'latest', fromAddress: ZERO,
      // 'specialnft' catches the original SuperRare contract (0x41a322…8850d) and
      // other non-standard early NFTs that Alchemy doesn't classify as erc721.
      category: ['erc721', 'erc1155', 'specialnft'], withMetadata: true,
      excludeZeroValue: false, maxCount: '0x3e8', order: 'asc',
    };
    if (toAddress) params.toAddress = toAddress;
    if (contractAddresses) params.contractAddresses = contractAddresses;
    if (pageKey) params.pageKey = pageKey;

    let data;
    try {
      data = await post(rpcUrl(chain), {
        id: 1, jsonrpc: '2.0', method: 'alchemy_getAssetTransfers', params: [params],
      });
    } catch (e) { console.warn(`  ! ${chain}: ${e.message}`); break; }

    const result = data.result || {};
    for (const t of result.transfers || []) {
      const contract = (t.rawContract?.address || '').toLowerCase();
      if (!contract) continue;
      if (EXCLUDE.has(`${chain}|${contract}`)) continue;
      let tokenId = t.tokenId || t.erc721TokenId ||
        (t.erc1155Metadata && t.erc1155Metadata[0]?.tokenId);
      if (tokenId == null) continue;
      tokenId = BigInt(tokenId).toString(); // hex -> decimal string
      const ts = t.metadata?.blockTimestamp ? Date.parse(t.metadata.blockTimestamp) : null;
      const key = `${contract}|${tokenId}`;
      if (!out.has(key)) out.set(key, { chain, contract, tokenId, mintedAt: ts });
    }
    pageKey = result.pageKey;
    await sleep(200);
  } while (pageKey);
  return out;
}

async function fetchMeta(chain, contract, tokenId) {
  const url = `${nftUrl(chain)}/getNFTMetadata?contractAddress=${contract}&tokenId=${tokenId}&refreshCache=false`;
  try { return await getJSON(url); } catch (e) { console.warn(`  ! meta ${contract}/${tokenId}: ${e.message}`); return null; }
}

async function main() {
  const all = new Map();

  // Pass 1 — mints to her wallet(s), every chain.
  for (const wallet of WALLETS) {
    for (const chain of Object.keys(NETWORKS)) {
      console.log(`Scanning mints to ${wallet} on ${chain}…`);
      const m = await getMintTransfers(chain, { toAddress: wallet });
      for (const [k, v] of m) if (!all.has(`${chain}|${k}`)) all.set(`${chain}|${k}`, v);
      console.log(`  +${m.size}`);
    }
  }

  // Pass 2 — every mint on contracts she created (catches lazy mints to buyers).
  for (const c of loadList(CONTRACTS_FILE)) {
    if (EXCLUDE.has(`${c.chain}|${c.address.toLowerCase()}`)) continue;
    console.log(`Enumerating contract ${c.address} on ${c.chain}…`);
    const m = await getMintTransfers(c.chain, { contractAddresses: [c.address] });
    for (const [k, v] of m) if (!all.has(`${c.chain}|${k}`)) all.set(`${c.chain}|${k}`, v);
    console.log(`  +${m.size}`);
  }

  // Per-contract counts — spot any edition contract that should be EXCLUDEd.
  const byContract = {};
  for (const m of all.values()) {
    const k = `${m.chain}|${m.contract}`;
    byContract[k] = (byContract[k] || 0) + 1;
  }
  console.log('\nTokens per contract (watch for editions to exclude):');
  for (const [k, n] of Object.entries(byContract).sort((a, b) => b[1] - a[1]))
    console.log(`  ${n.toString().padStart(5)}  ${k}`);

  console.log(`\nFetching metadata for ${all.size} tokens…`);
  const works = [];
  let i = 0;
  for (const m of all.values()) {
    i++;
    const meta = await fetchMeta(m.chain, m.contract, m.tokenId);
    await sleep(150);
    if (!meta) continue;
    const year = m.mintedAt ? new Date(m.mintedAt).getUTCFullYear() : null;
    const img = meta.image || {};
    works.push({
      id: `${m.chain}-${m.contract}-${m.tokenId}`,
      title: meta.name || meta.raw?.metadata?.name || `Untitled #${m.tokenId}`,
      year,
      mintedAt: m.mintedAt,
      chain: m.chain,
      contract: m.contract,
      tokenId: m.tokenId,
      image: img.cachedUrl || img.originalUrl || meta.raw?.metadata?.image || '',
      // Alchemy's pre-resized small image — used for the grid so giant full-res
      // originals (some 10MB+) don't have to be thumbnailed on the fly / break.
      thumbnail: img.thumbnailUrl || img.pngUrl || '',
      animation: meta.raw?.metadata?.animation_url || '',
      collection: meta.collection?.name || meta.contract?.name || '',
      description: meta.description || meta.raw?.metadata?.description || '',
      openseaUrl: `https://opensea.io/assets/${m.chain === 'ethereum' ? 'ethereum' : m.chain}/${m.contract}/${m.tokenId}`,
      edition: '1/1',
    });
    if (i % 10 === 0) console.log(`  ${i}/${all.size}`);
  }

  works.sort((a, b) => (b.mintedAt || 0) - (a.mintedAt || 0));
  fs.writeFileSync(OUT, JSON.stringify(works, null, 2));
  const years = [...new Set(works.map(w => w.year).filter(Boolean))].sort((a, b) => b - a);
  console.log(`\nWrote ${works.length} works to ${OUT}`);
  console.log(`Years: ${years.join(', ')}`);
}

main().catch(e => { console.error(e); process.exit(1); });
