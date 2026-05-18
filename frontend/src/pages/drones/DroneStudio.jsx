import { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { ethers } from 'ethers';
import { Helmet } from 'react-helmet-async';
import { Canvas } from '@react-three/fiber';
import { ALBUM, ZONES, ALBUM_MINT_CONFIG, EXTERNAL_MINT } from '../../config/dronesContent';
import { useWallet } from '../../hooks/useWallet';
// import MintCTA from '../../components/MintCTA'; // re-enable when drops go live
import { useMediaQuery } from '../../hooks/useMediaQuery';
import StudioScene from './studio/StudioScene';
import { CAMERA } from './studio/studioLayout';

const zone = ZONES.find(z => z.slug === 'studio');

const keyframes = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmerSlow {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes crystalShimmer {
    0%   { background-position: -300% center; }
    100% { background-position: 300% center; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.3; }
    50%       { opacity: 0.9; }
  }
  @keyframes priceGlow {
    0%, 100% { text-shadow: 0 0 20px rgba(200,230,255,0.3), 0 0 40px rgba(200,230,255,0.15); }
    50%       { text-shadow: 0 0 30px rgba(200,230,255,0.6), 0 0 60px rgba(200,230,255,0.3), 0 0 100px rgba(200,230,255,0.15); }
  }
  @keyframes diamondBounce {
    0%, 100% { transform: rotate(45deg) translateY(0); }
    50%       { transform: rotate(45deg) translateY(var(--bounce-height, -20px)); }
  }
  @keyframes diamondPulse {
    0%, 100% { box-shadow: 0 0 4px rgba(200,230,255,0.05); }
    50%       { box-shadow: 0 0 12px rgba(200,230,255,0.25); }
  }
  @keyframes diamondSpin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes glintSweep {
    0%   { left: -80%; opacity: 0; }
    20%  { opacity: 0.8; }
    100% { left: 160%; opacity: 0; }
  }
  @keyframes vuMeter {
    0%, 100% { width: 30%; }
    25%       { width: 75%; }
    50%       { width: 55%; }
    75%       { width: 85%; }
  }
  @keyframes blinkRec {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0.3; }
  }
  @keyframes filmFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
`;

// Waveform heights for diamond drone visualiser
const DRONE_BARS = Array.from({ length: 40 }, (_, i) => {
  const seed = Math.sin(i * 0.7 + 1.3) * 0.5 + 0.5;
  return { height: seed, delay: i * 0.06, speed: 1 + (i % 5) * 0.35 };
});

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const UPLOADS_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';

// Map track indices to album file paths (MP3 320kbps served from /public)
const TRACK_FILES = [
  '/album/01-The-Drones-of-Suburbia.mp3',
  '/album/02-Les-Drones-de-la-Banlieue.mp3',
  '/album/03-The-Drones-of-Suburbia-Roma.mp3',
  '/album/04-The-Drones-of-Suburbia-Roma-Summer-2025-Edit.mp3',
  '/album/05-Hollywood-Drones.mp3',
  '/album/06-The-Drones-of-Suburbia-Frequency-Edit.mp3',
  '/album/07-Drone-Driver.mp3',
  '/album/08-Suburbia-Was-Never-Out-There.mp3',
  '/album/09-Surveillance-Subway.mp3',
  '/album/10-Heist.mp3',
  '/album/11-Diamond-Drones-Are-a-Girls-Best-Friend.mp3',
];

// Map track indices to their short film videos (drop files into /public/films/)
const TRACK_FILMS = [
  '/films/01-the-drones-of-suburbia.mp4',
  '/films/02-les-drones-de-la-banlieue.mp4',
  '/films/03-the-drones-of-suburbia-roma.mp4',
  '/films/04-roma-summer-edit.mp4',
  '/films/HOLLYWOOD DRONES FINAL.mp4',
  '/films/06-frequency-edit.mp4',
  '/films/07-drone-driver.mp4',
  '/films/08-suburbia-was-never-out-there.mp4',
  '/films/09-surveillance-subway.mp4',
  '/films/10-heist.mp4',
  '/films/dd-jewellery-box.mp4',
];

export default function DroneStudio() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const audioRef = useRef(null);
  const filmRef = useRef(null);
  const { account, isConnected } = useWallet();
  const [playing, setPlaying] = useState(false);
  const [hoveredTrack, setHoveredTrack] = useState(null);
  const [playingTrack, setPlayingTrack] = useState(null);
  const [isHolder, setIsHolder] = useState(false);
  const [checkingHolder, setCheckingHolder] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [filmLoaded, setFilmLoaded] = useState(false);

  // Detect WebGL support for 3D studio hero
  const hasWebGL = useMemo(() => {
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch { return false; }
  }, []);

  // Check holder status when wallet connects
  useEffect(() => {
    if (!isConnected || !account || ALBUM_MINT_CONFIG.contractAddress === 'TBA') {
      setIsHolder(false);
      return;
    }
    setCheckingHolder(true);
    fetch(`${API_BASE}/album/verify-holder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: account }),
    })
      .then(r => r.json())
      .then(data => setIsHolder(data.is_holder === true))
      .catch(() => setIsHolder(false))
      .finally(() => setCheckingHolder(false));
  }, [account, isConnected]);

  // Sync film video to playing track
  useEffect(() => {
    if (filmRef.current && playingTrack !== null) {
      const filmSrc = TRACK_FILMS[playingTrack];
      if (filmRef.current.src !== filmSrc) {
        filmRef.current.src = filmSrc;
        filmRef.current.load();
        setFilmLoaded(false);
      }
      filmRef.current.play().catch(() => {});
    } else if (filmRef.current && !playing) {
      filmRef.current.pause();
    }
  }, [playingTrack, playing]);

  const toggleAudio = (trackIndex) => {
    if (!audioRef.current) return;
    if (playing && playingTrack === trackIndex) {
      audioRef.current.pause();
      setPlaying(false);
      setPlayingTrack(null);
    } else {
      const trackFile = TRACK_FILES[trackIndex];
      if (trackFile) {
        if (!audioRef.current.src.endsWith(trackFile)) {
          audioRef.current.src = trackFile;
          audioRef.current.load();
        }
      }
      audioRef.current.play().then(() => {
        setPlaying(true);
        setPlayingTrack(trackIndex);
      }).catch(() => {});
    }
  };

  const handleDownload = async () => {
    if (!isConnected || !account) return;
    setDownloading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const message = 'Download THE DRONES OF SUBURBIA album';
      const signature = await signer.signMessage(message);
      const response = await fetch(`${API_BASE}/album/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: account, signature, message }),
      });
      if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Download failed'); }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'The_Drones_of_Suburbia_-_Miss_AL_Simpson.zip';
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) { alert(err.message || 'Download failed'); }
    finally { setDownloading(false); }
  };

  const currentTrack = playingTrack !== null ? ALBUM.tracks[playingTrack] : null;

  return (
    <div style={{ background: '#3a3a3a', minHeight: '100vh', color: '#fff', position: 'relative' }}>
      <Helmet>
        <title>Recording Studio — The Drones of Suburbia Album</title>
        <meta name="description" content="Stream The Drones of Suburbia album. 11 tracks by Miss AL Simpson. Own the album on-chain as an open edition NFT." />
      </Helmet>
      <style>{keyframes}</style>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        style={{ display: 'none' }}
        onEnded={() => { setPlaying(false); setPlayingTrack(null); }}
      />

      {/* ── FULL-PAGE FILM BACKGROUND (fixed, covers entire page) ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        pointerEvents: 'none', overflow: 'hidden',
      }}>
        {/* Default hero video — visible when no track is playing */}
        <video autoPlay muted loop playsInline style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
          filter: 'grayscale(100%) contrast(1.1)',
          opacity: (playing && filmLoaded) ? 0 : 0.35,
          transition: 'opacity 1.5s ease',
        }}>
          <source src="/drones-hero.mp4" type="video/mp4" />
        </video>

        {/* Short film — fades in when a track is playing */}
        <video
          ref={filmRef}
          muted loop playsInline
          onCanPlay={() => setFilmLoaded(true)}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center center',
            filter: 'grayscale(60%) contrast(1.15)',
            opacity: (playing && filmLoaded) ? 0.6 : 0,
            transition: 'opacity 2s ease',
          }}
        />

        {/* Dark overlay for readability */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(58,58,58,0.35) 0%, rgba(58,58,58,0.5) 30%, rgba(58,58,58,0.6) 60%, rgba(58,58,58,0.7) 100%)',
        }} />
      </div>

      {/* ── All content sits above the fixed film ── */}
      <div style={{ position: 'relative', zIndex: 1 }}>

      {/* ── HERO — 3D Recording Studio or video fallback ── */}
      <div style={{
        position: 'relative', height: '75vh', minHeight: '500px',
        overflow: 'hidden', background: '#0a0a0a',
        zIndex: 2,
      }}>
        {/* 3D Studio Canvas (desktop + WebGL) */}
        {hasWebGL && !isMobile ? (
          <Suspense fallback={null}>
            <Canvas
              camera={{
                position: CAMERA.position,
                fov: CAMERA.fov,
                near: 0.1,
                far: 50,
              }}
              gl={{
                antialias: true,
                toneMapping: 4,
                toneMappingExposure: 2.0,
              }}
              style={{ width: '100%', height: '100%' }}
            >
              <color attach="background" args={['#0a0a0a']} />
              <StudioScene />
            </Canvas>
          </Suspense>
        ) : (
          /* Video fallback for mobile / no WebGL */
          <div style={{ position: 'absolute', inset: 0 }} />
        )}

        {/* Bottom gradient fade into page */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, transparent 0%, transparent 50%, rgba(58,58,58,0.5) 75%, rgba(58,58,58,0.95) 100%)',
        }} />

        {/* Now-showing film title at very top */}
        {playing && currentTrack && (
          <div style={{
            position: 'absolute', top: '24px', left: '50%',
            transform: 'translateX(-50%)', zIndex: 5,
            fontSize: '9px', letterSpacing: '0.5em', fontFamily: "'Space Mono', monospace",
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
            whiteSpace: 'nowrap', animation: 'fadeUp 0.8s ease both',
          }}>
            ▶ Now Showing — {currentTrack.title}
          </div>
        )}

        {/* Title overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '64px clamp(24px,6vw,80px)', zIndex: 2,
          pointerEvents: 'none',
        }}>
          <div style={{
            fontSize: '11px', letterSpacing: '0.4em', fontFamily: "'Space Mono', monospace",
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
            marginBottom: '16px', animation: 'fadeUp 0.8s ease both',
          }}>
            Zone {zone.numeral} — Drones of Suburbia Music Studios
          </div>
          <h1 style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: 'clamp(48px, 8vw, 100px)',
            fontWeight: 400, letterSpacing: '0.04em',
            textTransform: 'uppercase', lineHeight: 0.9,
            margin: '0 0 20px', animation: 'fadeUp 0.8s ease 0.1s both',
          }}>
            {zone.title}
          </h1>
          <p style={{
            fontSize: 'clamp(14px,1.5vw,17px)', lineHeight: 1.7,
            color: 'rgba(255,255,255,0.45)', fontFamily: 'Georgia, serif',
            fontStyle: 'italic', maxWidth: '480px',
            animation: 'fadeUp 0.8s ease 0.2s both',
          }}>
            {zone.tagline}
          </p>
        </div>
      </div>

      {/* ── OWN THE ALBUM CTA — moved to top ── */}
      <section style={{
        padding: 'clamp(80px, 10vw, 140px) clamp(24px, 6vw, 80px)',
        textAlign: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'linear-gradient(180deg, #3a3a3a 0%, rgba(0,0,0,0.4) 50%, #3a3a3a 100%)',
      }}>
        {isHolder ? (
          <>
            <div style={{
              fontSize: 'clamp(10px, 1vw, 12px)', letterSpacing: '0.5em',
              fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
              color: 'rgba(200,230,255,0.25)', marginBottom: '32px',
            }}>
              ◆ Album Holder
            </div>
            <div style={{
              fontSize: 'clamp(48px, 9vw, 120px)',
              fontFamily: '"Anton", sans-serif',
              textTransform: 'uppercase', letterSpacing: '0.04em',
              lineHeight: 0.9, marginBottom: '32px',
              background: 'linear-gradient(110deg, #b0c8d4 0%, #ffffff 30%, #a8c0cc 55%, #ffffff 80%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shimmerSlow 6s linear infinite',
            }}>
              Download<br />Your Album
            </div>
            <p style={{
              fontSize: 'clamp(14px,1.5vw,17px)', lineHeight: 1.9,
              color: 'rgba(200,230,255,0.35)', fontFamily: 'Georgia, serif',
              fontStyle: 'italic', maxWidth: '440px', margin: '0 auto 44px',
            }}>
              You own this album. Stream below or download now.
            </p>
            <button
              onClick={handleDownload}
              disabled={downloading}
              style={{
                background: 'transparent',
                border: '1px solid rgba(200,230,255,0.35)',
                color: 'rgba(200,230,255,0.8)', padding: '22px 72px',
                fontSize: '13px', letterSpacing: '0.4em',
                textTransform: 'uppercase', fontFamily: "'Space Mono', monospace",
                cursor: downloading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,230,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(200,230,255,0.7)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(200,230,255,0.35)'; }}
            >
              ↓ Download Full Album
            </button>
          </>
        ) : (
          <>
            <div style={{
              fontSize: 'clamp(10px, 1vw, 12px)', letterSpacing: '0.5em',
              fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.2)', marginBottom: '28px',
            }}>
              Open Edition · 11 Tracks
            </div>
            <div style={{
              fontSize: 'clamp(52px, 10vw, 140px)',
              fontFamily: '"Anton", sans-serif',
              textTransform: 'uppercase', letterSpacing: '0.04em',
              lineHeight: 0.9, marginBottom: '28px',
              background: 'linear-gradient(110deg, #b0c8d4 0%, #ddeef4 12%, #ffffff 22%, #a8c0cc 33%, #d8ecf4 44%, #ffffff 52%, #b4ccd8 62%, #e0f0f6 73%, #ffffff 82%)',
              backgroundSize: '300% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'crystalShimmer 5s linear infinite',
            }}>
              Own the<br />Album
            </div>

            <div style={{
              fontSize: 'clamp(10px, 1.1vw, 13px)', letterSpacing: '0.45em',
              fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.22)', marginBottom: '36px',
            }}>
              Open Edition · Mint on Manifold
            </div>

            <p style={{
              fontSize: 'clamp(14px,1.5vw,17px)', lineHeight: 1.9,
              color: 'rgba(255,255,255,0.35)', fontFamily: 'Georgia, serif',
              fontStyle: 'italic', maxWidth: '480px', margin: '0 auto 20px',
            }}>
              11 original tracks by Miss AL Simpson.
              Own the album on-chain and unlock the full MP3 320kbps download.
            </p>
            <div style={{ height: '28px' }} />
            {EXTERNAL_MINT.album.mintUrl ? (
              <a
                href={EXTERNAL_MINT.album.mintUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.4)',
                  color: '#fff', padding: '22px 72px',
                  fontSize: '13px', letterSpacing: '0.4em',
                  textTransform: 'uppercase', fontFamily: "'Space Mono', monospace",
                  cursor: 'pointer', transition: 'all 0.3s',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                }}
              >
                ✦ Mint on Manifold →
              </a>
            ) : (
              <div style={{
                display: 'inline-block',
                padding: '16px 48px',
                border: '1px solid rgba(200,230,255,0.3)',
                fontFamily: "'Anton', sans-serif",
                fontSize: 'clamp(14px, 1.5vw, 18px)',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'rgba(220,235,245,0.8)',
                background: 'linear-gradient(110deg, rgba(106,138,154,0.08) 0%, rgba(176,200,212,0.12) 50%, rgba(106,138,154,0.08) 100%)',
              }}>
                ◆ Mint Coming Soon ◆
              </div>
            )}
          </>
        )}
      </section>

      {/* ── VINYL + TRACKLIST ── */}
      <section style={{
        position: 'relative',
        minHeight: '80vh',
      }}>
        <div style={{
          padding: 'clamp(60px, 8vw, 100px) clamp(24px, 6vw, 80px)',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'auto 1fr',
          gap: 'clamp(40px, 5vw, 80px)',
          alignItems: 'center',
          maxWidth: '1200px', margin: '0 auto',
        }}>
          {/* White Diamond Vinyl Record */}
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => toggleAudio(playingTrack ?? 0)}>
            <div style={{
              position: 'relative',
              width: isMobile ? 'min(280px, 80vw)' : 'clamp(340px, 45vw, 560px)',
              height: isMobile ? 'min(280px, 80vw)' : 'clamp(340px, 45vw, 560px)',
            }}>
              {/* Spinning disc — white diamond colour */}
              <div style={{
                position: 'absolute', inset: 0,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #f0f0f0 0%, #d8dce0 20%, #e8ecf0 35%, #c8ccd0 50%, #dce0e4 65%, #d0d4d8 80%, #e0e4e8 100%)',
                boxShadow: playing
                  ? '0 0 60px rgba(255,255,255,0.25), 0 0 120px rgba(200,230,255,0.15), inset 0 0 60px rgba(255,255,255,0.1)'
                  : '0 0 40px rgba(255,255,255,0.1), inset 0 0 50px rgba(255,255,255,0.05), 0 8px 30px rgba(0,0,0,0.4)',
                animation: playing ? 'diamondSpin 1.82s linear infinite' : 'none',
                transition: 'box-shadow 0.5s',
              }}>
                {/* Groove rings */}
                {[6, 10, 14, 18, 22, 26, 30, 34, 55, 59, 63, 67, 71, 75].map((pct, i) => (
                  <div key={i} style={{
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
                    fontSize: '7px', letterSpacing: '0.35em',
                    fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.5)', marginBottom: '6px',
                  }}>
                    {ALBUM.label}
                  </div>
                  <div style={{
                    width: '60%', height: '1px',
                    background: 'rgba(255,255,255,0.15)', marginBottom: '6px',
                  }} />
                  <div style={{
                    fontSize: '8px', letterSpacing: '0.15em',
                    fontFamily: '"Anton", sans-serif',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.8)', marginBottom: '3px',
                    textAlign: 'center', lineHeight: 1.2,
                  }}>
                    {playing && currentTrack ? currentTrack.title : ALBUM.title}
                  </div>
                  <div style={{
                    fontSize: '6px', letterSpacing: '0.2em',
                    fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.35)',
                  }}>
                    {playing ? '▶ Now Playing' : `Vol. I · ${ALBUM.artist}`}
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
                    animation: 'glintSweep 5s 1.5s ease-in-out infinite',
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
              textAlign: 'center', marginTop: '24px',
              fontSize: '10px', letterSpacing: '0.3em',
              fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
              color: playing ? 'rgba(200,230,255,0.5)' : 'rgba(255,255,255,0.25)',
              transition: 'color 0.3s',
            }}>
              {playing ? '◆ Click to pause' : '◇ Click to play'}
            </div>
          </div>

          {/* Tracklist beside diamond */}
          <div>
            <div style={{
              fontSize: '11px', letterSpacing: '0.4em', fontFamily: "'Space Mono', monospace",
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
              marginBottom: '6px',
            }}>
              Album
            </div>
            <div style={{
              fontFamily: '"Anton", sans-serif',
              fontSize: 'clamp(28px, 4vw, 48px)',
              textTransform: 'uppercase', letterSpacing: '0.04em',
              lineHeight: 0.95, marginBottom: '28px',
              background: 'linear-gradient(110deg, #d0d8dc 0%, #ffffff 30%, #c8d4dc 55%, #ffffff 80%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shimmerSlow 6s linear infinite',
            }}>
              {ALBUM.title}
            </div>

            {ALBUM.tracks.map((track, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredTrack(i)}
                onMouseLeave={() => setHoveredTrack(null)}
                onClick={() => toggleAudio(i)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '28px 1fr auto',
                  gap: '12px', alignItems: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  background: (playing && playingTrack === i) ? 'rgba(200,230,255,0.04)' : hoveredTrack === i ? 'rgba(255,255,255,0.03)' : 'transparent',
                  transition: 'background 0.2s',
                  padding: '12px 8px',
                }}
              >
                <div style={{
                  fontSize: '11px', letterSpacing: '0.1em',
                  fontFamily: "'Space Mono', monospace", textAlign: 'right',
                  color: (playing && playingTrack === i) ? 'rgba(200,230,255,0.7)' : 'rgba(255,255,255,0.3)',
                }}>
                  {playing && playingTrack === i
                    ? <span style={{ animation: 'pulse 1s ease-in-out infinite' }}>▶</span>
                    : hoveredTrack === i
                    ? <span style={{ color: 'rgba(255,255,255,0.5)' }}>▶</span>
                    : track.number}
                </div>
                <div style={{
                  fontSize: 'clamp(12px, 1.2vw, 15px)',
                  fontFamily: track.featured ? '"Anton", sans-serif' : 'Georgia, serif',
                  fontStyle: track.featured ? 'normal' : 'italic',
                  textTransform: track.featured ? 'uppercase' : 'none',
                  letterSpacing: track.featured ? '0.04em' : '0.01em',
                  color: (playing && playingTrack === i) ? 'rgba(200,230,255,0.8)' : track.featured
                    ? (hoveredTrack === i ? '#fff' : 'rgba(255,255,255,0.85)')
                    : (hoveredTrack === i ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)'),
                  transition: 'color 0.2s',
                }}>
                  {track.title}
                  {track.featured && (
                    <span style={{
                      marginLeft: '8px', fontSize: '8px', letterSpacing: '0.3em',
                      fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
                      color: 'rgba(200,230,255,0.4)', verticalAlign: 'middle',
                    }}>
                      Title Track
                    </span>
                  )}
                </div>
                {(hoveredTrack === i || (playing && playingTrack === i)) && (
                  <div style={{
                    fontSize: '9px', letterSpacing: '0.2em',
                    fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
                    color: (playing && playingTrack === i) ? 'rgba(200,230,255,0.5)' : 'rgba(255,255,255,0.3)',
                  }}>
                    {playing && playingTrack === i ? 'Playing' : isHolder ? 'Play' : 'Preview'}
                  </div>
                )}
              </div>
            ))}

            <div style={{
              marginTop: '16px',
              fontSize: '10px', letterSpacing: '0.25em',
              fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.2)',
            }}>
              {ALBUM.year} · Open Edition · Manifold
            </div>
          </div>
        </div>
      </section>

      {/* ── HOLDER STATUS BAR ── */}
      {isConnected && (
        <div style={{
          padding: '12px clamp(24px,6vw,80px)',
          background: isHolder ? 'rgba(200,230,255,0.04)' : 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{
            fontSize: '10px', fontFamily: "'Space Mono', monospace",
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: isHolder ? 'rgba(200,230,255,0.6)' : 'rgba(255,255,255,0.3)',
          }}>
            {checkingHolder ? 'Checking wallet...' :
             isHolder ? '◆ Album Holder — Full Access' :
             '◇ Preview Mode — Buy album for full access'}
          </div>
          {isHolder && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              style={{
                background: 'transparent',
                border: '1px solid rgba(200,230,255,0.3)',
                color: 'rgba(200,230,255,0.7)',
                padding: '8px 20px',
                fontSize: '9px', letterSpacing: '0.25em',
                fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
                cursor: downloading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
              }}
            >
              {downloading ? 'Preparing...' : '↓ Download Album'}
            </button>
          )}
        </div>
      )}

      {/* ── DIAMOND DRONE VISUALISER ── */}
      <div style={{
        padding: '0 clamp(24px,6vw,80px)',
        height: '120px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: '4px',
        overflow: 'hidden',
        background: 'rgba(0,0,0,0.15)',
      }}>
        {DRONE_BARS.map((bar, i) => {
          const size = 5 + bar.height * 7;
          const bounceH = -(10 + bar.height * 30);
          return (
            <div key={i} style={{
              flex: 1, display: 'flex', alignItems: 'center',
              justifyContent: 'center', height: '100%',
            }}>
              <div style={{
                width: size, height: size,
                border: `1px solid ${playing ? `rgba(200,230,255,${0.25 + bar.height * 0.5})` : 'rgba(255,255,255,0.12)'}`,
                background: playing ? `rgba(200,230,255,${0.04 + bar.height * 0.1})` : 'rgba(255,255,255,0.04)',
                transform: 'rotate(45deg)',
                transition: 'border-color 0.4s, background 0.4s',
                '--bounce-height': `${bounceH}px`,
                animation: playing
                  ? `diamondBounce ${bar.speed}s ${bar.delay}s ease-in-out infinite, diamondPulse ${bar.speed}s ${bar.delay}s ease-in-out infinite`
                  : 'none',
                flexShrink: 0,
              }} />
            </div>
          );
        })}

        {/* Play/pause control */}
        <button
          onClick={() => toggleAudio(playingTrack ?? 0)}
          style={{
            marginLeft: '16px', background: 'transparent',
            border: '1px solid rgba(255,255,255,0.25)',
            color: 'rgba(255,255,255,0.5)', padding: '8px 16px',
            fontSize: '10px', letterSpacing: '0.3em',
            fontFamily: "'Space Mono', monospace", textTransform: 'uppercase',
            cursor: 'pointer', flexShrink: 0, transition: 'all 0.3s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'}
        >
          {playing ? '▐▐' : '▶'}
        </button>
      </div>

      {/* ── STUDIO CONSOLE / PLAYING DECK ── */}
      <section style={{
        padding: 'clamp(40px, 5vw, 60px) clamp(24px, 6vw, 80px)',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          background: 'linear-gradient(180deg, #1a1a1a 0%, #151515 50%, #111 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '4px',
          padding: 'clamp(24px, 3vw, 40px)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}>
          {/* Console header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '24px', paddingBottom: '16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{
              fontSize: '9px', letterSpacing: '0.4em', fontFamily: "'Space Mono', monospace",
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
            }}>
              Drones of Suburbia Music Studios · Console
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '9px', letterSpacing: '0.25em', fontFamily: "'Space Mono', monospace",
              textTransform: 'uppercase',
              color: playing ? 'rgba(255,80,80,0.8)' : 'rgba(255,255,255,0.15)',
            }}>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: playing ? '#ff5050' : 'rgba(255,255,255,0.1)',
                animation: playing ? 'blinkRec 1s step-end infinite' : 'none',
              }} />
              {playing ? 'Live' : 'Standby'}
            </div>
          </div>

          {/* Now Playing display */}
          <div style={{
            background: '#0a0a0a',
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '16px 20px', marginBottom: '20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{
                fontSize: '8px', letterSpacing: '0.3em', fontFamily: "'Space Mono', monospace",
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: '6px',
              }}>
                {playing ? 'Now Playing' : 'Ready'}
              </div>
              <div style={{
                fontSize: 'clamp(14px, 1.8vw, 20px)',
                fontFamily: playing ? '"Anton", sans-serif' : 'Georgia, serif',
                fontStyle: playing ? 'normal' : 'italic',
                textTransform: playing ? 'uppercase' : 'none',
                letterSpacing: playing ? '0.04em' : '0.01em',
                color: playing ? 'rgba(200,230,255,0.85)' : 'rgba(255,255,255,0.3)',
                transition: 'color 0.3s',
              }}>
                {playing && currentTrack ? currentTrack.title : 'Select a track above'}
              </div>
            </div>
            <div style={{
              fontSize: '10px', letterSpacing: '0.15em', fontFamily: "'Space Mono', monospace",
              color: playing ? 'rgba(200,230,255,0.5)' : 'rgba(255,255,255,0.15)',
            }}>
              {playing && currentTrack ? `Track ${currentTrack.number} of 11` : '—'}
            </div>
          </div>

          {/* Transport controls */}
          <div style={{
            display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px',
          }}>
            <button
              onClick={() => { if (playingTrack !== null && playingTrack > 0) toggleAudio(playingTrack - 1); }}
              style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.4)', padding: '10px 16px',
                fontSize: '10px', fontFamily: "'Space Mono', monospace", cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            >◁◁</button>
            <button
              onClick={() => toggleAudio(playingTrack ?? 0)}
              style={{
                background: playing ? 'rgba(200,230,255,0.06)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${playing ? 'rgba(200,230,255,0.3)' : 'rgba(255,255,255,0.15)'}`,
                color: playing ? 'rgba(200,230,255,0.8)' : 'rgba(255,255,255,0.5)',
                padding: '10px 28px', fontSize: '11px', letterSpacing: '0.3em',
                fontFamily: "'Space Mono', monospace", cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = playing ? 'rgba(200,230,255,0.6)' : 'rgba(255,255,255,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = playing ? 'rgba(200,230,255,0.3)' : 'rgba(255,255,255,0.15)'}
            >
              {playing ? '▐▐  Pause' : '▶  Play'}
            </button>
            <button
              onClick={() => { if (playingTrack !== null && playingTrack < 10) toggleAudio(playingTrack + 1); }}
              style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.4)', padding: '10px 16px',
                fontSize: '10px', fontFamily: "'Space Mono', monospace", cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            >▷▷</button>

            <div style={{ flex: 1 }} />

            {/* VU meters */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <div style={{ fontSize: '8px', fontFamily: "'Space Mono', monospace", color: 'rgba(255,255,255,0.15)', letterSpacing: '0.2em' }}>L</div>
              <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  background: playing ? 'linear-gradient(90deg, rgba(200,230,255,0.3), rgba(200,230,255,0.6))' : 'rgba(255,255,255,0.05)',
                  animation: playing ? 'vuMeter 0.8s ease-in-out infinite' : 'none',
                  transition: 'background 0.3s',
                }} />
              </div>
              <div style={{ fontSize: '8px', fontFamily: "'Space Mono', monospace", color: 'rgba(255,255,255,0.15)', letterSpacing: '0.2em' }}>R</div>
              <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  background: playing ? 'linear-gradient(90deg, rgba(200,230,255,0.3), rgba(200,230,255,0.6))' : 'rgba(255,255,255,0.05)',
                  animation: playing ? 'vuMeter 0.9s 0.1s ease-in-out infinite' : 'none',
                  transition: 'background 0.3s',
                }} />
              </div>
            </div>
          </div>

          {/* Console footer */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.04)',
            fontSize: '8px', letterSpacing: '0.3em', fontFamily: "'Space Mono', monospace",
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
          }}>
            <span>MP3 · 320kbps · Stereo</span>
            <span>{ALBUM.artist} · {ALBUM.year}</span>
          </div>
        </div>
      </section>

      {/* ── Album Drop Notice ── */}
      <section style={{
        padding: 'clamp(60px, 8vw, 100px) clamp(20px, 5vw, 60px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-block',
          padding: '12px 32px',
          fontFamily: "'Anton', sans-serif",
          fontSize: 'clamp(16px, 2vw, 22px)',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          border: '1px solid rgba(160,210,230,0.4)',
          color: 'rgba(220,235,245,0.85)',
          background: 'linear-gradient(110deg, rgba(106,138,154,0.08) 0%, rgba(176,200,212,0.12) 50%, rgba(106,138,154,0.08) 100%)',
        }}>
          ◆ DROP COMING SOON ◆
        </div>
        <p style={{
          fontSize: 'clamp(11px, 1.1vw, 13px)',
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
          color: 'rgba(255,255,255,0.5)',
          marginTop: '16px',
          letterSpacing: '0.05em',
          lineHeight: 1.7,
        }}>
          The Drones of Suburbia™ Album · Open Edition · Manifold
        </p>
      </section>

      </div>{/* end content wrapper */}
    </div>
  );
}
