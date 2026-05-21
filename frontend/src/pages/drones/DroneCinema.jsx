import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ZONES, ALBUM } from '../../config/dronesContent';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const zone = ZONES.find(z => z.slug === 'cinema');

const keyframes = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmerSlow {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes scanline {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.4; }
    50%       { opacity: 1; }
  }
`;

// The 4 Diamond Drone films
const FILMS = [
  { title: 'Recording Studio',      file: '/films/dd-recording-studio.mp4',      fileHQ: '/films/dd-recording-studio-hq.mp4',      num: '01' },
  { title: 'The Vault',             file: '/films/dd-the-vault.mp4',             fileHQ: '/films/dd-the-vault-hq.mp4',             num: '02' },
  { title: 'Jewellery Box',         file: '/films/dd-jewellery-box.mp4',         fileHQ: '/films/dd-jewellery-box-hq.mp4',         num: '03' },
  { title: 'Diamond Drone Lounge',  file: '/films/dd-diamond-drone-lounge.mp4',  fileHQ: '/films/dd-diamond-drone-lounge-hq.mp4',  num: '04' },
];

export default function DroneCinema() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [activeFilm, setActiveFilm] = useState(null);    // index of film playing in hero
  const [hoveredFilm, setHoveredFilm] = useState(null);
  const heroVideoRef = useRef(null);
  const heroSectionRef = useRef(null);

  const playFilm = (idx) => {
    const film = FILMS[idx];
    if (!film.file) return;
    setActiveFilm(idx);
    // Let React re-render, then play
    setTimeout(() => {
      if (heroVideoRef.current) {
        heroVideoRef.current.play().catch(() => {});
      }
    }, 100);
  };

  const activeFilmData = activeFilm !== null ? FILMS[activeFilm] : null;

  return (
    <div style={{ background: '#3a3a3a', minHeight: '100vh', color: '#fff' }}>
      <Helmet>
        <title>Drone Cinema — The Drones of Suburbia Films</title>
        <meta name="description" content="4 Diamond Drone films by Miss AL Simpson. Diamond Drones Are a Girl's Best Friend — Recording Studio, The Vault, Jewellery Box, and Diamond Drone Lounge." />
      </Helmet>
      <style>{keyframes}</style>

      {/* ── HERO FILM PLAYER ── */}
      <div ref={heroSectionRef} style={{
        position: 'relative',
        background: '#000',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Scanline */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          pointerEvents: 'none', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', left: 0, right: 0,
            height: '2px', background: 'rgba(255,255,255,0.03)',
            animation: 'scanline 8s linear infinite',
          }} />
        </div>

        {/* Video container — 9:16 aspect for vertical films, or 16:9 for landscape */}
        <div style={{
          position: 'relative',
          paddingTop: activeFilmData ? '56.25%' : '41.8%',
          background: '#000',
          overflow: 'hidden',
          minHeight: '400px',
          maxHeight: '80vh',
          transition: 'padding-top 0.5s ease',
        }}>
          <video
            ref={heroVideoRef}
            key={activeFilmData?.file || 'default'}
            src={activeFilmData?.file || '/drones-hero.mp4'}
            loop
            playsInline
            autoPlay={!!activeFilmData}
            muted={!activeFilmData}
            preload="auto"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'contain', objectPosition: 'center',
              filter: 'grayscale(60%) contrast(1.08)',
              background: '#000',
            }}
          />

          {/* Overlay when no film selected */}
          {!activeFilmData && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.55)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              zIndex: 5,
            }}>
              <div style={{
                fontSize: 'clamp(10px,1.1vw,12px)', letterSpacing: '0.5em',
                fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)', marginBottom: '28px',
                animation: 'fadeUp 0.8s ease both',
              }}>
                The Drones of Suburbia
              </div>
              <div style={{
                fontSize: 'clamp(36px, 6vw, 72px)',
                fontFamily: '"Anton", sans-serif',
                textTransform: 'uppercase', letterSpacing: '0.04em',
                lineHeight: 0.95, textAlign: 'center',
                background: 'linear-gradient(110deg, #b0c8d4 0%, #ffffff 30%, #a8c0cc 55%, #ffffff 80%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmerSlow 6s linear infinite',
                marginBottom: '24px',
              }}>
                Drone Cinema
              </div>
              <div style={{
                fontSize: '10px', letterSpacing: '0.35em',
                fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.2)',
                animation: 'pulse 2s ease-in-out infinite',
              }}>
                Select a film below to preview
              </div>
            </div>
          )}

          {/* Now playing label */}
          {activeFilmData && (
            <div style={{
              position: 'absolute', top: '20px', left: '50%',
              transform: 'translateX(-50%)', zIndex: 10,
              fontSize: '9px', letterSpacing: '0.5em', fontFamily: "'Space Mono', monospace",
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
              whiteSpace: 'nowrap',
            }}>
              ▶ Now Showing — {activeFilmData.title}
            </div>
          )}
        </div>

        {/* Film metadata strip */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px clamp(24px,6vw,80px)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{
            fontSize: '10px', letterSpacing: '0.3em',
            fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.25)',
          }}>
            Directed by Miss AL Simpson
          </div>
          <div style={{
            fontSize: '10px', letterSpacing: '0.3em',
            fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.2)',
          }}>
            Collected on SuperRare · Exhibited at Sotheby's
          </div>
        </div>
      </div>

      {/* ── WORLD PREMIERE ── */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Premiere film background — lightweight version */}
        <video
          src="/films/dd-jewellery-box-bg.mp4"
          muted loop playsInline autoPlay
          preload="auto"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            filter: 'grayscale(60%) contrast(1.08)',
            opacity: 0.4,
          }}
        />
        {/* Dark overlay for text readability */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(58,58,58,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(58,58,58,0.8) 100%)',
          zIndex: 1,
        }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 clamp(24px,6vw,80px)' }}>
          {/* Kicker */}
          <div style={{
            fontSize: 'clamp(10px,1vw,12px)', letterSpacing: '0.6em',
            fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
            color: 'rgba(200,230,255,0.5)', marginBottom: '40px',
            animation: 'fadeUp 0.8s ease both',
          }}>
            ◆ World Premiere ◆
          </div>

          {/* Film title */}
          <h2 style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: 'clamp(36px, 7vw, 90px)',
            textTransform: 'uppercase', letterSpacing: '0.04em',
            lineHeight: 0.95, margin: '0 0 32px',
            background: 'linear-gradient(110deg, #b0c8d4 0%, #ffffff 30%, #a8c0cc 55%, #ffffff 80%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'shimmerSlow 6s linear infinite, fadeUp 1s ease both 0.2s',
          }}>
            Diamond Drones<br />Are a Girl's<br />Best Friend™
          </h2>

          {/* Tagline */}
          <p style={{
            fontSize: 'clamp(14px,1.5vw,18px)',
            fontFamily: 'Georgia, serif', fontStyle: 'italic',
            color: 'rgba(255,255,255,0.45)', lineHeight: 1.8,
            margin: '0 0 48px', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto',
            animation: 'fadeUp 1s ease both 0.4s',
          }}>
            The final NYC Film and the closing track of The Drones of Suburbia Album.<br />
            Debuting here.
          </p>

          {/* CTA */}
          <button
            onClick={() => { playFilm(2); heroSectionRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
            style={{
              background: 'transparent',
              border: '1px solid rgba(200,230,255,0.4)',
              color: 'rgba(200,230,255,0.9)',
              padding: '18px 56px',
              fontSize: '11px', letterSpacing: '0.4em',
              textTransform: 'uppercase', fontFamily: "'Space Mono', monospace",
              cursor: 'pointer', transition: 'all 0.3s',
              animation: 'fadeUp 1s ease both 0.6s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(200,230,255,0.08)';
              e.currentTarget.style.borderColor = 'rgba(200,230,255,0.7)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(200,230,255,0.4)';
            }}
          >
            ▶ Watch the Premiere
          </button>
        </div>
      </section>

      {/* ── FILM STATEMENT ── */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: '1px',
        background: 'rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ background: '#3a3a3a', padding: 'clamp(48px,7vw,90px) clamp(24px,5vw,72px)' }}>
          <div style={{
            fontSize: '11px', letterSpacing: '0.4em', fontFamily: "'Space Mono', monospace",
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
            marginBottom: '24px',
          }}>
            The Films
          </div>
          <h2 style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: 'clamp(28px,4vw,52px)',
            textTransform: 'uppercase', letterSpacing: '0.04em',
            lineHeight: 0.95, margin: '0 0 28px',
            background: 'linear-gradient(110deg, #b0c8d4 0%, #ffffff 30%, #a8c0cc 55%, #ffffff 80%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'shimmerSlow 6s linear infinite',
          }}>
            Diamond Drones<br />Are a Girl's<br />Best Friend
          </h2>
          <p style={{
            fontSize: 'clamp(13px,1.3vw,16px)', lineHeight: 1.9,
            color: 'rgba(255,255,255,0.4)', fontFamily: 'Georgia, serif',
            fontStyle: 'italic', margin: 0,
          }}>
            {zone.description}
          </p>
        </div>

        <div style={{
          background: '#3a3a3a',
          padding: 'clamp(48px,7vw,90px) clamp(24px,5vw,72px)',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <div style={{
            fontSize: '11px', letterSpacing: '0.4em', fontFamily: "'Space Mono', monospace",
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
            marginBottom: '28px',
          }}>
            Edition Details
          </div>

          {[
            ['Format', 'Film / Digital Video'],
            ['Director', 'Miss AL Simpson'],
            ['Films', '4 Films'],
            ['Collected', 'SuperRare'],
            ['Exhibited', "Sotheby's · LA"],
            ['Soundtracks', 'The Drones of Suburbia album'],
          ].map(([k, v]) => (
            <div key={k} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              <span style={{
                fontSize: '10px', letterSpacing: '0.25em',
                fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)',
              }}>{k}</span>
              <span style={{
                fontSize: '11px', letterSpacing: '0.05em',
                fontFamily: "'Space Mono', monospace", color: 'rgba(255,255,255,0.6)',
                textAlign: 'right', maxWidth: '60%',
              }}>{v}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FILM GALLERY — each film as a card with video thumbnail ── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(24px,6vw,80px)' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          marginBottom: '48px',
        }}>
          <div>
            <div style={{
              fontSize: '11px', letterSpacing: '0.4em', fontFamily: "'Space Mono', monospace",
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
              marginBottom: '8px',
            }}>
              4 Films
            </div>
            <div style={{
              fontSize: 'clamp(18px,2.5vw,28px)',
              fontFamily: '"Anton", sans-serif',
              textTransform: 'uppercase', letterSpacing: '0.04em',
              color: 'rgba(255,255,255,0.8)',
            }}>
              The Complete Collection
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '2px',
          background: 'rgba(255,255,255,0.04)',
        }}>
          {FILMS.map((film, i) => {
            const hasVideo = !!film.file;
            const isActive = activeFilm === i;

            return (
              <div
                key={i}
                role={hasVideo ? 'button' : undefined}
                tabIndex={hasVideo ? 0 : undefined}
                aria-label={hasVideo ? `Play ${film.title}` : `${film.title} — coming soon`}
                onClick={() => hasVideo && playFilm(i)}
                onKeyDown={(e) => { if (hasVideo && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); playFilm(i); } }}
                onMouseEnter={() => setHoveredFilm(i)}
                onMouseLeave={() => setHoveredFilm(null)}
                style={{
                  background: isActive ? 'rgba(200,230,255,0.04)' : '#3a3a3a',
                  cursor: hasVideo ? 'pointer' : 'default',
                  transition: 'background 0.3s',
                  overflow: 'hidden',
                }}
              >
                {/* Video thumbnail / placeholder */}
                <div style={{
                  position: 'relative',
                  paddingTop: '56.25%',
                  background: '#1a1a1a',
                  overflow: 'hidden',
                }}>
                  {hasVideo ? (
                    <video
                      src={film.file}
                      muted
                      loop
                      playsInline
                      preload="none"
                      style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover',
                        filter: 'grayscale(50%) contrast(1.08)',
                        opacity: hoveredFilm === i ? 1 : 0.7,
                        transition: 'opacity 0.4s',
                      }}
                      onMouseEnter={e => { e.target.load(); e.target.play().catch(() => {}); }}
                      onMouseLeave={e => { e.target.pause(); e.target.currentTime = 0; }}
                    />
                  ) : (
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'linear-gradient(135deg, #1a1a1a, #252525)',
                    }}>
                      <div style={{
                        fontSize: '9px', letterSpacing: '0.3em',
                        fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.25)',
                      }}>
                        Coming Soon
                      </div>
                    </div>
                  )}

                  {/* Play indicator overlay */}
                  {hasVideo && hoveredFilm === i && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(0,0,0,0.3)',
                      pointerEvents: 'none',
                    }}>
                      <div style={{
                        width: '48px', height: '48px',
                        border: '1px solid rgba(255,255,255,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '16px', color: '#fff',
                        backdropFilter: 'blur(4px)',
                        background: 'rgba(0,0,0,0.4)',
                      }}>
                        ▶
                      </div>
                    </div>
                  )}

                  {/* Active indicator */}
                  {isActive && (
                    <div style={{
                      position: 'absolute', top: '10px', left: '10px',
                      fontSize: '8px', letterSpacing: '0.3em',
                      fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
                      color: 'rgba(200,230,255,0.7)',
                      background: 'rgba(0,0,0,0.6)',
                      padding: '4px 8px',
                      backdropFilter: 'blur(4px)',
                    }}>
                      ▶ Now Playing
                    </div>
                  )}
                </div>

                {/* Film info */}
                <div style={{ padding: '16px 20px' }}>
                  <div style={{
                    display: 'flex', alignItems: 'baseline', gap: '10px',
                    marginBottom: '4px',
                  }}>
                    <span style={{
                      fontSize: '10px', letterSpacing: '0.15em',
                      fontFamily: "'Space Mono', monospace",
                      color: isActive ? 'rgba(200,230,255,0.6)' : 'rgba(255,255,255,0.2)',
                    }}>
                      {film.num}
                    </span>
                    <span style={{
                      fontSize: 'clamp(12px,1.3vw,15px)',
                      fontFamily: '"Anton", sans-serif',
                      textTransform: 'uppercase', letterSpacing: '0.03em',
                      color: isActive ? 'rgba(200,230,255,0.9)' : hoveredFilm === i ? '#fff' : 'rgba(255,255,255,0.7)',
                      transition: 'color 0.2s',
                    }}>
                      {film.title}
                    </span>
                  </div>
                  <div style={{
                    fontSize: '9px', letterSpacing: '0.2em',
                    fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
                    color: hasVideo
                      ? (isActive ? 'rgba(200,230,255,0.4)' : 'rgba(255,255,255,0.15)')
                      : 'rgba(255,255,255,0.08)',
                  }}>
                    {hasVideo ? 'Film · SuperRare' : 'Film Coming Soon'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: 'clamp(48px,6vw,80px) clamp(24px,6vw,80px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: 'clamp(13px,1.4vw,16px)', lineHeight: 1.9,
          color: 'rgba(255,255,255,0.35)', fontFamily: 'Georgia, serif',
          fontStyle: 'italic', maxWidth: '480px', margin: '0 auto 36px',
        }}>
          The Diamond Drone films were collected on SuperRare and exhibited at Sotheby's.
          Their soundtracks became The Drones of Suburbia album.
        </p>
        <button
          onClick={() => navigate('/drones/studio')}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff', padding: '16px 48px',
            fontSize: '11px', letterSpacing: '0.35em',
            textTransform: 'uppercase', fontFamily: "'Space Mono', monospace",
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
          Listen to the Album →
        </button>
      </section>
    </div>
  );
}
