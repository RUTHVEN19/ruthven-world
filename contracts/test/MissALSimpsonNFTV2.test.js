const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

// Helper: build Merkle tree from addresses
function buildMerkleTree(addresses) {
  const leaves = addresses.map((addr) =>
    ethers.solidityPackedKeccak256(["address"], [addr])
  );
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  return tree;
}

function getProof(tree, address) {
  const leaf = ethers.solidityPackedKeccak256(["address"], [address]);
  return tree.getHexProof(leaf);
}

describe("MissALSimpsonNFTV2", function () {
  let nft;
  let owner, addr1, addr2, addr3;
  const NAME = "Test V2 Collection";
  const SYMBOL = "TV2";
  const MAX_SUPPLY = 10;
  const MINT_PRICE = ethers.parseEther("0.05");
  const BASE_URI = "ipfs://QmTestHash/";
  const ZERO_BYTES32 = ethers.ZeroHash;

  // Deploy helper with defaults
  async function deployV2(overrides = {}) {
    const factory = await ethers.getContractFactory("MissALSimpsonNFTV2");
    const contract = await factory.deploy(
      overrides.name || NAME,
      overrides.symbol || SYMBOL,
      overrides.maxSupply || MAX_SUPPLY,
      overrides.mintPrice || MINT_PRICE,
      overrides.baseURI || BASE_URI,
      overrides.chooseMode || false,
      overrides.tieredPricing || false,
      overrides.merkleRoot || ZERO_BYTES32,
      overrides.presaleStart || 0,
      overrides.presaleEnd || 0,
      overrides.publicStart || 0
    );
    await contract.waitForDeployment();
    return contract;
  }

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
  });

  // ═══════════════════════════════════════════════════
  //  BASIC BLIND MINT (backwards compatible with V1)
  // ═══════════════════════════════════════════════════
  describe("Blind Mint (V1 compatibility)", function () {
    beforeEach(async function () {
      nft = await deployV2();
    });

    it("Should deploy with correct params", async function () {
      expect(await nft.name()).to.equal(NAME);
      expect(await nft.symbol()).to.equal(SYMBOL);
      expect(await nft.maxSupply()).to.equal(MAX_SUPPLY);
      expect(await nft.mintPrice()).to.equal(MINT_PRICE);
      expect(await nft.baseURI()).to.equal(BASE_URI);
      expect(await nft.chooseMode()).to.equal(false);
      expect(await nft.tieredPricing()).to.equal(false);
    });

    it("Should mint with correct payment", async function () {
      await nft.connect(addr1).mint(1, { value: MINT_PRICE });
      expect(await nft.totalSupply()).to.equal(1);
      expect(await nft.ownerOf(0)).to.equal(addr1.address);
    });

    it("Should mint multiple tokens", async function () {
      await nft.connect(addr1).mint(3, { value: MINT_PRICE * 3n });
      expect(await nft.totalSupply()).to.equal(3);
    });

    it("Should refund excess payment", async function () {
      const excess = ethers.parseEther("0.1");
      const balBefore = await ethers.provider.getBalance(addr1.address);
      const tx = await nft.connect(addr1).mint(1, { value: MINT_PRICE + excess });
      const receipt = await tx.wait();
      const gas = receipt.gasUsed * receipt.gasPrice;
      const balAfter = await ethers.provider.getBalance(addr1.address);
      expect(balBefore - balAfter).to.be.closeTo(MINT_PRICE + gas, ethers.parseEther("0.001"));
    });

    it("Should reject insufficient payment", async function () {
      await expect(
        nft.connect(addr1).mint(1, { value: MINT_PRICE - 1n })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should reject exceeding max supply", async function () {
      await nft.connect(addr1).mint(MAX_SUPPLY, { value: MINT_PRICE * BigInt(MAX_SUPPLY) });
      await expect(
        nft.connect(addr1).mint(1, { value: MINT_PRICE })
      ).to.be.revertedWith("Exceeds max supply");
    });

    it("Should reject mintSpecific in blind mode", async function () {
      await expect(
        nft.connect(addr1).mintSpecific(0, { value: MINT_PRICE })
      ).to.be.revertedWith("Choose mode not enabled");
    });

    it("Should return correct tokenURI", async function () {
      await nft.connect(addr1).mint(1, { value: MINT_PRICE });
      expect(await nft.tokenURI(0)).to.equal(BASE_URI + "0.json");
    });
  });

  // ═══════════════════════════════════════════════════
  //  CHOOSE YOUR MINT
  // ═══════════════════════════════════════════════════
  describe("Choose Your Mint", function () {
    beforeEach(async function () {
      nft = await deployV2({ chooseMode: true });
    });

    it("Should reject blind mint in choose mode", async function () {
      await expect(
        nft.connect(addr1).mint(1, { value: MINT_PRICE })
      ).to.be.revertedWith("Use mintSpecific in choose mode");
    });

    it("Should mint a specific token ID", async function () {
      await nft.connect(addr1).mintSpecific(5, { value: MINT_PRICE });
      expect(await nft.ownerOf(5)).to.equal(addr1.address);
      expect(await nft.totalSupply()).to.equal(1);
      expect(await nft.tokenMinted(5)).to.equal(true);
    });

    it("Should mint multiple specific tokens by different users", async function () {
      await nft.connect(addr1).mintSpecific(0, { value: MINT_PRICE });
      await nft.connect(addr2).mintSpecific(7, { value: MINT_PRICE });
      await nft.connect(addr1).mintSpecific(3, { value: MINT_PRICE });

      expect(await nft.ownerOf(0)).to.equal(addr1.address);
      expect(await nft.ownerOf(7)).to.equal(addr2.address);
      expect(await nft.ownerOf(3)).to.equal(addr1.address);
      expect(await nft.totalSupply()).to.equal(3);
    });

    it("Should reject minting already-minted token", async function () {
      await nft.connect(addr1).mintSpecific(3, { value: MINT_PRICE });
      await expect(
        nft.connect(addr2).mintSpecific(3, { value: MINT_PRICE })
      ).to.be.revertedWith("Token already minted");
    });

    it("Should reject invalid token ID", async function () {
      await expect(
        nft.connect(addr1).mintSpecific(MAX_SUPPLY, { value: MINT_PRICE })
      ).to.be.revertedWith("Invalid token ID");
    });

    it("Should reject insufficient payment", async function () {
      await expect(
        nft.connect(addr1).mintSpecific(0, { value: MINT_PRICE - 1n })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should allow owner to mint specific token for free", async function () {
      await nft.ownerMintSpecific(4);
      expect(await nft.ownerOf(4)).to.equal(owner.address);
      expect(await nft.tokenMinted(4)).to.equal(true);
    });

    it("Should reject ownerMintSpecific for already minted token", async function () {
      await nft.connect(addr1).mintSpecific(4, { value: MINT_PRICE });
      await expect(nft.ownerMintSpecific(4)).to.be.revertedWith("Token already minted");
    });

    it("Should track totalMinted correctly in choose mode", async function () {
      expect(await nft.totalMinted()).to.equal(0);
      await nft.connect(addr1).mintSpecific(5, { value: MINT_PRICE });
      await nft.connect(addr1).mintSpecific(2, { value: MINT_PRICE });
      expect(await nft.totalMinted()).to.equal(2);
    });
  });

  // ═══════════════════════════════════════════════════
  //  TIERED PRICING
  // ═══════════════════════════════════════════════════
  describe("Tiered Pricing", function () {
    const TIER1_PRICE = ethers.parseEther("0.03"); // first 3 mints
    const TIER2_PRICE = ethers.parseEther("0.06"); // mints 3-6
    const TIER3_PRICE = ethers.parseEther("0.1");  // mints 7+

    beforeEach(async function () {
      nft = await deployV2({ tieredPricing: true });
      await nft.setPriceTiers(
        [3, 7],          // thresholds
        [TIER2_PRICE, TIER3_PRICE] // prices
      );
    });

    it("Should return base price before first tier", async function () {
      expect(await nft.getCurrentPrice()).to.equal(MINT_PRICE);
    });

    it("Should return tier 2 price after threshold", async function () {
      await nft.connect(addr1).mint(3, { value: MINT_PRICE * 3n });
      expect(await nft.getCurrentPrice()).to.equal(TIER2_PRICE);
    });

    it("Should return tier 3 price after second threshold", async function () {
      // Mint 7 total to trigger tier 3
      await nft.connect(addr1).mint(3, { value: MINT_PRICE * 3n });
      await nft.connect(addr1).mint(4, { value: TIER2_PRICE * 4n });
      expect(await nft.getCurrentPrice()).to.equal(TIER3_PRICE);
    });

    it("Should charge correct price at each tier", async function () {
      // Mint 1 at base price
      await nft.connect(addr1).mint(1, { value: MINT_PRICE });
      expect(await nft.totalSupply()).to.equal(1);

      // Mint 2 more at base (still under threshold 3)
      await nft.connect(addr1).mint(2, { value: MINT_PRICE * 2n });
      expect(await nft.totalSupply()).to.equal(3);

      // Now at tier 2 (threshold 3 reached)
      await nft.connect(addr1).mint(1, { value: TIER2_PRICE });
      expect(await nft.totalSupply()).to.equal(4);
    });

    it("Should reject payment below current tier price", async function () {
      // Mint 3 at base price to enter tier 2
      await nft.connect(addr1).mint(3, { value: MINT_PRICE * 3n });
      // Try to mint at base price (should fail, now in tier 2)
      await expect(
        nft.connect(addr1).mint(1, { value: MINT_PRICE })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should enforce ascending thresholds", async function () {
      await expect(
        nft.setPriceTiers([5, 3], [TIER2_PRICE, TIER3_PRICE])
      ).to.be.revertedWith("Thresholds must be ascending");
    });

    it("Should work with choose mode + tiered pricing", async function () {
      nft = await deployV2({ chooseMode: true, tieredPricing: true });
      await nft.setPriceTiers([3], [TIER2_PRICE]);

      // Mint 3 at base price
      await nft.connect(addr1).mintSpecific(0, { value: MINT_PRICE });
      await nft.connect(addr1).mintSpecific(5, { value: MINT_PRICE });
      await nft.connect(addr1).mintSpecific(9, { value: MINT_PRICE });

      // 4th mint should require tier 2 price
      expect(await nft.getCurrentPrice()).to.equal(TIER2_PRICE);
      await expect(
        nft.connect(addr1).mintSpecific(1, { value: MINT_PRICE })
      ).to.be.revertedWith("Insufficient payment");

      await nft.connect(addr1).mintSpecific(1, { value: TIER2_PRICE });
      expect(await nft.totalSupply()).to.equal(4);
    });

    it("Should get price tier count", async function () {
      expect(await nft.getPriceTierCount()).to.equal(2);
    });
  });

  // ═══════════════════════════════════════════════════
  //  ALLOWLIST / PRESALE
  // ═══════════════════════════════════════════════════
  describe("Allowlist & Presale", function () {
    let tree, root;

    beforeEach(async function () {
      // Build Merkle tree with addr1 and addr2 on allowlist
      tree = buildMerkleTree([addr1.address, addr2.address]);
      root = "0x" + tree.getRoot().toString("hex");

      const now = (await ethers.provider.getBlock("latest")).timestamp;

      nft = await deployV2({
        merkleRoot: root,
        presaleStart: now + 10,   // starts in 10 seconds
        presaleEnd: now + 1000,   // ends in 1000 seconds
        publicStart: now + 2000,  // public starts in 2000 seconds
      });
    });

    it("Should reject public mint before public start", async function () {
      // Fast forward past presale but before public
      await ethers.provider.send("evm_increaseTime", [1500]);
      await ethers.provider.send("evm_mine");

      await expect(
        nft.connect(addr1).mint(1, { value: MINT_PRICE })
      ).to.be.revertedWith("Public mint not started");
    });

    it("Should allow public mint after public start", async function () {
      await ethers.provider.send("evm_increaseTime", [2100]);
      await ethers.provider.send("evm_mine");

      await nft.connect(addr3).mint(1, { value: MINT_PRICE });
      expect(await nft.totalSupply()).to.equal(1);
    });

    it("Should reject presale mint before presale start", async function () {
      const proof = getProof(tree, addr1.address);
      await expect(
        nft.connect(addr1).mintPresale(1, proof, { value: MINT_PRICE })
      ).to.be.revertedWith("Presale not started");
    });

    it("Should allow allowlisted wallet to mint during presale", async function () {
      await ethers.provider.send("evm_increaseTime", [50]);
      await ethers.provider.send("evm_mine");

      const proof = getProof(tree, addr1.address);
      await nft.connect(addr1).mintPresale(1, proof, { value: MINT_PRICE });
      expect(await nft.ownerOf(0)).to.equal(addr1.address);
    });

    it("Should reject non-allowlisted wallet during presale", async function () {
      await ethers.provider.send("evm_increaseTime", [50]);
      await ethers.provider.send("evm_mine");

      const proof = getProof(tree, addr3.address); // addr3 not on list
      await expect(
        nft.connect(addr3).mintPresale(1, proof, { value: MINT_PRICE })
      ).to.be.revertedWith("Not on allowlist");
    });

    it("Should enforce per-wallet presale limit", async function () {
      await ethers.provider.send("evm_increaseTime", [50]);
      await ethers.provider.send("evm_mine");

      const proof = getProof(tree, addr1.address);
      await nft.connect(addr1).mintPresale(1, proof, { value: MINT_PRICE });

      // Second mint should fail (maxPresaleMintPerWallet = 1)
      await expect(
        nft.connect(addr1).mintPresale(1, proof, { value: MINT_PRICE })
      ).to.be.revertedWith("Exceeds presale limit");
    });

    it("Should allow increasing presale limit", async function () {
      await nft.setMaxPresaleMintPerWallet(3);

      await ethers.provider.send("evm_increaseTime", [50]);
      await ethers.provider.send("evm_mine");

      const proof = getProof(tree, addr1.address);
      await nft.connect(addr1).mintPresale(2, proof, { value: MINT_PRICE * 2n });
      expect(await nft.totalSupply()).to.equal(2);
    });

    it("Should report presale active status correctly", async function () {
      expect(await nft.isPresaleActive()).to.equal(false);

      await ethers.provider.send("evm_increaseTime", [50]);
      await ethers.provider.send("evm_mine");
      expect(await nft.isPresaleActive()).to.equal(true);

      await ethers.provider.send("evm_increaseTime", [1500]);
      await ethers.provider.send("evm_mine");
      expect(await nft.isPresaleActive()).to.equal(false);
    });

    it("Should report public mint active status correctly", async function () {
      expect(await nft.isPublicMintActive()).to.equal(false);

      await ethers.provider.send("evm_increaseTime", [2100]);
      await ethers.provider.send("evm_mine");
      expect(await nft.isPublicMintActive()).to.equal(true);
    });

    it("Should allow owner to update merkle root", async function () {
      const newTree = buildMerkleTree([addr3.address]);
      const newRoot = "0x" + newTree.getRoot().toString("hex");
      await nft.setMerkleRoot(newRoot);
      expect(await nft.merkleRoot()).to.equal(newRoot);
    });

    it("Should allow owner to update mint windows", async function () {
      await nft.setMintWindows(100, 200, 300);
      expect(await nft.presaleStart()).to.equal(100);
      expect(await nft.presaleEnd()).to.equal(200);
      expect(await nft.publicStart()).to.equal(300);
    });
  });

  // ═══════════════════════════════════════════════════
  //  CHOOSE MODE + ALLOWLIST (combined)
  // ═══════════════════════════════════════════════════
  describe("Choose Mode + Allowlist", function () {
    let tree, root;

    beforeEach(async function () {
      tree = buildMerkleTree([addr1.address, addr2.address]);
      root = "0x" + tree.getRoot().toString("hex");

      const now = (await ethers.provider.getBlock("latest")).timestamp;

      nft = await deployV2({
        chooseMode: true,
        merkleRoot: root,
        presaleStart: now + 10,
        presaleEnd: now + 1000,
        publicStart: now + 2000,
      });
    });

    it("Should allow allowlisted wallet to pick specific token during presale", async function () {
      await ethers.provider.send("evm_increaseTime", [50]);
      await ethers.provider.send("evm_mine");

      const proof = getProof(tree, addr1.address);
      await nft.connect(addr1).mintPresaleSpecific(7, proof, { value: MINT_PRICE });
      expect(await nft.ownerOf(7)).to.equal(addr1.address);
      expect(await nft.tokenMinted(7)).to.equal(true);
    });

    it("Should reject non-allowlisted wallet picking during presale", async function () {
      await ethers.provider.send("evm_increaseTime", [50]);
      await ethers.provider.send("evm_mine");

      const proof = getProof(tree, addr3.address);
      await expect(
        nft.connect(addr3).mintPresaleSpecific(0, proof, { value: MINT_PRICE })
      ).to.be.revertedWith("Not on allowlist");
    });

    it("Should allow anyone to pick during public phase", async function () {
      await ethers.provider.send("evm_increaseTime", [2100]);
      await ethers.provider.send("evm_mine");

      await nft.connect(addr3).mintSpecific(3, { value: MINT_PRICE });
      expect(await nft.ownerOf(3)).to.equal(addr3.address);
    });

    it("Should prevent picking token already taken during presale", async function () {
      await ethers.provider.send("evm_increaseTime", [50]);
      await ethers.provider.send("evm_mine");

      const proof1 = getProof(tree, addr1.address);
      await nft.connect(addr1).mintPresaleSpecific(5, proof1, { value: MINT_PRICE });

      // Increase presale limit for addr2 to try
      await nft.setMaxPresaleMintPerWallet(2);
      const proof2 = getProof(tree, addr2.address);
      await expect(
        nft.connect(addr2).mintPresaleSpecific(5, proof2, { value: MINT_PRICE })
      ).to.be.revertedWith("Token already minted");
    });
  });

  // ═══════════════════════════════════════════════════
  //  RECALL (works same as V1)
  // ═══════════════════════════════════════════════════
  describe("Recall", function () {
    it("Should recall all tokens in blind mode", async function () {
      nft = await deployV2();
      await nft.connect(addr1).mint(3, { value: MINT_PRICE * 3n });
      await nft.connect(addr2).mint(2, { value: MINT_PRICE * 2n });
      await nft.pause();
      await nft.recallAll();

      for (let i = 0; i < 5; i++) {
        expect(await nft.ownerOf(i)).to.equal(owner.address);
      }
    });

    it("Should recall all tokens in choose mode", async function () {
      nft = await deployV2({ chooseMode: true });
      await nft.connect(addr1).mintSpecific(0, { value: MINT_PRICE });
      await nft.connect(addr2).mintSpecific(7, { value: MINT_PRICE });
      await nft.connect(addr1).mintSpecific(3, { value: MINT_PRICE });
      await nft.pause();
      await nft.recallAll();

      expect(await nft.ownerOf(0)).to.equal(owner.address);
      expect(await nft.ownerOf(7)).to.equal(owner.address);
      expect(await nft.ownerOf(3)).to.equal(owner.address);
    });

    it("Should recall in batches", async function () {
      nft = await deployV2();
      await nft.connect(addr1).mint(5, { value: MINT_PRICE * 5n });
      await nft.pause();
      await nft.recallBatch(0, 3);
      for (let i = 0; i < 3; i++) {
        expect(await nft.ownerOf(i)).to.equal(owner.address);
      }
      // Remaining still with addr1
      expect(await nft.ownerOf(3)).to.equal(addr1.address);
    });
  });

  // ═══════════════════════════════════════════════════
  //  ADMIN / WITHDRAW
  // ═══════════════════════════════════════════════════
  describe("Admin Functions", function () {
    beforeEach(async function () {
      nft = await deployV2();
    });

    it("Should withdraw funds", async function () {
      await nft.connect(addr1).mint(3, { value: MINT_PRICE * 3n });
      const balBefore = await ethers.provider.getBalance(owner.address);
      const tx = await nft.withdraw();
      const receipt = await tx.wait();
      const gas = receipt.gasUsed * receipt.gasPrice;
      const balAfter = await ethers.provider.getBalance(owner.address);
      expect(balAfter - balBefore + gas).to.equal(MINT_PRICE * 3n);
    });

    it("Should reject non-owner admin calls", async function () {
      await expect(nft.connect(addr1).setMintPrice(0)).to.be.reverted;
      await expect(nft.connect(addr1).setPriceTiers([], [])).to.be.reverted;
      await expect(nft.connect(addr1).setMerkleRoot(ZERO_BYTES32)).to.be.reverted;
      await expect(nft.connect(addr1).setMintWindows(0, 0, 0)).to.be.reverted;
      await expect(nft.connect(addr1).pause()).to.be.reverted;
    });
  });

  // ═══════════════════════════════════════════════════
  //  NO ALLOWLIST = OPEN MINT
  // ═══════════════════════════════════════════════════
  describe("Open Mint (no allowlist)", function () {
    it("Should allow anyone to mint immediately when no merkle root", async function () {
      nft = await deployV2(); // merkleRoot = 0x0
      await nft.connect(addr3).mint(1, { value: MINT_PRICE });
      expect(await nft.totalSupply()).to.equal(1);
      expect(await nft.isPublicMintActive()).to.equal(true);
    });
  });
});
