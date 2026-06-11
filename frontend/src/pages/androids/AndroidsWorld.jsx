import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { ZONES, SITE_META, ANDROIDS_BASE } from '../../config/androidsContent';

export default function AndroidsWorld() {
  const location = useLocation();
  // Nav always visible — scroll-hide fights the 3D camera walk
  const navVisible = true;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // ── Ambient audio — film soundtrack persists across zones ──
  const audioRef = useRef(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioStartedRef = useRef(false);

  const isMuteZone = location.pathname.endsWith('/nightclub') || location.pathname.includes('/nightclub');

  useEffect(() => {
    if (isMuteZone && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setAudioPlaying(false);
    }
    if (!isMuteZone && audioStartedRef.current && audioRef.current?.paused) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().then(() => setAudioPlaying(true)).catch(() => {});
    }
  }, [isMuteZone]);

  useEffect(() => {
    const handleMediaPlay = (e) => {
      if (e.target === audioRef.current) return;
      if (e.target.muted) return;
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setAudioPlaying(false);
      }
    };
    document.addEventListener('play', handleMediaPlay, true);
    return () => document.removeEventListener('play', handleMediaPlay, true);
  }, []);

  // Audio only starts when user clicks the toggle button — no auto-play

  const toggleAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audioPlaying) {
      audio.pause();
      setAudioPlaying(false);
    } else {
      audio.volume = 0.3;
      audio.play().then(() => { setAudioPlaying(true); audioStartedRef.current = true; }).catch(() => {});
    }
  }, [audioPlaying]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}>

      {/* ── Archive Index — Navigation ── */}
      <nav
        className="fixed left-0 right-0 z-50"
        style={{
          top: navVisible ? '0px' : '-52px',
          backgroundColor: 'rgba(5,5,8,0.94)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,45,120,0.08)',
          transition: 'top 0.5s ease',
        }}
      >
        <div className="pa-nav-inner">
          <div className="pa-nav-logo">
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '10px',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: 'rgba(255,45,120,0.5)',
            }}>
              ARCHIVE //
            </span>
            <span style={{
              fontFamily: '"Anton", "Impact", sans-serif',
              fontSize: '15px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginLeft: '8px',
              background: 'linear-gradient(90deg, #ff2d78, #ff6b9d, #ff2d78)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'paNeonPulse 3s ease infinite',
            }}>
              PORCELAIN ANDROID
            </span>
          </div>

          <div className="pa-nav-links">
            {ZONES.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                style={({ isActive }) => ({
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontFamily: "'Space Mono', monospace",
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  transition: 'all 0.3s',
                  color: isActive ? '#ff2d78' : 'rgba(255,255,255,0.4)',
                  background: isActive ? 'rgba(255,45,120,0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(255,45,120,0.2)' : '1px solid transparent',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="pa-nav-right">
            <a href="https://x.com/PorcelAndroid" target="_blank" rel="noopener noreferrer"
              style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s', lineHeight: 1 }}
              onMouseEnter={e => e.currentTarget.style.color = '#ff2d78'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
              title="Porcelain Androids on X"
            >𝕏</a>
            <a href="https://www.instagram.com/porcelain_android/" target="_blank" rel="noopener noreferrer"
              style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', textDecoration: 'none', transition: 'color 0.2s', fontFamily: "'Space Mono', monospace", lineHeight: 1 }}
              onMouseEnter={e => e.currentTarget.style.color = '#ff2d78'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
              title="Instagram"
            >IG</a>
          </div>
        </div>
      </nav>

      {/* ── Ambient audio ── */}
      <audio ref={audioRef} loop preload="none">
        <source src="/androids/film/the-manga-machine.mp4" type="audio/mp4" />
      </audio>

      {/* ── Audio toggle ── */}
      {(audioStartedRef.current || audioPlaying) && (
        <button
          onClick={toggleAudio}
          style={{
            position: 'fixed', top: '130px', right: '20px', zIndex: 60,
            background: 'rgba(5,5,8,0.7)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,45,120,0.15)',
            color: audioPlaying ? '#ff2d78' : 'rgba(255,255,255,0.35)',
            width: '40px', height: '40px', borderRadius: '50%',
            cursor: 'pointer', fontFamily: "'Space Mono', monospace",
            fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: audioPlaying ? '0 0 12px rgba(255,45,120,0.15)' : 'none',
          }}
          onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.borderColor = 'rgba(255,45,120,0.5)'; }}
          onMouseLeave={e => { e.target.style.color = audioPlaying ? '#ff2d78' : 'rgba(255,255,255,0.35)'; e.target.style.borderColor = 'rgba(255,45,120,0.15)'; }}
          title={audioPlaying ? 'Mute' : 'Play music'}
        >
          {audioPlaying ? '\u266B' : '\u2716'}
        </button>
      )}

      {/* ── Page Content ── */}
      <div style={{ paddingTop: '52px' }}>
        <Outlet />
      </div>

      {/* ── Footer — Archive Terminal ── */}
      <footer style={{
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255,45,120,0.06)',
        padding: 'clamp(60px,10vw,120px) clamp(24px,6vw,80px)',
        background: '#050508',
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 80px)' }}>
            <div style={{
              fontSize: '10px', fontFamily: "'Space Mono', monospace",
              letterSpacing: '0.4em', textTransform: 'uppercase',
              color: 'rgba(255,45,120,0.35)', marginBottom: '16px',
            }}>
              CLASSIFIED ARCHIVE // ROPPONGI DISTRICT
            </div>
            <div className="pa-footer-title" style={{
              fontSize: 'clamp(28px, 5vw, 52px)',
              fontFamily: '"Anton", "Impact", sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              lineHeight: 1.1,
            }}>
              Porcelain Android
            </div>
            <div style={{
              fontSize: 'clamp(12px, 1.5vw, 14px)',
              fontFamily: "'Space Mono', monospace",
              color: 'rgba(255,255,255,0.25)',
              marginTop: '16px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
            }}>
              The Manga Machine
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '48px', alignItems: 'start', marginBottom: '60px' }}>
            <div>
              <div style={{ fontSize: '10px', fontFamily: "'Space Mono', monospace", letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,45,120,0.4)', marginBottom: '20px' }}>
                Archive Index
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {ZONES.map(item => (
                  <NavLink key={item.path} to={item.path}
                    style={{ fontSize: '12px', fontFamily: "'Space Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ff2d78'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10px', fontFamily: "'Space Mono', monospace", letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,45,120,0.4)', marginBottom: '20px' }}>
                Transmissions

              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a href="https://x.com/PorcelAndroid" target="_blank" rel="noopener noreferrer" className="pa-social-pill">Porcelain Androids</a>
                <a href="https://x.com/missalsimpson" target="_blank" rel="noopener noreferrer" className="pa-social-pill">Miss AL Simpson</a>
                <a href="https://www.instagram.com/porcelain_android/" target="_blank" rel="noopener noreferrer" className="pa-social-pill">Instagram</a>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10px', fontFamily: "'Space Mono', monospace", letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,45,120,0.4)', marginBottom: '20px' }}>
                Origin
              </div>
              <p style={{ fontSize: '12px', fontFamily: "'Space Mono', monospace", lineHeight: 2, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.03em' }}>
                {SITE_META.copyright}<br />
                A project by Miss AL Simpson.<br />
                Edinburgh / Roppongi / The Tunnels.
              </p>
            </div>
          </div>

          <div style={{ paddingTop: '32px', borderTop: '1px solid rgba(255,45,120,0.06)', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', fontFamily: "'Space Mono', monospace", letterSpacing: '0.5em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.12)' }}>
              They wear heaven like a dare
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes paNeonPulse {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }
        .pa-footer-title {
          background: linear-gradient(90deg, #ff2d78 0%, #ff6b9d 25%, #ffffff 50%, #00d4ff 75%, #ff2d78 100%);
          background-size: 300% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: paNeonPulse 5s linear infinite;
        }
        .pa-social-pill {
          font-size: 11px;
          font-family: 'Space Mono', monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          text-decoration: none;
          transition: all 0.3s;
          border: 1px solid rgba(255,45,120,0.1);
          padding: 10px 18px;
          display: inline-block;
        }
        .pa-social-pill:hover {
          color: #fff !important;
          border-color: rgba(255,45,120,0.4) !important;
          background: rgba(255,45,120,0.06);
          box-shadow: 0 0 16px rgba(255,45,120,0.1);
        }

        .pa-nav-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .pa-nav-logo {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          text-decoration: none;
        }
        .pa-nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .pa-nav-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .pa-nav-inner { padding: 0 8px; gap: 0; }
          .pa-nav-logo { display: none; }
          .pa-nav-links {
            flex: 1;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            mask-image: linear-gradient(to right, transparent, black 8px, black calc(100% - 8px), transparent);
            -webkit-mask-image: linear-gradient(to right, transparent, black 8px, black calc(100% - 8px), transparent);
          }
          .pa-nav-links::-webkit-scrollbar { display: none; }
          .pa-nav-right { display: none; }
        }
      `}</style>
    </div>
  );
}
