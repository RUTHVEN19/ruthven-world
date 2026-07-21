import { Suspense, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { FILMS, DIAMOND_DRONES_FILMS } from '../../config/cinemaFilms';
import { serif, mono } from './portfolioStyle';

// AI Cinema — a first-person PARALLAX 3D CINEMA ROOM. You sit at the back of a
// stadium-seated theatre facing a big screen playing the reel. The camera eases
// toward the cursor (near seats parallax against the far screen) with a gentle
// auto-sway. Click the screen (or a film in the side playlist) to change film.
// The four Diamond Drones films lead, then every Drones of Suburbia™ film.

const REEL = [...DIAMOND_DRONES_FILMS, ...FILMS];
const ROOM = { W: 13, H: 7.4, D: 20 };
const cap = { fontFamily: mono, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase' };

// ── Stadium seat rows receding from the screen (front) to the camera (back).
//    They're the parallax layers — near rows shift most as the camera drifts.
function Seats() {
  const { W, D } = ROOM;
  const rows = 6, perRow = 11;
  const seats = [];
  for (let r = 0; r < rows; r++) {
    const t = r / (rows - 1);
    const z = 4 + t * (D - 11);        // front(screen) → stop well short of the camera
    const riser = t * 1.15;            // gentle rake — kept low so seats never block the screen
    for (let c = 0; c < perRow; c++) {
      const x = (c - (perRow - 1) / 2) * (W * 0.86 / perRow);
      seats.push([x, riser, z]);
    }
  }
  return seats.map(([x, y, z], i) => (
    <group key={i} position={[x, y, z]}>
      <mesh position={[0, 0.28, 0]}><boxGeometry args={[0.5, 0.55, 0.5]} /><meshStandardMaterial color="#0d0e12" roughness={0.85} /></mesh>
      <mesh position={[0, 0.72, 0.2]}><boxGeometry args={[0.5, 0.5, 0.14]} /><meshStandardMaterial color="#14151c" roughness={0.7} /></mesh>
    </group>
  ));
}

// ── The room shell + big screen. Screen sits on the front wall (z=0), the film
//    playing on a VideoTexture; clicking it advances the reel. The screen is
//    SIZED TO THE FILM'S ASPECT (some films are portrait, e.g. Drone Driver /
//    Les Drones) so it fills its frame without stretching — fit inside a max box.
function CinemaRoom({ tex, aspect, onScreenClick }) {
  const { W, H, D } = ROOM;
  const glow = useRef();
  const maxW = W * 0.74, maxH = H * 0.72;
  // fit the film into the max box: width-bound for landscape, height-bound for portrait
  const sw = aspect >= maxW / maxH ? maxW : maxH * aspect;
  const sh = aspect >= maxW / maxH ? maxW / aspect : maxH;
  const cy = H * 0.5;
  useFrame((s) => { if (glow.current) glow.current.intensity = 9 + Math.sin(s.clock.elapsedTime * 1.4) * 2.5; });
  return (
    <group>
      {/* room shell */}
      <mesh position={[0, H / 2, 0]}><planeGeometry args={[W, H]} /><meshStandardMaterial color="#070709" roughness={1} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, H / 2, D]} rotation={[0, Math.PI, 0]}><planeGeometry args={[W, H]} /><meshStandardMaterial color="#08090c" roughness={1} side={THREE.DoubleSide} /></mesh>
      <mesh position={[-W / 2, H / 2, D / 2]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[D, H]} /><meshStandardMaterial color="#0c0d12" roughness={1} side={THREE.DoubleSide} /></mesh>
      <mesh position={[W / 2, H / 2, D / 2]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[D, H]} /><meshStandardMaterial color="#0c0d12" roughness={1} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, H, D / 2]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[W, D]} /><meshStandardMaterial color="#060608" roughness={1} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 0, D / 2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[W, D]} /><meshStandardMaterial color="#0a0a0d" roughness={0.5} metalness={0.2} /></mesh>

      {/* CLICKABLE screen (advances the reel). Dark until the texture is ready. */}
      <group
        onClick={e => { e.stopPropagation(); onScreenClick(); }}
        onPointerOver={e => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <mesh position={[0, cy, 0.1]}><planeGeometry args={[sw + 0.34, sh + 0.34]} /><meshBasicMaterial color="#0c0d12" toneMapped={false} fog={false} /></mesh>
        <mesh position={[0, cy, 0.18]}>
          <planeGeometry args={[sw, sh]} />
          <meshBasicMaterial map={tex || null} color={tex ? '#ffffff' : '#0a0a0d'} toneMapped={false} fog={false} />
        </mesh>
      </group>

      {/* screen spill (pulsing) + two warm aisle sconces */}
      <pointLight ref={glow} position={[0, cy, 2]} intensity={9} distance={26} decay={1.5} color="#dfeaff" />
      <pointLight position={[-W / 2 + 0.4, H * 0.66, D * 0.5]} intensity={4.5} distance={10} decay={1.7} color="#ffdca8" />
      <pointLight position={[W / 2 - 0.4, H * 0.66, D * 0.5]} intensity={4.5} distance={10} decay={1.7} color="#ffdca8" />

      <Seats />
    </group>
  );
}

// ── Parallax rig: ease the camera toward the cursor + a slow auto-sway, always
//    looking at the screen. True depth → near seats parallax against the screen.
function Rig() {
  const { camera } = useThree();
  const ptr = useRef([0, 0]);
  useEffect(() => {
    const m = e => { ptr.current = [(e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1]; };
    window.addEventListener('pointermove', m);
    return () => window.removeEventListener('pointermove', m);
  }, []);
  useFrame((s) => {
    const [px, py] = ptr.current;
    const t = s.clock.elapsedTime;
    const tx = px * 2.4 + Math.sin(t * 0.25) * 0.4;
    const ty = 3.6 - py * 0.8 + Math.sin(t * 0.32) * 0.12;   // seated high at the back → looks over the seats
    camera.position.x += (tx - camera.position.x) * 0.05;
    camera.position.y += (ty - camera.position.y) * 0.05;
    camera.position.z = ROOM.D - 3.5;
    camera.lookAt(0, ROOM.H * 0.5, 0);
  });
  return null;
}

export default function PortfolioCinema() {
  const [active, setActive] = useState(0);
  const [tex, setTex] = useState(null);
  const [aspect, setAspect] = useState(16 / 9);   // screen sizes to the active film
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);

  // Create the video element + VideoTexture entirely inside the effect (held in
  // state) so it survives StrictMode remounts — same pattern as the shop's screen.
  useEffect(() => {
    const v = document.createElement('video');
    v.src = REEL[0].src; v.loop = true; v.muted = true; v.autoplay = true;
    v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'auto';
    v.style.cssText = 'position:fixed;left:-20px;top:-20px;width:2px;height:2px;opacity:0;pointer-events:none';
    // read each film's real dimensions → the screen plane resizes to match (fires
    // again on every src swap, so portrait films get a portrait screen).
    const onMeta = () => { if (v.videoWidth && v.videoHeight) setAspect(v.videoWidth / v.videoHeight); };
    v.addEventListener('loadedmetadata', onMeta);
    document.body.appendChild(v);
    v.play().catch(() => {});
    const t = new THREE.VideoTexture(v); t.colorSpace = THREE.SRGBColorSpace;
    videoRef.current = v;
    setTex(t);
    return () => { v.removeEventListener('loadedmetadata', onMeta); v.pause(); v.remove(); t.dispose(); setTex(null); videoRef.current = null; };
  }, []);

  // Swap the film when the selection changes.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.src = REEL[active].src;
    v.play().catch(() => {});
  }, [active]);

  // Sound toggle (browsers allow unmuting after a user gesture; the toggle IS one).
  useEffect(() => { if (videoRef.current) videoRef.current.muted = muted; }, [muted]);

  const next = () => setActive(a => (a + 1) % REEL.length);
  const film = REEL[active];

  return (
    <div style={{ position: 'relative', height: 'calc(100vh - 70px)', background: '#000', color: '#fff', overflow: 'hidden' }}>
      <Helmet>
        <title>Miss AL Simpson — AI Cinema</title>
        <meta name="description" content="The Drones of Suburbia™ — AI Cinema by Miss AL Simpson, in a 3D parallax cinema room. Exhibited and sold at Sotheby's, New York." />
        <style>{`html,body{margin:0;background:#000;}`}</style>
      </Helmet>

      <Canvas camera={{ position: [0, 3.6, ROOM.D - 3.5], fov: 44 }} dpr={[1, 2]} gl={{ antialias: true }} style={{ position: 'absolute', inset: 0 }}>
        <color attach="background" args={['#050506']} />
        <fog attach="fog" args={['#060608', 12, 48]} />
        <ambientLight intensity={0.35} />
        <hemisphereLight args={['#dfe6ff', '#0a0a0e', 0.35]} />
        <Suspense fallback={null}>
          <CinemaRoom tex={tex} aspect={aspect} onScreenClick={next} />
        </Suspense>
        <Rig />
      </Canvas>

      {/* ── DOM overlays ── */}
      {/* radial vignette */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)' }} />

      {/* title / label — top-left */}
      <div style={{ position: 'absolute', left: 'clamp(20px,4vw,52px)', top: 26, pointerEvents: 'none' }}>
        <div style={{ ...cap, color: 'rgba(255,255,255,0.6)' }}>AI Cinema · The Drones of Suburbia™</div>
        <div style={{ fontFamily: serif, fontSize: 'clamp(26px,4vw,46px)', marginTop: 8, lineHeight: 1 }}>{film.title}</div>
        <div style={{ ...cap, color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>
          {String(active + 1).padStart(2, '0')} / {String(REEL.length).padStart(2, '0')} · {film.sub}
        </div>
      </div>

      {/* sound toggle — top-left under title */}
      <button
        onClick={() => setMuted(m => !m)}
        style={{
          position: 'absolute', left: 'clamp(20px,4vw,52px)', bottom: 30, ...cap,
          color: '#fff', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.28)',
          borderRadius: 999, padding: '9px 16px', cursor: 'pointer', backdropFilter: 'blur(10px)',
        }}
      >
        {muted ? '♪ Sound off' : '♫ Sound on'}
      </button>

      {/* hint — bottom-centre */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 30, textAlign: 'center', ...cap, color: 'rgba(255,255,255,0.5)', pointerEvents: 'none' }}>
        Move to look · click the screen for the next film
      </div>

      {/* playlist — right side, scrollable, click to select */}
      <nav style={{
        position: 'absolute', right: 'clamp(12px,2vw,28px)', top: '50%', transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', gap: 6, zIndex: 20,
        maxHeight: '70%', overflowY: 'auto', paddingRight: 4,
      }}>
        {REEL.map((f, i) => (
          <button
            key={f.src}
            onClick={() => setActive(i)}
            title={f.title}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
              background: i === active ? 'rgba(255,255,255,0.12)' : 'transparent',
              border: '1px solid ' + (i === active ? 'rgba(255,255,255,0.4)' : 'transparent'),
              borderRadius: 8, padding: '7px 11px', cursor: 'pointer', color: '#fff',
              backdropFilter: i === active ? 'blur(8px)' : 'none', transition: 'all .2s',
            }}
          >
            <span style={{
              width: 7, height: 7, borderRadius: '50%', flex: '0 0 auto',
              background: i === active ? '#fff' : 'rgba(255,255,255,0.35)',
              boxShadow: i === active ? '0 0 8px rgba(255,255,255,0.9)' : 'none',
            }} />
            <span style={{ ...cap, fontSize: 10, color: i === active ? '#fff' : 'rgba(255,255,255,0.6)' }}>
              {f.title}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
