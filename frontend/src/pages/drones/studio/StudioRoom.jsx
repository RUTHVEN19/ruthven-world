import { useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { ROOM } from './studioLayout';

/**
 * StudioRoom — Room shell: walls, floor, ceiling, acoustic panels, diffusion grid
 */
export default function StudioRoom() {
  const { width, depth, height, wallThickness } = ROOM;
  const hw = width / 2;
  const hd = depth / 2;

  // Load Drones logo for back wall
  const [logoTex, setLogoTex] = useState(null);
  useEffect(() => {
    let disposed = false;
    const loader = new THREE.TextureLoader();
    loader.load('/DRONES LOGO.png', (tex) => {
      if (disposed) { tex.dispose(); return; }
      tex.colorSpace = THREE.SRGBColorSpace;
      setLogoTex(tex);
    });
    return () => { disposed = true; };
  }, []);

  const wallMat = useMemo(() => ({
    color: '#1a1a1a',
    roughness: 0.85,
    metalness: 0.05,
  }), []);

  const floorMat = useMemo(() => ({
    color: '#1a1a1a',
    roughness: 0.35,
    metalness: 0.15,
  }), []);

  const ceilingMat = useMemo(() => ({
    color: '#101010',
    roughness: 0.95,
    metalness: 0.0,
  }), []);

  const chromeMat = useMemo(() => ({
    color: '#404040',
    roughness: 0.15,
    metalness: 0.9,
  }), []);

  const panelMat = useMemo(() => ({
    color: '#222222',
    roughness: 0.9,
    metalness: 0.0,
  }), []);

  return (
    <group name="studio-room">
      {/* ── Floor ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial {...floorMat} />
      </mesh>

      {/* ── Ceiling ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial {...ceilingMat} />
      </mesh>

      {/* ── Left wall ── */}
      <mesh position={[-hw, height / 2, 0]}>
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>

      {/* ── Right wall ── */}
      <mesh position={[hw, height / 2, 0]}>
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>

      {/* ── Back wall (behind recording area) ── */}
      <mesh position={[0, height / 2, -hd]}>
        <boxGeometry args={[width + wallThickness * 2, height, wallThickness]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>

      {/* ── Front wall (behind listener) ── */}
      <mesh position={[0, height / 2, hd]}>
        <boxGeometry args={[width + wallThickness * 2, height, wallThickness]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>

      {/* ── Chrome baseboard trim ── */}
      {[
        [-hw + wallThickness / 2 + 0.01, 0.03, 0, wallThickness * 0.1, 0.06, depth - wallThickness],
        [hw - wallThickness / 2 - 0.01, 0.03, 0, wallThickness * 0.1, 0.06, depth - wallThickness],
        [0, 0.03, -hd + wallThickness / 2 + 0.01, width, 0.06, wallThickness * 0.1],
        [0, 0.03, hd - wallThickness / 2 - 0.01, width, 0.06, wallThickness * 0.1],
      ].map(([x, y, z, bw, bh, bd], i) => (
        <mesh key={`base-${i}`} position={[x, y, z]}>
          <boxGeometry args={[bw, bh, bd]} />
          <meshStandardMaterial {...chromeMat} />
        </mesh>
      ))}

      {/* ── Acoustic panels on LEFT wall ── */}
      <AcousticPanelGrid
        wallX={-hw + wallThickness / 2 + 0.03}
        faceRight
        panelMat={panelMat}
        height={height}
      />

      {/* ── Acoustic panels on RIGHT wall ── */}
      <AcousticPanelGrid
        wallX={hw - wallThickness / 2 - 0.03}
        faceRight={false}
        panelMat={panelMat}
        height={height}
      />

      {/* ── Sound diffusion grid on BACK wall ── */}
      <DiffusionGrid
        wallZ={-hd + wallThickness / 2 + 0.03}
        panelMat={panelMat}
        height={height}
      />

      {/* ── Drones of Suburbia logo on back wall ── */}
      {logoTex && (
        <mesh position={[0, height - 1.5, -hd + wallThickness / 2 + 0.15]}>
          <planeGeometry args={[2.5, 2.5]} />
          <meshBasicMaterial
            map={logoTex}
            transparent
            opacity={0.35}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

/* ── Acoustic panel grid for side walls ── */
function AcousticPanelGrid({ wallX, faceRight, panelMat, height }) {
  const panels = [];
  const cols = 6;
  const rows = 3;
  const panelW = 0.5;
  const panelH = 0.5;
  const gapZ = 1.2;
  const gapY = 0.8;
  const startY = height * 0.35;
  const startZ = -(cols * gapZ) / 2 + gapZ / 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const y = startY + r * gapY;
      const z = startZ + c * gapZ;
      const tiltY = ((r + c) % 3 - 1) * 0.08;
      const rotY = faceRight ? Math.PI / 2 + tiltY : -Math.PI / 2 + tiltY;

      panels.push(
        <mesh
          key={`ap-${r}-${c}`}
          position={[wallX, y, z]}
          rotation={[0, rotY, 0]}
        >
          <boxGeometry args={[panelW, panelH, 0.04]} />
          <meshStandardMaterial {...panelMat} />
        </mesh>
      );
    }
  }

  return <group>{panels}</group>;
}

/* ── Diffusion grid for back wall ── */
function DiffusionGrid({ wallZ, panelMat, height }) {
  const blocks = [];
  const cols = 12;
  const rows = 6;
  const size = 0.14;
  const gap = 0.22;
  const startX = -(cols * gap) / 2 + gap / 2;
  const startY = height * 0.3;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * gap;
      const y = startY + r * gap;
      const depth = 0.04 + Math.random() * 0.08;
      const tiltX = (Math.random() - 0.5) * 0.15;
      const tiltY = (Math.random() - 0.5) * 0.15;

      blocks.push(
        <mesh
          key={`df-${r}-${c}`}
          position={[x, y, wallZ]}
          rotation={[tiltX, tiltY, 0]}
        >
          <boxGeometry args={[size, size, depth]} />
          <meshStandardMaterial {...panelMat} />
        </mesh>
      );
    }
  }

  return <group>{blocks}</group>;
}
