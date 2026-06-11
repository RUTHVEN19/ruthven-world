import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
    ...(projectId ? [walletConnect({ projectId })] : []),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

// Contract address — update after deployment
export const MANGA_MACHINE_ADDRESS = import.meta.env.VITE_MANGA_MACHINE_ADDRESS || '';

// ERC1155 ABI — only the functions we need on the frontend
export const MANGA_MACHINE_ABI = [
  {
    name: 'mintPhase',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'phase', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'phases',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [
      { name: 'startTime', type: 'uint64' },
      { name: 'endTime', type: 'uint64' },
      { name: 'totalMinted', type: 'uint256' },
    ],
  },
  {
    name: 'phaseActive',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'phase', type: 'uint256' }],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'phasePrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'phase', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'phaseTotalMinted',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'phase', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'collectorPhases',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'collector', type: 'address' }],
    outputs: [{ type: 'uint8' }],
  },
  {
    name: 'isCompletionist',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'collector', type: 'address' }],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'TriptychMinted',
    type: 'event',
    inputs: [
      { name: 'minter', type: 'address', indexed: true },
      { name: 'phase', type: 'uint256', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
];

// Phase metadata for frontend display
export const PHASE_CONFIG = [
  {
    id: 0,
    name: 'Fresh Ink',
    nameJp: '新鮮なインク',
    price: '0.099',
    tokens: [1, 2, 3],
    description: 'The machine is running at full power. Clean, colourful, polished manga outputs.',
    color: '#ff2d78',
  },
  {
    id: 1,
    name: 'Ink Depletion',
    nameJp: 'インク枯渇',
    price: '0.066',
    tokens: [4, 5, 6],
    description: 'The machine starts to strain. Lines break. Ink fades. Pages rip.',
    color: '#ff6b00',
  },
  {
    id: 2,
    name: 'Exhaustion',
    nameJp: '消耗',
    price: '0.033',
    tokens: [7, 8, 9],
    description: 'The machine approaches failure. Ghostly, fragile, barely there.',
    color: '#00d4ff',
  },
];
