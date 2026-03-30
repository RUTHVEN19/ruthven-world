const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MissALSimpsonNFT", function () {
  let nft;
  let owner, addr1, addr2;
  const NAME = "Test Collection";
  const SYMBOL = "TEST";
  const MAX_SUPPLY = 10;
  const MINT_PRICE = ethers.parseEther("0.05");
  const BASE_URI = "ipfs://QmTestHash/";

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const MissALSimpsonNFT = await ethers.getContractFactory("MissALSimpsonNFT");
    nft = await MissALSimpsonNFT.deploy(NAME, SYMBOL, MAX_SUPPLY, MINT_PRICE, BASE_URI);
    await nft.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set correct name and symbol", async function () {
      expect(await nft.name()).to.equal(NAME);
      expect(await nft.symbol()).to.equal(SYMBOL);
    });

    it("Should set correct max supply and mint price", async function () {
      expect(await nft.maxSupply()).to.equal(MAX_SUPPLY);
      expect(await nft.mintPrice()).to.equal(MINT_PRICE);
    });

    it("Should set correct owner", async function () {
      expect(await nft.owner()).to.equal(owner.address);
    });

    it("Should set correct base URI", async function () {
      expect(await nft.baseURI()).to.equal(BASE_URI);
    });
  });

  describe("Minting", function () {
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
      const balanceBefore = await ethers.provider.getBalance(addr1.address);
      const tx = await nft.connect(addr1).mint(1, { value: MINT_PRICE + excess });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(addr1.address);
      // Balance should decrease by mint price + gas, not by mint price + excess + gas
      expect(balanceBefore - balanceAfter).to.be.closeTo(MINT_PRICE + gasUsed, ethers.parseEther("0.001"));
    });

    it("Should reject insufficient payment", async function () {
      await expect(
        nft.connect(addr1).mint(1, { value: MINT_PRICE - 1n })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should reject when max supply reached", async function () {
      // Mint all 10
      for (let i = 0; i < MAX_SUPPLY; i++) {
        await nft.connect(addr1).mint(1, { value: MINT_PRICE });
      }
      await expect(
        nft.connect(addr1).mint(1, { value: MINT_PRICE })
      ).to.be.revertedWith("Exceeds max supply");
    });

    it("Should reject minting when paused", async function () {
      await nft.pause();
      await expect(
        nft.connect(addr1).mint(1, { value: MINT_PRICE })
      ).to.be.reverted;
    });

    it("Should return correct tokenURI", async function () {
      await nft.connect(addr1).mint(1, { value: MINT_PRICE });
      expect(await nft.tokenURI(0)).to.equal(BASE_URI + "0.json");
    });
  });

  describe("Owner Mint", function () {
    it("Should allow owner to mint for free", async function () {
      await nft.ownerMint(3);
      expect(await nft.totalSupply()).to.equal(3);
      expect(await nft.ownerOf(0)).to.equal(owner.address);
    });

    it("Should reject non-owner owner mint", async function () {
      await expect(nft.connect(addr1).ownerMint(1)).to.be.reverted;
    });
  });

  describe("Recall", function () {
    beforeEach(async function () {
      // Mint tokens to different addresses
      await nft.connect(addr1).mint(3, { value: MINT_PRICE * 3n });
      await nft.connect(addr2).mint(2, { value: MINT_PRICE * 2n });
    });

    it("Should recall all tokens to owner", async function () {
      await nft.pause();
      await nft.recallAll();

      for (let i = 0; i < 5; i++) {
        expect(await nft.ownerOf(i)).to.equal(owner.address);
      }
    });

    it("Should emit AllTokensRecalled event", async function () {
      await nft.pause();
      await expect(nft.recallAll())
        .to.emit(nft, "AllTokensRecalled");
    });

    it("Should reject recall when not paused", async function () {
      await expect(nft.recallAll()).to.be.reverted;
    });

    it("Should reject recall by non-owner", async function () {
      await nft.pause();
      await expect(nft.connect(addr1).recallAll()).to.be.reverted;
    });

    it("Should handle recall when owner already owns some tokens", async function () {
      await nft.ownerMint(2); // Owner mints 2
      await nft.pause();
      await nft.recallAll();

      for (let i = 0; i < 7; i++) {
        expect(await nft.ownerOf(i)).to.equal(owner.address);
      }
    });

    it("Should recall in batches", async function () {
      await nft.pause();
      await nft.recallBatch(0, 3);
      // First 3 tokens should be recalled
      for (let i = 0; i < 3; i++) {
        expect(await nft.ownerOf(i)).to.equal(owner.address);
      }
    });
  });

  describe("Admin Functions", function () {
    it("Should update mint price", async function () {
      const newPrice = ethers.parseEther("0.1");
      await nft.setMintPrice(newPrice);
      expect(await nft.mintPrice()).to.equal(newPrice);
    });

    it("Should update base URI", async function () {
      const newURI = "ipfs://QmNewHash/";
      await nft.setBaseURI(newURI);
      expect(await nft.baseURI()).to.equal(newURI);
    });

    it("Should pause and unpause", async function () {
      await nft.pause();
      await expect(
        nft.connect(addr1).mint(1, { value: MINT_PRICE })
      ).to.be.reverted;

      await nft.unpause();
      await nft.connect(addr1).mint(1, { value: MINT_PRICE });
      expect(await nft.totalSupply()).to.equal(1);
    });

    it("Should withdraw funds", async function () {
      await nft.connect(addr1).mint(5, { value: MINT_PRICE * 5n });

      const balanceBefore = await ethers.provider.getBalance(owner.address);
      const tx = await nft.withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(owner.address);

      expect(balanceAfter - balanceBefore + gasUsed).to.equal(MINT_PRICE * 5n);
    });

    it("Should reject withdraw with no funds", async function () {
      await expect(nft.withdraw()).to.be.revertedWith("No funds to withdraw");
    });

    it("Should reject non-owner admin calls", async function () {
      await expect(nft.connect(addr1).setMintPrice(0)).to.be.reverted;
      await expect(nft.connect(addr1).setBaseURI("")).to.be.reverted;
      await expect(nft.connect(addr1).pause()).to.be.reverted;
      await expect(nft.connect(addr1).withdraw()).to.be.reverted;
    });
  });

  describe("Total Minted", function () {
    it("Should track total minted correctly", async function () {
      expect(await nft.totalMinted()).to.equal(0);
      await nft.connect(addr1).mint(3, { value: MINT_PRICE * 3n });
      expect(await nft.totalMinted()).to.equal(3);
    });
  });
});
