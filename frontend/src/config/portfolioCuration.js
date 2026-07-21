// portfolioCuration.js — the human layer over the on-chain catalogue.
//
// Two hand-maintained lists. Move a contract between them to recategorise; the
// site (museum + cosmos) updates automatically via portfolioData.js.
//
//   PROJECTS          — her named series / collections / worlds. Pulled out of
//                       the by-year 1/1 record and featured as bodies of work.
//   EXCLUDE_CONTRACTS — NOT her original art (collected from other artists,
//                       wrapped tokens, spam airdrops, ENS). Hidden everywhere.
//
// Anything she minted that is in neither list is treated as a genuine 1/1 and
// listed under Works, by year.
//
// Addresses are lowercase; chain defaults to 'ethereum'.

const eth = address => ({ chain: 'ethereum', address });
const base = address => ({ chain: 'base', address });

export const PROJECTS = [
  {
    slug: 'interface',
    name: 'Interface',
    year: 2024,
    scale: 10000,
    generative: true, // large generative collection — kept OUT of by-year Works
    medium: 'Generative collection · Base',
    world: 'https://www.interfacenfts.io',
    blurb:
      'A 10,000-piece generative collection on Base — the artist’s largest single body of work, an exploration of the human–machine threshold.',
    contracts: [base('0x65a078abf1fdbf05ae5e0b56d517206e9b163b82')],
  },
  {
    slug: 'diamond-drones',
    name: 'Diamond Drones',
    year: 2026,
    scale: 1000,
    generative: true, // large generative collection — kept OUT of by-year Works
    medium: 'Generative · AI ink intervention',
    world: 'https://diamonddrones.world',
    blurb:
      '1,000 unique digital diamonds, each cut by an AI ink-intervention process. The flagship Diamond Drones™ collection.',
    contracts: [eth('0xc226286ced25d96bcec1578a3ab582cf5fbdc512')],
  },
  {
    slug: 'soulbrds',
    name: 'Soulbrds',
    year: 2022,
    scale: 600,
    generative: true, // large generative collection — kept OUT of by-year Works
    medium: 'Generative portraits',
    blurb: 'A 600-strong series of AI-augmented soul portraits.',
    contracts: [eth('0xd9e7a8b15480ab2b3343e84608082d99da552de6')],
  },
  {
    slug: 'algorithmic-muse',
    name: 'The Algorithmic Muse',
    year: 2024,
    medium: 'Generative series',
    blurb: '200 works interrogating the muse as algorithm.',
    contracts: [eth('0x49f8108c9dca8eb0680a4e0404104dc8cb7aa6f3')],
  },
  {
    slug: 'drone-blondes',
    name: 'Drone Blondes',
    year: 2026,
    scale: 120,
    medium: 'Black & white photography',
    world: 'https://diamonddrones.world/lounge',
    blurb: '120 black-and-white drone portraits — the Boudoir of the Diamond Drones world.',
    contracts: [eth('0x505348e10069d5083842532f5f5fa432631d109e')],
  },
  {
    slug: 'metamorphoses',
    name: 'Metamorphoses',
    year: 2023,
    scale: 100,
    generative: true, // long-form generative — kept OUT of by-year Works, shown only as a Project
    medium: 'AI long-form generative · 0KAI / Kate Vass Galerie',
    world: 'https://katevassgalerie.com/blog/metamorphoses-miss-al-simpson',
    blurb:
      'Her first AI long-form generative project — 100 live-generated iterations built on Kate Vass Galerie’s 0KAI machine, inspired by Ovid’s Metamorphoses and blended with her 2018 analogue artwork. Premiered as a Dutch auction in the group show “Do Androids Dream About Electric Sheep?”, 31 May 2023.',
    contracts: [eth('0x6c2d466d700234dbef197036ff240f4886e44b81')],
  },
  {
    slug: 'crypto-pin-ups',
    name: 'Crypto Pin-Ups',
    year: 2023,
    medium: 'Series',
    blurb: '100 crypto-native pin-up portraits.',
    contracts: [eth('0x277a32b16fda712d9a8c5f5a694ac7a3175f7dd7')],
  },
  {
    slug: 'lost-motels',
    name: 'Lost Motels',
    year: 2025,
    medium: 'MISS AL SIMPSON × DALL·E 2',
    blurb: 'A collaboration with DALL·E 2 — 70 cinematic visions of abandoned American motels.',
    generative: true, // large generative collection — kept OUT of by-year Works, shown only as a Project
    contracts: [eth('0x33c6249d7e6659496aba7af063be9d1fab002967')],
  },
  {
    slug: 'drones-of-suburbia',
    name: 'The Drones of Suburbia',
    year: 2025,
    medium: 'Cinematic body of work',
    blurb:
      'The Drones of Suburbia™ — an ongoing cinematic universe spanning Roma, Hollywood, NYC, Paris and L.A. chapters.',
    contracts: [
      eth('0xe2b7e69ea88d5caa0e3cc0ab1904d54176b1120f'), // ROMA
      eth('0x3387de03d844b133dd50b04be325d7fb7bccedb5'), // INTERFERENCE
      eth('0xb3fc4625e7c061b6ac5b0344eb6933a08cedbcb3'), // HOLLYWOOD
      eth('0x92a75e5e8ab62367fd30a5018dd4e0e087232a69'), // Roma — Ink
      eth('0xefd42f7b828c33adf78f9c9ef614ed66f2d77897'), // NYC
      eth('0xc130febf7d702fa8bf0b81628deb2f4f31f78422'), // Analogue Ink
      eth('0x1385258dd29bf599286b96a1db03a62a35bf47b6'), // NYC — Drone Driver
      eth('0x0c5ffe157df3c7e27878bd32b8941069bab9639a'), // Paris — Ink
      eth('0x6829b32e85af66a503916042bfed3d3a9c5b571f'), // Drone Driver — AI Cinema
      eth('0x8ab5e7b4ab33b10c5de5837392375353db8676b1'), // Penthouse Cinema Stills
      eth('0x2a2b79f33f9e737920506b11a396309ffdd329a5'), // L.A.
      eth('0x75894dc7ca9ccbd9e3f9ebdf43a07f320ed3f7e4'), // Les Drones de la Banlieue
    ],
  },
  {
    slug: 'chrono-visions',
    name: 'Chrono Visions',
    year: 2023,
    medium: 'Series',
    blurb: '35 date-stamped visions across time.',
    contracts: [eth('0x0fe431baf6dbfc55b3a2ccf55c0ac99fc2418084')],
  },
  {
    slug: 'porcelain-android',
    name: 'Porcelain Android',
    year: 2026,
    medium: 'World',
    world: 'https://porcelainandroid.com',
    blurb: 'The Porcelain Android world — fragile machine femininity in glaze and circuitry.',
    contracts: [
      eth('0xbb5df1320cc5b0babeb63e40c619ca62412e408a'),
      eth('0x4aca802eee7e7b744a1b410fbc83eddc4d8904ab'), // Manga Machine graffiti collage
    ],
  },
  {
    slug: 'drone-town',
    name: 'Drone Town',
    year: 2026,
    medium: 'Series',
    blurb: 'The inhabitants of Drone Town — a Diamond Drones side-world.',
    contracts: [eth('0x0b702cfd76f23eb5ba0bd1aa4b52cef375e2b203')],
  },
  {
    slug: 'club-couture',
    name: 'Club Couture',
    year: 2025,
    medium: 'Series',
    blurb: 'Couture under nightclub light — and its Velvet Rooms.',
    contracts: [
      eth('0x87aceed5e5c1559221339c77d1584a0b26d19ccd'),
      eth('0x9049f76fcfa522cb33e558dba1ca40c65489bab5'), // Velvet Rooms
    ],
  },
  {
    slug: 'recursive-loop',
    name: 'Recursive Loop Paintings',
    year: 2025,
    medium: 'Generative painting series',
    blurb: 'Paintings that never resolve — a recursive feedback series.',
    contracts: [
      eth('0x9de99ee5b2390a7f93481e96e51ffc29dd869771'),
      eth('0x71d40789fb7dce233651042b2cfdd86ba2fac5d5'), // The Recursive Loop
    ],
  },
  {
    slug: 'crypto-wallets',
    name: 'Crypto Wallets',
    year: 2025,
    medium: 'Series',
    blurb: 'Portraits of the people behind the wallets.',
    contracts: [eth('0x799ebebd6fb426ad2b00f5655fd071c7a8dba371')],
  },
  {
    slug: 'miss-ai',
    name: 'Miss AI',
    year: 2024,
    medium: 'Series',
    blurb: 'The Miss AI agents — autonomous femininity.',
    contracts: [eth('0x6b1d426b3688c2053dab37f5d9a6b0f82c041fc7')],
  },
  {
    slug: 'digital-pop-art',
    name: 'Digital Pop Art',
    year: 2020,
    medium: 'Early series',
    blurb: 'NFT Babe / ETH Babe — an early digital pop-art series.',
    contracts: [eth('0xb9b25168c28499b248bbbe514e685eca1892547d')],
  },
  {
    slug: 'paper-dolls',
    name: 'Paper Dolls',
    year: 2021,
    medium: 'Series',
    blurb: 'A cut-out paper-doll series.',
    contracts: [eth('0x1a7afeab3865835d78a34bb4b4d02b92321e1fc9')],
  },
  {
    slug: 'virtual-versailles',
    name: 'Virtual Versailles',
    year: 2024,
    medium: 'Series',
    blurb: 'Masked avatars and blue queens in a virtual court.',
    contracts: [eth('0x1bbb3f6c08e02e553ec82425297bb858da92167d')],
  },
  {
    slug: 'hollywood-pixelations',
    name: 'Hollywood Pixelations',
    year: 2024,
    medium: 'Series',
    blurb: 'Mulholland oracles, pixelated.',
    contracts: [eth('0x26a2ed1a5e903ea36dfe12f6301d4ffff9511f48')],
  },
];

// NOT her original 1/1 art — hidden everywhere.
export const EXCLUDE_CONTRACTS = [
  eth('0x0732cb3f86e418ecb5b565e86e8c611e209f1554'), // Hiddenmiss — must stay hidden everywhere
  eth('0x6a7381e3496221113933587ea0e9fc10113c78a5'), // Anthony Hopkins — Bloodline
  eth('0xe8e857aafd0323bca5f080f735aa99c1bfd2d51f'), // Anthony Hopkins — Eternal Gifts
  eth('0x6c2b0a6269d09d0d22999e68c7be174e5a026c7e'), // "LOUlS VUITTON OfficiaI" — spam
  eth('0xb163292cb92c9039e5902de29a43df9df8ddd89d'), // Kuroki — Free Mint spam
  eth('0xc4b2a9200bc08df8917cc91be123025870d053aa'), // Bybit VIP — spam
  eth('0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401'), // ENS names
  eth('0xc143bbfcdbdbed6d454803804752a064a622c1f3'), // DecentralEyesMashup — Coldie (collected)
  eth('0x2086f6f916a6bf22920cb9b28fc4119ce245dff4'), // McLaren Genesis (collected)
  eth('0xe3589ae55bbd7697c76c510a5335eb31d972a17e'), // Broadside (collected)
  eth('0xdf4464ac5c4346b8ff1501e3ae2790c4ae3e610a'), // Sightseers — Norman Harman (collected)
  eth('0xb851e9051c2257b273d81829c9fe307f7f3fb49d'), // IYKYK — Kevin Abosch (collected)
  eth('0x33fd426905f149f8376e227d0c9d3340aad17af1'), // The Memes by 6529 (collected)
  eth('0xd9e8a0b1c89548fddf1b069c7f000b08347fcc0b'), // Art By Tatum (collected)
  eth('0x9bc3097d8fca4c54d2c91fad0723a0a3b261ca1d'), // PolyOne Genesis Orb (collected)
  eth('0xd07dc4262bcdbf85190c01c996b4c06a461d2430'), // Doodle Cats by Kristy Glas (wrapped/collected)
  eth('0x1d963688fe2209a98db35c67a041524822cf04ff'), // MarbleCards (wrapped)
  eth('0xb6d8cfb88efdf017aebba9152497657286f7cf5e'), // Ai SHELLZ (collected)
  eth('0x3318d287bc2085442e791a1658c370092dedb66d'), // Unidentified — "Fvck That Noise"
  eth('0x324c4f6a23c343778f466c4cf01d7d94e4b596f4'), // The Banksters — not her work
  eth('0x81c50fe3f697e9d6f0a26664ace8f1cdd8f02bf7'), // The Banksters (old) — not her work
  eth('0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258'), // Otherdeed for Otherside — Yuga land deed (collected)
  eth('0x56fb26a1178298c4f50d484ba6b4e1b83d657803'), // DESKTOP STATUE SYSTEMS LIMITED — Robness (collected)
  // PancakeSwap V4 "$CAKE airdrop" phishing-spam drops (Base) — not her work
  base('0xd21973d714c93de01f4e6dd9f2d8592b7901a4cf'),
  base('0x78209d00e6542ef70f6905676219ed5e54eb8849'),
  base('0xcd811c86c794e377d7472c5d4b37e36d10688c84'),
  base('0x35998b239cdc74761ce8a165b136e7cc03cc44f4'),
  base('0x752f85404769a1029d9462b1780fdf06092e8f2e'),
  base('0xe179571dc15b3587bfc1b5aacc76e05bbf1f8e83'),
  base('0x3d908066c41f04b6987fa2a190ebceb44edc4ca2'),
  base('0x9e1b830597c0a07c53f3b7ba060fddefc72d62c7'),
  base('0xb9d145d2b9ce355500569b9472726785753f3e35'),
  base('0xd93665a8bc7b76bdf0fd9a7ddab5448dc1f64bb1'),
  base('0x64f793e94ed5d7d6f6385b93e07c7cdbfd556eeb'),
  base('0xa9633ec401693debd3585ef33d76d1ea6354105d'),
  // Other phishing-spam "airdrop / claim / voucher" drops (Base) — QR-code
  // redeem scams, not her work
  base('0x3e3a142a5824f7363f315b909460f1588c77fd48'), // Jupiter "$JUP Voucher" (t.ly/nftjup)
  base('0x4a0496d9a3b69e00c2170eda71d5148dc49a1e05'), // Jupiter "$JUP Voucher" (jupnft-received.com)
  base('0xfebe5352b0b00a72c6accb7bf84e77c6736572d1'), // "Fight for PEPE" $PEPE airdrop
  base('0x2a6ab5427990f9f013e03f07c36524eff124cdb6'), // $PAWS claws airdrop
  base('0x3fc4b5c5e1f620a55fb258231dd1d2cdce40ec6b'), // Shiba Inu $SHIB airdrop
  base('0xca36ae8e4015af5a385f9251c11e0993fbd41efe'), // Pudgy Penguins $PENGU drop
  base('0x9cc0fbb2baa212f75310827583e597653c36cc67'), // $BRETT airdrop
  base('0xf1e4e6b42ab0e2c5bf29d08d66180a0831ee18fa'), // "Thank you for subscribing" t3m.us
  base('0xd46fed0344801e39204a2865ab7b5e4b9a8939e6'), // Mode airdrop (mode-claim.xyz)
  // Block Folk — not her work
  eth('0xe844f73f3c5121131ddc021a63fee068b15659f1'),
  // Collected art from other artists (Base) — not hers
  base('0xe596032173b0b09e86f2dbe3a5439773f653f4be'), // "Puffy Icons" by Marcela Bellini
  base('0x889da696932a1432a921413881e90634324744d0'), // "trust the ascent"
  eth('0xcba5ae95e5d0a0d171054c4a3c1084d744b098b4'), // HAI 2.0 — collected, not her work
  base('0xceadd34edba6f9fa1c9bb683d11610d1d6834fe6'), // DeBox "Decentralized Social Frontiers SBT" — soulbound platform badge, not art
  base('0x866a5b20db351e46ca5da3e8a65981277d307420'), // "Yura Miron Editions on Base" — another artist's editions, collected
];

// Individual works to hide (where the contract is shared and can't be excluded
// wholesale). Keyed by the work id from artistWorks.json.
export const EXCLUDE_WORK_IDS = new Set([
  'ethereum-0xa89134c6bfa85b4451ad37f194a8e8cfc406482b-14', // "Mouth Lagoon '66" — not her work
  'ethereum-0xb3fc4625e7c061b6ac5b0344eb6933a08cedbcb3-2', // "Pink Feathers and Drone" — pink breaks the B&W home wall
  'ethereum-0xfbeef911dc5821886e1dda71586d90ed28174b7d-69527', // "Variazioni" — collected generative work (Foundation shared contract), not hers
  'ethereum-0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0-5644', // "BABY BORIS" — sent to trash / burned, should not appear
  'ethereum-0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0-5013', // "THE PIXEL TRAP" — burned, should not appear
  'ethereum-0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0-4979', // "LOVE 24 HRS" — burned, should not appear
  'ethereum-0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0-4862', // "THE SIREN" — remove per AL
  'ethereum-0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0-7332', // "THE COLOUR OF GRAVITY" — not hers
  'ethereum-0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0-7330', // "THE COLOUR OF GRAVITY" — not hers
  'ethereum-0x2b4572419f2b2a0c198cc8789de881287c09d8c3-41',  // "THE COLOUR OF GRAVITY" — not hers
  'base-0x2717c9db9462d8a43ca4f8db43a0da536a6d3da7-6121', // "Renascentia" — not hers
  'ethereum-0x2fcfc019c372d4aed81d1db27c30246da23ff8c0-1', // "A Cryptoart Manifesto" — not hers
  'ethereum-0xa89134c6bfa85b4451ad37f194a8e8cfc406482b-9', // "eating the world" — not hers (1mouth / Straight to the Point shared contract)
  'ethereum-0x33921fd1dfc42570555e7543ac35e76e56a89b90-71', // "1mouth analog #38" — not hers (1mouth analog by miirror)
  'base-0x3394e259dc26b7af0f0d139d55af33dc11414ff4-107', // "Founder's Pass" — phishing airdrop spoofing "Art Blocks", not hers
  'ethereum-0x69525dac489e4718964b5615c3d794a25d62beb7-985', // "AI INK INTERVENTIONS" (Worlds) — broken placeholder image, remove everywhere
  'ethereum-0xa61f864fc766e98c90c03ac1d8063683ba0f0e29-3', // "Proof of Faith" (Adolescence, illustrated by Ballzerino) — not hers
  'ethereum-0x8e44ebb62ef1d1191eda8e5f1cb2ffc279182c5b-605', // "frosye #605" (etherstar by rabanheidr) — not hers
  // Empty / untitled 2026 placeholder tokens with no image (COLLAGE 2026 + RIGHT OF RETURN)
  'ethereum-0xd3fe6e67f846e279ebc7d7aeb86f94b653851884-2',
  'ethereum-0xd3fe6e67f846e279ebc7d7aeb86f94b653851884-3',
  'ethereum-0xd3fe6e67f846e279ebc7d7aeb86f94b653851884-4',
  'ethereum-0x09fb649a44b95ea364b3bd8a7347b4ce824bb45f-2',
  'ethereum-0x09fb649a44b95ea364b3bd8a7347b4ce824bb45f-4',
  'ethereum-0x09fb649a44b95ea364b3bd8a7347b4ce824bb45f-5',
  'ethereum-0x09fb649a44b95ea364b3bd8a7347b4ce824bb45f-6',
  'base-0xc5c45108cfc292b47583126b59629a6a7b5e4de3-1', // "MANITHANKS 24" — Manifold thank-you edition, not a catalogue artwork
  'ethereum-0x2a94d5dca25f24c0b7c337a29bf4474210d901ad-2', // "Dialogue of Transparency #100" (METAMORPHOSIS) — not hers
  'ethereum-0xe3307ef4b09670fa30ed2b4e99c05e74bf913647-521', // "OPTION" — not hers
  'ethereum-0xfbeef911dc5821886e1dda71586d90ed28174b7d-113037', // "the dawning" (Foundation, collected from a peer) — not hers
  'ethereum-0xfbeef911dc5821886e1dda71586d90ed28174b7d-89488', // "Glitch 0AQ20" (Somnium Space VR, Foundation shared contract) — not hers
  'ethereum-0xfbeef911dc5821886e1dda71586d90ed28174b7d-79704', // "_ ch6 _ lueur" (Somnium Space VR, Foundation shared contract) — not hers
  'ethereum-0xfbeef911dc5821886e1dda71586d90ed28174b7d-575515', // "Digital Existence Exhibition Invite" (Somnium Space VR, Foundation shared) — not hers
  'ethereum-0xba5a230e2d29e5629737484364c694381d7875e4-111', // "Untitled #111" (CRYPTOADSOLD, no image) — not hers
  'ethereum-0x8fbce6d422a2adfbf1195b073a81080714018389-28', // "Growing in Porcelain 30" — collected from another artist, not hers
  'ethereum-0xa89134c6bfa85b4451ad37f194a8e8cfc406482b-8', // "sign said no" (Straight to the point Editions) — not hers
  'base-0x8d6f80f74d8238a5db475a58009e51fe7901cd7c-0', // "Let Your Light Shine II" (Base) — not hers
  'base-0x39faa6a068e83a12d980dbec4f80426a260e49d7-0', // "The Empress" (Base) — not hers
  'base-0x2439b05d3ad7f3a66fb5a2ad1e781daf3a0a02f9-0', // "Forget-Me-Not" (Base) — not hers
  'ethereum-0x01284c3ae295bab7271481b7ba18387255176f92-48', // "THE GOLDEN ECHO_[LE] #48/500" (451.RED_[LE] edition) — not hers
  'ethereum-0x01284c3ae295bab7271481b7ba18387255176f92-98', // "2.5 STUDIES FOR THE TRANSMIGRATION OF PROTEUS_[LE]" (451.RED_[LE] edition) — not hers
]);

// Hand-added works that the Alchemy wallet fetch can't see — typically pieces
// that SOLD and now live in a collector's wallet, so they no longer appear in
// artistWorks.json. Merged straight into the by-year catalogue by portfolioData.
// Drop the artwork file in /public at the `image` path below.
export const EXTRA_WORKS = [
  {
    id: 'ethereum-modern-love-2019',
    chain: 'ethereum',
    contract: 'modern-love',        // placeholder — keeps it out of contract-level rules
    tokenId: '1',
    year: 2019,
    mintedAt: 1561939200,           // 2019 — sorts within the year
    title: 'Modern Love',
    collection: 'Ink Interventions',
    medium: 'AI ink intervention',
    description:
      'Collected by Jason Bailey (Artnome): “…it reminds me of one of Richard Prince’s Nurses getting enveloped by a Clyfford Still.”',
    image: '/MODERNLOVE.png',       // file at frontend/public/MODERNLOVE.png
  },
];
