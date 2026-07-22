/**
 * PORCELAIN ANDROIDS — build + pin all art and metadata to IPFS (Pinata).
 *
 * Reads contracts/porcelain-manifest.json (116 tokens) and:
 *   1. Finds each asset locally, or downloads it from the live site.
 *   2. Pins every image / video to IPFS  → per-asset CID.
 *   3. Writes 116 ERC-721 metadata files (1.json … 116.json).
 *   4. Pins the whole metadata folder     → one directory CID.
 *   5. Pins a collection-level contractURI (name, description, royalty).
 *
 * Prints the two values you pass to the deploy script:
 *   BASE_URI      = ipfs://<metadataDirCID>/
 *   CONTRACT_URI  = ipfs://<contractJsonCID>
 *
 * Requires PINATA_JWT in ../.env
 * Usage:
 *   cd contracts
 *   node scripts/build-porcelain-metadata.js            # full run
 *   node scripts/build-porcelain-metadata.js --dry-run  # find/verify assets only, no pinning
 */

// Root .env (NFT GENERATOR/.env) holds PINATA_JWT; contracts/.env only has Alchemy.
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const fs = require("fs");
const path = require("path");

const PINATA_JWT = process.env.PINATA_JWT;
const DRY = process.argv.includes("--dry-run");

const ROOT = path.resolve(__dirname, "../..");
const MANIFEST = path.resolve(__dirname, "../porcelain-manifest.json");
const OUT_DIR = path.resolve(__dirname, "../porcelain-metadata");
const PROGRESS = path.resolve(__dirname, "../porcelain-ipfs-progress.json");

// LOCAL ONLY — the master art lives in the backend on your machine. Nothing is
// ever pulled from the live site. If a file isn't found the script stops and
// tells you exactly where it looked. Set PA_ASSETS_DIR in .env to override the root.
const ASSETS_ROOT = process.env.PA_ASSETS_DIR || path.join(ROOT, "backend/uploads/androids");
// Folder names the backend uses (import_androids.py) vs the manifest's paths.
const KIND_DIRS = {
  "androids/stills": ["porcelain", "stills"],           // Porcelain Androids masters
  "androids/manga": ["manga"],                            // Manga Doubles
  "androids/transformations": ["transformations", "video"], // Transformation videos
};

const COLLECTION_DESC =
  "The complete Porcelain Androids archive by Miss AL Simpson. Fifty Porcelain Androids " +
  "recovered from the Roppongi District after the blackout, their thirty-three Manga Doubles, " +
  "and the thirty-three Transformations produced by The Manga Machine. No manufacturer. No serial. " +
  "They were simply there.";

function pieceDescription(m) {
  if (m.type === "Porcelain Android")
    return `${m.name}. A Porcelain Android recovered from the Roppongi District. Part of the Porcelain Androids archive by Miss AL Simpson.`;
  if (m.type === "Manga Double")
    return `The manga imprint of ${m.name.replace(/ — Manga$/, "")}, drawn out by The Manga Machine. Part of the Porcelain Androids archive by Miss AL Simpson.`;
  return `The transformation of ${m.name.replace(/ — Transformation$/, "")} passing through The Manga Machine. Part of the Porcelain Androids archive by Miss AL Simpson.`;
}

// LOCAL ONLY. media looks like "androids/stills/<slug>.png". We map the
// "androids/<kind>" prefix to the backend's real folder name(s) and try common
// extensions. Never touches the network.
function locateAsset(media) {
  const prefix = media.replace(/\/[^/]+$/, "");        // "androids/stills"
  const base = path.basename(media).replace(/\.[^.]+$/, ""); // "<slug>"
  const isVideo = /transformations/.test(prefix);
  const exts = isVideo ? [".mp4", ".webm", ".mov"] : [".png", ".jpg", ".jpeg", ".webp"];
  const folders = KIND_DIRS[prefix] || [path.basename(prefix)];

  const tried = [];
  for (const folder of folders) {
    for (const ext of exts) {
      const p = path.join(ASSETS_ROOT, folder, base + ext);
      tried.push(p);
      if (fs.existsSync(p) && fs.statSync(p).size > 0) return { path: p, source: "local" };
    }
  }
  throw new Error(
    `Asset not found for "${media}". Put the master file in the backend, e.g.\n` +
    `    ${path.join(ASSETS_ROOT, folders[0], base + exts[0])}\n` +
    `  Looked in:\n    ${tried.join("\n    ")}\n` +
    `  (Set PA_ASSETS_DIR in .env if your masters live elsewhere.)`
  );
}

async function pinFile(filePath, name) {
  const fetch = (await import("node-fetch")).default;   // native fetch can't stream form-data
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
  if (!res.ok) throw new Error(`Pinata file pin failed (${res.status}): ${await res.text()}`);
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

async function pinDir(dirPath, name) {
  const fetch = (await import("node-fetch")).default;
  const FormData = (await import("form-data")).default;
  const form = new FormData();
  for (const f of fs.readdirSync(dirPath)) {
    form.append("file", fs.createReadStream(path.join(dirPath, f)), { filepath: `${name}/${f}` });
  }
  form.append("pinataMetadata", JSON.stringify({ name }));
  form.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));
  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${PINATA_JWT}`, ...form.getHeaders() },
    body: form,
    // large folder: no timeout
  });
  if (!res.ok) throw new Error(`Pinata dir pin failed (${res.status}): ${await res.text()}`);
  return (await res.json()).IpfsHash;
}

async function main() {
  if (!DRY && !PINATA_JWT) {
    console.error("ERROR: PINATA_JWT not set in ../.env (run with --dry-run to verify assets without pinning).");
    process.exit(1);
  }
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const progress = fs.existsSync(PROGRESS) ? JSON.parse(fs.readFileSync(PROGRESS, "utf8")) : { assets: {} };

  console.log(`\n  PORCELAIN ANDROIDS — ${manifest.length} tokens  ${DRY ? "(DRY RUN)" : ""}\n`);

  for (const m of manifest) {
    const primary = await locateAsset(m.media);
    process.stdout.write(`  #${String(m.token).padStart(3)} ${m.type.padEnd(18)} ${m.slug.padEnd(28)} [${primary.source}]`);

    if (DRY) { console.log(""); continue; }

    // pin primary media (resume-safe via progress cache)
    let mediaCID = progress.assets[m.media];
    if (!mediaCID) {
      mediaCID = await pinFile(primary.path, `PA ${m.token} ${m.slug} (${m.kind})`);
      progress.assets[m.media] = mediaCID;
      fs.writeFileSync(PROGRESS, JSON.stringify(progress, null, 2));
    }

    // videos also get a poster image
    let posterCID = null;
    if (m.kind === "video" && m.poster) {
      posterCID = progress.assets[m.poster];
      if (!posterCID) {
        const pp = await locateAsset(m.poster);
        posterCID = await pinFile(pp.path, `PA ${m.token} ${m.slug} poster`);
        progress.assets[m.poster] = posterCID;
        fs.writeFileSync(PROGRESS, JSON.stringify(progress, null, 2));
      }
    }

    const meta = {
      name: m.name,
      description: pieceDescription(m),
      image: `ipfs://${m.kind === "video" ? posterCID : mediaCID}`,
      external_url: "https://porcelainandroid.com",
      attributes: [
        { trait_type: "Type", value: m.type },
        { trait_type: "Collection", value: "Porcelain Androids" },
        { trait_type: "District", value: "Roppongi" },
        { trait_type: "Artist", value: "Miss AL Simpson" },
      ],
    };
    if (m.kind === "video") meta.animation_url = `ipfs://${mediaCID}`;

    fs.writeFileSync(path.join(OUT_DIR, `${m.token}.json`), JSON.stringify(meta, null, 2));
    console.log(`  ✓ ${mediaCID.slice(0, 12)}…`);
  }

  if (DRY) { console.log("\n  Dry run complete — all 116 assets located.\n"); return; }

  console.log("\n  Pinning metadata folder…");
  const dirCID = await pinDir(OUT_DIR, "porcelain-androids-metadata");
  const BASE_URI = `ipfs://${dirCID}/`;

  console.log("  Pinning collection contract metadata…");
  const contractJson = {
    name: "THE MANGA MACHINE - PORCELAIN ANDROIDS",
    description: COLLECTION_DESC,
    image: `ipfs://${progress.assets["androids/stills/blue-cherub-girls.png"] || ""}`,
    external_link: "https://porcelainandroid.com",
    seller_fee_basis_points: 750,
    // fee_recipient is set at deploy time via the contract's royalty receiver
  };
  const contractCID = await pinJSON(contractJson, "porcelain-androids-contract");
  const CONTRACT_URI = `ipfs://${contractCID}`;

  const result = { network: "ethereum", tokens: manifest.length, baseURI: BASE_URI, contractURI: CONTRACT_URI, metadataDirCID: dirCID, contractCID, builtAt: new Date().toISOString() };
  fs.writeFileSync(path.resolve(__dirname, "../porcelain-ipfs-result.json"), JSON.stringify(result, null, 2));

  console.log("\n  ══════════════════════════════════════════════");
  console.log("  IPFS BUILD COMPLETE");
  console.log("  ══════════════════════════════════════════════");
  console.log(`  BASE_URI      = ${BASE_URI}`);
  console.log(`  CONTRACT_URI  = ${CONTRACT_URI}`);
  console.log("\n  Next: deploy with these values (see runbook).\n");
}

main().catch((e) => { console.error("\nERROR:", e.message); process.exit(1); });
