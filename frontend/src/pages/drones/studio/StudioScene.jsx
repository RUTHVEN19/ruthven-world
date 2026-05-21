import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import StudioRoom from './StudioRoom';
import StudioEquipment from './StudioEquipment';
import StudioLighting from './StudioLighting';
import { CAMERA } from './studioLayout';

/**
 * StudioScene — Composes the 3D recording studio with auto-orbit camera
 */
export default function StudioScene() {
  return (
    <>
      {/* Auto-orbit camera controls */}
      <StudioControls />

      {/* Subtle fog for depth */}
      <fog attach="fog" args={['#0a0a0a', 10, 22]} />

      {/* Room architecture */}
      <StudioRoom />

      {/* Equipment */}
      <StudioEquipment />

      {/* Lighting */}
      <StudioLighting />
    </>
  );
}

/* ── Auto-orbit camera ── */
function StudioControls() {
  const controlsRef = useRef();
  const { camera } = useThree();

  // Set initial camera target
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      target={CAMERA.target}
      autoRotate
      autoRotateSpeed={0.3}
      enableZoom={false}
      enablePan={false}
      enableRotate={false}
      minPolarAngle={Math.PI / 3}
      maxPolarAngle={Math.PI / 2.2}
    />
  );
}
