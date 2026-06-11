import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { STILLS, FILM, SITE_META, DISCOVERY_FRAGMENTS, ANDROIDS_BASE } from '../../config/androidsContent';

// ── Street layout — a Roppongi back-alley ──
const STREET_LENGTH = 70;
const WALL_HEIGHT = 10;
const STREET_WIDTH = 7;

const LEFT_POSTERS = STILLS.slice(0, 10);
const RIGHT_POSTERS = STILLS.slice(10, 20);

// ── Rain Particles ──
function Rain() {
  const count = 800;
  const meshRef = useRef();
  const positions = useRef(new Float32Array(count * 3));

  useEffect(() => {
    for (let i = 0; i < count; i++) {
      positions.current[i * 3] = (Math.random() - 0.5) * 14;
      positions.current[i * 3 + 1] = Math.random() * 12;
      positions.current[i * 3 + 2] = Math.random() * STREET_LENGTH - STREET_LENGTH / 2;
    }
  }, []);

  useFrame(() => {
    const pos = positions.current;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] -= 0.12;
      if (pos[i * 3 + 1] < 0) {
        pos[i * 3 + 1] = 10 + Math.random() * 2;
        pos[i * 3] = (Math.random() - 0.5) * 14;
      }
    }
    if (meshRef.current) {
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions.current}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#8899bb"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

// ── Wall Poster ──
function WallPoster({ src, position, rotation, width = 3, height = 2 }) {
  const meshRef = useRef();
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(src, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      setTexture(tex);
    });
    return () => { if (texture) texture.dispose(); };
  }, [src]);

  if (!texture) return null;

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

// ── Video Billboard ──
function VideoBillboard({ position, rotation, width = 5, height = 2.8 }) {
  const [videoTexture, setVideoTexture] = useState(null);

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
    setVideoTexture(tex);

    return () => {
      video.pause();
      video.src = '';
      tex.dispose();
    };
  }, []);

  if (!videoTexture) return null;

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[width + 0.25, height + 0.25]} />
        <meshBasicMaterial color="#ff2d78" toneMapped={false} transparent opacity={0.15} />
      </mesh>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={videoTexture} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ── Neon Sign ──
function NeonSign({ text, sub, position, rotation = [0, 0, 0], color = '#ff2d78', size = 32 }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[text.length * size * 0.015 + 1, size * 0.04 + 1]} />
        <meshBasicMaterial color={color} transparent opacity={0.04} />
      </mesh>
      <pointLight color={color} intensity={2} distance={6} decay={2} />
      <Html center transform distanceFactor={8} style={{ pointerEvents: 'none' }}>
        <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
          <div style={{
            fontSize: `${size}px`,
            fontWeight: 900,
            color: color,
            textShadow: `0 0 10px ${color}, 0 0 30px ${color}, 0 0 60px ${color}80`,
            fontFamily: 'serif',
            lineHeight: 1.1,
          }}>
            {text}
          </div>
          {sub && (
            <div style={{
              fontSize: `${size * 0.28}px`,
              fontFamily: "'Space Mono', monospace",
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: `${color}99`,
              textShadow: `0 0 8px ${color}60`,
              marginTop: '4px',
            }}>
              {sub}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

// ── Ground — wet tarmac ──
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <planeGeometry args={[STREET_WIDTH, STREET_LENGTH + 20]} />
      <meshStandardMaterial color="#080810" roughness={0.08} metalness={0.9} />
    </mesh>
  );
}

// ── Walls ──
function Walls() {
  return (
    <>
      <mesh position={[-STREET_WIDTH / 2, WALL_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.3, WALL_HEIGHT, STREET_LENGTH + 20]} />
        <meshStandardMaterial color="#0a0010" roughness={0.7} />
      </mesh>
      <mesh position={[STREET_WIDTH / 2, WALL_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.3, WALL_HEIGHT, STREET_LENGTH + 20]} />
        <meshStandardMaterial color="#0a0010" roughness={0.7} />
      </mesh>
    </>
  );
}

// ── Neon light strip on wall ──
function WallNeonStrip({ position, color, length = 0.5 }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.06, 0.06, length]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <pointLight color={color} intensity={1.5} distance={5} decay={2} />
    </group>
  );
}

// ── Archive Fragment — 3D positioned text that fades in as camera approaches ──
function ArchiveFragment({ position, rotation, fragment, color = '#ff2d78' }) {
  const groupRef = useRef();
  const { camera } = useThree();

  useFrame(() => {
    if (!groupRef.current) return;
    const dist = camera.position.distanceTo(new THREE.Vector3(...position));
    groupRef.current.visible = dist < 18;
    const opacity = Math.max(0, 1 - (dist - 6) / 12);
    groupRef.current.children.forEach(c => {
      if (c.material) c.material.opacity = opacity * 0.06;
    });
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[4, 1.5]} />
        <meshBasicMaterial color={color} transparent opacity={0.06} />
      </mesh>
      <Html center transform distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div style={{ width: '280px', textAlign: 'left' }}>
          <div style={{
            fontSize: '8px', fontFamily: "'Space Mono', monospace",
            letterSpacing: '0.3em', textTransform: 'uppercase',
            color: `${color}80`, marginBottom: '6px',
          }}>
            {fragment.type}
          </div>
          <div style={{
            fontSize: '11px', fontFamily: "'Space Mono', monospace",
            lineHeight: 1.7, color: 'rgba(255,255,255,0.5)',
            textShadow: `0 0 20px ${color}30`,
          }}>
            {fragment.text}
          </div>
        </div>
      </Html>
    </group>
  );
}

// ── Camera Walk Controller ──
function CameraWalk() {
  const { camera } = useThree();
  const scrollRef = useRef(0);
  const targetRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      targetRef.current = maxScroll > 0 ? scrollY / maxScroll : 0;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useFrame(() => {
    scrollRef.current += (targetRef.current - scrollRef.current) * 0.06;
    const t = scrollRef.current;

    const startZ = STREET_LENGTH / 2 - 2;
    const endZ = -STREET_LENGTH / 2 + 6;
    const z = startZ + (endZ - startZ) * t;
    const sway = Math.sin(t * Math.PI * 3) * 0.15;

    camera.position.set(sway, 2.2, z);
    camera.lookAt(sway * 0.3, 2.5, z - 8);
  });

  return null;
}

// ── Manga Machine at the end of the alley ──
function MangaMachine({ position, onClick }) {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child) => {
      if (child.material?.toneMapped === false) {
        child.material.opacity = 0.8 + Math.sin(t * 3) * 0.2;
      }
    });
  });

  return (
    <group position={position} ref={groupRef}>
      <mesh position={[0, 3, 0]}>
        <boxGeometry args={[3.5, 6, 1.2]} />
        <meshStandardMaterial color="#1a0028" roughness={0.3} metalness={0.5} emissive="#ff2d78" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[0, 3.8, 0.62]}>
        <planeGeometry args={[2.8, 2]} />
        <meshBasicMaterial color="#0a0a1a" />
      </mesh>
      <mesh position={[0, 6.05, 0]}>
        <boxGeometry args={[3.7, 0.08, 1.4]} />
        <meshBasicMaterial color="#ff2d78" toneMapped={false} transparent />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[3.7, 0.08, 1.4]} />
        <meshBasicMaterial color="#00d4ff" toneMapped={false} transparent />
      </mesh>
      <mesh position={[-1.8, 3, 0]}>
        <boxGeometry args={[0.08, 6.1, 0.08]} />
        <meshBasicMaterial color="#ff2d78" toneMapped={false} transparent />
      </mesh>
      <mesh position={[1.8, 3, 0]}>
        <boxGeometry args={[0.08, 6.1, 0.08]} />
        <meshBasicMaterial color="#ff2d78" toneMapped={false} transparent />
      </mesh>
      <pointLight position={[0, 7, 2]} color="#ff2d78" intensity={4} distance={10} />
      <pointLight position={[0, 0.5, 2]} color="#00d4ff" intensity={3} distance={8} />
      <Html position={[0, 3.8, 0.7]} center>
        <div onClick={onClick} style={{ cursor: 'pointer', textAlign: 'center', padding: '16px 32px', userSelect: 'none' }}>
          <div style={{
            fontSize: '9px', fontFamily: "'Space Mono', monospace",
            letterSpacing: '0.35em', textTransform: 'uppercase',
            color: 'rgba(0,212,255,0.5)', marginBottom: '8px',
          }}>RECOVERED DEVICE // MM-01</div>
          <div style={{
            fontSize: '32px', fontWeight: 900, fontFamily: 'serif',
            color: '#ff2d78',
            textShadow: '0 0 10px #ff2d78, 0 0 30px rgba(255,45,120,0.6)',
          }}>マンガマシン</div>
          <div style={{
            fontSize: '9px', fontFamily: "'Space Mono', monospace",
            letterSpacing: '0.35em', textTransform: 'uppercase',
            color: 'rgba(0,212,255,0.6)', textShadow: '0 0 8px rgba(0,212,255,0.5)',
            marginTop: '8px',
          }}>ACTIVATE MACHINE</div>
        </div>
      </Html>
    </group>
  );
}

// ── Street Scene ──
function StreetScene({ onMachineClick }) {
  const neonColors = ['#ff2d78', '#00d4ff', '#39ff14', '#ff6b00', '#ffd700'];

  return (
    <>
      <ambientLight intensity={0.1} />
      <fog attach="fog" args={['#050508', 6, 35]} />

      <Rain />
      <Ground />
      <Walls />

      {/* ── Brand neon — PORCELAIN ANDROID in Impact on far wall ── */}
      <group position={[0, 6, -STREET_LENGTH / 2 + 1]}>
        <pointLight color="#ff2d78" intensity={6} distance={16} decay={2} />
        <Html center transform distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
            <div style={{
              fontSize: '72px', fontWeight: 900,
              fontFamily: "'Impact', 'Arial Black', 'Haettenschweiler', sans-serif",
              color: '#ff2d78', letterSpacing: '0.08em', textTransform: 'uppercase',
              textShadow: '0 0 10px #ff2d78, 0 0 30px #ff2d78, 0 0 60px rgba(255,45,120,0.5), 0 0 100px rgba(255,45,120,0.3)',
              lineHeight: 1,
            }}>PORCELAIN<br/>ANDROID</div>
            <div style={{
              fontSize: '28px', fontWeight: 900,
              fontFamily: "'Impact', 'Arial Black', 'Haettenschweiler', sans-serif",
              color: '#00d4ff', letterSpacing: '0.2em', textTransform: 'uppercase',
              textShadow: '0 0 8px #00d4ff, 0 0 20px #00d4ff, 0 0 40px rgba(0,212,255,0.5)',
              marginTop: '12px', lineHeight: 1,
            }}>THE MANGA MACHINE</div>
          </div>
        </Html>
      </group>

      {/* ── Entrance — Archive Entry 001 ── */}
      <NeonSign text="六本木" sub="ROPPONGI DISTRICT" position={[0, 8, STREET_LENGTH / 2 - 2]} color="#ffd700" size={48} />

      {/* ── Left Wall Signs ── */}
      <NeonSign text="磁器" sub="PORCELAIN" position={[-STREET_WIDTH / 2 + 0.2, 7, 22]} rotation={[0, Math.PI / 2, 0]} color="#ff2d78" size={36} />
      <NeonSign text="記憶" sub="MEMORY" position={[-STREET_WIDTH / 2 + 0.2, 7, -4]} rotation={[0, Math.PI / 2, 0]} color="#00d4ff" size={30} />
      <NeonSign text="秘密" sub="CLASSIFIED" position={[-STREET_WIDTH / 2 + 0.2, 7, -22]} rotation={[0, Math.PI / 2, 0]} color="#39ff14" size={36} />

      {/* ── Right Wall Signs ── */}
      <NeonSign text="漫画" sub="MANGA" position={[STREET_WIDTH / 2 - 0.2, 7, 14]} rotation={[0, -Math.PI / 2, 0]} color="#39ff14" size={44} />
      <NeonSign text="地下道" sub="THE TUNNELS" position={[STREET_WIDTH / 2 - 0.2, 7, -8]} rotation={[0, -Math.PI / 2, 0]} color="#ff6b00" size={36} />
      <NeonSign text="革命" sub="REVOLUTION" position={[STREET_WIDTH / 2 - 0.2, 7, -24]} rotation={[0, -Math.PI / 2, 0]} color="#ff2d78" size={40} />

      {/* ── Discovery Fragments on walls ── */}
      <ArchiveFragment
        position={[-STREET_WIDTH / 2 + 0.2, 3.5, 26]}
        rotation={[0, Math.PI / 2, 0]}
        fragment={DISCOVERY_FRAGMENTS[0]}
        color="#ffd700"
      />
      <ArchiveFragment
        position={[STREET_WIDTH / 2 - 0.2, 3.5, 8]}
        rotation={[0, -Math.PI / 2, 0]}
        fragment={DISCOVERY_FRAGMENTS[3]}
        color="#ff2d78"
      />
      <ArchiveFragment
        position={[-STREET_WIDTH / 2 + 0.2, 3.5, -10]}
        rotation={[0, Math.PI / 2, 0]}
        fragment={DISCOVERY_FRAGMENTS[4]}
        color="#00d4ff"
      />
      <ArchiveFragment
        position={[STREET_WIDTH / 2 - 0.2, 3.5, -18]}
        rotation={[0, -Math.PI / 2, 0]}
        fragment={DISCOVERY_FRAGMENTS[2]}
        color="#39ff14"
      />

      {/* ── Wall posters — the androids, standing in the alleys ── */}
      {LEFT_POSTERS.map((still, i) => (
        <WallPoster
          key={still.id}
          src={`/androids/stills/${still.file}`}
          position={[-STREET_WIDTH / 2 + 0.17, 2.2 + (i % 2) * 2.5, 24 - i * 6]}
          rotation={[0, Math.PI / 2, 0]}
          width={3.5}
          height={2.2}
        />
      ))}
      {RIGHT_POSTERS.map((still, i) => (
        <WallPoster
          key={still.id}
          src={`/androids/stills/${still.file}`}
          position={[STREET_WIDTH / 2 - 0.17, 2.2 + (i % 2) * 2.5, 22 - i * 6]}
          rotation={[0, -Math.PI / 2, 0]}
          width={3.5}
          height={2.2}
        />
      ))}

      {/* ── Film billboards ── */}
      <VideoBillboard position={[-STREET_WIDTH / 2 + 0.18, 5.5, 14]} rotation={[0, Math.PI / 2, 0]} width={4.5} height={2.5} />
      <VideoBillboard position={[STREET_WIDTH / 2 - 0.18, 5.5, -2]} rotation={[0, -Math.PI / 2, 0]} width={4.5} height={2.5} />
      <VideoBillboard position={[-STREET_WIDTH / 2 + 0.18, 5.5, -16]} rotation={[0, Math.PI / 2, 0]} width={4.5} height={2.5} />

      {/* ── Neon light strips along walls ── */}
      {Array.from({ length: 14 }, (_, i) => {
        const z = 32 - i * 5;
        return (
          <group key={`neon-${i}`}>
            <WallNeonStrip position={[-STREET_WIDTH / 2 + 0.18, 0.4, z]} color={neonColors[i % 5]} />
            <WallNeonStrip position={[STREET_WIDTH / 2 - 0.18, 0.4, z]} color={neonColors[(i + 2) % 5]} />
          </group>
        );
      })}

      {/* ── Overhead crossing neon tubes ── */}
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={`cross-${i}`} position={[0, WALL_HEIGHT - 1, 30 - i * 8]}>
          <boxGeometry args={[STREET_WIDTH, 0.05, 0.05]} />
          <meshBasicMaterial color={neonColors[i % 3]} toneMapped={false} />
        </mesh>
      ))}

      {/* ── The Manga Machine at the end of the alley ── */}
      <MangaMachine position={[0, 0, -STREET_LENGTH / 2 + 3]} onClick={onMachineClick} />

      <CameraWalk />
    </>
  );
}

// ── Typewriter Text ──
function TypewriterText({ text, delay = 0, speed = 30, style = {} }) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [started, text, speed]);

  return (
    <span style={style}>
      {displayed}
      {started && displayed.length < text.length && (
        <span style={{ opacity: 0.8, animation: 'alleyBlink 0.8s step-end infinite' }}>_</span>
      )}
    </span>
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
          fontSize: '10px', fontFamily: "'Space Mono', monospace",
          letterSpacing: '0.25em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.35)',
          animation: 'paHintBounce 2s ease infinite',
        }}>
          Scroll to enter the district
        </div>
      )}
      <div style={{
        width: '140px', height: '2px',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '2px', overflow: 'hidden',
      }}>
        <div style={{
          width: `${progress * 100}%`, height: '100%',
          background: 'linear-gradient(90deg, #ff2d78, #00d4ff)',
          borderRadius: '2px', transition: 'width 0.1s',
        }} />
      </div>
    </div>
  );
}

// ═══ MAIN — THE ALLEY ═══
export default function PorcelainAndroidsHome() {
  const navigate = useNavigate();
  const [showLore, setShowLore] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowLore(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ background: '#050508' }}>
      <Helmet>
        <title>{SITE_META.title} — {SITE_META.subtitle}</title>
        <meta name="description" content={SITE_META.description} />
      </Helmet>

      {/* ── Typewriter Lore Reveal — overlays the top of the 3D scene ── */}
      <div style={{
        position: 'fixed', top: '52px', left: 0, right: 0,
        zIndex: 15, pointerEvents: 'none',
        display: 'flex', justifyContent: 'center',
        padding: '40px 24px 0',
      }}>
        {showLore && (
          <div style={{
            maxWidth: '600px', textAlign: 'center',
            background: 'rgba(5,5,8,0.6)',
            backdropFilter: 'blur(8px)',
            padding: '32px 40px',
            border: '1px solid rgba(255,45,120,0.08)',
            animation: 'alleyFadeIn 2s ease forwards',
          }}>
            <div style={{
              fontSize: '9px', fontFamily: "'Space Mono', monospace",
              letterSpacing: '0.4em', textTransform: 'uppercase',
              color: 'rgba(255,45,120,0.45)', marginBottom: '16px',
            }}>
              <TypewriterText text="ARCHIVE ENTRY 001" delay={500} speed={60} />
            </div>

            <div style={{
              fontSize: 'clamp(10px, 1.5vw, 12px)',
              fontFamily: "'Space Mono', monospace",
              lineHeight: 2.2,
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.04em',
            }}>
              <TypewriterText
                text="Roppongi District was marked for demolition. The lights stayed on, and no one ever explained why."
                delay={1800}
                speed={35}
              />
            </div>

            <div style={{
              fontSize: '9px', fontFamily: "'Space Mono', monospace",
              letterSpacing: '0.3em', textTransform: 'uppercase',
              color: 'rgba(0,212,255,0.3)', marginTop: '20px',
            }}>
              <TypewriterText text="// THE PORCELAIN ANDROIDS WERE SIMPLY THERE" delay={5500} speed={40} />
            </div>
          </div>
        )}
      </div>

      {/* ── 3D Alley ── */}
      <div style={{ height: '600vh', position: 'relative' }}>
        <div style={{ position: 'fixed', inset: 0, top: '52px', zIndex: 1 }}>
          <Canvas
            camera={{ fov: 65, near: 0.1, far: 80, position: [0, 2.2, 33] }}
            gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
            onCreated={({ gl }) => {
              gl.setClearColor('#050508');
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.2;
            }}
          >
            <Suspense fallback={null}>
              <StreetScene onMachineClick={() => navigate(`${ANDROIDS_BASE}/manga-machine`)} />
            </Suspense>
          </Canvas>
          <ScrollHUD />
        </div>
      </div>

      <style>{`
        @keyframes paHintBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes alleyFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes alleyBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
