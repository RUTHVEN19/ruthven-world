import { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { CAMERA_PRESETS } from './cinemaLayout';

/**
 * CinemaControls — Constrained OrbitControls for cinema viewing
 * Can look around from seat position but movement is limited
 */
export default function CinemaControls({ focusTarget }) {
  const controlsRef = useRef();
  const { camera } = useThree();
  const animating = useRef(false);
  const animStart = useRef({ pos: null, target: null });
  const animEnd = useRef({ pos: null, target: null });
  const animProgress = useRef(0);

  const defaultTarget = CAMERA_PRESETS.center.target;

  // Smooth camera transition
  const animateTo = useCallback((targetPos, targetLookAt) => {
    animStart.current = {
      pos: camera.position.clone(),
      target: controlsRef.current
        ? controlsRef.current.target.clone()
        : new THREE.Vector3(...defaultTarget),
    };
    animEnd.current = {
      pos: new THREE.Vector3(...targetPos),
      target: new THREE.Vector3(...targetLookAt),
    };
    animProgress.current = 0;
    animating.current = true;
  }, [camera, defaultTarget]);

  // Handle focus target changes (seat switching)
  useEffect(() => {
    if (focusTarget) {
      animateTo(focusTarget.cameraPos, focusTarget.lookAt);
    }
  }, [focusTarget, animateTo]);

  useFrame((_, delta) => {
    if (!animating.current) return;

    animProgress.current += delta * 0.9;
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
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      minPolarAngle={Math.PI * 0.25}   // don't look below floor
      maxPolarAngle={Math.PI * 0.6}    // don't look straight up
      minDistance={0.5}
      maxDistance={8}
      target={defaultTarget}
      enablePan={false}                 // locked in seat area
      rotateSpeed={-0.4}               // intuitive drag direction
      minAzimuthAngle={-Math.PI * 0.4} // limit horizontal rotation
      maxAzimuthAngle={Math.PI * 0.4}
    />
  );
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
