import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CAMERA_PRESETS, ROOM } from './cinemaLayout';
import CinemaRoom from './CinemaRoom';
import CinemaSeating from './CinemaSeating';
import CinemaScreen from './CinemaScreen';
import CinemaLighting from './CinemaLighting';
import CinemaControls from './CinemaControls';
import CinemaWallText from './CinemaWallText';
import CinemaProjector from './CinemaProjector';

/**
 * CinemaVideoWash — Projects the currently playing film onto the side and back walls
 * as a subtle ambient wash, giving the room a cinematic glow effect
 */
function CinemaVideoWash({ filmSrc }) {
  const [texture, setTexture] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!filmSrc) { setTexture(null); return; }

    const video = document.createElement('video');
    video.src = filmSrc;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    video.autoplay = true;
    videoRef.current = video;

    video.addEventListener('canplay', () => {
      const tex = new THREE.VideoTexture(video);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      setTexture(tex);
      video.play().catch(() => {});
    });
    video.load();

    return () => { video.pause(); video.src = ''; videoRef.current = null; };
  }, [filmSrc]);

  useFrame(() => { if (texture) texture.needsUpdate = true; });

  if (!texture) return null;

  const { width, depth, height, wallThickness: wt } = ROOM;
  const hw = width / 2;
  const hd = depth / 2;

  return (
    <group name="cinema-video-wash">
      {/* Left wall (-x) */}
      <mesh position={[-(hw - wt / 2 - 0.02), height / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[depth - wt * 2, height]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0.08}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
      {/* Right wall (+x) */}
      <mesh position={[(hw - wt / 2 - 0.02), height / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[depth - wt * 2, height]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0.08}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
      {/* Back wall (+z) */}
      <mesh position={[0, height / 2, hd - wt / 2 - 0.02]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[width - wt * 2, height]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0.06}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/**
 * CinemaScene — Root scene composing all 3D cinema elements inside R3F Canvas
 */
export default function CinemaScene({ filmSrc, externalFocusTarget }) {
  const [focusTarget, setFocusTarget] = useState(null);

  // Handle external navigation from HUD seat buttons
  useEffect(() => {
    if (externalFocusTarget) {
      setFocusTarget(externalFocusTarget);
      // Clear after a tick so re-clicking the same button works
      setTimeout(() => setFocusTarget(null), 100);
    }
  }, [externalFocusTarget]);

  return (
    <>
      {/* ── Camera & Controls ── */}
      <CinemaControls focusTarget={focusTarget} />

      {/* ── Subtle fog — very gentle, pushed far back ── */}
      <fog attach="fog" args={['#101010', 20, 35]} />

      {/* ── Room Architecture ── */}
      <CinemaRoom />

      {/* ── Seating ── */}
      <CinemaSeating />

      {/* ── Cinema Screen ── */}
      <CinemaScreen filmSrc={filmSrc} />

      {/* Video wash on walls removed — single screen only for smoother playback */}

      {/* ── Projector ── */}
      <CinemaProjector />

      {/* ── Gilt Wall Text ── */}
      <CinemaWallText />

      {/* ── Lighting ── */}
      <CinemaLighting />
    </>
  );
}
