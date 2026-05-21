import { useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FILM_SCREEN, ROOM } from './museumLayout';

/**
 * FilmScreen — Large projection screen on the end wall playing the Diamond Drones film
 * Defers loading the 47MB video until camera is within 20 units of the screen.
 */
export default function FilmScreen() {
  const meshRef = useRef();
  const [videoTexture, setVideoTexture] = useState(null);
  const videoRef = useRef(null);
  const loadStarted = useRef(false);
  const { position, rotation, width, height } = FILM_SCREEN || {
    position: [0, 3.5, ROOM.length / 2 - 0.14],
    rotation: [0, Math.PI, 0],
    width: 10,
    height: 5.625,
  };

  // Screen z position for proximity check
  const screenZ = position[2] || ROOM.length / 2;

  const startVideoLoad = useCallback(() => {
    if (loadStarted.current) return;
    loadStarted.current = true;

    const video = document.createElement('video');
    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.volume = 0;
    video.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
    document.body.appendChild(video);
    videoRef.current = video;

    const films = [
      '/films/dd-the-vault.mp4',
      '/films/06-frequency-edit.mp4',
    ];
    let filmIndex = 0;

    const tryPlay = () => {
      if (video.readyState < 2) return;
      const p = video.play();
      if (p && p.catch) {
        p.catch(() => {
          const resume = () => {
            video.play().catch(() => {});
            window.removeEventListener('click', resume);
            window.removeEventListener('pointerdown', resume);
            window.removeEventListener('touchstart', resume);
          };
          window.addEventListener('click', resume);
          window.addEventListener('pointerdown', resume);
          window.addEventListener('touchstart', resume);
        });
      }
    };

    const loadFilm = (index) => {
      if (index >= films.length) return;
      video.src = films[index];
      video.load();
    };

    video.addEventListener('loadeddata', tryPlay);
    video.addEventListener('canplay', tryPlay);
    video.addEventListener('canplaythrough', tryPlay);
    video.addEventListener('error', () => {
      filmIndex++;
      if (filmIndex < films.length) loadFilm(filmIndex);
    });

    loadFilm(0);
    const t1 = setTimeout(tryPlay, 1500);
    const t2 = setTimeout(tryPlay, 3000);

    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    setVideoTexture(texture);

    // Store cleanup refs
    videoRef.current._timers = [t1, t2];
    videoRef.current._texture = texture;
  }, []);

  // Proximity-based lazy load: start video when camera is within 20 units of screen
  // Also keep the video texture updating each frame
  useFrame(({ camera }) => {
    if (!loadStarted.current) {
      const dz = camera.position.z - screenZ;
      if (dz * dz < 400) { // 20 units
        startVideoLoad();
      }
      return;
    }
    if (videoTexture && videoRef.current && !videoRef.current.paused) {
      videoTexture.needsUpdate = true;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* ── Screen bezel ── */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[width + 0.2, height + 0.2, 0.05]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* ── Video surface ── */}
      <mesh ref={meshRef}>
        <planeGeometry args={[width, height]} />
        {videoTexture ? (
          <meshBasicMaterial map={videoTexture} toneMapped={false} fog={false} />
        ) : (
          <meshBasicMaterial color="#0a0a0a" />
        )}
      </mesh>

      {/* ── Subtle glow behind screen ── */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[width + 1, height + 1]} />
        <meshBasicMaterial color="#1a2a3a" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}
