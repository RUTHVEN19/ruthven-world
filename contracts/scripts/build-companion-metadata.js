/**
 * Build + pin TZIP-21 metadata for the THREE companion editions that go with a
 * Mini Manga Machine: 磁器 Porcelain · 漫画 Manga · 変換 Transformation.
 *
 * These are airdropped to whoever collects the machine (see airdrop.html), so
 * they're minted in the same edition size as the machine and onto the same
 * contract.
 *
 * Requires: pin-companion-assets.js to have run (gives <slug>-companions.json).
 *
 * Usage:
 *   cd contracts
 *   node scripts/build-companion-metadata.js <slug> <editions> "TITLE" \
 *        --fa2 KT1… --collection-id <n> [--list <file>]
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const PINATA_JWT = process.env.PINATA_JWT;
const ROOT = path.resolve(__dirname, "../..");
const PUB = path.join(ROOT, "frontend/public/androids");
const ARTIST = "tz1WKakHeqcemhukM7iDm15gaQN6byivaU5o";
const DEFAULT_LIST = path.resolve(__dirname, "../mini-manga-machines-mint-list.json");
const RIGHTS =
  "All intellectual property, copyright and reproduction rights in this artwork, " +
  "and in the names 'Porcelain Androids' and 'The Manga Machine', are retained by " +
  "MISS AL SIMPSON LIMITED. No IP or copyright transfers to the holder.";

const BLURB = {
  porcelain: "The porcelain android as she was found — neon, latex and ink in a Roppongi back alley.",
  manga: "The manga memory the machine recovered from her.",
  transformation: "The transformation itself: porcelain becoming manga, as the machine performs it.",
};

async function pinFile(filePath, name) {
  const fetch = (await import("node-fetch")).default;
  const FormData = (await import("form-data")).default;
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));
  form.append("pinataMetadata", JSON.stringify({ name }));
  form.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));
  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${PINATA_JWT}`, ...form.getHeaders() },
    body: form,
  });
  if (!res.ok) throw new Error(`Pinata pin failed (${res.status}): ${await res.text()}`);
  return (await res.json()).IpfsHash;
}

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
  if (!PINATA_JWT) { console.error("ERROR: PINATA_JWT not set"); process.exit(1); }
  const argv = process.argv.slice(2);
  const opt = {}; const pos = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--fa2") opt.fa2 = argv[++i];
    else if (argv[i] === "--collection-id") opt.collectionId = parseInt(argv[++i], 10);
    else if (argv[i] === "--list") opt.list = argv[++i];
    else pos.push(argv[i]);
  }
  const [slug, editionsArg, titleArg] = pos;
  if (!slug || !editionsArg || !opt.fa2 || !Number.isInteger(opt.collectionId)) {
    console.error('usage: build-companion-metadata.js <slug> <editions> "TITLE" --fa2 KT1… --collection-id <n>');
    process.exit(1);
  }
  if (opt.fa2 === "KT1CghJjhk5g7cd3kr6E1aY5edL6gChPYFDP") {
    console.error("ERROR: that's the 70-piece collection — companions belong on the Mini Manga Machines contract.");
    process.exit(1);
  }
  const editions = parseInt(editionsArg, 10);
  const title = titleArg || slug.replace(/-/g, " ").toUpperCase();
  const MINTLIST = opt.list ? path.resolve(process.cwd(), opt.list) : DEFAULT_LIST;

  const compPath = path.resolve(__dirname, `../${slug}-companions.json`);
  if (!fs.existsSync(compPath)) { console.error("ERROR: run pin-companion-assets.js first —", compPath); process.exit(1); }
  const comp = JSON.parse(fs.readFileSync(compPath, "utf8"));

  // the film needs a still for its grid thumbnail
  let filmPosterCid = comp.transformation.posterCid;
  if (!filmPosterCid) {
    const poster = path.join("/tmp", `${slug}-film-poster.jpg`);
    execFileSync("ffmpeg", ["-y", "-ss", "00:00:01", "-i", path.join(PUB, "transformations", `${slug}.mp4`),
      "-vframes", "1", "-q:v", "2", poster], { stdio: "ignore" });
    filmPosterCid = await pinFile(poster, `MiniMangaMachine ${slug} film poster`);
    comp.transformation.posterCid = filmPosterCid;
    fs.writeFileSync(compPath, JSON.stringify(comp, null, 2));
    console.log(`  film poster pinned: ${filmPosterCid.slice(0, 14)}…`);
  }

  const list = fs.existsSync(MINTLIST) ? JSON.parse(fs.readFileSync(MINTLIST, "utf8")) : [];
  let order = list.length ? Math.max(...list.map((x) => x.order)) + 1 : 1;

  console.log(`\n  Companion editions for ${title} — ${editions} each\n`);

  for (const key of ["porcelain", "manga", "transformation"]) {
    const c = comp[key];
    const isVideo = key === "transformation";
    const uri = `ipfs://${c.cid}`;
    const display = isVideo ? `ipfs://${filmPosterCid}` : uri;

    const meta = {
      name: `${title} — ${c.kanji} ${c.label}`,
      description: `${BLURB[key]} One of the three works produced by the ${title} Mini Manga Machine. ` +
        `From THE MANGA MACHINE, the neon-lit archive of Roppongi's porcelain androids by Miss AL Simpson.`,
      tags: ["porcelain androids", "the manga machine", "mini manga machines", "manga", "miss al simpson", "tezos"],
      symbol: "MANGA",
      artifactUri: uri,
      displayUri: display,
      thumbnailUri: display,
      creators: [ARTIST],
      formats: [{ uri, mimeType: c.mime }].concat(isVideo ? [{ uri: display, mimeType: "image/jpeg" }] : []),
      attributes: [
        { name: "Part", value: `${c.kanji} ${c.label}` },
        { name: "Edition size", value: String(editions) },
        { name: "Companion to", value: `${title} — The Manga Machine` },
      ],
      decimals: 0,
      isBooleanAmount: editions === 1,
      shouldPreferSymbol: false,
      royalties: { decimals: 4, shares: { [ARTIST]: 750 } },
      rights: RIGHTS,
    };

    const metaCid = await pinJSON(meta, `MMM ${title} ${c.label} x${editions}`);
    const entry = {
      order,
      title: `${title} — ${c.kanji} ${c.label} (edition of ${editions})`,
      type: `companion-${key}`,
      metadataUri: `ipfs://${metaCid}`,
      target: ARTIST,
      fa2: opt.fa2,
      collection_id: opt.collectionId,
      editions,
    };
    const i = list.findIndex((x) => x.type === entry.type && x.title.startsWith(title));
    if (i >= 0) { entry.order = list[i].order; list[i] = entry; } else { list.push(entry); order++; }

    console.log(`  ${c.kanji} ${c.label.padEnd(15)} → ipfs://${metaCid.slice(0, 14)}…`);
  }

  list.sort((a, b) => a.order - b.order);
  fs.writeFileSync(MINTLIST, JSON.stringify(list, null, 2));
  fs.copyFileSync(MINTLIST, path.resolve(__dirname, "../tezos-mint-page/" + path.basename(MINTLIST)));
  console.log(`\n  ✓ mint list: ${list.length} entries → ${path.basename(MINTLIST)}\n`);
}

main().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
