import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { FILM, MINT_LINKS, STILLS } from '../../config/androidsContent';

// ── Room layout ──
const ROOM_WIDTH = 20;
const ROOM_DEPTH = 18;
const ROOM_HEIGHT = 12;

// ── Video Screen ──
function FilmScreen({ position, onVideoReady }) {
  const [videoTex, setVideoTex] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = document.createElement('video');
    video.src = FILM.src;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.play().catch(() => {});
    videoRef.current = video;
    if (onVideoReady) onVideoReady(video);

    const tex = new THREE.VideoTexture(video);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    setVideoTex(tex);

    return () => { video.pause(); video.src = ''; tex.dispose(); };
  }, []);

  if (!videoTex) return null;

  return (
    <group position={position}>
      {/* Screen glow background */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[19, 11]} />
        <meshBasicMaterial color="#ff2d78" toneMapped={false} transparent opacity={0.04} />
      </mesh>
      {/* Frame */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[18.2, 10.4]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>
      {/* Film */}
      <mesh>
        <planeGeometry args={[18, 10.2]} />
        <meshBasicMaterial map={videoTex} toneMapped={false} />
      </mesh>
      {/* Screen lights */}
      <pointLight position={[0, 0, 4]} color="#ff2d78" intensity={5} distance={18} decay={2} />
      <pointLight position={[-7, 0, 3]} color="#00d4ff" intensity={2.5} distance={12} decay={2} />
      <pointLight position={[7, 0, 3]} color="#ff6b00" intensity={2.5} distance={12} decay={2} />
    </group>
  );
}

// ── Neon Sign ──
function NeonSign({ text, sub, position, rotation = [0, 0, 0], color = '#ff2d78', size = 32 }) {
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

// ── Flashing Brand Neon ──
const BRAND_COLORS = ['#ff2d78', '#00d4ff', '#39ff14', '#ffd700', '#ff6b00', '#bf00ff'];
function FlashingBrandSign({ position, rotation = [0, 0, 0] }) {
  const lightRef = useRef();
  const htmlRef = useRef();
  const [colorIdx, setColorIdx] = useState(0);
  const [flicker, setFlicker] = useState(1);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Cycle color every 2 seconds
    const newIdx = Math.floor(t / 2) % BRAND_COLORS.length;
    if (newIdx !== colorIdx) setColorIdx(newIdx);
    // Flicker effect
    const f = Math.sin(t * 12) > 0.3 ? 1 : (Math.sin(t * 37) > 0 ? 0.7 : 0.4);
    setFlicker(f);
    if (lightRef.current) {
      lightRef.current.color.set(BRAND_COLORS[newIdx]);
      lightRef.current.intensity = 4 * f;
    }
  });

  const color = BRAND_COLORS[colorIdx];
  return (
    <group position={position} rotation={rotation}>
      <pointLight ref={lightRef} color={color} intensity={4} distance={12} decay={2} />
      <Html center transform distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div style={{ textAlign: 'center', whiteSpace: 'nowrap', opacity: flicker }}>
          <div style={{
            fontSize: '52px', fontWeight: 900,
            fontFamily: "'Impact', 'Arial Black', 'Haettenschweiler', sans-serif",
            color, letterSpacing: '0.08em', textTransform: 'uppercase',
            textShadow: `0 0 10px ${color}, 0 0 30px ${color}, 0 0 60px ${color}80, 0 0 100px ${color}40`,
            lineHeight: 1, transition: 'color 0.3s, text-shadow 0.3s',
          }}>THE MANGA<br/>MACHINE</div>
        </div>
      </Html>
    </group>
  );
}

// ── Wall Poster ──
function WallPoster({ src, position, rotation, width = 2.5, height = 1.6 }) {
  const [texture, setTexture] = useState(null);
  useEffect(() => {
    new THREE.TextureLoader().load(src, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      setTexture(tex);
    });
  }, [src]);
  if (!texture) return null;
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

// ── Curtain panel ──
function Curtain({ position, width = 1.5 }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[width, ROOM_HEIGHT + 1, 0.3]} />
      <meshStandardMaterial color="#3a0010" roughness={0.8} />
    </mesh>
  );
}

// ── Bulb light row ──
function BulbRow({ position, count = 16, spacing = 0.8 }) {
  const groupRef = useRef();
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      if (child.material) {
        child.material.opacity = 0.5 + Math.sin(clock.getElapsedTime() * 3 + i * 0.5) * 0.5;
      }
    });
  });
  return (
    <group position={position} ref={groupRef}>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} position={[(i - count / 2) * spacing, 0, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#ffd700" toneMapped={false} transparent />
        </mesh>
      ))}
    </group>
  );
}

// ── Slow camera drift ──
function CameraDrift() {
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

  useFrame(({ clock }) => {
    scrollRef.current += (targetRef.current - scrollRef.current) * 0.04;
    const t = scrollRef.current;
    const startZ = ROOM_DEPTH / 2 - 1;
    const endZ = -2;
    const z = startZ + (endZ - startZ) * t;
    const sway = Math.sin(clock.getElapsedTime() * 0.3) * 0.3;
    camera.position.set(sway, 2.5 + t * 1.5, z);
    camera.lookAt(0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2);
  });

  return null;
}

// ── Nightclub Scene ──
function NightclubScene({ onVideoReady }) {
  const neonColors = ['#ff2d78', '#00d4ff', '#39ff14', '#ff6b00', '#ffd700'];
  const sideStills = STILLS.slice(0, 8);

  return (
    <>
      <ambientLight intensity={0.05} />
      <fog attach="fog" args={['#030306', 10, 50]} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[ROOM_WIDTH + 4, ROOM_DEPTH + 10]} />
        <meshStandardMaterial color="#050005" roughness={0.05} metalness={0.98} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, 0]}>
        <planeGeometry args={[ROOM_WIDTH + 4, ROOM_DEPTH + 10]} />
        <meshStandardMaterial color="#020002" roughness={0.9} />
      </mesh>

      {/* Back wall (screen wall) */}
      <mesh position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]}>
        <planeGeometry args={[ROOM_WIDTH + 4, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#060008" roughness={0.8} />
      </mesh>

      {/* Side walls */}
      <mesh position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[ROOM_DEPTH + 10, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#080010" roughness={0.7} />
      </mesh>
      <mesh position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[ROOM_DEPTH + 10, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#080010" roughness={0.7} />
      </mesh>

      {/* ── Curtains flanking screen ── */}
      <Curtain position={[-10.5, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2 + 0.2]} width={1.8} />
      <Curtain position={[10.5, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2 + 0.2]} width={1.8} />

      {/* ── THE FILM SCREEN ── */}
      <FilmScreen position={[0, ROOM_HEIGHT / 2 + 0.5, -ROOM_DEPTH / 2 + 0.15]} onVideoReady={onVideoReady} />

      {/* ── Entrance sign ── */}
      <NeonSign text="漫画クラブ" sub="MANGA NIGHTCLUB" position={[0, ROOM_HEIGHT - 1, ROOM_DEPTH / 2 - 1]} color="#ffd700" size={36} />

      {/* ── Brand neon — flashing color cycle ── */}
      <FlashingBrandSign position={[0, ROOM_HEIGHT - 1.5, -ROOM_DEPTH / 2 + 1]} />

      {/* ── NOW SHOWING sign ── */}
      <NeonSign text="上映中" sub="NOW SHOWING" position={[0, ROOM_HEIGHT - 3.5, -ROOM_DEPTH / 2 + 1]} color="#39ff14" size={20} />

      {/* ── Side neon signs ── */}
      <NeonSign text="映画" sub="CINEMA" position={[-ROOM_WIDTH / 2 + 0.15, 6, -3]} rotation={[0, Math.PI / 2, 0]} color="#ff2d78" size={28} />
      <NeonSign text="夜" sub="NIGHT" position={[ROOM_WIDTH / 2 - 0.15, 6, 2]} rotation={[0, -Math.PI / 2, 0]} color="#00d4ff" size={32} />

      {/* ── 4K neon signs flanking the film screen ── */}
      <NeonSign text="4K" sub="ULTRA HD" position={[-ROOM_WIDTH / 2 + 0.15, 3.5, -6]} rotation={[0, Math.PI / 2, 0]} color="#00d4ff" size={40} />
      <NeonSign text="4K" sub="ULTRA HD" position={[ROOM_WIDTH / 2 - 0.15, 3.5, -6]} rotation={[0, -Math.PI / 2, 0]} color="#00d4ff" size={40} />

      {/* ── Side wall posters ── */}
      {sideStills.map((still, i) => (
        <WallPoster
          key={still.id}
          src={`/androids/stills/${still.file}`}
          position={[
            i < 4 ? -ROOM_WIDTH / 2 + 0.12 : ROOM_WIDTH / 2 - 0.12,
            2.5,
            ROOM_DEPTH / 2 - 4 - (i % 4) * 4
          ]}
          rotation={[0, i < 4 ? Math.PI / 2 : -Math.PI / 2, 0]}
          width={2.5}
          height={1.6}
        />
      ))}

      {/* ── Bulb lights ── */}
      <BulbRow position={[0, ROOM_HEIGHT - 0.3, ROOM_DEPTH / 2 - 0.5]} count={20} spacing={0.85} />
      <BulbRow position={[0, ROOM_HEIGHT - 0.3, -ROOM_DEPTH / 2 + 0.5]} count={16} spacing={0.8} />

      {/* ── Floor neon strips ── */}
      {Array.from({ length: 8 }, (_, i) => (
        <group key={`fstrip-${i}`}>
          <mesh position={[-ROOM_WIDTH / 2 + 0.5, 0.02, ROOM_DEPTH / 2 - 3 - i * 2.5]}>
            <boxGeometry args={[0.04, 0.04, 0.8]} />
            <meshBasicMaterial color={neonColors[i % 5]} toneMapped={false} />
          </mesh>
          <mesh position={[ROOM_WIDTH / 2 - 0.5, 0.02, ROOM_DEPTH / 2 - 3 - i * 2.5]}>
            <boxGeometry args={[0.04, 0.04, 0.8]} />
            <meshBasicMaterial color={neonColors[(i + 2) % 5]} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* ── Ceiling laser lines ── */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={`laser-${i}`} position={[0, ROOM_HEIGHT - 0.2, ROOM_DEPTH / 2 - 4 - i * 3.5]} rotation={[0, 0, Math.PI * (i % 3) * 0.1]}>
          <boxGeometry args={[ROOM_WIDTH, 0.02, 0.02]} />
          <meshBasicMaterial color={neonColors[i % 3]} toneMapped={false} />
        </mesh>
      ))}

      <CameraDrift />
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
          animation: 'ncHintBounce 2s ease infinite',
          textShadow: '0 0 8px rgba(255,215,0,0.4)',
        }}>
          Scroll to enter the nightclub
        </div>
      )}
      <div style={{
        width: '140px', height: '3px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '2px', overflow: 'hidden',
      }}>
        <div style={{
          width: `${progress * 100}%`, height: '100%',
          background: 'linear-gradient(90deg, #ffd700, #ff2d78)',
          borderRadius: '2px', transition: 'width 0.1s',
        }} />
      </div>
    </div>
  );
}

// ═══ MAIN ═══
export default function AndroidsCinema() {
  const filmVideoRef = useRef(null);
  const [soundOn, setSoundOn] = useState(false);

  const handleVideoReady = useCallback((video) => {
    filmVideoRef.current = video;
    // Auto-unmute when entering the nightclub
    video.muted = false;
    video.volume = 0.8;
    video.play().then(() => {
      setSoundOn(true);
    }).catch(() => {
      // Browser blocked autoplay with sound — fall back to muted
      video.muted = true;
      video.play().catch(() => {});
    });
  }, []);

  const toggleSound = useCallback(() => {
    const video = filmVideoRef.current;
    if (!video) return;
    if (soundOn) {
      video.muted = true;
      setSoundOn(false);
    } else {
      video.muted = false;
      video.volume = 0.8;
      video.play().catch(() => {});
      setSoundOn(true);
    }
  }, [soundOn]);

  return (
    <div style={{ background: '#030306' }}>
      <Helmet>
        <title>Manga Nightclub — Porcelain Androids</title>
        <meta name="description" content={FILM.description} />
      </Helmet>

      <div style={{ height: '400vh', position: 'relative' }}>
        <div style={{ position: 'fixed', inset: 0, top: '52px', zIndex: 1 }}>
          <Canvas
            camera={{ fov: 75, near: 0.1, far: 60, position: [0, 3, 8] }}
            gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
            onCreated={({ gl }) => {
              gl.setClearColor('#030306');
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 2;
            }}
          >
            <Suspense fallback={null}>
              <NightclubScene onVideoReady={handleVideoReady} />
            </Suspense>
          </Canvas>
          <ScrollHUD />

          {/* ── Sound toggle ── */}
          <button
            onClick={toggleSound}
            style={{
              position: 'fixed', top: '80px', left: '40px', zIndex: 30,
              background: 'rgba(10,0,15,0.8)', backdropFilter: 'blur(8px)',
              border: `1px solid ${soundOn ? 'rgba(255,45,120,0.5)' : 'rgba(255,255,255,0.15)'}`,
              color: soundOn ? '#ff2d78' : 'rgba(255,255,255,0.4)',
              width: '44px', height: '44px', borderRadius: '50%',
              cursor: 'pointer', fontSize: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s ease',
              boxShadow: soundOn ? '0 0 15px rgba(255,45,120,0.25)' : 'none',
            }}
            title={soundOn ? 'Mute film' : 'Play film audio'}
          >
            {soundOn ? '\u266B' : '\u266A'}
          </button>

        </div>
      </div>

      {/* ── Film edition mint — links to Manifold ── */}
      <div style={{
        position: 'fixed', bottom: '60px', left: '50%', transform: 'translateX(-50%)', zIndex: 30,
      }}>
        <a
          href={MINT_LINKS.filmEdition || '#'}
          target="_blank" rel="noopener noreferrer"
          className="nc-mint-btn"
          onClick={(e) => { if (!MINT_LINKS.filmEdition) e.preventDefault(); }}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
            padding: '16px 28px', background: 'rgba(5,0,8,0.9)', backdropFilter: 'blur(12px)',
            border: `1px solid ${MINT_LINKS.filmEdition ? 'rgba(255,45,120,0.4)' : 'rgba(255,45,120,0.15)'}`,
            borderRadius: '8px', textDecoration: 'none',
            transition: 'all 0.3s',
            opacity: MINT_LINKS.filmEdition ? 1 : 0.6,
            cursor: MINT_LINKS.filmEdition ? 'pointer' : 'default',
          }}
        >
          <span style={{
            fontSize: '24px', fontFamily: 'serif', fontWeight: 900,
            color: '#ff2d78', textShadow: '0 0 12px #ff2d78, 0 0 30px rgba(255,45,120,0.5)',
          }}>リール回収</span>
          <span style={{
            fontSize: '12px', fontFamily: "'Space Mono', monospace",
            letterSpacing: '0.25em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.9)', textShadow: '0 0 8px rgba(255,255,255,0.3)',
          }}>RECOVER THE REEL</span>
          <span style={{
            fontSize: '9px', fontFamily: "'Space Mono', monospace",
            letterSpacing: '0.15em', color: 'rgba(255,255,255,0.6)',
          }}>
            {MINT_LINKS.filmEdition ? '333 EDITIONS · 0.033 ETH' : 'COMING SOON · 333 EDITIONS'}
          </span>
        </a>
      </div>

      <style>{`
        @keyframes ncHintBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .nc-mint-btn {
          animation: ncMintPulse 2.5s ease-in-out infinite;
        }
        .nc-mint-btn:hover {
          animation: none;
          border-color: #ff2d78 !important;
          box-shadow: 0 0 30px rgba(255,45,120,0.3);
          transform: translateY(-2px);
        }
        @keyframes ncMintPulse {
          0%, 100% { box-shadow: 0 0 10px rgba(255,45,120,0.1); }
          50% { box-shadow: 0 0 25px rgba(255,45,120,0.25); }
        }
      `}</style>
    </div>
  );
}
