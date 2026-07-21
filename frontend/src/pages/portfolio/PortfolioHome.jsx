import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { totals, inkInterventions, thumb } from '../../config/portfolioData';
import { usePortfolio } from './PortfolioContext';
import { serif, mono, body } from './portfolioStyle';

// Dark, restrained, high-end. One moving thing (the hero film), then quiet:
// the name carries the top, a single line of provenance, the Sotheby's quote,
// one row of selected works, and one way into the full catalogue. Everything
// else lives behind the nav (AI Cinema / Worlds / Works).
const ink = '#ffffff';
const faint = 'rgba(255,255,255,0.7)';
const line = 'rgba(255,255,255,0.14)';
const cap = { fontFamily: mono, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: faint };

// The Sotheby's lot page for Les Drones de la Banlieue. Paste the exact URL here
// and the "View on Sotheby's" link below activates.
const SOTHEBYS_URL = 'https://www.sothebys.com/en/buy/auction/2025/contemporary-discoveries-2/les-drones-de-la-banlieue';

export default function PortfolioHome() {
  const { openWork } = usePortfolio();
  return (
    <div style={{ color: ink }}>
      <Helmet>
        <title>Miss AL Simpson — Scottish Cryptoartist</title>
        <meta name="description" content="The official site of Miss AL Simpson, award-winning Scottish cryptoartist. Films, 1/1 works and built worlds at the threshold of collage, ink and machine intelligence — exhibited at Sotheby’s, New York." />
      </Helmet>
      {/* ── Hero film, full-bleed — the name carries the page, set over the film ── */}
      <section style={{
        position: 'relative', width: '100vw', marginLeft: 'calc(50% - 50vw)',
        height: 'calc(100vh - 70px)', minHeight: 460, background: '#000', overflow: 'hidden',
      }}>
        <video
          src="/films/onchain/dd-the-vault.mp4"
          autoPlay loop muted playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Scrim so the name stays legible over any frame of the film */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 45%)',
          pointerEvents: 'none',
        }} />
        <h1 style={{
          position: 'absolute', left: 'clamp(20px,5vw,56px)', bottom: 'clamp(28px,6vh,64px)', margin: 0,
          fontFamily: serif, fontWeight: 300, fontSize: 'clamp(52px,12vw,176px)',
          lineHeight: 0.98, letterSpacing: 3, textTransform: 'uppercase', color: ink,
          textShadow: '0 2px 40px rgba(0,0,0,0.5)',
        }}>
          Miss AL<br />Simpson
        </h1>
      </section>

      {/* ── Sotheby's quote, alongside the Les Drones film (film weighted larger) ── */}
      <section style={{ borderTop: `1px solid ${line}`, marginTop: 'clamp(56px,10vh,120px)', padding: 'clamp(48px,8vh,88px) 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(28px,4vw,56px)', alignItems: 'center' }}>
          <blockquote style={{ margin: 0, flex: '1 1 320px', minWidth: 0 }}>
            <a
              href={SOTHEBYS_URL || undefined}
              target={SOTHEBYS_URL ? '_blank' : undefined}
              rel={SOTHEBYS_URL ? 'noopener noreferrer' : undefined}
              style={{ display: 'block', color: 'inherit', textDecoration: 'none', cursor: SOTHEBYS_URL ? 'pointer' : 'default' }}
            >
              <div style={{
                fontFamily: serif, fontSize: 'clamp(34px,5vw,64px)', fontWeight: 400,
                letterSpacing: -1, lineHeight: 1, marginBottom: 22, color: ink,
              }}>
                Sotheby’s
              </div>
              <p style={{ fontFamily: body, fontStyle: 'italic', fontSize: 'clamp(20px,2.4vw,30px)', lineHeight: 1.4, margin: '0 0 22px', color: ink }}>
                “…her signature Ink Interventions — imagined by AI from Simpson’s gestural mark-making and intricate hand-drawn compositions — with ethereal visuals of tulle-like curtains, suburban shadows, and the sleek, gliding presence of drones.”
              </p>
              <footer style={cap}>
                <i>Les Drones de la Banlieue</i>, Contemporary Discoveries, New York, 2025{SOTHEBYS_URL ? ' →' : ''}
              </footer>
            </a>
          </blockquote>
          <div style={{ position: 'relative', overflow: 'hidden', background: '#000', aspectRatio: '3 / 4', flex: '2 1 520px', minWidth: 0 }}>
            <video
              src="/films/02-les-drones-de-la-banlieue.mp4"
              autoPlay loop muted playsInline preload="metadata"
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          </div>
        </div>
      </section>

      {/* ── A moving selection of ink interventions — breaks up the text ── */}
      <section style={{ borderTop: `1px solid ${line}`, padding: 'clamp(40px,7vh,72px) 0' }}>
        <InkMarquee works={inkInterventions.slice(0, 24)} onPick={openWork} />
      </section>

      {/* ── Artnome quote, alongside Modern Love ── */}
      <section style={{ borderTop: `1px solid ${line}`, padding: 'clamp(48px,8vh,88px) 0' }}>
        <div style={{ display: 'grid', gap: 'clamp(28px,4vw,56px)', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', alignItems: 'center' }}>
          <blockquote style={{ margin: 0 }}>
            <p style={{ fontFamily: body, fontStyle: 'italic', fontSize: 'clamp(22px,2.8vw,36px)', lineHeight: 1.36, margin: '0 0 22px', color: ink }}>
              “When I added Miss AL Simpson’s <i>Modern Love</i> to my collection about one year ago, I wrote that it reminds me of one of Richard Prince’s Nurses getting enveloped by a Clyfford Still.”
            </p>
            <footer style={cap}>
              Jason Bailey — Artnome
            </footer>
          </blockquote>
          <figure style={{ margin: 0 }}>
            <div style={{ overflow: 'hidden', background: '#0c0d12' }}>
              <img
                src="/MODERNLOVE.png" alt="Modern Love by Miss AL Simpson"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
            <figcaption style={{ ...cap, marginTop: 12 }}>
              <i>Modern Love</i> · Collected by Artnome
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── Ink Interventions — every hand-drawn-over work ── */}
      <section style={{ borderTop: `1px solid ${line}`, padding: 'clamp(48px,8vh,88px) 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
          <h2 style={{
            fontFamily: serif, fontWeight: 400, margin: 0, lineHeight: 0.9,
            fontSize: 'clamp(40px,8vw,104px)', letterSpacing: 1, textTransform: 'uppercase', color: ink,
          }}>
            Ink Interventions
          </h2>
          <div style={cap}>{inkInterventions.length} works</div>
        </div>
        <p style={{ fontFamily: body, fontSize: 'clamp(15px,1.6vw,18px)', lineHeight: 1.6, color: faint, margin: '0 0 36px', maxWidth: 720 }}>
          My signature process. I’ve trained the machine on my own early ink works — taught it to “see” the ink — and it generates an output entirely from that language. Then I intervene by hand, drawing back into it in ink: the machine’s output reclaimed by the artist’s mark.
        </p>
        <div style={{ columnWidth: 200, columnGap: 'clamp(12px,1.6vw,22px)' }}>
          {inkInterventions.map(w => <InkTile key={w.id} w={w} onClick={() => openWork(w)} />)}
        </div>
      </section>

      {/* ── Into the full catalogue ── */}
      <section style={{ borderTop: `1px solid ${line}`, padding: 'clamp(56px,10vh,120px) 0', textAlign: 'center' }}>
        <Link to="/portfolio/works" style={{
          fontFamily: mono, fontSize: 12, letterSpacing: 3, textTransform: 'uppercase',
          color: ink, textDecoration: 'none', borderBottom: `1px solid ${ink}`, paddingBottom: 5,
        }}>
          Enter the catalogue · {totals.works.toLocaleString()} works →
        </Link>
      </section>
    </div>
  );
}

function InkTile({ w, onClick }) {
  return (
    <figure
      onClick={onClick}
      style={{ margin: '0 0 clamp(12px,1.6vw,22px)', cursor: 'pointer', breakInside: 'avoid' }}
    >
      <div style={{ overflow: 'hidden', background: '#0c0d12' }}>
        <img
          src={thumb(w.thumbnail || w.image, 420)} alt={w.title} loading="lazy"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>
    </figure>
  );
}

// An auto-scrolling horizontal strip of ink interventions — one moving thing
// that breaks up the text and previews the technique before the full grid below.
function InkMarquee({ works, onPick }) {
  if (!works.length) return null;
  const loop = [...works, ...works]; // duplicate so the track scrolls seamlessly
  return (
    <div style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', overflow: 'hidden', maskImage: 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)' }}>
      <style>{'@keyframes inkdrift{from{transform:translateX(0)}to{transform:translateX(-50%)}}'}</style>
      <div style={{ display: 'flex', gap: 14, width: 'max-content', animation: 'inkdrift 80s linear infinite' }}>
        {loop.map((w, i) => (
          <button
            key={`${w.id}-${i}`} onClick={() => onPick(w)} title={w.title}
            style={{ flex: '0 0 auto', width: 220, height: 220, padding: 0, border: 'none', background: '#0c0d12', cursor: 'pointer', overflow: 'hidden', borderRadius: 2 }}
          >
            <img
              src={thumb(w.thumbnail || w.image, 360)} alt={w.title} loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
