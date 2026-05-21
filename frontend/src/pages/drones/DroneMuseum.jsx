import { useState, useCallback, useMemo, useEffect, Suspense, lazy } from 'react';
import { Canvas } from '@react-three/fiber';
import { Helmet } from 'react-helmet-async';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import MuseumScene from './museum/MuseumScene';
import MuseumHUD from './museum/MuseumHUD';
import MuseumLoader from './museum/MuseumLoader';
import ArtworkLightbox from './museum/ArtworkLightbox';
import VaultBrowser from './museum/VaultBrowser';
import { CAMERA_PRESETS } from './museum/museumLayout';


// Lazy-load the 2D fallback — only loads on mobile
const DroneShop = lazy(() => import('./DroneShop'));

/**
 * DroneMuseum — Top-level Vault page
 * Desktop: immersive 3D white cube museum gallery
 * Mobile / no WebGL: falls back to existing 2D diamond grid (DroneShop)
 * Audio is handled by parent DronesWorld — persists across zone navigation.
 */
export default function DroneMuseum() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [focusedDrone, setFocusedDrone] = useState(null);
  const [lightboxDrone, setLightboxDrone] = useState(null);
  const [cameraTarget, setCameraTarget] = useState(null);
  const [walkMode, setWalkMode] = useState(false);
  const [viewMode, setViewMode] = useState('3d'); // '3d' or 'browse'
  const [sceneReady, setSceneReady] = useState(false);

  // Lock body scroll for immersive 3D experience (hides DronesWorld footer)
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

  const handleArtworkFocus = useCallback((drone) => {
    setFocusedDrone(drone);
  }, []);

  const handleArtworkUnfocus = useCallback(() => {
    setFocusedDrone(null);
  }, []);

  const handleViewFull = useCallback((drone) => {
    setLightboxDrone(drone);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setLightboxDrone(null);
  }, []);

  const handleNavigate = useCallback((presetKey) => {
    const preset = CAMERA_PRESETS[presetKey];
    if (preset) {
      setCameraTarget({
        cameraPos: preset.position,
        lookAt: preset.target,
      });
      setFocusedDrone(null);
      // Clear after a tick so re-clicking the same button works
      setTimeout(() => setCameraTarget(null), 100);
    }
  }, []);

  // Mobile / no WebGL fallback
  if (isMobile || !hasWebGL) {
    return (
      <Suspense fallback={<MuseumLoader />}>
        <DroneShop />
      </Suspense>
    );
  }

  return (
    <>
      {/* ── Browse mode — full catalogue with traits ── */}
      {viewMode === 'browse' ? (
        <>
          <Helmet>
            <title>The Vault — Browse All 1000 Diamond Drones | Miss AL Simpson</title>
            <meta name="description" content="Browse all 1000 Diamond Drones — unique digital diamonds cut across five rarity tiers. By Miss AL Simpson." />
            <meta property="og:title" content="The Vault — 1000 Diamond Drones™" />
            <meta property="og:description" content="Browse all 1000 Diamond Drones. Five rarity tiers. By Miss AL Simpson." />
            <meta property="og:image" content="https://diamonddrones.world/diamond-drones-gallery.png" />
            <link rel="canonical" href="https://diamonddrones.world/drones/vault" />
          </Helmet>
          <VaultBrowser onSwitch3D={() => setViewMode('3d')} />
        </>
      ) : (
        <>
          <Helmet>
            <title>The Vault — Diamond Drones | Miss AL Simpson</title>
            <meta name="description" content="Enter the Diamond Drone Vault — an immersive 3D gallery showcasing 50 unique Diamond Drone NFT artworks." />
          </Helmet>

          <div style={{
            width: '100%',
            height: 'calc(100vh - 52px)',
            position: 'relative',
            background: '#0a0a0e',
            overflow: 'hidden',
          }}>
            {/* ── 3D Canvas ── */}
            <Suspense fallback={<MuseumLoader />}>
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
                  toneMappingExposure: 2.8,
                }}
                style={{ width: '100%', height: '100%' }}
                onCreated={() => setTimeout(() => setSceneReady(true), 600)}
              >
                <color attach="background" args={['#0a0a0e']} />
                <MuseumScene
                  onArtworkFocus={handleArtworkFocus}
                  onArtworkUnfocus={handleArtworkUnfocus}
                  externalFocusTarget={cameraTarget}
                  walkMode={walkMode}
                  onBrowseAll={() => setViewMode('browse')}
                />
              </Canvas>
            </Suspense>

            {/* ── Loading overlay — shows branded screen until scene renders ── */}
            {!sceneReady && <MuseumLoader />}

            {/* ── 2D HUD Overlay ── */}
            <MuseumHUD
              focusedDrone={focusedDrone}
              onNavigate={handleNavigate}
              onUnfocus={handleArtworkUnfocus}
              onViewFull={handleViewFull}
              walkMode={walkMode}
              onToggleWalkMode={() => setWalkMode(prev => !prev)}
              onBrowseAll={() => setViewMode('browse')}
            />

            {/* ── Fullscreen artwork lightbox ── */}
            {lightboxDrone && (
              <ArtworkLightbox drone={lightboxDrone} onClose={handleCloseLightbox} />
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
                  Diamond Drones{'\u2122'} {'\u00B7'} 1000 Unique Digital Diamonds
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
