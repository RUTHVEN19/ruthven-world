/**
 * Pin all 51 Manga Machine (Tezos) artworks + video posters to IPFS (Pinata).
 *
 * Reads contracts/tezos-manifest.json (51 named pieces) and pins each media file
 * (and each video's poster) from backend/uploads/sources/manga_machine_lora_4x/.
 * Records CIDs to contracts/tezos-ipfs-progress.json (resume-safe).
 *
 * Requires PINATA_JWT in ../../.env
 * Usage:
 *   cd contracts
 *   node scripts/pin-tezos-assets.js
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const fs = require("fs");
const path = require("path");

const PINATA_JWT = process.env.PINATA_JWT;
const ROOT = path.resolve(__dirname, "../..");
const ASSETS = path.join(ROOT, "backend/uploads/sources/manga_machine_lora_4x");
const MANIFEST = path.resolve(__dirname, "../tezos-manifest.json");
const PROGRESS = path.resolve(__dirname, "../tezos-ipfs-progress.json");

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

async function main() {
  if (!PINATA_JWT) { console.error("ERROR: PINATA_JWT not set in ../../.env"); process.exit(1); }
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  const progress = fs.existsSync(PROGRESS) ? JSON.parse(fs.readFileSync(PROGRESS, "utf8")) : { media: {}, poster: {} };

  console.log(`\n  Pinning ${manifest.length} Manga Machine (Tezos) pieces to IPFS\n`);
  let bytes = 0;

  for (const m of manifest) {
    // media
    if (!progress.media[m.media]) {
      const p = path.join(ASSETS, m.media);
      const cid = await pinFile(p, `MM ${m.token} ${m.title} (${m.type})`);
      progress.media[m.media] = cid;
      bytes += fs.statSync(p).size;
      fs.writeFileSync(PROGRESS, JSON.stringify(progress, null, 2));
      console.log(`  #${String(m.token).padStart(2)} ${m.type.padEnd(5)} ${m.title.slice(0, 32).padEnd(32)} ✓ ${cid.slice(0, 12)}…`);
    }
    // poster (videos)
    if (m.type === "video" && m.poster && !progress.poster[m.poster]) {
      const pp = path.join(ASSETS, m.poster);
      const cid = await pinFile(pp, `MM ${m.token} ${m.title} poster`);
      progress.poster[m.poster] = cid;
      fs.writeFileSync(PROGRESS, JSON.stringify(progress, null, 2));
      console.log(`       poster ${m.title.slice(0, 30).padEnd(30)}   ✓ ${cid.slice(0, 12)}…`);
    }
  }

  console.log(`\n  Done. Pinned ${Object.keys(progress.media).length} media + ${Object.keys(progress.poster).length} posters, ~${(bytes / 1e9).toFixed(2)} GB`);
  console.log(`  CIDs saved to ${PROGRESS}\n`);
}

main().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
