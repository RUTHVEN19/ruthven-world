// ─────────────────────────────────────────────────────────────────────────────
// DIAMOND DRONES — THREE INDEPENDENT DROPS
//
// This file replaces the bundled COLLECTOR_SET model from dronesContent.js
// with three standalone drops. Each drop has its own URL, contract, and
// mint flow.
//
// Edit prices / supply / contract addresses here without touching components.
// ─────────────────────────────────────────────────────────────────────────────

export const DROPS_META = {
  brand: 'Diamond Drones™',
  artist: 'Miss AL Simpson',
  year: '2026',
  copyright: '© 2026 Miss AL Simpson. All rights reserved.',
  trademark:
    'DIAMOND DRONES is a registered trademark of Miss AL Simpson.',
};


// ─── DROP 1: DIAMOND DRONES (the genesis 1000) ─────────────────────────

export const DIAMOND_DRONES_DROP = {
  slug: 'diamonddrones',
  url: '/drones/diamonddrones',
  name: 'Diamond Drones',
  tagline: "Diamond Drones Are a Girl's Best Friend",
  logline:
    'The genesis collection of 1000 hand-crafted diamond drones. ' +
    'Each unique. Each a digital gem on the biggest diamond of all — Ethereum.',
  // Pricing — placeholder, set later
  price: 'TBA',
  priceETH: null,
  // Supply
  publicSupply: 1000,
  vipSupply: 5,
  totalSupply: 1005,
  // Contract — fill once deployed
  contractAddress: 'TBA',
  network: 'Ethereum Mainnet',
  chainId: 1,
  // Hero asset (path under /public)
  heroImage: '/diamond-drones-hero.png',
  // Rarity composition (matches the genesis prompt generator)
  rarities: [
    { tier: 'Common',    count: 434, label: 'Common',    pct: 43.4 },
    { tier: 'Uncommon',  count: 281, label: 'Uncommon',  pct: 28.1 },
    { tier: 'Rare',      count: 168, label: 'Rare',      pct: 16.8 },
    { tier: 'Legendary', count: 107, label: 'Legendary', pct: 10.7 },
    { tier: 'Hope',      count: 10,  label: 'Hope-tier', pct: 1.0 },
  ],
  // Trait dimensions (for trait viewer / OpenSea)
  traitDimensions: [
    'Drone Form', 'Chassis Type', 'Diamond Cut',
    'Carat Weight', 'Background', 'Lighting', 'Composition',
  ],
  // VIP tier (5 ultra-VIP slots — separate contract / private flow)
  vip: {
    enabled: true,
    name: 'VIP Diamond Drones',
    description:
      '5 private VIP slots. Each VIP receives one Hope-tier 1/1 Diamond Drone ' +
      'plus a custom unique short film commissioned by Miss AL Simpson.',
    price: 'TBA',
    priceETH: null,
    contractAddress: 'TBA',
  },
};


// ─── DROP 2: DRONE BLONDES (100 cinematic films) ───────────────────────

export const DRONE_BLONDES_DROP = {
  slug: 'blondes',
  url: '/drones/blondes',
  name: 'Drone Blondes',
  tagline: 'Cinematic 1/1 Films',
  logline:
    '100 black-and-white short films. Each a Drone Blonde. Each a 1/1.',
  // Pricing
  price: 'TBA',
  priceETH: null,
  // Supply
  publicSupply: 100,
  totalSupply: 100,
  // Contract
  contractAddress: 'TBA',
  network: 'Ethereum Mainnet',
  chainId: 1,
  // Hero
  heroImage: '/diamond-drones-cinema.png',
  // Each blonde is a 1/1 with its own metadata
  format: 'video', // video NFTs (mp4)
};


// ─── DROP 3: ALBUM (open edition audio) ────────────────────────────────

export const ALBUM_DROP = {
  slug: 'album',
  url: '/drones/album',
  name: 'Diamond Drones — The Album',
  tagline: 'Open Edition · Audio NFT',
  logline:
    'The official album of the Diamond Drones world. Open edition: ' +
    'collect as many as you like during the mint window.',
  // Pricing
  price: 'TBA',
  priceETH: null,
  // Open edition — no cap, only a time window
  openEdition: true,
  // Window — set actual dates when ready
  mintWindow: {
    open: 'TBA',
    close: 'TBA',
  },
  // Contract
  contractAddress: 'TBA',
  network: 'Ethereum Mainnet',
  chainId: 1,
  // Hero
  heroImage: '/diamond-drones-gallery.png',
  // Audio preview asset
  previewAudio: '/album-preview.mp3',
};


// ─── DROPS HUB — used by the /drops landing if needed ──────────────────

export const ALL_DROPS = [
  DIAMOND_DRONES_DROP,
  DRONE_BLONDES_DROP,
  ALBUM_DROP,
];
