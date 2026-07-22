/**
 * Pin an interactive HTML artifact DIRECTORY to IPFS (Pinata).
 *
 * Objkt supports HTML artifacts served from an IPFS directory, so the page can
 * reference its assets by relative path:
 *   artifactUri = ipfs://<dirCID>/index.html
 *
 * Usage: cd contracts && node scripts/pin-html-artifact.js ../artifacts/neon-graffiti-girl
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const fs = require("fs");
const path = require("path");

const PINATA_JWT = process.env.PINATA_JWT;
const dir = path.resolve(process.cwd(), process.argv[2] || "");

function walk(d, base) {
  return fs.readdirSync(d).flatMap((f) => {
    const p = path.join(d, f);
    if (f.startsWith(".")) return [];
    return fs.statSync(p).isDirectory() ? walk(p, base) : [{ abs: p, rel: path.relative(base, p) }];
  });
}

async function main() {
  if (!PINATA_JWT) { console.error("ERROR: PINATA_JWT not set in ../../.env"); process.exit(1); }
  if (!fs.existsSync(dir)) { console.error("ERROR: no such directory:", dir); process.exit(1); }

  const fetch = (await import("node-fetch")).default;
  const FormData = (await import("form-data")).default;

  const files = walk(dir, dir);
  const name = path.basename(dir);
  console.log(`\n  Pinning HTML artifact directory "${name}" (${files.length} files)\n`);

  const form = new FormData();
  let bytes = 0;
  for (const f of files) {
    // the leading folder name is what makes Pinata treat this as a directory
    form.append("file", fs.createReadStream(f.abs), { filepath: `${name}/${f.rel}` });
    const sz = fs.statSync(f.abs).size; bytes += sz;
    console.log(`   + ${f.rel.padEnd(20)} ${(sz / 1024).toFixed(0)} KB`);
  }
  form.append("pinataMetadata", JSON.stringify({ name: `${name} (interactive artifact)` }));
  form.append("pinataOptions", JSON.stringify({ cidVersion: 1, wrapWithDirectory: false }));

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${PINATA_JWT}`, ...form.getHeaders() },
    body: form,
    // large-ish upload
    highWaterMark: 1024 * 1024,
  });
  if (!res.ok) throw new Error(`Pinata pin failed (${res.status}): ${await res.text()}`);
  const { IpfsHash } = await res.json();

  console.log(`\n  ✓ directory CID: ${IpfsHash}   (${(bytes / 1048576).toFixed(1)} MB)`);
  console.log(`\n  artifactUri : ipfs://${IpfsHash}/index.html`);
  console.log(`  preview     : https://gateway.pinata.cloud/ipfs/${IpfsHash}/index.html\n`);

  fs.writeFileSync(
    path.resolve(__dirname, `../${name}-artifact.json`),
    JSON.stringify({ name, cid: IpfsHash, artifactUri: `ipfs://${IpfsHash}/index.html`, files: files.map(f => f.rel), bytes }, null, 2)
  );
}

main().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
