// cinemaFilms.js — the AI Cinema body of work (The Drones of Suburbia™).
// Served locally from /public/films so they always play. Single source of
// truth for the home page film strip and the full-page Cinema reel.
//
// Les Drones de la Banlieue (the Sotheby's film) leads.

export const FILMS = [
  { title: 'Les Drones de la Banlieue', sub: 'Sotheby’s · New York, 2025', src: '/films/02-les-drones-de-la-banlieue.mp4' },
  { title: 'The Drones of Suburbia', sub: '2024', src: '/films/01-the-drones-of-suburbia.mp4' },
  { title: 'The Drones of Suburbia — Roma', sub: '2025', src: '/films/03-the-drones-of-suburbia-roma.mp4' },
  { title: 'Drone Driver', sub: 'New York, 2025', src: '/films/07-drone-driver.mp4' },
  { title: 'Suburbia Was Never Out There', sub: 'New York, 2026', src: '/films/08-suburbia-was-never-out-there.mp4' },
  { title: 'Surveillance Subway', sub: 'New York, 2026', src: '/films/09-surveillance-subway.mp4' },
  { title: 'Heist', sub: 'New York, 2026', src: '/films/10-heist.mp4' },
  { title: 'Frequency Edit', sub: '2025', src: '/films/06-frequency-edit.mp4' },
];

// The four Diamond Drones films — shown only at the end of the AI Cinema reel,
// not in the Drones of Suburbia home strip.
export const DIAMOND_DRONES_FILMS = [
  { title: 'The Jewellery Box', sub: 'Diamond Drones', src: '/films/onchain/dd-jewellery-box.mp4' },
  { title: 'The Recording Studio', sub: 'Diamond Drones', src: '/films/onchain/dd-recording-studio.mp4' },
  { title: 'The Vault', sub: 'Diamond Drones', src: '/films/onchain/dd-the-vault.mp4' },
  { title: 'The Diamond Drone Lounge', sub: 'Diamond Drones', src: '/films/onchain/dd-diamond-drone-lounge.mp4' },
];
