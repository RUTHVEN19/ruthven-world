import { ROOM, MIXING_DESK } from './studioLayout';

/**
 * StudioLighting — Moody recording studio atmosphere
 */
export default function StudioLighting() {
  const { width, depth, height } = ROOM;
  const hw = width / 2;
  const hd = depth / 2;

  return (
    <group name="studio-lighting">
      {/* ── Ambient base ── */}
      <ambientLight intensity={0.5} color="#c8c8c8" />

      {/* ── Hemisphere — warm above, dark below ── */}
      <hemisphereLight
        color="#c0c0c0"
        groundColor="#1a1210"
        intensity={0.35}
      />

      {/* ── Overhead practicals (can lights) ── */}
      <pointLight position={[0, height - 0.3, 0]} intensity={1.8} color="#e0d8d0" distance={7} decay={2} />
      <pointLight position={[-2.5, height - 0.3, -1]} intensity={1.2} color="#e0d8d0" distance={6} decay={2} />
      <pointLight position={[2.5, height - 0.3, -1]} intensity={1.2} color="#e0d8d0" distance={6} decay={2} />

      {/* ── Desk lamp glow (warm pools on mixing console) ── */}
      <pointLight
        position={[-1.5, MIXING_DESK.height + 0.5, MIXING_DESK.position[2]]}
        intensity={2.0}
        color="#e8d8c0"
        distance={3}
        decay={2}
      />
      <pointLight
        position={[1.5, MIXING_DESK.height + 0.5, MIXING_DESK.position[2]]}
        intensity={2.0}
        color="#e8d8c0"
        distance={3}
        decay={2}
      />

      {/* ── Purple/blue LED underglow — signature studio vibe ── */}
      <pointLight position={[-hw + 0.5, 0.1, -1]} intensity={0.4} color="#4040a0" distance={5} decay={2} />
      <pointLight position={[hw - 0.5, 0.1, -1]} intensity={0.4} color="#4040a0" distance={5} decay={2} />
      <pointLight position={[0, 0.1, -hd + 0.5]} intensity={0.3} color="#4040a0" distance={4} decay={2} />

      {/* ── REC indicator — red wash on rear wall/ceiling ── */}
      <pointLight
        position={[0, height - 0.3, -hd + 0.5]}
        intensity={0.6}
        color="#ff2020"
        distance={3.5}
        decay={2}
      />

      {/* ── Green meter glow from console LCD ── */}
      <pointLight
        position={[0, MIXING_DESK.height + 0.3, MIXING_DESK.position[2] - 0.3]}
        intensity={0.4}
        color="#20aa40"
        distance={2}
        decay={2}
      />

      {/* ── Soft directional fill from above-front ── */}
      <directionalLight
        position={[2, height, hd - 1]}
        intensity={0.5}
        color="#d0d0d0"
      />

      {/* ── Vocal booth interior glow ── */}
      <pointLight position={[4.5, 2.5, -1.5]} intensity={0.8} color="#d8d0c8" distance={3} decay={2} />

      {/* ── Extra spotlights — illuminate equipment and walls ── */}
      {/* Spot on drum kit */}
      <pointLight position={[-3.2, height - 0.3, -2.5]} intensity={1.5} color="#e0d8d0" distance={5} decay={2} />
      {/* Spot on mic stand */}
      <pointLight position={[0, height - 0.3, -2.5]} intensity={1.5} color="#e0d8d0" distance={5} decay={2} />
      {/* Back wall wash — illuminate logo area */}
      <pointLight position={[-1.5, 2.5, -3.5]} intensity={1.0} color="#d0d0d0" distance={4} decay={2} />
      <pointLight position={[1.5, 2.5, -3.5]} intensity={1.0} color="#d0d0d0" distance={4} decay={2} />
      {/* Side wall accents */}
      <pointLight position={[-hw + 0.5, height - 0.5, 2]} intensity={0.8} color="#e0d8d0" distance={4} decay={2} />
      <pointLight position={[hw - 0.5, height - 0.5, 2]} intensity={0.8} color="#e0d8d0" distance={4} decay={2} />
      {/* Equipment rack spotlight */}
      <pointLight position={[-5.0, height - 0.3, 0.5]} intensity={1.0} color="#d8d8d8" distance={3.5} decay={2} />
      {/* Floor pools near desk */}
      <pointLight position={[-2, 0.05, 1.5]} intensity={0.3} color="#4040a0" distance={3} decay={2} />
      <pointLight position={[2, 0.05, 1.5]} intensity={0.3} color="#4040a0" distance={3} decay={2} />
    </group>
  );
}
