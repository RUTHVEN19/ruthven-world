/**
 * Upload Diamond Drones images + metadata to IPFS via Pinata.
 *
 * Uploads each image individually (25MB each is too large for bulk upload),
 * then generates metadata JSONs and uploads the metadata folder.
 *
 * Resumable — saves progress to diamond-drones-upload-progress.json.
 * If interrupted, just run again and it picks up where it left off.
 *
 * Usage:
 *   node scripts/upload-ipfs.js
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
const IMAGES_DIR = path.resolve(
  __dirname,
  "../../backend/uploads/sources/genesis_full_4x"
);
const SOURCE_METADATA_DIR = IMAGES_DIR;
const METADATA_OUTPUT_DIR = path.resolve(__dirname, "../metadata");
const PROGRESS_FILE = path.resolve(__dirname, "../diamond-drones-upload-progress.json");
const CID_FILE = path.resolve(__dirname, "../diamond-drones-cids.json");

const TOTAL_SUPPLY = 1000;
const CONCURRENT_UPLOADS = 5; // parallel uploads at a time

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
    return progress.imageCIDs[key]; // already uploaded
  }

  const paddedId = String(droneNumber).padStart(4, "0");
  const filename = `Diamond Drone #${paddedId}.png`;
  const filepath = path.join(IMAGES_DIR, filename);

  const stream = fs.createReadStream(filepath);
  const result = await pinata.pinFileToIPFS(stream, {
    pinataMetadata: { name: `Diamond Drone #${paddedId}` },
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
  // Verify Pinata connection
  console.log("Verifying Pinata connection...");
  await pinata.testAuthentication();
  console.log("Authenticated.\n");

  const progress = loadProgress();
  const alreadyUploaded = Object.keys(progress.imageCIDs).length;

  // ─── Step 1: Upload images individually ─────────────────
  console.log(`Step 1: Uploading images to IPFS (${alreadyUploaded} already done)...`);

  // Verify all images exist first
  for (let i = 1; i <= TOTAL_SUPPLY; i++) {
    const paddedId = String(i).padStart(4, "0");
    const filepath = path.join(IMAGES_DIR, `Diamond Drone #${paddedId}.png`);
    if (!fs.existsSync(filepath)) {
      console.error(`  Missing image: Diamond Drone #${paddedId}.png`);
      process.exit(1);
    }
  }

  // Upload in batches of CONCURRENT_UPLOADS
  for (let i = 1; i <= TOTAL_SUPPLY; i += CONCURRENT_UPLOADS) {
    // Skip batches where all are already uploaded
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

  // ─── Step 2: Generate metadata JSONs ────────────────────
  console.log("Step 2: Generating metadata JSONs (token IDs 0-999)...");

  if (!fs.existsSync(METADATA_OUTPUT_DIR)) {
    fs.mkdirSync(METADATA_OUTPUT_DIR, { recursive: true });
  }

  for (let tokenId = 0; tokenId < TOTAL_SUPPLY; tokenId++) {
    const droneNumber = tokenId + 1;
    const imageCID = progress.imageCIDs[String(droneNumber)];

    // Read source metadata
    const sourceMetadataPath = path.join(SOURCE_METADATA_DIR, String(droneNumber));
    if (!fs.existsSync(sourceMetadataPath)) {
      console.error(`  Missing metadata file: ${droneNumber}`);
      process.exit(1);
    }
    const sourceMetadata = JSON.parse(fs.readFileSync(sourceMetadataPath, "utf-8"));

    // Build ERC-721 metadata with individual image CID
    const metadata = {
      name: sourceMetadata.name,
      description: sourceMetadata.description,
      image: `ipfs://${imageCID}`,
      external_url: "https://dronesofsuburbia.com",
      attributes: sourceMetadata.attributes,
    };

    // Write as tokenId (no extension — matches ERC721A tokenURI)
    fs.writeFileSync(
      path.join(METADATA_OUTPUT_DIR, String(tokenId)),
      JSON.stringify(metadata, null, 2)
    );
  }

  console.log(`  Generated ${TOTAL_SUPPLY} metadata files.\n`);

  // ─── Step 3: Upload metadata directory ──────────────────
  if (progress.metadataCID) {
    console.log(`Step 3: Metadata already uploaded: ${progress.metadataCID}\n`);
  } else {
    console.log("Step 3: Uploading metadata directory to IPFS...");

    const metadataPinResult = await pinata.pinFromFS(METADATA_OUTPUT_DIR, {
      pinataMetadata: { name: "Diamond Drones - Metadata" },
      pinataOptions: { cidVersion: 1 },
    });

    progress.metadataCID = metadataPinResult.IpfsHash;
    saveProgress(progress);
    console.log(`  Metadata CID: ${progress.metadataCID}\n`);
  }

  // ─── Done ───────────────────────────────────────────────
  const baseURI = `ipfs://${progress.metadataCID}/`;

  console.log("═══════════════════════════════════════════════════");
  console.log("  UPLOAD COMPLETE");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Metadata CID: ${progress.metadataCID}`);
  console.log(`  Base URI:     ${baseURI}`);
  console.log("");
  console.log("  Use this baseURI when deploying the contract:");
  console.log(`    npx hardhat run scripts/deploy-diamond-drones.js --network sepolia`);
  console.log("═══════════════════════════════════════════════════");

  // Save CIDs for the deploy script
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
