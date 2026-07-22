/**
 * Pin an artifact + thumbnail as SINGLE-FILE CIDs.
 *
 * Objkt could not fetch a directory CID (token #4 failed with "Unable to load
 * asset", thumbnail included). Single-file CIDs work — the three companion
 * tokens prove it. So the self-contained HTML and its thumbnail are pinned as
 * individual files, matching the pattern that demonstrably renders.
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "../..");

(async () => {
  const fetch = (await import("node-fetch")).default;
  const FormData = (await import("form-data")).default;
  const out = {};
  const jobs = [
    ["artifact", path.join(ROOT, "artifacts/neon-graffiti-girl-selfcontained/index.html"), "MMM NeonGraffitiGirl self-contained machine"],
    ["thumb", path.join(ROOT, "artifacts/neon-graffiti-girl/machine-porcelain.png"), "MMM NeonGraffitiGirl machine thumbnail"],
  ];
  for (const [key, file, name] of jobs) {
    if (!fs.existsSync(file)) throw new Error("missing " + file);
    const form = new FormData();
    form.append("file", fs.createReadStream(file));
    form.append("pinataMetadata", JSON.stringify({ name }));
    form.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));
    const r = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: "Bearer " + process.env.PINATA_JWT, ...form.getHeaders() },
      body: form,
    });
    if (!r.ok) throw new Error(key + " pin failed " + r.status + " " + (await r.text()));
    const { IpfsHash } = await r.json();
    out[key] = IpfsHash;
    console.log(`  ${key.padEnd(9)} ${(fs.statSync(file).size / 1048576).toFixed(1)} MB  ✓ ${IpfsHash}`);
  }
  fs.writeFileSync(path.resolve(__dirname, "../neon-graffiti-girl-singlefile.json"), JSON.stringify(out, null, 2));
  console.log("\n  → neon-graffiti-girl-singlefile.json");
})().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
