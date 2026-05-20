import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
// import WalletConnect from '../../components/WalletConnect'; // re-enable when drops go live

const SOCIALS = [
  { label: 'Diamond Drones', platform: 'x', href: 'https://x.com/diamonddronesco' },
  { label: 'Miss AL Simpson', platform: 'x', href: 'https://x.com/missalsimpson' },
  { label: 'Diamond Drones', platform: 'ig', href: 'https://www.instagram.com/diamonddronesco' },
  { label: 'Drones of Suburbia', platform: 'ig', href: 'https://www.instagram.com/thedronesofsuburbia/' },
  { label: 'Miss AL Simpson', platform: 'ig', href: 'https://www.instagram.com/annalouisesimpson/' },
];

const NAV_ITEMS = [
  { path: '/drones',               label: 'World',   end: true },
  { path: '/drones/vault',         label: 'Vault' },
  { path: '/drones/cinema',        label: 'Cinema' },
  { path: '/drones/studio',        label: 'Studio' },
  { path: '/drones/lounge',        label: 'The Lounge' },
  { path: '/drones/lore',          label: 'Lore' },
];

export default function DronesWorld() {
  const location = useLocation();
  const [navVisible, setNavVisible] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setNavVisible(current < 100 || current < lastScroll);
      setLastScroll(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScroll]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // ── Ambient audio — persists across all zone navigation ──
  const audioRef = useRef(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioStartedRef = useRef(false);

  // Zones where ambient music should play
  const audioZones = ['/drones/vault', '/drones/lounge'];
  const isAudioZone = audioZones.some(z => location.pathname.startsWith(z));

  // Gateway, Cinema and Studio have their own audio — auto-pause ambient music when entering
  const isMuteZone = location.pathname === '/drones'
    || location.pathname.startsWith('/drones/cinema')
    || location.pathname.startsWith('/drones/studio');

  useEffect(() => {
    if (isMuteZone && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setAudioPlaying(false);
    }
    // Resume ambient music when returning to an audio zone from a mute zone
    if (!isMuteZone && isAudioZone && audioStartedRef.current && audioRef.current?.paused) {
      audioRef.current.volume = 0.35;
      audioRef.current.play().then(() => setAudioPlaying(true)).catch(() => {});
    }
  }, [isMuteZone, isAudioZone]);

  // Auto-pause ambient music when any other video/audio starts playing (e.g. Lore films)
  useEffect(() => {
    const handleMediaPlay = (e) => {
      if (e.target === audioRef.current) return; // ignore our own ambient track
      if (e.target.muted) return; // ignore muted background videos
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setAudioPlaying(false);
      }
    };
    document.addEventListener('play', handleMediaPlay, true);
    return () => document.removeEventListener('play', handleMediaPlay, true);
  }, []);

  // Auto-start on first click when in an audio zone
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || audioStartedRef.current) return;
    if (!isAudioZone || isMuteZone) return;

    const startAudio = () => {
      if (audio.paused) {
        audio.volume = 0.35;
        audio.play().then(() => {
          setAudioPlaying(true);
          audioStartedRef.current = true;
        }).catch(() => {});
      }
    };
    window.addEventListener('click', startAudio, { once: true });
    return () => window.removeEventListener('click', startAudio);
  }, [isAudioZone, isMuteZone]);

  const toggleAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audioPlaying) {
      audio.pause();
      setAudioPlaying(false);
    } else {
      audio.volume = 0.35;
      audio.play().then(() => setAudioPlaying(true)).catch(() => {});
    }
  }, [audioPlaying]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#3a3a3a', color: '#ffffff' }}>

      {/* ── Navigation Bar ── */}
      <nav
        className="fixed left-0 right-0 z-50"
        style={{
          top: navVisible ? '0px' : '-52px',
          backgroundColor: 'rgba(0,0,0,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          transition: 'top 0.5s ease',
        }}
      >
        <div className="dd-nav-inner">

          {/* Logo — hidden on mobile to save space */}
          <NavLink to="/drones" className="dd-nav-logo">
            <img
              src="/diamond drones logo.png"
              alt="Diamond Drones™"
              style={{ height: '40px', objectFit: 'contain' }}
            />
          </NavLink>

          {/* Zone nav links — scrollable on mobile */}
          <div className="dd-nav-links">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                style={({ isActive }) => ({
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontFamily: '"Anton", "Impact", sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  borderRadius: '0',
                  transition: 'all 0.3s',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right side: Socials + Wallet — hidden on mobile */}
          <div className="dd-nav-right">
            <a href="https://x.com/diamonddronesco" target="_blank" rel="noopener noreferrer"
              style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s', lineHeight: 1 }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              title="X / Twitter"
            >𝕏</a>
            <a href="https://www.instagram.com/diamonddronesco" target="_blank" rel="noopener noreferrer"
              style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textDecoration: 'none', transition: 'color 0.2s', fontFamily: "'Space Mono', monospace", lineHeight: 1 }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              title="Instagram"
            >IG</a>
            {/* Wallet connect hidden until drops go live */}
          </div>
        </div>
      </nav>

      {/* ── Ambient audio — persists across zone navigation ── */}
      <audio ref={audioRef} loop preload="none">
        <source src="/album/11-Diamond-Drones-Are-a-Girls-Best-Friend.mp3" type="audio/mpeg" />
      </audio>

      {/* ── Audio mute toggle — visible when audio has started ── */}
      {audioStartedRef.current || audioPlaying ? (
        <button
          onClick={toggleAudio}
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 60,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: audioPlaying ? 'rgba(200,230,255,0.7)' : 'rgba(255,255,255,0.35)',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontFamily: "'Space Mono', monospace",
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.borderColor = 'rgba(255,255,255,0.35)'; }}
          onMouseLeave={e => { e.target.style.color = audioPlaying ? 'rgba(200,230,255,0.7)' : 'rgba(255,255,255,0.35)'; e.target.style.borderColor = 'rgba(255,255,255,0.15)'; }}
          title={audioPlaying ? 'Mute' : 'Play music'}
        >
          {audioPlaying ? '\u266B' : '\u2716'}
        </button>
      ) : null}

      {/* ── Page Content ── */}
      <div style={{ paddingTop: '52px' }}>
        <Outlet />
      </div>

      {/* ── Footer ── */}
      <footer className="dd-footer" style={{
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid rgba(200,230,255,0.08)',
        padding: 'clamp(60px,10vw,120px) clamp(24px,6vw,80px)',
      }}>
        {/* Film background */}
        <video autoPlay muted loop playsInline style={{
          position: 'absolute', inset: 0, zIndex: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
          opacity: 0.18,
          filter: 'contrast(1.1) saturate(0.3)',
        }}>
          <source src="/films/dd-jewellery-box.mp4" type="video/mp4" />
        </video>
        {/* Dark gradient overlay on top of film */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'linear-gradient(to bottom, rgba(6,8,16,0.7) 0%, rgba(6,8,16,0.35) 40%, rgba(6,8,16,0.35) 60%, rgba(6,8,16,0.75) 100%)',
        }} />
        {/* Animated shimmer overlay */}
        <div className="dd-footer-bg" style={{
          position: 'absolute', inset: 0, zIndex: 0,
          opacity: 0.04,
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>

          {/* Big brand statement */}
          <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 80px)' }}>
            <img
              src="/diamond drones logo.png"
              alt="Diamond Drones"
              style={{ height: 'clamp(48px, 6vw, 72px)', objectFit: 'contain', opacity: 0.3, marginBottom: '24px', display: 'inline-block' }}
            />
            <div className="dd-footer-sparkle" style={{
              fontSize: 'clamp(28px, 5vw, 52px)',
              fontFamily: '"Anton", "Impact", sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              lineHeight: 1.1,
            }}>
              Diamond Drones™<br />Are a Girl's Best Friend
            </div>
          </div>

          {/* Three-column grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '48px', alignItems: 'start', marginBottom: '60px' }}>

            {/* Zones */}
            <div>
              <div style={{
                fontSize: '13px', fontFamily: '"Anton", sans-serif', letterSpacing: '0.25em',
                textTransform: 'uppercase', color: '#fff', marginBottom: '20px',
              }}>
                Zones
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {NAV_ITEMS.slice(1).map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    style={{
                      fontSize: '13px', fontFamily: "'Space Mono', monospace", letterSpacing: '0.08em',
                      textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
                      textDecoration: 'none', transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Follow — X */}
            <div>
              <div style={{
                fontSize: '13px', fontFamily: '"Anton", sans-serif', letterSpacing: '0.25em',
                textTransform: 'uppercase', color: '#fff', marginBottom: '20px',
              }}>
                𝕏 / Twitter
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {SOCIALS.filter(s => s.platform === 'x').map(s => (
                  <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="dd-social-pill"
                    style={{
                      fontSize: '12px', fontFamily: "'Space Mono', monospace", letterSpacing: '0.08em',
                      textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
                      textDecoration: 'none', transition: 'all 0.3s',
                      border: '1px solid rgba(255,255,255,0.12)', padding: '10px 18px',
                      display: 'inline-block',
                    }}
                  >
                    {s.label}
                  </a>
                ))}
              </div>

              <div style={{
                fontSize: '13px', fontFamily: '"Anton", sans-serif', letterSpacing: '0.25em',
                textTransform: 'uppercase', color: '#fff', marginTop: '28px', marginBottom: '20px',
              }}>
                Instagram
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {SOCIALS.filter(s => s.platform === 'ig').map(s => (
                  <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="dd-social-pill"
                    style={{
                      fontSize: '12px', fontFamily: "'Space Mono', monospace", letterSpacing: '0.08em',
                      textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
                      textDecoration: 'none', transition: 'all 0.3s',
                      border: '1px solid rgba(255,255,255,0.12)', padding: '10px 18px',
                      display: 'inline-block',
                    }}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Brand / Legal */}
            <div>
              <div style={{
                fontSize: '13px', fontFamily: '"Anton", sans-serif', letterSpacing: '0.25em',
                textTransform: 'uppercase', color: '#fff', marginBottom: '20px',
              }}>
                Brand
              </div>
              <p style={{
                fontSize: '13px', fontFamily: "'Space Mono', monospace", lineHeight: 2,
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '0.03em',
              }}>
                © {new Date().getFullYear()} Miss AL Simpson<br />
                DIAMOND DRONES™ is a registered<br />
                trademark of Miss AL Simpson Limited.
              </p>
              <a
                href="https://www.thedronesofsuburbia.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="dd-social-pill"
                style={{
                  display: 'inline-block', marginTop: '16px',
                  fontSize: '12px', fontFamily: "'Space Mono', monospace", letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
                  textDecoration: 'none', transition: 'all 0.3s',
                  border: '1px solid rgba(255,255,255,0.12)', padding: '10px 18px',
                }}
              >
                thedronesofsuburbia.com
              </a>
            </div>
          </div>

          {/* Bottom divider + tagline */}
          <div style={{
            paddingTop: '32px',
            borderTop: '1px solid rgba(200,230,255,0.06)',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '11px', fontFamily: "'Space Mono', monospace",
              letterSpacing: '0.4em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.25)',
            }}>
              Made Once {'\u00B7'} Kept Forever
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes ddFooterShimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes ddFooterBgShimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .dd-footer {
          background: linear-gradient(170deg, #060810 0%, #0c0e14 30%, #0a0c12 60%, #080a10 100%);
        }
        .dd-footer-bg {
          background: linear-gradient(
            110deg,
            transparent 0%,
            rgba(160,210,230,0.15) 15%,
            rgba(200,230,255,0.25) 25%,
            transparent 40%,
            rgba(180,220,240,0.1) 55%,
            rgba(200,230,255,0.2) 65%,
            transparent 80%,
            rgba(160,210,230,0.12) 90%,
            transparent 100%
          );
          background-size: 400% 400%;
          animation: ddFooterBgShimmer 12s ease infinite;
        }
        .dd-footer-sparkle {
          background: linear-gradient(
            90deg,
            #b0c8d4 0%,
            #ddeef4 15%,
            #ffffff 28%,
            #a8c0cc 40%,
            #d8ecf4 52%,
            #ffffff 62%,
            #b4ccd8 75%,
            #e0f0f6 88%,
            #ffffff 100%
          );
          background-size: 300% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: ddFooterShimmer 5s linear infinite;
        }
        .dd-social-pill:hover {
          color: #fff !important;
          border-color: rgba(200,230,255,0.5) !important;
          background: rgba(200,230,255,0.08);
          box-shadow: 0 0 16px rgba(200,230,255,0.1), inset 0 0 12px rgba(200,230,255,0.04);
        }

        /* ── Navbar layout ── */
        .dd-nav-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .dd-nav-logo {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .dd-nav-links {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .dd-nav-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        /* ── Mobile nav ── */
        @media (max-width: 768px) {
          .dd-nav-inner {
            padding: 0 8px;
            gap: 0;
          }
          .dd-nav-logo {
            display: none;
          }
          .dd-nav-links {
            flex: 1;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            -ms-overflow-style: none;
            mask-image: linear-gradient(to right, transparent, black 8px, black calc(100% - 8px), transparent);
            -webkit-mask-image: linear-gradient(to right, transparent, black 8px, black calc(100% - 8px), transparent);
          }
          .dd-nav-links::-webkit-scrollbar {
            display: none;
          }
          .dd-nav-right {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
