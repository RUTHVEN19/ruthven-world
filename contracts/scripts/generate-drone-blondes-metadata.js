/**
 * Generate metadata JSONs for 120 Drone Blondes.
 * Reads from the CSV and produces one JSON per token (1-120).
 *
 * Run AFTER images are uploaded to IPFS. Expects image CIDs in
 * drone-blondes-image-cids.json or pass IMAGE_BASE_URI env var.
 *
 * Usage:
 *   IMAGE_BASE_URI="ipfs://QmXYZ/" node scripts/generate-drone-blondes-metadata.js
 */

const fs = require("fs");
const path = require("path");

// ─── Config ──────────────────────────────────────────────
const CSV_PATH = path.resolve(__dirname, "../../frontend/public/marilyns/drone_blondes_opensea.csv");
const OUTPUT_DIR = path.resolve(__dirname, "../drone-blondes-metadata");

let imageBaseURI = process.env.IMAGE_BASE_URI;
if (!imageBaseURI) {
  const cidFile = path.resolve(__dirname, "../drone-blondes-image-cids.json");
  if (fs.existsSync(cidFile)) {
    const data = JSON.parse(fs.readFileSync(cidFile, "utf-8"));
    imageBaseURI = data.imageBaseURI || data.baseURI;
  }
}

if (!imageBaseURI) {
  console.error("ERROR: No IMAGE_BASE_URI. Upload images to IPFS first.");
  process.exit(1);
}

// Ensure trailing slash
if (!imageBaseURI.endsWith("/")) imageBaseURI += "/";

// ─── Parse CSV ───────────────────────────────────────────
const csv = fs.readFileSync(CSV_PATH, "utf-8").trim();
const lines = csv.split("\n");
const headers = lines[0].split(",");

// Trait columns (indices 3-12 in the CSV)
const traitColumns = [
  "Scene", "Hair", "Fashion", "Drone Type", "Composition",
  "Lighting", "Personality", "Jewellery", "Eyes", "Body Art"
];

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

let count = 0;

for (let i = 1; i < lines.length; i++) {
  // Parse CSV line carefully (some values contain commas in semicolon-separated lists)
  const row = parseCSVLine(lines[i]);
  if (row.length < 4) continue;

  const tokenId = i; // Token #1 = Drone Blonde #1
  const name = row[0].trim();       // e.g. "Drone Blonde #1"
  const description = row[1].trim();
  const fileName = row[2].trim();    // e.g. "Drone Blonde 1.png"

  // Build attributes array
  const attributes = [];
  for (let t = 0; t < traitColumns.length; t++) {
    const value = (row[3 + t] || "").trim();
    if (value && value !== "None") {
      attributes.push({
        trait_type: traitColumns[t],
        value: value
      });
    }
  }

  // Build image URI — use encoded filename for IPFS
  const encodedFileName = encodeURIComponent(fileName);
  const imageURI = imageBaseURI + encodedFileName;

  const metadata = {
    name,
    description,
    image: imageURI,
    external_url: "https://dronesofsuburbia.com/drones/boudoir",
    attributes
  };

  const outPath = path.join(OUTPUT_DIR, String(tokenId));
  fs.writeFileSync(outPath, JSON.stringify(metadata, null, 2));
  count++;
}

console.log(`Generated ${count} metadata files in ${OUTPUT_DIR}`);
console.log(`Token IDs: 1 through ${count}`);
console.log(`Image base: ${imageBaseURI}`);

// ─── CSV parser (handles quoted fields) ──────────────────
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
