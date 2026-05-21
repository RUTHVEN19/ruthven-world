import { useState, useEffect, useCallback } from 'react';
import { FILMS, CAMERA_PRESETS } from './cinemaLayout';

const MONO = '"Space Mono", monospace';

/**
 * CinemaHUD — 2D overlay: film selector, transport controls, seat position buttons
 */
export default function CinemaHUD({ activeFilmIndex, onSelectFilm, onNavigate, onToggleMute, isMuted, onFullscreen }) {
  const [showHints, setShowHints] = useState(true);
  const [filmPanelOpen, setFilmPanelOpen] = useState(true); // open by default

  const activeFilm = FILMS[activeFilmIndex] || null;

  // Fade out hints after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowHints(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 5,
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerSlow {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

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
          color: 'rgba(200,230,255,0.4)',
          marginBottom: '4px',
        }}>
          ◆ Drone Cinema ◆
        </div>
        <div style={{
          fontFamily: '"Anton", sans-serif',
          fontSize: '18px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          background: 'linear-gradient(110deg, #b0c8d4 0%, #ffffff 30%, #a8c0cc 55%, #ffffff 80%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'shimmerSlow 6s linear infinite',
        }}>
          The Premiere
        </div>
      </div>

      {/* ── Now Showing — top center ── */}
      {activeFilm && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: MONO,
            fontSize: '9px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'rgba(200,230,255,0.5)',
          }}>
            ▶ Now Showing
          </div>
          <div style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.8)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginTop: '4px',
          }}>
            {activeFilm.track} — {activeFilm.title}
          </div>
        </div>
      )}

      {/* ── Film selector toggle — top right ── */}
      <button
        onClick={() => setFilmPanelOpen(!filmPanelOpen)}
        style={{
          position: 'absolute',
          top: '20px',
          right: '24px',
          pointerEvents: 'auto',
          fontFamily: MONO,
          fontSize: '11px',
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          padding: '10px 22px',
          background: filmPanelOpen ? 'rgba(200,230,255,0.12)' : 'rgba(200,230,255,0.06)',
          border: `1px solid ${filmPanelOpen ? 'rgba(200,230,255,0.4)' : 'rgba(200,230,255,0.25)'}`,
          color: filmPanelOpen ? 'rgba(200,230,255,0.9)' : 'rgba(200,230,255,0.7)',
          cursor: 'pointer',
          transition: 'all 0.3s',
          backdropFilter: 'blur(8px)',
          fontWeight: 700,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(200,230,255,0.15)';
          e.currentTarget.style.color = '#fff';
          e.currentTarget.style.borderColor = 'rgba(200,230,255,0.5)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = filmPanelOpen ? 'rgba(200,230,255,0.12)' : 'rgba(200,230,255,0.06)';
          e.currentTarget.style.color = filmPanelOpen ? 'rgba(200,230,255,0.9)' : 'rgba(200,230,255,0.7)';
          e.currentTarget.style.borderColor = filmPanelOpen ? 'rgba(200,230,255,0.4)' : 'rgba(200,230,255,0.25)';
        }}
      >
        {filmPanelOpen ? '✕ Close' : '◆ Films'}
      </button>

      {/* ── Film selector panel — right side ── */}
      {filmPanelOpen && (
        <div style={{
          position: 'absolute',
          top: '60px',
          right: '24px',
          width: '280px',
          maxHeight: 'calc(100vh - 160px)',
          overflowY: 'auto',
          background: 'rgba(10,10,14,0.92)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
          pointerEvents: 'auto',
          animation: 'fadeUp 0.3s ease forwards',
        }}>
          <div style={{
            padding: '16px 20px 8px',
            fontFamily: MONO,
            fontSize: '9px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'rgba(200,230,255,0.4)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            4 Films
          </div>

          {FILMS.map((film, i) => {
            const isActive = i === activeFilmIndex;
            const available = !!film.file;

            return (
              <button
                key={i}
                onClick={() => available && onSelectFilm?.(i)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '12px 20px',
                  background: isActive ? 'rgba(200,230,255,0.06)' : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  cursor: available ? 'pointer' : 'default',
                  opacity: available ? 1 : 0.35,
                  textAlign: 'left',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => {
                  if (available) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = isActive ? 'rgba(200,230,255,0.06)' : 'transparent';
                }}
              >
                <span style={{
                  fontFamily: MONO,
                  fontSize: '10px',
                  letterSpacing: '1px',
                  color: isActive ? 'rgba(200,230,255,0.7)' : 'rgba(255,255,255,0.25)',
                  minWidth: '20px',
                }}>
                  {film.track}
                </span>
                <span style={{
                  fontFamily: '"Anton", sans-serif',
                  fontSize: '12px',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  color: isActive ? 'rgba(200,230,255,0.9)' : (available ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.3)'),
                  flex: 1,
                }}>
                  {film.title}
                </span>
                {isActive && (
                  <span style={{
                    fontFamily: MONO,
                    fontSize: '8px',
                    color: 'rgba(200,230,255,0.5)',
                    letterSpacing: '1px',
                  }}>
                    ▶
                  </span>
                )}
                {!available && (
                  <span style={{
                    fontFamily: MONO,
                    fontSize: '7px',
                    color: 'rgba(255,255,255,0.2)',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  }}>
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Navigation hints — bottom center (fade out) ── */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
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
          Drag to look around · Pinch to zoom · Scroll to move · Select a film
        </div>
      </div>

      {/* ── Transport controls — bottom center ── */}
      <div style={{
        position: 'absolute',
        bottom: '60px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        pointerEvents: 'auto',
      }}>
        {/* Mute / Unmute */}
        <button
          onClick={onToggleMute}
          style={{
            fontFamily: MONO,
            fontSize: '10px',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            padding: '8px 18px',
            background: isMuted ? 'rgba(255,255,255,0.06)' : 'rgba(200,230,255,0.12)',
            border: `1px solid ${isMuted ? 'rgba(255,255,255,0.15)' : 'rgba(200,230,255,0.4)'}`,
            color: isMuted ? 'rgba(255,255,255,0.5)' : 'rgba(200,230,255,0.9)',
            cursor: 'pointer',
            transition: 'all 0.3s',
            backdropFilter: 'blur(8px)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(200,230,255,0.15)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = isMuted ? 'rgba(255,255,255,0.06)' : 'rgba(200,230,255,0.12)';
          }}
        >
          {isMuted ? '🔇 Unmute' : '🔊 Mute'}
        </button>

        {/* Fullscreen */}
        {onFullscreen && (
          <button
            onClick={onFullscreen}
            style={{
              fontFamily: MONO,
              fontSize: '10px',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              padding: '8px 18px',
              background: 'rgba(200,230,255,0.06)',
              border: '1px solid rgba(200,230,255,0.25)',
              color: 'rgba(200,230,255,0.7)',
              cursor: 'pointer',
              transition: 'all 0.3s',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(200,230,255,0.15)';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = 'rgba(200,230,255,0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(200,230,255,0.06)';
              e.currentTarget.style.color = 'rgba(200,230,255,0.7)';
              e.currentTarget.style.borderColor = 'rgba(200,230,255,0.25)';
            }}
          >
            ⛶ Full Screen
          </button>
        )}
      </div>

      {/* ── Seat position buttons — bottom left ── */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        left: '24px',
        display: 'flex',
        gap: '8px',
        pointerEvents: 'auto',
      }}>
        {[
          { label: 'Center', key: 'center' },
          { label: 'Left', key: 'left' },
          { label: 'Right', key: 'right' },
          { label: 'Back', key: 'back' },
        ].map(({ label, key }) => (
          <button
            key={key}
            onClick={() => onNavigate?.(key)}
            style={{
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
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
