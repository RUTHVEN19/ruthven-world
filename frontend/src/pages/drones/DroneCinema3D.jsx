import { useState, useCallback, useMemo, useEffect, Suspense, lazy } from 'react';
import { Canvas } from '@react-three/fiber';
import { Helmet } from 'react-helmet-async';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import CinemaScene from './cinema/CinemaScene';
import CinemaHUD from './cinema/CinemaHUD';
import CinemaLoader from './cinema/CinemaLoader';
import { CAMERA_PRESETS, FILMS, DEFAULT_FILM_INDEX } from './cinema/cinemaLayout';

// Lazy-load the 2D fallback — only loads on mobile
const DroneCinema2D = lazy(() => import('./DroneCinema2D'));

/**
 * DroneCinema3D — Top-level Cinema page
 * Desktop: immersive 3D luxury screening room
 * Mobile / no WebGL: falls back to existing 2D cinema page
 */
export default function DroneCinema3D() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [activeFilmIndex, setActiveFilmIndex] = useState(DEFAULT_FILM_INDEX);
  const [cameraTarget, setCameraTarget] = useState(null);
  const [isMuted, setIsMuted] = useState(true); // start muted, update when video reports

  // Listen for cinema audio state events
  useEffect(() => {
    const onUnmuted = () => setIsMuted(false);
    const onMuted = () => setIsMuted(true);
    window.addEventListener('cinema-unmuted', onUnmuted);
    window.addEventListener('cinema-muted', onMuted);
    return () => {
      window.removeEventListener('cinema-unmuted', onUnmuted);
      window.removeEventListener('cinema-muted', onMuted);
    };
  }, []);

  // Lock body scroll for immersive 3D experience
  useEffect(() => {
    if (!isMobile) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isMobile]);

  // Detect WebGL support
  const hasWebGL = useMemo(() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    } catch { return false; }
  }, []);

  // Get the active film's source path
  const filmSrc = FILMS[activeFilmIndex]?.file || null;

  const handleSelectFilm = useCallback((idx) => {
    const film = FILMS[idx];
    if (!film?.file) return;
    setActiveFilmIndex(idx);
    setIsMuted(false); // keep audio on when switching films
  }, []);

  const handleNavigate = useCallback((presetKey) => {
    const preset = CAMERA_PRESETS[presetKey];
    if (preset) {
      setCameraTarget({
        cameraPos: preset.position,
        lookAt: preset.target,
      });
      // Clear after a tick so re-clicking the same button works
      setTimeout(() => setCameraTarget(null), 100);
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    const video = window.__cinemaVideo;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
      if (!video.muted) {
        video.play().catch(() => {});
      }
    }
  }, []);

  const handleFullscreen = useCallback(() => {
    const film = FILMS[activeFilmIndex];
    if (!film?.fileHQ) return;

    // Pause the cinema video
    const cinemaVideo = window.__cinemaVideo;
    if (cinemaVideo) cinemaVideo.pause();

    // Create fullscreen overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#000;display:flex;align-items:center;justify-content:center;';

    const video = document.createElement('video');
    video.src = film.fileHQ;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.controls = true;
    video.style.cssText = 'width:100%;height:100%;object-fit:contain;';
    overlay.appendChild(video);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ EXIT FULL SCREEN';
    closeBtn.style.cssText = 'position:absolute;top:20px;right:24px;z-index:10000;font-family:"Space Mono",monospace;font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:10px 20px;background:rgba(0,0,0,0.7);border:1px solid rgba(255,255,255,0.3);color:rgba(255,255,255,0.8);cursor:pointer;backdrop-filter:blur(8px);';
    overlay.appendChild(closeBtn);

    // Close handler — resume cinema video
    const close = () => {
      video.pause();
      video.src = '';
      overlay.remove();
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('fullscreenchange', onFsChange);
      if (cinemaVideo) cinemaVideo.play().catch(() => {});
    };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    const onFsChange = () => { if (!document.fullscreenElement) close(); };

    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    document.addEventListener('fullscreenchange', onFsChange);

    document.body.appendChild(overlay);
    video.play().catch(() => {});

    // Try native fullscreen
    overlay.requestFullscreen?.().catch(() => {});
  }, [activeFilmIndex]);

  // Mobile / no WebGL fallback
  if (isMobile || !hasWebGL) {
    return (
      <Suspense fallback={<CinemaLoader />}>
        <DroneCinema2D />
      </Suspense>
    );
  }

  return (
    <>
      <Helmet>
        <title>Drone Cinema — The Premiere | Miss AL Simpson</title>
        <meta name="description" content="Enter the Drone Cinema — an immersive 3D screening room for the Diamond Drones™ film premiere." />
        <meta property="og:title" content="Drone Cinema — Diamond Drones™" />
        <meta property="og:description" content="Four films. One track. An immersive cinema experience by Miss AL Simpson." />
        <meta property="og:image" content="https://diamonddrones.world/diamond-drones-cinema.png" />
        <link rel="canonical" href="https://diamonddrones.world/drones/cinema" />
      </Helmet>

      <div style={{
        width: '100%',
        height: 'calc(100vh - 52px)', // accounts for DronesWorld navbar
        position: 'relative',
        background: '#080808',
        overflow: 'hidden',
      }}>
        {/* ── 3D Canvas ── */}
        <Canvas
          camera={{
            position: CAMERA_PRESETS.center.position,
            fov: 60,
            near: 0.1,
            far: 50,
          }}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            toneMapping: 4, // ACESFilmicToneMapping
            toneMappingExposure: 2.6,
            powerPreference: 'high-performance',
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <color attach="background" args={['#080808']} />
          <CinemaScene
            filmSrc={filmSrc}
            externalFocusTarget={cameraTarget}
          />
        </Canvas>

        {/* ── 2D HUD Overlay ── */}
        <CinemaHUD
          activeFilmIndex={activeFilmIndex}
          onSelectFilm={handleSelectFilm}
          onNavigate={handleNavigate}
          onToggleMute={handleToggleMute}
          isMuted={isMuted}
          onFullscreen={handleFullscreen}
        />
      </div>
    </>
  );
}
