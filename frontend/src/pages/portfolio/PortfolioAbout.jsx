import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { totals, projects, years, thumb, resolveImg } from '../../config/portfolioData';
import { c, serif, mono, caption, SOCIALS } from './portfolioStyle';

// Drop a portrait photo at frontend/public/about-portrait.jpg and it appears
// beside the heading. Until it exists the slot hides itself (onError) so the
// page never shows a broken image.
const PORTRAIT = '/about-portrait.jpg';

// About — the artist statement, the numbers, and the press. Big institutional
// heading, then a lead, the bio, a stat line, and a wall of press cuttings.
//
// CATALOGUE — auction catalogue notes about the work (Sotheby's, Bonhams). These are
// NOT press: genuine press (Washington Post, NBC, The Scotsman, journals, critics) all
// lives in PortfolioExhibitions.jsx's own PRESS array. Add verified catalogue notes at
// the TOP. Optional `art` shows the work beside the quote; optional `href` links out.
const PRESS = [
  {
    quote: 'Miss AL Simpson’s “Les Drones de la Banlieue” is a spellbinding AI video artwork that captures a flowing, dreamlike journey through the suburbs and landmarks of Paris, as seen through an otherworldly lens. The piece fuses the tactile textures of her signature Ink Interventions — imagined by AI from Simpson’s gestural mark-making and intricate hand-drawn compositions — with ethereal visuals of tulle-like curtains, suburban shadows, and the sleek, gliding presence of drones. Intimate moments unfold as women navigate this fluid world in a delicate interplay with their drones: one crouches beside a gargoyle on Notre Dame before soaring into the skies; another walks two drones as mechanical guard dogs through the gritty streets of Paris. Their interactions are layered with both companionship and ambiguity, inviting the viewer to question the drones’ role as protectors, extensions, or silent witnesses. The artwork’s flowing perspective, shifting seamlessly through iconic Parisian vistas and urban obscurities, suggests a voyeuristic gaze — perhaps that of a drone itself. This perspective casts an unsettling shadow over the piece, blurring the lines between observation and surveillance, intimacy and intrusion. Accompanied by a haunting French soundtrack, “Les Drones de la Banlieue” delves into themes of human-machine relationships, urban isolation, and the evolving nature of connection. Simpson’s innovative collaboration with AI brings these elements to life in a mesmerizing, multilayered narrative that challenges viewers to reconsider what it means to see, to be seen, and to coexist in a world shaped by technology.',
    outlet: 'Sotheby’s — Catalogue Note',
    detail: 'Les Drones de la Banlieue · Contemporary Discoveries, New York, 2025',
    art: { image: 'https://arweave.net/dkb2m6lP_xH83pTIpsY46jHnDtKTdBpR3ihOu6CiHjo', video: 'https://arweave.net/vbsiFmkny_Kkja0mZ7u0d7vUi3jPkebRSxjtOA_aWWc', title: 'Les Drones de la Banlieue', year: 2025 },
  },
  {
    quote: 'There may not be a better art historical corollary for the emergence of Crypto Art than the aesthetic drama of the Baroque that emerged in earnest at the turn of the 17th Century. Characterised by novel, irregular forms and exaggerated ornamentation, the movement transcended music, design and the visual arts and marked one of the most dramatic shifts in artistic style since the Renaissance. Inspired by her travels to Rome, silver screen pictures Roman Holiday and Cleopatra, and her visit to the Villa Borghese, Miss AL Simpson’s CYBAROQUE BORGHESE embodies the punkish character of contemporary Crypto Art, stitching together a dynamic work that animates a collaged spectacle of Italian classicism. Evoking the brash canvases of Basquiat, Rauschenberg, and Kippenberger, the digital passages of CYBAROQUE BORGHESE engage in a litany of dialogues with Classical and Contemporary motifs. In this digital avant-garde, Miss AL Simpson has become one of the chief protagonists of this new movement, compressing history and styles to produce some of the most dramatic and compelling works to be tokenized to date.',
    outlet: 'Bonhams & SuperRare — Footnotes',
    detail: 'CYBAROQUE BORGHESE · CryptOGs: The Pioneers of NFT Art, London, 2021',
    art: { image: 'https://nft2-cdn.alchemy.com/eth-mainnet/7a70a1006b508788e96793a3d6419cd7', title: 'CYBAROQUE BORGHESE', year: 2021 },
  },
];

// A few of her earliest imaged works, threaded through the bio as period stills.
// Skip any piece already shown beside a quote so nothing repeats on the page.
const quotedTitles = new Set(
  ['Modern Love', 'The Self Isolators', ...PRESS.map(p => p.art && p.art.title)].filter(Boolean),
);
const earlyWorks = years
  .slice(-2)                                            // the two earliest years on record
  .flatMap(y => y.works)
  .filter(w => w.image && !quotedTitles.has(w.title))
  .sort((a, b) => (a.mintedAt || 0) - (b.mintedAt || 0)) // oldest first
  .slice(0, 3);

export default function PortfolioAbout() {
  return (
    <div style={{ paddingBottom: 100 }}>
      <Helmet>
        <title>Miss AL Simpson — About</title>
        <meta name="description" content="About Miss AL Simpson — Scottish cryptoartist working at the threshold of collage, ink and machine intelligence. Exhibited at Sotheby’s, New York." />
        {/* Structured data — lets Google & AI search resolve who she is. */}
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: 'Miss AL Simpson',
          alternateName: 'Anna Louise Simpson',
          jobTitle: 'Artist',
          description: 'Award-winning Scottish cryptoartist working at the threshold of collage, ink and machine intelligence.',
          nationality: 'Scottish',
          url: 'https://missalsimpson.com',
          image: 'https://missalsimpson.com/about-portrait.jpg',
          sameAs: [
            'https://instagram.com/annalouisesimpson',
            'https://x.com/missalsimpson',
            'https://www.tiktok.com/@missalsimpson',
            'https://superrare.com/missalsimpson',
          ],
        })}</script>
      </Helmet>

      {/* ── Giant heading + portrait ── */}
      <Hero />

      {/* ── Artworks band ── */}
      <WorksBand />

      {/* ── Stat line ── */}
      <section style={{ borderTop: `1px solid ${c.line}`, marginTop: 'clamp(40px,7vh,72px)', padding: 'clamp(32px,5vh,52px) 0', display: 'flex', gap: 'clamp(32px,6vw,80px)', flexWrap: 'wrap' }}>
        <Stat n={totals.works.toLocaleString()} label="1/1 works" />
        <Stat n={totals.projects} label="projects / worlds" />
        <Stat n="2015" label="full-time artist since" />
        <Stat n="2019" label="on-chain since" />
        <Stat n="Sotheby’s" label="exhibited & sold, NY" />
      </section>

      {/* ── Bio, interspersed with early works ── */}
      <section style={{ borderTop: `1px solid ${c.line}`, padding: 'clamp(40px,7vh,72px) 0', maxWidth: 760 }}>
        <div style={{ fontFamily: serif, fontSize: 17, lineHeight: 1.85, color: '#2a2a2a' }}>
          <p style={{ margin: '0 0 30px' }}>
            Miss AL Simpson — born Anna Louise Simpson — is an award-winning Scottish contemporary artist
            and founder based in Edinburgh, and one of the original (OG) cryptoartists. Her eye was formed early and
            intuitively: drawing from fashion magazines, vintage cinema and the faded glamour of the silver
            screen, she built a practice rooted in collage long before it ever moved on-chain.
          </p>

          <BioImage work={earlyWorks[0]} />

          <p style={{ margin: '0 0 30px' }}>
            She has worked full-time as an artist since 2015, beginning in collage — layered, hand-built
            compositions made from found materials, billposters and magazines. In 2019 she carried that
            language onto the blockchain, among the very first to do so, debuting on SuperRare and minting
            across KnownOrigin, Rarible, Manifold and OpenSea to become one of the platform’s pioneering
            and most-collected names. To date she has built a body of {totals.works.toLocaleString()}{' '}
            singular works and {totals.projects} larger projects and worlds.
          </p>
          <p style={{ margin: '0 0 30px' }}>
            Her aesthetic fuses a digital-graffiti sensibility — in the lineage of Basquiat, Rauschenberg
            and Kippenberger — with historical and classical motifs: a Baroque drama compressed into a
            contemporary, pixel-driven language. Across the work the algorithm is treated not as a tool but
            as a collaborator and a subject — the muse, the machine, the surveilled feminine.
          </p>

          <BioImage work={earlyWorks[1]} />

          <p style={{ margin: '0 0 30px' }}>
            At the centre of her thinking is the <i>posthuman feminine gaze</i> — a perspective that
            interrogates the interplay between human agency, machine intelligence and gendered
            representation, reimagining femininity beyond anthropocentric limits and reclaiming agency for
            women in digital space. Her work returns, again and again, to surveillance, urban isolation,
            and the autonomy of the women who move through her worlds.
          </p>

          <BioImage work={earlyWorks[2]} />

          <p style={{ margin: 0 }}>
            She works between the digital mint and the physical surface — intervening on AI-generated
            imagery by hand in ink and collage before returning it to the chain — and extends this hybrid
            method into AI cinema, where generative motion meets traditional narrative framing. Recurring
            worlds and series include Diamond Drones™, The Drones of Suburbia™, <i>Les Drones de la
            Banlieue</i>, Metamorphoses, Cash Slave, Bitcoin Bitch, CYBAROQUE BORGHESE and the Porcelain
            Android. Her work has been exhibited and sold at Sotheby’s, New York, and Bonhams, London —
            the latter in <i>CryptOGs: The Pioneers of NFT Art</i>.
          </p>
          <p style={{ margin: '30px 0 0' }}>
            Today the practice operates through <b>Miss AL Simpson Ltd</b>, the holding company that now
            stewards the entirety of her catalogue — every NFT, the intellectual property behind each
            world, and the brands they have grown into. Conceived as a long-term steward rather than a
            studio, the company exists to protect, license and grow the work as a single, evolving body —
            from Diamond Drones™ to the Porcelain Android — across collectors, exhibitions and the physical
            editions that extend it beyond the chain.
          </p>
        </div>
      </section>

      {/* ── Featured quote — Jason Bailey / Artnome ── */}
      <section style={{ borderTop: `1px solid ${c.line}`, padding: 'clamp(40px,7vh,72px) 0' }}>
        <div style={{ ...caption, marginBottom: 28 }}>On the work</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'clamp(12px,1.6vw,20px)', maxWidth: 880, marginBottom: 'clamp(24px,3.4vh,34px)' }}>
          <QuoteArt work={{ image: '/MODERNLOVE.png', title: 'Modern Love', year: 2019 }} />
          <QuoteArt work={{ image: 'https://nft2-cdn.alchemy.com/eth-mainnet/0b8652d640c48c111da3f684712741f4', title: 'The Self Isolators', year: 2020 }} />
        </div>
        <blockquote style={{ margin: 0, maxWidth: 880 }}>
          <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 'clamp(20px,2.6vw,32px)', lineHeight: 1.5, color: c.ink, margin: '0 0 26px' }}>
            “When I added Miss AL Simpson’s <i>Modern Love</i> to my collection about one year ago I wrote that it ‘reminds me of one of Richard Prince’s Nurses getting enveloped by a Clyfford Still.’ My feelings haven’t changed. There is a long history of male artists anonymizing women through abstraction, but Miss AL Simpson’s work is refreshing because it does this without objectification. For me, the mysterious women portrayed in works like <i>Modern Love</i> and <i>The Self Isolators</i> have deep and complex inner lives. They are to be thought about, to be reckoned with, and not just ogled as one might with, say, Willem de Kooning’s hypersexualized <i>Women I</i>. As with most artists, I think Miss AL Simpson’s strongest work ends with a question mark instead of a period — and these two works definitely fit that description for me.”
          </p>
          <footer style={caption}>Jason Bailey — Artnome</footer>
        </blockquote>
      </section>

      {/* ── Catalogue notes — auction house writing about the work (NOT press;
             genuine press cuttings live in the Exhibitions page's PRESS index) ── */}
      <section style={{ borderTop: `1px solid ${c.line}`, padding: 'clamp(40px,7vh,72px) 0' }}>
        <div style={{ ...caption, marginBottom: 36 }}>Catalogue notes</div>
        <div style={{ display: 'grid', gap: 'clamp(38px,6vh,68px)' }}>
          {PRESS.map((p, i) => <Cutting key={i} p={p} />)}
        </div>
      </section>

      {/* ── Socials wall ── */}
      <SocialWall />

      {/* ── Contact ── */}
      <section style={{ borderTop: `1px solid ${c.line}`, paddingTop: 28 }}>
        <div style={caption}>Contact</div>
        <p style={{ fontFamily: mono, fontSize: 13, color: c.ink, marginTop: 10, lineHeight: 1.9 }}>
          studio@missalsimpson.com<br />
          <a href="https://superrare.com/missalsimpson" target="_blank" rel="noopener noreferrer" style={{ color: c.ink }}>superrare.com/missalsimpson</a>
        </p>
      </section>
    </div>
  );
}

// Editorial hero — giant ABOUT heading + lead on the left, a portrait of the
// artist on the right. The portrait drops away (and the text goes full-width)
// if the photo file isn't present yet.
function Hero() {
  const [hasPortrait, setHasPortrait] = useState(true);
  return (
    <section
      style={{
        padding: '72px 0 8px',
        display: 'grid',
        gap: 'clamp(28px,5vw,72px)',
        gridTemplateColumns: hasPortrait ? 'minmax(0,1.4fr) minmax(240px,1fr)' : '1fr',
        alignItems: 'center',
      }}
    >
      <div>
        <h1 style={{
          fontFamily: serif, fontWeight: 400, fontSize: 'clamp(52px,11vw,150px)',
          lineHeight: 0.96, letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 36px',
        }}>
          About
        </h1>
        <p style={{ fontFamily: serif, fontSize: 'clamp(20px,2.4vw,30px)', lineHeight: 1.5, color: c.ink, margin: 0, maxWidth: 920 }}>
          One of the original cryptoartists. An award-winning Scottish artist and founder working where collage,
          ink and machine intelligence collide — where the algorithm is never just a tool, but a
          collaborator, a subject, a muse.
        </p>
      </div>
      {hasPortrait && (
        <figure style={{ margin: 0 }}>
          <div style={{ aspectRatio: '1 / 1', overflow: 'hidden', background: '#ece9e2' }}>
            <img
              src={PORTRAIT}
              alt="Miss AL Simpson"
              onError={() => setHasPortrait(false)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
            />
          </div>
          <figcaption style={{ ...caption, marginTop: 12 }}>Miss AL Simpson, in the studio · Edinburgh</figcaption>
        </figure>
      )}
    </section>
  );
}

// A full-width still threaded into the bio, with a quiet caption.
function BioImage({ work }) {
  if (!work || !work.image) return null;
  return (
    <figure style={{ margin: '8px 0 30px' }}>
      <img
        src={thumb(work.image, 900)}
        alt={work.title}
        loading="lazy"
        style={{ width: '100%', height: 'auto', display: 'block', background: '#ece9e2' }}
      />
      <figcaption style={{ ...caption, marginTop: 10 }}>
        {work.title}{work.year ? ` · ${work.year}` : ''}
      </figcaption>
    </figure>
  );
}

// The artwork a quote is discussing, shown beside it. Smaller than a BioImage,
// square-cropped, with a quiet caption naming the piece. Moving works (a `video`
// url) play in place, looping and muted, with the still as poster.
function QuoteArt({ work }) {
  const vidRef = useRef(null);
  // React doesn't reliably set the `muted` DOM property, which makes browsers
  // block autoplay. Set it imperatively, then kick off playback once in view.
  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;
    v.muted = true;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play?.().catch(() => {});
      else v.pause?.();
    }, { rootMargin: '300px' });
    io.observe(v);
    return () => io.disconnect();
  }, [work && work.video]);

  if (!work || (!work.image && !work.video)) return null;
  const fill = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' };
  return (
    <figure style={{ margin: 0 }}>
      <div style={{ aspectRatio: '1 / 1', overflow: 'hidden', background: '#ece9e2' }}>
        {work.video ? (
          <video
            ref={vidRef}
            src={resolveImg(work.video)}
            poster={work.image ? thumb(work.image, 700) : undefined}
            autoPlay muted loop playsInline preload="auto"
            style={fill}
          />
        ) : (
          <img src={thumb(work.image, 700)} alt={work.title} loading="lazy" style={fill} />
        )}
      </div>
      <figcaption style={{ ...caption, marginTop: 10 }}>
        {work.title}{work.year ? ` · ${work.year}` : ''}
      </figcaption>
    </figure>
  );
}

// Socials wall — a grid of platform tiles. Only links with a real href appear,
// so it grows as handles are added to SOCIALS. Each tile inverts on hover.
function SocialWall() {
  const live = SOCIALS.filter(s => s.href);
  if (!live.length) return null;
  return (
    <section style={{ borderTop: `1px solid ${c.line}`, padding: 'clamp(40px,7vh,72px) 0' }}>
      <div style={{ ...caption, marginBottom: 28 }}>Follow & Collect</div>
      <div style={{ display: 'grid', gap: 'clamp(10px,1.4vw,16px)', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        {live.map(s => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: 'none', color: c.ink, border: `1px solid ${c.line}`,
              padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 8,
              transition: 'background .2s, color .2s, transform .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = c.ink; e.currentTarget.style.color = c.paper; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = c.ink; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <span style={{ fontFamily: serif, fontSize: 20 }}>{s.label}</span>
            <span style={{ fontFamily: mono, fontSize: 12, opacity: 0.65 }}>{s.handle}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

// A bright band of signature works to lift the page.
function WorksBand() {
  const picks = projects.filter(p => p.cover).slice(0, 6);
  if (!picks.length) return null;
  return (
    <section style={{ marginTop: 'clamp(28px,5vh,48px)' }}>
      <div style={{ display: 'grid', gap: 'clamp(8px,1.2vw,14px)', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
        {picks.map(p => (
          <a key={p.slug} href={`/portfolio/projects/${p.slug}`} style={{ textDecoration: 'none' }} title={p.name}>
            <div style={{ aspectRatio: '1 / 1', overflow: 'hidden', background: '#ece9e2' }}>
              <img src={thumb(p.cover, 420)} alt={p.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function Stat({ n, label }) {
  return (
    <div>
      <div style={{ fontFamily: serif, fontSize: 'clamp(28px,3.4vw,42px)', lineHeight: 1, color: c.ink }}>{n}</div>
      <div style={{ ...caption, marginTop: 8 }}>{label}</div>
    </div>
  );
}

function Cutting({ p }) {
  const inner = (
    <figure style={{ margin: 0, maxWidth: 880, borderTop: `1px solid ${c.line}`, paddingTop: 'clamp(24px,3.4vh,34px)' }}>
      {p.art && (
        <div style={{ marginBottom: 'clamp(20px,3vh,30px)', maxWidth: 360 }}>
          <QuoteArt work={p.art} />
        </div>
      )}
      {p.image ? (
        <img src={p.image} alt={p.outlet} loading="lazy" style={{ width: '100%', height: 'auto', display: 'block' }} />
      ) : (
        <blockquote style={{ margin: 0 }}>
          <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 'clamp(18px,1.8vw,23px)', lineHeight: 1.6, color: c.ink, margin: 0 }}>
            “{p.quote}”
          </p>
        </blockquote>
      )}
      <figcaption style={{ marginTop: 22 }}>
        <div style={{ fontFamily: serif, fontSize: 17, color: c.ink }}>{p.outlet}</div>
        {p.detail && <div style={{ ...caption, marginTop: 6 }}>{p.detail}</div>}
      </figcaption>
    </figure>
  );
  return p.href
    ? <a href={p.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>{inner}</a>
    : inner;
}
