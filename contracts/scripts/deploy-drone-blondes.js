/**
 * Deploy DroneBlondes contract and mint all 120 tokens to the deployer wallet.
 *
 * Usage:
 *   BASE_URI="ipfs://QmXYZ/" npx hardhat run scripts/deploy-drone-blondes.js --network mainnet
 *
 * Or reads from drone-blondes-cids.json (output of IPFS upload).
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
    const cidFile = path.resolve(__dirname, "../drone-blondes-cids.json");
    if (fs.existsSync(cidFile)) {
      const cids = JSON.parse(fs.readFileSync(cidFile, "utf-8"));
      baseURI = cids.baseURI;
      console.log(`Loaded baseURI from drone-blondes-cids.json`);
    }
  }

  if (!baseURI) {
    console.error("ERROR: No BASE_URI provided. Upload metadata to IPFS first.");
    process.exit(1);
  }

  const royaltyBps = 500; // 5%

  console.log("═══════════════════════════════════════════════════");
  console.log("  DEPLOYING DRONE BLONDES");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Network:    ${hre.network.name}`);
  console.log(`  Base URI:   ${baseURI}`);
  console.log(`  Royalty:    ${royaltyBps / 100}%`);
  console.log(`  Max Supply: 120`);
  console.log(`  Token IDs:  1 through 120`);
  console.log("");

  // ─── Deploy ──────────────────────────────────────────────
  const [deployer] = await hre.ethers.getSigners();
  console.log(`  Deployer:   ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`  Balance:    ${hre.ethers.formatEther(balance)} ETH\n`);

  console.log("Deploying contract...");
  const DroneBlondes = await hre.ethers.getContractFactory("DroneBlondes");
  const contract = await DroneBlondes.deploy(baseURI, royaltyBps);
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`  Contract deployed to: ${contractAddress}\n`);

  // ─── Mint all 120 to deployer wallet ────────────────────
  const MINT_QTY = 120;
  console.log(`Minting ${MINT_QTY} Drone Blonde(s) to deployer wallet...`);
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
  console.log(`  Tokens:    ${MINT_QTY} minted (Token #1–#120)`);
  console.log(`  Base URI:  ${baseURI}`);
  console.log(`  Royalty:   ${royaltyBps / 100}%`);
  if (hre.network.name === "sepolia") {
    console.log(`  Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log(`  OpenSea:   https://testnets.opensea.io/assets/sepolia/${contractAddress}/1`);
  } else if (hre.network.name === "mainnet") {
    console.log(`  Etherscan: https://etherscan.io/address/${contractAddress}`);
    console.log(`  OpenSea:   https://opensea.io/assets/ethereum/${contractAddress}/1`);
  }
  console.log("═══════════════════════════════════════════════════");

  // Save deployment info
  const deployFile = path.resolve(__dirname, "../drone-blondes-deployment.json");
  fs.writeFileSync(
    deployFile,
    JSON.stringify(
      {
        network: hre.network.name,
        contractAddress,
        deployer: deployer.address,
        baseURI,
        royaltyBps,
        mintedSoFar: MINT_QTY,
        maxSupply: 120,
        tokenIdStart: 1,
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
