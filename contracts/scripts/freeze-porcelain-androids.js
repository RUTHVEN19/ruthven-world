/**
 * Permanently FREEZE the Porcelain Androids metadata — one-way, irreversible.
 * Run ONLY after confirming all 116 render correctly on OpenSea.
 *
 * Usage:
 *   CONTRACT=0x... npx hardhat run scripts/freeze-porcelain-androids.js --network mainnet
 */
const hre = require("hardhat");

async function main() {
  const address = process.env.CONTRACT;
  if (!address) { console.error("ERROR: set CONTRACT=0x..."); process.exit(1); }

  const c = await hre.ethers.getContractAt("PorcelainAndroids", address);
  if (await c.metadataFrozen()) { console.log("Already frozen — nothing to do."); return; }

  console.log(`Freezing metadata on ${address} (${hre.network.name})…`);
  const tx = await c.freezeMetadata();
  const rc = await tx.wait();
  console.log(`  ✓ Frozen. tx ${rc.hash}  (gas ${rc.gasUsed})`);
  console.log(`  metadataFrozen: ${await c.metadataFrozen()}`);
  console.log("  The artwork of all 116 tokens is now permanent and can never be changed.");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
