// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title MissALSimpsonNFTV2
 * @notice 1/1 Fine Art NFT collection with:
 *         - Choose Your Mint (pick specific token IDs, up to 500 supply)
 *         - Tiered Pricing (price increases at mint thresholds)
 *         - Allowlist with Merkle Proof (presale for whitelisted wallets)
 *         - Admin Recall for IP vaulting
 *         - On-chain NFT ownership and license terms
 *
 * @dev Collectors should be aware that this contract includes a recall mechanism.
 *      The owner can transfer all tokens back to their wallet after pausing.
 *      This is by design for fine art exhibition collections.
 *
 * ═══════════════════════════════════════════════════════════════════════
 *  NFT OWNERSHIP & LICENSE TERMS (on-chain)
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  1. OWNERSHIP: The holder of each NFT token owns that specific NFT and
 *     the unique digital artwork associated with it. Ownership transfers
 *     automatically with the token upon sale or transfer.
 *
 *  2. PERSONAL LICENSE: The NFT holder is granted a worldwide, non-exclusive,
 *     royalty-free license to display, exhibit, and enjoy the associated
 *     artwork for personal, non-commercial purposes, including display in
 *     virtual galleries, social media profiles, and personal collections.
 *
 *  3. RESALE RIGHTS: The NFT holder may freely sell, trade, or transfer
 *     their NFT on any marketplace. All license rights transfer to the
 *     new holder upon transfer of the token.
 *
 *  4. INTELLECTUAL PROPERTY: The Artist retains all intellectual property
 *     rights, including but not limited to copyright, reproduction rights,
 *     derivative work rights, and commercial exploitation rights. The Artist
 *     may reproduce, exhibit, publish, and create derivative works from any
 *     artwork in this collection.
 *
 *  5. RESTRICTIONS: The NFT holder may NOT reproduce, distribute, create
 *     derivative works from, or commercially exploit the artwork without
 *     prior written consent from the Artist. This includes but is not
 *     limited to prints, merchandise, advertising, and commercial licensing.
 *
 *  6. RECALL: This contract includes an artist recall mechanism. The Artist
 *     reserves the right to recall tokens for IP vaulting purposes as part
 *     of the exhibition lifecycle. Collectors are made aware of this at
 *     the point of mint.
 *
 *  These terms are recorded immutably on-chain and can be read via the
 *  licenseTerms() function.
 * ═══════════════════════════════════════════════════════════════════════
 */
contract MissALSimpsonNFTV2 is ERC721Enumerable, Ownable, Pausable, ReentrancyGuard {
    using Strings for uint256;

    // ─── Core ───────────────────────────────────────────
    uint256 public maxSupply;
    uint256 public mintPrice; // base/fallback price
    string private _baseTokenURI;
    uint256 private _nextTokenId; // used in blind mode only

    // ─── Feature 1: Choose Your Mint ────────────────────
    bool public chooseMode;
    mapping(uint256 => bool) public tokenMinted; // tracks which IDs are minted in choose mode

    // ─── Feature 2: Tiered Pricing ──────────────────────
    struct PriceTier {
        uint256 threshold; // totalSupply at which this tier activates
        uint256 price;     // price in wei for this tier
    }
    PriceTier[] public priceTiers;
    bool public tieredPricing;

    // ─── Feature 3: Allowlist / Presale ─────────────────
    bytes32 public merkleRoot;
    uint256 public presaleStart;
    uint256 public presaleEnd;
    uint256 public publicStart;
    uint256 public maxPresaleMintPerWallet;
    mapping(address => uint256) public presaleMinted;

    // ─── License ──────────────────────────────────────────
    string private _licenseURI; // Optional: link to full legal document (IPFS/Arweave)

    // ─── Events ─────────────────────────────────────────
    event LicenseURIUpdated(string newURI);
    event AllTokensRecalled(uint256 totalRecalled, uint256 timestamp);
    event BatchRecalled(uint256 startIndex, uint256 count, uint256 timestamp);
    event MintPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event PriceTiersUpdated(uint256 tierCount);
    event MerkleRootUpdated(bytes32 newRoot);
    event MintWindowsUpdated(uint256 presaleStart, uint256 presaleEnd, uint256 publicStart);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_,
        uint256 mintPrice_,
        string memory baseURI_,
        bool chooseMode_,
        bool tieredPricing_,
        bytes32 merkleRoot_,
        uint256 presaleStart_,
        uint256 presaleEnd_,
        uint256 publicStart_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        maxSupply = maxSupply_;
        mintPrice = mintPrice_;
        _baseTokenURI = baseURI_;
        chooseMode = chooseMode_;
        tieredPricing = tieredPricing_;
        merkleRoot = merkleRoot_;
        presaleStart = presaleStart_;
        presaleEnd = presaleEnd_;
        publicStart = publicStart_;
        maxPresaleMintPerWallet = 1;
    }

    // ═══════════════════════════════════════════════════
    //  PRICING
    // ═══════════════════════════════════════════════════

    /**
     * @notice Returns the current mint price based on total minted and tier config.
     */
    function getCurrentPrice() public view returns (uint256) {
        if (!tieredPricing || priceTiers.length == 0) return mintPrice;

        uint256 minted = totalSupply();

        // Walk tiers from highest threshold to lowest
        for (uint256 i = priceTiers.length; i > 0; i--) {
            if (minted >= priceTiers[i - 1].threshold) {
                return priceTiers[i - 1].price;
            }
        }
        return mintPrice; // base price before first tier
    }

    /**
     * @dev Calculate total cost for a multi-mint, accounting for tier boundaries.
     */
    function _calculateTotalCost(uint256 quantity) internal view returns (uint256) {
        if (!tieredPricing || priceTiers.length == 0) return mintPrice * quantity;

        uint256 total = 0;
        uint256 currentMinted = chooseMode ? totalSupply() : _nextTokenId;

        for (uint256 i = 0; i < quantity; i++) {
            uint256 price = mintPrice;
            for (uint256 j = priceTiers.length; j > 0; j--) {
                if (currentMinted + i >= priceTiers[j - 1].threshold) {
                    price = priceTiers[j - 1].price;
                    break;
                }
            }
            total += price;
        }
        return total;
    }

    function _refundExcess(uint256 paid, uint256 cost) internal {
        if (paid > cost) {
            (bool success, ) = msg.sender.call{value: paid - cost}("");
            require(success, "Refund failed");
        }
    }

    // ═══════════════════════════════════════════════════
    //  PHASE / ELIGIBILITY
    // ═══════════════════════════════════════════════════

    /**
     * @dev Check if caller is eligible to mint in the current phase.
     *      If no allowlist is set (merkleRoot == 0), minting is open.
     *      Otherwise enforces presale/public timing windows.
     */
    function _requirePublicPhase() internal view {
        if (merkleRoot == bytes32(0)) return; // no allowlist, open mint
        require(block.timestamp >= publicStart, "Public mint not started");
    }

    function _requirePresalePhase() internal view {
        require(merkleRoot != bytes32(0), "No presale configured");
        require(block.timestamp >= presaleStart, "Presale not started");
        require(block.timestamp < presaleEnd, "Presale ended");
    }

    function _verifyAllowlist(address account, bytes32[] calldata proof) internal view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(account));
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }

    // ═══════════════════════════════════════════════════
    //  BLIND MINT (sequential token IDs)
    // ═══════════════════════════════════════════════════

    /**
     * @notice Public blind mint (sequential token IDs).
     */
    function mint(uint256 quantity) external payable whenNotPaused nonReentrant {
        require(!chooseMode, "Use mintSpecific in choose mode");
        require(quantity > 0, "Quantity must be > 0");
        require(_nextTokenId + quantity <= maxSupply, "Exceeds max supply");

        _requirePublicPhase();

        uint256 totalCost = _calculateTotalCost(quantity);
        require(msg.value >= totalCost, "Insufficient payment");

        for (uint256 i = 0; i < quantity; i++) {
            _safeMint(msg.sender, _nextTokenId);
            _nextTokenId++;
        }

        _refundExcess(msg.value, totalCost);
    }

    /**
     * @notice Presale blind mint with Merkle proof.
     */
    function mintPresale(uint256 quantity, bytes32[] calldata proof) external payable whenNotPaused nonReentrant {
        require(!chooseMode, "Use mintPresaleSpecific in choose mode");
        require(quantity > 0, "Quantity must be > 0");
        require(_nextTokenId + quantity <= maxSupply, "Exceeds max supply");

        _requirePresalePhase();
        require(_verifyAllowlist(msg.sender, proof), "Not on allowlist");
        require(presaleMinted[msg.sender] + quantity <= maxPresaleMintPerWallet, "Exceeds presale limit");

        uint256 totalCost = _calculateTotalCost(quantity);
        require(msg.value >= totalCost, "Insufficient payment");

        presaleMinted[msg.sender] += quantity;

        for (uint256 i = 0; i < quantity; i++) {
            _safeMint(msg.sender, _nextTokenId);
            _nextTokenId++;
        }

        _refundExcess(msg.value, totalCost);
    }

    // ═══════════════════════════════════════════════════
    //  CHOOSE YOUR MINT (specific token IDs)
    // ═══════════════════════════════════════════════════

    /**
     * @notice Public mint of a specific token ID (choose mode only).
     */
    function mintSpecific(uint256 tokenId) external payable whenNotPaused nonReentrant {
        require(chooseMode, "Choose mode not enabled");
        require(tokenId < maxSupply, "Invalid token ID");
        require(!tokenMinted[tokenId], "Token already minted");

        _requirePublicPhase();

        uint256 price = getCurrentPrice();
        require(msg.value >= price, "Insufficient payment");

        tokenMinted[tokenId] = true;
        _safeMint(msg.sender, tokenId);

        _refundExcess(msg.value, price);
    }

    /**
     * @notice Presale mint of a specific token ID with Merkle proof.
     */
    function mintPresaleSpecific(uint256 tokenId, bytes32[] calldata proof) external payable whenNotPaused nonReentrant {
        require(chooseMode, "Choose mode not enabled");
        require(tokenId < maxSupply, "Invalid token ID");
        require(!tokenMinted[tokenId], "Token already minted");

        _requirePresalePhase();
        require(_verifyAllowlist(msg.sender, proof), "Not on allowlist");
        require(presaleMinted[msg.sender] + 1 <= maxPresaleMintPerWallet, "Exceeds presale limit");

        uint256 price = getCurrentPrice();
        require(msg.value >= price, "Insufficient payment");

        presaleMinted[msg.sender] += 1;
        tokenMinted[tokenId] = true;
        _safeMint(msg.sender, tokenId);

        _refundExcess(msg.value, price);
    }

    // ═══════════════════════════════════════════════════
    //  OWNER MINT
    // ═══════════════════════════════════════════════════

    /**
     * @notice Owner mint tokens without payment (blind mode).
     */
    function ownerMint(uint256 quantity) external onlyOwner {
        require(!chooseMode, "Use ownerMintSpecific in choose mode");
        require(_nextTokenId + quantity <= maxSupply, "Exceeds max supply");

        for (uint256 i = 0; i < quantity; i++) {
            _safeMint(owner(), _nextTokenId);
            _nextTokenId++;
        }
    }

    /**
     * @notice Owner mint a specific token ID without payment (choose mode).
     */
    function ownerMintSpecific(uint256 tokenId) external onlyOwner {
        require(chooseMode, "Choose mode not enabled");
        require(tokenId < maxSupply, "Invalid token ID");
        require(!tokenMinted[tokenId], "Token already minted");

        tokenMinted[tokenId] = true;
        _safeMint(owner(), tokenId);
    }

    // ═══════════════════════════════════════════════════
    //  RECLAIM UNSOLD (artist reserve)
    // ═══════════════════════════════════════════════════

    event UnsoldsReclaimed(uint256 count, uint256 timestamp);

    /**
     * @notice Mint ALL remaining unsold tokens to the artist (owner) wallet.
     *         Use after the mint window closes to reclaim unsold work.
     *         Only callable by the owner. Works in both choose and blind mode.
     */
    function reclaimUnsold() external onlyOwner nonReentrant {
        uint256 minted = 0;

        if (chooseMode) {
            for (uint256 tokenId = 0; tokenId < maxSupply; tokenId++) {
                if (!tokenMinted[tokenId]) {
                    tokenMinted[tokenId] = true;
                    _safeMint(owner(), tokenId);
                    minted++;
                }
            }
        } else {
            uint256 remaining = maxSupply - _nextTokenId;
            for (uint256 i = 0; i < remaining; i++) {
                _safeMint(owner(), _nextTokenId);
                _nextTokenId++;
                minted++;
            }
        }

        emit UnsoldsReclaimed(minted, block.timestamp);
    }

    /**
     * @notice Mint a batch of unsold tokens to the artist wallet (choose mode).
     *         Gas-efficient version for large collections.
     * @param startTokenId The token ID to start scanning from
     * @param count Maximum number of unsold tokens to mint in this batch
     */
    function reclaimUnsoldBatch(uint256 startTokenId, uint256 count) external onlyOwner nonReentrant {
        require(chooseMode, "Use reclaimUnsold for blind mode");
        uint256 minted = 0;

        for (uint256 tokenId = startTokenId; tokenId < maxSupply && minted < count; tokenId++) {
            if (!tokenMinted[tokenId]) {
                tokenMinted[tokenId] = true;
                _safeMint(owner(), tokenId);
                minted++;
            }
        }

        emit UnsoldsReclaimed(minted, block.timestamp);
    }

    // ═══════════════════════════════════════════════════
    //  RECALL (IP vaulting)
    // ═══════════════════════════════════════════════════

    /**
     * @notice Recall ALL tokens back to the owner wallet.
     */
    function recallAll() external onlyOwner whenPaused nonReentrant {
        uint256 total = totalSupply();
        require(total > 0, "No tokens to recall");

        uint256[] memory tokenIds = new uint256[](total);
        for (uint256 i = 0; i < total; i++) {
            tokenIds[i] = tokenByIndex(i);
        }

        uint256 recalled = 0;
        for (uint256 i = 0; i < total; i++) {
            address tokenOwner = ownerOf(tokenIds[i]);
            if (tokenOwner != owner()) {
                _transfer(tokenOwner, owner(), tokenIds[i]);
                recalled++;
            }
        }

        emit AllTokensRecalled(recalled, block.timestamp);
    }

    /**
     * @notice Recall tokens in batches for gas efficiency.
     */
    function recallBatch(uint256 startIndex, uint256 count) external onlyOwner whenPaused nonReentrant {
        uint256 total = totalSupply();
        require(startIndex < total, "Start index out of bounds");

        uint256 endIndex = startIndex + count;
        if (endIndex > total) endIndex = total;

        uint256 batchSize = endIndex - startIndex;
        uint256[] memory tokenIds = new uint256[](batchSize);
        for (uint256 i = 0; i < batchSize; i++) {
            tokenIds[i] = tokenByIndex(startIndex + i);
        }

        uint256 recalled = 0;
        for (uint256 i = 0; i < batchSize; i++) {
            address tokenOwner = ownerOf(tokenIds[i]);
            if (tokenOwner != owner()) {
                _transfer(tokenOwner, owner(), tokenIds[i]);
                recalled++;
            }
        }

        emit BatchRecalled(startIndex, recalled, block.timestamp);
    }

    // ═══════════════════════════════════════════════════
    //  OWNER SETTERS
    // ═══════════════════════════════════════════════════

    function setMintPrice(uint256 newPrice) external onlyOwner {
        uint256 oldPrice = mintPrice;
        mintPrice = newPrice;
        emit MintPriceUpdated(oldPrice, newPrice);
    }

    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
    }

    /**
     * @notice Set price tiers. Thresholds must be in ascending order.
     */
    function setPriceTiers(uint256[] calldata thresholds, uint256[] calldata prices) external onlyOwner {
        require(thresholds.length == prices.length, "Arrays must match");
        delete priceTiers;
        for (uint256 i = 0; i < thresholds.length; i++) {
            if (i > 0) require(thresholds[i] > thresholds[i - 1], "Thresholds must be ascending");
            priceTiers.push(PriceTier(thresholds[i], prices[i]));
        }
        emit PriceTiersUpdated(thresholds.length);
    }

    function setMerkleRoot(bytes32 newRoot) external onlyOwner {
        merkleRoot = newRoot;
        emit MerkleRootUpdated(newRoot);
    }

    function setMintWindows(uint256 presaleStart_, uint256 presaleEnd_, uint256 publicStart_) external onlyOwner {
        presaleStart = presaleStart_;
        presaleEnd = presaleEnd_;
        publicStart = publicStart_;
        emit MintWindowsUpdated(presaleStart_, presaleEnd_, publicStart_);
    }

    function setMaxPresaleMintPerWallet(uint256 max_) external onlyOwner {
        maxPresaleMintPerWallet = max_;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    // ═══════════════════════════════════════════════════
    //  VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string(abi.encodePacked(_baseTokenURI, tokenId.toString(), ".json"));
    }

    function baseURI() external view returns (string memory) {
        return _baseTokenURI;
    }

    function totalMinted() external view returns (uint256) {
        return chooseMode ? totalSupply() : _nextTokenId;
    }

    /**
     * @notice Get number of price tiers configured.
     */
    function getPriceTierCount() external view returns (uint256) {
        return priceTiers.length;
    }

    /**
     * @notice Check if we're currently in the presale window.
     */
    function isPresaleActive() external view returns (bool) {
        return merkleRoot != bytes32(0) &&
               block.timestamp >= presaleStart &&
               block.timestamp < presaleEnd;
    }

    /**
     * @notice Check if public mint is currently open.
     */
    function isPublicMintActive() external view returns (bool) {
        if (merkleRoot == bytes32(0)) return true; // no allowlist = always public
        return block.timestamp >= publicStart;
    }

    // ═══════════════════════════════════════════════════
    //  LICENSE & RIGHTS
    // ═══════════════════════════════════════════════════

    /**
     * @notice Returns a summary of the NFT ownership and license terms.
     *         These terms are immutably recorded in the contract source code.
     */
    function licenseTerms() external pure returns (string memory) {
        return
            "NFT OWNERSHIP & LICENSE TERMS: "
            "(1) OWNERSHIP - The holder of each NFT token owns that NFT and the unique digital artwork associated with it. "
            "Ownership transfers automatically with the token. "
            "(2) PERSONAL LICENSE - The holder is granted a worldwide, non-exclusive, royalty-free license to display "
            "the artwork for personal, non-commercial purposes. "
            "(3) RESALE - The holder may freely sell, trade, or transfer their NFT. License rights transfer with the token. "
            "(4) INTELLECTUAL PROPERTY - The Artist retains all IP rights including copyright, reproduction rights, "
            "derivative work rights, and commercial exploitation rights. "
            "(5) RESTRICTIONS - The holder may NOT reproduce, distribute, create derivative works from, or commercially "
            "exploit the artwork without prior written consent from the Artist. "
            "(6) RECALL - This contract includes an artist recall mechanism for IP vaulting purposes.";
    }

    /**
     * @notice Returns the URI of the full legal license document (if set).
     */
    function licenseURI() external view returns (string memory) {
        return _licenseURI;
    }

    /**
     * @notice Set the URI for the full legal license document.
     * @param uri_ IPFS or Arweave URI to the complete license terms
     */
    function setLicenseURI(string memory uri_) external onlyOwner {
        _licenseURI = uri_;
        emit LicenseURIUpdated(uri_);
    }

    /**
     * @notice Returns the number of unsold tokens remaining.
     */
    function unsoldCount() external view returns (uint256) {
        if (chooseMode) {
            uint256 count = 0;
            for (uint256 i = 0; i < maxSupply; i++) {
                if (!tokenMinted[i]) count++;
            }
            return count;
        } else {
            return maxSupply - _nextTokenId;
        }
    }

    /**
     * @notice Returns an array of unsold token IDs (choose mode only).
     *         Useful for the frontend to display available tokens.
     */
    function getUnsoldTokenIds() external view returns (uint256[] memory) {
        require(chooseMode, "Only available in choose mode");
        uint256 count = 0;
        for (uint256 i = 0; i < maxSupply; i++) {
            if (!tokenMinted[i]) count++;
        }
        uint256[] memory unsold = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < maxSupply; i++) {
            if (!tokenMinted[i]) {
                unsold[idx] = i;
                idx++;
            }
        }
        return unsold;
    }
}
