/**
 * boudoirLayout.js — Pure data: room dimensions, staircase, artwork positions, camera presets
 *
 * The Boudoir: theatrical noir showroom for The Drone Blondes — 100 unique 1/1 AI Ink Interventions
 * Salon-style hang: art packed floor-to-ceiling across every wall surface
 * Grand staircase centrepiece, floating diamonds, dramatic spotlight beams
 */

/* ── Room Dimensions (in Three.js units ≈ metres) ── */
export const ROOM = {
  width: 16,        // x-axis
  length: 56,       // z-axis (depth — long approach to staircase)
  height: 12,       // y-axis
  wallThickness: 0.25,
};

/* ── Grand Staircase ── */
export const STAIRCASE = {
  steps: 15,
  stepHeight: 0.2,
  stepDepth: 0.42,
  baseWidth: 7,       // width at bottom
  topWidth: 5,        // width at top (slight taper)
  startZ: 4,          // Z position where first step begins
  baseTiers: 3,       // wide elliptical base platform tiers
  baseTierHeight: 0.14,
};

/* ── Showcase Drone Blondes — dynamically sized from available images ── */
function makeRoman(n) {
  const r = ['','I','II','III','IV','V','VI','VII','VIII','IX','X',
    'XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX',
    'XXI','XXII','XXIII','XXIV','XXV','XXVI','XXVII','XXVIII','XXIX','XXX',
    'XXXI','XXXII','XXXIII','XXXIV','XXXV','XXXVI','XXXVII','XXXVIII','XXXIX','XL',
    'XLI','XLII','XLIII','XLIV','XLV','XLVI','XLVII','XLVIII','XLIX','L',
    'LI','LII','LIII','LIV','LV','LVI','LVII','LVIII','LIX','LX',
    'LXI','LXII','LXIII','LXIV','LXV','LXVI','LXVII','LXVIII','LXIX','LXX',
    'LXXI','LXXII','LXXIII','LXXIV','LXXV','LXXVI','LXXVII','LXXVIII','LXXIX','LXXX',
    'LXXXI','LXXXII','LXXXIII','LXXXIV','LXXXV','LXXXVI','LXXXVII','LXXXVIII','LXXXIX','XC',
    'XCI','XCII','XCIII','XCIV','XCV','XCVI','XCVII','XCVIII','XCIX','C'];
  return r[n] || String(n);
}

// IDs matching actual files: 1-16, 18-54 (no #17)
const DRONE_BLONDE_IDS = [
  ...Array.from({ length: 16 }, (_, i) => i + 1),   // 1–16
  ...Array.from({ length: 37 }, (_, i) => i + 18),   // 18–54
];
export const SHOWCASE_MARILYNS = DRONE_BLONDE_IDS.map((id, i) => ({
  id,
  title: `Drone Blonde ${makeRoman(id)}`,
  size: i % 7 === 0 ? 'lg' : i % 3 === 0 ? 'md' : 'sm',
}));

/* ── Frame sizes — smaller for salon-style dense packing ── */
export const FRAME_SIZE = {
  sm: { w: 1.8,  h: 1.0 },   // small salon size (~16:9)
  md: { w: 2.4,  h: 1.35 },  // medium
  lg: { w: 3.0,  h: 1.7 },   // large
};

/* ── Salon-style gallery configuration ── */
const FRAME_H = 1.0;     // frame height (sm)
const FRAME_W = 1.8;     // frame width (sm)

/* Row heights — 3 tiers for salon-style hang */
const ROW_HEIGHTS = [2.2, 5.0, 8.0];

/**
 * Generate wall positions for all artworks — evenly distributed across both walls.
 * Splits artworks between left and right walls, spreads columns evenly
 * along the full wall length so they're visible from the entrance.
 */
export function generateArtworkPositions(marilyns) {
  const positions = [];
  const halfW = ROOM.width / 2;
  const wallX = halfW - ROOM.wallThickness - 0.01;

  // Usable wall length (leave space for staircase area and entrance)
  const wallStart = -(ROOM.length / 2) + 3;
  const wallEnd = STAIRCASE.startZ - 2;
  const usableLength = wallEnd - wallStart;

  // Split artworks between walls
  const leftCount = Math.ceil(marilyns.length / 2);
  const rightCount = marilyns.length - leftCount;
  const rowCount = ROW_HEIGHTS.length;

  // Place artworks on a wall, evenly spread
  function placeOnWall(artworks, isLeft) {
    const numCols = Math.ceil(artworks.length / rowCount);
    // Even spacing along full wall length
    const colSpacing = usableLength / (numCols + 1);

    let idx = 0;
    for (let col = 0; col < numCols; col++) {
      const z = wallStart + (col + 1) * colSpacing;
      for (let row = 0; row < rowCount; row++) {
        if (idx >= artworks.length) break;
        positions.push({
          ...artworks[idx],
          position: isLeft ? [-wallX, ROW_HEIGHTS[row], z] : [wallX, ROW_HEIGHTS[row], z],
          rotation: isLeft ? [0, Math.PI / 2, 0] : [0, -Math.PI / 2, 0],
          wall: isLeft ? 'left' : 'right',
        });
        idx++;
      }
    }
  }

  placeOnWall(marilyns.slice(0, leftCount), true);
  placeOnWall(marilyns.slice(leftCount), false);

  return positions;
}

/* ── Camera presets ── */
export const CAMERA_PRESETS = {
  entrance: {
    position: [0, 2.0, -(ROOM.length / 2 - 2)],
    target: [0, 5, STAIRCASE.startZ],
  },
  leftWall: {
    position: [(ROOM.width / 2 - 3), 3.0, -10],
    target: [(ROOM.width / 2), 5, 0],
  },
  rightWall: {
    position: [-(ROOM.width / 2 - 3), 3.0, -10],
    target: [-(ROOM.width / 2), 5, 0],
  },
  staircase: {
    position: [0, 2.0, STAIRCASE.startZ - 4],
    target: [0, 7, STAIRCASE.startZ + STAIRCASE.steps * STAIRCASE.stepDepth],
  },
  staircaseTop: {
    position: [0, 5.5, STAIRCASE.startZ + 2],
    target: [0, 4, -(ROOM.length / 2 - 3)],
  },
};
