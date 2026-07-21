import { useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import GalleryScene from './gallery/GalleryScene';
import { usePortfolio } from './PortfolioContext';
import { projects, getProjectWorks, thumb } from '../../config/portfolioData';
import { mono, serif } from './portfolioStyle';

const LOBBY = { id: 'lobby' };

// The walkable white-cube gallery: a room per collection. Same catalogue as the
// museum; picking a work opens the shared lightbox.
export default function PortfolioGallery() {
  const { openWork } = usePortfolio();
  const [focus, setFocus] = useState(LOBBY);
  const [project, setProject] = useState(null);
  const [browse, setBrowse] = useState(null);   // project whose full grid is open

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const rooms = useMemo(() => projects, []);
  const reset = () => { setFocus(LOBBY); setProject(null); };
  const enter = p => { setFocus({ id: `room-${p.slug}` }); setProject(p); };

  return (
    <div style={{ position: 'relative', height: 'calc(100vh - 72px)', background: '#f3f1ec' }}>
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 1.7, 1.6], fov: 62, near: 0.1, far: 200 }}
          dpr={[1, 1.8]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <GalleryScene
            focus={focus}
            setFocus={setFocus}
            onSelectProject={setProject}
            onPick={openWork}
          />
        </Canvas>
      </Suspense>

      {/* ── hint ── */}
      <div style={{
        position: 'absolute', top: 18, left: 22, pointerEvents: 'none', zIndex: 6,
        fontFamily: mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
        color: 'rgba(30,30,30,0.55)', lineHeight: 1.8,
      }}>
        {focus.id === 'lobby'
          ? 'W / ↑ walk · ← → turn · drag to look · click a cover to enter that room →'
          : 'W / ↑ walk · ← → turn · drag to look · click a work to walk up · click again for full view'}
      </div>

      {/* ── room index (always-available navigation) ── */}
      <div style={{
        position: 'absolute', top: 16, right: 16, bottom: 16, width: 210, zIndex: 5,
        overflowY: 'auto', background: 'rgba(255,255,255,0.9)',
        border: '1px solid rgba(0,0,0,0.1)', backdropFilter: 'blur(8px)',
        padding: '14px 12px',
      }}>
        <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#8a8578', marginBottom: 10 }}>
          Rooms · {rooms.length}
        </div>
        <button onClick={reset} style={roomBtn(focus.id === 'lobby')}>
          ◍ Foyer
        </button>
        {rooms.map(p => (
          <button key={p.slug} onClick={() => enter(p)} style={roomBtn(focus.id === `room-${p.slug}`)}>
            <span style={{ fontFamily: serif, fontSize: 14 }}>{p.name}</span>
            <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: 1, color: '#9a9a9a', display: 'block', marginTop: 2 }}>
              {p.count.toLocaleString()} works
            </span>
          </button>
        ))}
      </div>

      {/* ── reset ── */}
      {focus.id !== 'lobby' && (
        <button onClick={reset} style={{
          position: 'absolute', top: 16, left: 22, zIndex: 6,
          fontFamily: mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
          color: '#1a1a1a', background: 'rgba(255,255,255,0.8)',
          border: '1px solid rgba(0,0,0,0.2)', padding: '8px 16px',
          borderRadius: 999, cursor: 'pointer', backdropFilter: 'blur(6px)',
        }}>
          ← Foyer
        </button>
      )}

      {/* ── room card ── */}
      {project && focus.id !== 'lobby' && (
        <div style={{
          position: 'absolute', bottom: 24, left: 22, maxWidth: 360, zIndex: 6,
          background: 'rgba(255,255,255,0.86)', border: '1px solid rgba(0,0,0,0.12)',
          backdropFilter: 'blur(10px)', padding: '20px 22px', color: '#1a1a1a',
        }}>
          <div style={{ fontFamily: serif, fontSize: 22, marginBottom: 6 }}>{project.name}</div>
          <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#7a7a7a', marginBottom: 12 }}>
            {project.medium} · {project.count.toLocaleString()} works
          </div>
          <p style={{ fontFamily: serif, fontSize: 14, lineHeight: 1.6, color: '#4a4a4a', margin: '0 0 14px' }}>
            {project.blurb}
          </p>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setBrowse(project)}
              style={{ fontFamily: mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#1a1a1a', background: 'none', border: 'none', borderBottom: '1px solid #1a1a1a', cursor: 'pointer', padding: '0 0 3px' }}>
              Browse all {project.count.toLocaleString()} →
            </button>
            {project.world && (
              <a href={project.world} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#7a7a7a', borderBottom: '1px solid #cfcfcf', textDecoration: 'none', paddingBottom: 3 }}>
                Enter the world →
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── browse-all overlay: every work in the collection, thumbnails → lightbox ── */}
      {browse && (
        <BrowseAll project={browse} onClose={() => setBrowse(null)} onPick={openWork} />
      )}
    </div>
  );
}

// Scrollable grid of EVERY work in a collection (not just the room's hung sample).
// Light WebP thumbnails, lazy-loaded; clicking one opens the shared lightbox.
function BrowseAll({ project, onClose, onPick }) {
  const works = useMemo(() => getProjectWorks(project.slug), [project.slug]);
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(244,242,237,0.97)',
      backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        padding: '20px clamp(20px,4vw,40px)', borderBottom: '1px solid rgba(0,0,0,0.1)',
      }}>
        <div>
          <span style={{ fontFamily: serif, fontSize: 24, color: '#1a1a1a' }}>{project.name}</span>
          <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#8a8578', marginLeft: 14 }}>
            {works.length.toLocaleString()} shown · {project.count.toLocaleString()} minted
          </span>
        </div>
        <button onClick={onClose} style={{
          fontFamily: mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
          color: '#1a1a1a', background: 'none', border: '1px solid rgba(0,0,0,0.3)',
          borderRadius: 999, padding: '8px 16px', cursor: 'pointer',
        }}>
          ✕ Back to room
        </button>
      </div>
      <div style={{
        flex: 1, overflowY: 'auto', padding: 'clamp(16px,3vw,32px)',
        display: 'grid', gap: 'clamp(8px,1vw,14px)',
        gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(120px,14vw,180px), 1fr))',
        alignContent: 'start',
      }}>
        {works.map(w => (
          <button key={w.id} onClick={() => onPick(w)} title={w.title}
            style={{ padding: 0, border: 'none', background: '#e6e4dd', cursor: 'pointer', aspectRatio: '1 / 1', overflow: 'hidden' }}>
            <img src={thumb(w.thumbnail || w.image, 240)} alt={w.title} loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
          </button>
        ))}
      </div>
    </div>
  );
}

const roomBtn = active => ({
  display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer',
  background: active ? '#1a1a1a' : 'transparent', color: active ? '#fff' : '#333',
  border: 'none', borderBottom: '1px solid rgba(0,0,0,0.07)',
  padding: '9px 8px', marginBottom: 2,
});
