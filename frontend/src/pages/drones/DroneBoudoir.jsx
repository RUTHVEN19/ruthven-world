import { useState, useCallback, useMemo, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Helmet } from 'react-helmet-async';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import BoudoirScene from './boudoir/BoudoirScene';
import BoudoirHUD from './boudoir/BoudoirHUD';
import BoudoirBrowser from './boudoir/BoudoirBrowser';
import { CAMERA_PRESETS } from './boudoir/boudoirLayout';


/**
 * DroneBoudoir — Top-level Boudoir page
 * Desktop: immersive 3D noir gallery showcasing The Drone Blondes
 * Mobile / no WebGL: simple 2D fallback
 * Audio is handled by parent DronesWorld — persists across zone navigation.
 */
export default function DroneBoudoir() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [focusedMarilyn, setFocusedMarilyn] = useState(null);
  const [cameraTarget, setCameraTarget] = useState(null);
  const [viewMode, setViewMode] = useState('3d');
  const [sceneReady, setSceneReady] = useState(false);

  // Lock body scroll for immersive 3D
  useEffect(() => {
    if (!isMobile && viewMode === '3d') {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isMobile, viewMode]);

  // Detect WebGL support
  const hasWebGL = useMemo(() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    } catch { return false; }
  }, []);

  const handleArtworkFocus = useCallback((marilyn) => {
    setFocusedMarilyn(marilyn);
  }, []);

  const handleArtworkUnfocus = useCallback(() => {
    setFocusedMarilyn(null);
  }, []);

  const handleNavigate = useCallback((presetKey) => {
    const preset = CAMERA_PRESETS[presetKey];
    if (preset) {
      setCameraTarget({
        cameraPos: preset.position,
        lookAt: preset.target,
      });
      setFocusedMarilyn(null);
      setTimeout(() => setCameraTarget(null), 100);
    }
  }, []);

  // Mobile / no WebGL fallback — image gallery
  if (isMobile || !hasWebGL) {
    const BLONDE_IDS = Array.from({ length: 24 }, (_, i) => i * 5 + 1); // 1,6,11,...,116
    return (
      <>
        <Helmet>
          <title>The Drone Blondes | Miss AL Simpson</title>
          <meta name="description" content="120 unique Drone Blondes — AI ink interventions on B&W photography by Miss AL Simpson." />
          <meta property="og:title" content="The Drone Blondes — Diamond Drones™" />
          <meta property="og:description" content="120 unique Drone Blondes. AI ink interventions on B&W photography by Miss AL Simpson." />
          <meta property="og:image" content="https://diamonddrones.world/og-image.png" />
          <meta property="og:url" content="https://diamonddrones.world/lounge" />
          <meta name="twitter:card" content="summary_large_image" />
        </Helmet>
        <style>{`
          @keyframes blondeFadeUp {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <div style={{
          minHeight: 'calc(100vh - 52px)',
          background: '#141416',
          padding: '40px 16px',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              fontSize: '36px', marginBottom: '12px',
              color: 'rgba(255,255,255,0.15)',
            }}>♛</div>
            <div style={{
              fontFamily: '"Anton", sans-serif',
              fontSize: '28px', textTransform: 'uppercase',
              letterSpacing: '2px', color: '#fff',
              marginBottom: '8px',
            }}>The Drone Blondes</div>
            <div style={{
              fontFamily: '"Space Mono", monospace',
              fontSize: '10px', letterSpacing: '3px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.35)',
              marginBottom: '16px',
            }}>120 Unique 1/1 Artworks</div>
            <div style={{
              fontFamily: 'Georgia, serif',
              fontSize: '13px', fontStyle: 'italic',
              color: 'rgba(255,255,255,0.3)',
              maxWidth: '360px', margin: '0 auto', lineHeight: 1.7,
            }}>
              AI Ink Interventions with hand-drawn bespoke tattoos by Miss AL Simpson
            </div>
            <a
              href="https://opensea.io/collection/drone-blondes"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                marginTop: '20px',
                padding: '10px 24px',
                fontFamily: '"Space Mono", monospace',
                fontSize: '10px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: 'rgba(200,230,255,0.7)',
                border: '1px solid rgba(200,230,255,0.2)',
                background: 'rgba(200,230,255,0.06)',
                textDecoration: 'none',
                transition: 'all 0.3s',
              }}
            >
              View on OpenSea
            </a>
          </div>

          {/* Image grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            maxWidth: '500px',
            margin: '0 auto',
          }}>
            {BLONDE_IDS.map((id, i) => (
              <a
                key={id}
                href={`https://opensea.io/assets/ethereum/0x505348E10069D5083842532f5F5FA432631d109e/${id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  position: 'relative',
                  aspectRatio: '1',
                  overflow: 'hidden',
                  background: '#1a1a1e',
                  animation: `blondeFadeUp 0.6s ease ${i * 0.05}s both`,
                  display: 'block',
                  textDecoration: 'none',
                }}
              >
                <img
                  src={`/marilyns/web/Drone%20Blonde%20${id}.jpg`}
                  alt={`Drone Blonde #${id}`}
                  loading="lazy"
                  style={{
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    filter: 'contrast(1.05)',
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0, left: 0, right: 0,
                  padding: '8px 10px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  fontFamily: '"Space Mono", monospace',
                  fontSize: '9px', letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.5)',
                }}>
                  #{id}
                </div>
              </a>
            ))}
          </div>

          {/* Brand footer */}
          <div style={{
            textAlign: 'center', marginTop: '40px', paddingBottom: '40px',
          }}>
            <div style={{
              display: 'inline-block',
              padding: '12px 28px',
              fontFamily: '"Space Mono", monospace',
              fontSize: '10px', letterSpacing: '3px',
              textTransform: 'uppercase',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.5)',
            }}>
              {'\u265B'} The Drone Blondes {'\u265B'}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Browse mode
  if (viewMode === 'browse') {
    return (
      <>
        <Helmet>
          <title>The Lounge — Browse All 120 Drone Blondes | Miss AL Simpson</title>
          <meta name="description" content="Browse all 120 Drone Blonde NFTs with traits, filters, and rarity data." />
          <meta property="og:title" content="Browse All 120 Drone Blondes — Diamond Drones™" />
          <meta property="og:description" content="Browse all 120 Drone Blonde NFTs with traits, filters, and rarity data." />
          <meta property="og:image" content="https://diamonddrones.world/og-image.png" />
          <meta property="og:url" content="https://diamonddrones.world/lounge" />
          <meta name="twitter:card" content="summary_large_image" />
          <script type="application/ld+json">{JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "The Drone Blondes — 120 Unique AI Ink Interventions",
            "url": "https://diamonddrones.world/lounge",
            "description": "120 unique 1/1 AI ink interventions on black-and-white photography by Miss AL Simpson.",
            "mainEntity": {
              "@type": "VisualArtwork",
              "name": "Drone Blondes",
              "artMedium": "AI Ink Intervention on B&W photography",
              "artform": "NFT",
              "creator": { "@type": "Person", "name": "Miss AL Simpson" },
              "numberOfItems": 120,
              "description": "120 unique Drone Blondes. Each features hand-drawn bespoke tattoos — AI ink interventions on black-and-white photography."
            }
          })}</script>
        </Helmet>
        <BoudoirBrowser onSwitch3D={() => setViewMode('3d')} />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>The Drone Blondes | Miss AL Simpson</title>
        <meta name="description" content="Enter The Drone Blondes — an immersive gallery showcasing 120 unique 1/1 AI Ink Interventions by Miss AL Simpson." />
        <meta property="og:title" content="The Drone Blondes — Diamond Drones™" />
        <meta property="og:description" content="An immersive 3D gallery showcasing 120 unique 1/1 AI Ink Interventions by Miss AL Simpson." />
        <meta property="og:image" content="https://diamonddrones.world/og-image.png" />
        <meta property="og:url" content="https://diamonddrones.world/lounge" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div style={{
        width: '100%',
        height: 'calc(100vh - 52px)',
        position: 'relative',
        background: '#141416',
        overflow: 'hidden',
      }}>
        {/* ── 3D Canvas ── */}
        <Suspense fallback={
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#141416',
          }}>
            <div style={{
              fontFamily: '"Space Mono", monospace',
              fontSize: '11px', letterSpacing: '4px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
            }}>
              Entering The Drone Blondes...
            </div>
          </div>
        }>
          <Canvas
            camera={{
              position: CAMERA_PRESETS.entrance.position,
              fov: 55,
              near: 0.1,
              far: 100,
            }}
            dpr={[1, 1.5]}
            gl={{
              antialias: true,
              powerPreference: 'high-performance',
              toneMapping: 3, // ACESFilmicToneMapping
              toneMappingExposure: 1.8,
            }}
            style={{ width: '100%', height: '100%' }}
            onCreated={() => setTimeout(() => setSceneReady(true), 600)}
          >
            <color attach="background" args={['#141416']} />
            <BoudoirScene
              onArtworkFocus={handleArtworkFocus}
              onArtworkUnfocus={handleArtworkUnfocus}
              externalFocusTarget={cameraTarget}
              onBrowseAll={() => setViewMode('browse')}
            />
          </Canvas>
        </Suspense>

        {/* ── Cinematic edge glow / vignette ── */}
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 5,
          boxShadow: 'inset 0 0 120px 40px rgba(0, 0, 0, 0.15), inset 0 0 60px 20px rgba(0, 0, 0, 0.08)',
          background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0, 0, 0, 0.15) 85%, rgba(0, 0, 0, 0.3) 100%)',
        }} />

        {/* ── Loading overlay — branded screen until scene renders ── */}
        {!sceneReady && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#141416',
            zIndex: 50,
            transition: 'opacity 0.6s ease',
          }}>
            <style>{`
              @keyframes blondePulse {
                0%, 100% { opacity: 0.4; }
                50% { opacity: 1; }
              }
              @keyframes blondeBar {
                0% { width: 0%; }
                100% { width: 100%; }
              }
            `}</style>
            <div style={{
              fontFamily: '"Space Mono", monospace',
              fontSize: '11px',
              letterSpacing: '6px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '16px',
              animation: 'blondePulse 2s ease-in-out infinite',
            }}>
              Entering The Lounge
            </div>
            <div style={{
              fontFamily: '"Anton", sans-serif',
              fontSize: 'clamp(28px, 5vw, 48px)',
              color: '#fff',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '32px',
            }}>
              The Drone Blondes
            </div>
            <div style={{
              width: '200px',
              height: '2px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '1px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.8))',
                animation: 'blondeBar 3s ease-in-out infinite',
              }} />
            </div>
            <div style={{
              fontFamily: 'Georgia, serif',
              fontSize: '13px',
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.25)',
              marginTop: '24px',
            }}>
              Loading 120 artworks...
            </div>
          </div>
        )}

        {/* ── 2D HUD Overlay ── */}
        <BoudoirHUD
          focusedMarilyn={focusedMarilyn}
          onNavigate={handleNavigate}
          onUnfocus={handleArtworkUnfocus}
          onBrowseAll={() => setViewMode('browse')}
        />

        {/* ── Fullscreen Artwork Overlay ── */}
        {focusedMarilyn && (
          <div
            onClick={handleArtworkUnfocus}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.92)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              cursor: 'pointer',
              animation: 'boudoirFadeIn 0.4s ease-out',
            }}
          >
            <img
              src={`/marilyns/Drone%20Blonde%20${focusedMarilyn.id}.png`}
              alt={focusedMarilyn.title || 'Drone Blonde'}
              style={{
                maxWidth: '85vw',
                maxHeight: '78vh',
                objectFit: 'contain',
                borderRadius: '2px',
                boxShadow: '0 0 60px rgba(0,0,0,0.8)',
              }}
            />
            {focusedMarilyn.title && (
              <div style={{
                marginTop: '20px',
                fontFamily: '"Anton", sans-serif',
                fontSize: '18px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.6)',
              }}>
                {focusedMarilyn.title}
              </div>
            )}
            <div style={{
              marginTop: '12px',
              fontFamily: '"Space Mono", monospace',
              fontSize: '10px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.25)',
            }}>
              Click anywhere to close
            </div>
          </div>
        )}

        {/* ── Compact mint bar (bottom) — config-driven ── */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          zIndex: 20,
          pointerEvents: 'none',
        }}>
          <div style={{
            pointerEvents: 'auto',
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
          }}>
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '9px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.45)',
            }}>
              The Drone Blondes {'\u00B7'} 120 Unique 1/1 Artworks
            </span>
          </div>
        </div>

        <style>{`
          @keyframes boudoirFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </div>
    </>
  );
}
