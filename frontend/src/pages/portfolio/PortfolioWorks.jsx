import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { years, totals, thumb, resolveImg } from '../../config/portfolioData';
import { usePortfolio } from './PortfolioContext';
import { c, serif, mono, caption } from './portfolioStyle';

// Works — her 1/1s, listed by year (institutional convention). The index page.
// A filterable, masonry-flowing catalogue: pick a year to focus, or browse all.
export default function PortfolioWorks() {
  const { openWork } = usePortfolio();
  const [activeYear, setActiveYear] = useState(null); // null = all years
  const [compact, setCompact] = useState(false); // dense thumbnail grid vs big editorial columns
  const shown = activeYear ? years.filter(y => y.year === activeYear) : years;

  // ── Parallax timeline: each year carries a GIANT translucent numeral behind
  // its grid that DRIFTS vertically as you scroll (slower than the works) and
  // brightens as the year passes through the middle of the viewport — so the
  // flat year-stack reads as a moving timeline of year-stamps. One shared,
  // rAF-throttled scroll loop drives every band (bands register via callback ref).
  const bandsRef = useRef(new Map());
  const register = year => node => {
    const map = bandsRef.current;
    if (node) map.set(year, { el: node, ghost: node.querySelector('[data-ghost]') });
    else map.delete(year);
  };

  // Per-tile 3D parallax registry. Every work tile registers a mutable entry
  // { el, depth, on }; a work's own IntersectionObserver flips `on` while it's
  // near the viewport, so the shared scroll loop only reads the layout of tiles
  // that are actually on screen (cheap). `depth` (0..1) places the tile on a
  // layer — deeper tiles sit further back (translateZ) and drift slower, so the
  // whole catalogue floats and parallaxes as a field of works in 3D space.
  const tilesRef = useRef(new Map());
  const mouseRef = useRef({ x: 0, y: 0 });   // normalised cursor (-1..1) for look-around parallax
  const regTile = useCallback(id => {
    const entry = { el: null, depth: 0, on: false };
    tilesRef.current.set(id, entry);
    return {
      set: (el, depth) => { entry.el = el; entry.depth = depth; },
      setOn: v => { entry.on = v; },
      remove: () => tilesRef.current.delete(id),
    };
  }, []);

  useEffect(() => {
    let raf = 0, queued = false;
    const vw = () => window.innerWidth;
    const update = () => {
      queued = false;
      const vh = window.innerHeight, w = vw();
      const mx = mouseRef.current.x, my = mouseRef.current.y;   // -1..1 cursor position
      // Drifting year-stamp backdrops.
      bandsRef.current.forEach(({ el, ghost }) => {
        if (!el || !ghost || !el.isConnected) return;
        const r = el.getBoundingClientRect();
        const p = (vh - r.top) / (vh + r.height);            // 0 entering bottom → 1 leaving top
        const shift = (0.5 - p) * 620;
        const xshift = (p - 0.5) * 90;
        ghost.style.transform = `translate(${xshift.toFixed(1)}px, calc(-50% + ${shift.toFixed(1)}px))`;
        ghost.style.opacity = (0.05 + Math.max(0, 1 - Math.abs(p - 0.5) * 2) * 0.13).toFixed(3);
      });
      // Every on-screen work tile lives in a real 3D field: pushed back on a
      // depth layer (translateZ, foreshortened by the container's perspective),
      // angled toward the centre like a curved wall (rotateY from its column),
      // drifting vertically as you scroll AND swinging with the cursor (deeper
      // tiles parallax more) — so moving the mouse lets you look INTO the space.
      tilesRef.current.forEach(entry => {
        const { el, depth, on } = entry;
        if (!on || !el || !el.isConnected) return;
        const r = el.getBoundingClientRect();
        const p = (vh - r.top) / (vh + r.height);            // 0..1 through the viewport
        const nx = ((r.left + r.width / 2) / w) * 2 - 1;     // -1 left … 1 right of screen
        const z = -60 - depth * 440;                          // deep spread, everything set back
        const y = (0.5 - p) * (50 + depth * 190)              // scroll drift, depth-scaled
                  + my * (8 + depth * 50);                    // + cursor tilt (vertical)
        const x = -nx * (6 + depth * 22)                      // gentle pull toward centre → curved wall
                  + mx * (10 + depth * 60);                   // + cursor parallax (horizontal)
        const ry = -nx * (3 + depth * 6) + mx * 5;            // yaw: face the viewer / follow cursor
        const rx = (p - 0.5) * 6 - my * 4;                    // pitch as it passes / follows cursor
        el.style.transform =
          `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(0)}px) rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg)`;
      });
    };
    const kick = () => { if (!queued) { queued = true; raf = requestAnimationFrame(update); } };
    const onMove = e => {
      mouseRef.current.x = (e.clientX / vw()) * 2 - 1;
      mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
      kick();
    };
    update();
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('scroll', kick);
      window.removeEventListener('resize', kick);
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [activeYear, compact]);

  return (
    <div>
      <Helmet>
        <title>Selected Works — Miss AL Simpson</title>
        <meta name="description" content={`The on-chain catalogue of Miss AL Simpson — ${totals.works.toLocaleString()} works by year, 2015–${totals.lastYear}. Collage, ink and machine intelligence; exhibited at Sotheby’s, New York, and Bonhams, London.`} />
      </Helmet>
      {/* ── Statement ── */}
      <section style={{ padding: '72px 0 52px', maxWidth: 900 }}>
        <div style={{ ...caption, marginBottom: 18 }}>Miss AL Simpson · 2015—{totals.lastYear}</div>
        <h1 style={{
          fontFamily: serif, fontWeight: 800, fontSize: 'clamp(52px,11vw,150px)',
          lineHeight: 0.9, letterSpacing: -2, textTransform: 'uppercase',
          margin: '0 0 32px',
        }}>
          Selected<br />Works
        </h1>
        <p style={{ fontFamily: serif, fontSize: 17, lineHeight: 1.7, color: c.faint, margin: 0, maxWidth: 760 }}>
          An award-winning Scottish artist and founder working at the threshold of collage, ink and
          machine intelligence. Across a body of {totals.works.toLocaleString()} works, her practice
          interrogates surveillance, the posthuman feminine gaze and the autonomy of women in digital
          space — exhibited and sold at Sotheby’s, New York, and Bonhams, London.
        </p>
        <div style={{ display: 'flex', gap: 40, marginTop: 40, flexWrap: 'wrap' }}>
          <Stat n={totals.works.toLocaleString()} label="works" />
          <Stat n={totals.projects} label="series & worlds" />
          <Stat n={`2015–${totals.lastYear}`} label="years active" />
        </div>
      </section>

      {/* ── Sticky year filter rail ── */}
      <div style={{
        position: 'sticky', top: 70, zIndex: 20, background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)', borderTop: `1px solid ${c.line}`, borderBottom: `1px solid ${c.line}`,
        margin: '0 calc(50% - 50vw)', padding: '12px clamp(20px,5vw,56px)',
        display: 'flex', gap: 10, overflowX: 'auto', alignItems: 'center',
      }}>
        <Chip label="All" active={!activeYear} onClick={() => setActiveYear(null)} />
        {years.map(({ year, works }) => (
          <Chip key={year} label={`${year}`} count={works.length} active={activeYear === year} onClick={() => setActiveYear(year)} />
        ))}
        {/* Density toggle — pinned to the right of the rail */}
        <button
          onClick={() => setCompact(v => !v)}
          title={compact ? 'Switch to large view' : 'Switch to compact grid'}
          style={{
            flex: '0 0 auto', marginLeft: 'auto', cursor: 'pointer', fontFamily: mono, fontSize: 11,
            letterSpacing: 1, textTransform: 'uppercase', padding: '7px 14px', borderRadius: 999,
            border: `1px solid ${c.ink}`, background: 'transparent', color: c.ink,
            display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap',
          }}
        >
          <GridIcon dense={!compact} />
          {compact ? 'Large' : 'Compact'}
        </button>
      </div>

      {/* ── Works by year — a parallax timeline ── */}
      {shown.map(({ year, works }) => (
        <section key={year} ref={register(year)} style={{ position: 'relative', padding: '44px 0 8px' }}>
          {/* Giant drifting year-stamp behind the grid (rAF scroll loop sets its
              transform + opacity). Clipped by its own overflow:hidden wrapper so
              the <section> itself is NOT a scroll container — that keeps the
              sticky year heading below working. Aria-hidden. */}
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
            <div data-ghost style={{
              position: 'absolute', top: '50%', right: 'clamp(-40px,-3vw,0px)',
              fontFamily: serif, fontWeight: 800, fontSize: 'clamp(200px,38vw,520px)',
              lineHeight: 0.8, letterSpacing: -10, color: c.ink, opacity: 0.05,
              transform: 'translate(0,-50%)', whiteSpace: 'nowrap', userSelect: 'none',
            }}>{year}</div>
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Sticky year heading — pins while the year's works scroll past it,
                so the flat stack reads as a moving timeline (a real parallax feel
                in every browser, no rAF required). */}
            <div style={{
              position: 'sticky', top: 84, zIndex: 5,
              display: 'flex', alignItems: 'baseline', gap: 18, marginBottom: 26, flexWrap: 'wrap',
              mixBlendMode: 'multiply', pointerEvents: 'none',
            }}>
              <h2 style={{
                fontFamily: serif, fontWeight: 800, margin: 0, lineHeight: 0.9,
                fontSize: 'clamp(48px,9vw,104px)', color: c.ink, letterSpacing: -2,
              }}>{year}</h2>
              <span style={caption}>{works.length} work{works.length === 1 ? '' : 's'}</span>
            </div>
            {/* Masonry flow — images keep their natural shape, no awkward gaps.
                Wide columns read big and full; compact mode packs many small tiles. */}
            <div style={{
              columnWidth: compact ? 168 : 360,
              columnGap: compact ? 10 : 'clamp(16px,2vw,30px)',
              perspective: 1000, perspectiveOrigin: '50% 45%', transformStyle: 'preserve-3d',
            }}>
              {works.map((w, i) => (
                <Thumb
                  key={w.id} w={w} compact={compact} eager={i < 12}
                  depth={((i * 7) % 10) / 10}
                  regTile={regTile}
                  onClick={() => openWork(w)}
                />
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

function Chip({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: '0 0 auto', cursor: 'pointer', fontFamily: mono, fontSize: 11, letterSpacing: 1,
        textTransform: 'uppercase', padding: '7px 14px', borderRadius: 999,
        border: `1px solid ${active ? c.ink : c.line}`,
        background: active ? c.ink : 'transparent', color: active ? c.paper : c.faint,
        transition: 'all .2s', whiteSpace: 'nowrap',
      }}
    >
      {label}{count != null && <span style={{ opacity: 0.55, marginLeft: 6 }}>{count}</span>}
    </button>
  );
}

// Little square-grid glyph for the density toggle — denser dots when the button
// will switch INTO compact, a 2×2 when it'll switch back to large.
function GridIcon({ dense }) {
  const n = dense ? 3 : 2;
  const gap = dense ? 1.5 : 2.5;
  const s = (12 - gap * (n - 1)) / n;
  const cells = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++)
    cells.push(<rect key={`${x}-${y}`} x={x * (s + gap)} y={y * (s + gap)} width={s} height={s} fill="currentColor" />);
  return <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">{cells}</svg>;
}

function Stat({ n, label }) {
  return (
    <div>
      <div style={{ fontFamily: serif, fontSize: 30 }}>{n}</div>
      <div style={caption}>{label}</div>
    </div>
  );
}

function Thumb({ w, compact = false, eager = false, depth = 0, regTile, onClick }) {
  // Source the FULL-RES original (w.image), not w.thumbnail — the thumbnail is a
  // ~500px Alchemy crop, so asking the CDN to enlarge it just upscales blur. The
  // wsrv CDN downsizes the original to a crisp, light WebP — small in compact mode.
  const img = thumb(w.image || w.thumbnail, compact ? 360 : 1200);
  const video = resolveImg(w.animation);
  const [hover, setHover] = useState(false);
  const figRef = useRef(null);
  const plxRef = useRef(null);   // parent-controlled 3D-parallax wrapper
  const vidRef = useRef(null);
  const [shown, setShown] = useState(eager); // scroll-reveal — eager tiles show at once

  // Register this tile in the parent's 3D-parallax registry (stable handle per id).
  const handle = useMemo(() => (regTile ? regTile(w.id) : null), [regTile, w.id]);
  useEffect(() => {
    if (handle && plxRef.current) handle.set(plxRef.current, depth);
    return () => handle && handle.remove();
  }, [handle, depth]);

  // One observer per tile: reveals the tile (fade/rise in), toggles the tile's
  // parallax `on` flag (so the parent only transforms on-screen tiles), and for
  // animated works plays the video while near the viewport, pauses on exit.
  // The <video> always carries its src (preload="none" → no download until it
  // plays), so play() never races an un-committed src.
  useEffect(() => {
    if (!figRef.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setShown(true);
      handle && handle.setOn(e.isIntersecting);
      const v = vidRef.current;
      if (!v) return;
      if (e.isIntersecting) v.play?.().catch(() => {});
      else v.pause?.();
    }, { rootMargin: '300px' });
    io.observe(figRef.current);
    return () => io.disconnect();
  }, [video, handle]);

  return (
    <figure
      ref={figRef}
      style={{
        margin: compact ? '0 0 10px' : '0 0 clamp(14px,1.6vw,24px)', cursor: 'pointer', breakInside: 'avoid', position: 'relative',
        opacity: shown ? 1 : 0,
        transition: 'opacity .6s ease',
      }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Parent sets translate3d() on this wrapper each scroll frame (3D depth
          drift). It floats within the figure's static layout box so the masonry
          packing never shifts. willChange hints the compositor. */}
      <div ref={plxRef} style={{ willChange: 'transform', transformStyle: 'preserve-3d' }}>
      <div style={{
        background: '#f4f4f4', overflow: 'hidden', minHeight: 60, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: hover ? '0 18px 40px rgba(0,0,0,0.22)' : '0 0 0 rgba(0,0,0,0)',
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'box-shadow .35s ease, transform .35s ease',
      }}>
        {video ? (
          <video
            ref={vidRef}
            src={video}
            poster={img || undefined}
            loop muted playsInline preload="none"
            style={{
              width: '100%', height: 'auto', display: 'block',
              transition: 'transform .5s ease', transform: hover ? 'scale(1.05)' : 'scale(1)',
            }}
          />
        ) : img ? (
          <img
            src={img} alt={w.title} loading="lazy"
            style={{
              width: '100%', height: 'auto', display: 'block',
              transition: 'transform .5s ease', transform: hover ? 'scale(1.05)' : 'scale(1)',
            }}
          />
        ) : <span style={{ ...caption, padding: '40px 0' }}>—</span>}

        {/* Hover overlay — title + collection rise out of the bottom */}
        <figcaption style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, padding: '28px 12px 12px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.78), rgba(0,0,0,0))',
          opacity: hover ? 1 : 0, transform: hover ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity .25s, transform .25s', pointerEvents: 'none',
        }}>
          <div style={{ fontFamily: serif, fontSize: 14, color: '#fff', lineHeight: 1.25 }}>{w.title}</div>
          {w.collection && (
            <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
              {w.collection}
            </div>
          )}
        </figcaption>
      </div>
      </div>
    </figure>
  );
}
