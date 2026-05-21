import { ROOM, SCREEN } from './cinemaLayout';

/**
 * CinemaProjector — Ceiling-mounted projector at the back of the room
 * with a visible volumetric light beam projecting toward the screen.
 */
export default function CinemaProjector() {
  const { height, depth } = ROOM;
  const hd = depth / 2;

  // Projector position — ceiling-mounted at back of room
  const projY = height - 0.4; // 4.6
  const projZ = hd - 2;       // 5.0

  // Screen center
  const screenZ = SCREEN.position[2]; // ~-6.68
  const screenY = SCREEN.position[1]; // 3.0

  // Beam vector
  const dz = screenZ - projZ;   // ~-11.68 (toward screen)
  const dy = screenY - projY;   // ~-1.6   (slightly downward)
  const beamLength = Math.sqrt(dz * dz + dy * dy); // ~11.79

  // Beam midpoint
  const beamMidZ = (projZ + screenZ) / 2;
  const beamMidY = (projY + screenY) / 2;

  // Rotation: cylinder default is along Y. Rotate around X by PI/2 to point along -Z,
  // then add tilt angle for the height difference.
  const tiltAngle = Math.atan2(-(projY - screenY), -(projZ - screenZ)); // angle in YZ plane
  const beamRotX = Math.PI / 2 + Math.atan2(projY - screenY, projZ - screenZ);

  // Materials
  const bodyMat = { color: '#1a1a20', roughness: 0.3, metalness: 0.8 };
  const lensMat = { color: '#e8f0ff', roughness: 0.1, metalness: 0.3, emissive: '#4060a0', emissiveIntensity: 0.5 };
  const ventMat = { color: '#252530', roughness: 0.5, metalness: 0.6 };
  const mountMat = { color: '#2a2a30', roughness: 0.2, metalness: 0.9 };

  return (
    <group name="cinema-projector">
      {/* ── Ceiling mount bracket ── */}
      <mesh position={[0, height - 0.05, projZ]}>
        <boxGeometry args={[0.4, 0.1, 0.4]} />
        <meshStandardMaterial {...mountMat} />
      </mesh>
      {/* Mount pole */}
      <mesh position={[0, height - 0.22, projZ]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
        <meshStandardMaterial {...mountMat} />
      </mesh>

      {/* ── Projector body ── */}
      <group position={[0, projY, projZ]}>
        {/* Main housing */}
        <mesh>
          <boxGeometry args={[0.7, 0.3, 0.9]} />
          <meshStandardMaterial {...bodyMat} />
        </mesh>

        {/* Lens barrel — front-facing toward screen (-Z) */}
        <mesh position={[0, -0.03, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.12, 0.18, 16]} />
          <meshStandardMaterial {...bodyMat} />
        </mesh>

        {/* Lens glass */}
        <mesh position={[0, -0.03, -0.59]}>
          <circleGeometry args={[0.08, 16]} />
          <meshStandardMaterial {...lensMat} />
        </mesh>

        {/* Lens glow light */}
        <pointLight
          position={[0, -0.03, -0.65]}
          intensity={2}
          color="#c8d8f0"
          distance={4}
          decay={2}
        />

        {/* Side vents */}
        {[-1, 1].map((side) => (
          <group key={`vent-${side}`}>
            {[0, 1, 2, 3].map((v) => (
              <mesh key={`v-${v}`} position={[side * 0.36, 0.03, -0.25 + v * 0.16]}>
                <boxGeometry args={[0.01, 0.14, 0.09]} />
                <meshStandardMaterial {...ventMat} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Status LED */}
        <mesh position={[0.25, 0.16, -0.4]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color="#40ff60" emissive="#40ff60" emissiveIntensity={2} />
        </mesh>

        {/* Silver brand plate */}
        <mesh position={[0, 0.16, -0.2]}>
          <boxGeometry args={[0.25, 0.005, 0.12]} />
          <meshStandardMaterial color="#a8b0b8" roughness={0.15} metalness={0.9} />
        </mesh>
      </group>

      {/* ── Light beam — transparent cone from projector to screen ── */}
      {/* Cylinder default axis = Y. Rotate PI/2 around X to point along -Z, plus tilt for height diff */}
      <mesh position={[0, beamMidY, beamMidZ]} rotation={[beamRotX, 0, 0]}>
        <cylinderGeometry args={[
          0.08,              // top radius (projector end — small)
          3.0,               // bottom radius (screen end — wide spread)
          beamLength * 0.92, // beam length
          16,                // radial segments
          1,                 // height segments
          true,              // open-ended
        ]} />
        <meshBasicMaterial
          color="#a0b8d0"
          transparent
          opacity={0.02}
          side={2}
          depthWrite={false}
        />
      </mesh>

      {/* Inner brighter beam core */}
      <mesh position={[0, beamMidY, beamMidZ]} rotation={[beamRotX, 0, 0]}>
        <cylinderGeometry args={[0.04, 1.5, beamLength * 0.92, 10, 1, true]} />
        <meshBasicMaterial
          color="#c0d8f0"
          transparent
          opacity={0.03}
          side={2}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
