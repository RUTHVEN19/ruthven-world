import { useMemo } from 'react';
import * as THREE from 'three';
import { ROOM } from './museumLayout';

/**
 * SpotlightBeams — 8 atmospheric light cones (4 per wall).
 * Static opacity — no per-frame updates.
 */
export default function SpotlightBeams() {
  const { height, width } = ROOM;
  const hw = width / 2;

  const beams = useMemo(() => {
    const zStops = [-18, -6, 6, 18];
    const result = [];
    const beamHeight = height - 0.8;
    const midY = height / 2;

    zStops.forEach((z, i) => {
      result.push({ id: `L${i}`, position: [-(hw - 2), midY, z], height: beamHeight });
      result.push({ id: `R${i}`, position: [(hw - 2), midY, z], height: beamHeight });
    });
    return result;
  }, [height, hw]);

  return (
    <group name="spotlight-beams">
      {beams.map((beam) => (
        <mesh key={beam.id} position={beam.position}>
          <coneGeometry args={[1.8, beam.height, 8, 1, true]} />
          <meshBasicMaterial
            color="#d0e0f0"
            transparent
            opacity={0.025}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}
