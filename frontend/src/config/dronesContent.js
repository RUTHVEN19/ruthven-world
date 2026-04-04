// ─────────────────────────────────────────────────────────────────────────────
// DIAMOND DRONES ARE A GIRL'S BEST FRIEND™
// Content configuration — edit here without touching component code
// ─────────────────────────────────────────────────────────────────────────────

export const SITE_META = {
  title: "Diamond Drones Are a Girl's Best Friend™",
  series: 'The Drones of Suburbia',
  chapter: 'Final NYC Chapter',
  artist: 'Miss AL Simpson',
  year: '2026',
  copyright: '© 2026 Miss AL Simpson. All rights reserved.',
  trademark: 'DIAMOND DRONES ARE A GIRL\'S BEST FRIEND™ is a trademark of Miss AL Simpson.',
};

// ── Mint configuration ───────────────────────────────────────────────────────
export const MINT_CONFIG = {
  price: '1 ETH',
  priceETH: 1,
  maxSupply: 200,
  // Fill these in once contracts are deployed:
  bundleContractAddress: 'TBA',
  network: 'Ethereum Mainnet',
  chainId: 1,
  components: {
    film:   { qty: 1,  totalSupply: 200,  label: '1 Short Film Edition',    contractAddress: 'TBA' },
    album:  { qty: 1,  totalSupply: 200,  label: '1 Album Edition',          contractAddress: 'TBA' },
    stills: { qty: 10, totalSupply: 2000, label: '10 Unique Film Stills',    contractAddress: 'TBA' },
    drones: { qty: 24, totalSupply: 4800, label: '24 Diamond Drones',        contractAddress: 'TBA' },
  },
};

// ── Hero copy ────────────────────────────────────────────────────────────────
export const HERO_COPY = {
  headline: ['DIAMOND DRONES', "ARE A GIRL'S", 'BEST FRIEND'],
  trademark: '™',
  kicker: 'The Drones of Suburbia — Final NYC Chapter',
  logline: 'The diamond is no longer worn on the body. It has become an intelligent airborne luxury object.',
  cta: 'Mint the Collector Set',
  editionLine: '200 Editions · 1 ETH · One complete set per mint',
};

// ── Lore / world statement ───────────────────────────────────────────────────
export const LORE = {
  title: 'A World of Diamond Machines',
  paragraphs: [
    'In this world, glamour has taken flight.',
    'The Diamond Drone is no longer an accessory. It is an autonomous jewelled presence — surveilling, shimmering, sovereign.',
    'DIAMOND DRONES ARE A GIRL\'S BEST FRIEND™ reimagines the iconic glamour line for the age of AI and the posthuman feminine gaze.',
    'This is the final New York chapter of The Drones of Suburbia — a cinematic universe of film, sound, AI image, and raw feminine sovereignty. Each collector holds a complete edition of the world.',
  ],
  artist: {
    name: 'Miss AL Simpson',
    bio: 'British cryptoartist and filmmaker. Founder of The Drones of Suburbia. Work exhibited at Sotheby\'s. Her AI Ink Intervention process fuses generative image-making with hand-worked digital surfaces.',
  },
};

// ── Zone definitions ─────────────────────────────────────────────────────────
export const ZONES = [
  {
    slug: 'shop',
    nav: 'Shop',
    numeral: 'I',
    title: 'DIAMOND DRONE SHOP',
    subtitle: '24 Drones per Collector · 4,800 Total',
    tagline: 'Each collector receives 24 Diamond Drones — a curated fleet drawn from 100 unique designs.',
    description: 'Couture objects of intelligent glamour. Each Diamond Drone is cut, classed and named within the universe. Five rarity tiers: Brilliant, Princess, Marquise, Rose, Baguette. No two collector fleets are identical.',
    image: '/dd-shop.png',
    heroStatement: 'Every collector owns a fleet.',
  },
  {
    slug: 'cinema',
    nav: 'Cinema',
    numeral: 'II',
    title: 'DRONE CINEMA',
    subtitle: '1 Film Edition per Collector · 200 Total',
    tagline: 'A short film directed by Miss AL Simpson. Featuring the title track. 200 editions.',
    description: 'Each collector receives one film edition of DIAMOND DRONES ARE A GIRL\'S BEST FRIEND™ — a cinematic work by Miss AL Simpson set to the signature track. Monochromatic. Unforgettable. Yours.',
    image: '/dd-cinema.png',
    heroStatement: 'Cinema as collectible property.',
  },
  {
    slug: 'gallery',
    nav: 'Gallery',
    numeral: 'III',
    title: 'DRONE GALLERY',
    subtitle: '10 Stills per Collector · 2,000 Total',
    tagline: "Ten unique film stills from Miss AL Simpson's AI Ink Intervention process.",
    description: "Each collector receives 10 unique stills drawn from a pool of 2,000 — generated through Miss AL Simpson's proprietary AI Ink Intervention method and worked over by hand. No two collector sets are identical.",
    image: '/dd-gallery.png',
    heroStatement: 'Ten images. Yours alone.',
  },
  {
    slug: 'studio',
    nav: 'Studio',
    numeral: 'IV',
    title: 'RECORDING STUDIO',
    subtitle: '1 Album Edition per Collector · 200 Total',
    tagline: 'The first-ever Drones of Suburbia album. Ten tracks from across the cinematic universe.',
    description: 'Each collector receives one edition of the debut Drones of Suburbia album — featuring DIAMOND DRONES ARE A GIRL\'S BEST FRIEND™ alongside nine tracks from the full cinematic universe, including music from the Sotheby\'s work.',
    image: '/dd-shop.png',
    heroStatement: 'Sound as sovereign object.',
  },
];

// ── Album tracklist ───────────────────────────────────────────────────────────
export const ALBUM = {
  title: "DIAMOND DRONES ARE A GIRL'S BEST FRIEND",
  artist: 'Miss AL Simpson',
  subtitle: 'The Drones of Suburbia — Volume I',
  year: '2026',
  tracks: [
    { number: '01', title: "Diamond Drones Are a Girl's Best Friend", film: 'NYC Chapter', featured: true },
    { number: '02', title: 'Frequency',            film: 'Frequency Edit' },
    { number: '03', title: 'Suburbia Noir',         film: 'The Drones of Suburbia' },
    { number: '04', title: "Sotheby's",             film: "Sotheby's" },
    { number: '05', title: 'Manhattan Drift',       film: 'NYC Chapter' },
    { number: '06', title: 'Signal',                film: 'Signal Edit' },
    { number: '07', title: 'Ink Intervention',      film: 'Studio Sessions' },
    { number: '08', title: 'Suburban Glamour',      film: 'Original' },
    { number: '09', title: 'Night Protocol',        film: 'NYC Chapter' },
    { number: '10', title: 'The Return',            film: 'Closing Chapter' },
  ],
};

// ── Diamond Drone cut / rarity tiers ─────────────────────────────────────────
export const DRONE_CUTS = [
  { name: 'Brilliant Cut',  rarity: 'Legendary',  count: '48',   pct: '1%',   glow: '#e8f8ff' },
  { name: 'Princess Cut',   rarity: 'Rare',        count: '480',  pct: '10%',  glow: '#d0ecff' },
  { name: 'Marquise Cut',   rarity: 'Uncommon',    count: '960',  pct: '20%',  glow: '#c0e0f8' },
  { name: 'Rose Cut',       rarity: 'Common',      count: '1440', pct: '30%',  glow: '#b0d4f0' },
  { name: 'Baguette Cut',   rarity: 'Common',      count: '1872', pct: '39%',  glow: '#a0c8e8' },
];

// ── Collector set breakdown (for mint page explainer) ────────────────────────
export const COLLECTOR_SET = [
  {
    icon: '◆',
    label: '1 Short Film Edition',
    detail: 'Directed by Miss AL Simpson. 200 editions worldwide.',
  },
  {
    icon: '◇',
    label: '1 Album Edition',
    detail: 'The debut Drones of Suburbia album. 10 tracks. 200 editions.',
  },
  {
    icon: '▪',
    label: '10 Film Stills',
    detail: 'Unique AI Ink Intervention works. Drawn from a pool of 2,000.',
  },
  {
    icon: '✦',
    label: '24 Diamond Drones',
    detail: 'Curated fleet. Drawn from 100 designs across 5 rarity tiers.',
  },
];
