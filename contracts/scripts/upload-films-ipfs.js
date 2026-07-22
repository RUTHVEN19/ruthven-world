/**
 * Upload 4 Diamond Drones films + posters + metadata to IPFS via Pinata.
 * Outputs films-cids.json for the deploy script.
 *
 * Usage:
 *   node scripts/upload-films-ipfs.js
 *
 * Requires PINATA_JWT in ../.env
 */

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const PINATA_JWT = process.env.PINATA_JWT;
if (!PINATA_JWT) {
  console.error("ERROR: PINATA_JWT not found in .env");
  process.exit(1);
}

const FILMS_DIR = path.resolve(__dirname, "../../frontend/public/films/onchain");
const POSTERS_DIR = path.resolve(FILMS_DIR, "posters");

const FILMS = [
  {
    key: "recording-studio",
    file: "dd-recording-studio.mp4",
    poster: "dd-recording-studio.jpg",
    name: "Diamond Drones Are a Girl's Best Friend — Recording Studio",
    description:
      "1/1 film by Miss AL Simpson. Part of the Diamond Drones Are a Girl's Best Friend film series. " +
      "A cinematic journey through the Recording Studio — where the Diamond Drones soundtrack was born. " +
      "ERC721 on Ethereum. DIAMOND DRONES is a registered trademark of Miss AL Simpson Limited.",
  },
  {
    key: "the-vault",
    file: "dd-the-vault.mp4",
    poster: "dd-the-vault.jpg",
    name: "Diamond Drones Are a Girl's Best Friend — The Vault",
    description:
      "1/1 film by Miss AL Simpson. Part of the Diamond Drones Are a Girl's Best Friend film series. " +
      "A cinematic journey through The Vault — the inner sanctum of the Diamond Drone universe. " +
      "ERC721 on Ethereum. DIAMOND DRONES is a registered trademark of Miss AL Simpson Limited.",
  },
  {
    key: "jewellery-box",
    file: "dd-jewellery-box.mp4",
    poster: "dd-jewellery-box.jpg",
    name: "Diamond Drones Are a Girl's Best Friend — Jewellery Box",
    description:
      "1/1 film by Miss AL Simpson. Part of the Diamond Drones Are a Girl's Best Friend film series. " +
      "A cinematic journey through the Jewellery Box — where diamonds become machines. " +
      "ERC721 on Ethereum. DIAMOND DRONES is a registered trademark of Miss AL Simpson Limited.",
  },
  {
    key: "diamond-drone-lounge",
    file: "dd-diamond-drone-lounge.mp4",
    poster: "dd-diamond-drone-lounge.jpg",
    name: "Diamond Drones Are a Girl's Best Friend — Diamond Drone Lounge",
    description:
      "1/1 film by Miss AL Simpson. Part of the Diamond Drones Are a Girl's Best Friend film series. " +
      "A cinematic journey through the Diamond Drone Lounge — glamour has taken flight. " +
      "ERC721 on Ethereum. DIAMOND DRONES is a registered trademark of Miss AL Simpson Limited.",
  },
];

async function pinFile(filePath, name) {
  const FormData = (await import("form-data")).default;
  const fetch = (await import("node-fetch")).default;

  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));
  form.append(
    "pinataMetadata",
    JSON.stringify({ name })
  );
  form.append(
    "pinataOptions",
    JSON.stringify({ cidVersion: 1 })
  );

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pinata upload failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.IpfsHash;
}

async function pinJSON(json, name) {
  const fetch = (await import("node-fetch")).default;

  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pinataContent: json,
      pinataMetadata: { name },
      pinataOptions: { cidVersion: 1 },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pinata JSON upload failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.IpfsHash;
}

async function main() {
  console.log("=====================================================");
  console.log("  UPLOADING DIAMOND DRONES FILMS TO IPFS (PINATA)");
  console.log("=====================================================\n");

  const results = {};

  for (const film of FILMS) {
    console.log(`--- ${film.name} ---`);

    // 1. Upload poster image
    const posterPath = path.join(POSTERS_DIR, film.poster);
    console.log(`  Uploading poster: ${film.poster}...`);
    const posterCID = await pinFile(posterPath, `DD Film Poster - ${film.key}`);
    console.log(`  Poster CID: ${posterCID}`);

    // 2. Upload film video
    const filmPath = path.join(FILMS_DIR, film.file);
    const fileSizeMB = (fs.statSync(filmPath).size / 1024 / 1024).toFixed(1);
    console.log(`  Uploading film: ${film.file} (${fileSizeMB} MB)...`);
    const filmCID = await pinFile(filmPath, `DD Film - ${film.key}`);
    console.log(`  Film CID: ${filmCID}`);

    // 3. Create and upload metadata
    // The contract baseURI points to a directory, and token ID is 1
    // So we create a metadata file named "1"
    const metadata = {
      name: film.name,
      description: film.description,
      image: `ipfs://${posterCID}`,
      animation_url: `ipfs://${filmCID}`,
      external_url: "https://diamonddrones.world/drones/cinema",
      attributes: [
        { trait_type: "Artist", value: "Miss AL Simpson" },
        { trait_type: "Collection", value: "Diamond Drones Films" },
        { trait_type: "Edition", value: "1/1" },
        { trait_type: "Medium", value: "Film" },
        { trait_type: "Resolution", value: "1920x1080" },
        { trait_type: "Format", value: "MP4 H.264" },
      ],
    };

    console.log(`  Uploading metadata...`);
    // Pin as a wrapped directory so baseURI + tokenId works
    // We'll pin the JSON directly and use it as the tokenURI
    const metadataCID = await pinJSON(metadata, `DD Film Metadata - ${film.key}`);
    console.log(`  Metadata CID: ${metadataCID}`);

    results[film.key] = {
      posterCID,
      filmCID,
      metadataCID,
      filmFile: film.file,
      name: film.name,
    };

    console.log("");
  }

  // Save CIDs
  const outFile = path.resolve(__dirname, "../films-cids.json");
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
  console.log("=====================================================");
  console.log("  ALL FILMS UPLOADED TO IPFS");
  console.log("=====================================================");
  for (const [key, val] of Object.entries(results)) {
    console.log(`  ${key}:`);
    console.log(`    Film:     ipfs://${val.filmCID}`);
    console.log(`    Poster:   ipfs://${val.posterCID}`);
    console.log(`    Metadata: ipfs://${val.metadataCID}`);
  }
  console.log(`\nSaved to ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
