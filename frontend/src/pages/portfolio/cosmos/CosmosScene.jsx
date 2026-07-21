import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { years, projects, thumb } from '../../../config/portfolioData';
import { mono, serif } from '../portfolioStyle';

const V = (x, y, z) => new THREE.Vector3(x, y, z);

// Deterministic layout: projects on an inner ring (sized by scale), years on an
// outer ring (a timeline you can walk around).
function useLayout() {
  return useMemo(() => {
    const maxCount = Math.max(...projects.map(p => p.count || 1), 1);
    const projPlanets = projects.map((p, i) => {
      const a = (i / projects.length) * Math.PI * 2;
      const R = 14;
      const radius = 1.1 + 2.6 * Math.sqrt((p.count || 1) / maxCount);
      return { kind: 'project', data: p, pos: V(Math.cos(a) * R, (i % 2 ? 1 : -1) * 1.6, Math.sin(a) * R), radius };
    });
    const yearPlanets = years.map((y, i) => {
      const a = (i / years.length) * Math.PI * 2 + Math.PI / years.length;
      const R = 30;
      const radius = 1 + Math.min(2, Math.log10(1 + y.works.length) * 0.7);
      return { kind: 'year', data: y, pos: V(Math.cos(a) * R, (i % 2 ? -1 : 1) * 3, Math.sin(a) * R), radius };
    });
    return { projPlanets, yearPlanets };
  }, []);
}

// ── A textured image tile that billboards toward the camera. The plane is
// scaled to the artwork's real aspect ratio, so thumbnails match the work. ──
function Tile({ url, position, size = 1.6, onClick }) {
  const [tex, setTex] = useState(null);
  const [aspect, setAspect] = useState(1);
  useEffect(() => {
    if (!url) return;
    let alive = true;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(thumb(url, 256), t => {
      if (!alive) return;
      t.colorSpace = THREE.SRGBColorSpace;
      const w = t.image?.width || 1, h = t.image?.height || 1;
      setAspect(w / h);
      setTex(t);
    }, undefined, () => {});
    return () => { alive = false; if (tex) tex.dispose?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);
  const w = aspect >= 1 ? size : size * aspect;
  const h = aspect >= 1 ? size / aspect : size;
  return (
    <Billboard position={position}>
      <mesh
        onClick={e => { e.stopPropagation(); onClick(); }}
        onPointerOver={e => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} color={tex ? '#ffffff' : '#141a26'} toneMapped={false} side={THREE.DoubleSide} transparent opacity={tex ? 1 : 0.5} />
      </mesh>
    </Billboard>
  );
}

// ── Orbiting cluster of works around a focused planet ──
function WorkCluster({ works, onPick }) {
  const g = useRef();
  useFrame((_, dt) => { if (g.current) g.current.rotation.y += dt * 0.08; });
  const items = useMemo(() => {
    const list = works.filter(w => w.image).slice(0, 28);
    const R = 5.5;
    return list.map((w, i) => {
      const a = (i / list.length) * Math.PI * 2;
      const y = ((i % 5) - 2) * 0.8;
      return { w, pos: V(Math.cos(a) * R, y, Math.sin(a) * R) };
    });
  }, [works]);
  return (
    <group ref={g}>
      {items.map(({ w, pos }) => <Tile key={w.id} url={w.image} position={pos} onClick={() => onPick(w)} />)}
    </group>
  );
}

// ── A planet (year or project) ──
function Planet({ node, focused, onClick, onPick }) {
  const ref = useRef();
  const [tex, setTex] = useState(null);
  const isProject = node.kind === 'project';
  // Every planet wears a real artwork: projects use their cover, years use
  // their first work with an image.
  const cover = isProject ? node.data.cover : node.data.works.find(w => w.image)?.image;
  const color = isProject ? '#cfd6e6' : ['#7fd6c2', '#e6c66b', '#c98fd6', '#8fb6e6'][node.data.year % 4];

  useEffect(() => {
    if (!cover) return;
    let alive = true;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(thumb(cover, 512), t => { if (alive) { t.colorSpace = THREE.SRGBColorSpace; setTex(t); } }, undefined, () => {});
    return () => { alive = false; };
  }, [cover]);

  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.05; });

  const label = isProject ? node.data.name : String(node.data.year);
  const sub = isProject ? `${node.data.count.toLocaleString()} works` : `${node.data.works.length} works`;
  const works = isProject ? node.data.sample : node.data.works;

  return (
    <group position={node.pos}>
      <mesh
        ref={ref}
        onClick={e => { e.stopPropagation(); onClick(node); }}
        onPointerOver={e => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <sphereGeometry args={[node.radius, 48, 48]} />
        {tex
          ? <meshStandardMaterial map={tex} emissiveMap={tex} emissive="#ffffff"
              emissiveIntensity={focused ? 0.7 : 0.32} roughness={0.55} metalness={0.1} />
          : <meshStandardMaterial color={color} roughness={0.35} metalness={0.2}
              emissive={color} emissiveIntensity={focused ? 0.5 : 0.18} />}
      </mesh>

      <Html position={[0, -node.radius - 0.9, 0]} center distanceFactor={isProject ? 22 : 30}
        style={{ pointerEvents: 'none', textAlign: 'center', whiteSpace: 'nowrap', userSelect: 'none' }}>
        <div style={{ fontFamily: serif, fontSize: 18, color: '#ffffff', textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>{label}</div>
        <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#8aa0b8', marginTop: 3 }}>{sub}</div>
      </Html>

      {focused && works?.length > 0 && <WorkCluster works={works} onPick={onPick} />}
    </group>
  );
}

// ── Camera rig: glides to the focused planet, then hands control back ──
function Rig({ focus, controls }) {
  const moving = useRef(false);
  const lastId = useRef(null);
  const camTarget = useRef(V(0, 18, 46));
  const lookTarget = useRef(V(0, 0, 0));

  useEffect(() => {
    if (focus.id === lastId.current) return;
    lastId.current = focus.id;
    if (focus.id === 'overview') {
      camTarget.current = V(0, 18, 46);
      lookTarget.current = V(0, 0, 0);
    } else {
      const p = focus.pos.clone();
      const dir = p.clone().normalize();
      const standoff = focus.radius + 9;
      camTarget.current = p.clone().add(dir.multiplyScalar(standoff)).add(V(0, focus.radius + 2, 0));
      lookTarget.current = p;
    }
    moving.current = true;
    if (controls.current) controls.current.enabled = false;
  }, [focus, controls]);

  useFrame(({ camera }) => {
    if (!moving.current) return;
    camera.position.lerp(camTarget.current, 0.07);
    if (controls.current) { controls.current.target.lerp(lookTarget.current, 0.07); controls.current.update(); }
    if (camera.position.distanceTo(camTarget.current) < 0.6) {
      moving.current = false;
      if (controls.current) controls.current.enabled = true;
    }
  });
  return null;
}

export default function CosmosScene({ focus, setFocus, onSelectProject, onPick }) {
  const { projPlanets, yearPlanets } = useLayout();
  const controls = useRef();

  const handlePlanet = node => {
    setFocus({ id: `${node.kind}-${node.kind === 'year' ? node.data.year : node.data.slug}`, pos: node.pos, radius: node.radius });
    onSelectProject(node.kind === 'project' ? node.data : null);
  };

  const focusedId = focus.id;

  return (
    <>
      <color attach="background" args={['#05060a']} />
      <fog attach="fog" args={['#05060a', 40, 95]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[0, 0, 0]} intensity={2.2} distance={120} color="#fff4e6" />
      <Stars radius={120} depth={60} count={4000} factor={4} saturation={0} fade speed={0.6} />

      {/* central sun = the artist */}
      <mesh>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshBasicMaterial color="#fff1d6" toneMapped={false} />
      </mesh>
      <Html position={[0, -2.4, 0]} center distanceFactor={28}
        style={{ pointerEvents: 'none', whiteSpace: 'nowrap', userSelect: 'none' }}>
        <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#fff1d6', textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>Miss AL Simpson</div>
      </Html>

      {projPlanets.map(n => (
        <Planet key={`p-${n.data.slug}`} node={n}
          focused={focusedId === `project-${n.data.slug}`}
          onClick={handlePlanet} onPick={onPick} />
      ))}
      {yearPlanets.map(n => (
        <Planet key={`y-${n.data.year}`} node={n}
          focused={focusedId === `year-${n.data.year}`}
          onClick={handlePlanet} onPick={onPick} />
      ))}

      <Rig focus={focus} controls={controls} />
      <OrbitControls ref={controls} enablePan={false} minDistance={4} maxDistance={80}
        rotateSpeed={0.5} zoomSpeed={0.7} />
    </>
  );
}
