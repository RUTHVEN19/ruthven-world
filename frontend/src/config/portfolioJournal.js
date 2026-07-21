// portfolioJournal.js — the studio's OWN feed. Single source of truth for the
// /portfolio/feed page.
//
// This replaces the old third-party embeds (Instagram / TikTok / X blockquotes).
// Every card is rendered natively — fast, on-brand, no external scripts that can
// break, rate-limit, or drag the studio look off-key. You own every word.
//
// HOW TO ADD AN ENTRY: paste a new object at the TOP of the array (newest first).
//
//   date   — display string, e.g. 'February 2025'
//   title  — the headline
//   body   — one or two sentences (plain text)
//   image  — OPTIONAL. Drop the file in /public/journal/ and reference it as
//            '/journal/your-file.jpg'. Omit it for a clean text-only card.
//   link   — OPTIONAL outbound url (the original post, an article, a collection)
//   linkLabel — OPTIONAL label for that link, e.g. 'View on X' (defaults to 'Read more')
//
// Leave the array empty and the page shows a tasteful "journal coming soon" state
// with the follow links — so it never looks broken.

export const JOURNAL = [
  {
    date: 'February 2025',
    title: 'Sotheby’s, New York',
    body: '“Les Drones de la Banlieue” exhibited and sold at Sotheby’s, New York — shown alongside Warhol, Rauschenberg, Richter and de Kooning.',
    image: '/journal/sothebys-ny.jpg',
    link: 'https://x.com/missalsimpson/status/1892182675311526307',
    linkLabel: 'View on X',
  },
  {
    date: 'October 2024',
    title: 'I Am Pranksy — Mayfair',
    body: 'Given my own dedicated space in Pranksy’s landmark Mayfair exhibition at Asprey Studio, presenting “Londinium,” a large mixed-media work, alongside its animated digital twin.',
    image: '/journal/londinium.jpg',
  },
  {
    date: '2024',
    title: 'In Search of Hope',
    body: 'A new GAN and meta-collage work — the machine and the hand pulling against one another.',
    image: '/journal/in-search-of-hope.jpg',
    link: 'https://x.com/missalsimpson/status/2069698420399309031',
    linkLabel: 'View on X',
  },
  {
    date: 'May 2022',
    title: 'Queen of Poetry — collected',
    body: '“Queen of Poetry” found her collector.',
    link: 'https://x.com/missalsimpson/status/1525533545061572608',
    linkLabel: 'View on X',
  },
  {
    date: 'February 2022',
    title: 'Cash Slave L.A. at Frieze LA',
    body: '“Cash Slave L.A.” shown during Frieze Los Angeles.',
    link: 'https://x.com/missalsimpson/status/1492227793094164484',
    linkLabel: 'View on X',
  },
  {
    date: 'January 2022',
    title: 'Paper Dolls at NFT Paris',
    body: 'The Paper Dolls series travelled to NFT Paris.',
    link: 'https://x.com/missalsimpson/status/1483780265793269770',
    linkLabel: 'View on X',
  },
  {
    date: 'August 2021',
    title: 'First female artist for nftboxes',
    body: 'Selected as the first female artist to feature in nftboxes.',
    link: 'https://x.com/missalsimpson/status/1427241758560296960',
    linkLabel: 'View on X',
  },
];
