/**
 * museumLayout.js — Pure data: room dimensions, artwork positions, rarity config
 *
 * Gallery layout: L-shaped museum with main hall + side wing
 * - Main hall: 50 Diamond Drone artworks across walls
 * - End wall: Diamond Drones film projection screen
 */

/* ── Room Dimensions (in Three.js units ≈ metres) ── */
export const ROOM = {
  width: 20,        // x-axis
  length: 60,       // z-axis (depth)
  height: 7,        // y-axis
  wallThickness: 0.3,
  baseboardHeight: 0.15,
};

/* ── 50 curated Diamond Drones — IDs spread across the 1,000 collection ── */
export const VAULT_DRONES = [
  // Brilliant Cut (10)
  { id: 1,    cut: 'Brilliant Cut',  size: 'lg' },
  { id: 85,   cut: 'Brilliant Cut',  size: 'md' },
  { id: 250,  cut: 'Brilliant Cut',  size: 'lg' },
  { id: 420,  cut: 'Brilliant Cut',  size: 'sm' },
  { id: 500,  cut: 'Brilliant Cut',  size: 'md' },
  { id: 630,  cut: 'Brilliant Cut',  size: 'lg' },
  { id: 800,  cut: 'Brilliant Cut',  size: 'sm' },
  { id: 950,  cut: 'Brilliant Cut',  size: 'md' },
  { id: 960, cut: 'Brilliant Cut',  size: 'lg' },
  { id: 990, cut: 'Brilliant Cut',  size: 'md' },

  // Princess Cut (10)
  { id: 50,   cut: 'Princess Cut',   size: 'md' },
  { id: 175,  cut: 'Princess Cut',   size: 'lg' },
  { id: 300,  cut: 'Princess Cut',   size: 'sm' },
  { id: 460,  cut: 'Princess Cut',   size: 'md' },
  { id: 550,  cut: 'Princess Cut',   size: 'lg' },
  { id: 680,  cut: 'Princess Cut',   size: 'sm' },
  { id: 750,  cut: 'Princess Cut',   size: 'md' },
  { id: 880,  cut: 'Princess Cut',   size: 'lg' },
  { id: 970, cut: 'Princess Cut',   size: 'md' },
  { id: 980, cut: 'Princess Cut',   size: 'sm' },

  // Marquise Cut (10)
  { id: 100,  cut: 'Marquise Cut',   size: 'sm' },
  { id: 220,  cut: 'Marquise Cut',   size: 'lg' },
  { id: 340,  cut: 'Marquise Cut',   size: 'md' },
  { id: 400,  cut: 'Marquise Cut',   size: 'lg' },
  { id: 520,  cut: 'Marquise Cut',   size: 'sm' },
  { id: 650,  cut: 'Marquise Cut',   size: 'md' },
  { id: 770,  cut: 'Marquise Cut',   size: 'lg' },
  { id: 900,  cut: 'Marquise Cut',   size: 'sm' },
  { id: 910, cut: 'Marquise Cut',   size: 'md' },
  { id: 940, cut: 'Marquise Cut',   size: 'lg' },

  // Rose Cut (10)
  { id: 150,  cut: 'Rose Cut',       size: 'md' },
  { id: 280,  cut: 'Rose Cut',       size: 'lg' },
  { id: 350,  cut: 'Rose Cut',       size: 'sm' },
  { id: 480,  cut: 'Rose Cut',       size: 'md' },
  { id: 570,  cut: 'Rose Cut',       size: 'lg' },
  { id: 600,  cut: 'Rose Cut',       size: 'sm' },
  { id: 720,  cut: 'Rose Cut',       size: 'md' },
  { id: 850,  cut: 'Rose Cut',       size: 'lg' },
  { id: 920, cut: 'Rose Cut',       size: 'sm' },
  { id: 860, cut: 'Rose Cut',       size: 'md' },

  // Baguette Cut (10)
  { id: 200,  cut: 'Baguette Cut',   size: 'sm' },
  { id: 310,  cut: 'Baguette Cut',   size: 'md' },
  { id: 450,  cut: 'Baguette Cut',   size: 'lg' },
  { id: 530,  cut: 'Baguette Cut',   size: 'sm' },
  { id: 700,  cut: 'Baguette Cut',   size: 'lg' },
  { id: 820,  cut: 'Baguette Cut',   size: 'md' },
  { id: 930,  cut: 'Baguette Cut',   size: 'sm' },
  { id: 870, cut: 'Baguette Cut',   size: 'lg' },
  { id: 890, cut: 'Baguette Cut',   size: 'md' },
  { id: 840, cut: 'Baguette Cut',   size: 'sm' },
];

/* ── Frame sizes in metres ── */
export const FRAME_SIZE = {
  sm: { w: 1.3,  h: 1.3 },
  md: { w: 1.7,  h: 1.7 },
  lg: { w: 2.1,  h: 2.1 },
};

/* ── Rarity tiers from dronesContent ── */
export const RARITY_COLOR = {
  Legendary:  '#e8f8ff',
  Rare:       '#c8e8ff',
  Uncommon:   '#b0d4f0',
  Common:     '#8a8a8a',
};

export const CUT_RARITY = {
  'Brilliant Cut':  'Legendary',
  'Princess Cut':   'Rare',
  'Marquise Cut':   'Uncommon',
  'Rose Cut':       'Common',
  'Baguette Cut':   'Common',
};

/**
 * Generate wall positions for all artworks.
 * Distributes 50 pieces: 25 on left wall, 25 on right wall.
 * Artworks are interleaved by cut type for visual variety.
 */
export function generateArtworkPositions(drones) {
  const positions = [];
  const halfW = ROOM.width / 2;
  const hangHeight = 2.0; // centre of artwork Y position
  const spacing = 2.2;    // z-spacing between artworks
  const startZ = -ROOM.length / 2 + 4; // start 4m from entrance

  // Interleave cuts for visual variety
  const shuffled = [];
  const byCut = {};
  drones.forEach(d => {
    if (!byCut[d.cut]) byCut[d.cut] = [];
    byCut[d.cut].push(d);
  });
  const cutKeys = Object.keys(byCut);
  let maxLen = Math.max(...cutKeys.map(k => byCut[k].length));
  for (let i = 0; i < maxLen; i++) {
    for (const key of cutKeys) {
      if (byCut[key][i]) shuffled.push(byCut[key][i]);
    }
  }

  const leftWall = shuffled.filter((_, i) => i % 2 === 0);
  const rightWall = shuffled.filter((_, i) => i % 2 === 1);

  // Left wall: x = -halfW + wallThickness + 0.01 (flush), facing right (+x)
  leftWall.forEach((drone, i) => {
    positions.push({
      ...drone,
      position: [-(halfW - ROOM.wallThickness - 0.01), hangHeight, startZ + i * spacing],
      rotation: [0, Math.PI / 2, 0], // face right
      wall: 'left',
    });
  });

  // Right wall: x = halfW - wallThickness - 0.01 (flush), facing left (-x)
  rightWall.forEach((drone, i) => {
    positions.push({
      ...drone,
      position: [(halfW - ROOM.wallThickness - 0.01), hangHeight, startZ + i * spacing],
      rotation: [0, -Math.PI / 2, 0], // face left
      wall: 'right',
    });
  });

  return positions;
}

/* ── Film Screen (end wall projection) ── */
export const FILM_SCREEN = {
  position: [0, 3.5, ROOM.length / 2 - 0.14],
  rotation: [0, Math.PI, 0],
  width: 10,
  height: 5.625,
};

/* ── Camera presets ── */
export const CAMERA_PRESETS = {
  entrance: {
    position: [0, 2.5, -(ROOM.length / 2 - 3)],
    target: [0, 2, 0],
  },
  leftWall: {
    position: [-(ROOM.width / 2 - 3.5), 2.5, -10],
    target: [-(ROOM.width / 2), 2, 5],   // look along the wall toward film end
  },
  rightWall: {
    position: [(ROOM.width / 2 - 3.5), 2.5, -10],
    target: [(ROOM.width / 2), 2, 5],    // look along the wall toward film end
  },
  filmScreen: {
    position: [0, 2.5, ROOM.length / 2 - 12],
    target: [0, 2.8, ROOM.length / 2],
  },
};
