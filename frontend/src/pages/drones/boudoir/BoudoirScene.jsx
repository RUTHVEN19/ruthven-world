import { useState, useCallback, useMemo, useEffect, useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { SHOWCASE_MARILYNS, generateArtworkPositions, ROOM, STAIRCASE } from './boudoirLayout';
import BoudoirRoom from './BoudoirRoom';
import BoudoirLighting from './BoudoirLighting';
import BoudoirControls from './BoudoirControls';
import BoudoirArtwork from './BoudoirArtwork';

/* ═══════════════════════════════════════════
   FloatingDiamonds — crystal particles drifting in the air
   Octahedron geometries with metallic material, gently bobbing & rotating
   ═══════════════════════════════════════════ */
function FloatingDiamonds() {
  const staircaseCenterZ = STAIRCASE.startZ + (STAIRCASE.steps * STAIRCASE.stepDepth) / 2;

  const diamonds = useMemo(() => {
    return Array.from({ length: 55 }, () => ({
      pos: [
        (Math.random() - 0.5) * 14,
        1.5 + Math.random() * 7,
        staircaseCenterZ - 7 + Math.random() * 16,
      ],
      scale: 0.04 + Math.random() * 0.18,
      speed: 0.12 + Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2,
      rotSpeed: 0.15 + Math.random() * 0.5,
    }));
  }, [staircaseCenterZ]);

  const groupRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!groupRef.current) return;
    const children = groupRef.current.children;
    for (let i = 0; i < children.length; i++) {
      const d = diamonds[i];
      children[i].position.y = d.pos[1] + Math.sin(t * d.speed + d.phase) * 0.4;
      children[i].rotation.x = t * d.rotSpeed * 0.4;
      children[i].rotation.y = t * d.rotSpeed;
    }
  });

  return (
    <group ref={groupRef} name="floating-diamonds">
      {diamonds.map((d, i) => (
        <mesh key={i} position={d.pos} scale={d.scale}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#b0b0b8"
            roughness={0.08}
            metalness={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * BoudoirScene — Root scene composing all 3D elements for The Drone Blondes showroom
 * Grand staircase, floating diamonds, dramatic lighting, gallery approach, video screen
 */
export default function BoudoirScene({ onArtworkFocus, onArtworkUnfocus, externalFocusTarget, onBrowseAll }) {
  const [focusTarget, setFocusTarget] = useState(null);
  const [focusedMarilyn, setFocusedMarilyn] = useState(null);

  // Handle external navigation from HUD viewpoint buttons
  useEffect(() => {
    if (externalFocusTarget) {
      setFocusTarget(externalFocusTarget);
      setFocusedMarilyn(null);
    }
  }, [externalFocusTarget]);

  // Generate artwork positions once
  const artworkPositions = useMemo(
    () => generateArtworkPositions(SHOWCASE_MARILYNS),
    []
  );

  // Handle artwork click — move camera to view it
  const handleArtworkFocus = useCallback((marilyn, position) => {
    const [ax, ay, az] = position;
    const art = artworkPositions.find(a => a.id === marilyn.id);
    if (!art) return;

    let cameraPos;
    if (art.wall === 'left') {
      cameraPos = [ax + 3, ay, az];
    } else {
      cameraPos = [ax - 3, ay, az];
    }

    setFocusedMarilyn(marilyn);
    setFocusTarget({
      cameraPos,
      lookAt: [ax, ay, az],
    });
    onArtworkFocus?.(marilyn);
  }, [artworkPositions, onArtworkFocus]);

  // Handle click on empty space to unfocus
  const handleBackgroundClick = useCallback(() => {
    if (focusedMarilyn) {
      setFocusedMarilyn(null);
      setFocusTarget(null);
      onArtworkUnfocus?.();
    }
  }, [focusedMarilyn, onArtworkUnfocus]);

  return (
    <>
      {/* ── Camera & Controls ── */}
      <BoudoirControls focusTarget={focusTarget} />

      {/* ── Fog — warm atmospheric haze matching room palette ── */}
      <fog attach="fog" args={['#1c1c20', 45, 75]} />

      {/* ── Room Architecture + Grand Staircase ── */}
      <BoudoirRoom onBrowseAll={onBrowseAll} />

      {/* ── Dramatic Lighting ── */}
      <BoudoirLighting artworkPositions={artworkPositions} />

      {/* ── Floating Diamond Crystals ── */}
      <FloatingDiamonds />

      {/* ── Click background to unfocus ── */}
      <mesh
        position={[0, 0.001, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handleBackgroundClick}
        visible={false}
      >
        <planeGeometry args={[ROOM.width * 2, ROOM.length * 2]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* ── Drone Blonde Artworks — lining the approach ── */}
      <Suspense fallback={null}>
        {artworkPositions.map((art) => (
          <BoudoirArtwork
            key={art.id}
            marilyn={art}
            position={art.position}
            rotation={art.rotation}
            onFocus={handleArtworkFocus}
          />
        ))}
      </Suspense>
    </>
  );
}
