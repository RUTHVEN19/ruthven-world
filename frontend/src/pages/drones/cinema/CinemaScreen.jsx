import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SCREEN } from './cinemaLayout';

/**
 * CinemaScreen — Hybrid approach: 3D frame + projected DOM video overlay
 *
 * The 3D frame/glow meshes render in Three.js.
 * The actual video is a plain HTML5 <video> element positioned as a DOM overlay
 * on top of the canvas, with its CSS position/size updated every frame by projecting
 * the 3D screen corners to viewport coordinates.
 *
 * This bypasses ALL Three.js texture issues while perfectly tracking camera movement.
 */
export default function CinemaScreen({ filmSrc }) {
  const videoRef = useRef(null);
  const overlayRef = useRef(null);
  const { width, height, frameWidth } = SCREEN;
  const screenZ = SCREEN.position[2];
  const screenY = SCREEN.position[1];

  const { camera, size, gl } = useThree();

  // Reusable vectors for projection (avoid GC)
  const topLeft = useMemo(() => new THREE.Vector3(), []);
  const topRight = useMemo(() => new THREE.Vector3(), []);
  const bottomLeft = useMemo(() => new THREE.Vector3(), []);

  // Create the overlay container div (sibling of canvas, inside same parent)
  useEffect(() => {
    const container = gl.domElement.parentElement;
    if (!container) return;

    const overlay = document.createElement('div');
    overlay.style.cssText =
      'position:absolute;left:0;top:0;pointer-events:none;overflow:hidden;z-index:1;background:#000;will-change:transform;transform-origin:0 0;';
    container.appendChild(overlay);
    overlayRef.current = overlay;

    return () => {
      overlay.remove();
      overlayRef.current = null;
    };
  }, [gl]);

  // Create and manage video element
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || !filmSrc) {
      // Hide overlay when no film
      if (overlay) overlay.style.display = 'none';
      return;
    }

    overlay.style.display = 'block';

    const video = document.createElement('video');
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    video.preload = 'auto';
    video.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;';
    overlay.appendChild(video);
    videoRef.current = video;
    window.__cinemaVideo = video;

    video.src = filmSrc;
    video.load();

    // Try unmuted autoplay first; fall back to muted + unmute on first click
    const tryPlay = () => {
      if (video.paused && video.readyState >= 2) {
        // First attempt: play with sound
        video.muted = false;
        video.play().then(() => {
          window.dispatchEvent(new CustomEvent('cinema-unmuted'));
        }).catch(() => {
          // Browser blocked unmuted — play muted, then unmute on first interaction
          video.muted = true;
          window.dispatchEvent(new CustomEvent('cinema-muted'));
          video.play().catch(() => {});
          const unmuteOnClick = () => {
            video.muted = false;
            video.play().catch(() => {});
            window.dispatchEvent(new CustomEvent('cinema-unmuted'));
            document.removeEventListener('click', unmuteOnClick);
            document.removeEventListener('pointerdown', unmuteOnClick);
          };
          document.addEventListener('click', unmuteOnClick);
          document.addEventListener('pointerdown', unmuteOnClick);
        });
      }
    };

    video.addEventListener('canplay', tryPlay);
    video.addEventListener('loadeddata', tryPlay);
    const t1 = setTimeout(tryPlay, 500);
    const t2 = setTimeout(tryPlay, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      video.removeEventListener('canplay', tryPlay);
      video.removeEventListener('loadeddata', tryPlay);
      video.pause();
      video.src = '';
      video.remove();
      videoRef.current = null;
      if (window.__cinemaVideo === video) window.__cinemaVideo = null;
    };
  }, [filmSrc]);

  // Every frame: project 3D screen corners → CSS transform (GPU-composited, no layout thrash)
  const prevRect = useRef({ x: 0, y: 0, w: 0, h: 0 });
  useFrame(() => {
    const overlay = overlayRef.current;
    if (!overlay || overlay.style.display === 'none') return;

    const hw = width / 2;
    const hh = height / 2;

    // Project three corners of the screen plane
    topLeft.set(-hw, screenY + hh, screenZ).project(camera);
    topRight.set(hw, screenY + hh, screenZ).project(camera);
    bottomLeft.set(-hw, screenY - hh, screenZ).project(camera);

    // Convert from NDC (-1..1) to CSS pixels
    const x = (topLeft.x * 0.5 + 0.5) * size.width;
    const right = (topRight.x * 0.5 + 0.5) * size.width;
    const y = (-topLeft.y * 0.5 + 0.5) * size.height;
    const bottom = (-bottomLeft.y * 0.5 + 0.5) * size.height;
    const w = right - x;
    const h = bottom - y;

    // Only update DOM when values actually change (avoid unnecessary repaints)
    const prev = prevRect.current;
    if (Math.abs(prev.x - x) > 0.5 || Math.abs(prev.y - y) > 0.5 ||
        Math.abs(prev.w - w) > 0.5 || Math.abs(prev.h - h) > 0.5) {
      overlay.style.transform = `translate(${x}px, ${y}px)`;
      overlay.style.width = `${w}px`;
      overlay.style.height = `${h}px`;
      prev.x = x; prev.y = y; prev.w = w; prev.h = h;
    }
  });

  // Silver trim color
  const silverTrim = { color: '#a8b0b8', roughness: 0.15, metalness: 0.9 };

  return (
    <>
      <group position={[0, screenY, screenZ]}>
        {/* ── Frame border ── */}
        <mesh position={[0, 0, -0.03]}>
          <boxGeometry args={[width + frameWidth * 2, height + frameWidth * 2, 0.05]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* ── Silver trim on frame edges ── */}
        {/* Top */}
        <mesh position={[0, height / 2 + frameWidth + 0.01, -0.01]}>
          <boxGeometry args={[width + frameWidth * 2 + 0.04, 0.02, 0.02]} />
          <meshStandardMaterial {...silverTrim} />
        </mesh>
        {/* Bottom */}
        <mesh position={[0, -(height / 2 + frameWidth + 0.01), -0.01]}>
          <boxGeometry args={[width + frameWidth * 2 + 0.04, 0.02, 0.02]} />
          <meshStandardMaterial {...silverTrim} />
        </mesh>
        {/* Left */}
        <mesh position={[-(width / 2 + frameWidth + 0.01), 0, -0.01]}>
          <boxGeometry args={[0.02, height + frameWidth * 2 + 0.04, 0.02]} />
          <meshStandardMaterial {...silverTrim} />
        </mesh>
        {/* Right */}
        <mesh position={[(width / 2 + frameWidth + 0.01), 0, -0.01]}>
          <boxGeometry args={[0.02, height + frameWidth * 2 + 0.04, 0.02]} />
          <meshStandardMaterial {...silverTrim} />
        </mesh>

        {/* ── Black screen backing (visible behind/around the video overlay) ── */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial color="#080808" toneMapped={false} />
        </mesh>

        {/* ── Glow behind screen ── */}
        <mesh position={[0, 0, -0.06]}>
          <planeGeometry args={[width + 1.5, height + 1]} />
          <meshBasicMaterial color="#0a0a0a" transparent opacity={0.4} />
        </mesh>
      </group>

    </>
  );
}

