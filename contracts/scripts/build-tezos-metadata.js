/**
 * Build + pin TZIP-21 token metadata for the 51 Manga Machine (Tezos) pieces.
 *
 * Reads tezos-manifest.json + tezos-ipfs-progress.json (media/poster CIDs from
 * pin-tezos-assets.js). For each piece builds an Objkt-compatible TZIP-21 JSON,
 * pins it to IPFS, and writes tezos-mint-list.json — the input for the Temple
 * batch-mint page.
 *
 * Royalties: 7.5% to the artist. IP (rights field only, NOT the description).
 *
 * Requires PINATA_JWT in ../../.env
 * Usage: cd contracts && node scripts/build-tezos-metadata.js
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const fs = require("fs");
const path = require("path");

const PINATA_JWT = process.env.PINATA_JWT;
const MANIFEST = path.resolve(__dirname, "../tezos-manifest.json");
const PROGRESS = path.resolve(__dirname, "../tezos-ipfs-progress.json");
const ANIMPOSTER = path.resolve(__dirname, "../tezos-animposter.json"); // {media: cid} animated 5s clips
const OUT = path.resolve(__dirname, "../tezos-mint-list.json");

const ARTIST = "tz1WKakHeqcemhukM7iDm15gaQN6byivaU5o"; // royalties + creator
const COLLECTION_ID = 113274;
const RIGHTS =
  "All intellectual property, copyright and reproduction rights in this artwork, " +
  "and in the names 'Porcelain Androids' and 'The Manga Machine', are retained by " +
  "MISS AL SIMPSON LIMITED. No IP or copyright transfers to the holder.";

const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".mp4": "video/mp4", ".mov": "video/quicktime", ".webm": "video/webm" };
const mimeOf = (f) => MIME[path.extname(f).toLowerCase()] || "application/octet-stream";

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
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  const prog = JSON.parse(fs.readFileSync(PROGRESS, "utf8"));
  const anim = fs.existsSync(ANIMPOSTER) ? JSON.parse(fs.readFileSync(ANIMPOSTER, "utf8")) : {};

  // Verify all media (and posters) are pinned first.
  const missing = [];
  for (const m of manifest) {
    if (!prog.media[m.media]) missing.push(m.media);
    if (m.type === "video" && m.poster && !prog.poster[m.poster]) missing.push(m.poster);
  }
  if (missing.length) {
    console.error(`ERROR: ${missing.length} asset(s) not pinned yet — run pin-tezos-assets.js to completion first.`);
    console.error("  e.g. " + missing.slice(0, 3).join(", "));
    process.exit(1);
  }

  const mintList = [];
  console.log(`\n  Building + pinning TZIP-21 metadata for ${manifest.length} pieces\n`);

  for (const m of manifest) {
    const mediaCID = prog.media[m.media];
    const mediaUri = `ipfs://${mediaCID}`;
    const isVideo = m.type === "video";
    const posterCID = isVideo ? prog.poster[m.poster] : null;
    const animCID = isVideo ? anim[m.media] : null;   // animated 5s poster (new films only)
    // Video display: animated loop if we pinned one, else the still poster.
    const displayUri = isVideo ? `ipfs://${animCID || posterCID}` : mediaUri;

    const formats = [{ uri: mediaUri, mimeType: mimeOf(m.media) }];
    if (isVideo) {
      if (animCID) formats.push({ uri: `ipfs://${animCID}`, mimeType: "video/mp4" }); // looping poster
      if (posterCID) formats.push({ uri: `ipfs://${posterCID}`, mimeType: mimeOf(m.poster) }); // static still
    }

    const meta = {
      name: m.title,
      description: m.description,           // clean — no IP text
      tags: ["porcelain androids", "the manga machine", "manga", "miss al simpson", "tezos"],
      symbol: "MANGA",
      artifactUri: mediaUri,
      displayUri,
      thumbnailUri: displayUri,
      creators: [ARTIST],
      formats,
      decimals: 0,
      isBooleanAmount: true,
      shouldPreferSymbol: false,
      royalties: { decimals: 4, shares: { [ARTIST]: 750 } }, // 7.5%
      rights: RIGHTS,                        // IP lives here, not in description
    };

    const cid = await pinJSON(meta, `MM meta ${m.token} ${m.title}`);
    mintList.push({
      order: m.token,
      title: m.title,
      type: m.type,
      metadataUri: `ipfs://${cid}`,
      target: ARTIST,
      collection_id: COLLECTION_ID,
      editions: 1,
    });
    console.log(`  #${String(m.token).padStart(2)} ${m.type.padEnd(5)} ${m.title.slice(0, 34).padEnd(34)} → ipfs://${cid.slice(0, 10)}…`);
  }

  fs.writeFileSync(OUT, JSON.stringify(mintList, null, 2));
  console.log(`\n  Done. ${mintList.length} token-metadata JSONs pinned.`);
  console.log(`  Mint list → ${OUT}\n`);
}

main().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
