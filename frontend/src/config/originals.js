// originals.js — the PHYSICAL, hand-made body of work: collage on board, large
// original ink works, and paintings. Some of these pieces also exist on-chain as
// NFTs (add the marketplace URL via `nftUrl`), but that isn't the emphasis here —
// this is the analogue practice at full physical scale.
//
// This is hand-maintained (not pulled from the chain). To add a piece, drop the
// image in /public/originals/ and add an entry to the relevant era's `works`.
// Eras with an empty `works` array render as "in preparation" placeholders so the
// page is structurally complete before the photography is in.
//
//   work = { title, year, medium, size, image, sold, series, nftUrl, nftLabel }
//   image    — path under /public, e.g. '/originals/collage-01.jpg'
//   sold     — true to show a "Sold" tag
//   nftUrl   — OPTIONAL: if this physical piece also exists as an NFT, its
//              marketplace URL (OpenSea/SuperRare/etc). Adds a "View the NFT →" link.
//   nftLabel — OPTIONAL: override the link text, e.g. 'View on SuperRare'

export const ORIGINAL_ERAS = [
  {
    key: 'new-collage',
    title: 'New Collage',
    period: 'Recent · collage on board',
    blurb:
      'The current body of collage — new works built by hand on board, torn print, ink and paint layered into single surfaces.',
    works: [
      {
        title: 'Beach Watcher', series: 'Graffiti Collage No. 1', year: 2026,
        medium: 'Collage, ink and spray paint on wood', size: '21 × 29.7 cm (A4)',
        image: '/originals/BEACH WATCHER.png',
        description:
          'She sits on the beach, watching the sea. She covered herself with enough graffiti to hide in plain sight. But maybe she made it too colourful because all she could see was red.',
        details: [
          '/originals/BEACH WATCHER 1.png',
          '/originals/BEACH WATCHER 2.png',
          '/originals/BEACH WATCHER 3.png',
          '/originals/BEACH WATCHER 4.png',
          '/originals/BEACH WATCHER 5.png',
        ],
        video: '/originals/My project (265).mov',
        nftUrl: 'https://superrare.com/artwork/eth/0xCa85015C2412CAdd094ecC87c3592Ce77424b4F1/1',
        nftLabel: 'View on SuperRare',
      },
      {
        title: 'Different Planet', series: 'Graffiti Collage No. 3', year: 2026,
        medium: 'Collage, ink and spray paint on wood', size: '21 × 29.7 cm (A4)',
        image: '/originals/DIFFERENT PLANET.png',
        description:
          'Lime yellow kisses\n' +
          'the edge of her faulty memory\n' +
          'as she strides down the street.',
        nftUrl: 'https://superrare.com/artwork/eth/0xCa85015C2412CAdd094ecC87c3592Ce77424b4F1/3',
        nftLabel: 'View on SuperRare',
      },
      {
        title: 'Paris Angel', series: 'Graffiti Collage No. 2', year: 2026,
        medium: 'Collage, ink and spray paint on wood', size: '21 × 29.7 cm (A4)',
        image: '/originals/paris angel.png',
        details: [
          '/originals/PARIS1.png',
          '/originals/PARIS 2.png',
          '/originals/Paris 3.png',
          '/originals/Paris 4.png',
        ],
        description:
          'Likes bright lights, dark nights,\n' +
          'Golden stilettos trips you up\n' +
          'Ink smudgy eyes lights you up.\n\n' +
          'St Germain was never the same,\n' +
          'With this beauty in the window frame.\n\n' +
          'Graffiti heart, lips to match,\n' +
          'Fishnet swagger, your heart to snatch.\n\n' +
          'The way the Paris Angel\n' +
          'Wins hearts and looks\n' +
          'Is just downright shameful.\n\n' +
          'Sold with the original physical artwork.',
        nftUrl: 'https://superrare.com/artwork/eth/0xCa85015C2412CAdd094ecC87c3592Ce77424b4F1/2',
        nftLabel: 'View on SuperRare',
      },
      // Add a new collage:
      //   drop the image in /public/originals/ and append an entry here —
      //   { title, medium, size, image: '/originals/<slug>.png', sold?, nftUrl?, nftLabel? }
    ],
  },
  {
    key: 'collage',
    title: 'Pure Collage',
    period: 'Early works · pre-2019',
    blurb:
      'Where the practice began — the scalpel and the page. Pure analogue collage, torn print and ink, built entirely by hand. The origin of everything that followed.',
    works: [
      { title: 'Bardot Graffiti', series: 'Graffiti Collage', year: 2015, medium: 'Graffiti collage, mixed media on canvas', sold: true, image: '/originals/bardot graffiti.jpg' },
      { title: 'Pin-Up Graffiti', medium: 'Graffiti collage, mixed media on canvas', sold: true, image: '/originals/PIN-UP GRAFFITI.jpg' },
      {
        title: 'CALIFORNIA, 1976', year: 2017, medium: 'Collage, mixed media on canvas', size: '61 × 61 cm',
        sold: true, image: '/originals/BARDOT\'S WALL.jpg',
        description: 'Selected by Saatchi Art for their Street Art collection, 2017.',
      },
      { title: 'NYX Sex Kitten', medium: 'Graffiti collage, mixed media on canvas', sold: true, image: '/originals/NYX-Sex-Kitten.jpg' },
      { title: 'NYC Graffiti Wall', medium: 'Graffiti collage, mixed media on canvas', sold: true, image: '/originals/NYC Graffiti Wall.jpg' },
      { title: 'There\'s Nothing Vogue About Vogue', medium: 'Graffiti collage, mixed media on canvas', sold: true, image: '/originals/THERE\'S NOTHING VOGUE ABOUT VOGUE.jpg' },
      { title: 'Model Motel', medium: 'Graffiti collage, mixed media on canvas', sold: true, image: '/originals/Model Motel.jpg' },
      { title: 'Marc Jacobs Love', medium: 'Graffiti collage, mixed media on canvas', image: '/originals/Marc Jacobs Love.jpg' },
      { title: 'L.A. Reflections', medium: 'Graffiti collage, mixed media on canvas', sold: true, image: '/originals/L.A. Reflections.jpg' },
      { title: 'Marilyn Tattoos', medium: 'Graffiti collage, mixed media on canvas', sold: true, image: '/originals/Marilyn Tattoos.jpg' },
    ],
  },
  {
    key: 'ink',
    title: 'Original Ink Works',
    period: 'Large-scale ink on paper',
    blurb:
      'The constant of the practice at full physical scale: ink authored by hand on paper, the source language the machine was later taught to move.',
    works: [
      { title: 'Lace Arteries I', series: 'Lace Arteries', medium: 'Ink on paper', image: '/originals/Lace Arteries I.jpg' },
      { title: 'Lace Arteries II', series: 'Lace Arteries', medium: 'Ink on paper', image: '/originals/Lace Arteries II.jpg' },
      { title: 'Lace Arteries III', series: 'Lace Arteries', medium: 'Ink on paper', image: '/originals/Lace Arteries III.jpg' },
      { title: 'Lace Arteries IV', series: 'Lace Arteries', medium: 'Ink on paper', image: '/originals/Lace Arteries IV.jpg' },
      { title: 'Lace Artery VII', series: 'Lace Arteries', medium: 'Ink on paper', image: '/originals/Lace Artery VII.jpg' },
    ],
  },
  // Paintings era removed for now — re-add here when the paintings are ready
  // (e.g. the de Kooning-selected work). Shape: { key:'painting', title, period, blurb, works: [...] }
];
