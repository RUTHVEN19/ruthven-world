import { Link } from 'react-router-dom';
import { MACHINE_DEPLETED } from '../config/androidsContent';

/**
 * Wraps a zone that is locked until the Manga Machine completes all phases.
 * Shows a manga speech bubble explaining the zone is sealed.
 * When MACHINE_DEPLETED is true, renders children normally.
 */
export default function RestrictedZone({ children, zoneName = 'ZONE', zoneNameJp = '区域', locked = false }) {
  if (!locked && MACHINE_DEPLETED) return children;

  return (
    <div style={{
      minHeight: 'calc(100vh - 52px)',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Manga speed lines background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 8deg, rgba(255,45,120,0.03) 8deg, rgba(255,45,120,0.03) 10deg)
        `,
        pointerEvents: 'none',
      }} />

      {/* Manga halftone dots */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle, rgba(255,45,120,0.06) 1px, transparent 1px)',
        backgroundSize: '16px 16px',
        pointerEvents: 'none',
      }} />

      {/* Speech bubble */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '420px',
        width: '90%',
      }}>
        {/* Bubble body */}
        <div style={{
          background: '#fff',
          borderRadius: '40px',
          border: '4px solid #000',
          padding: 'clamp(28px, 4vw, 44px) clamp(24px, 3vw, 36px)',
          textAlign: 'center',
          position: 'relative',
          boxShadow: '6px 6px 0 #000, 0 0 60px rgba(255,45,120,0.15)',
        }}>
          {/* Zone name */}
          <div style={{
            fontSize: 'clamp(28px, 5vw, 40px)',
            fontFamily: "'Impact', 'Arial Black', sans-serif",
            color: '#000',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}>
            {zoneName}
          </div>
          <div style={{
            fontSize: '14px',
            fontFamily: 'serif',
            color: 'rgba(0,0,0,0.3)',
            marginTop: '4px',
          }}>
            {zoneNameJp}
          </div>

          {/* Divider — manga style */}
          <div style={{
            width: '60px', height: '3px',
            background: '#ff2d78',
            margin: '16px auto',
            borderRadius: '2px',
          }} />

          {/* Message */}
          <div style={{
            fontSize: 'clamp(13px, 2vw, 15px)',
            fontFamily: "'Space Mono', monospace",
            lineHeight: 1.8,
            color: '#1a1a1a',
            letterSpacing: '0.02em',
          }}>
            This zone will open once the<br />
            <span style={{ fontWeight: 700, color: '#ff2d78' }}>Manga Machine</span> stops printing<br />
            and the ink dries up.
          </div>

          {/* SFX text */}
          <div style={{
            position: 'absolute',
            top: '-18px', right: '20px',
            fontSize: '28px',
            fontFamily: "'Impact', 'Arial Black', sans-serif",
            fontStyle: 'italic',
            color: '#ff2d78',
            transform: 'rotate(8deg)',
            textShadow: '2px 2px 0 #000',
            letterSpacing: '0.05em',
          }}>
            SEALED!
          </div>

          {/* CTA */}
          <Link
            to="/androids/manga-machine"
            style={{
              display: 'inline-block',
              marginTop: '20px',
              padding: '10px 28px',
              background: '#000',
              color: '#fff',
              fontFamily: "'Impact', 'Arial Black', sans-serif",
              fontSize: '14px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderRadius: '30px',
              border: '3px solid #000',
              boxShadow: '3px 3px 0 rgba(255,45,120,0.5)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#ff2d78';
              e.currentTarget.style.boxShadow = '3px 3px 0 #000';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#000';
              e.currentTarget.style.boxShadow = '3px 3px 0 rgba(255,45,120,0.5)';
            }}
          >
            GO TO THE MACHINE
          </Link>
        </div>

        {/* Speech bubble tail */}
        <div style={{
          position: 'relative',
          width: '40px',
          height: '30px',
          marginLeft: '60px',
        }}>
          <div style={{
            position: 'absolute',
            top: '-4px', left: 0,
            width: 0, height: 0,
            borderLeft: '22px solid transparent',
            borderRight: '22px solid transparent',
            borderTop: '34px solid #000',
          }} />
          <div style={{
            position: 'absolute',
            top: '-8px', left: '4px',
            width: 0, height: 0,
            borderLeft: '18px solid transparent',
            borderRight: '18px solid transparent',
            borderTop: '30px solid #fff',
          }} />
        </div>
      </div>
    </div>
  );
}
