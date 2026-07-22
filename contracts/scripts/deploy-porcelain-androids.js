/**
 * Deploy the PorcelainAndroids (ERC-721A) contract.
 *
 * No sale, no drop. The whole collection is minted to the artist after deploy
 * (see mint-porcelain-androids.js), then surfaces on OpenSea automatically.
 *
 * Requires DEPLOYER_PRIVATE_KEY, INFURA_API_KEY, ETHERSCAN_API_KEY in ../.env
 * Usage (values come from build-porcelain-metadata.js):
 *   BASE_URI="ipfs://<dirCID>/" CONTRACT_URI="ipfs://<contractCID>" \
 *     npx hardhat run scripts/deploy-porcelain-androids.js --network sepolia   # rehearse first
 *   ...same with --network mainnet   # the real thing
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const baseURI = process.env.BASE_URI;
  const contractURI = process.env.CONTRACT_URI || "";
  if (!baseURI) {
    console.error('ERROR: set BASE_URI="ipfs://<dirCID>/" (from build-porcelain-metadata.js)');
    process.exit(1);
  }

  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("\n  DEPLOY: Porcelain Androids (ERC-721A)");
  console.log(`  Network:   ${hre.network.name}`);
  console.log(`  Deployer:  ${deployer.address}`);
  console.log(`  Balance:   ${hre.ethers.formatEther(balance)} ETH`);
  console.log(`  BASE_URI:  ${baseURI}`);
  console.log(`  Royalty:   7.5%\n`);

  const Factory = await hre.ethers.getContractFactory("PorcelainAndroids");
  const contract = await Factory.deploy(baseURI, contractURI);
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log(`  Deployed → ${address}\n`);

  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("  Waiting 30s before Etherscan verify…");
    await new Promise((r) => setTimeout(r, 30000));
    try {
      await hre.run("verify:verify", { address, constructorArguments: [baseURI, contractURI] });
      console.log("  Verified on Etherscan.\n");
    } catch (e) {
      console.log("  Verify skipped/failed:", e.message, "\n");
    }
  }

  fs.writeFileSync(
    path.resolve(__dirname, "../porcelain-androids-deployment.json"),
    JSON.stringify({ network: hre.network.name, contractAddress: address, deployer: deployer.address, baseURI, contractURI, royaltyBps: 750, deployedAt: new Date().toISOString() }, null, 2)
  );

  const explorer = hre.network.name === "mainnet" ? "https://etherscan.io/address/" : `https://${hre.network.name}.etherscan.io/address/`;
  console.log(`  Explorer:  ${explorer}${address}`);
  console.log("  Next: mint with mint-porcelain-androids.js\n");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
