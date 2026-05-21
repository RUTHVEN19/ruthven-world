import { SCREEN, ROOM } from './cinemaLayout';

/**
 * CinemaCurtains — Luxury velvet curtains flanking the cinema screen
 *
 * Deep burgundy/crimson drapes gathered at the edges, framing the screen.
 * Built from overlapping angled planes to create a gathered fabric look.
 */
export default function CinemaCurtains() {
  const { width: screenW, height: screenH } = SCREEN;
  const { depth, height: roomH, wallThickness } = ROOM;
  const hd = depth / 2;
  const screenZ = -(hd - wallThickness - 0.02);
  const screenY = 3.0;

  // Curtain dimensions
  const curtainH = screenH + 1.2; // taller than screen
  const curtainW = 1.8; // width of each curtain panel
  const curtainY = screenY + 0.3; // slightly higher than screen center

  // Deep burgundy velvet
  const velvetDark = { color: '#2a0a10', roughness: 0.92, metalness: 0.02 };
  const velvetMid = { color: '#3a1018', roughness: 0.88, metalness: 0.03 };
  const velvetLight = { color: '#4a1420', roughness: 0.85, metalness: 0.03 };
  const goldTrim = { color: '#b8a060', roughness: 0.2, metalness: 0.85 };
  const goldRope = { color: '#c4a450', roughness: 0.25, metalness: 0.8 };

  return (
    <group name="cinema-curtains">
      {/* ── Left curtain cluster ── */}
      <group position={[-(screenW / 2 + curtainW / 2 + 0.1), curtainY, screenZ + 0.05]}>
        {/* Main curtain folds — overlapping angled planes */}
        <CurtainFolds
          curtainW={curtainW}
          curtainH={curtainH}
          velvetDark={velvetDark}
          velvetMid={velvetMid}
          velvetLight={velvetLight}
          side="left"
        />
        {/* Gold tieback rope */}
        <mesh position={[curtainW * 0.15, -curtainH * 0.12, 0.12]}>
          <cylinderGeometry args={[0.025, 0.025, curtainW * 0.7, 8]} />
          <meshStandardMaterial {...goldRope} />
        </mesh>
        {/* Rope knot */}
        <mesh position={[curtainW * 0.4, -curtainH * 0.12, 0.12]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial {...goldRope} />
        </mesh>
      </group>

      {/* ── Right curtain cluster ── */}
      <group position={[(screenW / 2 + curtainW / 2 + 0.1), curtainY, screenZ + 0.05]}>
        <CurtainFolds
          curtainW={curtainW}
          curtainH={curtainH}
          velvetDark={velvetDark}
          velvetMid={velvetMid}
          velvetLight={velvetLight}
          side="right"
        />
        {/* Gold tieback rope */}
        <mesh position={[-curtainW * 0.15, -curtainH * 0.12, 0.12]}>
          <cylinderGeometry args={[0.025, 0.025, curtainW * 0.7, 8]} />
          <meshStandardMaterial {...goldRope} />
        </mesh>
        {/* Rope knot */}
        <mesh position={[-curtainW * 0.4, -curtainH * 0.12, 0.12]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial {...goldRope} />
        </mesh>
      </group>

      {/* ── Pelmet / valance across top ── */}
      <group position={[0, screenY + screenH / 2 + 0.8, screenZ + 0.06]}>
        {/* Main pelmet board */}
        <mesh>
          <boxGeometry args={[screenW + curtainW * 2 + 0.6, 0.5, 0.15]} />
          <meshStandardMaterial {...velvetDark} />
        </mesh>
        {/* Gold trim along bottom edge of pelmet */}
        <mesh position={[0, -0.26, 0.02]}>
          <boxGeometry args={[screenW + curtainW * 2 + 0.6, 0.03, 0.02]} />
          <meshStandardMaterial {...goldTrim} />
        </mesh>
        {/* Gold trim along top edge of pelmet */}
        <mesh position={[0, 0.26, 0.02]}>
          <boxGeometry args={[screenW + curtainW * 2 + 0.6, 0.02, 0.02]} />
          <meshStandardMaterial {...goldTrim} />
        </mesh>
        {/* Draped swag shapes along pelmet */}
        {[-3.5, -1, 1.5, 4].map((x, i) => (
          <mesh key={`swag-${i}`} position={[x, -0.35, 0.06]}>
            <boxGeometry args={[2.2, 0.18, 0.04]} />
            <meshStandardMaterial {...velvetMid} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ── Curtain fold geometry — stacked angled planes ── */
function CurtainFolds({ curtainW, curtainH, velvetDark, velvetMid, velvetLight, side }) {
  const dir = side === 'left' ? 1 : -1;
  const foldCount = 5;
  const foldW = curtainW / foldCount;

  return (
    <group>
      {Array.from({ length: foldCount }, (_, i) => {
        const x = (i - foldCount / 2 + 0.5) * foldW * 0.9;
        const zOff = Math.sin(i * 1.3) * 0.06; // slight z variation for depth
        const angle = dir * (0.04 + i * 0.015); // slight outward angle
        const mat = i % 3 === 0 ? velvetLight : i % 3 === 1 ? velvetMid : velvetDark;

        return (
          <mesh
            key={`fold-${i}`}
            position={[x, 0, zOff]}
            rotation={[0, angle, 0]}
          >
            <boxGeometry args={[foldW * 0.85, curtainH, 0.06]} />
            <meshStandardMaterial {...mat} />
          </mesh>
        );
      })}

      {/* Gathered bunching at tieback height */}
      <mesh position={[dir * curtainW * 0.1, -curtainH * 0.12, 0.08]}>
        <boxGeometry args={[curtainW * 0.7, 0.4, 0.15]} />
        <meshStandardMaterial {...velvetMid} />
      </mesh>

      {/* Lower drape below tieback — slightly wider, looser */}
      <mesh position={[dir * curtainW * 0.05, -curtainH * 0.35, 0.04]}>
        <boxGeometry args={[curtainW * 0.85, curtainH * 0.3, 0.05]} />
        <meshStandardMaterial {...velvetDark} />
      </mesh>
    </group>
  );
}
