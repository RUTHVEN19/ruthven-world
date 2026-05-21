import { ROOM } from './museumLayout';

/**
 * MuseumLighting — Luxury vault lighting (performance-optimised)
 * ~20 lights total instead of ~79
 */
export default function MuseumLighting() {
  const { width, height, length } = ROOM;
  const hw = width / 2;

  // 6 evenly-spaced z positions covering the 60m gallery
  const zStops = [-22, -12, -2, 8, 18, 28];

  return (
    <group name="museum-lighting">
      {/* ── Ambient — cool neutral base ── */}
      <ambientLight intensity={2.0} color="#d8d8d8" />

      {/* ── Hemisphere — cool grey gradient ── */}
      <hemisphereLight color="#e0e0e0" groundColor="#1a1a1a" intensity={1.4} />

      {/* ── Directional fill — strong overhead wash ── */}
      <directionalLight position={[0, height, 0]} intensity={2.8} color="#d8d8d8" />

      {/* ── Gallery spotlights — 6 per wall (12 total, wide angle to cover ~4 artworks each) ── */}
      {zStops.map((z, i) => (
        <group key={`gallery-spot-${i}`}>
          {/* Left wall spot */}
          <spotLight
            position={[-(hw - 2), height - 0.5, z]}
            target-position={[-(hw - 0.3), 2, z]}
            intensity={40}
            angle={0.7}
            penumbra={0.6}
            color="#f0f0f0"
            distance={16}
            decay={1.2}
          />
          {/* Right wall spot */}
          <spotLight
            position={[(hw - 2), height - 0.5, z]}
            target-position={[(hw - 0.3), 2, z]}
            intensity={40}
            angle={0.7}
            penumbra={0.6}
            color="#f0f0f0"
            distance={16}
            decay={1.2}
          />
        </group>
      ))}

      {/* ── End wall display accent ── */}
      <spotLight
        position={[0, height - 0.5, length / 2 - 6]}
        target-position={[0, 3.5, length / 2]}
        intensity={12}
        angle={0.6}
        penumbra={0.7}
        color="#d0d8e0"
        distance={20}
        decay={1.2}
      />

      {/* ── Ceiling track lights — 3 pools along the hall ── */}
      {[-18, 0, 18].map((z, i) => (
        <pointLight
          key={`track-${i}`}
          position={[0, height - 0.3, z]}
          intensity={6}
          color="#d8d8d8"
          distance={25}
          decay={1.5}
        />
      ))}
    </group>
  );
}
