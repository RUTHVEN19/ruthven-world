/**
 * Upload Drone Blondes images + metadata to IPFS via Pinata.
 *
 * Resumable — saves progress to drone-blondes-upload-progress.json.
 *
 * Usage:
 *   node scripts/upload-drone-blondes-ipfs.js
 *
 * Requires PINATA_JWT in ../.env
 */

const pinataSDK = require("@pinata/sdk");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const PINATA_JWT = process.env.PINATA_JWT;
if (!PINATA_JWT) {
  console.error("ERROR: PINATA_JWT not set in .env");
  process.exit(1);
}

const pinata = new pinataSDK({ pinataJWTKey: PINATA_JWT });

// Paths
const IMAGES_DIR = path.resolve(__dirname, "../../frontend/public/marilyns");
const CSV_PATH = path.join(IMAGES_DIR, "drone_blondes_opensea.csv");
const METADATA_OUTPUT_DIR = path.resolve(__dirname, "../drone-blondes-metadata");
const PROGRESS_FILE = path.resolve(__dirname, "../drone-blondes-upload-progress.json");
const CID_FILE = path.resolve(__dirname, "../drone-blondes-cids.json");

const TOTAL_SUPPLY = 120;
const CONCURRENT_UPLOADS = 3; // smaller batches — these are large files

// Trait columns from the CSV
const TRAIT_COLUMNS = [
  "Scene", "Hair", "Fashion", "Drone Type", "Composition",
  "Lighting", "Personality", "Jewellery", "Eyes", "Body Art"
];

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8"));
  }
  return { imageCIDs: {}, metadataCID: null };
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function uploadImage(droneNumber, progress) {
  const key = String(droneNumber);
  if (progress.imageCIDs[key]) {
    return progress.imageCIDs[key];
  }

  const filename = `Drone Blonde ${droneNumber}.png`;
  const filepath = path.join(IMAGES_DIR, filename);

  const stream = fs.createReadStream(filepath);
  const result = await pinata.pinFileToIPFS(stream, {
    pinataMetadata: { name: `Drone Blonde #${droneNumber}` },
    pinataOptions: { cidVersion: 1 },
  });

  progress.imageCIDs[key] = result.IpfsHash;
  saveProgress(progress);
  return result.IpfsHash;
}

async function uploadBatch(startIdx, batchSize, progress) {
  const promises = [];
  for (let i = startIdx; i < Math.min(startIdx + batchSize, TOTAL_SUPPLY + 1); i++) {
    promises.push(
      uploadImage(i, progress).then((cid) => {
        const done = Object.keys(progress.imageCIDs).length;
        process.stdout.write(`\r  Uploaded ${done}/${TOTAL_SUPPLY} images`);
        return cid;
      })
    );
  }
  await Promise.all(promises);
}

async function main() {
  console.log("Verifying Pinata connection...");
  await pinata.testAuthentication();
  console.log("Authenticated.\n");

  const progress = loadProgress();
  const alreadyUploaded = Object.keys(progress.imageCIDs).length;

  // ─── Step 1: Upload images ────────────────────────────────
  console.log(`Step 1: Uploading images to IPFS (${alreadyUploaded} already done)...`);

  // Verify all images exist
  for (let i = 1; i <= TOTAL_SUPPLY; i++) {
    const filepath = path.join(IMAGES_DIR, `Drone Blonde ${i}.png`);
    if (!fs.existsSync(filepath)) {
      console.error(`  Missing image: Drone Blonde ${i}.png`);
      process.exit(1);
    }
  }

  for (let i = 1; i <= TOTAL_SUPPLY; i += CONCURRENT_UPLOADS) {
    let allDone = true;
    for (let j = i; j < Math.min(i + CONCURRENT_UPLOADS, TOTAL_SUPPLY + 1); j++) {
      if (!progress.imageCIDs[String(j)]) {
        allDone = false;
        break;
      }
    }
    if (allDone) continue;
    await uploadBatch(i, CONCURRENT_UPLOADS, progress);
  }

  console.log(`\n  All ${TOTAL_SUPPLY} images uploaded.\n`);

  // ─── Step 2: Generate metadata JSONs ──────────────────────
  console.log("Step 2: Generating metadata JSONs (token IDs 1-120)...");

  // Read traits from traits.json (source of truth) and descriptions
  const TRAITS_JSON_PATH = path.resolve(__dirname, "../../frontend/public/marilyns/traits.json");
  const DESC_JSON_PATH = path.resolve(__dirname, "../../frontend/public/marilyns/drone_blondes_descriptions.json");
  const traitsData = JSON.parse(fs.readFileSync(TRAITS_JSON_PATH, "utf-8"));
  const descData = JSON.parse(fs.readFileSync(DESC_JSON_PATH, "utf-8"));

  // Trait key mapping: traits.json keys -> display names
  const TRAIT_KEY_MAP = {
    scene: "Scene", hair: "Hair", fashion: "Fashion", drone_type: "Drone Type",
    composition: "Composition", lighting: "Lighting", personality: "Personality",
    jewellery: "Jewellery", eyes: "Eyes", body_art: "Body Art"
  };

  fs.mkdirSync(METADATA_OUTPUT_DIR, { recursive: true });

  for (let tokenId = 1; tokenId <= TOTAL_SUPPLY; tokenId++) {
    const key = String(tokenId);
    const t = traitsData[key];
    if (!t) { console.error(`  Missing traits for #${tokenId}`); process.exit(1); }

    const name = `Drone Blonde #${tokenId}`;
    const description = descData[key] || `A Drone Blonde from the Diamond Drones Genesis Collection by Miss AL Simpson.`;
    const imageCID = progress.imageCIDs[key];

    const attributes = [];
    for (const [jsonKey, displayName] of Object.entries(TRAIT_KEY_MAP)) {
      const value = (t[jsonKey] || "").trim();
      if (value && value !== "None") {
        attributes.push({ trait_type: displayName, value });
      }
    }

    const metadata = {
      name,
      description,
      image: `ipfs://${imageCID}`,
      external_url: "https://dronesofsuburbia.com/drones/boudoir",
      attributes,
    };

    fs.writeFileSync(
      path.join(METADATA_OUTPUT_DIR, String(tokenId)),
      JSON.stringify(metadata, null, 2)
    );
  }

  console.log(`  Generated ${TOTAL_SUPPLY} metadata files.\n`);

  // ─── Step 3: Upload metadata directory ────────────────────
  if (progress.metadataCID) {
    console.log(`Step 3: Metadata already uploaded: ${progress.metadataCID}\n`);
  } else {
    console.log("Step 3: Uploading metadata directory to IPFS...");

    const metadataPinResult = await pinata.pinFromFS(METADATA_OUTPUT_DIR, {
      pinataMetadata: { name: "Drone Blondes - Metadata" },
      pinataOptions: { cidVersion: 1 },
    });

    progress.metadataCID = metadataPinResult.IpfsHash;
    saveProgress(progress);
    console.log(`  Metadata CID: ${progress.metadataCID}\n`);
  }

  // ─── Done ─────────────────────────────────────────────────
  const baseURI = `ipfs://${progress.metadataCID}/`;

  console.log("═══════════════════════════════════════════════════");
  console.log("  UPLOAD COMPLETE");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Metadata CID: ${progress.metadataCID}`);
  console.log(`  Base URI:     ${baseURI}`);
  console.log(`  Token IDs:    1 through 120`);
  console.log("");
  console.log("  Deploy with:");
  console.log(`    npx hardhat run scripts/deploy-drone-blondes.js --network mainnet`);
  console.log("═══════════════════════════════════════════════════");

  fs.writeFileSync(
    CID_FILE,
    JSON.stringify({
      metadataCID: progress.metadataCID,
      baseURI,
      imageCount: TOTAL_SUPPLY,
    }, null, 2)
  );
  console.log(`\n  CIDs saved to ${CID_FILE}`);
}

main().catch((err) => {
  console.error("\nUpload error:", err.message || err);
  console.log("Progress saved — run again to resume.");
  process.exit(1);
});
