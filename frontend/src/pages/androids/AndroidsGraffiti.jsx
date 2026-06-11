import { useState, useEffect, useRef, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { FILM } from '../../config/androidsContent';

// ── The Graffiti Wall — the analog resistance, 1/1 phygital ──
// "The one medium the Party can't switch off. The proof-of-hand."
const COLLAGES = [
  { id: 'wall-fragment-001', name: 'Neon Cherub Chaos', file: 'NEON CHERUB CHAOS.jpg', superRare: 'https://superrare.com/artwork/eth/0x4AcA802eee7e7B744a1B410fBc83edDC4D8904ab/2' },
  { id: 'wall-fragment-002', name: 'Manga Street Shrine', file: 'MANGA STREET SHRINE.jpg', superRare: 'https://superrare.com/artwork/eth/0x4AcA802eee7e7B744a1B410fBc83edDC4D8904ab/1?tab=details' },
  { id: 'wall-fragment-003', name: 'Rouge Red Porcelain', file: 'ROUGE RED PORCELAIN.jpg', superRare: 'https://superrare.com/artwork/eth/0x4AcA802eee7e7B744a1B410fBc83edDC4D8904ab/3' },
];

const GRAFFITI_IMAGES = COLLAGES.map((c, i) => ({
  ...c,
  src: `/androids/graffiti/${c.file}`,
  fragmentNum: String(i + 1).padStart(3, '0'),
  edition: '1/1 Phygital',
  nft: true,
}));

// ── Detail crops scattered along corridor walls ──
const DETAIL_CROPS = [
  'PINK 1.jpg', 'PINK 2.jpg', 'PINK 3.jpg', 'PINK 4.jpg', 'PINK 5.jpg',
  'NEON CHRUB 1.jpg', 'NEON CHERUB 2.jpg', 'NEON CHERUB 3.jpg', 'NEON CHERUB CHAOS 4.jpg', 'NEON CHRUB CHAOS 5.jpg',
  'RED ROUGE 1.jpg', 'RED ROUGE 2.jpg', 'RED ROUGE 3.jpg', 'RED ROUGE 4.jpg', 'RED ROUGE 5.jpg', 'RED ROUGE 6.jpg',
].map(f => `/androids/graffiti/details/${f}`);

// ── Layout ──
const WALL_LENGTH = 40;
const WALL_HEIGHT = 8;

// ── Floating dust particles ──
function DustParticles({ count = 200 }) {
  const meshRef = useRef();
  const positions = useRef(new Float32Array(count * 3));
  const velocities = useRef(new Float32Array(count * 3));

  useEffect(() => {
    for (let i = 0; i < count; i++) {
      positions.current[i * 3] = (Math.random() - 0.5) * 12;
      positions.current[i * 3 + 1] = Math.random() * WALL_HEIGHT;
      positions.current[i * 3 + 2] = (Math.random() - 0.5) * WALL_LENGTH;
      velocities.current[i * 3] = (Math.random() - 0.5) * 0.003;
      velocities.current[i * 3 + 1] = Math.random() * 0.005 + 0.002;
      velocities.current[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
    }
  }, [count]);

  useFrame(() => {
    if (!meshRef.current) return;
    const pos = meshRef.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      pos.array[i * 3] += velocities.current[i * 3];
      pos.array[i * 3 + 1] += velocities.current[i * 3 + 1];
      pos.array[i * 3 + 2] += velocities.current[i * 3 + 2];
      if (pos.array[i * 3 + 1] > WALL_HEIGHT + 1) {
        pos.array[i * 3 + 1] = -0.5;
        pos.array[i * 3] = (Math.random() - 0.5) * 12;
        pos.array[i * 3 + 2] = (Math.random() - 0.5) * WALL_LENGTH;
      }
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions.current} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#ff6b00" transparent opacity={0.4} toneMapped={false} sizeAttenuation />
    </points>
  );
}

// ── Gallery Artwork — museum-grade presentation ──
function GraffitiPiece({ src, name, position, rotation, width = 3, height = 2, index, onSelect, neonColor = '#ff6b00' }) {
  const [texture, setTexture] = useState(null);
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef();
  const glowRef = useRef();

  useEffect(() => {
    new THREE.TextureLoader().load(src, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      setTexture(tex);
    });
  }, [src]);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    // Hover: artwork lifts off wall
    const targetZ = hovered ? 0.25 : 0;
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, delta * 5);
    // Glow pulses gently
    if (glowRef.current) {
      const pulse = 0.06 + Math.sin(clock.getElapsedTime() * 2 + index) * 0.03;
      glowRef.current.material.opacity = hovered ? 0.35 : pulse;
    }
  });

  if (!texture) return null;

  const frameW = width + 0.15;
  const frameH = height + 0.15;

  return (
    <group position={position} rotation={rotation}>
      {/* Spotlight from above — gallery lighting */}
      <spotLight
        position={[0, 3, 2]}
        target-position={[0, 0, 0]}
        angle={0.5}
        penumbra={0.8}
        color="#fff8f0"
        intensity={hovered ? 8 : 4}
        distance={8}
        castShadow={false}
      />

      {/* Coloured accent light wash */}
      <pointLight position={[0, -1.5, 1.5]} color={neonColor} intensity={hovered ? 3 : 1} distance={5} />

      {/* Outer neon glow frame */}
      <mesh ref={glowRef} position={[0, 0, -0.04]}>
        <planeGeometry args={[frameW + 0.6, frameH + 0.6]} />
        <meshBasicMaterial color={neonColor} toneMapped={false} transparent opacity={0.06} />
      </mesh>

      {/* Gallery frame — dark metallic border */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[frameW, frameH]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* The artwork */}
      <group ref={groupRef}>
        <mesh
          onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
          onClick={() => onSelect?.(index)}
        >
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      </group>

      {/* Title plaque below artwork */}
      <Html
        position={[0, -(height / 2) - 0.4, 0.01]}
        center
        transform
        distanceFactor={6}
        style={{ pointerEvents: 'none' }}
      >
        <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
          <div style={{
            fontFamily: '"Anton", sans-serif', fontSize: '11px',
            letterSpacing: '0.15em', color: '#fff',
            textShadow: '0 0 10px rgba(0,0,0,0.8)',
          }}>
            {name}
          </div>
          <div style={{
            fontFamily: "'Space Mono', monospace", fontSize: '8px',
            letterSpacing: '0.15em', color: 'rgba(255,255,255,0.45)',
            textShadow: '0 0 6px rgba(0,0,0,0.8)',
            marginTop: '3px',
          }}>
            GRAFFITI COLLAGE ON BOARD · 51 × 76 CM
          </div>
          <div style={{
            fontFamily: "'Space Mono', monospace", fontSize: '9px',
            letterSpacing: '0.2em', color: neonColor,
            textShadow: `0 0 8px ${neonColor}60`,
            marginTop: '2px',
          }}>
            1/1 ORIGINAL
          </div>
        </div>
      </Html>

      {/* Floor reflection pool under each piece */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -(position[1]) + 0.02, 0.5]}>
        <planeGeometry args={[width * 0.8, 1.5]} />
        <meshStandardMaterial color={neonColor} roughness={0.05} metalness={0.95} transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

// ── Wall Fragment — scattered detail crop ──
function WallFragment({ src, position, rotation, width = 1.2, height = 1.2, tint = '#ff6b00' }) {
  const [texture, setTexture] = useState(null);
  const meshRef = useRef();

  useEffect(() => {
    new THREE.TextureLoader().load(src, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      setTexture(tex);
    });
  }, [src]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    // Subtle breathing glow
    meshRef.current.material.opacity = 0.75 + Math.sin(clock.getElapsedTime() * 0.8 + position[2]) * 0.1;
  });

  if (!texture) return null;

  return (
    <group position={position} rotation={rotation}>
      {/* Faint glow behind */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[width + 0.15, height + 0.15]} />
        <meshBasicMaterial color={tint} toneMapped={false} transparent opacity={0.04} />
      </mesh>
      {/* The crop image */}
      <mesh ref={meshRef}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} toneMapped={false} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

// ── Neon Sign ──
function NeonSign({ text, sub, position, rotation = [0, 0, 0], color = '#ff6b00', size = 32 }) {
  return (
    <group position={position} rotation={rotation}>
      <pointLight color={color} intensity={2} distance={6} decay={2} />
      <Html center transform distanceFactor={8} style={{ pointerEvents: 'none' }}>
        <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
          <div style={{
            fontSize: `${size}px`, fontWeight: 900, color,
            textShadow: `0 0 10px ${color}, 0 0 30px ${color}, 0 0 60px ${color}80`,
            fontFamily: 'serif', lineHeight: 1.1,
          }}>{text}</div>
          {sub && (
            <div style={{
              fontSize: `${size * 0.3}px`, fontFamily: "'Space Mono', monospace",
              letterSpacing: '0.3em', textTransform: 'uppercase',
              color: `${color}99`, textShadow: `0 0 8px ${color}60`, marginTop: '4px',
            }}>{sub}</div>
          )}
        </div>
      </Html>
    </group>
  );
}

// ── Film Billboard at end of wall ──
function FilmBillboard({ position, rotation }) {
  const [videoTex, setVideoTex] = useState(null);
  useEffect(() => {
    const video = document.createElement('video');
    video.src = FILM.src;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.play().catch(() => {});
    const tex = new THREE.VideoTexture(video);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    setVideoTex(tex);
    return () => { video.pause(); video.src = ''; tex.dispose(); };
  }, []);
  if (!videoTex) return null;
  return (
    <group position={position} rotation={rotation}>
      {/* Glow behind screen */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[10, 6.5]} />
        <meshBasicMaterial color="#ff2d78" toneMapped={false} transparent opacity={0.06} />
      </mesh>
      {/* Video */}
      <mesh>
        <planeGeometry args={[9.5, 5.4]} />
        <meshBasicMaterial map={videoTex} toneMapped={false} />
      </mesh>
      {/* Light cast from the screen */}
      <pointLight position={[0, 0, 3]} color="#ff2d78" intensity={4} distance={15} decay={2} />
      <pointLight position={[-2, 0, 2]} color="#00d4ff" intensity={2} distance={10} decay={2} />
      <pointLight position={[2, 0, 2]} color="#ff6b00" intensity={2} distance={10} decay={2} />
    </group>
  );
}

// ── Camera Walk ──
function CameraWalk() {
  const { camera } = useThree();
  const scrollRef = useRef(0);
  const targetRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      targetRef.current = max > 0 ? window.scrollY / max : 0;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useFrame(() => {
    scrollRef.current += (targetRef.current - scrollRef.current) * 0.06;
    const t = scrollRef.current;
    const startZ = WALL_LENGTH / 2 - 2;
    const endZ = -WALL_LENGTH / 2 - 1;
    const z = startZ + (endZ - startZ) * t;
    // Walk alongside the wall, slightly angled to look at it
    camera.position.set(-2.5, 2, z);
    camera.lookAt(2, 2.5, z - 4);
  });

  return null;
}

// ── Graffiti Wall Scene ──
function GraffitiScene({ onSelect }) {
  const neonColors = ['#ff6b00', '#ff2d78', '#39ff14', '#ffd700', '#00d4ff'];
  const halfCount = Math.ceil(GRAFFITI_IMAGES.length / 2);

  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[-5, 12, 5]} color="#665599" intensity={0.3} />
      <fog attach="fog" args={['#080810', 8, 55]} />

      {/* Ground — wet polished concrete for reflections */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[20, WALL_LENGTH + 20]} />
        <meshStandardMaterial color="#0f0f12" roughness={0.08} metalness={0.92} />
      </mesh>

      {/* ── The Gallery Wall — dark concrete with slight texture ── */}
      <mesh position={[4, WALL_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.5, WALL_HEIGHT, WALL_LENGTH + 10]} />
        <meshStandardMaterial color="#1a1818" roughness={0.75} metalness={0.15} />
      </mesh>

      {/* ── Opposite wall (darker, recedes into shadow) ── */}
      <mesh position={[-6, WALL_HEIGHT / 2 - 1, 0]}>
        <boxGeometry args={[0.3, WALL_HEIGHT - 2, WALL_LENGTH + 10]} />
        <meshStandardMaterial color="#0e0e10" roughness={0.95} />
      </mesh>

      {/* ── Sky / open top — no ceiling for outdoor feel ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, WALL_HEIGHT + 2, 0]}>
        <planeGeometry args={[30, WALL_LENGTH + 20]} />
        <meshBasicMaterial color="#0a0a15" />
      </mesh>

      {/* ── Entrance Sign — grand ── */}
      <NeonSign text="原画" sub="THE ORIGINALS" position={[0, 7, WALL_LENGTH / 2 - 1]} color="#ff6b00" size={40} />
      <NeonSign text="抵抗" sub="THE RESISTANCE" position={[3.7, 7, 15]} rotation={[0, -Math.PI / 2, 0]} color="#ffd700" size={40} />

      {/* ── Floating dust particles ── */}
      <DustParticles count={150} />

      {/* ── 1/1 Original artworks — gallery presentation ── */}
      {GRAFFITI_IMAGES.map((img, i) => {
        const spacing = 8;
        const z = WALL_LENGTH / 2 - 6 - i * spacing;
        // Portrait format — 51cm x 76cm (2:3 ratio)
        const w = 3 + (i % 2) * 0.3;
        const h = w * (76 / 51);
        return (
          <GraffitiPiece
            key={img.id}
            src={img.src}
            name={img.name}
            position={[3.72, 3, z]}
            rotation={[0, -Math.PI / 2, 0]}
            width={w}
            height={h}
            index={i}
            onSelect={onSelect}
            neonColor={neonColors[i % neonColors.length]}
          />
        );
      })}

      {/* ── Detail crops scattered along corridor walls ── */}
      {DETAIL_CROPS.map((src, i) => {
        // Most on opposite wall, a few high on gallery wall
        const onOppositeWall = i < 12;
        const x = onOppositeWall ? -5.68 : 3.72;
        const facingRotation = onOppositeWall ? [0, Math.PI / 2, 0] : [0, -Math.PI / 2, 0];
        // Dense clusters at front (Neon Cherub ~z14) AND end (Rouge Red ~z-2)
        const zPositions = [
          16, 15.2, 14.5, 13.5, 12.8, 12,   // dense cluster near front
          8, 5, 3,                             // spread through middle
          -1, -2.5, -3.5,                      // dense cluster near Rouge Red
          -1.5, -3, -4, -5,                    // more around the end piece
        ];
        const z = zPositions[i] ?? (WALL_LENGTH / 2 - 4 - i * 2);
        const zJitter = ((i * 7 + 3) % 5 - 2) * 0.3;
        // Vary height
        const yBase = onOppositeWall ? 2.5 : 6.2;
        const yOffset = ((i * 13 + 5) % 7 - 3) * 0.45;
        const y = Math.max(0.8, Math.min(yBase + yOffset, 7));
        // Vary size
        const size = 0.8 + ((i * 11 + 2) % 5) * 0.15;
        // Slight random rotation
        const tilt = ((i * 17 + 1) % 9 - 4) * 0.06;
        const tintColors = ['#ff6b00', '#ff2d78', '#39ff14', '#ffd700', '#00d4ff'];
        return (
          <WallFragment
            key={`detail-${i}`}
            src={src}
            position={[x, y, z + zJitter]}
            rotation={[tilt, facingRotation[1], tilt * 0.5]}
            width={size}
            height={size}
            tint={tintColors[i % tintColors.length]}
          />
        );
      })}

      {/* ── Neon signs between artworks ── */}
      <NeonSign text="手作り" sub="PROOF OF HAND" position={[3.6, 6.5, 10]} rotation={[0, -Math.PI / 2, 0]} color="#ff2d78" size={36} />
      <NeonSign text="唯一" sub="ONE OF ONE" position={[3.6, 6.5, 2]} rotation={[0, -Math.PI / 2, 0]} color="#39ff14" size={32} />
      <NeonSign text="魂" sub="ANALOG" position={[3.6, 6.5, -6]} rotation={[0, -Math.PI / 2, 0]} color="#ffd700" size={36} />

      {/* ── Street lamps ── */}
      {Array.from({ length: 14 }, (_, i) => {
        const z = WALL_LENGTH / 2 - 5 - i * 5;
        return (
          <group key={`lamp-${i}`}>
            {/* Lamp post */}
            <mesh position={[-3, 2, z]}>
              <cylinderGeometry args={[0.03, 0.03, 4]} />
              <meshStandardMaterial color="#333" roughness={0.8} />
            </mesh>
            {/* Light */}
            <pointLight position={[-3, 4.2, z]} color={neonColors[i % 5]} intensity={3} distance={9} decay={2} />
            <mesh position={[-3, 4.2, z]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshBasicMaterial color={neonColors[i % 5]} toneMapped={false} />
            </mesh>
          </group>
        );
      })}

      {/* ── Back wall closing the corridor ── */}
      <mesh position={[0, WALL_HEIGHT / 2, -WALL_LENGTH / 2 - 4.5]}>
        <boxGeometry args={[14, WALL_HEIGHT + 2, 0.5]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.85} metalness={0.1} />
      </mesh>

      {/* ── Film playing on the back wall ── */}
      <FilmBillboard position={[1, WALL_HEIGHT / 2, -WALL_LENGTH / 2 - 4.2]} rotation={[0, 0, 0]} />

      {/* ── Neon strip running along base of gallery wall ── */}
      <mesh position={[3.73, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[0.06, WALL_LENGTH + 8]} />
        <meshBasicMaterial color="#ff6b00" toneMapped={false} transparent opacity={0.6} />
      </mesh>
      <pointLight position={[3.5, 0.2, 0]} color="#ff6b00" intensity={1} distance={WALL_LENGTH} />

      {/* ── Puddle reflections on ground ── */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={`puddle-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0 + (i % 3 - 1) * 2, 0.02, WALL_LENGTH / 2 - 8 - i * 8]}>
          <circleGeometry args={[1.2 + (i % 3) * 0.5, 24]} />
          <meshStandardMaterial color={neonColors[i % 5]} roughness={0.02} metalness={0.98} transparent opacity={0.3} />
        </mesh>
      ))}

      <CameraWalk />
    </>
  );
}

// ── Scroll HUD ──
function ScrollHUD() {
  const [progress, setProgress] = useState(0);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
      if (window.scrollY > 50) setShowHint(false);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{
      position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 20, pointerEvents: 'none',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
    }}>
      {showHint && (
        <div style={{
          fontSize: '11px', fontFamily: "'Space Mono', monospace",
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)',
          animation: 'grafHintBounce 2s ease infinite',
          textShadow: '0 0 8px rgba(255,107,0,0.4)',
        }}>
          Scroll to walk along the graffiti wall
        </div>
      )}
      <div style={{
        width: '140px', height: '3px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '2px', overflow: 'hidden',
      }}>
        <div style={{
          width: `${progress * 100}%`, height: '100%',
          background: 'linear-gradient(90deg, #ff6b00, #ffd700)',
          borderRadius: '2px', transition: 'width 0.1s',
        }} />
      </div>
    </div>
  );
}

// ═══ MAIN ═══
export default function AndroidsGraffiti() {
  const [selected, setSelected] = useState(null);
  const [viewFull, setViewFull] = useState(false);
  const piece = selected !== null ? GRAFFITI_IMAGES[selected] : null;
  const neonColors = ['#ff6b00', '#ff2d78', '#39ff14', '#ffd700', '#00d4ff'];
  const col = selected !== null ? neonColors[selected % neonColors.length] : '#ff6b00';

  return (
    <div style={{ background: '#0a0a10' }}>
      <Helmet>
        <title>The Originals — Porcelain Androids</title>
        <meta name="description" content="Original 1/1 artworks by Miss AL Simpson. The analog resistance — the one medium the Party can't switch off. Phygital wall fragments paired with on-chain certificates." />
      </Helmet>

      <div style={{ height: '300vh', position: 'relative' }}>
        <div style={{ position: 'fixed', inset: 0, top: '52px', zIndex: 1 }}>
          <Canvas
            camera={{ fov: 65, near: 0.1, far: 60, position: [-2.5, 2, 18] }}
            gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
            onCreated={({ gl }) => {
              gl.setClearColor('#0a0a10');
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.6;
            }}
          >
            <Suspense fallback={null}>
              <GraffitiScene onSelect={setSelected} />
            </Suspense>
          </Canvas>
          <ScrollHUD />
        </div>
      </div>

      {/* ── Detail Panel — slides up when a piece is selected ── */}
      {piece && !viewFull && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
          background: 'rgba(10,10,16,0.94)', backdropFilter: 'blur(30px)',
          borderTop: `1px solid ${col}30`,
          padding: 'clamp(24px, 4vw, 48px)',
          animation: 'grafSlideUp 0.4s ease',
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Thumbnail — click to view full */}
            <img
              src={piece.src}
              alt={piece.name}
              onClick={() => setViewFull(true)}
              style={{
                width: 'clamp(160px, 30vw, 340px)', aspectRatio: '16/9', objectFit: 'cover',
                border: `2px solid ${col}`,
                boxShadow: `0 0 30px ${col}25`,
                cursor: 'zoom-in',
              }}
            />

            <div style={{ flex: 1, minWidth: '220px' }}>
              {/* 1/1 badge */}
              <div style={{
                display: 'inline-block',
                fontFamily: "'Space Mono', monospace", fontSize: '10px',
                letterSpacing: '0.2em', color: col,
                border: `1px solid ${col}60`, padding: '4px 12px',
                marginBottom: '10px',
              }}>
                WALL FRAGMENT {piece.fragmentNum} · 1/1 PHYGITAL
              </div>

              <div style={{
                fontFamily: '"Anton", sans-serif', fontSize: 'clamp(22px, 3.5vw, 36px)',
                letterSpacing: '0.08em', color: '#fff',
              }}>
                {piece.name}
              </div>

              <div style={{
                fontFamily: "'Space Mono', monospace", fontSize: '10px',
                color: 'rgba(255,255,255,0.5)', marginTop: '8px', letterSpacing: '0.12em',
              }}>
                GRAFFITI COLLAGE ON BOARD · 51 × 76 CM
              </div>

              <div style={{
                fontFamily: "'Space Mono', monospace", fontSize: '10px',
                color: 'rgba(255,255,255,0.35)', marginTop: '8px', letterSpacing: '0.1em',
                lineHeight: 1.8,
              }}>
                The analog resistance — the one medium the Party can't switch off. Original collage by
                Miss AL Simpson. Paired with a 1/1 NFT on Ethereum. The canvas is the only physical instance
                ever produced. This composition will never be re-minted or re-printed.
              </div>

              <div style={{
                fontFamily: "'Space Mono', monospace", fontSize: '10px',
                color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em',
                marginTop: '16px',
              }}>
                {piece.edition} · SIGNED
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                <a
                  href={piece.superRare || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => { if (!piece.superRare) e.preventDefault(); }}
                  style={{
                    display: 'inline-block', textDecoration: 'none',
                    background: piece.superRare ? `linear-gradient(135deg, ${col}, ${col}80)` : `linear-gradient(135deg, ${col}40, ${col}20)`,
                    border: 'none', color: '#fff', padding: '14px 32px',
                    fontFamily: '"Anton", sans-serif', fontSize: '15px',
                    letterSpacing: '0.2em', cursor: piece.superRare ? 'pointer' : 'default',
                    boxShadow: piece.superRare ? `0 0 24px ${col}35` : 'none',
                    opacity: piece.superRare ? 1 : 0.5,
                  }}
                >
                  {piece.superRare ? 'VIEW ON SUPERRARE' : 'COMING SOON'}
                </a>
                <button onClick={() => setViewFull(true)} style={{
                  background: 'transparent', border: `1px solid ${col}60`,
                  color: col, padding: '14px 28px',
                  fontFamily: '"Anton", sans-serif', fontSize: '14px',
                  letterSpacing: '0.2em', cursor: 'pointer',
                }}>
                  VIEW FULL SIZE
                </button>
              </div>

              {/* NFT info */}
              <div style={{
                display: 'flex', gap: '20px', marginTop: '16px',
                borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px',
              }}>
                {[
                  { kanji: '唯一', label: '1/1 NFT' },
                  { kanji: '証明', label: 'ON-CHAIN COA' },
                  { kanji: '署名', label: 'ARTIST SIGNED' },
                ].map(tag => (
                  <div key={tag.label} style={{ textAlign: 'center' }}>
                    <div style={{
                      fontFamily: "'Noto Sans JP', sans-serif", fontSize: '16px',
                      color: col, textShadow: `0 0 8px ${col}40`,
                    }}>
                      {tag.kanji}
                    </div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace", fontSize: '9px',
                      color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', marginTop: '2px',
                    }}>
                      {tag.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Close button */}
            <button onClick={() => setSelected(null)} style={{
              position: 'absolute', top: '16px', right: '24px',
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
              fontSize: '24px', cursor: 'pointer',
            }}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── Full-screen lightbox ── */}
      {viewFull && piece && (
        <div
          onClick={() => setViewFull(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(20px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
          }}
        >
          <img
            src={piece.src}
            alt={piece.name}
            style={{
              maxWidth: '92vw', maxHeight: '88vh', objectFit: 'contain',
              border: `2px solid ${col}40`,
              boxShadow: `0 0 80px ${col}15`,
            }}
          />
          <div style={{
            position: 'absolute', bottom: '28px', left: 0, right: 0,
            textAlign: 'center', pointerEvents: 'none',
          }}>
            <div style={{
              fontFamily: '"Anton", sans-serif', fontSize: '20px',
              letterSpacing: '0.12em', color: '#fff',
              textShadow: '0 0 20px rgba(0,0,0,0.9)',
            }}>
              {piece.name}
            </div>
            <div style={{
              fontFamily: "'Space Mono', monospace", fontSize: '11px',
              color: `${col}cc`, marginTop: '6px', letterSpacing: '0.2em',
            }}>
              WALL FRAGMENT {piece.fragmentNum} · 1/1 PHYGITAL
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setViewFull(false); }}
            style={{
              position: 'absolute', top: '20px', right: '24px',
              background: 'rgba(255,255,255,0.1)', border: `1px solid ${col}40`,
              color: '#fff', width: '40px', height: '40px', borderRadius: '50%',
              cursor: 'pointer', fontSize: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>
      )}

      <style>{`
        @keyframes grafHintBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes grafSlideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
