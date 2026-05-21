import { useMemo } from 'react';
import { MIXING_DESK, MONITORS, MIC_STAND, DRUM_KIT, VOCAL_BOOTH, EQUIPMENT_RACK } from './studioLayout';

/**
 * StudioEquipment — All studio gear built from primitive geometry
 */
export default function StudioEquipment() {
  return (
    <group name="studio-equipment">
      <MixingConsole />
      <MonitorSpeaker position={MONITORS.left} />
      <MonitorSpeaker position={MONITORS.right} />
      <Microphone />
      <DrumKit />
      <VocalBooth />
      <EquipmentRack />
      <CableRuns />
    </group>
  );
}

/* ═══════════════════════════════════════════════
   MIXING CONSOLE
   ═══════════════════════════════════════════════ */
function MixingConsole() {
  const { position, width: dw, depth: dd, height: dh } = MIXING_DESK;
  const [px, , pz] = position;

  const deskMat = useMemo(() => ({ color: '#1a1a1a', roughness: 0.6, metalness: 0.3 }), []);
  const surfaceMat = useMemo(() => ({ color: '#252525', roughness: 0.5, metalness: 0.2 }), []);
  const chromeMat = useMemo(() => ({ color: '#505050', roughness: 0.15, metalness: 0.9 }), []);

  // Fader channels
  const faders = [];
  const faderCount = 16;
  const faderSpacing = (dw - 0.6) / faderCount;
  const startX = -(dw - 0.6) / 2 + faderSpacing / 2;

  for (let i = 0; i < faderCount; i++) {
    const fx = startX + i * faderSpacing;
    const faderY = 0.02 + Math.random() * 0.08;

    faders.push(
      <group key={`fader-${i}`} position={[fx, 0.03, -0.15]}>
        {/* Fader slot */}
        <mesh>
          <boxGeometry args={[0.03, 0.005, 0.18]} />
          <meshStandardMaterial color="#101010" roughness={0.8} />
        </mesh>
        {/* Fader knob */}
        <mesh position={[0, 0.01, faderY - 0.09]}>
          <boxGeometry args={[0.04, 0.015, 0.025]} />
          <meshStandardMaterial {...chromeMat} />
        </mesh>
      </group>
    );
  }

  // Button rows (coloured indicators)
  const buttons = [];
  const buttonColors = ['#00aa00', '#aa0000', '#aa8800', '#00aa00', '#0088aa'];
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < faderCount; i++) {
      const bx = startX + i * faderSpacing;
      const bz = 0.12 + row * 0.08;
      const colorIdx = (i + row) % buttonColors.length;
      const isLit = Math.random() > 0.5;

      buttons.push(
        <mesh key={`btn-${row}-${i}`} position={[bx, 0.03, bz]}>
          <boxGeometry args={[0.025, 0.012, 0.025]} />
          {isLit ? (
            <meshBasicMaterial color={buttonColors[colorIdx]} toneMapped={false} />
          ) : (
            <meshStandardMaterial color="#181818" roughness={0.8} />
          )}
        </mesh>
      );
    }
  }

  return (
    <group position={[px, 0, pz]}>
      {/* Desk body */}
      <mesh position={[0, dh / 2, 0]}>
        <boxGeometry args={[dw, dh, dd]} />
        <meshStandardMaterial {...deskMat} />
      </mesh>

      {/* Angled control surface */}
      <group position={[0, dh + 0.02, 0]} rotation={[-0.22, 0, 0]}>
        <mesh>
          <boxGeometry args={[dw - 0.1, 0.04, dd - 0.15]} />
          <meshStandardMaterial {...surfaceMat} />
        </mesh>
        {faders}
        {buttons}
      </group>

      {/* LCD meter panel at back of desk */}
      <mesh position={[0, dh + 0.2, -dd / 2 + 0.08]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[2.5, 0.35, 0.05]} />
        <meshBasicMaterial color="#0a1a0a" toneMapped={false} />
      </mesh>

      {/* Desk legs */}
      {[-dw / 2 + 0.15, dw / 2 - 0.15].map((lx, i) => (
        <mesh key={`leg-${i}`} position={[lx, 0.02, 0]}>
          <boxGeometry args={[0.08, 0.04, dd + 0.1]} />
          <meshStandardMaterial {...chromeMat} />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════
   STUDIO MONITOR SPEAKER
   ═══════════════════════════════════════════════ */
function MonitorSpeaker({ position }) {
  const { width: mw, height: mh, depth: md } = MONITORS;

  return (
    <group position={position}>
      {/* Cabinet */}
      <mesh>
        <boxGeometry args={[mw, mh, md]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Woofer cone */}
      <mesh position={[0, -0.04, md / 2 + 0.01]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.09, 0.025, 16]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Woofer centre dust cap */}
      <mesh position={[0, -0.04, md / 2 + 0.025]}>
        <sphereGeometry args={[0.03, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
      </mesh>

      {/* Tweeter */}
      <mesh position={[0, 0.1, md / 2 + 0.01]}>
        <cylinderGeometry args={[0.03, 0.035, 0.02, 12]} />
        <meshStandardMaterial color="#303030" roughness={0.4} metalness={0.4} />
      </mesh>

      {/* Power LED */}
      <mesh position={[0, -0.16, md / 2 + 0.005]}>
        <boxGeometry args={[0.012, 0.012, 0.005]} />
        <meshBasicMaterial color="#00cc00" toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════
   MICROPHONE + STAND
   ═══════════════════════════════════════════════ */
function Microphone() {
  const [px, , pz] = MIC_STAND.position;
  const chromeMat = useMemo(() => ({ color: '#505050', roughness: 0.15, metalness: 0.9 }), []);

  return (
    <group position={[px, 0, pz]}>
      {/* Stand base — tripod footprint */}
      <mesh position={[0, 0.015, 0]}>
        <cylinderGeometry args={[0.14, 0.16, 0.03, 8]} />
        <meshStandardMaterial {...chromeMat} />
      </mesh>

      {/* Stand pole */}
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.012, 0.014, 1.6, 8]} />
        <meshStandardMaterial {...chromeMat} />
      </mesh>

      {/* Boom arm */}
      <group position={[0, 1.6, 0]} rotation={[0, 0, 0.45]}>
        <mesh position={[0.25, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.55, 6]} />
          <meshStandardMaterial {...chromeMat} />
        </mesh>
      </group>

      {/* Mic body (condenser) */}
      <group position={[0.38, 1.78, 0]} rotation={[0, 0, 0.45]}>
        <mesh>
          <boxGeometry args={[0.04, 0.2, 0.04]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.7} />
        </mesh>
        {/* Mic grille */}
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.06, 12]} />
          <meshStandardMaterial color="#383838" roughness={0.3} metalness={0.8} />
        </mesh>
      </group>

      {/* Pop filter */}
      <mesh position={[0.2, 1.65, 0.1]} rotation={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.003, 16]} />
        <meshStandardMaterial color="#0a0a0a" transparent opacity={0.3} roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════
   DRUM KIT
   ═══════════════════════════════════════════════ */
function DrumKit() {
  const [px, , pz] = DRUM_KIT.position;
  const shellMat = useMemo(() => ({ color: '#1e1e1e', roughness: 0.6, metalness: 0.2 }), []);
  const chromeMat = useMemo(() => ({ color: '#505050', roughness: 0.15, metalness: 0.9 }), []);
  const cymbalMat = useMemo(() => ({ color: '#8a8a50', roughness: 0.2, metalness: 0.85 }), []);

  return (
    <group position={[px, 0, pz]}>
      {/* Kick drum — on its side */}
      <mesh position={[0, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.38, 0.38, 0.42, 16]} />
        <meshStandardMaterial {...shellMat} />
      </mesh>
      {/* Kick drum front head */}
      <mesh position={[0.22, 0.4, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.36, 0.36, 0.01, 16]} />
        <meshStandardMaterial color="#282828" roughness={0.8} />
      </mesh>

      {/* Snare drum */}
      <mesh position={[0.5, 0.7, 0.3]} rotation={[0.15, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.1, 16]} />
        <meshStandardMaterial {...shellMat} />
      </mesh>
      {/* Snare stand */}
      <mesh position={[0.5, 0.35, 0.3]}>
        <cylinderGeometry args={[0.01, 0.015, 0.65, 6]} />
        <meshStandardMaterial {...chromeMat} />
      </mesh>

      {/* Hi-hat — two thin cymbals */}
      <mesh position={[0.8, 0.9, 0.1]}>
        <cylinderGeometry args={[0.14, 0.14, 0.008, 16]} />
        <meshStandardMaterial {...cymbalMat} />
      </mesh>
      <mesh position={[0.8, 0.92, 0.1]}>
        <cylinderGeometry args={[0.14, 0.14, 0.008, 16]} />
        <meshStandardMaterial {...cymbalMat} />
      </mesh>
      {/* Hi-hat stand */}
      <mesh position={[0.8, 0.45, 0.1]}>
        <cylinderGeometry args={[0.01, 0.015, 0.85, 6]} />
        <meshStandardMaterial {...chromeMat} />
      </mesh>

      {/* Rack tom */}
      <mesh position={[-0.15, 0.85, -0.3]} rotation={[0.25, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.1, 12]} />
        <meshStandardMaterial {...shellMat} />
      </mesh>

      {/* Floor tom */}
      <mesh position={[0.7, 0.45, -0.35]}>
        <cylinderGeometry args={[0.15, 0.15, 0.14, 12]} />
        <meshStandardMaterial {...shellMat} />
      </mesh>
      {/* Floor tom legs */}
      {[0, 1, 2].map(i => {
        const angle = (i / 3) * Math.PI * 2;
        return (
          <mesh key={`ftl-${i}`} position={[0.7 + Math.cos(angle) * 0.12, 0.2, -0.35 + Math.sin(angle) * 0.12]}>
            <cylinderGeometry args={[0.008, 0.008, 0.35, 6]} />
            <meshStandardMaterial {...chromeMat} />
          </mesh>
        );
      })}

      {/* Crash cymbal */}
      <mesh position={[-0.6, 1.15, -0.15]} rotation={[0.1, 0, 0.05]}>
        <cylinderGeometry args={[0.18, 0.19, 0.006, 16]} />
        <meshStandardMaterial {...cymbalMat} />
      </mesh>
      {/* Crash stand */}
      <mesh position={[-0.6, 0.6, -0.15]}>
        <cylinderGeometry args={[0.01, 0.015, 1.1, 6]} />
        <meshStandardMaterial {...chromeMat} />
      </mesh>

      {/* Ride cymbal */}
      <mesh position={[1.0, 1.0, -0.4]} rotation={[-0.08, 0, -0.05]}>
        <cylinderGeometry args={[0.22, 0.23, 0.007, 16]} />
        <meshStandardMaterial {...cymbalMat} />
      </mesh>
      {/* Ride stand */}
      <mesh position={[1.0, 0.5, -0.4]}>
        <cylinderGeometry args={[0.01, 0.015, 0.95, 6]} />
        <meshStandardMaterial {...chromeMat} />
      </mesh>

      {/* Drum stool */}
      <mesh position={[0.3, 0.5, 0.7]}>
        <cylinderGeometry args={[0.16, 0.14, 0.05, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
      <mesh position={[0.3, 0.26, 0.7]}>
        <cylinderGeometry args={[0.02, 0.03, 0.45, 8]} />
        <meshStandardMaterial {...chromeMat} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════
   VOCAL BOOTH
   ═══════════════════════════════════════════════ */
function VocalBooth() {
  const { position, width: bw, depth: bd, height: bh } = VOCAL_BOOTH;
  const [px, , pz] = position;

  const frameMat = useMemo(() => ({ color: '#1a1a1a', roughness: 0.6, metalness: 0.3 }), []);

  return (
    <group position={[px, 0, pz]}>
      {/* Glass partition — front face */}
      <mesh position={[0, bh / 2, bd / 2]}>
        <planeGeometry args={[bw, bh]} />
        <meshStandardMaterial
          color="#c0c8d0"
          transparent
          opacity={0.12}
          roughness={0.05}
          metalness={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* Glass partition — side face */}
      <mesh position={[-bw / 2, bh / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[bd, bh]} />
        <meshStandardMaterial
          color="#c0c8d0"
          transparent
          opacity={0.1}
          roughness={0.05}
          metalness={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* Frame — vertical posts */}
      {[
        [-bw / 2, bh / 2, bd / 2],
        [bw / 2, bh / 2, bd / 2],
        [-bw / 2, bh / 2, -bd / 2],
      ].map(([fx, fy, fz], i) => (
        <mesh key={`vf-${i}`} position={[fx, fy, fz]}>
          <boxGeometry args={[0.06, bh, 0.06]} />
          <meshStandardMaterial {...frameMat} />
        </mesh>
      ))}

      {/* Frame — top beam */}
      <mesh position={[0, bh, bd / 2]}>
        <boxGeometry args={[bw + 0.06, 0.06, 0.06]} />
        <meshStandardMaterial {...frameMat} />
      </mesh>

      {/* "ON AIR" sign above glass */}
      <mesh position={[0, bh + 0.15, bd / 2 + 0.02]}>
        <boxGeometry args={[0.5, 0.15, 0.03]} />
        <meshBasicMaterial color="#cc0000" toneMapped={false} />
      </mesh>

      {/* Booth interior mic (simple) */}
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.01, 0.012, 1.2, 6]} />
        <meshStandardMaterial color="#505050" roughness={0.15} metalness={0.9} />
      </mesh>
      <mesh position={[0, 2.0, 0]}>
        <boxGeometry args={[0.03, 0.15, 0.03]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.7} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════
   EQUIPMENT RACK
   ═══════════════════════════════════════════════ */
function EquipmentRack() {
  const { position, width: rw, height: rh, depth: rd } = EQUIPMENT_RACK;
  const [px, , pz] = position;

  const rackMat = useMemo(() => ({ color: '#141414', roughness: 0.7, metalness: 0.3 }), []);
  const shelfMat = useMemo(() => ({ color: '#2a2a2a', roughness: 0.5, metalness: 0.4 }), []);

  const shelves = [];
  const unitCount = 7;
  const unitH = rh / unitCount;

  for (let i = 0; i < unitCount; i++) {
    const sy = unitH * i + unitH / 2;

    shelves.push(
      <group key={`ru-${i}`}>
        {/* Shelf divider */}
        <mesh position={[0, sy + unitH / 2, 0]}>
          <boxGeometry args={[rw - 0.02, 0.012, rd - 0.02]} />
          <meshStandardMaterial {...shelfMat} />
        </mesh>
        {/* LED indicators (random) */}
        {Math.random() > 0.3 && (
          <mesh position={[rw / 2 - 0.05, sy, rd / 2 + 0.005]}>
            <boxGeometry args={[0.01, 0.01, 0.005]} />
            <meshBasicMaterial
              color={Math.random() > 0.5 ? '#00cc00' : '#ccaa00'}
              toneMapped={false}
            />
          </mesh>
        )}
      </group>
    );
  }

  return (
    <group position={[px, 0, pz]}>
      {/* Cabinet body */}
      <mesh position={[0, rh / 2, 0]}>
        <boxGeometry args={[rw, rh, rd]} />
        <meshStandardMaterial {...rackMat} />
      </mesh>

      {/* Rack units with shelves and LEDs */}
      {shelves}

      {/* Ventilation grille at top */}
      <mesh position={[0, rh - 0.05, rd / 2 + 0.005]}>
        <boxGeometry args={[rw - 0.1, 0.08, 0.005]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════
   CABLE RUNS
   ═══════════════════════════════════════════════ */
function CableRuns() {
  const cables = [
    // From equipment rack to mixing desk
    { from: [-5.2, 0.01, 0.5], to: [-1.8, 0.01, 2.2], color: '#0a0a0a' },
    // From desk to vocal booth area
    { from: [1.8, 0.01, 2.2], to: [3.5, 0.01, -0.5], color: '#0a0a0a' },
    // From desk area toward mic
    { from: [0.3, 0.01, 1.5], to: [0.2, 0.01, -2.0], color: '#101010' },
  ];

  return (
    <group name="cable-runs">
      {cables.map(({ from, to, color }, i) => {
        const dx = to[0] - from[0];
        const dz = to[2] - from[2];
        const length = Math.sqrt(dx * dx + dz * dz);
        const angle = Math.atan2(dx, dz);
        const mx = (from[0] + to[0]) / 2;
        const mz = (from[2] + to[2]) / 2;

        return (
          <mesh
            key={`cable-${i}`}
            position={[mx, 0.01, mz]}
            rotation={[Math.PI / 2, angle, 0]}
          >
            <cylinderGeometry args={[0.012, 0.012, length, 6]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}
