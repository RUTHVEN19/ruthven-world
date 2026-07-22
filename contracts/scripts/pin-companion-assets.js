/**
 * Pin the three companion works for a Mini Manga Machine edition:
 *   磁器 Porcelain · 漫画 Manga · 変換 Transformation
 *
 * These become their own Objkt editions, airdropped to whoever collects the
 * machine. Masters are pinned (not the downscaled copies inside the artifact),
 * matching how the 70 one-of-ones were pinned.
 *
 * Usage: cd contracts && node scripts/pin-companion-assets.js <slug>
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const fs = require("fs");
const path = require("path");

const PINATA_JWT = process.env.PINATA_JWT;
const ROOT = path.resolve(__dirname, "../..");
const PUB = path.join(ROOT, "frontend/public/androids");

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
  const slug = (process.argv[2] || "").trim().toLowerCase();
  if (!slug) { console.error("usage: pin-companion-assets.js <slug>"); process.exit(1); }

  const parts = [
    { key: "porcelain", kanji: "磁器", label: "Porcelain", file: path.join(PUB, "stills", `${slug}.png`), mime: "image/png" },
    { key: "manga", kanji: "漫画", label: "Manga", file: path.join(PUB, "manga", `${slug}.png`), mime: "image/png" },
    { key: "transformation", kanji: "変換", label: "Transformation", file: path.join(PUB, "transformations", `${slug}.mp4`), mime: "video/mp4" },
  ];
  for (const p of parts) if (!fs.existsSync(p.file)) { console.error("ERROR: missing", p.file); process.exit(1); }

  const out = path.resolve(__dirname, `../${slug}-companions.json`);
  const done = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : {};

  console.log(`\n  Pinning the three companion works for ${slug}\n`);
  for (const p of parts) {
    if (done[p.key]?.cid) { console.log(`  ${p.kanji} ${p.label.padEnd(15)} already pinned`); continue; }
    const mb = (fs.statSync(p.file).size / 1048576).toFixed(1);
    const cid = await pinFile(p.file, `MiniMangaMachine ${slug} ${p.label}`);
    done[p.key] = { cid, mime: p.mime, kanji: p.kanji, label: p.label, bytes: fs.statSync(p.file).size };
    fs.writeFileSync(out, JSON.stringify(done, null, 2));
    console.log(`  ${p.kanji} ${p.label.padEnd(15)} ${mb.padStart(6)} MB  ✓ ${cid.slice(0, 14)}…`);
  }
  console.log(`\n  CIDs → ${path.basename(out)}\n`);
}

main().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
