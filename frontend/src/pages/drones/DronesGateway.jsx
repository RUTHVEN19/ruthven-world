import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

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

const ZONES = [
  {
    slug: 'diamond-shop',
    label: 'I',
    title: 'THE DIAMOND SHOP',
    subtitle: '100 NFTs · Choose Your Drone',
    description: 'Diamond drones. Couture obsession. 100 hand-selected video NFTs — each one a singular object of desire.',
    image: '/dd-shop.png',
  },
  {
    slug: 'cinema',
    label: 'II',
    title: 'THE CINEMA',
    subtitle: '10 NFTs · Film + Soundtrack',
    description: 'Ten reels. Ten scores. A private cinema of diamond drone film — each with an original soundtrack.',
    image: '/dd-cinema.png',
  },
  {
    slug: 'gallery',
    label: 'III',
    title: 'THE ART GALLERY',
    subtitle: '1000 NFTs · Blind Mint',
    description: 'One thousand stills from the diamond drone world. Blind mint. Pure chance. Pure image.',
    image: '/dd-gallery.png',
  },
];

// Floating diamond positions (fixed, deterministic — no random on every render)
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

  // Track cursor position
  useEffect(() => {
    const move = (e) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  // Detect hoverable elements for cursor expand
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
              position: 'absolute',
              left: d.left,
              bottom: '-30px',
              width: d.size,
              height: d.size,
              border: '1px solid rgba(255,255,255,0.25)',
              background: 'rgba(255,255,255,0.04)',
              transform: 'rotate(45deg)',
              animation: `floatDiamond ${d.duration} ${d.delay} linear infinite`,
            }}
          />
        ))}
      </div>

      {/* ── AMBIENT AUDIO ── */}
      <audio ref={audioRef} src="/drones-hero.mp4" loop style={{ display: 'none' }} />

      {/* ── AUDIO TOGGLE ── */}
      <button
        data-hoverable
        onClick={toggleAudio}
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          zIndex: 100,
          background: 'rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: audioPlaying ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
          fontFamily: 'monospace',
          fontSize: '11px',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          padding: '10px 16px',
          backdropFilter: 'blur(12px)',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = '#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = audioPlaying ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)'; }}
      >
        {audioPlaying ? '◆ ▐▐ Sound' : '◆ ▶ Sound'}
      </button>

      {/* ── FULL BLEED HERO ── */}
      <div style={{
        position: 'relative',
        height: '100vh',
        minHeight: '600px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Hero background video */}
        <video
          autoPlay muted loop playsInline
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            filter: 'grayscale(100%) contrast(1.05)',
            opacity: 0.5,
          }}
        >
          <source src="/drones-hero.mp4" type="video/mp4" />
        </video>

        {/* Dark gradient overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.6) 80%, rgba(0,0,0,1) 100%)',
        }} />

        {/* Film grain */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`,
          pointerEvents: 'none',
          opacity: 0.4,
        }} />

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 20px' }}>

          {/* Logo */}
          <div style={{ marginBottom: '48px', animation: 'fadeUp 1s ease forwards' }}>
            <img
              src="/Translucent Logo.png"
              alt="The Drones of Suburbia"
              style={{
                height: 'clamp(80px, 14vw, 160px)',
                margin: '0 auto',
                display: 'block',
              }}
            />
          </div>

          {/* DIAMOND DRONES title */}
          <div style={{
            position: 'relative',
            display: 'inline-block',
            animation: 'fadeUp 1s ease 0.2s both',
          }}>
            {/* Sparkle glints */}
            <span style={{ position: 'absolute', top: '8%', left: '10%', color: '#fff', fontSize: '20px', animation: 'glint1 4s ease-in-out infinite', pointerEvents: 'none', zIndex: 3 }}>✦</span>
            <span style={{ position: 'absolute', top: '15%', right: '6%', color: '#e0f0ff', fontSize: '14px', animation: 'glint2 5s ease-in-out infinite', pointerEvents: 'none', zIndex: 3 }}>✦</span>
            <span style={{ position: 'absolute', bottom: '12%', left: '30%', color: '#fff', fontSize: '10px', animation: 'glint3 3.5s ease-in-out infinite', pointerEvents: 'none', zIndex: 3 }}>✦</span>
            <span style={{ position: 'absolute', top: '0%', right: '22%', color: '#c8e8ff', fontSize: '8px', animation: 'glint1 6s ease-in-out infinite 1s', pointerEvents: 'none', zIndex: 3 }}>◆</span>
            <span style={{ position: 'absolute', bottom: '0%', right: '15%', color: '#fff', fontSize: '16px', animation: 'glint2 4.5s ease-in-out infinite 0.5s', pointerEvents: 'none', zIndex: 3 }}>✦</span>

            <div style={{
              fontSize: 'clamp(60px, 14vw, 160px)',
              fontWeight: '400',
              letterSpacing: '0.05em',
              lineHeight: 0.88,
              fontFamily: '"Anton", "Arial Black", sans-serif',
              textTransform: 'uppercase',
              background: 'linear-gradient(110deg, #b0c8d4 0%, #ddeef4 12%, #ffffff 22%, #a8c0cc 33%, #d8ecf4 44%, #ffffff 52%, #b4ccd8 62%, #e0f0f6 73%, #ffffff 82%, #a4bcc8 100%)',
              backgroundSize: '300% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'crystalShimmer 5s linear infinite',
            }}>
              DIAMOND DRONES<br />ARE A GIRL'S<br />BEST FRIEND<sup style={{fontSize:'0.35em', verticalAlign:'super', WebkitTextFillColor:'rgba(255,255,255,0.6)', backgroundClip:'unset', WebkitBackgroundClip:'unset'}}>™</sup>
            </div>
          </div>

          {/* Subtitle */}
          <div style={{
            marginTop: '32px',
            fontSize: 'clamp(11px, 1.4vw, 13px)',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
            fontFamily: 'monospace',
            animation: 'fadeUp 1s ease 0.4s both',
          }}>
            The Drones of Suburbia — NYC · A Drop in Three Acts
          </div>

          {/* Scroll hint */}
          <div style={{
            position: 'absolute',
            bottom: '-80px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '11px',
            letterSpacing: '0.3em',
            color: 'rgba(255,255,255,0.25)',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
            animation: 'fadeUp 1s ease 0.8s both',
          }}>
            Scroll ↓
          </div>
        </div>
      </div>

      {/* ── THREE ZONES ── */}
      <div>
        {ZONES.map((zone, i) => (
          <div
            key={zone.slug}
            onClick={() => navigate(`/drones/${zone.slug}`)}
            onMouseEnter={() => setHovered(zone.slug)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateAreas: i % 2 === 0 ? '"image text"' : '"text image"',
              minHeight: '75vh',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
              background: hovered === zone.slug ? 'rgba(255,255,255,0.02)' : 'transparent',
              transition: 'background 0.4s',
            }}
          >
            {/* Image */}
            <div style={{ gridArea: 'image', position: 'relative', overflow: 'hidden', minHeight: '60vh' }}>
              <img
                src={zone.image}
                alt={zone.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
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
                {zone.label}
              </div>
            </div>

            {/* Text */}
            <div style={{
              gridArea: 'text',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
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
                fontSize: 'clamp(30px, 4.5vw, 56px)',
                fontWeight: '400',
                lineHeight: 0.95,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                marginBottom: '28px',
                fontFamily: '"Anton", "Arial Black", sans-serif',
                color: hovered === zone.slug ? '#fff' : 'rgba(255,255,255,0.9)',
                transition: 'color 0.3s',
              }}>
                {zone.title}
              </div>

              <div style={{
                fontSize: 'clamp(14px, 1.4vw, 17px)',
                lineHeight: 1.8,
                color: 'rgba(255,255,255,0.45)',
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                maxWidth: '380px',
                marginBottom: '44px',
              }}>
                {zone.description}
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '11px',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
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

      {/* ── FOOTER ── */}
      <div style={{
        textAlign: 'center',
        padding: '80px 40px',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}>
        <p style={{
          fontSize: 'clamp(13px, 1.4vw, 16px)',
          lineHeight: 2,
          color: 'rgba(255,255,255,0.2)',
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
          maxWidth: '520px',
          margin: '0 auto',
          letterSpacing: '0.02em',
        }}>
          Diamonds. Drones. Obsession. NYC.<br />
          Diamond Drones Are a Girl's Best Friend™ — The Drones of Suburbia.
        </p>
      </div>
    </div>
  );
}
