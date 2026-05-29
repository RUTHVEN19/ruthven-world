import { useState, useEffect, useMemo, useCallback } from 'react';


const MONO = '"Space Mono", monospace';
const DISPLAY = '"Anton", sans-serif';
const PER_PAGE = 20;

const TRAIT_FIELDS = [
  { key: 'scene',        label: 'Scene' },
  { key: 'hair',         label: 'Hair' },
  { key: 'fashion',      label: 'Fashion' },
  { key: 'drone_type',   label: 'Drone Type' },
  { key: 'composition',  label: 'Composition' },
  { key: 'lighting',     label: 'Lighting' },
  { key: 'personality',  label: 'Personality' },
  { key: 'jewellery',    label: 'Jewellery' },
  { key: 'eyes',         label: 'Eyes' },
  { key: 'body_art',     label: 'Body Art' },
];

const FILTER_FIELDS = [...TRAIT_FIELDS]; // All traits filterable

/**
 * BoudoirBrowser — Browsable 2D grid of all 120 Drone Blondes with traits and filters.
 */
export default function BoudoirBrowser({ onSwitch3D }) {
  const [traits, setTraits] = useState(null);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(0);
  const [jumpTo, setJumpTo] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetch('/marilyns/traits.json?v=' + Date.now())
      .then(r => r.json())
      .then(setTraits)
      .catch(() => {});
  }, []);

  const filterOptions = useMemo(() => {
    if (!traits) return {};
    const opts = {};
    FILTER_FIELDS.forEach(f => {
      const vals = new Set();
      Object.values(traits).forEach(t => { if (t[f.key]) vals.add(t[f.key]); });
      opts[f.key] = [...vals].sort();
    });
    return opts;
  }, [traits]);

  const filtered = useMemo(() => {
    if (!traits) return [];
    const ids = [];
    for (let i = 1; i <= 120; i++) {
      const t = traits[String(i)];
      if (!t) continue;
      let pass = true;
      for (const [key, val] of Object.entries(filters)) {
        if (val && t[key] !== val) { pass = false; break; }
      }
      if (pass) ids.push(i);
    }
    return ids;
  }, [traits, filters]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageItems = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const handleFilter = useCallback((key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    setPage(0);
  }, []);

  const handleJump = useCallback(() => {
    const id = parseInt(jumpTo);
    if (id >= 1 && id <= 120) {
      const idx = filtered.indexOf(id);
      if (idx >= 0) {
        setPage(Math.floor(idx / PER_PAGE));
        setTimeout(() => {
          document.getElementById('blonde-card-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [jumpTo, filtered]);

  if (!traits) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: MONO, color: 'rgba(200,230,255,0.4)', fontSize: '12px', letterSpacing: '3px' }}>
        LOADING LOUNGE...
      </div>
    );
  }

  return (
    <div style={{ background: '#0e0e12', minHeight: '100%', padding: '24px', overflowY: 'auto' }}>
      <style>{`
        @keyframes boudoirShimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes dustFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-8px) scale(1.1); opacity: 0.6; }
        }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          fontFamily: MONO, fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase',
          color: 'rgba(200,230,255,0.4)', marginBottom: '6px',
        }}>
          120 Drone Blondes
        </div>
        <h1 style={{
          fontFamily: DISPLAY, fontSize: 'clamp(28px, 5vw, 42px)', letterSpacing: '3px',
          textTransform: 'uppercase', margin: 0,
          background: 'linear-gradient(110deg, #b0c8d4 0%, #ffffff 30%, #a8c0cc 55%, #ffffff 80%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          animation: 'boudoirShimmer 6s linear infinite',
        }}>
          The Drone Blondes
        </h1>
      </div>

      {onSwitch3D && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button onClick={onSwitch3D} style={{
            fontFamily: MONO, fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase',
            padding: '6px 18px', background: 'rgba(200,230,255,0.06)', border: '1px solid rgba(200,230,255,0.2)',
            color: 'rgba(200,230,255,0.6)', cursor: 'pointer', transition: 'all 0.3s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,230,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,230,255,0.06)'; e.currentTarget.style.color = 'rgba(200,230,255,0.6)'; }}
          >
            Enter 3D Lounge
          </button>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#666', marginBottom: '4px' }}>Jump to #</div>
          <input
            type="number" min="1" max="120" placeholder="e.g. 5"
            value={jumpTo}
            onChange={e => setJumpTo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleJump()}
            style={{
              background: '#151518', border: '1px solid #333', color: '#e0e8f0', padding: '7px 12px',
              fontFamily: MONO, fontSize: '12px', width: '100px',
            }}
          />
        </div>
        {FILTER_FIELDS.map(f => (
          <div key={f.key}>
            <div style={{ fontFamily: MONO, fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#666', marginBottom: '4px' }}>{f.label}</div>
            <select
              value={filters[f.key] || ''}
              onChange={e => handleFilter(f.key, e.target.value)}
              style={{
                background: '#151518', border: '1px solid #333', color: '#e0e8f0', padding: '7px 12px',
                fontFamily: MONO, fontSize: '12px', minWidth: '140px',
              }}
            >
              <option value="">All</option>
              {(filterOptions[f.key] || []).map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={navBtnStyle}>&#9664; Prev</button>
        <span style={{ fontFamily: MONO, fontSize: '11px', color: '#666', letterSpacing: '1px' }}>
          {filtered.length > 0 ? `${page * PER_PAGE + 1}–${Math.min((page + 1) * PER_PAGE, filtered.length)} of ${filtered.length}` : 'No matches'}
        </span>
        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={navBtnStyle}>Next &#9654;</button>
      </div>

      {/* Grid with diamond dust glow */}
      <div style={{ position: 'relative', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Diamond dust glow behind grid */}
        <div style={{
          position: 'absolute', inset: '-40px', zIndex: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 30%, rgba(180,200,220,0.06) 0%, rgba(140,170,200,0.03) 40%, transparent 70%)',
        }} />
        <div style={{
          position: 'relative', zIndex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
        }}>
        {pageItems.map(id => {
          const t = traits[String(id)];
          return (
            <div key={id} id={`blonde-card-${id}`} style={{
              background: '#18181c', border: '1px solid #2a2a30', overflow: 'hidden', transition: 'border-color 0.2s',
              boxShadow: '0 0 20px rgba(180,200,220,0.04)',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#556'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a30'}
            >
              <img
                src={`/marilyns/browse/${id}.jpg`}
                alt={`Drone Blonde #${id}`}
                loading="lazy"
                onClick={() => setExpandedId(id)}
                style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block', background: '#1a1a1e', cursor: 'pointer' }}
              />
              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontFamily: DISPLAY, fontSize: '16px', letterSpacing: '1.5px', color: '#c8e0f0', marginBottom: '10px' }}>
                  DRONE BLONDE #{id}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                  {TRAIT_FIELDS.map(f => (
                    <div key={f.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid #1a1a1e' }}>
                      <span style={{ fontFamily: MONO, fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#666' }}>{f.label}</span>
                      <span style={{ fontFamily: MONO, fontSize: '11px', color: '#c8e0f0', textAlign: 'right' }}>{t[f.key] || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* Bottom pagination */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', margin: '24px 0 20px' }}>
        <button onClick={() => { setPage(p => Math.max(0, p - 1)); window.scrollTo(0, 0); }} disabled={page === 0} style={navBtnStyle}>&#9664; Prev</button>
        <span style={{ fontFamily: MONO, fontSize: '11px', color: '#666', letterSpacing: '1px' }}>Page {page + 1} / {totalPages || 1}</span>
        <button onClick={() => { setPage(p => Math.min(totalPages - 1, p + 1)); window.scrollTo(0, 0); }} disabled={page >= totalPages - 1} style={navBtnStyle}>Next &#9654;</button>
      </div>

      {/* Spacer for brand bar */}
      <div style={{ height: '48px' }} />

      {/* Brand bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(14,14,18,0.92)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(200,230,255,0.1)',
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px',
      }}>
        <span style={{ fontFamily: MONO, fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(200,230,255,0.4)' }}>
          The Drone Blondes {'\u00B7'} 120 Unique 1/1 Artworks
        </span>
        <a
          href="https://opensea.io/collection/drone-blondes"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: MONO, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
            padding: '8px 20px', background: '#2081e2', border: '1px solid #2081e2',
            color: '#fff', textDecoration: 'none', transition: 'all 0.3s',
            fontWeight: 'bold', borderRadius: '4px',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#1868b7'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#2081e2'; }}
        >
          View on OpenSea
        </a>
      </div>

      {/* Fullscreen lightbox */}
      {expandedId && (
        <div
          onClick={() => setExpandedId(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.95)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <img
            src={`/marilyns/Drone%20Blonde%20${expandedId}.png`}
            alt={`Drone Blonde #${expandedId}`}
            style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain' }}
          />
          <div style={{ marginTop: '16px', fontFamily: DISPLAY, fontSize: '18px', letterSpacing: '2px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>
            Drone Blonde #{expandedId}
          </div>
          <div style={{ marginTop: '8px', fontFamily: MONO, fontSize: '10px', letterSpacing: '2px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase' }}>
            Click anywhere to close
          </div>
        </div>
      )}
    </div>
  );
}

const navBtnStyle = {
  fontFamily: '"Space Mono", monospace',
  fontSize: '11px',
  letterSpacing: '1px',
  padding: '6px 16px',
  background: '#151518',
  border: '1px solid #333',
  color: '#c8e0f0',
  cursor: 'pointer',
};
