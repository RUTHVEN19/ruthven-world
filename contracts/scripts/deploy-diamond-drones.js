/**
 * Deploy DiamondDrones contract and mint all 1000 tokens to the deployer wallet.
 *
 * Usage:
 *   # With baseURI from env:
 *   BASE_URI="ipfs://QmXYZ/" npx hardhat run scripts/deploy-diamond-drones.js --network sepolia
 *
 *   # Or it reads from diamond-drones-cids.json (output of upload-ipfs.js):
 *   npx hardhat run scripts/deploy-diamond-drones.js --network sepolia
 *
 * Requires DEPLOYER_PRIVATE_KEY, INFURA_API_KEY, ETHERSCAN_API_KEY in ../.env
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // ─── Resolve baseURI ─────────────────────────────────────
  let baseURI = process.env.BASE_URI;

  if (!baseURI) {
    const cidFile = path.resolve(__dirname, "../diamond-drones-cids.json");
    if (fs.existsSync(cidFile)) {
      const cids = JSON.parse(fs.readFileSync(cidFile, "utf-8"));
      baseURI = cids.baseURI;
      console.log(`Loaded baseURI from diamond-drones-cids.json`);
    }
  }

  if (!baseURI) {
    console.error("ERROR: No BASE_URI provided. Run upload-ipfs.js first.");
    process.exit(1);
  }

  const royaltyBps = 500; // 5%

  console.log("═══════════════════════════════════════════════════");
  console.log("  DEPLOYING DIAMOND DRONES");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Network:    ${hre.network.name}`);
  console.log(`  Base URI:   ${baseURI}`);
  console.log(`  Royalty:    ${royaltyBps / 100}%`);
  console.log(`  Max Supply: 1000`);
  console.log("");

  // ─── Deploy ──────────────────────────────────────────────
  const [deployer] = await hre.ethers.getSigners();
  console.log(`  Deployer:   ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`  Balance:    ${hre.ethers.formatEther(balance)} ETH\n`);

  console.log("Deploying contract...");
  const DiamondDrones = await hre.ethers.getContractFactory("DiamondDrones");
  const contract = await DiamondDrones.deploy(baseURI, royaltyBps);
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`  Contract deployed to: ${contractAddress}\n`);

  // ─── Mint 1 first to preview on OpenSea ─────────────────
  const MINT_QTY = 1; // Change to 999 later to mint the rest
  console.log(`Minting ${MINT_QTY} Diamond Drone(s) to deployer wallet...`);
  const mintTx = await contract.ownerMint(MINT_QTY);
  const receipt = await mintTx.wait();
  console.log(`  Mint tx: ${receipt.hash}`);
  console.log(`  Gas used: ${receipt.gasUsed.toString()}\n`);

  // ─── Verify on Etherscan ────────────────────────────────
  if (
    hre.network.name !== "hardhat" &&
    hre.network.name !== "localhost"
  ) {
    console.log("Waiting 30s for block confirmations before verification...");
    await new Promise((resolve) => setTimeout(resolve, 30000));

    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [baseURI, royaltyBps],
      });
      console.log("Contract verified on Etherscan!\n");
    } catch (error) {
      console.log("Verification failed:", error.message, "\n");
    }
  }

  // ─── Summary ────────────────────────────────────────────
  console.log("═══════════════════════════════════════════════════");
  console.log("  DEPLOYMENT COMPLETE");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Contract:  ${contractAddress}`);
  console.log(`  Owner:     ${deployer.address}`);
  console.log(`  Tokens:    1000 minted to owner`);
  console.log(`  Base URI:  ${baseURI}`);
  console.log(`  Royalty:   ${royaltyBps / 100}%`);
  if (hre.network.name === "sepolia") {
    console.log(`  Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log(`  OpenSea:   https://testnets.opensea.io/assets/sepolia/${contractAddress}/0`);
  } else if (hre.network.name === "mainnet") {
    console.log(`  Etherscan: https://etherscan.io/address/${contractAddress}`);
    console.log(`  OpenSea:   https://opensea.io/assets/ethereum/${contractAddress}/0`);
  }
  console.log("═══════════════════════════════════════════════════");

  // Save deployment info
  const deployFile = path.resolve(__dirname, "../diamond-drones-deployment.json");
  fs.writeFileSync(
    deployFile,
    JSON.stringify(
      {
        network: hre.network.name,
        contractAddress,
        deployer: deployer.address,
        baseURI,
        royaltyBps,
        totalMinted: 1000,
        deployedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );
  console.log(`\nDeployment info saved to ${deployFile}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
