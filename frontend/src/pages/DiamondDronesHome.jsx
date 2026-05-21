import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// ── Vault artwork paths for cycling grid (48 images = 8×6 grid) ──────────────
const VAULT_IMAGES = [
  '/vault/1.png', '/vault/50.png', '/vault/100.png', '/vault/150.png',
  '/vault/200.png', '/vault/250.png', '/vault/300.png', '/vault/350.png',
  '/vault/400.png', '/vault/450.png', '/vault/500.png', '/vault/550.png',
  '/vault/600.png', '/vault/650.png', '/vault/700.png', '/vault/750.png',
  '/vault/800.png', '/vault/850.png', '/vault/900.png', '/vault/950.png',
  '/vault/420.png', '/vault/280.png', '/vault/530.png', '/vault/680.png',
  '/vault/85.png', '/vault/175.png', '/vault/220.png', '/vault/310.png',
  '/vault/460.png', '/vault/520.png', '/vault/570.png', '/vault/630.png',
  '/vault/720.png', '/vault/770.png', '/vault/820.png', '/vault/870.png',
  '/vault/910.png', '/vault/940.png', '/vault/960.png', '/vault/980.png',
  '/vault/340.png', '/vault/480.png', '/vault/700.png', '/vault/880.png',
  '/vault/930.png', '/vault/990.png', '/vault/860.png', '/vault/840.png',
];

// ── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:        '#0a0a0c',
  bg2:       '#111114',
  bg3:       '#16161a',
  line:      '#2a2a30',
  text:      '#e8e8ec',
  textDim:   '#8a8a92',
  textFaint: '#4a4a52',
  ice:       '#d9e6f0',
  iceBright: '#e9f1f8',
};

const font = {
  display: "'Oswald', sans-serif",
  body:    "'Crimson Pro', Georgia, serif",
  mono:    "'JetBrains Mono', monospace",
};

// ── Shared inline styles ─────────────────────────────────────────────────────
const mono = {
  fontFamily: font.mono,
  fontStyle: 'normal',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  fontSize: '0.7rem',
  color: C.textDim,
};

const overline = { ...mono, fontSize: '0.65rem', color: C.textFaint };

const sectionHeading = {
  fontFamily: font.display,
  fontWeight: 700,
  fontSize: 'clamp(2rem, 4.5vw, 4rem)',
  lineHeight: 1,
  textTransform: 'uppercase',
  letterSpacing: '-0.005em',
  color: C.iceBright,
  marginBottom: '1.5rem',
};

const sectionLead = {
  fontFamily: font.body,
  fontStyle: 'italic',
  fontSize: 'clamp(1.05rem, 1.5vw, 1.3rem)',
  color: C.textDim,
  maxWidth: '720px',
  marginBottom: '4rem',
  lineHeight: 1.6,
};

const btn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.65rem 1.2rem',
  border: `1px solid ${C.line}`,
  background: 'transparent',
  color: C.text,
  fontFamily: font.display,
  fontStyle: 'normal',
  fontSize: '0.7rem',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  textDecoration: 'none',
  transition: 'all 0.2s',
};

const btnPrimary = { ...btn, borderColor: C.ice, background: 'rgba(217,230,240,0.04)' };

// ── Drop data ────────────────────────────────────────────────────────────────
const DROPS = [
  {
    overline: '1,000 Unique Digital Diamonds',
    name: 'Diamond Drones',
    hasTM: true,
    zone: 'The Vault',
    desc: 'One thousand unique digital diamonds, cut across five rarity tiers. Enter the vault where the collection rests.',
    tags: ['Brilliant', 'Princess', 'Marquise', 'Rose', 'Baguette'],
    cta: 'Enter the Vault',
    href: '/drones/vault',
    images: ['/vault/1.png', '/vault/420.png', '/vault/850.png'],
  },
  {
    overline: '1/1 Artworks · 120',
    name: 'Drone Blondes',
    zone: 'The Lounge',
    desc: 'One hundred and twenty unique 1/1 artworks. Machine-trained Ink Interventions, worked over by hand. No two alike.',
    tags: ['Ink Intervention', '1/1', 'Hand-Worked'],
    cta: 'Enter the Lounge',
    href: '/drones/lounge',
    images: ['/marilyns/web/Drone Blonde 5.jpg', '/marilyns/web/Drone Blonde 12.jpg', '/marilyns/web/Drone Blonde 21.jpg'],
    bgVideo: '/films/dd-diamond-drone-lounge-bg.mp4',
  },
  {
    overline: '11 Tracks',
    name: 'The Album',
    zone: 'The Recording Studio',
    desc: <>The complete <em>Drones of Suburbia&#8482;</em> soundtrack. 11 original tracks by Miss AL Simpson.</>,
    tags: ['11 Tracks', 'MP3 320kbps'],
    cta: 'Enter the Studio',
    href: '/drones/studio',
    images: ['/diamond-drones-cinema.png'],
    bgVideo: '/films/dd-recording-studio.mp4',
  },
];

// ── Hero film cycle (all four Diamond Drone films) ───────────────────────────
const HERO_FILMS = [
  '/films/dd-jewellery-box.mp4',
  '/films/dd-recording-studio.mp4',
  '/films/dd-the-vault.mp4',
  '/films/dd-diamond-drone-lounge-bg.mp4',
];

// ── Film data ────────────────────────────────────────────────────────────────
const FILMS = [
  { num: 'I',   name: 'The Recording Studio',      sub: 'where the track was born',      video: '/films/dd-recording-studio.mp4' },
  { num: 'II',  name: 'The Jewellery Box',          sub: 'where the diamonds were set',   video: '/films/dd-jewellery-box.mp4' },
  { num: 'III', name: 'The Vault',                  sub: 'where the collection rests',    video: '/films/dd-the-vault.mp4' },
  { num: 'IV',  name: 'The Diamond Drone Lounge',   sub: 'where glamour took flight',     video: '/films/dd-diamond-drone-lounge-bg.mp4' },
];

// ── Component ────────────────────────────────────────────────────────────────
// Renders inside DronesWorld (which provides nav + footer), so no nav/footer here.
export default function DiamondDronesHome() {
  const [activeFilm, setActiveFilm] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef(null);

  // Cycle through hero films every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFilm(prev => (prev + 1) % HERO_FILMS.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-play audio on first user interaction
  useEffect(() => {
    const startAudio = () => {
      if (audioRef.current && !audioRef.current.playing) {
        audioRef.current.volume = 0.25;
        audioRef.current.play().then(() => setAudioPlaying(true)).catch(() => {});
      }
      document.removeEventListener('click', startAudio);
    };
    document.addEventListener('click', startAudio);
    return () => document.removeEventListener('click', startAudio);
  }, []);

  const toggleAudio = useCallback(() => {
    if (!audioRef.current) return;
    if (audioPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else {
      audioRef.current.volume = 0.25;
      audioRef.current.play().then(() => setAudioPlaying(true)).catch(() => {});
    }
  }, [audioPlaying]);

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: font.body, fontStyle: 'italic', lineHeight: 1.6, overflowX: 'hidden', scrollBehavior: 'smooth' }}>
      {/* ── Diamond Drones audio — loops on repeat ── */}
      <audio ref={audioRef} src="/marilyns/diamond-drones.mp3" loop preload="auto" />

      {/* ── Music play/pause button — fixed bottom left ── */}
      <button
        onClick={toggleAudio}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '16px',
          zIndex: 50,
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '4px',
          color: '#fff',
          fontFamily: font.mono,
          fontSize: '10px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          padding: '6px 12px',
          cursor: 'pointer',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.3s ease',
        }}
      >
        <span style={{ fontSize: '14px' }}>{audioPlaying ? '\u23F8' : '\u266B'}</span>
        {audioPlaying ? 'Pause' : 'Play Music'}
      </button>

      <Helmet>
        <title>Diamond Drones Are a Girl's Best Friend — A digital diamond house. Native to Ethereum.</title>
        <meta name="description" content="DIAMOND DRONES™ — A digital diamond house by Miss AL Simpson. 1000 Diamond Drones, 120 Drone Blondes, The Album. Exhibited at Sotheby's. Powered by the Diamond Engine on Ethereum." />
        <meta property="og:title" content="DIAMOND DRONES™ — Are a Girl's Best Friend" />
        <meta property="og:description" content="A digital diamond house. 1000 Diamond Drones, 120 Drone Blondes, 11-track album. Exhibited at Sotheby's." />
        <meta property="og:image" content="https://diamonddrones.world/og-image.png" />
        <meta property="og:url" content="https://diamonddrones.world/drones" />
        <link rel="canonical" href="https://diamonddrones.world/drones" />
      </Helmet>

      {/* ═══ HERO ═══ */}
      <header style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        textAlign: 'center',
        padding: '4rem 2rem 4rem',
        position: 'relative',
        background: C.bg,
        overflow: 'hidden',
      }}>
        {/* All hero films mounted — crossfade via opacity */}
        {HERO_FILMS.map((film, i) => (
          <video
            key={film}
            autoPlay muted loop playsInline
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', pointerEvents: 'none',
              transformOrigin: '50% 40%',
              opacity: i === activeFilm ? 0.7 : 0,
              transition: 'opacity 2s ease-in-out',
            }}
          >
            <source src={film} type="video/mp4" />
          </video>
        ))}

        {/* Dark overlay for text legibility */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.5) 100%)',
        }} />

        <div className="dd-hero-content" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 className="dd-hero-title" style={{
          fontFamily: '"Anton", "Impact", sans-serif', fontWeight: 400, fontStyle: 'normal',
          fontSize: 'clamp(4rem, 14vw, 12rem)', lineHeight: 0.95, letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: '2rem', maxWidth: '1100px',
        }}>
          DIAMOND<br />DRONES<span className="dd-hero-tm">™</span>
        </h1>

        <p style={{
          fontFamily: font.body, fontStyle: 'italic',
          fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: C.ice,
          marginBottom: '1rem', fontWeight: 400,
        }}>
          Are a Girl's Best Friend
        </p>

        {/* Sotheby's credential */}
        <p style={{
          fontFamily: font.body, fontStyle: 'italic',
          fontSize: 'clamp(1rem, 1.4vw, 1.15rem)', color: C.textDim,
          marginBottom: '0.5rem', maxWidth: '480px', lineHeight: 1.7,
        }}>
          'A haunting meditation on the tension between the natural and the artificial.'
        </p>
        <p style={{
          fontFamily: font.mono, fontSize: '0.65rem', letterSpacing: '0.25em',
          textTransform: 'uppercase', color: C.textFaint,
          marginBottom: '2rem',
        }}>
          — Sotheby's
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="#world-map" style={{ ...btnPrimary, padding: '1rem 1.8rem', fontSize: '0.75rem' }}>
            &#9670; Enter the World
          </a>
        </div>
        </div>{/* end dd-hero-content */}

        {/* Scroll indicator */}
        <div className="dd-scroll-indicator" style={{
          position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)',
          zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
        }}>
          <span style={{ ...mono, fontSize: '0.55rem', color: C.textFaint }}>Scroll</span>
          <div style={{ width: '1px', height: '2rem', background: `linear-gradient(180deg, ${C.textFaint}, transparent)` }} />
        </div>
      </header>

      {/* ═══ WORLD MAP — DRONE-SHAPED ZONE NAVIGATOR ═══ */}
      <section id="world-map" style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', textAlign: 'center',
        padding: '6rem 2rem', position: 'relative',
        background: C.bg, overflow: 'hidden',
        borderTop: `1px solid ${C.line}`,
      }}>
        {/* Film background */}
        <video
          autoPlay muted loop playsInline
          preload="none"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', opacity: 0.15, pointerEvents: 'none',
          }}
        >
          <source src="/films/dd-the-vault.mp4" type="video/mp4" />
        </video>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(10,10,14,0.4) 0%, rgba(10,10,14,0.9) 80%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '900px' }}>
          <span style={{ ...mono, display: 'block', marginBottom: '1.5rem' }}>&#9670; The World</span>
          <h2 style={{
            ...sectionHeading, marginBottom: '1rem',
          }}>Choose Your Zone</h2>
          <p style={{ ...sectionLead, marginLeft: 'auto', marginRight: 'auto', marginBottom: '3rem' }}>
            Four rooms. One universe.
          </p>

          {/* Drone-shaped layout: body (center) with 4 zones as "rotors" */}
          <div className="dd-world-map" style={{
            position: 'relative',
            width: '100%', maxWidth: '700px',
            margin: '0 auto',
            aspectRatio: '1 / 1',
          }}>
            {/* Central drone body */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '160px', height: '160px',
              borderRadius: '50%',
              border: `1px solid rgba(200,230,255,0.4)`,
              background: `radial-gradient(circle, rgba(217,230,240,0.12) 0%, rgba(10,10,14,0.9) 70%)`,
              boxShadow: '0 0 40px rgba(200,230,255,0.15), 0 0 80px rgba(200,230,255,0.05), inset 0 0 30px rgba(200,230,255,0.08)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              zIndex: 2, overflow: 'hidden',
            }}>
              <div style={{
                fontFamily: font.display, fontWeight: 700, fontStyle: 'normal',
                fontSize: 'clamp(0.85rem, 1.5vw, 1.05rem)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                lineHeight: 1.1, textAlign: 'center',
                background: 'linear-gradient(110deg, #b0c8d4 0%, #ffffff 30%, #a8c0cc 55%, #ffffff 80%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'ddShimmerSlow 4s linear infinite',
              }}>
                Diamond<br />Drones<span style={{ fontSize: '0.5em', verticalAlign: 'super' }}>&#8482;</span>
              </div>
              <div style={{
                fontSize: '12px', marginTop: '4px',
                color: 'rgba(200,230,255,0.6)',
                animation: 'ddPulse 2s ease-in-out infinite',
              }}>&#9670;</div>
              {/* Glint sweep */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                overflow: 'hidden', pointerEvents: 'none',
              }}>
                <div className="dd-hub-glint" style={{
                  position: 'absolute', top: 0, bottom: 0, width: '40%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                  transform: 'skewX(-15deg)',
                }} />
              </div>
            </div>

            {/* Drone arms — diagonal lines from center to corners */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
              <line x1="50%" y1="50%" x2="18%" y2="18%" stroke={C.line} strokeWidth="1" strokeDasharray="4 4" />
              <line x1="50%" y1="50%" x2="82%" y2="18%" stroke={C.line} strokeWidth="1" strokeDasharray="4 4" />
              <line x1="50%" y1="50%" x2="18%" y2="82%" stroke={C.line} strokeWidth="1" strokeDasharray="4 4" />
              <line x1="50%" y1="50%" x2="82%" y2="82%" stroke={C.line} strokeWidth="1" strokeDasharray="4 4" />
            </svg>

            {/* Zone 1 — Vault (top-left) */}
            <Link to="/drones/vault" className="dd-zone-card" style={{
              position: 'absolute', top: '2%', left: '2%',
              width: '38%', aspectRatio: '1',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: `radial-gradient(circle, rgba(217,230,240,0.06) 0%, rgba(10,10,14,0.8) 100%)`,
              border: `1px solid ${C.line}`, borderRadius: '50%',
              textDecoration: 'none', color: C.text,
              transition: 'all 0.4s ease', zIndex: 2,
            }}>
              <div style={{ fontSize: '34px', marginBottom: '10px' }}>&#9670;</div>
              <div style={{ fontFamily: font.display, fontWeight: 700, fontStyle: 'normal', fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.iceBright }}>The Vault</div>
              <div style={{ fontFamily: font.body, fontStyle: 'italic', fontSize: '0.9rem', color: C.textDim, marginTop: '6px' }}>1,000 Diamonds</div>
            </Link>

            {/* Zone 2 — Cinema (top-right) */}
            <Link to="/drones/cinema" className="dd-zone-card" style={{
              position: 'absolute', top: '2%', right: '2%',
              width: '38%', aspectRatio: '1',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: `radial-gradient(circle, rgba(217,230,240,0.06) 0%, rgba(10,10,14,0.8) 100%)`,
              border: `1px solid ${C.line}`, borderRadius: '50%',
              textDecoration: 'none', color: C.text,
              transition: 'all 0.4s ease', zIndex: 2,
            }}>
              <div style={{ fontSize: '34px', marginBottom: '10px' }}>&#9654;</div>
              <div style={{ fontFamily: font.display, fontWeight: 700, fontStyle: 'normal', fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.iceBright }}>Cinema</div>
              <div style={{ fontFamily: font.body, fontStyle: 'italic', fontSize: '0.9rem', color: C.textDim, marginTop: '6px' }}>4 Films</div>
            </Link>

            {/* Zone 3 — Studio (bottom-left) */}
            <Link to="/drones/studio" className="dd-zone-card" style={{
              position: 'absolute', bottom: '2%', left: '2%',
              width: '38%', aspectRatio: '1',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: `radial-gradient(circle, rgba(217,230,240,0.06) 0%, rgba(10,10,14,0.8) 100%)`,
              border: `1px solid ${C.line}`, borderRadius: '50%',
              textDecoration: 'none', color: C.text,
              transition: 'all 0.4s ease', zIndex: 2,
            }}>
              <div style={{ fontSize: '34px', marginBottom: '10px' }}>&#9835;</div>
              <div style={{ fontFamily: font.display, fontWeight: 700, fontStyle: 'normal', fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.iceBright }}>Studio</div>
              <div style={{ fontFamily: font.body, fontStyle: 'italic', fontSize: '0.9rem', color: C.textDim, marginTop: '6px' }}>The Album</div>
            </Link>

            {/* Zone 4 — Lounge (bottom-right) */}
            <Link to="/drones/lounge" className="dd-zone-card" style={{
              position: 'absolute', bottom: '2%', right: '2%',
              width: '38%', aspectRatio: '1',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: `radial-gradient(circle, rgba(217,230,240,0.06) 0%, rgba(10,10,14,0.8) 100%)`,
              border: `1px solid ${C.line}`, borderRadius: '50%',
              textDecoration: 'none', color: C.text,
              transition: 'all 0.4s ease', zIndex: 2,
            }}>
              <div style={{ fontSize: '34px', marginBottom: '10px' }}>&#10022;</div>
              <div style={{ fontFamily: font.display, fontWeight: 700, fontStyle: 'normal', fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.iceBright }}>The Lounge</div>
              <div style={{ fontFamily: font.body, fontStyle: 'italic', fontSize: '0.9rem', color: C.textDim, marginTop: '6px' }}>120 Drone Blondes</div>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ BRAND MOMENT — BIG SHINY DIAMOND DRONES ═══ */}
      <section id="brand" style={{
        minHeight: '60vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', textAlign: 'center',
        padding: '8rem 2rem', position: 'relative',
        background: `radial-gradient(ellipse at 50% 50%, #3a3a44 0%, #2a2a32 70%)`,
        borderTop: `1px solid ${C.line}`,
      }}>
        {/* Cycling artwork grid behind title */}
        <div style={{
          position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
          display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gridTemplateRows: 'repeat(6, 1fr)',
          gap: '2px', opacity: 0.3,
        }}>
          {VAULT_IMAGES.map((src, i) => (
            <div key={i} className={`dd-grid-cell dd-grid-cell-${i % 12}`} style={{
              overflow: 'hidden',
              backgroundImage: `url(${src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }} />
          ))}
        </div>

        {/* Dark vignette over artwork grid for text legibility */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(30,30,36,0.25) 0%, rgba(30,30,36,0.6) 70%)',
        }} />

        {/* Floating diamond particles */}
        <div className="dd-particles" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`dd-particle dd-particle-${i}`} style={{
              position: 'absolute',
              width: `${4 + (i % 3) * 3}px`, height: `${4 + (i % 3) * 3}px`,
              background: 'rgba(217,230,240,0.3)',
              transform: 'rotate(45deg)',
              left: `${10 + i * 11}%`,
              top: `${15 + (i * 17) % 70}%`,
            }} />
          ))}
        </div>

        <h2 className="dd-brand-title" style={{
          fontFamily: font.display, fontWeight: 900, fontStyle: 'normal',
          fontSize: 'clamp(2.5rem, 9vw, 8rem)', lineHeight: 1.05, letterSpacing: '-0.02em',
          textTransform: 'uppercase', position: 'relative', zIndex: 1,
          marginBottom: '2rem', paddingRight: '0.15em', paddingBottom: '0.05em',
        }}>
          Diamond<br />Drones<span style={{ fontSize: '0.18em', verticalAlign: 'super', letterSpacing: '0.05em' }}>&#8482;</span><br /><span style={{ fontSize: '0.45em' }}>Genesis Collection</span>
        </h2>

        <p style={{
          fontFamily: font.body, fontStyle: 'italic',
          fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', color: C.textDim,
          position: 'relative', zIndex: 1, maxWidth: '600px',
          marginBottom: '2.5rem',
        }}>
          One thousand Diamond Drones.<br />
          Cut, classed and named.<br />
          A complete artistic universe.
        </p>

        <a href="#genesis" style={{ ...btn, position: 'relative', zIndex: 1 }}>
          Explore the Collections &darr;
        </a>
      </section>

      {/* ═══ THE DIAMOND ENGINE ═══ */}
      <section style={{
        background: C.bg,
        padding: 'clamp(6rem, 12vw, 12rem) 2rem',
        borderTop: `1px solid ${C.line}`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle radial glow behind the section */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '900px', height: '700px',
          background: 'radial-gradient(ellipse, rgba(180,200,220,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {/* Overline */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span style={{ ...overline, fontSize: '0.6rem', letterSpacing: '0.5em' }}>
              The Technology
            </span>
          </div>

          {/* Title */}
          <h2 style={{
            fontFamily: font.display, fontWeight: 700, fontStyle: 'normal',
            fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', textTransform: 'uppercase', lineHeight: 0.92,
            textAlign: 'center',
            background: 'linear-gradient(110deg, #b0c8d4 0%, #ddeef4 15%, #ffffff 30%, #a8c0cc 45%, #d8ecf4 60%, #ffffff 75%, #b4ccd8 100%)',
            backgroundSize: '300% auto',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
            animation: 'ddShimmer 8s linear infinite',
            marginBottom: '2rem',
          }}>
            The Diamond<br />Engine
          </h2>

          {/* Lead paragraph */}
          <p style={{
            ...sectionLead,
            textAlign: 'center',
            margin: '0 auto 5rem',
            maxWidth: '640px',
          }}>
            Diamond Drones&#8482; is not a collection. It is an engine &mdash; a luxury digital
            asset system built on Ethereum, powered by Ink Interventions, and designed
            to outlast every market cycle.
          </p>

          <p style={{
            ...sectionLead,
            textAlign: 'center',
            margin: '0 auto 5rem',
            maxWidth: '700px',
          }}>
            The Diamond Engine transforms glamour into code, diamonds into drones,
            and cinematic artworks into tokenized cultural artefacts.
          </p>

          {/* Three pillars */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'clamp(1.5rem, 3vw, 3rem)',
            marginBottom: '5rem',
          }} className="dd-engine-pillars">

            {/* Pillar I — Ink Interventions */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: font.display, fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                fontWeight: 700, color: 'rgba(255,255,255,0.04)',
                lineHeight: 1, marginBottom: '1rem',
              }}>I</div>
              <div style={{
                fontFamily: font.display, fontWeight: 700, fontStyle: 'normal',
                fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                color: C.ice, marginBottom: '1rem',
              }}>
                Ink Interventions
              </div>
              <p style={{
                fontFamily: font.body, fontStyle: 'italic',
                fontSize: 'clamp(0.85rem, 1.1vw, 1rem)',
                color: C.textDim, lineHeight: 1.8,
              }}>
                A proprietary creative process. AI-trained models, hand-finished by
                the artist. Each asset is generated through a bespoke pipeline &mdash;
                machine vision refined by human intuition. No two outputs are alike.
              </p>
            </div>

            {/* Pillar II — Tokenization */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: font.display, fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                fontWeight: 700, color: 'rgba(255,255,255,0.04)',
                lineHeight: 1, marginBottom: '1rem',
              }}>II</div>
              <div style={{
                fontFamily: font.display, fontWeight: 700, fontStyle: 'normal',
                fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                color: C.ice, marginBottom: '1rem',
              }}>
                Tokenization
              </div>
              <p style={{
                fontFamily: font.body, fontStyle: 'italic',
                fontSize: 'clamp(0.85rem, 1.1vw, 1rem)',
                color: C.textDim, lineHeight: 1.8,
              }}>
                Every asset is tokenized on Ethereum &mdash; the world's most
                secure public ledger. Provenance, ownership, and transferability
                are built into the object itself.
              </p>
            </div>

            {/* Pillar III — The Engine */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: font.display, fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                fontWeight: 700, color: 'rgba(255,255,255,0.04)',
                lineHeight: 1, marginBottom: '1rem',
              }}>III</div>
              <div style={{
                fontFamily: font.display, fontWeight: 700, fontStyle: 'normal',
                fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                color: C.ice, marginBottom: '1rem',
              }}>
                The Engine
              </div>
              <p style={{
                fontFamily: font.body, fontStyle: 'italic',
                fontSize: 'clamp(0.85rem, 1.1vw, 1rem)',
                color: C.textDim, lineHeight: 1.8,
              }}>
                Designed by Miss AL Simpson, engineered as a complete digital
                asset system. 1000 Diamond Drones, 120 Drone Blondes, an 11-track
                album &mdash; all cut from the same engine. One brand. One
                technology. One world.
              </p>
            </div>
          </div>

          {/* Divider line */}
          <div style={{ width: '60px', height: '1px', background: C.line, margin: '0 auto 3rem' }} />

          {/* Closing statement */}
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
            <p style={{
              fontFamily: font.body, fontStyle: 'italic',
              fontSize: 'clamp(1.05rem, 1.5vw, 1.3rem)',
              color: C.textDim, lineHeight: 1.9,
              marginBottom: '2rem',
            }}>
              The Diamond Engine is a proprietary luxury digital asset system.
              Ink Interventions provide the creative layer. Tokenization on Ethereum
              provides the ownership layer. Together they form an engine designed
              not for the next cycle &mdash; but for the next century.
            </p>
            <div style={{
              fontFamily: font.mono, fontStyle: 'normal',
              fontSize: '0.6rem', letterSpacing: '0.4em',
              textTransform: 'uppercase', color: C.textFaint,
            }}>
              Designed by Miss AL Simpson &middot; Engineered on Ethereum
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOUR FILMS ═══ */}
      <section id="films" style={{ padding: '8rem 2rem', borderTop: `1px solid ${C.line}`, background: C.bg }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
          <span style={{ ...mono, display: 'block', marginBottom: '1.5rem' }}>&#9670; The Cinema</span>
          <h2 style={sectionHeading}>One Track.<br />Four Films.</h2>
          <p style={sectionLead}>
            <em>Diamond Drones Are a Girl's Best Friend</em> premieres across four cinematic spaces. The same song, four different rooms within the world.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '2rem' }} className="dd-home-films-grid">
            {FILMS.map((film, i) => (
              <div key={i} style={{
                aspectRatio: '16/10', background: C.bg3, border: `1px solid ${C.line}`,
                padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                position: 'relative', overflow: 'hidden', transition: 'all 0.3s',
              }} className="dd-home-film-card">
                <video
                  autoPlay muted loop playsInline
                  preload="none"
                  style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%',
                    objectFit: 'cover', opacity: 0.45, pointerEvents: 'none',
                  }}
                >
                  <source src={film.video} type="video/mp4" />
                </video>
                <div style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  background: 'linear-gradient(180deg, rgba(10,10,14,0.3) 0%, rgba(10,10,14,0.1) 40%, rgba(10,10,14,0.6) 100%)',
                }} />
                <div style={{ fontFamily: font.mono, color: C.textFaint, fontSize: '0.7rem', letterSpacing: '0.2em', position: 'relative', zIndex: 1 }}>{film.num}</div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontFamily: font.display, fontWeight: 700, fontStyle: 'normal', fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', textTransform: 'uppercase', lineHeight: 1, color: C.iceBright, marginBottom: '0.6rem' }}>{film.name}</div>
                  <div style={{ fontStyle: 'italic', color: C.textDim, fontSize: '1.1rem' }}>{film.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <Link to="/drones/cinema" style={btn}>Enter the Cinema &rarr;</Link>
          </div>
        </div>
      </section>

      {/* ═══ GENESIS — THREE FULL SECTIONS ═══ */}
      <div id="genesis">
        {DROPS.map((drop, i) => {
          const isAlbum = drop.name === 'The Album';
          const hasVideo = !!drop.bgVideo;
          const reversed = i % 2 === 1;
          const tickerText = '◇ DIAMOND DRONES™ '.repeat(20);
          return (
          <section key={i} style={{
            padding: 'clamp(5rem, 10vw, 8rem) 2rem',
            background: i % 2 === 0 ? C.bg2 : C.bg,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* ── Sparkling ticker tape divider ── */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: '28px',
              overflow: 'hidden',
              borderTop: `1px solid ${C.line}`,
              borderBottom: `1px solid ${C.line}`,
              background: 'rgba(217,230,240,0.02)',
              zIndex: 2,
            }}>
              <div className="dd-ticker" style={{
                display: 'flex', alignItems: 'center',
                height: '100%', whiteSpace: 'nowrap',
                fontFamily: font.mono, fontSize: '0.55rem',
                letterSpacing: '0.25em', textTransform: 'uppercase',
              }}>
                <span className="dd-ticker-text">{tickerText}</span>
                <span className="dd-ticker-text">{tickerText}</span>
              </div>
            </div>
            {/* Optional cinematic video background */}
            {hasVideo && (
              <>
                <video
                  autoPlay muted loop playsInline
                  preload="none"
                  style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%',
                    objectFit: 'cover', opacity: 0.2, pointerEvents: 'none',
                  }}
                >
                  <source src={drop.bgVideo} type="video/mp4" />
                </video>
                <div style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  background: 'radial-gradient(ellipse at 50% 50%, rgba(10,10,12,0.3) 0%, rgba(10,10,12,0.85) 100%)',
                }} />
              </>
            )}
            <div style={{
              maxWidth: '1200px', margin: '0 auto',
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(2rem, 5vw, 5rem)',
              alignItems: 'center',
              position: 'relative', zIndex: 1,
            }} className="dd-drop-section">

              {/* ── Visual side ── */}
              <div style={{ order: reversed ? 2 : 1 }} className="dd-drop-visual">
                {isAlbum ? (
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    padding: '2rem',
                    background: `radial-gradient(ellipse at 50% 40%, rgba(217,230,240,0.08) 0%, transparent 70%)`,
                  }}>
                    <div className="dd-vinyl-spin" style={{
                      width: 'clamp(260px, 28vw, 400px)', height: 'clamp(260px, 28vw, 400px)',
                      borderRadius: '50%', position: 'relative',
                      background: 'radial-gradient(circle, #f0f0f0 0%, #d8dce0 20%, #c4ccd4 40%, #b8c0c8 60%, #d0d8e0 80%, #e8ecf0 100%)',
                      boxShadow: '0 0 80px rgba(217,230,240,0.2), 0 0 160px rgba(217,230,240,0.08), 0 20px 60px rgba(0,0,0,0.4)',
                    }}>
                      {[...Array(12)].map((_, r) => (
                        <div key={r} style={{
                          position: 'absolute', borderRadius: '50%',
                          border: '0.5px solid rgba(0,0,0,0.06)',
                          inset: `${10 + r * 5.5}%`,
                        }} />
                      ))}
                      <div style={{
                        position: 'absolute', inset: '5%', borderRadius: '50%',
                        background: 'conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.15) 10%, transparent 20%, rgba(255,255,255,0.1) 40%, transparent 50%, rgba(255,255,255,0.12) 70%, transparent 80%)',
                        mixBlendMode: 'overlay',
                      }} />
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                        width: '38%', height: '38%', borderRadius: '50%',
                        background: `radial-gradient(circle, ${C.bg3} 0%, ${C.bg} 100%)`,
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        border: `1px solid ${C.line}`,
                      }}>
                        <div className="dd-vinyl-glint" style={{
                          fontFamily: font.mono, fontSize: '0.45rem', letterSpacing: '0.15em',
                          textTransform: 'uppercase', color: C.textDim, lineHeight: 1.4, textAlign: 'center',
                        }}>
                          Drones of<br />Suburbia
                        </div>
                      </div>
                      <div className="dd-vinyl-glint" style={{
                        position: 'absolute', inset: 0, borderRadius: '50%',
                        background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.2) 48%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.2) 52%, transparent 70%)',
                        pointerEvents: 'none',
                      }} />
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: C.bg, border: `1px solid ${C.line}`,
                      }} />
                    </div>
                    {/* Mini tracklist beneath vinyl */}
                    <div style={{
                      marginTop: '2rem', width: '100%', maxWidth: '320px',
                    }}>
                      {['The Drones of Suburbia', 'Les Drones de la Banlieue', 'Hollywood Drones', 'Drone Driver', 'Diamond Drones Are a Girl\'s Best Friend'].map((t, ti) => (
                        <div key={ti} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '0.4rem 0',
                          borderBottom: `1px solid ${C.line}`,
                          fontFamily: font.body, fontStyle: 'italic',
                          fontSize: '0.75rem', color: ti === 0 ? C.textDim : C.textFaint,
                        }}>
                          <span>{String(ti === 0 ? 1 : ti === 1 ? 2 : ti === 2 ? 5 : ti === 3 ? 7 : 11).padStart(2, '0')}</span>
                          <span style={{ flex: 1, marginLeft: '0.75rem' }}>{t}</span>
                          <span style={{ fontFamily: font.mono, fontSize: '0.55rem', letterSpacing: '0.1em', color: C.textFaint }}>&#9654;</span>
                        </div>
                      ))}
                      <div style={{
                        fontFamily: font.mono, fontSize: '0.55rem', letterSpacing: '0.2em',
                        textTransform: 'uppercase', color: C.textFaint, marginTop: '0.6rem',
                        textAlign: 'center',
                      }}>
                        + 6 more tracks
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid', gridTemplateColumns: drop.images.length === 1 ? '1fr' : `repeat(${Math.min(drop.images.length, 3)}, 1fr)`,
                    gap: '0.75rem', position: 'relative',
                  }}>
                    {drop.images.map((src, j) => (
                      <div key={j} className={`dd-drift dd-drift-${j}`} style={{
                        aspectRatio: '2/3', overflow: 'hidden', borderRadius: '2px', position: 'relative',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                      }}>
                        <img src={src} alt="" style={{
                          width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                        }} className={`dd-img-zoom dd-img-zoom-${j}`} />
                        {/* Gradient overlay */}
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(10,10,12,0.6) 100%)', pointerEvents: 'none' }} />
                        {/* Diagonal light sweep */}
                        <div className={`dd-img-sweep dd-img-sweep-${j}`} style={{
                          position: 'absolute', inset: '-50%', pointerEvents: 'none',
                          background: 'linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.08) 48%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 52%, transparent 60%)',
                        }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Content side ── */}
              <div style={{ order: reversed ? 1 : 2 }} className="dd-drop-content">
                <div style={{ ...mono, marginBottom: '1.5rem', color: C.textFaint }}>{drop.overline}</div>
                <div style={{
                  fontFamily: font.display, fontWeight: 700, fontStyle: 'normal',
                  fontSize: 'clamp(2.5rem, 4vw, 4rem)', color: C.iceBright,
                  lineHeight: 1, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '-0.01em',
                }}>{drop.name}{drop.hasTM && <span style={{ fontSize: '0.3em', verticalAlign: 'super', letterSpacing: '0.05em' }}>&#8482;</span>}</div>
                <div style={{
                  fontFamily: font.body, fontStyle: 'italic', fontSize: 'clamp(0.9rem, 1.2vw, 1.1rem)',
                  color: C.textDim, marginBottom: '1.5rem',
                }}>{drop.zone}</div>
                <p style={{ color: C.textDim, fontSize: 'clamp(0.95rem, 1.1vw, 1.05rem)', lineHeight: 1.7, marginBottom: '2rem', fontFamily: font.body, fontStyle: 'italic', maxWidth: '480px' }}>{drop.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2.5rem' }}>
                  {drop.tags.map(t => (
                    <span key={t} style={{ fontFamily: font.mono, fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textFaint, border: `1px solid ${C.line}`, padding: '0.3rem 0.6rem' }}>{t}</span>
                  ))}
                </div>
                <Link to={drop.href} style={{ ...btnPrimary, padding: '0.8rem 1.5rem', fontSize: '0.7rem' }}>
                  {drop.cta} &rarr;
                </Link>
              </div>
            </div>
          </section>
          );
        })}
      </div>

      {/* ═══ PROVENANCE ═══ */}
      <section id="provenance" style={{ padding: '8rem 2rem', borderTop: `1px solid ${C.line}`, background: C.bg, textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <span style={{ ...mono, display: 'block', marginBottom: '1.5rem' }}>&#9670; Provenance &#9670;</span>
          <h2 style={sectionHeading}>Born From Cinema</h2>
          <p style={{ ...sectionLead, marginLeft: 'auto', marginRight: 'auto', marginBottom: 0 }}>
            DIAMOND DRONES emerges from THE DRONES OF SUBURBIA&#8482; &mdash; a cinematic universe by Miss AL Simpson, exhibited and sold at the highest institutional level.
          </p>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap',
            margin: '3rem 0', padding: '2rem 0',
            borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`,
          }}>
            {['Sotheby\'s New York', 'SuperRare', '2024\u20132026'].map((item, i, arr) => (
              <span key={i}>
                <span style={{ fontFamily: font.display, fontWeight: 500, fontStyle: 'normal', fontSize: '0.85rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.text }}>{item}</span>
                {i < arr.length - 1 && <span style={{ color: C.textFaint, margin: '0 0.75rem' }}>&#9670;</span>}
              </span>
            ))}
          </div>

          <p style={{
            fontFamily: font.body, fontStyle: 'italic',
            fontSize: 'clamp(1.2rem, 2vw, 1.6rem)', color: C.ice, lineHeight: 1.4,
            margin: '2rem auto 1rem', maxWidth: '700px',
          }}>
            "Blurring the lines between observation and surveillance, intimacy and intrusion."
          </p>
          <p style={{ fontFamily: font.mono, fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.textDim, fontStyle: 'normal' }}>
            &mdash; Sotheby's &middot; Les Drones de la Banlieue &middot; 2024
          </p>

          <div style={{ marginTop: '3rem' }}>
            <Link to="/drones/lore" style={btn}>Explore the Drones of Suburbia universe &rarr;</Link>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section style={{
        background: `linear-gradient(180deg, ${C.bg} 0%, ${C.bg2} 100%)`,
        textAlign: 'center', padding: '10rem 2rem',
        borderTop: `1px solid ${C.line}`,
      }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
          <span style={{ ...overline, display: 'block', marginBottom: '1rem' }}>Diamond Drones&#8482;</span>
          <h2 style={{
            fontFamily: font.display, fontWeight: 700, fontStyle: 'normal',
            fontSize: 'clamp(2.5rem, 6vw, 5rem)', textTransform: 'uppercase', lineHeight: 0.95,
            background: 'linear-gradient(180deg, #f4f8fc 0%, #b8c8d8 100%)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '3rem',
          }}>
            Enter the World
          </h2>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem', maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto' }} className="dd-home-final-ctas">
            <Link to="/drones/vault" style={{ ...btnPrimary, padding: '1.2rem 1.8rem', fontSize: '0.75rem', flex: 1, minWidth: '250px', maxWidth: '280px', justifyContent: 'center' }}>
              Diamond Drones &rarr;
            </Link>
            <Link to="/drones/lounge" style={{ ...btnPrimary, padding: '1.2rem 1.8rem', fontSize: '0.75rem', flex: 1, minWidth: '250px', maxWidth: '280px', justifyContent: 'center' }}>
              Drone Blondes &rarr;
            </Link>
            <Link to="/drones/studio" style={{ ...btnPrimary, padding: '1.2rem 1.8rem', fontSize: '0.75rem', flex: 1, minWidth: '250px', maxWidth: '280px', justifyContent: 'center' }}>
              The Album &rarr;
            </Link>
          </div>

          <div style={{ fontFamily: font.mono, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: C.textFaint, fontStyle: 'normal' }}>
            Diamond Drones&#8482; &middot; The Diamond Engine &middot; Miss AL Simpson
          </div>
        </div>
      </section>

      {/* ═══ ANIMATIONS & RESPONSIVE STYLES ═══ */}
      <style>{`
        /* ── Fade in for hero video swap ── */
        @keyframes ddHeroFadeIn {
          0%   { opacity: 0; }
          100% { opacity: 0.7; }
        }
        /* ── Ken Burns slow zoom on hero video ── */
        @keyframes ddKenBurns {
          0%   { transform: scale(1); }
          100% { transform: scale(1.12); }
        }
        .dd-hero-video {
          animation: ddHeroFadeIn 2s ease-in-out, ddKenBurns 30s ease-in-out alternate infinite;
        }

        /* ── Diamond shimmer on hero title ── */
        .dd-hero-tm {
          font-size: 0.35em;
          vertical-align: super;
          background: linear-gradient(105deg, #8a9aaa 0%, #d9e6f0 20%, #ffffff 30%, #d9e6f0 40%, #8a9aaa 50%, #d9e6f0 60%, #ffffff 70%, #d9e6f0 80%, #8a9aaa 100%) !important;
          background-size: 200% 100% !important;
          -webkit-background-clip: text !important;
          background-clip: text !important;
          -webkit-text-fill-color: transparent;
          animation: ddShimmer 6s linear infinite;
        }
        .dd-hero-title {
          background: linear-gradient(
            105deg,
            #8a9aaa 0%,
            #d9e6f0 20%,
            #ffffff 30%,
            #d9e6f0 40%,
            #8a9aaa 50%,
            #d9e6f0 60%,
            #ffffff 70%,
            #d9e6f0 80%,
            #8a9aaa 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: ddShimmer 6s linear infinite;
        }

        /* ── Diamond shimmer on brand title ── */
        @keyframes ddShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .dd-brand-title {
          background: linear-gradient(
            105deg,
            #8a9aaa 0%,
            #d9e6f0 20%,
            #ffffff 30%,
            #d9e6f0 40%,
            #8a9aaa 50%,
            #d9e6f0 60%,
            #ffffff 70%,
            #d9e6f0 80%,
            #8a9aaa 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: ddShimmer 6s linear infinite;
        }

        /* ── Center hub shimmer ── */
        @keyframes ddShimmerSlow {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .dd-hub-glint {
          animation: ddHubGlint 4s 1s ease-in-out infinite;
        }
        @keyframes ddHubGlint {
          0%   { left: -80%; opacity: 0; }
          20%  { opacity: 0.8; }
          100% { left: 160%; opacity: 0; }
        }

        /* ── Scroll indicator pulse ── */
        @keyframes ddPulse {
          0%, 100% { opacity: 0.4; }
          50%      { opacity: 1; }
        }
        .dd-scroll-indicator {
          animation: ddPulse 2.5s ease-in-out infinite;
        }

        /* ── Hero content fade-in ── */
        @keyframes ddFadeUp {
          0%   { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .dd-hero-content {
          animation: ddFadeUp 1.2s ease-out both;
        }

        /* ── Spinning vinyl record ── */
        @keyframes ddVinylSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .dd-vinyl-spin {
          animation: ddVinylSpin 4s linear infinite;
        }

        /* ── Vinyl glint counter-rotation (stays fixed while disc spins) ── */
        @keyframes ddGlintCounter {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        .dd-vinyl-glint {
          animation: ddGlintCounter 4s linear infinite;
        }

        /* ── Cycling grid cell flash + scale pulse ── */
        @keyframes ddGridFlash {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.2; transform: scale(1.05); }
        }
        @keyframes ddGridGlow {
          0%, 100% { opacity: 0.6; filter: brightness(1); }
          40%      { opacity: 1; filter: brightness(1.3); }
          60%      { opacity: 1; filter: brightness(1.3); }
        }
        .dd-grid-cell-0  { animation: ddGridFlash 3s ease-in-out 0s infinite; }
        .dd-grid-cell-1  { animation: ddGridGlow 4s ease-in-out 0.8s infinite; }
        .dd-grid-cell-2  { animation: ddGridFlash 3.5s ease-in-out 1.5s infinite; }
        .dd-grid-cell-3  { animation: ddGridGlow 5s ease-in-out 0.3s infinite; }
        .dd-grid-cell-4  { animation: ddGridFlash 2.8s ease-in-out 2s infinite; }
        .dd-grid-cell-5  { animation: ddGridGlow 4.5s ease-in-out 1s infinite; }
        .dd-grid-cell-6  { animation: ddGridFlash 3.2s ease-in-out 2.5s infinite; }
        .dd-grid-cell-7  { animation: ddGridGlow 3.8s ease-in-out 0.5s infinite; }
        .dd-grid-cell-8  { animation: ddGridFlash 4.2s ease-in-out 1.8s infinite; }
        .dd-grid-cell-9  { animation: ddGridGlow 3s ease-in-out 2.2s infinite; }
        .dd-grid-cell-10 { animation: ddGridFlash 5s ease-in-out 0.2s infinite; }
        .dd-grid-cell-11 { animation: ddGridGlow 3.5s ease-in-out 1.3s infinite; }

        /* ── Floating diamond particles ── */
        @keyframes ddFloat {
          0%, 100% { transform: rotate(45deg) translateY(0) scale(1); opacity: 0.3; }
          50%      { transform: rotate(45deg) translateY(-20px) scale(1.2); opacity: 0.6; }
        }
        ${[...Array(8)].map((_, i) =>
          `.dd-particle-${i} { animation: ddFloat ${3 + (i % 3) * 1.5}s ease-in-out ${i * 0.4}s infinite; }`
        ).join('\n        ')}

        /* ── Sparkling ticker tape marquee ── */
        @keyframes ddTickerScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .dd-ticker {
          animation: ddTickerScroll 30s linear infinite;
        }
        .dd-ticker-text {
          background: linear-gradient(
            90deg,
            rgba(120,130,140,0.4) 0%,
            rgba(200,210,220,0.7) 15%,
            rgba(255,255,255,0.95) 25%,
            rgba(200,210,220,0.7) 35%,
            rgba(120,130,140,0.4) 50%,
            rgba(200,210,220,0.7) 65%,
            rgba(255,255,255,0.95) 75%,
            rgba(200,210,220,0.7) 85%,
            rgba(120,130,140,0.4) 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: ddTickerShimmer 3s linear infinite;
        }
        @keyframes ddTickerShimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }

        /* ── Slow Ken Burns zoom on collection images (staggered) ── */
        @keyframes ddImgZoom0 {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        @keyframes ddImgZoom1 {
          0%   { transform: scale(1.04); }
          50%  { transform: scale(1); }
          100% { transform: scale(1.04); }
        }
        @keyframes ddImgZoom2 {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
        .dd-img-zoom-0 { animation: ddImgZoom0 8s ease-in-out infinite; }
        .dd-img-zoom-1 { animation: ddImgZoom1 10s ease-in-out infinite; }
        .dd-img-zoom-2 { animation: ddImgZoom2 12s ease-in-out infinite; }

        /* ── Subtle vertical drift on image containers ── */
        @keyframes ddDrift0 {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes ddDrift1 {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(6px); }
        }
        @keyframes ddDrift2 {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-4px); }
        }
        .dd-drift-0 { animation: ddDrift0 6s ease-in-out infinite; }
        .dd-drift-1 { animation: ddDrift1 7s ease-in-out 0.5s infinite; }
        .dd-drift-2 { animation: ddDrift2 8s ease-in-out 1s infinite; }

        /* ── Diagonal light sweep across images ── */
        @keyframes ddSweep {
          0%   { transform: translateX(-100%) rotate(0deg); }
          100% { transform: translateX(100%) rotate(0deg); }
        }
        .dd-img-sweep-0 { animation: ddSweep 6s ease-in-out 0s infinite; }
        .dd-img-sweep-1 { animation: ddSweep 6s ease-in-out 2s infinite; }
        .dd-img-sweep-2 { animation: ddSweep 6s ease-in-out 4s infinite; }

        .dd-home-film-card:hover {
          border-color: ${C.ice} !important;
          box-shadow: 0 4px 30px rgba(217,230,240,0.06);
        }

        /* ── Zone card hover effects ── */
        .dd-zone-card:hover {
          border-color: ${C.ice} !important;
          box-shadow: 0 0 40px rgba(217,230,240,0.12), inset 0 0 30px rgba(217,230,240,0.04);
          transform: scale(1.04);
          background: radial-gradient(circle, rgba(217,230,240,0.12) 0%, rgba(10,10,14,0.7) 100%) !important;
        }

        /* ── Slow rotation on drone body diamond ── */
        @keyframes ddDroneRotate {
          0%   { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }

        /* ── Hover glow on buttons ── */
        a[href="#world-map"]:hover, a[href="#genesis"]:hover {
          border-color: ${C.iceBright} !important;
          box-shadow: 0 0 20px rgba(217,230,240,0.15);
        }

        @media (max-width: 900px) {
          .dd-drop-section { grid-template-columns: 1fr !important; }
          .dd-drop-visual { order: 1 !important; }
          .dd-drop-content { order: 2 !important; }
          .dd-home-films-grid { grid-template-columns: 1fr !important; }
          .dd-engine-pillars { grid-template-columns: 1fr !important; max-width: 480px; margin-left: auto !important; margin-right: auto !important; }
        }
        @media (max-width: 600px) {
          .dd-home-final-ctas a { width: 100%; max-width: 100% !important; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
