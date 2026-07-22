/**
 * Deploy MangaMachine (ERC1155) contract.
 *
 * Usage:
 *   METADATA_URI="ipfs://QmXYZ/{id}.json" npx hardhat run scripts/deploy-manga-machine.js --network sepolia
 *
 * Requires DEPLOYER_PRIVATE_KEY, INFURA_API_KEY, ETHERSCAN_API_KEY in ../.env
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const metadataURI = process.env.METADATA_URI;

  if (!metadataURI) {
    console.error("ERROR: No METADATA_URI provided.");
    console.error("Set METADATA_URI to your IPFS metadata directory, e.g.:");
    console.error('  METADATA_URI="ipfs://QmXYZ/{id}.json" npx hardhat run scripts/deploy-manga-machine.js --network sepolia');
    process.exit(1);
  }

  console.log("═══════════════════════════════════════════════════");
  console.log("  DEPLOYING THE MANGA MACHINE (ERC1155)");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Network:       ${hre.network.name}`);
  console.log(`  Metadata URI:  ${metadataURI}`);
  console.log(`  Phase 1 Price: 0.099 ETH (Fresh Ink)`);
  console.log(`  Phase 2 Price: 0.066 ETH (Ink Depletion)`);
  console.log(`  Phase 3 Price: 0.033 ETH (Exhaustion)`);
  console.log(`  Royalty:       7.5%`);
  console.log(`  Tokens:        12 (3 triptychs + 3 bonus)`);
  console.log("");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`  Deployer:      ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`  Balance:       ${hre.ethers.formatEther(balance)} ETH\n`);

  console.log("Deploying contract...");
  const MangaMachine = await hre.ethers.getContractFactory("MangaMachine");
  const contract = await MangaMachine.deploy(metadataURI);
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`  Contract deployed to: ${contractAddress}\n`);

  // Verify on Etherscan
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting 30s for block confirmations before verification...");
    await new Promise((resolve) => setTimeout(resolve, 30000));

    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [metadataURI],
      });
      console.log("Contract verified on Etherscan!\n");
    } catch (error) {
      console.log("Verification failed:", error.message, "\n");
    }
  }

  console.log("═══════════════════════════════════════════════════");
  console.log("  DEPLOYMENT COMPLETE");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Contract:      ${contractAddress}`);
  console.log(`  Artist:        ${deployer.address}`);
  console.log(`  Metadata URI:  ${metadataURI}`);
  console.log(`  Royalty:       7.5%`);
  console.log("");
  console.log("  Next steps:");
  console.log("  1. Call configurePhase(0, startTime, endTime) for Phase 1");
  console.log("  2. Call configurePhase(1, startTime, endTime) for Phase 2");
  console.log("  3. Call configurePhase(2, startTime, endTime) for Phase 3");
  console.log("  4. After all phases, call airdropBonus([...collectors])");
  console.log("  5. Call withdraw() to collect ETH proceeds");

  if (hre.network.name === "sepolia") {
    console.log(`\n  Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
  } else if (hre.network.name === "mainnet") {
    console.log(`\n  Etherscan: https://etherscan.io/address/${contractAddress}`);
  }
  console.log("═══════════════════════════════════════════════════");

  // Save deployment info
  const deployFile = path.resolve(__dirname, "../manga-machine-deployment.json");
  fs.writeFileSync(
    deployFile,
    JSON.stringify(
      {
        network: hre.network.name,
        contractAddress,
        deployer: deployer.address,
        metadataURI,
        phases: [
          { phase: 1, name: "Fresh Ink", price: "0.099", tokens: [1, 2, 3] },
          { phase: 2, name: "Ink Depletion", price: "0.066", tokens: [4, 5, 6] },
          { phase: 3, name: "Exhaustion", price: "0.033", tokens: [7, 8, 9] },
        ],
        bonusTokens: [10, 11, 12],
        royaltyBps: 750,
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
