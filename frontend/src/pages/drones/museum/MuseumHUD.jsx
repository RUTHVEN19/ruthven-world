import { useState, useEffect } from 'react';
import { CAMERA_PRESETS } from './museumLayout';

const MONO = '"Space Mono", monospace';
const SERIF = 'Georgia, serif';

const hudBtn = {
  fontFamily: MONO,
  fontSize: '9px',
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  padding: '6px 12px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: 'rgba(255,255,255,0.7)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backdropFilter: 'blur(8px)',
};

/**
 * MuseumHUD — 2D overlay: zone title, navigation hints, artwork info,
 * viewpoint buttons, walk mode toggle
 */
const VIEW_ORDER = ['entrance', 'leftWall', 'rightWall', 'filmScreen'];
const VIEW_LABELS = { entrance: 'Entrance', leftWall: 'Left', rightWall: 'Right', filmScreen: 'End Wall' };

export default function MuseumHUD({
  focusedDrone, onNavigate, onUnfocus, onViewFull,
  walkMode = false, onToggleWalkMode, onBrowseAll,
}) {
  const [showHints, setShowHints] = useState(true);
  const [currentView, setCurrentView] = useState(0);

  const stepView = (dir) => {
    const next = (currentView + dir + VIEW_ORDER.length) % VIEW_ORDER.length;
    setCurrentView(next);
    onNavigate?.(VIEW_ORDER[next]);
  };

  // Fade out nav hints after 6 seconds (reset when mode changes)
  useEffect(() => {
    setShowHints(true);
    const timer = setTimeout(() => setShowHints(false), 3000);
    return () => clearTimeout(timer);
  }, [walkMode]);

  const cut = focusedDrone?.cut || '';

  const hintText = walkMode
    ? 'WASD to walk · Shift to sprint · Mouse to look · Click to lock cursor · ESC to unlock'
    : 'Drag to orbit · Scroll to zoom · Click artwork to inspect';

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 5,
    }}>
      {/* ── Zone title — top left ── */}
      <style>{`
        @keyframes vaultShimmer {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }
      `}</style>
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
          color: 'rgba(200,230,255,0.4)',
          marginBottom: '4px',
        }}>
          ◇ The Vault ◇
        </div>
        <div style={{
          fontFamily: '"Anton", sans-serif',
          fontSize: '28px',
          textTransform: 'uppercase',
          letterSpacing: '3px',
          lineHeight: 1.1,
          background: 'linear-gradient(110deg, #b0c8d4 0%, #ddeef4 12%, #ffffff 22%, #a8c0cc 33%, #d8ecf4 44%, #ffffff 52%, #b4ccd8 62%, #e0f0f6 73%, #ffffff 82%, #a4bcc8 100%)',
          backgroundSize: '300% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'vaultShimmer 5s linear infinite',
        }}>
          Diamond Drones™
        </div>
        <div style={{
          fontFamily: MONO,
          fontSize: '9px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: 'rgba(200,230,255,0.35)',
          marginTop: '6px',
        }}>
          1000 Unique Diamond Drones
        </div>
      </div>

      {/* ── Top right controls ── */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '24px',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
      }}>
        {walkMode && (
          <div style={{
            pointerEvents: 'none',
            fontFamily: MONO,
            fontSize: '9px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'rgba(200,230,255,0.6)',
            background: 'rgba(200,230,255,0.08)',
            border: '1px solid rgba(200,230,255,0.15)',
            padding: '4px 10px',
          }}>
            Walk Mode
          </div>
        )}
        {onBrowseAll && (
          <button
            onClick={onBrowseAll}
            style={{
              ...hudBtn,
              pointerEvents: 'auto',
              background: 'rgba(200,230,255,0.08)',
              borderColor: 'rgba(200,230,255,0.25)',
              color: 'rgba(200,230,255,0.7)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(200,230,255,0.15)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(200,230,255,0.08)';
              e.currentTarget.style.color = 'rgba(200,230,255,0.7)';
            }}
          >
            Browse All 1000
          </button>
        )}
      </div>

      {/* ── Navigation hints — bottom center (fade out) ── */}
      <div style={{
        position: 'absolute',
        bottom: '58px',
        left: '50%',
        transform: 'translateX(-50%)',
        opacity: showHints ? 0.4 : 0,
        transition: 'opacity 1s ease',
        pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: MONO,
          fontSize: '9px',
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: '1px',
          textAlign: 'center',
        }}>
          {hintText}
        </div>
      </div>

      {/* ── Bottom right controls ── */}
      <div style={{
        position: 'absolute',
        bottom: '50px',
        right: '24px',
        display: 'flex',
        gap: '8px',
        pointerEvents: 'auto',
      }}>
        {/* Walk / Orbit mode toggle */}
        <button
          onClick={onToggleWalkMode}
          style={{
            ...hudBtn,
            background: walkMode ? 'rgba(200,230,255,0.15)' : hudBtn.background,
            borderColor: walkMode ? 'rgba(200,230,255,0.35)' : hudBtn.border.split(' ').pop(),
          }}
          onMouseEnter={e => {
            e.target.style.background = 'rgba(255,255,255,0.12)';
            e.target.style.color = '#fff';
          }}
          onMouseLeave={e => {
            e.target.style.background = walkMode ? 'rgba(200,230,255,0.15)' : 'rgba(255,255,255,0.06)';
            e.target.style.color = 'rgba(255,255,255,0.7)';
          }}
        >
          {walkMode ? 'Orbit' : 'Walk'}
        </button>

        {/* Viewpoint navigation — only in orbit mode */}
        {!walkMode && (
          <>
            <button
              onClick={() => stepView(-1)}
              style={hudBtn}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            >
              ◂ Prev
            </button>
            <div style={{
              fontFamily: MONO,
              fontSize: '9px',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: 'rgba(200,230,255,0.5)',
              padding: '6px 8px',
              minWidth: '70px',
              textAlign: 'center',
              pointerEvents: 'none',
            }}>
              {VIEW_LABELS[VIEW_ORDER[currentView]]}
            </div>
            <button
              onClick={() => stepView(1)}
              style={hudBtn}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            >
              Next ▸
            </button>
          </>
        )}
      </div>

      {/* ── Focused artwork info panel — bottom left ── */}
      {focusedDrone && !walkMode && (
        <div style={{
          position: 'absolute',
          bottom: '50px',
          left: '24px',
          pointerEvents: 'auto',
          background: 'rgba(10,10,10,0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '20px 24px',
          maxWidth: '280px',
          animation: 'fadeUp 0.4s ease forwards',
        }}>
          <style>{`
            @keyframes fadeUp {
              from { opacity: 0; transform: translateY(12px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <div style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: '20px',
            color: '#fff',
            letterSpacing: '1px',
            marginBottom: '4px',
          }}>
            Diamond Drone #{focusedDrone.id}
          </div>

          <div style={{
            fontFamily: SERIF,
            fontSize: '13px',
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.45)',
            marginBottom: '16px',
          }}>
            {focusedDrone.cut}
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
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => {
                e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                e.target.style.color = 'rgba(255,255,255,0.7)';
              }}
              onMouseLeave={e => {
                e.target.style.borderColor = 'rgba(255,255,255,0.15)';
                e.target.style.color = 'rgba(255,255,255,0.4)';
              }}
            >
              ← Back
            </button>
            <button
              onClick={() => onViewFull?.(focusedDrone)}
              style={{
                fontFamily: MONO,
                fontSize: '9px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                padding: '6px 14px',
                background: 'rgba(200,230,255,0.8)',
                border: '1px solid rgba(200,230,255,0.8)',
                color: '#0a0a0a',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontWeight: 700,
              }}
              onMouseEnter={e => {
                e.target.style.opacity = '0.85';
              }}
              onMouseLeave={e => {
                e.target.style.opacity = '1';
              }}
            >
              ◇ View Full
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
