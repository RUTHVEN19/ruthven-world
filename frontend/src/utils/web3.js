import { ethers } from 'ethers';

export function getProvider() {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }
  return new ethers.BrowserProvider(window.ethereum);
}

export async function connectWallet() {
  const provider = getProvider();
  const accounts = await provider.send('eth_requestAccounts', []);
  return accounts[0];
}

export async function getSigner() {
  const provider = getProvider();
  return provider.getSigner();
}

export async function getNetwork() {
  const provider = getProvider();
  const network = await provider.getNetwork();
  return network;
}

export async function switchToSepolia() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID
    });
  } catch (error) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0xaa36a7',
          chainName: 'Sepolia Testnet',
          rpcUrls: ['https://sepolia.infura.io/v3/'],
          nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
          blockExplorerUrls: ['https://sepolia.etherscan.io'],
        }],
      });
    } else {
      throw error;
    }
  }
}

// Contract ABI - V1 + V2 functions (V2 is a superset)
export const NFT_ABI = [
  // ─── V1 core ───
  "function mint(uint256 quantity) external payable",
  "function ownerMint(uint256 quantity) external",
  "function totalSupply() external view returns (uint256)",
  "function maxSupply() external view returns (uint256)",
  "function mintPrice() external view returns (uint256)",
  "function paused() external view returns (bool)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function totalMinted() external view returns (uint256)",
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function recallAll() external",
  "function recallBatch(uint256 startIndex, uint256 count) external",
  "function pause() external",
  "function unpause() external",
  "function withdraw() external",
  "function setMintPrice(uint256 newPrice) external",
  "function setBaseURI(string newBaseURI) external",
  // ─── V2: Choose Your Mint ───
  "function mintSpecific(uint256 tokenId) external payable",
  "function ownerMintSpecific(uint256 tokenId) external",
  "function chooseMode() external view returns (bool)",
  "function tokenMinted(uint256 tokenId) external view returns (bool)",
  // ─── V2: Tiered Pricing ───
  "function getCurrentPrice() external view returns (uint256)",
  "function tieredPricing() external view returns (bool)",
  "function getPriceTierCount() external view returns (uint256)",
  // ─── V2: Allowlist / Presale ───
  "function mintPresale(uint256 quantity, bytes32[] proof) external payable",
  "function mintPresaleSpecific(uint256 tokenId, bytes32[] proof) external payable",
  "function merkleRoot() external view returns (bytes32)",
  "function presaleStart() external view returns (uint256)",
  "function presaleEnd() external view returns (uint256)",
  "function publicStart() external view returns (uint256)",
  "function isPresaleActive() external view returns (bool)",
  "function isPublicMintActive() external view returns (bool)",
  "function presaleMinted(address) external view returns (uint256)",
  "function maxPresaleMintPerWallet() external view returns (uint256)",
  // ─── Events ───
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event AllTokensRecalled(uint256 totalRecalled, uint256 timestamp)",
  "event MintPriceUpdated(uint256 oldPrice, uint256 newPrice)",
];

export function getContract(address, signerOrProvider) {
  return new ethers.Contract(address, NFT_ABI, signerOrProvider);
}
