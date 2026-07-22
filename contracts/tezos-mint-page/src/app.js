import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { char2Bytes } from '@taquito/utils';

const RPC = 'https://rpc.tzkt.io/mainnet';
const FACTORY = 'KT1Aq4wWmVanpQhq4TTfjZXB5AjFpx15iQMM';
// Which collection we're minting into. Defaults to the 70-piece Manga Machine,
// but a mint list can carry its own `fa2` (e.g. the Mini Manga Machines have
// their own contract) — and ?list=<file> selects which list to load.
const DEFAULT_COLLECTION = 'KT1CghJjhk5g7cd3kr6E1aY5edL6gChPYFDP';
let COLLECTION = DEFAULT_COLLECTION;
const LIST_FILE = new URLSearchParams(location.search).get('list') || 'tezos-mint-list.json';
const BATCH_SIZE = 8;

const $ = (id) => document.getElementById(id);
const log = (m, cls = '') => { const d = document.createElement('div'); if (cls) d.className = cls; d.textContent = m; $('log').appendChild(d); $('log').scrollTop = $('log').scrollHeight; };
const setStatus = (m) => ($('status').textContent = m);

let list = [];
const Tezos = new TezosToolkit(RPC);
const wallet = new BeaconWallet({ name: 'The Manga Machine', network: { type: 'mainnet' } });
Tezos.setWalletProvider(wallet);

(async () => {
  try {
    list = await (await fetch('./' + LIST_FILE)).json();
    if (list[0]?.fa2) COLLECTION = list[0].fa2;          // this list has its own contract
    $('cArtist').textContent = list[0]?.target || '—';
    const kinds = [...new Set(list.map((x) => x.type))].map((t) => `${list.filter((x) => x.type === t).length} ${t}`).join(', ');
    $('cCount').textContent = `${list.length} (${kinds})`;
    log(`Loaded ${LIST_FILE} — ${list.length} piece(s).`, 'ok');
    log(`Minting into ${COLLECTION}`, COLLECTION === DEFAULT_COLLECTION ? '' : 'warn');
    if (list.some((x) => x.fa2 && x.fa2 !== COLLECTION)) {
      log('⚠ This list mixes contracts — refusing to mint.', 'err');
      list = [];
    }
  } catch (e) { log('Could not load mint list: ' + (e.message || e), 'err'); }
})();

async function mintedCount() {
  try { const r = await fetch(`https://api.tzkt.io/v1/tokens/count?contract=${COLLECTION}`); return parseInt(await r.text(), 10) || 0; }
  catch { return 0; }
}

$('connect').onclick = async () => {
  try {
    setStatus('Opening Temple…');
    await wallet.requestPermissions();
    const pkh = await wallet.getPKH();
    $('cWallet').textContent = pkh;
    $('connect').style.display = 'none';
    $('disconnect').style.display = '';
    log('Connected: ' + pkh, 'ok');
    if (pkh !== list[0].target) {
      log('⚠ Connected wallet is NOT the collection creator (' + list[0].target + '). Mint will fail — connect the right wallet.', 'warn');
      setStatus('Wrong wallet — connect the collection creator wallet.');
    } else {
      $('mint').disabled = false;
      setStatus('Ready. Click "Mint all" — you\'ll approve ~' + Math.ceil(list.length / BATCH_SIZE) + ' batches in Temple.');
    }
  } catch (e) { log('Connect failed: ' + (e.message || e), 'err'); setStatus('Connection failed.'); }
};

$('disconnect').onclick = async () => { await wallet.clearActiveAccount(); location.reload(); };

$('mint').onclick = async () => {
  $('mint').disabled = true;
  try {
    const already = await mintedCount();
    if (already > 0) log(`Resuming — ${already} already minted, skipping those.`, 'warn');
    const todo = list.slice(already);
    if (!todo.length) { setStatus('All pieces already minted. ✓'); log('Nothing to do.', 'ok'); return; }

    const factory = await Tezos.wallet.at(FACTORY);
    const batches = [];
    for (let i = 0; i < todo.length; i += BATCH_SIZE) batches.push(todo.slice(i, i + BATCH_SIZE));

    let done = already;
    for (let b = 0; b < batches.length; b++) {
      const chunk = batches[b];
      setStatus(`Batch ${b + 1}/${batches.length} — approve in Temple…`);
      log(`Batch ${b + 1}/${batches.length}: ${chunk.map((c) => c.title).join(', ')}`);
      let batch = Tezos.wallet.batch();
      for (const item of chunk) {
        batch = batch.withContractCall(factory.methodsObject.mint_artist({
          collection_id: item.collection_id,
          editions: item.editions,
          metadata_cid: char2Bytes(item.metadataUri),
          target: item.target,
        }));
      }
      const op = await batch.send();
      log('  sent: ' + op.opHash + ' — confirming…');
      await op.confirmation();
      done += chunk.length;
      $('prog').style.width = (done / list.length * 100) + '%';
      log('  ✓ confirmed (' + done + '/' + list.length + ')', 'ok');
    }
    setStatus('🎉 Done — all ' + list.length + ' minted.');
    log('ALL MINTED. View: https://objkt.com/collection/' + COLLECTION, 'ok');
  } catch (e) {
    log('Mint error: ' + (e.message || e), 'err');
    setStatus('Stopped on an error — click "Mint all" again to resume.');
    $('mint').disabled = false;
  }
};
