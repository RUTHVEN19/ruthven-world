import { useMemo, useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { ROOM } from './museumLayout';

/**
 * MuseumRoom — Luxury vault: black & grey palette, polished dark floor,
 * chrome accent trim
 */
export default function MuseumRoom() {
  const { width, length, height, wallThickness, baseboardHeight } = ROOM;
  const hw = width / 2;
  const hl = length / 2;

  /* ── Materials — pure black & grey palette ── */

  // Dark grey walls
  const wallMat = useMemo(() => ({
    color: '#303030',
    roughness: 0.75,
    metalness: 0.08,
  }), []);

  // Polished dark floor
  const floorMat = useMemo(() => ({
    color: '#1a1a1a',
    roughness: 0.08,
    metalness: 0.35,
  }), []);

  // Dark ceiling
  const ceilingMat = useMemo(() => ({
    color: '#101010',
    roughness: 0.9,
    metalness: 0.0,
  }), []);

  // Chrome trim / baseboards
  const chromeMat = useMemo(() => ({
    color: '#c0c0c0',
    roughness: 0.15,
    metalness: 0.9,
  }), []);

  // Silver accent strip (was gold)
  const accentMat = useMemo(() => ({
    color: '#a0a0a0',
    roughness: 0.2,
    metalness: 0.85,
  }), []);

  return (
    <group name="museum-room">
      {/* ── Floor — polished black ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial {...floorMat} />
      </mesh>

      {/* ── Floor reflection ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.05}
          metalness={0.4}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* ── Ceiling ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height, 0]}>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial {...ceilingMat} />
      </mesh>

      {/* ── Jewellery Box Lid — hinged open at entrance wall ── */}
      <group position={[0, height, -hl]} rotation={[Math.PI * 0.35, 0, 0]}>
        {/* Lid panel — dark exterior matching walls */}
        <mesh position={[0, 0, -length / 2]}>
          <boxGeometry args={[width + wallThickness * 2, 0.12, length]} />
          <meshStandardMaterial color="#282828" roughness={0.7} metalness={0.15} />
        </mesh>
        {/* Inner lid — satin black lining */}
        <mesh position={[0, -0.06, -length / 2]}>
          <planeGeometry args={[width + wallThickness, length - 0.2]} />
          <meshStandardMaterial color="#0e0e0e" roughness={0.9} metalness={0.02} />
        </mesh>
      </group>

      {/* ── Silver rim — top edge trim all around ── */}
      {/* Left */}
      <mesh position={[-hw, height + 0.03, 0]}>
        <boxGeometry args={[wallThickness + 0.06, 0.06, length + wallThickness * 2]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.15} metalness={0.9} />
      </mesh>
      {/* Right */}
      <mesh position={[hw, height + 0.03, 0]}>
        <boxGeometry args={[wallThickness + 0.06, 0.06, length + wallThickness * 2]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.15} metalness={0.9} />
      </mesh>
      {/* Front (+z) */}
      <mesh position={[0, height + 0.03, hl]}>
        <boxGeometry args={[width + wallThickness * 2 + 0.06, 0.06, wallThickness + 0.06]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.15} metalness={0.9} />
      </mesh>
      {/* Back (-z) — no rim, lid hinge point */}

      {/* ── Left Wall ── */}
      <mesh position={[-hw, height / 2, 0]}>
        <boxGeometry args={[wallThickness, height, length]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>

      {/* ── Right Wall ── */}
      <mesh position={[hw, height / 2, 0]}>
        <boxGeometry args={[wallThickness, height, length]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>

      {/* ── Back Wall (entrance) ── */}
      <mesh position={[0, height / 2, -hl]}>
        <boxGeometry args={[width + wallThickness * 2, height, wallThickness]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>

      {/* ── Front Wall (end wall display) ── */}
      <mesh position={[0, height / 2, hl]}>
        <boxGeometry args={[width + wallThickness * 2, height, wallThickness]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.85} metalness={0.1} />
      </mesh>

      {/* ── Chrome baseboards ── */}
      {/* Left */}
      <mesh position={[-(hw - wallThickness / 2 - 0.01), baseboardHeight / 2, 0]}>
        <boxGeometry args={[0.04, baseboardHeight, length - wallThickness]} />
        <meshStandardMaterial {...chromeMat} />
      </mesh>
      {/* Right */}
      <mesh position={[(hw - wallThickness / 2 - 0.01), baseboardHeight / 2, 0]}>
        <boxGeometry args={[0.04, baseboardHeight, length - wallThickness]} />
        <meshStandardMaterial {...chromeMat} />
      </mesh>

      {/* ── Silver accent strip along walls ── */}
      {/* Left */}
      <mesh position={[-(hw - wallThickness / 2 - 0.005), 0.5, 0]}>
        <boxGeometry args={[0.015, 0.015, length - wallThickness]} />
        <meshStandardMaterial {...accentMat} />
      </mesh>
      {/* Right */}
      <mesh position={[(hw - wallThickness / 2 - 0.005), 0.5, 0]}>
        <boxGeometry args={[0.015, 0.015, length - wallThickness]} />
        <meshStandardMaterial {...accentMat} />
      </mesh>

      {/* ── Silver ceiling edge trim ── */}
      {/* Left */}
      <mesh position={[-(hw - wallThickness / 2 - 0.005), height - 0.02, 0]}>
        <boxGeometry args={[0.02, 0.02, length - wallThickness]} />
        <meshStandardMaterial {...accentMat} />
      </mesh>
      {/* Right */}
      <mesh position={[(hw - wallThickness / 2 - 0.005), height - 0.02, 0]}>
        <boxGeometry args={[0.02, 0.02, length - wallThickness]} />
        <meshStandardMaterial {...accentMat} />
      </mesh>

      {/* ── Polished centre runner — darker reflective strip down the gallery ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[4, length - 2]} />
        <meshStandardMaterial
          color="#0e0e0e"
          roughness={0.03}
          metalness={0.5}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* ── LED floor strips — recessed glow along wall bases ── */}
      {/* Left wall LED */}
      <mesh position={[-(hw - ROOM.wallThickness / 2 - 0.02), 0.03, 0]}>
        <boxGeometry args={[0.06, 0.02, length - wallThickness * 2]} />
        <meshBasicMaterial color="#c0d8e8" transparent opacity={0.35} toneMapped={false} />
      </mesh>
      {/* Right wall LED */}
      <mesh position={[(hw - ROOM.wallThickness / 2 - 0.02), 0.03, 0]}>
        <boxGeometry args={[0.06, 0.02, length - wallThickness * 2]} />
        <meshBasicMaterial color="#c0d8e8" transparent opacity={0.35} toneMapped={false} />
      </mesh>

      {/* ── Visible ceiling track light housings ── */}
      {[-25, -15, -5, 5, 15, 25].map((z, i) => (
        <group key={`track-housing-${i}`}>
          {/* Track rail */}
          <mesh position={[0, height - 0.08, z]}>
            <boxGeometry args={[width - 4, 0.06, 0.12]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.7} />
          </mesh>
          {/* Left spotlight housing */}
          <mesh position={[-(width / 2 - 3), height - 0.2, z]}>
            <cylinderGeometry args={[0.08, 0.12, 0.2, 8]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Right spotlight housing */}
          <mesh position={[(width / 2 - 3), height - 0.2, z]}>
            <cylinderGeometry args={[0.08, 0.12, 0.2, 8]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Centre fixture */}
          <mesh position={[0, height - 0.18, z]}>
            <cylinderGeometry args={[0.06, 0.1, 0.16, 8]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.2} metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* ── Ceiling panel recesses — subtle coffers for architectural depth ── */}
      {[-20, -8, 4, 16].map((z, i) => (
        <mesh key={`coffer-${i}`} position={[0, height - 0.01, z]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width - 2, 8]} />
          <meshStandardMaterial color="#0c0c0c" roughness={0.95} metalness={0} />
        </mesh>
      ))}

      {/* ── Wall accent lighting panels — subtle glowing strips above artwork ── */}
      {/* Left wall */}
      <mesh position={[-(hw - wallThickness / 2 - 0.005), height - 0.6, 0]}>
        <boxGeometry args={[0.01, 0.03, length - 4]} />
        <meshBasicMaterial color="#808898" transparent opacity={0.2} toneMapped={false} />
      </mesh>
      {/* Right wall */}
      <mesh position={[(hw - wallThickness / 2 - 0.005), height - 0.6, 0]}>
        <boxGeometry args={[0.01, 0.03, length - 4]} />
        <meshBasicMaterial color="#808898" transparent opacity={0.2} toneMapped={false} />
      </mesh>

      {/* ── Shimmer text on end walls ── */}
      {/* Front wall (+z) — THE VAULT */}
      <VaultShimmer
        position={[0, height / 2, hl - wallThickness / 2 - 0.02]}
        rotation={[0, Math.PI, 0]}
        text="THE VAULT"
        baseColor="#606060"
        shimmerColor="rgba(180,220,240,0.4)"
        fontSize={300}
        planeW={14}
        planeH={3.5}
      />
      {/* Back wall (-z, entrance) — THE VAULT */}
      <VaultShimmer
        position={[0, height / 2, -hl + wallThickness / 2 + 0.02]}
        rotation={[0, 0, 0]}
        text="THE VAULT"
        baseColor="#606060"
        shimmerColor="rgba(180,220,240,0.4)"
        fontSize={300}
        planeW={14}
        planeH={3.5}
      />

      {/* ── Exterior end walls — GIFT BOX shimmer ── */}
      {/* Back end wall (-z, outside) */}
      <VaultShimmer
        position={[0, height / 2, -hl - wallThickness / 2 - 0.02]}
        rotation={[0, Math.PI, 0]}
        text="GIFT BOX"
        baseColor="#606060"
        shimmerColor="rgba(180,220,240,0.4)"
        fontSize={300}
        planeW={14}
        planeH={3.5}
      />
      {/* Front end wall (+z, outside) */}
      <VaultShimmer
        position={[0, height / 2, hl + wallThickness / 2 + 0.02]}
        rotation={[0, 0, 0]}
        text="GIFT BOX"
        baseColor="#606060"
        shimmerColor="rgba(180,220,240,0.4)"
        fontSize={300}
        planeW={14}
        planeH={3.5}
      />

      {/* ── Exterior side wall logos ── */}
      <ExteriorLogos hw={hw} hl={hl} height={height} wallThickness={wallThickness} />
    </group>
  );
}

/**
 * VaultShimmer — animated shimmer text for end walls
 */
function VaultShimmer({ position, rotation = [0, 0, 0], text = 'THE VAULT', baseColor = '#606060', shimmerColor = 'rgba(180,220,240,0.4)', fontSize = 300, planeW = 14, planeH = 3.5 }) {
  const texRef = useRef(null);
  const canvasRef = useRef(null);
  const maskRef = useRef(null);
  const baseRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const W = 2048, H = 512;

      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      canvasRef.current = canvas;

      const mask = document.createElement('canvas');
      mask.width = W; mask.height = H;
      const mctx = mask.getContext('2d');
      mctx.clearRect(0, 0, W, H);
      mctx.fillStyle = '#fff';
      mctx.font = `900 ${fontSize}px "Anton", "Impact", sans-serif`;
      mctx.textAlign = 'center';
      mctx.textBaseline = 'middle';
      mctx.fillText(text, W / 2, H / 2);
      maskRef.current = mask;

      const base = document.createElement('canvas');
      base.width = W; base.height = H;
      const bctx = base.getContext('2d');
      bctx.clearRect(0, 0, W, H);
      bctx.fillStyle = baseColor;
      bctx.font = `900 ${fontSize}px "Anton", "Impact", sans-serif`;
      bctx.textAlign = 'center';
      bctx.textBaseline = 'middle';
      bctx.fillText(text, W / 2, H / 2);
      baseRef.current = base;

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      texRef.current = tex;
      setReady(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [text, baseColor, fontSize]);

  useFrame(({ clock }) => {
    if (!canvasRef.current || !maskRef.current || !texRef.current || !baseRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const t = clock.getElapsedTime();
    const W = canvas.width, H = canvas.height;

    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(baseRef.current, 0, 0);

    const sweep = ((t * 0.12) % 1);
    const cx = (sweep - 0.5) * W * 3;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const grad = ctx.createLinearGradient(cx - 500, 0, cx + 500, 0);
    grad.addColorStop(0,    'rgba(0,0,0,0)');
    grad.addColorStop(0.3,  shimmerColor);
    grad.addColorStop(0.5,  'rgba(255,255,255,0.7)');
    grad.addColorStop(0.7,  shimmerColor);
    grad.addColorStop(1,    'rgba(0,0,0,0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(maskRef.current, 0, 0);
    ctx.globalCompositeOperation = 'source-over';

    texRef.current.needsUpdate = true;
  });

  if (!ready) return null;

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[planeW, planeH]} />
      <meshBasicMaterial
        map={texRef.current}
        transparent
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * ExteriorLogos — "DIAMOND DRONES™" rendered on the outside of both long walls.
 * Uses a single shared canvas texture (static, no per-frame cost).
 */
function ExteriorLogos({ hw, hl, height, wallThickness }) {
  const [logoTex, setLogoTex] = useState(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Dark wall background
    ctx.fillStyle = '#282828';
    ctx.fillRect(0, 0, 2048, 512);

    // Crystal gradient for text
    const grad = ctx.createLinearGradient(200, 0, 1848, 0);
    grad.addColorStop(0, '#b0c8d4');
    grad.addColorStop(0.25, '#ddeef4');
    grad.addColorStop(0.45, '#ffffff');
    grad.addColorStop(0.55, '#a8c0cc');
    grad.addColorStop(0.75, '#d8ecf4');
    grad.addColorStop(1, '#b4ccd8');

    // DIAMOND DRONES
    ctx.font = '900 180px "Anton", "Impact", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = grad;
    const mainMetrics = ctx.measureText('DIAMOND DRONES');
    ctx.fillText('DIAMOND DRONES', 1024, 220);

    // TM — measured while still in the 180px font, then drawn smaller
    ctx.font = '600 40px "Anton", "Impact", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.textAlign = 'left';
    ctx.fillText('™', 1024 + mainMetrics.width / 2 + 8, 165);

    // Tagline
    ctx.font = '600 28px "Space Mono", monospace';
    ctx.fillStyle = 'rgba(200, 230, 255, 0.3)';
    ctx.fillText('T H E   G E N E S I S   C O L L E C T I O N', 1024, 370);

    // Thin accent line
    ctx.strokeStyle = 'rgba(200, 230, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(400, 320);
    ctx.lineTo(1648, 320);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    setLogoTex(tex);

    return () => { tex.dispose(); };
  }, []);

  if (!logoTex) return null;

  const logoW = 24;
  const logoH = 5;
  const outerX = hw + wallThickness / 2 + 0.01;
  const outerZ = hl + wallThickness / 2 + 0.01;

  // Place 2 logo panels per side wall, centered within wall bounds
  const zPositions = [-(hl / 2), hl / 2];

  return (
    <group name="exterior-logos">
      {/* Side walls */}
      {zPositions.map((z, i) => (
        <group key={`ext-logo-${i}`}>
          {/* Left wall exterior — faces outward (-x) */}
          <mesh position={[-outerX, height / 2, z]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[logoW, logoH]} />
            <meshBasicMaterial map={logoTex} toneMapped={false} />
          </mesh>
          {/* Right wall exterior — faces outward (+x) */}
          <mesh position={[outerX, height / 2, z]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[logoW, logoH]} />
            <meshBasicMaterial map={logoTex} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* End walls — GIFT BOX shimmer handled by VaultShimmer in MuseumRoom */}
    </group>
  );
}
