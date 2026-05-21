import { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { FRAME_SIZE, VAULT_DRONES } from './museumLayout';

// Preload all 50 thumb images into browser cache on first import (~2MB total).
// This runs once; by the time the user navigates the gallery, images are cached.
const preloadStarted = { done: false };
if (!preloadStarted.done) {
  preloadStarted.done = true;
  VAULT_DRONES.forEach((d) => {
    const img = new Image();
    img.src = `/vault/thumbs/${d.id}.jpg`;
  });
}

/**
 * ArtworkFrame — A single framed Diamond Drone artwork on the museum wall.
 * Textures are preloaded into browser cache; loads Three.js texture when camera is near.
 */
export default function ArtworkFrame({ drone, position, rotation, onFocus }) {
  const [hovered, setHovered] = useState(false);
  const [texture, setTexture] = useState(null);
  const loadStarted = useRef(false);

  const { w, h } = FRAME_SIZE[drone.size] || FRAME_SIZE.md;

  const frameDepth = 0.06;
  const frameWidth = 0.08;
  const matWidth = 0.05;
  const imageW = w - (frameWidth + matWidth) * 2;
  const imageH = h - (frameWidth + matWidth) * 2;

  // Create Three.js texture when camera is within 12 z-units (images already cached)
  useFrame(({ camera }) => {
    if (loadStarted.current || texture) return;
    const dz = camera.position.z - position[2];
    if (dz * dz < 144) { // 12 units
      loadStarted.current = true;
      new THREE.TextureLoader().load(
        `/vault/thumbs/${drone.id}.jpg`,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          setTexture(tex);
        },
        undefined,
        () => {}
      );
    }
  });

  return (
    <group
      position={position}
      rotation={rotation}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      onClick={(e) => { e.stopPropagation(); onFocus?.(drone, position); }}
    >
      {/* Frame */}
      <mesh>
        <boxGeometry args={[w, h, frameDepth]} />
        <meshStandardMaterial
          color={hovered ? '#3a3a3a' : '#222222'}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Mat — dark velvet */}
      <mesh position={[0, 0, frameDepth / 2 + 0.001]}>
        <planeGeometry args={[w - frameWidth * 2, h - frameWidth * 2]} />
        <meshStandardMaterial color="#0e0e10" roughness={0.95} metalness={0} />
      </mesh>

      {/* Image or fallback */}
      <mesh position={[0, 0, frameDepth / 2 + 0.002]}>
        <planeGeometry args={[imageW, imageH]} />
        {texture ? (
          <meshStandardMaterial map={texture} roughness={0.7} metalness={0.05} toneMapped={false} />
        ) : (
          <meshStandardMaterial color="#2a3040" roughness={0.8} metalness={0.1} />
        )}
      </mesh>

      {/* Edge glow — static, brightens on hover */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[w + 0.15, h + 0.15]} />
        <meshBasicMaterial
          color="#c8e0f0"
          transparent
          opacity={hovered ? 0.12 : 0.04}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
