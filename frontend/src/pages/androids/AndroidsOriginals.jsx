import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { STILLS, DISCOVERY_FRAGMENTS, ANDROIDS_BASE, openseaTokenUrl, stillTokenId } from '../../config/androidsContent';

// Warm amber palette
const FRAME_COLORS = ['#ffd700', '#ff9d00', '#e8a87c', '#d4a574', '#c9956b'];

// Lore fragments to scatter between gallery rows
const LORE_INSERTS = [
  { after: 5, fragment: DISCOVERY_FRAGMENTS[3] },  // witness record
  { after: 12, fragment: DISCOVERY_FRAGMENTS[4] },  // cherubs
  { after: 20, fragment: DISCOVERY_FRAGMENTS[0] },  // archive 001
  { after: 28, fragment: DISCOVERY_FRAGMENTS[2] },  // tunnel
];

// Scroll-triggered fade-in
function FadeIn({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

export default function AndroidsOriginals() {
  const navigate = useNavigate();
  const [lightbox, setLightbox] = useState(null);
  const [loaded, setLoaded] = useState({});

  const handleSelect = useCallback((idx) => setLightbox(idx), []);
  const handleMint = useCallback((idx) => {
    navigate(`${ANDROIDS_BASE}/manga-machine?android=${idx + 1}`);
  }, [navigate]);
  const still = lightbox !== null ? STILLS[lightbox] : null;

  // Build gallery with lore inserts
  const loreAfterIndices = new Set(LORE_INSERTS.map(l => l.after));

  return (
    <div style={{ background: '#030306', minHeight: '100vh' }}>
      <Helmet>
        <title>Porcelain Androids — Genesis Collection</title>
        <meta name="description" content="The ones that appeared after the blackout. No manufacturer. No serial. Origin unknown. The Genesis Porcelain Androids carry the oldest Manga Memories." />
      </Helmet>

      {/* Rain overlay */}
      <div className="ao-rain" />

      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: 0, left: '-10%', width: '40%', height: '100%',
        background: 'radial-gradient(ellipse at center, rgba(255,215,0,0.04) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', top: '30%', right: '-10%', width: '40%', height: '60%',
        background: 'radial-gradient(ellipse at center, rgba(232,168,124,0.03) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Hero */}
      <FadeIn>
        <div style={{
          textAlign: 'center', padding: 'clamp(80px, 10vw, 120px) 24px clamp(40px, 5vw, 60px)',
          position: 'relative', zIndex: 2,
        }}>
          <div style={{
            fontSize: '9px', fontFamily: "'Space Mono', monospace",
            letterSpacing: '0.6em', textTransform: 'uppercase',
            color: 'rgba(255,215,0,0.35)',
          }}>
            CLASSIFIED ARCHIVE // GENESIS
          </div>

          {/* Neon brand sign */}
          <div className="ao-neon-brand" style={{ position: 'relative', zIndex: 3 }}>
            PORCELAIN<br/>ANDROID
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900,
            fontFamily: 'serif', margin: '16px 0 0',
            background: 'linear-gradient(135deg, #ffd700, #e8a87c, #ffd700)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            lineHeight: 1.1,
          }}>
            起源
          </h1>
          <div style={{
            fontSize: 'clamp(16px, 2.5vw, 24px)', fontFamily: "'Anton', 'Space Mono', sans-serif",
            letterSpacing: '0.25em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.7)', marginTop: '8px',
          }}>
            THE GENESIS COLLECTION
          </div>
          <div style={{
            fontSize: 'clamp(11px, 1.2vw, 13px)', fontFamily: "'Space Mono', monospace",
            lineHeight: 1.9, color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.04em', marginTop: '24px', maxWidth: '600px',
            marginLeft: 'auto', marginRight: 'auto',
          }}>
            The porcelain figures appeared after the blackout. No manufacturer. No serial.
            No one delivered them. They were simply there, with the patience of the very old,
            as if they had waited out the whole demolition just to have the place to themselves.
          </div>
          <div style={{
            fontSize: 'clamp(10px, 1.1vw, 12px)', fontFamily: "'Space Mono', monospace",
            lineHeight: 1.9, color: 'rgba(255,215,0,0.45)',
            letterSpacing: '0.04em', marginTop: '16px', maxWidth: '540px',
            marginLeft: 'auto', marginRight: 'auto',
            fontStyle: 'italic',
          }}>
            Each Porcelain Android is AI-generated from models trained on Miss AL Simpson's
            original collage, digital paintings, and graffiti — then hand-drawn over by the artist.
          </div>
          <div style={{
            display: 'flex', gap: '32px', justifyContent: 'center',
            marginTop: '32px', flexWrap: 'wrap',
          }}>
            <div className="ao-stat">
              <span className="ao-stat-val">{STILLS.length}</span>
              <span className="ao-stat-label">FOUND</span>
            </div>
            <div className="ao-stat">
              <span className="ao-stat-val">0</span>
              <span className="ao-stat-label">MANUFACTURER</span>
            </div>
            <div className="ao-stat">
              <span className="ao-stat-val">0</span>
              <span className="ao-stat-label">SERIAL</span>
            </div>
            <div className="ao-stat">
              <span className="ao-stat-val ao-stat-blink">?</span>
              <span className="ao-stat-label">ORIGIN</span>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Gallery Grid with lore inserts */}
      <div style={{
        maxWidth: '1400px', margin: '0 auto',
        padding: '0 clamp(16px, 3vw, 40px) 80px',
        position: 'relative', zIndex: 2,
      }}>
        <div className="ao-grid">
          {STILLS.map((s, i) => {
            const frameColor = FRAME_COLORS[i % FRAME_COLORS.length];
            const loreInsert = LORE_INSERTS.find(l => l.after === i);
            return (
              <FadeIn key={s.id} delay={(i % 4) * 0.08} style={{ display: 'contents' }}>
                <div
                  className="ao-card"
                  style={{ '--frame-color': frameColor }}
                  onClick={() => handleSelect(i)}
                >
                  <div className="ao-card-inner">
                    {!loaded[i] && (
                      <div className="ao-card-skeleton">
                        <div style={{
                          fontSize: '18px', color: 'rgba(255,215,0,0.15)',
                          fontFamily: 'serif',
                        }}>磁器</div>
                      </div>
                    )}
                    <img
                      src={`/androids/stills/thumbs/${s.file.replace('.png', '.jpg')}`}
                      alt={s.name}
                      loading="lazy"
                      onLoad={() => setLoaded(prev => ({ ...prev, [i]: true }))}
                      style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                        display: 'block',
                        opacity: loaded[i] ? 1 : 0,
                        transition: 'opacity 0.4s ease',
                      }}
                    />
                    <div className="ao-card-number">#{String(i + 1).padStart(3, '0')}</div>
                    {s.mintable && (
                      <div className="ao-card-mint-badge">マシン</div>
                    )}
                  </div>
                  <div className="ao-card-label">
                    <div className="ao-card-name">{s.name}</div>
                    <div className="ao-card-sub">
                      {s.mintable ? 'MANGA MACHINE ANDROID' : `GENESIS #${String(i + 1).padStart(3, '0')}`}
                    </div>
                    <a
                      className="ao-card-opensea"
                      href={openseaTokenUrl(stillTokenId(i))}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span style={{ fontFamily: 'serif', fontSize: '13px' }}>マシン</span>
                      MINT ON OPENSEA ↗
                    </a>
                    {s.mintable ? (
                      <button
                        className="ao-card-mint-link"
                        onClick={(e) => { e.stopPropagation(); navigate(`${ANDROIDS_BASE}/manga-machine?android=${s.mintable}`); }}
                      >
                        ENTER THE MACHINE
                      </button>
                    ) : (
                      <button
                        className="ao-card-print-link"
                        onClick={(e) => { e.stopPropagation(); navigate(`${ANDROIDS_BASE}/prints?artwork=${s.id}`); }}
                      >
                        ORDER PRINT
                      </button>
                    )}
                  </div>
                </div>
                {loreInsert && (
                  <div className="ao-lore-break">
                    <div className="ao-lore-type">{loreInsert.fragment.type}</div>
                    <div className="ao-lore-text">{loreInsert.fragment.text}</div>
                    <div className="ao-lore-line" />
                  </div>
                )}
              </FadeIn>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <FadeIn>
        <div style={{
          textAlign: 'center', padding: '40px 24px 100px',
          position: 'relative', zIndex: 2,
        }}>
          <div style={{
            fontSize: '9px', fontFamily: "'Space Mono', monospace",
            letterSpacing: '0.5em', color: 'rgba(255,215,0,0.25)',
          }}>END OF CLASSIFIED ARCHIVE</div>
          <div style={{
            fontSize: 'clamp(14px, 2vw, 18px)', fontFamily: "'Space Mono', monospace",
            color: 'rgba(255,255,255,0.25)', marginTop: '16px',
            letterSpacing: '0.08em', fontStyle: 'italic',
          }}>
            They wear heaven like a dare.
          </div>
        </div>
      </FadeIn>

      {/* Lightbox */}
      {lightbox !== null && still && (
        <div className="ao-lightbox" onClick={() => setLightbox(null)}>
          <button className="ao-lb-close" onClick={(e) => { e.stopPropagation(); setLightbox(null); }}>&times;</button>

          {lightbox > 0 && (
            <button className="ao-lb-arrow ao-lb-prev" onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1); }}>&#8249;</button>
          )}
          {lightbox < STILLS.length - 1 && (
            <button className="ao-lb-arrow ao-lb-next" onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1); }}>&#8250;</button>
          )}

          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <div style={{
              textAlign: 'center', marginBottom: '16px',
              fontSize: '9px', fontFamily: "'Space Mono', monospace",
              letterSpacing: '0.4em', textTransform: 'uppercase',
              color: 'rgba(255,215,0,0.5)',
            }}>
              CLASSIFIED // GENESIS #{String(lightbox + 1).padStart(3, '0')} &middot; THE FOUND
            </div>

            <img
              src={`/androids/stills/${still.file}`}
              alt={still.name}
              style={{ maxWidth: '90vw', maxHeight: '55vh', objectFit: 'contain', display: 'block', margin: '0 auto' }}
            />

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <div style={{
                fontSize: 'clamp(14px, 2vw, 20px)', fontFamily: "'Anton', 'Space Mono', sans-serif",
                letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.85)',
              }}>{still.name}</div>

              <div style={{
                fontSize: '10px', fontFamily: "'Space Mono', monospace",
                color: 'rgba(255,215,0,0.35)', marginTop: '8px',
                letterSpacing: '0.2em',
              }}>
                NO MANUFACTURER &middot; NO SERIAL &middot; SIMPLY THERE
              </div>

              <div style={{
                display: 'flex', gap: '12px', justifyContent: 'center',
                marginTop: '16px', flexWrap: 'wrap',
              }}>
                {[
                  { label: 'ERA', value: 'Before the First Blackout' },
                  { label: 'ORIGIN', value: lightbox % 3 === 0 ? 'Edinburgh' : lightbox % 3 === 1 ? 'Roppongi' : 'The Tunnel' },
                  { label: 'GLAZE', value: 'Original Porcelain' },
                  { label: 'MEMORY', value: 'The Oldest' },
                ].map(trait => (
                  <div key={trait.label} style={{
                    padding: '6px 14px',
                    border: '1px solid rgba(255,215,0,0.1)',
                    background: 'rgba(255,215,0,0.03)',
                  }}>
                    <div style={{
                      fontSize: '7px', fontFamily: "'Space Mono', monospace",
                      letterSpacing: '0.3em', color: 'rgba(255,215,0,0.4)',
                    }}>{trait.label}</div>
                    <div style={{
                      fontSize: '10px', fontFamily: "'Space Mono', monospace",
                      letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)',
                      marginTop: '2px',
                    }}>{trait.value}</div>
                  </div>
                ))}
              </div>

              {/* Lore snippet in lightbox */}
              <div style={{
                marginTop: '20px', padding: '12px 20px',
                border: '1px solid rgba(255,215,0,0.08)',
                background: 'rgba(255,215,0,0.02)',
                maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto',
              }}>
                <div style={{
                  fontSize: '8px', fontFamily: "'Space Mono', monospace",
                  letterSpacing: '0.3em', color: 'rgba(255,215,0,0.3)',
                  marginBottom: '6px',
                }}>WITNESS RECORD</div>
                <div style={{
                  fontSize: '11px', fontFamily: "'Space Mono', monospace",
                  lineHeight: 1.8, color: 'rgba(255,255,255,0.35)',
                  fontStyle: 'italic',
                }}>
                  {DISCOVERY_FRAGMENTS[lightbox % DISCOVERY_FRAGMENTS.length].text}
                </div>
              </div>

              {/* CTAs — mint on OpenSea + enter the Manga Machine */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '8px' }}>
                <a
                  className="ao-cta-mint"
                  href={openseaTokenUrl(stillTokenId(lightbox))}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span style={{ fontFamily: 'serif', fontSize: '16px' }}>マシン</span>
                  <span>MINT ON OPENSEA ↗</span>
                </a>
                <button
                  className="ao-cta-machine"
                  onClick={() => handleMint(lightbox)}
                >
                  <span style={{ fontFamily: 'serif', fontSize: '16px' }}>マシン</span>
                  <span>ENTER THE MACHINE</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Rain */
        .ao-rain {
          position: fixed; inset: 0; z-index: 1; pointer-events: none;
          background-image:
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2' height='40'%3E%3Crect width='1' height='8' fill='%239aaabb' opacity='0.12'/%3E%3C/svg%3E");
          background-size: 20px 40px;
          animation: aoRainFall 0.7s linear infinite;
          opacity: 0.4;
        }
        @keyframes aoRainFall {
          0% { background-position: 0 0; }
          100% { background-position: 3px 40px; }
        }

        /* Stats */
        .ao-stat {
          display: flex; flex-direction: column; align-items: center; gap: 4px;
        }
        .ao-stat-val {
          font-size: 22px; font-family: 'Space Mono', monospace;
          font-weight: 700; color: rgba(255,215,0,0.6);
        }
        .ao-stat-blink {
          animation: aoBlink 1.5s steps(1) infinite;
        }
        .ao-stat-label {
          font-size: 8px; font-family: 'Space Mono', monospace;
          letter-spacing: 0.3em; color: rgba(255,255,255,0.2);
        }

        /* Grid */
        .ao-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: clamp(16px, 2vw, 24px);
        }
        @media (min-width: 1200px) {
          .ao-grid { grid-template-columns: repeat(4, 1fr); }
        }

        /* Card */
        .ao-card {
          cursor: pointer; position: relative;
          transition: transform 0.3s ease;
        }
        .ao-card:hover { transform: translateY(-4px); }
        .ao-card:hover .ao-card-inner {
          border-color: var(--frame-color, #ffd700);
          box-shadow: 0 0 20px color-mix(in srgb, var(--frame-color, #ffd700) 25%, transparent),
                      inset 0 0 30px color-mix(in srgb, var(--frame-color, #ffd700) 8%, transparent);
        }
        .ao-card:hover .ao-card-name {
          color: var(--frame-color, #ffd700);
          text-shadow: 0 0 8px color-mix(in srgb, var(--frame-color, #ffd700) 40%, transparent);
        }
        .ao-card:hover .ao-card-number {
          opacity: 1;
        }
        .ao-card-inner {
          aspect-ratio: 16 / 9; overflow: hidden; position: relative;
          border: 1px solid rgba(255,215,0,0.08);
          background: rgba(255,215,0,0.02);
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .ao-card-skeleton {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,215,0,0.02);
        }
        .ao-card-number {
          position: absolute; top: 8px; right: 10px;
          font-size: 9px; font-family: 'Space Mono', monospace;
          letter-spacing: 0.15em; color: rgba(255,215,0,0.5);
          background: rgba(0,0,0,0.6); padding: 2px 8px;
          opacity: 0; transition: opacity 0.3s;
        }
        .ao-card-label {
          padding: 10px 2px 0; text-align: center;
        }
        .ao-card-name {
          font-size: 11px; font-family: 'Space Mono', monospace;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          transition: color 0.3s, text-shadow 0.3s;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .ao-card-sub {
          font-size: 8px; font-family: 'Space Mono', monospace;
          letter-spacing: 0.25em; color: rgba(255,215,0,0.2);
          margin-top: 3px;
        }

        /* Lore breaks between rows */
        .ao-lore-break {
          grid-column: 1 / -1;
          text-align: center;
          padding: 48px 24px;
          position: relative;
        }
        .ao-lore-type {
          font-size: 9px; font-family: 'Space Mono', monospace;
          letter-spacing: 0.5em; text-transform: uppercase;
          color: rgba(255,215,0,0.35);
          margin-bottom: 12px;
        }
        .ao-lore-text {
          font-size: clamp(12px, 1.4vw, 15px); font-family: 'Space Mono', monospace;
          line-height: 2; color: rgba(255,255,255,0.4);
          max-width: 640px; margin: 0 auto;
          font-style: italic; letter-spacing: 0.02em;
        }
        .ao-lore-line {
          width: 60px; height: 1px; margin: 24px auto 0;
          background: linear-gradient(90deg, transparent, rgba(255,215,0,0.2), transparent);
        }

        /* Lightbox */
        .ao-lightbox {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(0,0,0,0.96);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; animation: aoFadeIn 0.3s ease;
        }
        .ao-lb-close {
          position: absolute; top: 20px; right: 20px;
          background: none; border: none; color: rgba(255,255,255,0.6);
          font-size: 28px; cursor: pointer; width: 44px; height: 44px;
          display: flex; align-items: center; justify-content: center;
        }
        .ao-lb-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: rgba(255,215,0,0.08); border: 1px solid rgba(255,215,0,0.2);
          color: #ffd700; font-size: 24px; cursor: pointer;
          width: 48px; height: 48px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .ao-lb-arrow:hover { background: rgba(255,215,0,0.15); }
        .ao-lb-prev { left: 20px; }
        .ao-lb-next { right: 20px; }

        /* Machine CTA */
        .ao-cta-machine {
          display: flex; align-items: center; justify-content: center; gap: 12px;
          margin: 0; padding: 14px 32px;
          background: transparent;
          border: 1px solid rgba(255,45,120,0.3);
          color: #ff2d78; cursor: pointer;
          font-family: 'Space Mono', monospace; font-size: 12px;
          letter-spacing: 0.2em; text-transform: uppercase;
          transition: all 0.3s;
          animation: aoCTAPulse 2s ease-in-out infinite;
        }
        .ao-cta-machine:hover {
          background: rgba(255,45,120,0.1);
          border-color: #ff2d78;
          box-shadow: 0 0 30px rgba(255,45,120,0.3);
          animation: none;
        }
        @keyframes aoCTAPulse {
          0%, 100% { box-shadow: 0 0 10px rgba(255,45,120,0.1); }
          50% { box-shadow: 0 0 20px rgba(255,45,120,0.25); }
        }

        /* Mint badge on card */
        .ao-card-mint-badge {
          position: absolute; bottom: 8px; left: 10px;
          font-size: 14px; font-family: serif; font-weight: 900;
          color: #ff2d78;
          text-shadow: 0 0 8px #ff2d78, 0 0 20px rgba(255,45,120,0.5);
          opacity: 0.9;
        }
        .ao-card-mint-link {
          display: inline-block; margin-top: 6px;
          padding: 4px 12px;
          background: transparent;
          border: 1px solid rgba(255,45,120,0.3);
          color: #ff2d78; cursor: pointer;
          font-family: 'Space Mono', monospace; font-size: 8px;
          letter-spacing: 0.2em; text-transform: uppercase;
          transition: all 0.3s;
        }
        .ao-card-mint-link:hover {
          background: rgba(255,45,120,0.15);
          border-color: #ff2d78;
          box-shadow: 0 0 15px rgba(255,45,120,0.3);
        }

        .ao-card-print-link {
          display: inline-block; margin-top: 6px;
          padding: 4px 12px;
          background: transparent;
          border: 1px solid rgba(255,215,0,0.3);
          color: #ffd700; cursor: pointer;
          font-family: 'Space Mono', monospace; font-size: 8px;
          letter-spacing: 0.2em; text-transform: uppercase;
          transition: all 0.3s;
        }
        .ao-card-print-link:hover {
          background: rgba(255,215,0,0.15);
          border-color: #ffd700;
          box-shadow: 0 0 15px rgba(255,215,0,0.3);
        }

        /* MINT ON OPENSEA — primary collect button (card) */
        .ao-card-opensea {
          display: inline-flex; align-items: center; gap: 6px; margin-top: 8px;
          padding: 6px 14px;
          background: #ff2d78;
          border: 1px solid #ff2d78;
          color: #fff; cursor: pointer; text-decoration: none;
          font-family: 'Space Mono', monospace; font-size: 9px; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
          transition: all 0.3s;
          box-shadow: 0 0 12px rgba(255,45,120,0.35);
        }
        .ao-card-opensea:hover {
          background: #ff5192;
          box-shadow: 0 0 22px rgba(255,45,120,0.6);
          transform: translateY(-1px);
        }
        /* MINT ON OPENSEA — primary collect button (lightbox) */
        .ao-cta-mint {
          display: flex; align-items: center; justify-content: center; gap: 12px;
          margin: 0; padding: 14px 32px;
          background: #ff2d78;
          border: 1px solid #ff2d78;
          color: #fff; cursor: pointer; text-decoration: none;
          font-family: 'Space Mono', monospace; font-size: 12px;
          letter-spacing: 0.2em; text-transform: uppercase;
          transition: all 0.3s;
          box-shadow: 0 0 20px rgba(255,45,120,0.4);
        }
        .ao-cta-mint:hover {
          background: #ff5192;
          box-shadow: 0 0 34px rgba(255,45,120,0.6);
        }

        /* Neon brand sign */
        .ao-neon-brand {
          font-size: clamp(40px, 8vw, 80px);
          font-weight: 900;
          font-family: 'Impact', 'Arial Black', 'Haettenschweiler', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          line-height: 1;
          margin: 20px 0 8px;
          color: #ff2d78;
          text-shadow:
            0 0 10px #ff2d78,
            0 0 30px #ff2d78,
            0 0 60px rgba(255,45,120,0.5),
            0 0 100px rgba(255,45,120,0.3);
          animation: aoNeonPulse 3s ease-in-out infinite;
        }
        @keyframes aoNeonPulse {
          0%, 100% {
            text-shadow:
              0 0 10px #ff2d78,
              0 0 30px #ff2d78,
              0 0 60px rgba(255,45,120,0.5),
              0 0 100px rgba(255,45,120,0.3);
          }
          50% {
            text-shadow:
              0 0 15px #ff2d78,
              0 0 40px #ff2d78,
              0 0 80px rgba(255,45,120,0.6),
              0 0 120px rgba(255,45,120,0.4),
              0 0 160px rgba(255,45,120,0.2);
          }
        }

        @keyframes aoFadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes aoBlink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0.3; } }
      `}</style>
    </div>
  );
}
