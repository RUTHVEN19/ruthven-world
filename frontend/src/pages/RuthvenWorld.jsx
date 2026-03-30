import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/ruthven', label: 'World', end: true },
  { path: '/ruthven/first-light', label: 'First Light' },
  { path: '/ruthven/studio', label: 'Studio' },
  { path: '/ruthven/artist', label: 'The Artist' },
  { path: '/ruthven/signal', label: 'Signal' },
];

export default function RuthvenWorld() {
  const location = useLocation();
  const [navVisible, setNavVisible] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);

  // Hide nav on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setNavVisible(current < 100 || current < lastScroll);
      setLastScroll(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScroll]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#002A1A', color: '#ffffff' }}>
      {/* ── World Navigation Bar ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          transform: navVisible ? 'translateY(0)' : 'translateY(-100%)',
          backgroundColor: 'rgba(0,30,18,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,232,150,0.08)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo / Brand */}
          <NavLink to="/ruthven" className="flex items-center gap-3 group">
            <img
              src="/RUTHVEN LOGO.png"
              alt="Ruthven"
              className="h-7 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
            />
          </NavLink>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `px-3 py-1.5 text-xs font-mono uppercase tracking-[0.15em] rounded transition-all duration-300 ${
                    isActive
                      ? 'text-white bg-[rgba(0,232,150,0.12)]'
                      : 'text-[rgba(255,255,255,0.3)] hover:text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.03)]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Connect Wallet */}
          <button
            className="text-xs font-mono uppercase tracking-wider px-4 py-1.5 rounded transition-all duration-300"
            style={{
              border: '1px solid rgba(0,232,150,0.25)',
              color: 'rgba(0,232,150,0.7)',
            }}
            onMouseEnter={e => {
              e.target.style.borderColor = 'rgba(0,232,150,0.5)';
              e.target.style.color = '#00E896';
              e.target.style.backgroundColor = 'rgba(0,232,150,0.05)';
            }}
            onMouseLeave={e => {
              e.target.style.borderColor = 'rgba(0,232,150,0.25)';
              e.target.style.color = 'rgba(0,232,150,0.7)';
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            Connect
          </button>
        </div>
      </nav>

      {/* ── Page Content ── */}
      <div className="pt-14">
        <Outlet />
      </div>

      {/* ── World Footer ── */}
      <footer
        className="relative z-10 px-6 py-12"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {/* Brand */}
            <div>
              <img
                src="/RUTHVEN LOGO.png"
                alt="Ruthven"
                className="h-8 object-contain opacity-40 mb-3"
              />
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                &copy; {new Date().getFullYear()} Ruthven
                <br />All rights reserved
              </p>
            </div>

            {/* World Nav */}
            <div>
              <div className="text-xs font-mono uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(0,232,150,0.3)' }}>
                The World
              </div>
              <div className="space-y-1.5">
                {NAV_ITEMS.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className="block text-xs transition-colors hover:text-white"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <div className="text-xs font-mono uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(0,232,150,0.3)' }}>
                Connect
              </div>
              <div className="space-y-1.5">
                <a href="https://x.com/ruthven_nfts" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs transition-colors hover:text-white"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  @ruthven_nfts
                </a>
                <a href="https://opensea.io/collection/reflections-i-dont-recognise" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs transition-colors hover:text-white"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                  OpenSea
                </a>
                <a href="https://sepolia.etherscan.io" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs transition-colors hover:text-white"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                  Etherscan
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
            <span className="text-xs font-mono" style={{ color: 'rgba(0,232,150,0.1)', letterSpacing: '0.3em' }}>
              RUTHVEN WORLD v0.1
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
