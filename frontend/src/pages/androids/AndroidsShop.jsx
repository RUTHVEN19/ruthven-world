import { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { STILLS, TRANSFORMATIONS } from '../../config/androidsContent';

// ── Art sources ──
const ANDROID_ART = STILLS.map(s => ({ id: s.id, name: s.name, src: `/androids/stills/${s.file}` }));
const MANGA_ART = TRANSFORMATIONS.map(t => ({ id: `manga-${t.id}`, name: t.label, src: t.manga }));

// ── Bomber jacket clip-paths ──
const JACKET_CLIP_CROPPED = `polygon(
  50% 0%,
  38% 2%, 28% 5%, 18% 8%, 8% 12%, 0% 18%,
  0% 45%, 3% 48%, 8% 48%, 12% 45%, 15% 42%,
  15% 95%, 18% 100%, 82% 100%, 85% 95%,
  85% 42%, 88% 45%, 92% 48%, 97% 48%, 100% 45%,
  100% 18%, 92% 12%, 82% 8%, 72% 5%, 62% 2%
)`;

// Oversized — wider shoulders, longer body, dropped sleeves
const JACKET_CLIP_OVERSIZED = `polygon(
  50% 0%,
  40% 1%, 30% 3%, 18% 6%, 6% 10%, 0% 15%,
  0% 40%, 2% 42%, 6% 42%, 10% 40%, 12% 38%,
  12% 96%, 15% 100%, 85% 100%, 88% 96%,
  88% 38%, 90% 40%, 94% 42%, 98% 42%, 100% 40%,
  100% 15%, 94% 10%, 82% 6%, 70% 3%, 60% 1%
)`;

// ── 3D Catwalk — art panels gliding along a neon runway ──
function CatwalkPanel({ art, index, total }) {
  const meshRef = useRef();
  const texture = useLoader(THREE.TextureLoader, art.src);
  const speed = 0.4;
  const spacing = 5;
  const totalLen = total * spacing;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * speed;
    // Loop panels along the runway
    let z = ((index * spacing - t * spacing) % totalLen + totalLen) % totalLen - totalLen / 2;
    meshRef.current.position.z = z;
    // Slight bob
    meshRef.current.position.y = Math.sin(t + index) * 0.1;
    // Face camera slightly
    meshRef.current.rotation.y = Math.sin(t * 0.3 + index * 0.5) * 0.08;
    // Fade based on distance
    const dist = Math.abs(z);
    meshRef.current.material.opacity = dist < 4 ? 1 : Math.max(0, 1 - (dist - 4) / 8);
  });

  return (
    <mesh ref={meshRef} position={[0, 0.8, 0]}>
      <planeGeometry args={[3.2, 1.8]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  );
}

function RunwayScene({ artworks, accentColor }) {
  // Take first 10 for the catwalk
  const panels = artworks.slice(0, 10);
  return (
    <>
      {/* Runway floor — reflective */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <planeGeometry args={[4, 60]} />
        <meshStandardMaterial color="#080008" roughness={0.05} metalness={0.95} />
      </mesh>

      {/* Neon runway strips */}
      {[-1.6, 1.6].map(x => (
        <mesh key={x} position={[x, -1.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.04, 60]} />
          <meshBasicMaterial color={accentColor} toneMapped={false} />
        </mesh>
      ))}

      {/* Centre strip */}
      <mesh position={[0, -1.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.02, 60]} />
        <meshBasicMaterial color={accentColor} opacity={0.3} transparent toneMapped={false} />
      </mesh>

      {/* Art panels gliding along runway */}
      {panels.map((art, i) => (
        <CatwalkPanel key={art.id} art={art} index={i} total={panels.length} />
      ))}

      {/* Spotlights */}
      <pointLight position={[0, 4, 0]} color={accentColor} intensity={4} distance={12} />
      <pointLight position={[-3, 3, -5]} color="#ff2d78" intensity={2} distance={15} />
      <pointLight position={[3, 3, 5]} color="#00d4ff" intensity={2} distance={15} />
      <pointLight position={[0, 2, 8]} color="#ffffff" intensity={1.5} distance={12} />
      <ambientLight intensity={0.15} />
    </>
  );
}

// ── Jacket Customizer ──
function JacketCustomizer({ artworks, selectedArt, onSelect, accentColor, jacketStyle, printLayout }) {
  const clip = jacketStyle === 'cropped' ? JACKET_CLIP_CROPPED : JACKET_CLIP_OVERSIZED;
  const jacketRatio = jacketStyle === 'cropped' ? '16/10' : '4/5';
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Jacket preview with selected art */}
      <div style={{ display: 'flex', gap: 'clamp(24px, 4vw, 48px)', alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Bomber jacket silhouette with art */}
        <div style={{ position: 'relative', width: 'clamp(280px, 40vw, 420px)', flexShrink: 0 }}>
          {/* Neon glow behind jacket */}
          <div style={{
            position: 'absolute', inset: '-20px',
            background: `radial-gradient(ellipse at center, ${accentColor}20 0%, transparent 70%)`,
            filter: 'blur(20px)', zIndex: 0,
          }} />
          {/* Jacket shape filled with selected art */}
          <div style={{
            position: 'relative', zIndex: 1,
            aspectRatio: jacketRatio,
            clipPath: clip,
            overflow: 'hidden',
            border: 'none',
          }}>
            {printLayout === 'allover' ? (
              <img
                src={selectedArt.src}
                alt={selectedArt.name}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  transition: 'opacity 0.4s',
                }}
              />
            ) : (
              /* Repeat pattern — scattered random placement */
              <div style={{
                width: '100%', height: '100%',
                position: 'relative',
                overflow: 'hidden',
                background: '#0a0a0a',
                transition: 'opacity 0.4s',
              }}>
                {[
                  { x: 5, y: 3, r: -12, s: 0.32 },
                  { x: 52, y: -2, r: 8, s: 0.28 },
                  { x: 28, y: 22, r: -5, s: 0.35 },
                  { x: 70, y: 15, r: 15, s: 0.3 },
                  { x: 10, y: 45, r: 6, s: 0.26 },
                  { x: 48, y: 38, r: -18, s: 0.33 },
                  { x: 75, y: 50, r: 10, s: 0.28 },
                  { x: 22, y: 65, r: -8, s: 0.3 },
                  { x: 58, y: 68, r: 14, s: 0.32 },
                  { x: 8, y: 80, r: -3, s: 0.27 },
                  { x: 42, y: 85, r: 20, s: 0.25 },
                  { x: 72, y: 78, r: -14, s: 0.3 },
                ].map((p, i) => (
                  <img
                    key={i}
                    src={selectedArt.src}
                    alt=""
                    style={{
                      position: 'absolute',
                      left: `${p.x}%`, top: `${p.y}%`,
                      width: `${p.s * 100}%`,
                      transform: `rotate(${p.r}deg) translate(-50%, -50%)`,
                      objectFit: 'cover',
                      opacity: 0.9,
                    }}
                  />
                ))}
              </div>
            )}
            {/* Glossy PVC shine overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 30%, transparent 50%, rgba(255,255,255,0.08) 70%, transparent 100%)',
              pointerEvents: 'none',
            }} />
          </div>
          {/* Jacket outline glow */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            clipPath: clip,
            boxShadow: `inset 0 0 30px ${accentColor}40`,
            pointerEvents: 'none',
          }} />

          {/* Zip line */}
          <div style={{
            position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)',
            width: '2px', height: '90%', background: `linear-gradient(to bottom, ${accentColor}, rgba(255,255,255,0.3))`,
            zIndex: 3, pointerEvents: 'none',
          }} />

          {/* Label */}
          <div style={{
            position: 'absolute', bottom: '12%', left: '50%', transform: 'translateX(-50%)',
            zIndex: 3, textAlign: 'center', pointerEvents: 'none',
          }}>
            <div style={{
              fontFamily: '"Anton", sans-serif', fontSize: '11px',
              letterSpacing: '0.2em', color: '#fff',
              textShadow: '0 0 10px rgba(0,0,0,0.8)',
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
              padding: '6px 14px',
            }}>
              {selectedArt.name}
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div style={{ flex: '1 1 300px', minWidth: '280px' }}>
          <div style={{
            fontFamily: "'Noto Sans JP', sans-serif", fontSize: '14px',
            color: accentColor, letterSpacing: '0.15em', marginBottom: '4px',
          }}>
            カスタム
          </div>
          <div style={{
            fontFamily: '"Anton", sans-serif', fontSize: 'clamp(24px, 4vw, 36px)',
            letterSpacing: '0.1em', color: '#fff',
          }}>
            DESIGN YOUR JACKET
          </div>
          <p style={{
            fontFamily: "'Space Mono', monospace", fontSize: '13px',
            lineHeight: 1.8, color: 'rgba(255,255,255,0.45)',
            marginTop: '12px',
          }}>
            Designed by Miss AL Simpson and hand-sewn by the Porcelain Android Dressmaker. Your chosen artwork is digitally
            printed onto pure silk. Each jacket is a unique piece —
            {jacketStyle === 'cropped'
              ? ' cropped silhouette with silk lining and custom hardware.'
              : ' oversized drop-shoulder silhouette with silk lining and custom hardware.'
            }
          </p>

          <div style={{
            display: 'flex', gap: '16px', marginTop: '24px', alignItems: 'baseline',
          }}>
            <div style={{
              fontFamily: '"Anton", sans-serif', fontSize: 'clamp(36px, 5vw, 52px)',
              color: '#fff',
            }}>
              {jacketStyle === 'cropped' ? '£1,200' : '£1,400'}
            </div>
            <div style={{
              fontFamily: "'Space Mono', monospace", fontSize: '10px',
              color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em',
            }}>
              {jacketStyle === 'cropped' ? 'CROPPED BOMBER' : 'OVERSIZED BOMBER'} · BESPOKE · MADE TO MEASURE
            </div>
          </div>

          <button style={{
            marginTop: '20px',
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}80)`,
            border: 'none', color: '#fff', padding: '16px 40px',
            fontFamily: '"Anton", sans-serif', fontSize: '16px',
            letterSpacing: '0.25em', cursor: 'pointer',
            boxShadow: `0 0 30px ${accentColor}40`,
            transition: 'all 0.3s',
          }}>
            PRE-ORDER
          </button>
          <div style={{
            fontFamily: "'Space Mono', monospace", fontSize: '10px',
            color: 'rgba(255,255,255,0.2)', marginTop: '10px', letterSpacing: '0.1em',
          }}>
            Bespoke · Hand-sewn · Digitally printed silk · One-of-a-kind
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Art picker grid ──
function ArtPicker({ artworks, selectedId, onSelect, accentColor }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(120px, 16vw, 180px), 1fr))',
      gap: '6px', maxWidth: '1000px', margin: '0 auto',
    }}>
      {artworks.map(art => (
        <button
          key={art.id}
          onClick={() => onSelect(art)}
          style={{
            position: 'relative', background: 'none', border: 'none',
            padding: 0, cursor: 'pointer', transition: 'all 0.3s',
            transform: art.id === selectedId ? 'scale(1.1)' : 'scale(1)',
            zIndex: art.id === selectedId ? 2 : 1,
          }}
        >
          <img
            src={art.src}
            alt={art.name}
            loading="lazy"
            style={{
              width: '100%', aspectRatio: '16/9', objectFit: 'cover',
              border: `2px solid ${art.id === selectedId ? accentColor : 'rgba(255,255,255,0.08)'}`,
              boxShadow: art.id === selectedId ? `0 0 16px ${accentColor}50` : 'none',
              filter: art.id === selectedId ? 'none' : 'brightness(0.6)',
              transition: 'all 0.3s',
            }}
          />
        </button>
      ))}
    </div>
  );
}

// ── Main page ──
export default function AndroidsShop() {
  const [artSource, setArtSource] = useState('android'); // 'android' | 'manga'
  const [jacketStyle, setJacketStyle] = useState('cropped'); // 'cropped' | 'oversized'
  const [printLayout, setPrintLayout] = useState('allover'); // 'allover' | 'repeat'
  const artworks = artSource === 'android' ? ANDROID_ART : MANGA_ART;
  const [selectedArt, setSelectedArt] = useState(artworks[0]);
  const accentColor = artSource === 'android' ? '#ff2d78' : '#00d4ff';

  // Reset selection when switching source
  useEffect(() => {
    const arts = artSource === 'android' ? ANDROID_ART : MANGA_ART;
    setSelectedArt(arts[0]);
  }, [artSource]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#050005' }}>

      {/* ── SECTION 1: 3D CATWALK ── */}
      <div style={{ position: 'relative', height: '50vh', minHeight: '350px' }}>
        <Canvas
          camera={{ fov: 50, near: 0.1, far: 100, position: [0, 0.5, 6] }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
        >
          <RunwayScene artworks={artworks} accentColor={accentColor} />
        </Canvas>

        {/* Header overlay */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          textAlign: 'center', paddingTop: 'clamp(16px, 3vh, 40px)',
          pointerEvents: 'none',
        }}>
          <div style={{
            fontFamily: "'Noto Sans JP', sans-serif", fontSize: 'clamp(28px, 5vw, 48px)',
            color: accentColor, textShadow: `0 0 30px ${accentColor}60`,
            letterSpacing: '0.1em', transition: 'color 0.4s',
          }}>
            衣装室
          </div>
          <div style={{
            fontFamily: '"Anton", sans-serif', fontSize: 'clamp(14px, 2.5vw, 24px)',
            letterSpacing: '0.35em', color: 'rgba(255,255,255,0.85)',
          }}>
            MANGA BOMBER JACKETS
          </div>
          <div style={{
            fontFamily: "'Space Mono', monospace", fontSize: '10px', letterSpacing: '0.25em',
            color: 'rgba(255,255,255,0.35)', marginTop: '6px',
          }}>
            CHOOSE YOUR ART · DESIGN YOUR JACKET · MADE TO ORDER
          </div>
        </div>

        {/* Neon floor line */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
          background: `linear-gradient(to right, transparent, ${accentColor}, transparent)`,
          boxShadow: `0 0 20px ${accentColor}60`,
        }} />
      </div>

      {/* ── NEON SIGN QUOTE ── */}
      <div style={{
        padding: 'clamp(32px, 5vw, 56px) clamp(20px, 4vw, 60px)',
        background: '#060006',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Neon glow backdrop */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at center, ${accentColor}08 0%, transparent 60%)`,
        }} />
        <div style={{ position: 'relative', maxWidth: '700px', margin: '0 auto' }}>
          <div style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: 'clamp(18px, 3.5vw, 32px)',
            lineHeight: 1.4,
            letterSpacing: '0.08em',
            color: accentColor,
            textShadow: `0 0 20px ${accentColor}80, 0 0 40px ${accentColor}40, 0 0 80px ${accentColor}20`,
            transition: 'color 0.4s, text-shadow 0.4s',
          }}>
            YOU HAVE SEEN THE MANGA BOMBER JACKETS IN THE MOVIE
            <br />
            <span style={{ color: '#fff', textShadow: `0 0 20px ${accentColor}60` }}>
              — NOW YOU CAN OWN ONE
            </span>
          </div>
          <div style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: 'clamp(14px, 2.5vw, 22px)',
            color: `${accentColor}90`,
            textShadow: `0 0 15px ${accentColor}50`,
            marginTop: '16px',
            lineHeight: 1.6,
            letterSpacing: '0.1em',
            transition: 'color 0.4s',
          }}>
            映画で見たマンガボンバージャケット
            <br />
            今、あなたのものに
          </div>
        </div>
      </div>

      {/* ── JACKET STYLE TOGGLE ── */}
      <div style={{
        padding: '20px 20px 0',
        background: '#080008',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: "'Space Mono', monospace", fontSize: '10px',
          letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)',
          marginBottom: '12px',
        }}>
          SELECT JACKET STYLE
        </div>
        <div style={{
          display: 'inline-flex', border: '1px solid rgba(255,255,255,0.1)',
          overflow: 'hidden', marginBottom: '20px',
        }}>
          {[
            { key: 'cropped', label: 'CROPPED BOMBER', kanji: 'ショート' },
            { key: 'oversized', label: 'OVERSIZED BOMBER', kanji: 'オーバーサイズ' },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setJacketStyle(s.key)}
              style={{
                background: jacketStyle === s.key ? `${accentColor}15` : 'transparent',
                border: 'none',
                borderBottom: jacketStyle === s.key ? `2px solid ${accentColor}` : '2px solid transparent',
                color: jacketStyle === s.key ? accentColor : 'rgba(255,255,255,0.35)',
                padding: '12px 24px',
                fontFamily: '"Anton", sans-serif',
                fontSize: '13px',
                letterSpacing: '0.15em',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex', gap: '8px', alignItems: 'center',
              }}
            >
              <span style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: '12px' }}>{s.kanji}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── PRINT LAYOUT TOGGLE ── */}
      <div style={{
        padding: '20px 20px 0',
        background: '#080008',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: "'Space Mono', monospace", fontSize: '10px',
          letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)',
          marginBottom: '12px',
        }}>
          SELECT PRINT LAYOUT
        </div>
        <div style={{
          display: 'inline-flex', border: '1px solid rgba(255,255,255,0.1)',
          overflow: 'hidden',
        }}>
          {[
            { key: 'allover', label: 'ALL OVER', kanji: 'フル' },
            { key: 'repeat', label: 'REPEAT PATTERN', kanji: 'リピート' },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setPrintLayout(s.key)}
              style={{
                background: printLayout === s.key ? `${accentColor}15` : 'transparent',
                border: 'none',
                borderBottom: printLayout === s.key ? `2px solid ${accentColor}` : '2px solid transparent',
                color: printLayout === s.key ? accentColor : 'rgba(255,255,255,0.35)',
                padding: '12px 24px',
                fontFamily: '"Anton", sans-serif',
                fontSize: '13px',
                letterSpacing: '0.15em',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex', gap: '8px', alignItems: 'center',
              }}
            >
              <span style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: '12px' }}>{s.kanji}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── SECTION 2: ART SOURCE TOGGLE ── */}
      <div style={{
        padding: '28px 20px 20px',
        background: '#080008',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: "'Space Mono', monospace", fontSize: '10px',
          letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)',
          marginBottom: '12px',
        }}>
          SELECT ART SOURCE
        </div>
        <div style={{
          display: 'inline-flex', border: '1px solid rgba(255,255,255,0.1)',
          overflow: 'hidden',
        }}>
          {[
            { key: 'android', label: 'PORCELAIN ANDROIDS', kanji: '磁器', color: '#ff2d78' },
            { key: 'manga', label: 'MANGA MACHINE', kanji: '漫画', color: '#00d4ff' },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setArtSource(s.key)}
              style={{
                background: artSource === s.key ? `${s.color}15` : 'transparent',
                border: 'none',
                borderBottom: artSource === s.key ? `2px solid ${s.color}` : '2px solid transparent',
                color: artSource === s.key ? s.color : 'rgba(255,255,255,0.35)',
                padding: '12px 24px',
                fontFamily: '"Anton", sans-serif',
                fontSize: '13px',
                letterSpacing: '0.15em',
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex', gap: '8px', alignItems: 'center',
              }}
            >
              <span style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: '16px' }}>{s.kanji}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── SECTION 3: ART PICKER GRID ── */}
      <div style={{
        padding: '20px clamp(16px, 3vw, 40px) 32px',
        background: '#080008',
      }}>
        <ArtPicker
          artworks={artworks}
          selectedId={selectedArt.id}
          onSelect={setSelectedArt}
          accentColor={accentColor}
        />
      </div>

      {/* ── SECTION 4: JACKET CUSTOMIZER ── */}
      <div style={{
        padding: 'clamp(32px, 5vw, 60px) clamp(20px, 4vw, 60px)',
        background: 'linear-gradient(to bottom, #0a0008, #0d000a)',
      }}>
        <JacketCustomizer
          artworks={artworks}
          selectedArt={selectedArt}
          onSelect={setSelectedArt}
          accentColor={accentColor}
          jacketStyle={jacketStyle}
          printLayout={printLayout}
        />
      </div>

      {/* ── SECTION 5: FEATURES ── */}
      <div style={{
        padding: '0 clamp(20px, 4vw, 60px) clamp(40px, 5vw, 60px)',
        background: '#0d000a',
      }}>
        <div style={{
          maxWidth: '1000px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '20px',
          borderTop: `1px solid ${accentColor}15`, paddingTop: '28px',
        }}>
          {[
            { kanji: '絹', label: 'PURE SILK', detail: 'Digitally printed silk fabric' },
            { kanji: '仕立', label: 'HAND-SEWN', detail: 'By the Porcelain Android Dressmaker' },
            { kanji: '署名', label: 'SIGNED', detail: 'Signed by Miss AL Simpson' },
            { kanji: '唯一', label: 'ONE-OF-A-KIND', detail: 'Bespoke to your measurements' },
          ].map(f => (
            <div key={f.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Noto Sans JP', sans-serif", fontSize: '22px',
                color: accentColor, textShadow: `0 0 10px ${accentColor}40`,
                transition: 'color 0.3s',
              }}>
                {f.kanji}
              </div>
              <div style={{
                fontFamily: '"Anton", sans-serif', fontSize: '11px',
                letterSpacing: '0.2em', color: '#fff', marginTop: '4px',
              }}>
                {f.label}
              </div>
              <div style={{
                fontFamily: "'Space Mono', monospace", fontSize: '10px',
                color: 'rgba(255,255,255,0.35)', marginTop: '2px',
              }}>
                {f.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
