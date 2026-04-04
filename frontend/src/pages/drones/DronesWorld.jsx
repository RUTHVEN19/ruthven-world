import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import WalletConnect from '../../components/WalletConnect';

const NAV_ITEMS = [
  { path: '/drones',         label: 'World',   end: true },
  { path: '/drones/shop',    label: 'Shop' },
  { path: '/drones/cinema',  label: 'Cinema' },
  { path: '/drones/gallery', label: 'Gallery' },
  { path: '/drones/studio',  label: 'Studio' },
];

export default function DronesWorld() {
  const location = useLocation();
  const navigate = useNavigate();
  const [navVisible, setNavVisible] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);
  const isMintPage = location.pathname === '/drones/mint';

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}>

      {/* ── Navigation Bar ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          transform: navVisible ? 'translateY(0)' : 'translateY(-100%)',
          backgroundColor: 'rgba(0,0,0,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <NavLink to="/drones" style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="/Translucent Logo.png"
              alt="Drones of Suburbia"
              style={{ height: '32px', objectFit: 'contain', opacity: 0.7 }}
            />
          </NavLink>

          {/* Zone nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                style={({ isActive }) => ({
                  padding: '6px 12px',
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  borderRadius: '0',
                  transition: 'all 0.3s',
                  color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                  textDecoration: 'none',
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right side: Wallet + Mint CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <WalletConnect compact />
            <button
              onClick={() => navigate('/drones/mint')}
              style={{
                background: isMintPage ? 'rgba(255,255,255,0.15)' : 'transparent',
                border: '1px solid rgba(255,255,255,0.35)',
                color: '#fff',
                padding: '6px 18px',
                fontSize: '10px', letterSpacing: '0.25em',
                textTransform: 'uppercase', fontFamily: 'monospace',
                cursor: 'pointer', transition: 'all 0.3s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = isMintPage ? 'rgba(255,255,255,0.15)' : 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; }}
            >
              ✦ Mint
            </button>
          </div>
        </div>
      </nav>

      {/* ── Page Content ── */}
      <div className="pt-14">
        <Outlet />
      </div>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: 'clamp(48px,7vw,80px) clamp(24px,6vw,80px)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', alignItems: 'start', marginBottom: '48px' }}>

            {/* Brand */}
            <div>
              <img
                src="/Translucent Logo.png"
                alt="Drones of Suburbia"
                style={{ height: '40px', objectFit: 'contain', opacity: 0.2, marginBottom: '16px', display: 'block' }}
              />
              <p style={{
                fontSize: '10px', fontFamily: 'monospace', lineHeight: 1.9,
                color: 'rgba(255,255,255,0.18)',
                letterSpacing: '0.05em',
              }}>
                © {new Date().getFullYear()} Miss AL Simpson<br />
                All rights reserved<br />
                DIAMOND DRONES ARE A GIRL'S BEST FRIEND™
              </p>
            </div>

            {/* Zones */}
            <div>
              <div style={{
                fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.3em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: '16px',
              }}>
                Zones
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {NAV_ITEMS.slice(1).map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    style={{
                      fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.1em',
                      textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
                      textDecoration: 'none', transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
                  >
                    {item.label}
                  </NavLink>
                ))}
                <NavLink
                  to="/drones/mint"
                  style={{
                    fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: 'rgba(200,230,255,0.3)',
                    textDecoration: 'none', transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(200,230,255,0.7)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(200,230,255,0.3)'}
                >
                  ✦ Mint Collector Set
                </NavLink>
              </div>
            </div>

            {/* Edition info */}
            <div>
              <div style={{
                fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.3em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: '16px',
              }}>
                Edition
              </div>
              {[
                ['Supply',   '200 editions'],
                ['Price',    '1 ETH'],
                ['Network',  'Ethereum'],
                ['Contract', 'TBA'],
              ].map(([k, v]) => (
                <div key={k} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <span style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)' }}>{k}</span>
                  <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.03)',
            textAlign: 'center',
            fontSize: '9px', fontFamily: 'monospace',
            letterSpacing: '0.3em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.07)',
          }}>
            The Drones of Suburbia · Diamond Drones Are a Girl's Best Friend™
          </div>
        </div>
      </footer>
    </div>
  );
}
