/**
 * Mint the full Porcelain Androids collection to the artist wallet.
 *
 * ERC-721A batch mint — all 116 in a few transactions (cheap per-token).
 * Recipient defaults to OWNER_ADDRESS in ../.env (falls back to the deployer).
 *
 * Requires DEPLOYER_PRIVATE_KEY, INFURA_API_KEY in ../.env
 * Usage:
 *   CONTRACT=0x... npx hardhat run scripts/mint-porcelain-androids.js --network sepolia   # rehearse
 *   CONTRACT=0x... npx hardhat run scripts/mint-porcelain-androids.js --network mainnet   # real
 *   CONTRACT=0x... TO=0xYourWallet BATCH=40 npx hardhat run ...                            # overrides
 */

const hre = require("hardhat");

async function main() {
  const address = process.env.CONTRACT;
  if (!address) { console.error("ERROR: set CONTRACT=0x... (deployed address)"); process.exit(1); }

  const [signer] = await hre.ethers.getSigners();
  const to = process.env.TO || process.env.OWNER_ADDRESS || signer.address;
  const TOTAL = 116;
  const BATCH = parseInt(process.env.BATCH || "40", 10); // 3 txs of 40/40/36

  const contract = await hre.ethers.getContractAt("PorcelainAndroids", address);
  const already = Number(await contract.totalSupply());
  console.log("\n  MINT: Porcelain Androids");
  console.log(`  Network:   ${hre.network.name}`);
  console.log(`  Contract:  ${address}`);
  console.log(`  Recipient: ${to}`);
  console.log(`  Already minted: ${already} / ${TOTAL}\n`);

  let remaining = TOTAL - already;
  if (remaining <= 0) { console.log("  Nothing to mint — collection already complete.\n"); return; }

  while (remaining > 0) {
    const qty = Math.min(BATCH, remaining);
    process.stdout.write(`  Minting ${qty}…`);
    const tx = await contract.mintTo(to, qty);
    const rc = await tx.wait();
    console.log(`  ✓ tx ${rc.hash.slice(0, 12)}…  (gas ${rc.gasUsed})`);
    remaining -= qty;
  }

  const supply = Number(await contract.totalSupply());
  console.log(`\n  Done. Total supply: ${supply} / ${TOTAL}`);
  console.log("  OpenSea will auto-index. To force it: open the collection on OpenSea → ... → Refresh metadata.\n");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
