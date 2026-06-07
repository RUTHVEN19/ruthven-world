import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const COLLECTIONS = [
  {
    key: 'diamond_drones',
    label: 'Diamond Drones',
    icon: '\u25C6',
    desc: '4K archival PNG of your Diamond Drone',
    fileLabel: '4K PNG',
    images: ['/vault/1.png', '/vault/420.png', '/vault/850.png', '/vault/250.png', '/vault/600.png', '/vault/950.png'],
    accent: 'rgba(200,230,255,0.4)',
  },
  {
    key: 'drone_blondes',
    label: 'Drone Blondes',
    icon: '\u265B',
    desc: 'High-resolution film file of your Drone Blonde',
    fileLabel: 'Film File',
    images: ['/marilyns/web/Drone Blonde 5.jpg', '/marilyns/web/Drone Blonde 12.jpg', '/marilyns/web/Drone Blonde 21.jpg', '/marilyns/web/Drone Blonde 8.jpg', '/marilyns/web/Drone Blonde 15.jpg', '/marilyns/web/Drone Blonde 3.jpg'],
    accent: 'rgba(255,220,200,0.4)',
  },
];

const FILMS_CARD = {
  key: 'films',
  label: '4K Films',
  icon: '\u25C8',
  desc: 'Full 4K archival master of your 1/1 film',
  fileLabel: '4K MP4',
  filmSrc: '/films/dd-the-vault.mp4',
  accent: 'rgba(255,200,255,0.4)',
};

// Design tokens matching DiamondDronesHome
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
  display: "'Oswald', 'Anton', sans-serif",
  body:    "'Crimson Pro', Georgia, serif",
  mono:    "'JetBrains Mono', 'Space Mono', monospace",
};

export default function DroneDownloads() {
  const [wallet, setWallet] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError('No Ethereum wallet detected. Please install MetaMask.');
      return;
    }
    setConnecting(true);
    setError('');
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts[0]) setWallet(accounts[0]);
    } catch {
      setError('Wallet connection declined.');
    } finally {
      setConnecting(false);
    }
  }, []);

  useEffect(() => {
    if (!wallet || !selectedCollection) return;
    setLoadingTokens(true);
    setTokens([]);
    setError('');
    setSuccessMsg('');

    fetch(`${API}/download/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet, collection: selectedCollection }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        setTokens(data.tokens || []);
      })
      .catch(() => setError('Failed to fetch your tokens.'))
      .finally(() => setLoadingTokens(false));
  }, [wallet, selectedCollection]);

  const handleDownload = async (tokenId) => {
    setDownloading(tokenId);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API}/download/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, collection: selectedCollection, token_id: tokenId }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Download request failed.');
        setDownloading(null);
        return;
      }
      const link = document.createElement('a');
      link.href = data.download_url;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccessMsg('Download started!');
    } catch {
      setError('Download failed. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const collectionMeta = COLLECTIONS.find((c) => c.key === selectedCollection);

  return (
    <>
      <Helmet>
        <title>Downloads | Diamond Drones Are a Girl&#39;s Best Friend</title>
        <meta name="description" content="Token-gated downloads for Diamond Drones, Drone Blondes, and Film holders." />
        <meta property="og:title" content="Downloads | Diamond Drones™" />
        <meta property="og:description" content="Token-gated downloads for Diamond Drones, Drone Blondes, and Film holders." />
        <meta property="og:image" content="https://diamonddrones.world/og-image.png" />
        <meta property="og:url" content="https://diamonddrones.world/downloads" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <style>{`
        @keyframes ddDlShimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes ddDlFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ddDlFloat0 {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes ddDlFloat1 {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(6px); }
        }
        @keyframes ddDlFloat2 {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-5px); }
        }
        .dd-dl-card:hover {
          border-color: rgba(217,230,240,0.3) !important;
          background: rgba(217,230,240,0.04) !important;
          transform: translateY(-2px);
        }
        .dd-dl-card:hover .dd-dl-card-glow {
          opacity: 1 !important;
        }
        .dd-dl-btn:hover {
          border-color: ${C.ice} !important;
          background: rgba(217,230,240,0.1) !important;
          box-shadow: 0 0 20px rgba(217,230,240,0.1);
        }
        @media (max-width: 700px) {
          .dd-dl-collections { grid-template-columns: 1fr !important; }
          .dd-dl-hero-images { display: none !important; }
          .dd-dl-films-card { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{
        background: C.bg, color: C.text,
        fontFamily: font.body, fontStyle: 'italic',
        minHeight: '100vh', position: 'relative', overflow: 'hidden',
        lineHeight: 1.6,
      }}>

        {/* Background film */}
        <video
          autoPlay muted loop playsInline preload="none"
          style={{
            position: 'fixed', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', opacity: 0.1, pointerEvents: 'none', zIndex: 0,
          }}
        >
          <source src="/films/dd-the-vault.mp4" type="video/mp4" />
        </video>
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 30%, rgba(10,10,12,0.4) 0%, rgba(10,10,12,0.95) 70%)',
        }} />

        {/* ═══ HERO ═══ */}
        <div style={{
          position: 'relative', zIndex: 1,
          textAlign: 'center',
          padding: 'clamp(100px, 14vw, 180px) clamp(24px, 6vw, 80px) clamp(60px, 8vw, 100px)',
        }}>
          {/* Floating preview images behind hero */}
          <div className="dd-dl-hero-images" style={{
            position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2vw',
          }}>
            {['/vault/420.png', '/vault/1.png', '/vault/850.png'].map((src, i) => (
              <div key={i} style={{
                width: 'clamp(100px, 12vw, 180px)',
                aspectRatio: '2/3',
                borderRadius: '2px',
                overflow: 'hidden',
                opacity: 0.15,
                animation: `ddDlFloat${i} ${5 + i * 1.5}s ease-in-out infinite`,
                boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
                transform: `rotate(${i === 0 ? -3 : i === 2 ? 3 : 0}deg)`,
              }}>
                <img src={src} alt="Diamond Drone artwork preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            ))}
          </div>

          <div style={{
            fontFamily: font.mono, fontSize: '0.65rem', letterSpacing: '0.4em',
            textTransform: 'uppercase', color: C.textFaint, fontStyle: 'normal',
            marginBottom: '1.5rem',
            animation: 'ddDlFadeUp 0.8s ease-out both',
          }}>
            {'\u25C6'} Token-Gated {'\u25C6'}
          </div>

          <h1 style={{
            fontFamily: font.display, fontWeight: 700, fontStyle: 'normal',
            fontSize: 'clamp(3.5rem, 10vw, 8rem)',
            lineHeight: 1,
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
            margin: '0 0 1.5rem',
            background: 'linear-gradient(105deg, #8a9aaa 0%, #d9e6f0 20%, #ffffff 30%, #d9e6f0 40%, #8a9aaa 50%, #d9e6f0 60%, #ffffff 70%, #d9e6f0 80%, #8a9aaa 100%)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'ddDlShimmer 6s linear infinite, ddDlFadeUp 1s ease-out both',
          }}>
            DOWNLOADS
          </h1>

          <p style={{
            fontFamily: font.body, fontStyle: 'italic',
            fontSize: 'clamp(1rem, 1.6vw, 1.25rem)',
            color: C.textDim,
            maxWidth: '540px', margin: '0 auto',
            lineHeight: 1.8,
            animation: 'ddDlFadeUp 1.2s ease-out both',
          }}>
            Your wallet proves ownership. Unlock exclusive high-resolution
            files for every token you hold.
          </p>
        </div>

        {/* ═══ COLLECTION CARDS ═══ */}
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          padding: '0 clamp(24px, 6vw, 80px)',
          position: 'relative', zIndex: 1,
        }}>
          <div className="dd-dl-collections" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'clamp(12px, 2vw, 24px)',
            marginBottom: 'clamp(20px, 3vw, 32px)',
          }}>
            {COLLECTIONS.map((c, ci) => (
              <div
                key={c.key}
                className="dd-dl-card"
                style={{
                  border: `1px solid ${C.line}`,
                  background: 'rgba(255,255,255,0.015)',
                  overflow: 'hidden',
                  cursor: 'default',
                  transition: 'all 0.4s ease',
                  position: 'relative',
                  animation: `ddDlFadeUp ${0.8 + ci * 0.15}s ease-out both`,
                }}
              >
                {/* Artwork preview strip / Vinyl disc */}
                {c.isVinyl ? (
                  <div style={{
                    height: '200px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'radial-gradient(ellipse at 50% 50%, rgba(30,30,35,1) 0%, rgba(10,10,12,1) 100%)',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    {/* White diamond vinyl — matching Studio page */}
                    <div style={{
                      width: '160px', height: '160px', borderRadius: '50%', position: 'relative',
                      background: 'radial-gradient(circle, #f0f0f0 0%, #d8dce0 20%, #e8ecf0 35%, #c8ccd0 50%, #dce0e4 65%, #d0d4d8 80%, #e0e4e8 100%)',
                      boxShadow: '0 0 40px rgba(255,255,255,0.1), inset 0 0 50px rgba(255,255,255,0.05), 0 8px 30px rgba(0,0,0,0.4)',
                    }}>
                      {/* Groove rings */}
                      {[6, 10, 14, 18, 22, 26, 30, 34, 55, 59, 63, 67, 71, 75].map((pct, i) => (
                        <div key={i} style={{
                          position: 'absolute', inset: `${pct}%`,
                          borderRadius: '50%',
                          border: '0.5px solid rgba(0,0,0,0.06)',
                        }} />
                      ))}
                      {/* Diamond shimmer */}
                      <div style={{
                        position: 'absolute', inset: 0, borderRadius: '50%',
                        background: 'conic-gradient(from 0deg, transparent 0deg, rgba(200,230,255,0.08) 30deg, transparent 60deg, rgba(255,255,255,0.12) 120deg, transparent 150deg, rgba(200,230,255,0.06) 210deg, transparent 240deg, rgba(255,255,255,0.1) 300deg, transparent 330deg, rgba(200,230,255,0.08) 360deg)',
                        pointerEvents: 'none',
                      }} />
                      {/* Dark center label */}
                      <div style={{
                        position: 'absolute', inset: '35%', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #383838 0%, #252525 50%, #303030 100%)',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
                      }}>
                        <span style={{
                          fontSize: '4px', fontFamily: font.mono, fontStyle: 'normal',
                          letterSpacing: '0.25em', textTransform: 'uppercase',
                          color: 'rgba(255,255,255,0.5)', marginBottom: '3px',
                        }}>
                          Drones of Suburbia
                        </span>
                        <div style={{ width: '50%', height: '0.5px', background: 'rgba(255,255,255,0.15)', marginBottom: '3px' }} />
                        <span style={{
                          fontSize: '5px', fontFamily: font.display, fontStyle: 'normal',
                          letterSpacing: '0.12em', textTransform: 'uppercase',
                          color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 1.2,
                        }}>
                          The Drones of Suburbia
                        </span>
                        <span style={{
                          fontSize: '3.5px', fontFamily: font.mono, fontStyle: 'normal',
                          letterSpacing: '0.15em', textTransform: 'uppercase',
                          color: 'rgba(255,255,255,0.35)', marginTop: '2px',
                        }}>
                          Vol. I · Miss AL Simpson
                        </span>
                        {/* Center hole */}
                        <div style={{
                          position: 'absolute', top: '50%', left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '5px', height: '5px', borderRadius: '50%',
                          background: '#3a3a3a',
                          boxShadow: 'inset 0 0 3px rgba(0,0,0,0.5)',
                        }} />
                      </div>
                      {/* Fixed sheen */}
                      <div style={{
                        position: 'absolute', inset: 0, borderRadius: '50%',
                        background: 'linear-gradient(135deg, transparent 25%, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.12) 48%, rgba(255,255,255,0.06) 56%, transparent 70%)',
                        pointerEvents: 'none',
                      }} />
                    </div>
                    {/* Fade to card bg */}
                    <div style={{
                      position: 'absolute', inset: 0, pointerEvents: 'none',
                      background: 'linear-gradient(180deg, transparent 50%, rgba(10,10,12,0.8) 100%)',
                    }} />
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: c.images.length === 1 ? '1fr' : `repeat(${Math.min(c.images.length, 3)}, 1fr)`,
                    gap: '2px',
                    height: '200px',
                    overflow: 'hidden',
                  }}>
                    {c.images.slice(0, 3).map((src, j) => (
                      <div key={j} style={{
                        overflow: 'hidden', position: 'relative',
                      }}>
                        <img src={src} alt={`${c.label} preview`} style={{
                          width: '100%', height: '100%',
                          objectFit: 'cover', display: 'block',
                          filter: 'brightness(0.7) contrast(1.1)',
                          transition: 'transform 0.6s ease',
                        }} />
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'linear-gradient(180deg, transparent 40%, rgba(10,10,12,0.8) 100%)',
                          pointerEvents: 'none',
                        }} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Card content */}
                <div style={{ padding: 'clamp(20px, 3vw, 28px)' }}>
                  <div style={{
                    fontFamily: font.display, fontWeight: 700, fontStyle: 'normal',
                    fontSize: 'clamp(1.2rem, 2vw, 1.5rem)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: C.iceBright,
                    marginBottom: '8px',
                  }}>
                    {c.label}
                    {c.key === 'diamond_drones' && <span style={{ fontSize: '0.5em', verticalAlign: 'super' }}>{'\u2122'}</span>}
                  </div>
                  <div style={{
                    fontFamily: font.body, fontStyle: 'italic',
                    fontSize: '0.95rem', color: C.textDim,
                    lineHeight: 1.6, marginBottom: '12px',
                  }}>
                    {c.desc}
                  </div>
                  <div style={{
                    fontFamily: font.mono, fontStyle: 'normal',
                    fontSize: '0.55rem', letterSpacing: '0.2em',
                    textTransform: 'uppercase', color: C.textFaint,
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <span style={{ color: c.accent, fontSize: '8px' }}>{'\u25C6'}</span>
                    {c.fileLabel}
                  </div>
                </div>

                {/* Hover glow */}
                <div className="dd-dl-card-glow" style={{
                  position: 'absolute', bottom: 0, left: '10%', right: '10%', height: '1px',
                  background: `linear-gradient(90deg, transparent, ${c.accent}, transparent)`,
                  opacity: 0, transition: 'opacity 0.4s ease',
                }} />
              </div>
            ))}
          </div>

          {/* ═══ 4K FILMS CARD — full width below ═══ */}
          <div
            className="dd-dl-card dd-dl-films-card"
            style={{
              border: `1px solid ${C.line}`,
              background: 'rgba(255,255,255,0.015)',
              overflow: 'hidden',
              cursor: 'default',
              transition: 'all 0.4s ease',
              position: 'relative',
              marginBottom: 'clamp(48px, 6vw, 80px)',
              animation: 'ddDlFadeUp 1.25s ease-out both',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
            }}
          >
            {/* Video preview */}
            <div style={{ position: 'relative', overflow: 'hidden', minHeight: '220px' }}>
              <video
                autoPlay muted loop playsInline preload="metadata"
                style={{
                  width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                  filter: 'brightness(0.6) contrast(1.1)',
                }}
              >
                <source src={FILMS_CARD.filmSrc} type="video/mp4" />
              </video>
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'linear-gradient(90deg, transparent 60%, rgba(10,10,12,0.9) 100%)',
              }} />
            </div>

            {/* Card content */}
            <div style={{
              padding: 'clamp(28px, 4vw, 48px)',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
            }}>
              <div style={{
                fontFamily: font.mono, fontStyle: 'normal',
                fontSize: '0.55rem', letterSpacing: '0.3em',
                textTransform: 'uppercase', color: C.textFaint,
                marginBottom: '12px',
              }}>
                {'\u25C8'} 4 × 1/1 Film NFTs
              </div>
              <div style={{
                fontFamily: font.display, fontWeight: 700, fontStyle: 'normal',
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: C.iceBright,
                marginBottom: '12px',
              }}>
                4K Films
              </div>
              <div style={{
                fontFamily: font.body, fontStyle: 'italic',
                fontSize: '1rem', color: C.textDim,
                lineHeight: 1.8, marginBottom: '16px',
                maxWidth: '400px',
              }}>
                Full 4K archival masters of the Diamond Drones Are a Girl's Best Friend
                film series. Each film is a unique 1/1 NFT with token-gated download
                of the original 4K master file.
              </div>
              <div style={{
                fontFamily: font.mono, fontStyle: 'normal',
                fontSize: '0.55rem', letterSpacing: '0.2em',
                textTransform: 'uppercase', color: C.textFaint,
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <span style={{ color: FILMS_CARD.accent, fontSize: '8px' }}>{'\u25C6'}</span>
                4K MP4
              </div>
            </div>

            {/* Hover glow */}
            <div className="dd-dl-card-glow" style={{
              position: 'absolute', bottom: 0, left: '10%', right: '10%', height: '1px',
              background: `linear-gradient(90deg, transparent, ${FILMS_CARD.accent}, transparent)`,
              opacity: 0, transition: 'opacity 0.4s ease',
            }} />
          </div>

          {/* ═══ DOWNLOAD PANEL ═══ */}
          <div style={{
            border: `1px solid ${C.line}`,
            background: 'rgba(10,10,14,0.6)',
            backdropFilter: 'blur(8px)',
            padding: 'clamp(32px, 5vw, 56px)',
            position: 'relative',
            animation: 'ddDlFadeUp 1.4s ease-out both',
          }}>
            {/* Subtle top accent line */}
            <div style={{
              position: 'absolute', top: 0, left: '15%', right: '15%', height: '1px',
              background: `linear-gradient(90deg, transparent, rgba(217,230,240,0.2), transparent)`,
            }} />

            {/* Messages */}
            {error && (
              <div style={{
                background: 'rgba(220,60,60,0.08)',
                border: '1px solid rgba(220,60,60,0.25)',
                padding: '14px 20px', marginBottom: '24px',
                fontFamily: font.mono, fontStyle: 'normal',
                fontSize: '0.65rem', color: '#e88', lineHeight: 1.6,
              }}>
                {error}
              </div>
            )}
            {successMsg && (
              <div style={{
                background: 'rgba(60,220,120,0.06)',
                border: '1px solid rgba(60,220,120,0.2)',
                padding: '14px 20px', marginBottom: '24px',
                fontFamily: font.mono, fontStyle: 'normal',
                fontSize: '0.65rem', color: '#8e8', lineHeight: 1.6,
              }}>
                {successMsg}
              </div>
            )}

            {/* Downloads coming post-mint */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-block',
                padding: '14px 32px',
                fontFamily: font.display, fontStyle: 'normal',
                fontSize: '0.8rem', letterSpacing: '0.25em',
                textTransform: 'uppercase',
                border: `1px solid rgba(217,230,240,0.3)`,
                color: C.ice,
                background: 'rgba(217,230,240,0.04)',
                marginBottom: '2rem',
              }}>
                {'\u25C6'} Coming Soon {'\u25C6'}
              </div>

              {/* Preview mosaic */}
              <div style={{
                display: 'flex', justifyContent: 'center', gap: '8px',
                marginBottom: '2rem', opacity: 0.3,
              }}>
                {['/vault/1.png', '/marilyns/Drone%20Blonde%201.png', '/vault/600.png', '/marilyns/Drone%20Blonde%2012.png', '/vault/850.png'].map((src, i) => (
                  <div key={i} style={{
                    width: '60px', height: '80px', overflow: 'hidden',
                    borderRadius: '1px',
                  }}>
                    <img src={src} alt="Collection preview" style={{
                      width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                      filter: 'brightness(0.6)',
                    }} />
                  </div>
                ))}
              </div>

              <p style={{
                fontFamily: font.body, fontStyle: 'italic',
                fontSize: '1rem', color: C.textDim,
                lineHeight: 1.8,
                maxWidth: '480px', margin: '0 auto',
              }}>
                Token-gated downloads will unlock after minting. Hold a Diamond Drone,
                Drone Blonde, or Film token to access exclusive high-resolution files.
              </p>
            </div>
          </div>

          {/* ═══ FOOTER ═══ */}
          <div style={{
            marginTop: 'clamp(60px, 8vw, 100px)',
            paddingBottom: '40px',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: font.mono, fontStyle: 'normal',
              fontSize: '0.55rem', letterSpacing: '0.3em',
              textTransform: 'uppercase', color: C.textFaint,
            }}>
              DIAMOND DRONES{'\u2122'} {'\u00B7'} Token-Gated Downloads {'\u00B7'} Exclusive for Holders
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
