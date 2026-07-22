/**
 * Metadata for the self-contained (single-file) Mini Manga Machine.
 *
 * Objkt failed to fetch a DIRECTORY CID — token #4 showed "Unable to load
 * asset" and no thumbnail. Single-file CIDs render fine (companions #1-#3).
 * So: artifact = one self-contained HTML file, thumbnail = one PNG file.
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const fs = require("fs");
const path = require("path");

const ARTIST = "tz1WKakHeqcemhukM7iDm15gaQN6byivaU5o";
const FA2 = "KT1Awrso9NUZvdB97uEXicSb7SqFEsdecPoc";
const COLLECTION_ID = 113300;
const EDITIONS = parseInt(process.argv[2] || "100", 10);
const TITLE = "NEON GRAFFITI GIRL";
const RIGHTS =
  "All intellectual property, copyright and reproduction rights in this artwork, " +
  "and in the names 'Porcelain Androids' and 'The Manga Machine', are retained by " +
  "MISS AL SIMPSON LIMITED. No IP or copyright transfers to the holder.";

(async () => {
  const cids = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../neon-graffiti-girl-singlefile.json"), "utf8"));
  const artifactUri = `ipfs://${cids.artifact}`;
  const thumbUri = `ipfs://${cids.thumb}`;

  const meta = {
    name: `${TITLE} — The Manga Machine`,
    description:
      "An interactive Manga Machine. Pull the lever: the porcelain android is read, " +
      "processed and transformed — the film plays, the manga memory prints out, and all " +
      "three works are revealed. Porcelain, manga and transformation, held inside one " +
      "machine you can run as often as you like. From THE MANGA MACHINE, the neon-lit " +
      "archive of Roppongi's porcelain androids by Miss AL Simpson.",
    tags: ["porcelain androids", "the manga machine", "mini manga machines", "interactive", "manga", "miss al simpson", "tezos"],
    symbol: "MANGA",
    artifactUri,
    displayUri: thumbUri,
    thumbnailUri: thumbUri,
    creators: [ARTIST],
    formats: [
      { uri: artifactUri, mimeType: "text/html" },
      { uri: thumbUri, mimeType: "image/png" },
    ],
    attributes: [
      { name: "Type", value: "Interactive" },
      { name: "Edition size", value: String(EDITIONS) },
      { name: "Contains", value: "Porcelain · Manga · Transformation" },
    ],
    decimals: 0,
    isBooleanAmount: false,
    shouldPreferSymbol: false,
    royalties: { decimals: 4, shares: { [ARTIST]: 750 } },
    rights: RIGHTS,
  };

  fs.writeFileSync(path.resolve(__dirname, "../neon-graffiti-girl-singlefile-metadata.json"), JSON.stringify(meta, null, 2));

  const fetch = (await import("node-fetch")).default;
  const r = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: { Authorization: "Bearer " + process.env.PINATA_JWT, "Content-Type": "application/json" },
    body: JSON.stringify({ pinataContent: meta, pinataMetadata: { name: `MMM ${TITLE} single-file x${EDITIONS}` }, pinataOptions: { cidVersion: 1 } }),
  });
  if (!r.ok) throw new Error("pin failed " + r.status + " " + (await r.text()));
  const { IpfsHash } = await r.json();

  const list = [{
    order: 1,
    title: `${TITLE} — interactive, self-contained (edition of ${EDITIONS})`,
    type: "interactive",
    metadataUri: `ipfs://${IpfsHash}`,
    target: ARTIST, fa2: FA2, collection_id: COLLECTION_ID, editions: EDITIONS,
  }];
  const out = path.resolve(__dirname, "../mmm-singlefile-mint-list.json");
  fs.writeFileSync(out, JSON.stringify(list, null, 2));
  fs.copyFileSync(out, path.resolve(__dirname, "../tezos-mint-page/mmm-singlefile-mint-list.json"));

  console.log(`  artifactUri : ${artifactUri}   ← single FILE ✓`);
  console.log(`  mime        : text/html`);
  console.log(`  displayUri  : ${thumbUri}   ← single FILE ✓`);
  console.log(`  editions    : ${EDITIONS}`);
  console.log(`  metadata    : ipfs://${IpfsHash}`);
  console.log(`\n  mint with: index.html?list=mmm-singlefile-mint-list.json&force=1\n`);
})().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
