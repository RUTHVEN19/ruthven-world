import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text } from '@react-three/drei';
import * as THREE from 'three';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/* ─── Gold dust particles floating in the scene ─── */
function GoldDust() {
  const count = 120;
  const meshRef = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 12 + 2;
      arr[i * 3] = Math.cos(angle) * r;
      arr[i * 3 + 1] = Math.random() * 5 - 1;
      arr[i * 3 + 2] = Math.sin(angle) * r;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const posAttr = meshRef.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      posAttr.array[i * 3 + 1] += Math.sin(t * 0.3 + i) * 0.0008;
      posAttr.array[i * 3] += Math.cos(t * 0.2 + i * 0.5) * 0.0004;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#ffd700" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

/* ─── Circular floor platform ─── */
function CarouselPlatform({ radius }) {
  return (
    <group>
      {/* Main floor disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, 0]} receiveShadow>
        <circleGeometry args={[radius + 3, 64]} />
        <meshStandardMaterial color="#1a1816" roughness={0.05} metalness={0.7} />
      </mesh>
      {/* Gold ring — outer */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.19, 0]}>
        <ringGeometry args={[radius + 2.8, radius + 3, 64]} />
        <meshStandardMaterial color="#ffd700" roughness={0.1} metalness={0.95} />
      </mesh>
      {/* Gold ring — inner */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.19, 0]}>
        <ringGeometry args={[1.8, 2.0, 64]} />
        <meshStandardMaterial color="#b8860b" roughness={0.1} metalness={0.95} />
      </mesh>
    </group>
  );
}

/* ─── Single framed artwork on the carousel ─── */
function CarouselArtwork({ artwork, angle, radius, onSelect, focused }) {
  const groupRef = useRef();
  const matRef = useRef();
  const matRefBack = useRef();
  const [hovered, setHovered] = useState(false);

  const frameW = 5.5;
  const frameH = 3.3;
  const frameDepth = 0.12;
  const borderW = 0.12;
  const imgW = frameW - borderW * 2 - 0.06;
  const imgH = frameH - borderW * 2 - 0.06;

  // Position artwork on the circle, facing inward
  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;
  const rotY = angle; // face inward toward centre (visible from outside the ring)

  // Load texture: Image -> canvas downscale -> CanvasTexture -> ref
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const max = 2048;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > max || h > max) {
        const s = max / Math.max(w, h);
        w = Math.round(w * s);
        h = Math.round(h * s);
      }
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);

      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      if (matRef.current) {
        matRef.current.map = tex;
        matRef.current.color = new THREE.Color('#ffffff');
        matRef.current.needsUpdate = true;
      }
      if (matRefBack.current) {
        matRefBack.current.map = tex;
        matRefBack.current.color = new THREE.Color('#ffffff');
        matRefBack.current.needsUpdate = true;
      }
    };
    img.onerror = () => console.error('Texture load failed:', artwork.filename);
    img.src = `${API}/uploads/${artwork.filename}`;
  }, [artwork.filename]);

  return (
    <group
      ref={groupRef}
      position={[x, 0, z]}
      rotation={[0, rotY, 0]}
    >
      <group
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
        onClick={(e) => { e.stopPropagation(); onSelect(artwork); }}
      >
        {/* Gold frame */}
        <mesh>
          <boxGeometry args={[frameW, frameH, frameDepth]} />
          <meshStandardMaterial
            color={hovered || focused ? '#daa520' : '#b8860b'}
            roughness={0.15}
            metalness={0.9}
          />
        </mesh>

        {/* Inner border */}
        <mesh position={[0, 0, frameDepth / 2 + 0.005]}>
          <boxGeometry args={[frameW - borderW, frameH - borderW, 0.01]} />
          <meshStandardMaterial color="#8b6914" roughness={0.2} metalness={0.85} />
        </mesh>

        {/* Artwork image — z must be in front of border */}
        <mesh position={[0, 0, frameDepth / 2 + 0.02]}>
          <planeGeometry args={[imgW, imgH]} />
          <meshBasicMaterial
            ref={matRef}
            color="#333333"
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>

        {/* Back inner border */}
        <mesh position={[0, 0, -(frameDepth / 2 + 0.005)]}>
          <boxGeometry args={[frameW - borderW, frameH - borderW, 0.01]} />
          <meshStandardMaterial color="#8b6914" roughness={0.2} metalness={0.85} />
        </mesh>

        {/* Back artwork image */}
        <mesh position={[0, 0, -(frameDepth / 2 + 0.02)]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[imgW, imgH]} />
          <meshBasicMaterial
            ref={matRefBack}
            color="#333333"
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>

        {/* Front spotlight */}
        <spotLight
          position={[0, 3, 2]}
          angle={0.5}
          penumbra={0.7}
          intensity={hovered || focused ? 8 : 4}
          color="#fff8f0"
          distance={10}
        />

        {/* Back spotlight */}
        <spotLight
          position={[0, 3, -2]}
          angle={0.5}
          penumbra={0.7}
          intensity={hovered || focused ? 8 : 4}
          color="#fff8f0"
          distance={10}
        />

        {/* Front title — above the frame */}
        <mesh position={[0, frameH / 2 + 0.35, frameDepth / 2 + 0.01]}>
          <boxGeometry args={[4.0, 0.4, 0.02]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.5} />
        </mesh>
        <Text
          position={[0, frameH / 2 + 0.35, frameDepth / 2 + 0.03]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.08}
          maxWidth={3.6}
        >
          {artwork.title.toUpperCase()}
        </Text>

        {/* Back title — above the frame, other side */}
        <mesh position={[0, frameH / 2 + 0.35, -(frameDepth / 2 + 0.01)]}>
          <boxGeometry args={[4.0, 0.4, 0.02]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.5} />
        </mesh>
        <Text
          position={[0, frameH / 2 + 0.35, -(frameDepth / 2 + 0.03)]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.08}
          maxWidth={3.6}
        >
          {artwork.title.toUpperCase()}
        </Text>
      </group>

      {/* Gold pedestal beneath each artwork */}
      <group position={[0, -1.85, 0]}>
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[0.5, 0.3, 0.3]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.15} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.55, 0.02, 0.35]} />
          <meshStandardMaterial color="#b8860b" roughness={0.1} metalness={0.95} />
        </mesh>
        <Float speed={2} rotationIntensity={0.4} floatIntensity={0.3}>
          <mesh position={[0, 0.3, 0]}>
            <icosahedronGeometry args={[0.12, 2]} />
            <meshStandardMaterial color="#ffd700" roughness={0.05} metalness={0.98} />
          </mesh>
        </Float>
        <pointLight position={[0, 0.2, 0]} intensity={0.5} color="#ffd700" distance={2} />
      </group>
    </group>
  );
}

/* ─── Lighting ─── */
function CarouselLighting() {
  return (
    <>
      <ambientLight intensity={2.0} color="#ffffff" />
      <pointLight position={[0, 6, 0]} intensity={8} color="#fff8f0" distance={40} />
      <pointLight position={[0, -1, 0]} intensity={2} color="#ffd700" distance={10} />
      <pointLight position={[8, 3, 0]} intensity={3} color="#ffffff" distance={20} />
      <pointLight position={[-8, 3, 0]} intensity={3} color="#ffffff" distance={20} />
      <pointLight position={[0, 3, 8]} intensity={3} color="#ffffff" distance={20} />
      <pointLight position={[0, 3, -8]} intensity={3} color="#ffffff" distance={20} />
      <hemisphereLight intensity={1.2} color="#ffffff" groundColor="#ffd700" />
    </>
  );
}

/* ─── Main scene ─── */
function CarouselScene({ artworks, onSelectArtwork }) {
  const count = artworks.length;
  const radius = Math.max(6, count * 1.8); // scale circle to artwork count

  const angles = useMemo(() => {
    return artworks.map((_, i) => (i / count) * Math.PI * 2);
  }, [count]);

  return (
    <>
      <CarouselLighting />
      <GoldDust />
      <CarouselPlatform radius={radius} />

      {artworks.map((art, i) => (
        <CarouselArtwork
          key={art.id}
          artwork={art}
          angle={angles[i]}
          radius={radius}
          onSelect={onSelectArtwork}
          focused={false}
        />
      ))}

      {/* Centre piece — floating gold diamond */}
      <Float speed={1} rotationIntensity={0.8} floatIntensity={0.5}>
        <mesh position={[0, 1, 0]}>
          <octahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial color="#ffd700" roughness={0.02} metalness={0.98} />
        </mesh>
        <pointLight position={[0, 1, 0]} intensity={2} color="#ffd700" distance={6} />
      </Float>

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        maxPolarAngle={Math.PI * 0.75}
        minPolarAngle={Math.PI * 0.25}
        maxDistance={radius + 8}
        minDistance={2}
        target={[0, 0, 0]}
        autoRotate
        autoRotateSpeed={0.4}
      />
    </>
  );
}

export default function CommissionGallery3D({ artworks, onSelectArtwork, onExit }) {
  return (
    <div className="fixed inset-0 z-40 bg-black">
      <div className="absolute top-6 left-6 z-50 flex items-center gap-4">
        <button
          onClick={onExit}
          className="border border-amber-700/50 text-amber-400 px-5 py-2 text-[10px] uppercase tracking-[0.3em]
                     hover:bg-amber-400 hover:text-black transition-all"
        >
          Exit Gallery
        </button>
        <p className="text-neutral-400 text-[10px] tracking-[0.2em] uppercase">
          Drag to look around &middot; Scroll to zoom &middot; Click artwork to view
        </p>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 text-center">
        <p className="text-amber-600/80 text-sm tracking-[0.2em] uppercase"
           style={{ fontFamily: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif' }}>
          Miss AL Simpson
        </p>
        <p className="text-neutral-700 text-[9px] tracking-[0.3em] uppercase mt-1">
          Private Gallery
        </p>
      </div>

      <Canvas
        camera={{ position: [0, 1, 10], fov: 50 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.8 }}
        shadows
      >
        <Suspense fallback={null}>
          <CarouselScene artworks={artworks} onSelectArtwork={onSelectArtwork} />
        </Suspense>
      </Canvas>
    </div>
  );
}
