/**
 * RUTHVEN: FIRST LIGHT — Deployment Script
 *
 * Before running this:
 *   1. Run: python3 scripts/upload-ruthven-ipfs.py
 *   2. Paste the Base URI output below
 *
 * Deploy to Sepolia testnet first:
 *   npx hardhat run scripts/deploy-ruthven.js --network sepolia
 *
 * Then mainnet when ready:
 *   npx hardhat run scripts/deploy-ruthven.js --network mainnet
 */

const hre = require("hardhat");

// ─── CONFIGURE BEFORE DEPLOYING ──────────────────────────────────────────────

// Token metadata is served by the Railway backend.
// The contract appends the token ID: baseURI + "1", baseURI + "2", etc.
const BASE_URI = "https://ruthven-world-production.up.railway.app/api/nfts/metadata/";

// Collection settings
const NAME       = "FIRST LIGHT";
const SYMBOL     = "RFLT";
const MAX_SUPPLY = 25;

// Mint price in ETH (1/1 paintings — adjust as desired)
const MINT_PRICE_ETH = "0.04";

// Choose mode: true = collectors pick their specific painting
const CHOOSE_MODE = true;

// Tiered pricing: false = flat price for all 25
const TIERED_PRICING = false;

// No allowlist — mint opens March 31st 5pm GMT
const MERKLE_ROOT   = hre.ethers.ZeroHash;
const PRESALE_START = 0;
const PRESALE_END   = 0;
const PUBLIC_START  = Math.floor(new Date('2026-03-31T17:00:00Z').getTime() / 1000); // March 31st 5pm GMT

// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  if (BASE_URI.includes("PASTE_FOLDER_CID_HERE")) {
    console.error("\n❌ ERROR: You must run upload-ruthven-ipfs.py first and paste the Base URI above.\n");
    process.exit(1);
  }

  const [deployer] = await hre.ethers.getSigners();
  const mintPrice  = hre.ethers.parseEther(MINT_PRICE_ETH);
  const network    = hre.network.name;

  console.log("\n" + "═".repeat(60));
  console.log("  RUTHVEN: FIRST LIGHT — Contract Deployment");
  console.log("═".repeat(60));
  console.log(`  Network      : ${network}`);
  console.log(`  Deployer     : ${deployer.address}`);
  console.log(`  Balance      : ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} ETH`);
  console.log(`  Name         : ${NAME}`);
  console.log(`  Symbol       : ${SYMBOL}`);
  console.log(`  Max Supply   : ${MAX_SUPPLY}`);
  console.log(`  Mint Price   : ${MINT_PRICE_ETH} ETH`);
  console.log(`  Choose Mode  : ${CHOOSE_MODE}`);
  console.log(`  Base URI     : ${BASE_URI}`);
  console.log("═".repeat(60) + "\n");

  if (network === "mainnet") {
    console.log("⚠  MAINNET DEPLOYMENT — proceeding in 5 seconds…");
    await new Promise(r => setTimeout(r, 5000));
  }

  console.log("Deploying RuthvenFirstLight as RUTHVEN: FIRST LIGHT…");

  const Contract = await hre.ethers.getContractFactory("RuthvenFirstLight");
  const nft = await Contract.deploy(
    NAME,
    SYMBOL,
    MAX_SUPPLY,
    mintPrice,
    BASE_URI,
    CHOOSE_MODE,
    TIERED_PRICING,
    MERKLE_ROOT,
    PRESALE_START,
    PRESALE_END,
    PUBLIC_START
  );

  await nft.waitForDeployment();
  const address = await nft.getAddress();

  console.log(`\n✅ Contract deployed to: ${address}`);
  console.log(`   Network: ${network}`);

  if (network === "sepolia") {
    console.log(`\n   View on Etherscan: https://sepolia.etherscan.io/address/${address}`);
  } else if (network === "mainnet") {
    console.log(`\n   View on Etherscan: https://etherscan.io/address/${address}`);
    console.log(`   View on OpenSea:   https://opensea.io/assets/ethereum/${address}`);
  }

  // ── Verify on Etherscan ───────────────────────────────────────────────────
  if (network !== "hardhat" && network !== "localhost") {
    console.log("\nWaiting 30s for block confirmations before verifying…");
    await new Promise(r => setTimeout(r, 30000));

    try {
      await hre.run("verify:verify", {
        address,
        constructorArguments: [
          NAME, SYMBOL, MAX_SUPPLY, mintPrice, BASE_URI,
          CHOOSE_MODE, TIERED_PRICING, MERKLE_ROOT,
          PRESALE_START, PRESALE_END, PUBLIC_START
        ],
      });
      console.log("✅ Contract verified on Etherscan!");
    } catch (err) {
      console.log("⚠  Etherscan verification failed (you can retry manually):", err.message);
    }
  }

  // ── Print next steps ──────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(60));
  console.log("  NEXT STEPS");
  console.log("═".repeat(60));
  console.log(`\n  1. Add this to your frontend .env:`);
  console.log(`     VITE_RUTHVEN_CONTRACT=${address}`);
  console.log(`     VITE_RUTHVEN_NETWORK=${network}`);
  console.log(`     VITE_RUTHVEN_CHAIN_ID=${network === 'mainnet' ? 1 : 11155111}`);
  console.log(`\n  2. Update the mint button in MintPage.jsx to use:`);
  console.log(`     mintSpecific(tokenId) with contract address ${address}`);
  console.log(`\n  3. Test: connect wallet → click a painting → mint`);
  console.log("═".repeat(60) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
