import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZONES } from '../../config/dronesContent';

const zone = ZONES.find(z => z.slug === 'gallery');

const keyframes = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmerSlow {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
`;

// Masonry grid layout data — heights vary for visual rhythm
const GALLERY_ITEMS = [
  { src: '/dd-gallery.png', tall: true,  caption: 'Ink Intervention No. 001', still: '001' },
  { src: '/dd-shop.png',    tall: false, caption: 'Ink Intervention No. 002', still: '002' },
  { src: '/dd-cinema.png',  tall: false, caption: 'Ink Intervention No. 003', still: '003' },
  { src: '/dd-gallery.png', tall: true,  caption: 'Ink Intervention No. 004', still: '004' },
  { src: '/dd-shop.png',    tall: false, caption: 'Ink Intervention No. 005', still: '005' },
  { src: '/dd-cinema.png',  tall: true,  caption: 'Ink Intervention No. 006', still: '006' },
  { src: '/dd-gallery.png', tall: false, caption: 'Ink Intervention No. 007', still: '007' },
  { src: '/dd-shop.png',    tall: false, caption: 'Ink Intervention No. 008', still: '008' },
  { src: '/dd-cinema.png',  tall: true,  caption: 'Ink Intervention No. 009', still: '009' },
  { src: '/dd-gallery.png', tall: false, caption: 'Ink Intervention No. 010', still: '010' },
];

export default function DroneGallery() {
  const navigate = useNavigate();
  const [lightbox, setLightbox] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <div style={{ background: '#0d0d0d', minHeight: '100vh', color: '#fff' }}>
      <style>{keyframes}</style>

      {/* ── LIGHTBOX ── */}
      {lightbox !== null && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '40px',
            animation: 'fadeIn 0.3s ease both',
            cursor: 'pointer',
          }}
        >
          <div style={{ position: 'relative', maxWidth: '800px', width: '100%' }}
            onClick={e => e.stopPropagation()}
          >
            <img
              src={GALLERY_ITEMS[lightbox].src}
              alt=""
              style={{
                width: '100%', maxHeight: '80vh',
                objectFit: 'contain',
                filter: 'grayscale(100%) contrast(1.1)',
              }}
            />
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginTop: '16px',
            }}>
              <div style={{
                fontSize: '10px', letterSpacing: '0.3em',
                fontFamily: 'monospace', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
              }}>
                {GALLERY_ITEMS[lightbox].caption}
              </div>
              <div style={{
                fontSize: '10px', letterSpacing: '0.25em',
                fontFamily: 'monospace', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.2)',
              }}>
                AI Ink Intervention — Miss AL Simpson
              </div>
            </div>
            {/* Nav arrows */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'center' }}>
              <button
                onClick={() => setLightbox((lightbox - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.5)', padding: '8px 20px',
                  fontSize: '10px', letterSpacing: '0.3em',
                  fontFamily: 'monospace', cursor: 'pointer',
                }}
              >← Prev</button>
              <button
                onClick={() => setLightbox(null)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.3)', padding: '8px 20px',
                  fontSize: '10px', letterSpacing: '0.3em',
                  fontFamily: 'monospace', cursor: 'pointer',
                }}
              >Close</button>
              <button
                onClick={() => setLightbox((lightbox + 1) % GALLERY_ITEMS.length)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.5)', padding: '8px 20px',
                  fontSize: '10px', letterSpacing: '0.3em',
                  fontFamily: 'monospace', cursor: 'pointer',
                }}
              >Next →</button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={{
        padding: 'clamp(64px,9vw,120px) clamp(24px,6vw,80px) clamp(48px,6vw,72px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'end',
      }}>
        <div>
          <div style={{
            fontSize: '11px', letterSpacing: '0.4em', fontFamily: 'monospace',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
            marginBottom: '16px', animation: 'fadeUp 0.8s ease both',
          }}>
            Zone {zone.numeral} — Diamond Drones Are a Girl's Best Friend™
          </div>
          <h1 style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: 'clamp(36px,6vw,78px)',
            fontWeight: 400, letterSpacing: '0.04em',
            textTransform: 'uppercase', lineHeight: 0.92,
            margin: '0 0 24px',
            animation: 'fadeUp 0.8s ease 0.1s both',
          }}>
            {zone.title}
          </h1>
          <p style={{
            fontSize: 'clamp(13px,1.3vw,16px)', lineHeight: 1.9,
            color: 'rgba(255,255,255,0.4)', fontFamily: 'Georgia, serif',
            fontStyle: 'italic', maxWidth: '420px',
            animation: 'fadeUp 0.8s ease 0.2s both',
          }}>
            {zone.tagline}
          </p>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: '16px',
          animation: 'fadeUp 0.8s ease 0.3s both',
        }}>
          {[
            ['Method', 'AI Ink Intervention'],
            ['Artist', 'Miss AL Simpson'],
            ['Per Collector', '10 unique stills'],
            ['Total Pool', '2,000 stills'],
            ['Selection', 'Curated random draw'],
          ].map(([k, v]) => (
            <div key={k} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              <span style={{ fontSize: '10px', letterSpacing: '0.25em', fontFamily: 'monospace', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>{k}</span>
              <span style={{ fontSize: '11px', letterSpacing: '0.05em', fontFamily: 'monospace', color: 'rgba(255,255,255,0.55)' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── PROCESS STATEMENT ── */}
      <div style={{
        padding: 'clamp(48px,6vw,72px) clamp(24px,6vw,80px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        maxWidth: '720px',
      }}>
        <div style={{
          fontSize: '11px', letterSpacing: '0.4em', fontFamily: 'monospace',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
          marginBottom: '16px',
        }}>
          The Process
        </div>
        <p style={{
          fontSize: 'clamp(15px,1.6vw,20px)', lineHeight: 2,
          color: 'rgba(255,255,255,0.5)', fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
        }}>
          Each still begins as a generated image from the Diamond Drones universe,
          then passes through Miss AL Simpson's AI Ink Intervention — a proprietary
          method of working back over the machine surface by hand. The result is
          neither pure AI nor pure painting. It is something between.
        </p>
      </div>

      {/* ── MASONRY GALLERY ── */}
      <section style={{ padding: 'clamp(48px,6vw,72px) clamp(24px,6vw,80px)' }}>
        <div style={{
          fontSize: '11px', letterSpacing: '0.4em', fontFamily: 'monospace',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
          marginBottom: '32px',
        }}>
          Preview Gallery — Your 10 will be drawn from a pool of 2,000
        </div>

        {/* Two-column masonry */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '2px',
        }}>
          {GALLERY_ITEMS.map((item, i) => (
            <div
              key={i}
              onClick={() => setLightbox(i)}
              onMouseEnter={() => setHoveredItem(i)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                position: 'relative', overflow: 'hidden',
                cursor: 'pointer',
                height: item.tall ? 'clamp(300px,32vw,480px)' : 'clamp(200px,22vw,320px)',
                gridRow: item.tall ? 'span 2' : 'span 1',
              }}
            >
              <img
                src={item.src}
                alt={item.caption}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: 'center',
                  filter: 'grayscale(100%) contrast(1.1)',
                  transition: 'transform 0.7s ease',
                  transform: hoveredItem === i ? 'scale(1.06)' : 'scale(1)',
                }}
              />
              {/* Hover overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: hoveredItem === i ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.42)',
                transition: 'background 0.4s',
              }} />

              {/* Still number */}
              <div style={{
                position: 'absolute', top: '14px', left: '14px',
                fontSize: '9px', letterSpacing: '0.3em',
                fontFamily: 'monospace', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)',
              }}>
                {item.still}
              </div>

              {/* Caption on hover */}
              {hoveredItem === i && (
                <div style={{
                  position: 'absolute', bottom: '14px', left: '14px', right: '14px',
                  fontSize: '10px', letterSpacing: '0.2em',
                  fontFamily: 'monospace', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.5)',
                  animation: 'fadeUp 0.3s ease both',
                }}>
                  {item.caption}
                </div>
              )}

              {/* Expand icon */}
              {hoveredItem === i && (
                <div style={{
                  position: 'absolute', top: '14px', right: '14px',
                  width: '28px', height: '28px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', color: 'rgba(255,255,255,0.5)',
                  animation: 'fadeIn 0.3s ease both',
                }}>
                  ⊕
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: 'clamp(60px,7vw,90px) clamp(24px,6vw,80px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: '"Anton", sans-serif',
          fontSize: 'clamp(22px,3vw,40px)',
          textTransform: 'uppercase', letterSpacing: '0.04em',
          lineHeight: 1.1, marginBottom: '20px',
          background: 'linear-gradient(110deg, #b0c8d4 0%, #ffffff 40%, #a8c0cc 70%, #ffffff 100%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'shimmerSlow 6s linear infinite',
        }}>
          Ten images.<br />Yours alone.
        </h2>
        <p style={{
          fontSize: 'clamp(13px,1.3vw,15px)', lineHeight: 1.9,
          color: 'rgba(255,255,255,0.35)', fontFamily: 'Georgia, serif',
          fontStyle: 'italic', maxWidth: '440px', margin: '0 auto 36px',
        }}>
          10 unique stills are included in every Collector Set.
          Drawn from a curated pool of 2,000. No two sets are the same.
        </p>
        <button
          onClick={() => navigate('/drones/mint')}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff', padding: '16px 48px',
            fontSize: '11px', letterSpacing: '0.35em',
            textTransform: 'uppercase', fontFamily: 'monospace',
            cursor: 'pointer', transition: 'all 0.3s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
          }}
        >
          Mint the Collector Set →
        </button>
      </section>
    </div>
  );
}
