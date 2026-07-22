/**
 * Deploy 4 DiamondDronesFilm contracts (one per film) and mint the 1/1 token on each.
 *
 * Usage:
 *   npx hardhat run scripts/deploy-films.js --network mainnet
 *
 * Requires:
 *   - Film video CIDs uploaded to IPFS (saved in films-cids.json)
 *   - DEPLOYER_PRIVATE_KEY, INFURA_API_KEY, ETHERSCAN_API_KEY in ../.env
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const FILMS = [
  {
    name: "DIAMOND DRONES ARE A GIRL'S BEST FRIEND - RECORDING STUDIO",
    symbol: "DDRS",
    key: "recording-studio",
  },
  {
    name: "DIAMOND DRONES ARE A GIRL'S BEST FRIEND - THE VAULT",
    symbol: "DDTV",
    key: "the-vault",
  },
  {
    name: "DIAMOND DRONES ARE A GIRL'S BEST FRIEND - JEWELLERY BOX",
    symbol: "DDJB",
    key: "jewellery-box",
  },
  {
    name: "DIAMOND DRONES ARE A GIRL'S BEST FRIEND - DIAMOND DRONE LOUNGE",
    symbol: "DDDL",
    key: "diamond-drone-lounge",
  },
];

async function main() {
  // ─── Load CIDs ─────────────────────────────────────────
  const cidFile = path.resolve(__dirname, "../films-cids.json");
  if (!fs.existsSync(cidFile)) {
    console.error("ERROR: films-cids.json not found. Upload film assets to IPFS first.");
    console.error("Expected format:");
    console.error(
      JSON.stringify(
        {
          "recording-studio": { metadataCID: "bafy..." },
          "the-vault": { metadataCID: "bafy..." },
          "jewellery-box": { metadataCID: "bafy..." },
          "diamond-drone-lounge": { metadataCID: "bafy..." },
        },
        null,
        2
      )
    );
    process.exit(1);
  }

  const cids = JSON.parse(fs.readFileSync(cidFile, "utf-8"));
  const royaltyBps = 500; // 5%

  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("═══════════════════════════════════════════════════");
  console.log("  DEPLOYING 4 DIAMOND DRONES FILM CONTRACTS");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Network:  ${hre.network.name}`);
  console.log(`  Deployer: ${deployer.address}`);
  console.log(`  Balance:  ${hre.ethers.formatEther(balance)} ETH`);
  console.log(`  Royalty:  ${royaltyBps / 100}%`);
  console.log("");

  const results = [];

  for (const film of FILMS) {
    const filmCids = cids[film.key];
    if (!filmCids || !filmCids.metadataCID) {
      console.error(`  ERROR: No metadataCID found for ${film.key}. Skipping.`);
      continue;
    }

    // 1/1 contract: tokenURI returns this directly (no tokenId suffix)
    const baseURI = `ipfs://${filmCids.metadataCID}`;

    console.log(`─── ${film.name} ───`);
    console.log(`  Symbol:   ${film.symbol}`);
    console.log(`  Base URI: ${baseURI}`);

    // Deploy
    const Factory = await hre.ethers.getContractFactory("DiamondDronesFilm");
    const contract = await Factory.deploy(film.name, film.symbol, baseURI, royaltyBps);
    await contract.waitForDeployment();
    const addr = await contract.getAddress();
    console.log(`  Contract: ${addr}`);

    // Mint the 1/1
    const mintTx = await contract.ownerMint();
    const receipt = await mintTx.wait();
    console.log(`  Mint tx:  ${receipt.hash}`);
    console.log(`  Gas:      ${receipt.gasUsed.toString()}`);

    results.push({
      name: film.name,
      symbol: film.symbol,
      key: film.key,
      contractAddress: addr,
      baseURI,
      mintTx: receipt.hash,
    });

    console.log("");
  }

  // ─── Verify all on Etherscan ───────────────────────────
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting 30s for block confirmations before verification...");
    await new Promise((resolve) => setTimeout(resolve, 30000));

    for (const r of results) {
      try {
        console.log(`Verifying ${r.symbol}...`);
        await hre.run("verify:verify", {
          address: r.contractAddress,
          constructorArguments: [r.name, r.symbol, r.baseURI, royaltyBps],
        });
        console.log(`  ${r.symbol} verified!`);
      } catch (error) {
        console.log(`  ${r.symbol} verification failed: ${error.message}`);
      }
    }
  }

  // ─── Summary ───────────────────────────────────────────
  console.log("");
  console.log("═══════════════════════════════════════════════════");
  console.log("  ALL FILMS DEPLOYED");
  console.log("═══════════════════════════════════════════════════");
  for (const r of results) {
    console.log(`  ${r.symbol}: ${r.contractAddress}`);
    if (hre.network.name === "mainnet") {
      console.log(`    Etherscan: https://etherscan.io/address/${r.contractAddress}`);
      console.log(`    OpenSea:   https://opensea.io/assets/ethereum/${r.contractAddress}/1`);
    }
  }
  console.log("═══════════════════════════════════════════════════");

  // Save deployment info
  const deployFile = path.resolve(__dirname, "../films-deployment.json");
  fs.writeFileSync(
    deployFile,
    JSON.stringify(
      {
        network: hre.network.name,
        deployer: deployer.address,
        royaltyBps,
        deployedAt: new Date().toISOString(),
        films: results,
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
