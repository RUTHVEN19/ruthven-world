import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ROOM } from './museumLayout';

const PARTICLE_COUNT = 200;

/**
 * DiamondDust — Floating sparkle particles drifting through the vault,
 * catching the spotlights like diamond dust in the air.
 * Enhanced: twinkling opacity, size pulsing, multiple layers.
 */
export default function DiamondDust() {
  const meshRef = useRef();
  const meshRef2 = useRef();
  const timeRef = useRef(0);

  const primary = useMemo(() => {
    const hw = ROOM.width / 2 - 1;
    const hl = ROOM.length / 2 - 2;
    const maxH = ROOM.height - 0.5;

    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const spd = new Float32Array(PARTICLE_COUNT);
    const ph = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * hw * 2;
      pos[i * 3 + 1] = Math.random() * maxH + 0.3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * hl * 2;
      spd[i] = 0.015 + Math.random() * 0.04;
      ph[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    return { geometry: geo, positions: pos, speeds: spd, phases: ph };
  }, []);

  // Second layer — fewer, larger, slower sparkles
  const LARGE_COUNT = 40;
  const secondary = useMemo(() => {
    const hw = ROOM.width / 2 - 1;
    const hl = ROOM.length / 2 - 2;
    const maxH = ROOM.height - 0.5;

    const pos = new Float32Array(LARGE_COUNT * 3);
    const spd = new Float32Array(LARGE_COUNT);
    const ph = new Float32Array(LARGE_COUNT);

    for (let i = 0; i < LARGE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * hw * 2;
      pos[i * 3 + 1] = Math.random() * maxH + 0.3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * hl * 2;
      spd[i] = 0.008 + Math.random() * 0.02;
      ph[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    return { geometry: geo, positions: pos, speeds: spd, phases: ph };
  }, []);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;
    const hw = ROOM.width / 2 - 1;
    const hl = ROOM.length / 2 - 2;

    // Primary particles — fast twinkle
    if (meshRef.current) {
      const posAttr = meshRef.current.geometry.getAttribute('position');
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        posAttr.array[i3] += Math.sin(t * 0.3 + primary.phases[i]) * 0.003;
        posAttr.array[i3 + 1] += primary.speeds[i] * delta * 0.5;
        posAttr.array[i3 + 2] += Math.cos(t * 0.2 + primary.phases[i] * 1.3) * 0.002;

        if (posAttr.array[i3 + 1] > ROOM.height - 0.3) {
          posAttr.array[i3 + 1] = 0.3;
          posAttr.array[i3] = (Math.random() - 0.5) * hw * 2;
          posAttr.array[i3 + 2] = (Math.random() - 0.5) * hl * 2;
        }
      }
      posAttr.needsUpdate = true;
      // Twinkle opacity
      meshRef.current.material.opacity = 0.3 + Math.sin(t * 1.5) * 0.1;
    }

    // Secondary particles — slow shimmer
    if (meshRef2.current) {
      const posAttr = meshRef2.current.geometry.getAttribute('position');
      for (let i = 0; i < LARGE_COUNT; i++) {
        const i3 = i * 3;
        posAttr.array[i3] += Math.sin(t * 0.15 + secondary.phases[i]) * 0.004;
        posAttr.array[i3 + 1] += secondary.speeds[i] * delta * 0.4;
        posAttr.array[i3 + 2] += Math.cos(t * 0.12 + secondary.phases[i] * 0.8) * 0.003;

        if (posAttr.array[i3 + 1] > ROOM.height - 0.3) {
          posAttr.array[i3 + 1] = 0.3;
          posAttr.array[i3] = (Math.random() - 0.5) * hw * 2;
          posAttr.array[i3 + 2] = (Math.random() - 0.5) * hl * 2;
        }
      }
      posAttr.needsUpdate = true;
      meshRef2.current.material.opacity = 0.15 + Math.sin(t * 0.8 + 1.5) * 0.08;
    }
  });

  return (
    <group name="diamond-dust">
      {/* Primary — small fast sparkles */}
      <points ref={meshRef} geometry={primary.geometry}>
        <pointsMaterial
          color="#d0e8ff"
          size={0.05}
          transparent
          opacity={0.35}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Secondary — larger slow shimmer motes */}
      <points ref={meshRef2} geometry={secondary.geometry}>
        <pointsMaterial
          color="#e8f4ff"
          size={0.12}
          transparent
          opacity={0.18}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
