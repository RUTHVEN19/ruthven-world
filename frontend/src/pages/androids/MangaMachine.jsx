import { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { TRANSFORMATIONS, PHASE_TRANSFORMATIONS, STILLS, MINT_LINKS, ANDROIDS_BASE } from '../../config/androidsContent';
import { PHASE_CONFIG } from '../../config/wagmiConfig';

// ── Room constants ──
const ROOM_W = 12;
const ROOM_D = 14;
const ROOM_H = 8;

// ── Phase visual config — machine degradation ──
const PHASE_VISUALS = [
  { // Phase 1: Fresh Ink — bright, shiny, clean
    fog: '#030306',
    ambientIntensity: 0.08,
    cabinetColor: '#1a0028',
    cabinetEmissive: '#ff2d78',
    cabinetEmissiveIntensity: 0.12,
    neonOpacity: 1,
    glitchIntensity: 0,
    scanlineOpacity: 0.06,
    screenFilter: 'none',
    accent: '#ff2d78',
  },
  { // Phase 2: Ink Depletion — weathered, ink-stained, flickering
    fog: '#0a0504',
    ambientIntensity: 0.05,
    cabinetColor: '#1a1008',
    cabinetEmissive: '#ff6b00',
    cabinetEmissiveIntensity: 0.06,
    neonOpacity: 0.6,
    glitchIntensity: 0.3,
    scanlineOpacity: 0.15,
    screenFilter: 'sepia(0.3) contrast(1.1)',
    accent: '#ff6b00',
  },
  { // Phase 3: Exhaustion — half broken, ghostly, fading
    fog: '#020204',
    ambientIntensity: 0.03,
    cabinetColor: '#0a0a12',
    cabinetEmissive: '#00d4ff',
    cabinetEmissiveIntensity: 0.03,
    neonOpacity: 0.25,
    glitchIntensity: 0.7,
    scanlineOpacity: 0.3,
    screenFilter: 'saturate(0.3) brightness(0.7) contrast(1.2)',
    accent: '#00d4ff',
  },
];

// ══════════════════════════════════════════════════
// 3D SCENE
// ══════════════════════════════════════════════════

function NeonSign({ text, sub, position, rotation = [0, 0, 0], color = '#ff2d78', size = 32, opacity = 1 }) {
  return (
    <group position={position} rotation={rotation}>
      <pointLight color={color} intensity={2 * opacity} distance={6} decay={2} />
      <Html center transform distanceFactor={8} style={{ pointerEvents: 'none', opacity }}>
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

function WallPoster({ src, position, rotation, width = 2, height = 1.3, opacity = 1 }) {
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
        <planeGeometry args={[width + 0.15, height + 0.15]} />
        <meshBasicMaterial color="#ff2d78" toneMapped={false} transparent opacity={0.1 * opacity} />
      </mesh>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} toneMapped={false} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

function ArcadeCabinet({ position, visuals }) {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child) => {
      if (child.material?.toneMapped === false && child.material?.transparent) {
        const flicker = visuals.glitchIntensity > 0
          ? (Math.random() > 0.95 - visuals.glitchIntensity * 0.3 ? 0.2 : 1)
          : 1;
        child.material.opacity = (0.8 + Math.sin(t * 3) * 0.2) * visuals.neonOpacity * flicker;
      }
    });
  });

  return (
    <group position={position} ref={groupRef}>
      <mesh position={[0, 2.8, 0]}>
        <boxGeometry args={[3.2, 5.6, 1]} />
        <meshStandardMaterial color={visuals.cabinetColor} roughness={0.3} metalness={0.5}
          emissive={visuals.cabinetEmissive} emissiveIntensity={visuals.cabinetEmissiveIntensity} />
      </mesh>
      <mesh position={[0, 3.6, 0.52]}>
        <planeGeometry args={[2.6, 1.8]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      <mesh position={[0, 1.5, 0.6]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[2.8, 0.8, 0.5]} />
        <meshStandardMaterial color="#120020" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, 5.65, 0]}>
        <boxGeometry args={[3.4, 0.06, 1.2]} />
        <meshBasicMaterial color={visuals.accent} toneMapped={false} transparent />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[3.4, 0.06, 1.2]} />
        <meshBasicMaterial color="#00d4ff" toneMapped={false} transparent />
      </mesh>
      <mesh position={[-1.65, 2.8, 0]}>
        <boxGeometry args={[0.06, 5.7, 0.06]} />
        <meshBasicMaterial color={visuals.accent} toneMapped={false} transparent />
      </mesh>
      <mesh position={[1.65, 2.8, 0]}>
        <boxGeometry args={[0.06, 5.7, 0.06]} />
        <meshBasicMaterial color={visuals.accent} toneMapped={false} transparent />
      </mesh>
      <pointLight position={[0, 6.5, 2]} color={visuals.accent} intensity={5 * visuals.neonOpacity} distance={10} />
      <pointLight position={[0, 0.3, 2]} color="#00d4ff" intensity={3 * visuals.neonOpacity} distance={8} />
    </group>
  );
}

function CameraApproach() {
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
    const z = 5 - t * 3.5;
    const sway = Math.sin(clock.getElapsedTime() * 0.4) * 0.15;
    camera.position.set(sway, 2.2 + t * 1.5, z);
    camera.lookAt(0, 3.2, -ROOM_D / 2);
  });

  return null;
}

function MachineRoom({ visuals }) {
  const neonColors = [visuals.accent, '#00d4ff', '#39ff14', '#ff6b00', '#ffd700'];
  const wallStills = STILLS.slice(10, 18);

  return (
    <>
      <ambientLight intensity={visuals.ambientIntensity} />
      <fog attach="fog" args={[visuals.fog, 6, 25]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[ROOM_W + 4, ROOM_D + 6]} />
        <meshStandardMaterial color="#050005" roughness={0.08} metalness={0.95} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_H, 0]}>
        <planeGeometry args={[ROOM_W + 4, ROOM_D + 6]} />
        <meshStandardMaterial color="#020002" roughness={0.9} />
      </mesh>
      <mesh position={[0, ROOM_H / 2, -ROOM_D / 2]}>
        <planeGeometry args={[ROOM_W + 4, ROOM_H]} />
        <meshStandardMaterial color="#0a0012" roughness={0.7} />
      </mesh>
      <mesh position={[-ROOM_W / 2, ROOM_H / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[ROOM_D + 6, ROOM_H]} />
        <meshStandardMaterial color="#080010" roughness={0.7} />
      </mesh>
      <mesh position={[ROOM_W / 2, ROOM_H / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[ROOM_D + 6, ROOM_H]} />
        <meshStandardMaterial color="#080010" roughness={0.7} />
      </mesh>

      <ArcadeCabinet position={[0, 0, -ROOM_D / 2 + 1]} visuals={visuals} />

      <NeonSign text="マンガマシン" sub="RECOVERED DEVICE // MM-01" position={[0, ROOM_H - 1, -ROOM_D / 2 + 0.5]} color={visuals.accent} size={28} opacity={visuals.neonOpacity} />
      <NeonSign text="記憶" sub="MEMORY" position={[-ROOM_W / 2 + 0.15, ROOM_H - 2, -2]} rotation={[0, Math.PI / 2, 0]} color="#00d4ff" size={30} opacity={visuals.neonOpacity} />
      <NeonSign text="漫画" sub="MANGA" position={[ROOM_W / 2 - 0.15, ROOM_H - 2, 0]} rotation={[0, -Math.PI / 2, 0]} color="#39ff14" size={32} opacity={visuals.neonOpacity} />

      {wallStills.map((still, i) => (
        <WallPoster
          key={still.id}
          src={`/androids/stills/${still.file}`}
          position={[
            i < 4 ? -ROOM_W / 2 + 0.12 : ROOM_W / 2 - 0.12,
            2.5, 3 - (i % 4) * 2.5
          ]}
          rotation={[0, i < 4 ? Math.PI / 2 : -Math.PI / 2, 0]}
          opacity={visuals.neonOpacity}
        />
      ))}

      {Array.from({ length: 6 }, (_, i) => (
        <group key={`fs-${i}`}>
          <mesh position={[-ROOM_W / 2 + 0.3, 0.02, 4 - i * 2.5]}>
            <boxGeometry args={[0.04, 0.04, 0.5]} />
            <meshBasicMaterial color={neonColors[i % 5]} toneMapped={false} transparent opacity={visuals.neonOpacity} />
          </mesh>
          <mesh position={[ROOM_W / 2 - 0.3, 0.02, 4 - i * 2.5]}>
            <boxGeometry args={[0.04, 0.04, 0.5]} />
            <meshBasicMaterial color={neonColors[(i + 3) % 5]} toneMapped={false} transparent opacity={visuals.neonOpacity} />
          </mesh>
        </group>
      ))}

      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={`ct-${i}`} position={[0, ROOM_H - 0.15, 4 - i * 3]}>
          <boxGeometry args={[ROOM_W, 0.03, 0.03]} />
          <meshBasicMaterial color={neonColors[i % 3]} toneMapped={false} transparent opacity={visuals.neonOpacity} />
        </mesh>
      ))}

      <CameraApproach />
    </>
  );
}

// ══════════════════════════════════════════════════
// COUNTDOWN TIMER
// ══════════════════════════════════════════════════

function useCountdown(targetTimestamp) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  const remaining = Math.max(0, targetTimestamp - now);
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  return { remaining, days, hours, minutes, seconds };
}

function CountdownDisplay({ targetTimestamp, accent = '#ff2d78' }) {
  const { remaining, days, hours, minutes, seconds } = useCountdown(targetTimestamp);

  if (remaining <= 0) return null;

  const units = [
    { label: 'DAYS', value: days },
    { label: 'HRS', value: hours },
    { label: 'MIN', value: minutes },
    { label: 'SEC', value: seconds },
  ];

  return (
    <div className="mm-countdown">
      {units.map(u => (
        <div key={u.label} className="mm-countdown-unit">
          <div className="mm-countdown-value" style={{ color: accent, textShadow: `0 0 15px ${accent}` }}>
            {String(u.value).padStart(2, '0')}
          </div>
          <div className="mm-countdown-label">{u.label}</div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════
// PHASE INDICATOR
// ══════════════════════════════════════════════════

function PhaseIndicator({ activePhase, machineState }) {
  return (
    <div className="mm-phase-track">
      {PHASE_CONFIG.map((phase, i) => {
        const isCurrent = activePhase === i;
        const isPast = activePhase > i;
        const isFuture = activePhase < i;
        const isDepleted = machineState === 'depleted';

        return (
          <div key={phase.id} className="mm-phase-node" style={{
            opacity: isCurrent ? 1 : isPast || isDepleted ? 0.4 : 0.25,
          }}>
            <div className="mm-phase-dot" style={{
              background: isCurrent ? phase.color : isPast || isDepleted ? phase.color : 'rgba(255,255,255,0.15)',
              boxShadow: isCurrent ? `0 0 12px ${phase.color}, 0 0 24px ${phase.color}40` : 'none',
              animation: isCurrent ? 'mmPhasePulse 2s ease infinite' : 'none',
            }} />
            <div className="mm-phase-info">
              <div className="mm-phase-name-jp">{phase.nameJp}</div>
              <div className="mm-phase-name">{phase.name}</div>
              <div className="mm-phase-price">{isPast || isDepleted ? 'ENDED' : isFuture ? 'UPCOMING' : `${phase.price} ETH`}</div>
            </div>
            {i < 2 && <div className="mm-phase-line" style={{
              background: isPast || isDepleted
                ? `linear-gradient(90deg, ${PHASE_CONFIG[i].color}, ${PHASE_CONFIG[i + 1].color})`
                : 'rgba(255,255,255,0.06)',
            }} />}
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════
// MACHINE UI
// ══════════════════════════════════════════════════

const STATES = { SELECT: 'select', PULLING: 'pulling', LOADING: 'loading', TRANSFORMING: 'transforming', REVEAL: 'reveal' };

function MachineUI({ activePhase, machineState }) {
  const [state, setState] = useState(STATES.SELECT);
  const [selected, setSelected] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [lightShow, setLightShow] = useState(false);
  const videoRef = useRef(null);
  const scrollRef = useRef(null);

  const phaseConfig = PHASE_CONFIG[activePhase] || PHASE_CONFIG[0];
  const visuals = PHASE_VISUALS[activePhase] || PHASE_VISUALS[0];
  const phaseTriplets = PHASE_TRANSFORMATIONS[activePhase]?.length > 0
    ? PHASE_TRANSFORMATIONS[activePhase]
    : TRANSFORMATIONS; // fallback to Phase 1 if current phase has no art yet
  const isPreLaunch = machineState === 'countdown';
  const isDepleted = machineState === 'depleted';
  const isLive = machineState === 'live';


  const scrollToIdx = useCallback((idx) => {
    setSelectedIdx(idx);
    if (scrollRef.current?.children[idx]) {
      scrollRef.current.children[idx].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, []);

  const handlePullLever = useCallback(() => {
    const t = phaseTriplets[selectedIdx];
    setSelected(t);
    setState(STATES.PULLING);
    setTimeout(() => {
      setState(STATES.LOADING);
      setTimeout(() => setState(STATES.TRANSFORMING), 2200);
    }, 1200);
  }, [selectedIdx]);

  const handleVideoEnd = useCallback(() => {
    setLightShow(true);
    setState(STATES.REVEAL);
    setTimeout(() => setLightShow(false), 3000);
  }, []);

  const handleReset = useCallback(() => {
    setState(STATES.SELECT);
    setSelected(null);
    setLightShow(false);
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; }
  }, []);

  const handleVideoRef = useCallback((el) => {
    videoRef.current = el;
    if (el && state === STATES.TRANSFORMING) el.play().catch(() => {});
  }, [state]);

  return (
    <div className="mm-ui-overlay">
      <div className="mm-ui-panel" style={{ borderColor: `${visuals.accent}40` }}>

        {/* Sign */}
        <div className="mm-ui-sign">
          <div className="mm-ui-kanji" style={{ color: visuals.accent, textShadow: `0 0 10px ${visuals.accent}, 0 0 30px ${visuals.accent}80` }}>
            マンガマシン
          </div>
          <div className="mm-ui-title">THE MANGA MACHINE</div>
          <div className="mm-ui-en" style={{ color: `${visuals.accent}99` }}>SELECT AN ANDROID // PULL THE LEVER</div>
        </div>


        {/* Light show overlay */}
        {lightShow && <div className="mm-lightshow" />}

        {/* ── PRE-LAUNCH: Countdown ── */}
        {isPreLaunch && (
          <div className="mm-ui-countdown-panel">
            <div className="mm-countdown-icon">
              <div className="mm-sealed-machine" style={{ borderColor: `${visuals.accent}40` }}>
                <div className="mm-sealed-tape">RESTRICTED ACCESS</div>
                <div className="mm-sealed-kanji">封印</div>
                <div className="mm-sealed-sub">SEALED</div>
              </div>
            </div>
            <CountdownDisplay targetTimestamp={LAUNCH_TIMESTAMP} accent={visuals.accent} />
            <div className="mm-countdown-text">
              <div style={{ fontFamily: 'serif', fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 900, color: visuals.accent, textShadow: `0 0 15px ${visuals.accent}, 0 0 40px ${visuals.accent}60` }}>
                起動準備中
              </div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 'clamp(11px, 1.5vw, 13px)', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.7)', marginTop: '8px', textShadow: '0 0 8px rgba(255,255,255,0.2)' }}>
                THE MACHINE IS WARMING UP
              </div>
              <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 'clamp(12px, 1.5vw, 14px)', lineHeight: 1.8, color: 'rgba(255,255,255,0.55)', marginTop: '16px', maxWidth: '360px' }}>
                Three phases. Three triptychs. Each phase is an open edition, limited by time inside the machine — not supply. As the ink runs down, the outputs change. Collect all three stages before the machine fails.
              </p>
            </div>
            {/* Phase preview cards */}
            <div className="mm-phase-preview">
              {PHASE_CONFIG.map((p, i) => (
                <div key={p.id} className="mm-phase-card" style={{ borderColor: `${p.color}30` }}>
                  <div className="mm-phase-card-header" style={{ color: p.color, textShadow: `0 0 8px ${p.color}` }}>
                    <span style={{ fontFamily: 'serif', fontWeight: 900 }}>{p.nameJp}</span>
                  </div>
                  <div className="mm-phase-card-name">{p.name}</div>
                  <div className="mm-phase-card-price">{p.price} ETH</div>
                  <div className="mm-phase-card-desc">{p.description}</div>
                </div>
              ))}
            </div>

            {/* Film edition CTA */}
            <a
              href={MINT_LINKS.filmEdition || '#'}
              target="_blank" rel="noopener noreferrer"
              onClick={(e) => { if (!MINT_LINKS.filmEdition) e.preventDefault(); }}
              className="mm-film-cta"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                padding: '14px 24px', width: '100%',
                background: 'rgba(26,0,40,0.4)',
                border: `1px solid ${MINT_LINKS.filmEdition ? 'rgba(255,45,120,0.35)' : 'rgba(255,45,120,0.12)'}`,
                borderRadius: '8px', textDecoration: 'none', color: 'inherit',
                transition: 'all 0.3s',
                opacity: MINT_LINKS.filmEdition ? 1 : 0.7,
                cursor: MINT_LINKS.filmEdition ? 'pointer' : 'default',
              }}
            >
              <span style={{ fontSize: '16px', fontFamily: 'serif', fontWeight: 900, color: '#ff2d78', textShadow: '0 0 10px #ff2d78' }}>
                リール回収
              </span>
              <span style={{ fontSize: '11px', fontFamily: "'Space Mono', monospace", letterSpacing: '0.2em', color: 'rgba(255,255,255,0.7)' }}>
                RECOVER THE REEL — THE MANGA MACHINE FILM
              </span>
              <span style={{ fontSize: '10px', fontFamily: "'Space Mono', monospace", letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)' }}>
                {MINT_LINKS.filmEdition ? '333 EDITIONS · 0.033 ETH · TRANSIENT LABS' : 'COMING SOON · 333 EDITIONS · 0.033 ETH'}
              </span>
            </a>
          </div>
        )}

        {/* ── DEPLETED: Machine is done ── */}
        {isDepleted && (
          <div className="mm-ui-countdown-panel">
            <div className="mm-depleted-icon">
              <div className="mm-sealed-kanji" style={{ color: '#00d4ff', textShadow: '0 0 15px #00d4ff' }}>終了</div>
              <div className="mm-sealed-sub">DEPLETED</div>
            </div>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', lineHeight: 1.8, color: 'rgba(255,255,255,0.3)', textAlign: 'center', maxWidth: '340px', margin: '0 auto' }}>
              The Manga Machine has completed its lifecycle. All three phases are closed. Collectors who minted all three stages will receive the completion airdrop — three views from inside the machine as it broke down.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'center' }}>
              <a href={`${ANDROIDS_BASE}/originals`} className="mm-ui-buy" style={{ flex: 'none', padding: '12px 24px', borderColor: '#ff2d78' }}>
                <span className="mm-ui-bk" style={{ fontSize: '14px', color: '#ff2d78', textShadow: '0 0 10px #ff2d78' }}>原本</span>
                <span className="mm-ui-be">VIEW ORIGINALS</span>
              </a>
              <a href={`${ANDROIDS_BASE}/prints`} className="mm-ui-buy" style={{ flex: 'none', padding: '12px 24px', borderColor: '#ffd700' }}>
                <span className="mm-ui-bk" style={{ fontSize: '14px', color: '#ffd700', textShadow: '0 0 10px #ffd700' }}>印刷</span>
                <span className="mm-ui-be">PRINT ARCHIVE</span>
              </a>
            </div>
          </div>
        )}

        {/* ── LIVE: Machine is running ── */}
        {isLive && (
          <>
            {/* Screen */}
            <div className="mm-ui-screen" style={{ filter: visuals.screenFilter }}>
              {state === STATES.SELECT && (
                <div className="mm-ui-screen-inner">
                  <video src={phaseTriplets[selectedIdx].video} muted preload="auto"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div className="mm-ui-scanlines" style={{ opacity: visuals.scanlineOpacity }} />
                  <div className="mm-ui-label">
                    <span className="mm-ui-k-small" style={{ color: visuals.accent }}>選択</span>
                    <span>{phaseTriplets[selectedIdx].label}</span>
                  </div>
                </div>
              )}
              {state === STATES.PULLING && selected && (
                <div className="mm-ui-screen-inner">
                  <video src={selected.video} muted preload="metadata"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(1.5) saturate(1.5)' }} />
                  <div className="mm-ui-scanlines" style={{ opacity: 0.2 }} />
                  <div className="mm-ui-feed">
                    <div className="mm-ui-feed-k" style={{ color: visuals.accent, animation: 'mmPowerUp 1.2s ease' }}>起動</div>
                    <div className="mm-ui-se" style={{ marginTop: '8px' }}>READING MEMORY</div>
                  </div>
                  <div className="mm-neon-name" style={{ color: visuals.accent, animation: 'mmNeonFlicker 0.8s ease' }}>{selected.label}</div>
                </div>
              )}
              {state === STATES.LOADING && selected && (
                <div className="mm-ui-screen-inner">
                  <video src={selected.video} muted preload="metadata"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', animation: 'mmFeedIn 1.5s ease' }} />
                  <div className="mm-ui-scanlines" style={{ opacity: visuals.scanlineOpacity }} />
                  <div className="mm-ui-feed">
                    <div className="mm-ui-feed-k" style={{ color: visuals.accent }}>処理中</div>
                    <div className="mm-ui-dots"><span style={{ background: visuals.accent }} /><span style={{ background: visuals.accent }} /><span style={{ background: visuals.accent }} /></div>
                    <div className="mm-ui-bar-track"><div className="mm-ui-bar" /></div>
                  </div>
                  <div className="mm-neon-name" style={{ color: visuals.accent }}>{selected.label}</div>
                </div>
              )}
              {state === STATES.TRANSFORMING && selected && (
                <div className="mm-ui-screen-inner">
                  <video ref={handleVideoRef} src={selected.video} autoPlay playsInline onEnded={handleVideoEnd}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div className="mm-ui-scanlines" style={{ opacity: visuals.scanlineOpacity }} />
                  <div className="mm-ui-status"><span className="mm-ui-sk" style={{ color: visuals.accent }}>変換中</span><span className="mm-ui-se">RECOVERING MEMORY</span></div>
                  <div className="mm-neon-name mm-neon-name-pulse" style={{ color: visuals.accent }}>{selected.label}</div>
                </div>
              )}
              {state === STATES.REVEAL && selected && (
                <div className="mm-ui-screen-inner" style={{ overflow: 'hidden' }}>
                  <div className="mm-printout-wrap">
                    <img src={selected.manga} alt={selected.label}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="mm-ui-flash" />
                  <div className="mm-printout-edge" />
                  <div className="mm-ui-status">
                    <span className="mm-ui-sk" style={{ color: visuals.accent, textShadow: `0 0 10px ${visuals.accent}` }}>完成</span>
                    <span className="mm-ui-se">MEMORY RECOVERY SUCCESSFUL</span>
                  </div>
                  <div className="mm-neon-name mm-neon-name-reveal" style={{ color: '#00d4ff' }}>{selected.label}</div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="mm-ui-controls">
              {state === STATES.SELECT && (
                <>
                  <div className="mm-ui-carousel-wrap">
                    <button className="mm-ui-arrow" style={{ borderColor: `${visuals.accent}4d`, color: visuals.accent }} onClick={() => scrollToIdx(Math.max(0, selectedIdx - 1))}>&#9664;</button>
                    <div className="mm-ui-carousel" ref={scrollRef}>
                      {phaseTriplets.map((t, i) => (
                        <button key={t.id} className={`mm-ui-thumb ${i === selectedIdx ? 'mm-ui-thumb-on' : ''}`}
                          style={i === selectedIdx ? { borderColor: visuals.accent, boxShadow: `0 0 10px ${visuals.accent}60` } : {}}
                          onClick={() => scrollToIdx(i)}>
                          <img src={t.thumb} alt={t.label} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
                        </button>
                      ))}
                    </div>
                    <button className="mm-ui-arrow" style={{ borderColor: `${visuals.accent}4d`, color: visuals.accent }} onClick={() => scrollToIdx(Math.min(phaseTriplets.length - 1, selectedIdx + 1))}>&#9654;</button>
                  </div>
                  <button className="mm-lever-btn" style={{ borderColor: visuals.accent }} onClick={handlePullLever}>
                    <div className="mm-lever-track" style={{ borderColor: `${visuals.accent}66` }}>
                      <div className="mm-lever-handle" style={{ background: `radial-gradient(circle, ${visuals.accent}cc, ${visuals.accent})`, boxShadow: `0 0 10px ${visuals.accent}` }} />
                      <div className="mm-lever-glow" />
                    </div>
                    <div className="mm-lever-label">
                      <span className="mm-ui-bk" style={{ color: visuals.accent, textShadow: `0 0 10px ${visuals.accent}` }}>引く</span>
                      <span className="mm-ui-be">ACTIVATE MACHINE</span>
                    </div>
                  </button>
                </>
              )}
              {state === STATES.REVEAL && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                  {/* Phase triptych preview */}
                  <div className="mm-rewards">
                    <div className="mm-reward" style={{ animationDelay: '0.2s' }}>
                      <div className="mm-reward-img">
                        <img src={selected?.porcelain || `/androids/stills/${STILLS[selectedIdx]?.file || STILLS[0].file}`} alt="Porcelain Android" />
                      </div>
                      <div className="mm-reward-label">
                        <span className="mm-reward-k" style={{ color: visuals.accent }}>磁器</span>
                        <span className="mm-reward-en">PORCELAIN</span>
                      </div>
                    </div>
                    <div className="mm-reward" style={{ animationDelay: '0.5s' }}>
                      <div className="mm-reward-img">
                        <img src={selected?.manga || ''} alt="Manga Android" />
                      </div>
                      <div className="mm-reward-label">
                        <span className="mm-reward-k" style={{ color: visuals.accent }}>漫画</span>
                        <span className="mm-reward-en">MANGA</span>
                      </div>
                    </div>
                    <div className="mm-reward" style={{ animationDelay: '0.8s' }}>
                      <div className="mm-reward-img">
                        <video src={selected?.video || ''} muted loop autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div className="mm-reward-label">
                        <span className="mm-reward-k" style={{ color: '#39ff14' }}>変換</span>
                        <span className="mm-reward-en">TRANSFORMATION</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    <button className="mm-ui-transform mm-ui-again" onClick={handleReset} style={{ flex: 1 }}>
                      <span className="mm-ui-bk" style={{ color: '#00d4ff', textShadow: '0 0 10px #00d4ff' }}>もう一度</span>
                      <span className="mm-ui-be">AGAIN</span>
                    </button>
                    <a
                      href={`${ANDROIDS_BASE}/prints?artwork=${selected?.slug || ''}`}
                      className="mm-ui-transform mm-ui-again"
                      style={{ flex: 1, textDecoration: 'none', textAlign: 'center', borderColor: '#ffd700' }}
                    >
                      <span className="mm-ui-bk" style={{ color: '#ffd700', textShadow: '0 0 10px #ffd700' }}>印刷</span>
                      <span className="mm-ui-be">BUY PRINT</span>
                    </a>
                  </div>
                </div>
              )}
              {(state === STATES.PULLING || state === STATES.LOADING || state === STATES.TRANSFORMING) && (
                <div className="mm-ui-lights">
                  {[0,1,2,3,4].map(i => <div key={i} className="mm-ui-light" style={{ background: visuals.accent, boxShadow: `0 0 6px ${visuals.accent}`, animationDelay: `${i * 0.2}s` }} />)}
                </div>
              )}
            </div>
          </>
        )}
      </div>

    </div>
  );
}

// ══════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════

export default function MangaMachine() {
  const machineState = 'live';
  const activePhase = 0;

  const visuals = PHASE_VISUALS[activePhase] || PHASE_VISUALS[0];

  return (
    <div style={{ background: '#030306', minHeight: '100vh', position: 'relative', zIndex: 2 }}>
      <Helmet>
        <title>The Manga Machine — Porcelain Androids</title>
        <meta name="description" content="Three phases. Three triptychs. One machine lifecycle. The Manga Machine prints open editions as its ink runs down. Collect all three stages before the machine fails." />
      </Helmet>

      {/* Fixed 3D Background */}
      <div style={{ position: 'fixed', inset: 0, top: '52px', zIndex: 1 }}>
        <Canvas
          camera={{ fov: 65, near: 0.1, far: 50, position: [0, 2.2, 5] }}
          gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
          onCreated={({ gl }) => {
            gl.setClearColor('#030306');
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.8;
          }}
        >
          <Suspense fallback={null}>
            <MachineRoom visuals={visuals} />
          </Suspense>
        </Canvas>
      </div>

      {/* Machine UI — scrolls with page */}
      <MachineUI activePhase={activePhase} machineState={machineState} />

      <style>{`
        .mm-ui-overlay {
          position: fixed;
          top: 52px; left: 0; right: 0; bottom: 0;
          z-index: 10;
          display: flex; align-items: flex-start; justify-content: center;
          overflow-y: auto;
          padding: 8px 0 40px;
        }
        .mm-ui-panel {
          max-width: 440px; width: 94%;
          background: rgba(10,0,18,0.75);
          backdrop-filter: blur(16px);
          border: 2px solid rgba(255,45,120,0.35);
          border-radius: 12px;
          box-shadow: 0 0 40px rgba(255,45,120,0.1), 0 0 80px rgba(0,0,0,0.5);
        }

        .mm-ui-sign {
          text-align: center;
          padding: clamp(6px, 1vw, 10px) 16px;
          border-bottom: 2px solid rgba(255,45,120,0.2);
          background: linear-gradient(180deg, rgba(26,0,40,0.5), transparent);
        }
        .mm-ui-kanji {
          font-size: clamp(18px, 3.5vw, 26px); font-weight: 900; font-family: serif;
          color: #ff2d78; letter-spacing: 0.1em;
        }
        .mm-ui-title {
          font-size: clamp(12px, 2vw, 16px); font-family: 'Anton', sans-serif;
          letter-spacing: 0.25em; text-transform: uppercase;
          color: rgba(255,255,255,0.85); margin-top: 4px;
          text-shadow: 0 0 15px rgba(255,45,120,0.3);
        }
        .mm-ui-en {
          font-size: clamp(9px, 1.2vw, 11px); font-family: 'Space Mono', monospace;
          letter-spacing: 0.4em; text-transform: uppercase;
          margin-top: 4px;
        }

        /* ── Phase Track ── */
        .mm-phase-track {
          display: flex; align-items: flex-start; justify-content: center;
          padding: 12px 16px 8px; gap: 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .mm-phase-node {
          display: flex; flex-direction: column; align-items: center;
          position: relative; flex: 1; min-width: 0;
        }
        .mm-phase-dot {
          width: 10px; height: 10px; border-radius: 50%;
          margin-bottom: 6px; flex-shrink: 0;
        }
        .mm-phase-line {
          position: absolute; top: 5px; left: calc(50% + 8px); right: calc(-50% + 8px);
          height: 1px;
        }
        .mm-phase-info { text-align: center; }
        .mm-phase-name-jp {
          font-size: 14px; font-family: serif; font-weight: 700;
          color: inherit;
        }
        .mm-phase-name {
          font-size: 10px; font-family: 'Space Mono', monospace;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: rgba(255,255,255,0.6); margin-top: 2px;
        }
        .mm-phase-price {
          font-size: 10px; font-family: 'Space Mono', monospace;
          letter-spacing: 0.1em; color: rgba(255,255,255,0.45); margin-top: 2px;
        }
        @keyframes mmPhasePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }

        /* ── Countdown ── */
        .mm-ui-countdown-panel {
          display: flex; flex-direction: column; align-items: center;
          padding: 24px 16px 20px; gap: 16px;
        }
        .mm-countdown {
          display: flex; gap: 12px; justify-content: center;
        }
        .mm-countdown-unit { text-align: center; }
        .mm-countdown-value {
          font-size: clamp(28px, 5vw, 42px); font-family: 'Anton', sans-serif;
          letter-spacing: 0.05em; line-height: 1;
        }
        .mm-countdown-label {
          font-size: 8px; font-family: 'Space Mono', monospace;
          letter-spacing: 0.3em; color: rgba(255,255,255,0.3); margin-top: 4px;
        }
        .mm-countdown-text { text-align: center; }

        /* ── Sealed Machine ── */
        .mm-sealed-machine {
          width: 120px; height: 120px;
          border: 2px solid rgba(255,45,120,0.3);
          border-radius: 8px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          position: relative; overflow: hidden;
          background: rgba(0,0,0,0.5);
        }
        .mm-sealed-tape {
          position: absolute; top: 50%; left: -30%; right: -30%;
          transform: rotate(-35deg) translateY(-50%);
          background: repeating-linear-gradient(90deg, #ff2d78 0, #ff2d78 10px, #1a0028 10px, #1a0028 20px);
          color: #000; font-size: 7px; font-family: 'Space Mono', monospace;
          font-weight: 700; letter-spacing: 0.2em; text-align: center;
          padding: 3px 0; text-transform: uppercase;
          box-shadow: 0 0 8px rgba(255,45,120,0.3);
        }
        .mm-sealed-kanji {
          font-size: 28px; font-family: serif; font-weight: 900;
          color: rgba(255,45,120,0.3);
        }
        .mm-sealed-sub {
          font-size: 8px; font-family: 'Space Mono', monospace;
          letter-spacing: 0.3em; color: rgba(255,255,255,0.15); margin-top: 4px;
        }

        /* ── Phase Preview Cards ── */
        .mm-phase-preview {
          display: flex; gap: 8px; width: 100%;
        }
        .mm-phase-card {
          flex: 1; padding: 10px 8px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          background: rgba(255,255,255,0.02);
          text-align: center;
        }
        .mm-phase-card-header { font-size: 18px; }
        .mm-phase-card-name {
          font-size: 10px; font-family: 'Space Mono', monospace;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: rgba(255,255,255,0.65); margin-top: 4px;
        }
        .mm-phase-card-price {
          font-size: 14px; font-family: 'Anton', sans-serif;
          letter-spacing: 0.1em; color: rgba(255,255,255,0.85); margin-top: 6px;
        }
        .mm-phase-card-desc {
          font-size: 11px; font-family: 'Space Mono', monospace;
          line-height: 1.6; color: rgba(255,255,255,0.4); margin-top: 6px;
        }

        /* ── Depleted ── */
        .mm-depleted-icon { text-align: center; padding: 16px 0; }

        /* ── Screen ── */
        .mm-ui-screen {
          margin: clamp(6px, 1vw, 10px);
          border: 2px solid #1a1a2e; border-radius: 4px;
          overflow: hidden; aspect-ratio: 4/3;
          background: #000; position: relative;
          transition: filter 0.5s ease;
        }
        .mm-ui-screen-inner { width: 100%; height: 100%; position: relative; }
        .mm-ui-scanlines {
          position: absolute; inset: 0; pointer-events: none; z-index: 3;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px);
        }
        .mm-ui-label {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 4;
          padding: 8px 12px; display: flex; align-items: center; gap: 8px;
          background: linear-gradient(to top, rgba(0,0,0,0.85), transparent);
        }
        .mm-ui-k-small { font-size: 13px; text-shadow: 0 0 8px currentColor; font-family: serif; font-weight: 700; }
        .mm-ui-label span:last-child { font-size: 11px; font-family: 'Space Mono', monospace; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.6); }

        .mm-ui-feed {
          position: absolute; inset: 0; z-index: 4;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.6); backdrop-filter: blur(2px);
        }
        .mm-ui-feed-k {
          font-size: clamp(24px, 4vw, 36px); font-family: serif; font-weight: 900;
          text-shadow: 0 0 15px currentColor;
          animation: mmBlink 1s steps(1) infinite;
        }
        .mm-ui-dots { display: flex; gap: 6px; margin: 12px 0; }
        .mm-ui-dots span { width: 7px; height: 7px; border-radius: 50%; box-shadow: 0 0 8px currentColor; animation: mmDotPulse 1.2s ease infinite; }
        .mm-ui-dots span:nth-child(2) { animation-delay: 0.2s; }
        .mm-ui-dots span:nth-child(3) { animation-delay: 0.4s; }
        .mm-ui-bar-track { width: 50%; height: 3px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; }
        .mm-ui-bar { height: 100%; background: linear-gradient(90deg, #ff2d78, #00d4ff, #39ff14); background-size: 300% 100%; animation: mmLoadFill 2s ease-in-out forwards, mmLoadShimmer 0.6s linear infinite; }

        .mm-ui-status { position: absolute; top: 10px; right: 10px; z-index: 4; display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
        .mm-ui-sk { font-size: 16px; font-family: serif; font-weight: 900; text-shadow: 0 0 10px currentColor; }
        .mm-ui-se { font-size: 8px; font-family: 'Space Mono', monospace; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.4); }
        .mm-ui-flash { position: absolute; inset: 0; z-index: 2; background: white; animation: mmFlash 0.6s ease-out forwards; pointer-events: none; }

        .mm-ui-controls {
          padding: clamp(6px, 1vw, 10px);
          display: flex; flex-direction: column; align-items: center; gap: clamp(6px, 1vw, 10px);
        }
        .mm-ui-carousel-wrap { display: flex; align-items: center; gap: 6px; width: 100%; }
        .mm-ui-carousel { display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none; flex: 1; padding: 2px 0; }
        .mm-ui-carousel::-webkit-scrollbar { display: none; }
        .mm-ui-thumb {
          width: 56px; height: 56px; flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.1); border-radius: 3px;
          overflow: hidden; cursor: pointer; background: #111; padding: 0; transition: all 0.3s;
        }
        .mm-ui-thumb-on { border-color: #ff2d78; box-shadow: 0 0 10px rgba(255,45,120,0.4); }
        .mm-ui-thumb:hover { border-color: rgba(255,45,120,0.5); }
        .mm-ui-arrow {
          background: rgba(255,45,120,0.15); border: 1px solid rgba(255,45,120,0.3);
          font-size: 12px; width: 28px; height: 28px; border-radius: 50%;
          cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
          text-shadow: 0 0 8px currentColor; transition: all 0.2s;
        }
        .mm-ui-arrow:hover { background: rgba(255,45,120,0.3); }

        .mm-ui-transform {
          width: 100%; padding: clamp(10px, 2vw, 16px) 16px;
          background: rgba(26,0,40,0.5); border: 2px solid #ff2d78; border-radius: 8px;
          cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px;
          transition: all 0.3s;
          box-shadow: 0 0 15px rgba(255,45,120,0.15);
        }
        .mm-ui-transform:hover { box-shadow: 0 0 30px rgba(255,45,120,0.3); transform: scale(1.02); }
        .mm-ui-bk { font-size: clamp(18px, 3vw, 26px); font-family: serif; font-weight: 900; }
        .mm-ui-be { font-size: 10px; font-family: 'Space Mono', monospace; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.7); }

        .mm-ui-buy {
          padding: clamp(10px, 1.5vw, 14px) 12px;
          background: rgba(26,0,40,0.5); border: 2px solid #39ff14; border-radius: 8px;
          cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px;
          transition: all 0.3s; box-shadow: 0 0 12px rgba(57,255,20,0.12);
          text-decoration: none; color: inherit;
        }
        .mm-ui-buy:hover { box-shadow: 0 0 25px rgba(57,255,20,0.25); transform: scale(1.02); }
        .mm-ui-again { border-color: #00d4ff; box-shadow: 0 0 12px rgba(0,212,255,0.12); }
        .mm-ui-again:hover { border-color: #00d4ff; box-shadow: 0 0 25px rgba(0,212,255,0.25); }

        .mm-ui-lights { display: flex; gap: 10px; padding: 6px 0; }
        .mm-ui-light {
          width: 8px; height: 8px; border-radius: 50%;
          animation: mmLightChase 1s ease infinite;
        }

        /* ── Neon Lever ── */
        .mm-lever-btn {
          width: 100%; padding: clamp(8px, 1.5vw, 14px) 16px;
          background: rgba(26,0,40,0.5); border: 2px solid #ff2d78; border-radius: 8px;
          cursor: pointer; display: flex; align-items: center; gap: 16px;
          transition: all 0.3s;
          box-shadow: 0 0 15px rgba(255,45,120,0.15);
        }
        .mm-lever-btn:hover { box-shadow: 0 0 35px rgba(255,45,120,0.35); transform: scale(1.02); }
        .mm-lever-btn:hover .mm-lever-handle { transform: translateY(8px); }
        .mm-lever-track {
          width: 28px; height: 46px; position: relative;
          background: linear-gradient(180deg, rgba(255,45,120,0.1), rgba(255,45,120,0.3));
          border-radius: 14px; border: 1px solid rgba(255,45,120,0.4);
          flex-shrink: 0;
        }
        .mm-lever-handle {
          position: absolute; top: 4px; left: 50%; transform: translateX(-50%);
          width: 20px; height: 20px; border-radius: 50%;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .mm-lever-glow {
          position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%);
          width: 8px; height: 8px; border-radius: 50%;
          background: #39ff14; box-shadow: 0 0 6px #39ff14, 0 0 12px #39ff14;
          animation: mmLeverPulse 1.5s ease infinite;
        }
        .mm-lever-label { display: flex; flex-direction: column; align-items: center; gap: 3px; flex: 1; }

        /* ── Reward cards ── */
        .mm-rewards { display: flex; gap: 6px; width: 100%; }
        .mm-reward {
          flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px;
          padding: 5px 4px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          border-radius: 4px;
          animation: mmRewardPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .mm-reward-img {
          width: 100%; aspect-ratio: 16/9; overflow: hidden; border-radius: 3px;
          border: 1px solid rgba(255,255,255,0.08);
          background: #0a0a0a;
        }
        .mm-reward-img img, .mm-reward-img video {
          width: 100%; height: 100%; object-fit: cover; display: block;
        }
        .mm-reward-label { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .mm-reward-k {
          font-size: 12px; font-family: serif; font-weight: 700;
          text-shadow: 0 0 8px currentColor;
        }
        .mm-reward-en {
          font-size: 7px; font-family: 'Space Mono', monospace;
          letter-spacing: 0.15em; color: rgba(255,255,255,0.4);
          text-align: center;
        }
        @keyframes mmRewardPop {
          0% { opacity: 0; transform: scale(0.5) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* ── Light Show ── */
        .mm-lightshow {
          position: absolute; inset: 0; z-index: 50; pointer-events: none;
          animation: mmLightShow 3s ease-out forwards;
          border-radius: 12px; overflow: hidden;
        }
        .mm-lightshow::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 50%, transparent 30%, rgba(255,45,120,0.3) 60%, transparent 80%);
          animation: mmStrobeRotate 0.3s linear infinite;
        }
        .mm-lightshow::after {
          content: ''; position: absolute; inset: 0;
          animation: mmStrobe 0.15s steps(1) 6;
        }

        .mm-mint-btn {
          animation: mmMintPulse 2s ease-in-out infinite;
        }
        .mm-mint-btn:hover { animation: none; border-color: #39ff14; box-shadow: 0 0 30px rgba(57,255,20,0.3); }
        .mm-mint-btn:disabled { animation: none; opacity: 0.7; cursor: wait; }
        @keyframes mmMintPulse {
          0%, 100% { box-shadow: 0 0 8px rgba(57,255,20,0.15); }
          50% { box-shadow: 0 0 20px rgba(57,255,20,0.35); }
        }

        @keyframes mmLeverPulse { 0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(0.8); } 50% { opacity: 1; transform: translateX(-50%) scale(1.2); } }
        @keyframes mmPowerUp { 0% { transform: scale(0.5); opacity: 0; } 50% { transform: scale(1.3); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes mmLightShow { 0% { opacity: 1; } 70% { opacity: 0.8; } 100% { opacity: 0; } }
        @keyframes mmStrobeRotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes mmStrobe {
          0% { background: rgba(255,45,120,0.4); }
          16% { background: rgba(0,212,255,0.4); }
          33% { background: rgba(57,255,20,0.4); }
          50% { background: rgba(255,215,0,0.4); }
          66% { background: rgba(255,107,0,0.4); }
          83% { background: rgba(255,45,120,0.4); }
        }

        @keyframes mmFeedIn { 0% { transform: translateY(-100%) scale(0.8); opacity: 0; } 60% { transform: translateY(5%); opacity: 1; } 100% { transform: translateY(0); } }
        @keyframes mmBlink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0.3; } }
        @keyframes mmDotPulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        @keyframes mmLoadFill { 0% { width: 0; } 100% { width: 100%; } }
        @keyframes mmLoadShimmer { 0% { background-position: 0%; } 100% { background-position: 300%; } }
        @keyframes mmFlash { 0% { opacity: 0.8; } 100% { opacity: 0; } }

        .mm-printout-wrap {
          position: absolute; inset: 0;
          animation: mmPrintOut 2.2s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
          transform-origin: top center;
        }
        @keyframes mmPrintOut {
          0% { clip-path: inset(0 0 100% 0); transform: translateY(-8%); filter: brightness(2) contrast(0.5); }
          15% { clip-path: inset(0 0 85% 0); transform: translateY(-5%); filter: brightness(1.5) contrast(0.7); }
          40% { clip-path: inset(0 0 50% 0); transform: translateY(-3%); filter: brightness(1.2) contrast(0.85); }
          70% { clip-path: inset(0 0 15% 0); transform: translateY(-1%); filter: brightness(1.05) contrast(0.95); }
          85% { clip-path: inset(0 0 3% 0); transform: translateY(0); }
          100% { clip-path: inset(0 0 0 0); transform: translateY(0); filter: brightness(1) contrast(1); }
        }
        .mm-printout-edge {
          position: absolute; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
          animation: mmPrintEdge 2.2s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
          pointer-events: none; z-index: 10;
          box-shadow: 0 0 12px rgba(255,255,255,0.6), 0 2px 20px rgba(255,45,120,0.3);
        }
        @keyframes mmPrintEdge {
          0% { top: 0%; opacity: 1; }
          15% { top: 15%; }
          40% { top: 50%; }
          70% { top: 85%; }
          85% { top: 97%; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes mmLightChase { 0%, 100% { opacity: 0.2; transform: scale(0.7); } 50% { opacity: 1; transform: scale(1.2); } }

        .mm-neon-name {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 5;
          text-align: center; padding: 10px 8px;
          font-family: 'Impact', 'Arial Black', 'Haettenschweiler', sans-serif;
          font-size: clamp(16px, 3vw, 22px);
          font-weight: 900; text-transform: uppercase;
          letter-spacing: 0.12em;
          text-shadow: 0 0 7px currentColor, 0 0 20px currentColor, 0 0 40px currentColor;
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%);
          pointer-events: none;
        }
        .mm-neon-name-pulse { animation: mmNeonPulse 1.5s ease-in-out infinite; }
        .mm-neon-name-reveal { animation: mmNeonReveal 1s ease-out; }
        @keyframes mmNeonFlicker {
          0% { opacity: 0; } 20% { opacity: 1; } 25% { opacity: 0.3; }
          30% { opacity: 1; } 35% { opacity: 0.6; } 40% { opacity: 1; } 100% { opacity: 1; }
        }
        @keyframes mmNeonPulse {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; }
        }
        @keyframes mmNeonReveal {
          0% { opacity: 0; transform: translateY(10px); letter-spacing: 0.5em; }
          100% { opacity: 1; transform: translateY(0); letter-spacing: 0.12em; }
        }

        @media (max-width: 560px) {
          .mm-ui-thumb { width: 44px; height: 44px; }
          .mm-phase-preview { flex-direction: column; }
        }

        /* ── Speech Bubble ── */
        .mm-speech-bubble {
          position: absolute;
          left: calc(50% + 260px);
          top: 40%;
          pointer-events: auto;
          animation: mmBubblePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 1s both;
        }
        .mm-speech-text {
          background: rgba(10, 0, 18, 0.85);
          backdrop-filter: blur(12px);
          color: #fff;
          font-family: 'Bangers', 'Comic Sans MS', cursive;
          font-size: 16px;
          line-height: 1.5;
          letter-spacing: 0.04em;
          padding: 16px 20px;
          border-radius: 20px;
          border: 2px solid rgba(255, 45, 120, 0.6);
          box-shadow: 0 0 15px rgba(255, 45, 120, 0.3), 0 0 30px rgba(255, 45, 120, 0.1);
          max-width: 200px;
          text-align: center;
          position: relative;
        }
        .mm-speech-tail {
          position: absolute; left: -12px; top: 50%; transform: translateY(-50%);
          width: 0; height: 0;
          border-top: 10px solid transparent;
          border-bottom: 10px solid transparent;
          border-right: 14px solid rgba(255, 45, 120, 0.6);
        }
        @keyframes mmBubblePop {
          0% { opacity: 0; transform: scale(0.3); }
          100% { opacity: 1; transform: scale(1); }
        }
        @media (max-width: 900px) {
          .mm-speech-bubble { display: none; }
        }
      `}</style>
    </div>
  );
}
