import { Suspense, useMemo, useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture, Preload, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { inkInterventions, digitalCollage, graffitiStilettos, thumb, resolveImg } from '../../config/portfolioData';
import { FILMS, DIAMOND_DRONES_FILMS } from '../../config/cinemaFilms';
import { usePortfolio } from './PortfolioContext';
import { serif, mono } from './portfolioStyle';

// PortfolioShop — the site's ENTRANCE, "a renaissance ink shop the cursor moves
// through". A long baroque hall built OUT OF the artist's own work: her
// ink-splattered renaissance interior is the walls, her marble checkerboard the
// floor, her ink-explosion double doors close the far end. Her Ink Interventions
// hang framed down both walls. You glide forward through it with the mouse —
// move the cursor to steer/look, hold (or scroll) to walk deeper — and click any
// work to open it. First-person, no keyboard needed.

const EYE = 1.7;
// ── The journey is ONE continuous corridor in three zones down the Z axis: the
// ink shop (the entrance you glide through), then — THROUGH the doors — a dark
// AI CINEMA hall of playing films, then a bright SELECTED WORKS gallery. You walk
// right through all three; there is no separate page. ──
// Before the ink shop you enter through a front HALL OF GRAFFITI STILETTOS — her
// on-chain Graffiti Stiletto 1/1s hung in gilt frames, with the big gilt-framed
// re-launch mint at the head of it. It sits in NEGATIVE z (the corridor now
// starts behind the old entrance), so every existing zone below keeps its Z.
const STILETTO = { W: 8, H: 6, LEN: 46 };
const STILETTO_Z0 = -STILETTO.LEN;   // -46 — the very front (back wall of the stiletto hall)
const STILETTO_Z1 = 0;               //   0 — where the stiletto hall meets the ink shop
const CAM_START = STILETTO_Z0 + 5;   // -41 — the camera opens standing before the gilt-framed mint
const SHOP = { W: 8, H: 6, LEN: 74 };    // the renaissance ink shop (the entrance)
const CINEMA = { W: 8, H: 6, LEN: 78 };  // the film hall beyond the doors (a wide gauntlet of films)
const WORKS = { W: 8, H: 6, LEN: 64 };   // the immersive gallery you fly through
const WORLDS = { W: 8, H: 6, LEN: 46 };  // her built worlds — portals you pass between
const INK = { LEN: 15 };                 // a quick ink threshold — a beat, not a whole zone (Worlds → straight into the bright room)
const MINT = { LEN: 46 };                // the wild bright collage room — the re-launch mint (the finale)
const CINEMA_Z0 = SHOP.LEN;                    // 74  — where the cinema begins
const CINEMA_Z1 = CINEMA_Z0 + CINEMA.LEN;      // 134 — where it ends
const WORKS_Z0 = CINEMA_Z1;                    // 134 — the gallery begins
const WORKS_Z1 = WORKS_Z0 + WORKS.LEN;         // 198 — the gallery ends
const WORLDS_Z0 = WORKS_Z1;                    // 198 — the worlds begin
const WORLDS_Z1 = WORLDS_Z0 + WORLDS.LEN;      // 244 — the worlds open into ink here
const INK_Z0 = WORLDS_Z1;                       // 244 — the mouth of the ink well
const INK_Z1 = INK_Z0 + INK.LEN;                // 270 — full submersion, then you break through
const MINT_Z0 = INK_Z1;                          // 270 — you emerge from the ink into the bright room
const MINT_Z1 = MINT_Z0 + MINT.LEN;              // 316 — the far wall of the mint room
const TOTAL_LEN = MINT_Z1;                        // 316 — full journey depth (ends in the mint room)
const CAM_END = MINT_Z0 + 22;                    // 292 — the camera settles in the room, facing the collage
const HALL = SHOP;  // the shop-zone features below still read HALL.W / .H / .LEN

// ── THE DROP (a SEPARATE experience) — the spray-can gate at the end of the
// stiletto hall opens OUT into a bright gallery of the 7 Graffiti Stiletto
// editions. In the DROP variant this page renders the stiletto hall + this room
// INSTEAD of the ink-shop journey (which is the HOME variant). Each piece:
// edition of 30, a diamond-dusted AR-activated A2 print + an NFT animation. ──
const DROP = { W: 26, H: 8, LEN: 26 };        // a WIDE showroom that opens out of the hall
const DROP_Z0 = STILETTO_Z1;                 //   0 — where the cans open
const DROP_Z1 = DROP_Z0 + DROP.LEN;          //  26 — the far wall of the drop room
const DROP_CAM_END = DROP_Z0 + 9;            //   9 — stop short of the fan so you view the whole row head-on
const DROP_SKY = '#ff2fb0';                  // bright pink sky over the drop
const DROP_EDITION = 30;
const DROP_PRINT = 'diamond-dusted A2 AR print + NFT animation';
// where the HOME (ink walk-through) variant opens — in the shop, no stiletto hall
const HOME_START = 2.5;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const rand = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
// smooth 0→1 ramp; `win` = fade-in a→b, hold, fade-out c→d (for the quote reveals)
const smooth = (p, a, b) => { const t = clamp((p - a) / (b - a || 1e-6), 0, 1); return t * t * (3 - 2 * t); };
const win = (p, a, b, c, d) => smooth(p, a, b) * (1 - smooth(p, c, d));

const SOTHEBYS_URL = 'https://www.sothebys.com/en/buy/auction/2025/contemporary-discoveries-2/les-drones-de-la-banlieue';
const BONHAMS_URL = 'https://www.bonhams.com/auction/27285/lot/7/miss-al-simpson-b-1973-cybaroque-borghese-2021/';
const BORGHESE_SUPERRARE_URL = 'https://superrare.com/artwork/eth/0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0/25485';

const WALL_IMG = '/portfolio/shop/wall-ink.png';
const FLOOR_IMG = '/portfolio/shop/floor-marble.png';
const DOOR_IMG = '/portfolio/shop/ink-door.png';
// The front Hall of Graffiti Stilettos has its OWN walls + floor (distinct from
// the ink shop). AL: drop these two images and they load automatically; until
// then the hall falls back to plain dark surfaces (never crashes on a missing file).
const STILETTO_WALL_IMG = '/portfolio/shop/stiletto-wall.png';
// AL's four graffiti collage floor tiles — laid as four panels down the hall.
const STILETTO_FLOOR_IMGS = [
  '/portfolio/shop/stiletto floor 1.png',
  '/portfolio/shop/stiletto floor 2.png',
  '/portfolio/shop/stiletto floor 3.png',
  '/portfolio/shop/stiletto floor 4.png',
];

// ── The RE-LAUNCH MINT — a brand-new digital collage minted on Manifold to
//    celebrate the site relaunch. It hangs at the centre of the final bright room
//    with a mint button that LINKS OUT to the Manifold claim page (the safest
//    pattern: the site never touches the wallet/funds — the mint lives in the
//    contract on Manifold). AL: drop the collage image at RELAUNCH_COLLAGE_IMG and
//    set RELAUNCH_MINT_URL to the real Manifold claim page when it's live. ──
const RELAUNCH_MINT_URL = 'https://manifold.xyz';   // ← AL: replace with the real Manifold claim URL
// DOORSTOP: an existing on-disk collage stands in until the final Ink Intervention
// is ready. AL: drop the final image at /portfolio/relaunch-collage.png and switch
// this line back to it (or just tell me).
const RELAUNCH_COLLAGE_IMG = '/portfolio/collage/wall-2.jpg';   // ← temporary doorstop
const RELAUNCH_TITLE = 'The Re-Launch';
// AL's two real graffiti platform-stiletto shoes — transparent PNG cutouts that
// stand as the large sculptural monuments flanking the entrance (used instead of
// a door threshold). Loaded raw (not via the CDN) so the transparency survives.
const STILETTO_SCULPTURES = [
  '/portfolio/shop/stiletto-wall 1.png',
  '/portfolio/shop/stieltto-wall 2.png',
];
// AL's fly-poster / bill-poster collages — wheatpasted flat on the hall walls.
// (Missing files simply don't render, so more can be dropped in at 5, 6, …)
const STILETTO_BILLPOSTERS = [
  '/portfolio/shop/stiletto-billposter 1.png',
  '/portfolio/shop/stiletto-billposter 2.png',
  '/portfolio/shop/stiletto-billposter 3.png',
  '/portfolio/shop/stiletto-billposter 4.png',
  '/portfolio/shop/stiletto-billposter 7.png',
  '/portfolio/shop/stiletto-billposter 8.png',
];
// AL's extra graffiti-stiletto cutouts that POP UP from the floor as you walk past
// them. Transparent PNGs, loaded raw. (Missing files simply don't render — drop
// more in and extend this list.)
const STILETTO_POPUPS = [
  '/portfolio/shop/stiletto-pop 1.png',
  '/portfolio/shop/stiletto-pop 2.png',
  '/portfolio/shop/stiletto-pop 3.png',
  '/portfolio/shop/stiletto-pop 4.png',
  '/portfolio/shop/stiletto-pop 5.png',
  '/portfolio/shop/stiletto-pop 6.png',
];
// A limited edition of 70 — each mint also entitles the collector to a physical
// A2 print (Hahnemühle Photo Rag Metallic, matching her print-shop stock).
const RELAUNCH_EDITION = 70;
const RELAUNCH_PRINT = 'each edition includes a hand-signed A2 print';

// The Drones of Suburbia album — the corridor jukebox. Pick any track to play.
const ALBUM_TRACKS = [
  { title: 'The Drones of Suburbia', src: '/album/01-The-Drones-of-Suburbia.mp3' },
  { title: 'Les Drones de la Banlieue', src: '/album/02-Les-Drones-de-la-Banlieue.mp3' },
  { title: 'The Drones of Suburbia · Roma', src: '/album/03-The-Drones-of-Suburbia-Roma.mp3' },
  { title: 'Roma · Summer 2025 Edit', src: '/album/04-The-Drones-of-Suburbia-Roma-Summer-2025-Edit.mp3' },
  { title: 'Hollywood Drones', src: '/album/05-Hollywood-Drones.mp3' },
  { title: 'Frequency Edit', src: '/album/06-The-Drones-of-Suburbia-Frequency-Edit.mp3' },
  { title: 'Drone Driver', src: '/album/07-Drone-Driver.mp3' },
  { title: 'Suburbia Was Never Out There', src: '/album/08-Suburbia-Was-Never-Out-There.mp3' },
  { title: 'Surveillance Subway', src: '/album/09-Surveillance-Subway.mp3' },
  { title: 'Heist', src: '/album/10-Heist.mp3' },
  { title: "Diamond Drones Are a Girl's Best Friend", src: '/album/11-Diamond-Drones-Are-a-Girls-Best-Friend.mp3' },
];

// The score for the digital collage rooms — swaps in when you enter, loops, then
// returns to the album as you leave. Drop the file at this path.
const COLLAGE_TRACK = { title: "\u00c0 la recherche de l'espoir", src: '/album/a-la-recherche-de-lespoir.mp3' };

// Load ONE texture without suspending OR throwing. drei's useTexture re-throws a
// failed load as an error, which trips the page-level ErrorBoundary ("Something
// went wrong") — and some of her earliest works are IPFS-hosted images that fail
// through the CDN. Here a broken/blocked URL simply yields null (the tile stays
// blank) instead of crashing the whole 3D scene. The textured mesh is only
// rendered once the map is ready, so the material always compiles WITH the image
// (no late-map "blank white" recompile problem).
function useSafeTexture(url) {
  const [tex, setTex] = useState(null);
  useEffect(() => {
    if (!url) { setTex(null); return; }
    let alive = true;
    new THREE.TextureLoader().load(
      url,
      t => { if (alive) { t.colorSpace = THREE.SRGBColorSpace; setTex(t); } else t.dispose(); },
      undefined,
      () => { if (alive) setTex(null); },
    );
    return () => { alive = false; };
  }, [url]);
  return tex;
}

// ── A framed work hung on the wall, with a pale mat so it reads against the
// busy ink wall. Loads without suspending or crashing; scales to image aspect. ──
function Hung({ url, onClick, max = 2.0, bare = false }) {
  const map = useSafeTexture(thumb(url, 480));
  const img = map && map.image;
  const aspect = img && img.width && img.height ? img.width / img.height : 1;
  const w = aspect >= 1 ? max : max * aspect;
  const h = aspect >= 1 ? max / aspect : max;
  return (
    <group
      onClick={onClick ? e => { e.stopPropagation(); onClick(); } : undefined}
      onPointerOver={onClick ? e => { e.stopPropagation(); document.body.style.cursor = 'pointer'; } : undefined}
      onPointerOut={onClick ? () => { document.body.style.cursor = 'none'; } : undefined}
    >
      {/* bare = just the image (no frame/mat) — for the immersive cloud you fly
          THROUGH, where a physical frame would read too "hung on a wall". */}
      {!bare && (
        <>
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[w + 0.44, h + 0.44]} />
            <meshStandardMaterial color="#111114" roughness={0.6} metalness={0} />
          </mesh>
          <mesh position={[0, 0, 0.03]}>
            <planeGeometry args={[w + 0.34, h + 0.34]} />
            <meshStandardMaterial color="#f6f4ee" roughness={0.9} />
          </mesh>
        </>
      )}
      {/* rendered only once the image is ready → the material compiles with the
          map (no blank-white late-map issue); a broken image just stays absent. */}
      {map && (
        <mesh position={[0, 0, bare ? 0 : 0.04]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={map} toneMapped={false} side={bare ? THREE.DoubleSide : THREE.FrontSide} />
        </mesh>
      )}
    </group>
  );
}

// ── A GILT-FRAMED work — an ornate, stepped gold frame with a warm bevel and a
// pale gilt mat, for the front Hall of Graffiti Stilettos and the big re-launch
// mint at its head. Loads without suspending/crashing; scales to image aspect. ──
function GiltFrame({ url, max = 2.4, hero = false }) {
  const map = useSafeTexture(thumb(url, hero ? 1000 : 600));
  const img = map && map.image;
  const aspect = img && img.width && img.height ? img.width / img.height : 0.72;
  const w = aspect >= 1 ? max : max * aspect;
  const h = aspect >= 1 ? max / aspect : max;
  const b = hero ? 0.42 : 0.24;   // frame border width
  return (
    <group>
      {/* outer gold frame — a real box so it has depth and catches the light */}
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[w + b * 2.2, h + b * 2.2, 0.14]} />
        <meshStandardMaterial color="#b8912f" metalness={0.95} roughness={0.34} emissive="#4a3708" emissiveIntensity={0.35} />
      </mesh>
      {/* bright bevel highlight */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[w + b * 1.35, h + b * 1.35]} />
        <meshStandardMaterial color="#e8c66b" metalness={0.9} roughness={0.28} emissive="#7a5e1c" emissiveIntensity={0.4} />
      </mesh>
      {/* pale gilt mount */}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[w + b * 0.5, h + b * 0.5]} />
        <meshStandardMaterial color="#f3ead2" roughness={0.85} />
      </mesh>
      {/* the work — rendered only once the map is ready (no blank-white recompile) */}
      {map && (
        <mesh position={[0, 0, 0.075]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={map} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

// A GRAFFITI-style frame — a rough black-and-white spray frame (no gold), so the
// works read as street-art pieces, not museum oils. Monochrome to match the
// black-and-white lighting of the hall.
function GraffitiFrame({ url, max = 2.2 }) {
  const map = useSafeTexture(thumb(url, 600));
  const img = map && map.image;
  const aspect = img && img.width && img.height ? img.width / img.height : 0.72;
  const w = aspect >= 1 ? max : max * aspect;
  const h = aspect >= 1 ? max / aspect : max;
  const b = 0.2;
  return (
    <group>
      {/* chunky matte-black graffiti frame with depth */}
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[w + b * 2.6, h + b * 2.6, 0.12]} />
        <meshStandardMaterial color="#0a0a0c" roughness={0.95} metalness={0} />
      </mesh>
      {/* torn white spray edge */}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[w + b * 1.1, h + b * 1.1]} />
        <meshStandardMaterial color="#f4f4f0" roughness={0.98} />
      </mesh>
      {/* the work — rendered only once the map is ready */}
      {map && (
        <mesh position={[0, 0, 0.055]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={map} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

// A graffiti-framed work that FLOATS at its own DEPTH off the wall — a slow bob +
// sway + drift. Spread across staggered depths, they slide past each other at
// different rates as you glide through → true parallax.
function FloatGilt({ basePos, rotY, seed, url, max, userData }) {
  const ref = useRef();
  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const bx = basePos[0], by = basePos[1], bz = basePos[2];
    // MOVE OUT OF THE WAY: as the viewer approaches this work it slides toward its
    // own wall (outward), clearing the walkway so you glide straight through; it
    // eases back once you've passed. Capped so it never clips into the wall.
    const rel = state.camera.position.z - bz;
    const near = Math.max(0, 1 - Math.abs(rel) / 7);           // 0..1, peaks at the work
    const outward = bx >= 0 ? 1 : -1;
    const allowed = Math.max(0, (STILETTO.W / 2 - 0.4) - Math.abs(bx));
    g.position.x = bx + near * Math.min(1.9, allowed) * outward;
    g.position.y = by + Math.sin(t * 0.7 + seed) * 0.22;
    g.position.z = bz + Math.sin(t * 0.45 + seed * 1.3) * 0.14;
    // BILLBOARD: turn to FACE the moving camera so each graffiti-stiletto work is
    // front-on to the viewer as they move through (never flat/edge-on to the wall).
    const dx = state.camera.position.x - g.position.x;
    const dz = state.camera.position.z - bz;
    g.rotation.y = Math.atan2(dx, dz) + Math.sin(t * 0.3 + seed) * 0.03;
    g.rotation.z = Math.sin(t * 0.5 + seed) * 0.04;
  });
  return (
    <group ref={ref} position={basePos} userData={userData}>
      <GraffitiFrame url={url} max={max} />
    </group>
  );
}

// ── A MASSIVE MONUMENT STILETTO — a towering gilt-framed Graffiti Stiletto stood
// on a dark plinth, flanking the entrance like a statue. Slowly turns on its base
// and is lit from below, so the two of them frame the walkway as you enter. ──
function StilettoMonument({ url, x, z, onOpen, title, collection }) {
  const outer = useRef();
  const face = useRef();
  const map = useSafeTexture(url);   // raw local PNG — keeps the cutout transparency
  useFrame((s) => {
    const o = outer.current, f = face.current;
    if (!o) return;
    // MOVE OUT OF THE WAY: as the viewer approaches, the monument eases outward
    // toward its wall to clear the walkway you pass between, then returns.
    const rel = s.camera.position.z - z;                    // <0 ahead, >0 behind
    const near = Math.max(0, 1 - Math.abs(rel) / 8);        // 0..1, peaks at the statue
    const outward = x >= 0 ? 1 : -1;
    o.position.x = x + near * 0.5 * outward;
    // BILLBOARD: always turn to FACE the moving camera on the Y axis, so the shoe
    // presents front-on instead of edge-on ("on its side") as you pass it.
    if (f) {
      const dx = s.camera.position.x - o.position.x;
      const dz = s.camera.position.z - z;
      f.rotation.y = Math.atan2(dx, dz);
    }
  });
  const HH = 4.4;                 // towering sculpture height (pulled in so the walls don't crop it)
  const img = map && map.image;
  const aspect = img && img.width && img.height ? img.width / img.height : 0.68;
  const w = HH * aspect;
  const cy = HH / 2 + 0.1;        // stand the sculpture straight on the floor (no plinth)
  return (
    <group ref={outer} position={[x, 0, z]} userData={{ open: onOpen, title, collection }}>
      {/* the towering graffiti-stiletto sculpture — a free-standing transparent
          cutout (no frame, no plinth), billboarding to face the viewer */}
      <group ref={face} position={[0, cy, 0]}>
        {map && (
          <mesh>
            <planeGeometry args={[w, HH]} />
            <meshBasicMaterial map={map} transparent alphaTest={0.5} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
        )}
      </group>
      {/* bright white uplight + a glow behind it (no yellow) */}
      <pointLight position={[0, 1.6, 1.8]} intensity={34} distance={15} decay={2} color="#ffffff" />
      <pointLight position={[0, cy, -1.2]} intensity={22} distance={10} decay={2} color="#ffffff" />
    </group>
  );
}

// ── A LARGE GRAFFITI SPRAY CAN — a towering procedural aerosol can (body + shoulder
// + cap + nozzle) wrapped in one of AL's graffiti collage textures, standing beside
// each monument stiletto. Slides toward the walkway centre with the same parallax
// as the shoes, so the whole entrance shifts to one side as you move through. ──
function SprayCan({ x, z, tex, capColor = '#141416', seed = 0 }) {
  const outer = useRef();
  useFrame((s) => {
    const o = outer.current;
    if (!o) return;
    const rel = s.camera.position.z - z;
    const dir = x >= 0 ? -1 : 1;
    o.position.x = x + THREE.MathUtils.clamp(rel, -8, 8) * 0.16 * dir;
    o.rotation.y = Math.sin(s.clock.elapsedTime * 0.3 + seed) * 0.18;
  });
  const R = 0.62, BODY = 3.4;
  return (
    <group ref={outer} position={[x, 0, z]}>
      {/* body — graffiti-wrapped */}
      <mesh position={[0, BODY / 2 + 0.05, 0]}>
        <cylinderGeometry args={[R, R, BODY, 40]} />
        <meshStandardMaterial map={tex || null} color={tex ? '#ffffff' : '#dcdce0'} metalness={0.55} roughness={0.35} />
      </mesh>
      {/* shoulder taper */}
      <mesh position={[0, BODY + 0.28, 0]}>
        <cylinderGeometry args={[R * 0.5, R, 0.5, 40]} />
        <meshStandardMaterial color="#cfd0d4" metalness={0.65} roughness={0.3} />
      </mesh>
      {/* cap */}
      <mesh position={[0, BODY + 0.9, 0]}>
        <cylinderGeometry args={[R * 0.5, R * 0.5, 0.9, 40]} />
        <meshStandardMaterial color={capColor} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* nozzle */}
      <mesh position={[0, BODY + 1.42, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
        <meshStandardMaterial color="#0e0e10" />
      </mesh>
      <pointLight position={[0, BODY * 0.5, 1.8]} intensity={20} distance={12} decay={2} color="#ffffff" />
    </group>
  );
}

// ── A single brilliant-cut DIAMOND — crown + pavilion cones (8 facets each, flat
// shaded so the facets catch the light and glint as it slowly turns). For the
// diamond-dust A2 print edition: a scatter of these drift through the front hall. ──
function Diamond({ pos, size, seed }) {
  const ref = useRef();
  useFrame((s) => {
    const g = ref.current;
    if (!g) return;
    const t = s.clock.elapsedTime;
    g.rotation.y = t * 0.6 + seed;
    g.rotation.x = Math.sin(t * 0.4 + seed) * 0.4;
    g.position.y = pos[1] + Math.sin(t * 0.6 + seed) * 0.3;
  });
  return (
    <group ref={ref} position={pos}>
      {/* crown (short wide cone, table up) */}
      <mesh position={[0, size * 0.3, 0]}>
        <coneGeometry args={[size, size * 0.5, 8]} />
        <meshStandardMaterial color="#eaf3ff" metalness={0.6} roughness={0.05} emissive="#a6c8ff" emissiveIntensity={0.4} flatShading />
      </mesh>
      {/* pavilion (long cone, point down) */}
      <mesh position={[0, -size * 0.42, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[size, size * 1.15, 8]} />
        <meshStandardMaterial color="#dfeaff" metalness={0.6} roughness={0.05} emissive="#8fb8ff" emissiveIntensity={0.34} flatShading />
      </mesh>
    </group>
  );
}

// A fine field of DIAMOND DUST — tiny additive-white points glittering through the
// hall (the loose diamond dust of the print edition), gently twinkling.
function DiamondDust({ count = 500 }) {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (rand(i * 3.1) - 0.5) * STILETTO.W;
      p[i * 3 + 1] = rand(i * 7.3) * STILETTO.H;
      p[i * 3 + 2] = STILETTO_Z0 + rand(i * 5.7) * STILETTO.LEN;
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return g;
  }, [count]);
  const ref = useRef();
  useFrame((s) => { if (ref.current) ref.current.material.size = 0.045 + Math.sin(s.clock.elapsedTime * 2) * 0.02; });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#eaf2ff" size={0.05} sizeAttenuation transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

// The diamonds of the hall — a scatter of drifting brilliant-cut gems + the dust.
function HallDiamonds() {
  const gems = useMemo(() => {
    const N = 12, arr = [];
    for (let i = 0; i < N; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const t = i / (N - 1);
      const z = STILETTO_Z0 + 7 + t * (STILETTO.LEN - 11);
      arr.push({ pos: [side * (1.4 + rand(i) * 1.5), 1.1 + rand(i * 2.2) * 3.3, z], size: 0.22 + rand(i * 3.3) * 0.22, seed: i * 1.9 });
    }
    return arr;
  }, []);
  return (
    <group>
      {gems.map((g, i) => <Diamond key={i} {...g} />)}
      <DiamondDust count={520} />
      <pointLight position={[0, STILETTO.H - 1, STILETTO_Z0 + STILETTO.LEN / 2]} intensity={12} distance={44} decay={1.4} color="#dfeaff" />
    </group>
  );
}

// ── The hall floor: AL's four graffiti collage floor tiles laid as four panels
// down the length of the entrance corridor. ──
function StilettoFloor() {
  const { W, LEN } = STILETTO;
  const t0 = useSafeTexture(STILETTO_FLOOR_IMGS[0]);
  const t1 = useSafeTexture(STILETTO_FLOOR_IMGS[1]);
  const t2 = useSafeTexture(STILETTO_FLOOR_IMGS[2]);
  const t3 = useSafeTexture(STILETTO_FLOOR_IMGS[3]);
  const texs = [t0, t1, t2, t3];
  // the corridor floor lays the texture top toward -Z (behind the viewer), so the
  // graffiti reads upside-down as you walk in — spin each texture 180° about its
  // centre so the art sits the right way up for a viewer moving up the hall.
  useMemo(() => {
    texs.forEach((t) => { if (t) { t.center.set(0.5, 0.5); t.rotation = Math.PI; t.needsUpdate = true; } });
  }, [t0, t1, t2, t3]);
  const panelLen = LEN / 4;
  return (
    <group>
      {texs.map((t, i) => (
        <mesh key={i} position={[0, 0.001, STILETTO_Z0 + panelLen * (i + 0.5)]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W, panelLen]} />
          <meshStandardMaterial map={t || null} color={t ? '#ffffff' : '#14110f'} roughness={0.5} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
}

// ── THE BILL-POSTER WALL — AL's fly-poster collages wheatpasted ALL OVER both walls
// of the entrance hall: a dense, overlapping, layered street paste-up. The 6 poster
// images are loaded ONCE and shared across ~140 planes (cheap), scattered full-height
// down the whole corridor at slightly different depths so they overlap like real
// layered posters, each with a small street skew. Purely decorative (no click). ──
function BillPosterWall() {
  const { W, H, LEN } = STILETTO;
  // load the poster textures once (fixed count of hooks); nulls are skipped
  const texs = [
    useSafeTexture(STILETTO_BILLPOSTERS[0]),
    useSafeTexture(STILETTO_BILLPOSTERS[1]),
    useSafeTexture(STILETTO_BILLPOSTERS[2]),
    useSafeTexture(STILETTO_BILLPOSTERS[3]),
    useSafeTexture(STILETTO_BILLPOSTERS[4]),
    useSafeTexture(STILETTO_BILLPOSTERS[5]),
  ];
  const ready = texs.filter(Boolean);
  const items = useMemo(() => {
    if (!ready.length) return [];
    const arr = [];
    const N = 140;                        // total paste-ups across both walls
    for (let i = 0; i < N; i++) {
      const side = i % 2 === 0 ? -1 : 1;  // balanced coverage on both walls
      const tex = ready[i % ready.length];
      const h = 1.5 + rand(i * 1.7) * 1.3;                 // 1.5 – 2.8 tall
      const w = h * 1.33;                                   // posters are ~4:3
      const z = STILETTO_Z0 + 1 + rand(i * 2.3) * (LEN - 2);
      const y = 0.5 + rand(i * 3.1) * (H - 1.0);           // full-height coverage
      const depth = 0.03 + (i % 6) * 0.03;                 // layer them off the wall
      const x = side < 0 ? -W / 2 + depth : W / 2 - depth;
      const ry = side < 0 ? Math.PI / 2 : -Math.PI / 2;
      const tilt = (rand(i * 5.9) - 0.5) * 0.14;           // street skew
      arr.push({ tex, w, h, pos: [x, y, z], rot: [0, ry, tilt] });
    }
    return arr;
  }, [ready.length, W, H, LEN]);
  return (
    <group>
      {items.map((p, i) => (
        <mesh key={i} position={p.pos} rotation={p.rot}>
          <planeGeometry args={[p.w, p.h]} />
          <meshStandardMaterial map={p.tex} roughness={0.9} metalness={0} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// ── POP-UP GRAFFITI STILETTOS — extra cutout stilettos that RISE and scale up out
// of the floor and face you as you walk past, then stay standing. Transparent PNGs
// at /portfolio/shop/stiletto-pop N.png; a missing file simply renders nothing. ──
function PopUpStiletto({ url, x, z, height }) {
  const grp = useRef();
  const face = useRef();
  const map = useSafeTexture(url);
  useFrame((s) => {
    const g = grp.current;
    if (!g) return;
    const rel = s.camera.position.z - z;          // <0 before you reach it, >0 past it
    const pop = THREE.MathUtils.clamp((rel + 20) / 14, 0, 1); // rise well ahead, stand up + stay
    const e = pop * pop * (3 - 2 * pop);            // smoothstep ease
    g.scale.set(e, e, e);
    g.visible = e > 0.01;
    if (face.current) {
      face.current.rotation.y = Math.atan2(s.camera.position.x - x, s.camera.position.z - z);
    }
  });
  if (!map) return null;
  const img = map.image;
  const aspect = img && img.width && img.height ? img.width / img.height : 0.5;
  const w = height * aspect;
  return (
    // scale grows from the floor (transformOrigin at base via group offset)
    <group ref={grp} position={[x, 0, z]} scale={[0.01, 0.01, 0.01]}>
      <group ref={face} position={[0, height / 2, 0]}>
        <mesh>
          <planeGeometry args={[w, height]} />
          <meshBasicMaterial map={map} transparent alphaTest={0.5} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      </group>
      <pointLight position={[0, height * 0.5, 1.4]} intensity={20} distance={10} decay={2} color="#ffffff" />
    </group>
  );
}

function PopUpStilettos() {
  const { W } = STILETTO;
  const items = useMemo(() => {
    const arr = [];
    const N = 10;                                       // cycle the 6 cutouts for a denser run
    for (let i = 0; i < N; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const t = (i + 0.5) / N;                          // spread evenly down the hall
      const z = STILETTO_Z0 + 10 + t * (STILETTO.LEN - 16);
      const x = side * (W / 2 - (1.9 + (i % 2) * 0.6)); // pulled in toward the walkway
      const height = 3.0 + (i % 3) * 0.5;               // 3.0 – 4.0 tall — reads clearly
      arr.push({ url: STILETTO_POPUPS[i % STILETTO_POPUPS.length], x, z, height });
    }
    return arr;
  }, [W]);
  return (
    <group>
      {items.map((p, i) => (
        <PopUpStiletto key={i} url={p.url} x={p.x} z={p.z} height={p.height} />
      ))}
    </group>
  );
}

// ── THE DROP ROOM — a single Graffiti Stiletto edition on a plinth, its cutout
// billboarding to face you, with a floating edition plaque. Placeholder art =
// her graffiti-stiletto works (padded with the pop-up cutouts). ──
function DropPiece({ url, x, z, n, hero, work, onOpen, onMint }) {
  const face = useRef();
  const labelRef = useRef();
  const map = useSafeTexture(url);
  // click a piece → open its animation + marketplace (SuperRare edition) link in the
  // shared lightbox; if no real work is wired yet, fall back to the mint page.
  const open = () => (work ? onOpen(work) : onMint());
  useFrame((s) => {
    if (face.current) face.current.rotation.y = Math.atan2(s.camera.position.x - x, s.camera.position.z - z);
    if (labelRef.current) {
      const d = Math.abs(s.camera.position.z - z);
      // read the plaque from a step back; it FADES AWAY as you walk right up to the
      // frame (so the artwork is unobstructed) and also fades when far down the room.
      const near = THREE.MathUtils.clamp((d - 3.5) / 2, 0, 1);
      const far = THREE.MathUtils.clamp((16 - d) / 6, 0, 1);
      labelRef.current.style.opacity = String(Math.min(near, far));
    }
  });
  // A2 landscape frame (594×420mm → aspect 1.414). Hero piece a touch larger.
  const FH = hero ? 2.7 : 2.3;                 // outer frame height
  const FW = FH * 1.414;                        // A2 horizontal → wider than tall
  const MAT = 0.26;                             // white mat inset
  const innerW = FW - MAT * 2, innerH = FH - MAT * 2;
  const img = map && map.image;
  const ia = img && img.width && img.height ? img.width / img.height : 1.414;
  // fit the artwork inside the mat window, preserving its own aspect
  const boxA = innerW / innerH;
  const iw = ia > boxA ? innerW : innerH * ia;
  const ih = ia > boxA ? innerW / ia : innerH;
  const cy = 0.96 + FH / 2 + 0.28;              // hang the frame just above the plinth top
  const nn = String(n).padStart(2, '0');
  return (
    <group position={[x, 0, z]} userData={{ open, title: `Graffiti Stiletto No. ${nn}`, collection: `Edition of ${DROP_EDITION} \u00b7 ${DROP_PRINT}` }}>
      {/* plinth */}
      <mesh position={[0, 0.47, 0]}><boxGeometry args={[1.7, 0.94, 1.7]} /><meshStandardMaterial color="#f5f2ec" roughness={0.6} metalness={0} /></mesh>
      <mesh position={[0, 0.96, 0]}><boxGeometry args={[1.94, 0.06, 1.94]} /><meshStandardMaterial color="#e6e1d5" roughness={0.55} /></mesh>
      {/* framed A2-horizontal artwork — black frame, white mat, image — billboarding to face you */}
      <group ref={face} position={[0, cy, 0]}>
        <mesh position={[0, 0, 0]}><planeGeometry args={[FW, FH]} /><meshStandardMaterial color="#0a0a0a" roughness={0.45} metalness={0.2} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, 0, 0.02]}><planeGeometry args={[FW - 0.14, FH - 0.14]} /><meshStandardMaterial color="#f7f4ee" roughness={0.9} /></mesh>
        {map && (<mesh position={[0, 0, 0.04]}><planeGeometry args={[iw, ih]} /><meshBasicMaterial map={map} toneMapped={false} /></mesh>)}
      </group>
      <pointLight position={[0, cy + 0.6, 2.2]} intensity={30} distance={16} decay={2} color="#ffffff" />
      {/* floating edition plaque — faces back toward the approaching viewer (-Z) */}
      <Html position={[0, 0.5, -1.15]} rotation={[0, Math.PI, 0]} center transform distanceFactor={2.6} pointerEvents="none" zIndexRange={[2, 0]}>
        <div ref={labelRef} style={{ width: 250, textAlign: 'center', fontFamily: 'Inter, sans-serif', color: '#141414', background: 'rgba(255,255,255,0.94)', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 4, padding: '12px 16px', boxShadow: '0 12px 34px rgba(0,0,0,0.28)', transition: 'opacity .2s linear' }}>
          <div style={{ fontWeight: 800, letterSpacing: -0.4, fontSize: 15, textTransform: 'uppercase' }}>Graffiti Stiletto</div>
          <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: -1, lineHeight: 1, marginTop: 2 }}>No. {nn}</div>
          <div style={{ marginTop: 9, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#6a6a6a' }}>Edition of {DROP_EDITION} · SuperRare</div>
          <div style={{ marginTop: 6, fontSize: 11.5, color: '#333', lineHeight: 1.35 }}>Diamond-dusted A2 AR print<br />+ NFT animation</div>
          <div style={{ marginTop: 9, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: '#b0138e', fontWeight: 700 }}>Tap to view animation →</div>
        </div>
      </Html>
    </group>
  );
}

// Shimmering "GRAFFITI STILETTOS" wall lettering — a big gradient wordmark that
// sweeps light across itself, laid flat on a wall via an Html transform plane.
function DropWallText({ position, rotation }) {
  const ref = useRef();
  // drei <Html> projects DOM at ANY camera distance, so without gating the words
  // bleed all the way down the entrance corridor. Only reveal them once the camera
  // has passed the spray-can gate (z ≈ 0) INTO the main showroom.
  useFrame((s) => {
    if (ref.current) {
      const z = s.camera.position.z;
      ref.current.style.opacity = String(THREE.MathUtils.clamp((z - DROP_Z0) / 5, 0, 1));
    }
  });
  return (
    <Html position={position} rotation={rotation} transform distanceFactor={5} pointerEvents="none" zIndexRange={[1, 0]} occlude={false}>
      <div ref={ref} className="drop-wall-text" style={{ opacity: 0 }}>GRAFFITI<br />STILETTOS</div>
    </Html>
  );
}

// The bright showroom the spray-can gate opens out INTO — the 7 stiletto editions
// stand in a shallow FAN so you see them all at once, under a bright pink open sky,
// framed by two giant graffiti spray cans, a band of fly-posters on the back wall,
// and shimmering GRAFFITI STILETTOS lettering on the side walls.
function DropRoom({ works, onMint, onOpen }) {
  const { W, H, LEN } = DROP;
  const z0 = DROP_Z0, midZ = z0 + LEN / 2;
  // AL's four graffiti collage floor tiles (the same set laid in the hall) — laid
  // as four panels down the room so the drop floor reads as her collage, not marble.
  const ft0 = useSafeTexture(STILETTO_FLOOR_IMGS[0]);
  const ft1 = useSafeTexture(STILETTO_FLOOR_IMGS[1]);
  const ft2 = useSafeTexture(STILETTO_FLOOR_IMGS[2]);
  const ft3 = useSafeTexture(STILETTO_FLOOR_IMGS[3]);
  const floorTiles = [ft0, ft1, ft2, ft3];
  useMemo(() => {
    floorTiles.forEach((t) => { if (t) { t.center.set(0.5, 0.5); t.rotation = Math.PI; t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; } });
  }, [ft0, ft1, ft2, ft3]);
  const panelLen = LEN / 4;
  // spray-can textures (reused from the hall)
  const canTexA = useSafeTexture(STILETTO_FLOOR_IMGS[2]);
  const canTexB = useSafeTexture(STILETTO_FLOOR_IMGS[3]);
  useMemo(() => { [canTexA, canTexB].forEach((t) => { if (t) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; } }); }, [canTexA, canTexB]);
  const urls = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 7; i++) {
      const w = works[i];
      arr.push((w && (w.thumbnail || w.image)) || STILETTO_POPUPS[i % STILETTO_POPUPS.length]);
    }
    return arr;
  }, [works]);
  // a shallow concave FAN facing the entrance — all seven visible at once, the
  // middle piece standing forward as the hero.
  const slots = useMemo(() => urls.map((url, i) => {
    const t = i / 6;                            // 0..1 across the fan
    const ang = (t - 0.5) * 1.7;                // ~-49°..49° — a wide sweep
    const R = 13.5;                             // wider radius → frames spread apart, no overlap
    const x = Math.sin(ang) * R;                // ±~10 → ~20-wide spread
    const z = z0 + 12 + (1 - Math.cos(ang)) * 2.5;  // HERO centre stands FORWARD, edges sweep back
    return { url, x, z, n: i + 1, hero: i === 3, work: works[i] || null };
  }), [urls, z0, works]);
  return (
    <group>
      {/* floor — AL's four graffiti collage tiles laid down the room */}
      {floorTiles.map((t, i) => (
        <mesh key={i} position={[0, 0.001, z0 + panelLen * (i + 0.5)]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W, panelLen]} />
          <meshStandardMaterial map={t || null} color={t ? '#ffffff' : '#14110f'} roughness={0.5} metalness={0.1} />
        </mesh>
      ))}
      {/* NO ceiling — open to the bright pink sky. Walls are a clean warm white so
          the pink sky + graffiti pieces read (dark walls fought the pink). */}
      <mesh position={[-W / 2, H / 2, midZ]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[LEN, H]} /><meshStandardMaterial color="#f2edf0" roughness={0.95} side={THREE.DoubleSide} /></mesh>
      <mesh position={[W / 2, H / 2, midZ]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[LEN, H]} /><meshStandardMaterial color="#f2edf0" roughness={0.95} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, H / 2, DROP_Z1]}><planeGeometry args={[W, H]} /><meshStandardMaterial color="#f2edf0" roughness={0.95} side={THREE.DoubleSide} /></mesh>
      {/* (no fly-posters on the walls here — AL prefers clean walls in the main hall) */}
      {/* shimmering GRAFFITI STILETTOS on both side walls */}
      <DropWallText position={[-W / 2 + 0.12, H * 0.6, midZ]} rotation={[0, Math.PI / 2, 0]} />
      <DropWallText position={[W / 2 - 0.12, H * 0.6, midZ]} rotation={[0, -Math.PI / 2, 0]} />
      {/* two giant graffiti spray cans framing the display */}
      <SprayCan x={-W / 2 + 2.6} z={z0 + 15} tex={canTexA} capColor="#e64b3c" seed={0.6} />
      <SprayCan x={W / 2 - 2.6} z={z0 + 15} tex={canTexB} capColor="#2f6df0" seed={2.1} />
      {/* a CLUSTER of towering 3D graffiti-stiletto sculptures standing in the room,
          gathered around the two giant spray cans and flanking the fan */}
      <StilettoMonument url={STILETTO_SCULPTURES[0]} x={-W / 2 + 4.5} z={z0 + 5}
        title="Graffiti Stiletto" collection="Graffiti Stilettos · the drop" onOpen={onMint} />
      <StilettoMonument url={STILETTO_SCULPTURES[1]} x={W / 2 - 4.5} z={z0 + 5}
        title="Graffiti Stiletto" collection="Graffiti Stilettos · the drop" onOpen={onMint} />
      <StilettoMonument url={STILETTO_SCULPTURES[1]} x={-W / 2 + 1.6} z={z0 + 12}
        title="Graffiti Stiletto" collection="Graffiti Stilettos · the drop" onOpen={onMint} />
      <StilettoMonument url={STILETTO_SCULPTURES[0]} x={W / 2 - 1.6} z={z0 + 12}
        title="Graffiti Stiletto" collection="Graffiti Stilettos · the drop" onOpen={onMint} />
      <StilettoMonument url={STILETTO_SCULPTURES[0]} x={-W / 2 + 3.0} z={z0 + 18}
        title="Graffiti Stiletto" collection="Graffiti Stilettos · the drop" onOpen={onMint} />
      <StilettoMonument url={STILETTO_SCULPTURES[1]} x={W / 2 - 3.0} z={z0 + 18}
        title="Graffiti Stiletto" collection="Graffiti Stilettos · the drop" onOpen={onMint} />
      {/* showroom light — bright white key + a pink fill so the sky reads on surfaces */}
      <ambientLight intensity={0.6} color="#ffffff" />
      <hemisphereLight args={[DROP_SKY, '#2a2030', 0.5]} />
      <pointLight position={[0, H + 2, z0 + 10]} intensity={70} distance={50} decay={1.4} color="#ffffff" />
      <pointLight position={[0, H - 1, z0 + 2]} intensity={30} distance={30} decay={1.6} color={DROP_SKY} />
      {slots.map((s, i) => (
        <DropPiece key={i} url={s.url} x={s.x} z={s.z} n={s.n} hero={s.hero} work={s.work} onOpen={onOpen} onMint={onMint} />
      ))}
    </group>
  );
}

// ── THE FRONT HALL OF GRAFFITI STILETTOS — her Graffiti Stiletto 1/1s FLOATING in
// gilt frames alternating down both walls of the entrance corridor (negative z),
// with the big gilt-framed RE-LAUNCH MINT at its head and two towering monument
// stilettos flanking the entrance. You enter here first, then glide on through the
// doorway into the ink shop. ──
function StilettoHall({ works, onOpen, heroImg, onMint }) {
  const { W, H, LEN } = STILETTO;
  const start = STILETTO_Z0 + 16, end = STILETTO_Z1 - 3;
  // this hall's OWN floor + walls (distinct textures from the ink shop). Loaded
  // without suspending/crashing; a missing file simply falls back to the base colour.
  const wallTex = useSafeTexture(STILETTO_WALL_IMG);
  useMemo(() => {
    if (wallTex) {
      wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
      wallTex.repeat.set(Math.round(LEN / 7), 1);
      wallTex.colorSpace = THREE.SRGBColorSpace;
    }
  }, [wallTex, LEN]);
  // graffiti labels wrapping the two big spray cans beside the monuments
  const canTexA = useSafeTexture(STILETTO_FLOOR_IMGS[2]);
  const canTexB = useSafeTexture(STILETTO_FLOOR_IMGS[3]);
  useMemo(() => {
    [canTexA, canTexB].forEach((t) => { if (t) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; } });
  }, [canTexA, canTexB]);
  const plan = useMemo(() => {
    const list = works.slice(0, 12);
    return list.map((w, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const t = list.length > 1 ? i / (list.length - 1) : 0;
      const z = start + t * (end - start);
      // PARALLAX: stagger how far each work sits off the wall (its depth) and its
      // height, so as you glide through they slide past each other at different
      // rates. Centre walk-channel kept clear (works stay out past |x| ~1.6).
      const depth = 1.0 + ((i * 7) % 5) * 0.5;      // 1.0 – 3.0 off the wall
      const x = side * (W / 2 - depth);
      const y = 1.7 + ((i * 3) % 5) * 0.5;          // 1.7 – 3.7
      return { w, pos: [x, y, z], rotY: side < 0 ? Math.PI / 2 : -Math.PI / 2 };
    });
  }, [works, start, end]);
  // the two towering entrance monuments are AL's real graffiti platform-stiletto
  // shoes (transparent cutout sculptures); clicking one opens the matching on-chain
  // work if we have it, else it's just the statue.
  const monuA = works[0] || null;
  const monuB = works[1] || works[0] || null;
  const midZ = STILETTO_Z0 / 2;   // centre of the hall (STILETTO_Z0 → 0)
  return (
    <group>
      {/* ── this hall's own shell (its own floor + walls, distinct from the shop) ── */}
      {/* floor — AL's four graffiti collage tiles laid down the corridor */}
      <StilettoFloor />
      {/* ceiling */}
      <mesh position={[0, H, midZ]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, LEN]} />
        <meshStandardMaterial color="#0a0a0c" roughness={1} side={THREE.DoubleSide} />
      </mesh>
      {/* side walls */}
      <mesh position={[-W / 2, H / 2, midZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[LEN, H]} />
        <meshStandardMaterial map={wallTex || null} color={wallTex ? '#ffffff' : '#171418'} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[W / 2, H / 2, midZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[LEN, H]} />
        <meshStandardMaterial map={wallTex || null} color={wallTex ? '#ffffff' : '#171418'} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* back wall behind the hero mint */}
      <mesh position={[0, H / 2, STILETTO_Z0]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial map={wallTex || null} color={wallTex ? '#ffffff' : '#171418'} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* bright, clean WHITE gallery light (no warm/yellow cast — black-and-white hall) */}
      <ambientLight intensity={0.55} color="#ffffff" />
      <pointLight position={[0, H - 0.8, STILETTO_Z0 + 14]} intensity={60} distance={40} decay={1.5} color="#ffffff" />
      <pointLight position={[0, H - 0.8, STILETTO_Z0 + 34]} intensity={56} distance={40} decay={1.5} color="#ffffff" />
      {/* the big gilt-framed re-launch mint at the head of the hall */}
      <group position={[0, 3.0, STILETTO_Z0 + 1.3]} userData={{ open: onMint, title: RELAUNCH_TITLE, collection: 'The Re-Launch \u00b7 mint on Manifold' }}>
        <GiltFrame url={heroImg} max={3.6} hero />
        <pointLight position={[0, 0, 2.4]} intensity={26} distance={12} decay={2} color="#ffffff" />
      </group>
      {/* two towering graffiti-stiletto SCULPTURES flanking the entrance walkway
          (AL's own collage platform stilettos, standing in for a door threshold) */}
      <StilettoMonument url={STILETTO_SCULPTURES[0]} x={-2.0} z={STILETTO_Z0 + 9}
        onOpen={() => monuA && onOpen(monuA)}
        title={(monuA && (monuA.title || monuA.name)) || 'Graffiti Stiletto'}
        collection={(monuA && monuA.collection) || 'Graffiti Stilettos'} />
      <StilettoMonument url={STILETTO_SCULPTURES[1]} x={2.0} z={STILETTO_Z0 + 9}
        onOpen={() => monuB && onOpen(monuB)}
        title={(monuB && (monuB.title || monuB.name)) || 'Graffiti Stiletto'}
        collection={(monuB && monuB.collection) || 'Graffiti Stilettos'} />
      {/* two LARGE graffiti spray cans standing mid-hall beside the walkway (pulled
          further down the corridor so they read clearly, not lost at the entrance) */}
      <SprayCan x={-3.3} z={STILETTO_Z0 + 22} tex={canTexA} seed={0.6} />
      <SprayCan x={3.3} z={STILETTO_Z0 + 22} tex={canTexB} seed={2.1} />
      {/* the rest FLOAT down both walls — a slow suspended drift, not flat-mounted */}
      {plan.map(({ w, pos, rotY }, i) => (
        <FloatGilt key={w.id} basePos={pos} rotY={rotY} seed={i * 1.7} url={w.thumbnail || w.image} max={2.2}
          userData={{ open: () => onOpen(w), title: w.title || w.name || '', collection: w.collection || '' }} />
      ))}
      {/* AL's fly-posters wheatpasted ALL OVER both walls (dense layered paste-up) */}
      <BillPosterWall />
      {/* extra graffiti-stiletto cutouts that POP UP out of the floor as you pass */}
      <PopUpStilettos />
      {/* ── THE CAN GATE — a row of big graffiti spray cans stands across the hall at
             the threshold, SEPARATING the graffiti room from the ink room. As you
             reach it the cans sweep aside to the walls, opening the way through. ── */}
      {canTexA && (
        <group>
          {[[-3.0, '#e64b3c', 1], [-1.8, '#2f6df0', -1], [-0.6, '#f5b301', 1], [0.6, '#2ec77a', -1], [1.8, '#e64b3c', 1], [3.0, '#f5b301', -1]].map(([cx, cc, dr], i) => (
            <OneCan key={i} x={cx} z={STILETTO_Z1 - 1.5} tex={(i % 2 && canTexB) ? canTexB : canTexA} capColor={cc} spin={dr * 0.15} scale={0.78}
              part={{ z0: STILETTO_Z1 - 1.5, wallX: Math.sign(cx) * (W / 2 - 0.6) }} />
          ))}
          <pointLight position={[0, H - 1, STILETTO_Z1 - 1.5]} intensity={40} distance={20} decay={1.6} color="#ffffff" />
        </group>
      )}
      {/* diamond-dust edition — brilliant-cut diamonds + glittering dust drift the hall */}
      <HallDiamonds />
    </group>
  );
}

// A moving-image work: plays its animation_url as a VideoTexture. Created wholly
// inside a useEffect + held in state (StrictMode-safe — see the door-film notes),
// disposed on cleanup. Self-gates decode to the Works zone via useFrame (only
// plays while the camera is in the collage rooms) so the browser's ~8-video cap
// isn't blown by the cinema + world films playing at once. Returns null until
// the frame is ready, so the static poster (rendered behind it) shows meanwhile.
function HungVideo({ src, max = 1.5, z = 0 }) {
  const vidRef = useRef(null);
  const [tex, setTex] = useState(null);
  const [aspect, setAspect] = useState(1);
  useEffect(() => {
    if (!src) return;
    const v = document.createElement('video');
    v.src = src; v.crossOrigin = 'anonymous'; v.loop = true; v.muted = true;
    v.playsInline = true; v.preload = 'auto';
    vidRef.current = v;
    let t = null;
    const onReady = () => {
      if (v.videoWidth && v.videoHeight) setAspect(v.videoWidth / v.videoHeight);
      t = new THREE.VideoTexture(v);
      t.colorSpace = THREE.SRGBColorSpace;
      setTex(t);
    };
    v.addEventListener('loadeddata', onReady, { once: true });
    v.load();
    return () => { v.pause(); if (t) t.dispose(); v.removeAttribute('src'); v.load(); vidRef.current = null; setTex(null); };
  }, [src]);
  useFrame((s) => {
    const v = vidRef.current; if (!v) return;
    // Only decode when the camera is near THIS work (not the whole zone) — keeps
    // us under the browser's ~8 simultaneous-video cap while letting every
    // animated work play as you reach it.
    const active = Math.abs(s.camera.position.z - z) < 11;
    if (active && v.paused) v.play().catch(() => {});
    else if (!active && !v.paused) v.pause();
  });
  const w = aspect >= 1 ? max : max * aspect;
  const h = aspect >= 1 ? max / aspect : max;
  if (!tex) return null;
  return (
    <mesh><planeGeometry args={[w, h]} /><meshBasicMaterial map={tex} toneMapped={false} side={THREE.DoubleSide} /></mesh>
  );
}

// The shop shell: marble floor, ink-wall side walls, dark ceiling, and the
// ink-explosion doors closing the far end.
function Shell() {
  const { W, H, LEN } = HALL;
  const [wall, floor, door] = useTexture([WALL_IMG, FLOOR_IMG, DOOR_IMG]);

  useMemo(() => {
    floor.wrapS = floor.wrapT = THREE.RepeatWrapping;
    floor.repeat.set(Math.round(W / 3), Math.round(INK_Z1 / 3));
    floor.flipY = false; // AL's marble scan came in upside-down — flip it back
    floor.colorSpace = THREE.SRGBColorSpace;
    wall.wrapS = wall.wrapT = THREE.RepeatWrapping;
    wall.repeat.set(Math.round(LEN / 7), 1);
    wall.colorSpace = THREE.SRGBColorSpace;
    door.colorSpace = THREE.SRGBColorSpace;
  }, [wall, floor, door]);

  // the ink shop spans z=0 → LEN; the stiletto hall (negative z) has its own shell
  const midZ = LEN / 2;
  return (
    <>
      {/* marble floor — runs the shop up to the ink well; the mint room beyond it
          is open bright space, so it stops at INK_Z1 */}
      <mesh position={[0, 0, INK_Z1 / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, INK_Z1]} />
        <meshStandardMaterial map={floor} roughness={0.35} metalness={0.15} />
      </mesh>
      {/* ceiling — deep, so the eye stays on the walls */}
      <mesh position={[0, H, midZ]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, LEN]} />
        <meshStandardMaterial color="#0a0a0c" roughness={1} side={THREE.DoubleSide} />
      </mesh>
      {/* side walls, ink-splattered renaissance interior */}
      <mesh position={[-W / 2, H / 2, midZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[LEN, H]} />
        <meshStandardMaterial map={wall} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[W / 2, H / 2, midZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[LEN, H]} />
        <meshStandardMaterial map={wall} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* far wall = the ink-explosion doors, but with a real opening cut through
          them — the AI CINEMA hall glows beyond (see CinemaHall), so the far end
          reads as a lit doorway you walk THROUGH into the rest of the journey. */}
      {(() => {
        const openW = W * 0.72, openH = H * 0.84;
        const sideW = (W - openW) / 2, topH = H - openH;
        return (
          <group position={[0, 0, LEN]}>
            <mesh position={[-(openW / 2 + sideW / 2), H / 2, 0]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[sideW, H]} />
              <meshStandardMaterial map={door} roughness={0.85} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[openW / 2 + sideW / 2, H / 2, 0]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[sideW, H]} />
              <meshStandardMaterial map={door} roughness={0.85} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, openH + topH / 2, 0]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[openW, topH]} />
              <meshStandardMaterial map={door} roughness={0.85} side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })()}
      {/* the stiletto hall opens straight into the shop at z=0 — no door (removed) */}
    </>
  );
}

// Hang the works alternating down the two walls, pulled well OFF the wall (the
// busy ink walls swallow anything flush) and evenly spaced along the hall.
function WallWorks({ works, onOpen }) {
  const { W, LEN } = HALL;
  const plan = useMemo(() => {
    const start = 7, end = LEN - 7;
    return works.map((w, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const t = works.length > 1 ? i / (works.length - 1) : 0;
      const z = start + t * (end - start);
      return { w, pos: [side * (W / 2 - 0.4), 2.35, z], rotY: side < 0 ? Math.PI / 2 : -Math.PI / 2 };
    });
  }, [works]);
  return plan.map(({ w, pos, rotY }) => (
    <group key={w.id} position={pos} rotation={[0, rotY, 0]} userData={{ open: () => onOpen(w), title: w.title || w.name || '', collection: w.collection || '' }}>
      <Hung url={w.thumbnail || w.image} max={2.3} />
    </group>
  ));
}

// A cloud of works FLOATING in the hall's volume — up near the ceiling and out
// toward the walls so the central walk-channel stays clear. They bob and face
// back toward the incoming viewer, parting around you as you glide (the depth /
// parallax AL wanted, on top of the wall-hung pieces).
function FloatWorks({ works, onOpen }) {
  const { LEN } = HALL;
  const plan = useMemo(() => {
    return works.map((w, i) => {
      const angle = rand(i + 11) * Math.PI * 2;
      const radius = 1.9 + rand(i + 21) * 1.6;               // 1.9–3.5: some sweep closer past you
      const x = clamp(Math.cos(angle) * radius, -3.4, 3.4);
      const y = 1.3 + rand(i + 31) * 3.9;                    // full height 1.3–5.2 (more vertical spread)
      // denser, jittered spacing so near works whoosh past while far ones drift → stronger parallax
      const z = 7 + (i + 0.5) * ((LEN - 13) / Math.max(1, works.length)) + (rand(i + 41) - 0.5) * 4.5;
      const seed = rand(i + 51) * Math.PI * 2;
      const tilt = (rand(i + 61) - 0.5) * 0.5;
      return { w, x, y, z, seed, tilt };
    });
  }, [works]);
  return plan.map(({ w, x, y, z, seed, tilt }) => (
    <FloatOne key={w.id} w={w} x={x} y={y} z={z} seed={seed} tilt={tilt} part onOpen={onOpen} />
  ));
}

function FloatOne({ w, x, y, z, seed, tilt = 0, onOpen, max = 1.5, bare = false, part = false, animate = false }) {
  const ref = useRef();
  const dir = x >= 0 ? 1 : -1;                 // which side this work slides toward
  useFrame((s) => {
    const el = ref.current;
    if (!el) return;
    const t = s.clock.elapsedTime + seed;
    let px = x, py = y + Math.sin(t * 0.4) * 0.22;
    if (part) {
      // slide OUT of the walk path as the camera nears, glide back after passing.
      const dz = z - s.camera.position.z;
      const prox = Math.max(0, 1 - Math.abs(dz) / 7);   // 0..1, peaks at the work
      const ease = prox * prox * (3 - 2 * prox);         // smoothstep
      px = x + ease * 3.4 * dir;                          // push toward its side
      py += ease * 0.9 * (y > 2.9 ? 1 : -1);             // and up/down away from eye
    }
    el.position.x = px;
    el.position.y = py;
    el.rotation.z = Math.sin(t * 0.25) * 0.02;
  });
  return (
    <group ref={ref} position={[x, y, z]} rotation={[0, Math.PI + tilt, 0]} userData={{ open: () => onOpen(w), title: w.title || w.name || '', collection: w.collection || '' }}>
      <Hung url={w.thumbnail || w.image} max={max} bare={bare} />
      {/* moving-image works play their video over the static poster */}
      {animate && w.animation && (
        <group position={[0, 0, bare ? 0.012 : 0.05]}>
          <HungVideo src={resolveImg(w.animation)} max={max} z={z} />
        </group>
      )}
    </group>
  );
}

// ── Zone 2: the AI CINEMA hall — a dark screening corridor BEYOND the ink doors.
//    Her films play on screens hung down both walls; you walk right through it.
//    Screens are self-lit (fog-exempt) so they glow out of the dark. A crosshair
//    click on any screen opens the full AI Cinema reel. ──
// Rows of stadium cinema seats running down BOTH sides of the corridor floor —
// dark silhouettes (seat + backrest) so the AI Cinema reads as a screening room
// you walk through, not just floating panels.
function CinemaSeating() {
  const { W, H, LEN } = CINEMA;
  const z0 = CINEMA_Z0;
  const seats = useMemo(() => {
    const out = [];
    const rows = Math.floor((LEN - 6) / 2.4);   // rows down the length
    for (const side of [-1, 1]) {
      for (let r = 0; r < rows; r++) {
        const z = z0 + 4 + r * 2.4;
        // two seats per row on each side, tucked RIGHT against the wall so the
        // floating film frames (at x=±2.4) stay clear in front of the seating
        for (const off of [0.4, 0.95]) {
          const x = side * (W / 2 - off);
          out.push({ x, z, key: `${side}-${r}-${off}` });
        }
      }
    }
    return out;
  }, [z0, LEN, W]);
  return (
    <group>
      {seats.map(({ x, z, key }) => (
        <group key={key} position={[x, 0, z]}>
          {/* seat base — kept low (top ~0.47) */}
          <mesh position={[0, 0.26, 0]}><boxGeometry args={[0.5, 0.42, 0.54]} /><meshStandardMaterial color="#0c0c11" roughness={0.9} /></mesh>
          {/* backrest — top ~0.83, sits BELOW the lower film band so it never obstructs */}
          <mesh position={[0, 0.58, -0.22]}><boxGeometry args={[0.5, 0.5, 0.12]} /><meshStandardMaterial color="#101017" roughness={0.9} /></mesh>
        </group>
      ))}
    </group>
  );
}

function CinemaHall({ films, filmList = [], filmAspects = [], onFilm }) {
  const { W, H, LEN } = CINEMA;
  const z0 = CINEMA_Z0, midZ = (CINEMA_Z0 + CINEMA_Z1) / 2;
  const MAXH = 2.5, MAXW = 3.6;
  // A GAUNTLET of playing films fanning out on BOTH sides in two tiers — floating
  // panels billboarded to face you as you walk in, so you see many at once and
  // can walk straight up to any one. Screens reuse the film textures (cheap), so
  // there are lots of screens but only a handful of decoding videos.
  const screens = useMemo(() => {
    const out = [];
    const rows = 2;                         // lower + upper tier
    const perRow = 5;                       // 5 down each side, per tier
    let k = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < perRow; c++) {
        for (const side of [-1, 1]) {
          const t = (c + 0.5) / perRow;
          const span = (LEN - 28) / perRow;
          // stagger L/R and offset the UPPER tier in z too so the tiers interleave
          // (never stack on top of one another → no overlap / clipping)
          const z = z0 + 4 + t * (LEN - 28) + (side < 0 ? 0 : span / 2) + (r === 1 ? span / 4 : 0);
          const x = side * (W / 2 - 1.6);          // pulled well off the walls so the tilted frame never clips
          const y = r === 0 ? 2.05 : 4.15;         // lower + upper tier — lower lifted so seats clear it
          out.push({ side, x, y, z, i: k, yaw: (side < 0 ? Math.PI / 2 : -Math.PI / 2) - side * 0.5 });
          k++;
        }
      }
    }
    return out;
  }, [z0, LEN]);
  const dims = (aspect) => {
    const a = aspect && aspect > 0 ? aspect : 16 / 9;
    const sw = a >= MAXW / MAXH ? MAXW : MAXH * a;
    const sh = a >= MAXW / MAXH ? MAXW / a : MAXH;
    return { sw, sh };
  };
  return (
    <group>
      {/* dark side walls + ceiling (the marble floor continues underneath) */}
      <mesh position={[-W / 2, H / 2, midZ]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[LEN, H]} /><meshStandardMaterial color="#0a0a0d" roughness={1} side={THREE.DoubleSide} /></mesh>
      <mesh position={[W / 2, H / 2, midZ]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[LEN, H]} /><meshStandardMaterial color="#0a0a0d" roughness={1} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, H, midZ]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[W, LEN]} /><meshStandardMaterial color="#050506" roughness={1} side={THREE.DoubleSide} /></mesh>
      {/* cool wash so the hall isn't pitch-black between the screens */}
      <pointLight position={[0, H - 0.7, z0 + LEN * 0.28]} intensity={10} distance={22} decay={1.7} color="#8aa0ff" />
      <pointLight position={[0, H - 0.7, z0 + LEN * 0.72]} intensity={10} distance={22} decay={1.7} color="#8aa0ff" />
      {/* her brand glowing large on the cinema's black side walls */}
      <WallWordmark zone={CINEMA} z0={CINEMA_Z0} />
      {/* stadium seating down both sides of the corridor */}
      <CinemaSeating />
      {screens.map(({ x, y, z, i, yaw }) => {
        const fi = films.length ? i % films.length : 0;
        const tex = films.length ? films[fi] : null;
        const film = filmList.length ? filmList[i % filmList.length] : null;
        const { sw, sh } = dims(filmAspects[fi]);
        return (
          <group key={i} position={[x, y, z]} rotation={[0, yaw, 0]}
            userData={{ open: () => onFilm(film), title: film ? film.title : 'AI Cinema', collection: film ? `${film.sub || ''} — click to play` : 'click to play' }}>
            {/* generous invisible hit target so the crosshair catches the film even
                when you're not aimed dead-centre (films were hard to click) */}
            <mesh position={[0, 0, 0.05]}><planeGeometry args={[sw + 1.8, sh + 1.8]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
            {/* a glowing bezel so each screen reads as a lit panel */}
            <mesh position={[0, 0, -0.04]}><planeGeometry args={[sw + 0.34, sh + 0.34]} /><meshBasicMaterial color="#9fb4e6" toneMapped={false} fog={false} transparent opacity={0.85} /></mesh>
            <mesh position={[0, 0, -0.02]}><planeGeometry args={[sw + 0.14, sh + 0.14]} /><meshBasicMaterial color="#06070c" toneMapped={false} fog={false} /></mesh>
            <mesh><planeGeometry args={[sw, sh]} /><meshBasicMaterial map={tex || null} color={tex ? '#ffffff' : '#0a0a0d'} toneMapped={false} fog={false} /></mesh>
            {/* a soft "play" glow dot so the screens read as clickable */}
            <mesh position={[0, -sh / 2 - 0.26, 0.02]}><circleGeometry args={[0.14, 24]} /><meshBasicMaterial color="#eef3ff" transparent opacity={0.6} toneMapped={false} fog={false} depthWrite={false} /></mesh>
          </group>
        );
      })}
    </group>
  );
}

// ── Zone 3: SELECTED WORKS — an IMMERSIVE chamber you fly straight THROUGH.
//    Her works fill the whole volume as a dense, frameless cloud at every depth
//    and radius (some skim past on either side, some huge overhead), so you're
//    *inside* the artworks rather than looking at a hung wall. Dark surfaces so
//    the imagery IS the room. Click any work to open it. ──
// The MISS AL SIMPSON wordmark glowing BIG on the black side walls of the Works
// zone — additive light planes that breathe in brightness, so her brand reads
// as luminous signage flanking the walk through the works.
function WallWordmark({ zone, z0 }) {
  const { W, H, LEN } = zone;
  const logo = useTexture('/LOGO MISS.png');
  logo.colorSpace = THREE.SRGBColorSpace;
  logo.anisotropy = 16;
  const img = logo.image;
  const aspect = img && img.width && img.height ? img.width / img.height : 4.5;
  const lw = 5.4, lh = lw / aspect;                 // BIG — commands the black wall
  const refs = useRef([]);
  const spots = useMemo(() => {
    const out = [];
    const n = 3;
    for (let i = 0; i < n; i++) {
      const z = z0 + 8 + (i / (n - 1)) * (LEN - 18);
      out.push({ side: -1, z, y: H * 0.54, seed: rand(i + 3) * 6.283 });
      out.push({ side: 1, z, y: H * 0.54, seed: rand(i + 9) * 6.283 });
    }
    return out;
  }, [z0, LEN, H]);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    for (let i = 0; i < refs.current.length; i++) {
      const m = refs.current[i]; if (!m) continue;
      m.material.opacity = 0.22 + (Math.sin(t * 0.5 + spots[i].seed) * 0.5 + 0.5) * 0.5;   // breathe 0.22→0.72
    }
  });
  return spots.map((sp, i) => (
    <mesh
      key={i}
      ref={el => { if (el) refs.current[i] = el; }}
      position={[sp.side * (W / 2 - 0.06), sp.y, sp.z]}
      rotation={[0, sp.side < 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
    >
      <planeGeometry args={[lw, lh]} />
      <meshBasicMaterial map={logo} transparent opacity={0.4} color="#cfe0ff" toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  ));
}

// The COLLAGE WALLS — her own collage artworks tiled into a dense mosaic across
// both side walls, so the room itself is literally built from her collage
// practice (like the Ink Gallery's textured walls, but made of her art). Muted
// so the frameless works flying through the volume still read as the foreground.
// One muted collage tile in the wall mosaic — loads resiliently (a broken image
// just stays blank instead of crashing the scene) and only paints once ready.
function CollageTile({ url, position, rotation, size }) {
  const tex = useSafeTexture(url);
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={tex || null} color={tex ? '#8f8f97' : '#0a0a0d'} toneMapped={false} />
    </mesh>
  );
}

function CollageWall({ works }) {
  const { W, H, LEN } = WORKS;
  const z0 = WORKS_Z0;
  const urls = useMemo(() => works.slice(0, 30).map(w => thumb(w.thumbnail || w.image, 260)).filter(Boolean), [works]);
  const tile = 2.3;
  const cols = Math.max(1, Math.round(LEN / tile));
  const rows = Math.max(1, Math.round(H / tile));
  const cells = useMemo(() => {
    const out = [];
    const n = Math.max(1, urls.length);
    for (const side of [-1, 1]) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const z = z0 + (c + 0.5) / cols * LEN;
          const y = (r + 0.5) / rows * H;
          const ti = (r * cols + c + (side < 0 ? 0 : 5)) % n;
          out.push({ side, z, y, ti });
        }
      }
    }
    return out;
  }, [cols, rows, z0, LEN, H, urls.length]);
  if (!urls.length) return null;
  return cells.map((cell, i) => (
    <CollageTile
      key={i}
      url={urls[cell.ti]}
      position={[cell.side * (W / 2 - 0.05), cell.y, cell.z]}
      rotation={[0, cell.side < 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
      size={tile - 0.06}
    />
  ));
}

// A graffiti-collage FLOOR laid over the marble through the collage rooms.
// AL drops up to six floor artworks at /portfolio/collage/floor-1.jpg … floor-6.png;
// whichever exist are cycled as tiles running the length of the room. If NONE
// exist the safe loader returns null for all and this renders nothing (marble
// shows through), so a missing file never crashes or darkens the room.
function CollageFloor() {
  const { W, LEN } = WORKS;
  const z0 = WORKS_Z0;
  const f1 = useSafeTexture('/portfolio/collage/floor-1.jpg');
  const f2 = useSafeTexture('/portfolio/collage/floor-2.jpg');
  const f3 = useSafeTexture('/portfolio/collage/floor-3.jpg');
  const f4 = useSafeTexture('/portfolio/collage/floor-4.jpg');
  const f5 = useSafeTexture('/portfolio/collage/floor-5.jpg');
  const f6 = useSafeTexture('/portfolio/collage/floor-6.jpg');
  const maps = [f1, f2, f3, f4, f5, f6].filter(Boolean);
  if (!maps.length) return null;
  const rows = Math.max(1, Math.round(LEN / 5));   // ~5-unit tiles down the corridor
  const d = LEN / rows;
  const panels = [];
  for (let r = 0; r < rows; r++) {
    const z = z0 + (r + 0.5) / rows * LEN;
    panels.push({ z, tex: maps[r % maps.length], key: r });
  }
  return panels.map(({ z, tex, key }) => (
    // rotate the plane 180° in-plane (Z=π) so the collage reads the right way up
    // as you walk down the corridor (a flat -π/2 floor otherwise maps it inverted)
    <mesh key={key} position={[0, 0.02, z]} rotation={[-Math.PI / 2, 0, Math.PI]}>
      <planeGeometry args={[W, d]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  ));
}

// One torn scrap of her collage tumbling through the room. Drifts down + sways,
// tumbling on all axes; when it falls below the floor it wraps back to the
// ceiling at a fresh x/z so the flurry never stops. Double-sided so it reads
// paper-thin from any angle.
function CollagePaper({ url, i }) {
  const { W, H, LEN } = WORKS;
  const z0 = WORKS_Z0;
  const g = useRef();
  const tex = useSafeTexture(url);
  const st = useMemo(() => ({
    x: (rand(i * 2 + 1) - 0.5) * (W - 0.6),
    y: rand(i * 2 + 2) * H,
    z: z0 + 2 + rand(i * 2 + 3) * (LEN - 4),
    fall: 0.35 + rand(i * 2 + 5) * 0.5,
    swayA: 0.6 + rand(i * 2 + 7) * 1.2,
    swayF: 0.5 + rand(i * 2 + 9) * 0.9,
    rx: (rand(i * 2 + 11) - 0.5) * 1.4,
    ry: (rand(i * 2 + 13) - 0.5) * 1.4,
    rz: (rand(i * 2 + 15) - 0.5) * 1.4,
    phase: rand(i * 2 + 17) * Math.PI * 2,
    size: 0.24 + rand(i * 2 + 19) * 0.3,
  }), [i, W, H, LEN, z0]);
  useFrame((s, dt) => {
    if (!g.current) return;
    const t = s.clock.elapsedTime + st.phase;
    st.y -= st.fall * dt;
    if (st.y < 0.1) { st.y = H - 0.1; st.x = (rand(Math.floor(t) * 7 + i) - 0.5) * (W - 0.6); }
    g.current.position.set(st.x + Math.sin(t * st.swayF) * st.swayA, st.y, st.z + Math.cos(t * st.swayF * 0.7) * 0.6);
    g.current.rotation.set(st.rx + t * 0.5, st.ry + t * 0.7, st.rz + t * 0.4);
  });
  if (!tex) return null;
  return (
    <group ref={g}>
      <mesh><planeGeometry args={[st.size, st.size * 0.72]} /><meshBasicMaterial map={tex} toneMapped={false} side={THREE.DoubleSide} transparent opacity={0.92} /></mesh>
    </group>
  );
}

function CollagePapers({ works }) {
  const urls = useMemo(
    () => works.slice(0, 26).map(w => thumb(w.thumbnail || w.image, 140)).filter(Boolean),
    [works],
  );
  if (!urls.length) return null;
  return urls.map((u, i) => <CollagePaper key={i} url={u} i={i} />);
}

// The graffiti-collage WALLS of the collage rooms. AL drops up to eight wall
// artworks at /portfolio/collage/wall-1.jpg … wall-8.png; whichever exist are
// tiled as full-height panels down BOTH side walls. If NONE are present the
// safe loader returns null for all and we fall back to the artwork mosaic
// (CollageWall), so a missing file never crashes or leaves a bare room.
function CollageRoomWalls({ works }) {
  const { W, H, LEN } = WORKS;
  const z0 = WORKS_Z0;
  // fixed number of hook calls (rules of hooks) — unused slots just resolve null
  const t1 = useSafeTexture('/portfolio/collage/wall-1.jpg');
  const t2 = useSafeTexture('/portfolio/collage/wall-2.jpg');
  const t3 = useSafeTexture('/portfolio/collage/wall-3.jpg');
  const t4 = useSafeTexture('/portfolio/collage/wall-4.jpg');
  const t5 = useSafeTexture('/portfolio/collage/wall-5.jpg');
  const t6 = useSafeTexture('/portfolio/collage/wall-6.jpg');
  const t7 = useSafeTexture('/portfolio/collage/wall-7.jpg');
  const t8 = useSafeTexture('/portfolio/collage/wall-8.jpg');
  const maps = [t1, t2, t3, t4, t5, t6, t7, t8].filter(Boolean);
  if (!maps.length) return <Suspense fallback={null}><CollageWall works={works} /></Suspense>;
  const panelW = 4;
  const cols = Math.max(1, Math.round(LEN / panelW));
  const panels = [];
  for (const side of [-1, 1]) {
    for (let c = 0; c < cols; c++) {
      const z = z0 + (c + 0.5) / cols * LEN;
      const tex = maps[(c + (side < 0 ? 0 : 3)) % maps.length];
      panels.push({ side, z, tex, key: `${side}-${c}` });
    }
  }
  return panels.map(({ side, z, tex, key }) => (
    <mesh key={key} position={[side * (W / 2 - 0.04), H / 2, z]} rotation={[0, side < 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
      <planeGeometry args={[LEN / cols, H]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  ));
}

// ── Oversized graffiti spray cans flanking the collage-room entrance. The can
//    BODY is an open cylinder with AL's collage wall wrapped around it as the
//    label (the texture UV-wraps the cylinder side automatically), topped with a
//    metallic shoulder, a glossy cap and a nozzle. Each can turns slowly so the
//    wrapped collage reads all the way round. Purely procedural — no 3D asset. ──
function OneCan({ x, z, tex, capColor, spin, part, scale = 1 }) {
  const g = useRef();
  const R = 0.92, bodyH = 4.6;
  useFrame((s, d) => {
    const g0 = g.current; if (!g0) return;
    g0.rotation.y += d * spin;
    if (part) {
      const pr = smooth(s.camera.position.z, part.z0 - 9, part.z0 + 1);
      g0.position.x = x + (part.wallX - x) * pr;   // slide aside to the wall
      g0.position.z = z + pr * 1.6;                // and drift back as you pass
    }
  });
  return (
    <group ref={g} position={[x, 0, z]} scale={scale}>
      {/* base rim */}
      <mesh position={[0, 0.06, 0]}><cylinderGeometry args={[R * 1.02, R * 1.02, 0.12, 48]} /><meshStandardMaterial color="#c9ccd4" metalness={0.9} roughness={0.35} /></mesh>
      {/* wrapped collage label (self-lit so the artwork reads bright) */}
      <mesh position={[0, bodyH / 2 + 0.1, 0]}><cylinderGeometry args={[R, R, bodyH, 64, 1, true]} /><meshBasicMaterial map={tex} toneMapped={false} side={THREE.DoubleSide} /></mesh>
      {/* metallic shoulder tapering to the cap */}
      <mesh position={[0, bodyH + 0.1 + 0.42, 0]}><cylinderGeometry args={[R * 0.6, R, 0.84, 48]} /><meshStandardMaterial color="#d5d8df" metalness={0.92} roughness={0.28} /></mesh>
      {/* glossy plastic cap */}
      <mesh position={[0, bodyH + 0.1 + 0.84 + 0.62, 0]}><cylinderGeometry args={[R * 0.62, R * 0.62, 1.24, 48]} /><meshStandardMaterial color={capColor} metalness={0.1} roughness={0.35} /></mesh>
      {/* nozzle button */}
      <mesh position={[0, bodyH + 0.1 + 0.84 + 1.24 + 0.16, 0]}><cylinderGeometry args={[R * 0.22, R * 0.26, 0.32, 24]} /><meshStandardMaterial color="#26272b" metalness={0.3} roughness={0.6} /></mesh>
    </group>
  );
}
// ── A shower of pale-pink spray paint that rains on the viewer at the collage
//    room entrance. A THREE.Points field: fine mist particles fall + drift toward
//    the viewer, densest right at the doorway, recycling to the ceiling as they
//    hit the floor. Additive pink so it glows softly against the dark room. ──
function SprayMist() {
  const { W, H } = WORKS;
  const N = 700;
  const zC = WORKS_Z0 + 9;
  const ref = useRef();
  const { pos, vel } = useMemo(() => {
    const pos = new Float32Array(N * 3);
    const vel = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * W;
      pos[i * 3 + 1] = Math.random() * (H + 1.5);
      pos[i * 3 + 2] = zC + Math.random() * 10;
      vel[i * 3] = (Math.random() - 0.5) * 0.4;
      vel[i * 3 + 1] = -(0.8 + Math.random() * 1.6);
      vel[i * 3 + 2] = -(0.3 + Math.random() * 0.9); // drift toward the viewer
    }
    return { pos, vel };
  }, []);
  useFrame((s, d) => {
    const g = ref.current; if (!g) return;
    const a = g.geometry.attributes.position.array;
    for (let i = 0; i < N; i++) {
      a[i * 3] += vel[i * 3] * d;
      a[i * 3 + 1] += vel[i * 3 + 1] * d;
      a[i * 3 + 2] += vel[i * 3 + 2] * d;
      if (a[i * 3 + 1] < 0) {
        a[i * 3] = (Math.random() - 0.5) * W;
        a[i * 3 + 1] = H + 1 + Math.random();
        a[i * 3 + 2] = zC + Math.random() * 10;
      }
    }
    g.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={N} array={pos} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.09} color="#f9c9dc" transparent opacity={0.85} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function SprayCans() {
  const { W } = WORKS;
  const t1 = useSafeTexture('/portfolio/collage/wall-1.jpg');
  const t2 = useSafeTexture('/portfolio/collage/wall-3.jpg');
  const t3 = useSafeTexture('/portfolio/collage/wall-5.jpg');
  const t4 = useSafeTexture('/portfolio/collage/wall-7.jpg');
  if (!t1 && !t2 && !t3 && !t4) return null;
  const zEntry = WORKS_Z0 + 3.2;
  const zEntry2 = WORKS_Z0 + 11;
  const zExit = WORKS_Z1 - 3.2;
  const xOff = W / 2 - 1.15;
  return (
    <group>
      {/* first gate — a line of cans across the entrance that sweep aside as you approach */}
      {[[-2.6, t1, '#e64b3c', 0.18], [-0.95, t2, '#2f6df0', -0.15], [0.95, t3 || t1, '#f5b301', 0.16], [2.6, t4 || t2, '#2ec77a', -0.14]].map(([cx, ct, cc, sp], i) => (
        ct ? <OneCan key={'a' + i} x={cx} z={zEntry} tex={ct} capColor={cc} spin={sp} part={{ z0: zEntry, wallX: Math.sign(cx) * (W / 2 - 0.6) }} /> : null
      ))}
      {/* second gate a few steps deeper — parts a beat later, drawing out the reveal */}
      {[[-3.0, t4 || t1, '#f5b301', -0.15], [-1.3, t3 || t2, '#2ec77a', 0.17], [1.3, t2 || t1, '#e64b3c', -0.16], [3.0, t1, '#2f6df0', 0.14]].map(([cx, ct, cc, sp], i) => (
        ct ? <OneCan key={'b' + i} x={cx} z={zEntry2} tex={ct} capColor={cc} spin={sp} part={{ z0: zEntry2, wallX: Math.sign(cx) * (W / 2 - 0.6) }} /> : null
      ))}
      {/* exit pair */}
      {(t3 || t1) && <OneCan x={-xOff} z={zExit} tex={t3 || t1} capColor="#f5b301" spin={-0.16} />}
      {(t4 || t2) && <OneCan x={xOff} z={zExit} tex={t4 || t2} capColor="#2ec77a" spin={0.14} />}
      {/* warm key lights so the metal + caps catch a highlight at each threshold */}
      <pointLight position={[0, 3.4, WORKS_Z0 + 2]} intensity={16} distance={16} decay={1.8} color="#fff3e0" />
      <pointLight position={[0, 3.4, WORKS_Z0 + 10]} intensity={14} distance={16} decay={1.8} color="#fff3e0" />
      <pointLight position={[0, 3.4, WORKS_Z1 - 2]} intensity={16} distance={16} decay={1.8} color="#fff3e0" />
    </group>
  );
}

// ── London street threshold — set dressing just BEFORE the digital collage
//    rooms, marking the work's London exhibition (Bonhams × SuperRare, CryptOGs).
//    Dark Georgian terrace silhouettes flank the corridor; a red phone box and a
//    Victorian lamppost light the pavement; and CYBAROQUE BORGHESE plays in a lit
//    Bonhams shop window as you pass. Fully procedural — no 3D asset needed. ──
// ── Hero pedestal at the FAR END of the digital collage room: AL's highest sale
//    to date, "Victoria and the Doge Army" (20 ETH), as a moving masterpiece on a
//    spotlit marble plinth. The frame is turned to face the approaching viewer. ──
function HeroPedestal({ tex, aspect = 1 }) {
  const zc = WORKS_Z1 - 6;
  const g = useRef();
  const plinthH = 1.5;
  const panelH = 2.4;
  const panelW = Math.min(panelH * (aspect || 1), 5);
  const cy = plinthH + 0.2 + panelH / 2;
  useFrame((st) => { if (g.current) g.current.position.y = cy + 0.03 * Math.sin(st.clock.elapsedTime * 0.7); });
  return (
    <group position={[-(WORKS.W / 2 - 1.9), 0, zc]} rotation={[0, -0.6, 0]}>
      {/* marble plinth */}
      <mesh position={[0, plinthH / 2, 0]}><boxGeometry args={[1.4, plinthH, 1.4]} /><meshStandardMaterial color="#f2efe8" metalness={0.1} roughness={0.5} /></mesh>
      <mesh position={[0, plinthH + 0.06, 0]}><boxGeometry args={[1.7, 0.12, 1.7]} /><meshStandardMaterial color="#e7e2d6" metalness={0.2} roughness={0.5} /></mesh>
      {/* the framed moving masterpiece, rotated to face the viewer approaching from -z */}
      <group ref={g} position={[0, cy, 0]} rotation={[0, Math.PI, 0]}>
        <mesh><planeGeometry args={[panelW + 0.34, panelH + 0.34]} /><meshStandardMaterial color="#0e0e11" metalness={0.4} roughness={0.5} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, 0, 0.02]}><planeGeometry args={[panelW + 0.16, panelH + 0.16]} /><meshBasicMaterial color="#f6f4ee" toneMapped={false} /></mesh>
        <mesh position={[0, 0, 0.04]}><planeGeometry args={[panelW, panelH]} /><meshBasicMaterial map={tex || null} color={tex ? '#ffffff' : '#0a0a0d'} toneMapped={false} /></mesh>
      </group>
      {/* warm hero lights on the viewer side */}
      <pointLight position={[0, cy + 0.3, -2.0]} intensity={26} distance={9} decay={1.7} color="#fff1d6" />
      <pointLight position={[0, cy + 2.6, -0.8]} intensity={20} distance={9} decay={1.8} color="#ffe6bf" />
    </group>
  );
}

// CYBAROQUE BORGHESE, the Bonhams lot, staged as a cinematic auction reveal: as the
// viewer walks into the London zone it swings off the wall to FACE them and magnifies
// to huge proportions for viewing, then peels back to the right wall as they pass.
function CybaroqueLot({ tex }) {
  const W = CINEMA.W;
  const zEnd = CINEMA_Z1;
  const zBase = zEnd - 6;              // its resting spot on the right wall
  const wallX = W / 2 - 0.06;
  const g = useRef();
  const V = (a, b, t) => a + (b - a) * t;
  useFrame(({ camera }) => {
    if (!g.current) return;
    const cz = camera.position.z;
    const rise = smooth(cz, zBase - 12, zBase - 6);   // approaching -> comes off the wall
    const fall = smooth(cz, zBase - 1, zBase + 4);    // walking through -> returns to the wall
    const hero = rise * (1 - fall);                    // bell: 1 while you view it
    const t = g.current;
    t.position.x = V(wallX, wallX - 0.32, hero);       // barely leaves the wall — stays hung on the right
    t.position.y = V(2.7, 2.8, hero);
    t.position.z = V(zBase, zBase - 1.4, hero);        // eases a touch toward you, but keeps the corridor clear
    t.rotation.y = V(-Math.PI / 2, -Math.PI / 2 - 0.32, hero);  // just a slight turn to face the viewer
    const sc = V(1, 1.06, hero);                       // a whisper larger — the spray cans stay in full view
    t.scale.set(sc, sc, sc);
  });
  return (
    <group>
      {/* dark gallery backing stays on the right wall so the spot never looks empty */}
      <mesh position={[wallX + 0.02, 2.9, zBase]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[5.2, 5.6]} /><meshStandardMaterial color="#0b0b0f" roughness={1} />
      </mesh>
      {/* the moving lot: frame + mat + film + its own travelling spotlight */}
      <group ref={g} position={[wallX, 2.7, zBase]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh><planeGeometry args={[4.3, 4.3]} /><meshStandardMaterial color="#141416" metalness={0.5} roughness={0.4} /></mesh>
        <mesh position={[0, 0, 0.02]}><planeGeometry args={[4.05, 4.05]} /><meshBasicMaterial color="#f6f4ee" toneMapped={false} /></mesh>
        <mesh position={[0, 0, 0.04]}><planeGeometry args={[3.8, 3.8]} /><meshBasicMaterial map={tex || null} color={tex ? '#ffffff' : '#0a0a0d'} toneMapped={false} /></mesh>
        <pointLight position={[0, 1.8, 2.2]} intensity={22} distance={10} decay={1.7} color="#eef1f6" />
        <pointLight position={[0, 0, 1.4]} intensity={8} distance={7} decay={1.9} color="#e7ebf2" />
      </group>
    </group>
  );
}

function LondonStreet({ tex }) {
  const W = CINEMA.W;
  const zEnd = CINEMA_Z1;        // the collage-room doorway
  const z0 = zEnd - 16;          // where the street begins
  const buildings = [];
  const nBuild = 5;
  for (const side of [-1, 1]) {
    for (let b = 0; b < nBuild; b++) {
      const bz = z0 + (b + 0.5) / nBuild * 16;
      const bh = 5.4 + ((b * 37) % 5) * 0.4;
      buildings.push({ side, bz, bh, key: side + '-' + b });
    }
  }
  const faceY = side => side < 0 ? Math.PI / 2 : -Math.PI / 2;
  return (
    <group>
      {/* terrace facades with a few warm lit windows */}
      {buildings.map(({ side, bz, bh, key }) => (
        <group key={key}>
          <mesh position={[side * (W / 2 + 0.9), bh / 2, bz]}>
            <boxGeometry args={[1.8, bh, 3.0]} />
            <meshStandardMaterial color="#0d0e12" roughness={1} metalness={0} />
          </mesh>
          <mesh position={[side * (W / 2 - 0.001), 2.0, bz]} rotation={[0, faceY(side), 0]}>
            <planeGeometry args={[0.5, 0.7]} /><meshBasicMaterial color="#d6dbe4" toneMapped={false} />
          </mesh>
          <mesh position={[side * (W / 2 - 0.001), 3.4, bz - 0.9]} rotation={[0, faceY(side), 0]}>
            <planeGeometry args={[0.5, 0.7]} /><meshBasicMaterial color="#c3c9d3" toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* red K2 phone box on the left pavement */}
      <group position={[-W / 2 + 0.9, 0, zEnd - 6]}>
        <mesh position={[0, 1.25, 0]}><boxGeometry args={[0.95, 2.5, 0.95]} /><meshStandardMaterial color="#17181d" roughness={0.5} metalness={0.1} /></mesh>
        <mesh position={[0, 2.62, 0]}><boxGeometry args={[1.04, 0.28, 1.04]} /><meshStandardMaterial color="#101116" roughness={0.5} /></mesh>
        <mesh position={[0, 1.5, 0.42]}><planeGeometry args={[0.62, 1.5]} /><meshBasicMaterial color="#dbe0e8" toneMapped={false} /></mesh>
        <pointLight position={[0, 1.6, 0.5]} intensity={5} distance={5} decay={2} color="#d2d8e2" />
      </group>
      {/* Victorian lamppost on the right pavement */}
      <group position={[W / 2 - 0.9, 0, zEnd - 10]}>
        <mesh position={[0, 2.1, 0]}><cylinderGeometry args={[0.07, 0.1, 4.2, 12]} /><meshStandardMaterial color="#14161b" metalness={0.6} roughness={0.5} /></mesh>
        <mesh position={[0, 4.35, 0]}><boxGeometry args={[0.42, 0.5, 0.42]} /><meshStandardMaterial color="#1a1d24" metalness={0.5} roughness={0.5} /></mesh>
        <mesh position={[0, 4.35, 0]}><boxGeometry args={[0.3, 0.36, 0.3]} /><meshBasicMaterial color="#dde2ea" toneMapped={false} /></mesh>
        <pointLight position={[0, 4.3, 0]} intensity={18} distance={12} decay={1.8} color="#cfd6e2" />
      </group>
      {/* CYBAROQUE BORGHESE — turns to face you, magnifies for viewing, then peels to the side as you walk through */}
      <CybaroqueLot tex={tex} />
    </group>
  );
}

function WorksHall({ works, onOpen, victoriaTex, victoriaAspect }) {
  const { W, H, LEN } = WORKS;
  const z0 = WORKS_Z0, midZ = (z0 + WORKS_Z1) / 2;
  const cloud = useMemo(() => works.map((w, i) => {
    const angle = rand(i + 3) * Math.PI * 2;
    const radius = 1.0 + rand(i + 13) * 3.4;               // 1.0–4.4: some skim right past you
    const x = Math.cos(angle) * radius;
    const y = 0.5 + rand(i + 23) * 5.0;                    // floor to ceiling
    const z = z0 + 3 + ((i + 0.5) / Math.max(1, works.length)) * (LEN - 6) + (rand(i + 33) - 0.5) * 5.5;
    const size = 1.0 + rand(i + 43) * 2.6;                 // 1.0–3.6, some huge
    const seed = rand(i + 53) * Math.PI * 2;
    const tilt = (rand(i + 63) - 0.5) * 0.6;
    return { w, x, y, z, size, seed, tilt };
  }), [works, z0, LEN]);
  // EVERY animated work now plays — each HungVideo proximity-gates its own decode
  // (only videos within ~11 units of the camera run), so we stay under the
  // browser's ~8 simultaneous-video cap without capping the total count.
  const animIds = useMemo(() => {
    const ids = new Set();
    for (const c of cloud) { if (c.w.animation) ids.add(c.w.id); }
    return ids;
  }, [cloud]);
  return (
    <group>
      {/* dark surfaces — the works themselves are the room */}
      <mesh position={[-W / 2, H / 2, midZ]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[LEN, H]} /><meshStandardMaterial color="#08080c" roughness={1} side={THREE.DoubleSide} /></mesh>
      <mesh position={[W / 2, H / 2, midZ]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[LEN, H]} /><meshStandardMaterial color="#08080c" roughness={1} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, H, midZ]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[W, LEN]} /><meshStandardMaterial color="#050507" roughness={1} side={THREE.DoubleSide} /></mesh>
      {/* soft washes so the depth reads (the works are self-lit meshBasic) */}
      <pointLight position={[0, H - 0.6, z0 + LEN * 0.25]} intensity={14} distance={26} decay={1.7} color="#cfe0ff" />
      <pointLight position={[0, 1.2, z0 + LEN * 0.55]} intensity={12} distance={24} decay={1.7} color="#8aa0ff" />
      <pointLight position={[0, H - 0.6, z0 + LEN * 0.82]} intensity={14} distance={26} decay={1.7} color="#cfe0ff" />
      {/* oversized collage-wrapped spray cans flanking the room entrance */}
      <SprayCans />
      {/* pale-pink spray shower raining on the viewer at the entrance */}
      <SprayMist />
      {/* graffiti-collage walls (AL's artwork), falling back to the artwork mosaic */}
      <CollageRoomWalls works={works} />
      {/* graffiti-collage floor laid over the marble (AL's artwork) */}
      <CollageFloor />
      {/* scraps of her collage tumbling through the air */}
      <CollagePapers works={works} />
      {/* her brand glowing big on the collage walls to either side */}
      <WallWordmark zone={WORKS} z0={WORKS_Z0} />
      {/* hero pedestal at the room\u2019s end: Victoria and the Doge Army (20 ETH) */}
      <HeroPedestal tex={victoriaTex} aspect={victoriaAspect} />
      {/* the immersive field of frameless works you fly through */}
      {cloud.map(({ w, x, y, z, size, seed, tilt }) => (
        <FloatOne key={w.id} w={w} x={x} y={y} z={z} seed={seed} tilt={tilt} max={size} bare part animate={animIds.has(w.id)} onOpen={onOpen} />
      ))}
    </group>
  );
}

// ── Zone 4: WORLDS — her built universes as huge glowing SPHERES (planets) you
//    pass between — each globe wraps its world's film (so 16:9 or vertical, it
//    reads right on the sphere), spins slowly, and carries a big bold name below.
//    Click a world to enter it. ──
function WorldGlobe({ world, tex, onEnter, showLabel }) {
  const R = 1.9;
  const ref = useRef();
  useFrame((s) => { if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.12; });
  return (
    <group userData={{ open: () => onEnter(world), title: world ? world.name : 'World', collection: world ? `${world.tagline || ''} — enter` : 'enter' }}>
      {/* generous invisible hit sphere so the crosshair catches the globe */}
      <mesh><sphereGeometry args={[R + 0.9, 16, 12]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
      {/* soft glow halo behind the planet */}
      <mesh><sphereGeometry args={[R + 0.5, 32, 24]} /><meshBasicMaterial color="#9fb4e6" toneMapped={false} fog={false} transparent opacity={0.14} side={THREE.BackSide} depthWrite={false} /></mesh>
      {/* the planet — the world's film wrapped around it */}
      <mesh ref={ref}><sphereGeometry args={[R, 48, 32]} /><meshBasicMaterial map={tex || null} color={tex ? '#ffffff' : '#0a0a0d'} toneMapped={false} fog={false} /></mesh>
      <pointLight position={[0, 0, R + 1.4]} intensity={7} distance={9} decay={1.6} color="#bcd0ff" />
      {/* big bold name below the globe — only mounted once you reach the WORLDS
          zone (drei Html projects DOM at any distance, so it must be gated) */}
      {showLabel && (
        <Html position={[0, -R - 0.7, 0]} center distanceFactor={11} pointerEvents="none" style={{ pointerEvents: 'none' }}>
          <div style={{ textAlign: 'center', whiteSpace: 'nowrap', userSelect: 'none' }}>
            <div style={{ fontFamily: serif, color: '#fff', fontWeight: 800, letterSpacing: -1, textTransform: 'uppercase', fontSize: 46, lineHeight: 0.95, textShadow: '0 2px 30px rgba(159,180,230,0.7)' }}>{world ? world.name : ''}</div>
            <div style={{ fontFamily: mono, color: 'rgba(255,255,255,0.72)', fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', marginTop: 8 }}>{world ? `${world.tagline || ''} · Enter →` : ''}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

// A world globe that DRIFTS — orbits slowly on its own elliptical path + bobs,
// and PARTS to the side (depth parallax) as the camera glides up to and past it,
// so the planets read as living bodies in space you move between.
function OrbitingWorld({ home, orbit, world, tex, onEnter, showLabel }) {
  const g = useRef();
  useFrame((s) => {
    if (!g.current) return;
    const t = s.clock.elapsedTime + orbit.phase;
    const ox = Math.cos(t * orbit.speed) * orbit.radius;
    const oy = Math.sin(t * orbit.speed * 1.3) * orbit.bob;
    const oz = Math.sin(t * orbit.speed * 0.7) * orbit.zr;
    // depth parallax: swing aside + lift as the camera passes through
    const dz = home.z - s.camera.position.z;
    const prox = Math.max(0, 1 - Math.abs(dz) / 10);
    const ease = prox * prox * (3 - 2 * prox);
    const dir = home.x >= 0 ? 1 : -1;
    g.current.position.set(
      home.x + ox + ease * 2.2 * dir,
      home.y + oy + ease * 0.55,
      home.z + oz
    );
  });
  return (
    <group ref={g} position={[home.x, home.y, home.z]}>
      <WorldGlobe world={world} tex={tex} onEnter={onEnter} showLabel={showLabel} />
    </group>
  );
}

// Fills the Worlds void so it reads as deep space rather than empty black: a
// drifting starfield + soft additive NEBULA clouds (blue / violet / rose) that
// breathe and slowly turn, plus faint dust. Cheap (points + a few planes).
function WorldsAmbience() {
  const { W, H, LEN } = WORLDS;
  const z0 = WORLDS_Z0, midZ = (z0 + WORLDS_Z1) / 2;
  const clouds = useMemo(() => {
    const cols = ['#3550a0', '#6a3fb0', '#a0416f', '#2f6fb0'];
    return Array.from({ length: 9 }, (_, i) => ({
      x: (rand(i + 2) - 0.5) * (W + 3),
      y: 0.6 + rand(i + 8) * (H - 0.4),
      z: z0 + rand(i + 14) * LEN,
      r: 2.4 + rand(i + 22) * 3.6,
      col: cols[i % cols.length],
      seed: rand(i + 30) * Math.PI * 2,
      op: 0.05 + rand(i + 36) * 0.07,
    }));
  }, [W, H, LEN, z0]);
  const refs = useRef([]);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    for (let i = 0; i < refs.current.length; i++) {
      const m = refs.current[i]; if (!m) continue;
      m.material.opacity = clouds[i].op * (0.6 + 0.4 * Math.sin(t * 0.25 + clouds[i].seed));
      m.rotation.z = t * 0.02 + clouds[i].seed;
    }
  });
  return (
    <group>
      <group position={[0, H / 2, midZ]}>
        <Stars radius={38} depth={40} count={1400} factor={2.2} saturation={0} fade speed={0.5} />
      </group>
      {clouds.map((c, i) => (
        <mesh key={i} ref={el => { if (el) refs.current[i] = el; }} position={[c.x, c.y, c.z]}>
          <circleGeometry args={[c.r, 40]} />
          <meshBasicMaterial color={c.col} transparent opacity={c.op} toneMapped={false} fog={false} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

function WorldsHall({ worldTexs, worldList = [], onEnter }) {
  const { W, H, LEN } = WORLDS;
  const z0 = WORLDS_Z0, midZ = (z0 + WORLDS_Z1) / 2;
  const N = worldList.length || 3;
  // Only reveal the world NAME labels once the camera actually reaches this zone
  // (they're projected DOM that would otherwise show from far down the corridor).
  const [showLabels, setShowLabels] = useState(false);
  const shownRef = useRef(false);
  useFrame(({ camera }) => {
    const inZone = camera.position.z > WORLDS_Z0 - 6 && camera.position.z < WORLDS_Z1 + 6;
    if (inZone !== shownRef.current) { shownRef.current = inZone; setShowLabels(inZone); }
  });
  const globes = useMemo(() => Array.from({ length: N }, (_, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const t = (i + 0.5) / N;
    // vary depth/height per world so they sit at different distances → parallax
    const home = { x: side * (W / 2 - 1.6), y: 2.5 + rand(i + 7) * 1.1, z: z0 + 4 + t * (LEN - 8) };
    const orbit = {
      radius: 0.5 + rand(i + 17) * 0.5,      // ellipse size of the slow drift
      bob: 0.35 + rand(i + 27) * 0.3,         // vertical bob
      zr: 0.4 + rand(i + 37) * 0.4,           // depth wobble
      speed: 0.18 + rand(i + 47) * 0.12,      // slow
      phase: rand(i + 57) * Math.PI * 2,
    };
    return { home, orbit, i };
  }), [z0, LEN, N]);
  return (
    <group>
      {/* dark surfaces, deep space */}
      <mesh position={[-W / 2, H / 2, midZ]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[LEN, H]} /><meshStandardMaterial color="#06070c" roughness={1} side={THREE.DoubleSide} /></mesh>
      <mesh position={[W / 2, H / 2, midZ]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[LEN, H]} /><meshStandardMaterial color="#06070c" roughness={1} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, H, midZ]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[W, LEN]} /><meshStandardMaterial color="#040409" roughness={1} side={THREE.DoubleSide} /></mesh>
      <pointLight position={[0, H - 0.6, z0 + LEN * 0.3]} intensity={12} distance={24} decay={1.7} color="#8aa0ff" />
      <pointLight position={[0, H - 0.6, z0 + LEN * 0.75]} intensity={12} distance={24} decay={1.7} color="#8aa0ff" />
      {/* starfield + nebula so the void reads as deep space, not empty black */}
      <WorldsAmbience />
      {/* her brand glowing on the deep-space side walls */}
      <WallWordmark zone={WORLDS} z0={WORLDS_Z0} />
      {globes.map(({ home, orbit, i }) => (
        <OrbitingWorld key={i} home={home} orbit={orbit}
          world={worldList[i % Math.max(1, worldList.length)]}
          tex={worldTexs.length ? worldTexs[i % worldTexs.length] : null}
          onEnter={onEnter} showLabel={showLabels} />
      ))}
    </group>
  );
}

// One work-plane spiralling in the finale galaxy — bare image, faces the viewer,
// carried by the parent group's rotation; clickable into the lightbox.
function GalaxyWork({ w, radius, ang, y, size, seed, onOpen }) {
  const ref = useRef();
  useFrame((s) => {
    const el = ref.current; if (!el) return;
    const t = s.clock.elapsedTime + seed;
    el.position.y = y + Math.sin(t * 0.5) * 0.18;
  });
  const x = Math.cos(ang) * radius;
  const z = Math.sin(ang) * radius;
  return (
    <group ref={ref} position={[x, y, z]} userData={{ open: () => onOpen(w), title: w.title || w.name || '', collection: w.collection || '' }}>
      {/* face inward-ish toward the axis so the spiral reads as a disc */}
      <group rotation={[0, -ang + Math.PI / 2, 0]}>
        <Hung url={w.thumbnail || w.image} max={size} bare />
      </group>
    </group>
  );
}

// ── The FINALE — a WOW: the corridor opens into a cathedral of light where ALL
//    her ink resolves into a slowly turning GALAXY. Two spiral arms of her works
//    orbit a blazing white core; radiant light shafts fan out; the whole disc
//    rotates as you arrive and dive into the core (→ the full catalogue). It is
//    the "the ink becomes every work she's made" payoff. ──
function InkDive({ works = [], onOpen = () => {} }) {
  const z0 = INK_Z0, len = INK.LEN;
  const cx = 0, cy = 3, cz = z0 + len - 1.5;         // galaxy centre / core, deep at the end
  // Two logarithmic spiral arms of her works around the core.
  const arms = useMemo(() => {
    const src = works.slice(0, 28);
    return src.map((w, i) => {
      const arm = i % 2;                                // 0 / 1 → two arms, offset by π
      const k = Math.floor(i / 2);
      const ang = arm * Math.PI + k * 0.62;             // wind around
      const radius = 1.7 + k * 0.42 + rand(i + 5) * 0.3;
      const y = cy + (rand(i + 30) - 0.5) * 2.6;
      const size = 0.9 + rand(i + 60) * 1.0;
      return { w, ang, radius, y, size, seed: rand(i + 90) * 6.283 };
    });
  }, [works, cy]);
  // radiant light shafts fanning from the core
  const shafts = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    ang: (i / 14) * Math.PI * 2, len: 5 + rand(i + 2) * 3, w: 0.3 + rand(i + 40) * 0.5, seed: rand(i + 7) * 6.283,
  })), []);
  const disc = useRef();
  const shaftG = useRef();
  const core = useRef();
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (disc.current) disc.current.rotation.z = t * 0.06;       // whole galaxy turns
    if (shaftG.current) shaftG.current.rotation.z = -t * 0.03;
    if (core.current) { const b = 1 + Math.sin(t * 1.4) * 0.08; core.current.scale.set(b, b, b); }
  });
  return (
    <group>
      {/* the cathedral — a tall dark glossy dome/well seen from inside */}
      <mesh position={[0, cy, z0 + len / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[9.5, 9.5, len, 48, 1, true]} />
        <meshStandardMaterial color="#04040a" roughness={0.3} metalness={0.5} side={THREE.BackSide} />
      </mesh>

      {/* ── the blazing core at the far end ── */}
      <group position={[cx, cy, cz]}>
        {/* soft outer bloom */}
        <mesh><sphereGeometry args={[2.6, 24, 18]} /><meshBasicMaterial color="#9fb4e6" toneMapped={false} fog={false} transparent opacity={0.16} side={THREE.BackSide} depthWrite={false} /></mesh>
        <mesh><sphereGeometry args={[1.55, 24, 18]} /><meshBasicMaterial color="#cfe0ff" toneMapped={false} fog={false} transparent opacity={0.4} depthWrite={false} /></mesh>
        {/* the incandescent centre — dive INTO this */}
        <mesh ref={core}><sphereGeometry args={[0.85, 32, 24]} /><meshBasicMaterial color="#ffffff" toneMapped={false} fog={false} /></mesh>
        <pointLight intensity={60} distance={26} decay={1.35} color="#dfeaff" />
      </group>

      {/* radiant light shafts fanning out from the core (additive, in the disc plane) */}
      <group ref={shaftG} position={[cx, cy, cz]}>
        {shafts.map((sh, i) => (
          <mesh key={i} rotation={[0, 0, sh.ang]} position={[Math.cos(sh.ang) * (sh.len / 2 + 0.6), Math.sin(sh.ang) * (sh.len / 2 + 0.6), -0.4]}>
            <planeGeometry args={[sh.len, sh.w]} />
            <meshBasicMaterial color="#bcd0ff" toneMapped={false} fog={false} transparent opacity={0.12} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>

      {/* the two spiral arms of her works, turning around the core */}
      <group ref={disc} position={[cx, cy, cz]}>
        {arms.map((a, i) => (
          <GalaxyWork key={a.w.id || i} w={a.w} radius={a.radius} ang={a.ang} y={a.y - cy} size={a.size} seed={a.seed} onOpen={onOpen} />
        ))}
      </group>

      {/* rim glow at the mouth so the approach stays luminous */}
      <pointLight position={[0, cy, z0 + 1.2]} intensity={22} distance={18} decay={1.5} color="#3a4a72" />
    </group>
  );
}

// A slow haze of points down the hall — atmosphere / floating dust for depth.
function Haze({ count = 500 }) {
  const { W, H, LEN } = HALL;
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * (W - 0.6);
      arr[i * 3 + 1] = Math.random() * (H - 0.4) + 0.2;
      arr[i * 3 + 2] = Math.random() * LEN;
    }
    return arr;
  }, [count]);
  useFrame((s) => { if (ref.current) ref.current.rotation.z = s.clock.elapsedTime * 0.004; });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#b9c2d6" transparent opacity={0.4} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// Cursor-glide first-person control. The mouse steers look (yaw/pitch); holding
// the pointer down — or scrolling — walks you forward along the hall. Camera is
// clamped inside the shop at eye height. No keyboard. Writes glide progress
// (0→1 down the hall) into progressRef so the DOM quote layer can crossfade.
function Glide({ progressRef, zoneRef, aimRef, startZ = CAM_START, minZ = STILETTO_Z0 + 2, maxZ = CAM_END }) {
  const { camera, gl, scene } = useThree();
  const yaw = useRef(0);
  const pitch = useRef(0);
  const targetZ = useRef(startZ);
  const held = useRef(false);
  const pointer = useRef([0, 0]);
  const downAt = useRef(0);
  const downXY = useRef([0, 0]);
  const rc = useRef(new THREE.Raycaster());
  const frame = useRef(0);
  const intro = useRef(true);      // cinematic auto-glide on load until the viewer takes over
  const startT = useRef(0);

  useEffect(() => {
    camera.position.set(0, EYE, startZ);
    startT.current = performance.now();
    const el = gl.domElement;
    el.style.cursor = 'none';
    const move = e => {
      const r = el.getBoundingClientRect();
      pointer.current = [
        ((e.clientX - r.left) / r.width) * 2 - 1,
        ((e.clientY - r.top) / r.height) * 2 - 1,
      ];
    };
    const down = e => { held.current = true; intro.current = false; downAt.current = performance.now(); downXY.current = [e.clientX, e.clientY]; };
    const up = e => {
      held.current = false;
      // Moving the mouse STEERS the view, so you can't hover a work. Instead a
      // short, still tap = a CLICK on whatever work is centred in the crosshair
      // (turn to face a piece, then tap). A longer hold walks (not a click).
      const quick = performance.now() - downAt.current < 320;
      const still = Math.hypot(e.clientX - downXY.current[0], e.clientY - downXY.current[1]) < 12;
      if (quick && still) {
        rc.current.setFromCamera({ x: 0, y: 0 }, camera);
        const hits = rc.current.intersectObjects(scene.children, true);
        for (const h of hits) {
          let o = h.object;
          while (o) { if (o.userData && o.userData.open) { o.userData.open(); return; } o = o.parent; }
        }
      }
    };
    const wheel = e => { intro.current = false; targetZ.current = clamp(targetZ.current + e.deltaY * 0.02, minZ, maxZ); };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    el.addEventListener('wheel', wheel, { passive: true });
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      el.removeEventListener('wheel', wheel);
    };
  }, [camera, gl, scene, startZ, minZ, maxZ]);

  useFrame((_, dt) => {
    const step = Math.min(dt, 0.05);
    const t = performance.now() * 0.001;
    const [px, py] = pointer.current;
    // frame-rate-INDEPENDENT exponential damping (smooth at any refresh rate) — the
    // old fixed per-frame lerps stuttered and felt frozen. A whisper of idle sine
    // drift keeps the view gently alive even when you're standing still.
    const eLook = 1 - Math.exp(-6 * step);
    yaw.current += (-px * 0.55 + Math.sin(t * 0.25) * 0.02 - yaw.current) * eLook;
    pitch.current += (-py * 0.32 + Math.sin(t * 0.19) * 0.012 - pitch.current) * eLook;
    // cinematic auto-intro: HOLD at the entrance first (~3.4s) so the re-launch
    // mint sits front-and-centre before anything moves, THEN drift gently into the
    // hall. Any pointer/scroll hands control over.
    if (intro.current) {
      const el = performance.now() - startT.current;
      if (el < 3400) { /* linger at the entrance — space for the mint */ }
      else if (el < 3400 + 4200) targetZ.current = clamp(targetZ.current + 5.5 * step, minZ, maxZ);
      else intro.current = false;
    }
    // walk forward while held
    if (held.current) targetZ.current = clamp(targetZ.current + 16 * step, minZ, maxZ);
    const eMove = 1 - Math.exp(-5.5 * step);
    const eX = 1 - Math.exp(-4 * step);
    camera.position.z += (targetZ.current - camera.position.z) * eMove;
    const targetX = -px * (HALL.W / 2 - 1.2) + Math.sin(t * 0.35) * 0.22;   // steer + idle drift
    camera.position.x += (targetX - camera.position.x) * eX;
    camera.position.y = EYE + Math.sin(t * 0.55) * 0.05;                    // gentle idle bob
    const cp = Math.cos(pitch.current);
    const dir = new THREE.Vector3(Math.sin(yaw.current) * cp, Math.sin(pitch.current), Math.cos(yaw.current) * cp);
    camera.lookAt(camera.position.clone().add(dir));
    // shop-zone progress drives the entrance quotes/audio; raw depth drives the
    // cinema/works zone headings
    if (progressRef) progressRef.current = clamp((camera.position.z - 2) / (SHOP.LEN - 6), 0, 1);
    if (zoneRef) zoneRef.current = camera.position.z;
    // hover: which work sits in the crosshair (drives the title caption)
    frame.current++;
    if (aimRef && frame.current % 5 === 0) {
      rc.current.setFromCamera({ x: 0, y: 0 }, camera);
      const hits = rc.current.intersectObjects(scene.children, true);
      let found = null;
      for (const h of hits) {
        let o = h.object;
        while (o) { if (o.userData && o.userData.title !== undefined) { found = o.userData; break; } o = o.parent; }
        if (found) break;
      }
      aimRef.current = found;
    }
  });
  return null;
}

// Soft volumetric light shafts under each ceiling light (fake god-rays — open
// additive cones, no postprocessing needed).
function GodRays() {
  const { H } = HALL;
  const rays = [[0, 10, '#fff1dc'], [0, 34, '#eef2ff'], [0, 58, '#fff1dc']];
  return rays.map(([x, z, c], i) => (
    <mesh key={i} position={[x, H * 0.5, z]}>
      <coneGeometry args={[1.35, H, 28, 1, true]} />
      <meshBasicMaterial color={c} transparent opacity={0.05} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} fog={false} />
    </mesh>
  ));
}

// The MISS AL SIMPSON wordmark washing down BOTH side walls as a glowing,
// projected light — additive planes flush to each ink wall, breathing in
// brightness and drifting slightly so it reads like light thrown across the
// walls rather than a printed decal. (fog stays ON so far repeats melt away.)
function LogoWash() {
  const { W, H, LEN } = HALL;
  const logo = useTexture('/LOGO MISS.png');
  logo.colorSpace = THREE.SRGBColorSpace;
  logo.anisotropy = 16;
  const img = logo.image;
  const aspect = img && img.width && img.height ? img.width / img.height : 4.5;
  const lw = 3.6, lh = lw / aspect;               // big wordmark washed on the wall
  const refs = useRef([]);
  // spaced repeats down the hall, alternating a little in height for rhythm
  const spots = useMemo(() => {
    const out = [];
    const n = 5;
    for (let i = 0; i < n; i++) {
      const z = 9 + (i / (n - 1)) * (LEN - 20);
      const y = H * 0.52 + (i % 2 ? -0.5 : 0.5);
      out.push({ side: -1, z, y, seed: rand(i + 3) * 6.283 });
      out.push({ side: 1, z, y: y + (i % 2 ? 0.6 : -0.4), seed: rand(i + 9) * 6.283 });
    }
    return out;
  }, []);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    for (let i = 0; i < refs.current.length; i++) {
      const m = refs.current[i]; if (!m) continue;
      const seed = spots[i].seed;
      m.material.opacity = 0.16 + (Math.sin(t * 0.6 + seed) * 0.5 + 0.5) * 0.4;   // breathe 0.16→0.56
    }
  });
  return spots.map((sp, i) => (
    <mesh
      key={i}
      ref={el => { if (el) refs.current[i] = el; }}
      position={[sp.side * (W / 2 - 0.05), sp.y, sp.z]}
      rotation={[0, sp.side < 0 ? Math.PI / 2 : -Math.PI / 2, 0]}
    >
      <planeGeometry args={[lw, lh]} />
      <meshBasicMaterial map={logo} transparent opacity={0.3} color="#cfe0ff" toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  ));
}

// Two marble plinths flanking the doorway, each topped with a glowing orb and
// carrying the MISS AL SIMPSON wordmark on its front face — a gallery threshold.
function Plinths() {
  const { LEN } = HALL;
  const logo = useTexture('/LOGO MISS.png');
  logo.colorSpace = THREE.SRGBColorSpace;
  logo.anisotropy = 16;
  const img = logo.image;
  const aspect = img && img.width && img.height ? img.width / img.height : 4.5;
  const lw = 0.5, lh = lw / aspect;
  // Each plinth presents a Diamond Drone — a slowly rotating framed artwork
  // floating above a marble plinth, spotlit; crosshair-click visits the collection.
  const One = ({ x, src, seed }) => {
    const tex = useSafeTexture(src);
    const g = useRef();
    useFrame((s) => {
      if (!g.current) return;
      g.current.rotation.y += 0.004;
      g.current.position.y = 1.62 + 0.045 * Math.sin(s.clock.elapsedTime * 0.8 + seed);
    });
    const S = 0.92;
    return (
      <group position={[x, 0, LEN - 3]} userData={{ open: () => window.open('https://diamonddrones.world', '_blank', 'noopener,noreferrer'), title: 'Diamond Drones', collection: 'The flagship collection — click to visit' }}>
        <mesh position={[0, 0.55, 0]}><boxGeometry args={[0.72, 1.1, 0.72]} /><meshStandardMaterial color="#d9d5c8" roughness={0.55} metalness={0.12} /></mesh>
        <mesh position={[0, 1.12, 0]}><boxGeometry args={[0.86, 0.06, 0.86]} /><meshStandardMaterial color="#efece2" roughness={0.5} metalness={0.2} /></mesh>
        {/* MISS AL SIMPSON wordmark on the plinth face toward the viewer */}
        <mesh position={[0, 0.58, -0.362]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[lw, lh]} />
          <meshBasicMaterial map={logo} transparent toneMapped={false} depthWrite={false} />
        </mesh>
        {/* floating Diamond Drone — framed, rotating, readable from both sides */}
        <group ref={g} position={[0, 1.62, 0]}>
          <mesh><boxGeometry args={[S + 0.12, S + 0.12, 0.06]} /><meshStandardMaterial color="#131316" metalness={0.5} roughness={0.4} /></mesh>
          <mesh position={[0, 0, 0.035]}><planeGeometry args={[S + 0.04, S + 0.04]} /><meshBasicMaterial color="#f6f4ee" toneMapped={false} /></mesh>
          <mesh position={[0, 0, -0.035]}><planeGeometry args={[S + 0.04, S + 0.04]} /><meshBasicMaterial color="#f6f4ee" toneMapped={false} /></mesh>
          <mesh position={[0, 0, 0.05]}><planeGeometry args={[S, S]} /><meshBasicMaterial map={tex || null} color={tex ? '#ffffff' : '#0a0a0d'} toneMapped={false} /></mesh>
          <mesh position={[0, 0, -0.05]} rotation={[0, Math.PI, 0]}><planeGeometry args={[S, S]} /><meshBasicMaterial map={tex || null} color={tex ? '#ffffff' : '#0a0a0d'} toneMapped={false} /></mesh>
        </group>
        <pointLight position={[0, 2.0, 0.6]} intensity={4.2} distance={5.2} decay={1.6} color="#eaf1ff" />
      </group>
    );
  };
  return <><One x={-2.4} src="/vault/100.png" seed={0} /><One x={2.4} src="/vault/300.png" seed={2.1} /></>;
}


// ── THE RE-LAUNCH MINT ROOM — the finale. You break through the ink well into a
//    WILD, BRIGHT room: a brand-new digital collage hangs glowing at the centre,
//    with a MINT button that links out to Manifold. Colour, light and confetti
//    after the dark corridor — a celebration of the site's re-launch. ──
function MintRoom({ works = [], onOpen = () => {} }) {
  const roomW = 18, roomH = 10;
  const z0 = MINT_Z0, len = MINT.LEN, midZ = z0 + len / 2;
  const collageZ = z0 + 32;              // the hero collage, ahead of where the camera settles (CAM_END = z0+22)
  const tex = useSafeTexture(RELAUNCH_COLLAGE_IMG);
  const img = tex && tex.image;
  const aspect = img && img.width && img.height ? img.width / img.height : 1;
  // collage-wrapped textures for the massive spray cans flanking the collage
  const canA = useSafeTexture('/portfolio/collage/wall-1.jpg');
  const canB = useSafeTexture('/portfolio/collage/wall-3.jpg');
  const CW = 6.4;
  const cw = aspect >= 1 ? CW : CW * aspect;
  const ch = aspect >= 1 ? CW / aspect : CW;

  // reveal the projected mint label only once the camera is actually in the room
  // (drei <Html> otherwise shows from far down the corridor).
  const [showLabel, setShowLabel] = useState(false);
  const shownRef = useRef(false);
  const collageRef = useRef();
  const glowRef = useRef();
  useFrame(({ camera, clock }) => {
    const inZone = camera.position.z > z0 + 8;
    if (inZone !== shownRef.current) { shownRef.current = inZone; setShowLabel(inZone); }
    const t = clock.elapsedTime;
    if (collageRef.current) collageRef.current.position.y = 4.2 + Math.sin(t * 0.6) * 0.12;
    if (glowRef.current) { const b = 1 + Math.sin(t * 2) * 0.14; glowRef.current.scale.set(b, b, 1); }
  });

  // wild floating fragments of her collage work around the room — bright confetti
  const frags = useMemo(() => works.slice(0, 22).map((w, i) => ({
    w,
    x: (rand(i + 1) - 0.5) * (roomW - 3),
    y: 1.4 + rand(i + 11) * (roomH - 3),
    z: z0 + 6 + rand(i + 21) * (len - 12),
    size: 0.7 + rand(i + 31) * 1.1,
    tilt: (rand(i + 51) - 0.5) * 0.6,
  })), [works, z0, len]);

  // colour flecks drifting through the room
  const COLOURS = ['#ff5da2', '#4dd0ff', '#ffd54d', '#8b5cf6', '#4ade80', '#ff8a3d'];
  const confetti = useMemo(() => Array.from({ length: 90 }, (_, i) => ({
    x: (rand(i + 2) - 0.5) * roomW,
    y: rand(i + 12) * roomH,
    z: z0 + rand(i + 22) * len,
    c: COLOURS[i % COLOURS.length],
    s: 0.06 + rand(i + 32) * 0.1,
    r: rand(i + 42) * 6.283,
  })), [z0, len]);

  return (
    <group>
      {/* ── bright shell — fog-exempt so the room reads bright at the corridor's end ── */}
      <mesh position={[0, 0, midZ]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[roomW, len]} /><meshStandardMaterial color="#f3eee3" roughness={0.85} fog={false} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, roomH, midZ]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[roomW, len]} /><meshStandardMaterial color="#fbf8f1" roughness={1} fog={false} side={THREE.DoubleSide} /></mesh>
      <mesh position={[-roomW / 2, roomH / 2, midZ]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[len, roomH]} /><meshStandardMaterial color="#fbf8f1" roughness={1} fog={false} side={THREE.DoubleSide} /></mesh>
      <mesh position={[roomW / 2, roomH / 2, midZ]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[len, roomH]} /><meshStandardMaterial color="#fbf8f1" roughness={1} fog={false} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, roomH / 2, MINT_Z1]}><planeGeometry args={[roomW, roomH]} /><meshStandardMaterial color="#fbf8f1" roughness={1} fog={false} side={THREE.DoubleSide} /></mesh>

      {/* bright key light + wild colour accents */}
      <ambientLight intensity={0.7} />
      <pointLight position={[0, roomH - 1, midZ]} intensity={45} distance={44} decay={1.3} color="#ffffff" />
      <pointLight position={[-roomW / 2 + 1, 5, midZ]} intensity={26} distance={30} decay={1.4} color="#ff5da2" />
      <pointLight position={[roomW / 2 - 1, 5, midZ]} intensity={26} distance={30} decay={1.4} color="#4dd0ff" />
      <pointLight position={[0, 3.4, collageZ - 6]} intensity={34} distance={26} decay={1.4} color="#ffe9b0" />

      {/* ── massive collage-wrapped spray cans flanking the hero collage ── */}
      {canA && <OneCan x={-roomW / 2 + 2.6} z={collageZ + 0.5} tex={canA} capColor="#ff5da2" spin={0.16} scale={1.9} />}
      {canB && <OneCan x={roomW / 2 - 2.6} z={collageZ + 0.5} tex={canB || canA} capColor="#4dd0ff" spin={-0.15} scale={1.9} />}

      {/* ── the hero collage at the centre, glowing, gently floating ── */}
      <group ref={collageRef} position={[0, 4.2, collageZ]} userData={{ open: () => window.open(RELAUNCH_MINT_URL, '_blank', 'noopener,noreferrer'), title: RELAUNCH_TITLE, collection: 'Mint on Manifold' }}>
        <mesh ref={glowRef} position={[0, 0, -0.06]}><planeGeometry args={[cw + 1.8, ch + 1.8]} /><meshBasicMaterial color="#ffd98a" transparent opacity={0.5} fog={false} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, 0, -0.03]}><planeGeometry args={[cw + 0.5, ch + 0.5]} /><meshStandardMaterial color="#17171b" roughness={0.4} fog={false} side={THREE.DoubleSide} /></mesh>
        <mesh position={[0, 0, -0.015]}><planeGeometry args={[cw + 0.28, ch + 0.28]} /><meshStandardMaterial color="#ffffff" roughness={0.5} fog={false} side={THREE.DoubleSide} /></mesh>
        {tex
          ? <mesh><planeGeometry args={[cw, ch]} /><meshBasicMaterial map={tex} toneMapped={false} fog={false} side={THREE.DoubleSide} /></mesh>
          : <mesh><planeGeometry args={[cw, ch]} /><meshStandardMaterial color="#efe9dd" roughness={0.8} fog={false} side={THREE.DoubleSide} /></mesh>}
      </group>

      {/* ── the mint button — aim the crosshair at it and tap to open Manifold ── */}
      <group position={[0, 1.85, collageZ - 0.15]} userData={{ open: () => window.open(RELAUNCH_MINT_URL, '_blank', 'noopener,noreferrer'), title: 'Mint on Manifold', collection: 'Re-launch edition' }}>
        <mesh position={[0, 0, -0.04]}><planeGeometry args={[5.6, 1.8]} /><meshBasicMaterial color="#ff5da2" transparent opacity={0.55} fog={false} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} /></mesh>
        <mesh><planeGeometry args={[5.0, 1.24]} /><meshBasicMaterial color="#ffffff" toneMapped={false} fog={false} side={THREE.DoubleSide} /></mesh>
        {showLabel && (
          <Html center distanceFactor={11} position={[0, 0, 0.05]} style={{ pointerEvents: 'none' }}>
            <div style={{ textAlign: 'center', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
              <div style={{ fontFamily: mono, fontSize: 38, letterSpacing: 4, textTransform: 'uppercase', color: '#0a0a0a', fontWeight: 800 }}>Mint on Manifold →</div>
              <div style={{ fontFamily: mono, fontSize: 16, letterSpacing: 1.5, color: '#2a2a2a', marginTop: 9, fontWeight: 600 }}>Edition of {RELAUNCH_EDITION} · {RELAUNCH_PRINT}</div>
            </div>
          </Html>
        )}
      </group>

      {/* wild floating fragments of her collage practice */}
      {frags.map((f, i) => (
        <group key={f.w.id || i} position={[f.x, f.y, f.z]} rotation={[0, f.tilt, f.tilt * 0.5]} userData={{ open: () => onOpen(f.w), title: f.w.title || f.w.name || '', collection: f.w.collection || '' }}>
          <Hung url={f.w.thumbnail || f.w.image} max={f.size} bare />
        </group>
      ))}

      {/* colour confetti */}
      {confetti.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, c.z]} rotation={[c.r, c.r * 1.3, c.r]}>
          <planeGeometry args={[c.s, c.s]} />
          <meshBasicMaterial color={c.c} toneMapped={false} fog={false} transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function ShopScene({ variant, dropWorks, wallWorks, floatWorks, hallWorks, stilettoWorks, relaunchImg, onMint, onOpen, onFilm, onEnter, progressRef, zoneRef, aimRef, filmTexs, filmList, filmAspects, borgheseTex, victoriaTex, victoriaAspect, worldTexs, worldList, startZ, minZ, maxZ }) {
  const isDrop = variant === 'drop';
  return (
    <>
      <color attach="background" args={[isDrop ? DROP_SKY : '#050506']} />
      <fog attach="fog" args={[isDrop ? DROP_SKY : '#050506', isDrop ? 22 : 6, isDrop ? 90 : 46]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#ffffff', '#101014', 0.5]} />
      <directionalLight position={[2, 6, 4]} intensity={0.5} />
      <pointLight position={[0, HALL.H - 0.6, 10]} intensity={40} distance={30} decay={1.6} color="#fff1dc" />
      <pointLight position={[0, HALL.H - 0.6, 34]} intensity={40} distance={30} decay={1.6} color="#eef2ff" />
      <pointLight position={[0, HALL.H - 0.6, 58]} intensity={40} distance={30} decay={1.6} color="#fff1dc" />
      <Haze />
      {isDrop ? (
        <>
          {/* THE DROP — the front Hall of Graffiti Stilettos, then the spray-can
              gate opens out into the drop-room gallery of the 7 editions. */}
          <StilettoHall works={stilettoWorks} onOpen={onOpen} heroImg={relaunchImg} onMint={onMint} />
          <Suspense fallback={null}><DropRoom works={dropWorks} onMint={onMint} onOpen={onOpen} /></Suspense>
        </>
      ) : (
        <>
          {/* HOME — the Ink Interventions walk-through (no stiletto hall). */}
          <GodRays />
          <Suspense fallback={null}>
            <Shell />
          </Suspense>
          <CinemaHall films={filmTexs} filmList={filmList} filmAspects={filmAspects} onFilm={onFilm} />
          {/* London street threshold + CYBAROQUE BORGHESE in the Bonhams window */}
          <LondonStreet tex={borgheseTex} />
          <Suspense fallback={null}><Plinths /></Suspense>
          <Suspense fallback={null}>
            <WallWorks works={wallWorks} onOpen={onOpen} />
            <FloatWorks works={floatWorks} onOpen={onOpen} />
            <WorksHall works={hallWorks} onOpen={onOpen} victoriaTex={victoriaTex} victoriaAspect={victoriaAspect} />
            <Preload all />
          </Suspense>
          <WorldsHall worldTexs={worldTexs} worldList={worldList} onEnter={onEnter} />
          <Suspense fallback={null}><InkDive works={hallWorks} onOpen={onOpen} /></Suspense>
          <Suspense fallback={null}><MintRoom works={hallWorks} onOpen={onOpen} /></Suspense>
        </>
      )}
      <Glide progressRef={progressRef} zoneRef={zoneRef} aimRef={aimRef} startZ={startZ} minZ={minZ} maxZ={maxZ} />
    </>
  );
}

export default function PortfolioShop({ variant = 'home' }) {
  const isDrop = variant === 'drop';
  // where the camera opens + how far it can travel, per experience
  const startZ = isDrop ? CAM_START : HOME_START;
  const minZ = isDrop ? STILETTO_Z0 + 2 : HOME_START - 1;
  const maxZ = isDrop ? DROP_CAM_END : CAM_END;
  const ctx = usePortfolio();
  const openWork = ctx?.openWork || (() => {});
  const navigate = useNavigate();
  const progressRef = useRef(0);
  const dropLabelRef = useRef(null);
  const titleRef = useRef(null);
  const mintCtaRef = useRef(null);
  const inkTitleRef = useRef(null);
  const hintRef = useRef(null);
  const sothRef = useRef(null);
  const baileyRef = useRef(null);
  const aimRef = useRef(null);
  const captionRef = useRef(null);
  const audioRef = useRef(null);
  const collageAudioRef = useRef(null);
  const [musicOn, setMusicOn] = useState(true);
  const musicOnRef = useRef(true);
  const [trackIdx, setTrackIdx] = useState(0);
  const [collageMusic, setCollageMusic] = useState(false);
  const collageMusicRef = useRef(false);
  const [jukeOpen, setJukeOpen] = useState(false);
  const [filmTexs, setFilmTexs] = useState([]);
  const [activeFilm, setActiveFilm] = useState(null); // the film clicked in the corridor → plays fullscreen
  const zoneRef = useRef(0);
  const inkRef = useRef(null);
  const cinemaLabelRef = useRef(null);
  const cinemaSothRef = useRef(null);
  const bonhamsRef = useRef(null);
  const victoriaRef = useRef(null);
  const worksLabelRef = useRef(null);
  const worldsLabelRef = useRef(null);
  const mintLabelRef = useRef(null);
  // The films shown across the cinema gauntlet (and playable on click). More of
  // them now so the hall is full; the screens cycle through this set (reusing the
  // textures) so there are many screens but only a handful of decoding videos.
  // A MIX across the gauntlet: the two vertical Drones films AL named + all four
  // 16:9 Diamond Drones films, so both orientations play. The 20 screens reuse
  // these textures, so many screens but only these decode. (DD onchain files are
  // ~48MB each — kept the count sane so simultaneous decode stays reliable.)
  const FILM_SET = useMemo(() => [FILMS[0], FILMS[1], ...DIAMOND_DRONES_FILMS].filter(Boolean), []);
  // Her built worlds — the portals in the WORLDS zone. Each plays its world film
  // and, clicked, enters that world.
  const WORLD_SET = useMemo(() => [
    { name: 'The Drones of Suburbia', tagline: 'AI Cinema', poster: '/films/02-les-drones-de-la-banlieue.mp4', to: '/portfolio/cinema' },
    { name: 'Diamond Drones', tagline: 'The flagship collection', poster: '/films/dd-diamond-drone-lounge-bg.mp4', href: 'https://diamonddrones.world' },
    { name: 'Porcelain Android', tagline: 'Fragile machine femininity', poster: '/androids/transformations/manga-machine-beauties.mp4', href: 'https://porcelainandroid.com' },
  ], []);
  const [worldTexs, setWorldTexs] = useState([]);
  const [filmAspects, setFilmAspects] = useState([]);   // real w/h per film, filled on loadedmetadata
  const [borgheseTex, setBorgheseTex] = useState(null);   // CYBAROQUE BORGHESE (London / Bonhams window)
  const [victoriaTex, setVictoriaTex] = useState(null);   // Victoria and the Doge Army (hero pedestal)
  const [victoriaAspect, setVictoriaAspect] = useState(1);
  const filmVidsRef = useRef([]);   // cinema <video>s — gated to play only in the cinema zone
  const borgheseVidRef = useRef(null);   // the Bonhams-window film — gated near the collage threshold
  const victoriaVidRef = useRef(null);   // the hero-pedestal film — gated near the collage-room exit
  const worldVidsRef = useRef([]);  // worlds <video>s — gated to play only in the worlds zone
  const enterWorld = (world) => {
    if (!world) return;
    if (world.to) navigate(world.to);
    else if (world.href) window.open(world.href, '_blank', 'noopener,noreferrer');
  };

  // The AI-CINEMA hall's films — a few videos created HERE at page level (outside
  // the R3F Canvas), the proven pattern the AI Cinema page uses so they reliably
  // play/decode; their VideoTextures are passed into the scene and hung on the
  // cinema-hall walls. (Creating them inside an R3F child was fragile → blank.)
  useEffect(() => {
    if (isDrop) return;   // the drop experience has no cinema — skip decoding these
    const srcs = FILM_SET.map(f => f.src);
    const made = srcs.map((src, i) => {
      const v = document.createElement('video');
      v.src = src; v.loop = true; v.muted = true; v.autoplay = true;
      v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'auto';
      v.style.cssText = 'position:fixed;left:-20px;top:-20px;width:2px;height:2px;opacity:0;pointer-events:none';
      // record the real aspect once known so vertical films aren't stretched
      v.addEventListener('loadedmetadata', () => {
        if (!v.videoWidth || !v.videoHeight) return;
        setFilmAspects(prev => { const next = prev.slice(); next[i] = v.videoWidth / v.videoHeight; return next; });
        // start each film at a different point so the hall never plays in lockstep
        try { if (v.duration && isFinite(v.duration)) v.currentTime = (v.duration * ((i * 0.41) % 1)) % v.duration; } catch (e) {}
      });
      document.body.appendChild(v);
      v.play().catch(() => {});
      const t = new THREE.VideoTexture(v); t.colorSpace = THREE.SRGBColorSpace;
      return { v, t };
    });
    filmVidsRef.current = made.map(m => m.v);
    setFilmTexs(made.map(m => m.t));
    return () => { filmVidsRef.current = []; made.forEach(m => { m.v.pause(); m.v.remove(); m.t.dispose(); }); };
  }, [FILM_SET]);

  // CYBAROQUE BORGHESE — the London-exhibited film that plays in the Bonhams window
  // at the collage-room threshold. Same page-level pattern; a LOCAL file (drop it at
  // /public/films/cybaroque-borghese.mp4) so the texture never taints black the way
  // an external IPFS video would. Missing file simply leaves the window dark.
  useEffect(() => {
    if (isDrop) return;
    const v = document.createElement('video');
    v.src = '/films/CYBAROQUE%20BORGHESE.mp4'; v.loop = true; v.muted = true; v.autoplay = true;
    v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'auto';
    v.style.cssText = 'position:fixed;left:-20px;top:-20px;width:2px;height:2px;opacity:0;pointer-events:none';
    document.body.appendChild(v);
    v.play().catch(() => {});
    const t = new THREE.VideoTexture(v); t.colorSpace = THREE.SRGBColorSpace;
    borgheseVidRef.current = v;
    setBorgheseTex(t);
    return () => { borgheseVidRef.current = null; v.pause(); v.remove(); t.dispose(); setBorgheseTex(null); };
  }, []);

  // Victoria and the Doge Army — AL's highest sale (20 ETH), the moving masterpiece
  // on the pedestal at the collage-room's far end. Local file; page-level pattern.
  useEffect(() => {
    if (isDrop) return;
    const v = document.createElement('video');
    v.src = '/films/VICTORIA%20AND%20THE%20DOGE%20ARMY.mp4'; v.loop = true; v.muted = true; v.autoplay = true;
    v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'auto';
    v.style.cssText = 'position:fixed;left:-20px;top:-20px;width:2px;height:2px;opacity:0;pointer-events:none';
    v.addEventListener('loadedmetadata', () => { if (v.videoWidth && v.videoHeight) setVictoriaAspect(v.videoWidth / v.videoHeight); });
    document.body.appendChild(v);
    v.play().catch(() => {});
    const t = new THREE.VideoTexture(v); t.colorSpace = THREE.SRGBColorSpace;
    victoriaVidRef.current = v;
    setVictoriaTex(t);
    return () => { victoriaVidRef.current = null; v.pause(); v.remove(); t.dispose(); setVictoriaTex(null); };
  }, []);

  // The WORLDS-zone portal films — same page-level video-texture pattern.
  useEffect(() => {
    if (isDrop) return;
    const made = WORLD_SET.map(w => {
      const v = document.createElement('video');
      v.src = w.poster; v.loop = true; v.muted = true; v.autoplay = true;
      v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'auto';
      v.style.cssText = 'position:fixed;left:-20px;top:-20px;width:2px;height:2px;opacity:0;pointer-events:none';
      document.body.appendChild(v);
      v.play().catch(() => {});
      const t = new THREE.VideoTexture(v); t.colorSpace = THREE.SRGBColorSpace;
      return { v, t };
    });
    worldVidsRef.current = made.map(m => m.v);
    setWorldTexs(made.map(m => m.t));
    return () => { worldVidsRef.current = []; made.forEach(m => { m.v.pause(); m.v.remove(); m.t.dispose(); }); };
  }, [WORLD_SET]);

  // Sound: the Drones of Suburbia album, started on the first click (browsers
  // block audio autoplay) and swelling louder as you glide toward the doors.
  // The jukebox switches tracks; the toggle mutes it. When a track ends the album
  // rolls on to the next one automatically (wrapping back to the first after 11).
  useEffect(() => {
    const a = new Audio(ALBUM_TRACKS[0].src);
    a.volume = 0; a.preload = 'auto';
    audioRef.current = a;
    const ca = new Audio(COLLAGE_TRACK.src);
    ca.volume = 0; ca.preload = 'auto'; ca.loop = true; ca.load();   // buffer up front so it kicks in instantly
    collageAudioRef.current = ca;
    const next = () => setTrackIdx(i => (i + 1) % ALBUM_TRACKS.length);
    a.addEventListener('ended', next);
    const start = () => { if (musicOnRef.current) (collageMusicRef.current ? ca : a).play().catch(() => {}); window.removeEventListener('pointerdown', start); };
    window.addEventListener('pointerdown', start);
    return () => { a.pause(); ca.pause(); a.removeEventListener('ended', next); audioRef.current = null; collageAudioRef.current = null; window.removeEventListener('pointerdown', start); };
  }, []);

  // Switch tracks — swap the source and keep playing (if not muted).
  useEffect(() => {
    const a = audioRef.current, ca = collageAudioRef.current;
    if (!a) return;
    if (collageMusic) {
      a.pause();
      if (ca && musicOnRef.current) ca.play().catch(() => {});   // already buffered -> instant
    } else {
      if (ca) ca.pause();
      a.src = ALBUM_TRACKS[trackIdx].src; a.loop = false; a.load();
      if (musicOnRef.current) a.play().catch(() => {});
    }
  }, [trackIdx, collageMusic]);

  // Music on/off — pause/resume the track and let the volume loop mute it.
  useEffect(() => {
    musicOnRef.current = musicOn;
    const a = audioRef.current, ca = collageAudioRef.current;
    if (musicOn) { (collageMusicRef.current ? ca : a)?.play().catch(() => {}); }
    else { a?.pause(); ca?.pause(); }
  }, [musicOn]);

  // Interleave works round-robin across collections so the hall isn't all one
  // series (the raw list is grouped by contract → slicing gave only Drone
  // Blondes). One-per-collection first = maximum variety up front.
  const diverse = useMemo(() => {
    const groups = new Map();
    for (const w of inkInterventions) {
      if (!w.image) continue;
      const k = w.collection || w.contract || w.id.replace(/-\d+$/, '');
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(w);
    }
    const queues = [...groups.values()];
    const out = [];
    for (let added = true; added;) {
      added = false;
      for (const q of queues) if (q.length) { out.push(q.shift()); added = true; }
    }
    return out;
  }, []);
  const wallWorks = useMemo(() => diverse.slice(0, 24), [diverse]);
  const floatWorks = useMemo(() => diverse.slice(24, 54), [diverse]);
  // The DIGITAL COLLAGE ROOMS — her collage works from every year build both the
  // walls and the immersive cloud you fly through (her oldest on-chain practice).
  const collageWorks = useMemo(() => digitalCollage.filter(w => w.image).slice(0, 84), []);
  const hallWorks = collageWorks;
  // the front Hall of Graffiti Stilettos + the re-launch mint link-out
  const stilettoWorks = useMemo(() => graffitiStilettos, []);
  // the 7 drop editions — placeholder art from her graffiti-stiletto works
  const dropWorks = useMemo(() => graffitiStilettos.slice(0, 7), []);
  const openMint = () => window.open(RELAUNCH_MINT_URL, '_blank', 'noopener,noreferrer');

  // Crossfade the DOM overlays from glide progress (written by Glide each frame).
  useEffect(() => {
    let raf;
    const tick = () => {
      const p = progressRef.current;
      const z = zoneRef.current;
      // ── THE DROP variant — the stiletto hall + the drop room. Its own overlays;
      // the ink-journey overlays are all held off. The recherche track plays. ──
      if (isDrop) {
        if (titleRef.current) titleRef.current.style.opacity = String(1 - smooth(z, DROP_Z0 + 1, DROP_Z0 + 9));
        // the centre "GRAFFITI STILETTOS" heading clears the moment you enter the
        // showroom (z crosses 0) and returns if you back out into the entrance hall.
        if (dropLabelRef.current) dropLabelRef.current.style.opacity = String(1 - smooth(z, DROP_Z0 - 12, DROP_Z0));
        if (hintRef.current) hintRef.current.style.opacity = String(1 - smooth(z, DROP_Z0 + 5, DROP_Z0 + 15));
        if (mintCtaRef.current) mintCtaRef.current.style.opacity = '0';   // per-piece mint in the drop room; no front-door CTA
        for (const r of [inkTitleRef, sothRef, baileyRef, cinemaLabelRef, cinemaSothRef, bonhamsRef, victoriaRef, worksLabelRef, worldsLabelRef, mintLabelRef, inkRef]) if (r.current) r.current.style.opacity = '0';
        // work / edition caption once past the hall, into the drop room
        const a = aimRef.current, cap = captionRef.current;
        if (cap) {
          if (a && (a.title || a.collection) && z >= DROP_Z0 + 1) {
            cap.querySelector('[data-t]').textContent = a.title || '';
            cap.querySelector('[data-c]').textContent = a.collection || '';
            cap.style.opacity = '1';
          } else cap.style.opacity = '0';
        }
        // the recherche score plays throughout the drop, swelling toward the room
        if (!collageMusicRef.current) { collageMusicRef.current = true; setCollageMusic(true); }
        { const vol = musicOnRef.current ? 0.16 + smooth(z, DROP_Z0, DROP_CAM_END) * 0.34 : 0; if (collageAudioRef.current) collageAudioRef.current.volume = vol; if (audioRef.current) audioRef.current.volume = 0; }
        raf = requestAnimationFrame(tick);
        return;
      }
      // both entrance quotes must be gone by the time you reach the doors / cinema
      // (progress clamps at 1 in the shop so it can't fade them out — gate on depth)
      const doorFade = 1 - smooth(z, SHOP.LEN - 14, SHOP.LEN - 3);
      if (titleRef.current) titleRef.current.style.opacity = String(1 - smooth(p, 0.05, 0.16));
      if (dropLabelRef.current) dropLabelRef.current.style.opacity = '0';
      // the stiletto MINT button belongs to the DROP, not the ink walk-through home
      if (mintCtaRef.current) mintCtaRef.current.style.opacity = '0';
      // INK INTERVENTIONS hall title — introduced deep in the hall (well past the
      // entrance mint), then gone by the doors
      if (inkTitleRef.current) inkTitleRef.current.style.opacity = String(win(z, 26, 38, 56, 66) * doorFade);
      if (hintRef.current) hintRef.current.style.opacity = String(1 - smooth(p, 0.03, 0.12));
      if (sothRef.current) sothRef.current.style.opacity = String(win(p, 0.24, 0.36, 0.56, 0.66) * doorFade);
      if (baileyRef.current) baileyRef.current.style.opacity = String(win(p, 0.66, 0.78, 0.9, 0.98) * doorFade);
      // hovered-work title caption (what's centred in the crosshair)
      const a = aimRef.current, cap = captionRef.current;
      if (cap) {
        // Hold ALL work titles off until we're past the front Hall of Graffiti
        // Stilettos (z >= STILETTO_Z1) — no captions in the entrance hall.
        if (a && (a.title || a.collection) && z >= STILETTO_Z1) {
          cap.querySelector('[data-t]').textContent = a.title || '';
          cap.querySelector('[data-c]').textContent = a.collection || '';
          cap.style.opacity = '1';
        } else cap.style.opacity = '0';
      }
      // swell the soundtrack as you approach the doors (silent when muted)
      { const vol = musicOnRef.current ? 0.12 + smooth(p, 0.1, 0.85) * 0.5 : 0; const onC = collageMusicRef.current; if (audioRef.current) audioRef.current.volume = onC ? 0 : vol; if (collageAudioRef.current) collageAudioRef.current.volume = onC ? vol : 0; }
      { const wantC = z < STILETTO_Z1 || (z > WORKS_Z0 - 1 && z < WORLDS_Z1); if (wantC !== collageMusicRef.current) { collageMusicRef.current = wantC; setCollageMusic(wantC); } }
      // cinema / works zone headings fade in as you cross into each zone
      if (cinemaLabelRef.current) cinemaLabelRef.current.style.opacity = String(win(z, CINEMA_Z0 - 6, CINEMA_Z0 + 12, CINEMA_Z1 - 34, CINEMA_Z1 - 24));
      if (cinemaSothRef.current) cinemaSothRef.current.style.opacity = String(win(z, CINEMA_Z0 + 4, CINEMA_Z0 + 18, CINEMA_Z1 - 34, CINEMA_Z1 - 24));
      if (bonhamsRef.current) bonhamsRef.current.style.opacity = String(win(z, CINEMA_Z1 - 26, CINEMA_Z1 - 17, CINEMA_Z1 - 15, CINEMA_Z1 - 9));
      if (victoriaRef.current) victoriaRef.current.style.opacity = String(win(z, WORKS_Z1 - 18, WORKS_Z1 - 8, WORKS_Z1 + 2, WORKS_Z1 + 6));
      if (worksLabelRef.current) worksLabelRef.current.style.opacity = String(win(z, WORKS_Z0 - 2, WORKS_Z0 + 10, WORLDS_Z0 - 8, WORLDS_Z0));
      if (worldsLabelRef.current) worldsLabelRef.current.style.opacity = String(win(z, WORLDS_Z0 - 2, WORLDS_Z0 + 10, INK_Z0 - 6, INK_Z0));
      // the ink dive: the black plunge fades in as you submerge into the ink well,
      // then CLEARS as you break through into the bright mint room (blackout → colour)
      if (inkRef.current) inkRef.current.style.opacity = String(win(z, INK_Z0 + 4, INK_Z1 - 4, INK_Z1 + 2, MINT_Z0 + 16));
      if (mintLabelRef.current) mintLabelRef.current.style.opacity = String(win(z, MINT_Z0 + 6, MINT_Z0 + 18, MINT_Z1 - 6, MINT_Z1));
      // GATE video decode by zone — only the cinema films decode while you're in
      // the cinema (and the world films only in the worlds zone), so the browser's
      // ~8-simultaneous-video cap is never hit and no screen goes black.
      const inCinema = z > CINEMA_Z0 - 14 && z < CINEMA_Z1 + 6;
      const inWorlds = z > WORLDS_Z0 - 14 && z < WORLDS_Z1 + 6;
      for (const v of filmVidsRef.current) { if (!v) continue; if (inCinema) { if (v.paused) v.play().catch(() => {}); } else if (!v.paused) v.pause(); }
      { const bv = borgheseVidRef.current; if (bv) { const near = z > CINEMA_Z1 - 20 && z < CINEMA_Z1 + 8; if (near) { if (bv.paused) bv.play().catch(() => {}); } else if (!bv.paused) bv.pause(); } }
      { const vv = victoriaVidRef.current; if (vv) { const near = z > WORKS_Z1 - 22 && z < WORKS_Z1 + 8; if (near) { if (vv.paused) vv.play().catch(() => {}); } else if (!vv.paused) vv.pause(); } }
      for (const v of worldVidsRef.current) { if (!v) continue; if (inWorlds) { if (v.paused) v.play().catch(() => {}); } else if (!v.paused) v.pause(); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isDrop]);

  // ESC closes a playing film if one is open, otherwise exits the immersive
  // entrance to the flat catalogue (stops the glide).
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') { if (activeFilm) setActiveFilm(null); else navigate('/portfolio/works'); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, activeFilm]);

  const label = { fontFamily: mono, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' };
  // Frosted-glass card the quotes ride on (floating glassmorphism).
  const glassCard = {
    background: 'rgba(255,255,255,0.07)',
    backdropFilter: 'blur(22px) saturate(140%)', WebkitBackdropFilter: 'blur(22px) saturate(140%)',
    border: '1px solid rgba(255,255,255,0.18)', borderRadius: 22,
    padding: 'clamp(24px,3vw,44px)', boxShadow: '0 24px 70px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.28)',
  };
  // Outer wrapper = vertical centring + progress-driven opacity (rAF sets it).
  const quoteWrap = { position: 'absolute', top: '50%', transform: 'translateY(-50%)', maxWidth: 'min(560px,82vw)', opacity: 0, transition: 'opacity .15s linear' };

  return (
    <div style={{ position: 'relative', height: '100dvh', width: '100%', background: '#050506', overflow: 'hidden' }}>
      <Helmet>
        {isDrop ? (
          <title>Graffiti Stilettos — The Drop · Miss AL Simpson</title>
        ) : (
          <title>Miss AL Simpson — Scottish Cryptoartist</title>
        )}
        {isDrop ? (
          <meta name="description" content="Graffiti Stilettos — a drop of seven editions of thirty by Scottish cryptoartist Miss AL Simpson. Each comes with a diamond-dusted, AR-activated A2 print and an NFT animation. Enter the spray-can gate." />
        ) : (
          <meta name="description" content="The official site of Miss AL Simpson, award-winning Scottish cryptoartist. Move through a baroque hall of her Ink Interventions — collage, ink and machine intelligence. Exhibited at Sotheby’s, New York." />
        )}
      </Helmet>

      <Canvas
        camera={{ fov: 62, position: [0, EYE, 2.5], near: 0.1, far: 260 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
        style={{ position: 'absolute', inset: 0 }}
      >
        <ShopScene variant={variant} dropWorks={dropWorks} startZ={startZ} minZ={minZ} maxZ={maxZ} wallWorks={wallWorks} floatWorks={floatWorks} hallWorks={hallWorks} stilettoWorks={stilettoWorks} relaunchImg={RELAUNCH_COLLAGE_IMG} onMint={openMint} onOpen={openWork} onFilm={setActiveFilm} onEnter={enterWorld} progressRef={progressRef} zoneRef={zoneRef} aimRef={aimRef} filmTexs={filmTexs} filmList={FILM_SET} filmAspects={filmAspects} borgheseTex={borgheseTex} victoriaTex={victoriaTex} victoriaAspect={victoriaAspect} worldTexs={worldTexs} worldList={WORLD_SET} />
      </Canvas>

      {/* ── Ink dive: a plunge that fades in as you submerge into the ink well at
             the very end, then resolves into the catalogue. It keeps a glowing
             centre (not flat black) so it reads as a doorway you're passing
             THROUGH, and names where you're going. ── */}
      <div ref={inkRef} style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 48%, rgba(180,198,240,0.30) 0%, rgba(14,18,32,0.86) 32%, #05060c 72%)', opacity: 0, pointerEvents: 'none', zIndex: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <div style={{ ...label, color: 'rgba(255,255,255,0.62)' }}>Through the ink</div>
      </div>

      {/* ── Corridor film player — plays the exact film you clicked, fullscreen ── */}
      {activeFilm && (
        <div
          onClick={() => setActiveFilm(null)}
          style={{ position: 'absolute', inset: 0, zIndex: 7, background: 'rgba(0,0,0,0.94)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: 'clamp(16px,4vw,48px)' }}
        >
          <video
            key={activeFilm.src}
            src={activeFilm.src}
            autoPlay loop controls playsInline
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '100%', maxHeight: '78vh', boxShadow: '0 30px 90px rgba(0,0,0,0.7)', background: '#000' }}
          />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: serif, color: '#fff', fontSize: 'clamp(18px,2.4vw,28px)', fontWeight: 600, letterSpacing: -0.3 }}>{activeFilm.title}</div>
            {activeFilm.sub && <div style={{ ...label, marginTop: 6 }}>{activeFilm.sub}</div>}
          </div>
          <button
            onClick={e => { e.stopPropagation(); setActiveFilm(null); }}
            style={{ position: 'absolute', top: 'clamp(18px,4vw,40px)', right: 'clamp(18px,4vw,40px)', display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 999, color: '#fff', padding: '9px 16px', fontFamily: mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}
          >✕ Esc · Close</button>
        </div>
      )}

      {/* Cinematic vignette */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 42%, rgba(0,0,0,0.6) 100%)' }} />

      {/* Aiming reticle — centre a work in it, then click to open */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', width: 9, height: 9, marginLeft: -5, marginTop: -5, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.7)', boxShadow: '0 0 0 3px rgba(0,0,0,0.22)', pointerEvents: 'none', zIndex: 3 }} />

      {/* Title of the work currently in the crosshair */}
      <div ref={captionRef} style={{ position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', pointerEvents: 'none', opacity: 0, transition: 'opacity .18s linear', zIndex: 3 }}>
        <div data-t style={{ fontFamily: serif, color: '#fff', fontSize: 'clamp(16px,2vw,22px)', fontWeight: 600, letterSpacing: -0.3 }} />
        <div data-c style={{ ...label, marginTop: 4 }} />
      </div>

      {/* Zone headings — fade in as you cross into each zone of the journey */}
      <div ref={cinemaLabelRef} style={{ position: 'absolute', top: 'clamp(90px,16vh,150px)', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', pointerEvents: 'none', opacity: 0, transition: 'opacity .2s linear', zIndex: 3 }}>
        <div style={{ ...label, marginBottom: 10 }}>Keep walking</div>
        <div style={{ fontFamily: serif, color: '#fff', fontWeight: 800, letterSpacing: -1, textTransform: 'uppercase', fontSize: 'clamp(30px,5vw,74px)', lineHeight: 0.9 }}>AI Cinema</div>
      </div>
      <div ref={worksLabelRef} style={{ position: 'absolute', top: 'clamp(90px,16vh,150px)', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', pointerEvents: 'none', opacity: 0, transition: 'opacity .2s linear', zIndex: 3 }}>
        <div style={{ ...label, marginBottom: 10 }}>From the very start</div>
        <div style={{ fontFamily: serif, color: '#fff', fontWeight: 800, letterSpacing: -1, textTransform: 'uppercase', fontSize: 'clamp(30px,5vw,74px)', lineHeight: 0.9 }}>Digital Collage Rooms</div>
      </div>
      <div ref={worldsLabelRef} style={{ position: 'absolute', top: 'clamp(90px,16vh,150px)', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', pointerEvents: 'none', opacity: 0, transition: 'opacity .2s linear', zIndex: 3 }}>
        <div style={{ ...label, marginBottom: 10 }}>Not collections — universes</div>
        <div style={{ fontFamily: serif, color: '#fff', fontWeight: 800, letterSpacing: -1, textTransform: 'uppercase', fontSize: 'clamp(30px,5vw,74px)', lineHeight: 0.9 }}>Worlds</div>
      </div>
      <div ref={mintLabelRef} style={{ position: 'absolute', top: 'clamp(64px,12vh,120px)', left: '50%', transform: 'translateX(-50%)', width: 'min(92vw,1100px)', textAlign: 'center', pointerEvents: 'none', opacity: 0, transition: 'opacity .2s linear', zIndex: 3 }}>
        <div style={{ ...label, marginBottom: 16, fontSize: 'clamp(12px,1.4vw,16px)', letterSpacing: 3 }}>A new collage · minted on Manifold</div>
        <div style={{ fontFamily: serif, color: '#fff', fontWeight: 800, letterSpacing: -2, textTransform: 'uppercase', fontSize: 'clamp(56px,11vw,160px)', lineHeight: 0.88, textShadow: '0 4px 60px rgba(0,0,0,0.5)' }}>The Re-Launch</div>
        <div style={{ ...label, marginTop: 22, color: 'rgba(255,255,255,0.85)', textTransform: 'none', letterSpacing: 1, fontSize: 'clamp(16px,2vw,26px)', fontWeight: 500 }}>Edition of {RELAUNCH_EDITION} · {RELAUNCH_PRINT}</div>
      </div>

      {/* Entrance splash — the MISS AL SIMPSON logo shimmering LARGE and centred
          (the INK INTERVENTIONS title is introduced much further into the hall so
          it never collides with the mint CTA). Fades away as you walk in. */}
      {!isDrop && (
        <div ref={titleRef} style={{ position: 'absolute', top: '14%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none', transition: 'opacity .15s linear', zIndex: 4, width: 'min(94vw, 560px)' }}>
          <img className="hall-logo" src="/LOGO MISS.png" alt="Miss AL Simpson" style={{ width: 'clamp(220px,34vw,480px)', height: 'auto', display: 'block', margin: '0 auto' }} />
        </div>
      )}

      {/* ── DROP heading — the entrance title for the Graffiti Stilettos drop.
             Only present in the drop variant; fades away as you walk through the
             stiletto hall toward the spray-can gate. ── */}
      {isDrop && (
        <div ref={dropLabelRef} style={{ position: 'absolute', top: 'clamp(64px,13vh,120px)', left: '50%', transform: 'translateX(-50%)', width: 'min(94vw, 1000px)', textAlign: 'center', pointerEvents: 'none', transition: 'opacity .2s linear', zIndex: 4 }}>
          <div style={{ ...label, marginBottom: 14, color: 'rgba(255,255,255,0.78)', letterSpacing: 3 }}>The Drop</div>
          <div style={{ fontFamily: serif, color: '#fff', fontWeight: 800, letterSpacing: -2, textTransform: 'uppercase', fontSize: 'clamp(44px,9vw,140px)', lineHeight: 0.88, textShadow: '0 4px 60px rgba(0,0,0,0.5)' }}>Graffiti Stilettos</div>
          <div style={{ ...label, marginTop: 20, color: 'rgba(255,255,255,0.85)', textTransform: 'none', letterSpacing: 1, fontSize: 'clamp(15px,2vw,24px)', fontWeight: 500 }}>Seven editions of {DROP_EDITION} · diamond-dusted A2 AR prints + NFT animations</div>
        </div>
      )}

      {/* INK INTERVENTIONS — the hall title, introduced deep in the shop hall
          (fades in well after the entrance, so the mint has the entrance to itself) */}
      <div ref={inkTitleRef} style={{ position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none', opacity: 0, transition: 'opacity .2s linear', zIndex: 3, width: 'min(94vw, 900px)' }}>
        <div style={{ ...label, marginBottom: 12, color: 'rgba(255,255,255,0.7)' }}>The Hall of</div>
        <h1 style={{ fontFamily: serif, color: '#fff', margin: 0, fontWeight: 800, letterSpacing: -1, lineHeight: 0.95, textTransform: 'uppercase', fontSize: 'clamp(34px,6.2vw,84px)', textShadow: '0 0 40px rgba(0,0,0,0.5)' }}>
          Ink Interventions
        </h1>
      </div>

      {/* ── Front-door RE-LAUNCH mint CTA — the mintable Graffiti Stiletto hangs
             LARGE in its gilt frame in-world (the 3D hero at the head of the hall);
             this is the clickable Manifold link + edition line beneath it. Fades as
             you walk in. ── */}
      <div ref={mintCtaRef} style={{ position: 'absolute', top: 'clamp(70%, 76vh, 82%)', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none', transition: 'opacity .15s linear', zIndex: 4, width: 'min(92vw, 480px)' }}>
        <div style={{ ...label, marginBottom: 14, color: 'rgba(255,255,255,0.78)' }}>Graffiti Stilettos · the re-launch</div>
        <a
          href={RELAUNCH_MINT_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-block', pointerEvents: 'auto', fontFamily: mono, fontSize: 'clamp(16px,2.1vw,22px)', fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: '#0a0a0a', background: '#ffffff', padding: '16px 34px', borderRadius: 3, textDecoration: 'none', boxShadow: '0 8px 40px rgba(0,0,0,0.45)', border: '1px solid #0a0a0a' }}
        >
          Mint Graffiti Stilettos →
        </a>
        <div style={{ ...label, marginTop: 14, color: 'rgba(255,255,255,0.7)', textTransform: 'none', letterSpacing: 1 }}>Edition of {RELAUNCH_EDITION} · {RELAUNCH_PRINT}</div>
      </div>

      {/* Experimental motion for the glass cards — a slow float/tilt + a sheen
          sweeping across the frosted surface. */}
      <style>{`
        @keyframes cardFloatA { 0%,100%{transform:translateY(0) rotate(-0.7deg)} 50%{transform:translateY(-16px) rotate(0.5deg)} }
        @keyframes cardFloatB { 0%,100%{transform:translateY(0) rotate(0.7deg)} 50%{transform:translateY(-20px) rotate(-0.6deg)} }
        @keyframes cardSheen { 0%{background-position:-160% 0} 60%,100%{background-position:160% 0} }
        @keyframes logoShimmer {
          0%,100%{ filter: drop-shadow(0 0 14px rgba(210,225,255,0.4)) brightness(1); transform: scale(1); }
          25%{ filter: drop-shadow(0 0 34px rgba(255,255,255,0.85)) brightness(1.24); }
          50%{ filter: drop-shadow(0 0 60px rgba(225,238,255,1)) brightness(1.5); transform: scale(1.03); }
          75%{ filter: drop-shadow(0 0 34px rgba(255,255,255,0.85)) brightness(1.24); }
        }
        .hall-logo{ animation: logoShimmer 2.6s ease-in-out infinite; will-change: filter, transform; }
        .shop-glass{ position:relative; overflow:hidden; }
        .shop-glass::after{ content:''; position:absolute; inset:0; border-radius:inherit; pointer-events:none;
          background:linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.14) 48%, transparent 66%);
          background-size:220% 100%; animation:cardSheen 7s ease-in-out infinite; }
        @keyframes jukeGlow { 0%,100%{ box-shadow:0 0 24px rgba(255,255,255,0.16), inset 0 0 22px rgba(255,255,255,0.05); } 50%{ box-shadow:0 0 40px rgba(255,255,255,0.32), inset 0 0 26px rgba(255,255,255,0.1); } }
        .juke-cab{ animation: jukeGlow 4.2s ease-in-out infinite; will-change: box-shadow; }
        @keyframes vinylSpin { to { transform: rotate(360deg); } }
        .vinyl-disc{ will-change: transform; }
        .vinyl-disc.spin{ animation: vinylSpin 3.4s linear infinite; }
        @keyframes wallShimmer { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .drop-wall-text{
          font-family:'Permanent Marker','Anton',cursive; font-weight:400;
          font-size:44px; line-height:0.92; letter-spacing:1px; text-align:center;
          white-space:nowrap; text-transform:uppercase; transform:rotate(-4deg);
          background:linear-gradient(100deg,#ff6ec7 0%,#fff 22%,#54e0ff 44%,#fff 62%,#ffd84a 80%,#ff6ec7 100%);
          background-size:280% 100%; -webkit-background-clip:text; background-clip:text;
          -webkit-text-fill-color:transparent; color:transparent;
          -webkit-text-stroke:3px rgba(15,10,20,0.85);
          filter:drop-shadow(0 6px 0 rgba(0,0,0,0.35)) drop-shadow(0 0 26px rgba(255,110,199,0.55));
          animation:wallShimmer 5s linear infinite; will-change:background-position;
        }
      `}</style>

      {/* ── Sotheby's provenance — floating glass card, fades in mid-hall ── */}
      <div ref={sothRef} style={{ ...quoteWrap, left: 'clamp(20px,6vw,80px)' }}>
        <a href={SOTHEBYS_URL} target="_blank" rel="noopener noreferrer" className="shop-glass" style={{ ...glassCard, display: 'block', color: 'inherit', textDecoration: 'none', pointerEvents: 'auto', animation: 'cardFloatA 11s ease-in-out infinite' }}>
          <div style={{ fontFamily: serif, fontWeight: 400, fontSize: 'clamp(28px,4vw,54px)', letterSpacing: -1, lineHeight: 1, marginBottom: 18, color: '#fff' }}>Sotheby’s</div>
          <p style={{ fontFamily: serif, fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(17px,2.1vw,27px)', lineHeight: 1.36, margin: '0 0 18px', color: '#fff' }}>
            “…her signature Ink Interventions — imagined by AI from Simpson’s gestural mark-making and intricate hand-drawn compositions — with ethereal visuals of tulle-like curtains, suburban shadows, and the sleek, gliding presence of drones.”
          </p>
          <div style={label}><i>Les Drones de la Banlieue</i>, Contemporary Discoveries, New York, 2025 →</div>
        </a>
      </div>

      {/* ── Jason Bailey / Artnome — floating glass card, fades in deeper ── */}
      <div ref={baileyRef} style={{ ...quoteWrap, right: 'clamp(20px,6vw,80px)', textAlign: 'right' }}>
        <div className="shop-glass" style={{ ...glassCard, animation: 'cardFloatB 13s ease-in-out infinite' }}>
          <p style={{ fontFamily: serif, fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(18px,2.3vw,30px)', lineHeight: 1.38, margin: '0 0 18px', color: '#fff' }}>
            “When I added Miss AL Simpson’s <i>Modern Love</i> to my collection about one year ago, I wrote that it reminds me of one of Richard Prince’s Nurses getting enveloped by a Clyfford Still.”
          </p>
          <div style={label}>Jason Bailey — Artnome</div>
        </div>
      </div>

      {/* ── Sotheby's · AI Cinema entrance — a second provenance card fading in as you cross into the cinema zone ── */}
      <div ref={cinemaSothRef} style={{ ...quoteWrap, right: 'clamp(20px,6vw,80px)', textAlign: 'right' }}>
        <a href={SOTHEBYS_URL} target="_blank" rel="noopener noreferrer" className="shop-glass" style={{ ...glassCard, display: 'block', color: 'inherit', textDecoration: 'none', pointerEvents: 'auto', animation: 'cardFloatB 12s ease-in-out infinite' }}>
          <div style={{ fontFamily: serif, fontWeight: 400, fontSize: 'clamp(28px,4vw,54px)', letterSpacing: -1, lineHeight: 1, marginBottom: 18, color: '#fff' }}>Sotheby’s</div>
          <p style={{ fontFamily: serif, fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(17px,2.1vw,27px)', lineHeight: 1.36, margin: '0 0 18px', color: '#fff' }}>
            “Miss AL Simpson’s ‘Les Drones de la Banlieue’ is a spellbinding AI video artwork that captures a flowing, dreamlike journey through the suburbs and landmarks of Paris…”
          </p>
          <div style={label}>Contemporary Discoveries, New York, 2025 →</div>
        </a>
      </div>

      {/* ── Bonhams · London exhibition — CYBAROQUE BORGHESE, fades in just before the collage rooms ── */}
      <div ref={bonhamsRef} style={{ ...quoteWrap, left: 'clamp(20px,6vw,80px)', maxWidth: 'min(600px,86vw)' }}>
        <div className="shop-glass" style={{ ...glassCard, background: 'rgba(8,9,14,0.78)', border: '1px solid rgba(255,255,255,0.14)', pointerEvents: 'auto', animation: 'cardFloatA 13s ease-in-out infinite' }}>
          <div style={{ fontFamily: serif, fontWeight: 400, fontSize: 'clamp(20px,2.4vw,32px)', letterSpacing: -1, lineHeight: 1, marginBottom: 10, color: '#fff' }}>Bonhams</div>
          <p style={{ fontFamily: serif, fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(11.5px,1.3vw,15px)', lineHeight: 1.45, margin: '0 0 12px', color: '#fff' }}>
            “In the present work, the collaged ‘mixed media’ of Miss AL Simpson’s digital frame conjures the train carriages and side-streets of Manhattan’s Lower East Side. It is this insurgent self-governance of the Crypto Art movement that has always appealed to Simpson – an opportunity to establish new norms in the creation and circulation of the art object. Evoking the brash canvases of Basquiat, Rauschenberg, and Kippenberger, the digital passages of CYBAROQUE BORGHESE engage in a litany of dialogues with Classical and Contemporary motifs. In this digital avant-garde, Miss AL Simpson has become one of the chief protagonists of this new movement, compressing history and styles to produce some of the most dramatic and compelling works to be tokenized to date.”
          </p>
          <div style={{ ...label, marginBottom: 14 }}>Bonhams × SuperRare · CryptOGs: The Pioneers of NFT Art · London, 2021</div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            <a href={BONHAMS_URL} target="_blank" rel="noopener noreferrer" style={{ ...label, color: '#fff', textDecoration: 'none', pointerEvents: 'auto', borderBottom: '1px solid rgba(255,255,255,0.45)', paddingBottom: 2 }}>View at Bonhams →</a>
            <a href={BORGHESE_SUPERRARE_URL} target="_blank" rel="noopener noreferrer" style={{ ...label, color: '#fff', textDecoration: 'none', pointerEvents: 'auto', borderBottom: '1px solid rgba(255,255,255,0.45)', paddingBottom: 2 }}>Own it on SuperRare →</a>
          </div>
        </div>
      </div>

      {/* ── Victoria and the Doge Army — hero-piece caption at the collage room’s end ── */}
      <div ref={victoriaRef} style={{ position: 'absolute', bottom: 'clamp(70px,12vh,120px)', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', maxWidth: 'min(680px,90vw)', opacity: 0, transition: 'opacity .15s linear', pointerEvents: 'none' }}>
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 'clamp(26px,4vw,52px)', letterSpacing: -1, lineHeight: 1, color: '#fff', marginBottom: 10 }}>Victoria and the Doge Army</div>
        <div style={{ ...label, color: 'rgba(255,255,255,0.8)' }}>One of her most celebrated works</div>
      </div>

      {/* Controls hint (fades as you enter) */}
      <div ref={hintRef} style={{ position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)', ...label, fontSize: 10, color: 'rgba(255,255,255,0.55)', pointerEvents: 'none', textAlign: 'center', transition: 'opacity .15s linear' }}>
        Move to look · hold or scroll to walk right through · centre a work in the ✛ & click · <span style={{ color: 'rgba(255,255,255,0.8)' }}>ESC to exit</span>
      </div>

      {/* ESC — stop the glide / leave the immersive entrance */}
      <button
        onClick={() => navigate('/portfolio/works')}
        title="Exit the immersive entrance (Esc)"
        style={{
          position: 'absolute', top: 'clamp(90px,16vh,150px)', right: 'clamp(20px,6vw,80px)',
          display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer',
          fontFamily: mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#fff',
          background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.4)', borderRadius: 999, padding: '10px 16px',
        }}
      >
        <span style={{ fontSize: 13, lineHeight: 1 }}>✕</span> Esc · Exit
      </button>

      {/* Jukebox — pick a track from the Drones of Suburbia album; the cabinet cascades shut on select */}
      <div style={{ position: 'absolute', bottom: 'clamp(84px,14vh,120px)', left: 'clamp(20px,6vw,80px)', zIndex: 5 }}>
        <div style={{
          maxHeight: jukeOpen ? '44vh' : 0, opacity: jukeOpen ? 1 : 0, overflow: 'hidden',
          marginBottom: jukeOpen ? 12 : 0, pointerEvents: jukeOpen ? 'auto' : 'none',
          transformOrigin: 'bottom center', transform: jukeOpen ? 'translateY(0) scaleY(1)' : 'translateY(10px) scaleY(0.82)',
          transition: 'max-height .42s cubic-bezier(.16,1,.3,1), opacity .28s ease, transform .42s cubic-bezier(.16,1,.3,1), margin-bottom .38s ease',
        }}>
          <div className="juke-cab" style={{
            width: 300, maxWidth: '80vw',
            background: 'linear-gradient(180deg, rgba(20,20,20,0.88) 0%, rgba(8,8,8,0.88) 100%)',
            backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(255,255,255,0.4)', borderRadius: '46px 46px 16px 16px', overflow: 'hidden',
          }}>
            {/* arched marquee — the album header */}
            <div style={{
              textAlign: 'center', padding: '18px 16px 13px',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.12), transparent)',
              borderBottom: '1px solid rgba(255,255,255,0.2)',
            }}>
              <div style={{ fontFamily: mono, fontSize: 8.5, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 5 }}>The Album</div>
              <div style={{ fontFamily: serif, fontWeight: 800, fontSize: 18, letterSpacing: 1, lineHeight: 1, textTransform: 'uppercase', color: '#fff', textShadow: '0 0 18px rgba(255,255,255,0.4)' }}>Drones of<br/>Suburbia</div>
            </div>
            <div style={{ maxHeight: '36vh', overflowY: 'auto', padding: '7px' }}>
              {ALBUM_TRACKS.map((tk, i) => (
                <button key={tk.src}
                  onClick={() => { setTrackIdx(i); setMusicOn(true); setJukeOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', cursor: 'pointer',
                    background: i === trackIdx ? 'rgba(255,255,255,0.14)' : 'transparent', border: 'none', borderRadius: 10,
                    padding: '9px 12px', color: i === trackIdx ? '#fff' : 'rgba(255,255,255,0.72)',
                    fontFamily: mono, fontSize: 11, letterSpacing: 0.4,
                  }}>
                  <span style={{ width: 16, fontSize: 10, color: i === trackIdx && musicOn ? '#fff' : 'rgba(255,255,255,0.45)' }}>{i === trackIdx ? (musicOn ? '▶' : '❚❚') : String(i + 1).padStart(2, '0')}</span>
                  <span style={{ flex: 1 }}>{tk.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* The record player — spins the Drones of Suburbia vinyl while playing.
            Click the disc to play/pause; click the title to flip through tracks. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => setMusicOn(v => !v)}
            title={musicOn ? 'Pause' : 'Play'}
            style={{
              position: 'relative', width: 108, height: 108, padding: 0, border: 'none', borderRadius: '50%',
              cursor: 'pointer', background: 'transparent', flexShrink: 0,
              filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.55))',
            }}
          >
            {/* vinyl — black & white */}
            <div className={`vinyl-disc${musicOn ? ' spin' : ''}`} style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'radial-gradient(circle at 50% 50%, #1c1c1c 0 22%, #060606 22% 24%, #191919 24% 27%, #060606 27% 30%, #191919 30% 33%, #060606 33% 36%, #191919 36% 40%, #060606 40% 44%, #131313 44% 100%)',
              border: '1px solid rgba(255,255,255,0.35)',
            }}>
              {/* label */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                width: 52, height: 52, borderRadius: '50%',
                background: 'linear-gradient(180deg, #f2f2f2, #cfcfcf)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.25)',
              }}>
                <div style={{ fontFamily: serif, fontWeight: 800, fontSize: 9, lineHeight: 1.05, textAlign: 'center', color: '#0a0a0a', textTransform: 'uppercase', letterSpacing: 0.3 }}>Drones<br/>of<br/>Suburbia</div>
                <div style={{ position: 'absolute', width: 4, height: 4, borderRadius: '50%', background: '#0a0a0a' }} />
              </div>
            </div>
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
            <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: 2.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>{musicOn ? 'Now Playing' : 'Paused'}</div>
            <button
              onClick={() => setJukeOpen(v => !v)}
              title="Choose a track"
              style={{
                display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', padding: 0, border: 'none', background: 'transparent',
                fontFamily: serif, fontWeight: 700, fontSize: 13, letterSpacing: 0.3, color: '#fff', textAlign: 'left', maxWidth: '46vw',
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{collageMusic ? COLLAGE_TRACK.title : ALBUM_TRACKS[trackIdx].title}</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', transform: jukeOpen ? 'rotate(180deg)' : 'none', transition: 'transform .3s ease' }}>▲</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quiet way into the flat catalogue */}
      <Link to="/portfolio/works" style={{
        position: 'absolute', bottom: 'clamp(48px,9vh,74px)', right: 'clamp(20px,6vw,80px)',
        fontFamily: mono, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#fff',
        textDecoration: 'none', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 999, padding: '11px 22px',
        background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
      }}>
        Enter the catalogue →
      </Link>
    </div>
  );
}
