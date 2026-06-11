import { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { STILLS } from '../../config/androidsContent';

const NEON = ['#ff2d78', '#00d4ff', '#39ff14', '#ff6b00', '#ffd700'];

// ── Social accounts ──
const SOCIALS = [
  { platform: 'X', handle: '@PorcelAndroid', url: 'https://x.com/PorcelAndroid', icon: '\uD835\uDD4F', color: '#fff' },
  { platform: 'Instagram', handle: '@porcelain_android', url: 'https://www.instagram.com/porcelain_android/', icon: 'IG', color: '#E1306C' },
];

// ── Floating screen in 3D ──
function FloatingScreen({ position, imageFile, index, time }) {
  const meshRef = useRef();
  const col = NEON[index % NEON.length];

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.position.y = position[1] + Math.sin(time.current + index * 0.7) * 0.15;
    meshRef.current.rotation.y = Math.sin(time.current * 0.3 + index * 0.5) * 0.08;
  });

  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return loader.load(`/androids/stills/${imageFile}`);
  }, [imageFile]);

  return (
    <group ref={meshRef} position={position}>
      {/* Screen frame glow */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[2.3, 2.3]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.4} toneMapped={false} transparent opacity={0.6} />
      </mesh>
      {/* Image */}
      <mesh>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial map={texture} toneMapped={false} />
      </mesh>
      {/* Neon light */}
      <pointLight position={[0, 0, 1]} color={col} intensity={1.5} distance={4} />
    </group>
  );
}

// ── Social wall 3D scene ──
function SocialWallScene() {
  const timeRef = useRef(0);
  const groupRef = useRef();

  useFrame((state, delta) => {
    timeRef.current += delta;
    // Slow camera drift
    state.camera.position.x = Math.sin(timeRef.current * 0.1) * 2;
    state.camera.position.y = 3 + Math.sin(timeRef.current * 0.15) * 0.5;
    state.camera.lookAt(0, 2, -5);
  });

  // Create a wall of floating screens using stills
  const screens = useMemo(() => {
    const items = [];
    const cols = 5;
    const rows = 4;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = (r * cols + c) % STILLS.length;
        items.push({
          position: [
            (c - (cols - 1) / 2) * 2.8,
            r * 2.8 + 1,
            -8 - Math.random() * 3,
          ],
          still: STILLS[idx],
          index: r * cols + c,
        });
      }
    }
    return items;
  }, []);

  return (
    <>
      {/* Screens */}
      {screens.map((s, i) => (
        <FloatingScreen key={i} position={s.position} imageFile={s.still.file} index={s.index} time={timeRef} />
      ))}

      {/* Floor reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -5]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#050005" roughness={0.1} metalness={0.95} />
      </mesh>

      {/* Ambient neon strips on floor */}
      {NEON.map((col, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[(i - 2) * 3, -0.45, -5]}>
          <planeGeometry args={[0.05, 20]} />
          <meshStandardMaterial color={col} emissive={col} emissiveIntensity={2} toneMapped={false} />
        </mesh>
      ))}

      <ambientLight intensity={0.08} />
      <pointLight position={[0, 8, 0]} color="#ff2d78" intensity={2} distance={20} />
    </>
  );
}

// ── Feed card component ──
function FeedCard({ image, caption, platform, likes, color, delay }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div ref={ref} style={{
      background: 'rgba(10,0,15,0.85)',
      backdropFilter: 'blur(20px)',
      border: `1px solid ${color}30`,
      overflow: 'hidden',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
      transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden' }}>
        <img src={`/androids/stills/${image}`} alt={caption}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />
        <div style={{
          position: 'absolute', top: '8px', left: '8px',
          background: `${color}30`, backdropFilter: 'blur(8px)',
          padding: '4px 10px', fontFamily: "'Space Mono', monospace",
          fontSize: '9px', letterSpacing: '0.15em', color,
          textTransform: 'uppercase', border: `1px solid ${color}40`,
        }}>
          {platform}
        </div>
      </div>
      <div style={{ padding: '14px' }}>
        <div style={{
          fontFamily: "'Space Mono', monospace", fontSize: '11px',
          lineHeight: 1.6, color: 'rgba(255,255,255,0.6)',
        }}>
          {caption}
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: '10px', fontFamily: "'Space Mono', monospace", fontSize: '10px',
          color: 'rgba(255,255,255,0.3)',
        }}>
          <span>{'\u2661'} {likes}</span>
          <span style={{ color, letterSpacing: '0.1em' }}>VIEW POST</span>
        </div>
      </div>
    </div>
  );
}

// ── Mock feed data ──
const FEED_POSTS = [
  { image: 'manga-machine-party.png', caption: 'The Manga Machine is open. Who\'s coming in? #MangaMachine #PorcelainAndroids', platform: 'X', likes: '2.4K', color: '#fff' },
  { image: 'cherub-disco.png', caption: 'Cherubs hit the disco floor. New drop loading... #AIart #Manga', platform: 'INSTAGRAM', likes: '5.1K', color: '#E1306C' },
  { image: 'neon-dancers.png', caption: 'When the machine transforms you into manga #aiart #MangaMachine', platform: 'INSTAGRAM', likes: '8.2K', color: '#E1306C' },
  { image: 'graffiti-babes.png', caption: 'Street art meets manga. The walls are alive. #GraffitiManga', platform: 'X', likes: '1.8K', color: '#fff' },
  { image: 'blue-shiny-heart.png', caption: 'Blue heart energy. The androids are feeling it. #PorcelainAndroids', platform: 'INSTAGRAM', likes: '3.7K', color: '#E1306C' },
  { image: 'manga-pop-art.png', caption: 'Pop art porcelain. These girls are everywhere #manga #art', platform: 'X', likes: '2.5K', color: '#fff' },
  { image: 'dance-troupe.png', caption: 'The dance troupe has entered the building #NightclubVibes', platform: 'X', likes: '3.2K', color: '#fff' },
  { image: 'green-goddess.png', caption: 'Green Goddess era. New aesthetic unlocked. #AIinfluencer', platform: 'INSTAGRAM', likes: '4.9K', color: '#E1306C' },
  { image: 'manga-twins.png', caption: 'Double trouble in the manga dimension #twins #PorcelainAndroids', platform: 'INSTAGRAM', likes: '4.1K', color: '#E1306C' },
  { image: 'convertible-blue.png', caption: 'Cruising through the neon city. Top down. #PorcelainAndroids', platform: 'X', likes: '2.1K', color: '#fff' },
  { image: 'pink-bluey.png', caption: 'Pink + blue = the porcelain palette #aesthetics', platform: 'INSTAGRAM', likes: '6.3K', color: '#E1306C' },
  { image: 'techno-girl.png', caption: 'Techno girl loading... The machine never sleeps #techno', platform: 'X', likes: '1.7K', color: '#fff' },
];

export default function AndroidsSocial() {
  const [filter, setFilter] = useState('ALL');

  const filtered = filter === 'ALL'
    ? FEED_POSTS
    : FEED_POSTS.filter(p => p.platform === filter);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* 3D Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1 }}>
        <Canvas
          camera={{ fov: 60, near: 0.1, far: 50, position: [0, 3, 8] }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.7 }}
        >
          <SocialWallScene />
        </Canvas>
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, padding: 'clamp(24px, 4vw, 60px)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', paddingTop: 'clamp(20px, 4vh, 60px)', marginBottom: 'clamp(32px, 5vw, 64px)' }}>
          <div style={{
            fontFamily: "'Noto Sans JP', sans-serif", fontSize: 'clamp(32px, 6vw, 56px)',
            color: '#ff2d78', textShadow: '0 0 30px rgba(255,45,120,0.5)',
            letterSpacing: '0.1em',
          }}>
            {'\u793E\u4F1A\u58C1'}
          </div>
          <div style={{
            fontFamily: '"Anton", sans-serif', fontSize: 'clamp(16px, 3vw, 28px)',
            letterSpacing: '0.35em', color: 'rgba(255,255,255,0.85)',
            textShadow: '0 0 20px rgba(255,45,120,0.3)',
          }}>
            SOCIAL WALL
          </div>
          <div style={{
            fontFamily: "'Space Mono', monospace", fontSize: '11px', letterSpacing: '0.25em',
            color: 'rgba(255,255,255,0.35)', marginTop: '8px',
          }}>
            THE ANDROIDS ARE EVERYWHERE
          </div>
        </div>

        {/* Social account pills */}
        <div style={{
          display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap',
          marginBottom: 'clamp(24px, 3vw, 40px)',
        }}>
          {SOCIALS.map(s => (
            <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer"
              style={{
                background: 'rgba(10,0,15,0.8)', backdropFilter: 'blur(16px)',
                border: `1px solid ${s.color}40`, padding: '12px 24px',
                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px',
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = s.color; e.currentTarget.style.boxShadow = `0 0 20px ${s.color}30`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${s.color}40`; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <span style={{
                fontFamily: "'Space Mono', monospace", fontSize: '16px', color: s.color,
              }}>
                {s.icon}
              </span>
              <div>
                <div style={{
                  fontFamily: '"Anton", sans-serif', fontSize: '13px',
                  letterSpacing: '0.15em', color: '#fff',
                }}>
                  {s.platform.toUpperCase()}
                </div>
                <div style={{
                  fontFamily: "'Space Mono', monospace", fontSize: '10px',
                  color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em',
                }}>
                  {s.handle}
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{
          display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '32px',
        }}>
          {['ALL', 'X', 'INSTAGRAM'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                background: filter === f ? 'rgba(255,45,120,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${filter === f ? 'rgba(255,45,120,0.4)' : 'rgba(255,255,255,0.06)'}`,
                color: filter === f ? '#ff2d78' : 'rgba(255,255,255,0.35)',
                padding: '8px 20px', fontFamily: '"Anton", sans-serif',
                fontSize: '12px', letterSpacing: '0.2em', cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Feed grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(240px, 25vw, 300px), 1fr))',
          gap: 'clamp(12px, 2vw, 20px)',
          maxWidth: '1300px', margin: '0 auto',
        }}>
          {filtered.map((post, i) => (
            <FeedCard key={`${post.platform}-${post.image}`} {...post} delay={i * 100} />
          ))}
        </div>

        {/* CTA */}
        <div style={{
          textAlign: 'center', marginTop: 'clamp(48px, 6vw, 80px)',
          padding: '40px', background: 'rgba(10,0,15,0.7)',
          backdropFilter: 'blur(20px)', border: '1px solid rgba(255,45,120,0.1)',
          maxWidth: '600px', margin: 'clamp(48px, 6vw, 80px) auto 0',
        }}>
          <div style={{
            fontFamily: "'Noto Sans JP', sans-serif", fontSize: '28px',
            color: '#ff2d78', textShadow: '0 0 15px rgba(255,45,120,0.4)',
          }}>
            {'\u53C2\u52A0'}
          </div>
          <div style={{
            fontFamily: '"Anton", sans-serif', fontSize: '20px',
            letterSpacing: '0.25em', color: '#fff', marginTop: '4px',
          }}>
            JOIN THE MACHINE
          </div>
          <p style={{
            fontFamily: "'Space Mono', monospace", fontSize: '12px',
            lineHeight: 1.8, color: 'rgba(255,255,255,0.45)',
            marginTop: '12px',
          }}>
            Follow the Porcelain Androids across all platforms. Tag #PorcelainAndroids or #MangaMachine to be featured on this wall.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
            {SOCIALS.map(s => (
              <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer"
                style={{
                  background: `linear-gradient(135deg, ${s.color}, ${s.color}80)`,
                  border: 'none', color: s.platform === 'X' ? '#000' : '#fff',
                  padding: '12px 24px', fontFamily: '"Anton", sans-serif',
                  fontSize: '13px', letterSpacing: '0.2em', textDecoration: 'none',
                  boxShadow: `0 0 20px ${s.color}30`,
                }}
              >
                FOLLOW ON {s.platform.toUpperCase()}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
