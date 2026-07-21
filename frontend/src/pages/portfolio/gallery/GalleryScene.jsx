import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { projects, thumb } from '../../../config/portfolioData';
import { mono, serif } from '../portfolioStyle';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// A fronted gallery you walk into. You start in the MISS AL SIMPSON foyer — the
// collection covers hang along the walls as doorways. Step up to one (or pick it
// in the index) and you walk through into that collection's own room, the works
// hung across three white-cube walls. One space is rendered at a time, so each
// room feels enclosed and the move from foyer → room reads as crossing a
// threshold. WASD / arrows to move, drag to look.

const EYE = 1.7;
const WALL = '#efeee9';      // warm white-cube wall
const WALL_LIT = '#f8f7f3';
const TRIM = '#15140f';

// Foyer is a touch grander; rooms are intimate cubes.
const FOYER = { W: 15, D: 17, H: 5.6 };
const ROOM = { W: 12, D: 13, H: 5 };

// ── Image plane that loads without suspending, scaled to its true aspect ──
function ArtTile({ url, max = 1.7, onClick, glow = false }) {
  const [tex, setTex] = useState(null);
  const [aspect, setAspect] = useState(1);
  const invalidate = useThree(s => s.invalidate);
  useEffect(() => {
    if (!url) return;
    let alive = true;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(thumb(url, 360), t => {
      if (!alive) return;
      t.colorSpace = THREE.SRGBColorSpace;
      setAspect((t.image?.width || 1) / (t.image?.height || 1));
      setTex(t);
      invalidate();
    }, undefined, () => {});
    return () => { alive = false; };
  }, [url, invalidate]);
  const w = aspect >= 1 ? max : max * aspect;
  const h = aspect >= 1 ? max / aspect : max;
  return (
    <group
      onClick={onClick ? e => { e.stopPropagation(); onClick(); } : undefined}
      onPointerOver={onClick ? e => { e.stopPropagation(); document.body.style.cursor = 'pointer'; } : undefined}
      onPointerOut={onClick ? () => { document.body.style.cursor = 'grab'; } : undefined}
    >
      {/* soft cast shadow on the wall */}
      <mesh position={[0, -0.05, -0.01]}>
        <planeGeometry args={[w + 0.26, h + 0.26]} />
        <meshBasicMaterial color="#cbc8bf" transparent opacity={glow ? 0.65 : 0.45} depthWrite={false} />
      </mesh>
      {/* dark frame */}
      <mesh position={[0, 0, 0.015]}>
        <planeGeometry args={[w + 0.13, h + 0.13]} />
        <meshBasicMaterial color={TRIM} />
      </mesh>
      {/* the work */}
      <mesh position={[0, 0, 0.025]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} color={tex ? '#ffffff' : '#cfcdc6'} toneMapped={false} />
      </mesh>
    </group>
  );
}

// A small caption plate under a hung work.
function Plate({ title, sub, y = -1.15 }) {
  return (
    <Html position={[0, y, 0.05]} center distanceFactor={9} zIndexRange={[2, 0]}
      style={{ pointerEvents: 'none', textAlign: 'center', whiteSpace: 'nowrap', userSelect: 'none' }}>
      <div style={{ fontFamily: serif, fontSize: 15, color: '#1a1a1a' }}>{title}</div>
      {sub && (
        <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: 2, textTransform: 'uppercase', color: '#7a756c', marginTop: 3 }}>
          {sub}
        </div>
      )}
    </Html>
  );
}

// ── The shell of whichever space you're in: floor, ceiling, four walls, with a
// doorway cut into the front wall so the room reads as entered. ──
function Shell({ dim }) {
  const { W, D, H } = dim;
  const midZ = D / 2;
  const doorHalf = 1.6;
  const doorTop = 3.3;
  const panelW = W / 2 - doorHalf;
  const panelX = doorHalf + panelW / 2;
  const lintelH = H - doorTop;

  return (
    <>
      {/* polished floor */}
      <mesh position={[0, 0, midZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <MeshReflectorMaterial
          resolution={1024} blur={[300, 100]} mixBlur={1} mixStrength={16}
          depthScale={1} minDepthThreshold={0.3} maxDepthThreshold={1.4}
          roughness={0.88} metalness={0.2} color="#e2e0d8" mirror={0.28}
        />
      </mesh>
      {/* ceiling */}
      <mesh position={[0, H, midZ]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#f6f5f1" roughness={1} side={THREE.DoubleSide} />
      </mesh>
      {/* recessed ceiling light strips */}
      <mesh position={[-W / 4, H - 0.02, midZ]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, D - 2]} />
        <meshBasicMaterial color="#fffaf0" transparent opacity={0.85} depthWrite={false} />
      </mesh>
      <mesh position={[W / 4, H - 0.02, midZ]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, D - 2]} />
        <meshBasicMaterial color="#fffaf0" transparent opacity={0.85} depthWrite={false} />
      </mesh>

      {/* back wall */}
      <mesh position={[0, H / 2, D]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color={WALL} roughness={0.94} side={THREE.DoubleSide} />
      </mesh>
      {/* side walls */}
      <mesh position={[-W / 2, H / 2, midZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[D, H]} />
        <meshStandardMaterial color={WALL} roughness={0.94} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[W / 2, H / 2, midZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[D, H]} />
        <meshStandardMaterial color={WALL} roughness={0.94} side={THREE.DoubleSide} />
      </mesh>
      {/* front wall, with a doorway gap in the centre */}
      <mesh position={[-panelX, H / 2, 0]}>
        <planeGeometry args={[panelW, H]} />
        <meshStandardMaterial color={WALL} roughness={0.94} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[panelX, H / 2, 0]}>
        <planeGeometry args={[panelW, H]} />
        <meshStandardMaterial color={WALL} roughness={0.94} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, doorTop + lintelH / 2, 0]}>
        <planeGeometry args={[doorHalf * 2, lintelH]} />
        <meshStandardMaterial color={WALL} roughness={0.94} side={THREE.DoubleSide} />
      </mesh>
      {/* doorway reveal (dark threshold either side of the opening) */}
      <mesh position={[-doorHalf, doorTop / 2, 0]}>
        <planeGeometry args={[0.12, doorTop]} />
        <meshBasicMaterial color="#0d0c0a" />
      </mesh>
      <mesh position={[doorHalf, doorTop / 2, 0]}>
        <planeGeometry args={[0.12, doorTop]} />
        <meshBasicMaterial color="#0d0c0a" />
      </mesh>
    </>
  );
}

// ── Lay a set of works across the back + left + right walls of a room ──
function hangPlan(works, dim) {
  const { W, D } = dim;
  const out = [];
  const back = works.slice(0, 3);
  const left = works.slice(3, 6);
  const right = works.slice(6, 9);
  const yArt = 2.45;

  back.forEach((w, j) => {
    const x = (j - (back.length - 1) / 2) * 3.0;
    out.push({ w, pos: [x, yArt, D - 0.06], rotY: Math.PI });
  });
  const zSpread = (i, n) => 4.5 + i * Math.min(3.2, (D - 6) / Math.max(1, n - 1 || 1));
  left.forEach((w, j) => out.push({ w, pos: [-W / 2 + 0.06, yArt, zSpread(j, left.length)], rotY: Math.PI / 2 }));
  right.forEach((w, j) => out.push({ w, pos: [W / 2 - 0.06, yArt, zSpread(j, right.length)], rotY: -Math.PI / 2 }));
  return out;
}

// A single collection's room: works hung on three walls, name on the back wall.
function Room({ project, onApproach }) {
  const works = useMemo(
    () => (project.sample || []).filter(w => w.image).slice(0, 9),
    [project]
  );
  const plan = useMemo(() => hangPlan(works, ROOM), [works]);

  return (
    <group>
      <Shell dim={ROOM} />

      {/* room title on the back wall, above the central works */}
      <Html position={[0, ROOM.H - 0.7, ROOM.D - 0.05]} center distanceFactor={11} zIndexRange={[2, 0]}
        rotation={[0, Math.PI, 0]}
        style={{ pointerEvents: 'none', whiteSpace: 'nowrap', userSelect: 'none', textAlign: 'center' }}>
        <div style={{ fontFamily: serif, fontSize: 24, color: '#161616' }}>{project.name}</div>
        <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', color: '#7a756c', marginTop: 4 }}>
          {project.medium} · {project.count.toLocaleString()} works
        </div>
      </Html>

      {plan.map(({ w, pos, rotY }) => (
        <group key={w.id} position={pos} rotation={[0, rotY, 0]}>
          <ArtTile url={w.image} max={1.7} onClick={() => onApproach(w, pos, rotY)} glow />
        </group>
      ))}
    </group>
  );
}

// The foyer: the artist's name on the back wall, every collection's cover hung
// down the side walls as a doorway you can step up to and click to enter.
function Foyer({ onEnter }) {
  const portals = useMemo(() => projects.map((p, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const idx = Math.floor(i / 2);
    const perRow = 5;
    const col = idx % perRow;
    const row = Math.floor(idx / perRow);
    const z = 3.2 + col * ((FOYER.D - 5) / (perRow - 1));
    const y = row === 0 ? 3.5 : 1.85;
    return {
      project: p,
      pos: [side * (FOYER.W / 2 - 0.06), y, z],
      rotY: side < 0 ? Math.PI / 2 : -Math.PI / 2,
    };
  }), []);

  return (
    <group>
      <Shell dim={FOYER} />

      {/* the name carries the back wall */}
      <Html position={[0, FOYER.H / 2 + 0.2, FOYER.D - 0.05]} center distanceFactor={16} zIndexRange={[2, 0]}
        rotation={[0, Math.PI, 0]}
        style={{ pointerEvents: 'none', whiteSpace: 'nowrap', userSelect: 'none', textAlign: 'center' }}>
        <div style={{ fontFamily: serif, fontSize: 46, letterSpacing: 1, color: '#141414', lineHeight: 1 }}>
          Miss AL Simpson
        </div>
        <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: 6, textTransform: 'uppercase', color: '#7a756c', marginTop: 12 }}>
          The Gallery
        </div>
      </Html>

      {portals.map(({ project: p, pos, rotY }) => (
        <group key={p.slug} position={pos} rotation={[0, rotY, 0]}>
          <ArtTile url={p.cover} max={1.25} onClick={() => onEnter(p)} />
          <Plate title={p.name} sub={`${p.count.toLocaleString()} works`} y={-0.95} />
        </group>
      ))}
    </group>
  );
}

// First-person walk inside whichever space is mounted. On entering a new space
// the visitor is snapped to its doorway, facing in; then WASD/arrows + drag.
// Clicking a work glides the camera right up to it ("walk-in" zoom); any movement
// or drag hands control straight back.
function WalkControls({ dim, navId, zoom }) {
  const { camera, gl } = useThree();
  const yaw = useRef(0);
  const pitch = useRef(0);
  const keys = useRef({});
  const drag = useRef(false);
  const lastXY = useRef([0, 0]);
  const gliding = useRef(false);
  const glidePos = useRef(V(0, EYE, 1.6));
  const glideLook = useRef(V(0, EYE, 6));

  // sync free-look yaw/pitch from the camera's current facing (after a glide/drag)
  const syncLook = () => {
    const d = new THREE.Vector3();
    camera.getWorldDirection(d);
    yaw.current = Math.atan2(d.x, d.z);
    pitch.current = clamp(Math.asin(d.y), -0.7, 0.7);
  };

  // place the visitor just inside the doorway whenever the space changes
  useEffect(() => {
    camera.position.set(0, EYE, 1.6);
    yaw.current = 0;
    pitch.current = 0;
    gliding.current = false;
  }, [navId, camera]);

  // start a walk-in glide when a work is picked
  useEffect(() => {
    if (!zoom) return;
    glidePos.current.set(zoom.pos[0], zoom.pos[1], zoom.pos[2]);
    glideLook.current.set(zoom.look[0], zoom.look[1], zoom.look[2]);
    gliding.current = true;
  }, [zoom]);

  useEffect(() => {
    const el = gl.domElement;
    el.style.cursor = 'grab';
    const down = e => { drag.current = true; lastXY.current = [e.clientX, e.clientY]; el.style.cursor = 'grabbing'; };
    const up = () => { drag.current = false; el.style.cursor = 'grab'; };
    const move = e => {
      if (!drag.current) return;
      if (gliding.current) { gliding.current = false; syncLook(); }
      const [lx, ly] = lastXY.current;
      yaw.current -= (e.clientX - lx) * 0.0026;
      pitch.current = clamp(pitch.current - (e.clientY - ly) * 0.0026, -0.7, 0.7);
      lastXY.current = [e.clientX, e.clientY];
    };
    const kd = e => { keys.current[e.code] = true; };
    const ku = e => { keys.current[e.code] = false; };
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointermove', move);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
    };
  }, [gl]);

  useFrame((_, dt) => {
    const step = Math.min(dt, 0.05);
    const k = keys.current;
    const moving = k.KeyW || k.KeyS || k.KeyA || k.KeyD || k.ArrowUp || k.ArrowDown || k.ArrowLeft || k.ArrowRight;

    // walk-in glide toward a picked work, then hand back control
    if (gliding.current) {
      if (moving) { gliding.current = false; syncLook(); }
      else {
        camera.position.lerp(glidePos.current, 0.12);
        camera.lookAt(glideLook.current);
        if (camera.position.distanceTo(glidePos.current) < 0.05) { gliding.current = false; syncLook(); }
        return;
      }
    }

    const turn = 1.6 * step;
    if (k.ArrowLeft) yaw.current += turn;
    if (k.ArrowRight) yaw.current -= turn;

    const speed = 9 * step;
    const s = Math.sin(yaw.current), c = Math.cos(yaw.current);
    const fwd = V(s, 0, c);
    const right = V(-c, 0, s);
    if (k.KeyW || k.ArrowUp) camera.position.addScaledVector(fwd, speed);
    if (k.KeyS || k.ArrowDown) camera.position.addScaledVector(fwd, -speed);
    if (k.KeyA) camera.position.addScaledVector(right, -speed);
    if (k.KeyD) camera.position.addScaledVector(right, speed);

    // stay in the room at eye height
    camera.position.y = EYE;
    camera.position.x = clamp(camera.position.x, -dim.W / 2 + 0.9, dim.W / 2 - 0.9);
    camera.position.z = clamp(camera.position.z, 0.6, dim.D - 0.6);

    const cp = Math.cos(pitch.current);
    const dir = V(Math.sin(yaw.current) * cp, Math.sin(pitch.current), Math.cos(yaw.current) * cp);
    camera.lookAt(camera.position.clone().add(dir));
  });
  return null;
}

export default function GalleryScene({ focus, setFocus, onSelectProject, onPick }) {
  const inFoyer = focus.id === 'lobby';
  const project = useMemo(() => {
    if (inFoyer) return null;
    const slug = focus.id.replace(/^room-/, '');
    return projects.find(p => p.slug === slug) || null;
  }, [focus, inFoyer]);

  const dim = inFoyer ? FOYER : ROOM;
  const enter = p => { setFocus({ id: `room-${p.slug}` }); onSelectProject(p); };

  // Walk-in zoom: first click on a work glides the camera up to it; clicking the
  // same work again (once you're there) opens the full lightbox.
  const [zoom, setZoom] = useState(null);
  const lastId = useRef(null);
  useEffect(() => { lastId.current = null; setZoom(null); }, [focus.id]);
  const approach = (w, pos, rotY) => {
    if (lastId.current === w.id) { onPick(w); return; }
    lastId.current = w.id;
    const n = rotY === Math.PI ? [0, 0, -1] : rotY > 0 ? [1, 0, 0] : [-1, 0, 0];
    const STANDOFF = 1.45;
    setZoom({ id: w.id, pos: [pos[0] + n[0] * STANDOFF, EYE, pos[2] + n[2] * STANDOFF], look: pos });
  };

  return (
    <>
      <color attach="background" args={['#f1efe9']} />
      <hemisphereLight args={['#ffffff', '#d9d7d0', 0.95]} />
      <ambientLight intensity={0.65} />
      <pointLight position={[0, dim.H - 0.5, dim.D * 0.32]} intensity={1.8} distance={dim.D * 1.6} decay={1.4} color="#fff3df" />
      <pointLight position={[0, dim.H - 0.5, dim.D * 0.72]} intensity={1.8} distance={dim.D * 1.6} decay={1.4} color="#fff3df" />

      {inFoyer
        ? <Foyer onEnter={enter} />
        : project && <Room project={project} onApproach={approach} />}

      <WalkControls dim={dim} navId={focus.id} zoom={zoom} />
    </>
  );
}
