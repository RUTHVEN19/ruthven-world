import { useState, useEffect, useMemo, useCallback } from 'react';


const MONO = '"Space Mono", monospace';
const DISPLAY = '"Anton", sans-serif';
const PER_PAGE = 20;

const TRAIT_FIELDS = [
  { key: 'diamond_cut',   label: 'Diamond Cut' },
  { key: 'carat_tier',    label: 'Carat Tier' },
  { key: 'carat_weight',  label: 'Carat Weight' },
  { key: 'clarity',       label: 'Clarity' },
  { key: 'colour_grade',  label: 'Colour Grade' },
  { key: 'setting',       label: 'Setting' },
  { key: 'silhouette',    label: 'Silhouette' },
  { key: 'backdrop',      label: 'Backdrop' },
  { key: 'luminance',     label: 'Luminance' },
  { key: 'pose',          label: 'Pose' },
  { key: 'drone_form',    label: 'Drone Form' },
  { key: 'best_friend',   label: 'Best Friend' },
];

const FILTER_FIELDS = [
  { key: 'diamond_cut',   label: 'Diamond Cut' },
  { key: 'carat_tier',    label: 'Carat Tier' },
  { key: 'carat_weight',  label: 'Carat Weight' },
  { key: 'clarity',       label: 'Clarity' },
  { key: 'colour_grade',  label: 'Colour Grade' },
  { key: 'setting',       label: 'Setting' },
  { key: 'silhouette',    label: 'Silhouette' },
  { key: 'backdrop',      label: 'Backdrop' },
  { key: 'luminance',     label: 'Luminance' },
  { key: 'pose',          label: 'Pose' },
  { key: 'drone_form',    label: 'Drone Form' },
  { key: 'best_friend',   label: 'Best Friend', options: ['Diamond Drone', "A Girl's Best Friend"] },
];

function pad(n) { return String(n).padStart(4, '0'); }

/**
 * VaultBrowser — Browsable 2D grid of all 1000 Diamond Drones with traits and filters.
 * Replaces the standalone trait-viewer.html as an in-site experience.
 */
export default function VaultBrowser({ onSwitch3D }) {
  const [traits, setTraits] = useState(null);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(0);
  const [jumpTo, setJumpTo] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Load traits JSON
  useEffect(() => {
    fetch('/vault/traits.json?v=' + Date.now())
      .then(r => r.json())
      .then(setTraits)
      .catch(() => {});
  }, []);

  // Build filter options from data
  const filterOptions = useMemo(() => {
    if (!traits) return {};
    const opts = {};
    FILTER_FIELDS.forEach(f => {
      if (f.options) { opts[f.key] = f.options; return; }
      const vals = new Set();
      Object.values(traits).forEach(t => { if (t[f.key]) vals.add(t[f.key]); });
      opts[f.key] = [...vals].sort();
    });
    return opts;
  }, [traits]);

  // Filtered IDs
  const filtered = useMemo(() => {
    if (!traits) return [];
    const ids = [];
    for (let i = 1; i <= 1000; i++) {
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
    if (id >= 1 && id <= 1000) {
      const idx = filtered.indexOf(id);
      if (idx >= 0) {
        setPage(Math.floor(idx / PER_PAGE));
        setTimeout(() => {
          document.getElementById('vault-card-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [jumpTo, filtered]);

  if (!traits) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: MONO, color: 'rgba(200,230,255,0.4)', fontSize: '12px', letterSpacing: '3px' }}>
        LOADING VAULT...
      </div>
    );
  }

  return (
    <div style={{ background: '#0a0a0c', minHeight: '100%', padding: '24px', overflowY: 'auto' }}>
      <style>{`
        @keyframes vaultShimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          fontFamily: MONO, fontSize: '10px', letterSpacing: '4px', textTransform: 'uppercase',
          color: 'rgba(200,230,255,0.4)', marginBottom: '6px',
        }}>
          The Genesis Collection
        </div>
        <h1 style={{
          fontFamily: DISPLAY, fontSize: 'clamp(28px, 5vw, 42px)', letterSpacing: '3px',
          textTransform: 'uppercase', margin: 0,
          background: 'linear-gradient(110deg, #b0c8d4 0%, #ffffff 30%, #a8c0cc 55%, #ffffff 80%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          animation: 'vaultShimmer 6s linear infinite',
        }}>
          Diamond Drones™
        </h1>
      </div>

      {/* Switch to 3D button */}
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
            Enter 3D Museum
          </button>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#666', marginBottom: '4px' }}>Jump to #</div>
          <input
            type="number" min="1" max="1000" placeholder="e.g. 50"
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

      {/* Count + pagination */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={navBtnStyle}>
          &#9664; Prev
        </button>
        <span style={{ fontFamily: MONO, fontSize: '11px', color: '#666', letterSpacing: '1px' }}>
          {filtered.length > 0
            ? `${page * PER_PAGE + 1}–${Math.min((page + 1) * PER_PAGE, filtered.length)} of ${filtered.length}`
            : 'No matches'}
        </span>
        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={navBtnStyle}>
          Next &#9654;
        </button>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px',
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        {pageItems.map(id => {
          const t = traits[String(id)];
          return (
            <div key={id} id={`vault-card-${id}`} style={{
              background: '#111114', border: '1px solid #222', overflow: 'hidden', transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#445'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#222'}
            >
              <img
                src={`/vault/browse/${id}.jpg`}
                alt={`Diamond Drone #${id}`}
                loading="lazy"
                onClick={() => setExpandedId(id)}
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block', background: '#1a1a1e', cursor: 'pointer' }}
              />
              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontFamily: DISPLAY, fontSize: '16px', letterSpacing: '1.5px', color: '#c8e0f0', marginBottom: '10px' }}>
                  DIAMOND DRONE #{pad(id)}
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

      {/* Bottom pagination */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', margin: '24px 0 20px' }}>
        <button onClick={() => { setPage(p => Math.max(0, p - 1)); window.scrollTo(0, 0); }} disabled={page === 0} style={navBtnStyle}>
          &#9664; Prev
        </button>
        <span style={{ fontFamily: MONO, fontSize: '11px', color: '#666', letterSpacing: '1px' }}>
          Page {page + 1} / {totalPages || 1}
        </span>
        <button onClick={() => { setPage(p => Math.min(totalPages - 1, p + 1)); window.scrollTo(0, 0); }} disabled={page >= totalPages - 1} style={navBtnStyle}>
          Next &#9654;
        </button>
      </div>

      {/* Spacer for brand bar */}
      <div style={{ height: '48px' }} />

      {/* Brand bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(10,10,12,0.92)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(200,230,255,0.1)',
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px',
      }}>
        <span style={{ fontFamily: MONO, fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(200,230,255,0.4)' }}>
          Diamond Drones{'\u2122'} {'\u00B7'} 1000 Unique Digital Diamonds
        </span>
        <a
          href="https://opensea.io/collection/diamond-drones"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: MONO, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
            padding: '8px 20px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.5)',
            color: '#fff', textDecoration: 'none', transition: 'all 0.3s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
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
            src={`/vault/browse/${expandedId}.jpg`}
            alt={`Diamond Drone #${expandedId}`}
            style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain' }}
          />
          <div style={{ marginTop: '16px', fontFamily: DISPLAY, fontSize: '18px', letterSpacing: '2px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>
            Diamond Drone #{pad(expandedId)}
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
