/**
 * CinemaLoader — "ENTERING THE CINEMA" loading screen shown while 3D assets load
 */
export default function CinemaLoader() {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#080810',
      zIndex: 10,
    }}>
      <style>{`
        @keyframes cinemaPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes cinemaBar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>

      {/* Kicker */}
      <div style={{
        fontFamily: '"Space Mono", monospace',
        fontSize: '11px',
        letterSpacing: '6px',
        textTransform: 'uppercase',
        color: 'rgba(200,230,255,0.5)',
        marginBottom: '16px',
        animation: 'cinemaPulse 2s ease-in-out infinite',
      }}>
        ◆ Entering the Cinema ◆
      </div>

      {/* Title */}
      <div style={{
        fontFamily: '"Anton", sans-serif',
        fontSize: 'clamp(28px, 5vw, 48px)',
        fontWeight: 400,
        color: '#fff',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        marginBottom: '32px',
      }}>
        Drone Cinema
      </div>

      {/* Loading bar */}
      <div style={{
        width: '200px',
        height: '2px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '1px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, rgba(200,230,255,0.3), rgba(200,230,255,0.8))',
          animation: 'cinemaBar 3s ease-in-out infinite',
        }} />
      </div>

      {/* Subtitle */}
      <div style={{
        fontFamily: 'Georgia, serif',
        fontSize: '13px',
        fontStyle: 'italic',
        color: 'rgba(255,255,255,0.25)',
        marginTop: '24px',
      }}>
        Preparing the screening room...
      </div>
    </div>
  );
}
