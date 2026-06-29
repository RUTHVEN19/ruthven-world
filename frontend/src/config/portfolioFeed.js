// Live social feed — single source of truth for the /portfolio/feed page.
//
// HOW TO ADD A POST: open the post on Instagram, TikTok or X, copy its public
// URL, and paste it in here as a new line at the TOP (newest first). The page
// renders the REAL, live embed — current image/video, likes and caption — using
// each platform's official embed. No API keys, no monthly fee.
//
//   type: 'instagram' | 'tiktok' | 'x'
//   url:  the public permalink of the post
//
// Examples of the URL shapes each platform gives you:
//   instagram → https://www.instagram.com/p/ABC123/   (or /reel/ABC123/)
//   tiktok    → https://www.tiktok.com/@missalsimpson/video/1234567890123456789
//   x         → https://x.com/missalsimpson/status/1234567890123456789
//
// Leave the array empty and the page shows a tasteful "feed coming soon" state
// with the follow links — so it never looks broken.

export const FEED = [
  // Seeded with verified @missalsimpson milestone posts (each confirmed live via
  // X's oEmbed). Paste Instagram / TikTok links above these to add the latest.
  { type: 'x', url: 'https://x.com/missalsimpson/status/1892182675311526307' }, // Sotheby's NY — "Les Drones de la Banlieue" alongside Warhol, Rauschenberg, Richter, de Kooning
  { type: 'x', url: 'https://x.com/missalsimpson/status/2069698420399309031' }, // "In Search of Hope" — GAN & meta-collage
  { type: 'x', url: 'https://x.com/missalsimpson/status/1525533545061572608' }, // "Queen of Poetry" → collector
  { type: 'x', url: 'https://x.com/missalsimpson/status/1492227793094164484' }, // "Cash Slave L.A." at Frieze LA
  { type: 'x', url: 'https://x.com/missalsimpson/status/1483780265793269770' }, // Paper Dolls at NFT Paris
  { type: 'x', url: 'https://x.com/missalsimpson/status/1427241758560296960' }, // First female artist for nftboxes
];
