import { useMemo } from 'react';
import { generateSeatPositions, SEAT_DIMS } from './cinemaLayout';

/**
 * CinemaSeating — 3 tiered rows of luxury cinema recliners
 * Plush velvet with padded headrests, wide armrests, cup holders
 */
export default function CinemaSeating() {
  const seats = useMemo(() => generateSeatPositions(), []);
  const { width, depth, height, backrestHeight, armrestWidth } = SEAT_DIMS;

  // Materials — pure grey/black, no purple tints
  const velvet = { color: '#2a2a2a', roughness: 0.85, metalness: 0.04 };
  const cushion = { color: '#303030', roughness: 0.80, metalness: 0.04 };
  const leather = { color: '#262626', roughness: 0.72, metalness: 0.06 };
  const gold = { color: '#a8b0b8', roughness: 0.15, metalness: 0.9 };
  const darkChrome = { color: '#484848', roughness: 0.12, metalness: 0.92 };

  return (
    <group name="cinema-seating">
      {seats.map((seat, i) => {
        const [sx, sy, sz] = seat.position;
        return (
          <group key={i} position={[sx, sy, sz]}>
            {/* ── Seat base / legs ── */}
            <mesh position={[0, 0.04, 0]}>
              <boxGeometry args={[width, 0.08, depth]} />
              <meshStandardMaterial {...darkChrome} />
            </mesh>
            {/* Front legs */}
            <mesh position={[-width / 2 + 0.06, 0.02, depth / 2 - 0.06]}>
              <boxGeometry args={[0.04, 0.04, 0.04]} />
              <meshStandardMaterial {...darkChrome} />
            </mesh>
            <mesh position={[width / 2 - 0.06, 0.02, depth / 2 - 0.06]}>
              <boxGeometry args={[0.04, 0.04, 0.04]} />
              <meshStandardMaterial {...darkChrome} />
            </mesh>

            {/* ── Seat cushion — thicker, more plush ── */}
            <mesh position={[0, height / 2 + 0.08, 0.03]}>
              <boxGeometry args={[width - 0.12, height - 0.06, depth - 0.12]} />
              <meshStandardMaterial {...cushion} />
            </mesh>
            {/* Cushion top padding (rounded look) */}
            <mesh position={[0, height + 0.06, 0.03]}>
              <boxGeometry args={[width - 0.18, 0.04, depth - 0.18]} />
              <meshStandardMaterial {...leather} />
            </mesh>

            {/* ── Backrest — taller, angled slightly ── */}
            <mesh position={[0, height + backrestHeight / 2 + 0.08, -(depth / 2 - 0.1)]}
                  rotation={[0.08, 0, 0]}>
              <boxGeometry args={[width - 0.12, backrestHeight, 0.14]} />
              <meshStandardMaterial {...velvet} />
            </mesh>

            {/* ── Headrest — padded cushion at top of backrest ── */}
            <mesh position={[0, height + backrestHeight + 0.22, -(depth / 2 - 0.08)]}
                  rotation={[0.06, 0, 0]}>
              <boxGeometry args={[width * 0.55, 0.22, 0.1]} />
              <meshStandardMaterial {...leather} />
            </mesh>

            {/* ── Left armrest — wider, padded ── */}
            <group position={[-(width / 2 - 0.06), 0, 0]}>
              {/* Armrest support */}
              <mesh position={[0, height * 0.55, 0]}>
                <boxGeometry args={[0.08, height * 0.5, depth - 0.2]} />
                <meshStandardMaterial {...velvet} />
              </mesh>
              {/* Armrest pad */}
              <mesh position={[0, height + 0.16, 0.02]}>
                <boxGeometry args={[0.1, 0.06, depth - 0.14]} />
                <meshStandardMaterial {...gold} />
              </mesh>
              {/* Cup holder ring */}
              <mesh position={[0, height + 0.2, depth / 2 - 0.18]}>
                <cylinderGeometry args={[0.04, 0.04, 0.02, 12]} />
                <meshStandardMaterial {...darkChrome} />
              </mesh>
              {/* Cup holder cavity */}
              <mesh position={[0, height + 0.18, depth / 2 - 0.18]}>
                <cylinderGeometry args={[0.032, 0.032, 0.04, 12]} />
                <meshStandardMaterial color="#0a0a0e" roughness={0.9} metalness={0.1} />
              </mesh>
            </group>

            {/* ── Right armrest — wider, padded ── */}
            <group position={[(width / 2 - 0.06), 0, 0]}>
              {/* Armrest support */}
              <mesh position={[0, height * 0.55, 0]}>
                <boxGeometry args={[0.08, height * 0.5, depth - 0.2]} />
                <meshStandardMaterial {...velvet} />
              </mesh>
              {/* Armrest pad */}
              <mesh position={[0, height + 0.16, 0.02]}>
                <boxGeometry args={[0.1, 0.06, depth - 0.14]} />
                <meshStandardMaterial {...gold} />
              </mesh>
              {/* Cup holder ring */}
              <mesh position={[0, height + 0.2, depth / 2 - 0.18]}>
                <cylinderGeometry args={[0.04, 0.04, 0.02, 12]} />
                <meshStandardMaterial {...darkChrome} />
              </mesh>
              {/* Cup holder cavity */}
              <mesh position={[0, height + 0.18, depth / 2 - 0.18]}>
                <cylinderGeometry args={[0.032, 0.032, 0.04, 12]} />
                <meshStandardMaterial color="#0a0a0e" roughness={0.9} metalness={0.1} />
              </mesh>
            </group>
          </group>
        );
      })}

      {/* ── Tiered floor platforms (risers) ── */}
      {[1, 2].map((row) => {
        const riseHeight = row * 0.35;
        const rowZ = 1.5 + row * 2.2;
        return (
          <group key={`riser-${row}`}>
            {/* Main riser */}
            <mesh position={[0, riseHeight / 2, rowZ]}>
              <boxGeometry args={[12, riseHeight, 2.4]} />
              <meshStandardMaterial color="#141414" roughness={0.92} metalness={0.0} />
            </mesh>
            {/* Silver trim strip along riser front edge */}
            <mesh position={[0, riseHeight, rowZ - 1.2]}>
              <boxGeometry args={[12, 0.015, 0.015]} />
              <meshStandardMaterial color="#a8b0b8" roughness={0.15} metalness={0.9} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
