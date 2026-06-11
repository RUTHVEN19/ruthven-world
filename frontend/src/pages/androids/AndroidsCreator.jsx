import { useState, useEffect, useRef, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { STILLS } from '../../config/androidsContent';

// ── Layout ──
const ROOM_W = 14;
const ROOM_D = 20;
const ROOM_H = 9;

// ── Wall Poster ──
function WallPoster({ src, position, rotation, width = 2, height = 1.3 }) {
  const [texture, setTexture] = useState(null);
  useEffect(() => {
    new THREE.TextureLoader().load(src, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      setTexture(tex);
    });
  }, [src]);
  if (!texture) return null;
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[width + 0.12, height + 0.12]} />
        <meshBasicMaterial color="#ff2d78" toneMapped={false} transparent opacity={0.08} />
      </mesh>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
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

// ── Camera ──
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

  useFrame(({ clock }) => {
    scrollRef.current += (targetRef.current - scrollRef.current) * 0.05;
    const t = scrollRef.current;
    const startZ = ROOM_D / 2 - 2;
    const endZ = -ROOM_D / 2 + 4;
    const z = startZ + (endZ - startZ) * t;
    const sway = Math.sin(clock.getElapsedTime() * 0.3) * 0.2;
    camera.position.set(sway, 2.2, z);
    camera.lookAt(sway * 0.3, 2.5, z - 6);
  });

  return null;
}

// ── Studio Scene ──
function StudioScene() {
  const neonColors = ['#ff2d78', '#00d4ff', '#39ff14', '#ff6b00', '#ffd700'];
  const portraitStills = STILLS.slice(0, 12);

  return (
    <>
      <ambientLight intensity={0.08} />
      <fog attach="fog" args={['#040408', 8, 30]} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[ROOM_W + 4, ROOM_D + 10]} />
        <meshStandardMaterial color="#060004" roughness={0.08} metalness={0.95} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_H, 0]}>
        <planeGeometry args={[ROOM_W + 4, ROOM_D + 10]} />
        <meshStandardMaterial color="#020002" roughness={0.9} />
      </mesh>

      {/* Walls */}
      <mesh position={[-ROOM_W / 2, ROOM_H / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[ROOM_D + 10, ROOM_H]} />
        <meshStandardMaterial color="#0a0012" roughness={0.7} />
      </mesh>
      <mesh position={[ROOM_W / 2, ROOM_H / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[ROOM_D + 10, ROOM_H]} />
        <meshStandardMaterial color="#0a0012" roughness={0.7} />
      </mesh>
      <mesh position={[0, ROOM_H / 2, -ROOM_D / 2]}>
        <planeGeometry args={[ROOM_W + 4, ROOM_H]} />
        <meshStandardMaterial color="#080010" roughness={0.7} />
      </mesh>

      {/* ── Entrance sign ── */}
      <NeonSign text="創造者" sub="THE CREATOR" position={[0, ROOM_H - 1, ROOM_D / 2 - 1]} color="#ff2d78" size={40} />

      {/* ── Side signs ── */}
      <NeonSign text="芸術家" sub="ARTIST" position={[-ROOM_W / 2 + 0.15, ROOM_H - 2, 2]} rotation={[0, Math.PI / 2, 0]} color="#ffd700" size={28} />
      <NeonSign text="物語" sub="STORY" position={[ROOM_W / 2 - 0.15, ROOM_H - 2, -3]} rotation={[0, -Math.PI / 2, 0]} color="#00d4ff" size={30} />
      <NeonSign text="世界" sub="WORLD" position={[-ROOM_W / 2 + 0.15, ROOM_H - 2, -8]} rotation={[0, Math.PI / 2, 0]} color="#39ff14" size={26} />

      {/* ── Wall posters — portfolio pieces ── */}
      {portraitStills.map((still, i) => (
        <WallPoster
          key={still.id}
          src={`/androids/stills/${still.file}`}
          position={[
            i < 6 ? -ROOM_W / 2 + 0.12 : ROOM_W / 2 - 0.12,
            1.8 + (i % 2) * 2.5,
            ROOM_D / 2 - 4 - (i % 6) * 3
          ]}
          rotation={[0, i < 6 ? Math.PI / 2 : -Math.PI / 2, 0]}
          width={2.2}
          height={1.4}
        />
      ))}

      {/* ── Floor neon strips ── */}
      {Array.from({ length: 8 }, (_, i) => (
        <group key={`fs-${i}`}>
          <mesh position={[-ROOM_W / 2 + 0.3, 0.02, ROOM_D / 2 - 3 - i * 2.5]}>
            <boxGeometry args={[0.04, 0.04, 0.5]} />
            <meshBasicMaterial color={neonColors[i % 5]} toneMapped={false} />
          </mesh>
          <pointLight position={[-ROOM_W / 2 + 0.5, 0.1, ROOM_D / 2 - 3 - i * 2.5]} color={neonColors[i % 5]} intensity={0.6} distance={3} decay={2} />
          <mesh position={[ROOM_W / 2 - 0.3, 0.02, ROOM_D / 2 - 3 - i * 2.5]}>
            <boxGeometry args={[0.04, 0.04, 0.5]} />
            <meshBasicMaterial color={neonColors[(i + 2) % 5]} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* ── Ceiling neon tubes ── */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={`ct-${i}`} position={[0, ROOM_H - 0.15, ROOM_D / 2 - 3 - i * 3.5]}>
          <boxGeometry args={[ROOM_W, 0.03, 0.03]} />
          <meshBasicMaterial color={neonColors[i % 3]} toneMapped={false} />
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
          animation: 'creatorHintBounce 2s ease infinite',
          textShadow: '0 0 8px rgba(255,45,120,0.4)',
        }}>
          Scroll to enter the studio
        </div>
      )}
      <div style={{
        width: '140px', height: '3px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '2px', overflow: 'hidden',
      }}>
        <div style={{
          width: `${progress * 100}%`, height: '100%',
          background: 'linear-gradient(90deg, #ff2d78, #ffd700)',
          borderRadius: '2px', transition: 'width 0.1s',
        }} />
      </div>
    </div>
  );
}

// ═══ MAIN ═══
export default function AndroidsCreator() {
  return (
    <div style={{ background: '#040408' }}>
      <Helmet>
        <title>The Creator — Porcelain Androids</title>
        <meta name="description" content="Meet Miss AL Simpson — the artist behind Porcelain Androids and The Manga Machine." />
      </Helmet>

      {/* 3D background studio */}
      <div style={{ height: '400vh', position: 'relative' }}>
        <div style={{ position: 'fixed', inset: 0, top: '52px', zIndex: 1 }}>
          <Canvas
            camera={{ fov: 60, near: 0.1, far: 50, position: [0, 2.2, 8] }}
            gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
            onCreated={({ gl }) => {
              gl.setClearColor('#040408');
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.8;
            }}
          >
            <Suspense fallback={null}>
              <StudioScene />
            </Suspense>
          </Canvas>
          <ScrollHUD />
        </div>
      </div>

      {/* ── Content overlay — frosted glass panels ── */}
      <div className="creator-overlay">
        {/* Hero */}
        <div className="creator-panel creator-hero">
          <div className="creator-kanji">創造者</div>
          <div className="creator-title">THE CREATOR</div>
          <div className="creator-subtitle">Miss AL Simpson</div>
        </div>

        {/* About the artist */}
        <div className="creator-panel">
          <div className="creator-section-k">芸術家</div>
          <div className="creator-section-en">THE ARTIST</div>
          <p className="creator-text">
            Miss AL Simpson is a cryptoartist and AI filmmaker based in the UK. Her work exists at the intersection of artificial intelligence, fashion photography, and Japanese visual culture.
          </p>
          <p className="creator-text">
            Trained in photography and digital art, she creates AI-generated characters that blur the line between human beauty and machine precision — porcelain skin, impossible proportions, neon-drenched worlds.
          </p>
          <p className="creator-text">
            Her practice explores what happens when technology becomes the artist's brush, and the canvas is infinite.
          </p>
        </div>

        {/* About the androids */}
        <div className="creator-panel">
          <div className="creator-section-k">磁器人形</div>
          <div className="creator-section-en">PORCELAIN ANDROIDS</div>
          <p className="creator-text">
            The Porcelain Androids are AI-generated influencers — digital beings who exist somewhere between couture model, anime character, and uncanny valley dreamgirl.
          </p>
          <p className="creator-text">
            Each android is crafted through a process of AI image generation, curation, and aesthetic refinement. They wear haute couture, pose in Roppongi nightclubs, and stare at you with the blank perfection of a porcelain doll.
          </p>
          <p className="creator-text">
            They are not real. They never were. That's the point.
          </p>
        </div>

        {/* About the manga machine */}
        <div className="creator-panel">
          <div className="creator-section-k">マンガマシン</div>
          <div className="creator-section-en">THE MANGA MACHINE</div>
          <p className="creator-text">
            The Manga Machine is a short film that tells the story of the Porcelain Androids visiting a Tokyo nightclub and discovering a mysterious arcade machine that transforms them into manga characters.
          </p>
          <p className="creator-text">
            Part art film, part interactive experience, part NFT collection — The Manga Machine is a portal into a world where AI characters become art, and art becomes collectible.
          </p>
        </div>

        {/* Vision */}
        <div className="creator-panel">
          <div className="creator-section-k">未来</div>
          <div className="creator-section-en">THE VISION</div>
          <p className="creator-text">
            Porcelain Androids is more than a collection. It's a world — a nightclub you walk through, a machine you interact with, a graffiti wall you discover. Every zone is an immersive 3D experience built to be explored.
          </p>
          <p className="creator-text" style={{ color: 'rgba(255,45,120,0.8)', fontStyle: 'italic' }}>
            Made by machine. Made forever.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes creatorHintBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }

        .creator-overlay {
          position: fixed; top: 52px; bottom: 0; left: 0; right: 0;
          z-index: 10; overflow-y: auto;
          display: flex; flex-direction: column; align-items: center;
          padding: clamp(40px, 8vw, 80px) clamp(16px, 4vw, 40px);
          gap: clamp(24px, 4vw, 40px);
          pointer-events: none;
        }

        .creator-panel {
          pointer-events: auto;
          max-width: 560px; width: 100%;
          background: rgba(10,0,18,0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,45,120,0.2);
          border-radius: 12px;
          padding: clamp(24px, 4vw, 40px);
          box-shadow: 0 0 40px rgba(255,45,120,0.06);
        }
        .creator-panel:hover {
          border-color: rgba(255,45,120,0.35);
          box-shadow: 0 0 60px rgba(255,45,120,0.1);
        }

        .creator-hero {
          text-align: center;
          padding: clamp(40px, 6vw, 60px) clamp(24px, 4vw, 40px);
        }
        .creator-kanji {
          font-size: clamp(40px, 8vw, 64px);
          font-weight: 900; font-family: serif;
          color: #ff2d78;
          text-shadow: 0 0 15px #ff2d78, 0 0 40px rgba(255,45,120,0.5);
          letter-spacing: 0.1em;
        }
        .creator-title {
          font-size: clamp(10px, 1.5vw, 13px);
          font-family: 'Space Mono', monospace;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          color: rgba(0,212,255,0.6);
          margin-top: 8px;
        }
        .creator-subtitle {
          font-size: clamp(18px, 3vw, 28px);
          font-family: 'Anton', 'Impact', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: rgba(255,255,255,0.8);
          margin-top: clamp(16px, 3vw, 28px);
          text-shadow: 0 0 10px rgba(255,215,0,0.3);
        }

        .creator-section-k {
          font-size: clamp(24px, 4vw, 34px);
          font-weight: 900; font-family: serif;
          color: #ff2d78;
          text-shadow: 0 0 10px #ff2d78;
          letter-spacing: 0.08em;
        }
        .creator-section-en {
          font-size: clamp(9px, 1.2vw, 11px);
          font-family: 'Space Mono', monospace;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: rgba(0,212,255,0.5);
          margin-top: 4px;
          margin-bottom: clamp(16px, 3vw, 24px);
        }

        .creator-text {
          font-size: clamp(13px, 1.5vw, 15px);
          font-family: 'Space Mono', monospace;
          line-height: 1.8;
          color: rgba(255,255,255,0.6);
          letter-spacing: 0.02em;
          margin: 0 0 16px 0;
        }
        .creator-text:last-child { margin-bottom: 0; }
      `}</style>
    </div>
  );
}
