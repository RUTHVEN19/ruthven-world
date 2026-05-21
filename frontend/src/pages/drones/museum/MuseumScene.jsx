import { useState, useCallback, useMemo, useEffect, Suspense } from 'react';
import { VAULT_DRONES, generateArtworkPositions, CAMERA_PRESETS, ROOM } from './museumLayout';
import MuseumRoom from './MuseumRoom';
import MuseumLighting from './MuseumLighting';
import MuseumControls from './MuseumControls';
import ArtworkFrame from './ArtworkFrame';
import EndWallDisplay from './EndWallDisplay';
import DiamondDust from './DiamondDust';
import SpotlightBeams from './SpotlightBeams';

/**
 * MuseumScene — Root scene composing all 3D elements inside the R3F Canvas
 */
export default function MuseumScene({ onArtworkFocus, onArtworkUnfocus, externalFocusTarget, walkMode = false, onBrowseAll }) {
  const [focusTarget, setFocusTarget] = useState(null);
  const [focusedDrone, setFocusedDrone] = useState(null);

  // Handle external navigation from HUD viewpoint buttons
  useEffect(() => {
    if (externalFocusTarget) {
      setFocusTarget(externalFocusTarget);
      setFocusedDrone(null);
    }
  }, [externalFocusTarget]);

  // Generate artwork positions once
  const artworkPositions = useMemo(
    () => generateArtworkPositions(VAULT_DRONES),
    []
  );

  // Handle artwork click — move camera to view it
  const handleArtworkFocus = useCallback((drone, position) => {
    const [ax, ay, az] = position;
    const art = artworkPositions.find(a => a.id === drone.id);
    if (!art) return;

    // Camera position: 3m out from the wall, centered on artwork
    let cameraPos;
    if (art.wall === 'left') {
      cameraPos = [ax + 3.5, ay, az];
    } else {
      cameraPos = [ax - 3.5, ay, az];
    }

    setFocusedDrone(drone);
    setFocusTarget({
      cameraPos,
      lookAt: [ax, ay, az],
    });
    onArtworkFocus?.(drone);
  }, [artworkPositions, onArtworkFocus]);

  // Handle click on empty space to unfocus
  const handleBackgroundClick = useCallback(() => {
    if (focusedDrone) {
      setFocusedDrone(null);
      setFocusTarget(null);
      onArtworkUnfocus?.();
    }
  }, [focusedDrone, onArtworkUnfocus]);

  return (
    <>
      {/* ── Camera & Controls ── */}
      <MuseumControls focusTarget={focusTarget} walkMode={walkMode} />

      {/* ── Environment ── */}
      <fog attach="fog" args={['#0a0a0e', 55, 95]} />

      {/* ── Room Architecture ── */}
      <MuseumRoom />

      {/* ── Lighting ── */}
      <MuseumLighting />

      {/* ── Diamond dust particles ── */}
      <DiamondDust />

      {/* ── Spotlight beams ── */}
      <SpotlightBeams />

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

      {/* ── Artwork Frames ── */}
      <Suspense fallback={null}>
        {artworkPositions.map((art) => (
          <ArtworkFrame
            key={art.id}
            drone={art}
            position={art.position}
            rotation={art.rotation}
            onFocus={handleArtworkFocus}
          />
        ))}
      </Suspense>

      {/* ── End Wall Display ── */}
      <EndWallDisplay />
    </>
  );
}
