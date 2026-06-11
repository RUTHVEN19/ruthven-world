import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { STILLS, ANDROIDS_BASE } from '../../config/androidsContent';

// ── JP/EN translations ──
const T = {
  en: {
    title: 'PRINT ARCHIVE',
    subtitle: 'SCROLL TO BROWSE · CLICK TO SELECT · PLAY ANIMATION',
    subtitleGrid: 'CLICK TO SELECT · VIEW LARGE',
    animation: 'PLAY ANIMATION',
    buy: 'ORDER',
    paper: 'This is not merchandise. Scan it and you are inside a classified file from the district. Museum-quality giclée on Hahnemühle Photo Rag 308gsm. A2 format, edition of 50. Signed by Miss AL Simpson.',
    animTitle: 'ANIMATION PREVIEW',
    animDesc: 'Each print carries a hidden animation layer. Scan the code on the back to unlock the classified file.',
    replay: 'REPLAY',
    close: 'CLOSE',
    priceA3: '£300',
    priceA2: '£600',
    editionA3: 'Open Edition',
    editionA2: 'Edition of 50',
    sizeA3: 'A3 · 42 × 30 cm',
    sizeA2: 'A2 · 59 × 42 cm',
    paperShort: 'Giclée on Hahnemühle Photo Rag 308gsm',
    signed: 'Signed by the artist',
    paperA3: 'Museum-quality giclée on Hahnemühle Photo Rag 308gsm. A3 format, open edition. Signed by Miss AL Simpson.',
    paperA2: 'Museum-quality giclée on Hahnemühle Photo Rag 308gsm. A2 format, edition of 50. Signed by Miss AL Simpson. Archival Collectors Edition.',
    viewLarge: 'VIEW LARGE',
    lang: 'JP',
  },
  ja: {
    title: 'プリントアーカイブ',
    subtitle: 'スクロールで閲覧 · クリックで選択 · アニメーション再生',
    subtitleGrid: 'クリックで選択 · 拡大表示',
    animation: 'アニメーション再生',
    buy: '注文',
    paper: 'ハーネミューレ Photo Rag 308gsmにジクレー印刷。A2サイズ（59 × 42 cm）。限定50部。Miss AL Simpson のサイン入り。',
    animTitle: 'アニメーションプレビュー',
    animDesc: '各プリントには隠されたアニメーション層が含まれています。裏面のコードをスキャンして機密ファイルを解除。',
    replay: 'リプレイ',
    close: '閉じる',
    priceA3: '£300',
    priceA2: '£600',
    editionA3: 'オープンエディション',
    editionA2: '限定50部',
    sizeA3: 'A3 · 42 × 30 cm',
    sizeA2: 'A2 · 59 × 42 cm',
    paperShort: 'ジクレー・Photo Rag 308gsm',
    signed: 'アーティストのサイン入り',
    paperA3: 'ハーネミューレ Photo Rag 308gsmにジクレー印刷。A3サイズ。オープンエディション。Miss AL Simpson のサイン入り。',
    paperA2: 'ハーネミューレ Photo Rag 308gsmにジクレー印刷。A2サイズ（59 × 42 cm）。限定50部。Miss AL Simpson のサイン入り。アーカイバルコレクターズエディション。',
    viewLarge: '拡大表示',
    lang: 'EN',
  },
};

// ── Prints for sale — all Porcelain Androids ──
// Build a set of slugs that have manga versions
const MANGA_SLUGS = new Set([
  'blue-cherub-girls', 'blue-cherub-girls-p2', 'blue-manga-reflections', 'blue-manga-reflections-p2',
  'blue-pinky-tech', 'blue-reflections', 'blue-shiny-heart', 'cherub-disco', 'cherub-graffiti-cars',
  'cherub-hunter', 'convertible-blue', 'dance-troupe', 'dj-manga-techy', 'drive-manga',
  'glam-girls', 'glamour-manga', 'glitch-angels', 'graffiti-manga-girl', 'i-heart-cherubs',
  'madame-of-the-porcelain', 'manga-dance-troupe', 'manga-disco-chicks', 'manga-machine-beauties',
  'manga-pop-art', 'manga-twins', 'miss-grassmarket', 'miss-velvet-warnings', 'neon-green-girlies',
  'neon-pink-rainy', 'orange-lovelies', 'orange-manga-girls', 'pink-cherub-veils', 'pink-petal-bomber',
  'pinky-cherub-twins', 'pinky-manga-twins', 'punk-manga', 'queen-green-ghost-taxis',
  'roppongi-taxi-girl', 'roses-are-red', 'rosy-cherub-singers', 'techno-girl', 'the-machine-pixie',
]);
// Slugs that have transformation videos (used as AR activation for prints)
const VIDEO_SLUGS = new Set([
  'blue-cherub-girls', 'blue-cherub-girls-p2', 'blue-manga-reflections', 'blue-manga-reflections-p2',
  'blue-pinky-tech', 'blue-reflections', 'blue-shiny-heart', 'cherub-disco', 'cherub-graffiti-cars',
  'cherub-hunter', 'cherub-pink-car', 'convertible-blue', 'dance-troupe', 'dj-manga-techy', 'drive-manga',
  'glam-girls', 'glamour-manga', 'glitch-angels', 'graffiti-manga-girl', 'i-heart-cherubs',
  'madame-of-the-porcelain', 'manga-dance-troupe', 'manga-disco-chicks', 'manga-machine-beauties',
  'manga-pop-art', 'manga-twins', 'miss-grassmarket', 'miss-velvet-warnings', 'neon-green-girlies',
  'neon-pink-rainy', 'orange-lovelies', 'orange-manga-girls', 'pink-cherub-veils', 'pink-petal-bomber',
  'pinky-cherub-twins', 'pinky-manga-twins', 'punk-manga', 'queen-green-ghost-taxis',
  'roses-are-red', 'rosy-cherub-singers', 'techno-girl', 'the-machine-pixie',
]);
const ANDROID_PRINTS = STILLS.map((s) => {
  const hasManga = MANGA_SLUGS.has(s.id);
  const hasVideo = VIDEO_SLUGS.has(s.id);
  return {
    ...s,
    src: `/androids/stills/${s.file}`,
    thumb: `/androids/stills/thumbs/${s.file.replace('.png', '.jpg')}`,
    manga: hasManga ? `/androids/manga/${s.id}.png` : null,
    mangaThumb: hasManga ? `/androids/manga/thumbs/${s.id}.jpg` : null,
    animation: hasVideo ? `/androids/transformations/${s.id}.mp4` : null,
  };
});


const API = import.meta.env.VITE_API_URL || 'https://diamond-drones.onrender.com/api';

const NEON = ['#ff2d78', '#00d4ff', '#39ff14', '#ff6b00', '#ffd700'];

// ── Checkout Modal ──
function CheckoutModal({ print, tier, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tierLabels = {
    a3_single: { size: 'A3', type: 'Print', price: '£300' },
    a2_single: { size: 'A2', type: 'Archival Collectors Edition', price: '£600' },
    a3_twin:   { size: 'A3', type: 'Manga Machine Twin Set', price: '£500' },
    a2_twin:   { size: 'A2', type: 'Manga Machine Twin Set', price: '£1,000' },
  };
  const info = tierLabels[tier] || tierLabels.a3_single;

  const handleCheckout = async () => {
    if (!email || !email.includes('@')) { setError('Please enter a valid email.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/android-print/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, print_id: print.id, print_title: print.name, tier }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setError(data.error || 'Checkout failed.'); setLoading(false); return; }
      window.location.href = data.checkout_url;
    } catch { setError('Checkout failed. Please try again.'); setLoading(false); }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
      }}
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()} style={{
        width: '90%', maxWidth: '440px',
        border: '1px solid rgba(255,255,255,0.1)',
        background: '#0a0008', padding: 'clamp(28px, 4vw, 44px)',
      }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.4em', color: 'rgba(255,255,255,0.2)', marginBottom: '20px', textTransform: 'uppercase' }}>
          Order Print
        </div>
        <div style={{ fontFamily: '"Anton", sans-serif', fontSize: '22px', letterSpacing: '0.05em', color: '#fff', marginBottom: '4px' }}>
          {print.name}
        </div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '20px' }}>
          {info.size} {info.type} — {info.price}
        </div>

        {/* Preview */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <img src={print.thumb} alt="Porcelain" style={{ height: '80px', objectFit: 'cover', border: '1px solid #ff2d7830', flex: 1 }} />
          {tier.includes('twin') && print.mangaThumb && (
            <img src={print.mangaThumb} alt="Manga" style={{ height: '80px', objectFit: 'cover', border: '1px solid #ffd70030', flex: 1 }} />
          )}
        </div>

        <input
          type="email" placeholder="your@email.com" value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCheckout()}
          style={{
            width: '100%', padding: '14px 16px', marginBottom: '12px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', fontFamily: "'Space Mono', monospace", fontSize: '13px',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
        {error && <div style={{ color: '#ff2d78', fontSize: '12px', fontFamily: "'Space Mono', monospace", marginBottom: '10px' }}>{error}</div>}
        <button
          onClick={handleCheckout}
          disabled={loading}
          style={{
            width: '100%', padding: '16px',
            background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #ff2d78, #ffd700)',
            border: 'none', color: '#fff',
            fontFamily: '"Anton", sans-serif', fontSize: '14px',
            letterSpacing: '0.2em', cursor: loading ? 'wait' : 'pointer',
            transition: 'all 0.3s',
          }}
        >
          {loading ? 'Redirecting to Stripe...' : `Pay ${info.price} — Secure Checkout`}
        </button>
        <button onClick={onClose} style={{
          width: '100%', marginTop: '8px', padding: '12px',
          background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.4)', fontFamily: "'Space Mono', monospace",
          fontSize: '11px', letterSpacing: '0.15em', cursor: 'pointer',
        }}>
          CANCEL
        </button>
      </div>
    </div>
  );
}

// ── 3D Print on wall ──
function PrintFrame({ position, still, index, onSelect }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const texture = useLoader(THREE.TextureLoader, still.src);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const target = hovered ? 0.3 : 0;
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, position[2] + target, delta * 4);
  });

  const col = NEON[index % NEON.length];

  return (
    <group>
      <mesh ref={meshRef} position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onSelect(index)}
      >
        <planeGeometry args={[3.2, 1.8]} />
        <meshBasicMaterial map={texture} toneMapped={false} fog={false} />
      </mesh>
      {/* Neon frame */}
      <mesh position={[position[0], position[1], position[2] - 0.02]}>
        <planeGeometry args={[3.4, 2.0]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={hovered ? 2 : 0.6} toneMapped={false} />
      </mesh>
      {/* Warm overhead glow */}
      {/* Price tag */}
      <Html position={[position[0], position[1] - 1.3, position[2]]} center>
        <div style={{
          fontFamily: "'Space Mono', monospace", fontSize: '10px', letterSpacing: '0.15em',
          color: col, textShadow: `0 0 10px ${col}80`, textTransform: 'uppercase', whiteSpace: 'nowrap',
          textAlign: 'center', pointerEvents: 'none',
        }}>
          <div style={{ fontFamily: '"Anton", sans-serif', fontSize: '12px', marginBottom: '2px', color: '#fff', textShadow: `0 0 12px ${col}90` }}>{still.name}</div>
          <div>A3 · £300 · Open Ed. &nbsp;|&nbsp; A2 · £1,200 · Ed. 50</div>
        </div>
      </Html>
      {/* Coloured glow light */}
      <pointLight position={[position[0], position[1], position[2] + 1.5]} color={col} intensity={hovered ? 3 : 1} distance={5} />
    </group>
  );
}

// ── Gallery room ──
function PrintGallery({ prints, onSelect }) {
  const groupRef = useRef();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handle = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);

  const totalLength = (prints.length - 1) * 3.8 + 20;
  const neonStripCount = Math.ceil(totalLength / 5);

  useFrame((state, delta) => {
    // Use 75% of the scroll range for the gallery walk, leaving buffer before footer
    const maxScroll = (document.documentElement.scrollHeight - window.innerHeight) * 0.75;
    const t = Math.min(scrollY / (maxScroll || 1), 1);
    const targetZ = t * totalLength;
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 8 - targetZ, delta * 3);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 2.5, delta * 2);
    state.camera.lookAt(0, 2.5, state.camera.position.z - 6);
  });

  const positions = prints.map((_, i) => {
    const side = i % 2 === 0 ? -3.2 : 3.2;
    const z = -(i * 3.8);
    return [side, 2.5, z];
  });

  return (
    <group ref={groupRef}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -totalLength / 2]}>
        <planeGeometry args={[11, totalLength + 20]} />
        <meshStandardMaterial color="#0a0008" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5.5, -totalLength / 2]}>
        <planeGeometry args={[11, totalLength + 20]} />
        <meshStandardMaterial color="#0a0008" />
      </mesh>
      <mesh position={[-5, 2.75, -totalLength / 2]}>
        <boxGeometry args={[0.3, 5.5, totalLength + 20]} />
        <meshStandardMaterial color="#0d000a" roughness={0.9} />
      </mesh>
      <mesh position={[5, 2.75, -totalLength / 2]}>
        <boxGeometry args={[0.3, 5.5, totalLength + 20]} />
        <meshStandardMaterial color="#0d000a" roughness={0.9} />
      </mesh>

      {prints.map((still, i) => (
        <PrintFrame key={still.id} position={positions[i]} still={still} index={i} onSelect={onSelect} />
      ))}

      {Array.from({ length: neonStripCount }, (_, i) => (
        <mesh key={`strip-${i}`} position={[0, 5.4, -i * 5]}>
          <boxGeometry args={[9, 0.05, 0.1]} />
          <meshStandardMaterial color="#ff2d78" emissive="#ff2d78" emissiveIntensity={0.8} toneMapped={false} />
        </mesh>
      ))}

      {/* Neon tube lights along walls (visual only, no extra point lights) */}
      {Array.from({ length: Math.ceil(totalLength / 10) }, (_, i) => (
        <group key={`wall-light-${i}`}>
          <mesh position={[-4.7, 4.5, -i * 10]}>
            <boxGeometry args={[0.08, 0.08, 8]} />
            <meshStandardMaterial color="#ff2d78" emissive="#ff2d78" emissiveIntensity={1.5} toneMapped={false} />
          </mesh>
          <mesh position={[4.7, 4.5, -i * 10]}>
            <boxGeometry args={[0.08, 0.08, 8]} />
            <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={1.5} toneMapped={false} />
          </mesh>
        </group>
      ))}

      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 5, 5]} intensity={0.4} color="#fff8f0" />
    </group>
  );
}

function GalleryFog() {
  return <fog attach="fog" args={['#0a0008', 18, 90]} />;
}

// ── Animation Preview overlay ──
function AnimationPreview({ print, index, onClose, t }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const col = NEON[index % NEON.length];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().then(() => setPlaying(true)).catch(() => {});
    const onEnd = () => { setPlaying(false); setEnded(true); };
    video.addEventListener('ended', onEnd);
    return () => video.removeEventListener('ended', onEnd);
  }, []);

  const replay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play().then(() => { setPlaying(true); setEnded(false); }).catch(() => {});
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200, background: '#000',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'relative', width: '100%', maxWidth: '900px',
        aspectRatio: '16/9', margin: '0 auto',
      }}>
        <video
          ref={videoRef}
          src={print.animation}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            border: `2px solid ${col}`,
            boxShadow: `0 0 40px ${col}30`,
          }}
          playsInline
          poster={print.src}
        />
        <div style={{
          position: 'absolute', inset: '-4px',
          border: `1px solid ${col}40`,
          boxShadow: `0 0 20px ${col}20, inset 0 0 20px ${col}10`,
          pointerEvents: 'none',
        }} />
        {!playing && !ended && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)', cursor: 'pointer',
          }} onClick={() => videoRef.current?.play().then(() => setPlaying(true))}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: `${col}30`, border: `2px solid ${col}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 30px ${col}40`,
            }}>
              <div style={{ width: 0, height: 0, borderLeft: `20px solid ${col}`, borderTop: '12px solid transparent', borderBottom: '12px solid transparent', marginLeft: '4px' }} />
            </div>
          </div>
        )}
      </div>

      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, padding: '20px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontFamily: '"Anton", sans-serif', fontSize: '14px', letterSpacing: '0.2em', color: col }}>
            {t.animTitle}
          </div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
            {print.name}
          </div>
        </div>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.1)', border: `1px solid ${col}40`,
          color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer',
          fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {'\u2715'}
        </button>
      </div>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.95), transparent)',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: "'Space Mono', monospace", fontSize: '12px',
          color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, maxWidth: '600px', margin: '0 auto',
        }}>
          {t.animDesc}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
          {ended && (
            <button onClick={replay} style={{
              background: `${col}20`, border: `1px solid ${col}`,
              color: col, padding: '10px 28px', fontFamily: '"Anton", sans-serif',
              fontSize: '14px', letterSpacing: '0.2em', cursor: 'pointer',
            }}>
              {t.replay}
            </button>
          )}
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.5)', padding: '10px 28px', fontFamily: '"Anton", sans-serif',
            fontSize: '14px', letterSpacing: '0.2em', cursor: 'pointer',
          }}>
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Flat Grid View ──
function FlatGrid({ prints, accentColor, onSelect, onViewLarge, viewMode, t }) {
  return (
    <div style={{
      position: 'relative', zIndex: 2,
      padding: 'clamp(24px, 4vw, 60px)',
      paddingTop: '180px',
      maxWidth: '1400px', margin: '0 auto',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 'clamp(16px, 2vw, 28px)',
      }}>
        {prints.map((print, i) => {
          const col = NEON[i % NEON.length];
          return (
            <div
              key={print.id}
              style={{
                position: 'relative',
                background: 'rgba(10,0,15,0.6)',
                border: `1px solid ${col}25`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${col}80`;
                e.currentTarget.style.boxShadow = `0 0 30px ${col}15`;
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = `${col}25`;
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                onClick={() => onSelect(i)}
                style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}
              >
                <img
                  src={viewMode === 'manga' && print.mangaThumb ? print.mangaThumb : print.thumb}
                  alt={print.name}
                  loading="lazy"
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    transition: 'transform 0.4s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
                {print.animation && (
                  <div style={{
                    position: 'absolute', top: '8px', right: '8px',
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                    border: `1px solid ${col}60`,
                    padding: '3px 8px', fontSize: '9px',
                    fontFamily: "'Space Mono', monospace", letterSpacing: '0.15em',
                    color: col,
                  }}>
                    AR
                  </div>
                )}
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{
                  fontFamily: '"Anton", sans-serif', fontSize: '14px',
                  letterSpacing: '0.1em', color: '#fff',
                  marginBottom: '6px',
                }}>
                  {print.name}
                </div>
                <div style={{
                  fontFamily: "'Space Mono', monospace", fontSize: '10px',
                  color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em',
                  marginBottom: '12px',
                }}>
                  A3 {t.priceA3} · {t.editionA3} &nbsp;|&nbsp; A2 {t.priceA2} · {t.editionA2}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onViewLarge(i); }}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: `1px solid ${col}60`,
                      color: col,
                      padding: '8px 12px',
                      fontFamily: '"Anton", sans-serif',
                      fontSize: '11px',
                      letterSpacing: '0.15em',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${col}15`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {t.viewLarge}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelect(i); }}
                    style={{
                      flex: 1,
                      background: `${col}15`,
                      border: `1px solid ${col}40`,
                      color: '#fff',
                      padding: '8px 12px',
                      fontFamily: '"Anton", sans-serif',
                      fontSize: '11px',
                      letterSpacing: '0.15em',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${col}30`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${col}15`; }}
                  >
                    {t.buy}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AndroidsPrintShop() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const artworkParam = searchParams.get('artwork');
  const initialIdx = artworkParam ? ANDROID_PRINTS.findIndex(p => p.id === artworkParam) : null;

  const [selected, setSelected] = useState(initialIdx >= 0 ? initialIdx : null);
  const [animMode, setAnimMode] = useState(false);
  const [viewFull, setViewFull] = useState(false);
  const [lang, setLang] = useState('en');
  const [layout, setLayout] = useState('grid'); // '3d' | 'grid'
  const [viewMode, setViewMode] = useState('porcelain'); // 'porcelain' | 'manga'
  const [checkout, setCheckout] = useState(null); // { print, tier }

  const prints = ANDROID_PRINTS;
  const accentColor = '#ff2d78';
  const t = T[lang];
  const handleSelect = useCallback((idx) => { setSelected(idx); setViewFull(false); }, []);
  const handleViewLarge = useCallback((idx) => { setSelected(idx); setViewFull(true); }, []);
  const print = selected !== null ? prints[selected] : null;

  return (
    <div style={{ position: 'relative', background: '#0a0008', minHeight: '100vh' }}>
      {/* Scroll height for 3D camera walk (only in 3D mode) */}
      {layout === '3d' && <div style={{ height: `${Math.max(400, prints.length * 30)}vh` }} />}

      {/* 3D Gallery */}
      {layout === '3d' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1,
          transition: 'filter 0.6s ease',
        }}>
          <Canvas
            camera={{ fov: 65, near: 0.1, far: 200, position: [0, 2.5, 8] }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
          >
            <GalleryFog />
            <PrintGallery prints={prints} onSelect={handleSelect} />
          </Canvas>
        </div>
      )}

      {/* Flat Grid */}
      {layout === 'grid' && (
        <FlatGrid
          prints={prints}
          accentColor={accentColor}
          onSelect={handleSelect}
          onViewLarge={handleViewLarge}
          viewMode={viewMode}
          t={t}
        />
      )}

      {/* Top controls */}
      <div style={{
        position: 'fixed', top: '70px', left: '20px', right: '20px', zIndex: 15,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        pointerEvents: 'none',
      }}>
        {/* Left controls */}
        <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
          {/* Language toggle */}
          <button
            onClick={() => setLang(l => l === 'en' ? 'ja' : 'en')}
            style={{
              background: 'rgba(10,0,15,0.8)', backdropFilter: 'blur(12px)',
              border: `1px solid ${accentColor}50`, color: accentColor,
              padding: '8px 14px', fontFamily: "'Space Mono', monospace",
              fontSize: '11px', letterSpacing: '0.15em', cursor: 'pointer',
              transition: 'all 0.3s',
            }}
          >
            {t.lang}
          </button>

          {/* View mode toggle — Porcelain / Manga */}
          <div style={{
            display: 'flex', border: `1px solid ${accentColor}40`,
            overflow: 'hidden', background: 'rgba(10,0,15,0.8)',
            backdropFilter: 'blur(12px)',
          }}>
            {[
              { key: 'porcelain', label: 'PORCELAIN' },
              { key: 'manga', label: 'MANGA' },
            ].map(m => (
              <button
                key={m.key}
                onClick={() => setViewMode(m.key)}
                style={{
                  background: viewMode === m.key ? `${accentColor}20` : 'transparent',
                  border: 'none',
                  borderBottom: viewMode === m.key ? `2px solid ${accentColor}` : '2px solid transparent',
                  color: viewMode === m.key ? accentColor : 'rgba(255,255,255,0.35)',
                  padding: '8px 14px', fontFamily: "'Space Mono', monospace",
                  fontSize: '10px', letterSpacing: '0.15em', cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Layout toggle */}
          <div style={{
            display: 'flex', border: `1px solid ${accentColor}40`,
            overflow: 'hidden', background: 'rgba(10,0,15,0.8)',
            backdropFilter: 'blur(12px)',
          }}>
            {[
              { key: '3d', label: '3D' },
              { key: 'grid', label: 'GRID' },
            ].map(l => (
              <button
                key={l.key}
                onClick={() => setLayout(l.key)}
                style={{
                  background: layout === l.key ? `${accentColor}20` : 'transparent',
                  border: 'none',
                  borderBottom: layout === l.key ? `2px solid ${accentColor}` : '2px solid transparent',
                  color: layout === l.key ? accentColor : 'rgba(255,255,255,0.35)',
                  padding: '8px 14px',
                  fontFamily: '"Anton", sans-serif',
                  fontSize: '11px',
                  letterSpacing: '0.15em',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Header */}
      <div style={{
        position: 'fixed', top: '70px', left: 0, right: 0, zIndex: 10,
        textAlign: 'center', pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: "'Noto Sans JP', sans-serif", fontSize: 'clamp(28px, 5vw, 48px)',
          color: accentColor, textShadow: `0 0 30px ${accentColor}80`,
          letterSpacing: '0.1em', transition: 'color 0.4s',
        }}>
          印刷記録
        </div>
        <div style={{
          fontFamily: '"Anton", sans-serif', fontSize: 'clamp(14px, 2.5vw, 22px)',
          letterSpacing: '0.3em', color: 'rgba(255,255,255,0.8)',
          textShadow: `0 0 20px ${accentColor}50`,
        }}>
          {t.title}
        </div>
        <div style={{
          fontFamily: "'Space Mono', monospace", fontSize: '11px', letterSpacing: '0.2em',
          color: 'rgba(255,255,255,0.35)', marginTop: '8px',
        }}>
          {layout === '3d' ? t.subtitle : t.subtitleGrid}
        </div>
      </div>

      {/* Luxury full-screen detail overlay */}
      {print && !animMode && (() => {
        const col = NEON[selected % NEON.length];
        return (
          <div
            onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: 'rgba(5,0,8,0.85)',
              backdropFilter: 'blur(30px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'psFadeIn 0.4s ease',
              cursor: 'default',
              overflowY: 'auto',
              padding: 'clamp(60px, 8vh, 100px) 0',
            }}
          >
            <div style={{
              width: 'min(92vw, 1100px)',
              display: 'flex', gap: 'clamp(28px, 4vw, 50px)',
              alignItems: 'flex-start',
              justifyContent: 'center',
              margin: 'auto',
            }}>
              {/* Large artwork image */}
              <div style={{ position: 'relative', flex: '0 1 auto', maxWidth: '60%' }}>
                {/* Porcelain / Manga toggle on image */}
                {print.manga && (
                  <div style={{
                    display: 'flex', gap: '0', marginBottom: '10px',
                    border: `1px solid ${col}40`, overflow: 'hidden',
                    width: 'fit-content',
                  }}>
                    {['porcelain', 'manga'].map(m => (
                      <button
                        key={m}
                        onClick={() => setViewMode(m)}
                        style={{
                          background: viewMode === m ? `${col}25` : 'rgba(10,0,15,0.8)',
                          border: 'none',
                          borderBottom: viewMode === m ? `2px solid ${col}` : '2px solid transparent',
                          color: viewMode === m ? '#fff' : 'rgba(255,255,255,0.4)',
                          padding: '8px 16px', fontFamily: "'Space Mono', monospace",
                          fontSize: '10px', letterSpacing: '0.15em', cursor: 'pointer',
                          textTransform: 'uppercase',
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
                <img
                  src={viewMode === 'manga' && print.manga ? print.manga : print.src}
                  alt={print.name}
                  onClick={() => setViewFull(true)}
                  style={{
                    width: '100%', maxHeight: '65vh', objectFit: 'cover',
                    border: `2px solid ${col}50`,
                    boxShadow: `0 8px 60px ${col}20, 0 0 120px rgba(0,0,0,0.6)`,
                    cursor: 'zoom-in', transition: 'all 0.3s',
                  }}
                  title="Click to view full size"
                />
                {/* Neon accent line under image */}
                <div style={{
                  height: '2px', marginTop: '2px',
                  background: `linear-gradient(90deg, transparent, ${col}, transparent)`,
                  boxShadow: `0 0 20px ${col}60`,
                }} />
              </div>

              {/* Info panel */}
              <div style={{
                flex: '1 1 35%', minWidth: '260px',
                display: 'flex', flexDirection: 'column', gap: '0',
                paddingTop: '8px',
              }}>
                {/* Title */}
                <div style={{
                  fontFamily: '"Anton", sans-serif', fontSize: 'clamp(28px, 4vw, 44px)',
                  letterSpacing: '0.1em', color: '#fff',
                  textShadow: `0 0 40px ${col}25`,
                  lineHeight: 1.1,
                }}>
                  {print.name}
                </div>

                {/* Artist */}
                <div style={{
                  fontFamily: "'Space Mono', monospace", fontSize: '10px',
                  letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)',
                  marginTop: '10px', textTransform: 'uppercase',
                }}>
                  By Miss AL Simpson
                </div>

                {/* Divider */}
                <div style={{
                  height: '1px', margin: '20px 0',
                  background: `linear-gradient(90deg, ${col}40, rgba(255,255,255,0.08), transparent)`,
                }} />

                {/* A3 Open Edition */}
                <div style={{
                  border: `1px solid ${col}40`,
                  padding: '16px 20px', marginBottom: '12px',
                  background: `${col}08`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontFamily: '"Anton", sans-serif', fontSize: '13px', letterSpacing: '0.15em', color: '#fff' }}>
                        A3 PRINT
                      </div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginTop: '4px' }}>
                        {t.sizeA3} · {t.paperShort} · {t.signed}
                      </div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: `${col}90`, letterSpacing: '0.1em', marginTop: '2px' }}>
                        {t.editionA3}
                      </div>
                    </div>
                    <div style={{
                      fontFamily: '"Anton", sans-serif', fontSize: 'clamp(24px, 3vw, 36px)',
                      color: col, textShadow: `0 0 30px ${col}40`, lineHeight: 1,
                    }}>
                      {t.priceA3}
                    </div>
                  </div>
                  <button onClick={() => setCheckout({ print, tier: 'a3_single' })} style={{
                    width: '100%', marginTop: '12px',
                    background: `linear-gradient(135deg, ${col}, ${NEON[(selected + 1) % NEON.length]})`,
                    border: 'none',
                    color: '#fff', padding: '12px', fontFamily: '"Anton", sans-serif',
                    fontSize: '13px', letterSpacing: '0.2em', cursor: 'pointer',
                    boxShadow: `0 0 20px ${col}25`,
                    transition: 'all 0.3s',
                  }}>
                    {t.buy}
                  </button>
                </div>

                {/* A2 Archival Collectors Edition */}
                <div style={{
                  border: `1px solid #ffd70040`,
                  padding: '16px 20px',
                  background: '#ffd70008',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontFamily: '"Anton", sans-serif', fontSize: '13px', letterSpacing: '0.15em', color: '#fff' }}>
                        A2 ARCHIVAL COLLECTORS EDITION
                      </div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginTop: '4px' }}>
                        {t.sizeA2} · {t.paperShort} · {t.signed}
                      </div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#ffd70090', letterSpacing: '0.1em', marginTop: '2px' }}>
                        {t.editionA2}
                      </div>
                    </div>
                    <div style={{
                      fontFamily: '"Anton", sans-serif', fontSize: 'clamp(24px, 3vw, 36px)',
                      color: '#ffd700', textShadow: '0 0 30px #ffd70040', lineHeight: 1,
                    }}>
                      {t.priceA2}
                    </div>
                  </div>
                  <button onClick={() => setCheckout({ print, tier: 'a2_single' })} style={{
                    width: '100%', marginTop: '12px',
                    background: 'linear-gradient(135deg, #ffd700, #ff6b00)',
                    border: 'none',
                    color: '#fff', padding: '12px', fontFamily: '"Anton", sans-serif',
                    fontSize: '13px', letterSpacing: '0.2em', cursor: 'pointer',
                    boxShadow: '0 0 20px #ffd70025',
                    transition: 'all 0.3s',
                  }}>
                    {t.buy}
                  </button>
                </div>

                {/* Machine Twin Deal — porcelain + manga bundle */}
                {print.manga && (
                  <div style={{
                    position: 'relative',
                    border: '1px solid #ff2d7850',
                    padding: '16px 20px', marginTop: '12px',
                    background: 'linear-gradient(135deg, #ff2d7808, #ffd70008)',
                    overflow: 'hidden',
                  }}>
                    {/* Deal badge */}
                    <div style={{
                      position: 'absolute', top: '0', right: '0',
                      background: 'linear-gradient(135deg, #ff2d78, #ffd700)',
                      padding: '3px 12px',
                      fontFamily: "'Space Mono', monospace", fontSize: '8px',
                      letterSpacing: '0.15em', color: '#fff',
                    }}>
                      MACHINE DEAL
                    </div>
                    <div style={{ fontFamily: '"Anton", sans-serif', fontSize: '13px', letterSpacing: '0.15em', color: '#fff' }}>
                      MANGA MACHINE TWINS
                    </div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', marginTop: '4px' }}>
                      Porcelain + Manga · Both prints · Same android
                    </div>
                    {/* Twin preview */}
                    <div style={{ display: 'flex', gap: '6px', margin: '10px 0', height: '50px' }}>
                      <img src={print.thumb} alt="Porcelain" style={{ height: '100%', objectFit: 'cover', border: '1px solid #ff2d7830', flex: 1 }} />
                      <img src={print.mangaThumb} alt="Manga" style={{ height: '100%', objectFit: 'cover', border: '1px solid #ffd70030', flex: 1 }} />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>
                            A3 Twin Set
                          </div>
                          <div style={{ fontFamily: '"Anton", sans-serif', fontSize: '20px', color: '#ff2d78', lineHeight: 1 }}>
                            £500
                          </div>
                        </div>
                        <button onClick={() => setCheckout({ print, tier: 'a3_twin' })} style={{
                          width: '100%', marginTop: '8px',
                          background: 'linear-gradient(135deg, #ff2d78, #ff6b00)',
                          border: 'none',
                          color: '#fff', padding: '10px', fontFamily: '"Anton", sans-serif',
                          fontSize: '11px', letterSpacing: '0.2em', cursor: 'pointer',
                          transition: 'all 0.3s',
                        }}>
                          {t.buy}
                        </button>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>
                            A2 Twin Set
                          </div>
                          <div style={{ fontFamily: '"Anton", sans-serif', fontSize: '20px', color: '#ffd700', lineHeight: 1 }}>
                            £1,000
                          </div>
                        </div>
                        <button onClick={() => setCheckout({ print, tier: 'a2_twin' })} style={{
                          width: '100%', marginTop: '8px',
                          background: 'linear-gradient(135deg, #ffd700, #ff2d78)',
                          border: 'none',
                          color: '#fff', padding: '10px', fontFamily: '"Anton", sans-serif',
                          fontSize: '11px', letterSpacing: '0.2em', cursor: 'pointer',
                          transition: 'all 0.3s',
                        }}>
                          {t.buy}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                  <button onClick={() => setViewFull(true)} style={{
                    flex: 1,
                    background: 'transparent', border: `1px solid ${col}50`,
                    color: col, padding: '14px 20px', fontFamily: '"Anton", sans-serif',
                    fontSize: '12px', letterSpacing: '0.2em', cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}>
                    {t.viewLarge}
                  </button>
                  {print.animation && (
                    <button onClick={() => setAnimMode(true)} style={{
                      flex: 1,
                      background: 'transparent', border: `1px solid ${col}40`,
                      color: col, padding: '14px 20px', fontFamily: '"Anton", sans-serif',
                      fontSize: '12px', letterSpacing: '0.2em', cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}>
                      {t.animation}
                    </button>
                  )}
                </div>
                {print.mintable && (
                  <button
                    onClick={() => navigate(`${ANDROIDS_BASE}/manga-machine?android=${print.mintable}`)}
                    style={{
                      width: '100%', marginTop: '12px',
                      background: 'transparent',
                      border: `1px solid #ff2d7860`,
                      color: '#ff2d78', padding: '14px 20px',
                      fontFamily: '"Anton", sans-serif',
                      fontSize: '12px', letterSpacing: '0.2em', cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#ff2d7815'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    ENTER THE MACHINE
                  </button>
                )}
              </div>
            </div>

            {/* Close button */}
            <button onClick={() => setSelected(null)} style={{
              position: 'absolute', top: '24px', right: '28px',
              background: 'rgba(255,255,255,0.06)', border: `1px solid ${col}30`,
              color: 'rgba(255,255,255,0.5)', width: '44px', height: '44px', borderRadius: '50%',
              fontSize: '20px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s',
            }}>
              ✕
            </button>
          </div>
        );
      })()}

      {/* Full-screen image lightbox */}
      {viewFull && print && (
        <div
          onClick={() => setViewFull(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
          }}
        >
          <img
            src={viewMode === 'manga' && print.manga ? print.manga : print.src}
            alt={print.name}
            style={{
              maxWidth: '92vw', maxHeight: '88vh', objectFit: 'contain',
              border: `2px solid ${NEON[selected % NEON.length]}40`,
              boxShadow: `0 0 60px ${NEON[selected % NEON.length]}20`,
            }}
          />
          <div style={{
            position: 'absolute', bottom: '24px', left: 0, right: 0,
            textAlign: 'center', pointerEvents: 'none',
          }}>
            <div style={{
              fontFamily: '"Anton", sans-serif', fontSize: '18px',
              letterSpacing: '0.15em', color: '#fff',
              textShadow: '0 0 20px rgba(0,0,0,0.8)',
            }}>
              {print.name}
            </div>
            <div style={{
              fontFamily: "'Space Mono', monospace", fontSize: '10px',
              color: 'rgba(255,255,255,0.4)', marginTop: '6px',
              letterSpacing: '0.15em',
            }}>
              A3 {t.priceA3} · {t.editionA3} &nbsp;|&nbsp; A2 {t.priceA2} · {t.editionA2}
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setViewFull(false); }}
            style={{
              position: 'absolute', top: '20px', right: '24px',
              background: 'rgba(255,255,255,0.1)', border: `1px solid ${NEON[selected % NEON.length]}40`,
              color: '#fff', width: '40px', height: '40px', borderRadius: '50%',
              cursor: 'pointer', fontSize: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Animation Mode */}
      {animMode && print && (
        <AnimationPreview print={print} index={selected} onClose={() => setAnimMode(false)} t={t} />
      )}

      {/* Checkout Modal */}
      {checkout && (
        <CheckoutModal print={checkout.print} tier={checkout.tier} onClose={() => setCheckout(null)} />
      )}

      <style>{`
        @keyframes psFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
