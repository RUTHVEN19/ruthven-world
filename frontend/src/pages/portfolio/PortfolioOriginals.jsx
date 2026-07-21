import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ORIGINAL_ERAS } from '../../config/originals';
import { c, serif, mono, caption } from './portfolioStyle';

// Originals — the physical, off-chain practice: pre-2019 pure collage, large
// original ink works, and paintings. A quiet museum room for the analogue work
// that sits alongside (and predates) the on-chain catalogue.
export default function PortfolioOriginals() {
  const [open, setOpen] = useState(null); // the work being viewed full-size
  return (
    <div>
      <Helmet>
        <title>Originals — Miss AL Simpson</title>
        <meta name="description" content="The physical, hand-made originals of Miss AL Simpson — collage, large original ink works and paintings. Each unique, worked by hand; some also exist on-chain." />
      </Helmet>
      {/* ── Statement ── */}
      <section style={{ padding: '72px 0 56px', maxWidth: 900 }}>
        <div style={{ ...caption, marginBottom: 18 }}>Original works · Physical</div>
        <h1 style={{
          fontFamily: serif, fontWeight: 800, fontSize: 'clamp(52px,11vw,150px)',
          lineHeight: 0.9, letterSpacing: -2, textTransform: 'uppercase', margin: '0 0 32px',
        }}>
          Originals
        </h1>
        <p style={{ fontFamily: serif, fontSize: 17, lineHeight: 1.7, color: c.faint, margin: 0, maxWidth: 780 }}>
          The physical, hand-made body of work — collage on board, large original ink works and paintings.
          Each is unique, worked by hand. Some also exist on-chain as NFTs; where they do, the link sits
          beneath the piece.
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
              {era.works.map((w, i) => <OriginalTile key={w.image || i} w={w} onOpen={setOpen} />)}
            </div>
          ) : (
            <Placeholder />
          )}
        </section>
      ))}
      {open && <Lightbox w={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function OriginalTile({ w, onOpen }) {
  const clickable = !!w.image;
  return (
    <figure style={{ margin: '0 0 clamp(14px,1.8vw,26px)', breakInside: 'avoid' }}>
      <div
        onClick={clickable ? () => onOpen(w) : undefined}
        style={{ background: '#f4f4f4', overflow: 'hidden', cursor: clickable ? 'zoom-in' : 'default' }}
      >
        {w.image
          ? <img src={w.image} alt={w.title} loading="lazy" style={{ width: '100%', height: 'auto', display: 'block' }} />
          : <div style={{ ...caption, padding: '60px 0', textAlign: 'center' }}>—</div>}
      </div>
      <figcaption style={{ marginTop: 10 }}>
        <div style={{ fontFamily: serif, fontSize: 15 }}>{w.title}{w.sold && <span style={{ ...caption, marginLeft: 10 }}>Sold</span>}</div>
        <div style={{ ...caption, marginTop: 4 }}>
          {[w.series, w.year, w.medium, w.size].filter(Boolean).join(' · ')}
        </div>
        {w.nftUrl && (
          <a href={w.nftUrl} target="_blank" rel="noopener noreferrer"
            style={{ ...caption, marginTop: 8, display: 'inline-block', color: c.ink, borderBottom: `1px solid ${c.line}`, textDecoration: 'none' }}>
            {w.nftLabel || 'View the NFT'} →
          </a>
        )}
      </figcaption>
    </figure>
  );
}

// Full-size viewer — click a work to blow it up over the whole screen.
// Click the ✕ / Esc / the dim margin to close. The description sits alongside;
// detail shots + a process video (when present) become a clickable filmstrip
// that swaps the main stage.
function Lightbox({ w, onClose }) {
  // The stage can show the main image, any detail image, or the video.
  // media = { type:'image'|'video', src }
  const strip = [
    { type: 'image', src: w.image },
    ...(w.details || []).map(src => ({ type: 'image', src })),
    ...(w.video ? [{ type: 'video', src: w.video }] : []),
  ];
  const [stage, setStage] = useState(strip[0]);
  useEffect(() => { setStage(strip[0]); }, [w.image]);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const hasStrip = strip.length > 1;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(12,12,12,0.94)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: 'clamp(16px,4vw,56px)', cursor: 'zoom-out', overflowY: 'auto',
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'fixed', top: 20, right: 24, background: 'none', border: 'none',
          color: '#fff', fontSize: 30, lineHeight: 1, cursor: 'pointer', fontFamily: mono, zIndex: 2,
        }}
      >
        ✕
      </button>

      {/* Media stage fills the page; the written piece sits beneath it.
          margin:auto centres it vertically while STILL allowing the top to
          scroll into view (justify-content:center would clip tall content). */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          width: '100%', cursor: 'default', margin: 'auto',
        }}
      >
        {/* ── Media stage (full page) ── */}
        {stage.type === 'video' ? (
          <video
            src={stage.src}
            controls autoPlay loop playsInline
            style={{ maxWidth: '100%', maxHeight: '88vh', display: 'block', background: '#000' }}
          />
        ) : (
          <img
            src={stage.src}
            alt={w.title}
            style={{ maxWidth: '100%', maxHeight: '88vh', objectFit: 'contain', display: 'block' }}
          />
        )}

        {hasStrip && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 16 }}>
            {strip.map((m, i) => {
              const active = m.src === stage.src;
              return (
                <button
                  key={m.src || i}
                  onClick={() => setStage(m)}
                  aria-label={m.type === 'video' ? 'Play process video' : `Detail ${i}`}
                  style={{
                    width: 64, height: 64, padding: 0, cursor: 'pointer', overflow: 'hidden',
                    background: '#111', position: 'relative',
                    border: active ? '1px solid #fff' : '1px solid rgba(255,255,255,0.28)',
                    opacity: active ? 1 : 0.72,
                  }}
                >
                  {m.type === 'video' ? (
                    <span style={{
                      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: '#fff', fontSize: 20,
                    }}>▶</span>
                  ) : (
                    <img src={m.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ── The written piece ── */}
        <div style={{ maxWidth: 620, textAlign: 'center', color: '#fff', marginTop: 22 }}>
          <div style={{ fontFamily: serif, fontSize: 22, marginBottom: 6 }}>{w.title}</div>
          <div style={{ ...caption, color: 'rgba(255,255,255,0.6)', marginBottom: w.description ? 16 : 0 }}>
            {[w.series, w.year, w.medium, w.size].filter(Boolean).join(' · ')}
          </div>
          {w.description && (
            <p style={{ fontFamily: serif, fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.86)', margin: '0 auto', maxWidth: 560, whiteSpace: 'pre-line' }}>
              {w.description}
            </p>
          )}
          {w.nftUrl && (
            <a href={w.nftUrl} target="_blank" rel="noopener noreferrer"
              style={{ ...caption, marginTop: 20, display: 'inline-block', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.4)', textDecoration: 'none' }}>
              {w.nftLabel || 'View the NFT'} →
            </a>
          )}
        </div>
      </div>
    </div>
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
