import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ROOM } from './museumLayout';

/**
 * EndWallDisplay — "DIAMOND DRONES™" with crystal shimmer + "BROWSE ALL 1000" CTA
 */
export default function EndWallDisplay({ onBrowseAll }) {
  const meshRef = useRef();
  const [texture, setTexture] = useState(null);
  const timeRef = useRef(0);
  const canvasRef = useRef(null);

  const screenW = 16;
  const screenH = 7;

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2560;
    canvas.height = 1120;
    const ctx = canvas.getContext('2d');
    canvasRef.current = { canvas, ctx };

    drawFrame(ctx, canvas.width, canvas.height, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    setTexture(tex);

    return () => { tex.dispose(); };
  }, []);

  const lastDrawRef = useRef(0);
  useFrame((_, delta) => {
    timeRef.current += delta;
    // Throttle canvas redraws to ~12fps (every ~83ms) instead of every frame
    if (canvasRef.current && texture && timeRef.current - lastDrawRef.current > 0.083) {
      lastDrawRef.current = timeRef.current;
      const { ctx, canvas } = canvasRef.current;
      drawFrame(ctx, canvas.width, canvas.height, timeRef.current);
      texture.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 3.5, ROOM.length / 2 - ROOM.wallThickness - 0.02]} rotation={[0, Math.PI, 0]}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onBrowseAll?.(); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        <planeGeometry args={[screenW, screenH]} />
        {texture ? (
          <meshBasicMaterial map={texture} transparent toneMapped={false} />
        ) : (
          <meshBasicMaterial color="#0a0a0a" />
        )}
      </mesh>

      {/* Glow behind */}
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[screenW + 2, screenH + 1]} />
        <meshBasicMaterial color="#080a10" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

/* ── Crystal shimmer gradient matching the website's var(--dd-crystal) ── */
function createCrystalGradient(ctx, x0, x1, offset) {
  // Replicate: linear-gradient(110deg, #b0c8d4, #ddeef4, #ffffff, #a8c0cc, #d8ecf4, #ffffff, #b4ccd8, #e0f0f6, #ffffff, #a4bcc8)
  // The offset shifts the gradient to create the sweep animation
  const totalW = (x1 - x0) * 3; // 300% background-size
  const shiftedX0 = x0 - totalW * offset;
  const shiftedX1 = shiftedX0 + totalW;

  const grad = ctx.createLinearGradient(shiftedX0, 0, shiftedX1, 0);
  grad.addColorStop(0,    '#b0c8d4');
  grad.addColorStop(0.12, '#ddeef4');
  grad.addColorStop(0.22, '#ffffff');
  grad.addColorStop(0.33, '#a8c0cc');
  grad.addColorStop(0.44, '#d8ecf4');
  grad.addColorStop(0.52, '#ffffff');
  grad.addColorStop(0.62, '#b4ccd8');
  grad.addColorStop(0.73, '#e0f0f6');
  grad.addColorStop(0.82, '#ffffff');
  grad.addColorStop(1,    '#a4bcc8');
  return grad;
}

function drawFrame(ctx, w, h, time) {
  ctx.clearRect(0, 0, w, h);

  // Background
  ctx.fillStyle = 'rgba(6, 8, 12, 0.92)';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;

  // ── Diamond icon at top ──
  ctx.save();
  ctx.translate(cx, 65);
  const diamondGlow = 0.4 + 0.3 * Math.sin(time * 2);
  ctx.strokeStyle = `rgba(200, 230, 255, ${diamondGlow})`;
  ctx.fillStyle = `rgba(200, 230, 255, ${diamondGlow * 0.15})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(15, 0);
  ctx.lineTo(0, 24);
  ctx.lineTo(-15, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // ── Kicker ──
  ctx.font = '600 20px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(200, 230, 255, 0.45)';
  ctx.fillText('T H E   G E N E S I S   C O L L E C T I O N', cx, 120);

  // ── Crystal shimmer offset (cycles like crystalShimmer 5s linear infinite) ──
  const shimmerOffset = (time % 5) / 5; // 0 to 1, repeating every 5s

  // ── DIAMOND — line 1 ──
  ctx.font = '900 200px "Anton", "Impact", sans-serif';
  ctx.textAlign = 'center';

  const line1 = 'DIAMOND';
  const m1 = ctx.measureText(line1);
  const l1x0 = cx - m1.width / 2;
  const l1x1 = cx + m1.width / 2;

  ctx.fillStyle = createCrystalGradient(ctx, l1x0, l1x1, shimmerOffset);
  ctx.fillText(line1, cx, 340);

  // ── DRONES™ — line 2 ──
  const line2 = 'DRONES';
  const m2 = ctx.measureText(line2);
  const l2x0 = cx - m2.width / 2;
  const l2x1 = cx + m2.width / 2;

  ctx.fillStyle = createCrystalGradient(ctx, l2x0, l2x1, shimmerOffset);
  ctx.fillText(line2, cx, 540);

  // ── TM symbol ──
  ctx.font = '600 50px "Anton", "Impact", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillText('™', l2x1 + 15, 440);

  // ── Divider ──
  const divAlpha = 0.12 + 0.06 * Math.sin(time * 1.5);
  ctx.strokeStyle = `rgba(200, 230, 255, ${divAlpha})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 350, 680);
  ctx.lineTo(cx + 350, 680);
  ctx.stroke();

  // ── BROWSE ALL 1000 — pulsing CTA ──
  ctx.font = '900 70px "Anton", "Impact", sans-serif';
  const browseText = 'BROWSE ALL 1000';
  const mb = ctx.measureText(browseText);
  const bx0 = cx - mb.width / 2;
  const bx1 = cx + mb.width / 2;

  // Pulsing glow behind text
  const ctaPulse = 0.06 + 0.04 * Math.sin(time * 2);
  ctx.fillStyle = `rgba(200, 230, 255, ${ctaPulse})`;
  const ctaPad = 20;
  ctx.fillRect(bx0 - ctaPad, 700 - 55, mb.width + ctaPad * 2, 75);
  ctx.strokeStyle = `rgba(200, 230, 255, ${0.15 + 0.1 * Math.sin(time * 2)})`;
  ctx.lineWidth = 1;
  ctx.strokeRect(bx0 - ctaPad, 700 - 55, mb.width + ctaPad * 2, 75);

  ctx.fillStyle = createCrystalGradient(ctx, bx0, bx1, shimmerOffset);
  ctx.fillText(browseText, cx, 735);

  // ── Diamond cuts (no rarity labels) ──
  const cuts = [
    { name: 'BRILLIANT', color: '#e8f8ff' },
    { name: 'PRINCESS', color: '#d0ecff' },
    { name: 'MARQUISE', color: '#c0e0f8' },
    { name: 'ROSE', color: '#b0d4f0' },
    { name: 'BAGUETTE', color: '#a0c8e8' },
  ];

  const tierY = 800;
  const tierSpacing = 440;
  const startX = cx - (cuts.length - 1) * tierSpacing / 2;

  cuts.forEach((cut, i) => {
    const x = startX + i * tierSpacing;
    const pulse = 0.45 + 0.45 * Math.sin(time * 1.8 + i * 1.2);

    // Diamond icon
    ctx.save();
    ctx.translate(x, tierY);
    ctx.fillStyle = cut.color;
    ctx.globalAlpha = pulse;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(8, 0);
    ctx.lineTo(0, 14);
    ctx.lineTo(-8, 0);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();

    ctx.font = '600 18px "Space Mono", monospace';
    ctx.fillStyle = cut.color;
    ctx.fillText(cut.name, x, tierY + 36);
  });

  // ── Bottom tagline ──
  ctx.font = '18px "Space Mono", monospace';
  ctx.fillStyle = 'rgba(200, 230, 255, 0.25)';
  ctx.fillText('Made Once  \u00B7  Kept Forever', cx, 920);

  // ── Sparkle field ──
  const sparkles = [
    // Around title
    [120, 280], [2440, 280], [350, 200], [2210, 200],
    [250, 400], [2310, 400], [cx - 550, 300], [cx + 550, 300],
    [cx - 400, 220], [cx + 400, 220], [cx - 250, 500], [cx + 250, 500],
    [cx - 650, 450], [cx + 650, 450],
    // Along top
    [200, 80], [600, 50], [1000, 70], [1500, 55], [1900, 75], [2300, 65],
    // Around tiers
    [startX - 40, tierY - 30], [startX + tierSpacing * 4 + 40, tierY - 30],
    [startX + tierSpacing, tierY + 65], [startX + tierSpacing * 3, tierY + 65],
    // Scattered
    [100, 550], [2460, 550], [cx - 700, 650], [cx + 700, 650],
    [cx, 140], [cx - 130, 680], [cx + 130, 680],
    // Bottom
    [400, 900], [900, 950], [1500, 930], [2100, 910],
    // Extra density around title
    [cx - 300, 350], [cx + 300, 350], [cx, 250], [cx, 500],
    [cx - 500, 550], [cx + 500, 550],
  ];

  sparkles.forEach(([sx, sy], i) => {
    const phase = i * 2.3 + i * i * 0.07;
    const speed = 1.2 + (i % 7) * 0.35;
    const alpha = Math.max(0, 0.08 + 0.7 * Math.sin(time * speed + phase));
    const size = 1.2 + 1.8 * Math.max(0, Math.sin(time * speed * 0.7 + phase));

    if (alpha > 0.05) {
      // Glow
      ctx.fillStyle = `rgba(210, 235, 255, ${alpha * 0.25})`;
      ctx.beginPath();
      ctx.arc(sx, sy, size * 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.fillStyle = `rgba(240, 250, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();

      // Cross lines
      if (alpha > 0.35) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.45})`;
        ctx.lineWidth = 0.5;
        const len = size * 2.8;
        ctx.beginPath();
        ctx.moveTo(sx - len, sy);
        ctx.lineTo(sx + len, sy);
        ctx.moveTo(sx, sy - len);
        ctx.lineTo(sx, sy + len);
        ctx.stroke();
      }
    }
  });
}
