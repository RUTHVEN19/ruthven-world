import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZONES } from '../../config/dronesContent';

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

const STILLS = [
  '/dd-cinema.png',
  '/dd-shop.png',
  '/dd-gallery.png',
  '/dd-cinema.png',
  '/dd-shop.png',
];

export default function DroneCinema() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [selectedStill, setSelectedStill] = useState(null);
  const [hoveredStill, setHoveredStill] = useState(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <style>{keyframes}</style>

      {/* ── FILM PLAYER HERO ── */}
      <div style={{
        position: 'relative',
        background: '#000',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Scanline effect overlay */}
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

        {/* Aspect ratio container — cinematic 2.39:1 */}
        <div style={{
          position: 'relative',
          paddingTop: '41.8%', // 2.39:1
          background: '#000',
          overflow: 'hidden',
          minHeight: '320px',
        }}>
          <video
            ref={videoRef}
            src="/drones-hero.mp4"
            loop
            playsInline
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center',
              filter: 'grayscale(100%) contrast(1.05)',
            }}
          />

          {/* Overlay when paused */}
          {!playing && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.55)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              zIndex: 5,
            }}>
              <div style={{
                fontSize: 'clamp(10px,1.1vw,12px)', letterSpacing: '0.5em',
                fontFamily: 'monospace', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)', marginBottom: '28px',
                animation: 'fadeUp 0.8s ease both',
              }}>
                Diamond Drones Are a Girl's Best Friend™
              </div>
              <button
                onClick={togglePlay}
                style={{
                  width: '72px', height: '72px',
                  border: '1px solid rgba(255,255,255,0.4)',
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff', fontSize: '22px',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.6)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                }}
              >
                ▶
              </button>
              <div style={{
                marginTop: '24px',
                fontSize: '10px', letterSpacing: '0.35em',
                fontFamily: 'monospace', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.2)',
                animation: 'pulse 2s ease-in-out infinite',
              }}>
                Preview — Frequency Edit
              </div>
            </div>
          )}

          {/* Playing — pause control */}
          {playing && (
            <button
              onClick={togglePlay}
              style={{
                position: 'absolute', bottom: '20px', right: '20px',
                zIndex: 10,
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.6)',
                padding: '8px 16px',
                fontSize: '10px', letterSpacing: '0.3em',
                fontFamily: 'monospace', textTransform: 'uppercase',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
              }}
            >
              ▐▐ Pause
            </button>
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
            fontFamily: 'monospace', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.25)',
          }}>
            Directed by Miss AL Simpson
          </div>
          <div style={{
            fontSize: '10px', letterSpacing: '0.3em',
            fontFamily: 'monospace', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.2)',
          }}>
            200 Editions · Ethereum
          </div>
        </div>
      </div>

      {/* ── FILM STATEMENT ── */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1px',
        background: 'rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ background: '#0a0a0a', padding: 'clamp(48px,7vw,90px) clamp(24px,5vw,72px)' }}>
          <div style={{
            fontSize: '11px', letterSpacing: '0.4em', fontFamily: 'monospace',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
            marginBottom: '24px',
          }}>
            The Film
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
            fontStyle: 'italic', margin: '0 0 0',
          }}>
            {zone.description}
          </p>
        </div>

        <div style={{
          background: '#0a0a0a',
          padding: 'clamp(48px,7vw,90px) clamp(24px,5vw,72px)',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <div style={{
            fontSize: '11px', letterSpacing: '0.4em', fontFamily: 'monospace',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
            marginBottom: '28px',
          }}>
            Edition Details
          </div>

          {[
            ['Format', 'Short Film / Digital Video'],
            ['Director', 'Miss AL Simpson'],
            ['Track', "Diamond Drones Are a Girl's Best Friend"],
            ['Editions', '200 worldwide'],
            ['Chain', 'Ethereum'],
            ['Delivery', 'NFT — included in Collector Set'],
          ].map(([k, v]) => (
            <div key={k} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '12px 0',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              <span style={{
                fontSize: '10px', letterSpacing: '0.25em',
                fontFamily: 'monospace', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)',
              }}>{k}</span>
              <span style={{
                fontSize: '11px', letterSpacing: '0.05em',
                fontFamily: 'monospace', color: 'rgba(255,255,255,0.6)',
                textAlign: 'right', maxWidth: '60%',
              }}>{v}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── STILLS CAROUSEL ── */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(24px,6vw,80px)' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          marginBottom: '32px',
        }}>
          <div>
            <div style={{
              fontSize: '11px', letterSpacing: '0.4em', fontFamily: 'monospace',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
              marginBottom: '8px',
            }}>
              Cinematic Stills
            </div>
            <div style={{
              fontSize: 'clamp(18px,2.5vw,28px)',
              fontFamily: '"Anton", sans-serif',
              textTransform: 'uppercase', letterSpacing: '0.04em',
              color: 'rgba(255,255,255,0.8)',
            }}>
              From the World
            </div>
          </div>
          <div style={{
            fontSize: '10px', letterSpacing: '0.25em',
            fontFamily: 'monospace', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.2)',
          }}>
            Preview · Full stills with your Collector Set
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2px', overflowX: 'auto', paddingBottom: '8px' }}>
          {STILLS.map((src, i) => (
            <div
              key={i}
              onClick={() => setSelectedStill(selectedStill === i ? null : i)}
              onMouseEnter={() => setHoveredStill(i)}
              onMouseLeave={() => setHoveredStill(null)}
              style={{
                flexShrink: 0,
                width: selectedStill === i ? '45vw' : hoveredStill === i ? '22vw' : '18vw',
                minWidth: '120px',
                height: 'clamp(200px, 28vw, 380px)',
                overflow: 'hidden', position: 'relative',
                transition: 'width 0.5s ease',
                cursor: 'pointer',
              }}
            >
              <img
                src={src}
                alt=""
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: 'center',
                  filter: 'grayscale(100%) contrast(1.1)',
                  transition: 'transform 0.6s ease',
                  transform: hoveredStill === i ? 'scale(1.05)' : 'scale(1)',
                }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: selectedStill === i ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.35)',
                transition: 'background 0.3s',
              }} />
              <div style={{
                position: 'absolute', bottom: '12px', left: '12px',
                fontSize: '9px', letterSpacing: '0.25em',
                fontFamily: 'monospace', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.35)',
              }}>
                Still {String(i + 1).padStart(2, '0')}
              </div>
            </div>
          ))}
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
          One film edition is included in every Collector Set.
          200 editions worldwide. 1 ETH.
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
