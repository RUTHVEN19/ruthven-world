/**
 * Generate + pin ANIMATED POSTERS (5s looping clips) for the NEW Manga Machine
 * video tokens, for use as the on-chain displayUri/thumbnailUri so they loop in
 * the Objkt grid instead of showing a still frame.
 *
 * Only new videos (token >= NEW_FROM) get one — the original 51 are already
 * minted (immutable). CIDs are written to a SEPARATE file so this can run
 * alongside pin-tezos-assets.js without racing tezos-ipfs-progress.json.
 *
 * Requires PINATA_JWT in ../../.env + ffmpeg on PATH.
 * Usage: cd contracts && node scripts/pin-anim-posters.js
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const PINATA_JWT = process.env.PINATA_JWT;
const ROOT = path.resolve(__dirname, "../..");
const ASSETS = path.join(ROOT, "backend/uploads/sources/manga_machine_lora_4x");
const OUTDIR = path.join(ASSETS, "_animposters");
const MANIFEST = path.resolve(__dirname, "../tezos-manifest.json");
const OUT = path.resolve(__dirname, "../tezos-animposter.json"); // separate — no race
const NEW_FROM = 52; // original 51 are minted/immutable

const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

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
  fs.mkdirSync(OUTDIR, { recursive: true });
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  const done = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};

  const vids = manifest.filter((m) => m.type === "video" && m.token >= NEW_FROM);
  console.log(`\n  Animated on-chain posters for ${vids.length} new video tokens\n`);

  for (const m of vids) {
    if (done[m.media]) { console.log(`  #${m.token} ${m.title} — already pinned`); continue; }
    const src = path.join(ASSETS, m.media);
    const clip = path.join(OUTDIR, slug(m.title) + "-poster5s.mp4");
    // 5s, 720px wide, 20fps — a crisp looping thumbnail, still small
    execFileSync("ffmpeg", ["-y", "-t", "5", "-i", src,
      "-vf", "scale=720:trunc(ow/a/2)*2,fps=20",
      "-c:v", "libx264", "-crf", "24", "-preset", "veryfast", "-an",
      "-movflags", "+faststart", clip], { stdio: "ignore" });
    const kb = Math.round(fs.statSync(clip).size / 1024);
    const cid = await pinFile(clip, `MM ${m.token} ${m.title} animated poster`);
    done[m.media] = cid;
    fs.writeFileSync(OUT, JSON.stringify(done, null, 2));
    console.log(`  #${String(m.token).padStart(2)} ${m.title.slice(0, 30).padEnd(30)} (${kb}KB) ✓ ${cid.slice(0, 12)}…`);
  }

  console.log(`\n  Done. ${Object.keys(done).length} animated posters pinned → ${OUT}\n`);
}

main().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
