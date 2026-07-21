import { useState, useEffect, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { MANGA_DROP_WORKS, MANGA_DROP_COLLECTION_URL } from '../../config/mangaDropWorks';

// ── THE MANGA MACHINE — THE DROP ──
// A collage hall you walk down: works float in your path and PART as you pass;
// the 14 films play LARGE; graffiti-collage walls + floor made from the works;
// spray cans at the mouth. Click any work → Objkt.

const W = 11, H = 7.4;
const GAP = 4.7;
const STILLS = MANGA_DROP_WORKS.filter((w) => w.type === 'still');
const FILMS = MANGA_DROP_WORKS.filter((w) => w.type === 'video');
const HALL_LEN = 10 + STILLS.length * GAP + 14;
const NEON = ['#ff2d78', '#00d4ff', '#ffd700', '#39ff14', '#ff6b00'];
// Neon graffiti signage along the walls (z spreads down the corridor).
const WALL_NEON = [
  { t: '漫画', s: 'MANGA', side: 1, y: 5.6, z: 22, c: '#ff2d78', size: 42 },
  { t: '手作り', s: 'PROOF OF HAND', side: -1, y: 5.4, z: 45, c: '#00d4ff', size: 34 },
  { t: 'ROPPONGI', s: '六本木', side: 1, y: 2.0, z: 68, c: '#ffd700', size: 26 },
  { t: 'PORCELAIN', s: '磁器', side: -1, y: 5.5, z: 92, c: '#ff2d78', size: 28 },
  { t: 'TEZOS', s: 'ON CHAIN', side: 1, y: 5.6, z: 116, c: '#39ff14', size: 30 },
  { t: 'THE DROP', s: '51 WORKS', side: -1, y: 2.1, z: 142, c: '#00d4ff', size: 28 },
  { t: 'OBJKT', s: 'COLLECT', side: 1, y: 5.5, z: 170, c: '#ff2d78', size: 34 },
  { t: 'ネオン', s: 'NEON', side: -1, y: 5.4, z: 200, c: '#ff6b00', size: 32 },
];
const smoothstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// Shared cache — every tile of the same artwork reuses ONE loaded texture.
const TEX_CACHE = new Map();
function useImgTexture(url) {
  const c = url && TEX_CACHE.get(url);
  const [tex, setTex] = useState(c ? c.tex : null);
  const [aspect, setAspect] = useState(c ? c.aspect : 1.6);
  useEffect(() => {
    if (!url) return;
    const hit = TEX_CACHE.get(url);
    if (hit) { setTex(hit.tex); setAspect(hit.aspect); return; }
    let live = true;
    new THREE.TextureLoader().load(url, (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      const asp = t.image ? t.image.width / t.image.height : 1.6;
      TEX_CACHE.set(url, { tex: t, aspect: asp });
      if (live) { setTex(t); setAspect(asp); }
    });
    return () => { live = false; };
  }, [url]);
  return [tex, aspect];
}

// A floating STILL that parts to the wall as you approach.
function FloatingStill({ work, z0, restX, restY, side, neon }) {
  const ref = useRef();
  const [tex, aspect] = useImgTexture(work.image);
  const [hovered, setHovered] = useState(false);
  useFrame((state) => {
    const g = ref.current; if (!g) return;
    const cz = state.camera.position.z;
    const pr = smoothstep(z0 - 12, z0 - 1.5, cz);
    const x = restX + (side * (W / 2 - 0.85) - restX) * pr;
    const y = restY + Math.sin(state.clock.elapsedTime * 0.6 + z0) * 0.12;
    g.position.set(x, y, z0 + pr * 2.4 + (hovered ? -0.5 : 0));
    g.lookAt(state.camera.position.x, y, state.camera.position.z);
    const s = (hovered ? 1.12 : 1) * (0.9 + pr * 0.22);
    g.scale.set(s, s, s);
  });
  const Wd = 2.9, Hd = Wd / aspect;
  const open = () => window.open(work.objkt, '_blank', 'noopener,noreferrer');
  return (
    <group ref={ref} position={[restX, restY, z0]}>
      <mesh position={[0, 0, -0.03]}><planeGeometry args={[Wd + 0.5, Hd + 0.5]} /><meshBasicMaterial color={neon} toneMapped={false} transparent opacity={hovered ? 0.4 : 0.16} /></mesh>
      <mesh position={[0, 0, -0.02]}><planeGeometry args={[Wd + 0.12, Hd + 0.12]} /><meshBasicMaterial color="#17121a" toneMapped={false} /></mesh>
      <mesh key={tex ? 'art' : 'ph'} onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }} onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }} onClick={open}>
        <planeGeometry args={[Wd, Hd]} /><meshBasicMaterial map={tex || null} color={tex ? '#fff' : '#2a2030'} toneMapped={false} />
      </mesh>
      <Html position={[0, -Hd / 2 - 0.28, 0.02]} center distanceFactor={7} style={{ pointerEvents: 'none' }}>
        <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
          <div style={{ fontFamily: '"Anton", sans-serif', fontSize: '11px', letterSpacing: '0.12em', color: '#fff', textShadow: '0 0 8px #000' }}>{work.title}</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', letterSpacing: '0.2em', color: neon, marginTop: '2px', textShadow: `0 0 6px ${neon}` }}>MINT ON OBJKT →</div>
        </div>
      </Html>
    </group>
  );
}

// A large FILM panel — plays video when near the camera, poster otherwise.
function FilmPanel({ work, z0, side, neon }) {
  const ref = useRef();
  const [poster, aspect] = useImgTexture(work.image);
  const vtexRef = useRef(null);
  const vidRef = useRef(null);
  const pvTexRef = useRef(null);                  // animated poster (small 5s loop)
  const pvVidRef = useRef(null);
  const [active, setActive] = useState(false);    // true once you approach it → full film loads
  const [vis, setVis] = useState(false);          // true when in view → animated poster loops
  const [, forceRender] = useState(0);
  const [hovered, setHovered] = useState(false);
  const playing = useRef(false);
  const previewSrc = work.video ? work.video.replace(/\.mp4$/, '-preview.mp4') : null;

  // Create the FULL film ONLY when the panel first becomes active (near camera).
  useEffect(() => {
    if (!active) return;
    const v = document.createElement('video');
    v.src = work.video; v.loop = true; v.muted = true; v.playsInline = true; v.preload = 'auto';
    const vt = new THREE.VideoTexture(v); vt.colorSpace = THREE.SRGBColorSpace; vt.minFilter = THREE.LinearFilter;
    vidRef.current = v; vtexRef.current = vt;
    v.play().then(() => { playing.current = true; forceRender((n) => n + 1); }).catch(() => {});
    return () => { v.pause(); v.src = ''; vt.dispose(); vidRef.current = null; vtexRef.current = null; playing.current = false; };
  }, [active, work.video]);

  // Create the ANIMATED POSTER (tiny looping clip) whenever the panel is in view.
  useEffect(() => {
    if (!vis || !previewSrc) return;
    const v = document.createElement('video');
    v.src = previewSrc; v.loop = true; v.muted = true; v.playsInline = true; v.preload = 'auto';
    const vt = new THREE.VideoTexture(v); vt.colorSpace = THREE.SRGBColorSpace; vt.minFilter = THREE.LinearFilter;
    pvVidRef.current = v; pvTexRef.current = vt;
    v.play().then(() => { forceRender((n) => n + 1); }).catch(() => {});
    return () => { v.pause(); v.src = ''; vt.dispose(); pvVidRef.current = null; pvTexRef.current = null; };
  }, [vis, previewSrc]);

  useFrame((state) => {
    const g = ref.current; if (!g) return;
    const cz = state.camera.position.z;
    const restX = side * 2.6;
    const pr = smoothstep(z0 - 16, z0 - 2, cz);
    const x = restX + (side * (W / 2 - 1.0) - restX) * pr;
    g.position.set(x, H / 2, z0 + pr * 3);
    g.lookAt(state.camera.position.x, H / 2, state.camera.position.z);
    const near = Math.abs(cz - z0) < 30;
    const visible = Math.abs(cz - z0) < 95;   // wide: the whole corridor of films stays alive
    if (near && !active) setActive(true);
    if (visible && !vis) setVis(true);
    else if (!visible && vis) setVis(false);
    if (vidRef.current) {
      if (near && vidRef.current.paused) { vidRef.current.play().then(() => { playing.current = true; }).catch(() => {}); }
      else if (!near && !vidRef.current.paused) { vidRef.current.pause(); playing.current = false; }
    }
    // Animated poster loops while in view, but yields to the full film up close.
    if (pvVidRef.current) {
      const want = visible && !near;
      if (want && pvVidRef.current.paused) { pvVidRef.current.play().catch(() => {}); }
      else if (!want && !pvVidRef.current.paused) { pvVidRef.current.pause(); }
    }
  });

  const Wd = 5.6, Hd = Wd / (aspect || 1.7);
  const map = (playing.current && vtexRef.current) ? vtexRef.current
            : (pvTexRef.current || poster || null);
  const texKey = playing.current ? 'vid' : (pvTexRef.current ? 'prev' : (poster ? 'post' : 'none'));
  const open = () => window.open(work.objkt, '_blank', 'noopener,noreferrer');
  return (
    <group ref={ref} position={[side * 2.6, H / 2, z0]}>
      <pointLight position={[0, 0, 2.5]} color={neon} intensity={hovered ? 3 : 1.6} distance={12} decay={2} />
      <mesh position={[0, 0, -0.04]}><planeGeometry args={[Wd + 0.6, Hd + 0.6]} /><meshBasicMaterial color={neon} toneMapped={false} transparent opacity={0.22} /></mesh>
      <mesh position={[0, 0, -0.02]}><planeGeometry args={[Wd + 0.18, Hd + 0.18]} /><meshBasicMaterial color="#0a0a0c" toneMapped={false} /></mesh>
      <mesh key={texKey} onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }} onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }} onClick={open}>
        <planeGeometry args={[Wd, Hd]} /><meshBasicMaterial map={map} color={map ? '#fff' : '#241a2a'} toneMapped={false} />
      </mesh>
      <Html position={[0, -Hd / 2 - 0.34, 0.02]} center distanceFactor={8} style={{ pointerEvents: 'none' }}>
        <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
          <div style={{ fontFamily: '"Anton", sans-serif', fontSize: '13px', letterSpacing: '0.12em', color: '#fff', textShadow: '0 0 8px #000' }}>▶ {work.title}</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '0.2em', color: neon, marginTop: '2px', textShadow: `0 0 6px ${neon}` }}>FILM · MINT ON OBJKT →</div>
        </div>
      </Html>
    </group>
  );
}

// Dim graffiti-collage WALL — works tiled as wallpaper behind the floating layer.
function CollageWallTile({ url, position, rotation, w, h }) {
  const [tex] = useImgTexture(url);
  return <mesh key={tex ? 'a' : 'b'} position={position} rotation={rotation}><planeGeometry args={[w, h]} /><meshBasicMaterial map={tex || null} color={tex ? '#5a5560' : '#140d13'} toneMapped={false} /></mesh>;
}
function CollageWalls() {
  const urls = MANGA_DROP_WORKS.map((w) => w.image);
  const tileW = 4.2, rows = 2, tileH = H / rows;
  const cols = Math.ceil(HALL_LEN / tileW);
  const out = [];
  let k = 0;
  for (const side of [-1, 1]) for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    out.push(<CollageWallTile key={`w${side}${r}${c}`} url={urls[k % urls.length]} position={[side * (W / 2 + 0.02), (r + 0.5) * tileH, 4 + (c + 0.5) * tileW]} rotation={[0, side < 0 ? Math.PI / 2 : -Math.PI / 2, 0]} w={tileW - 0.05} h={tileH - 0.05} />);
    k++;
  }
  return out;
}
// Graffiti-collage FLOOR from the works.
function CollageFloor() {
  const urls = MANGA_DROP_WORKS.map((w) => w.image);
  const tile = 6, cols = Math.ceil(HALL_LEN / tile), lanes = 2;
  const out = [];
  let k = 0;
  const laneW = W / lanes;
  for (let l = 0; l < lanes; l++) for (let c = 0; c < cols; c++) {
    const x = (l - (lanes - 1) / 2) * laneW;
    out.push(<CollageWallTile key={`f${l}${c}`} url={urls[(k * 3) % urls.length]} position={[x, 0.01, 3 + (c + 0.5) * tile]} rotation={[-Math.PI / 2, 0, Math.PI]} w={laneW - 0.06} h={tile - 0.06} />);
    k++;
  }
  return out;
}

// Rotating spray can, wrapped with a work, with a floating Japanese neon label.
function SprayCan({ x, z, url, cap, label, color = '#ff2d78', scale = 1 }) {
  const g = useRef();
  const [tex] = useImgTexture(url);
  useFrame((_, d) => { if (g.current) g.current.rotation.y += d * 0.5; });
  const R = 0.95, bodyH = 4.4;
  return (
    <group position={[x, 0, z]} scale={scale}>
      {label && (
        <group position={[0, bodyH + 1.7, 0]}>
          <pointLight color={color} intensity={1.8} distance={6} decay={2} />
          <Html center distanceFactor={6} style={{ pointerEvents: 'none' }}>
            <div style={{ fontFamily: 'serif', fontWeight: 900, fontSize: '34px', color, textShadow: `0 0 10px ${color}, 0 0 28px ${color}, 0 0 56px ${color}80`, whiteSpace: 'nowrap' }}>{label}</div>
          </Html>
        </group>
      )}
      <group ref={g}>
        <mesh position={[0, 0.06, 0]}><cylinderGeometry args={[R * 1.02, R * 1.02, 0.12, 40]} /><meshStandardMaterial color="#c9ccd4" metalness={0.9} roughness={0.35} /></mesh>
        <mesh key={tex ? 'a' : 'b'} position={[0, bodyH / 2 + 0.1, 0]}><cylinderGeometry args={[R, R, bodyH, 60, 1, true]} /><meshBasicMaterial map={tex || null} color={tex ? '#fff' : '#333'} toneMapped={false} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, bodyH + 0.5, 0]}><cylinderGeometry args={[R * 0.6, R, 0.8, 40]} /><meshStandardMaterial color="#d5d8df" metalness={0.9} roughness={0.3} /></mesh>
        <mesh position={[0, bodyH + 1.5, 0]}><cylinderGeometry args={[R * 0.62, R * 0.62, 1.2, 40]} /><meshStandardMaterial color={cap} metalness={0.1} roughness={0.35} /></mesh>
      </group>
    </group>
  );
}

function SprayMist({ count = 380 }) {
  const ref = useRef();
  const pos = useMemo(() => { const p = new Float32Array(count * 3); for (let i = 0; i < count; i++) { p[i * 3] = (Math.random() - 0.5) * W; p[i * 3 + 1] = Math.random() * H; p[i * 3 + 2] = Math.random() * HALL_LEN; } return p; }, [count]);
  useFrame((_, d) => { if (!ref.current) return; const a = ref.current.geometry.attributes.position; for (let i = 0; i < count; i++) { a.array[i * 3 + 1] -= d * 0.45; if (a.array[i * 3 + 1] < 0) a.array[i * 3 + 1] = H; } a.needsUpdate = true; });
  return <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" count={count} array={pos} itemSize={3} /></bufferGeometry><pointsMaterial size={0.045} color="#ff8fc4" transparent opacity={0.32} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></points>;
}

function NeonSign({ text, sub, position, rotation = [0, 0, 0], color = '#ff2d78', subColor, size = 44, href, billboard = false }) {
  const inner = (
    <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
      <div style={{ fontSize: `${size}px`, fontWeight: 900, color, textShadow: `0 0 10px ${color}, 0 0 30px ${color}, 0 0 60px ${color}80`, fontFamily: 'serif', lineHeight: 1.1 }}>{text}</div>
      {sub && <div style={{ fontSize: `${size * 0.4}px`, fontFamily: "'Space Mono', monospace", letterSpacing: '0.35em', textTransform: 'uppercase', color: subColor || `${color}aa`, textShadow: `0 0 10px ${subColor || color}80`, marginTop: '8px' }}>{sub}</div>}
    </div>
  );
  const content = href ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{inner}</a> : inner;
  return (
    <group position={position} rotation={rotation}>
      <pointLight color={color} intensity={2.4} distance={12} decay={2} />
      {billboard
        ? <Html center distanceFactor={typeof window !== 'undefined' && window.innerWidth < 700 ? 6 : 11} style={{ pointerEvents: href ? 'auto' : 'none' }}>{content}</Html>
        : <Html center transform distanceFactor={8} style={{ pointerEvents: href ? 'auto' : 'none' }}>{content}</Html>}
    </group>
  );
}

// Glowing neon strip lights running along both walls.
function NeonStrips() {
  const cols = ['#ff2d78', '#00d4ff', '#39ff14', '#ffd700', '#ff6b00'];
  const segs = Math.ceil(HALL_LEN / 12);
  const out = [];
  for (const side of [-1, 1]) for (let i = 0; i < segs; i++) {
    const z = 8 + (i + 0.5) * (HALL_LEN / segs);
    const y = i % 2 === 0 ? 6.4 : 0.8;   // alternate high / low strip
    const c = cols[i % cols.length];
    out.push(
      <group key={`${side}${i}`} position={[side * (W / 2 - 0.06), y, z]} rotation={[0, side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
        <mesh><boxGeometry args={[HALL_LEN / segs - 1, 0.14, 0.06]} /><meshBasicMaterial color={c} toneMapped={false} /></mesh>
        <pointLight color={c} intensity={1.6} distance={9} decay={2} />
      </group>
    );
  }
  return out;
}

function GlideCamera() {
  const { camera } = useThree();
  const cur = useRef(0), target = useRef(0);
  useEffect(() => {
    const onScroll = () => { const max = document.body.scrollHeight - window.innerHeight; target.current = max > 0 ? window.scrollY / max : 0; };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useFrame(({ clock }) => {
    cur.current += (target.current - cur.current) * 0.06;
    const z = 0.5 + (HALL_LEN - 3) * cur.current;
    const sway = Math.sin(clock.elapsedTime * 0.35) * 0.3;
    camera.position.set(sway, H / 2, z);
    camera.lookAt(sway * 0.4, H / 2, z + 8);
  });
  return null;
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[0, 8, 4]} color="#ffd6ea" intensity={0.35} />
      <fog attach="fog" args={['#120612', 11, 52]} />

      <CollageFloor />
      <CollageWalls />
      <NeonStrips />

      {/* FRONT sign — THE MANGA MACHINE · OBJKT (faces the camera) */}
      <NeonSign text="THE MANGA MACHINE" sub="— OBJKT" position={[0, H / 2 + 0.8, 5.5]} billboard color="#ff2d78" subColor="#00d4ff" size={30} href={MANGA_DROP_COLLECTION_URL} />

      {/* neon graffiti along the walls */}
      {WALL_NEON.map((n, i) => (
        <NeonSign key={i} text={n.t} sub={n.s} position={[n.side * (W / 2 - 0.15), n.y, n.z]} rotation={[0, n.side > 0 ? -Math.PI / 2 : Math.PI / 2, 0]} color={n.c} size={n.size} />
      ))}

      {/* END wall + big neon finale (faces the camera; click → Objkt) */}
      <mesh position={[0, H / 2, HALL_LEN + 0.9]}><planeGeometry args={[W + 3, H + 4]} /><meshStandardMaterial color="#0b050a" roughness={0.95} /></mesh>
      <mesh position={[0, H / 2, HALL_LEN + 0.85]}><planeGeometry args={[W + 3, H + 4]} /><meshBasicMaterial color="#ff2d78" transparent opacity={0.05} toneMapped={false} /></mesh>
      <NeonSign text="PORCELAIN ANDROID" sub="Collect on Objkt →" position={[0, H / 2 + 0.2, HALL_LEN - 0.7]} billboard color="#ff2d78" subColor="#00d4ff" size={34} href={MANGA_DROP_COLLECTION_URL} />

      {/* spray cans at the mouth */}
      {/* spray cans at the mouth — with floating Japanese neon */}
      <SprayCan x={-W / 2 + 1.3} z={5.5} url={STILLS[0]?.image} cap="#ff2d78" label="ネオン" color="#ff2d78" />
      <SprayCan x={W / 2 - 1.3} z={5.5} url={STILLS[3]?.image} cap="#00d4ff" label="漫画" color="#00d4ff" />

      {/* a line of spray cans at the end, flanking the finale sign */}
      {[
        { l: '東京', c: '#ff2d78', x: -4.4 },
        { l: '夜', c: '#00d4ff', x: -2.6 },
        { l: '磁器', c: '#ffd700', x: 2.6 },
        { l: '天使', c: '#39ff14', x: 4.4 },
      ].map((n, i) => (
        <SprayCan key={n.l} x={n.x} z={HALL_LEN - 1.8} url={STILLS[(i + 6) % STILLS.length]?.image} cap={n.c} label={n.l} color={n.c} scale={0.8} />
      ))}

      {/* films — spaced through the hall, large + playing */}
      {FILMS.map((work, i) => (
        <FilmPanel key={work.slug} work={work} z0={16 + i * (HALL_LEN - 30) / FILMS.length} side={i % 2 === 0 ? -1 : 1} neon={NEON[i % NEON.length]} />
      ))}

      {/* floating stills that part as you pass */}
      {STILLS.map((work, i) => {
        const side = i % 2 === 0 ? 1 : -1;
        const z0 = 11 + i * GAP;
        const restX = side * (0.5 + ((i * 7) % 5) * 0.3);
        const restY = 2.0 + ((i * 11) % 40) / 10;
        return <FloatingStill key={work.slug} work={work} z0={z0} restX={restX} restY={restY} side={side} neon={NEON[i % NEON.length]} />;
      })}

      <SprayMist count={380} />
    </>
  );
}

export default function MangaMachineDrop() {
  const audioRef = useRef(null);
  const [music, setMusic] = useState(false);
  const [entered, setEntered] = useState(false);
  const toggleMusic = () => {
    const a = audioRef.current; if (!a) return;
    if (a.paused) { a.volume = 0.55; a.play().then(() => setMusic(true)).catch(() => {}); }
    else { a.pause(); setMusic(false); }
  };
  // Entering starts the soundtrack (a real click = the gesture browsers require).
  const enter = () => {
    setEntered(true);
    const a = audioRef.current;
    if (a && a.paused) { a.volume = 0.55; a.play().then(() => setMusic(true)).catch(() => {}); }
  };
  return (
    <div style={{ background: '#120612' }}>
      <Helmet>
        <title>The Manga Machine — The Drop</title>
        <meta name="description" content="THE MANGA MACHINE — The Drop. An evolving collection of neon Roppongi stills and AI films on Tezos / Objkt by Miss AL Simpson. Walk the collage hall and collect." />
      </Helmet>

      <audio ref={audioRef} src="/androids/manga-drop/manga-machine-music.mp3" loop preload="auto" />
      <button
        onClick={toggleMusic}
        aria-label="Toggle music"
        style={{ position: 'fixed', top: '72px', right: '20px', zIndex: 3, width: '44px', height: '44px', borderRadius: '50%', border: '1px solid rgba(255,45,120,0.6)', background: music ? '#ff2d78' : 'rgba(10,6,14,0.7)', color: '#fff', cursor: 'pointer', fontSize: '16px', boxShadow: music ? '0 0 20px rgba(255,45,120,0.6)' : 'none' }}
      >
        {music ? '♫' : '♪'}
      </button>

      {/* ENTER title card */}
      {!entered && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10, background: 'radial-gradient(ellipse at center, #1c0716 0%, #08040a 72%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
          <div style={{ fontFamily: 'serif', fontWeight: 900, color: '#ff2d78', fontSize: 'clamp(34px, 8vw, 72px)', letterSpacing: '0.04em', textShadow: '0 0 12px #ff2d78, 0 0 44px #ff2d78, 0 0 90px #ff2d7880', lineHeight: 1.05 }}>漫画マシン</div>
          <div style={{ fontFamily: 'serif', fontWeight: 900, color: '#fff', fontSize: 'clamp(20px, 4.5vw, 42px)', letterSpacing: '0.06em', marginTop: '6px', textShadow: '0 0 22px rgba(255,45,120,0.55)' }}>THE MANGA MACHINE</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 'clamp(9px, 2.5vw, 12px)', letterSpacing: '0.35em', color: '#00d4ff', textTransform: 'uppercase', marginTop: '12px', textShadow: '0 0 10px #00d4ff88' }}>THE DROP · TEZOS · OBJKT</div>
          <button onClick={enter} style={{ marginTop: '34px', padding: '16px 46px', background: '#ff2d78', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: "'Space Mono', monospace", fontSize: 'clamp(13px, 3vw, 16px)', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', boxShadow: '0 0 30px rgba(255,45,120,0.6)', display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontFamily: 'serif', fontSize: '1.35em' }}>入場</span> ENTER
          </button>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 'clamp(8px, 2vw, 10px)', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.42)', textTransform: 'uppercase', marginTop: '22px' }}>scroll to walk · click any work to collect on objkt · ♪ soundtrack</div>
        </div>
      )}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <Canvas camera={{ position: [0, H / 2, 0.5], fov: 68 }} dpr={[1, 1.7]} gl={{ antialias: true }}>
          <GlideCamera />
          <Scene />
        </Canvas>
      </div>
      <div style={{ position: 'relative', height: `${Math.max(400, STILLS.length * 48)}vh`, pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, padding: '22px 26px', zIndex: 2, pointerEvents: 'none', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', letterSpacing: '0.4em', color: 'rgba(255,45,120,0.85)', textTransform: 'uppercase' }}>THE MANGA MACHINE · THE DROP · TEZOS</div>
      </div>
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '20px 26px 26px', zIndex: 2, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '12px', pointerEvents: 'none' }}>Scroll to walk · works part as you pass · films play large · click any to collect on Objkt</div>
        <a href={MANGA_DROP_COLLECTION_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 24px', background: '#ff2d78', color: '#fff', fontFamily: "'Space Mono', monospace", fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none', borderRadius: '6px', boxShadow: '0 0 24px rgba(255,45,120,0.5)' }}>マシン View the full collection on Objkt →</a>
      </div>
    </div>
  );
}
