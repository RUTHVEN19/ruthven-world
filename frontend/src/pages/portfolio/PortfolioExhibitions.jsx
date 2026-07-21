import { Helmet } from 'react-helmet-async';
import { c, serif, mono, caption } from './portfolioStyle';
import { projects, thumb } from '../../config/portfolioData';

// Exhibitions & Awards — the institutional record (CV). A quiet, museum-style
// list: year on the left, the exhibition/award on the right. Add new entries at
// the TOP of each array as they happen — single source of truth for this page.
//
// NOTE: only verified entries are listed. Send the full list and they go here.

const EXHIBITIONS = [
  {
    year: '2026',
    title: 'Still Here · Digital Art Exhibit',
    place: 'Gomes Freire 98, Lisboa, Portugal',
    note: 'June 2026',
    desc: '“Still Here” — the first exhibition by return() — presented digital artworks affirming that, despite displacement and erasure, the Palestinian people are still here. Featuring works from the Abu Alya collection, with 23 artists from 15 countries.',
  },
  {
    year: '2025',
    title: 'Contemporary Discoveries Auction · Sotheby’s',
    place: 'New York',
    note: 'February 2025',
    desc: 'Exhibited AI Cinema with Sotheby’s — “Miss AL Simpson’s ‘Les Drones de la Banlieue’ is a spellbinding AI video artwork that captures a flowing, dreamlike journey through the suburbs and landmarks of Paris, as seen through an otherworldly lens.”',
  },
  {
    year: '2024',
    title: 'NFT REvolution: I Am Pranksy',
    venue: 'Asprey Studio',
    place: 'Mayfair, London',
    note: '18–25 October 2024 · Dedicated space',
    desc: 'Given her own dedicated space in Pranksy’s landmark Mayfair exhibition — a special section devoted to Miss AL Simpson, shown alongside genre-defining works by Dolce & Gabbana, Burnt Toast and Goldenwolf Studios. She presented “Londinium,” a large mixed-media artwork, exhibited alongside its animated digital twin.',
  },
  {
    year: '2023',
    title: 'Do Androids Dream About Electric Sheep?',
    place: 'Kate Vass Galerie',
    note: 'Group exhibition · May 2023',
    desc: 'Presented “Metamorphoses” — her first AI long-form generative project, inspired by Ovid’s epic poem and blended with her analogue artwork from 2018. Released on OKAI (K011) as a Dutch auction on 31 May 2023; the edition sold out.',
  },
  {
    year: '2023',
    title: 'Indigo Town',
    place: 'The NFT Factory, Paris',
    note: '19 April – 13 May 2023 · Group show',
    desc: 'Exhibited the very first trilogy of Overpainted AI works, “INDIGO TOWN.” The triptych delves into metaphysical quandaries through the illusory nature of indigo — AI post-photography meets oil painting, unveiling the enigmatic aura of an urban landscape and the fine line between illusion and reality.',
  },
  {
    year: '2023',
    title: 'Proof of People · Refraction',
    place: 'New York',
    note: 'April 2023',
    desc: 'Exhibited a 3D animated collage, furthering her exploration of digital and traditional art.',
  },
  {
    year: '2022',
    title: 'Proof of People · Fabric',
    place: 'London',
    note: 'July 2022',
    desc: 'Showcased a 3D animated collage, highlighting the fusion of digital and physical art forms.',
  },
  {
    year: '2022',
    title: 'NFT Paris',
    place: 'Paris',
    note: '2022',
    desc: 'Exhibited a series of digital works.',
  },
  {
    year: '2022',
    title: 'Frieze LA',
    place: 'Los Angeles',
    note: '2022',
    desc: 'Exhibited a 3D animated collage, pushing the boundaries of digital art by incorporating motion and depth into traditional collage techniques.',
  },
  {
    year: '2021',
    title: 'Dreamverse with Metapurse',
    place: 'New York',
    note: 'November 2021',
    desc: 'Exhibited one of the Bitcoin Bitch series, a provocative collection that explores themes of power and identity in the context of cryptocurrency.',
  },
  {
    year: '2021',
    title: 'Bonhams & SuperRare Present CryptOGs: The Pioneers of NFT Art',
    place: 'London',
    note: 'June 2021 · Featured Artist',
    desc: '“CYBAROQUE BORGHESE” showcased as part of Bonhams’ first NFT auction.',
  },
  {
    year: '2021',
    title: '2121',
    place: 'Italy',
    note: 'November 2021 · Group exhibition',
    desc: 'Featured in “2121,” Italy’s first museum exhibition dedicated to crypto art.',
  },
  {
    year: '2021',
    title: 'Mothers of Ethereum',
    place: 'mothersofethereum.com',
    note: 'Founder & curator · First NFT exhibition · 2021',
    desc: 'Created and curated the first NFT exhibition of the Mothers of Ethereum — a group show celebrating the founding women cryptoartists who are mothers, aligning the organic growth of the Ethereum blockchain with the experience of motherhood, and championing creative potential and financial freedom for women on-chain.',
  },
  {
    year: '2020',
    title: 'Vancouver Biennale',
    place: 'Vancouver',
    note: 'November 2020',
    desc: 'Exhibited a series of overpainted NFTs, blending traditional techniques with digital assets to explore the intersection of physical and digital art.',
  },
  {
    year: '2020',
    title: 'Digital Art Exhibition',
    place: 'Tokyo',
    note: '2020',
    desc: 'Exhibited a work from the “Cash Slave” series.',
  },
  {
    year: '2019',
    title: 'Art Basel Miami',
    place: 'Miami',
    note: '2019 · Featured Artist',
    desc: 'Exhibited the “Cash Slave” series, a powerful collection that critiques consumerism and the commodification of art.',
  },
];

const AWARDS = [
  {
    year: '2022',
    title: 'Top 100 NFT Artists in the World',
    body: 'nft now',
  },
  {
    year: '2012',
    title: 'Scottish Food & Drink Marketing Award',
    body: 'Design — Simpsons Tea',
  },
];

const PRESS = [
  {
    year: '2025',
    outlet: 'University of Glasgow',
    title: 'Scottish Artist Anna Louise Simpson earns a place in Sotheby’s New York Contemporary Art Auction with AI-driven art',
    quote: 'Anna Louise Simpson’s AI-driven art features in Sotheby’s New York Contemporary Art Auction alongside works of Warhol, Richter & Rauschenberg.',
    url: 'https://www.gla.ac.uk/alumni/noticeboard/headline_1167809_en.html',
  },
  {
    year: '2023',
    outlet: 'Kate Vass Galerie',
    by: 'Kate Vass',
    title: '“Metamorphoses” by Miss AL Simpson — 100 Iterations',
    quote: 'Miss AL Simpson, an award-winning crypto artist, has been at the forefront of the web3 movement since 2018. Renowned for her distinctive style, she seamlessly merges digital graffiti with animated 3D historical motifs.',
    url: 'https://katevassgalerie.com/blog/metamorphoses-miss-al-simpson',
  },
  {
    year: '2022',
    outlet: 'Scottish Geographical Journal',
    title: 'All that is solid melts in the Ethereum: the brave new (art) world of NFTs',
    quote: 'A peer-reviewed academic study of the NFT art world, citing Miss AL Simpson among its leading figures.',
    url: 'https://www.tandfonline.com/doi/full/10.1080/14702029.2022.2129204',
  },
  {
    year: '2022',
    outlet: 'nft now',
    title: '20 Crypto Art OGs You Need to Know',
    url: 'https://nftnow.com/art/top-crypto-artists-ogs/',
  },
  {
    year: '2022',
    outlet: 'NFT Art Source: The Newsletter',
    title: 'Miss AL Simpson — OG CryptoArtist',
    quote: 'It seems fitting to feature artist Anna Louise Simpson this week, while the stock market crashes and crypto markets are in chaos… Miss AL Simpson’s latest work entitled “Glamour Scammers” essentially portrays a woman crying dollar signs.',
    url: 'https://nftartsource.substack.com/p/miss-al-simpson',
  },
  {
    year: '2021',
    outlet: 'Design You Trust',
    title: '“Pure Chaos”: The Superb Crypto Pop Artworks of Anna Louise Simpson',
    url: 'https://designyoutrust.com/2021/08/pure-chaos-the-superb-crypto-pop-artworks-of-anna-louise-simpson/',
  },
  {
    year: '2021',
    outlet: 'The Scotsman',
    by: 'Liv McMahon',
    title: 'Art on the blockchain: How the latest cryptoart craze is taking shape in Scotland',
    quote: 'Edinburgh cryptoartist Anna Louise Simpson is the only female cryptoartist ranked in marketplace SuperRare’s Top 20 NFT artists.',
  },
  {
    year: '2021',
    outlet: 'The Washington Post',
    title: 'Crypto artists have been building a rebellious, underground community of outsiders for years. Now they’re making a living selling NFTs.',
    by: 'Kelsey Ables',
    quote: 'Today, Simpson — whose digital collages might be described as Dada grunge meets Moulin Rouge glam — has sold the most artworks of any artist on SuperRare.',
    url: 'https://www.washingtonpost.com/entertainment/museums/beeple-crypto-art-sales-nfts/2021/05/05/ecef3452-ac0d-11eb-acd3-24b44a57093a_story.html',
  },
  {
    year: '2021',
    outlet: 'NBC News',
    title: 'How blockchain technology reached Christie’s and changed the art world along the way',
    quote: 'Anna Louise Simpson, an artist based in Scotland, was making traditional collage art when one of the main crypto art platforms contacted her to see if she was interested in tokenizing her pieces.',
    url: 'https://www.nbcnews.com/tech/tech-news/how-blockchain-technology-reached-christie-s-changed-art-world-along-n1244951',
  },
  {
    year: '2020',
    outlet: 'C.C. O’Hanlon — Writer',
    title: 'On Anna Louise Simpson, Artist — Notes for a virtual exhibition',
    quote: 'If Anna Louise Simpson’s digital collages look familiar, it’s because they mine the coincident streams of pre-pandemic consumer culture: the iconography of high street fashion brands that suffused our sub-conscious before the virus made all that redundant, and the ripped-up fragments of a post-punk sensibility that critics keep telling us is no longer relevant but which, somehow, continues to resonate, especially in these uncertain days. Her art is, at once, salvage and salve, a cut-and-paste recovery of a conflicted self — not emotional repair but psychic re-invention — replicating the ambient decay of the dour Scottish inner-city urban environment in which she lives and works, its tattered, defaced textures not so much a canvas as the absence of one, which she is compelled to repopulate with idealised and yes, sexualised figures and inanimate objects of desire/nostalgia culled from magazines — already anachronisms in a relentlessly digitalised culture — almost as if to ease the collective anxiety of an age at a loss. As artist and arbiter (and, it has to be said, style icon), Anna Louise Simpson is a guide through this age, her found art a cartography of sorts, but not always to be relied upon.',
  },
];

// Further features, interviews & institutional profiles (undated) — written
// about the artist by others, listed without a year as a compact index.
const FEATURES = [
  { outlet: 'The Museum of Contemporary Digital Art (MoCDA)', title: 'Anna Louise Simpson — artist profile', url: 'https://www.mocda.org/artists/anna-louise-simpson' },
  { outlet: 'Icons of Crypto Art', title: 'Miss AL Simpson', url: 'https://iconsofcryptoart.com/miss-al-simpson' },
  { outlet: 'aspekt', title: 'Art & NFTs: The Digital Roots', url: 'https://www.aspekt.ai/projects/art-nfts-the-digital-roots' },
  { outlet: 'Arte in Europa', title: 'Miss AL Simpson', url: 'https://www.arteineuropa.com/miss-al-simpson' },
  { outlet: 'Interview', title: 'Making a Decentralized Art Movement with Miss AL Simpson', url: 'https://www.youtube.com/watch?v=-EADIeBCV1s' },
];

export default function PortfolioExhibitions() {
  return (
    <div>
      <Helmet>
        <title>Miss AL Simpson — Exhibitions & Awards</title>
        <meta name="description" content="Exhibitions and awards of Miss AL Simpson, cryptoartist — including Sotheby’s, New York." />
      </Helmet>

      {/* ── Statement ── */}
      <section style={{ padding: '72px 0 44px', maxWidth: 900 }}>
        <div style={{ ...caption, marginBottom: 18 }}>Miss AL Simpson · the record</div>
        <h1 style={{
          fontFamily: serif, fontWeight: 400, fontSize: 'clamp(52px,11vw,150px)',
          lineHeight: 0.96, letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 28px',
        }}>
          Exhibitions<br />&amp; Awards
        </h1>
        <p style={{ fontFamily: serif, fontSize: 17, lineHeight: 1.7, color: c.faint, margin: 0, maxWidth: 760 }}>
          Miss AL Simpson has exhibited internationally in Paris, London, Los Angeles,
          New York, Tokyo and Vancouver — a record of where the work has been shown,
          recognised and written about.
        </p>
      </section>

      {/* ── Selected works strip ── */}
      <WorksStrip />

      {/* ── Exhibitions ── */}
      <Section label="Exhibitions" count={EXHIBITIONS.length}>
        {EXHIBITIONS.map((e, i) => (
          <Row key={i} year={e.year}>
            <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 'clamp(18px,2.2vw,26px)', color: c.ink, lineHeight: 1.3 }}>
              {e.title}
            </div>
            <div style={{ ...caption, marginTop: 8 }}>
              {[e.venue, e.place].filter(Boolean).join(' · ')}
            </div>
            {e.note && <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: c.ink, marginTop: 6 }}>{e.note}</div>}
            {e.desc && <p style={{ fontFamily: serif, fontSize: 15, lineHeight: 1.6, color: c.faint, margin: '12px 0 0', maxWidth: 620 }}>{e.desc}</p>}
          </Row>
        ))}
      </Section>

      {/* ── Awards & Honours ── */}
      <Section label="Awards & Honours" count={AWARDS.length}>
        {AWARDS.length === 0 ? (
          <p style={{ fontFamily: serif, fontSize: 16, color: c.faint, margin: '4px 0 0' }}>
            To be listed.
          </p>
        ) : AWARDS.map((a, i) => (
          <Row key={i} year={a.year}>
            <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 'clamp(18px,2.2vw,26px)', color: c.ink, lineHeight: 1.3 }}>
              {a.title}
            </div>
            <div style={{ ...caption, marginTop: 8 }}>
              {[a.body, a.place].filter(Boolean).join(' · ')}
            </div>
          </Row>
        ))}
      </Section>

      {/* ── Press ── */}
      <Section label="Press" count={PRESS.length}>
        {PRESS.map((p, i) => {
          const head = (
            <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 'clamp(18px,2.2vw,26px)', color: c.ink, lineHeight: 1.3 }}>
              {p.title}
            </div>
          );
          return (
            <Row key={i} year={p.year}>
              <div style={{ ...caption, marginBottom: 10 }}>
                {[p.outlet, p.by].filter(Boolean).join(' · ')}
              </div>
              {p.url ? (
                <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{head}</a>
              ) : head}
              {p.quote && (
                <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 'clamp(17px,1.8vw,21px)', lineHeight: 1.6, color: c.ink, margin: '16px 0 0', maxWidth: 640 }}>
                  “{p.quote}”
                </p>
              )}
              {p.url && (
                <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: mono, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: c.ink, marginTop: 12, display: 'inline-block', borderBottom: `1px solid ${c.line}`, textDecoration: 'none' }}>
                  Read the article →
                </a>
              )}
            </Row>
          );
        })}

        {/* Further features & profiles — written by others, undated */}
        <div style={{ borderTop: `1px solid ${c.line}`, paddingTop: 'clamp(22px,3vh,32px)', marginTop: 'clamp(18px,3vh,26px)' }}>
          <div style={{ ...caption, marginBottom: 18 }}>Further features & profiles</div>
          <div style={{ display: 'grid', gap: 14 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
                <div style={{ ...caption }}>{f.outlet}</div>
                <a href={f.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 'clamp(16px,1.7vw,20px)', color: c.ink, textDecoration: 'none', lineHeight: 1.3 }}>
                  {f.title} →
                </a>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

// A cinematic, horizontally-scrolling filmstrip of signature works — big
// portrait tiles, the title overlaid, a slow hover zoom. Meant to feel alive.
function WorksStrip() {
  const EXCLUDE = new Set(['miss-ai', 'crypto-pin-ups']);
  const picks = projects.filter(p => p.cover && !EXCLUDE.has(p.slug)).slice(0, 10);
  if (!picks.length) return null;
  return (
    <section style={{ borderTop: `1px solid ${c.line}`, padding: 'clamp(32px,5vh,52px) 0' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 22 }}>
        <div style={caption}>Selected works</div>
        <a href="/portfolio/projects" style={{ ...caption, color: c.ink, textDecoration: 'none', borderBottom: `1px solid ${c.line}` }}>All projects →</a>
      </div>
      <div style={{ display: 'flex', gap: 'clamp(12px,1.4vw,20px)', overflowX: 'auto', paddingBottom: 12, scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
        {picks.map(p => (
          <a
            key={p.slug}
            href={`/portfolio/projects/${p.slug}`}
            style={{ textDecoration: 'none', flex: '0 0 auto', scrollSnapAlign: 'start' }}
            onMouseEnter={e => { const im = e.currentTarget.querySelector('img'); if (im) im.style.transform = 'scale(1.07)'; }}
            onMouseLeave={e => { const im = e.currentTarget.querySelector('img'); if (im) im.style.transform = 'scale(1)'; }}
          >
            <div style={{ position: 'relative', width: 'clamp(230px,27vw,320px)', aspectRatio: '4 / 5', overflow: 'hidden', background: '#ece9e2' }}>
              <img src={thumb(p.cover, 640)} alt={p.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .7s cubic-bezier(.2,.7,.2,1)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,8,12,0.78) 0%, rgba(10,8,12,0.12) 42%, rgba(10,8,12,0) 70%)' }} />
              <div style={{ position: 'absolute', left: 18, right: 18, bottom: 16 }}>
                <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 'clamp(20px,2vw,26px)', color: '#fff', lineHeight: 1.05 }}>{p.name}</div>
                <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.82)', marginTop: 7 }}>
                  {p.count ? `${p.count.toLocaleString()} works` : (p.medium || '')}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function Section({ label, count, children }) {
  return (
    <section style={{ borderTop: `1px solid ${c.line}`, padding: 'clamp(40px,7vh,72px) 0' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 30 }}>
        <h2 style={{ fontFamily: serif, fontWeight: 400, margin: 0, fontSize: 'clamp(26px,4vw,44px)', color: c.ink }}>{label}</h2>
      </div>
      <div>{children}</div>
    </section>
  );
}

function Row({ year, children }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '110px 1fr', gap: 'clamp(16px,4vw,56px)',
      alignItems: 'baseline', padding: 'clamp(18px,3vh,26px) 0', borderTop: `1px solid ${c.line}`,
    }}>
      <div style={{ fontFamily: serif, fontSize: 'clamp(20px,2.4vw,32px)', color: c.ink }}>{year}</div>
      <div>{children}</div>
    </div>
  );
}
