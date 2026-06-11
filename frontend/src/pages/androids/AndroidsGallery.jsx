import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { STILLS, MINT_LINKS, DISCOVERY_FRAGMENTS } from '../../config/androidsContent';

// ── Trait options (narrative, not arbitrary) ──
const TRAITS = {
  era: ['All Eras', 'First Blackout', 'Second Blackout', 'Third Blackout', 'Pre-Revolution'],
  origin: ['All Origins', 'Edinburgh', 'Roppongi', 'Tunnel-born'],
  cherub: ['All Blooms', 'Rose Gold', 'Ivory', 'Midnight', 'Blush', 'None'],
  glaze: ['All Glazes', 'Porcelain', 'Cracked', 'Iridescent', 'Matte', 'Raw'],
};

// ── Generate 1000 placeholder androids (will be replaced with real data) ──
const POPULATION = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  name: `Android #${String(i + 1).padStart(4, '0')}`,
  // Use a real still image for the first few as preview, rest are unrevealed
  image: i < STILLS.length ? `/androids/stills/${STILLS[i].file}` : null,
  recovered: false,
  traits: {
    era: TRAITS.era[1 + (i % (TRAITS.era.length - 1))],
    origin: TRAITS.origin[1 + (i % (TRAITS.origin.length - 1))],
    cherub: TRAITS.cherub[1 + (i % (TRAITS.cherub.length - 1))],
    glaze: TRAITS.glaze[1 + (i % (TRAITS.glaze.length - 1))],
  },
}));

const PAGE_SIZE = 60;

// ═══ MAIN — THE DISTRICT (MINT PAGE) ═══
export default function AndroidsGallery() {
  const [filters, setFilters] = useState({ era: 'All Eras', origin: 'All Origins', cherub: 'All Blooms', glaze: 'All Glazes' });
  const [page, setPage] = useState(1);
  const [lightbox, setLightbox] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);

  // Filter population
  const filtered = POPULATION.filter(a => {
    if (filters.era !== 'All Eras' && a.traits.era !== filters.era) return false;
    if (filters.origin !== 'All Origins' && a.traits.origin !== filters.origin) return false;
    if (filters.cherub !== 'All Blooms' && a.traits.cherub !== filters.cherub) return false;
    if (filters.glaze !== 'All Glazes' && a.traits.glaze !== filters.glaze) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice(0, page * PAGE_SIZE);
  const selected = lightbox !== null ? POPULATION.find(a => a.id === lightbox) : null;

  const handleFilter = useCallback((key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
    setPage(1);
  }, []);

  return (
    <div style={{ background: '#050508', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Helmet>
        <title>The District — Porcelain Androids</title>
        <meta name="description" content="Recover a Porcelain Android from the district. 1,000 androids coded by Blue Cherub — porcelain skin, cherub glitch, sent into the street." />
      </Helmet>

      {/* Neon ambient glow effects */}
      <div style={{
        position: 'fixed', top: 0, left: '-10%', width: '40%', height: '100%',
        background: 'radial-gradient(ellipse at center, rgba(255,45,120,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', top: '20%', right: '-10%', width: '40%', height: '80%',
        background: 'radial-gradient(ellipse at center, rgba(0,212,255,0.05) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: 0, left: '30%', width: '40%', height: '40%',
        background: 'radial-gradient(ellipse at center, rgba(57,255,20,0.03) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Neon top strip */}
      <div style={{
        position: 'relative', zIndex: 1,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #ff2d78, #00d4ff, #39ff14, #ff2d78, transparent)',
        boxShadow: '0 0 20px rgba(255,45,120,0.3), 0 0 40px rgba(0,212,255,0.2)',
      }} />

      {/* ── Hero ── */}
      <section style={{
        padding: 'clamp(60px, 10vw, 120px) clamp(16px, 4vw, 40px) clamp(40px, 6vw, 80px)',
        textAlign: 'center',
        maxWidth: '900px', margin: '0 auto',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{
          fontSize: '9px', fontFamily: "'Space Mono', monospace",
          letterSpacing: '0.5em', textTransform: 'uppercase',
          color: 'rgba(255,45,120,0.4)', marginBottom: '16px',
        }}>
          RECOVERY ARCHIVE // THE POPULATION
        </div>
        <h1 style={{
          fontSize: 'clamp(32px, 6vw, 56px)',
          fontFamily: '"Anton", "Impact", sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          lineHeight: 1.1,
          margin: '0 0 20px',
          background: 'linear-gradient(90deg, #ff2d78, #ff6b9d, #ffffff, #00d4ff)',
          backgroundSize: '300% 100%',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'adGradient 5s linear infinite',
        }}>
          The District
        </h1>
        <p style={{
          fontSize: 'clamp(11px, 1.4vw, 13px)',
          fontFamily: "'Space Mono', monospace",
          lineHeight: 2,
          color: 'rgba(255,255,255,0.4)',
          maxWidth: '600px', margin: '0 auto',
          letterSpacing: '0.03em',
        }}>
          She made something beautiful, and then she made it dangerous, and then she gave it a name and sent it out into the street. 1,000 Porcelain Androids. Porcelain skin. Cherub glitch. Recover yours from the archive.
        </p>

        {/* ── Supply + Wallet ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '24px', marginTop: '32px', flexWrap: 'wrap',
        }}>
          <div style={{
            padding: '12px 24px',
            border: '1px solid rgba(255,45,120,0.1)',
            background: 'rgba(255,45,120,0.03)',
          }}>
            <div style={{
              fontSize: '8px', fontFamily: "'Space Mono', monospace",
              letterSpacing: '0.3em', color: 'rgba(255,45,120,0.4)',
            }}>RECOVERED</div>
            <div style={{
              fontSize: '20px', fontFamily: "'Space Mono', monospace",
              color: '#ff2d78', marginTop: '4px',
            }}>0 / 1,000</div>
          </div>

          <button
            onClick={() => setWalletConnected(!walletConnected)}
            style={{
              padding: '14px 28px',
              fontSize: '11px',
              fontFamily: "'Space Mono', monospace",
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: walletConnected ? '#39ff14' : '#ff2d78',
              background: walletConnected ? 'rgba(57,255,20,0.06)' : 'rgba(255,45,120,0.06)',
              border: `1px solid ${walletConnected ? 'rgba(57,255,20,0.3)' : 'rgba(255,45,120,0.3)'}`,
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
          >
            {walletConnected ? 'WALLET CONNECTED' : 'CONNECT WALLET'}
          </button>
        </div>

        {/* ── Lore fragment ── */}
        <div style={{
          marginTop: '40px', padding: '16px 24px',
          borderLeft: '2px solid rgba(255,45,120,0.15)',
          textAlign: 'left', maxWidth: '500px', margin: '40px auto 0',
        }}>
          <div style={{
            fontSize: '8px', fontFamily: "'Space Mono', monospace",
            letterSpacing: '0.3em', color: 'rgba(0,212,255,0.4)',
            marginBottom: '8px',
          }}>WITNESS RECORD</div>
          <div style={{
            fontSize: '11px', fontFamily: "'Space Mono', monospace",
            lineHeight: 1.9, color: 'rgba(255,255,255,0.3)',
          }}>
            {DISCOVERY_FRAGMENTS[4].text}
          </div>
        </div>
      </section>

      {/* ── Trait Filters ── */}
      <section style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 clamp(16px, 4vw, 40px) 24px',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{
          display: 'flex', gap: '12px', flexWrap: 'wrap',
          padding: '16px 0',
          borderTop: '1px solid rgba(255,45,120,0.06)',
          borderBottom: '1px solid rgba(255,45,120,0.06)',
        }}>
          {Object.entries(TRAITS).map(([key, options]) => (
            <div key={key} style={{ position: 'relative' }}>
              <label style={{
                fontSize: '7px', fontFamily: "'Space Mono', monospace",
                letterSpacing: '0.3em', textTransform: 'uppercase',
                color: 'rgba(255,45,120,0.35)', display: 'block', marginBottom: '4px',
              }}>{key}</label>
              <select
                value={filters[key]}
                onChange={e => handleFilter(key, e.target.value)}
                style={{
                  padding: '8px 28px 8px 10px',
                  fontSize: '10px',
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: '0.1em',
                  color: 'rgba(255,255,255,0.6)',
                  background: 'rgba(255,45,120,0.04)',
                  border: '1px solid rgba(255,45,120,0.12)',
                  cursor: 'pointer',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23ff2d78' fill-opacity='0.4'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                }}
              >
                {options.map(opt => (
                  <option key={opt} value={opt} style={{ background: '#0a0a0a', color: '#fff' }}>{opt}</option>
                ))}
              </select>
            </div>
          ))}

          <div style={{
            marginLeft: 'auto', display: 'flex', alignItems: 'flex-end',
          }}>
            <span style={{
              fontSize: '9px', fontFamily: "'Space Mono', monospace",
              color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em',
            }}>
              {filtered.length} FOUND
            </span>
          </div>
        </div>
      </section>

      {/* ── Grid ── */}
      <section style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '24px clamp(16px, 4vw, 40px) 60px',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '12px',
        }}>
          {visible.map(android => (
            <div
              key={android.id}
              onClick={() => setLightbox(android.id)}
              style={{
                cursor: 'pointer',
                border: '1px solid rgba(255,45,120,0.08)',
                background: 'rgba(255,45,120,0.02)',
                transition: 'all 0.3s',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255,45,120,0.3)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(255,45,120,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,45,120,0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Image or placeholder */}
              <div style={{
                aspectRatio: '1', position: 'relative',
                background: android.image ? 'transparent' : 'rgba(255,45,120,0.03)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {android.image ? (
                  <img
                    src={android.image}
                    alt={android.name}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '20px', color: 'rgba(255,45,120,0.15)',
                      fontFamily: 'serif',
                    }}>磁器</div>
                    <div style={{
                      fontSize: '7px', fontFamily: "'Space Mono', monospace",
                      letterSpacing: '0.2em', color: 'rgba(255,255,255,0.1)',
                      marginTop: '6px',
                    }}>CLASSIFIED</div>
                  </div>
                )}
              </div>

              {/* Label */}
              <div style={{ padding: '8px 10px' }}>
                <div style={{
                  fontSize: '9px', fontFamily: "'Space Mono', monospace",
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.45)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  #{String(android.id).padStart(4, '0')}
                </div>
                <div style={{
                  fontSize: '7px', fontFamily: "'Space Mono', monospace",
                  letterSpacing: '0.15em',
                  color: android.recovered ? 'rgba(57,255,20,0.4)' : 'rgba(255,45,120,0.3)',
                  marginTop: '2px',
                }}>
                  {android.recovered ? 'RECOVERED' : 'AVAILABLE'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load more */}
        {page < totalPages && (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button
              onClick={() => setPage(p => p + 1)}
              style={{
                padding: '12px 32px',
                fontSize: '10px',
                fontFamily: "'Space Mono', monospace",
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
                background: 'rgba(255,45,120,0.04)',
                border: '1px solid rgba(255,45,120,0.12)',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => { e.target.style.borderColor = 'rgba(255,45,120,0.3)'; e.target.style.color = '#ff2d78'; }}
              onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,45,120,0.12)'; e.target.style.color = 'rgba(255,255,255,0.4)'; }}
            >
              Load more ({visible.length} / {filtered.length})
            </button>
          </div>
        )}
      </section>

      {/* ── Lightbox — Android Detail / Mint ── */}
      {selected && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.96)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', animation: 'adFadeIn 0.3s ease',
            padding: '20px',
          }}
          onClick={() => setLightbox(null)}
        >
          <button onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
            style={{
              position: 'absolute', top: '20px', right: '20px',
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
              fontSize: '28px', cursor: 'pointer', width: '44px', height: '44px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>&times;</button>

          <div onClick={(e) => e.stopPropagation()} style={{
            maxWidth: '480px', width: '100%',
          }}>
            {/* Classification */}
            <div style={{
              textAlign: 'center', marginBottom: '20px',
              fontSize: '9px', fontFamily: "'Space Mono', monospace",
              letterSpacing: '0.4em', textTransform: 'uppercase',
              color: 'rgba(255,45,120,0.4)',
            }}>
              ARCHIVE FILE // ANDROID #{String(selected.id).padStart(4, '0')}
            </div>

            {/* Image */}
            <div style={{
              aspectRatio: '1', maxWidth: '400px', margin: '0 auto',
              background: 'rgba(255,45,120,0.03)',
              border: '1px solid rgba(255,45,120,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {selected.image ? (
                <img src={selected.image} alt={selected.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', color: 'rgba(255,45,120,0.12)', fontFamily: 'serif' }}>磁器</div>
                  <div style={{
                    fontSize: '9px', fontFamily: "'Space Mono', monospace",
                    letterSpacing: '0.25em', color: 'rgba(255,255,255,0.12)', marginTop: '12px',
                  }}>IMAGE CLASSIFIED</div>
                </div>
              )}
            </div>

            {/* Traits */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px', marginTop: '20px',
            }}>
              {Object.entries(selected.traits).map(([key, value]) => (
                <div key={key} style={{
                  padding: '8px 12px',
                  border: '1px solid rgba(255,45,120,0.08)',
                  background: 'rgba(255,45,120,0.03)',
                }}>
                  <div style={{
                    fontSize: '7px', fontFamily: "'Space Mono', monospace",
                    letterSpacing: '0.3em', textTransform: 'uppercase',
                    color: 'rgba(255,45,120,0.4)',
                  }}>{key}</div>
                  <div style={{
                    fontSize: '10px', fontFamily: "'Space Mono', monospace",
                    letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)',
                    marginTop: '3px',
                  }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Mint CTA */}
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              {walletConnected ? (
                <button
                  style={{
                    padding: '14px 36px',
                    fontSize: '12px',
                    fontFamily: "'Space Mono', monospace",
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: '#39ff14',
                    background: 'rgba(57,255,20,0.06)',
                    border: '1px solid rgba(57,255,20,0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    width: '100%',
                  }}
                  onMouseEnter={e => { e.target.style.background = 'rgba(57,255,20,0.12)'; e.target.style.boxShadow = '0 0 30px rgba(57,255,20,0.15)'; }}
                  onMouseLeave={e => { e.target.style.background = 'rgba(57,255,20,0.06)'; e.target.style.boxShadow = 'none'; }}
                >
                  回収 RECOVER FROM ARCHIVE
                </button>
              ) : (
                <button
                  onClick={() => setWalletConnected(true)}
                  style={{
                    padding: '14px 36px',
                    fontSize: '12px',
                    fontFamily: "'Space Mono', monospace",
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: '#ff2d78',
                    background: 'rgba(255,45,120,0.06)',
                    border: '1px solid rgba(255,45,120,0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    width: '100%',
                  }}
                  onMouseEnter={e => { e.target.style.background = 'rgba(255,45,120,0.12)'; }}
                  onMouseLeave={e => { e.target.style.background = 'rgba(255,45,120,0.06)'; }}
                >
                  CONNECT WALLET TO RECOVER
                </button>
              )}
              <div style={{
                fontSize: '8px', fontFamily: "'Space Mono', monospace",
                color: 'rgba(255,255,255,0.15)', marginTop: '12px',
                letterSpacing: '0.15em',
              }}>
                RECOVERY PENDING &mdash; MINT NOT YET LIVE
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes adFadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes adGradient { 0%, 100% { background-position: 0% center; } 50% { background-position: 100% center; } }
        @keyframes adNeonPulse {
          0%, 100% { box-shadow: 0 0 8px rgba(255,45,120,0.05); }
          50% { box-shadow: 0 0 16px rgba(255,45,120,0.12); }
        }
      `}</style>
    </div>
  );
}
