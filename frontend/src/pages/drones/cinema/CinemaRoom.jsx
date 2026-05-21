import { useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { ROOM, SCONCE_POSITIONS } from './cinemaLayout';

/**
 * CinemaRoom — Luxury private screening room: dark velvet walls, plush carpet,
 * dark ceiling with recessed panel, chrome/gold accent trim, wall sconces
 */
export default function CinemaRoom() {
  const { width, depth, height, wallThickness, baseboardHeight } = ROOM;
  const hw = width / 2;
  const hd = depth / 2;

  // Create Diamond Drones™ floor logo via canvas
  const [logoTexture, setLogoTexture] = useState(null);
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.font = '900 80px "Anton", "Impact", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#d0d8e0';
    ctx.fillText('DIAMOND', 256, 210);
    ctx.fillText('DRONES', 256, 310);

    ctx.font = '600 20px "Space Mono", monospace';
    ctx.fillStyle = 'rgba(176, 184, 192, 0.6)';
    const m = ctx.measureText('DRONES');
    ctx.textBaseline = 'top';
    ctx.fillText('™', 256 + m.width / 2 + 4, 275);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    setLogoTexture(tex);
    return () => { tex.dispose(); };
  }, []);

  /* ── Materials — pure grey/black, no purple or blue tints ── */
  const wallMat = useMemo(() => ({
    color: '#303030',
    roughness: 0.82,
    metalness: 0.05,
  }), []);

  // Plush carpet floor — no reflections
  const carpetMat = useMemo(() => ({
    color: '#181818',
    roughness: 0.95,
    metalness: 0.0,
  }), []);

  const ceilingMat = useMemo(() => ({
    color: '#101010',
    roughness: 0.9,
    metalness: 0.0,
  }), []);

  // Screen wall — darker for contrast
  const screenWallMat = useMemo(() => ({
    color: '#0a0a0a',
    roughness: 0.9,
    metalness: 0.05,
  }), []);

  const chromeMat = useMemo(() => ({
    color: '#c0c8d0',
    roughness: 0.15,
    metalness: 0.9,
  }), []);

  const goldMat = useMemo(() => ({
    color: '#a8b0b8',
    roughness: 0.15,
    metalness: 0.9,
  }), []);

  return (
    <group name="cinema-room">
      {/* ── Floor — plush dark carpet ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial {...carpetMat} />
      </mesh>

      {/* ── Ceiling ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial {...ceilingMat} />
      </mesh>

      {/* ── Recessed ceiling panel — slightly lighter, inset ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height - 0.02, 0]}>
        <planeGeometry args={[width - 2, depth - 2]} />
        <meshStandardMaterial color="#141414" roughness={0.85} metalness={0.0} />
      </mesh>

      {/* ── Left Wall ── */}
      <mesh position={[-hw, height / 2, 0]}>
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>

      {/* ── Right Wall ── */}
      <mesh position={[hw, height / 2, 0]}>
        <boxGeometry args={[wallThickness, height, depth]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>

      {/* ── Front Wall (screen wall) ── */}
      <mesh position={[0, height / 2, -hd]}>
        <boxGeometry args={[width + wallThickness * 2, height, wallThickness]} />
        <meshStandardMaterial {...screenWallMat} />
      </mesh>

      {/* ── Back Wall ── */}
      <mesh position={[0, height / 2, hd]}>
        <boxGeometry args={[width + wallThickness * 2, height, wallThickness]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>

      {/* ── Chrome baseboards ── */}
      {/* Left */}
      <mesh position={[-(hw - wallThickness / 2 - 0.01), baseboardHeight / 2, 0]}>
        <boxGeometry args={[0.04, baseboardHeight, depth - wallThickness]} />
        <meshStandardMaterial {...chromeMat} />
      </mesh>
      {/* Right */}
      <mesh position={[(hw - wallThickness / 2 - 0.01), baseboardHeight / 2, 0]}>
        <boxGeometry args={[0.04, baseboardHeight, depth - wallThickness]} />
        <meshStandardMaterial {...chromeMat} />
      </mesh>

      {/* ── Gold ceiling edge trim ── */}
      {/* Left */}
      <mesh position={[-(hw - wallThickness / 2 - 0.005), height - 0.02, 0]}>
        <boxGeometry args={[0.02, 0.02, depth - wallThickness]} />
        <meshStandardMaterial {...goldMat} />
      </mesh>
      {/* Right */}
      <mesh position={[(hw - wallThickness / 2 - 0.005), height - 0.02, 0]}>
        <boxGeometry args={[0.02, 0.02, depth - wallThickness]} />
        <meshStandardMaterial {...goldMat} />
      </mesh>
      {/* Front */}
      <mesh position={[0, height - 0.02, -(hd - wallThickness / 2 - 0.005)]}>
        <boxGeometry args={[width - wallThickness, 0.02, 0.02]} />
        <meshStandardMaterial {...goldMat} />
      </mesh>
      {/* Back */}
      <mesh position={[0, height - 0.02, (hd - wallThickness / 2 - 0.005)]}>
        <boxGeometry args={[width - wallThickness, 0.02, 0.02]} />
        <meshStandardMaterial {...goldMat} />
      </mesh>

      {/* ── Gold accent strip along side walls ── */}
      {/* Left */}
      <mesh position={[-(hw - wallThickness / 2 - 0.005), 0.5, 0]}>
        <boxGeometry args={[0.015, 0.015, depth - wallThickness]} />
        <meshStandardMaterial {...goldMat} />
      </mesh>
      {/* Right */}
      <mesh position={[(hw - wallThickness / 2 - 0.005), 0.5, 0]}>
        <boxGeometry args={[0.015, 0.015, depth - wallThickness]} />
        <meshStandardMaterial {...goldMat} />
      </mesh>

      {/* ── Wall Sconces — decorative brackets ── */}
      {SCONCE_POSITIONS.map((sconce, i) => {
        const [sx, sy, sz] = sconce.position;
        return (
          <group key={`sconce-${i}`} position={sconce.position}>
            {/* Bracket plate */}
            <mesh>
              <boxGeometry args={[0.04, 0.2, 0.08]} />
              <meshStandardMaterial {...goldMat} />
            </mesh>
            {/* Shade */}
            <mesh position={[sconce.side === 'left' ? 0.06 : -0.06, 0.05, 0]}>
              <boxGeometry args={[0.08, 0.15, 0.08]} />
              <meshStandardMaterial color="#c0c8d0" roughness={0.3} metalness={0.6} emissive="#a0b0c0" emissiveIntensity={0.3} />
            </mesh>
          </group>
        );
      })}

      {/* ── Floor logo — Diamond Drones™ ── */}
      {logoTexture && (
        <mesh rotation={[-Math.PI / 2, Math.PI, 0]} position={[0, 0.005, hd - 3]}>
          <planeGeometry args={[4, 4]} />
          <meshStandardMaterial
            map={logoTexture}
            transparent
            opacity={0.06}
            roughness={0.8}
            metalness={0.0}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* ── Aisle carpet runner — subtle darker stripe ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 1]}>
        <planeGeometry args={[1.5, depth - 4]} />
        <meshStandardMaterial color="#121212" roughness={0.95} metalness={0} />
      </mesh>

      {/* ── EXIT sign above back wall ── */}
      <mesh position={[0, height - 0.4, hd - wallThickness / 2 - 0.01]}>
        <boxGeometry args={[0.8, 0.25, 0.04]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, height - 0.4, hd - wallThickness / 2 - 0.03]}>
        <planeGeometry args={[0.7, 0.18]} />
        <meshBasicMaterial color="#20aa40" emissive="#20aa40" emissiveIntensity={0.5} toneMapped={false} />
      </mesh>
    </group>
  );
}
