import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { FRAME_SIZE } from './boudoirLayout';

/**
 * BoudoirArtwork — Silver chrome framed Drone Blonde artwork
 * Lazy-loads texture only when within camera proximity (~15 units)
 */
export default function BoudoirArtwork({ marilyn, position, rotation, onFocus }) {
  const [hovered, setHovered] = useState(false);
  const [texture, setTexture] = useState(null);
  const loadStarted = useRef(false);
  const groupRef = useRef();
  const { w, h } = FRAME_SIZE[marilyn.size] || FRAME_SIZE.md;

  const frameDepth = 0.04;
  const frameWidth = 0.04;
  const matWidth = 0.03;
  const imageW = w - (frameWidth + matWidth) * 2;
  const imageH = h - (frameWidth + matWidth) * 2;

  // Lazy-load texture when camera is within range
  useFrame(({ camera }) => {
    if (loadStarted.current || texture) return;
    const dx = camera.position.x - position[0];
    const dy = camera.position.y - position[1];
    const dz = camera.position.z - position[2];
    if (dx * dx + dy * dy + dz * dz < 225) { // 15 units
      loadStarted.current = true;
      const loader = new THREE.TextureLoader();
      loader.load(
        `/marilyns/web/Drone%20Blonde%20${marilyn.id}.jpg`,
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
      ref={groupRef}
      position={position}
      rotation={rotation}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      onClick={(e) => { e.stopPropagation(); onFocus?.(marilyn, position); }}
    >
      {/* Silver chrome frame */}
      <mesh>
        <boxGeometry args={[w, h, frameDepth]} />
        <meshStandardMaterial
          color={hovered ? '#d0d0d0' : '#b0b0b0'}
          roughness={0.15}
          metalness={0.9}
        />
      </mesh>

      {/* White mat border */}
      <mesh position={[0, 0, frameDepth / 2 + 0.001]}>
        <planeGeometry args={[w - frameWidth * 2, h - frameWidth * 2]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.95} metalness={0} />
      </mesh>

      {/* Image or fallback */}
      <mesh position={[0, 0, frameDepth / 2 + 0.002]}>
        <planeGeometry args={[imageW, imageH]} />
        {texture ? (
          <meshBasicMaterial
            map={texture}
            toneMapped={false}
          />
        ) : (
          /* Placeholder — dark grey with subtle "♛" feel */
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.1} />
        )}
      </mesh>

      {/* Hover glow — soft shadow highlight */}
      {hovered && (
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[w + 0.12, h + 0.12]} />
          <meshBasicMaterial color="#d0d4e0" transparent opacity={0.1} />
        </mesh>
      )}
    </group>
  );
}
