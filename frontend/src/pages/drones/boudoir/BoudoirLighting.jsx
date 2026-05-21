import * as THREE from 'three';
import { ROOM, STAIRCASE } from './boudoirLayout';

/**
 * BoudoirLighting — Gallery lighting for salon-style Drone Blondes display
 * Balanced to let artwork images show clearly without washing out
 */
export default function BoudoirLighting({ artworkPositions = [] }) {
  const { height: h } = ROOM;
  const staircaseCenterZ = STAIRCASE.startZ + (STAIRCASE.steps * STAIRCASE.stepDepth) / 2;

  return (
    <group name="boudoir-lighting">

      {/* ── Ambient — cool fill for moody gallery ── */}
      <ambientLight intensity={0.55} color="#d0d4d8" />

      {/* ── Cool hemisphere fill ── */}
      <hemisphereLight
        color="#c8ccd0"
        groundColor="#28282c"
        intensity={0.45}
        position={[0, h, 0]}
      />

      {/* ── Directional fill from above — cool wash ── */}
      <directionalLight position={[0, h, -5]} intensity={0.7} color="#d4d8dc" />
      <directionalLight position={[0, h, 5]} intensity={0.55} color="#ccd0d4" />

      {/* ═══════════════════════════════════════
          ── HERO SPOTLIGHTS — on the staircase ──
          ═══════════════════════════════════════ */}

      {/* Centre hero beam */}
      <spotLight
        position={[0, h, staircaseCenterZ]}
        target-position={[0, 0, staircaseCenterZ]}
        intensity={100}
        angle={0.6}
        penumbra={0.5}
        color="#e0e4e8"
        distance={h + 4}
        decay={1.5}
      />

      {/* Left beam */}
      <spotLight
        position={[-5, h, staircaseCenterZ - 3]}
        target-position={[-1, 1, staircaseCenterZ + 1]}
        intensity={50}
        angle={0.45}
        penumbra={0.55}
        color="#d8dce0"
        distance={h + 4}
        decay={1.5}
      />

      {/* Right beam */}
      <spotLight
        position={[5, h, staircaseCenterZ - 3]}
        target-position={[1, 1, staircaseCenterZ + 1]}
        intensity={50}
        angle={0.45}
        penumbra={0.55}
        color="#d8dce0"
        distance={h + 4}
        decay={1.5}
      />

      {/* ═══════════════════════════════════════════
          ── VOLUMETRIC LIGHT CONE — subtle on light bg ──
          ═══════════════════════════════════════════ */}
      <mesh position={[0, h / 2, staircaseCenterZ]}>
        <coneGeometry args={[5.5, h, 32, 1, true]} />
        <meshBasicMaterial
          color="#e0e4e8"
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* ═══════════════════════════════════════════
          ── WALL WASH LIGHTS — even illumination for artwork walls ──
          Instead of per-artwork spots (too many), use evenly spaced
          wall wash lights along each wall
          ═══════════════════════════════════════════ */}
      {[-20, -14, -8, -2, 3].map((z, i) => (
        <group key={`wall-wash-${i}`}>
          {/* Left wall wash */}
          <spotLight
            position={[-4, h - 1, z]}
            target-position={[-(ROOM.width / 2), h / 2, z]}
            intensity={20}
            angle={0.8}
            penumbra={0.6}
            color="#e0e4e8"
            distance={12}
            decay={1.5}
          />
          {/* Right wall wash */}
          <spotLight
            position={[4, h - 1, z]}
            target-position={[(ROOM.width / 2), h / 2, z]}
            intensity={20}
            angle={0.8}
            penumbra={0.6}
            color="#e0e4e8"
            distance={12}
            decay={1.5}
          />
        </group>
      ))}

      {/* ── Gallery approach lighting ── */}
      <pointLight position={[0, 4, -20]} intensity={4} color="#d0d4d8" distance={15} decay={2} />
      <pointLight position={[0, 4, -10]} intensity={4} color="#d0d4d8" distance={15} decay={2} />
      <pointLight position={[0, 3, -5]} intensity={3} color="#d0d4d8" distance={12} decay={2} />
      <pointLight position={[0, 3, 2]} intensity={2.5} color="#d0d4d8" distance={10} decay={2} />
    </group>
  );
}
