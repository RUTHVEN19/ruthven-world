import { useRef, useEffect, useCallback, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { ROOM } from './museumLayout';

/**
 * MuseumControls — Dual mode camera:
 * - Orbit mode (default): OrbitControls with smooth animated transitions
 * - Walk mode (WASD): First-person with pointer lock, head bob, sprint (Shift)
 */
export default function MuseumControls({ focusTarget, onFocusComplete, walkMode = false }) {
  const controlsRef = useRef();
  const { camera, gl } = useThree();
  const animating = useRef(false);
  const animStart = useRef({ pos: null, target: null });
  const animEnd = useRef({ pos: null, target: null });
  const animProgress = useRef(0);

  // Walk mode state
  const keys = useRef({ w: false, a: false, s: false, d: false, shift: false });
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const pointerLocked = useRef(false);
  const walkTime = useRef(0);
  const isMoving = useRef(false);

  // Smooth camera transition (orbit mode)
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

  // Handle focus target changes
  useEffect(() => {
    if (focusTarget && !walkMode) {
      const { cameraPos, lookAt } = focusTarget;
      animateTo(cameraPos, lookAt);
    }
  }, [focusTarget, animateTo, walkMode]);

  // Walk mode: keyboard listeners
  useEffect(() => {
    if (!walkMode) return;

    const onKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if (k in keys.current) keys.current[k] = true;
      if (k === 'shift') keys.current.shift = true;
    };
    const onKeyUp = (e) => {
      const k = e.key.toLowerCase();
      if (k in keys.current) keys.current[k] = false;
      if (k === 'shift') keys.current.shift = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      keys.current = { w: false, a: false, s: false, d: false, shift: false };
    };
  }, [walkMode]);

  // Walk mode: pointer lock for mouse look
  useEffect(() => {
    if (!walkMode) {
      if (document.pointerLockElement === gl.domElement) {
        document.exitPointerLock();
      }
      pointerLocked.current = false;
      return;
    }

    const canvas = gl.domElement;

    const onClick = () => {
      if (!pointerLocked.current) {
        canvas.requestPointerLock();
      }
    };

    const onLockChange = () => {
      pointerLocked.current = document.pointerLockElement === canvas;
    };

    const onMouseMove = (e) => {
      if (!pointerLocked.current) return;
      euler.current.setFromQuaternion(camera.quaternion);
      euler.current.y -= e.movementX * 0.002;
      euler.current.x -= e.movementY * 0.002;
      // Clamp vertical look
      euler.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);
    };

    canvas.addEventListener('click', onClick);
    document.addEventListener('pointerlockchange', onLockChange);
    document.addEventListener('mousemove', onMouseMove);

    return () => {
      canvas.removeEventListener('click', onClick);
      document.removeEventListener('pointerlockchange', onLockChange);
      document.removeEventListener('mousemove', onMouseMove);
      if (document.pointerLockElement === canvas) {
        document.exitPointerLock();
      }
    };
  }, [walkMode, camera, gl]);

  // Set initial walk position when entering walk mode
  useEffect(() => {
    if (walkMode) {
      euler.current.setFromQuaternion(camera.quaternion);
    }
  }, [walkMode, camera]);

  useFrame((_, delta) => {
    // Orbit mode animation
    if (!walkMode && animating.current) {
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
      return;
    }

    // Walk mode movement
    if (walkMode) {
      const sprinting = keys.current.shift;
      const baseSpeed = sprinting ? 10 : 6;
      const speed = baseSpeed * delta;
      const direction = new THREE.Vector3();
      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();

      const right = new THREE.Vector3();
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

      if (keys.current.w) direction.add(forward);
      if (keys.current.s) direction.sub(forward);
      if (keys.current.d) direction.add(right);
      if (keys.current.a) direction.sub(right);

      const moving = direction.length() > 0;

      if (moving) {
        direction.normalize().multiplyScalar(speed);
        camera.position.add(direction);

        // Clamp to room bounds
        const hw = ROOM.width / 2 - 1;
        const hl = ROOM.length / 2 - 1;
        camera.position.x = Math.max(-hw, Math.min(hw, camera.position.x));
        camera.position.z = Math.max(-hl, Math.min(hl, camera.position.z));

        // Head bob
        walkTime.current += delta * (sprinting ? 12 : 8);
        const bobAmount = sprinting ? 0.06 : 0.035;
        const headBob = Math.sin(walkTime.current) * bobAmount;
        camera.position.y = 1.7 + headBob;
      } else {
        // Smoothly return to neutral height when stopped
        camera.position.y += (1.7 - camera.position.y) * 0.1;
      }

      isMoving.current = moving;
    }
  });

  if (walkMode) {
    // No OrbitControls in walk mode — camera controlled by WASD + mouse
    return null;
  }

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
