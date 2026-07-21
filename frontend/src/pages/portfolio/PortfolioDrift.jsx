import { Suspense, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, Preload } from '@react-three/drei';
import * as THREE from 'three';
import { inkInterventions, thumb } from '../../config/portfolioData';
import { usePortfolio } from './PortfolioContext';
import { serif, mono } from './portfolioStyle';

// PortfolioDrift — the site's ENTRANCE. A scroll-driven "digital museum": the
// artist's Ink Interventions float, together with abstract 3D forms, in a dark
// fogged void. Native page scroll dollies the camera straight down the corridor
// so nearer works part around you and far ones drift up slowly (true
// perspective parallax). An oversized editorial type layer — including the
// Sotheby's provenance — rides over the top as real DOM.
//
// Architecture: a pinned (sticky) full-viewport Canvas behind a tall stack of
// scroll sections. Scroll progress drives the camera. This is deliberately NOT
// drei ScrollControls — its HTML portal wouldn't commit on this three/drei
// pair, and real DOM sections are more robust + prerenderable for SEO.

const VOID = '#05060a';
const GAP = 3.0;        // z-distance between works down the corridor
const PICKS = 60;       // how many works hang in the drift
const TRAVEL = (PICKS - 1) * GAP + 12;

// The Sotheby's lot page for Les Drones de la Banlieue.
const SOTHEBYS_URL = 'https://www.sothebys.com/en/buy/auction/2025/contemporary-discoveries-2/les-drones-de-la-banlieue';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (seed) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// One floating artwork. The plane is scaled to the image aspect once the
// texture resolves; it bobs and turns gently on its own clock. Works are
// distributed as a volumetric cloud (a ring around the flight path) so many are
// around you at once and they part as you pass — not a single-file corridor.
function Work({ work, index, onOpen }) {
  const map = useTexture(thumb(work.thumbnail || work.image, 640));
  const ref = useRef();

  const slot = useMemo(() => {
    const angle = rand(index) * Math.PI * 2;
    const radius = 2.3 + rand(index + 3) * 2.7;     // keep a clear centre channel
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.62 + (rand(index + 50) - 0.5) * 1.4;
    const z = 2 - index * GAP + (rand(index + 9) - 0.5) * GAP * 0.7;
    const seed = rand(index + 7) * Math.PI * 2;
    return { x, y, z, seed };
  }, [index]);

  const scale = useMemo(() => {
    const img = map.image;
    const a = img && img.width && img.height ? img.width / img.height : 1;
    const max = 2.5;
    return a >= 1 ? [max, max / a, 1] : [max * a, max, 1];
  }, [map]);

  useFrame((state) => {
    const el = ref.current;
    if (!el) return;
    const t = state.clock.elapsedTime + slot.seed;
    el.position.y = slot.y + Math.sin(t * 0.4) * 0.16;
    el.rotation.z = Math.sin(t * 0.25) * 0.015;
    el.rotation.y = Math.sin(t * 0.2) * 0.06;
  });

  return (
    <group ref={ref} position={[slot.x, slot.y, slot.z]}>
      <mesh
        scale={scale}
        onClick={(e) => { e.stopPropagation(); onOpen(work); }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={map} toneMapped={false} transparent />
      </mesh>
    </group>
  );
}

// Abstract 3D forms suspended between the works — monochrome, lit so they read
// as real geometry (the images stay unlit/true-colour on meshBasicMaterial).
// A quiet set: matte pale solids, dark solids, and airy wireframe shells.
function Floaters({ count = 20 }) {
  const items = useMemo(() => {
    const geoms = ['ico', 'octa', 'dodeca', 'torus', 'knot'];
    return Array.from({ length: count }, (_, i) => {
      const angle = rand(i + 200) * Math.PI * 2;
      const radius = 3.0 + rand(i + 210) * 2.8;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 0.6 + (rand(i + 220) - 0.5) * 2;
      const z = 1 - (i + 0.5) * (TRAVEL / count) + (rand(i + 9) - 0.5) * 3;
      const s = 0.28 + rand(i + 230) * 0.6;
      const geom = geoms[Math.floor(rand(i + 240) * geoms.length)];
      const wire = rand(i + 250) > 0.55;
      const dark = !wire && rand(i + 260) > 0.5;
      const spin = 0.05 + rand(i + 270) * 0.18;
      const seed = rand(i + 280) * Math.PI * 2;
      return { x, y, z, s, geom, wire, dark, spin, seed };
    });
  }, [count]);

  return items.map((it, i) => <Floater key={i} it={it} />);
}

function Floater({ it }) {
  const ref = useRef();
  useFrame((state) => {
    const el = ref.current;
    if (!el) return;
    const t = state.clock.elapsedTime;
    el.rotation.x = t * it.spin;
    el.rotation.y = t * it.spin * 0.8;
    el.position.y = it.y + Math.sin(t * 0.3 + it.seed) * 0.3;
  });

  const color = it.wire ? '#9fb0d0' : it.dark ? '#0c1020' : '#efece5';
  return (
    <mesh ref={ref} position={[it.x, it.y, it.z]} scale={it.s}>
      {it.geom === 'ico' && <icosahedronGeometry args={[1, 0]} />}
      {it.geom === 'octa' && <octahedronGeometry args={[1, 0]} />}
      {it.geom === 'dodeca' && <dodecahedronGeometry args={[1, 0]} />}
      {it.geom === 'torus' && <torusGeometry args={[0.7, 0.28, 16, 40]} />}
      {it.geom === 'knot' && <torusKnotGeometry args={[0.6, 0.22, 90, 14]} />}
      <meshStandardMaterial
        color={color}
        wireframe={it.wire}
        metalness={it.wire ? 0 : 0.35}
        roughness={it.wire ? 1 : 0.45}
        transparent
        opacity={it.wire ? 0.5 : 0.95}
      />
    </mesh>
  );
}

// A slow haze of points — atmosphere for the void (no postprocessing bloom on
// this three/drei pair, so fog + additive points carry the mood).
function Haze({ count = 800 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 26;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 2] = 4 - Math.random() * (PICKS * GAP + 8);
    }
    return arr;
  }, [count]);
  useFrame((state) => { if (ref.current) ref.current.rotation.z = state.clock.elapsedTime * 0.005; });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#8fa0c0" transparent opacity={0.5} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// Dollies the camera down the corridor from scroll progress, plus pointer sway.
function Rig({ progressRef }) {
  useFrame(({ camera, pointer }) => {
    const targetZ = 6 - (progressRef.current || 0) * TRAVEL;
    camera.position.z += (targetZ - camera.position.z) * 0.08;
    camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.04;
    camera.position.y += (pointer.y * 0.4 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, camera.position.z - 6);
  });
  return null;
}

function DriftScene({ works, onOpen, progressRef }) {
  return (
    <>
      <color attach="background" args={[VOID]} />
      <fog attach="fog" args={[VOID, 7, 26]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 4]} intensity={0.7} />
      <pointLight position={[-3, -2, 2]} intensity={12} color="#7f9bd0" distance={18} />
      <Haze />
      <Floaters />
      <Suspense fallback={null}>
        {works.map((w, i) => <Work key={w.id} work={w} index={i} onOpen={onOpen} />)}
        <Preload all />
      </Suspense>
      <Rig progressRef={progressRef} />
    </>
  );
}

export default function PortfolioDrift() {
  const ctx = usePortfolio();
  const openWork = ctx?.openWork || (() => {});
  const wrapRef = useRef(null);
  const progressRef = useRef(0);

  const works = useMemo(() => inkInterventions.filter(w => w.image).slice(0, PICKS), []);

  // Native scroll → camera progress (0 at top, 1 at the end of the descent).
  useEffect(() => {
    const onScroll = () => {
      const el = wrapRef.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      const p = total > 0 ? clamp(-el.getBoundingClientRect().top / total, 0, 1) : 0;
      progressRef.current = p;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const label = { fontFamily: mono, fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.62)' };
  const big = { fontFamily: serif, color: '#fff', margin: 0, fontWeight: 800, letterSpacing: -2, lineHeight: 0.9, textTransform: 'uppercase' };
  const pad = 'clamp(20px,6vw,90px)';

  // A scroll section — pinned-height, content anchored left or right.
  const Section = ({ children, align = 'left', justify = 'center' }) => (
    <section style={{
      height: '100vh', display: 'flex', alignItems: justify === 'center' ? 'center' : justify,
      justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
      padding: `0 ${pad}`, pointerEvents: 'none',
    }}>
      <div style={{ maxWidth: 900, textAlign: align === 'right' ? 'right' : 'left' }}>{children}</div>
    </section>
  );

  return (
    <div ref={wrapRef} style={{ position: 'relative', background: VOID }}>
      <Helmet>
        <title>Miss AL Simpson — Scottish Cryptoartist</title>
        <meta name="description" content="The official site of Miss AL Simpson, award-winning Scottish cryptoartist. An immersive descent through her Ink Interventions — collage, ink and machine intelligence. Exhibited at Sotheby’s, New York." />
      </Helmet>

      {/* Pinned 3D layer */}
      <div style={{ position: 'sticky', top: 0, height: '100dvh', width: '100%', zIndex: 0 }}>
        <Canvas
          camera={{ fov: 55, position: [0, 0, 6], near: 0.1, far: 200 }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
          style={{ position: 'absolute', inset: 0 }}
        >
          <DriftScene works={works} onOpen={openWork} progressRef={progressRef} />
        </Canvas>

        {/* Cinematic vignette + scroll hint (over the canvas, non-blocking). */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)', ...label, fontSize: 10, color: 'rgba(255,255,255,0.5)', pointerEvents: 'none' }}>
          Scroll to descend
        </div>
      </div>

      {/* Editorial type layer — real DOM sections scrolling over the pinned canvas. */}
      <div style={{ position: 'relative', zIndex: 1, marginTop: '-100dvh' }}>
        <Section>
          <div style={{ ...label, marginBottom: 18 }}>An immersive descent</div>
          <h1 style={{ ...big, fontSize: 'clamp(52px,10vw,150px)' }}>Miss AL<br />Simpson</h1>
          <p style={{ fontFamily: serif, fontWeight: 300, fontSize: 'clamp(16px,2vw,22px)', color: 'rgba(255,255,255,0.82)', margin: '22px 0 0', maxWidth: 520 }}>
            Scroll to fall through the work — collage, ink and machine intelligence, suspended in the dark.
          </p>
        </Section>

        <Section align="right">
          <h2 style={{ ...big, fontSize: 'clamp(40px,7vw,110px)' }}>Collage ·<br />Ink · Machine</h2>
        </Section>

        {/* ── Sotheby's provenance ── */}
        <Section>
          <a
            href={SOTHEBYS_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'block', color: 'inherit', textDecoration: 'none', pointerEvents: 'auto', maxWidth: 780 }}
          >
            <div style={{ fontFamily: serif, fontWeight: 400, fontSize: 'clamp(34px,5vw,64px)', letterSpacing: -1, lineHeight: 1, marginBottom: 22, color: '#fff' }}>
              Sotheby’s
            </div>
            <p style={{ fontFamily: serif, fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(20px,2.6vw,34px)', lineHeight: 1.35, margin: '0 0 22px', color: '#fff' }}>
              “…her signature Ink Interventions — imagined by AI from Simpson’s gestural mark-making and intricate hand-drawn compositions — with ethereal visuals of tulle-like curtains, suburban shadows, and the sleek, gliding presence of drones.”
            </p>
            <footer style={label}>
              <i>Les Drones de la Banlieue</i>, Contemporary Discoveries, New York, 2025 →
            </footer>
          </a>
        </Section>

        <Section align="right">
          <h2 style={{ ...big, fontSize: 'clamp(40px,7vw,110px)' }}>Ink<br />Interventions</h2>
          <div style={{ ...label, marginTop: 18 }}>Exhibited &amp; sold at Sotheby’s, New York</div>
        </Section>

        {/* Spacer screens keep the descent unhurried before the exit. */}
        <div style={{ height: '100vh', pointerEvents: 'none' }} />

        <section style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', flexDirection: 'column' }}>
          <div style={{ ...label, marginBottom: 20 }}>End of the descent</div>
          <Link to="/portfolio/works" style={{
            fontFamily: mono, fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', color: '#fff',
            textDecoration: 'none', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 999, padding: '14px 30px',
          }}>
            Enter the catalogue →
          </Link>
        </section>
      </div>
    </div>
  );
}
