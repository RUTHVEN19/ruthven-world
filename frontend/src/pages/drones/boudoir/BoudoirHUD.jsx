import { useState, useEffect } from 'react';

const MONO = '"Space Mono", monospace';
const SERIF = 'Georgia, serif';

const VIEW_ORDER = ['entrance', 'leftWall', 'rightWall', 'staircase', 'staircaseTop'];
const VIEW_LABELS = { entrance: 'Entrance', leftWall: 'Left', rightWall: 'Right', staircase: 'Staircase', staircaseTop: 'Top View' };

/**
 * BoudoirHUD — 2D overlay: zone title, navigation hints, artwork info, viewpoint buttons
 * Light text on dark noir gallery background
 */
export default function BoudoirHUD({ focusedMarilyn, onNavigate, onUnfocus, onBrowseAll }) {
  const [showHints, setShowHints] = useState(true);
  const [currentView, setCurrentView] = useState(0);

  const stepView = (dir) => {
    const next = (currentView + dir + VIEW_ORDER.length) % VIEW_ORDER.length;
    setCurrentView(next);
    onNavigate?.(VIEW_ORDER[next]);
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowHints(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 5,
    }}>
      {/* ── Zone title — top left ── */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '24px',
        pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: MONO,
          fontSize: '10px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.35)',
          marginBottom: '4px',
        }}>
          ♛ The Drone Blondes ♛
        </div>
        <div style={{
          fontFamily: '"Anton", sans-serif',
          fontSize: '18px',
          color: 'rgba(255,255,255,0.75)',
          letterSpacing: '2px',
          textTransform: 'uppercase',
        }}>
          The Drone Blondes
        </div>
      </div>

      {/* ── Browse All button — top right ── */}
      {onBrowseAll && (
        <div style={{ position: 'absolute', top: '20px', right: '24px' }}>
          <button
            onClick={onBrowseAll}
            style={{
              pointerEvents: 'auto',
              fontFamily: MONO,
              fontSize: '9px',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              padding: '6px 12px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              transition: 'all 0.3s',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
          >
            Browse All 120
          </button>
        </div>
      )}

      {/* ── Navigation hints — bottom center (fade out) ── */}
      <div style={{
        position: 'absolute',
        bottom: '58px',
        left: '50%',
        transform: 'translateX(-50%)',
        opacity: showHints ? 0.6 : 0,
        transition: 'opacity 1.5s ease',
        pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: MONO,
          fontSize: '11px',
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: '1px',
          textAlign: 'center',
        }}>
          Drag to orbit · Scroll to zoom · Click artwork to inspect
        </div>
      </div>

      {/* ── View on OpenSea — bottom left ── */}
      {!focusedMarilyn && (
        <div style={{
          position: 'absolute',
          bottom: '50px',
          left: '24px',
          pointerEvents: 'auto',
        }}>
          <a
            href="https://opensea.io/collection/drone-blondes"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: MONO, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
              padding: '8px 20px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.5)',
              color: '#fff', textDecoration: 'none', transition: 'all 0.3s',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
          >
            View on OpenSea
          </a>
        </div>
      )}

      {/* ── Viewpoint navigation — bottom right ── */}
      <div style={{
        position: 'absolute',
        bottom: '50px',
        right: '24px',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        pointerEvents: 'auto',
      }}>
        <button
          onClick={() => stepView(-1)}
          style={{
            fontFamily: MONO,
            fontSize: '9px',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            padding: '6px 12px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(8px)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
        >
          ◂ Prev
        </button>
        <div style={{
          fontFamily: MONO,
          fontSize: '9px',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)',
          padding: '6px 8px',
          minWidth: '80px',
          textAlign: 'center',
          pointerEvents: 'none',
        }}>
          {VIEW_LABELS[VIEW_ORDER[currentView]]}
        </div>
        <button
          onClick={() => stepView(1)}
          style={{
            fontFamily: MONO,
            fontSize: '9px',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            padding: '6px 12px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(8px)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
        >
          Next ▸
        </button>
      </div>

      {/* ── Focused artwork info panel — bottom left ── */}
      {focusedMarilyn && (
        <div style={{
          position: 'absolute',
          bottom: '50px',
          left: '24px',
          pointerEvents: 'auto',
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '20px 24px',
          maxWidth: '300px',
          animation: 'boudoirFadeUp 0.4s ease forwards',
        }}>
          <style>{`
            @keyframes boudoirFadeUp {
              from { opacity: 0; transform: translateY(12px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <div style={{
            fontFamily: MONO,
            fontSize: '9px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
            marginBottom: '8px',
          }}>
            ♛ AI Ink Intervention ♛
          </div>

          <div style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: '20px',
            color: '#fff',
            letterSpacing: '1px',
            marginBottom: '4px',
          }}>
            {focusedMarilyn.title}
          </div>

          <div style={{
            fontFamily: SERIF,
            fontSize: '13px',
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.45)',
            marginBottom: '16px',
          }}>
            Unique 1/1 · Hand-drawn bespoke tattoos
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onUnfocus}
              style={{
                fontFamily: MONO,
                fontSize: '9px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                padding: '6px 14px',
                background: 'none',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => {
                e.target.style.borderColor = 'rgba(255,255,255,0.4)';
                e.target.style.color = 'rgba(255,255,255,0.8)';
              }}
              onMouseLeave={e => {
                e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                e.target.style.color = 'rgba(255,255,255,0.5)';
              }}
            >
              ← Back
            </button>
            {onBrowseAll && (
              <button
                onClick={onBrowseAll}
                style={{
                  fontFamily: MONO,
                  fontSize: '9px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  padding: '6px 14px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.target.style.background = 'rgba(255,255,255,0.15)';
                  e.target.style.color = '#fff';
                }}
                onMouseLeave={e => {
                  e.target.style.background = 'rgba(255,255,255,0.08)';
                  e.target.style.color = 'rgba(255,255,255,0.7)';
                }}
              >
                Browse All 120 →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
