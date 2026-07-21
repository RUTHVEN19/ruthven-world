import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import CosmosScene from './cosmos/CosmosScene';
import { usePortfolio } from './PortfolioContext';
import { mono } from './portfolioStyle';

const OVERVIEW = { id: 'overview' };

// The 3D world: years + projects as planets. Same catalogue as the museum;
// picking a work opens the shared lightbox.
export default function PortfolioCosmos() {
  const { openWork } = usePortfolio();
  const [focus, setFocus] = useState(OVERVIEW);
  const [project, setProject] = useState(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const reset = () => { setFocus(OVERVIEW); setProject(null); };

  return (
    <div style={{ position: 'relative', height: 'calc(100vh - 72px)', background: '#05060a' }}>
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 18, 46], fov: 55, near: 0.1, far: 200 }}
          dpr={[1, 1.8]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <CosmosScene
            focus={focus}
            setFocus={setFocus}
            onSelectProject={setProject}
            onPick={openWork}
          />
        </Canvas>
      </Suspense>

      {/* ── hint ── */}
      <div style={{
        position: 'absolute', top: 18, left: 22, pointerEvents: 'none',
        fontFamily: mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
        color: 'rgba(180,200,220,0.6)', lineHeight: 1.8,
      }}>
        {focus.id === 'overview'
          ? 'Drag to orbit · click a planet to fly in'
          : 'Click a work to view · drag to orbit'}
      </div>

      {/* ── reset ── */}
      {focus.id !== 'overview' && (
        <button
          onClick={reset}
          style={{
            position: 'absolute', top: 16, right: 22,
            fontFamily: mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
            color: '#fff', background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.25)', padding: '8px 16px',
            borderRadius: 999, cursor: 'pointer', backdropFilter: 'blur(6px)',
          }}
        >
          ← Overview
        </button>
      )}

      {/* ── project card ── */}
      {project && (
        <div style={{
          position: 'absolute', bottom: 28, left: 22, maxWidth: 360,
          background: 'rgba(10,12,18,0.82)', border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(10px)', padding: '20px 22px', color: '#e6ecf5',
        }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, marginBottom: 6 }}>{project.name}</div>
          <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#8aa0b8', marginBottom: 12 }}>
            {project.medium} · {project.count.toLocaleString()} works
          </div>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 14, lineHeight: 1.6, color: '#b8c4d4', margin: '0 0 14px' }}>
            {project.blurb}
          </p>
          {project.world && (
            <a href={project.world} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#fff', borderBottom: '1px solid #fff', textDecoration: 'none', paddingBottom: 3 }}>
              Enter the world →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
