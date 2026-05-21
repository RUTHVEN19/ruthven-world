import { ROOM } from './cinemaLayout';

/**
 * CinemaLighting — Streamlined cinema lighting for smooth video playback.
 * Reduced from ~29 lights to 5 for GPU performance.
 */
export default function CinemaLighting() {
  const { height, depth } = ROOM;
  const hd = depth / 2;

  return (
    <group name="cinema-lighting">
      {/* ── Ambient — general room visibility ── */}
      <ambientLight intensity={1.4} color="#d0d8e0" />

      {/* ── Hemisphere — cool ceiling / warm floor ── */}
      <hemisphereLight
        color="#c8d0d8"
        groundColor="#2a2018"
        intensity={0.8}
      />

      {/* ── Overhead directional — main room fill ── */}
      <directionalLight
        position={[0, height, 0]}
        intensity={1.2}
        color="#e0dcd4"
      />

      {/* ── Screen glow — single light illuminating seating area ── */}
      <pointLight
        position={[0, 2.8, -(hd - 4.5)]}
        intensity={8}
        color="#c8d8e8"
        distance={22}
        decay={1.5}
      />

      {/* ── Rear room fill — so back rows are visible ── */}
      <pointLight
        position={[0, height - 0.5, 3]}
        intensity={1.5}
        color="#e0dcd4"
        distance={12}
        decay={2}
      />
    </group>
  );
}
