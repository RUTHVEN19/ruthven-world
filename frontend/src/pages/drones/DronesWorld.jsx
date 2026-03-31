import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import WalletConnect from '../../components/WalletConnect';

const NAV_ITEMS = [
  { path: '/drones', label: 'World', end: true },
  { path: '/drones/diamond-shop', label: 'Diamond Shop' },
  { path: '/drones/cinema', label: 'Cinema' },
  { path: '/drones/gallery', label: 'Gallery' },
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#000000', color: '#ffffff' }}>

      {/* ── Navigation Bar ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          transform: navVisible ? 'translateY(0)' : 'translateY(-100%)',
          backgroundColor: 'rgba(0,0,0,0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/drones" className="flex items-center group">
            <img
              src="/DRONE LOGO.png"
              alt="Drones of Suburbia"
              className="h-7 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
              style={{ filter: 'invert(0)' }}
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
                      ? 'text-white bg-white/10'
                      : 'text-white/30 hover:text-white/60 hover:bg-white/5'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Wallet Connect */}
          <WalletConnect />
        </div>
      </nav>

      {/* ── Page Content ── */}
      <div className="pt-14">
        <Outlet />
      </div>

      {/* ── Footer ── */}
      <footer
        className="relative z-10 px-6 py-12"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 items-start">

            {/* Brand */}
            <div>
              <img
                src="/DRONE LOGO.png"
                alt="Drones of Suburbia"
                className="h-10 object-contain opacity-30 mb-3"
              />
              <p className="text-xs text-white/20">
                &copy; {new Date().getFullYear()} Drones of Suburbia<br />All rights reserved
              </p>
            </div>

            {/* World Nav */}
            <div>
              <div className="text-xs font-mono uppercase tracking-[0.2em] mb-3 text-white/25">
                Zones
              </div>
              <div className="space-y-1.5">
                {NAV_ITEMS.slice(1).map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className="block text-xs font-mono transition-colors hover:text-white text-white/30"
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Contract addresses placeholder */}
            <div>
              <div className="text-xs font-mono uppercase tracking-[0.2em] mb-3 text-white/25">
                Contracts
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Diamond Drones', addr: 'TBA' },
                  { label: 'Cinema Reels', addr: 'TBA' },
                  { label: 'Gallery Stills', addr: 'TBA' },
                ].map(({ label, addr }) => (
                  <div key={label}>
                    <div className="text-[10px] font-mono text-white/20 uppercase tracking-wider">{label}</div>
                    <div className="text-[10px] font-mono text-white/15">{addr}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
            <span className="text-xs font-mono tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.08)' }}>
              DRONES OF SUBURBIA WORLD v0.1
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
