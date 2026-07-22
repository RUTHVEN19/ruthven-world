/**
 * Companion airdrop — sends the three works (磁器 Porcelain, 漫画 Manga,
 * 変換 Transformation) to everyone who has collected a Mini Manga Machine.
 *
 * Reads the current holders straight from the chain, works out who is still
 * owed which companion, and batches FA2 transfers for signing in Temple.
 * Safe to run as often as you like — anyone already holding a companion is
 * skipped, so nobody is ever sent a duplicate.
 *
 * Config: airdrop-config.json (written after the editions are minted).
 */
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';

const RPC = 'https://rpc.tzkt.io/mainnet';
const TZKT = 'https://api.tzkt.io/v1';
const BATCH_SIZE = 20;               // transfers per operation

const $ = (id) => document.getElementById(id);
const log = (m, cls = '') => { const d = document.createElement('div'); if (cls) d.className = cls; d.textContent = m; $('log').appendChild(d); $('log').scrollTop = $('log').scrollHeight; };
const setStatus = (m) => ($('status').textContent = m);

let cfg = null;
let plan = [];                        // [{to, tokenId, label}]
const Tezos = new TezosToolkit(RPC);
const wallet = new BeaconWallet({ name: 'Mini Manga Machines — Airdrop', network: { type: 'mainnet' } });
Tezos.setWalletProvider(wallet);

(async () => {
  try {
    cfg = await (await fetch('./airdrop-config.json')).json();
    $('cCol').textContent = cfg.fa2;
    $('cArtist').textContent = cfg.artist;
    $('cCount').textContent = `machine #${cfg.machineTokenId} · ${cfg.companions.length} companions`;
    log(`Loaded config for ${cfg.fa2}`, 'ok');
  } catch (e) { log('Could not load airdrop-config.json: ' + (e.message || e), 'err'); }
})();

// everyone holding a given token, excluding the artist's own stock
async function holdersOf(tokenId) {
  const url = `${TZKT}/tokens/balances?token.contract=${cfg.fa2}&token.tokenId=${tokenId}`
            + `&balance.gt=0&limit=10000&select=account.address,balance`;
  const rows = await (await fetch(url)).json();
  const m = new Map();
  for (const r of rows) {
    const addr = r['account.address'] ?? r.account?.address;
    if (!addr || addr === cfg.artist) continue;      // don't count the artist
    m.set(addr, parseInt(r.balance, 10) || 0);
  }
  return m;
}

$('check').onclick = async () => {
  if (!cfg) return;
  try {
    plan = [];
    setStatus('Reading the chain…');
    const machine = await holdersOf(cfg.machineTokenId);
    log(`${machine.size} collector(s) hold the machine.`);
    if (!machine.size) { setStatus('No collectors yet.'); log('Nothing to airdrop — no one has collected it yet.', 'warn'); return; }

    for (const c of cfg.companions) {
      const has = await holdersOf(c.tokenId);
      let owed = 0;
      for (const addr of machine.keys()) {
        if (!has.has(addr)) { plan.push({ to: addr, tokenId: c.tokenId, label: c.label }); owed++; }
      }
      log(`${c.kanji} ${c.label}: ${owed} to send, ${machine.size - owed} already held.`);
    }

    if (!plan.length) { setStatus('Everyone is up to date ✓'); log('Every collector already has all three. Nothing to do.', 'ok'); $('send').disabled = true; return; }
    setStatus(`${plan.length} transfer(s) ready`);
    log(`Total: ${plan.length} transfer(s) in ${Math.ceil(plan.length / BATCH_SIZE)} batch(es).`, 'ok');
    $('send').disabled = false;
  } catch (e) { log('Check failed: ' + (e.message || e), 'err'); setStatus('Check failed'); }
};

$('send').onclick = async () => {
  if (!plan.length) return;
  try {
    const pkh = await wallet.getPKH();
    if (pkh !== cfg.artist) { log(`⚠ Connected wallet ${pkh} is not the artist wallet ${cfg.artist}. The transfers will fail.`, 'err'); return; }
    $('send').disabled = true;
    const fa2 = await Tezos.wallet.at(cfg.fa2);
    let sent = 0;

    for (let i = 0; i < plan.length; i += BATCH_SIZE) {
      const slice = plan.slice(i, i + BATCH_SIZE);
      setStatus(`Signing batch ${Math.floor(i / BATCH_SIZE) + 1}…`);
      // one FA2 transfer param: from the artist, many txs
      const params = [{
        from_: cfg.artist,
        txs: slice.map((p) => ({ to_: p.to, token_id: p.tokenId, amount: 1 })),
      }];
      const op = await fa2.methods.transfer(params).send();
      log(`Batch sent: ${op.opHash}`, 'ok');
      await op.confirmation(1);
      sent += slice.length;
      $('prog').style.width = `${Math.round((sent / plan.length) * 100)}%`;
      log(`Confirmed ${sent}/${plan.length}`, 'ok');
    }
    setStatus('Airdrop complete ✓');
    log('All companions delivered.', 'ok');
  } catch (e) {
    log('Airdrop failed: ' + (e.message || e), 'err');
    setStatus('Failed — re-run Check, already-sent transfers are skipped');
    $('send').disabled = false;
  }
};

$('connect').onclick = async () => {
  try {
    setStatus('Opening Temple…');
    await wallet.requestPermissions();
    const pkh = await wallet.getPKH();
    $('cWallet').textContent = pkh;
    setStatus('Connected');
    log('Connected: ' + pkh, 'ok');
    $('check').disabled = false;
  } catch (e) { log('Connect failed: ' + (e.message || e), 'err'); setStatus('Connect failed'); }
};

$('disconnect').onclick = async () => {
  try { await wallet.clearActiveAccount(); $('cWallet').textContent = '—'; setStatus('Disconnected'); } catch {}
};
