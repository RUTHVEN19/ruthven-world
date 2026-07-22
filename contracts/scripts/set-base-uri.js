const hre = require("hardhat");

async function main() {
  const contractAddress = "0xC226286CEd25D96bcEc1578a3ab582Cf5fBdC512";
  const newBaseURI = "ipfs://QmaiSF1KzT1bLfV8R5ueWzkDxxoAPNMRMnQsNWtCy7HWRE/";

  const contract = await hre.ethers.getContractAt("DiamondDrones", contractAddress);

  // Check current
  const currentURI = await contract.baseURI();
  console.log("Current baseURI:", currentURI);
  console.log("New baseURI:", newBaseURI);

  const tx = await contract.setBaseURI(newBaseURI);
  console.log("Tx hash:", tx.hash);

  const receipt = await tx.wait();
  console.log("Confirmed! Gas used:", receipt.gasUsed.toString());

  // Verify
  const updatedURI = await contract.baseURI();
  console.log("Updated baseURI:", updatedURI);

  const tokenURI = await contract.tokenURI(0);
  console.log("tokenURI(0):", tokenURI);
}

main().catch((e) => { console.error(e); process.exit(1); });
