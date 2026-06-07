/**
 * cinemaLayout.js — Pure data: room dimensions, seat positions, screen config, camera presets
 *
 * Luxury private screening room for the Drone Cinema premiere experience
 */

/* ── Room Dimensions (Three.js units ≈ metres) ── */
export const ROOM = {
  width: 14,       // x-axis
  depth: 14,       // z-axis (front screen to back wall)
  height: 5,       // y-axis
  wallThickness: 0.3,
  baseboardHeight: 0.12,
};

/* ── Cinema Screen ── */
export const SCREEN = {
  width: 8,
  height: 4.5,     // 16:9 aspect, fits within 5m room height
  // Positioned on front wall, centered vertically with breathing room
  position: [0, 2.7, -(ROOM.depth / 2 - ROOM.wallThickness - 0.02)],
  frameWidth: 0.18, // dark border around screen
};

/* ── Seating Layout ── */
// 3 rows, tiered upward, each row has seats spread across width
const SEATS_PER_ROW = 7;
const SEAT_WIDTH = 0.8;
const SEAT_DEPTH = 0.85;
const SEAT_HEIGHT = 0.55;
const BACKREST_HEIGHT = 0.7;
const ARMREST_WIDTH = 0.06;
const ROW_SPACING = 2.2;  // z-distance between rows
const ROW_RISE = 0.35;     // height increase per row (tiered/raked)
const SEAT_GAP = 0.12;     // gap between seats

export const SEAT_DIMS = {
  width: SEAT_WIDTH,
  depth: SEAT_DEPTH,
  height: SEAT_HEIGHT,
  backrestHeight: BACKREST_HEIGHT,
  armrestWidth: ARMREST_WIDTH,
};

export function generateSeatPositions() {
  const seats = [];
  const totalSeatWidth = SEATS_PER_ROW * SEAT_WIDTH + (SEATS_PER_ROW - 1) * SEAT_GAP;
  const startX = -totalSeatWidth / 2 + SEAT_WIDTH / 2;
  const frontRowZ = 1.5; // z position of front row (positive = toward back wall)

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < SEATS_PER_ROW; col++) {
      seats.push({
        position: [
          startX + col * (SEAT_WIDTH + SEAT_GAP),
          row * ROW_RISE,           // tiered rise
          frontRowZ + row * ROW_SPACING,
        ],
        row,
        col,
      });
    }
  }
  return seats;
}

/* ── The 4 Diamond Drones Films ── */
export const FILMS = [
  { title: "Diamond Drones Are a Girl's Best Friend — Jewellery Box",       file: '/films/dd-jewellery-box.mp4',       fileHQ: '/films/dd-jewellery-box-hq.mp4',       track: 'I',  opensea: 'https://opensea.io/assets/ethereum/0x9F0a500F315B1cCa767C91b25299914EbE320b67/1' },
  { title: "Diamond Drones Are a Girl's Best Friend — Recording Studio",    file: '/films/dd-recording-studio.mp4',    fileHQ: '/films/dd-recording-studio-hq.mp4',    track: 'II', opensea: 'https://opensea.io/assets/ethereum/0x2373A77bD873ce11aD5759E9664E8362CDDeebc8/1' },
  { title: "Diamond Drones Are a Girl's Best Friend — The Vault",           file: '/films/dd-the-vault.mp4',           fileHQ: '/films/dd-the-vault-hq.mp4',           track: 'III', opensea: 'https://opensea.io/assets/ethereum/0x32B0b71e465c6E2B6D8A04Ad8B3AD9F3449a2Fb2/1' },
  { title: "Diamond Drones Are a Girl's Best Friend — Diamond Drone Lounge", file: '/films/dd-diamond-drone-lounge.mp4', fileHQ: '/films/dd-diamond-drone-lounge-hq.mp4', track: 'IV', opensea: 'https://opensea.io/assets/ethereum/0xa94a9ad4D71ec7B4f4Ae4A24006A17DA626F4191/1' },
];

// Default film index — Jewellery Box
export const DEFAULT_FILM_INDEX = 0;

/* ── Camera Presets ── */
export const CAMERA_PRESETS = {
  center: {
    position: [0, 1.6, 1.8],       // front row center, eye height
    target: [0, 2.7, -ROOM.depth / 2],  // look at screen center
  },
  left: {
    position: [-3.5, 1.6, 1.8],    // front row left
    target: [0, 2.7, -ROOM.depth / 2],
  },
  right: {
    position: [3.5, 1.6, 1.8],     // front row right
    target: [0, 2.7, -ROOM.depth / 2],
  },
  back: {
    position: [0, 2.6, 5.5],       // back row center, higher up
    target: [0, 2.7, -ROOM.depth / 2],
  },
};

/* ── Wall Sconce Positions ── */
export const SCONCE_POSITIONS = [
  // Left wall sconces
  { position: [-(ROOM.width / 2 - 0.15), 3.2, -3], side: 'left' },
  { position: [-(ROOM.width / 2 - 0.15), 3.2, 1],  side: 'left' },
  { position: [-(ROOM.width / 2 - 0.15), 3.2, 5],  side: 'left' },
  // Right wall sconces
  { position: [(ROOM.width / 2 - 0.15), 3.2, -3],  side: 'right' },
  { position: [(ROOM.width / 2 - 0.15), 3.2, 1],   side: 'right' },
  { position: [(ROOM.width / 2 - 0.15), 3.2, 5],   side: 'right' },
];
