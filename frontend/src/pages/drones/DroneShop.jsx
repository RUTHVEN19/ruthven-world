import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { DRONE_CUTS, ZONES } from '../../config/dronesContent';

const zone = ZONES.find(z => z.slug === 'vault');

/* ── Clip-path shapes per diamond cut ── */
const CUT_CLIPS = {
  // Classic brilliant: top-heavy gem silhouette (crown + pavilion)
  'Brilliant Cut':  'polygon(50% 0%, 85% 10%, 100% 40%, 80% 100%, 50% 100%, 20% 100%, 0% 40%, 15% 10%)',
  // Princess: square with chamfered corners
  'Princess Cut':   'polygon(12% 0%, 88% 0%, 100% 12%, 100% 88%, 88% 100%, 12% 100%, 0% 88%, 0% 12%)',
  // Marquise: elongated pointed oval (navette)
  'Marquise Cut':   'polygon(50% 0%, 80% 12%, 100% 50%, 80% 88%, 50% 100%, 20% 88%, 0% 50%, 20% 12%)',
  // Rose: hexagonal dome
  'Rose Cut':       'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
  // Baguette: elongated emerald step-cut
  'Baguette Cut':   'polygon(8% 0%, 92% 0%, 100% 15%, 100% 85%, 92% 100%, 8% 100%, 0% 85%, 0% 15%)',
};

/* ── Aspect ratios per cut for visual distinction ── */
const CUT_ASPECT = {
  'Brilliant Cut':  { w: 1, h: 1.15 },    // slightly taller — gem profile
  'Princess Cut':   { w: 1, h: 1 },       // square
  'Marquise Cut':   { w: 0.7, h: 1.3 },   // tall & narrow — navette
  'Rose Cut':       { w: 1, h: 1.05 },    // near-square hex
  'Baguette Cut':   { w: 0.65, h: 1.35 }, // tall & narrow — step cut
};

const keyframes = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes crystalShimmer {
    0%   { background-position: -300% center; }
    100% { background-position: 300% center; }
  }
  @keyframes sparkleIn {
    0%   { opacity: 0; transform: scale(0.2); filter: brightness(4) blur(6px); }
    50%  { opacity: 1; transform: scale(1.08); filter: brightness(1.8) blur(0px); }
    75%  { transform: scale(0.96); filter: brightness(1.15); }
    100% { opacity: 1; transform: scale(1); filter: brightness(1); }
  }
  @keyframes gemFloat {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-8px); }
  }
  @keyframes glintSweep {
    0%   { left: -80%; opacity: 0; }
    10%  { opacity: 0.7; }
    100% { left: 180%; opacity: 0; }
  }
  @keyframes facetFlash {
    0%, 90%, 100% { opacity: 0; }
    95% { opacity: 0.4; }
  }
  @keyframes prismPulse {
    0%, 100% { opacity: 0; filter: hue-rotate(0deg); }
    50%       { opacity: 0.12; filter: hue-rotate(180deg); }
  }
  @keyframes starSparkle {
    0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
    50%       { opacity: 1; transform: scale(1) rotate(180deg); }
  }
  @keyframes lightboxFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes lightboxImgIn {
    from { opacity: 0; transform: scale(0.85); }
    to   { opacity: 1; transform: scale(1); }
  }
`;

// 24 actual generated drone images — scattered across collection
const VAULT_DRONES = [
  { id: 1,    cut: 'Brilliant Cut',  size: 'lg' },
  { id: 50,   cut: 'Princess Cut',   size: 'md' },
  { id: 100,  cut: 'Marquise Cut',   size: 'sm' },
  { id: 150,  cut: 'Rose Cut',       size: 'md' },
  { id: 200,  cut: 'Baguette Cut',   size: 'sm' },
  { id: 250,  cut: 'Brilliant Cut',  size: 'lg' },
  { id: 300,  cut: 'Princess Cut',   size: 'md' },
  { id: 350,  cut: 'Rose Cut',       size: 'sm' },
  { id: 400,  cut: 'Marquise Cut',   size: 'lg' },
  { id: 450,  cut: 'Baguette Cut',   size: 'md' },
  { id: 500,  cut: 'Brilliant Cut',  size: 'sm' },
  { id: 550,  cut: 'Princess Cut',   size: 'lg' },
  { id: 600,  cut: 'Rose Cut',       size: 'md' },
  { id: 650,  cut: 'Marquise Cut',   size: 'sm' },
  { id: 700,  cut: 'Baguette Cut',   size: 'lg' },
  { id: 750,  cut: 'Princess Cut',   size: 'md' },
  { id: 800,  cut: 'Brilliant Cut',  size: 'sm' },
  { id: 850,  cut: 'Rose Cut',       size: 'md' },
  { id: 900,  cut: 'Marquise Cut',   size: 'lg' },
  { id: 950,  cut: 'Baguette Cut',   size: 'sm' },
  { id: 1000, cut: 'Princess Cut',   size: 'md' },
];

const BASE_SIZE = { sm: 130, md: 170, lg: 210 };

const RARITY_COLOR = {
  Legendary: '#e8f8ff',
  Rare: '#c8e8ff',
  Uncommon: '#b0d4f0',
  Common: 'rgba(255,255,255,0.35)',
};

export default function DroneShop() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredCut, setHoveredCut] = useState(null);
  const [visibleDrones, setVisibleDrones] = useState(new Set());
  const [previewDrone, setPreviewDrone] = useState(null); // full square preview
  const gridRef = useRef(null);
  const getRarity = (cutName) => {
    const found = DRONE_CUTS.find(c => c.name === cutName);
    return found ? found.rarity : 'Common';
  };

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setPreviewDrone(null); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Intersection Observer — sparkle drones in as they scroll into view
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = parseInt(entry.target.dataset.droneIdx, 10);
          setTimeout(() => {
            setVisibleDrones(prev => new Set([...prev, idx]));
          }, (idx % 8) * 150);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });

    const cards = gridRef.current?.querySelectorAll('[data-drone-idx]');
    cards?.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ background: '#3a3a3a', minHeight: '100vh', color: '#fff' }}>
      <Helmet>
        <title>Diamond Drones Vault — 1000 Drones · 5 Diamond Cuts</title>
        <meta name="description" content="1000 unique generative diamond drones at 4K resolution across 5 diamond cuts." />
      </Helmet>
      <style>{keyframes}</style>

      {/* ── FULL ARTWORK PREVIEW LIGHTBOX ── */}
      {previewDrone && (() => {
        const rarity = getRarity(previewDrone.cut);
        const cutData = DRONE_CUTS.find(c => c.name === previewDrone.cut);
        const glow = cutData?.glow || 'rgba(200,230,255,0.5)';
        return (
          <div
            role="dialog"
            aria-label="Diamond Drone preview"
            onClick={() => setPreviewDrone(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(0,0,0,0.92)',
              backdropFilter: 'blur(20px)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '40px', cursor: 'pointer',
              animation: 'lightboxFadeIn 0.3s ease both',
            }}
          >
            {/* Close hint */}
            <div style={{
              position: 'absolute', top: '24px', right: '32px',
              fontSize: '10px', letterSpacing: '0.3em', fontFamily: "'Space Mono', monospace",
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
            }}>
              Click anywhere to close
            </div>

            {/* Square artwork */}
            <div style={{
              animation: 'lightboxImgIn 0.4s ease 0.05s both',
              position: 'relative',
            }}>
              <img
                src={`/vault/browse/${previewDrone.id}.jpg`}
                alt={`Diamond Drone #${previewDrone.id}`}
                style={{
                  width: 'min(80vw, 80vh, 600px)',
                  height: 'min(80vw, 80vh, 600px)',
                  objectFit: 'cover',
                  border: `1px solid ${glow}40`,
                  boxShadow: `0 0 60px ${glow}15`,
                }}
                onClick={e => e.stopPropagation()}
              />
            </div>

            {/* Info below image */}
            <div style={{
              marginTop: '28px', textAlign: 'center',
              animation: 'lightboxImgIn 0.4s ease 0.15s both',
            }}>
              <div style={{
                fontSize: 'clamp(14px,2vw,20px)',
                fontFamily: '"Anton", sans-serif',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                color: '#fff', marginBottom: '8px',
              }}>
                Diamond Drone #{String(previewDrone.id).padStart(4, '0')}
              </div>
              <div style={{
                fontSize: '10px', letterSpacing: '0.3em',
                fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
                color: 'rgba(200,230,255,0.6)',
              }}>
                {previewDrone.cut}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── ZONE HERO ── */}
      <div style={{
        position: 'relative', height: '75vh', minHeight: '500px',
        overflow: 'hidden', display: 'flex',
        alignItems: 'flex-end', paddingBottom: '64px',
      }}>
        <video
          autoPlay muted loop playsInline
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            filter: 'grayscale(100%) contrast(1.1)', opacity: 0.45,
          }}
        >
          <source src="/films/dd-the-vault.mp4" type="video/mp4" />
        </video>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(58,58,58,0.1) 0%, rgba(58,58,58,0.55) 55%, rgba(58,58,58,0.92) 80%, #3a3a3a 100%)',
        }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 clamp(24px,6vw,100px)', width: '100%' }}>
          <div style={{
            fontSize: '11px', letterSpacing: '0.4em', fontFamily: "'Space Mono', monospace",
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
            marginBottom: '16px', animation: 'fadeUp 0.8s ease both',
          }}>
            Zone {zone.numeral} — Diamond Drones Are a Girl's Best Friend
          </div>
          <h1 style={{
            fontFamily: '"Anton", "Arial Black", sans-serif',
            fontSize: 'clamp(40px, 7vw, 90px)',
            fontWeight: 400, letterSpacing: '0.04em',
            textTransform: 'uppercase', lineHeight: 0.9,
            margin: 0, marginBottom: '20px',
            animation: 'fadeUp 0.8s ease 0.1s both',
          }}>
            {zone.title}
          </h1>
          <p style={{
            fontSize: 'clamp(13px,1.4vw,16px)', letterSpacing: '0.02em',
            lineHeight: 1.7, color: 'rgba(255,255,255,0.45)',
            fontFamily: 'Georgia, serif', fontStyle: 'italic',
            maxWidth: '520px', animation: 'fadeUp 0.8s ease 0.2s both',
          }}>
            {zone.tagline}
          </p>
        </div>
      </div>

      {/* ── SPARKLING DIAMOND DRONE GALLERY ── */}
      <section style={{ padding: 'clamp(80px,10vw,140px) clamp(24px,6vw,80px)' }}>
        <div style={{
          fontSize: '11px', letterSpacing: '0.5em', fontFamily: "'Space Mono', monospace",
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
          marginBottom: '64px', textAlign: 'center',
        }}>
          1000 Diamond Drones · 5 Diamond Cuts
        </div>

        <div
          ref={gridRef}
          style={{
            display: 'flex', flexWrap: 'wrap',
            justifyContent: 'center', alignItems: 'center',
            gap: 'clamp(28px, 3.5vw, 48px)',
            maxWidth: '1300px', margin: '0 auto',
          }}
        >
          {VAULT_DRONES.map((drone, i) => {
            const rarity = getRarity(drone.cut);
            const cutData = DRONE_CUTS.find(c => c.name === drone.cut);
            const clip = CUT_CLIPS[drone.cut];
            const aspect = CUT_ASPECT[drone.cut];
            const base = BASE_SIZE[drone.size];
            const w = Math.round(base * aspect.w);
            const h = Math.round(base * aspect.h);
            const isVisible = visibleDrones.has(i);
            const floatDelay = `${(i * 0.47) % 4}s`;
            const floatDuration = `${3.5 + (i % 5) * 0.4}s`;
            const glintDelay = `${2 + (i * 2.3) % 10}s`;
            const isHovered = hoveredCard === i;
            const glow = cutData?.glow || 'rgba(200,230,255,0.5)';

            return (
              <div
                key={drone.id}
                data-drone-idx={i}
                role="button"
                tabIndex={0}
                aria-label={`View Diamond Drone #${drone.id} — ${drone.cut}`}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => setPreviewDrone(drone)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPreviewDrone(drone); } }}
                style={{
                  position: 'relative',
                  width: `${w}px`, height: `${h}px`,
                  opacity: isVisible ? 1 : 0,
                  animation: isVisible
                    ? `sparkleIn 0.9s ease-out both, gemFloat ${floatDuration} ${floatDelay} ease-in-out infinite`
                    : 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.4s, filter 0.4s',
                  transform: isHovered ? 'scale(1.12)' : 'scale(1)',
                  filter: isHovered ? 'brightness(1.25) drop-shadow(0 0 20px rgba(200,230,255,0.3))' : 'brightness(1)',
                  zIndex: isHovered ? 10 : 1,
                }}
              >
                {/* Diamond-clipped image container */}
                <div style={{
                  width: '100%', height: '100%',
                  clipPath: clip,
                  WebkitClipPath: clip,
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {/* The drone image */}
                  <img
                    src={`/vault/browse/${drone.id}.jpg`}
                    alt={`Diamond Drone #${drone.id}`}
                    loading="lazy"
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'cover',
                      filter: 'contrast(1.08) saturate(0.8)',
                    }}
                  />

                  {/* Facet overlay — diagonal lines suggesting gem facets */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: `
                      linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.04) 30.5%, transparent 31%),
                      linear-gradient(45deg, transparent 50%, rgba(255,255,255,0.03) 50.5%, transparent 51%),
                      linear-gradient(225deg, transparent 40%, rgba(255,255,255,0.03) 40.5%, transparent 41%)
                    `,
                    pointerEvents: 'none',
                  }} />

                  {/* Glint sweep — diagonal light passing across the gem */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    overflow: 'hidden', pointerEvents: 'none',
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-20%', bottom: '-20%', width: '30%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), rgba(255,255,255,0.08), transparent)',
                      transform: 'skewX(-20deg)',
                      animation: `glintSweep ${7 + (i % 5) * 2}s ${glintDelay} ease-in-out infinite`,
                    }} />
                  </div>

                  {/* Prismatic rainbow refraction on hover */}
                  {isHovered && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(135deg, rgba(255,100,100,0.08), rgba(100,255,100,0.08), rgba(100,100,255,0.12), rgba(255,200,50,0.08))',
                      mixBlendMode: 'screen',
                      pointerEvents: 'none',
                      animation: 'prismPulse 1.5s ease-in-out infinite',
                    }} />
                  )}
                </div>

                {/* Edge glow border — follows the clip shape using drop-shadow */}
                <div style={{
                  position: 'absolute', inset: '-1px',
                  clipPath: clip,
                  WebkitClipPath: clip,
                  background: 'transparent',
                  boxShadow: isHovered
                    ? `inset 0 0 0 1.5px ${glow}, 0 0 30px ${glow}50`
                    : 'inset 0 0 0 1px rgba(255,255,255,0.12)',
                  transition: 'box-shadow 0.3s',
                  pointerEvents: 'none',
                }} />

                {/* Sparkle stars at corners on hover */}
                {isHovered && [
                  { top: '-4px', left: '50%', delay: '0s' },
                  { bottom: '-4px', left: '50%', delay: '0.3s' },
                  { top: '50%', left: '-4px', delay: '0.15s' },
                  { top: '50%', right: '-4px', delay: '0.45s' },
                ].map((pos, si) => (
                  <div key={si} style={{
                    position: 'absolute', ...pos,
                    width: '8px', height: '8px',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                  }}>
                    {/* 4-point star */}
                    <div style={{
                      width: '100%', height: '100%',
                      background: glow,
                      clipPath: 'polygon(50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0% 50%, 40% 40%)',
                      animation: `starSparkle 0.8s ${pos.delay} ease-in-out infinite`,
                    }} />
                  </div>
                ))}

                {/* Hover label below */}
                {isHovered && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-40px', left: '50%', transform: 'translateX(-50%)',
                    textAlign: 'center', whiteSpace: 'nowrap',
                  }}>
                    <div style={{
                      fontSize: '9px', letterSpacing: '0.25em',
                      fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
                      color: 'rgba(200,230,255,0.6)',
                    }}>
                      {drone.cut}
                    </div>
                    <div style={{
                      fontSize: '8px', letterSpacing: '0.15em',
                      fontFamily: "'Space Mono', monospace",
                      color: 'rgba(255,255,255,0.2)', marginTop: '2px',
                    }}>
                      #{String(drone.id).padStart(4, '0')}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── RARITY TIERS ── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(24px,6vw,100px)' }}>
        <div style={{
          fontSize: '11px', letterSpacing: '0.4em', fontFamily: "'Space Mono', monospace",
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
          marginBottom: '40px', textAlign: 'center',
        }}>
          Five Cut Tiers
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1px', background: 'rgba(255,255,255,0.07)',
          maxWidth: '1100px', margin: '0 auto',
        }}>
          {DRONE_CUTS.map((cut) => {
            const clip = CUT_CLIPS[cut.name];
            return (
              <div
                key={cut.name}
                onMouseEnter={() => setHoveredCut(cut.name)}
                onMouseLeave={() => setHoveredCut(null)}
                style={{
                  background: hoveredCut === cut.name ? 'rgba(255,255,255,0.04)' : '#3a3a3a',
                  padding: '32px 28px',
                  transition: 'background 0.3s',
                }}
              >
                {/* Diamond icon in the actual cut shape */}
                <div style={{
                  width: '32px', height: '38px',
                  clipPath: clip, WebkitClipPath: clip,
                  background: hoveredCut === cut.name
                    ? `linear-gradient(135deg, ${cut.glow}40, ${cut.glow})`
                    : 'rgba(255,255,255,0.08)',
                  marginBottom: '24px',
                  transition: 'background 0.3s',
                  boxShadow: hoveredCut === cut.name ? `0 0 16px ${cut.glow}40` : 'none',
                }} />
                <div style={{
                  fontSize: 'clamp(14px,1.6vw,17px)',
                  fontFamily: '"Anton", sans-serif',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  marginBottom: '8px',
                  color: hoveredCut === cut.name ? '#fff' : 'rgba(255,255,255,0.8)',
                }}>
                  {cut.name}
                </div>
                <div style={{
                  fontSize: '10px', letterSpacing: '0.3em',
                  fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
                  color: 'rgba(200,230,255,0.5)', marginBottom: '12px',
                }}>
                  {cut.pct} of collection
                </div>
                <div style={{
                  fontSize: '11px', letterSpacing: '0.15em',
                  fontFamily: "'Space Mono', monospace", color: 'rgba(255,255,255,0.25)',
                }}>
                  {cut.count} in existence · {cut.pct}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── BIG CTA ── */}
      <section style={{
        padding: 'clamp(100px, 12vw, 160px) clamp(24px,6vw,100px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center', background: 'rgba(0,0,0,0.3)',
      }}>
        <div style={{
          fontSize: 'clamp(10px, 1vw, 12px)', letterSpacing: '0.5em',
          fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.18)', marginBottom: '32px',
        }}>
          1000 Diamond Drones
        </div>
        <div style={{
          fontSize: 'clamp(36px,6vw,80px)',
          fontFamily: '"Anton", sans-serif',
          textTransform: 'uppercase', letterSpacing: '0.04em',
          lineHeight: 0.95, marginBottom: '32px',
          background: 'linear-gradient(110deg, #b0c8d4 0%, #ddeef4 12%, #ffffff 22%, #a8c0cc 33%, #d8ecf4 44%, #ffffff 52%, #b4ccd8 62%, #e0f0f6 73%, #ffffff 82%)',
          backgroundSize: '300% auto',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'crystalShimmer 5s linear infinite',
        }}>
          1000 Diamond<br />Drones
        </div>
        <p style={{
          fontSize: 'clamp(13px,1.4vw,16px)', lineHeight: 1.9,
          color: 'rgba(255,255,255,0.35)', fontFamily: 'Georgia, serif',
          fontStyle: 'italic', maxWidth: '500px', margin: '0 auto 44px',
        }}>
          Referencing the classic diamond cuts — the historic forms
          of brilliance. 1000 in existence worldwide.
        </p>

        <div
          style={{
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.35)', padding: '18px 56px',
            fontSize: '11px', letterSpacing: '0.4em',
            textTransform: 'uppercase', fontFamily: "'Space Mono', monospace",
            display: 'inline-block',
          }}
        >
          {'\u25C6'} 1000 Unique Digital Diamonds {'\u25C6'}
        </div>
      </section>
    </div>
  );
}
