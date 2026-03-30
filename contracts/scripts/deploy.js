const hre = require("hardhat");

async function main() {
  const name = process.env.COLLECTION_NAME || "Miss AL Simpson Genesis";
  const symbol = process.env.COLLECTION_SYMBOL || "MALS";
  const maxSupply = parseInt(process.env.MAX_SUPPLY || "100");
  const mintPrice = hre.ethers.parseEther(process.env.MINT_PRICE_ETH || "0.05");
  const baseURI = process.env.BASE_URI || "ipfs://QmPlaceholder/";

  console.log("Deploying MissALSimpsonNFT...");
  console.log(`  Name: ${name}`);
  console.log(`  Symbol: ${symbol}`);
  console.log(`  Max Supply: ${maxSupply}`);
  console.log(`  Mint Price: ${hre.ethers.formatEther(mintPrice)} ETH`);
  console.log(`  Base URI: ${baseURI}`);

  const MissALSimpsonNFT = await hre.ethers.getContractFactory("MissALSimpsonNFT");
  const nft = await MissALSimpsonNFT.deploy(name, symbol, maxSupply, mintPrice, baseURI);

  await nft.waitForDeployment();
  const address = await nft.getAddress();

  console.log(`\nMissALSimpsonNFT deployed to: ${address}`);
  console.log(`Network: ${hre.network.name}`);

  // Verify on Etherscan if not on hardhat network
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting for block confirmations...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [name, symbol, maxSupply, mintPrice, baseURI],
      });
      console.log("Contract verified on Etherscan!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
