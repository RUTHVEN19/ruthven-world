// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title MissALSimpsonNFT
 * @notice 1/1 Fine Art NFT collection with admin recall for IP vaulting.
 *         Each collection deploys its own instance of this contract.
 *         After the mint window closes, the owner can recall all tokens
 *         to their vault wallet, creating a time-stamped IP archive.
 *
 * @dev IMPORTANT: Collectors should be aware that this contract includes
 *      a recall mechanism. The owner can transfer all tokens back to their
 *      wallet after pausing the mint. This is by design for fine art
 *      exhibition collections.
 */
contract MissALSimpsonNFT is ERC721Enumerable, Ownable, Pausable, ReentrancyGuard {
    using Strings for uint256;

    uint256 public maxSupply;
    uint256 public mintPrice;
    string private _baseTokenURI;
    uint256 private _nextTokenId;

    event AllTokensRecalled(uint256 totalRecalled, uint256 timestamp);
    event BatchRecalled(uint256 startIndex, uint256 count, uint256 timestamp);
    event MintPriceUpdated(uint256 oldPrice, uint256 newPrice);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_,
        uint256 mintPrice_,
        string memory baseURI_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        maxSupply = maxSupply_;
        mintPrice = mintPrice_;
        _baseTokenURI = baseURI_;
    }

    /**
     * @notice Mint one or more NFTs.
     * @param quantity Number of tokens to mint.
     */
    function mint(uint256 quantity) external payable whenNotPaused nonReentrant {
        require(quantity > 0, "Quantity must be > 0");
        require(_nextTokenId + quantity <= maxSupply, "Exceeds max supply");
        require(msg.value >= mintPrice * quantity, "Insufficient payment");

        for (uint256 i = 0; i < quantity; i++) {
            _safeMint(msg.sender, _nextTokenId);
            _nextTokenId++;
        }

        // Refund excess payment
        uint256 excess = msg.value - (mintPrice * quantity);
        if (excess > 0) {
            (bool success, ) = msg.sender.call{value: excess}("");
            require(success, "Refund failed");
        }
    }

    /**
     * @notice Owner mint - mint tokens directly to the owner wallet.
     * @param quantity Number of tokens to mint.
     */
    function ownerMint(uint256 quantity) external onlyOwner {
        require(_nextTokenId + quantity <= maxSupply, "Exceeds max supply");

        for (uint256 i = 0; i < quantity; i++) {
            _safeMint(owner(), _nextTokenId);
            _nextTokenId++;
        }
    }

    /**
     * @notice Recall ALL tokens back to the owner wallet.
     *         Must be called when contract is paused.
     *         For large collections (500+), use recallBatch instead.
     */
    function recallAll() external onlyOwner whenPaused nonReentrant {
        uint256 total = totalSupply();
        require(total > 0, "No tokens to recall");

        // Snapshot all token IDs first to avoid index-shifting issues
        uint256[] memory tokenIds = new uint256[](total);
        for (uint256 i = 0; i < total; i++) {
            tokenIds[i] = tokenByIndex(i);
        }

        // Transfer all non-owner tokens to owner
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
     * @notice Recall tokens in batches for gas-efficient processing of large collections.
     * @param startIndex Start index in the enumeration.
     * @param count Number of tokens to process in this batch.
     */
    function recallBatch(uint256 startIndex, uint256 count) external onlyOwner whenPaused nonReentrant {
        uint256 total = totalSupply();
        require(startIndex < total, "Start index out of bounds");

        uint256 endIndex = startIndex + count;
        if (endIndex > total) {
            endIndex = total;
        }

        // Snapshot the batch of token IDs
        uint256 batchSize = endIndex - startIndex;
        uint256[] memory tokenIds = new uint256[](batchSize);
        for (uint256 i = 0; i < batchSize; i++) {
            tokenIds[i] = tokenByIndex(startIndex + i);
        }

        // Transfer
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

    /**
     * @notice Update the mint price.
     */
    function setMintPrice(uint256 newPrice) external onlyOwner {
        uint256 oldPrice = mintPrice;
        mintPrice = newPrice;
        emit MintPriceUpdated(oldPrice, newPrice);
    }

    /**
     * @notice Update the base URI for token metadata.
     */
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
    }

    /**
     * @notice Pause minting.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause minting.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Withdraw all ETH from the contract to the owner.
     */
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @notice Returns the token URI for a given token ID.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string(abi.encodePacked(_baseTokenURI, tokenId.toString(), ".json"));
    }

    /**
     * @notice Returns the current base URI.
     */
    function baseURI() external view returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @notice Returns the total number of tokens minted so far.
     */
    function totalMinted() external view returns (uint256) {
        return _nextTokenId;
    }
}
