import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ROOM, SCREEN } from './cinemaLayout';

/**
 * CinemaWallText — "DRONE CINEMA" silver shimmer text + white Drones logos
 * All placed on the FRONT WALL (screen wall) so they're always visible.
 * - Logos flanking the screen on each side
 * - Side wall text panels for when user rotates camera
 */
export default function CinemaWallText() {
  const { width, depth, height, wallThickness } = ROOM;
  const hw = width / 2;
  const screenW = SCREEN.width;
  const screenZ = SCREEN.position[2];
  const screenY = SCREEN.position[1];

  // Front wall z — just in front of the wall surface
  const frontWallZ = screenZ - 0.02;

  // Side panel x: centered in the gap between screen edge and room wall
  // Screen edge is at ±screenW/2 = ±4, wall inner face at ±(hw - wallThickness/2) = ±6.85
  // Gap center: (4 + 6.85) / 2 = 5.425
  const sideGapCenter = (screenW / 2 + (hw - wallThickness / 2)) / 2;

  // Side wall positioning for bonus text panels
  const sideWallX = hw - wallThickness / 2 - 0.08;

  return (
    <group name="cinema-wall-text">
      {/* ── FRONT WALL: Diamond Drones™ shimmer logo LEFT of screen ── */}
      <FrontWallLogo
        position={[-sideGapCenter, screenY, frontWallZ]}
        panelW={2.6}
        panelH={2.6}
      />

      {/* ── FRONT WALL: Diamond Drones™ shimmer logo RIGHT of screen ── */}
      <FrontWallLogo
        position={[sideGapCenter, screenY, frontWallZ]}
        panelW={2.6}
        panelH={2.6}
      />

      {/* ── LEFT side wall: silver shimmer text ── */}
      <GiltTextPanel
        position={[-sideWallX, 3.2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        panelW={8}
        panelH={2}
      />

      {/* ── RIGHT side wall: silver shimmer text ── */}
      <GiltTextPanel
        position={[sideWallX, 3.2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        panelW={8}
        panelH={2}
      />

      {/* ── Cool white wall wash on side walls ── */}
      <pointLight position={[-(sideWallX - 0.5), 3.2, 0]} intensity={1.5} color="#c0c8d0" distance={6} decay={2} />
      <pointLight position={[(sideWallX - 0.5), 3.2, 0]} intensity={1.5} color="#c0c8d0" distance={6} decay={2} />
    </group>
  );
}

/* ── Individual silver shimmer text panel ── */
function GiltTextPanel({ position, rotation, panelW, panelH }) {
  const [texture, setTexture] = useState(null);
  const canvasRef = useRef(null);
  const timeRef = useRef(0);

  const canvasW = 1600;
  const canvasH = 400;

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d');
    canvasRef.current = { canvas, ctx };

    drawSilverFrame(ctx, canvasW, canvasH, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    setTexture(tex);

    return () => { tex.dispose(); };
  }, []);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (canvasRef.current && texture) {
      const { ctx, canvas } = canvasRef.current;
      drawSilverFrame(ctx, canvas.width, canvas.height, timeRef.current);
      texture.needsUpdate = true;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[panelW, panelH]} />
        {texture ? (
          <meshBasicMaterial map={texture} transparent toneMapped={false} side={THREE.DoubleSide} />
        ) : (
          <meshBasicMaterial color="#0a0a0a" transparent opacity={0} />
        )}
      </mesh>
    </group>
  );
}

/* ── Silver shimmer gradient ── */
function createSilverGradient(ctx, x0, x1, offset) {
  const totalW = (x1 - x0) * 3;
  const shiftedX0 = x0 - totalW * offset;
  const shiftedX1 = shiftedX0 + totalW;

  const grad = ctx.createLinearGradient(shiftedX0, 0, shiftedX1, 0);
  grad.addColorStop(0,    '#909898');
  grad.addColorStop(0.10, '#a8b0b8');
  grad.addColorStop(0.20, '#c0c8d0');
  grad.addColorStop(0.30, '#d0d8e0');
  grad.addColorStop(0.40, '#e0e8f0');
  grad.addColorStop(0.50, '#d0d8e0');
  grad.addColorStop(0.60, '#a8b0b8');
  grad.addColorStop(0.70, '#c0c8d0');
  grad.addColorStop(0.80, '#e0e8f0');
  grad.addColorStop(0.90, '#a8b0b8');
  grad.addColorStop(1,    '#909898');
  return grad;
}

/* ── Draw one frame of the silver text panel ── */
function drawSilverFrame(ctx, w, h, time) {
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;

  const shimmerOffset = (time % 6) / 6;

  // ── Top divider line ──
  const lineAlpha = 0.25 + 0.12 * Math.sin(time * 1.2);
  ctx.strokeStyle = `rgba(176, 184, 192, ${lineAlpha})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 500, cy - 85);
  ctx.lineTo(cx + 500, cy - 85);
  ctx.stroke();

  // ── Small diamond icon above text ──
  ctx.save();
  ctx.translate(cx, cy - 110);
  const diamondGlow = 0.35 + 0.3 * Math.sin(time * 1.8);
  ctx.strokeStyle = `rgba(176, 184, 192, ${diamondGlow})`;
  ctx.fillStyle = `rgba(208, 216, 224, ${diamondGlow * 0.2})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(7, 0);
  ctx.lineTo(0, 12);
  ctx.lineTo(-7, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // ── "DRONE CINEMA" main text ──
  ctx.font = '900 120px "Anton", "Impact", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const text = 'DIAMOND DRONES 4K';
  const measure = ctx.measureText(text);
  const textX0 = cx - measure.width / 2;
  const textX1 = cx + measure.width / 2;

  ctx.fillStyle = createSilverGradient(ctx, textX0, textX1, shimmerOffset);
  ctx.fillText(text, cx, cy);

  ctx.strokeStyle = `rgba(160, 168, 176, 0.3)`;
  ctx.lineWidth = 0.8;
  ctx.strokeText(text, cx, cy);

  // ── Tiny ™ superscript ──
  ctx.font = '600 28px "Space Mono", monospace';
  ctx.fillStyle = `rgba(176, 184, 192, 0.5)`;
  ctx.textBaseline = 'top';
  ctx.fillText('™', textX1 + 6, cy - 60);
  ctx.textBaseline = 'middle';

  // ── Bottom divider line ──
  ctx.strokeStyle = `rgba(176, 184, 192, ${lineAlpha})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 500, cy + 85);
  ctx.lineTo(cx + 500, cy + 85);
  ctx.stroke();

  // ── "THE PREMIERE" subtitle ──
  ctx.font = '600 24px "Space Mono", monospace';
  ctx.fillStyle = `rgba(176, 184, 192, 0.4)`;
  ctx.fillText('T H E   P R E M I E R E', cx, cy + 120);

  // ── Sparkle dots ──
  const sparkles = [
    [textX0 - 40, cy - 10], [textX1 + 40, cy - 10],
    [textX0 + 60, cy - 50], [textX1 - 60, cy - 50],
    [cx - 200, cy + 50], [cx + 200, cy + 50],
    [cx, cy - 70], [cx - 350, cy], [cx + 350, cy],
  ];

  sparkles.forEach(([sx, sy], i) => {
    const phase = i * 2.1 + i * i * 0.09;
    const speed = 1.0 + (i % 5) * 0.4;
    const alpha = Math.max(0, 0.1 + 0.6 * Math.sin(time * speed + phase));
    const size = 1.0 + 1.5 * Math.max(0, Math.sin(time * speed * 0.7 + phase));

    if (alpha > 0.08) {
      ctx.fillStyle = `rgba(208, 216, 224, ${alpha * 0.2})`;
      ctx.beginPath();
      ctx.arc(sx, sy, size * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(224, 232, 240, ${alpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();

      if (alpha > 0.35) {
        ctx.strokeStyle = `rgba(240, 244, 248, ${alpha * 0.4})`;
        ctx.lineWidth = 0.5;
        const len = size * 2.5;
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

/* ── Front wall animated shimmer logo ── */
function FrontWallLogo({ position, panelW, panelH }) {
  const [texture, setTexture] = useState(null);
  const canvasRef = useRef(null);
  const timeRef = useRef(0);

  const canvasW = 512;
  const canvasH = 512;

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d');
    canvasRef.current = { canvas, ctx };

    drawLogoFrame(ctx, canvasW, canvasH, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    setTexture(tex);

    return () => { tex.dispose(); };
  }, []);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (canvasRef.current && texture) {
      const { ctx, canvas } = canvasRef.current;
      drawLogoFrame(ctx, canvas.width, canvas.height, timeRef.current);
      texture.needsUpdate = true;
    }
  });

  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[panelW, panelH]} />
        {texture ? (
          <meshBasicMaterial map={texture} transparent toneMapped={false} side={THREE.DoubleSide} />
        ) : (
          <meshBasicMaterial color="#0a0a0a" transparent opacity={0} />
        )}
      </mesh>
    </group>
  );
}

/* ── Draw one frame of the front wall logo ── */
function drawLogoFrame(ctx, w, h, time) {
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const shimmerOffset = (time % 6) / 6;

  // ── "DIAMOND" ──
  ctx.font = '900 82px "Anton", "Impact", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const diamondY = cy - 30;
  const dronesY = cy + 55;

  const m1 = ctx.measureText('DIAMOND');
  const grad1 = createSilverGradient(ctx, cx - m1.width / 2, cx + m1.width / 2, shimmerOffset);
  ctx.fillStyle = grad1;
  ctx.fillText('DIAMOND', cx, diamondY);
  ctx.strokeStyle = 'rgba(160, 168, 176, 0.25)';
  ctx.lineWidth = 0.6;
  ctx.strokeText('DIAMOND', cx, diamondY);

  // ── "DRONES" ──
  const m2 = ctx.measureText('DRONES');
  const grad2 = createSilverGradient(ctx, cx - m2.width / 2, cx + m2.width / 2, shimmerOffset);
  ctx.fillStyle = grad2;
  ctx.fillText('DRONES', cx, dronesY);
  ctx.strokeStyle = 'rgba(160, 168, 176, 0.25)';
  ctx.strokeText('DRONES', cx, dronesY);

  // ── "4K" below DRONES ──
  ctx.font = '900 42px "Anton", "Impact", sans-serif';
  const fourKY = dronesY + 52;
  const m4k = ctx.measureText('4K');
  const grad4k = createSilverGradient(ctx, cx - m4k.width / 2, cx + m4k.width / 2, shimmerOffset);
  ctx.fillStyle = grad4k;
  ctx.fillText('4K', cx, fourKY);
  ctx.strokeStyle = 'rgba(160, 168, 176, 0.25)';
  ctx.strokeText('4K', cx, fourKY);

  // ── Tiny ™ ──
  ctx.font = '600 20px "Space Mono", monospace';
  ctx.fillStyle = `rgba(176, 184, 192, ${0.4 + 0.15 * Math.sin(time * 1.5)})`;
  ctx.textBaseline = 'top';
  ctx.fillText('™', cx + m2.width / 2 + 4, dronesY - 35);
  ctx.textBaseline = 'middle';

  // ── Diamond icon ──
  ctx.save();
  ctx.translate(cx, diamondY - 65);
  const glow = 0.3 + 0.25 * Math.sin(time * 1.8);
  ctx.strokeStyle = `rgba(176, 184, 192, ${glow})`;
  ctx.fillStyle = `rgba(208, 216, 224, ${glow * 0.15})`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, -8); ctx.lineTo(6, 0); ctx.lineTo(0, 10); ctx.lineTo(-6, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
