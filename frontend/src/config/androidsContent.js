// ── Porcelain Androids — Content Configuration ──
// Source of truth: docs/lore.md · docs/build-brief.md

// Machine lifecycle gate — set to true when all three phases are complete
// This unlocks the Originals gallery and Print Archive
export const MACHINE_DEPLETED = true;

export const SITE_META = {
  title: 'PORCELAIN ANDROIDS',
  subtitle: 'The Manga Machine',
  artist: 'Miss AL Simpson',
  description: 'An archive of a forgotten district. The Porcelain Androids appeared after the blackout. No manufacturer. No serial. They were simply there.',
  copyright: `© ${new Date().getFullYear()} Miss AL Simpson`,
};

export const HERO_COPY = {
  headline: 'PORCELAIN ANDROIDS',
  tagline: 'The Manga Machine',
  description: 'Roppongi District was marked for demolition. The lights stayed on, and no one ever explained why.',
};

// ── Discovery Fragments — scatter across the district ──
export const DISCOVERY_FRAGMENTS = [
  { id: 'archive-001', type: 'ARCHIVE ENTRY 001', text: 'Roppongi District was marked for demolition. The lights stayed on, and no one ever explained why.' },
  { id: 'archive-014', type: 'ARCHIVE ENTRY 014', text: 'The year is 2083. The Party throws the switches like grenades. Every blackout is aimed at us.' },
  { id: 'archive-022', type: 'ARCHIVE ENTRY 022', text: 'You cannot find a Tunnel. A Tunnel finds you — and only if it decides you\'re worth the finding.' },
  { id: 'witness-001', type: 'WITNESS RECORD', text: 'The porcelain figures appeared after the blackout. No manufacturer. No serial. No one delivered them. They were simply there, with the patience of the very old, as if they had waited out the whole demolition just to have the place to themselves.' },
  { id: 'witness-002', type: 'WITNESS RECORD', text: 'Mind the roses. A swarm of cherubs bled into the porcelain compile and could not be removed without bringing the whole render down. So they kept it. They wear heaven like a dare.' },
  { id: 'device-001', type: 'RECOVERED DEVICE // MM-01', text: 'Dragged up from beneath a shuttered manga café, Roppongi District. Half machine, half shrine. Function unknown. The street named it long before anyone understood what it did.' },
  { id: 'recovery-001', type: 'MEMORY RECOVERY SUCCESSFUL', text: 'Subject retained a hidden narrative layer. Manga imprint archived. You hold a Manga Memory now. Welcome to the archive.' },
  { id: 'print-001', type: 'ARCHIVE NOTE', text: 'This is not merchandise. Scan it and you are inside a classified file from the district. You are not a customer. You are an archive researcher, and the evidence is yours.' },
];

// ── Gallery stills — all Porcelain Androids ──
// mintable: N links to TRANSFORMATIONS[N-1] for Manga Machine access
export const STILLS = [
  { id: 'blue-cherub-girls', name: 'Blue Cherub Girls', file: 'blue-cherub-girls.png', mintable: 1 },
  { id: 'blue-manga-reflections', name: 'Blue Manga Reflections', file: 'blue-manga-reflections.png', mintable: 2 },
  { id: 'blue-pinky-tech', name: 'Blue Pinky Tech', file: 'blue-pinky-tech.png', mintable: 3 },
  { id: 'blue-reflections', name: 'Blue Reflections', file: 'blue-reflections.png', mintable: 30 },
  { id: 'blue-shiny-heart', name: 'Blue Shiny Heart', file: 'blue-shiny-heart.png', mintable: 4 },
  { id: 'cherub-disco', name: 'Cherub Disco', file: 'cherub-disco.png', mintable: 5 },
  { id: 'cherub-hunter', name: 'Cherub Hunter', file: 'cherub-hunter.png', mintable: 6 },
  { id: 'cherub-pink-car', name: 'Cherub Pink Car', file: 'cherub-pink-car.png' },
  { id: 'convertible-blue', name: 'Convertible Blue', file: 'convertible-blue.png', mintable: 7 },
  { id: 'dance-troupe', name: 'Dance Troupe', file: 'dance-troupe.png', mintable: 32 },
  { id: 'dj-manga-techy', name: 'DJ Manga Techy', file: 'dj-manga-techy.png', mintable: 8 },
  { id: 'drive-manga', name: 'Drive Manga', file: 'drive-manga.png', mintable: 9 },
  { id: 'glam-girls', name: 'Glam Girls', file: 'glam-girls.png' },
  { id: 'glamour-manga', name: 'Glamour Manga', file: 'glamour-manga.png', mintable: 33 },
  { id: 'glitch-angels', name: 'Glitch Angels', file: 'glitch-angels.png', mintable: 10 },
  { id: 'graffiti-babes', name: 'Graffiti Babes', file: 'graffiti-babes.png' },
  { id: 'green-glamour-manga', name: 'Green Glamour Manga', file: 'green-glamour-manga.png' },
  { id: 'green-goddess', name: 'Green Goddess', file: 'green-goddess.png' },
  { id: 'i-heart-cherubs', name: 'I Heart Cherubs', file: 'i-heart-cherubs.png', mintable: 11 },
  { id: 'madame-of-the-porcelain', name: 'Madame of the Porcelain', file: 'madame-of-the-porcelain.png', mintable: 12 },
  { id: 'manga-cherub-veils', name: 'Manga Cherub Veils', file: 'manga-cherub-veils.png' },
  { id: 'manga-dance-troupe', name: 'Manga Dance Troupe', file: 'manga-dance-troupe.png', mintable: 13 },
  { id: 'manga-disco-chicks', name: 'Manga Disco Chicks', file: 'manga-disco-chicks.png', mintable: 14 },
  { id: 'manga-gang', name: 'Manga Gang', file: 'manga-gang.png' },
  { id: 'manga-machine-beauties', name: 'Manga Machine Beauties', file: 'manga-machine-beauties.png', mintable: 31 },
  { id: 'manga-machine-party', name: 'Manga Machine Party', file: 'manga-machine-party.png' },
  { id: 'manga-pop-art', name: 'Manga Pop Art', file: 'manga-pop-art.png', mintable: 15 },
  { id: 'manga-trio', name: 'Manga Trio', file: 'manga-trio.png' },
  { id: 'manga-tulle', name: 'Manga Tulle', file: 'manga-tulle.png' },
  { id: 'manga-twins', name: 'Manga Twins', file: 'manga-twins.png', mintable: 16 },
  { id: 'mary-many-cherubs', name: 'Mary Many Cherubs', file: 'mary-many-cherubs.png' },
  { id: 'miss-grassmarket', name: 'Miss Grassmarket', file: 'miss-grassmarket.png', mintable: 17 },
  { id: 'miss-velvet-warnings', name: 'Miss Velvet Warnings', file: 'miss-velvet-warnings.png', mintable: 18 },
  { id: 'neon-dancers', name: 'Neon Dancers', file: 'neon-dancers.png' },
  { id: 'neon-green-girlies', name: 'Neon Green Girlies', file: 'neon-green-girlies.png', mintable: 19 },
  { id: 'neon-pink-rainy', name: 'Neon Pink Rainy', file: 'neon-pink-rainy.png', mintable: 20 },
  { id: 'orange-lovelies', name: 'Orange Lovelies', file: 'orange-lovelies.png', mintable: 21 },
  { id: 'orange-manga-girls', name: 'Orange Manga Girls', file: 'orange-manga-girls.png', mintable: 22 },
  { id: 'peach-pocket', name: 'Peach Pocket', file: 'peach-pocket.png' },
  { id: 'pink-bluey', name: 'Pink Bluey', file: 'pink-bluey.png' },
  { id: 'pink-cherub-veils', name: 'Pink Cherub Veils', file: 'pink-cherub-veils.png', mintable: 23 },
  { id: 'pink-petal-bomber', name: 'Pink Petal Bomber', file: 'pink-petal-bomber.png', mintable: 24 },
  { id: 'pinky-cherub-twins', name: 'Pinky Cherub Twins', file: 'pinky-cherub-twins.png', mintable: 25 },
  { id: 'punk-manga', name: 'Punk Manga', file: 'punk-manga.png', mintable: 26 },
  { id: 'queen-green-ghost-taxis', name: 'Queen Green Ghost Taxis', file: 'queen-green-ghost-taxis.png', mintable: 27 },
  { id: 'roses-are-red', name: 'Roses Are Red', file: 'roses-are-red.png' },
  { id: 'rosy-cherub-singers', name: 'Rosy Cherub Singers', file: 'rosy-cherub-singers.png' },
  { id: 'techno-girl', name: 'Techno Girl', file: 'techno-girl.png', mintable: 28 },
  { id: 'the-machine-pixie', name: 'The Machine Pixie', file: 'the-machine-pixie.png', mintable: 29 },
  { id: 'tulle-girlie', name: 'Tulle Girlie', file: 'tulle-girlie.png' },
];

// ── Manga Machine transformations — per-phase triptych sets ──
// Phase 1 (Fresh Ink): 33 complete triplets
const TRIPLET_NAMES_P1 = [
  'blue-cherub-girls', 'blue-manga-reflections', 'blue-pinky-tech', 'blue-shiny-heart',
  'cherub-disco', 'cherub-hunter', 'convertible-blue', 'dj-manga-techy', 'drive-manga',
  'glitch-angels', 'i-heart-cherubs', 'madame-of-the-porcelain', 'manga-dance-troupe',
  'manga-disco-chicks', 'manga-pop-art', 'manga-twins', 'miss-grassmarket',
  'miss-velvet-warnings', 'neon-green-girlies', 'neon-pink-rainy', 'orange-lovelies',
  'orange-manga-girls', 'pink-cherub-veils', 'pink-petal-bomber', 'pinky-cherub-twins',
  'punk-manga', 'queen-green-ghost-taxis', 'techno-girl', 'the-machine-pixie',
  'blue-reflections', 'manga-machine-beauties', 'dance-troupe', 'glamour-manga',
];
// Phase 2 (Ink Depletion): add slugs here as you create them
const TRIPLET_NAMES_P2 = [
  'blue-cherub-girls-p2', 'blue-manga-reflections-p2',
];
// Phase 3 (Exhaustion): add slugs here as you create them
const TRIPLET_NAMES_P3 = [
];

const buildTriplets = (slugs) => slugs.map((slug, i) => ({
  id: i + 1,
  slug,
  label: slug.replace(/-p[23]$/, '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
  porcelain: `/androids/stills/${slug}.png`,
  thumb: `/androids/stills/thumbs/${slug}.jpg`,
  video: `/androids/transformations/${slug}.mp4`,
  manga: `/androids/manga/${slug}.png`,
}));

// Default export (Phase 1) for backward compat
export const TRANSFORMATIONS = buildTriplets(TRIPLET_NAMES_P1);
export const TRANSFORMATIONS_P2 = buildTriplets(TRIPLET_NAMES_P2);
export const TRANSFORMATIONS_P3 = buildTriplets(TRIPLET_NAMES_P3);
// All phases indexed by phase number
export const PHASE_TRANSFORMATIONS = [TRANSFORMATIONS, TRANSFORMATIONS_P2, TRANSFORMATIONS_P3];

// ── Film ──
export const FILM = {
  title: 'THE MANGA MACHINE',
  src: '/androids/film/the-manga-machine.mp4',
  poster: '/androids/film/the-manga-machine-still.png',
  description: 'A short film by Miss AL Simpson. The Porcelain Androids visit the Manga Nightclub and discover The Manga Machine — a device that transforms them into manga characters.',
  competition: 'Kling AI Short Film Competition',
};

// ── Mint / Recovery links (update when live) ──
export const MINT_LINKS = {
  filmEdition: 'https://www.transient.xyz/mint/the-manga-machine',
  mangaMachine: '', // On-chain contract address
};

// ── On-chain collection: THE MANGA MACHINE - PORCELAIN ANDROIDS (Ethereum) ──
// 116 tokens: 1–50 Porcelain Androids · 51–83 Manga Doubles · 84–116 Transformations.
export const PORCELAIN_CONTRACT = '0xE7C62655148B86f8829608378C638a03E73342bA';
export const openseaTokenUrl = (tokenId) =>
  `https://opensea.io/assets/ethereum/${PORCELAIN_CONTRACT}/${tokenId}`;
// STILLS[i] (Porcelain Androids gallery) maps to on-chain token i + 1.
export const stillTokenId = (index) => index + 1;

// ── Domain-aware base path ──
const isAndroidsDomain = ['porcelainandroid.com', 'www.porcelainandroid.com', 'porcelain-android.netlify.app'].includes(window.location.hostname);
export const ANDROIDS_BASE = isAndroidsDomain ? '' : '/androids';

// ── Nav zones — archive index ──
// locked: true = zone sealed until MACHINE_DEPLETED is true
export const ZONES = [
  { path: `${ANDROIDS_BASE}/`, label: 'The Alley', end: true },
  { path: `${ANDROIDS_BASE}/originals`, label: 'Porcelain Androids', locked: !MACHINE_DEPLETED },
  { path: `${ANDROIDS_BASE}/manga-machine`, label: 'The Manga Machine' },
  { path: `${ANDROIDS_BASE}/manga-drop`, label: 'The Drop' },
  { path: `${ANDROIDS_BASE}/nightclub`, label: 'The Nightclub' },
  { path: `${ANDROIDS_BASE}/lore`, label: 'The Lore' },
  { path: `${ANDROIDS_BASE}/graffiti`, label: 'Graffiti Wall' },
  { path: `${ANDROIDS_BASE}/prints`, label: 'Print Archive', locked: !MACHINE_DEPLETED },
  { path: `${ANDROIDS_BASE}/social`, label: 'Social Wall' },
  { path: `${ANDROIDS_BASE}/about`, label: 'About' },
];
