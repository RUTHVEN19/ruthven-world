import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ZONES, HERO_COPY, LORE, COLLECTOR_SET, MINT_CONFIG } from '../../config/dronesContent';

const keyframes = `
  * { cursor: none !important; }

  .diamond-cursor {
    position: fixed;
    width: 20px;
    height: 20px;
    pointer-events: none;
    z-index: 99999;
    transform: translate(-50%, -50%) rotate(45deg);
    border: 1.5px solid rgba(255,255,255,0.9);
    background: rgba(255,255,255,0.08);
    transition: transform 0.1s ease, width 0.2s ease, height 0.2s ease, background 0.2s ease;
    mix-blend-mode: difference;
  }
  .diamond-cursor.hovering {
    width: 32px;
    height: 32px;
    background: rgba(255,255,255,0.15);
  }

  @keyframes crystalShimmer {
    0%   { background-position: -300% center; }
    100% { background-position: 300% center; }
  }
  @keyframes shimmerSlow {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes glint1 {
    0%, 82%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
    88%           { opacity: 1; transform: scale(1) rotate(15deg); }
  }
  @keyframes glint2 {
    0%, 28%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
    38%           { opacity: 1; transform: scale(1) rotate(-10deg); }
  }
  @keyframes glint3 {
    0%, 58%, 100% { opacity: 0; transform: scale(0); }
    66%           { opacity: 0.9; transform: scale(1); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes floatDiamond {
    0%   { transform: translateY(100vh) rotate(45deg) scale(0.5); opacity: 0; }
    5%   { opacity: 0.4; }
    95%  { opacity: 0.2; }
    100% { transform: translateY(-20vh) rotate(225deg) scale(1.2); opacity: 0; }
  }
`;

// Floating diamond positions
const DIAMONDS = [
  { left: '8%',  delay: '0s',    duration: '14s', size: 10 },
  { left: '18%', delay: '3s',    duration: '18s', size: 7  },
  { left: '29%', delay: '6s',    duration: '12s', size: 14 },
  { left: '42%', delay: '1.5s',  duration: '20s', size: 8  },
  { left: '55%', delay: '8s',    duration: '15s', size: 11 },
  { left: '67%', delay: '4s',    duration: '17s', size: 6  },
  { left: '76%', delay: '10s',   duration: '13s', size: 13 },
  { left: '88%', delay: '2s',    duration: '19s', size: 9  },
  { left: '33%', delay: '12s',   duration: '16s', size: 5  },
  { left: '62%', delay: '7s',    duration: '11s', size: 12 },
];

export default function DronesGateway() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isCursorHovering, setIsCursorHovering] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const move = (e) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  useEffect(() => {
    const over = (e) => {
      const el = e.target;
      const isHoverable = el.closest('button, a, [data-hoverable]') ||
        el.style.cursor === 'pointer' || el.closest('[style*="cursor: pointer"]');
      setIsCursorHovering(!!isHoverable);
    };
    window.addEventListener('mouseover', over);
    return () => window.removeEventListener('mouseover', over);
  }, []);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (audioPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else {
      audioRef.current.play().then(() => setAudioPlaying(true)).catch(() => {});
    }
  };

  return (
    <div style={{ background: '#1a1a1a', minHeight: '100vh', color: '#fff', overflowX: 'hidden' }}>
      <style>{keyframes}</style>

      {/* ── DIAMOND CURSOR ── */}
      <div
        className={`diamond-cursor ${isCursorHovering ? 'hovering' : ''}`}
        style={{ left: cursorPos.x, top: cursorPos.y }}
      />

      {/* ── FLOATING DIAMOND PARTICLES ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
        {DIAMONDS.map((d, i) => (
          <div
            key={i}
            style={{
              position: 'absolute', left: d.left, bottom: '-30px',
              width: d.size, height: d.size,
              border: '1px solid rgba(255,255,255,0.25)',
              background: 'rgba(255,255,255,0.04)',
              transform: 'rotate(45deg)',
              animation: `floatDiamond ${d.duration} ${d.delay} linear infinite`,
            }}
          />
        ))}
      </div>

      {/* ── AMBIENT AUDIO ── */}
      <audio ref={audioRef} loop style={{ display: 'none' }}>
        <source src="/drones-ambient.m4a" type="audio/mp4" />
        <source src="/drones-hero.mp4" type="video/mp4" />
      </audio>

      {/* ── AUDIO TOGGLE ── */}
      <button
        data-hoverable
        onClick={toggleAudio}
        style={{
          position: 'fixed', bottom: '28px', right: '28px', zIndex: 100,
          background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.15)',
          color: audioPlaying ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
          fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.25em',
          textTransform: 'uppercase', padding: '10px 16px',
          backdropFilter: 'blur(12px)', transition: 'all 0.3s ease', cursor: 'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = audioPlaying ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)'; }}
      >
        {audioPlaying ? '◆ ▐▐ Sound' : '◆ ▶ Sound'}
      </button>

      {/* ── FULL BLEED HERO ── */}
      <div style={{
        position: 'relative', height: '100vh', minHeight: '600px',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <video autoPlay muted loop playsInline style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
          filter: 'grayscale(100%) contrast(1.05)', opacity: 0.5,
        }}>
          <source src="/drones-hero.mp4" type="video/mp4" />
        </video>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.6) 80%, rgba(0,0,0,1) 100%)',
        }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 20px' }}>
          {/* Logo */}
          <div style={{ marginBottom: '48px', animation: 'fadeUp 1s ease forwards' }}>
            <img
              src="/Translucent Logo.png"
              alt="The Drones of Suburbia"
              style={{ height: 'clamp(80px, 14vw, 160px)', margin: '0 auto', display: 'block' }}
            />
          </div>

          {/* Crystal title */}
          <div style={{ position: 'relative', display: 'inline-block', animation: 'fadeUp 1s ease 0.2s both' }}>
            <span style={{ position: 'absolute', top: '8%',  left: '10%',  color: '#fff', fontSize: '20px', animation: 'glint1 4s ease-in-out infinite', pointerEvents: 'none', zIndex: 3 }}>✦</span>
            <span style={{ position: 'absolute', top: '15%', right: '6%',  color: '#e0f0ff', fontSize: '14px', animation: 'glint2 5s ease-in-out infinite', pointerEvents: 'none', zIndex: 3 }}>✦</span>
            <span style={{ position: 'absolute', bottom: '12%', left: '30%', color: '#fff', fontSize: '10px', animation: 'glint3 3.5s ease-in-out infinite', pointerEvents: 'none', zIndex: 3 }}>✦</span>
            <span style={{ position: 'absolute', top: '0%', right: '22%', color: '#c8e8ff', fontSize: '8px', animation: 'glint1 6s ease-in-out infinite 1s', pointerEvents: 'none', zIndex: 3 }}>◆</span>
            <span style={{ position: 'absolute', bottom: '0%', right: '15%', color: '#fff', fontSize: '16px', animation: 'glint2 4.5s ease-in-out infinite 0.5s', pointerEvents: 'none', zIndex: 3 }}>✦</span>
            <div style={{
              fontSize: 'clamp(60px, 14vw, 160px)',
              fontWeight: '400', letterSpacing: '0.05em', lineHeight: 0.88,
              fontFamily: '"Anton", "Arial Black", sans-serif',
              textTransform: 'uppercase',
              background: 'linear-gradient(110deg, #b0c8d4 0%, #ddeef4 12%, #ffffff 22%, #a8c0cc 33%, #d8ecf4 44%, #ffffff 52%, #b4ccd8 62%, #e0f0f6 73%, #ffffff 82%, #a4bcc8 100%)',
              backgroundSize: '300% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              animation: 'crystalShimmer 5s linear infinite',
            }}>
              {HERO_COPY.headline[0]}<br />{HERO_COPY.headline[1]}<br />{HERO_COPY.headline[2]}<sup style={{ fontSize: '0.35em', verticalAlign: 'super', WebkitTextFillColor: 'rgba(255,255,255,0.6)', backgroundClip: 'unset', WebkitBackgroundClip: 'unset' }}>™</sup>
            </div>
          </div>

          {/* Edition kicker */}
          <div style={{
            marginTop: '28px',
            fontSize: 'clamp(11px, 1.4vw, 13px)', letterSpacing: '0.35em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)',
            fontFamily: 'monospace', animation: 'fadeUp 1s ease 0.4s both',
          }}>
            {HERO_COPY.kicker}
          </div>

          {/* Primary CTA */}
          <div style={{ animation: 'fadeUp 1s ease 0.55s both', marginTop: '36px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              data-hoverable
              onClick={() => navigate('/drones/mint')}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.5)',
                color: '#fff', padding: '16px 40px',
                fontSize: '11px', letterSpacing: '0.35em',
                textTransform: 'uppercase', fontFamily: 'monospace',
                cursor: 'pointer', backdropFilter: 'blur(8px)',
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.borderColor = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; }}
            >
              ✦ {HERO_COPY.cta}
            </button>
            <div style={{
              display: 'flex', alignItems: 'center',
              fontSize: '11px', letterSpacing: '0.25em',
              fontFamily: 'monospace', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
            }}>
              {HERO_COPY.editionLine}
            </div>
          </div>

          {/* Scroll hint */}
          <div style={{
            position: 'absolute', bottom: '-80px', left: '50%', transform: 'translateX(-50%)',
            fontSize: '11px', letterSpacing: '0.3em',
            color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace',
            textTransform: 'uppercase', animation: 'fadeUp 1s ease 0.8s both',
          }}>
            Explore ↓
          </div>
        </div>
      </div>

      {/* ── EDITION STRIP ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}>
        {COLLECTOR_SET.map((item, i) => (
          <div key={i} style={{
            padding: 'clamp(20px,3vw,32px) clamp(16px,3vw,28px)',
            borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none',
            display: 'flex', flexDirection: 'column', gap: '6px',
          }}>
            <div style={{ fontSize: '18px', color: 'rgba(200,230,255,0.5)' }}>{item.icon}</div>
            <div style={{
              fontSize: 'clamp(11px,1.2vw,13px)',
              fontFamily: '"Anton", sans-serif',
              textTransform: 'uppercase', letterSpacing: '0.04em',
              color: 'rgba(255,255,255,0.7)',
            }}>
              {item.label}
            </div>
            <div style={{
              fontSize: '10px', letterSpacing: '0.1em',
              fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)',
              lineHeight: 1.6,
            }}>
              {item.detail}
            </div>
          </div>
        ))}
      </div>

      {/* ── FOUR ZONES ── */}
      <div>
        {ZONES.map((zone, i) => (
          <div
            key={zone.slug}
            onClick={() => navigate(`/drones/${zone.slug}`)}
            onMouseEnter={() => setHovered(zone.slug)}
            onMouseLeave={() => setHovered(null)}
            data-hoverable
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateAreas: i % 2 === 0 ? '"image text"' : '"text image"',
              minHeight: '70vh',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
              background: hovered === zone.slug ? 'rgba(255,255,255,0.02)' : 'transparent',
              transition: 'background 0.4s',
            }}
          >
            {/* Image panel */}
            <div style={{ gridArea: 'image', position: 'relative', overflow: 'hidden', minHeight: '55vh' }}>
              <img
                src={zone.image}
                alt={zone.title}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: 'center',
                  filter: 'grayscale(100%) contrast(1.15)',
                  transition: 'transform 0.8s ease',
                  transform: hovered === zone.slug ? 'scale(1.04)' : 'scale(1)',
                }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: hovered === zone.slug ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.3)',
                transition: 'background 0.4s',
              }} />
              <div style={{
                position: 'absolute', top: '28px', left: '28px',
                fontSize: '11px', letterSpacing: '0.3em',
                fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)',
              }}>
                {zone.numeral}
              </div>
            </div>

            {/* Text panel */}
            <div style={{
              gridArea: 'text',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              padding: 'clamp(40px, 6vw, 100px)',
              borderLeft: i % 2 === 0 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              borderRight: i % 2 === 0 ? 'none' : '1px solid rgba(255,255,255,0.07)',
            }}>
              <div style={{
                fontSize: '11px', letterSpacing: '0.35em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
                fontFamily: 'monospace', marginBottom: '20px',
              }}>
                {zone.subtitle}
              </div>
              <div style={{
                fontSize: 'clamp(28px, 4.5vw, 56px)',
                fontWeight: '400', lineHeight: 0.95,
                letterSpacing: '0.02em', textTransform: 'uppercase',
                marginBottom: '28px',
                fontFamily: '"Anton", "Arial Black", sans-serif',
                color: hovered === zone.slug ? '#fff' : 'rgba(255,255,255,0.9)',
                transition: 'color 0.3s',
              }}>
                {zone.title}
              </div>
              <div style={{
                fontSize: 'clamp(14px, 1.4vw, 17px)', lineHeight: 1.8,
                color: 'rgba(255,255,255,0.45)',
                fontFamily: 'Georgia, serif', fontStyle: 'italic',
                maxWidth: '380px', marginBottom: '44px',
              }}>
                {zone.description}
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                fontSize: '11px', letterSpacing: '0.3em',
                textTransform: 'uppercase', fontFamily: 'monospace',
                color: hovered === zone.slug ? '#fff' : 'rgba(255,255,255,0.3)',
                transition: 'color 0.3s',
                paddingBottom: '2px',
                borderBottom: `1px solid ${hovered === zone.slug ? 'rgba(255,255,255,0.4)' : 'transparent'}`,
              }}>
                Enter <span style={{ fontSize: '16px', letterSpacing: 0 }}>→</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── LORE SECTION ── */}
      <div style={{
        padding: 'clamp(80px,10vw,140px) clamp(24px,6vw,100px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center',
      }}>
        <div>
          <div style={{
            fontSize: '11px', letterSpacing: '0.4em', fontFamily: 'monospace',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: '24px',
          }}>
            {LORE.title}
          </div>
          {LORE.paragraphs.map((p, i) => (
            <p key={i} style={{
              fontSize: 'clamp(14px,1.5vw,18px)', lineHeight: 2,
              color: i === 0 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.35)',
              fontFamily: 'Georgia, serif', fontStyle: 'italic',
              marginBottom: '20px',
            }}>
              {p}
            </p>
          ))}
        </div>
        <div>
          <div style={{
            fontSize: '11px', letterSpacing: '0.4em', fontFamily: 'monospace',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: '24px',
          }}>
            Artist
          </div>
          <div style={{
            fontSize: 'clamp(18px,2.5vw,28px)',
            fontFamily: '"Anton", sans-serif',
            textTransform: 'uppercase', letterSpacing: '0.04em',
            color: 'rgba(255,255,255,0.75)', marginBottom: '16px',
          }}>
            {LORE.artist.name}
          </div>
          <p style={{
            fontSize: 'clamp(13px,1.3vw,15px)', lineHeight: 1.9,
            color: 'rgba(255,255,255,0.35)', fontFamily: 'Georgia, serif',
            fontStyle: 'italic', marginBottom: '32px',
          }}>
            {LORE.artist.bio}
          </p>
        </div>
      </div>

      {/* ── FINAL CTA BANNER ── */}
      <div style={{
        padding: 'clamp(80px,10vw,130px) clamp(24px,6vw,80px)',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(0,0,0,0.3)',
      }}>
        <div style={{
          fontSize: 'clamp(10px,1vw,12px)', letterSpacing: '0.5em',
          fontFamily: 'monospace', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.2)', marginBottom: '28px',
        }}>
          200 Editions · 1 ETH · Ethereum
        </div>
        <div style={{
          fontSize: 'clamp(36px,7vw,96px)',
          fontFamily: '"Anton", sans-serif',
          textTransform: 'uppercase', letterSpacing: '0.04em',
          lineHeight: 0.9, marginBottom: '40px',
          background: 'linear-gradient(110deg, #b0c8d4 0%, #ddeef4 12%, #ffffff 22%, #a8c0cc 33%, #d8ecf4 44%, #ffffff 52%, #b4ccd8 62%, #e0f0f6 73%, #ffffff 82%)',
          backgroundSize: '300% auto',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          animation: 'crystalShimmer 6s linear infinite',
        }}>
          Mint the<br />Collector Set
        </div>
        <button
          data-hoverable
          onClick={() => navigate('/drones/mint')}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.35)',
            color: '#fff', padding: '18px 56px',
            fontSize: '11px', letterSpacing: '0.4em',
            textTransform: 'uppercase', fontFamily: 'monospace',
            cursor: 'pointer', transition: 'all 0.3s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; }}
        >
          ✦ Enter
        </button>
      </div>
    </div>
  );
}
