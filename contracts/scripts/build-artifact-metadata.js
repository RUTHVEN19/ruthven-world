/**
 * Build + pin TZIP-21 metadata for an INTERACTIVE artifact edition on Objkt,
 * then append it to tezos-mint-list.json so the existing Temple mint page can
 * mint it (the page resumes from the on-chain token count, so it will mint
 * only the new entry).
 *
 * The artifact is an IPFS DIRECTORY (see pin-html-artifact.js), so the page and
 * its assets are addressed by relative path inside one CID.
 *
 * Usage:
 *   cd contracts
 *   node scripts/build-artifact-metadata.js <artifact-json> <editions> ["Title"]
 *   node scripts/build-artifact-metadata.js ../contracts/neon-graffiti-girl-artifact.json 25
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const fs = require("fs");
const path = require("path");

const PINATA_JWT = process.env.PINATA_JWT;
const ARTIST = "tz1WKakHeqcemhukM7iDm15gaQN6byivaU5o";
// The Mini Manga Machines live on their OWN Objkt collection, separate from
// the 70 one-of-ones in KT1Cgh…FDP. Set these once AL has created it.
const DEFAULT_LIST = path.resolve(__dirname, "../mini-manga-machines-mint-list.json");
const RIGHTS =
  "All intellectual property, copyright and reproduction rights in this artwork, " +
  "and in the names 'Porcelain Androids' and 'The Manga Machine', are retained by " +
  "MISS AL SIMPSON LIMITED. No IP or copyright transfers to the holder.";

async function pinJSON(json, name) {
  const fetch = (await import("node-fetch")).default;
  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${PINATA_JWT}`, "Content-Type": "application/json" },
    body: JSON.stringify({ pinataContent: json, pinataMetadata: { name }, pinataOptions: { cidVersion: 1 } }),
  });
  if (!res.ok) throw new Error(`Pinata JSON pin failed (${res.status}): ${await res.text()}`);
  return (await res.json()).IpfsHash;
}

async function main() {
  if (!PINATA_JWT) { console.error("ERROR: PINATA_JWT not set in ../../.env"); process.exit(1); }
  // args: <artifact-json> <editions> ["Title"] --fa2 <KT1…> --collection-id <n> [--list <file>]
  const argv = process.argv.slice(2);
  const opt = {};
  const pos = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--fa2") opt.fa2 = argv[++i];
    else if (argv[i] === "--collection-id") opt.collectionId = parseInt(argv[++i], 10);
    else if (argv[i] === "--list") opt.list = argv[++i];
    else pos.push(argv[i]);
  }
  const [artifactJsonPath, editionsArg, titleArg] = pos;
  if (!artifactJsonPath || !editionsArg || !opt.fa2 || !Number.isInteger(opt.collectionId)) {
    console.error('usage: build-artifact-metadata.js <artifact-json> <editions> ["Title"] \\');
    console.error('         --fa2 KT1…  --collection-id <n>  [--list <file>]');
    console.error('\n  The Mini Manga Machines have their OWN Objkt collection — pass its');
    console.error('  KT1 address and Objkt collection id so this never mints into the');
    console.error('  70-piece Manga Machine collection by mistake.');
    process.exit(1);
  }
  if (opt.fa2 === "KT1CghJjhk5g7cd3kr6E1aY5edL6gChPYFDP") {
    console.error("ERROR: that's the 70-piece Manga Machine collection. The Mini Manga");
    console.error("       Machines must go on their own contract.");
    process.exit(1);
  }
  const MINTLIST = opt.list ? path.resolve(process.cwd(), opt.list) : DEFAULT_LIST;
  const COLLECTION_ID = opt.collectionId;

  const editions = parseInt(editionsArg, 10);
  if (!Number.isInteger(editions) || editions < 1) { console.error("ERROR: editions must be a positive integer"); process.exit(1); }

  const art = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), artifactJsonPath), "utf8"));
  const cid = art.cid;
  const title = titleArg || art.name.replace(/-/g, " ").toUpperCase();

  const artifactUri = `ipfs://${cid}/index.html`;
  const stillUri = `ipfs://${cid}/still.jpg`;
  const mangaUri = `ipfs://${cid}/manga.jpg`;
  const filmUri = `ipfs://${cid}/transform.mp4`;

  const meta = {
    name: `${title} — The Manga Machine`,
    description:
      `An interactive Manga Machine. Pull the lever: the porcelain android is read, ` +
      `processed and transformed — the film plays, the manga memory prints out, and all ` +
      `three works are revealed. Porcelain, manga and transformation, held inside one ` +
      `machine you can run as often as you like. From THE MANGA MACHINE, the neon-lit ` +
      `archive of Roppongi's porcelain androids by Miss AL Simpson.`,
    tags: ["porcelain androids", "the manga machine", "interactive", "manga", "miss al simpson", "tezos"],
    symbol: "MANGA",
    artifactUri,                       // the interactive machine itself
    // The machine spits out the MANGA — so that is the face of the collector's
    // NFT (wallets, Objkt grid, everywhere). Open it and you get the machine.
    displayUri: mangaUri,
    thumbnailUri: mangaUri,
    creators: [ARTIST],
    formats: [
      { uri: artifactUri, mimeType: "text/html" },
      { uri: stillUri, mimeType: "image/jpeg" },
      { uri: mangaUri, mimeType: "image/jpeg" },
      { uri: filmUri, mimeType: "video/mp4" },
    ],
    attributes: [
      { name: "Type", value: "Interactive" },
      { name: "Edition size", value: String(editions) },
      { name: "Contains", value: "Porcelain · Manga · Transformation" },
    ],
    decimals: 0,
    isBooleanAmount: editions === 1,   // false for a real edition
    shouldPreferSymbol: false,
    royalties: { decimals: 4, shares: { [ARTIST]: 750 } }, // 7.5%
    rights: RIGHTS,
  };

  console.log(`\n  ${meta.name}`);
  console.log(`  editions   : ${editions}`);
  console.log(`  artifactUri: ${meta.artifactUri}`);
  console.log(`  displayUri : ${meta.displayUri}`);
  console.log(`  thumbnail  : ${meta.thumbnailUri}\n`);

  // keep an auditable local copy of exactly what gets pinned
  const localMeta = path.resolve(__dirname, `../${art.name}-edition-metadata.json`);
  fs.writeFileSync(localMeta, JSON.stringify(meta, null, 2));
  console.log(`  metadata written → ${path.basename(localMeta)}`);

  const metaCid = await pinJSON(meta, `MM artifact ${title} x${editions}`);
  console.log(`  ✓ metadata pinned: ipfs://${metaCid}`);

  // append to the mint list so the existing Temple page picks it up
  const list = fs.existsSync(MINTLIST) ? JSON.parse(fs.readFileSync(MINTLIST, "utf8")) : [];
  const order = list.length ? Math.max(...list.map((x) => x.order)) + 1 : 1;
  const entry = {
    order,
    title: `${title} — interactive (edition of ${editions})`,
    type: "interactive",
    metadataUri: `ipfs://${metaCid}`,
    target: ARTIST,
    fa2: opt.fa2,                 // which contract this belongs to
    collection_id: COLLECTION_ID,
    editions,
  };
  // don't duplicate if re-run
  const existing = list.findIndex((x) => x.type === "interactive" && x.title.startsWith(title));
  if (existing >= 0) { entry.order = list[existing].order; list[existing] = entry; console.log("  (replaced the previous interactive entry)"); }
  else list.push(entry);

  fs.writeFileSync(MINTLIST, JSON.stringify(list, null, 2));
  fs.copyFileSync(MINTLIST, path.resolve(__dirname, "../tezos-mint-page/" + path.basename(MINTLIST)));
  console.log(`  ✓ mint list now ${list.length} entries (this is #${entry.order})`);
  console.log(`\n  Next: serve contracts/tezos-mint-page and open`);
  console.log(`    index.html?list=${path.basename(MINTLIST)}`);
  console.log(`  It resumes from ${opt.fa2}'s own token count.\n`);
}

main().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
