import { ORIGINAL_ERAS } from '../../config/originals';
import { c, serif, mono, caption } from './portfolioStyle';

// Originals — the physical, off-chain practice: pre-2019 pure collage, large
// original ink works, and paintings. A quiet museum room for the analogue work
// that sits alongside (and predates) the on-chain catalogue.
export default function PortfolioOriginals() {
  return (
    <div>
      {/* ── Statement ── */}
      <section style={{ padding: '72px 0 56px', maxWidth: 900 }}>
        <div style={{ ...caption, marginBottom: 18 }}>Original works · Off-chain</div>
        <h1 style={{
          fontFamily: serif, fontWeight: 800, fontSize: 'clamp(52px,11vw,150px)',
          lineHeight: 0.9, letterSpacing: -2, textTransform: 'uppercase', margin: '0 0 32px',
        }}>
          Originals
        </h1>
        <p style={{ fontFamily: serif, fontSize: 17, lineHeight: 1.7, color: c.faint, margin: 0, maxWidth: 780 }}>
          Not everything lives on a blockchain. These are the physical originals — the pure-collage years
          that came first, the large ink works, and the paintings. Each is unique, made by hand, and held
          outside the on-chain catalogue.
        </p>
      </section>

      {/* ── Each era ── */}
      {ORIGINAL_ERAS.map(era => (
        <section key={era.key} style={{ borderTop: `1px solid ${c.line}`, padding: '48px 0' }}>
          <header style={{ maxWidth: 680, marginBottom: 30 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
              <h2 style={{ fontFamily: serif, fontWeight: 400, fontSize: 'clamp(26px,3.4vw,38px)', margin: 0 }}>{era.title}</h2>
              <span style={caption}>{era.period}</span>
            </div>
            <p style={{ fontFamily: serif, fontSize: 15.5, lineHeight: 1.65, color: c.faint, margin: 0 }}>{era.blurb}</p>
          </header>

          {era.works.length > 0 ? (
            <div style={{ columnWidth: 260, columnGap: 'clamp(14px,1.8vw,26px)' }}>
              {era.works.map((w, i) => <OriginalTile key={w.image || i} w={w} />)}
            </div>
          ) : (
            <Placeholder />
          )}
        </section>
      ))}
    </div>
  );
}

function OriginalTile({ w }) {
  return (
    <figure style={{ margin: '0 0 clamp(14px,1.8vw,26px)', breakInside: 'avoid' }}>
      <div style={{ background: '#f4f4f4', overflow: 'hidden' }}>
        {w.image
          ? <img src={w.image} alt={w.title} loading="lazy" style={{ width: '100%', height: 'auto', display: 'block' }} />
          : <div style={{ ...caption, padding: '60px 0', textAlign: 'center' }}>—</div>}
      </div>
      <figcaption style={{ marginTop: 10 }}>
        <div style={{ fontFamily: serif, fontSize: 15 }}>{w.title}{w.sold && <span style={{ ...caption, marginLeft: 10 }}>Sold</span>}</div>
        <div style={{ ...caption, marginTop: 4 }}>
          {[w.series, w.year, w.medium, w.size].filter(Boolean).join(' · ')}
        </div>
      </figcaption>
    </figure>
  );
}

// Shown for eras whose photography isn't in yet — keeps the room structurally
// complete and signals where the work will land.
function Placeholder() {
  return (
    <div style={{
      display: 'grid', gap: 'clamp(14px,1.8vw,26px)',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          aspectRatio: '4 / 5', background: 'repeating-linear-gradient(45deg, #fafafa, #fafafa 12px, #f3f3f3 12px, #f3f3f3 24px)',
          border: `1px solid ${c.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ ...caption, color: c.faint }}>Photography in preparation</span>
        </div>
      ))}
    </div>
  );
}
