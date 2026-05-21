import { useState, useEffect, useCallback } from 'react';
const MONO = '"Space Mono", monospace';
const SERIF = 'Georgia, serif';

/**
 * ArtworkLightbox — Fullscreen overlay to view a Diamond Drone artwork in detail.
 * Tries batch 3 (FAL x3 expanded) first, falls back to batch 2.
 */
export default function ArtworkLightbox({ drone, onClose }) {
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  // Load artwork from vault public folder
  useEffect(() => {
    if (!drone) return;
    setLoading(true);
    setFadeIn(false);

    const src = `/vault/${drone.id}.png`;
    const img = new Image();
    img.onload = () => {
      setImgSrc(src);
      setLoading(false);
      requestAnimationFrame(() => setFadeIn(true));
    };
    img.onerror = () => {
      setImgSrc(null);
      setLoading(false);
      requestAnimationFrame(() => setFadeIn(true));
    };
    img.src = src;
  }, [drone]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!drone) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        opacity: fadeIn ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '24px',
          right: '32px',
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '32px',
          cursor: 'pointer',
          fontFamily: MONO,
          lineHeight: 1,
          transition: 'color 0.3s',
          zIndex: 2,
        }}
        onMouseEnter={e => e.target.style.color = '#fff'}
        onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
      >
        ×
      </button>

      {/* Artwork image */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '85vw',
          maxHeight: '85vh',
          cursor: 'default',
        }}
      >
        {loading ? (
          <div style={{
            fontFamily: MONO,
            fontSize: '12px',
            letterSpacing: '3px',
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
          }}>
            Loading...
          </div>
        ) : imgSrc ? (
          <img
            src={imgSrc}
            alt={`Diamond Drone #${drone.id}`}
            style={{
              maxWidth: '85vw',
              maxHeight: '72vh',
              objectFit: 'contain',
              borderRadius: '2px',
              boxShadow: '0 0 80px rgba(0,0,0,0.6)',
            }}
          />
        ) : (
          <div style={{
            width: '400px',
            height: '400px',
            background: '#1a2030',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: MONO,
            fontSize: '11px',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '2px',
          }}>
            IMAGE UNAVAILABLE
          </div>
        )}

        {/* Info bar below image */}
        <div style={{
          marginTop: '20px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: '28px',
            color: '#fff',
            letterSpacing: '2px',
            marginBottom: '4px',
          }}>
            Diamond Drone #{drone.id}
          </div>
          <div style={{
            fontFamily: SERIF,
            fontSize: '15px',
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.4)',
          }}>
            {drone.cut}
          </div>
        </div>
      </div>

      {/* Hint */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: MONO,
        fontSize: '10px',
        letterSpacing: '2px',
        color: 'rgba(255,255,255,0.2)',
        textTransform: 'uppercase',
      }}>
        Click or press Esc to close
      </div>
    </div>
  );
}
