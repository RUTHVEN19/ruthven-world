import { useNavigate, NavLink } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { ZONES, HERO_COPY, LORE, ALBUM, SITE_META } from '../../config/dronesContent';

// Rolling gallery drone images (evenly spread across collection)
const GALLERY_ROW_1 = [10,30,55,80,110,140,175,210,250,290,330,370,410,450,490,530,570,610,650,690].map(id => `/vault/browse/${id}.jpg`);
const GALLERY_ROW_2 = [15,45,75,105,135,170,205,245,285,325,365,405,445,485,525,565,605,645,685,720].map(id => `/vault/browse/${id}.jpg`);
const GALLERY_ROW_3 = [750,790,830,870,910,950,990,1030,1070,1110,1150,1190,1230,1270,1310,1350,1390,20,60,100].map(id => `/vault/browse/${id}.jpg`);
const GALLERY_ROW_4 = [25,65,115,165,215,265,315,365,415,465,515,565,615,665,715,765,815,865,915,965].map(id => `/vault/browse/${id}.jpg`);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const UPLOADS_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

const TRACK_FILES = [
  'uploads/album/tracks/01-The-Drones-of-Suburbia.wav',
  'uploads/album/tracks/02-Les-Drones-de-la-Banlieue.wav',
  'uploads/album/tracks/03-The-Drones-of-Suburbia-Roma.wav',
  'uploads/album/tracks/04-The-Drones-of-Suburbia-Roma-Summer-2025-Edit.wav',
  'uploads/album/tracks/05-Hollywood-Drones.wav',
  'uploads/album/tracks/06-The-Drones-of-Suburbia-Frequency-Edit.wav',
  'uploads/album/tracks/07-Drone-Driver.wav',
  'uploads/album/tracks/08-Suburbia-Was-Never-Out-There.wav',
  'uploads/album/tracks/09-Surveillance-Subway.wav',
  'uploads/album/tracks/10-Heist.wav',
  'uploads/album/tracks/11-Diamond-Drones-Are-a-Girls-Best-Friend.wav',
];

const TRACK_FILMS = [
  '/films/01-the-drones-of-suburbia.mp4',
  '/films/02-les-drones-de-la-banlieue.mp4',
  '/films/03-the-drones-of-suburbia-roma.mp4',
  '/films/04-roma-summer-edit.mp4',
  '/films/05-hollywood-drones.mp4',
  '/films/06-frequency-edit.mp4',
  '/films/07-drone-driver.mp4',
  '/films/08-suburbia-was-never-out-there.mp4',
  '/films/09-surveillance-subway.mp4',
  '/films/10-heist.mp4',
  '/films/11-diamond-drones-are-a-girls-best-friend.mp4',
];

// Waveform bars for the diamond drone beatbox visualiser
const BEATBOX_BARS = Array.from({ length: 48 }, (_, i) => {
  const seed = Math.sin(i * 0.6 + 1.7) * 0.5 + 0.5;
  return { height: seed, delay: i * 0.04, speed: 0.8 + (i % 6) * 0.3 };
});

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
  @keyframes scrollLeft {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes scrollRight {
    0%   { transform: translateX(-50%); }
    100% { transform: translateX(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.3; }
    50%       { opacity: 1; }
  }
  @keyframes beatboxPulse {
    0%, 100% { height: var(--bar-min); }
    50%       { height: var(--bar-max); }
  }
  @keyframes diamondSpin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes droneHover {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    25%       { transform: translateY(-6px) rotate(1deg); }
    75%       { transform: translateY(-4px) rotate(-1deg); }
  }
  @keyframes glintSweepBeatbox {
    0%   { left: -100%; opacity: 0; }
    15%  { opacity: 0.6; }
    100% { left: 200%; opacity: 0; }
  }
  @keyframes filmCrossfade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes marilynsSlideUp {
    from { opacity: 0; transform: translateY(40px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes marilynsPulse {
    0%, 100% { opacity: 0.12; }
    50%      { opacity: 0.22; }
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
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isCursorHovering, setIsCursorHovering] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef(null);

  // Beatbox player state
  const beatboxAudioRef = useRef(null);
  const beatboxFilmRef = useRef(null);
  const vinylSectionRef = useRef(null);
  const [bbPlaying, setBbPlaying] = useState(false);
  const [bbTrack, setBbTrack] = useState(0);
  const [bbFilmLoaded, setBbFilmLoaded] = useState(false);
  const vinylAutoPlayed = useRef(false);
  const [bbProgress, setBbProgress] = useState(0);
  const [bbDuration, setBbDuration] = useState(0);

  // Stop ambient audio when vinyl plays (and vice versa)
  const stopAmbient = () => {
    if (audioRef.current) { audioRef.current.pause(); setAudioPlaying(false); }
  };

  // Beatbox: play track
  const playBeatboxTrack = (idx) => {
    const audio = beatboxAudioRef.current;
    if (!audio) return;
    stopAmbient();
    const src = `${UPLOADS_BASE}/${TRACK_FILES[idx]}`;
    audio.src = src;
    audio.load();
    audio.play().then(() => {
      setBbPlaying(true);
      setBbTrack(idx);
      // Load film (always muted — audio comes from the separate audio element)
      const film = beatboxFilmRef.current;
      if (film) {
        setBbFilmLoaded(false);
        film.muted = true;
        film.src = TRACK_FILMS[idx];
        film.load();
        film.play().catch(() => {});
        film.onloadeddata = () => setBbFilmLoaded(true);
      }
    }).catch(e => console.error('Audio play error:', e));
  };

  const toggleBeatbox = () => {
    const audio = beatboxAudioRef.current;
    if (!audio) return;
    if (bbPlaying) {
      audio.pause();
      beatboxFilmRef.current?.pause();
      setBbPlaying(false);
    } else if (audio.src) {
      stopAmbient();
      audio.play().then(() => {
        setBbPlaying(true);
        if (beatboxFilmRef.current) { beatboxFilmRef.current.muted = true; beatboxFilmRef.current.play().catch(() => {}); }
      }).catch(() => {});
    } else {
      playBeatboxTrack(10);
    }
  };

  const nextTrack = () => playBeatboxTrack((bbTrack + 1) % ALBUM.tracks.length);
  const prevTrack = () => playBeatboxTrack((bbTrack - 1 + ALBUM.tracks.length) % ALBUM.tracks.length);

  // Update progress
  useEffect(() => {
    const audio = beatboxAudioRef.current;
    if (!audio) return;
    const onTime = () => { setBbProgress(audio.currentTime); setBbDuration(audio.duration || 0); };
    const onEnd = () => nextTrack();
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnd);
    return () => { audio.removeEventListener('timeupdate', onTime); audio.removeEventListener('ended', onEnd); };
  }, [bbTrack]);

  // Scroll-triggered visibility
  const zoneRefs = useRef([]);
  const loreRef = useRef(null);
  const marilynsRef = useRef(null);
  const ctaRef = useRef(null);
  const [zoneVisible, setZoneVisible] = useState(() => ZONES.map(() => false));
  const [loreVisible, setLoreVisible] = useState(false);
  const [marilynsVisible, setMarilynsVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);

  // Zone hover state
  const [hoveredZone, setHoveredZone] = useState(null);

  // Diamond cursor
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

  // Intersection Observer for scroll reveals
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        // Check zone refs
        const zoneIdx = zoneRefs.current.indexOf(entry.target);
        if (zoneIdx !== -1) {
          setZoneVisible(prev => {
            const next = [...prev];
            next[zoneIdx] = true;
            return next;
          });
        }
        if (entry.target === loreRef.current) setLoreVisible(true);
        if (entry.target === marilynsRef.current) setMarilynsVisible(true);
        if (entry.target === ctaRef.current) setCtaVisible(true);
        if (entry.target === vinylSectionRef.current && !vinylAutoPlayed.current) {
          vinylAutoPlayed.current = true;
          playBeatboxTrack(0);
        }

        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    zoneRefs.current.forEach(el => { if (el) observer.observe(el); });
    if (loreRef.current) observer.observe(loreRef.current);
    if (marilynsRef.current) observer.observe(marilynsRef.current);
    if (ctaRef.current) observer.observe(ctaRef.current);
    if (vinylSectionRef.current) observer.observe(vinylSectionRef.current);

    return () => observer.disconnect();
  }, []);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (audioPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else {
      // Stop vinyl player if it's playing
      if (bbPlaying) {
        beatboxAudioRef.current?.pause();
        beatboxFilmRef.current?.pause();
        setBbPlaying(false);
      }
      audioRef.current.play().then(() => setAudioPlaying(true)).catch(() => {});
    }
  };

  const setZoneRef = useCallback((el, i) => {
    zoneRefs.current[i] = el;
  }, []);

  return (
    <div style={{ background: '#3a3a3a', minHeight: '100vh', color: '#fff', overflowX: 'hidden' }}>
      <Helmet>
        <title>DIAMOND DRONES™ — Genesis Collection · A Girl's Best Friend</title>
        <meta name="description" content="DIAMOND DRONES™ Genesis Collection. 1000 unique digital diamonds on Ethereum. Films, drone artworks, and debut single by Miss AL Simpson." />
        <meta property="og:title" content="Diamond Drones™ Are a Girl's Best Friend" />
        <meta property="og:description" content="Glamour has taken flight. The diamond has become a machine. 1000 Diamond Drones · 120 Drone Blondes · The Single." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://diamonddrones.world/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://diamonddrones.world/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Diamond Drones™",
          "url": "https://diamonddrones.world",
          "logo": "https://diamonddrones.world/og-image.png",
          "description": "A digital diamond house by Miss AL Simpson. 1000 Diamond Drones, 120 Drone Blondes, and debut single on Ethereum.",
          "founder": {
            "@type": "Person",
            "name": "Miss AL Simpson",
            "jobTitle": "Contemporary Artist",
            "address": { "@type": "PostalAddress", "addressLocality": "Edinburgh", "addressCountry": "GB" },
            "sameAs": ["https://twitter.com/missalsimpson", "https://instagram.com/missalsimpson"]
          },
          "sameAs": ["https://opensea.io/collection/diamond-drones", "https://opensea.io/collection/drone-blondes", "https://twitter.com/diamonddronesco", "https://instagram.com/diamonddrones"]
        })}</script>
      </Helmet>
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

      {/* ── AMBIENT AUDIO (hidden) ── */}
      <audio ref={audioRef} loop style={{ display: 'none' }}>
        <source src="/drones-ambient.m4a" type="audio/mp4" />
      </audio>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── FULL BLEED HERO ──                                                  */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div style={{
        position: 'relative', height: '100vh', minHeight: '600px',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <video autoPlay muted loop playsInline style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
          filter: 'grayscale(100%) contrast(1.05)', opacity: 0.45,
        }}>
          <source src="/marilyns/marilyns-reel.mp4" type="video/mp4" />
        </video>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(58,58,58,0.25) 0%, rgba(58,58,58,0.05) 30%, rgba(58,58,58,0.5) 70%, #3a3a3a 100%)',
        }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 20px' }}>
          {/* Logo */}
          <div style={{ marginBottom: '48px', animation: 'fadeUp 1s ease forwards' }}>
            <img
              src="/Translucent Logo.png"
              alt="DIAMOND DRONES"
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
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{
                fontSize: 'clamp(56px, 13vw, 150px)',
                fontWeight: '400', letterSpacing: '0.05em', lineHeight: 0.88,
                fontFamily: '"Anton", "Arial Black", sans-serif',
                textTransform: 'uppercase',
                background: 'linear-gradient(110deg, #b0c8d4 0%, #ddeef4 12%, #ffffff 22%, #a8c0cc 33%, #d8ecf4 44%, #ffffff 52%, #b4ccd8 62%, #e0f0f6 73%, #ffffff 82%, #a4bcc8 100%)',
                backgroundSize: '300% auto',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                animation: 'crystalShimmer 5s linear infinite',
              }}>
                DIAMOND<br />DRONES™<br />{HERO_COPY.headline[1]}<br />{HERO_COPY.headline[2]}
              </div>
            </div>
          </div>

          {/* Logline */}
          <p style={{
            marginTop: '32px', maxWidth: '520px', margin: '32px auto 0',
            fontSize: 'clamp(14px, 1.5vw, 18px)', lineHeight: 1.9,
            fontFamily: 'Georgia, serif', fontStyle: 'italic',
            color: 'rgba(255,255,255,0.4)',
            animation: 'fadeUp 1s ease 0.35s both',
          }}>
            {HERO_COPY.logline}
          </p>

          {/* Sotheby's credential */}
          <p style={{
            marginTop: '28px', maxWidth: '480px', margin: '28px auto 0',
            fontSize: 'clamp(12px, 1.2vw, 15px)', lineHeight: 1.7,
            fontFamily: 'Georgia, serif', fontStyle: 'italic',
            color: 'rgba(200,230,255,0.35)',
            animation: 'fadeUp 1s ease 0.45s both',
          }}>
            'A haunting meditation on the tension between the natural and the artificial.'
            <span style={{
              display: 'block', marginTop: '6px',
              fontStyle: 'normal', fontFamily: "'Space Mono', monospace",
              fontSize: 'clamp(9px, 1vw, 11px)', letterSpacing: '0.3em',
              textTransform: 'uppercase', color: 'rgba(200,230,255,0.25)',
            }}>
              — Sotheby's
            </span>
          </p>

          {/* World Premiere announcement */}
          <div style={{
            marginTop: '40px',
            fontSize: 'clamp(12px, 1.5vw, 16px)', letterSpacing: '0.6em',
            textTransform: 'uppercase', color: 'rgba(200,230,255,0.45)',
            fontFamily: "'Space Mono', monospace", animation: 'fadeUp 1s ease 0.6s both',
          }}>
            ◆ World Premiere ◆
          </div>
        </div>

        {/* Scroll hint — small diamond arrow */}
        <div style={{
          position: 'absolute', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          animation: 'fadeUp 1s ease 0.9s both',
        }}>
          <div style={{
            width: '8px', height: '8px',
            border: '1px solid rgba(255,255,255,0.2)',
            transform: 'rotate(45deg)',
            animation: 'pulse 2s ease-in-out infinite',
          }} />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── THE DROP — cinematic release statement ──                            */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        padding: '0',
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        {/* Hero film background */}
        <video autoPlay muted loop playsInline style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
          filter: 'contrast(1.1)',
          opacity: 0.35,
        }}>
          <source src="/films/11-diamond-drones-are-a-girls-best-friend.mp4" type="video/mp4" />
        </video>
        {/* Dark gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, #1a1a1a 0%, rgba(0,0,0,0.5) 12%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.5) 88%, #1a1a1a 100%)',
        }} />

        {/* Translucent logo watermark behind text */}
        <img src="/Translucent Logo.png" alt="Diamond Drones logo" style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'clamp(300px, 50vw, 600px)',
          opacity: 0.04,
          pointerEvents: 'none',
          filter: 'brightness(2)',
        }} />

        {/* Running text strip — top */}
        <div style={{
          position: 'relative', zIndex: 3,
          height: 'clamp(30px, 4vw, 50px)',
          background: '#0a0a0a',
          overflow: 'hidden',
          display: 'flex', alignItems: 'center',
        }}>
          <div style={{
            display: 'flex', whiteSpace: 'nowrap', width: 'max-content',
            animation: 'scrollLeft 25s linear infinite',
          }}>
            {Array.from({ length: 12 }, (_, i) => (
              <span key={`top-${i}`} style={{
                fontFamily: '"Anton", sans-serif',
                fontSize: 'clamp(11px, 1.5vw, 16px)',
                textTransform: 'uppercase',
                letterSpacing: '0.3em',
                color: 'rgba(160,210,230,0.25)',
                marginRight: 'clamp(30px, 4vw, 60px)',
              }}>
                DIAMOND DRONES™ &nbsp; ◆ &nbsp;
              </span>
            ))}
          </div>
        </div>

        {/* Glowing accent line — top */}
        <div style={{
          position: 'relative', zIndex: 3,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 5%, rgba(160,210,230,0.4) 30%, rgba(255,255,255,0.6) 50%, rgba(160,210,230,0.4) 70%, transparent 95%)',
          boxShadow: '0 0 12px rgba(160,210,230,0.3), 0 0 30px rgba(160,210,230,0.15)',
        }} />

        {/* Main content */}
        <div style={{
          position: 'relative', zIndex: 2,
          padding: 'clamp(80px, 12vw, 160px) clamp(24px, 6vw, 80px)',
        }}>
          {/* Massive shimmering title */}
          <h2 style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: 'clamp(60px, 14vw, 180px)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            lineHeight: 0.9,
            margin: '0 0 clamp(40px, 6vw, 80px)',
            background: 'linear-gradient(110deg, #6a8a9a 0%, #b0c8d4 15%, #ffffff 30%, #a8c0cc 45%, #ffffff 60%, #b0c8d4 75%, #6a8a9a 100%)',
            backgroundSize: '300% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'shimmerSlow 5s linear infinite',
            filter: 'drop-shadow(0 0 40px rgba(160,210,230,0.15))',
          }}>
            THE DROP
          </h2>

          {/* Diamond Drones title — pull quote */}
          <div style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: 'clamp(22px, 4vw, 44px)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            lineHeight: 1.1,
            margin: '0 0 clamp(32px, 5vw, 56px)',
            background: 'linear-gradient(110deg, #b0c8d4 0%, #ffffff 40%, #a8c0cc 70%, #ffffff 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'shimmerSlow 7s linear infinite',
          }}>
            Diamond Drones Are a Girl's Best Friend
          </div>

          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <p style={{
              fontSize: 'clamp(15px, 1.6vw, 19px)', lineHeight: 1.9,
              fontFamily: 'Georgia, serif', fontStyle: 'italic',
              color: 'rgba(255,255,255,0.55)',
              margin: '0 0 20px',
              animation: 'fadeUp 0.8s ease both',
            }}>
              1000 Diamond Drones. 120 Drone Blondes. The Single. 4 films.
            </p>

            {/* Diamond divider */}
            <div style={{ color: 'rgba(160,210,230,0.3)', fontSize: '12px', letterSpacing: '0.5em', margin: '28px 0' }}>
              ◇ &nbsp; ◇ &nbsp; ◇
            </div>

            <p style={{
              fontSize: 'clamp(14px, 1.4vw, 17px)', lineHeight: 1.9,
              fontFamily: 'Georgia, serif', fontStyle: 'italic',
              color: 'rgba(255,255,255,0.4)',
              margin: '0 0 48px',
              animation: 'fadeUp 0.8s ease 0.15s both',
            }}>
              Cinema, music, AI image-making, and spatial world-building converge as a single premium collector experience.
            </p>
          </div>

          {/* Diamond divider — larger */}
          <div style={{ color: 'rgba(160,210,230,0.25)', fontSize: '16px', letterSpacing: '0.8em', margin: '0 0 40px' }}>
            ◆ &nbsp; ◆ &nbsp; ◆
          </div>

          <div style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: 'clamp(36px, 7vw, 72px)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            lineHeight: 1.1,
            background: 'linear-gradient(110deg, #b0c8d4 0%, #ffffff 30%, #a8c0cc 55%, #ffffff 80%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'shimmerSlow 6s linear infinite',
            marginBottom: '20px',
            filter: 'drop-shadow(0 0 20px rgba(160,210,230,0.1))',
          }}>
            1000 Diamond Drones.
          </div>

          <p style={{
            fontSize: 'clamp(12px, 1.2vw, 15px)', lineHeight: 1.8,
            fontFamily: "'Space Mono', monospace",
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(200,230,255,0.3)',
            animation: 'fadeUp 0.8s ease 0.45s both',
          }}>
            A collector threshold into the world of diamond, drone, and machine glamour.
          </p>
        </div>

        {/* Glowing accent line — bottom */}
        <div style={{
          position: 'relative', zIndex: 3,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 5%, rgba(160,210,230,0.4) 30%, rgba(255,255,255,0.6) 50%, rgba(160,210,230,0.4) 70%, transparent 95%)',
          boxShadow: '0 0 12px rgba(160,210,230,0.3), 0 0 30px rgba(160,210,230,0.15)',
        }} />

        {/* Running text strip — bottom */}
        <div style={{
          position: 'relative', zIndex: 3,
          height: 'clamp(30px, 4vw, 50px)',
          background: '#0a0a0a',
          overflow: 'hidden',
          display: 'flex', alignItems: 'center',
        }}>
          <div style={{
            display: 'flex', whiteSpace: 'nowrap', width: 'max-content',
            animation: 'scrollRight 25s linear infinite',
          }}>
            {Array.from({ length: 12 }, (_, i) => (
              <span key={`btm-${i}`} style={{
                fontFamily: '"Anton", sans-serif',
                fontSize: 'clamp(11px, 1.5vw, 16px)',
                textTransform: 'uppercase',
                letterSpacing: '0.3em',
                color: 'rgba(160,210,230,0.25)',
                marginRight: 'clamp(30px, 4vw, 60px)',
              }}>
                DIAMOND DRONES™ &nbsp; ◆ &nbsp;
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── VINYL + FILM — Full page film bg with sparkling vinyl record ──     */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section ref={vinylSectionRef} style={{
        position: 'relative', minHeight: '140vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(100px,12vw,180px) 0',
      }}>
        {/* Full-page film background */}
        <video
          ref={beatboxFilmRef}
          muted loop playsInline
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            filter: 'contrast(1.1)',
            opacity: (bbPlaying && bbFilmLoaded) ? 0.8 : 0,
            transition: 'opacity 1.5s ease',
            zIndex: 0,
          }}
        />
        {/* Ambient bg when idle */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'radial-gradient(ellipse at 50% 45%, rgba(25,25,35,0.9) 0%, #3a3a3a 70%)',
          opacity: (bbPlaying && bbFilmLoaded) ? 0.1 : 1,
          transition: 'opacity 1.5s ease',
        }} />
        {/* Dark overlay — minimal so film shows through */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(to bottom, rgba(20,20,20,0.35) 0%, rgba(0,0,0,0.08) 25%, rgba(0,0,0,0.08) 75%, rgba(20,20,20,0.4) 100%)',
        }} />

        {/* Hidden audio */}
        <audio ref={beatboxAudioRef} preload="none" crossOrigin="anonymous" />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, width: '100%', padding: 'clamp(60px,8vw,100px) clamp(24px,6vw,80px)', textAlign: 'center' }}>

          {/* Recording Studio header */}
          <h2 style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: 'clamp(48px, 10vw, 120px)',
            fontWeight: 400,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: '#fff',
            margin: '0 0 16px 0',
            lineHeight: 0.92,
            textShadow: '0 2px 20px rgba(0,0,0,0.5)',
          }}>
            Recording<br />Studio
          </h2>
          <div style={{
            fontSize: 'clamp(10px, 1.2vw, 12px)', letterSpacing: '0.4em', fontFamily: "'Space Mono', monospace",
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
            marginBottom: '24px',
          }}>
            The Single · Debut Release
          </div>
          {/* Album title */}
          <h3 style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: 'clamp(32px, 6vw, 72px)',
            fontWeight: 400,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            lineHeight: 0.95,
            margin: '0 0 8px 0',
            color: '#fff',
            textShadow: '0 2px 20px rgba(0,0,0,0.5)',
          }}>
            {ALBUM.title}
          </h3>
          <div style={{
            fontSize: 'clamp(10px, 1.2vw, 13px)', letterSpacing: '0.4em', fontFamily: "'Space Mono', monospace",
            textTransform: 'uppercase', color: 'rgba(200,230,255,0.4)',
            marginBottom: '24px',
          }}>
            The Single · Miss AL Simpson
          </div>
          <div style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: 'clamp(22px, 4vw, 40px)',
            fontWeight: 400,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            lineHeight: 1.05,
            marginBottom: '16px',
            background: 'linear-gradient(110deg, #b0c8d4 0%, #ffffff 30%, #a8c0cc 55%, #ffffff 80%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            animation: 'shimmerSlow 6s linear infinite',
          }}>
            Sound as Sovereign Object.
          </div>
          <div
            data-hoverable
            onClick={() => navigate('/studio')}
            style={{
              fontSize: '11px', letterSpacing: '0.3em', fontFamily: "'Space Mono', monospace",
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
              cursor: 'pointer', marginBottom: 'clamp(32px, 5vw, 60px)',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'inline-block', paddingBottom: '6px',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(200,230,255,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            Explore Studio →
          </div>

          {/* Now Playing label */}
          {bbPlaying && (
            <div style={{
              fontSize: 'clamp(11px, 1.2vw, 14px)', letterSpacing: '0.5em', fontFamily: "'Space Mono', monospace",
              textTransform: 'uppercase', color: 'rgba(200,230,255,0.7)',
              marginBottom: '24px',
              textShadow: '0 0 20px rgba(200,230,255,0.3)',
              animation: 'filmCrossfade 0.6s ease both',
            }}>
              ◆ Now Playing — Diamond Drones Are a Girl's Best Friend
            </div>
          )}

          {/* ── VINYL RECORD + TONEARM ── */}
          <div style={{
            position: 'relative',
            width: 'clamp(280px, 40vw, 440px)',
            margin: '0 auto',
            overflow: 'visible',
          }}>
            {/* Tonearm */}
            <div style={{
              position: 'absolute',
              top: '-12%', right: '-22%',
              width: '55%', height: '75%',
              zIndex: 5, pointerEvents: 'none',
              transformOrigin: '82% 8%',
              transform: bbPlaying ? 'rotate(-16deg)' : 'rotate(-38deg)',
              transition: 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              {/* Pivot base */}
              <div style={{
                position: 'absolute', top: '-4px', right: '-4px',
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'radial-gradient(circle at 40% 35%, #666 0%, #444 50%, #333 100%)',
                border: '1.5px solid rgba(255,255,255,0.2)',
                boxShadow: '0 0 16px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)',
              }} />
              {/* Pivot center dot */}
              <div style={{
                position: 'absolute', top: '5px', right: '5px',
                width: '10px', height: '10px', borderRadius: '50%',
                background: 'radial-gradient(circle, #888 0%, #555 100%)',
                border: '0.5px solid rgba(255,255,255,0.3)',
              }} />
              {/* Arm shaft */}
              <div style={{
                position: 'absolute', top: '9px', right: '12px',
                width: 'calc(100% - 18px)', height: '3px',
                background: 'linear-gradient(to bottom, rgba(200,200,200,0.85), rgba(160,160,160,0.6), rgba(120,120,120,0.4))',
                transformOrigin: 'right center',
                borderRadius: '1.5px',
                boxShadow: '0 1px 6px rgba(0,0,0,0.4), 0 -0.5px 0 rgba(255,255,255,0.1)',
              }} />
              {/* Counter-weight (behind pivot) */}
              <div style={{
                position: 'absolute', top: '3px', right: '-16px',
                width: '14px', height: '14px', borderRadius: '50%',
                background: 'radial-gradient(circle at 40% 35%, #555 0%, #333 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }} />
              {/* Headshell */}
              <div style={{
                position: 'absolute', top: '3px', left: '-4px',
                width: '18px', height: '14px',
                background: 'linear-gradient(135deg, #999 0%, #777 40%, #888 100%)',
                border: '0.5px solid rgba(255,255,255,0.25)',
                borderRadius: '1px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }} />
              {/* Stylus/needle */}
              <div style={{
                position: 'absolute', top: '16px', left: '4px',
                width: '1.5px', height: '10px',
                background: 'linear-gradient(to bottom, rgba(200,230,255,0.5), rgba(200,230,255,0.9))',
                boxShadow: bbPlaying ? '0 0 8px rgba(200,230,255,0.6), 0 0 3px rgba(200,230,255,0.4)' : 'none',
              }} />
            </div>

            {/* Vinyl record — clickable */}
            <div
              data-hoverable
              onClick={toggleBeatbox}
              style={{
                position: 'relative',
                width: '100%', paddingBottom: '100%',
                cursor: 'pointer',
              }}
            >
              <div style={{
                position: 'absolute', inset: 0,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #f0f0f0 0%, #d8dce0 20%, #e8ecf0 35%, #c8ccd0 50%, #dce0e4 65%, #d0d4d8 80%, #e0e4e8 100%)',
                boxShadow: bbPlaying
                  ? '0 0 80px rgba(255,255,255,0.3), 0 0 160px rgba(200,230,255,0.2), inset 0 0 60px rgba(255,255,255,0.1)'
                  : '0 0 50px rgba(255,255,255,0.12), inset 0 0 50px rgba(255,255,255,0.05), 0 10px 40px rgba(0,0,0,0.5)',
                animation: bbPlaying ? 'diamondSpin 1.82s linear infinite' : 'none',
                transition: 'box-shadow 0.5s',
              }}>
                {/* Groove rings */}
                {[6, 10, 14, 18, 22, 26, 30, 34, 55, 59, 63, 67, 71, 75].map((pct, gi) => (
                  <div key={gi} style={{
                    position: 'absolute', inset: `${pct}%`,
                    borderRadius: '50%',
                    border: '0.5px solid rgba(0,0,0,0.06)',
                  }} />
                ))}

                {/* Diamond shimmer overlay */}
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: `conic-gradient(
                    from 0deg,
                    transparent 0deg, rgba(200,230,255,0.08) 30deg,
                    transparent 60deg, rgba(255,255,255,0.12) 120deg,
                    transparent 150deg, rgba(200,230,255,0.06) 210deg,
                    transparent 240deg, rgba(255,255,255,0.1) 300deg,
                    transparent 330deg, rgba(200,230,255,0.08) 360deg
                  )`,
                  pointerEvents: 'none',
                }} />

                {/* Center label */}
                <div style={{
                  position: 'absolute', inset: '35%',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #383838 0%, #252525 50%, #303030 100%)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
                }}>
                  <div style={{
                    fontSize: 'clamp(5px, 0.7vw, 7px)', letterSpacing: '0.3em',
                    fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.45)', marginBottom: '5px',
                    textAlign: 'center', lineHeight: 1.4,
                    padding: '0 10%',
                  }}>
                    {ALBUM.label || 'Drones of Suburbia Music Studios'}
                  </div>
                  <div style={{ width: '50%', height: '1px', background: 'rgba(255,255,255,0.15)', marginBottom: '5px' }} />
                  <div style={{
                    fontSize: 'clamp(7px, 1vw, 10px)', letterSpacing: '0.12em',
                    fontFamily: '"Anton", sans-serif',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.8)', marginBottom: '3px',
                    textAlign: 'center', lineHeight: 1.2,
                    padding: '0 8%',
                  }}>
                    {bbPlaying ? "Diamond Drones Are a Girl's Best Friend" : "Diamond Drones Are a Girl's Best Friend"}
                  </div>
                  <div style={{
                    fontSize: 'clamp(5px, 0.6vw, 7px)', letterSpacing: '0.2em',
                    fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.35)',
                  }}>
                    {bbPlaying ? '▶ Now Playing' : 'Single · Miss AL Simpson'}
                  </div>
                  {/* Center hole */}
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: '#3a3a3a',
                    boxShadow: 'inset 0 0 3px rgba(0,0,0,0.5)',
                  }} />
                </div>

                {/* Glint sweep */}
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  overflow: 'hidden', pointerEvents: 'none',
                }}>
                  <div style={{
                    position: 'absolute', top: 0, bottom: 0, width: '25%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    transform: 'skewX(-15deg)',
                    animation: 'glintSweepBeatbox 5s 1.5s ease-in-out infinite',
                  }} />
                </div>
              </div>

              {/* Fixed sheen overlay */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'linear-gradient(135deg, transparent 25%, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.12) 48%, rgba(255,255,255,0.06) 56%, transparent 70%)',
                pointerEvents: 'none',
              }} />
            </div>

            {/* Play/pause hint */}
            <div style={{
              textAlign: 'center', marginTop: '20px',
              fontSize: '10px', letterSpacing: '0.3em',
              fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
              color: bbPlaying ? 'rgba(200,230,255,0.5)' : 'rgba(255,255,255,0.25)',
              transition: 'color 0.3s',
            }}>
              {bbPlaying ? '◆ Click to pause' : '◇ Click to play'}
            </div>
          </div>

          {/* ── TRANSPORT + TRACKLIST BELOW VINYL ── */}
          <div style={{ maxWidth: '700px', margin: '40px auto 0', width: '100%' }}>

            {/* Transport bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              marginBottom: '16px',
            }}>
              {/* Progress bar */}
              <div style={{
                flex: 1, height: '3px', background: 'rgba(255,255,255,0.06)',
                position: 'relative', overflow: 'hidden', cursor: 'pointer',
              }}
                onClick={(e) => {
                  if (!beatboxAudioRef.current || !bbDuration) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  beatboxAudioRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * bbDuration;
                }}
              >
                <div style={{
                  position: 'absolute', top: 0, left: 0, bottom: 0,
                  width: bbDuration ? `${(bbProgress / bbDuration) * 100}%` : '0%',
                  background: 'linear-gradient(90deg, rgba(200,230,255,0.3), rgba(200,230,255,0.7))',
                  transition: 'width 0.3s linear',
                }} />
              </div>

            </div>

            {/* Single track */}
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.12)',
            }}>
              <div
                data-hoverable
                onClick={() => playBeatboxTrack(10)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  background: bbPlaying ? 'rgba(200,230,255,0.05)' : 'transparent',
                  borderLeft: bbPlaying ? '2px solid rgba(200,230,255,0.5)' : '2px solid transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { if (!bbPlaying) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = bbPlaying ? 'rgba(200,230,255,0.05)' : 'transparent'; }}
              >
                <span style={{
                  fontSize: '10px', fontFamily: "'Space Mono', monospace",
                  color: bbPlaying ? 'rgba(200,230,255,0.9)' : 'rgba(255,255,255,0.4)',
                  width: '22px', textAlign: 'right', flexShrink: 0,
                  animation: bbPlaying ? 'pulse 1.5s ease-in-out infinite' : 'none',
                }}>
                  {bbPlaying ? '◆' : '01'}
                </span>
                <span style={{
                  fontSize: '12px', fontFamily: 'Georgia, serif', fontStyle: 'italic',
                  color: bbPlaying ? '#fff' : 'rgba(255,255,255,0.55)',
                  transition: 'color 0.2s',
                }}>
                  Diamond Drones Are a Girl's Best Friend
                </span>
                <span style={{
                  marginLeft: 'auto', fontSize: '8px', letterSpacing: '0.3em',
                  fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
                  color: 'rgba(200,230,255,0.3)',
                }}>
                  Single
                </span>
              </div>
            </div>

            {/* Credit */}
            <div style={{
              marginTop: '16px',
              fontSize: '9px', letterSpacing: '0.3em', fontFamily: "'Space Mono', monospace",
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.1)',
            }}>
              Miss AL Simpson · 2026
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── WORLD PREMIERE — Diamond Drones Are a Girl's Best Friend ──        */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative', minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* Premiere film background */}
        <video autoPlay muted loop playsInline style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
          filter: 'contrast(1.1)',
          opacity: 0.5,
        }}>
          <source src="/films/11-diamond-drones-are-a-girls-best-friend.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, #3a3a3a 0%, rgba(0,0,0,0.3) 15%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.3) 85%, #3a3a3a 100%)',
        }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 clamp(24px, 6vw, 80px)', maxWidth: '900px' }}>
          {/* Premiere kicker */}
          <div style={{
            fontSize: '10px', letterSpacing: '0.6em', fontFamily: "'Space Mono', monospace",
            textTransform: 'uppercase', color: 'rgba(200,230,255,0.5)',
            marginBottom: '32px',
            animation: 'fadeUp 1s ease 0.1s both',
          }}>
            ◆ World Premiere ◆
          </div>

          {/* Film + track title */}
          <div style={{ animation: 'fadeUp 1s ease 0.25s both' }}>
            <div style={{
              fontSize: 'clamp(42px, 10vw, 110px)',
              fontWeight: 400, letterSpacing: '0.04em', lineHeight: 0.9,
              fontFamily: '"Anton", "Arial Black", sans-serif',
              textTransform: 'uppercase',
              background: 'linear-gradient(110deg, #b0c8d4 0%, #ddeef4 12%, #ffffff 22%, #a8c0cc 33%, #d8ecf4 44%, #ffffff 52%, #b4ccd8 62%, #e0f0f6 73%, #ffffff 82%, #a4bcc8 100%)',
              backgroundSize: '300% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              animation: 'crystalShimmer 5s linear infinite',
              marginBottom: '24px',
            }}>
              Diamond Drones<br />Are a Girl's<br />Best Friend<sup style={{ fontSize: '0.3em', verticalAlign: 'super', WebkitTextFillColor: 'rgba(255,255,255,0.5)', backgroundClip: 'unset', WebkitBackgroundClip: 'unset' }}>™</sup>
            </div>
          </div>

          {/* Series context */}
          <div style={{ animation: 'fadeUp 1s ease 0.4s both' }}>
            <p style={{
              fontSize: 'clamp(14px, 1.6vw, 19px)', lineHeight: 1.9,
              fontFamily: 'Georgia, serif', fontStyle: 'italic',
              color: 'rgba(255,255,255,0.45)',
              maxWidth: '520px', margin: '0 auto 12px',
            }}>
              The final film and closing track of The Drones of Suburbia.
            </p>
            <p style={{
              fontSize: 'clamp(13px, 1.4vw, 16px)', lineHeight: 1.9,
              fontFamily: 'Georgia, serif', fontStyle: 'italic',
              color: 'rgba(255,255,255,0.3)',
              maxWidth: '480px', margin: '0 auto',
            }}>
              Debuting here. Track 11 of 11. The series ends where the diamond begins.
            </p>
          </div>

          {/* CTA */}
          <div style={{ animation: 'fadeUp 1s ease 0.6s both', marginTop: '48px' }}>
            <button
              data-hoverable
              onClick={() => navigate('/cinema')}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(200,230,255,0.4)',
                color: '#fff', padding: '18px 48px',
                fontSize: '11px', letterSpacing: '0.35em',
                textTransform: 'uppercase', fontFamily: "'Space Mono', monospace",
                cursor: 'pointer', backdropFilter: 'blur(8px)',
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,230,255,0.15)'; e.currentTarget.style.borderColor = 'rgba(200,230,255,0.8)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(200,230,255,0.4)'; }}
            >
              ▶ Watch the Premiere
            </button>
          </div>

          {/* Credit line */}
          <div style={{
            marginTop: '40px', animation: 'fadeUp 1s ease 0.75s both',
            fontSize: '9px', letterSpacing: '0.4em', fontFamily: "'Space Mono', monospace",
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)',
          }}>
            A film by {LORE.artist.name} · The Drones of Suburbia · {SITE_META.year}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── "A WORLD OF DIAMOND MACHINES" STATEMENT ──                          */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        padding: 'clamp(100px, 14vw, 200px) clamp(24px, 6vw, 80px)',
        textAlign: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}>
        {/* Rolling gallery background */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', gap: '6px',
          opacity: 0.35,
          pointerEvents: 'none',
        }}>
          {[
            { imgs: GALLERY_ROW_1, anim: 'scrollLeft', dur: '80s' },
            { imgs: GALLERY_ROW_2, anim: 'scrollRight', dur: '75s' },
            { imgs: GALLERY_ROW_3, anim: 'scrollLeft', dur: '85s' },
            { imgs: GALLERY_ROW_4, anim: 'scrollRight', dur: '70s' },
          ].map((row, ri) => (
            <div key={ri} style={{ display: 'flex', width: 'max-content', animation: `${row.anim} ${row.dur} linear infinite` }}>
              {[...row.imgs, ...row.imgs].map((src, i) => (
                <img key={`r${ri}-${i}`} src={src} alt="Diamond Drone artwork" loading="lazy" style={{
                  width: 'clamp(100px, 12vw, 160px)', height: 'clamp(100px, 12vw, 160px)', objectFit: 'cover',
                  marginRight: '6px', borderRadius: '2px',
                }} />
              ))}
            </div>
          ))}
        </div>
        {/* Soft vignette — keeps text readable without hiding art */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'radial-gradient(ellipse at 50% 50%, rgba(58,58,58,0.15) 0%, rgba(58,58,58,0.55) 55%, #3a3a3a 100%)',
          pointerEvents: 'none',
        }} />

        {/* Text content on top */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            fontSize: '11px', letterSpacing: '0.5em', fontFamily: "'Space Mono', monospace",
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
            marginBottom: '24px',
          }}>
            The World
          </div>
          <h2 style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: 'clamp(40px, 8vw, 100px)',
            textTransform: 'uppercase', letterSpacing: '0.04em',
            lineHeight: 0.95, margin: '0 0 24px',
            background: 'linear-gradient(110deg, #b0c8d4 0%, #ffffff 30%, #a8c0cc 55%, #ffffff 80%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'shimmerSlow 6s linear infinite',
          }}>
            {LORE.title}
          </h2>
          <p style={{
            maxWidth: '560px', margin: '0 auto 20px',
            fontSize: 'clamp(14px, 1.5vw, 18px)', lineHeight: 1.9,
            fontFamily: 'Georgia, serif', fontStyle: 'italic',
            color: 'rgba(255,255,255,0.4)',
          }}>
            {LORE.paragraphs[0]}
          </p>
          <p style={{
            maxWidth: '480px', margin: '0 auto',
            fontSize: 'clamp(12px, 1.2vw, 15px)', lineHeight: 1.8,
            fontFamily: 'Georgia, serif', fontStyle: 'italic',
            color: 'rgba(200,230,255,0.35)',
          }}>
            1000 unique generative diamond drones. Each one cut, classed, and named.
          </p>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── THE DRONE BLONDES — immersive showpiece section ──                    */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={marilynsRef}
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: 'clamp(100px, 14vw, 200px) 0',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: '#060606',
        }}
      >
        {/* Video wash background */}
        <video
          autoPlay muted loop playsInline
          src="/marilyns/marilyns-reel.mp4"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            opacity: 0.15,
            animation: 'marilynsPulse 8s ease-in-out infinite',
            mixBlendMode: 'lighten',
            pointerEvents: 'none',
          }}
        />

        {/* Gradient overlays for depth */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, #060606 0%, transparent 20%, transparent 80%, #060606 100%)',
          pointerEvents: 'none', zIndex: 1,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 40%, #060606 90%)',
          pointerEvents: 'none', zIndex: 1,
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(24px, 5vw, 60px)' }}>

          {/* Section label */}
          <div style={{
            textAlign: 'center', marginBottom: '20px',
            opacity: marilynsVisible ? 1 : 0,
            transform: marilynsVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease, transform 0.8s ease',
          }}>
            <span style={{
              fontSize: '11px', letterSpacing: '0.5em',
              fontFamily: "'Space Mono', monospace",
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)',
            }}>
              ♛ 100 Unique 1/1 Artworks
            </span>
          </div>

          {/* Title */}
          <h2 style={{
            textAlign: 'center', margin: '0 0 30px',
            fontFamily: '"Anton", sans-serif',
            fontSize: 'clamp(48px, 10vw, 120px)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            lineHeight: 0.9,
            background: 'linear-gradient(110deg, #c0c0c0 0%, #ffffff 35%, #a0a0a0 60%, #ffffff 85%)',
            backgroundSize: '250% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: marilynsVisible ? 'shimmerSlow 5s linear infinite' : 'none',
            opacity: marilynsVisible ? 1 : 0,
            transform: marilynsVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s',
          }}>
            The Drone Blondes
          </h2>

          {/* Dynamic multi-line description */}
          <div style={{
            textAlign: 'center', margin: '0 auto 24px',
            opacity: marilynsVisible ? 1 : 0,
            transform: marilynsVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s',
          }}>
            <div style={{
              fontSize: 'clamp(18px, 2.5vw, 28px)',
              fontFamily: '"Anton", sans-serif',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.4,
            }}>
              Trained. Inked. Tattooed.
            </div>
          </div>

          <p style={{
            textAlign: 'center', margin: '0 auto 16px',
            maxWidth: '600px',
            fontSize: 'clamp(14px, 1.4vw, 17px)',
            lineHeight: 1.9, fontFamily: 'Georgia, serif', fontStyle: 'italic',
            color: 'rgba(255,255,255,0.38)',
            opacity: marilynsVisible ? 1 : 0,
            transform: marilynsVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s',
          }}>
            Every Drone Blonde is a collision of AI and the artist's hand — generated imagery intervened with original painting, ink drawing and bespoke hand-drawn tattoos by Miss AL Simpson.
          </p>

          <div style={{
            textAlign: 'center', margin: '0 auto 60px',
            opacity: marilynsVisible ? 1 : 0,
            transform: marilynsVisible ? 'translateY(0)' : 'translateY(15px)',
            transition: 'opacity 0.8s ease 0.45s, transform 0.8s ease 0.45s',
          }}>
            <span style={{
              fontSize: '11px', letterSpacing: '0.4em',
              fontFamily: "'Space Mono', monospace",
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.2)',
            }}>
              No two alike · Every collector owns a masterpiece
            </span>
          </div>

          {/* Image grid — 3 columns × 2 rows */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'clamp(8px, 1.5vw, 16px)',
            marginBottom: '60px',
          }}>
            {[2, 7, 11, 15, 19, 23].map((id, idx) => (
              <div
                key={id}
                data-hoverable
                onClick={() => navigate('/lounge')}
                style={{
                  position: 'relative',
                  aspectRatio: '16/9',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  borderRadius: '2px',
                  opacity: marilynsVisible ? 1 : 0,
                  transform: marilynsVisible ? 'translateY(0)' : 'translateY(40px)',
                  transition: `opacity 0.7s ease ${0.3 + idx * 0.1}s, transform 0.7s ease ${0.3 + idx * 0.1}s`,
                }}
              >
                <img
                  src={`/marilyns/Drone Blonde ${id}.png`}
                  alt={`Drone Blonde ${id}`}
                  loading="lazy"
                  style={{
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.6s ease, filter 0.6s ease',
                    filter: 'brightness(0.7) contrast(1.1)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.filter = 'brightness(1) contrast(1.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'brightness(0.7) contrast(1.1)'; }}
                />
                {/* Subtle silver border overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  border: '1px solid rgba(255,255,255,0.08)',
                  pointerEvents: 'none',
                }} />
              </div>
            ))}
          </div>

          {/* CTA button */}
          <div style={{
            textAlign: 'center',
            opacity: marilynsVisible ? 1 : 0,
            transform: marilynsVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease 1s, transform 0.8s ease 1s',
          }}>
            <button
              data-hoverable
              onClick={() => navigate('/lounge')}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.45)',
                padding: '14px 44px',
                fontSize: '11px', letterSpacing: '0.3em',
                textTransform: 'uppercase',
                fontFamily: "'Space Mono', monospace",
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,200,200,0.6)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.background = 'transparent'; }}
            >
              ♛ Enter The Drone Blondes →
            </button>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── TWO DROPS EXPLAINER ──                                              */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: 'clamp(60px, 8vw, 100px) clamp(24px, 6vw, 80px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          fontSize: '11px', letterSpacing: '0.5em', fontFamily: "'Space Mono', monospace",
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)',
          marginBottom: '48px', textAlign: 'center',
        }}>
          The Collection
        </div>

        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            fontFamily: '"Anton", sans-serif', fontSize: 'clamp(22px, 3vw, 32px)',
            textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '16px',
          }}>
            One Brand · One Complete World
          </div>
          <p style={{
            fontSize: 'clamp(13px, 1.3vw, 15px)', lineHeight: 1.9,
            fontFamily: 'Georgia, serif', fontStyle: 'italic',
            color: 'rgba(255,255,255,0.4)', margin: '0 0 20px',
          }}>
            Three collections form the universe — 1000 generative Diamond Drones, 120 Drone Blondes photographs, and the debut single. A complete artistic world by Miss AL Simpson.
          </p>
          <div style={{
            fontSize: '10px', letterSpacing: '0.3em', fontFamily: "'Space Mono', monospace",
            color: 'rgba(255,255,255,0.2)',
          }}>
            1000 Diamond Drones {'\u00B7'} 120 Drone Blondes {'\u00B7'} The Single
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── ABOUT THE WORLD ──                                                   */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={loreRef}
        style={{
          padding: 'clamp(100px, 12vw, 180px) clamp(24px, 6vw, 100px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Section header */}
        <div style={{
          textAlign: 'center', marginBottom: 'clamp(60px, 8vw, 100px)',
          opacity: loreVisible ? 1 : 0,
          transform: loreVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 1s ease, transform 1s ease',
        }}>
          <div style={{
            fontSize: '11px', letterSpacing: '0.5em', fontFamily: "'Space Mono', monospace",
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)',
            marginBottom: '24px',
          }}>
            About the World
          </div>
          <h2 style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: 'clamp(32px, 6vw, 72px)',
            textTransform: 'uppercase', letterSpacing: '0.04em',
            lineHeight: 0.95, margin: 0,
            background: 'linear-gradient(110deg, #b0c8d4 0%, #ffffff 30%, #a8c0cc 55%, #ffffff 80%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: loreVisible ? 'shimmerSlow 6s linear infinite' : 'none',
          }}>
            The Drones<br />of Suburbia
          </h2>
        </div>

        {/* Two-column lore + artist */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'clamp(40px, 6vw, 80px)', maxWidth: '1100px', margin: '0 auto',
          alignItems: 'start',
        }}>
          <div style={{
            opacity: loreVisible ? 1 : 0,
            transform: loreVisible ? 'translateY(0)' : 'translateY(25px)',
            transition: 'opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s',
          }}>
            {LORE.paragraphs.map((p, i) => (
              <p key={i} style={{
                fontSize: 'clamp(14px, 1.4vw, 17px)', lineHeight: 2,
                color: i === 0 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.3)',
                fontFamily: 'Georgia, serif', fontStyle: 'italic',
                marginBottom: '20px',
              }}>
                {p}
              </p>
            ))}
          </div>

          <div style={{
            opacity: loreVisible ? 1 : 0,
            transform: loreVisible ? 'translateY(0)' : 'translateY(25px)',
            transition: 'opacity 0.8s ease 0.4s, transform 0.8s ease 0.4s',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            paddingLeft: 'clamp(24px, 4vw, 60px)',
          }}>
            <div style={{
              fontSize: '11px', letterSpacing: '0.4em', fontFamily: "'Space Mono', monospace",
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)', marginBottom: '20px',
            }}>
              Artist / Founder
            </div>
            <div style={{
              fontSize: 'clamp(18px, 2.5vw, 28px)',
              fontFamily: '"Anton", sans-serif',
              textTransform: 'uppercase', letterSpacing: '0.04em',
              color: 'rgba(255,255,255,0.7)', marginBottom: '16px',
            }}>
              {LORE.artist.name}
            </div>
            <p style={{
              fontSize: 'clamp(13px, 1.3vw, 15px)', lineHeight: 1.9,
              color: 'rgba(255,255,255,0.32)', fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
            }}>
              {LORE.artist.bio}
            </p>
          </div>
        </div>

        {/* Discover the Legend CTA */}
        <div style={{
          textAlign: 'center',
          marginTop: 'clamp(60px, 8vw, 100px)',
          opacity: loreVisible ? 1 : 0,
          transition: 'opacity 1s ease 0.6s',
        }}>
          <button
            data-hoverable
            onClick={() => navigate('/lore')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.4)',
              padding: '14px 40px',
              fontSize: '11px', letterSpacing: '0.3em',
              textTransform: 'uppercase',
              fontFamily: "'Space Mono', monospace",
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,230,255,0.5)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
          >
            ◇ Discover the Legend →
          </button>
        </div>
      </section>

      {/* ── SOCIALS STRIP ── */}
      <section style={{
        padding: 'clamp(48px, 8vw, 80px) clamp(24px, 6vw, 80px)',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{
          fontSize: '10px', letterSpacing: '0.5em', fontFamily: "'Space Mono', monospace",
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)', marginBottom: '28px',
        }}>
          Follow the World
        </div>
        <div style={{
          display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap',
        }}>
          {[
            { label: '𝕏 Diamond Drones', href: 'https://x.com/diamonddronesco' },
            { label: '𝕏 Miss AL Simpson', href: 'https://x.com/missalsimpson' },
            { label: 'IG Diamond Drones', href: 'https://www.instagram.com/diamonddronesco' },
            { label: 'IG Drones of Suburbia', href: 'https://www.instagram.com/thedronesofsuburbia/' },
            { label: 'IG Miss AL Simpson', href: 'https://www.instagram.com/annalouisesimpson/' },
          ].map(s => (
            <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
              style={{
                fontSize: '10px', fontFamily: "'Space Mono', monospace", letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
                textDecoration: 'none', transition: 'all 0.3s',
                border: '1px solid rgba(255,255,255,0.08)', padding: '10px 20px',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(200,230,255,0.4)'; e.currentTarget.style.background = 'rgba(200,230,255,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'transparent'; }}
            >
              {s.label}
            </a>
          ))}
        </div>
      </section>

      {/* ── END ── */}
    </div>
  );
}
