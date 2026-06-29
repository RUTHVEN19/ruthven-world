import { useState, useEffect, Suspense, lazy } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PortfolioProvider } from './portfolio/PortfolioContext';
import { c, serif, mono, SOCIALS } from './portfolio/portfolioStyle';

const PortfolioGallery = lazy(() => import('./portfolio/PortfolioGallery'));

const NAV = [
  { to: '/portfolio', label: 'Home', end: true },
  { to: '/portfolio/worlds', label: 'Worlds' },
  { to: '/portfolio/cinema', label: 'AI Cinema' },
  { to: '/portfolio/works', label: 'Works' },
  { to: '/portfolio/originals', label: 'Originals' },
  { to: '/portfolio/projects', label: 'Projects' },
  { to: '/portfolio/exhibitions', label: 'Exhibitions' },
  { to: '/portfolio/feed', label: 'Feed' },
  { to: '/portfolio/about', label: 'About' },
];

// The artist site. A quiet museum catalogue with one switch: flip the whole
// thing into a walkable white-cube gallery of the same works (a room per
// collection).
export default function PortfolioSite() {
  const [gallery, setGallery] = useState(() => localStorage.getItem('portfolio-gallery') === '1');
  const { pathname } = useLocation();

  // Home, the AI Cinema reel and the Worlds page are dark, cinematic, full-bleed
  // (films/covers behind white lettering); every other view stays on quiet paper.
  const isCinema = pathname === '/portfolio/cinema' && !gallery;
  const isWorlds = pathname === '/portfolio/worlds' && !gallery;
  const isHome = pathname === '/portfolio' && !gallery;
  const isDark = isHome || isCinema || isWorlds;
  const fullBleed = isCinema || isWorlds;
  const pageBg = isDark ? '#05060a' : c.paper;
  const headerBg = isDark ? 'rgba(5,6,10,0.72)' : 'rgba(255,255,255,0.92)';
  const headerInk = isDark ? '#ffffff' : c.ink;
  const headerFaint = isDark ? 'rgba(255,255,255,0.6)' : c.faint;
  const headerLine = isDark ? 'rgba(255,255,255,0.16)' : c.line;

  useEffect(() => { localStorage.setItem('portfolio-gallery', gallery ? '1' : '0'); }, [gallery]);
  // Leaving the gallery when navigating museum links.
  useEffect(() => { if (!gallery) document.body.style.overflow = ''; }, [gallery, pathname]);

  return (
    <PortfolioProvider>
      <Helmet>
        <title>Miss AL Simpson — Works</title>
        <meta name="description" content="The catalogue of Miss AL Simpson — cryptoartist. 1/1 works by year and the worlds she has built, 2019–present." />
        <style>{`html,body{margin:0;background:${pageBg};}`}</style>
      </Helmet>

      <div style={{ minHeight: '100vh', background: pageBg, color: headerInk, fontFamily: serif }}>
        {/* ── Header ── */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 50, background: headerBg,
          backdropFilter: 'blur(8px)', borderBottom: `1px solid ${headerLine}`,
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          padding: '18px clamp(20px,5vw,56px)', gap: 24, flexWrap: 'wrap',
        }}>
          <NavLink to="/portfolio" end style={{ textDecoration: 'none', color: headerInk }}>
            <span style={{ fontFamily: serif, fontSize: 22, letterSpacing: 1, textTransform: 'uppercase' }}>Miss AL Simpson</span>
          </NavLink>

          <nav style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            {NAV.map(n => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                onClick={() => setGallery(false)}
                style={({ isActive }) => ({
                  fontFamily: mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
                  textDecoration: 'none', paddingBottom: 3,
                  color: isActive && !gallery ? headerInk : headerFaint,
                  borderBottom: isActive && !gallery ? `1px solid ${headerInk}` : '1px solid transparent',
                })}
              >
                {n.label}
              </NavLink>
            ))}

            {/* ── The toggle ── */}
            <button
              onClick={() => setGallery(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                fontFamily: mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
                background: gallery ? headerInk : 'none', color: gallery ? pageBg : headerInk,
                border: `1px solid ${headerInk}`, padding: '7px 14px', borderRadius: 999,
                transition: 'all .25s',
              }}
              title="Switch between the catalogue and the walkable gallery"
            >
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: gallery ? pageBg : headerInk, display: 'inline-block',
                boxShadow: gallery ? '0 0 8px rgba(255,255,255,0.9)' : 'none',
              }} />
              {gallery ? 'Exit gallery' : 'Enter gallery'}
            </button>
          </nav>
        </header>

        {/* ── Body: museum OR gallery ── */}
        {gallery ? (
          <Suspense fallback={<GalleryFallback />}>
            <PortfolioGallery onExit={() => setGallery(false)} />
          </Suspense>
        ) : fullBleed ? (
          <main><Outlet /></main>
        ) : (
          <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,5vw,56px) 120px' }}>
            <Outlet />
          </main>
        )}

        {/* ── Corporate footer ── */}
        {!gallery && !fullBleed && <Footer />}
      </div>
    </PortfolioProvider>
  );
}

// Corporate footer — the legal / IP base of the site. All works, marks and IP
// are held by Miss AL Simpson Limited. Always black with white writing.
function Footer() {
  const ink = '#ffffff';
  const faint = 'rgba(255,255,255,0.62)';
  const line = 'rgba(255,255,255,0.18)';
  const bg = '#000000';
  const live = SOCIALS.filter(s => s.href);
  const year = new Date().getFullYear();
  return (
    <footer style={{ borderTop: `1px solid ${line}`, background: bg, padding: 'clamp(48px,7vh,80px) clamp(20px,5vw,56px) 40px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 'clamp(32px,5vh,52px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 440 }}>
            <div style={{ fontFamily: serif, fontSize: 22, letterSpacing: 1, textTransform: 'uppercase', color: ink }}>Miss AL Simpson</div>
            <p style={{ fontFamily: serif, fontSize: 14, lineHeight: 1.7, color: faint, marginTop: 14 }}>
              Miss AL Simpson Ltd is the holding company for the artist’s catalogue, intellectual
              property and brands.
            </p>
          </div>
          <nav style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 44px', alignContent: 'start' }}>
            {NAV.map(n => (
              <NavLink key={n.to} to={n.to} end={n.end} style={{
                fontFamily: mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
                textDecoration: 'none', color: faint,
              }}>{n.label}</NavLink>
            ))}
          </nav>
        </div>

        {live.length > 0 && (
          <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap' }}>
            {live.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{
                fontFamily: mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
                textDecoration: 'none', color: ink,
              }}>{s.label}</a>
            ))}
          </div>
        )}

        <div style={{ borderTop: `1px solid ${line}`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: 1, color: faint, lineHeight: 1.9, maxWidth: 880 }}>
            © {year} Miss AL Simpson Limited. All rights reserved. All artworks, trademarks and
            intellectual property are owned and held by Miss AL Simpson Limited.
            Diamond Drones™ · The Drones of Suburbia™.
          </span>
          <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: 1, color: faint }}>Registered in Scotland · No. SC867832</span>
        </div>
      </div>
    </footer>
  );
}

function GalleryFallback() {
  return (
    <div style={{
      height: 'calc(100vh - 72px)', background: '#f3f1ec', color: '#8a857c',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: mono, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase',
    }}>
      Entering the gallery…
    </div>
  );
}
