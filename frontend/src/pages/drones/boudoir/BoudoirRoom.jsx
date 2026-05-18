import { useState, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { ROOM, STAIRCASE } from './boudoirLayout';

/**
 * GiftBoxShimmer — renders text with animated silver/gold shimmer sweep
 * Used on end walls to brand the gallery as a "gift box"
 */
function GiftBoxShimmer({ position, rotation = [0, 0, 0], text = 'GIFT BOX', baseColor = '#888888', shimmerColor = 'rgba(144,200,224,0.3)', fontSize = 280, planeW = 10, planeH = 3 }) {
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

      // Mask canvas — text shape
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

      // Base canvas — static base text
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
 * SideWallVideoWash — tiled video projection for long side walls
 * Clones the video texture with RepeatWrapping so the video tiles at correct
 * aspect ratio instead of squashing across the full wall length
 */
function SideWallVideoWash({ videoTex, position, rotation, width, height, opacity }) {
  const clonedTex = useMemo(() => {
    if (!videoTex) return null;
    const tex = videoTex.clone();
    tex.wrapS = THREE.RepeatWrapping;
    // Video is 16:9 — calculate how many repeats to fill the wall
    const videoAspect = 16 / 9;
    const planeAspect = width / height;
    tex.repeat.set(planeAspect / videoAspect, 1);
    return tex;
  }, [videoTex, width, height]);

  useFrame(() => {
    if (clonedTex) clonedTex.needsUpdate = true;
  });

  if (!clonedTex) return null;

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={clonedTex}
        transparent
        opacity={opacity}
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * useVideoTexture — creates a looping muted video texture for projection wash
 */
function useVideoTexture(url) {
  const [texture, setTexture] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = document.createElement('video');
    video.src = url;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    video.autoplay = true;
    videoRef.current = video;

    video.addEventListener('canplay', () => {
      const tex = new THREE.VideoTexture(video);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      setTexture(tex);
      video.play().catch(() => {});
    });
    video.load();

    return () => { video.pause(); video.src = ''; };
  }, [url]);

  useFrame(() => { if (texture) texture.needsUpdate = true; });

  return texture;
}

/**
 * StaircaseText — Full collection info block on the front wall
 * Includes THE DRONE BLONDES title + description in one unified panel
 */
function StaircaseText({ position, rotation = [0, 0, 0], onBrowseAll }) {
  const [texture, setTexture] = useState(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      // Moody silver background
      ctx.fillStyle = '#c0c0c4';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;

      // "THE DRONE BLONDES" — large title
      ctx.fillStyle = '#808080';
      ctx.font = '900 180px "Anton", "Impact", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('THE DRONE BLONDES', cx, 140);

      // "120 UNIQUE 1/1s"
      ctx.fillStyle = '#707070';
      ctx.font = '900 120px "Anton", "Impact", sans-serif';
      ctx.fillText('◆ 120 Unique 1/1s', cx, 330);

      // Italic description lines
      ctx.fillStyle = '#666666';
      ctx.font = 'italic 52px Georgia, serif';
      ctx.fillText('120 Ink Interventions. Created by the Machine.', cx, 500);
      ctx.fillText('Inked by Miss AL Simpson. Each one a 1/1.', cx, 580);

      // Crown tagline
      ctx.fillStyle = '#888888';
      ctx.font = '40px "Space Mono", monospace';
      ctx.fillText('◇  Collect on OpenSea  ◇', cx, 700);

      // "VIEW ALL THE DRONE BLONDES" CTA
      ctx.fillStyle = '#555555';
      ctx.font = '900 70px "Anton", "Impact", sans-serif';
      ctx.fillText('VIEW ALL THE DRONE BLONDES', cx, 880);

      // Underline for the CTA
      const textWidth = ctx.measureText('VIEW ALL THE DRONE BLONDES').width;
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - textWidth / 2, 920);
      ctx.lineTo(cx + textWidth / 2, 920);
      ctx.stroke();

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      setTexture(tex);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!texture) return null;

  return (
    <mesh
      position={position}
      rotation={rotation}
      onClick={(e) => { e.stopPropagation(); onBrowseAll?.(); }}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = ''; }}
    >
      <planeGeometry args={[12, 6]} />
      <meshBasicMaterial
        map={texture}
        toneMapped={false}
      />
    </mesh>
  );
}

/**
 * FloorText — renders the collection description across the full floor with shimmer on title
 */
function FloorText() {
  const { width: w, length: l } = ROOM;
  const texRef = useRef(null);
  const canvasRef = useRef(null);
  const staticRef = useRef(null);
  const maskRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const size = 4096;

      // Main canvas (composited each frame)
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      canvasRef.current = canvas;

      // Static layer — subtitle + description (doesn't animate)
      const staticCanvas = document.createElement('canvas');
      staticCanvas.width = size;
      staticCanvas.height = size;
      const sctx = staticCanvas.getContext('2d');
      sctx.clearRect(0, 0, size, size);
      sctx.textAlign = 'center';
      sctx.textBaseline = 'middle';
      const cx = size / 2;

      // Subtitle
      sctx.font = '900 160px "Anton", "Impact", sans-serif';
      sctx.fillStyle = 'rgba(60,60,60,0.12)';
      sctx.fillText('◆ 120 Unique 1/1s', cx, 1600);

      // Description line
      sctx.font = '900 110px "Anton", "Impact", sans-serif';
      sctx.fillStyle = 'rgba(60,60,60,0.10)';
      sctx.fillText('CREATED · INKED · COLLECTED', cx, 2050);

      // Italic lines
      sctx.font = 'italic 72px Georgia, serif';
      sctx.fillStyle = 'rgba(60,60,60,0.08)';
      sctx.fillText('120 Ink Interventions. Created by the Machine.', cx, 2550);
      sctx.fillText('Inked by Miss AL Simpson. Each one a 1/1.', cx, 2700);

      // Crown tagline
      sctx.font = '58px "Space Mono", monospace';
      sctx.fillStyle = 'rgba(60,60,60,0.06)';
      sctx.fillText('◇  Collect on OpenSea  ◇', cx, 3200);

      staticRef.current = staticCanvas;

      // Mask layer — just the big title text (white on transparent)
      const mask = document.createElement('canvas');
      mask.width = size;
      mask.height = size;
      const mctx = mask.getContext('2d');
      mctx.clearRect(0, 0, size, size);
      mctx.fillStyle = '#fff';
      mctx.textAlign = 'center';
      mctx.textBaseline = 'middle';
      mctx.font = '900 420px "Anton", "Impact", sans-serif';
      mctx.fillText('THE', cx, 600);
      mctx.font = '900 380px "Anton", "Impact", sans-serif';
      mctx.fillText('DRONE BLONDES', cx, 1100);
      maskRef.current = mask;

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      texRef.current = tex;
      setReady(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Animate shimmer on the title portion each frame
  useFrame(({ clock }) => {
    if (!canvasRef.current || !staticRef.current || !maskRef.current || !texRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const t = clock.getElapsedTime();

    ctx.clearRect(0, 0, size, size);

    // Draw shimmer gradient for title area
    const sweep = ((t * 0.15) % 1);
    const sx = (sweep - 0.5) * size * 3;
    const grad = ctx.createLinearGradient(sx - 800, 0, sx + 800, 0);
    grad.addColorStop(0,    'rgba(60,60,60,0.10)');
    grad.addColorStop(0.2,  'rgba(80,80,80,0.15)');
    grad.addColorStop(0.35, 'rgba(100,100,100,0.18)');
    grad.addColorStop(0.5,  'rgba(40,40,40,0.22)');
    grad.addColorStop(0.65, 'rgba(100,100,100,0.18)');
    grad.addColorStop(0.8,  'rgba(80,80,80,0.15)');
    grad.addColorStop(1,    'rgba(60,60,60,0.10)');

    // Fill the title region with gradient
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, 1400);

    // Mask to title text shape
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(maskRef.current, 0, 0);
    ctx.globalCompositeOperation = 'source-over';

    // Draw static text on top
    ctx.drawImage(staticRef.current, 0, 0);

    texRef.current.needsUpdate = true;
  });

  if (!ready) return null;

  // Full floor coverage
  return (
    <mesh rotation={[-Math.PI / 2, Math.PI, 0]} position={[0, 0.02, -2]}>
      <planeGeometry args={[w * 1.2, l * 0.85]} />
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
 * GlitterCeiling — dark grey ceiling with sparkle particles
 */
function GlitterCeiling() {
  const { width: w, length: l, height: h } = ROOM;
  const sparkleCount = 400;
  const meshRef = useRef();

  // Generate random sparkle positions on the ceiling plane
  const { positions, opacities } = useMemo(() => {
    const pos = new Float32Array(sparkleCount * 3);
    const ops = new Float32Array(sparkleCount);
    for (let i = 0; i < sparkleCount; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * w * 0.95;    // x
      pos[i * 3 + 1] = h - 0.04 + Math.random() * 0.02;     // y — just below ceiling
      pos[i * 3 + 2] = (Math.random() - 0.5) * l * 0.95;    // z
      ops[i] = Math.random(); // phase offset for twinkle
    }
    return { positions: pos, opacities: ops };
  }, [w, l, h]);

  // Animate twinkle
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const geo = meshRef.current.geometry;
    const sizes = geo.attributes.size;
    const t = clock.getElapsedTime();
    for (let i = 0; i < sparkleCount; i++) {
      // Each particle twinkles at its own rate
      const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(t * (1.2 + opacities[i] * 2.0) + opacities[i] * 6.28));
      sizes.array[i] = 0.03 + twinkle * 0.05;
    }
    sizes.needsUpdate = true;
  });

  const sizes = useMemo(() => {
    const s = new Float32Array(sparkleCount);
    for (let i = 0; i < sparkleCount; i++) s[i] = 0.04;
    return s;
  }, []);

  return (
    <points ref={meshRef} name="glitter-ceiling">
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={sparkleCount} itemSize={3} />
        <bufferAttribute attach="attributes-size" array={sizes} count={sparkleCount} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        color="#b0b0b8"
        size={0.06}
        sizeAttenuation
        transparent
        opacity={0.9}
        toneMapped={false}
        depthWrite={false}
      />
    </points>
  );
}

/**
 * SilverVinyl — upright silver vinyl disc on a slim display stand
 * Slowly spinning, with "DIAMOND DRONES ARE A GIRL'S BEST FRIEND" label
 */
function SilverVinyl({ position = [0, 0, 0] }) {
  const discRef = useRef();
  const [discTex, setDiscTex] = useState(null);

  // Create silver vinyl texture — high-res for readability
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const size = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d');
      const cx = size / 2;

      // Silver disc base — radial gradient
      const baseGrad = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx);
      baseGrad.addColorStop(0, '#d8d8d8');
      baseGrad.addColorStop(0.3, '#c0c0c0');
      baseGrad.addColorStop(0.6, '#a8a8a8');
      baseGrad.addColorStop(0.85, '#b8b8b8');
      baseGrad.addColorStop(1, '#909090');
      ctx.fillStyle = baseGrad;
      ctx.beginPath(); ctx.arc(cx, cx, cx - 4, 0, Math.PI * 2); ctx.fill();

      // Groove rings — subtle concentric circles
      for (let r = 140; r < cx - 10; r += 6) {
        ctx.strokeStyle = `rgba(160,160,160,${r < 250 ? 0.5 : 0.25})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(cx, cx, r, 0, Math.PI * 2); ctx.stroke();
      }

      // Silver label center — polished
      const labelR = 160;
      const labelGrad = ctx.createRadialGradient(cx - 20, cx - 20, 0, cx, cx, labelR);
      labelGrad.addColorStop(0, '#f0f0f0');
      labelGrad.addColorStop(0.4, '#d0d0d0');
      labelGrad.addColorStop(1, '#a0a0a0');
      ctx.fillStyle = labelGrad;
      ctx.beginPath(); ctx.arc(cx, cx, labelR, 0, Math.PI * 2); ctx.fill();

      // Label border
      ctx.strokeStyle = '#808080';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cx, labelR, 0, Math.PI * 2); ctx.stroke();

      // Label text — title
      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 32px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('DIAMOND DRONES', cx, cx - 45);
      ctx.font = '26px "Space Mono", monospace';
      ctx.fillText("ARE A GIRL'S", cx, cx - 8);
      ctx.fillText('BEST FRIEND', cx, cx + 26);

      // Artist name
      ctx.fillStyle = '#4a4a4a';
      ctx.font = 'italic 20px Georgia, serif';
      ctx.fillText('Miss AL Simpson', cx, cx + 65);

      // Spindle hole
      ctx.fillStyle = '#2a2a2a';
      ctx.beginPath(); ctx.arc(cx, cx, 10, 0, Math.PI * 2); ctx.fill();

      // Outer rim highlight
      ctx.strokeStyle = 'rgba(200,200,200,0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cx, cx - 6, 0, Math.PI * 2); ctx.stroke();

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      setDiscTex(tex);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Slow spin
  useFrame(({ clock }) => {
    if (discRef.current) {
      discRef.current.rotation.z = clock.getElapsedTime() * 0.3;
    }
  });

  const discRadius = 1.2;

  return (
    <group position={position}>
      {/* Slim display stand — silver pedestal */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.8, 24]} />
        <meshStandardMaterial color="#a0a0a0" roughness={0.15} metalness={0.9} />
      </mesh>

      {/* Vertical support rod */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.8, 8]} />
        <meshStandardMaterial color="#b0b0b0" roughness={0.1} metalness={0.95} />
      </mesh>

      {/* Spinning silver vinyl — upright, facing the entrance */}
      <group ref={discRef} position={[0, 2.0, 0]}>
        {/* Front face */}
        <mesh>
          <circleGeometry args={[discRadius, 64]} />
          {discTex ? (
            <meshBasicMaterial map={discTex} toneMapped={false} />
          ) : (
            <meshStandardMaterial color="#b0b0b0" roughness={0.15} metalness={0.9} />
          )}
        </mesh>
        {/* Back face */}
        <mesh rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[discRadius, 64]} />
          <meshStandardMaterial color="#a0a0a0" roughness={0.2} metalness={0.85} />
        </mesh>
        {/* Edge / thickness */}
        <mesh>
          <torusGeometry args={[discRadius, 0.015, 8, 64]} />
          <meshStandardMaterial color="#909090" roughness={0.15} metalness={0.9} />
        </mesh>
      </group>

      {/* Spot light on the vinyl */}
      <pointLight position={[0, 2.0, 1]} intensity={1.0} distance={4} color="#ffffff" decay={2} />
    </group>
  );
}

/**
 * BoudoirRoom — Glamorous dressing room showroom
 * Light grey walls, polished floor, grand staircase with runway lights,
 * Hollywood vanity feel for The Drone Blondes
 */
export default function BoudoirRoom({ onBrowseAll }) {
  const { width: w, length: l, height: h, wallThickness: wt } = ROOM;
  const hw = w / 2;
  const hl = l / 2;
  const {
    steps: numSteps, stepHeight, stepDepth,
    baseWidth, topWidth, startZ,
    baseTiers, baseTierHeight,
  } = STAIRCASE;

  // Video wash texture — projected across walls
  const videoTex = useVideoTexture('/films/dd-diamond-drone-lounge.mp4');

  // Pre-compute staircase steps
  const steps = useMemo(() => {
    const baseH = baseTiers * baseTierHeight;
    return Array.from({ length: numSteps }, (_, i) => {
      const t = i / Math.max(numSteps - 1, 1);
      return {
        w: baseWidth - t * (baseWidth - topWidth),
        y: baseH + i * stepHeight,
        z: startZ + i * stepDepth,
        i,
      };
    });
  }, [numSteps, stepHeight, stepDepth, baseWidth, topWidth, startZ, baseTiers, baseTierHeight]);

  return (
    <group name="boudoir-room">

      {/* ── Floor — polished dark marble with reflections ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[w * 1.5, l * 1.5]} />
        <meshStandardMaterial color="#1a1a1e" roughness={0.05} metalness={0.6} envMapIntensity={0.8} />
      </mesh>

      {/* ── Ceiling — deep charcoal ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, h, 0]}>
        <planeGeometry args={[w, l]} />
        <meshStandardMaterial color="#1e1e22" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* ── Jewellery Box Lid — hinged open at entrance wall ── */}
      <group position={[0, h, -hl]} rotation={[Math.PI * 0.35, 0, 0]}>
        {/* Lid panel — same exterior colour as walls */}
        <mesh position={[0, 0, -l / 2]}>
          <boxGeometry args={[w + wt * 2, 0.15, l]} />
          <meshStandardMaterial color="#c0c0c4" roughness={0.35} metalness={0.15} />
        </mesh>
        {/* Inner lid — darker satin lining */}
        <mesh position={[0, -0.07, -l / 2]} rotation={[0, 0, 0]}>
          <planeGeometry args={[w + wt, l - 0.2]} />
          <meshStandardMaterial color="#2a2a30" roughness={0.85} metalness={0.05} />
        </mesh>
        {/* Lid logo panel */}
        <mesh position={[0, -0.08, -l * 0.35]}>
          <planeGeometry args={[12, 4]} />
          <meshBasicMaterial color="#3a3a40" toneMapped={false} transparent opacity={0.3} />
        </mesh>
      </group>

      {/* ── Gold rim — top edge trim all around ── */}
      {/* Left */}
      <mesh position={[-hw, h + 0.04, 0]}>
        <boxGeometry args={[wt + 0.08, 0.08, l + wt * 2]} />
        <meshStandardMaterial color="#b8a060" roughness={0.2} metalness={0.85} />
      </mesh>
      {/* Right */}
      <mesh position={[hw, h + 0.04, 0]}>
        <boxGeometry args={[wt + 0.08, 0.08, l + wt * 2]} />
        <meshStandardMaterial color="#b8a060" roughness={0.2} metalness={0.85} />
      </mesh>
      {/* Front (+z) */}
      <mesh position={[0, h + 0.04, hl]}>
        <boxGeometry args={[w + wt * 2 + 0.08, 0.08, wt + 0.08]} />
        <meshStandardMaterial color="#b8a060" roughness={0.2} metalness={0.85} />
      </mesh>
      {/* Back (-z) — no rim here, lid attaches */}

      {/* ── Ceiling sparkle particles ── */}
      <GlitterCeiling />

      {/* ── Walls — warm ivory / platinum with slight sheen ── */}
      {/* Back wall (entrance, -z) */}
      <mesh position={[0, h / 2, -hl]}>
        <boxGeometry args={[w, h, wt]} />
        <meshStandardMaterial color="#c8c8cc" roughness={0.4} metalness={0.08} />
      </mesh>
      {/* Front wall (behind staircase, +z) */}
      <mesh position={[0, h / 2, hl]}>
        <boxGeometry args={[w, h, wt]} />
        <meshStandardMaterial color="#c8c8cc" roughness={0.4} metalness={0.08} />
      </mesh>
      {/* Left wall (-x) */}
      <mesh position={[-hw, h / 2, 0]}>
        <boxGeometry args={[wt, h, l]} />
        <meshStandardMaterial color="#c8c8cc" roughness={0.4} metalness={0.08} />
      </mesh>
      {/* Right wall (+x) */}
      <mesh position={[hw, h / 2, 0]}>
        <boxGeometry args={[wt, h, l]} />
        <meshStandardMaterial color="#c8c8cc" roughness={0.4} metalness={0.08} />
      </mesh>

      {/* ── Tulle curtain panels — translucent drapes along side walls ── */}
      {[-1, 1].map(side => (
        Array.from({ length: 8 }, (_, i) => {
          const z = -hl + 2 + i * (l - 4) / 7;
          return (
            <mesh
              key={`tulle-${side}-${i}`}
              position={[side * (hw - 0.3), h / 2, z]}
              rotation={[0, side * 0.05, 0]}
            >
              <planeGeometry args={[1.8, h * 0.9]} />
              <meshStandardMaterial
                color="#b8b8bc"
                transparent
                opacity={0.12 + Math.sin(i * 1.2) * 0.04}
                roughness={0.85}
                metalness={0.05}
                side={2}
              />
            </mesh>
          );
        })
      ))}

      {/* ═══════════════════════════════════════════════
          ── VIDEO WASH — projected across all walls ──
          ═══════════════════════════════════════════════ */}
      {videoTex && (
        <group name="video-wash">
          {/* Back wall (entrance, -z) */}
          <mesh position={[0, h / 2, -hl + wt / 2 + 0.02]}>
            <planeGeometry args={[w - wt * 2, h]} />
            <meshBasicMaterial
              map={videoTex}
              transparent
              opacity={0.45}
              toneMapped={false}
              depthWrite={false}
            />
          </mesh>
          {/* Front wall — no video wash here, text panel covers it */}
          {/* Left wall (-x) — tiled video at correct aspect ratio */}
          <SideWallVideoWash
            videoTex={videoTex}
            position={[-hw + wt / 2 + 0.02, h / 2, 0]}
            rotation={[0, Math.PI / 2, 0]}
            width={l - wt * 2}
            height={h}
            opacity={0.35}
          />
          {/* Right wall (+x) — tiled video at correct aspect ratio */}
          <SideWallVideoWash
            videoTex={videoTex}
            position={[hw - wt / 2 - 0.02, h / 2, 0]}
            rotation={[0, -Math.PI / 2, 0]}
            width={l - wt * 2}
            height={h}
            opacity={0.35}
          />
        </group>
      )}

      {/* ── THE DRONE BLONDES — unified title + description block on front wall ── */}
      <StaircaseText position={[0, 8.5, hl - 0.5]} rotation={[0, Math.PI, 0]} onBrowseAll={onBrowseAll} />

      {/* ── Outside end walls — GIFT BOX ── */}
      {/* Back end wall (-z, outside) */}
      <GiftBoxShimmer
        position={[0, 4.5, -hl - wt / 2 - 0.02]}
        rotation={[0, Math.PI, 0]}
        text="GIFT BOX"
        baseColor="#777777"
        shimmerColor="rgba(180,160,96,0.35)"
        fontSize={320}
        planeW={12}
        planeH={3.5}
      />
      {/* Front end wall (+z, outside) */}
      <GiftBoxShimmer
        position={[0, 4.5, hl + wt / 2 + 0.02]}
        rotation={[0, 0, 0]}
        text="GIFT BOX"
        baseColor="#777777"
        shimmerColor="rgba(180,160,96,0.35)"
        fontSize={320}
        planeW={12}
        planeH={3.5}
      />

      {/* ── Collection text on the gallery floor ── */}
      <FloorText />

      {/* ═══════════════════════════════════════════════
          ── GRAND STAIRCASE — glamorous centrepiece ──
          ═══════════════════════════════════════════════ */}
      <group name="grand-staircase">

        {/* ── Base platform — wide approach tiers, white marble feel ── */}
        {Array.from({ length: baseTiers }, (_, i) => {
          const tierW = baseWidth + (baseTiers - i) * 2.0;
          const tierD = 2.2 + (baseTiers - i) * 0.7;
          const y = i * baseTierHeight;
          return (
            <mesh key={`base-${i}`} position={[0, y + baseTierHeight / 2, startZ - tierD / 2 - 0.3]}>
              <boxGeometry args={[tierW, baseTierHeight, tierD]} />
              <meshStandardMaterial color="#2a2a2e" roughness={0.1} metalness={0.3} />
            </mesh>
          );
        })}

        {/* ── Steps — solid columns, dark polished stone ── */}
        {steps.map((s) => (
          <mesh
            key={`step-${s.i}`}
            position={[0, (s.y + stepHeight) / 2, s.z]}
          >
            <boxGeometry args={[s.w, s.y + stepHeight, stepDepth]} />
            <meshStandardMaterial color="#2a2a2e" roughness={0.1} metalness={0.3} />
          </mesh>
        ))}

        {/* ── Runway edge lights — warm emissive spheres on every step ── */}
        {steps.map((s) => (
          <group key={`runway-${s.i}`}>
            <mesh position={[-s.w / 2 + 0.2, s.y + stepHeight + 0.04, s.z]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>
            <mesh position={[s.w / 2 - 0.2, s.y + stepHeight + 0.04, s.z]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>
          </group>
        ))}

        {/* ── Point lights for runway glow — every 4th step ── */}
        {steps.filter((_, idx) => idx % 4 === 0).map((s) => (
          <group key={`glow-${s.i}`}>
            <pointLight
              position={[-s.w / 2 + 0.2, s.y + stepHeight + 0.12, s.z]}
              intensity={0.8}
              distance={2.5}
              color="#ffffff"
              decay={2}
            />
            <pointLight
              position={[s.w / 2 - 0.2, s.y + stepHeight + 0.12, s.z]}
              intensity={0.8}
              distance={2.5}
              color="#ffffff"
              decay={2}
            />
          </group>
        ))}

        {/* ── Staircase side stringers — silver rails ── */}
        {(() => {
          const lastStep = steps[steps.length - 1];
          const firstStep = steps[0];
          const totalRise = lastStep.y + stepHeight - firstStep.y;
          const totalRun = lastStep.z - firstStep.z;
          const stringerLen = Math.sqrt(totalRise * totalRise + totalRun * totalRun);
          const stringerAngle = Math.atan2(totalRise, totalRun);
          const midY = (firstStep.y + lastStep.y + stepHeight) / 2;
          const midZ = (firstStep.z + lastStep.z) / 2;

          return (
            <>
              <mesh
                position={[-(baseWidth / 2 + 0.08), midY, midZ]}
                rotation={[stringerAngle, 0, 0]}
              >
                <boxGeometry args={[0.06, 0.06, stringerLen]} />
                <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.6} />
              </mesh>
              <mesh
                position={[(baseWidth / 2 + 0.08), midY, midZ]}
                rotation={[stringerAngle, 0, 0]}
              >
                <boxGeometry args={[0.06, 0.06, stringerLen]} />
                <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.6} />
              </mesh>
            </>
          );
        })()}
      </group>

      {/* ═══════════════════════════════════════════════
          ── VIDEO SCREEN — large screen on back wall (entrance) ──
          ═══════════════════════════════════════════════ */}
      {videoTex && (
        <group name="video-screen">
          {/* Slim black bezel frame */}
          <mesh position={[0, h / 2 + 1, -hl + wt / 2 + 0.03]}>
            <boxGeometry args={[10.4, 6.0, 0.08]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Video screen surface */}
          <mesh position={[0, h / 2 + 1, -hl + wt / 2 + 0.08]}>
            <planeGeometry args={[10, 5.6]} />
            <meshBasicMaterial
              map={videoTex}
              toneMapped={false}
            />
          </mesh>
          {/* Soft glow light from screen */}
          <pointLight
            position={[0, h / 2 + 1, -hl + 2]}
            intensity={0.6}
            distance={8}
            color="#b0c0d0"
            decay={2}
          />
        </group>
      )}

      {/* ── Rose gold baseboards along gallery walls ── */}
      <mesh position={[-hw + wt / 2 + 0.01, 0.06, 0]}>
        <boxGeometry args={[0.02, 0.12, l - wt * 2]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.15} metalness={0.7} />
      </mesh>
      <mesh position={[hw - wt / 2 - 0.01, 0.06, 0]}>
        <boxGeometry args={[0.02, 0.12, l - wt * 2]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.15} metalness={0.7} />
      </mesh>

      {/* ── Exterior wall logos ── */}
      <ExteriorLogos hw={hw} hl={hl} height={h} wallThickness={wt} />
    </group>
  );
}

/**
 * ExteriorLogos — "THE DRONE BLONDES™" rendered on the outside of both long walls.
 * Uses a single shared canvas texture (static, no per-frame cost).
 */
function ExteriorLogos({ hw, hl, height, wallThickness }) {
  const [logoTex, setLogoTex] = useState(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Ivory wall background (matching boudoir exterior)
    ctx.fillStyle = '#c0c0c4';
    ctx.fillRect(0, 0, 2048, 512);

    // Crystal gradient for text
    const grad = ctx.createLinearGradient(200, 0, 1848, 0);
    grad.addColorStop(0, '#808080');
    grad.addColorStop(0.25, '#a0a0a0');
    grad.addColorStop(0.45, '#d0d0d0');
    grad.addColorStop(0.55, '#909090');
    grad.addColorStop(0.75, '#b0b0b0');
    grad.addColorStop(1, '#808080');

    // THE DRONE BLONDES
    ctx.font = '900 160px "Anton", "Impact", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = grad;
    const mainMetrics = ctx.measureText('THE DRONE BLONDES');
    ctx.fillText('THE DRONE BLONDES', 1024, 220);

    // TM — measured while still in the 160px font, then drawn smaller
    ctx.font = '600 36px "Anton", "Impact", sans-serif';
    ctx.fillStyle = 'rgba(100,100,100,0.5)';
    ctx.textAlign = 'left';
    ctx.fillText('™', 1024 + mainMetrics.width / 2 + 8, 165);

    // Tagline
    ctx.font = '600 26px "Space Mono", monospace';
    ctx.fillStyle = 'rgba(100,100,100,0.35)';
    ctx.textAlign = 'center';
    ctx.fillText('1 2 0   U N I Q U E   1 / 1   A R T W O R K S', 1024, 370);

    // Thin accent line
    ctx.strokeStyle = 'rgba(100,100,100,0.15)';
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

  const logoW = 22;
  const logoH = 6;
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
      {/* End walls — GIFT BOX shimmer handled by GiftBoxShimmer in BoudoirRoom */}
    </group>
  );
}
