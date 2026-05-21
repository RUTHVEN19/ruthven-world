import { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

/**
 * BoudoirControls — OrbitControls with smooth animated transitions
 * Matches Vault-style smooth movement: damped orbit, pan, wide zoom-out
 */
export default function BoudoirControls({ focusTarget, onFocusComplete }) {
  const controlsRef = useRef();
  const { camera } = useThree();
  const animating = useRef(false);
  const animStart = useRef({ pos: null, target: null });
  const animEnd = useRef({ pos: null, target: null });
  const animProgress = useRef(0);

  const animateTo = useCallback((targetPos, targetLookAt) => {
    animStart.current = {
      pos: camera.position.clone(),
      target: controlsRef.current
        ? controlsRef.current.target.clone()
        : new THREE.Vector3(0, 2, 0),
    };
    animEnd.current = {
      pos: new THREE.Vector3(...targetPos),
      target: new THREE.Vector3(...targetLookAt),
    };
    animProgress.current = 0;
    animating.current = true;
  }, [camera]);

  useEffect(() => {
    if (focusTarget) {
      const { cameraPos, lookAt } = focusTarget;
      animateTo(cameraPos, lookAt);
    }
  }, [focusTarget, animateTo]);

  useFrame((_, delta) => {
    if (animating.current) {
      animProgress.current += delta * 0.8;
      const t = easeInOutCubic(Math.min(animProgress.current, 1));

      camera.position.lerpVectors(animStart.current.pos, animEnd.current.pos, t);

      if (controlsRef.current) {
        controlsRef.current.target.lerpVectors(
          animStart.current.target,
          animEnd.current.target,
          t
        );
        controlsRef.current.update();
      }

      if (animProgress.current >= 1) {
        animating.current = false;
        onFocusComplete?.();
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.15}
      minPolarAngle={Math.PI * 0.15}
      maxPolarAngle={Math.PI * 0.7}
      minDistance={1}
      maxDistance={50}
      target={[0, 2, 0]}
      enablePan
      panSpeed={1.0}
      rotateSpeed={0.6}
    />
  );
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
