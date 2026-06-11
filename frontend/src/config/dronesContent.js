// ─────────────────────────────────────────────────────────────────────────────
// DIAMOND DRONES ARE A GIRL'S BEST FRIEND
// Content configuration — edit here without touching component code
// ─────────────────────────────────────────────────────────────────────────────

export const SITE_META = {
  title: "Diamond Drones Are a Girl's Best Friend",
  series: 'The Drones of Suburbia',
  chapter: 'Final NYC Chapter',
  artist: 'Miss AL Simpson',
  year: '2026',
  copyright: '© 2026 Miss AL Simpson. All rights reserved.',
  trademark: 'DIAMOND DRONES is a registered trademark of Miss AL Simpson.',
};

// ── Collection configuration ─────────────────────────────────────────────────
export const COLLECTIONS = {
  diamondDrones: { totalSupply: 1000, label: 'Diamond Drones' },
  droneBlondes:  { totalSupply: 120,  label: 'Drone Blondes' },
  album:         { label: 'The Single' },
};

// ── Hero copy ────────────────────────────────────────────────────────────────
export const HERO_COPY = {
  headline: ['DIAMOND DRONES™', "ARE A GIRL'S", 'BEST FRIEND'],
  trademark: '™',
  kicker: 'DIAMOND DRONES ARE A GIRL\'S BEST FRIEND™',
  logline: 'Glamour has taken flight. The diamond has become a machine.',
  editionLine: '1000 Diamond Drones · Ethereum',
};

// ── Lore / world statement ───────────────────────────────────────────────────
export const LORE = {
  title: 'A World of Diamond Machines',
  paragraphs: [
    'In this world, glamour has taken flight.',
    'The Diamond Drone is no longer an accessory. It is an autonomous jewelled presence — surveilling, shimmering, sovereign.',
    'DIAMOND DRONES ARE A GIRL\'S BEST FRIEND™ reimagines the iconic glamour line for the age of AI and the posthuman feminine gaze.',
    'This is the final New York chapter of The Drones of Suburbia — a cinematic world of film, sound, AI image, and raw feminine sovereignty. Each collector holds a complete edition of the world.',
  ],
  artist: {
    name: 'Miss AL Simpson',
    bio: 'Award-winning OG cryptoartist, AI Cinema pioneer and founder of Diamond Drones\u2122. Her practice merges digital graffiti aesthetics with cinematic composition and authored machine vision — informed by Basquiat, Rauschenberg and Kippenberger. Featured in The Washington Post, CNBC and the Financial Times, and exhibited at Sotheby\'s New York, London, Paris, Tokyo and Vancouver. She is both the creative author and market architect behind Diamond Drones\u2122: translating AI Cinema into a trademarked digital diamond world.',
  },
};

// ── Zone definitions ─────────────────────────────────────────────────────────
export const ZONES = [
  {
    slug: 'vault',
    nav: 'Vault',
    numeral: 'I',
    title: 'DIAMOND DRONES™ VAULT',
    subtitle: '1000 Diamond Drones · 5 Diamond Cuts',
    tagline: '1000 unique generative diamond drones at 4K resolution. Five rarity tiers across gemological diamond cuts.',
    description: 'Couture objects of intelligent glamour. Each Diamond Drone is cut, classed and named within the universe. Five rarity tiers: Brilliant, Princess, Marquise, Rose, Baguette. Every drone is unique.',
    image: '/dd-shop.png',
    heroStatement: 'Every collector owns a drone.',
  },
  {
    slug: 'cinema',
    nav: 'Cinema',
    numeral: 'II',
    title: 'DRONE CINEMA',
    subtitle: 'The Films',
    tagline: 'The films by Miss AL Simpson — premiering at diamonddrones.world, on-chain on Ethereum.',
    description: 'Each film was created by Miss AL Simpson and premiered at diamonddrones.world. The soundtrack — Diamond Drones Are a Girl\'s Best Friend — is available now as a single. Now on-chain on Ethereum via OpenSea.',
    image: '/dd-cinema.png',
    heroStatement: 'Cinema as collectible property.',
  },
  {
    slug: 'studio',
    nav: 'Studio',
    numeral: 'III',
    title: 'RECORDING STUDIO',
    subtitle: 'The Single',
    tagline: 'Diamond Drones Are a Girl\'s Best Friend. The debut single by Miss AL Simpson.',
    description: 'The debut single from the Diamond Drones cinematic universe. By Miss AL Simpson.',
    image: '/dd-shop.png',
    heroStatement: 'Sound as sovereign object.',
  },
  {
    slug: 'lounge',
    nav: 'The Lounge',
    numeral: 'IV',
    title: 'THE DRONE BLONDES',
    subtitle: 'The Drone Blondes · 120 Unique 1/1',
    tagline: '120 unique AI Ink Interventions. Trained AI with hand-drawn bespoke tattoos by Miss AL Simpson.',
    description: 'Each Drone Blonde is a unique 1/1 artwork — AI-generated imagery overlaid with hand-drawn ink interventions and bespoke tattoos. No two alike. Each collector receives one unique Drone Blonde with their Collector\'s Set.',
    image: '/dd-shop.png',
    heroStatement: 'Every collector owns a masterpiece.',
  },
];

// ── Album tracklist ───────────────────────────────────────────────────────────
export const ALBUM = {
  title: 'THE DRONES OF SUBURBIA',
  artist: 'Miss AL Simpson',
  subtitle: 'The Drones of Suburbia — Volume I',
  label: 'Drones of Suburbia Music Studios',
  year: '2026',
  tracks: [
    { number: '01', title: 'The Drones of Suburbia',                          featured: true },
    { number: '02', title: 'Les Drones de la Banlieue' },
    { number: '03', title: 'The Drones of Suburbia (Roma)' },
    { number: '04', title: 'The Drones of Suburbia (Roma) Summer 2025 Edit' },
    { number: '05', title: 'Hollywood Drones (The Drones of Suburbia)' },
    { number: '06', title: 'The Drones of Suburbia (Frequency Edit)' },
    { number: '07', title: 'Drone Driver' },
    { number: '08', title: 'Suburbia Was Never Out There' },
    { number: '09', title: 'Surveillance Subway' },
    { number: '10', title: 'Heist' },
    { number: '11', title: "Diamond Drones Are a Girl's Best Friend" },
  ],
};

// ── Diamond Drone cut / rarity tiers ─────────────────────────────────────────
export const DRONE_CUTS = [
  { name: 'Brilliant Cut',  rarity: 'Legendary',  count: '10',    pct: '1%',   glow: '#e8f8ff' },
  { name: 'Princess Cut',   rarity: 'Rare',        count: '100',   pct: '10%',  glow: '#d0ecff' },
  { name: 'Marquise Cut',   rarity: 'Uncommon',    count: '200',   pct: '20%',  glow: '#c0e0f8' },
  { name: 'Rose Cut',       rarity: 'Common',      count: '300',   pct: '30%',  glow: '#b0d4f0' },
  { name: 'Baguette Cut',   rarity: 'Common',      count: '390',   pct: '39%',  glow: '#a0c8e8' },
];

// ── About sections ───────────────────────────────────────────────────────────
export const ABOUT = {
  collection: {
    title: 'About the Collection',
    body: [
      'DIAMOND DRONES ARE A GIRL\'S BEST FRIEND™ is the final New York chapter of The Drones of Suburbia — a major limited edition release combining sound, AI image, and drone technology into one unified collector object.',
      'Three drops form the universe: 1000 generative Diamond Drones, 120 Drone Blondes photographs, and the debut single — each minted independently and owned outright by the collector.',
      'Token-gated 4K archival downloads. An immersive world at dronesofsuburbia.com. One universe.',
    ],
  },
  series: {
    title: 'About The Drones of Suburbia',
    body: [
      'The Drones of Suburbia is a long-form cinematic world created by Miss AL Simpson. Originating in suburban Britain and expanding to New York City, it is a body of work that maps the collision of feminine experience, machine intelligence, surveillance culture, and art history.',
      'Films from the series have been exhibited at Sotheby\'s and shown internationally. The work spans film, sound, AI-generated image, and NFT — building a coherent world across media and across years.',
      'DIAMOND DRONES ARE A GIRL\'S BEST FRIEND™ is its defining statement.',
    ],
  },
  artist: {
    title: 'About the Artist',
    name: 'Miss AL Simpson',
    body: [
      'Miss AL Simpson is a British cryptoartist, filmmaker, and founder of The Drones of Suburbia. Based in the UK, she works across film, sound, AI image-making, and blockchain — building immersive cinematic worlds that collapse the boundaries between fine art, fashion, and technology.',
      'Her AI Ink Intervention process — a proprietary method of working back over machine-generated surfaces by hand — has produced a body of work that is neither purely generative nor purely painted. It occupies a territory entirely its own.',
      'Her work has been exhibited at Sotheby\'s. She is currently developing the Diamond Drones™ universe as a major international release.',
    ],
  },
};

// ── Lore page — expanded narrative ──────────────────────────────────────────
export const LORE_PAGE = {
  hero: {
    kicker: '',
    quote: {
      text: 'A haunting meditation on the tension between the natural and the artificial.',
      source: 'Sotheby\'s',
    },
  },
  origin: {
    title: 'Born in Edinburgh\'s Weather System',
    paragraphs: [
      'It started in Edinburgh — in the ink and in her weather system. For ten years, Miss AL Simpson mastered ink in Scotland\'s wild, cold, wet climate. Ink emerged with a life of its own.',
      'In 2019 she became a cryptoartist. In 2022 she created Soul Brds with AI — but the machine could not yet "see" ink. She had to pour ink into every single Soul Brd by hand. From there, two years training the machine to understand ink the way she could as an artist.',
      'The result was the first Drones of Suburbia films — where at last the machine could move ink and "see" ink the way she does. A cinematic universe that led to Sotheby\'s New York in 2025.',
    ],
  },
  series: {
    title: 'A Cinematic World',
    intro: 'The Drones of Suburbia is a long-form cinematic world that has unfolded across cities, years, and media — from Los Angeles to the streets of New York.',
    chapters: [
      {
        city: 'Edinburgh',
        year: '2009–2019',
        text: 'Where it all began. Ten years mastering ink in Scotland\'s wild weather system. The climate became a collaborator — ink emerged with a life of its own.',
      },
      {
        city: 'Soul Brds',
        year: '2022',
        text: 'AI met ink — but the machine could not yet "see" it. Miss AL Simpson had to pour ink into every single Soul Brd by hand. From here, she began two years of training the machine to understand ink the way she could as an artist.',
      },
      {
        city: 'Los Angeles',
        year: '2024',
        text: 'At last, the machine could move ink and "see" ink the way she does. The first Drones of Suburbia\u2122 film was set in LA \u2014 the women of Los Angeles with their AI-generated surveillance drones reimagined as objects of glamour.',
      },
      {
        city: 'Paris / New York',
        year: '2025',
        text: 'Les Drones de la Banlieue — set in Paris, French soundtrack. Exhibited and sold at Sotheby\'s Contemporary Discoveries Auction, New York, February 2025.',
      },
      {
        city: 'Roma',
        year: '2025',
        text: 'The Roma chapter introduced warmth, texture, and a Mediterranean light to the drone mythology. One film, one soundtrack — the series expanded into summer.',
      },
      {
        city: 'New York City',
        year: '2025/2026',
        text: 'Four new films \u2014 \u201cDrone Driver\u201d, \u201cSuburbia Was Never Out There\u201d, \u201cSurveillance Subway\u201d and \u201cHeist\u201d. The Drones of Suburbia\u2122 in the streets of New York.',
      },
    ],
  },
  sothebys: {
    title: 'Les Drones de la Banlieue',
    subtitle: 'Exhibited & Sold at Sotheby\'s Contemporary Discoveries Auction, New York',
    quote: {
      text: 'Blurring the lines between observation and surveillance, intimacy and intrusion.',
      source: 'Sotheby\'s',
      catalogue: 'Les Drones de la Banlieue, 2024',
    },
    film: '/films/02-les-drones-de-la-banlieue.mp4',
    link: 'https://www.sothebys.com/en/buy/auction/2025/contemporary-discoveries-2/les-drones-de-la-banlieue',
    paragraphs: [
      'Les Drones de la Banlieue sold at Sotheby\'s New York in February 2025 — the Contemporary Discoveries auction. A Paris-set AI Cinema film with a French soundtrack, surveillance drones reimagined through European urban sprawl.',
      'It was the moment two years of training the machine to move ink paid off. Sotheby\'s validated what started as an experiment in authored machine vision.',
      'DIAMOND DRONES™ is what came next — from Sotheby\'s to the blockchain, from one film to an entire world.',
    ],
  },
  artist: {
    title: 'The Artist-Founder',
    name: 'Miss AL Simpson',
    statement: [
      'Ten years of ink work in Edinburgh before AI existed. When the machine arrived, I spent two years training it to move ink the way I do.',
      'Soul Brds (2022) was the first collection — AI-generated but every piece hand-finished with ink. The machine couldn\'t yet see what I saw.',
      'Then it clicked. The Drones of Suburbia films were the result: authored AI Cinema where the machine proposes and I intervene. Sotheby\'s New York followed in 2025.',
      'DIAMOND DRONES™ is what I built from all of it — a trademarked digital diamond world, owned and controlled by the artist who made it.',
    ],
  },
};

// ── Collector set breakdown (for mint page explainer) ────────────────────────
export const COLLECTOR_SET = [
  {
    icon: '▶',
    label: '1 Short Film',
    detail: 'An edition of Diamond Drones Are a Girl\'s Best Friend™ — the final NYC film.',
  },
  {
    icon: '♫',
    label: '1 Album (Airdrop)',
    detail: 'The Drones of Suburbia album. 11 tracks. Airdropped to your wallet.',
  },
  {
    icon: '◆',
    label: 'Diamond Drone',
    detail: '1000 unique generative drones across five rarity tiers — Brilliant, Princess, Marquise, Rose, Baguette.',
    featured: true,
  },
  {
    icon: '♛',
    label: '1 Drone Blonde (1/1)',
    detail: 'A unique AI Ink Intervention — trained AI with hand-drawn bespoke tattoos. Each one a 1/1. No two alike.',
  },
];
